import { useEffect, useRef } from "react";
import { D2_INSIGHT_CARDS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 2 INSIGHT — voice and delivery, guided by the coach ─────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Same one-card
// carousel as Week 2 (see CoachCarousel.jsx): the coach moves to each card at
// its cue; the closing lines bring in an Up next card for the Theory tab
// (The 88 Keys). Cue times: see CoachNarration.jsx.
const SRC = "/day2-insight.mp3";
const DURATION = 74;
const CUES = [
  { t: 14.4, card: 0 },     // "First, attention."
  { t: 27.5, card: 1 },     // "Then, first impressions."
  { t: 37.6, card: 2 },     // "Next, memory."
  { t: 47.5, card: 3 },     // "And finally, influence."
  // "Let's start with the 88 keys." lands 2s from the end, so the hand-off
  // starts at the closing statement before it.
  { t: 65.0, next: true },  // "Your voice is one of your most powerful communication tools…"
];

// Big statement on each card, idea name as the small label (as Week 2).
const CARDS = D2_INSIGHT_CARDS.map(n => ({ tag: n.word, word: n.sub, bullets: n.bullets }));

export default function D2Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 12 : 8 }}>The Way You Speak Changes the Way People Listen</h2>
      <p style={{ fontFamily: T.serif, fontSize: d ? 24 : 20, fontStyle: "italic", color: T2.goldDark, lineHeight: 1.35, margin: 0, marginBottom: d ? 14 : 10 }}>Your voice is your most underused communication tool. Start using it deliberately.</p>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 600 }}>Your voice is communicating before your words have had a chance to.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Why your voice matters" />

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="The 88 Keys" sub="The science of vocal influence" onClick={onNext} />
      )}
    </>
  );
}
