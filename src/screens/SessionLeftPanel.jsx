import { useState } from 'react';
import { T } from '../theme.js';
import { D9_COMM_STYLES } from '../data.js';
import { D_NT, D_D9, DIAGRAMS } from '../diagrams.jsx';
import { Scene } from '../scenes.jsx';
import { THEORY_IMAGES } from '../images.js';

const CREAM = "#F5EFE6";
const LP_LABEL = { fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, fontFamily: T.sans, fontWeight: 500 };
const LP_HEADING = { fontFamily: T.serif, fontWeight: 600, color: CREAM, letterSpacing: "-0.5px", lineHeight: 1.15 };
const LP_BODY = { fontFamily: T.serif, fontStyle: "italic", color: "rgba(245,239,230,0.72)", lineHeight: 1.6 };


export function SessionLeftPanel({
  T2, step, lesson, isDone,
  isD1, isD2, isD3, isD4, isD5, isD6, isD7, isD9, isD10, isD11, isD12, isD13, isD14, isNT,
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
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Masters of Brevity</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:380, lineHeight:1.2 }}>The best communicators say more with less.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>The Miller's Law Challenge™</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Feel why short sentences win — in your own brain.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Five challenges. Memory, listening, doing, following, communicating — each one proves the same thing.</p>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>🎥 Breaking News Live</div>
          <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:16 }}>
            <div style={{ width:11, height:11, borderRadius:"50%", background:"#CC4444", flexShrink:0, marginTop:8, animation:"glowPulse 1s ease infinite", boxShadow:"0 0 8px rgba(204,68,68,0.55)" }}/>
            <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, margin:0 }}>Report it live. Watch what your audience remembers.</p>
          </div>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
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
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Communication in Action</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Every skill. One conversation.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>This is what a week of deliberate practice looks like when you put it all together.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Communication Fitness Reps</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Skill fades without repetition. Strength comes from reps.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Choose your practice mode and keep the habits alive.</p>
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
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Week 1 Master Challenge</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Teach It Forward.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Explain what you learned as if teaching someone else. Your AmplifyU coach evaluates all six Week 1 skills.</p>
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
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, margin:0 }}>90% of your hardest work lives below the waterline.</p>
        </div>
      </div>
    );
    if (step === "Example") return (
      <div style={d10Dark}>
        <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="pie" height={900} day={10}/></div>
        {d10Ol}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Performance in the Wild</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:380, lineHeight:1.2 }}>The best performers make their contribution impossible to ignore.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"flex-end", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 25%, rgba(138,158,132,0.08) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,4,0.98) 0%, rgba(10,8,4,0.3) 55%, transparent 80%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>The SAR Challenge™</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:340, lineHeight:1.2, marginBottom:16 }}>Turn what you do into a story people remember.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={d10Dark}>
        <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="pie" height={900} day={10}/></div>
        {d10Ol}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Performance in Action</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Communicate your impact. Make it impossible to miss.</p>
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
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Masters of the Pause</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:380, lineHeight:1.2 }}>The best speakers use silence the way musicians use rests.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>The Filler-Free Challenge</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Silence often sounds more confident than fillers.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Three rounds. Practise the pause, notice the difference silence makes, and build the habit of calm, deliberate delivery.</p>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Simulation · Day 3</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Speak without filling the silence.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
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
          <h2 style={{ ...LP_HEADING, fontSize:"clamp(20px,1.8vw,26px)", marginBottom:16, letterSpacing:"-0.3px" }}>{lesson.title}</h2>
          <p style={{ fontFamily:T.sans, fontSize:14, fontWeight:400, color:"rgba(245,239,230,0.55)", lineHeight:1.6, margin:0, fontStyle:"italic", maxWidth:360 }}>Transform complexity into clarity.</p>
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
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"flex-end", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 25%, rgba(138,158,132,0.09) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,4,0.98) 0%, rgba(10,8,4,0.3) 55%, transparent 80%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Clarity in the Wild</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:380, lineHeight:1.2, marginBottom:16 }}>The clearest voices don't use more words. They use better ones.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        </div>
      </div>
    );
    if (step === "Voice Warm-Up") return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"80px 48px 40px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 35% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Voice Warm-Up</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(28px,2.4vw,44px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.1, marginBottom:20, maxWidth:400 }}>Let's warm up your voice.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)", marginBottom:24 }}/>
          <p style={{ fontFamily:T.serif, fontStyle:"italic", fontSize:15, color:"rgba(245,239,230,0.55)", lineHeight:1.7, maxWidth:360, marginBottom:24 }}>Pick a topic below and speak for around 20 seconds. Don't worry about being perfect — it's simply to get you talking.</p>
          <div style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"16px 20px", background:"rgba(138,158,132,0.08)", borderRadius:8, border:"0.5px solid rgba(138,158,132,0.2)", maxWidth:380 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{flexShrink:0,marginTop:2}}><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" stroke={T.gold} strokeWidth="1.3"/><circle cx="12" cy="9" r="2.5" stroke={T.gold} strokeWidth="1.3"/></svg>
            <div>
              <div style={{ fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:4 }}>Coach Tip</div>
              <p style={{ fontFamily:T.serif, fontSize:14, color:"rgba(245,239,230,0.65)", lineHeight:1.6, margin:0 }}>There's no right or wrong answer. Just speak naturally — we'll handle the rest.</p>
            </div>
          </div>
        </div>
        <div style={{ flex:1 }}/>
        <div style={{ position:"relative", zIndex:2, display:"flex", alignItems:"center", gap:8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span style={{ fontFamily:T.sans, fontSize:13, color:"rgba(245,239,230,0.45)" }}>Estimated time: <span style={{ color:"rgba(245,239,230,0.7)", fontWeight:600 }}>1 minute</span></span>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"80px 48px 40px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 35% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>SIMULATION · DAY 1</div>
          <p style={{ fontFamily:T.serif, fontSize:"clamp(28px,2.4vw,44px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.1, marginBottom:24, maxWidth:400 }}>Awareness is where every great communicator begins.</p>
          <div style={{ padding:"16px 20px", background:"rgba(138,158,132,0.08)", borderRadius:8, border:"0.5px solid rgba(138,158,132,0.2)", marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={T.gold} strokeWidth="1.3"/><circle cx="10" cy="10" r="4.5" stroke={T.gold} strokeWidth="1.3"/><circle cx="10" cy="10" r="1.5" fill={T.gold}/></svg>
            <div>
              <div style={{ fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:3 }}>Today's Goal</div>
              <div style={{ fontFamily:T.serif, fontSize:15, fontWeight:500, color:"rgba(245,239,230,0.85)" }}>Establish your clarity baseline.</div>
            </div>
          </div>
        </div>
        <div style={{ flex:1 }}/>
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
          <p style={{ fontFamily:T.serif, fontSize:24, fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.35, margin:0, maxWidth:340 }}>We are more engaged when we feel inside the story.</p>
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
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Storytelling in the Wild</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:380, marginBottom:28, lineHeight:1.2 }}>Stories create empathy. Empathy creates trust. Trust creates influence.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ ...LP_BODY, fontSize:15, maxWidth:340 }}>The same facts — told as a story — land 22× more powerfully in the human brain.</p>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"flex-end", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 20%, rgba(138,158,132,0.08) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,4,0.98) 0%, rgba(10,8,4,0.3) 55%, transparent 80%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>The Pixar Framework Challenge™</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:340, lineHeight:1.2, marginBottom:16 }}>Turn a real experience into a story people remember.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65, marginBottom:0 }}>Seven beats. Five minutes. One story you can use in presentations, interviews, meetings, and conversations.</p>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        {/* Book image fills the panel */}
        <img src="/d8-story-book.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 60%" }}/>
        {/* Dark gradient: heavy at top and bottom, lighter in middle to let the book shine */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(10,8,5,0.72) 0%, rgba(10,8,5,0.25) 40%, rgba(10,8,5,0.3) 60%, rgba(10,8,5,0.88) 100%)" }}/>
        {/* Spacer — lets the book image breathe */}
        <div style={{ flex:1 }}/>
        {/* Bottom: editorial label + headline */}
        <div style={{ position:"relative", zIndex:2, padding:"0 44px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ fontFamily:T.sans, fontSize:9, fontWeight:700, color:"rgba(200,168,76,0.7)", textTransform:"uppercase", letterSpacing:"4px", marginBottom:24 }}>The Story Architect</div>
          <h2 style={{ fontFamily:T.serif, fontSize:"clamp(28px,2.6vw,42px)", fontWeight:500, color:"rgba(245,239,230,0.93)", lineHeight:1.1, letterSpacing:"-1px", margin:"0 0 20px" }}>Build a story<br/>that moves people.</h2>
          <div style={{ width:28, height:1, background:"rgba(200,168,76,0.45)", marginBottom:20 }}/>
          <p style={{ fontFamily:T.sans, fontSize:13, fontWeight:300, color:"rgba(245,239,230,0.45)", lineHeight:1.7, maxWidth:280, margin:0 }}>Craft stories that inspire action<br/>and drive meaningful impact.</p>
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
        <img src="/day9-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
        {d9Overlay}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.7s ease both" }}>
          {d9Label("The Missing Skill")}
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, marginBottom:16, lineHeight:1.2 }}>How to make people feel understood.</p>
          <div style={{ width:32, height:1, background:T.gold, opacity:0.45 }}/>
        </div>
      </div>
    );
    if (step === "Theory") return (
      <div style={d9Dark}>
        <img src="/day9-theory.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
        {d9Overlay}
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          {d9Label("The Science of Connection")}
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:380, lineHeight:1.2, marginBottom:16 }}>Speak to people the way they need to be spoken to.</p>
          <div style={{ width:32, height:1, background:T.gold, opacity:0.45 }}/>
        </div>
      </div>
    );
    if (step === "Example") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          {d9Label("Connection in Action")}
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>The most connected people listen more than they speak.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        </div>
      </div>
    );
    if (step === "Practice") return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 25%, rgba(138,158,132,0.08) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,4,0.98) 0%, rgba(10,8,4,0.3) 55%, transparent 80%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          {d9Label("Build Your Connection Habits")}
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:340, lineHeight:1.2, marginBottom:16 }}>Five exercises. Build the habits of the world's most connected communicators.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        </div>
      </div>
    );
    if (step === "Simulation") return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          {d9Label("The Rapport Builder")}
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Four conversations. Four personalities. Build genuine rapport.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
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
      ) : isD12 ? (
        <img src="/day12-insight.jpg" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
      ) : isD13 ? (
        <img src="/day13-insight.jpg" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
      ) : isD14 ? (
        <img src="/day14-insight.jpg" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }}
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
    if (isD14) return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
        <img src="/day14-theory.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.15)" }}/>
      </div>
    );
    if (isD11) return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
        <img src="/d11-theory.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.20)" }}/>
      </div>
    );
    if (isD12) return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
        <img src="/day12-theory.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 50%" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.25)" }}/>
      </div>
    );
    if (isD13) return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <img src="/day13-theory.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.45)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 50%, transparent 75%)" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>The Science of Exposure</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Why visibility shapes careers more than most people realise.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        </div>
      </div>
    );
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
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Voice in Action</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Range creates engagement. Contrast creates emotion.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>The most compelling voices are the most controlled — and the most dynamic.</p>
        </div>
      </div>
    );
    if (isD5) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>PRE in Action</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Point. Reason. Example. The architecture of every great professional answer.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>The world's most effective communicators all follow the same structure — whether they name it or not.</p>
        </div>
      </div>
    );
    if (isD6) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Masters Under Pressure</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Composure is a skill. The calmest person in the room shapes the room.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>How elite communicators handle the conversations most people avoid.</p>
        </div>
      </div>
    );
    if (isD11) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Iconic Brands</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Brand isn't what you say about yourself. It's what others say when you're not there.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Three people whose personal brands became cultural forces — by design, not accident.</p>
        </div>
      </div>
    );
    if (isD12) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Presence in the Wild</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>The strongest communicators make people feel calm, engaged, and connected.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>How great communicators use gestures, stillness, and grounded energy to create presence.</p>
        </div>
      </div>
    );
    if (isD14) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Great Communicators Are Made</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>None of them started where they finished. The same process is available to you.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Three communicators who changed the world — one deliberate choice at a time.</p>
        </div>
      </div>
    );
    if (isD13) return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <img src="/day13-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.42)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 50%, transparent 75%)" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>The Career Multiplier</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Performance gets you in the door. Exposure opens the next one.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Communication creates capability. Exposure creates opportunity.</p>
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
    if (isD14) return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 30%, rgba(200,168,76,0.07) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 20% 80%, rgba(138,158,132,0.05) 0%, transparent 50%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Day 14 · Your Practice</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>One conversation. Use everything you've built.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        </div>
      </div>
    );
    if (isD2) return (
      <div style={{ height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <img src="/d2-practice.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.55)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.92) 0%, transparent 55%)" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Train Your Instrument</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Four exercises. One goal: deliberate vocal control.</p>
        </div>
      </div>
    );
    if (isD5) return (
      <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>The PRE Card Sort™</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Sort the cards. Train the instinct.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Four scenarios. Three cards each. Identify the Point, Reason, and Example — and build the reflex to structure any answer.</p>
        </div>
      </div>
    );
    if (isD13) return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"flex-end", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 25%, rgba(138,158,132,0.08) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,4,0.98) 0%, rgba(10,8,4,0.3) 55%, transparent 80%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Make Your Value Visible</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:340, lineHeight:1.2, marginBottom:16 }}>Four exercises. One goal: make your value impossible to ignore.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        </div>
      </div>
    );
    if (isD12) return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"flex-end", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 60% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,4,0.98) 0%, rgba(10,8,4,0.3) 55%, transparent 80%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>The Presence Challenge</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:340, lineHeight:1.2, marginBottom:16 }}>Seven rounds. Every physical signal that shapes how communication lands.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        </div>
      </div>
    );
    if (isD11) return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"flex-end", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 25%, rgba(138,158,132,0.08) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,4,0.98) 0%, rgba(10,8,4,0.3) 55%, transparent 80%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Build Your Brand</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:340, lineHeight:1.2, marginBottom:16 }}>Three exercises. Three layers of your brand architecture.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        </div>
      </div>
    );
    if (isD6) return (
      <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"flex-end", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 25%, rgba(138,158,132,0.07) 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,4,0.98) 0%, rgba(10,8,4,0.3) 55%, transparent 80%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>The Composure Challenge</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:340, lineHeight:1.2, marginBottom:16 }}>Stay calm. Stay clear. The strongest communicator in the room is the calmest.</p>
          <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        </div>
      </div>
    );
    return (
      <div style={{ position: "relative", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,5,0.65)" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,8,5,0.98) 0%, transparent 60%)" }}/>
        <div style={{ position: "relative", zIndex: 2, padding: "40px 48px", animation: "fadeUp 0.6s ease both" }}>
          <div style={{ ...LP_LABEL, marginBottom: 16 }}>Your Practice</div>
          <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>{lesson.practice.split('.')[0]}.</p>
        </div>
      </div>
    );
  }
   // ── Simulation — D2 gets cinematic panel; others get scenario ───────────────
  if (step === "Simulation" && isD2) return (
    <div style={{ background:"#0E0B08", height:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Real-World Voice Coaching</div>
        <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>This is where voice training becomes real.</p>
        <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Choose your scenario. Speak. Get coached on pace, pauses, clarity, and presence.</p>
      </div>
    </div>
  );
   if (step === "Simulation" && isD6) return (
    <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>AI Conversation Prep</div>
        <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Prepare for the conversations that matter most.</p>
        <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Tell the AI who you're meeting and why. It generates the 10 toughest questions you're likely to face — then coaches your responses.</p>
      </div>
    </div>
  );
   if (step === "Simulation" && isD14) return (
    <div style={{ height:"100%", background:"#0A0804", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 30%, rgba(200,168,76,0.08) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Your Communication Blueprint</div>
        <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,34px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:380 }}>Build the system you'll use for the rest of your career.</p>
        <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Your archetype. Your brand statement. Your 90-day plan.</p>
      </div>
    </div>
  );
   if (step === "Simulation" && isD13) return (
    <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>The Promotion Room</div>
        <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>You're not in the room. Find out what they're saying — and change it.</p>
        <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Profile yourself, identify your exposure gaps, and build the strategy to make your value impossible to ignore.</p>
      </div>
    </div>
  );
   if (step === "Simulation" && isD12) return (
    <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Presence — In Action</div>
        <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Record. Review. See how you communicate.</p>
        <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Choose a prompt. Record yourself naturally. Your digital coach analyses your presence and provides personalised feedback.</p>
      </div>
    </div>
  );
   if (step === "Simulation" && isD5) return (
    <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>PRE Challenge</div>
        <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Real questions. Real coaching.</p>
        <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Type your Point, Reason, and Example for each question. Your AmplifyU coach scores the clarity of every component.</p>
      </div>
    </div>
  );
   if (step === "Simulation" && isD11) return (
    <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
        <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Brand — In Action</div>
        <p style={{ ...LP_HEADING, fontSize:"clamp(24px,2vw,34px)", maxWidth:360, lineHeight:1.2, marginBottom:16 }}>Your brand is built in every room you enter. Shape it.</p>
        <div style={{ width:40, height:1.5, background:"rgba(138,158,132,0.5)" }}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Find the gap between how you're seen and how you want to be known — then close it.</p>
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

