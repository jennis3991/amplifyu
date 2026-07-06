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
  { name:"Pawn",   icon:"ti-chess",        threshold:0  },
  { name:"Knight", icon:"ti-chess-knight", threshold:3  },
  { name:"Bishop", icon:"ti-chess-bishop", threshold:6  },
  { name:"Rook",   icon:"ti-chess-rook",   threshold:9  },
  { name:"Queen",  icon:"ti-chess-queen",  threshold:12 },
  { name:"King",   icon:"ti-chess-king",   threshold:14 },
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
  { label:"Clarity & Structure",      days:[1,3,4,5,7,14] },
  { label:"Connection & Presence",    days:[2,6,9,10,7,14] },
  { label:"Storytelling & Influence", days:[8,11,12,13,14] },
];

export function getCategoryProgress(done) {
  return CAT_DAYS.map(cat => {
    const count = cat.days.filter(d => done.includes(d)).length;
    return { label: cat.label, pct: cat.days.length ? Math.round((count / cat.days.length) * 100) : 0, count };
  }).sort((a, b) => b.pct - a.pct);
}


