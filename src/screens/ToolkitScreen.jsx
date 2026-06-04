import { useState, useEffect } from 'react';
import { T } from '../theme.js';
import { FURTHER_READING, PHRASES, SAY_THIS, QUICK_PREP, DAILY_INSIGHTS, POWER_PHRASES } from '../data.js';
import { Scene } from '../scenes.jsx';

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
  const toolkitTabs = [["aitools","AI Tools"],["story","My Story"],["sayThis","Say This Instead"],["phrases","Phrases"],["saved","♥ Saved"+(saved.length>0?" ("+saved.length+")":"")],["reading","Reading List"],["prep","Quick Prep"]];
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
              <div style={{marginTop:16,display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:16}}>
                {[
                  {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 4h8l5 5v9H4V4z" stroke="rgba(138,158,132,0.8)" strokeWidth="1.3" fill="none"/><path d="M11 4v6h5" stroke="rgba(138,158,132,0.8)" strokeWidth="1.3"/><path d="M7 12h5M7 15h3" stroke="rgba(138,158,132,0.6)" strokeWidth="1.2" strokeLinecap="round"/></svg>,
                   label:"Story Architect", desc:"Build powerful stories and presentations in minutes.", tags:["Presentation","Pitch","Leadership Talks"], time:8, day:8, step:"Simulation"},
                  {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="rgba(138,158,132,0.8)" strokeWidth="1.3" fill="none"/><circle cx="11" cy="11" r="4" stroke="rgba(138,158,132,0.6)" strokeWidth="1.2" fill="none"/><circle cx="11" cy="11" r="1.5" fill="rgba(138,158,132,0.8)"/></svg>,
                   label:"Leadership Hot Seat", desc:"Practice high-stakes conversations with AI feedback.", tags:["Promotion","Executive Meetings","Difficult Conversations"], time:5, day:10, step:"Simulation"},
                ].map((t,i)=>(
                  <div key={i} style={{background:"#0D0B08",borderRadius:10,border:"0.5px solid rgba(138,158,132,0.15)",padding:isDesktop?"28px":"22px",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:200}}>
                    <div>
                      <div style={{width:44,height:44,borderRadius:10,background:"rgba(138,158,132,0.1)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>{t.icon}</div>
                      <div style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:8}}>{t.label}</div>
                      <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.55)",lineHeight:1.6,marginBottom:14,fontWeight:300}}>{t.desc}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>
                        {t.tags.map((tag,j)=><span key={j} style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.45)",padding:"3px 10px",border:"0.5px solid rgba(138,158,132,0.2)",borderRadius:20}}>{tag}</span>)}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <Time n={t.time}/>
                      <button onClick={()=>launch(t.day,t.step)} style={{padding:"10px 22px",borderRadius:5,border:"1px solid rgba(245,239,230,0.25)",background:"transparent",color:"#F5EFE6",fontFamily:T.sans,fontSize:13,fontWeight:600,cursor:"pointer"}}>Launch →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CREATE ────────────────────────────────────────────────── */}
            <div style={{marginBottom:isDesktop?48:32}}>
              {sec("Create","Build communication assets.")}
              <div style={{marginTop:16,display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:14}}>
                {[
                  {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="4" y="3" width="14" height="16" rx="1.5" stroke={T2.text3} strokeWidth="1.3" fill="none"/><path d="M7 8h5M7 11h8M7 14h6" stroke={T2.text3} strokeWidth="1.2" strokeLinecap="round"/><path d="M13 3v4" stroke={T2.text3} strokeWidth="1.2"/></svg>,
                   label:"SAR Builder", desc:"Turn achievements into compelling stories that get noticed.", tags:["Performance Reviews","Promotions","Interviews"], time:8, day:10, step:"Practice"},
                  {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke={T2.text3} strokeWidth="1.3" fill="none"/><rect x="12" y="3" width="7" height="7" rx="1" stroke={T2.text3} strokeWidth="1.3" fill="none"/><rect x="3" y="12" width="7" height="7" rx="1" stroke={T2.text3} strokeWidth="1.3" fill="none"/><rect x="12" y="12" width="7" height="7" rx="1" stroke={T2.text3} strokeWidth="1.3" fill="none"/></svg>,
                   label:"Pixar Story Builder", desc:"Build unforgettable stories using the Pixar framework.", tags:["Storytelling","Presentations","Leadership"], time:4, day:8, step:"Practice"},
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

            {/* ── PRACTICE ──────────────────────────────────────────────── */}
            <div style={{marginBottom:isDesktop?48:32}}>
              {sec("Practice","Build communication capability.")}
              <div style={{marginTop:16,display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr 1fr 1fr":"1fr 1fr",gap:12}}>
                {[
                  {icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M12 3l-8 11h8l-2 5 8-11h-8l2-5z" stroke={T2.text3} strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>,
                   label:"PRE Challenge", desc:"Think clearly under pressure.", tag:"Meetings", time:3, day:5, step:"Simulation"},
                  {icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="8" cy="8" r="3" stroke={T2.text3} strokeWidth="1.3" fill="none"/><circle cx="14" cy="8" r="3" stroke={T2.text3} strokeWidth="1.3" fill="none"/><path d="M4 18c0-3 2-4 4-4h6c2 0 4 1 4 4" stroke={T2.text3} strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>,
                   label:"Rapport Builder", desc:"Connect with anyone, anywhere.", tag:"Networking", time:5, day:9, step:"Simulation"},
                  {icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M4 6h14a1 1 0 011 1v7a1 1 0 01-1 1h-5l-4 3v-3H5a1 1 0 01-1-1V7a1 1 0 011-1z" stroke={T2.text3} strokeWidth="1.3" fill="none"/></svg>,
                   label:"Story Sprint", desc:"Tell your story in 60 seconds.", tag:"Elevator Pitches", time:3, day:8, step:"Simulation"},
                  {icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M4 16V8l4 4 3-6 3 5 4-3v8H4z" stroke={T2.text3} strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>,
                   label:"Executive Briefing", desc:"Explain complex ideas with clarity.", tag:"Executive Communication", time:4, day:1, step:"Simulation"},
                ].map((t,i)=>(
                  <div key={i} style={{background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:isDesktop?"20px":"16px",cursor:"pointer",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:isDesktop?160:140}} onClick={()=>launch(t.day,t.step)}>
                    <div>
                      <div style={{width:36,height:36,borderRadius:7,background:T2.bg,border:"0.5px solid "+T2.border,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>{t.icon}</div>
                      <div style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:700,color:T2.text,marginBottom:4}}>{t.label}</div>
                      <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,lineHeight:1.5,fontWeight:300,marginBottom:10}}>{t.desc}</div>
                      <Tag label={t.tag}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
                      <Time n={t.time}/>
                      <span style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T2.text}}>Open →</span>
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
            </div>

            {/* ── TOOL PATHS ────────────────────────────────────────────── */}
            <div>
              {sec("Tool Paths","Guided journeys to help you achieve your goals.")}
              <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:12}}>
                {[
                  {label:"Promotion Path",     desc:"Stand out and get noticed.",             steps:[{n:"SAR Builder",day:10,step:"Practice"},{n:"Brand Audit",day:11,step:"Simulation"},{n:"Leadership Hot Seat",day:10,step:"Simulation"}]},
                  {label:"Presentation Path",  desc:"Deliver with confidence and impact.",    steps:[{n:"Story Architect",day:8,step:"Simulation"},{n:"Pixar Builder",day:8,step:"Practice"},{n:"Story Sprint",day:8,step:"Simulation"}]},
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
              I had always been good at storytelling. I understood the 
power of a well-placed narrative — how it changes the energy in a room, 
how it makes people lean in. I had strong instincts for communication and 
had built real credibility over my career. But coming back from leave, I 
wanted more than instinct. I wanted a <strong>system.</strong> Something I 
could call on when tired, when stretched, when operating across two very 
full worlds simultaneously.
            </p>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              I built AmplifyU because the tools I needed didn't exist. 
Something science-backed, practically structured, and designed for a real 
professional life — not a retreat, not a course, not a workshop. <strong>A 
daily platform that fits inside the life you already have.</strong>
            </p>
            {/* PIE section */}
            <div 
style={{background:dark?T2.surface:T2.card,borderRadius:2,padding:"18px 20px"}}>
              <div 
style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:10}}>The 
PIE Framework</div>
              <p 
style={{fontSize:14,color:T2.text,lineHeight:1.7,marginBottom:12}}>
                Research shows performance accounts for only <strong>10% 
of career advancement.</strong> The remaining 90% is Image and Exposure — 
how you show up and who sees you doing it.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                
{[{l:"P",t:"Performance",sub:"10%"},{l:"I",t:"Image",sub:"30%"},{l:"E",t:"Exposure",sub:"60%"}].map(p=>(
                  <div key={p.l} 
style={{background:T.navy,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                    <div 
style={{fontFamily:T.serif,fontSize:22,fontWeight:700,color:T.gold,lineHeight:1,marginBottom:2}}>{p.l}</div>
                    <div 
style={{fontSize:9,fontWeight:700,color:"white",marginBottom:1}}>{p.t}</div>
                    <div 
style={{fontSize:9,color:"rgba(255,255,255,0.45)"}}>{p.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              AmplifyU is built around all three — because isolated 
communication skills are not enough. What transforms a career is 
understanding how everything works together, and having a daily practice 
that makes it automatic.
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
