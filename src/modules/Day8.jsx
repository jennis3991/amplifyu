import { useState } from 'react';
import { T } from '../theme.js';
import { NT_STORY_TYPES, ANTHROPIC_KEY } from '../data.js';

export function StoryBuilderWidget({ onSave }) {
  const [phase, setPhase] = useState("type");   // type|questions|style|building|done
  const [storyType, setStoryType] = useState(null);
  const [answers, setAnswers] = useState({});
  const [style, setStyle] = useState("");
  const [story, setStory] = useState(() => { try { return localStorage.getItem("au1_nt_story") || ""; } catch { return ""; } });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const STYLES = [
    { id: "Cinematic", desc: "Vivid scene-setting. Drop the audience into the moment before the context." },
    { id: "Executive", desc: "Lead with stakes. Concise, authoritative, designed for busy senior audiences." },
    { id: "Emotionally Human", desc: "Lead with the person. Make the audience feel before they think." },
    { id: "Provocative", desc: "Open with a counterintuitive claim or a question that creates tension." },
    { id: "Aftermath + Rewind", desc: "Start at the consequence. Then rewind to show how you got there." },
  ];

  const currentType = NT_STORY_TYPES.find(t => t.id === storyType);
  const allAnswered = currentType && currentType.questions.every(q => (answers[q.key] || "").trim());

  async function generateStory(selectedStyle) {
    if (busy || !currentType) return;
    setBusy(true); setErr(null); setSaved(false);
    const qaLines = currentType.questions.map((q, i) =>
      `Q${i+1}: ${q.q}\nA: ${answers[q.key] || "(no answer)"}`
    ).join("\n\n");

    const prompt = [
      "You are a world-class executive communication coach specialising in professional storytelling.",
      "Story type: " + currentType.label,
      "Opening style requested: " + selectedStyle,
      "",
      "Context from the user:",
      qaLines,
      "",
      "Using the 6-beat story arc (Hook, Character, Problem, Turning Point, Resolution, Meaning),",
      "write a compelling professional story in the '" + selectedStyle + "' style.",
      "Format it as 4-6 numbered panels. Each panel should have:",
      "- A panel heading in caps (e.g. 'Panel 1 — THE REALITY')",
      "- A brief scene direction in italics on a new line (e.g. '(Set the scene. Human. Relatable.)')",
      "- The narrative text (2-4 sentences, specific and vivid)",
      "",
      "Total length: 200-280 words. Write in second or third person for pitch/leadership, first person for personal.",
      "Make it specific, human, and credible — never generic or corporate.",
      "Return ONLY a JSON object: { \"story\": \"the full panel-formatted story\", \"tip\": \"one coaching observation about this style, max 18 words\" }",
    ].join("\n");
    try {
      const headers = { "Content-Type": "application/json", "anthropic-version": "2023-06-01" };
      if (ANTHROPIC_KEY) headers["x-api-key"] = ANTHROPIC_KEY;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers,
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 900, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("API error " + res.status);
      const raw = (data.content || []).map(b => b.text || "").join("").trim();
      let parsed = null;
      const m = raw.match(/\{[\s\S]*"story"[\s\S]*\}/);
      if (m) try { parsed = JSON.parse(m[0]); } catch (_) {}
      if (!parsed?.story) throw new Error("Parse failed");
      setStory(parsed.story);
      setPhase("done");
    } catch (e) {
      setErr("The story coach is unavailable right now. Write your story below or add your Anthropic API key to activate AI generation.");
      setPhase("done");
    } finally {
      setBusy(false);
    }
  }

  function saveStory() {
    try { localStorage.setItem("au1_nt_story", story); } catch (_) {}
    setSaved(true);
    if (onSave) onSave(story);
  }

  function restart() {
    setPhase("type"); setStoryType(null); setAnswers({});
    setStyle(""); setStory(""); setErr(null); setSaved(false);
  }

  const LBL = { fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 };
  const INP = { width: "100%", padding: "10px 14px", border: "0.5px solid " + T.border, borderRadius: 4, outline: "none", background: T.surface, fontSize: 13, color: T.text, lineHeight: 1.6, fontFamily: T.sans, fontWeight: 300, boxSizing: "border-box" };

  // ── Phase 1: Story Type Selection ─────────────────────────────────────────
  if (phase === "type") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h3 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: "-0.2px", margin: 0 }}>What are you building?</h3>
      <p style={{ fontFamily: T.sans, fontSize: 13, color: T.text3, fontWeight: 300, margin: 0 }}>Choose your story type — the coaching questions will adapt to fit your context.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {NT_STORY_TYPES.map(t => (
          <button key={t.id} onClick={() => { setStoryType(t.id); setAnswers({}); setPhase("questions"); }}
            style={{
              padding: "14px 16px", borderRadius: 4, border: "0.5px solid " + T.border,
              background: "transparent", cursor: "pointer", textAlign: "left",
              transition: "all 0.18s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.background = "rgba(138,158,132,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 3 }}>{t.label}</div>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.text3, fontWeight: 300 }}>{t.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Phase 2: Context-Specific Questions ───────────────────────────────────
  if (phase === "questions" && currentType) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setPhase("type")} style={{ padding: "4px 10px", borderRadius: 3, border: "0.5px solid " + T.border, background: "transparent", fontSize: 11, color: T.text3, cursor: "pointer", fontFamily: T.sans }}>← Back</button>
        <div style={{ padding: "5px 12px", background: "rgba(138,158,132,0.08)", borderRadius: 3, border: "0.5px solid rgba(138,158,132,0.2)" }}>
          <span style={{ fontFamily: T.sans, fontSize: 11, color: T.goldDark, fontWeight: 500 }}>{currentType.label}</span>
        </div>
      </div>
      {currentType.questions.map((q, i) => (
        <div key={q.key}>
          <p style={{ ...LBL, marginBottom: 6 }}>{i + 1}. {q.q}</p>
          <input value={answers[q.key] || ""} onChange={e => setAnswers(a => ({ ...a, [q.key]: e.target.value }))}
            placeholder={q.ph} style={INP}/>
        </div>
      ))}
      <button onClick={() => setPhase("style")} disabled={!allAnswered}
        style={{ padding: "12px 20px", borderRadius: 4, border: "none", background: allAnswered ? T.ink : T.border, color: T.bg, fontSize: 13, fontWeight: 600, cursor: allAnswered ? "pointer" : "default", fontFamily: T.sans, marginTop: 4 }}>
        Choose Opening Style →
      </button>
    </div>
  );

  // ── Phase 3: Opening Style ────────────────────────────────────────────────
  if (phase === "style") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <button onClick={() => setPhase("questions")} style={{ padding: "4px 10px", borderRadius: 3, border: "0.5px solid " + T.border, background: "transparent", fontSize: 11, color: T.text3, cursor: "pointer", fontFamily: T.sans }}>← Back</button>
        <p style={{ ...LBL, margin: 0 }}>Choose your opening style</p>
      </div>
      {STYLES.map(s => (
        <button key={s.id} onClick={() => { setStyle(s.id); generateStory(s.id); }}
          disabled={busy}
          style={{
            padding: "12px 16px", borderRadius: 4, textAlign: "left",
            border: "0.5px solid " + (style === s.id ? T.gold : T.border),
            background: style === s.id ? "rgba(138,158,132,0.06)" : "transparent",
            cursor: busy ? "default" : "pointer", transition: "all 0.18s ease",
          }}>
          <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 600, color: busy && style === s.id ? T.text3 : T.text, marginBottom: 2 }}>
            {busy && style === s.id ? "Building your story…" : s.id}
          </div>
          {!(busy && style === s.id) && <div style={{ fontFamily: T.sans, fontSize: 11, color: T.text3, fontWeight: 300 }}>{s.desc}</div>}
        </button>
      ))}
    </div>
  );

  // ── Phase 4: Story Output ─────────────────────────────────────────────────
  if (phase === "done") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {err && <div style={{ padding: "10px 14px", background: "rgba(139,74,56,0.06)", borderRadius: 4, border: "0.5px solid rgba(139,74,56,0.15)" }}>
        <p style={{ fontFamily: T.sans, fontSize: 12, color: T.red, margin: 0 }}>{err}</p>
      </div>}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <p style={{ ...LBL, margin: 0 }}>Your Story — {style || "Draft"}</p>
          <span style={{ fontFamily: T.sans, fontSize: 10, color: T.text4 }}>{currentType?.label}</span>
        </div>
        <textarea value={story} onChange={e => { setStory(e.target.value); setSaved(false); }} rows={12}
          placeholder="Write or edit your story here…"
          style={{ ...INP, resize: "vertical", lineHeight: 1.8, fontFamily: T.serif, fontSize: 14, padding: "14px 16px" }}/>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={saveStory} disabled={!story.trim()}
          style={{ flex: 1, padding: "12px 16px", borderRadius: 4, border: "none", background: saved ? "rgba(82,112,96,0.15)" : (story.trim() ? T.ink : T.border), color: saved ? T.green : T.bg, fontSize: 13, fontWeight: 600, cursor: story.trim() ? "pointer" : "default", fontFamily: T.sans, border: saved ? "1px solid rgba(82,112,96,0.3)" : "none", transition: "all 0.2s" }}>
          {saved ? "✓ Saved" : "Save Story"}
        </button>
        <button onClick={() => { setPhase("style"); setStyle(""); setBusy(false); }}
          style={{ padding: "12px 14px", borderRadius: 4, border: "0.5px solid " + T.border, background: "transparent", color: T.text3, fontSize: 12, cursor: "pointer", fontFamily: T.sans }}>
          Regenerate
        </button>
        <button onClick={restart}
          style={{ padding: "12px 14px", borderRadius: 4, border: "0.5px solid " + T.border, background: "transparent", color: T.text3, fontSize: 12, cursor: "pointer", fontFamily: T.sans }}>
          Start Over
        </button>
      </div>
    </div>
  );

  return null;
}


