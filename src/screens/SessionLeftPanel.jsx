import { useState } from 'react';
import { T } from '../theme.js';
import { D9_FIVE_PS, D9_CARDS, D9_REFINEMENTS } from '../data.js';
import { D_NT, D_D9, DIAGRAMS } from '../diagrams.jsx';
import { Scene } from '../scenes.jsx';
import { THEORY_IMAGES } from '../images.js';

const CREAM = "#F5EFE6";
const LP_LABEL = { fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, fontFamily: T.sans, fontWeight: 500 };
const LP_HEADING = { fontFamily: T.serif, fontWeight: 600, color: CREAM, letterSpacing: "-0.5px", lineHeight: 1.15 };
const LP_BODY = { fontFamily: T.serif, fontStyle: "italic", color: "rgba(245,239,230,0.72)", lineHeight: 1.6 };


export function SessionLeftPanel({
  T2, step, lesson, isDone,
  isD1, isD2, isD3, isD4, isD5, isD6, isD7, isD9, isD10, isD11, isD12, isNT,
  selSc, setSelSc, activeSc, scenarios, activeRole,
}) {
  const [imgZoom, setImgZoom] = useState(false);
  // ── D4 — Short Sentences left panel overrides ────────────────────────────
  if (isD4) {
    const d4Dark = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
    const d4Ol = <>
      <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.45)" }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
    </>;
    if (step === "Insight") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
        <img src="/day4-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 72%" }}/>
        {/* Minimal top gradient for label only */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"25%", background:"linear-gradient(to bottom, rgba(10,8,5,0.5) 0%, transparent 100%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:36, left:48, zIndex:2, animation:"fadeUp 0.7s ease both", display:"flex", alignItems:"center", justifyContent:"space-between", right:48 }}>
          <div style={{ ...LP_LABEL, color:T.gold, textShadow:"0 1px 4px rgba(0,0,0,0.5)" }}>The Evidence</div>
          
        </div>
      </div>
    );
    if (step === "Theory") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
        {(() => { const img = THEORY_IMAGES[4]; return img ? (
          <>
            <img src={img.image} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 35%", filter:"brightness(1.2)" }}/>
            {/* Minimal top gradient for label only */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"28%", background:"linear-gradient(to bottom, rgba(10,8,5,0.5) 0%, transparent 100%)", pointerEvents:"none" }}/>
          </>
        ) : (
          <div style={{ background:"#131009", height:"100%", display:"flex", alignItems:"flex-end", padding:"40px 48px" }}>
          </div>
        ); })()}
      </div>
    );
    if (step === "Example") return (
      <div style={d4Dark}>
        <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="clarity" height={900} day={4}/></div>
        {d4Ol}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Masters of Brevity</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,32px)", maxWidth:380, lineHeight:1.2 }}>The best communicators say more with less.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>The Miller's Law Challenge™</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,34px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Feel why short sentences win — in your own brain.</p>
          <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Five challenges. Memory, listening, doing, following, communicating — each one proves the same thing.</p>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>🎥 Breaking News Live</div>
          <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:24 }}>
            <div style={{ width:11, height:11, borderRadius:"50%", background:"#CC4444", flexShrink:0, marginTop:8, animation:"glowPulse 1s ease infinite", boxShadow:"0 0 8px rgba(204,68,68,0.55)" }}/>
            <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,34px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, margin:0, maxWidth:360 }}>Report it live. Watch what your audience remembers.</p>
          </div>
          <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Sixty seconds. A breaking story. A producer cutting your time. The AI becomes your audience — and reveals what actually landed.</p>
        </div>
      </div>
    );
    return null;
  }
   // ── D10 — Performance left panel overrides ───────────────────────────────
  if (isD7) {
    if (step === "Insight") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
        <img src="/day7-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.35)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.92) 0%, rgba(10,8,5,0.15) 50%, transparent 75%)" }}/>
        <div style={{ position:"absolute", bottom:40, left:48, right:48, zIndex:2, animation:"fadeUp 0.7s ease both" }}>
          <div style={{ ...LP_LABEL, marginBottom:16 }}>Day {lesson.day} · {lesson.tag}</div>
          <h2 style={{ ...LP_HEADING, fontSize:"clamp(20px,1.8vw,26px)", marginBottom:18, letterSpacing:"-0.3px" }}>{lesson.title}</h2>
          <p style={{ fontFamily:T.sans, fontSize:14, fontWeight:400, color:"rgba(245,239,230,0.55)", lineHeight:1.6, margin:0, fontStyle:"italic", maxWidth:360 }}>{lesson.quote}</p>
        </div>
      </div>
    );
    if (step === "Example") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Communication in Action</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(22px,2vw,32px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Every skill. One conversation.</p>
          <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.5)", lineHeight:1.65 }}>This is what a week of deliberate practice looks like when you put it all together.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Communication Fitness Reps</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(22px,2vw,32px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Skill fades without repetition. Strength comes from reps.</p>
          <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.5)", lineHeight:1.65 }}>Choose your practice mode and keep the habits alive.</p>
        </div>
      </div>
    );
    if (step === "Theory") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden", background:"#1A1610" }}>
        <img
          src="/d7-habit-loop.jpg"
          alt="The Habit Loop"
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}
        />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(8,6,3,0.8) 0%, rgba(8,6,3,0.1) 50%, transparent 75%)" }}/>
      </div>
    );
    if (step === "Simulation") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Week 1 Master Challenge</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Teach It Forward.</p>
          <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Explain what you learned as if teaching someone else. Your AI coach evaluates all six Week 1 skills.</p>
        </div>
      </div>
    );
  }

  if (isD10) {
    const d10Dark = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
    const d10Ol = <>
      <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.48)" }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
    </>;
    const theoryImg10 = THEORY_IMAGES[lesson.theoryImageDay || lesson.day];
    if (step === "Insight") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
        <img src="/day10-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.88) 0%, rgba(10,8,5,0.2) 45%, transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:40, left:48, right:48, zIndex:2, animation:"fadeUp 0.7s ease both", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <div style={{ ...LP_LABEL, color:T.gold, marginBottom:12 }}>The Evidence</div>
            <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,34px)", fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.3, margin:0, maxWidth:320 }}>Brilliant work in silence<br/>is still silence.</p>
          </div>
          
        </div>
      </div>
    );
    if (step === "Theory") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden", background:"#0A0C10" }}>
        <img
          src="/performance-iceberg.jpg"
          alt="The Performance Iceberg"
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}
        />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(8,6,3,0.75) 0%, rgba(8,6,3,0.1) 50%, transparent 75%)" }}/>
        <div style={{ position:"absolute", bottom:40, left:48, right:48, zIndex:2, animation:"fadeUp 0.7s ease both" }}>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(20px,1.8vw,28px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.3, margin:0, maxWidth:340 }}>90% of your hardest work lives below the waterline.</p>
        </div>
      </div>
    );
    if (step === "Example") return (
      <div style={d10Dark}>
        <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="pie" height={900} day={10}/></div>
        {d10Ol}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Performance in the Wild</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,32px)", maxWidth:380, lineHeight:1.2 }}>The best performers make their contribution impossible to ignore.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ position:"relative", height:"100%", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <img src="/practice-bg.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.62)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.98) 0%, transparent 60%)" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, marginBottom:20 }}>SAR Builder</div>
          <p style={{ ...LP_HEADING, fontSize:24, maxWidth:340, lineHeight:1.2, marginBottom:16 }}>Situation. Action. Result.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {["Build a SAR story","Sharpen your result","Name your contribution"].map((b,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:16, height:16, borderRadius:"50%", border:"1px solid rgba(138,158,132,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:8, color:T.gold }}>{i+1}</span>
                </div>
                <span style={{ fontFamily:T.sans, fontSize:12, color:"rgba(245,239,230,0.65)" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={d10Dark}>
        <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="pie" height={900} day={10}/></div>
        {d10Ol}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Performance in Action</div>
          <p style={{ ...LP_HEADING, fontSize:26, maxWidth:340, lineHeight:1.2 }}>Communicate your impact. Make it impossible to miss.</p>
        </div>
      </div>
    );
    return null;
  }
   // ── D3 — Eliminate Fillers left panel overrides ──────────────────────────
  if (isD3) {
    const d3Dark = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
    const d3Ol = <>
      <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.45)" }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
    </>;
    if (step === "Insight") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
        <img src="/day3-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"25%", background:"linear-gradient(to bottom, rgba(10,8,5,0.55) 0%, transparent 100%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:36, left:48, right:48, zIndex:2, animation:"fadeUp 0.7s ease both", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ ...LP_LABEL, color:T.gold, textShadow:"0 1px 4px rgba(0,0,0,0.5)" }}>The Problem</div>
          
        </div>
      </div>
    );
    if (step === "Theory") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
        <img src="/day3-theory.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.35)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.88) 0%, rgba(10,8,5,0.2) 45%, transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:40, left:48, zIndex:2, animation:"fadeUp 0.7s ease both", maxWidth:320 }}>
          <p style={{ fontFamily:T.serif, fontSize:18, fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.35, margin:0 }}>The power of silence.</p>
        </div>
      </div>
    );
    if (step === "Example") return (
      <div style={d3Dark}>
        <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="clarity" height={900} day={3}/></div>
        {d3Ol}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Masters of the Pause</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,32px)", maxWidth:380, lineHeight:1.2 }}>The best speakers use silence the way musicians use rests.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>The Filler-Free Challenge</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Silence often sounds more confident than fillers.</p>
          <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Three rounds. Practise the pause, notice the difference silence makes, and build the habit of calm, deliberate delivery.</p>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Simulation · Day 3</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Speak without filling the silence.</p>
          <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Teach me how to make your favourite meal. Your AI vocal coach analyses your delivery and gives personalised feedback.</p>
        </div>
      </div>
    );
    return null;
  }
   // ── D1 — Speak Clearly left panel overrides ──────────────────────────────
  if (isD1) {
    const d1Dark = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
    const d1Overlay = <>
      <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.45)" }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
    </>;
    if (step === "Insight") return (
      <div style={d1Dark}>
        <img src="/day1-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}/>
        {d1Overlay}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.7s ease both" }}>
          <div style={{ ...LP_LABEL, marginBottom:16 }}>Day {lesson.day} · {lesson.tag}</div>
          <h2 style={{ ...LP_HEADING, fontSize:"clamp(20px,1.8vw,26px)", marginBottom:18, letterSpacing:"-0.3px" }}>{lesson.title}</h2>
          <p style={{ fontFamily:T.sans, fontSize:14, fontWeight:400, color:"rgba(245,239,230,0.55)", lineHeight:1.6, margin:0, fontStyle:"italic", maxWidth:360 }}>{lesson.quote}</p>
        </div>
      </div>
    );
    if (step === "Theory") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
        <img src="/feynman-technique.jpg" alt="The Feynman Technique" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:T.imgObjectPosition||"center 20%" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.22)" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"25%", background:"linear-gradient(to bottom, rgba(10,8,5,0.55) 0%, transparent 100%)" }}/>
      </div>
    );
    if (step === "Example") return (
      <div style={d1Dark}>
        <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="clarity" height={900} day={1}/></div>
        {d1Overlay}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Clarity in the Wild</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,32px)", maxWidth:380, lineHeight:1.2 }}>The clearest voices don't use more words. They use better ones.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"80px 48px 40px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 35% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>THE FEYNMAN CHALLENGE™</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(28px,2.4vw,44px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.1, marginBottom:20, maxWidth:400 }}>If you can explain it simply, you understand it.</p>
          <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.45)", marginBottom:20 }}/>
        </div>
        {/* Badge */}
        <div style={{ position:"relative", zIndex:2, display:"flex", justifyContent:"center", alignItems:"center", flex:1, marginTop:16 }}>
          <div style={{ position:"relative", width:200, height:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1px solid rgba(200,168,76,0.2)", boxShadow:"0 0 40px rgba(200,168,76,0.08), 0 0 80px rgba(200,168,76,0.04)" }}/>
            <div style={{ position:"absolute", inset:12, borderRadius:"50%", border:"0.5px solid rgba(200,168,76,0.12)" }}/>
            <img src="/badge-queen.jpg" alt="Clarity Master" style={{ width:140, height:140, borderRadius:"50%", objectFit:"cover", border:"2px solid rgba(200,168,76,0.35)", position:"relative", zIndex:1 }}/>
          </div>
        </div>
        {/* Time */}
        <div style={{ position:"relative", zIndex:2, display:"flex", alignItems:"center", gap:8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span style={{ fontFamily:T.sans, fontSize:13, color:"rgba(245,239,230,0.45)" }}>Estimated time: <span style={{ color:"rgba(245,239,230,0.7)", fontWeight:600 }}>4 minutes</span></span>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"80px 48px 40px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 35% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>SIMULATION · DAY 1</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(28px,2.4vw,44px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.1, marginBottom:24, maxWidth:400 }}>Awareness is where every great communicator begins.</p>
          <div style={{ padding:"16px 20px", background:"rgba(138,158,132,0.08)", borderRadius:8, border:"0.5px solid rgba(138,158,132,0.2)", marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={T.gold} strokeWidth="1.3"/><circle cx="10" cy="10" r="4.5" stroke={T.gold} strokeWidth="1.3"/><circle cx="10" cy="10" r="1.5" fill={T.gold}/></svg>
            <div>
              <div style={{ fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:3 }}>Today's Goal</div>
              <div style={{ fontFamily:T.serif, fontSize:15, fontWeight:500, color:"rgba(245,239,230,0.85)" }}>Establish your clarity baseline.</div>
            </div>
          </div>
        </div>
        <div style={{ position:"relative", zIndex:2, display:"flex", justifyContent:"center", alignItems:"center", flex:1 }}>
          <div style={{ position:"relative", width:190, height:190, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1px solid rgba(200,168,76,0.2)", boxShadow:"0 0 40px rgba(200,168,76,0.08)" }}/>
            <div style={{ position:"absolute", inset:12, borderRadius:"50%", border:"0.5px solid rgba(200,168,76,0.12)" }}/>
            <img src="/badge-queen.jpg" alt="" style={{ width:130, height:130, borderRadius:"50%", objectFit:"cover", border:"2px solid rgba(200,168,76,0.35)", position:"relative", zIndex:1 }}/>
          </div>
        </div>
        <div style={{ position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <span style={{ fontFamily:T.serif, fontSize:13, color:"rgba(245,239,230,0.45)" }}>Estimated time: <span style={{ color:"rgba(245,239,230,0.65)", fontWeight:600 }}>4–5 minutes</span></span>
          </div>
          <p style={{ fontFamily:T.serif, fontSize:13, color:"rgba(245,239,230,0.35)", lineHeight:1.6, margin:0 }}>Awareness is the first move. Clarity is the advantage.</p>
        </div>
      </div>
    );
    return null;
  }
   // ── NT Module (Day 8) — Narrative Transportation overrides ──────────────
  if (isNT) {
    const darkBase = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
    if (step === "Insight") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
        <img src="/nt-insight.jpg" alt="Narrative Transportation" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.38)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.82) 0%, rgba(10,8,5,0.15) 55%, transparent 80%)" }}/>
        <div style={{ position:"absolute", bottom:40, left:48, right:48, zIndex:2, animation:"fadeUp 0.7s ease both" }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ ...LP_LABEL, color:T.gold }}>The Foundation</div>
            
          </div>
          <p style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.3, margin:0, maxWidth:300 }}>Turning Stories<br/>Into Impact</p>
        </div>
      </div>
    );
    if (step === "Theory 1") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        {/* Blurred bg fill */}
        <img src="/dual-coding-theory.jpg" alt="" style={{ position:"absolute", inset:"-20px", width:"calc(100% + 40px)", height:"calc(100% + 40px)", objectFit:"cover", filter:"blur(18px) brightness(0.6)", pointerEvents:"none" }}/>
        {/* Sharp image — scaled up to reduce blurred border */}
        <img src="/dual-coding-theory.jpg" alt="Dual Coding Theory" style={{ position:"relative", zIndex:1, width:"140%", marginLeft:"-20%", height:"auto", display:"block" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.55) 0%, transparent 40%)", zIndex:2 }}/>
        <div style={{ position:"absolute", bottom:40, left:48, right:48, zIndex:3, animation:"fadeUp 0.7s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:8 }}>Green &amp; Brock, 2000</div>
          <p style={{ fontFamily:T.serif, fontSize:20, fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.35, margin:0, maxWidth:320 }}>Words and images together. That's how stories are remembered.</p>
        </div>
      </div>
    );
    if (step === "Theory 2") return (
      <>
        {imgZoom && (
          <div onClick={()=>setImgZoom(false)} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(10,8,5,0.92)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out",backdropFilter:"blur(4px)"}}>
            <img src="/nt-6beat-framework.jpg" alt="The 6-Beat Story Framework" style={{maxWidth:"92vw",maxHeight:"92vh",objectFit:"contain",borderRadius:4,boxShadow:"0 24px 80px rgba(0,0,0,0.5)"}}/>
            <div style={{position:"absolute",top:24,right:28,color:"rgba(255,255,255,0.5)",fontSize:28,lineHeight:1}}>×</div>
          </div>
        )}
        <div onClick={()=>setImgZoom(true)} style={{ height:"100%", position:"relative", overflow:"hidden", cursor:"zoom-in", background:"#E8E2D8", display:"flex", flexDirection:"column", justifyContent:"center" }}>
          {/* Blurred bg fill — hides any gap above/below */}
          <img src="/nt-6beat-framework.jpg" alt="" style={{ position:"absolute", inset:"-20px", width:"calc(100% + 40px)", height:"calc(100% + 40px)", objectFit:"cover", filter:"blur(18px) brightness(0.55)", pointerEvents:"none" }}/>
          {/* Sharp full-width image */}
          <img src="/nt-6beat-framework.jpg" alt="The 6-Beat Story Framework" style={{ position:"relative", zIndex:1, width:"100%", height:"auto", display:"block" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.65) 0%, transparent 40%)", zIndex:2 }}/>
          <div style={{ position:"absolute", top:20, right:20, zIndex:3, background:"rgba(10,8,5,0.45)", backdropFilter:"blur(4px)", borderRadius:4, padding:"6px 10px", display:"flex", alignItems:"center", gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/><path d="M9.5 9.5l2.5 2.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/><path d="M4.5 6h3M6 4.5v3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontFamily:T.sans,fontWeight:500}}>Click to enlarge</span>
          </div>
          <div style={{ position:"absolute", bottom:32, left:48, zIndex:3, animation:"fadeUp 0.7s ease both", maxWidth:320 }}>
            <div style={{ ...LP_LABEL, fontSize:13, color:"#F5EFE6", marginBottom:8 }}>The Framework</div>
            <p style={{ fontFamily:T.serif, fontSize:18, fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.35, margin:0 }}>Every great story follows a learnable pattern.</p>
          </div>
        </div>
      </>
    );
    if (step === "Example") return (
      <div style={{ background:"#0E0B08", height:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(183,154,107,0.06) 0%, transparent 60%)" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Storytelling in the Wild</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,34px)", maxWidth:380, marginBottom:28, lineHeight:1.2 }}>Stories create empathy. Empathy creates trust. Trust creates influence.</p>
          <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
          <p style={{ ...LP_BODY, fontSize:15, maxWidth:340 }}>The same facts — told as a story — land 22× more powerfully in the human brain.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ position:"relative", height:"100%", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <img src="/practice-bg.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.62)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.98) 0%, transparent 60%)" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, marginBottom:20 }}>Build Your Story</div>
          <p style={{ ...LP_HEADING, fontSize:26, maxWidth:340, lineHeight:1.2, marginBottom:20 }}>Use the framework. Make it yours.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {["Hook — start with tension","Character — make it human","Problem — raise the stakes","Turning Point — what changed?","Resolution — what happened?","Meaning — why it matters"].map((b,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:16, height:16, borderRadius:"50%", border:"1px solid rgba(183,154,107,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:8, color:T.gold }}>{i+1}</span>
                </div>
                <span style={{ fontFamily:T.sans, fontSize:12, color:"rgba(245,239,230,0.65)" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={darkBase}>
        <img src="/day1-simulation.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.58)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, marginBottom:20 }}>Your Rehearsal</div>
          <p style={{ ...LP_HEADING, fontSize:28, maxWidth:360, lineHeight:1.2 }}>Now tell it out loud.</p>
        </div>
      </div>
    );
    return null; // Review handled by 3-col layout
  }
   // ── Day 9 LeftPanel ──────────────────────────────────────────────────────
  if (isD9) {
    const d9Dark = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
    const d9Overlay = <>
      <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.62)" }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
    </>;
    const d9Label = (txt) => <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>{txt}</div>;
    if (step === "Insight") return (
      <div style={d9Dark}>
        <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="voice" height={900} day={lesson.day}/></div>
        {d9Overlay}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.7s ease both" }}>
          <div style={{ marginBottom:16 }}>
            {d9Label("The Performance")}
            
          </div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(26px,2.3vw,38px)", maxWidth:360, marginBottom:20 }}>You've built a great story. Now learn how the world's best speakers deliver it.</p>
          <div style={{ width:32, height:1, background:T.gold, opacity:0.45 }}/>
        </div>
      </div>
    );
    if (step === "Theory") return (
      <div style={{ background:"#131009", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"40px 36px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, left:-60, width:360, height:360, background:"radial-gradient(ellipse, rgba(183,154,107,0.07) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ ...LP_LABEL, fontSize:13, color:"#F5EFE6", marginBottom:24, alignSelf:"flex-start", animation:"fadeDown 0.6s ease both" }}>The 5 Elements</div>
        <div style={{ animation:"fadeIn 0.8s ease 0.1s both", opacity:0 }}><D_D9/></div>
        <p style={{ fontFamily:T.serif, fontSize:16, fontStyle:"italic", color:"rgba(245,239,230,0.5)", marginTop:24, textAlign:"center" }}>Pace · Pause · Presence · Projection · Precision</p>
      </div>
    );
    if (step === "Example") return (
      <div style={d9Dark}>
        <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="voice" height={900} day={lesson.day}/></div>
        {d9Overlay}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          {d9Label("Delivery Masters")}
          <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,32px)", maxWidth:380, lineHeight:1.2 }}>The best speakers in the world share one thing: they make you feel, not just hear.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ position:"relative", height:"100%", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <img src="/practice-bg.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.62)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.98) 0%, transparent 60%)" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          {d9Label("Delivery Preparation")}
          <p style={{ ...LP_HEADING, fontSize:26, maxWidth:340, lineHeight:1.2, marginBottom:20 }}>Take your story and prepare it for performance.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {D9_REFINEMENTS.map((r,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:12 }}>{r.icon}</span>
                <span style={{ fontFamily:T.sans, fontSize:11, color:"rgba(245,239,230,0.55)" }}>{r.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={d9Dark}>
        <img src="/day1-simulation.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
        {d9Overlay}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          {d9Label("Your Performance")}
          <p style={{ ...LP_HEADING, fontSize:28, maxWidth:360, lineHeight:1.2 }}>Now perform it. This is where confidence is built.</p>
        </div>
      </div>
    );
    return null;
  }
   // ── Insight — cinematic scene hero ──────────────────────────────────────
  if (step === "Insight") return (
    <div style={{ position: "relative", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {lesson.day === 1 ? (
        <img src="/day1-lounge.jpg" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
      ) : isD2 ? (
        <img src="/d2-insight.jpg" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      ) : isD5 ? (
        <img src="/d5-insight.jpg" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      ) : isD6 ? (
        <img src="/d6-insight.jpg" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
      ) : isD11 ? (
        <img src="/d11-insight.jpg" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
      ) : (
        <div className="au-hero-scene" style={{ position: "absolute", inset: 0 }}>
          <Scene name={lesson.scene} height={900} day={lesson.day}/>
        </div>
      )}
      {/* Day 1: 50% veil so the terracotta and interior warmth show through */}
      <div style={{ position: "absolute", inset: 0, background: lesson.day === 1 ? "rgba(10,8,5,0.50)" : "rgba(10,8,5,0.5)" }}/>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.5) 40%, transparent 75%)" }}/>
      <div style={{ position: "relative", zIndex: 2, padding: "40px 48px", animation: "fadeUp 0.7s ease both" }}>
        <div style={{ ...LP_LABEL, marginBottom: 16 }}>Day {lesson.day} · {lesson.tag}</div>
        <h2 style={{ ...LP_HEADING, fontSize: "clamp(20px,1.8vw,26px)", marginBottom: 18, letterSpacing: "-0.3px" }}>{lesson.title}</h2>
        {!isD12 && <p style={{ fontFamily:T.sans, fontSize:14, fontWeight:400, color:"rgba(245,239,230,0.55)", lineHeight:1.6, margin:0, fontStyle:"italic", maxWidth:360 }}>{lesson.quote}</p>}
      </div>
    </div>
  );
   // ── Theory — photo if available, otherwise diagram ───────────────────────
  if (step === "Theory") {
    const Diagram = DIAGRAMS[lesson.day - 1];
    const theoryImg = THEORY_IMAGES[lesson.theoryImageDay || lesson.day];
    // Day 5: full-width contain with blurred bg so landscape image shows completely
    if (isD5 && theoryImg && theoryImg.image) {
      return (
        <div style={{ height:"100%", position:"relative", overflow:"hidden", background:"#1A1510", display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <img src={theoryImg.image} alt="" style={{ position:"absolute", inset:"-20px", width:"calc(100% + 40px)", height:"calc(100% + 40px)", objectFit:"cover", filter:"blur(18px) brightness(0.45)", pointerEvents:"none" }}/>
          <img src={theoryImg.image} alt={theoryImg.alt||""} style={{ position:"relative", zIndex:1, width:"140%", marginLeft:"-20%", height:"auto", display:"block" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.55) 0%, transparent 40%)", zIndex:2 }}/>
        </div>
      );
    }
    if (theoryImg && theoryImg.image) {
      const useContain = theoryImg.imgObjectFit === "contain";
      return (
        <div style={{ height: "100%", position: "relative", overflow: "hidden", background: useContain ? "#0E0B08" : "transparent" }}>
          <img src={theoryImg.image} alt={theoryImg.alt || ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: useContain ? "contain" : "cover", objectPosition: theoryImg.imgObjectPosition || "center" }}/>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "28%", background: "linear-gradient(to bottom, rgba(10,8,5,0.55) 0%, transparent 100%)" }}/>
        </div>
      );
    }
    return (
      <div style={{ background: "#131009", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, left: -80, width: 400, height: 400, background: "radial-gradient(ellipse, rgba(138,158,132,0.1) 0%, transparent 60%)", pointerEvents: "none" }}/>
        <div style={{ transform: "scale(1.4)", transformOrigin: "top center", animation: "fadeIn 0.8s ease 0.1s both", opacity: 0 }}>
          {Diagram ? <Diagram/> : null}
        </div>
      </div>
    );
  }
   // ── Example — D2/D5 get cinematic text panels; others get before/after ──────
  if (step === "Example") {
    if (isD2) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Voice in Action</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(22px,2vw,32px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Range creates engagement. Contrast creates emotion.</p>
          <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.5)", lineHeight:1.65 }}>The most compelling voices are the most controlled — and the most dynamic.</p>
        </div>
      </div>
    );
    if (isD5) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>PRE in Action</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(22px,2vw,32px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Point. Reason. Example. The architecture of every great professional answer.</p>
          <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.5)", lineHeight:1.65 }}>The world's most effective communicators all follow the same structure — whether they name it or not.</p>
        </div>
      </div>
    );
    if (isD6) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Masters Under Pressure</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(22px,2vw,32px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Composure is a skill. The calmest person in the room shapes the room.</p>
          <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.5)", lineHeight:1.65 }}>How elite communicators handle the conversations most people avoid.</p>
        </div>
      </div>
    );
    if (isD11) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Iconic Brands</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(22px,2vw,32px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Brand isn't what you say about yourself. It's what others say when you're not there.</p>
          <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.5)", lineHeight:1.65 }}>Three people whose personal brands became cultural forces — by design, not accident.</p>
        </div>
      </div>
    );
    if (isD12) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Presence in the Wild</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(22px,2vw,32px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>The strongest communicators make people feel calm, engaged, and connected.</p>
          <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.5)", lineHeight:1.65 }}>How great communicators use gestures, stillness, and grounded energy to create presence.</p>
        </div>
      </div>
    );
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#131009" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)", animation: "fadeIn 0.5s ease both" }}>
          <div style={{ ...LP_LABEL, color: "rgba(196,122,122,0.85)", marginBottom: 16 }}>Before</div>
          <p style={{ fontFamily: T.serif, fontSize: 20, fontStyle: "italic", color: "rgba(245,239,230,0.45)", lineHeight: 1.55, letterSpacing: "-0.2px" }}>"{lesson.bad}"</p>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 48px", background: "rgba(138,158,132,0.04)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + T.gold + " 0%, rgba(138,158,132,0.1) 100%)" }}/>
          <div style={{ ...LP_LABEL, marginBottom: 16 }}>After</div>
          <p style={{ fontFamily: T.serif, fontSize: 22, fontStyle: "italic", color: CREAM, lineHeight: 1.5, letterSpacing: "-0.3px" }}>"{lesson.good}"</p>
        </div>
      </div>
    );
  }
   // ── Practice — practice-bg.jpg provides the atmosphere from the outer wrapper
  if (step === "Practice") {
    if (isD2) return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <img src="/d2-practice.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.55)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.92) 0%, transparent 55%)" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Train Your Instrument</div>
          <p style={{ ...LP_HEADING, fontSize:28, maxWidth:360, lineHeight:1.2 }}>Four exercises. One goal: deliberate vocal control.</p>
        </div>
      </div>
    );
    if (isD5) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>The PRE Card Sort™</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Sort the cards. Train the instinct.</p>
          <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Four scenarios. Three cards each. Identify the Point, Reason, and Example — and build the reflex to structure any answer.</p>
        </div>
      </div>
    );
    return (
      <div style={{ position: "relative", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,5,0.65)" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,8,5,0.98) 0%, transparent 60%)" }}/>
        <div style={{ position: "relative", zIndex: 2, padding: "40px 48px", animation: "fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, marginBottom: 20 }}>Your Practice</div>
          <p style={{ ...LP_HEADING, fontSize: 28, maxWidth: 380, lineHeight: 1.2 }}>{lesson.practice.split('.')[0]}.</p>
        </div>
      </div>
    );
  }
   // ── Simulation — D2 gets cinematic panel; others get scenario ───────────────
  if (step === "Simulation" && isD2) return (
    <div style={{ background:"#0E0B08", height:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ fontSize:11, fontWeight:700, color:"rgba(200,180,140,1)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:20, fontFamily:T.sans }}>Real-World Voice Coaching</div>
        <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>This is where voice training becomes real.</p>
        <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.7)", lineHeight:1.65 }}>Choose your scenario. Speak. Get coached on pace, pauses, clarity, and presence.</p>
      </div>
    </div>
  );
   if (step === "Simulation" && isD6) return (
    <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>AI Conversation Prep</div>
        <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Prepare for the conversations that matter most.</p>
        <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Tell the AI who you're meeting and why. It generates the 10 toughest questions you're likely to face — then coaches your responses.</p>
      </div>
    </div>
  );
   if (step === "Simulation" && isD12) return (
    <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Presence — In Action</div>
        <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Record. Review. See how you communicate.</p>
        <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Choose a prompt. Record yourself naturally. Your digital coach analyses your presence and provides personalised feedback.</p>
      </div>
    </div>
  );
   if (step === "Simulation" && isD5) return (
    <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>PRE Challenge</div>
        <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Real questions. Real coaching.</p>
        <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Type your Point, Reason, and Example for each question. Your AI coach scores the clarity of every component.</p>
      </div>
    </div>
  );
   if (step === "Simulation" && isD11) return (
    <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Brand — In Action</div>
        <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Your brand is built in every room you enter. Shape it.</p>
        <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Four scenarios where your brand is built or broken. Write your response. Get coached on clarity, authenticity, and memorability.</p>
      </div>
    </div>
  );
   if (step === "Simulation") return (
    <div style={{ background: "#131009", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "40px 48px", position: "relative", overflow: "hidden" }}>
      {/* Day 1: photo background */}
      {lesson.day === 1 && (
        <>
          <img src="/day1-simulation.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}/>
          <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,5,0.58)" }}/>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
        </>
      )}
      {lesson.day !== 1 && <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, background: "radial-gradient(ellipse, rgba(138,158,132,0.08) 0%, transparent 65%)" }}/>}
      <div style={{ animation: "fadeUp 0.6s ease both", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <div style={{ ...LP_LABEL }}>Your Scenario</div>
          <div style={{ display: "flex", gap: 5, marginLeft: "auto" }}>
            {scenarios.map((_, i) => (
              <button key={i} onClick={() => setSelSc(i)} style={{
                width: 26, height: 26, borderRadius: "50%",
                border: "1px solid " + (selSc === i ? T.gold : "rgba(255,255,255,0.15)"),
                background: selSc === i ? "rgba(138,158,132,0.15)" : "transparent",
                color: selSc === i ? T.gold : "rgba(255,255,255,0.3)",
                fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: T.sans,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</button>
            ))}
          </div>
        </div>
        <p style={{ ...LP_HEADING, fontSize: 26, fontWeight: 600, marginBottom: 24, maxWidth: 380 }}>{activeSc}</p>
        {activeRole && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", background: "rgba(138,158,132,0.08)", borderRadius: 4, border: "1px solid rgba(138,158,132,0.2)" }}>
            <span style={{ fontSize: 12 }}>{activeRole.icon}</span>
            <span style={{ fontSize: 10, color: "rgba(245,239,230,0.45)", fontFamily: T.sans }}>{activeRole.label}</span>
          </div>
        )}
      </div>
    </div>
  );
   // ── Review — the close of the session ───────────────────────────────────
  if (step === "Review") return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "40px 48px", background: "linear-gradient(160deg, #1A1713 0%, #131009 100%)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 70%, rgba(138,158,132,0.12) 0%, transparent 55%)", pointerEvents: "none" }}/>
      <div style={{ position: "relative", zIndex: 2, animation: "fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, marginBottom: 20 }}>Your Promise</div>
        <p style={{ ...LP_HEADING, fontSize: 26, fontWeight: 600, fontStyle: "italic", lineHeight: 1.4, marginBottom: 28, maxWidth: 380 }}>{lesson.promise}</p>
        {isDone && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(82,112,96,0.25)", borderRadius: 4, border: "1px solid rgba(82,112,96,0.4)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={T.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontSize: 11, color: T.green, fontFamily: T.sans, fontWeight: 500, letterSpacing: "0.05em" }}>Session Complete</span>
          </div>
        )}
      </div>
    </div>
  );
   return null;
};
 // ── Expandable example card — shared across all Example tabs ─────────────
export const ExCard = ({name, preview, full, T2: _T2, compact}) => {
  const T2 = _T2 || T;
  const [open, setOpen] = useState(false);
  const s = compact ? 0.85 : 1;
  return (
    <div onClick={()=>setOpen(o=>!o)} style={{padding:"28px 24px",borderRadius:8,background:open?"rgba(237,232,223,0.92)":"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",cursor:"pointer",transition:"all 0.25s ease",userSelect:"none"}}
      onMouseEnter={e=>{if(!open){e.currentTarget.style.background="rgba(237,232,223,0.85)";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(44,36,22,0.08)";}}}
      onMouseLeave={e=>{if(!open){e.currentTarget.style.background="rgba(237,232,223,0.6)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{fontFamily:T.serif,fontSize:Math.round(22*s),fontWeight:600,color:T.gold,lineHeight:1.3}}>{name}</div>
        <span style={{fontFamily:T.sans,fontSize:13,color:T2.text3,marginLeft:12,flexShrink:0,marginTop:4}}>{open?"▴":"▸"}</span>
      </div>
      <p style={{fontFamily:T.sans,fontSize:Math.round(16*s),color:T2.text,lineHeight:1.7,margin:0,fontWeight:400}}>{preview}</p>
      {open && <p style={{fontFamily:T.sans,fontSize:Math.round(15*s),color:T2.text,lineHeight:1.75,margin:"14px 0 0",fontWeight:300,whiteSpace:"pre-wrap",borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:14}}>{full}</p>}
    </div>
  );
};

