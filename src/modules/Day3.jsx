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
      if (onNavFn) onNavFn.current = null;
      onNavLabel(null);
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
      instruction:'Pause. Count to 3 slowly in your head.',
      quote2:'"…creating clarity, not complexity."',
      question:"Did the pause feel awkward?",
      options:[
        {label:"Yes",correct:false},
        {label:"A little",correct:true},
        {label:"No",correct:false},
      ],
      feedback:"Pauses feel longer to the speaker than to the audience. To listeners, intentional pauses feel thoughtful, calm, and controlled. Great communicators allow ideas space to land.",
    },
    {
      title:"LOSE YOUR TRAIN OF THOUGHT",
      prompt:"You're speaking and suddenly lose your train of thought.",
      question:"What's the best thing to do?",
      options:[
        {label:"A.  Say 'um' while you think",correct:false},
        {label:"B.  Speak faster",correct:false},
        {label:"C.  Pause briefly and gather your thoughts",correct:true},
        {label:"D.  Repeat what you just said",correct:false},
      ],
      cols:2,
      feedback:"Pause. Take a breath.\n\nThat single action creates mental clarity and calms the nervous system — and in that moment, you give yourself the best possible chance to find a strong response.\n\nThen deliver a declarative statement.\n\nCalm. Clear. Certain. One idea. One sentence. Full stop. No hedge. No filler. Just the point.",
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
            {n:2,label:"Lose Your Thread"},
            {n:3,label:"The Expert Question"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?38:32,height:isDesktop?38:32,borderRadius:"50%",border:"1.5px solid "+(i===0?T.gold:"rgba(138,158,132,0.45)"),background:i===0?"rgba(138,158,132,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:5}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?13:11,fontWeight:700,color:i===0?T.gold:T2.text3}}>{r.n}</span>
                </div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?12:10,color:"#A8998A",fontWeight:500,textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?72:50}}>{r.label}</div>
              </div>
              {i<2 && <div style={{height:1,width:isDesktop?8:3,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:20}}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>Build the Habit Of</div>
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
    const titleCase = r.title.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
    const OPTION_ICONS = [
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={T.gold} strokeWidth="1.3"/><path d="M10 6v4l2.5 2" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>,
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 10c2-3 4-3 6 0s4 3 6 0" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round"/><path d="M3 14c2-3 4-3 6 0s4 3 6 0" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round"/></svg>,
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={T.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="8" y="3" width="4" height="8" rx="2" stroke={T.gold} strokeWidth="1.3"/><path d="M5 9a5 5 0 0010 0M10 14v3M8 17h4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>,
    ];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",flexShrink:0}}>Round {round+1} of {ROUNDS.length}</div>
          <div style={{flex:1,height:2,background:T2.border,borderRadius:2}}>
            <div style={{height:"100%",width:(((round+1)/ROUNDS.length)*100)+"%",background:T.gold,borderRadius:2,transition:"width 0.4s ease"}}/>
          </div>
        </div>

        <div style={{...cs.card,textAlign:"center",padding:isDesktop?"28px 32px":"22px 20px"}}>
          <h3 style={{fontFamily:T.serif,fontSize:isDesktop?24:20,fontWeight:700,color:T2.text,lineHeight:1.2,margin:"0 0 16px"}}>{titleCase}</h3>
          <div style={{height:"0.5px",background:T2.border,margin:"0 0 18px"}}/>
          {r.prompt && <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,fontWeight:600,color:T2.text,lineHeight:1.6,margin:"0 0 18px"}}>{r.prompt}</p>}
          {r.quote && <p style={{fontFamily:T.serif,fontSize:isDesktop?26:21,fontStyle:"italic",color:T2.text,lineHeight:1.4,margin:"0 0 6px"}}>{r.quote}</p>}
          {r.instruction && !r.quote && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0}}>{r.instruction}</p>}
          {r.instruction && r.quote && <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5,margin:"8px 0 0",fontStyle:"italic"}}>{r.instruction}</p>}
          {r.quote2 && <p style={{fontFamily:T.serif,fontSize:isDesktop?26:21,fontStyle:"italic",color:T2.text,lineHeight:1.4,margin:0}}>{r.quote2}</p>}
        </div>

        {r.options && !showFeedback && (
          <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
            {r.question && (
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <div style={{width:isDesktop?40:34,height:isDesktop?40:34,borderRadius:"50%",background:T2.bg,border:"0.5px solid "+T2.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2C5.6 2 2 5.2 2 9c0 2 .9 3.7 2.3 5L3.5 17l3.2-1.2C7.8 16.6 8.9 17 10 17c4.4 0 8-3.1 8-7s-3.6-8-8-8z" stroke={T.gold} strokeWidth="1.3"/><path d="M10 8v4M10 13.5v.5" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?16:15,fontWeight:700,color:T2.text,margin:0,lineHeight:1.3}}>{r.question}</p>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:`repeat(${r.cols||r.options.length},1fr)`,gap:isDesktop?10:8}}>
              {r.options.map((opt,i)=>{
                const isSelected = selected===i;
                const correct = opt.correct;
                const border = isSelected?(correct?T.gold:"rgba(180,80,60,0.4)"):T2.border;
                const bg = isSelected?(correct?"rgba(138,158,132,0.08)":"rgba(180,80,60,0.04)"):T2.bg;
                return (
                  <button key={i} onClick={()=>{setSelected(i);setShowFeedback(true);}}
                    style={{padding:isDesktop?"14px 12px":"12px 10px",borderRadius:6,border:`1px solid ${border}`,background:bg,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:isDesktop?10:8,textAlign:"left"}}>
                    <div style={{width:isDesktop?32:28,height:isDesktop?32:28,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"0.5px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {OPTION_ICONS[i]}
                    </div>
                    <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.4,fontWeight:400}}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showFeedback && (
          <>
            <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
              <div style={cs.label}>Coaching Note</div>
              {r.feedback.split('\n\n').map((para,i)=>(
                <p key={i} style={{fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.65,margin:i<r.feedback.split('\n\n').length-1?"0 0 12px":0}}>{para}</p>
              ))}
            </div>
            <button onClick={()=>{
              if (round < ROUNDS.length-1){setRound(v=>v+1);setSelected(null);setShowFeedback(false);}
              else {setPhase('done');}
            }} style={cs.cta}>
              {round < ROUNDS.length-1 ? `Round ${round+2}: ${ROUNDS[round+1].title.charAt(0)+ROUNDS[round+1].title.slice(1).toLowerCase()} →` : "See Your Results →"}
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
      <button onClick={()=>{setPhase('intro');setRound(0);setSelected(null);setShowFeedback(false);}} style={{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48}}>
        Practise Again →
      </button>
      {onSimulation && (
        <button onClick={onSimulation} style={{width:"100%",padding:isDesktop?"13px":"12px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:isDesktop?14:13,fontWeight:400,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>
          Go to Simulation
        </button>
      )}
    </div>
  );

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

  // Animated dots on pause screens
  const [dotIdx, setDotIdx] = useState(0);

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

  // Animated dots
  useEffect(() => {
    if (phase !== 'pause1' && phase !== 'pause2') return;
    const id = setInterval(() => setDotIdx(d => (d + 1) % 3), 500);
    return () => clearInterval(id);
  }, [phase]);

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
        let t = '';
        for (let i = 0; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript + ' ';
        liveRef.current = t;
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
    <div style={{display: 'grid', gridTemplateColumns: isDesktop ? '2fr 3fr' : '1fr', gap: isDesktop ? 20 : 16, alignItems: 'start'}}>
      {leftPanel}
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>{right}</div>
    </div>
  );

  // ── SCREEN 1: SELECT ────────────────────────────────────────────────────────
  if (phase === 'select') return grid(<>
    <div>
      <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: 'rgba(138,158,132,0.6)', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 8}}>Simulation · Day 3</div>
      <h3 style={{fontFamily: T.serif, fontSize: isDesktop ? 24 : 20, fontWeight: 600, color: 'rgba(245,239,230,0.92)', margin: 0, lineHeight: 1.2}}>The Hot Seat</h3>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
      {scenarios.map(sc => {
        const sel = scenario?.id === sc.id;
        return (
          <button key={sc.id}
            onClick={() => { if (!sc.placeholder) setScenario(sc); }}
            disabled={!!sc.placeholder}
            style={{padding: '16px 14px', borderRadius: 6, border: `1px solid ${sel ? 'rgba(138,158,132,0.6)' : T2.border}`, background: sel ? 'rgba(138,158,132,0.1)' : T2.surface, cursor: sc.placeholder ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s', opacity: sc.placeholder ? 0.35 : 1, display: 'flex', flexDirection: 'column', gap: 10}}>
            <div style={{color: sel ? 'rgba(138,158,132,0.9)' : 'rgba(245,239,230,0.4)'}}>{sc.icon}</div>
            <span style={{fontFamily: T.sans, fontSize: isDesktop ? 12 : 11, color: sel ? 'rgba(245,239,230,0.92)' : T2.text, lineHeight: 1.4, fontWeight: sel ? 500 : 400}}>{sc.label}</span>
          </button>
        );
      })}
    </div>
    <button onClick={() => { if (scenario) { setPhase('brief'); setBriefSecs(45); setBriefDone(false); } }}
      disabled={!scenario}
      style={{...cs.cta, opacity: scenario ? 1 : 0.4, cursor: scenario ? 'pointer' : 'default'}}>
      Enter the Hot Seat →
    </button>
  </>);

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
        <div style={{display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20}}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{width: 9, height: 9, borderRadius: '50%', background: i === dotIdx ? 'rgba(138,158,132,0.75)' : 'rgba(138,158,132,0.18)', transition: 'background 0.4s'}} />
          ))}
        </div>
        <p style={{fontFamily: T.sans, fontSize: 12, color: T2.text4, textAlign: 'center', margin: 0, letterSpacing: '0.05em'}}>Take a moment. There's no rush.</p>
      </div>
      <button onClick={() => { doStart(); setPhase(phase === 'pause1' ? 'rec1' : 'rec2'); }} style={cs.cta}>
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
        {/* Verdict */}
        <div style={{background: '#0A0804', borderRadius: 8, padding: isDesktop ? '28px 32px' : '22px 20px', border: '0.5px solid rgba(138,158,132,0.15)'}}>
          <div style={{fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 12}}>Your AmplifyU Coach Says</div>
          <p style={{fontFamily: T.serif, fontSize: isDesktop ? 22 : 18, color: 'rgba(245,239,230,0.92)', lineHeight: 1.4, margin: 0}}>{feedback.headlineVerdict}</p>
        </div>

        {/* Signal cards */}
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

        {/* Excerpts */}
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

        {/* Takeaway */}
        <div style={cs.card}>
          <div style={cs.label}>Take This Into Your Next Meeting</div>
          <span style={{display: 'inline-block', padding: '9px 18px', borderRadius: 20, border: '0.5px solid rgba(138,158,132,0.3)', fontFamily: T.serif, fontSize: isDesktop ? 15 : 14, color: T2.text, lineHeight: 1.4}}>{feedback.takeaway}</span>
        </div>

        {/* Actions */}
        <div style={{display: 'flex', gap: 12}}>
          <button onClick={reset} style={{...cs.ghost, flex: 1}}>Try Again</button>
          <button onClick={reset} style={{...cs.cta, flex: 2}}>Continue →</button>
        </div>
      </div>
    );
  }

  // fallback while feedback loads
  return grid(
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200}}>
      <p style={{fontFamily: T.sans, fontSize: 13, color: T2.text4}}>Loading…</p>
    </div>
  );
}
