import { useState } from 'react';

// ─── D9 Practice Widget — Connection Best Practices ──────────────────────
export function D9PracticeWidget({T, T2, isDesktop}) {
  const [open, setOpen] = useState(null);

  const TIPS = [
    {
      label:"Ask Better Questions",
      title:"Lead with curiosity, not category.",
      body:'Replace "What do you do?" with "What\'s the most interesting thing you\'re working on right now?" Better still: "What\'s the biggest challenge you\'re facing at the moment?" or "What\'s something you\'re genuinely excited about?" These questions open real conversations — they show interest, invite depth, and build trust in a way that small talk never does.',
    },
    {
      label:"The 70/30 Rule",
      title:"Listen 70%. Speak 30%.",
      body:"In your next conversation, consciously hold back. Ask a question, then let the other person fill the space. The most memorable communicators don't dominate — they make others feel genuinely heard. Connection isn't a gift. It's a choice you make in every conversation.",
    },
    {
      label:"Empathy in Practice",
      title:"Understand someone you disagree with.",
      body:"Before you respond to a differing view, pause to ask: what matters to this person, what pressures might they be under, and what might I be missing? Understanding first doesn't mean agreeing — it means connecting. The people who do this well are the ones others seek out.",
    },
    {
      label:"Know Their Style",
      title:"Adapt to the person in front of you.",
      body:"People tend to communicate as one of four styles: the Driver (results-focused), the Thinker (detail-focused), the Connector (relationship-focused), or the Visionary (ideas-focused). The best communicators notice which style they're working with — and flex to meet it rather than defaulting to their own.",
    },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
      <div>
        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Connection Skills · Rehearsal</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?40:28,fontWeight:600,color:T2.text,lineHeight:1.1,margin:"0 0 14px"}}>
          Build the habits that make you memorable.
        </h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.7,margin:"0 0 10px"}}>
          The most connected communicators share four habits. Read through each one — then try them in your next real conversation.
        </p>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(138,158,132,0.08)",borderRadius:20,padding:"7px 14px",border:"0.5px solid rgba(138,158,132,0.22)",marginTop:6}}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5"/>
            <path d="M10 6v4l2.5 2" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:"rgba(138,158,132,0.8)",letterSpacing:"0.05em"}}>1 min warm-up</span>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {TIPS.map((tip,i)=>{
          const isOpen = open===i;
          return (
            <div key={i} style={{background:T2.surface,borderRadius:6,border:"0.5px solid "+(isOpen?"rgba(138,158,132,0.45)":T2.border),overflow:"hidden",transition:"border-color 0.2s"}}>
              <button
                onClick={()=>setOpen(isOpen?null:i)}
                style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:isDesktop?"18px 22px":"15px 18px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",gap:12}}
              >
                <div>
                  <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>{tip.label}</div>
                  <div style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,lineHeight:1.25}}>{tip.title}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.25s",color:"rgba(138,158,132,0.7)"}}>
                  <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {isOpen&&(
                <div style={{padding:isDesktop?"0 22px 20px":"0 18px 16px",borderTop:"0.5px solid rgba(138,158,132,0.15)"}}>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.75,margin:"16px 0 0"}}>{tip.body}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
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
