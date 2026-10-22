import { useEffect, useRef } from "react";
import { D10_FACTS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 10 INSIGHT — visibility, guided by the coach ────────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The cards are
// full statements, so they use the one-card carousel (see CoachCarousel.jsx).
// Coleman's PIE model is presented as a model, not a research finding. The
// closing lines bring in an Up next card for Theory. Cue times: see
// CoachNarration.jsx.
const SRC = "/day10-insight.mp3";
const DURATION = 68;
const CUES = [
  { t: 21.7, card: 0 },     // "First, hard work is often invisible."
  { t: 34.6, card: 1 },     // "Then, people can only judge what they can see."
  { t: 41.8, card: 2 },     // "Next, visibility isn't vanity."
  { t: 52.2, card: 3 },     // "And finally, doing great work and being recognised…"
  { t: 63.3, next: true },  // "So, how much does visibility really matter?"
];

export default function D10Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>Why Visibility Matters</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Great work does not automatically create visibility.</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>In his PIE model, Harvey Coleman suggested that performance accounts for around 10% of career advancement, with image and exposure making up the rest. This session focuses on those.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={D10_FACTS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Why visibility matters" style={{ marginBottom: d ? 20 : 16 }} />

      <div style={{ padding: d ? "16px 20px" : "14px 16px", background: "rgba(138,158,132,0.08)", borderRadius: 4, borderLeft: "3px solid " + T.gold, marginBottom: d ? 24 : 18 }}>
        <p style={{ fontFamily: T.serif, fontSize: d ? 18 : 16, fontStyle: "italic", color: T2.text, lineHeight: 1.6, margin: 0 }}>Invisible excellence does not scale. Visibility is not self-promotion. It is communication.</p>
      </div>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="The Performance Iceberg" sub="Performance, image and exposure" onClick={onNext} />
      )}
    </>
  );
}
