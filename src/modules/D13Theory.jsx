import { useEffect, useRef } from "react";
import { D13_THEORY_CARDS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 13 THEORY — why visibility shapes careers, guided by the coach ──────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The four ideas
// are a one-card carousel the coach moves through (see CoachCarousel.jsx).
// PIE is presented as Coleman's model, not a research finding. The closing
// line brings in an Up next card for the Example tab. Cue times: see
// CoachNarration.jsx.
const SRC = "/day13-theory.mp3";
const DURATION = 67;
const CUES = [
  { t: 6.1, card: 0 },      // "First, the PIE model."
  { t: 23.0, card: 1 },     // "Then, the mere exposure effect."
  { t: 35.1, card: 2 },     // "Next, weak ties."
  { t: 49.5, card: 3 },     // "And finally, sponsorship."
  { t: 65.0, next: true },  // "Now let's see how this works in real life."
];

export default function D13Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Science of Exposure</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Why visibility shapes careers</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Four ideas that explain how exposure helps careers grow.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={D13_THEORY_CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Why visibility shapes careers" style={{ marginBottom: d ? 20 : 16 }} />

      <p style={{ fontFamily: T.serif, fontSize: d ? 18 : 15, fontStyle: "italic", color: T.gold, lineHeight: 1.6, margin: 0, marginBottom: d ? 24 : 18 }}>Exposure is how sponsors find you.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Michelle Obama & Jamie Oliver" sub="Exposure in real life" onClick={onNext} />
      )}
    </>
  );
}
