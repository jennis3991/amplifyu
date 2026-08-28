import { useState, useEffect, useRef } from "react";
import { applyUpdate } from "./pwa.js";
import { T } from "./theme.js";
import { LESSONS, ROLES } from "./data.js";
import { useIsDesktop, getStreak, ls, lsSet } from "./utils.js";
import { SpeechTest } from "./screens/SpeechTest.jsx";
import { SessionView } from "./screens/SessionView.jsx";
import { HomeScreen } from "./screens/HomeScreen.jsx";
import { SessionsScreen } from "./screens/SessionsScreen.jsx";
import { ProgressScreen } from "./screens/ProgressScreen.jsx";
import { ToolkitScreen } from "./screens/ToolkitScreen.jsx";
import { QuickPrepFlow } from "./screens/QuickPrepFlow.jsx";
import { ReflectionScreen } from "./screens/ReflectionScreen.jsx";
import { IdentityScreen } from "./screens/IdentityScreen.jsx";
import { Onboarding } from "./screens/Onboarding.jsx";
import { FloatingNav, TabBar } from "./components/NavComponents.jsx";
import { Celebrate } from "./components/Confetti.jsx";
import { AccessGate } from "./components/AccessGate.jsx";

// ── UpdateBanner ─────────────────────────────────────────────────────────────
// Listens for 'sw-update-available' and renders a slim fixed bottom banner.
// The service worker now activates itself automatically in the background
// (see public/sw.js) — this banner is just a visible confirmation, and its
// button is an optional "see it now" refresh, not something required for
// the update to take effect (it applies on the next natural foreground too).
function UpdateBanner() {
  const [reg, setReg] = useState(null);

  useEffect(() => {
    function handleUpdate(e) {
      setReg(e.detail?.registration || null);
    }
    window.addEventListener('sw-update-available', handleUpdate);
    return () => window.removeEventListener('sw-update-available', handleUpdate);
  }, []);

  if (!reg) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: "#2C2416",
      color: "#F7F3EC",
      padding: "10px 16px 10px 18px",
      borderRadius: 6,
      boxShadow: "0 4px 24px rgba(44,36,22,0.35)",
      fontFamily: "'Inter',-apple-system,sans-serif",
      fontSize: 13,
      fontWeight: 400,
      whiteSpace: "nowrap",
      maxWidth: "calc(100vw - 32px)",
    }}>
      <span style={{ flex: 1 }}>Updated in the background — refresh to see it now</span>
      <button
        onClick={() => { applyUpdate(reg); window.location.reload(); }}
        style={{
          background: "#8A9E84",
          color: "#2C2416",
          border: "none",
          borderRadius: 4,
          padding: "6px 14px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          flexShrink: 0,
        }}
      >
        Update Now
      </button>
      <button
        onClick={() => setReg(null)}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(247,243,236,0.45)",
          fontSize: 16,
          cursor: "pointer",
          padding: "0 2px",
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ─── ROOT 
export default function App() {
  const isDesktop = useIsDesktop();
  const [authed, setAuthed] = useState(() => { try { return localStorage.getItem("au1_authed") === "true"; } catch (_) { return false; } });
  const [boarded, setBoarded] = useState(() => ls("au1_ob", false));
  const [done, setDone] = useState(() => ls("au1_done", []));
  const [cur, setCur] = useState(() => 
Math.min(Math.max(ls("au1_day",1),1),14));
  const [roleId, setRoleId] = useState(() => ls("au1_role", null));
  const [dark, setDark] = useState(() => ls("au1_dark", false));
  const [reflectionData, setReflectionData] = useState(null);  // holds onboarding answers for reflection screen
  const [justBoarded, setJustBoarded] = useState(false);
  const [view2, setView2] = useState("main");  // "main" | "reflection"
  const [tab, setTab] = useState("home");
  const [view, setView] = useState("main");
  const scrollRef = useRef(null);
  useEffect(() => {
    try { history.scrollRestoration = 'manual'; } catch(_) {}
  }, []);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [tab, view]);
  const [selDay, setSelDay] = useState(1);
  const [cel, setCel] = useState(null);
  const sessionStartRef = useRef(null);
  const streak = getStreak(done);
  const activeRole = ROLES.find(r => r.id === roleId) || null;
  // Daily reminder nudge — show if today's session not done and app opened after 18h gap
  const [showNudge, setShowNudge] = useState(() => {
    try {
      const todayKey = new Date().toDateString();
      const lastOpen = localStorage.getItem("au1_last_open");
      const todayDone = 
JSON.parse(localStorage.getItem("au1_done")||"[]");
      const currentDay = 
Math.min(Math.max(JSON.parse(localStorage.getItem("au1_day")||"1"),1),14);
      const sessionDoneToday = todayDone.includes(currentDay);
      // Show nudge if: last opened a different day AND today's session not done
      const isDifferentDay = lastOpen !== todayKey;
      if (isDifferentDay && !sessionDoneToday && todayDone.length < 14) {
        localStorage.setItem("au1_last_open", todayKey);
        return true;
      }
      localStorage.setItem("au1_last_open", todayKey);
      return false;
    } catch { return false; }
  });
  function toggleDark() { const d = !dark; setDark(d); 
lsSet("au1_dark",d); }
  const [confirmReset, setConfirmReset] = useState(false);
  function doReset() {
    ["au1_ob","au1_done","au1_day","au1_role"].forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
    setBoarded(false); setDone([]); setCur(1); setRoleId(null);
    setConfirmReset(false); setTab("home"); setView("main");
  }

  function startSession(d) { sessionStartRef.current = Date.now(); setSelDay(d); setView("session"); }
  function startSessionAtStep(d, stepName) { try{localStorage.setItem("au1_initial_step",stepName);}catch{} sessionStartRef.current = Date.now(); setSelDay(d); setView("session"); }
  function completeDay(d) {
    if (!done.includes(d)) {
      const upd = [...done, d];
      setDone(upd);
      lsSet("au1_done", upd);
      const nx = Math.min(d+1, 14);
      setCur(nx);
      lsSet("au1_day", nx);
      if (sessionStartRef.current) {
        const mins = Math.min(Math.round((Date.now() - sessionStartRef.current) / 60000), 60);
        if (mins > 0) {
          try {
            const log = JSON.parse(localStorage.getItem("au1_time_log") || "{}");
            log[d] = mins;
            localStorage.setItem("au1_time_log", JSON.stringify(log));
          } catch {}
        }
      }
    }
    setCel(d);
  }

  const wrapStyle = {minHeight:"100vh",background:dark?"#0B0D10":T.bg,fontFamily:T.sans,position:"relative",overflowX:"hidden"};
  // Dark mode token overrides — passed as context via inline vars
  // Dark mode: warm espresso palette (NOT cold blue — Soho House, not fintech)
  const DK = dark ? {
    bg:"#19160F", surface:"#201D18", card:"#262119", cardDark:"#100E0B",
    border:"rgba(255,255,255,0.07)", divider:"rgba(255,255,255,0.05)",
    text:"rgba(255,255,255,0.90)", text2:"rgba(255,255,255,0.68)",
    text3:"rgba(255,255,255,0.40)", text4:"rgba(255,255,255,0.22)",
    navyLight:"rgba(138,158,132,0.1)", goldLight:"rgba(138,158,132,0.12)",
    goldDark:T.gold, greenBg:"rgba(82,112,96,0.2)", green:"#8A9E84",
  } : {};

  if (!authed) return <AccessGate onSuccess={() => setAuthed(true)} />;

  // Speech test route — bypass all app state
  if (window.location.pathname === '/speech-test') return <SpeechTest />;

  // Reflection screen — check FIRST, before the !boarded onboarding check
  if (reflectionData) {
    return (
      <div style={{...wrapStyle, animation:"fadeIn 0.45s ease both"}}>
        
<style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html{-webkit-font-smoothing:antialiased;}body{background:#0B0D10;}::-webkit-scrollbar{display:none;}button{cursor:pointer;font-family:inherit;}@keyframes 
slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes 
fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <ReflectionScreen
          answers={reflectionData}
          onContinue={() => {
            setBoarded(true);
            lsSet("au1_ob", true);
            setReflectionData(null);
            setJustBoarded(true);
            setTab("home");
          }}
        />
      </div>
    );
  }

  if (!boarded) {
    return <Onboarding onDone={(ans) => {
      if (ans.role) { setRoleId(ans.role); lsSet("au1_role", ans.role); }
      lsSet("au1_quiz", ans);
      setReflectionData(ans);
    }}/>;
  }

  if (view === "session") {
    return (
      <div style={wrapStyle}>
        <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html{-webkit-font-smoothing:antialiased;}body{background:#F7F3EC;}::-webkit-scrollbar{display:none;}button{cursor:pointer;font-family:inherit;}@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {cel && <Celebrate day={cel} onClose={() => { setCel(null); setView("main"); setTab("home"); }}/>}
        {isDesktop && <FloatingNav tab={tab} setTab={setTab} streak={streak} done={done} dark={dark} activeRole={activeRole} inSession={view==="session"} onExitToTab={(t)=>{setTab(t);setView("main");}} day={selDay}/>}
        <SessionView lesson={LESSONS[Math.min(selDay-1,13)]}
isDone={done.includes(selDay)} onComplete={() => completeDay(selDay)}
onBack={() => setView("main")} roleId={roleId} activeRole={activeRole}
dark={dark} DK={DK} isDesktop={isDesktop}/>
      </div>
    );
  }

  if (view === "quickprep") {
    return (
      <div style={wrapStyle}>
        
<style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html{-webkit-font-smoothing:antialiased;}body{background:#F7F3EC;}::-webkit-scrollbar{display:none;}button{cursor:pointer;font-family:inherit;}@keyframes 
slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <QuickPrepFlow onBack={() => setView("main")}/>
      </div>
    );
  }

  return (
    <div
style={Object.assign({},wrapStyle,{display:"flex",flexDirection:"column",height:isDesktop?"auto":"100dvh",overflow:isDesktop?"visible":"hidden"},justBoarded?{animation:"fadeIn 0.45s ease both"}:{})}>
      
<style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html{-webkit-font-smoothing:antialiased;}body{background:#F7F3EC;}::-webkit-scrollbar{display:none;}button{cursor:pointer;font-family:inherit;}@keyframes 
slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <UpdateBanner />
      {cel && <Celebrate day={cel} onClose={() => setCel(null)}/>}
      {confirmReset && (
        <div 
style={{position:"fixed",inset:0,zIndex:300,background:"rgba(11,13,16,0.7)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
          <div 
style={{background:dark?"#111C2E":T.surface,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:360,border:"1px solid rgba(139,32,32,0.2)"}}>
            <div 
style={{fontSize:24,textAlign:"center",marginBottom:12}}>⚠️</div>
            <h3 
style={{fontFamily:T.serif,fontSize:20,fontWeight:700,color:dark?"rgba(255,255,255,0.9)":T.text,textAlign:"center",marginBottom:10}}>Reset 
your profile?</h3>
            <p 
style={{fontSize:13,color:dark?"rgba(255,255,255,0.5)":T.text3,textAlign:"center",lineHeight:1.6,marginBottom:24}}>This 
will clear your progress, streak, and role selection. Your saved phrases 
and notes will stay. This cannot be undone.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setConfirmReset(false)} 
style={{flex:1,padding:"13px",borderRadius:10,border:"1px solid "+(dark?"rgba(255,255,255,0.12)":T.border),background:"transparent",color:dark?"rgba(255,255,255,0.6)":T.text3,fontSize:14,cursor:"pointer"}}>Cancel</button>
              <button onClick={doReset} 
style={{flex:1,padding:"13px",borderRadius:10,border:"none",background:"#8B2020",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>Yes, 
reset</button>
            </div>
          </div>
        </div>
      )}
      {isDesktop && <FloatingNav tab={tab} setTab={setTab} streak={streak} done={done} dark={dark} activeRole={activeRole} inSession={view==="session"} onExitToTab={(t)=>{setTab(t);setView("main");}} day={cur}/>}
      <div ref={scrollRef} className="au-grain-wrap" style={{flex:1,overflowY:"auto",marginLeft:0,paddingBottom:0,background:dark?"#19160F":T.bg}}>
        {tab==="home" && <HomeScreen done={done} cur={cur} streak={streak} onStart={startSession} roleId={roleId} activeRole={activeRole} dark={dark} DK={DK} showNudge={showNudge} onDismissNudge={()=>setShowNudge(false)} isDesktop={isDesktop} onOpenTab={(t)=>{try{localStorage.setItem("au1_open_toolkit_tab",t);}catch{}setTab("toolkit");}}/>}
        {tab==="sessions" && <SessionsScreen done={done} cur={cur} onStart={startSession} roleId={roleId} dark={dark} DK={DK} isDesktop={isDesktop} onOpenTab={(t)=>{try{localStorage.setItem("au1_open_toolkit_tab",t);}catch{}setTab("toolkit");}}/>}
        {tab==="progress" && <ProgressScreen done={done} cur={cur} streak={streak} roleId={roleId} activeRole={activeRole} onChangeRole={(r)=>{setRoleId(r);lsSet("au1_role",r);}} dark={dark} toggleDark={toggleDark} DK={DK} onReset={()=>setConfirmReset(true)} isDesktop={isDesktop} onStart={startSession}/>}
        {tab==="toolkit" && <ToolkitScreen onQuickPrep={() => setView("quickprep")} onStartSession={startSessionAtStep} dark={dark} DK={DK} isDesktop={isDesktop} done={done}/>}
        {tab==="identity" && <IdentityScreen done={done}/>}
      </div>
      {!isDesktop && <TabBar tab={tab} setTab={setTab} done={done} dark={dark}/>}
    </div>
  );
}

