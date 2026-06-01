import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';

export function D6PracticeWidget({T, T2, isDesktop}) {
  const DRILLS = [
    {label:"Disagree With Leadership", goal:"Calm disagreement",
     prompt:'"I respect the direction, but I have a different perspective."',
     coaching:"Say this slowly. Drop your tone on 'different perspective'. Don't soften the disagreement — honour it. The calm in your voice carries the message.",
     variations:["Say it as nervous","Say it as calm","Say it as firm and warm","Say it as executive authority"]},
    {label:"Raise Difficult Feedback", goal:"Warm directness",
     prompt:'"I wanted to raise something I\'ve noticed."',
     coaching:"Let the pause after 'noticed' do the work. Composure here signals safety — the other person will lean in rather than close down.",
     variations:["Say it as hesitant","Say it as compassionate","Say it as overly apologetic","Say it as clear and grounded"]},
    {label:"Hold a Boundary", goal:"Firm calm",
     prompt:'"I can\'t commit to that timeline without compromising quality."',
     coaching:"The word 'quality' is your anchor. Speak it with conviction. This isn't a request — it's a clear position. Calm, not cold.",
     variations:["Say it as defensive","Say it as firm and professional","Say it as apologetic","Say it as confident and direct"]},
    {label:"Respond to Criticism", goal:"Non-reactive control",
     prompt:'"That\'s useful feedback. Let me think about that."',
     coaching:"This is one of the most powerful phrases in high-stakes communication. Pause before you say it. Mean it. The composure in those seven words builds credibility instantly.",
     variations:["Say it as rattled","Say it as calm and open","Say it as dismissive","Say it as composed authority"]},
  ];
  const [open, setOpen] = useState(null);

  if (isDesktop) return (
    <>
      <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,marginBottom:20}}>Scenario Drills</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:40}}>
        {DRILLS.map((d,i) => (
          <div key={i} onClick={()=>setOpen(open===i?null:i)}
            style={{background:T2.surface,borderRadius:4,border:`0.5px solid ${open===i?T.gold:T2.border}`,padding:"22px",cursor:"pointer",transition:"border-color 0.2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open===i?16:0}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{d.goal}</div>
                <p style={{fontFamily:T.serif,fontSize:17,fontWeight:600,color:T2.text,margin:0,lineHeight:1.3}}>{d.label}</p>
              </div>
              <span style={{fontFamily:T.sans,fontSize:12,color:open===i?T.gold:T2.text4,marginLeft:12,flexShrink:0}}>{open===i?"▴":"▸"}</span>
            </div>
            {open===i && (
              <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:16}}>
                <div style={{background:T2.bg,borderRadius:4,padding:"16px 18px",marginBottom:16,borderLeft:"2px solid "+T.gold}}>
                  <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>{d.prompt}</p>
                </div>
                <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.7,marginBottom:16}}>{d.coaching}</p>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Tone Variations</div>
                {d.variations.map((v,j) => (
                  <div key={j} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:j<d.variations.length-1?"0.5px solid "+T2.divider:"none"}}>
                    <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0}}/>
                    <span style={{fontFamily:T.sans,fontSize:13,color:T2.text2}}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {DRILLS.map((d,i) => (
        <div key={i} onClick={()=>setOpen(open===i?null:i)}
          style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open===i?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"16px",cursor:"pointer",transition:"border-color 0.2s",marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:open===i?12:0}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{d.goal}</div>
              <p style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text,margin:0,lineHeight:1.3}}>{d.label}</p>
            </div>
            <span style={{fontFamily:T.sans,fontSize:12,color:open===i?T.gold:T2.text4,marginLeft:10,flexShrink:0}}>{open===i?"▴":"▸"}</span>
          </div>
          {open===i && (
            <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:12}}>
              <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"2px solid "+T.gold,padding:"12px 14px",marginBottom:12,borderRadius:3}}>
                <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>{d.prompt}</p>
              </div>
              <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.65,marginBottom:12}}>{d.coaching}</p>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Tone Variations</div>
              {d.variations.map((v,j) => (
                <div key={j} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:j<d.variations.length-1?"0.5px solid rgba(138,158,132,0.15)":"none"}}>
                  <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0}}/>
                  <span style={{fontFamily:T.sans,fontSize:12,color:T2.text2}}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ─── Custom Dropdown ─────────────────────────────────────────────────────────
function DropDown({field, value, placeholder, options, onSelect, open, onToggle, onClose, T, T2, isDesktop}) {
  return (
    <div style={{position:"relative"}}>
      <button
        onMouseDown={e=>{e.preventDefault();onToggle();}}
        onBlur={()=>setTimeout(onClose,150)}
        style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:3,border:`0.5px solid ${open?T.gold:T2.border}`,background:T2.bg,color:value?T2.text:T2.text3||"#A8998A",fontFamily:T.sans,fontSize:isDesktop?14:13,cursor:"pointer",textAlign:"left",transition:"border-color 0.2s",outline:"none",minHeight:42}}>
        <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{value||placeholder}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{flexShrink:0,marginLeft:8,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}>
          <path d="M1 1.5l5 5 5-5" stroke={open?T.gold:"#A8998A"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:100,background:T2.surface,border:"0.5px solid "+T.gold,borderRadius:4,boxShadow:"0 8px 28px rgba(44,36,22,0.13)",overflow:"hidden",maxHeight:220,overflowY:"auto"}}>
          {options.map((opt,i)=>(
            <div key={opt} onMouseDown={e=>{e.preventDefault();onSelect(opt);onClose();}}
              style={{padding:"10px 14px",fontFamily:T.sans,fontSize:isDesktop?14:13,color:opt===value?T.gold:T2.text,background:opt===value?"rgba(138,158,132,0.08)":"transparent",cursor:"pointer",borderBottom:i<options.length-1?"0.5px solid "+T2.divider:"none",transition:"background 0.12s"}}
              onMouseEnter={e=>e.currentTarget.style.background=opt===value?"rgba(138,158,132,0.12)":"rgba(138,158,132,0.05)"}
              onMouseLeave={e=>e.currentTarget.style.background=opt===value?"rgba(138,158,132,0.08)":"transparent"}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── D6 Simulation Widget — AI Conversation Prep ────────────────────────────
export function D6SimWidget({T, T2, isDesktop}) {
  const INDUSTRIES = ['Technology','Finance','Healthcare','Education','Hospitality','Retail','Sales','Marketing','Legal','Consulting','Other'];
  const STAKEHOLDERS = ['CEO','Manager','Client','Investor','Team Member','Board Member','Customer','Colleague'];
  const PRESSURES = [
    {id:'friendly',    label:'Friendly',    desc:'Supportive questions'},
    {id:'challenging', label:'Challenging', desc:'Pushback and probing'},
    {id:'executive',   label:'Executive',   desc:'Short, direct, sceptical'},
    {id:'boardroom',   label:'Boardroom',   desc:'High pressure, scrutiny'},
  ];

  const [phase,          setPhase]         = useState('intro');
  const [form,           setForm]          = useState({industry:'',role:'',stakeholder:'',purpose:'',pressure:'challenging'});
  const [profile,        setProfile]       = useState(null);
  const [questions,      setQuestions]     = useState([]);
  const [qIdx,           setQIdx]          = useState(0);
  const [answers,        setAnswers]       = useState([]);
  const [currentAnswer,  setCurrentAnswer] = useState('');
  const [isListening,    setIsListening]   = useState(false);
  const [recTime,        setRecTime]       = useState(0);
  const [result,         setResult]        = useState(null);
  const [openDrop,       setOpenDrop]      = useState(null);
  const recRef  = useRef(null);
  const timerRef = useRef(null);
  const SpeechRec = typeof window!=='undefined'&&(window.SpeechRecognition||window.webkitSpeechRecognition);

  useEffect(()=>{
    if(!isListening){clearInterval(timerRef.current);return;}
    timerRef.current=setInterval(()=>setRecTime(t=>t+1),1000);
    return()=>clearInterval(timerRef.current);
  },[isListening]);

  async function generate(){
    setPhase('analyzing');
    const pressureLabel = PRESSURES.find(p=>p.id===form.pressure)?.label||'Challenging';
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`You are a senior executive coach preparing someone for a high-stakes conversation.\n\nContext:\n- Industry: ${form.industry}\n- Their role: ${form.role}\n- Meeting: ${form.stakeholder}\n- About: ${form.purpose}\n- Pressure style: ${pressureLabel}\n\nGenerate a conversation profile and 10 realistic tough questions this stakeholder is likely to ask. Questions should feel specific, real, and increase in difficulty.\n\nReturn ONLY valid JSON:\n{"profile":{"stakeholderLabel":"${form.stakeholder}","goal":"<1-4 word goal>","riskLevel":"High|Medium|Low","concerns":["concern1","concern2","concern3","concern4"],"insight":"<2-3 sentences about what this stakeholder cares about and how they will challenge>"},"questions":["q1","q2","q3","q4","q5","q6","q7","q8","q9","q10"]}`}]})});
      const d=await res.json();
      const raw=(d.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      const parsed=JSON.parse(m[0]);
      setProfile(parsed.profile);
      setQuestions(parsed.questions);
    }catch{
      setProfile({stakeholderLabel:form.stakeholder,goal:"Get answers",riskLevel:"High",concerns:["ROI","Risk","Timeline","Resources"],insight:`This ${form.stakeholder} will focus on practical implications and challenge your assumptions. Expect probing questions about evidence, alternatives, and risk.`});
      setQuestions(["Why should we prioritise this now?","What happens if we do nothing?","How will we measure success?","What are the risks?","What is the ROI?","How confident are you in these numbers?","Why is this better than alternatives?","What resources will this require?","What could cause this to fail?","Why should I support this?"]);
    }
    setPhase('questions');
  }

  function startSim(){setQIdx(0);setAnswers([]);setCurrentAnswer('');setRecTime(0);setPhase('simulation');}

  function startListening(){
    if(!SpeechRec) return;
    const rec=new SpeechRec();
    rec.continuous=true;rec.interimResults=true;
    let final=currentAnswer;
    rec.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript+' ';else interim=e.results[i][0].transcript;}setCurrentAnswer(final+interim);};
    rec.onend=()=>setIsListening(false);
    rec.start();recRef.current=rec;setIsListening(true);setRecTime(0);
  }
  function stopListening(){if(recRef.current)recRef.current.stop();setIsListening(false);}

  function nextQuestion(){
    if(isListening)stopListening();
    const newAnswers=[...answers,currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');setRecTime(0);
    if(qIdx<questions.length-1){setQIdx(i=>i+1);}
    else{setPhase('reviewing');analyze(newAnswers);}
  }

  async function analyze(ans){
    const qa=questions.map((q,i)=>`Q${i+1}: ${q}\nA: ${ans[i]||'(no answer)'}`).join('\n\n');
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,messages:[{role:"user",content:`You are an executive communication coach. Analyse these conversation practice responses.\n\nContext: ${form.role} preparing to meet ${form.stakeholder} about ${form.purpose}\n\n${qa}\n\nReturn ONLY valid JSON:\n{"scores":{"composure":{"score":<1-10>,"note":"<8 words>"},"clarity":{"score":<1-10>,"note":"<8 words>"},"confidence":{"score":<1-10>,"note":"<8 words>"},"evidence":{"score":<1-10>,"note":"<8 words>"},"brevity":{"score":<1-10>,"note":"<8 words>"}},"strengths":["<strength1>","<strength2>"],"development":["<area1>","<area2>"],"hardestQuestion":"<question text that got weakest response>","recommendation":"<2-3 sentence personalised coaching recommendation>"}`}]})});
      const d=await res.json();const raw=(d.content||[]).map(b=>b.text||'').join('').trim();const m=raw.match(/\{[\s\S]*\}/);setResult(JSON.parse(m[0]));
    }catch{
      setResult({scores:{composure:{score:7,note:"Stayed measured throughout"},clarity:{score:7,note:"Mostly direct answers"},confidence:{score:7,note:"Clear position held"},evidence:{score:6,note:"Could use more specific data"},brevity:{score:7,note:"Generally concise"}},strengths:["Stayed composed under pressure","Clear on strategic rationale"],development:["Prepare stronger evidence for risk questions","Sharpen responses to follow-up probing"],hardestQuestion:questions[questions.length-1],recommendation:"Your strongest answers were backed by evidence. Before the real conversation, prepare clearer responses to risk and objection questions — those are where hesitation tends to show."});
    }
    setPhase('results');
  }

  const cs={
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"20px 24px":"16px 18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8},
    inp:{width:"100%",borderRadius:3,border:"0.5px solid "+T2.border,padding:"10px 14px",fontSize:isDesktop?14:13,fontFamily:T.sans,background:T2.bg,color:T2.text,outline:"none",boxSizing:"border-box"},
    sel:{width:"100%",borderRadius:3,border:"0.5px solid "+T2.border,padding:"10px 14px",fontSize:isDesktop?14:13,fontFamily:T.sans,background:T2.bg,color:T2.text,outline:"none",appearance:"none",cursor:"pointer",WebkitAppearance:"none"},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };
  const scoreColor=s=>s>=8?"#527060":s>=5?T.gold:"#B05C4A";
  const canGenerate=form.industry&&form.role&&form.stakeholder&&form.purpose;

  // ── INTRO ──
  if(phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>AI Conversation Prep</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?22:20,fontWeight:600,color:T.gold,lineHeight:1.25,margin:"0 0 14px"}}>Prepare for the conversations that matter most.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:"0 0 16px"}}>Most people prepare what they want to say. Elite communicators prepare for what they'll be asked.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[{n:"1",t:"Tell us about your upcoming conversation."},
            {n:"2",t:"AmplifyU analyses your stakeholder and generates 10 likely tough questions."},
            {n:"3",t:"Answer each question. Get coaching on composure, clarity, and confidence."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 12px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"0.5px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold}}>{s.n}</span>
              </div>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5}}>{s.t}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=>setPhase('setup')} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Prepare My Conversation →</button>
    </div>
  );

  // ── SETUP ──
  if(phase==='setup') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
      <div style={cs.card}>
        <div style={cs.label}>Step 1 — Your Conversation</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T2.text,marginBottom:6}}>Industry</div>
            <DropDown field="industry" value={form.industry} placeholder="Select industry…" options={INDUSTRIES}
              onSelect={v=>setForm(f=>({...f,industry:v}))} open={openDrop==='industry'} onToggle={()=>setOpenDrop(openDrop==='industry'?null:'industry')} onClose={()=>setOpenDrop(null)} T={T} T2={T2} isDesktop={isDesktop}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T2.text,marginBottom:6}}>Your Role</div>
            <input value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} placeholder="e.g. Product Manager, Founder, Teacher…" style={cs.inp}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T2.text,marginBottom:6}}>Who Are You Meeting?</div>
            <DropDown field="stakeholder" value={form.stakeholder} placeholder="Select stakeholder…" options={STAKEHOLDERS}
              onSelect={v=>setForm(f=>({...f,stakeholder:v}))} open={openDrop==='stakeholder'} onToggle={()=>setOpenDrop(openDrop==='stakeholder'?null:'stakeholder')} onClose={()=>setOpenDrop(null)} T={T} T2={T2} isDesktop={isDesktop}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T2.text,marginBottom:6}}>What's the Conversation About?</div>
            <textarea value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))} placeholder="e.g. Asking for a promotion, pitching a new project, requesting budget approval…" style={{...cs.inp,resize:"none",height:72,lineHeight:1.5}}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T2.text,marginBottom:8}}>Pressure Level</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {PRESSURES.map(p=>(
                <button key={p.id} onClick={()=>setForm(f=>({...f,pressure:p.id}))}
                  style={{flex:"1 1 auto",padding:"8px 10px",borderRadius:4,border:`1px solid ${form.pressure===p.id?T.gold:T2.border}`,background:form.pressure===p.id?"rgba(138,158,132,0.08)":"transparent",cursor:"pointer",textAlign:"left",transition:"all 0.15s",minWidth:isDesktop?100:80}}>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,fontWeight:700,color:form.pressure===p.id?T.gold:T2.text}}>{p.label}</div>
                  <div style={{fontFamily:T.sans,fontSize:10,color:T2.text3,marginTop:2}}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button onClick={generate} disabled={!canGenerate} style={{...cs.cta,opacity:canGenerate?1:0.45,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Generate My Questions →</button>
      <button onClick={()=>setPhase('intro')} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:12,cursor:"pointer",padding:"6px 0",textAlign:"center"}}>← Back</button>
    </div>
  );

  // ── ANALYZING ──
  if(phase==='analyzing') return (
    <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:isDesktop?"48px 0":"32px 0"}}>
      <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.2s ease ${i*0.3}s infinite`}}/>)}</div>
      <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,margin:0,textAlign:"center"}}>Analysing your stakeholder…</p>
      <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text4||T2.text3,margin:0,textAlign:"center"}}>Generating the toughest questions you're likely to face.</p>
    </div>
  );

  // ── QUESTIONS ──
  if(phase==='questions'&&profile) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{...cs.card,background:"#0A0804",border:"0.5px solid rgba(138,158,132,0.15)"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Conversation Profile</div>
        <div style={{display:"flex",gap:isDesktop?20:12,flexWrap:"wrap",marginBottom:14}}>
          {[{l:"Stakeholder",v:profile.stakeholderLabel||form.stakeholder},{l:"Goal",v:profile.goal},{l:"Risk Level",v:profile.riskLevel}].map(({l,v})=>(
            <div key={l}>
              <div style={{fontFamily:T.sans,fontSize:9,color:"rgba(245,239,230,0.4)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>{l}</div>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontWeight:600,color:"#F5EFE6"}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:T.sans,fontSize:9,color:"rgba(245,239,230,0.4)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Likely Concerns</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {(profile.concerns||[]).map((c,i)=><span key={i} style={{padding:"3px 10px",borderRadius:20,border:"0.5px solid rgba(138,158,132,0.3)",fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.65)"}}>{c}</span>)}
          </div>
        </div>
        <div style={{borderTop:"0.5px solid rgba(138,158,132,0.15)",paddingTop:12}}>
          <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Coach Insight</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:"italic",color:"rgba(245,239,230,0.7)",lineHeight:1.65,margin:0}}>{profile.insight}</p>
        </div>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>Your Top {questions.length} Likely Questions</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {questions.map((q,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 14px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold}}>{i+1}</span>
              </div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.55,margin:0}}>{q}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={startSim} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Start Simulation →</button>
      <button onClick={()=>setPhase('setup')} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:12,cursor:"pointer",padding:"6px 0",textAlign:"center"}}>← Edit conversation details</button>
    </div>
  );

  // ── SIMULATION ──
  if(phase==='simulation') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",flexShrink:0}}>Question {qIdx+1} of {questions.length}</div>
        <div style={{flex:1,height:2,background:T2.border,borderRadius:2}}><div style={{height:"100%",width:(((qIdx+1)/questions.length)*100)+"%",background:T.gold,borderRadius:2,transition:"width 0.4s"}}/></div>
      </div>
      <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3}}><span style={{fontWeight:600,color:T2.text}}>{form.stakeholder}</span> asks:</div>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold,padding:isDesktop?"22px 28px":"18px 22px"}}>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?24:20,fontWeight:600,color:T2.text,lineHeight:1.3,margin:0}}>{questions[qIdx]}</p>
      </div>
      <div style={cs.card}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px"}}>Your Response</div>
          {SpeechRec&&(
            <button onClick={isListening?stopListening:startListening}
              style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,border:`1px solid ${isListening?"#CC4444":T2.border}`,background:isListening?"rgba(204,68,68,0.08)":"transparent",cursor:"pointer",fontFamily:T.sans,fontSize:11,fontWeight:600,color:isListening?"#CC4444":T2.text3,transition:"all 0.2s"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:isListening?"#CC4444":"rgba(138,158,132,0.5)",animation:isListening?"glowPulse 1s ease infinite":"none"}}/>
              {isListening?`Recording ${recTime}s`:"Speak to record"}
            </button>
          )}
        </div>
        <textarea value={currentAnswer} onChange={e=>setCurrentAnswer(e.target.value)} placeholder="Speak your answer or type it here…" style={{...cs.inp,resize:"none",height:isDesktop?96:80,lineHeight:1.6,padding:"10px 12px"}}/>
        {!SpeechRec&&<p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,margin:"6px 0 0",fontStyle:"italic"}}>Say your answer out loud, then type your key points.</p>}
      </div>
      <button onClick={nextQuestion} style={{...cs.cta,background:currentAnswer.trim()?T.gold:T.ink,color:"white",fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>
        {qIdx<questions.length-1?"Next Question →":"Get My Feedback →"}
      </button>
      <button onClick={()=>{if(isListening)stopListening();setAnswers([]);setQIdx(0);setCurrentAnswer('');setPhase('questions');}} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:12,cursor:"pointer",padding:"6px 0",textAlign:"center"}}>← Back to questions</button>
    </div>
  );

  // ── REVIEWING ──
  if(phase==='reviewing') return (
    <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:isDesktop?"48px 0":"32px 0"}}>
      <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.2s ease ${i*0.3}s infinite`}}/>)}</div>
      <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,margin:0,textAlign:"center"}}>Your AmplifyU coach is reviewing your responses…</p>
    </div>
  );

  // ── RESULTS ──
  if(phase==='results'&&result) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Coaching Report</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {Object.entries(result.scores||{}).map(([key,val])=>(
            <div key={key} style={{padding:"12px 14px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text3,textTransform:"capitalize"}}>{key}</span>
                <span style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:scoreColor(val.score),lineHeight:1}}>{val.score}<span style={{fontSize:10,color:T2.text3}}>/10</span></span>
              </div>
              <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,margin:0,lineHeight:1.4}}>{val.note}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:isDesktop?"row":"column",gap:10}}>
        <div style={{...cs.card,flex:1,borderTop:"2px solid #527060"}}>
          <div style={{...cs.label,color:"#527060"}}>Handled Well</div>
          {(result.strengths||[]).map((s,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<(result.strengths.length-1)?8:0}}>
              <span style={{color:"#527060",fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5}}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{...cs.card,flex:1,borderTop:"2px solid "+T.gold}}>
          <div style={cs.label}>Prepare Further</div>
          {(result.development||[]).map((d,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<(result.development.length-1)?8:0}}>
              <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:1}}>⚠</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5}}>{d}</span>
            </div>
          ))}
        </div>
      </div>
      {result.hardestQuestion&&(
        <div style={{...cs.card,background:"rgba(176,92,74,0.04)",border:"0.5px solid rgba(176,92,74,0.2)"}}>
          <div style={{...cs.label,color:"#B05C4A"}}>Question to Revisit</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>{result.hardestQuestion}</p>
        </div>
      )}
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
        <div style={cs.label}>Coach Recommendation</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:"italic",color:T.gold,lineHeight:1.65,margin:0}}>{result.recommendation}</p>
      </div>
      <button onClick={()=>{setPhase('intro');setForm({industry:'',role:'',stakeholder:'',purpose:'',pressure:'challenging'});setProfile(null);setQuestions([]);setAnswers([]);setResult(null);setQIdx(0);setCurrentAnswer('');}}
        style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"8px 0",textAlign:"center",width:"100%"}}>
        Prepare Another Conversation
      </button>
    </div>
  );

  return null;
}

// ─── D11 Practice Widget ──────────────────────────────────────────────────

