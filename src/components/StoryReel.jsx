import { useEffect, useRef, useState } from 'react';

// ─── StoryReel — self-contained, Instagram-Stories-style scene player ───────
// No dependency on app routing or global state beyond props. Colours and
// fonts are hard-coded to the spec below rather than imported from the app's
// theme.js, so this component can be dropped into other projects unchanged.
const INK = '#1a1714';
const CREAM = '#f0ebe2';
const SAGE = '#6b7c6e';
const FONT_SERIF = "'Cormorant Garamond','Georgia',serif";
const FONT_SANS = "'Inter',-apple-system,sans-serif";

const SCENE_MS = 7000;

const STYLE_TAG = `
@keyframes storyReelKenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.14); } }
@keyframes storyReelPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.12); opacity: 0.75; } }
.story-reel-card button { outline: none; -webkit-tap-highlight-color: transparent; }
.story-reel-kenburns { animation: storyReelKenBurns 32s ease-in-out infinite alternate; }
.story-reel-pulse { animation: storyReelPulse 2.2s ease-in-out infinite; }
.story-reel-body { display: flex; flex-direction: column; }
.story-reel-media { flex: 0 0 220px; }
.story-reel-content { padding: 28px 24px 24px; }
.story-reel-quote { font-size: 20px; }
.story-reel-cover-title { font-size: 24px; }
@media (min-width: 720px) {
  .story-reel-body { flex-direction: row; }
  .story-reel-media { flex: 0 0 42%; }
  .story-reel-content { padding: 44px 48px; }
  .story-reel-quote { font-size: 27px; }
  .story-reel-cover-title { font-size: 32px; }
}
@media (prefers-reduced-motion: reduce) {
  .story-reel-kenburns, .story-reel-pulse { animation: none !important; }
}
`;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
  });
  useEffect(() => {
    let mq;
    try { mq = window.matchMedia('(prefers-reduced-motion: reduce)'); } catch { return; }
    const handler = (e) => setReduced(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler); else mq.addListener(handler);
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', handler); else mq.removeListener(handler); };
  }, []);
  return reduced;
}

// Drives one scene's progress (0..1) via rAF so pause/resume holds position
// exactly, rather than restarting a CSS animation from zero.
function useSceneProgress(activeScene, durationMs, isRunning, onComplete) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const elapsedRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setProgress(0);
    elapsedRef.current = 0;
    startRef.current = null;
  }, [activeScene]);

  useEffect(() => {
    if (!isRunning) { startRef.current = null; return; }
    function tick(ts) {
      if (startRef.current == null) startRef.current = ts - elapsedRef.current;
      const elapsed = ts - startRef.current;
      elapsedRef.current = elapsed;
      const p = Math.min(elapsed / durationMs, 1);
      setProgress(p);
      if (p >= 1) { onCompleteRef.current(); return; }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isRunning, activeScene, durationMs]);

  return progress;
}

// Fades its children in (opacity + slight upward translate) on every mount —
// pair with `key={activeScene}` so it remounts, and re-fades, per scene.
// `children` may be a render function `(shown) => node` so a nested element
// (the emotion pill) can key its own, separately-delayed fade off the same flag.
function SceneFade({ children, reducedMotion }) {
  const [shown, setShown] = useState(reducedMotion);
  useEffect(() => {
    if (reducedMotion) { setShown(true); return; }
    setShown(false);
    let raf2;
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setShown(true)); });
    return () => { cancelAnimationFrame(raf1); if (raf2) cancelAnimationFrame(raf2); };
  }, [reducedMotion]);
  return (
    <div style={{
      opacity: shown ? 1 : 0,
      transform: shown ? 'translateY(0)' : 'translateY(10px)',
      transition: reducedMotion ? 'none' : 'opacity 260ms ease, transform 260ms ease',
    }}>
      {typeof children === 'function' ? children(shown) : children}
    </div>
  );
}

function PlayGlyph({ reducedMotion }) {
  return (
    <div className={reducedMotion ? '' : 'story-reel-pulse'} style={{
      width: 56, height: 56, borderRadius: '50%', background: 'rgba(240,235,226,0.12)',
      border: '1px solid rgba(240,235,226,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="18" height="20" viewBox="0 0 18 20" fill="none"><path d="M1 1.5v17l16-8.5-16-8.5z" fill={CREAM} /></svg>
    </div>
  );
}

function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

export function StoryReel({ scenes, coverImage, backgroundImage = '/d8-story-book.jpg' }) {
  const reducedMotion = usePrefersReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [activeScene, setActiveScene] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = scenes.length;
  const scene = scenes[activeScene];

  function goTo(i) { setActiveScene(((i % total) + total) % total); }
  function next() { goTo(activeScene + 1); }
  function prev() { goTo(activeScene - 1); }

  const isRunning = isOpen && !isPaused && !reducedMotion;
  const progress = useSceneProgress(activeScene, SCENE_MS, isRunning, next);

  function pauseOn() { setIsPaused(true); }
  function pauseOff() { setIsPaused(false); }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} aria-label="Play: The Story Behind AmplifyU" style={{
        all: 'unset', cursor: 'pointer', display: 'block', width: '100%', position: 'relative',
        borderRadius: 14, overflow: 'hidden', minHeight: 340,
      }}>
        <style>{STYLE_TAG}</style>
        <img loading="lazy" src={coverImage} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 12%',
          filter: 'grayscale(0.5) sepia(0.18) brightness(0.6) contrast(1.05)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 25%, rgba(26,23,20,0.1) 0%, rgba(26,23,20,0.94) 88%)' }} />
        <div style={{
          position: 'relative', minHeight: 340, padding: '40px 28px', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 16, textAlign: 'center',
        }}>
          <PlayGlyph reducedMotion={reducedMotion} />
          <h2 className="story-reel-cover-title" style={{ fontFamily: FONT_SERIF, fontWeight: 600, color: CREAM, margin: 0, letterSpacing: '-0.3px' }}>
            The Story Behind AmplifyU
          </h2>
          <span style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(240,235,226,0.55)' }}>
            Tap to play
          </span>
        </div>
      </button>
    );
  }

  return (
    <div
      className="story-reel-card"
      style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: INK }}
      onMouseEnter={pauseOn}
      onMouseLeave={pauseOff}
      onTouchStart={pauseOn}
      onTouchEnd={pauseOff}
      onTouchCancel={pauseOff}
    >
      <style>{STYLE_TAG}</style>

      {/* Segmented progress bar */}
      <div style={{ display: 'flex', gap: 4, padding: '14px 16px 0', position: 'relative', zIndex: 2 }}>
        {scenes.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Go to scene ${i + 1}: ${scenes[i].title}`} style={{
            flex: 1, height: 3, borderRadius: 2, background: 'rgba(240,235,226,0.28)',
            border: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 2, background: SAGE,
              width: i < activeScene ? '100%' : i > activeScene ? '0%' : `${(reducedMotion ? 1 : progress) * 100}%`,
              transition: reducedMotion || i === activeScene ? 'none' : 'width 150ms ease',
            }} />
          </button>
        ))}
      </div>

      {/* Tap zones — bottom layer, so real controls (which set pointerEvents:auto) win over them */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 1 }}>
        <button onClick={prev} aria-label="Previous scene" style={{ flex: 1, background: 'transparent', border: 'none', cursor: 'pointer' }} />
        <button onClick={next} aria-label="Next scene" style={{ flex: 1, background: 'transparent', border: 'none', cursor: 'pointer' }} />
      </div>

      <div className="story-reel-body" style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
        <div className="story-reel-media" style={{ position: 'relative', overflow: 'hidden', minHeight: 200 }}>
          <img loading="lazy" src={backgroundImage} alt="" className={reducedMotion ? '' : 'story-reel-kenburns'} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,23,20,0.15) 0%, rgba(26,23,20,0.55) 100%)' }} />
          <button onClick={() => setIsOpen(false)} aria-label="Close story" style={{
            position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%',
            border: 'none', background: 'rgba(26,23,20,0.5)', cursor: 'pointer', pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CloseIcon />
          </button>
        </div>

        <div className="story-reel-content" style={{ flex: 1, background: CREAM, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <SceneFade key={activeScene} reducedMotion={reducedMotion}>
            {(shown) => (
              <>
                <div style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(26,23,20,0.42)', marginBottom: 12 }}>
                  Scene {activeScene + 1} of {total} · {scene.title}
                </div>
                <h3 className="story-reel-quote" style={{ fontFamily: FONT_SERIF, fontWeight: 600, color: INK, margin: '0 0 16px', lineHeight: 1.25, letterSpacing: '-0.2px' }}>
                  "{scene.quote}"
                </h3>
                <p style={{ fontFamily: FONT_SANS, fontSize: 14.5, color: 'rgba(26,23,20,0.72)', lineHeight: 1.7, margin: '0 0 20px' }}>
                  {scene.body}
                </p>
                <span style={{
                  display: 'inline-block', fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
                  textTransform: 'uppercase', color: SAGE, background: 'rgba(107,124,110,0.14)', border: '1px solid rgba(107,124,110,0.3)',
                  borderRadius: 20, padding: '6px 14px',
                  opacity: shown ? 1 : 0,
                  transform: shown ? 'scale(1)' : 'scale(0.85)',
                  transition: reducedMotion ? 'none' : 'opacity 260ms ease 160ms, transform 260ms ease 160ms',
                }}>
                  {scene.emotion}
                </span>
              </>
            )}
          </SceneFade>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, pointerEvents: 'auto' }}>
            <button onClick={prev} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 13,
              fontWeight: 600, color: INK, padding: '6px 0',
            }}>← Previous</button>
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: 'rgba(26,23,20,0.4)' }}>Scene {activeScene + 1} of {total}</span>
            <button onClick={next} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 13,
              fontWeight: 600, color: INK, padding: '6px 0',
            }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const DEFAULT_STORY_SCENES = [
  {
    title: "The Return",
    quote: "I came back to a career that still mattered.",
    body: "A year ago, I returned from maternity leave. Two small children at home, a career that mattered to me, and a hard new reality: I could no longer afford to be anything less than precise. Every meeting, every conversation had to earn its place.",
    emotion: "Determination",
  },
  {
    title: "The Realisation",
    quote: "Communication became the skill that multiplied everything else.",
    body: "I quickly realised that my ability to communicate clearly, to structure my thinking under pressure, to tell stories that landed, was the single highest-leverage skill I could develop. When I communicate well, I work faster, influence more, and come home with something left to give.",
    emotion: "Clarity",
  },
  {
    title: "Building the System",
    quote: "I needed more than instinct. I needed a system.",
    body: "I had strong instincts for communication and had built real credibility. But coming back, I wanted something I could call on when tired, when stretched, when operating across two full worlds simultaneously. I built AmplifyU because the tools I needed didn't exist.",
    emotion: "Purpose",
  },
  {
    title: "The Practice",
    quote: "Every session made improvement visible.",
    body: "The programme moves through fourteen deliberate modules: clarity, structure, voice. Then storytelling, connection, managing pressure. Then the hardest work: building presence, communicating ambition, creating exposure. Every session includes coaching that responds to your specific words, tools to rewrite and rehearse.",
    emotion: "Focus",
  },
  {
    title: "The Transformation",
    quote: "It wasn't talent. It was practice.",
    body: "I believe every person can become a better communicator. Not gifted. Not naturally smooth. But deliberate. Precise. Compelling. The professionals who transformed their communication did it through practice, repetition, and a system that made improvement visible to themselves and the people around them.",
    emotion: "Confidence",
  },
  {
    title: "The Life It Builds",
    quote: "When you communicate well, everything else expands.",
    body: "This platform was built in the margins of a full life. It is designed to be used in exactly the same way. Because the professionals who need these tools most are also the ones with the least time to waste, and the most to gain.",
    emotion: "Wholeness",
  },
];
