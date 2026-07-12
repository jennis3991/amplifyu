import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';

function findFillerClusters(text) {
  if (!text) return [];
  const re = /\b(um+|uh+|er+|ah+|like|you know|sort of|kind of|basically|literally)\b/gi;
  const hits = [];
  let m;
  while ((m = re.exec(text)) !== null) hits.push(m.index);
  const clusters = [];
  let i = 0;
  while (i < hits.length) {
    if (i + 1 < hits.length && hits[i + 1] - hits[i] < 120) {
      clusters.push(hits[i]);
      let j = i + 1;
      while (j < hits.length && hits[j] - hits[i] < 200) j++;
      i = j;
    } else { i++; }
  }
  return clusters;
}

// ─── Shared: sequential dot animation ────────────────────────────────────────
function useSequentialDots(active) {
  const [dotCount, setDotCount] = useState(0);
  useEffect(() => {
    if (!active) { setDotCount(0); return; }
    setDotCount(1);
    const id = setInterval(() => {
      setDotCount(d => {
        if (d >= 3) { clearInterval(id); return d; }
        return d + 1;
      });
    }, 600);
    return () => clearInterval(id);
  }, [active]);
  return dotCount;
}

function SequentialDots({dotCount}) {
  return (
    <div style={{display: 'flex', gap: 10, justifyContent: 'center'}}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{width: 9, height: 9, borderRadius: '50%', background: i < dotCount ? 'rgba(138,158,132,0.75)' : 'rgba(138,158,132,0.12)', transition: 'background 0.35s'}} />
      ))}
    </div>
  );
}

export function D3SimFeedback({input}) {
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false);
  const fillerWords = ["um","uh","like","you know","sort of","kind of","basically","actually","right?","so,"];
  const countFillers = (s) => fillerWords.reduce((acc,f)=>acc+(s.toLowerCase().match(new RegExp("\\b"+f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+"\\b","g"))||[]).length,0);
  async function analyse() {
    if (!input.trim()) return; setLoading(true);
    try {
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:400,messages:[{role:"user",content:`Analyse this for filler words. Return JSON: {score:number(1-10),fillerCount:number,topFillers:[string],pauses:number,win:"one strength",rewrite:"same message cleaner and filler-free"}\n\n"${input}"`}]})});
      const d = await res.json(); const raw=(d.content||[]).map(b=>b.text||"").join("").trim();
      try { const m=raw.match(/\{[\s\S]*\}/); setResult(JSON.parse(m[0])); } catch { setResult({score:8,fillerCount:countFillers(input),topFillers:["um","like"],pauses:3,win:"Good use of pauses",rewrite:input.replace(/\bum\b|\buh\b|\blike\b/gi,"").replace(/\s+/g," ").trim()}); }
    } catch { setResult(null); } setLoading(false);
  }
  return (
    <div>
      <button onClick={analyse} disabled={loading||!input.trim()} style={{width:"100%",padding:"12px",borderRadius:3,border:"none",background:loading||!input.trim()?"#DDD5C4":T.ink,color:loading||!input.trim()?"#6B5E44":"#F7F3EC",fontSize:13,fontWeight:600,cursor:loading||!input.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:result?16:0}}>
        {loading?"Analysing for fillers…":"Get Filler Score →"}
      </button>
      {result && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{padding:"16px 20px",background:"#EDE8DF",borderRadius:4,border:"0.5px solid #DDD5C4",display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:600,color:T.ink,lineHeight:1}}>{result.score}<span style={{fontSize:20,color:T.gold}}>/10</span></div>
            <div><div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#6B5E44",marginBottom:2}}>Filler Score</div><div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#6B5E44"}}>{result.fillerCount||countFillers(input)} fillers detected (goal: &lt;3)</div></div>
          </div>
          {result.topFillers?.length>0 && <div style={{padding:"10px 14px",background:"rgba(176,92,74,0.06)",borderRadius:4,borderLeft:"2px solid rgba(176,92,74,0.4)"}}><div style={{fontSize:9,fontWeight:600,color:"#B05C4A",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontFamily:"'Inter',sans-serif"}}>Fillers detected</div><p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.ink,margin:0}}>{result.topFillers.join(" · ")}</p></div>}
          {result.win && <div style={{display:"flex",gap:8}}><span style={{color:"#527060",flexShrink:0}}>✓</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.ink}}>{result.win}</span></div>}
          {result.rewrite && <div style={{padding:"12px 16px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"2px solid #8A9E84"}}><div style={{fontSize:9,fontWeight:600,color:"#527060",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontFamily:"'Inter',sans-serif"}}>Filler-free rewrite</div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontStyle:"italic",color:T.ink,margin:0,lineHeight:1.6}}>{result.rewrite}</p></div>}
        </div>
      )}
    </div>
  );
}
export function D3MobileSim() {
  const [v,setV]=useState(""); const [r,setR]=useState(null); const [l,setL]=useState(false);
  async function go(){if(!v.trim())return;setL(true);try{const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:300,messages:[{role:"user",content:`Score for filler-free speech (1-10). Return JSON: {score:number,fillerCount:number,rewrite:"cleaner version"}\n\n"${v}"`}]})});const d=await res.json();const raw=(d.content||[]).map(b=>b.text||"").join("").trim();try{const m=raw.match(/\{[\s\S]*\}/);setR(JSON.parse(m[0]));}catch{setR({score:8,fillerCount:2,rewrite:v.replace(/\bum\b|\buh\b|\blike\b/gi,"").trim()});}}catch{setR(null);}setL(false);}
  return(<div><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Write your 60-second response with no fillers…" style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:100,marginBottom:8,boxSizing:"border-box"}}/><button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?10:0}}>{l?"Analysing…":"Get Filler Score →"}</button>{r&&<div style={{display:"flex",flexDirection:"column",gap:8}}><div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#EDE8DF",borderRadius:3}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:600,color:"#2C2416",lineHeight:1}}>{r.score}<span style={{fontSize:16,color:"#8A9E84"}}>/10</span></span><span style={{fontSize:11,color:"#6B5E44",fontFamily:"'Inter',sans-serif"}}>{r.fillerCount} fillers detected</span></div>{r.rewrite&&<div style={{padding:"10px 12px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:"#2C2416",margin:0,lineHeight:1.6}}>{r.rewrite}</p></div>}</div>}</div>);
}

// ─── D3 Practice Widget — The Pause Drill ────────────────────────────────────
const DRILL_ICON = (path) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

const TOPICS = [
  {
    id: 'book',
    icon: DRILL_ICON(<><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>),
    label: 'Recommend a book everyone should read',
  },
  {
    id: 'lesson',
    icon: DRILL_ICON(<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>),
    label: "Explain one lesson you've learned recently",
  },
  {
    id: 'habit',
    icon: DRILL_ICON(<><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></>),
    label: "Describe a habit that's improved your life",
  },
  {
    id: 'skill',
    icon: DRILL_ICON(<><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></>),
    label: "What's one skill you'd like to master?",
  },
  {
    id: 'lookforward',
    icon: DRILL_ICON(<><circle cx="12" cy="12" r="4"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/></>),
    label: "Tell me about something you're looking forward to",
  },
  {
    id: 'growth',
    icon: DRILL_ICON(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>),
    label: "Explain something you've become better at over the last year",
  },
];

export function D3PracticeWidget({T, T2, isDesktop, onNavLabel, onNavFn, onSimulation}) {
  const [phase, setPhase] = useState('select');
  const [topic, setTopic] = useState(null);
  const [isRec, setIsRec] = useState(false);
  const [waveVals, setWaveVals] = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);
  const [coachResult, setCoachResult] = useState(null);

  const mediaRecRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recRef = useRef(null);
  const waveRef = useRef(null);
  const liveRef = useRef('');

  const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const dotCount = useSequentialDots(phase === 'pause');

  useEffect(() => {
    if (!onNavLabel) return;
    onNavLabel(null);
    if (onNavFn) onNavFn.current = null;
  }, [phase]);

  useEffect(() => {
    if (!isRec) { clearInterval(waveRef.current); return; }
    waveRef.current = setInterval(() => setWaveVals(() => Array.from({length: 9}, () => 0.2 + Math.random() * 0.8)), 150);
    return () => clearInterval(waveRef.current);
  }, [isRec]);

  function doStart() {
    setIsRec(true); liveRef.current = '';
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
      try { rec.start(); } catch(e) {}
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

  function doStop() {
    setIsRec(false);
    if (mediaRecRef.current && mediaRecRef.current.state !== 'inactive') {
      mediaRecRef.current.onstop = () => {};
      mediaRecRef.current.stop();
    }

    function proceed(text) {
      setPhase('coach');
      analyzeTranscript(text.trim() || '');
    }

    if (recRef.current) {
      const rec = recRef.current;
      recRef.current = null;
      // Wait for onend so any final results have been delivered
      const fallback = setTimeout(() => proceed(liveRef.current), 1800);
      rec.onend = () => { clearTimeout(fallback); proceed(liveRef.current); };
      try { rec.stop(); } catch(e) { clearTimeout(fallback); proceed(liveRef.current); }
    } else {
      proceed(liveRef.current);
    }
  }

  async function analyzeTranscript(text) {
    const hasTranscript = text.length > 0;
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 350,
          system: `You are the AmplifyU coach. The user has just completed The Pause Drill warm-up for Day 3. Observe their response and return a JSON object with three fields:

openingPause (boolean — true if they paused for at least one second before their first word, false if they began immediately)
midSpeechPause (boolean — true if they paused intentionally at any point during the response, not just at the start)
coachLine (one warm sentence of no more than 28 words)

CRITICAL TONE RULES FOR coachLine:
— coachLine MUST always open with a positive observation, regardless of whether they paused. Never open with what they did wrong.
— Never open with "No worries", "Don't worry", "That's okay", or any casual reassurance.
— Write in the voice of a calm, professional, direct executive coach. Motivational, never slangy.
— Never use informal phrases like "one beat of stillness", "beat of silence", "carry that stillness", or similar. Use clear, professional language.
— Never reference "the Hot Seat", "the simulation", or any other screen by name. The feedback is self-contained.
— Structure: [affirm something specific they did] — [clear, professional cue for their next step with the pause technique].

If openingPause is true: affirm the opening pause specifically. Example: "You took a deliberate pause before you spoke — that discipline is exactly what separates confident communicators."
If openingPause is false and midSpeechPause is true: affirm the mid-speech pause, then cue the opening pause. Example: "You paused intentionally mid-response — your next step is to bring that same discipline to the very first moment before you speak."
If both are false: affirm that they responded clearly and spoke to the topic — then offer the opening pause as the next step. Example: "You named a real challenge and spoke about it clearly — your next step is to hold a full second of silence before your first word."

Never use the word fillers. Never use the word perfect. Always frame as growth.`,
          messages: [{role: 'user', content: `Topic: ${topic?.label}\n\nResponse: ${hasTranscript ? text : '[Transcription unavailable — the user did respond. Assume a reasonable response, set openingPause true, and write an affirming coachLine.]'}`}],
        }),
      });
      const data = await res.json();
      const raw = (data.content || []).map(b => b.text || '').join('');
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) setCoachResult(JSON.parse(m[0]));
      else throw new Error('no json');
    } catch(e) {
      setCoachResult({openingPause: true, midSpeechPause: false, coachLine: "You named a real challenge and spoke about it clearly — your next step is to hold a full second of silence before your first word."});
    }
  }

  const cs = {
    card: {background: T2.surface, borderRadius: 4, border: '0.5px solid ' + T2.border, padding: isDesktop ? '22px 24px' : '16px 18px'},
    label: {fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8},
    cta: {width: '100%', padding: isDesktop ? '14px' : '13px', borderRadius: 4, border: 'none', background: T.ink, color: T.bg, fontSize: isDesktop ? 15 : 14, fontWeight: 600, cursor: 'pointer', fontFamily: T.sans, minHeight: 48, transition: 'all 0.2s'},
    sageCta: {width: '100%', padding: isDesktop ? '14px' : '13px', borderRadius: 4, border: 'none', background: 'rgba(82,112,96,0.85)', color: '#fff', fontSize: isDesktop ? 15 : 14, fontWeight: 600, cursor: 'pointer', fontFamily: T.sans, minHeight: 48, transition: 'all 0.2s'},
  };

  const leftPanel = (
    <div style={{background: '#0A0804', borderRadius: 8, padding: isDesktop ? '32px 28px' : '22px 20px', border: '0.5px solid rgba(138,158,132,0.15)', display: 'flex', flexDirection: 'column'}}>
      <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 16}}>The Pause Drill</div>
      <h2 style={{fontFamily: T.serif, fontSize: isDesktop ? 22 : 18, fontWeight: 600, color: 'rgba(245,239,230,0.9)', lineHeight: 1.35, margin: '0 0 20px'}}>
        Today's goal isn't to speak faster. It's to become comfortable with silence.
      </h2>
      <div style={{height: '0.5px', background: 'rgba(138,158,132,0.2)', marginBottom: 20}} />
      <div style={{background: 'rgba(138,158,132,0.07)', borderRadius: 4, border: '0.5px solid rgba(138,158,132,0.18)', padding: '16px 18px', marginBottom: 20}}>
        <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: 'rgba(138,158,132,0.7)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10}}>Coach Tip</div>
        <p style={{fontFamily: T.serif, fontSize: isDesktop ? 15 : 14, color: 'rgba(245,239,230,0.7)', lineHeight: 1.65, margin: 0, fontStyle: 'italic'}}>
          The strongest communicators don't rush to answer. They give themselves permission to think.
        </p>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto', paddingTop: 4}}>
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8.5" stroke="rgba(138,158,132,0.35)" strokeWidth="1.3"/>
          <path d="M10 6v4l2.5 2" stroke="rgba(138,158,132,0.35)" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span style={{fontFamily: T.sans, fontSize: 10, color: 'rgba(138,158,132,0.35)', letterSpacing: '0.05em'}}>1 minute</span>
      </div>
    </div>
  );

  const grid = (right) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {leftPanel}
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>{right}</div>
    </div>
  );

  // ── SELECT ──────────────────────────────────────────────────────────────────
  if (phase === 'select') return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
      {leftPanel}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
        {TOPICS.map(t => {
          const sel = topic?.id === t.id;
          return (
            <button key={t.id} onClick={() => setTopic(t)}
              style={{padding: '16px 14px', borderRadius: 6, border: `${sel ? '2px' : '1px'} solid ${sel ? 'rgba(82,112,96,0.75)' : T2.border}`, background: sel ? 'rgba(82,112,96,0.18)' : T2.surface, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, outline: 'none'}}>
              <div style={{color: sel ? 'rgba(82,112,96,0.95)' : T2.text3}}>{t.icon}</div>
              <span style={{fontFamily: T.sans, fontSize: isDesktop ? 12 : 11, color: T2.text, lineHeight: 1.4, fontWeight: sel ? 600 : 400}}>{t.label}</span>
            </button>
          );
        })}
      </div>
      <button onClick={() => { if (topic) setPhase('pause'); }}
        disabled={!topic}
        style={{...cs.cta, opacity: topic ? 1 : 0.4, cursor: topic ? 'pointer' : 'default'}}>
        Continue →
      </button>
    </div>
  );

  // ── PAUSE MOMENT ────────────────────────────────────────────────────────────
  if (phase === 'pause') return grid(<>
    <div style={{...cs.card, textAlign: 'center', padding: isDesktop ? '40px 32px' : '28px 22px'}}>
      <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: 'rgba(138,158,132,0.55)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 20}}>Your Topic</div>
      <p style={{fontFamily: T.serif, fontSize: isDesktop ? 20 : 17, color: T2.text, lineHeight: 1.45, margin: '0 0 32px', fontWeight: 500}}>"{topic.label}"</p>
      <div style={{marginBottom: 20}}>
        <SequentialDots dotCount={dotCount} />
      </div>
      <p style={{fontFamily: T.sans, fontSize: 12, color: T2.text4, margin: 0, letterSpacing: '0.05em'}}>
        Take your time. Recording starts when you're ready.
      </p>
    </div>
    <button
      onClick={() => { doStart(); setPhase('recording'); }}
      disabled={dotCount < 3}
      style={{...cs.cta, opacity: dotCount < 3 ? 0.3 : 1, cursor: dotCount < 3 ? 'default' : 'pointer'}}>
      Start Speaking →
    </button>
    <p style={{fontFamily: T.sans, fontSize: 10, color: 'rgba(138,158,132,0.4)', textAlign: 'center', margin: 0, letterSpacing: '0.18em', textTransform: 'uppercase'}}>
      Pause · Breathe · Speak
    </p>
  </>);

  // ── RECORDING ───────────────────────────────────────────────────────────────
  if (phase === 'recording') return grid(<>
    <div style={cs.card}>
      <div style={cs.label}>Topic</div>
      <p style={{fontFamily: T.serif, fontSize: isDesktop ? 18 : 16, color: T2.text, lineHeight: 1.4, margin: '0 0 22px'}}>{topic.label}</p>
      <div style={{display: 'flex', alignItems: 'center', gap: 2, height: 44, marginBottom: 14}}>
        {waveVals.map((v, i) => (
          <div key={i} style={{flex: 1, height: Math.round(v * 38) + 'px', background: `rgba(138,158,132,${0.3 + v * 0.5})`, borderRadius: 2, transition: 'height 0.15s'}} />
        ))}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <div style={{width: 7, height: 7, borderRadius: '50%', background: '#c0392b'}} />
        <span style={{fontFamily: T.sans, fontSize: 11, color: T2.text3, letterSpacing: '0.05em'}}>Recording — speak for around 30 seconds</span>
      </div>
    </div>
    <button onClick={doStop}
      style={{...cs.cta, background: 'rgba(138,158,132,0.12)', color: T2.text, border: '0.5px solid rgba(138,158,132,0.3)'}}>
      Submit Answer →
    </button>
  </>);

  // ── COACH OBSERVATION ───────────────────────────────────────────────────────
  if (phase === 'coach') {
    if (!coachResult) return grid(
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, gap: 16}}>
        <div style={{width: 32, height: 32, border: '2px solid rgba(138,158,132,0.15)', borderTop: '2px solid rgba(138,158,132,0.65)', borderRadius: '50%'}} />
        <p style={{fontFamily: T.sans, fontSize: 12, color: T2.text4, margin: 0}}>Reading your response…</p>
      </div>
    );
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        <div style={{background: '#0A0804', borderRadius: 8, padding: isDesktop ? '32px 36px' : '24px 22px', border: '0.5px solid rgba(138,158,132,0.15)'}}>
          <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 16}}>Your AmplifyU Coach Says</div>
          <p style={{fontFamily: T.serif, fontSize: isDesktop ? 24 : 20, color: 'rgba(245,239,230,0.92)', lineHeight: 1.4, margin: '0 0 20px'}}>{coachResult.coachLine}</p>
          <p style={{fontFamily: T.sans, fontSize: 12, color: 'rgba(138,158,132,0.45)', margin: 0, letterSpacing: '0.05em'}}>Ready for the simulation?</p>
        </div>
        <button
          onClick={() => { if (onSimulation) onSimulation(); }}
          style={cs.sageCta}>
          Enter the Hot Seat →
        </button>
        <button onClick={() => { setPhase('select'); setTopic(null); setCoachResult(null); }}
          style={{width: '100%', padding: '11px', borderRadius: 4, border: '0.5px solid ' + T2.border, background: 'transparent', color: T2.text3, fontSize: 13, fontWeight: 400, cursor: 'pointer', fontFamily: T.sans, minHeight: 44}}>
          Try Another Topic
        </button>
      </div>
    );
  }

  return null;
}

// ─── Hot Seat scenario data ───────────────────────────────────────────────────

const IC_ICON = (path) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

const HOT_SEAT_SCENARIOS = {
  ic: [
    {
      id:'standup',
      icon: IC_ICON(<><path d="M5 8h-2a1 1 0 00-1 1v4a1 1 0 001 1h2l5 4V4L5 8z"/><path d="M15.5 8.5a4 4 0 010 7"/><path d="M18.5 5.5a8 8 0 010 13"/></>),
      label:'Unexpected standup update',
      brief:`You've just joined your weekly team standup. Halfway through, your manager turns to you: "Before we move on — can you give everyone a quick update on where things stand?" Your project is on track overall but one dependency has slipped two weeks. Your team has a mitigation plan and you're still confident on the final deadline.`,
      q1:'Give us your update.',
      q2:"Why wasn't this risk flagged sooner?",
    },
    {
      id:'recommendation',
      icon: IC_ICON(<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></>),
      label:'Explaining your recommendation',
      brief:`Your team has been evaluating two approaches to a problem. Your manager has asked you to come to today's meeting ready to recommend one. You've done the analysis. You have a view. Halfway through the meeting, your manager turns to you: "Let's hear your recommendation before we go any further."`,
      q1:'Walk us through your recommendation.',
      q2:'A colleague thinks the alternative approach is lower risk. How do you respond?',
    },
    {
      id:'delay',
      icon: IC_ICON(<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>),
      label:'Handling a project delay',
      brief:`A key milestone on your project has slipped by three weeks due to a technical issue your team discovered late. Your manager has called an unplanned check-in with you and one other senior stakeholder. You know what happened. You have a recovery plan. But you haven't presented it yet.`,
      q1:'Tell us what happened and where things stand.',
      q2:'Should this have been caught earlier?',
    },
    {
      id:'feedback',
      icon: IC_ICON(<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>),
      label:'Responding to feedback',
      brief:`Your manager has just shared some feedback from a stakeholder: your last project update email was described as "hard to follow." Your manager isn't criticising you — they're giving you a heads up before a wider review meeting this afternoon and asking for your reaction.`,
      q1:"What's your initial reaction to that feedback?",
      q2:'What would you do differently next time?',
    },
    {
      id:'technical',
      icon: IC_ICON(<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>),
      label:'Explaining a technical idea',
      brief:`You're in a cross-functional meeting. A non-technical senior leader asks you to explain the approach your team is taking to solve a technical problem. You have two minutes. The room doesn't know the detail — they need to understand the logic and feel confident in the approach.`,
      q1:"Can you walk us through what your team is doing and why?",
      q2:"In simple terms — what's the risk if this doesn't work?",
    },
    {
      id:'priorities',
      icon: IC_ICON(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>),
      label:'Prioritising competing work',
      brief:`You're currently managing three workstreams simultaneously. Your manager has just told you that a fourth urgent piece of work has landed and asks you to join a call in ten minutes. On the call, the new stakeholder asks you directly how you plan to fit this in alongside everything else.`,
      q1:'How are you thinking about managing this alongside your existing priorities?',
      q2:'If something has to slip, what would it be and why?',
    },
  ],
  pl: [
    {id:'pl-1',icon:IC_ICON(<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>),label:'Steering committee update',placeholder:true,brief:'',q1:'',q2:''},
    {id:'pl-2',icon:IC_ICON(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>),label:'Sponsor challenges your timeline',placeholder:true,brief:'',q1:'',q2:''},
    {id:'pl-3',icon:IC_ICON(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>),label:'Programme risk discussion',placeholder:true,brief:'',q1:'',q2:''},
    {id:'pl-4',icon:IC_ICON(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>),label:'Budget pressure',placeholder:true,brief:'',q1:'',q2:''},
    {id:'pl-5',icon:IC_ICON(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>),label:'Executive progress review',placeholder:true,brief:'',q1:'',q2:''},
    {id:'pl-6',icon:IC_ICON(<><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>),label:'Supplier issue',placeholder:true,brief:'',q1:'',q2:''},
  ],
  people: [
    {id:'pe-1',icon:IC_ICON(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>),label:'Team performance discussion',placeholder:true,brief:'',q1:'',q2:''},
    {id:'pe-2',icon:IC_ICON(<><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></>),label:'Difficult stakeholder',placeholder:true,brief:'',q1:'',q2:''},
    {id:'pe-3',icon:IC_ICON(<><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></>),label:'Engagement survey results',placeholder:true,brief:'',q1:'',q2:''},
    {id:'pe-4',icon:IC_ICON(<><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>),label:'Prioritisation discussion',placeholder:true,brief:'',q1:'',q2:''},
    {id:'pe-5',icon:IC_ICON(<><path d="M8.56 2.9A7 7 0 0119 9v1l1.9 3.8A.5.5 0 0120.45 15H3.55a.5.5 0 01-.45-.7L5 10.5V9a7 7 0 012.56-5.4"/><path d="M12 19v3M9 22h6"/></>),label:'Making the case for your team',placeholder:true,brief:'',q1:'',q2:''},
    {id:'pe-6',icon:IC_ICON(<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>),label:'Leadership update',placeholder:true,brief:'',q1:'',q2:''},
  ],
  senior: [
    {id:'se-1',icon:IC_ICON(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>),label:'Board challenge',placeholder:true,brief:'',q1:'',q2:''},
    {id:'se-2',icon:IC_ICON(<><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></>),label:'Media question',placeholder:true,brief:'',q1:'',q2:''},
    {id:'se-3',icon:IC_ICON(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>),label:'Investor concern',placeholder:true,brief:'',q1:'',q2:''},
    {id:'se-4',icon:IC_ICON(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>),label:'Crisis response',placeholder:true,brief:'',q1:'',q2:''},
    {id:'se-5',icon:IC_ICON(<><polygon points="3 11 22 2 13 21 11 13 3 11"/></>),label:'Strategic decision',placeholder:true,brief:'',q1:'',q2:''},
    {id:'se-6',icon:IC_ICON(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>),label:'Executive committee discussion',placeholder:true,brief:'',q1:'',q2:''},
  ],
};

// ─── D3 Simulation Widget — The Hot Seat ─────────────────────────────────────
export function D3SimWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('select');
  const [track] = useState(() => {
    try { return localStorage.getItem('amplifyu_track') || 'ic'; } catch { return 'ic'; }
  });
  const [scenario, setScenario] = useState(null);

  // Brief countdown
  const [briefSecs, setBriefSecs] = useState(45);
  const [briefDone, setBriefDone] = useState(false);

  // Sequential dots — shared hook
  const dotCount = useSequentialDots(phase === 'pause1' || phase === 'pause2');

  // Recording
  const [isRec, setIsRec] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [waveVals, setWaveVals] = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);
  const [transcript1, setTranscript1] = useState('');
  const [transcript2, setTranscript2] = useState('');

  // Feedback
  const [feedback, setFeedback] = useState(null);

  // Refs
  const mediaRecRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recRef = useRef(null);
  const timerRef = useRef(null);
  const briefTimerRef = useRef(null);
  const waveRef = useRef(null);
  const liveRef = useRef('');

  const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  // Brief countdown
  useEffect(() => {
    if (phase !== 'brief') return;
    if (briefSecs > 0) {
      briefTimerRef.current = setTimeout(() => setBriefSecs(s => s - 1), 1000);
    } else {
      setBriefDone(true);
    }
    return () => clearTimeout(briefTimerRef.current);
  }, [phase, briefSecs]);

  // Recording timer
  useEffect(() => {
    if (!isRec) return;
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else {
      doStop();
    }
    return () => clearTimeout(timerRef.current);
  }, [isRec, timeLeft]);

  // Waveform during recording
  useEffect(() => {
    if (!isRec) { clearInterval(waveRef.current); return; }
    waveRef.current = setInterval(() => setWaveVals(() => Array.from({length: 9}, () => 0.2 + Math.random() * 0.8)), 150);
    return () => clearInterval(waveRef.current);
  }, [isRec]);

  function doStart() {
    setIsRec(true); setTimeLeft(90); liveRef.current = '';
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
      try { rec.start(); } catch(e) {}
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

  function doStop() {
    setIsRec(false);
    if (recRef.current) { try { recRef.current.stop(); } catch(e) {} recRef.current = null; }
    const captured = liveRef.current.trim() || '[No speech detected]';

    const finish = () => {
      if (phase === 'rec1') {
        setTranscript1(captured);
        setPhase('transition');
      } else if (phase === 'rec2') {
        setTranscript2(captured);
        setPhase('analyzing');
        analyzeResponses(transcript1, captured);
      }
    };

    if (mediaRecRef.current && mediaRecRef.current.state !== 'inactive') {
      mediaRecRef.current.onstop = finish;
      mediaRecRef.current.stop();
    } else {
      finish();
    }
  }

  async function analyzeResponses(t1, t2) {
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1200,
          system: `You are the AmplifyU coach. The user has just completed The Hot Seat simulation for Day 3: Eliminate Fillers. Analyse their two spoken responses. Identify filler words used (um, uh, like, you know, so, basically, kind of, sort of). Note whether fillers clustered at the start of answers or during transitions. Assess whether their position held or weakened under Q2. Assess whether their opening sentence was direct. Return a JSON object with these fields: headlineVerdict (one coaching sentence, warm and direct, growth-focused never deficit-focused), fillerCount (integer), fillerContext (one sentence about when fillers appeared), pauseBehaviour (one sentence on whether they used pauses effectively), positionHeld (boolean), positionNote (one sentence on whether they held or softened their position under Q2), takeaway (one memorable sentence they can use in their next real meeting), q1Excerpt (the single sentence from Q1 where fillers were most concentrated, or their strongest sentence if none), q2Excerpt (same for Q2), q1Improved (a suggested cleaner version of that sentence with pause markers shown as [pause]), q2Improved (same for Q2).`,
          messages: [{
            role: 'user',
            content: `Scenario: ${scenario?.label}\n\nQuestion 1: ${scenario?.q1}\nResponse 1: ${t1}\n\nQuestion 2: ${scenario?.q2}\nResponse 2: ${t2}`,
          }],
        }),
      });
      const data = await res.json();
      const raw = (data.content || []).map(b => b.text || '').join('');
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) setFeedback(JSON.parse(m[0]));
    } catch(e) {
      console.error(e);
    }
    setPhase('feedback');
  }

  function reset() {
    setPhase('select'); setScenario(null);
    setBriefSecs(45); setBriefDone(false);
    setTranscript1(''); setTranscript2('');
    setFeedback(null); setIsRec(false); setTimeLeft(90);
  }

  const cs = {
    card: {background: T2.surface, borderRadius: 4, border: '0.5px solid ' + T2.border, padding: isDesktop ? '22px 24px' : '16px 18px'},
    label: {fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8},
    cta: {width: '100%', padding: isDesktop ? '14px' : '13px', borderRadius: 4, border: 'none', background: T.ink, color: T.bg, fontSize: isDesktop ? 15 : 14, fontWeight: 600, cursor: 'pointer', fontFamily: T.sans, minHeight: 48, transition: 'all 0.2s'},
    ghost: {width: '100%', padding: '11px', borderRadius: 4, border: '0.5px solid ' + T2.border, background: 'transparent', color: T2.text, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: T.sans, minHeight: 44},
    cue: {fontFamily: T.sans, fontSize: 10, letterSpacing: '0.18em', color: 'rgba(138,158,132,0.45)', textAlign: 'center', marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(138,158,132,0.1)'},
  };

  const scenarios = HOT_SEAT_SCENARIOS[track] || HOT_SEAT_SCENARIOS.ic;

  const leftPanel = (
    <div style={{background: '#0A0804', borderRadius: 8, padding: isDesktop ? '32px 28px' : '22px 20px', border: '0.5px solid rgba(138,158,132,0.15)', display: 'flex', flexDirection: 'column', gap: 0}}>
      <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 16}}>The Hot Seat</div>
      <h2 style={{fontFamily: T.serif, fontSize: isDesktop ? 22 : 18, fontWeight: 600, color: 'rgba(245,239,230,0.9)', lineHeight: 1.35, margin: '0 0 20px'}}>
        Today's challenge isn't giving the perfect answer. It's staying calm when you're put on the spot.
      </h2>
      <div style={{height: '0.5px', background: 'rgba(138,158,132,0.2)', marginBottom: 20}} />
      <div style={{background: 'rgba(138,158,132,0.07)', borderRadius: 4, border: '0.5px solid rgba(138,158,132,0.18)', padding: '16px 18px'}}>
        <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: 'rgba(138,158,132,0.7)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10}}>Coach Tip</div>
        <p style={{fontFamily: T.serif, fontSize: isDesktop ? 15 : 14, color: 'rgba(245,239,230,0.7)', lineHeight: 1.65, margin: 0, fontStyle: 'italic'}}>
          When you feel the urge to fill the silence — pause instead. Great communicators don't fill silence. They use it.
        </p>
      </div>
      {phase !== 'select' && <div style={cs.cue}>Pause · Breathe · Respond</div>}
    </div>
  );

  const grid = (right) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {leftPanel}
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>{right}</div>
    </div>
  );

  // ── SCREEN 1: SELECT ────────────────────────────────────────────────────────
  if (phase === 'select') return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
      {leftPanel}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
        {scenarios.map(sc => {
          const sel = scenario?.id === sc.id;
          return (
            <button key={sc.id}
              onClick={() => { if (!sc.placeholder) setScenario(sc); }}
              disabled={!!sc.placeholder}
              style={{padding: '16px 14px', borderRadius: 6, border: `${sel ? '2px' : '1px'} solid ${sel ? 'rgba(138,158,132,0.6)' : T2.border}`, background: sel ? 'rgba(138,158,132,0.1)' : T2.surface, cursor: sc.placeholder ? 'default' : 'pointer', textAlign: 'center', transition: 'all 0.2s', opacity: sc.placeholder ? 0.35 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, outline: 'none'}}>
              <div style={{color: sel ? 'rgba(82,112,96,0.95)' : T2.text3}}>{sc.icon}</div>
              <span style={{fontFamily: T.sans, fontSize: isDesktop ? 12 : 11, color: T2.text, lineHeight: 1.4, fontWeight: sel ? 600 : 400}}>{sc.label}</span>
            </button>
          );
        })}
      </div>
      <button onClick={() => { if (scenario) { setPhase('brief'); setBriefSecs(45); setBriefDone(false); } }}
        disabled={!scenario}
        style={{...cs.cta, opacity: scenario ? 1 : 0.4, cursor: scenario ? 'pointer' : 'default'}}>
        Enter the Hot Seat →
      </button>
    </div>
  );

  // ── SCREEN 2: BRIEF ─────────────────────────────────────────────────────────
  if (phase === 'brief') return grid(<>
    <div style={cs.card}>
      <div style={cs.label}>Your Scenario</div>
      <p style={{fontFamily: T.serif, fontSize: isDesktop ? 17 : 15, color: T2.text, lineHeight: 1.75, margin: '0 0 18px'}}>{scenario.brief}</p>
      <p style={{fontFamily: T.serif, fontSize: isDesktop ? 14 : 13, color: 'rgba(138,158,132,0.65)', fontStyle: 'italic', margin: 0}}>You'll be asked two questions. Remember: Pause. Breathe. Respond.</p>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontFamily: T.sans, fontSize: 10, color: T2.text4, letterSpacing: '0.1em', textTransform: 'uppercase'}}>Read time</span>
        <span style={{fontFamily: T.sans, fontSize: 11, color: briefDone ? 'rgba(138,158,132,0.8)' : T2.text3, fontWeight: 600}}>
          {briefDone ? 'Ready' : '0:' + String(briefSecs).padStart(2, '0')}
        </span>
      </div>
      <div style={{height: 2, background: T2.border, borderRadius: 2, overflow: 'hidden'}}>
        <div style={{height: '100%', width: ((45 - briefSecs) / 45 * 100) + '%', background: 'rgba(138,158,132,0.55)', borderRadius: 2, transition: 'width 1s linear'}} />
      </div>
    </div>
    <button onClick={() => setPhase('pause1')} disabled={!briefDone}
      style={{...cs.cta, opacity: briefDone ? 1 : 0.35, cursor: briefDone ? 'pointer' : 'default'}}>
      I'm Ready →
    </button>
    <div style={cs.cue}>Pause · Breathe · Respond</div>
  </>);

  // ── SCREEN 3: PAUSE MOMENT ──────────────────────────────────────────────────
  if (phase === 'pause1' || phase === 'pause2') {
    const q = phase === 'pause1' ? scenario.q1 : scenario.q2;
    const qNum = phase === 'pause1' ? 1 : 2;
    return grid(<>
      <div style={{...cs.card, padding: isDesktop ? '32px 28px' : '24px 20px'}}>
        <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: 'rgba(138,158,132,0.55)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 18}}>Question {qNum} of 2</div>
        <p style={{fontFamily: T.serif, fontSize: isDesktop ? 24 : 20, fontWeight: 600, color: T2.text, lineHeight: 1.35, margin: '0 0 32px'}}>{q}</p>
        <div style={{marginBottom: 20}}>
          <SequentialDots dotCount={dotCount} />
        </div>
        <p style={{fontFamily: T.sans, fontSize: 12, color: T2.text4, textAlign: 'center', margin: 0, letterSpacing: '0.05em'}}>Take a moment. There's no rush.</p>
      </div>
      <button
        onClick={() => { doStart(); setPhase(phase === 'pause1' ? 'rec1' : 'rec2'); }}
        disabled={dotCount < 3}
        style={{...cs.cta, opacity: dotCount < 3 ? 0.3 : 1, cursor: dotCount < 3 ? 'default' : 'pointer'}}>
        Start Answer →
      </button>
      <div style={cs.cue}>Pause · Breathe · Respond</div>
    </>);
  }

  // ── SCREEN 4: RECORDING ─────────────────────────────────────────────────────
  if (phase === 'rec1' || phase === 'rec2') {
    const qNum = phase === 'rec1' ? 1 : 2;
    const mins = Math.floor(timeLeft / 60);
    const secs = String(timeLeft % 60).padStart(2, '0');
    return grid(<>
      <div style={cs.card}>
        <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: 'rgba(138,158,132,0.55)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12}}>Question {qNum} of 2</div>
        <p style={{fontFamily: T.serif, fontSize: isDesktop ? 18 : 16, color: T2.text, lineHeight: 1.4, margin: '0 0 22px'}}>{phase === 'rec1' ? scenario.q1 : scenario.q2}</p>
        <div style={{display: 'flex', alignItems: 'center', gap: 2, height: 44, marginBottom: 14}}>
          {waveVals.map((v, i) => (
            <div key={i} style={{flex: 1, height: Math.round(v * 38) + 'px', background: `rgba(138,158,132,${0.3 + v * 0.5})`, borderRadius: 2, transition: 'height 0.15s'}} />
          ))}
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <div style={{width: 7, height: 7, borderRadius: '50%', background: '#c0392b'}} />
            <span style={{fontFamily: T.sans, fontSize: 11, color: T2.text3, letterSpacing: '0.05em'}}>Recording</span>
          </div>
          <span style={{fontFamily: T.sans, fontSize: 12, color: T2.text3, fontVariantNumeric: 'tabular-nums'}}>{mins}:{secs}</span>
        </div>
      </div>
      <button onClick={doStop} style={{...cs.cta, background: 'rgba(138,158,132,0.12)', color: T2.text, border: '0.5px solid rgba(138,158,132,0.3)'}}>
        Submit Answer →
      </button>
      <div style={cs.cue}>Pause · Breathe · Respond</div>
    </>);
  }

  // ── TRANSITION ──────────────────────────────────────────────────────────────
  if (phase === 'transition') return grid(<>
    <div style={{...cs.card, textAlign: 'center', padding: isDesktop ? '40px 32px' : '28px 22px'}}>
      <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: 'rgba(138,158,132,0.55)', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 20}}>Q1 Complete</div>
      <p style={{fontFamily: T.serif, fontSize: isDesktop ? 26 : 20, fontWeight: 600, color: T2.text, lineHeight: 1.3, margin: '0 0 10px'}}>Good.</p>
      <p style={{fontFamily: T.serif, fontSize: isDesktop ? 18 : 16, color: 'rgba(245,239,230,0.6)', lineHeight: 1.45, margin: 0}}>One more question — and this one pushes back.</p>
    </div>
    <button onClick={() => setPhase('pause2')} style={cs.cta}>Continue →</button>
    <div style={cs.cue}>Pause · Breathe · Respond</div>
  </>);

  // ── ANALYZING ───────────────────────────────────────────────────────────────
  if (phase === 'analyzing') return grid(
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 16}}>
      <div style={{width: 36, height: 36, border: '2px solid rgba(138,158,132,0.15)', borderTop: '2px solid rgba(138,158,132,0.65)', borderRadius: '50%'}} />
      <p style={{fontFamily: T.sans, fontSize: 13, color: T2.text4, margin: 0}}>Analysing your responses…</p>
    </div>
  );

  // ── FEEDBACK ────────────────────────────────────────────────────────────────
  if (phase === 'feedback' && feedback) {
    const posLabel = feedback.positionHeld === true ? 'Yes' : feedback.positionHeld === false ? 'Softened' : 'Almost';
    const posColor = feedback.positionHeld === true ? '#527060' : feedback.positionHeld === false ? '#B05C4A' : '#C8A46A';

    function renderImproved(text) {
      if (!text) return null;
      return text.split(/(\[pause\])/i).map((part, i) =>
        /\[pause\]/i.test(part)
          ? <span key={i} style={{color: 'rgba(138,158,132,0.8)', fontStyle: 'normal', fontWeight: 600, fontFamily: T.sans, fontSize: 11}}> [pause] </span>
          : <span key={i}>{part}</span>
      );
    }

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        <div style={{background: '#0A0804', borderRadius: 8, padding: isDesktop ? '28px 32px' : '22px 20px', border: '0.5px solid rgba(138,158,132,0.15)'}}>
          <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 12}}>Your AmplifyU Coach Says</div>
          <p style={{fontFamily: T.serif, fontSize: isDesktop ? 22 : 18, color: 'rgba(245,239,230,0.92)', lineHeight: 1.4, margin: 0}}>{feedback.headlineVerdict}</p>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: isDesktop ? 12 : 8}}>
          {[
            {value: String(feedback.fillerCount ?? 0), label: 'fillers', note: feedback.fillerContext, color: null},
            {value: 'Pauses', label: 'pauses', note: feedback.pauseBehaviour, color: 'rgba(138,158,132,0.7)'},
            {value: posLabel, label: 'under pressure', note: feedback.positionNote, color: posColor},
          ].map((c, i) => (
            <div key={i} style={{...cs.card, padding: isDesktop ? '16px 14px' : '12px 10px', borderTop: `2px solid ${c.color || 'rgba(138,158,132,0.4)'}`}}>
              <div style={{fontFamily: T.serif, fontSize: isDesktop ? 28 : 22, fontWeight: 600, color: c.color || T2.text, lineHeight: 1, marginBottom: 4}}>{c.value}</div>
              <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6}}>{c.label}</div>
              {c.note && <p style={{fontFamily: T.sans, fontSize: isDesktop ? 11 : 10, color: T2.text4, lineHeight: 1.5, margin: 0}}>{c.note}</p>}
            </div>
          ))}
        </div>
        <div style={cs.card}>
          <div style={cs.label}>Where the Pause Would Have Helped</div>
          {[
            {q: 'Q1', orig: feedback.q1Excerpt, improved: feedback.q1Improved},
            {q: 'Q2', orig: feedback.q2Excerpt, improved: feedback.q2Improved},
          ].map((item, i) => (
            <div key={i} style={{marginBottom: i === 0 ? 20 : 0}}>
              <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: T2.text4, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6}}>{item.q}</div>
              <p style={{fontFamily: T.serif, fontSize: isDesktop ? 15 : 14, fontStyle: 'italic', color: T2.text, lineHeight: 1.65, margin: '0 0 6px'}}>"{item.orig}"</p>
              <p style={{fontFamily: T.serif, fontSize: isDesktop ? 15 : 14, color: 'rgba(245,239,230,0.45)', lineHeight: 1.65, margin: 0}}>{renderImproved(item.improved)}</p>
            </div>
          ))}
        </div>
        <div style={cs.card}>
          <div style={cs.label}>Take This Into Your Next Meeting</div>
          <span style={{display: 'inline-block', padding: '9px 18px', borderRadius: 20, border: '0.5px solid rgba(138,158,132,0.3)', fontFamily: T.serif, fontSize: isDesktop ? 15 : 14, color: T2.text, lineHeight: 1.4}}>{feedback.takeaway}</span>
        </div>
        <div style={{display: 'flex', gap: 12}}>
          <button onClick={reset} style={{...cs.ghost, flex: 1}}>Try Again</button>
          <button onClick={reset} style={{...cs.cta, flex: 2}}>Continue →</button>
        </div>
      </div>
    );
  }

  return grid(
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200}}>
      <p style={{fontFamily: T.sans, fontSize: 13, color: T2.text4}}>Loading…</p>
    </div>
  );
}
