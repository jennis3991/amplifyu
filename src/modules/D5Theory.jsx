import { useEffect, useRef } from "react";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard, warmLift } from "./CoachNarration.jsx";

// ─── DAY 5 THEORY — primacy and recency, guided by the coach ─────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Point, Reason
// and Example light up as the coach explains each one; the closing lines bring
// in an Up next card for the Example tab. Cue times: see CoachNarration.jsx.
const SRC = "/day5-theory.mp3";
const DURATION = 59;
const CUES = [
  { t: 21.9, step: 0 },     // "First, your point."
  { t: 30.5, step: 1 },     // "Then, your reason."
  { t: 38.9, step: 2 },     // "And finally, your example."
  { t: 48.4, next: true },  // "PRE isn't just structure…"
];

const STEPS = [
  { n: "Point",   role: "Strong opening anchor",  body: "Lead with your conclusion. The first thing your listener hears makes the strongest impression, so give them something worth remembering." },
  { n: "Reason",  role: "Cognitive bridge",       body: "Connect your point to meaning. This is how you make the idea stick, not just land." },
  { n: "Example", role: "Memorable closing proof", body: "Finish with evidence. Thanks to the recency effect, your example is the last thing heard and the easiest to recall." },
];

export default function D5Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Science</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 32 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>The architecture of every great professional answer</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 20 : 16, maxWidth: 640 }}>Two well-established findings from memory science, the primacy effect and the recency effect, explain exactly why PRE works.</p>
      <div style={{ background: T2.surface, borderLeft: "3px solid " + T.gold, padding: d ? "18px 22px" : "16px 18px", marginBottom: d ? 24 : 18, borderRadius: 4 }}>
        <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T2.text, lineHeight: 1.4, margin: 0, marginBottom: 6, fontStyle: "italic" }}>People remember the beginning and end of information most clearly. The middle is the hardest part to remember.</p>
        <p style={{ fontFamily: T.sans, fontSize: 12, color: T2.text4, margin: 0 }}>The primacy and recency effects</p>
      </div>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <div style={{ display: d ? "grid" : "flex", gridTemplateColumns: "1fr 1fr 1fr", flexDirection: "column", gap: d ? 14 : 10, marginBottom: d ? 24 : 16 }}>
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

      <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, fontStyle: "italic", color: T.gold, lineHeight: 1.7, margin: 0 }}>PRE isn't just structure. It's how the brain naturally wants to receive information.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Structure in Action" sub="Jensen Huang & Indra Nooyi" onClick={onNext} />
      )}
    </>
  );
}
