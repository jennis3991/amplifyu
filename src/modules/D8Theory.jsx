import { useEffect, useRef } from "react";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 8 THEORY — the science of story, guided by the coach ────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Same one-card
// carousel as the Day 8 Insight (see CoachCarousel.jsx). Sources: Green &
// Brock (2000) on narrative transportation; Paivio (1971) on dual coding.
// The closing line brings in an Up next card for the Example tab. Cue times:
// see CoachNarration.jsx.
const SRC = "/day8-theory.mp3";
const DURATION = 64;
const CUES = [
  { t: 9.3, card: 0 },      // "First, transportation."
  { t: 21.9, card: 1 },     // "Then, mental imagery."
  { t: 33.9, card: 2 },     // "Next, openness."
  { t: 44.4, card: 3 },     // "And finally, this is where it all comes together."
  { t: 62.2, next: true },  // "Let's see some stories in action."
];

const CARDS = [
  { tag: "Transportation", word: "We're inside the story, not just listening.",
    sub: "When a story really draws us in, our attention, imagination and feelings all come together." },
  { tag: "Mental imagery", word: "Stories give us pictures, not just words.",
    sub: "Psychologist Allan Paivio found that we remember information better when it comes with pictures as well as words. Stories create those pictures for us." },
  { tag: "Openness", word: "When people are drawn in, they're more open.",
    sub: "In Green and Brock's research, people who were more absorbed in a story were more likely to take its message on board." },
  { tag: "The convergence", word: "Everything you built in Week 1 shows up here.",
    sub: "Clarity, voice, the pause, short sentences, structure and composure all come together the moment you tell a story." },
];

export default function D8Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 10 : 8 }}>The Science of Story</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, color: T2.text3, lineHeight: 1.6, margin: 0, marginBottom: d ? 18 : 14 }}>Narrative transportation: Green &amp; Brock (2000) · Dual coding: Paivio (1971)</p>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Stories bring attention, imagination and feeling together, which is why a well-placed story can be so persuasive.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="The science of story" style={{ marginBottom: d ? 20 : 16 }} />

      <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, fontStyle: "italic", color: T.gold, lineHeight: 1.7, margin: 0, marginBottom: d ? 24 : 18 }}>Facts get filed away. Stories get felt.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Storytelling in the Wild" sub="Stories that moved people" onClick={onNext} />
      )}
    </>
  );
}
