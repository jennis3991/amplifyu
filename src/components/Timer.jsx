import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';

export function Timer({totalSecs, label}) {
  const [rem, setRem] = useState(totalSecs);
  const [on, setOn] = useState(false);
  const ref = useRef(null);
  useEffect(() => { setRem(totalSecs); setOn(false); 
clearInterval(ref.current); }, [totalSecs]);
  useEffect(() => {
    if (on && rem > 0) {
      ref.current = setInterval(() => setRem(r => { if 
(r<=1){clearInterval(ref.current);setOn(false);return 0;} return r-1; }), 
1000);
    }
    return () => clearInterval(ref.current);
  }, [on]);
  const pct = ((totalSecs - rem) / totalSecs) * 100;
  const mins = Math.floor(rem / 60), secs = rem % 60;
  const done = rem === 0;
  return (
    <div style={{
      background: T.surface, borderRadius: 6,
      border: "1px solid " + T.border,
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(44,39,32,0.05)",
    }}>
      {/* Progress track — hairline at top */}
      <div style={{ height: 2, background: T.divider }}>
        <div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg," + T.goldDark + "," + T.gold + ")", transition: "width 1s linear" }}/>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: T.text3, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: 3, fontFamily: T.sans }}>{label}</div>
            <div style={{ fontFamily: T.serif, fontSize: 9, fontStyle: "italic", color: T.text4 }}>
              {done ? "Time's up." : on ? "Speaking…" : "Ready when you are."}
            </div>
          </div>
          <span style={{
            fontFamily: T.serif, fontSize: 32, fontWeight: 400,
            color: done ? T.gold : T.text, lineHeight: 1,
            letterSpacing: "-1px",
          }}>
            {String(mins).padStart(2,"0")}<span style={{ opacity: 0.4, fontSize: 22 }}>:</span>{String(secs).padStart(2,"0")}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setOn(o => !o)} style={{
            flex: 1, padding: "10px", borderRadius: 4,
            border: "1px solid " + (on ? T.gold : T.border),
            background: on ? "rgba(138,158,132,0.08)" : "transparent",
            color: on ? T.goldDark : T.text, fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: T.sans, transition: "all 0.2s ease",
          }}>
            {on ? "Pause" : rem === totalSecs ? "Start timer" : "Resume"}
          </button>
          <button onClick={() => { setRem(totalSecs); setOn(false); clearInterval(ref.current); }} style={{
            padding: "10px 16px", borderRadius: 4,
            border: "1px solid " + T.border, background: "transparent",
            color: T.text3, fontSize: 13, cursor: "pointer",
            fontFamily: T.sans, transition: "all 0.2s ease",
          }}>Reset</button>
        </div>
      </div>
    </div>
  );
}

// ─── REFLECTION SCREEN 
