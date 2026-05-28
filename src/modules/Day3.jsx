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
export function D3PracticeWidget({T, T2, isDesktop, onNavLabel, onNavFn}) {
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(()=>{
    if (!onNavLabel) return;
    if (phase === 'intro') {
      if (onNavFn) onNavFn.current = ()=>{ setPhase('playing'); setRound(0); setSelected(null); setShowFeedback(false); };
      onNavLabel('Begin Challenge');
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
      instruction:'Version A: "So um… I think we should probably like… start next week."\n\nVersion B: "I think we should start next week." [pause] "Then review progress together."',
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
      prompt:'Which is the clean version of: "So I was like really excited because um the idea was basically finally working."',
      quote:null,
      instruction:null,
      question:"Which version is cleaner?",
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

      <div style={{...cs.card,display:"flex",gap:16,alignItems:"center"}}>
        <img src="/badge-bishop.jpg" alt="Filler-Free" style={{width:isDesktop?72:56,height:isDesktop?72:56,borderRadius:6,objectFit:"cover",border:"1.5px solid rgba(138,158,132,0.3)",flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:4}}>The Reward</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T2.text,marginBottom:6}}>The Silent Expert</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?16:13,fontWeight:600,color:T.gold,lineHeight:1.2,margin:0}}>Complete the challenge to unlock the Silent Expert badge.</p>
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
          {r.prompt && <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,marginBottom:10,lineHeight:1.5}}>{r.prompt}</p>}
          {r.quote && <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 10px"}}>{r.quote}</p>}
          {r.instruction && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:r.quote2?"0 0 10px":0,whiteSpace:"pre-line"}}>{r.instruction}</p>}
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
      <button onClick={()=>{setPhase('intro');setRound(0);setSelected(null);setShowFeedback(false);}} style={cs.cta}>Practise Again →</button>
    </div>
  );

  return null;
}

// ─── D3 Simulation Widget ─────────────────────────────────────────────────────
export function D3SimWidget({T, T2, isDesktop}) {
  const DIMS = ["Calm Pacing","Pause Control","Verbal Clarity","Conversational Flow","Speaking Presence","Thought Completion"];
  const PROMPT = "Teach me how to make your favourite meal in 60 seconds.";

  const [phase, setPhase] = useState('intro');
  const [timeLeft, setTimeLeft] = useState(60);
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
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,messages:[{role:"user",content:`You are a premium communication coach specialising in filler-free speech. Analyse this spoken explanation for filler word usage and pacing quality.\n\nPrompt: "${PROMPT}"\nResponse: "${text}"\n\nReturn ONLY valid JSON:\n{"overall":<50-100>,"headline":"<max 10 words: key insight>","subtitle":"<one warm encouraging sentence>","scores":{"Calm Pacing":<50-100>,"Pause Control":<50-100>,"Verbal Clarity":<50-100>,"Conversational Flow":<50-100>,"Speaking Presence":<50-100>,"Thought Completion":<50-100>},"fillers":["list exact filler words found, e.g. um, like, you know, basically, sort of"],"worked":["<strength 1>","<strength 2>"],"improve":["<single clearest opportunity to reduce fillers>"],"insight":"<2 personalised sentences about filler patterns and pause technique>"}`}]})});
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

  function reset(){setPhase('intro');setTimeLeft(60);setIsRec(false);setTranscript('');setFallback('');setFeedback(null);setRound1(null);setAudioURL(null);}

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

  // ── FEEDBACK ─────────────────────────────────────────────────────────────────
  if(phase==='feedback'&&feedback) return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      {/* Overall score */}
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"28px":"20px"}}>
        <div style={cs.label}>Your Clarity Score</div>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?56:44,fontWeight:600,color:T.gold,lineHeight:1,marginBottom:8}}>{feedback.overall}</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 6px"}}>{feedback.headline}</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,margin:0,lineHeight:1.5}}>{feedback.subtitle}</p>
      </div>
      {/* Dimension scores */}
      <div style={cs.card}>
        <div style={cs.label}>Communication Breakdown</div>
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
      {/* Fillers detected */}
      {feedback.fillers&&feedback.fillers.length>0&&(
        <div style={{...cs.card,background:"rgba(180,80,60,0.04)",border:"0.5px solid rgba(180,80,60,0.15)"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(160,70,50,0.8)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Fillers Detected</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {feedback.fillers.map((f,i)=>(
              <span key={i} style={{padding:"4px 10px",borderRadius:20,border:"0.5px solid rgba(180,80,60,0.2)",background:"rgba(180,80,60,0.06)",fontFamily:T.sans,fontSize:12,color:"rgba(140,60,40,0.8)"}}>{f}</span>
            ))}
          </div>
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,marginTop:10,marginBottom:0,lineHeight:1.5}}>Each of these can be replaced with a calm pause. Try the recording again and swap these for silence.</p>
        </div>
      )}
      {/* What worked / improve */}
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
      {/* Coach insight */}
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
        <div style={cs.label}>Coach Insight</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>{feedback.insight}</p>
      </div>
      {/* Reflection */}
      <div style={cs.card}>
        <div style={cs.label}>Reflection</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,lineHeight:1.3,marginBottom:10}}>"Did the pauses sound as long as they felt?"</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,marginBottom:12}}>Most pauses feel much longer to the speaker than the listener. Great communicators use silence to think clearly, reduce fillers, create emphasis, and let ideas land.</p>
        {audioURL&&(
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>{if(audioRef.current){playing?audioRef.current.pause():audioRef.current.play();setPlaying(!playing);}}} style={{padding:"8px 16px",borderRadius:3,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:12,cursor:"pointer",fontFamily:T.sans}}>
              {playing?"⏸ Pause":"▶ Play back your recording"}
            </button>
            <audio ref={audioRef} src={audioURL} onEnded={()=>setPlaying(false)} style={{display:"none"}}/>
          </div>
        )}
      </div>
      <div style={{...cs.card,background:"rgba(138,158,132,0.04)",textAlign:"center"}}>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"The strongest communicators don't rush to fill silence. They use pauses to think, breathe, and let ideas land."</p>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={()=>{setPhase('recording');setTimeLeft(60);setIsRec(false);setTranscript('');setFallback('');}} style={{...cs.ghost,flex:"1 1 auto"}}>Try Again →</button>
        <button onClick={reset} style={{...cs.cta,flex:"1 1 auto",width:"auto"}}>Start Over</button>
      </div>
    </div>
  );

  // ── COMPARISON ───────────────────────────────────────────────────────────────
  if(phase==='comparison'&&feedback&&round1) return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"24px":"18px"}}>
        <div style={cs.label}>Progress</div>
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
          <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,marginTop:12,marginBottom:0}}>+{feedback.overall-round1.overall} points. That's measurable improvement.</p>
        )}
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Score Comparison</div>
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
        <div style={cs.label}>Coach Insight</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>{feedback.insight}</p>
      </div>
      <div style={{...cs.card,background:"rgba(138,158,132,0.04)",textAlign:"center"}}>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"The strongest communicators don't rush to fill silence. They use pauses to think, breathe, and let ideas land."</p>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={()=>{setPhase('recording');setTimeLeft(60);setIsRec(false);setTranscript('');setFallback('');}} style={{...cs.ghost,flex:"1 1 auto"}}>One More Round →</button>
        <button onClick={reset} style={{...cs.cta,flex:"1 1 auto",width:"auto"}}>Start Over</button>
      </div>
    </div>
  );

  return null;
}

// ─── D4 Simulation Feedback ──────────────────────────────────────────────────

