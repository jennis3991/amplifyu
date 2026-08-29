import { useState, useEffect } from 'react';
import { LESSONS, ROLES, ROLE_SCENARIOS } from './data.js';

export function ls(k, fb) {
  try { const v = localStorage.getItem(k); return v !== null ? 
JSON.parse(v) : fb; } catch { return fb; }
}
export function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } 
catch {} }
export function getStreak(days) {
  if (!days.length) return 0;
  const s = [...days].sort((a, b) => b - a);
  let st = 1, p = s[0];
  for (let i = 1; i < s.length; i++) { if (p - s[i] === 1) { st++; p =
s[i]; } else break; }
  return st;
}

// Rough, browser-agnostic localStorage headroom check for warning users before
// a saved recording's audio gets silently dropped. There's no reliable
// synchronous way to read the *actual* per-browser quota — Safari, Chrome, and
// Firefox all differ, and none expose it directly via a sync API (the async
// navigator.storage.estimate() also isn't consistently accurate for
// localStorage specifically, especially in Safari). So this assumes the
// lowest common quota among major browsers (5MB) as a conservative ceiling and
// measures real usage against it — worst case on a browser with a larger
// quota this warns a little earlier than strictly necessary; it should never
// warn too late.
const ASSUMED_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024;
export function localStorageUsageRatio() {
  try {
    let chars = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      chars += (k ? k.length : 0) + (localStorage.getItem(k) || '').length;
    }
    return (chars * 2) / ASSUMED_STORAGE_QUOTA_BYTES; // *2: localStorage strings are UTF-16
  } catch { return 0; }
}

// Keeps the screen awake (via the Screen Wake Lock API, Safari 16.4+) for as
// long as `active` is true — used to stop iOS auto-locking mid-recording.
// Only guards against the inactivity timer; a manual lock-button press or
// backgrounding the app will still interrupt the recording.
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    let lock = null;
    let cancelled = false;
    async function request() {
      try {
        const l = await navigator.wakeLock.request('screen');
        if (cancelled) { l.release().catch(() => {}); return; }
        lock = l;
      } catch (_) {}
    }
    request();
    function onVisible() {
      if (document.visibilityState === 'visible' && !lock) request();
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      if (lock) { lock.release().catch(() => {}); lock = null; }
    };
  }, [active]);
}

export function useIsDesktop() {
  const [v, setV] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);
  useEffect(() => {
    const fn = () => setV(window.innerWidth >= 1024);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return v;
}

export function useIsMobile() {
  const [v, setV] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return v;
}


// ─── THEORY DIAGRAMS 





export function getScenariosForDay(roleId, day) {
  const roleScenarios = ROLE_SCENARIOS[roleId];
  if (roleScenarios && roleScenarios[day]) return roleScenarios[day];
  const lesson = LESSONS.find(l => l.day === day);
  return lesson ? lesson.scenarios : [];
}

export function getPIEEmphasis(roleId) {
  const role = ROLES.find(r => r.id === roleId);
  return role ? role.pieEmphasis : null;
}

// ─── Chess piece progression ──────────────────────────────────────────────────
export const PIECES = [
  { name:"Pawn",   icon:"ti-chess",        img:"/chess-pawn.png",   threshold:0  },
  { name:"Knight", icon:"ti-chess-knight", img:"/chess-knight.png", threshold:3  },
  { name:"Bishop", icon:"ti-chess-bishop", img:"/chess-bishop.png", threshold:6  },
  { name:"Rook",   icon:"ti-chess-rook",   img:"/chess-rook.png",   threshold:9  },
  { name:"Queen",  icon:"ti-chess-queen",  img:"/chess-queen.png",  threshold:12 },
  { name:"King",   icon:"ti-chess-king",   img:"/chess-king.png",   threshold:13 },
];

export function getPieceInfo(doneCount) {
  let idx = 0;
  for (let i = 0; i < PIECES.length; i++) {
    if (PIECES[i].threshold <= doneCount) idx = i;
  }
  const next = idx + 1 < PIECES.length ? PIECES[idx + 1] : null;
  return { current: PIECES[idx], currentIndex: idx, next, daysUntil: next ? next.threshold - doneCount : 0 };
}

const CAT_DAYS = [
  { label:"Clarity",      days:[1,3,4,5,7,14] },
  { label:"Connection",   days:[2,6,9,10,7,14] },
  { label:"Storytelling", days:[8,11,12,13,14] },
];

export function getCategoryProgress(done) {
  return CAT_DAYS.map(cat => {
    const count = cat.days.filter(d => done.includes(d)).length;
    return { label: cat.label, pct: cat.days.length ? Math.round((count / cat.days.length) * 100) : 0, count };
  }).sort((a, b) => b.pct - a.pct);
}


