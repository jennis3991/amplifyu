import { useState, useEffect, useRef } from "react";

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
