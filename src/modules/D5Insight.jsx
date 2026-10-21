import { useEffect, useRef } from "react";
import { D5_FACTS } from "../data.js";
import { useCoachNarration, useCueCards, CoachButton, CoachCardGrid, CoachStyles, UpNextCard } from "./CoachNarration.jsx";

// ─── DAY 5 INSIGHT — structure, guided by the coach ──────────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Each card opens
// as the coach reaches it; the closing lines bring in an Up next card for the
// Theory tab (primacy and recency). Cue times: see CoachNarration.jsx.
const SRC = "/day5-insight.mp3";
const DURATION = 67;
const CUES = [
  { t: 17.1, card: 0 },     // "First, credibility."
  { t: 27.6, card: 1 },     // "Then, recall."
  { t: 37.0, card: 2 },     // "Next, persuasion."
  { t: 47.3, card: 3 },     // "And finally, decision speed."
  { t: 57.9, next: true },  // "Structure is the backbone…"
];

export default function D5Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Why Structure Wins</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Great communicators don't just have better ideas. They organise them better. Structure helps people understand faster, remember longer, and act with confidence.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCardGrid T={T} T2={T2} isDesktop={d} cards={D5_FACTS} cueCards={cueCards} />

      {/* Desktop already shows this line in the left panel. */}
      {!d && <p style={{ fontFamily: T.sans, fontSize: 14, fontStyle: "italic", color: T.gold, lineHeight: 1.7, margin: "18px 0 0" }}>Structure is the backbone of every powerful communication.</p>}

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Primacy and Recency" sub="Why the start and the end stick" onClick={onNext} />
      )}
    </>
  );
}
