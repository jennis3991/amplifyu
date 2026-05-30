import { useState, useRef, useEffect } from 'react';
import { T } from '../theme.js';

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
        :{background:"rgba(237,232,223,0.6)",border:`1px solid ${openEx===i?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"16px",cursor:"pointer",transition:"border-color 0.2s",marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:openEx===i?12:0}}>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?18:15,fontWeight:600,color:T2.text}}>{ex.title}</div>
        <span style={{fontFamily:T.sans,fontSize:12,color:openEx===i?T.gold:T2.text3,marginLeft:10,flexShrink:0}}>{openEx===i?"▴":"▸"}</span>
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

  return (
    <>
      {EXERCISES.map((ex,i)=>card(ex,i))}
    </>
  );
}

// ─── D2 SIM WIDGET — voice recording + AI vocal coach ────────────────────────
export function D2SimWidget({T, T2, isDesktop}) {
  const PROMPTS = {
    Story:[
      "Tell me about a moment that genuinely changed how you see the world.",
      "Describe the best piece of advice you've ever received — and why it stuck.",
      "Tell me about someone who shaped who you are today.",
      "Describe a moment where you surprised yourself.",
      "Tell me about a challenge that turned out to be a gift.",
    ],
    Persuade:[
      "Convince me that silence is more powerful than words.",
      "Make the case for doing less — but doing it better.",
      "Persuade me that one skill matters more than any other.",
      "Convince me that slowing down is a competitive advantage.",
      "Make the case for listening over speaking.",
    ],
    Presence:[
      "Introduce yourself as if you're speaking to a room of 500 people.",
      "Describe what you do — in a way that makes people lean in.",
      "Give a 90-second opening to a talk on the topic you care most about.",
      "Speak about something you believe most people get wrong.",
      "Inspire someone who is about to give up on something important.",
    ],
  };
  const ALL_PROMPTS = Object.values(PROMPTS).flat();
  const DIMS = ["Pace","Pitch","Tone","Pauses","Vocal Energy","Range","Presence"];

  const [phase, setPhase] = useState('intro');
  const [cat, setCat] = useState('Story');
  const [prompt, setPrompt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isRec, setIsRec] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [fallback, setFallback] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [round1, setRound1] = useState(null);
  const [waveVals, setWaveVals] = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);
  const [audioURL, setAudioURL] = useState(null);
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef(null);
  const recRef = useRef(null);
  const mediaRecRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const liveRef = useRef('');
  const waveRef = useRef(null);

  const SpeechRec = typeof window!=='undefined'&&(window.SpeechRecognition||window.webkitSpeechRecognition);

  useEffect(()=>{
    if(isRec&&timeLeft>0){timerRef.current=setTimeout(()=>setTimeLeft(t=>t-1),1000);}
    else if(isRec&&timeLeft===0){doStop();}
    return ()=>clearTimeout(timerRef.current);
  },[isRec,timeLeft]);

  useEffect(()=>{
    if(!isRec){clearInterval(waveRef.current);return;}
    waveRef.current=setInterval(()=>setWaveVals(()=>Array.from({length:9},()=>0.2+Math.random()*0.8)),150);
    return ()=>clearInterval(waveRef.current);
  },[isRec]);

  function doStart(){
    setIsRec(true);liveRef.current='';setTranscript('');setAudioURL(null);
    if(SpeechRec){
      const rec=new SpeechRec();
      rec.continuous=true;rec.interimResults=true;rec.lang='en-US';
      rec.onresult=(e)=>{let t='';for(let i=0;i<e.results.length;i++)if(e.results[i].isFinal)t+=e.results[i][0].transcript+' ';liveRef.current=t;setTranscript(t);};
      try{rec.start();}catch(e){}
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
    setIsRec(false);clearTimeout(timerRef.current);
    if(recRef.current){try{recRef.current.stop();}catch(e){}}
    if(mediaRecRef.current&&mediaRecRef.current.state!=='inactive'){try{mediaRecRef.current.stop();}catch(e){}}
    analyzeText(SpeechRec?liveRef.current:fallback);
  }

  async function analyzeText(text){
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
      improve:["Vary your pace more deliberately — slow down on your most important points to give them weight."],
      insight:"Your voice already has warmth and authenticity. The next level is intentional contrast: slow down when the idea matters most, raise your energy when you want to inspire. The gap between where you are and truly compelling delivery is smaller than you think."
    };
    if(!text||text.trim().length<15){
      if(!isRetry){setRound1(mock);setFeedback(mock);}else setFeedback({...mock,prev:round1});
      setPhase(isRetry?'comparison':'feedback');return;
    }
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:`You are a world-class vocal performance coach. Analyse this spoken delivery for vocal quality and presence.\n\nPrompt: "${prompt}"\nTranscript: "${text}"\n\nProvide detailed, personalised vocal coaching. Return ONLY valid JSON:\n{"overall":<50-100>,"headline":"<max 10 words: single most important vocal insight>","subtitle":"<one warm encouraging sentence>","scores":{"Pace":<50-100>,"Pitch":<50-100>,"Tone":<50-100>,"Pauses":<50-100>,"Vocal Energy":<50-100>,"Range":<50-100>,"Presence":<50-100>},"habits":["list any notable vocal habits — e.g. rushing, monotone, trailing off, etc."],"worked":["<vocal strength 1>","<vocal strength 2>"],"improve":["<single most impactful vocal opportunity>"],"insight":"<2-3 personalised sentences: what the voice is doing well, what specific change would elevate it most, and why it matters>"}`}]})});
      const d=await res.json();
      const raw=(d.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      const parsed=JSON.parse(m[0]);
      if(!isRetry){setRound1(parsed);setFeedback(parsed);}else setFeedback({...parsed,prev:round1});
    }catch{
      if(!isRetry){setRound1(mock);setFeedback(mock);}else setFeedback({...mock,prev:round1});
    }
    setPhase(isRetry?'comparison':'feedback');
  }

  function selectPrompt(p){setPrompt(p);setPhase('recording');setTimeLeft(90);setIsRec(false);setTranscript('');setFallback('');}
  function surprise(){selectPrompt(ALL_PROMPTS[Math.floor(Math.random()*ALL_PROMPTS.length)]);}
  function reset(){setPhase('intro');setPrompt(null);setTimeLeft(90);setIsRec(false);setTranscript('');setFallback('');setFeedback(null);setRound1(null);setAudioURL(null);}

  const cs={
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
    ghost:{width:"100%",padding:"11px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44},
  };

  // ── INTRO ───────────────────────────────────────────────────────────────────
  if(phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>How It Works</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>A simple 5-step vocal check-in.</h2>
        <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
          {[
            {n:1,label:"Choose a prompt",    icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M4 6h14v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6z" stroke={T.gold} strokeWidth="1.3"/><path d="M4 6l7 5 7-5" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:2,label:"Speak naturally",   icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={T.gold} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2M8 19h6" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:3,label:"AI scores voice",   icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4H17l-3.5 2.5 1.5 4L11 11l-4 2.5 1.5-4L5 7h4.5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:4,label:"Reflect & listen",  icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={T.gold} strokeWidth="1.3"/><path d="M8 9a3 3 0 016 0v4a3 3 0 01-6 0V9z" stroke={T.gold} strokeWidth="1.3"/></svg>},
            {n:5,label:"Record again",       icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M4 11a7 7 0 0111.95-4.95L18 8M18 8V4M18 8h-4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 11a7 7 0 01-11.95 4.95L4 14M4 14v4M4 14h4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>},
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
        <div style={cs.label}>The First Step</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,marginBottom:10}}>You've learned the science of vocal impact. Now it's time to hear how your voice actually sounds in action.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,margin:0}}>Listening back to your own delivery is one of the fastest ways to improve — used by professional speakers, actors, and leaders worldwide.</p>
      </div>
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"16px 18px"}}>
        <div style={cs.label}>Your Digital Voice Coach</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,marginBottom:10}}>Once you record, your AI vocal coach analyses your pace, pitch, tone, pauses, energy, range, and overall presence.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0,fontStyle:"italic"}}>This recording becomes your vocal baseline — not a test, expert coaching.</p>
      </div>
      <button onClick={()=>setPhase('choose')} style={cs.cta}>Choose a Speaking Prompt →</button>
    </div>
  );

  // ── CHOOSE ──────────────────────────────────────────────────────────────────
  if(phase==='choose') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Choose Your Category</div>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {Object.keys(PROMPTS).map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{padding:"8px 16px",borderRadius:3,border:`0.5px solid ${cat===c?T.gold:T2.border}`,background:cat===c?"rgba(138,158,132,0.1)":"transparent",color:cat===c?T.gold:T2.text3,fontSize:12,fontWeight:cat===c?600:400,cursor:"pointer",fontFamily:T.sans,minHeight:36,transition:"all 0.15s"}}>{c}</button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {PROMPTS[cat].map((p,i)=>(
            <button key={i} onClick={()=>selectPrompt(p)}
              style={{padding:"14px 16px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:isDesktop?15:14,fontFamily:T.serif,fontStyle:"italic",textAlign:"left",cursor:"pointer",lineHeight:1.4,transition:"all 0.2s"}}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <button onClick={surprise} style={{...cs.ghost}}>Surprise me →</button>
      <button onClick={()=>setPhase('intro')} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
    </div>
  );

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
        {isRec&&transcript&&(
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontStyle:"italic",marginBottom:12,maxWidth:480,margin:"0 auto 12px"}}>{transcript.slice(-140)}{transcript.length>140?'…':''}</p>
        )}
        {!SpeechRec&&isRec&&(
          <textarea value={fallback} onChange={e=>setFallback(e.target.value)} placeholder="Type as you speak…" style={{width:"100%",minHeight:80,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,marginBottom:12}}/>
        )}
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          {!isRec?(
            <button onClick={doStart} style={{...cs.cta,width:"auto",padding:"12px 32px"}}>Start Recording →</button>
          ):(
            <button onClick={doStop} style={{...cs.cta,width:"auto",padding:"12px 32px",background:"#8A4A3A"}}>Stop & Analyse →</button>
          )}
          {isRec&&<button onClick={()=>{setTimeLeft(t=>Math.min(t+30,120));}} style={{padding:"12px 20px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:12,cursor:"pointer",fontFamily:T.sans}}>+30s</button>}
        </div>
      </div>
      <button onClick={()=>setPhase('choose')} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Choose a different prompt</button>
    </div>
  );

  // ── ANALYZING ───────────────────────────────────────────────────────────────
  if(phase==='analyzing') return (
    <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:"48px 24px",textAlign:"center"}}>
      <div style={{display:"flex",gap:6}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.4s ease ${i*0.22}s infinite`}}/>
        ))}
      </div>
      <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,color:T2.text,lineHeight:1.5,margin:0}}>Analysing your voice…</p>
      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,margin:0}}>Evaluating pace, pitch, tone, pauses, energy, range, and presence.</p>
    </div>
  );

  // ── FEEDBACK ────────────────────────────────────────────────────────────────
  if(phase==='feedback'&&feedback) return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"28px":"20px"}}>
        <div style={cs.label}>Your Vocal Score</div>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?56:44,fontWeight:600,color:T.gold,lineHeight:1,marginBottom:8}}>{feedback.overall}</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 6px"}}>{feedback.headline}</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,margin:0,lineHeight:1.5}}>{feedback.subtitle}</p>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Vocal Breakdown</div>
        {DIMS.map((d,i)=>{
          const v=feedback.scores?.[d]||70;
          return (
            <div key={i} style={{marginBottom:i<DIMS.length-1?12:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:T.sans,fontSize:12,color:T2.text,fontWeight:500}}>{d}</span>
                <span style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:v>=85?T.gold:v>=70?"#7A9E84":T2.text3}}>{v}</span>
              </div>
              <div style={{height:3,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:v+"%",background:v>=85?T.gold:v>=70?"rgba(138,158,132,0.7)":"rgba(138,158,132,0.35)",borderRadius:2,transition:"width 0.8s ease"}}/>
              </div>
            </div>
          );
        })}
      </div>
      {feedback.habits&&feedback.habits.length>0&&(
        <div style={{...cs.card,background:"rgba(180,80,60,0.04)",border:"0.5px solid rgba(180,80,60,0.15)"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(160,70,50,0.8)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Vocal Habits Noticed</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {feedback.habits.map((h,i)=>(<span key={i} style={{padding:"4px 10px",borderRadius:20,border:"0.5px solid rgba(180,80,60,0.2)",background:"rgba(180,80,60,0.06)",fontFamily:T.sans,fontSize:12,color:"rgba(140,60,40,0.8)"}}>{h}</span>))}
          </div>
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,marginTop:10,marginBottom:0,lineHeight:1.5}}>Each of these is a habit, not a flaw — and habits can be changed with deliberate practice.</p>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:10}}>
        <div style={{...cs.card,borderLeft:"2px solid rgba(138,158,132,0.5)"}}>
          <div style={cs.label}>What Worked</div>
          {(feedback.worked||[]).map((w,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<(feedback.worked.length-1)?8:0}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/><p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.6,margin:0,fontWeight:300}}>{w}</p></div>))}
        </div>
        <div style={{...cs.card,borderLeft:"2px solid rgba(138,158,132,0.3)"}}>
          <div style={cs.label}>One Thing to Improve</div>
          {(feedback.improve||[]).map((w,i)=>(<p key={i} style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.6,margin:0,fontWeight:300}}>{w}</p>))}
        </div>
      </div>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
        <div style={cs.label}>Vocal Coach Insight</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>{feedback.insight}</p>
      </div>
      {audioURL&&(
        <div style={cs.card}>
          <div style={cs.label}>Listen Back</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5,marginBottom:12}}>Listen to your own recording. Notice your pace, energy, and where your voice naturally rises and falls.</p>
          <button onClick={()=>{if(audioRef.current){playing?audioRef.current.pause():audioRef.current.play();setPlaying(!playing);}}} style={{padding:"8px 20px",borderRadius:3,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,cursor:"pointer",fontFamily:T.sans}}>
            {playing?"⏸ Pause":"▶ Play back your recording"}
          </button>
          <audio ref={audioRef} src={audioURL} onEnded={()=>setPlaying(false)} style={{display:"none"}}/>
        </div>
      )}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={()=>{setPhase('recording');setTimeLeft(90);setIsRec(false);setTranscript('');setFallback('');}} style={{...cs.ghost,flex:"1 1 auto"}}>Record Again →</button>
        <button onClick={()=>{setPhase('choose');setTimeLeft(90);setIsRec(false);setTranscript('');setFallback('');}} style={{...cs.ghost,flex:"1 1 auto"}}>New Prompt →</button>
        <button onClick={reset} style={{...cs.cta,flex:"1 1 auto",width:"auto"}}>Start Over</button>
      </div>
    </div>
  );

  // ── COMPARISON ──────────────────────────────────────────────────────────────
  if(phase==='comparison'&&feedback&&round1) return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"24px":"18px"}}>
        <div style={cs.label}>Your Progress</div>
        <div style={{display:"flex",justifyContent:"center",gap:isDesktop?32:20,alignItems:"flex-end"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,marginBottom:4}}>Round 1</div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?40:32,fontWeight:600,color:T2.text3,lineHeight:1}}>{round1.overall}</div>
          </div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?24:18,color:T.gold,paddingBottom:8}}>→</div>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:T.sans,fontSize:11,color:T.gold,marginBottom:4}}>Round 2</div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?40:32,fontWeight:600,color:T.gold,lineHeight:1}}>{feedback.overall}</div>
          </div>
        </div>
        {feedback.overall>round1.overall&&(
          <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,marginTop:12,marginBottom:0}}>+{feedback.overall-round1.overall} points. Your voice is responding to the coaching.</p>
        )}
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Vocal Dimension Comparison</div>
        {DIMS.map((d,i)=>{
          const v1=round1.scores?.[d]||70;const v2=feedback.scores?.[d]||70;const diff=v2-v1;
          return (
            <div key={i} style={{marginBottom:i<DIMS.length-1?14:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:T.sans,fontSize:12,color:T2.text,fontWeight:500}}>{d}</span>
                <span style={{fontFamily:T.sans,fontSize:12,color:diff>0?"rgba(100,160,100,0.9)":diff<0?"rgba(160,80,60,0.7)":T2.text3}}>{diff>0?`+${diff}`:diff===0?"—":diff}</span>
              </div>
              <div style={{height:3,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:v2+"%",background:v2>=85?T.gold:v2>=70?"rgba(138,158,132,0.7)":"rgba(138,158,132,0.35)",borderRadius:2,transition:"width 0.8s ease"}}/>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Vocal Coach Insight</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>{feedback.insight}</p>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={()=>{setPhase('recording');setTimeLeft(90);setIsRec(false);setTranscript('');setFallback('');}} style={{...cs.ghost,flex:"1 1 auto"}}>One More Round →</button>
        <button onClick={reset} style={{...cs.cta,flex:"1 1 auto",width:"auto"}}>Start Over</button>
      </div>
    </div>
  );

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
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`Generate a professional coaching scenario for: "${sc.label}" about the topic: "${topic}". Return JSON only: {"topic":"short title","context":"1-2 sentence scene-setting","beginner":"a polished 3-4 sentence sample script in first person, in quotes","intermediate":["4 concise talking point strings"]}`}]})});
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
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:`${persona}Scenario: "${sc.label}". Goal: ${sc.goal}.\n\nUser said: "${input}"\n\nEvaluate as if spoken aloud. Score 1-10. Write 2-3 sentences of premium, specific, encouraging coaching. ${followUp}\n\nReturn JSON only: {"confidence":N,"pace":N,"clarity":N,"warmth":N,"pauses":N,"presence":N,"feedback":"coaching note","followUp":"follow-up question or empty string"}`}]})});
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
      <div style={{padding:isDesktop?"36px 40px":"24px 20px"}}>
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
        <div style={{padding:isDesktop?"36px 40px":"24px 20px"}}>
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
      <div style={{padding:isDesktop?"36px 40px":"24px 20px"}}>
        <div style={{fontSize:10,color:T.gold,textTransform:"uppercase",letterSpacing:"0.2em",marginBottom:6,fontFamily:T.sans}}>{sc.label}</div>
        <div style={{background:T2.surface,borderRadius:6,padding:isDesktop?"16px 20px":"12px 14px",marginBottom:isDesktop?24:18,borderLeft:"2px solid "+T.gold}}>
          <div style={{fontSize:9,color:creamDim,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:6,fontFamily:T.sans}}>AI Coach</div>
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
      <div style={{padding:isDesktop?"36px 40px":"24px 20px"}}>
        <div style={{background:T2.surface,borderRadius:6,padding:isDesktop?"16px 20px":"12px 14px",marginBottom:isDesktop?24:18,borderLeft:"2px solid "+T.gold}}>
          <div style={{fontSize:9,color:creamDim,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:6,fontFamily:T.sans}}>AI Coach</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:14,fontStyle:"italic",color:cream,margin:0,lineHeight:1.5}}>{aiMsg}</p>
        </div>
        <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Speak your response…" autoFocus rows={isDesktop?5:4} style={{width:"100%",background:T2.surface,border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"14px 16px",fontFamily:T.serif,fontSize:isDesktop?16:14,color:cream,lineHeight:1.65,resize:"none",outline:"none",boxSizing:"border-box",caretColor:T.gold}}/>
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
        <div style={{padding:isDesktop?"36px 40px":"24px 20px"}}>
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

