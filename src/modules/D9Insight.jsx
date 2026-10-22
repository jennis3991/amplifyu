import { useEffect, useRef } from "react";
import { D9_INSIGHT_CARDS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 9 INSIGHT — connection, guided by the coach ─────────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The cards are
// full statements, so they use the one-card carousel (see CoachCarousel.jsx),
// moved on at each cue. The closing lines bring in an Up next card for
// Theory. Cue times: see CoachNarration.jsx.
const SRC = "/day9-insight.mp3";
const DURATION = 67;
const CUES = [
  { t: 14.8, card: 0 },     // "First, feelings last."
  { t: 23.9, card: 1 },     // "Then, listening."
  { t: 33.6, card: 2 },     // "Next, great questions."
  { t: 44.5, card: 3 },     // "And finally, empathy."
  { t: 62.5, next: true },  // "So why do some people make everyone feel understood?"
];

export default function D9Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Missing Skill</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>How to make people feel understood.</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Most people focus on what they want to say. Great communicators focus on understanding the person in front of them.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={D9_INSIGHT_CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="How to make people feel understood" style={{ marginBottom: d ? 20 : 16 }} />

      <p style={{ fontFamily: T.serif, fontSize: d ? 19 : 17, fontStyle: "italic", color: T2.text, lineHeight: 1.55, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Connection is not about having the perfect thing to say. It's about creating an environment where others feel comfortable sharing theirs.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="The Science of Connection" sub="Why some people make everyone feel understood" onClick={onNext} />
      )}
    </>
  );
}
