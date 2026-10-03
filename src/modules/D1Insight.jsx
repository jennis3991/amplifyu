import { useState, useEffect, useRef } from "react";
import { D1_CLARITY_FACTS_DATA } from "../data.js";

// ─── DAY 1 INSIGHT — guided, voice-synced clarity cards ──────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The coach
// narration drives the screen: as the voice reaches each card it opens and
// glows, then the hand-off line ("Now let me show you the difference")
// highlights the quick test underneath.
//
// Cue times are measured from the pauses in /day1-insight.mp3 — each fires at
// the start of the pause *before* its line, so the card is already open when
// the voice reaches it. Re-measure if the recording is replaced:
//   ffmpeg -i public/day1-insight.mp3 -af silencedetect=noise=-35dB:d=0.4 -f null -
const SRC = "/day1-insight.mp3";
const DURATION = 54;
const CUES = [
  { t: 18.1, card: 0 },   // Cognitive Load — "When your words are hard to process…"
  { t: 24.4, card: 1 },   // Retention — "Clear ideas stick…"
  { t: 33.3, card: 2 },   // Credibility — "It makes you sound like you know your stuff…"
  { t: 41.0, card: 3 },   // Decision-Making — "And it moves things forward…"
  { t: 48.5, card: null, test: true }, // Hand-off — "Now let me show you the difference."
];

const TEST_OPTIONS = [
  { id: "A", text: "We need to leverage our existing capabilities to optimise our strategic positioning." },
  { id: "B", text: "We need to use what we already have to improve our position." },
];

// Desktop renders this inside a component that's re-created on every parent
// render, so it can remount mid-narration. The quick-test answer lives at
// module level so a remount doesn't wipe it, and the narration time is read
// back from the audio element itself.
let testAnswer = null;
let mounted = 0;

function cueIndexAt(time) {
  let idx = -1;
  CUES.forEach((c, i) => { if (time >= c.t) idx = i; });
  return idx;
}

function fmt(sec) {
  const s = Math.max(0, Math.round(sec));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

export default function D1Insight({ T, T2, isDesktop, sharedAudioRef }) {
  const ownAudioRef = useRef(null);
  // Reuse the session's shared narration slot so starting this pauses any
  // other narration (and the Theory narration pauses this one).
  const audioRef = sharedAudioRef || ownAudioRef;
  const ours = () => audioRef.current && audioRef.current.dataset.src === SRC ? audioRef.current : null;

  const [time, setTime] = useState(() => ours()?.currentTime || 0);
  const [playing, setPlaying] = useState(() => { const a = ours(); return !!a && !a.paused; });
  const [started, setStarted] = useState(() => (ours()?.currentTime || 0) > 0);
  // A tap wins until the narration reaches its next cue.
  const [manual, setManual] = useState({ card: null, cue: -2 });
  const [answer, setAnswer] = useState(testAnswer);
  const cardRefs = useRef([]);
  const testRef = useRef(null);

  function attach(a) {
    const onTime = () => setTime(a.currentTime);
    const onPlay = () => { setPlaying(true); setStarted(true); };
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onPause);
    };
  }
  const detachRef = useRef(null);

  useEffect(() => {
    mounted++;
    const a = ours();
    if (a) detachRef.current = attach(a);
    return () => {
      mounted--;
      detachRef.current?.();
      detachRef.current = null;
      // Leaving the Insight step stops the narration. Deferred so a desktop
      // remount (unmount + immediate mount) doesn't cut the voice off.
      setTimeout(() => { if (mounted === 0) ours()?.pause(); }, 0);
    };
  }, []);

  function togglePlay() {
    let a = ours();
    if (a && !a.paused) { a.pause(); return; }
    if (!a) {
      audioRef.current?.pause();
      a = new Audio(SRC);
      a.dataset.src = SRC;
      audioRef.current = a;
      detachRef.current?.();
      detachRef.current = attach(a);
    }
    a.play().catch(() => setPlaying(false));
  }

  const cueIdx = started ? cueIndexAt(time) : -1;
  const cue = CUES[cueIdx];
  const narratedCard = cue ? cue.card : null;
  const openCard = manual.cue === cueIdx ? manual.card : narratedCard;
  const testLit = playing && cue?.test;

  // Bring the narrated card (or the quick test) into view as each cue fires.
  useEffect(() => {
    if (!playing || !cue) return;
    const el = cue.test ? testRef.current : cardRefs.current[cue.card];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  function tapCard(i) {
    setManual({ card: openCard === i ? null : i, cue: cueIdx });
  }

  function choose(id) {
    if (answer) return;
    testAnswer = id;
    setAnswer(id);
  }

  const d = isDesktop;
  const remaining = playing || (started && time < DURATION - 0.5) ? DURATION - time : DURATION;
  const btnLabel = playing ? "Pause the coach" : started && time > 0 && time < DURATION - 0.5 ? "Resume the coach" : "Hear the coach";

  return (
    <>
      <style>{`
        @keyframes au-d1-wave { 0%,100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
        @keyframes au-d1-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(138,158,132,0.45); } 50% { box-shadow: 0 0 0 8px rgba(138,158,132,0); } }
        .au-d1-card { transition: border-color 0.35s, box-shadow 0.35s, background 0.35s; scroll-margin: 96px 0 140px; }
        .au-d1-test { scroll-margin: 96px 0 140px; }
        @media (prefers-reduced-motion: reduce) { .au-d1-bar, .au-d1-pulse { animation: none !important; } }
      `}</style>

      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 12 : 8 }}>Why Clarity Wins</h2>
      <p style={{ fontFamily: T.serif, fontSize: d ? 24 : 20, fontStyle: "italic", color: T2.goldDark, lineHeight: 1.35, margin: 0, marginBottom: d ? 14 : 10 }}>A clear message makes people lean in.</p>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 600 }}>Before you can influence, inspire or lead, people need to understand you.</p>

      {/* Listen button */}
      <button
        onClick={togglePlay}
        aria-label={btnLabel}
        style={{
          display: "flex", alignItems: "center", gap: 12, width: d ? "auto" : "100%",
          padding: d ? "12px 22px 12px 14px" : "12px 18px 12px 12px", marginBottom: d ? 32 : 22,
          WebkitAppearance: "none", appearance: "none", cursor: "pointer",
          background: playing ? T2.goldLight : T2.surface,
          border: "1px solid " + (playing ? T.gold : T2.border), borderRadius: 999,
          transition: "background 0.2s, border-color 0.2s",
        }}>
        <span style={{ width: 36, height: 36, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="1.5" width="2.8" height="9" rx="0.8" fill="#fff"/><rect x="7.2" y="1.5" width="2.8" height="9" rx="0.8" fill="#fff"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 1.6v8.8a.6.6 0 00.9.5l7-4.4a.6.6 0 000-1L3.9 1.1a.6.6 0 00-.9.5z" fill="#fff"/></svg>
          )}
        </span>
        <span style={{ fontFamily: T.sans, fontSize: d ? 16 : 15, fontWeight: 500, color: T2.text, flex: d ? "none" : 1, textAlign: "left" }}>{btnLabel}</span>
        <span aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 3, height: 18 }}>
          {[0.55, 0.9, 0.7, 1, 0.6].map((h, i) => (
            <span key={i} className="au-d1-bar" style={{
              width: 3, height: 18 * h, borderRadius: 2, background: T.gold, opacity: playing ? 1 : 0.45,
              transformOrigin: "center", transform: playing ? undefined : "scaleY(0.5)",
              animation: playing ? `au-d1-wave ${0.8 + i * 0.13}s ease-in-out ${i * 0.09}s infinite` : "none",
            }} />
          ))}
        </span>
        <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T2.text3, fontVariantNumeric: "tabular-nums", minWidth: 32, textAlign: "right" }}>{fmt(remaining)}</span>
      </button>

      {/* Four clarity cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "start", gap: d ? 12 : 10, marginBottom: d ? 32 : 24 }}>
        {D1_CLARITY_FACTS_DATA.map((n, i) => {
          const open = openCard === i;
          const lit = open && playing && narratedCard === i;
          return (
            <div key={i} ref={el => (cardRefs.current[i] = el)} onClick={() => tapCard(i)} className="au-d1-card"
              style={{
                background: lit ? T2.goldLight : T2.surface, borderRadius: d ? 4 : 8, padding: d ? "22px 24px" : "14px",
                border: `1px solid ${open ? T.gold : T2.border}`, cursor: "pointer",
                boxShadow: lit ? "0 0 0 3px rgba(138,158,132,0.22), 0 4px 22px rgba(138,158,132,0.28)" : open ? "0 2px 12px rgba(138,158,132,0.2)" : "none",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: d ? (open ? 10 : 6) : 5 }}>
                <div style={{ fontFamily: T.serif, fontSize: d ? 24 : 18, fontWeight: 600, color: T.gold, lineHeight: 1.3, flex: 1 }}>{n.word}</div>
                <span style={{ fontFamily: T.sans, fontSize: d ? 16 : 17, fontWeight: 600, color: open ? T.gold : T2.text4, marginLeft: 6, flexShrink: 0 }}>{open ? "▴" : "▸"}</span>
              </div>
              <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, color: T2.text2, lineHeight: 1.45, fontWeight: 400, margin: open ? (d ? "0 0 14px" : "4px 0 8px") : (d ? 0 : "4px 0 0") }}>{n.sub}</p>
              {open && (
                <div style={{ borderTop: "0.5px solid " + T2.divider, paddingTop: d ? 14 : 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {n.bullets.map((b, j) => (
                    <div key={j} style={{ display: "flex", gap: d ? 10 : 8, alignItems: "flex-start" }}>
                      <div style={{ width: d ? 4 : 3, height: d ? 4 : 3, borderRadius: "50%", background: T.gold, flexShrink: 0, marginTop: 6 }} />
                      <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, color: T2.text, lineHeight: 1.6, fontWeight: 400, margin: 0 }}>{b}</p>
                    </div>
                  ))}
                  {n.note && (
                    <div style={{ marginTop: 4, paddingLeft: 10, borderLeft: "2px solid " + T.gold }}>
                      <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 3 }}>Coach's note</div>
                      <p style={{ fontFamily: T.serif, fontSize: d ? 16 : 14, fontStyle: "italic", color: T2.text, lineHeight: 1.5, margin: 0 }}>{n.note}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick test — the "show you the difference" moment */}
      <div ref={testRef} className={"au-d1-test" + (testLit && !answer ? " au-d1-pulse" : "")}
        style={{
          background: T2.surface, borderRadius: d ? 4 : 8, padding: d ? "24px 26px" : "16px",
          border: "1px solid " + (testLit ? T.gold : T2.border), transition: "border-color 0.35s",
          animation: testLit && !answer ? "au-d1-pulse 1.6s ease-in-out infinite" : "none",
        }}>
        <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>Quick test</div>
        <p style={{ fontFamily: T.serif, fontSize: d ? 24 : 20, fontWeight: 600, color: T2.text, lineHeight: 1.25, margin: 0, marginBottom: d ? 16 : 12 }}>Which message is easier to understand?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TEST_OPTIONS.map(o => {
            const picked = answer === o.id;
            const clear = answer && o.id === "B";
            return (
              <button key={o.id} onClick={() => choose(o.id)} disabled={!!answer}
                style={{
                  display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", width: "100%",
                  padding: d ? "14px 16px" : "12px 14px", borderRadius: d ? 4 : 8,
                  WebkitAppearance: "none", appearance: "none", cursor: answer ? "default" : "pointer",
                  background: clear ? T2.goldLight : "transparent",
                  border: "1px solid " + (clear ? T.gold : picked ? T2.text3 : T2.border),
                  opacity: answer && !clear && !picked ? 0.6 : 1, transition: "all 0.25s",
                }}>
                <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: clear ? T.gold : T2.text3, flexShrink: 0, marginTop: 2 }}>{o.id}</span>
                <span style={{ fontFamily: T.sans, fontSize: d ? 16 : 15, color: T2.text, lineHeight: 1.5 }}>"{o.text}"</span>
              </button>
            );
          })}
        </div>
        {answer && (
          <div className="au-step-enter" style={{ marginTop: d ? 16 : 14 }}>
            <p style={{ fontFamily: T.serif, fontSize: d ? 22 : 19, fontWeight: 600, color: T2.goldDark, margin: 0, marginBottom: 4 }}>{answer === "B" ? "Exactly." : "Interesting. Most people pick B."}</p>
            <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, color: T2.text, lineHeight: 1.6, margin: 0 }}>
              {answer === "B"
                ? "Same idea, but your brain didn't have to work as hard to understand the second one. That's clarity in action."
                : "Both say the same thing, but B takes far less effort to understand. Your listener's brain is doing the decoding. That's clarity in action."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
