import { useEffect, useRef } from "react";
import { useCoachNarration, CoachButton, CoachStyles, UpNextCard } from "./CoachNarration.jsx";
import { CoachCarousel, useCueCarousel } from "./CoachCarousel.jsx";

// ─── DAY 14 THEORY — the competence–confidence loop, guided by the coach ─────
// Shared by SessionView (desktop/tablet) and SessionViewMobile. The loop image
// sits above; the four skills the user practised are a one-card carousel the
// coach moves through (see CoachCarousel.jsx). Bandura's self-efficacy research
// is the cited source. The closing line brings in an Up next card for the
// Example tab. Cue times: see CoachNarration.jsx.
const SRC = "/day14-theory.mp3";
const DURATION = 70;
const CUES = [
  { t: 34.5, card: 0 },     // "First, clarity."
  { t: 38.9, card: 1 },     // "Then, storytelling."
  { t: 43.3, card: 2 },     // "Next, presence."
  { t: 47.2, card: 3 },     // "And finally, brand and exposure."
  { t: 54.7, done: true },  // "Borrowed confidence…"
  { t: 67.9, next: true },  // "Now let's see the communicator you've become."
];

const CARDS = [
  { word: "Clarity", sub: "You practised organising ideas under pressure." },
  { word: "Storytelling", sub: "You practised creating real connection." },
  { word: "Presence", sub: "You practised influencing how you come across." },
  { word: "Brand & Exposure", sub: "You practised making your value visible." },
];

const CONFIDENCE = [
  ["Borrowed confidence", "It depends on other people's approval. It can fade under pressure."],
  ["Earned confidence", "It comes from what you've practised. It tends to hold up when you need it most."],
];

export default function D14Theory({ T, T2, isDesktop, sharedAudioRef, onNext }) {
  const narration = useCoachNarration({ src: SRC, cues: CUES, sharedAudioRef });
  const { playing, cueIdx, cue } = narration;
  const carousel = useCueCarousel(narration);
  const nextRef = useRef(null);
  const nextLit = playing && cue?.next;

  useEffect(() => {
    if (nextLit) nextRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [cueIdx, playing]);

  const d = isDesktop;
  const body = { fontFamily: T.sans, fontSize: d ? 18 : 15, color: T2.text2, lineHeight: 1.6, fontWeight: 400, margin: 0, maxWidth: 640 };
  return (
    <>
      <CoachStyles />

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>The Science Behind Growth</div>
      <h2 style={{ fontFamily: T.serif, fontSize: d ? 40 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.1, margin: 0, marginBottom: d ? 14 : 10 }}>The Competence–Confidence Loop</h2>
      <p style={{ ...body, marginBottom: d ? 10 : 8 }}>Many people believe confidence comes first. Often, it's the other way round.</p>
      <p style={{ ...body, fontSize: d ? 15 : 13, color: T2.text3, marginBottom: d ? 24 : 18 }}>Psychologist Albert Bandura found that one of the strongest sources of confidence is mastery: doing something, and seeing that you can.</p>

      <CoachButton T={T} T2={T2} isDesktop={d} narration={narration} duration={DURATION} />

      <img src="/day14-loop.jpg" alt="The competence–confidence loop: practice, competence, confidence, growth."
        style={{ display: "block", width: "100%", height: "auto", borderRadius: d ? 6 : 10, border: "0.5px solid " + T2.border, marginBottom: d ? 24 : 18 }} />

      <div style={{ fontFamily: T.sans, fontSize: d ? 12 : 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: d ? 12 : 10 }}>Your fourteen days</div>
      <CoachCarousel T={T} T2={T2} isDesktop={d} cards={CARDS} carousel={carousel}
        litIndex={playing && cue?.card === carousel.slide ? carousel.slide : null} label="What you practised" style={{ marginBottom: d ? 14 : 12 }} />
      <p style={{ fontFamily: T.sans, fontSize: d ? 15 : 14, color: T2.text3, lineHeight: 1.6, margin: 0, marginBottom: d ? 24 : 18 }}>Each repetition strengthened capability. Confidence followed.</p>

      <div style={{ display: "grid", gridTemplateColumns: d ? "1fr 1fr" : "1fr", gap: d ? 14 : 10, marginBottom: d ? 20 : 16 }}>
        {CONFIDENCE.map(([title, text], i) => (
          <div key={title} style={{ padding: d ? "20px 22px" : "16px 18px", background: T2.surface, borderRadius: d ? 4 : 8, border: `0.5px solid ${i === 1 ? "rgba(138,158,132,0.4)" : T2.border}` }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: i === 1 ? T.gold : T2.text3, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>{title}</div>
            <p style={{ fontFamily: T.sans, fontSize: 14, color: T2.text3, lineHeight: 1.6, fontWeight: 300, margin: 0 }}>{text}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: d ? "20px 24px" : "16px 18px", background: T2.surface, borderRadius: 4, borderLeft: "2px solid " + T.gold, marginBottom: d ? 24 : 18 }}>
        <p style={{ fontFamily: T.serif, fontSize: d ? 17 : 15, fontStyle: "italic", color: T.gold, lineHeight: 1.65, margin: "0 0 4px" }}>Practice builds competence. Competence builds confidence. Confidence helps you take bigger opportunities. That's how you grow.</p>
        <p style={{ fontFamily: T.sans, fontSize: 13, color: T2.text4, margin: 0 }}>The confidence you feel today is earned. And because it's earned, it can keep growing.</p>
      </div>

      {onNext && nextLit && (
        <UpNextCard ref={nextRef} T={T} T2={T2} isDesktop={d} title="Make It Yours." sub="Choose your communication superpowers" onClick={onNext} />
      )}
    </>
  );
}
