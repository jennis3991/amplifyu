import { useState, useRef, useEffect } from 'react';

// ─── D12 Practice Widget ───────────────────────────────────────────────────
export function D12PracticeWidget({T, T2, isDesktop, onSimulation, onNavLabel, onNavFn}) {
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!onNavLabel) return;
    if (phase === 'done') {
      onNavLabel("Continue");
      if (onNavFn) onNavFn.current = () => onSimulation?.();
    } else {
      onNavLabel(null);
      if (onNavFn) onNavFn.current = null;
    }
  }, [phase]);

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
        <div style={cs.label}>Your Focus</div>
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
        <div style={cs.label}>The Practice Journey</div>
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

      <button onClick={()=>{setPhase('playing');setRound(0);setSelected(null);setShowFeedback(false);}} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Start Practice Presence →</button>
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
              {round < ROUNDS.length-1 ? `Round ${round+2}: ${ROUNDS[round+1].title} →` : "Complete the Practice →"}
            </button>
          </>
        )}
      </div>
    );
  }

  if (phase === 'done') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"32px":"24px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Practice Complete</div>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>You're Building Presence</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:"#A8998A",lineHeight:1.65,margin:"0 0 24px"}}>You've explored gestures, posture, eye contact, expression, and grounded energy. These physical signals shape how every conversation you have is experienced.</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"You don't need to perform presence. You already have it."</p>
      </div>
    </div>
  );

  return null;
}

// WebM has never been supported as a MediaRecorder output container on
// Safari/WebKit (desktop or iOS) — only MP4. Try webm variants first (for
// Chrome/Firefox), then fall back to mp4 variants (for Safari/WKWebView).
function getSupportedVideoMime() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return null;
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4;codecs=avc1,mp4a',
    'video/mp4',
  ];
  return candidates.find(c => MediaRecorder.isTypeSupported(c)) || null;
}

// ─── D12 Simulation Widget — Video Presence Recorder ─────────────────────────
export function D12SimWidget({T, T2, isDesktop}) {
  const PROMPTS = [
    {label:"Inspire",    text:"Tell a short story about something that genuinely changed how you see the world."},
    {label:"Explain",    text:"Explain something you care about deeply — as if to someone who's never heard of it."},
    {label:"Introduce",  text:"Introduce yourself confidently — as if walking into the most important room of your career."},
    {label:"Encourage",  text:"Encourage someone who is doubting themselves. Speak directly to them."},
    {label:"Persuade",   text:"Make the case for one belief or idea you hold strongly. Convince the room."},
  ];
  const OBSERVE = ["Posture","Gestures","Eye contact","Facial expression","Energy level","Stillness vs movement"];

  const [phase, setPhase] = useState('intro');
  const [chosenPrompt, setChosenPrompt] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recTime, setRecTime] = useState(0);
  const [blobUrl, setBlobUrl] = useState(null);
  const [permErr, setPermErr] = useState(false);
  const [mediaErr, setMediaErr] = useState(false);
  const [observations, setObservations] = useState({});
  const [checked, setChecked] = useState([]);

  const videoRef    = useRef(null);
  const playbackRef = useRef(null);
  const streamRef   = useRef(null);
  const recorderRef = useRef(null);
  const timerRef    = useRef(null);
  const chunksRef   = useRef([]);

  useEffect(()=>()=>{
    if (streamRef.current)  streamRef.current.getTracks().forEach(t=>t.stop());
    if (timerRef.current)   clearInterval(timerRef.current);
    if (blobUrl)            URL.revokeObjectURL(blobUrl);
  },[]);

  const cs = {
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const startCamera = async () => {
    setPermErr(false);
    setMediaErr(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      streamRef.current = stream;
      setPhase('recording');
      // 3-second countdown then start
      let c = 3;
      setCountdown(c);
      const cd = setInterval(()=>{
        c--;
        if (c > 0) { setCountdown(c); }
        else {
          clearInterval(cd);
          setCountdown(null);
          chunksRef.current = [];
          const mime = getSupportedVideoMime();
          if (!mime) {
            stream.getTracks().forEach(t=>t.stop());
            streamRef.current = null;
            setPhase('choose');
            setMediaErr(true);
            return;
          }
          try {
            const rec = new MediaRecorder(stream, {mimeType:mime});
            recorderRef.current = rec;
            rec.ondataavailable = e=>{ if(e.data.size>0) chunksRef.current.push(e.data); };
            rec.onstop = ()=>{
              const blob = new Blob(chunksRef.current, {type:mime});
              setBlobUrl(URL.createObjectURL(blob));
              stream.getTracks().forEach(t=>t.stop());
              streamRef.current = null;
              setIsRecording(false);
              setPhase('playback');
            };
            rec.start(250);
            setIsRecording(true);
            setRecTime(0);
            timerRef.current = setInterval(()=>setRecTime(t=>t+1), 1000);
          } catch (err) {
            stream.getTracks().forEach(t=>t.stop());
            streamRef.current = null;
            setPhase('choose');
            setMediaErr(true);
          }
        }
      }, 1000);
    } catch(e) { setPermErr(true); }
  };

  const stopRecording = ()=>{
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const resetAll = ()=>{
    if (streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null); setIsRecording(false); setCountdown(null); setRecTime(0);
    setObservations({}); setChecked([]); setChosenPrompt(null); setPermErr(false); setMediaErr(false);
    chunksRef.current = []; streamRef.current = null; recorderRef.current = null; timerRef.current = null;
    setPhase('intro');
  };

  // Attach live stream to preview video element
  useEffect(()=>{
    if (phase==='recording' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(()=>{});
    }
  },[phase]);

  if (phase === 'intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>

      {/* HOW IT WORKS — top, both desktop + mobile */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>How it works</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:22,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:isDesktop?20:16}}>A simple 4-step presence check-in.</h2>
        <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
          {[
            {n:1,label:"Choose a prompt",   icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M4 6h14v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6z" stroke={T.gold} strokeWidth="1.3"/><path d="M4 6l7 5 7-5" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:2,label:"Record yourself",   icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="3" y="6" width="11" height="10" rx="1.5" stroke={T.gold} strokeWidth="1.3"/><path d="M14 9.5l4.5-2.5v9L14 13.5" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:3,label:"Watch it back",     icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M2 11s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/><circle cx="11" cy="11" r="2.6" stroke={T.gold} strokeWidth="1.3"/></svg>},
            {n:4,label:"Rate & reflect",    icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4H17l-3.5 2.5 1.5 4L11 11l-4 2.5 1.5-4L5 7h4.5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?48:36,height:isDesktop?48:36,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:isDesktop?8:6}}>{s.icon}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?9:8,fontWeight:700,color:T.gold,marginBottom:3}}>{s.n}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?13:11,color:T2.text2,textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?76:52}}>{s.label}</div>
              </div>
              {i<3&&<div style={{height:1,width:isDesktop?12:5,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:isDesktop?30:24}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* SINGLE CONTENT CARD */}
      <div style={{...cs.card,padding:isDesktop?"26px 28px":"20px 20px"}}>
        <h3 style={{fontFamily:T.serif,fontSize:isDesktop?26:16,fontWeight:600,color:T2.text,lineHeight:1.15,margin:"0 0 "+(isDesktop?"22px":"18px")}}>You Cannot Improve What You Cannot See.</h3>

        {/* Point 1 — see yourself */}
        <div style={{display:"flex",alignItems:"flex-start",gap:isDesktop?16:12}}>
          <div style={{width:isDesktop?48:36,height:isDesktop?48:36,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 24 24" fill="none">
              <circle cx="10" cy="9" r="3.2" stroke={T.gold} strokeWidth="1.3"/>
              <path d="M4.5 19c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M18 5.3l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7.7-1.6z" fill={T.gold}/>
              <path d="M20.5 11.2l.4.9.9.4-.9.4-.4.9-.4-.9-.9-.4.9-.4.4-.9z" fill={T.gold}/>
            </svg>
          </div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.6,margin:0,flex:1}}>
            Record yourself speaking naturally on camera. Watching it back reveals <strong style={{color:T.gold,fontWeight:700}}>posture, gestures, eye contact and energy</strong> you're completely unaware of in the moment.
          </p>
        </div>

        <div style={{height:1,background:T2.divider,margin:isDesktop?"18px 0":"14px 0"}}/>

        {/* Point 2 — trust + baseline */}
        <div style={{display:"flex",alignItems:"flex-start",gap:isDesktop?16:12}}>
          <div style={{width:isDesktop?48:36,height:isDesktop?48:36,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 24 24" fill="none">
              <path d="M12 3l7 3v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M12 8.2l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3 1-2.1z" stroke={T.gold} strokeWidth="1.1" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{flex:1}}>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.6,margin:0}}>
              Self-review on video is one of the fastest ways to improve communication — trusted by elite speakers, performers and Fortune 500 leaders because <strong style={{color:T.gold,fontWeight:700}}>awareness comes before change</strong>.
            </p>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,margin:isDesktop?"10px 0 0":"8px 0 0",fontStyle:"italic"}}>
              This is your baseline. Every session from here builds greater presence and confidence.
            </p>
          </div>
        </div>
      </div>

      <button onClick={()=>setPhase('choose')} style={cs.cta}>Choose a Prompt →</button>
    </div>
  );

  if (phase === 'choose') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Choose Your Prompt</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 14px"}}>Pick one. Speak naturally for 60–90 seconds. Don't rehearse — just talk.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {PROMPTS.map((p,i)=>(
            <button key={i} onClick={()=>setChosenPrompt(i)}
              style={{padding:"14px 16px",borderRadius:4,border:`0.5px solid ${chosenPrompt===i?T.gold:T2.border}`,background:chosenPrompt===i?"rgba(138,158,132,0.07)":"transparent",textAlign:"left",cursor:"pointer",transition:"all 0.2s"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:chosenPrompt===i?T.gold:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>{p.label}</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.4,margin:0,fontStyle:"italic"}}>{p.text}</p>
            </button>
          ))}
        </div>
      </div>
      {permErr && (
        <div style={{padding:"12px 14px",background:"rgba(180,60,60,0.06)",borderRadius:4,border:"0.5px solid rgba(180,60,60,0.2)"}}>
          <p style={{fontFamily:T.sans,fontSize:13,color:"rgba(160,60,60,0.9)",margin:0,lineHeight:1.5}}>Camera access was denied. Please allow camera and microphone permissions in your browser settings and try again.</p>
        </div>
      )}
      {mediaErr && (
        <div style={{padding:"12px 14px",background:"rgba(180,60,60,0.06)",borderRadius:4,border:"0.5px solid rgba(180,60,60,0.2)"}}>
          <p style={{fontFamily:T.sans,fontSize:13,color:"rgba(160,60,60,0.9)",margin:0,lineHeight:1.5}}>Video recording isn't supported on this browser. Please try again on a different device or browser.</p>
        </div>
      )}
      <button onClick={startCamera} disabled={chosenPrompt===null} style={{...cs.cta,background:chosenPrompt===null?"rgba(44,36,22,0.25)":T.ink,cursor:chosenPrompt===null?"not-allowed":"pointer"}}>
        Start Recording →
      </button>
      <button onClick={()=>setPhase('intro')} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
    </div>
  );

  if (phase === 'recording') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      {/* Prompt reminder */}
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold,padding:"14px 16px"}}>
        <div style={cs.label}>Your Prompt</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:T2.text,lineHeight:1.4,margin:0}}>{chosenPrompt!==null?PROMPTS[chosenPrompt].text:''}</p>
      </div>

      {/* Camera preview */}
      <div style={{position:"relative",borderRadius:8,overflow:"hidden",background:"#0A0804",aspectRatio:"16/9"}}>
        <video ref={videoRef} muted playsInline autoPlay style={{width:"100%",height:"100%",objectFit:"cover",display:"block",transform:"scaleX(-1)"}}/>

        {/* Countdown overlay */}
        {countdown!==null && (
          <div style={{position:"absolute",inset:0,background:"rgba(10,8,4,0.65)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?80:60,fontWeight:700,color:"#F5EFE6",lineHeight:1,animation:"fadeIn 0.3s ease"}}>{countdown}</div>
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div style={{position:"absolute",top:12,left:12,display:"flex",alignItems:"center",gap:7,padding:"5px 12px",background:"rgba(10,8,4,0.72)",borderRadius:20,backdropFilter:"blur(4px)"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#E05555",animation:"pulse 1.2s ease infinite"}}/>
            <span style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:"#F5EFE6",letterSpacing:"1px"}}>{fmtTime(recTime)}</span>
          </div>
        )}
      </div>

      {isRecording ? (
        <button onClick={stopRecording} style={{...cs.cta,background:"#8A3030",color:"#F5EFE6"}}>Stop Recording ■</button>
      ) : countdown!==null ? (
        <div style={{textAlign:"center",padding:"12px",fontFamily:T.sans,fontSize:13,color:T2.text3}}>Get ready…</div>
      ) : null}
    </div>
  );

  if (phase === 'playback' && blobUrl) return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,padding:"8px"}}>
        <video src={blobUrl} ref={playbackRef} controls playsInline style={{width:"100%",borderRadius:4,display:"block",background:"#0A0804"}}/>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>How to review</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,flexShrink:0,marginTop:2}}>1.</span>
            <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5}}>Watch with <strong>sound OFF</strong> — observe only body language, gestures, and expression.</span>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,flexShrink:0,marginTop:2}}>2.</span>
            <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5}}>Watch again with <strong>sound ON</strong> — notice whether your non-verbal signals matched your words.</span>
          </div>
        </div>
        <div style={cs.label}>What did you notice?</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {OBSERVE.map((item,i)=>{
            const val = observations[item];
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<OBSERVE.length-1?"0.5px solid "+T2.divider:"none"}}>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text}}>{item}</span>
                <div style={{display:"flex",gap:6}}>
                  {["Strong","OK","Needs work"].map((opt,j)=>(
                    <button key={j} onClick={()=>setObservations({...observations,[item]:opt})}
                      style={{padding:"4px 10px",borderRadius:3,border:`0.5px solid ${val===opt?T.gold:T2.border}`,background:val===opt?"rgba(138,158,132,0.12)":"transparent",color:val===opt?T.gold:T2.text4,fontSize:10,cursor:"pointer",fontFamily:T.sans,minHeight:28,fontWeight:val===opt?700:400,transition:"all 0.15s"}}>{opt}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {Object.keys(observations).length>=3 && (
        <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
          <div style={cs.label}>Coaching Note</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,color:T2.text,lineHeight:1.7,margin:"0 0 10px"}}>
            {Object.values(observations).filter(v=>v==="Needs work").length===0
              ? "Strong session. Your physical signals look well-aligned. Record again and look for one moment where you could create even more stillness or emphasis."
              : `You flagged ${Object.entries(observations).filter(([,v])=>v==="Needs work").map(([k])=>k.toLowerCase()).join(" and ")} as areas to work on. These are the fastest wins — small, deliberate changes in ${Object.entries(observations).filter(([,v])=>v==="Needs work")[0]?.[0]?.toLowerCase()} can shift how you're perceived immediately.`}
          </p>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?15:13,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"Awareness is the first step. Confidence is what happens next."</p>
        </div>
      )}

      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={()=>{if(blobUrl)URL.revokeObjectURL(blobUrl);setBlobUrl(null);setIsRecording(false);setRecTime(0);setObservations({});chunksRef.current=[];setPhase('choose');}} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Record Again</button>
        <button onClick={resetAll} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"none",background:T.ink,color:T.bg,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Start Over</button>
      </div>
    </div>
  );

  return null;
}
