import { useState, useEffect } from 'react';

// ─── Canonical AmplifyU sequential-dots loading indicator ─────────────────────
// Shared across Rehearsal/Simulation "analysing…" screens. useSequentialDots
// drives a dotCount (0-3) that fills in one dot at a time while `active` is
// true; SequentialDots renders it. Size, spacing, and color are props so each
// day can keep its existing look (most days use sage; Day 10 uses gold).
export function useSequentialDots(active) {
  const [dotCount, setDotCount] = useState(0);
  useEffect(() => {
    if (!active) { setDotCount(0); return; }
    setDotCount(1);
    const id = setInterval(() => {
      setDotCount(d => { if (d >= 3) { clearInterval(id); return d; } return d + 1; });
    }, 600);
    return () => clearInterval(id);
  }, [active]);
  return dotCount;
}

// Cycles through `messages` every `intervalMs` while `active` is true, so a
// long wait reads as ongoing progress rather than one static line. Resets to
// the first message whenever `active` goes false, so the next wait always
// opens on the same reassuring first line rather than wherever it left off.
export function useRotatingMessage(active, messages, intervalMs = 2400) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active) { setIdx(0); return; }
    if (!messages || messages.length < 2) return;
    const id = setInterval(() => setIdx(i => (i + 1) % messages.length), intervalMs);
    return () => clearInterval(id);
  }, [active, messages, intervalMs]);
  if (!messages || !messages.length) return null;
  return messages[Math.min(idx, messages.length - 1)];
}

export function SequentialDots({
  dotCount, size = 9, gap = 10, center = true,
  activeColor = 'rgba(138,158,132,0.75)', inactiveColor = 'rgba(138,158,132,0.12)',
  messages, messageIntervalMs = 2400, textStyle,
}) {
  const message = useRotatingMessage(dotCount > 0, messages, messageIntervalMs);
  const dots = (
    <div style={{ display: 'flex', gap, justifyContent: center ? 'center' : undefined }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: size, height: size, borderRadius: '50%',
          background: i < dotCount ? activeColor : inactiveColor,
          transition: 'background 0.35s',
          // Once a dot has filled in, keep it gently breathing rather than
          // sitting inert for the rest of a long wait — this is what keeps
          // the animation reading as "still working" instead of stalled.
          animation: i < dotCount ? 'sdBreathe 1.6s ease-in-out infinite' : 'none',
          animationDelay: i < dotCount ? `${i * 0.15}s` : undefined,
        }} />
      ))}
    </div>
  );
  if (!message) return dots;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: center ? 'center' : undefined, gap: 14 }}>
      <style>{`@keyframes sdBreathe{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.55;transform:scale(0.85)}}@keyframes sdFadeIn{from{opacity:0}to{opacity:1}}`}</style>
      {dots}
      <p key={message} style={{
        fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'rgba(138,158,132,0.85)',
        textAlign: center ? 'center' : undefined, margin: 0, animation: 'sdFadeIn 0.4s ease',
        ...textStyle,
      }}>{message}</p>
    </div>
  );
}
