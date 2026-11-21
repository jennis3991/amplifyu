import { useEffect, useRef } from "react";
import { D3_FACTS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 3 INSIGHT — filler-free speech, guided by the coach ─────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Same one-card
// carousel as Week 2 (see CoachCarousel.jsx): the coach moves to each card at
// its cue; the closing lines bring in an Up next card for the Theory tab
// (The Cognitive Load Principle). Cue times: see CoachNarration.jsx.
const SRC = "/day3-insight.mp3";
const DURATION = 53;
const CUES = [
  { t: 18.3, card: 0 },     // "First, trust."
  { t: 24.5, card: 1 },     // "Then, authority."
  { t: 30.8, card: 2 },     // "Next, attention."
  { t: 37.7, card: 3 },     // "And finally, memory."
  // "Let's find out." lands ~3s from the end, so the hand-off starts at the
  // closing lines before it.
  { t: 45.0, next: true },  // "Fewer fillers, more presence…"
];

// Big statement on each card, idea name as the small label (as Week 2).
const CARDS = D3_FACTS.map(n => ({ tag: n.word, word: n.sub, bullets: n.bullets }));

export default function D3Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 12 : 8 }}>Master Filler-Free Speech</h2>
      <p style={{ fontFamily: T.serif, fontSize: d ? 24 : 20, fontStyle: "italic", color: T2.goldDark, lineHeight: 1.35, margin: 0, marginBottom: d ? 14 : 10 }}>Most people are far stronger speakers than they realise.</p>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Filler words are often just an unconscious habit, and removing them is one of the fastest ways to elevate your credibility, authority and influence.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Why filler-free speech works" />

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="The Cognitive Load Principle" sub="Why fillers happen" onClick={onNext} />
      )}
    </>
  );
}
