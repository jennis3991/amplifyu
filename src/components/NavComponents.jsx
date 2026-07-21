import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';
import { getPieceInfo } from '../utils.js';

export function PBar({pct, h=2, color=T.gold}) {
  return (
    <div style={{height:h,background:T.divider,borderRadius:h}}>
      <div style={{width:Math.min(100,Math.max(0,pct))+"%",height:"100%",background:"linear-gradient(90deg,"+T.goldDark+","+color+")",borderRadius:h,transition:"width 0.6s ease"}}/>
    </div>
  );
}

const NAV_C = "rgba(247,243,236,0.38)";
const NAV_A = "#c9a96e";

function NavIcon({ id, active }) {
  const c = active ? NAV_A : NAV_C;
  if (id === "home")     return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 9L10 3l7 6v9a1 1 0 01-1 1H6a1 1 0 01-1-1v-5h4v5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (id === "sessions") { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="3.5" width="15" height="13" rx="1.5" stroke={c} strokeWidth="1.8"/><path d="M2.5 7.5h15" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M7 2v3M13 2v3" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><circle cx="6.5" cy="11" r="1" fill={c}/><circle cx="10" cy="11" r="1" fill={c}/><circle cx="13.5" cy="11" r="1" fill={c}/><circle cx="6.5" cy="14" r="1" fill={c}/><circle cx="10" cy="14" r="1" fill={c}/><circle cx="13.5" cy="14" r="1" fill={c}/></svg>; }
  if (id === "progress") return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 15l4-5 3 3 4-6 3 3" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (id === "toolkit")  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="9" rx="1" stroke={c} strokeWidth="1.8"/><path d="M7 8V6a3 3 0 016 0v2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;
  return null;
}

export function TabBar({ tab, setTab, done=[], dark }) {
  const piece = getPieceInfo(done.length).current;
  const identityActive = tab === "identity";

  const LEFT  = [{ id:"home", label:"Home" }, { id:"sessions", label:"Programme" }];
  const RIGHT = [{ id:"progress", label:"Progress" }, { id:"toolkit", label:"Toolkit" }];

  function NavBtn({ id, label }) {
    const active = tab === id;
    return (
      <button onClick={() => setTab(id)} style={{
        flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        gap:4, minHeight:60, border:"none", background:"transparent", cursor:"pointer", padding:"10px 4px 8px",
      }}>
        <NavIcon id={id} active={active}/>
        <span style={{ fontSize:9, fontWeight:active?600:400, color:active?NAV_A:NAV_C, fontFamily:"'Inter',sans-serif", letterSpacing:"0.5px", textTransform:"uppercase" }}>{label}</span>
        {active && <div style={{ width:16, height:1.5, background:NAV_A, borderRadius:1 }}/>}
      </button>
    );
  }

  return (
    <div style={{
      position:"relative",
      background:"#0E0B08",
      borderRadius:"20px 20px 0 0",
      display:"flex", alignItems:"stretch",
      zIndex:200,
      paddingBottom:"env(safe-area-inset-bottom,0px)",
      boxShadow:"0 -2px 0 rgba(201,169,110,0.12), 0 -16px 48px rgba(0,0,0,0.5)",
      overflow:"visible",
    }}>
      {LEFT.map(item => <NavBtn key={item.id} {...item}/>)}

      {/* Identity medallion — centre, rises above bar */}
      <div style={{ flex:1, position:"relative", display:"flex", justifyContent:"center", alignItems:"stretch" }}>
        <button
          onClick={() => setTab("identity")}
          style={{
            position:"absolute",
            bottom:10,
            width:66, height:66,
            borderRadius:"50%",
            background:"linear-gradient(160deg,#3A2C1C,#1A120A)",
            border:"2px solid rgba(201,169,110,0.7)",
            boxShadow: identityActive
              ? "0 -4px 24px rgba(201,169,110,0.25), 0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)"
              : "0 -4px 20px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", outline:"none", padding:0,
            zIndex:10,
          }}
        >
          <i className={"ti " + piece.icon} style={{ fontSize:30, color: identityActive ? "#c9a96e" : "#b8934a" }}/>
        </button>
      </div>

      {RIGHT.map(item => <NavBtn key={item.id} {...item}/>)}
    </div>
  );
}

// ─── FLOATING NAVIGATION ─────────────────────────────────────────────────────
// Design: "The Chamber" — transparent over hero, glass on scroll. No sidebar.
// Typography-first. Atmosphere-first. Software-last.
export const NAV_H = 64;
// SIDEBAR_W kept at 0 — sidebar is gone on desktop
const SIDEBAR_W = 0;

export function FloatingNav({ tab, setTab, streak, done, dark, activeRole, inSession=false, onExitToTab, day=1 }) {
  const [confirmTab, setConfirmTab] = useState(null);

  function handleNavClick(id) {
    if (inSession) { setConfirmTab(id); } else { setTab(id); }
  }

  const ITEMS = [
    { id: "home",     label: "Home" },
    { id: "sessions", label: "Programme" },
    { id: "progress", label: "Progress" },
    { id: "toolkit",  label: "Toolkit" },
  ];

  return (
    <>
      {/* Session-exit confirmation dialog */}
      {confirmTab && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(10,8,5,0.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:T.surface, borderRadius:8, padding:"28px 32px", width:340, border:"0.5px solid "+T.border, boxShadow:"0 24px 64px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontFamily:T.serif, fontSize:20, fontWeight:500, color:T.text, marginBottom:10 }}>Exit this session?</h3>
            <p style={{ fontFamily:T.sans, fontSize:13, color:T.text3, lineHeight:1.65, marginBottom:24 }}>Your progress will be saved to where you left off.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmTab(null)} style={{ flex:1, padding:"11px", borderRadius:4, border:"0.5px solid "+T.border, background:"transparent", color:T.text3, fontSize:13, cursor:"pointer", fontFamily:T.sans }}>Cancel</button>
              <button onClick={() => { setConfirmTab(null); if(onExitToTab) onExitToTab(confirmTab); else setTab(confirmTab); }} style={{ flex:1, padding:"11px", borderRadius:4, border:"none", background:T.ink, color:T.bg, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:T.sans }}>Exit</button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        zIndex: 200, height: NAV_H,
        background: "#0F0D0A",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center",
        padding: "0 56px",
      }}>
        {/* Logo mark + wordmark */}
        <button onClick={() => handleNavClick("home")} style={{
          background: "none", border: "none", padding: 0,
          cursor: "pointer", marginRight: 48, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <img src="/logo-mark.png" alt="AmplifyU"
            style={{ width: 38, height: 38, objectFit: "cover", mixBlendMode: "screen", filter: "brightness(3) contrast(1.2)" }}/>
          <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.88)" }}>AmplifyU</span>
        </button>

        {/* Navigation links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {ITEMS.map(({ id, label }) => {
            const a = tab === id;
            return (
              <button key={id} onClick={() => handleNavClick(id)}
                className="au-nav-btn"
                style={{
                  padding: "7px 16px", borderRadius: 4, border: "none",
                  background: a ? "rgba(255,255,255,0.08)" : "transparent",
                  fontSize: 13, fontWeight: a ? 600 : 500,
                  color: a ? (id === "home" && !inSession ? "#c9a96e" : "#8A9E84") : "rgba(255,255,255,0.78)",
                  letterSpacing: "0px", fontFamily: T.sans,
                  cursor: "pointer", transition: "all 0.2s ease",
                }}>{label}</button>
            );
          })}
        </nav>

        {/* Right: streak + progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
          {streak > 0 && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: "#c9a96e", lineHeight: 1, letterSpacing: "-0.5px" }}>{streak}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", fontFamily: T.sans }}>streak</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" stroke="#c9a96e" strokeWidth="1.8"/>
              <path d="M2.5 7.5h15" stroke="#c9a96e" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M7 2v3M13 2v3" stroke="#c9a96e" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="6.5" cy="11" r="1" fill="#c9a96e"/>
              <circle cx="10" cy="11" r="1" fill="#c9a96e"/>
              <circle cx="13.5" cy="11" r="1" fill="#c9a96e"/>
              <circle cx="6.5" cy="14" r="1" fill="#c9a96e"/>
              <circle cx="10" cy="14" r="1" fill="#c9a96e"/>
              <circle cx="13.5" cy="14" r="1" fill="#c9a96e"/>
            </svg>
            <span style={{ fontSize: 13, color: "#c9a96e", fontWeight: 600, fontFamily: T.sans, letterSpacing:"0.3px" }}>Day {day}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// Keep Sidebar as a legacy no-op for mobile (mobile still uses TabBar)
export function Sidebar() { return null; }


