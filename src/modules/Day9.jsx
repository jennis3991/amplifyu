import { useState } from 'react';

// ─── D9 Practice Widget — Connection Exercises ────────────────────────────
export function D9PracticeWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('intro');
  const [reflections, setReflections] = useState(Array(5).fill(''));
  const [style, setStyle] = useState('');
  const [styleAdapt, setStyleAdapt] = useState('');

  const STYLES = ["Driver","Thinker","Connector","Visionary"];

  const ROUNDS = [
    { label:"Round 1 · Question Upgrade", title:"Replace the default question.", body:'Instead of "What do you do?" try: "What\'s the most interesting thing you\'re working on right now?" Reflect below on what changes when you lead with curiosity instead of category.', placeholder:"What did you notice about the conversation when you asked this?" },
    { label:"Round 2 · The 70/30 Rule", title:"Listen 70%. Speak 30%.", body:"In your next conversation, consciously hold back. Ask questions, then let the other person fill the space. Notice what you learn when you say less.", placeholder:"What did you notice when you listened more than you spoke?" },
    { label:"Round 3 · Empathy Practice", title:"Understand someone you disagree with.", body:"Think of someone whose view differs from yours. Write down: what matters to them, what pressures might they be under, and what perspective might you be missing.", placeholder:"Write your empathy notes here — what matters to them, what pressures they face, what you might be missing…" },
    { label:"Round 4 · Identify Their Style", title:"Which style describes the people around you?", body:"Think of four people you regularly communicate with. For each, ask: are they a Driver (results-focused), Thinker (detail-focused), Connector (relationship-focused), or Visionary (ideas-focused)? How might you adapt?", placeholder:"Write the names and styles of 4 people, and how you'd adapt your communication for each…" },
    { label:"Round 5 · Ask One Better Question", title:'Try this in your next meeting.', body:'"What\'s the biggest challenge you\'re facing right now?" or "What\'s something you\'re genuinely excited about at the moment?" These questions open doors that "How are you?" never does.', placeholder:"Reflect on the response you got, or write the question you plan to use…" },
  ];

  const cs = {
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };

  const roundIdx = phase==='intro' ? -1 : phase==='done' ? 5 : +phase.replace('r','');

  const Progress = ({idx}) => (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:isDesktop?18:14}}>
      <div style={{display:"flex",gap:4,flex:1}}>
        {ROUNDS.map((_,i)=><div key={i} style={{height:3,borderRadius:2,flex:1,background:i<idx?T.gold:i===idx?"rgba(138,158,132,0.6)":T2.border,transition:"background 0.3s"}}/>)}
      </div>
      <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4,flexShrink:0}}>Round {idx+1} of 5</span>
    </div>
  );

  if (phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Mission</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T.gold,lineHeight:1.25,margin:"0 0 14px"}}>Build the habits of the world's most connected communicators.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {["Upgrade the questions you ask.","Practise listening more than you speak.","Build empathy for people who think differently.","Identify the communication styles around you.","Ask one question that opens a real conversation."].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:3}}>✦</span>
              <span style={{fontFamily:T.serif,fontSize:isDesktop?16:14,color:T2.text,lineHeight:1.45}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>The Challenge Journey</div>
        <div style={{display:"flex",alignItems:"flex-start"}}>
          {[{n:1,label:"Question Upgrade"},{n:2,label:"70/30 Rule"},{n:3,label:"Empathy"},{n:4,label:"Identify Styles"},{n:5,label:"Better Question"}].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?42:36,height:isDesktop?42:36,borderRadius:"50%",border:`1.5px solid ${i===0?T.gold:"rgba(138,158,132,0.35)"}`,background:i===0?"rgba(138,158,132,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:6}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?14:12,fontWeight:600,color:i===0?T.gold:"rgba(138,158,132,0.5)"}}>{r.n}</span>
                </div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?11:9,fontWeight:500,color:"#A8998A",textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?72:54}}>{r.label}</div>
              </div>
              {i<4 && <div style={{height:1,width:isDesktop?8:4,background:"rgba(138,158,132,0.25)",flexShrink:0,marginBottom:24}}/>}
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=>setPhase('r0')} style={cs.cta}>Begin the Challenge →</button>
    </div>
  );

  if (roundIdx>=0 && roundIdx<5) {
    const r = ROUNDS[roundIdx];
    const isLast = roundIdx===4;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
        <Progress idx={roundIdx}/>
        <div style={cs.card}>
          <div style={cs.label}>{r.label}</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 12px"}}>{r.title}</p>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:"0 0 16px"}}>{r.body}</p>
          <textarea value={reflections[roundIdx]} onChange={e=>{const n=[...reflections];n[roundIdx]=e.target.value;setReflections(n);}} placeholder={r.placeholder} style={{width:"100%",minHeight:isDesktop?90:75,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
          {reflections[roundIdx].trim().length>5 && (
            <div style={{marginTop:12,padding:"10px 14px",background:"rgba(138,158,132,0.07)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0,lineHeight:1.6}}>Good. Keep practising this. Connection is built through consistent small choices, not occasional grand gestures.</p>
            </div>
          )}
        </div>
        <button onClick={()=>setPhase(isLast?'done':('r'+(roundIdx+1)))} style={cs.cta}>
          {isLast?"Complete the Challenge →":(`Round ${roundIdx+2}: ${ROUNDS[roundIdx+1].label.split('·')[1].trim()} →`)}
        </button>
        {roundIdx>0 && <button onClick={()=>setPhase('r'+(roundIdx-1))} style={{background:"none",border:"none",fontFamily:T.sans,fontSize:12,color:T2.text4,cursor:"pointer",padding:"4px 0",textAlign:"left"}}>← Back</button>}
      </div>
    );
  }

  if (phase==='done') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"32px":"24px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Challenge Complete</div>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>Connection Builder</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:"#A8998A",lineHeight:1.65,margin:"0 0 24px"}}>You've practised curiosity, empathy, listening, and adaptability. These habits compound. Every conversation from here is an opportunity.</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"People may forget what you said. They rarely forget how you made them feel."</p>
      </div>
      <button onClick={()=>setPhase('intro')} style={cs.cta}>Practise Again →</button>
    </div>
  );

  return null;
}

// ─── D9 Simulation Widget — Rapport Builder ───────────────────────────────
export function D9SimWidget({T, T2, isDesktop}) {
  const CONVERSATIONS = [
    { id:"driver",   label:"The Driver",   sub:"Senior leader. Focused on outcomes and results.", opener:"I've got five minutes. What do you want to talk about?", tip:"Be brief. Lead with outcomes. Avoid small talk.", scoreLabel:"Brevity & directness" },
    { id:"thinker",  label:"The Thinker",  sub:"Analytical specialist. Values logic and detail.", opener:"I've reviewed the data. What's your thinking on this?", tip:"Bring logic. Show preparation. Ask specific questions.", scoreLabel:"Logic & depth" },
    { id:"connector",label:"The Connector",sub:"Relationship-oriented team leader. Values people.", opener:"How's everyone doing? I think the team has been working really hard.", tip:"Lead with empathy. Share stories. Ask about people, not just tasks.", scoreLabel:"Empathy & warmth" },
    { id:"visionary",label:"The Visionary",sub:"Entrepreneurial innovator. Focused on possibilities.", opener:"I've been thinking about where we could take this in five years. What excites you most?", tip:"Think big. Engage with ideas. Show curiosity about the future.", scoreLabel:"Creativity & big-picture thinking" },
  ];

  const [phase, setPhase] = useState('intro');
  const [convIdx, setConvIdx] = useState(0);
  const [responses, setResponses] = useState(Array(4).fill(''));
  const [scores, setScores] = useState(null);

  const cs = {
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
    cta:(d)=>({width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:d?"rgba(44,36,22,0.25)":T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:d?"not-allowed":"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"}),
  };

  const generateScores = () => {
    const r = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
    const sc = CONVERSATIONS.map((c,i)=>({
      label:c.label, score:responses[i].trim().length>20?r(65,92):r(35,55)
    }));
    const best = sc.reduce((a,b)=>a.score>b.score?a:b);
    const worst = sc.reduce((a,b)=>a.score<b.score?a:b);
    setScores({ sc, best: best.label, worst: worst.label,
      overall: Math.round(sc.reduce((a,c)=>a+c.score,0)/4),
      insight:`You connect most naturally with the ${best.label} style. Your biggest growth opportunity is connecting with the ${worst.label}. Focus on adapting your approach: ${CONVERSATIONS.find(c=>c.label===worst.label)?.tip}` });
    setPhase('results');
  };

  const Progress = () => (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
      <div style={{display:"flex",gap:4,flex:1}}>
        {CONVERSATIONS.map((_,i)=><div key={i} style={{height:3,borderRadius:2,flex:1,background:i<convIdx?T.gold:i===convIdx?"rgba(138,158,132,0.6)":T2.border,transition:"background 0.3s"}}/>)}
      </div>
      <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4,flexShrink:0}}>Conversation {convIdx+1} of 4</span>
    </div>
  );

  if (phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>The Rapport Builder</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 12px"}}>You're attending a networking event. Four different people. Four different communication styles.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0}}>Your challenge: build rapport with each one by adapting your communication to their style. Your AmplifyU coach scores your empathy, curiosity, and adaptability.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {CONVERSATIONS.map((c,i)=>(
          <div key={i} style={{...cs.card,padding:isDesktop?"16px 18px":"12px 14px"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{c.label}</div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,margin:0,lineHeight:1.5}}>{c.sub}</p>
          </div>
        ))}
      </div>
      <button onClick={()=>setPhase('conversations')} style={cs.cta(false)}>Start the Challenge →</button>
    </div>
  );

  if (phase==='conversations') {
    const c = CONVERSATIONS[convIdx];
    const isLast = convIdx===3;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
        <Progress/>
        <div style={cs.card}>
          <div style={cs.label}>{c.label}</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,marginBottom:10,lineHeight:1.5}}>{c.sub}</p>
          <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,marginBottom:14}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>They say</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.4,margin:0}}>{c.opener}</p>
          </div>
          <div style={{padding:"10px 12px",background:"rgba(138,158,132,0.07)",borderRadius:3,borderLeft:"2px solid rgba(138,158,132,0.35)",marginBottom:14}}>
            <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0,lineHeight:1.5}}><strong>Tip:</strong> {c.tip}</p>
          </div>
          <div style={cs.label}>Your response</div>
          <textarea value={responses[convIdx]} onChange={e=>{const n=[...responses];n[convIdx]=e.target.value;setResponses(n);}} placeholder="Write what you would say…" style={{width:"100%",minHeight:isDesktop?100:80,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
        </div>
        <button onClick={()=>isLast?generateScores():setConvIdx(v=>v+1)} disabled={responses[convIdx].trim().length<10} style={cs.cta(responses[convIdx].trim().length<10)}>
          {isLast?"See My Results →":(`Conversation ${convIdx+2}: ${CONVERSATIONS[convIdx+1].label} →`)}
        </button>
        {convIdx>0 && <button onClick={()=>setConvIdx(v=>v-1)} style={{background:"none",border:"none",fontFamily:T.sans,fontSize:12,color:T2.text4,cursor:"pointer",padding:"4px 0",textAlign:"left"}}>← Back</button>}
      </div>
    );
  }

  if (phase==='results' && scores) return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,background:"rgba(138,158,132,0.06)",border:"0.5px solid rgba(138,158,132,0.3)",textAlign:"center"}}>
        <div style={cs.label}>Connection Score</div>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?48:38,fontWeight:600,color:T.gold,lineHeight:1,marginBottom:8}}>{scores.overall}</div>
        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,margin:0}}>Overall rapport score across all four styles</p>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Your Scores by Style</div>
        {scores.sc.map((s,i)=>(
          <div key={i} style={{marginBottom:i<3?14:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,fontWeight:500}}>{s.label}</span>
              <span style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontWeight:700,color:s.score>=75?T.gold:s.score>=55?"#7A9E84":T2.text3}}>{s.score}</span>
            </div>
            <div style={{height:4,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:s.score+"%",background:s.score>=75?T.gold:s.score>=55?"rgba(138,158,132,0.7)":"rgba(180,80,60,0.35)",borderRadius:2,transition:"width 0.9s ease"}}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Your Personal Insight</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,margin:"0 0 10px"}}>{scores.insight}</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"Adaptability is not about changing who you are. It's about understanding who you're talking to."</p>
      </div>
      <button onClick={()=>{setPhase('intro');setConvIdx(0);setResponses(Array(4).fill(''));setScores(null);}} style={{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48}}>Try Again →</button>
    </div>
  );

  return null;
}

// retained for backward compatibility
export function DeliveryCoachWidget({ onSave }) { return null; }
