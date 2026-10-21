import { useEffect, useRef } from "react";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard, warmLift } from "./CoachNarration.jsx";

// ─── DAY 6 THEORY — what happens under pressure, guided by the coach ────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The four cards
// light up as the coach explains each one; the closing lines bring in an Up
// next card for the Example tab. Cue times: see CoachNarration.jsx.
const SRC = "/day6-theory.mp3";
const DURATION = 67;
const CUES = [
  { t: 10.2, step: 0 },     // "First, the threat response."
  { t: 22.9, step: 1 },     // "Then, emotional regulation."
  { t: 37.7, step: 2 },     // "Next, framing."
  { t: 50.7, step: 3 },     // "And finally, listening."
  { t: 59.3, next: true },  // "Composure isn't the absence of pressure…"
];

const STEPS = [
  { n: "Threat Response",      role: "Biology before logic",            body: "Criticism, conflict, and disagreement can trigger the same fight-or-flight response as physical threat: faster speech, defensive tone, poor listening, impulsive reactions." },
  { n: "Emotional Regulation", role: "Pause before performance",        body: "The best communicators regulate emotion before they respond. Breathe lower. Slow your pace. Use shorter responses. Let strategic silence do the work." },
  { n: "Framing",              role: "Language changes temperature",    body: "'You're wrong' escalates. 'I see this differently' opens space. The same disagreement, framed calmly, reaches a completely different outcome." },
  { n: "Listening",            role: "Being heard starts with hearing", body: "People de-escalate when they feel understood. Composure includes listening: not waiting to respond, but genuinely hearing what the other person is saying." },
];

export default function D6Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const stepRefs = useRef([]);
  const nextRef = useRef(null);
  const nextLit = playing && cue?.next;

  // Bring the narrated step (or the Up next card) into view as each cue fires.
  useEffect(() => {
    if (!playing || !cue) return;
    const el = cue.next ? nextRef.current : stepRefs.current[cue.step];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  const lift = warmLift(T, T2);
  return (
    <>
      <CoachStyles />

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Science of Composure</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>What Happens Under Pressure</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 20 : 16, maxWidth: 640 }}>High-stakes conversations trigger biology before logic. Strong communicators understand what's happening, and learn to manage it.</p>
      <div style={{ background: T2.surface, borderLeft: "3px solid " + T.gold, padding: d ? "18px 22px" : "16px 18px", marginBottom: d ? 24 : 18, borderRadius: 4 }}>
        <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T2.text, lineHeight: 1.4, margin: 0, fontStyle: "italic" }}>The strongest communicator is often the calmest person in the room.</p>
      </div>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <div style={{ display: "grid", gridTemplateColumns: d ? "1fr 1fr" : "1fr", gap: d ? 14 : 10, marginBottom: d ? 24 : 16 }}>
        {STEPS.map((s, i) => {
          const on = playing && cue?.step === i;
          return (
            <div key={s.n} ref={el => (stepRefs.current[i] = el)} className="au-coach-lit"
              style={{
                padding: d ? "20px 22px" : "16px 18px", borderRadius: d ? 4 : 8,
                background: on ? lift.bg : T2.surface,
                border: "1px solid " + (on ? lift.border : T2.border),
                boxShadow: on ? lift.shadow : "none",
              }}>
              <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 6 : 4 }}>{s.n}</div>
              <div style={{ fontFamily: T.serif, fontSize: d ? 16 : 15, fontWeight: 600, color: on ? T2.goldDark : T2.text, marginBottom: d ? 8 : 6 }}>{s.role}</div>
              <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, color: T2.text3, lineHeight: 1.6, fontWeight: 400, margin: 0 }}>{s.body}</p>
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, fontStyle: "italic", color: T.gold, lineHeight: 1.7, margin: 0 }}>Composure isn't the absence of pressure. It's what you build so pressure doesn't change you.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Masters Under Pressure" sub="Lewis Hamilton & Amal Clooney" onClick={onNext} />
      )}
    </>
  );
}
