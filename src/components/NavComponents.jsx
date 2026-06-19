import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';

export function PBar({pct, h=2, color=T.gold}) {
  return (
    <div style={{height:h,background:T.divider,borderRadius:h}}>
      <div style={{width:Math.min(100,Math.max(0,pct))+"%",height:"100%",background:"linear-gradient(90deg,"+T.goldDark+","+color+")",borderRadius:h,transition:"width 0.6s ease"}}/>
    </div>
  );
}

export function TabBar({tab, setTab}) {
  const tabs = [
    { id:"home", label:"Home",
      Icon: ({a}) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 9L10 3l7 6v9a1 1 0 01-1 1H6a1 1 0 01-1-1v-5h4v5" stroke={a?"#8A9E84":"rgba(247,243,236,0.45)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    },
    { id:"sessions", label:"Programme",
      Icon: ({a}) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="1.5" stroke={a?"#8A9E84":"rgba(247,243,236,0.45)"} strokeWidth="1.5"/><path d="M3 8h14M7 2v4M13 2v4" stroke={a?"#8A9E84":"rgba(247,243,236,0.45)"} strokeWidth="1.5" strokeLinecap="round"/></svg>
    },
    { id:"progress", label:"Progress",
      Icon: ({a}) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 15l4-5 3 3 4-6 3 3" stroke={a?"#8A9E84":"rgba(247,243,236,0.45)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    },
    { id:"toolkit", label:"Toolkit",
      Icon: ({a}) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="9" rx="1" stroke={a?"#8A9E84":"rgba(247,243,236,0.45)"} strokeWidth="1.5"/><path d="M7 8V6a3 3 0 016 0v2" stroke={a?"#8A9E84":"rgba(247,243,236,0.45)"} strokeWidth="1.5" strokeLinecap="round"/></svg>
    },
  ];
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0,
      background:"#2C2416",
      borderTop:"1px solid rgba(255,255,255,0.08)",
      display:"flex", alignItems:"stretch",
      zIndex:200,
      paddingBottom:"env(safe-area-inset-bottom,0px)",
      boxShadow:"0 -4px 20px rgba(0,0,0,0.25)",
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} style={{
            flex:1, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:4, minHeight:56, border:"none",
            background:"transparent", cursor:"pointer",
            padding:"10px 4px 10px",
          }}>
            <Icon a={active}/>
            <span style={{
              fontSize:10, fontWeight: active ? 600 : 400,
              color: active ? "#8A9E84" : "rgba(247,243,236,0.45)",
              fontFamily:"'Inter',sans-serif", letterSpacing:"0.01em",
            }}>{label}</span>
            {active && <div style={{width:20,height:2,background:"#8A9E84",borderRadius:1,marginTop:1}}/>}
          </button>
        );
      })}
    </div>
  );
}

// ─── FLOATING NAVIGATION ─────────────────────────────────────────────────────
// Design: "The Chamber" — transparent over hero, glass on scroll. No sidebar.
// Typography-first. Atmosphere-first. Software-last.
export const NAV_H = 64;
// SIDEBAR_W kept at 0 — sidebar is gone on desktop
const SIDEBAR_W = 0;

export function FloatingNav({ tab, setTab, streak, done, dark, activeRole, inSession=false, onExitToTab }) {
  const pct = Math.round(done.length / 14 * 100);
  const [scrolled, setScrolled] = useState(false);
  const [confirmTab, setConfirmTab] = useState(null);

  function handleNavClick(id) {
    if (inSession) { setConfirmTab(id); } else { setTab(id); }
  }

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    fn(); // check on mount
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const ITEMS = [
    { id: "home",     label: "Home" },
    { id: "sessions", label: "Programme" },
    { id: "progress", label: "Progress" },
    { id: "toolkit",  label: "Toolkit" },
  ];

  // Parchment when scrolled (light screens), dark glass over hero (top of home)
  const onHero = !scrolled && tab === "home";
  const navBg = onHero
    ? "rgba(18,15,11,0.32)"
    : "rgba(247,243,236,0.94)";
  const navBorder = onHero
    ? "0.5px solid transparent"
    : "0.5px solid #DDD5C4";
  const logoColor  = onHero ? "rgba(255,255,255,0.92)" : T.text;
  const linkActive = onHero ? "rgba(255,255,255,0.92)" : T.text;
  const linkInact  = onHero ? "rgba(255,255,255,0.42)" : T.text3;
  const linkActiveBg = onHero ? "rgba(255,255,255,0.12)" : "rgba(138,158,132,0.12)";

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
      background: navBg,
      backdropFilter: "blur(24px) saturate(180%)",
      WebkitBackdropFilter: "blur(24px) saturate(180%)",
      borderBottom: navBorder,
      transition: "background 0.45s ease, border-color 0.4s ease",
      display: "flex", alignItems: "center",
      padding: "0 56px",
    }}>
      {/* Logo mark */}
      <button onClick={() => handleNavClick("home")} style={{
        background: "none", border: "none", padding: 0,
        cursor: "pointer", marginRight: 48, flexShrink: 0,
        display: "flex", alignItems: "center",
      }}>
        <img src="/logo-nav.jpg" alt="AmplifyU"
          style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover",
            filter: onHero ? "brightness(1.4)" : "none",
            transition: "filter 0.4s ease",
            boxShadow: onHero ? "none" : "0 1px 4px rgba(0,0,0,0.12)",
          }}/>
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
                background: a ? linkActiveBg : "transparent",
                fontSize: 13, fontWeight: a ? 500 : 400,
                color: a ? (onHero ? linkActive : T.gold) : linkInact,
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
            <span style={{
              fontFamily: T.serif, fontSize: 17, fontWeight: 600,
              color: T.gold, lineHeight: 1, letterSpacing: "-0.5px",
              transition: "color 0.4s ease",
            }}>{streak}</span>
            <span style={{
              fontSize: 9, color: onHero ? "rgba(255,255,255,0.3)" : T.text3,
              textTransform: "uppercase", letterSpacing: "2px", fontFamily: T.sans,
              transition: "color 0.4s ease",
            }}>streak</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 80, height: 1, background: onHero ? "rgba(255,255,255,0.12)" : T.divider, borderRadius: 1, overflow: "hidden" }}>
            <div style={{
              width: pct + "%", height: "100%",
              background: "linear-gradient(90deg," + T.goldDark + "," + T.gold + ")",
              borderRadius: 1, transition: "width 1s ease",
            }}/>
          </div>
          <span style={{ fontSize: 10.5, color: T.gold, fontWeight: 500, fontFamily: T.sans }}>{pct}%</span>
        </div>
      </div>
    </div>
    </>
  );
}

// Keep Sidebar as a legacy no-op for mobile (mobile still uses TabBar)
export function Sidebar() { return null; }


