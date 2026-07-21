import { useState, useEffect } from 'react';
import { T } from '../theme.js';
import { LESSONS, QUOTES, DAILY_INSIGHTS, POWER_PHRASES, FURTHER_READING } from '../data.js';
import { MODULE_ICONS } from '../diagrams.jsx';
import { PBar, NAV_H } from '../components/NavComponents.jsx';
import { Scene } from '../scenes.jsx';
import { HourglassIcon } from '../components/HourglassIcon.jsx';
import { PhraseStrip } from '../components/PhraseStrip.jsx';
import { PIECES, getPieceInfo, getCategoryProgress } from '../utils.js';

function JourneyCard({ pieceInfo, catProgress, done, T, mobile=false }) {
  return (
    <div style={{ background:"#17140f", borderRadius:12, padding:"18px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:mobile?10:16 }}>
        <div style={{ width:36, height:36, borderRadius:"50%", background:"#0d0b08", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <i className="ti ti-calendar-month" style={{ fontSize:18, color:"#ffffff" }}/>
        </div>
        <span style={{ fontSize:11, letterSpacing:"0.15em", color:"#c9a961", fontWeight:500, fontFamily:T.sans }}>YOUR JOURNEY</span>
      </div>
      {mobile && (
        <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ position:"absolute", top:"50%", left:"5%", right:"5%", height:1, background:"rgba(255,255,255,0.1)", transform:"translateY(-50%)", zIndex:0 }}/>
          {PIECES.map((piece,i) => {
            const isCurrent = i === pieceInfo.currentIndex;
            const isNext = i === pieceInfo.currentIndex + 1;
            return (
              <div key={piece.name} style={{ position:"relative", zIndex:1 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:isCurrent?"#c9a961":isNext?"#252015":"#231f18", border:isCurrent?"none":isNext?"1.5px solid #c9a961":"1.5px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <i className={"ti "+piece.icon} style={{ fontSize:10, color:isCurrent?"#17140f":isNext?"#c9a961":"rgba(255,255,255,0.2)" }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {pieceInfo.next ? (
        <div style={{ borderTop:"0.5px solid #3a352a", paddingTop:14, marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:3 }}>
            <span style={{ fontFamily:T.serif, fontSize:mobile?18:26, color:"#f4f1ea" }}>{pieceInfo.daysUntil} {pieceInfo.daysUntil===1?"day":"days"}</span>
            <i className={"ti "+pieceInfo.next.icon} style={{ fontSize:20, color:"#c9a961" }}/>
          </div>
          <p style={{ fontSize:12, color:"#9c9384", margin:0 }}>until you reach {pieceInfo.next.name}{done.length<6?" — your next rank":""}</p>
        </div>
      ) : (
        <div style={{ borderTop:"0.5px solid #3a352a", paddingTop:14, marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:3 }}>
            <span style={{ fontFamily:T.serif, fontSize:mobile?18:26, color:"#c9a961" }}>{pieceInfo.current.name}</span>
            <i className={"ti "+pieceInfo.current.icon} style={{ fontSize:20, color:"#c9a961" }}/>
          </div>
          <p style={{ fontSize:12, color:"#9c9384", margin:0 }}>{"You've reached the highest rank"}</p>
        </div>
      )}
      <div style={{ borderTop:"0.5px solid #3a352a", paddingTop:14 }}>
        <p style={{ fontSize:11, letterSpacing:"0.1em", color:"#9c9384", margin:"0 0 8px", fontFamily:T.sans }}>STRONGEST SO FAR</p>
        {catProgress.map((cat,i) => (
          <div key={cat.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:i<catProgress.length-1?6:0 }}>
            <span style={{ fontSize:12, color:i===0?"#f4f1ea":"#9c9384", width:118, flexShrink:0, fontFamily:T.sans }}>{cat.label}</span>
            <div style={{ flex:1, height:3, background:"#2a251c", borderRadius:2, overflow:"hidden" }}>
              <div style={{ width:cat.pct+"%", height:"100%", background:i===0?"#c9a961":"#5f5a4c" }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeScreen({done, cur, streak, onStart, roleId, activeRole,
dark=false, DK={}, showNudge=false, onDismissNudge, isDesktop=false}) {
  const T2 = Object.assign({}, T, DK);
  const [selectedDay, setSelectedDay] = useState(cur);
  const [showAffordance, setShowAffordance] = useState(
    () => { try { return !sessionStorage.getItem("au1_scrolled"); } catch { return true; } }
  );
  useEffect(() => {
    if (!showAffordance) return;
    const hide = () => { setShowAffordance(false); try { sessionStorage.setItem("au1_scrolled","1"); } catch {} };
    window.addEventListener("scroll", hide, { once: true, passive: true });
    return () => window.removeEventListener("scroll", hide);
  }, [showAffordance]);
  const selectedLesson = selectedDay ? LESSONS.find(l => l.day === selectedDay) : null;
  const pct = Math.round((done.length/14)*100);
  const lesson = LESSONS[Math.min(cur-1,13)];
  const todayDone = done.includes(cur);
  const finished = done.length===14;
  const today = new 
Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";

  // Calculate finish date based on remaining sessions and current streak 
// pace
  const remaining = 14 - done.length;
  const finishDate = (() => {
    if (finished) return null;
    if (remaining === 0) return null;
    // 14-day programme — always 1 session per day
    const d = new Date();
    d.setDate(d.getDate() + remaining);
    return d.toLocaleDateString("en-GB", {day:"numeric", month:"long"});
  })();
  const onTrackMsg = (() => {
    if (finished) return null;
    if (streak >= 5) return "At this pace, you\'ll finish by " + 
finishDate + ".";
    if (streak >= 2) return "Keep going — on track to finish by " + 
finishDate + ".";
    if (done.length === 0) return "One session a day gets you there by " + 
finishDate + ".";
    return "One session a day and you\'ll finish by " + finishDate + ".";
  })();
  const quote = QUOTES[cur%QUOTES.length];
  const insight = { label: lesson.tag, headline: lesson.quote, body: lesson.teaser };
  const pieceInfo = getPieceInfo(done.length);
  const catProgress = getCategoryProgress(done);
  // ── shared blocks used in both layouts ──────────────────────────────────
  const storedAmbition = (() => { try { return localStorage.getItem("au1_ambition") || ""; } catch { return ""; } })();
  const InsightCard = () => (
    <div style={{background:T2.cardDark,borderRadius:isDesktop?8:2,padding:isDesktop?"24px 28px":"22px 24px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:10,right:18,fontSize:72,lineHeight:1,color:"rgba(255,255,255,0.04)",fontFamily:T.serif}}>"</div>
      <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>{insight.label}</div>
      <p style={{fontFamily:T.serif,fontSize:isDesktop?18:17,fontWeight:600,color:"rgba(255,255,255,0.92)",lineHeight:1.4,marginBottom:8}}>{insight.headline}</p>
      <p style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.65,margin:0}}>{insight.body}</p>
    </div>
  );
  const SessionCard = () => finished ? (
    <div style={{background:T2.cardDark,borderRadius:isDesktop?8:24,padding:"40px 28px",textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>done</div>
      <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:700,color:"white",marginBottom:12}}>Programme Complete</h2>
      <p style={{fontSize:15,color:"rgba(255,255,255,0.6)",lineHeight:1.6,fontStyle:"italic"}}>You now communicate with clarity, structure, and impact.</p>
    </div>
  ) : (
    <>
      <div onClick={()=>onStart(cur)} style={{borderRadius:isDesktop?8:24,overflow:"hidden",position:"relative",cursor:"pointer"}}>
        <Scene name={lesson ? lesson.scene : "clarity"} height={isDesktop?320:280} day={lesson ? lesson.day : null}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"24px",background:"linear-gradient(to top,rgba(11,13,16,0.85) 0%,transparent 100%)"}}>
          <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.55)",textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>Day {cur} — {lesson ? lesson.tag : ""}</div>
          <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:26,fontWeight:700,color:"white",lineHeight:1.2,marginBottom:14}}>{lesson ? lesson.title : ""}</h2>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.6)"}}>~15 min · 6 steps</span>
            <div style={{display:"flex",alignItems:"center",gap:8,background:T.gold,borderRadius:6,padding:"8px 16px"}}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 2l9 5-9 5V2z" fill="white"/></svg>
              <span style={{fontSize:12,fontWeight:700,color:"white"}}>Start session</span>
            </div>
          </div>
        </div>
      </div>
      {todayDone && <div style={{marginTop:10,padding:"12px 16px",borderRadius:6,background:T2.greenBg,border:"1px solid rgba(42,94,63,0.3)",color:T.green,fontSize:13,fontWeight:500}}>Session complete today — well done.</div>}
    </>
  );
  const ProgressCard = () => (
    <div style={{background:T2.surface,borderRadius:isDesktop?8:2,padding:isDesktop?"20px 24px":"18px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h3 style={{fontSize:12,fontWeight:600,color:T2.text3,textTransform:"uppercase",letterSpacing:1.2,margin:0}}>Progress</h3>
        <span style={{fontSize:22,fontWeight:700,color:T.navy,fontFamily:T.serif}}>{pct}%</span>
      </div>
      <PBar pct={pct} h={3}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,marginBottom:onTrackMsg?10:0}}>
        <span style={{fontSize:12,color:T2.text3}}>{done.length} of 14 sessions</span>
        <span style={{fontSize:12,color:T2.text3}}>Day {cur} of 14</span>
      </div>
      {onTrackMsg && (
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:streak>=2?"rgba(42,94,63,0.08)":"rgba(138,158,132,0.08)",borderRadius:6,borderLeft:"2px solid "+(streak>=2?T.green:T.gold)}}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={streak>=2?T.green:T.gold} strokeWidth="1.1"/><path d="M4 7.5l2 2 4-4" stroke={streak>=2?T.green:T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontSize:12,color:streak>=2?T.green:T.goldDark,fontWeight:500,lineHeight:1.4}}>{onTrackMsg}</span>
        </div>
      )}
    </div>
  );
  const QuoteBlock = () => storedAmbition && cur >= 5 ? (
    <div style={{background:dark?"rgba(183,154,107,0.07)":"rgba(138,158,132,0.08)",borderRadius:8,padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
      <div style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Your ambition</div>
      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text2,lineHeight:1.6,margin:0}}>"In the next 18 months, I want to be {storedAmbition}"</p>
    </div>
  ) : (
    <div style={{borderLeft:"2px solid "+T.gold,paddingLeft:18}}>
      <p style={{fontFamily:T.serif,fontSize:isDesktop?15:16,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>{quote}</p>
    </div>
  );
  const PIECards = () => (
    <div>
      <div style={{fontSize:10,fontWeight:600,color:T2.text3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>The PIE Framework</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[{l:"P",t:"Performance",sub:"10%",desc:"Do great work and communicate it clearly."},{l:"I",t:"Image",sub:"30%",desc:"How you show up in every room."},{l:"E",t:"Exposure",sub:"60%",desc:"Be visible to the right people."}].map(p => (
          <div key={p.l} style={{background:T2.surface,borderRadius:8,padding:"14px 12px",border:"1px solid "+T2.border}}>
            <div style={{fontFamily:T.serif,fontSize:26,fontWeight:700,color:T.navy,lineHeight:1,marginBottom:4}}>{p.l}</div>
            <div style={{fontSize:11,fontWeight:700,color:T2.text,marginBottom:1}}>{p.t}</div>
            <div style={{fontSize:10,color:T.gold,marginBottom:5,fontWeight:600}}>{p.sub}</div>
            <div style={{fontSize:10,color:T2.text3,lineHeight:1.4}}>{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
  const NudgeBanner = () => showNudge && (
    <div style={{background:"linear-gradient(135deg,"+T.navy+" 0%,#1E2D45 100%)",borderBottom:"1px solid rgba(138,158,132,0.2)",padding:"12px 20px",display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:34,height:34,borderRadius:8,flexShrink:0,background:"rgba(138,158,132,0.15)",border:"1px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke={T.gold} strokeWidth="1.2"/><path d="M8 5v4M8 11v.5" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.92)",marginBottom:1}}>Your session is waiting.</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>15 minutes today keeps the streak alive.</div>
      </div>
      <div style={{display:"flex",gap:8,flexShrink:0}}>
        <button onClick={()=>onStart(cur)} style={{padding:"7px 14px",borderRadius:6,border:"none",background:T.gold,color:"white",fontSize:11,fontWeight:700,cursor:"pointer"}}>Start →</button>
        <button onClick={onDismissNudge} style={{padding:"7px 10px",borderRadius:6,border:"none",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.4)",fontSize:12,cursor:"pointer",lineHeight:1}}>✕</button>
      </div>
    </div>
  );

  // ── CINEMATIC DESKTOP LAYOUT — "The Chamber" ────────────────────────────
  // Architecture: Full-viewport hero → Editorial scroll sections
  // No sidebar. No cards. No dashboard. One environment. One focus.
  if (isDesktop) {
    return (
      <div style={{ background: T2.bg, minHeight: "100vh" }} className="au-page">

        {/* ════════════════════════════════════════════════════════════════
            SECTION 1: CINEMATIC HERO — Full viewport. One story. One CTA.
            ════════════════════════════════════════════════════════════════ */}
        {/* Hero — full-width, natural height so chess pieces show complete */}
        <div style={{ marginTop: NAV_H, background: "#0a0805", position: "relative", overflow: "hidden" }}>
          <style>{`@keyframes heroFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }`}</style>
          <img src="/home-hero-8.jpg" alt="The Six Pillars of Communication Mastery" style={{ width: "100%", height: "auto", display: "block" }}/>
          {/* Begin Session button — overlaid on hero */}
          <button
            onClick={() => onStart(finished ? 1 : cur)}
            style={{
              position: "absolute", bottom: "7%", right: "4%",
              background: "rgba(185,168,140,0.60)",
              color: "#1a1510",
              border: "1px solid rgba(200,185,160,0.35)",
              borderRadius: 6,
              padding: "17px 37px",
              fontSize: 19, fontWeight: 500, fontFamily: T.sans,
              letterSpacing: "0.02em",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              animation: "heroFloat 3s ease-in-out infinite",
              transition: "background 0.2s ease, opacity 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(205,190,165,0.88)"; e.currentTarget.style.animationPlayState = "paused"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(185,168,140,0.60)"; e.currentTarget.style.animationPlayState = "running"; }}>
            {finished ? "Revisit Day 1 →" : todayDone ? "Review Session →" : "Begin Session →"}
          </button>
        </div>

        {/* ── Two-column: Today's session (left) + YOUR JOURNEY card (right) ── */}
        <div style={{ background: T2.bg, borderBottom: "1px solid " + T2.divider }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 88px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 52, alignItems: "end" }}>

            {/* Left: today's session */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#c9a96e", fontFamily: T.sans, marginBottom: 18 }}>
                {finished ? "Programme Complete" : `Day ${cur} · ${lesson?.tag ?? ""}`}
              </div>
              <h2 style={{ fontFamily: T.serif, fontSize: 42, fontWeight: 500, color: T2.text, letterSpacing: "-1.5px", lineHeight: 1.1, maxWidth: 600, marginBottom: 18 }}>
                {finished ? "You communicate differently now." : insight.headline}
              </h2>
              <p style={{ fontSize: 15, color: T2.text3, lineHeight: 1.8, maxWidth: 500, fontFamily: T.sans, fontWeight: 300, marginBottom: 24 }}>
                {insight.body}
              </p>
              {done.length === 0 ? (
                <div>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:0, marginBottom:20 }}>
                    {[
                      {icon:"ti-notes", label:"Learn"},
                      {icon:"ti-user-circle", label:"Practice"},
                      {icon:"ti-brain", label:"AI Feedback"},
                      {icon:"ti-trending-up", label:"Improve"},
                    ].map((step, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center" }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>
                          <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(44,36,22,0.06)", border:"0.5px solid rgba(44,36,22,0.14)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <i className={"ti "+step.icon} style={{ fontSize:18, color:T2.text3 }}/>
                          </div>
                          <span style={{ fontFamily:T.sans, fontSize:11, color:T2.text3, whiteSpace:"nowrap" }}>{step.label}</span>
                        </div>
                        {i < 3 && <span style={{ color:"rgba(44,36,22,0.25)", fontSize:13, margin:"0 10px", paddingBottom:18 }}>&#8594;</span>}
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {["14 sessions", "6 steps each", "Persona-based", "Science-backed"].map((pill, i) => (
                      <span key={i} style={{ padding:"5px 13px", borderRadius:20, border:"0.5px solid rgba(44,36,22,0.18)", background:"rgba(44,36,22,0.05)", fontFamily:T.sans, fontSize:12, fontWeight:500, color:T2.text3 }}>{pill}</span>
                    ))}
                  </div>
                </div>
              ) : (() => {
                const lastDone = Math.max(...done);
                const lastLesson = LESSONS[lastDone - 1];
                return lastLesson && lastLesson.recap ? (
                  <div style={{ borderLeft:"2px solid rgba(201,169,110,0.4)", paddingLeft:16 }}>
                    <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:600, color:"#c9a96e", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8 }}>
                      {"DAY " + lastDone + " - RECAP"}
                    </div>
                    <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, lineHeight:1.75, margin:0 }}>
                      {lastLesson.recap}
                    </p>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Right: YOUR JOURNEY card */}
            <JourneyCard pieceInfo={pieceInfo} catProgress={catProgress} done={done} T={T} mobile={true} />

          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2: ALL SESSIONS
            ════════════════════════════════════════════════════════════════ */}
        <div style={{ background: T2.bg, position: "relative" }}>

          {/* ── All Sessions ── */}
          <section style={{ padding: "36px 88px 56px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 500, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", fontFamily: T.sans, marginBottom: 10 }}>All Sessions</div>
            <div style={{ width: 20, height: 1, background: T.gold, opacity: 0.5, marginBottom: 24 }}/>
            <div>
              <div>
                <div style={{ background: T2.surface, borderRadius: 10, border: "0.5px solid " + T2.border, padding: "24px 28px" }}>
                  {/* Day number picker */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: selectedLesson ? 16 : 0 }}>
                    {LESSONS.map(l => {
                      const isDone = done.includes(l.day), isToday = l.day === cur, isSel = selectedDay === l.day;
                      return (
                        <button key={l.day} onClick={() => setSelectedDay(isSel ? null : l.day)}
                          style={{ width: 40, height: 40, borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                            background: isSel ? T2.text : isDone ? "rgba(138,158,132,0.12)" : isToday ? "rgba(138,158,132,0.06)" : T2.bg,
                            border: `0.5px solid ${isSel ? T2.text : isDone ? "rgba(138,158,132,0.4)" : isToday ? T.gold : T2.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isDone && !isSel
                            ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round"/></svg>
                            : <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, color: isSel ? T2.bg : isToday ? T.gold : T2.text3 }}>{l.day}</span>}
                        </button>
                      );
                    })}
                  </div>
                  {/* Expanded day detail */}
                  {selectedLesson && (
                    <div style={{ borderTop: "0.5px solid " + T2.divider, paddingTop: 18, animation: "fadeUp 0.2s ease both" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 6 }}>
                            Day {selectedLesson.day} · {selectedLesson.tag}
                          </div>
                          <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T2.text, lineHeight: 1.2 }}>{selectedLesson.title}</div>
                        </div>
                        <button onClick={() => setSelectedDay(null)} style={{ background: "none", border: "none", color: T2.text3, fontSize: 20, cursor: "pointer", padding: "0 0 0 16px", lineHeight: 1 }}>×</button>
                      </div>
                      <p style={{ fontFamily: T.sans, fontSize: 14, color: T2.text3, lineHeight: 1.7, margin: "0 0 10px", fontWeight: 300 }}>{selectedLesson.insight}</p>
                      {selectedLesson.promise && <p style={{ fontFamily: T.serif, fontSize: 15, fontStyle: "italic", color: T.gold, lineHeight: 1.55, margin: "0 0 14px" }}>{selectedLesson.promise}</p>}
                      <button onClick={() => { setSelectedDay(null); onStart(selectedLesson.day); }} style={{ background: T.ink, color: T.bg, border: "none", borderRadius: 4, padding: "10px 16px", fontSize: 13, fontWeight: 500, fontFamily: T.sans, cursor: "pointer" }}>
                        {done.includes(selectedLesson.day) ? "Review →" : "Begin →"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>

      </div>
    );
  }

  // ── MOBILE LAYOUT ────────────────────────────────────────────────────────
  const STRIP_H = 36;
  return (
    <div style={{background:T2.bg,minHeight:"100vh"}} className="au-page">

      {/* ── Fixed header ── */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:NAV_H,background:"#0F0D0A",borderBottom:"0.5px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src="/logo-mark.png" alt="AmplifyU" style={{width:30,height:30,objectFit:"cover",mixBlendMode:"screen",filter:"brightness(3) contrast(1.2)"}}/>
          <span style={{fontFamily:T.sans,fontSize:11,fontWeight:600,letterSpacing:"3px",textTransform:"uppercase",color:"rgba(255,255,255,0.88)"}}>AmplifyU</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:64,height:1,background:"rgba(255,255,255,0.1)",borderRadius:1,overflow:"hidden"}}>
            <div style={{width:pct+"%",height:"100%",background:"linear-gradient(90deg,#b8956a,#c9a96e)",borderRadius:1,transition:"width 1s ease"}}/>
          </div>
          <span style={{fontSize:10,color:"#c9a96e",fontWeight:500,fontFamily:T.sans}}>{pct}%</span>
        </div>
      </div>

      {/* ── Rank strip — fixed directly under header ── */}
      <div style={{position:"fixed",top:NAV_H,left:0,right:0,zIndex:199,height:STRIP_H,background:"#1A1710",borderBottom:"0.5px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",padding:"0 20px",gap:8,overflow:"hidden"}}>
        <i className={"ti "+pieceInfo.current.icon} style={{fontSize:14,color:"#c9a961",flexShrink:0}}/>
        <span style={{fontFamily:T.sans,fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.75)",whiteSpace:"nowrap",flexShrink:0}}>{pieceInfo.current.name}</span>
        {pieceInfo.next&&<span style={{fontFamily:T.sans,fontSize:11,color:"rgba(255,255,255,0.35)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0}}>· {pieceInfo.daysUntil} {pieceInfo.daysUntil===1?"day":"days"} to {pieceInfo.next.name}</span>}
        <span style={{marginLeft:"auto",fontFamily:T.sans,fontSize:11,fontWeight:500,color:"#c9a961",cursor:"pointer",flexShrink:0,padding:"4px 0 4px 12px"}} onClick={()=>document.getElementById("journey-section")?.scrollIntoView({behavior:"smooth"})}>Journey ›</span>
      </div>

      {/* ── Hero image — vh-capped ── */}
      <div style={{marginTop:NAV_H+STRIP_H,background:"#0a0805",height:"clamp(160px,22vh,200px)",overflow:"hidden",position:"relative"}}>
        <img src="/home-hero-mobile.jpg" alt="The Six Pillars of Communication Mastery" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block"}}/>
      </div>

      {/* ── CTA bar — tightened ── */}
      <div style={{background:T2.bg,borderBottom:"1px solid rgba(138,158,132,0.15)"}}>
        <div style={{padding:"16px 24px 20px",display:"flex",flexDirection:"column",alignItems:"stretch",gap:12}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"2px",color:T.gold,marginBottom:5}}>
              {finished?"Programme Complete":`Day ${cur} — ${lesson?.tag??""}${todayDone?"  ✓":""}`}
            </div>
            <div style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:T.ink,lineHeight:1.2}}>
              {finished?"You communicate differently now.":lesson?.title}
            </div>
          </div>
          <button onClick={()=>onStart(finished?1:cur)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",background:T.ink,color:T.bg,border:"none",borderRadius:6,padding:"14px 24px",fontSize:14,fontWeight:600,fontFamily:T.sans,cursor:"pointer",transition:"all 0.25s ease"}}>
            {finished?"Revisit Day 1":todayDone?"Review Session":"Begin Session"} →
          </button>
          {/* Scroll affordance */}
          {showAffordance&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,paddingTop:4,paddingBottom:2}}>
              <style>{`@keyframes bounceDown{0%,100%{transform:translateY(0);opacity:0.6}50%{transform:translateY(5px);opacity:1}}`}</style>
              <span style={{fontFamily:T.sans,fontSize:10,letterSpacing:"2.5px",color:"#8A9E84",textTransform:"uppercase",fontWeight:500}}>Your Journey</span>
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{animation:"bounceDown 1.6s ease infinite"}}>
                <path d="M1 1.5l7 7 7-7" stroke="#8A9E84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 2: Journey (moved up) ── */}
      <section id="journey-section" style={{padding:"32px 24px 40px",borderBottom:"1px solid "+T2.divider,background:T2.bg}}>
        <div style={{fontSize:9,fontWeight:500,color:T.gold,textTransform:"uppercase",letterSpacing:"3px",fontFamily:T.sans,marginBottom:10}}>Journey</div>
        <div style={{width:20,height:1,background:T.gold,marginBottom:24,opacity:0.5}}/>
        <JourneyCard pieceInfo={pieceInfo} catProgress={catProgress} done={done} T={T} mobile={true} />
      </section>

      {/* ── SECTION 3: All Sessions ── */}
      <section style={{padding:"32px 24px 48px",borderBottom:"1px solid "+T2.divider,background:T2.bg}}>
        <div style={{fontSize:9,fontWeight:500,color:T.gold,textTransform:"uppercase",letterSpacing:"3px",fontFamily:T.sans,marginBottom:10}}>All Sessions</div>
        <div style={{width:20,height:1,background:T.gold,marginBottom:24,opacity:0.5}}/>
        <div style={{background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:"18px 16px"}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:selectedLesson?16:0}}>
            {LESSONS.map(l=>{
              const isDone=done.includes(l.day), isToday=l.day===cur, isSel=selectedDay===l.day;
              return (
                <button key={l.day} onClick={()=>setSelectedDay(isSel?null:l.day)}
                  style={{width:38,height:38,borderRadius:8,cursor:"pointer",transition:"all 0.15s",
                    background:isSel?T2.text:isDone?"rgba(138,158,132,0.12)":isToday?"rgba(138,158,132,0.06)":T2.bg,
                    border:`0.5px solid ${isSel?T2.text:isDone?"rgba(138,158,132,0.4)":isToday?T.gold:T2.border}`,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {isDone&&!isSel
                    ?<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round"/></svg>
                    :<span style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:isSel?T2.bg:isToday?T.gold:T2.text3}}>{l.day}</span>}
                </button>
              );
            })}
          </div>
          {selectedLesson&&(
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:16,animation:"fadeUp 0.2s ease both"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>
                    Day {selectedLesson.day} · {selectedLesson.tag}
                  </div>
                  <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T2.text,lineHeight:1.2}}>{selectedLesson.title}</div>
                </div>
                <button onClick={()=>setSelectedDay(null)} style={{background:"none",border:"none",color:T2.text3,fontSize:20,cursor:"pointer",padding:"0 0 0 12px",lineHeight:1}}>×</button>
              </div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,margin:"0 0 8px",fontWeight:300}}>{selectedLesson.insight}</p>
              {selectedLesson.promise&&<p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T.gold,lineHeight:1.55,margin:"0 0 14px"}}>{selectedLesson.promise}</p>}
              <button onClick={()=>{setSelectedDay(null);onStart(selectedLesson.day);}} style={{width:"100%",background:T.ink,color:T.bg,border:"none",borderRadius:4,padding:"10px 16px",fontSize:13,fontWeight:500,fontFamily:T.sans,cursor:"pointer",textAlign:"left"}}>
                {done.includes(selectedLesson.day)?"Review →":"Begin →"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 4: Today's Focus (moved to bottom) ── */}
      <section style={{padding:"32px 24px 56px",background:T2.bg}}>
        <div style={{fontSize:9,fontWeight:500,color:T.gold,textTransform:"uppercase",letterSpacing:"3px",fontFamily:T.sans,marginBottom:10}}>Today's Focus</div>
        <div style={{width:20,height:1,background:T.gold,marginBottom:24,opacity:0.5}}/>
        <div style={{fontSize:10,fontWeight:500,color:T2.text3,textTransform:"uppercase",letterSpacing:"3px",marginBottom:14,fontFamily:T.sans}}>{insight.label}</div>
        <h2 style={{fontFamily:T.serif,fontSize:"clamp(26px,7vw,36px)",fontWeight:500,color:T2.text,letterSpacing:"-1px",lineHeight:1.15,marginBottom:16}}>{insight.headline}</h2>
        <p style={{fontSize:15,color:T2.text3,lineHeight:1.8,fontFamily:T.sans,fontWeight:300}}>{insight.body}</p>
      </section>

    </div>
  );
}

// ─── SESSIONS SCREEN 
