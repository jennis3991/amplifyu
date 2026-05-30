import { useState, useEffect, useRef } from 'react';

function shuffle(arr) {
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

// ─── D5 Practice Widget — PRE Card Sort ──────────────────────────────────────
export function D5PracticeWidget({T, T2, isDesktop}) {
  const ROUNDS = [
    {q:"Where should we go this summer?",        point:"We should go to the South of France.",                        reason:"It has great weather, food, and is easy for a short trip.",              example:"Friends went recently and said Monaco was brilliant."},
    {q:"What should we watch tonight?",           point:"Let's watch a comedy.",                                       reason:"We've both had a long week and something light will be more enjoyable.",  example:"Like when we watched Mrs Doubtfire — it was easy and fun."},
    {q:"Is working from home better?",            point:"I think hybrid works best.",                                  reason:"It gives flexibility without losing collaboration.",                      example:"When I'm home I focus better, but office days are better for brainstorming."},
    {q:"Where should we go for dinner tonight?",  point:"Let's go to the Italian place.",                             reason:"It's relaxed, consistently good, and everyone will find something.",      example:"Last time the food came quickly and everyone enjoyed it."},
  ];

  const [phase,   setPhase]   = useState('intro');
  const [round,   setRound]   = useState(0);
  const [cards,   setCards]   = useState([]);
  const [placed,  setPlaced]  = useState({point:null,reason:null,example:null});
  const [selected,setSelected]= useState(null);
  const [checked, setChecked] = useState(false);
  const [total,   setTotal]   = useState(0);

  function mkCards(r){
    return shuffle([
      {text:ROUNDS[r].point,   correct:'point'},
      {text:ROUNDS[r].reason,  correct:'reason'},
      {text:ROUNDS[r].example, correct:'example'},
    ]);
  }
  function startRound(r){setCards(mkCards(r));setPlaced({point:null,reason:null,example:null});setSelected(null);setChecked(false);}

  function tapCard(i){
    if(checked) return;
    setSelected(s=>s===i?null:i);
  }

  function tapBucket(bucket){
    if(checked) return;
    if(selected===null){
      // Unplace card already in bucket
      if(placed[bucket]!==null) setPlaced(p=>({...p,[bucket]:null}));
      return;
    }
    const np={...placed};
    Object.keys(np).forEach(k=>{if(np[k]===selected) np[k]=null;});
    np[bucket]=selected;
    setPlaced(np);
    setSelected(null);
  }

  function check(){
    let pts=0;
    ['point','reason','example'].forEach(b=>{if(placed[b]!==null&&cards[placed[b]].correct===b) pts++;});
    setTotal(t=>t+pts);
    setChecked(true);
  }

  function next(){
    if(round<ROUNDS.length-1){const r=round+1;setRound(r);startRound(r);}
    else setPhase('done');
  }

  const allPlaced = placed.point!==null&&placed.reason!==null&&placed.example!==null;
  const placedSet = new Set(Object.values(placed).filter(v=>v!==null));
  const unplaced  = cards.map((_,i)=>i).filter(i=>!placedSet.has(i));
  const allCorrect= ['point','reason','example'].every(b=>placed[b]!==null&&cards[placed[b]].correct===b);

  const cs={
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"20px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if(phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Mission</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?18:17,fontWeight:600,color:T.gold,lineHeight:1.3,margin:"0 0 12px"}}>Sort the cards into the right buckets.</p>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {["Four real scenarios. Three cards each — shuffled.","Identify which statement is the Point, which is the Reason, and which is the Example.","Every correct placement earns a point."].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:11,flexShrink:0,marginTop:2}}>✦</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontStyle:"italic",color:T2.text,lineHeight:1.5}}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>The Challenge Journey</div>
        <div style={{display:"flex",alignItems:"flex-start"}}>
          {["Summer","Tonight","WFH","Dinner"].map((label,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?34:28,height:isDesktop?34:28,borderRadius:"50%",border:"1.5px solid "+(i===0?T.gold:"rgba(138,158,132,0.35)"),background:i===0?"rgba(138,158,132,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:5}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?12:10,fontWeight:700,color:i===0?T.gold:T2.text3}}>{i+1}</span>
                </div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?11:9,color:T2.text3,fontWeight:500,textAlign:"center",lineHeight:1.3}}>{label}</div>
              </div>
              {i<3&&<div style={{height:1,width:isDesktop?8:3,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:18}}/>}
            </div>
          ))}
        </div>
      </div>

      <button onClick={()=>{setPhase('playing');setRound(0);setTotal(0);startRound(0);}}
        style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>
        Start the PRE Card Sort →
      </button>
    </div>
  );

  // ── PLAYING ────────────────────────────────────────────────────────────────
  if(phase==='playing') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      {/* Progress bar */}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",flexShrink:0}}>Round {round+1} of {ROUNDS.length}</div>
        <div style={{flex:1,height:2,background:T2.border,borderRadius:2}}>
          <div style={{height:"100%",width:(((round+1)/ROUNDS.length)*100)+"%",background:T.gold,borderRadius:2,transition:"width 0.4s ease"}}/>
        </div>
        <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T2.text3,flexShrink:0}}>{total} pts</div>
      </div>

      {/* Question */}
      <div style={cs.card}>
        <div style={cs.label}>The Scenario</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:18,fontWeight:600,color:T2.text,lineHeight:1.3,margin:0}}>{ROUNDS[round].q}</p>
      </div>

      {/* Card tray — unplaced cards */}
      {unplaced.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px"}}>
            {selected===null?"Tap a card to select it":"Card selected — tap a bucket below to place it"}
          </div>
          {unplaced.map(i=>(
            <div key={i} onClick={()=>tapCard(i)}
              style={{padding:"13px 16px",borderRadius:4,border:`1px solid ${selected===i?T.gold:T2.border}`,background:selected===i?"rgba(138,158,132,0.08)":T2.bg,cursor:"pointer",transition:"all 0.15s",boxShadow:selected===i?"0 0 0 2px rgba(138,158,132,0.15)":"none",userSelect:"none"}}>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.6,margin:0}}>{cards[i].text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Buckets */}
      <div style={{display:"flex",flexDirection:isDesktop?"row":"column",gap:10}}>
        {['point','reason','example'].map(bucket=>{
          const idx=placed[bucket];
          const correct=checked&&idx!==null&&cards[idx].correct===bucket;
          const wrong  =checked&&idx!==null&&cards[idx].correct!==bucket;
          const highlight=!checked&&selected!==null&&idx===null;
          return (
            <div key={bucket} onClick={()=>tapBucket(bucket)}
              style={{flex:1,borderRadius:4,border:`1.5px solid ${correct?"#527060":wrong?"#B05C4A":highlight?"rgba(138,158,132,0.5)":T2.border}`,background:correct?"rgba(82,112,96,0.06)":wrong?"rgba(176,92,74,0.06)":highlight?"rgba(138,158,132,0.04)":"transparent",cursor:!checked?"pointer":"default",transition:"all 0.15s",minHeight:isDesktop?96:76,display:"flex",flexDirection:"column",padding:"11px 14px",gap:8}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:correct?"#527060":wrong?"#B05C4A":T.gold,textTransform:"uppercase",letterSpacing:"2px"}}>{bucket}</span>
                {correct&&<span style={{color:"#527060",fontSize:13}}>✓</span>}
                {wrong  &&<span style={{color:"#B05C4A",fontSize:13}}>✗</span>}
                {idx===null&&!checked&&<span style={{fontFamily:T.sans,fontSize:10,color:"rgba(138,158,132,0.4)"}}>place here</span>}
              </div>
              {idx!==null&&(
                <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.55,margin:0}}>{cards[idx].text}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {!checked&&allPlaced&&(
        <button onClick={check} style={cs.cta}>Check My Answers →</button>
      )}
      {checked&&(
        <>
          <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
            <div style={cs.label}>AmplifyU Insight</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.65,margin:0}}>
              {allCorrect
                ?"Perfect round. You understand how PRE is structured — now build the reflex to use it in real conversations."
                :"PRE works because it mirrors how listeners naturally process information. Point first gives them your position. Reason explains why. Example makes it real."}
            </p>
          </div>
          <button onClick={next} style={cs.cta}>
            {round<ROUNDS.length-1?`Round ${round+2} →`:"See Your Score →"}
          </button>
        </>
      )}
    </div>
  );

  // ── DONE ───────────────────────────────────────────────────────────────────
  const max=ROUNDS.length*3;
  const pct=Math.round((total/max)*100);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"36px 32px":"28px 24px"}}>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?68:52,fontWeight:600,color:T2.text,lineHeight:0.85,letterSpacing:"-3px",marginBottom:4}}>
          {total}<span style={{fontSize:isDesktop?26:20,color:T.gold,letterSpacing:"-1px"}}>/{max}</span>
        </div>
        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,letterSpacing:"2px",textTransform:"uppercase",marginTop:10,marginBottom:18}}>points scored</div>
        <div style={{height:1,background:T2.divider,marginBottom:18,maxWidth:200,margin:"0 auto 18px"}}/>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:16,fontStyle:"italic",color:T.gold,lineHeight:1.55,margin:0}}>
          {pct>=90?"Instinctive. You've internalised the PRE structure.":pct>=66?"Solid. A few more rounds and PRE will be second nature.":"Good start. The pattern becomes automatic with repetition."}
        </p>
      </div>
      <button onClick={()=>{setPhase('intro');setRound(0);setTotal(0);setCards([]);}}
        style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"8px 0",textAlign:"center",width:"100%"}}>
        Play Again
      </button>
    </div>
  );
}

// ─── D5 Simulation Widget — PRE Speed Challenge ───────────────────────────────
const SPEED_BANK = [
  "Where should we go this summer?","What should we watch tonight?","Should we get a dog?","What should we have for dinner?",
  "Should I take this job offer?","How can I improve my presentation skills?","Why should someone hire you?","What makes a great leader?",
  "Should children have smartphones?","Why is storytelling powerful?","What's the best productivity habit?","Why should I visit London?",
  "Best book you've read recently?","Why is sleep important?","Convince me to try coffee.","Should we move to a bigger city?",
  "What's your biggest strength?","Why does teamwork matter?","Should we start a podcast?","How do you handle conflict at work?",
];

export function D5SimWidget({T, T2, isDesktop}) {
  const [phase,    setPhase]   = useState('intro');
  const [timeLeft, setTimeLeft]= useState(90);
  const [count,    setCount]   = useState(0);
  const [questions,setQuestions]= useState(null);
  const [qi,       setQi]      = useState(0);
  const timerRef = useRef(null);

  useEffect(()=>{
    if(phase!=='playing'){clearInterval(timerRef.current);return;}
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){clearInterval(timerRef.current);setPhase('done');return 0;}
        return t-1;
      });
    },1000);
    return()=>clearInterval(timerRef.current);
  },[phase]);

  function start(){
    setQuestions(shuffle([...SPEED_BANK]));
    setQi(0);setCount(0);setTimeLeft(90);setPhase('playing');
  }
  function next(){setCount(c=>c+1);setQi(i=>(i+1)%(questions?.length||1));}

  const cs={
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"20px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if(phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>PRE Speed Challenge</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?22:20,fontWeight:600,color:T.gold,lineHeight:1.25,margin:"0 0 18px"}}>90 seconds. How many can you nail?</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {n:"1", t:"A question appears on screen."},
            {n:"2", t:"Say your answer out loud — Point, then Reason, then Example."},
            {n:"3", t:'Hit "Next" when done. Keep going until the clock runs out.'},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"0.5px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold}}>{s.n}</span>
              </div>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.5}}>{s.t}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={start} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>
        Start the Challenge →
      </button>
    </div>
  );

  // ── PLAYING ────────────────────────────────────────────────────────────────
  if(phase==='playing'&&questions) return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      {/* Timer */}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?44:36,fontWeight:600,color:timeLeft<=10?"#B05C4A":T.gold,lineHeight:1,flexShrink:0,minWidth:isDesktop?72:58}}>
          {timeLeft}<span style={{fontFamily:T.sans,fontSize:14,color:timeLeft<=10?"#B05C4A":T2.text3}}>s</span>
        </div>
        <div style={{flex:1,height:4,background:T2.border,borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:((timeLeft/90)*100)+"%",background:timeLeft<=10?"#B05C4A":T.gold,borderRadius:2,transition:"width 1s linear"}}/>
        </div>
        <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T2.text3,flexShrink:0}}>{count} done</div>
      </div>

      {/* Question */}
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold,padding:isDesktop?"24px 28px":"20px 22px"}}>
        <div style={cs.label}>Your question</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?28:22,fontWeight:600,color:T2.text,lineHeight:1.25,margin:0}}>{questions[qi]}</p>
      </div>

      {/* PRE reminder pills */}
      <div style={{display:"flex",gap:isDesktop?10:8}}>
        {['Point','Reason','Example'].map((lbl,i)=>(
          <div key={i} style={{flex:1,padding:"10px 8px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border,textAlign:"center"}}>
            <div style={{fontFamily:T.sans,fontSize:isDesktop?11:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px"}}>{lbl}</div>
          </div>
        ))}
      </div>

      <button onClick={next}
        style={{...cs.cta,background:T.gold,color:"white",fontSize:isDesktop?17:15,padding:isDesktop?"18px":"16px"}}>
        Next →
      </button>
    </div>
  );

  // ── DONE ───────────────────────────────────────────────────────────────────
  return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"36px 32px":"28px 24px"}}>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?72:56,fontWeight:600,color:T2.text,lineHeight:0.85,letterSpacing:"-4px",marginBottom:4}}>{count}</div>
        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,letterSpacing:"2px",textTransform:"uppercase",marginTop:10,marginBottom:18}}>scenarios completed</div>
        <div style={{height:1,background:T2.divider,maxWidth:200,margin:"0 auto 18px"}}/>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T.gold,lineHeight:1.55,margin:0}}>
          {count>=8?"Elite pace. PRE is becoming instinctive.":count>=5?"Strong. Keep practising until PRE is your default structure.":"PRE fluency takes repetition. Every round builds the reflex."}
        </p>
      </div>
      <button onClick={()=>setPhase('intro')}
        style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"8px 0",textAlign:"center",width:"100%"}}>
        Try Again
      </button>
    </div>
  );
}
