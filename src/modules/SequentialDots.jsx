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

export function SequentialDots({ dotCount, size = 9, gap = 10, center = true, activeColor = 'rgba(138,158,132,0.75)', inactiveColor = 'rgba(138,158,132,0.12)' }) {
  return (
    <div style={{ display: 'flex', gap, justifyContent: center ? 'center' : undefined }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: size, height: size, borderRadius: '50%', background: i < dotCount ? activeColor : inactiveColor, transition: 'background 0.35s' }} />
      ))}
    </div>
  );
}
