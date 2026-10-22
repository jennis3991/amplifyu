import { useEffect, useRef } from "react";
import { NT_NEURO } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 8 INSIGHT — why stories work, guided by the coach ───────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Opens Week 2.
// Same one-card carousel as Day 7 (see CoachCarousel.jsx): each idea is a
// card the coach moves to at its cue. The closing lines bring in an Up next
// card for Theory. Cue times: see CoachNarration.jsx.
const SRC = "/day8-insight.mp3";
const DURATION = 68;
const CUES = [
  { t: 27.0, card: 0 },     // "First, curiosity."
  { t: 35.7, card: 1 },     // "Then, empathy."
  { t: 45.6, card: 2 },     // "Next, memory."
  { t: 55.0, card: 3 },     // "And finally, action."
  { t: 65.1, next: true },  // "So why do stories work so well? Let's find out."
];

const CARDS = NT_NEURO.map(n => ({ tag: n.word, word: n.sub, bullets: n.bullets }));

export default function D8Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const carousel = useCueCarousel(narration);
  const nextRef = useRef(null);
  const nextLit = playing && cue?.next;

  useEffect(() => {
    if (nextLit) nextRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  return (
    <>
      <CoachStyles />

      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Why Stories Work</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Stories transport your audience into a different world. Facts inform. Stories transform.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Why stories work" style={{ marginBottom: d ? 20 : 16 }} />

      <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, fontStyle: "italic", color: T.gold, lineHeight: 1.7, margin: 0, marginBottom: d ? 24 : 18 }}>Facts explain. Stories move people.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="The Science of Story" sub="How stories reach the brain" onClick={onNext} />
      )}
    </>
  );
}
