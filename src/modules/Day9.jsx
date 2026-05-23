import { useState } from 'react';
import { T } from '../theme.js';
import { D9_REFINEMENTS, ANTHROPIC_KEY } from '../data.js';

export function DeliveryCoachWidget({ onSave }) {
  const baseStory = (() => { try { return localStorage.getItem("au1_nt_story") || ""; } catch { return ""; } })();
  const [script, setScript] = useState(() => { try { return localStorage.getItem("au1_d9_script") || baseStory; } catch { return baseStory; } });
  const [phase, setPhase] = useState("menu"); // menu|refining|done
  const [activeRef, setActiveRef] = useState(null);
  const [coaching, setCoaching] = useState({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function refine(ref) {
    if (busy || !script.trim()) return;
    setActiveRef(ref.id); setBusy(true);
    const prompt = [
      "You are an executive speaking coach reviewing this professional story for delivery performance.",
      "Story:\n" + script,
      "",
      "Task: " + ref.prompt,
      "Be concise and specific. Return ONLY valid JSON: { \"coaching\": \"your coaching note\", \"revised\": \"revised excerpt or full script\" }",
    ].join("\n");
    try {
      const headers = { "Content-Type": "application/json", "anthropic-version": "2023-06-01" };
      if (ANTHROPIC_KEY) headers["x-api-key"] = ANTHROPIC_KEY;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers,
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, messages: [{ role:"user", content:prompt }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("API error");
      const raw = (data.content||[]).map(b=>b.text||"").join("").trim();
      let parsed = null;
      const m = raw.match(/\{[\s\S]*"coaching"[\s\S]*\}/);
      if (m) try { parsed = JSON.parse(m[0]); } catch(_) {}
      if (parsed?.coaching) {
        setCoaching(c => ({ ...c, [ref.id]: parsed.coaching }));
        if (parsed.revised) setScript(parsed.revised);
      }
    } catch(_) {
      setCoaching(c => ({ ...c, [ref.id]: "Add [PAUSE] after your strongest statements. Slow down on your key insight. Replace any vague time references with specific ones." }));
    } finally {
      setBusy(false);
    }
  }

  function save() {
    try { localStorage.setItem("au1_d9_script", script); } catch(_) {}
    setSaved(true);
    if (onSave) onSave(script);
  }

  const INP = { width:"100%", padding:"12px 16px", border:"0.5px solid "+T.border, borderRadius:4, outline:"none", resize:"vertical", background:T.surface, fontSize:13, color:T.text, lineHeight:1.75, fontFamily:T.serif, fontWeight:300, boxSizing:"border-box" };
  const LBL = { fontFamily:T.sans, fontSize:10, fontWeight:600, color:T.text3, textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:6 };

  if (!script.trim()) return (
    <div style={{ padding:"16px 20px", background:T.surface, borderRadius:4, border:"0.5px solid "+T.border }}>
      <p style={{ fontFamily:T.sans, fontSize:13, color:T.text3, margin:0 }}>No story found from Day 8. Complete the Narrative Transportation module first, then return here to prepare your delivery.</p>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Story textarea */}
      <div>
        <p style={{ ...LBL, marginBottom:6 }}>Your Story — edit as you refine</p>
        <textarea value={script} onChange={e => { setScript(e.target.value); setSaved(false); }} rows={8} style={INP}/>
      </div>

      {/* 5 refinement buttons */}
      <div>
        <p style={{ ...LBL, marginBottom:10 }}>5 Delivery Refinements</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {D9_REFINEMENTS.map(ref => (
            <div key={ref.id}>
              <button onClick={() => refine(ref)} disabled={busy}
                style={{ width:"100%", padding:"11px 16px", borderRadius:4, border:"0.5px solid "+(coaching[ref.id]?T.gold:T.border), background:coaching[ref.id]?"rgba(138,158,132,0.06)":"transparent", cursor:busy?"default":"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left", transition:"all 0.18s" }}>
                <span style={{ fontSize:16 }}>{ref.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:T.serif, fontSize:14, fontWeight:600, color:T.text, marginBottom:2 }}>{ref.title}</div>
                  <div style={{ fontFamily:T.sans, fontSize:11, color:T.text3, fontWeight:300 }}>{busy && activeRef===ref.id ? "Coaching…" : ref.desc}</div>
                </div>
                {coaching[ref.id] && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke={T.green} strokeWidth="1.5" strokeLinecap="round"/></svg>}
              </button>
              {coaching[ref.id] && (
                <div style={{ padding:"10px 14px", background:"rgba(138,158,132,0.05)", borderRadius:"0 0 4px 4px", borderLeft:"2px solid rgba(138,158,132,0.4)", marginTop:1 }}>
                  <p style={{ fontFamily:T.sans, fontSize:12, color:T.text2, lineHeight:1.65, margin:0 }}>{coaching[ref.id]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} style={{ padding:"12px 20px", borderRadius:4, border:"none", background:saved?"rgba(82,112,96,0.15)":T.ink, color:saved?T.green:T.bg, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:T.sans, border:saved?"1px solid rgba(82,112,96,0.3)":"none", transition:"all 0.2s" }}>
        {saved ? "✓ Delivery Script Saved" : "Save Delivery Script"}
      </button>
    </div>
  );
}




