import { useEffect, useRef } from "react";
import { D5_FACTS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 5 INSIGHT — structure, guided by the coach ──────────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Same one-card
// carousel as Week 2 (see CoachCarousel.jsx): the coach moves to each card at
// its cue; the closing lines bring in an Up next card for the Theory tab
// (primacy and recency). Cue times: see CoachNarration.jsx.
const SRC = "/day5-insight.mp3";
const DURATION = 67;
const CUES = [
  { t: 17.1, card: 0 },     // "First, credibility."
  { t: 27.6, card: 1 },     // "Then, recall."
  { t: 37.0, card: 2 },     // "Next, persuasion."
  { t: 47.3, card: 3 },     // "And finally, decision speed."
  { t: 57.9, next: true },  // "Structure is the backbone…"
];

// Big statement on each card, idea name as the small label (as Week 2).
const CARDS = D5_FACTS.map(n => ({ tag: n.word, word: n.sub, bullets: n.bullets }));

export default function D5Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const carousel = useCueCarousel(narration);
  const nextRef = useRef(null);
  const nextLit = playing && cue?.next;

  // Bring the Up next card into view at the hand-off (the carousel follows
  // its own card cues).
  useEffect(() => {
    if (nextLit) nextRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  return (
    <>
      <CoachStyles />

      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Why Structure Wins</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Great communicators don't just have better ideas. They organise them better. Structure helps people understand faster, remember longer, and act with confidence.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Why structure wins"
        style={d ? undefined : { marginBottom: 16 }} />

      {/* Desktop already shows this line in the left panel. */}
      {!d && <p style={{ fontFamily: T.sans, fontSize: 14, fontStyle: "italic", color: T.gold, lineHeight: 1.7, margin: 0, marginBottom: 18 }}>Structure is the backbone of every powerful communication.</p>}

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Primacy and Recency" sub="Why the start and the end stick" onClick={onNext} />
      )}
    </>
  );
}
