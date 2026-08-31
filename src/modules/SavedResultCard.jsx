import { SAVED_WORK_SOURCES, SAVED_WORK_KEY } from '../screens/ToolkitScreen.jsx';

// Maps a lesson day (+ whether it's the Narrative Transportation/Day 8 module)
// to the "My Saved Work" source key(s) that day's Rehearsal/Simulation steps
// write to. Days/steps not listed here have no save mechanism, so the Review
// tab shows nothing for them.
export function reviewSavedSources(day, isNT) {
  if (day === 1)  return [{ label: 'Simulation', source: 'voice-analysis-day1' }];
  if (day === 2)  return [{ label: 'Simulation', source: 'voice-analysis-day2' }];
  if (day === 6)  return [{ label: 'Simulation', source: 'conversation-prep-day6' }];
  if (day === 7)  return [{ label: 'Simulation', source: 'week1-review-day7' }];
  if (isNT)       return [{ label: 'Rehearsal', source: 'rehearsal' }, { label: 'Simulation', source: 'speechwriter' }];
  if (day === 11) return [{ label: 'Rehearsal', source: 'brand-rehearsal' }, { label: 'Simulation', source: 'linkedin-audit' }];
  if (day === 14) return [{ label: 'Simulation', source: 'blueprint-day14' }];
  return [];
}

function loadLatestEntry(source) {
  const key = SAVED_WORK_KEY[source];
  if (!key) return null;
  try {
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const mine = list.filter(e => e.source === source).sort((a,b) => (b.timestamp||0) - (a.timestamp||0));
    return mine[0] || null;
  } catch { return null; }
}

function goToMySavedWork(onExitToTab) {
  try { localStorage.setItem('au1_open_toolkit_tab', 'mywork'); } catch {}
  onExitToTab && onExitToTab('toolkit');
}

// One card for one saved source — shows the latest entry, or an honest
// "nothing saved yet" prompt if the user reached Review without saving.
function OneSavedResultCard({ T, T2, isDesktop, cfg, entry, showLabel, label, onExitToTab }) {
  const cardStyle = { background: T2.surface, borderRadius: 8, border: '0.5px solid ' + T2.border, padding: isDesktop ? '20px 22px' : '16px 18px', marginBottom: 10 };
  if (!entry) {
    return (
      <div style={{ ...cardStyle, borderStyle: 'dashed' }}>
        {showLabel && <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T2.text4, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>{label}</div>}
        <p style={{ fontFamily: T.sans, fontSize: 13, color: T2.text3, lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
          No saved result yet for {cfg.dayLabel.split(' · ')[1] || cfg.dayLabel} — complete it and it'll show up here.
        </p>
      </div>
    );
  }
  const title = cfg.getTitle(entry);
  const preview = cfg.getPreview(entry);
  const badge = cfg.getBadge(entry);
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: preview ? 8 : 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {showLabel && <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>{label}</div>}
          <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 17 : 16, fontWeight: 600, color: T2.text, lineHeight: 1.35, margin: 0 }}>{title}</p>
        </div>
        {badge && (
          <div style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 20, background: 'rgba(200,164,106,0.14)', border: '0.5px solid rgba(200,164,106,0.35)' }}>
            <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.gold }}>{badge}</span>
          </div>
        )}
      </div>
      {preview && <p style={{ fontFamily: T.sans, fontSize: 13, color: T2.text3, lineHeight: 1.6, margin: '0 0 12px', fontWeight: 300 }}>{preview.length > 160 ? preview.slice(0,160)+'…' : preview}</p>}
      <button onClick={() => goToMySavedWork(onExitToTab)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: T.sans, fontSize: 12, fontWeight: 600, color: T.gold, display: 'flex', alignItems: 'center', gap: 4 }}>
        View in My Saved Work
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}

// Renders the "Your Saved Result" section for a lesson's Review tab — one
// card per applicable Rehearsal/Simulation source (some days have two, e.g.
// Day 8 and Day 11). Renders nothing at all for days with no save mechanism.
export function SavedResultSection({ T, T2, isDesktop, day, isNT, onExitToTab }) {
  const sources = reviewSavedSources(day, isNT);
  if (!sources.length) return null;
  return (
    <div style={{ marginBottom: isDesktop ? 32 : 24 }}>
      <div style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '2px', color: T.gold, marginBottom: 14 }}>
        {sources.length > 1 ? 'Your Saved Results' : 'Your Saved Result'}
      </div>
      {sources.map(({ label, source }) => {
        const cfg = SAVED_WORK_SOURCES[source];
        if (!cfg) return null;
        const entry = loadLatestEntry(source);
        return (
          <OneSavedResultCard key={source} T={T} T2={T2} isDesktop={isDesktop} cfg={cfg} entry={entry}
            showLabel={sources.length > 1} label={label} onExitToTab={onExitToTab}/>
        );
      })}
    </div>
  );
}
