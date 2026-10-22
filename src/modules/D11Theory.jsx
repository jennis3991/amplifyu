import { useEffect, useRef } from "react";
import { D11_INGREDIENTS } from "../data.js";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 11 THEORY — the Halo Effect and the Brand Formula ───────────────────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The Halo Effect
// sits above; the six brand ingredients are a one-card carousel the coach
// moves through (see CoachCarousel.jsx). The closing line brings in an Up next
// card for the Example tab. Cue times: see CoachNarration.jsx.
const SRC = "/day11-theory.mp3";
const DURATION = 86;
const CUES = [
  { t: 27.4, card: 0 },     // "First, authority."
  { t: 35.2, card: 1 },     // "Then, generosity."
  { t: 43.3, card: 2 },     // "Next, relatability."
  { t: 53.4, card: 3 },     // "Then, energy."
  { t: 61.1, card: 4 },     // "Next, familiarity."
  { t: 69.3, card: 5 },     // "And finally, a point of view."
  { t: 81.5, next: true },  // "Now let's see how two very different brands…"
];

const HALO = [["Clear", "Intelligence"], ["Calm", "Competence"], ["Confident", "Capability"], ["Warm", "Trustworthiness"]];

const CARDS = D11_INGREDIENTS.map(ing => ({
  tag: ing.n, word: ing.tagline, sub: ing.body,
  bullets: [`${ing.psych}: ${ing.psychBody}`], foot: ing.takeaway,
}));

export default function D11Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const carousel = useCueCarousel(narration);
  const nextRef = useRef(null);
  const nextLit = playing && cue?.next;

  useEffect(() => {
    if (nextLit) nextRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  const eyebrow = { fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 };
  return (
    <>
      <CoachStyles />

      <div style={eyebrow}>The Science of Personal Brand</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>The Halo Effect</h2>
      <p style={{ fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, marginBottom: d ? 18 : 14, maxWidth: 640 }}>Whether intentional or not, people are always building a picture of who you are. Psychologists call this the Halo Effect: one standout positive trait can shape how they judge everything else.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <div style={{ fontFamily: T.sans, fontSize: d ? 13 : 12, color: T2.text3, marginBottom: 8 }}>What each signal can suggest:</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: d ? 10 : 6, marginBottom: d ? 18 : 14 }}>
        {HALO.map(([sig, res]) => (
          <div key={sig} style={{ display: "flex", alignItems: "center", gap: d ? 6 : 4, padding: d ? "7px 14px" : "5px 10px", background: T2.surface, borderRadius: 20, border: "0.5px solid " + T2.border }}>
            <span style={{ fontFamily: T.sans, fontSize: d ? 13 : 12, fontWeight: 500, color: T2.text }}>{sig}</span>
            <span style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, color: T.gold }}>→</span>
            <span style={{ fontFamily: T.sans, fontSize: d ? 13 : 12, fontWeight: 600, color: T.gold }}>{res}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: d ? "16px 20px" : "12px 14px", background: T2.surface, borderRadius: 4, borderLeft: "2px solid " + T2.border, marginBottom: d ? 24 : 18 }}>
        <p style={{ fontFamily: T.serif, fontSize: d ? 17 : 15, fontStyle: "italic", color: T2.text2, lineHeight: 1.6, margin: 0 }}>People rarely remember everything about you. They remember the strongest signal you gave them.</p>
      </div>

      <div style={{ ...eyebrow, marginTop: d ? 8 : 4 }}>The AmplifyU Brand Formula</div>
      <h3 style={{ fontFamily: T.serif, fontSize: d ? 28 : 22, fontWeight: 600, color: T2.text, lineHeight: 1.15, margin: 0, marginBottom: d ? 8 : 6 }}>The Recipe for a Memorable Personal Brand</h3>
      <p style={{ fontFamily: T.sans, fontSize: d ? 16 : 14, color: T2.text3, lineHeight: 1.6, margin: 0, marginBottom: d ? 20 : 14 }}>Six ingredients that help a personal brand stick.</p>

      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="The brand formula" style={{ marginBottom: d ? 20 : 16 }} />

      <div style={{ padding: d ? "16px 20px" : "14px 16px", background: T2.surface, borderLeft: "3px solid " + T.gold, borderRadius: 4, marginBottom: d ? 24 : 18 }}>
        <p style={{ fontFamily: T.serif, fontSize: d ? 18 : 15, fontStyle: "italic", color: T.gold, margin: 0, lineHeight: 1.6 }}>Your brand is the story people tell themselves about you after seeing you again and again.</p>
      </div>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Taylor Swift & Disney" sub="Two brands built on consistency" onClick={onNext} />
      )}
    </>
  );
}
