import { useEffect, useRef } from "react";
import { D7_INSIGHT_CARDS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 7 INSIGHT — Week 1 review, guided by the coach ──────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Unlike other
// days the cards are full statements, so they sit in a one-at-a-time carousel
// (see CoachCarousel.jsx). The closing lines bring in an Up next card for
// Theory. Cue times: see CoachNarration.jsx.
const SRC = "/day7-insight.mp3";
const DURATION = 72;
const CUES = [
  { t: 14.9, card: 0 },     // "First, you practised on purpose."
  { t: 24.0, card: 1 },     // "Then, repetition."
  { t: 33.3, card: 2 },     // "Next, awareness and practice together."
  { t: 43.1, card: 3 },     // "Then, the confidence you admire in others."
  { t: 51.8, card: 4 },     // "And finally, the science."
  { t: 66.6, next: true },  // "So what turns repetition into a habit that sticks?"
];

export default function D7Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>Why Practice Wins</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Most people know how to communicate better. Very few practise until it's automatic.</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>This week, you did something different.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={D7_INSIGHT_CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Week 1 insights" />

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="The Habit Loop" sub="How repetition becomes habit" onClick={onNext} />
      )}
    </>
  );
}
