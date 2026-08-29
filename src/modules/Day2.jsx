import { useState, useRef, useEffect } from 'react';
import { T } from '../theme.js';
import { useWakeLock, localStorageUsageRatio } from '../utils.js';
import { useSequentialDots, SequentialDots } from './SequentialDots.jsx';

function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

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

export function D2PracticeWidget({T, T2, isDesktop}) {
  const EXERCISES=[
    {id:"sentence",title:"Same Sentence Challenge",sentence:'"That\'s an interesting idea."',
     instruction:"Say it three ways. Same words. Completely different meaning.",
     modes:["Excited","Sarcastic","Sceptical"],
     lesson:"Same words ≠ same meaning. Your voice creates the reality."},
    {id:"pace",title:"Pace Drill",sentence:'"I believe this is the right decision."',
     instruction:"Vary only your speed. Notice how confidence changes.",
     modes:["Too fast","Too slow","Ideal executive pace"],
     lesson:"Pace signals certainty. Rushed sounds unsure. Slow signals conviction."},
    {id:"pause",title:"Pause Power",sentence:'"We have one problem." [pause] "Time."',
     instruction:"Say it once with the pause. Once without. Feel the difference.",
     modes:["Without pause","With deliberate pause"],
     lesson:"The pause is not empty — it's where your meaning lands."},
    {id:"pitch",title:"Pitch Ladder",sentence:'"I believe this is the right direction, and I think we should move forward with confidence."',
     instruction:"Say the same sentence starting high and dropping steadily lower word by word. Let authority build as your voice descends.",
     modes:["Higher pitch — start energised","Neutral pitch — controlled and clear","Lower pitch — authority and conviction"],
     lesson:"Lower pitch signals authority. Higher pitch signals energy or uncertainty."},
  ];
  const [openEx, setOpenEx] = useState(null);

  const card=(ex,i)=>(
    <div key={ex.id} onClick={()=>setOpenEx(openEx===i?null:i)}
      style={isDesktop
        ?{background:T2.surface,borderRadius:4,border:`0.5px solid ${openEx===i?T.gold:T2.border}`,padding:"20px 24px",cursor:"pointer",transition:"border-color 0.2s",marginBottom:14}
        :{background:T2.surface,border:`1px solid ${openEx===i?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"16px",cursor:"pointer",transition:"border-color 0.2s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:openEx===i?12:0}}>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?18:15,fontWeight:600,color:T2.text}}>{ex.title}</div>
        <span style={{fontFamily:T.sans,fontSize:17,fontWeight:600,color:openEx===i?T.gold:T2.text3,marginLeft:10,flexShrink:0}}>{openEx===i?"▴":"▸"}</span>
      </div>
      {openEx===i&&(
        <div style={{paddingTop:12,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,fontStyle:"italic",marginBottom:8}}>{ex.sentence}</p>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:12,color:T2.text3,lineHeight:1.6,marginBottom:12}}>{ex.instruction}</p>
          <div style={{display:"flex",flexDirection:"column",gap:0,marginBottom:12}}>
            {ex.modes.map((m,j,arr)=>(
              <div key={j} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:j<arr.length-1?"0.5px solid rgba(138,158,132,0.15)":"none"}}>
                <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,width:14,flexShrink:0}}>{j+1}.</span>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?13:13,color:T2.text,fontWeight:400}}>{m}</span>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?15:13,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>{ex.lesson}</p>
        </div>
      )}
    </div>
  );

  return isDesktop
    ? <>{EXERCISES.map((ex,i)=>card(ex,i))}</>
    : <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{EXERCISES.map((ex,i)=>card(ex,i))}</div>;
}

// ─── D2 SIM WIDGET — voice recording + AI vocal coach ────────────────────────
export function D2SimWidget({T, T2, isDesktop, onRecordingChange}) {
  const PROMPTS = {
    Presence:[
      "Introduce yourself as if you're speaking to a room of 500 people.",
      "Describe what you do — in a way that makes people lean in.",
      "Give a 90-second opening to a talk on the topic you care most about.",
      "Speak about something you believe most people get wrong.",
    ],
    Persuade:[
      "Convince your team to embrace a difficult change.",
      "Persuade a sceptical stakeholder to support your idea.",
      "Make the case for investing in people over technology.",
      "Convince a client to choose your proposal.",
    ],
    Story:[
      "Tell me about a moment that genuinely changed how you see the world.",
      "Describe the best piece of advice you've ever received — and why it stuck.",
      "Tell me about someone who shaped who you are today.",
      "Describe a moment where you surprised yourself.",
    ],
  };
  const ALL_PROMPTS = Object.values(PROMPTS).flat();
  const DIMS = ["Pace","Pitch","Tone","Pauses","Vocal Energy","Range","Presence"];
  const DIM_INFO = {
    "Pace": "How quickly you speak, measured in words per minute.",
    "Pitch": "How much your voice rises and falls, rather than staying flat.",
    "Tone": "The warmth and emotional colour carried in your voice.",
    "Pauses": "How well you use silence and breath to let key points land.",
    "Vocal Energy": "The dynamism and enthusiasm projected through your voice.",
    "Range": "The overall span between your quietest and most powerful moments.",
    "Presence": "How grounded, confident, and commanding you sound overall.",
  };

  const [phase, setPhase] = useState('intro');
  const dotCount = useSequentialDots(phase === 'analyzing');
  const [expandedDim, setExpandedDim] = useState(null);
  const [cat, setCat] = useState('Presence');
  const [prompt, setPrompt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isRec, setIsRec] = useState(false);
  useWakeLock(isRec);
  const [transcript, setTranscript] = useState('');
  const [fallback, setFallback] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [round1, setRound1] = useState(null);
  const [waveVals, setWaveVals] = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);
  const [audioURL, setAudioURL] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [waveAnim, setWaveAnim] = useState(0);
  const [selectedFocus, setSelectedFocus] = useState([]);
  const [recMetrics, setRecMetrics] = useState(null);
  const [micError, setMicError] = useState(false);
  const [transcribeFailed, setTranscribeFailed] = useState(false);

  // ── My Saved Results — shares the au1_toolkits store with Day 8/Day 11, but
  // this source (voice-analysis-day2) is capped and listed independently.
  const RESULT_CAP = 5;
  const isMineVoice = r => r.source === 'voice-analysis-day2';
  const [savedResults, setSavedResults] = useState(() => {
    try { return JSON.parse(localStorage.getItem("au1_toolkits") || "[]"); } catch { return []; }
  });
  const myResults = savedResults.filter(isMineVoice);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const confirmDeleteTimerRef = useRef(null);
  // Set the moment a save falls back to dropping the audio (quota) or fails
  // outright, so the feedback screen can tell the user right away instead of
  // saving silently. Cleared at the start of every new save attempt.
  const [audioSaveWarning, setAudioSaveWarning] = useState(null); // null | 'dropped' | 'failed'

  function saveVoiceResult(result, transcriptText, promptText) {
    setAudioSaveWarning(null);
    const entry = {
      id: Date.now(),
      source: 'voice-analysis-day2',
      prompt: promptText || '',
      transcript: transcriptText || '',
      result,
      audio: audioDataURIRef.current || null,
      timestamp: Date.now(),
    };
    if (myResults.length >= RESULT_CAP) {
      setPendingResult(entry);
      return;
    }
    const next = [entry, ...savedResults];
    setSavedResults(next);
    // A recording's base64 data: URI is the one thing here big enough to blow
    // localStorage's quota — if it does, drop just the audio and save the rest
    // rather than losing the whole toolkit list to a silent QuotaExceededError,
    // and tell the user their audio specifically didn't make it.
    try { localStorage.setItem("au1_toolkits", JSON.stringify(next)); }
    catch {
      try {
        localStorage.setItem("au1_toolkits", JSON.stringify(next.map(e => e.id === entry.id ? {...e, audio: null} : e)));
        if (entry.audio) setAudioSaveWarning('dropped');
      } catch { setAudioSaveWarning('failed'); }
    }
  }

  function deleteVoiceResult(id) {
    setSavedResults(prev => {
      let next = prev.filter(r => r.id !== id);
      let freedForPending = false;
      if (pendingResult && next.filter(isMineVoice).length < RESULT_CAP) {
        next = [pendingResult, ...next];
        freedForPending = true;
      }
      try { localStorage.setItem("au1_toolkits", JSON.stringify(next)); } catch {}
      if (freedForPending) setPendingResult(null);
      return next;
    });
  }

  useEffect(() => () => clearTimeout(confirmDeleteTimerRef.current), []);
  function handleDeleteClick(id) {
    clearTimeout(confirmDeleteTimerRef.current);
    if (confirmDeleteId === id) {
      setConfirmDeleteId(null);
      deleteVoiceResult(id);
    } else {
      setConfirmDeleteId(id);
      confirmDeleteTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  }

  function loadVoiceResult(r) {
    setPrompt(r.prompt || null);
    setTranscript(r.transcript || '');
    setFeedback(r.result || null);
    setRound1(null);
    setPlaying(false); setAudioProgress(0);
    setAudioURL(r.audio || null);
    setPhase('feedback');
  }

  // Picks up a "My Saved Work" card click from the Toolkit tab — a pending
  // load flag written just before navigation, consumed once here on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('au1_pending_load');
      if (!raw) return;
      const pending = JSON.parse(raw);
      if (pending?.source !== 'voice-analysis-day2') return;
      localStorage.removeItem('au1_pending_load');
      const entry = savedResults.find(r => r.id === pending.id && r.source === 'voice-analysis-day2');
      if (entry) loadVoiceResult(entry);
    } catch {}
  }, []);

  const audioRef = useRef(null);
  const mediaRecRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  // Persistent (base64 data: URI) copy of the recording, captured alongside the
  // transcribe call. Unlike the blob: URL in audioURL, this survives being
  // written to localStorage and read back on a later visit, so a saved result
  // can still play its recording back after this page's blob store is gone.
  const audioDataURIRef = useRef(null);
  const waveRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(()=>{
    onRecordingChange?.(isRec || phase==='analyzing');
  },[isRec, phase]);

  useEffect(()=>{
    if(isRec&&timeLeft>0){timerRef.current=setTimeout(()=>setTimeLeft(t=>t-1),1000);}
    return ()=>clearTimeout(timerRef.current);
  },[isRec,timeLeft]);

  useEffect(()=>{
    if(!isRec){clearInterval(waveRef.current);return;}
    waveRef.current=setInterval(()=>setWaveVals(()=>Array.from({length:9},()=>0.2+Math.random()*0.8)),150);
    return ()=>clearInterval(waveRef.current);
  },[isRec]);

  useEffect(()=>{
    if(!playing)return;
    let id;
    function tick(){const a=audioRef.current;if(a&&a.duration)setAudioProgress(a.currentTime/a.duration);setWaveAnim(t=>t+1);id=requestAnimationFrame(tick);}
    id=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(id);
  },[playing]);

  function computeMetrics(text, elapsedSec) {
    if (!text || text.trim().length < 5 || elapsedSec < 5) return null;
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const wpm = Math.round(wordCount / elapsedSec * 60);
    const fillerRegex = /\b(um+|uh+|er+|ah+|like|you know|sort of|kind of|basically|literally|right\b|yeah)\b/gi;
    const fillers = (text.match(fillerRegex) || []).length;
    const fillersPerMin = +(fillers / elapsedSec * 60).toFixed(1);
    const hedgeRegex = /\b(i think|i guess|maybe|perhaps|kind of|sort of|i suppose|i feel like|possibly)\b/gi;
    const hedges = (text.match(hedgeRegex) || []).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3).length || 1;
    const avgSentLen = Math.round(wordCount / sentences);
    let paceLabel, paceScore;
    if (wpm < 100) { paceLabel = 'slow'; paceScore = 58; }
    else if (wpm < 125) { paceLabel = 'measured'; paceScore = 82; }
    else if (wpm < 155) { paceLabel = 'ideal'; paceScore = 94; }
    else if (wpm < 180) { paceLabel = 'slightly fast'; paceScore = 74; }
    else { paceLabel = 'fast'; paceScore = 55; }
    return { wordCount, wpm, fillers, fillersPerMin, hedges, avgSentLen, paceLabel, paceScore, elapsedSec };
  }

  function doStart(){
    // Clean up any stale recorder/stream left over from a previous attempt
    // so a leftover active MediaRecorder can't make the new one throw.
    const prevMr = mediaRecRef.current;
    if (prevMr) {
      try { if (prevMr.state !== 'inactive') prevMr.stop(); } catch(e) {}
      try { prevMr.stream?.getTracks().forEach(t => t.stop()); } catch(e) {}
      mediaRecRef.current = null;
    }
    setIsRec(true);setTranscript('');setAudioURL(null);
    setMicError(false);setTranscribeFailed(false);
    startTimeRef.current = Date.now();
    audioChunksRef.current=[];
    audioDataURIRef.current=null;
    if(navigator.mediaDevices?.getUserMedia){
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        try {
          let mr;
          try { mr = new MediaRecorder(stream, {mimeType: 'audio/webm'}); }
          catch { mr = new MediaRecorder(stream); }
          mr.ondataavailable=e=>{if(e.data.size>0)audioChunksRef.current.push(e.data);};
          mr.start(1000);mediaRecRef.current=mr;
        } catch(err) {
          console.error('[D2Voice] recorder start error:', err);
          stream.getTracks().forEach(t => t.stop());
          setIsRec(false); setMicError(true);
        }
      }).catch(err=>{ console.error('[D2Voice] getUserMedia error:', err); setIsRec(false); setMicError(true); });
    } else {
      setIsRec(false); setMicError(true);
    }
  }

  function stopRecording(cb){
    const mr=mediaRecRef.current;
    if(!mr||mr.state==='inactive'){ cb('', true); return; }
    mr.onstop=async()=>{
      const blobType=mr.mimeType||'audio/webm';
      const blob=new Blob(audioChunksRef.current,{type:blobType});
      setAudioURL(URL.createObjectURL(blob));
      mr.stream.getTracks().forEach(t=>t.stop());
      try{
        const b64=await blobToB64(blob);
        audioDataURIRef.current='data:'+blobType+';base64,'+b64;
        const res=await fetch('/api/transcribe',{
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({b64, mimeType:blobType}),
        });
        const data=await res.json();
        if(!res.ok) throw new Error(data.error||'Transcription failed');
        cb((data.text||'').trim(), false);
      }catch(err){
        console.error('[D2Voice] transcribe error:', err);
        cb('', true);
      }
    };
    try{ mr.stop(); }catch(e){ cb('', true); }
  }

  function doStop(){
    const elapsedSec = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
    setIsRec(false);clearTimeout(timerRef.current);
    // Transition to the analyzing screen immediately — before the async
    // stop/transcribe chain — so the UI doesn't sit frozen on 'recording'
    // while MediaRecorder finalises the blob and /api/transcribe runs.
    setPhase('analyzing');
    stopRecording((text, failed) => {
      if (failed) { setTranscribeFailed(true); setPhase('recording'); return; }
      setTranscript(text);
      const m = computeMetrics(text, elapsedSec);
      setRecMetrics(m);
      analyzeText(text, m);
    });
  }

  async function analyzeText(text, metrics){
    setPhase('analyzing');
    const isRetry=!!round1;
    const base=isRetry?8:0;
    const mock={
      overall:Math.floor(Math.random()*18)+66+base,
      headline:"Your voice carried genuine presence and warmth.",
      subtitle:isRetry?"Clear improvement. Your vocal control is growing.":"A strong foundation — now let's sharpen the edges.",
      scores:Object.fromEntries(DIMS.map(d=>[d,Math.floor(Math.random()*22)+63+base])),
      habits:[],
      worked:["Natural, conversational warmth throughout","Good use of pause before key ideas"],
      improve:[{title:"Vary your pace deliberately",detail:"Slow down on your most important points to give them weight and let the listener absorb what you're saying."}],
      insight:"Your voice already has warmth and authenticity. The next level is intentional contrast: slow down when the idea matters most, raise your energy when you want to inspire. The gap between where you are and truly compelling delivery is smaller than you think.",
      moments:null
    };
    if(!text||text.trim().length<15){
      if(!isRetry){setRound1(mock);setFeedback(mock);}else setFeedback({...mock,prev:round1});
      setPhase(isRetry?'comparison':'feedback');return;
    }
    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1000,messages:[{role:"user",content:`You are a world-class vocal performance coach. Analyse this spoken delivery.\n\nIMPORTANT: All feedback must reference what this person ACTUALLY SAID. Quote or paraphrase specific words and phrases from the transcript. Do not write generic vocal coaching advice.\n\nSpeaking prompt: "${prompt}"\nTranscript: "${text}"${metrics && metrics.wpm > 0 ? `\n\nMeasured delivery data:\n- Speaking pace: ${metrics.wpm} WPM (${metrics.paceLabel}) — ideal executive range is 120–150 WPM\n- Confidence hedges ("I think", "maybe", etc.): ${metrics.hedges}\n- Average sentence length: ${metrics.avgSentLen} words` : ''}\n\nReturn ONLY valid JSON. Use the measured paceScore (${metrics?.paceScore||65}) for the Pace dimension:\n{"overall":<50-100>,"headline":"<max 10 words: single most important vocal insight, referencing what they said>","subtitle":"<one warm encouraging sentence specific to this delivery>","wpmNote":"<1 sentence naming their exact WPM and what it means for their listener — skip if no pace data>","confidenceNote":"<1 sentence about their directness: praise clear statements, gently flag hedging if hedges > 3, quoting a specific moment>","scores":{"Pace":<use ${metrics?.paceScore||65}>,"Pitch":<50-100>,"Tone":<50-100>,"Pauses":<50-100>,"Vocal Energy":<50-100>,"Range":<50-100>,"Presence":<50-100>},"worked":["<vocal strength 1 — short title, specific to what they said>","<vocal strength 2 — short title, specific to what they said>","<vocal strength 3 — short title>"],"workedSubs":["<1 sentence expanding on worked[0], quoting or paraphrasing specific words they actually said>","<1 sentence expanding on worked[1], referencing a specific moment in their delivery>","<1 sentence expanding on worked[2]>"],"improve":[{"title":"<4-7 words naming the single most impactful vocal change>","detail":"<1-2 sentences referencing a specific moment in their transcript where this would have landed harder>"}],"insight":"<2-3 personalised sentences referencing specific words or phrases they used: what vocal quality is working, what one change would elevate it most>","moments":[{"label":"<moment type e.g. Pace rush / Energy peak / Strong moment / Energy dip / Pitch drop>","quote":"<copy 4-6 consecutive words from the transcript exactly where this moment occurred>","color":"<#C8A46A for pace/energy rush, #527060 for strong moment, #B05C4A for dip/drop>"},{"label":"<moment type>","quote":"<4-6 consecutive words from transcript>","color":"<hex>"},{"label":"<moment type>","quote":"<4-6 consecutive words from transcript>","color":"<hex>"}]}`}]})});
      const d=await res.json();
      if(!res.ok) throw new Error(d.error||'Request failed');
      const raw=(d.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      const parsed=JSON.parse(m[0]);
      if(!parsed||typeof parsed.overall!=='number'||!parsed.scores) throw new Error('Malformed response');
      if(!isRetry){setRound1(parsed);setFeedback(parsed);}else setFeedback({...parsed,prev:round1});
      saveVoiceResult(parsed, text, prompt);
    }catch(err){
      console.error('[D2SimWidget] analyzeText error:', err);
      if(!isRetry){setRound1(mock);setFeedback(mock);}else setFeedback({...mock,prev:round1});
    }
    setPhase(isRetry?'comparison':'feedback');
  }

  function selectPrompt(p){setPrompt(p);setPhase('recording');setTimeLeft(90);setIsRec(false);setTranscript('');setFallback('');}
  function surprise(){selectPrompt(ALL_PROMPTS[Math.floor(Math.random()*ALL_PROMPTS.length)]);}
  function reset(){setPhase('intro');setPrompt(null);setTimeLeft(90);setIsRec(false);setTranscript('');setFallback('');setFeedback(null);setRound1(null);setAudioURL(null);setSelectedFocus([]);setRecMetrics(null);}

  function quoteToPos(fullText, quote) {
    if (!fullText || !quote) return null;
    const tLow = fullText.toLowerCase();
    const words = quote.toLowerCase().replace(/[^a-z\s]/g,'').trim().split(/\s+/).slice(0,4).join(' ');
    const idx = tLow.indexOf(words);
    if (idx < 0) return null;
    return Math.max(0.05, Math.min(0.92, idx / fullText.length));
  }

  const rawText = transcript || fallback;
  const STATIC_MARKERS=[{pos:0.18,label:"Pace rush",color:"#C8A46A"},{pos:0.44,label:"Energy dip",color:"#B05C4A"},{pos:0.66,label:"Strong moment",color:"#527060"},{pos:0.85,label:"Pitch drop",color:"#B05C4A"}];
  const aiMarkers=(feedback?.moments && rawText)
    ? feedback.moments.map((m,i)=>{const pos=quoteToPos(rawText,m.quote);return {pos:pos!=null?pos:STATIC_MARKERS[i]?.pos??0.2+i*0.2,label:m.label,color:m.color||"#C8A46A",quote:m.quote};}).sort((a,b)=>a.pos-b.pos)
    : STATIC_MARKERS;
  const fillerMarkers=rawText?findFillerClusters(rawText).slice(0,3).map(idx=>({pos:Math.max(0.05,Math.min(0.92,idx/rawText.length)),label:"Filler cluster",color:"#C4714A"})):[];
  const MARKERS=[...aiMarkers,...fillerMarkers].filter((m,i,arr)=>!arr.slice(0,i).some(p=>Math.abs(p.pos-m.pos)<0.06)).sort((a,b)=>a.pos-b.pos);

  const FOCUS=["Vary your pace","Use more pauses","Raise your energy","Vary your pitch","Stronger opening","Slow down key points","Increase your range"];

  // Plays `a` once it's actually ready to play, instead of calling play()
  // unconditionally — a blob: src can still be at readyState 0 (HAVE_NOTHING)
  // immediately after the <audio> element mounts, and WebKit/Safari can drop
  // a play() call made that early rather than queuing it. Same fix as Day 4.
  function playWhenReady(a){
    const start=()=>a.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false));
    if(a.readyState>=2){ start(); }
    else{ a.addEventListener('canplay', start, {once:true}); }
  }
  function togglePlay(){
    const a=audioRef.current;if(!a)return;
    if(playing){a.pause();setPlaying(false);}
    else{playWhenReady(a);}
  }
  function seekTo(pos){
    const a=audioRef.current;if(!a)return;
    a.currentTime=pos*(a.duration||0);
    if(!playing)playWhenReady(a);
  }
  function skip(sec){
    const a=audioRef.current;if(!a)return;
    const dur=a.duration||recMetrics?.elapsedSec||0;
    a.currentTime=Math.max(0,Math.min(dur,(a.currentTime||0)+sec));
    if(!playing)playWhenReady(a);
  }

  const cs={
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    h2:{fontFamily:T.serif,fontSize:isDesktop?36:26,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12},
    body:{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.65,margin:0},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
    ghost:{width:"100%",padding:"11px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44},
  };

  // ── INTRO ───────────────────────────────────────────────────────────────────
  if(phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>How It Works</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>A simple 4-step vocal check-in.</h2>
        <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
          {[
            {n:1,label:"Choose a prompt",    icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M4 6h14v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6z" stroke={T.gold} strokeWidth="1.3"/><path d="M4 6l7 5 7-5" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:2,label:"Speak naturally",   icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={T.gold} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2M8 19h6" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:3,label:"AI scores voice",   icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4H17l-3.5 2.5 1.5 4L11 11l-4 2.5 1.5-4L5 7h4.5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:4,label:"Reflect & listen",  icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={T.gold} strokeWidth="1.3"/><path d="M8 9a3 3 0 016 0v4a3 3 0 01-6 0V9z" stroke={T.gold} strokeWidth="1.3"/></svg>},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?44:34,height:isDesktop?44:34,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:5}}>{s.icon}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?9:8,fontWeight:700,color:T.gold,marginBottom:2}}>{s.n}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?12:9,color:T2.text2,textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?76:52}}>{s.label}</div>
              </div>
              {i<3&&<div style={{height:1,width:isDesktop?12:5,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:26}}/>}
            </div>
          ))}
        </div>
      </div>
      <div style={{...cs.card,padding:isDesktop?"26px 28px":"20px 20px"}}>
        <h3 style={{fontFamily:T.serif,fontSize:isDesktop?26:16,fontWeight:600,color:T2.text,lineHeight:1.15,margin:"0 0 "+(isDesktop?"22px":"18px"),whiteSpace:isDesktop?"normal":"nowrap"}}>Find Your Voice</h3>

        {/* Point 1 — what changes today */}
        <div style={{display:"flex",alignItems:"flex-start",gap:isDesktop?16:12}}>
          <div style={{width:isDesktop?48:36,height:isDesktop?48:36,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 24 24" fill="none">
              <circle cx="10" cy="9" r="3.2" stroke={T.gold} strokeWidth="1.3"/>
              <path d="M4.5 19c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M18 5.3l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7.7-1.6z" fill={T.gold}/>
              <path d="M20.5 11.2l.4.9.9.4-.9.4-.4.9-.4-.9-.9-.4.9-.4.4-.9z" fill={T.gold}/>
            </svg>
          </div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.6,margin:0,flex:1}}>
            Yesterday measured <strong>what you said</strong>. Today measures <strong>how you sound</strong>.
          </p>
        </div>

        <div style={{height:1,background:T2.divider,margin:isDesktop?"18px 0":"14px 0"}}/>

        {/* Point 2 — what the coach analyses + baseline note */}
        <div style={{display:"flex",alignItems:"flex-start",gap:isDesktop?16:12}}>
          <div style={{width:isDesktop?48:36,height:isDesktop?48:36,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 24 24" fill="none">
              <path d="M12 3l7 3v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M12 8.2l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3 1-2.1z" stroke={T.gold} strokeWidth="1.1" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{flex:1}}>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.6,margin:0}}>
              {"Your AmplifyU Coach analyses seven dimensions of your vocal delivery — "}<strong>pace, pitch, tone, pauses, vocal energy, range and presence</strong>{" — to reveal how your voice shapes the way people experience your message."}
            </p>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,margin:isDesktop?"10px 0 0":"8px 0 0",fontStyle:"italic"}}>
              This is your vocal baseline: a snapshot of the habits that build authority, confidence, and connection.
            </p>
          </div>
        </div>
      </div>

      {myResults.length>0 && (
        <div style={{background:T2.surface||"rgba(255,255,255,0.025)",borderRadius:8,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
          <button onClick={()=>setResultsOpen(v=>!v)} style={{width:"100%",background:"none",border:"none",padding:isDesktop?"14px 18px":"12px 16px",cursor:"pointer",fontFamily:T.sans,fontSize:12,color:T2.text3,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span>My Saved Results ({myResults.length})</span>
            <span style={{fontSize:14,opacity:0.6,transform:resultsOpen?"rotate(180deg)":"none",display:"inline-block",transition:"transform 0.2s"}}>▾</span>
          </button>
          {resultsOpen && (
            <div style={{display:"flex",flexDirection:"column",borderTop:"0.5px solid "+T2.border}}>
              {myResults.map(r=>{
                const confirming = confirmDeleteId === r.id;
                return (
                  <div key={r.id} style={{display:"flex",alignItems:"stretch",borderBottom:"0.5px solid "+T2.border}}>
                    <div onClick={()=>loadVoiceResult(r)} style={{flex:1,minWidth:0,padding:isDesktop?"12px 18px":"11px 16px",display:"flex",flexDirection:"column",gap:2,cursor:"pointer"}}>
                      <span style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,fontWeight:500}}>{r.result?.headline || r.prompt || "Voice analysis"}</span>
                      <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>{new Date(r.timestamp).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}{typeof r.result?.overall==='number' ? ` · ${r.result.overall}/100` : ""}</span>
                    </div>
                    <button onClick={()=>handleDeleteClick(r.id)} title={confirming?"Tap again to delete":"Delete"} style={{background:"none",border:"none",cursor:"pointer",color:confirming?"#b05c4a":T2.text4,fontSize:confirming?11:18,fontWeight:confirming?700:400,fontFamily:T.sans,padding:"0 16px",flexShrink:0,lineHeight:1,whiteSpace:"nowrap",transition:"all 0.15s"}}>{confirming?"Confirm?":"×"}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {pendingResult && (
        <div style={{background:"rgba(176,92,74,0.06)",borderRadius:6,border:"0.5px solid rgba(176,92,74,0.2)",padding:"10px 16px"}}>
          <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>You've reached your limit of {RESULT_CAP} saved results. This one won't be saved until you delete one above.</span>
        </div>
      )}
      {!pendingResult && myResults.length>0 && localStorageUsageRatio()>0.8 && (
        <div style={{background:"rgba(176,92,74,0.06)",borderRadius:6,border:"0.5px solid rgba(176,92,74,0.2)",padding:"10px 16px"}}>
          <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>You're running low on saved-recording space — delete an old one above to keep saving audio for new results.</span>
        </div>
      )}

      <button onClick={()=>setPhase('choose')} style={cs.cta}>Choose a Speaking Prompt →</button>
    </div>
  );

  // ── CHOOSE ──────────────────────────────────────────────────────────────────
  if(phase==='choose') {
    const D2ICONS=[
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4 19V5a2 2 0 012-2h13a1 1 0 011 1v14" stroke="currentColor" strokeWidth="1.3"/><path d="M4 19a2 2 0 002 2h13a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3"/><path d="M8 7h8M8 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 6.5h6.5L16 12.5l2.5 7L12 16l-6.5 3.5 2.5-7L3.5 8.5H10z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 014.9 11.9L16 15v2H8v-2l-.9-1.1A7 7 0 0112 2z" stroke="currentColor" strokeWidth="1.3"/><path d="M9 19h6M10 21h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    ];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <h2 style={cs.h2}>Choose a speaking prompt</h2>
          <p style={{...cs.body,marginBottom:16}}>{"Pick a topic, speak for 60-90 seconds. Your coach listens for pace, pitch, tone, pauses, vocal energy, range and presence."}</p>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:4}}>
          {Object.keys(PROMPTS).map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{padding:"8px 16px",borderRadius:3,border:`0.5px solid ${cat===c?T.gold:T2.border}`,background:cat===c?"rgba(138,158,132,0.1)":"transparent",color:cat===c?T.gold:T2.text3,fontSize:12,fontWeight:cat===c?600:400,cursor:"pointer",fontFamily:T.sans,minHeight:36,transition:"all 0.15s"}}>{c}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isDesktop?12:10}}>
          {PROMPTS[cat].map((p,i)=>(
            <div key={i} onClick={()=>selectPrompt(p)} className="au-lift" style={{...cs.card,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:isDesktop?"28px 18px 24px":"22px 14px 20px",gap:14,transition:"border-color 0.2s,box-shadow 0.2s"}}>
              <div style={{color:"rgba(44,36,22,0.3)",lineHeight:0}}>{D2ICONS[i%D2ICONS.length]}</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.45,margin:0,fontWeight:400}}>{p}</p>
            </div>
          ))}
        </div>
        <button onClick={surprise} style={{...cs.ghost,marginTop:4}}>{"✦ Surprise Me"}</button>
      </div>
    );
  }

  // ── RECORDING ───────────────────────────────────────────────────────────────
  if(phase==='recording') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Your Prompt</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:0}}>{prompt}</p>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Coaching Tips</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {["Vary your pace — slow down on important ideas.","Let pauses breathe. Don't rush to fill silence.","Bring genuine energy and emotion to your words.","Speak for 90 seconds to 2 minutes."].map((tip,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{...cs.card,textAlign:"center"}}>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?52:40,fontWeight:600,color:isRec?T.gold:T2.text,lineHeight:1,marginBottom:8,transition:"color 0.3s"}}>
          {isRec?`${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,'0')}`:timeLeft}
        </div>
        {isRec&&(
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:3,height:32,marginBottom:12}}>
            {waveVals.map((v,i)=>(
              <div key={i} style={{width:3,borderRadius:2,background:T.gold,height:Math.max(4,v*32),transition:"height 0.15s ease"}}/>
            ))}
          </div>
        )}
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          {!isRec?(
            <button onClick={doStart} style={{...cs.cta,width:"auto",padding:"12px 32px"}}>{(micError||transcribeFailed)?"Try Recording Again →":"Start Recording →"}</button>
          ):(
            <button onClick={doStop} style={{...cs.cta,width:"auto",padding:"12px 32px",background:"#8A4A3A"}}>Stop & Analyse →</button>
          )}
          {isRec&&<button onClick={()=>{setTimeLeft(t=>Math.min(t+30,120));}} style={{padding:"12px 20px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:12,cursor:"pointer",fontFamily:T.sans}}>+30s</button>}
        </div>
        {!isRec && (micError || transcribeFailed) && (
          <div style={{...cs.card, textAlign:"left", marginTop:12, border:"1px solid rgba(180,80,60,0.35)", background:"rgba(180,80,60,0.06)"}}>
            <div style={{...cs.label, color:"#B05C4A"}}>{micError ? 'Microphone unavailable' : "We couldn't quite hear that"}</div>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,margin:'0 0 10px'}}>
              {micError ? 'Check your microphone permission, or type your response instead.' : 'Type your response instead, or tap Try Recording Again above.'}
            </p>
            <textarea value={fallback} onChange={e=>setFallback(e.target.value)} placeholder="Type what you'd say…" style={{width:"100%",minHeight:80,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
            {fallback.trim().length>10 && (
              <button onClick={()=>{
                setMicError(false); setTranscribeFailed(false);
                const elapsedSec = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
                const text = fallback.trim();
                setTranscript(text);
                const m = computeMetrics(text, elapsedSec);
                setRecMetrics(m);
                analyzeText(text, m);
              }} style={{...cs.cta,marginTop:14}}>
                Submit →
              </button>
            )}
          </div>
        )}
      </div>
      <button onClick={()=>setPhase('choose')} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Choose a different prompt</button>
    </div>
  );

  // ── ANALYZING / FEEDBACK ─────────────────────────────────────────────────────
  // Share one persistent <audio> element across both phases (same position in
  // the returned tree each render, so React updates rather than remounts it)
  // so the browser starts decoding the recording in the background during
  // analysis, instead of only starting once the results screen mounts.
  if(phase==='analyzing' || ((phase==='feedback'||phase==='comparison')&&feedback)) {
    const audioEl = audioURL && (
      <audio ref={audioRef} src={audioURL} onEnded={()=>{setPlaying(false);setAudioProgress(0);}} style={{display:"none"}}/>
    );

    if(phase==='analyzing') return (
      <>
        <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:"48px 24px",textAlign:"center"}}>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,color:T2.text,lineHeight:1.5,margin:0}}>Analysing your voice…</p>
          <SequentialDots dotCount={dotCount}
            messages={["Evaluating pace, pitch, tone, pauses, energy, range, and presence.","Listening for where your voice carries the most conviction.","Mapping your pace against your pauses.","Finding the moments worth quoting back to you.","Almost there…"]}
            textStyle={{fontFamily:T.sans,fontSize:13,color:T2.text3}}/>
        </div>
        {audioEl}
      </>
    );

    const isComparison=phase==='comparison';
    const RANGLES=DIMS.map((_,i)=>-90+i*(360/DIMS.length));
    const cx=100,cy=100,rMax=72;
    const rPt=(sc,aDeg)=>{const a=aDeg*Math.PI/180;return[cx+(sc/100)*rMax*Math.cos(a),cy+(sc/100)*rMax*Math.sin(a)];};
    const gridPoly=(pct)=>RANGLES.map(a=>{const[x,y]=rPt(100,a);return`${(cx+(x-cx)*pct).toFixed(1)},${(cy+(y-cy)*pct).toFixed(1)}`;}).join(' ');
    const dataPoly=DIMS.map((d,i)=>{const[x,y]=rPt(feedback.scores?.[d]||50,RANGLES[i]);return`${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ');
    const WBARS=Array.from({length:60},(_,i)=>Math.max(0.08,Math.min(1,Math.sin(i/59*Math.PI)*0.65+0.25+Math.sin(i*4.7)*0.13+Math.cos(i*2.3)*0.11)));
    const scoreColor=s=>s>=80?T.gold:s>=70?"#7A9E84":T2.text3;
    return (
    <>
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      {/* 1 HERO — Voice Mirror */}
      <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"28px 32px":"22px 20px",border:"0.5px solid rgba(138,158,132,0.15)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(138,158,132,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(138,158,132,0.7)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>{isComparison?"Your Voice Progress":"Your Voice Mirror"}</div>
        {isComparison?(
          <div style={{display:"flex",gap:isDesktop?32:20,alignItems:"flex-end",marginBottom:20}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.4)",marginBottom:4}}>Round 1</div>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?60:48,fontWeight:600,color:"rgba(138,158,132,0.5)",lineHeight:1}}>{round1?.overall}</div>
            </div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?28:20,color:T.gold,paddingBottom:8}}>→</div>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:T.sans,fontSize:11,color:T.gold,marginBottom:4}}>Round 2</div>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?60:48,fontWeight:600,color:T.gold,lineHeight:1}}>{feedback.overall}</div>
            </div>
            {feedback.overall>(round1?.overall||0)&&<p style={{fontFamily:T.sans,fontSize:12,color:"rgba(138,158,132,0.7)",margin:"0 0 0 12px",alignSelf:"flex-end",paddingBottom:6}}>+{feedback.overall-(round1?.overall||0)} pts</p>}
          </div>
        ):(
          <div style={{display:"flex",gap:isDesktop?32:20,alignItems:"flex-start",marginBottom:20}}>
            <div style={{flexShrink:0}}>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?80:64,fontWeight:600,color:T.gold,lineHeight:1}}>{feedback.overall}</div>
              <div style={{fontFamily:T.sans,fontSize:12,color:"rgba(245,239,230,0.45)",marginTop:2}}>/ 100</div>
            </div>
            <div style={{paddingTop:8}}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{marginBottom:6}}><path d="M10 2l1.5 4H16l-3.5 2.5 1.5 4L10 10l-4 2.5 1.5-4L4 6h4.5z" stroke={T.gold} strokeWidth="1.2" strokeLinejoin="round"/></svg>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?24:19,fontWeight:600,color:"#F5EFE6",lineHeight:1.25,margin:"0 0 8px"}}>{feedback.headline||"Your voice had strong moments."}</p>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.55)",margin:0,lineHeight:1.5}}>{feedback.subtitle||"A solid starting point. Now let's sharpen it."}</p>
            </div>
          </div>
        )}
      </div>
      {/* 2 HEAR IT BACK */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>Hear it back</div>
        {playing&&(()=>{const active=[...MARKERS].reverse().find(m=>audioProgress>=m.pos);return active?(<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><div style={{width:6,height:6,borderRadius:"50%",background:active.color,flexShrink:0}}/><span style={{fontFamily:T.sans,fontSize:10,color:active.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em"}}>{active.label}</span></div>):null;})()}
        <div style={{marginBottom:isDesktop?14:10}}>
          <div style={{position:"relative"}}>
            <div style={{display:"flex",position:"relative",height:isDesktop?28:42,marginBottom:4}}>
              {MARKERS.map((m,i)=>{
                const approxSec=recMetrics?.elapsedSec?Math.round(m.pos*recMetrics.elapsedSec):null;
                const timeLabel=approxSec!=null?`${Math.floor(approxSec/60)}:${String(approxSec%60).padStart(2,'0')}`:null;
                const row=!isDesktop&&i%2===1;
                return(
                <div key={i} onClick={()=>seekTo(m.pos)} style={{position:"absolute",left:(m.pos*100)+"%",transform:"translateX(-50%)",textAlign:"center",zIndex:2,cursor:"pointer",top:row?21:0}}>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?9:7,color:m.color,fontWeight:600,whiteSpace:"nowrap"}}>{m.label}</div>
                  {timeLabel&&<div style={{fontFamily:T.sans,fontSize:isDesktop?8:6,color:T2.text4,whiteSpace:"nowrap"}}>{timeLabel}</div>}
                  {m.quote&&<div style={{fontFamily:T.serif,fontSize:isDesktop?8:6,color:"rgba(245,239,230,0.35)",whiteSpace:"nowrap",fontStyle:"italic",maxWidth:90,overflow:"hidden",textOverflow:"ellipsis"}}>"{m.quote}"</div>}
                </div>
              );})}
            </div>
            <div onClick={(e)=>{const r=e.currentTarget.getBoundingClientRect();seekTo((e.clientX-r.left)/r.width);}} style={{height:36,display:"flex",alignItems:"center",gap:1,position:"relative",overflow:"hidden",borderRadius:4,cursor:"pointer"}}>
              {WBARS.map((h,i)=>{const pos=i/WBARS.length;const nm=MARKERS.find(m=>Math.abs(m.pos-pos)<0.04);const played=pos<audioProgress;const near=playing?Math.max(0,1-Math.abs(pos-audioProgress)*18):0;const ah=playing?h*(0.82+0.28*Math.abs(Math.sin(waveAnim*0.07+i*0.45))+0.25*near):h;return<div key={i} style={{flex:1,background:nm?nm.color:played?`rgba(138,158,132,${0.55+ah*0.35})`:`rgba(138,158,132,${0.2+ah*0.25})`,borderRadius:1,height:Math.round(ah*32)+"px",minWidth:2}}/>;} )}
              {MARKERS.map((m,i)=><div key={i} style={{position:"absolute",left:(m.pos*100)+"%",top:0,bottom:0,width:2,background:m.color,opacity:0.6}}/>)}
              {audioProgress>0&&<div style={{position:"absolute",left:(audioProgress*100)+"%",top:0,bottom:0,width:2,background:"rgba(245,239,230,0.9)",zIndex:3,transform:"translateX(-50%)",boxShadow:"0 0 6px rgba(245,239,230,0.5)"}}/>}
            </div>
            <div onClick={(e)=>{const r=e.currentTarget.getBoundingClientRect();seekTo((e.clientX-r.left)/r.width);}} style={{width:"100%",height:4,background:"rgba(138,158,132,0.15)",borderRadius:2,position:"relative",cursor:"pointer",margin:"10px 0 6px",flexShrink:0}}>
              <div style={{position:"absolute",left:0,top:0,height:"100%",width:(audioProgress*100)+"%",background:"rgba(138,158,132,0.65)",borderRadius:2}}/>
              {MARKERS.map((m,i)=><div key={i} style={{position:"absolute",top:"50%",left:(m.pos*100)+"%",transform:"translate(-50%,-50%)",width:7,height:7,borderRadius:"50%",background:m.color,zIndex:2,boxShadow:"0 0 0 1.5px rgba(0,0,0,0.15)"}}/>)}
              <div style={{position:"absolute",top:"50%",left:(audioProgress*100)+"%",transform:"translate(-50%,-50%)",width:12,height:12,borderRadius:"50%",background:"rgba(245,239,230,0.95)",boxShadow:"0 1px 4px rgba(0,0,0,0.3)",zIndex:3,transition:"left 0.1s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
              <span style={{fontFamily:T.sans,fontSize:9,color:T2.text4}}>{recMetrics?.elapsedSec?`${Math.floor(audioProgress*recMetrics.elapsedSec/60)}:${String(Math.round(audioProgress*recMetrics.elapsedSec)%60).padStart(2,'0')}`:"0:00"}</span>
              <span style={{fontFamily:T.sans,fontSize:9,color:T2.text4}}>{recMetrics?.elapsedSec?`${Math.floor(recMetrics.elapsedSec/60)}:${String(recMetrics.elapsedSec%60).padStart(2,'0')}`:"1:30"}</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:14}}>
            <button onClick={()=>skip(-15)} title="Back 15s" style={{width:32,height:32,borderRadius:"50%",border:"0.5px solid "+T2.border,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,color:T2.text3}}>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M4 4v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.6 12.5A6.5 6.5 0 1 0 5.5 6.5L4 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><text x="10" y="13.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="currentColor" fontFamily="Inter, sans-serif">15</text></svg>
            </button>
            <button onClick={togglePlay} style={{width:40,height:40,borderRadius:"50%",border:"none",background:T2.text,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
              {playing?<svg width="12" height="14" viewBox="0 0 12 14"><rect x="0" y="0" width="4" height="14" fill={T.bg} rx="1"/><rect x="8" y="0" width="4" height="14" fill={T.bg} rx="1"/></svg>:<svg width="12" height="14" viewBox="0 0 12 14"><path d="M1 1l10 6-10 6V1z" fill={T.bg}/></svg>}
            </button>
            <button onClick={()=>skip(15)} title="Forward 15s" style={{width:32,height:32,borderRadius:"50%",border:"0.5px solid "+T2.border,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,color:T2.text3}}>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{transform:"scaleX(-1)"}}><path d="M4 4v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.6 12.5A6.5 6.5 0 1 0 5.5 6.5L4 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><text x="10" y="13.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="currentColor" fontFamily="Inter, sans-serif" style={{transform:"scaleX(-1)",transformOrigin:"10px 10px"}}>15</text></svg>
            </button>
          </div>
        </div>
        {rawText&&<div style={{marginTop:12,borderTop:"0.5px solid "+T2.border,paddingTop:10}}>
          <button onClick={()=>setShowTranscript(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:5,fontFamily:T.sans,fontSize:10,color:T2.text3,fontWeight:500}}>
            <span>{showTranscript?"Hide transcript":"View transcript"}</span>
            <span style={{fontSize:9}}>{showTranscript?"↑":"↓"}</span>
          </button>
          {showTranscript&&<p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,margin:"10px 0 0",background:"rgba(44,36,22,0.04)",borderRadius:4,padding:"10px 12px"}}>{rawText}</p>}
        </div>}
      </div>

      {audioSaveWarning&&(
        <div style={{background:"rgba(176,92,74,0.06)",borderRadius:6,border:"0.5px solid rgba(176,92,74,0.2)",padding:"10px 16px"}}>
          <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>{audioSaveWarning==='dropped'
            ? "Saved, but audio couldn't be stored because you're low on space. Delete an old recording from My Saved Work to save audio for new ones."
            : "This result couldn't be saved to My Saved Work — you're out of storage space. Delete an old recording and try again."}</span>
        </div>
      )}
      {/* 3 VOICE PROFILE */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>Your Voice Profile</div>
        <div style={{display:isDesktop?"flex":"block",gap:24,alignItems:"center"}}>
          <div style={{flexShrink:0,display:"flex",justifyContent:"center"}}>
            {/* viewBox padded well beyond the 0-200 data box (labels sit at radius
                116 from a center at 100,100, so at axis-aligned angles they land
                up to 116 units from center — past the 200x200 box edges without
                this margin, which was clipping "Range" and others) */}
            <svg viewBox="-45 -45 290 290" width={isDesktop?248:210} height={isDesktop?248:210}>
              {[0.25,0.5,0.75,1].map((p,i)=><polygon key={i} points={gridPoly(p)} fill="none" stroke={T2.border} strokeWidth={p===1?"0.8":"0.5"}/>)}
              {RANGLES.map((a,i)=>{const[x,y]=rPt(100,a);return<line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke={T2.border} strokeWidth="0.5"/>;})}
              <polygon points={dataPoly} fill="rgba(138,158,132,0.18)" stroke="rgba(82,112,96,0.7)" strokeWidth="1.5"/>
              {DIMS.map((d,i)=>{const[x,y]=rPt(feedback.scores?.[d]||50,RANGLES[i]);return<circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3" fill={T.gold} opacity="0.9"/>;})}
              {DIMS.map((d,i)=>{const[x,y]=rPt(116,RANGLES[i]);const anch=x<cx-4?"end":x>cx+4?"start":"middle";return<text key={i} x={x.toFixed(1)} y={y.toFixed(1)} textAnchor={anch} dominantBaseline="middle" style={{fontFamily:"'Inter',sans-serif",fontSize:"7.5px",fill:"rgba(44,36,22,0.55)",fontWeight:500}}>{d}</text>;})}
            </svg>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:10,marginTop:isDesktop?0:10}}>
            {DIMS.map((d,i)=>{const sc=feedback.scores?.[d]||50;const prev=round1?.scores?.[d];const diff=prev?sc-prev:null;const isOpen=expandedDim===d;return(
              <div key={i}>
                <div onClick={()=>setExpandedDim(isOpen?null:d)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text,width:isDesktop?90:76,flexShrink:0,borderBottom:"1px dotted "+T2.text4}}>{d}</span>
                  <div style={{flex:1,height:4,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:sc+"%",background:"linear-gradient(90deg,rgba(138,158,132,0.5),rgba(82,112,96,0.85))",borderRadius:2,transition:"width 1s ease"}}/>
                  </div>
                  <span style={{fontFamily:T.serif,fontSize:isDesktop?13:12,fontWeight:600,color:scoreColor(sc),width:24,textAlign:"right",flexShrink:0}}>{sc}</span>
                  {diff!==null&&<span style={{fontFamily:T.sans,fontSize:10,color:diff>0?"rgba(82,112,96,0.9)":diff<0?"rgba(160,80,60,0.7)":T2.text4,width:22,flexShrink:0}}>{diff>0?`+${diff}`:diff===0?"":diff}</span>}
                </div>
                {isOpen&&<p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,lineHeight:1.5,margin:"4px 0 0",paddingLeft:isDesktop?100:86}}>{DIM_INFO[d]}</p>}
              </div>
            );})}
          </div>
        </div>
      </div>
      {/* DELIVERY BREAKDOWN */}
      {recMetrics && (
        <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
          <div style={cs.label}>Delivery Breakdown</div>
          {/* WPM Gauge */}
          {recMetrics.wpm > 0 && (
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
                <span style={{fontFamily:T.sans,fontSize:12,color:T2.text3}}>Speaking pace</span>
                <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:600,color:recMetrics.paceScore>=85?T.gold:recMetrics.paceScore>=70?T2.text:"#B05C4A",lineHeight:1}}>{recMetrics.wpm}</span>
                  <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>WPM</span>
                  <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4,marginLeft:4}}>({recMetrics.paceLabel})</span>
                </div>
              </div>
              <div style={{position:"relative",height:8,borderRadius:4,marginBottom:4,overflow:"hidden"}}>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(176,92,74,0.5) 0%,rgba(200,164,106,0.6) 18%,rgba(138,158,132,0.85) 30%,rgba(82,112,96,0.9) 55%,rgba(200,164,106,0.6) 72%,rgba(176,92,74,0.5) 100%)"}}/>
                {(()=>{const min=70,max=230;const pct=Math.max(0,Math.min(100,(recMetrics.wpm-min)/(max-min)*100));const nc=recMetrics.paceScore>=85?T.gold:recMetrics.paceScore>=70?"#F5EFE6":"#B05C4A";return<div style={{position:"absolute",top:"-3px",left:pct+"%",transform:"translateX(-50%)",width:4,height:14,borderRadius:2,background:nc,boxShadow:"0 0 6px "+nc}}/>;})()}
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:T.sans,fontSize:9,color:T2.text4}}>70 slow</span>
                <span style={{fontFamily:T.sans,fontSize:9,color:T.gold}}>120–150 ideal</span>
                <span style={{fontFamily:T.sans,fontSize:9,color:T2.text4}}>230 fast</span>
              </div>
              {feedback.wpmNote&&<p style={{fontFamily:T.serif,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.55,margin:"10px 0 0",fontStyle:"italic"}}>{feedback.wpmNote}</p>}
            </div>
          )}
        </div>
      )}
      {/* 3 WHAT CAME ACROSS WELL + BIGGEST OPPORTUNITY */}
      <div style={{display:isDesktop?"grid":"flex",gridTemplateColumns:"1fr 1fr",flexDirection:"column",gap:isDesktop?12:10}}>
        <div style={{...cs.card,padding:isDesktop?"20px 22px":"16px 18px"}}>
          <div style={cs.label}>What came across well</div>
          {[
            {icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="8" height="8" rx="1.5" stroke={T2.text3} strokeWidth="1.2"/><rect x="11" y="3" width="8" height="8" rx="1.5" stroke={T2.text3} strokeWidth="1.2"/><rect x="3" y="11" width="8" height="8" rx="1.5" stroke={T2.text3} strokeWidth="1.2"/><rect x="11" y="11" width="8" height="8" rx="1.5" stroke={T2.text3} strokeWidth="1.2"/></svg>,text:feedback.worked?.[0]||"Natural vocal warmth",sub:feedback.workedSubs?.[0]||"Your voice felt genuine and easy to connect with."},
            {icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke={T2.text3} strokeWidth="1.2"/><path d="M4 19c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={T2.text3} strokeWidth="1.2" strokeLinecap="round"/></svg>,text:feedback.worked?.[1]||"Confident delivery",sub:feedback.workedSubs?.[1]||"You spoke with assurance and conviction."},
            {icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={T2.text3} strokeWidth="1.2"/><path d="M5 11a6 6 0 0012 0M11 17v2" stroke={T2.text3} strokeWidth="1.2" strokeLinecap="round"/></svg>,text:feedback.worked?.[2]||"Engaging throughout",sub:feedback.workedSubs?.[2]||"You held attention from start to finish."},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<2?12:0,paddingBottom:i<2?12:0,borderBottom:i<2?"0.5px solid "+T2.divider:"none"}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:T2.bg,border:"0.5px solid "+T2.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{item.icon}</div>
              <div>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,marginBottom:2}}>{item.text}</div>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.5}}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{...cs.card,padding:isDesktop?"20px 22px":"16px 18px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"#B07A40",textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>Biggest Opportunity</div>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(176,122,64,0.1)",border:"1px solid rgba(176,122,64,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a5 5 0 014 8l-1 1v2H7v-2L6 10a5 5 0 014-8z" stroke="#B07A40" strokeWidth="1.2"/><path d="M7 15h6M8 17h4" stroke="#B07A40" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </div>
            <div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 8px"}}>{feedback.improve?.[0]?.title||"Vary your pace deliberately."}</p>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.6,margin:0}}>{feedback.improve?.[0]?.detail||"Slow down on your most important ideas to give them weight."}</p>
            </div>
          </div>
        </div>
      </div>
      {/* 4 AMPLIFYU COACH SAYS */}
      <div style={{...cs.card,padding:isDesktop?"22px 28px":"18px 20px"}}>
        <div style={cs.label}>Your AI Vocal Coach Says</div>
        <div style={{display:"flex",gap:isDesktop?18:12,alignItems:"flex-start"}}>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?44:34,color:T.gold,lineHeight:0.8,flexShrink:0,marginTop:4,opacity:0.5}}>"</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.7,margin:0,flex:1}}>{feedback.insight}</p>
          <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"1px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,alignSelf:"flex-end"}}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 2l1.5 4H15l-3.75 2.75 1.5 4.5L9 11l-3.75 2.75 1.5-4.5L3 6h4.5z" stroke={T.gold} strokeWidth="1.1" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
      {/* 6 FOCUS NEXT ROUND */}
      <div style={{...cs.card,padding:isDesktop?"20px 22px":"16px 18px"}}>
        <div style={cs.label}>Focus next round</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {FOCUS.map((f,i)=>{const sel=selectedFocus.includes(f);return(
            <button key={i} onClick={()=>setSelectedFocus(sf=>sel?sf.filter(x=>x!==f):[...sf,f])} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,border:`0.5px solid ${sel?T.gold:T2.border}`,background:sel?"rgba(138,158,132,0.1)":"transparent",color:sel?T.gold:T2.text,fontFamily:T.serif,fontSize:isDesktop?13:12,cursor:"pointer",transition:"all 0.15s",fontWeight:sel?600:400}}>{f}</button>
          );})}
        </div>
      </div>
      <button onClick={reset} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Start over</button>
    </div>
    {audioEl}
    </>
    );
  }

  return null;
}

// ─── OLD D2 SCENARIOS (unused) ───────────────────────────────────────────────
function _unused_D2SimScenarios() {
  const SCENARIOS=[
    {id:0,label:"Pitch a New Idea",sub:"You're presenting to senior leadership.",goal:"Confidence + clarity",
     aiOpener:"You have 60 seconds. Convince me this is worth our time and investment.",
     followUps:["What problem does this solve?","Why now?","What's the risk if we don't act?","How is this different?"],
     starters:["I believe this is worth attention because…","The opportunity here is…","What makes this compelling is…"],
     hardPersona:"sceptical CEO who has heard many pitches before",
     defaultScript:{topic:"AI Productivity Assistant",context:"Your company wastes hours each week searching for documents, notes, and updates across disconnected systems.",
       beginner:'"I believe we have an opportunity to significantly improve internal productivity. Teams currently lose valuable time searching for information across multiple systems. A lightweight AI assistant could centralise access, reduce friction, and save hours each week. The investment is modest. The return — in time, focus, and team performance — is measurable from week one."',
       intermediate:["The problem: information is scattered across systems","The opportunity: a centralised AI assistant","The impact: measurable time savings from week one","Ask: 30 minutes to walk you through the proposal"]}},
    {id:1,label:"Deliver Difficult Feedback",sub:"A direct report has been underperforming.",goal:"Warmth + calm",
     aiOpener:"I appreciate you taking the time. I have to say — I didn't expect this conversation.",
     followUps:["That's disappointing to hear.","What could I have done differently?","Is this about my future here?"],
     starters:["I want to start by saying I value what you bring…","This conversation is important because I care about your growth…","I want to be honest, and I want to do it with respect…"],
     hardPersona:"defensive and emotional team member",
     defaultScript:{topic:"Missed Deadlines",context:"Deadlines have slipped three times in the past month. You need to address it directly but empathetically.",
       beginner:'"I wanted to speak with you because I\'ve noticed deadlines have slipped over the past few weeks, and I want to understand what\'s going on so we can address it together. I\'m not here to assign blame — I want to understand what\'s getting in the way, and how I can support you better."',
       intermediate:["Open: you value them and this is a supportive conversation","The pattern: three missed deadlines, what you've observed","The question: what's getting in the way?","The offer: what support looks like from your side"]}},
    {id:2,label:"Motivate Your Team",sub:"The team has had a tough quarter.",goal:"Energy + conviction",
     aiOpener:"Honestly, morale has been low. I'm not sure words are going to fix this.",
     followUps:["We've heard this before.","What's actually going to be different?","How do you expect us to stay motivated?"],
     starters:["What we've built together matters, and here's why…","I want to be honest about where we are — and where we're going…","The work you've done this quarter has not gone unnoticed…"],
     hardPersona:"disengaged team who have lost faith in leadership",
     defaultScript:{topic:"Rallying the Team",context:"Q3 has been brutal. Missed targets, team fatigue, pressure from above. You need to re-energise without sounding hollow.",
       beginner:'"We\'ve made meaningful progress, and I know this quarter has taken it out of us. But I want to be direct with you: the next phase will require focus and energy. I believe we\'re capable of delivering something exceptional — and I\'m committed to making sure you have everything you need to do your best work."',
       intermediate:["Acknowledge the difficulty honestly — don't minimise it","State what's still true: the work matters, the team matters","Name what the next phase requires","Commit to what you'll do differently as their leader"]}},
    {id:3,label:"Interview Question",sub:"Senior panel interview for a leadership role.",goal:"Executive presence",
     aiOpener:"Tell me — in your own words — what makes you the right person for this role?",
     followUps:["Tell me about a time you led through uncertainty.","What's your biggest leadership failure?","How do you handle conflict at exec level?"],
     starters:["What I bring to this role is…","Throughout my career, the thread has always been…","What sets me apart is…"],
     hardPersona:"hostile interviewer testing under pressure",
     defaultScript:{topic:"Leadership Through Uncertainty",context:"The interviewer asks: 'Tell me about a time you led through uncertainty.'",
       beginner:'"Early in my career, I was asked to lead a programme that had already failed once. The team was demoralised, the brief was unclear, and senior stakeholders had lost confidence. I started by being honest — I didn\'t have all the answers. What I did have was a process. I focused the team on what we could control, created clarity where there wasn\'t any, and rebuilt confidence one small win at a time. We delivered. What I learned is that leadership in uncertainty isn\'t about having the answers. It\'s about creating enough stability for others to do their best work."',
       intermediate:["Set the scene: what made it uncertain","What you chose to do and why","The outcome","The lesson you carried forward"]}},
  ];

  const [phase, setPhase] = useState('idle');
  const [sc, setSc] = useState(null);
  const [mode, setMode] = useState(null); // 'guided' | 'own'
  const [difficulty, setDifficulty] = useState('beginner'); // beginner | intermediate | advanced
  const [generatedScript, setGeneratedScript] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [starter, setStarter] = useState('');
  const [input, setInput] = useState('');
  const [aiMsg, setAiMsg] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [hard, setHard] = useState(false);

  function selectScenario(s, hardMode=false){
    setSc(s); setHard(hardMode); setMode(null); setDifficulty('beginner');
    setStarter(''); setInput(''); setResult(null); setGeneratedScript(null);
    setAiMsg(hardMode?`[${s.hardPersona}] ${s.aiOpener}`:s.aiOpener);
    setRound(0); setPhase('mode-select');
  }

  async function generateNewScript(){
    setGenerating(true);
    const topics={0:["wellness app","sustainability initiative","customer service improvement","flexible working proposal","new product launch"],
      1:["consistent lateness","quality of work declining","communication issues with the team","missing key meetings"],
      2:["product launch rally","end of year message","restructure announcement","new strategy kickoff"],
      3:["conflict resolution","managing upwards","career pivot","building a high-performance team"]};
    const pool = topics[sc.id]||topics[0];
    const topic = pool[Math.floor(Math.random()*pool.length)];
    try {
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:400,messages:[{role:"user",content:`Generate a professional coaching scenario for: "${sc.label}" about the topic: "${topic}". Return JSON only: {"topic":"short title","context":"1-2 sentence scene-setting","beginner":"a polished 3-4 sentence sample script in first person, in quotes","intermediate":["4 concise talking point strings"]}`}]})});
      const d = await res.json();
      const raw = (d.content||[]).map(b=>b.text||"").join("").trim();
      try { const m=raw.match(/\{[\s\S]*\}/); setGeneratedScript(JSON.parse(m[0])); } catch {}
    } catch {}
    setGenerating(false);
  }

  function startWithScript(){
    const script = generatedScript || sc.defaultScript;
    if(difficulty==='beginner') setInput(script.beginner.replace(/^"|"$/g,''));
    else if(difficulty==='intermediate') setInput(script.intermediate.map((p,i)=>`${i+1}. ${p}`).join('\n'));
    else setInput('');
    setPhase('active');
  }

  function startOwn(){
    setInput(starter); setPhase('active');
  }

  async function submit(){
    if(!input.trim()) return;
    setLoading(true);
    try {
      const persona = hard?`You are a ${sc.hardPersona}. `:`You are a premium executive communication coach. `;
      const followUp = round < sc.followUps.length ? `After scoring, include a follow-up question as the conversation partner: "${sc.followUps[round]}"` : "";
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:600,messages:[{role:"user",content:`${persona}Scenario: "${sc.label}". Goal: ${sc.goal}.\n\nUser said: "${input}"\n\nEvaluate as if spoken aloud. Score 1-10. Write 2-3 sentences of premium, specific, encouraging coaching. ${followUp}\n\nReturn JSON only: {"confidence":N,"pace":N,"clarity":N,"warmth":N,"pauses":N,"presence":N,"feedback":"coaching note","followUp":"follow-up question or empty string"}`}]})});
      const d = await res.json();
      const raw=(d.content||[]).map(b=>b.text||"").join("").trim();
      try { const m=raw.match(/\{[\s\S]*\}/); const r=JSON.parse(m[0]); setResult(r); if(r.followUp) setAiMsg(r.followUp); } catch { setResult(null); }
    } catch { setResult(null); }
    setLoading(false); setRound(r=>r+1); setPhase('feedback');
  }

  const dark=T2.bg, cream=T2.text, creamDim=T2.text3;
  const subBg=T2.surface, subBorder=T2.border, subBorderAct="rgba(138,158,132,0.5)";
  const btn=(label,onClick,style={})=>(
    <button onClick={onClick} style={{padding:"12px 20px",borderRadius:4,border:"1px solid "+subBorder,background:"transparent",color:cream,fontSize:isDesktop?13:12,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44,transition:"all 0.2s",...style}}>{label}</button>
  );

  if(phase==='idle') return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isDesktop?16:10}}>
      {SCENARIOS.map(s=>(
        <div key={s.id} onClick={()=>selectScenario(s)} style={{background:T2.surface,borderRadius:isDesktop?8:6,padding:isDesktop?"24px 20px":"16px 14px",cursor:"pointer",border:"0.5px solid "+T2.border,transition:"all 0.2s ease"}}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.gold; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(44,36,22,0.08)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=T2.border; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?18:14,fontWeight:600,color:T2.text,marginBottom:4,lineHeight:1.2}}>{s.label}</div>
          <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,marginBottom:isDesktop?12:8}}>{s.sub}</div>
          <div style={{display:"inline-block",background:"rgba(138,158,132,0.1)",border:"1px solid rgba(138,158,132,0.2)",borderRadius:20,padding:"3px 10px",fontFamily:T.sans,fontSize:10,color:T.goldDark,fontWeight:500}}>Goal: {s.goal}</div>
        </div>
      ))}
    </div>
  );

  if(phase==='mode-select') return (
    <div style={{background:dark,borderRadius:8,overflow:"hidden",animation:"fadeIn 0.3s ease"}}>
      <div style={{height:2,background:"linear-gradient(90deg,"+T.gold+",rgba(138,158,132,0.2))"}}/>
      <div style={{padding:isDesktop?"36px 40px":"0 0"}}>
        <div style={{fontSize:10,color:T.gold,textTransform:"uppercase",letterSpacing:"0.2em",marginBottom:6,fontFamily:T.sans}}>{sc.label}</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:16,fontWeight:600,color:cream,marginBottom:6,lineHeight:1.3}}>{sc.sub}</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:creamDim,marginBottom:isDesktop?32:24}}>How would you like to practise?</p>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          <div onClick={()=>setMode('guided')} style={{background:mode==='guided'?"rgba(138,158,132,0.10)":T2.surface,border:`1px solid ${mode==='guided'?"rgba(138,158,132,0.5)":T2.border}`,borderRadius:8,padding:isDesktop?"20px 24px":"16px 18px",cursor:"pointer",transition:"all 0.2s"}}>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:cream,marginBottom:6}}>Coach Me With a Guided Scenario</div>
            <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:creamDim,marginBottom:8}}>AI provides a realistic professional scenario and a polished sample script to rehearse aloud.</div>
            <div style={{fontFamily:T.sans,fontSize:11,color:T.gold}}>Best for: building confidence · removing blank-page anxiety</div>
          </div>
          <div onClick={()=>setMode('own')} style={{background:mode==='own'?"rgba(138,158,132,0.10)":T2.surface,border:`1px solid ${mode==='own'?"rgba(138,158,132,0.5)":T2.border}`,borderRadius:8,padding:isDesktop?"20px 24px":"16px 18px",cursor:"pointer",transition:"all 0.2s"}}>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:cream,marginBottom:6}}>Practise With My Own Response</div>
            <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:creamDim,marginBottom:8}}>Use your own words — real content from your work or improvise freely.</div>
            <div style={{fontFamily:T.sans,fontSize:11,color:T.gold}}>Best for: real-world rehearsal · advanced practice</div>
          </div>
        </div>
        {mode&&<button onClick={()=>setPhase(mode==='guided'?'guided-setup':'setup')} style={{width:"100%",padding:"13px",borderRadius:4,border:"none",background:T.gold,color:"white",fontSize:isDesktop?14:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44,marginBottom:12}}>Continue →</button>}
        <button onClick={()=>setPhase('idle')} style={{background:"transparent",border:"none",color:creamDim,fontFamily:T.sans,fontSize:12,cursor:"pointer",padding:0}}>← Back</button>
      </div>
    </div>
  );

  if(phase==='guided-setup'){
    const script = generatedScript || sc.defaultScript;
    return (
      <div style={{background:dark,borderRadius:8,overflow:"hidden",animation:"fadeIn 0.3s ease"}}>
        <div style={{height:2,background:"linear-gradient(90deg,"+T.gold+",rgba(138,158,132,0.2))"}}/>
        <div style={{padding:isDesktop?"36px 40px":"0 0"}}>
          <div style={{fontSize:10,color:T.gold,textTransform:"uppercase",letterSpacing:"0.2em",marginBottom:6,fontFamily:T.sans}}>Practice Scenario</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?22:17,fontWeight:600,color:cream,marginBottom:8}}>{script.topic}</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:12,color:creamDim,lineHeight:1.65,marginBottom:isDesktop?24:18}}>{script.context}</p>
          {/* Difficulty */}
          <div style={{fontSize:10,color:creamDim,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:10,fontFamily:T.sans}}>Choose your level</div>
          <div style={{display:"flex",gap:8,marginBottom:isDesktop?20:16}}>
            {[['beginner','Full Script','Read aloud'],['intermediate','Talking Points','Fill the gaps'],['advanced','Speak Freely','Improvise']].map(([d,label,sub])=>(
              <button key={d} onClick={()=>setDifficulty(d)} style={{flex:1,padding:isDesktop?"12px 8px":"10px 6px",borderRadius:6,border:`1px solid ${difficulty===d?"rgba(138,158,132,0.5)":T2.border}`,background:difficulty===d?"rgba(138,158,132,0.10)":T2.surface,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>
                <div style={{fontSize:isDesktop?12:11,fontWeight:600,color:difficulty===d?T.gold:cream,marginBottom:2}}>{label}</div>
                <div style={{fontSize:10,color:creamDim}}>{sub}</div>
              </button>
            ))}
          </div>
          {/* Script preview */}
          <div style={{background:T2.surface,borderRadius:6,padding:isDesktop?"18px 20px":"14px 16px",marginBottom:isDesktop?20:16,borderLeft:"2px solid rgba(138,158,132,0.3)"}}>
            <div style={{fontSize:9,color:creamDim,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:8,fontFamily:T.sans}}>
              {difficulty==='beginner'?'Suggested Script':difficulty==='intermediate'?'Talking Points':'You\'ll improvise this one'}
            </div>
            {difficulty==='beginner'&&<p style={{fontFamily:T.serif,fontSize:isDesktop?15:13,fontStyle:"italic",color:cream,margin:0,lineHeight:1.65}}>{script.beginner}</p>}
            {difficulty==='intermediate'&&<div style={{display:"flex",flexDirection:"column",gap:6}}>{script.intermediate.map((p,i)=><div key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:cream,lineHeight:1.5}}>· {p}</div>)}</div>}
            {difficulty==='advanced'&&<p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,fontStyle:"italic",color:creamDim,margin:0}}>No script. Your words, your way.</p>}
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
            <button onClick={startWithScript} style={{flex:1,padding:"13px",borderRadius:4,border:"none",background:T.gold,color:"white",fontSize:isDesktop?14:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Practise My Delivery →</button>
            <button onClick={generateNewScript} disabled={generating} style={{padding:"13px 16px",borderRadius:4,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:generating?creamDim:cream,fontSize:isDesktop?13:12,fontWeight:500,cursor:generating?"not-allowed":"pointer",fontFamily:T.sans,minHeight:44,flexShrink:0}}>
              {generating?"Generating…":"Generate New Scenario"}
            </button>
          </div>
          <button onClick={()=>setPhase('mode-select')} style={{background:"transparent",border:"none",color:creamDim,fontFamily:T.sans,fontSize:12,cursor:"pointer",padding:0}}>← Back</button>
        </div>
      </div>
    );
  }

  if(phase==='setup') return (
    <div style={{background:dark,borderRadius:8,overflow:"hidden",animation:"fadeIn 0.4s ease"}}>
      <div style={{height:2,background:"linear-gradient(90deg,"+T.gold+",rgba(138,158,132,0.2))"}}/>
      <div style={{padding:isDesktop?"36px 40px":"0 0"}}>
        <div style={{fontSize:10,color:T.gold,textTransform:"uppercase",letterSpacing:"0.2em",marginBottom:6,fontFamily:T.sans}}>{sc.label}</div>
        <div style={{background:T2.surface,borderRadius:6,padding:isDesktop?"16px 20px":"12px 14px",marginBottom:isDesktop?24:18,borderLeft:"2px solid "+T.gold}}>
          <div style={{fontSize:9,color:creamDim,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:6,fontFamily:T.sans}}>AmplifyU Coach</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:14,fontStyle:"italic",color:cream,margin:0,lineHeight:1.5}}>{aiMsg}</p>
        </div>
        <div style={{fontSize:10,color:creamDim,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:12,fontFamily:T.sans}}>Start with…</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:isDesktop?20:16}}>
          {sc.starters.map((s,i)=>(
            <button key={i} onClick={()=>{ setStarter(s); setInput(s+' '); setPhase('active'); }} style={{background:T2.surface,border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:isDesktop?"12px 16px":"10px 14px",cursor:"pointer",textAlign:"left",fontFamily:T.serif,fontSize:isDesktop?15:13,fontStyle:"italic",color:cream,lineHeight:1.4,minHeight:44,transition:"all 0.2s"}}>○ {s}</button>
          ))}
          <button onClick={()=>{ setStarter(''); setInput(''); setPhase('active'); }} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.06)",borderRadius:6,padding:isDesktop?"10px 16px":"8px 14px",cursor:"pointer",textAlign:"left",fontFamily:T.sans,fontSize:isDesktop?13:12,color:creamDim,minHeight:44}}>Or speak freely →</button>
        </div>
        <button onClick={()=>setPhase('mode-select')} style={{background:"transparent",border:"none",color:creamDim,fontFamily:T.sans,fontSize:12,cursor:"pointer",padding:0}}>← Back</button>
      </div>
    </div>
  );

  if(phase==='active') return (
    <div style={{background:dark,borderRadius:8,overflow:"hidden",animation:"fadeIn 0.3s ease"}}>
      <div style={{height:2,background:"linear-gradient(90deg,"+T.gold+",rgba(138,158,132,0.2))"}}/>
      <div style={{padding:isDesktop?"36px 40px":"0 0"}}>
        <div style={{background:T2.surface,borderRadius:6,padding:isDesktop?"16px 20px":"12px 14px",marginBottom:isDesktop?24:18,borderLeft:"2px solid "+T.gold}}>
          <div style={{fontSize:9,color:creamDim,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:6,fontFamily:T.sans}}>AmplifyU Coach</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:14,fontStyle:"italic",color:cream,margin:0,lineHeight:1.5}}>{aiMsg}</p>
        </div>
        <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Speak your response…" rows={isDesktop?5:4} style={{width:"100%",background:T2.surface,border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"14px 16px",fontFamily:T.serif,fontSize:isDesktop?16:14,color:cream,lineHeight:1.65,resize:"none",outline:"none",boxSizing:"border-box",caretColor:T.gold}}/>
        <div style={{display:"flex",gap:10,marginTop:14}}>
          <button onClick={submit} disabled={loading||!input.trim()} style={{flex:1,padding:"13px",borderRadius:4,border:"none",background:loading||!input.trim()?T2.surface:T.gold,color:loading||!input.trim()?creamDim:"white",fontSize:isDesktop?14:13,fontWeight:600,cursor:loading||!input.trim()?"not-allowed":"pointer",fontFamily:T.sans,minHeight:44}}>
            {loading?"Coaching in progress…":"Get Voice Coaching →"}
          </button>
          <button onClick={()=>setPhase(mode==='guided'?'guided-setup':'setup')} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:4,padding:"13px 16px",color:creamDim,fontFamily:T.sans,fontSize:12,cursor:"pointer",minHeight:44}}>Back</button>
        </div>
      </div>
    </div>
  );

  if(phase==='feedback'&&result){
    const dims=[{l:"Confidence",v:result.confidence},{l:"Pace",v:result.pace},{l:"Clarity",v:result.clarity},{l:"Warmth",v:result.warmth},{l:"Pauses",v:result.pauses},{l:"Presence",v:result.presence}];
    const avg=Math.round(dims.reduce((a,d)=>a+d.v,0)/dims.length);
    return (
      <div style={{background:dark,borderRadius:8,overflow:"hidden",animation:"fadeIn 0.4s ease"}}>
        <div style={{height:2,background:"linear-gradient(90deg,"+T.gold+",rgba(138,158,132,0.2))"}}/>
        <div style={{padding:isDesktop?"36px 40px":"0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:isDesktop?20:16,marginBottom:isDesktop?28:22}}>
            <div style={{flexShrink:0,textAlign:"center"}}>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?56:44,fontWeight:600,color:avg>=7?T.gold:avg>=5?"rgba(245,239,230,0.7)":"#B05C4A",lineHeight:1}}>{avg}</div>
              <div style={{fontFamily:T.sans,fontSize:10,color:creamDim,textTransform:"uppercase",letterSpacing:"0.1em",marginTop:2}}>/ 10</div>
            </div>
            <div>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?18:15,fontWeight:600,color:cream,marginBottom:4}}>Vocal Coaching Score</div>
              <div style={{fontFamily:T.sans,fontSize:isDesktop?13:11,color:creamDim}}>{sc.label} · {sc.goal}</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:isDesktop?12:10,marginBottom:isDesktop?24:20}}>
            {dims.map((d,i)=>(
              <div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:creamDim,textTransform:"uppercase",letterSpacing:"0.1em"}}>{d.l}</span>
                  <span style={{fontFamily:T.serif,fontSize:isDesktop?14:12,fontWeight:600,color:d.v>=7?T.gold:d.v>=5?"rgba(245,239,230,0.7)":"rgba(180,100,80,0.9)"}}>{d.v}</span>
                </div>
                <div style={{height:3,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${d.v*10}%`,background:d.v>=7?T.gold:d.v>=5?"rgba(245,239,230,0.4)":"rgba(180,100,80,0.6)",borderRadius:2,transition:"width 0.8s ease"}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(138,158,132,0.08)",borderRadius:6,padding:isDesktop?"18px 20px":"14px 16px",borderLeft:"2px solid "+T.gold,marginBottom:isDesktop?24:20}}>
            <div style={{fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:8,fontFamily:T.sans}}>Your Coaching</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:cream,margin:0,lineHeight:1.65}}>{result.feedback}</p>
          </div>
          {result.followUp&&(
            <div style={{background:T2.surface,borderRadius:6,padding:isDesktop?"14px 18px":"12px 14px",borderLeft:"2px solid "+T.gold,marginBottom:isDesktop?24:18}}>
              <div style={{fontSize:9,color:creamDim,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:6,fontFamily:T.sans}}>Continue the conversation</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?15:13,fontStyle:"italic",color:cream,margin:0,lineHeight:1.5}}>{result.followUp}</p>
            </div>
          )}
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            <button onClick={()=>{ setInput(mode==='guided'?(generatedScript||sc.defaultScript).beginner.replace(/^"|"$/g,''):starter); setPhase('active'); setResult(null); }} style={{flex:1,padding:"12px",borderRadius:4,border:"none",background:T.gold,color:"white",fontSize:isDesktop?13:12,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Try Again</button>
            {result.followUp&&<button onClick={()=>{ setInput(''); setPhase('active'); setResult(null); setAiMsg(result.followUp); }} style={{flex:1,padding:"12px",borderRadius:4,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:cream,fontSize:isDesktop?13:12,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Respond →</button>}
            <button onClick={()=>selectScenario(sc,true)} style={{flex:1,padding:"12px",borderRadius:4,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:creamDim,fontSize:isDesktop?13:12,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Harder Scenario</button>
            <button onClick={()=>setPhase('idle')} style={{width:"100%",padding:"11px",borderRadius:4,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:creamDim,fontSize:12,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>New Scenario</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}


// ─── D5 PRACTICE WIDGET — self-contained so timer re-renders only this component

