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
                <div style={{fontFamily:T.sans,fontSize:isDesktop?11:9,color:"#A8998A",fontWeight:500,textAlign:"center",lineHeight:1.3}}>{label}</div>
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

// ─── D5 Simulation Widget — The Boardroom ────────────────────────────────────
const BOARDROOM_TOPICS = [
  {id:'ai',       label:'Your company should invest more in AI',                        question:'Should your company be investing more in AI — and why?',                      q2:'A sceptical colleague says AI investment is overhyped. Respond.'},
  {id:'remote',   label:'Remote work improves productivity',                            question:'Does remote work genuinely improve productivity — and why?',                   q2:'Your leadership team wants everyone back in the office. Make your case.'},
  {id:'fourday',  label:'Four-day weeks should become standard',                        question:'Should four-day weeks become standard — and why?',                            q2:"The CFO says a four-day week will hurt revenue. What's your response?"},
  {id:'comms',    label:'Communication skills should be taught in every workplace',     question:'Should communication skills be taught in every workplace — and why?',         q2:"A senior leader says communication training is a nice-to-have. Disagree."},
  {id:'meetings', label:'Meetings should require a written agenda to exist',            question:'Should every meeting require a written agenda to exist — and why?',           q2:'Someone says agenda requirements will slow teams down. Respond.'},
  {id:'learning', label:'Your organisation should invest more in learning and development', question:'Should organisations invest more in learning and development — and why?', q2:'The board wants to cut the L&D budget. Make the case against it.'},
];

const BOARDROOM_ICONS = {
  ai: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a4 4 0 018 0v2"/><circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.2" fill="currentColor" stroke="none"/><path d="M9 18h6M1 12h2M21 12h2"/></svg>,
  remote: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 4l9 8"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/></svg>,
  fourday: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>,
  comms: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  meetings: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  learning: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13 16 9 12 2 19"/><polyline points="16 7 22 7 22 13"/></svg>,
};

export function D5SimWidget({T, T2, isDesktop}) {
  const [phase,        setPhase]        = useState('select');
  const [topic,        setTopic]        = useState(null);
  const [cardVisible,  setCardVisible]  = useState(false);
  const [cardOut,      setCardOut]      = useState(false);
  const [recVisible,   setRecVisible]   = useState(false);
  const [countdown,    setCountdown]    = useState(10);
  const [isRec,        setIsRec]        = useState(false);
  const [waveVals,     setWaveVals]     = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);
  const [preResult,    setPreResult]    = useState(null);
  const [revealRow,    setRevealRow]    = useState(0);
  const [revealCoach,  setRevealCoach]  = useState(false);
  const [debriefResult,setDebriefResult]= useState(null);

  const mediaRecRef      = useRef(null);
  const audioChunksRef   = useRef([]);
  const recRef           = useRef(null);
  const waveRef          = useRef(null);
  const liveRef          = useRef('');
  const transcript1Ref   = useRef('');
  const topicRef         = useRef(null);
  const thinkingTargetRef= useRef('rec1');
  const countdownIdRef   = useRef(null);

  const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  // Waveform animation
  useEffect(() => {
    if (!isRec) { clearInterval(waveRef.current); return; }
    waveRef.current = setInterval(() => setWaveVals(() => Array.from({length:9}, () => 0.2 + Math.random() * 0.8)), 150);
    return () => clearInterval(waveRef.current);
  }, [isRec]);

  // Thinking card — runs when phase === 'thinking'
  useEffect(() => {
    if (phase !== 'thinking') {
      setCardVisible(false); setCardOut(false); setRecVisible(false); setCountdown(10);
      clearInterval(countdownIdRef.current);
      return;
    }
    setCardVisible(false); setCardOut(false); setRecVisible(false); setCountdown(10);
    clearInterval(countdownIdRef.current);
    const t1 = setTimeout(() => {
      setCardVisible(true);
      let c = 10;
      const id = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(id);
          countdownIdRef.current = null;
          setCardOut(true);
          setTimeout(() => {
            setCardVisible(false); setCardOut(false); setRecVisible(true);
            setIsRec(true);
            startSpeechRec();
          }, 400);
          setTimeout(() => { setPhase(thinkingTargetRef.current); }, 900);
        }
      }, 1000);
      countdownIdRef.current = id;
    }, 1000);
    return () => { clearTimeout(t1); clearInterval(countdownIdRef.current); };
  }, [phase]); // eslint-disable-line

  // PRE reveal sequential fade-in
  useEffect(() => {
    if (phase !== 'reveal') { setRevealRow(0); setRevealCoach(false); return; }
    const t1 = setTimeout(() => setRevealRow(1), 600);
    const t2 = setTimeout(() => setRevealRow(2), 1400);
    const t3 = setTimeout(() => setRevealRow(3), 2200);
    const t4 = setTimeout(() => setRevealCoach(true), 2700);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, [phase]);

  function startSpeechRec() {
    liveRef.current = '';
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
      try { rec.start(); } catch(err) {}
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

  function stopRec(onText) {
    setIsRec(false);
    if (mediaRecRef.current && mediaRecRef.current.state !== 'inactive') {
      mediaRecRef.current.onstop = () => {};
      mediaRecRef.current.stop();
    }
    if (recRef.current) {
      const rec = recRef.current; recRef.current = null;
      const fallback = setTimeout(() => onText(liveRef.current), 1800);
      rec.onend = () => { clearTimeout(fallback); onText(liveRef.current); };
      try { rec.stop(); } catch(e) { clearTimeout(fallback); onText(liveRef.current); }
    } else {
      onText(liveRef.current);
    }
  }

  function doStop1() {
    stopRec(text => {
      const t1 = text.trim() || '[first answer]';
      transcript1Ref.current = t1;
      setPhase('analyzing1');
      analyzePRE(t1);
    });
  }

  function doStop2() {
    stopRec(text => {
      const t2 = text.trim() || '[second answer]';
      setPhase('analyzing2');
      analyzeDebrief(transcript1Ref.current, t2);
    });
  }

  async function analyzePRE(text) {
    const t = topicRef.current;
    try {
      const res = await fetch('/api/claude', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-5', max_tokens:600,
          system:`You are the AmplifyU coach analysing a spoken response for structural quality. The user has just answered a question. They do not know you are looking for Point, Reason, Example structure. Analyse their transcript and extract the following. pointQuote: the sentence or phrase where they stated their main position (or null if absent). pointTiming: approximately how many seconds into the answer this appeared. pointStrength: one of 'strong', 'present', 'weak', or 'missing'. reasonQuote: the sentence or phrase where they gave their reasoning or justification (or null if absent). reasonStrength: one of 'strong', 'present', 'weak', or 'missing'. exampleQuote: the sentence or phrase where they gave a concrete example, proof, or evidence (or null if absent). exampleStrength: one of 'strong', 'present', 'weak', or 'missing'. exampleTiming: approximately how many seconds into the answer this appeared. overallStructure: one of 'instinctive' (PRE appeared naturally and early), 'emerging' (elements present but out of order or late), or 'developing' (one or more elements missing). coachInsight: one specific, warm sentence identifying the single most useful structural observation. q2Instruction: one short directive sentence telling them one specific thing to do differently in Q2 — always framed as an action, never a warning. Return only valid JSON.`,
          messages:[{role:'user', content:`Topic: ${t?.label}\nQuestion: ${t?.question}\n\nTranscript: "${text}"`}],
        }),
      });
      const data = await res.json();
      const raw = (data.content||[]).map(b=>b.text||'').join('');
      const m = raw.match(/\{[\s\S]*\}/);
      setPreResult(JSON.parse(m[0]));
      setPhase('reveal');
    } catch(e) {
      setPreResult({
        pointQuote: text.split(/[.!?]/)[0]?.trim()||null, pointStrength:'present', pointTiming:3,
        reasonQuote: text.split(/[.!?]/)[1]?.trim()||null, reasonStrength:'present',
        exampleQuote:null, exampleStrength:'developing', exampleTiming:0,
        overallStructure:'emerging',
        coachInsight:"Your point came through — bring your example earlier to make it land harder.",
        q2Instruction:"Open with your point in the first sentence.",
      });
      setPhase('reveal');
    }
  }

  async function analyzeDebrief(t1, t2) {
    const t = topicRef.current;
    try {
      const res = await fetch('/api/claude', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-5', max_tokens:700,
          system:`You are the AmplifyU coach. The user has just completed two rounds of The Boardroom simulation for Day 5: Structure PRE. You have their Q1 transcript and their Q2 transcript. For Q2, apply the same PRE extraction as Q1. Then compare the two. Compare pointTiming between Q1 and Q2 — did their main point arrive earlier in Q2? Compare overall structural quality. Return a JSON object with: q2PointQuote, q2PointStrength, q2ReasonQuote, q2ReasonStrength, q2ExampleQuote, q2ExampleStrength, q2OverallStructure, improvement (boolean — true if Q2 showed clearer or earlier PRE structure than Q1), headlineVerdict (one warm specific sentence summarising what they demonstrated across both answers), comparisonInsight (one sentence comparing Q1 and Q2 specifically — reference timing or structure, not vague improvement), takeaway (one memorable sentence they can use before their next real conversation — frame as a habit not a rule). Return only valid JSON.`,
          messages:[{role:'user', content:`Topic: ${t?.label}\nQ1 Question: ${t?.question}\nQ2 Question: ${t?.q2}\n\nQ1 Transcript: "${t1}"\n\nQ2 Transcript: "${t2}"`}],
        }),
      });
      const data = await res.json();
      const raw = (data.content||[]).map(b=>b.text||'').join('');
      const m = raw.match(/\{[\s\S]*\}/);
      setDebriefResult(JSON.parse(m[0]));
      setPhase('debrief');
    } catch(e) {
      setDebriefResult({
        q2PointQuote:null, q2PointStrength:'present',
        q2ReasonQuote:null, q2ReasonStrength:'present',
        q2ExampleQuote:null, q2ExampleStrength:'developing', q2OverallStructure:'emerging',
        improvement:true,
        headlineVerdict:"You held your structure under pressure — that's the real test of The Boardroom.",
        comparisonInsight:"Your point arrived earlier in Q2, which gave the answer a stronger foundation from the start.",
        takeaway:"State your position in the opening sentence — every time, before anything else.",
      });
      setPhase('debrief');
    }
  }

  function reset() {
    setPhase('select'); setTopic(null); topicRef.current = null;
    setPreResult(null); setDebriefResult(null); setIsRec(false);
    setRevealRow(0); setRevealCoach(false);
    liveRef.current = ''; transcript1Ref.current = '';
  }

  const cs = {
    card:    {background:T2.surface, borderRadius:4, border:'0.5px solid '+T2.border, padding:isDesktop?'20px 24px':'16px 18px'},
    label:   {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2px', marginBottom:8},
    cta:     {width:'100%', padding:isDesktop?'14px':'13px', borderRadius:4, border:'none', background:T.ink, color:T.bg, fontSize:isDesktop?15:14, fontWeight:600, cursor:'pointer', fontFamily:T.sans, minHeight:48},
    sageCta: {width:'100%', padding:isDesktop?'14px':'13px', borderRadius:4, border:'none', background:'rgba(82,112,96,0.85)', color:'#fff', fontSize:isDesktop?15:14, fontWeight:600, cursor:'pointer', fontFamily:T.sans, minHeight:48},
    ghost:   {width:'100%', padding:'11px', borderRadius:4, border:'0.5px solid '+T2.border, background:'transparent', color:T2.text, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:T.sans, minHeight:44},
  };

  function statusIndicator(strength) {
    if (strength === 'strong' || strength === 'present') return <span style={{color:'rgba(82,112,96,0.9)', fontSize:16, fontWeight:700}}>✓</span>;
    if (strength === 'weak') return <span style={{color:T.gold, fontSize:14, fontWeight:700}}>△</span>;
    return <span style={{color:T2.text3, fontSize:14}}>—</span>;
  }

  const leftPanel = (
    <div style={{background:'#0A0804', borderRadius:8, padding:isDesktop?'32px 28px':'22px 20px', border:'0.5px solid rgba(138,158,132,0.15)', display:'flex', flexDirection:'column'}}>
      <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:16}}>The Boardroom</div>
      <h2 style={{fontFamily:T.serif, fontSize:isDesktop?24:20, fontWeight:600, color:'rgba(245,239,230,0.9)', lineHeight:1.25, margin:'0 0 20px'}}>
        One question.<br/>Ten seconds to think.<br/>Then answer.
      </h2>
      <div style={{height:'0.5px', background:'rgba(138,158,132,0.2)', marginBottom:20}}/>
      <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:'rgba(245,239,230,0.5)', lineHeight:1.7, margin:'0 0 20px'}}>
        Every executive structures before they speak. Today you'll do the same — without being told how.
      </p>
      <div style={{background:'rgba(138,158,132,0.07)', borderRadius:4, border:'0.5px solid rgba(138,158,132,0.18)', padding:'16px 18px', marginBottom:20}}>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.7)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:10}}>Coach Tip</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, color:'rgba(245,239,230,0.7)', lineHeight:1.65, margin:0, fontStyle:'italic'}}>
          There's no right answer. There's only a clear one.
        </p>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:6, marginTop:'auto', paddingTop:4}}>
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8.5" stroke="rgba(138,158,132,0.35)" strokeWidth="1.3"/>
          <path d="M10 6v4l2.5 2" stroke="rgba(138,158,132,0.35)" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span style={{fontFamily:T.sans, fontSize:10, color:'rgba(138,158,132,0.35)', letterSpacing:'0.05em'}}>3 minutes</span>
      </div>
    </div>
  );

  const grid = (right) => (
    <div style={{display:'grid', gridTemplateColumns:isDesktop?'2fr 3fr':'1fr', gap:isDesktop?20:16, alignItems:'start'}}>
      {leftPanel}
      <div style={{display:'flex', flexDirection:'column', gap:16}}>{right}</div>
    </div>
  );

  // ── SELECT ─────────────────────────────────────────────────────────────────
  if (phase === 'select') return grid(<>
    <div>
      <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:8}}>Simulation · Day 5</div>
      <h3 style={{fontFamily:T.serif, fontSize:isDesktop?24:20, fontWeight:600, color:T2.text, margin:'0 0 4px', lineHeight:1.2}}>The Boardroom</h3>
      <div style={{height:2, background:T2.border, borderRadius:2, marginTop:10}}/>
    </div>
    <div style={cs.card}>
      <div style={cs.label}>Your Brief</div>
      <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text, lineHeight:1.65, margin:0}}>
        The AI will ask you one question. You'll have 10 seconds to think. Then answer. Speak for around 45–60 seconds. The coach will analyse your response — without telling you what it's looking for.
      </p>
    </div>
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
      {BOARDROOM_TOPICS.map(t => {
        const sel = topic?.id === t.id;
        return (
          <button key={t.id} onClick={() => { setTopic(t); topicRef.current = t; }}
            style={{padding:'16px 14px', borderRadius:6, border:`${sel?'2px':'1px'} solid ${sel?'rgba(82,112,96,0.75)':T2.border}`, background:sel?'rgba(82,112,96,0.18)':T2.surface, cursor:'pointer', textAlign:'left', transition:'all 0.2s', display:'flex', flexDirection:'column', gap:10, outline:'none'}}>
            <div style={{color:sel?'rgba(82,112,96,0.9)':T2.text3}}>{BOARDROOM_ICONS[t.id]}</div>
            <span style={{fontFamily:T.sans, fontSize:isDesktop?12:11, color:T2.text, lineHeight:1.4, fontWeight:sel?600:400}}>{t.label}</span>
          </button>
        );
      })}
    </div>
    <button onClick={() => { if (topic) { thinkingTargetRef.current='rec1'; setPhase('thinking'); } }}
      disabled={!topic}
      style={{...cs.cta, opacity:topic?1:0.4, cursor:topic?'pointer':'default'}}>
      Enter the Boardroom →
    </button>
  </>);

  const currentQ = thinkingTargetRef.current === 'rec2' ? topicRef.current?.q2 : topicRef.current?.question;

  // ── THINKING ───────────────────────────────────────────────────────────────
  if (phase === 'thinking') return grid(<>
    {thinkingTargetRef.current === 'rec2' && preResult?.q2Instruction && (
      <div style={{background:'rgba(138,158,132,0.07)', borderRadius:4, border:'0.5px solid rgba(138,158,132,0.25)', padding:'14px 18px'}}>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.7)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:6}}>Your instruction</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, color:'rgba(245,239,230,0.8)', lineHeight:1.5, margin:0, fontStyle:'italic'}}>{preResult.q2Instruction}</p>
      </div>
    )}
    <div style={cs.card}>
      <div style={cs.label}>{thinkingTargetRef.current === 'rec2' ? 'Question 2' : 'Your Question'}</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?22:18, fontWeight:600, color:T2.text, lineHeight:1.3, margin:0}}>"{currentQ}"</p>
    </div>
    <div style={{opacity:cardVisible&&!cardOut?1:0, transition:cardOut?'opacity 0.4s ease':cardVisible?'opacity 0.5s ease':'none', display:'flex', flexDirection:'column', gap:14}}>
      <div style={{background:'rgba(245,239,230,0.03)', border:'0.5px solid rgba(138,158,132,0.25)', borderRadius:6, padding:isDesktop?'28px 32px':'20px 22px', textAlign:'center'}}>
        {["WHAT'S YOUR POINT?","WHY?","CAN YOU PROVE IT?"].map((line,i)=>(
          <p key={i} style={{fontFamily:T.serif, fontSize:isDesktop?18:16, color:'rgba(245,239,230,0.8)', lineHeight:1.4, margin:i<2?'0 0 14px':0, fontWeight:500}}>{line}</p>
        ))}
      </div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?36:28, fontWeight:600, color:T2.text3, textAlign:'center', margin:0, lineHeight:1}}>{countdown}</p>
    </div>
    {recVisible && (
      <p style={{fontFamily:T.serif, fontSize:isDesktop?16:14, fontStyle:'italic', color:T2.text3, textAlign:'center', margin:'4px 0 0'}}>Answer when you're ready.</p>
    )}
  </>);

  // ── REC 1 ──────────────────────────────────────────────────────────────────
  if (phase === 'rec1') return grid(<>
    <div style={cs.card}>
      <div style={cs.label}>Your Question</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:'0 0 20px'}}>"{topicRef.current?.question}"</p>
      <div style={{display:'flex', alignItems:'center', gap:2, height:40, marginBottom:14}}>
        {waveVals.map((v,i)=><div key={i} style={{flex:1, height:Math.round(v*34)+'px', background:`rgba(138,158,132,${0.3+v*0.5})`, borderRadius:2, transition:'height 0.15s'}}/>)}
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <div style={{width:7, height:7, borderRadius:'50%', background:'#c0392b'}}/>
        <span style={{fontFamily:T.sans, fontSize:11, color:T2.text3}}>Answer when you're ready.</span>
      </div>
    </div>
    <button onClick={doStop1} style={{...cs.cta, background:'rgba(138,158,132,0.12)', color:T2.text, border:'0.5px solid rgba(138,158,132,0.3)'}}>
      Done →
    </button>
  </>);

  // ── ANALYZING 1 ────────────────────────────────────────────────────────────
  if (phase === 'analyzing1') return grid(
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:220, gap:16}}>
      <div style={{display:'flex', gap:8}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:'rgba(138,158,132,0.6)'}}/>)}</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?18:16, color:T2.text, margin:0, textAlign:'center'}}>Reading your answer…</p>
      <p style={{fontFamily:T.sans, fontSize:12, color:T2.text3, margin:0, textAlign:'center'}}>Looking for structure.</p>
    </div>
  );

  // ── REVEAL ─────────────────────────────────────────────────────────────────
  if (phase === 'reveal' && preResult) {
    const rows = [
      {label:'Point',   quote:preResult.pointQuote,   strength:preResult.pointStrength,   showLate:false},
      {label:'Reason',  quote:preResult.reasonQuote,  strength:preResult.reasonStrength,  showLate:false},
      {label:'Example', quote:preResult.exampleQuote, strength:preResult.exampleStrength,
        showLate:(preResult.exampleStrength==='strong'||preResult.exampleStrength==='present')&&(preResult.exampleTiming>30)},
    ];
    return grid(<>
      <div>
        <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:8}}>What the coach heard</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, color:T2.text, lineHeight:1.4, margin:0, fontStyle:'italic'}}>"{topicRef.current?.question}"</p>
      </div>
      {rows.map((row,i) => (
        <div key={i} style={{opacity:revealRow>i?1:0, transform:revealRow>i?'translateY(0)':'translateY(10px)', transition:'opacity 0.5s ease, transform 0.5s ease'}}>
          <div style={{...cs.card, display:'flex', gap:14, alignItems:'flex-start'}}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:56}}>
              <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2px'}}>{row.label}</div>
              {statusIndicator(row.strength)}
            </div>
            <div style={{flex:1}}>
              {row.quote
                ? <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, fontStyle:'italic', color:T2.text, lineHeight:1.6, margin:0}}>"{row.quote}"</p>
                : <p style={{fontFamily:T.serif, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.4, margin:0, fontStyle:'italic'}}>Not identified</p>
              }
              {row.showLate && <p style={{fontFamily:T.sans, fontSize:11, color:T2.text3, margin:'8px 0 0'}}>Arrived late — earlier would have been stronger</p>}
            </div>
          </div>
        </div>
      ))}
      {revealCoach && (
        <>
          <div style={{background:'#0A0804', borderRadius:8, padding:isDesktop?'28px 32px':'22px 22px', border:'0.5px solid rgba(138,158,132,0.15)'}}>
            <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:14}}>Your AmplifyU Coach Says</div>
            <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, color:'rgba(245,239,230,0.92)', lineHeight:1.4, margin:'0 0 12px'}}>{preResult.coachInsight}</p>
            <p style={{fontFamily:T.serif, fontSize:isDesktop?15:14, color:'rgba(138,158,132,0.85)', lineHeight:1.55, margin:0, fontStyle:'italic'}}>{preResult.q2Instruction}</p>
          </div>
          <p style={{fontFamily:T.sans, fontSize:12, color:T2.text3, textAlign:'center', margin:0}}>Ready for question two?</p>
          <button onClick={() => { thinkingTargetRef.current='rec2'; setPhase('thinking'); }} style={cs.sageCta}>
            Next Question →
          </button>
        </>
      )}
    </>);
  }

  // ── REC 2 ──────────────────────────────────────────────────────────────────
  if (phase === 'rec2') return grid(<>
    <div style={cs.card}>
      <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:'rgba(138,158,132,0.55)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:12}}>Question 2</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:'0 0 20px'}}>"{topicRef.current?.q2}"</p>
      <div style={{display:'flex', alignItems:'center', gap:2, height:40, marginBottom:14}}>
        {waveVals.map((v,i)=><div key={i} style={{flex:1, height:Math.round(v*34)+'px', background:`rgba(138,158,132,${0.3+v*0.5})`, borderRadius:2, transition:'height 0.15s'}}/>)}
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <div style={{width:7, height:7, borderRadius:'50%', background:'#c0392b'}}/>
        <span style={{fontFamily:T.sans, fontSize:11, color:T2.text3}}>Answer when you're ready.</span>
      </div>
    </div>
    <button onClick={doStop2} style={{...cs.cta, background:'rgba(138,158,132,0.12)', color:T2.text, border:'0.5px solid rgba(138,158,132,0.3)'}}>
      Done →
    </button>
  </>);

  // ── ANALYZING 2 ────────────────────────────────────────────────────────────
  if (phase === 'analyzing2') return grid(
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:220, gap:16}}>
      <div style={{display:'flex', gap:8}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:'rgba(138,158,132,0.6)'}}/>)}</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?18:16, color:T2.text, margin:0, textAlign:'center'}}>Comparing your two answers…</p>
      <p style={{fontFamily:T.sans, fontSize:12, color:T2.text3, margin:0, textAlign:'center'}}>Looking for structural shift.</p>
    </div>
  );

  // ── DEBRIEF ────────────────────────────────────────────────────────────────
  if (phase === 'debrief' && debriefResult) {
    const d = debriefResult;
    const q1cols = [{label:'Point',strength:preResult?.pointStrength},{label:'Reason',strength:preResult?.reasonStrength},{label:'Example',strength:preResult?.exampleStrength}];
    const q2cols = [{label:'Point',strength:d.q2PointStrength},{label:'Reason',strength:d.q2ReasonStrength},{label:'Example',strength:d.q2ExampleStrength}];
    return (
      <div style={{display:'flex', flexDirection:'column', gap:isDesktop?14:12}}>
        <div style={{background:'#0A0804', borderRadius:8, padding:isDesktop?'28px 32px':'22px 22px', border:'0.5px solid rgba(138,158,132,0.15)'}}>
          <div style={{fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:14}}>Your AmplifyU Coach Says</div>
          <p style={{fontFamily:T.serif, fontSize:isDesktop?22:18, color:'rgba(245,239,230,0.92)', lineHeight:1.4, margin:0}}>{d.headlineVerdict}</p>
        </div>
        <div style={cs.card}>
          <div style={cs.label}>Your Two Answers</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
            {[{hdr:'Question 1',cols:q1cols},{hdr:'Question 2',cols:q2cols}].map(({hdr,cols},ci)=>(
              <div key={ci}>
                <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T2.text3, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:10}}>{hdr}</div>
                {cols.map((r,i)=>(
                  <div key={i} style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                    {statusIndicator(r.strength)}
                    <span style={{fontFamily:T.sans, fontSize:isDesktop?12:11, color:T2.text}}>{r.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{marginTop:10, padding:'8px 12px', borderRadius:4, background:d.improvement?'rgba(82,112,96,0.08)':'transparent', border:d.improvement?'0.5px solid rgba(82,112,96,0.25)':'none'}}>
            <p style={{fontFamily:T.sans, fontSize:12, color:d.improvement?'rgba(82,112,96,0.9)':T2.text3, margin:0, fontStyle:'italic'}}>
              {d.improvement ? 'Structure strengthened in Q2' : 'Consistency across both — now make it instinct'}
            </p>
          </div>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text3, lineHeight:1.6, margin:'12px 0 0'}}>{d.comparisonInsight}</p>
        </div>
        <div style={cs.card}>
          <div style={cs.label}>Take This Into Your Next Meeting</div>
          <div style={{display:'inline-block', padding:'10px 18px', background:'rgba(138,158,132,0.1)', borderRadius:20, border:'0.5px solid rgba(138,158,132,0.3)'}}>
            <p style={{fontFamily:T.serif, fontSize:isDesktop?16:14, fontStyle:'italic', color:T2.text, margin:0, lineHeight:1.4}}>{d.takeaway}</p>
          </div>
        </div>
        <div style={{display:'flex', gap:10, flexDirection:isDesktop?'row':'column'}}>
          <button onClick={reset} style={{...cs.ghost, flex:1}}>Try Again</button>
          <button style={{...cs.sageCta, flex:1}}>Continue →</button>
        </div>
      </div>
    );
  }

  return null;
}
