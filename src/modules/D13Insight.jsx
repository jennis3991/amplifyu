import { useEffect, useRef } from "react";
import { D13_INSIGHT_CARDS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 13 INSIGHT — exposure and visibility, guided by the coach ────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The cards are
// full statements, so they use the one-card carousel (see CoachCarousel.jsx).
// The closing lines bring in an Up next card for Theory. Cue times: see
// CoachNarration.jsx.
const SRC = "/day13-insight.mp3";
const DURATION = 62;
const CUES = [
  { t: 20.4, card: 0 },     // "First, great work isn't enough on its own."
  { t: 26.8, card: 1 },     // "Then, opportunities travel through people."
  { t: 39.1, card: 2 },     // "Next, visibility builds on itself."
  { t: 46.5, card: 3 },     // "And finally, your ambition has to be visible."
  { t: 57.4, next: true },  // "So why does visibility shape careers so much?"
];

export default function D13Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Career Multiplier</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Communication creates capability. Exposure creates opportunity.</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>The most talented professionals are not always the most successful. The ones who advance are the ones whose value is seen.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={D13_INSIGHT_CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="The career multiplier" style={{ marginBottom: d ? 20 : 16 }} />

      <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, fontStyle: "italic", color: T.gold, lineHeight: 1.7, margin: 0, marginBottom: d ? 24 : 18 }}>Performance creates value. Brand creates reputation. Exposure creates opportunity.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Why Visibility Shapes Careers" sub="The science of exposure" onClick={onNext} />
      )}
    </>
  );
}
