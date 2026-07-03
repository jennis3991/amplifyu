import { useState, useEffect, useRef } from 'react';

// ─── D11 Rehearsal Widget — Build Your Brand ─────────────────────────────────
export function D11PracticeWidget({T, T2, isDesktop, onWordsChange}) {

  const GOAL_CARDS = [
    { icon:"🚀", label:"Become a Leader",         sub:"Lead teams, influence strategy, and shape culture" },
    { icon:"⭐", label:"Build Executive Presence", sub:"Be the person trusted with the biggest decisions" },
    { icon:"📈", label:"Accelerate My Career",     sub:"Get promoted, land a new role, or attract new opportunities" },
    { icon:"💼", label:"Build My Own Business",    sub:"Create something that's truly yours" },
    { icon:"✨", label:"Something Else",            sub:"Tell me in your own words", isOther:true },
  ];

  const DEFAULT_CURRENT = ["reliable","helpful","collaborative","professional","diligent"];
  const MORE_CURRENT    = ["analytical","creative","supportive","technical","organised","calm","driven","empathetic","innovative","curious","precise","thoughtful","strategic","friendly","hard-working"];
  const FUTURE_POOL     = ["strategic","executive","visionary","trusted","influential","commercial","decisive","inspiring","credible","fearless","innovative","empathetic","authentic","bold","thought leader","high impact","excellent communicator","confident","clear","calm under pressure"];

  const [screen,        setScreen]       = useState(1);
  const [goal,          setGoal]         = useState('');
  const [goalOther,     setGoalOther]    = useState('');
  const [goalWhy,       setGoalWhy]      = useState('');
  const [futureText,    setFutureText]   = useState('');
  const [futureWords,   setFutureWords]  = useState([]);
  const [extracting,    setExtracting]   = useState(false);
  const [extracted,     setExtracted]    = useState(false);
  const [editFuture,    setEditFuture]   = useState(false);
  const [currentChips,  setCurrentChips] = useState([...DEFAULT_CURRENT]);
  const [chipInput,     setChipInput]    = useState('');
  const [brandStmt,     setBrandStmt]    = useState('');
  const [s4Loading,     setS4Loading]    = useState(false);
  const [stmtSaved,     setStmtSaved]    = useState(false);

  useEffect(() => {
    if(onWordsChange && futureWords.length > 0) onWordsChange(futureWords);
  }, [futureWords]);

  useEffect(() => {
    if(screen === 4 && !brandStmt && !s4Loading) generateScreen4();
  }, [screen]);

  async function extractFutureWords() {
    if(!futureText.trim()) return;
    setExtracting(true);
    const goalLabel = goal === 'Other' ? goalOther : goal;
    const prompt = `A professional answered this question about their aspirational brand:

"${futureText.trim()}"

Their career goal: ${goalLabel}

Extract exactly 3 single words or short phrases (max 3 words each) that capture the core brand themes in what they wrote. These should be aspirational professional qualities — the kind of words a senior sponsor would use to describe them.

Return ONLY this format: WORD1|WORD2|WORD3 — nothing else.`;

    const fallback = ["strategic","trusted","influential"];
    try {
      const res = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:60,messages:[{role:"user",content:prompt}]}),
      });
      const data = await res.json();
      const text = (data.content||[]).map(b=>b.text||'').join('').trim();
      const parts = text.split('|').map(p=>p.trim().toLowerCase()).filter(p=>p.length>0 && p.length<30);
      setFutureWords(parts.length >= 3 ? parts.slice(0,3) : fallback);
    } catch(_) { setFutureWords(fallback); }
    setExtracting(false);
    setExtracted(true);
  }

  async function generateScreen4() {
    setS4Loading(true);
    const w = futureWords.map(x=>x.trim());
    const c = currentChips.slice(0,5);
    const goalLabel = goal === 'Other' ? goalOther : goal;
    const prompt = `You are an executive coach writing for a brand identity app.

Career goal: ${goalLabel}
Why it matters: ${goalWhy || futureText || 'not specified'}
How people currently see them: ${c.join(', ')}
How they want to be known: ${w.join(', ')}

Write a brand statement (25-35 words, third person) that sounds like what a senior sponsor would say introducing them at a conference. Powerful, personal, weaves in their aspirational words.

Return ONLY the sentence. No labels, no quotes.`;

    const fallback = `A ${goalLabel.toLowerCase().replace('become ','').replace('build ','') || 'rising professional'} building a reputation for ${w[0]||'leadership'} and ${w[1]||'impact'} — someone who combines ${c[0]||'dedication'} with ${w[2]||'vision'} to create lasting change wherever they lead.`;
    try {
      const res = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:150,messages:[{role:"user",content:prompt}]}),
      });
      const data = await res.json();
      const text = (data.content||[]).map(b=>b.text||'').join('').trim();
      setBrandStmt(text || fallback);
    } catch(_) { setBrandStmt(fallback); }
    setS4Loading(false);
  }

  const cs = {
    label: {fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10},
    card:  {background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"16px"},
  };
  function cta(disabled) {
    return {width:"100%",padding:"15px",borderRadius:4,border:"none",background:disabled?"rgba(44,36,22,0.15)":T.ink,color:disabled?"rgba(44,36,22,0.3)":(T2.bg||"#F7F3EC"),fontSize:isDesktop?15:14,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:T.sans,minHeight:50,transition:"all 0.2s"};
  }
  const back = {background:"none",border:"none",fontFamily:T.sans,fontSize:13,color:T2.text4,cursor:"pointer",padding:"4px 0",textAlign:"left"};

  function ProgressBar({current}) {
    return (
      <div style={{display:"flex",gap:4,marginBottom:24}}>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{height:3,borderRadius:2,flex:i===current?2:1,background:i<current?"rgba(200,164,106,0.6)":i===current?T.gold:T2.border,transition:"all 0.4s ease"}}/>
        ))}
      </div>
    );
  }

  // ── Screen 1: Dream ──────────────────────────────────────────────────────────
  if(screen===1) {
    const goalSet = goal && (goal !== 'Other' || goalOther.trim());
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?22:18}}>
        <ProgressBar current={1}/>
        <div>
          <div style={cs.label}>Your Dream</div>
          <h3 style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:600,color:T2.text,lineHeight:1.2,margin:"0 0 6px"}}>Where do you want your career to take you?</h3>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:0,lineHeight:1.55}}>Choose what matters most right now.</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:isDesktop?9:7}}>
          {GOAL_CARDS.map(card => {
            const sel = goal === card.label || (card.isOther && goal === 'Other');
            return (
              <button key={card.label} onClick={()=>setGoal(card.isOther ? 'Other' : card.label)}
                style={{display:"flex",alignItems:"center",gap:14,padding:isDesktop?"16px 18px":"13px 14px",borderRadius:6,border:`0.5px solid ${sel?T.gold:T2.border}`,background:sel?"rgba(200,164,106,0.07)":"transparent",cursor:"pointer",textAlign:"left",transition:"all 0.18s",boxShadow:sel?"0 0 0 1px rgba(200,164,106,0.12)":"none"}}>
                <div style={{width:isDesktop?42:36,height:isDesktop?42:36,borderRadius:10,background:sel?"rgba(200,164,106,0.14)":T2.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:isDesktop?19:17,transition:"background 0.18s"}}>
                  {card.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:3}}>{card.label}</div>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,lineHeight:1.45}}>{card.sub}</div>
                </div>
                <div style={{width:17,height:17,borderRadius:"50%",border:`1.5px solid ${sel?T.gold:T2.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                  {sel&&<div style={{width:8,height:8,borderRadius:"50%",background:T.gold}}/>}
                </div>
              </button>
            );
          })}
        </div>

        {goal === 'Other' && (
          <div style={{animation:"fadeUp 0.3s ease both"}}>
            <input value={goalOther} onChange={e=>setGoalOther(e.target.value)}
              placeholder="What are you trying to achieve?"
              className="au-input"
              style={{width:"100%",padding:"11px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
          </div>
        )}

        {goalSet && (
          <div style={{animation:"fadeUp 0.35s ease both"}}>
            <div style={cs.label}>Tell me more...</div>
            <textarea value={goalWhy} onChange={e=>setGoalWhy(e.target.value)}
              placeholder="In your own words, describe the future you're trying to create. Why does this matter to you?"
              rows={isDesktop?3:3}
              style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,resize:"none",outline:"none",lineHeight:1.65,boxSizing:"border-box",fontStyle:"italic"}}/>
          </div>
        )}

        <button onClick={()=>goalSet&&setScreen(2)} style={cta(!goalSet)}>Continue →</button>
      </div>
    );
  }

  // ── Screen 2: Future Identity (AI extraction) ────────────────────────────────
  if(screen===2) {
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?22:18}}>
        <ProgressBar current={2}/>
        <div style={cs.label}>Your Future Identity</div>

        {!extracted ? (
          <>
            <div>
              <h3 style={{fontFamily:T.serif,fontSize:isDesktop?24:20,fontWeight:600,color:T2.text,lineHeight:1.25,margin:"0 0 8px"}}>Imagine you're leaving your current company tomorrow.</h3>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,margin:0}}>What would you love people to say about you?</p>
            </div>
            <textarea value={futureText} onChange={e=>setFutureText(e.target.value)}
              placeholder="Write freely… 'I'd love to be remembered as someone who…' or 'I want people to say I was the kind of person who…'"
              rows={isDesktop?6:5}
              style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"10px 0",fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,resize:"none",outline:"none",lineHeight:1.7,boxSizing:"border-box",fontStyle:"italic"}}/>

            {!extracting ? (
              <button onClick={extractFutureWords} style={cta(futureText.trim().length < 15)}>
                Extract My Themes →
              </button>
            ) : (
              <div style={{display:"flex",alignItems:"center",gap:14,padding:"18px 0"}}>
                <img src="/logo-mark.png" alt="" style={{width:28,height:28,objectFit:"cover",filter:"brightness(0.55) sepia(0.4)",animation:"breathe 2s ease infinite"}}/>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,fontStyle:"italic"}}>Reading between the lines…</span>
              </div>
            )}
          </>
        ) : !editFuture ? (
          <div style={{animation:"fadeUp 0.5s ease both"}}>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 18px"}}>I noticed three themes in what you shared...</p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
              {futureWords.map((w,i)=>(
                <div key={i} style={{padding:isDesktop?"12px 24px":"10px 18px",borderRadius:30,background:"rgba(200,164,106,0.12)",border:`0.5px solid ${T.gold}`,fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T.gold,animation:`fadeUp 0.4s ${i*0.15}s ease both`}}>
                  {w}
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,fontWeight:500,margin:"0 0 14px"}}>Does this feel right?</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setScreen(3)}
                style={{flex:1,padding:"13px",borderRadius:4,border:"none",background:T.ink,color:T2.bg||"#F7F3EC",fontSize:isDesktop?14:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s"}}>
                Yes, this is me →
              </button>
              <button onClick={()=>setEditFuture(true)}
                style={{padding:"13px 20px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:isDesktop?14:13,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s"}}>
                Edit
              </button>
            </div>
          </div>
        ) : (
          <>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:0}}>Tap to select or remove. Choose the three that feel most true.</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {FUTURE_POOL.map(w => {
                const sel = futureWords.includes(w);
                const full = futureWords.length >= 3 && !sel;
                return (
                  <button key={w} onClick={()=>{
                    if(sel) setFutureWords(futureWords.filter(f=>f!==w));
                    else if(!full) setFutureWords([...futureWords,w]);
                  }} style={{padding:"8px 16px",borderRadius:20,border:`0.5px solid ${sel?T.gold:T2.border}`,background:sel?"rgba(200,164,106,0.12)":"transparent",color:sel?T.gold:full?T2.text4:T2.text3,fontSize:isDesktop?13:12,fontFamily:T.sans,cursor:full?"default":"pointer",fontWeight:sel?600:400,transition:"all 0.15s",opacity:full?0.4:1}}>
                    {w}
                  </button>
                );
              })}
            </div>
            {futureWords.length>0 && (
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {futureWords.map(w=><span key={w} style={{padding:"6px 14px",borderRadius:20,background:"rgba(200,164,106,0.1)",border:`0.5px solid ${T.gold}`,fontFamily:T.sans,fontSize:12,color:T.gold,fontWeight:600}}>{w}</span>)}
              </div>
            )}
            <button onClick={()=>futureWords.length===3&&setScreen(3)} style={cta(futureWords.length!==3)}>
              These feel right →
            </button>
          </>
        )}

        <button onClick={()=>{setScreen(1);setExtracted(false);setExtracting(false);setEditFuture(false);}} style={back}>← Back</button>
      </div>
    );
  }

  // ── Screen 3: Current Reputation ─────────────────────────────────────────────
  if(screen===3) {
    function addChip(w) {
      const clean = w.trim().toLowerCase();
      if(!clean || currentChips.includes(clean)) return;
      setCurrentChips(prev=>[...prev, clean]);
    }
    const suggestions = MORE_CURRENT.filter(w=>!currentChips.includes(w));

    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?22:18}}>
        <ProgressBar current={3}/>
        <div>
          <div style={cs.label}>Your Reputation Today</div>
          <h3 style={{fontFamily:T.serif,fontSize:isDesktop?24:20,fontWeight:600,color:T2.text,lineHeight:1.25,margin:"0 0 6px"}}>How do people see you today?</h3>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.55,margin:0}}>Remove any that don't fit. Add your own.</p>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:9}}>
          {currentChips.map(w=>(
            <div key={w} style={{display:"flex",alignItems:"center",gap:7,padding:isDesktop?"9px 15px":"7px 12px",borderRadius:30,background:"rgba(138,158,132,0.09)",border:"0.5px solid rgba(138,158,132,0.28)",fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,fontWeight:500}}>
              {w}
              <button onClick={()=>setCurrentChips(prev=>prev.filter(c=>c!==w))} style={{background:"none",border:"none",color:T2.text4,cursor:"pointer",padding:"0 0 0 2px",fontSize:15,lineHeight:1,display:"flex",alignItems:"center",fontFamily:T.sans}}>×</button>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:5,padding:isDesktop?"7px 13px":"6px 10px",borderRadius:30,border:"0.5px dashed "+T2.border}}>
            <input value={chipInput} onChange={e=>setChipInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"||e.key===","){ e.preventDefault(); addChip(chipInput); setChipInput(''); } }}
              placeholder="Add your own…"
              style={{background:"none",border:"none",outline:"none",fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,width:isDesktop?100:82}}/>
            {chipInput.trim() && (
              <button onClick={()=>{addChip(chipInput);setChipInput('');}} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",padding:0,fontSize:13,fontFamily:T.sans,fontWeight:700}}>+</button>
            )}
          </div>
        </div>

        {suggestions.length>0 && (
          <div>
            <div style={{fontFamily:T.sans,fontSize:10,color:T2.text4,fontWeight:600,textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:10}}>Add more</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {suggestions.slice(0,9).map(w=>(
                <button key={w} onClick={()=>addChip(w)} style={{padding:"6px 12px",borderRadius:20,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text4,fontSize:isDesktop?12:11,fontFamily:T.sans,cursor:"pointer",transition:"all 0.15s"}}>+ {w}</button>
              ))}
            </div>
          </div>
        )}

        <button onClick={()=>currentChips.length>0&&setScreen(4)} style={cta(currentChips.length===0)}>Continue →</button>
        <button onClick={()=>setScreen(2)} style={back}>← Back</button>
      </div>
    );
  }

  // ── Screen 4: Brand Gap ───────────────────────────────────────────────────────
  if(screen===4) {
    const gapText = "There's a gap between today's reputation and the one you're building. That gap is your opportunity — and it's exactly what AmplifyU is designed to close.";

    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?22:18}}>
        <ProgressBar current={4}/>

        {/* Gap visual */}
        <div style={{background:T.ink||"#2C2416",borderRadius:6,padding:isDesktop?"32px 26px":"22px 16px",animation:"fadeUp 0.5s ease both"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(200,164,106,0.5)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:16}}>Your Brand Snapshot</div>

          <div style={{marginBottom:20}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(245,239,230,0.3)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>People see you as</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {currentChips.slice(0,5).map(w=>(
                <span key={w} style={{padding:"6px 14px",borderRadius:20,background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.1)",fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.45)",fontWeight:500}}>{w}</span>
              ))}
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{flex:1,height:"0.5px",background:"rgba(255,255,255,0.06)"}}/>
            <span style={{fontFamily:T.serif,fontSize:22,color:T.gold,fontWeight:300,lineHeight:1}}>↓</span>
            <div style={{flex:1,height:"0.5px",background:"rgba(255,255,255,0.06)"}}/>
          </div>

          <div>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>You want to become</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {futureWords.map(w=>(
                <span key={w} style={{padding:"6px 14px",borderRadius:20,background:"rgba(200,164,106,0.15)",border:`0.5px solid ${T.gold}`,fontFamily:T.sans,fontSize:isDesktop?13:12,color:T.gold,fontWeight:600}}>{w}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunity */}
        <div style={{...cs.card,borderLeft:"2px solid "+T.gold,animation:"fadeUp 0.5s 0.08s ease both"}}>
          <div style={cs.label}>Your Biggest Opportunity</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,margin:"0 0 14px"}}>{gapText}</p>
          {["communicate with greater authority","tell stronger stories","build visible expertise","create a professional identity that matches your ambition"].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:7}}>
              <span style={{color:T.gold,fontSize:12,flexShrink:0,marginTop:2}}>✓</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{item}</span>
            </div>
          ))}
        </div>

        {/* Brand Statement */}
        <div style={{...cs.card,animation:"fadeUp 0.5s 0.16s ease both"}}>
          <div style={cs.label}>Your Brand Statement</div>
          {s4Loading ? (
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0"}}>
              <img src="/logo-mark.png" alt="" style={{width:28,height:28,objectFit:"cover",filter:"brightness(0.55) sepia(0.4)",animation:"breathe 2s ease infinite"}}/>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,fontStyle:"italic"}}>Writing your brand statement…</span>
            </div>
          ) : (
            <>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,fontWeight:600,color:T2.text,lineHeight:1.6,margin:"0 0 18px",fontStyle:"italic"}}>"{brandStmt}"</p>
              <button onClick={()=>{navigator.clipboard?.writeText(brandStmt).then(()=>{setStmtSaved(true);setTimeout(()=>setStmtSaved(false),2500);});}}
                style={{padding:"9px 20px",borderRadius:4,border:"none",background:stmtSaved?"rgba(138,158,132,0.14)":T.ink,color:stmtSaved?"#7A9E84":(T2.bg||"#F7F3EC"),fontSize:isDesktop?13:12,fontWeight:600,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s"}}>
                {stmtSaved?"Saved ✓":"Save My Brand Statement"}
              </button>
            </>
          )}
        </div>

        <button onClick={()=>setScreen(3)} style={back}>← Back</button>
      </div>
    );
  }

  return null;
}


// ─── D11 Simulation Widget — Brand in Action ─────────────────────────────────
export function D11SimWidget({T, T2, isDesktop, brandWords=[]}) {

  const INDUSTRIES = [
    "Technology","Finance","Healthcare","Marketing & Communications","Consulting",
    "Legal","Education","Engineering","Media & Creative","Retail","Government & Public Sector","Other",
  ];
  const DREAM_SUGGESTIONS = ["Microsoft","Apple","Google","Amazon","McKinsey","Deloitte","Shell","Meta","Goldman Sachs","Netflix","Startup"];
  const COMMITMENTS = [
    "I'll speak up before I'm ready.",
    "I'll be intentional about how I show up.",
    "I'll communicate with clarity.",
    "I'll build my reputation one interaction at a time.",
    "I'll stop hoping people notice my value and start showing it.",
  ];

  // Progress bar labels for loading animation
  const BAR_ITEMS = [
    {label:"Clarity",         pct:82},
    {label:"Leadership",      pct:58},
    {label:"Authority",       pct:74},
    {label:"Credibility",     pct:88},
    {label:"Differentiation", pct:44},
    {label:"Future Alignment",pct:0},
  ];

  const [step,         setStep]        = useState(1);
  const [careerGoal,   setCareerGoal]  = useState('');
  const [industry,     setIndustry]    = useState('');
  const [dreamCos,     setDreamCos]    = useState([]);
  const [dreamInput,   setDreamInput]  = useState('');
  const [headline,     setHeadline]    = useState('');
  const [about,        setAbout]       = useState('');
  const [aboutCollapsed, setAboutCollapsed] = useState(false);
  const [cv,           setCv]          = useState('');
  const [loading,      setLoading]     = useState(false);
  const [barActive,    setBarActive]   = useState(-1);
  const [result,       setResult]      = useState(null);
  const [apiError,     setApiError]    = useState(false);
  const [copied,       setCopied]      = useState(null);
  const [commitment,   setCommitment]  = useState('');
  const [committed,    setCommitted]   = useState(false);
  const barIntervalRef = useRef(null);

  const futureWords = (brandWords||[]).filter(w=>w&&w.trim().length>0);

  const cs = {
    card:  {background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"16px"},
    label: {fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10},
  };
  function cta(disabled) {
    return {width:"100%",padding:"15px",borderRadius:4,border:"none",background:disabled?"rgba(44,36,22,0.15)":T.ink,color:disabled?"rgba(44,36,22,0.3)":(T2.bg||"#F7F3EC"),fontSize:isDesktop?15:14,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:T.sans,minHeight:50,transition:"all 0.2s"};
  }
  const back = {background:"none",border:"none",fontFamily:T.sans,fontSize:13,color:T2.text4,cursor:"pointer",padding:"4px 0",textAlign:"left"};

  const STEP_LABELS = ["Career Goal","LinkedIn Snapshot","Brand Mirror","Profile Rewrite","Your Playbook"];
  function StepPills() {
    return (
      <div style={{display:"flex",gap:isDesktop?5:3,marginBottom:20,overflowX:"auto",paddingBottom:2}}>
        {STEP_LABELS.map((l,i) => {
          const n=i+1; const done=n<step; const active=n===step;
          return (
            <div key={i} style={{flexShrink:0,padding:isDesktop?"6px 11px":"5px 8px",borderRadius:20,border:`0.5px solid ${active?T.ink:done?"rgba(138,158,132,0.4)":T2.border}`,background:active?(T.ink||"#2C2416"):done?"rgba(138,158,132,0.06)":"transparent",fontFamily:T.sans,fontSize:isDesktop?11:9,fontWeight:active?600:400,color:active?"#F7F3EC":done?"rgba(138,158,132,0.85)":T2.text4,whiteSpace:"nowrap",transition:"all 0.2s"}}>
              {done?"✓ ":""}{l}
            </div>
          );
        })}
      </div>
    );
  }

  function addDreamCo(co) {
    const clean = co.trim();
    if(!clean || dreamCos.includes(clean)) return;
    setDreamCos([...dreamCos, clean]);
    setDreamInput('');
  }

  async function runAnalysis() {
    setLoading(true);
    setApiError(false);
    setResult(null);
    setBarActive(-1);

    barIntervalRef.current = setInterval(() => {
      setBarActive(prev => {
        if(prev >= BAR_ITEMS.length - 2) { clearInterval(barIntervalRef.current); return prev; }
        return prev + 1;
      });
    }, 700);

    const w = futureWords.length > 0 ? futureWords : ["strategic","trusted","influential"];
    const prompt = `You are a world-class personal brand strategist and executive coach. Analyse the following LinkedIn profile against the professional's career goals and brand intent.

Career goal: ${careerGoal}
Industry: ${industry||'not specified'}
Dream companies or roles: ${dreamCos.length ? dreamCos.join(', ') : 'not specified'}
Their intended brand (3 words): ${w.join(', ')}

LinkedIn headline: ${headline}
LinkedIn About section: ${about||'(not provided)'}
Additional context / CV: ${cv||'(not provided)'}

Return your analysis as valid JSON with this exact structure:
{
  "score": <integer 0-100>,
  "currentSignals": [<3-4 strings: qualities the profile currently communicates>],
  "missingSignals": [<3-4 strings: specific qualities absent from the profile>],
  "insight": "<3-4 sentences — warm, expert, direct. Start positive. No bullets.>",
  "improvedHeadline": "<powerful LinkedIn headline under 200 chars>",
  "improvedAbout": "<three executive paragraphs in first person, weaving in brand words. Separate with \\n\\n>",
  "missingAchievements": [<5 strings: types of content missing from the profile>],
  "biggestStrength": "<one sentence identifying their strongest brand asset>",
  "biggestGap": "<one sentence identifying the clearest gap, framed as opportunity>",
  "thisWeek": [<4 strings: specific actionable items — short phrases>],
  "nextMonth": [<4 strings: strategic themes — short phrases>],
  "stageIntro": "<a theatrical 4-sentence introduction as if reading it before they walk on stage two years from now. Start with 'Two years from now, someone stands up to introduce you.' Include a sentence starting with 'Known for'. End with 'Please welcome them to the stage.' Second person, no name. Make it feel like goosebumps.>",
  "positioningStatement": "<one sentence: I help [who] by [how] so that [outcome]>",
  "brandPillars": [<3 strings: their core brand pillars, 2-4 words each>],
  "tagline": "<a personal tagline or signature phrase, 3-6 words, memorable>",
  "coachMessage": "<3-4 sentence closing message — inspirational, personal, references their specific words and goal>"
}

Return ONLY valid JSON. No preamble, no markdown fences.`;

    try {
      const res = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:2000,messages:[{role:"user",content:prompt}]}),
      });
      const data = await res.json();
      const raw = (data.content||[]).map(b=>b.text||'').join('').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      if(!m) throw new Error("no json");
      const parsed = JSON.parse(m[0]);
      clearInterval(barIntervalRef.current);
      setBarActive(BAR_ITEMS.length - 1);
      // Small delay to let final bar animate, then show results
      setTimeout(() => {
        setResult(parsed);
        setLoading(false);
        setStep(3);
      }, 900);
    } catch(_) {
      clearInterval(barIntervalRef.current);
      setLoading(false);
      setApiError(true);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if(loading) return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <StepPills/>
      <div style={{...cs.card,padding:isDesktop?"48px 32px":"36px 20px"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24,marginBottom:32}}>
          <img src="/logo-mark.png" alt="" style={{width:48,height:48,objectFit:"cover",filter:"brightness(0.55) sepia(0.4)",animation:"breathe 2s ease infinite"}}/>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T2.text,margin:0,textAlign:"center",lineHeight:1.3}}>Analysing your brand signal…</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {BAR_ITEMS.map(({label,pct},i) => {
            const active = i <= barActive;
            const isLast = i === BAR_ITEMS.length - 1;
            const displayPct = isLast && result ? result.score : pct;
            return (
              <div key={i} style={{opacity:active?1:0.22,transition:"opacity 0.5s ease"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:active?T2.text:T2.text4,transition:"color 0.4s",fontWeight:active?500:400}}>{label}</span>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T.gold,opacity:active?1:0,transition:"opacity 0.5s 0.6s"}}>{active?displayPct+'%':''}</span>
                </div>
                <div style={{height:3,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                  <div style={{
                    height:"100%",
                    width: active ? displayPct+'%' : '0%',
                    background:`linear-gradient(to right, rgba(200,164,106,0.55), ${T.gold})`,
                    borderRadius:2,
                    transition:"width 1.1s cubic-bezier(0.25,0.46,0.45,0.94)"
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if(apiError) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <StepPills/>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"48px 24px":"36px 20px"}}>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:"0 0 20px"}}>Couldn't connect right now. Check your connection and try again.</p>
        <button onClick={runAnalysis} style={{...cta(false),width:"auto",padding:"12px 28px",display:"inline-block"}}>Try Again →</button>
      </div>
      <button onClick={()=>{setApiError(false);setStep(2);}} style={back}>← Back</button>
    </div>
  );

  // ── Step 1: Career Goal ────────────────────────────────────────────────────
  if(step===1) return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <StepPills/>
      <div style={cs.card}>
        <div style={{marginBottom:18}}>
          <div style={cs.label}>Your Career Goal</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:"0 0 10px",lineHeight:1.55}}>Where are you trying to get to?</p>
          <input value={careerGoal} onChange={e=>setCareerGoal(e.target.value)}
            placeholder="e.g. Head of Product at a Series B startup"
            className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Industry</div>
          <select value={industry} onChange={e=>setIndustry(e.target.value)}
            style={{width:"100%",padding:"10px 14px",background:T2.surface,border:"0.5px solid "+T2.border,borderRadius:4,fontFamily:T.sans,fontSize:isDesktop?14:13,color:industry?T2.text:T2.text4,outline:"none",cursor:"pointer",boxSizing:"border-box",appearance:"auto"}}>
            <option value="">Select your industry</option>
            {INDUSTRIES.map(ind=><option key={ind} value={ind} style={{background:"#1a1610"}}>{ind}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>
            Dream companies <span style={{fontWeight:400,fontSize:10,textTransform:"none"}}>(optional)</span>
          </div>
          {dreamCos.length>0 && (
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
              {dreamCos.map(co=>(
                <span key={co} style={{padding:"5px 12px",borderRadius:20,background:"rgba(200,164,106,0.1)",border:`0.5px solid ${T.gold}`,fontFamily:T.sans,fontSize:12,color:T.gold,display:"flex",alignItems:"center",gap:6}}>
                  {co}
                  <button onClick={()=>setDreamCos(dreamCos.filter(c=>c!==co))} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",padding:0,fontSize:14,lineHeight:1,fontFamily:T.sans}}>×</button>
                </span>
              ))}
            </div>
          )}
          <input value={dreamInput} onChange={e=>setDreamInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"||e.key===","){ e.preventDefault(); addDreamCo(dreamInput); } }}
            placeholder="Type company name, press Enter"
            className="au-input" style={{width:"100%",padding:"9px 14px",fontSize:isDesktop?13:12,boxSizing:"border-box",marginBottom:8}}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {DREAM_SUGGESTIONS.filter(co=>!dreamCos.includes(co)).map(co=>(
              <button key={co} onClick={()=>addDreamCo(co)} style={{padding:"5px 11px",borderRadius:20,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:11,fontFamily:T.sans,cursor:"pointer",transition:"all 0.15s"}}>+{co}</button>
            ))}
          </div>
        </div>
      </div>

      {futureWords.length>0 && (
        <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
          <div style={cs.label}>Your Brand Intent</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?22:19,fontWeight:600,color:T2.text,lineHeight:1.2,margin:0,letterSpacing:"-0.2px"}}>
            {futureWords.map((w,i,arr)=>(
              <span key={i}>{w}{i<arr.length-1&&<span style={{color:T.gold,fontWeight:300,padding:"0 8px"}}>·</span>}</span>
            ))}
          </p>
        </div>
      )}

      <button onClick={()=>careerGoal.trim()&&setStep(2)} style={cta(!careerGoal.trim())}>Continue →</button>
    </div>
  );

  // ── Step 2: LinkedIn Snapshot ──────────────────────────────────────────────
  if(step===2) {
    const aboutWords = about.trim().split(/\s+/).filter(Boolean).length;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <StepPills/>
        <div style={cs.card}>
          <div style={cs.label}>LinkedIn Snapshot</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 20px",fontStyle:"italic"}}>The more you share, the sharper the analysis.</p>

          <div style={{marginBottom:20}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Your LinkedIn Headline</div>
            <input value={headline} onChange={e=>setHeadline(e.target.value)}
              placeholder="e.g. Marketing Manager | Helping brands find their voice"
              className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
            <div style={{fontFamily:T.sans,fontSize:11,color:headline.length>220?"rgba(180,80,60,0.8)":T2.text4,marginTop:5}}>{headline.length} / 220 characters</div>
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Paste Your About Section</div>
            {about.trim() && aboutCollapsed ? (
              <div onClick={()=>setAboutCollapsed(false)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",cursor:"pointer",borderBottom:"0.5px solid "+T2.divider}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{color:"rgba(138,158,132,0.85)",fontSize:15}}>✓</span>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text}}>About section added</span>
                </div>
                <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>{aboutWords} words · Tap to edit</span>
              </div>
            ) : (
              <textarea value={about} onChange={e=>setAbout(e.target.value)}
                onBlur={()=>{ if(about.trim().length>30) setAboutCollapsed(true); }}
                placeholder="Paste your LinkedIn About section here…"
                rows={isDesktop?6:5}
                style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.65,boxSizing:"border-box"}}/>
            )}
            {about.trim() && !aboutCollapsed && <div style={{fontFamily:T.sans,fontSize:11,color:T2.text4,marginTop:5}}>{aboutWords} words</div>}
          </div>

          <div>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>
              CV or additional context <span style={{fontWeight:400,textTransform:"none",fontSize:10}}>(optional)</span>
            </div>
            <textarea value={cv} onChange={e=>setCv(e.target.value)}
              placeholder="Paste your CV profile, key achievements, or any context that would help your coach understand your background…"
              rows={isDesktop?4:3}
              style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
          </div>

          <p style={{fontFamily:T.sans,fontSize:11,color:T2.text4,margin:"14px 0 0"}}>Your text is used only to generate your analysis. It is not stored.</p>
        </div>

        {headline.trim() && !about.trim() && (
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,fontStyle:"italic",margin:0,lineHeight:1.55}}>Adding your About section gives a much richer analysis — but you can continue with just your headline.</p>
        )}

        <button onClick={()=>headline.trim()&&runAnalysis()} style={cta(!headline.trim())}>Run the Analysis →</button>
        <button onClick={()=>setStep(1)} style={back}>← Back</button>
      </div>
    );
  }

  // ── Step 3: Brand Mirror ───────────────────────────────────────────────────
  if(step===3 && result) {
    const score = result.score || 0;
    const w = futureWords.length>0 ? futureWords : ["strategic","trusted","influential"];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepPills/>

        {/* Score hero */}
        <div style={{background:T.ink||"#2C2416",borderRadius:4,padding:isDesktop?"32px 28px":"24px 18px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(200,164,106,0.6)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Brand Alignment Score</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?76:58,fontWeight:700,color:"#F5EFE6",lineHeight:0.9,letterSpacing:"-3px",marginBottom:14}}>
            {score}<span style={{fontSize:isDesktop?28:22,fontWeight:300,color:"rgba(245,239,230,0.35)",letterSpacing:0}}>%</span>
          </div>
          {careerGoal && <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:"rgba(200,164,106,0.6)",fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Aiming for: {careerGoal}</p>}
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.65)",lineHeight:1.65,margin:0}}>{result.insight||""}</p>
        </div>

        {/* Three-panel Brand Mirror */}
        <div style={{display:isDesktop?"grid":"flex",gridTemplateColumns:isDesktop?"1fr auto 1fr auto 1fr":"",flexDirection:isDesktop?"":"column",gap:isDesktop?0:10,alignItems:"start"}}>
          {/* Current */}
          <div style={{...cs.card,borderRadius:4}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Current Brand</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {(result.currentSignals||[]).map((s,i)=>(
                <span key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.4}}>{s}</span>
              ))}
            </div>
          </div>

          {isDesktop && <div style={{display:"flex",alignItems:"center",padding:"0 8px",marginTop:32}}><span style={{fontFamily:T.serif,fontSize:20,color:T.gold,fontWeight:300}}>→</span></div>}

          {/* Gap */}
          <div style={{background:"rgba(200,164,106,0.05)",borderRadius:4,border:`0.5px solid rgba(200,164,106,0.18)`,padding:isDesktop?"18px":"14px 12px"}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(200,164,106,0.7)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Gap</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {(result.missingSignals||[]).slice(0,3).map((s,i)=>(
                <span key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.4}}>{s}</span>
              ))}
            </div>
          </div>

          {isDesktop && <div style={{display:"flex",alignItems:"center",padding:"0 8px",marginTop:32}}><span style={{fontFamily:T.serif,fontSize:20,color:T.gold,fontWeight:300}}>→</span></div>}

          {/* Target */}
          <div style={{background:"rgba(200,164,106,0.09)",borderRadius:4,border:`0.5px solid ${T.gold}`,padding:isDesktop?"18px":"14px 12px"}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Target Brand</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {w.map((s,i)=>(
                <span key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T.gold,fontWeight:600,lineHeight:1.4}}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        <button onClick={()=>setStep(4)} style={cta(false)}>See Profile Rewrite →</button>
        <button onClick={()=>{setResult(null);setStep(2);}} style={back}>← Back</button>
      </div>
    );
  }

  // ── Step 4: Profile Rewrite ────────────────────────────────────────────────
  if(step===4 && result) {
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepPills/>

        {/* Headline */}
        <div style={cs.card}>
          <div style={cs.label}>Headline</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {headline && (
              <div style={{padding:"12px 14px",borderRadius:4,background:T2.bg}}>
                <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Current</div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.5,margin:0}}>{headline}</p>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"center"}}><span style={{fontFamily:T.serif,fontSize:20,color:T.gold,fontWeight:300}}>↓</span></div>
            <div style={{padding:"14px 16px",borderRadius:4,background:"rgba(138,158,132,0.06)",border:"0.5px solid rgba(138,158,132,0.2)"}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Suggested</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:"0 0 12px"}}>{result.improvedHeadline||""}</p>
              <button onClick={()=>{ navigator.clipboard?.writeText(result.improvedHeadline||"").then(()=>{ setCopied("hl"); setTimeout(()=>setCopied(null),2000); }); }}
                style={{padding:"6px 14px",borderRadius:3,border:`0.5px solid ${T.gold}`,background:copied==="hl"?"rgba(138,158,132,0.12)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>
                {copied==="hl"?"Copied ✓":"Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div style={cs.card}>
          <div style={cs.label}>About Section</div>
          {about && (
            <>
              <div style={{padding:"12px 14px",borderRadius:4,background:T2.bg,marginBottom:12}}>
                <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Current</div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.65,margin:0,maxHeight:90,overflow:"hidden"}}>{about.slice(0,270)}{about.length>270?"…":""}</p>
              </div>
              <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><span style={{fontFamily:T.serif,fontSize:20,color:T.gold,fontWeight:300}}>↓</span></div>
            </>
          )}
          <div style={{padding:"16px",borderRadius:4,background:"rgba(138,158,132,0.06)",border:"0.5px solid rgba(138,158,132,0.2)"}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>AI Rewrite</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,color:T2.text,lineHeight:1.75,margin:"0 0 14px",whiteSpace:"pre-wrap"}}>{result.improvedAbout||""}</p>
            <button onClick={()=>{ navigator.clipboard?.writeText(result.improvedAbout||"").then(()=>{ setCopied("ab"); setTimeout(()=>setCopied(null),2000); }); }}
              style={{padding:"6px 14px",borderRadius:3,border:`0.5px solid ${T.gold}`,background:copied==="ab"?"rgba(138,158,132,0.12)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>
              {copied==="ab"?"Copied ✓":"Copy"}
            </button>
          </div>
        </div>

        {/* Consider adding */}
        <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
          <div style={cs.label}>Consider Adding</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {(result.missingAchievements||[]).map((a,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{a}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={()=>setStep(5)} style={cta(false)}>See Your Brand Playbook →</button>
        <button onClick={()=>setStep(3)} style={back}>← Back</button>
      </div>
    );
  }

  // ── Step 5: Personal Brand Playbook ──────────────────────────────────────
  if(step===5 && result) {
    const w = futureWords.length>0 ? futureWords : ["strategic","trusted","influential"];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepPills/>

        {/* Personal Brand Card */}
        <div style={{background:T.ink||"#2C2416",borderRadius:6,padding:isDesktop?"36px 30px":"26px 20px",animation:"fadeUp 0.5s ease both"}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(200,164,106,0.45)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:20}}>Your Personal Brand</div>

          <div style={{fontFamily:T.serif,fontSize:isDesktop?32:26,fontWeight:700,color:"#F5EFE6",letterSpacing:"-0.5px",lineHeight:1,marginBottom:6}}>
            {w.map((word,i,arr)=>(
              <span key={i}>{word}{i<arr.length-1&&<span style={{color:T.gold,fontWeight:300,padding:"0 10px"}}>·</span>}</span>
            ))}
          </div>

          {result.tagline && (
            <div style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:T.gold,marginBottom:24,marginTop:6,fontWeight:400}}>"{result.tagline}"</div>
          )}

          {careerGoal && (
            <div style={{marginBottom:20,paddingTop:16,borderTop:"0.5px solid rgba(255,255,255,0.06)"}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(200,164,106,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Goal</div>
              <div style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.7)"}}>{careerGoal}</div>
            </div>
          )}

          {result.positioningStatement && (
            <div style={{marginBottom:20,paddingTop:16,borderTop:"0.5px solid rgba(255,255,255,0.06)"}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(200,164,106,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Positioning</div>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?15:13,color:"rgba(245,239,230,0.65)",lineHeight:1.55,fontStyle:"italic"}}>{result.positioningStatement}</div>
            </div>
          )}

          {(result.brandPillars||[]).length>0 && (
            <div style={{paddingTop:16,borderTop:"0.5px solid rgba(255,255,255,0.06)"}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(200,164,106,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Brand Pillars</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {(result.brandPillars||[]).map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontFamily:T.sans,fontSize:11,color:T.gold,fontWeight:700,minWidth:16}}>{['①','②','③'][i]||'•'}</span>
                    <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.62)"}}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stage Introduction — the wow moment */}
        {result.stageIntro && (
          <div style={{background:"rgba(200,164,106,0.04)",borderRadius:6,border:"0.5px solid rgba(200,164,106,0.18)",padding:isDesktop?"32px 28px":"22px 18px",animation:"fadeUp 0.6s 0.1s ease both"}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(200,164,106,0.5)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:20}}>Two Years From Now...</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,fontStyle:"italic",color:T2.text,lineHeight:1.8,margin:0}}>"{result.stageIntro}"</p>
          </div>
        )}

        {/* Strength + Gap */}
        <div style={{display:"flex",gap:12,flexDirection:isDesktop?"row":"column"}}>
          <div style={{...cs.card,flex:1}}>
            <div style={cs.label}>Biggest Strength</div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.65,margin:0}}>{result.biggestStrength||""}</p>
          </div>
          <div style={{...cs.card,flex:1}}>
            <div style={cs.label}>Biggest Gap</div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.65,margin:0}}>{result.biggestGap||""}</p>
          </div>
        </div>

        {/* This week */}
        <div style={cs.card}>
          <div style={cs.label}>This Week</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {(result.thisWeek||[]).map((a,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:1}}>→</span>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next month */}
        <div style={cs.card}>
          <div style={cs.label}>Over the Next Month</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {(result.nextMonth||[]).map((a,i)=>(
              <span key={i} style={{padding:"7px 14px",borderRadius:20,background:"rgba(138,158,132,0.07)",border:"0.5px solid rgba(138,158,132,0.18)",fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3}}>{a}</span>
            ))}
          </div>
        </div>

        {/* Coach message */}
        <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(200,164,106,0.03)"}}>
          <div style={cs.label}>Your Coach Says</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontStyle:"italic",color:T2.text,lineHeight:1.7,margin:0}}>"{result.coachMessage||""}"</p>
        </div>

        {/* Commitment */}
        {!committed ? (
          <div style={cs.card}>
            <div style={cs.label}>Make Your Promise</div>
            <h3 style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 18px"}}>Before we move on, make me one promise.</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
              {COMMITMENTS.map((c,i)=>(
                <button key={i} onClick={()=>setCommitment(c)}
                  style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 14px",borderRadius:4,border:`0.5px solid ${commitment===c?T.gold:T2.border}`,background:commitment===c?"rgba(200,164,106,0.08)":"transparent",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                  <div style={{width:16,height:16,borderRadius:"50%",border:`1.5px solid ${commitment===c?T.gold:T2.border}`,flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                    {commitment===c&&<div style={{width:8,height:8,borderRadius:"50%",background:T.gold}}/>}
                  </div>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:commitment===c?T2.text:T2.text3,lineHeight:1.5,fontWeight:commitment===c?500:400}}>{c}</span>
                </button>
              ))}
            </div>
            <button onClick={()=>{
              if(!commitment) return;
              try { localStorage.setItem('amplifyuCommitment', commitment); } catch(_){}
              setCommitted(true);
            }} style={cta(!commitment)}>I commit to this →</button>
          </div>
        ) : (
          <div style={{...cs.card,background:"rgba(138,158,132,0.05)",border:"0.5px solid rgba(138,158,132,0.28)",animation:"fadeUp 0.4s ease both"}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(138,158,132,0.75)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Pinned to your programme</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:"0 0 8px"}}>"{commitment}"</p>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text4,margin:0,lineHeight:1.6}}>This commitment stays with you throughout AmplifyU. Return to it whenever you need a reminder of why this matters.</p>
          </div>
        )}

        <button onClick={()=>setStep(4)} style={back}>← Back</button>
      </div>
    );
  }

  return null;
}
