import { useState, useEffect, useRef } from 'react';
import { VoiceRecorder } from './VoiceRecorder.jsx';
import { useSequentialDots, SequentialDots } from './SequentialDots.jsx';

function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

const SCENARIOS = [
  {
    id: 'hallway',
    label: 'The Hallway Moment',
    sub: 'A senior leader walks past',
    context: 'A senior leader you respect is walking towards you. You have about 10 seconds before they pass.',
    challenge: 'Most people look down, say nothing, and spend the rest of the day replaying the missed moment.',
    promptLead: "They're about to walk past.",
    promptDetail: "A senior leader you respect is a few steps away, moving quickly, phone in hand. Before they're gone, say one specific line that opens the door — their name, a genuine observation, and a question.",
    tips: [
      "Use their name — it signals confidence, not presumption",
      "One specific observation, not a generic compliment",
      "End with a question — it invites a response and keeps the door open",
    ],
    example: "[Name] — I'm [your name]. I've been following the [project] and had a thought about [X]. Worth five minutes this week?",
  },
  {
    id: 'meeting',
    label: 'The Meeting Moment',
    sub: 'You have an idea — the room is moving on',
    context: 'You have something worth saying. The conversation is about to close and move on.',
    challenge: "Most people think \"I'll raise it later\" — and never do. The moment disappears in seconds.",
    promptLead: "The meeting's about to move on.",
    promptDetail: "The team's been debating whether to hire externally or promote from within for the new lead role. Before it shifts to the next topic, say one specific point that makes clear the value you'd bring to that decision.",
    tips: [
      "Don't apologise for contributing — \"Before we move on...\" is enough",
      "Lead with the idea, not the build-up",
      "Be brief — let the idea land before you explain it",
    ],
    example: "Before we move on — I think there's something worth naming here. [One sentence.] Happy to pick it up after if useful.",
  },
  {
    id: 'room',
    label: 'The Room Moment',
    sub: 'Someone worth knowing is standing nearby',
    context: "After a presentation or at an event. Someone you'd genuinely like to know is standing near you.",
    challenge: 'Most people check their phone and leave wishing they had said something.',
    promptLead: "This is the moment to say something.",
    promptDetail: "Someone you'd genuinely like to know is standing a few feet away, and no one's talking to them right now. Say one specific, curious line that opens a real conversation — reference something they actually said or did, not a generic compliment.",
    tips: [
      "Specific beats generic — reference something they actually said",
      "Ask a question that shows you were genuinely paying attention",
      "Don't pitch yourself — get curious about them first",
    ],
    example: "You said something interesting about [X] — I hadn't thought about it that way. How did you arrive at that?",
  },
];

// ─── D13 Practice Widget ───────────────────────────────────────────────────
function pickScenarioIdx() { return Math.floor(Math.random() * SCENARIOS.length); }

export function D13PracticeWidget({T, T2, isDesktop, onSimulation, onNavLabel, onNavFn}) {
  const [phase, setPhase] = useState('intro');
  const [scIdx, setScIdx] = useState(pickScenarioIdx);
  const [recDone, setRecDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!onNavLabel) return;
    if (phase === 'complete') {
      onNavLabel("Continue");
      if (onNavFn) onNavFn.current = () => onSimulation?.();
    } else {
      onNavLabel(null);
      if (onNavFn) onNavFn.current = null;
    }
  }, [phase]);

  const cs = {
    card: {background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"18px"},
    label: {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8},
    cta: {width:"100%", padding:isDesktop?"14px":"13px", borderRadius:4, border:"none", background:T.ink, color:T.bg, fontSize:isDesktop?15:14, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:48, transition:"all 0.2s"},
  };

  if (phase === 'intro') return (
    <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Opportunities Travel Through People</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:"0 0 14px"}}>Most career-defining moments come from conversations, not job boards.</p>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:0}}>The problem is not knowing this — it's that most people freeze when the moment arrives. Quick warm-up: one real moment, 20 seconds. It will happen to you.</p>
      </div>
      <button onClick={() => { setRecDone(false); setAnalyzing(false); setFeedback(null); setPhase('practice'); }} style={cs.cta}>Let's Begin →</button>
    </div>
  );

  if (phase === 'practice') {
    const sc = SCENARIOS[scIdx];

    async function handleDone(text) {
      setRecDone(true);
      setAnalyzing(true);
      try {
        const res = await fetch('/api/claude', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            model: 'claude-sonnet-4-5', max_tokens: 250,
            messages: [{ role: 'user', content:
`You are an executive communication coach. Someone just practised this real-world moment out loud:

Scenario: ${sc.context}
Challenge: ${sc.promptDetail}

What they said: "${text || 'No speech captured.'}"

Give brief, specific coaching. Return ONLY valid JSON:
{"landed":"one encouraging sentence about what worked in their response, referencing what they actually said","improve":["first specific, actionable point to sharpen it","second specific, actionable point to sharpen it"]}` }],
          }),
        });
        const data = await res.json();
        const raw = (data.content||[]).map(b=>b.text||'').join('').trim();
        const m = raw.match(/\{[\s\S]*\}/);
        setFeedback(JSON.parse(m[0]));
      } catch {
        setFeedback({
          landed: "You said something out loud instead of staying silent — that's the hardest part, and you did it.",
          improve: sc.tips.slice(0, 2),
        });
      }
      setAnalyzing(false);
    }

    return (
      <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>

        <div style={cs.card}>
          <div style={cs.label}>{sc.label}</div>
          <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, fontWeight:600, color:T2.text, lineHeight:1.35, margin:"0 0 12px"}}>{sc.context}</p>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:"#A8998A", lineHeight:1.6, margin:0, fontStyle:"italic"}}>{sc.challenge}</p>
        </div>

        {!recDone && (
          <>
            <div style={{...cs.card, borderLeft:"3px solid "+T.gold, padding:isDesktop?"22px 26px":"18px 20px"}}>
              <div style={cs.label}>Your Challenge</div>
              <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.35, margin:"0 0 10px"}}>"{sc.promptLead}"</p>
              <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text, lineHeight:1.65, margin:0}}>{sc.promptDetail}</p>
            </div>
            <VoiceRecorder T={T} T2={T2} onDone={handleDone}/>
          </>
        )}

        {recDone && analyzing && (
          <div style={{...cs.card, textAlign:"center", padding:isDesktop?"28px":"22px"}}>
            <div style={cs.label}>Your coach is listening</div>
            <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, color:T2.text, lineHeight:1.55, margin:0}}>Finding what worked — and what to sharpen.</p>
          </div>
        )}

        {recDone && !analyzing && feedback && (
          <>
            <div style={{...cs.card, background:"rgba(138,158,132,0.06)", borderLeft:"2px solid "+T.gold}}>
              <div style={cs.label}>What Landed</div>
              <p style={{fontFamily:T.serif, fontSize:isDesktop?16:15, color:T2.text, lineHeight:1.6, margin:0}}>{feedback.landed}</p>
            </div>
            <div style={cs.card}>
              <div style={cs.label}>To Sharpen It</div>
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                {(feedback.improve||[]).map((pt,i)=>(
                  <div key={i} style={{display:"flex", gap:8, alignItems:"flex-start"}}>
                    <span style={{fontFamily:T.sans, fontSize:13, color:T.gold, flexShrink:0, lineHeight:1.6}}>•</span>
                    <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text, lineHeight:1.6, margin:0}}>{pt}</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setPhase('complete')} style={cs.cta}>Finish →</button>
          </>
        )}
      </div>
    );
  }

  if (phase === 'complete') return (
    <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>
      <div style={{...cs.card, textAlign:"center", padding:isDesktop?"32px 28px":"26px 20px"}}>
        <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:14}}>Warm-Up Done</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.35, margin:"0 0 12px"}}>You've rehearsed the moment.</p>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:0}}>Every time you practise out loud, the real moment gets easier. The next time one of these arrives, you'll be ready.</p>
      </div>
    </div>
  );

  return null;
}

// ─── D13 Simulation Widget — The Networking Circuit ───────────────────────
const CIRCUIT_CHARS = [
  {
    id: 'renata',
    name: 'Renata Ellis',
    role: 'VP, People & Culture',
    vibe: 'Warm and instantly curious — makes you feel like the only person in the room',
    listensFor: 'genuine warmth and honesty — whether the person opens up with something real rather than a polished, guarded answer',
    lead: "Renata catches your eye during a break in the townhall and comes straight over, warm and unhurried:",
    quote: "I don't think we've properly met yet — I'd love to know, what's something you're proud of lately that most people around here probably don't know about?",
    get question() { return `${this.lead} "${this.quote}" What do you say?`; },
  },
  {
    id: 'theo',
    name: 'Theo Brandt',
    role: 'Head of Product',
    vibe: 'Enthusiastic and down-to-earth — genuinely lights up hearing what people are working on',
    listensFor: 'genuine enthusiasm and plain language over jargon — whether the answer sounds like something a real person would say to a friend',
    lead: "Theo spots you by the coffee station after the townhall and grins:",
    quote: "Okay, real talk — what's something you're working on right now that actually gets you excited?",
    get question() { return `${this.lead} "${this.quote}" What do you say?`; },
  },
];

export function D13SimWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('intro');
  const [charIdx, setCharIdx] = useState(0);
  const [scores, setScores] = useState([null, null]);
  const [debrief, setDebrief] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [recordState, setRecordState] = useState('idle'); // 'idle' | 'recording'
  const [captureFailed, setCaptureFailed] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [fallbackInput, setFallbackInput] = useState('');
  const dotCount = useSequentialDots(phase === 'analyzing');

  const answersRef = useRef(['', '']);
  const scoresRef = useRef([null, null]);
  const charIdxRef = useRef(0);
  const recognitionRef = useRef(null);
  const audioChunksRef = useRef([]);
  const transcriptRef = useRef('');

  useEffect(() => {
    return () => { if (recognitionRef.current && recognitionRef.current.state !== 'inactive') { try { recognitionRef.current.onstop = null; recognitionRef.current.stop(); } catch(e) {} } };
  }, []);

  const startRecording = () => {
    transcriptRef.current = '';
    setTranscript('');
    setInterimText('');
    if (!navigator.mediaDevices?.getUserMedia) { setSpeechSupported(false); return; }
    audioChunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      let mr;
      try { mr = new MediaRecorder(stream, {mimeType: 'audio/webm'}); }
      catch { mr = new MediaRecorder(stream); }
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.start(1000);
      recognitionRef.current = mr;
      setRecordState('recording');
    }).catch(err => {
      console.warn('[speech]', err);
      setSpeechSupported(false);
    });
  };

  // Once speaking is done, there's nothing left for the user to confirm —
  // transcribing and scoring both happen behind the single "{name} is
  // thinking about your answer" loading screen (the 'analyzing' phase).
  const stopRecording = () => {
    const mr = recognitionRef.current;
    if (!mr || mr.state === 'inactive') { setRecordState('idle'); return; }
    setPhase('analyzing');
    mr.onstop = async () => {
      mr.stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
      let text = '';
      try {
        const b64 = await blobToB64(blob);
        const res = await fetch('/api/transcribe', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({b64, mimeType: 'audio/webm'}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Transcription failed');
        text = (data.text || '').trim();
      } catch (err) {
        console.error('[D13SimWidget] transcribe error:', err);
      }
      if (!text) {
        setCaptureFailed(true);
        setRecordState('idle');
        setPhase('question');
        return;
      }
      setCaptureFailed(false);
      transcriptRef.current = text;
      setTranscript(text);
      const ci = charIdxRef.current;
      answersRef.current[ci] = text;
      await scoreChar(ci);
    };
    try { mr.stop(); } catch(e) { setRecordState('idle'); setPhase('question'); }
  };

  const resetRecording = () => {
    if (recognitionRef.current && recognitionRef.current.state !== 'inactive') { try { recognitionRef.current.onstop = null; recognitionRef.current.stop(); } catch(e) {} }
    recognitionRef.current = null;
    transcriptRef.current = '';
    setTranscript('');
    setInterimText('');
    setRecordState('idle');
    setCaptureFailed(false);
    setFallbackInput('');
  };

  const cs = {
    card: {background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"18px"},
    label: {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8},
    cta: {width:"100%", padding:isDesktop?"14px":"13px", borderRadius:4, border:"none", background:T.ink, color:T.bg, fontSize:isDesktop?15:14, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:48, transition:"all 0.2s"},
  };

  const MIC_SVG = (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3"/>
      <path d="M5 10a7 7 0 0 0 14 0"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="8" y1="22" x2="16" y2="22"/>
    </svg>
  );

  const scoreChar = async (ci) => {
    const sc = CIRCUIT_CHARS[ci];
    const answer = answersRef.current[ci];
    const prompt = "You are an expert communication coach evaluating a single networking moment at a company townhall.\n\nCharacter: " + sc.name + " — " + sc.role + "\nPersonality: " + sc.vibe + "\nWhat they're listening for: " + sc.listensFor + "\n\nQuestion — " + sc.question + "\nTheir answer: \"" + answer + "\"\n\nScore them 1-5 on:\n- opening: Was the answer specific, confident, and engaging — not generic?\n- connection: Did they read this person's energy and respond in a way that builds real rapport with them specifically?\n- impression: Would this leave a memorable, positive impression?\n\nRespond ONLY with valid JSON on a single line: {\"opening\":X,\"connection\":X,\"impression\":X,\"note\":\"one specific sentence — what worked or what to try differently next time\"}";
    try {
      const res = await fetch('/api/claude', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({model:'claude-sonnet-4-5', messages:[{role:'user', content:prompt}], max_tokens:200})});
      const data = await res.json();
      const text = data.content?.[0]?.text || '{}';
      const m = text.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : {opening:3, connection:3, impression:3, note:'Good effort in a challenging moment.'};
      scoresRef.current = scoresRef.current.map((s, i) => i === ci ? parsed : s);
      setScores(prev => prev.map((s, i) => i === ci ? parsed : s));
    } catch(e) {
      const fb = {opening:3, connection:3, impression:3, note:'Good effort in a challenging moment.'};
      scoresRef.current = scoresRef.current.map((s, i) => i === ci ? fb : s);
      setScores(prev => prev.map((s, i) => i === ci ? fb : s));
    }
    setPhase('scoring');
  };

  const runDebrief = async () => {
    const all = CIRCUIT_CHARS.map((sc, i) => {
      const a = answersRef.current[i];
      const s = scoresRef.current[i];
      return "--- " + sc.name + " (" + sc.role + ") ---\nQuestion: " + sc.question + "\nAnswer: " + a + "\nScores: Opening " + (s?.opening||0) + "/5, Connection " + (s?.connection||0) + "/5, Impression " + (s?.impression||0) + "/5";
    }).join('\n\n');
    const prompt = "You are an expert communication coach. A user just completed The Networking Circuit at a company townhall — one question each from two very different people. Analyse their answers across both.\n\n" + all + "\n\nGive specific, direct, encouraging coaching based on what they actually wrote.\n\nRespond ONLY with valid JSON on a single line: {\"insight\":\"2-3 specific sentences about their communication pattern\",\"practice\":\"one concrete thing to focus on next time\",\"quote\":\"a short inspiring quote about connection or confidence\"}";
    try {
      const res = await fetch('/api/claude', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({model:'claude-sonnet-4-5', messages:[{role:'user', content:prompt}], max_tokens:350})});
      const data = await res.json();
      const text = data.content?.[0]?.text || '{}';
      const m = text.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      setDebrief(parsed || {insight:'You completed the full circuit.', practice:'Focus on making your opening line specific to the person in front of you.', quote:'Every great professional relationship began with one brave sentence.'});
    } catch(e) {
      setDebrief({insight:'You completed the full circuit.', practice:'Focus on making your opening line specific to the person in front of you.', quote:'Every great professional relationship began with one brave sentence.'});
    }
    setPhase('debrief');
  };

  const handleSubmit = async () => {
    const answer = (speechSupported ? transcript : fallbackInput).trim();
    if (!answer) return;
    const ci = charIdxRef.current;
    answersRef.current[ci] = answer;
    resetRecording();
    setPhase('analyzing');
    await scoreChar(ci);
  };

  const handleNext = async () => {
    const nextIdx = charIdxRef.current + 1;
    if (nextIdx < CIRCUIT_CHARS.length) {
      charIdxRef.current = nextIdx;
      setCharIdx(nextIdx);
      resetRecording();
      setPhase('question');
    } else {
      setPhase('debriefing');
      await runDebrief();
    }
  };

  const reset = () => {
    charIdxRef.current = 0;
    answersRef.current = ['', ''];
    scoresRef.current = [null, null];
    setCharIdx(0);
    setPhase('intro');
    setScores([null, null]);
    setDebrief(null);
    resetRecording();
  };

  if (phase === 'intro') return (
    <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>The Networking Circuit · Simulation</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:"0 0 12px"}}>Two people at a company townhall. Two real conversations. One chance to make an impression.</p>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:0}}>Your AmplifyU Coach sets the scene and asks one question per person. Speak out loud what you would actually say — then get scored on your opening, connection, and the impression you leave.</p>
      </div>
      {CIRCUIT_CHARS.map((sc, i) => (
        <div key={sc.id} style={{...cs.card, display:"flex", alignItems:"flex-start", gap:14}}>
          <div style={{width:32, height:32, borderRadius:"50%", background:"rgba(138,158,132,0.1)", border:"1px solid rgba(138,158,132,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2}}>
            <span style={{fontFamily:T.sans, fontSize:12, fontWeight:700, color:T.gold}}>{i+1}</span>
          </div>
          <div>
            <div style={{fontFamily:T.sans, fontSize:isDesktop?14:13, fontWeight:600, color:T2.text, marginBottom:2}}>{sc.name}</div>
            <div style={{fontFamily:T.sans, fontSize:isDesktop?12:11, color:T2.text4, marginBottom:4}}>{sc.role}</div>
            <div style={{fontFamily:T.sans, fontSize:isDesktop?12:11, color:"#A8998A", fontStyle:"italic"}}>{sc.vibe}</div>
          </div>
        </div>
      ))}
      <button onClick={() => setPhase('question')} style={cs.cta}>Enter the Circuit →</button>
    </div>
  );

  if (phase === 'question') {
    const sc = CIRCUIT_CHARS[charIdx];
    return (
      <div style={{display:"flex", flexDirection:"column", gap:isDesktop?12:10}}>
        <div style={{...cs.card, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:isDesktop?"14px 24px":"10px 16px"}}>
          <div>
            <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:2}}>Person {charIdx+1} of {CIRCUIT_CHARS.length}</div>
            <div style={{fontFamily:T.sans, fontSize:isDesktop?14:13, fontWeight:600, color:T2.text}}>{sc.name} — <span style={{fontWeight:400, color:T2.text4}}>{sc.role}</span></div>
          </div>
        </div>

        <div style={{...cs.card, background:"rgba(138,158,132,0.05)", borderLeft:"2px solid "+T.gold}}>
          <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:10}}>Your Coach</div>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?15:14, color:T2.text, lineHeight:1.65, margin:"0 0 10px"}}>{sc.lead}</p>
          <p style={{fontFamily:T.serif, fontSize:isDesktop?17:16, fontStyle:"italic", color:T2.text, lineHeight:1.5, margin:"0 0 10px"}}>"{sc.quote}"</p>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?15:14, fontWeight:600, color:T2.text, lineHeight:1.65, margin:0}}>What do you say?</p>
        </div>

        {/* ── Voice recorder ─────────────────────────────────────────── */}
        {speechSupported ? (
          <>
            {recordState === 'idle' && (
              <div style={{...cs.card, textAlign:"center", padding:isDesktop?"32px 28px":"24px 20px"}}>
                {captureFailed && (
                  <div style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:"#B05C4A", marginBottom:10, lineHeight:1.5}}>Didn't quite catch that — give it another go</div>
                )}
                <div style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text3, marginBottom:20, lineHeight:1.5}}>Speak your response out loud — tap when you're ready</div>
                <button
                  onClick={startRecording}
                  style={{width:72, height:72, borderRadius:"50%", border:"1.5px solid "+T.gold, background:"rgba(138,158,132,0.08)", color:T.gold, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s"}}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(138,158,132,0.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(138,158,132,0.08)"; }}
                >
                  {MIC_SVG}
                </button>
              </div>
            )}

            {recordState === 'recording' && (
              <div style={{...cs.card, padding:isDesktop?"24px":"18px"}}>
                <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16}}>
                  <div style={{width:8, height:8, borderRadius:"50%", background:"#C97B5A", animation:"glowPulse 1s ease infinite"}}/>
                  <span style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:"#C97B5A", textTransform:"uppercase", letterSpacing:"1.5px"}}>Recording</span>
                </div>
                <div style={{minHeight:60, fontFamily:T.serif, fontSize:isDesktop?15:14, color:T2.text, lineHeight:1.65, marginBottom:16}}>
                  <span style={{color:T2.text4, fontStyle:"italic"}}>Listening...</span>
                </div>
                <button onClick={stopRecording} style={cs.cta}>Done Speaking →</button>
              </div>
            )}
          </>
        ) : (
          <div style={cs.card}>
            <div style={cs.label}>Your Response</div>
            <div style={{fontFamily:T.sans, fontSize:11, color:"#A8998A", marginBottom:10, fontStyle:"italic"}}>Voice not available in this browser — type your response below</div>
            <textarea
              value={fallbackInput}
              onChange={e => setFallbackInput(e.target.value)}
              placeholder="Write exactly what you would say..."
              style={{width:"100%", minHeight:isDesktop?80:70, background:"transparent", border:"none", borderBottom:"0.5px solid "+T2.divider, padding:"6px 0 10px", fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text, resize:"none", outline:"none", lineHeight:1.6, boxSizing:"border-box"}}
            />
            <button onClick={handleSubmit} disabled={!fallbackInput.trim()} style={{...cs.cta, marginTop:14, background:fallbackInput.trim()?T.ink:"rgba(44,36,22,0.2)", cursor:fallbackInput.trim()?"pointer":"not-allowed"}}>
              Submit — Get Scored →
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'analyzing') {
    const firstName = CIRCUIT_CHARS[charIdx].name.split(' ')[0];
    return (
      <div style={{...cs.card, display:"flex", flexDirection:"column", alignItems:"center", gap:14, textAlign:"center", padding:isDesktop?"40px":"28px"}}>
        <SequentialDots dotCount={dotCount} activeColor={T.gold} inactiveColor="rgba(200,164,106,0.2)"/>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, color:T2.text, lineHeight:1.55, margin:0}}>{firstName} is thinking about your answer…</p>
      </div>
    );
  }

  if (phase === 'scoring') {
    const sc = CIRCUIT_CHARS[charIdx];
    const score = scores[charIdx];
    const isLast = charIdx === CIRCUIT_CHARS.length - 1;
    const dims = [{key:'opening', label:'Opening'}, {key:'connection', label:'Connection'}, {key:'impression', label:'Impression'}];
    return (
      <div style={{display:"flex", flexDirection:"column", gap:isDesktop?12:10}}>
        <div style={cs.card}>
          <div style={cs.label}>{sc.name} · Scored</div>
          <div style={{display:"flex", flexDirection:"column", gap:14}}>
            {dims.map(d => (
              <div key={d.key}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                  <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text}}>{d.label}</span>
                  <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, fontWeight:600, color:T.gold}}>{score?.[d.key]||0}/5</span>
                </div>
                <div style={{height:4, borderRadius:2, background:T2.border, overflow:"hidden"}}>
                  <div style={{height:"100%", width:((score?.[d.key]||0)/5*100)+"%", background:T.gold, borderRadius:2, transition:"width 0.7s ease"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        {score?.note && (
          <div style={{...cs.card, background:"rgba(138,158,132,0.06)", borderLeft:"2px solid "+T.gold}}>
            <div style={cs.label}>Coach Says</div>
            <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, fontStyle:"italic", color:T2.text, margin:0, lineHeight:1.6}}>{score.note}</p>
          </div>
        )}
        <button onClick={handleNext} style={cs.cta}>{isLast ? "See Your Full Debrief →" : "Next: " + CIRCUIT_CHARS[charIdx+1].name + " →"}</button>
      </div>
    );
  }

  if (phase === 'debriefing') return (
    <div style={{...cs.card, textAlign:"center", padding:isDesktop?"40px":"28px"}}>
      <div style={cs.label}>Circuit Complete</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, color:T2.text, lineHeight:1.55, margin:0}}>Your coach is reviewing both conversations...</p>
    </div>
  );

  if (phase === 'debrief') {
    const dims = [{key:'opening', label:'Opening'}, {key:'connection', label:'Connection'}, {key:'impression', label:'Impression'}];
    return (
      <div style={{display:"flex", flexDirection:"column", gap:isDesktop?12:10}}>
        <div style={cs.card}>
          <div style={cs.label}>The Networking Circuit · Full Results</div>
          <div style={{display:"flex", flexDirection:"column", gap:16}}>
            {CIRCUIT_CHARS.map((sc, i) => {
              const s = scores[i];
              const avg = s ? Math.round((s.opening + s.connection + s.impression) / 3 * 10) / 10 : 0;
              return (
                <div key={sc.id}>
                  <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:6}}>
                    <div style={{width:24, height:24, borderRadius:"50%", background:"rgba(138,158,132,0.1)", border:"1px solid rgba(138,158,132,0.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                      <span style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold}}>{i+1}</span>
                    </div>
                    <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, fontWeight:600, color:T2.text, flex:1}}>{sc.name}</span>
                    <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, fontWeight:600, color:T.gold}}>{avg}/5</span>
                  </div>
                  <div style={{display:"flex", gap:6}}>
                    {dims.map(d => (
                      <div key={d.key} style={{flex:1}}>
                        <div style={{height:3, borderRadius:2, background:T2.border, overflow:"hidden", marginBottom:3}}>
                          <div style={{height:"100%", width:((s?.[d.key]||0)/5*100)+"%", background:T.gold, borderRadius:2}}/>
                        </div>
                        <div style={{fontFamily:T.sans, fontSize:9, color:T2.text4, textAlign:"center"}}>{d.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {debrief && (
          <>
            <div style={{...cs.card, background:"rgba(138,158,132,0.06)", borderLeft:"2px solid "+T.gold}}>
              <div style={cs.label}>Coach Says</div>
              <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text, lineHeight:1.7, margin:"0 0 16px"}}>{debrief.insight}</p>
              <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6}}>Focus for next time</div>
              <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text, lineHeight:1.6, margin:0}}>{debrief.practice}</p>
            </div>
            <div style={{...cs.card, textAlign:"center", padding:isDesktop?"20px 24px":"16px 18px"}}>
              <p style={{fontFamily:T.serif, fontSize:isDesktop?16:14, fontStyle:"italic", color:T.gold, margin:0, lineHeight:1.6}}>{debrief.quote}</p>
            </div>
          </>
        )}
        <button onClick={reset} style={cs.cta}>Try the Circuit Again →</button>
      </div>
    );
  }

  return null;
}
