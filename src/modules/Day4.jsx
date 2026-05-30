import { useState, useEffect, useMemo } from 'react';
import { T } from '../theme.js';

export function D4SimFeedback({input}) {
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false);
  const avgLen = (s) => { const sents = s.match(/[^.!?]+[.!?]+/g)||[]; if (!sents.length) return 0; return Math.round(sents.reduce((a,s)=>a+s.trim().split(/\s+/).length,0)/sents.length); };
  const longSents = (s) => (s.match(/[^.!?]+[.!?]+/g)||[]).filter(s=>s.trim().split(/\s+/).length>20);
  async function analyse() {
    if (!input.trim()) return; setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`Analyse this for sentence length and brevity. Return JSON: {score:number(1-10),avgWords:number,longestSentence:string,rewrite:"same message in short sentences",tip:"one actionable improvement"}\n\n"${input}"`}]})});
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
  async function go(){if(!v.trim())return;setL(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:`Split into short sentences under 15 words each. Return ONLY the split version: "${v}"`}]})});const d=await res.json();setR((d.content||[]).map(b=>b.text||"").join("").trim());}catch{setR("Split at every 'and', 'but', 'which', or 'that'.");}setL(false);}
  return(<div><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Paste a long sentence…" style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:60,marginBottom:4,boxSizing:"border-box"}}/>{v&&<p style={{fontSize:11,color:wc>15?"#B05C4A":"#527060",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>{wc} words{wc>15?" — too long":""}</p>}<button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?10:0}}>{l?"Splitting…":"Split It →"}</button>{r&&<div style={{padding:"12px 14px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#2C2416",margin:0,lineHeight:1.6}}>{r}</p></div>}</div>);
}
export function D4MobileSim() {
  const [v,setV]=useState(""); const [r,setR]=useState(null); const [l,setL]=useState(false);
  async function go(){if(!v.trim())return;setL(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:`Score this for sentence brevity (target <15 words each). Return JSON: {score:number,avgWords:number,rewrite:"shorter version"}\n\n"${v}"`}]})});const d=await res.json();const raw=(d.content||[]).map(b=>b.text||"").join("").trim();try{const m=raw.match(/\{[\s\S]*\}/);setR(JSON.parse(m[0]));}catch{setR({score:7,avgWords:18,rewrite:"Break each idea into its own sentence. Aim for under 15 words."});}}catch{setR(null);}setL(false);}
  return(<div><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Write using only short sentences…" style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:100,marginBottom:8,boxSizing:"border-box"}}/><button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?10:0}}>{l?"Analysing…":"Get Brevity Score →"}</button>{r&&<div style={{display:"flex",flexDirection:"column",gap:8}}><div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#EDE8DF",borderRadius:3}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:600,color:"#2C2416",lineHeight:1}}>{r.score}<span style={{fontSize:16,color:"#8A9E84"}}>/10</span></span><span style={{fontSize:11,color:"#6B5E44",fontFamily:"'Inter',sans-serif"}}>Avg. ~{r.avgWords} words/sentence</span></div>{r.rewrite&&<div style={{padding:"10px 12px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:"#2C2416",margin:0,lineHeight:1.6}}>{r.rewrite}</p></div>}</div>}</div>);
}

// ─── D4 Practice Widget ───────────────────────────────────────────────────────
export function D4PracticeWidget({T, T2, isDesktop, onNavLabel, onNavFn}) {
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [memPhase, setMemPhase] = useState('start'); // 'start'|'showing'|'asking'
  const [memSecs, setMemSecs] = useState(5);
  const memRef = useRef(null);

  const ROUNDS = [
    {
      id:'memory', title:"THE MEMORY CHALLENGE",
      intro:"Look at this list for 5 seconds. Try to remember as many as you can.",
      items:["Red umbrella","Dog","Train ticket","Blue bicycle","Coffee","Keys","Sunglasses","Backpack"],
      shortItems:["🚲 Blue bicycle","☕ Coffee","🔑 Keys","🎒 Backpack"],
      question:"How many did you remember?",
      options:[{label:"1–3 items",correct:false},{label:"4–5 items",correct:false},{label:"6–7 items",correct:false},{label:"All 8",correct:false}],
      lesson:"Your brain can only hold a handful of items at once. The shorter list is easier to remember because there is less information competing for your attention. This is Miller's Law in action.",
    },
    {
      id:'netflix', title:"THE NETFLIX TEST",
      intro:"Which version would you rather listen to?",
      versions:[
        {label:"Version A", text:"Last weekend I started a new show that my friend recommended because she said it had great reviews and after watching three episodes I understood why everyone was talking about it."},
        {label:"Version B", text:"Last weekend I started a new show.\n\nA friend recommended it.\n\nAfter three episodes, I understood the hype."},
      ],
      question:"Which would you rather listen to?",
      options:[{label:"Version A",correct:false},{label:"Version B",correct:true}],
      lesson:"The information is identical — but Version B delivers it in smaller chunks that are easier to process. Great communicators don't overwhelm. They deliver one idea at a time.",
    },
    {
      id:'simon', title:"SIMON SAYS",
      intro:"Follow these instructions.",
      rounds:[
        {label:"Round 1", items:["Touch your nose."]},
        {label:"Round 2", items:["Touch your nose.","Clap twice.","Point left.","Touch your shoulder.","Blink.","Raise your hand."]},
      ],
      splitItems:["Touch your nose.","Clap twice.","Point left.","Touch your shoulder."],
      question:"Which round felt easier?",
      options:[{label:"Round 1 — obviously",correct:true},{label:"About the same",correct:false},{label:"Round 2 — I like a challenge",correct:false}],
      lesson:"Miller's Law isn't just about words. It's about mental load. When information arrives one step at a time, the brain performs better.",
    },
    {
      id:'directions', title:"THE DIRECTIONS TEST",
      intro:"Could you follow these directions right now?",
      longText:"Leave the station, walk past the bakery, take the second right after the traffic lights, continue for three blocks until you see the church, cross the road, then look for the green building.",
      shortItems:["Leave the station.","Walk past the bakery.","Take the second right.","Look for the green building."],
      question:"How easy was Version A to follow?",
      options:[{label:"Easy — I've got it",correct:false},{label:"I'd have to read it twice",correct:true},{label:"I'd need to write it down",correct:false}],
      lesson:"The brain prefers information in manageable chunks. When instructions are broken into steps, they become easier to understand, remember, and act upon.",
    },
    {
      id:'scroll', title:"THE SCROLL TEST",
      intro:"Which version is easier to remember?",
      versions:[
        {label:"Version A", text:"To make a great first impression, maintain eye contact, speak clearly, stand with confidence, listen carefully to others, and ensure your body language matches your message."},
        {label:"Version B", text:"• Make eye contact.\n• Speak clearly.\n• Stand with confidence.\n• Listen carefully.\n• Match your body language."},
      ],
      question:"Which version could you repeat back right now?",
      options:[{label:"Version A",correct:false},{label:"Version B — instantly",correct:true}],
      lesson:"Humans are incredibly good at detecting cognitive effort. When information is broken into smaller chunks, it feels easier to process, remember, and act on. That's why great communicators use short sentences.",
    },
  ];

  useEffect(()=>{
    if(memPhase==='showing'&&memSecs>0){
      memRef.current=setTimeout(()=>setMemSecs(s=>s-1),1000);
    } else if(memPhase==='showing'&&memSecs===0){
      setMemPhase('asking');
    }
    return ()=>clearTimeout(memRef.current);
  },[memPhase,memSecs]);

  useEffect(()=>{
    if(!onNavLabel) return;
    if(phase==='intro'){
      if(onNavFn) onNavFn.current=()=>{setPhase('playing');setRound(0);setSelected(null);setShowFeedback(false);setMemPhase('start');setMemSecs(5);};
      onNavLabel('Begin Challenge');
    } else {
      if(onNavFn) onNavFn.current=null;
      onNavLabel(null);
    }
  },[phase]);

  const cs={
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };

  function advanceRound(){
    const next=round+1;
    setSelected(null);setShowFeedback(false);setMemPhase('start');setMemSecs(5);
    if(next<ROUNDS.length){setRound(next);}else{setPhase('done');}
  }

  if(phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Mission</div>
        <p style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,margin:"0 0 8px"}}>
          Feel why short sentences win — in your own brain.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          {["Test your memory against Miller's Law.","Notice how chunked information feels clearer.","Build the reflex to break ideas into smaller pieces."].map((t,i)=>(
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
            {n:1,label:"Memory"},
            {n:2,label:"Netflix Test"},
            {n:3,label:"Simon Says"},
            {n:4,label:"Directions"},
            {n:5,label:"Scroll Test"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?38:32,height:isDesktop?38:32,borderRadius:"50%",border:"1.5px solid "+(i===0?T.gold:"rgba(138,158,132,0.45)"),background:i===0?"rgba(138,158,132,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:5}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?13:11,fontWeight:700,color:i===0?T.gold:T2.text3}}>{r.n}</span>
                </div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?12:10,color:T2.text3,fontWeight:500,textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?72:50}}>{r.label}</div>
              </div>
              {i<4&&<div style={{height:1,width:isDesktop?8:3,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:20}}/>}
            </div>
          ))}
        </div>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>How You Win</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>Earn points for:</p>
        <div style={{display:"flex",gap:isDesktop?8:6,flexWrap:"wrap"}}>
          {["Clarity","Brevity","Simplicity","Cognitive Ease"].map((s,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:isDesktop?"10px 12px":"8px 10px",background:T2.bg,borderRadius:6,border:"0.5px solid "+T2.border,flex:1,minWidth:isDesktop?70:56}}>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:11,color:"#A8998A",fontWeight:400,textAlign:"center",lineHeight:1.3}}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{...cs.card,display:"flex",gap:16,alignItems:"center"}}>
        <img src="/badge-knight.jpg" alt="Sentence Surgeon" style={{width:isDesktop?72:56,height:isDesktop?72:56,borderRadius:6,objectFit:"cover",border:"1.5px solid rgba(138,158,132,0.3)",flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:4}}>The Reward</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T2.text,marginBottom:6}}>Sentence Surgeon</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?16:13,fontWeight:600,color:T.gold,lineHeight:1.2,margin:0}}>Complete the challenge to unlock the Sentence Surgeon badge.</p>
        </div>
      </div>
      <button onClick={()=>{setPhase('playing');setRound(0);setSelected(null);setShowFeedback(false);setMemPhase('start');setMemSecs(5);}} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Start the Miller's Law Challenge →</button>
    </div>
  );

  if(phase==='playing'){
    const r=ROUNDS[round];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
        {/* Progress bar */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",flexShrink:0}}>Round {round+1} of {ROUNDS.length}</div>
          <div style={{flex:1,height:2,background:T2.border,borderRadius:2}}>
            <div style={{height:"100%",width:(((round+1)/ROUNDS.length)*100)+"%",background:T.gold,borderRadius:2,transition:"width 0.4s ease"}}/>
          </div>
        </div>

        {/* ── ROUND 1: MEMORY CHALLENGE ── */}
        {r.id==='memory' && (
          <>
            <div style={cs.card}>
              <div style={cs.label}>{r.title}</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,marginBottom:16,lineHeight:1.5}}>{r.intro}</p>
              {memPhase==='start' && (
                <button onClick={()=>setMemPhase('showing')} style={cs.cta}>Start 5-second timer →</button>
              )}
              {memPhase==='showing' && (
                <>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                    <div style={{fontFamily:T.serif,fontSize:isDesktop?40:32,fontWeight:600,color:T.gold,lineHeight:1,flexShrink:0}}>{memSecs}</div>
                    <div style={{flex:1,height:4,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:((memSecs/5)*100)+"%",background:T.gold,borderRadius:2,transition:"width 1s linear"}}/>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {r.items.map((item,i)=>(
                      <div key={i} style={{padding:"10px 14px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border,fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text}}>{item}</div>
                    ))}
                  </div>
                </>
              )}
              {memPhase==='asking' && !showFeedback && (
                <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,fontWeight:600,color:T2.text,lineHeight:1.5,margin:0}}>{r.question}</p>
              )}
            </div>
            {memPhase==='asking' && !showFeedback && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {r.options.map((opt,i)=>(
                  <button key={i} onClick={()=>{setSelected(i);setShowFeedback(true);}}
                    style={{padding:"14px 16px",borderRadius:4,border:`0.5px solid ${selected===i?T.gold:T2.border}`,background:selected===i?"rgba(138,158,132,0.08)":"transparent",color:T2.text,fontSize:isDesktop?15:14,fontFamily:T.sans,textAlign:"left",cursor:"pointer",lineHeight:1.5,transition:"all 0.2s"}}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {showFeedback && (
              <>
                <div style={cs.card}>
                  <div style={cs.label}>Now try the shorter list</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                    {r.shortItems.map((item,i)=>(
                      <div key={i} style={{padding:"10px 14px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border,fontFamily:T.sans,fontSize:isDesktop?16:15,color:T2.text,fontWeight:500}}>{item}</div>
                    ))}
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:0,lineHeight:1.5,fontStyle:"italic"}}>How many can you remember now?</p>
                </div>
                <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
                  <div style={cs.label}>Miller's Law in action</div>
                  <p style={{fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.65,margin:0}}>{r.lesson}</p>
                </div>
                <button onClick={advanceRound} style={cs.cta}>Round 2 →</button>
              </>
            )}
          </>
        )}

        {/* ── ROUND 2: NETFLIX TEST ── */}
        {r.id==='netflix' && (
          <>
            <div style={cs.card}>
              <div style={cs.label}>{r.title}</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,marginBottom:14,lineHeight:1.5}}>{r.intro}</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {r.versions.map((v,i)=>(
                  <div key={i} style={{padding:"14px 16px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
                    <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>{v.label}</div>
                    <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.6,margin:0,whiteSpace:"pre-line"}}>{v.text}</p>
                  </div>
                ))}
              </div>
              {!showFeedback && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,lineHeight:1.5,marginTop:16,marginBottom:0}}>{r.question}</p>}
            </div>
            {!showFeedback && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {r.options.map((opt,i)=>(
                  <button key={i} onClick={()=>{setSelected(i);setShowFeedback(true);}}
                    style={{padding:"14px 16px",borderRadius:4,border:`0.5px solid ${selected===i?(opt.correct?T.gold:"rgba(180,80,60,0.4)"):T2.border}`,background:selected===i?(opt.correct?"rgba(138,158,132,0.08)":"rgba(180,80,60,0.04)"):"transparent",color:T2.text,fontSize:isDesktop?15:14,fontFamily:T.sans,textAlign:"left",cursor:"pointer",lineHeight:1.5,transition:"all 0.2s"}}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {showFeedback && (
              <>
                <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
                  <div style={cs.label}>AmplifyU Insight</div>
                  <p style={{fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.65,margin:0}}>{r.lesson}</p>
                </div>
                <button onClick={advanceRound} style={cs.cta}>Round 3 →</button>
              </>
            )}
          </>
        )}

        {/* ── ROUND 3: SIMON SAYS ── */}
        {r.id==='simon' && (
          <>
            <div style={cs.card}>
              <div style={cs.label}>{r.title}</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,marginBottom:16,lineHeight:1.5}}>{r.intro}</p>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {r.rounds.map((rd,ri)=>(
                  <div key={ri} style={{padding:"14px 16px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
                    <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>{rd.label}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      {rd.items.map((item,ii)=>(
                        <p key={ii} style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text,margin:0,lineHeight:1.5}}>{item}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {!showFeedback && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,lineHeight:1.5,marginTop:16,marginBottom:0}}>{r.question}</p>}
            </div>
            {!showFeedback && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {r.options.map((opt,i)=>(
                  <button key={i} onClick={()=>{setSelected(i);setShowFeedback(true);}}
                    style={{padding:"14px 16px",borderRadius:4,border:`0.5px solid ${selected===i?T.gold:T2.border}`,background:selected===i?"rgba(138,158,132,0.08)":"transparent",color:T2.text,fontSize:isDesktop?15:14,fontFamily:T.sans,textAlign:"left",cursor:"pointer",lineHeight:1.5,transition:"all 0.2s"}}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {showFeedback && (
              <>
                <div style={cs.card}>
                  <div style={cs.label}>Now try it chunked</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {r.splitItems.map((item,i)=>(
                      <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:i<r.splitItems.length-1?"0.5px solid "+T2.divider:"none"}}>
                        <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"0.5px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold}}>{i+1}</span>
                        </div>
                        <span style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text}}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:"12px 0 0",lineHeight:1.5,fontStyle:"italic"}}>Feels easier, doesn't it?</p>
                </div>
                <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
                  <div style={cs.label}>AmplifyU Insight</div>
                  <p style={{fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.65,margin:0}}>{r.lesson}</p>
                </div>
                <button onClick={advanceRound} style={cs.cta}>Round 4 →</button>
              </>
            )}
          </>
        )}

        {/* ── ROUND 4: DIRECTIONS TEST ── */}
        {r.id==='directions' && (
          <>
            <div style={cs.card}>
              <div style={cs.label}>{r.title}</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,marginBottom:14,lineHeight:1.5}}>{r.intro}</p>
              <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border,marginBottom:showFeedback?0:12}}>
                <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.6,margin:0}}>{r.longText}</p>
              </div>
              {!showFeedback && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,lineHeight:1.5,marginTop:12,marginBottom:0}}>{r.question}</p>}
            </div>
            {!showFeedback && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {r.options.map((opt,i)=>(
                  <button key={i} onClick={()=>{setSelected(i);setShowFeedback(true);}}
                    style={{padding:"14px 16px",borderRadius:4,border:`0.5px solid ${selected===i?T.gold:T2.border}`,background:selected===i?"rgba(138,158,132,0.08)":"transparent",color:T2.text,fontSize:isDesktop?15:14,fontFamily:T.sans,textAlign:"left",cursor:"pointer",lineHeight:1.5,transition:"all 0.2s"}}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {showFeedback && (
              <>
                <div style={cs.card}>
                  <div style={cs.label}>Now compare</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {r.shortItems.map((item,i)=>(
                      <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:i<r.shortItems.length-1?"0.5px solid "+T2.divider:"none"}}>
                        <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"0.5px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold}}>{i+1}</span>
                        </div>
                        <span style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text}}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:"10px 0 0",fontStyle:"italic",lineHeight:1.5}}>Same information. Much easier to follow.</p>
                </div>
                <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
                  <div style={cs.label}>AmplifyU Insight</div>
                  <p style={{fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.65,margin:0}}>{r.lesson}</p>
                </div>
                <button onClick={advanceRound} style={cs.cta}>Round 5 →</button>
              </>
            )}
          </>
        )}

        {/* ── ROUND 5: SCROLL TEST ── */}
        {r.id==='scroll' && (
          <>
            <div style={cs.card}>
              <div style={cs.label}>{r.title}</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,marginBottom:14,lineHeight:1.5}}>{r.intro}</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {r.versions.map((v,i)=>(
                  <div key={i} style={{padding:"14px 16px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
                    <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>{v.label}</div>
                    <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.6,margin:0,whiteSpace:"pre-line"}}>{v.text}</p>
                  </div>
                ))}
              </div>
              {!showFeedback && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,lineHeight:1.5,marginTop:16,marginBottom:0}}>{r.question}</p>}
            </div>
            {!showFeedback && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {r.options.map((opt,i)=>(
                  <button key={i} onClick={()=>{setSelected(i);setShowFeedback(true);}}
                    style={{padding:"14px 16px",borderRadius:4,border:`0.5px solid ${selected===i?(opt.correct?T.gold:"rgba(180,80,60,0.4)"):T2.border}`,background:selected===i?(opt.correct?"rgba(138,158,132,0.08)":"rgba(180,80,60,0.04)"):"transparent",color:T2.text,fontSize:isDesktop?15:14,fontFamily:T.sans,textAlign:"left",cursor:"pointer",lineHeight:1.5,transition:"all 0.2s"}}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {showFeedback && (
              <>
                <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
                  <div style={cs.label}>AmplifyU Insight</div>
                  <p style={{fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.65,margin:0}}>{r.lesson}</p>
                </div>
                <button onClick={advanceRound} style={cs.cta}>See Your Results →</button>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  if(phase==='done') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"32px":"24px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Challenge Complete</div>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>Sentence Surgeon</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:"#A8998A",lineHeight:1.65,margin:"0 0 20px"}}>You've experienced Miller's Law five ways. Your brain now knows — short sentences aren't just cleaner. They're kinder to everyone listening.</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"Short sentences give ideas space to land."</p>
      </div>
      <button onClick={()=>{setPhase('intro');setRound(0);setSelected(null);setShowFeedback(false);setMemPhase('start');setMemSecs(5);}} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"8px 0",textAlign:"center",width:"100%"}}>Play again</button>
    </div>
  );

  return null;
}

// ─── dead code removed ──
function _unusedD4OldRounds() {
  const PINNED = {
    title:"THE SCROLL TEST",
    prompt:"Imagine this lands in your inbox. Which one do you actually read?",
    versions:[
      {label:"Version A", text:'We need to have a meeting about the project because there have been some issues with the timeline and the deadline is coming up and people aren\'t entirely sure what they\'re supposed to be doing which is causing a bit of confusion and we really need to get everyone aligned and on the same page before things get worse.'},
      {label:"Version B", text:"We need a meeting.\n\nThe deadline is close.\n\nPeople aren't sure what to do.\n\nLet's get aligned before it gets worse."},
    ],
    options:[{label:"Version A — the dense paragraph",correct:false},{label:"Version B — short, scannable lines",correct:true}],
    feedback:"Dense paragraphs lose readers instantly. Short sentences with breathing space get read every time.",
  };

  const BANK = [
    {
      title:"CUT IT IN HALF",
      type:"write",
      prompt:"Rewrite this sentence using half the words. Every word you cut increases impact.",
      quote:'"At this moment in time I\'m currently trying to decide what I want to eat."',
      placeholder:"Your shorter version…",
      originalWords:13,
      reveal:'"I\'m deciding what to eat."',
      feedback:"Shorter communication often feels clearer and more confident.",
      aiPrompt:(input)=>`The user was asked to rewrite this sentence using half the words (original: "At this moment in time I'm currently trying to decide what I want to eat." — 13 words, target: ~6-7 words). Ideal answer: "I'm deciding what to eat." (5 words). Their attempt: "${input}" (${input.trim().split(/\s+/).length} words). Return ONLY valid JSON: {"words":${input.trim().split(/\s+/).length},"shorter":${input.trim().split(/\s+/).length<=9},"praise":"<one warm specific sentence about what they did well — max 12 words>","tip":"<one gentle improvement if needed — max 10 words, or empty string if great>"}`,
    },
    {
      title:"SPLIT THE SENTENCE",
      type:"write",
      prompt:"Split this into shorter sentences. One idea per sentence.",
      quote:'"I went to the supermarket after work and forgot my wallet but luckily my friend was there and she paid for everything which was really kind of her."',
      placeholder:"Your split version…",
      reveal:'"I went to the supermarket after work. I forgot my wallet. Luckily, my friend was there. She paid for everything. It was really kind of her."',
      feedback:"One idea per sentence is easier for the brain to process and remember.",
      aiPrompt:(input)=>`The user was asked to split this sentence into shorter sentences: "I went to the supermarket after work and forgot my wallet but luckily my friend was there and she paid for everything which was really kind of her." Their version: "${input}". Count how many sentences they created. Return ONLY valid JSON: {"sentences":<number of sentences they wrote>,"improved":${true},"praise":"<one warm specific sentence — max 12 words>","tip":"<one gentle tip if needed — max 10 words, or empty string>"}`,
    },
    {
      title:"THE BRAIN PREFERS SIMPLE",
      prompt:"Which version is easier to understand?",
      versions:[
        {label:"Version A", text:'"The atmospheric conditions suggest a high probability of precipitation later this evening."'},
        {label:"Version B", text:'"It\'s probably going to rain tonight."'},
      ],
      options:[{label:"Version A",correct:false},{label:"Version B",correct:true}],
      feedback:"The brain absorbs information faster when sentences are shorter and simpler. Every word you cut reduces cognitive load.",
    },
    {
      title:"THE BREATH TEST",
      prompt:"Read both versions out loud. Actually say them.",
      versions:[
        {label:"Version A", text:'"I wanted to ask whether anyone might potentially want to go out for dinner later this evening."'},
        {label:"Version B", text:'"Does anyone want dinner later?"'},
      ],
      question:"Which one felt easier to say?",
      options:[{label:"Version A — the longer one",correct:false},{label:"Version B — the shorter one",correct:true}],
      feedback:"If a sentence is hard to say out loud, it's hard for your audience to follow. Shorter sentences breathe better.",
    },
    {
      title:"SAY IT LIKE ATTENBOROUGH",
      prompt:"David Attenborough explains science so simply a child could understand it. Which version sounds most like him?",
      quote:'"Photosynthesis is the biochemical process through which plants convert light energy into chemical energy."',
      options:[
        {label:"Photosynthesis enables plants to synthesise glucose from light-dependent reactions.",correct:false},
        {label:"Plants use sunlight to make food.",correct:true},
        {label:"Through photosynthesis, solar energy is converted into storable chemical energy.",correct:false},
        {label:"Light energy drives the conversion of carbon dioxide into organic compounds.",correct:false},
      ],
      feedback:"Simple communication demonstrates deeper understanding. If you can't explain it simply, you don't fully understand it yet.",
    },
    {
      title:"REMOVE THE CLUTTER",
      prompt:"Which is the cleaner version?",
      quote:'"I just wanted to quickly let you know that I\'m probably going to be slightly late."',
      options:[
        {label:"I just wanted to quickly let you know that I'm probably going to be slightly late.",correct:false},
        {label:"I'm going to be late.",correct:true},
      ],
      feedback:"Most unclear sentences are overloaded with extra words. Clear communicators remove friction before they add.",
    },
    {
      title:"ONE THOUGHT. ONE SENTENCE.",
      prompt:"Which version feels clearer?",
      versions:[
        {label:"Version A", text:'"We decided to leave early because the weather was changing quickly and we didn\'t want to get stuck in traffic."'},
        {label:"Version B", text:'"The weather was changing quickly. We decided to leave early. We didn\'t want to get stuck in traffic."'},
      ],
      options:[{label:"Version A",correct:false},{label:"Version B",correct:true}],
      feedback:"The brain remembers information better when each idea gets its own sentence. One thought. Full stop. Next thought.",
    },
  ];

  const ROUNDS = useMemo(()=>{
    const shuffled=[...BANK].sort(()=>Math.sin(seed*9301+seed*49297)*0.5);
    return [PINNED, ...shuffled.slice(0,4)];
  },[seed]);

  function resetWrite(){setWriteInput('');setWriteResult(null);setWriteLoading(false);}

  async function handleWriteSubmit(r){
    if(!writeInput.trim()) return;
    if(r.aiPrompt){
      setWriteLoading(true);
      try{
        const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:r.aiPrompt(writeInput)}]})});
        const d=await res.json();
        const raw=(d.content||[]).map(b=>b.text||'').join('').trim();
        const m=raw.match(/\{[\s\S]*\}/);
        setWriteResult(JSON.parse(m[0]));
      }catch{setWriteResult({praise:"Great effort — you're thinking about brevity.",tip:""});}
      setWriteLoading(false);
    }
    setShowFeedback(true);
  }

  useEffect(()=>{
    if(!onNavLabel) return;
    if(phase==='intro'){
      if(onNavFn) onNavFn.current=()=>{setPhase('playing');setRound(0);setSelected(null);setShowFeedback(false);resetWrite();};
      onNavLabel('Begin Challenge');
    } else {
      if(onNavFn) onNavFn.current=null;
      onNavLabel(null);
    }
  },[phase]);

  const cs={
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };

  if(phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Mission</div>
        <p style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,margin:"0 0 8px"}}>
          Train your brain to prefer short, clear sentences.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          {["Experience how shorter sentences feel clearer instantly.","Practise splitting long sentences into short ones.","Build the reflex to cut — not add."].map((t,i)=>(
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
          {[1,2,3,4,5].map((n,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?38:32,height:isDesktop?38:32,borderRadius:"50%",border:"1.5px solid "+(i===0?T.gold:"rgba(138,158,132,0.45)"),background:i===0?"rgba(138,158,132,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:5}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?13:11,fontWeight:700,color:i===0?T.gold:T2.text3}}>{n}</span>
                </div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?12:10,color:T2.text3,fontWeight:500,textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?72:50}}>
                  {["Round 1","Round 2","Round 3","Round 4","Round 5"][i]}
                </div>
              </div>
              {i<4&&<div style={{height:1,width:isDesktop?8:3,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:20}}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>How You Win</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>Earn points for:</p>
        <div style={{display:"flex",gap:isDesktop?8:6,flexWrap:"wrap"}}>
          {["Clarity","Brevity","Simplicity","Cognitive Ease"].map((s,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:isDesktop?"10px 12px":"8px 10px",background:T2.bg,borderRadius:6,border:"0.5px solid "+T2.border,flex:1,minWidth:isDesktop?70:56}}>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:11,color:"#A8998A",fontWeight:400,textAlign:"center",lineHeight:1.3}}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{...cs.card,display:"flex",gap:16,alignItems:"center"}}>
        <img src="/badge-knight.jpg" alt="Sentence Surgeon" style={{width:isDesktop?72:56,height:isDesktop?72:56,borderRadius:6,objectFit:"cover",border:"1.5px solid rgba(138,158,132,0.3)",flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:4}}>The Reward</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T2.text,marginBottom:6}}>Sentence Surgeon</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?16:13,fontWeight:600,color:T.gold,lineHeight:1.2,margin:0}}>Complete the challenge to unlock the Sentence Surgeon badge.</p>
        </div>
      </div>

      <button onClick={()=>{setPhase('playing');setRound(0);setSelected(null);setShowFeedback(false);}} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Start the Short Sentences Challenge →</button>
    </div>
  );

  if(phase==='playing'){
    const r=ROUNDS[round];
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
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:r.question?12:0}}>
              {r.versions.map((v,i)=>(
                <div key={i} style={{padding:"12px 14px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
                  <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{v.label}</div>
                  <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,color:T2.text,lineHeight:1.4,margin:0,whiteSpace:"pre-line"}}>{v.text}</p>
                </div>
              ))}
            </div>
          )}
          {r.instruction && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,margin:0}}>{r.instruction}</p>}
          {r.question && !showFeedback && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,lineHeight:1.5,marginTop:14,marginBottom:0}}>{r.question}</p>}
        </div>

        {/* MCQ options */}
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

        {/* Write rounds — textarea + AI */}
        {r.type==='write' && !showFeedback && (
          <>
            <textarea
              value={writeInput}
              onChange={e=>setWriteInput(e.target.value)}
              placeholder={r.placeholder}
              style={{width:"100%",minHeight:isDesktop?80:72,background:"transparent",border:"0.5px solid "+T2.border,borderRadius:4,padding:"12px 14px",fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}
            />
            <button
              onClick={()=>handleWriteSubmit(r)}
              disabled={!writeInput.trim()||writeLoading}
              style={{...cs.cta,background:!writeInput.trim()||writeLoading?"rgba(44,36,22,0.25)":T.ink,cursor:!writeInput.trim()||writeLoading?"not-allowed":"pointer"}}>
              {writeLoading?"Checking…":"Get AI Feedback →"}
            </button>
          </>
        )}

        {/* Action rounds (no options, no write) */}
        {!r.options && r.type!=='write' && !showFeedback && (
          <button onClick={()=>setShowFeedback(true)} style={cs.cta}>{r.action} →</button>
        )}

        {showFeedback && (
          <>
            {/* Write feedback with AI result */}
            {r.type==='write' && writeResult && (
              <div style={{...cs.card,background:"rgba(138,158,132,0.06)",borderLeft:"2px solid "+T.gold}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={cs.label}>AI Coach</div>
                  {writeResult.words&&<span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,marginLeft:"auto"}}>{writeResult.words} words{r.originalWords?` (was ${r.originalWords})`:''}</span>}
                </div>
                <p style={{fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.65,margin:writeResult.tip?"0 0 8px":0}}>{writeResult.praise}</p>
                {writeResult.tip&&<p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5,margin:0,fontStyle:"italic"}}>{writeResult.tip}</p>}
              </div>
            )}
            {r.type==='write' && writeInput && (
              <div style={{...cs.card,background:"rgba(44,36,22,0.03)"}}>
                <div style={cs.label}>Your version</div>
                <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.4,margin:"0 0 10px",fontStyle:"italic"}}>"{writeInput}"</p>
                {r.reveal&&<><div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>One great version</div><p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.4,margin:0}}>{r.reveal}</p></>}
              </div>
            )}
            {/* Reveal for action rounds */}
            {!r.type && r.reveal && (
              <div style={{...cs.card,background:"rgba(138,158,132,0.04)",borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                <div style={cs.label}>The shorter version</div>
                <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,fontWeight:600,color:T2.text,lineHeight:1.3,margin:0}}>{r.reveal}</p>
              </div>
            )}
            <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
              <div style={cs.label}>Why it works</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.65,margin:0}}>{r.feedback}</p>
            </div>
            <button onClick={()=>{
              if(round<ROUNDS.length-1){setRound(v=>v+1);setSelected(null);setShowFeedback(false);resetWrite();}
              else{setPhase('done');}
            }} style={cs.cta}>
              {round<ROUNDS.length-1?`Round ${round+2} →`:"See Your Results →"}
            </button>
          </>
        )}
      </div>
    );
  }

  if(phase==='done') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"32px":"24px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Challenge Complete</div>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>Sentence Surgeon</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:"#A8998A",lineHeight:1.65,margin:"0 0 24px"}}>You've trained your brain to see complexity — and cut it. Every sentence you shorten from now on is a gift to your listener.</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"Short sentences give ideas space to land."</p>
      </div>
      <button onClick={()=>{setPhase('intro');setRound(0);setSelected(null);setShowFeedback(false);resetWrite();}} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"8px 0",textAlign:"center",width:"100%"}}>Another Round</button>
    </div>
  );

  return null;
}

// ─── D1 Mobile helpers ────────────────────────────────────────────────────────

