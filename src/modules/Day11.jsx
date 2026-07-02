import { useState, useEffect, useRef } from 'react';

// ─── D11 Rehearsal Widget — Build Your Brand ─────────────────────────────────
export function D11PracticeWidget({T, T2, isDesktop, onWordsChange}) {

  const GOALS = [
    "Become a leader","Earn a promotion","Build executive presence",
    "Become known as an expert","Grow my influence","Start my own business",
    "Speak confidently in any room","Attract new career opportunities",
    "Build a personal brand","Other",
  ];

  const CURRENT_WORDS = [
    "calm","creative","helpful","reliable","organised","technical","analytical",
    "friendly","supportive","collaborative","confident","thoughtful","hard-working",
    "empathetic","driven","precise","professional","curious","innovative","strategic",
  ];

  const FUTURE_WORDS = [
    "strategic","executive","visionary","trusted","clear","influential","commercial",
    "decisive","calm","inspiring","credible","fearless","innovative","empathetic",
    "authentic","bold","thought leader","high impact","excellent communicator","confident",
  ];

  const [screen,         setScreen]         = useState(1);
  const [goal,           setGoal]           = useState('');
  const [goalWhy,        setGoalWhy]        = useState('');
  const [currentWords,   setCurrentWords]   = useState([]);
  const [accuracy,       setAccuracy]       = useState('');
  const [futureWords,    setFutureWords]    = useState([]);
  const [brandStatement, setBrandStatement] = useState('');
  const [stmtLoading,    setStmtLoading]    = useState(false);
  const [stmtSaved,      setStmtSaved]      = useState(false);

  useEffect(() => { if(onWordsChange && futureWords.length > 0) onWordsChange(futureWords); }, [futureWords]);

  useEffect(() => {
    if(screen === 4 && !brandStatement && !stmtLoading) generateStatement();
  }, [screen]);

  async function generateStatement() {
    setStmtLoading(true);
    const w = futureWords.map(x=>x.trim());
    const c = currentWords.map(x=>x.trim());
    const prompt = `You are an executive coach writing a personal brand statement for a professional.

Career goal: ${goal}
Why it matters: ${goalWhy || 'not specified'}
How colleagues currently describe them: ${c.join(', ')}
How they want to be known in two years: ${w.join(', ')}

Write a single brand statement sentence (25-35 words) in third person that:
- Captures who they are becoming, not just who they are today
- Naturally weaves in 1-2 of their aspirational words
- Feels personal, powerful and true
- Sounds like what a senior sponsor would say introducing them at a conference

Return ONLY the sentence. No labels, no explanation, no quotes.`;

    const fallback = `A ${goal !== 'Other' ? goal.toLowerCase().replace('become ','').replace('build ','') : 'rising professional'} building a reputation for ${w[0]||'leadership'} and ${w[1]||'impact'} — someone who combines ${c[0]||'dedication'} with ${w[2]||'vision'} to create lasting change wherever they lead.`;

    try {
      const res = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:150,messages:[{role:"user",content:prompt}]}),
      });
      const data = await res.json();
      const text = (data.content||[]).map(b=>b.text||'').join('').trim();
      setBrandStatement(text || fallback);
    } catch(_) { setBrandStatement(fallback); }
    setStmtLoading(false);
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

  function WordCloud({words, selected, onToggle, max=3}) {
    return (
      <div style={{display:"flex",flexWrap:"wrap",gap:isDesktop?8:6,marginTop:14}}>
        {words.map(w => {
          const sel = selected.includes(w);
          const full = selected.length >= max && !sel;
          return (
            <button key={w} onClick={()=>!full && onToggle(w)}
              style={{padding:isDesktop?"8px 16px":"7px 12px",borderRadius:20,border:`0.5px solid ${sel?T.gold:T2.border}`,background:sel?"rgba(200,164,106,0.12)":"transparent",color:sel?T.gold:full?T2.text4:T2.text3,fontSize:isDesktop?13:12,fontFamily:T.sans,cursor:full?"default":"pointer",fontWeight:sel?600:400,transition:"all 0.15s",opacity:full?0.4:1}}>
              {w}
            </button>
          );
        })}
      </div>
    );
  }

  function SelectedChips({words}) {
    if(!words.length) return null;
    return (
      <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"14px 0 0"}}>
        {words.map(w=>(
          <span key={w} style={{padding:"5px 14px",borderRadius:20,background:"rgba(200,164,106,0.1)",border:`0.5px solid ${T.gold}`,fontFamily:T.sans,fontSize:isDesktop?13:12,color:T.gold,fontWeight:600}}>{w}</span>
        ))}
      </div>
    );
  }

  // ── Screen 1: Destination ──────────────────────────────────────────────────
  if(screen===1) return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <ProgressBar current={1}/>
      <div>
        <div style={cs.label}>Your Destination</div>
        <h3 style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:600,color:T2.text,lineHeight:1.2,margin:"0 0 6px"}}>Where do you want your career to take you?</h3>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:"0 0 18px",lineHeight:1.55}}>Choose the outcome that matters most right now.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {GOALS.map(g => (
            <button key={g} onClick={()=>setGoal(g)}
              style={{display:"flex",alignItems:"center",gap:12,padding:isDesktop?"13px 16px":"11px 14px",borderRadius:4,border:`0.5px solid ${goal===g?T.gold:T2.border}`,background:goal===g?"rgba(200,164,106,0.08)":"transparent",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
              <div style={{width:16,height:16,borderRadius:"50%",border:`1.5px solid ${goal===g?T.gold:T2.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                {goal===g&&<div style={{width:8,height:8,borderRadius:"50%",background:T.gold}}/>}
              </div>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:goal===g?T2.text:T2.text3,fontWeight:goal===g?500:400}}>{g}</span>
            </button>
          ))}
        </div>
      </div>
      {goal && (
        <div style={{animation:"fadeUp 0.4s ease both"}}>
          <div style={cs.label}>Why does this matter?</div>
          <textarea value={goalWhy} onChange={e=>setGoalWhy(e.target.value)}
            placeholder="In one or two sentences, describe the future you're trying to create."
            rows={isDesktop?3:3}
            style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,resize:"none",outline:"none",lineHeight:1.65,boxSizing:"border-box",fontStyle:"italic"}}/>
        </div>
      )}
      <button onClick={()=>goal&&setScreen(2)} style={cta(!goal)}>Continue →</button>
    </div>
  );

  // ── Screen 2: Current Reputation ───────────────────────────────────────────
  if(screen===2) {
    const ready = currentWords.length===3 && accuracy;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <ProgressBar current={2}/>
        <div>
          <div style={cs.label}>Your Current Reputation</div>
          <h3 style={{fontFamily:T.serif,fontSize:isDesktop?25:21,fontWeight:600,color:T2.text,lineHeight:1.2,margin:"0 0 4px"}}>If five colleagues described you today...</h3>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:"0 0 2px",lineHeight:1.55}}>What words would probably come up most often?</p>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text4,margin:0}}>Choose three.</p>
          <SelectedChips words={currentWords}/>
          <WordCloud
            words={CURRENT_WORDS}
            selected={currentWords}
            onToggle={w=>{ if(currentWords.includes(w)) setCurrentWords(currentWords.filter(c=>c!==w)); else if(currentWords.length<3) setCurrentWords([...currentWords,w]); }}
            max={3}/>
        </div>
        {currentWords.length===3 && (
          <div style={{animation:"fadeUp 0.4s ease both"}}>
            <div style={cs.label}>Do these feel accurate?</div>
            {["Completely","Mostly","Not really"].map(opt=>(
              <button key={opt} onClick={()=>setAccuracy(opt)}
                style={{display:"flex",alignItems:"center",gap:12,padding:isDesktop?"11px 14px":"10px 13px",borderRadius:4,border:`0.5px solid ${accuracy===opt?T.gold:T2.border}`,background:accuracy===opt?"rgba(200,164,106,0.08)":"transparent",cursor:"pointer",width:"100%",marginBottom:8,textAlign:"left",transition:"all 0.15s",boxSizing:"border-box"}}>
                <div style={{width:16,height:16,borderRadius:"50%",border:`1.5px solid ${accuracy===opt?T.gold:T2.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {accuracy===opt&&<div style={{width:8,height:8,borderRadius:"50%",background:T.gold}}/>}
                </div>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:accuracy===opt?T2.text:T2.text3,fontWeight:accuracy===opt?500:400}}>{opt}</span>
              </button>
            ))}
          </div>
        )}
        <button onClick={()=>ready&&setScreen(3)} style={cta(!ready)}>Continue →</button>
        <button onClick={()=>setScreen(1)} style={back}>← Back</button>
      </div>
    );
  }

  // ── Screen 3: Future Reputation ────────────────────────────────────────────
  if(screen===3) {
    const ready = futureWords.length===3;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <ProgressBar current={3}/>
        <div>
          <div style={cs.label}>Your Future Reputation</div>
          <h3 style={{fontFamily:T.serif,fontSize:isDesktop?25:21,fontWeight:600,color:T2.text,lineHeight:1.2,margin:"0 0 8px"}}>Fast forward two years.</h3>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:"0 0 2px",lineHeight:1.6}}>You've achieved your goal. Someone introduces you before you walk onto a stage.</p>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:0,lineHeight:1.6}}>What three words do you hope they use?</p>
          <SelectedChips words={futureWords}/>
          <WordCloud
            words={FUTURE_WORDS}
            selected={futureWords}
            onToggle={w=>{ if(futureWords.includes(w)) setFutureWords(futureWords.filter(f=>f!==w)); else if(futureWords.length<3) setFutureWords([...futureWords,w]); }}
            max={3}/>
        </div>
        <button onClick={()=>ready&&setScreen(4)} style={cta(!ready)}>Continue →</button>
        <button onClick={()=>setScreen(2)} style={back}>← Back</button>
      </div>
    );
  }

  // ── Screen 4: Brand Gap ────────────────────────────────────────────────────
  if(screen===4) {
    const gapText = accuracy==="Not really"
      ? "There's already a clear gap between how you're seen today and how you want to be known. That's exactly what this programme is designed to close — step by step."
      : accuracy==="Mostly"
      ? "You're partway there. The words people use are close — but there's still a gap between today's reputation and the one you're building. Let's close it."
      : "You're already trusted. The foundation is solid. Now it's time to become remembered — and that takes intentional design.";

    return (
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <ProgressBar current={4}/>
        <div style={cs.label}>Your Brand Snapshot</div>

        {/* Gap visual */}
        <div style={{background:T.ink||"#2C2416",borderRadius:4,padding:isDesktop?"28px 24px":"20px 16px",animation:"fadeUp 0.5s ease both"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(200,164,106,0.55)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Today people probably see you as</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
            {currentWords.map(w=>(
              <span key={w} style={{padding:"6px 16px",borderRadius:20,background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.14)",fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.55)",fontWeight:500}}>{w}</span>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
            <div style={{flex:1,height:"0.5px",background:"rgba(255,255,255,0.08)"}}/>
            <span style={{fontFamily:T.serif,fontSize:22,color:T.gold,fontWeight:300,lineHeight:1}}>↓</span>
            <div style={{flex:1,height:"0.5px",background:"rgba(255,255,255,0.08)"}}/>
          </div>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>You want to become known as</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {futureWords.map(w=>(
              <span key={w} style={{padding:"6px 16px",borderRadius:20,background:"rgba(200,164,106,0.15)",border:`0.5px solid ${T.gold}`,fontFamily:T.sans,fontSize:isDesktop?14:13,color:T.gold,fontWeight:600}}>{w}</span>
            ))}
          </div>
        </div>

        {/* Opportunity */}
        <div style={{...cs.card,borderLeft:"2px solid "+T.gold,animation:"fadeUp 0.5s 0.1s ease both"}}>
          <div style={cs.label}>Your Biggest Opportunity</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,margin:"0 0 16px"}}>{gapText}</p>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 10px"}}>Over the next programme we'll help you:</p>
          {["communicate with greater authority","tell stronger stories","build visible expertise","create a professional identity that matches your ambition"].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
              <span style={{color:T.gold,fontFamily:T.sans,fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{item}</span>
            </div>
          ))}
        </div>

        {/* Brand Statement */}
        <div style={{...cs.card,animation:"fadeUp 0.5s 0.2s ease both"}}>
          <div style={cs.label}>Your Brand Statement</div>
          {stmtLoading ? (
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0"}}>
              <img src="/logo-mark.png" alt="" style={{width:28,height:28,objectFit:"cover",filter:"brightness(0.55) sepia(0.4)",animation:"breathe 2s ease infinite"}}/>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,fontStyle:"italic"}}>Writing your brand statement…</span>
            </div>
          ) : (
            <>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.55,margin:"0 0 18px",fontStyle:"italic"}}>"{brandStatement}"</p>
              <button onClick={()=>{ navigator.clipboard?.writeText(brandStatement).then(()=>{ setStmtSaved(true); setTimeout(()=>setStmtSaved(false),2500); }); }}
                style={{padding:"10px 22px",borderRadius:4,border:"none",background:stmtSaved?"rgba(138,158,132,0.15)":T.ink,color:stmtSaved?"#7A9E84":(T2.bg||"#F7F3EC"),fontSize:isDesktop?13:12,fontWeight:600,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s"}}>
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

  const CHECK_ITEMS = ["clarity","positioning","leadership signals","credibility","differentiation","future alignment"];

  const COMMITMENTS = [
    "I'll speak up before I'm ready.",
    "I'll be intentional about how I show up.",
    "I'll communicate with clarity.",
    "I'll build my reputation one interaction at a time.",
    "I'll stop hoping people notice my value and start showing it.",
  ];

  const [step,          setStep]          = useState(1);
  const [careerGoal,    setCareerGoal]    = useState('');
  const [industry,      setIndustry]      = useState('');
  const [dreamCos,      setDreamCos]      = useState([]);
  const [dreamInput,    setDreamInput]    = useState('');
  const [headline,      setHeadline]      = useState('');
  const [about,         setAbout]         = useState('');
  const [cv,            setCv]            = useState('');
  const [loading,       setLoading]       = useState(false);
  const [checkStage,    setCheckStage]    = useState(0);
  const [result,        setResult]        = useState(null);
  const [apiError,      setApiError]      = useState(false);
  const [copied,        setCopied]        = useState(null);
  const [commitment,    setCommitment]    = useState('');
  const [committed,     setCommitted]     = useState(false);
  const intervalRef = useRef(null);

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
    setCheckStage(0);

    intervalRef.current = setInterval(() => {
      setCheckStage(prev => {
        if(prev >= CHECK_ITEMS.length - 1) { clearInterval(intervalRef.current); return prev; }
        return prev + 1;
      });
    }, 650);

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
  "currentSignals": [<3-4 strings: words or short phrases that the profile currently communicates>],
  "missingSignals": [<4-5 strings: specific qualities absent from the profile>],
  "insight": "<3-4 sentences — warm, expert, direct — explaining the gap between where they are and where they want to be. Start with something positive. No bullet points.>",
  "improvedHeadline": "<powerful LinkedIn headline under 200 chars signalling their brand words and career goal>",
  "improvedAbout": "<three concise executive paragraphs — confident, first-person, weaving in brand words. Separate paragraphs with \\n\\n>",
  "missingAchievements": [<5-6 strings: types of content missing from their profile that would strengthen it>],
  "biggestStrength": "<one sentence identifying their strongest existing brand asset>",
  "biggestGap": "<one sentence identifying the clearest gap — framed as opportunity>",
  "thisWeek": [<5 strings: specific, actionable items for this week — short phrases>],
  "nextMonth": [<5 strings: strategic themes for the next month — short phrases>],
  "coachMessage": "<3-4 sentence closing message — inspirational, personal, references their specific words and goal>"
}

Return ONLY valid JSON. No preamble, no markdown fences.`;

    try {
      const res = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1800,messages:[{role:"user",content:prompt}]}),
      });
      const data = await res.json();
      const raw = (data.content||[]).map(b=>b.text||'').join('').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      if(!m) throw new Error("no json");
      const parsed = JSON.parse(m[0]);
      clearInterval(intervalRef.current);
      setCheckStage(CHECK_ITEMS.length - 1);
      setResult(parsed);
      setLoading(false);
      setStep(3);
    } catch(_) {
      clearInterval(intervalRef.current);
      setLoading(false);
      setApiError(true);
    }
  }

  // Loading
  if(loading) return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <StepPills/>
      <div style={{...cs.card,padding:isDesktop?"52px 32px":"40px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:28}}>
        <img src="/logo-mark.png" alt="" style={{width:52,height:52,objectFit:"cover",filter:"brightness(0.55) sepia(0.4)",animation:"breathe 2s ease infinite"}}/>
        <div style={{width:"100%",maxWidth:300}}>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T2.text,margin:"0 0 28px",textAlign:"center",lineHeight:1.3}}>Analysing your brand signal…</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {CHECK_ITEMS.map((item,i)=>{
              const done = i <= checkStage;
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,opacity:done?1:0.28,transition:"opacity 0.5s ease"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",border:`1.5px solid ${done?"rgba(138,158,132,0.75)":T2.border}`,background:done?"rgba(138,158,132,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.4s"}}>
                    {done&&<span style={{color:"#7A9E84",fontSize:11,fontWeight:700}}>✓</span>}
                  </div>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:done?T2.text:T2.text4,fontWeight:done?500:400,textTransform:"capitalize",transition:"color 0.4s"}}>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Error
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
  if(step===2) return (
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
          <textarea value={about} onChange={e=>setAbout(e.target.value)}
            placeholder="Paste your LinkedIn About section here…"
            rows={isDesktop?7:5}
            style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.65,boxSizing:"border-box"}}/>
          {about.trim() && <div style={{fontFamily:T.sans,fontSize:11,color:T2.text4,marginTop:5}}>{about.trim().split(/\s+/).filter(Boolean).length} words</div>}
        </div>
        <div>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>
            CV or additional context <span style={{fontWeight:400,textTransform:"none",fontSize:10}}>(optional)</span>
          </div>
          <textarea value={cv} onChange={e=>setCv(e.target.value)}
            placeholder="Paste your CV profile statement, key achievements, or any context that would help your coach understand your background…"
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

  // ── Step 3: Brand Mirror ───────────────────────────────────────────────────
  if(step===3 && result) {
    const score = result.score || 0;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepPills/>
        {/* Score card */}
        <div style={{background:T.ink||"#2C2416",borderRadius:4,padding:isDesktop?"32px 28px":"24px 18px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(200,164,106,0.6)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Brand Alignment</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?72:56,fontWeight:700,color:"#F5EFE6",lineHeight:0.9,letterSpacing:"-3px",marginBottom:14}}>
            {score}<span style={{fontSize:isDesktop?28:22,fontWeight:300,color:"rgba(245,239,230,0.38)",letterSpacing:0}}>%</span>
          </div>
          {careerGoal && <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:"rgba(200,164,106,0.6)",fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Aiming for: {careerGoal}</p>}
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.65)",lineHeight:1.65,margin:0}}>{result.insight||""}</p>
        </div>
        {/* Current signals */}
        <div style={cs.card}>
          <div style={cs.label}>Your profile currently communicates</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {(result.currentSignals||[]).map((s,i)=>(
              <span key={i} style={{padding:"7px 16px",borderRadius:20,background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.2)",fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,fontWeight:500}}>{s}</span>
            ))}
          </div>
        </div>
        {/* Missing signals */}
        <div style={cs.card}>
          <div style={cs.label}>Missing signals</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {(result.missingSignals||[]).map((s,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontFamily:T.sans,fontSize:12,color:"rgba(200,164,106,0.55)",flexShrink:0,marginTop:2}}>○</span>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{s}</span>
              </div>
            ))}
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
                <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.65,margin:0,maxHeight:100,overflow:"hidden"}}>{about.slice(0,280)}{about.length>280?"…":""}</p>
              </div>
              <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><span style={{fontFamily:T.serif,fontSize:20,color:T.gold,fontWeight:300}}>↓</span></div>
            </>
          )}
          <div style={{padding:"14px 16px",borderRadius:4,background:"rgba(138,158,132,0.06)",border:"0.5px solid rgba(138,158,132,0.2)"}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>AI Rewrite</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,color:T2.text,lineHeight:1.75,margin:"0 0 14px",whiteSpace:"pre-wrap"}}>{result.improvedAbout||""}</p>
            <button onClick={()=>{ navigator.clipboard?.writeText(result.improvedAbout||"").then(()=>{ setCopied("ab"); setTimeout(()=>setCopied(null),2000); }); }}
              style={{padding:"6px 14px",borderRadius:3,border:`0.5px solid ${T.gold}`,background:copied==="ab"?"rgba(138,158,132,0.12)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>
              {copied==="ab"?"Copied ✓":"Copy"}
            </button>
          </div>
        </div>
        {/* Missing achievements */}
        <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
          <div style={cs.label}>Consider Adding</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {(result.missingAchievements||["measurable outcomes","leadership examples","strategic decisions","business impact","speaking engagements"]).map((a,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{color:T.gold,fontFamily:T.sans,fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
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

  // ── Step 5: Personal Brand Playbook ───────────────────────────────────────
  if(step===5 && result) {
    const w = futureWords.length>0 ? futureWords : ["strategic","trusted","influential"];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepPills/>
        {/* Brand header */}
        <div style={{background:T.ink||"#2C2416",borderRadius:4,padding:isDesktop?"32px 28px":"24px 18px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(200,164,106,0.55)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:16}}>Your Personal Brand Playbook</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?28:24,fontWeight:600,color:"#F5EFE6",lineHeight:1.05,margin:"0 0 10px",letterSpacing:"-0.5px"}}>
            {w.map((word,i,arr)=>(
              <span key={i}>{word}{i<arr.length-1&&<span style={{color:T.gold,fontWeight:300,padding:"0 10px"}}>·</span>}</span>
            ))}
          </p>
          {careerGoal && <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.48)",margin:0}}>Goal: {careerGoal}</p>}
        </div>
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
                <span style={{color:T.gold,fontFamily:T.sans,fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
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
          <div style={cs.label}>Final Coach Message</div>
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
