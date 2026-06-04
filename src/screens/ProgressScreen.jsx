import { useState } from 'react';
import { T } from '../theme.js';
import { LESSONS, ROLES, PHRASES, POWER_PHRASES, SAY_THIS } from '../data.js';
import { PBar } from '../components/NavComponents.jsx';
import { HourglassIcon } from '../components/HourglassIcon.jsx';

export function ProgressScreen({done, cur, streak, roleId, activeRole,
onChangeRole, dark=false, toggleDark, DK={}, onReset, isDesktop=false}) {
  const T2 = Object.assign({}, T, DK);
  const pct = Math.round((done.length/14)*100);
  const [selectedDay, setSelectedDay] = useState(null);
  const selectedLesson = selectedDay ? LESSONS.find(l=>l.day===selectedDay) : null;
  const skills = [
    {label:"Clarity and Editing",days:[1,2,3,4],color:T.navy},
    {label:"Storytelling",days:[5,6,7,8,9,10],color:T2.green},
    {label:"PIE Framework",days:[11,12,13],color:T.goldDark},
    {label:"Brand and Ambition",days:[12,13,14],color:T.red},
  ];
  const contentStyle = isDesktop
    ? {maxWidth:1160,margin:"0 auto",padding:"40px 48px 60px"}
    : {padding:"20px",paddingBottom:100};
  return (
    <div style={{background:T2.bg,minHeight:"100vh"}}>
      {!isDesktop && (
        <div style={{position:"relative",height:260,overflow:"hidden"}}>
          <img src="/programme-hero.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%"}}/>
          <div style={{position:"absolute",inset:0,background:"rgba(10,8,5,0.35)"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,8,5,0.78) 0%,rgba(10,8,5,0.2) 50%,transparent 100%)"}}/>
          <div style={{position:"absolute",bottom:24,left:24}}>
            <div style={{fontSize:10,fontWeight:600,color:"rgba(245,239,230,0.55)",textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:8,fontFamily:T.sans}}>Your Journey</div>
            <h1 style={{fontFamily:T.serif,fontSize:30,fontWeight:600,color:"#F5EFE6",letterSpacing:"-0.5px",lineHeight:1.1}}>Your Progress</h1>
          </div>
        </div>
      )}
      {isDesktop && (
        <div style={{position:"relative",height:420,overflow:"hidden",paddingTop:"64px",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <img src="/programme-hero.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%"}}/>
          <div style={{position:"absolute",inset:0,background:"rgba(10,8,5,0.35)"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,8,5,0.75) 0%,rgba(10,8,5,0.2) 45%,transparent 100%)"}}/>
          <div style={{position:"relative",zIndex:2,padding:"0 88px 52px",display:"flex",alignItems:"flex-end",justifyContent:"space-between",maxWidth:1160,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
            <div style={{animation:"fadeUp 0.7s ease both"}}>
              <div style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(245,239,230,0.55)",fontFamily:T.sans,fontWeight:500,marginBottom:14}}>Your Journey</div>
              <h1 style={{fontFamily:T.serif,fontSize:72,fontWeight:600,color:"#F5EFE6",letterSpacing:"-3px",lineHeight:0.92,margin:0}}>Your Progress</h1>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:40,paddingBottom:4}}>
              {streak > 0 && <div style={{textAlign:"right"}}><div style={{fontFamily:T.serif,fontSize:40,fontWeight:500,color:T.gold,lineHeight:1,letterSpacing:"-2px"}}>{streak}</div><div style={{fontSize:10,color:"rgba(245,239,230,0.6)",textTransform:"uppercase",letterSpacing:"2px",marginTop:4,fontFamily:T.sans}}>day streak</div></div>}
              <div style={{textAlign:"right"}}><div style={{fontFamily:T.serif,fontSize:40,fontWeight:500,color:"#F5EFE6",lineHeight:1,letterSpacing:"-2px"}}>{pct}<span style={{fontSize:20,color:T.gold}}>%</span></div><div style={{fontSize:10,color:"rgba(245,239,230,0.6)",textTransform:"uppercase",letterSpacing:"2px",marginTop:4,fontFamily:T.sans}}>complete</div></div>
            </div>
          </div>
        </div>
      )}
      <div style={isDesktop?Object.assign({},contentStyle,{paddingTop:32}):Object.assign({padding:"16px 20px",display:"flex",flexDirection:"column",gap:12})}>
        <div style={{background:T2.cardDark,borderRadius:24,padding:"26px 24px"}}>
          <div 
style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>Overall</div>
          <div 
style={{fontFamily:T.serif,fontSize:52,fontWeight:700,color:"white",lineHeight:1,marginBottom:4}}>{pct}%</div>
          <div 
style={{fontSize:14,color:"rgba(255,255,255,0.5)",marginBottom:18}}>{done.length} 
of 14 sessions complete</div>
          <div 
style={{height:2,background:"rgba(255,255,255,0.1)",borderRadius:1}}>
            <div style={{width:pct+"%",height:"100%",background:T.gold}}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:T2.surface,borderRadius:2,padding:"16px 18px",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:4}}>
            <HourglassIcon streak={streak} size={38}/>
            <div 
style={{fontFamily:T.serif,fontSize:26,fontWeight:700,color:T2.text,marginTop:4}}>{streak}</div>
            <div 
style={{fontSize:11,color:T2.text3,textTransform:"uppercase",letterSpacing:1}}>Day 
streak</div>
          </div>
          <div style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
            <div style={{fontSize:28,marginBottom:4}}>done</div>
            <div 
style={{fontFamily:T.serif,fontSize:26,fontWeight:700,color:T.text}}>{done.length}</div>
            <div 
style={{fontSize:11,color:T2.text3,textTransform:"uppercase",letterSpacing:1}}>Sessions 
done</div>
          </div>
        </div>
        <div style={{background:T2.surface,borderRadius:2,padding:"18px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:T2.text,marginBottom:12}}>Sessions</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:selectedLesson?14:0}}>
            {LESSONS.map(l => {
              const isDone=done.includes(l.day), isToday=l.day===cur, isSel=selectedDay===l.day;
              return (
                <button key={l.day} onClick={()=>setSelectedDay(isSel?null:l.day)}
                  style={{width:34,height:34,borderRadius:10,background:isSel?T.gold:isDone?T.greenBg:isToday?T.navyLight:T.card,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid "+(isSel?T.gold:isDone?T.green:isToday?T.navy:T.border),cursor:"pointer",padding:0,transition:"all 0.15s"}}>
                  {isDone && !isSel ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={T.green} strokeWidth="1.5" strokeLinecap="round"/></svg>
                    : <span style={{fontSize:10,fontWeight:700,color:isSel?"white":isToday?T.navy:T.text4}}>{l.day}</span>}
                </button>
              );
            })}
          </div>
          {selectedLesson && (
            <div style={{background:T2.bg,borderRadius:8,border:"0.5px solid "+T2.border,padding:"16px 18px",animation:"fadeUp 0.2s ease both"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:3}}>Day {selectedLesson.day} · {selectedLesson.tag}</div>
                  <div style={{fontFamily:T.serif,fontSize:17,fontWeight:600,color:T2.text,lineHeight:1.3}}>{selectedLesson.title}</div>
                </div>
                <button onClick={()=>setSelectedDay(null)} style={{background:"none",border:"none",color:T2.text3,fontSize:18,cursor:"pointer",padding:"0 0 0 8px",lineHeight:1}}>×</button>
              </div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:"0 0 10px",fontWeight:300}}>{selectedLesson.insight}</p>
              {selectedLesson.promise && (
                <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T.gold,lineHeight:1.55,margin:"0 0 10px"}}>{selectedLesson.promise}</p>
              )}
              {selectedLesson.phrases && selectedLesson.phrases.length > 0 && (
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {selectedLesson.phrases.map((p,i)=>(
                    <span key={i} style={{fontFamily:T.sans,fontSize:11,color:T2.text3,padding:"4px 10px",background:T2.surface,borderRadius:20,border:"0.5px solid "+T2.border,fontStyle:"italic"}}>{p}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{background:T2.surface,borderRadius:2,padding:"18px 20px"}}>
          <div 
style={{fontSize:12,fontWeight:700,color:T2.text,marginBottom:14}}>Skills 
Building</div>
          {skills.map((sk,i) => {
            const p = 
Math.round((sk.days.filter(d=>done.includes(d)).length/sk.days.length)*100);
            return (
              <div key={sk.label} 
style={{marginBottom:i<skills.length-1?12:0}}>
                <div 
style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span 
style={{fontSize:13,color:T.text}}>{sk.label}</span>
                  <span 
style={{fontSize:12,fontWeight:700,color:sk.color}}>{p}%</span>
                </div>
                <PBar pct={p} h={3} color={sk.color}/>
              </div>
            );
          })}
        </div>
      {/* Dark Mode Toggle */}
      <div style={{padding:"0 20px 12px"}}>
        <div style={{background:T2.surface,borderRadius:2,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              {dark
                ? <path d="M9 3a6 6 0 100 12A6 6 0 009 3zM9 1v2M9 15v2M1 
9h2M15 9h2M3.2 3.2l1.4 1.4M13.4 13.4l1.4 1.4M3.2 14.8l1.4-1.4M13.4 
4.6l1.4-1.4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/>
                : <path d="M12 9a3.5 3.5 0 01-3.5 3.5c-2 0-3.5-1.6-3.5-3.5 
0-2 1.5-3.5 3.5-3.5S12 7 12 9zM4.2 4.2A7 7 0 0015 15" stroke={T2.text3} 
strokeWidth="1.3" strokeLinecap="round"/>
              }
            </svg>
            <div>
              <div 
style={{fontSize:13,fontWeight:600,color:T2.text}}>{dark?"Dark mode":"Light mode"}</div>
              <div style={{fontSize:11,color:T2.text3}}>Tap to 
switch</div>
            </div>
          </div>
          <button onClick={toggleDark} style={{
            
width:48,height:28,borderRadius:14,border:"none",cursor:"pointer",
            
background:dark?"linear-gradient(90deg,"+T.navy+",#1E2D45)":"rgba(0,0,0,0.08)",
            position:"relative",transition:"background 0.3s",padding:0,
          }}>
            <div style={{
              position:"absolute",top:3,
              left:dark?22:3,
              width:22,height:22,borderRadius:"50%",
              background:dark?T.gold:"white",
              boxShadow:"0 1px 4px rgba(0,0,0,0.25)",
              transition:"left 0.25s cubic-bezier(0.22,1,0.36,1)",
            }}/>
          </button>
        </div>
      </div>
      {/* Reset Profile */}
      <div style={{padding:"0 20px 12px"}}>
        <div style={{background:T2.surface,borderRadius:2,padding:"14px 18px"}}>
          <div 
style={{fontSize:12,fontWeight:700,color:T2.text,marginBottom:4}}>Reset 
profile</div>
          <p 
style={{fontSize:12,color:T2.text3,lineHeight:1.5,marginBottom:12}}>Restart 
the onboarding, change your answers, or start the programme again from Day 
1.</p>
          <button onClick={onReset} style={{
            width:"100%",padding:"12px",borderRadius:8,
            border:"1px solid rgba(139,32,32,0.25)",
            background:"rgba(139,32,32,0.06)",
            color:"#8B2020",fontSize:13,fontWeight:600,cursor:"pointer",
          }}>
            Reset profile &amp; restart
          </button>
        </div>
      </div>
      {/* Role Selector */}
      <div style={{padding:"0 20px 12px"}}>
        <div style={{background:T2.surface,borderRadius:2,padding:"18px 20px"}}>
          <div 
style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text}}>Your 
Role</div>
            {activeRole && <span style={{fontSize:10,color:T2.text3}}>Tap 
to change</span>}
          </div>
          {activeRole ? (
            <div style={{marginBottom:12,padding:"12px 14px",background:T.navy,borderRadius:8,border:"1px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",gap:12}}>
              <span 
style={{fontSize:20,color:T.gold}}>{activeRole.icon}</span>
              <div>
                <div 
style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.9)"}}>{activeRole.label}</div>
                <div 
style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:2}}>{activeRole.examples}</div>
                <div 
style={{fontSize:11,color:T.gold,marginTop:6,lineHeight:1.5}}>{activeRole.pieEmphasis}</div>
              </div>
            </div>
          ) : (
            <p 
style={{fontSize:13,color:T2.text3,marginBottom:12,lineHeight:1.5}}>Set 
your role to get scenarios tailored to your world.</p>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {ROLES.map(role => (
              <button key={role.id} onClick={()=>onChangeRole(role.id)} 
style={{
                padding:"10px 14px",borderRadius:8,border:"1px solid "+(roleId===role.id?T.gold:T.border),
                
background:roleId===role.id?"rgba(138,158,132,0.08)":T.card,
                
display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left",
              }}>
                <span 
style={{fontSize:16,color:roleId===role.id?T.gold:T.text3,width:20,textAlign:"center"}}>{role.icon}</span>
                <div style={{flex:1}}>
                  <div 
style={{fontSize:12,fontWeight:roleId===role.id?700:500,color:roleId===role.id?T.text:T.text2}}>{role.label}</div>
                  <div 
style={{fontSize:10,color:T2.text4,marginTop:1}}>{role.examples}</div>
                </div>
                {roleId===role.id && <svg width="14" height="14" 
viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke={T.gold} 
strokeWidth="1.5" strokeLinecap="round"/></svg>}
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>
      {/* Version info */}
      <div style={{padding:"8px 20px 24px",textAlign:"center"}}>
        <div style={{fontSize:10,color:T2.text4,fontFamily:T.sans,letterSpacing:"0.5px",lineHeight:1.6}}>
          AmplifyU &middot; build <span style={{fontVariantNumeric:"tabular-nums"}}>{typeof __COMMIT_SHA__ !== 'undefined' ? __COMMIT_SHA__ : 'local'}</span>
        </div>
        <div style={{fontSize:9,color:T2.text4,fontFamily:T.sans,opacity:0.6,marginTop:2}}>
          {typeof __BUILD_TIME__ !== 'undefined' ? new Date(__BUILD_TIME__).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : ''}
        </div>
      </div>
    </div>
  );
}

// ─── TOOLKIT SCREEN
