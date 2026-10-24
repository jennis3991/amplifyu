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

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#161513", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: leaving ? 0 : 1, transition: "opacity 0.4s ease",
      animation: "introFadeIn 0.45s ease both",
    }}>
      <style>{`@keyframes introFadeIn{from{opacity:0}to{opacity:1}}`}</style>
      <div style={{ position: "relative", width: "100%", height: "100%", maxWidth: "calc(100vh * 9 / 16)" }}>
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

        <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 10px)", left: 16, right: 16, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.22)", overflow: "hidden"}}>
          <div style={{ height: "100%", width: (progress * 100) + "%", background: "#fff", transition: "width 0.25s linear" }} />
        </div>

        <button onClick={finish} aria-label="Skip intro" style={{ ...pill, position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 24px)", right: 16 }}>
          Skip
        </button>

        {muted && (
          <button onClick={unmute} style={{ ...pill, position: "absolute", bottom: "calc(env(safe-area-inset-bottom, 0px) + 28px)", left: "50%", transform: "translateX(-50%)" }}>
            Tap for sound
          </button>
        )}
      </div>
    </div>
  );
}
