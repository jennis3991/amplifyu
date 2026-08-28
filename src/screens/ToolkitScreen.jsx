import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';
import { FURTHER_READING, PHRASES, SAY_THIS, QUICK_PREP, DAILY_INSIGHTS, POWER_PHRASES } from '../data.js';
import { Scene } from '../scenes.jsx';
import { PracticeSpace } from '../modules/PracticeSpace.jsx';

// ─── My Saved Work — aggregates every day's saved-results store into one list ──
// Two localStorage keys hold everything: au1_stories (Day 8's two sources) and
// au1_toolkits (Day 1, Day 2, and Day 11's four sources). Each source keeps its own
// independent cap, enforced by its own widget — this view only reads/deletes,
// it never writes new entries or touches caps.
function loadSavedWork() {
  let stories = [], toolkits = [];
  try { stories = JSON.parse(localStorage.getItem("au1_stories") || "[]"); } catch {}
  try { toolkits = JSON.parse(localStorage.getItem("au1_toolkits") || "[]"); } catch {}
  return [...stories, ...toolkits].sort((a,b)=>(b.timestamp||0)-(a.timestamp||0));
}
const SAVED_WORK_KEY = { 'speechwriter':'au1_stories', 'rehearsal':'au1_stories', 'brand-rehearsal':'au1_toolkits', 'linkedin-audit':'au1_toolkits', 'voice-analysis-day1':'au1_toolkits', 'voice-analysis-day2':'au1_toolkits' };
const SAVED_WORK_SOURCES = {
  'voice-analysis-day1': {
    dayLabel: "Day 1 · Clarity", clickable: true, day: 1, step: "Simulation",
    icon: c => <svg width="16" height="16" viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={c} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2M8 19h6" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
    getTitle: e => e.result?.headline || e.prompt || "Clarity check-in",
    getPreview: e => e.result?.subtitle || (e.transcript ? e.transcript.slice(0,140) : ""),
    getBadge: e => typeof e.result?.overall === 'number' ? `${e.result.overall}/100` : null,
  },
  'voice-analysis-day2': {
    dayLabel: "Day 2 · Voice", clickable: true, day: 2, step: "Simulation",
    icon: c => <svg width="16" height="16" viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={c} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2M8 19h6" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
    getTitle: e => e.result?.headline || e.prompt || "Voice analysis",
    getPreview: e => e.result?.subtitle || (e.transcript ? e.transcript.slice(0,140) : ""),
    getBadge: e => typeof e.result?.overall === 'number' ? `${e.result.overall}/100` : null,
  },
  'brand-rehearsal': {
    dayLabel: "Day 11 · Rehearsal", clickable: true, day: 11, step: "Rehearsal",
    icon: c => <svg width="16" height="16" viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4H17l-3.5 2.5 1.5 4L11 11l-4 2.5 1.5-4L5 7h4.5z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
    getTitle: e => (e.strengths||[]).slice(0,2).join(', ') || "Professional Signature",
    getPreview: e => e.statement || (e.signature ? e.signature.slice(0,140) : ""),
    getBadge: () => null,
  },
  'linkedin-audit': {
    dayLabel: "Day 11 · LinkedIn", clickable: true, day: 11, step: "Simulation",
    icon: c => <svg width="16" height="16" viewBox="0 0 22 22" fill="none"><rect x="3" y="4" width="16" height="14" rx="2" stroke={c} strokeWidth="1.3"/><circle cx="8" cy="10" r="2" stroke={c} strokeWidth="1.3"/><path d="M5 15c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M13 8h3M13 11h3" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
    getTitle: e => e.headline || "Untitled toolkit",
    getPreview: e => (e.about||"").split(/\n+/)[0]?.slice(0,140) || "",
    getBadge: e => e.cv ? "CV included" : null,
  },
  'speechwriter': {
    dayLabel: "Day 8 · Story Lab", clickable: true, day: 8, step: "Simulation",
    icon: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19V5a2 2 0 012-2h13a1 1 0 011 1v14" stroke={c} strokeWidth="1.3"/><path d="M4 19a2 2 0 002 2h13a1 1 0 001-1v-1" stroke={c} strokeWidth="1.3"/><path d="M8 7h8M8 11h5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
    getTitle: e => e.coverTitle || e.storyWorld?.subject || "Untitled story",
    getPreview: e => e.coverSubtitle || (e.story ? e.story.slice(0,140) : ""),
    getBadge: () => null,
  },
  'rehearsal': {
    dayLabel: "Day 8 · Rehearsal", clickable: false, day: 8, step: "Rehearsal",
    icon: c => <svg width="16" height="16" viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={c} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2M8 19h6" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
    getTitle: e => e.coverTitle || "Untitled story",
    getPreview: e => e.coachObservation || (e.beats?.[0] ? e.beats[0].slice(0,140) : ""),
    getBadge: () => null,
  },
};

// "Study a Master" reference — lives in the Practice Space tab (it's a
// reflection exercise, not an AI tool, so it doesn't belong on AI Tools).
const MASTER_COMMUNICATORS = [
  {emoji:"🌍",name:"David Attenborough",role:"Master of Clarity",sub:"Known for explaining the most complex subjects in a way anyone can understand. His communication is calm, precise, and remarkably clear — never a word wasted.",watchFor:["Pace and deliberate pacing","Simplicity of language","Precision in word choice","Storytelling that draws you in"],connection:[["Day 1","Clarity"],["Day 4","Precision"]],reflection:"What makes his explanations so easy to follow?"},
  {emoji:"🎙️",name:"Steven Bartlett",role:"Master of Listening",sub:"Known for creating conversations that reveal profound insight. He speaks less than almost any other interviewer — and gets more from his guests because of it.",watchFor:["Active listening over speaking","Follow-up questions that go deeper","Comfortable silence — he never fills it","Genuine curiosity over performance"],connection:[["Day 3","Pause Principle"],["Day 6","High-Stakes Conversations"]],reflection:"How often does he speak versus listen? What does the silence do?"},
  {emoji:"⚖️",name:"Amal Clooney",role:"Master of Precision Under Pressure",sub:"Known for communicating on some of the world's most challenging issues — human rights, international justice. What makes her remarkable isn't volume or emotion. It's clarity, precision, and calm conviction.",watchFor:["Structured, evidence-based arguments","Deliberate and considered language","Composed delivery under scrutiny","Calm authority without aggression"],connection:[["Day 4","Precision"],["Day 5","PRE Framework"],["Day 6","Composure"]],reflection:"How does she remain calm while discussing emotionally charged topics?"},
  {emoji:"🎤",name:"Simon Sinek",role:"Master of Structure",sub:"Known for turning complex ideas into memorable frameworks. His communication is simple, organised, and impossible to forget — because he builds the idea with you, not at you.",watchFor:["Clear beginning, middle, end","Strategic repetition of key phrases","Memorable, simple language","Pauses that let ideas land"],connection:[["Day 1","Feynman Technique"],["Day 5","PRE Framework"]],reflection:"How does he make complex ideas feel inevitable and simple?"},
];

// ─── Toolkit-only colour system — AI Tools tab + hero/tab-nav only ──────────
// Sophisticated, understated palette (Soho House-adjacent). Deliberately not
// the shared theme.js tokens — the other 8 Toolkit tabs keep those. No gold,
// mustard, burgundy or terracotta anywhere in this object.
const TK = {
  bg:      "#F4F1EA", // Warm Ivory — main background
  surface: "#EAE6DE", // Soft Stone — cards and containers
  border:  "#D8D0C4", // Light Taupe — borders/dividers
  sage:    "#A8B3A3", // Muted Sage — primary accent
  sageDark:"#718071", // Deep Sage — stronger accent/active states
  text:    "#242321", // Charcoal — primary text and dark icons
  ink:     "#161513", // Soft Black — deepest contrast/navigation
  text3:   "#958C80", // Warm Taupe Text — secondary text/metadata
  onDark:  "#F8F6F1", // Warm Off-White — icon artwork on dark backgrounds
  taupe:   "#B7ADA0", // Warm Taupe — icon assignment (Leadership, Personal Brand)
};

// ─── Path Detail Screen — dark header + progress card + numbered step list ──
// Shared by all three Toolkit Paths (Promotion / Presentation / Visibility).
// "Step X of Y" / percentage is derived from the coarse whole-day `done`
// array (the app has no finer-grained per-step completion tracking) — a step
// counts as complete once its underlying lesson day is marked done.
function PathDetailScreen({ T, isDesktop, path, onBack, launch, done }) {
  const completedSteps = path.steps.filter(s => done.includes(s.day)).length;
  const currentStepNum = Math.min(completedSteps + 1, path.steps.length);
  const pct = Math.round((currentStepNum / path.steps.length) * 100);
  const totalMins = path.steps.reduce((sum,s) => sum + s.time, 0);
  const Time = ({n}) => <div style={{display:"flex",alignItems:"center",gap:5}}><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={TK.text3} strokeWidth="1.2"/><path d="M8 5v3l2 1.5" stroke={TK.text3} strokeWidth="1.2" strokeLinecap="round"/></svg><span style={{fontFamily:T.sans,fontSize:12,color:TK.text3}}>{n} min</span></div>;

  return (
    <div style={{background:TK.bg,minHeight:"100vh"}}>
      {/* Dark header banner */}
      <div style={{position:"relative",background:TK.ink,overflow:"hidden",padding:isDesktop?"36px 88px 0":"24px 20px 0"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 80% 20%, rgba(168,179,163,0.08) 0%, transparent 55%)"}}/>
        <div style={{position:"relative",maxWidth:isDesktop?1160:undefined,margin:isDesktop?"0 auto":undefined}}>
          <button onClick={onBack} style={{width:40,height:40,borderRadius:"50%",background:"rgba(248,246,241,0.1)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:isDesktop?28:20}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 3L5 9l6 6" stroke={TK.onDark} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,paddingBottom:44}}>
            <div>
              <h1 style={{fontFamily:T.serif,fontSize:isDesktop?42:28,fontWeight:600,color:TK.onDark,lineHeight:1.1,margin:"0 0 10px"}}>{path.label}</h1>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:"rgba(248,246,241,0.6)",margin:"0 0 16px"}}>{path.desc}</p>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <span style={{display:"flex",alignItems:"center",gap:5,fontFamily:T.sans,fontSize:13,color:"rgba(248,246,241,0.5)"}}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="rgba(248,246,241,0.5)" strokeWidth="1.2"/><path d="M8 5v3l2 1.5" stroke="rgba(248,246,241,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  {path.steps.length} tools
                </span>
                <span style={{color:"rgba(248,246,241,0.3)"}}>•</span>
                <span style={{fontFamily:T.sans,fontSize:13,color:"rgba(248,246,241,0.5)"}}>{totalMins} min total</span>
                <span style={{color:"rgba(248,246,241,0.3)"}}>•</span>
                <span style={{fontFamily:T.sans,fontSize:13,color:"rgba(248,246,241,0.5)"}}>Beginner friendly</span>
              </div>
            </div>
            <div style={{width:isDesktop?110:80,height:isDesktop?110:80,borderRadius:"50%",background:"rgba(168,179,163,0.1)",border:"1px solid rgba(168,179,163,0.22)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <div style={{width:isDesktop?74:54,height:isDesktop?74:54,borderRadius:"50%",background:path.tint,display:"flex",alignItems:"center",justifyContent:"center"}}>{path.icon}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={isDesktop?{maxWidth:1160,margin:"0 auto",padding:"0 88px 60px"}:{padding:"0 20px 40px"}}>
        {/* Your Progress card */}
        <div style={{marginTop:-24,position:"relative",zIndex:2,background:TK.surface,borderRadius:12,border:"0.5px solid "+TK.border,padding:isDesktop?"24px 28px":"18px 20px",boxShadow:"0 6px 24px rgba(22,21,19,0.1)"}}>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:TK.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Your Progress</div>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?22:19,fontWeight:600,color:TK.text}}>Step {currentStepNum} of {path.steps.length}</div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:TK.text}}>{pct}%</div>
          </div>
          <div style={{height:8,background:TK.border,borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:pct+"%",background:TK.sageDark,borderRadius:4,transition:"width 0.4s ease"}}/>
          </div>
        </div>

        {/* YOUR PATH */}
        <div style={{marginTop:isDesktop?40:28}}>
          <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,fontWeight:700,color:TK.text,textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>Your Path</div>
          <div style={{display:"flex",flexDirection:"column"}}>
            {path.steps.map((s,i) => {
              const isActive = i === currentStepNum - 1;
              const isLast = i === path.steps.length - 1;
              return (
                <div key={i} style={{display:"flex",gap:16}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:s.tint,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontFamily:T.sans,fontSize:14,fontWeight:700,color:TK.onDark}}>{i+1}</span>
                    </div>
                    {!isLast && <div style={{flex:1,minHeight:44,borderLeft:"1.5px dotted "+TK.border,marginTop:4}}/>}
                  </div>
                  <div style={{flex:1,background:TK.surface,borderRadius:10,border:"0.5px solid "+TK.border,padding:isDesktop?"20px 22px":"16px 16px",marginBottom:isLast?0:16,display:"flex",flexDirection:"column",gap:10,minWidth:0}}>
                    <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                      <div style={{width:40,height:40,borderRadius:8,background:s.tint,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:T.serif,fontSize:isDesktop?17:16,fontWeight:600,color:TK.text,marginBottom:s.subtitle?2:3}}>{s.label}</div>
                        {s.subtitle && <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:TK.sageDark,marginBottom:4}}>{s.subtitle}</div>}
                        <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:TK.text3,lineHeight:1.5}}>{s.desc}</div>
                      </div>
                    </div>
                    {s.tags && s.tags.length > 0 && (
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {s.tags.map((tag,j)=><span key={j} style={{fontFamily:T.sans,fontSize:11,color:TK.text3,padding:"3px 10px",border:"0.5px solid "+TK.border,borderRadius:20,whiteSpace:"nowrap"}}>{tag}</span>)}
                      </div>
                    )}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:2,flexWrap:"wrap",gap:10}}>
                      <Time n={s.time}/>
                      <button onClick={()=>launch(s.day,s.step)} style={isActive ? {
                          padding:isDesktop?"11px 24px":"10px 18px",borderRadius:6,border:"none",background:TK.ink,color:TK.onDark,fontFamily:T.sans,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                        } : {
                          padding:isDesktop?"11px 24px":"10px 18px",borderRadius:6,border:"1px solid "+TK.border,background:"transparent",color:TK.text,fontFamily:T.sans,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                        }}>
                        Start <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skill Detail Screen — dark header + one featured simulation ────────────
// Simpler sibling of PathDetailScreen: a skill page doesn't have an ordered
// multi-step journey (yet), so no progress card / numbered list — just a
// header and a "Featured Simulation" card. Built to hold more tools
// alongside the featured one in a later pass without changing this shape.
function SkillDetailScreen({ T, isDesktop, skill, onBack, launch }) {
  const f = skill.featured;
  return (
    <div style={{background:TK.bg,minHeight:"100vh"}}>
      <div style={{position:"relative",background:TK.ink,overflow:"hidden",padding:isDesktop?"36px 88px 44px":"24px 20px 32px"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 80% 20%, rgba(168,179,163,0.08) 0%, transparent 55%)"}}/>
        <div style={{position:"relative",maxWidth:isDesktop?1160:undefined,margin:isDesktop?"0 auto":undefined}}>
          <button onClick={onBack} style={{width:40,height:40,borderRadius:"50%",background:"rgba(248,246,241,0.1)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:isDesktop?28:20}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 3L5 9l6 6" stroke={TK.onDark} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24}}>
            <div>
              <h1 style={{fontFamily:T.serif,fontSize:isDesktop?42:28,fontWeight:600,color:TK.onDark,lineHeight:1.1,margin:"0 0 10px"}}>{skill.label}</h1>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:"rgba(248,246,241,0.6)",margin:0}}>{skill.desc}</p>
            </div>
            <div style={{width:isDesktop?80:60,height:isDesktop?80:60,borderRadius:"50%",background:"rgba(168,179,163,0.1)",border:"1px solid rgba(168,179,163,0.22)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <div style={{width:isDesktop?50:38,height:isDesktop?50:38,borderRadius:"50%",background:skill.tint,display:"flex",alignItems:"center",justifyContent:"center"}}>{skill.bigIcon}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={isDesktop?{maxWidth:1160,margin:"0 auto",padding:"32px 88px 60px"}:{padding:"24px 20px 40px"}}>
        <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,fontWeight:700,color:TK.text,textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>Featured Simulation</div>
        <div style={{background:TK.surface,borderRadius:10,border:"0.5px solid "+TK.border,padding:isDesktop?"22px 24px":"18px 18px",display:"flex",gap:16,alignItems:"center",flexWrap:isDesktop?"nowrap":"wrap"}}>
          <div style={{width:44,height:44,borderRadius:8,background:f.tint,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{f.icon}</div>
          <div style={{flex:1,minWidth:isDesktop?0:"100%"}}>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:TK.text,marginBottom:4}}>{f.label}</div>
            <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:TK.text3,lineHeight:1.5}}>{f.desc}</div>
          </div>
          <button onClick={()=>launch(f.day,f.step)} style={{padding:isDesktop?"12px 24px":"10px 18px",borderRadius:6,border:"none",background:TK.ink,color:TK.onDark,fontFamily:T.sans,fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>Start →</button>
        </div>
      </div>
    </div>
  );
}

export function ToolkitScreen({onQuickPrep, onStartSession, dark=false, DK={}, isDesktop=false, done=[]}) {
  const T2 = Object.assign({}, T, DK);
  const [tab, setTab] = useState("aitools");
  useEffect(() => {
    try {
      const pending = localStorage.getItem("au1_open_toolkit_tab");
      if (pending) { setTab(pending); localStorage.removeItem("au1_open_toolkit_tab"); }
    } catch(_) {}
  }, []);
  const [openPathId, setOpenPathId] = useState(null);
  const [openSkillId, setOpenSkillId] = useState(null);
  const [openPrepSub, setOpenPrepSub] = useState(null);
  const [openCat, setOpenCat] = useState(0);
  const [copied, setCopied] = useState(null);
  const [openMod, setOpenMod] = useState(null);
  const [openMasterCard, setOpenMasterCard] = useState(null);
  function copy(p) { try{navigator.clipboard?.writeText(p);}catch{}
setCopied(p); setTimeout(()=>setCopied(null),2000); }

  // ── My Saved Work ────────────────────────────────────────────────────────
  const [allSaved, setAllSaved] = useState(() => loadSavedWork());
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const confirmDeleteTimerRef = useRef(null);
  useEffect(() => { if (tab === "mywork") setAllSaved(loadSavedWork()); }, [tab]);
  function handleDeleteWork(entry) {
    clearTimeout(confirmDeleteTimerRef.current);
    if (confirmDeleteId === entry.id) {
      setConfirmDeleteId(null);
      const key = SAVED_WORK_KEY[entry.source];
      try {
        const list = JSON.parse(localStorage.getItem(key) || "[]").filter(e => e.id !== entry.id);
        localStorage.setItem(key, JSON.stringify(list));
      } catch {}
      setAllSaved(prev => prev.filter(e => e.id !== entry.id));
    } else {
      setConfirmDeleteId(entry.id);
      confirmDeleteTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  }
  function openSavedWork(entry) {
    const cfg = SAVED_WORK_SOURCES[entry.source];
    if (!cfg?.clickable) return;
    try { localStorage.setItem("au1_pending_load", JSON.stringify({ source: entry.source, id: entry.id })); } catch {}
    onStartSession && onStartSession(cfg.day, cfg.step);
  }

  const toolkitTabs = [["aitools","AI Tools"],["mywork","My Saved Work"+(allSaved.length>0?" ("+allSaved.length+")":"")],["practice","Practice Space"],["story","My Story"],["quickprep","Quick Prep"]];
  return (
    <div style={{background:T2.bg,minHeight:"100vh"}}>
      {!isDesktop && (
        <div style={{position:"relative",height:260,overflow:"hidden"}}>
          <img loading="lazy" src="/programme-hero.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%"}}/>
          <div style={{position:"absolute",inset:0,background:"rgba(22,21,19,0.35)"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(22,21,19,0.78) 0%,rgba(22,21,19,0.2) 50%,transparent 100%)"}}/>
          <div style={{position:"absolute",bottom:24,left:24}}>
            <div style={{fontSize:10,fontWeight:600,color:"rgba(248,246,241,0.55)",textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:8,fontFamily:T.sans}}>Your Operating System</div>
            <h1 style={{fontFamily:T.serif,fontSize:30,fontWeight:600,color:TK.onDark,letterSpacing:"-0.5px",lineHeight:1.1}}>Toolkit</h1>
          </div>
        </div>
      )}
      {isDesktop && (
        <div style={{position:"relative",height:420,overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <img loading="lazy" src="/programme-hero.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%"}}/>
          <div style={{position:"absolute",inset:0,background:"rgba(22,21,19,0.35)"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(22,21,19,0.75) 0%,rgba(22,21,19,0.2) 45%,transparent 100%)"}}/>
          <div style={{position:"relative",zIndex:2,maxWidth:1160,margin:"0 auto",width:"100%",padding:"0 88px 0",boxSizing:"border-box"}}>
            <div style={{animation:"fadeUp 0.7s ease both",paddingBottom:0}}>
              <div style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(248,246,241,0.55)",fontFamily:T.sans,fontWeight:500,marginBottom:14}}>Your Communication Operating System</div>
              <h1 style={{fontFamily:T.serif,fontSize:72,fontWeight:600,color:TK.onDark,letterSpacing:"-3px",lineHeight:0.92,marginBottom:18}}>Toolkit</h1>
              <p style={{fontFamily:T.sans,fontSize:16,color:"rgba(248,246,241,0.6)",fontWeight:300,margin:0,maxWidth:480}}>Powerful AI tools and exercises designed to help you communicate with greater clarity, confidence and impact.</p>
            </div>
          </div>
          {/* Tab nav — sits at the bottom of the hero */}
          <div style={{position:"relative",zIndex:2,background:"rgba(22,21,19,0.55)",backdropFilter:"blur(8px)",borderTop:"1px solid rgba(255,255,255,0.08)",marginTop:28}}>
            <div style={{maxWidth:1160,margin:"0 auto",padding:"0 88px",display:"flex",gap:2}}>
              {toolkitTabs.map(([id,label]) => (
                <button key={id} onClick={()=>setTab(id)} style={{padding:"12px 18px",border:"none",background:"transparent",fontSize:13,fontWeight:tab===id?600:400,color:tab===id?"rgba(248,246,241,0.95)":"rgba(248,246,241,0.45)",cursor:"pointer",borderBottom:tab===id?"2px solid "+TK.sageDark:"2px solid transparent",transition:"all 0.2s"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {!isDesktop && (<div style={{padding:"12px 20px 0",display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none",borderBottom:"1px solid "+T2.divider}}>
        {toolkitTabs.map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)} style={{padding:"8px 14px",borderRadius:20,border:"1px solid "+(tab===id?TK.sageDark:T2.border),background:tab===id?"rgba(168,179,163,0.14)":"transparent",color:tab===id?TK.sageDark:T2.text3,fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,marginBottom:8}}>{label}</button>
        ))}
      </div>)}
      <div style={isDesktop?{maxWidth:1160,margin:"0 auto",padding:"24px 88px 60px"}:{}}>
      {tab==="aitools" && (() => {
        const launch = (day,step) => onStartSession && onStartSession(day,step);
        const Time = ({n}) => <div style={{display:"flex",alignItems:"center",gap:5}}><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={TK.text3} strokeWidth="1.2"/><path d="M8 5v3l2 1.5" stroke={TK.text3} strokeWidth="1.2" strokeLinecap="round"/></svg><span style={{fontFamily:T.sans,fontSize:12,color:TK.text3}}>{n} min</span></div>;
        // Section header with an optional "View all →" on the right — used by
        // Your Paths and Explore by Skill. Not wired to a destination yet (no
        // dedicated browse page exists this pass), so it's non-interactive.
        const secLink = (label) => (
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:isDesktop?8:6}}>
            <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,fontWeight:700,color:TK.text,textTransform:"uppercase",letterSpacing:"2px"}}>{label}</div>
            <span style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:TK.text3,display:"flex",alignItems:"center",gap:4}}>View all <span style={{color:TK.sageDark}}>→</span></span>
          </div>
        );

        // Icon tint presets — reused across Your Paths and Explore by Skill so
        // the two sections read as one coherent palette (deep sage, warm tan,
        // muted sage, near-black), varying which card gets which tone.
        // Plain colour strings now (all cards share one Soft Stone
        // background per the new palette — only the icon circle varies).
        const ICON_C = TK.onDark;

        // Canonical, reused step definitions — appear in more than one Path.
        // "Achievement Story Builder" consolidates what used to be three
        // separate names ("Achievement Story Builder" / "SAR Builder" /
        // "Story Sprint") for what turned out to be at most two distinct
        // screens; see the audit note above PATHS for details.
        const STEP_ACHIEVEMENT = {
          label:"Achievement Story Builder", desc:"Structure your wins into compelling stories for reviews, interviews and promotions.",
          tags:["Reviews","Promotions","Interviews"], time:5, day:10, step:"Rehearsal", tint:TK.sageDark,
          icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 3h7l4 4v10H5V3z" stroke={ICON_C} strokeWidth="1.3"/><path d="M12 3v4h4" stroke={ICON_C} strokeWidth="1.3"/><path d="M7.5 10h5M7.5 13h3.5" stroke={ICON_C} strokeWidth="1.2" strokeLinecap="round"/></svg>,
        };
        const STEP_PROMOTION_PREP = {
          label:"Promotion Prep", subtitle:"Real World Conversation Coaching", desc:"Practice a promotion conversation and get AI feedback to improve your delivery.",
          time:8, day:6, step:"Simulation", tint:TK.taupe,
          icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14a1 1 0 011 1v7a1 1 0 01-1 1h-6l-4 3v-3H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke={ICON_C} strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 8h8M6 11h5" stroke={ICON_C} strokeWidth="1.2" strokeLinecap="round"/></svg>,
        };

        const PATHS = [
          {id:"promotion", label:"Promotion Path",    desc:"Stand out and get noticed.",             tint:TK.sageDark,
           useCases:["Performance Reviews","Promotions","Interviews","Executive Meetings"],
           icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 4h8v4a4 4 0 01-4 4 4 4 0 01-4-4V4z" stroke={ICON_C} strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 4H5a1 1 0 00-1 1v1a3 3 0 003 3M16 4h3a1 1 0 011 1v1a3 3 0 01-3 3" stroke={ICON_C} strokeWidth="1.3" strokeLinecap="round"/><path d="M12 12v3M9 19h6M10 15h4v4h-4z" stroke={ICON_C} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
           steps:[
             STEP_ACHIEVEMENT,
             STEP_PROMOTION_PREP,
             {label:"Leadership Hot Seat", desc:"Step into the hot seat and handle tough questions with confidence.", time:8, day:10, step:"Simulation", tint:TK.sageDark,
              icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 4h8v6H6V4z" stroke={ICON_C} strokeWidth="1.3"/><path d="M6 10v6M14 10v6M4 17h12" stroke={ICON_C} strokeWidth="1.3" strokeLinecap="round"/></svg>},
             {label:"Pressure Response Drill", desc:"Sharp structured answers under pressure.", tags:["Meetings"], time:3, day:5, step:"Simulation", tint:TK.taupe,
              icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M12 3l-8 11h8l-2 5 8-11h-8l2-5z" stroke={ICON_C} strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>},
           ]},
          {id:"presentation", label:"Presentation Path", desc:"Deliver with confidence and impact.",    tint:TK.sage,
           useCases:["Presentations","Pitches","Storytelling","Leadership Talks"],
           icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="12" rx="1.5" stroke={ICON_C} strokeWidth="1.4"/><path d="M9 20l3-4 3 4" stroke={ICON_C} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 9l3 3 2-2 3 3" stroke={ICON_C} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
           steps:[
             {label:"Story Architect", desc:"Build powerful stories and presentations in minutes.", time:8, day:8, step:"Simulation", tint:TK.sageDark,
              icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M4 4h8l5 5v9H4V4z" stroke={ICON_C} strokeWidth="1.3" fill="none"/><path d="M11 4v6h5" stroke={ICON_C} strokeWidth="1.3"/><path d="M7 12h5M7 15h3" stroke={ICON_C} strokeWidth="1.2" strokeLinecap="round"/></svg>},
             {label:"Pixar Story Builder", desc:"Build unforgettable stories using the Pixar framework.", tags:["Storytelling","Presentations","Leadership"], time:4, day:8, step:"Rehearsal", tint:TK.taupe,
              icon:<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke={ICON_C} strokeWidth="1.3" fill="none"/><rect x="12" y="3" width="7" height="7" rx="1" stroke={ICON_C} strokeWidth="1.3" fill="none"/><rect x="3" y="12" width="7" height="7" rx="1" stroke={ICON_C} strokeWidth="1.3" fill="none"/><rect x="12" y="12" width="7" height="7" rx="1" stroke={ICON_C} strokeWidth="1.3" fill="none"/></svg>},
             STEP_ACHIEVEMENT,
             {label:"Executive Briefing", desc:"Complex ideas, clear delivery.", tags:["Executive Comms"], time:4, day:4, step:"Simulation", tint:TK.taupe,
              icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M4 16V8l4 4 3-6 3 5 4-3v8H4z" stroke={ICON_C} strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>},
           ]},
          {id:"visibility", label:"Visibility Path",   desc:"Build your brand and expand your reach.", tint:TK.text,
           useCases:["LinkedIn","Personal Brand","Networking","Brand Building"],
           icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke={ICON_C} strokeWidth="1.4"/><path d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" stroke={ICON_C} strokeWidth="1.4" strokeLinecap="round"/></svg>,
           steps:[
             {label:"Brand Audit", desc:"Discover what signals your communication sends to the world.", tags:["LinkedIn","Presence","Personal Brand"], time:5, day:11, step:"Simulation", tint:TK.sageDark,
              icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4.5H17l-3.7 2.7 1.4 4.3L11 12l-3.7 2.5 1.4-4.3L5 7.5h4.5z" stroke={ICON_C} strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>},
             STEP_PROMOTION_PREP,
             {label:"Rapport Builder", desc:"Connect with anyone, anywhere.", tags:["Networking"], time:5, day:9, step:"Simulation", tint:TK.sageDark,
              icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="8" cy="8" r="3" stroke={ICON_C} strokeWidth="1.3" fill="none"/><circle cx="14" cy="8" r="3" stroke={ICON_C} strokeWidth="1.3" fill="none"/><path d="M4 18c0-3 2-4 4-4h6c2 0 4 1 4 4" stroke={ICON_C} strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>},
           ]},
        ];

        // Day 6's Simulation has two valid display names depending on
        // context — "Promotion Prep" in the Promotion/Visibility Paths
        // (STEP_PROMOTION_PREP above) and "AI Conversation Prep" here on the
        // Leadership/Influence Skill pages. Same day/step link both times —
        // deliberately two label objects sharing one route, not two tools.
        const STEP_AI_CONVO_PREP = {
          label:"AI Conversation Prep", desc:"Practice a high-stakes conversation and get AI feedback to improve your delivery.",
          day:6, step:"Simulation", tint:TK.taupe,
          icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14a1 1 0 011 1v7a1 1 0 01-1 1h-6l-4 3v-3H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke={ICON_C} strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 8h8M6 11h5" stroke={ICON_C} strokeWidth="1.2" strokeLinecap="round"/></svg>,
        };

        const SKILLS = [
          {id:"storytelling", label:"Storytelling",  desc:"Build stories people remember.",                tint:TK.sage,
           icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 5.5c-1.3-1-3.2-1.3-6-1v10c2.8-.3 4.7 0 6 1 1.3-1 3.2-1.3 6-1v-10c-2.8-.3-4.7 0-6 1z" stroke={ICON_C} strokeWidth="1.2" strokeLinejoin="round"/><path d="M10 5.5v10" stroke={ICON_C} strokeWidth="1.2"/></svg>,
           featured:{label:"Story Architect", desc:"Build powerful stories and presentations in minutes.", day:8, step:"Simulation", tint:TK.sageDark,
             icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M4 4h8l5 5v9H4V4z" stroke={ICON_C} strokeWidth="1.3" fill="none"/><path d="M11 4v6h5" stroke={ICON_C} strokeWidth="1.3"/><path d="M7 12h5M7 15h3" stroke={ICON_C} strokeWidth="1.2" strokeLinecap="round"/></svg>}},
          {id:"leadership", label:"Leadership",    desc:"Lead and handle high-stakes conversations.",     tint:TK.taupe,
           icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6.5" r="2.5" stroke={ICON_C} strokeWidth="1.2"/><circle cx="14" cy="7" r="2" stroke={ICON_C} strokeWidth="1.2"/><path d="M2.5 16c0-3 2-4.5 4.5-4.5s4.5 1.5 4.5 4.5" stroke={ICON_C} strokeWidth="1.2" strokeLinecap="round"/><path d="M12.5 12c2 0 4 1.2 4.2 4" stroke={ICON_C} strokeWidth="1.1" strokeLinecap="round"/></svg>,
           featured:STEP_AI_CONVO_PREP},
          {id:"presence", label:"Presence",      desc:"Speak with confidence and authority.",           tint:TK.sage,
           icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke={ICON_C} strokeWidth="1.2"/><path d="M4.5 17c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" stroke={ICON_C} strokeWidth="1.2" strokeLinecap="round"/></svg>,
           featured:{label:"Find Your Voice", desc:"Discover your vocal range and unlock a more expressive, resonant voice.", day:2, step:"Simulation", tint:TK.sage,
             icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="8" y="3" width="4" height="8" rx="2" stroke={ICON_C} strokeWidth="1.3"/><path d="M5 9a5 5 0 0010 0" stroke={ICON_C} strokeWidth="1.3" strokeLinecap="round"/><path d="M10 14v2M8 16h4" stroke={ICON_C} strokeWidth="1.3" strokeLinecap="round"/></svg>}},
          {id:"influence", label:"Influence",     desc:"Get buy-in and move people.",                    tint:TK.text,
           icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 8v4h2.5L12 16V4L5.5 8H3z" stroke={ICON_C} strokeWidth="1.2" strokeLinejoin="round"/><path d="M15 7.5a3 3 0 010 5" stroke={ICON_C} strokeWidth="1.2" strokeLinecap="round"/></svg>,
           featured:STEP_AI_CONVO_PREP},
          {id:"personal-brand", label:"Personal Brand",desc:"Shape how you're perceived.",                    tint:TK.taupe,
           icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><polygon points="10,2 12.2,7.2 18,7.8 13.6,11.6 15,17.3 10,14.2 5,17.3 6.4,11.6 2,7.8 7.8,7.2" stroke={ICON_C} strokeWidth="1.1" strokeLinejoin="round"/></svg>,
           featured:{label:"Brand Audit", desc:"Discover what signals your communication sends to the world.", day:11, step:"Simulation", tint:TK.taupe,
             icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4.5H17l-3.7 2.7 1.4 4.3L11 12l-3.7 2.5 1.4-4.3L5 7.5h4.5z" stroke={ICON_C} strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>}},
          {id:"clarity", label:"Clarity",       desc:"Make complex ideas simple.",                     tint:TK.ink,
           icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M8 3l1.2 3.3L12.5 7.5 9.2 8.7 8 12l-1.2-3.3L3.5 7.5l3.3-1.2L8 3z" fill={ICON_C}/><path d="M15 11l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" fill={ICON_C}/></svg>,
           featured:{label:"Clarity Check-In", desc:"Establish your communication baseline and track your progress.", day:1, step:"Simulation", tint:TK.ink,
             icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke={ICON_C} strokeWidth="1.3" fill="none"/><path d="M5 19c0-4 2.7-6 6-6s6 2 6 6" stroke={ICON_C} strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>}},
        ];

        if (openPathId) {
          const openPath = PATHS.find(p => p.id === openPathId);
          return <PathDetailScreen T={T} isDesktop={isDesktop} path={openPath} done={done} launch={launch} onBack={()=>setOpenPathId(null)}/>;
        }
        if (openSkillId) {
          const openSkill = SKILLS.find(s => s.id === openSkillId);
          return <SkillDetailScreen T={T} isDesktop={isDesktop} skill={{...openSkill, bigIcon: openSkill.icon}} launch={launch} onBack={()=>setOpenSkillId(null)}/>;
        }

        return (
          <div style={{maxWidth:isDesktop?1160:undefined,margin:"0 auto",padding:isDesktop?"40px 88px 80px":"20px 20px 60px",background:TK.bg}}>

            {/* ── YOUR PATHS ────────────────────────────────────────────── */}
            <div style={{marginBottom:isDesktop?48:32}}>
              {secLink("Your Paths")}
              <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:12}}>
                {PATHS.map((path,i)=>(
                  <div key={i} onClick={()=>setOpenPathId(path.id)}
                    style={{background:TK.surface,borderRadius:10,border:"0.5px solid "+TK.border,padding:isDesktop?"20px 24px":"16px 16px",display:"flex",alignItems:"flex-start",gap:16,cursor:"pointer"}}>
                    <div style={{width:isDesktop?56:48,height:isDesktop?56:48,borderRadius:"50%",background:path.tint,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{path.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:T.serif,fontSize:isDesktop?19:17,fontWeight:600,color:TK.text,marginBottom:3}}>{path.label}</div>
                      <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:TK.text3,marginBottom:6}}>{path.desc}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:path.useCases?10:0}}>
                        <Time n={path.steps.reduce((sum,s)=>sum+s.time,0)}/>
                        <span style={{color:TK.text3,fontSize:11}}>•</span>
                        <span style={{fontFamily:T.sans,fontSize:12,color:TK.text3}}>{path.steps.length} tools</span>
                      </div>
                      {path.useCases && (
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                          {path.useCases.map((uc,j)=><span key={j} style={{fontFamily:T.sans,fontSize:11,color:TK.text3,padding:"3px 10px",border:"0.5px solid "+TK.border,borderRadius:20,whiteSpace:"nowrap",background:TK.bg}}>{uc}</span>)}
                        </div>
                      )}
                    </div>
                    <span style={{fontFamily:T.sans,fontSize:18,color:TK.text3,flexShrink:0}}>→</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── EXPLORE BY SKILL ──────────────────────────────────────── */}
            <div style={{marginBottom:isDesktop?48:32}}>
              {secLink("Explore by Skill")}
              <div style={{marginTop:16,display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr 1fr":"1fr 1fr",gap:12}}>
                {SKILLS.map((sk,i)=>(
                  <div key={i} onClick={()=>setOpenSkillId(sk.id)} style={{background:TK.surface,borderRadius:10,border:"0.5px solid "+TK.border,padding:isDesktop?"18px":"14px",cursor:"pointer"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:sk.tint,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>{sk.icon}</div>
                    <div style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontWeight:600,color:TK.text,marginBottom:4}}>{sk.label}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:6}}>
                      <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:TK.text3,lineHeight:1.4}}>{sk.desc}</div>
                      <span style={{fontFamily:T.sans,fontSize:14,color:TK.text3,flexShrink:0}}>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        );
      })()}
      {tab==="mywork" && (
        <div style={isDesktop?{maxWidth:720,margin:"0 auto",padding:"32px 88px 80px"}:{padding:"16px 20px 60px"}}>
          {allSaved.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:32,marginBottom:12}}>📁</div>
              <div style={{fontFamily:T.serif,fontSize:18,fontWeight:700,color:T2.text,marginBottom:8}}>Nothing saved yet</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6}}>Results you save from Day 2, Day 8, and Day 11's Simulation and Rehearsal steps will collect here.</p>
            </div>
          ) : (
            <>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,fontWeight:300,marginBottom:isDesktop?24:16}}>{allSaved.length} saved result{allSaved.length!==1?"s":""} across the programme.</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {allSaved.map(entry => {
                  const cfg = SAVED_WORK_SOURCES[entry.source];
                  if (!cfg) return null;
                  const confirming = confirmDeleteId === entry.id;
                  const title = cfg.getTitle(entry);
                  const preview = cfg.getPreview(entry);
                  const badge = cfg.getBadge(entry);
                  return (
                    <div key={entry.id} style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,display:"flex",alignItems:"stretch",overflow:"hidden"}}>
                      <div onClick={()=>openSavedWork(entry)} style={{flex:1,minWidth:0,padding:isDesktop?"16px 18px":"14px 16px",display:"flex",gap:12,alignItems:"flex-start",cursor:cfg.clickable?"pointer":"default"}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>{cfg.icon(T.gold)}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                            <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.2px"}}>{cfg.dayLabel}</span>
                            {badge && <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text3,background:T2.bg,border:"0.5px solid "+T2.border,borderRadius:10,padding:"1px 7px"}}>{badge}</span>}
                          </div>
                          <div style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,fontWeight:500,marginBottom:preview?3:0}}>{title}</div>
                          {preview && <div style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.45}}>{preview}</div>}
                          <div style={{fontFamily:T.sans,fontSize:10,color:T2.text4,marginTop:5}}>{new Date(entry.timestamp).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}</div>
                        </div>
                      </div>
                      <button onClick={()=>handleDeleteWork(entry)} title={confirming?"Tap again to delete":"Delete"} style={{background:"none",border:"none",cursor:"pointer",color:confirming?"#b05c4a":T2.text4,fontSize:confirming?11:18,fontWeight:confirming?700:400,fontFamily:T.sans,padding:"0 16px",flexShrink:0,lineHeight:1,alignSelf:"center",whiteSpace:"nowrap",transition:"all 0.15s"}}>{confirming?"Confirm?":"×"}</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
      {tab==="practice" && (
        <div style={isDesktop?{maxWidth:720,margin:"0 auto",padding:"24px 88px 80px"}:{padding:"0 20px 60px"}}>
          <PracticeSpace T2={Object.assign({},T,DK)} isDesktop={isDesktop}/>

          {/* Study a Master — moved here from AI Tools; it's a reflection
              exercise, not an AI tool. */}
          <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,fontWeight:700,color:T2.text,textTransform:"uppercase",letterSpacing:"2px",marginTop:isDesktop?40:28,marginBottom:16}}>Reflection Exercise</div>
          <div style={{background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"18px 20px",cursor:"pointer"}} onClick={()=>setOpenMod('studyMaster')}>
            <div style={{display:"flex",gap:14,marginBottom:14,alignItems:"flex-start"}}>
              <div style={{width:40,height:40,borderRadius:8,background:T2.bg,border:"0.5px solid "+T2.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><ellipse cx="11" cy="11" rx="8.5" ry="5.5" stroke={T2.text3} strokeWidth="1.3"/><circle cx="11" cy="11" r="2.5" stroke={T2.text3} strokeWidth="1.3"/></svg>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?15:14,fontWeight:700,color:T2.text,marginBottom:4}}>Study a Master</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5,fontWeight:300}}>Watch someone who inspires you and study how they communicate. Observe the habits that make them exceptional.</div>
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
              {["Observation","Self-Awareness","Learning"].map((tag,j)=><span key={j} style={{fontFamily:T.sans,fontSize:11,color:T2.text3,padding:"3px 10px",border:"0.5px solid "+T2.border,borderRadius:20,whiteSpace:"nowrap"}}>{tag}</span>)}
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={T2.text4} strokeWidth="1.2"/><path d="M8 5v3l2 1.5" stroke={T2.text4} strokeWidth="1.2" strokeLinecap="round"/></svg><span style={{fontFamily:T.sans,fontSize:12,color:T2.text4}}>20 min</span></div>
              <span style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text}}>Open →</span>
            </div>
          </div>

          {/* Study a Master modal */}
          {openMod==='studyMaster' && (
            <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",background:"rgba(10,8,5,0.55)",backdropFilter:"blur(4px)",padding:"40px 20px 60px"}}>
              <div style={{background:T2.bg,borderRadius:12,width:"100%",maxWidth:680,position:"relative",animation:"fadeUp 0.3s ease both"}}>
                <div style={{padding:isDesktop?"36px 40px":"24px 22px",borderBottom:"0.5px solid "+T2.divider,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
                  <div>
                    <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Reflection Exercise</div>
                    <h2 style={{fontFamily:T.serif,fontSize:isDesktop?32:26,fontWeight:600,color:T2.text,lineHeight:1.1,margin:"0 0 12px"}}>Study a Master</h2>
                    <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.7,margin:0,fontWeight:300}}>Find someone who inspires you — or someone you think is a master communicator. Watch them. Observe how they communicate, what habits they use, and how they hold presence. Then bring one thing back to your own communication this week.</p>
                  </div>
                  <button onClick={()=>{setOpenMod(null);setOpenMasterCard(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px",flexShrink:0,marginTop:4}}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke={T2.text3} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
                <div style={{padding:isDesktop?"28px 40px 36px":"20px 22px 28px"}}>
                  <div style={{background:"rgba(138,158,132,0.07)",borderRadius:8,border:"0.5px solid rgba(138,158,132,0.2)",padding:"18px 20px",marginBottom:24}}>
                    <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Your Task</div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {["Choose someone you find compelling — a speaker, leader, interviewer, advocate, or anyone who communicates in a way you admire.","Watch them with intention. Notice how they speak, how they hold the room, and what specific habits make them effective.","Pick one thing you observed and bring it into a real conversation this week."].map((t,i)=>(
                        <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                          <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(138,158,132,0.15)",border:"0.5px solid rgba(138,158,132,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                            <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold}}>{i+1}</span>
                          </div>
                          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.65,margin:0,fontWeight:300}}>{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"2px",marginBottom:14}}>Need Inspiration?</div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,fontWeight:300,marginBottom:16}}>Four exceptional communicators — each a master of a different skill. Expand a card for what to watch for.</p>
                  <div style={{display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:10}}>
                    {MASTER_COMMUNICATORS.map((c,ci)=>{
                      const open=openMasterCard===ci;
                      return (
                        <div key={ci} onClick={()=>setOpenMasterCard(open?null:ci)}
                          style={{background:T2.surface,borderRadius:8,border:`0.5px solid ${open?T.gold:T2.border}`,cursor:"pointer",transition:"all 0.2s",boxShadow:open?"0 4px 20px rgba(138,158,132,0.1)":"none"}}>
                          <div style={{padding:"18px 20px 14px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?0:6}}>
                              <div style={{flex:1,paddingRight:10}}>
                                <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>{c.role}</div>
                                <div style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,lineHeight:1.2}}>{c.name}</div>
                              </div>
                              <span style={{fontFamily:T.sans,fontSize:17,fontWeight:600,color:open?T.gold:"rgba(138,158,132,0.5)",flexShrink:0,marginTop:3,display:"inline-block",transform:open?"rotate(90deg)":"none",transition:"transform 0.2s"}}>▸</span>
                            </div>
                          </div>
                          {open&&(
                            <div style={{borderTop:"0.5px solid "+T2.divider,padding:"14px 20px 18px",display:"flex",flexDirection:"column",gap:12}}>
                              <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,margin:0,fontWeight:300}}>{c.sub}</p>
                              <div>
                                <div style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",fontFamily:T.sans,marginBottom:7}}>Watch For</div>
                                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                                  {c.watchFor.map((w,wi)=>(
                                    <span key={wi} style={{padding:"4px 10px",borderRadius:20,border:"0.5px solid "+T2.border,fontFamily:T.sans,fontSize:11,color:T2.text,background:T2.bg}}>{w}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",fontFamily:T.sans,marginBottom:6}}>AmplifyU Connection</div>
                                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                                  {c.connection.map(([day,principle],di)=>(
                                    <div key={di} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",background:"rgba(138,158,132,0.08)",borderRadius:4,border:"0.5px solid rgba(138,158,132,0.2)"}}>
                                      <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold}}>{day}</span>
                                      <span style={{fontFamily:T.sans,fontSize:10,color:T2.text3}}>{principle}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div style={{padding:"10px 14px",background:"rgba(138,158,132,0.05)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                                <div style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",fontFamily:T.sans,marginBottom:5}}>Reflection Prompt</div>
                                <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>{c.reflection}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {tab==="story" && (
        <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:0}}>
          {/* Header card */}
          <div style={{background:T.cardDark,borderRadius:2,padding:"22px 24px",marginBottom:16,position:"relative",overflow:"hidden"}}>
            <div 
style={{position:"absolute",top:-10,right:10,fontSize:90,lineHeight:1,color:"rgba(255,255,255,0.04)",fontFamily:T.serif}}>"</div>
            <div 
style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>The 
story behind AmplifyU</div>
            <h2 
style={{fontFamily:T.serif,fontSize:20,fontWeight:700,color:"white",lineHeight:1.25,marginBottom:0}}>Built 
in the margins.<br/>For everyone in the margins.</h2>
          </div>
          {/* Story body */}
          <div 
style={{display:"flex",flexDirection:"column",gap:14,paddingBottom:40}}>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              Eight months ago, I returned from maternity leave. Two small 
children at home, a career that mattered to me, and a hard new reality: I 
could no longer afford to be anything less than precise. Every meeting, 
every conversation had to <strong>earn its place.</strong>
            </p>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              I quickly realised that my ability to communicate clearly — 
to structure my thinking under pressure, to tell stories that landed, to 
be visible to the right people — was the single highest-leverage skill I 
could develop. Not just for my career, but for the whole shape of my life. 
When I communicate well, I work faster, influence more, and come home with 
something left to give.
            </p>
            {/* Pull quote */}
            <div 
style={{background:dark?T2.surface:T.goldLight,borderRadius:2,borderLeft:`3px 
solid ${T.gold}`,padding:"16px 18px"}}>
              <p 
style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:dark?"rgba(255,255,255,0.85)":T.goldDark,lineHeight:1.65,margin:0}}>
                "Communication is the skill that multiplies everything 
else. And it can be built — deliberately, in fifteen minutes a day."
              </p>
            </div>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              I had always been good at storytelling. I understood the power of a well-placed narrative — how it changes the energy in a room, how it makes people lean in. I had strong instincts for communication and had built real credibility over my career. But coming back from leave, I wanted more than instinct. I wanted a <strong>system.</strong> Something I could call on when tired, when stretched, when operating across two very full worlds simultaneously.
            </p>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              I built AmplifyU because the tools I needed didn't exist. Something science-backed, practically structured, and designed for a real professional life — not a retreat, not a course, not a workshop. <strong>A daily platform that fits inside the life you already have.</strong>
            </p>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              The programme moves through fourteen deliberate modules — starting with the foundations: clarity, structure, and voice. Then the skills that separate good communicators from great ones: storytelling, connection, and managing pressure. Then the hardest work of all: building presence, communicating your ambition, and creating the kind of exposure that makes your value impossible to ignore.
            </p>
            {/* AI tools highlight */}
            <div style={{background:dark?T2.surface:T2.card,borderRadius:2,padding:"18px 20px"}}>
              <div style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:10}}>Built with AmplifyU Coaching</div>
              <p style={{fontSize:14,color:T2.text,lineHeight:1.7,margin:0}}>
                Every session includes your AmplifyU Coach that responds to your specific words — not generic feedback, but personalised evaluation of your structure, reasoning, and delivery. Tools to help you rewrite, rehearse, and reflect. The kind of support that used to require an expensive coach is now available every day, inside sessions you can complete in under twenty minutes.
              </p>
            </div>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              I believe — genuinely, without qualification — that every person can become a better communicator. Not gifted. Not naturally smooth. But deliberate. Precise. Compelling. The professionals who have transformed their communication didn't do it through talent. They did it through practice, repetition, and a system that made their improvement visible to themselves and the people around them.
            </p>
            {/* Pull quote 2 */}
            <div 
style={{background:dark?T2.surface:T.goldLight,borderRadius:2,borderLeft:`3px 
solid ${T.gold}`,padding:"16px 18px"}}>
              <p 
style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:dark?"rgba(255,255,255,0.85)":T.goldDark,lineHeight:1.65,margin:0}}>
                "When you communicate well, you work faster, influence 
more, and come home with something left to give."
              </p>
            </div>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              This platform was built in the margins of a full life. It is 
designed to be used in exactly the same way. Because the professionals who 
need these tools the most are also the ones with the least time to waste — 
and the most to gain.
            </p>
            {/* Sign-off */}
            <div style={{paddingTop:8}}>
              <div 
style={{height:1,background:`linear-gradient(90deg,${T.gold},rgba(138,158,132,0.1))`,marginBottom:16}}/>
              <p 
style={{fontFamily:T.serif,fontSize:16,fontWeight:700,color:T2.text,lineHeight:1.5,margin:0}}>
                Amplify your voice. Lead with confidence. Thrive — at work 
and at home.{" "}
                <span style={{color:T.gold}}>AmplifyU.</span>
              </p>
            </div>
          </div>
        </div>
      )}
      {tab==="quickprep" && (() => {
        const SUBFOLDERS = [
          {id:"ritual", label:"Pre-Meeting Ritual", desc:"A 2-minute routine before any important conversation.", tint:TK.sageDark,
           icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="11" r="6.5" stroke={TK.onDark} strokeWidth="1.3"/><path d="M10 8v3l2 1.5" stroke={TK.onDark} strokeWidth="1.3" strokeLinecap="round"/><path d="M8 2h4M10 2v2" stroke={TK.onDark} strokeWidth="1.3" strokeLinecap="round"/></svg>},
          {id:"phrases", label:"Phrases", desc:"Ready-to-use lines for common moments.", tint:TK.sage,
           icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14a1 1 0 011 1v7a1 1 0 01-1 1h-6l-4 3v-3H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke={TK.onDark} strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 8h8M6 11h5" stroke={TK.onDark} strokeWidth="1.2" strokeLinecap="round"/></svg>},
          {id:"language", label:"Language Upgrade", desc:"Replace weak phrases with ones that command authority.", tint:TK.taupe,
           icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 16V5M10 5l-4 4M10 5l4 4" stroke={TK.onDark} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>},
          {id:"reading", label:"Reading List", desc:"28 books across 14 modules.", tint:TK.ink,
           icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 5.5c-1.3-1-3.2-1.3-6-1v10c2.8-.3 4.7 0 6 1 1.3-1 3.2-1.3 6-1v-10c-2.8-.3-4.7 0-6 1z" stroke={TK.onDark} strokeWidth="1.2" strokeLinejoin="round"/><path d="M10 5.5v10" stroke={TK.onDark} strokeWidth="1.2"/></svg>},
        ];

        if (openPrepSub) {
          const sub = SUBFOLDERS.find(s => s.id === openPrepSub);
          return (
            <div style={{background:TK.bg,minHeight:"100vh"}}>
              <div style={{position:"relative",background:TK.ink,overflow:"hidden",padding:isDesktop?"28px 88px":"20px 20px"}}>
                <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 80% 20%, rgba(168,179,163,0.08) 0%, transparent 55%)"}}/>
                <div style={{position:"relative",maxWidth:isDesktop?1160:undefined,margin:isDesktop?"0 auto":undefined}}>
                  <button onClick={()=>setOpenPrepSub(null)} style={{width:36,height:36,borderRadius:"50%",background:"rgba(248,246,241,0.1)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:16}}>
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M11 3L5 9l6 6" stroke={TK.onDark} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:44,height:44,borderRadius:10,background:sub.tint,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{sub.icon}</div>
                    <div>
                      <h2 style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:600,color:TK.onDark,margin:"0 0 3px"}}>{sub.label}</h2>
                      <p style={{fontFamily:T.sans,fontSize:13,color:"rgba(248,246,241,0.6)",margin:0}}>{sub.desc}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={isDesktop?{maxWidth:900,margin:"0 auto",padding:"28px 88px 60px"}:{padding:"16px 20px 40px"}}>
                {openPrepSub==="ritual" && (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {QUICK_PREP.map((s,i) => (
                      <div key={s.num}>
                        <div style={{background:TK.surface,borderRadius:10,border:"0.5px solid "+TK.border,padding:"14px 18px",display:"flex",alignItems:"flex-start",gap:14}}>
                          <div style={{width:28,height:28,borderRadius:8,background:TK.sageDark,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <span style={{fontSize:11,fontWeight:800,color:TK.onDark}}>{s.num}</span>
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:14,fontWeight:700,color:TK.text,marginBottom:3}}>{s.title}</div>
                            <div style={{fontSize:13,color:TK.text3,lineHeight:1.5}}>{s.desc}</div>
                          </div>
                          <div style={{background:TK.bg,border:"0.5px solid "+TK.border,borderRadius:8,padding:"4px 10px"}}>
                            <div style={{fontSize:11,fontWeight:700,color:TK.text3,fontFamily:"monospace"}}>{s.secs}s</div>
                          </div>
                        </div>
                        {i<QUICK_PREP.length-1 && <div style={{width:1,height:6,background:TK.border,margin:"0 auto"}}/>}
                      </div>
                    ))}
                    <button onClick={onQuickPrep} style={{width:"100%",padding:"15px",borderRadius:8,border:"none",background:TK.ink,color:TK.onDark,fontSize:15,fontWeight:700,cursor:"pointer",marginTop:6}}>Start Quick Prep</button>
                  </div>
                )}

                {openPrepSub==="phrases" && (
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {PHRASES.map((cat,i) => (
                      <div key={cat.cat} style={{background:TK.surface,borderRadius:10,overflow:"hidden",border:"0.5px solid "+TK.border}}>
                        <button onClick={()=>setOpenCat(openCat===i?-1:i)} style={{width:"100%",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",border:"none",background:"transparent",cursor:"pointer"}}>
                          <span style={{fontSize:15,fontWeight:600,color:TK.text}}>{cat.cat}</span>
                          <span style={{color:TK.text3,display:"inline-block",transform:openCat===i?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</span>
                        </button>
                        {openCat===i && (
                          <div style={{borderTop:"0.5px solid "+TK.border}}>
                            {cat.phrases.map((p,pi) => (
                              <div key={pi} style={{padding:"11px 18px",display:"flex",alignItems:"center",gap:10,borderBottom:pi<cat.phrases.length-1?"0.5px solid "+TK.border:"none"}}>
                                <div style={{width:2,height:2,background:TK.sageDark,flexShrink:0}}/>
                                <p style={{margin:0,flex:1,fontSize:14,color:TK.text,fontStyle:"italic"}}>{p}</p>
                                <button onClick={()=>copy(p)} style={{padding:"4px 10px",borderRadius:8,border:"0.5px solid "+TK.border,background:"transparent",color:TK.text3,fontSize:11,cursor:"pointer"}}>{copied===p?"✓":"Copy"}</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {openPrepSub==="language" && (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {SAY_THIS.map((item,i) => (
                      <div key={i} style={{background:TK.surface,borderRadius:10,border:"0.5px solid "+TK.border,padding:"16px 18px"}}>
                        <div style={{fontSize:10,fontWeight:700,color:TK.text3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>{item.ctx}</div>
                        <div style={{display:"flex",gap:8,marginBottom:8}}>
                          <span style={{fontSize:14,flexShrink:0,color:TK.text3}}>✕</span>
                          <p style={{margin:0,fontSize:14,color:TK.text3,textDecoration:"line-through"}}>{item.bad}</p>
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontSize:14,flexShrink:0,color:TK.sageDark}}>✓</span>
                          <p style={{margin:0,flex:1,fontSize:14,color:TK.sageDark,fontWeight:600,fontStyle:"italic"}}>{item.good}</p>
                          <button onClick={()=>copy(item.good)} style={{padding:"5px 12px",borderRadius:8,border:"0.5px solid "+TK.border,background:"transparent",color:TK.text3,fontSize:11,cursor:"pointer"}}>{copied===item.good?"✓":"Copy"}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {openPrepSub==="reading" && (() => {
                  const MODULE_TITLES = ["Speak Clearly","Voice Control","Eliminate Fillers","Short Sentences","PRE Structure","Storytelling","PIE Framework","Executive Presence","Influence","Difficult Conversations","Personal Brand","Networking","Leadership Voice","High Stakes Moments"];
                  return (
                    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?2:8}}>
                      {FURTHER_READING.map((mod, mi) => {
                        const isOpen = openMod === mi;
                        return (
                          <div key={mi} style={{border:"0.5px solid "+TK.border,borderRadius:8,overflow:"hidden",background:isOpen?TK.bg:TK.surface}}>
                            <button onClick={() => setOpenMod(isOpen ? null : mi)} style={{
                              width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
                              padding:isDesktop?"18px 24px":"14px 18px",
                              border:"none",background:"transparent",cursor:"pointer",textAlign:"left",
                            }}>
                              <div style={{display:"flex",alignItems:"center",gap:14}}>
                                <span style={{fontFamily:T.sans,fontSize:11,color:TK.text3,fontWeight:500,width:24,flexShrink:0}}>{"0"+(mi+1)}</span>
                                <span style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:TK.text,letterSpacing:"-0.2px"}}>{MODULE_TITLES[mi]}</span>
                              </div>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s ease",flexShrink:0}}>
                                <path d="M3 5l4 4 4-4" stroke={TK.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            {isOpen && (
                              <div style={{borderTop:"0.5px solid "+TK.border,padding:isDesktop?"24px 24px 28px":"16px 18px 20px",display:"flex",flexDirection:"column",gap:16}}>
                                {mod.books.map((book, bi) => (
                                  <div key={bi} style={{paddingBottom:bi<mod.books.length-1?16:0,borderBottom:bi<mod.books.length-1?"0.5px solid "+TK.border:"none"}}>
                                    <p style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:TK.text,letterSpacing:"-0.2px",marginBottom:2}}>{book.title}</p>
                                    <p style={{fontFamily:T.sans,fontSize:12,color:TK.text3,marginBottom:10}}>{book.author}</p>
                                    <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:TK.sageDark,lineHeight:1.5,marginBottom:10}}>{book.connection}</p>
                                    <p style={{fontFamily:T.sans,fontSize:13,color:TK.text,lineHeight:1.7,fontWeight:300,marginBottom:14}}>{book.summary}</p>
                                    <a href={book.amazon} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",background:TK.ink,color:TK.onDark,borderRadius:6,fontSize:12,fontFamily:T.sans,fontWeight:500,letterSpacing:"0.02em",textDecoration:"none"}}>Get the book →</a>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        }

        return (
          <div style={{maxWidth:isDesktop?1160:undefined,margin:"0 auto",padding:isDesktop?"40px 88px 80px":"20px 20px 60px",background:TK.bg}}>
            <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,fontWeight:700,color:TK.text,textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>Quick Prep</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {SUBFOLDERS.map((s,i)=>(
                <div key={i} onClick={()=>setOpenPrepSub(s.id)} style={{background:TK.surface,borderRadius:10,border:"0.5px solid "+TK.border,padding:isDesktop?"18px":"14px",cursor:"pointer"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:s.tint,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>{s.icon}</div>
                  <div style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontWeight:600,color:TK.text,marginBottom:4,textAlign:"center"}}>{s.label}</div>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:TK.text3,lineHeight:1.4,textAlign:"center"}}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      </div>
    </div>
  );
}

// ─── QUICK PREP FLOW 
