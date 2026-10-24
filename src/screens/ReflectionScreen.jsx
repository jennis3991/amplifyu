import { useState, useEffect } from 'react';
import { T } from '../theme.js';
import { ROLES } from '../data.js';
import { useIsDesktop } from '../utils.js';

// One-time notice at the start of the programme that the coach is AI (EU AI
// Act Art. 50(1)); it also covers the pre-recorded coach voice heard on the
// lesson tabs, which carry no notice of their own.
const AI_COACH_LINE = "Your AmplifyU coach is AI. Its voice and feedback are generated automatically, not by a person.";

// Match a saved onboarding answer to a map key, ignoring case and
// punctuation, so answers saved before a copy edit (e.g. with an em dash)
// still find their profile.
const normAnswer = s => (s || "").toLowerCase().replace(/[—–\-.,!?'’]/g, " ").replace(/\s+/g, " ").trim();
function matchAnswer(map, answer) {
  const key = normAnswer(answer);
  for (const k in map) if (normAnswer(k) === key) return map[k];
  return undefined;
}

export function ReflectionScreen({ answers, onContinue }) {
  const isDesktop = useIsDesktop();
  const [reflection, setReflection] = useState(null);
  const [section, setSection] = useState(0);
  const [visible, setVisible] = useState(true);
  const role = ROLES.find(r => r.id === answers.role);

  function handleContinue() {
    if (!visible) return;
    setVisible(false);
    setTimeout(onContinue, 380);
  }

  const challengeLabel = answers.challenge || "communicating with impact";
  const contextLabel   = answers.context   || "building influence and presence";
  const levelLabel     = answers.level     || "ready to go further";
  const roleLabel      = role ? role.label : "professional";

  const focusAreaMap = {
    "Speaking up confidently with senior leaders.":        ["Executive Presence", "Clarity & Structure"],
    "Speaking up confidently with senior leaders":         ["Executive Presence", "Clarity & Structure"],
    "Structuring my thoughts clearly under pressure.":     ["Clarity & Structure", "Executive Presence"],
    "Structuring my thoughts under pressure":              ["Clarity & Structure", "Executive Presence"],
    "Making my work visible and getting credit for it.":   ["Visibility", "Personal Brand"],
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
    ...(matchAnswer(focusAreaMap, challengeLabel) || ["Communication Clarity"]),
    ...(matchAnswer(focusAreaMap, contextLabel)   || ["Presence"]),
  ];
  const supplementaryPool = ["Influence", "Storytelling", "Executive Presence", "Assertiveness", "High-Stakes Composure", "Clarity & Structure"];
  const uniqueAreas = [...new Set(rawAreas)];
  for (const area of supplementaryPool) {
    if (uniqueAreas.length >= 4) break;
    if (!uniqueAreas.includes(area)) uniqueAreas.push(area);
  }
  const focusAreas = uniqueAreas.slice(0, 4);

  const tendencyMap = {
    "I stay quiet when I should speak up.":                 { label: "The Quiet Expert",        sub: "Depth and capability waiting to be heard." },
    "I stay quiet when I should speak up":                  { label: "The Quiet Expert",        sub: "Depth and capability waiting to be heard." },
    "I speak, but I don't always land my point.":          { label: "The Active Voice",        sub: "Energy and presence. Refining precision." },
    "I speak but don't always land my point.":              { label: "The Active Voice",        sub: "Energy and presence. Refining precision." },
    "I speak but don't always land my point":               { label: "The Active Voice",        sub: "Energy and presence. Refining precision." },
    "I land my points, but I lack consistent presence.":   { label: "The Capable Communicator",sub: "Competent and credible. Ready for more." },
    "I land my points but lack consistent presence.":       { label: "The Capable Communicator",sub: "Competent and credible. Ready for more." },
    "I land my points but lack consistent presence":        { label: "The Capable Communicator",sub: "Competent and credible. Ready for more." },
    "I'm already strong. I want to go to the next level.": { label: "The High Performer",      sub: "Strong foundation. Optimising for excellence." },
    "I'm strong — I want to go to the next level":         { label: "The High Performer",      sub: "Strong foundation. Optimising for excellence." },
  };
  const tendency = matchAnswer(tendencyMap, levelLabel) || { label: "The Growth Professional", sub: "The drive to communicate with clarity and impact." };

  // Programme focus weights — derived from focus area priority order
  const focusWeightsBySize = { 5:[30,25,20,15,10], 4:[35,28,22,15], 3:[45,35,20], 2:[60,40] };
  const focusWeights = focusWeightsBySize[focusAreas.length] || focusWeightsBySize[4];
  const programmeWeights = focusAreas.map((area, i) => ({ area, weight: focusWeights[i] || 10 }));

  const svgLines   = <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}><path d="M3 5h14M3 9h10M3 13h7" stroke={T.text3} strokeWidth="1.4" strokeLinecap="round"/></svg>;
  const svgDoc     = <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}><path d="M3 4h8l4 4v8H3V4z" stroke={T.text3} strokeWidth="1.4" fill="none"/><path d="M10 4v5h5" stroke={T.text3} strokeWidth="1.3"/></svg>;
  const svgPeople  = <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}><circle cx="7" cy="7" r="3" stroke={T.text3} strokeWidth="1.4" fill="none"/><circle cx="13" cy="7" r="3" stroke={T.text3} strokeWidth="1.4" fill="none"/><path d="M3 17c0-3 2-4 4-4h6c2 0 4 1 4 4" stroke={T.text3} strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>;
  const svgShield  = <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}><path d="M10 3L4 6.5v4c0 3 2.5 5.5 6 6.5 3.5-1 6-3.5 6-6.5v-4L10 3z" stroke={T.text3} strokeWidth="1.4" strokeLinejoin="round"/></svg>;
  const svgEye     = <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}><path d="M2 10c2.5-4.5 4.5-6 8-6s5.5 1.5 8 6c-2.5 4.5-4.5 6-8 6s-5.5-1.5-8-6z" stroke={T.text3} strokeWidth="1.4"/><circle cx="10" cy="10" r="2.5" stroke={T.text3} strokeWidth="1.3"/></svg>;
  const svgDiamond = <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}><path d="M10 3l7 5-7 9-7-9 7-5z" stroke={T.text3} strokeWidth="1.4" strokeLinejoin="round"/><path d="M3 8h14" stroke={T.text3} strokeWidth="1.2"/></svg>;
  const svgMic     = <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}><rect x="7" y="3" width="6" height="8" rx="3" stroke={T.text3} strokeWidth="1.4"/><path d="M5 11c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke={T.text3} strokeWidth="1.3" strokeLinecap="round"/><path d="M10 16v2M8 18h4" stroke={T.text3} strokeWidth="1.3" strokeLinecap="round"/></svg>;
  const svgBolt    = <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}><path d="M12 3l-5 8h4l-3 6 8-9h-4l4-5z" stroke={T.text3} strokeWidth="1.4" strokeLinejoin="round"/></svg>;
  const svgTarget  = <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}><circle cx="10" cy="10" r="7" stroke={T.text3} strokeWidth="1.3"/><circle cx="10" cy="10" r="4" stroke={T.text3} strokeWidth="1.2"/><circle cx="10" cy="10" r="1.5" stroke={T.text3} strokeWidth="1.3"/></svg>;
  const svgStar    = <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}><path d="M10 3l1.8 5h5.2l-4.2 3 1.6 5L10 13l-4.4 3 1.6-5L3 8h5.2z" stroke={T.text3} strokeWidth="1.3" strokeLinejoin="round"/></svg>;
  const svgChart   = <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}><path d="M3 15l4-5 3 2 4-6 3 3" stroke={T.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

  // Outcome cards — "By Day 14 you'll understand how to..." framing
  const outcomeMap = {
    "Executive Presence":      { svg: svgMic,     title: "Command the room",           sub: "Speak with authority in any environment" },
    "Confidence":              { svg: svgBolt,    title: "Back yourself",              sub: "Communicate with conviction and inner confidence" },
    "Clarity & Structure":     { svg: svgLines,   title: "Make your point land",       sub: "Structure your thinking clearly under pressure" },
    "Precision Editing":       { svg: svgLines,   title: "Say more with less",         sub: "Cut to what matters and make every word count" },
    "Visibility":              { svg: svgEye,     title: "Be seen for your work",      sub: "Make your impact visible to the people who matter" },
    "Personal Brand":          { svg: svgDiamond, title: "Own your presence",          sub: "Build a reputation that works for you in every room" },
    "Assertiveness":           { svg: svgShield,  title: "Hold your ground",           sub: "Communicate directly, confidently and without apology" },
    "Executive Authority":     { svg: svgChart,   title: "Lead with weight",           sub: "Carry natural authority in every conversation" },
    "Influence":               { svg: svgPeople,  title: "Move people forward",        sub: "Shape decisions and earn buy-in" },
    "Strategic Communication": { svg: svgLines,   title: "Land your message",          sub: "Communicate with intention and strategic precision" },
    "Storytelling":            { svg: svgDoc,     title: "Tell stories that stick",    sub: "Make people lean in and remember what you said" },
    "Narrative Craft":         { svg: svgDoc,     title: "Shape how people see things",sub: "Craft stories that shift perspective and drive action" },
    "High-Stakes Composure":   { svg: svgTarget,  title: "Stay sharp under pressure",  sub: "Navigate tough conversations with calm clarity" },
    "Presence":                { svg: svgStar,    title: "Command attention",          sub: "Be someone people remember and trust" },
    "Communication Clarity":   { svg: svgLines,   title: "Get your point across",      sub: "Communicate with clarity and real impact every time" },
  };
  const outcomeCards = focusAreas.slice(0, 4).map(area => ({
    area,
    ...(outcomeMap[area] || { svg: svgLines, title: area, sub: "A skill you will build" }),
  }));

  // 2 goal cards for right panel
  const goalCards = [
    { label: "Your challenge", text: challengeLabel.replace(/\.$/, "") },
    { label: "Your ambition",  text: contextLabel.replace(/\.$/, "") },
  ];

  // Reflection text (quiz-derived, no API)
  const fallbackReflection = {
    summary: "Here is what we are seeing: you want to " + contextLabel.toLowerCase().replace(/^telling /,"tell ").replace(/^building /,"build ").replace(/^influencing and communicating /,"influence and communicate ").replace(/^influencing /,"influence ").replace(/^navigating /,"navigate ").replace(/\.$/, "").replace(/\bmy\b/g,"your").replace(/\bmyself\b/g,"yourself") + ", but " + challengeLabel.toLowerCase().replace(/\.$/, "").replace(/\bmy\b/g,"your").replace(/\bmyself\b/g,"yourself") + " is standing in the way. That gap between your capability and how you're showing up is exactly where AmplifyU works. You already have a strong place to start from.",
  };

  useEffect(() => {
    setReflection(fallbackReflection);
    setTimeout(() => setSection(1), 150);
    setTimeout(() => setSection(2), 800);
  }, []);


  // ── Shared pieces (mockup style) ──────────────────────────────────────────
  // Programme Focus: one row per area with a round icon, a bar and the share.
  const focusIcon = area => (outcomeMap[area] || {}).svg || svgLines;
  const iconCircle = (svg, size, tint) => (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: tint ? T.goldLight : T.surface, border: "1px solid " + (tint ? "rgba(138,158,132,0.3)" : T.border) }}>{svg}</div>
  );
  const eyebrow = { fontSize: 11, color: T.text3, textTransform: "uppercase", letterSpacing: "3px", fontFamily: T.sans };
  const card = { background: "rgba(255,255,255,0.55)", borderRadius: 10, border: "1px solid " + T.border };

  const header = (d) => (
    <div>
      {/* Desktop banner image already carries the "Your Communication Profile" title. */}
      {!d && <div style={{ ...eyebrow, marginBottom: 12 }}>Your communication profile</div>}
      <h1 style={{ fontFamily: T.serif, fontSize: d ? "clamp(38px,3.6vw,56px)" : 36, fontWeight: 500, color: T.ink, lineHeight: 1.05, letterSpacing: d ? "-1.5px" : "-1px", margin: 0 }}>{tendency.label}</h1>
      {section >= 1 && reflection && (
        <p style={{ fontFamily: T.serif, fontSize: d ? 19 : 17, color: T.text2, lineHeight: 1.6, margin: (d ? "20px" : "14px") + " 0 0", maxWidth: 620, animation: "sectionFade 0.6s ease both" }}>{reflection.summary}</p>
      )}
      {role && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: d ? 22 : 18, padding: "9px 18px", background: "transparent", borderRadius: 3, border: "1px solid rgba(44,36,22,0.28)" }}>
          <span style={{ width: 5, height: 5, transform: "rotate(45deg)", background: T.goldDark }} />
          <span style={{ fontSize: 11, color: T.ink, textTransform: "uppercase", letterSpacing: "2.5px", fontFamily: T.sans, fontWeight: 500 }}>{role.label}</span>
        </div>
      )}
    </div>
  );

  const focusCard = (d) => (
    <div style={{ ...card, padding: d ? "24px 28px" : "20px 18px", animation: "sectionFade 0.6s ease both" }}>
      <div style={{ ...eyebrow, color: T.text2, marginBottom: 6 }}>Programme Focus</div>
      <div style={{ fontSize: d ? 14 : 13, color: T.text3, fontFamily: T.sans, lineHeight: 1.5, marginBottom: d ? 18 : 14 }}>Where your 14 sessions will focus, built around your goals.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: d ? 14 : 12 }}>
        {programmeWeights.map(({ area, weight }) => (
          <div key={area} style={{ display: "flex", alignItems: "center", gap: d ? 16 : 12 }}>
            {iconCircle(focusIcon(area), d ? 44 : 38)}
            <span style={{ flex: "0 0 " + (d ? "38%" : "40%"), fontFamily: T.serif, fontSize: d ? 18 : 16, color: T.ink, lineHeight: 1.2 }}>{area}</span>
            <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: weight + "%", background: T.goldDark, borderRadius: 2 }} />
            </div>
            <span style={{ width: 34, textAlign: "right", fontSize: d ? 13 : 12, color: T.text3, fontFamily: T.sans }}>{weight + "%"}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const outcomes = (d) => (
    <div style={{ animation: "sectionFade 0.7s ease both" }}>
      <div style={{ ...eyebrow, color: T.text2, marginBottom: d ? 16 : 12 }}>{"By Day 14, you'll be able to…"}</div>
      <div style={{ display: "grid", gridTemplateColumns: d ? "repeat(4, 1fr)" : "1fr 1fr", gap: d ? 12 : 10 }}>
        {outcomeCards.map((o, i) => (
          <div key={i} style={{ ...card, padding: d ? "18px 18px 20px" : "14px 14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {iconCircle(o.svg, d ? 44 : 38, i === 0)}
            <div style={{ fontFamily: T.serif, fontSize: d ? 19 : 17, color: T.ink, lineHeight: 1.15, marginTop: 4 }}>{o.title}</div>
            <div style={{ fontSize: d ? 13 : 12, color: T.text3, fontFamily: T.sans, lineHeight: 1.45 }}>{o.sub}.</div>
          </div>
        ))}
      </div>
    </div>
  );

  const fadeKeyframes = <style>{`@keyframes sectionFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>;

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ height: "100vh", display: "flex", fontFamily: T.sans, background: T.bg, overflow: "hidden", opacity:visible?1:0, transition:"opacity 0.38s ease" }}>
        {fadeKeyframes}

        {/* LEFT: main content */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Banner image — desktop only */}
          <div style={{ width: "100%", height: 300, flexShrink: 0, overflow: "hidden" }}>
            <img loading="lazy" src="/profile-banner-desktop-2.jpg" alt="" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", objectPosition: "top" }}/>
          </div>

          <div style={{ padding: "48px 72px 140px", display: "flex", flexDirection: "column", gap: 36 }}>
            {header(true)}
            {section >= 2 && focusCard(true)}
            {section >= 2 && outcomes(true)}
          </div>
        </div>

        {/* RIGHT: profile panel — dark, static */}
        <div style={{ width: 360, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.08)", background: T.cardDark, overflow: "hidden", padding: "64px 40px 100px", display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3.5px", marginBottom: 14, fontFamily: T.sans }}>Your Goals</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {goalCards.map((g, i) => (
                <div key={i} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 7, border: "1px solid rgba(255,255,255,0.07)", borderLeftWidth: 2, borderLeftColor: T.gold }}>
                  <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 6, fontFamily: T.sans }}>{g.label}</div>
                  <div style={{ fontFamily: T.serif, fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.6 }}>{g.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* AI notice — always visible, directly above the floating CTA */}
        <p style={{ position: "fixed", bottom: 100, right: 40, width: 280, zIndex: 200, fontFamily: T.sans, fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.5, margin: 0, textAlign: "center" }}>{AI_COACH_LINE}</p>
        {/* Floating CTA — fixed bottom right, ENTER pill style */}
        <button
          onClick={handleContinue}
          className="au-cta"
          style={{ position: "fixed", bottom: 36, right: 80, zIndex: 200, background: "rgba(138,158,132,0.12)", border: "1.5px solid " + T.gold, borderRadius: 40, padding: "15px 48px", color: T.gold, fontSize: 12, fontWeight: 500, letterSpacing: "2.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: T.sans, transition: "all 0.2s ease", whiteSpace: "nowrap", boxShadow: "0 0 20px rgba(138,158,132,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 32px rgba(138,158,132,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(138,158,132,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"; }}
          onMouseDown={e => { e.currentTarget.style.background = "rgba(255,255,255,0.95)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#2C2416"; e.currentTarget.style.boxShadow = "0 0 48px rgba(255,255,255,0.6)"; }}
          onMouseUp={e => { e.currentTarget.style.background = "rgba(138,158,132,0.12)"; e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; e.currentTarget.style.boxShadow = "0 0 20px rgba(138,158,132,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"; }}
        >
          {"Let's Begin"}
        </button>
      </div>
    );
  }

  // ── MOBILE ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.sans, display: "flex", flexDirection: "column", paddingBottom: 170, opacity:visible?1:0, transition:"opacity 0.38s ease" }}>
      {fadeKeyframes}

      {/* Slim black banner */}
      <div style={{ background: "#0D0B08", height: `calc(52px + env(safe-area-inset-top, 0px))`, paddingTop: "env(safe-area-inset-top, 0px)", display: "flex", alignItems: "center", paddingLeft: 20, flexShrink: 0, boxSizing: "border-box" }}>
        <img loading="lazy" src="/logo-mark.png" alt="AmplifyU" style={{ width: 28, height: 28, objectFit: "cover", mixBlendMode: "screen", filter: "brightness(3) contrast(1.2)", marginRight: 10 }}/>
        <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>AmplifyU</span>
      </div>

      <div style={{ padding: "28px 20px 0", display: "flex", flexDirection: "column", gap: 24 }}>
        {header(false)}
        {section >= 2 && focusCard(false)}
        {section >= 2 && outcomes(false)}
      </div>

      {/* Let's Begin — mobile fixed bottom, dark Begin Session style */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "28px 20px calc(24px + env(safe-area-inset-bottom, 0px))", background: "linear-gradient(to top, " + T.bg + " 84%, transparent)", zIndex: 100 }}>
        <p style={{ fontFamily: T.sans, fontSize: 13, color: T.text2, lineHeight: 1.5, margin: "0 0 10px" }}>{AI_COACH_LINE}</p>
        <button onClick={handleContinue} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px 24px", borderRadius: 6, border: "none", background: T.ink, color: T.bg, fontSize: 14, fontFamily: T.sans, fontWeight: 600, cursor: "pointer", transition: "all 0.25s ease" }}>
          {"Let's Begin"} →
        </button>
      </div>
    </div>
  );
}
