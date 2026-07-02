import { useState, useEffect } from 'react';
import { T } from '../theme.js';

export function D11PracticeWidget({T, T2, isDesktop, onWordsChange}) {
  const SIGNAL_AREAS = ["Wardrobe","LinkedIn & bio","Voice & pace","Posture & presence","Storytelling","Energy","Online presence","Communication style"];
  const STORY_TYPES = [
    {label:"Origin Story",   desc:"Where you came from and what shaped your values.",        prompt:"Start with where you were before. What happened, and what did it make you believe?"},
    {label:"Turning Point",  desc:"A moment that changed your direction or thinking.",        prompt:"Describe the moment. What shifted — and what did you do differently after?"},
    {label:"Failure Story",  desc:"A challenge you faced and what you learned.",             prompt:"What went wrong? Be honest about your part — then tell us what it taught you."},
    {label:"Values Story",   desc:"A decision that shows what you stand for.",               prompt:"What was the situation? What did you choose, and what does that say about what you stand for?"},
  ];
  const BRAND_WORDS = ["calm","sharp","trustworthy","creative","premium","warm","fearless","visionary","precise","driven","empathetic","decisive","authentic","bold","considered"];
  const STAGE_NAMES = ["Brand Mirror","Signal Audit","Story Curation","Brand Identity"];

  const [stage,       setStage]       = useState(1);
  const [words,       setWords]       = useState(["","",""]);
  const [auditDone,   setAuditDone]   = useState({});
  const [activeStory, setActiveStory] = useState(null);
  const [storyTexts,  setStoryTexts]  = useState({});
  const [aiResult,    setAiResult]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [validMsg,    setValidMsg]    = useState('');

  useEffect(() => { if(onWordsChange) onWordsChange(words); }, [words]);

  const cs = {
    card:  {background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"16px"},
    label: {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8},
  };
  const ctaStyle = (disabled) => ({
    width:"100%", padding:"15px", borderRadius:4, border:"none",
    background: disabled ? "rgba(44,36,22,0.18)" : T.ink,
    color: disabled ? "rgba(44,36,22,0.35)" : (T2.bg||"#F7F3EC"),
    fontSize: isDesktop?15:14, fontWeight:600, cursor: disabled?"not-allowed":"pointer",
    fontFamily:T.sans, minHeight:50, transition:"all 0.2s",
  });
  const backStyle = {background:"none",border:"none",fontFamily:T.sans,fontSize:13,color:T2.text4,cursor:"pointer",padding:"6px 0",textAlign:"left"};

  // Derived validation
  const wordsValid   = words.every(w=>w.trim().length>0);
  const auditCount   = Object.keys(auditDone).length;
  const auditValid   = auditCount >= 6;
  const activeText   = activeStory !== null ? (storyTexts[activeStory]||"") : "";
  const storyValid   = activeStory !== null && activeText.trim().length >= 80;
  const alignedCount = Object.values(auditDone).filter(v=>v==="aligned").length;
  const filledWords  = words.filter(w=>w.trim());

  function goTo(n) { setStage(n); setValidMsg(''); }

  // ── Step indicator ─────────────────────────────────────────────────────────
  function StepIndicator() {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px"}}>
          {stage} of 4 — {STAGE_NAMES[stage-1]}
        </div>
        <div style={{display:"flex",gap:4}}>
          {[1,2,3,4].map(s=>(
            <div key={s} style={{width:s===stage?20:6,height:4,borderRadius:2,background:s<stage?"rgba(138,158,132,0.55)":s===stage?T.gold:T2.border,transition:"all 0.3s ease"}}/>
          ))}
        </div>
      </div>
    );
  }

  // ── AI Summary ─────────────────────────────────────────────────────────────
  async function generateSummary() {
    setLoading(true);
    const aligned  = SIGNAL_AREAS.filter(a=>auditDone[a]==="aligned");
    const needsWork= SIGNAL_AREAS.filter(a=>auditDone[a]==="needs");
    const storyType= STORY_TYPES[activeStory]?.label||"Story";
    const storyTxt = storyTexts[activeStory]||"";
    const w = words.map(w=>w.trim());

    const prompt =
`You are a personal brand strategist. Based on the following inputs from a professional who has completed a brand identity exercise, write a short, powerful Brand Identity Summary.

Their three brand words: ${w.join(', ')}

Their signal audit:
- Aligned: ${aligned.length ? aligned.join(', ') : 'none selected'}
- Needs work: ${needsWork.length ? needsWork.join(', ') : 'none selected'}

Their story (type: ${storyType}):
${storyTxt}

Write the following — in second person ("You are…"), warm, direct, and empowering tone:

1. BRAND ESSENCE (2 sentences): Capture who they are and what makes them distinctive.
2. YOUR SIGNAL STRENGTHS (1 sentence): Acknowledge what's already working.
3. YOUR GROWTH EDGE (1 sentence): Frame what to develop next as an exciting opportunity, not a gap.
4. YOUR BRAND STORY HOOK (2–3 sentences): A polished, usable version of their story that they could use in an introduction or LinkedIn summary — refined but authentic to their own words.

Keep the whole response under 200 words. No bullet symbols — use the section labels as headers only.`;

    const fallback = `BRAND ESSENCE\nYou are someone who leads with ${w[0]} and brings ${w[1]||'conviction'} to every room you enter. What makes you distinctive is that rare combination of ${w[2]||'intention'} and authentic action.\n\nYOUR SIGNAL STRENGTHS\n${aligned.length>0?`Your ${aligned.slice(0,2).join(' and ')} are already working hard for your brand.`:'Your self-awareness of where you stand is your greatest signal strength.'}\n\nYOUR GROWTH EDGE\n${needsWork.length>0?`Developing your ${needsWork[0]} is your next exciting chapter — it's where your brand becomes unmistakable.`:'Consistency across every signal is your next frontier.'}\n\nYOUR BRAND STORY HOOK\n${storyTxt.trim().slice(0,220)}${storyTxt.length>220?"…":""}`;

    try {
      const res = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:600,messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      const text = (data.content||[]).map(b=>b.text||'').join('').trim();
      setAiResult(text || fallback);
    } catch(_) { setAiResult(fallback); }
    setLoading(false);
  }

  // ── Parse AI sections ──────────────────────────────────────────────────────
  function parseSections(raw) {
    if (!raw) return {};
    const keys = ['BRAND ESSENCE','YOUR SIGNAL STRENGTHS','YOUR GROWTH EDGE','YOUR BRAND STORY HOOK'];
    const out = {};
    keys.forEach((k,i) => {
      const upper = raw.toUpperCase();
      const start = upper.indexOf(k);
      if (start === -1) return;
      const contentStart = start + k.length;
      const nextIdx = i<keys.length-1 ? upper.indexOf(keys[i+1]) : raw.length;
      out[k] = raw.slice(contentStart, nextIdx>-1?nextIdx:raw.length).replace(/^[\s:*#\n]+/,'').trim();
    });
    return out;
  }

  // ── STAGE 1: Brand Mirror ──────────────────────────────────────────────────
  if (stage === 1) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <StepIndicator/>
      <div style={cs.card}>
        <div style={cs.label}>Your Brand in Three Words</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,marginBottom:16}}>What three words do you <em>want</em> people to use to describe you? Be specific. These become your brand intent.</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {words.map((w,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:w.trim()?T.gold:"rgba(138,158,132,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>
                <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:"white"}}>{i+1}</span>
              </div>
              <input value={w} onChange={e=>{const n=[...words];n[i]=e.target.value;setWords(n);}} placeholder={["e.g. trustworthy","e.g. creative","e.g. calm"][i]} className="au-input" style={{flex:1,padding:"10px 14px",fontSize:14}}/>
            </div>
          ))}
        </div>
        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Or choose from these</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {BRAND_WORDS.map((bw,i)=>{
            const sel=words.includes(bw);
            return (
              <button key={i} onClick={()=>{
                if(sel){setWords(words.map(w=>w===bw?"":w));}
                else{const emptyIdx=words.findIndex(w=>!w.trim());const n=[...words];if(emptyIdx>=0){n[emptyIdx]=bw;}else{n[2]=bw;}setWords(n);}
              }} style={{padding:"6px 12px",borderRadius:20,border:`0.5px solid ${sel?T.gold:T2.border}`,background:sel?"rgba(138,158,132,0.15)":"transparent",color:sel?T.gold:T2.text3,fontSize:12,cursor:"pointer",fontFamily:T.sans,minHeight:32,transition:"all 0.15s"}}>{bw}</button>
            );
          })}
        </div>
      </div>
      {wordsValid && (
        <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
          <div style={cs.label}>Now ask yourself</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>Does the way you currently show up — your wardrobe, your LinkedIn, your communication style, your energy — consistently signal <em style={{color:T.gold}}>{filledWords.join(", ")}</em>?</p>
        </div>
      )}
      {validMsg && <p style={{fontFamily:T.sans,fontSize:12,color:"rgba(180,80,60,0.8)",margin:0,textAlign:"center"}}>{validMsg}</p>}
      <button onClick={()=>{wordsValid?goTo(2):setValidMsg('Fill in all three brand words to continue.');}} style={ctaStyle(!wordsValid)}>
        Continue →
      </button>
    </div>
  );

  // ── STAGE 2: Signal Audit ──────────────────────────────────────────────────
  if (stage === 2) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <StepIndicator/>
      <div style={cs.card}>
        <div style={cs.label}>Signal Audit</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,marginBottom:12}}>For each area below, mark whether your current signal is intentional and aligned with the brand you want.</p>
        <div style={{marginBottom:16,padding:"12px 14px",background:"rgba(138,158,132,0.07)",borderRadius:4,borderLeft:"2px solid rgba(138,158,132,0.35)"}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"}}>
            {["People see you","hear you","experience you","remember you","research you"].map((s,i,arr)=>(
              <span key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,fontWeight:600,color:T.gold}}>{s}</span>
                {i<arr.length-1 && <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4,opacity:0.5}}>→</span>}
              </span>
            ))}
          </div>
        </div>
        {SIGNAL_AREAS.map((area,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:i<SIGNAL_AREAS.length-1?"0.5px solid "+T2.divider:"none"}}>
            <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text}}>{area}</span>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>setAuditDone({...auditDone,[area]:"aligned"})} style={{padding:"5px 11px",borderRadius:3,border:`0.5px solid ${auditDone[area]==="aligned"?"rgba(138,158,132,0.8)":T2.border}`,background:auditDone[area]==="aligned"?"rgba(138,158,132,0.15)":"transparent",color:auditDone[area]==="aligned"?"#6A9B6A":T2.text4,fontSize:11,cursor:"pointer",fontFamily:T.sans,minHeight:32,fontWeight:auditDone[area]==="aligned"?600:400,transition:"all 0.15s"}}>✓ Aligned</button>
              <button onClick={()=>setAuditDone({...auditDone,[area]:"needs"})} style={{padding:"5px 11px",borderRadius:3,border:`0.5px solid ${auditDone[area]==="needs"?"rgba(200,150,80,0.8)":T2.border}`,background:auditDone[area]==="needs"?"rgba(200,150,80,0.12)":"transparent",color:auditDone[area]==="needs"?"#C8A46A":T2.text4,fontSize:11,cursor:"pointer",fontFamily:T.sans,minHeight:32,fontWeight:auditDone[area]==="needs"?600:400,transition:"all 0.15s"}}>Needs work</button>
            </div>
          </div>
        ))}
        {auditCount>0 && (
          <div style={{marginTop:16,padding:"12px 14px",background:"rgba(138,158,132,0.06)",borderRadius:3,borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?15:13,fontStyle:"italic",color:T2.text,margin:0,lineHeight:1.6}}>
              {alignedCount} of 8 signals aligned with <em style={{color:T.gold}}>{filledWords.join(", ")}</em>
            </p>
          </div>
        )}
      </div>
      {validMsg && <p style={{fontFamily:T.sans,fontSize:12,color:"rgba(180,80,60,0.8)",margin:0,textAlign:"center"}}>{validMsg}</p>}
      <button onClick={()=>{auditValid?goTo(3):setValidMsg('Rate a few more signals to get your full picture.');}} style={ctaStyle(!auditValid)}>
        Continue →
      </button>
      <button onClick={()=>goTo(1)} style={backStyle}>← Back</button>
    </div>
  );

  // ── STAGE 3: Story Curation ────────────────────────────────────────────────
  if (stage === 3) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <StepIndicator/>
      <div>
        <div style={cs.label}>Your Story Portfolio</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,margin:0}}>Every powerful personal brand is built on a few key stories. Choose one story type and write your version.</p>
      </div>
      {STORY_TYPES.map((st,i)=>{
        const isOpen = activeStory===i;
        const text   = storyTexts[i]||"";
        const chars  = text.trim().length;
        return (
          <div key={i} onClick={()=>setActiveStory(isOpen?null:i)} style={{...cs.card,cursor:"pointer",transition:"border-color 0.2s",borderColor:isOpen?T.gold:T2.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{st.label}</div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,margin:0,lineHeight:1.5}}>{st.desc}</p>
              </div>
              <span style={{fontFamily:T.sans,fontSize:12,color:isOpen?T.gold:T2.text4,marginLeft:12,flexShrink:0,marginTop:2}}>{isOpen?"▴":"▸"}</span>
            </div>
            {isOpen && (
              <div style={{marginTop:14,paddingTop:14,borderTop:"0.5px solid "+T2.divider}} onClick={e=>e.stopPropagation()}>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,fontStyle:"italic",color:T2.text4,lineHeight:1.6,margin:"0 0 10px"}}>{st.prompt}</p>
                <textarea value={text} onChange={e=>setStoryTexts({...storyTexts,[i]:e.target.value})} placeholder="Write your story here…" style={{width:"100%",minHeight:isDesktop?100:80,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                  <span style={{fontFamily:T.sans,fontSize:11,color:chars>=80?T.gold:T2.text4}}>{chars} characters</span>
                  {chars>0&&chars<80&&<span style={{fontFamily:T.sans,fontSize:11,color:"rgba(180,80,60,0.7)",fontStyle:"italic"}}>Add a little more — the best stories have texture.</span>}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {validMsg && <p style={{fontFamily:T.sans,fontSize:12,color:"rgba(180,80,60,0.8)",margin:0,textAlign:"center"}}>{validMsg}</p>}
      <button onClick={()=>{
        if(storyValid){goTo(4);generateSummary();}
        else{setValidMsg(activeStory===null?'Select a story type first.':'Add a little more — aim for at least 80 characters.');}
      }} style={ctaStyle(!storyValid)}>
        Continue →
      </button>
      <button onClick={()=>goTo(2)} style={backStyle}>← Back</button>
    </div>
  );

  // ── STAGE 4: AI Brand Identity Summary ────────────────────────────────────
  if (stage === 4) {
    if (loading) return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepIndicator/>
        <div style={{...cs.card,display:"flex",flexDirection:"column",alignItems:"center",padding:isDesktop?"64px 24px":"48px 20px",gap:24}}>
          <img src="/logo-mark.png" alt="AmplifyU" style={{width:52,height:52,objectFit:"cover",mixBlendMode:"multiply",filter:"brightness(0.55) sepia(0.4)",animation:"breathe 2s ease infinite"}}/>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?20:18,fontWeight:600,color:T2.text,margin:0,textAlign:"center",lineHeight:1.3}}>Building your brand identity…</p>
        </div>
      </div>
    );

    const sections = parseSections(aiResult||"");
    const DISPLAY = [
      {key:"BRAND ESSENCE",           label:"Brand Essence"},
      {key:"YOUR SIGNAL STRENGTHS",   label:"Your Signal Strengths"},
      {key:"YOUR GROWTH EDGE",        label:"Your Growth Edge"},
      {key:"YOUR BRAND STORY HOOK",   label:"Your Brand Story Hook"},
    ];

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepIndicator/>
        <div style={cs.card}>
          <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:24,fontWeight:600,color:T2.text,lineHeight:1.1,margin:"0 0 24px",letterSpacing:"-0.5px"}}>Your Brand Identity</h2>
          {DISPLAY.map(({key,label},i)=>{
            const text = sections[key]||"";
            return text ? (
              <div key={i} style={{marginBottom:i<DISPLAY.length-1?20:0}}>
                <div style={cs.label}>{label}</div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,margin:0}}>{text}</p>
                {i<DISPLAY.length-1 && <div style={{height:"0.5px",background:T2.divider,marginTop:20}}/>}
              </div>
            ) : null;
          })}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>{navigator.clipboard?.writeText(aiResult||"").then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);});}} style={{flex:1,padding:"13px",borderRadius:4,border:"0.5px solid "+T.gold,background:copied?"rgba(138,158,132,0.12)":"transparent",color:T.gold,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s"}}>
            {copied?"Copied ✓":"Save to Toolkit"}
          </button>
          <button onClick={()=>{setAiResult(null);generateSummary();}} style={{flex:1,padding:"13px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s"}}>
            Regenerate
          </button>
        </div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text4,lineHeight:1.65,margin:0,textAlign:"center"}}>Your brand identity is your foundation. In tomorrow's session, you'll practise communicating it under pressure.</p>
        <button onClick={()=>goTo(3)} style={backStyle}>← Back</button>
      </div>
    );
  }

  return null;
}

// ─── D11 Simulation Widget — The Mirror Test ─────────────────────────────────
export function D11SimWidget({T, T2, isDesktop, brandWords=["","",""]}) {
  const wordsFromProps = brandWords.every(w=>w&&w.trim().length>0);

  const [step,       setStep]       = useState(1);
  const [localWords, setLocalWords] = useState(["","",""]);
  const [headline,   setHeadline]   = useState('');
  const [about,      setAbout]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [apiError,   setApiError]   = useState(false);
  const [copied,     setCopied]     = useState(null);
  const [saved,      setSaved]      = useState(false);

  const activeWords  = wordsFromProps ? brandWords : localWords;
  const wordsReady   = activeWords.every(w=>w&&w.trim().length>0);
  const headlineValid= headline.trim().length>0;
  const headlineLong = headline.length>220;

  const STEP_LABELS = ["Your Brand Intent","Your LinkedIn Now","Your Stronger Profile"];

  const cs = {
    card:  {background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"16px"},
    label: {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:10},
  };
  const ctaStyle = (disabled) => ({
    width:"100%", padding:"15px", borderRadius:4, border:"none",
    background:disabled?"rgba(44,36,22,0.18)":T.ink,
    color:disabled?"rgba(44,36,22,0.35)":(T2.bg||"#F7F3EC"),
    fontSize:isDesktop?15:14, fontWeight:600, cursor:disabled?"not-allowed":"pointer",
    fontFamily:T.sans, minHeight:50, transition:"all 0.2s",
  });
  const backStyle = {background:"none",border:"none",fontFamily:T.sans,fontSize:13,color:T2.text4,cursor:"pointer",padding:"6px 0",textAlign:"left"};

  function StepPills() {
    return (
      <div style={{display:"flex",gap:isDesktop?8:5,marginBottom:24}}>
        {STEP_LABELS.map((s,i)=>{
          const n=i+1; const done=n<step; const active=n===step;
          return (
            <div key={i} style={{display:"flex",alignItems:"center",flex:1,minWidth:0}}>
              <div style={{flex:1,padding:isDesktop?"7px 12px":"6px 8px",borderRadius:20,border:`0.5px solid ${active?T.ink:done?"rgba(138,158,132,0.4)":T2.border}`,background:active?(T.ink||"#2C2416"):done?"rgba(138,158,132,0.08)":"transparent",fontFamily:T.sans,fontSize:isDesktop?11:9,fontWeight:active?600:400,color:active?"#F7F3EC":done?"rgba(138,158,132,0.85)":T2.text4,textAlign:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",transition:"all 0.2s"}}>
                {done?"✓ ":""}{s}
              </div>
              {i<2&&<div style={{width:isDesktop?10:6,height:1,background:T2.border,flexShrink:0,margin:"0 3px"}}/>}
            </div>
          );
        })}
      </div>
    );
  }

  function parseResult(raw) {
    const KEYS = ["BRAND SIGNAL SCORE","WHAT'S ALREADY WORKING","WHERE THE GAP IS","THREE STRONGER HEADLINES","YOUR ABOUT SECTION OPENING"];
    const out = {};
    KEYS.forEach((k,i)=>{
      const upper=raw.toUpperCase(); const start=upper.indexOf(k);
      if(start===-1) return;
      const contentStart=start+k.length;
      const nextIdx=i<KEYS.length-1?upper.indexOf(KEYS[i+1]):raw.length;
      out[k]=raw.slice(contentStart,nextIdx>-1?nextIdx:raw.length).replace(/^[\s:*#\n]+/,"").trim();
    });
    const scoreRaw=out["BRAND SIGNAL SCORE"]||"";
    const scoreMatch=scoreRaw.match(/(\d+)\s*\/\s*10/);
    out._score=scoreMatch?scoreMatch[1]:null;
    out._scoreText=scoreRaw.replace(/^\d+\s*\/\s*10\s*[—–\-]?\s*/,"").trim();
    out._headlines=(out["THREE STRONGER HEADLINES"]||"").split("\n").filter(l=>l.trim().match(/^\d+[.)]\s+/)).map(l=>l.replace(/^\d+[.)]\s+/,"").trim()).filter(l=>l.length>0);
    if(!out._headlines.length) out._headlines=(out["THREE STRONGER HEADLINES"]||"").split("\n").filter(l=>l.trim()).slice(0,3);
    return out;
  }

  async function runMirrorTest() {
    setLoading(true); setApiError(false);
    const w=activeWords.map(w=>w.trim());
    const prompt=`You are an expert personal brand strategist and LinkedIn coach. A professional has completed a brand identity exercise and defined the three words they want to be known for. You are now auditing their LinkedIn profile against that intent.

Their three brand words: ${w.join(', ')}

Their current LinkedIn headline:
${headline.trim()}

Their current LinkedIn About section (may be empty):
${about.trim()||"No About section provided — analyse the headline only."}

Analyse their LinkedIn profile against their brand words and return your response in the following exact structure. Use the section labels exactly as written. Do not use bullet symbols. Write in second person ("Your headline…", "You come across as…"). Tone: warm, direct, expert, empowering — never critical or discouraging.

BRAND SIGNAL SCORE
Give a score out of 10 for how strongly their current LinkedIn signals their three brand words. Format: X/10. Follow with one sentence explaining the score.

WHAT'S ALREADY WORKING
Two to three sentences identifying the strongest elements of their current profile in relation to their brand words. Be specific — reference actual words or phrases from their profile where possible.

WHERE THE GAP IS
Two to three sentences identifying the clearest disconnect between their profile and their brand intent. Frame as an opportunity, not a failure. Do not use the word "lacking" or "missing".

THREE STRONGER HEADLINES
Write exactly three alternative LinkedIn headlines. Each should signal all three brand words more strongly than the current headline. Each headline must be under 180 characters. Format each on its own line, preceded by a number (1. 2. 3.). No explanation needed — just the three headlines.

YOUR ABOUT SECTION OPENING
Write a rewritten opening paragraph (3–4 sentences) for their About section. It should open with a hook, reflect all three brand words naturally, and sound like a confident, senior professional — not a CV. Use their own language and details where possible. If no About section was provided, write a strong opening based on their headline and brand words alone.`;

    try {
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:900,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const raw=(data.content||[]).map(b=>b.text||"").join("").trim();
      setResult(parseResult(raw));
      setStep(3);
    } catch(_) { setApiError(true); }
    setLoading(false);
  }

  // Loading state
  if(loading) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <StepPills/>
      <div style={{...cs.card,display:"flex",flexDirection:"column",alignItems:"center",padding:isDesktop?"64px 24px":"48px 20px",gap:24}}>
        <img src="/logo-mark.png" alt="AmplifyU" style={{width:52,height:52,objectFit:"cover",mixBlendMode:"multiply",filter:"brightness(0.55) sepia(0.4)",animation:"breathe 2s ease infinite"}}/>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T2.text,margin:0,textAlign:"center",lineHeight:1.3}}>Reading your brand signal…</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,margin:0,textAlign:"center",lineHeight:1.6}}>Your coach is comparing your LinkedIn against your brand intent.</p>
      </div>
    </div>
  );

  // Error state
  if(apiError) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <StepPills/>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"48px 24px":"36px 20px"}}>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:"0 0 20px"}}>Your coach couldn't connect right now. Check your connection and try again.</p>
        <button onClick={runMirrorTest} style={{...ctaStyle(false),width:"auto",padding:"12px 28px",display:"inline-block"}}>Try Again →</button>
      </div>
      <button onClick={()=>{setApiError(false);setStep(2);}} style={backStyle}>← Back</button>
    </div>
  );

  // Step 1: Brand Intent
  if(step===1) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <StepPills/>
      <div style={cs.card}>
        <div style={cs.label}>Your Brand Intent</div>
        {wordsFromProps ? (
          <>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text4,margin:"0 0 12px"}}>You want to be known as</p>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?30:26,fontWeight:600,color:T2.text,lineHeight:1.1,margin:"0 0 20px",letterSpacing:"-0.3px"}}>
              {brandWords.filter(w=>w.trim()).map((w,i,arr)=>(
                <span key={i}>{w}{i<arr.length-1&&<span style={{color:T.gold,fontWeight:300,padding:"0 10px"}}>·</span>}</span>
              ))}
            </p>
          </>
        ) : (
          <>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text4,margin:"0 0 14px"}}>You want to be known as</p>
            {localWords.map((w,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:w.trim()?T.gold:"rgba(138,158,132,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>
                  <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:"white"}}>{i+1}</span>
                </div>
                <input value={w} onChange={e=>{const n=[...localWords];n[i]=e.target.value;setLocalWords(n);}} placeholder={["e.g. trustworthy","e.g. creative","e.g. calm"][i]} className="au-input" style={{flex:1,padding:"10px 14px",fontSize:14}}/>
              </div>
            ))}
          </>
        )}
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:0}}>This is your brand mirror. In the next step, we'll check if your LinkedIn reflects it.</p>
      </div>
      <button onClick={()=>{if(wordsReady)setStep(2);}} style={ctaStyle(!wordsReady)}>Check my LinkedIn →</button>
    </div>
  );

  // Step 2: LinkedIn Now
  if(step===2) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <StepPills/>
      <div style={cs.card}>
        <div style={cs.label}>Your LinkedIn Now</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 20px",fontStyle:"italic"}}>Paste your current LinkedIn headline and About section below. The more you include, the sharper the analysis.</p>
        <div style={{marginBottom:20}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Your Headline</div>
          <input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="e.g. Senior Programme Manager | Digital Transformation | Shell" className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            <span style={{fontFamily:T.sans,fontSize:11,color:headlineLong?"rgba(180,80,60,0.8)":T2.text4}}>{headline.length} characters</span>
            {headlineLong&&<span style={{fontFamily:T.sans,fontSize:11,color:"rgba(180,80,60,0.8)"}}>LinkedIn allows 220 characters — yours may be truncated</span>}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Your About Section</div>
          <textarea value={about} onChange={e=>setAbout(e.target.value)} placeholder="Paste your LinkedIn About section here. If you don't have one yet, write a few sentences about what you do and who you help." rows={isDesktop?8:6} style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.65,boxSizing:"border-box"}}/>
          <div style={{fontFamily:T.sans,fontSize:11,color:T2.text4,marginTop:6}}>{about.trim().split(/\s+/).filter(w=>w).length} words</div>
        </div>
        {headlineValid&&!about.trim()&&<p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,fontStyle:"italic",margin:"0 0 4px",lineHeight:1.55}}>Adding your About section gives you a much richer analysis — but you can continue with just your headline.</p>}
        <p style={{fontFamily:T.sans,fontSize:11,color:T2.text4,margin:"12px 0 0"}}>Your text is used only to generate your analysis. It is not stored.</p>
      </div>
      <button onClick={runMirrorTest} style={ctaStyle(!headlineValid)}>Run the Mirror Test →</button>
      <button onClick={()=>setStep(1)} style={backStyle}>← Back to Brand Intent</button>
    </div>
  );

  // Step 3: Results
  if(step===3&&result) {
    const hl=result._headlines||[];
    const fullText=[
      `BRAND SIGNAL SCORE\n${result._score}/10 — ${result._scoreText}`,
      `\nWHAT'S ALREADY WORKING\n${result["WHAT'S ALREADY WORKING"]||""}`,
      `\nWHERE THE GAP IS\n${result["WHERE THE GAP IS"]||""}`,
      `\nTHREE STRONGER HEADLINES\n${hl.map((h,i)=>`${i+1}. ${h}`).join("\n")}`,
      `\nYOUR ABOUT SECTION OPENING\n${result["YOUR ABOUT SECTION OPENING"]||""}`,
    ].join("");
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepPills/>
        {/* Card 1: Score */}
        <div style={{background:T.ink||"#2C2416",borderRadius:4,padding:isDesktop?"28px 24px":"20px 16px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(200,168,76,0.7)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Brand Signal Score</div>
          {result._score&&<div style={{fontFamily:T.serif,fontSize:isDesktop?52:42,fontWeight:600,color:"#F5EFE6",lineHeight:1,margin:"0 0 10px",letterSpacing:"-1px"}}>{result._score}<span style={{fontSize:isDesktop?24:20,fontWeight:400,color:"rgba(245,239,230,0.45)"}}>/10</span></div>}
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.72)",lineHeight:1.6,margin:0}}>{result._scoreText}</p>
        </div>
        {/* Card 2: What's working */}
        <div style={cs.card}>
          <div style={cs.label}>What's Already Working</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,margin:0}}>{result["WHAT'S ALREADY WORKING"]||""}</p>
        </div>
        {/* Card 3: Gap */}
        <div style={cs.card}>
          <div style={cs.label}>Where the Gap Is</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,margin:0}}>{result["WHERE THE GAP IS"]||""}</p>
        </div>
        {/* Card 4: Headlines */}
        <div style={cs.card}>
          <div style={cs.label}>Three Stronger Headlines</div>
          {hl.map((h,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,padding:"12px 0",borderBottom:i<hl.length-1?"0.5px solid "+T2.divider:"none"}}>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.55,flex:1}}>{h}</span>
              <button onClick={()=>{navigator.clipboard?.writeText(h).then(()=>{setCopied("h"+i);setTimeout(()=>setCopied(null),2000);});}} style={{padding:"5px 10px",borderRadius:3,border:"0.5px solid "+T2.border,background:copied==="h"+i?"rgba(138,158,132,0.12)":"transparent",color:copied==="h"+i?T.gold:T2.text4,fontSize:11,fontFamily:T.sans,cursor:"pointer",flexShrink:0,fontWeight:500,transition:"all 0.15s",whiteSpace:"nowrap"}}>
                {copied==="h"+i?"Copied ✓":"Copy"}
              </button>
            </div>
          ))}
        </div>
        {/* Card 5: About Opening */}
        <div style={cs.card}>
          <div style={cs.label}>Your About Section Opening</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.75,margin:"0 0 16px"}}>{result["YOUR ABOUT SECTION OPENING"]||""}</p>
          <button onClick={()=>{navigator.clipboard?.writeText(result["YOUR ABOUT SECTION OPENING"]||"").then(()=>{setCopied("about");setTimeout(()=>setCopied(null),2000);});}} style={{padding:"7px 14px",borderRadius:3,border:"0.5px solid "+T.gold,background:copied==="about"?"rgba(138,158,132,0.12)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>
            {copied==="about"?"Copied ✓":"Copy"}
          </button>
        </div>
        {/* Actions */}
        <div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
          <button onClick={()=>{setResult(null);runMirrorTest();}} style={{background:"none",border:"none",fontFamily:T.sans,fontSize:13,color:T2.text3,cursor:"pointer",padding:"4px 0",textDecoration:"underline",textUnderlineOffset:3}}>Regenerate analysis</button>
          <button onClick={()=>{navigator.clipboard?.writeText(fullText).then(()=>{setSaved(true);setTimeout(()=>setSaved(false),3000);});}} style={{width:"100%",padding:"15px",borderRadius:4,border:"none",background:T.ink,color:T2.bg||"#F7F3EC",fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:50,transition:"all 0.2s"}}>
            {saved?"Copied to clipboard ✓":"Save to Toolkit"}
          </button>
        </div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text4,lineHeight:1.65,margin:0,textAlign:"center"}}>Your LinkedIn is your always-on brand signal. Now you know exactly what to strengthen.</p>
        <button onClick={()=>setStep(2)} style={backStyle}>← Back</button>
      </div>
    );
  }

  return null;
}

