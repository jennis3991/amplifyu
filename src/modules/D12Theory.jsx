import { useEffect, useRef } from "react";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 12 THEORY — nonverbal congruence, guided by the coach ───────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The four
// findings are a one-card carousel the coach moves through (see
// CoachCarousel.jsx). The closing line brings in an Up next card for the
// Example tab. Cue times: see CoachNarration.jsx.
const SRC = "/day12-theory.mp3";
const DURATION = 62;
const CUES = [
  { t: 23.0, card: 0 },     // "First, thin slicing."
  { t: 31.5, card: 1 },     // "Then, what people see."
  { t: 39.4, card: 2 },     // "Next, gesture and memory."
  { t: 47.3, card: 3 },     // "And finally, trust."
  { t: 58.0, next: true },  // "Now let's look at two moments…"
];

const CARDS = [
  { word: "Thin Slicing", sub: "Research shows people form quick impressions from just a few seconds of nonverbal behaviour." },
  { word: "What People See", sub: "We take in body language at the same time as words, so it shapes how those words land." },
  { word: "Gesture & Memory", sub: "Research suggests purposeful gestures can help listeners understand and remember what you say." },
  { word: "Trust & Congruence", sub: "Communication feels more believable when your words and body language say the same thing." },
];

export default function D12Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Science</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Nonverbal Congruence</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 18 : 14, maxWidth: 640 }}>The brain constantly compares words with body language. When they align, communication feels more authentic and clear.</p>

      <div style={{ padding: d ? "16px 20px" : "12px 14px", background: T2.surface, borderRadius: 4, borderLeft: "2px solid " + T.gold, marginBottom: d ? 20 : 16 }}>
        <p style={{ fontFamily: T.serif, fontSize: d ? 20 : 17, fontStyle: "italic", color: T2.text, lineHeight: 1.5, margin: 0 }}>When people feel at ease, they're more open to the message.</p>
      </div>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Research suggests" style={{ marginBottom: d ? 20 : 16 }} />

      <p style={{ fontFamily: T.serif, fontSize: d ? 18 : 15, fontStyle: "italic", color: T.gold, lineHeight: 1.6, margin: 0, marginBottom: d ? 24 : 18 }}>The body helps people understand the message.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Kennedy vs Nixon & Steve Jobs" sub="Presence in the moment" onClick={onNext} />
      )}
    </>
  );
}
