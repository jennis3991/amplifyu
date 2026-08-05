import { useState, useEffect } from 'react';
import { T } from '../theme.js';
import { FURTHER_READING, PHRASES, SAY_THIS, QUICK_PREP, DAILY_INSIGHTS, POWER_PHRASES } from '../data.js';
import { Scene } from '../scenes.jsx';
import { PracticeSpace } from '../modules/PracticeSpace.jsx';

export function ToolkitScreen({onQuickPrep, onStartSession, dark=false, DK={}, isDesktop=false}) {
  const T2 = Object.assign({}, T, DK);
  const [tab, setTab] = useState("aitools");
  useEffect(() => {
    try {
      const pending = localStorage.getItem("au1_open_toolkit_tab");
      if (pending) { setTab(pending); localStorage.removeItem("au1_open_toolkit_tab"); }
    } catch(_) {}
  }, []);
  const [openCat, setOpenCat] = useState(0);
  const [copied, setCopied] = useState(null);
  const [openMod, setOpenMod] = useState(null);
  const [openMasterCard, setOpenMasterCard] = useState(null);
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("au1_saved_phrases") || 
"[]"); } catch { return []; }
  });
  function copy(p) { try{navigator.clipboard?.writeText(p);}catch{} 
setCopied(p); setTimeout(()=>setCopied(null),2000); }
  function toggleSave(p) {
    const next = saved.includes(p) ? saved.filter(x=>x!==p) : [...saved, 
p];
    setSaved(next);
    try { localStorage.setItem("au1_saved_phrases", JSON.stringify(next)); 
} catch {}
  }
  const toolkitTabs = [["aitools","AI Tools"],["practice","Practice Space"],["story","My Story"],["sayThis","Say This Instead"],["phrases","Phrases"],["saved","♥ Saved"+(saved.length>0?" ("+saved.length+")":"")],["reading","Reading List"],["prep","Quick Prep"]];
  return (
    <div style={{background:T2.bg,minHeight:"100vh"}}>
      {!isDesktop && (
        <div style={{position:"relative",height:260,overflow:"hidden"}}>
          <img src="/programme-hero.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%"}}/>
          <div style={{position:"absolute",inset:0,background:"rgba(10,8,5,0.35)"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,8,5,0.78) 0%,rgba(10,8,5,0.2) 50%,transparent 100%)"}}/>
          <div style={{position:"absolute",bottom:24,left:24}}>
            <div style={{fontSize:10,fontWeight:600,color:"rgba(245,239,230,0.55)",textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:8,fontFamily:T.sans}}>Your Operating System</div>
            <h1 style={{fontFamily:T.serif,fontSize:30,fontWeight:600,color:"#F5EFE6",letterSpacing:"-0.5px",lineHeight:1.1}}>Toolkit</h1>
          </div>
        </div>
      )}
      {isDesktop && (
        <div style={{position:"relative",height:420,overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <img src="/programme-hero.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%"}}/>
          <div style={{position:"absolute",inset:0,background:"rgba(10,8,5,0.35)"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,8,5,0.75) 0%,rgba(10,8,5,0.2) 45%,transparent 100%)"}}/>
          <div style={{position:"relative",zIndex:2,maxWidth:1160,margin:"0 auto",width:"100%",padding:"0 88px 0",boxSizing:"border-box"}}>
            <div style={{animation:"fadeUp 0.7s ease both",paddingBottom:0}}>
              <div style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(245,239,230,0.55)",fontFamily:T.sans,fontWeight:500,marginBottom:14}}>Your Communication Operating System</div>
              <h1 style={{fontFamily:T.serif,fontSize:72,fontWeight:600,color:"#F5EFE6",letterSpacing:"-3px",lineHeight:0.92,marginBottom:18}}>Toolkit</h1>
              <p style={{fontFamily:T.sans,fontSize:16,color:"rgba(245,239,230,0.6)",fontWeight:300,margin:0,maxWidth:480}}>Powerful AI tools and exercises designed to help you communicate with greater clarity, confidence and impact.</p>
            </div>
          </div>
          {/* Tab nav — sits at the bottom of the hero */}
          <div style={{position:"relative",zIndex:2,background:"rgba(10,8,4,0.55)",backdropFilter:"blur(8px)",borderTop:"1px solid rgba(255,255,255,0.08)",marginTop:28}}>
            <div style={{maxWidth:1160,margin:"0 auto",padding:"0 88px",display:"flex",gap:2}}>
              {toolkitTabs.map(([id,label]) => (
                <button key={id} onClick={()=>setTab(id)} style={{padding:"12px 18px",border:"none",background:"transparent",fontSize:13,fontWeight:tab===id?600:400,color:tab===id?"rgba(245,239,230,0.95)":"rgba(245,239,230,0.45)",cursor:"pointer",borderBottom:tab===id?"2px solid "+T.gold:"2px solid transparent",transition:"all 0.2s"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {!isDesktop && (<div style={{padding:"12px 20px 0",display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none",borderBottom:"1px solid "+T2.divider}}>
        {toolkitTabs.map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)} style={{padding:"8px 14px",borderRadius:20,border:"1px solid "+(tab===id?T.gold:T2.border),background:tab===id?"rgba(138,158,132,0.1)":"transparent",color:tab===id?T.gold:T2.text3,fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,marginBottom:8}}>{label}</button>
        ))}
      </div>)}
      <div style={isDesktop?{maxWidth:1160,margin:"0 auto",padding:"24px 88px 60px"}:{}}>
      {tab==="aitools" && (() => {
        const launch = (day,step) => onStartSession && onStartSession(day,step);
        const MASTER_COMMUNICATORS = [
          {emoji:"🌍",name:"David Attenborough",role:"Master of Clarity",sub:"Known for explaining the most complex subjects in a way anyone can understand. His communication is calm, precise, and remarkably clear — never a word wasted.",watchFor:["Pace and deliberate pacing","Simplicity of language","Precision in word choice","Storytelling that draws you in"],connection:[["Day 1","Clarity"],["Day 4","Precision"]],reflection:"What makes his explanations so easy to follow?"},
          {emoji:"🎙️",name:"Steven Bartlett",role:"Master of Listening",sub:"Known for creating conversations that reveal profound insight. He speaks less than almost any other interviewer — and gets more from his guests because of it.",watchFor:["Active listening over speaking","Follow-up questions that go deeper","Comfortable silence — he never fills it","Genuine curiosity over performance"],connection:[["Day 3","Pause Principle"],["Day 6","High-Stakes Conversations"]],reflection:"How often does he speak versus listen? What does the silence do?"},
          {emoji:"⚖️",name:"Amal Clooney",role:"Master of Precision Under Pressure",sub:"Known for communicating on some of the world's most challenging issues — human rights, international justice. What makes her remarkable isn't volume or emotion. It's clarity, precision, and calm conviction.",watchFor:["Structured, evidence-based arguments","Deliberate and considered language","Composed delivery under scrutiny","Calm authority without aggression"],connection:[["Day 4","Precision"],["Day 5","PRE Framework"],["Day 6","Composure"]],reflection:"How does she remain calm while discussing emotionally charged topics?"},
          {emoji:"🎤",name:"Simon Sinek",role:"Master of Structure",sub:"Known for turning complex ideas into memorable frameworks. His communication is simple, organised, and impossible to forget — because he builds the idea with you, not at you.",watchFor:["Clear beginning, middle, end","Strategic repetition of key phrases","Memorable, simple language","Pauses that let ideas land"],connection:[["Day 1","Feynman Technique"],["Day 5","PRE Framework"]],reflection:"How does he make complex ideas feel inevitable and simple?"},
        ];
        const SI2 = {stroke:T2.text3,strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"};
        const Tag = ({label}) => <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,padding:"3px 10px",border:"0.5px solid "+T2.border,borderRadius:20,whiteSpace:"nowrap"}}>{label}</span>;
        const Time = ({n}) => <div style={{display:"flex",alignItems:"center",gap:5}}><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={T2.text4} strokeWidth="1.2"/><path d="M8 5v3l2 1.5" stroke={T2.text4} strokeWidth="1.2" strokeLinecap="round"/></svg><span style={{fontFamily:T.sans,fontSize:12,color:T2.text4}}>{n} min</span></div>;
        const sec = (label,sub) => (
          <div style={{marginBottom:isDesktop?8:6}}>
            <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,fontWeight:700,color:T2.text,textTransform:"uppercase",letterSpacing:"2px"}}>{label}</div>
            {sub && <div style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,fontWeight:300,marginTop:2}}>{sub}</div>}
          </div>
        );
        return (
          <div style={{maxWidth:isDesktop?1160:undefined,margin:"0 auto",padding:isDesktop?"40px 88px 80px":"20px 20px 60px"}}>

            {/* ── RECOMMENDED FOR YOU ───────────────────────────────────── */}
            <div style={{marginBottom:isDesktop?48:32}}>
              {sec("Recommended For You")}
              <div style={{marginTop:16,background:T2.surface,borderRadius:12,border:"0.5px solid "+T2.border,overflow:"hidden",display:"flex",alignItems:"stretch",minHeight:isDesktop?140:120}}>
                <div style={{flex:1,padding:isDesktop?"28px 32px":"20px 20px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                  <div>
                    <div style={{marginBottom:10}}>
                      <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px"}}>Recommended For You</span>
                    </div>
                    <div style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:6}}>Brand Audit</div>
                    <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,marginBottom:12,maxWidth:380}}>Discover what your LinkedIn profile and communication style currently signal about you.</div>
                    <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{fontFamily:T.sans,fontSize:12,color:T2.text4}}>Based on: Day 11 — Brand</span>
                      <Time n={5}/>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",padding:isDesktop?"0 32px":"0 20px",flexShrink:0}}>
                  <button onClick={()=>launch(11,"Simulation")} style={{padding:isDesktop?"14px 28px":"12px 20px",borderRadius:6,border:"none",background:T2.text,color:T2.bg,fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>Launch →</button>
                </div>
              </div>
            </div>

            {/* ── FEATURED TOOLS ────────────────────────────────────────── */}
            <div style={{marginBottom:isDesktop?48:32}}>
              {sec("Featured Tools")}
              <div style={{marginTop:16}}>
                <div style={{background:"#0D0B08",borderRadius:10,border:"0.5px solid rgba(138,158,132,0.15)",padding:isDesktop?"28px":"22px",display:"flex",flexDirection:isDesktop?"row":"column",justifyContent:"space-between",gap:isDesktop?24:16,alignItems:isDesktop?"center":"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{width:44,height:44,borderRadius:10,background:"rgba(138,158,132,0.1)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 4h8l5 5v9H4V4z" stroke="rgba(138,158,132,0.8)" strokeWidth="1.3" fill="none"/><path d="M11 4v6h5" stroke="rgba(138,158,132,0.8)" strokeWidth="1.3"/><path d="M7 12h5M7 15h3" stroke="rgba(138,158,132,0.6)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    </div>
                    <div style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:8}}>Story Architect</div>
                    <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.55)",lineHeight:1.6,marginBottom:14,fontWeight:300}}>Build powerful stories and presentations in minutes.</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {["Presentation","Pitch","Leadership Talks"].map((tag,j)=><span key={j} style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.45)",padding:"3px 10px",border:"0.5px solid rgba(138,158,132,0.2)",borderRadius:20}}>{tag}</span>)}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
                    <Time n={8}/>
                    <button onClick={()=>launch(8,"Simulation")} style={{padding:"10px 22px",borderRadius:5,border:"1px solid rgba(245,239,230,0.25)",background:"transparent",color:"#F5EFE6",fontFamily:T.sans,fontSize:13,fontWeight:600,cursor:"pointer"}}>Launch →</button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CREATE ────────────────────────────────────────────────── */}
            <div style={{marginBottom:isDesktop?48:32}}>
              {sec("Create","Build communication assets.")}
              <div style={{marginTop:16,display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:14}}>
                {[
                  {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="4" y="3" width="14" height="16" rx="1.5" stroke={T2.text3} strokeWidth="1.3" fill="none"/><path d="M7 8h5M7 11h8M7 14h6" stroke={T2.text3} strokeWidth="1.2" strokeLinecap="round"/><path d="M13 3v4" stroke={T2.text3} strokeWidth="1.2"/></svg>,
                   label:"Achievement Story Builder", desc:"Structure your wins into compelling stories for interviews, reviews and promotions. SAR — Situation, Action, Result", tags:["Performance Reviews","Promotions","Interviews"], time:8, day:10, step:"Rehearsal"},
                  {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke={T2.text3} strokeWidth="1.3" fill="none"/><rect x="12" y="3" width="7" height="7" rx="1" stroke={T2.text3} strokeWidth="1.3" fill="none"/><rect x="3" y="12" width="7" height="7" rx="1" stroke={T2.text3} strokeWidth="1.3" fill="none"/><rect x="12" y="12" width="7" height="7" rx="1" stroke={T2.text3} strokeWidth="1.3" fill="none"/></svg>,
                   label:"Pixar Story Builder", desc:"Build unforgettable stories using the Pixar framework.", tags:["Storytelling","Presentations","Leadership"], time:4, day:8, step:"Rehearsal"},
                ].map((t,i)=>(
                  <div key={i} style={{background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"18px 20px",cursor:"pointer"}} onClick={()=>launch(t.day,t.step)}>
                    <div style={{display:"flex",gap:14,marginBottom:14,alignItems:"flex-start"}}>
                      <div style={{width:40,height:40,borderRadius:8,background:T2.bg,border:"0.5px solid "+T2.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{t.icon}</div>
                      <div>
                        <div style={{fontFamily:T.sans,fontSize:isDesktop?15:14,fontWeight:700,color:T2.text,marginBottom:4}}>{t.label}</div>
                        <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5,fontWeight:300}}>{t.desc}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                      {t.tags.map((tag,j)=><Tag key={j} label={tag}/>)}
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <Time n={t.time}/>
                      <span style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text}}>Open →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SKILLS GYM ────────────────────────────────────────────── */}
            <div style={{marginBottom:isDesktop?48:32}}>
              {/* Header */}
              <div style={{background:"#0D0B08",borderRadius:"10px 10px 0 0",padding:isDesktop?"22px 28px":"18px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
                <div>
                  <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(138,158,132,0.65)",textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:5}}>Skills Gym</div>
                  <div style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:"rgba(245,239,230,0.92)",lineHeight:1.2}}>Build real communication muscle</div>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.38)",fontWeight:300,marginTop:4}}>Daily practice, live scenarios, AI coaching</div>
                </div>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{flexShrink:0,opacity:0.35}}>
                  <rect x="3" y="12" width="22" height="4" rx="2" stroke="rgba(138,158,132,0.9)" strokeWidth="1.4" fill="none"/>
                  <rect x="1" y="10" width="4" height="8" rx="1.5" stroke="rgba(138,158,132,0.9)" strokeWidth="1.4" fill="none"/>
                  <rect x="23" y="10" width="4" height="8" rx="1.5" stroke="rgba(138,158,132,0.9)" strokeWidth="1.4" fill="none"/>
                  <rect x="8" y="8" width="4" height="12" rx="1.5" stroke="rgba(138,158,132,0.9)" strokeWidth="1.4" fill="none"/>
                  <rect x="16" y="8" width="4" height="12" rx="1.5" stroke="rgba(138,158,132,0.9)" strokeWidth="1.4" fill="none"/>
                </svg>
              </div>

              {/* Practice Space featured row */}
              <div style={{border:"0.5px solid rgba(138,158,132,0.2)",borderTop:"none",background:"rgba(138,158,132,0.06)",padding:isDesktop?"20px 28px":"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:T.gold}}/>
                    <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px"}}>Practice Space</span>
                  </div>
                  <div style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:3}}>Daily Challenge · Score History · Streak</div>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,fontWeight:300}}>30 scenarios. Rotates daily. Track your improvement over time.</div>
                </div>
                <button onClick={()=>setTab("practice")} style={{padding:isDesktop?"10px 22px":"9px 16px",borderRadius:5,border:"1px solid rgba(138,158,132,0.4)",background:"transparent",color:T.gold,fontFamily:T.sans,fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>Open →</button>
              </div>

              {/* Leadership Hot Seat */}
              <div style={{border:"0.5px solid rgba(138,158,132,0.2)",borderTop:"none",background:T2.surface,padding:isDesktop?"18px 28px":"15px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,cursor:"pointer"}} onClick={()=>launch(6,"Simulation")}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:700,color:T2.text,marginBottom:3}}>Leadership Hot Seat</div>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,fontWeight:300,lineHeight:1.5}}>Practise high-stakes conversations with live AI feedback.</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                    {["Promotion","Executive Meetings","Difficult Conversations"].map((tag,j)=><Tag key={j} label={tag}/>)}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                  <Time n={5}/>
                  <span style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text}}>Open →</span>
                </div>
              </div>

              {/* 4 drill cards in a grid */}
              <div style={{display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr 1fr 1fr":"1fr 1fr",borderLeft:"0.5px solid "+T2.border,borderBottom:"0.5px solid "+T2.border}}>
                {[
                  {icon:<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M12 3l-8 11h8l-2 5 8-11h-8l2-5z" stroke={T2.text3} strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>,
                   label:"Pressure Response Drill", desc:"Sharp structured answers under pressure.", tag:"Meetings", time:3, day:5, step:"Simulation"},
                  {icon:<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="8" cy="8" r="3" stroke={T2.text3} strokeWidth="1.3" fill="none"/><circle cx="14" cy="8" r="3" stroke={T2.text3} strokeWidth="1.3" fill="none"/><path d="M4 18c0-3 2-4 4-4h6c2 0 4 1 4 4" stroke={T2.text3} strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>,
                   label:"Rapport Builder", desc:"Connect with anyone, anywhere.", tag:"Networking", time:5, day:9, step:"Simulation"},
                  {icon:<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M4 6h14a1 1 0 011 1v7a1 1 0 01-1 1h-5l-4 3v-3H5a1 1 0 01-1-1V7a1 1 0 011-1z" stroke={T2.text3} strokeWidth="1.3" fill="none"/></svg>,
                   label:"Story Sprint", desc:"Tell your story in 60 seconds. Scored.", tag:"Pitches", time:3, day:8, step:"Simulation"},
                  {icon:<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M4 16V8l4 4 3-6 3 5 4-3v8H4z" stroke={T2.text3} strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>,
                   label:"Executive Briefing", desc:"Complex ideas, clear delivery.", tag:"Executive Comms", time:4, day:4, step:"Simulation"},
                ].map((t,i)=>(
                  <div key={i} onClick={()=>launch(t.day,t.step)} style={{background:T2.surface,borderTop:"0.5px solid "+T2.border,borderRight:"0.5px solid "+T2.border,padding:isDesktop?"18px 20px":"13px 14px",cursor:"pointer",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:isDesktop?148:126}}>
                    <div>
                      <div style={{width:32,height:32,borderRadius:7,background:T2.bg,border:"0.5px solid "+T2.border,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}>{t.icon}</div>
                      <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:700,color:T2.text,marginBottom:3,lineHeight:1.3}}>{t.label}</div>
                      <div style={{fontFamily:T.sans,fontSize:isDesktop?11:10,color:T2.text3,lineHeight:1.5,fontWeight:300}}>{t.desc}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
                      <Time n={t.time}/>
                      <span style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T2.text}}>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── DISCOVER ──────────────────────────────────────────────── */}
            <div style={{marginBottom:isDesktop?48:32}}>
              {sec("Discover","Increase self-awareness.")}
              <div style={{marginTop:16,display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:14}}>
                {[
                  {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke={T2.text3} strokeWidth="1.3" fill="none"/><path d="M5 19c0-4 2.7-6 6-6s6 2 6 6" stroke={T2.text3} strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>,
                   label:"Clarity Check-In", desc:"Establish your communication baseline and track your progress.", tags:["Self-Awareness","Confidence","Progress"], time:4, day:1, step:"Simulation"},
                  {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4.5H17l-3.7 2.7 1.4 4.3L11 12l-3.7 2.5 1.4-4.3L5 7.5h4.5z" stroke={T2.text3} strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>,
                   label:"Brand Audit", desc:"Discover what signals your communication sends to the world.", tags:["LinkedIn","Presence","Personal Brand"], time:5, day:11, step:"Simulation"},
                ].map((t,i)=>(
                  <div key={i} style={{background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"18px 20px",cursor:"pointer"}} onClick={()=>launch(t.day,t.step)}>
                    <div style={{display:"flex",gap:14,marginBottom:14,alignItems:"flex-start"}}>
                      <div style={{width:40,height:40,borderRadius:8,background:T2.bg,border:"0.5px solid "+T2.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{t.icon}</div>
                      <div>
                        <div style={{fontFamily:T.sans,fontSize:isDesktop?15:14,fontWeight:700,color:T2.text,marginBottom:4}}>{t.label}</div>
                        <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5,fontWeight:300}}>{t.desc}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                      {t.tags.map((tag,j)=><Tag key={j} label={tag}/>)}
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <Time n={t.time}/>
                      <span style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text}}>Open →</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Study a Master — full-width card */}
              <div style={{marginTop:14,background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"18px 20px",cursor:"pointer"}} onClick={()=>setOpenMod('studyMaster')}>
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
                  {["Observation","Self-Awareness","Learning"].map((tag,j)=><Tag key={j} label={tag}/>)}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <Time n={20}/>
                  <span style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text}}>Open →</span>
                </div>
              </div>
            </div>

            {/* Study a Master modal */}
            {openMod==='studyMaster' && (
              <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",background:"rgba(10,8,5,0.55)",backdropFilter:"blur(4px)",padding:"40px 20px 60px"}}>
                <div style={{background:T2.bg,borderRadius:12,width:"100%",maxWidth:680,position:"relative",animation:"fadeUp 0.3s ease both"}}>
                  <div style={{padding:isDesktop?"36px 40px":"24px 22px",borderBottom:"0.5px solid "+T2.divider,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
                    <div>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Discover · Week 1 Reference</div>
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

            {/* ── TOOL PATHS ────────────────────────────────────────────── */}
            <div>
              {sec("Tool Paths","Guided journeys to help you achieve your goals.")}
              <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:12}}>
                {[
                  {label:"Promotion Path",     desc:"Stand out and get noticed.",             steps:[{n:"SAR Builder",day:10,step:"Rehearsal"},{n:"Brand Audit",day:11,step:"Simulation"},{n:"Leadership Hot Seat",day:6,step:"Simulation"}]},
                  {label:"Presentation Path",  desc:"Deliver with confidence and impact.",    steps:[{n:"Story Architect",day:8,step:"Simulation"},{n:"Pixar Builder",day:8,step:"Rehearsal"},{n:"Story Sprint",day:8,step:"Simulation"}]},
                  {label:"Visibility Path",    desc:"Build your brand and expand your reach.",steps:[{n:"Rapport Builder",day:9,step:"Simulation"},{n:"Brand Audit",day:11,step:"Simulation"},{n:"Clarity Check-In",day:1,step:"Simulation"}]},
                ].map((path,i)=>(
                  <div key={i} style={{background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 28px":"18px 20px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:16}}>
                      <div>
                        <div style={{fontFamily:T.sans,fontSize:isDesktop?15:14,fontWeight:700,color:T2.text,marginBottom:2}}>{path.label}</div>
                        <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,fontWeight:300}}>{path.desc}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:4}}>
                      {path.steps.map((s,j)=>(
                        <div key={j} style={{display:"flex",alignItems:"center",gap:4}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(138,158,132,0.12)",border:"0.5px solid rgba(138,158,132,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold}}>{j+1}</span>
                            </div>
                            <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3}}>{s.n}</span>
                          </div>
                          {j<2 && <span style={{fontFamily:T.sans,fontSize:12,color:T2.border,margin:"0 4px"}}>→</span>}
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>launch(path.steps[0].day,path.steps[0].step)} style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text,background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:4}}>
                      Start Path <span style={{color:T.gold}}>→</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        );
      })()}
      {tab==="practice" && (
        <div style={isDesktop?{maxWidth:720,margin:"0 auto",padding:"24px 88px 80px"}:{padding:"0 20px 60px"}}>
          <PracticeSpace T2={Object.assign({},T,DK)} isDesktop={isDesktop}/>
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
      {tab==="sayThis" && (
        <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:T2.cardDark,borderRadius:2,padding:"22px 24px"}}>
            <h2 
style={{fontFamily:T.serif,fontSize:22,fontWeight:700,color:"white",marginBottom:8}}>Upgrade 
Your Language</h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>Replace 
weak phrases with ones that command authority.</p>
          </div>
          {SAY_THIS.map((item,i) => (
            <div key={i} 
style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
              <div 
style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>{item.ctx}</div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <span style={{fontSize:14,flexShrink:0}}>X</span>
                <p 
style={{margin:0,fontSize:14,color:T.red,textDecoration:"line-through",opacity:0.8}}>{item.bad}</p>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:14,flexShrink:0}}>OK</span>
                <p 
style={{margin:0,flex:1,fontSize:14,color:T2.green,fontWeight:600,fontStyle:"italic"}}>{item.good}</p>
                <button onClick={()=>copy(item.good)} style={{padding:"5px 12px",borderRadius:8,border:"1px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:11,cursor:"pointer"}}>{copied===item.good?"OK":"Copy"}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="phrases" && (
        <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:8}}>
          {PHRASES.map((cat,i) => (
            <div key={cat.cat} 
style={{background:T2.surface,borderRadius:2,overflow:"hidden",border:"1px solid "+T2.border}}>
              <button onClick={()=>setOpenCat(openCat===i?-1:i)} 
style={{width:"100%",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",border:"none",background:"transparent",cursor:"pointer"}}>
                <span 
style={{fontSize:15,fontWeight:600,color:T.text}}>{cat.cat}</span>
                <span 
style={{color:T2.text3,display:"inline-block",transform:openCat===i?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</span>
              </button>
              {openCat===i && (
                <div style={{borderTop:"1px solid "+T2.divider}}>
                  {cat.phrases.map((p,pi) => (
                    <div key={pi} style={{padding:"11px 18px",display:"flex",alignItems:"center",gap:10,borderBottom:pi<cat.phrases.length-1?"1px solid "+T2.divider:"none"}}>
                      <div 
style={{width:2,height:2,background:T.gold,flexShrink:0}}/>
                      <p 
style={{margin:0,flex:1,fontSize:14,color:T2.text2,fontStyle:"italic"}}>{p}</p>
                      <button onClick={()=>copy(p)} style={{padding:"4px 10px",borderRadius:8,border:"1px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:11,cursor:"pointer"}}>{copied===p?"OK":"Copy"}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {tab==="saved" && (
        <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:12}}>
          {saved.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:32,marginBottom:12}}>♥</div>
              <div 
style={{fontFamily:T.serif,fontSize:18,fontWeight:700,color:T2.text,marginBottom:8}}>No 
saved phrases yet</div>
              <p style={{fontSize:13,color:T2.text3,lineHeight:1.6}}>Tap 
the ♥ on any phrase in the Phrases tab to save it here for quick 
access.</p>
            </div>
          ) : (
            <>
              <div 
style={{background:T.cardDark,borderRadius:2,padding:"16px 18px"}}>
                <div 
style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Your 
phrase collection</div>
                <p 
style={{fontSize:12,color:"rgba(255,255,255,0.45)",margin:0}}>{saved.length} 
phrase{saved.length!==1?"s":""} saved — tap to copy, ♥ to remove</p>
              </div>
              {saved.map((p,i) => (
                <div key={i} 
style={{background:T2.surface,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,border:"1px solid "+T2.border}}>
                  <div 
style={{width:2,alignSelf:"stretch",background:T.gold,flexShrink:0,borderRadius:1}}/>
                  <p 
style={{margin:0,flex:1,fontSize:14,color:T2.text,fontStyle:"italic",lineHeight:1.5}}>{p}</p>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button onClick={()=>copy(p)} style={{padding:"5px 10px",borderRadius:8,border:"1px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:11,cursor:"pointer"}}>{copied===p?"✓":"Copy"}</button>
                    <button onClick={()=>toggleSave(p)} 
style={{padding:"5px 10px",borderRadius:8,border:"1px solid rgba(138,158,132,0.3)",background:"rgba(138,158,132,0.08)",color:T.gold,fontSize:12,cursor:"pointer"}}>♥</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
      {tab==="reading" && (
        <div style={isDesktop ? {padding:"32px 0"} : {padding:"16px 20px 0"}}>
          {(() => {
            const MODULE_TITLES = ["Speak Clearly","Voice Control","Eliminate Fillers","Short Sentences","PRE Structure","Storytelling","PIE Framework","Executive Presence","Influence","Difficult Conversations","Personal Brand","Networking","Leadership Voice","High Stakes Moments"];
            return (
              <>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,fontWeight:300,marginBottom:isDesktop?28:20}}>28 books across 14 modules</p>
                <div style={{display:"flex",flexDirection:"column",gap:isDesktop?2:8}}>
                  {FURTHER_READING.map((mod, mi) => {
                    const isOpen = openMod === mi;
                    return (
                      <div key={mi} style={{border:"0.5px solid "+T2.border,borderRadius:4,overflow:"hidden",background:isOpen?T2.bg:T2.surface}}>
                        <button onClick={() => setOpenMod(isOpen ? null : mi)} style={{
                          width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
                          padding:isDesktop?"18px 24px":"14px 18px",
                          border:"none",background:"transparent",cursor:"pointer",textAlign:"left",
                        }}>
                          <div style={{display:"flex",alignItems:"center",gap:14}}>
                            <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4,fontWeight:500,width:24,flexShrink:0}}>{"0"+(mi+1)}</span>
                            <span style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,letterSpacing:"-0.2px"}}>{MODULE_TITLES[mi]}</span>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s ease",flexShrink:0}}>
                            <path d="M3 5l4 4 4-4" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {isOpen && (
                          <div style={{borderTop:"0.5px solid "+T2.border,padding:isDesktop?"24px 24px 28px":"16px 18px 20px",display:"flex",flexDirection:"column",gap:16}}>
                            {mod.books.map((book, bi) => (
                              <div key={bi} style={{paddingBottom:bi<mod.books.length-1?16:0,borderBottom:bi<mod.books.length-1?"0.5px solid "+T2.divider:"none"}}>
                                <p style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T2.text,letterSpacing:"-0.2px",marginBottom:2}}>{book.title}</p>
                                <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,marginBottom:10}}>{book.author}</p>
                                <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T.goldDark,lineHeight:1.5,marginBottom:10}}>{book.connection}</p>
                                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text2,lineHeight:1.7,fontWeight:300,marginBottom:14}}>{book.summary}</p>
                                <a href={book.amazon} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",background:T2.ink,color:T2.bg,borderRadius:3,fontSize:12,fontFamily:T.sans,fontWeight:500,letterSpacing:"0.02em",textDecoration:"none"}}>Get the book →</a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {tab==="prep" && (
        <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:T2.navyLight,border:"1px solid "+T.accentMd,borderRadius:16,padding:"14px 16px"}}>
            <div
style={{fontSize:14,fontWeight:700,color:T.accent,marginBottom:3}}>Pre-Meeting
Ritual</div>
            <div style={{fontSize:13,color:T.accent,opacity:0.8}}>2 
minutes before any important conversation</div>
          </div>
          {QUICK_PREP.map((s,i) => (
            <div key={s.num}>
              <div 
style={{background:T2.surface,borderRadius:2,padding:"14px 18px",display:"flex",alignItems:"flex-start",gap:14}}>
                <div 
style={{width:28,height:28,borderRadius:0,background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span 
style={{fontSize:11,fontWeight:800,color:"white"}}>{s.num}</span>
                </div>
                <div style={{flex:1}}>
                  <div 
style={{fontSize:14,fontWeight:700,color:T2.text,marginBottom:3}}>{s.title}</div>
                  <div 
style={{fontSize:13,color:T2.text3,lineHeight:1.5}}>{s.desc}</div>
                </div>
                <div 
style={{background:T2.card,borderRadius:8,padding:"4px 10px"}}>
                  <div 
style={{fontSize:11,fontWeight:700,color:T2.text2,fontFamily:"monospace"}}>{s.secs}s</div>
                </div>
              </div>
              {i<QUICK_PREP.length-1 && <div 
style={{width:1,height:6,background:T.border,margin:"0 auto"}}/>}
            </div>
          ))}
          <button onClick={onQuickPrep}
style={{width:"100%",padding:"15px",borderRadius:isDesktop?8:0,border:"none",background:T.navy,color:"white",fontSize:15,fontWeight:700,cursor:"pointer"}}>Start
Quick Prep</button>
        </div>
      )}
      </div>
    </div>
  );
}

// ─── QUICK PREP FLOW 
