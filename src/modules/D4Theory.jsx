import { useEffect, useRef } from "react";
import { useCoachNarration, useClipPlayer, stopClips, CoachButton, CoachStyles, PlayIcon, warmLift, fmt } from "./CoachNarration.jsx";

// ─── DAY 4 THEORY — Miller's Law, guided by the coach ────────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The four steps
// light up as the coach explains each one, then the coach hands over to a
// demo: the same delivery update told as one long sentence, then as short
// ones. Cue times: see CoachNarration.jsx.
const SRC = "/day4-theory.mp3";
const DURATION = 54;
const CUES = [
  { t: 16.4, step: 0 },       // "First, memory load."
  { t: 24.8, step: 1 },       // "Then, diminishing capacity."
  { t: 34.7, step: 2 },       // "Next, the forgetting curve."
  { t: 41.5, step: 3 },       // "And finally, the fix."
  { t: 52.1, demo: true },    // "Let's hear the difference."
];

// Same voice, same information; only the sentence length changes.
const DEMO = [
  { id: "long", label: "Long version", meta: "1 sentence · 59 words", src: "/day4-demo-long.mp3", secs: 19,
    text: "So I've been speaking to the supplier, and because of the delays at the warehouse last week, which were partly down to staff shortages, the delivery we were expecting on Friday is now probably going to arrive early next week, which means we might need to move the client presentation, unless we can use the samples we already have." },
  { id: "short", label: "Short version", meta: "5 sentences · 24 words", src: "/day4-demo-short.mp3", secs: 9,
    text: "The Friday delivery is delayed. It'll arrive early next week. That affects the client presentation. My suggestion? We use the samples we already have." },
];
const DEMO_CHANGES = [
  { what: "One idea per sentence", why: "your listener never has to juggle." },
  { what: "Problem first", why: "they know what's happening straight away." },
  { what: "The ask is clear", why: "your suggestion doesn't get lost at the end." },
];

function stepIcons(c) {
  return [
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="2" y="11" width="13" height="3" rx="1" stroke={c} strokeWidth="1.1"/><rect x="4" y="7" width="9" height="3" rx="1" stroke={c} strokeWidth="1.1"/><rect x="6" y="3" width="5" height="3" rx="1" stroke={c} strokeWidth="1.1"/></svg>,
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><line x1="2" y1="9.5" x2="15" y2="9.5" stroke={c} strokeWidth="0.9" strokeDasharray="1.5 1.5"/><rect x="3" y="6" width="2.3" height="7" stroke={c} strokeWidth="1.1"/><rect x="7.3" y="3" width="2.3" height="10" stroke={c} strokeWidth="1.1"/><rect x="11.6" y="7.5" width="2.3" height="5.5" stroke={c} strokeWidth="1.1"/></svg>,
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M2 4c2.5 0 3.5 1.5 5 3.5s3.5 4.5 7 4.5" stroke={c} strokeWidth="1.1" strokeLinecap="round" fill="none"/><polyline points="11 12 14 12 14 9" stroke={c} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="4.5" cy="4" r="1.8" stroke={c} strokeWidth="1.1"/><circle cx="4.5" cy="13" r="1.8" stroke={c} strokeWidth="1.1"/><line x1="6" y1="5.2" x2="14.5" y2="12" stroke={c} strokeWidth="1.1" strokeLinecap="round"/><line x1="6" y1="11.8" x2="14.5" y2="5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  ];
}
const STEPS = [
  { n: "01", label: "Memory Load", desc: "Every sentence you speak creates a memory load.", focus: "Each word asks something of your listener's attention." },
  { n: "02", label: "Diminishing Capacity", desc: "Long sentences stack information faster than your audience can process.", focus: "Once capacity is exceeded, comprehension drops fast." },
  { n: "03", label: "The Forgetting Curve", desc: "By the time you reach the end, they've forgotten the beginning.", focus: "Length doesn't just confuse. It erases." },
  { n: "04", label: "The Fix", desc: "One idea. One sentence. Full stop.", focus: "Simplicity isn't a compromise. It's a strategic choice." },
];

export default function D4Theory({ T, T2, isDesktop, sharedAudioRef }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef, onBeforePlay: stopClips, onLeave: stopClips });
  const clips = useClipPlayer(narration);
  const { playing, cueIdx, cue } = narration;
  const stepRefs = useRef([]);
  const demoRef = useRef(null);

  // Bring the narrated step (or the demo) into view as each cue fires.
  useEffect(() => {
    if (!playing || !cue) return;
    const el = cue.demo ? demoRef.current : stepRefs.current[cue.step];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  const lift = warmLift(T, T2);
  const icons = stepIcons(T2.text4);
  const demoLit = playing && cue?.demo;
  const heardBoth = DEMO.every(c => clips.heard(c.src));

  return (
    <>
      <CoachStyles />

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Science</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Miller's Law</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 20 : 16, maxWidth: 640 }}>In 1956, psychologist George Miller discovered something fundamental about how humans think.</p>
      <div style={{ background: T2.surface, borderLeft: "3px solid " + T.gold, padding: d ? "18px 22px" : "16px 18px", marginBottom: d ? 24 : 18, borderRadius: 4 }}>
        <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T2.text, lineHeight: 1.4, margin: 0, marginBottom: 6, fontStyle: "italic" }}>"We can only hold 7 (±2) pieces of information in working memory at once."</p>
        <p style={{ fontFamily: T.sans, fontSize: 12, color: T2.text4, margin: 0 }}>George Miller, 1956</p>
      </div>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <div style={{ display: "flex", flexDirection: "column", gap: d ? 10 : 8, marginBottom: d ? 28 : 22 }}>
        {STEPS.map((s, i) => {
          const on = playing && cue?.step === i;
          return (
            <div key={s.n} ref={el => (stepRefs.current[i] = el)} className="au-coach-lit"
              style={{
                display: "flex", gap: d ? 18 : 14, padding: d ? "16px 18px" : "13px 14px", borderRadius: d ? 4 : 8,
                background: on ? lift.bg : T2.surface,
                border: "1px solid " + (on ? lift.border : T2.border),
                boxShadow: on ? lift.shadow : "none",
              }}>
              <div style={{ fontFamily: T.serif, fontSize: d ? 24 : 20, fontWeight: 500, color: T.gold, opacity: 0.85, lineHeight: 1, minWidth: d ? 28 : 24, paddingTop: 2 }}>{s.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {icons[i]}
                  <div style={{ fontFamily: T.serif, fontSize: d ? 19 : 17, fontWeight: 600, color: on ? T2.goldDark : T.gold }}>{s.label}</div>
                </div>
                <p style={{ fontFamily: T.sans, fontSize: d ? 15 : 14, color: T2.text, lineHeight: 1.6, margin: 0, marginBottom: 4 }}>{s.desc}</p>
                <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, color: T2.text3, lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>{s.focus}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hear the difference — the coach's hand-off */}
      <div ref={demoRef} className={"au-coach-lit" + (demoLit ? " au-coach-pulse" : "")}
        style={{
          background: T2.surface, borderRadius: d ? 4 : 8, padding: d ? "22px 24px" : "16px 14px",
          border: "1px solid " + (demoLit ? lift.border : T2.border),
          animation: demoLit ? "au-coach-pulse 1.6s ease-in-out infinite" : "none",
        }}>
        <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>Hear the difference</div>
        <p style={{ fontFamily: T.serif, fontSize: d ? 22 : 19, fontWeight: 600, color: T2.text, lineHeight: 1.3, margin: 0, marginBottom: 4 }}>A quick update to your manager.</p>
        <p style={{ fontFamily: T.sans, fontSize: d ? 15 : 14, color: T2.text2, lineHeight: 1.5, margin: 0, marginBottom: d ? 16 : 14 }}>Same news. Same voice. Listen to both.</p>
        <div style={{ display: "grid", gridTemplateColumns: d ? "1fr 1fr" : "1fr", gap: 10 }}>
          {DEMO.map(c => {
            const isPlaying = clips.playing === c.src;
            const on = isPlaying || (heardBoth && c.id === "short");
            return (
              <div key={c.id}
                style={{
                  borderRadius: d ? 4 : 8, padding: d ? "14px 16px" : "12px 14px",
                  background: on ? lift.bg : "transparent",
                  border: "1px solid " + (on ? lift.border : T2.border),
                  boxShadow: on ? lift.shadow : "none", transition: "all 0.25s",
                }}>
                <button onClick={() => clips.toggle(c.src)} aria-label={(isPlaying ? "Pause " : "Play ") + c.label.toLowerCase()}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 0, marginBottom: 10, textAlign: "left",
                    WebkitAppearance: "none", appearance: "none", cursor: "pointer", background: "transparent", border: "none",
                  }}>
                  <span style={{ width: 36, height: 36, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <PlayIcon playing={isPlaying} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: T.sans, fontSize: d ? 16 : 15, fontWeight: 500, color: T2.text }}>{c.label}</span>
                    <span style={{ display: "block", fontFamily: T.sans, fontSize: 12, color: T2.text3 }}>{c.meta}</span>
                  </span>
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T2.text4, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{clips.heard(c.src) && !isPlaying ? "✓" : fmt(c.secs)}</span>
                </button>
                <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, fontStyle: "italic", color: T2.text, lineHeight: 1.6, margin: 0 }}>"{c.text}"</p>
              </div>
            );
          })}
        </div>
        {heardBoth && (
          <div className="au-step-enter" style={{ marginTop: d ? 18 : 16 }}>
            <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.4px", marginBottom: 8 }}>What changed in the short version</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DEMO_CHANGES.map(c => (
                <p key={c.what} style={{ fontFamily: T.sans, fontSize: d ? 15 : 14, color: T2.text, lineHeight: 1.5, margin: 0 }}>
                  <span style={{ fontFamily: T.serif, fontSize: d ? 18 : 16, fontWeight: 600, color: T2.goldDark }}>{c.what}:</span> {c.why}
                </p>
              ))}
            </div>
            <p style={{ fontFamily: T.sans, fontSize: d ? 15 : 14, color: T2.text2, lineHeight: 1.6, margin: 0, marginTop: 12 }}>Same information. Less than half the words. Nothing to untangle.</p>
          </div>
        )}
      </div>
    </>
  );
}
