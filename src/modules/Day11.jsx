import { useState, useEffect, useRef } from 'react';

// ─── D11 Rehearsal Widget ─────────────────────────────────────────────────────
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

  const [screen,        setScreen]       = useState(1);
  const [goal,          setGoal]         = useState('');
  const [goalOther,     setGoalOther]    = useState('');
  const [goalWhy,       setGoalWhy]      = useState('');
  const [futureText,    setFutureText]   = useState('');
  const [futureWords,   setFutureWords]  = useState([]);
  const [futureLoading, setFutureLoading]= useState(false);
  const [currentChips,  setCurrentChips] = useState([...DEFAULT_CURRENT]);
  const [chipInput,     setChipInput]    = useState('');
  const [brandStmt,     setBrandStmt]    = useState('');
  const [stmtLoading,   setStmtLoading]  = useState(false);
  const [stmtSaved,     setStmtSaved]    = useState(false);
  const [oppOpen,       setOppOpen]      = useState(false);

  useEffect(() => {
    if(onWordsChange && futureWords.length > 0) onWordsChange(futureWords);
  }, [futureWords]);

  useEffect(() => {
    if(screen === 3 && !brandStmt && !stmtLoading) generateStatement();
  }, [screen]);

  async function extractFutureWords() {
    setFutureLoading(true);
    const goalLabel = goal === 'Other' ? goalOther : goal;
    if(futureText.trim().length < 10) {
      const dflt = {
        "Become a Leader":["strategic","trusted","inspiring"],
        "Build Executive Presence":["executive","credible","influential"],
        "Accelerate My Career":["high impact","decisive","confident"],
        "Build My Own Business":["visionary","bold","commercial"],
      };
      setTimeout(()=>{ setFutureWords(dflt[goalLabel]||["strategic","trusted","influential"]); setFutureLoading(false); }, 800);
      return;
    }
    const prompt = `Career goal: ${goalLabel}. They wrote: "${futureText.trim()}".
Extract exactly 3 aspirational professional brand themes (single words or max 3-word phrases).
Return ONLY: WORD1|WORD2|WORD3`;
    try {
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:60,messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      const text = (data.content||[]).map(b=>b.text||'').join('').trim();
      const parts = text.split('|').map(p=>p.trim().toLowerCase()).filter(p=>p.length>0&&p.length<30);
      setFutureWords(parts.length>=3 ? parts.slice(0,3) : ["strategic","trusted","influential"]);
    } catch(_){ setFutureWords(["strategic","trusted","influential"]); }
    setFutureLoading(false);
  }

  async function generateStatement() {
    setStmtLoading(true);
    const w = futureWords.map(x=>x.trim());
    const c = currentChips.slice(0,4);
    const goalLabel = goal==='Other' ? goalOther : goal;
    const prompt = `Career goal: ${goalLabel}. Currently seen as: ${c.join(', ')}. Wants to be known as: ${w.join(', ')}.
Write a 25-35 word brand statement (third person) a senior sponsor would say. Powerful, personal. Return ONLY the sentence.`;
    const fallback = `A ${goalLabel.toLowerCase().replace(/^(become |build )/,'')||'rising professional'} building a reputation for ${w[0]||'leadership'} and ${w[1]||'impact'} — combining ${c[0]||'dedication'} with ${w[2]||'vision'} to create lasting change.`;
    try {
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:150,messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      const text = (data.content||[]).map(b=>b.text||'').join('').trim();
      setBrandStmt(text||fallback);
    } catch(_){ setBrandStmt(fallback); }
    setStmtLoading(false);
  }

  const cs = {
    label: {fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
    card:  {background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"20px":"14px"},
  };
  function cta(disabled){return{width:"100%",padding:"14px",borderRadius:4,border:"none",background:disabled?"rgba(44,36,22,0.15)":T.ink,color:disabled?"rgba(44,36,22,0.3)":(T2.bg||"#F7F3EC"),fontSize:isDesktop?14:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"};}
  const back={background:"none",border:"none",fontFamily:T.sans,fontSize:13,color:T2.text4,cursor:"pointer",padding:"4px 0",textAlign:"left"};

  function ProgressBar({current,total=3}){
    return(
      <div style={{display:"flex",gap:4,marginBottom:18}}>
        {Array.from({length:total},(_,i)=>i+1).map(i=>(
          <div key={i} style={{height:3,borderRadius:2,flex:i===current?2:1,background:i<current?"rgba(200,164,106,0.6)":i===current?T.gold:T2.border,transition:"all 0.4s ease"}}/>
        ))}
      </div>
    );
  }

  // ── Screen 1: Define Your Brand ────────────────────────────────────────────
  if(screen===1){
    const goalSet = goal&&(goal!=='Other'||goalOther.trim());
    return(
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?15:12}}>
        <ProgressBar current={1}/>
        <div>
          <div style={cs.label}>Define Your Brand</div>
          <h3 style={{fontFamily:T.serif,fontSize:isDesktop?24:20,fontWeight:600,color:T2.text,lineHeight:1.25,margin:"0 0 4px"}}>Where do you want your career to take you?</h3>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:isDesktop?7:6}}>
          {GOAL_CARDS.map(card=>{
            const sel=goal===card.label||(card.isOther&&goal==='Other');
            return(
              <button key={card.label} onClick={()=>setGoal(card.isOther?'Other':card.label)}
                style={{display:"flex",alignItems:"center",gap:12,padding:isDesktop?"13px 15px":"10px 12px",borderRadius:6,border:`0.5px solid ${sel?T.gold:T2.border}`,background:sel?"rgba(200,164,106,0.07)":"transparent",cursor:"pointer",textAlign:"left",transition:"all 0.18s"}}>
                <div style={{width:isDesktop?36:30,height:isDesktop?36:30,borderRadius:8,background:sel?"rgba(200,164,106,0.14)":T2.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:isDesktop?16:14,transition:"background 0.18s"}}>{card.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:2}}>{card.label}</div>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?11:10,color:T2.text3,lineHeight:1.4}}>{card.sub}</div>
                </div>
                <div style={{width:15,height:15,borderRadius:"50%",border:`1.5px solid ${sel?T.gold:T2.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                  {sel&&<div style={{width:7,height:7,borderRadius:"50%",background:T.gold}}/>}
                </div>
              </button>
            );
          })}
        </div>

        {goal==='Other'&&(
          <input value={goalOther} onChange={e=>setGoalOther(e.target.value)} placeholder="What are you trying to achieve?" className="au-input"
            style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box",animation:"fadeUp 0.3s ease both"}}/>
        )}

        {goalSet&&(
          <div style={{animation:"fadeUp 0.3s ease both",display:"flex",flexDirection:"column",gap:13}}>
            <div>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>Why does this matter?</div>
              <textarea value={goalWhy} onChange={e=>setGoalWhy(e.target.value)} placeholder="Describe the future you're trying to create…" rows={2}
                style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"6px 0",fontFamily:T.serif,fontSize:isDesktop?16:14,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box",fontStyle:"italic"}}/>
            </div>
            <div>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>What would people say about you?</div>
              <textarea value={futureText} onChange={e=>setFutureText(e.target.value)} placeholder="'I'd love people to say I was someone who…'" rows={isDesktop?3:2}
                style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"6px 0",fontFamily:T.serif,fontSize:isDesktop?16:14,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box",fontStyle:"italic"}}/>
            </div>
          </div>
        )}

        <button onClick={()=>{ if(goalSet){ setScreen(2); extractFutureWords(); } }} style={cta(!goalSet)}>Continue →</button>
      </div>
    );
  }

  // ── Screen 2: See Yourself Clearly ──────────────────────────────────────────
  if(screen===2){
    function addChip(w){const c=w.trim().toLowerCase();if(!c||currentChips.includes(c))return;setCurrentChips(p=>[...p,c]);}
    const suggestions=MORE_CURRENT.filter(w=>!currentChips.includes(w));
    return(
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?15:12}}>
        <ProgressBar current={2}/>
        <div>
          <div style={cs.label}>See Yourself Clearly</div>
          <h3 style={{fontFamily:T.serif,fontSize:isDesktop?22:19,fontWeight:600,color:T2.text,lineHeight:1.25,margin:"0 0 3px"}}>How do people see you today?</h3>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,margin:0}}>Remove any that don't fit. Add your own.</p>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {currentChips.map(w=>(
            <div key={w} style={{display:"flex",alignItems:"center",gap:6,padding:isDesktop?"7px 13px":"6px 10px",borderRadius:30,background:"rgba(138,158,132,0.09)",border:"0.5px solid rgba(138,158,132,0.28)",fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,fontWeight:500}}>
              {w}
              <button onClick={()=>setCurrentChips(p=>p.filter(c=>c!==w))} style={{background:"none",border:"none",color:T2.text4,cursor:"pointer",padding:"0 0 0 2px",fontSize:14,lineHeight:1,fontFamily:T.sans}}>×</button>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:5,padding:isDesktop?"5px 11px":"4px 9px",borderRadius:30,border:"0.5px dashed "+T2.border}}>
            <input value={chipInput} onChange={e=>setChipInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();addChip(chipInput);setChipInput('');}}}
              placeholder="Add…" style={{background:"none",border:"none",outline:"none",fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,width:isDesktop?72:60}}/>
            {chipInput.trim()&&<button onClick={()=>{addChip(chipInput);setChipInput('');}} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",padding:0,fontSize:13,fontFamily:T.sans,fontWeight:700}}>+</button>}
          </div>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {suggestions.slice(0,8).map(w=>(
            <button key={w} onClick={()=>addChip(w)} style={{padding:"4px 10px",borderRadius:20,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text4,fontSize:isDesktop?11:10,fontFamily:T.sans,cursor:"pointer",transition:"all 0.15s"}}>+ {w}</button>
          ))}
        </div>

        {/* Gap mini-visual — animates in when AI extraction completes */}
        {(futureLoading||futureWords.length>0)&&(
          <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:13,animation:"fadeUp 0.4s ease both"}}>
            {futureLoading?(
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <img src="/logo-mark.png" alt="" style={{width:20,height:20,objectFit:"cover",filter:"brightness(0.55) sepia(0.4)",animation:"breathe 2s ease infinite"}}/>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,fontStyle:"italic"}}>Finding your themes…</span>
              </div>
            ):(
              <div style={{animation:"fadeUp 0.45s ease both"}}>
                <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:9}}>Your brand journey</div>
                <div style={{display:"flex",alignItems:"center",gap:isDesktop?12:9,flexWrap:"wrap"}}>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {currentChips.slice(0,3).map(w=><span key={w} style={{padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",fontFamily:T.sans,fontSize:11,color:T2.text4}}>{w}</span>)}
                  </div>
                  <span style={{fontFamily:T.serif,fontSize:16,color:T.gold,fontWeight:300}}>→</span>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {futureWords.map(w=><span key={w} style={{padding:"4px 10px",borderRadius:20,background:"rgba(200,164,106,0.13)",border:`0.5px solid ${T.gold}`,fontFamily:T.sans,fontSize:11,color:T.gold,fontWeight:600}}>{w}</span>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <button onClick={()=>futureWords.length>0&&setScreen(3)} style={cta(futureWords.length===0)}>
          {futureLoading ? "Finding your themes…" : "Continue →"}
        </button>
        <button onClick={()=>setScreen(1)} style={back}>← Back</button>
      </div>
    );
  }

  // ── Screen 3: Your Brand ─────────────────────────────────────────────────────
  if(screen===3){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?15:12}}>
        <ProgressBar current={3}/>

        <div style={{background:T.ink||"#2C2416",borderRadius:6,padding:isDesktop?"24px 22px":"17px 14px",animation:"fadeUp 0.5s ease both"}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(200,164,106,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Your Brand</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
            {currentChips.slice(0,5).map(w=><span key={w} style={{padding:"4px 11px",borderRadius:20,background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.09)",fontFamily:T.sans,fontSize:isDesktop?12:11,color:"rgba(245,239,230,0.38)"}}>{w}</span>)}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{flex:1,height:"0.5px",background:"rgba(255,255,255,0.06)"}}/>
            <span style={{fontFamily:T.serif,fontSize:16,color:T.gold,fontWeight:300}}>↓</span>
            <div style={{flex:1,height:"0.5px",background:"rgba(255,255,255,0.06)"}}/>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {futureWords.map(w=><span key={w} style={{padding:"4px 11px",borderRadius:20,background:"rgba(200,164,106,0.14)",border:`0.5px solid ${T.gold}`,fontFamily:T.sans,fontSize:isDesktop?12:11,color:T.gold,fontWeight:600}}>{w}</span>)}
          </div>
        </div>

        <div style={{...cs.card,animation:"fadeUp 0.5s 0.1s ease both"}}>
          <div style={cs.label}>Your Brand Statement</div>
          {stmtLoading?(
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}>
              <img src="/logo-mark.png" alt="" style={{width:22,height:22,objectFit:"cover",filter:"brightness(0.55) sepia(0.4)",animation:"breathe 2s ease infinite"}}/>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,fontStyle:"italic"}}>Writing your brand statement…</span>
            </div>
          ):(
            <>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,lineHeight:1.6,margin:"0 0 12px",fontStyle:"italic"}}>"{brandStmt}"</p>
              <button onClick={()=>{navigator.clipboard?.writeText(brandStmt).then(()=>{setStmtSaved(true);setTimeout(()=>setStmtSaved(false),2500);});}}
                style={{padding:"7px 16px",borderRadius:4,border:"none",background:stmtSaved?"rgba(138,158,132,0.14)":T.ink,color:stmtSaved?"#7A9E84":(T2.bg||"#F7F3EC"),fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s"}}>
                {stmtSaved?"Saved ✓":"Save"}
              </button>
            </>
          )}
        </div>

        <button onClick={()=>setOppOpen(o=>!o)}
          style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:T.sans,fontSize:isDesktop?12:11,color:T.gold,fontWeight:600,textAlign:"left"}}>
          <span style={{transform:oppOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block",fontSize:10}}>▸</span>
          <span>Your opportunity</span>
        </button>
        {oppOpen&&(
          <div style={{paddingLeft:14,animation:"fadeUp 0.3s ease both"}}>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.65,margin:"0 0 9px"}}>There's a gap between today's reputation and the one you're building — and that gap is your opportunity.</p>
            {["Communicate with greater authority","Tell stronger stories","Build visible expertise","Create a professional identity that matches your ambition"].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:5}}>
                <span style={{color:T.gold,fontSize:11,flexShrink:0,marginTop:2}}>✓</span>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text4,lineHeight:1.5}}>{item}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={()=>setScreen(2)} style={back}>← Back</button>
      </div>
    );
  }

  return null;
}


// ─── D11 Simulation Widget ────────────────────────────────────────────────────
export function D11SimWidget({T, T2, isDesktop, brandWords=[]}) {

  const INDUSTRIES = ["Technology","Finance","Healthcare","Marketing & Communications","Consulting","Legal","Education","Engineering","Media & Creative","Retail","Government & Public Sector","Other"];
  const DREAM_SUGGESTIONS = ["Microsoft","Apple","Google","Amazon","McKinsey","Deloitte","Shell","Meta","Goldman Sachs","Netflix","Startup"];
  const COMMITMENTS = [
    "I'll speak up before I'm ready.",
    "I'll be intentional about how I show up.",
    "I'll communicate with clarity.",
    "I'll build my reputation one interaction at a time.",
    "I'll stop hoping people notice my value and start showing it.",
  ];
  const AI_STEPS = [
    {msg:"Reading your profile...",          label:"Clarity",         pct:82},
    {msg:"Checking leadership signals...",   label:"Leadership",      pct:58},
    {msg:"Measuring your authority...",      label:"Authority",       pct:74},
    {msg:"Assessing credibility...",         label:"Credibility",     pct:88},
    {msg:"I found something interesting...", label:"Differentiation", pct:44},
    {msg:"Building your playbook...",        label:"Future Alignment",pct:null},
  ];

  const [step,           setStep]          = useState(1);
  const [careerGoal,     setCareerGoal]    = useState('');
  const [industry,       setIndustry]      = useState('');
  const [dreamCos,       setDreamCos]      = useState([]);
  const [dreamInput,     setDreamInput]    = useState('');
  const [headline,       setHeadline]      = useState('');
  const [about,          setAbout]         = useState('');
  const [aboutCollapsed, setAboutCollapsed]= useState(false);
  const [cv,             setCv]            = useState('');
  const [loading,        setLoading]       = useState(false);
  const [aiStepIdx,      setAiStepIdx]     = useState(-1);
  const [result,         setResult]        = useState(null);
  const [apiError,       setApiError]      = useState(false);
  const [copied,         setCopied]        = useState(null);
  const [aboutRwOpen,    setAboutRwOpen]   = useState(false);
  const [analysisOpen,   setAnalysisOpen]  = useState(false);
  const [openSection,    setOpenSection]   = useState('brand');
  const [commitment,     setCommitment]    = useState('');
  const [committed,      setCommitted]     = useState(false);
  const intervalRef = useRef(null);

  const futureWords = (brandWords||[]).filter(w=>w&&w.trim().length>0);

  const cs = {
    card:  {background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"20px":"14px"},
    label: {fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
  };
  function cta(disabled){return{width:"100%",padding:"14px",borderRadius:4,border:"none",background:disabled?"rgba(44,36,22,0.15)":T.ink,color:disabled?"rgba(44,36,22,0.3)":(T2.bg||"#F7F3EC"),fontSize:isDesktop?14:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"};}
  const back={background:"none",border:"none",fontFamily:T.sans,fontSize:13,color:T2.text4,cursor:"pointer",padding:"4px 0",textAlign:"left"};

  const STEP_LABELS = ["Goal","Profile","Analysis","Rewrite","Playbook"];
  function StepPills(){
    return(
      <div style={{display:"flex",gap:isDesktop?5:4,marginBottom:16,overflowX:"auto",paddingBottom:2}}>
        {STEP_LABELS.map((l,i)=>{
          const n=i+1,done=n<step,active=n===step;
          return(
            <div key={i} style={{flexShrink:0,padding:isDesktop?"5px 11px":"4px 8px",borderRadius:20,border:`0.5px solid ${active?T.ink:done?"rgba(138,158,132,0.4)":T2.border}`,background:active?(T.ink||"#2C2416"):done?"rgba(138,158,132,0.06)":"transparent",fontFamily:T.sans,fontSize:isDesktop?11:9,fontWeight:active?600:400,color:active?"#F7F3EC":done?"rgba(138,158,132,0.85)":T2.text4,whiteSpace:"nowrap",transition:"all 0.2s"}}>
              {done?"✓ ":""}{l}
            </div>
          );
        })}
      </div>
    );
  }

  function Accordion({id,title,children}){
    const isOpen=openSection===id;
    return(
      <div style={{...cs.card,padding:0,overflow:"hidden"}}>
        <button onClick={()=>setOpenSection(isOpen?'':id)}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:isDesktop?"15px 20px":"12px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
          <span style={{fontFamily:T.sans,fontSize:isDesktop?10:9,fontWeight:700,color:isOpen?T.gold:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",transition:"color 0.2s"}}>{title}</span>
          <span style={{color:T2.text4,fontSize:11,transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.25s",display:"inline-block"}}>↓</span>
        </button>
        {isOpen&&<div style={{padding:isDesktop?"0 20px 18px":"0 16px 14px",animation:"fadeUp 0.3s ease both"}}>{children}</div>}
      </div>
    );
  }

  function addDreamCo(co){const c=co.trim();if(!c||dreamCos.includes(c))return;setDreamCos([...dreamCos,c]);setDreamInput('');}

  async function runAnalysis(){
    setLoading(true); setApiError(false); setResult(null); setAiStepIdx(-1);
    intervalRef.current = setInterval(()=>{
      setAiStepIdx(prev=>prev<AI_STEPS.length-2 ? prev+1 : prev);
    }, 700);
    const w = futureWords.length>0 ? futureWords : ["strategic","trusted","influential"];
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
  "insight": "<one clear sentence summarising the gap — warm and direct>",
  "improvedHeadline": "<powerful LinkedIn headline under 200 chars>",
  "improvedAbout": "<three executive paragraphs in first person, weaving in brand words. Separate with \\n\\n>",
  "missingAchievements": [<4 strings: types of content missing from the profile>],
  "biggestStrength": "<one sentence>",
  "biggestGap": "<one sentence, framed as opportunity>",
  "thisWeek": [<4 strings: specific actionable short phrases>],
  "nextMonth": [<4 strings: strategic themes — short phrases>],
  "stageIntro": "<theatrical 4-sentence introduction as if before they walk on stage two years from now. Start with 'Two years from now, someone stands up to introduce you.' Include 'Known for'. End with 'Please welcome them to the stage.' Second person. Make it feel like goosebumps.>",
  "positioningStatement": "<one sentence: I help [who] by [how] so that [outcome]>",
  "brandPillars": [<3 strings: core brand pillars, 2-4 words each>],
  "tagline": "<personal tagline, 3-6 words, memorable>",
  "coachMessage": "<2-3 sentences — inspirational, personal, references their specific words and goal>"
}
Return ONLY valid JSON. No preamble, no markdown fences.`;

    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:2000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const raw=(data.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      if(!m) throw new Error("no json");
      const parsed=JSON.parse(m[0]);
      clearInterval(intervalRef.current);
      setAiStepIdx(AI_STEPS.length-1);
      setTimeout(()=>{ setResult(parsed); setLoading(false); setStep(3); }, 900);
    }catch(_){
      clearInterval(intervalRef.current);
      setLoading(false); setApiError(true);
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if(loading){
    const msgIdx=Math.min(Math.max(aiStepIdx,0), AI_STEPS.length-1);
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepPills/>
        <div style={{...cs.card,padding:isDesktop?"40px 28px":"30px 18px"}}>
          <div style={{textAlign:"center",marginBottom:26}}>
            <img src="/logo-mark.png" alt="" style={{width:40,height:40,objectFit:"cover",filter:"brightness(0.55) sepia(0.4)",animation:"breathe 2s ease infinite",marginBottom:14}}/>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontStyle:"italic",color:T2.text,margin:0,lineHeight:1.4}}>
              {AI_STEPS[msgIdx].msg}
            </p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {AI_STEPS.map(({label,pct},i)=>{
              const active=i<=aiStepIdx;
              return(
                <div key={i} style={{opacity:active?1:0.18,transition:"opacity 0.5s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontFamily:T.sans,fontSize:12,color:active?T2.text:T2.text4,transition:"color 0.4s"}}>{label}</span>
                    <span style={{fontFamily:T.sans,fontSize:11,color:T.gold,opacity:active&&pct?1:0,transition:"opacity 0.5s 0.4s"}}>{active&&pct?pct+'%':''}</span>
                  </div>
                  <div style={{height:3,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:active&&pct?pct+'%':'0%',background:`linear-gradient(to right,rgba(200,164,106,0.55),${T.gold})`,borderRadius:2,transition:"width 1.0s cubic-bezier(0.25,0.46,0.45,0.94)"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if(apiError) return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <StepPills/>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"44px 24px":"32px 18px"}}>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.65,margin:"0 0 16px"}}>Couldn't connect right now. Try again.</p>
        <button onClick={runAnalysis} style={{...cta(false),width:"auto",padding:"11px 26px",display:"inline-block"}}>Try Again →</button>
      </div>
      <button onClick={()=>{setApiError(false);setStep(2);}} style={back}>← Back</button>
    </div>
  );

  // ── Step 1: Goal ─────────────────────────────────────────────────────────────
  if(step===1) return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <StepPills/>
      <div style={cs.card}>
        <div style={{marginBottom:15}}>
          <div style={cs.label}>Where are you heading?</div>
          <input value={careerGoal} onChange={e=>setCareerGoal(e.target.value)} placeholder="e.g. Head of Product at a Series B startup"
            className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:15}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>Industry</div>
          <select value={industry} onChange={e=>setIndustry(e.target.value)}
            style={{width:"100%",padding:"10px 14px",background:T2.surface,border:"0.5px solid "+T2.border,borderRadius:4,fontFamily:T.sans,fontSize:isDesktop?14:13,color:industry?T2.text:T2.text4,outline:"none",cursor:"pointer",boxSizing:"border-box",appearance:"auto"}}>
            <option value="">Select your industry</option>
            {INDUSTRIES.map(ind=><option key={ind} value={ind} style={{background:"#1a1610"}}>{ind}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>Dream companies <span style={{fontWeight:400,fontSize:10,textTransform:"none"}}>(optional)</span></div>
          {dreamCos.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:9}}>
              {dreamCos.map(co=>(
                <span key={co} style={{padding:"5px 11px",borderRadius:20,background:"rgba(200,164,106,0.1)",border:`0.5px solid ${T.gold}`,fontFamily:T.sans,fontSize:12,color:T.gold,display:"flex",alignItems:"center",gap:5}}>
                  {co}
                  <button onClick={()=>setDreamCos(dreamCos.filter(c=>c!==co))} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",padding:0,fontSize:14,lineHeight:1}}>×</button>
                </span>
              ))}
            </div>
          )}
          <input value={dreamInput} onChange={e=>setDreamInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();addDreamCo(dreamInput);}}}
            placeholder="Type company, press Enter" className="au-input" style={{width:"100%",padding:"9px 14px",fontSize:isDesktop?13:12,boxSizing:"border-box",marginBottom:7}}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {DREAM_SUGGESTIONS.filter(co=>!dreamCos.includes(co)).map(co=>(
              <button key={co} onClick={()=>addDreamCo(co)} style={{padding:"4px 10px",borderRadius:20,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:11,fontFamily:T.sans,cursor:"pointer",transition:"all 0.15s"}}>+{co}</button>
            ))}
          </div>
        </div>
      </div>

      {futureWords.length>0&&(
        <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
          <div style={cs.label}>Brand Intent</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?21:18,fontWeight:600,color:T2.text,lineHeight:1.2,margin:0,letterSpacing:"-0.2px"}}>
            {futureWords.map((w,i,arr)=>(
              <span key={i}>{w}{i<arr.length-1&&<span style={{color:T.gold,fontWeight:300,padding:"0 8px"}}>·</span>}</span>
            ))}
          </p>
        </div>
      )}

      <button onClick={()=>careerGoal.trim()&&setStep(2)} style={cta(!careerGoal.trim())}>Continue →</button>
    </div>
  );

  // ── Step 2: Profile ───────────────────────────────────────────────────────────
  if(step===2){
    const aboutWords=about.trim().split(/\s+/).filter(Boolean).length;
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepPills/>
        <div style={cs.card}>
          <div style={cs.label}>LinkedIn Profile</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text4,lineHeight:1.5,margin:"0 0 16px"}}>The more you share, the sharper the analysis.</p>

          <div style={{marginBottom:16}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>LinkedIn Headline</div>
            <input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="e.g. Marketing Manager | Helping brands find their voice"
              className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
            <div style={{fontFamily:T.sans,fontSize:11,color:headline.length>220?"rgba(180,80,60,0.8)":T2.text4,marginTop:4}}>{headline.length}/220</div>
          </div>

          <div style={{marginBottom:16}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>About Section</div>
            {about.trim()&&aboutCollapsed?(
              <div onClick={()=>setAboutCollapsed(false)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",cursor:"pointer",borderBottom:"0.5px solid "+T2.divider}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:"rgba(138,158,132,0.85)",fontSize:14}}>✓</span>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text}}>About added</span>
                </div>
                <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>{aboutWords} words · edit</span>
              </div>
            ):(
              <textarea value={about} onChange={e=>setAbout(e.target.value)} onBlur={()=>{if(about.trim().length>30)setAboutCollapsed(true);}}
                placeholder="Paste your LinkedIn About section here…" rows={isDesktop?5:4}
                style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"7px 0",fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,resize:"none",outline:"none",lineHeight:1.65,boxSizing:"border-box"}}/>
            )}
          </div>

          <div>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>CV / Extra context <span style={{fontWeight:400,textTransform:"none",fontSize:10}}>(optional)</span></div>
            <textarea value={cv} onChange={e=>setCv(e.target.value)} placeholder="Key achievements or context…" rows={isDesktop?3:2}
              style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"7px 0",fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
          </div>
          <p style={{fontFamily:T.sans,fontSize:11,color:T2.text4,margin:"12px 0 0"}}>Not stored. Used only to generate your analysis.</p>
        </div>

        <button onClick={()=>headline.trim()&&runAnalysis()} style={cta(!headline.trim())}>Run the Analysis →</button>
        <button onClick={()=>setStep(1)} style={back}>← Back</button>
      </div>
    );
  }

  // ── Step 3: Analysis ──────────────────────────────────────────────────────────
  if(step===3&&result){
    const score=result.score||0;
    const w=futureWords.length>0 ? futureWords : ["strategic","trusted","influential"];
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <StepPills/>

        <div style={{background:T.ink||"#2C2416",borderRadius:4,padding:isDesktop?"26px 22px":"18px 16px"}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(200,164,106,0.6)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:9}}>Brand Alignment</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?68:52,fontWeight:700,color:"#F5EFE6",lineHeight:0.9,letterSpacing:"-3px",marginBottom:11}}>
            {score}<span style={{fontSize:isDesktop?24:19,fontWeight:300,color:"rgba(245,239,230,0.32)",letterSpacing:0}}>%</span>
          </div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.6)",lineHeight:1.6,margin:0}}>{result.insight||""}</p>
        </div>

        <div style={{display:"flex",gap:9,flexDirection:isDesktop?"row":"column"}}>
          <div style={{...cs.card,flex:1}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:9}}>Current Brand</div>
            {(result.currentSignals||[]).map((s,i)=><div key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,marginBottom:5,lineHeight:1.4}}>• {s}</div>)}
          </div>
          <div style={{...cs.card,flex:1,border:`0.5px solid ${T.gold}`,background:"rgba(200,164,106,0.06)"}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:9}}>Target Brand</div>
            {w.map((s,i)=><div key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T.gold,fontWeight:600,marginBottom:5,lineHeight:1.4}}>• {s}</div>)}
          </div>
        </div>

        <button onClick={()=>setAnalysisOpen(o=>!o)}
          style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",padding:"3px 0",fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text4,textAlign:"left"}}>
          <span style={{transform:analysisOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block",fontSize:10}}>▸</span>
          <span>View full analysis</span>
        </button>
        {analysisOpen&&(
          <div style={{animation:"fadeUp 0.3s ease both",display:"flex",flexDirection:"column",gap:9}}>
            <div style={cs.card}>
              <div style={cs.label}>What's missing</div>
              {(result.missingSignals||[]).map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
                  <span style={{color:"rgba(200,164,106,0.5)",fontSize:11,flexShrink:0,marginTop:2}}>○</span>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.45}}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:9,flexDirection:isDesktop?"row":"column"}}>
              <div style={{...cs.card,flex:1}}>
                <div style={cs.label}>Strength</div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.55,margin:0}}>{result.biggestStrength||""}</p>
              </div>
              <div style={{...cs.card,flex:1}}>
                <div style={cs.label}>Gap</div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.55,margin:0}}>{result.biggestGap||""}</p>
              </div>
            </div>
          </div>
        )}

        <button onClick={()=>setStep(4)} style={cta(false)}>See my rewrite →</button>
        <button onClick={()=>{setResult(null);setStep(2);}} style={back}>← Back</button>
      </div>
    );
  }

  // ── Step 4: Rewrite ───────────────────────────────────────────────────────────
  if(step===4&&result){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <StepPills/>

        <div style={cs.card}>
          <div style={cs.label}>Headline</div>
          {headline&&(
            <div style={{padding:"10px 12px",borderRadius:4,background:T2.bg,marginBottom:9}}>
              <div style={{fontFamily:T.sans,fontSize:9,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontWeight:700}}>Before</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.5,margin:0}}>{headline}</p>
            </div>
          )}
          <div style={{padding:"12px 14px",borderRadius:4,background:"rgba(138,158,132,0.06)",border:"0.5px solid rgba(138,158,132,0.2)"}}>
            <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6,fontWeight:700}}>After</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:"0 0 10px"}}>{result.improvedHeadline||""}</p>
            <button onClick={()=>{navigator.clipboard?.writeText(result.improvedHeadline||"").then(()=>{setCopied("hl");setTimeout(()=>setCopied(null),2000);});}}
              style={{padding:"5px 13px",borderRadius:3,border:`0.5px solid ${T.gold}`,background:copied==="hl"?"rgba(138,158,132,0.12)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>
              {copied==="hl"?"Copied ✓":"Copy"}
            </button>
          </div>
        </div>

        <div style={cs.card}>
          <button onClick={()=>setAboutRwOpen(o=>!o)}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",cursor:"pointer",padding:0}}>
            <div style={cs.label}>About Section</div>
            <span style={{color:T2.text4,fontSize:11,transform:aboutRwOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.25s",display:"inline-block",marginBottom:8}}>↓</span>
          </button>
          {aboutRwOpen&&(
            <div style={{animation:"fadeUp 0.3s ease both"}}>
              {about&&(
                <div style={{padding:"10px 12px",borderRadius:4,background:T2.bg,marginBottom:9}}>
                  <div style={{fontFamily:T.sans,fontSize:9,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontWeight:700}}>Before</div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:0,maxHeight:76,overflow:"hidden"}}>{about.slice(0,230)}{about.length>230?"…":""}</p>
                </div>
              )}
              <div style={{padding:"12px 14px",borderRadius:4,background:"rgba(138,158,132,0.06)",border:"0.5px solid rgba(138,158,132,0.2)"}}>
                <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7,fontWeight:700}}>After</div>
                <p style={{fontFamily:T.serif,fontSize:isDesktop?15:13,color:T2.text,lineHeight:1.75,margin:"0 0 11px",whiteSpace:"pre-wrap"}}>{result.improvedAbout||""}</p>
                <button onClick={()=>{navigator.clipboard?.writeText(result.improvedAbout||"").then(()=>{setCopied("ab");setTimeout(()=>setCopied(null),2000);});}}
                  style={{padding:"5px 13px",borderRadius:3,border:`0.5px solid ${T.gold}`,background:copied==="ab"?"rgba(138,158,132,0.12)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>
                  {copied==="ab"?"Copied ✓":"Copy"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
          <div style={cs.label}>Consider Adding</div>
          {(result.missingAchievements||[]).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
              <span style={{color:T.gold,fontSize:12,flexShrink:0,marginTop:1}}>✓</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.45}}>{a}</span>
            </div>
          ))}
        </div>

        <button onClick={()=>setStep(5)} style={cta(false)}>Your Playbook →</button>
        <button onClick={()=>setStep(3)} style={back}>← Back</button>
      </div>
    );
  }

  // ── Step 5: Playbook ──────────────────────────────────────────────────────────
  if(step===5&&result){
    const w=futureWords.length>0 ? futureWords : ["strategic","trusted","influential"];
    return(
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        <StepPills/>

        <Accordion id="brand" title="Your Brand">
          <div style={{background:T.ink||"#2C2416",borderRadius:4,padding:isDesktop?"20px 18px":"15px 14px"}}>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:700,color:"#F5EFE6",letterSpacing:"-0.5px",lineHeight:1,marginBottom:4}}>
              {w.map((word,i,arr)=>(
                <span key={i}>{word}{i<arr.length-1&&<span style={{color:T.gold,fontWeight:300,padding:"0 9px"}}>·</span>}</span>
              ))}
            </div>
            {result.tagline&&<div style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:"italic",color:T.gold,marginBottom:14,marginTop:3}}>"{result.tagline}"</div>}
            {careerGoal&&(
              <div style={{paddingTop:11,borderTop:"0.5px solid rgba(255,255,255,0.06)",marginBottom:10}}>
                <div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:"rgba(200,164,106,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>Goal</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.62)"}}>{careerGoal}</div>
              </div>
            )}
            {result.positioningStatement&&(
              <div style={{paddingTop:11,borderTop:"0.5px solid rgba(255,255,255,0.06)",marginBottom:10}}>
                <div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:"rgba(200,164,106,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>Positioning</div>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.55)",lineHeight:1.55,fontStyle:"italic"}}>{result.positioningStatement}</div>
              </div>
            )}
            {(result.brandPillars||[]).length>0&&(
              <div style={{paddingTop:11,borderTop:"0.5px solid rgba(255,255,255,0.06)"}}>
                <div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:"rgba(200,164,106,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>Pillars</div>
                {(result.brandPillars||[]).map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
                    <span style={{fontFamily:T.sans,fontSize:10,color:T.gold,fontWeight:700,minWidth:14}}>{['①','②','③'][i]}</span>
                    <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:"rgba(245,239,230,0.52)"}}>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Accordion>

        <Accordion id="intro" title="Two Years From Now">
          {result.stageIntro&&(
            <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.8,margin:0}}>"{result.stageIntro}"</p>
          )}
        </Accordion>

        <Accordion id="week" title="This Week">
          {(result.thisWeek||[]).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:8}}>
              <span style={{color:T.gold,fontSize:12,flexShrink:0,marginTop:1}}>→</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{a}</span>
            </div>
          ))}
        </Accordion>

        <Accordion id="month" title="Next Month">
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {(result.nextMonth||[]).map((a,i)=>(
              <span key={i} style={{padding:"6px 12px",borderRadius:20,background:"rgba(138,158,132,0.07)",border:"0.5px solid rgba(138,158,132,0.18)",fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3}}>{a}</span>
            ))}
          </div>
        </Accordion>

        <Accordion id="coach" title="Your Coach Says">
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.7,margin:0}}>"{result.coachMessage||""}"</p>
        </Accordion>

        <div style={{marginTop:4}}>
          {!committed?(
            <div style={cs.card}>
              <div style={cs.label}>Make Your Promise</div>
              <h3 style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 13px"}}>Before we move on, make me one promise.</h3>
              <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
                {COMMITMENTS.map((c,i)=>(
                  <button key={i} onClick={()=>setCommitment(c)}
                    style={{display:"flex",alignItems:"flex-start",gap:11,padding:"12px 13px",borderRadius:4,border:`0.5px solid ${commitment===c?T.gold:T2.border}`,background:commitment===c?"rgba(200,164,106,0.08)":"transparent",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                    <div style={{width:15,height:15,borderRadius:"50%",border:`1.5px solid ${commitment===c?T.gold:T2.border}`,flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                      {commitment===c&&<div style={{width:7,height:7,borderRadius:"50%",background:T.gold}}/>}
                    </div>
                    <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:commitment===c?T2.text:T2.text3,lineHeight:1.5,fontWeight:commitment===c?500:400}}>{c}</span>
                  </button>
                ))}
              </div>
              <button onClick={()=>{ if(!commitment)return; try{localStorage.setItem('amplifyuCommitment',commitment);}catch(_){} setCommitted(true); }} style={cta(!commitment)}>I commit to this →</button>
            </div>
          ):(
            <div style={{...cs.card,background:"rgba(138,158,132,0.05)",border:"0.5px solid rgba(138,158,132,0.28)",animation:"fadeUp 0.4s ease both"}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(138,158,132,0.75)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:9}}>Pinned to your programme</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?18:15,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:"0 0 5px"}}>"{commitment}"</p>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text4,margin:0,lineHeight:1.5}}>This commitment stays with you throughout AmplifyU.</p>
            </div>
          )}
        </div>

        <button onClick={()=>setStep(4)} style={back}>← Back</button>
      </div>
    );
  }

  return null;
}
