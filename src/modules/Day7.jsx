import { useState, useEffect, useRef } from 'react';
import { VoiceRecorder } from './VoiceRecorder.jsx';
import { useSequentialDots, SequentialDots } from './SequentialDots.jsx';
import { detectPitchHz, computeSignalMetrics } from './voiceSignal.js';

function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// ─── Radar Chart ──────────────────────────────────────────────────────────────
function RadarChart({ scores, gold, size = 200 }) {
  const keys   = ['clarity','voiceControl','pauses','precision','structure','composure'];
  const labels = ['Clarity','Voice Control','Pauses','Precision','Structure','Composure'];
  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.32;
  const n = keys.length;
  const ang = (i) => (i * 2 * Math.PI / n) - Math.PI / 2;
  const pt  = (i, r) => ({ x: cx + r * Math.cos(ang(i)), y: cy + r * Math.sin(ang(i)) });

  const gridPts = [0.33, 0.66, 1].map(f => {
    const r = maxR * f;
    return keys.map((_,i) => `${pt(i,r).x.toFixed(1)},${pt(i,r).y.toFixed(1)}`).join(' ');
  });

  const scorePts = keys.map((k,i) => {
    const r = maxR * ((scores[k] || 0) / 10);
    return `${pt(i,r).x.toFixed(1)},${pt(i,r).y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width={size} height={size} style={{overflow:'visible',flexShrink:0}}>
      {gridPts.map((pts,li)=>(
        <polygon key={li} points={pts} fill="none" stroke="rgba(138,158,132,0.15)" strokeWidth="0.5"/>
      ))}
      {keys.map((_,i)=>{const o=pt(i,maxR);return(
        <line key={i} x1={cx} y1={cy} x2={o.x.toFixed(1)} y2={o.y.toFixed(1)} stroke="rgba(138,158,132,0.12)" strokeWidth="0.5"/>
      );})}
      <polygon points={scorePts} fill="rgba(138,158,132,0.18)" stroke={gold} strokeWidth="1.5" strokeLinejoin="round"/>
      {keys.map((k,i)=>{
        const r=maxR*((scores[k]||0)/10); const p=pt(i,r);
        return <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill={gold}/>;
      })}
      {labels.map((label,i)=>{
        const p=pt(i, maxR+22);
        const parts=label.split(' ');
        return parts.length===1
          ? <text key={i} x={p.x.toFixed(1)} y={p.y.toFixed(1)} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#6B5E44" fontFamily="Inter,sans-serif">{label}</text>
          : <text key={i} textAnchor="middle" fontSize="9" fill="#6B5E44" fontFamily="Inter,sans-serif">
              {parts.map((part,pi)=><tspan key={pi} x={p.x.toFixed(1)} dy={pi===0?-5:11}>{part}</tspan>)}
            </text>;
      })}
    </svg>
  );
}


const SIX_SKILLS = ['Clarity','Pace','Fillers','Short Sentences','Structure','Composure'];

// ─── D7 Practice Widget — The Six ─────────────────────────────────────────────
export function D7PracticeWidget({ T, T2, isDesktop, onSimulation, onNavLabel, onNavFn }) {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'ready' | 'analyzing' | 'coach'
  const [transcript, setTranscript] = useState('');
  const [coachResult, setCoachResult] = useState(null);
  const dotCount = useSequentialDots(phase === 'analyzing');

  // Wire bottom nav: disabled until the rehearsal recording is complete
  useEffect(() => {
    if (!onNavLabel) return;
    if (phase === 'coach') {
      onNavLabel("Continue");
      if (onNavFn) onNavFn.current = () => onSimulation?.();
    } else {
      onNavLabel(null);
      if (onNavFn) onNavFn.current = null;
    }
  }, [phase]);

  function enterRehearsal() {
    setPhase('ready');
  }

  async function onRecordingDone(text) {
    setTranscript(text);
    setPhase('analyzing');
    await callCoach(text);
  }

  async function callCoach(text) {
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 400,
          system: `You are the AmplifyU coach reviewing a Day 7 rehearsal reflection. The user was asked to think of a real upcoming conversation and speak for 30 seconds about which of this week's six communication skills — Clarity, Pace, Fillers, Short Sentences, Structure, Composure — they will use in it and why. Analyse their transcript for the following. identifiedRealSituation (boolean — true if they named or described a specific real upcoming moment, meeting, conversation, or event rather than speaking generically). identifiedSpecificSkill (boolean — true if they connected at least one specific skill to that situation with a reason). skillsReferenced (array — which of the six skills they mentioned explicitly or implicitly).\n\nreflectionDepth: one of 'specific' (named a real situation and connected a skill to it with a reason), 'partial' (named a situation or a skill but not both with a clear connection), or 'generic' (spoke about skills generally without connecting to a real moment).\n\ncoachLine — this is the ONLY personalised feedback the user sees, so it CANNOT be generic. It must reference the specific skill(s) they named AND the specific situation or reasoning they actually gave — quote a short phrase or closely paraphrase their own words. Never write a sentence vague enough that it could apply to any response (e.g. "Good effort — connect these skills to a real moment" is a FAILURE, not a valid answer). If reflectionDepth is 'specific', name the skill and the real situation they described and affirm why that connection works for them specifically. If 'partial' or 'generic', still reference whatever specific detail they DID mention — however small — as your forward-looking nudge, rather than a fully generic one. If the transcript contains nothing usable at all (empty, silence, off-topic), say so honestly rather than inventing a connection. Warm, growth-framed, never critical. Maximum 30 words.\n\nbridgeLine: always return exactly this text: 'Now explain the whole week to someone who knows nothing about it. That is the real test.' Return only valid JSON.`,
          messages: [{ role: 'user', content: `Transcript: "${text || 'No speech detected.'}"` }]
        })
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || '{}';
      const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || '{}');
      setCoachResult({
        identifiedRealSituation: json.identifiedRealSituation === true,
        identifiedSpecificSkill: json.identifiedSpecificSkill === true,
        coachLine: json.coachLine || 'Good effort — connect these skills to a real moment this week.',
        bridgeLine: json.bridgeLine || 'Now explain the whole week to someone who knows nothing about it. That is the real test.',
      });
    } catch(_) {
      setCoachResult({
        identifiedRealSituation: false,
        identifiedSpecificSkill: false,
        coachLine: 'Good effort — connect these skills to a real moment this week.',
        bridgeLine: 'Now explain the whole week to someone who knows nothing about it. That is the real test.',
      });
    }
    setPhase('coach');
  }

  const chipBase = { fontFamily:T.sans, fontSize:12, fontWeight:600, padding:"8px 14px", borderRadius:20, letterSpacing:"0.3px" };
  const progressBar = (activeIdx) => (
    <div style={{ display:"flex", gap:4 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ height:3, flex:1, borderRadius:2, background:i<=activeIdx?T.gold:T2.border, transition:"background 0.3s" }}/>
      ))}
    </div>
  );

  if (phase === 'intro') return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div>
        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>REHEARSAL · DAY 7</div>
        <h2 style={{ fontFamily:T.serif, fontSize:isDesktop?32:26, fontWeight:600, color:T2.text, lineHeight:1.1, margin:0 }}>The Six</h2>
      </div>
      {progressBar(0)}
      <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(138,158,132,0.08)',borderRadius:20,padding:'7px 14px',border:'0.5px solid rgba(138,158,132,0.22)'}}>
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8.5" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5"/>
          <path d="M10 6v4l2.5 2" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:'rgba(138,158,132,0.8)',letterSpacing:'0.05em'}}>1 min warm-up</span>
      </div>
      <div style={{ background:T2.surface, borderRadius:8, border:"0.5px solid "+T2.border, padding:"22px 24px" }}>
        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:12 }}>Your Challenge</div>
        <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text, lineHeight:1.65, margin:0, fontWeight:400 }}>Think of one real conversation coming up this week — a meeting, a presentation, a difficult discussion. Speak for 30 seconds about which of this week's skills you'll use in it — and why.</p>
      </div>
      <button onClick={enterRehearsal} style={{ width:"100%", padding:"15px", borderRadius:4, border:"none", background:T.ink, color:T.bg, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:50 }}>
        Enter rehearsal →
      </button>
    </div>
  );

  if (phase === 'ready') return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div>
        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>REHEARSAL · DAY 7</div>
        <h2 style={{ fontFamily:T.serif, fontSize:isDesktop?32:26, fontWeight:600, color:T2.text, lineHeight:1.1, margin:0 }}>The Six</h2>
      </div>
      {progressBar(1)}
      <div style={{ background:T2.surface, borderRadius:8, border:"0.5px solid "+T2.border, padding:"22px 24px" }}>
        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:12 }}>Your Challenge</div>
        <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text, lineHeight:1.65, margin:0, fontWeight:400 }}>Think of one real conversation coming up this week — a meeting, a presentation, a difficult discussion. Speak for 30 seconds about which of this week's skills you'll use in it — and why.</p>
      </div>
      <VoiceRecorder T={T} T2={T2} maxSeconds={120} onDone={onRecordingDone}/>
    </div>
  );

  if (phase === 'analyzing') return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:280, gap:20 }}>
      <SequentialDots dotCount={dotCount}/>
      <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text3, margin:0 }}>Analysing your response…</p>
    </div>
  );

  if (phase === 'coach' && coachResult) {
    const { identifiedRealSituation, identifiedSpecificSkill, coachLine, bridgeLine } = coachResult;
    const showConnectionIndicator = identifiedRealSituation && identifiedSpecificSkill;
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>REHEARSAL · DAY 7</div>
          <h2 style={{ fontFamily:T.serif, fontSize:isDesktop?32:26, fontWeight:600, color:T2.text, lineHeight:1.1, margin:0 }}>The Six</h2>
        </div>
        <div style={{ background:"#0E0B08", borderRadius:8, padding:"24px 26px" }}>
          <div style={{ fontFamily:T.sans, fontSize:9, fontWeight:700, color:"rgba(138,158,132,0.6)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:14 }}>Your AmplifyU Coach Says</div>
          <p style={{ fontFamily:T.serif, fontSize:isDesktop?20:18, color:"rgba(245,239,230,0.9)", lineHeight:1.55, margin:0, fontWeight:500 }}>{coachLine}</p>
        </div>
        {showConnectionIndicator && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px" }}>✓ Skill connected to a real moment</span>
          </div>
        )}
        <p style={{ fontFamily:T.serif, fontSize:isDesktop?16:15, fontStyle:"italic", color:T2.text3, lineHeight:1.6, margin:0, textAlign:"center" }}>{bridgeLine}</p>
        <button onClick={() => onSimulation?.()} style={{ width:"100%", padding:"15px", borderRadius:4, border:"none", background:T.ink, color:T.bg, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:50 }}>
          Teach It Forward →
        </button>
      </div>
    );
  }

  return null;
}

// ─── D7 Simulation Widget — Week 1 Master Challenge ───────────────────────────
const D7_SIMULATION_MAX_SEC = 180;
export function D7SimWidget({ T, T2, isDesktop }) {
  const [phase,      setPhase]     = useState('intro');
  const [timeLeft,   setTimeLeft]  = useState(D7_SIMULATION_MAX_SEC);
  const [transcript, setTranscript]= useState('');
  const [fallback,   setFallback]  = useState('');
  const [isRec,      setIsRec]     = useState(false);
  const [result,     setResult]    = useState(null);
  const [waveVals,   setWaveVals]  = useState(Array(14).fill(0.3));
  const [signalMetrics, setSignalMetrics] = useState(null);
  const [expandedSkill, setExpandedSkill] = useState(null);

  const mediaRef  = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef  = useRef(null);
  const waveRef   = useRef(null);
  const [micError, setMicError] = useState(false);
  const dotCount = useSequentialDots(phase === 'analyzing');

  // Real signal data captured from the mic during recording — feeds the
  // Pauses and Voice Control scores directly, the same way Day 2 measures
  // them, instead of asking the AI to guess vocal delivery from a transcript
  // it can't actually hear.
  const startTimeRef = useRef(null);
  const audioAnalyserCtxRef = useRef(null);
  const energySampleIntervalRef = useRef(null);
  const energySamplesRef = useRef([]);
  const pitchSamplesRef = useRef([]);

  // Guards against leaking an AudioContext if the component unmounts mid-recording.
  useEffect(()=>()=>{
    clearInterval(energySampleIntervalRef.current);
    try { audioAnalyserCtxRef.current?.close(); } catch(e) {}
  },[]);

  // Timer
  useEffect(()=>{
    if(!isRec){clearInterval(timerRef.current);return;}
    timerRef.current=setInterval(()=>setTimeLeft(t=>{
      if(t<=1){clearInterval(timerRef.current);return 0;}
      return t-1;
    }),1000);
    return()=>clearInterval(timerRef.current);
  },[isRec]);

  // Auto-submit when timer hits 0
  useEffect(()=>{
    if(timeLeft===0&&phase==='recording') doSubmit();
  },[timeLeft]);

  // Waveform animation
  useEffect(()=>{
    if(!isRec){clearInterval(waveRef.current);return;}
    waveRef.current=setInterval(()=>setWaveVals(Array.from({length:14},()=>0.12+Math.random()*0.88)),110);
    return()=>clearInterval(waveRef.current);
  },[isRec]);

  function startRec(){
    setTranscript('');
    setMicError(false);
    audioChunksRef.current = [];
    if(navigator.mediaDevices?.getUserMedia){
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        let mr;
        try { mr = new MediaRecorder(stream, {mimeType:'audio/webm'}); }
        catch { mr = new MediaRecorder(stream); }
        mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mr.start(1000);
        mediaRef.current=mr;
        startTimeRef.current = Date.now();
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          const actx = new AC();
          audioAnalyserCtxRef.current = actx;
          const srcNode = actx.createMediaStreamSource(stream);
          const analyser = actx.createAnalyser();
          analyser.fftSize = 1024;
          srcNode.connect(analyser);
          const buf = new Float32Array(analyser.fftSize);
          energySamplesRef.current = [];
          pitchSamplesRef.current = [];
          energySampleIntervalRef.current = setInterval(() => {
            analyser.getFloatTimeDomainData(buf);
            let sumSq = 0;
            for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
            energySamplesRef.current.push(Math.sqrt(sumSq / buf.length));
            const hz = detectPitchHz(buf, actx.sampleRate);
            if (hz > 0) pitchSamplesRef.current.push(hz);
          }, 100);
        } catch (sigErr) {
          console.error('[D7Sim] signal analysis setup error:', sigErr);
        }
        setIsRec(true);setTimeLeft(D7_SIMULATION_MAX_SEC);setPhase("recording");
      }).catch(()=>{ setMicError(true); });
    } else {
      setMicError(true);
    }
  }

  function stopRecAndTranscribe(){
    return new Promise(resolve => {
      const mr = mediaRef.current;
      clearInterval(timerRef.current);
      clearInterval(energySampleIntervalRef.current);
      try { audioAnalyserCtxRef.current?.close(); } catch(e) {}
      setIsRec(false);
      if (!mr || mr.state === 'inactive') { resolve(''); return; }
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
          resolve((data.text || '').trim());
        } catch (err) {
          console.error('[D7SimWidget] transcribe error:', err);
          resolve('');
        }
      };
      try { mr.stop(); } catch(e) { resolve(''); }
    });
  }

  // Saves the Week 1 Review result so it can surface on the Review tab's
  // "Your Saved Result" card and in Toolkit's My Saved Work — same
  // au1_toolkits store the other days' widgets already write to.
  function saveWeek1Result(parsed, text) {
    try {
      const existing = JSON.parse(localStorage.getItem('au1_toolkits') || '[]');
      const mine = existing.filter(e => e.source === 'week1-review-day7');
      const others = existing.filter(e => e.source !== 'week1-review-day7');
      const entry = { id: Date.now(), source: 'week1-review-day7', transcript: text || '', result: parsed, timestamp: Date.now() };
      const nextMine = [entry, ...mine].slice(0, 5);
      localStorage.setItem('au1_toolkits', JSON.stringify([...others, ...nextMine]));
    } catch {}
  }

  async function doSubmit(){
    setPhase('analyzing');
    const spokenText = await stopRecAndTranscribe();
    // Captured after the recorder/analyser have fully stopped, so the sample
    // buffers are complete — read before anything can reset them.
    const elapsedSec = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
    const signal = computeSignalMetrics(energySamplesRef.current, pitchSamplesRef.current, elapsedSec);
    setSignalMetrics(signal);
    const text=(spokenText||'').trim()||(fallback||'').trim();
    if(!text){setPhase('brief');return;}
    setTranscript(text);
    let parsed;
    try{
      const res=await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:650,messages:[{role:"user",
          content:`You are an expert communication coach. A learner just completed AmplifyU Week 1 covering: Clarity (Feynman Technique), Voice Control, Filler-Free Pauses, Precision (Miller's Law), Structure (PRE Framework), and Composure Under Pressure.\n\nThey were asked: "You've spent the last week learning communication. What exactly did you learn? Explain it as if teaching someone else."\n\nThis is their transcribed spoken response:\n\n"${text}"\n\nScore each skill 1-10 based on what can be inferred from the text. Return ONLY valid JSON:\n{"scores":{"clarity":<1-10>,"voiceControl":<1-10>,"pauses":<1-10>,"precision":<1-10>,"structure":<1-10>,"composure":<1-10>},"memorable":"<most memorable phrase or sentence from their response, max 12 words>","strongest":"<their strongest demonstrated communication habit, 1 sentence>","growth":"<their single most important growth opportunity, 1 sentence>","coachInsight":"<personalised, warm coaching insight for Week 2, 2-3 sentences>"}`
        }]})
      });
      const d=await res.json();
      const raw=(d.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(m[0]);
    }catch{
      parsed = {
        scores:{clarity:7,voiceControl:6,pauses:6,precision:7,structure:7,composure:8},
        memorable:"Communication is about making ideas easy for others to understand.",
        strongest:"Your explanation showed genuine understanding of the core Week 1 concepts.",
        growth:"Adding deliberate structure — one clear point per idea — would sharpen your impact.",
        coachInsight:"You demonstrated real understanding of Week 1. Your communication feels natural and grounded. As you move into Week 2, focus on building more contrast through deliberate pacing and pauses — that's where good communicators become great ones.",
      };
    }
    // Pauses and Voice Control are about vocal delivery, not word content —
    // the AI can't hear the recording, so replace its guess with the same
    // real signal measurement Day 2 uses whenever the mic actually captured
    // enough audio to measure it from.
    if (signal) {
      if (signal.pausesScore != null) parsed.scores.pauses = Math.max(1, Math.min(10, Math.round(signal.pausesScore / 10)));
      if (signal.pitchScore != null) parsed.scores.voiceControl = Math.max(1, Math.min(10, Math.round(signal.pitchScore / 10)));
    }
    setResult(parsed);
    saveWeek1Result(parsed, text);
    setPhase('results');
  }

  const cs={
    card:{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:isDesktop?"24px 28px":"20px 22px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10},
    cta:{width:"100%",padding:isDesktop?"16px":"14px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?16:15,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:52,transition:"all 0.2s"},
  };
  const scoreColor=s=>s>=8?"#527060":s>=5?T.gold:"#B05C4A";
  const avg=result?Math.round(Object.values(result.scores).reduce((a,b)=>a+b,0)/6):0;

  // One sentence per skill, tailored to the person's own score. Pauses and
  // Voice Control reference the actual measured numbers when the mic
  // captured enough signal; everything else is inferred from what they said,
  // since clarity/precision/structure/composure are about content, not
  // audio delivery.
  function explainSkill(key, score, signal){
    if(key==='pauses' && signal?.pausesPerMin!=null){
      const perMin=signal.pausesPerMin;
      if(perMin<1) return `You paused almost never — about ${perMin.toFixed(1)} deliberate pauses a minute — so your listener had little time to absorb each idea before the next one arrived.`;
      if(perMin<=4) return `You paused around ${perMin.toFixed(1)} times a minute, measured from your actual recording — enough space for your ideas to land without losing momentum.`;
      if(perMin<=7) return `You paused fairly often — about ${perMin.toFixed(1)} times a minute — which is fine, but a few of those breaks could be tightened so your explanation keeps its drive.`;
      return `You paused very frequently — about ${perMin.toFixed(1)} times a minute — enough to break your flow. Aim for fewer, more deliberate pauses rather than frequent small ones.`;
    }
    if(key==='voiceControl' && signal?.pitchScore!=null){
      if(score>=8) return "Measured from your recording: your pitch rose and fell naturally as you spoke, which is what made you sound engaged rather than flat.";
      if(score>=5) return "Measured from your recording: your pitch varied some, but leaned flat in places — raising and lowering it more on your key points would add more contrast.";
      return "Measured from your recording: your pitch stayed largely flat throughout — deliberately varying it on your most important words will make you sound more engaged.";
    }
    const TEXT={
      clarity:{
        high:"Your explanation was easy to follow — ideas landed without needing to be re-read or re-explained.",
        mid:"Your explanation was mostly clear, though a few ideas would land harder if simplified further.",
        low:"Your explanation was hard to follow in places — aim for one idea per sentence, in plain language.",
      },
      precision:{
        high:"You chose your words efficiently — there was little padding around the actual idea.",
        mid:"Some of your sentences carried more words than the idea needed — a tighter edit would sharpen it.",
        low:"Your answer had a lot of padding around the core idea — cut anything that isn't doing work.",
      },
      structure:{
        high:"Your explanation followed a clear order — point, then support — which made it easy to follow.",
        mid:"There was some structure to your answer, but the order of your ideas could be tightened.",
        low:"Your points came in no clear order, which made it harder to follow your logic.",
      },
      composure:{
        high:"You sounded steady and in control throughout, even while explaining live under time pressure.",
        mid:"You sounded mostly composed, with a few moments of hesitation under the pressure of explaining live.",
        low:"There were clear signs of hesitation or rushing — the pressure of explaining live got to you a little.",
      },
      pauses:{
        high:"Your explanation had a good rhythm, based on what your coach could infer from the transcript.",
        mid:"Your explanation could have used a bit more breathing room between ideas.",
        low:"Your explanation read as rushed, with ideas run together rather than given space.",
      },
      voiceControl:{
        high:"Your explanation read as animated and varied, based on what your coach could infer from the transcript.",
        mid:"Your explanation read as fairly even in tone, based on what your coach could infer from the transcript.",
        low:"Your explanation read as flat in tone, based on what your coach could infer from the transcript.",
      },
    };
    const tier = score>=8?'high':score>=5?'mid':'low';
    return TEXT[key]?.[tier] || '';
  }

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if(phase==='intro'||phase==='brief') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
      {/* Header */}
      <div>
        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Simulation · Day 7</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?40:28,fontWeight:600,color:T2.text,lineHeight:1.1,margin:0}}>Week 1 Master Challenge</h2>
      </div>

      {/* HOW IT WORKS — step row */}
      <div style={cs.card}>
        <div style={cs.label}>How It Works</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,color:T2.text,lineHeight:1.3,margin:"0 0 20px"}}>A 4-step end-of-week mastery check.</p>
        <div style={{display:"flex",alignItems:"flex-start"}}>
          {[
            {n:1,label:"Read the\nbrief",icon:<svg width={isDesktop?24:20} height={isDesktop?24:20} viewBox="0 0 22 22" fill="none"><path d="M6 4h10a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z" stroke={T.gold} strokeWidth="1.3"/><path d="M8 8h6M8 11h6M8 14h4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:2,label:"Speak &\nexplain",icon:<svg width={isDesktop?24:20} height={isDesktop?24:20} viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={T.gold} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:3,label:"AI\nanalyses",icon:<svg width={isDesktop?24:20} height={isDesktop?24:20} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke={T.gold} strokeWidth="1.3"/><path d="M11 7v4l3 2" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:4,label:"See your\nresults",icon:<svg width={isDesktop?24:20} height={isDesktop?24:20} viewBox="0 0 22 22" fill="none"><path d="M4 16l4-4 3 3 4-5 3 3" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="3" width="16" height="16" rx="1.5" stroke={T.gold} strokeWidth="1.3"/></svg>},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?52:42,height:isDesktop?52:42,borderRadius:"50%",border:`1.5px solid ${i===0?T.gold:"rgba(138,158,132,0.3)"}`,background:i===0?"rgba(138,158,132,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}>
                  {s.icon}
                </div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?11:9,color:T2.text3,marginBottom:2,textAlign:"center"}}>{s.n}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?12:10,color:T2.text,textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?72:52,whiteSpace:"pre-line"}}>{s.label}</div>
              </div>
              {i<3&&<div style={{height:1,width:isDesktop?12:6,background:"rgba(138,158,132,0.25)",flexShrink:0,marginBottom:40}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* The challenge */}
      <div style={cs.card}>
        <div style={cs.label}>The First Step</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,marginBottom:12,fontWeight:300}}>You've spent the last week learning communication — clarity, pauses, precision, structure, and composure.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,marginBottom:0,fontWeight:300}}>Now explain what you learned as if you were teaching someone else. Not as a student. <span style={{color:T.gold,fontWeight:500}}>As a communicator.</span></p>
      </div>

      {/* AmplifyU coach card */}
      <div style={cs.card}>
        <div style={cs.label}>Your AmplifyU Coach</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,marginBottom:10,fontWeight:300}}>Your AmplifyU coach will evaluate your explanation across all six Week 1 skills: Clarity, Voice Control, Pauses, Precision, Structure, and Composure.</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:"italic",color:T.gold,lineHeight:1.6,margin:0}}>This is not a test — it's a demonstration of everything you've built.</p>
      </div>

      <button onClick={()=>{setIsRec(false);setTimeLeft(D7_SIMULATION_MAX_SEC);setPhase('recording');}}
        style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>
        I'm Ready →
      </button>
    </div>
  );

  // ── RECORDING ─────────────────────────────────────────────────────────────
  if(phase==='recording') {
    // ── Pre-recording: prompt shown, user clicks when ready ──
    if(!isRec) return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
        {/* Prompt — prominent at top */}
        <div style={{...cs.card,borderLeft:"3px solid "+T.gold,padding:isDesktop?"28px 32px":"22px 24px"}}>
          <div style={cs.label}>Your Challenge</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?26:21,fontWeight:600,color:T2.text,lineHeight:1.25,marginBottom:14}}>
            You've spent the last week learning communication. What exactly did you learn?
          </p>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.65,margin:0}}>
            Explain it as if you're teaching someone else.
          </p>
        </div>
        {/* Instruction */}
        <div style={{...cs.card,padding:isDesktop?"20px 24px":"16px 20px"}}>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,margin:"0 0 10px",fontWeight:400}}>
            Now explain what you learned as if you were teaching someone else. Not as a student — <span style={{color:T.gold,fontWeight:500}}>as a communicator.</span>
          </p>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.65,margin:0}}>
            You have {D7_SIMULATION_MAX_SEC} seconds. Click start when you are ready.
          </p>
        </div>
        {/* Text fallback — shown after a microphone failure */}
        {micError&&(
          <div style={cs.card}>
            <div style={cs.label}>Type Your Response</div>
            <textarea value={fallback} onChange={e=>setFallback(e.target.value)} placeholder="Type your explanation here…" style={{width:"100%",borderRadius:3,border:"0.5px solid "+T2.border,padding:"12px 14px",fontSize:14,fontFamily:T.sans,resize:"none",height:120,boxSizing:"border-box",background:T2.bg,color:T2.text,outline:"none",lineHeight:1.6}}/>
          </div>
        )}
        {micError ? (
          <button onClick={doSubmit} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Submit →</button>
        ) : (
          <div style={{display:"flex",justifyContent:"center"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
              <button onClick={startRec} style={{
                width:80,height:80,borderRadius:"50%",border:"none",cursor:"pointer",
                background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 0 0 6px rgba(138,158,132,0.12)",transition:"all 0.2s ease",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill="white"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
              <div style={{fontFamily:T.sans,fontSize:13,color:T2.text3}}>Start Recording</div>
            </div>
          </div>
        )}
        <button onClick={()=>setPhase('intro')} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"6px 0",textAlign:"center",width:"100%"}}>← Back</button>
      </div>
    );

    // ── Active recording ──
    return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      {/* Timer panel */}
      <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"22px 28px":"18px 22px",border:"0.5px solid rgba(138,158,132,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#CC4444",animation:"glowPulse 1s ease infinite"}}/>
            <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(245,239,230,0.5)",textTransform:"uppercase",letterSpacing:"2px"}}>On Air</span>
          </div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?48:38,fontWeight:600,color:timeLeft<=10?"#CC4444":T.gold,lineHeight:1}}>{timeLeft}<span style={{fontFamily:T.sans,fontSize:14,color:"rgba(245,239,230,0.4)"}}>s</span></div>
        </div>
        {/* Progress bar */}
        <div style={{height:2,background:"rgba(245,239,230,0.07)",borderRadius:1,marginBottom:isDesktop?18:14,overflow:"hidden"}}>
          <div style={{height:"100%",width:((D7_SIMULATION_MAX_SEC-timeLeft)/D7_SIMULATION_MAX_SEC*100)+"%",background:timeLeft<=10?"#CC4444":T.gold,borderRadius:1,transition:"width 1s linear"}}/>
        </div>
        {/* Waveform */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,height:isDesktop?44:36,marginBottom:isDesktop?18:14}}>
          {waveVals.map((v,i)=>(
            <div key={i} style={{width:isDesktop?4:3,borderRadius:2,background:T.gold,height:Math.max(3,v*(isDesktop?40:32)),transition:"height 0.1s ease"}}/>
          ))}
        </div>
        {/* Prompt reminder */}
        <p style={{fontFamily:T.serif,fontSize:isDesktop?15:13,fontWeight:500,color:"rgba(245,239,230,0.65)",lineHeight:1.5,margin:0}}>Explain what you learned as if you're teaching someone else.</p>
      </div>
      {/* Coaching chips */}
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        {["Clarity","Structure","Precision","Composure"].map(c=>(
          <div key={c} style={{padding:"5px 14px",borderRadius:20,border:"0.5px solid "+T2.border,fontFamily:T.sans,fontSize:11,color:T2.text3}}>{c}</div>
        ))}
      </div>
      <button onClick={doSubmit} style={cs.cta}>Submit →</button>
    </div>
    );
  }

  // ── ANALYSING ─────────────────────────────────────────────────────────────
  if(phase==='analyzing') return (
    <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:isDesktop?"60px 0":"44px 0"}}>
      <SequentialDots dotCount={dotCount}/>
      <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,margin:"14px 0 4px",textAlign:"center"}}>Your AmplifyU coach is reviewing your response…</p>
      <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text3,margin:0,textAlign:"center",maxWidth:320}}>Evaluating all six Week 1 communication skills.</p>
    </div>
  );

  // ── RESULTS ──────────────────────────────────────────────────────────────
  if(phase==='results'&&result){
    const skills=[
      {key:'clarity',label:'Clarity'},{key:'voiceControl',label:'Voice Control'},
      {key:'pauses',label:'Pauses'},{key:'precision',label:'Precision'},
      {key:'structure',label:'Structure'},{key:'composure',label:'Composure'},
    ];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
        {/* Overall + radar */}
        <div style={{...cs.card,display:"flex",alignItems:"center",gap:isDesktop?24:16,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:120}}>
            <div style={cs.label}>Week 1 Communication Review</div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?64:50,fontWeight:600,color:T2.text,lineHeight:0.85,letterSpacing:"-4px"}}>
              {avg}<span style={{fontSize:isDesktop?24:20,color:T.gold,letterSpacing:"-1px"}}>/10</span>
            </div>
            <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,letterSpacing:"2px",textTransform:"uppercase",marginTop:10}}>Overall Score</div>
          </div>
          <RadarChart scores={result.scores} gold={T.gold} size={isDesktop?180:150}/>
        </div>
        {/* 6 score cards — tap any one for what it means for you */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isDesktop?10:8}}>
          {skills.map(({key,label})=>{
            const s=result.scores[key]||0;
            const isOpen=expandedSkill===key;
            const measured=(key==='pauses'&&signalMetrics?.pausesPerMin!=null)||(key==='voiceControl'&&signalMetrics?.pitchScore!=null);
            return (
              <div key={key} onClick={()=>setExpandedSkill(isOpen?null:key)} style={{background:T2.surface,borderRadius:6,border:"0.5px solid "+(isOpen?T.gold:T2.border),padding:"14px 16px",cursor:"pointer",gridColumn:isOpen?"1 / -1":"auto",transition:"border-color 0.15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?10:9,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px"}}>{label}{measured&&<span style={{color:T.gold}}> · measured</span>}</span>
                  <span style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:scoreColor(s),lineHeight:1}}>{s}<span style={{fontSize:10,color:T2.text3}}>/10</span></span>
                </div>
                <div style={{height:3,background:T2.border,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:(s/10*100)+"%",background:scoreColor(s),borderRadius:2,transition:"width 1s ease"}}/>
                </div>
                {isOpen&&(
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.6,margin:"10px 0 0"}}>{explainSkill(key,s,signalMetrics)}</p>
                )}
              </div>
            );
          })}
        </div>
        {/* Memorable quote */}
        {result.memorable&&(
          <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
            <div style={cs.label}>Most Memorable Takeaway</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?19:17,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"{result.memorable}"</p>
          </div>
        )}
        {/* Strongest + Growth */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isDesktop?10:8}}>
          <div style={{...cs.card,borderTop:"2px solid #527060"}}>
            <div style={{...cs.label,color:"#527060"}}>Your Strongest Habit</div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.65,margin:0,fontWeight:300}}>{result.strongest}</p>
          </div>
          <div style={{...cs.card,borderTop:"2px solid "+T.gold}}>
            <div style={cs.label}>Growth Opportunity</div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.65,margin:0,fontWeight:300}}>{result.growth}</p>
          </div>
        </div>
        {/* Coach insight */}
        {result.coachInsight&&(
          <div style={{background:T2.cardDark,borderRadius:8,padding:isDesktop?"22px 28px":"18px 22px"}}>
            <div style={{...cs.label,color:T.gold}}>Coach Insight</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:"rgba(245,239,230,0.85)",lineHeight:1.7,margin:0}}>{result.coachInsight}</p>
          </div>
        )}
        <button onClick={()=>setPhase('complete')} style={cs.cta}>View Week 1 Summary →</button>
      </div>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────────────────────
  return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
      <div style={{background:T2.cardDark,borderRadius:8,padding:isDesktop?"32px 36px":"24px 28px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:20}}>Week 1 Complete</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:"rgba(245,239,230,0.95)",lineHeight:1.2,marginBottom:18}}>Seven days ago, you were learning communication concepts.</h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:"rgba(245,239,230,0.55)",lineHeight:1.75,marginBottom:14,fontWeight:300}}>Today, you taught them in your own words.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:"rgba(245,239,230,0.55)",lineHeight:1.75,marginBottom:24,fontWeight:300}}>That's the difference between consuming information and understanding it.</p>
        <div style={{height:"0.5px",background:"rgba(245,239,230,0.08)",marginBottom:22}}/>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.4)",lineHeight:1.7,marginBottom:6,fontWeight:300}}>Communication isn't a talent. It's a skill.</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontStyle:"italic",color:T.gold,lineHeight:1.5,margin:0}}>And this week, you've started building it.</p>
      </div>
      <button onClick={()=>setPhase('intro')} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"8px 0",textAlign:"center",width:"100%"}}>
        Review Again
      </button>
    </div>
  );
}
