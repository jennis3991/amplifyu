import { useEffect, useRef } from "react";
import { D2_SCIENCE_CARDS, D2_LEVERS } from "../data.js";
import { useCoachNarration, useCueCards, useClipPlayer, stopClips, CoachButton, CoachCardGrid, CoachStyles, PlayIcon, warmLift, fmt } from "./CoachNarration.jsx";

// ─── DAY 2 THEORY — The 88 Keys, guided by the coach ─────────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The science
// cards open as the coach explains each one, then the four levers light up in
// rhythm with "Pace. Pitch. Pause. Power.", and the coach hands over to a
// demo: the same sentence played flat, then deliberately. Cue times: see
// CoachNarration.jsx.
const SRC = "/day2-theory.mp3";
const DURATION = 71;
const CUES = [
  { t: 15.9, card: 0 },          // "First, prosody."
  { t: 26.9, card: 1 },          // "Then, processing fluency."
  { t: 37.3, card: 2 },          // "And then, vocal contrast."
  { t: 49.7, levers: true },     // "Which brings us to your four levers."
  { t: 52.5, lever: 0 },         // "Pace."
  { t: 53.6, lever: 1 },         // "Pitch."
  { t: 54.5, lever: 2 },         // "Pause."
  { t: 55.5, lever: 3 },         // "Power."
  { t: 56.4, lever: "all" },     // "You don't need to become a different person…"
  { t: 67.4, demo: true },       // "Let's hear the difference."
];

// Same voice, same words; only the delivery changes. The deliberate take had
// a 0.7s silence spliced in before "the most important" (from 0.65s in the
// original recording), so the reveal below describes what it actually does.
const DEMO_SENTENCE = "This is the most important decision we'll make this year.";
const DEMO = [
  { id: "flat", label: "Flat", src: "/day2-demo-flat.mp3", secs: 3 },
  { id: "deliberate", label: "Deliberate", src: "/day2-demo-deliberate.mp3", secs: 5 },
];
const DEMO_LEVERS = [
  { lever: "Pause", what: "before \"the most important\"" },
  { lever: "Pace", what: "slower, so every word lands" },
  { lever: "Power", what: "weight on \"most\"" },
];

export default function D2Theory({ T, T2, isDesktop, sharedAudioRef }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef, onBeforePlay: stopClips, onLeave: stopClips });
  const clips = useClipPlayer(narration);
  const demoRef = useRef(null);
  const { playing, cueIdx, cue } = narration;
  const cueCards = useCueCards(cueIdx, cue);
  const leversRef = useRef(null);

  // Bring the narrated card or the levers into view as each cue fires.
  useEffect(() => {
    if (!playing || !cue) return;
    const el = cue.card !== undefined ? cueCards.refs.current[cue.card] : (cue.levers || cue.lever !== undefined) ? leversRef.current : cue.demo ? demoRef.current : null;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  const lift = warmLift(T, T2);
  const demoLit = playing && cue?.demo;
  const heardBoth = DEMO.every(c => clips.heard(c.src));
  const leverLit = i => cue?.lever === "all" || cue?.lever === i;
  const label = { fontFamily: T.sans, fontSize: d ? 11 : 10, fontWeight: 600, color: T2.goldDark, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 14 : 10 };

  return (
    <>
      <CoachStyles />

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Science</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 16 : 14 }}>The 88 Keys</h2>
      <div style={{ padding: d ? "20px 24px" : "16px 20px", background: T2.surface, borderRadius: 4, borderLeft: "2px solid " + T.gold, marginBottom: d ? 24 : 20 }}>
        <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T2.text, lineHeight: 1.4, margin: 0, fontStyle: "italic" }}>"Your voice is a piano with 88 keys. You've been playing the same 5 your whole life."</p>
      </div>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} style={{ marginBottom: d ? 28 : 22 }} />

      <div style={label}>The Science of Vocal Influence</div>
      <CoachCardGrid T={T} T2={T2} isDesktop={d} cards={D2_SCIENCE_CARDS} cueCards={cueCards} columns={1} style={{ marginBottom: d ? 28 : 20 }} />

      <div ref={leversRef} className="au-coach-lit">
        <div style={label}>The Four Levers</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: d ? 14 : 10, marginBottom: d ? 32 : 20 }}>
          {D2_LEVERS.map((n, i) => {
            const on = leverLit(i);
            return (
              <div key={n.word} className="au-coach-lit"
                style={{
                  padding: d ? "18px 20px" : "14px", borderRadius: d ? 4 : 8,
                  background: on ? lift.bg : T2.surface,
                  border: "1px solid " + (on ? lift.border : T2.border),
                  boxShadow: on ? lift.shadow : "none",
                }}>
                <div style={{ fontFamily: T.serif, fontSize: d ? 20 : 16, fontWeight: 600, color: on ? T2.goldDark : T.gold, lineHeight: 1.3, marginBottom: d ? 8 : 6 }}>{n.word}</div>
                <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, color: T2.text, lineHeight: 1.6, fontWeight: d ? 300 : 400, margin: 0 }}>{n.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hear the difference — the coach's hand-off */}
      <div ref={demoRef} className={"au-coach-lit" + (demoLit ? " au-coach-pulse" : "")}
        style={{
          background: T2.surface, borderRadius: d ? 4 : 8, padding: d ? "22px 24px" : "16px 14px",
          border: "1px solid " + (demoLit ? lift.border : T2.border),
          animation: demoLit ? "au-coach-pulse 1.6s ease-in-out infinite" : "none",
        }}>
        <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>Hear the difference</div>
        <p style={{ fontFamily: T.serif, fontSize: d ? 22 : 19, fontWeight: 600, color: T2.text, lineHeight: 1.3, margin: 0, marginBottom: d ? 14 : 12 }}>Same voice. Same words. Listen to both.</p>
        <p style={{ fontFamily: T.serif, fontSize: d ? 19 : 17, fontStyle: "italic", color: T2.text2, lineHeight: 1.45, margin: 0, marginBottom: d ? 16 : 14 }}>
          {heardBoth
            ? <>"This is <span style={{ color: T2.goldDark, fontStyle: "normal", fontWeight: 600 }}>‖</span> the <strong style={{ color: T2.goldDark }}>most</strong> important decision we'll make this year."</>
            : `"${DEMO_SENTENCE}"`}
        </p>
        <div style={{ display: "flex", flexDirection: d ? "row" : "column", gap: 10 }}>
          {DEMO.map(c => {
            const isPlaying = clips.playing === c.src;
            const on = isPlaying || (heardBoth && c.id === "deliberate");
            return (
              <button key={c.id} onClick={() => clips.toggle(c.src)} aria-label={(isPlaying ? "Pause " : "Play ") + c.label.toLowerCase() + " version"}
                style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                  padding: d ? "10px 16px 10px 10px" : "8px 14px 8px 8px", borderRadius: 999, cursor: "pointer",
                  WebkitAppearance: "none", appearance: "none",
                  background: on ? lift.bg : "transparent",
                  border: "1px solid " + (on ? lift.border : T2.border),
                  boxShadow: on ? lift.shadow : "none", transition: "all 0.25s",
                }}>
                <span style={{ width: 36, height: 36, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <PlayIcon playing={isPlaying} />
                </span>
                <span style={{ flex: 1, fontFamily: T.sans, fontSize: d ? 16 : 15, fontWeight: 500, color: T2.text }}>{c.label}</span>
                <span style={{ fontFamily: T.sans, fontSize: 12, color: T2.text4, fontVariantNumeric: "tabular-nums" }}>{clips.heard(c.src) && !isPlaying ? "✓" : fmt(c.secs)}</span>
              </button>
            );
          })}
        </div>
        {heardBoth && (
          <div className="au-step-enter" style={{ marginTop: d ? 18 : 16 }}>
            <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.4px", marginBottom: 8 }}>What changed in the deliberate version</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DEMO_LEVERS.map(l => (
                <div key={l.lever} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontFamily: T.serif, fontSize: d ? 18 : 16, fontWeight: 600, color: T2.goldDark, minWidth: 54 }}>{l.lever}</span>
                  <span style={{ fontFamily: T.sans, fontSize: d ? 15 : 14, color: T2.text, lineHeight: 1.5 }}>{l.what}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: T.sans, fontSize: d ? 15 : 14, color: T2.text2, lineHeight: 1.6, margin: 0, marginTop: 12 }}>Nothing dramatic. Just deliberate. That's what using more of your 88 keys sounds like.</p>
          </div>
        )}
      </div>
    </>
  );
}
