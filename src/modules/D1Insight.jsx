import { useState, useEffect, useRef } from "react";
import { D1_CLARITY_FACTS_DATA } from "../data.js";
import { useCoachNarration, useCueCards, useClipPlayer, stopClips, CoachButton, CoachCardGrid, CoachStyles, PlayIcon, warmLift, fmt } from "./CoachNarration.jsx";

// ─── DAY 1 INSIGHT — guided, voice-synced clarity cards ──────────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The coach
// narration drives the screen: as the voice reaches each card it opens and
// glows, then the hand-off line ("Now let me show you the difference")
// highlights the quick test underneath.
// Cue times: see CoachNarration.jsx.
const SRC = "/day1-insight.mp3";
const DURATION = 54;
const CUES = [
  { t: 18.1, card: 0 },   // Cognitive Load — "When your words are hard to process…"
  { t: 24.4, card: 1 },   // Retention — "Clear ideas stick…"
  { t: 33.3, card: 2 },   // Credibility — "It makes you sound like you know your stuff…"
  { t: 41.0, card: 3 },   // Decision-Making — "And it moves things forward…"
  { t: 48.5, card: null, test: true }, // Hand-off — "Now let me show you the difference."
];

// Both options are read by the same second voice (not the coach), so the
// only difference is structure.
const TEST_OPTIONS = [
  { id: "A", tag: "Muddled", src: "/day1-test-muddled.mp3", secs: 14,
    text: "You probably don't need to memorise every word, but it's important to have a good understanding of the overall narrative and the key messages you're trying to communicate, so that you can speak naturally around the content rather than becoming too reliant on a script." },
  { id: "B", tag: "Clear", src: "/day1-test-clear.mp3", secs: 14, clear: true,
    text: "Don't memorise every word. Own the story.\n\nRemember three things:\nThe message.\nThe evidence.\nThe ask.\n\nKnow those three, and you'll always know where you're going.\n\nTake a breath. Trust yourself." },
];

// Desktop can remount this mid-narration (see CoachNarration.jsx), so the
// quick-test answer lives at module level where a remount can't wipe it.
let testAnswer = null;

export default function D1Insight({ T, T2, isDesktop, sharedAudioRef }) {
  const narration = useCoachNarration({
    src: SRC, cues: CUES, sharedAudioRef,
    onBeforePlay: stopClips,
    onLeave: stopClips,
  });
  const { playing, cueIdx, cue } = narration;
  const cueCards = useCueCards(cueIdx, cue);
  const [answer, setAnswer] = useState(testAnswer);
  const clips = useClipPlayer(narration);
  const testRef = useRef(null);

  const testLit = playing && cue?.test;

  // Bring the narrated card (or the quick test) into view as each cue fires.
  useEffect(() => {
    if (!playing || !cue) return;
    const el = cue.test ? testRef.current : cueCards.refs.current[cue.card];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  function choose(id) {
    if (answer) return;
    testAnswer = id;
    setAnswer(id);
  }

  const d = isDesktop;
  const lift = warmLift(T, T2);

  return (
    <>
      <CoachStyles />

      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 12 : 8 }}>Why Clarity Wins</h2>
      <p style={{ fontFamily: T.serif, fontSize: d ? 24 : 20, fontStyle: "italic", color: T2.goldDark, lineHeight: 1.35, margin: 0, marginBottom: d ? 14 : 10 }}>A clear message makes people lean in.</p>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 24 : 18, maxWidth: 600 }}>Before you can influence, inspire or lead, people need to understand you.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCardGrid T={T} T2={T2} isDesktop={d} cards={D1_CLARITY_FACTS_DATA} cueCards={cueCards} />

      {/* Quick test — the "show you the difference" moment */}
      <div ref={testRef} className={"au-coach-lit" + (testLit && !answer ? " au-coach-pulse" : "")}
        style={{
          background: T2.surface, borderRadius: d ? 4 : 8, padding: d ? "22px 24px" : "16px 14px",
          border: "1px solid " + (testLit ? lift.border : T2.border), transition: "border-color 0.35s",
          animation: testLit && !answer ? "au-coach-pulse 1.6s ease-in-out infinite" : "none",
        }}>
        <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>Quick test</div>
        <p style={{ fontFamily: T.serif, fontSize: d ? 22 : 19, fontWeight: 600, color: T2.text, lineHeight: 1.25, margin: 0, marginBottom: d ? 14 : 12 }}>A nervous colleague asks for advice on presenting. Which helps more?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TEST_OPTIONS.map(o => {
            const picked = answer === o.id;
            const clear = answer && o.clear;
            const isPlaying = clips.playing === o.src;
            return (
              <div key={o.id}
                style={{
                  borderRadius: d ? 4 : 8, padding: d ? "16px 18px" : "14px",
                  background: clear ? lift.bg : "transparent",
                  border: "1px solid " + (clear ? lift.border : picked ? T2.text3 : isPlaying ? lift.border : T2.border),
                  boxShadow: clear ? lift.shadow : "none",
                  opacity: answer && !clear && !picked ? 0.6 : 1, transition: "all 0.25s",
                }}>
                {/* A / B badge (label revealed only after answering) */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: clear ? T2.goldDark : T2.text, color: T2.bg, fontFamily: T.serif, fontSize: 21, fontWeight: 600 }}>{o.id}</span>
                  {answer && <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.4px", color: o.clear ? T2.goldDark : T2.text3 }}>{o.tag}</span>}
                </div>
                {/* Play row: button, waveform, duration */}
                <button onClick={() => clips.toggle(o.src)} aria-label={(isPlaying ? "Pause option " : "Play option ") + o.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 0, marginBottom: 12,
                    WebkitAppearance: "none", appearance: "none", cursor: "pointer", background: "transparent", border: "none",
                  }}>
                  <span style={{ width: 36, height: 36, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <PlayIcon playing={isPlaying} />
                  </span>
                  <span aria-hidden="true" style={{ flex: 1, display: "flex", alignItems: "center", gap: 3, height: 22, minWidth: 0, overflow: "hidden" }}>
                    {[0.4, 0.75, 0.55, 1, 0.6, 0.85, 0.45, 0.7, 0.95, 0.5, 0.8, 0.4, 0.65, 0.9, 0.5, 0.35].map((h, k) => (
                      <span key={k} className="au-coach-bar" style={{
                        width: 3, height: 22 * h, borderRadius: 2, background: T.gold, flexShrink: 0,
                        opacity: isPlaying ? 1 : 0.5, transformOrigin: "center",
                        animation: isPlaying ? `au-coach-wave ${0.7 + (k % 5) * 0.12}s ease-in-out ${(k % 4) * 0.08}s infinite` : "none",
                      }} />
                    ))}
                    <span style={{ flex: 1, height: 1, background: T2.border, marginLeft: 6 }} />
                  </span>
                  <span style={{ fontFamily: T.sans, fontSize: 13, color: T2.text3, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{fmt(o.secs)}</span>
                </button>
                {/* Full script — tap to choose */}
                <button onClick={() => choose(o.id)} disabled={!!answer}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: 0, background: "transparent", border: "none",
                    WebkitAppearance: "none", appearance: "none", cursor: answer ? "default" : "pointer",
                  }}>
                  <span style={{ display: "block", fontFamily: T.sans, fontSize: d ? 15 : 14, color: T2.text, lineHeight: 1.55, whiteSpace: "pre-line" }}>"{o.text}"</span>
                </button>
              </div>
            );
          })}
        </div>
        {answer && (
          <div className="au-step-enter" style={{ marginTop: d ? 16 : 14 }}>
            <p style={{ fontFamily: T.serif, fontSize: d ? 22 : 19, fontWeight: 600, color: T2.goldDark, margin: 0, marginBottom: 4 }}>{answer === "B" ? "Exactly." : "Interesting."}</p>
            <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, color: T2.text, lineHeight: 1.6, margin: 0 }}>
              {answer === "B"
                ? "Three things to hold onto: the message, the evidence, and the ask. When you're nervous, a simple structure is what you remember."
                : "The first is sensible, but it's long and abstract, with nothing to hold onto. The second gives them three anchors to remember on stage. That's clarity in action."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
