import { useState, useEffect } from 'react';
import { T } from '../theme.js';
import { LESSONS, QUOTES, DAILY_INSIGHTS, POWER_PHRASES, FURTHER_READING } from '../data.js';
import { MODULE_ICONS } from '../diagrams.jsx';
import { PBar, NAV_H } from '../components/NavComponents.jsx';
import { Scene } from '../scenes.jsx';
import { HourglassIcon } from '../components/HourglassIcon.jsx';
import { PhraseStrip } from '../components/PhraseStrip.jsx';

export function HomeScreen({done, cur, streak, onStart, roleId, activeRole,
dark=false, DK={}, showNudge=false, onDismissNudge, isDesktop=false}) {
  const T2 = Object.assign({}, T, DK);
  const [selectedDay, setSelectedDay] = useState(1);
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
          <img src="/home-hero-8.png" alt="The Six Pillars of Communication Mastery" style={{ width: "100%", height: "auto", display: "block" }}/>
          {/* Begin Session button — overlaid under the King piece (Verbal Mastery) */}
          <button
            onClick={() => onStart(finished ? 1 : cur)}
            style={{
              position: "absolute", bottom: "7%", right: "4%",
              background: "rgba(148,112,58,0.88)",
              color: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(180,140,75,0.4)",
              borderRadius: 6,
              padding: "17px 37px",
              fontSize: 19, fontWeight: 500, fontFamily: T.sans,
              letterSpacing: "0.02em",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,130,70,0.95)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,112,58,0.88)"; e.currentTarget.style.transform = "none"; }}>
            {finished ? "Revisit Day 1 →" : todayDone ? "Review Session →" : "Begin Session →"}
          </button>
        </div>

        {/* ── Two-column: Today's session (left) + YOUR JOURNEY card (right) ── */}
        <div style={{ background: T2.bg, borderBottom: "1px solid " + T2.divider }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "56px 88px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 64, alignItems: "start" }}>

            {/* Left: today's session */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#c9a96e", fontFamily: T.sans, marginBottom: 18 }}>
                {finished ? "Programme Complete" : `Day ${cur} · ${lesson?.tag ?? ""}`}
              </div>
              <h2 style={{ fontFamily: T.serif, fontSize: 42, fontWeight: 500, color: T2.text, letterSpacing: "-1.5px", lineHeight: 1.1, maxWidth: 600, marginBottom: 18 }}>
                {finished ? "You communicate differently now." : insight.headline}
              </h2>
              <p style={{ fontSize: 15, color: T2.text3, lineHeight: 1.8, maxWidth: 500, fontFamily: T.sans, fontWeight: 300, marginBottom: 32 }}>
                {insight.body}
              </p>
              <button onClick={() => onStart(finished ? 1 : cur)}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, background: T.ink, color: T.bg, border: "none", borderRadius: 8, padding: "17px 40px", fontSize: 15, fontWeight: 600, fontFamily: T.sans, cursor: "pointer", transition: "all 0.25s ease", boxShadow: "0 2px 8px rgba(44,36,22,0.1)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#c9a96e"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.ink; e.currentTarget.style.transform = "none"; }}>
                {finished ? "Revisit Day 1" : todayDone ? "Review Session" : "Begin Session"} →
              </button>
            </div>

            {/* Right: YOUR JOURNEY card */}
            <div style={{ background: "#1a1714", borderRadius: 14, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "22px 26px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#111009", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                    {/* Calendar outline */}
                    <rect x="2" y="3.5" width="18" height="15" rx="2" stroke="white" strokeWidth="1.2"/>
                    {/* Header bar */}
                    <path d="M2 8h18" stroke="white" strokeWidth="1.2"/>
                    {/* Hanging tabs */}
                    <path d="M7 1.5v4M15 1.5v4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                    {/* 3×3 dot grid */}
                    <circle cx="7"  cy="12" r="1" fill="white"/>
                    <circle cx="11" cy="12" r="1" fill="white"/>
                    <circle cx="15" cy="12" r="1" fill="white"/>
                    <circle cx="7"  cy="15.5" r="1" fill="white"/>
                    <circle cx="11" cy="15.5" r="1" fill="white"/>
                    <circle cx="15" cy="15.5" r="1" fill="white"/>
                  </svg>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "#c9a96e", fontFamily: T.sans }}>Your Journey</span>
              </div>

              {/* Divider */}
              <div style={{ height: "0.5px", background: "rgba(255,255,255,0.08)", margin: "0 26px" }}/>

              {/* Stats */}
              <div style={{ padding: "20px 26px", display: "flex", flexDirection: "column", gap: 13 }}>
                {[
                  `Day ${cur} of 14`,
                  streak > 0 ? `${streak} day streak` : "Start your streak",
                  `${done.length} of 14 complete`,
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#c9a96e", fontSize: 9, lineHeight: 1 }}>♦</span>
                    <span style={{ fontFamily: T.sans, fontSize: 14, color: "rgba(255,255,255,0.78)", fontWeight: 300, letterSpacing: "0.01em" }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: "0.5px", background: "rgba(255,255,255,0.08)", margin: "0 26px" }}/>

              {/* CTA */}
              <div style={{ padding: "18px 26px" }}>
                <button onClick={() => onStart(finished ? 1 : cur)}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: 0, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.82)" }}>
                    {finished ? "Revisit Day 1" : todayDone ? "Review Session" : "Begin Session"}
                  </span>
                  <span style={{ color: "#c9a96e", fontSize: 16, lineHeight: 1 }}>→</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2: ALL SESSIONS
            ════════════════════════════════════════════════════════════════ */}
        <div style={{ background: T2.bg, position: "relative" }}>

          {/* ── All Sessions ── */}
          <section style={{ padding: "36px 88px 56px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 60, alignItems: "start" }}>
              <div style={{ paddingTop: 8 }}>
                <div style={{ fontSize: 9.5, fontWeight: 500, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", fontFamily: T.sans }}>All Sessions</div>
                <div style={{ width: 20, height: 1, background: T.gold, marginTop: 10, opacity: 0.5 }}/>
              </div>
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
                      {selectedLesson.promise && <p style={{ fontFamily: T.serif, fontSize: 13, fontStyle: "italic", color: T.gold, lineHeight: 1.55, margin: 0 }}>{selectedLesson.promise}</p>}
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

  // ── MOBILE LAYOUT — mirrors desktop sections exactly ─────────────────────
  return (
    <div style={{background:T2.bg,minHeight:"100vh"}} className="au-page">

      {/* ── SECTION 1: Hero — full image ── */}
      <div style={{marginTop:NAV_H,background:"#0a0805",position:"relative"}}>
        <img src="/home-hero-mobile.png" alt="The Six Pillars of Communication Mastery" style={{width:"100%",height:"auto",display:"block"}}/>
      </div>

      {/* ── Static CTA bar — directly below hero ── */}
      <div style={{background:T2.bg,borderBottom:"1px solid rgba(138,158,132,0.15)"}}>
        <div style={{padding:"24px 24px",display:"flex",flexDirection:"column",alignItems:"stretch",gap:16}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"2px",color:T.gold,marginBottom:6}}>
              {finished?"Programme Complete":`Day ${cur} — ${lesson?.tag??""}${todayDone?"  ✓":""}`}
            </div>
            <div style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T.ink,lineHeight:1.2}}>
              {finished?"You communicate differently now.":lesson?.title}
            </div>
          </div>
          <button onClick={()=>onStart(finished?1:cur)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",background:T.ink,color:T.bg,border:"none",borderRadius:6,padding:"16px 24px",fontSize:14,fontWeight:600,fontFamily:T.sans,cursor:"pointer",transition:"all 0.25s ease"}}>
            {finished?"Revisit Day 1":todayDone?"Review Session":"Begin Session"} →
          </button>
        </div>
      </div>

      {/* ── SECTION 2: Today's Focus ── */}
      <section style={{padding:"32px 24px 40px",borderBottom:"1px solid "+T2.divider,background:T2.bg}}>
        <div style={{fontSize:9,fontWeight:500,color:T.gold,textTransform:"uppercase",letterSpacing:"3px",fontFamily:T.sans,marginBottom:10}}>Today's Focus</div>
        <div style={{width:20,height:1,background:T.gold,marginBottom:24,opacity:0.5}}/>
        <div style={{fontSize:10,fontWeight:500,color:T2.text3,textTransform:"uppercase",letterSpacing:"3px",marginBottom:14,fontFamily:T.sans}}>{insight.label}</div>
        <h2 style={{fontFamily:T.serif,fontSize:"clamp(26px,7vw,36px)",fontWeight:500,color:T2.text,letterSpacing:"-1px",lineHeight:1.15,marginBottom:16}}>{insight.headline}</h2>
        <p style={{fontSize:15,color:T2.text3,lineHeight:1.8,fontFamily:T.sans,fontWeight:300}}>{insight.body}</p>
      </section>

      {/* ── SECTION 3: Journey ── */}
      <section style={{padding:"48px 24px 56px",background:T2.bg}}>
        <div style={{fontSize:9,fontWeight:500,color:T.gold,textTransform:"uppercase",letterSpacing:"3px",fontFamily:T.sans,marginBottom:10}}>Journey</div>
        <div style={{width:20,height:1,background:T.gold,marginBottom:28,opacity:0.5}}/>
        <div style={{display:"flex",alignItems:"flex-end",gap:28,marginBottom:24,flexWrap:"wrap"}}>
          <div>
            <div style={{fontFamily:T.serif,fontSize:72,fontWeight:500,color:T2.text,lineHeight:0.85,letterSpacing:"-4px"}}>{pct}<span style={{fontSize:26,letterSpacing:"-1px",color:T.gold}}>%</span></div>
            <div style={{fontSize:11,color:T2.text3,letterSpacing:"2px",textTransform:"uppercase",marginTop:10,fontFamily:T.sans}}>{done.length} of 14 sessions complete</div>
          </div>
          {onTrackMsg && (
            <div style={{paddingBottom:10,maxWidth:260,borderLeft:"2px solid "+T.gold,paddingLeft:16}}>
              <p style={{fontSize:13,color:streak>=2?T.green:T.goldDark,lineHeight:1.55,fontFamily:T.sans}}>{onTrackMsg}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 4: All Sessions ── */}
      <section style={{padding:"32px 24px 56px",borderTop:"1px solid "+T2.divider,background:T2.bg}}>
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
              {selectedLesson.promise&&<p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T.gold,lineHeight:1.55,margin:0}}>{selectedLesson.promise}</p>}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

// ─── SESSIONS SCREEN 
