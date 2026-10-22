import { AICoachNote } from "../components/AICoachNote.jsx";
import { useCoachNarration, CoachButton, CoachStyles } from "./CoachNarration.jsx";

// ─── DAY 10 REHEARSAL INTRO — make your work visible, guided by the coach ────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The Situation →
// Action → Result strip lights each step as the coach names it. Starting the
// builder stops the coach. The audio lives in a module-level slot so a remount
// mid-narration can't orphan it. Cue times: see CoachNarration.jsx.
const d10RehearsalCoachSlot = { current: null };
const SRC = "/day10-rehearsal.mp3";
const DURATION = 57;
const CUES = [
  { t: 25.4, step: 0 },     // "First, the situation."
  { t: 29.7, step: 1 },     // "Then the action."
  { t: 35.2, step: 2 },     // "And finally, the result."
  { t: 42.6, done: true },  // "Speak naturally."
];

const SAR = [
  { label: "Situation", desc: "Set the context" },
  { label: "Action", desc: "What you did" },
  { label: "Result", desc: "What changed" },
];

function SarIcon({ i, color }) {
  if (i === 0) return <svg width={22} height={22} viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="12" rx="2" stroke={color} strokeWidth="1.3"/><path d="M3 9h16" stroke={color} strokeWidth="1.3"/></svg>;
  if (i === 1) return <svg width={22} height={22} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke={color} strokeWidth="1.3"/><path d="M4 19c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>;
  return <svg width={22} height={22} viewBox="0 0 22 22" fill="none"><path d="M4 16l4-4 3 3 4-5 3 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="3" width="16" height="16" rx="1.5" stroke={color} strokeWidth="1.3"/></svg>;
}

export default function D10RehearsalIntro({ T, T2, isDesktop, onStart }) {
  const coach = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef: d10RehearsalCoachSlot });
  const { playing, cue } = coach;
  const litStep = playing && cue?.step !== undefined ? cue.step : null;

  const d = isDesktop;
  const card = { background: T2.surface, borderRadius: d ? 4 : 8, border: "0.5px solid " + T2.border, padding: d ? "22px 24px" : "16px 18px" };
  const cardLabel = { fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "2px", marginBottom: d ? 10 : 8 };
  const body = { fontFamily: T.sans, fontSize: 14, color: T2.text, lineHeight: 1.7, fontWeight: 300 };

  return (
    <>
      <CoachStyles />
      <div style={{ marginBottom: d ? 24 : 20 }}>
        <div style={{ ...cardLabel, marginBottom: d ? 10 : 8 }}>Rehearsal · Day 10</div>
        <h2 style={{ fontFamily: T.serif, fontSize: d ? 36 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: "0 0 14px" }}>Make Your Work Visible</h2>
        <CoachButton T={T} T2={T2} isDesktop={d} narration={coach} duration={DURATION} style={{ marginTop: 0, marginBottom: 0 }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(138,158,132,0.08)", borderRadius: 20, padding: "7px 14px", border: "0.5px solid rgba(138,158,132,0.22)", marginTop: 18 }}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5"/>
            <path d="M10 6v4l2.5 2" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, color: "rgba(138,158,132,0.8)", letterSpacing: "0.05em" }}>1 min warm-up</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: d ? 14 : 12 }}>
        <div style={card}>
          <div style={cardLabel}>How It Works</div>
          <h3 style={{ fontFamily: T.serif, fontSize: d ? 20 : 18, fontWeight: 600, color: T2.text, lineHeight: 1.3, margin: d ? "0 0 20px" : "0 0 16px" }}>A 3-step story that makes your contribution clear.</h3>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {SAR.map((s, i) => {
              const on = litStep === i;
              return (
                <div key={s.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6,
                      background: on ? "rgba(138,158,132,0.22)" : "rgba(138,158,132,0.08)",
                      border: (on ? "1px solid rgba(82,112,96,0.6)" : "0.5px solid rgba(138,158,132,0.25)"),
                      transform: on ? "scale(1.08)" : "none",
                      transition: "background 0.3s, border-color 0.3s, transform 0.3s",
                    }}><SarIcon i={i} color={T.gold} /></div>
                    <div style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: T.gold, marginBottom: 2 }}>{i + 1}</div>
                    <div style={{ fontFamily: T.sans, fontSize: 12, color: on ? T2.goldDark || T2.text : T2.text, textAlign: "center", lineHeight: 1.3, fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontFamily: T.sans, fontSize: 11, color: T2.text3, textAlign: "center", lineHeight: 1.3 }}>{s.desc}</div>
                  </div>
                  {i < 2 && <div style={{ height: 1, width: 16, background: "rgba(138,158,132,0.2)", flexShrink: 0, marginBottom: 32 }} />}
                </div>
              );
            })}
          </div>
        </div>

        <div style={card}>
          <div style={cardLabel}>The First Step</div>
          <p style={{ ...body, margin: "0 0 10px" }}>Think of something you did recently: a project, a problem you solved, a result you created. It doesn't need to be dramatic. It needs to be specific.</p>
          <p style={{ ...body, margin: 0 }}>Visibility isn't self-promotion. It's helping others understand your thinking, your ownership, and the results you create.</p>
        </div>

        <div style={card}>
          <div style={cardLabel}>Your AI Coach</div>
          <p style={{ ...body, margin: "0 0 10px" }}>Your AI coach sharpens what you say into a short performance statement, ready for a review, a meeting or an interview.</p>
          <p style={{ ...body, color: T2.text3, fontStyle: "italic", margin: 0 }}>Lead with the result. Make it specific. Own it.</p>
        </div>

        <div style={{ marginTop: d ? 0 : 8 }}>
          <AICoachNote T={T} T2={T2} voice />
          <button onClick={() => { coach.pause(); onStart(); }} style={{ width: "100%", padding: d ? "16px" : "14px", borderRadius: 4, border: "none", background: T.ink, color: T.bg, fontSize: d ? 16 : 15, fontWeight: 600, cursor: "pointer", fontFamily: T.sans, minHeight: d ? 52 : 48 }}>
            Build Your Story →
          </button>
        </div>
      </div>
    </>
  );
}
