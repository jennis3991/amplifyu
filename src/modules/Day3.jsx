import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';

export function D3SimFeedback({input}) {
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false);
  const fillerWords = ["um","uh","like","you know","sort of","kind of","basically","actually","right?","so,"];
  const countFillers = (s) => fillerWords.reduce((acc,f)=>acc+(s.toLowerCase().match(new RegExp("\\b"+f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+"\\b","g"))||[]).length,0);
  async function analyse() {
    if (!input.trim()) return; setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`Analyse this for filler words. Return JSON: {score:number(1-10),fillerCount:number,topFillers:[string],pauses:number,win:"one strength",rewrite:"same message cleaner and filler-free"}\n\n"${input}"`}]})});
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
  async function go(){if(!v.trim())return;setL(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:`Score for filler-free speech (1-10). Return JSON: {score:number,fillerCount:number,rewrite:"cleaner version"}\n\n"${v}"`}]})});const d=await res.json();const raw=(d.content||[]).map(b=>b.text||"").join("").trim();try{const m=raw.match(/\{[\s\S]*\}/);setR(JSON.parse(m[0]));}catch{setR({score:8,fillerCount:2,rewrite:v.replace(/\bum\b|\buh\b|\blike\b/gi,"").trim()});}}catch{setR(null);}setL(false);}
  return(<div><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Write your 60-second response with no fillers…" style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:100,marginBottom:8,boxSizing:"border-box"}}/><button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?10:0}}>{l?"Analysing…":"Get Filler Score →"}</button>{r&&<div style={{display:"flex",flexDirection:"column",gap:8}}><div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#EDE8DF",borderRadius:3}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:600,color:"#2C2416",lineHeight:1}}>{r.score}<span style={{fontSize:16,color:"#8A9E84"}}>/10</span></span><span style={{fontSize:11,color:"#6B5E44",fontFamily:"'Inter',sans-serif"}}>{r.fillerCount} fillers detected</span></div>{r.rewrite&&<div style={{padding:"10px 12px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:"#2C2416",margin:0,lineHeight:1.6}}>{r.rewrite}</p></div>}</div>}</div>);
}

// ─── D3 Practice Widget ───────────────────────────────────────────────────────
export function D3PracticeWidget({T, T2, isDesktop, onNavLabel, onNavFn, onSimulation}) {
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(()=>{
    if (!onNavLabel) return;
    if (phase === 'intro') {
      if (onNavFn) onNavFn.current = ()=>{ setPhase('playing'); setRound(0); setSelected(null); setShowFeedback(false); };
      onNavLabel('Begin Challenge');
    } else if (phase === 'done') {
      if (onNavFn) onNavFn.current = onSimulation || null;
      onNavLabel(onSimulation ? 'Simulation →' : null);
    } else {
      if (onNavFn) onNavFn.current = null;
      onNavLabel(null);
    }
  }, [phase]);

  const ROUNDS = [
    {
      title:"SILENCE FEELS LONGER TO YOU",
      prompt:"Say this sentence out loud:",
      quote:'"The most important part of communication is…"',
      instruction:'Pause. Count slowly to 3 in your head.',
      quote2:'"…making people feel understood."',
      question:"Did the pause feel awkward?",
      options:[
        {label:"Yes, it felt very long",correct:false},
        {label:"A little, but I pushed through",correct:true},
        {label:"No, it felt completely natural",correct:false},
      ],
      feedback:"Pauses feel longer to the speaker than to the audience. To listeners, intentional pauses feel thoughtful, calm, and controlled. Great communicators allow ideas space to land.",
    },
    {
      title:"FILLERS VS PAUSES",
      prompt:"Read these two versions out loud.",
      quote:null,
      instruction:null,
      versions:[
        {label:"Version A", text:'"So um… I think we should probably like… start next week."'},
        {label:"Version B", text:'"I think we should start next week." [pause] "Then review progress together."'},
      ],
      question:"Which version feels calmer, clearer, and more confident?",
      options:[
        {label:"Version A",correct:false},
        {label:"Version B",correct:true},
      ],
      feedback:"The brain processes pauses more easily than filler words. Silence creates clarity. Version B communicates the same idea — with far more authority.",
    },
    {
      title:"REPLACE THE FILLER",
      prompt:"Complete this sentence without using um, like, you know, or basically:",
      quote:'"What I really learned from this experience was…"',
      instruction:"Take a breath before you speak. Let the pause do its job. Then finish the sentence in one clear, direct thought.",
      options:null,
      action:"I said it without fillers",
      feedback:"A pause gives your brain time to think without adding noise to the message. Breathing before speaking reduces rushed delivery and creates calmer pacing.",
    },
    {
      title:"REMOVE THE NOISE",
      prompt:"Which is the clean version?",
      quote:'"So I was like really excited because um the idea was basically finally working."',
      instruction:null,
      question:null,
      options:[
        {label:"So I was like really excited because um the idea was basically finally working.",correct:false},
        {label:"I was really excited because the idea was finally working.",correct:true},
      ],
      feedback:"Removing filler words increases clarity instantly. Shorter, cleaner sentences feel easier to follow — and far more confident.",
    },
    {
      title:"THOUGHTFUL VS RUSHED",
      prompt:"Which speaker sounds more thoughtful?",
      quote:null,
      instruction:null,
      question:null,
      options:[
        {label:"Fast delivery with fillers",correct:false},
        {label:"Slightly slower delivery with pauses",correct:true},
      ],
      feedback:"Rushing increases cognitive load for your listener. Pauses reduce communication friction. A slightly slower pace with intentional silence signals calm, confidence, and control.",
    },
    {
      title:"THE BREATH RESET",
      prompt:"Before answering, take one calm breath.",
      quote:'"Here\'s what I\'d recommend."',
      instruction:"Inhale. Pause. Then say the sentence slowly and clearly. Notice how the breath changes your pacing.",
      options:null,
      action:"I took the breath and said it",
      feedback:"Breathing before speaking calms the nervous system and creates mental clarity. In that moment, you give yourself the best possible chance of a strong, filler-free response.",
    },
  ];

  const cs = {
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };

  if (phase === 'intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Mission</div>
        <p style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,margin:"0 0 8px"}}>
          Replace fillers with calm, intentional communication.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          {["Notice when fillers appear — and why.","Use the pause as your most powerful tool.","Speak with calm, declarative confidence."].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:6,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:11,flexShrink:0,marginTop:2}}>✦</span>
              <span style={{fontFamily:T.serif,fontSize:isDesktop?16:15,fontStyle:"italic",color:T2.text,lineHeight:1.5}}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>The Challenge Journey</div>
        <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
          {[
            {n:1,label:"Silence Feels Longer"},
            {n:2,label:"Fillers vs Pauses"},
            {n:3,label:"Replace the Filler"},
            {n:4,label:"Remove the Noise"},
            {n:5,label:"Thoughtful vs Rushed"},
            {n:6,label:"The Breath Reset"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?38:32,height:isDesktop?38:32,borderRadius:"50%",border:"1.5px solid "+(i===0?T.gold:"rgba(138,158,132,0.45)"),background:i===0?"rgba(138,158,132,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:5}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?13:11,fontWeight:700,color:i===0?T.gold:T2.text3}}>{r.n}</span>
                </div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?12:10,color:T2.text3,fontWeight:500,textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?72:50}}>{r.label}</div>
              </div>
              {i<5 && <div style={{height:1,width:isDesktop?8:3,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:20}}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>How You Win</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>Earn points for:</p>
        <div style={{display:"flex",gap:isDesktop?8:6,flexWrap:"wrap"}}>
          {["Calmness","Clarity","Presence","Intentional Pausing"].map((s,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:isDesktop?"10px 12px":"8px 10px",background:T2.bg,borderRadius:6,border:"0.5px solid "+T2.border,flex:1,minWidth:isDesktop?70:56}}>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:11,color:"#A8998A",fontWeight:400,textAlign:"center",lineHeight:1.3}}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={()=>{setPhase('playing');setRound(0);setSelected(null);setShowFeedback(false);}} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Start the Filler-Free Challenge →</button>
    </div>
  );

  if (phase === 'playing') {
    const r = ROUNDS[round];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",flexShrink:0}}>Round {round+1} of {ROUNDS.length}</div>
          <div style={{flex:1,height:2,background:T2.border,borderRadius:2}}>
            <div style={{height:"100%",width:(((round+1)/ROUNDS.length)*100)+"%",background:T.gold,borderRadius:2,transition:"width 0.4s ease"}}/>
          </div>
        </div>

        <div style={cs.card}>
          <div style={cs.label}>{r.title}</div>
          {r.prompt && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,marginBottom:12,lineHeight:1.5}}>{r.prompt}</p>}
          {r.quote && <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 12px"}}>{r.quote}</p>}
          {r.versions && (
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
              {r.versions.map((v,i)=>(
                <div key={i} style={{padding:"12px 14px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
                  <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{v.label}</div>
                  <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,color:T2.text,lineHeight:1.4,margin:0}}>{v.text}</p>
                </div>
              ))}
            </div>
          )}
          {r.instruction && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,margin:r.quote2?"0 0 12px":0}}>{r.instruction}</p>}
          {r.quote2 && <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:0}}>{r.quote2}</p>}
          {r.question && !showFeedback && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,lineHeight:1.5,marginTop:14,marginBottom:0}}>{r.question}</p>}
        </div>

        {r.options && !showFeedback && (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {r.options.map((opt,i)=>(
              <button key={i} onClick={()=>{setSelected(i);setShowFeedback(true);}}
                style={{padding:"14px 16px",borderRadius:4,border:`0.5px solid ${selected===i?(opt.correct?T.gold:"rgba(180,80,60,0.5)"):T2.border}`,background:selected===i?(opt.correct?"rgba(138,158,132,0.08)":"rgba(180,80,60,0.04)"):"transparent",color:T2.text,fontSize:isDesktop?15:14,fontFamily:T.sans,textAlign:"left",cursor:"pointer",lineHeight:1.5,transition:"all 0.2s"}}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {!r.options && !showFeedback && (
          <button onClick={()=>setShowFeedback(true)} style={cs.cta}>{r.action} →</button>
        )}

        {showFeedback && (
          <>
            <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
              <div style={cs.label}>Coaching Note</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.65,margin:0}}>{r.feedback}</p>
            </div>
            <button onClick={()=>{
              if (round < ROUNDS.length-1){setRound(v=>v+1);setSelected(null);setShowFeedback(false);}
              else {setPhase('done');}
            }} style={cs.cta}>
              {round < ROUNDS.length-1 ? `Round ${round+2}: ${ROUNDS[round+1].title} →` : "See Your Results →"}
            </button>
          </>
        )}
      </div>
    );
  }

  if (phase === 'done') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"32px":"24px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Challenge Complete</div>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>The Silent Expert</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:"#A8998A",lineHeight:1.65,margin:"0 0 24px"}}>You've practised the pause, recognised filler patterns, and replaced noise with calm intention. These habits compound every time you speak.</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"Silence often sounds more confident than fillers."</p>
      </div>
      <button onClick={()=>{setPhase('intro');setRound(0);setSelected(null);setShowFeedback(false);}} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"8px 0",textAlign:"center",width:"100%",letterSpacing:"0.2px"}}>Practise again</button>
    </div>
  );

  return null;
}

// ─── D3 Simulation Widget ─────────────────────────────────────────────────────
export function D3SimWidget({T, T2, isDesktop}) {
  const DIMS = ["Calm Pacing","Pause Control","Verbal Clarity","Conversational Flow","Speaking Presence","Thought Completion"];
  const PROMPT = "Introduce your favourite meal, explain why it's your favourite, then teach me how to make it in 90 seconds.";

  const [phase, setPhase] = useState('intro');
  const [timeLeft, setTimeLeft] = useState(90);
  const [isRec, setIsRec] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [fallback, setFallback] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
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
      overall:Math.floor(Math.random()*18)+65+base,
      headline:"Your explanation had a natural, conversational rhythm.",
      subtitle:isRetry?"Noticeable improvement. Your pauses are landing.":"A natural starting point — awareness is already working.",
      scores:Object.fromEntries(DIMS.map(d=>[d,Math.floor(Math.random()*22)+62+base])),
      fillers:[],
      worked:["Conversational and easy to follow","Good personal connection to the topic"],
      improve:["When you feel a filler coming, pause instead — silence carries more authority."],
      insight:"Your explanation was natural and warm. The key opportunity is pause control: every time you'd normally say 'um' or 'like', a breath creates far more impact."
    };
    if(!text||text.trim().length<15){
      if(!isRetry){setRound1(mock);setFeedback(mock);}else setFeedback({...mock,prev:round1});
      setPhase(isRetry?'comparison':'feedback');return;
    }
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:`You are a world-class communication coach specialising in filler-free speech. Analyse this spoken explanation for filler word usage, pacing, and pause control.\n\nPrompt: "${PROMPT}"\nTranscript: "${text}"\n\nReturn ONLY valid JSON:\n{"overall":<50-100>,"headline":"<max 10 words: single most important insight>","subtitle":"<one warm encouraging sentence>","scores":{"Calm Pacing":<50-100>,"Pause Control":<50-100>,"Verbal Clarity":<50-100>,"Conversational Flow":<50-100>,"Speaking Presence":<50-100>,"Thought Completion":<50-100>},"fillers":["list each distinct filler word or phrase found, e.g. um, uh, like, you know, basically, sort of, kind of, right"],"fillerCount":<total number of filler instances>,"worked":["<vocal strength 1>","<vocal strength 2>"],"improve":["<single clearest filler-reduction opportunity>"],"insight":"<2-3 personalised sentences about filler patterns, pause technique, and what specific change will help most>"}`}]})});
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

  const [selectedFocus, setSelectedFocus] = useState([]);
  const FOCUS=["Replace 'um' with pause","Slow your opening","Fewer 'like' words","Finish sentences cleanly","Breathe before speaking","No 'basically'","Cut the 'you know's"];

  function reset(){setPhase('intro');setTimeLeft(90);setIsRec(false);setTranscript('');setFallback('');setFeedback(null);setRound1(null);setAudioURL(null);setSelectedFocus([]);}

  function togglePlay(){
    if(!audioURL){setPlaying(p=>!p);return;}
    if(!audioRef.current)audioRef.current=new Audio(audioURL);
    if(playing){audioRef.current.pause();setPlaying(false);}
    else{audioRef.current.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false));}
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
      {/* HOW IT WORKS */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>How It Works</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>A simple 5-step filler-free check-in.</h2>
        <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
          {[
            {n:1,label:"Read the prompt",    icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M4 6h14v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6z" stroke={T.gold} strokeWidth="1.3"/><path d="M4 6l7 5 7-5" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:2,label:"Breathe & speak",    icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={T.gold} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2M8 19h6" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:3,label:"AI detects fillers", icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4H17l-3.5 2.5 1.5 4L11 11l-4 2.5 1.5-4L5 7h4.5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:4,label:"Reflect & learn",    icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={T.gold} strokeWidth="1.3"/><path d="M8 9a3 3 0 016 0v4a3 3 0 01-6 0V9z" stroke={T.gold} strokeWidth="1.3"/></svg>},
            {n:5,label:"Try again",           icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M4 11a7 7 0 0111.95-4.95L18 8M18 8V4M18 8h-4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 11a7 7 0 01-11.95 4.95L4 14M4 14v4M4 14h4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>},
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
      {/* THE FIRST STEP */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"16px 18px"}}>
        <div style={cs.label}>The First Step</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,marginBottom:10}}>
          You've learned the science. Practised the techniques. Now it's time to speak — and notice your patterns.
        </p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,margin:0}}>
          Self-review is one of the fastest proven ways to reduce fillers. Awareness is 80% of the fix.
        </p>
      </div>
      {/* YOUR DIGITAL COACH */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"16px 18px"}}>
        <div style={cs.label}>Your Digital Coach</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,marginBottom:10}}>
          Your AI coach will analyse your filler frequency, pacing, pause control, and conversational clarity.
        </p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0,fontStyle:"italic"}}>
          This recording becomes your baseline — not a test, expert coaching.
        </p>
      </div>
      <button onClick={()=>setPhase('recording')} style={cs.cta}>Start the Simulation →</button>
    </div>
  );

  // ── RECORDING ────────────────────────────────────────────────────────────────
  if(phase==='recording') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Your Prompt</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T2.text,lineHeight:1.3,marginBottom:0}}>{PROMPT}</p>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Before You Begin</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {["Take one calm breath.","Slow down slightly — pauses are welcome.","If you lose your train of thought, pause instead of filling.","Your goal is clarity, not speed."].map((tip,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{...cs.card,textAlign:"center"}}>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?48:36,fontWeight:600,color:isRec?T.gold:T2.text,lineHeight:1,marginBottom:8,transition:"color 0.3s"}}>
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
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontStyle:"italic",marginBottom:12,maxWidth:480,margin:"0 auto 12px"}}>{transcript.slice(-120)}{transcript.length>120?'…':''}</p>
        )}
        {!SpeechRec&&isRec&&(
          <textarea value={fallback} onChange={e=>setFallback(e.target.value)} placeholder="Type as you speak…" style={{width:"100%",minHeight:80,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,marginBottom:12}}/>
        )}
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          {!isRec?(
            <button onClick={doStart} style={{...cs.cta,width:"auto",padding:"12px 32px"}}>Start Recording →</button>
          ):(
            <button onClick={doStop} style={{...cs.cta,width:"auto",padding:"12px 32px",background:"#8A4A3A"}}>Stop & Analyse →</button>
          )}
        </div>
      </div>
      <button onClick={reset} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
    </div>
  );

  // ── ANALYZING ────────────────────────────────────────────────────────────────
  if(phase==='analyzing') return (
    <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:"48px 24px",textAlign:"center"}}>
      <div style={{display:"flex",gap:6}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.4s ease ${i*0.22}s infinite`}}/>
        ))}
      </div>
      <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,color:T2.text,lineHeight:1.5,margin:0}}>Analysing your delivery…</p>
      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,margin:0}}>Detecting fillers, pacing, pause control.</p>
    </div>
  );

  // ── FEEDBACK + COMPARISON ────────────────────────────────────────────────────
  if((phase==='feedback'||phase==='comparison')&&feedback) {
    const isComparison=phase==='comparison';
    const RANGLES=DIMS.map((_,i)=>-90+i*(360/DIMS.length));
    const cx=100,cy=100,rMax=72;
    const rPt=(sc,aDeg)=>{const a=aDeg*Math.PI/180;return[cx+(sc/100)*rMax*Math.cos(a),cy+(sc/100)*rMax*Math.sin(a)];};
    const gridPoly=(pct)=>RANGLES.map(a=>{const[x,y]=rPt(100,a);return`${(cx+(x-cx)*pct).toFixed(1)},${(cy+(y-cy)*pct).toFixed(1)}`;}).join(' ');
    const dataPoly=DIMS.map((d,i)=>{const[x,y]=rPt(feedback.scores?.[d]||50,RANGLES[i]);return`${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ');
    const WBARS=Array.from({length:60},(_,i)=>Math.max(0.08,Math.min(1,Math.sin(i/59*Math.PI)*0.65+0.25+Math.sin(i*4.7)*0.13+Math.cos(i*2.3)*0.11)));
    const MARKERS=[{pos:0.18,label:"Filler cluster",color:"#C8A46A"},{pos:0.42,label:"Clean delivery",color:"#527060"},{pos:0.63,label:"Rush moment",color:"#B05C4A"},{pos:0.84,label:"Strong pause",color:"#527060"}];
    const scoreColor=s=>s>=80?T.gold:s>=70?"#7A9E84":T2.text3;
    const fillerCount=feedback.fillerCount||(feedback.fillers?.length||0);
    return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      {/* 1 HERO — Filler Mirror */}
      <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"28px 32px":"22px 20px",border:"0.5px solid rgba(138,158,132,0.15)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(138,158,132,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(138,158,132,0.7)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>{isComparison?"Your Filler Progress":"Your Filler Mirror"}</div>
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
              <p style={{fontFamily:T.serif,fontSize:isDesktop?24:19,fontWeight:600,color:"#F5EFE6",lineHeight:1.25,margin:"0 0 8px"}}>{feedback.headline||"Your delivery showed real awareness."}</p>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.55)",margin:0,lineHeight:1.5}}>{feedback.subtitle||"A natural starting point. Now let's sharpen it."}</p>
            </div>
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={togglePlay} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:"rgba(245,239,230,0.08)",border:"0.5px solid rgba(245,239,230,0.2)",borderRadius:4,color:"#F5EFE6",fontFamily:T.serif,fontSize:13,cursor:"pointer",flexShrink:0}}>
            {playing?<svg width="10" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="3" height="10" fill="#F5EFE6" rx="1"/><rect x="8" y="1" width="3" height="10" fill="#F5EFE6" rx="1"/></svg>:<svg width="10" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 1l9 5-9 5V1z" fill="#F5EFE6"/></svg>}
            {playing?"Pause":"Play my recording"}
          </button>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:1,height:24,overflow:"hidden"}}>
            {WBARS.map((h,i)=><div key={i} style={{flex:1,background:`rgba(138,158,132,${0.25+h*0.35})`,borderRadius:1,height:Math.round(h*22)+"px",minWidth:2}}/>)}
          </div>
        </div>
        {audioURL&&<audio ref={audioRef} src={audioURL} onEnded={()=>setPlaying(false)} style={{display:"none"}}/>}
      </div>
      {/* 2 FILLERS DETECTED — prominent for Day 3 */}
      <div style={{...cs.card,background:fillerCount===0?"rgba(82,112,96,0.06)":"rgba(200,164,106,0.06)",border:`0.5px solid ${fillerCount===0?"rgba(82,112,96,0.25)":"rgba(200,164,106,0.25)"}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:fillerCount>0?12:0}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:fillerCount===0?"#527060":"#B07A40",textTransform:"uppercase",letterSpacing:"2px"}}>{fillerCount===0?"Zero Fillers Detected":"Fillers Detected"}</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?28:24,fontWeight:600,color:fillerCount===0?T.gold:"#B07A40",lineHeight:1}}>{fillerCount}<span style={{fontFamily:T.sans,fontSize:12,fontWeight:400,color:T2.text3,marginLeft:4}}>total</span></div>
        </div>
        {fillerCount===0?(
          <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T.gold,margin:0,lineHeight:1.5}}>Outstanding. A filler-free delivery signals calm, confidence, and complete control.</p>
        ):(
          <>
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
              {(feedback.fillers||[]).map((f,i)=>(<span key={i} style={{padding:"5px 12px",borderRadius:20,border:"0.5px solid rgba(200,164,106,0.35)",background:"rgba(200,164,106,0.08)",fontFamily:T.sans,fontSize:13,color:"#8A6020",fontWeight:500}}>{f}</span>))}
            </div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:0,lineHeight:1.5}}>Each filler can be replaced with a calm pause. Record again and swap these for silence — listeners won't notice the gap, but they will notice the confidence.</p>
          </>
        )}
      </div>
      {/* 3 FILLER PROFILE */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>Your Filler Profile</div>
        <div style={{display:isDesktop?"flex":"block",gap:24,alignItems:"center"}}>
          <div style={{flexShrink:0,display:"flex",justifyContent:"center"}}>
            <svg viewBox="0 0 200 200" width={isDesktop?200:170} height={isDesktop?200:170}>
              {[0.25,0.5,0.75,1].map((p,i)=><polygon key={i} points={gridPoly(p)} fill="none" stroke={T2.border} strokeWidth={p===1?"0.8":"0.5"}/>)}
              {RANGLES.map((a,i)=>{const[x,y]=rPt(100,a);return<line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke={T2.border} strokeWidth="0.5"/>;})}
              <polygon points={dataPoly} fill="rgba(138,158,132,0.18)" stroke="rgba(82,112,96,0.7)" strokeWidth="1.5"/>
              {DIMS.map((d,i)=>{const[x,y]=rPt(feedback.scores?.[d]||50,RANGLES[i]);return<circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3" fill={T.gold} opacity="0.9"/>;})}
              {DIMS.map((d,i)=>{const[x,y]=rPt(116,RANGLES[i]);const anch=x<cx-4?"end":x>cx+4?"start":"middle";return<text key={i} x={x.toFixed(1)} y={y.toFixed(1)} textAnchor={anch} dominantBaseline="middle" style={{fontFamily:"'Inter',sans-serif",fontSize:"7.5px",fill:"rgba(44,36,22,0.55)",fontWeight:500}}>{d}</text>;})}
            </svg>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:10,marginTop:isDesktop?0:10}}>
            {DIMS.map((d,i)=>{const sc=feedback.scores?.[d]||50;const prev=round1?.scores?.[d];const diff=prev?sc-prev:null;return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text,width:isDesktop?110:90,flexShrink:0}}>{d}</span>
                <div style={{flex:1,height:4,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:sc+"%",background:"linear-gradient(90deg,rgba(138,158,132,0.5),rgba(82,112,96,0.85))",borderRadius:2,transition:"width 1s ease"}}/>
                </div>
                <span style={{fontFamily:T.serif,fontSize:isDesktop?13:12,fontWeight:600,color:scoreColor(sc),width:24,textAlign:"right",flexShrink:0}}>{sc}</span>
                {diff!==null&&<span style={{fontFamily:T.sans,fontSize:10,color:diff>0?"rgba(82,112,96,0.9)":diff<0?"rgba(160,80,60,0.7)":T2.text4,width:22,flexShrink:0}}>{diff>0?`+${diff}`:diff===0?"":diff}</span>}
              </div>
            );})}
          </div>
        </div>
      </div>
      {/* 4 WHAT CAME ACROSS WELL + BIGGEST OPPORTUNITY */}
      <div style={{display:isDesktop?"grid":"flex",gridTemplateColumns:"1fr 1fr",flexDirection:"column",gap:isDesktop?12:10}}>
        <div style={{...cs.card,padding:isDesktop?"20px 22px":"16px 18px"}}>
          <div style={cs.label}>What came across well</div>
          {[
            {icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="12" rx="2" stroke={T2.text3} strokeWidth="1.2"/><path d="M3 9h16M7 5v12" stroke={T2.text3} strokeWidth="1.2"/></svg>,text:feedback.worked?.[0]||"Natural, conversational delivery",sub:"Your tone felt authentic and easy to follow."},
            {icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke={T2.text3} strokeWidth="1.2"/><path d="M4 19c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={T2.text3} strokeWidth="1.2" strokeLinecap="round"/></svg>,text:feedback.worked?.[1]||"Good use of pauses",sub:"You created space for ideas to land."},
            {icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 3C7 3 3.5 6 3.5 10c0 2.5 1.3 4.7 3.3 6l-1 3 3.2-1.2C10 18 10.5 18 11 18c4 0 7.5-3.6 7.5-8S15 3 11 3z" stroke={T2.text3} strokeWidth="1.2"/></svg>,text:"Engaging throughout",sub:"You kept the listener interested."},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<2?12:0,paddingBottom:i<2?12:0,borderBottom:i<2?"0.5px solid "+T2.divider:"none"}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:T2.bg,border:"0.5px solid "+T2.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{item.icon}</div>
              <div>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,marginBottom:2}}>{item.text}</div>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?12:11,color:T2.text3,lineHeight:1.4}}>{item.sub}</div>
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
              <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 8px"}}>Replace fillers with intentional pauses.</p>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:0}}>{feedback.improve?.[0]||"Every 'um' or 'like' can be swapped for a breath. Silence signals control."}</p>
            </div>
          </div>
        </div>
      </div>
      {/* 5 AI COACH SAYS */}
      <div style={{...cs.card,padding:isDesktop?"22px 28px":"18px 20px"}}>
        <div style={cs.label}>Your AI Coach Says</div>
        <div style={{display:"flex",gap:isDesktop?18:12,alignItems:"flex-start"}}>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?44:34,color:T.gold,lineHeight:0.8,flexShrink:0,marginTop:4,opacity:0.5}}>"</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.7,margin:0,flex:1}}>{feedback.insight}</p>
          <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"1px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,alignSelf:"flex-end"}}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 2l1.5 4H15l-3.75 2.75 1.5 4.5L9 11l-3.75 2.75 1.5-4.5L3 6h4.5z" stroke={T.gold} strokeWidth="1.1" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
      {/* 6 HEAR IT BACK */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>Hear it back</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={togglePlay} style={{width:40,height:40,borderRadius:"50%",border:"none",background:T2.text,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
            {playing?<svg width="12" height="14" viewBox="0 0 12 14"><rect x="0" y="0" width="4" height="14" fill={T.bg} rx="1"/><rect x="8" y="0" width="4" height="14" fill={T.bg} rx="1"/></svg>:<svg width="12" height="14" viewBox="0 0 12 14"><path d="M1 1l10 6-10 6V1z" fill={T.bg}/></svg>}
          </button>
          <div style={{flex:1,position:"relative"}}>
            <div style={{display:"flex",position:"relative",height:isDesktop?20:16,marginBottom:4}}>
              {MARKERS.map((m,i)=>(
                <div key={i} style={{position:"absolute",left:(m.pos*100)+"%",transform:"translateX(-50%)",textAlign:"center",zIndex:2}}>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?9:7,color:m.color,fontWeight:600,whiteSpace:"nowrap"}}>{m.label}</div>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?8:6,color:T2.text4,whiteSpace:"nowrap"}}>{["0:11","0:25","0:38","0:50"][i]}</div>
                </div>
              ))}
            </div>
            <div style={{height:36,display:"flex",alignItems:"center",gap:1,position:"relative",overflow:"hidden",borderRadius:4}}>
              {WBARS.map((h,i)=>{const pos=i/WBARS.length;const nm=MARKERS.find(m=>Math.abs(m.pos-pos)<0.04);return<div key={i} style={{flex:1,background:nm?nm.color:`rgba(138,158,132,${0.3+h*0.4})`,borderRadius:1,height:Math.round(h*32)+"px",minWidth:2}}/>;} )}
              {MARKERS.map((m,i)=><div key={i} style={{position:"absolute",left:(m.pos*100)+"%",top:0,bottom:0,width:2,background:m.color,opacity:0.6}}/>)}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
              <span style={{fontFamily:T.sans,fontSize:9,color:T2.text4}}>0:00</span>
              <span style={{fontFamily:T.sans,fontSize:9,color:T2.text4}}>1:00</span>
            </div>
          </div>
        </div>
      </div>
      {/* 7 FOCUS NEXT ROUND */}
      <div style={{...cs.card,padding:isDesktop?"20px 22px":"16px 18px"}}>
        <div style={cs.label}>Focus next round</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {FOCUS.map((f,i)=>{const sel=selectedFocus.includes(f);return(
            <button key={i} onClick={()=>setSelectedFocus(sf=>sel?sf.filter(x=>x!==f):[...sf,f])} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,border:`0.5px solid ${sel?T.gold:T2.border}`,background:sel?"rgba(138,158,132,0.1)":"transparent",color:sel?T.gold:T2.text,fontFamily:T.serif,fontSize:isDesktop?13:12,cursor:"pointer",transition:"all 0.15s",fontWeight:sel?600:400}}>{f}</button>
          );})}
        </div>
      </div>
      {/* 8 RETRY CTA */}
      <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"22px 28px":"18px 20px",border:"0.5px solid rgba(138,158,132,0.15)",display:isDesktop?"flex":"block",alignItems:"center",gap:20}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"1px solid rgba(138,158,132,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginBottom:isDesktop?0:14}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l2 5h5l-4 3 2 5-5-3.5-5 3.5 2-5-4-3h5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>
        </div>
        <div style={{flex:1,marginBottom:isDesktop?0:14}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:4}}>Ready for Round Two?</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.65)",margin:0,lineHeight:1.5}}>Now that you know where your fillers appear, try again and replace each one with a pause.</p>
        </div>
        <div style={{textAlign:isDesktop?"right":"left"}}>
          <button onClick={()=>{setPhase('recording');setTimeLeft(90);setIsRec(false);setTranscript('');setFallback('');}} style={{padding:"12px 24px",borderRadius:4,border:"none",background:"rgba(82,112,96,0.85)",color:"white",fontFamily:T.serif,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap"}}>
            Improve My Score <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{fontFamily:T.sans,fontSize:10,color:"rgba(245,239,230,0.3)",marginTop:6}}>Expected gain: +10–20 points</div>
        </div>
      </div>
      <button onClick={reset} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Start over</button>
    </div>
    );
  }

  return null;
}

// ─── D4 Simulation Feedback ──────────────────────────────────────────────────

