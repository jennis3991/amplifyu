import { useState, useEffect, useRef } from 'react';

// ─── Shared: sequential dot animation (mirrors Day 3) ────────────────────────
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

// ─── D5 Practice Widget — The Setup ──────────────────────────────────────────
const SETUP_TOPICS = [
  { id:'confidence', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4v5c0 5.5-3.5 10.74-8 12-4.5-1.26-8-6.5-8-12V7l8-4z"/></svg>,
    label:"What's one thing people get wrong about confidence?" },
  { id:'career',     icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>,
    label:"What's the best career advice you've ever ignored?" },
  { id:'success',    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>,
    label:"What does success actually look like to you?" },
  { id:'impression', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    label:"What do most people miss in a first impression?" },
  { id:'managers',   icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    label:"What's one thing great managers never do?" },
  { id:'exceptional',icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    label:"What separates someone good at their job from someone exceptional?" },
];

export function D5PracticeWidget({T, T2, isDesktop, onSimulation}) {
  const [phase,       setPhase]       = useState('bridge');
  const [revealCount, setRevealCount] = useState(0);
  const [summaryVis,  setSummaryVis]  = useState(false);
  const [topic,       setTopic]       = useState(null);
  const [countdown,   setCountdown]   = useState(10);
  const [isRec,       setIsRec]       = useState(false);
  const [waveVals,    setWaveVals]    = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);
  const [coachResult, setCoachResult] = useState(null);
  const [preRow,      setPreRow]      = useState(0);

  const mediaRecRef  = useRef(null);
  const recRef       = useRef(null);
  const waveRef      = useRef(null);
  const liveRef      = useRef('');
  const cdRef        = useRef(null);

  const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const dotCount  = useSequentialDots(phase === 'countdown');

  // Demo sequential reveal
  useEffect(() => {
    if (phase !== 'demo') { setRevealCount(0); setSummaryVis(false); return; }
    setRevealCount(1);
    const t1 = setTimeout(() => setRevealCount(2), 800);
    const t2 = setTimeout(() => setRevealCount(3), 1600);
    const t3 = setTimeout(() => setRevealCount(4), 2400);
    const t4 = setTimeout(() => setSummaryVis(true), 3400);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, [phase]);

  // Countdown → auto-start
  useEffect(() => {
    if (phase !== 'countdown') { clearInterval(cdRef.current); setCountdown(10); return; }
    let c = 10;
    setCountdown(10);
    cdRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(cdRef.current);
        doStart();
        setPhase('rec');
      }
    }, 1000);
    return () => clearInterval(cdRef.current);
  }, [phase]); // eslint-disable-line

  // Waveform animation
  useEffect(() => {
    if (!isRec) { clearInterval(waveRef.current); return; }
    waveRef.current = setInterval(() => setWaveVals(() => Array.from({length:9}, () => 0.2 + Math.random() * 0.8)), 150);
    return () => clearInterval(waveRef.current);
  }, [isRec]);

  // PRE rows reveal on coach screen
  useEffect(() => {
    if (phase !== 'coach') { setPreRow(0); return; }
    const t1 = setTimeout(() => setPreRow(1), 600);
    const t2 = setTimeout(() => setPreRow(2), 1200);
    const t3 = setTimeout(() => setPreRow(3), 1800);
    return () => [t1,t2,t3].forEach(clearTimeout);
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
        mr.ondataavailable = e => { if (e.data.size > 0) {} };
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
    function proceed(text) { setPhase('analyzing'); analyzeTranscript(text.trim() || ''); }
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
          system: `You are the AmplifyU coach. The user has just completed The Setup warm-up for Day 5: Structure PRE. They were explicitly asked to answer using Point, Reason, and Example. Analyse their transcript and extract the following fields. ledWithPosition (boolean — true if their opening sentence stated a clear position or view), reasonPresent (boolean — true if they gave a clear reason or justification), examplePresent (boolean — true if they grounded their answer in something concrete, specific, or real). pointQuote (the exact sentence or short phrase from their transcript where they stated their main point, or null if missing), reasonQuote (the exact sentence or short phrase where they gave their reason or logic, or null if missing), exampleQuote (the exact sentence or short phrase where they gave a concrete example, or null if missing). coachLine (one warm specific sentence maximum 25 words referencing what they actually said — if all three are present affirm the structure, if one is missing give one forward-looking nudge, never critical, never say perfect). bridgeLine — always return exactly: "The Boardroom asks one question. Ten seconds to think. Then it's yours." Return only valid JSON with all these fields.`,
          messages: [{role:'user', content:`Question: ${topic?.label || 'practice question'}\n\nTranscript: "${text || '[no transcript]'}"`}],
        }),
      });
      const data = await res.json();
      const raw = (data.content || []).map(b => b.text || '').join('');
      const m = raw.match(/\{[\s\S]*\}/);
      setCoachResult(JSON.parse(m[0]));
      setPhase('coach');
    } catch(e) {
      setCoachResult({
        ledWithPosition: true, reasonPresent: true, examplePresent: false,
        coachLine: "You opened with a clear position — now ground it in a specific example to make it land.",
        bridgeLine: "The Boardroom asks one question. Ten seconds to think. Then it's yours.",
      });
      setPhase('coach');
    }
  }

  const cs = {
    card:    {background:T2.surface, borderRadius:4, border:'0.5px solid '+T2.border, padding:isDesktop?'22px 24px':'16px 18px'},
    label:   {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2px', marginBottom:8},
    cta:     {width:'100%', padding:isDesktop?'14px':'13px', borderRadius:4, border:'none', background:T.ink, color:T.bg, fontSize:isDesktop?15:14, fontWeight:600, cursor:'pointer', fontFamily:T.sans, minHeight:48},
    sageCta: {width:'100%', padding:isDesktop?'14px':'13px', borderRadius:4, border:'none', background:'rgba(82,112,96,0.85)', color:'#fff', fontSize:isDesktop?15:14, fontWeight:600, cursor:'pointer', fontFamily:T.sans, minHeight:48},
  };

  // ── BRIDGE ────────────────────────────────────────────────────────────────
  if (phase === 'bridge') return (
    <div style={{display:'flex', flexDirection:'column', gap:isDesktop?16:14}}>
      <div>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:10}}>Rehearsal · Day 5</div>
        <h2 style={{fontFamily:T.serif, fontSize:isDesktop?30:24, fontWeight:600, color:T2.text, lineHeight:1.15, margin:'0 0 16px', letterSpacing:'-0.5px'}}>The simplest structure in communication.</h2>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.7, margin:'0 0 20px', fontWeight:300}}>PRE is a three-part framework that makes any spoken answer clear, convincing, and easy to follow.</p>
      </div>
      <div style={{background:T2.surface, borderRadius:6, border:'0.5px solid '+T2.border, overflow:'hidden'}}>
        {[
          {letter:'P', word:'Point', desc:'Lead with your position. State what you think — clearly, in the first sentence.'},
          {letter:'R', word:'Reason', desc:'Explain why. Give the logic or evidence behind your view.'},
          {letter:'E', word:'Example', desc:'Make it real. Ground your reason in something concrete — a story, a stat, a moment.'},
        ].map((row, i) => (
          <div key={i} style={{display:'flex', alignItems:'flex-start', gap:16, padding:isDesktop?'16px 20px':'14px 16px', borderBottom:i<2?'0.5px solid '+T2.divider:'none'}}>
            <div style={{width:32, height:32, borderRadius:6, background:'rgba(138,158,132,0.1)', border:'0.5px solid rgba(138,158,132,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              <span style={{fontFamily:T.serif, fontSize:16, fontWeight:700, color:T.gold}}>{row.letter}</span>
            </div>
            <div>
              <div style={{fontFamily:T.sans, fontSize:11, fontWeight:700, color:T2.text, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:3}}>{row.word}</div>
              <div style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text3, lineHeight:1.6, fontWeight:300}}>{row.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text3, lineHeight:1.7, margin:0, fontWeight:300}}>First, watch how it works in practice. Then try it yourself — before The Boardroom puts you on the spot.</p>
      <button onClick={() => setPhase('demo')} style={{...cs.cta}}>
        See It In Action →
      </button>
    </div>
  );

  // ── DEMO ─────────────────────────────────────────────────────────────────
  const DEMO = {
    scenario: 'Should your organisation invest more in learning and development?',
    point:    '"Yes — without question."',
    reason:   '"Organisations that invest in their people retain them longer and perform better. Skills don\'t develop by accident — they develop by design."',
    example:  '"At my last company, we introduced a monthly learning hour. Within six months, three people who\'d been considering leaving said it was one of the reasons they stayed."',
  };

  const preBlock = (label, text, visible) => (
    <div style={{opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(8px)', transition:'opacity 0.5s ease, transform 0.5s ease'}}>
      <div style={{borderLeft:'2px solid rgba(138,158,132,0.5)', paddingLeft:14, marginBottom:14}}>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:6}}>{label}</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?16:15, color:T2.text, lineHeight:1.6, margin:0, fontStyle:'italic'}}>{text}</p>
      </div>
    </div>
  );

  if (phase === 'demo') return (
    <div style={{display:'flex', flexDirection:'column', gap:isDesktop?16:14}}>
      <div style={cs.card}>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:10}}>The Scenario</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?20:18, fontWeight:600, color:T2.text, lineHeight:1.3, margin:'0 0 20px'}}>"{DEMO.scenario}"</p>
        {preBlock('Point',   DEMO.point,   revealCount >= 2)}
        {preBlock('Reason',  DEMO.reason,  revealCount >= 3)}
        {preBlock('Example', DEMO.example, revealCount >= 4)}
        {summaryVis && (
          <p style={{opacity:summaryVis?1:0, transition:'opacity 0.5s ease', fontFamily:T.sans, fontSize:12, color:T2.text4, margin:'10px 0 0', fontStyle:'italic', textAlign:'center'}}>
            Point. Reason. Example. Clear. Structured. Memorable.
          </p>
        )}
      </div>
      {summaryVis && (
        <button onClick={() => setPhase('select')} style={cs.sageCta}>
          Now Your Turn →
        </button>
      )}
    </div>
  );

  // ── SELECT ────────────────────────────────────────────────────────────────
  if (phase === 'select') return (
    <div style={{display:'flex', flexDirection:'column', gap:isDesktop?16:14}}>
      <div>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:10}}>Your Turn</div>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:0, fontWeight:300}}>Pick one question below. Answer it using Point, Reason, and Example. Speak for around 30 seconds.</p>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
        {SETUP_TOPICS.map(t => {
          const sel = topic?.id === t.id;
          return (
            <button key={t.id} onClick={() => { setTopic(t); setPhase('countdown'); }}
              style={{padding:isDesktop?'16px 14px':'13px 12px', borderRadius:6, border:`${sel?'2px':'1px'} solid ${sel?'rgba(82,112,96,0.75)':T2.border}`, background:sel?'rgba(82,112,96,0.1)':T2.surface, cursor:'pointer', textAlign:'center', alignItems:'center', display:'flex', flexDirection:'column', gap:10, outline:'none', transition:'all 0.15s'}}>
              <div style={{color:sel?'rgba(82,112,96,0.9)':T2.text3, opacity:0.8}}>{t.icon}</div>
              <span style={{fontFamily:T.sans, fontSize:isDesktop?12:11, color:T2.text, lineHeight:1.4, fontWeight:sel?600:400}}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── COUNTDOWN ────────────────────────────────────────────────────────────
  if (phase === 'countdown') return (
    <div style={{display:'flex', flexDirection:'column', gap:isDesktop?16:14}}>
      <div style={cs.card}>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:10}}>Your Question</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:'0 0 28px'}}>"{topic?.label}"</p>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:16}}>
          <SequentialDots dotCount={dotCount}/>
          <p style={{fontFamily:T.sans, fontSize:12, color:T2.text4, margin:0, fontStyle:'italic', textAlign:'center'}}>Start with your point. Then your reason. Then one example.</p>
          <div style={{fontFamily:T.serif, fontSize:isDesktop?52:44, fontWeight:600, color:T2.text, lineHeight:1, letterSpacing:'-2px'}}>{countdown}</div>
        </div>
      </div>
    </div>
  );

  // ── REC ───────────────────────────────────────────────────────────────────
  if (phase === 'rec') return (
    <div style={{display:'flex', flexDirection:'column', gap:isDesktop?16:14}}>
      <div style={cs.card}>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?19:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:'0 0 6px'}}>"{topic?.label}"</p>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.4)', textTransform:'uppercase', letterSpacing:'3px', marginBottom:20}}>Point · Reason · Example</div>
        <div style={{display:'flex', alignItems:'center', gap:2, height:40, marginBottom:14}}>
          {waveVals.map((v,i) => <div key={i} style={{flex:1, height:Math.round(v*34)+'px', background:`rgba(138,158,132,${0.3+v*0.5})`, borderRadius:2, transition:'height 0.15s'}}/>)}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:7, height:7, borderRadius:'50%', background:'#c0392b'}}/>
          <span style={{fontFamily:T.sans, fontSize:11, color:T2.text3}}>Recording — tap Done when finished.</span>
        </div>
      </div>
      <button onClick={doStop} style={{...cs.cta, background:'rgba(138,158,132,0.12)', color:T2.text, border:'0.5px solid rgba(138,158,132,0.3)'}}>
        Done →
      </button>
    </div>
  );

  // ── ANALYZING ─────────────────────────────────────────────────────────────
  if (phase === 'analyzing') return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:200, gap:16}}>
      <div style={{display:'flex', gap:8}}>{[0,1,2].map(i => <div key={i} style={{width:7, height:7, borderRadius:'50%', background:'rgba(138,158,132,0.6)'}}/>)}</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?18:16, color:T2.text, margin:0, textAlign:'center'}}>Reading your answer…</p>
      <p style={{fontFamily:T.sans, fontSize:12, color:T2.text3, margin:0, textAlign:'center'}}>Checking for Point, Reason, and Example.</p>
    </div>
  );

  // ── COACH ─────────────────────────────────────────────────────────────────
  if (phase === 'coach' && coachResult) {
    const rows = [
      {label:'Point',   present:coachResult.ledWithPosition, quote:coachResult.pointQuote},
      {label:'Reason',  present:coachResult.reasonPresent,   quote:coachResult.reasonQuote},
      {label:'Example', present:coachResult.examplePresent,  quote:coachResult.exampleQuote},
    ];
    return (
      <div style={{display:'flex', flexDirection:'column', gap:isDesktop?16:14}}>
        <div style={{background:'#0A0804', borderRadius:8, padding:isDesktop?'28px 32px':'22px 22px', border:'0.5px solid rgba(138,158,132,0.15)'}}>
          <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:14}}>Your AmplifyU Coach Says</div>
          <p style={{fontFamily:T.serif, fontSize:isDesktop?22:18, color:'rgba(245,239,230,0.92)', lineHeight:1.45, margin:0}}>{coachResult.coachLine}</p>
        </div>
        <div style={cs.card}>
          {rows.map((row, i) => (
            <div key={i} style={{opacity:preRow>i?1:0, transform:preRow>i?'translateY(0)':'translateY(6px)', transition:'opacity 0.45s ease, transform 0.45s ease', padding:'12px 0', borderBottom:i<2?'0.5px solid '+T2.divider:'none'}}>
              <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:row.quote?8:0}}>
                <span style={{color:row.present?'rgba(82,112,96,0.9)':'rgba(200,150,60,0.85)', fontSize:16, fontWeight:700, width:20, textAlign:'center', flexShrink:0}}>{row.present?'✓':'△'}</span>
                <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, fontWeight:700, color:T2.text, textTransform:'uppercase', letterSpacing:'1.5px'}}>{row.label}</span>
              </div>
              {row.quote && <p style={{fontFamily:T.serif, fontSize:isDesktop?14:13, color:T2.text2, lineHeight:1.55, margin:'0 0 0 34px', fontStyle:'italic'}}>"{row.quote}"</p>}
            </div>
          ))}
          {preRow >= 3 && (
            <p style={{fontFamily:T.sans, fontSize:12, color:T2.text4, margin:'14px 0 0', lineHeight:1.6, fontStyle:'italic'}}>{coachResult.bridgeLine}</p>
          )}
        </div>
        <button onClick={() => onSimulation?.()} style={cs.sageCta}>
          Enter the Boardroom →
        </button>
      </div>
    );
  }

  return null;
}

// ─── D5 Simulation Widget — The Boardroom ────────────────────────────────────
const BOARDROOM_TOPICS = [
  {id:'ai',       label:'Your company should invest more in AI',                        question:'Should your company be investing more in AI — and why?',                      q2:'A sceptical colleague says AI investment is overhyped. Respond.'},
  {id:'remote',   label:'Remote work improves productivity',                            question:'Does remote work genuinely improve productivity — and why?',                   q2:'Your leadership team wants everyone back in the office. Make your case.'},
  {id:'fourday',  label:'Four-day weeks should become standard',                        question:'Should four-day weeks become standard — and why?',                            q2:"The CFO says a four-day week will hurt revenue. What's your response?"},
  {id:'comms',    label:'Communication skills should be taught in every workplace',     question:'Should communication skills be taught in every workplace — and why?',         q2:"A senior leader says communication training is a nice-to-have. Disagree."},
  {id:'meetings', label:'Meetings should require a written agenda to exist',            question:'Should every meeting require a written agenda to exist — and why?',           q2:'Someone says agenda requirements will slow teams down. Respond.'},
  {id:'learning', label:'Your organisation should invest more in learning and development', question:'Should organisations invest more in learning and development — and why?', q2:'The board wants to cut the L&D budget. Make the case against it.'},
];

const BOARDROOM_ICONS = {
  ai: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a4 4 0 018 0v2"/><circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.2" fill="currentColor" stroke="none"/><path d="M9 18h6M1 12h2M21 12h2"/></svg>,
  remote: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 4l9 8"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/></svg>,
  fourday: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>,
  comms: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  meetings: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  learning: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13 16 9 12 2 19"/><polyline points="16 7 22 7 22 13"/></svg>,
};

export function D5SimWidget({T, T2, isDesktop}) {
  const [phase,        setPhase]        = useState('select');
  const [topic,        setTopic]        = useState(null);
  const [cardVisible,  setCardVisible]  = useState(false);
  const [cardOut,      setCardOut]      = useState(false);
  const [recVisible,   setRecVisible]   = useState(false);
  const [countdown,    setCountdown]    = useState(10);
  const [isRec,        setIsRec]        = useState(false);
  const [waveVals,     setWaveVals]     = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);
  const [preResult,    setPreResult]    = useState(null);
  const [revealRow,    setRevealRow]    = useState(0);
  const [revealCoach,  setRevealCoach]  = useState(false);
  const [debriefResult,setDebriefResult]= useState(null);

  const mediaRecRef      = useRef(null);
  const audioChunksRef   = useRef([]);
  const recRef           = useRef(null);
  const waveRef          = useRef(null);
  const liveRef          = useRef('');
  const transcript1Ref   = useRef('');
  const topicRef         = useRef(null);
  const thinkingTargetRef= useRef('rec1');
  const countdownIdRef   = useRef(null);

  const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  // Waveform animation
  useEffect(() => {
    if (!isRec) { clearInterval(waveRef.current); return; }
    waveRef.current = setInterval(() => setWaveVals(() => Array.from({length:9}, () => 0.2 + Math.random() * 0.8)), 150);
    return () => clearInterval(waveRef.current);
  }, [isRec]);

  // Thinking card — runs when phase === 'thinking'
  useEffect(() => {
    if (phase !== 'thinking') {
      setCardVisible(false); setCardOut(false); setRecVisible(false); setCountdown(10);
      clearInterval(countdownIdRef.current);
      return;
    }
    setCardVisible(false); setCardOut(false); setRecVisible(false); setCountdown(10);
    clearInterval(countdownIdRef.current);
    const t1 = setTimeout(() => {
      setCardVisible(true);
      let c = 10;
      const id = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(id);
          countdownIdRef.current = null;
          setCardOut(true);
          setTimeout(() => {
            setCardVisible(false); setCardOut(false); setRecVisible(true);
            setIsRec(true);
            startSpeechRec();
          }, 400);
          setTimeout(() => { setPhase(thinkingTargetRef.current); }, 900);
        }
      }, 1000);
      countdownIdRef.current = id;
    }, 1000);
    return () => { clearTimeout(t1); clearInterval(countdownIdRef.current); };
  }, [phase]); // eslint-disable-line

  // PRE reveal sequential fade-in
  useEffect(() => {
    if (phase !== 'reveal') { setRevealRow(0); setRevealCoach(false); return; }
    const t1 = setTimeout(() => setRevealRow(1), 600);
    const t2 = setTimeout(() => setRevealRow(2), 1400);
    const t3 = setTimeout(() => setRevealRow(3), 2200);
    const t4 = setTimeout(() => setRevealCoach(true), 2700);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, [phase]);

  function startSpeechRec() {
    liveRef.current = '';
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
      rec.onresult = (e) => {
        let final = ''; let interim = '';
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
          else interim += e.results[i][0].transcript + ' ';
        }
        liveRef.current = final || interim;
      };
      try { rec.start(); } catch(err) {}
      recRef.current = rec;
    }
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        audioChunksRef.current = [];
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mr.onstop = () => stream.getTracks().forEach(t => t.stop());
        mr.start();
        mediaRecRef.current = mr;
      }).catch(() => {});
    }
  }

  function stopRec(onText) {
    setIsRec(false);
    if (mediaRecRef.current && mediaRecRef.current.state !== 'inactive') {
      mediaRecRef.current.onstop = () => {};
      mediaRecRef.current.stop();
    }
    if (recRef.current) {
      const rec = recRef.current; recRef.current = null;
      const fallback = setTimeout(() => onText(liveRef.current), 1800);
      rec.onend = () => { clearTimeout(fallback); onText(liveRef.current); };
      try { rec.stop(); } catch(e) { clearTimeout(fallback); onText(liveRef.current); }
    } else {
      onText(liveRef.current);
    }
  }

  function doStop1() {
    stopRec(text => {
      const t1 = text.trim() || '[first answer]';
      transcript1Ref.current = t1;
      setPhase('analyzing1');
      analyzePRE(t1);
    });
  }

  function doStop2() {
    stopRec(text => {
      const t2 = text.trim() || '[second answer]';
      setPhase('analyzing2');
      analyzeDebrief(transcript1Ref.current, t2);
    });
  }

  async function analyzePRE(text) {
    const t = topicRef.current;
    try {
      const res = await fetch('/api/claude', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-5', max_tokens:600,
          system:`You are the AmplifyU coach analysing a spoken response for structural quality. The user has just answered a question. They do not know you are looking for Point, Reason, Example structure. Analyse their transcript and extract the following fields.

TONE RULES — non-negotiable:
— You are a warm, professional, encouraging executive coach. Never a critic.
— coachInsight MUST open with a genuine positive observation about something specific they did.
— Never use "but" to negate the positive. Never use deficit language or negative characterisations.
— Never say they "lost" anything, "struggled", "failed to", or "missed". Frame every observation as a forward step.
— q2Instruction is always an action ("Open with your point first"), never a warning ("Don't forget your example").
— Growth-framed, motivational, professional tone throughout.

Fields to extract: pointQuote (sentence where they stated their main position, or null), pointTiming (approx seconds into answer), pointStrength ('strong', 'present', 'weak', or 'missing'), reasonQuote (sentence where they gave reasoning, or null), reasonStrength ('strong', 'present', 'weak', or 'missing'), exampleQuote (sentence where they gave a concrete example or evidence, or null), exampleStrength ('strong', 'present', 'weak', or 'missing'), exampleTiming (approx seconds into answer), overallStructure ('instinctive', 'emerging', or 'developing'), coachInsight (one warm encouraging sentence ≤25 words opening with a positive observation), q2Instruction (one short action-framed directive for Q2). Return only valid JSON.`,
          messages:[{role:'user', content:`Topic: ${t?.label}\nQuestion: ${t?.question}\n\nTranscript: "${text}"`}],
        }),
      });
      const data = await res.json();
      const raw = (data.content||[]).map(b=>b.text||'').join('');
      const m = raw.match(/\{[\s\S]*\}/);
      setPreResult(JSON.parse(m[0]));
      setPhase('reveal');
    } catch(e) {
      setPreResult({
        pointQuote: text.split(/[.!?]/)[0]?.trim()||null, pointStrength:'present', pointTiming:3,
        reasonQuote: text.split(/[.!?]/)[1]?.trim()||null, reasonStrength:'present',
        exampleQuote:null, exampleStrength:'developing', exampleTiming:0,
        overallStructure:'emerging',
        coachInsight:"Your point came through — bring your example earlier to make it land harder.",
        q2Instruction:"Open with your point in the first sentence.",
      });
      setPhase('reveal');
    }
  }

  async function analyzeDebrief(t1, t2) {
    const t = topicRef.current;
    try {
      const res = await fetch('/api/claude', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-5', max_tokens:700,
          system:`You are the AmplifyU coach. The user has just completed two rounds of The Boardroom simulation for Day 5: Structure PRE. You have their Q1 transcript and their Q2 transcript.

TONE RULES — non-negotiable:
— You are a warm, professional, encouraging executive coach. Never a critic.
— headlineVerdict MUST open with a genuine positive observation about what they demonstrated.
— Never use "but" to negate the positive. Never use deficit language or negative characterisations.
— Never say they "lost" anything, "struggled", "failed to", "missed", or "became" something negative.
— comparisonInsight must be specific and forward-looking — reference what improved or what they can build on, never what was lacking.
— takeaway is memorable and empowering, framed as a habit not a rule.
— Growth-framed, motivational, professional executive coach tone throughout.

For Q2, apply the same PRE extraction as Q1. Then compare the two. Return a JSON object with: q2PointQuote, q2PointStrength, q2ReasonQuote, q2ReasonStrength, q2ExampleQuote, q2ExampleStrength, q2OverallStructure, improvement (boolean — true if Q2 showed clearer or earlier PRE structure than Q1), headlineVerdict (one warm encouraging sentence ≤25 words opening with a positive), comparisonInsight (one specific sentence about Q1 vs Q2 — structure or timing — framed as progress), takeaway (one memorable empowering sentence framed as a habit). Return only valid JSON.`,
          messages:[{role:'user', content:`Topic: ${t?.label}\nQ1 Question: ${t?.question}\nQ2 Question: ${t?.q2}\n\nQ1 Transcript: "${t1}"\n\nQ2 Transcript: "${t2}"`}],
        }),
      });
      const data = await res.json();
      const raw = (data.content||[]).map(b=>b.text||'').join('');
      const m = raw.match(/\{[\s\S]*\}/);
      setDebriefResult(JSON.parse(m[0]));
      setPhase('debrief');
    } catch(e) {
      setDebriefResult({
        q2PointQuote:null, q2PointStrength:'present',
        q2ReasonQuote:null, q2ReasonStrength:'present',
        q2ExampleQuote:null, q2ExampleStrength:'developing', q2OverallStructure:'emerging',
        improvement:true,
        headlineVerdict:"You held your structure under pressure — that's the real test of The Boardroom.",
        comparisonInsight:"Your point arrived earlier in Q2, which gave the answer a stronger foundation from the start.",
        takeaway:"State your position in the opening sentence — every time, before anything else.",
      });
      setPhase('debrief');
    }
  }

  function reset() {
    setPhase('select'); setTopic(null); topicRef.current = null;
    setPreResult(null); setDebriefResult(null); setIsRec(false);
    setRevealRow(0); setRevealCoach(false);
    liveRef.current = ''; transcript1Ref.current = '';
  }

  const cs = {
    card:    {background:T2.surface, borderRadius:4, border:'0.5px solid '+T2.border, padding:isDesktop?'20px 24px':'16px 18px'},
    label:   {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2px', marginBottom:8},
    cta:     {width:'100%', padding:isDesktop?'14px':'13px', borderRadius:4, border:'none', background:T.ink, color:T.bg, fontSize:isDesktop?15:14, fontWeight:600, cursor:'pointer', fontFamily:T.sans, minHeight:48},
    sageCta: {width:'100%', padding:isDesktop?'14px':'13px', borderRadius:4, border:'none', background:'rgba(82,112,96,0.85)', color:'#fff', fontSize:isDesktop?15:14, fontWeight:600, cursor:'pointer', fontFamily:T.sans, minHeight:48},
    ghost:   {width:'100%', padding:'11px', borderRadius:4, border:'0.5px solid '+T2.border, background:'transparent', color:T2.text, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:T.sans, minHeight:44},
  };

  function statusIndicator(strength) {
    if (strength === 'strong' || strength === 'present') return <span style={{color:'rgba(82,112,96,0.9)', fontSize:16, fontWeight:700}}>✓</span>;
    if (strength === 'weak') return <span style={{color:T.gold, fontSize:14, fontWeight:700}}>△</span>;
    return <span style={{color:T2.text3, fontSize:14}}>—</span>;
  }

  const leftPanel = (
    <div>
      <div style={{fontFamily:T.sans, fontSize:11, fontWeight:600, color:T.gold, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:12}}>The Boardroom · Rehearsal</div>
      <h2 style={{fontFamily:T.serif, fontSize:isDesktop?40:28, fontWeight:600, color:T2.text, lineHeight:1.1, margin:'0 0 16px'}}>
        One question.<br/>Ten seconds to think.<br/>Then answer.
      </h2>
      <p style={{fontFamily:T.sans, fontSize:isDesktop?16:15, color:T2.text3, lineHeight:1.6, fontWeight:400, margin:'0 0 20px'}}>
        Every executive structures before they speak. Today you'll do the same — without being told how.
      </p>
      <div style={{background:'rgba(138,158,132,0.07)', borderRadius:6, border:'0.5px solid rgba(138,158,132,0.18)', padding:'14px 16px', marginBottom:20}}>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.7)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:8}}>Coach Tip</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, fontStyle:'italic', color:T2.text2, lineHeight:1.65, margin:0}}>
          There's no right answer. There's only a clear one.
        </p>
      </div>
    </div>
  );

  const grid = (right) => (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      {leftPanel}
      <div style={{display:'flex', flexDirection:'column', gap:16}}>{right}</div>
    </div>
  );

  // ── SELECT ─────────────────────────────────────────────────────────────────
  if (phase === 'select') return grid(<>
    <div>
      <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:8}}>Simulation · Day 5</div>
      <h3 style={{fontFamily:T.serif, fontSize:isDesktop?24:20, fontWeight:600, color:T2.text, margin:'0 0 4px', lineHeight:1.2}}>The Boardroom</h3>
      <div style={{height:2, background:T2.border, borderRadius:2, marginTop:10}}/>
    </div>
    <div style={cs.card}>
      <div style={cs.label}>Your Brief</div>
      <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text, lineHeight:1.65, margin:0}}>
        Your AmplifyU coach will ask you one question. You'll have 10 seconds to think, then answer. Speak for around 45–60 seconds — the coach analyses your response without telling you what it's looking for.
      </p>
    </div>
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
      {BOARDROOM_TOPICS.map(t => {
        const sel = topic?.id === t.id;
        return (
          <button key={t.id} onClick={() => { setTopic(t); topicRef.current = t; }}
            style={{padding:'16px 14px', borderRadius:6, border:`${sel?'2px':'1px'} solid ${sel?'rgba(82,112,96,0.75)':T2.border}`, background:sel?'rgba(82,112,96,0.18)':T2.surface, cursor:'pointer', textAlign:'center', alignItems:'center', transition:'all 0.2s', display:'flex', flexDirection:'column', gap:10, outline:'none'}}>
            <div style={{color:sel?'rgba(82,112,96,0.9)':T2.text3}}>{BOARDROOM_ICONS[t.id]}</div>
            <span style={{fontFamily:T.sans, fontSize:isDesktop?12:11, color:T2.text, lineHeight:1.4, fontWeight:sel?600:400}}>{t.label}</span>
          </button>
        );
      })}
    </div>
    <button onClick={() => { if (topic) { thinkingTargetRef.current='rec1'; setPhase('thinking'); } }}
      disabled={!topic}
      style={{...cs.cta, opacity:topic?1:0.4, cursor:topic?'pointer':'default'}}>
      Enter the Boardroom →
    </button>
  </>);

  const currentQ = thinkingTargetRef.current === 'rec2' ? topicRef.current?.q2 : topicRef.current?.question;

  // ── THINKING ───────────────────────────────────────────────────────────────
  if (phase === 'thinking') return grid(<>
    {thinkingTargetRef.current === 'rec2' && preResult?.q2Instruction && (
      <div style={{background:'rgba(138,158,132,0.07)', borderRadius:4, border:'0.5px solid rgba(138,158,132,0.25)', padding:'14px 18px'}}>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.7)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:6}}>Your instruction</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, color:'rgba(245,239,230,0.8)', lineHeight:1.5, margin:0, fontStyle:'italic'}}>{preResult.q2Instruction}</p>
      </div>
    )}
    <div style={cs.card}>
      <div style={cs.label}>{thinkingTargetRef.current === 'rec2' ? 'Question 2' : 'Your Question'}</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?22:18, fontWeight:600, color:T2.text, lineHeight:1.3, margin:0}}>"{currentQ}"</p>
    </div>
    <div style={{opacity:cardVisible&&!cardOut?1:0, transition:cardOut?'opacity 0.4s ease':cardVisible?'opacity 0.5s ease':'none', display:'flex', flexDirection:'column', gap:14}}>
      <div style={{background:'rgba(245,239,230,0.03)', border:'0.5px solid rgba(138,158,132,0.25)', borderRadius:6, padding:isDesktop?'28px 32px':'20px 22px', textAlign:'center'}}>
        {["WHAT'S YOUR POINT?","WHY?","CAN YOU PROVE IT?"].map((line,i)=>(
          <p key={i} style={{fontFamily:T.serif, fontSize:isDesktop?18:16, color:'rgba(245,239,230,0.8)', lineHeight:1.4, margin:i<2?'0 0 14px':0, fontWeight:500}}>{line}</p>
        ))}
      </div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?36:28, fontWeight:600, color:T2.text3, textAlign:'center', margin:0, lineHeight:1}}>{countdown}</p>
    </div>
    {recVisible && (
      <p style={{fontFamily:T.serif, fontSize:isDesktop?16:14, fontStyle:'italic', color:T2.text3, textAlign:'center', margin:'4px 0 0'}}>Answer when you're ready.</p>
    )}
  </>);

  // ── REC 1 ──────────────────────────────────────────────────────────────────
  if (phase === 'rec1') return grid(<>
    <div style={cs.card}>
      <div style={cs.label}>Your Question</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:'0 0 20px'}}>"{topicRef.current?.question}"</p>
      <div style={{display:'flex', alignItems:'center', gap:2, height:40, marginBottom:14}}>
        {waveVals.map((v,i)=><div key={i} style={{flex:1, height:Math.round(v*34)+'px', background:`rgba(138,158,132,${0.3+v*0.5})`, borderRadius:2, transition:'height 0.15s'}}/>)}
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <div style={{width:7, height:7, borderRadius:'50%', background:'#c0392b'}}/>
        <span style={{fontFamily:T.sans, fontSize:11, color:T2.text3}}>Answer when you're ready.</span>
      </div>
    </div>
    <button onClick={doStop1} style={{...cs.cta, background:'rgba(138,158,132,0.12)', color:T2.text, border:'0.5px solid rgba(138,158,132,0.3)'}}>
      Done →
    </button>
  </>);

  // ── ANALYZING 1 ────────────────────────────────────────────────────────────
  if (phase === 'analyzing1') return grid(
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:220, gap:16}}>
      <div style={{display:'flex', gap:8}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:'rgba(138,158,132,0.6)'}}/>)}</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?18:16, color:T2.text, margin:0, textAlign:'center'}}>Reading your answer…</p>
      <p style={{fontFamily:T.sans, fontSize:12, color:T2.text3, margin:0, textAlign:'center'}}>Looking for structure.</p>
    </div>
  );

  // ── REVEAL ─────────────────────────────────────────────────────────────────
  if (phase === 'reveal' && preResult) {
    const rows = [
      {label:'Point',   quote:preResult.pointQuote,   strength:preResult.pointStrength,   showLate:false},
      {label:'Reason',  quote:preResult.reasonQuote,  strength:preResult.reasonStrength,  showLate:false},
      {label:'Example', quote:preResult.exampleQuote, strength:preResult.exampleStrength,
        showLate:(preResult.exampleStrength==='strong'||preResult.exampleStrength==='present')&&(preResult.exampleTiming>30)},
    ];
    return grid(<>
      <div>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:8}}>What the coach heard</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, color:T2.text, lineHeight:1.4, margin:0, fontStyle:'italic'}}>"{topicRef.current?.question}"</p>
      </div>
      {rows.map((row,i) => (
        <div key={i} style={{opacity:revealRow>i?1:0, transform:revealRow>i?'translateY(0)':'translateY(10px)', transition:'opacity 0.5s ease, transform 0.5s ease'}}>
          <div style={{...cs.card, display:'flex', gap:14, alignItems:'flex-start'}}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:56}}>
              <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2px'}}>{row.label}</div>
              {statusIndicator(row.strength)}
            </div>
            <div style={{flex:1}}>
              {row.quote
                ? <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, fontStyle:'italic', color:T2.text, lineHeight:1.6, margin:0}}>"{row.quote}"</p>
                : <p style={{fontFamily:T.serif, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.4, margin:0, fontStyle:'italic'}}>Not identified</p>
              }
              {row.showLate && <p style={{fontFamily:T.sans, fontSize:11, color:T2.text3, margin:'8px 0 0'}}>Arrived late — earlier would have been stronger</p>}
            </div>
          </div>
        </div>
      ))}
      {revealCoach && (
        <>
          <div style={{background:'#0A0804', borderRadius:8, padding:isDesktop?'28px 32px':'22px 22px', border:'0.5px solid rgba(138,158,132,0.15)'}}>
            <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:14}}>Your AmplifyU Coach Says</div>
            <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, color:'rgba(245,239,230,0.92)', lineHeight:1.4, margin:'0 0 12px'}}>{preResult.coachInsight}</p>
            <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, color:'rgba(138,158,132,0.85)', lineHeight:1.55, margin:0, fontStyle:'italic'}}>{preResult.q2Instruction}</p>
          </div>
          <p style={{fontFamily:T.sans, fontSize:12, color:T2.text3, textAlign:'center', margin:0}}>Ready for question two?</p>
          <button onClick={() => { thinkingTargetRef.current='rec2'; setPhase('thinking'); }} style={cs.sageCta}>
            Next Question →
          </button>
        </>
      )}
    </>);
  }

  // ── REC 2 ──────────────────────────────────────────────────────────────────
  if (phase === 'rec2') return grid(<>
    <div style={cs.card}>
      <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:12}}>Question 2</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:'0 0 20px'}}>"{topicRef.current?.q2}"</p>
      <div style={{display:'flex', alignItems:'center', gap:2, height:40, marginBottom:14}}>
        {waveVals.map((v,i)=><div key={i} style={{flex:1, height:Math.round(v*34)+'px', background:`rgba(138,158,132,${0.3+v*0.5})`, borderRadius:2, transition:'height 0.15s'}}/>)}
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <div style={{width:7, height:7, borderRadius:'50%', background:'#c0392b'}}/>
        <span style={{fontFamily:T.sans, fontSize:11, color:T2.text3}}>Answer when you're ready.</span>
      </div>
    </div>
    <button onClick={doStop2} style={{...cs.cta, background:'rgba(138,158,132,0.12)', color:T2.text, border:'0.5px solid rgba(138,158,132,0.3)'}}>
      Done →
    </button>
  </>);

  // ── ANALYZING 2 ────────────────────────────────────────────────────────────
  if (phase === 'analyzing2') return grid(
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:220, gap:16}}>
      <div style={{display:'flex', gap:8}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:'rgba(138,158,132,0.6)'}}/>)}</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?18:16, color:T2.text, margin:0, textAlign:'center'}}>Comparing your two answers…</p>
      <p style={{fontFamily:T.sans, fontSize:12, color:T2.text3, margin:0, textAlign:'center'}}>Looking for structural shift.</p>
    </div>
  );

  // ── DEBRIEF ────────────────────────────────────────────────────────────────
  if (phase === 'debrief' && debriefResult) {
    const d = debriefResult;
    const q1cols = [{label:'Point',strength:preResult?.pointStrength},{label:'Reason',strength:preResult?.reasonStrength},{label:'Example',strength:preResult?.exampleStrength}];
    const q2cols = [{label:'Point',strength:d.q2PointStrength},{label:'Reason',strength:d.q2ReasonStrength},{label:'Example',strength:d.q2ExampleStrength}];
    return (
      <div style={{display:'flex', flexDirection:'column', gap:isDesktop?14:12}}>
        <div style={{background:'#0A0804', borderRadius:8, padding:isDesktop?'28px 32px':'22px 22px', border:'0.5px solid rgba(138,158,132,0.15)'}}>
          <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:14}}>Your AmplifyU Coach Says</div>
          <p style={{fontFamily:T.serif, fontSize:isDesktop?22:18, color:'rgba(245,239,230,0.92)', lineHeight:1.4, margin:0}}>{d.headlineVerdict}</p>
        </div>
        <div style={cs.card}>
          <div style={cs.label}>Your Two Answers</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
            {[{hdr:'Question 1',cols:q1cols},{hdr:'Question 2',cols:q2cols}].map(({hdr,cols},ci)=>(
              <div key={ci}>
                <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T2.text3, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:10}}>{hdr}</div>
                {cols.map((r,i)=>(
                  <div key={i} style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                    {statusIndicator(r.strength)}
                    <span style={{fontFamily:T.sans, fontSize:isDesktop?12:11, color:T2.text}}>{r.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{marginTop:10, padding:'8px 12px', borderRadius:4, background:d.improvement?'rgba(82,112,96,0.08)':'transparent', border:d.improvement?'0.5px solid rgba(82,112,96,0.25)':'none'}}>
            <p style={{fontFamily:T.sans, fontSize:12, color:d.improvement?'rgba(82,112,96,0.9)':T2.text3, margin:0, fontStyle:'italic'}}>
              {d.improvement ? 'Structure strengthened in Q2' : 'Consistency across both — now make it instinct'}
            </p>
          </div>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text3, lineHeight:1.6, margin:'12px 0 0'}}>{d.comparisonInsight}</p>
        </div>
        <div style={cs.card}>
          <div style={cs.label}>Take This Into Your Next Meeting</div>
          <div style={{display:'inline-block', padding:'10px 18px', background:'rgba(138,158,132,0.1)', borderRadius:20, border:'0.5px solid rgba(138,158,132,0.3)'}}>
            <p style={{fontFamily:T.serif, fontSize:isDesktop?16:14, fontStyle:'italic', color:T2.text, margin:0, lineHeight:1.4}}>{d.takeaway}</p>
          </div>
        </div>
        <div style={{display:'flex', gap:10, flexDirection:isDesktop?'row':'column'}}>
          <button onClick={reset} style={{...cs.ghost, flex:1}}>Try Again</button>
          <button style={{...cs.sageCta, flex:1}}>Continue →</button>
        </div>
      </div>
    );
  }

  return null;
}
