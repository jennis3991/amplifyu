import { useEffect, useRef } from "react";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 10 THEORY — the performance iceberg, guided by the coach ────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Five cards in
// the one-card carousel (see CoachCarousel.jsx): above and below the
// waterline, then three principles. Attribution theory (Heider, 1958) is
// explained in plain words, not quoted. Cue times: see CoachNarration.jsx.
const SRC = "/day10-theory.mp3";
const DURATION = 71;
const CUES = [
  { t: 19.1, card: 0 },     // "First, above the waterline."
  { t: 28.0, card: 1 },     // "Then, below the waterline."
  { t: 39.2, card: 2 },     // "Next, excellence is your foundation…"
  { t: 50.2, card: 3 },     // "Then, visibility is a communication skill."
  { t: 56.8, card: 4 },     // "And finally, focus on the vital few."
  { t: 67.3, next: true },  // "Let's see how two leaders made their performance count."
];

const CARDS = [
  { tag: "Above the waterline", word: "What people see.",
    bullets: ["Outcomes they hear about", "Moments you speak up", "Visible ownership of results", "Strategic contributions you name"] },
  { tag: "Below the waterline", word: "What often goes unseen.",
    bullets: ["Late nights and early starts", "Quiet firefighting", "Invisible support work", "Emotional labour and relationship management"] },
  { tag: "Principle", word: "Excellence is your foundation, not your ceiling.",
    sub: "Performance earns you the right to be in the room. On its own, it doesn't guarantee the promotion, the project or the recognition.",
    bullets: ["Visibility without substance is noise.", "Substance without visibility is invisible."] },
  { tag: "Principle", word: "Visibility is a communication skill.",
    sub: "It isn't bragging, self-promotion or ego.",
    bullets: ["It's creating clarity.", "It's helping others understand your impact.", "Strong leaders make it a habit."] },
  { tag: "Principle", word: "Focus on the vital few.",
    sub: "Not all work is equal. The work that matters is the work visible to the people who shape your future.",
    bullets: ["Excelling at things nobody notices is an expensive trap."] },
];

export default function D10Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>The Performance Iceberg</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 20 : 16, maxWidth: 640 }}>Most professionals assume their effort speaks for itself. Often, it doesn't.</p>
      <div style={{ padding: d ? "18px 22px" : "16px 18px", background: T2.surface, borderRadius: 4, borderLeft: "3px solid " + T.gold, marginBottom: d ? 24 : 18 }}>
        <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, color: T2.text, lineHeight: 1.6, margin: 0 }}>Attribution theory (Fritz Heider, 1958) explains how people work out the causes of what they see. When they can't see your contribution, they may put results down to luck, the team or circumstances. Visibility closes that gap.</p>
      </div>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="The performance iceberg" />

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Performance in Action" sub="James Dyson & Jeff Bezos" onClick={onNext} />
      )}
    </>
  );
}
