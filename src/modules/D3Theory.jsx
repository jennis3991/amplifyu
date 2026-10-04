import { useEffect, useRef } from "react";
import { D3_THEORY_CARDS } from "../data.js";
import { useCoachNarration, useCueCards, CoachButton, CoachCardGrid, CoachStyles, UpNextCard } from "./CoachNarration.jsx";

// ─── DAY 3 THEORY — The Cognitive Load Principle, guided by the coach ────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Each card opens
// as the coach explains it; the closing lines bring in an Up next card for the
// Example tab (Masters of the Pause). Cue times: see CoachNarration.jsx.
const SRC = "/day3-theory.mp3";
const DURATION = 68;
const CUES = [
  { t: 16.0, card: 0 },     // "First, the real cause."
  { t: 29.9, card: 1 },     // "Then, inside the moment."
  { t: 37.5, card: 2 },     // "Which brings us to the strategic pause."
  { t: 47.3, card: 3 },     // "And here's why it works."
  { t: 58.9, next: true },  // "You don't need to speak faster…" → "Let's meet two masters…"
];

export default function D3Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const cueCards = useCueCards(cueIdx, cue);
  const nextRef = useRef(null);
  const nextLit = playing && cue?.next;

  // Bring the narrated card (or the Up next card) into view as each cue fires.
  useEffect(() => {
    if (!playing || !cue) return;
    const el = cue.next ? nextRef.current : cueCards.refs.current[cue.card];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  return (
    <>
      <CoachStyles />

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Science</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>The Cognitive Load Principle</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 20 : 16, maxWidth: 640 }}>Fillers happen when your brain is multitasking faster than it can think.</p>
      <div style={{ background: T2.surface, borderLeft: "3px solid " + T.gold, padding: d ? "18px 22px" : "16px 18px", marginBottom: d ? 24 : 18, borderRadius: 4 }}>
        <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T2.text, lineHeight: 1.4, margin: 0, fontStyle: "italic" }}>You don't have a speaking problem. You have a processing speed problem, and the pause is the solution.</p>
      </div>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCardGrid T={T} T2={T2} isDesktop={d} cards={D3_THEORY_CARDS} cueCards={cueCards} />

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Masters of the Pause" sub="Morgan Freeman & Anna Wintour" onClick={onNext} />
      )}
    </>
  );
}
