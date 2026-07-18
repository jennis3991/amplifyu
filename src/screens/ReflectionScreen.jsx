import { useState, useEffect } from 'react';
import { T } from '../theme.js';
import { ROLES } from '../data.js';
import { useIsDesktop } from '../utils.js';

export function ReflectionScreen({ answers, onContinue }) {
  const isDesktop = useIsDesktop();
  const [reflection, setReflection] = useState(null);
  const [section, setSection] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const role = ROLES.find(r => r.id === answers.role);

  const challengeLabel = answers.challenge || "communicating with impact";
  const contextLabel   = answers.context   || "building influence and presence";
  const levelLabel     = answers.level     || "ready to go further";
  const roleLabel      = role ? role.label : "professional";

  const focusAreaMap = {
    "Speaking up confidently with senior leaders.":        ["Executive Presence", "Clarity & Structure"],
    "Speaking up confidently with senior leaders":         ["Executive Presence", "Clarity & Structure"],
    "Structuring my thoughts clearly under pressure.":     ["Clarity & Structure", "Executive Presence"],
    "Structuring my thoughts under pressure":              ["Clarity & Structure", "Executive Presence"],
    "Making my work visible — and getting credit for it.": ["Visibility", "Personal Brand"],
    "Promoting my work and making it visible":             ["Visibility", "Personal Brand"],
    "Setting boundaries and asserting myself.":            ["Assertiveness", "Presence"],
    "Setting boundaries and asserting myself":             ["Assertiveness", "Presence"],
    "Influencing and communicating with real impact.":     ["Influence", "Storytelling"],
    "Influencing and communicating with impact":           ["Influence", "Storytelling"],
    "Building a personal brand and presence that lasts.":  ["Personal Brand", "Visibility"],
    "Building my personal brand and presence":             ["Personal Brand", "Visibility"],
    "Telling stories that make people lean in.":           ["Storytelling", "Influence"],
    "Telling stories that land":                           ["Storytelling", "Influence"],
    "Navigating high-stakes conversations with confidence.":["High-Stakes Composure", "Assertiveness"],
    "Navigating high-stakes conversations":                ["High-Stakes Composure", "Assertiveness"],
  };

  const rawAreas = [
    ...(focusAreaMap[challengeLabel] || ["Communication Clarity"]),
    ...(focusAreaMap[contextLabel]   || ["Presence"]),
  ];
  const focusAreas = [...new Set(rawAreas)].slice(0, 4);

  const tendencyMap = {
    "I stay quiet when I should speak up.":                 { label: "The Quiet Expert",        sub: "Depth and capability waiting to be heard." },
    "I stay quiet when I should speak up":                  { label: "The Quiet Expert",        sub: "Depth and capability waiting to be heard." },
    "I speak but don't always land my point.":              { label: "The Active Voice",        sub: "Energy and presence — refining precision." },
    "I speak but don't always land my point":               { label: "The Active Voice",        sub: "Energy and presence — refining precision." },
    "I land my points but lack consistent presence.":       { label: "The Capable Communicator",sub: "Competent and credible — ready for more." },
    "I land my points but lack consistent presence":        { label: "The Capable Communicator",sub: "Competent and credible — ready for more." },
    "I'm already strong. I want to go to the next level.": { label: "The High Performer",      sub: "Strong foundation. Optimising for excellence." },
    "I'm strong — I want to go to the next level":         { label: "The High Performer",      sub: "Strong foundation. Optimising for excellence." },
  };
  const tendency = tendencyMap[levelLabel] || { label: "The Growth Professional", sub: "Ready to build. Ready to lead." };

  // Programme focus weights — derived from focus area priority order
  const focusWeightsBySize = { 5:[30,25,20,15,10], 4:[35,28,22,15], 3:[45,35,20], 2:[60,40] };
  const focusWeights = focusWeightsBySize[focusAreas.length] || focusWeightsBySize[4];
  const programmeWeights = focusAreas.map((area, i) => ({ area, weight: focusWeights[i] || 10 }));

  // Outcome cards — "By Day 14 you will be able to..." framing
  const outcomeMap = {
    "Executive Presence":      { icon: "◆", title: "Command the room",          sub: "Speak with authority in any environment, at any level" },
    "Confidence":              { icon: "●", title: "Back yourself",              sub: "Communicate with conviction and inner confidence" },
    "Clarity & Structure":     { icon: "▲", title: "Make your point land",       sub: "Structured, clear thinking under any pressure" },
    "Precision Editing":       { icon: "◈", title: "Say more with less",         sub: "Cut to what matters and make every word count" },
    "Visibility":              { icon: "◎", title: "Be seen for your work",      sub: "Make your impact visible to the people who matter" },
    "Personal Brand":          { icon: "✦", title: "Own your presence",          sub: "Build a reputation that works for you in every room" },
    "Assertiveness":           { icon: "→", title: "Hold your ground",           sub: "Communicate directly, confidently and without apology" },
    "Executive Authority":     { icon: "◆", title: "Lead with weight",           sub: "Carry natural authority in every conversation" },
    "Influence":               { icon: "◈", title: "Move people forward",        sub: "Shape decisions and earn buy-in that lasts" },
    "Strategic Communication": { icon: "▲", title: "Land your message",          sub: "Communicate with intention and strategic precision" },
    "Storytelling":            { icon: "◎", title: "Tell stories that stick",    sub: "Make people lean in and remember what you said" },
    "Narrative Craft":         { icon: "✦", title: "Shape how people see things",sub: "Craft stories that shift perspective and drive action" },
    "High-Stakes Composure":   { icon: "●", title: "Stay sharp under pressure",  sub: "Navigate tough conversations with calm clarity" },
    "Presence":                { icon: "◆", title: "Command attention",          sub: "Become someone people remember and trust" },
    "Communication Clarity":   { icon: "◎", title: "Get your point across",      sub: "With clarity, structure and real impact every time" },
  };
  const outcomeCards = focusAreas.slice(0, 4).map(area => ({
    area,
    ...(outcomeMap[area] || { icon: "◈", title: area, sub: "A skill you will master" }),
  }));

  // 2 goal cards for right panel
  const goalCards = [
    { label: "Your challenge", text: challengeLabel.replace(/\.$/, "") },
    { label: "Your ambition",  text: contextLabel.replace(/\.$/, "") },
  ];

  // Reflection text (quiz-derived, no API)
  const fallbackReflection = {
    summary: "Here is what we are seeing — you want to " + contextLabel.toLowerCase().replace(/^telling /,"tell ").replace(/^building /,"build ").replace(/^influencing /,"influence ").replace(/^navigating /,"navigate ").replace(/\.$/, "").replace(/\bmy\b/g,"your").replace(/\bmyself\b/g,"yourself") + ", but " + challengeLabel.toLowerCase().replace(/\.$/, "").replace(/\bmy\b/g,"your").replace(/\bmyself\b/g,"yourself") + " is standing in the way. That gap between your capability and how you're showing up is exactly where AmplifyU works. You already have more than most people start with.",
    motivation: "The fact that you can name what's holding you back means you're thinking more clearly about this than most. " + (answers.role === "senior" ? "At your level, the difference between good and exceptional is almost never about knowledge — it's about how you land what you know." : "The skills you're building — clarity, presence, story — are the ones that open the doors that matter.") + " Your growth in this area will compound in ways you can't yet see.",
    forward: "Here is where we will take you — 14 sessions built for someone at your stage, with scenarios drawn from your world as " + roleLabel + ". You will build the communication habits, personal brand, and visibility that turn your real capability into the career you are ready for.",
  };

  useEffect(() => {
    setReflection(fallbackReflection);
    setTimeout(() => setSection(1), 150);
    setTimeout(() => setSection(2), 800);
  }, []);


  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ height: "100vh", display: "flex", fontFamily: T.sans, background: T.bg, overflow: "hidden" }}>
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        `}</style>

        {/* LEFT: main content */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Banner image — cropped to hero section only */}
          <div style={{ width: "100%", height: 300, flexShrink: 0, overflow: "hidden" }}>
            <img src="/profile-banner.png" alt="" style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "top" }}/>
          </div>

          <div style={{ padding: "52px 72px 120px", display: "flex", flexDirection: "column" }}>

          {/* Brand */}
          <div style={{ fontSize: 11, color: T.gold, textTransform: "uppercase", letterSpacing: "4px", marginBottom: 52, fontFamily: T.sans }}>AmplifyU</div>

          {/* Header + Archetype badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, marginBottom: 40 }}>

            <div>
              <div style={{ fontSize: 11, color: T.text3, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 14, fontFamily: T.sans }}>Your communication profile</div>
              <h1 style={{ fontFamily: T.serif, fontSize: "clamp(32px,3vw,52px)", fontWeight: 500, color: T.ink, lineHeight: 1.08, letterSpacing: "-1.5px", margin: 0 }}>
                {"Here's what"}
                <br/>{"we're seeing."}
              </h1>
            </div>

            {/* Archetype badge — double-ring circle */}
            <div style={{ flexShrink: 0, width: 196, height: 196, borderRadius: "50%", border: "1px solid rgba(138,158,132,0.22)", padding: 9 }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%",
                background: "linear-gradient(145deg, #2C231A 0%, #1A150F 100%)",
                border: "1px solid rgba(138,158,132,0.5)",
                boxShadow: "inset 0 2px 20px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.25)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ fontSize: 7, color: "rgba(138,158,132,0.65)", textTransform: "uppercase", letterSpacing: "4px", fontFamily: T.sans, marginBottom: 11 }}>Your Type</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                  <div style={{ width: 18, height: 1, background: "rgba(138,158,132,0.45)" }}/>
                  <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(138,158,132,0.7)" }}/>
                  <div style={{ width: 18, height: 1, background: "rgba(138,158,132,0.45)" }}/>
                </div>
                <div style={{ fontFamily: T.serif, fontSize: 16, color: "rgba(255,255,255,0.93)", textAlign: "center", lineHeight: 1.28, padding: "0 24px", letterSpacing: "-0.2px" }}>{tendency.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12 }}>
                  <div style={{ width: 18, height: 1, background: "rgba(138,158,132,0.45)" }}/>
                  <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(138,158,132,0.7)" }}/>
                  <div style={{ width: 18, height: 1, background: "rgba(138,158,132,0.45)" }}/>
                </div>
              </div>
            </div>

          </div>

          {/* First paragraph — always visible */}
          {section >= 1 && reflection && (
            <div style={{ marginBottom: 20, animation: "fadeUp 0.6s ease both" }}>
              <div style={{ width: 24, height: 1, background: T.gold, marginBottom: 20, opacity: 0.6 }}/>
              <p style={{ fontFamily: T.serif, fontSize: "clamp(16px,1.6vw,19px)", color: T.ink, lineHeight: 1.78, letterSpacing: "-0.1px", margin: 0 }}>
                {reflection.summary}
              </p>
            </div>
          )}

          {/* Read more toggle */}
          {section >= 1 && (
            <div style={{ marginBottom: 44 }}>
              <button
                onClick={() => setExpanded(!expanded)}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.sans, fontSize: 13, color: T.gold, display: "flex", alignItems: "center", gap: 6, padding: "6px 0", letterSpacing: "0.2px" }}
              >
                {expanded ? "Read less ↑" : "Read more ↓"}
              </button>

              {expanded && reflection && (
                <div style={{ marginTop: 24 }}>
                  {/* Motivation pull quote */}
                  <div style={{ position: "relative", marginBottom: 28 }}>
                    <div style={{ fontFamily: T.serif, fontSize: 80, lineHeight: 0.6, color: "rgba(138,158,132,0.12)", position: "absolute", top: -8, left: -10, userSelect: "none" }}>{'"'}</div>
                    <div style={{ borderLeft: "2px solid " + T.gold, position: "absolute", left: 0, top: 0, bottom: 0, opacity: 0.5 }}/>
                    <div style={{ paddingLeft: 24, position: "relative", zIndex: 1 }}>
                      <p style={{ fontFamily: T.serif, fontSize: "clamp(15px,1.5vw,18px)", fontStyle: "italic", color: T.text2, lineHeight: 1.78, margin: 0 }}>
                        {reflection.motivation}
                      </p>
                    </div>
                  </div>
                  {/* Path ahead */}
                  <div>
                    <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 12, fontFamily: T.sans }}>The path ahead</div>
                    <p style={{ fontFamily: T.sans, fontSize: "clamp(14px,1.3vw,16px)", color: T.text2, lineHeight: 1.85, margin: 0, fontWeight: 400 }}>
                      {reflection.forward}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section divider */}
          {section >= 2 && (
            <div style={{ height: 1, background: T.border, marginBottom: 44, animation: "fadeUp 0.5s ease both" }}/>
          )}

          {/* Programme Focus bars */}
          {section >= 2 && (
            <div style={{ marginBottom: 48, animation: "fadeUp 0.6s ease both" }}>
              <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 8, fontFamily: T.sans }}>Programme Focus</div>
              <div style={{ fontSize: 13, color: T.text2, marginBottom: 28, fontFamily: T.sans, lineHeight: 1.5 }}>Where your 14 sessions will focus — built around your goals and profile.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {programmeWeights.map(({ area, weight }) => (
                  <div key={area}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                      <span style={{ fontFamily: T.serif, fontSize: 15, color: T.ink, letterSpacing: "-0.1px" }}>{area}</span>
                      <span style={{ fontSize: 11, color: T.text3, fontFamily: T.sans }}>{weight + "%"}</span>
                    </div>
                    <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: weight + "%", background: T.gold, borderRadius: 2 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By Day 14 outcome cards */}
          {section >= 2 && (
            <div style={{ marginBottom: 40, animation: "fadeUp 0.7s ease both" }}>
              <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 8, fontFamily: T.sans }}>By Day 14</div>
              <div style={{ fontSize: 13, color: T.text2, marginBottom: 20, fontFamily: T.sans }}>{"You'll be able to..."}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {outcomeCards.map((o, i) => (
                  <div key={i} style={{ padding: "18px 20px", background: "white", borderRadius: 8, border: "1px solid " + T.border, borderTop: "2px solid " + T.gold, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 16, color: T.gold, lineHeight: 1 }}>{o.icon}</div>
                    <div style={{ fontFamily: T.serif, fontSize: 15, color: T.ink, letterSpacing: "-0.2px", lineHeight: 1.2 }}>{o.title}</div>
                    <div style={{ fontSize: 12, color: T.text2, fontFamily: T.sans, lineHeight: 1.5 }}>{o.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          </div>{/* end padded content */}
        </div>

        {/* RIGHT: profile panel — dark, static */}
        <div style={{ width: 360, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.08)", background: T.cardDark, overflow: "hidden", padding: "64px 40px 100px", display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Your Profile */}
          <div>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3.5px", marginBottom: 16, fontFamily: T.sans }}>Your Profile</div>
            {role && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(138,158,132,0.12)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", marginBottom: 14 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(138,158,132,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, filter: "brightness(0) invert(1)" }}>{role.icon}</span>
                </div>
                <span style={{ fontFamily: T.serif, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>{role.label}</span>
              </div>
            )}
            <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.05)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontFamily: T.sans, marginBottom: 4, textTransform: "uppercase", letterSpacing: "2px" }}>Communication Style</div>
              <div style={{ fontFamily: T.serif, fontSize: 15, color: "rgba(255,255,255,0.9)", marginBottom: 3 }}>{tendency.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: T.sans, lineHeight: 1.5 }}>{tendency.sub}</div>
            </div>
          </div>

          {/* Your Goals — 2 cards */}
          <div>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3.5px", marginBottom: 14, fontFamily: T.sans }}>Your Goals</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {goalCards.map((g, i) => (
                <div key={i} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 7, borderLeft: "2px solid " + T.gold, border: "1px solid rgba(255,255,255,0.07)", borderLeftWidth: 2, borderLeftColor: T.gold }}>
                  <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 6, fontFamily: T.sans }}>{g.label}</div>
                  <div style={{ fontFamily: T.serif, fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.6 }}>{g.text}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
        {/* Floating CTA — fixed bottom right */}
        <button onClick={onContinue} className="au-cta" style={{ position: "fixed", bottom: 32, right: 32, zIndex: 200, display: "flex", alignItems: "center", gap: 10, padding: "15px 36px", borderRadius: 10, border: "1px solid #A8957F", background: "#C4B09A", color: "#1a1510", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.sans, letterSpacing: "0.3px", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>
          <span>{"Let's Begin"}</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#1a1510" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    );
  }

  // ── MOBILE ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.sans, display: "flex", flexDirection: "column", paddingBottom: 90 }}>
      <style>{`@keyframes sectionFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Banner image — cropped to hero section only */}
      <div style={{ width: "100%", height: 200, overflow: "hidden", flexShrink: 0 }}>
        <img src="/profile-banner.png" alt="" style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "top" }}/>
      </div>

      {/* Header */}
      <div style={{ padding: "32px 24px 0" }}>
        <div style={{ fontSize: 12, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 16, fontFamily: T.sans }}>AmplifyU</div>
        <div style={{ fontSize: 11, color: T.text3, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 14, fontFamily: T.sans }}>Your communication profile</div>
        <h1 style={{ fontFamily: T.serif, fontSize: 34, fontWeight: 500, color: T.ink, lineHeight: 1.08, letterSpacing: "-1px", margin: 0 }}>
          {"Here's what"}
          <br/>{"we're seeing."}
        </h1>
        {role && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 14, padding: "6px 12px", background: T.goldLight, borderRadius: 5, border: "1px solid " + T.border }}>
            <span style={{ fontSize: 13 }}>{role.icon}</span>
            <span style={{ fontSize: 11, color: T.goldDark, textTransform: "uppercase", letterSpacing: "2px", fontFamily: T.sans }}>{role.label}</span>
          </div>
        )}
      </div>

      <div style={{ padding: "28px 24px 0", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* First paragraph — always visible */}
        {section >= 1 && reflection && (
          <div style={{ animation: "sectionFade 0.6s ease both" }}>
            <div style={{ width: 22, height: 1, background: T.gold, marginBottom: 18, opacity: 0.6 }}/>
            <p style={{ fontFamily: T.serif, fontSize: 17, color: T.ink, lineHeight: 1.75, margin: 0, letterSpacing: "-0.1px" }}>{reflection.summary}</p>
          </div>
        )}

        {/* Read more toggle */}
        {section >= 1 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.sans, fontSize: 13, color: T.gold, display: "flex", alignItems: "center", gap: 5, padding: 0 }}
            >
              {expanded ? "Read less ↑" : "Read more ↓"}
            </button>
            {expanded && reflection && (
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ borderLeft: "2px solid " + T.gold, paddingLeft: 18 }}>
                  <p style={{ fontFamily: T.serif, fontSize: 16, fontStyle: "italic", color: T.text2, lineHeight: 1.75, margin: 0 }}>{reflection.motivation}</p>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 10, fontFamily: T.sans }}>The path ahead</div>
                  <p style={{ fontFamily: T.sans, fontSize: 15, color: T.text2, lineHeight: 1.8, margin: 0 }}>{reflection.forward}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        {section >= 2 && <div style={{ height: 1, background: T.border }}/>}

        {/* Programme Focus bars */}
        {section >= 2 && (
          <div style={{ animation: "sectionFade 0.6s ease both" }}>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 8, fontFamily: T.sans }}>Programme Focus</div>
            <div style={{ fontSize: 12, color: T.text2, marginBottom: 20, fontFamily: T.sans, lineHeight: 1.5 }}>Where your 14 sessions will focus — built around your goals.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {programmeWeights.map(({ area, weight }) => (
                <div key={area}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontFamily: T.serif, fontSize: 14, color: T.ink }}>{area}</span>
                    <span style={{ fontSize: 11, color: T.text3, fontFamily: T.sans }}>{weight + "%"}</span>
                  </div>
                  <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: weight + "%", background: T.gold, borderRadius: 2 }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Day 14 outcome cards */}
        {section >= 2 && (
          <div style={{ animation: "sectionFade 0.7s ease both" }}>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 6, fontFamily: T.sans }}>By Day 14</div>
            <div style={{ fontSize: 12, color: T.text2, marginBottom: 16, fontFamily: T.sans }}>{"You'll be able to..."}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {outcomeCards.map((o, i) => (
                <div key={i} style={{ padding: "14px 16px", background: "white", borderRadius: 8, border: "1px solid " + T.border, borderTop: "2px solid " + T.gold, display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ fontSize: 15, color: T.gold }}>{o.icon}</div>
                  <div style={{ fontFamily: T.serif, fontSize: 14, color: T.ink, letterSpacing: "-0.2px", lineHeight: 1.2 }}>{o.title}</div>
                  <div style={{ fontSize: 11, color: T.text2, fontFamily: T.sans, lineHeight: 1.45 }}>{o.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Communication Style card */}
        {section >= 2 && (
          <div style={{ padding: "16px", background: "white", borderRadius: 8, border: "1px solid " + T.border, animation: "sectionFade 0.9s ease both" }}>
            <div style={{ fontSize: 9, color: T.text3, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: 8, fontFamily: T.sans }}>Communication Style</div>
            <div style={{ fontFamily: T.serif, fontSize: 16, color: T.ink, marginBottom: 3 }}>{tendency.label}</div>
            <div style={{ fontSize: 12, color: T.text2, fontFamily: T.sans, lineHeight: 1.5 }}>{tendency.sub}</div>
          </div>
        )}

        {/* Programme stats */}
        {section >= 2 && (
          <div style={{ paddingBottom: 8, animation: "sectionFade 1s ease both" }}>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 14, fontFamily: T.sans }}>Your Programme</div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "14", sub: "sessions" },
                { label: "~15", sub: "min / day" },
                { label: "AI", sub: "coaching" },
              ].map((item, i) => (
                <div key={i} style={{ flex: 1, padding: "14px 12px", background: "white", borderRadius: 8, border: "1px solid " + T.border, textAlign: "center" }}>
                  <div style={{ fontFamily: T.serif, fontSize: 22, color: T.ink, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: T.text3, fontFamily: T.sans, marginTop: 2 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Let's Begin — mobile fixed bottom */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "14px 20px 20px", background: "linear-gradient(to top, " + T.bg + " 60%, transparent)", zIndex: 100 }}>
        <button onClick={onContinue} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "15px 24px", borderRadius: 8, border: "1px solid #A8957F", background: "#C4B09A", color: "#1a1510", fontSize: 15, fontFamily: T.sans, fontWeight: 600, cursor: "pointer", letterSpacing: "0.2px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
          <span>{"Let's Begin"}</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#1a1510" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}
