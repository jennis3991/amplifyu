import { T as TBase } from "../theme.js";

// ─── AI COACH NOTE ──────────────────────────────────────────────────────────
// One plain line telling the user the coach is AI, not a person. Sits directly
// above the first button on an activity that sends anything to the AI (EU AI
// Act Art. 50: clear notice at the start of the interaction). Authored screens
// (Insight, Theory, Example, Review) never carry it.
// voice: true on screens where the pre-recorded coach voice-over also plays.
// characters: true on role-plays where the AI also plays the other people.
// Both together on role-plays that also have the coach voice-over.
export const AI_NOTE_TEXT = "The feedback here comes from your AI coach, not a person.";
export const AI_NOTE_VOICE_TEXT = "Your coach's voice and feedback here are AI-generated, not a person.";
export const AI_NOTE_CHARACTERS_TEXT = "The characters and feedback here come from your AI coach, not a person.";
export const AI_NOTE_VOICE_CHARACTERS_TEXT = "Your coach's voice, the characters and the feedback here are AI-generated, not a person.";

const BRAIN = ["M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8", "M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8", "M17.5 16a3.5 3.5 0 0 0 0 -7h-.5", "M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0", "M6.5 16a3.5 3.5 0 0 1 0 -7h.5", "M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10"];

export function AICoachNote({ T = TBase, T2, voice = false, characters = false, dark = false, style }) {
  const color = dark ? "rgba(255,255,255,0.72)" : (T2?.text2 || T.text2);
  const iconColor = dark ? "rgba(255,255,255,0.6)" : T.goldDark;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "0 0 12px", ...style }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
        {BRAIN.map((d, i) => <path key={i} d={d} />)}
      </svg>
      <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 400, color, lineHeight: 1.5, margin: 0, textAlign: "left" }}>
        {voice && characters ? AI_NOTE_VOICE_CHARACTERS_TEXT : voice ? AI_NOTE_VOICE_TEXT : characters ? AI_NOTE_CHARACTERS_TEXT : AI_NOTE_TEXT}
      </p>
    </div>
  );
}
