import { useEffect, useRef, useState } from 'react';

const PAUSE_MS = 350; // gap between spoken chunks
const RATE = 0.9; // slightly slower than default for a calmer cadence

// iOS WebKit's SpeechSynthesis silently stops mid-utterance on long text
// (empirically ~15s+). Splitting at real sentence boundaries — rather than
// grouping several sentences into one utterance — both avoids that cutoff
// and, combined with the inter-chunk pause below, gives natural cadence
// instead of sentences running together.  A single sentence longer than
// maxLen (rare) is still broken at word boundaries as a safety fallback,
// never merged with neighboring sentences.
function splitIntoChunks(text, maxLen = 200) {
  const sentences = text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]*/g) || [];
  const chunks = [];
  for (let s of sentences) {
    s = s.trim();
    if (!s) continue;
    if (s.length <= maxLen) { chunks.push(s); continue; }
    let rest = s;
    while (rest.length > maxLen) {
      let cut = rest.lastIndexOf(' ', maxLen);
      if (cut <= 0) cut = maxLen;
      chunks.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) chunks.push(rest);
  }
  return chunks;
}

// Section eyebrows ("THE SCIENCE", "COMMUNICATION COLLECTION", "THE REAL
// LESSON", per-card "superpower" tags, etc.) all share one visual formula
// throughout the app: small uppercase text with letter-spacing. There's no
// shared class name for it (everything is inline-styled), so it's detected
// by that rendered signature instead of by markup.
function isEyebrowLabel(el) {
  const cs = window.getComputedStyle(el);
  if (cs.textTransform !== 'uppercase') return false;
  const size = parseFloat(cs.fontSize);
  if (!(size <= 12)) return false;
  const ls = cs.letterSpacing;
  return ls && ls !== 'normal' && ls !== '0px';
}

// Numbered-step markers ("01", "02" …) render as their own leaf element
// containing nothing but a bare 1-2 digit number — distinct from a stat
// like "30%" or "14 days", which always has surrounding text.
function isBareNumberMarker(el) {
  if (el.children.length > 0) return false;
  const t = (el.textContent || '').trim();
  return /^\d{1,2}$/.test(t);
}

// Walks a subtree collecting only real content text, skipping eyebrow
// labels and bare numeral markers (and their whole subtree, in case either
// ever wraps a nested span) so they're never read aloud.
export function extractReadableText(root) {
  if (!root) return '';
  const parts = [];
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent.replace(/\s+/g, ' ').trim();
      if (t) parts.push(t);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node;
    const cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    if (isEyebrowLabel(el) || isBareNumberMarker(el)) return;
    for (const child of el.childNodes) walk(child);
  }
  walk(root);
  return parts.join(' ');
}

// Plain mic glyph — no side waveform bars, kept deliberately quiet (no
// circle/oval container). Hero images range from near-black photos to pale
// illustrations, so the shape renders twice: a soft dark halo sized
// slightly larger first, then the crisp foreground color on top — keeps
// the icon legible either way without a background shape.
function MicWaveIcon({ color }) {
  const halo = 'rgba(15,12,8,0.55)';
  return (
    <>
      <rect x="12.7" y="5.2" width="6.6" height="11.6" rx="3.3" fill={halo}/>
      <path d="M9 14.5a7 7 0 0 0 14 0" stroke={halo} strokeWidth="3.2" strokeLinecap="round" fill="none"/>
      <line x1="16" y1="21.5" x2="16" y2="25.5" stroke={halo} strokeWidth="3.2" strokeLinecap="round"/>
      <line x1="12" y1="25.5" x2="20" y2="25.5" stroke={halo} strokeWidth="3.2" strokeLinecap="round"/>

      <rect x="13.5" y="6" width="5" height="10" rx="2.5" fill={color}/>
      <path d="M9 14.5a7 7 0 0 0 14 0" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <line x1="16" y1="21.5" x2="16" y2="25.5" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="12" y1="25.5" x2="20" y2="25.5" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </>
  );
}

export function isReadAloudSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// getText: () => string — pulled fresh from the DOM at play time so it
// always reflects what's actually on screen.
// resetKey: changes (e.g. tab/day index) stop any in-progress reading —
// otherwise it would keep narrating content the user has since left.
export function ReadAloudButton({ getText, resetKey, style, size = 30 }) {
  const [speaking, setSpeaking] = useState(false);
  const cancelledRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try { window.speechSynthesis?.cancel(); } catch (_) {}
    cancelledRef.current = true;
    setSpeaking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try { window.speechSynthesis?.cancel(); } catch (_) {}
  }, []);

  function stop() {
    cancelledRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try { window.speechSynthesis.cancel(); } catch (_) {}
    setSpeaking(false);
  }

  function speakFrom(chunks, i) {
    if (cancelledRef.current) return;
    if (i >= chunks.length) { setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(chunks[i]);
    u.rate = RATE;
    const advance = () => {
      if (cancelledRef.current) return;
      if (i + 1 >= chunks.length) { setSpeaking(false); return; }
      timeoutRef.current = setTimeout(() => speakFrom(chunks, i + 1), PAUSE_MS);
    };
    u.onend = advance;
    u.onerror = advance;
    window.speechSynthesis.speak(u);
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
    speakFrom(chunks, 0);
  }

  function toggle() {
    if (speaking) stop(); else play();
  }

  if (!isReadAloudSupported()) return null;

  const iconColor = speaking ? '#E7C27A' : '#F5EFE6';

  return (
    <button
      onClick={toggle}
      aria-label={speaking ? "Stop reading aloud" : "Read aloud"}
      style={{
        width: size, height: size, padding: 0,
        border: 'none', background: 'transparent', cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.55))',
        ...style,
      }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <g style={speaking ? { animation: 'auReadAloudPulse 1s ease-in-out infinite' } : undefined}>
          <MicWaveIcon color={iconColor}/>
        </g>
      </svg>
      <style>{`@keyframes auReadAloudPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }`}</style>
    </button>
  );
}
