import { useEffect, useRef } from "react";
import { D14_INSIGHT_CARDS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 14 INSIGHT — the final day, guided by the coach ─────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The coach opens
// the final day, then the cards are a one-card carousel (see CoachCarousel.jsx).
// The closing lines bring in an Up next card for Theory. Cue times: see
// CoachNarration.jsx.
const SRC = "/day14-insight.mp3";
const DURATION = 80;
const CUES = [
  { t: 38.5, card: 0 },     // "First, you've built more than skills."
  { t: 48.8, card: 1 },     // "Then, confidence is earned."
  { t: 56.4, card: 2 },     // "Next, communication changes careers."
  { t: 66.4, card: 3 },     // "And finally, this is only the beginning."
  { t: 75.8, next: true },  // "So, where does confidence really come from?"
];

export default function D14Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const carousel = useCueCarousel(narration);
  const nextRef = useRef(null);
  const nextLit = playing && cue?.next;

  useEffect(() => {
    if (nextLit) nextRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  const body = { fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, maxWidth: 640 };
  return (
    <>
      <CoachStyles />

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>Day 14 · The Final Chapter</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Amplified.</h2>
      <p style={{ ...body, marginBottom: d ? 12 : 10 }}>Over the last 14 days, you've developed skills that many people spend years trying to master.</p>
      <p style={{ ...body, marginBottom: d ? 24 : 18 }}>Clarity. Voice. Storytelling. Presence. Brand. Exposure. These are not isolated techniques. Every story you tell supports your brand. Every conversation shapes your reputation. Every interaction contributes to your performance, image, and ambition.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={D14_INSIGHT_CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Your fourteen days" style={{ marginBottom: d ? 20 : 16 }} />

      <p style={{ fontFamily: T.serif, fontSize: d ? 18 : 15, fontStyle: "italic", color: T.gold, lineHeight: 1.6, margin: 0, marginBottom: d ? 24 : 18 }}>Today is not about learning something new. It's about recognising how far you've come and creating a plan for where you go next.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="The Competence–Confidence Loop" sub="Where confidence really comes from" onClick={onNext} />
      )}
    </>
  );
}
