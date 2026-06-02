import { useState, useRef } from 'react';
import { T } from '../theme.js';

export function D11PracticeWidget({T, T2, isDesktop}) {
  const SIGNAL_AREAS = ["Wardrobe","LinkedIn & bio","Voice & pace","Posture & presence","Storytelling","Energy","Online presence","Communication style"];
  const STORY_TYPES = [
    {label:"Origin Story",      desc:"Where you came from and what shaped your values."},
    {label:"Turning Point",     desc:"A moment that changed your direction or thinking."},
    {label:"Failure Story",     desc:"A challenge you faced and what you learned."},
    {label:"Values Story",      desc:"A decision that shows what you stand for."},
  ];
  const BRAND_WORDS = ["calm","sharp","trustworthy","creative","premium","warm","fearless","visionary","precise","driven","empathetic","decisive","authentic","bold","considered"];
  const [words, setWords] = useState(["","",""]);
  const [auditDone, setAuditDone] = useState({});
  const [activeStory, setActiveStory] = useState(null);
  const [storyText, setStoryText] = useState({});
  const [tab, setTab] = useState(0);
  const [phase, setPhase] = useState('intro');

  const tabs = ["Brand Mirror","Signal Audit","Story Curation"];
  const cs = {
    card: {background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"16px"},
    label: {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8},
  };
  const cta = {width:"100%",padding:"15px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:50,transition:"all 0.2s"};

  if (phase === 'intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* YOUR MISSION */}
      <div style={cs.card}>
        <div style={cs.label}>Your Mission</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T.gold,lineHeight:1.25,margin:"0 0 14px"}}>Build a brand that gets you remembered for the right reasons.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            "Build your Brand Mirror — know exactly what you want to stand for.",
            "Audit your signals — check every touchpoint you send to the world.",
            "Curate your stories — the narratives that make your brand stick.",
          ].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:3}}>✦</span>
              <span style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.45}}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* THE CHALLENGE JOURNEY */}
      <div style={cs.card}>
        <div style={cs.label}>The Challenge Journey</div>
        <div style={{display:"flex",alignItems:"flex-start"}}>
          {[
            {n:1, label:"Brand Mirror"},
            {n:2, label:"Signal Audit"},
            {n:3, label:"Story Curation"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?50:44,height:isDesktop?50:44,borderRadius:"50%",border:`1.5px solid ${i===0?T.gold:"rgba(138,158,132,0.35)"}`,background:i===0?"rgba(138,158,132,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?16:15,fontWeight:600,color:i===0?T.gold:"rgba(138,158,132,0.55)"}}>{r.n}</span>
                </div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?13:11,fontWeight:500,color:"#A8998A",textAlign:"center",lineHeight:1.3,maxWidth:88}}>{r.label}</div>
              </div>
              {i<2 && <div style={{height:1,width:isDesktop?12:8,background:"rgba(138,158,132,0.25)",flexShrink:0,marginBottom:28}}/>}
            </div>
          ))}
        </div>
      </div>

      <button onClick={()=>setPhase('challenge')} style={cta}>Begin the Challenge →</button>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {tabs.map((t,i) => (
          <button key={i} onClick={()=>setTab(i)} style={{padding:"8px 16px",borderRadius:3,border:`0.5px solid ${tab===i?T.gold:T2.border}`,background:tab===i?"rgba(138,158,132,0.1)":"transparent",color:tab===i?T.gold:T2.text3,fontSize:12,fontWeight:tab===i?600:400,cursor:"pointer",fontFamily:T.sans,transition:"all 0.15s",minHeight:36}}>{t}</button>
        ))}
      </div>

      {tab===0 && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={cs.card}>
            <div style={cs.label}>Your Brand in Three Words</div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,marginBottom:16}}>What three words do you <em>want</em> people to use to describe you? Be specific. These become your brand intent.</p>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
              {words.map((w,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:w?T.gold:"rgba(138,158,132,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>
                    <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:"white"}}>{i+1}</span>
                  </div>
                  <input value={w} onChange={e=>{const n=[...words];n[i]=e.target.value;setWords(n);}} placeholder={["e.g. trustworthy","e.g. creative","e.g. calm"][i]} className="au-input" style={{flex:1,padding:"10px 14px",fontSize:14}}/>
                </div>
              ))}
            </div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Or choose from these</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {BRAND_WORDS.map((bw,i)=>{
                const selected=words.includes(bw);
                return (
                  <button key={i} onClick={()=>{if(selected){setWords(words.map(w=>w===bw?"":w));}else{const idx=words.findIndex(w=>!w);if(idx>=0){const n=[...words];n[idx]=bw;setWords(n);}}}} style={{padding:"6px 12px",borderRadius:20,border:`0.5px solid ${selected?T.gold:T2.border}`,background:selected?"rgba(138,158,132,0.15)":"transparent",color:selected?T.gold:T2.text3,fontSize:12,cursor:"pointer",fontFamily:T.sans,minHeight:32,transition:"all 0.15s"}}>{bw}</button>
                );
              })}
            </div>
          </div>
          {words.some(w=>w.trim()) && (
            <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
              <div style={cs.label}>Now ask yourself</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>Does the way you currently show up — your wardrobe, your LinkedIn, your communication style, your energy — consistently signal <em style={{color:T.gold}}>{words.filter(w=>w.trim()).join(", ")}</em>?</p>
            </div>
          )}
        </div>
      )}

      {tab===1 && (
        <div style={cs.card}>
          <div style={cs.label}>Signal Audit</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,marginBottom:12}}>For each area below, mark whether your current signal is intentional and aligned with the brand you want.</p>
          <div style={{marginBottom:16,padding:"12px 14px",background:"rgba(138,158,132,0.07)",borderRadius:4,borderLeft:"2px solid rgba(138,158,132,0.35)"}}>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 8px"}}>That progression mirrors how personal brands are formed in the real world.</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"}}>
              {["People see you","hear you","experience you","remember you","research you"].map((s,i,arr)=>(
                <span key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,fontWeight:600,color:T.gold}}>{s}</span>
                  {i<arr.length-1 && <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4,opacity:0.6}}>→</span>}
                </span>
              ))}
            </div>
          </div>
          {SIGNAL_AREAS.map((area,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:i<SIGNAL_AREAS.length-1?"0.5px solid "+T2.divider:"none"}}>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text}}>{area}</span>
              <div style={{display:"flex",gap:8}}>
                {["✓ Aligned","Needs work"].map((label,j)=>(
                  <button key={j} onClick={()=>setAuditDone({...auditDone,[area]:j===0?"aligned":"needs"})} style={{padding:"5px 12px",borderRadius:3,border:`0.5px solid ${auditDone[area]===(j===0?"aligned":"needs")?T.gold:T2.border}`,background:auditDone[area]===(j===0?"aligned":"needs")?"rgba(138,158,132,0.12)":"transparent",color:auditDone[area]===(j===0?"aligned":"needs")?T.gold:T2.text4,fontSize:11,cursor:"pointer",fontFamily:T.sans,minHeight:32,fontWeight:auditDone[area]===(j===0?"aligned":"needs")?600:400,transition:"all 0.15s"}}>{label}</button>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(auditDone).length>0 && (
            <div style={{marginTop:14,padding:"12px 14px",background:"rgba(138,158,132,0.06)",borderRadius:3,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?15:13,fontStyle:"italic",color:T2.text,margin:0,lineHeight:1.6}}>
                {Object.values(auditDone).filter(v=>v==="needs").length===0?"Every signal is aligned. Your brand is consistent.":
                 `${Object.values(auditDone).filter(v=>v==="needs").length} area${Object.values(auditDone).filter(v=>v==="needs").length>1?"s":""} to work on. Start with the one most visible to the people who matter most.`}
              </p>
            </div>
          )}
        </div>
      )}

      {tab===2 && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{paddingBottom:4}}>
            <div style={cs.label}>Your Story Portfolio</div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,margin:0}}>Every powerful personal brand is built on a few key stories. Choose one story type below and write your version.</p>
          </div>
          {STORY_TYPES.map((st,i)=>(
            <div key={i} onClick={()=>setActiveStory(activeStory===i?null:i)} style={{...cs.card,cursor:"pointer",transition:"border-color 0.2s",borderColor:activeStory===i?T.gold:T2.border}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{st.label}</div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,margin:0,lineHeight:1.5}}>{st.desc}</p>
                </div>
                <span style={{fontFamily:T.sans,fontSize:12,color:activeStory===i?T.gold:T2.text4,marginLeft:12,flexShrink:0}}>{activeStory===i?"▴":"▸"}</span>
              </div>
              {activeStory===i && (
                <div style={{marginTop:14,paddingTop:14,borderTop:"0.5px solid "+T2.divider}} onClick={e=>e.stopPropagation()}>
                  <textarea value={storyText[i]||""} onChange={e=>setStoryText({...storyText,[i]:e.target.value})} placeholder={`Write your ${st.label.toLowerCase()} here…`} style={{width:"100%",minHeight:isDesktop?100:80,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.6}}/>
                  {(storyText[i]||"").trim().length>0 && (
                    <div style={{marginTop:10,padding:"10px 12px",background:"rgba(138,158,132,0.06)",borderRadius:3,borderLeft:"2px solid "+T.gold}}>
                      <p style={{fontFamily:T.serif,fontSize:12,fontStyle:"italic",color:T2.text3,margin:0,lineHeight:1.6}}>Good. Now trim it to under 90 seconds when spoken aloud. The best stories are the ones that feel effortless to tell.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── D11 Simulation Widget — Brand Coherence Audit ───────────────────────────
export function D11SimWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('intro');
  const [brandWords, setBrandWords] = useState(['','','']);
  const [profileText, setProfileText] = useState('');
  const [results, setResults] = useState(null);

  const reset = () => { setPhase('intro'); setBrandWords(['','','']); setProfileText(''); setResults(null); };

  const cs = {
    card: { background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"18px" },
    label: { fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8 },
  };
  const cta = (disabled) => ({ width:"100%", padding:"15px", borderRadius:4, border:"none", background:disabled?"rgba(44,36,22,0.25)":T.ink, color:T.bg, fontSize:isDesktop?15:14, fontWeight:600, cursor:disabled?"not-allowed":"pointer", fontFamily:T.sans, minHeight:50, transition:"all 0.2s" });
  const back = { background:"none", border:"none", fontFamily:T.sans, fontSize:12, color:T2.text4, cursor:"pointer", padding:"8px 0", textAlign:"left" };

  const runAudit = () => {
    const r = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
    const signalPool = ['Strategic','Analytical','Experienced','Results-oriented','Delivery-focused','Credible','Diligent','Professional'];
    const currentWords = signalPool.sort(()=>Math.random()-0.5).slice(0,3);
    const desired = brandWords.filter(w=>w.trim());
    const COHERENCE_AREAS = ["LinkedIn Bio","Headline","Communication Style","Online Presence","Personal Story","Professional Positioning"];
    const icons = ["✅","❌","⚠️"];
    const coherence = COHERENCE_AREAS.map(area => ({
      area,
      status: icons[r(0,2)],
    }));
    setResults({
      currentWords,
      desired,
      signals: currentWords,
      risks:[
        "Feels similar to thousands of other profiles in your sector",
        "Focuses heavily on responsibilities rather than outcomes",
        "Limited differentiation — no clear point of view",
        "Doesn't communicate what you uniquely stand for",
      ],
      scores:[
        {label:"Clarity",       val:r(6,8)},
        {label:"Credibility",   val:r(7,9)},
        {label:"Memorability",  val:r(3,5)},
        {label:"Differentiation",val:r(2,5)},
        {label:"Consistency",   val:r(6,9)},
      ],
      coherence,
    });
    setPhase('results');
  };

  if (phase === 'intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={cs.card}>
        <div style={cs.label}>Real · Personal · Actionable</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 16px"}}>Your personal brand already exists. The question is whether you're shaping it intentionally.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:"0 0 12px"}}>One of the fastest ways to assess your brand is to look at your LinkedIn profile.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0}}>Most profiles describe what someone does. The strongest profiles communicate who they are, what they stand for, and the value they create.</p>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>What your AmplifyU coach will analyse</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            "What signals your profile currently sends",
            "Whether those signals are consistent",
            "What people are likely to assume about you",
            "Gaps between your current and desired brand",
            "How to strengthen your positioning",
          ].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:2}}>✦</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.5}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=>setPhase('words')} style={cta(false)}>Begin the Audit →</button>
    </div>
  );

  if (phase === 'words') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
        <div style={{display:"flex",gap:6}}>
          {[1,2].map(i=><div key={i} style={{width:i===1?22:6,height:6,borderRadius:3,background:i===1?T.gold:T2.border,transition:"all 0.3s"}}/>)}
        </div>
        <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>Step 1 of 2</span>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Your Brand Intent</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 16px"}}>What three words do you want people to associate with your name?</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {brandWords.map((w,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:w?T.gold:"rgba(138,158,132,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>
                <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:"white"}}>{i+1}</span>
              </div>
              <input value={w} onChange={e=>{const n=[...brandWords];n[i]=e.target.value;setBrandWords(n);}} placeholder={["e.g. Trusted","e.g. Strategic","e.g. Inspiring"][i]} className="au-input" style={{flex:1,padding:"10px 14px",fontSize:isDesktop?14:13}}/>
            </div>
          ))}
        </div>
        <div style={{paddingTop:14,borderTop:"0.5px solid "+T2.divider}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Examples</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {["Trusted","Strategic","Innovative","Confident","Inspiring","Credible","Decisive","Empathetic","Visionary","Calm"].map((ex,i)=>{
              const sel=brandWords.includes(ex);
              return <button key={i} onClick={()=>{if(sel){setBrandWords(brandWords.map(w=>w===ex?"":w));}else{const idx=brandWords.findIndex(w=>!w);if(idx>=0){const n=[...brandWords];n[idx]=ex;setBrandWords(n);}}}} style={{padding:"5px 12px",borderRadius:20,border:`0.5px solid ${sel?T.gold:T2.border}`,background:sel?"rgba(138,158,132,0.15)":"transparent",color:sel?T.gold:T2.text3,fontSize:12,cursor:"pointer",fontFamily:T.sans,minHeight:30,transition:"all 0.15s"}}>{ex}</button>;
            })}
          </div>
        </div>
      </div>
      <button onClick={()=>setPhase('paste')} style={cta(false)}>Next →</button>
      <button onClick={reset} style={back}>← Back</button>
    </div>
  );

  if (phase === 'paste') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
        <div style={{display:"flex",gap:6}}>
          {[1,2].map(i=><div key={i} style={{width:22,height:6,borderRadius:3,background:T.gold}}/>)}
        </div>
        <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>Step 2 of 2</span>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Your LinkedIn Profile</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:"0 0 16px"}}>Paste your current LinkedIn headline, About section, or professional bio. The more you include, the deeper the analysis.</p>
        <textarea
          value={profileText}
          onChange={e=>setProfileText(e.target.value)}
          placeholder={"Paste your LinkedIn headline, About section, or professional bio here…\n\nExample:\nSenior manager with 15 years' experience leading teams and delivering projects across multiple industries."}
          style={{width:"100%",minHeight:isDesktop?160:130,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.65,boxSizing:"border-box"}}
        />
        {profileText.trim().length>0 && (
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text4,margin:"10px 0 0"}}>{profileText.trim().split(/\s+/).length} words</p>
        )}
      </div>
      <button onClick={runAudit} disabled={profileText.trim().length<10} style={cta(profileText.trim().length<10)}>Run the Audit →</button>
      <button onClick={()=>setPhase('words')} style={back}>← Back</button>
    </div>
  );

  if (phase === 'results' && results) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Current Brand Signals */}
      <div style={cs.card}>
        <div style={cs.label}>Your Current Brand Signals</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 14px"}}>Based on your profile, you currently signal:</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          {results.signals.map((s,i)=>(
            <span key={i} style={{padding:"6px 14px",borderRadius:20,background:"rgba(138,158,132,0.12)",border:"0.5px solid rgba(138,158,132,0.35)",fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:600,color:T.gold}}>{s}</span>
          ))}
        </div>
        <div style={cs.label}>Potential Risks</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {results.risks.map((r,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontFamily:T.sans,fontSize:13,color:"rgba(180,80,60,0.8)",flexShrink:0,marginTop:1}}>×</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Alignment Score */}
      <div style={cs.card}>
        <div style={cs.label}>Brand Alignment Score</div>
        {results.scores.map((s,i)=>(
          <div key={i} style={{marginBottom:i<results.scores.length-1?14:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,fontWeight:500}}>{s.label}</span>
              <span style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontWeight:700,color:s.val>=7?T.gold:s.val>=5?"#7A9E84":T2.text3}}>{s.val}<span style={{fontSize:11,fontWeight:400,color:T2.text4}}>/10</span></span>
            </div>
            <div style={{height:4,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:(s.val*10)+"%",background:s.val>=7?T.gold:s.val>=5?"rgba(138,158,132,0.7)":"rgba(180,80,60,0.35)",borderRadius:2,transition:"width 0.9s ease"}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Reflection */}
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Reflection</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.65,margin:"0 0 12px"}}>If someone read this profile for 15 seconds, they would likely describe you as:</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:"0 0 16px"}}>"{results.signals.join('. ')}."</p>
        {results.desired.length>0 && <>
          <div style={{display:"flex",flexDirection:"column",gap:10,padding:"14px 16px",background:T2.bg,borderRadius:4}}>
            <div>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>You want to be known for</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:T.gold,lineHeight:1.5,margin:0}}>{results.desired.join('. ')}.</p>
            </div>
            <div style={{height:"0.5px",background:T2.divider}}/>
            <div>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Your profile currently communicates</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:T2.text3,lineHeight:1.5,margin:0}}>{results.currentWords.join('. ')}.</p>
            </div>
          </div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:600,color:"rgba(180,80,60,0.8)",margin:"12px 0 0"}}>There is a gap.</p>
        </>}
      </div>

      {/* Brand Coherence Table */}
      <div style={cs.card}>
        <div style={cs.label}>Brand Coherence Audit</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 14px"}}>How consistently does your brand show up across every touchpoint?</p>
        {results.coherence.map((row,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<results.coherence.length-1?"0.5px solid "+T2.divider:"none"}}>
            <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text}}>{row.area}</span>
            <span style={{fontSize:16}}>{row.status}</span>
          </div>
        ))}
        <div style={{marginTop:16,padding:"12px 14px",background:"rgba(138,158,132,0.06)",borderRadius:3,borderLeft:"2px solid "+T.gold}}>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:"italic",color:T2.text,margin:0,lineHeight:1.6}}>Repeated signals become reputation. Reputation becomes brand.</p>
        </div>
      </div>

      <button onClick={reset} style={{width:"100%",padding:"15px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:50}}>Run Another Audit →</button>
    </div>
  );

  return null;
}



