import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';
import { ROLES } from '../data.js';
import { useIsDesktop } from '../utils.js';
import { OBScene } from '../scenes.jsx';

export function Onboarding({onDone}) {
  const isDesktop = useIsDesktop();
  const [phase, setPhase] = useState("landing");   // landing | questions | role | ready
  const [step, setStep]   = useState(0);
  const [ans, setAns]     = useState({});
  const [selected, setSelected] = useState(null);  // holds chosen option before advancing
  const [entering, setEntering] = useState(false); // brief transition lock
  const [roleVisible, setRoleVisible] = useState(true);
  const [landingVisible, setLandingVisible] = useState(true);

  function goToQuestions() {
    setLandingVisible(false);
    setTimeout(() => setPhase("questions"), 380);
  }

  useEffect(() => {
    ["/ob-q1.jpg","/ob-q2.jpg","/ob-q3.jpg","/ob-q4.jpg","/ob-role-2.png"].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const QS = [
    {
      k: "challenge",
      context: "The first step is honesty.",
      q: "What holds you back most?",
      opts: [
        "Speaking up confidently with senior leaders.",
        "Structuring my thoughts clearly under pressure.",
        "Making my work visible — and getting credit for it.",
        "Setting boundaries and asserting myself.",
      ],
      scene: "presence",
      image: "/ob-q1.webp",
    },
    {
      k: "context",
      context: "Clarity shapes the path.",
      q: "Where do you most want to grow?",
      opts: [
        "Influencing and communicating with real impact.",
        "Building a personal brand and presence that lasts.",
        "Telling stories that make people lean in.",
        "Navigating high-stakes conversations with confidence.",
      ],
      scene: "clarity",
      image: "/ob-q2.jpg",
    },
    {
      k: "level",
      context: "Be honest with yourself.",
      q: "How would you describe yourself right now?",
      opts: [
        "I stay quiet when I should speak up.",
        "I speak, but I don't always land my point.",
        "I land my points — but I lack consistent presence.",
        "I'm already strong. I want to go to the next level.",
      ],
      scene: "structure",
      image: "/ob-q3.jpg",
    },
    {
      k: "ambition",
      context: "This is your north star.",
      q: "Where do you want to be in 18 months?",
      opts: [
        "Operating at the next level in my career.",
        "Known for my expertise and strategic thinking.",
        "Leading a bigger team or broader remit.",
        "Recognised as someone who makes things happen.",
      ],
      scene: "brand",
      image: "/ob-q4.jpg",
    },
  ];

  function pick(opt) {
    if (entering) return;
    setSelected(opt);
    setEntering(true);
    const next = Object.assign({}, ans, {[QS[step].k]: opt});
    setAns(next);
    // Brief pause — let the selection breathe
    setTimeout(() => {
      setSelected(null);
      setEntering(false);
      if (step < QS.length - 1) {
        setStep(s => s + 1);
      } else {
        setPhase("role");
      }
    }, 320);
  }

  function pickRole(roleId) {
    if (!roleVisible) return;
    setRoleVisible(false);
    setTimeout(() => onDone(Object.assign({}, ans, {role: roleId})), 320);
  }

  // ── DESKTOP EXPERIENCE ────────────────────────────────────────────────────
  if (isDesktop) {

    // ── Phase: Landing ── "The Threshold"
    if (phase === "landing") {
      return (
        <div style={{
          height: "100vh", overflow: "hidden", position: "relative",
          background: "#0F0D0A", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.sans,
          opacity: landingVisible ? 1 : 0, transition: "opacity 0.38s ease",
        }} className="au-grain-wrap">
          {/* Logo mark — glows softly behind the CTA */}
          <div style={{ position: "absolute", left: 0, right: 0, top: "65%", transform: "translateY(-50%)", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
            <img src="/logo-dark.jpg" alt="" style={{ width: "min(44vh, 500px)", height: "auto", opacity: 0.2, mixBlendMode: "screen" }}/>
          </div>
          {/* Depth layers */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(138,158,132,0.06) 0%, transparent 60%)" }}/>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,8,5,0.6) 0%, rgba(10,8,5,0.3) 50%, rgba(10,8,5,0.8) 100%)" }}/>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(6,5,3,0.5) 100%)" }}/>

          {/* Content — centered editorial lockup */}
          <div style={{
            position: "relative", zIndex: 2, textAlign: "center",
            maxWidth: 680, padding: "0 40px",
            animation: "fadeUp 1s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s both",
          }}>
            {/* Brand mark */}
            <div style={{
              fontSize: 12, letterSpacing: "6px", textTransform: "uppercase",
              color: T.gold, fontFamily: T.sans, fontWeight: 500,
              marginBottom: 52,
            }}>AmplifyU</div>

            {/* Headline — the invitation */}
            <h1 style={{
              fontFamily: T.serif,
              fontSize: "clamp(40px, 4.5vw, 72px)",
              fontWeight: 500, lineHeight: 1.1,
              color: "rgba(255,255,255,0.93)",
              letterSpacing: "-2px",
              marginBottom: 28,
            }}>
              The space to become who you've always been capable of.
            </h1>

            {/* Thin gold rule */}
            <div style={{ width: 40, height: 1, background: T.gold, margin: "0 auto 28px", opacity: 0.6 }}/>

            {/* Subtext */}
            <p style={{
              fontSize: 16, color: "rgba(255,255,255,0.38)",
              lineHeight: 1.75, maxWidth: 440, margin: "0 auto 60px",
              fontFamily: T.sans, fontWeight: 300, letterSpacing: "-0.1px",
            }}>
              14 sessions. A private practice for communication, presence, and executive impact.
            </p>

            {/* The single CTA — restrained, elegant */}
            <button
              onClick={goToQuestions}
              className="au-cta"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 40, padding: "14px 44px",
                color: "rgba(255,255,255,0.8)", fontSize: 13,
                fontWeight: 400, letterSpacing: "1.5px",
                textTransform: "uppercase", cursor: "pointer",
                fontFamily: T.sans,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = T.gold;
                e.target.style.color = T.gold;
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = "rgba(255,255,255,0.2)";
                e.target.style.color = "rgba(255,255,255,0.8)";
              }}
            >
              Enter
            </button>
          </div>

          {/* Bottom ambient text */}
          <div style={{
            position: "absolute", bottom: 36, left: 0, right: 0,
            textAlign: "center", zIndex: 2,
          }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: "3px", textTransform: "uppercase", fontFamily: T.sans }}>
              A private coaching programme
            </div>
          </div>
        </div>
      );
    }

    // ── Phase: Questions ── "The Reflection"
    if (phase === "questions") {
      const q = QS[step];
      return (
        <div style={{
          height: "100vh", display: "flex", overflow: "hidden",
          fontFamily: T.sans,
        }} className="au-grain-wrap">

          {/* LEFT: Atmospheric stage — visual anchor */}
          <div style={{
            width: "45%", flexShrink: 0,
            position: "relative", overflow: "hidden",
            background: "#0F0D0A",
          }}>
            <div key={step} className="au-step-enter" style={{ position: "absolute", inset: 0 }}>
              {q.image ? (
                <img src={q.image} alt="" onLoad={e=>{e.currentTarget.style.opacity="1"}} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0, transition: "opacity 0.5s ease" }}/>
              ) : (
                <div className="au-hero-scene" style={{ position: "absolute", inset: 0 }}>
                  <OBScene name={q.scene} height={900}/>
                </div>
              )}
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,5,0.45)" }}/>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 30%, rgba(10,8,5,0.7) 100%)" }}/>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,8,5,0.9) 0%, transparent 50%)" }}/>
            </div>

            {/* Question context — atmospheric label */}
            <div style={{ position: "absolute", bottom: 52, left: 52, zIndex: 2, animation: "fadeUp 0.7s ease both" }}>
              <div style={{ fontSize: 9, color: T.gold, letterSpacing: "3.5px", textTransform: "uppercase", fontFamily: T.sans, marginBottom: 14 }}>{q.context}</div>
              {/* Ambient step dots */}
              <div style={{ display: "flex", gap: 8 }}>
                {QS.map((_, i) => (
                  <div key={i} style={{
                    width: i === step ? 24 : 6, height: 2, borderRadius: 2,
                    background: i < step ? T.gold : i === step ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)",
                    transition: "all 0.4s ease",
                  }}/>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Question content — editorial, spacious */}
          <div style={{
            flex: 1, background: "#F7F3EC",
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "80px 72px",
            position: "relative",
          }}>
            <div key={step} className="au-step-enter" style={{ padding: "44px 52px" }}>
              {/* Question number — ambient, not instructional */}
              <div style={{
                fontSize: 9, color: T.text3, letterSpacing: "3px",
                textTransform: "uppercase", marginBottom: 32, fontFamily: T.sans,
              }}>Reflection {step + 1}</div>

              {/* The question — editorial scale */}
              <h2 style={{
                fontFamily: T.serif,
                fontSize: "clamp(26px, 2.8vw, 42px)",
                fontWeight: 500, lineHeight: 1.15,
                color: T.text, letterSpacing: "-1px",
                marginBottom: 48,
              }}>{q.q}</h2>

              {/* Answer options — statements, not buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {q.opts.map((opt, i) => {
                  const isSelected = selected === opt;
                  return (
                    <div key={opt}
                      onClick={() => pick(opt)}
                      style={{
                        padding: "20px 0 20px 24px",
                        borderTop: i === 0 ? "1px solid " + T.divider : "none",
                        borderBottom: "1px solid " + T.divider,
                        borderLeft: isSelected ? "2px solid " + T.gold : "2px solid transparent",
                        background: isSelected ? "rgba(138,158,132,0.04)" : "transparent",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={e => {
                        if (!entering) {
                          e.currentTarget.style.borderLeftColor = "rgba(138,158,132,0.4)";
                          e.currentTarget.style.background = "rgba(138,158,132,0.04)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderLeftColor = "transparent";
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      <p style={{
                        fontFamily: T.serif,
                        fontSize: "clamp(15px, 1.6vw, 18px)",
                        color: isSelected ? T.text : T.text2,
                        lineHeight: 1.45, margin: 0,
                        letterSpacing: "-0.2px",
                        transition: "color 0.2s",
                      }}>{opt}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── Phase: Role ── "Your world shapes your practice"
    if (phase === "role") {
      return (
        <div style={{ height: "100vh", display: "flex", overflow: "hidden", fontFamily: T.sans, opacity:roleVisible?1:0, transition:"opacity 0.32s ease" }} className="au-grain-wrap">
          {/* LEFT: Atmospheric stage */}
          <div style={{ width: "45%", flexShrink: 0, position: "relative", overflow: "hidden", background: "#0F0D0A" }}>
            <img src="/ob-role.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}/>
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,5,0.45)" }}/>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 20%, rgba(10,8,5,0.75) 100%)" }}/>
            <div style={{ position: "absolute", bottom: 52, left: 52, zIndex: 2 }}>
              <div style={{ fontSize: 9, color: T.gold, letterSpacing: "3.5px", textTransform: "uppercase", fontFamily: T.sans, marginBottom: 14 }}>Almost there.</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[...QS, {k:"role"}].map((_, i) => (
                  <div key={i} style={{ width: 6, height: 2, borderRadius: 2, background: i < QS.length ? T.gold : "rgba(255,255,255,0.45)", transition: "all 0.4s" }}/>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Role selection — editorial */}
          <div style={{ flex: 1, background: "#F7F3EC", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 72px" }}>
            <div style={{ padding: "44px 52px" }} className="au-step-enter">
              <div style={{ fontSize: 9, color: T.text3, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 32, fontFamily: T.sans }}>Your Practice</div>
              <h2 style={{ fontFamily: T.serif, fontSize: "clamp(26px, 2.8vw, 40px)", fontWeight: 500, lineHeight: 1.15, color: T.text, letterSpacing: "-1px", marginBottom: 12 }}>
                What best describes your world?
              </h2>
              <p style={{ fontSize: 14, color: T.text3, lineHeight: 1.7, marginBottom: 40, fontFamily: T.sans, fontWeight: 300 }}>
                Your scenarios and coaching will be shaped around your reality.
              </p>

              {/* Role options — editorial horizontal rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {ROLES.map((role, i) => (
                  <div key={role.id}
                    onClick={() => pickRole(role.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 20,
                      padding: "20px 0 20px 24px",
                      borderTop: i === 0 ? "1px solid " + T.divider : "none",
                      borderBottom: "1px solid " + T.divider,
                      borderLeft: "2px solid transparent",
                      cursor: "pointer", transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderLeftColor = T.gold;
                      e.currentTarget.style.background = "rgba(192,154,94,0.03)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderLeftColor = "transparent";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: "center" }}>{role.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 500, color: T.text, marginBottom: 3, letterSpacing: "-0.2px" }}>{role.label}</div>
                      <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.45, fontFamily: T.sans }}>{role.examples}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                      <path d="M3 7h8M7 3l4 4-4 4" stroke={T.text} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
                <button onClick={() => pickRole(null)} style={{
                  marginTop: 20, padding: "10px 0", background: "none", border: "none",
                  color: T.text4, fontSize: 12, cursor: "pointer", textAlign: "left",
                  fontFamily: T.sans, letterSpacing: "0.2px",
                }}>
                  Skip — use general scenarios →
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // ── MOBILE EXPERIENCE (original, preserved) ────────────────────────────────
  const [stepVisible, setStepVisible] = useState(true);
  function pick_mobile(opt) {
    if (!stepVisible) return;
    setStepVisible(false);
    setTimeout(() => {
      const next = Object.assign({},ans,{[QS[step].k]:opt});
      setAns(next);
      if (step < QS.length-1) setStep(step+1);
      else setPhase("role");
      setStepVisible(true);
    }, 240);
  }

  if (phase === "landing") {
    return (
      <div style={{ height:"100vh", overflow:"hidden", position:"relative", background:"#0F0D0A", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.sans, opacity:landingVisible?1:0, transition:"opacity 0.38s ease" }} className="au-grain-wrap">
        {/* Logo mark — glows softly behind the CTA */}
        <div style={{ position:"absolute", left:0, right:0, top:"70%", transform:"translateY(-50%)", display:"flex", justifyContent:"center", pointerEvents:"none" }}>
          <img src="/logo-dark.jpg" alt="" style={{ width:"min(60vw, 320px)", height:"auto", opacity:0.2, mixBlendMode:"screen" }}/>
        </div>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 40%, rgba(138,158,132,0.06) 0%, transparent 60%)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(10,8,5,0.6) 0%, rgba(10,8,5,0.3) 50%, rgba(10,8,5,0.8) 100%)" }}/>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(6,5,3,0.5) 100%)" }}/>
        {/* Content */}
        <div style={{ position:"relative", zIndex:2, textAlign:"center", maxWidth:380, padding:"0 32px", animation:"fadeUp 1s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s both" }}>
          <div style={{ fontSize:12, letterSpacing:"6px", textTransform:"uppercase", color:T.gold, fontFamily:T.sans, fontWeight:500, marginBottom:40 }}>AmplifyU</div>
          <h1 style={{ fontFamily:T.serif, fontSize:"clamp(32px,8vw,52px)", fontWeight:500, lineHeight:1.1, color:"rgba(255,255,255,0.93)", letterSpacing:"-1.5px", marginBottom:24 }}>
            The space to become who you've always been capable of.
          </h1>
          <div style={{ width:32, height:1, background:T.gold, margin:"0 auto 22px", opacity:0.6 }}/>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.38)", lineHeight:1.75, marginBottom:48, fontFamily:T.sans, fontWeight:300 }}>
            14 sessions. A private practice for communication, presence, and executive impact.
          </p>
          <button onClick={goToQuestions} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.2)", borderRadius:40, padding:"13px 36px", color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:400, letterSpacing:"1.5px", textTransform:"uppercase", cursor:"pointer", fontFamily:T.sans }}>
            Enter
          </button>
        </div>
      </div>
    );
  }

  if (phase === "role") {
    return (
      <div style={{minHeight:"100vh",background:"#F7F3EC",fontFamily:T.sans,display:"flex",flexDirection:"column",opacity:roleVisible?1:0,transition:"opacity 0.32s ease"}}>
        <div style={{position:"relative",height:345,flexShrink:0,overflow:"hidden"}}>
          <img src="/ob-role-2.png" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,5,0.85) 0%, transparent 45%)"}}/>
          <div style={{position:"absolute",bottom:20,left:24,right:24}}>
            <div style={{fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"3.5px",fontFamily:T.sans,marginBottom:10}}>Almost there.</div>
            <div style={{display:"flex",gap:6}}>
              {[...QS,{q:"role"}].map((_,i)=><div key={i} style={{height:2,borderRadius:1,flex:1,background:i<QS.length?T.gold:"rgba(255,255,255,0.3)"}}/>)}
            </div>
          </div>
        </div>
        <div style={{padding:"32px 24px 48px",flex:1,background:"#F7F3EC"}}>
          <div style={{fontSize:9,color:"#A8998A",letterSpacing:"3px",textTransform:"uppercase",marginBottom:24,fontFamily:T.sans}}>Your Practice</div>
          <h2 style={{fontFamily:T.serif,fontSize:"clamp(26px,7vw,36px)",fontWeight:500,lineHeight:1.15,color:"#2C2416",letterSpacing:"-0.5px",marginBottom:8}}>What best describes your world?</h2>
          <p style={{fontFamily:T.sans,fontSize:13,color:"#A8998A",lineHeight:1.65,marginBottom:32,fontWeight:300}}>Your scenarios and coaching will be shaped around your reality.</p>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {ROLES.map((role,i)=>(
              <div key={role.id} onClick={()=>pickRole(role.id)} style={{
                display:"flex",alignItems:"center",gap:16,
                padding:"18px 0 18px 16px",
                borderTop:i===0?"1px solid #DDD5C4":"none",
                borderBottom:"1px solid #DDD5C4",
                borderLeft:"2px solid transparent",
                cursor:"pointer",transition:"all 0.2s ease",
              }}
                onTouchStart={e=>{e.currentTarget.style.borderLeftColor=T.gold;e.currentTarget.style.background="rgba(138,158,132,0.04)";}}
                onTouchEnd={e=>{e.currentTarget.style.borderLeftColor="transparent";e.currentTarget.style.background="transparent";}}>
                <div style={{fontSize:18,flexShrink:0,width:24,textAlign:"center"}}>{role.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:500,color:"#2C2416",marginBottom:2,letterSpacing:"-0.1px"}}>{role.label}</div>
                  <div style={{fontSize:11,color:"#A8998A",lineHeight:1.4,fontFamily:T.sans}}>{role.examples}</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,opacity:0.25,marginRight:4}}>
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="#2C2416" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
            <button onClick={()=>pickRole(null)} style={{marginTop:20,padding:"10px 0",background:"none",border:"none",color:"#A8998A",fontSize:12,cursor:"pointer",textAlign:"left",fontFamily:T.sans,letterSpacing:"0.2px"}}>
              Skip — use general scenarios →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = QS[step];
  return (
    <div style={{minHeight:"100vh",background:"#F7F3EC",fontFamily:T.sans,display:"flex",flexDirection:"column",animation:"fadeIn 0.45s ease both"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",opacity:stepVisible?1:0,transition:"opacity 0.24s ease"}}>
        {/* Photo banner */}
        <div style={{position:"relative",height:345,flexShrink:0,overflow:"hidden"}}>
          {q.image
            ? <img src={q.image} alt="" onLoad={e=>{e.currentTarget.style.opacity="1"}} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 60%",opacity:0,transition:"opacity 0.5s ease"}}/>
            : <OBScene name={q.scene} height={300}/>}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,5,0.88) 0%, transparent 55%)"}}/>
          <div style={{position:"absolute",bottom:20,left:24,right:24}}>
            <div style={{fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"3.5px",fontFamily:T.sans,marginBottom:10}}>{q.context}</div>
            <div style={{display:"flex",gap:6}}>{QS.map((_,i)=><div key={i} style={{height:2,borderRadius:1,flex:1,background:i<=step?T.gold:"rgba(255,255,255,0.2)"}}/>)}</div>
          </div>
        </div>

        {/* Question + options on parchment */}
        <div style={{padding:"32px 24px 48px",flex:1,background:"#F7F3EC"}}>
          <div style={{fontSize:9,color:"#A8998A",letterSpacing:"3px",textTransform:"uppercase",marginBottom:24,fontFamily:T.sans}}>Reflection {step+1}</div>
          <h2 style={{fontFamily:T.serif,fontSize:"clamp(26px,7vw,36px)",fontWeight:500,lineHeight:1.15,color:"#2C2416",letterSpacing:"-0.5px",marginBottom:36}}>{q.q}</h2>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {q.opts.map((opt,i)=>(
              <div key={opt} onClick={()=>pick_mobile(opt)} style={{
                padding:"18px 0 18px 20px",
                borderTop:i===0?"1px solid #DDD5C4":"none",
                borderBottom:"1px solid #DDD5C4",
                borderLeft:"2px solid transparent",
                cursor:"pointer",transition:"all 0.2s ease",
              }}
                onTouchStart={e=>{e.currentTarget.style.borderLeftColor=T.gold;e.currentTarget.style.background="rgba(138,158,132,0.04)";}}
                onTouchEnd={e=>{e.currentTarget.style.borderLeftColor="transparent";e.currentTarget.style.background="transparent";}}>
                <p style={{fontFamily:T.serif,fontSize:17,color:"#6B5E44",lineHeight:1.45,margin:0,letterSpacing:"-0.1px"}}>{opt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

