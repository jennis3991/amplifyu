import { useState, useEffect, useRef, forwardRef } from "react";

// ─── Coach narration — shared by the voice-guided lesson tabs ────────────────
// A pre-recorded coach voice drives the screen: `cues` are times (seconds) in
// the recording where something on screen should respond. Cue times are
// measured from the pauses in each recording — each fires at the start of the
// pause *before* its line, so the element is already lit when the voice gets
// there. Re-measure if a recording is replaced:
//   ffmpeg -i public/<file>.mp3 -af silencedetect=noise=-35dB:d=0.35 -f null -
//
// Desktop renders the lesson tabs inside components that are re-created on
// every parent render, so these can remount mid-narration. All playback
// state is therefore read back from the audio element itself rather than
// kept in React state alone.

const mountedBySrc = {};

export function fmt(sec) {
  const s = Math.max(0, Math.round(sec));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

function cueIndexAt(cues, time) {
  let idx = -1;
  cues.forEach((c, i) => { if (time >= c.t) idx = i; });
  return idx;
}

// sharedAudioRef is the session's single narration slot, so starting this
// pauses any other narration (and other narration pauses this). onBeforePlay
// lets a tab stop its own extra clips; onLeave runs when the tab is left.
export function useCoachNarration({ src, cues, sharedAudioRef, onBeforePlay, onLeave }) {
  const ownAudioRef = useRef(null);
  const audioRef = sharedAudioRef || ownAudioRef;
  const ours = () => audioRef.current && audioRef.current.dataset.src === src ? audioRef.current : null;

  const [time, setTime] = useState(() => ours()?.currentTime || 0);
  const [playing, setPlaying] = useState(() => { const a = ours(); return !!a && !a.paused; });
  const [started, setStarted] = useState(() => (ours()?.currentTime || 0) > 0);
  const detachRef = useRef(null);

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

  useEffect(() => {
    mountedBySrc[src] = (mountedBySrc[src] || 0) + 1;
    const a = ours();
    if (a) detachRef.current = attach(a);
    return () => {
      mountedBySrc[src]--;
      detachRef.current?.();
      detachRef.current = null;
      // Leaving the tab stops the narration. Deferred so a desktop remount
      // (unmount + immediate mount) doesn't cut the voice off.
      setTimeout(() => { if (mountedBySrc[src] === 0) { ours()?.pause(); onLeave?.(); } }, 0);
    };
  }, []);

  function togglePlay() {
    let a = ours();
    if (a && !a.paused) { a.pause(); return; }
    onBeforePlay?.();
    if (!a) {
      audioRef.current?.pause();
      a = new Audio(src);
      a.dataset.src = src;
      audioRef.current = a;
      detachRef.current?.();
      detachRef.current = attach(a);
    }
    a.play().catch(() => setPlaying(false));
  }

  function pause() { ours()?.pause(); }

  const cueIdx = started ? cueIndexAt(cues, time) : -1;
  return { time, playing, started, cueIdx, cue: cues[cueIdx], togglePlay, pause };
}

// "Warm lift" for the active card/button: lighter parchment (or walnut in
// dark mode), a fine deep-sage hairline and a soft warm shadow — raised, not
// tinted. Sage stays in the titles and icons.
export function warmLift(T, T2) {
  return T2.bg !== T.bg
    ? { bg: "#2A251E", border: "rgba(138,158,132,0.38)", shadow: "0 8px 28px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.3)" }
    : { bg: T.bg, border: "rgba(82,112,96,0.4)", shadow: "0 6px 24px rgba(44,36,22,0.08), 0 1px 4px rgba(44,36,22,0.05)" };
}

// Shared keyframes/classes: waveform bars, the hand-off pulse, and scroll
// margins so auto-scrolled elements clear the mobile header and bottom nav.
export function CoachStyles() {
  return (
    <style>{`
      @keyframes au-coach-wave { 0%,100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
      @keyframes au-coach-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(82,112,96,0.22); } 50% { box-shadow: 0 0 0 6px rgba(82,112,96,0); } }
      .au-coach-lit { transition: border-color 0.35s, box-shadow 0.35s, background 0.35s; scroll-margin: 96px 0 140px; }
      @media (prefers-reduced-motion: reduce) { .au-coach-bar, .au-coach-pulse { animation: none !important; } }
    `}</style>
  );
}

export function PlayIcon({ playing, size = 12 }) {
  return playing ? (
    <svg width={size} height={size} viewBox="0 0 12 12"><rect x="2" y="1.5" width="2.8" height="9" rx="0.8" fill="#fff"/><rect x="7.2" y="1.5" width="2.8" height="9" rx="0.8" fill="#fff"/></svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 12 12"><path d="M3 1.6v8.8a.6.6 0 00.9.5l7-4.4a.6.6 0 000-1L3.9 1.1a.6.6 0 00-.9.5z" fill="#fff"/></svg>
  );
}

// The "Hear the coach · 0:54" pill with a live waveform and countdown.
export function CoachButton({ T, T2, isDesktop: d, narration, duration, style }) {
  const { playing, started, time, togglePlay } = narration;
  const lift = warmLift(T, T2);
  const midway = started && time > 0 && time < duration - 0.5;
  const remaining = playing || midway ? duration - time : duration;
  const label = playing ? "Pause the coach" : midway ? "Resume the coach" : "Hear the coach";
  return (
    <button
      onClick={togglePlay}
      aria-label={label}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: d ? "auto" : "100%",
        padding: d ? "12px 22px 12px 14px" : "12px 18px 12px 12px", marginBottom: d ? 32 : 22,
        WebkitAppearance: "none", appearance: "none", cursor: "pointer",
        background: playing ? lift.bg : T2.surface,
        border: "1px solid " + (playing ? lift.border : T2.border), borderRadius: 999,
        boxShadow: playing ? lift.shadow : "none",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
        ...style,
      }}>
      <span style={{ width: 36, height: 36, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <PlayIcon playing={playing} />
      </span>
      <span style={{ fontFamily: T.sans, fontSize: d ? 16 : 15, fontWeight: 500, color: T2.text, flex: d ? "none" : 1, textAlign: "left" }}>{label}</span>
      <span aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 3, height: 18 }}>
        {[0.55, 0.9, 0.7, 1, 0.6].map((h, i) => (
          <span key={i} className="au-coach-bar" style={{
            width: 3, height: 18 * h, borderRadius: 2, background: T.gold, opacity: playing ? 1 : 0.45,
            transformOrigin: "center", transform: playing ? undefined : "scaleY(0.5)",
            animation: playing ? `au-coach-wave ${0.8 + i * 0.13}s ease-in-out ${i * 0.09}s infinite` : "none",
          }} />
        ))}
      </span>
      <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T2.text3, fontVariantNumeric: "tabular-nums", minWidth: 32, textAlign: "right" }}>{fmt(remaining)}</span>
    </button>
  );
}

// Expandable insight cards that follow the coach: the narrated card opens and
// lifts at its cue, and a tap wins until the narration reaches its next cue.
// Cards: [{ word, sub, bullets, note? }]. Cues reference cards by index.
export function useCueCards(cueIdx, cue) {
  const [manual, setManual] = useState({ card: null, cue: -2 });
  const narrated = cue && cue.card !== undefined ? cue.card : null;
  const openCard = manual.cue === cueIdx ? manual.card : narrated;
  const tap = i => setManual({ card: openCard === i ? null : i, cue: cueIdx });
  return { openCard, tap, refs: useRef([]) };
}

export function CoachCardGrid({ T, T2, isDesktop: d, cards, cueCards, style }) {
  const lift = warmLift(T, T2);
  const { openCard, tap, refs } = cueCards;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "start", gap: d ? 12 : 10, marginBottom: d ? 32 : 24, ...style }}>
      {cards.map((n, i) => {
        const open = openCard === i;
        return (
          <div key={i} ref={el => (refs.current[i] = el)} onClick={() => tap(i)} className="au-coach-lit"
            style={{
              background: open ? lift.bg : T2.surface, borderRadius: d ? 4 : 8, padding: d ? "22px 24px" : "14px",
              border: `1px solid ${open ? lift.border : T2.border}`, cursor: "pointer",
              boxShadow: open ? lift.shadow : "none",
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
  );
}

// The coach's hand-off to the next tab. Rendered only while the hand-off
// cue is playing, so it never duplicates the session's own Next button.
export const UpNextCard = forwardRef(function UpNextCard({ T, T2, isDesktop: d, title, sub, onClick }, ref) {
  const lift = warmLift(T, T2);
  return (
    <button ref={ref} onClick={onClick} className="au-coach-lit au-coach-pulse"
      style={{
        display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
        padding: d ? "14px 20px" : "14px 16px", borderRadius: d ? 4 : 8, cursor: "pointer",
        WebkitAppearance: "none", appearance: "none",
        background: lift.bg, border: "1px solid " + lift.border, boxShadow: lift.shadow,
        // Fade up into place (fadeUp lives in index.html), then pulse.
        animation: "fadeUp 0.5s cubic-bezier(0.25,0.46,0.45,0.94) both, au-coach-pulse 1.6s ease-in-out 0.5s infinite",
      }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.4px", marginBottom: 2 }}>Up next</span>
        <span style={{ display: "block", fontFamily: T.serif, fontSize: d ? 19 : 17, fontWeight: 600, color: T2.text, lineHeight: 1.25 }}>{title}</span>
        {sub && <span style={{ display: "block", fontFamily: T.sans, fontSize: 13, color: T2.text3, marginTop: 2 }}>{sub}</span>}
      </span>
      <span aria-hidden="true" style={{ fontFamily: T.sans, fontSize: 18, color: T2.goldDark, flexShrink: 0 }}>→</span>
    </button>
  );
});
