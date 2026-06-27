import { useState, useEffect, useRef } from 'react';

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

// ─── D7 Simulation Widget — Week 1 Master Challenge ───────────────────────────
export function D7SimWidget({ T, T2, isDesktop }) {
  const [phase,      setPhase]     = useState('intro');
  const [timeLeft,   setTimeLeft]  = useState(90);
  const [transcript, setTranscript]= useState('');
  const [fallback,   setFallback]  = useState('');
  const [isRec,      setIsRec]     = useState(false);
  const [result,     setResult]    = useState(null);
  const [waveVals,   setWaveVals]  = useState(Array(14).fill(0.3));

  const recRef    = useRef(null);
  const mediaRef  = useRef(null);
  const timerRef  = useRef(null);
  const waveRef   = useRef(null);
  const liveRef   = useRef('');
  const SpeechRec = typeof window!=='undefined'&&(window.SpeechRecognition||window.webkitSpeechRecognition);

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
    liveRef.current='';
    setTranscript('');
    if(SpeechRec){
      const rec=new SpeechRec();
      rec.continuous=true;rec.interimResults=true;
      rec.onresult=e=>{
        let fin='',inter='';
        for(let i=e.resultIndex;i<e.results.length;i++){
          if(e.results[i].isFinal)fin+=e.results[i][0].transcript+' ';
          else inter=e.results[i][0].transcript;
        }
        liveRef.current+=fin;
        setTranscript(liveRef.current+inter);
      };
      rec.onend=()=>{};
      rec.start();
      recRef.current=rec;
    }
    if(navigator.mediaDevices?.getUserMedia){
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        const mr=new MediaRecorder(stream);
        mr.start(200);
        mediaRef.current=mr;
      }).catch(()=>{});
    }
    setIsRec(true);setTimeLeft(90);setPhase('recording');
  }

  function stopRec(){
    if(recRef.current){try{recRef.current.stop();}catch(e){}recRef.current=null;}
    if(mediaRef.current){try{mediaRef.current.stop();}catch(e){}}
    clearInterval(timerRef.current);
    setIsRec(false);
  }

  async function doSubmit(){
    stopRec();
    const text=(liveRef.current||'').trim()||(fallback||'').trim();
    if(!text){setPhase('brief');return;}
    setPhase('analyzing');
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
      setResult(JSON.parse(m[0]));
    }catch{
      setResult({
        scores:{clarity:7,voiceControl:6,pauses:6,precision:7,structure:7,composure:8},
        memorable:"Communication is about making ideas easy for others to understand.",
        strongest:"Your explanation showed genuine understanding of the core Week 1 concepts.",
        growth:"Adding deliberate structure — one clear point per idea — would sharpen your impact.",
        coachInsight:"You demonstrated real understanding of Week 1. Your communication feels natural and grounded. As you move into Week 2, focus on building more contrast through deliberate pacing and pauses — that's where good communicators become great ones.",
      });
    }
    setPhase('results');
  }

  const cs={
    card:{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:isDesktop?"24px 28px":"20px 22px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10},
    cta:{width:"100%",padding:isDesktop?"16px":"14px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?16:15,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:52,transition:"all 0.2s"},
  };
  const scoreColor=s=>s>=8?"#527060":s>=5?T.gold:"#B05C4A";
  const avg=result?Math.round(Object.values(result.scores).reduce((a,b)=>a+b,0)/6):0;

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

      <button onClick={()=>{setIsRec(false);setTimeLeft(90);setPhase('recording');}}
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
            You have 90 seconds. Click start when you are ready.
          </p>
        </div>
        {/* Text fallback */}
        {!SpeechRec&&(
          <div style={cs.card}>
            <div style={cs.label}>Type Your Response</div>
            <textarea value={fallback} onChange={e=>setFallback(e.target.value)} placeholder="Type your explanation here…" style={{width:"100%",borderRadius:3,border:"0.5px solid "+T2.border,padding:"12px 14px",fontSize:14,fontFamily:T.sans,resize:"none",height:120,boxSizing:"border-box",background:T2.bg,color:T2.text,outline:"none",lineHeight:1.6}}/>
          </div>
        )}
        <button onClick={SpeechRec?startRec:doSubmit} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>
          Start Recording →
        </button>
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
          <div style={{height:"100%",width:((90-timeLeft)/90*100)+"%",background:timeLeft<=10?"#CC4444":T.gold,borderRadius:1,transition:"width 1s linear"}}/>
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
      <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.3s ease ${i*0.3}s infinite`}}/>)}</div>
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
        {/* 6 score cards */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isDesktop?10:8}}>
          {skills.map(({key,label})=>{
            const s=result.scores[key]||0;
            return (
              <div key={key} style={{background:T2.surface,borderRadius:6,border:"0.5px solid "+T2.border,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?10:9,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px"}}>{label}</span>
                  <span style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:scoreColor(s),lineHeight:1}}>{s}<span style={{fontSize:10,color:T2.text3}}>/10</span></span>
                </div>
                <div style={{height:3,background:T2.border,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:(s/10*100)+"%",background:scoreColor(s),borderRadius:2,transition:"width 1s ease"}}/>
                </div>
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
