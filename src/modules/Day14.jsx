import { useState } from 'react';

// ─── D14 Practice Widget — AmplifyU Reflection ────────────────────────────
export function D14PracticeWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('intro');
  const [answers, setAnswers] = useState(Array(7).fill(''));
  const [principle, setPrinciple] = useState('');

  const PRINCIPLES = ["Clarity","Voice","Storytelling","Presence","Brand","Exposure"];

  const QUESTIONS = [
    { label:"Round 1 · Your Growth", prompt:"What communication skill improved most during AmplifyU?", placeholder:"e.g. Structuring my ideas under pressure, telling stories that land, reducing filler words…" },
    { label:"Round 2 · Your Edge", prompt:"What communication habit still needs the most work?", placeholder:"e.g. Confidence in senior rooms, vocal variety, making my ambition visible…" },
    { label:"Round 3 · Your Brand", prompt:"What do you want to be known for professionally?", placeholder:"e.g. Strategic clarity, inspiring leadership, bold and honest communication…" },
    { label:"Round 4 · Your Ambition", prompt:"What opportunity, role or ambition are you working towards?", placeholder:"e.g. A promotion to Head of Strategy, building my own business, leading a bigger team…" },
    { label:"Round 5 · Your Principle", prompt:"Which AmplifyU principle had the biggest impact — and why?", placeholder:"Tell us which principle changed something for you, and what shifted…" },
    { label:"Round 6 · Your Commitment", prompt:"What one communication behaviour will you commit to practising every week?", placeholder:"e.g. Telling one SAR story per week, pausing before I answer, sharing my ambition in one conversation…" },
    { label:"Round 7 · Your Vision", prompt:"One year from now, I want people to describe me as…", placeholder:"Write it as if it's already true. Be specific. Be bold." },
  ];

  const cs = {
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };

  const Progress = ({round}) => (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:isDesktop?18:14}}>
      <div style={{display:"flex",gap:4,flex:1}}>
        {QUESTIONS.map((_,i)=>(
          <div key={i} style={{height:3,borderRadius:2,flex:1,background:i<round?T.gold:i===round?"rgba(138,158,132,0.6)":T2.border,transition:"background 0.3s"}}/>
        ))}
      </div>
      <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4,flexShrink:0}}>Reflection {round+1} of 7</span>
    </div>
  );

  if (phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your AmplifyU Reflection</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T.gold,lineHeight:1.25,margin:"0 0 14px"}}>Take a moment to reflect on your journey.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:"0 0 14px"}}>Seven questions. Your honest answers will be used to create your personal Communication Blueprint.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {["What changed most in how you communicate?","What still needs the most work?","What do you want to be known for?","Where are you going next?","Which principle had the biggest impact?","What will you commit to practising?","Who do you want to become?"].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,flexShrink:0,minWidth:16}}>{i+1}.</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=>setPhase('q0')} style={cs.cta}>Begin Your Reflection →</button>
    </div>
  );

  const qIdx = phase==='done' ? 7 : +phase.replace('q','');

  if (phase!=='done') {
    const q = QUESTIONS[qIdx];
    const isLast = qIdx===6;
    const isPrinciple = qIdx===4;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
        <Progress round={qIdx}/>
        <div style={cs.card}>
          <div style={cs.label}>{q.label}</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 16px"}}>{q.prompt}</p>
          {isPrinciple && (
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
              {PRINCIPLES.map((p,i)=>(
                <button key={i} onClick={()=>setPrinciple(p)} style={{padding:"7px 14px",borderRadius:20,border:`0.5px solid ${principle===p?T.gold:T2.border}`,background:principle===p?"rgba(138,158,132,0.12)":"transparent",color:principle===p?T.gold:T2.text3,fontSize:12,fontWeight:principle===p?700:400,cursor:"pointer",fontFamily:T.sans,transition:"all 0.15s"}}>{p}</button>
              ))}
            </div>
          )}
          <textarea
            value={answers[qIdx]}
            onChange={e=>{const n=[...answers];n[qIdx]=e.target.value;setAnswers(n);}}
            placeholder={q.placeholder}
            style={{width:"100%",minHeight:isDesktop?100:85,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}
          />
          {answers[qIdx].trim().length>5 && qIdx===6 && (
            <div style={{marginTop:12,padding:"12px 14px",background:"rgba(138,158,132,0.07)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0,lineHeight:1.6}}>Say it out loud. That's the communicator you are becoming.</p>
            </div>
          )}
        </div>
        <button
          onClick={()=>setPhase(isLast?'done':('q'+(qIdx+1)))}
          disabled={answers[qIdx].trim().length<3}
          style={{...cs.cta,background:answers[qIdx].trim().length<3?"rgba(44,36,22,0.25)":T.ink,cursor:answers[qIdx].trim().length<3?"not-allowed":"pointer"}}>
          {isLast?"Complete My Reflection →":(`Reflection ${qIdx+2} →`)}
        </button>
        {qIdx>0 && <button onClick={()=>setPhase('q'+(qIdx-1))} style={{background:"none",border:"none",fontFamily:T.sans,fontSize:12,color:T2.text4,cursor:"pointer",padding:"4px 0",textAlign:"left"}}>← Back</button>}
      </div>
    );
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"32px":"24px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Reflection Complete</div>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>You know who you're becoming.</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:"#A8998A",lineHeight:1.65,margin:"0 0 20px"}}>Your reflections are the foundation of your Communication Blueprint. Head to the Simulation tab to generate it.</p>
        {answers[6].trim() && (
          <div style={{padding:"16px 20px",background:T2.bg,borderRadius:6,border:"0.5px solid rgba(138,158,132,0.3)",marginBottom:16}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Your Vision</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>"{answers[6]}"</p>
          </div>
        )}
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>"You are not the communicator you were 14 days ago."</p>
      </div>
      <button onClick={()=>setPhase('intro')} style={{...cs.cta,background:"transparent",border:"0.5px solid "+T2.border,color:T2.text}}>Review My Reflections</button>
    </div>
  );
}

// ─── D14 Simulation Widget — Communication Blueprint ──────────────────────
export function D14SimWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('intro');
  const [role, setRole] = useState('');
  const [strengths, setStrengths] = useState(['','','']);
  const [growthArea, setGrowthArea] = useState('');
  const [ambition, setAmbition] = useState('');
  const [archetype, setArchetype] = useState('');
  const [blueprint, setBlueprint] = useState(null);

  const ARCHETYPES = ["Trusted Expert","Strategic Leader","Inspiring Storyteller","Influential Operator","Visionary Communicator"];

  const cs = {
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
    cta:(d)=>({width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:d?"rgba(44,36,22,0.25)":T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:d?"not-allowed":"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"}),
  };

  const generateBlueprint = () => {
    const s = strengths.filter(s=>s.trim());
    const arch = archetype || ARCHETYPES[0];
    const daily = [
      `Use the PRE framework (Point, Reason, Example) in your next ${role||"professional"} conversation.`,
      `Pause for one full second before you answer any difficult question.`,
      `Notice one moment each day where you could have communicated more clearly — and write it down.`,
    ];
    const weekly = [
      `Tell one SAR story (Situation, Action, Result) in a meeting or conversation.`,
      `Share your ambition — "${ambition||"where you're going"}" — with one senior stakeholder.`,
      `Review: what communication moment this week am I most proud of? What would I do differently?`,
    ];
    const monthly = [
      `Record yourself speaking for two minutes on a professional topic. Watch it back.`,
      `Reach out to one person in your network you haven't spoken to in 3+ months.`,
      `Revisit one AmplifyU module that felt most relevant to your current challenge.`,
    ];
    const conversations = [
      `A conversation where you share your ambition clearly with someone who can help.`,
      `A conversation where you apply full PRE structure from start to finish.`,
      `A conversation where you practise deliberate presence — stillness, eye contact, grounded energy.`,
    ];
    const opportunities = [
      `Volunteer to present or speak in the next relevant context — internal meeting, team briefing, or senior update.`,
      `Identify one stakeholder who doesn't know your ${s[0]||"greatest strength"} and create a reason to show them.`,
      `Start one visible project or initiative that gives your ${arch.toLowerCase()} positioning a platform.`,
    ];
    setBlueprint({ arch, daily, weekly, monthly, conversations, opportunities,
      brandStatement:`I am a ${role||"professional"} known for ${s.slice(0,2).join(" and ").toLowerCase()||"clarity and impact"}. I am building toward ${ambition||"the next level of my career"} — and I communicate my value with intention, clarity, and confidence.`,
      profileSummary:`Your responses reveal a communicator who is ${s[0]?.toLowerCase()||"capable"}, ${s[1]?.toLowerCase()||"ambitious"}, and committed to growth. Your primary growth edge is ${growthArea||"continued deliberate practice"}. Your communication archetype — ${arch} — reflects both who you are today and the direction you are moving in.`,
    });
    setPhase('results');
  };

  if (phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Communication Blueprint</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 12px"}}>You have spent 14 days developing your communication. Now turn those insights into a system you'll use every day.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0}}>Your AmplifyU coach will analyse your profile and generate: your Communication Archetype, a personal Brand Statement, daily and weekly habits, and your 90-Day Action Plan.</p>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>What you'll receive</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {["Your Communication Profile and Archetype","Your personal Brand Statement","Daily, weekly and monthly communication habits","Three conversations to have in the next 30 days","Three opportunities to create in the next 90 days","Your 90-Day Action Plan"].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:2}}>✦</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=>setPhase('form')} style={cs.cta(false)}>Build My Blueprint →</button>
    </div>
  );

  if (phase==='form') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Profile</div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Your role or title</div>
            <input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Marketing Director, Senior Consultant, Head of Product" className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Three communication strengths you've built</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {strengths.map((s,i)=>(
                <input key={i} value={s} onChange={e=>{const n=[...strengths];n[i]=e.target.value;setStrengths(n);}} placeholder={["e.g. Clarity and structure","e.g. Storytelling","e.g. Visible ambition"][i]} className="au-input" style={{width:"100%",padding:"9px 12px",fontSize:isDesktop?13:12,boxSizing:"border-box"}}/>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Your biggest growth opportunity</div>
            <input value={growthArea} onChange={e=>setGrowthArea(e.target.value)} placeholder="e.g. Vocal presence, senior stakeholder confidence, making ambition visible" className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Your ambition in one sentence</div>
            <input value={ambition} onChange={e=>setAmbition(e.target.value)} placeholder="e.g. Become Head of Strategy within two years" className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Choose your Communication Archetype</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {ARCHETYPES.map((a,i)=>(
                <button key={i} onClick={()=>setArchetype(a)} style={{padding:"11px 14px",borderRadius:4,border:`0.5px solid ${archetype===a?T.gold:T2.border}`,background:archetype===a?"rgba(138,158,132,0.08)":"transparent",color:archetype===a?T.gold:T2.text,fontSize:isDesktop?14:13,fontFamily:T.serif,fontStyle:"italic",textAlign:"left",cursor:"pointer",transition:"all 0.2s"}}>{a}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button onClick={generateBlueprint} disabled={!role.trim()||!strengths[0].trim()} style={cs.cta(!role.trim()||!strengths[0].trim())}>Generate My Blueprint →</button>
      <button onClick={()=>setPhase('intro')} style={{background:"none",border:"none",fontFamily:T.sans,fontSize:12,color:T2.text4,cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
    </div>
  );

  if (phase==='results' && blueprint) return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>

      <div style={{...cs.card,background:"rgba(138,158,132,0.06)",border:"0.5px solid rgba(138,158,132,0.3)"}}>
        <div style={cs.label}>Your Communication Archetype</div>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?28:22,fontWeight:600,color:T.gold,marginBottom:10}}>{blueprint.arch}</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0}}>{blueprint.profileSummary}</p>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>Your Personal Brand Statement</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:"0 0 10px"}}>{blueprint.brandStatement}</p>
        <p style={{fontFamily:T.sans,fontSize:12,color:T2.text4,margin:0,lineHeight:1.6}}>Use this as your starting point. Refine it in your own voice — then own it.</p>
      </div>

      {[
        {label:"Daily Habits", items:blueprint.daily, note:"Do these every day. Consistency beats intensity."},
        {label:"Weekly Habits", items:blueprint.weekly, note:"Set a reminder. Keep the momentum."},
        {label:"Monthly Habits", items:blueprint.monthly, note:"Step back. Review. Recommit."},
      ].map((section,si)=>(
        <div key={si} style={cs.card}>
          <div style={cs.label}>{section.label}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:10}}>
            {section.items.map((item,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{width:20,height:20,borderRadius:"50%",border:"1px solid rgba(138,158,132,0.4)",background:"rgba(138,158,132,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                  <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold}}>{i+1}</span>
                </div>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.6}}>{item}</span>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.sans,fontSize:11,fontStyle:"italic",color:T2.text4,margin:0}}>{section.note}</p>
        </div>
      ))}

      <div style={cs.card}>
        <div style={cs.label}>Your 90-Day Action Plan</div>
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Three conversations to initiate</div>
          {blueprint.conversations.map((c,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:i<2?10:0,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:2}}>→</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.6}}>{c}</span>
            </div>
          ))}
        </div>
        <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14}}>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Three opportunities to create</div>
          {blueprint.opportunities.map((o,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:i<2?10:0,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:2}}>→</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.6}}>{o}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)",textAlign:"center"}}>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,lineHeight:1.5,margin:"0 0 12px"}}>You are not the communicator you were 14 days ago.</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.5}}>And this is only the beginning.</p>
      </div>

      <button onClick={()=>{setPhase('intro');setBlueprint(null);setRole('');setStrengths(['','','']);setGrowthArea('');setAmbition('');setArchetype('');}} style={{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:isDesktop?14:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Build Another Blueprint</button>
    </div>
  );

  return null;
}
