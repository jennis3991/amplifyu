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

  const tabs = ["Brand Mirror","Signal Audit","Story Curation"];
  const cs = {
    card: {background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"16px"},
    label: {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8},
  };

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

// ─── D11 Simulation Widget ─────────────────────────────────────────────────
export function D11SimWidget({T, T2, isDesktop}) {
  const SCENARIOS = [
    {id:0, label:"Networking Event", sub:"Someone asks who you are.",
     aiOpener:'"Tell me about yourself."',
     goal:"Clear identity signal",
     context:"You have 30–60 seconds. This is where most people undersell themselves or go too broad.",
     followUps:["What do you actually do day to day?","That's interesting — what made you choose that path?","So what are you working on right now?"],
     starters:["I help [who] do [what] — most recently…","My background is [X], but what drives me is…","I work at the intersection of [X] and [Y]…"],
     script:{topic:"Professional introduction",context:"A compelling 60-second introduction that signals who you are, what you stand for, and why it matters.",
       beginner:'"I\'m a [role] who specialises in [area]. What drives me is [value/belief]. Most recently, I [specific achievement] — which taught me [insight]. I\'m here tonight because I\'m interested in [goal]."',
       intermediate:["Open with your role and what drives you — not your job title alone","Name one specific recent win","Say what you\'re currently working toward or interested in","Close with a natural question or connection to them"]}},
    {id:1, label:"Podcast Introduction", sub:"30 seconds to introduce yourself.",
     aiOpener:'"Before we dive in — for our listeners who don\'t know you, introduce yourself in 30 seconds."',
     goal:"Memorable brand signal",
     context:"This is one of the highest-value 30 seconds in your career. Most people waste it.",
     followUps:["Great — and what does that actually mean in practice?","What would you say is your superpower?","And what are you most focused on right now?"],
     starters:["I spend my time helping [audience] [outcome]…","My work sits at the intersection of [X] and [Y]…","I\'m probably best known for [thing], but what I care most about is [value]…"],
     script:{topic:"Podcast bio",context:"A crisp, memorable self-introduction that communicates expertise, differentiation, and personality.",
       beginner:'"I\'m [name]. I work with [audience type] to help them [specific outcome]. I\'ve spent [X years] doing [area], and the thread through everything I do is [core belief or value]. Right now I\'m most excited about [current focus]."',
       intermediate:["Open with what you do for others — not your job title","State your expertise through a lens of impact","Include one belief or value that differentiates you","Close with energy — what excites you right now"]}},
    {id:2, label:"Interview", sub:"Why should we hire you?",
     aiOpener:'"So — why should we hire you over someone else?"',
     goal:"Confident brand articulation",
     context:"The question most candidates fear. The ones who nail it treat it as a brand statement, not a list of qualifications.",
     followUps:["Can you give me a specific example of that?","What would your previous team say about you?","How do you handle situations where you\'re out of your depth?"],
     starters:["What I bring that's distinct is…","Throughout my career, the pattern has always been…","I\'m someone who [distinctive trait] — and the evidence for that is…"],
     script:{topic:"Interview answer",context:"A confident, differentiated answer to the most common and most important interview question.",
       beginner:'"What I bring is [specific skill or trait], backed by [experience]. But more than that, I bring [intangible — mindset, values, approach]. The clearest example of that is [brief story]. What drives me is [belief], and that\'s why this role genuinely excites me."',
       intermediate:["Lead with your distinctive strength — not a list","Back it with one specific story","Name your values or approach, not just your skills","Connect your motivation to this specific role"]}},
    {id:3, label:"LinkedIn Bio", sub:"Paste your current bio for a brand audit.",
     aiOpener:'"Paste your current LinkedIn bio or \'About\' section. What does it currently signal — and what should it signal?"',
     goal:"Brand coherence audit",
     context:"Most LinkedIn bios read like a CV summary. The best ones read like a brand statement.",
     followUps:["What three words do you want people to feel when they read it?","Who is the primary audience you want to attract?","Does it show personality — or just credentials?"],
     starters:["This currently signals… Consider shifting toward…","The strongest line is… The weakest is…","One reframe that would change everything: instead of saying [X], try [Y]…"],
     script:{topic:"LinkedIn bio",context:"A bio that signals expertise, values, and personality — not just employment history.",
       beginner:'"I\'m a [role] who helps [audience] [achieve outcome]. I believe [core value or philosophy]. My work has [impact area]. Outside of [professional domain], I\'m [one personal dimension that humanises you]. If you want to talk about [topic], reach out."',
       intermediate:["Open with what you do for others — not your title","State your core belief or philosophy","Name your impact area specifically","Add one human dimension — not just credentials","Close with an invitation to connect"]}},
  ];

  const [phase, setPhase] = useState('idle');
  const [sc, setSc] = useState(null);
  const [mode, setMode] = useState(null);
  const [difficulty, setDifficulty] = useState('beginner');
  const [userText, setUserText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [ownContext, setOwnContext] = useState('');
  const [followIdx, setFollowIdx] = useState(0);

  const reset = () => { setPhase('idle'); setSc(null); setMode(null); setDifficulty('beginner'); setUserText(''); setFeedback(null); setOwnContext(''); setFollowIdx(0); };

  const SCORES = ['Clarity','Authenticity','Memorability','Brand Alignment','Confidence','Executive Presence'];
  const generateFeedback = () => {
    const scores = SCORES.map(s => ({ label:s, val:Math.floor(Math.random()*25)+70 }));
    const notes = [
      "Strong opening — your identity signal was clear within the first sentence. The specific achievement grounded it. Consider adding one belief or value that differentiates you beyond the role itself.",
      "Excellent brand coherence. Your tone matched your content, and the story you used was precise. The emotional dimension could be slightly stronger — what do you care about most?",
      "Very memorable framing. You led with what you do for others rather than your title — that's exactly right. The closing could be sharper: what do you want them to do or think next?",
      "Clear, confident, and specific. The brand signal was strong. One refinement: where possible, show your values through a story rather than stating them directly. Proof is always more powerful than claim.",
    ];
    setFeedback({ scores, note: notes[Math.floor(Math.random()*notes.length)], followUp: sc?.followUps[Math.floor(Math.random()*sc.followUps.length)] });
    setPhase('feedback');
  };

  const cs = {
    card: { background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"18px" },
    label: { fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8 },
  };

  if (phase === 'idle') return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>Choose your scenario</div>
      {SCENARIOS.map(s => (
        <div key={s.id} onClick={()=>{setSc(s);setPhase('mode-select');}} style={{...cs.card,cursor:"pointer"}} className="au-lift">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>{s.goal}</div>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,marginBottom:4}}>{s.label}</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,margin:0}}>{s.sub}</p>
            </div>
            <span style={{fontFamily:T.sans,fontSize:12,color:T.gold,marginLeft:12,flexShrink:0}}>→</span>
          </div>
        </div>
      ))}
    </div>
  );

  if (phase === 'mode-select') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={cs.card}>
        <div style={cs.label}>The Prompt</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.4,margin:"0 0 10px"}}>{sc.aiOpener}</p>
        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,margin:0,lineHeight:1.6}}>{sc.context}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <button onClick={()=>{setMode('guided');setPhase('setup');}} style={{...cs.card,cursor:"pointer",textAlign:"left",border:"0.5px solid "+T.gold}}>
          <div style={cs.label}>Guided</div>
          <div style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,marginBottom:6}}>Coach me through it</div>
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0}}>Script, talking points, and difficulty levels.</p>
        </button>
        <button onClick={()=>{setMode('own');setPhase('active');}} style={{...cs.card,cursor:"pointer",textAlign:"left"}}>
          <div style={cs.label}>Real situation</div>
          <div style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,marginBottom:6}}>Use my own words</div>
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0}}>Write naturally and get brand feedback.</p>
        </button>
      </div>
      <button onClick={reset} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
    </div>
  );

  if (phase === 'setup') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={cs.card}>
        <div style={cs.label}>The Prompt</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>{sc.aiOpener}</p>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Difficulty</div>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {['beginner','intermediate','advanced'].map(d=>(
            <button key={d} onClick={()=>setDifficulty(d)} style={{padding:"8px 16px",borderRadius:3,border:`0.5px solid ${difficulty===d?T.gold:T2.border}`,background:difficulty===d?"rgba(138,158,132,0.12)":"transparent",color:difficulty===d?T.gold:T2.text3,fontSize:12,fontWeight:difficulty===d?600:400,cursor:"pointer",fontFamily:T.sans,transition:"all 0.15s",minHeight:36,textTransform:"capitalize"}}>{d}</button>
          ))}
        </div>
        <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14}}>
          {difficulty==='beginner' && <><div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Full Script</div><p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>{sc.script.beginner}</p></>}
          {difficulty==='intermediate' && <><div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Talking Points</div>{sc.script.intermediate.map((pt,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}><div style={{color:T.gold,fontFamily:T.sans,fontSize:12,fontWeight:700,flexShrink:0,marginTop:2}}>{i+1}.</div><p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.6,margin:0}}>{pt}</p></div>)}</>}
          {difficulty==='advanced' && <><div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Speak Freely</div><p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,margin:0}}>No script. Respond naturally. Your coach will evaluate clarity, authenticity, and brand alignment.</p></>}
        </div>
      </div>
      <button onClick={()=>setPhase('active')} style={{width:"100%",padding:"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Start →</button>
      <button onClick={()=>setPhase('mode-select')} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
    </div>
  );

  if (phase === 'active') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={cs.card}>
        <div style={cs.label}>The Prompt</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>{sc.aiOpener}</p>
        {followIdx>0 && sc.followUps[followIdx-1] && (
          <div style={{marginTop:16,paddingTop:14,borderTop:"0.5px solid "+T2.divider}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(180,100,80,0.8)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Follow-up</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.4,margin:0}}>{sc.followUps[followIdx-1]}</p>
          </div>
        )}
      </div>
      {mode==='own' && (
        <div style={cs.card}>
          <div style={cs.label}>Your context (optional)</div>
          <textarea value={ownContext} onChange={e=>setOwnContext(e.target.value)} placeholder="Add context about your actual situation for more personalised feedback…" style={{width:"100%",minHeight:60,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.6}}/>
        </div>
      )}
      <div style={cs.card}>
        <div style={cs.label}>Your response</div>
        <textarea value={userText} onChange={e=>setUserText(e.target.value)} placeholder="Write what you'd say…" style={{width:"100%",minHeight:isDesktop?140:110,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:14,color:T2.text,resize:"none",outline:"none",lineHeight:1.6}}/>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {followIdx < sc.followUps.length && <button onClick={()=>setFollowIdx(i=>i+1)} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Follow-up →</button>}
        <button onClick={generateFeedback} disabled={userText.trim().length<10} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"none",background:userText.trim().length>=10?T.ink:"rgba(44,36,22,0.3)",color:T.bg,fontSize:13,fontWeight:600,cursor:userText.trim().length>=10?"pointer":"not-allowed",fontFamily:T.sans,minHeight:44,transition:"background 0.2s"}}>Get Brand Feedback →</button>
      </div>
      <button onClick={reset} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Start over</button>
    </div>
  );

  if (phase === 'feedback') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={cs.card}>
        <div style={cs.label}>Brand Assessment</div>
        {feedback.scores.map((s,i) => (
          <div key={i} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontFamily:T.sans,fontSize:12,color:T2.text,fontWeight:500}}>{s.label}</span>
              <span style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:s.val>=85?T.gold:s.val>=70?"#7A9E84":T2.text3}}>{s.val}</span>
            </div>
            <div style={{height:3,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:s.val+"%",background:s.val>=85?T.gold:s.val>=70?"rgba(138,158,132,0.7)":"rgba(138,158,132,0.35)",borderRadius:2,transition:"width 0.8s ease"}}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Brand Coach Note</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>{feedback.note}</p>
      </div>
      {feedback.followUp && (
        <div style={{...cs.card,background:"rgba(44,30,20,0.06)"}}>
          <div style={cs.label}>They ask</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:"0 0 8px"}}>{feedback.followUp}</p>
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0}}>How do you answer?</p>
        </div>
      )}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={()=>{setPhase('active');setUserText('');setFeedback(null);setFollowIdx(followIdx+1);}} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Try Again</button>
        <button onClick={reset} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"none",background:T.ink,color:T.bg,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>New Scenario →</button>
      </div>
    </div>
  );

  return null;
}



