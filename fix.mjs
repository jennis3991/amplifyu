import { parse } from "@babel/parser";
import { readFileSync, writeFileSync } from "fs";

const filepath = new URL("./src/App.jsx", import.meta.url).pathname;

let code = readFileSync(filepath, "utf8");
let fixes = 0;
const MAX = 2000;

for (let iter = 0; iter < MAX; iter++) {
  try {
    parse(code, { sourceType: "module", plugins: ["jsx"] });
    console.log(`✓ Parsed cleanly after ${fixes} fix(es).`);
    writeFileSync(filepath, code, "utf8");
    process.exit(0);
  } catch (e) {
    if (!e.loc) {
      console.error("Non-location error:", e.message);
      break;
    }

    const { line } = e.loc;
    const lines = code.split("\n");
    const idx = line - 1;
    const prevCode = code;

    if (idx >= lines.length - 1) {
      console.error(`Error at last line ${line}: ${e.message}`);
      break;
    }

    const msg = e.message;

    if (msg.includes("Unterminated string") || msg.includes("Unterminated regular expression")) {
      // Join this line with the next, stripping leading whitespace on continuation
      lines[idx] = lines[idx] + lines[idx + 1].replace(/^\s+/, "");
      lines.splice(idx + 1, 1);
    } else if (msg.includes("Unexpected token") || msg.includes("expected") || msg.includes("Unexpected")) {
      // Join the offending line onto the previous line
      if (idx > 0) {
        lines[idx - 1] = lines[idx - 1].trimEnd() + " " + lines[idx].trimStart();
        lines.splice(idx, 1);
      } else {
        lines[idx] = lines[idx] + " " + lines[idx + 1].trimStart();
        lines.splice(idx + 1, 1);
      }
    } else if (msg.includes("Missing semicolon") || msg.includes("Identifier directly after number")) {
      // Likely a comment or expression continuation on a bare line
      // If the previous line ends with a comment fragment, join it
      if (idx > 0 && lines[idx - 1].trimStart().startsWith("//")) {
        // Previous line is a comment — join the continuation onto it
        lines[idx - 1] = lines[idx - 1].trimEnd() + " " + lines[idx].trimStart();
        lines.splice(idx, 1);
      } else {
        // Generic: join offending line onto previous
        lines[idx - 1] = lines[idx - 1].trimEnd() + " " + lines[idx].trimStart();
        lines.splice(idx, 1);
      }
    } else {
      const linesArr = code.split("\n");
      console.error(`Unhandled error at line ${line}: ${msg}`);
      for (let k = Math.max(0, line - 2); k <= Math.min(linesArr.length - 1, line + 1); k++) {
        console.error(`  ${k + 1}: ${linesArr[k].slice(0, 120)}`);
      }
      break;
    }

    code = lines.join("\n");
    fixes++;

    // Guard: if code didn't change we're truly stuck
    if (code === prevCode) {
      const linesArr = code.split("\n");
      console.error(`Code didn't change at line ${line}: ${msg}`);
      for (let k = Math.max(0, line - 2); k <= Math.min(linesArr.length - 1, line + 1); k++) {
        console.error(`  ${k + 1}: ${linesArr[k].slice(0, 120)}`);
      }
      break;
    }
  }
}

console.error(`\nStopped after ${fixes} fix attempt(s). Writing current state.`);
writeFileSync(filepath, code, "utf8");
process.exit(1);
