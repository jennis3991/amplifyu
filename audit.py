# Run as: python3 audit.py
import re, os, subprocess

ROOT = 'src'

# ── Step 1: collect all exports from every .js/.jsx file ─────────────────────
file_exports = {}  # path -> set of exported names

for dirpath, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d != 'node_modules']
    for fname in files:
        if not (fname.endswith('.jsx') or fname.endswith('.js')):
            continue
        path = os.path.join(dirpath, fname)
        with open(path) as f:
            src = f.read()
        names = set(re.findall(r'^export (?:default )?(?:const|function|class) (\w+)', src, re.MULTILINE))
        # also pick up  export { Foo, Bar }
        for m in re.finditer(r'^export\s*\{([^}]+)\}', src, re.MULTILINE):
            names.update(n.strip().split(' as ')[-1] for n in m.group(1).split(','))
        file_exports[path] = names

# Build a reverse map: name -> list of files that export it
name_to_files = {}
for path, names in file_exports.items():
    for n in names:
        name_to_files.setdefault(n, []).append(path)

print("=== EXPORT MAP (key exports) ===")
for key in ['T','C','S','SI','NAV_H','DIAGRAMS','MODULE_ICONS','ExCard',
            'SessionLeftPanel','MobileSessionView','useIsDesktop','getStreak',
            'ls','lsSet','LESSONS','ROLES','SESSION_STEPS']:
    files = name_to_files.get(key, ['NOT FOUND'])
    print(f"  {key}: {[os.path.relpath(f) for f in files]}")

# ── Step 2: for each file, find identifiers used but not imported ─────────────

# Known globals that don't need importing
REACT_HOOKS = {'useState','useEffect','useRef','useCallback','useMemo','useContext','useReducer','useLayoutEffect'}
BROWSER_GLOBALS = {'window','document','localStorage','sessionStorage','navigator','console','Math','Date',
                   'JSON','Object','Array','String','Number','Boolean','Error','Promise','fetch',
                   'setTimeout','clearTimeout','setInterval','clearInterval','parseInt','parseFloat',
                   'isNaN','isFinite','encodeURIComponent','decodeURIComponent','URL'}
JSX_GLOBALS = {'React','Fragment'}

def get_imported_names(src):
    """Return set of all names imported into this file."""
    imported = set()
    for m in re.finditer(r"import\s+(?:(\w+)\s*,?\s*)?\{?([^}]*)\}?\s+from", src):
        default_import = m.group(1)
        named = m.group(2)
        if default_import:
            imported.add(default_import.strip())
        if named:
            for n in named.split(','):
                n = n.strip().split(' as ')[-1].strip()
                if n:
                    imported.add(n)
    # Also: import X from '...'  (default, no braces)
    for m in re.finditer(r"import\s+(\w+)\s+from\s+['\"]", src):
        imported.add(m.group(1))
    return imported

issues = {}  # path -> list of (name, likely_source)

for dirpath, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d != 'node_modules']
    for fname in files:
        if not (fname.endswith('.jsx') or fname.endswith('.js')):
            continue
        path = os.path.join(dirpath, fname)
        with open(path) as f:
            src = f.read()

        imported = get_imported_names(src)
        # Locally defined names (functions, consts at module level AND inside functions)
        local = set(re.findall(r'\b(?:const|let|var|function|class)\s+(\w+)', src))
        # Also parameters and destructuring — broad catch
        local.update(re.findall(r'(?:^|\s)(\w+)\s*=', src))

        available = imported | local | REACT_HOOKS | BROWSER_GLOBALS | JSX_GLOBALS
        available.update({'true','false','null','undefined','Infinity','NaN'})
        available.update({'import','export','default','from','as','of','in'})

        file_issues = []

        # Check React hooks used without import
        for hook in REACT_HOOKS:
            if hook in imported:
                continue
            if re.search(r'\b' + hook + r'\s*\(', src):
                file_issues.append((hook, 'react'))

        # Check names from our shared modules
        shared_sources = {
            'T': 'theme.js', 'C': 'theme.js', 'S': 'theme.js', 'SI': 'theme.js',
            'NAV_H': 'components/NavComponents.jsx',
            'DIAGRAMS': 'diagrams.jsx', 'MODULE_ICONS': 'diagrams.jsx',
        }
        # Add all data.js exports
        data_path = os.path.join(ROOT, 'data.js')
        if os.path.exists(data_path):
            with open(data_path) as f:
                data_src = f.read()
            for n in re.findall(r'^export const (\w+)', data_src, re.MULTILINE):
                shared_sources[n] = 'data.js'
        # Add utils.js exports
        utils_path = os.path.join(ROOT, 'utils.js')
        if os.path.exists(utils_path):
            with open(utils_path) as f:
                utils_src = f.read()
            for n in re.findall(r'^export (?:const|function) (\w+)', utils_src, re.MULTILINE):
                shared_sources[n] = 'utils.js'

        # Skip the file that defines the export
        for name, src_file in shared_sources.items():
            if name in imported:
                continue
            if path.endswith(src_file):
                continue
            if re.search(r'\b' + re.escape(name) + r'\b', src):
                file_issues.append((name, src_file))

        # Check cross-file component imports (PascalCase used as JSX)
        jsx_uses = set(re.findall(r'<([A-Z][A-Za-z0-9]+)[\s/>]', src))
        local_components = set(re.findall(r'^(?:export )?(?:const|function) ([A-Z][A-Za-z0-9]+)', src, re.MULTILINE))
        # Also inner components (const X = () => defined anywhere in file)
        inner_components = set(re.findall(r'\bconst ([A-Z][A-Za-z0-9]+)\s*=\s*(?:\([^)]*\)\s*=>|function)', src))
        for comp in jsx_uses:
            if comp in imported or comp in local_components or comp in inner_components:
                continue
            if comp in ('React', 'Fragment'):
                continue
            # Check if it's exported somewhere
            sources = name_to_files.get(comp, [])
            if sources:
                file_issues.append((comp, os.path.relpath(sources[0])))

        if file_issues:
            issues[path] = list(set(file_issues))

print("\n=== MISSING IMPORTS ===")
for path in sorted(issues):
    print(f"\n{os.path.relpath(path)}:")
    for name, source in sorted(issues[path]):
        print(f"  {name}  ← {source}")
