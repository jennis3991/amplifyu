import { useState, useEffect, useMemo, useRef } from 'react';
import { T } from '../theme.js';

function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export function D4SimFeedback({input}) {
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false);
  const avgLen = (s) => { const sents = s.match(/[^.!?]+[.!?]+/g)||[]; if (!sents.length) return 0; return Math.round(sents.reduce((a,s)=>a+s.trim().split(/\s+/).length,0)/sents.length); };
  const longSents = (s) => (s.match(/[^.!?]+[.!?]+/g)||[]).filter(s=>s.trim().split(/\s+/).length>20);
  async function analyse() {
    if (!input.trim()) return; setLoading(true);
    try {
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:400,messages:[{role:"user",content:`Analyse this for sentence length and brevity. Return JSON: {score:number(1-10),avgWords:number,longestSentence:string,rewrite:"same message in short sentences",tip:"one actionable improvement"}\n\n"${input}"`}]})});
      const d = await res.json(); const raw=(d.content||[]).map(b=>b.text||"").join("").trim();
      try { const m=raw.match(/\{[\s\S]*\}/); setResult(JSON.parse(m[0])); } catch { setResult({score:7,avgWords:avgLen(input),longestSentence:longSents(input)[0]||"",rewrite:"Split each idea into its own sentence. Aim for under 15 words each.",tip:"Find every 'and' — split there first."}); }
    } catch { setResult(null); } setLoading(false);
  }
  return (
    <div>
      <button onClick={analyse} disabled={loading||!input.trim()} style={{width:"100%",padding:"12px",borderRadius:3,border:"none",background:loading||!input.trim()?"#DDD5C4":T.ink,color:loading||!input.trim()?"#6B5E44":"#F7F3EC",fontSize:13,fontWeight:600,cursor:loading||!input.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:result?16:0}}>
        {loading?"Analysing sentence length…":"Get Brevity Score →"}
      </button>
      {result && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{padding:"16px 20px",background:"#EDE8DF",borderRadius:4,border:"0.5px solid #DDD5C4",display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:600,color:T.ink,lineHeight:1}}>{result.score}<span style={{fontSize:20,color:T.gold}}>/10</span></div>
            <div><div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#6B5E44",marginBottom:2}}>Brevity Score</div><div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#6B5E44"}}>Avg. sentence: ~{result.avgWords||avgLen(input)} words (target: &lt;15)</div></div>
          </div>
          {result.longestSentence && <div style={{padding:"12px 16px",background:"rgba(176,92,74,0.06)",borderRadius:4,borderLeft:"2px solid rgba(176,92,74,0.4)"}}><div style={{fontSize:9,fontWeight:600,color:"#B05C4A",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontFamily:"'Inter',sans-serif"}}>Longest sentence</div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:T.ink,margin:0,lineHeight:1.6}}>{result.longestSentence}</p></div>}
          {result.rewrite && <div style={{padding:"12px 16px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"2px solid #8A9E84"}}><div style={{fontSize:9,fontWeight:600,color:"#527060",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontFamily:"'Inter',sans-serif"}}>Rewrite suggestion</div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:T.ink,margin:0,lineHeight:1.6}}>{result.rewrite}</p></div>}
          {result.tip && <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#6B5E44",fontStyle:"italic",margin:0}}>{result.tip}</p>}
        </div>
      )}
    </div>
  );
}

// ─── D4 Mobile helpers ────────────────────────────────────────────────────────
export function D4MobileSplit() {
  const [v,setV]=useState(""); const [r,setR]=useState(""); const [l,setL]=useState(false);
  const wc = v.trim().split(/\s+/).filter(Boolean).length;
  async function go(){if(!v.trim())return;setL(true);try{const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:200,messages:[{role:"user",content:`Split into short sentences under 15 words each. Return ONLY the split version: "${v}"`}]})});const d=await res.json();setR((d.content||[]).map(b=>b.text||"").join("").trim());}catch{setR("Split at every 'and', 'but', 'which', or 'that'.");}setL(false);}
  return(<div><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Paste a long sentence…" style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:60,marginBottom:4,boxSizing:"border-box"}}/>{v&&<p style={{fontSize:11,color:wc>15?"#B05C4A":"#527060",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>{wc} words{wc>15?" — too long":""}</p>}<button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?10:0}}>{l?"Splitting…":"Split It →"}</button>{r&&<div style={{padding:"12px 14px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#2C2416",margin:0,lineHeight:1.6}}>{r}</p></div>}</div>);
}
export function D4MobileSim() {
  const [v,setV]=useState(""); const [r,setR]=useState(null); const [l,setL]=useState(false);
  async function go(){if(!v.trim())return;setL(true);try{const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:300,messages:[{role:"user",content:`Score this for sentence brevity (target <15 words each). Return JSON: {score:number,avgWords:number,rewrite:"shorter version"}\n\n"${v}"`}]})});const d=await res.json();const raw=(d.content||[]).map(b=>b.text||"").join("").trim();try{const m=raw.match(/\{[\s\S]*\}/);setR(JSON.parse(m[0]));}catch{setR({score:7,avgWords:18,rewrite:"Break each idea into its own sentence. Aim for under 15 words."});}}catch{setR(null);}setL(false);}
  return(<div><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Write using only short sentences…" style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:100,marginBottom:8,boxSizing:"border-box"}}/><button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?10:0}}>{l?"Analysing…":"Get Brevity Score →"}</button>{r&&<div style={{display:"flex",flexDirection:"column",gap:8}}><div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#EDE8DF",borderRadius:3}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:600,color:"#2C2416",lineHeight:1}}>{r.score}<span style={{fontSize:16,color:"#8A9E84"}}>/10</span></span><span style={{fontSize:11,color:"#6B5E44",fontFamily:"'Inter',sans-serif"}}>Avg. ~{r.avgWords} words/sentence</span></div>{r.rewrite&&<div style={{padding:"10px 12px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:"#2C2416",margin:0,lineHeight:1.6}}>{r.rewrite}</p></div>}</div>}</div>);
}

// ─── D4 Practice Widget — The Edit ───────────────────────────────────────────

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
    <div style={{display:'flex',gap:10,justifyContent:'center'}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:9,height:9,borderRadius:'50%',background:i<dotCount?'rgba(138,158,132,0.75)':'rgba(138,158,132,0.12)',transition:'background 0.35s'}}/>
      ))}
    </div>
  );
}

const EDIT_ICON = (path) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

const EI_UPDATE  = EDIT_ICON(<><polyline points="20 6 9 17 4 12"/></>);
const EI_CHAT    = EDIT_ICON(<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>);
const EI_BULB    = EDIT_ICON(<><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></>);
const EI_RISK    = EDIT_ICON(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>);
const EI_CLIP    = EDIT_ICON(<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></>);
const EI_STAR    = EDIT_ICON(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>);
const EI_TARGET  = EDIT_ICON(<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>);
const EI_ARROW   = EDIT_ICON(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>);
const EI_PERSON  = EDIT_ICON(<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>);

export function D4PracticeWidget({T, T2, isDesktop, onNavLabel, onNavFn, onSimulation}) {
  const _roleId = (() => { try { return localStorage.getItem("au1_role"); } catch(_) { return null; } })();

  const EDIT_TOPICS = [
    { id:'update',   icon: EI_UPDATE, label: "Share one important update from your week." },
    { id:'recommend',icon: EI_CHAT,   label: "Recommend one tool, book, podcast or resource you've found useful recently." },
    ...({
      individual: [
        { id:'problem', icon: EI_BULB,   label: "Explain a problem you solved this week." },
        { id:'risk',    icon: EI_RISK,   label: "Flag a risk to your manager in under one minute." },
      ],
      delivery: [
        { id:'status',  icon: EI_CLIP,   label: "Give a concise project status update." },
        { id:'prisk',   icon: EI_RISK,   label: "Explain the biggest project risk right now." },
      ],
      people: [
        { id:'recognise', icon: EI_STAR,   label: "Recognise a team member for great work." },
        { id:'priority',  icon: EI_TARGET, label: "Explain a priority for your team this week." },
      ],
      senior: [
        { id:'qpriority', icon: EI_TARGET, label: "Explain this quarter's top priority." },
        { id:'change',    icon: EI_ARROW,  label: "Announce a change in direction to your leadership team." },
      ],
    }[_roleId] || [
      { id:'problem', icon: EI_BULB,   label: "Explain a problem you solved this week." },
      { id:'intro',   icon: EI_PERSON, label: "Introduce yourself to someone you've just met." },
    ]),
  ];

  const [phase, setPhase] = useState('select');
  const [topic, setTopic] = useState(null);

  // Recording
  const [isRec, setIsRec] = useState(false);
  const [waveVals, setWaveVals] = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);
  const [transcript1, setTranscript1] = useState('');
  const [transcript2, setTranscript2] = useState('');

  // Interrupt animation
  const [dividerFull, setDividerFull] = useState(false);
  const [interruptTextVisible, setInterruptTextVisible] = useState(false);

  // Coach
  const [coachResult, setCoachResult] = useState(null);

  const mediaRecRef = useRef(null);
  const audioChunksRef = useRef([]);
  const waveRef = useRef(null);
  const interruptTimerRef = useRef(null);

  const dotCount = useSequentialDots(phase === 'pause');

  useEffect(() => {
    if (!onNavLabel) return;
    onNavLabel(null);
    if (onNavFn) onNavFn.current = null;
  }, [phase]);

  // Waveform animation during recording
  useEffect(() => {
    if (!isRec) { clearInterval(waveRef.current); return; }
    waveRef.current = setInterval(() => setWaveVals(() => Array.from({length:9}, () => 0.2 + Math.random() * 0.8)), 150);
    return () => clearInterval(waveRef.current);
  }, [isRec]);

  // Interrupt screen animation
  useEffect(() => {
    if (phase !== 'interrupt') { setDividerFull(false); setInterruptTextVisible(false); return; }
    setDividerFull(false);
    setInterruptTextVisible(false);
    const t1 = setTimeout(() => setDividerFull(true), 60);
    const t2 = setTimeout(() => setInterruptTextVisible(true), 680);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  function startRecording() {
    audioChunksRef.current = [];
    console.log('[Day4 DEBUG] startRecording called, mediaDevices?.getUserMedia present:', !!navigator.mediaDevices?.getUserMedia);
    if (navigator.mediaDevices?.getUserMedia) {
      console.log('[Day4 DEBUG] calling getUserMedia({audio: true})');
      navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        console.log('[Day4 DEBUG] getUserMedia resolved, stream:', stream);
        let mr;
        try { mr = new MediaRecorder(stream, {mimeType: 'audio/webm'}); }
        catch { mr = new MediaRecorder(stream); }
        mr.ondataavailable = e => {
          console.log('[Day4 DEBUG] ondataavailable, chunk size:', e.data.size);
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mr.start(1000);
        mediaRecRef.current = mr;
      }).catch((err) => { console.log('[Day4 DEBUG] getUserMedia REJECTED:', err && err.name, err && err.message); });
    } else {
      console.log('[Day4 DEBUG] navigator.mediaDevices.getUserMedia is NOT available in this webview context');
    }
  }

  // Stops the recorder, transcribes it server-side, and calls cb with the text (or '' on failure)
  function stopRecording(cb) {
    const mr = mediaRecRef.current;
    if (!mr || mr.state === 'inactive') { cb(''); return; }
    mr.onstop = async () => {
      mr.stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
      try {
        const b64 = await blobToB64(blob);
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({b64, mimeType: 'audio/webm'}),
        });
        const data = await res.json();
        cb((data.text || '').trim());
      } catch {
        cb('');
      }
    };
    try { mr.stop(); } catch(e) { cb(''); }
  }

  // Start rec1 — fires interrupt at 10s
  function doStart1() {
    setIsRec(true);
    startRecording();
    interruptTimerRef.current = setTimeout(() => {
      stopRecording((text) => {
        setIsRec(false);
        setTranscript1(text || '[first attempt]');
        setPhase('interrupt');
      });
    }, 10000);
  }

  // Start rec2 — runs to manual completion
  function doStart2() {
    setIsRec(true);
    startRecording();
  }

  function doStop2() {
    stopRecording((text) => {
      setIsRec(false);
      const t2 = text || '[second attempt]';
      setTranscript2(t2);
      setPhase('coach');
      analyzeEdit(transcript1, t2);
    });
  }

  async function analyzeEdit(t1, t2) {
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 400,
          system: `You are the AmplifyU coach. The user has just completed The Edit warm-up for Day 4: Short Sentences. They spoke once, were interrupted, then compressed their message. Analyse both transcripts and return a JSON object.

TONE RULES — these are non-negotiable:
— You are a warm, professional, encouraging executive coach. Never a critic.
— The coachLine MUST open with a genuine positive observation about what they achieved.
— The coachLine MUST include one concrete, specific detail from what they actually said — either quote a short phrase verbatim in quotation marks, or name the specific word/phrase they cut or kept between attempt one and attempt two. Never write an observation generic enough to apply to any transcript.
— If a transcript is empty, a placeholder, or contains no real speech, keep the observation general rather than inventing or quoting content that wasn't said.
— Never use the word "but" to contrast the positive with a negative. Use "and" or "your next step is" instead.
— Never frame anything as loss, failure, or something missing. Every observation is a step forward.
— Never make negative characterisations of how they communicated — phrases like "you lost yourself", "you became a job title", "you rushed", "you struggled" are completely forbidden.
— Never use the word "ruthlessly", "unfortunately", "however", or any word that signals a reversal of the positive.
— If the core message was lost in compression, frame it as: they demonstrated real editing skill, and the next step is to keep the essential point anchored while they cut.
— If they spoke faster, frame it as: pace is natural under pressure, and the skill is learning to cut words rather than time.
— coachLine is one sentence, maximum 25 words, always warm and forward-looking.
— bridgeLine connects to Breaking News with encouragement, never a warning.
— Never use the word perfect. Never mention scores. Always growth-framed.

JSON fields: compressionAchieved (boolean — true if attempt two was meaningfully shorter), coreMessageSurvived (boolean — true if the essential point remained), spokesFaster (boolean — true if the pace increased rather than the content reducing), coachLine (one warm encouraging sentence ≤25 words), bridgeLine (one sentence connecting to Breaking News, ending with a forward-looking cue about cutting words not pace).`,
          messages: [{
            role: 'user',
            content: `Topic: ${topic?.label}\n\nFirst attempt (before interrupt): ${t1}\n\nSecond attempt (after interrupt): ${t2}`,
          }],
        }),
      });
      const data = await res.json();
      const raw = (data.content || []).map(b => b.text || '').join('');
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) setCoachResult(JSON.parse(m[0]));
      else throw new Error('no json');
    } catch(e) {
      setCoachResult({
        compressionAchieved: true,
        coreMessageSurvived: true,
        spokesFaster: false,
        coachLine: "You found the shorter version — that compression is exactly the skill Breaking News will test.",
        bridgeLine: "In Breaking News, the edit gets harder. Cut the words, not the pace.",
      });
    }
  }

  useEffect(() => () => clearTimeout(interruptTimerRef.current), []);

  const cs = {
    card: {background: T2.surface, borderRadius: 4, border: '0.5px solid ' + T2.border, padding: isDesktop ? '22px 24px' : '16px 18px'},
    label: {fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8},
    cta: {width: '100%', padding: isDesktop ? '14px' : '13px', borderRadius: 4, border: 'none', background: T.ink, color: T.bg, fontSize: isDesktop ? 15 : 14, fontWeight: 600, cursor: 'pointer', fontFamily: T.sans, minHeight: 48, transition: 'all 0.2s'},
    sageCta: {width: '100%', padding: isDesktop ? '14px' : '13px', borderRadius: 4, border: 'none', background: 'rgba(82,112,96,0.85)', color: '#fff', fontSize: isDesktop ? 15 : 14, fontWeight: 600, cursor: 'pointer', fontFamily: T.sans, minHeight: 48},
  };

  const leftPanel = (
    <div>
      <div style={{fontFamily:T.sans, fontSize:11, fontWeight:600, color:T.gold, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:12}}>The Edit · Rehearsal</div>
      <h2 style={{fontFamily:T.serif, fontSize:isDesktop?40:28, fontWeight:600, color:T2.text, lineHeight:1.1, margin:'0 0 16px'}}>
        Say it once.<br/>Say it short.<br/>Stop.
      </h2>
      <p style={{fontFamily:T.sans, fontSize:isDesktop?15:14, color:T2.text3, lineHeight:1.7, fontWeight:400, margin:'0 0 10px'}}>
        Choose one prompt below and speak for 45–60 seconds. Challenge yourself to use only short sentences. One idea. Stop. Next idea. Stop. If your message still makes sense without a sentence, leave it out. Great communicators don't trim their sentences. They end them sooner.
      </p>
      <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(138,158,132,0.08)',borderRadius:20,padding:'7px 14px',border:'0.5px solid rgba(138,158,132,0.22)',marginTop:14}}>
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8.5" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5"/>
          <path d="M10 6v4l2.5 2" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:'rgba(138,158,132,0.8)',letterSpacing:'0.05em'}}>1 min warm-up</span>
      </div>
    </div>
  );

  const grid = (right) => (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      {leftPanel}
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>{right}</div>
    </div>
  );

  // ── SELECT ──────────────────────────────────────────────────────────────────
  if (phase === 'select') return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
      {leftPanel}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
        {EDIT_TOPICS.map(t => {
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
        Start The Edit →
      </button>
    </div>
  );

  // ── PAUSE MOMENT ────────────────────────────────────────────────────────────
  if (phase === 'pause') return grid(<>
    <div style={{...cs.card, textAlign: 'center', padding: isDesktop ? '40px 32px' : '28px 22px'}}>
      <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: 'rgba(138,158,132,0.55)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 20}}>Your Message</div>
      <p style={{fontFamily: T.serif, fontSize: isDesktop ? 20 : 17, color: T2.text, lineHeight: 1.45, margin: '0 0 32px', fontWeight: 500}}>"{topic.label}"</p>
      <div style={{marginBottom: 20}}>
        <SequentialDots dotCount={dotCount} />
      </div>
      <p style={{fontFamily: T.sans, fontSize: 12, color: T2.text4, margin: 0, letterSpacing: '0.05em'}}>
        Speak naturally. We'll handle the rest.
      </p>
    </div>
    <button
      onClick={() => { doStart1(); setPhase('rec1'); }}
      disabled={dotCount < 3}
      style={{...cs.cta, opacity: dotCount < 3 ? 0.3 : 1, cursor: dotCount < 3 ? 'default' : 'pointer'}}>
      Start Speaking →
    </button>
    <p style={{fontFamily: T.sans, fontSize: 10, color: 'rgba(138,158,132,0.4)', textAlign: 'center', margin: 0, letterSpacing: '0.18em', textTransform: 'uppercase'}}>
      Pause · Breathe · Speak
    </p>
  </>);

  // ── REC 1 ───────────────────────────────────────────────────────────────────
  if (phase === 'rec1') return grid(<>
    <div style={cs.card}>
      <div style={cs.label}>Message</div>
      <p style={{fontFamily: T.serif, fontSize: isDesktop ? 18 : 16, color: T2.text, lineHeight: 1.4, margin: '0 0 22px'}}>{topic.label}</p>
      <div style={{display: 'flex', alignItems: 'center', gap: 2, height: 44, marginBottom: 14}}>
        {waveVals.map((v, i) => (
          <div key={i} style={{flex: 1, height: Math.round(v * 38) + 'px', background: `rgba(138,158,132,${0.3 + v * 0.5})`, borderRadius: 2, transition: 'height 0.15s'}} />
        ))}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <div style={{width: 7, height: 7, borderRadius: '50%', background: '#c0392b'}} />
        <span style={{fontFamily: T.sans, fontSize: 11, color: T2.text3, letterSpacing: '0.05em'}}>Recording — speak naturally</span>
      </div>
    </div>
    <p style={{fontFamily: T.sans, fontSize: 11, color: T2.text4, textAlign: 'center', margin: 0}}>
      The coach will interrupt when it's time.
    </p>
  </>);

  // ── INTERRUPT ───────────────────────────────────────────────────────────────
  if (phase === 'interrupt') return grid(<>
    <div style={{padding: isDesktop ? '32px 0' : '24px 0'}}>
      {/* The film-cut divider */}
      <div style={{height: 1.5, background: T.gold, width: dividerFull ? '100%' : '0%', transition: 'width 0.6s ease', marginBottom: 36, borderRadius: 1}} />
      {/* Interrupt text */}
      <div style={{opacity: interruptTextVisible ? 1 : 0, transition: 'opacity 0.5s ease', textAlign: 'center', padding: '0 8px'}}>
        <p style={{fontFamily: T.serif, fontSize: isDesktop ? 38 : 28, fontWeight: 600, color: T2.text, lineHeight: 1.3, margin: '0 0 6px'}}>Stop.</p>
        <p style={{fontFamily: T.serif, fontSize: isDesktop ? 28 : 22, color: T2.text, lineHeight: 1.3, margin: '0 0 6px', fontWeight: 400}}>Now say it again.</p>
        <p style={{fontFamily: T.serif, fontSize: isDesktop ? 28 : 22, color: T2.text, lineHeight: 1.3, margin: '0 0 28px', fontWeight: 400}}>Half the words.</p>
        <p style={{fontFamily: T.sans, fontSize: 12, color: T2.text4, margin: '0 0 32px', letterSpacing: '0.05em'}}>
          Same message. Fewer words. Go.
        </p>
        <button
          onClick={() => { doStart2(); setPhase('rec2'); }}
          style={{...cs.cta, opacity: interruptTextVisible ? 1 : 0}}>
          Try Again →
        </button>
      </div>
    </div>
  </>);

  // ── REC 2 ───────────────────────────────────────────────────────────────────
  if (phase === 'rec2') return grid(<>
    <div style={cs.card}>
      <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: 'rgba(138,158,132,0.55)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12}}>Take 2 — Half the words</div>
      <p style={{fontFamily: T.serif, fontSize: isDesktop ? 18 : 16, color: T2.text, lineHeight: 1.4, margin: '0 0 22px'}}>{topic.label}</p>
      <div style={{display: 'flex', alignItems: 'center', gap: 2, height: 44, marginBottom: 14}}>
        {waveVals.map((v, i) => (
          <div key={i} style={{flex: 1, height: Math.round(v * 38) + 'px', background: `rgba(138,158,132,${0.3 + v * 0.5})`, borderRadius: 2, transition: 'height 0.15s'}} />
        ))}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <div style={{width: 7, height: 7, borderRadius: '50%', background: '#c0392b'}} />
        <span style={{fontFamily: T.sans, fontSize: 11, color: T2.text3, letterSpacing: '0.05em'}}>Recording — same message, fewer words</span>
      </div>
    </div>
    <button onClick={doStop2}
      style={{...cs.cta, background: 'rgba(138,158,132,0.12)', color: T2.text, border: '0.5px solid rgba(138,158,132,0.3)'}}>
      Submit →
    </button>
  </>);

  // ── COACH ───────────────────────────────────────────────────────────────────
  if (phase === 'coach') {
    if (!coachResult) return grid(
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 16}}>
        <div style={{width: 32, height: 32, border: '2px solid rgba(138,158,132,0.15)', borderTop: '2px solid rgba(138,158,132,0.65)', borderRadius: '50%'}} />
        <p style={{fontFamily: T.sans, fontSize: 12, color: T2.text4, margin: 0}}>Reading the edit…</p>
      </div>
    );
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        {/* Verdict panel */}
        <div style={{background: '#0A0804', borderRadius: 8, padding: isDesktop ? '32px 36px' : '24px 22px', border: '0.5px solid rgba(138,158,132,0.15)'}}>
          <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 16}}>Your AmplifyU Coach Says</div>
          <p style={{fontFamily: T.serif, fontSize: isDesktop ? 22 : 18, color: 'rgba(245,239,230,0.92)', lineHeight: 1.4, margin: '0 0 14px'}}>{coachResult.coachLine}</p>
          <p style={{fontFamily: T.serif, fontSize: isDesktop ? 16 : 14, color: 'rgba(138,158,132,0.8)', lineHeight: 1.55, margin: '0 0 10px', fontStyle: 'italic'}}>{coachResult.bridgeLine}</p>
          {coachResult.spokesFaster && (
            <p style={{fontFamily: T.sans, fontSize: 12, color: T2.text4, margin: 0, letterSpacing: '0.03em'}}>
              In Breaking News — speed is the trap. Cutting is the skill.
            </p>
          )}
        </div>
        <p style={{fontFamily: T.sans, fontSize: 12, color: 'rgba(138,158,132,0.45)', textAlign: 'center', margin: 0, letterSpacing: '0.05em'}}>
          Ready for Breaking News?
        </p>
        <button onClick={() => { if (onSimulation) onSimulation(); }} style={cs.sageCta}>
          Enter Breaking News →
        </button>
        <button onClick={() => { setPhase('select'); setTopic(null); setCoachResult(null); setTranscript1(''); setTranscript2(''); }}
          style={{width: '100%', padding: '11px', borderRadius: 4, border: '0.5px solid ' + T2.border, background: 'transparent', color: T2.text3, fontSize: 13, fontWeight: 400, cursor: 'pointer', fontFamily: T.sans, minHeight: 44}}>
          Try Another Message
        </button>
      </div>
    );
  }

  return null;
}

// ─── D4 Simulation Widget — Breaking News Live ───────────────────────────────
export function D4SimWidget({T, T2, isDesktop}) {
  const STORIES = [
    {cat:"💼 Business", items:["Four-Day Work Week Announced Nationwide","Major Cyber Attack Takes Down Global Tech Giant"]},
    {cat:"🔬 Science", items:["Scientists Confirm Evidence of Life on Mars","Asteroid Narrowly Misses Earth"]},
    {cat:"🎲 Wild Card", items:["Loch Ness Monster Spotted in Scotland","Penguins Escape Zoo in Real-Life Madagascar Chase"]},
  ];

  const [phase, setPhase] = useState('intro');
  const [story, setStory] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRec, setIsRec] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [fallback, setFallback] = useState('');
  const [producerMsg, setProducerMsg] = useState(null);
  const [waveVals, setWaveVals] = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);
  const [audioURL, setAudioURL] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [userPoints, setUserPoints] = useState(['','','']);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pointsSubmitted, setPointsSubmitted] = useState(false);
  const [round1, setRound1] = useState(null);

  const audioRef = useRef(null);
  const recRef = useRef(null);
  const mediaRecRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const liveRef = useRef('');
  const waveRef = useRef(null);
  const SpeechRec = typeof window!=='undefined'&&(window.SpeechRecognition||window.webkitSpeechRecognition);

  const PRODUCER_MSGS = [
    {at:30, msg:"Thirty seconds left. Cut the detail. Give us the key points."},
    {at:45, msg:"Fifteen seconds left. Wrap up the story. What do people need to remember?"},
    {at:55, msg:"Five seconds. One headline. Go."},
  ];

  useEffect(()=>{
    if(!isRec){clearTimeout(timerRef.current);clearInterval(waveRef.current);return;}
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{if(t<=1){doStop();return 0;}return t-1;});
      setTimeElapsed(e=>{
        const next=e+1;
        const pm=PRODUCER_MSGS.find(m=>m.at===next);
        if(pm) setProducerMsg(pm.msg);
        return next;
      });
    },1000);
    waveRef.current=setInterval(()=>setWaveVals(()=>Array.from({length:9},()=>0.2+Math.random()*0.8)),150);
    return ()=>{clearInterval(timerRef.current);clearInterval(waveRef.current);};
  },[isRec]);

  useEffect(()=>{
    if(!playing)return;
    let id;
    function tick(){const a=audioRef.current;if(a&&a.duration)setAudioProgress(a.currentTime/a.duration);id=requestAnimationFrame(tick);}
    id=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(id);
  },[playing]);

  function doStart(){
    setIsRec(true);setProducerMsg(null);liveRef.current='';setTranscript('');setAudioURL(null);setTimeElapsed(0);setTimeLeft(60);
    if(SpeechRec){
      const rec=new SpeechRec();rec.continuous=true;rec.interimResults=true;rec.lang='en-US';
      rec.onresult=(e)=>{let t='';for(let i=0;i<e.results.length;i++)if(e.results[i].isFinal)t+=e.results[i][0].transcript+' ';liveRef.current=t;setTranscript(t);};
      try{rec.start();}catch(err){}
      recRef.current=rec;
    }
    if(navigator.mediaDevices?.getUserMedia){
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        const mr=new MediaRecorder(stream);
        audioChunksRef.current=[];
        mr.ondataavailable=e=>audioChunksRef.current.push(e.data);
        mr.onstop=()=>{const blob=new Blob(audioChunksRef.current,{type:'audio/webm'});setAudioURL(URL.createObjectURL(blob));stream.getTracks().forEach(t=>t.stop());};
        mr.start();mediaRecRef.current=mr;
      }).catch(()=>{});
    }
  }

  function doStop(){
    setIsRec(false);
    if(recRef.current){try{recRef.current.stop();}catch(e){}}
    if(mediaRecRef.current&&mediaRecRef.current.state!=='inactive'){try{mediaRecRef.current.stop();}catch(e){}}
    const text=SpeechRec?liveRef.current:fallback;
    analyzeReport(text||fallback);
  }

  async function analyzeReport(text){
    setAnalyzing(true);
    const isRetry=!!round1;
    const base=isRetry?8:0;
    const mock={
      factsReported:["Story confirmed","Key detail 1","Key detail 2","Supporting context","Background info","Expert quote","Impact statement","Follow-up note"],
      remembered:["Story confirmed","Key detail 1","Supporting context"],
      forgotten:["Background info","Expert quote","Impact statement","Follow-up note"],
      headline:`Breaking: ${story}.`,
      retentionScore:Math.floor(Math.random()*20)+42+base,
      compressionScore:Math.floor(Math.random()*20)+55+base,
      cognitiveLoadScore:Math.floor(Math.random()*20)+50+base,
      headlineScore:Math.floor(Math.random()*20)+60+base,
      coachNote:"Your report covered a lot of ground. The strongest communicators lead with the most important fact and build from there. Try opening with your headline sentence next time — then support it."
    };
    if(!text||text.trim().length<20){
      if(!isRetry)setRound1(mock); setResult(mock); setAnalyzing(false); setPhase('recall'); return;
    }
    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:700,messages:[{role:"user",content:`You are an AI audience member watching a breaking news report about: "${story}". The reporter's transcript: "${text}". Simulate what a typical viewer would remember vs forget, and score the communication quality. Return ONLY valid JSON:\n{"factsReported":["list every distinct fact or point they mentioned, up to 8 items"],"remembered":["list 3-5 things an average viewer would remember — favour vivid, concrete, emotional facts"],"forgotten":["list 2-4 facts that would likely be forgotten due to cognitive overload or poor prioritisation"],"headline":"<the single most memorable sentence that captures the story — max 12 words>","retentionScore":<0-100: percentage of facts audience retained>,"compressionScore":<0-100: how effectively they simplified as time reduced — 100 = perfect compression>,"cognitiveLoadScore":<0-100: 100 = very easy to follow, 0 = overwhelming>,"headlineScore":<0-100: could story be reduced to one memorable sentence?>,"coachNote":"<2-3 sentences of warm, encouraging, professional coaching — open with something specific they did well, then offer one clear forward-looking observation about short sentences or adapting under pressure. Never criticise, never use 'but' to negate the positive, never use deficit language. Growth-framed, motivational, executive coach tone.>"}`}]})});
      const d=await res.json();
      const raw=(d.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      const parsed=JSON.parse(m[0]);
      if(!isRetry)setRound1(parsed); setResult(parsed);
    }catch{if(!isRetry)setRound1(mock); setResult(mock);}
    setAnalyzing(false); setPhase('recall');
  }

  function reset(){setPhase('intro');setStory(null);setTimeLeft(60);setTimeElapsed(0);setIsRec(false);setTranscript('');setFallback('');setProducerMsg(null);setResult(null);setRound1(null);setUserPoints(['','','']);setPointsSubmitted(false);setAudioURL(null);}

  function getAudio(){
    if(!audioRef.current&&audioURL){
      audioRef.current=new Audio(audioURL);
      audioRef.current.addEventListener('ended',()=>{setPlaying(false);setAudioProgress(0);});
    }
    return audioRef.current;
  }
  function togglePlay(){
    if(!audioURL){setPlaying(p=>!p);return;}
    const a=getAudio();if(!a)return;
    if(playing){a.pause();setPlaying(false);}
    else{a.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false));}
  }
  function seekTo(pos){
    const a=getAudio();if(!a)return;
    a.currentTime=pos*(a.duration||0);
    if(!playing)a.play().then(()=>setPlaying(true)).catch(()=>{});
  }

  const cs={
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
    ghost:{width:"100%",padding:"11px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44},
  };

  // ── INTRO ────────────────────────────────────────────────────────────────────
  if(phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>How It Works</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>A 60-second live news broadcast.</h2>
        <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
          {[
            {n:1,label:"Choose a story",icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="12" rx="2" stroke={T.gold} strokeWidth="1.3"/><path d="M7 5v12M3 9h16" stroke={T.gold} strokeWidth="1.3"/></svg>},
            {n:2,label:"Go live",icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={T.gold} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:3,label:"Producer cuts",icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke={T.gold} strokeWidth="1.3"/><path d="M11 7v4l3 3" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:4,label:"Audience recall",icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M11 3C7 3 3.5 6 3.5 10c0 2.5 1.3 4.7 3.3 6l-1 3 3.2-1.2C10 18 10.5 18 11 18c4 0 7.5-3.6 7.5-8S15 3 11 3z" stroke={T.gold} strokeWidth="1.3"/></svg>},
            {n:5,label:"Miller's Law",icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4H17l-3.5 2.5 1.5 4L11 11l-4 2.5 1.5-4L5 7h4.5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?44:34,height:isDesktop?44:34,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:5}}>{s.icon}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?9:8,fontWeight:700,color:T.gold,marginBottom:2}}>{s.n}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?12:9,color:T2.text2,textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?76:52}}>{s.label}</div>
              </div>
              {i<4&&<div style={{height:1,width:isDesktop?12:5,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:26}}/>}
            </div>
          ))}
        </div>
      </div>
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"16px 18px"}}>
        <div style={cs.label}>The Challenge</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,marginBottom:10}}>You are a live news reporter. Report a breaking story to the nation — but as airtime shrinks, your sentences must get shorter and your message must get clearer.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,margin:0}}>At 30 seconds, your producer will interrupt. At 15 seconds. At 5 seconds. Each time, you must compress further. Then the AI becomes your audience — and reveals what it actually remembered.</p>
      </div>
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"16px 18px",background:"rgba(138,158,132,0.04)"}}>
        <div style={cs.label}>Your Broadcast Analyst</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,marginBottom:10}}>After your broadcast, your AI broadcast analyst scores your Retention, Compression, Cognitive Load, and Headline quality — and reveals the gap between what you said and what your audience remembered.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0,fontStyle:"italic"}}>That gap is Miller's Law in action.</p>
      </div>
      <button onClick={()=>setPhase('choose')} style={cs.cta}>Choose Your Breaking Story →</button>
    </div>
  );

  // ── CHOOSE STORY ─────────────────────────────────────────────────────────────
  if(phase==='choose') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Breaking News</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,marginBottom:16}}>Choose your story. You have 60 seconds to report it live to the nation.</p>
        {STORIES.map((cat,ci)=>(
          <div key={ci} style={{marginBottom:ci<STORIES.length-1?16:0}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>{cat.cat.replace(/^[^\s]+\s/,'')}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {cat.items.map((item,ii)=>(
                <button key={ii} onClick={()=>{setStory(item);setPhase('recording');}}
                  style={{padding:"14px 16px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:isDesktop?14:13,fontFamily:T.sans,textAlign:"left",cursor:"pointer",lineHeight:1.5,transition:"all 0.2s"}}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={()=>setPhase('intro')} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
    </div>
  );

  // ── RECORDING ────────────────────────────────────────────────────────────────
  if(phase==='recording') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"20px 24px":"16px 18px",border:"0.5px solid rgba(138,158,132,0.15)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:isRec?"#CC4444":"rgba(180,80,60,0.4)",animation:isRec?"glowPulse 1s ease infinite":"none"}}/>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(245,239,230,0.6)",textTransform:"uppercase",letterSpacing:"2px"}}>{isRec?"On Air":"Ready"}</div>
          {isRec&&<div style={{marginLeft:"auto",fontFamily:T.serif,fontSize:isDesktop?28:22,fontWeight:600,color:timeLeft<=10?"#CC4444":T.gold,lineHeight:1}}>{timeLeft}s</div>}
        </div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontWeight:600,color:"#F5EFE6",lineHeight:1.3,margin:"0 0 8px"}}>🔴 BREAKING: {story}</p>
        {producerMsg && (
          <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,marginTop:10}}>
            <div style={{fontFamily:T.sans,fontSize:9,color:"#C8A46A",textTransform:"uppercase",letterSpacing:"2px",marginBottom:4}}>🎧 Producer</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:"#C8A46A",lineHeight:1.4,margin:0}}>{producerMsg}</p>
          </div>
        )}
        {isRec&&(
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:3,height:28,marginTop:12}}>
            {waveVals.map((v,i)=><div key={i} style={{width:3,borderRadius:2,background:"rgba(138,158,132,0.7)",height:Math.max(3,v*26),transition:"height 0.15s ease"}}/>)}
          </div>
        )}
      </div>
      {!isRec&&!SpeechRec&&(
        <div style={cs.card}>
          <div style={cs.label}>Type your report</div>
          <textarea value={fallback} onChange={e=>setFallback(e.target.value)} placeholder="Write your live report here…" style={{width:"100%",minHeight:100,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.border,padding:"8px 0",fontFamily:T.sans,fontSize:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
        </div>
      )}
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        {!isRec?(
          <button onClick={doStart} style={{...cs.cta,maxWidth:280}}>🎙 Go Live →</button>
        ):(
          <button onClick={doStop} style={{...cs.cta,maxWidth:280,background:"#8A4A3A"}}>◼ End Broadcast & Analyse →</button>
        )}
      </div>
      {!isRec&&<button onClick={()=>setPhase('choose')} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Choose different story</button>}
    </div>
  );

  // ── ANALYZING ────────────────────────────────────────────────────────────────
  if(analyzing) return (
    <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:"48px 24px",textAlign:"center"}}>
      <div style={{display:"flex",gap:6}}>
        {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.4s ease ${i*0.22}s infinite`}}/>)}
      </div>
      <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,color:T2.text,lineHeight:1.5,margin:0}}>The audience is processing your report…</p>
      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,margin:0}}>Measuring retention, compression, cognitive load.</p>
    </div>
  );

  // ── RECALL ───────────────────────────────────────────────────────────────────
  if(phase==='recall'&&result) {
    const totalFacts=(result.factsReported||[]).length;
    const remembered=(result.remembered||[]).length;
    const forgotten=(result.forgotten||[]);
    const retainPct=result.retentionScore||Math.round((remembered/Math.max(totalFacts,1))*100);
    const scoreColor=s=>s>=75?T.gold:s>=55?"#7A9E84":"rgba(180,80,60,0.8)";

    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
        <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"28px 32px":"22px 20px",border:"0.5px solid rgba(138,158,132,0.15)"}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(138,158,132,0.7)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>Broadcast Results</div>
          <div style={{display:"flex",gap:isDesktop?24:16,alignItems:"flex-start",marginBottom:20,flexWrap:"wrap"}}>
            {[
              {label:"Retention",val:result.retentionScore,tip:"Facts audience remembered"},
              {label:"Compression",val:result.compressionScore,tip:"Simplified under pressure"},
              {label:"Cognitive Load",val:result.cognitiveLoadScore,tip:"Ease of following"},
              {label:"Headline",val:result.headlineScore,tip:"One-sentence clarity"},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center",flex:"1 1 80px"}}>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?38:30,fontWeight:600,color:scoreColor(s.val),lineHeight:1}}>{s.val}</div>
                <div style={{fontFamily:T.sans,fontSize:10,color:"rgba(245,239,230,0.55)",marginTop:3}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button onClick={togglePlay} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",background:"rgba(245,239,230,0.08)",border:"0.5px solid rgba(245,239,230,0.2)",borderRadius:4,color:"#F5EFE6",fontFamily:T.serif,fontSize:12,cursor:"pointer",flexShrink:0}}>
              {playing?<svg width="10" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="3" height="10" fill="#F5EFE6" rx="1"/><rect x="8" y="1" width="3" height="10" fill="#F5EFE6" rx="1"/></svg>:<svg width="10" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 1l9 5-9 5V1z" fill="#F5EFE6"/></svg>}
              {playing?"Pause":"Play broadcast"}
            </button>
            <div style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.4)"}}>You reported {totalFacts} facts. Audience retained {remembered}.</div>
          </div>
          {audioURL&&(
            <div style={{marginTop:10}}>
              <div
                onClick={(e)=>{const r=e.currentTarget.getBoundingClientRect();seekTo((e.clientX-r.left)/r.width);}}
                style={{width:"100%",height:4,background:"rgba(245,239,230,0.1)",borderRadius:2,position:"relative",cursor:"pointer",marginBottom:4}}>
                <div style={{position:"absolute",left:0,top:0,height:"100%",width:(audioProgress*100)+"%",background:"rgba(138,158,132,0.65)",borderRadius:2}}/>
                <div style={{position:"absolute",top:"50%",left:(audioProgress*100)+"%",transform:"translate(-50%,-50%)",width:12,height:12,borderRadius:"50%",background:"rgba(245,239,230,0.95)",boxShadow:"0 1px 4px rgba(0,0,0,0.3)",zIndex:3,transition:"left 0.1s"}}/>
              </div>
              <div style={{fontFamily:"var(--sans,'Inter',sans-serif)",fontSize:9,color:"rgba(245,239,230,0.3)",textAlign:"right"}}>{Math.floor(audioProgress*60/60)}:{String(Math.round(audioProgress*60)%60).padStart(2,'0')} / 1:00</div>
            </div>
          )}
          {audioURL&&<audio ref={audioRef} src={audioURL} onEnded={()=>setPlaying(false)} style={{display:"none"}}/>}
        </div>

        <div style={cs.card}>
          <div style={cs.label}>🧠 Viewer Memory Test</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,marginBottom:14,lineHeight:1.5}}>Here's what the AI audience remembered from your report:</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
            {(result.remembered||[]).map((pt,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",background:"rgba(82,112,96,0.06)",borderRadius:4,border:"0.5px solid rgba(82,112,96,0.2)"}}>
                <span style={{color:"#527060",flexShrink:0,fontWeight:700}}>✓</span>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.5}}>{pt}</span>
              </div>
            ))}
          </div>
          {forgotten.length>0&&(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {forgotten.map((pt,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",background:"rgba(180,80,60,0.04)",borderRadius:4,border:"0.5px solid rgba(180,80,60,0.15)"}}>
                  <span style={{color:"rgba(180,80,60,0.7)",flexShrink:0,fontWeight:700}}>✗</span>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.5,textDecoration:"line-through"}}>{pt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {result.headline&&(
          <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
            <div style={cs.label}>Your story in one sentence</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,lineHeight:1.3,margin:0}}>"{result.headline}"</p>
          </div>
        )}

        {!pointsSubmitted?(
          <div style={cs.card}>
            <div style={cs.label}>What were your 3 key points?</div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5,marginBottom:14}}>Write the 3 facts you intended your audience to remember. Then compare with what the AI actually retained.</p>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
              {userPoints.map((pt,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"0.5px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold}}>{i+1}</span>
                  </div>
                  <input value={pt} onChange={e=>{const n=[...userPoints];n[i]=e.target.value;setUserPoints(n);}} placeholder={`Key point ${i+1}…`} style={{flex:1,padding:"10px 12px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,outline:"none"}}/>
                </div>
              ))}
            </div>
            <button onClick={()=>setPointsSubmitted(true)} disabled={userPoints.filter(p=>p.trim()).length<1} style={{...cs.cta,background:userPoints.filter(p=>p.trim()).length<1?"rgba(44,36,22,0.25)":T.ink,cursor:userPoints.filter(p=>p.trim()).length<1?"not-allowed":"pointer"}}>Compare with Audience →</button>
          </div>
        ):(
          <div style={cs.card}>
            <div style={cs.label}>You vs the Audience</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>You intended</div>
                {userPoints.filter(p=>p.trim()).map((pt,i)=>(
                  <div key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5,marginBottom:6}}>· {pt}</div>
                ))}
              </div>
              <div>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"#527060",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Audience remembered</div>
                {(result.remembered||[]).map((pt,i)=>(
                  <div key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5,marginBottom:6}}>· {pt}</div>
                ))}
              </div>
            </div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:"italic",color:T2.text3,margin:0,lineHeight:1.5}}>The audience remembered different things than you intended. This is the gap that Miller's Law explains.</p>
          </div>
        )}

        <div style={{...cs.card,padding:isDesktop?"22px 28px":"18px 20px"}}>
          <div style={cs.label}>Your AmplifyU Coach Says</div>
          <div style={{display:"flex",gap:isDesktop?18:12,alignItems:"flex-start"}}>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?44:34,color:T.gold,lineHeight:0.8,flexShrink:0,marginTop:4,opacity:0.5}}>"</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:T2.text,lineHeight:1.7,margin:0,flex:1}}>{result.coachNote}</p>
          </div>
        </div>

        <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"22px 28px":"18px 20px",border:"0.5px solid rgba(138,158,132,0.15)"}}>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:"rgba(245,239,230,0.7)",lineHeight:1.6,margin:"0 0 8px"}}>The strongest communicators know that attention is limited. If people can't remember it, they can't repeat it. And if they can't repeat it, the message is lost.</p>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:700,color:T.gold,margin:0,textTransform:"uppercase",letterSpacing:"1.5px"}}>That is Miller's Law in action.</p>
        </div>

      </div>
    );
  }

  return null;
}

// ─── D1 Mobile helpers ────────────────────────────────────────────────────────
