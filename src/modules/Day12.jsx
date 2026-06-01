import { useState } from 'react';

// ─── D12 Practice Widget ───────────────────────────────────────────────────
export function D12PracticeWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const ROUNDS = [
    {
      title:"WHERE SHOULD YOUR HANDS GO?",
      prompt:"You're saying:",
      quote:'"I\'m really excited about this idea."',
      instruction:"Which hand position feels most natural and engaging?",
      options:[
        {label:"Hands hidden in pockets",correct:false},
        {label:"Relaxed open gestures near chest height",correct:true},
        {label:"Arms folded tightly",correct:false},
      ],
      feedback:"Visible, relaxed hands help communication feel more open, expressive, and engaging.",
    },
    {
      title:"STAND WITH PRESENCE",
      prompt:null,
      quote:null,
      instruction:"Which posture helps communication feel most grounded and confident?",
      options:[
        {label:"Relaxed shoulders, balanced stance, hands visible",correct:true},
        {label:"Leaning heavily on one hip",correct:false},
        {label:"Shoulders pulled inward",correct:false},
      ],
      feedback:"Grounded posture helps communication feel calmer and more composed.",
    },
    {
      title:"GESTURE THE MESSAGE",
      prompt:"Say this sentence out loud:",
      quote:'"The opportunity kept growing."',
      instruction:"Practise using your hands to visually support the idea — begin with hands closer together, then gradually expand outward as you speak.",
      options:null,
      action:"I practised this",
      feedback:"Gestures help people visually process meaning.",
    },
    {
      title:"OPEN VS CLOSED",
      prompt:"Try saying this sentence two ways:",
      quote:'"I\'d love to hear your thoughts."',
      instruction:"Version 1: crossed arms, looking away. Version 2: relaxed posture, open hands, soft eye contact. Notice how different each version feels.",
      options:null,
      action:"I tried both versions",
      feedback:"Open posture helps conversations feel warmer and more collaborative.",
    },
    {
      title:"EYE CONTACT",
      prompt:null,
      quote:null,
      instruction:"Speak for 20 seconds while maintaining calm eye contact with the camera. Focus on: relaxed expression, steady gaze, natural blinking, calm breathing.",
      options:null,
      action:"I completed this",
      feedback:"Relaxed eye contact helps communication feel more connected and present.",
    },
    {
      title:"THE STORYTELLER",
      prompt:"Tell this short story naturally:",
      quote:'"Something happened this week that made me smile."',
      instruction:"As you speak: allow expression into your face, use natural gestures, let your posture stay open, avoid overthinking movement.",
      options:null,
      action:"I told the story",
      feedback:"Strong presence is not about performing. It's about allowing communication to feel expressive, aligned, and human.",
    },
    {
      title:"CALM ENERGY",
      prompt:null,
      quote:null,
      instruction:'Stand still for 10 seconds before speaking. Then calmly say: "Here\'s what I learned." Focus on: grounded feet, relaxed shoulders, slow breathing, deliberate movement.',
      options:null,
      action:"I completed this",
      feedback:"Calm physical presence helps communication feel clearer and easier to follow.",
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
          Build grounded physical confidence and expressive communication.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          {["Practise gestures, posture, and eye contact.","Explore what open, grounded presence feels like.","Discover how physical signals shape how communication lands."].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:6,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:11,flexShrink:0,marginTop:2}}>✦</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.5}}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>The Challenge Journey</div>
        <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
          {[
            {n:1,label:"Hands"},
            {n:2,label:"Posture"},
            {n:3,label:"Gesture"},
            {n:4,label:"Open vs Closed"},
            {n:5,label:"Eye Contact"},
            {n:6,label:"Storyteller"},
            {n:7,label:"Calm Energy"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?36:28,height:isDesktop?36:28,borderRadius:"50%",border:"1.5px solid "+(i===0?T.gold:"rgba(138,158,132,0.3)"),background:i===0?"rgba(138,158,132,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:5}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?12:10,fontWeight:700,color:i===0?T.gold:"rgba(138,158,132,0.5)"}}>{r.n}</span>
                </div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?11:9,color:"#A8998A",textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?70:44}}>{r.label}</div>
              </div>
              {i<6 && <div style={{height:1,width:isDesktop?8:3,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:18}}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>How You Win</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>Earn points for:</p>
        <div style={{display:"flex",gap:isDesktop?8:6,flexWrap:"wrap"}}>
          {["Gestures","Posture","Eye contact","Expression"].map((s,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:isDesktop?"10px 12px":"8px 10px",background:T2.bg,borderRadius:6,border:"0.5px solid "+T2.border,flex:1,minWidth:isDesktop?70:56}}>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:11,color:"#A8998A",fontWeight:400,textAlign:"center",lineHeight:1.3}}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={()=>{setPhase('playing');setRound(0);setSelected(null);setShowFeedback(false);}} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Start the Presence Challenge →</button>
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
          {r.prompt && <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,marginBottom:8,lineHeight:1.5}}>{r.prompt}</p>}
          {r.quote && <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 14px"}}>{r.quote}</p>}
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,margin:0}}>{r.instruction}</p>
        </div>

        {r.options && !showFeedback && (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {r.options.map((opt,i)=>(
              <button key={i} onClick={()=>{setSelected(i);setShowFeedback(true);}}
                style={{padding:"14px 16px",borderRadius:4,border:`0.5px solid ${selected===i?(opt.correct?T.gold:"rgba(180,80,60,0.5)"):T2.border}`,background:selected===i?(opt.correct?"rgba(138,158,132,0.08)":"rgba(180,80,60,0.04)"):"transparent",color:T2.text,fontSize:isDesktop?14:13,fontFamily:T.serif,fontStyle:"italic",textAlign:"left",cursor:"pointer",lineHeight:1.4,transition:"all 0.2s"}}>
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
        <div style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>Presence Practitioner</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:"#A8998A",lineHeight:1.65,margin:"0 0 24px"}}>You've explored gestures, posture, eye contact, expression, and grounded energy. These physical signals shape how every conversation you have is experienced.</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"Your body helps people experience the message."</p>
      </div>
      <button onClick={()=>{setPhase('intro');setRound(0);setSelected(null);setShowFeedback(false);}} style={cs.cta}>Practise Again →</button>
    </div>
  );

  return null;
}

// ─── D12 Simulation Widget ─────────────────────────────────────────────────
export function D12SimWidget({T, T2, isDesktop}) {
  const PROMPTS = [
    "Tell a short inspiring story",
    "Explain something you care about",
    "Introduce yourself confidently",
    "Describe a meaningful experience",
    "Encourage someone through a challenge",
  ];

  const [phase, setPhase] = useState('intro');
  const [chosenPrompt, setChosenPrompt] = useState(null);

  const cs = {
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };

  if (phase === 'intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>

      {/* HOW IT WORKS */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>How It Works</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:22,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>A simple 5-step presence check-in.</h2>
        <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
          {[
            {n:1,label:"Choose a prompt",    icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M4 6h14v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6z" stroke={T.gold} strokeWidth="1.3"/><path d="M4 6l7 5 7-5" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:2,label:"Record naturally",   icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={T.gold} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2M8 19h6" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:3,label:"Review presence",    icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke={T.gold} strokeWidth="1.3"/><path d="M11 7v4l3 3" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:4,label:"Get coaching",       icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4H17l-3.5 2.5 1.5 4L11 11l-4 2.5 1.5-4L5 7h4.5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:5,label:"Try again",          icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M4 11a7 7 0 0111.95-4.95L18 8M18 8V4M18 8h-4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 11a7 7 0 01-11.95 4.95L4 14M4 14v4M4 14h4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?44:34,height:isDesktop?44:34,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:5}}>{s.icon}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?9:8,fontWeight:700,color:T.gold,marginBottom:2}}>{s.n}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?12:9,color:"#A8998A",textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?76:52}}>{s.label}</div>
              </div>
              {i<4 && <div style={{height:1,width:isDesktop?12:5,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:26}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* THE FIRST STEP */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"16px 18px"}}>
        <div style={cs.label}>The First Step</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,marginBottom:10}}>
          You've learned the science. Practised the techniques. Now it's time to see how you communicate physically.
        </p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,margin:0}}>
          Self-review is one of the fastest proven ways to improve — used by top speakers, performers, and leaders worldwide.
        </p>
      </div>

      {/* YOUR DIGITAL COACH */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"16px 18px"}}>
        <div style={cs.label}>Your Digital Coach</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,marginBottom:10}}>
          Your AmplifyU coach will analyse your posture, movement, gestures, eye contact, and facial engagement.
        </p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0,fontStyle:"italic"}}>
          This recording becomes your baseline — not a test, expert coaching.
        </p>
      </div>

      <button onClick={()=>setPhase('choose')} style={cs.cta}>Choose a Recording Prompt →</button>
    </div>
  );

  if (phase === 'choose') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Recording Prompts</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,marginBottom:14}}>Choose one and record yourself speaking naturally for 60–90 seconds.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {PROMPTS.map((p,i)=>(
            <button key={i} onClick={()=>{setChosenPrompt(p);setPhase('reflect');}}
              style={{padding:"14px 16px",borderRadius:4,border:`0.5px solid ${chosenPrompt===p?T.gold:T2.border}`,background:"transparent",color:T2.text,fontSize:isDesktop?14:13,fontFamily:T.serif,fontStyle:"italic",textAlign:"left",cursor:"pointer",lineHeight:1.4,transition:"all 0.2s"}}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <button onClick={()=>setPhase('intro')} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
    </div>
  );

  if (phase === 'reflect') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Your Prompt</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,fontWeight:600,color:T2.text,lineHeight:1.3,margin:0}}>{chosenPrompt}</p>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>Reflection</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,marginBottom:14}}>Watch yourself once with sound <strong>OFF</strong>. Then watch again with sound ON.</p>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Notice</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {["Energy","Expression","Calmness","Posture","Gestures","Connection"].map((pt,i)=>(
            <div key={i} style={{padding:"6px 12px",borderRadius:20,border:"0.5px solid rgba(138,158,132,0.3)",background:"rgba(138,158,132,0.06)"}}>
              <span style={{fontFamily:T.sans,fontSize:12,color:T2.text3}}>{pt}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{...cs.card,background:"rgba(138,158,132,0.04)",textAlign:"center"}}>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"Awareness transforms communication."</p>
      </div>

      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={()=>{setChosenPrompt(null);setPhase('choose');}} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Choose Another Prompt</button>
        <button onClick={()=>setPhase('intro')} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"none",background:T.ink,color:T.bg,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Start Over</button>
      </div>
    </div>
  );

  return null;
}
