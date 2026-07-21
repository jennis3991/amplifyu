import { useState } from 'react';
import { T } from '../theme.js';
import { LESSONS, ROLES, REVIEW_CLOSING } from '../data.js';
import { MODULE_ICONS } from '../diagrams.jsx';
import { NAV_H } from '../components/NavComponents.jsx';
import { Scene } from '../scenes.jsx';

export function SessionsScreen({done, cur, onStart, roleId, dark=false, DK={}, isDesktop=false}) {
  const T2 = Object.assign({}, T, DK);
  const [lockedPreview, setLockedPreview] = useState(null);

  const DayCard = ({ lesson }) => {
    const isDone = done.includes(lesson.day);
    const isToday = lesson.day === cur;
    const isLocked = false;
    const isComingSoon = !!lesson.comingSoon;
    if (isDesktop) {
      return (
        <div
          onClick={() => isComingSoon ? null : isLocked ? setLockedPreview(lesson) : onStart(lesson.day)}
          className="au-card-hover"
          style={{
            background: isComingSoon ? T2.surface : isDone ? "rgba(61,107,79,0.05)" : isToday ? "rgba(138,158,132,0.05)" : T2.surface,
            borderRadius: 6, padding: "18px 20px", cursor: isComingSoon ? "default" : "pointer",
            border: "1px solid " + (isDone ? "rgba(61,107,79,0.2)" : isToday ? "rgba(138,158,132,0.3)" : T2.border),
            position: "relative", opacity: isComingSoon ? 0.6 : isLocked ? 0.5 : 1,
            boxShadow: isToday ? "0 2px 20px rgba(138,158,132,0.1)" : "none",
          }}>
          {isToday && <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, " + T.gold + " 0%, rgba(138,158,132,0.2) 100%)",
            borderRadius: "6px 6px 0 0",
          }}/>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{
              fontFamily: T.serif, fontSize: 18, fontWeight: 600,
              color: isDone ? T.green : isToday ? T.gold : T2.text3,
              lineHeight: 1, letterSpacing: "-0.5px",
            }}>{lesson.day}</div>
            <span style={{
              fontSize: 9.5, fontWeight: 600,
              color: isComingSoon ? T2.text4 : isDone ? T.green : isToday ? T.gold : T2.text4,
              letterSpacing: "0.5px",
            }}>{isComingSoon ? "Coming Soon" : isDone ? "✓ Done" : isToday ? "Today" : "→"}</span>
          </div>
          <div style={{
            fontSize: 13, fontWeight: isDone ? 400 : 500,
            color: isDone ? T2.text3 : T2.text, marginBottom: 8, lineHeight: 1.3,
          }}>{lesson.title}</div>
          {isComingSoon
            ? <span style={{ fontSize:9.5, fontWeight:600, color:T2.text4, background:"rgba(138,158,132,0.1)", padding:"2px 10px", borderRadius:3, display:"inline-block", letterSpacing:"0.5px", border:"0.5px solid rgba(138,158,132,0.2)" }}>In Development</span>
            : <span style={{ fontSize:9.5, fontWeight:500, color:T2.text3, background:T2.divider, padding:"2px 8px", borderRadius:3, display:"inline-block", letterSpacing:"0.3px" }}>{lesson.tag}</span>
          }
        </div>
      );
    }
    return (
      <div key={lesson.day}
        onClick={() => isComingSoon ? null : isLocked ? setLockedPreview(lesson) : onStart(lesson.day)}
        style={{
          display:"flex",alignItems:"center",gap:16,
          padding:"18px 0",
          borderBottom:"0.5px solid "+T2.divider,
          cursor:isComingSoon?"default":"pointer",
          opacity:isComingSoon?0.5:isLocked?0.6:1,
        }}>
        {/* Large editorial day number */}
        <div style={{
          fontFamily:T.serif,fontSize:32,fontWeight:500,
          color:isDone?T.gold:isToday?T.gold:T2.text4,
          letterSpacing:"-1.5px",lineHeight:1,
          width:44,flexShrink:0,textAlign:"right",
        }}>{lesson.day}</div>
        {/* Hairline divider */}
        <div style={{width:1,height:32,background:T2.divider,flexShrink:0}}/>
        {/* Tag + title */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{
            fontSize:9,fontFamily:T.sans,fontWeight:500,
            color:isToday?T.gold:T2.text3,
            textTransform:"uppercase",letterSpacing:"2px",marginBottom:4,
          }}>{isComingSoon?"Coming Soon":lesson.tag}</div>
          <div style={{
            fontFamily:T.serif,fontSize:18,fontWeight:500,
            color:isDone?T2.text3:T2.text,
            letterSpacing:"-0.3px",lineHeight:1.2,
          }}>{lesson.title}</div>
          {lesson.subtitle && <div style={{fontFamily:T.sans,fontSize:11,color:T2.text4,marginTop:3,letterSpacing:"0.2px"}}>{lesson.subtitle}</div>}
        </div>
        {/* Status */}
        <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          {isToday && <div style={{fontSize:11,color:"rgba(255,255,255,0.9)",fontFamily:T.sans,fontWeight:500,background:T.gold,padding:"5px 12px",borderRadius:3}}>Today →</div>}
          {isDone && <div style={{fontSize:11,color:T.gold,fontFamily:T.sans,letterSpacing:"0.3px"}}>✓ Complete</div>}
          {!isDone && !isToday && <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke={T2.text4} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
      </div>
    );
  };

  if (isDesktop) {
    return (
      <div style={{ background: T2.bg, minHeight: "100vh" }} className="au-page">

        {/* ── Programme Hero — photo banner ── */}
        {/* REPLACES: <Scene name="structure" height={500}/> SVG illustration */}
        {/* TO REVERT: swap img back to <div className="au-hero-scene"><Scene name="structure" height={500}/></div> and restore overlays to rgba(10,8,5,0.55) / rgba(10,8,5,0.95) */}
        <div style={{
          position: "relative", height: 420, overflow: "hidden",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          paddingTop: NAV_H,
        }}>
          {/* Full-bleed photo */}
          <img
            src="/programme-hero.jpg"
            alt="Warm coaching lounge interior"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center 40%",
            }}
          />
          {/* Subtle dark veil — 35% so the image breathes */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,5,0.35)" }}/>
          {/* Bottom gradient — keeps text sharp without killing the image */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,8,5,0.75) 0%, rgba(10,8,5,0.2) 45%, transparent 100%)" }}/>

          {/* Text overlay */}
          <div style={{ position: "relative", zIndex: 2, padding: "0 88px 52px", animation: "fadeUp 0.7s ease both" }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "rgba(245,239,230,0.55)", fontFamily: T.sans,
              fontWeight: 500, marginBottom: 14,
            }}>14 Sessions — 6 Steps Each</div>
            <h1 style={{
              fontFamily: T.serif, fontSize: 72, fontWeight: 600,
              color: "#F5EFE6", letterSpacing: "-3px", lineHeight: 0.92,
              marginBottom: 20,
            }}>Your Programme</h1>
            {roleId && (() => { const r = ROLES.find(x => x.id === roleId); return r ? (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "7px 16px",
                background: "rgba(10,8,5,0.45)", backdropFilter: "blur(8px)",
                borderRadius: 40, border: "1px solid rgba(245,239,230,0.18)",
              }}>
                <span style={{ color: T.gold, fontSize: 13 }}>◆</span>
                <span style={{ fontSize: 12, color: "rgba(245,239,230,0.75)", fontFamily: T.sans, fontWeight: 400 }}>{r.label}</span>
              </div>
            ) : null; })()}
          </div>
        </div>

        {/* ── Editorial Programme List — NOT a card grid ── */}
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 88px 96px" }}>
          {[
            { id: 1, label: "Week One",  title: "Voice, Clarity & Structure",     sub: "The foundations of commanding communication." },
            { id: 2, label: "Week Two",  title: "Storytelling, Be your Brand & Own your Ambition",  sub: "Communicate with impact, presence, and purpose." },
          ].map((wk, wkIdx) => {
            const wkLessons = LESSONS.filter(l => l.week === wk.id);
            const doneCount = wkLessons.filter(l => done.includes(l.day)).length;
            return (
              <div key={wk.id} style={{ marginBottom: wkIdx === 0 ? 72 : 0 }}>

                {/* Week header — editorial */}
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, paddingBottom: 20, borderBottom: "1px solid " + T2.divider }}>
                  <div>
                    <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "4px", marginBottom: 10, fontFamily: T.sans }}>{wk.label}</div>
                    <h2 style={{ fontFamily: T.serif, fontSize: 32, fontWeight: 500, color: T2.text, letterSpacing: "-1px", lineHeight: 1.1 }}>{wk.title}</h2>
                    <p style={{ fontSize: 13, color: T2.text3, marginTop: 6, fontFamily: T.sans }}>{wk.sub}</p>
                  </div>
                  <div style={{ textAlign: "right", paddingBottom: 4 }}>
                    <div style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 500, color: T2.text, letterSpacing: "-1px", lineHeight: 1 }}>{doneCount}<span style={{ fontSize: 16, color: T2.text3 }}>/{wkLessons.length}</span></div>
                    <div style={{ fontSize: 9, color: T2.text3, textTransform: "uppercase", letterSpacing: "2px", marginTop: 4, fontFamily: T.sans }}>complete</div>
                  </div>
                </div>

                {/* Session rows — editorial list, not a grid */}
                <div>
                  {wkLessons.map((lesson, idx) => {
                    const isDone = done.includes(lesson.day);
                    const isToday = lesson.day === cur;
                    return (
                      <div key={lesson.day}
                        className="au-row"
                        onClick={() => onStart(lesson.day)}
                        style={{
                          display: "flex", alignItems: "center", gap: 32,
                          padding: "22px 20px 22px 0",
                          borderBottom: idx < wkLessons.length - 1 ? "1px solid " + T2.divider : "none",
                          cursor: "pointer",
                          background: "transparent", borderRadius: 0,
                        }}>
                        {/* Day number — large editorial type */}
                        <div style={{
                          fontFamily: T.serif, fontSize: 40, fontWeight: 500,
                          color: isDone ? T.green : isToday ? T.gold : T2.text4,
                          letterSpacing: "-2.5px", lineHeight: 1,
                          width: 56, flexShrink: 0, textAlign: "right",
                        }}>{lesson.day}</div>

                        {/* Hairline divider */}
                        <div style={{ width: 1, height: 36, background: T2.divider, flexShrink: 0 }}/>

                        {/* Content — title + tag */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 9, color: isToday ? T.gold : T2.text3,
                            textTransform: "uppercase", letterSpacing: "2.5px",
                            marginBottom: 5, fontFamily: T.sans,
                          }}>{lesson.tag}</div>
                          <div style={{
                            fontFamily: T.serif, fontSize: 22, fontWeight: 500,
                            color: isDone ? T2.text3 : T2.text,
                            letterSpacing: "-0.4px", lineHeight: 1.2,
                          }}>{lesson.title}</div>
                          {lesson.subtitle && <div style={{ fontFamily: T.sans, fontSize: 11, color: T2.text4, marginTop: 3, letterSpacing: "0.2px" }}>{lesson.subtitle}</div>}
                        </div>

                        {/* Module icon + status */}
                        <div style={{ display: "flex", alignItems: "center", gap: 24, flexShrink: 0 }}>
                          <div style={{ opacity: isDone ? 0.3 : 0.72 }}>
                            {MODULE_ICONS[lesson.day - 1]}
                          </div>
                          <div style={{ minWidth: 80, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                            {isToday && (
                              <div style={{
                                fontSize: 11, color: "rgba(255,255,255,0.9)", fontFamily: T.sans, fontWeight: 500,
                                background: T.gold, padding: "7px 16px", borderRadius: 4,
                                boxShadow: "0 2px 12px rgba(138,158,132,0.3)",
                              }}>Today →</div>
                            )}
                            {isDone && (
                              <div style={{ fontSize: 11, color: T.green, fontFamily: T.sans, letterSpacing: "0.5px" }}>✓ Complete</div>
                            )}
                            {!isDone && !isToday && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke={T2.text4} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* ── Practice Space — Coming Soon ── */}
          <div style={{ marginTop: 72, paddingTop: 48, borderTop: "1px solid " + T2.divider }}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "4px", marginBottom: 10, fontFamily: T.sans }}>Coming Soon</div>
              <h2 style={{ fontFamily: T.serif, fontSize: 32, fontWeight: 500, color: T2.text, letterSpacing: "-1px", lineHeight: 1.1 }}>Practice Space</h2>
              <p style={{ fontSize: 13, color: T2.text3, marginTop: 6, fontFamily: T.sans, fontWeight: 300 }}>A dedicated space to practise before your next presentation, meeting, or high-stakes conversation. Coming soon.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 32, padding: "22px 20px 22px 0", borderTop: "1px solid " + T2.divider }}>
              <div style={{ width: 56, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T2.text4} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <div style={{ width: 1, height: 36, background: T2.divider, flexShrink: 0 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: T2.text4, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: 5, fontFamily: T.sans }}>Practice Space</div>
                <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 500, color: T2.text3, letterSpacing: "-0.4px", lineHeight: 1.2 }}>Available soon — practise any time, on any topic</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, background: "rgba(138,158,132,0.1)", border: "1px solid rgba(138,158,132,0.3)", padding: "6px 14px", borderRadius: 20 }}>Coming Soon</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }


  return (
    <div style={{background:T2.bg,minHeight:"100vh",paddingBottom:100}}>
      <div style={{position:"relative",height:260,overflow:"hidden"}}>
        <img src="/programme-hero.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%",transition:"opacity 0.4s ease",opacity:0,}} onLoad={e=>e.currentTarget.style.opacity="1"}/>
        <div style={{position:"absolute",inset:0,background:"rgba(10,8,5,0.45)"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,8,5,0.85) 0%,transparent 60%)"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 24px"}}>
          <div style={{fontSize:10,fontWeight:400,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>14 Sessions — 6 steps each</div>
          <h1 style={{fontFamily:T.serif,fontSize:32,fontWeight:600,color:"white",letterSpacing:"-0.5px"}}>Your Programme</h1>
          {roleId && (()=>{const r=ROLES.find(x=>x.id===roleId);return r?(<div style={{marginTop:6,display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px",background:"rgba(138,158,132,0.15)",borderRadius:10,border:"1px solid rgba(138,158,132,0.25)"}}><span style={{color:T.gold,fontSize:11}}>{r.icon}</span><span style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.7)"}}>{r.label}</span></div>):null;})()}
        </div>
      </div>
      <div style={{padding:"24px 24px 0",display:"flex",flexDirection:"column",gap:48}}>
        {[
          {id:1,label:"Week One",  title:"Voice, Clarity & Structure",    sub:"The foundations of commanding communication."},
          {id:2,label:"Week Two",  title:"Storytelling, Be your Brand & Own your Ambition", sub:"Communicate with impact, presence, and purpose."},
        ].map(wk => {
          const lessons = LESSONS.filter(l=>l.week===wk.id);
          const doneCount = lessons.filter(l=>done.includes(l.day)).length;
          return (
            <div key={wk.id}>
              {/* Editorial week header */}
              <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24,paddingBottom:16,borderBottom:"1px solid "+T2.divider}}>
                <div>
                  <div style={{fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"4px",marginBottom:8,fontFamily:T.sans}}>{wk.label}</div>
                  <h2 style={{fontFamily:T.serif,fontSize:26,fontWeight:500,color:T2.text,letterSpacing:"-0.8px",lineHeight:1.1,margin:0}}>{wk.title}</h2>
                  <p style={{fontSize:12,color:T2.text3,marginTop:5,fontFamily:T.sans,fontWeight:300,margin:"6px 0 0"}}>{wk.sub}</p>
                </div>
                <div style={{textAlign:"right",paddingBottom:2,flexShrink:0,marginLeft:16}}>
                  <div style={{fontFamily:T.serif,fontSize:22,fontWeight:500,color:T2.text,letterSpacing:"-0.5px",lineHeight:1}}>{doneCount}<span style={{fontSize:13,color:T2.text3}}>/{lessons.length}</span></div>
                  <div style={{fontSize:9,color:T2.text3,textTransform:"uppercase",letterSpacing:"2px",marginTop:3,fontFamily:T.sans}}>complete</div>
                </div>
              </div>
              {/* Session rows */}
              {lessons.map(lesson => <DayCard key={lesson.day} lesson={lesson}/>)}
            </div>
          );
        })}

        {/* ── Practice Space — Coming Soon ── */}
        <div style={{ paddingTop: 32, borderTop: "1px solid " + T2.divider }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 8, fontFamily: T.sans }}>Coming Soon</div>
            <h2 style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 500, color: T2.text, letterSpacing: "-0.8px", lineHeight: 1.1, margin: 0 }}>Practice Space</h2>
            <p style={{ fontSize: 12, color: T2.text3, marginTop: 6, fontFamily: T.sans, fontWeight: 300 }}>A dedicated space to practise before your next presentation, meeting, or high-stakes conversation. Coming soon.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 0", borderTop: "0.5px solid " + T2.divider }}>
            <div style={{ width: 44, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T2.text4} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <div style={{ width: 1, height: 32, background: T2.divider, flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontFamily: T.sans, fontWeight: 500, color: T2.text4, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Practice Space</div>
              <div style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 500, color: T2.text3, letterSpacing: "-0.3px", lineHeight: 1.2 }}>Available soon — practise any time, on any topic</div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: T.gold, background: "rgba(138,158,132,0.1)", border: "0.5px solid rgba(138,158,132,0.3)", padding: "5px 10px", borderRadius: 20 }}>Coming Soon</span>
            </div>
          </div>
        </div>

      </div>

      {/* Locked lesson preview bottom sheet */}
      {lockedPreview && (
        <div
          
style={{position:"fixed",inset:0,zIndex:200,background:"rgba(11,13,16,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={()=>setLockedPreview(null)}
        >
          <div
            onClick={e=>e.stopPropagation()}
            
style={{width:"100%",maxWidth:430,background:T2.surface,borderRadius:"28px 28px 0 0",overflow:"hidden",animation:"slideUp 0.32s cubic-bezier(0.22,1,0.36,1)"}}
          >
            {/* Gold top rule */}
            <div 
style={{height:2,background:"linear-gradient(90deg,"+T.gold+",rgba(138,158,132,0.2))"}}/>
            {/* Drag handle */}
            <div 
style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}>
              <div 
style={{width:36,height:3,borderRadius:2,background:T.border}}/>
            </div>
            <div style={{padding:"20px 24px 40px",display:"flex",flexDirection:"column",gap:16}}>
              {/* Header row */}
              <div 
style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                <div style={{flex:1}}>
                  <div 
style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div 
style={{width:28,height:28,borderRadius:8,background:T2.navyLight,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="13" height="13" viewBox="0 0 14 14" 
fill="none"><rect x="3" y="6" width="8" height="6" rx="1" stroke={T.navy} 
strokeWidth="1.4"/><path d="M5 6V4a2 2 0 014 0v2" stroke={T.navy} 
strokeWidth="1.4"/></svg>
                    </div>
                    <span 
style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:1.5}}>Day 
{lockedPreview.day} — Coming up</span>
                  </div>
                  <h2 
style={{fontFamily:T.serif,fontSize:24,fontWeight:700,color:T2.text,lineHeight:1.2,margin:0}}>{lockedPreview.title}</h2>
                </div>
                <span 
style={{fontSize:9,fontWeight:700,color:T.navy,background:T2.navyLight,padding:"4px 10px",borderRadius:10,whiteSpace:"nowrap",marginTop:4}}>{lockedPreview.tag}</span>
              </div>

              {/* Teaser */}
              <div 
style={{background:T2.card,borderRadius:12,padding:"16px 18px",borderLeft:"3px solid "+T.gold}}>
                <p 
style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>{lockedPreview.teaser}</p>
              </div>

              {/* What's inside */}
              <div>
                <div 
style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>What's 
inside</div>
                {[
                  "An insight grounded in real science",
                  "The theory framework behind the skill",
                  "Examples of weak vs strong language",
                  "A timed practice exercise",
                  "A role-tailored simulation scenario",
                ].map((item,i) => (
                  <div key={i} 
style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<4?8:0}}>
                    <div 
style={{width:5,height:5,borderRadius:"50%",background:T.gold,flexShrink:0}}/>
                    <span 
style={{fontSize:13,color:T2.text3,lineHeight:1.4}}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Unlock message */}
              <div style={{background:T.navy,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                <svg width="18" height="18" viewBox="0 0 18 18" 
fill="none"><circle cx="9" cy="9" r="8" stroke={T.gold} 
strokeWidth="1.2"/><path d="M9 5v5l3 2" stroke={T.gold} strokeWidth="1.2" 
strokeLinecap="round"/></svg>
                <p 
style={{fontSize:12,color:"rgba(255,255,255,0.65)",lineHeight:1.5,margin:0}}>
                  Complete Day {lockedPreview.day - 1} to unlock this 
session. Keep going — you're building something that lasts.
                </p>
              </div>

              <button
                onClick={()=>setLockedPreview(null)}
                
style={{width:"100%",padding:"15px",borderRadius:12,border:"1px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:14,fontWeight:500,cursor:"pointer"}}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS SCREEN 
