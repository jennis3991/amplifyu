import { useEffect, useRef } from "react";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard, warmLift } from "./CoachNarration.jsx";

// ─── DAY 1 THEORY — the Feynman Technique, guided by the coach ───────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. As the coach
// reaches each step its card lifts, then "the real lesson", then the hand-off
// ("So what does clarity sound like?") brings in an Up next card for the
// Example tab. It only shows during the hand-off, so it never duplicates the
// session's own Next button. Cue times: see CoachNarration.jsx.
const SRC = "/day1-theory.mp3";
const DURATION = 69;
const CUES = [
  { t: 16.9, step: 0 },        // "First, understand."
  { t: 21.2, step: 1 },        // "Then, explain it simply…"
  { t: 32.8, step: 2 },        // "Then, simplify."
  { t: 41.0, step: 3 },        // "And finally, refine."
  { t: 45.7, lesson: true },   // "…and that's the real lesson."
  { t: 56.6, next: true },     // "So what does clarity sound like?"
];

function stepIcon(i, color) {
  const p = { stroke: color, strokeWidth: 1.1 };
  return [
    <svg width="16" height="16" viewBox="0 0 17 17" fill="none"><rect x="3" y="2" width="11" height="13" rx="1.5" {...p}/><line x1="5.5" y1="5.5" x2="11.5" y2="5.5" stroke={color} strokeWidth="0.9"/><line x1="5.5" y1="8.5" x2="11.5" y2="8.5" stroke={color} strokeWidth="0.9"/><line x1="5.5" y1="11.5" x2="9.5" y2="11.5" stroke={color} strokeWidth="0.9"/></svg>,
    <svg width="16" height="16" viewBox="0 0 17 17" fill="none"><path d="M13.5 3h-10A1.5 1.5 0 002 4.5v5A1.5 1.5 0 003.5 11h2l2.5 3 2.5-3h3A1.5 1.5 0 0015 9.5v-5A1.5 1.5 0 0013.5 3z" {...p}/></svg>,
    <svg width="16" height="16" viewBox="0 0 17 17" fill="none"><path d="M12.5 3.5l1 1-7.5 7.5H4.5v-1.5l7.5-7.5z" {...p} strokeLinejoin="round"/><line x1="4.5" y1="14" x2="12.5" y2="14" stroke={color} strokeWidth="0.9" strokeLinecap="round" strokeDasharray="1.5 1.5"/></svg>,
    <svg width="16" height="16" viewBox="0 0 17 17" fill="none"><path d="M14 8.5A5.5 5.5 0 013.5 6.5" {...p} strokeLinecap="round"/><path d="M3 8.5A5.5 5.5 0 0113.5 10.5" {...p} strokeLinecap="round"/><path d="M12 5l2 1.5-1.5 2" {...p} strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12l-2-1.5 1.5-2" {...p} strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ][i];
}

// Card copy follows what the coach says for each step.
const STEPS = [
  { n: "01", label: "Understand", desc: "Choose one concept and study it deeply.", focus: "Knowledge before communication." },
  { n: "02", label: "Explain", desc: "Teach it simply. Where you stumble, you've found a gap.", focus: "Mastery is demonstrated through clarity." },
  { n: "03", label: "Simplify", desc: "Remove the jargon and every word that doesn't help.", focus: "Simplicity is precision. Every word should earn its place." },
  { n: "04", label: "Refine", desc: "Review, clarify, and improve. Repeat until it sticks.", focus: "Clarity is built through iteration, not perfection." },
];

export default function D1Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const stepRefs = useRef([]);
  const lessonRef = useRef(null);
  const nextRef = useRef(null);

  // Bring the narrated element into view as each cue fires.
  useEffect(() => {
    if (!playing || !cue) return;
    const el = cue.next ? nextRef.current : cue.lesson ? lessonRef.current : stepRefs.current[cue.step];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  const lift = warmLift(T, T2);
  const litStep = cue && cue.step !== undefined ? cue.step : null;
  const lessonLit = !!cue?.lesson;
  const nextLit = playing && cue?.next;
  const liftStyle = (on, baseBg = "transparent") => ({
    background: on ? lift.bg : baseBg,
    border: "1px solid " + (on ? lift.border : "transparent"),
    boxShadow: on ? lift.shadow : "none",
  });

  return (
    <>
      <CoachStyles />

      <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 14 : 10 }}>The Science</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 34 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>The Feynman Technique</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 17 : 16, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 22 : 18, maxWidth: 620 }}>Richard Feynman won the Nobel Prize in Physics — and could explain quantum mechanics to a 12-year-old.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} style={{ marginBottom: d ? 28 : 22 }} />

      <div style={{ padding: d ? "18px 22px" : "16px 18px", background: "rgba(44,36,22,0.07)", borderRadius: 4, borderLeft: "2px solid " + T.gold, marginBottom: d ? 28 : 22 }}>
        <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T2.text, lineHeight: 1.4, margin: "0 0 5px", fontStyle: "italic" }}>"If you can't explain it simply, you don't understand it well enough."</p>
        <p style={{ fontFamily: T.sans, fontSize: 11, color: T2.text4, margin: 0 }}>— Richard Feynman</p>
      </div>

      {STEPS.map((s, i) => {
        const on = litStep === i;
        return (
          <div key={i} ref={el => (stepRefs.current[i] = el)} className="au-coach-lit"
            style={{
              display: "flex", gap: d ? 18 : 14, padding: d ? "16px 18px" : "14px 16px", marginBottom: 6, borderRadius: 6,
              ...liftStyle(on, `rgba(44,36,22,${0.03 + i * 0.03})`),
            }}>
            <div style={{ fontFamily: T.serif, fontSize: d ? 24 : 20, fontWeight: 500, color: T.gold, opacity: 0.85, lineHeight: 1, minWidth: d ? 28 : 24, paddingTop: d ? 3 : 2 }}>{s.n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: d ? 8 : 7, marginBottom: d ? 7 : 6 }}>
                {stepIcon(i, on ? T.gold : T2.text4)}
                <div style={{ fontFamily: T.serif, fontSize: d ? 18 : 16, fontWeight: 600, color: on ? T2.goldDark : T.gold }}>{s.label}</div>
              </div>
              <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, color: T2.text, lineHeight: 1.6, fontWeight: 400, margin: "0 0 4px" }}>{s.desc}</p>
              <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 15, color: T2.text3, lineHeight: 1.5, fontWeight: 300, fontStyle: "italic", margin: 0 }}>{s.focus}</p>
            </div>
          </div>
        );
      })}

      <div ref={lessonRef} className="au-coach-lit"
        style={{ marginTop: d ? 22 : 18, marginBottom: d ? 22 : 18, padding: d ? "18px 20px" : "16px 16px", borderRadius: 6, ...liftStyle(lessonLit) }}>
        <div style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Real Lesson</div>
        <div style={{ fontFamily: T.serif, fontSize: d ? 20 : 19, fontWeight: 400, fontStyle: "italic", color: T2.text, lineHeight: 1.4 }}>
          If you can make it simple, you understand it.<br />Explain it clearly, and people feel it.
        </div>
      </div>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Masters of Clear Communication" sub="Attenborough & Branson" onClick={onNext} />
      )}
    </>
  );
}
