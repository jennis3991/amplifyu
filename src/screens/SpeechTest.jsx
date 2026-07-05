import { useState, useRef } from "react";

const T = { bg: "#1C1712", surface: "#241E17", border: "#3A3128", cream: "#F7F3EC", muted: "#A8998A", sage: "#8A9E84" };

export function SpeechTest() {
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(false);
  const uttRef = useRef(null);
  const synth = window.speechSynthesis;

  function play() {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(document.getElementById("st-text").value.trim());
    u.rate = 0.95;
    u.onstart  = () => { setActive(true); setPaused(false); };
    u.onend    = () => { setActive(false); setPaused(false); };
    u.onerror  = () => { setActive(false); setPaused(false); };
    uttRef.current = u;
    synth.speak(u);
  }

  function togglePause() {
    if (synth.paused) { synth.resume(); setPaused(false); }
    else              { synth.pause();  setPaused(true);  }
  }

  function stop() {
    synth.cancel();
    setActive(false);
    setPaused(false);
  }

  return (
    <div style={{ background: T.bg, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "28px 24px" }}>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", color: T.sage, marginBottom: 6 }}>AmplifyU</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: T.cream, marginBottom: 20, lineHeight: 1.2 }}>Speech Test</h1>

        <textarea
          id="st-text"
          defaultValue="Your voice is one of your most powerful professional tools. The way you speak shapes how others perceive your confidence, credibility and presence."
          style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.cream, fontFamily: "inherit", fontSize: 16, lineHeight: 1.65, padding: "14px", resize: "vertical", minHeight: 120, outline: "none" }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={play}
            disabled={active && !paused}
            style={{ flex: 1, padding: "13px 8px", border: "none", borderRadius: 8, background: T.sage, color: T.bg, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: active && !paused ? 0.35 : 1 }}
          >
            Play
          </button>
          <button
            onClick={togglePause}
            disabled={!active}
            style={{ flex: 1, padding: "13px 8px", border: `1px solid ${T.border}`, borderRadius: 8, background: "#2E2820", color: T.sage, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: !active ? 0.35 : 1 }}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={stop}
            disabled={!active}
            style={{ flex: 1, padding: "13px 8px", border: `1px solid ${T.border}`, borderRadius: 8, background: "#2E2820", color: T.cream, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: !active ? 0.35 : 1 }}
          >
            Stop
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: T.muted, textAlign: "center", minHeight: 16 }}>
          {active && !paused ? "Speaking..." : paused ? "Paused" : ""}
        </div>

      </div>
    </div>
  );
}
