import { useEffect, useRef, useState } from 'react';

// iOS WebKit's SpeechSynthesis silently stops mid-utterance on long text
// (empirically ~15s+) — chunking into short sentence groups and queueing
// multiple utterances avoids the cutoff and gives a clean, reliable stop
// (speechSynthesis.pause()/resume() is unreliable in WKWebView on iOS).
function splitIntoChunks(text, maxLen = 220) {
  const sentences = text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]*/g) || [];
  const chunks = [];
  let cur = '';
  for (const s of sentences) {
    const next = (cur ? cur + ' ' : '') + s.trim();
    if (next.length > maxLen && cur) {
      chunks.push(cur);
      cur = s.trim();
    } else {
      cur = next;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

export function isReadAloudSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// getText: () => string — pulled fresh from the DOM at play time so it
// always reflects what's actually on screen.
// resetKey: changes (e.g. tab/day index) stop any in-progress reading —
// otherwise it would keep narrating content the user has since left.
export function ReadAloudButton({ getText, resetKey, style, size = 34 }) {
  const [speaking, setSpeaking] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    try { window.speechSynthesis?.cancel(); } catch (_) {}
    cancelledRef.current = true;
    setSpeaking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch (_) {} }, []);

  function stop() {
    cancelledRef.current = true;
    try { window.speechSynthesis.cancel(); } catch (_) {}
    setSpeaking(false);
  }

  function play() {
    if (!isReadAloudSupported()) return;
    const text = (getText() || '').trim();
    if (!text) return;
    try { window.speechSynthesis.cancel(); } catch (_) {}
    const chunks = splitIntoChunks(text);
    if (!chunks.length) return;
    cancelledRef.current = false;
    setSpeaking(true);
    chunks.forEach((chunk, i) => {
      const u = new SpeechSynthesisUtterance(chunk);
      if (i === chunks.length - 1) {
        u.onend = () => { if (!cancelledRef.current) setSpeaking(false); };
        u.onerror = () => { if (!cancelledRef.current) setSpeaking(false); };
      }
      window.speechSynthesis.speak(u);
    });
  }

  function toggle() {
    if (speaking) stop(); else play();
  }

  if (!isReadAloudSupported()) return null;

  return (
    <button
      onClick={toggle}
      aria-label={speaking ? "Stop reading aloud" : "Read aloud"}
      style={{
        width: size, height: size, borderRadius: '50%',
        border: 'none', cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: speaking ? 'rgba(138,158,132,0.92)' : 'rgba(247,243,236,0.92)',
        boxShadow: '0 1px 6px rgba(44,36,22,0.15)',
        transition: 'background 0.2s ease',
        ...style,
      }}>
      {speaking ? (
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="1.5" fill="white"/></svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2C2416" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H3v6h3l5 4V5Z"/>
          <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
          <path d="M18 6a9 9 0 0 1 0 12"/>
        </svg>
      )}
    </button>
  );
}
