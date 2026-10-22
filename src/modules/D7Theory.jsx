import { useEffect, useRef } from "react";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 7 THEORY — the habit loop, guided by the coach ──────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Same one-card
// carousel as the Day 7 Insight: cue, routine, reward, then repeat. The loop
// strip above lights the step the carousel is on. The closing line brings in
// an Up next card for the Example tab. Cue times: see CoachNarration.jsx.
const SRC = "/day7-theory.mp3";
const DURATION = 55;
const CUES = [
  { t: 11.3, card: 0 },     // "First, the cue."
  { t: 18.8, card: 1 },     // "Then, the routine."
  { t: 31.2, card: 2 },     // "And finally, the reward."
  { t: 40.3, card: 3 },     // "Repeat the loop often enough…"
  { t: 51.1, next: true },  // "Now, let's look back at the six foundations…"
];

const LOOP = [
  { label: "Cue", desc: "The trigger" },
  { label: "Routine", desc: "The behaviour" },
  { label: "Reward", desc: "The signal" },
];

const CARDS = [
  { tag: "Cue", word: "The trigger", sub: "A moment of pressure, a conversation, a question you weren't expecting. That became the trigger." },
  { tag: "Routine", word: "The behaviour", sub: "A new behaviour. Pausing instead of filling. Leading with your point. Slowing down. Simplifying. That became the response." },
  { tag: "Reward", word: "The signal", sub: "A sense of clarity, control or progress. That became the signal your brain learned to seek." },
  { tag: "Repeat", word: "The result", sub: "Repeat the loop often enough and behaviour becomes automatic. Not through willpower. Through repetition.",
    bullets: ["You stop trying to communicate well. You simply do.", "That's the difference between learning a technique and building a skill."] },
];

export default function D7Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
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
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 10 : 8 }}>The Habit Loop</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, color: T2.text3, lineHeight: 1.6, margin: 0, marginBottom: d ? 18 : 14 }}>Charles Duhigg, <em>The Power of Habit</em> (2012)</p>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 16 : 14, maxWidth: 640 }}>Every habit, good or bad, follows the same loop:</p>

      {/* Cue → Routine → Reward overview; the step the carousel is on stays lit. */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: d ? 24 : 18, maxWidth: d ? 560 : "none" }}>
        {LOOP.map((n, i) => {
          const on = carousel.slide === i || carousel.slide === 3;
          return (
            <div key={n.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ flex: 1, padding: d ? "14px 12px" : "12px 8px", borderRadius: 6, textAlign: "center",
                background: on ? "rgba(138,158,132,0.16)" : "rgba(138,158,132,0.06)",
                border: "0.5px solid " + (on ? "rgba(82,112,96,0.45)" : "rgba(138,158,132,0.25)"),
                transition: "background 0.3s, border-color 0.3s" }}>
                <div style={{ fontFamily: T.serif, fontSize: d ? 16 : 14, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{n.label}</div>
                <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 10, color: T2.text3 }}>{n.desc}</div>
              </div>
              {i < LOOP.length - 1 && <div aria-hidden="true" style={{ padding: "0 6px", color: T2.text4, fontSize: 14 }}>→</div>}
            </div>
          );
        })}
      </div>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="The habit loop" />

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Your Week 1 Foundations" sub="Six habits, one week" onClick={onNext} />
      )}
    </>
  );
}
