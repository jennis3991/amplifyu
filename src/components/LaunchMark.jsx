import { useState, useEffect, useLayoutEffect } from "react";
import { Capacitor } from "@capacitor/core";

// ─── Launch mark — the branded micro-moment for returning users ──────────────
// Cold start: index.html paints #au-boot-mark on the first frame (matching the
// native LaunchScreen.storyboard), and this component takes it over in place,
// lifts the mark with a soft glow, then fades the whole field away to reveal
// wherever the app opened. Same choreography as the post-onboarding welcome
// mark in App.jsx.
// Resume: if the app comes back to the foreground after RESUME_AFTER_MS in the
// background, the same moment plays over the current screen. Quicker switches
// go straight back in. Rendered as an overlay so the app underneath (including
// a session in progress) keeps its state.
const RESUME_AFTER_MS = 30 * 60 * 1000;
const BG = "#161513";

function isReturningUser() {
  try {
    const authed = Capacitor.isNativePlatform() || localStorage.getItem("au1_authed") === "true";
    return authed && localStorage.getItem("au1_ob") === "true";
  } catch { return false; }
}

function bootMarkShowing() {
  const el = document.getElementById("au-boot-mark");
  return !!el && el.style.display === "flex";
}

export default function LaunchMark() {
  // enter → shown → glow → out → (unmounted). A cold start begins at "shown"
  // so the first React frame is pixel-identical to the boot mark.
  const [phase, setPhase] = useState(() => (bootMarkShowing() ? "shown" : null));
  const [runId, setRunId] = useState(0);

  // Take over from the static boot mark now that this overlay is in the DOM.
  useLayoutEffect(() => {
    const el = document.getElementById("au-boot-mark");
    if (el) el.remove();
    document.documentElement.style.background = "";
  }, []);

  useEffect(() => {
    let hiddenAt = null;
    function onVisibility() {
      if (document.visibilityState === "hidden") { hiddenAt = Date.now(); return; }
      if (hiddenAt && Date.now() - hiddenAt >= RESUME_AFTER_MS && isReturningUser()) {
        setPhase("enter");
        setRunId(n => n + 1);
      }
      hiddenAt = null;
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!phase) return;
    const timers = [];
    let raf;
    const start = phase === "enter" ? 250 : 0;
    if (phase === "enter") raf = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("shown")));
    timers.push(setTimeout(() => setPhase("glow"), start + 300));
    timers.push(setTimeout(() => setPhase("out"), start + 900));
    timers.push(setTimeout(() => setPhase(null), start + 1450));
    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
    // Only (re)start the timeline when a run begins, not on each phase step.
  }, [runId]);

  if (!phase) return null;

  const lifted = phase === "glow" || phase === "out";
  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: 10000, background: BG,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: phase === "enter" || phase === "out" ? 0 : 1,
      transition: phase === "out" ? "opacity 0.55s ease" : "opacity 0.25s ease",
    }}>
      <style>{`@media (prefers-reduced-motion: reduce) { .au-launch-mark { transform: none !important; } }`}</style>
      <img className="au-launch-mark" src="/launch-mark.png" width="120" height="120" alt="" style={{
        display: "block",
        opacity: phase === "enter" ? 0 : 1,
        transform: phase === "enter" ? "scale(0.88)" : lifted ? "translateY(-10px) scale(1.08)" : "none",
        filter: lifted ? "drop-shadow(0 0 24px rgba(255,255,255,0.55))" : "drop-shadow(0 0 0px rgba(255,255,255,0))",
        transition: "opacity 0.45s ease, transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), filter 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)",
      }} />
    </div>
  );
}
