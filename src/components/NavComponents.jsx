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

const GOLD = "#E7C27A";
const IC   = "rgba(255,255,255,0.72)";

function NavIcon({ id, active }) {
  const c = active ? GOLD : IC;
  const s = { stroke:c, strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };

  /* Home — peaked roof + walled body + door notch */
  if (id === "home") return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5" {...s}/>
      <path d="M5 9V21h4.5v-5.5h5V21H19V9" {...s}/>
    </svg>
  );

  /* Programme — calendar: frame + pins + header bar + 3×2 dot grid */
  if (id === "sessions") return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4.5" width="18" height="16" rx="2" {...s}/>
      <path d="M3 9.5h18" {...s}/>
      <path d="M8 2.5v4M16 2.5v4" {...s}/>
      <circle cx="8.5"  cy="13.5" r="1.2" fill={c}/>
      <circle cx="12"   cy="13.5" r="1.2" fill={c}/>
      <circle cx="15.5" cy="13.5" r="1.2" fill={c}/>
      <circle cx="8.5"  cy="17.5" r="1.2" fill={c}/>
      <circle cx="12"   cy="17.5" r="1.2" fill={c}/>
      <circle cx="15.5" cy="17.5" r="1.2" fill={c}/>
    </svg>
  );

  /* Progress — upward trending line + arrowhead top-right */
  if (id === "progress") return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 18L9 12l4 3.5L20 7" {...s}/>
      <path d="M15 7h5v5" {...s}/>
    </svg>
  );

  /* Toolkit — briefcase: body + handle arc + centre bar */
  if (id === "toolkit") return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="9" width="20" height="13" rx="2" {...s}/>
      <path d="M8 9V7a4 4 0 018 0v2" {...s}/>
      <path d="M2 14.5h20" {...s}/>
    </svg>
  );
  return null;
}

export function TabBar({ tab, setTab, done=[], dark }) {
  const piece = getPieceInfo(done.length).current;
  const identityActive = tab === "identity";
  const NAV_ITEMS = [
    { id:"home",     label:"Home"      },
    { id:"sessions", label:"Programme" },
    { id:"progress", label:"Progress"  },
    { id:"toolkit",  label:"Toolkit"   },
  ];

  function SideBtn({ id, label }) {
    const active = tab === id;
    return (
      <button onClick={() => setTab(id)} style={{
        flex:1, position:"relative",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        gap:6, border:"none", background:"transparent", cursor:"pointer",
        padding:"14px 4px 12px", minHeight:92,
      }}>
        {active && (
          <div style={{
            position:"absolute", top:"50%", left:"50%",
            transform:"translate(-50%,-54%)",
            width:52, height:52, borderRadius:"50%",
            background:"radial-gradient(circle at 50% 40%, rgba(231,194,122,0.18) 0%, rgba(231,194,122,0.06) 55%, transparent 78%)",
            pointerEvents:"none",
          }}/>
        )}
        <NavIcon id={id} active={active}/>
        <span style={{
          fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:500,
          letterSpacing:"1.8px", textTransform:"uppercase",
          color: active ? GOLD : IC,
          position:"relative",
        }}>{label}</span>
      </button>
    );
  }

  return (
    <div style={{
      position:"relative",
      background:"linear-gradient(to bottom, #28221D 0%, #171411 100%)",
      borderRadius:"28px 28px 0 0",
      display:"flex", alignItems:"stretch",
      zIndex:200,
      paddingBottom:"env(safe-area-inset-bottom,0px)",
      boxShadow:"0 -24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.055)",
      overflow:"visible",
      minHeight:92,
    }}>
      {/* inner top highlight arc */}
      <div style={{
        position:"absolute", top:0, left:"10%", right:"10%", height:1,
        background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
        borderRadius:1, pointerEvents:"none",
      }}/>

      {NAV_ITEMS.slice(0,2).map(item => <SideBtn key={item.id} {...item}/>)}

      {/* Centre — Identity medallion */}
      <div style={{ flex:1, position:"relative", minHeight:92 }}>
        <button
          onClick={() => setTab("identity")}
          style={{
            position:"absolute", top:-18, left:"50%", transform:"translateX(-50%)",
            width:70, height:70, borderRadius:"50%",
            padding:0, border:"none", background:"none",
            cursor:"pointer", outline:"none", zIndex:10,
          }}
        >
          {/* Layer 1: outer dark bronze */}
          <div style={{
            width:"100%", height:"100%", borderRadius:"50%",
            background:"linear-gradient(145deg, #3D2E1E, #1A1108)",
            boxShadow: identityActive
              ? "0 0 0 1px rgba(200,158,80,0.5), 0 6px 28px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.08)"
              : "0 0 0 1px rgba(180,140,60,0.3), 0 6px 28px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.06)",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:4,
          }}>
            {/* Layer 2: brushed brass ring */}
            <div style={{
              width:"100%", height:"100%", borderRadius:"50%",
              background:"conic-gradient(from 130deg, #6B4D12, #C9A55A, #E8C870, #D4A84A, #7A5814, #C9A55A, #6B4D12)",
              display:"flex", alignItems:"center", justifyContent:"center",
              padding:3,
            }}>
              {/* Layer 3: inner dark marble */}
              <div style={{
                width:"100%", height:"100%", borderRadius:"50%",
                background:"radial-gradient(circle at 38% 32%, #2E2820, #17130E, #0B0907)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <i className={"ti " + piece.icon} style={{
                  fontSize:28,
                  color: identityActive ? "#F0E4CC" : "#C8B890",
                  filter:"drop-shadow(0 1px 4px rgba(0,0,0,0.95)) drop-shadow(0 -0.5px 1px rgba(255,240,200,0.08))",
                  position:"relative", top:1,
                }}/>
              </div>
            </div>
          </div>
        </button>
      </div>

      {NAV_ITEMS.slice(2).map(item => <SideBtn key={item.id} {...item}/>)}
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


