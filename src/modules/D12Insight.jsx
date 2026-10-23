import { useEffect, useRef } from "react";
import { D12_FACTS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 12 INSIGHT — presence and body language, guided by the coach ────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The cards are
// full statements, so they use the one-card carousel (see CoachCarousel.jsx).
// The closing lines bring in an Up next card for Theory. Cue times: see
// CoachNarration.jsx.
const SRC = "/day12-insight.mp3";
const DURATION = 60;
const CUES = [
  { t: 17.6, card: 0 },     // "First, warmth and ease."
  { t: 28.1, card: 1 },     // "Then, gestures."
  { t: 37.9, card: 2 },     // "Next, calm presence."
  { t: 48.3, card: 3 },     // "And finally, congruence."
  { t: 56.9, next: true },  // "So what happens in the brain when they line up?"
];

export default function D12Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>Why Presence Matters</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>People don't just hear confidence. They see it.</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Body language shapes how communication feels. It helps people feel more connected, engaged and at ease.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={D12_FACTS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Why presence matters" style={{ marginBottom: d ? 20 : 16 }} />

      <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, fontStyle: "italic", color: T.gold, lineHeight: 1.7, margin: 0, marginBottom: d ? 24 : 18 }}>Presence is how communication feels.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Nonverbal Congruence" sub="When words and body language align" onClick={onNext} />
      )}
    </>
  );
}
