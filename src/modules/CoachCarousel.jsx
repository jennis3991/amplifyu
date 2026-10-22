import { useEffect, useRef, useState } from "react";
import { warmLift } from "./CoachNarration.jsx";

// ─── COACH CAROUSEL ─────────────────────────────────────────────────────────
// One large card at a time, for screens whose cards are full statements
// (the Week 1 review, Day 7). The coach moves it on at each card cue; the
// arrows let the user browse in between. No swipe: it would clash with the
// app's swipe between steps.
// Cards: [{ word, sub, bullets?, tag?, foot? }]. foot is a takeaway line under
// the bullets. Cues reference cards by index.

// Follows the narration: jumps to the narrated card at each cue and brings
// the carousel into view. Returns the slide state plus a ref for the region.
export function useCueCarousel({ playing, cueIdx, cue }) {
  const [slide, setSlide] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!playing || !cue || cue.card === undefined) return;
    setSlide(cue.card);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);
  return { slide, setSlide, ref };
}

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

export function CoachCarousel({ T, T2, isDesktop: d, cards, carousel, litIndex, label, style }) {
  const { slide, setSlide, ref } = carousel;
  const lift = warmLift(T, T2);
  return (
    <div ref={ref} className="au-coach-lit" role="region" aria-roledescription="carousel" aria-label={label}
      style={{ marginBottom: d ? 28 : 22, ...style }}>
      <div style={{ overflow: "hidden", borderRadius: d ? 6 : 10 }}>
        <div style={{ display: "flex", transform: `translateX(-${slide * 100}%)`, transition: "transform 0.45s ease" }}>
          {cards.map((n, i) => {
            const lit = litIndex === i;
            const num = String(i + 1).padStart(2, "0");
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
                  <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: n.tag ? T.gold : T2.text4, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 14 : 10 }}>{n.tag ? `${num} · ${n.tag}` : num}</div>
                  <div style={{ fontFamily: T.serif, fontSize: d ? 30 : 24, fontWeight: 600, color: T.gold, lineHeight: 1.2, marginBottom: d ? 14 : 12 }}>{n.word}</div>
                  {n.sub && <p style={{ fontFamily: T.sans, fontSize: d ? 17 : 15, color: T2.text2, lineHeight: 1.55, fontWeight: 400, margin: 0, marginBottom: n.bullets?.length ? (d ? 20 : 16) : 0 }}>{n.sub}</p>}
                  {n.bullets?.length > 0 && (
                    <div style={{ borderTop: "0.5px solid " + T2.divider, paddingTop: d ? 16 : 14, display: "flex", flexDirection: "column", gap: 10 }}>
                      {n.bullets.map((b, j) => (
                        <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.gold, flexShrink: 0, marginTop: 8 }} />
                          <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, color: T2.text, lineHeight: 1.6, fontWeight: 400, margin: 0 }}>{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {n.foot && <div style={{ fontFamily: T.sans, fontSize: d ? 15 : 14, fontWeight: 600, color: T.gold, marginTop: d ? 18 : 14 }}>→ {n.foot}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: d ? 16 : 14 }}>
        <Arrow dir="prev" T2={T2} label="Previous card" disabled={slide === 0} onClick={() => setSlide(s => Math.max(0, s - 1))} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} aria-live="polite">
          {cards.map((_, i) => (
            <span key={i} aria-hidden="true" style={{ width: i === slide ? 18 : 6, height: 6, borderRadius: 3, background: i === slide ? T.gold : T2.border, transition: "all 0.3s" }} />
          ))}
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T2.text3, marginLeft: 6, fontVariantNumeric: "tabular-nums" }}>{slide + 1} / {cards.length}</span>
        </div>
        <Arrow dir="next" T2={T2} label="Next card" disabled={slide === cards.length - 1} onClick={() => setSlide(s => Math.min(cards.length - 1, s + 1))} />
      </div>
    </div>
  );
}
