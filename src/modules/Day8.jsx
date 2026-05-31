import { useState } from 'react';
import { T as Timport } from '../theme.js';

const T2D = {
  text:'#2C2416',text2:'#2C2416',text3:'#6B5E44',text4:'#A8998A',
  surface:'#EDE8DF',bg:'#F7F3EC',border:'#DDD5C4',divider:'#DDD5C4',cardDark:'#231E18',
};

export function StoryBuilderWidget({ T:Tp, T2:T2p, isDesktop=false, onSave, onSimulation }) {
  const T  = Tp  || Timport;
  const T2 = T2p || T2D;

  const BEATS = [
    { prompt:"Once Upon a Time…",  question:"Who is this story about?",                       hint:"Keep it simple.",                                        example:"I was leading a project at work.",            tip:"Set the scene. Just enough context — don't over-explain." },
    { prompt:"Every Day…",         question:"What was normal before everything changed?",      hint:"",                                                       example:"We delivered projects the same way every time.",  tip:"Stories need contrast. Show what life looked like before the problem appeared." },
    { prompt:"One Day…",           question:"What changed? This is the moment your story begins.", hint:"",                                                   example:"A major client threatened to leave.",         tip:"The sharper the disruption, the stronger the story." },
    { prompt:"Because of That…",   question:"What did you do?",                               hint:"",                                                       example:"We redesigned our entire process.",           tip:"Show your thinking. What choice did you make?" },
    { prompt:"Because of That…",   question:"What happened next?",                            hint:"",                                                       example:"The team started collaborating differently.",  tip:"Build the consequences. What changed as a result?" },
    { prompt:"Until Finally…",     question:"How did the story end?",                         hint:"",                                                       example:"We saved the client.",                        tip:"Resolution. Make it clear. Make it specific." },
    { prompt:"Ever Since Then…",   question:"What's the lesson?",                             hint:"This is the idea people should remember.",               example:"Growth comes from discomfort.",               tip:"One clear idea. The takeaway that stays with your audience." },
  ];

  const CATS = [
    { id:'success',    emoji:'🏆', label:'Success',        desc:"A moment you're proud of." },
    { id:'challenge',  emoji:'🚧', label:'Challenge',       desc:"A difficult situation you overcame." },
    { id:'lesson',     emoji:'💡', label:'Lesson Learned',  desc:"Something that changed how you think." },
    { id:'leadership', emoji:'🤝', label:'Leadership',      desc:"A time you influenced or helped others." },
    { id:'failure',    emoji:'⚡', label:'Failure',         desc:"A mistake that taught you something valuable." },
  ];

  const [phase,      setPhase]     = useState('landing');
  const [beatIndex,  setBeatIndex] = useState(0);
  const [beats,      setBeats]     = useState(Array(7).fill(''));
  const [genResult,  setGenResult] = useState(null);

  const b           = BEATS[beatIndex];
  const currentBeat = beats[beatIndex];
  const canContinue = currentBeat.trim().length > 0;

  const PROMPTS = ["Once upon a time,","Every day,","One day,","Because of that,","Because of that,","Until finally,","Ever since then,"];

  function updateBeat(val) {
    setBeats(prev => { const n=[...prev]; n[beatIndex]=val; return n; });
  }
  function goNext() {
    if (beatIndex < 6) setBeatIndex(i=>i+1);
    else { setPhase('complete'); if(onSave) onSave(beats.join('\n')); }
  }
  function goBack() {
    if (beatIndex > 0) setBeatIndex(i=>i-1);
    else setPhase('choose');
  }
  function restart() { setPhase('landing'); setBeatIndex(0); setBeats(Array(7).fill('')); setGenResult(null); }

  async function generateStory() {
    setPhase('generating');
    const beatLines = BEATS.map((bt,i)=>`${bt.prompt.replace('…','')}: "${beats[i]}"`).join('\n');
    const mock = {
      beats: beats.map((raw,i)=>`${PROMPTS[i]} ${raw.trim().charAt(0).toLowerCase()+raw.trim().slice(1).replace(/\.$/,'')}.`),
      improvements:[
        "Added scene-setting language to immerse the listener immediately.",
        "Established the 'normal world' — essential contrast before the disruption.",
        "Sharpened the inciting incident so the shift feels sudden and real.",
        "Made the action concrete — showing decision, not just reaction.",
        "Linked cause and effect explicitly, building narrative momentum.",
        "Grounded the resolution in a specific, tangible outcome.",
        "Distilled the lesson into a single transferable idea.",
      ],
      coachNote:"Your story has a clear arc and a strong core message. The AI expanded your raw ideas into vivid narrative beats.",
    };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:
          `You are a master storyteller and communication coach. A user has completed the Pixar story framework with raw answers. Expand each answer into a compelling 1-2 sentence beat, and explain what you improved for each one.\n\nTheir raw answers:\n${beatLines}\n\nRules:\n- Start each beat naturally with the Pixar prompt (e.g. "Once upon a time," / "Every day," / "One day," / "Because of that," / "Until finally," / "Ever since then,")\n- Stay true to their experience — don't invent new facts\n- Keep each beat to 1-2 sentences\n- Make improvements educational — name the storytelling principle applied\n\nReturn ONLY valid JSON:\n{"beats":["expanded beat 0","expanded beat 1","expanded beat 2","expanded beat 3","expanded beat 4","expanded beat 5","expanded beat 6"],"improvements":["why beat 0 improved","why beat 1 improved","why beat 2 improved","why beat 3 improved","why beat 4 improved","why beat 5 improved","why beat 6 improved"],"coachNote":"one sentence overall observation"}`
        }]}),
      });
      const d = await res.json();
      const raw = (d.content||[]).map(b=>b.text||'').join('').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m[0]);
      setGenResult(parsed);
    } catch {
      setGenResult(mock);
    }
    setPhase('generated');
  }

  // story strength
  const filled   = beats.filter(b=>b.trim().length>0);
  const avgWords = filled.length ? filled.reduce((s,b)=>s+b.trim().split(/\s+/).length,0)/filled.length : 0;
  const strength = {
    narrativeArc: Math.round((filled.length/7)*90+5),
    clarity:      Math.round(Math.min(92,Math.max(45,100-Math.max(0,(avgWords-12)*2.5)))),
    lesson:       beats[6].trim().length>3 ? Math.min(95,55+Math.min(40,beats[6].trim().split(/\s+/).length*4)) : 30,
    specificity:  Math.min(85,filled.length*12+(beats.some(b=>/\d/.test(b))?8:0)),
  };

  const cs = {
    card:  { background:T2.surface, borderRadius:8, border:"0.5px solid "+T2.border, padding:isDesktop?"28px 32px":"20px 22px" },
    label: { fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:8 },
    cta:   { width:"100%", padding:isDesktop?"16px":"14px", borderRadius:4, border:"none", background:T.ink, color:T.bg, fontSize:isDesktop?16:15, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:50, transition:"all 0.2s" },
    inp:   { width:"100%", padding:"14px 16px", border:"0.5px solid "+T2.border, borderRadius:4, outline:"none", background:T2.bg, fontSize:isDesktop?16:15, color:T2.text, lineHeight:1.6, fontFamily:T.sans, fontWeight:300, boxSizing:"border-box", resize:"none" },
    back:  { background:"none", border:"none", color:T2.text3, fontFamily:T.sans, fontSize:13, cursor:"pointer", padding:"4px 0", textAlign:"center", width:"100%" },
  };

  // ── LANDING ────────────────────────────────────────────────────────────────
  if (phase==='landing') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?20:16}}>
      <div style={cs.card}>
        <div style={cs.label}>Practice Challenge</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?32:26,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:14}}>Build Your Story</h2>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,color:T2.text,lineHeight:1.5,marginBottom:14}}>Turn a real experience into a memorable story.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.7,marginBottom:24,fontWeight:300}}>
          In the next 5 minutes, you'll transform a real moment from your life into a story using the Pixar Framework. By the end, you'll have a story you can use in presentations, interviews, meetings, and conversations.
        </p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28}}>
          {[{val:"5 mins",sub:"Estimated time"},{val:"1 story",sub:"Outcome"}].map((s,i)=>(
            <div key={i} style={{textAlign:"center",padding:isDesktop?"16px":"12px",background:T2.bg,borderRadius:6,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T.gold}}>{s.val}</div>
              <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,marginTop:4}}>{s.sub}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>setPhase('choose')} style={cs.cta}>Start Building →</button>
      </div>
    </div>
  );

  // ── CHOOSE CATEGORY ────────────────────────────────────────────────────────
  if (phase==='choose') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
      <div>
        <div style={cs.label}>Step 1 of 9</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:6}}>Choose Your Story</h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,fontWeight:300}}>Tap a card to continue</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {CATS.map(cat=>(
          <button key={cat.id} onClick={()=>{setPhase('building');setBeatIndex(0);}}
            style={{display:"flex",alignItems:"center",gap:isDesktop?16:14,padding:isDesktop?"18px 22px":"14px 18px",borderRadius:8,border:"0.5px solid "+T2.border,background:T2.surface,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?19:17,fontWeight:600,color:T2.text,marginBottom:3}}>{cat.label}</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:0,fontWeight:300}}>{cat.desc}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><path d="M4 8h8M8 4l4 4-4 4" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ))}
      </div>
    </div>
  );

  // ── BUILDING ───────────────────────────────────────────────────────────────
  if (phase==='building') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?20:16}}>
      {/* Progress bar */}
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {BEATS.map((_,i)=>(
          <div key={i} style={{height:6,borderRadius:3,flex:i===beatIndex?3:1,background:i<beatIndex?"rgba(82,112,96,0.8)":i===beatIndex?T.gold:"rgba(138,158,132,0.2)",transition:"all 0.3s ease"}}/>
        ))}
        <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,marginLeft:4,flexShrink:0,whiteSpace:"nowrap"}}>{beatIndex+1} / 7</span>
      </div>

      {/* Beat card */}
      <div style={{...cs.card,borderLeft:"3px solid "+T.gold,padding:isDesktop?"32px 36px":"22px 24px"}}>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?36:28,fontWeight:600,color:T.gold,lineHeight:1.1,marginBottom:16}}>{b.prompt}</div>
        <div style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T2.text,lineHeight:1.3,marginBottom:b.hint?8:20}}>{b.question}</div>
        {b.hint && <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,marginBottom:20,fontWeight:300}}>{b.hint}</p>}
        <textarea
          value={currentBeat}
          onChange={e=>updateBeat(e.target.value)}
          placeholder={"e.g. "+b.example}
          rows={3}
          style={cs.inp}
        />
      </div>

      {/* Story Tip */}
      <div style={{display:"flex",gap:12,alignItems:"flex-start",padding:"14px 18px",background:"rgba(138,158,132,0.06)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.2)"}}>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{flexShrink:0,marginTop:2}}><circle cx="9" cy="9" r="7.5" stroke={T.gold} strokeWidth="1.2"/><path d="M9 5.5v4M9 11.5v.5" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round"/></svg>
        <div>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>Story Tip</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:0,fontWeight:300}}>{b.tip}</p>
        </div>
      </div>

      <button onClick={goNext} disabled={!canContinue}
        style={{...cs.cta,opacity:canContinue?1:0.4,cursor:canContinue?"pointer":"default"}}>
        {beatIndex<6?"Continue →":"See My Story →"}
      </button>
      <button onClick={goBack} style={cs.back}>← Back</button>
    </div>
  );

  // ── COMPLETE ───────────────────────────────────────────────────────────────
  if (phase==='complete') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
      {/* Hero */}
      <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"28px 32px":"22px 24px",border:"0.5px solid rgba(138,158,132,0.2)"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>✨ Narrative Arc Created</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:8}}>Story Complete</h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.55)",lineHeight:1.6,margin:0,fontWeight:300}}>You've built a story you can use in presentations, interviews, meetings, and conversations.</p>
      </div>

      {/* Visual timeline */}
      <div style={cs.card}>
        <div style={cs.label}>Your Story Arc</div>
        <div style={{display:"flex",flexDirection:"column"}}>
          {BEATS.map((bt,i)=>(
            <div key={i} style={{display:"flex",gap:isDesktop?16:12,alignItems:"flex-start",paddingBottom:i<6?16:0,marginBottom:i<6?16:0,borderBottom:i<6?"0.5px solid "+T2.border:"none"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                <div style={{width:isDesktop?30:26,height:isDesktop?30:26,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"1.5px solid "+T.gold,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold}}>{i+1}</span>
                </div>
                {i<6&&<div style={{width:1,height:isDesktop?18:14,background:"rgba(138,158,132,0.3)",marginTop:4}}/>}
              </div>
              <div style={{flex:1,paddingTop:4}}>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?13:11,fontWeight:600,color:T.gold,marginBottom:3}}>{bt.prompt}</div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:beats[i].trim()?T2.text:T2.text3,lineHeight:1.5,margin:0,fontStyle:beats[i].trim()?"normal":"italic",fontWeight:300}}>
                  {beats[i].trim()||"(not filled in)"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core message */}
      {beats[6].trim()&&(
        <div style={{padding:isDesktop?"20px 24px":"16px 18px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"3px solid "+T.gold}}>
          <div style={cs.label}>Your Core Message</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>{beats[6]}</p>
        </div>
      )}

      {/* Strength bars */}
      <div style={cs.card}>
        <div style={cs.label}>Story Strength</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {label:"Narrative Arc", pct:strength.narrativeArc},
            {label:"Clarity",       pct:Math.round(strength.clarity)},
            {label:"Lesson",        pct:Math.round(strength.lesson)},
            {label:"Specificity",   pct:Math.round(strength.specificity)},
          ].map((bar,i)=>(
            <div key={i}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,fontWeight:400}}>{bar.label}</span>
                <span style={{fontFamily:T.sans,fontSize:12,color:T.gold,fontWeight:600}}>{bar.pct}%</span>
              </div>
              <div style={{height:6,background:T2.bg,borderRadius:3,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
                <div style={{height:"100%",width:bar.pct+"%",background:"linear-gradient(90deg,rgba(138,158,132,0.5),rgba(82,112,96,0.9))",borderRadius:3,transition:"width 1s ease"}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={generateStory} style={cs.cta}>Generate My Story →</button>
      <button onClick={()=>setPhase('insight')} style={{...cs.back,marginTop:2}}>Skip — Continue without AI →</button>
      <button onClick={restart} style={cs.back}>Start Over</button>
    </div>
  );

  // ── GENERATING ─────────────────────────────────────────────────────────────
  if (phase==='generating') return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:isDesktop?"60px 0":"44px 0",textAlign:"center"}}>
      <div style={{display:"flex",gap:6}}>
        {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.4s ease ${i*0.22}s infinite`}}/>)}
      </div>
      <p style={{fontFamily:T.serif,fontSize:isDesktop?22:18,color:T2.text,lineHeight:1.4,margin:0}}>Your AI story coach is writing…</p>
      <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,margin:0,fontWeight:300}}>Expanding your beats. Explaining the improvements.</p>
    </div>
  );

  // ── GENERATED ──────────────────────────────────────────────────────────────
  if (phase==='generated'&&genResult) return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
      {/* Header */}
      <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"24px 32px":"20px 22px",border:"0.5px solid rgba(138,158,132,0.2)"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>AI Coach · What I'd Recommend</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:10}}>Your Story, Crafted</h2>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:"italic",color:T.gold,lineHeight:1.6,margin:0}}>{genResult.coachNote}</p>
      </div>

      {/* Beat-by-beat comparison */}
      <div style={cs.card}>
        <div style={cs.label}>Your Draft → Expanded</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,fontWeight:300,lineHeight:1.6,marginBottom:20}}>See what changed and why — each improvement is a storytelling lesson.</p>
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {BEATS.map((bt,i)=>(
            <div key={i} style={{paddingBottom:i<6?20:0,marginBottom:i<6?20:0,borderBottom:i<6?"0.5px solid "+T2.border:"none"}}>
              {/* Beat label */}
              <div style={{fontFamily:T.serif,fontSize:isDesktop?14:12,fontWeight:600,color:T.gold,marginBottom:10}}>{bt.prompt}</div>
              {/* Draft → Expanded */}
              <div style={{display:"flex",gap:isDesktop?14:10,alignItems:"flex-start",marginBottom:10}}>
                <div style={{flex:1,padding:"10px 14px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
                  <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>Your draft</div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.55,margin:0,fontWeight:300,fontStyle:"italic"}}>{beats[i]||"(empty)"}</p>
                </div>
                <div style={{width:18,display:"flex",alignItems:"center",justifyContent:"center",paddingTop:20,flexShrink:0}}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M8 4l4 4-4 4" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{flex:1,padding:"10px 14px",background:"rgba(138,158,132,0.07)",borderRadius:4,border:"0.5px solid rgba(138,158,132,0.25)"}}>
                  <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>AI version</div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.55,margin:0,fontWeight:400}}>{genResult.beats?.[i]||""}</p>
                </div>
              </div>
              {/* Why it's better */}
              <div style={{display:"flex",gap:8,alignItems:"flex-start",padding:"8px 12px",background:"rgba(138,158,132,0.04)",borderRadius:4,borderLeft:"2px solid rgba(138,158,132,0.35)"}}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,marginTop:1}}><circle cx="7" cy="7" r="6" stroke={T.gold} strokeWidth="1.1"/><path d="M7 4.5v3M7 9v.5" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,lineHeight:1.55,margin:0,fontWeight:300}}>{genResult.improvements?.[i]||""}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full story block */}
      <div style={{...cs.card,background:"rgba(138,158,132,0.05)",borderLeft:"3px solid "+T.gold}}>
        <div style={cs.label}>Your Complete Story</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {(genResult.beats||[]).map((beat,i)=>(
            <p key={i} style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>{beat}</p>
          ))}
        </div>
      </div>

      <button onClick={()=>setPhase('insight')} style={cs.cta}>Continue →</button>
      <button onClick={restart} style={cs.back}>Start Over</button>
    </div>
  );

  // ── INSIGHT ────────────────────────────────────────────────────────────────
  if (phase==='insight') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
      <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"32px 36px":"24px",border:"0.5px solid rgba(138,158,132,0.2)"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>The Masterclass Insight</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:23,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:24}}>Notice Something?</h2>
        {[
          {text:"You didn't start with a presentation.", dim:true},
          {text:"You didn't start with slides.",         dim:true},
          {text:"You didn't start with facts.",          dim:true},
          {text:"You started with a story.",             dim:false},
        ].map((line,i)=>(
          <p key={i} style={{fontFamily:T.sans,fontSize:isDesktop?16:14,color:line.dim?"rgba(245,239,230,0.45)":"rgba(245,239,230,0.9)",lineHeight:1.6,margin:"0 0 10px",fontWeight:line.dim?300:500}}>{line.text}</p>
        ))}
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T.gold,lineHeight:1.7,margin:"20px 0 0"}}>Because stories create curiosity before information arrives. That's why the world's best communicators use them.</p>
      </div>
      <button onClick={()=>setPhase('cta')} style={cs.cta}>Continue →</button>
    </div>
  );

  // ── CTA ────────────────────────────────────────────────────────────────────
  if (phase==='cta') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"40px 44px":"28px 24px"}}>
        <div style={cs.label}>Next Step</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>Ready to Bring It To Life?</h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.7,marginBottom:24,fontWeight:300}}>You've built the structure. Now it's time to tell it. In the next challenge, you'll deliver your story aloud and receive coaching on:</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28,textAlign:"left"}}>
          {["Narrative Flow","Emotional Engagement","Clarity","Delivery","Memorability"].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"1px solid rgba(138,158,132,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,fontWeight:400}}>{item}</span>
            </div>
          ))}
        </div>
        {onSimulation
          ? <button onClick={onSimulation} style={cs.cta}>Start Storytelling Simulation →</button>
          : <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,fontStyle:"italic",margin:0}}>Navigate to the Simulation tab to continue.</p>
        }
      </div>
      <button onClick={restart} style={cs.back}>Start Over</button>
    </div>
  );

  return null;
}
