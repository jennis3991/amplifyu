import { useState, useRef, useEffect } from 'react';
import { T } from '../theme.js';

// ── Design tokens ────────────────────────────────────────────────────────────
const INK   = '#1a1a18';
const BONE  = '#f5f2eb';
const SLATE = '#8a8a7a';
const GOLD  = '#c9a84c';
const SAGE  = '#6b7f6e';
const BORDER = '#e8e4dc';

// ── Data ─────────────────────────────────────────────────────────────────────
const TOPIC_PROMPTS = {
  work: [
    "Explain a challenge you solved recently.",
    "What makes a team truly effective?",
    "Describe the best leader you've worked with.",
    "Tell us about a difficult decision you made.",
    "What frustrates you most at work — and why?",
    "Describe a project you're proud of.",
    "How do you handle disagreement with a colleague?",
    "What does success look like in your role?",
  ],
  personal: [
    "Describe a moment that changed how you see the world.",
    "What's something you've changed your mind about?",
    "Tell us about someone who shaped who you are.",
    "What do you believe that most people don't?",
    "Describe a failure that taught you something important.",
    "What motivates you when things get hard?",
  ],
  spontaneous: [
    "Explain your job to a 10-year-old.",
    "What would you do with an extra hour every day?",
    "If you could fix one thing about your industry, what would it be?",
    "What's the best advice you've ever received?",
    "Describe your ideal working environment.",
    "What are you currently trying to get better at?",
  ],
};

const DAY_COACH_FOCUS = {
  1:  "Clarity & message focus — this is the user's baseline session",
  2:  "Filler word awareness and the power of confident pausing",
  3:  "Storytelling structure — beginning, conflict, resolution",
  4:  "Executive presence and authoritative tone",
  5:  "Concise communication — editing yourself in real time",
  6:  "Listening signals and conversational responsiveness",
  7:  "Emotional intelligence in professional communication",
  8:  "Persuasion and framing — making ideas land",
  9:  "Gravitas and commanding a room",
  10: "Impromptu speaking — structure under pressure",
  11: "Stakeholder communication and reading the room",
  12: "Negotiation language and assertive communication",
  13: "Inspiring others — motivation through narrative",
  14: "Signature communication style — integrating all skills",
};

const COACH_SYSTEM_PROMPT = `You are the AmplifyU coach — a world-class executive communication coach who genuinely believes in every person's potential and refuses to let them play small.

YOUR PERSONALITY:
Calm. You speak with certainty, never urgency. Never frantic, never loud.
Intelligent. Evidence-based. Sophisticated. You teach principles, not hacks.
Encouraging. You see potential before the learner sees it themselves.
Challenging. You gently raise standards without diminishing confidence.
Optimistic. You believe communication can change lives through compounding.

YOUR VOICE:
Never say "Great job!" — say "That's progress."
Never say "Amazing work!" — say "You're developing a skill that compounds."
Never say "You got this." — say "Confidence follows competence. Keep practising."
Never use: "unfortunately", "however you", "but you", or any diminishing phrase.
Tone blend: 90% executive coach, 80% supportive mentor, 40% academic rigour.
Always second person. Warm but never sycophantic.

YOUR BELIEFS (weave these in naturally):
Communication is a skill that compounds.
Clarity creates confidence.
Confidence follows competence.
The goal isn't perfection. The goal is progress.
Small improvements repeated consistently create extraordinary outcomes.
Authenticity beats performance.

SCORING:
overallScore: realistic integer 0–100. Most users score 55–80. Reserve 85+ for truly exceptional delivery. Day 1 users are establishing their baseline — frame accordingly.
clarityProfile: score each of clarity, structure, brevity, simplicity, focus independently.
overallScore = clarity×0.30 + structure×0.25 + focus×0.20 + brevity×0.15 + simplicity×0.10

FEEDBACK RULES:
whatCameAcrossWell: exactly 3 genuine strengths. Never generic. Reference the actual transcript.
biggestOpportunity: the single highest-impact improvement. Frame as an action, not a deficit.
coachSays: exactly 2 sentences. First: acknowledge what worked. Second: the one clear shift.
hearItBack: 3–5 notable moments with approximate timestamps in seconds. Estimate timestamps based on transcript length and where patterns occur. Types: "filler" | "ramble" | "strength" | "unclear" | "pause"
focusNextRound: 4–5 short pill labels (2–4 words each) — specific, actionable.
scoreHeadline: one diagnostic sentence, second person. Do NOT start with "You".
scoreSubline: one brief, forward-looking encouragement. Max 10 words.

If transcript is very short (under 30 words): score conservatively, note brevity kindly, still return all fields.
Return ONLY valid JSON. No preamble. No markdown fences. No explanation.
Exactly this shape:
{
  "overallScore": number,
  "scoreHeadline": string,
  "scoreSubline": string,
  "clarityProfile": {
    "clarity": number,
    "structure": number,
    "brevity": number,
    "simplicity": number,
    "focus": number
  },
  "whatCameAcrossWell": [
    { "title": string, "description": string },
    { "title": string, "description": string },
    { "title": string, "description": string }
  ],
  "biggestOpportunity": { "title": string, "description": string },
  "coachSays": string,
  "hearItBack": [
    { "label": string, "timestamp": number, "type": string }
  ],
  "focusNextRound": [string]
}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime(s) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

// Seeded pseudo-random bar heights for consistent waveform rendering
function genBars(count, seed) {
  const out = [];
  let s = seed >>> 0;
  for (let i = 0; i < count; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    out.push(4 + (s % 28));
  }
  return out;
}

const MOMENT_COLORS = { filler: GOLD, strength: '#4a7a5c', ramble: '#b85c4a', unclear: '#c47a5a' };

function barColor(idx, total, moments, dur) {
  if (!moments?.length || !dur) return '#d0ccc4';
  for (const m of moments) {
    const pos = Math.floor((m.timestamp / dur) * total);
    if (Math.abs(idx - pos) <= 1) return MOMENT_COLORS[m.type] || '#d0ccc4';
  }
  return '#d0ccc4';
}

// ── Pentagon SVG ──────────────────────────────────────────────────────────────
function Pentagon({ scores }) {
  const W = 180, H = 180, cx = 90, cy = 90, R = 68;
  const KEYS   = ['clarity','structure','brevity','simplicity','focus'];
  const LABELS = ['Clarity','Structure','Brevity','Simplicity','Focus'];
  const angles = KEYS.map((_, i) => (i * 2 * Math.PI / 5) - Math.PI / 2);
  const pt = (a, r) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  const rings = [0.25, 0.5, 0.75, 1];
  const scorePts = KEYS.map((k, i) => pt(angles[i], R * ((scores[k] || 0) / 100))).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ flexShrink: 0 }}>
      {rings.map(r => (
        <polygon key={r} points={angles.map(a => pt(a, R * r)).join(' ')}
          fill="none" stroke="rgba(107,127,110,0.18)" strokeWidth="1" />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)}
          stroke="rgba(107,127,110,0.18)" strokeWidth="1" />
      ))}
      <polygon points={scorePts} fill="rgba(107,127,110,0.22)" stroke={SAGE} strokeWidth="1.8" strokeLinejoin="round" />
      {KEYS.map((k, i) => {
        const v = (scores[k] || 0) / 100;
        const a = angles[i];
        return <circle key={i} cx={cx + R * v * Math.cos(a)} cy={cy + R * v * Math.sin(a)} r="4" fill={SAGE} />;
      })}
      {LABELS.map((lbl, i) => {
        const a = angles[i];
        const lx = cx + (R + 20) * Math.cos(a);
        const ly = cy + (R + 20) * Math.sin(a);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fontSize="9.5" fill={SLATE} fontFamily={T.sans} fontWeight="500">
            {lbl}
          </text>
        );
      })}
    </svg>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
const SecLabel = ({ children }) => (
  <div style={{ fontSize: 9, fontWeight: 700, color: SLATE, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 14, fontFamily: T.sans }}>
    {children}
  </div>
);

// ── Card wrapper ──────────────────────────────────────────────────────────────
const Card = ({ dark, children, style = {} }) => (
  <div style={{
    background: dark ? INK : '#fff',
    borderRadius: 12,
    border: dark ? 'none' : `0.5px solid ${BORDER}`,
    padding: '20px 22px',
    marginBottom: 14,
    ...style,
  }}>
    {children}
  </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AICoachTab({ dayNumber = 1, dayTitle = '', isDesktop = false }) {
  const canRecord = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

  const [step,        setStep]        = useState('intro');   // intro|topic|recording|analysing|results
  const [category,   setCategory]    = useState('work');
  const [prompt,     setPrompt]      = useState(null);
  const [recording,  setRecording]   = useState(false);
  const [timeLeft,   setTimeLeft]    = useState(120);
  const [recDur,     setRecDur]      = useState(0);
  const [transcript, setTranscript]  = useState('');
  const [textInput,  setTextInput]   = useState('');
  const [audioBlob,  setAudioBlob]   = useState(null);
  const [results,    setResults]     = useState(null);
  const [err,        setErr]         = useState(null);   // null|'mic'|'speech'|'transcribe'|'api'
  const [playing,    setPlaying]     = useState(false);
  const [starred,    setStarred]     = useState(false);
  const [barsReady,  setBarsReady]   = useState(false);

  const mrRef    = useRef(null);   // MediaRecorder
  const chunksRef= useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const waveRef  = useRef(null);
  const phaseRef = useRef(0);
  const durRef   = useRef(0);      // live recording duration for the async stop→transcribe closure

  // Trigger bar animation on results mount
  useEffect(() => {
    if (step === 'results') { setTimeout(() => setBarsReady(true), 120); }
    else setBarsReady(false);
  }, [step]);

  // Animated waveform during recording
  useEffect(() => {
    if (!recording) { cancelAnimationFrame(waveRef.current); return; }
    const bars = document.querySelectorAll('[data-wavebar]');
    const tick = () => {
      phaseRef.current += 0.09;
      bars.forEach((b, i) => {
        b.style.height = (6 + Math.abs(Math.sin(phaseRef.current + i * 0.55)) * 30) + 'px';
      });
      waveRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(waveRef.current);
  }, [recording]);

  // ── Recording controls ────────────────────────────────────────────────────
  async function startRecording() {
    setTranscript('');
    setTimeLeft(120); setRecDur(0); durRef.current = 0;
    setAudioBlob(null); setErr(null);

    // MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mr;
      try { mr = new MediaRecorder(stream, { mimeType: 'audio/webm' }); }
      catch { mr = new MediaRecorder(stream); }
      mrRef.current = mr;
      chunksRef.current = [];
      mr.addEventListener('dataavailable', e => chunksRef.current.push(e.data));
      mr.addEventListener('stop', () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        transcribeAndAnalyze(blob, durRef.current);
      });
      mr.start();
    } catch {
      setErr('mic'); return;
    }

    // Countdown timer
    const t0 = Date.now();
    setRecording(true);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - t0) / 1000);
      const left    = 120 - elapsed;
      setTimeLeft(Math.max(0, left));
      setRecDur(elapsed); durRef.current = elapsed;
      if (left <= 0) doStop();
    }, 500);
  }

  function doStop() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRecording(false);
    if (mrRef.current && mrRef.current.state !== 'inactive') {
      try { mrRef.current.stop(); } catch { setErr('mic'); }
    } else {
      setErr('mic');
    }
  }

  function stopRecording() { doStop(); }

  // ── Transcription (server-side Whisper) ───────────────────────────────────
  async function transcribeAndAnalyze(blob, dur) {
    setStep('analysing');
    try {
      const b64 = await blobToB64(blob);
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ b64, mimeType: 'audio/webm' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('transcribe');
      const text = (data.text || '').trim();
      if (!text) { setErr('speech'); setStep('recording'); return; }
      setTranscript(text);
      callCoach(text, dur);
    } catch {
      setErr('transcribe'); setStep('recording');
    }
  }

  // ── Anthropic call ────────────────────────────────────────────────────────
  async function callCoach(tx, dur) {
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          system: COACH_SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `DAY: ${dayNumber} — ${DAY_COACH_FOCUS[dayNumber] || 'Communication fundamentals'}\nPROMPT: "${prompt}"\nDURATION: ${dur} seconds\nTRANSCRIPT: "${tx}"`,
          }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('api');
      let raw = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      raw = raw.replace(/```json\n?|\n?```/g, '').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('parse');
      setResults(JSON.parse(m[0]));
      setStep('results');
    } catch {
      setErr('api');
      setStep('recording');
    }
  }

  // ── Audio playback ────────────────────────────────────────────────────────
  function togglePlay() {
    if (!audioBlob) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
      return;
    }
    const url = URL.createObjectURL(audioBlob);
    const a   = new Audio(url);
    audioRef.current = a;
    a.play().catch(() => {});
    setPlaying(true);
    a.addEventListener('ended', () => { setPlaying(false); audioRef.current = null; URL.revokeObjectURL(url); });
  }

  // ── Shared button styles ──────────────────────────────────────────────────
  const btnPrimary = { width: '100%', padding: '15px', borderRadius: 50, border: 'none', background: INK, color: BONE, fontSize: 14, fontWeight: 600, fontFamily: T.sans, cursor: 'pointer' };
  const btnSecondary = { width: '100%', padding: '15px', borderRadius: 50, border: `1.5px solid ${BORDER}`, background: BONE, color: INK, fontSize: 14, fontWeight: 600, fontFamily: T.sans, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 };

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP: INTRO
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'intro') return (
    <div style={{ padding: '28px 22px 40px', fontFamily: T.sans }}>
      <div style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 600, color: INK, lineHeight: 1.15, marginBottom: 6 }}>
        Your Digital Communication Coach
      </div>
      <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.65, marginBottom: 24 }}>
        Speak for 60–120 seconds. Get structured, personalised feedback on your clarity, structure, and presence.
      </p>

      {/* 5-step explainer */}
      <div style={{ background: '#f7f5f0', borderRadius: 10, padding: '18px 20px', marginBottom: 20 }}>
        {[
          ['Choose a topic',       'Pick a prompt that feels relevant right now.'],
          ['Speak naturally',      'Record yourself — no editing, no pressure.'],
          ['Get your profile',     'Clarity, structure, brevity, simplicity, focus.'],
          ['Hear it back',         'See the moments that stood out — good and not yet.'],
          ['Improve your score',   'One round of feedback changes everything.'],
        ].map(([title, desc], i, arr) => (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < arr.length - 1 ? 14 : 0, marginBottom: i < arr.length - 1 ? 14 : 0, borderBottom: i < arr.length - 1 ? `0.5px solid ${BORDER}` : 'none' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: SAGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{i + 1}</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 12, color: SLATE, lineHeight: 1.55 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Day focus badge */}
      <div style={{ background: 'rgba(107,127,110,0.1)', borderRadius: 8, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: SAGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1l1.2 3.6H12L9 6.7l1.2 3.5L7 8.3 3.8 10.2 5 6.7 2 4.6h3.8z" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: SAGE, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 2 }}>Day {dayNumber} Focus</div>
          <div style={{ fontSize: 12, color: INK, lineHeight: 1.4 }}>{DAY_COACH_FOCUS[dayNumber] || 'Communication fundamentals'}</div>
        </div>
      </div>

      <button onClick={() => setStep('topic')} style={btnPrimary}>
        Choose a Topic to Begin →
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP: TOPIC CHOOSER
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'topic') return (
    <div style={{ padding: '22px 22px 40px', fontFamily: T.sans }}>
      <button onClick={() => setStep('intro')} style={{ background: 'none', border: 'none', color: SLATE, fontSize: 12, cursor: 'pointer', marginBottom: 18, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke={SLATE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back
      </button>

      <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: INK, marginBottom: 4 }}>Choose Your Topic</div>
      <p style={{ fontSize: 12, color: SLATE, marginBottom: 18 }}>Pick one that feels relevant right now.</p>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {['work', 'personal', 'spontaneous'].map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '7px 14px', borderRadius: 20,
            border: `1px solid ${category === cat ? SAGE : BORDER}`,
            background: category === cat ? 'rgba(107,127,110,0.1)' : 'transparent',
            color: category === cat ? SAGE : SLATE,
            fontSize: 12, fontWeight: category === cat ? 600 : 400,
            fontFamily: T.sans, cursor: 'pointer', textTransform: 'capitalize',
          }}>{cat}</button>
        ))}
      </div>

      {/* Prompts list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TOPIC_PROMPTS[category].map((p, i) => (
          <button key={i} onClick={() => { setPrompt(p); setStep('recording'); setErr(null); }} style={{
            width: '100%', padding: '14px 16px', borderRadius: 10,
            border: `0.5px solid ${BORDER}`, background: '#fff',
            color: INK, fontSize: 13, fontFamily: T.sans, cursor: 'pointer',
            textAlign: 'left', lineHeight: 1.55,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <span>{p}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M4 7h6M7 4l3 3-3 3" stroke={SLATE} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP: RECORDING
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'recording') {
    const circR  = 52;
    const circC  = 2 * Math.PI * circR;
    const offset = circC * (timeLeft / 120);   // full at start, shrinks as time passes

    return (
      <div style={{ padding: '22px 22px 40px', fontFamily: T.sans }}>
        {!recording && (
          <button onClick={() => setStep('topic')} style={{ background: 'none', border: 'none', color: SLATE, fontSize: 12, cursor: 'pointer', marginBottom: 18, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke={SLATE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
        )}

        {/* Error banners */}
        {err === 'mic' && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '11px 14px', marginBottom: 16, fontSize: 12, color: '#b91c1c', lineHeight: 1.5 }}>
            Microphone access is needed for your coach session. Please enable it in your browser settings.
          </div>
        )}
        {err === 'speech' && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '11px 14px', marginBottom: 16, fontSize: 12, color: '#b91c1c', lineHeight: 1.5 }}>
            We didn't catch that. Make sure your microphone is enabled and try again.
          </div>
        )}
        {err === 'transcribe' && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '11px 14px', marginBottom: 16, fontSize: 12, color: '#b91c1c', lineHeight: 1.5 }}>
            We couldn't process that recording — please try again.
          </div>
        )}
        {err === 'api' && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '11px 14px', marginBottom: 16, fontSize: 12, color: '#b91c1c', lineHeight: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span>Your coach is taking a moment — please try again.</span>
            <button onClick={() => { setErr(null); setStep('analysing'); callCoach(transcript, recDur); }} style={{ background: 'none', border: 'none', color: SAGE, fontWeight: 700, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>Retry</button>
          </div>
        )}

        {/* Prompt card */}
        <div style={{ background: '#f7f5f0', borderRadius: 10, padding: '14px 16px', marginBottom: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: SAGE, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 6 }}>Your Prompt</div>
          <div style={{ fontFamily: T.serif, fontSize: 16, color: INK, lineHeight: 1.5 }}>{prompt}</div>
        </div>

        {/* No recording capability fallback */}
        {!canRecord && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: SLATE, marginBottom: 8, lineHeight: 1.5 }}>
              Voice recording isn't available on this device. You can also type your response below.
            </div>
            <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Type your response here…"
              style={{ width: '100%', minHeight: 130, padding: '12px', borderRadius: 8, border: `1px solid ${BORDER}`, fontFamily: T.sans, fontSize: 13, color: INK, resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }} />
          </div>
        )}

        {/* Timer circle */}
        {canRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: recording ? 20 : 28 }}>
            <svg width="130" height="130">
              {/* Track */}
              <circle cx="65" cy="65" r={circR} fill="none" stroke={BORDER} strokeWidth="5" />
              {/* Progress arc — shrinks as time passes */}
              <circle cx="65" cy="65" r={circR} fill="none"
                stroke={timeLeft <= 20 ? '#b85c4a' : SAGE} strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circC}
                strokeDashoffset={circC - offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '65px 65px', transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s' }}
              />
              <text x="65" y="59" textAnchor="middle" fontSize="24" fontWeight="600" fill={INK} fontFamily={T.sans}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </text>
              <text x="65" y="76" textAnchor="middle" fontSize="10" fill={SLATE} fontFamily={T.sans}>
                {recording ? 'recording' : 'seconds'}
              </text>
            </svg>
          </div>
        )}

        {/* Animated waveform */}
        {recording && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 52, marginBottom: 20 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} data-wavebar="1"
                style={{ width: 5, height: 8, background: SAGE, borderRadius: 3, transition: 'height 0.05s ease' }} />
            ))}
          </div>
        )}

        {/* CTA buttons */}
        {!recording
          ? <button onClick={startRecording} style={btnPrimary}>Start Recording</button>
          : <button onClick={stopRecording} style={btnSecondary}>
              <div style={{ width: 13, height: 13, background: '#c0392b', borderRadius: 2 }} />
              Stop & Analyse
            </button>
        }

        {/* Text fallback submit */}
        {!canRecord && textInput.trim() && !recording && (
          <button onClick={() => { setStep('analysing'); callCoach(textInput, 60); }}
            style={{ ...btnPrimary, marginTop: 10, background: SAGE, borderRadius: 8 }}>
            Analyse My Response →
          </button>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP: ANALYSING
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'analysing') return (
    <div style={{ padding: '48px 24px', fontFamily: T.sans }}>
      <style>{`
        @keyframes ai-pulse { 0%,100%{opacity:1} 50%{opacity:0.78} }
        @keyframes ai-dot { 0%,100%{transform:translateY(0);opacity:0.35} 50%{transform:translateY(-8px);opacity:1} }
      `}</style>
      <div style={{ background: '#f7f5f0', borderRadius: 14, padding: '36px 28px', textAlign: 'center', animation: 'ai-pulse 2.2s ease-in-out infinite' }}>
        <div style={{ fontSize: 36, marginBottom: 14 }}>🎯</div>
        <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 600, color: INK, marginBottom: 8 }}>Analysing your delivery…</div>
        <div style={{ fontSize: 13, color: SLATE, lineHeight: 1.65, maxWidth: 280, margin: '0 auto' }}>
          Your coach is reviewing your transcript for clarity, structure, and presence.
        </div>
        <div style={{ marginTop: 22, display: 'flex', gap: 7, justifyContent: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: SAGE, animation: `ai-dot 1.3s ease-in-out ${i * 0.22}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP: RESULTS
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'results' && results) {
    const totalDur = recDur || 60;
    const cp       = results.clarityProfile || {};
    const bars     = genBars(60, transcript.length || 37);
    const moments  = results.hearItBack || [];

    return (
      <div style={{ padding: '18px 20px 48px', fontFamily: T.sans }}>
        <style>{`@keyframes ai-bar-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }`}</style>

        {/* ── A: CLARITY MIRROR ──────────────────────────────────────── */}
        <Card dark style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 6 }}>
                <span style={{ fontFamily: T.serif, fontSize: 58, fontWeight: 600, color: BONE, lineHeight: 1, letterSpacing: '-2px' }}>{results.overallScore}</span>
                <span style={{ fontSize: 17, color: SLATE, fontFamily: T.sans }}> / 100</span>
              </div>
              <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: BONE, lineHeight: 1.3, maxWidth: 230 }}>{results.scoreHeadline}</div>
              <div style={{ fontSize: 11, color: SLATE, marginTop: 5, lineHeight: 1.4 }}>{results.scoreSubline}</div>
            </div>
            <button onClick={() => setStarred(s => !s)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 4, color: starred ? GOLD : '#555' }}>
              {starred ? '★' : '☆'}
            </button>
          </div>

          {/* Static decorative waveform */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 32, marginBottom: 16 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ flex: 1, height: Math.max(2, Math.round(h * 0.55)), background: 'rgba(245,242,235,0.14)', borderRadius: 2 }} />
            ))}
          </div>

          {/* Play recording */}
          {audioBlob && (
            <button onClick={togglePlay} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '9px 16px', color: BONE, fontSize: 12,
              fontFamily: T.sans, cursor: 'pointer',
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                {playing
                  ? <><rect x="2" y="2" width="4" height="10" rx="1" fill={BONE}/><rect x="8" y="2" width="4" height="10" rx="1" fill={BONE}/></>
                  : <path d="M3 2l9 5-9 5V2z" fill={BONE}/>
                }
              </svg>
              {playing ? 'Pause recording' : '▶ Play my recording'}
            </button>
          )}
        </Card>

        {/* ── B: CLARITY PROFILE ────────────────────────────────────── */}
        <Card>
          <SecLabel>Your Clarity Profile</SecLabel>
          <div style={{ display: 'flex', gap: 16, alignItems: isDesktop ? 'center' : 'flex-start', flexDirection: isDesktop ? 'row' : 'column' }}>
            <Pentagon scores={cp} />
            <div style={{ flex: 1, width: isDesktop ? undefined : '100%' }}>
              {['clarity', 'structure', 'brevity', 'simplicity', 'focus'].map((k, idx) => (
                <div key={k} style={{ marginBottom: idx < 4 ? 11 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: INK, textTransform: 'capitalize', fontWeight: 500 }}>{k}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: SAGE }}>{cp[k] || 0}</span>
                  </div>
                  <div style={{ height: 5, background: '#f0ece6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: SAGE, borderRadius: 3,
                      width: barsReady ? `${cp[k] || 0}%` : '0%',
                      transition: `width 0.85s ease ${idx * 0.08}s`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── C: TWO-COLUMN ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 14 }}>
          {/* What came across well */}
          <div style={{ background: '#fff', borderRadius: 12, border: `0.5px solid ${BORDER}`, padding: '16px' }}>
            <SecLabel>What Came Across Well</SecLabel>
            {(results.whatCameAcrossWell || []).slice(0, 3).map((item, i, arr) => (
              <div key={i} style={{ paddingBottom: i < arr.length - 1 ? 11 : 0, marginBottom: i < arr.length - 1 ? 11 : 0, borderBottom: i < arr.length - 1 ? `0.5px solid #f0ece6` : 'none' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(107,127,110,0.14)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke={SAGE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: INK, marginBottom: 2, lineHeight: 1.3 }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: SLATE, lineHeight: 1.5 }}>{item.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Biggest opportunity */}
          <div style={{ background: '#fff', borderRadius: 12, border: `0.5px solid rgba(201,168,76,0.35)`, padding: '16px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 14, fontFamily: T.sans }}>Biggest Opportunity</div>
            <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2a6 6 0 014.3 10.2V14H5.7v-1.8A6 6 0 0110 2z" stroke={GOLD} strokeWidth="1.3" fill="none"/>
                  <path d="M7.5 16h5M8.5 18.5h3" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: INK, marginBottom: 4, lineHeight: 1.3 }}>{results.biggestOpportunity?.title}</div>
                <div style={{ fontSize: 11, color: SLATE, lineHeight: 1.55 }}>{results.biggestOpportunity?.description}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── D: COACH SAYS ──────────────────────────────────────────── */}
        <Card>
          <div style={{ fontFamily: T.serif, fontSize: 48, color: GOLD, lineHeight: 0.7, marginBottom: 10, opacity: 0.65, userSelect: 'none' }}>"</div>
          <p style={{ fontFamily: T.serif, fontSize: 17, fontStyle: 'italic', color: INK, lineHeight: 1.7, margin: '0 0 16px' }}>
            {results.coachSays}
          </p>
        </Card>

        {/* ── E: HEAR IT BACK ────────────────────────────────────────── */}
        <Card>
          <SecLabel>Hear It Back</SecLabel>

          {/* Moment labels */}
          <div style={{ position: 'relative', height: 30, marginBottom: 6 }}>
            {moments.map((m, i) => {
              const pct = Math.max(2, Math.min(96, (m.timestamp / totalDur) * 100));
              const col = MOMENT_COLORS[m.type] || SLATE;
              return (
                <div key={i} style={{ position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: col, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.3px' }}>{m.label}</div>
                  <div style={{ fontSize: 8, color: col, opacity: 0.7 }}>{fmtTime(m.timestamp)}</div>
                </div>
              );
            })}
          </div>

          {/* Colour-coded waveform */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 44, marginBottom: 8 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ flex: 1, height: Math.max(3, Math.round(h * 0.88)), borderRadius: 2, background: barColor(i, 60, moments, totalDur) }} />
            ))}
          </div>

          {/* Timeline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: SLATE, marginBottom: audioBlob ? 16 : 0 }}>
            <span>0:00</span>
            <span>{fmtTime(totalDur)}</span>
          </div>

          {/* Play button */}
          {audioBlob && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={togglePlay} style={{ width: 48, height: 48, borderRadius: '50%', background: INK, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  {playing
                    ? <><rect x="3" y="2" width="3.5" height="11" rx="1" fill={BONE}/><rect x="8.5" y="2" width="3.5" height="11" rx="1" fill={BONE}/></>
                    : <path d="M4 2l9 5.5-9 5.5V2z" fill={BONE}/>
                  }
                </svg>
              </button>
            </div>
          )}
        </Card>

        {/* ── F: FOCUS NEXT ROUND ────────────────────────────────────── */}
        <Card>
          <SecLabel>Focus Next Round</SecLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(results.focusNextRound || []).map((item, i) => (
              <span key={i} style={{ padding: '6px 14px', borderRadius: 20, border: `0.5px solid #d5d0c8`, background: BONE, fontSize: 11, color: INK, fontWeight: 500, fontFamily: T.sans }}>
                {item}
              </span>
            ))}
          </div>
        </Card>

        {/* ── G: IMPROVE MY SCORE ────────────────────────────────────── */}
        <Card dark>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8, fontFamily: T.sans }}>Ready for Round Two?</div>
          <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: BONE, marginBottom: 6, lineHeight: 1.3 }}>One more round while the feedback is fresh.</div>
          <p style={{ fontSize: 12, color: SLATE, lineHeight: 1.65, marginBottom: 20 }}>
            Now that you know what to improve, try again. Small shifts, consistently repeated, change everything.
          </p>
          <button onClick={() => { setStep('recording'); setRecording(false); setTranscript(''); setTimeLeft(120); setRecDur(0); setErr(null); setResults(null); setBarsReady(false); }}
            style={{ padding: '13px 24px', borderRadius: 8, border: 'none', background: SAGE, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: T.sans, cursor: 'pointer', marginBottom: 8, display: 'block' }}>
            Improve My Score →
          </button>
          <div style={{ fontSize: 11, color: '#555' }}>Expected gain: +10–20 points</div>
        </Card>

      </div>
    );
  }

  return null;
}
