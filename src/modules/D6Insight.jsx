import { useEffect, useRef } from "react";
import { D6_FACTS } from "../data.js";
import { useCoachNarration, useCueCards, CoachButton, CoachCardGrid, CoachStyles, UpNextCard } from "./CoachNarration.jsx";

// ─── DAY 6 INSIGHT — composure, guided by the coach ──────────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Each card opens
// as the coach reaches it; the closing lines bring in an Up next card for the
// Theory tab. Cue times: see CoachNarration.jsx.
const SRC = "/day6-insight.mp3";
const DURATION = 64;
const CUES = [
  { t: 18.2, card: 0 },     // "First, emotion."
  { t: 28.4, card: 1 },     // "Then, perception."
  { t: 35.2, card: 2 },     // "Next, influence."
  { t: 46.5, card: 3 },     // "And finally, outcome."
  { t: 55.5, next: true },  // "Composure is communication under pressure…"
];

export default function D6Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>Why Composure Wins</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Stay Calm Under Pressure</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Most people communicate well when conversations are easy. But leadership, trust, and reputation are often shaped in moments of tension.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCardGrid T={T} T2={T2} isDesktop={d} cards={D6_FACTS} cueCards={cueCards} />

      <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, fontStyle: "italic", color: T.gold, lineHeight: 1.7, margin: d ? "24px 0 0" : "18px 0 0" }}>Composure is communication under pressure.</p>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="What Happens Under Pressure" sub="The science of composure" onClick={onNext} />
      )}
    </>
  );
}
