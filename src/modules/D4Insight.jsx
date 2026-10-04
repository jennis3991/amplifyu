import { useEffect, useRef } from "react";
import { D4_FACTS } from "../data.js";
import { useCoachNarration, useCueCards, CoachButton, CoachCardGrid, CoachStyles, UpNextCard } from "./CoachNarration.jsx";

// ─── DAY 4 INSIGHT — short sentences, guided by the coach ────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Each card opens
// as the coach reaches it; the closing lines bring in an Up next card for the
// Theory tab (Miller's Law). Cue times: see CoachNarration.jsx.
const SRC = "/day4-insight.mp3";
const DURATION = 67;
const CUES = [
  { t: 15.9, card: 0 },     // "First, processing speed."
  { t: 26.6, card: 1 },     // "Then, retention."
  { t: 35.5, card: 2 },     // "Next, impact."
  { t: 43.1, card: 3 },     // "And finally, persuasion."
  { t: 54.2, next: true },  // "Short isn't simple. It's precise…"
];

export default function D4Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 12 : 8 }}>Why Short Sentences Win</h2>
      <p style={{ fontFamily: T.serif, fontSize: d ? 24 : 20, fontStyle: "italic", color: T2.goldDark, lineHeight: 1.35, margin: 0, marginBottom: d ? 14 : 10 }}>Long sentences lose people. Short sentences move them.</p>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>The brain processes short sentences faster, retains them longer, and finds them more persuasive.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCardGrid T={T} T2={T2} isDesktop={d} cards={D4_FACTS} cueCards={cueCards} />

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Miller's Law" sub="How memory shapes understanding" onClick={onNext} />
      )}
    </>
  );
}
