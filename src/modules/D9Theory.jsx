import { useEffect, useRef } from "react";
import { D9_COMM_STYLES } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard, warmLift } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 9 THEORY — the science of connection, guided by the coach ───────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. Four principles
// in the one-card carousel (see CoachCarousel.jsx), then the four
// communication styles as a grid that lights when the coach reaches them.
// The styles are a simple model for adapting, not a scientific finding, and
// the copy says so. Cue times: see CoachNarration.jsx.
const SRC = "/day9-theory.mp3";
const DURATION = 67;
const CUES = [
  { t: 6.4, card: 0 },      // "First, likeability."
  { t: 19.0, card: 1 },     // "Then, active listening."
  { t: 28.9, card: 2 },     // "Next, curiosity."
  { t: 39.1, card: 3 },     // "And finally, empathy."
  { t: 48.3, styles: true },// "There's one more thing to remember…"
  { t: 65.0, next: true },  // "Let's see what that looks like in action."
];

const PRINCIPLES = [
  { tag: "Likeability", word: "The Likeability Principle",
    sub: "People are more likely to trust, support and collaborate with people they like. Likeability isn't about being entertaining. It's about making others feel respected and understood." },
  { tag: "Listening", word: "Active Listening",
    sub: "Active listening means giving someone your full attention. Not preparing your next answer. Not waiting for your turn. Simply listening with the goal of understanding, not responding." },
  { tag: "Curiosity", word: "The Curiosity Effect",
    sub: "People enjoy conversations where they feel interesting. Great communicators ask questions that encourage reflection, storytelling and deeper thinking." },
  { tag: "Empathy", word: "Empathy",
    sub: "Empathy is the ability to understand another person's perspective. You don't need to agree with someone to understand them. Understanding builds connection. Connection builds trust." },
];

export default function D9Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const carousel = useCueCarousel(narration);
  const stylesRef = useRef(null);
  const nextRef = useRef(null);
  const stylesLit = playing && cue?.styles;
  const nextLit = playing && cue?.next;

  useEffect(() => {
    if (stylesLit) stylesRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (nextLit) nextRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  const lift = warmLift(T, T2);
  return (
    <>
      <CoachStyles />

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Science of Connection</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 20 : 16 }}>Why some people make everyone feel understood</h2>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={PRINCIPLES} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="Four principles of connection" />

      <div ref={stylesRef} className="au-coach-lit" style={{ padding: d ? "18px" : "14px", marginBottom: d ? 24 : 18, borderRadius: 10, border: "1px solid " + (stylesLit ? lift.border : "transparent"), background: stylesLit ? lift.bg : "transparent", boxShadow: stylesLit ? lift.shadow : "none" }}>
        <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Four Communication Styles</div>
        <p style={{ fontFamily: T.sans, fontSize: d ? 15 : 14, color: T2.text3, lineHeight: 1.6, margin: 0, marginBottom: d ? 16 : 14 }}>Different people value different things. These four styles are a simple way to think about adapting. The strongest communicators adapt, not because they're being fake, but because they're being effective.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: d ? 12 : 8 }}>
          {D9_COMM_STYLES.map(s => (
            <div key={s.id} style={{ padding: d ? "18px 20px" : "12px", background: T2.surface, borderRadius: d ? 4 : 8, border: "0.5px solid " + T2.border }}>
              <div style={{ fontFamily: T.sans, fontSize: d ? 11 : 10, fontWeight: 700, color: s.colour, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>{s.label}</div>
              <div style={{ marginBottom: d ? 10 : 8 }}>
                <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: T2.text4, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Values</div>
                <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, color: T2.text3, lineHeight: 1.6 }}>{s.values.join(" · ")}</div>
              </div>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: T2.text4, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Connect through</div>
                <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, color: T.gold, lineHeight: 1.6 }}>{s.connect.join(" · ")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: d ? "16px 20px" : "14px 16px", background: T2.surface, borderRadius: 4, borderLeft: "2px solid " + T.gold, marginBottom: d ? 24 : 18 }}>
        <p style={{ fontFamily: T.serif, fontSize: d ? 17 : 15, fontStyle: "italic", color: T.gold, margin: 0, lineHeight: 1.6 }}>Speak to people the way they need to be spoken to, not the way you prefer to communicate.</p>
      </div>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Connection in Action" sub="Two communicators who make others feel heard" onClick={onNext} />
      )}
    </>
  );
}
