import { useState, useEffect, useRef } from 'react';
import { VoiceRecorder } from './VoiceRecorder.jsx';

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

  const tryAgain = () => { setRecDone(false); };

  const restart = () => { setPhase('intro'); setScIdx(pickScenarioIdx()); setRecDone(false); };

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
      <button onClick={() => { setRecDone(false); setPhase('practice'); }} style={cs.cta}>Let's Begin →</button>
    </div>
  );

  if (phase === 'practice') {
    const sc = SCENARIOS[scIdx];
    return (
      <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>

        <div style={cs.card}>
          <div style={cs.label}>{sc.label}</div>
          <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, fontWeight:600, color:T2.text, lineHeight:1.35, margin:"0 0 12px"}}>{sc.context}</p>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:"#A8998A", lineHeight:1.6, margin:0, fontStyle:"italic"}}>{sc.challenge}</p>
        </div>

        {!recDone && (
          <VoiceRecorder T={T} T2={T2} onDone={() => setRecDone(true)}/>
        )}

        {recDone && (
          <>
            <div style={{...cs.card, textAlign:"center", padding:isDesktop?"28px":"22px"}}>
              <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:12}}>Nice work</div>
              <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, color:T2.text, lineHeight:1.55, margin:0}}>
                That's the moment. The more you practise it out loud, the more natural it becomes when it counts.
              </p>
            </div>
            <button onClick={tryAgain} style={cs.cta}>Try Again →</button>
            <button onClick={() => setPhase('complete')} style={{...cs.cta, marginTop:0, background:"rgba(138,158,132,0.15)", color:T2.text, border:"0.5px solid "+T.gold}}>Finish →</button>
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
      <button onClick={restart} style={cs.cta}>Start Again →</button>
    </div>
  );

  return null;
}

// ─── D13 Simulation Widget — The Networking Circuit ───────────────────────
const CIRCUIT_CHARS = [
  {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'Senior VP, Strategy',
    challenge: 'Polite but distracted — has somewhere to be',
    questions: [
      "Marcus Chen, Senior VP of Strategy, is walking past you at a networking event. He glances at his phone and pauses briefly. What's your opening line?",
      "He replies: \"Sorry — just a lot on tonight.\" He's still half-distracted. What do you say to keep him engaged?",
    ],
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    role: 'Head of Product, TechVenture',
    challenge: 'Direct and quietly sceptical of small talk',
    questions: [
      "Priya Sharma, Head of Product, introduces herself and asks directly: \"What do you do?\" She has no patience for vague answers. What do you say?",
      "She nods and says: \"Interesting.\" Then silence. She's waiting to be genuinely impressed. What do you say next?",
    ],
  },
  {
    id: 'james',
    name: 'James Okafor',
    role: "Tonight's Keynote Speaker",
    challenge: 'Warm but in high demand — the queue is forming',
    questions: [
      "James Okafor just finished his keynote. You have about 15 seconds before someone else pulls him away. What's your opening?",
      "He smiles and asks: \"What specifically resonated with you?\" He wants a real answer, not flattery. What do you say?",
    ],
  },
];

export function D13SimWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('intro');
  const [charIdx, setCharIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [scores, setScores] = useState([null, null, null]);
  const [debrief, setDebrief] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [recordState, setRecordState] = useState('idle'); // 'idle' | 'recording' | 'done'
  const [speechSupported, setSpeechSupported] = useState(true);
  const [fallbackInput, setFallbackInput] = useState('');

  const answersRef = useRef([['',''],['',''],['','']]);
  const scoresRef = useRef([null, null, null]);
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

  const stopRecording = () => {
    const mr = recognitionRef.current;
    if (!mr || mr.state === 'inactive') { setRecordState(transcriptRef.current ? 'done' : 'idle'); return; }
    setRecordState('processing');
    mr.onstop = async () => {
      mr.stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
      try {
        const b64 = await blobToB64(blob);
        const res = await fetch('/api/transcribe', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({b64, mimeType: 'audio/webm'}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Transcription failed');
        transcriptRef.current = (data.text || '').trim();
        setTranscript(transcriptRef.current);
      } catch (err) {
        console.error('[D13SimWidget] transcribe error:', err);
      }
      setRecordState(transcriptRef.current ? 'done' : 'idle');
    };
    try { mr.stop(); } catch(e) { setRecordState(transcriptRef.current ? 'done' : 'idle'); }
  };

  const reRecord = () => {
    if (recognitionRef.current && recognitionRef.current.state !== 'inactive') { try { recognitionRef.current.onstop = null; recognitionRef.current.stop(); } catch(e) {} }
    recognitionRef.current = null;
    transcriptRef.current = '';
    setTranscript('');
    setInterimText('');
    setRecordState('idle');
  };

  const resetRecording = () => {
    if (recognitionRef.current && recognitionRef.current.state !== 'inactive') { try { recognitionRef.current.onstop = null; recognitionRef.current.stop(); } catch(e) {} }
    recognitionRef.current = null;
    transcriptRef.current = '';
    setTranscript('');
    setInterimText('');
    setRecordState('idle');
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
    const [a1, a2] = answersRef.current[ci];
    const prompt = "You are an expert communication coach evaluating how someone handled two networking moments.\n\nCharacter: " + sc.name + " — " + sc.role + "\nChallenge: " + sc.challenge + "\n\nQ1 — " + sc.questions[0] + "\nTheir answer: \"" + a1 + "\"\n\nQ2 — " + sc.questions[1] + "\nTheir answer: \"" + a2 + "\"\n\nScore them 1-5 on:\n- opening: Was the opening specific, confident, and engaging — not generic?\n- adaptability: Did they read the character's energy and respond to it?\n- impression: Would this leave a memorable, positive impression?\n\nRespond ONLY with valid JSON on a single line: {\"opening\":X,\"adaptability\":X,\"impression\":X,\"note\":\"one specific sentence — what worked or what to try differently next time\"}";
    try {
      const res = await fetch('/api/claude', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({model:'claude-sonnet-4-5', messages:[{role:'user', content:prompt}], max_tokens:200})});
      const data = await res.json();
      const text = data.content?.[0]?.text || '{}';
      const m = text.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : {opening:3, adaptability:3, impression:3, note:'Good effort in a challenging moment.'};
      scoresRef.current = scoresRef.current.map((s, i) => i === ci ? parsed : s);
      setScores(prev => prev.map((s, i) => i === ci ? parsed : s));
    } catch(e) {
      const fb = {opening:3, adaptability:3, impression:3, note:'Good effort in a challenging moment.'};
      scoresRef.current = scoresRef.current.map((s, i) => i === ci ? fb : s);
      setScores(prev => prev.map((s, i) => i === ci ? fb : s));
    }
    setPhase('scoring');
  };

  const runDebrief = async () => {
    const all = CIRCUIT_CHARS.map((sc, i) => {
      const [a1, a2] = answersRef.current[i];
      const s = scoresRef.current[i];
      return "--- " + sc.name + " (" + sc.role + ") ---\nQ1: " + sc.questions[0] + "\nAnswer: " + a1 + "\nQ2: " + sc.questions[1] + "\nAnswer: " + a2 + "\nScores: Opening " + (s?.opening||0) + "/5, Adaptability " + (s?.adaptability||0) + "/5, Impression " + (s?.impression||0) + "/5";
    }).join('\n\n');
    const prompt = "You are an expert communication coach. A user just completed The Networking Circuit — two questions each with three different professional characters. Analyse their answers across all three.\n\n" + all + "\n\nGive specific, direct, encouraging coaching based on what they actually wrote.\n\nRespond ONLY with valid JSON on a single line: {\"insight\":\"2-3 specific sentences about their communication pattern\",\"practice\":\"one concrete thing to focus on next time\",\"quote\":\"a short inspiring quote about connection or confidence\"}";
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
    answersRef.current[ci][qIdx] = answer;
    resetRecording();
    if (qIdx === 0) {
      setQIdx(1);
    } else {
      setPhase('analyzing');
      await scoreChar(ci);
    }
  };

  const handleNext = async () => {
    const nextIdx = charIdxRef.current + 1;
    if (nextIdx < 3) {
      charIdxRef.current = nextIdx;
      setCharIdx(nextIdx);
      setQIdx(0);
      resetRecording();
      setPhase('question');
    } else {
      setPhase('debriefing');
      await runDebrief();
    }
  };

  const reset = () => {
    charIdxRef.current = 0;
    answersRef.current = [['',''],['',''],['','']];
    scoresRef.current = [null, null, null];
    setCharIdx(0);
    setQIdx(0);
    setPhase('intro');
    setScores([null, null, null]);
    setDebrief(null);
    resetRecording();
  };

  if (phase === 'intro') return (
    <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>The Networking Circuit · Simulation</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:"0 0 12px"}}>Three people. Three conversations. One chance to make an impression.</p>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:0}}>Your AmplifyU Coach sets the scene and asks you two questions per person. Speak out loud what you would actually say — then get scored on your opening, adaptability, and the impression you leave.</p>
      </div>
      {CIRCUIT_CHARS.map((sc, i) => (
        <div key={sc.id} style={{...cs.card, display:"flex", alignItems:"flex-start", gap:14}}>
          <div style={{width:32, height:32, borderRadius:"50%", background:"rgba(138,158,132,0.1)", border:"1px solid rgba(138,158,132,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2}}>
            <span style={{fontFamily:T.sans, fontSize:12, fontWeight:700, color:T.gold}}>{i+1}</span>
          </div>
          <div>
            <div style={{fontFamily:T.sans, fontSize:isDesktop?14:13, fontWeight:600, color:T2.text, marginBottom:2}}>{sc.name}</div>
            <div style={{fontFamily:T.sans, fontSize:isDesktop?12:11, color:T2.text4, marginBottom:4}}>{sc.role}</div>
            <div style={{fontFamily:T.sans, fontSize:isDesktop?12:11, color:"#A8998A", fontStyle:"italic"}}>{sc.challenge}</div>
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
            <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:2}}>Person {charIdx+1} of 3</div>
            <div style={{fontFamily:T.sans, fontSize:isDesktop?14:13, fontWeight:600, color:T2.text}}>{sc.name} — <span style={{fontWeight:400, color:T2.text4}}>{sc.role}</span></div>
          </div>
          <div style={{background:"rgba(138,158,132,0.08)", border:"0.5px solid rgba(138,158,132,0.25)", borderRadius:3, padding:"4px 10px", flexShrink:0}}>
            <span style={{fontFamily:T.sans, fontSize:11, color:T.gold}}>Q{qIdx+1} of 2</span>
          </div>
        </div>

        <div style={{...cs.card, background:"rgba(138,158,132,0.05)", borderLeft:"2px solid "+T.gold}}>
          <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:10}}>Your Coach</div>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?15:14, color:T2.text, lineHeight:1.65, margin:0}}>{sc.questions[qIdx]}</p>
        </div>

        {/* ── Voice recorder ─────────────────────────────────────────── */}
        {speechSupported ? (
          <>
            {recordState === 'idle' && (
              <div style={{...cs.card, textAlign:"center", padding:isDesktop?"32px 28px":"24px 20px"}}>
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

            {recordState === 'processing' && (
              <div style={{...cs.card, padding:isDesktop?"24px":"18px", textAlign:"center"}}>
                <span style={{fontFamily:T.sans, fontSize:13, color:T2.text3, fontStyle:"italic"}}>Transcribing your answer…</span>
              </div>
            )}

            {recordState === 'done' && (
              <div style={{...cs.card, padding:isDesktop?"24px":"18px"}}>
                <div style={cs.label}>You said</div>
                <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, color:T2.text, lineHeight:1.65, margin:"0 0 20px"}}>
                  {transcript || <span style={{color:T2.text4, fontStyle:"italic"}}>Nothing captured — try again</span>}
                </p>
                <button onClick={handleSubmit} disabled={!transcript.trim()} style={{...cs.cta, marginBottom:10, background:transcript.trim()?T.ink:"rgba(44,36,22,0.2)", cursor:transcript.trim()?"pointer":"not-allowed"}}>
                  {qIdx === 0 ? "Next Question →" : "Submit — Get Scored →"}
                </button>
                <button onClick={reRecord} style={{background:"none", border:"none", fontFamily:T.sans, fontSize:12, color:T2.text4, cursor:"pointer", padding:"4px 0", width:"100%", textAlign:"center"}}>Record Again</button>
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
              {qIdx === 0 ? "Next Question →" : "Submit — Get Scored →"}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'analyzing') return (
    <div style={{...cs.card, textAlign:"center", padding:isDesktop?"40px":"28px"}}>
      <div style={cs.label}>Your coach is reviewing</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, color:T2.text, lineHeight:1.55, margin:0}}>Scoring your responses for {CIRCUIT_CHARS[charIdx].name}...</p>
    </div>
  );

  if (phase === 'scoring') {
    const sc = CIRCUIT_CHARS[charIdx];
    const score = scores[charIdx];
    const isLast = charIdx === 2;
    const dims = [{key:'opening', label:'Opening'}, {key:'adaptability', label:'Adaptability'}, {key:'impression', label:'Impression'}];
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
      <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, color:T2.text, lineHeight:1.55, margin:0}}>Your coach is reviewing all three conversations...</p>
    </div>
  );

  if (phase === 'debrief') {
    const dims = [{key:'opening', label:'Opening'}, {key:'adaptability', label:'Adaptability'}, {key:'impression', label:'Impression'}];
    return (
      <div style={{display:"flex", flexDirection:"column", gap:isDesktop?12:10}}>
        <div style={cs.card}>
          <div style={cs.label}>The Networking Circuit · Full Results</div>
          <div style={{display:"flex", flexDirection:"column", gap:16}}>
            {CIRCUIT_CHARS.map((sc, i) => {
              const s = scores[i];
              const avg = s ? Math.round((s.opening + s.adaptability + s.impression) / 3 * 10) / 10 : 0;
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
