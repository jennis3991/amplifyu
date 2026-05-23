import { useState, useRef } from 'react';
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

// ─── D2 SIM WIDGET V2 — premium coaching simulation ──────────────────────────
export function D2SimWidget({T, T2, isDesktop}) {
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

