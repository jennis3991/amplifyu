import { useState, useEffect, useRef } from "react";
import { D1_CLARITY_FACTS_DATA } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, PlayIcon, warmLift, fmt } from "./CoachNarration.jsx";

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
// Example clips, one Audio per option, kept at module level for the same
// remount reason.
const optAudio = {};
let optPlayingId = null;
function stopOptions() {
  Object.values(optAudio).forEach(a => a.pause());
  optPlayingId = null;
}

export default function D1Insight({ T, T2, isDesktop, sharedAudioRef }) {
  const narration = useCoachNarration({
    src: SRC, cues: CUES, sharedAudioRef,
    onBeforePlay: () => { stopOptions(); setOptPlaying(null); },
    onLeave: stopOptions,
  });
  const { playing, cueIdx, cue } = narration;
  // A tap wins until the narration reaches its next cue.
  const [manual, setManual] = useState({ card: null, cue: -2 });
  const [answer, setAnswer] = useState(testAnswer);
  const [optPlaying, setOptPlaying] = useState(optPlayingId);
  // Options show two lines until expanded; answering expands both.
  const [expanded, setExpanded] = useState({});
  const cardRefs = useRef([]);
  const testRef = useRef(null);

  const narratedCard = cue ? cue.card : null;
  const openCard = manual.cue === cueIdx ? manual.card : narratedCard;
  const testLit = playing && cue?.test;

  // Bring the narrated card (or the quick test) into view as each cue fires.
  useEffect(() => {
    if (!playing || !cue) return;
    const el = cue.test ? testRef.current : cardRefs.current[cue.card];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  function tapCard(i) {
    setManual({ card: openCard === i ? null : i, cue: cueIdx });
  }

  function playOption(o) {
    const wasPlaying = optPlayingId === o.id;
    stopOptions();
    if (wasPlaying) { setOptPlaying(null); return; }
    narration.pause();
    let a = optAudio[o.id];
    if (!a) {
      a = optAudio[o.id] = new Audio(o.src);
      a.addEventListener("ended", () => { if (optPlayingId === o.id) optPlayingId = null; setOptPlaying(p => (p === o.id ? null : p)); });
    }
    a.currentTime = 0;
    optPlayingId = o.id;
    setOptPlaying(o.id);
    a.play().catch(() => { optPlayingId = null; setOptPlaying(null); });
  }

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

      {/* Four clarity cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "start", gap: d ? 12 : 10, marginBottom: d ? 32 : 24 }}>
        {D1_CLARITY_FACTS_DATA.map((n, i) => {
          const open = openCard === i;
          return (
            <div key={i} ref={el => (cardRefs.current[i] = el)} onClick={() => tapCard(i)} className="au-coach-lit"
              style={{
                background: open ? lift.bg : T2.surface, borderRadius: d ? 4 : 8, padding: d ? "22px 24px" : "14px",
                border: `1px solid ${open ? lift.border : T2.border}`, cursor: "pointer",
                boxShadow: open ? lift.shadow : "none",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: d ? (open ? 10 : 6) : 5 }}>
                <div style={{ fontFamily: T.serif, fontSize: d ? 24 : 18, fontWeight: 600, color: T.gold, lineHeight: 1.3, flex: 1 }}>{n.word}</div>
                <span style={{ fontFamily: T.sans, fontSize: d ? 16 : 17, fontWeight: 600, color: open ? T.gold : T2.text4, marginLeft: 6, flexShrink: 0 }}>{open ? "▴" : "▸"}</span>
              </div>
              <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, color: T2.text2, lineHeight: 1.45, fontWeight: 400, margin: open ? (d ? "0 0 14px" : "4px 0 8px") : (d ? 0 : "4px 0 0") }}>{n.sub}</p>
              {open && (
                <div style={{ borderTop: "0.5px solid " + T2.divider, paddingTop: d ? 14 : 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {n.bullets.map((b, j) => (
                    <div key={j} style={{ display: "flex", gap: d ? 10 : 8, alignItems: "flex-start" }}>
                      <div style={{ width: d ? 4 : 3, height: d ? 4 : 3, borderRadius: "50%", background: T.gold, flexShrink: 0, marginTop: 6 }} />
                      <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, color: T2.text, lineHeight: 1.6, fontWeight: 400, margin: 0 }}>{b}</p>
                    </div>
                  ))}
                  {n.note && (
                    <div style={{ marginTop: 4, paddingLeft: 10, borderLeft: "2px solid " + T.gold }}>
                      <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 3 }}>Coach's note</div>
                      <p style={{ fontFamily: T.serif, fontSize: d ? 16 : 14, fontStyle: "italic", color: T2.text, lineHeight: 1.5, margin: 0 }}>{n.note}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick test — the "show you the difference" moment */}
      <div ref={testRef} className={"au-coach-lit" + (testLit && !answer ? " au-coach-pulse" : "")}
        style={{
          background: T2.surface, borderRadius: d ? 4 : 8, padding: d ? "22px 24px" : "16px 14px",
          border: "1px solid " + (testLit ? lift.border : T2.border), transition: "border-color 0.35s",
          animation: testLit && !answer ? "au-coach-pulse 1.6s ease-in-out infinite" : "none",
        }}>
        <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>Quick test</div>
        <p style={{ fontFamily: T.serif, fontSize: d ? 22 : 19, fontWeight: 600, color: T2.text, lineHeight: 1.25, margin: 0, marginBottom: d ? 14 : 12 }}>A nervous colleague asks for advice. Which helps more?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TEST_OPTIONS.map(o => {
            const picked = answer === o.id;
            const clear = answer && o.clear;
            const isPlaying = optPlaying === o.id;
            const full = answer || expanded[o.id];
            return (
              <div key={o.id}
                style={{
                  display: "flex", gap: 12, alignItems: "flex-start", borderRadius: d ? 4 : 8,
                  padding: d ? "12px 14px" : "10px 12px",
                  background: clear ? lift.bg : "transparent",
                  border: "1px solid " + (clear ? lift.border : picked ? T2.text3 : isPlaying ? lift.border : T2.border),
                  boxShadow: clear ? lift.shadow : "none",
                  opacity: answer && !clear && !picked ? 0.6 : 1, transition: "all 0.25s",
                }}>
                <button onClick={() => playOption(o)} aria-label={(isPlaying ? "Pause option " : "Play option ") + o.id}
                  style={{
                    width: 44, height: 44, minWidth: 44, margin: "-4px -4px -4px -4px", flexShrink: 0, padding: 0,
                    WebkitAppearance: "none", appearance: "none", cursor: "pointer",
                    background: "transparent", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  {/* 36px circle inside a 44px tap target (global button min-height) */}
                  <span style={{ width: 36, height: 36, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlayIcon playing={isPlaying} />
                  </span>
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                <button onClick={() => choose(o.id)} disabled={!!answer}
                  style={{
                    flex: 1, display: "block", textAlign: "left", padding: 0, background: "transparent", border: "none",
                    WebkitAppearance: "none", appearance: "none", cursor: answer ? "default" : "pointer",
                  }}>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2, paddingTop: 2 }}>
                    <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: clear ? T2.goldDark : T2.text3 }}>{o.id}</span>
                    {answer && <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", color: o.clear ? T2.goldDark : T2.text3 }}>{o.tag}</span>}
                    <span style={{ fontFamily: T.sans, fontSize: 12, color: T2.text4, marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>{fmt(o.secs)}</span>
                  </span>
                  <span style={{
                    fontFamily: T.sans, fontSize: d ? 15 : 14, color: T2.text, lineHeight: 1.5, whiteSpace: full ? "pre-line" : "normal",
                    ...(full ? { display: "block" } : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }),
                  }}>"{full ? o.text : o.text.replace(/\s*\n+\s*/g, " ")}"</span>
                </button>
                {!answer && (
                  <button onClick={() => setExpanded(e => ({ ...e, [o.id]: !e[o.id] }))}
                    style={{ padding: "4px 0 0", background: "transparent", border: "none", WebkitAppearance: "none", appearance: "none", cursor: "pointer", fontFamily: T.sans, fontSize: 12, fontWeight: 500, color: T2.goldDark }}>
                    {full ? "Show less" : "Read more"}
                  </button>
                )}
                </div>
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
