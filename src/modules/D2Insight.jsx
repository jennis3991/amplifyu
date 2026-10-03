import { useEffect, useRef } from "react";
import { D2_INSIGHT_CARDS } from "../data.js";
import { useCoachNarration, useCueCards, CoachButton, CoachCardGrid, CoachStyles, UpNextCard } from "./CoachNarration.jsx";

// ─── DAY 2 INSIGHT — voice and delivery, guided by the coach ─────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Each card opens
// as the coach reaches it; the closing lines bring in an Up next card for the
// Theory tab (The 88 Keys). Cue times: see CoachNarration.jsx.
const SRC = "/day2-insight.mp3";
const DURATION = 74;
const CUES = [
  { t: 14.4, card: 0 },     // "First, attention."
  { t: 27.5, card: 1 },     // "Then, first impressions."
  { t: 37.6, card: 2 },     // "Next, memory."
  { t: 47.5, card: 3 },     // "And finally, influence."
  // "Let's start with the 88 keys." lands 2s from the end, so the hand-off
  // starts at the closing statement before it.
  { t: 65.0, next: true },  // "Your voice is one of your most powerful communication tools…"
];

export default function D2Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const cueCards = useCueCards(cueIdx, cue);
  const nextRef = useRef(null);
  const nextLit = playing && cue?.next;

  // Bring the narrated card (or the Up next card) into view as each cue fires.
  useEffect(() => {
    if (!playing || !cue) return;
    const el = cue.next ? nextRef.current : cueCards.refs.current[cue.card];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  return (
    <>
      <CoachStyles />

      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 12 : 8 }}>The Way You Speak Changes the Way People Listen</h2>
      <p style={{ fontFamily: T.serif, fontSize: d ? 24 : 20, fontStyle: "italic", color: T2.goldDark, lineHeight: 1.35, margin: 0, marginBottom: d ? 14 : 10 }}>Your voice is your most underused communication tool. Start using it deliberately.</p>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 600 }}>Your voice is communicating before your words have had a chance to.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCardGrid T={T} T2={T2} isDesktop={d} cards={D2_INSIGHT_CARDS} cueCards={cueCards} />

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="The 88 Keys" sub="The science of vocal influence" onClick={onNext} />
      )}
    </>
  );
}
