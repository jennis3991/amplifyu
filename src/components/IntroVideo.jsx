import { useEffect, useRef, useState } from "react";
import { T } from "../theme.js";

// ─── INTRO VIDEO — the coach's welcome, shown once after onboarding ──────────
// Plays straight after "Let's Begin" on the Reflection screen, before Home.
// iOS (Capacitor) allows autoplay with sound. Browsers that block it fall back
// to muted playback with a "Tap for sound" button. Skip or the end of the clip
// calls onDone.
export function IntroVideo({ onDone }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);
  // Skip fades in after a few seconds, up in the corner, so a quick second tap
  // after "Let's Begin" can't dismiss the welcome by accident.
  const [skipReady, setSkipReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSkipReady(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    videoRef.current?.pause();
    setTimeout(onDone, 400);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});
    });
  }, []);

  const unmute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    v.play().catch(() => {});
  };

  const pill = {
    border: "0.5px solid rgba(255,255,255,0.28)", background: "rgba(0,0,0,0.38)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    color: "#fff", fontFamily: T.sans, fontSize: 14, fontWeight: 600,
    borderRadius: 20, padding: "9px 18px", minHeight: 40, cursor: "pointer",
  };

  // Half-height portrait card, centred, so the welcome feels personal rather
  // than taking over the screen.
  const frameW = "min(calc(50vh * 9 / 16), 72vw)";
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#161513", zIndex: 1000,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 16px",
      opacity: leaving ? 0 : 1, transition: "opacity 0.4s ease",
      animation: "introFadeIn 0.45s ease both",
    }}>
      <style>{`@keyframes introFadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{ position: "relative", width: frameW, aspectRatio: "9 / 16", borderRadius: 18, overflow: "hidden", background: "#000", boxShadow: "0 18px 50px rgba(0,0,0,0.5)", border: "0.5px solid rgba(255,255,255,0.12)" }}>
        <video
          ref={videoRef}
          src="/intro.mp4"
          poster="/intro-poster.jpg"
          playsInline
          autoPlay
          preload="auto"
          onEnded={finish}
          onError={finish}
          onTimeUpdate={e => { const v = e.currentTarget; if (v.duration) setProgress(v.currentTime / v.duration); }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />

        {muted && (
          <button onClick={unmute} style={{ ...pill, position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
            Tap for sound
          </button>
        )}
      </div>

      <div style={{ width: frameW, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.16)", overflow: "hidden", marginTop: 16 }}>
        <div style={{ height: "100%", width: (progress * 100) + "%", background: "rgba(255,255,255,0.85)", transition: "width 0.25s linear" }} />
      </div>

      <button onClick={finish} disabled={!skipReady} aria-label="Skip intro" style={{
        position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 14px)", right: 16,
        background: "none", border: "none", padding: "10px 6px", minHeight: 40,
        color: "rgba(255,255,255,0.5)", fontFamily: T.sans, fontSize: 13, fontWeight: 500, letterSpacing: "0.3px",
        opacity: skipReady ? 1 : 0, pointerEvents: skipReady ? "auto" : "none", transition: "opacity 0.6s ease",
      }}>
        Skip intro
      </button>
    </div>
  );
}
