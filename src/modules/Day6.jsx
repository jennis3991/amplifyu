import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';

// ── Shared: sequential dot animation ─────────────────────────────────────────
function useSequentialDots(active) {
  const [dotCount, setDotCount] = useState(0);
  useEffect(() => {
    if (!active) { setDotCount(0); return; }
    setDotCount(1);
    const id = setInterval(() => {
      setDotCount(d => { if (d >= 3) { clearInterval(id); return d; } return d + 1; });
    }, 600);
    return () => clearInterval(id);
  }, [active]);
  return dotCount;
}
function SequentialDots({dotCount}) {
  return (
    <div style={{display:'flex', gap:10, justifyContent:'center'}}>
      {[0,1,2].map(i => (
        <div key={i} style={{width:9, height:9, borderRadius:'50%', background: i < dotCount ? 'rgba(138,158,132,0.75)' : 'rgba(138,158,132,0.12)', transition:'background 0.35s'}}/>
      ))}
    </div>
  );
}

// ── Scenario cards ─────────────────────────────────────────────────────────────
const SCENARIOS = [
  { id:'criticised',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    label: "Your work has just been criticised in front of the room" },
  { id:'credit',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>,
    label: "A colleague takes credit for your idea in front of leadership" },
  { id:'capacity',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    label: "You're asked to take on work you don't have capacity for" },
  { id:'expertise',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>,
    label: "Someone challenges your expertise unexpectedly" },
  { id:'decision',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 17H3M21 17l-4 4M21 17l-4-4M3 7h18M3 7l4 4M3 7l4-4"/></svg>,
    label: "A decision you strongly disagree with has just been announced" },
  { id:'feedback',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    label: "You receive feedback that feels unfair or inaccurate" },
];

// ── D6 Rehearsal Widget — Find Your Words ────────────────────────────────────
export function D6PracticeWidget({T, T2, isDesktop, onSimulation}) {
  const [phase,       setPhase]       = useState('select');
  const [scenario,    setScenario]    = useState(null);
  const [isRec,       setIsRec]       = useState(false);
  const [waveVals,    setWaveVals]    = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);
  const [coachResult, setCoachResult] = useState(null);
  const [visCount,    setVisCount]    = useState(0);

  const mediaRecRef = useRef(null);
  const recRef      = useRef(null);
  const waveRef     = useRef(null);
  const liveRef     = useRef('');

  const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const dotCount  = useSequentialDots(phase === 'ready');

  // Waveform animation during recording
  useEffect(() => {
    if (!isRec) { clearInterval(waveRef.current); return; }
    waveRef.current = setInterval(() => setWaveVals(() => Array.from({length:9}, () => 0.2 + Math.random() * 0.8)), 150);
    return () => clearInterval(waveRef.current);
  }, [isRec]);

  // Sequential section reveal on coach screen (500ms between each)
  useEffect(() => {
    if (phase !== 'coach') { setVisCount(0); return; }
    const timers = [1,2,3,4,5,6].map((n, i) => setTimeout(() => setVisCount(n), i * 500));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  function doStart() {
    setIsRec(true); liveRef.current = '';
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
      rec.onresult = (e) => {
        let f = '', interim = '';
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) f += e.results[i][0].transcript + ' ';
          else interim += e.results[i][0].transcript + ' ';
        }
        liveRef.current = f.trim() || interim.trim();
      };
      try { rec.start(); } catch(e) {}
      recRef.current = rec;
    }
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = () => {};
        mr.onstop = () => stream.getTracks().forEach(t => t.stop());
        mr.start();
        mediaRecRef.current = mr;
      }).catch(() => {});
    }
  }

  function doStop() {
    setIsRec(false);
    if (mediaRecRef.current && mediaRecRef.current.state !== 'inactive') {
      mediaRecRef.current.onstop = () => {};
      mediaRecRef.current.stop();
    }
    function proceed(text) { setPhase('analyzing'); analyzeTranscript(text.trim()); }
    if (recRef.current) {
      const rec = recRef.current; recRef.current = null;
      const fallback = setTimeout(() => proceed(liveRef.current), 1800);
      rec.onend = () => { clearTimeout(fallback); proceed(liveRef.current); };
      try { rec.stop(); } catch(e) { clearTimeout(fallback); proceed(liveRef.current); }
    } else {
      proceed(liveRef.current);
    }
  }

  async function analyzeTranscript(text) {
    try {
      const res = await fetch('/api/claude', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001', max_tokens: 500,
          system: `You are the AmplifyU coach analysing a spoken response for language patterns under pressure. The user was given this high-stakes scenario: ${scenario?.label}. They responded naturally without coaching. Analyse their transcript for the following. languagePattern: classify as one of 'composed' (calm, direct, non-defensive), 'reactive' (rushed, justifying, over-explaining), 'deflecting' (agreeing too quickly, minimising their position), or 'assertive' (strong but potentially combative). openingSentence: extract their actual first sentence verbatim. patternObservation: one specific warm sentence explaining what their language pattern reveals — focus on the words they chose, not their tone or delivery. Never use deficit language. upgradedPhrase: one single sentence that is a stronger, more composed version of their opening — it should feel like something a confident senior professional would say naturally, not a scripted line. It must be specific to what they actually said, not generic. wordBank: an array of exactly six short phrases (2–5 words each) that are powerful in this type of high-stakes moment — these should feel like tools they can reach for, not platitudes. avoidPhrase: one specific word or short phrase detected in their transcript that weakens their position, with one sentence explaining why. If no weak language detected, return null for this field. coachLine: one warm closing sentence bridging to the simulation. Return only valid JSON.`,
          messages: [{role:'user', content:`Transcript: "${text || '[no spoken response]'}"`}],
        }),
      });
      const data = await res.json();
      const raw = (data.content || []).map(b => b.text || '').join('');
      const m = raw.match(/\{[\s\S]*\}/);
      setCoachResult(JSON.parse(m[0]));
      setPhase('coach');
    } catch(e) {
      setCoachResult({
        languagePattern: 'composed',
        openingSentence: text ? (text.split(/[.!?]/)[0] + '.').trim() : 'Your response was noted.',
        patternObservation: "You stayed in the moment and responded without over-explaining — that restraint is the first signal of composure under pressure.",
        upgradedPhrase: "I hear that. Here's where I stand.",
        wordBank: ["I hear that", "Let me be clear", "Here's my position", "That said", "What I know is", "I want to be direct"],
        avoidPhrase: null,
        coachLine: "You have the instincts. The simulation will show you how they hold under real pressure.",
      });
      setPhase('coach');
    }
  }

  const cs = {
    card:  {background:T2.surface, borderRadius:4, border:'0.5px solid '+T2.border, padding:isDesktop?'22px 24px':'16px 18px'},
    label: {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2px', marginBottom:8},
    cta:   {width:'100%', padding:isDesktop?'14px':'13px', borderRadius:4, border:'none', background:T.ink, color:T.bg, fontSize:isDesktop?15:14, fontWeight:600, cursor:'pointer', fontFamily:T.sans, minHeight:48},
  };

  // ── SELECT ────────────────────────────────────────────────────────────────
  if (phase === 'select') return (
    <div style={{display:'flex', flexDirection:'column', gap:isDesktop?16:14}}>
      <div>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:10}}>Rehearsal · Day 6</div>
        <h2 style={{fontFamily:T.serif, fontSize:isDesktop?30:24, fontWeight:600, color:T2.text, lineHeight:1.15, margin:'0 0 10px', letterSpacing:'-0.5px'}}>Find Your Words</h2>
        <div style={{height:2, background:T2.border, borderRadius:2, marginBottom:0}}>
          <div style={{height:'100%', width:'0%', background:T.gold, borderRadius:2}}/>
        </div>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Your task</div>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text, lineHeight:1.65, margin:0}}>
          Choose one of the scenarios below and respond naturally. Your AmplifyU coach will help you refine your response, then you'll deliver your improved version before the simulation begins.
        </p>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:isDesktop?12:10}}>
        {SCENARIOS.map(sc => {
          const sel = scenario?.id === sc.id;
          return (
            <button key={sc.id} onClick={() => setScenario(sc)}
              style={{padding:isDesktop?'18px 16px':'14px 12px', borderRadius:6, border:`${sel?'2px':'1px'} solid ${sel?'rgba(82,112,96,0.75)':T2.border}`, background:sel?'rgba(82,112,96,0.12)':T2.surface, cursor:'pointer', textAlign:'center', alignItems:'center', transition:'all 0.2s', display:'flex', flexDirection:'column', gap:10, outline:'none'}}>
              <div style={{color:sel?'rgba(82,112,96,0.9)':T2.text3}}>{sc.icon}</div>
              <span style={{fontFamily:T.sans, fontSize:isDesktop?12:11, color:T2.text, lineHeight:1.4, fontWeight:sel?600:400}}>{sc.label}</span>
            </button>
          );
        })}
      </div>
      <button onClick={() => setPhase('ready')} disabled={!scenario}
        style={{...cs.cta, opacity:scenario?1:0.4, cursor:scenario?'pointer':'not-allowed', fontSize:isDesktop?15:14, padding:isDesktop?'15px':'13px'}}>
        Respond Naturally →
      </button>
    </div>
  );

  // ── READY ─────────────────────────────────────────────────────────────────
  if (phase === 'ready') return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:isDesktop?28:22, padding:isDesktop?'52px 0':'36px 0'}}>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?21:18, fontWeight:500, color:T2.text, textAlign:'center', lineHeight:1.45, maxWidth:500, margin:0}}>
        {scenario?.label}
      </p>
      <SequentialDots dotCount={dotCount}/>
      <p style={{fontFamily:T.sans, fontSize:13, color:T2.text3, fontStyle:'italic', margin:0, textAlign:'center'}}>
        Say what comes naturally. Don't filter it.
      </p>
      <button onClick={() => { setPhase('rec'); doStart(); }}
        style={{...cs.cta, maxWidth:340, fontSize:isDesktop?15:14, padding:isDesktop?'14px 28px':'13px 24px'}}>
        Start Speaking →
      </button>
    </div>
  );

  // ── REC ───────────────────────────────────────────────────────────────────
  if (phase === 'rec') return (
    <div style={{display:'flex', flexDirection:'column', gap:isDesktop?18:14, alignItems:'center'}}>
      <div style={{...cs.card, width:'100%', boxSizing:'border-box', textAlign:'left'}}>
        <div style={cs.label}>Your Scenario</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, color:T2.text, lineHeight:1.6, margin:0, fontStyle:'italic'}}>{scenario?.label}</p>
      </div>
      <div style={{display:'flex', gap:4, alignItems:'center', height:44, padding:'0 8px'}}>
        {waveVals.map((v, i) => (
          <div key={i} style={{width:4, borderRadius:2, background:T.gold, height:(v * 36)+'px', transition:'height 0.12s ease', flexShrink:0, opacity:0.85}}/>
        ))}
      </div>
      <p style={{fontFamily:T.sans, fontSize:12, color:T2.text3, margin:0, textAlign:'center'}}>Recording — speak naturally</p>
      <button onClick={doStop}
        style={{...cs.cta, maxWidth:340, background:'rgba(82,112,96,0.85)', color:'#fff', fontSize:isDesktop?15:14, padding:isDesktop?'14px 28px':'13px 24px'}}>
        I've Said It — Stop Recording
      </button>
    </div>
  );

  // ── ANALYZING ─────────────────────────────────────────────────────────────
  if (phase === 'analyzing') return (
    <div style={{display:'flex', flexDirection:'column', gap:14, alignItems:'center', padding:isDesktop?'52px 0':'36px 0'}}>
      <div style={{display:'flex', gap:6}}>
        {[0,1,2].map(i => <div key={i} style={{width:8, height:8, borderRadius:'50%', background:T.gold, animation:`glowPulse 1.2s ease ${i*0.3}s infinite`}}/>)}
      </div>
      <p style={{fontFamily:T.sans, fontSize:14, color:T2.text3, margin:0, textAlign:'center'}}>Your AmplifyU coach is reading your language…</p>
    </div>
  );

  // ── COACH FEEDBACK ────────────────────────────────────────────────────────
  if (phase === 'coach' && coachResult) {
    const lp = coachResult.languagePattern;
    const patternColor = lp === 'composed' ? T.gold : lp === 'assertive' ? '#8A9E84' : '#B8903A';
    return (
      <div style={{display:'flex', flexDirection:'column', gap:isDesktop?18:14}}>

        {/* 1 — What you said */}
        {visCount >= 1 && (
          <div style={{animation:'fadeUp 0.4s ease both'}}>
            <div style={{...cs.label, color:T2.text3}}>What You Said</div>
            <div style={{background:T2.surface, border:'0.5px solid '+T2.border, borderRadius:4, padding:isDesktop?'16px 20px':'14px 16px', borderLeft:'2px solid rgba(138,158,132,0.35)'}}>
              <p style={{fontFamily:T.serif, fontSize:isDesktop?16:15, fontStyle:'italic', color:T2.text, lineHeight:1.6, margin:0}}>"{coachResult.openingSentence}"</p>
            </div>
          </div>
        )}

        {/* 2 — Coach observation (dark ink panel) */}
        {visCount >= 2 && (
          <div style={{background:'#0A0804', borderRadius:6, padding:isDesktop?'22px 24px':'18px 20px', border:'0.5px solid rgba(138,158,132,0.12)', animation:'fadeUp 0.4s ease both'}}>
            <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:12}}>Your AmplifyU Coach Says</div>
            <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, color:'rgba(245,239,230,0.92)', lineHeight:1.55, margin:'0 0 14px', fontWeight:500}}>{coachResult.patternObservation}</p>
            <span style={{display:'inline-block', padding:'3px 10px', borderRadius:20, background:`${patternColor}22`, border:`0.5px solid ${patternColor}66`, fontFamily:T.sans, fontSize:10, fontWeight:700, color:patternColor, textTransform:'uppercase', letterSpacing:'1.5px'}}>
              {lp}
            </span>
          </div>
        )}

        {/* 3 — Upgraded phrase */}
        {visCount >= 3 && (
          <div style={{animation:'fadeUp 0.4s ease both'}}>
            <div style={{...cs.label, color:T.gold}}>A Stronger Opening</div>
            <div style={{borderLeft:'3px solid '+T.gold, paddingLeft:isDesktop?20:16}}>
              <p style={{fontFamily:T.serif, fontSize:isDesktop?23:20, fontStyle:'italic', color:T2.text, lineHeight:1.4, margin:0, fontWeight:500}}>{coachResult.upgradedPhrase}</p>
            </div>
            <p style={{fontFamily:T.sans, fontSize:11, color:T2.text3, fontStyle:'italic', margin:'8px 0 0', paddingLeft:isDesktop?24:20}}>Read this once. Out loud. Before the simulation begins.</p>
          </div>
        )}

        {/* 4 — Word bank */}
        {visCount >= 4 && (
          <div style={{animation:'fadeUp 0.4s ease both'}}>
            <div style={cs.label}>Words That Work in This Moment</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {(coachResult.wordBank || []).map((phrase, i) => (
                <span key={i} style={{padding:'5px 14px', borderRadius:20, border:'0.5px solid rgba(138,158,132,0.4)', background:T2.bg, fontFamily:T.serif, fontSize:isDesktop?13:12, color:T2.text, lineHeight:1.4}}>
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 5 — One thing to avoid (only if avoidPhrase is non-null) */}
        {visCount >= 5 && coachResult.avoidPhrase && (
          <div style={{animation:'fadeUp 0.4s ease both', borderLeft:'2.5px solid #B8903A', paddingLeft:isDesktop?20:16}}>
            <div style={{...cs.label, color:'#B8903A', marginLeft:0}}>One Thing to Avoid</div>
            <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text, lineHeight:1.65, margin:0}}>{coachResult.avoidPhrase}</p>
          </div>
        )}

        {/* 6 — Bridge + CTA */}
        {visCount >= 6 && (
          <div style={{animation:'fadeUp 0.4s ease both'}}>
            <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, fontStyle:'italic', color:T2.text3, textAlign:'center', lineHeight:1.65, margin:'0 0 16px'}}>{coachResult.coachLine}</p>
            <button onClick={() => onSimulation?.()}
              style={{...cs.cta, fontSize:isDesktop?15:14, padding:isDesktop?'15px':'13px'}}>
              I've Said It — Enter the Simulation →
            </button>
          </div>
        )}

      </div>
    );
  }

  return null;
}

// ─── Custom Dropdown ─────────────────────────────────────────────────────────
function DropDown({field, value, placeholder, options, onSelect, open, onToggle, onClose, T, T2, isDesktop}) {
  return (
    <div style={{position:"relative"}}>
      <button
        onMouseDown={e=>{e.preventDefault();onToggle();}}
        onBlur={()=>setTimeout(onClose,150)}
        style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:3,border:`0.5px solid ${open?T.gold:T2.border}`,background:T2.bg,color:value?T2.text:T2.text3||"#A8998A",fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:400,letterSpacing:"0.01em",cursor:"pointer",textAlign:"left",transition:"border-color 0.2s",outline:"none",minHeight:42}}>
        <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{value||placeholder}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{flexShrink:0,marginLeft:8,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}>
          <path d="M1 1.5l5 5 5-5" stroke={open?T.gold:"#A8998A"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:100,background:T2.surface,border:"0.5px solid "+T.gold,borderRadius:4,boxShadow:"0 8px 28px rgba(44,36,22,0.13)",overflow:"hidden",maxHeight:220,overflowY:"auto"}}>
          {options.map((opt,i)=>(
            <div key={opt} onMouseDown={e=>{e.preventDefault();onSelect(opt);onClose();}}
              style={{padding:"10px 14px",fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:400,letterSpacing:"0.01em",color:opt===value?T.gold:T2.text,background:opt===value?"rgba(138,158,132,0.08)":"transparent",cursor:"pointer",borderBottom:i<options.length-1?"0.5px solid "+T2.divider:"none",transition:"background 0.12s"}}
              onMouseEnter={e=>e.currentTarget.style.background=opt===value?"rgba(138,158,132,0.12)":"rgba(138,158,132,0.05)"}
              onMouseLeave={e=>e.currentTarget.style.background=opt===value?"rgba(138,158,132,0.08)":"transparent"}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── D6 Simulation Widget — AI Conversation Prep ────────────────────────────
export function D6SimWidget({T, T2, isDesktop}) {
  const INDUSTRIES = ['Technology','Finance','Healthcare','Education','Hospitality','Retail','Sales','Marketing','Legal','Consulting','Other'];
  const MEETING_OPTIONS = [
    {id:'manager',   label:'Manager',      icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>},
    {id:'colleague', label:'Colleague',    icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>},
    {id:'client',    label:'Client',       icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg>},
    {id:'executive', label:'Executive',    icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><rect x="4" y="6" width="16" height="16"/><path d="M2 6l10-4 10 6"/><line x1="8" y1="22" x2="8" y2="12"/><line x1="12" y1="22" x2="12" y2="12"/><line x1="16" y1="22" x2="16" y2="12"/></svg>},
    {id:'interview', label:'Interview',    icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>},
    {id:'other',     label:'Someone else', icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>},
  ];
  const TOPIC_OPTIONS = [
    {id:'pitch',     label:'Pitch an idea',      icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14z"/></svg>},
    {id:'budget',    label:'Budget approval',    icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v1m0 5v1M9.5 10a2.5 2.5 0 0 1 5 0c0 1.5-1 2-2.5 2.5S9.5 13 9.5 14a2.5 2.5 0 0 0 5 0"/></svg>},
    {id:'promotion', label:'Promotion',          icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>},
    {id:'feedback',  label:'Difficult feedback', icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="15.5" r="0.5" fill="currentColor"/></svg>},
    {id:'other',     label:'Something else',     icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>},
  ];
  const PRESSURES = [
    {id:'friendly',    label:'Friendly',    desc:'Supportive & open dialogue',        icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>},
    {id:'challenging', label:'Challenging', desc:'Pushback & probing questions',      icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 22 22 22"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>},
    {id:'executive',   label:'Executive',   desc:'Direct, sceptical, time-conscious', icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2 6-2 2-2-2z"/><path d="M10 8l-3 13h10L14 8"/></svg>},
    {id:'boardroom',   label:'Boardroom',   desc:'High pressure & high scrutiny',     icon:<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><rect x="2" y="8" width="20" height="14"/><path d="M2 8l10-6 10 6"/><line x1="7" y1="22" x2="7" y2="12"/><line x1="12" y1="22" x2="12" y2="12"/><line x1="17" y1="22" x2="17" y2="12"/></svg>},
  ];

  const [phase,          setPhase]         = useState('setup');
  const [form,           setForm]          = useState({industry:'',role:'',stakeholder:'',purpose:'',pressure:'challenging'});
  const [purposeOther,   setPurposeOther]  = useState('');
  const [profile,        setProfile]       = useState(null);
  const [questions,      setQuestions]     = useState([]);
  const [qIdx,           setQIdx]          = useState(0);
  const [answers,        setAnswers]       = useState([]);
  const [currentAnswer,  setCurrentAnswer] = useState('');
  const [isListening,    setIsListening]   = useState(false);
  const [recTime,        setRecTime]       = useState(0);
  const [result,         setResult]        = useState(null);
  const [openDrop,       setOpenDrop]      = useState(null);
  const recRef           = useRef(null);
  const timerRef         = useRef(null);
  const purposeForAnalysis = useRef('');
  const SpeechRec = typeof window!=='undefined'&&(window.SpeechRecognition||window.webkitSpeechRecognition);

  useEffect(()=>{
    if(!isListening){clearInterval(timerRef.current);return;}
    timerRef.current=setInterval(()=>setRecTime(t=>t+1),1000);
    return()=>clearInterval(timerRef.current);
  },[isListening]);

  async function generate(){
    const ap=form.purpose==='Something else'?purposeOther:form.purpose;
    purposeForAnalysis.current=ap;
    setPhase('analyzing');
    const pressureLabel = PRESSURES.find(p=>p.id===form.pressure)?.label||'Challenging';
    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:800,messages:[{role:"user",content:`You are a senior executive coach preparing someone for a high-stakes conversation.\n\nContext:\n- Industry: ${form.industry}\n- Their role: ${form.role}\n- Meeting: ${form.stakeholder}\n- About: ${ap}\n- Pressure style: ${pressureLabel}\n\nGenerate a conversation profile and the 5 most important, highest-impact questions this stakeholder is likely to ask. Prioritise the questions they would definitely ask — the ones that probe rationale, risk, and evidence. Questions should feel specific, real, and build in difficulty.\n\nReturn ONLY valid JSON:\n{"profile":{"stakeholderLabel":"${form.stakeholder}","goal":"<1-4 word goal>","riskLevel":"High|Medium|Low","concerns":["concern1","concern2","concern3","concern4"],"insight":"<2-3 sentences about what this stakeholder cares about and how they will challenge>"},"questions":["q1","q2","q3","q4","q5"]}`}]})});
      const d=await res.json();
      const raw=(d.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      const parsed=JSON.parse(m[0]);
      setProfile(parsed.profile);
      setQuestions(parsed.questions);
    }catch{
      setProfile({stakeholderLabel:form.stakeholder,goal:"Get answers",riskLevel:"High",concerns:["ROI","Risk","Timeline","Resources"],insight:`This ${form.stakeholder} will focus on practical implications and challenge your assumptions. Expect probing questions about evidence, alternatives, and risk.`});
      setQuestions(["Why should we prioritise this now?","What are the main risks — and how have you mitigated them?","How will we measure success?","What is the expected ROI?","Why is this the right approach over alternatives?"]);
    }
    setPhase('questions');
  }

  function startSim(){setQIdx(0);setAnswers([]);setCurrentAnswer('');setRecTime(0);setPhase('simulation');}

  function startListening(){
    if(!SpeechRec) return;
    const rec=new SpeechRec();
    rec.continuous=true;rec.interimResults=true;
    let final=currentAnswer;
    rec.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript+' ';else interim=e.results[i][0].transcript;}setCurrentAnswer(final+interim);};
    rec.onend=()=>setIsListening(false);
    rec.start();recRef.current=rec;setIsListening(true);setRecTime(0);
  }
  function stopListening(){if(recRef.current)recRef.current.stop();setIsListening(false);}

  function nextQuestion(){
    if(isListening)stopListening();
    const newAnswers=[...answers,currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');setRecTime(0);
    if(qIdx<questions.length-1){setQIdx(i=>i+1);}
    else{setPhase('reviewing');analyze(newAnswers);}
  }

  async function analyze(ans){
    const qa=questions.map((q,i)=>`Q${i+1}: ${q}\nA: ${ans[i]||'(no answer)'}`).join('\n\n');
    const fallback={
      scores:{composure:{score:7,note:"Stayed measured throughout"},clarity:{score:7,note:"Mostly direct answers"},confidence:{score:7,note:"Clear position held"},evidence:{score:6,note:"Could use more specific data"},brevity:{score:7,note:"Generally concise"}},
      strengths:["Stayed composed under pressure","Clear on strategic rationale"],
      development:["Prepare stronger evidence for risk questions","Sharpen responses to follow-up probing"],
      hardestQuestion:questions[questions.length-1]||'Final question',
      recommendation:"Your strongest answers were backed by evidence. Before the real conversation, prepare clearer responses to risk and objection questions — those are where hesitation tends to show."
    };
    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:700,messages:[{role:"user",content:`You are an executive communication coach. Analyse these conversation practice responses.\n\nContext: ${form.role} preparing to meet ${form.stakeholder} about ${purposeForAnalysis.current}\n\n${qa}\n\nReturn ONLY valid JSON:\n{"scores":{"composure":{"score":<1-10>,"note":"<8 words>"},"clarity":{"score":<1-10>,"note":"<8 words>"},"confidence":{"score":<1-10>,"note":"<8 words>"},"evidence":{"score":<1-10>,"note":"<8 words>"},"brevity":{"score":<1-10>,"note":"<8 words>"}},"strengths":["<strength1>","<strength2>"],"development":["<area1>","<area2>"],"hardestQuestion":"<question text that got weakest response>","recommendation":"<2-3 sentence personalised coaching recommendation>"}`}]})});
      const d=await res.json();
      const raw=(d.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      if(m){const parsed=JSON.parse(m[0]);setResult(parsed);}
      else{setResult(fallback);}
    }catch(e){
      setResult(fallback);
    }finally{
      setPhase('results');
    }
  }

  const cs={
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"20px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    inp:{width:"100%",borderRadius:3,border:"0.5px solid "+T2.border,padding:"10px 14px",fontSize:isDesktop?14:13,fontFamily:T.sans,background:T2.bg,color:T2.text,outline:"none",boxSizing:"border-box"},
    sel:{width:"100%",borderRadius:3,border:"0.5px solid "+T2.border,padding:"10px 14px",fontSize:isDesktop?14:13,fontFamily:T.sans,background:T2.bg,color:T2.text,outline:"none",appearance:"none",cursor:"pointer",WebkitAppearance:"none"},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };
  const scoreColor=s=>s>=8?"#527060":s>=5?T.gold:"#B05C4A";
  const actualPurpose=form.purpose==='Something else'?purposeOther:form.purpose;
  const canGenerate=form.industry&&form.role&&form.stakeholder&&actualPurpose;

  // ── SETUP ──
  if(phase==='setup') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?20:16}}>
      <div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:600,color:T2.text,lineHeight:1.15,margin:"0 0 6px"}}>AI Conversation Prep</h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:0}}>Choose your scenario, add a few details, and get ready for high-stakes conversations. Your coach will generate tough questions and help you deliver with confidence.</p>
      </div>
      {/* Section 1 */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:T.ink,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T.bg}}>1</span>
          </div>
          <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text}}>Your Conversation</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T2.text,marginBottom:6}}>Industry</div>
            <DropDown field="industry" value={form.industry} placeholder="Select industry" options={INDUSTRIES}
              onSelect={v=>setForm(f=>({...f,industry:v}))} open={openDrop==='industry'} onToggle={()=>setOpenDrop(openDrop==='industry'?null:'industry')} onClose={()=>setOpenDrop(null)} T={T} T2={T2} isDesktop={isDesktop}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T2.text,marginBottom:6}}>Your Role</div>
            <input value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} placeholder="e.g. Product Manager..." style={cs.inp}/>
          </div>
        </div>
        <div>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Who Are You Meeting?</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {MEETING_OPTIONS.map(opt=>{
              const sel=form.stakeholder===opt.label;
              return (
                <button key={opt.id} onClick={()=>setForm(f=>({...f,stakeholder:opt.label}))}
                  style={{padding:"14px 8px",borderRadius:6,border:`${sel?'2px':'1px'} solid ${sel?'rgba(82,112,96,0.75)':T2.border}`,background:sel?'rgba(82,112,96,0.1)':T2.surface,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:8,outline:'none',transition:'all 0.15s'}}>
                  <div style={{color:sel?'rgba(82,112,96,0.9)':T2.text3}}>{opt.icon}</div>
                  <span style={{fontFamily:T.sans,fontSize:11,color:T2.text,lineHeight:1.3,fontWeight:sel?600:400,textAlign:'center'}}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>{"What's the Conversation About?"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:form.purpose==='Something else'?8:0}}>
            {TOPIC_OPTIONS.map(opt=>{
              const sel=form.purpose===opt.label;
              return (
                <button key={opt.id} onClick={()=>{setForm(f=>({...f,purpose:opt.label}));if(opt.id!=='other')setPurposeOther('');}}
                  style={{padding:"14px 8px",borderRadius:6,border:`${sel?'2px':'1px'} solid ${sel?'rgba(82,112,96,0.75)':T2.border}`,background:sel?'rgba(82,112,96,0.1)':T2.surface,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:8,outline:'none',transition:'all 0.15s'}}>
                  <div style={{color:sel?'rgba(82,112,96,0.9)':T2.text3}}>{opt.icon}</div>
                  <span style={{fontFamily:T.sans,fontSize:11,color:T2.text,lineHeight:1.3,fontWeight:sel?600:400,textAlign:'center'}}>{opt.label}</span>
                </button>
              );
            })}
          </div>
          {form.purpose==='Something else' && (
            <textarea value={purposeOther} onChange={e=>setPurposeOther(e.target.value)} placeholder="Describe what the conversation is about..." style={{...cs.inp,resize:'none',height:64,lineHeight:1.5}}/>
          )}
        </div>
      </div>
      {/* Section 2 — Pressure Level */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:T.ink,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T.bg}}>2</span>
          </div>
          <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text}}>Pressure Level</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {PRESSURES.map(p=>{
            const sel=form.pressure===p.id;
            return (
              <button key={p.id} onClick={()=>setForm(f=>({...f,pressure:p.id}))}
                style={{padding:"14px 6px",borderRadius:6,border:`${sel?'2px':'1px'} solid ${sel?'rgba(82,112,96,0.75)':T2.border}`,background:sel?'rgba(82,112,96,0.1)':T2.surface,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6,outline:'none',transition:'all 0.15s'}}>
                <div style={{color:sel?'rgba(82,112,96,0.9)':T2.text3}}>{p.icon}</div>
                <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:sel?'rgba(82,112,96,0.9)':T2.text,textAlign:'center'}}>{p.label}</div>
                <div style={{fontFamily:T.sans,fontSize:10,color:T2.text3,textAlign:'center',lineHeight:1.3}}>{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
      <button onClick={generate} disabled={!canGenerate} style={{...cs.cta,opacity:canGenerate?1:0.4,fontSize:isDesktop?15:14,padding:isDesktop?"16px":"14px"}}>Generate My Questions →</button>
    </div>
  );

  // ── ANALYZING ──
  if(phase==='analyzing') return (
    <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:isDesktop?"48px 0":"32px 0"}}>
      <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.2s ease ${i*0.3}s infinite`}}/>)}</div>
      <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,margin:0,textAlign:"center"}}>Analysing your stakeholder…</p>
      <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text4||T2.text3,margin:0,textAlign:"center"}}>Generating the toughest questions you're likely to face.</p>
    </div>
  );

  // ── QUESTIONS ──
  if(phase==='questions'&&profile) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{...cs.card,background:"#0A0804",border:"0.5px solid rgba(138,158,132,0.15)"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Conversation Profile</div>
        <div style={{display:"flex",gap:isDesktop?20:12,flexWrap:"wrap",marginBottom:14}}>
          {[{l:"Stakeholder",v:profile.stakeholderLabel||form.stakeholder},{l:"Goal",v:profile.goal},{l:"Risk Level",v:profile.riskLevel}].map(({l,v})=>(
            <div key={l}>
              <div style={{fontFamily:T.sans,fontSize:9,color:"rgba(245,239,230,0.4)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>{l}</div>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontWeight:600,color:"#F5EFE6"}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:T.sans,fontSize:9,color:"rgba(245,239,230,0.4)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Likely Concerns</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {(profile.concerns||[]).map((c,i)=><span key={i} style={{padding:"3px 10px",borderRadius:20,border:"0.5px solid rgba(138,158,132,0.3)",fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.65)"}}>{c}</span>)}
          </div>
        </div>
        <div style={{borderTop:"0.5px solid rgba(138,158,132,0.15)",paddingTop:12}}>
          <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Coach Insight</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:"italic",color:"rgba(245,239,230,0.7)",lineHeight:1.65,margin:0}}>{profile.insight}</p>
        </div>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Your Top {questions.length} Likely Questions</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {questions.map((q,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 14px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold}}>{i+1}</span>
              </div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.55,margin:0}}>{q}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={startSim} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Start Simulation →</button>
      <button onClick={()=>setPhase('setup')} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:12,cursor:"pointer",padding:"6px 0",textAlign:"center"}}>← Edit conversation details</button>
    </div>
  );

  // ── SIMULATION ──
  if(phase==='simulation') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",flexShrink:0}}>Question {qIdx+1} of {questions.length}</div>
        <div style={{flex:1,height:2,background:T2.border,borderRadius:2}}><div style={{height:"100%",width:(((qIdx+1)/questions.length)*100)+"%",background:T.gold,borderRadius:2,transition:"width 0.4s"}}/></div>
      </div>
      <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3}}><span style={{fontWeight:600,color:T2.text}}>{form.stakeholder}</span> asks:</div>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold,padding:isDesktop?"22px 28px":"18px 22px"}}>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?24:20,fontWeight:600,color:T2.text,lineHeight:1.3,margin:0}}>{questions[qIdx]}</p>
      </div>
      <div style={cs.card}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px"}}>Your Response</div>
          {SpeechRec&&(
            <button onClick={isListening?stopListening:startListening}
              style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,border:`1px solid ${isListening?"#CC4444":T2.border}`,background:isListening?"rgba(204,68,68,0.08)":"transparent",cursor:"pointer",fontFamily:T.sans,fontSize:11,fontWeight:600,color:isListening?"#CC4444":T2.text3,transition:"all 0.2s"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:isListening?"#CC4444":"rgba(138,158,132,0.5)",animation:isListening?"glowPulse 1s ease infinite":"none"}}/>
              {isListening?`Recording ${recTime}s`:"Speak to record"}
            </button>
          )}
        </div>
        <textarea value={currentAnswer} onChange={e=>setCurrentAnswer(e.target.value)} placeholder="Speak your answer or type it here…" style={{...cs.inp,resize:"none",height:isDesktop?96:80,lineHeight:1.6,padding:"10px 12px"}}/>
        {!SpeechRec&&<p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,margin:"6px 0 0",fontStyle:"italic"}}>Say your answer out loud, then type your key points.</p>}
      </div>
      <button onClick={nextQuestion} style={{...cs.cta,background:currentAnswer.trim()?T.gold:T.ink,color:"white",fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>
        {qIdx<questions.length-1?"Next Question →":"Get My Feedback →"}
      </button>
      <button onClick={()=>{if(isListening)stopListening();setAnswers([]);setQIdx(0);setCurrentAnswer('');setPhase('questions');}} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:12,cursor:"pointer",padding:"6px 0",textAlign:"center"}}>← Back to questions</button>
    </div>
  );

  // ── REVIEWING ──
  if(phase==='reviewing') return (
    <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:isDesktop?"48px 0":"32px 0"}}>
      <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.2s ease ${i*0.3}s infinite`}}/>)}</div>
      <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,margin:0,textAlign:"center"}}>Your AmplifyU coach is reviewing your responses…</p>
    </div>
  );

  // ── RESULTS ──
  if(phase==='results') return !result ? (
    <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:isDesktop?"48px 0":"32px 0"}}>
      <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.2s ease ${i*0.3}s infinite`}}/>)}</div>
      <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,margin:0,textAlign:"center"}}>Loading your results…</p>
    </div>
  ) : (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Coaching Report</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {Object.entries(result.scores||{}).map(([key,val])=>(
            <div key={key} style={{padding:"12px 14px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text3,textTransform:"capitalize"}}>{key}</span>
                <span style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:scoreColor(val.score),lineHeight:1}}>{val.score}<span style={{fontSize:10,color:T2.text3}}>/10</span></span>
              </div>
              <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,margin:0,lineHeight:1.4}}>{val.note}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:isDesktop?"row":"column",gap:10}}>
        <div style={{...cs.card,flex:1,borderTop:"2px solid #527060"}}>
          <div style={{...cs.label,color:"#527060"}}>Handled Well</div>
          {(result.strengths||[]).map((s,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<(result.strengths.length-1)?8:0}}>
              <span style={{color:"#527060",fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5}}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{...cs.card,flex:1,borderTop:"2px solid "+T.gold}}>
          <div style={cs.label}>Prepare Further</div>
          {(result.development||[]).map((d,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<(result.development.length-1)?8:0}}>
              <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:1}}>⚠</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5}}>{d}</span>
            </div>
          ))}
        </div>
      </div>
      {result.hardestQuestion&&(
        <div style={{...cs.card,background:"rgba(176,92,74,0.04)",border:"0.5px solid rgba(176,92,74,0.2)"}}>
          <div style={{...cs.label,color:"#B05C4A"}}>Question to Revisit</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>{result.hardestQuestion}</p>
        </div>
      )}
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
        <div style={cs.label}>Coach Recommendation</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:"italic",color:T.gold,lineHeight:1.65,margin:0}}>{result.recommendation}</p>
      </div>
      {/* Repeat options */}
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:4}}>
        <button onClick={()=>{setAnswers([]);setQIdx(0);setCurrentAnswer('');setResult(null);setPhase('simulation');}}
          style={{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.gold,color:"white",fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans}}>
          Repeat These 5 Questions →
        </button>
        <button onClick={()=>{setAnswers([]);setQIdx(0);setCurrentAnswer('');setResult(null);setQuestions([]);setProfile(null);setPhase('setup');generate();}}
          style={{width:"100%",padding:isDesktop?"13px":"12px",borderRadius:4,border:`0.5px solid ${T.gold}`,background:"transparent",color:T.gold,fontSize:isDesktop?14:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans}}>
          Ask Me 5 New Questions →
        </button>
        <button onClick={()=>{setPhase('intro');setForm({industry:'',role:'',stakeholder:'',purpose:'',pressure:'challenging'});setProfile(null);setQuestions([]);setAnswers([]);setResult(null);setQIdx(0);setCurrentAnswer('');}}
          style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:12,cursor:"pointer",padding:"6px 0",textAlign:"center",width:"100%"}}>
          Prepare a Different Conversation
        </button>
      </div>
    </div>
  );

  return null;
}


// ─── D11 Practice Widget ──────────────────────────────────────────────────

