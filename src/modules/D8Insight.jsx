import { useEffect, useRef, useState } from "react";
import { NT_NEURO } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";

// ─── DAY 8 INSIGHT — why stories work, told as a storybook ───────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Storytelling
// day gets its own format: a small book (cover, four pages, closing page)
// whose pages turn as the coach reaches each idea. Arrows turn pages by hand;
// no swipe, which would clash with the app's swipe between steps. With
// reduced motion the pages fade instead of turning. Cue times: see
// CoachNarration.jsx.
const SRC = "/day8-insight.mp3";
const DURATION = 68;
const CUES = [
  { t: 27.0, card: 1 },     // "First, curiosity."
  { t: 35.7, card: 2 },     // "Then, empathy."
  { t: 45.6, card: 3 },     // "Next, memory."
  { t: 55.0, card: 4 },     // "And finally, action."
  { t: 61.8, card: 5 },     // "Facts explain. Stories move people."
  { t: 65.1, next: true },  // "So why do stories work so well? Let's find out."
];
const PAGES = NT_NEURO.length + 2; // cover + one page per idea + closing page
const TURN_MS = 700;

function paper(T, T2) {
  const dark = T2.bg !== T.bg;
  return dark
    ? { page: "#2C2720", edge: "#3A332A", ink: "#EDE6DA", soft: "rgba(237,230,218,0.7)", spine: "rgba(0,0,0,0.45)", shadow: "0 18px 40px rgba(0,0,0,0.5)" }
    : { page: "#FBF7EF", edge: "#E9E0CF", ink: "#2C2416", soft: "#6B5E4C", spine: "rgba(44,36,22,0.16)", shadow: "0 18px 40px rgba(44,36,22,0.14), 0 2px 6px rgba(44,36,22,0.08)" };
}

function PageContent({ i, T, P, d }) {
  const center = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", height: "100%" };
  if (i === 0) return (
    <div style={center}>
      <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: T.gold, marginBottom: d ? 18 : 14 }}>Chapter 8</div>
      <div style={{ fontFamily: T.serif, fontSize: d ? 44 : 34, fontWeight: 600, color: P.ink, lineHeight: 1.1, marginBottom: d ? 18 : 14 }}>The Power<br />of Story</div>
      <div style={{ width: 48, height: 1, background: T.gold, opacity: 0.6, marginBottom: d ? 18 : 14 }} />
      <div style={{ fontFamily: T.serif, fontStyle: "italic", fontSize: d ? 17 : 15, color: P.soft }}>Four reasons stories move people</div>
    </div>
  );
  if (i === PAGES - 1) return (
    <div style={center}>
      <div style={{ fontFamily: T.serif, fontSize: d ? 34 : 27, fontWeight: 600, fontStyle: "italic", color: P.ink, lineHeight: 1.25, maxWidth: 420 }}>Facts explain.<br />Stories move people.</div>
      <div aria-hidden="true" style={{ fontFamily: T.serif, fontSize: 22, color: T.gold, marginTop: d ? 22 : 18, letterSpacing: "8px" }}>· · ·</div>
    </div>
  );
  const n = NT_NEURO[i - 1];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: T.gold, marginBottom: d ? 16 : 12 }}>{n.word}</div>
      <p style={{ fontFamily: T.serif, fontSize: d ? 24 : 20, color: P.ink, lineHeight: 1.4, margin: 0, marginBottom: d ? 20 : 16 }}>
        <span aria-hidden="true" style={{ float: "left", fontFamily: T.serif, fontSize: d ? 66 : 54, lineHeight: 0.85, fontWeight: 600, color: T.gold, margin: "4px 10px 0 0" }}>{n.sub[0]}</span>
        <span className="au-sr-only">{n.sub[0]}</span>{n.sub.slice(1)}
      </p>
      {n.bullets.map((b, j) => (
        <p key={j} style={{ fontFamily: T.serif, fontSize: d ? 17 : 15, color: P.soft, lineHeight: 1.6, margin: 0, marginBottom: 10 }}>{b}</p>
      ))}
    </div>
  );
}

function Arrow({ dir, T2, disabled, onClick, label }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label}
      style={{
        width: 44, height: 44, borderRadius: "50%", flexShrink: 0, padding: 0,
        WebkitAppearance: "none", appearance: "none", background: "transparent", border: "1px solid " + T2.border,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1, transition: "opacity 0.2s",
      }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: dir === "prev" ? "rotate(180deg)" : "none" }}>
        <path d="M6 3l5 5-5 5" stroke={T2.text2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function D8Insight({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  // page: the page now showing. turning: the page being turned away (forward)
  // or turned back into place (back), animated over the top of it.
  const [page, setPage] = useState(0);
  const [turning, setTurning] = useState(null); // { from, dir }
  const timer = useRef(null);
  const bookRef = useRef(null);
  const nextRef = useRef(null);
  const nextLit = playing && cue?.next;

  function goTo(target) {
    if (target === page || target < 0 || target >= PAGES) return;
    clearTimeout(timer.current);
    setTurning({ from: page, dir: target > page ? "fwd" : "back" });
    setPage(target);
    timer.current = setTimeout(() => setTurning(null), TURN_MS);
  }
  useEffect(() => () => clearTimeout(timer.current), []);

  // The coach turns to each idea's page at its cue.
  useEffect(() => {
    if (!playing || !cue) return;
    if (cue.card !== undefined) {
      goTo(cue.card);
      bookRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else if (cue.next) {
      nextRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [cueIdx, playing]);

  const d = isDesktop;
  const P = paper(T, T2);
  const pageBox = {
    position: "absolute", inset: 0, padding: d ? "44px 48px 40px 56px" : "30px 26px 30px 34px",
    background: P.page, borderRadius: "4px 12px 12px 4px",
    // Spine shading on the bound (left) edge.
    backgroundImage: `linear-gradient(to right, ${P.spine}, transparent 9%)`,
    backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
    transformOrigin: "left center",
  };
  const folio = n => n > 0 && n < PAGES - 1 && (
    <div style={{ position: "absolute", bottom: d ? 18 : 14, left: 0, right: 0, textAlign: "center", fontFamily: T.serif, fontSize: 13, color: P.soft, opacity: 0.8 }}>{n}</div>
  );

  // Forward: the old page swings away over the new one. Back: the new page
  // swings back into place over the old one.
  const under = turning?.dir === "fwd" ? page : turning?.dir === "back" ? turning.from : page;
  const over = turning?.dir === "fwd" ? turning.from : turning?.dir === "back" ? page : null;
  const overAnim = turning?.dir === "fwd" ? "au-page-out" : "au-page-in";

  return (
    <>
      <CoachStyles />
      <style>{`
        @keyframes au-page-out { from { transform: rotateY(0deg); filter: brightness(1); } to { transform: rotateY(-90deg); filter: brightness(0.82); } }
        @keyframes au-page-in { from { transform: rotateY(-90deg); filter: brightness(0.82); } to { transform: rotateY(0deg); filter: brightness(1); } }
        @keyframes au-page-fade { from { opacity: 1; } to { opacity: 0; } }
        @keyframes au-page-fadein { from { opacity: 0; } to { opacity: 1; } }
        .au-sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        @media (prefers-reduced-motion: reduce) {
          .au-page-turn.au-page-out { animation-name: au-page-fade !important; }
          .au-page-turn.au-page-in { animation-name: au-page-fadein !important; }
        }
      `}</style>

      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>Why Stories Work</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 640 }}>Stories transport your audience into a different world. Facts inform. Stories transform.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <div ref={bookRef} className="au-coach-lit" role="region" aria-roledescription="book" aria-label="Why stories work" style={{ marginBottom: d ? 28 : 22 }}>
        <div style={{ position: "relative", height: d ? 440 : 400, maxWidth: d ? 620 : "none", perspective: 1800 }}>
          {/* Page edges peeking out behind, so it reads as a book. */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, transform: "translate(6px, 6px)", background: P.edge, borderRadius: "4px 12px 12px 4px" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, transform: "translate(3px, 3px)", background: P.page, borderRadius: "4px 12px 12px 4px", boxShadow: P.shadow, borderRight: "1px solid " + P.edge }} />

          <div key={"u" + under} aria-live="polite" style={pageBox}>
            <PageContent i={under} T={T} P={P} d={d} />
            {folio(under)}
          </div>
          {over !== null && (
            <div key={"o" + over + turning.dir} aria-hidden="true" className={"au-page-turn " + overAnim}
              style={{ ...pageBox, zIndex: 2, animation: `${overAnim} ${TURN_MS}ms cubic-bezier(0.45, 0.05, 0.3, 1) both`, boxShadow: "-8px 0 24px rgba(0,0,0,0.12)" }}>
              <PageContent i={over} T={T} P={P} d={d} />
              {folio(over)}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: d ? 18 : 16, maxWidth: d ? 620 : "none" }}>
          <Arrow dir="prev" T2={T2} label="Previous page" disabled={page === 0} onClick={() => goTo(page - 1)} />
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T2.text3, fontVariantNumeric: "tabular-nums" }}>
            {page === 0 ? "Cover" : page === PAGES - 1 ? "The end" : `Page ${page} of ${PAGES - 2}`}
          </span>
          <Arrow dir="next" T2={T2} label="Next page" disabled={page === PAGES - 1} onClick={() => goTo(page + 1)} />
        </div>
      </div>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="The Science of Story" sub="How stories reach the brain" onClick={onNext} />
      )}
    </>
  );
}
