import { useEffect, useRef } from "react";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard, warmLift } from "./CoachNarration.jsx";

// ─── DAY 7 EXAMPLE — Week 1 foundations, guided by the coach ─────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. A timeline of
// the six days; each row lights as the coach reaches it, then an Up next card
// leads to the Rehearsal. Cue times: see CoachNarration.jsx.
const SRC = "/day7-example.mp3";
const DURATION = 42;
const CUES = [
  { t: 3.1, step: 0 },      // "Day one, clarity."
  { t: 8.9, step: 1 },      // "Day two, your voice."
  { t: 13.9, step: 2 },     // "Day three, the pause."
  { t: 19.8, step: 3 },     // "Day four, short sentences."
  { t: 24.4, step: 4 },     // "Day five, structure."
  { t: 30.9, step: 5 },     // "And day six, composure."
  { t: 39.8, next: true },  // "Now it's time to put them all into practice."
];

// Science labels match each day's Theory tab.
const FOUNDATIONS = [
  { day: "DAY 1", skill: "Clarity", science: "The Feynman Technique", line: "If you can't say it simply, keep working on it until you can." },
  { day: "DAY 2", skill: "Voice Control", science: "The 88 Keys", line: "Your voice has more range than you've been using. That changes from here." },
  { day: "DAY 3", skill: "Filler-Free Speech", science: "The Cognitive Load Principle", line: "Strong communicators pause. Silence gives you control." },
  { day: "DAY 4", skill: "Precision", science: "Miller's Law", line: "Every word must earn its place. Short sentences are a strategic choice." },
  { day: "DAY 5", skill: "Structure", science: "The PRE Framework", line: "Point. Reason. Example. The architecture of every compelling answer." },
  { day: "DAY 6", skill: "High-Stakes Conversations", science: "What Happens Under Pressure", line: "The gap between good and great opens under pressure. You started closing it." },
];

export default function D7Example({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const rowRefs = useRef([]);
  const nextRef = useRef(null);
  const nextLit = playing && cue?.next;

  // Bring the narrated row (or the Up next card) into view as each cue fires.
  useEffect(() => {
    if (!playing || !cue) return;
    const el = cue.next ? nextRef.current : rowRefs.current[cue.step];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  const lift = warmLift(T, T2);
  return (
    <>
      <CoachStyles />

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>Your Week 1 Foundations</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 32 : 24, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 12 : 8 }}>Six habits. Seven days. Here's what you built.</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 17 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 22 : 16, maxWidth: 640 }}>Each foundation is a permanent part of your communication toolkit. Not techniques to remember, behaviours to repeat.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <div style={{ display: "flex", flexDirection: "column", gap: d ? 12 : 10 }}>
        {FOUNDATIONS.map((f, i) => {
          const on = playing && cue?.step === i;
          return (
            <div key={f.day} ref={el => (rowRefs.current[i] = el)} className="au-coach-lit"
              style={{
                display: "flex", gap: d ? 16 : 14, alignItems: "flex-start", padding: d ? "18px 20px" : "14px 16px", borderRadius: d ? 6 : 8,
                background: on ? lift.bg : T2.surface,
                border: "1px solid " + (on ? lift.border : T2.border),
                boxShadow: on ? lift.shadow : "none",
              }}>
              <div style={{ background: T.gold, borderRadius: d ? 3 : 4, padding: d ? "5px 10px" : "4px 8px", flexShrink: 0 }}>
                <span style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: "white", letterSpacing: "1px" }}>{f.day}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.serif, fontSize: d ? 18 : 16, fontWeight: 600, color: on ? T2.goldDark : T2.text, marginBottom: 2 }}>{f.skill}</div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.gold, fontWeight: 600, letterSpacing: "0.5px", marginBottom: d ? 8 : 6 }}>{f.science}</div>
                <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, color: T2.text3, lineHeight: 1.55, margin: 0, fontWeight: 400, fontStyle: "italic" }}>{f.line}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: d ? 20 : 16, padding: d ? "16px 20px" : "14px 16px", background: "rgba(138,158,132,0.08)", borderRadius: d ? 4 : 6, border: "0.5px solid rgba(138,158,132,0.2)", textAlign: "center" }}>
        <p style={{ fontFamily: T.serif, fontSize: d ? 18 : 15, fontWeight: 600, color: T.gold, lineHeight: 1.4, margin: 0 }}>Skills compound.</p>
      </div>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Teach It Forward" sub="Put the week into practice" onClick={onNext} />
      )}
    </>
  );
}
