import { useEffect, useRef } from "react";
import { D11_FACTS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 11 INSIGHT — perception and signals, guided by the coach ────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The cards are
// full statements, so they use the one-card carousel (see CoachCarousel.jsx).
// The closing lines bring in an Up next card for Theory. Cue times: see
// CoachNarration.jsx.
const SRC = "/day11-insight.mp3";
const DURATION = 71;
const CUES = [
  { t: 19.4, card: 0 },     // "First, first impressions are fast."
  { t: 32.2, card: 1 },     // "Then, people read signals."
  { t: 44.3, card: 2 },     // "Next, stories shape reputation."
  { t: 56.6, card: 3 },     // "And finally, consistency becomes brand."
  { t: 66.5, next: true },  // "So how do people decide who you are so quickly?"
];

export default function D11Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>Why Image Matters</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Perception Is Built From Signals</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Most people let others form assumptions about them by default. The most effective communicators choose their signals intentionally.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={D11_FACTS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Why image matters" style={{ marginBottom: d ? 20 : 16 }} />

      <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, fontStyle: "italic", color: T.gold, lineHeight: 1.7, margin: 0, marginBottom: d ? 24 : 18 }}>Choose the signals you send.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="The Halo Effect" sub="How one strong signal shapes the rest" onClick={onNext} />
      )}
    </>
  );
}
