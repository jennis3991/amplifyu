import { useState } from 'react';
import { T } from '../theme.js';
import { LESSONS, ROLES } from '../data.js';
import { PIECES, getPieceInfo } from '../utils.js';

export function ProgressScreen({done, cur, streak, roleId, activeRole,
onChangeRole, dark=false, toggleDark, DK={}, onReset, isDesktop=false, onStart}) {
  const T2 = Object.assign({}, T, DK);
  const pct = Math.round((done.length/14)*100);
  const nextLesson = LESSONS.find(l=>l.day===cur);
  const timeInvested = LESSONS.filter(l=>done.includes(l.day)).reduce((sum,l)=>sum+(l.mins||20),0);
  const timeH = Math.floor(timeInvested/60);
  const timeM = timeInvested % 60;
  const [showAllAch, setShowAllAch] = useState(false);

  const SKILLS = [
    {label:"Clarity & Structure", sub:"Short sentences, PRE framework, clear thinking", days:[1,2,3,4],
     icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 9h10M3 13h7" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round"/></svg>},
    {label:"Storytelling", sub:"Narrative, structure, making your message land", days:[5,6,7,8],
     icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 4h8l4 4v8H3V4z" stroke={T2.text3} strokeWidth="1.4" fill="none"/><path d="M10 4v5h5" stroke={T2.text3} strokeWidth="1.3"/></svg>},
    {label:"Connection", sub:"Rapport, listening, empathy, building relationships", days:[9],
     icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="3" stroke={T2.text3} strokeWidth="1.4" fill="none"/><circle cx="13" cy="7" r="3" stroke={T2.text3} strokeWidth="1.4" fill="none"/><path d="M3 17c0-3 2-4 4-4h6c2 0 4 1 4 4" stroke={T2.text3} strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>},
    {label:"Presence & Influence", sub:"Confidence, delivery, presence, non-verbal", days:[10,11,12,13,14],
     icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke={T2.text3} strokeWidth="1.4" fill="none"/><path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" stroke={T2.text3} strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>},
  ];

  const skillFocus = SKILLS.reduce((least, sk) => {
    const p = Math.round((sk.days.filter(d=>done.includes(d)).length/sk.days.length)*100);
    return p < (least.pct ?? 999) ? {...sk, pct:p} : least;
  }, {pct:999});

  const ACHIEVEMENTS = [
    {id:"first",   label:"Getting Started",    sub:"Completed your first session",      earned:done.length>=1, icon:"◎"},
    {id:"three",   label:"Consistent Learner", sub:"Completed 3 sessions",             earned:done.length>=3, icon:"◎"},
    {id:"streak1", label:"First Streak",        sub:"Achieved a 1-day streak",          earned:streak>=1,      icon:"◎"},
    {id:"half",    label:"Halfway There",       sub:"Completed 7 sessions",             earned:done.length>=7, icon:"◎"},
    {id:"story",   label:"Storyteller",         sub:"Completed the Storytelling modules",earned:[5,6,7,8].every(d=>done.includes(d)), icon:"◎"},
    {id:"full",    label:"Amplified",           sub:"Completed all 14 sessions",        earned:done.length===14, icon:"◎"},
  ].filter(a=>a.earned || !showAllAch || true);

  const earnedAch = ACHIEVEMENTS.filter(a=>a.earned);


  const pieceInfo = getPieceInfo(done.length);

  const sec = (label) => (
    <div style={{fontFamily:T.sans,fontSize:isDesktop?11:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"2px",marginBottom:isDesktop?20:14}}>{label}</div>
  );

  const W = isDesktop ? {maxWidth:1160,margin:"0 auto",padding:"0 88px"} : {padding:"0 20px"};

  return (
    <div style={{background:T2.bg,minHeight:"100vh",paddingBottom:80}}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {isDesktop ? (
        <div style={{background:T2.bg,borderBottom:"1px solid "+T2.divider,paddingTop:64}}>
          <div style={{maxWidth:1160,margin:"0 auto",padding:"52px 88px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:48}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"3px",marginBottom:16}}>Your Journey</div>
              <h1 style={{fontFamily:T.serif,fontSize:"clamp(36px,3.5vw,56px)",fontWeight:600,color:T2.text,letterSpacing:"-1.5px",lineHeight:1.1,marginBottom:16,maxWidth:520}}>Every conversation moves you forward.</h1>
            </div>
            <div style={{width:"38%",flexShrink:0,borderRadius:12,overflow:"hidden",height:280,position:"relative"}}>
              <img src="/programme-hero.jpg" alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 50%"}}/>
              <div style={{position:"absolute",inset:0,background:"rgba(10,8,5,0.08)"}}/>
            </div>
          </div>
        </div>
      ) : (
        <div style={{position:"relative",height:240,overflow:"hidden"}}>
          <img src="/programme-hero.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%"}}/>
          <div style={{position:"absolute",inset:0,background:"rgba(10,8,5,0.4)"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,8,5,0.85) 0%,transparent 60%)"}}/>
          <div style={{position:"absolute",bottom:24,left:24,right:24}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(245,239,230,0.6)",textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:8}}>Your Journey</div>
            <h1 style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:"#F5EFE6",lineHeight:1.15,marginBottom:4}}>Every conversation moves you forward.</h1>
          </div>
        </div>
      )}

      {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
      <div style={{...W,paddingTop:isDesktop?40:24,marginTop:0}}>
        {sec("Overview")}
        <div style={{display:"grid",gridTemplateColumns:isDesktop?"auto 1fr 1fr":"1fr 1fr",gap:isDesktop?14:10,alignItems:"stretch"}}>

          {/* Overall Progress — dark card */}
          <div style={{background:"#0D0B08",borderRadius:10,padding:isDesktop?"22px 24px":"18px",minWidth:isDesktop?160:undefined}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(245,239,230,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Overall Progress</div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?44:38,fontWeight:600,color:"#F5EFE6",letterSpacing:"-2px",lineHeight:1,marginBottom:6}}>{pct}<span style={{fontSize:isDesktop?20:16,color:T.gold}}>%</span></div>
            <div style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.45)",marginBottom:12}}>{done.length} of 14 sessions complete</div>
            <div style={{height:2,background:"rgba(255,255,255,0.1)",borderRadius:1}}><div style={{width:pct+"%",height:"100%",background:T.gold,borderRadius:1,transition:"width 0.8s ease"}}/></div>
          </div>

          {/* Time Invested */}
          <div style={{background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"16px"}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Time Invested</div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:T2.text,letterSpacing:"-1px",lineHeight:1,marginBottom:4}}>{timeH>0?timeH+"h ":""}{timeM}m</div>
            <div style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>Across all sessions</div>
          </div>

          {/* Next Session */}
          {nextLesson && (
            <div style={{background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"16px",display:"flex",flexDirection:"column",justifyContent:"space-between",gridColumn:isDesktop?"auto":"1 / -1"}}>
              <div>
                <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Next Session</div>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?22:20,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:4}}>Day {cur}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,fontWeight:300}}>{nextLesson.title}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",marginTop:12}}>
                <div onClick={()=>onStart&&onStart(cur)} style={{width:32,height:32,borderRadius:"50%",background:T2.text,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke={T2.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PIECE LADDER ─────────────────────────────────────────────────── */}
      <div style={{...W,paddingTop:isDesktop?40:28}}>
        {sec("Your Rank")}
        <div style={{background:"#0D0B08",borderRadius:10,padding:isDesktop?"24px 28px":"20px 20px"}}>
          <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
            <div style={{position:"absolute",top:20,left:"5%",right:"5%",height:1,background:"rgba(255,255,255,0.1)",zIndex:0}}/>
            {PIECES.map((piece,i) => {
              const isCurrent = i === pieceInfo.currentIndex;
              const isNext = i === pieceInfo.currentIndex + 1;
              const isPast = i < pieceInfo.currentIndex;
              return (
                <div key={piece.name} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,position:"relative",zIndex:1}}>
                  <div style={{
                    width:40, height:40, borderRadius:"50%", overflow:"hidden",
                    border: isCurrent ? "1.5px solid #c9a961" : isNext ? "1.5px solid rgba(201,169,97,0.4)" : "1.5px solid rgba(255,255,255,0.1)",
                    opacity: isCurrent ? 1 : isPast ? 0.85 : 0.3,
                    position:"relative", flexShrink:0,
                  }}>
                    <img src={piece.img} alt={piece.name} style={{position:"absolute",width:"126%",height:"126%",top:"-13%",left:"-13%",objectFit:"cover"}}/>
                  </div>
                  <span style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:isCurrent?"#c9a961":isNext?"rgba(245,239,230,0.5)":"rgba(255,255,255,0.18)",textTransform:"uppercase",letterSpacing:"1px",textAlign:"center"}}>{piece.name}</span>
                </div>
              );
            })}
          </div>
          {pieceInfo.next ? (
            <p style={{fontFamily:T.sans,fontSize:13,color:"rgba(245,239,230,0.5)",margin:0,textAlign:"center"}}>
              {pieceInfo.daysUntil} {pieceInfo.daysUntil===1?"day":"days"} until {pieceInfo.next.name}
            </p>
          ) : (
            <p style={{fontFamily:T.sans,fontSize:13,color:"#c9a961",margin:0,textAlign:"center"}}>
              {"You've reached the highest rank — "+pieceInfo.current.name}
            </p>
          )}
        </div>
      </div>

      {/* ── SESSION PROGRESS ─────────────────────────────────────────────── */}
      <div style={{...W,paddingTop:isDesktop?40:28}}>
        {sec("Session Progress")}
        <div style={{background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:isDesktop?"24px 28px":"18px 20px"}}>
          {[[1,2,3,4,5,6,7],[8,9,10,11,12,13,14]].map((week,wi)=>(
            <div key={wi} style={{marginBottom:wi===0?20:0}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Week {wi+1}</div>
              <div style={{display:"flex",gap:isDesktop?10:6}}>
                {week.map(day=>{
                  const isDone = done.includes(day);
                  const isUpcoming = day > cur;
                  return (
                    <div key={day} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,flex:1,opacity:isUpcoming?0.35:1,transition:"opacity 0.3s"}}>
                      <div style={{
                        width:isDesktop?36:30,height:isDesktop?36:30,borderRadius:"50%",
                        background:isDone?"rgba(138,158,132,0.15)":T2.bg,
                        border:`1px solid ${isDone?"rgba(138,158,132,0.4)":day===cur?"rgba(201,169,97,0.45)":T2.border}`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}>
                        {isDone
                          ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round"/></svg>
                          : <span style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:day===cur?T.gold:T2.text4}}>{day}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{marginTop:20,paddingTop:16,borderTop:"0.5px solid "+T2.divider}}>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontWeight:600,color:T2.text,marginBottom:4}}>
              {done.length>=14?"Programme complete — you've done the work.":done.length>=7?"You're into the second half — keep going.":done.length>=3?"You're building momentum.":"Every session moves you forward."}
            </div>
            <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3}}>{done.length} of 14 sessions complete</div>
          </div>
        </div>
      </div>

      {/* ── SKILLS DEVELOPMENT ───────────────────────────────────────────── */}
      <div style={{...W,paddingTop:isDesktop?40:28}}>
        {sec("Skills Development")}
        <div style={{display:"flex",flexDirection:"column",gap:0,background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
          {SKILLS.map((sk,i)=>{
            const p = Math.round((sk.days.filter(d=>done.includes(d)).length/sk.days.length)*100);
            return (
              <div key={sk.label} style={{padding:isDesktop?"20px 24px":"16px 20px",borderBottom:i<SKILLS.length-1?"0.5px solid "+T2.divider:"none"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
                  <div style={{width:32,height:32,borderRadius:7,background:T2.bg,border:"0.5px solid "+T2.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{sk.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,marginBottom:2}}>{sk.label}</div>
                    <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,fontWeight:300}}>{sk.sub}</div>
                  </div>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:700,color:p>=50?T.gold:T2.text3,flexShrink:0}}>{p}%</div>
                </div>
                <div style={{height:3,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                  <div style={{width:p+"%",height:"100%",background:p>=50?T.gold:"rgba(138,158,132,0.5)",borderRadius:2,transition:"width 0.8s ease"}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STREAK + ACHIEVEMENTS ─────────────────────────────────────────── */}
      <div style={{...W,paddingTop:isDesktop?40:28}}>
        <div>

          {/* Achievements */}
          <div style={{background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:isDesktop?"24px 28px":"18px 20px"}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:16}}>Recent Achievements</div>
            {earnedAch.length===0 ? (
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6}}>Complete your first session to unlock achievements.</p>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
                {earnedAch.slice(0,3).map((a,i)=>(
                  <div key={a.id} style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"0.5px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 2l1.5 4.5H15l-3.75 2.7 1.5 4.3L9 11l-3.75 3 1.5-4.3L3 7.5h4.5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>
                    </div>
                    <div>
                      <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:600,color:T2.text,marginBottom:1}}>{a.label}</div>
                      <div style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>{a.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {earnedAch.length>3&&<button onClick={()=>setShowAllAch(v=>!v)} style={{fontFamily:T.sans,fontSize:12,color:T2.text3,background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:4}}>View all achievements →</button>}
          </div>
        </div>
      </div>

      {/* ── YOUR ROLE ─────────────────────────────────────────────────────── */}
      <div style={{...W,paddingTop:isDesktop?40:28}}>
        {sec("Your Role")}
        <div style={{background:"#0D0B08",borderRadius:10,padding:isDesktop?"28px 32px":"20px 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(245,239,230,0.35)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Primary Role</div>
          {activeRole ? (
            <div style={{display:isDesktop?"flex":"block",gap:isDesktop?48:0,alignItems:"flex-start"}}>
              <div style={{flex:isDesktop?1:undefined}}>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:"#F5EFE6",marginBottom:4}}>{activeRole.label}</div>
                <div style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.4)",marginBottom:isDesktop?0:14}}>{activeRole.examples}</div>
              </div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.6)",lineHeight:1.7,margin:0,fontWeight:300,flex:isDesktop?"1.4":undefined,maxWidth:isDesktop?520:undefined}}>{activeRole.pieEmphasis||"Exposure is the lever most individual contributors are underusing. Your work is excellent — the gap is making sure the right people know about it."}</p>
            </div>
          ) : (
            <>
              <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:"#F5EFE6",marginBottom:4}}>No role set</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:"rgba(245,239,230,0.45)",lineHeight:1.6,marginBottom:16,fontWeight:300}}>Set your role to get context tailored to your world.</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {ROLES.slice(0,3).map(role=>(
                  <button key={role.id} onClick={()=>onChangeRole(role.id)} style={{padding:"8px 14px",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.25)",background:"rgba(138,158,132,0.06)",color:"rgba(245,239,230,0.7)",fontSize:12,fontFamily:T.sans,cursor:"pointer"}}>{role.label}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── FOOTER ACTIONS ───────────────────────────────────────────────── */}
      <div style={{...W,paddingTop:isDesktop?32:24}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={toggleDark} style={{padding:"10px 18px",borderRadius:6,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text3,fontFamily:T.sans,fontSize:12,cursor:"pointer"}}>{dark?"☀️ Light mode":"🌙 Dark mode"}</button>
          <button onClick={onReset} style={{padding:"10px 18px",borderRadius:6,border:"0.5px solid rgba(180,60,60,0.3)",background:"rgba(180,60,60,0.04)",color:"rgba(160,60,60,0.8)",fontFamily:T.sans,fontSize:12,cursor:"pointer"}}>Reset profile</button>
        </div>
      </div>

      {/* Version */}
      <div style={{...W,paddingTop:24,textAlign:isDesktop?"center":"center"}}>
        <div style={{fontSize:10,color:T2.text4,fontFamily:T.sans,letterSpacing:"0.5px"}}>
          AmplifyU &middot; {typeof __COMMIT_SHA__ !== 'undefined' ? __COMMIT_SHA__ : 'build local'}
        </div>
        <div style={{fontSize:9,color:T2.text4,fontFamily:T.sans,opacity:0.6,marginTop:2}}>
          {typeof __BUILD_TIME__ !== 'undefined' ? new Date(__BUILD_TIME__).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
        </div>
      </div>

    </div>
  );
}
