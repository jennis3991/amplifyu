import { useEffect, useRef, useState } from 'react';
import { T } from '../theme.js';

// ─── MEET YOUR COACH — the welcome video, shown once after onboarding ───────
// Comes straight after "Let's Begin" on the communication profile. That tap
// lets the video autoplay with sound (iOS/Capacitor always allows it; browsers
// that block it fall back to muted with a "Tap for sound" button). "Start
// Day 1" goes straight into the first session; "Skip intro" goes to Home.
export function MeetCoachScreen({ onStartDay1, onSkip }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

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

  const leave = fn => {
    if (leaving) return;
    setLeaving(true);
    videoRef.current?.pause();
    setTimeout(fn, 380);
  };

  const tapVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (muted) { v.muted = false; setMuted(false); v.play().catch(() => {}); return; }
    if (v.paused) { if (v.ended) v.currentTime = 0; v.play().catch(() => {}); } else v.pause();
  };

  // Sized to fit the screen height with the heading and buttons, so nothing
  // needs scrolling on smaller phones.
  const frameW = "min(240px, 62vw, calc((100vh - 360px) * 9 / 16))";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.sans, display: "flex", flexDirection: "column", opacity: leaving ? 0 : 1, transition: "opacity 0.38s ease" }}>
      <style>{`@keyframes coachFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Slim black banner, as on the communication profile */}
      <div style={{ background: "#0D0B08", height: `calc(52px + env(safe-area-inset-top, 0px))`, paddingTop: "env(safe-area-inset-top, 0px)", display: "flex", alignItems: "center", paddingLeft: 20, flexShrink: 0, boxSizing: "border-box" }}>
        <img src="/logo-mark.png" alt="AmplifyU" style={{ width: 28, height: 28, objectFit: "cover", mixBlendMode: "screen", filter: "brightness(3) contrast(1.2)", marginRight: 10 }}/>
        <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>AmplifyU</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px calc(24px + env(safe-area-inset-bottom, 0px))", textAlign: "center", animation: "coachFade 0.6s ease both" }}>
        <div style={{ fontSize: 11, color: T.text3, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 10 }}>Welcome to AmplifyU</div>
        <h1 style={{ fontFamily: T.serif, fontSize: 34, fontWeight: 500, color: T.ink, lineHeight: 1.08, letterSpacing: "-1px", margin: 0 }}>Meet your coach</h1>
        <p style={{ fontSize: 14, color: T.text3, lineHeight: 1.5, margin: "8px 0 22px" }}>A 30-second welcome to your 14 days.</p>

        <div onClick={tapVideo} role="button" aria-label={playing && !muted ? "Pause video" : "Play video"} style={{ position: "relative", width: frameW, aspectRatio: "9 / 16", borderRadius: 14, overflow: "hidden", background: "#000", border: "1px solid " + T.border, boxShadow: "0 14px 40px rgba(44,36,22,0.2)", cursor: "pointer" }}>
          <video ref={videoRef} src="/intro.mp4" poster="/intro-poster.jpg" playsInline autoPlay preload="auto"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
            onTimeUpdate={e => { const v = e.currentTarget; if (v.duration) setProgress(v.currentTime / v.duration); }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {!playing && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(13,11,8,0.18)" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(247,243,236,0.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M5 3.5v11l9.5-5.5z" fill={T.ink} /></svg>
              </div>
            </div>
          )}
          {playing && muted && (
            <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", padding: "8px 16px", borderRadius: 20, background: "rgba(0,0,0,0.45)", color: "#fff", fontSize: 13, fontWeight: 600 }}>Tap for sound</div>
          )}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(255,255,255,0.2)" }}>
            <div style={{ height: "100%", width: (progress * 100) + "%", background: T.bg, transition: "width 0.25s linear" }} />
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: 420, marginTop: 26 }}>
          <button onClick={() => leave(onStartDay1)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px 24px", borderRadius: 6, border: "none", background: T.ink, color: T.bg, fontSize: 14, fontFamily: T.sans, fontWeight: 600, cursor: "pointer" }}>
            Start Day 1 →
          </button>
          <button onClick={() => leave(onSkip)} style={{ marginTop: 6, background: "none", border: "none", padding: "12px 16px", minHeight: 44, color: T.text3, fontSize: 13, fontFamily: T.sans, cursor: "pointer" }}>
            Skip intro
          </button>
        </div>
      </div>
    </div>
  );
}
