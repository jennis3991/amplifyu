import { useState, useEffect } from 'react';
import { T } from '../theme.js';
import { ROLES } from '../data.js';
import { useIsDesktop } from '../utils.js';

export function ReflectionScreen({ answers, onContinue }) {
  const isDesktop = useIsDesktop();
  const [reflection, setReflection] = useState(null);
  const [section,    setSection]    = useState(0);
  const role = ROLES.find(r => r.id === answers.role);

  const challengeLabel = answers.challenge || "communicating with impact";
  const contextLabel   = answers.context   || "building influence and presence";
  const levelLabel     = answers.level     || "ready to go further";
  const roleLabel      = role ? role.label : "professional";

  // ── Derive profile attributes from answers (no API needed) ───────────────
  const focusAreaMap = {
    "Speaking up confidently with senior leaders.":   ["Executive Presence", "Confidence"],
    "Speaking up confidently with senior leaders":    ["Executive Presence", "Confidence"],
    "Structuring my thoughts clearly under pressure.":["Clarity & Structure", "Precision Editing"],
    "Structuring my thoughts under pressure":         ["Clarity & Structure", "Precision Editing"],
    "Making my work visible — and getting credit for it.": ["Visibility", "Personal Brand"],
    "Promoting my work and making it visible":        ["Visibility", "Personal Brand"],
    "Setting boundaries and asserting myself.":       ["Assertiveness", "Executive Authority"],
    "Setting boundaries and asserting myself":        ["Assertiveness", "Executive Authority"],
    "Influencing and communicating with real impact.":["Influence", "Strategic Communication"],
    "Influencing and communicating with impact":      ["Influence", "Strategic Communication"],
    "Building a personal brand and presence that lasts.": ["Personal Brand", "Presence"],
    "Building my personal brand and presence":        ["Personal Brand", "Presence"],
    "Telling stories that make people lean in.":      ["Storytelling", "Narrative Craft"],
    "Telling stories that land":                      ["Storytelling", "Narrative Craft"],
    "Navigating high-stakes conversations with confidence.": ["High-Stakes Composure", "Confidence"],
    "Navigating high-stakes conversations":           ["High-Stakes Composure", "Confidence"],
  };

  const rawAreas = [
    ...(focusAreaMap[challengeLabel] || ["Communication Clarity"]),
    ...(focusAreaMap[contextLabel]   || ["Presence"]),
    "Structured Thinking",
  ];
  const focusAreas = [...new Set(rawAreas)].slice(0, 5);

  const tendencyMap = {
    "I stay quiet when I should speak up.":       { label: "The Quiet Expert",        sub: "Depth and capability waiting to be heard." },
    "I stay quiet when I should speak up":        { label: "The Quiet Expert",        sub: "Depth and capability waiting to be heard." },
    "I speak but don't always land my point.":    { label: "The Active Voice",        sub: "Energy and presence — refining precision." },
    "I speak but don't always land my point":     { label: "The Active Voice",        sub: "Energy and presence — refining precision." },
    "I land my points but lack consistent presence.": { label: "The Capable Communicator", sub: "Competent and credible — ready for more." },
    "I land my points but lack consistent presence": { label: "The Capable Communicator", sub: "Competent and credible — ready for more." },
    "I'm already strong. I want to go to the next level.": { label: "The High Performer", sub: "Strong foundation. Optimising for excellence." },
    "I'm strong — I want to go to the next level": { label: "The High Performer", sub: "Strong foundation. Optimising for excellence." },
  };
  const tendency = tendencyMap[levelLabel] || { label: "The Growth Professional", sub: "Ready to build. Ready to lead." };

  const pieEmphasis = role ? (role.pieEmphasis || ["Performance","Image","Exposure"]) : ["Performance","Image","Exposure"];

  // ── Build fallback text from answers (instant, no API) ───────────────────
  const fallbackReflection = {
    summary: "Here is what we are seeing — you want to " + contextLabel.toLowerCase().replace(/^telling /,"tell ").replace(/^building /,"build ").replace(/^influencing /,"influence ").replace(/^navigating /,"navigate ").replace(/\.$/, "").replace(/\bmy\b/g,"your").replace(/\bmyself\b/g,"yourself") + ", but " + challengeLabel.toLowerCase().replace(/\.$/, "").replace(/\bmy\b/g,"your").replace(/\bmyself\b/g,"yourself") + " is standing in the way. That gap between your capability and how you're showing up is exactly where AmplifyU works. You already have more than most people start with.",
    motivation: "The fact that you can name what's holding you back means you're thinking more clearly about this than most. " + (answers.role === "senior" ? "At your level, the difference between good and exceptional is almost never about knowledge — it's about how you land what you know." : "The skills you're building — clarity, presence, story — are the ones that open the doors that matter.") + " Your growth in this area will compound in ways you can't yet see.",
    forward: "Here is where we will take you — 14 sessions built for someone at your stage, with scenarios drawn from your world as " + roleLabel + ". You will build the communication habits, personal brand, and visibility that turn your real capability into the career you are ready for.",
  };

  // ── Reveal content using computed profile (personalised from quiz answers) ─
  useEffect(() => {
    setReflection(fallbackReflection);
    setTimeout(() => setSection(1), 150);
    setTimeout(() => setSection(2), 600);
    setTimeout(() => setSection(3), 1100);
    setTimeout(() => setSection(4), 1600);
  }, []);

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {

    // Right panel — always rendered, uses computed data (no API wait)
    const RightPanel = () => (
      <div style={{
        width: 380, flexShrink: 0,
        padding: "64px 48px 64px 40px",
        display: "flex", flexDirection: "column", gap: 24,
        background: T.surface,
        borderLeft: "1px solid " + T.divider,
        overflowY: "auto",
      }}>
        {/* Profile label */}
        <div>
          <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3.5px", marginBottom: 20, fontFamily: T.sans }}>
            Your Profile
          </div>
          {role && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", background: "rgba(138,158,132,0.08)", borderRadius: 5, border: "1px solid rgba(138,158,132,0.18)", marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>{role.icon}</span>
              <span style={{ fontFamily: T.serif, fontSize: 14, color: T.text, letterSpacing: "-0.2px" }}>{role.label}</span>
            </div>
          )}
        </div>

        {/* Communication Tendency */}
        <div style={{ padding: "20px 22px", background: T.cardDark, borderRadius: 8, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + T.gold + " 0%, rgba(138,158,132,0.1) 100%)" }}/>
          <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 10, fontFamily: T.sans }}>Communication Style</div>
          <div style={{ fontFamily: T.serif, fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.92)", marginBottom: 6, letterSpacing: "-0.2px" }}>{tendency.label}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", lineHeight: 1.55, fontFamily: T.sans }}>{tendency.sub}</div>
        </div>

        {/* Focus Areas */}
        <div>
          <div style={{ fontSize: 9, color: T.text3, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 14, fontFamily: T.sans }}>Development Focus</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {focusAreas.map((area, i) => (
              <div key={area} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "13px 0",
                borderBottom: i < focusAreas.length - 1 ? "1px solid " + T.divider : "none",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, flexShrink: 0, opacity: 0.8 }}/>
                <span style={{ fontFamily: T.serif, fontSize: 15, color: T.text, letterSpacing: "-0.2px" }}>{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Programme preview */}
        <div style={{ borderTop: "1px solid " + T.divider, paddingTop: 20 }}>
          <div style={{ fontSize: 9, color: T.text3, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 12, fontFamily: T.sans }}>Your Programme</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "14 sessions", sub: "One per day, ~15 minutes each" },
              { label: "Day 1 ready", sub: "Speak Simply — your first session" },
              { label: "Tailored scenarios", sub: role ? "Built for " + role.label : "Role-specific practice" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.gold, flexShrink: 0, marginTop: 6, opacity: 0.6 }}/>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text, fontFamily: T.sans }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: T.text3, fontFamily: T.sans }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    // Left panel — content
    return (
      <div style={{ height: "100vh", display: "flex", fontFamily: T.sans, background: "#000000", overflow: "hidden" }} className="au-grain-wrap">
        {/* ── LEFT: The Coaching Narrative ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "72px 72px 64px", display: "flex", flexDirection: "column" }}>
          {/* Brand mark */}
          <div style={{ fontSize: 13, color: T.gold, textTransform: "uppercase", letterSpacing: "5px", marginBottom: 52, fontFamily: T.sans }}>AmplifyU</div>

          {/* Headline */}
          {section >= 0 && (
            <div style={{ marginBottom: 48 }} className="au-step-enter">
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "3.5px", marginBottom: 16, fontFamily: T.sans }}>Your communication profile</div>
              <h1 style={{ fontFamily: T.serif, fontSize: "clamp(34px, 3.5vw, 54px)", fontWeight: 500, color: "rgba(255,255,255,0.93)", lineHeight: 1.08, letterSpacing: "-1.5px", margin: 0 }}>
                Here's what<br/>we're seeing.
              </h1>
            </div>
          )}

          {/* Section 1 — Summary */}
          {section >= 1 && reflection && (
            <div style={{ marginBottom: 40, animation: "fadeUp 0.7s ease both" }}>
              <div style={{ width: 28, height: 1, background: T.gold, marginBottom: 20, opacity: 0.5 }}/>
              <p style={{ fontFamily: T.serif, fontSize: "clamp(16px, 1.7vw, 20px)", color: "rgba(255,255,255,0.82)", lineHeight: 1.7, letterSpacing: "-0.2px", margin: 0 }}>
                {reflection.summary}
              </p>
            </div>
          )}

          {/* Section 2 — Motivation (pull quote) */}
          {section >= 2 && reflection && (
            <div style={{ marginBottom: 40, animation: "fadeUp 0.7s ease both", position: "relative" }}>
              {/* Large decorative mark */}
              <div style={{ fontFamily: T.serif, fontSize: 96, lineHeight: 0.6, color: "rgba(138,158,132,0.1)", position: "absolute", top: -8, left: -12, userSelect: "none" }}>"</div>
              <div style={{ borderLeft: "2px solid rgba(138,158,132,0.3)", paddingLeft: 28, position: "relative", zIndex: 1 }}>
                <p style={{ fontFamily: T.serif, fontSize: "clamp(17px, 1.6vw, 21px)", fontStyle: "italic", color: "rgba(255,255,255,0.72)", lineHeight: 1.75, margin: 0, letterSpacing: "-0.1px" }}>
                  {reflection.motivation}
                </p>
              </div>
            </div>
          )}

          {/* Section 3 — Forward */}
          {section >= 3 && reflection && (
            <div style={{ marginBottom: 48, animation: "fadeUp 0.7s ease both" }}>
              <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 16, fontFamily: T.sans }}>The path ahead</div>
              <p style={{ fontSize: "clamp(15px, 1.4vw, 17px)", color: "rgba(255,255,255,0.78)", lineHeight: 1.8, margin: 0, fontFamily: T.sans, fontWeight: 400 }}>
                {reflection.forward}
              </p>
            </div>
          )}

          {/* Section 4 — CTA */}
          {section >= 4 && (
            <div style={{ animation: "fadeUp 0.7s ease both", marginTop: "auto", paddingTop: 16 }}>
              <div style={{ height: 1, background: "linear-gradient(90deg, rgba(138,158,132,0.3) 0%, transparent 100%)", marginBottom: 36 }}/>
              <p style={{ fontFamily: T.serif, fontSize: 19, fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.4, marginBottom: 32, letterSpacing: "-0.3px" }}>
                This is your moment.{" "}<span style={{ color: T.gold }}>AMPLIFYU.</span>
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button onClick={onContinue} className="au-cta" style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "16px 36px", borderRadius: 6, border: "none",
                  background: T.gold, color: "white",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  fontFamily: T.sans, letterSpacing: "0.2px",
                  boxShadow: "0 4px 24px rgba(138,158,132,0.35)",
                }}>
                  <span>Begin Day 1</span>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", fontFamily: T.sans }}>~15 minutes · Your first session is ready</span>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Profile Panel ── */}
        <RightPanel/>
      </div>
    );
  }

  // ── MOBILE (original, preserved) ─────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#000000", fontFamily:T.sans, display:"flex", flexDirection:"column", overflowY:"auto" }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes goldPulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
      `}</style>
      <div style={{ padding:"52px 24px 0", flexShrink:0 }}>
        <div style={{ fontSize:14,color:T.gold,textTransform:"uppercase",letterSpacing:"3px",marginBottom:16,fontFamily:T.sans }}>AmplifyU</div>
        <div>
          <div style={{ fontSize:13,color:"rgba(255,255,255,0.75)",textTransform:"uppercase",letterSpacing:"3.5px",marginBottom:14,fontFamily:T.sans }}>Your communication profile</div>
          <h1 style={{ fontFamily:T.serif,fontSize:34,fontWeight:500,color:"rgba(255,255,255,0.93)",lineHeight:1.08,letterSpacing:"-1px",margin:0 }}>Here's what<br/>we're seeing.</h1>
          {role && <div style={{ fontSize:10,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginTop:14,fontFamily:T.sans }}>{role.label}</div>}
        </div>
      </div>
      {reflection && (
        <div style={{ padding:"28px 24px 0",display:"flex",flexDirection:"column",gap:20,flex:1 }}>
          {/* Section 1 — Summary */}
          {section >= 1 && (<div style={{ animation:"sectionFade 0.6s ease both" }}>
            <div style={{ width:24,height:1,background:T.gold,marginBottom:18,opacity:0.5 }}/>
            <p style={{ fontFamily:T.serif,fontSize:17,color:"rgba(255,255,255,0.82)",lineHeight:1.72,margin:0,letterSpacing:"-0.1px" }}>{reflection.summary}</p>
          </div>)}
          {/* Section 2 — Motivation (pull quote) */}
          {section >= 2 && (<div style={{ animation:"sectionFade 0.6s ease both",position:"relative" }}>
            <div style={{ fontFamily:T.serif,fontSize:72,lineHeight:0.6,color:"rgba(138,158,132,0.1)",position:"absolute",top:-4,left:-8,userSelect:"none" }}>"</div>
            <div style={{ borderLeft:"2px solid rgba(138,158,132,0.3)",paddingLeft:20,position:"relative",zIndex:1 }}>
              <p style={{ fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:"rgba(255,255,255,0.72)",lineHeight:1.75,margin:0,letterSpacing:"-0.1px" }}>{reflection.motivation}</p>
            </div>
          </div>)}
          {/* Section 3 — Path ahead */}
          {section >= 3 && (<div style={{ animation:"sectionFade 0.6s ease both" }}>
            <div style={{ fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"3px",marginBottom:12,fontFamily:T.sans }}>The path ahead</div>
            <p style={{ fontFamily:T.sans,fontSize:16,color:"rgba(255,255,255,0.78)",lineHeight:1.8,margin:0,fontWeight:400 }}>{reflection.forward}</p>
          </div>)}
          {/* Section 4 — CTA */}
          {section >= 4 && (<div style={{ animation:"sectionFade 0.6s ease both",paddingBottom:52 }}>
            <div style={{ height:1,background:"linear-gradient(90deg,rgba(138,158,132,0.3) 0%,transparent 100%)",marginBottom:24 }}/>
            <p style={{ fontFamily:T.serif,fontSize:18,fontWeight:500,color:"rgba(255,255,255,0.85)",lineHeight:1.4,marginBottom:28,letterSpacing:"-0.3px" }}>This is your moment.{" "}<span style={{ color:T.gold }}>AmplifyU.</span></p>
            <button onClick={onContinue} style={{ width:"100%",padding:"16px 24px",borderRadius:6,border:"none",background:T.gold,color:"white",fontSize:15,fontFamily:T.sans,fontWeight:600,cursor:"pointer",letterSpacing:"0.2px" }}>
              Begin Day 1 →
            </button>
            <p style={{ fontSize:14,color:"rgba(255,255,255,0.72)",textAlign:"center",marginTop:12,fontFamily:T.sans }}>~15 minutes · Your first session is ready</p>
          </div>)}
        </div>
      )}
    </div>
  );
}

// ─── ONBOARDING 
// ─── THE THRESHOLD ────────────────────────────────────────────────────────────
// Onboarding redesign: "A cinematic entrance, not a form."
// Desktop: full-viewport split-panel immersion.
// Mobile: elegant single-column retained from before.
// Philosophy: statements, not options. Atmosphere, not structure.
//             One question. One breath. One choice. Then the next.
