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


