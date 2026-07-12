import { useState, useEffect, useRef } from 'react';

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
export function D13PracticeWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('intro');
  const [selected, setSelected] = useState(null);
  const [timerState, setTimerState] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (timerState !== 'running') return;
    if (timeLeft <= 0) { setTimerState('done'); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timerState, timeLeft]);

  const pickScenario = (sc) => {
    setSelected(sc);
    setTimerState('idle');
    setTimeLeft(20);
    setPhase('practice');
  };

  const startTimer = () => {
    setTimeLeft(20);
    setTimerState('running');
  };

  const tryAgain = () => {
    setTimerState('idle');
    setTimeLeft(20);
  };

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
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:0}}>The problem is not knowing this — it's that most people freeze when the moment arrives. Choose one scenario and practise the opening that makes them stop, lean in, and want to continue.</p>
      </div>
      <button onClick={() => setPhase('select')} style={cs.cta}>Choose Your Scenario →</button>
    </div>
  );

  if (phase === 'select') return (
    <div style={{display:"flex", flexDirection:"column", gap:isDesktop?12:10}}>
      <div style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.6, marginBottom:4}}>Pick the moment that feels most relevant to you right now.</div>
      {SCENARIOS.map(sc => (
        <button key={sc.id} onClick={() => pickScenario(sc)} style={{textAlign:"left", background:T2.surface, border:"0.5px solid "+T2.border, borderRadius:4, padding:isDesktop?"20px 24px":"16px 18px", cursor:"pointer", transition:"all 0.2s"}}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T2.border; }}
        >
          <div style={{fontFamily:T.sans, fontSize:isDesktop?15:14, fontWeight:600, color:T2.text, marginBottom:4}}>{sc.label}</div>
          <div style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text4}}>{sc.sub}</div>
        </button>
      ))}
    </div>
  );

  if (phase === 'practice' && selected) {
    const sc = selected;
    return (
      <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>
        <div style={cs.card}>
          <div style={cs.label}>{sc.label}</div>
          <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, fontWeight:600, color:T2.text, lineHeight:1.35, margin:"0 0 12px"}}>{sc.context}</p>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:"#A8998A", lineHeight:1.6, margin:0, fontStyle:"italic"}}>{sc.challenge}</p>
        </div>

        <div style={cs.card}>
          <div style={cs.label}>What Makes a Killer Opening</div>
          <div style={{display:"flex", flexDirection:"column", gap:10, marginBottom:16}}>
            {sc.tips.map((tip, i) => (
              <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start"}}>
                <div style={{width:20, height:20, borderRadius:"50%", background:"rgba(138,158,132,0.12)", border:"1px solid rgba(138,158,132,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2}}>
                  <span style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold}}>{i+1}</span>
                </div>
                <span style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text, lineHeight:1.6}}>{tip}</span>
              </div>
            ))}
          </div>
          <div style={{padding:"12px 14px", background:"rgba(138,158,132,0.06)", borderRadius:4, borderLeft:"2px solid "+T.gold}}>
            <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6}}>Example Opening</div>
            <p style={{fontFamily:T.serif, fontSize:isDesktop?14:13, fontStyle:"italic", color:T2.text, margin:0, lineHeight:1.6}}>{sc.example}</p>
          </div>
        </div>

        {timerState === 'idle' && (
          <>
            <button onClick={startTimer} style={cs.cta}>Start 20s Timer — Speak Your Opening</button>
            <button onClick={() => setPhase('select')} style={{background:"none", border:"none", fontFamily:T.sans, fontSize:12, color:T2.text4, cursor:"pointer", padding:"4px 0", textAlign:"left"}}>← Change Scenario</button>
          </>
        )}

        {timerState === 'running' && (
          <div style={{...cs.card, textAlign:"center", padding:isDesktop?"32px":"24px"}}>
            <div style={{fontFamily:T.serif, fontSize:isDesktop?56:44, fontWeight:700, color:timeLeft <= 5 ? "#C97B5A" : T.gold, lineHeight:1, marginBottom:10, transition:"color 0.3s"}}>{timeLeft}</div>
            <div style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text4}}>seconds — speak your opening out loud</div>
          </div>
        )}

        {timerState === 'done' && (
          <>
            <div style={{...cs.card, textAlign:"center", padding:isDesktop?"28px":"22px"}}>
              <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:12}}>Nice work</div>
              <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, color:T2.text, lineHeight:1.55, margin:0}}>That's the moment. The more you practise it out loud, the more natural it becomes when it counts.</p>
            </div>
            <button onClick={tryAgain} style={cs.cta}>Try Again →</button>
            <button onClick={() => setPhase('select')} style={{background:"none", border:"none", fontFamily:T.sans, fontSize:12, color:T2.text4, cursor:"pointer", padding:"4px 0", textAlign:"left"}}>← Try a Different Scenario</button>
          </>
        )}
      </div>
    );
  }

  return null;
}

// ─── D13 Simulation Widget — The Networking Circuit ───────────────────────
const CIRCUIT_CHARS = [
  {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'Senior VP, Strategy',
    challenge: 'Polite but distracted — has somewhere to be',
    opener: "Good evening. [Glances at phone] Sorry — just dealing with something. You were saying?",
    sysPrompt: (hist) => "You are Marcus Chen, Senior VP of Strategy at a global consulting firm. You are at a professional networking event after a long day. You are polite but distracted — you have been checking your phone and have a dinner reservation in 30 minutes. Keep your responses brief (1-2 sentences) unless the person says something genuinely specific, surprising, or relevant to strategy or business. If they impress you, engage more. Never break character or offer coaching advice.\n\nConversation so far:\n" + hist,
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    role: 'Head of Product, TechVenture',
    challenge: 'Direct and quietly sceptical of small talk',
    opener: "Hi. I don't think we've met before. What do you do?",
    sysPrompt: (hist) => "You are Priya Sharma, Head of Product at a fast-growing tech company. You are at a post-conference drinks reception. You have no patience for small talk or generic answers — you are direct and only open up when someone says something genuinely interesting or asks a question that shows real curiosity. Respond politely but briefly to generic answers. Engage warmly when they impress you. Never break character or offer coaching advice.\n\nConversation so far:\n" + hist,
  },
  {
    id: 'james',
    name: 'James Okafor',
    role: "Tonight's Keynote Speaker",
    challenge: 'Warm but in high demand — the queue is forming',
    opener: "Hi, great to meet you. [Briefly glances over your shoulder] Hope you enjoyed the talk — what brought you tonight?",
    sysPrompt: (hist) => "You are James Okafor, tonight's keynote speaker at a professional conference. You are warm and energetic but in extremely high demand — there is a queue of people waiting. Give each person genuine but brief responses. If someone gives a generic compliment, respond warmly but briefly. If they say something specific and thoughtful, engage more deeply. After 3 exchanges, naturally begin to close (e.g. mention you should circulate but would love to continue another time). Never break character or offer coaching advice.\n\nConversation so far:\n" + hist,
  },
];

export function D13SimWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('intro');
  const [charIdx, setCharIdx] = useState(0);
  const [turn, setTurn] = useState(0);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState(CIRCUIT_CHARS.map(sc => [{role:'char', text:sc.opener}]));
  const [scores, setScores] = useState([null, null, null]);
  const [debrief, setDebrief] = useState(null);

  const transcriptsRef = useRef(CIRCUIT_CHARS.map(sc => [{role:'assistant', content:sc.opener}]));
  const scoresRef = useRef([null, null, null]);
  const charIdxRef = useRef(0);
  const turnRef = useRef(0);

  const cs = {
    card: {background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"18px"},
    label: {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8},
    cta: {width:"100%", padding:isDesktop?"14px":"13px", borderRadius:4, border:"none", background:T.ink, color:T.bg, fontSize:isDesktop?15:14, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:48, transition:"all 0.2s"},
  };

  const scoreChar = async (ci) => {
    const sc = CIRCUIT_CHARS[ci];
    const transcript = transcriptsRef.current[ci]
      .map(m => (m.role === 'assistant' ? sc.name : 'User') + ": " + m.content)
      .join('\n');
    const prompt = "You are an expert communication coach reviewing a professional networking conversation.\n\nCharacter: " + sc.name + " — " + sc.role + "\nChallenge: " + sc.challenge + "\n\nConversation:\n" + transcript + "\n\nScore the user (1-5) on three dimensions:\n- opening: How strong was their opening line — did it make the character want to engage?\n- adaptability: How well did they read and respond to the character's energy and style?\n- impression: How memorable and positive was the overall impression they left?\n\nRespond ONLY with valid JSON on a single line: {\"opening\":X,\"adaptability\":X,\"impression\":X,\"note\":\"one specific sentence about what worked or what to try differently\"}";
    try {
      const res = await fetch('/api/claude', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({model:'claude-sonnet-4-5', messages:[{role:'user', content:prompt}], max_tokens:200})});
      const data = await res.json();
      const text = data.content?.[0]?.text || '{}';
      const m = text.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : {opening:3, adaptability:3, impression:3, note:'Good effort in a challenging conversation.'};
      scoresRef.current = scoresRef.current.map((s, i) => i === ci ? parsed : s);
      setScores(prev => prev.map((s, i) => i === ci ? parsed : s));
    } catch(e) {
      const fb = {opening:3, adaptability:3, impression:3, note:'Good effort in a challenging conversation.'};
      scoresRef.current = scoresRef.current.map((s, i) => i === ci ? fb : s);
      setScores(prev => prev.map((s, i) => i === ci ? fb : s));
    }
    setPhase('scoring');
  };

  const runDebrief = async () => {
    const all = CIRCUIT_CHARS.map((sc, i) => {
      const t = transcriptsRef.current[i].map(m => (m.role === 'assistant' ? sc.name : 'User') + ": " + m.content).join('\n');
      const s = scoresRef.current[i];
      return "--- " + sc.name + " (" + sc.role + ") ---\n" + t + "\nScores: Opening " + (s?.opening||0) + "/5, Adaptability " + (s?.adaptability||0) + "/5, Impression " + (s?.impression||0) + "/5";
    }).join('\n\n');
    const prompt = "You are an expert communication coach. A user just completed The Networking Circuit — three back-to-back conversations with different professional characters. Analyse their performance based on what they actually said.\n\n" + all + "\n\nGive specific, direct, encouraging coaching.\n\nRespond ONLY with valid JSON on a single line: {\"insight\":\"2-3 specific sentences about their communication pattern across all three conversations\",\"practice\":\"one concrete thing to focus on next time\",\"quote\":\"a short inspiring quote about connection or confidence\"}";
    try {
      const res = await fetch('/api/claude', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({model:'claude-sonnet-4-5', messages:[{role:'user', content:prompt}], max_tokens:350})});
      const data = await res.json();
      const text = data.content?.[0]?.text || '{}';
      const m = text.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      setDebrief(parsed || {insight:'You completed all three conversations.', practice:'Focus on making your opening line specific to the person in front of you.', quote:'Every great professional relationship began with one brave sentence.'});
    } catch(e) {
      setDebrief({insight:'You completed all three conversations.', practice:'Focus on making your opening line specific to the person in front of you.', quote:'Every great professional relationship began with one brave sentence.'});
    }
    setPhase('debrief');
  };

  const handleSend = async () => {
    if (!input.trim() || phase !== 'conv') return;
    const userText = input.trim();
    const ci = charIdxRef.current;
    setInput('');

    setMsgs(prev => prev.map((a, i) => i === ci ? [...a, {role:'user', text:userText}] : a));
    transcriptsRef.current[ci] = [...transcriptsRef.current[ci], {role:'user', content:userText}];
    setPhase('thinking');

    try {
      const hist = transcriptsRef.current[ci]
        .map(m => (m.role === 'assistant' ? CIRCUIT_CHARS[ci].name : 'You') + ": " + m.content)
        .join('\n');
      const res = await fetch('/api/claude', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({model:'claude-haiku-4-5-20251001', system:CIRCUIT_CHARS[ci].sysPrompt(hist), messages:[{role:'user', content:userText}], max_tokens:150})});
      const data = await res.json();
      const reply = (data.content?.[0]?.text || '...').trim();

      transcriptsRef.current[ci] = [...transcriptsRef.current[ci], {role:'assistant', content:reply}];
      setMsgs(prev => prev.map((a, i) => i === ci ? [...a, {role:'char', text:reply}] : a));

      const newTurn = turnRef.current + 1;
      turnRef.current = newTurn;
      setTurn(newTurn);

      if (newTurn < 3) {
        setPhase('conv');
      } else {
        setPhase('analyzing');
        await scoreChar(ci);
      }
    } catch(e) {
      setPhase('conv');
    }
  };

  const handleNext = async () => {
    const nextIdx = charIdxRef.current + 1;
    if (nextIdx < 3) {
      charIdxRef.current = nextIdx;
      turnRef.current = 0;
      setCharIdx(nextIdx);
      setTurn(0);
      setPhase('conv');
    } else {
      setPhase('debriefing');
      await runDebrief();
    }
  };

  const reset = () => {
    charIdxRef.current = 0;
    turnRef.current = 0;
    transcriptsRef.current = CIRCUIT_CHARS.map(sc => [{role:'assistant', content:sc.opener}]);
    scoresRef.current = [null, null, null];
    setCharIdx(0);
    setTurn(0);
    setPhase('intro');
    setInput('');
    setMsgs(CIRCUIT_CHARS.map(sc => [{role:'char', text:sc.opener}]));
    setScores([null, null, null]);
    setDebrief(null);
  };

  if (phase === 'intro') return (
    <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>The Networking Circuit · Simulation</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:"0 0 12px"}}>Three people. Three conversations. One chance to make an impression.</p>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:0}}>Each character presents a different social challenge. You have 3 exchanges with each. Your AI coach will score your opening, adaptability, and the impression you leave — then give you a full debrief.</p>
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
      <button onClick={() => setPhase('conv')} style={cs.cta}>Enter the Circuit →</button>
    </div>
  );

  if (phase === 'conv' || phase === 'thinking') {
    const sc = CIRCUIT_CHARS[charIdx];
    const currentMsgs = msgs[charIdx];
    return (
      <div style={{display:"flex", flexDirection:"column", gap:isDesktop?12:10}}>
        <div style={{...cs.card, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:isDesktop?"16px 24px":"12px 16px"}}>
          <div>
            <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:2}}>Conversation {charIdx+1} of 3</div>
            <div style={{fontFamily:T.sans, fontSize:isDesktop?14:13, fontWeight:600, color:T2.text}}>{sc.name} — <span style={{fontWeight:400, color:T2.text4}}>{sc.role}</span></div>
          </div>
          <div style={{background:"rgba(138,158,132,0.08)", border:"0.5px solid rgba(138,158,132,0.25)", borderRadius:3, padding:"4px 10px", flexShrink:0}}>
            <span style={{fontFamily:T.sans, fontSize:11, color:T.gold}}>Turn {Math.min(turn+1,3)} / 3</span>
          </div>
        </div>

        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {currentMsgs.map((m, i) => (
            <div key={i} style={{display:"flex", justifyContent:m.role==='user'?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"82%", padding:"10px 14px", borderRadius:8, background:m.role==='user'?T.ink:T2.surface, border:m.role==='char'?"0.5px solid "+T2.border:"none", fontFamily:T.sans, fontSize:isDesktop?14:13, color:m.role==='user'?T.bg:T2.text, lineHeight:1.55}}>{m.text}</div>
            </div>
          ))}
          {phase === 'thinking' && (
            <div style={{display:"flex", justifyContent:"flex-start"}}>
              <div style={{padding:"10px 16px", borderRadius:8, background:T2.surface, border:"0.5px solid "+T2.border}}>
                <span style={{fontFamily:T.sans, fontSize:13, color:T2.text4, letterSpacing:2}}>...</span>
              </div>
            </div>
          )}
        </div>

        {phase === 'conv' && (
          <div style={{display:"flex", gap:8}}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}} placeholder="Type your response..." className="au-input" style={{flex:1, padding:"10px 14px", fontSize:isDesktop?14:13}}/>
            <button onClick={handleSend} disabled={!input.trim()} style={{padding:"10px 20px", borderRadius:4, border:"none", background:input.trim()?T.gold:"rgba(138,158,132,0.15)", color:input.trim()?"white":T2.text4, fontFamily:T.sans, fontSize:14, fontWeight:600, cursor:input.trim()?"pointer":"not-allowed", transition:"all 0.2s", flexShrink:0}}>Send</button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'analyzing') return (
    <div style={{...cs.card, textAlign:"center", padding:isDesktop?"40px":"28px"}}>
      <div style={cs.label}>Analysing your conversation</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, color:T2.text, lineHeight:1.55, margin:0}}>Your coach is reviewing your exchange with {CIRCUIT_CHARS[charIdx].name}...</p>
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
          <div style={cs.label}>{sc.name} · Complete</div>
          <div style={{display:"flex", flexDirection:"column", gap:14}}>
            {dims.map(d => (
              <div key={d.key}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                  <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text}}>{d.label}</span>
                  <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, fontWeight:600, color:T.gold}}>{score?.[d.key] || 0}/5</span>
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
