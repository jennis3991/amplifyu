import { useEffect, useRef, useState } from "react";
import { D7_INSIGHT_CARDS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard, warmLift } from "./CoachNarration.jsx";

// ─── DAY 7 INSIGHT — Week 1 review, guided by the coach ──────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Unlike other
// days the cards are full statements, so they sit in a one-at-a-time carousel:
// the coach moves it on at each cue, and the arrows let the user browse (a
// swipe would clash with the app's swipe between steps). The closing lines
// bring in an Up next card for Theory. Cue times: see CoachNarration.jsx.
const SRC = "/day7-insight.mp3";
const DURATION = 72;
const CUES = [
  { t: 14.9, card: 0 },     // "First, you practised on purpose."
  { t: 24.0, card: 1 },     // "Then, repetition."
  { t: 33.3, card: 2 },     // "Next, awareness and practice together."
  { t: 43.1, card: 3 },     // "Then, the confidence you admire in others."
  { t: 51.8, card: 4 },     // "And finally, the science."
  { t: 66.6, next: true },  // "So what turns repetition into a habit that sticks?"
];

function Arrow({ dir, T2, disabled, onClick, label }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label}
      style={{
        width: 44, height: 44, borderRadius: "50%", flexShrink: 0, padding: 0,
        WebkitAppearance: "none", appearance: "none",
        background: "transparent", border: "1px solid " + T2.border,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1, transition: "opacity 0.2s",
      }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: dir === "prev" ? "rotate(180deg)" : "none" }}>
        <path d="M6 3l5 5-5 5" stroke={T2.text2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function D7Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const [slide, setSlide] = useState(0);
  const carouselRef = useRef(null);
  const nextRef = useRef(null);
  const nextLit = playing && cue?.next;
  const cards = D7_INSIGHT_CARDS;

  // The coach moves the carousel at each card cue; arrows browse in between.
  useEffect(() => {
    if (!playing || !cue) return;
    if (cue.card !== undefined) {
      setSlide(cue.card);
      carouselRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else if (cue.next) {
      nextRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [cueIdx, playing]);

  const d = isDesktop;
  const lift = warmLift(T, T2);
  const narrated = playing && cue?.card === slide;

  return (
    <>
      <CoachStyles />

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>Why Practice Wins</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Most people know how to communicate better. Very few practise until it's automatic.</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>This week, you did something different.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <div ref={carouselRef} className="au-coach-lit" role="region" aria-roledescription="carousel" aria-label="Week 1 insights"
        style={{ marginBottom: d ? 28 : 22 }}>
        <div style={{ overflow: "hidden", borderRadius: d ? 6 : 10 }}>
          <div style={{ display: "flex", transform: `translateX(-${slide * 100}%)`, transition: "transform 0.45s ease" }}>
            {cards.map((n, i) => {
              const lit = narrated && i === slide;
              return (
                <div key={i} aria-hidden={i !== slide} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${cards.length}`}
                  style={{ flex: "0 0 100%", minWidth: 0, display: "flex" }}>
                  <div style={{
                    flex: 1, padding: d ? "32px 36px" : "22px 20px", borderRadius: d ? 6 : 10,
                    background: lit ? lift.bg : T2.surface,
                    border: "1px solid " + (lit ? lift.border : T2.border),
                    boxShadow: lit ? lift.shadow : "none",
                    transition: "background 0.35s, border-color 0.35s, box-shadow 0.35s",
                  }}>
                    <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T2.text4, letterSpacing: "1.5px", marginBottom: d ? 14 : 10 }}>{String(i + 1).padStart(2, "0")}</div>
                    <div style={{ fontFamily: T.serif, fontSize: d ? 30 : 24, fontWeight: 600, color: T.gold, lineHeight: 1.2, marginBottom: d ? 14 : 12 }}>{n.word}</div>
                    <p style={{ fontFamily: T.sans, fontSize: d ? 17 : 15, color: T2.text2, lineHeight: 1.55, fontWeight: 400, margin: 0, marginBottom: d ? 20 : 16 }}>{n.sub}</p>
                    <div style={{ borderTop: "0.5px solid " + T2.divider, paddingTop: d ? 16 : 14, display: "flex", flexDirection: "column", gap: 10 }}>
                      {n.bullets.map((b, j) => (
                        <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.gold, flexShrink: 0, marginTop: 8 }} />
                          <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, color: T2.text, lineHeight: 1.6, fontWeight: 400, margin: 0 }}>{b}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: d ? 16 : 14 }}>
          <Arrow dir="prev" T2={T2} label="Previous insight" disabled={slide === 0} onClick={() => setSlide(s => Math.max(0, s - 1))} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }} aria-live="polite">
            {cards.map((_, i) => (
              <span key={i} aria-hidden="true" style={{ width: i === slide ? 18 : 6, height: 6, borderRadius: 3, background: i === slide ? T.gold : T2.border, transition: "all 0.3s" }} />
            ))}
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T2.text3, marginLeft: 6, fontVariantNumeric: "tabular-nums" }}>{slide + 1} / {cards.length}</span>
          </div>
          <Arrow dir="next" T2={T2} label="Next insight" disabled={slide === cards.length - 1} onClick={() => setSlide(s => Math.min(cards.length - 1, s + 1))} />
        </div>
      </div>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="The Habit Loop" sub="How repetition becomes habit" onClick={onNext} />
      )}
    </>
  );
}
