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
    "Speaking up confidently with senior leaders.":        ["Executive Presence", "Confidence"],
    "Speaking up confidently with senior leaders":         ["Executive Presence", "Confidence"],
    "Structuring my thoughts clearly under pressure.":     ["Clarity & Structure", "Precision Editing"],
    "Structuring my thoughts under pressure":              ["Clarity & Structure", "Precision Editing"],
    "Making my work visible — and getting credit for it.": ["Visibility", "Personal Brand"],
    "Promoting my work and making it visible":             ["Visibility", "Personal Brand"],
    "Setting boundaries and asserting myself.":            ["Assertiveness", "Executive Authority"],
    "Setting boundaries and asserting myself":             ["Assertiveness", "Executive Authority"],
    "Influencing and communicating with real impact.":     ["Influence", "Strategic Communication"],
    "Influencing and communicating with impact":           ["Influence", "Strategic Communication"],
    "Building a personal brand and presence that lasts.":  ["Personal Brand", "Presence"],
    "Building my personal brand and presence":             ["Personal Brand", "Presence"],
    "Telling stories that make people lean in.":           ["Storytelling", "Narrative Craft"],
    "Telling stories that land":                           ["Storytelling", "Narrative Craft"],
    "Navigating high-stakes conversations with confidence.":["High-Stakes Composure", "Confidence"],
    "Navigating high-stakes conversations":                ["High-Stakes Composure", "Confidence"],
  };

  const rawAreas = [
    ...(focusAreaMap[challengeLabel] || ["Communication Clarity"]),
    ...(focusAreaMap[contextLabel]   || ["Presence"]),
    "Structured Thinking",
  ];
  const focusAreas = [...new Set(rawAreas)].slice(0, 5);

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

  // Snapshot score — quiz-derived, always 70%+
  const snapshotScoreMap = {
    "I stay quiet when I should speak up.":                 71,
    "I stay quiet when I should speak up":                  71,
    "I speak but don't always land my point.":              74,
    "I speak but don't always land my point":               74,
    "I land my points but lack consistent presence.":       77,
    "I land my points but lack consistent presence":        77,
    "I'm already strong. I want to go to the next level.": 80,
    "I'm strong — I want to go to the next level":         80,
  };
  const snapshotScore = snapshotScoreMap[levelLabel] || 73;
  const gapPct = 100 - snapshotScore;

  // Strength cards (up to 4, from focus areas)
  const strengthDetails = {
    "Executive Presence":      { icon: "◆", trait: "Authority and weight in the room" },
    "Confidence":              { icon: "●", trait: "Inner conviction, outer clarity" },
    "Clarity & Structure":     { icon: "▲", trait: "Logical, precise communication" },
    "Precision Editing":       { icon: "◈", trait: "Saying more with less" },
    "Visibility":              { icon: "◎", trait: "Making your work seen" },
    "Personal Brand":          { icon: "✦", trait: "A presence that lasts" },
    "Assertiveness":           { icon: "→", trait: "Direct, confident voice" },
    "Executive Authority":     { icon: "◆", trait: "Leading with impact" },
    "Influence":               { icon: "◈", trait: "Moving people forward" },
    "Strategic Communication": { icon: "▲", trait: "Targeted, intentional messaging" },
    "Storytelling":            { icon: "◎", trait: "Stories that make people lean in" },
    "Narrative Craft":         { icon: "✦", trait: "Shaping how people see things" },
    "High-Stakes Composure":   { icon: "●", trait: "Calm and clear under pressure" },
    "Structured Thinking":     { icon: "▲", trait: "Ideas that land with clarity" },
    "Presence":                { icon: "◆", trait: "Commanding attention naturally" },
    "Communication Clarity":   { icon: "◎", trait: "Clear, precise expression" },
  };
  const strengthCards = focusAreas.slice(0, 4).map(area => ({
    label: area,
    ...(strengthDetails[area] || { icon: "◈", trait: "Core strength" }),
  }));

  // 3 goals from quiz answers
  const goals = [
    challengeLabel.replace(/\.$/, ""),
    contextLabel.replace(/\.$/, ""),
    "Complete 14 sessions with your AI coach",
  ];

  // Focus areas with impact labels
  const focusAreasWithImpact = focusAreas.map((area, i) => ({
    area,
    impact: i < 2 ? "High" : "Medium",
  }));

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

  // Circular progress gauge constants
  const R_GAUGE = 52;
  const CIRC = 2 * Math.PI * R_GAUGE;

  function CircularGauge({ score }) {
    const dash = (score / 100) * CIRC;
    return (
      <svg width="136" height="136" viewBox="0 0 136 136" style={{ display: "block" }}>
        <circle cx="68" cy="68" r={R_GAUGE} fill="none" stroke={T.border} strokeWidth="9"/>
        <circle cx="68" cy="68" r={R_GAUGE} fill="none" stroke={T.gold} strokeWidth="9"
          strokeDasharray={dash + " " + CIRC}
          strokeLinecap="round"
          transform="rotate(-90 68 68)"
        />
      </svg>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ height: "100vh", display: "flex", fontFamily: T.sans, background: T.bg, overflow: "hidden" }}>

        {/* LEFT: main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "64px 72px 120px", display: "flex", flexDirection: "column" }}>

          {/* Brand */}
          <div style={{ fontSize: 11, color: T.gold, textTransform: "uppercase", letterSpacing: "4px", marginBottom: 52, fontFamily: T.sans }}>AmplifyU</div>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, color: T.text3, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 14, fontFamily: T.sans }}>Your communication profile</div>
            <h1 style={{ fontFamily: T.serif, fontSize: "clamp(32px,3vw,52px)", fontWeight: 500, color: T.ink, lineHeight: 1.08, letterSpacing: "-1.5px", margin: 0 }}>
              {"Here's what"}
              <br/>{"we're seeing."}
            </h1>
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

          {/* Communication Snapshot */}
          {section >= 2 && (
            <div style={{ marginBottom: 48, animation: "fadeUp 0.6s ease both" }}>
              <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 24, fontFamily: T.sans }}>Communication Snapshot</div>
              <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
                <div style={{ position: "relative", width: 136, height: 136, flexShrink: 0 }}>
                  <CircularGauge score={snapshotScore} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    <div style={{ fontFamily: T.serif, fontSize: 30, fontWeight: 600, color: T.ink, lineHeight: 1 }}>{snapshotScore + "%"}</div>
                    <div style={{ fontSize: 9, color: T.text3, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 2 }}>today</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.serif, fontSize: 17, color: T.ink, marginBottom: 10, letterSpacing: "-0.2px", lineHeight: 1.4 }}>
                    {"You're already ahead of where most people start."}
                  </div>
                  <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, fontFamily: T.sans }}>
                    {"AmplifyU closes the last " + gapPct + "% — turning your existing capability into consistent, visible impact."}
                  </div>
                  <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: T.gold }}/>
                      <span style={{ fontSize: 11, color: T.text3, fontFamily: T.sans }}>{"Today: " + snapshotScore + "%"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: T.border, border: "1.5px dashed " + T.gold }}/>
                      <span style={{ fontSize: 11, color: T.text3, fontFamily: T.sans }}>After AmplifyU: 100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* What We'll Build */}
          {section >= 2 && (
            <div style={{ marginBottom: 48, animation: "fadeUp 0.7s ease both" }}>
              <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 20, fontFamily: T.sans }}>{"What We'll Build"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {strengthCards.map((s, i) => (
                  <div key={i} style={{ padding: "18px 20px", background: "white", borderRadius: 8, border: "1px solid " + T.border, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 18, color: T.gold, lineHeight: 1 }}>{s.icon}</div>
                    <div style={{ fontFamily: T.serif, fontSize: 15, color: T.ink, letterSpacing: "-0.2px", lineHeight: 1.25 }}>{s.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 10, fontFamily: T.sans, color: T.goldDark, background: T.goldLight, padding: "2px 9px", borderRadius: 20 }}>{"We'll develop"}</div>
                      <span style={{ fontSize: 11, color: T.text3, fontFamily: T.sans }}>{s.trait}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Focus Areas */}
          {section >= 2 && (
            <div style={{ marginBottom: 40, animation: "fadeUp 0.8s ease both" }}>
              <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 20, fontFamily: T.sans }}>Focus Areas</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {focusAreasWithImpact.map(({ area, impact }, i) => (
                  <div key={area} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < focusAreasWithImpact.length - 1 ? "1px solid " + T.border : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: impact === "High" ? T.gold : T.border, flexShrink: 0 }}/>
                      <span style={{ fontFamily: T.serif, fontSize: 15, color: T.ink }}>{area}</span>
                    </div>
                    <div style={{ fontSize: 10, fontFamily: T.sans, color: impact === "High" ? T.goldDark : T.text3, textTransform: "uppercase", letterSpacing: "1.5px", background: impact === "High" ? T.goldLight : T.surface, padding: "3px 9px", borderRadius: 4 }}>
                      {impact === "High" ? "Priority" : "Foundation"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: profile panel — dark */}
        <div style={{ width: 360, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.08)", background: T.cardDark, overflowY: "auto", padding: "64px 40px 120px", display: "flex", flexDirection: "column", gap: 32 }}>

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

          {/* Your Goals */}
          <div>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3.5px", marginBottom: 16, fontFamily: T.sans }}>Your Goals</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {goals.map((goal, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(138,158,132,0.15)", border: "1px solid rgba(138,158,132,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 10, color: T.gold, fontFamily: T.sans, fontWeight: 600 }}>{i + 1}</span>
                  </div>
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.55 }}>{goal}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Programme */}
          <div>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3.5px", marginBottom: 16, fontFamily: T.sans }}>Your Programme</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { label: "14 sessions", sub: "One per day, ~15 minutes each" },
                { label: "6 core skills", sub: "Presence, Clarity, Influence, Story, Visibility, Composure" },
                { label: "AI coaching", sub: "Personalised feedback throughout" },
                { label: "Day 14 · Your Blueprint", sub: "A personal communication plan built around you" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.gold, flexShrink: 0, marginTop: 7, opacity: 0.8 }}/>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)", fontFamily: T.sans, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", fontFamily: T.sans, lineHeight: 1.4 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalised for you */}
          <div style={{ padding: "18px 20px", background: "rgba(138,158,132,0.1)", border: "1px solid rgba(138,158,132,0.25)", borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: T.gold, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 8, fontFamily: T.sans }}>Personalised for you</div>
            <div style={{ fontFamily: T.serif, fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.65 }}>
              {"Tailored for " + roleLabel + " who want to " + contextLabel.toLowerCase().replace(/\.$/, "").replace(/\bmy\b/g,"their").replace(/\bmyself\b/g,"themselves") + "."}
            </div>
          </div>
        </div>

        {/* STICKY BOTTOM BAR — dark */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.cardDark, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "14px 72px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 100 }}>
          <div style={{ fontFamily: T.serif, fontSize: 17, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.2px" }}>
            Ready to begin?
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", fontFamily: T.sans }}>~15 minutes · Day 1 is ready</span>
            <button onClick={onContinue} className="au-cta" style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 28px", borderRadius: 6, border: "1px solid rgba(220,205,180,0.4)", background: "rgba(220,205,180,0.92)", color: "#1a1510", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: T.sans, letterSpacing: "0.2px" }}>
              <span>Begin Day 1</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#1a1510" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MOBILE ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.sans, display: "flex", flexDirection: "column", paddingBottom: 100 }}>
      <style>{`@keyframes sectionFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ padding: "52px 24px 0" }}>
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

        {/* Communication Snapshot */}
        {section >= 2 && (
          <div style={{ animation: "sectionFade 0.6s ease both" }}>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 20, fontFamily: T.sans }}>Communication Snapshot</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
                <svg width="110" height="110" viewBox="0 0 136 136" style={{ display: "block" }}>
                  <circle cx="68" cy="68" r={R_GAUGE} fill="none" stroke={T.border} strokeWidth="9"/>
                  <circle cx="68" cy="68" r={R_GAUGE} fill="none" stroke={T.gold} strokeWidth="9"
                    strokeDasharray={(snapshotScore / 100 * CIRC) + " " + CIRC}
                    strokeLinecap="round"
                    transform="rotate(-90 68 68)"
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 600, color: T.ink, lineHeight: 1 }}>{snapshotScore + "%"}</div>
                  <div style={{ fontSize: 8, color: T.text3, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: "1px", marginTop: 2 }}>today</div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.serif, fontSize: 15, color: T.ink, lineHeight: 1.4, marginBottom: 8 }}>
                  {"You're already ahead of where most people start."}
                </div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.6, fontFamily: T.sans }}>
                  {"AmplifyU closes the last " + gapPct + "%."}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What We'll Build */}
        {section >= 2 && (
          <div style={{ animation: "sectionFade 0.7s ease both" }}>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 16, fontFamily: T.sans }}>{"What We'll Build"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {strengthCards.map((s, i) => (
                <div key={i} style={{ padding: "16px", background: "white", borderRadius: 8, border: "1px solid " + T.border, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 16, color: T.gold }}>{s.icon}</div>
                  <div style={{ fontFamily: T.serif, fontSize: 14, color: T.ink, letterSpacing: "-0.2px", lineHeight: 1.2 }}>{s.label}</div>
                  <div style={{ fontSize: 10, fontFamily: T.sans, color: T.goldDark, background: T.goldLight, padding: "2px 8px", borderRadius: 20, display: "inline-block", width: "fit-content" }}>{"We'll develop"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Focus Areas */}
        {section >= 2 && (
          <div style={{ animation: "sectionFade 0.8s ease both" }}>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", marginBottom: 16, fontFamily: T.sans }}>Focus Areas</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {focusAreasWithImpact.map(({ area, impact }, i) => (
                <div key={area} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: i < focusAreasWithImpact.length - 1 ? "1px solid " + T.border : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: impact === "High" ? T.gold : T.border, flexShrink: 0 }}/>
                    <span style={{ fontFamily: T.serif, fontSize: 14, color: T.ink }}>{area}</span>
                  </div>
                  <div style={{ fontSize: 9, fontFamily: T.sans, color: impact === "High" ? T.goldDark : T.text3, textTransform: "uppercase", letterSpacing: "1.5px", background: impact === "High" ? T.goldLight : T.surface, padding: "3px 8px", borderRadius: 4 }}>
                    {impact === "High" ? "Priority" : "Foundation"}
                  </div>
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

      {/* STICKY BOTTOM CTA — dark */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.cardDark, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "14px 24px", zIndex: 100 }}>
        <button onClick={onContinue} style={{ width: "100%", padding: "15px 24px", borderRadius: 6, border: "none", background: T.gold, color: "white", fontSize: 15, fontFamily: T.sans, fontWeight: 600, cursor: "pointer", letterSpacing: "0.2px" }}>
          Begin Day 1 →
        </button>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", textAlign: "center", marginTop: 8, fontFamily: T.sans }}>~15 minutes · Your first session is ready</div>
      </div>
    </div>
  );
}
