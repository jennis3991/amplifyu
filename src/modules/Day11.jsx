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
  const [mode, setMode] = useState(null);
  const [brandWords, setBrandWords] = useState(['','','']);
  const [profileText, setProfileText] = useState('');
  const [results, setResults] = useState(null);
  const [buildRole, setBuildRole] = useState('');
  const [buildAchievement, setBuildAchievement] = useState('');
  const [buildAudience, setBuildAudience] = useState('');
  const [buildResults, setBuildResults] = useState(null);
  const [copied, setCopied] = useState(false);

  const reset = () => { setPhase('intro'); setMode(null); setBrandWords(['','','']); setProfileText(''); setResults(null); setBuildRole(''); setBuildAchievement(''); setBuildAudience(''); setBuildResults(null); setCopied(false); };

  const cs = {
    card: { background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"18px" },
    label: { fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8 },
  };
  const cta = (disabled) => ({ width:"100%", padding:"15px", borderRadius:4, border:"none", background:disabled?"rgba(44,36,22,0.25)":T.ink, color:T.bg, fontSize:isDesktop?15:14, fontWeight:600, cursor:disabled?"not-allowed":"pointer", fontFamily:T.sans, minHeight:50, transition:"all 0.2s" });
  const back = { background:"none", border:"none", fontFamily:T.sans, fontSize:12, color:T2.text4, cursor:"pointer", padding:"8px 0", textAlign:"left" };

  const runAudit = async () => {
    setPhase('analyzing');
    const r = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
    const signalPool = ['Strategic','Analytical','Experienced','Results-oriented','Delivery-focused','Credible','Diligent','Professional'];
    const currentWords = signalPool.sort(()=>Math.random()-0.5).slice(0,3);
    const desired = brandWords.filter(w=>w.trim());
    const d = desired.length > 0 ? desired.map(w=>w.trim()) : ['strategic','trusted','inspiring'];
    const COHERENCE_AREAS = ["LinkedIn Bio","Headline","Communication Style","Online Presence","Personal Story","Professional Positioning"];
    const icons = ["✅","❌","⚠️"];
    const coherence = COHERENCE_AREAS.map(area => ({area, status:icons[r(0,2)]}));
    const profileSnippet = profileText.trim().length > 200
      ? profileText.trim().slice(0,200).trim() + '…'
      : profileText.trim();

    // Default template fallback in case API is unavailable
    const d0=d[0].toLowerCase(), d1=(d[1]||d[0]).toLowerCase(), d2=(d[2]||d[0]).toLowerCase();
    let rewriteHeadline = `${d0.charAt(0).toUpperCase()+d0.slice(1)} professional delivering results through ${d1} thinking and ${d2} leadership.`;
    let rewriteAbout = `Known for being ${d.map(w=>w.toLowerCase()).join(', ')} — I bring clarity, rigour, and genuine commitment to every room I enter.\n\nMy work creates impact that compounds over time. I believe the best outcomes come from clear communication, deliberate decisions, and people who care deeply about their craft.\n\nIf you want to work with someone who is ${d0} and genuinely ${d2} — let's connect.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 700,
          messages: [{
            role: "user",
            content: `You are a personal branding coach. Rewrite this LinkedIn profile so it clearly communicates the following three brand words: ${d.join(', ')}.\n\nKeep the person's actual role, experience, and achievements — but reframe the language so every sentence reinforces who they want to be known as.\n\nCurrent profile:\n"${profileText.trim()}"\n\nReturn ONLY valid JSON:\n{"headline":"<punchy LinkedIn headline under 15 words that naturally embeds the brand words>","about":"<rewritten About section, 3 short paragraphs, warm professional tone, first person, brand words woven in naturally — not forced>"}`
          }]
        })
      });
      const data = await res.json();
      const raw = (data.content||[]).map(b=>b.text||'').join('').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        if (parsed.headline) rewriteHeadline = parsed.headline;
        if (parsed.about)    rewriteAbout    = parsed.about;
      }
    } catch(_) {}

    setResults({
      currentWords, desired, signals: currentWords,
      scores:[
        {label:"Clarity",        val:r(6,8)},
        {label:"Credibility",    val:r(7,9)},
        {label:"Memorability",   val:r(3,5)},
        {label:"Differentiation",val:r(2,5)},
        {label:"Consistency",    val:r(6,9)},
      ],
      coherence, profileSnippet,
      rewriteHeadline, rewrite: rewriteAbout,
    });
    setPhase('results');
  };

  const runBuild = () => {
    const desired = brandWords.filter(w=>w.trim());
    const d = desired.length > 0 ? desired.map(w=>w.trim()) : ['strategic','trusted','inspiring'];
    const role = buildRole.trim() || 'professional';
    const audience = buildAudience.trim() || 'organisations and teams';
    const achievement = buildAchievement.trim();

    if (mode === 'linkedin') {
      const headline = `${role} | Helping ${audience} achieve clarity, growth, and lasting results`;
      const about = `I help ${audience} achieve the kind of results that compound over time — through ${d[0]?.toLowerCase()}, ${d[1]?.toLowerCase() || 'deliberate'} leadership, and clear communication.\n\nAs a ${role}, I've built a career around ${d.join(', ').toLowerCase()}${achievement ? ` — most recently, ${achievement}` : ''}.\n\nI believe the best outcomes come from people who are clear on who they are, what they stand for, and the value they create. That belief shapes everything I do.\n\nIf you want to work with someone who brings ${d[0]?.toLowerCase()} and genuine care to every room they enter — let's connect.`;
      const cv = `${role} with a proven track record of helping ${audience} achieve meaningful outcomes. Known for ${d.join(', ').toLowerCase()}, with a clear ability to turn complexity into clarity and strategy into action.${achievement ? ` ${achievement}.` : ''} Motivated by doing work that matters — and doing it with the highest standards.`;
      setBuildResults({ headline, linkedin: about, cv });
    } else {
      const summary = `${role} with a track record of helping ${audience} achieve exceptional results. Known for being ${d.join(', ').toLowerCase()} — bringing clarity, rigour, and genuine commitment to every engagement.${achievement ? `\n\nKey achievement: ${achievement}.` : ''}\n\nA natural communicator and leader who translates complex challenges into clear, actionable strategy. Driven by the belief that the best outcomes come from ${d[0]?.toLowerCase()} thinking and ${d[d.length-1]?.toLowerCase()} execution.`;
      setBuildResults({ cv: summary });
    }
    setPhase('build-results');
  };

  if (phase === 'intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={cs.card}>
        <div style={cs.label}>Real · Personal · Actionable</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 10px"}}>Your brand is the story people tell about you when you're not in the room.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.65,margin:0}}>Choose what you'd like to do. Your AmplifyU coach scores your positioning, identifies the gaps, and writes stronger copy for you.</p>
      </div>
      {[
        {icon:"🔍", label:"Audit my LinkedIn profile", sub:"Already have a profile? Find the gap between how you're seen and how you want to be known.", action:()=>{setMode('audit');setPhase('paste');}},
        {icon:"✍️", label:"Build a LinkedIn profile from scratch", sub:"No profile yet? Build one around your brand — headline, About section, and messaging.", action:()=>{setMode('linkedin');setPhase('build-form');}},
        {icon:"📄", label:"Write my CV profile statement", sub:"Create a compelling professional summary that positions you powerfully from the first line.", action:()=>{setMode('cv');setPhase('build-form');}},
      ].map((opt,i)=>(
        <button key={i} onClick={opt.action} style={{...cs.card,cursor:"pointer",textAlign:"left",border:`0.5px solid ${T2.border}`,display:"flex",gap:14,alignItems:"flex-start",transition:"border-color 0.2s, box-shadow 0.2s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.boxShadow="0 2px 12px rgba(138,158,132,0.12)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=T2.border;e.currentTarget.style.boxShadow="none";}}>
          <span style={{fontSize:isDesktop?22:20,flexShrink:0,marginTop:2}}>{opt.icon}</span>
          <div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,marginBottom:4,lineHeight:1.2}}>{opt.label}</div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:0,lineHeight:1.5}}>{opt.sub}</p>
          </div>
          <span style={{fontFamily:T.sans,fontSize:14,color:T.gold,marginLeft:"auto",flexShrink:0,paddingTop:2}}>→</span>
        </button>
      ))}
    </div>
  );

  if (phase === 'build-form') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={cs.card}>
        <div style={cs.label}>{mode==='linkedin'?"Build Your LinkedIn Profile":"Write Your CV Profile"}</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.65,margin:"0 0 16px"}}>Answer three questions. Your AmplifyU coach writes the rest.</p>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Your role or title</div>
            <input value={buildRole} onChange={e=>setBuildRole(e.target.value)} placeholder={mode==='linkedin'?"e.g. Senior Marketing Manager":"e.g. Operations Director"} className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Who you help / your target audience</div>
            <input value={buildAudience} onChange={e=>setBuildAudience(e.target.value)} placeholder="e.g. fast-growing startups, global marketing teams" className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>One key achievement or strength</div>
            <textarea value={buildAchievement} onChange={e=>setBuildAchievement(e.target.value)} placeholder={mode==='linkedin'?"e.g. Led a team of 12 to deliver a £4M transformation programme on time and under budget":"e.g. Reduced operational costs by 30% while maintaining team engagement scores above 85%"} style={{width:"100%",minHeight:isDesktop?80:70,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Three words you want to be known for</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {brandWords.map((w,i)=>(
                <input key={i} value={w} onChange={e=>{const n=[...brandWords];n[i]=e.target.value;setBrandWords(n);}} placeholder={["e.g. Strategic","e.g. Trusted","e.g. Inspiring"][i]} className="au-input" style={{flex:"1 1 80px",padding:"9px 12px",fontSize:isDesktop?13:12,minWidth:80}}/>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button onClick={runBuild} disabled={!buildRole.trim()} style={cta(!buildRole.trim())}>
        {mode==='linkedin'?"Build My LinkedIn Profile →":"Write My CV Profile →"}
      </button>
      <button onClick={reset} style={back}>← Back</button>
    </div>
  );

  if (phase === 'build-results' && buildResults) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {mode==='linkedin' && buildResults.headline && (
        <div style={cs.card}>
          <div style={cs.label}>LinkedIn Headline</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?18:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:"0 0 10px"}}>{buildResults.headline}</p>
          <button onClick={()=>{navigator.clipboard?.writeText(buildResults.headline).then(()=>{setCopied('h');setTimeout(()=>setCopied(false),2000);});}} style={{padding:"7px 14px",borderRadius:3,border:"0.5px solid "+T.gold,background:copied==='h'?"rgba(138,158,132,0.15)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>{copied==='h'?"Copied ✓":"Copy headline"}</button>
        </div>
      )}
      {mode==='linkedin' && buildResults.linkedin && (
        <div style={cs.card}>
          <div style={cs.label}>LinkedIn About Section</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.75,margin:"0 0 14px",whiteSpace:"pre-wrap"}}>{buildResults.linkedin}</p>
          <button onClick={()=>{navigator.clipboard?.writeText(buildResults.linkedin).then(()=>{setCopied('l');setTimeout(()=>setCopied(false),2000);});}} style={{padding:"7px 14px",borderRadius:3,border:"0.5px solid "+T.gold,background:copied==='l'?"rgba(138,158,132,0.15)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>{copied==='l'?"Copied ✓":"Copy About section"}</button>
        </div>
      )}
      {buildResults.cv && (
        <div style={cs.card}>
          <div style={cs.label}>{mode==='linkedin'?"CV Profile Statement":"Your CV Profile"}</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.75,margin:"0 0 14px",whiteSpace:"pre-wrap"}}>{buildResults.cv}</p>
          <button onClick={()=>{navigator.clipboard?.writeText(buildResults.cv).then(()=>{setCopied('c');setTimeout(()=>setCopied(false),2000);});}} style={{padding:"7px 14px",borderRadius:3,border:"0.5px solid "+T.gold,background:copied==='c'?"rgba(138,158,132,0.15)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>{copied==='c'?"Copied ✓":"Copy profile statement"}</button>
        </div>
      )}
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Next step</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.65,margin:0}}>Use this as your starting point. Personalise it with specific numbers, stories, and your own voice — the goal is to sound unmistakably like you. Then run the Brand Audit to check every signal is aligned.</p>
      </div>
      <button onClick={reset} style={{width:"100%",padding:"15px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:50}}>Start Again →</button>
    </div>
  );

  if (phase === 'words' || phase === 'paste') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
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
      <div style={cs.card}>
        <div style={cs.label}>How do you want to be known?</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 12px"}}>Three words you want people to associate with your name.</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
          {brandWords.map((w,i)=>(
            <input key={i} value={w} onChange={e=>{const n=[...brandWords];n[i]=e.target.value;setBrandWords(n);}} placeholder={["e.g. Trusted","e.g. Strategic","e.g. Inspiring"][i]} className="au-input" style={{flex:"1 1 80px",padding:"9px 12px",fontSize:isDesktop?14:13,minWidth:80}}/>
          ))}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {["Trusted","Strategic","Innovative","Confident","Inspiring","Credible","Decisive","Empathetic","Visionary","Calm"].map((ex,i)=>{
            const sel=brandWords.includes(ex);
            return <button key={i} onClick={()=>{if(sel){setBrandWords(brandWords.map(w=>w===ex?"":w));}else{const idx=brandWords.findIndex(w=>!w);if(idx>=0){const n=[...brandWords];n[idx]=ex;setBrandWords(n);}}}} style={{padding:"5px 12px",borderRadius:20,border:`0.5px solid ${sel?T.gold:T2.border}`,background:sel?"rgba(138,158,132,0.15)":"transparent",color:sel?T.gold:T2.text3,fontSize:12,cursor:"pointer",fontFamily:T.sans,minHeight:30,transition:"all 0.15s"}}>{ex}</button>;
          })}
        </div>
      </div>
      <button onClick={runAudit} disabled={profileText.trim().length<10} style={cta(profileText.trim().length<10)}>Run the Audit →</button>
      <button onClick={reset} style={back}>← Back</button>
    </div>
  );

  if (phase === 'analyzing') return (
    <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:isDesktop?"56px 0":"36px 0"}}>
      <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.2s ease ${i*0.3}s infinite`}}/>)}</div>
      <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,margin:0,textAlign:"center"}}>Auditing your brand…</p>
      <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:0,textAlign:"center",lineHeight:1.6}}>Analysing your profile against your brand intent and writing a stronger version.</p>
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

      {/* Recommended Rewrite */}
      <div style={cs.card}>
        <div style={cs.label}>Your Rewritten Profile</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 16px"}}>Written around <span style={{fontWeight:600,color:T.gold}}>{results.desired.join(', ')}</span> — use this as your starting point and personalise with your specific numbers and voice.</p>

        {/* Current snippet */}
        <div style={{padding:"12px 14px",background:T2.bg,borderRadius:4,marginBottom:10}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(180,80,60,0.65)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Your current profile</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?13:12,fontStyle:"italic",color:T2.text3,lineHeight:1.65,margin:0}}>{results.profileSnippet}</p>
        </div>

        {/* Rewritten headline */}
        {results.rewriteHeadline && (
          <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.07)",borderRadius:4,border:"0.5px solid rgba(138,158,132,0.3)",marginBottom:10}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>New headline</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:"0 0 12px"}}>{results.rewriteHeadline}</p>
            <button onClick={()=>{navigator.clipboard?.writeText(results.rewriteHeadline).then(()=>{setCopied('h');setTimeout(()=>setCopied(false),2000);});}}
              style={{padding:"7px 14px",borderRadius:3,border:"0.5px solid "+T.gold,background:copied==='h'?"rgba(138,158,132,0.15)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>
              {copied==='h'?"Copied ✓":"Copy headline"}
            </button>
          </div>
        )}

        {/* Rewritten About */}
        <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.07)",borderRadius:4,border:"0.5px solid rgba(138,158,132,0.3)"}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>New About section</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.75,margin:"0 0 14px",whiteSpace:"pre-wrap"}}>{results.rewrite}</p>
          <button onClick={()=>{navigator.clipboard?.writeText(results.rewrite).then(()=>{setCopied('a');setTimeout(()=>setCopied(false),2000);});}}
            style={{padding:"7px 14px",borderRadius:3,border:"0.5px solid "+T.gold,background:copied==='a'?"rgba(138,158,132,0.15)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>
            {copied==='a'?"Copied ✓":"Copy About section"}
          </button>
        </div>

        <div style={{marginTop:12,padding:"11px 13px",background:"rgba(44,36,22,0.04)",borderRadius:3,borderLeft:"2px solid "+T2.border}}>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text4,lineHeight:1.6,margin:0}}>Personalise with specific numbers, stories, and your own voice — the goal is to sound unmistakably like you.</p>
        </div>
      </div>

      <button onClick={reset} style={{width:"100%",padding:"15px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:50}}>Run Another Audit →</button>
    </div>
  );

  return null;
}



