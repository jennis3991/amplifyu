// ─── "Your journey doesn't end here" — Day 14 Review ─────────────────────────
// Points graduates to the Toolkit. The two AI tools open the tool itself (the
// same day/step the Toolkit launches); the others open the matching Toolkit
// tab (via au1_open_toolkit_tab, which ToolkitScreen picks up on mount).
const TOOLS = [
  { tab: "aitools", day: 6, step: "Simulation", name: "AI Conversation Prep", line: "Plan an important meeting or conversation." },
  { tab: "aitools", day: 8, step: "Simulation", name: "Story Architect", line: "Shape a story that lands." },
  { tab: "practice", name: "Practice Space", line: "Keep improving your communication." },
  { tab: "quickprep", name: "Quick Prep", line: "Get ready just before you walk in." },
];

function openToolkit(tab, onExitToTab) {
  try { localStorage.setItem("au1_open_toolkit_tab", tab); } catch {}
  onExitToTab && onExitToTab("toolkit");
}

export function ToolkitJourneyCard({ T, T2, isDesktop: d, onExitToTab, onStartSession }) {
  return (
    <div style={{ background: T2.surface, borderRadius: d ? 6 : 8, border: "0.5px solid " + T2.border, padding: d ? "24px 26px" : "18px 18px", marginBottom: d ? 20 : 16 }}>
      <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 8 }}>Your journey doesn't end here</div>
      <p style={{ fontFamily: T.serif, fontSize: d ? 20 : 18, fontWeight: 600, color: T2.text, lineHeight: 1.3, margin: "0 0 6px" }}>Your AI toolkit is there whenever you need it.</p>
      <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, color: T2.text3, lineHeight: 1.55, margin: "0 0 14px" }}>Keep practising, keep showing up, and keep amplifying your voice.</p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {TOOLS.map((t, i) => (
          <button key={t.name} onClick={() => (t.day && onStartSession ? onStartSession(t.day, t.step) : openToolkit(t.tab, onExitToTab))}
            style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: "transparent", border: "none", borderTop: i ? "0.5px solid " + T2.divider : "none", padding: "12px 0", cursor: "pointer", WebkitAppearance: "none", appearance: "none" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.sans, fontSize: d ? 15 : 14, fontWeight: 600, color: T2.text, marginBottom: 2 }}>{t.name}</div>
              <div style={{ fontFamily: T.sans, fontSize: d ? 13 : 12, color: T2.text3, lineHeight: 1.45 }}>{t.line}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}><path d="M6 3l5 5-5 5" stroke={T.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        ))}
      </div>
      <button onClick={() => openToolkit("aitools", onExitToTab)}
        style={{ width: "100%", marginTop: 12, padding: d ? "13px" : "12px", borderRadius: 4, border: "1px solid " + T.gold, background: "transparent", color: T.gold, fontFamily: T.sans, fontSize: d ? 14 : 13, fontWeight: 600, cursor: "pointer" }}>
        Open your Toolkit →
      </button>
    </div>
  );
}
