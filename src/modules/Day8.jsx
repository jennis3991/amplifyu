import { useState, useRef, useEffect } from 'react';
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
      const res = await fetch("/api/claude",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1000,messages:[{role:"user",content:
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
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>AmplifyU Coach · What I'd Recommend</div>
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

// ─── Story Architect Widget (Simulation) ──────────────────────────────────────


export function StoryArchitectWidget({ T:Tp, T2:T2p, isDesktop=false }) {
  const T  = Tp  || Timport;
  const T2 = T2p || T2D;

  // ── Palette ──────────────────────────────────────────────────────────────
  const CREAM = '#F8F5EF';
  const INK   = '#3A3028';
  const INK_D = 'rgba(58,48,40,0.28)';

  // ── Sketch illustrations — fine-line editorial style ─────────────────────
  function SketchIllustration({ scene, idx }) {
    const dir = (scene.visual || scene.visualDirection || '').toLowerCase();
    const isEgg        = /egg|tiny.*start|tiny.*begin|rest.*leaf|small.*oval|dewdrop/.test(dir);
    const isCaterp     = /caterpillar|crawl|larva|hungry.*leaf|worm|munch|eating/.test(dir);
    const isChrysalis  = /chrysalis|cocoon|golden.*sleep|hang.*branch|suspend|cocooned|transform/.test(dir);
    const isButterfly  = /butterfly|wing|soar|emerge|first.*flight|spread.*wing|flying/.test(dir);
    const isLeaf       = /leaf|leaf|garden|green|nature|bloom|petal|flower|blossom/.test(dir);
    const isBook       = /book|page|pen|quill|write|open.*book|glowing.*book|story/.test(dir);
    const isLightbulb  = /idea|insight|clarity|lightbulb|light.*idea|realise|understand/.test(dir);
    const isMountain   = /mountain|peak|summit|climb|achieve|top/.test(dir);
    const isPath       = /path|road|trail|winding|horizon|journey.*ahead|ahead/.test(dir);
    const isDoor       = /door|doorway|open.*door|threshold|entrance|light.*through/.test(dir);
    const isFigure     = /figure|silhouette|person|human|child|someone|together|people/.test(dir);
    const isStar       = /star|shine|sparkle|glitter|shimmer|constellation/.test(dir);
    const isSunrise    = /sunrise|dawn|morning|sun.*rising|golden.*sun|horizon.*sun/.test(dir);
    const isFire       = /fire|flame|spark|urgent|alert|danger|red/.test(dir);
    const isCompass    = /compass|navigation|direction|north|guide|map/.test(dir);

    if (isEgg) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        {/* Leaf */}
        <path d="M100 125 Q50 80 65 40 Q100 18 135 40 Q150 80 100 125" stroke={INK} strokeWidth="1.1" fill="rgba(58,48,40,0.04)"/>
        {/* Midrib */}
        <path d="M100 125 Q100 75 100 40" stroke={INK} strokeWidth="0.6" opacity="0.45"/>
        {/* Lateral veins */}
        {[[100,80,78,65],[100,80,122,65],[100,95,82,82],[100,95,118,82],[100,67,84,57],[100,67,116,57]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth="0.5" opacity="0.3"/>
        ))}
        {/* Egg */}
        <ellipse cx="100" cy="62" rx="9" ry="12" stroke={INK} strokeWidth="1" fill="rgba(245,240,228,0.9)"/>
        {/* Subtle shadow under egg */}
        <ellipse cx="100" cy="74" rx="6" ry="1.5" fill={INK} opacity="0.07"/>
        {/* Dew drops */}
        <circle cx="78" cy="88" r="2.2" stroke={INK} strokeWidth="0.7" fill="none"/>
        <circle cx="120" cy="95" r="1.6" stroke={INK} strokeWidth="0.7" fill="none"/>
        <circle cx="85" cy="105" r="1.3" stroke={INK} strokeWidth="0.6" fill="none"/>
      </svg>
    );
    if (isCaterp) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        {/* Serrated leaf */}
        <path d="M30 105 Q40 65 70 45 Q100 30 130 45 Q160 65 170 105 Q140 115 100 118 Q60 115 30 105Z" stroke={INK} strokeWidth="1" fill="rgba(58,48,40,0.04)"/>
        <path d="M100 118 Q100 75 100 45" stroke={INK} strokeWidth="0.55" opacity="0.4"/>
        {/* Caterpillar body segments */}
        {[55,70,85,100,115,130].map((cx,i)=>(
          <circle key={i} cx={cx} cy={80-(i===0||i===5?0:i%2===0?-2:2)} r={i===0?9:8} stroke={INK} strokeWidth={i===0?"1.2":"1"} fill="rgba(245,240,228,0.85)"/>
        ))}
        {/* Head details */}
        <circle cx="53" cy="80" r="3" fill={INK} opacity="0.7"/>
        <circle cx="57" cy="80" r="3" fill={INK} opacity="0.7"/>
        {/* Antennae */}
        <path d="M50 72 Q46 64 44 60" stroke={INK} strokeWidth="0.7" strokeLinecap="round"/>
        <path d="M56 72 Q52 63 51 58" stroke={INK} strokeWidth="0.7" strokeLinecap="round"/>
        {/* Legs */}
        {[70,85,100,115].map((x,i)=>(
          <path key={i} d={`M${x} 88 Q${x-2} 96 ${x-4} 102`} stroke={INK} strokeWidth="0.7" strokeLinecap="round" opacity="0.6"/>
        ))}
      </svg>
    );
    if (isChrysalis) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        {/* Branch */}
        <path d="M30 35 Q80 32 140 30 Q170 29 190 32" stroke={INK} strokeWidth="1.5" strokeLinecap="round"/>
        {/* Small twigs */}
        <path d="M75 32 Q70 22 66 16" stroke={INK} strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <path d="M130 30 Q128 20 124 14" stroke={INK} strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        {/* Silk thread */}
        <path d="M100 35 Q99 42 100 50" stroke={INK} strokeWidth="0.7" opacity="0.6"/>
        {/* Chrysalis body */}
        <path d="M100 52 Q120 58 122 78 Q122 100 100 115 Q78 100 78 78 Q78 58 100 52Z" stroke={INK} strokeWidth="1.2" fill="rgba(200,168,76,0.1)"/>
        {/* Wing pattern lines inside */}
        <path d="M88 70 Q100 65 112 70" stroke={INK} strokeWidth="0.5" opacity="0.3"/>
        <path d="M86 80 Q100 75 114 80" stroke={INK} strokeWidth="0.5" opacity="0.3"/>
        <path d="M87 90 Q100 86 113 90" stroke={INK} strokeWidth="0.5" opacity="0.25"/>
        {/* Sparkle marks */}
        {[[70,55],[130,60],[65,75],[135,80],[72,95]].map(([x,y],i)=>(
          <g key={i} opacity="0.55">
            <line x1={x} y1={y-4} x2={x} y2={y+4} stroke={INK} strokeWidth="0.6"/>
            <line x1={x-4} y1={y} x2={x+4} y2={y} stroke={INK} strokeWidth="0.6"/>
          </g>
        ))}
      </svg>
    );
    if (isButterfly) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        {/* Upper wings */}
        <path d="M100 65 Q78 38 52 40 Q32 42 35 62 Q38 80 65 78 Q85 76 100 65Z" stroke={INK} strokeWidth="1.1" fill="rgba(58,48,40,0.04)"/>
        <path d="M100 65 Q122 38 148 40 Q168 42 165 62 Q162 80 135 78 Q115 76 100 65Z" stroke={INK} strokeWidth="1.1" fill="rgba(58,48,40,0.04)"/>
        {/* Lower wings */}
        <path d="M100 72 Q78 80 60 100 Q52 116 68 118 Q86 120 100 100Z" stroke={INK} strokeWidth="1" fill="rgba(58,48,40,0.04)"/>
        <path d="M100 72 Q122 80 140 100 Q148 116 132 118 Q114 120 100 100Z" stroke={INK} strokeWidth="1" fill="rgba(58,48,40,0.04)"/>
        {/* Wing venation */}
        {[["M100 65 Q82 58 68 52"],["M100 65 Q88 55 80 46"],["M100 65 Q118 58 132 52"],["M100 65 Q112 55 120 46"]].map((d,i)=>(
          <path key={i} d={d[0]} stroke={INK} strokeWidth="0.5" opacity="0.3"/>
        ))}
        <path d="M100 65 Q90 78 88 95 Q86 108 90 115" stroke={INK} strokeWidth="0.5" opacity="0.3"/>
        <path d="M100 65 Q110 78 112 95 Q114 108 110 115" stroke={INK} strokeWidth="0.5" opacity="0.3"/>
        {/* Body */}
        <path d="M100 50 Q102 65 100 85 Q98 95 100 105" stroke={INK} strokeWidth="1.2" strokeLinecap="round"/>
        {/* Antennae */}
        <path d="M100 50 Q90 38 84 28" stroke={INK} strokeWidth="0.8" strokeLinecap="round"/>
        <circle cx="83" cy="27" r="2" fill={INK} opacity="0.7"/>
        <path d="M100 50 Q110 38 116 28" stroke={INK} strokeWidth="0.8" strokeLinecap="round"/>
        <circle cx="117" cy="27" r="2" fill={INK} opacity="0.7"/>
        {/* Flight sparkles */}
        {[[50,50],[155,52],[42,90],[158,88]].map(([x,y],i)=>(
          <g key={i} opacity="0.4">
            <line x1={x} y1={y-3} x2={x} y2={y+3} stroke={INK} strokeWidth="0.6"/>
            <line x1={x-3} y1={y} x2={x+3} y2={y} stroke={INK} strokeWidth="0.6"/>
          </g>
        ))}
      </svg>
    );
    if (isLeaf) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        <path d="M100 125 Q45 90 50 45 Q75 15 100 20 Q125 15 150 45 Q155 90 100 125Z" stroke={INK} strokeWidth="1.1" fill="rgba(58,48,40,0.04)"/>
        <path d="M100 125 Q100 70 100 20" stroke={INK} strokeWidth="0.7" opacity="0.5"/>
        {[[100,70,76,55],[100,70,124,55],[100,88,80,76],[100,88,120,76],[100,55,82,44],[100,55,118,44],[100,103,84,94],[100,103,116,94]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth="0.5" opacity="0.32"/>
        ))}
        <circle cx="100" cy="70" r="8" stroke={INK} strokeWidth="0.9" fill="none" opacity="0.4"/>
        <path d="M100 120 Q100 128 100 135" stroke={INK} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      </svg>
    );
    if (isSunrise) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        <line x1="20" y1="110" x2="180" y2="110" stroke={INK} strokeWidth="0.8" opacity="0.4"/>
        <path d="M100 110 Q60 110 35 110" stroke={INK} strokeWidth="0.6" opacity="0.25"/>
        <path d="M165 110 Q140 110 100 110" stroke={INK} strokeWidth="0.6" opacity="0.25"/>
        {/* Sun semicircle */}
        <path d="M65 110 A35 35 0 0 1 135 110" stroke={INK} strokeWidth="1.2" fill="rgba(58,48,40,0.05)"/>
        {/* Sun rays */}
        {[[-70,-60,-45,-30,-15,0,15,30,45,60,70].map((angle,i)=>{
          const rad = angle * Math.PI / 180;
          const r1=38, r2=50;
          return <line key={i} x1={100+r1*Math.sin(rad)} y1={110-r1*Math.cos(rad)} x2={100+r2*Math.sin(rad)} y2={110-r2*Math.cos(rad)} stroke={INK} strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>;
        })]}
        {/* Horizon reflection lines */}
        {[4,8,12,16].map((y,i)=>(
          <line key={i} x1={30+i*8} y1={110+y} x2={170-i*8} y2={110+y} stroke={INK} strokeWidth="0.5" opacity={0.15-i*0.03}/>
        ))}
      </svg>
    );
    if (isBook) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        {/* Open book */}
        <path d="M100 95 Q70 93 40 98 L40 50 Q70 44 100 47 Z" stroke={INK} strokeWidth="1" fill="rgba(58,48,40,0.04)"/>
        <path d="M100 95 Q130 93 160 98 L160 50 Q130 44 100 47 Z" stroke={INK} strokeWidth="1" fill="rgba(58,48,40,0.04)"/>
        <line x1="100" y1="47" x2="100" y2="95" stroke={INK} strokeWidth="1.2" opacity="0.6"/>
        {[56,63,70,77,84].map((y,i)=>(
          <line key={i} x1={55} y1={y} x2={92} y2={y+1} stroke={INK} strokeWidth="0.5" opacity="0.3"/>
        ))}
        {[56,63,70,77,84].map((y,i)=>(
          <line key={i} x1={108} y1={y} x2={145} y2={y+1} stroke={INK} strokeWidth="0.5" opacity="0.3"/>
        ))}
        <ellipse cx="100" cy="100" rx="30" ry="6" fill={INK} opacity="0.06"/>
        {/* Quill */}
        <path d="M148 44 Q155 35 170 25 Q160 30 152 42 Z" stroke={INK} strokeWidth="0.8" fill="rgba(58,48,40,0.12)"/>
        <path d="M148 44 Q145 52 143 60" stroke={INK} strokeWidth="0.7" strokeLinecap="round" opacity="0.6"/>
      </svg>
    );
    if (isLightbulb) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        <path d="M100 105 Q88 105 85 118 L115 118 Q112 105 100 105Z" stroke={INK} strokeWidth="1" fill="rgba(58,48,40,0.06)"/>
        <path d="M90 118 L110 118" stroke={INK} strokeWidth="0.8" opacity="0.5"/>
        <path d="M92 124 L108 124" stroke={INK} strokeWidth="0.8" opacity="0.4"/>
        <path d="M94 130 L106 130" stroke={INK} strokeWidth="0.8" opacity="0.3"/>
        <path d="M100 105 Q88 105 80 95 Q72 84 75 72 Q78 55 100 50 Q122 55 125 72 Q128 84 120 95 Q112 105 100 105Z" stroke={INK} strokeWidth="1.1" fill="rgba(58,48,40,0.04)"/>
        <path d="M90 80 Q100 72 110 80" stroke={INK} strokeWidth="0.6" opacity="0.4"/>
        {[[100,35],[68,42],[132,42],[58,60],[142,60],[62,92],[138,92]].map(([x,y],i)=>(
          <g key={i} opacity={i<3?0.55:0.35}>
            <line x1={x} y1={y-4} x2={x} y2={y+4} stroke={INK} strokeWidth="0.7"/>
            <line x1={x-4} y1={y} x2={x+4} y2={y} stroke={INK} strokeWidth="0.7"/>
          </g>
        ))}
      </svg>
    );
    if (isPath) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        <line x1="20" y1="115" x2="180" y2="115" stroke={INK} strokeWidth="0.7" opacity="0.3"/>
        <path d="M55 115 Q75 80 100 62 Q120 48 165 38" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.7"/>
        <path d="M45 115 Q65 80 90 62 Q110 48 155 38" stroke={INK} strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.3" strokeDasharray="3 4"/>
        <circle cx="165" cy="38" r="4" stroke={INK} strokeWidth="0.9" fill="rgba(58,48,40,0.15)"/>
        {/* Trees */}
        {[[40,90],[30,100],[150,58],[160,68]].map(([x,y],i)=>(
          <g key={i} opacity="0.4">
            <line x1={x} y1={y} x2={x} y2={y+20} stroke={INK} strokeWidth="1"/>
            <path d={`M${x} ${y} Q${x-8} ${y-14} ${x+8} ${y-14} Q${x} ${y-22} ${x} ${y}`} stroke={INK} strokeWidth="0.7" fill="rgba(58,48,40,0.05)"/>
          </g>
        ))}
      </svg>
    );
    if (isDoor) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        {/* Frame */}
        <rect x="68" y="28" width="64" height="98" rx="1" stroke={INK} strokeWidth="1" fill="rgba(58,48,40,0.04)"/>
        {/* Door panels */}
        <rect x="74" y="34" width="52" height="40" rx="1" stroke={INK} strokeWidth="0.6" fill="none" opacity="0.4"/>
        <rect x="74" y="80" width="52" height="40" rx="1" stroke={INK} strokeWidth="0.6" fill="none" opacity="0.4"/>
        {/* Light from within */}
        <path d="M100 28 Q90 40 84 60 Q80 80 86 100 Q90 110 100 120" stroke={INK} strokeWidth="0.5" opacity="0.2" fill="none"/>
        <path d="M100 28 Q110 40 116 60 Q120 80 114 100 Q110 110 100 120" stroke={INK} strokeWidth="0.5" opacity="0.2" fill="none"/>
        {/* Glow lines emanating */}
        {[[-20,-25],[0,-30],[20,-25],[35,-15],[40,0],[35,15]].map(([dx,dy],i)=>(
          <line key={i} x1={100} y1={70} x2={100+dx} y2={70+dy} stroke={INK} strokeWidth="0.5" opacity={0.12+i*0.03} strokeLinecap="round"/>
        ))}
        {/* Handle */}
        <circle cx="116" cy="78" r="3" stroke={INK} strokeWidth="0.8" fill="none"/>
        {/* Threshold */}
        <line x1="68" y1="126" x2="132" y2="126" stroke={INK} strokeWidth="1.2" opacity="0.5"/>
      </svg>
    );
    if (isFigure) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        <circle cx="100" cy="42" r="14" stroke={INK} strokeWidth="1" fill="rgba(58,48,40,0.05)"/>
        <path d="M86 56 Q80 70 78 88 Q78 100 100 100 Q122 100 122 88 Q120 70 114 56" stroke={INK} strokeWidth="1" fill="rgba(58,48,40,0.04)"/>
        <path d="M86 68 Q72 72 64 82" stroke={INK} strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
        <path d="M114 68 Q128 72 136 82" stroke={INK} strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
        <path d="M90 100 Q88 118 86 128" stroke={INK} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
        <path d="M110 100 Q112 118 114 128" stroke={INK} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
        <line x1="40" y1="128" x2="160" y2="128" stroke={INK} strokeWidth="0.7" opacity="0.3"/>
      </svg>
    );
    if (isStar) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        <path d="M100 28 L107 54 L135 54 L112 70 L121 96 L100 80 L79 96 L88 70 L65 54 L93 54 Z" stroke={INK} strokeWidth="1.1" fill="rgba(58,48,40,0.06)"/>
        {[[100,20],[138,35],[152,70],[138,105],[100,118],[62,105],[48,70],[62,35]].map(([x,y],i)=>(
          <g key={i} opacity="0.45">
            <line x1={x} y1={y-5} x2={x} y2={y+5} stroke={INK} strokeWidth="0.7"/>
            <line x1={x-5} y1={y} x2={x+5} y2={y} stroke={INK} strokeWidth="0.7"/>
          </g>
        ))}
      </svg>
    );
    if (isFire) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        <path d="M100 115 Q80 115 72 100 Q65 85 75 72 Q78 65 80 58 Q88 72 84 80 Q95 60 92 40 Q105 55 104 68 Q112 52 110 38 Q125 55 122 75 Q128 68 126 56 Q135 70 132 88 Q128 100 120 108 Q112 115 100 115Z" stroke={INK} strokeWidth="1" fill="rgba(58,48,40,0.06)"/>
        <path d="M92 108 Q100 95 108 108" stroke={INK} strokeWidth="0.7" opacity="0.4" fill="none"/>
        {/* Sparks */}
        {[[88,30],[100,25],[112,30],[80,50],[120,48]].map(([x,y],i)=>(
          <g key={i} opacity={0.3+i*0.06}>
            <line x1={x} y1={y-4} x2={x} y2={y+4} stroke={INK} strokeWidth="0.6"/>
            <line x1={x-4} y1={y} x2={x+4} y2={y} stroke={INK} strokeWidth="0.6"/>
          </g>
        ))}
      </svg>
    );
    if (isCompass) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        <circle cx="100" cy="70" r="45" stroke={INK} strokeWidth="0.8" fill="none" opacity="0.5"/>
        <circle cx="100" cy="70" r="38" stroke={INK} strokeWidth="0.5" fill="none" opacity="0.3"/>
        <path d="M100 25 L104 65 L100 70 L96 65 Z" stroke={INK} strokeWidth="0.9" fill="rgba(58,48,40,0.5)"/>
        <path d="M100 115 L96 75 L100 70 L104 75 Z" stroke={INK} strokeWidth="0.9" fill="rgba(58,48,40,0.12)"/>
        <path d="M55 70 L95 66 L100 70 L95 74 Z" stroke={INK} strokeWidth="0.9" fill="rgba(58,48,40,0.12)"/>
        <path d="M145 70 L105 74 L100 70 L105 66 Z" stroke={INK} strokeWidth="0.9" fill="rgba(58,48,40,0.12)"/>
        <circle cx="100" cy="70" r="4" stroke={INK} strokeWidth="1" fill={CREAM}/>
        {['N','S','E','W'].map((l,i)=>{
          const pos=[[100,36],[100,108],[138,70],[62,70]]; return (
            <text key={i} x={pos[i][0]} y={pos[i][1]} textAnchor="middle" dominantBaseline="middle" fontFamily="serif" fontSize="10" fill={INK} opacity="0.7">{l}</text>
          );
        })}
      </svg>
    );
    if (isMountain) return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        <line x1="15" y1="115" x2="185" y2="115" stroke={INK} strokeWidth="0.7" opacity="0.35"/>
        <path d="M100 28 L145 115 L55 115 Z" stroke={INK} strokeWidth="1.1" fill="rgba(58,48,40,0.05)"/>
        <path d="M55 115 L30 115 L60 72 Z" stroke={INK} strokeWidth="0.9" fill="rgba(58,48,40,0.04)" opacity="0.7"/>
        <path d="M145 115 L170 115 L140 75 Z" stroke={INK} strokeWidth="0.9" fill="rgba(58,48,40,0.04)" opacity="0.7"/>
        {/* Snow cap */}
        <path d="M100 28 Q92 45 88 52 Q94 48 100 50 Q106 48 112 52 Q108 45 100 28Z" stroke={INK} strokeWidth="0.7" fill="rgba(245,240,230,0.9)"/>
        {/* Horizontal distance lines */}
        {[4,8,12].map((y,i)=>(
          <line key={i} x1={30+i*10} y1={115+y} x2={170-i*10} y2={115+y} stroke={INK} strokeWidth="0.5" opacity={0.15-i*0.04}/>
        ))}
      </svg>
    );
    // Default: abstract editorial
    return (
      <svg viewBox="0 0 200 140" fill="none" width="100%" height="100%">
        <rect width="200" height="140" fill={CREAM}/>
        <path d={idx%2===0?"M30 105 Q65 45 100 68 Q135 92 170 35":"M30 35 Q65 95 100 72 Q135 48 170 105"}
          stroke={INK} strokeWidth="1.2" fill="none" opacity="0.55" strokeLinecap="round"/>
        <circle cx="100" cy={idx%2===0?68:72} r="22" stroke={INK} strokeWidth="0.6" fill="none" opacity="0.2"/>
        <circle cx="100" cy={idx%2===0?68:72} r="10" stroke={INK} strokeWidth="0.8" fill="none" opacity="0.3"/>
        <circle cx="100" cy={idx%2===0?68:72} r="3" fill={INK} opacity="0.45"/>
        {[[40,55],[160,55],[40,90],[160,90]].map(([x,y],i)=>(
          <g key={i} opacity="0.3">
            <line x1={x} y1={y-4} x2={x} y2={y+4} stroke={INK} strokeWidth="0.7"/>
            <line x1={x-4} y1={y} x2={x+4} y2={y} stroke={INK} strokeWidth="0.7"/>
          </g>
        ))}
      </svg>
    );
  }

  // ── Derive Experience Mode from storyWorld ────────────────────────────────
  function deriveExperienceMode(sw) {
    const e = (sw?.emotion||'').toLowerCase();
    const s = (sw?.style||'').toLowerCase();
    const TONES   = { wonder:'Warm, gentle, and magical', urgency:'Tense, direct, urgent', hope:'Uplifting and warm', sadness:'Quiet and reflective', excitement:'Energetic and vibrant', confidence:'Calm and assured', curiosity:'Playful and exploratory' };
    const MUSIC   = { wonder:'Soft, whimsical, and uplifting', urgency:'Sharp, percussive, building', hope:'Gentle strings, ascending', sadness:'Piano, minimal', excitement:'Bright orchestral', confidence:'Low brass, steady', curiosity:'Light, unexpected' };
    const NARR    = { bedtime:'Calm and gentle', cinematic:'Deep and expressive', ted:'Warm and direct', documentary:'Clear and authoritative', pitch:'Confident and precise', children:'Warm and playful' };
    const dur = s.includes('short')||s.includes('brief')?'3-4 minutes':s.includes('long')||s.includes('epic')?'10-15 minutes':'5-7 minutes';
    const tone    = Object.entries(TONES).find(([k])=>e.includes(k))?.[1] || 'Warm and considered';
    const music   = Object.entries(MUSIC).find(([k])=>e.includes(k))?.[1] || 'Subtle, ambient';
    const narr    = Object.entries(NARR).find(([k])=>s.includes(k))?.[1] || 'Clear and expressive';
    return { tone, duration:dur, narration:narr, music, transitions:'Smooth and deliberate' };
  }

  // ── State ─────────────────────────────────────────────────────────────────
  const [phase,    setPhase]   = useState('brief');
  const [brief,    setBrief]   = useState('');
  const [result,   setResult]  = useState(null);
  const [apiError, setApiError]= useState(false);

  const EXAMPLE_BRIEFS = [
    "A magical story about the lifecycle of a butterfly for my 5-year-old — wonder and joy, bedtime story style",
    "A cybersecurity risk presentation for our board — make it feel like breaking news, urgent and specific",
    "A TED-style pitch for a new product — emotional, direct, show real human impact",
  ];

  function reset() { setPhase('brief'); setBrief(''); setResult(null); setApiError(false); }

  function buildFallback(b) {
    const bl = b.toLowerCase();
    const isKids   = /child|kid|son|daughter|year.?old|baby|magical|fairy|princess/.test(bl);
    const isUrgent = /urgent|crisis|risk|breaking|emergency|threat/.test(bl);
    const topic    = b.trim().split(/[,.\-—]/)[0].trim() || 'Your Story';
    if (isKids) return { storyWorld:{ subject:topic, audience:"Children (Age 5)", emotion:"Wonder", style:"Bedtime Story", visualWorld:"Magical Garden", character:"Luna", lesson:"Believe in yourself" }, scenes:[{number:1,title:"The Tiny Beginning",visual:"A tiny egg on a bright green leaf. Morning dew. Soft golden light.",emotion:"Curiosity",caption:"Every great journey starts small.",narrative:"Once upon a time, in a garden full of colour and magic, the tiniest of beginnings was about to become the greatest adventure."},{number:2,title:"Eating Everything Up",visual:"A hungry caterpillar on green leaves. Sunshine everywhere.",emotion:"Growth",caption:"Eat. Grow. Explore.",narrative:"Day after day, a curious little caterpillar grew bigger and stronger — one leaf at a time."},{number:3,title:"The Golden Chrysalis",visual:"A glowing chrysalis hanging from a moonlit branch. Stars above.",emotion:"Patience",caption:"Something magical is happening inside.",narrative:"Then came the waiting. Tucked inside a golden sleeping bag, something wonderful was quietly taking shape."},{number:4,title:"Transformation",visual:"Swirling rainbow light. Magical energy. Something becoming.",emotion:"Wonder",caption:"Beautiful things take time.",narrative:"Nobody could see it happening. But inside, absolutely everything was changing."},{number:5,title:"Emergence",visual:"Brilliant wings unfurling. Friends gathering. Sunlight.",emotion:"Achievement",caption:"Look what I became!",narrative:"And then — one perfect morning — the chrysalis opened. Something so beautiful, everyone stopped to look."},{number:6,title:"The First Flight",visual:"A butterfly soaring over a valley at golden sunset.",emotion:"Freedom",caption:"Believe in your wings.",narrative:"With one brave leap, she flew. The whole garden cheered. She had been becoming this all along."}], story:"Once upon a time, in a garden full of colour and magic, the most extraordinary journey began with the smallest of beginnings.\n\nDay after day, a curious caterpillar ate and grew and explored, learning that every leaf was an adventure.\n\nThen came the chrysalis — a golden sleeping bag of transformation. Something magical was happening inside.\n\nIn the darkness, everything changed. Quietly. Completely. Beautifully.\n\nAnd one morning, the chrysalis opened — and out stepped the most wonderful butterfly anyone had ever seen.\n\nShe looked at her wings. She took a breath. And she flew." };
    if (isUrgent) return { storyWorld:{ subject:topic, audience:"Leadership", emotion:"Urgency", style:"Cinematic", visualWorld:"High Stakes", character:"The Decision Maker", lesson:"Act now" }, scenes:[{number:1,title:"The Current Reality",visual:"Dark screens. Data. The world as it stands right now.",emotion:"Awareness",caption:"This is where we are.",narrative:"Before anything changes, we need to see exactly where we stand. Clearly. Honestly."},{number:2,title:"What's at Stake",visual:"A countdown. Narrowing window. Numbers that matter.",emotion:"Tension",caption:"The window is closing.",narrative:"This isn't a future problem. The risk is live. The window is closing."},{number:3,title:"The Hidden Risk",visual:"One highlighted line in a long report. The thing everyone missed.",emotion:"Clarity",caption:"Here's what we're missing.",narrative:"There's a layer most people don't reach. This is it. And once you see it, you can't unsee it."},{number:4,title:"The Response",visual:"Clear action steps. Motion. Decision.",emotion:"Resolve",caption:"This is what we do.",narrative:"Not theory. Action. Here's exactly what needs to happen — and when."},{number:5,title:"Protected Future",visual:"Calm. Clear. Secure. The world on the other side.",emotion:"Confidence",caption:"This is what we're building.",narrative:"On the other side of this decision is a completely different reality."},{number:6,title:"The Decision",visual:"One chair. One table. One moment of choice.",emotion:"Action",caption:"One decision. Made today.",narrative:"Everything comes down to this. The team is ready. All that's needed now — is yes."}], story:"This is not a theoretical risk.\n\nHere is where we stand — clearly, honestly, without softening.\n\nThe gap between knowing and acting is exactly where organisations lose.\n\nHere's the insight that changes the frame. Not more effort — a different way of seeing.\n\nOn the other side of this decision is a fundamentally better operating environment.\n\nOne decision. Made today." };
    return { storyWorld:{ subject:topic, audience:"Your audience", emotion:"Connection", style:"Presentation", visualWorld:"Your setting", character:"Your protagonist", lesson:"Your core message" }, scenes:[{number:1,title:"Where We Begin",visual:"The world as it is. Familiar. Real.",emotion:"Curiosity",caption:"Every story starts here.",narrative:"Before anything changes, we need to see the world as it truly is."},{number:2,title:"The Tension",visual:"A gap. A question. Something that needs answering.",emotion:"Tension",caption:"This is what makes it necessary.",narrative:"Something isn't working — or could work far better."},{number:3,title:"The Insight",visual:"One clear idea. A new way of seeing.",emotion:"Clarity",caption:"This changes everything.",narrative:"A new frame. Not more effort — different thinking."},{number:4,title:"The Path Forward",visual:"A direction. Steps becoming clear. Motion.",emotion:"Hope",caption:"From insight to action.",narrative:"The route becomes clear. It's not easy — but it's right."},{number:5,title:"What Becomes Possible",visual:"Open space. A different world.",emotion:"Confidence",caption:"This is what we're building.",narrative:"On the other side of this is something fundamentally better."},{number:6,title:"The Invitation",visual:"A shared moment. The audience, ready to choose.",emotion:"Action",caption:"Now it belongs to everyone.",narrative:"What will we choose to do with what we now know?"}], story:"Before anything changes, we need to see clearly.\n\nSomething isn't working — or could work far better.\n\nHere's the insight that changes the frame.\n\nWith that insight, a path becomes clear.\n\nOn the other side of this decision is something better.\n\nWhat will we choose?" };
  }

  async function generate() {
    if (!brief.trim()) return;
    setPhase('generating'); setApiError(false);
    try {
      const res = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-5", max_tokens:2000,
          messages:[{ role:"user", content:
`You are a cinematic story director. Read the brief carefully — understand the subject, audience, emotion, and visual world. Generate a complete cinematic story that matches the brief exactly.

BRIEF: "${brief}"

Do NOT use a generic story template. Write THIS story — its specific subject, characters, scenes, and emotional arc. If it is for a child, write like a children's author. If it's a business pitch, write with conviction. If it's urgent, write with urgency.

Return ONLY valid JSON:
{
  "storyWorld": {
    "subject": "specific subject from brief",
    "audience": "exact audience",
    "emotion": "primary emotion created",
    "style": "storytelling style",
    "visualWorld": "the visual setting",
    "character": "hero or protagonist",
    "lesson": "core lesson in 4-6 words"
  },
  "scenes": [
    {
      "number": 1,
      "title": "Scene title specific to THIS story",
      "visual": "Exactly what is seen — specific objects, colours, atmosphere. 1-2 sentences.",
      "emotion": "One word",
      "caption": "One punchy sentence.",
      "narrative": "2-3 sentences of story prose in exactly the style the brief calls for"
    }
  ],
  "story": "Complete narrative — all scenes woven together, written entirely in the style the brief demands. Use scene titles as section breaks (write them as: TITLE:). Aim for 150-200 words."
}

6 scenes exactly. Match the brief completely.`
          }]
        })
      });
      const d = await res.json();
      if (!res.ok) throw new Error('API');
      const raw = (d.content||[]).map(b=>b.text||'').join('').trim().replace(/```json\n?|\n?```/g,'').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('Parse');
      const parsed = JSON.parse(m[0]);
      if (!parsed.scenes?.length) throw new Error('No scenes');
      setResult(parsed); setPhase('results');
    } catch(_) {
      setApiError(true); setResult(buildFallback(brief)); setPhase('results');
    }
  }

  // ── BRIEF ──────────────────────────────────────────────────────────────────
  if (phase==='brief') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?20:16}}>
      <div>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Story Architect</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?34:26,fontWeight:500,color:T2.text,lineHeight:1.1,letterSpacing:"-0.5px",marginBottom:8}}>What's your story?</h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0,fontWeight:300}}>Describe the subject, audience, and feeling. The AI builds a complete cinematic world — brief, storyboard, and narrative.</p>
      </div>
      <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"18px"}}>
        <textarea value={brief} onChange={e=>setBrief(e.target.value)} placeholder={"e.g. A magical story about the lifecycle of a butterfly for my 5-year-old — full of wonder, bedtime story style, make it feel like a Pixar film"} rows={isDesktop?5:4} style={{width:"100%",background:"transparent",border:"none",outline:"none",fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.7,resize:"none",boxSizing:"border-box",fontWeight:300}}/>
        {brief.trim()&&<div style={{fontFamily:T.sans,fontSize:10,color:T2.text4,marginTop:6,textAlign:"right"}}>{brief.trim().split(/\s+/).length} words</div>}
      </div>
      <div>
        <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Or try an example</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {EXAMPLE_BRIEFS.map((ex,i)=>(
            <button key={i} onClick={()=>setBrief(ex)} style={{padding:isDesktop?"11px 16px":"10px 14px",borderRadius:6,border:"0.5px solid "+T2.border,background:brief===ex?"rgba(138,158,132,0.08)":T2.surface,cursor:"pointer",textAlign:"left",fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5,fontWeight:300,display:"flex",alignItems:"flex-start",gap:10,transition:"all 0.15s"}}>
              <span style={{color:T.gold,flexShrink:0,fontWeight:700}}>→</span>{ex}
            </button>
          ))}
        </div>
      </div>
      <button onClick={generate} disabled={!brief.trim()} style={{width:"100%",padding:isDesktop?"16px":"15px",borderRadius:4,border:"none",background:brief.trim()?(T.ink||"#2C2416"):"rgba(44,36,22,0.25)",color:T2.bg||"#F7F3EC",fontSize:isDesktop?15:14,fontWeight:600,cursor:brief.trim()?"pointer":"default",fontFamily:T.sans,minHeight:50}}>
        Generate My Story →
      </button>
    </div>
  );

  // ── GENERATING ─────────────────────────────────────────────────────────────
  if (phase==='generating') return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20,padding:isDesktop?"64px 0":"44px 0",textAlign:"center"}}>
      <div style={{background:"#0A0804",borderRadius:10,padding:isDesktop?"36px 44px":"28px 28px",border:"0.5px solid rgba(138,158,132,0.2)",width:"100%",maxWidth:460,boxSizing:"border-box",textAlign:"left"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:20}}>Building Your Story World</div>
        {["Understanding your brief","Extracting subject, characters, visual world","Mapping the emotional arc","Writing each cinematic scene","Composing the full narrative"].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<4?14:0,animation:`fadeUp 0.5s ease ${i*0.3}s both`}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.4s ease ${i*0.25}s infinite`,flexShrink:0}}/>
            <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.6)",fontWeight:300}}>{s}</span>
          </div>
        ))}
      </div>
      <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:"italic",color:T2.text3,margin:0}}>Creating a world, not just a story…</p>
    </div>
  );

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (phase==='results' && result) {
    const sw      = result.storyWorld || {};
    const scenes  = result.scenes || [];
    const expMode = deriveExperienceMode(sw);

    const BRIEF_ICONS = {
      subject:    <svg width="16" height="16" viewBox="0 0 60 60" fill="none" style={{color:T2.text3}}><rect x="17" y="16" width="26" height="28" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><ellipse cx="30" cy="16" rx="13" ry="4" fill="none" stroke="currentColor" strokeWidth="1.3"/><ellipse cx="30" cy="44" rx="13" ry="4" fill="none" stroke="currentColor" strokeWidth="1.3"/><line x1="23" y1="25" x2="37" y2="25" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/><line x1="23" y1="30" x2="37" y2="30" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/><line x1="23" y1="35" x2="33" y2="35" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/><path d="M34 13 C42 20 40 32 34 40" fill="none" stroke="#B8964A" strokeWidth="1.4" strokeLinecap="round"/><path d="M34 13 C28 20 32 32 34 40" fill="none" stroke="#B8964A" strokeWidth="1.4" strokeLinecap="round"/><circle cx="34" cy="13" r="1.8" fill="#B8964A" opacity="0.7"/></svg>,
      audience:   <svg width="16" height="16" viewBox="0 0 60 60" fill="none" style={{color:T2.text3}}><circle cx="37" cy="18" r="6" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/><path d="M29 32 Q37 27 45 32 L44 44 Q37 40 30 44 Z" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.45"/><circle cx="25" cy="19" r="7" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M13 35 Q25 28 37 35 L36 46 Q25 42 12 46 Z" fill="none" stroke="currentColor" strokeWidth="1.3"/><circle cx="25" cy="19" r="9" fill="none" stroke="#B8964A" strokeWidth="0.9" opacity="0.4" strokeDasharray="2 3"/><circle cx="25" cy="19" r="2.5" fill="#B8964A" opacity="0.55"/></svg>,
      emotion:    <svg width="16" height="16" viewBox="0 0 60 60" fill="none" style={{color:T2.text3}}><path d="M30 42 Q15 33 19 23 Q21 14 30 21 Q39 14 41 23 Q45 33 30 42Z" fill="#B8964A" opacity="0.18"/><path d="M30 42 Q15 33 19 23 Q21 14 30 21 Q39 14 41 23 Q45 33 30 42Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M25 26 Q27 22 30 24" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.4"/><line x1="44" y1="14" x2="44" y2="7" stroke="#B8964A" strokeWidth="1.4" strokeLinecap="round"/><line x1="40.5" y1="10.5" x2="47.5" y2="10.5" stroke="#B8964A" strokeWidth="1.4" strokeLinecap="round"/><line x1="49" y1="23" x2="49" y2="18" stroke="#B8964A" strokeWidth="1" strokeLinecap="round"/><line x1="46.5" y1="20.5" x2="51.5" y2="20.5" stroke="#B8964A" strokeWidth="1" strokeLinecap="round"/><line x1="41" y1="4" x2="41" y2="1" stroke="#B8964A" strokeWidth="0.8" strokeLinecap="round"/><line x1="39.5" y1="2.5" x2="42.5" y2="2.5" stroke="#B8964A" strokeWidth="0.8" strokeLinecap="round"/></svg>,
      style:      <svg width="16" height="16" viewBox="0 0 60 60" fill="none" style={{color:T2.text3}}><rect x="15" y="23" width="30" height="24" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.3"/><rect x="19" y="27" width="22" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/><rect x="15" y="10" width="30" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.3"/><line x1="21" y1="10" x2="25" y2="23" stroke="#B8964A" strokeWidth="1.4" strokeLinecap="round"/><line x1="28" y1="10" x2="32" y2="23" stroke="#B8964A" strokeWidth="1.4" strokeLinecap="round"/><line x1="35" y1="10" x2="39" y2="23" stroke="#B8964A" strokeWidth="1.4" strokeLinecap="round"/><path d="M26 31 L26 43 L40 37 Z" fill="#B8964A" opacity="0.18"/><path d="M26 31 L26 43 L40 37 Z" fill="none" stroke="#B8964A" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
      lesson:     <svg width="16" height="16" viewBox="0 0 60 60" fill="none" style={{color:T2.text3}}><path d="M30 43 Q21 43 21 35 Q21 19 30 12 Q39 19 39 35 Q39 43 30 43Z" fill="#B8964A" opacity="0.18"/><path d="M30 43 Q21 43 21 35 Q21 19 30 12 Q39 19 39 35 Q39 43 30 43Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="24" y1="43" x2="36" y2="43" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="25" y1="47" x2="35" y2="47" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="27" y1="51" x2="33" y2="51" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M26 33 Q30 28 34 33" fill="none" stroke="#B8964A" strokeWidth="1.2" strokeLinecap="round"/><line x1="30" y1="28" x2="30" y2="32" stroke="#B8964A" strokeWidth="1.2" strokeLinecap="round"/><line x1="30" y1="9" x2="30" y2="4" stroke="#B8964A" strokeWidth="1.4" strokeLinecap="round"/><line x1="41" y1="14" x2="44" y2="10" stroke="#B8964A" strokeWidth="1.4" strokeLinecap="round"/><line x1="19" y1="14" x2="16" y2="10" stroke="#B8964A" strokeWidth="1.4" strokeLinecap="round"/><line x1="43" y1="25" x2="47" y2="25" stroke="#B8964A" strokeWidth="0.9" strokeLinecap="round"/><line x1="13" y1="25" x2="17" y2="25" stroke="#B8964A" strokeWidth="0.9" strokeLinecap="round"/></svg>,
      visualWorld:<svg width="16" height="16" viewBox="0 0 60 60" fill="none" style={{color:T2.text3}}><circle cx="30" cy="30" r="18" fill="#B8964A" opacity="0.06"/><circle cx="30" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="1.3"/><ellipse cx="30" cy="30" rx="18" ry="7" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/><ellipse cx="30" cy="30" rx="10" ry="18" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/><path d="M14 20 Q30 16 46 20" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.35"/><path d="M14 40 Q30 44 46 40" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.35"/><circle cx="35" cy="24" r="4" fill="#B8964A" opacity="0.2"/><circle cx="35" cy="24" r="4" fill="none" stroke="#B8964A" strokeWidth="1.4"/><circle cx="35" cy="24" r="1.5" fill="#B8964A" opacity="0.8"/><line x1="35" y1="28" x2="35" y2="34" stroke="#B8964A" strokeWidth="1.4" strokeLinecap="round"/><path d="M32 34 Q35 37 38 34" fill="none" stroke="#B8964A" strokeWidth="0.9" strokeLinecap="round"/></svg>,
    };
    const BRIEF_FIELDS = [
      {key:'subject',    label:'Subject'},
      {key:'audience',   label:'Audience'},
      {key:'emotion',    label:'Emotion'},
      {key:'style',      label:'Style'},
      {key:'lesson',     label:'Lesson'},
      {key:'visualWorld',label:'Visual World'},
    ];

    const EXP_FIELDS = [
      {icon:<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke={T2.text3} strokeWidth="1.1"/><path d="M7 4v3l2 1.5" stroke={T2.text3} strokeWidth="1" strokeLinecap="round"/></svg>, label:'Tone',        val:expMode.tone},
      {icon:<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke={T2.text3} strokeWidth="1.1"/><path d="M7 4v3l2 1.5" stroke={T2.text3} strokeWidth="1" strokeLinecap="round"/></svg>, label:'Duration',   val:expMode.duration},
      {icon:<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M4 5l3-3 3 3M4 9l3 3 3-3" stroke={T2.text3} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>, label:'Narration',  val:expMode.narration},
      {icon:<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 5v4l3-1.5v-1L2 5zM5 5v4l7-2V7L5 5z" stroke={T2.text3} strokeWidth="1" strokeLinejoin="round" fill="none"/></svg>, label:'Music',      val:expMode.music},
      {icon:<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke={T2.text3} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>, label:'Transitions', val:expMode.transitions},
    ];

    return (
      <div style={{display:"flex",flexDirection:"column",gap:0}}>

        {/* API error notice */}
        {apiError&&(
          <div style={{background:"rgba(138,158,132,0.07)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.18)",padding:"10px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
            <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>AI coach unavailable — showing a template story based on your brief.</span>
            <button onClick={()=>{setApiError(false);generate();}} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontFamily:T.sans,fontSize:11,fontWeight:600,padding:0,flexShrink:0}}>Try AI again →</button>
          </div>
        )}

        {/* ── STORY BRIEF ─────────────────────────────────────────────────── */}
        <div style={{marginBottom:isDesktop?28:20}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"3px",marginBottom:isDesktop?14:12}}>Story Brief</div>
          <div style={{display:"flex",flexWrap:isDesktop?"wrap":"nowrap",gap:"0",borderRadius:8,border:"0.5px solid "+T2.border,overflow:isDesktop?"hidden":"auto",background:T2.surface,WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
            {BRIEF_FIELDS.filter(f=>sw[f.key]).map((f,i,arr)=>(
              <div key={f.key} style={{padding:isDesktop?"14px 18px":"11px 14px",borderRight:i<arr.length-1?"0.5px solid "+T2.border:"none",flex:isDesktop?"1 1 auto":"0 0 auto",minWidth:isDesktop?120:130}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                  {BRIEF_ICONS[f.key]}
                  <span style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px"}}>{f.label}</span>
                </div>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?15:13,color:T2.text,lineHeight:1.2,fontWeight:500}}>{sw[f.key]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STORYBOARD ──────────────────────────────────────────────────── */}
        <div style={{marginBottom:isDesktop?32:24}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"3px",marginBottom:isDesktop?14:12}}>Storyboard — {scenes.length} Key Scenes</div>
          <div style={{display:"grid",gridTemplateColumns:isDesktop?"repeat(6,1fr)":"repeat(2,1fr)",gap:isDesktop?10:8}}>
            {scenes.map((scene,i)=>(
              <div key={i} style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,background:CREAM}}>
                {/* Sketch area */}
                <div style={{position:"relative",height:isDesktop?130:100,background:CREAM,overflow:"hidden"}}>
                  <SketchIllustration scene={scene} idx={i}/>
                  {/* Scene number */}
                  <div style={{position:"absolute",top:7,left:7,width:20,height:20,borderRadius:"50%",background:"rgba(58,48,40,0.12)",border:"0.5px solid "+INK_D,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:INK,opacity:0.7}}>{scene.number}</span>
                  </div>
                </div>
                {/* Text area */}
                <div style={{padding:isDesktop?"11px 12px":"9px 10px",borderTop:"0.5px solid "+T2.border,background:"#fff"}}>
                  <div style={{fontFamily:T.serif,fontSize:isDesktop?12:11,fontWeight:600,color:INK,marginBottom:3,lineHeight:1.25}}>{scene.title}</div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?10:9,color:"rgba(58,48,40,0.55)",lineHeight:1.4,margin:"0 0 6px",fontWeight:300}}>{scene.caption}</p>
                  <div style={{display:"inline-block",padding:"2px 9px",borderRadius:20,border:"0.5px solid rgba(58,48,40,0.2)",background:"rgba(58,48,40,0.04)"}}>
                    <span style={{fontFamily:T.sans,fontSize:isDesktop?9:8,color:INK,opacity:0.6,fontWeight:500}}>{scene.emotion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── EXPERIENCE MODE ──────────────────────────────────────────────── */}
        <div style={{marginBottom:isDesktop?28:20}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"3px",marginBottom:isDesktop?14:12}}>Experience</div>
          <div style={{display:"flex",flexDirection:"row",flexWrap:isDesktop?"nowrap":"wrap",gap:0,background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
            {EXP_FIELDS.map((f,i,arr)=>(
              <div key={i} style={{padding:isDesktop?"14px 18px":"11px 14px",borderRight:i<arr.length-1?"0.5px solid "+T2.border:"none",flex:"1 1 0",display:"flex",gap:10,alignItems:"flex-start",minWidth:isDesktop?0:110}}>
                <div style={{marginTop:2,flexShrink:0,opacity:0.6}}>{f.icon}</div>
                <div>
                  <div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>{f.label}</div>
                  <div style={{fontFamily:T.sans,fontSize:11,color:T2.text,fontWeight:400,lineHeight:1.4}}>{f.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STORY NARRATIVE ──────────────────────────────────────────────── */}
        <div>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"3px",marginBottom:isDesktop?16:12}}>Story Narrative</div>
          <div>
            {/* Story text */}
            <div style={{flex:1,background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:isDesktop?"28px 32px":"18px 20px"}}>
              {result.story
                ? result.story.split('\n\n').map((para,i)=>{
                    const isTitle = para.trim().endsWith(':');
                    const text = para.trim().replace(/:$/,'');
                    return text ? (
                      <p key={i} style={{fontFamily:isTitle?T.sans:T.serif,fontSize:isTitle?(isDesktop?9:8):(isDesktop?17:15),fontWeight:isTitle?700:400,color:isTitle?T.gold:T2.text,textTransform:isTitle?"uppercase":undefined,letterSpacing:isTitle?"2.5px":"-0.1px",lineHeight:isTitle?1:(isDesktop?1.85:1.75),margin:isTitle?"20px 0 10px":"0 0 16px"}}>{text}</p>
                    ) : null;
                  })
                : scenes.map((s,i)=>(
                    <div key={i} style={{marginBottom:i<scenes.length-1?20:0}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{s.title}</div>
                      <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.8,margin:0}}>{s.narrative}</p>
                    </div>
                  ))
              }
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div style={{marginTop:isDesktop?24:18,display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={reset} style={{flex:1,padding:isDesktop?"13px":"12px",borderRadius:4,border:"none",background:T.ink||"#2C2416",color:T2.bg||"#F7F3EC",fontSize:isDesktop?14:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Build Another Story →</button>
          <button onClick={()=>{setResult(null);setPhase('brief');}} style={{padding:isDesktop?"13px 18px":"12px 16px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:isDesktop?13:12,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>← Edit Brief</button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── useD8SequentialDots / D8SequentialDots ──────────────────────────────────
function useD8SequentialDots(active) {
  const [dotCount, setDotCount] = useState(0);
  useEffect(() => {
    if (!active) { setDotCount(0); return; }
    const timers = [1,2,3].map((n, i) => setTimeout(() => setDotCount(n), (i+1)*600));
    return () => timers.forEach(clearTimeout);
  }, [active]);
  return dotCount;
}
function D8SequentialDots({ dotCount }) {
  return (
    <div style={{ display:"flex", gap:8 }}>
      {[1,2,3].map(n => (
        <div key={n} style={{ width:8, height:8, borderRadius:"50%", background:n<=dotCount?"rgba(138,158,132,0.7)":"rgba(138,158,132,0.15)", transition:"background 0.3s" }}/>
      ))}
    </div>
  );
}

const STORY_CARDS = [
  {
    icon: s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><path d="M3 9h6"/><path d="M3 15h6"/></svg>,
    title: "The project I'll always remember",
    sub:   "A project that challenged you, taught you something, or made a real difference",
  },
  {
    icon: s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7a4 4 0 108 0 4 4 0 00-8 0"/><path d="M6 21v-2a4 4 0 014-4h2.5"/><path d="M19.5 17.5c.5-.5 1.5-1.5 1.5-2.5a2 2 0 00-4 0c0 1 1 2 1.5 2.5"/></svg>,
    title: "The mentor who changed my career",
    sub:   "Someone whose advice, belief, or challenge changed how you think, work, or lead",
  },
  {
    icon: s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    title: "The mistake that made me better",
    sub:   "A setback that became one of your greatest lessons",
  },
  {
    icon: s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18L13 4a1 1 0 00-1.73 0L3 20z"/><line x1="12" y1="11" x2="12" y2="15"/></svg>,
    title: "The challenge that changed me",
    sub:   "A moment that stretched you further than you thought possible",
  },
  {
    icon: s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    title: "The decision that shaped my future",
    sub:   "A choice that changed the direction of your career or life",
  },
  {
    icon: s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V16a2 2 0 002 2h4a2 2 0 002-2v-1.3A7 7 0 0012 2z"/></svg>,
    title: "The moment everything clicked",
    sub:   "A breakthrough that completely changed how you see your work or yourself",
  },
];

const BEAT_LABELS = ["Once upon a time…","Every day…","Until one day…","Because of that…","Because of that…","Until finally…"];

export function D8PracticeWidget({ T: Tp, T2: T2p, isDesktop = false, onSimulation }) {
  const T  = Tp  || Timport;
  const T2 = T2p || T2D;

  const [phase,       setPhase]       = useState('select');
  const [selected,    setSelected]    = useState(null);
  const [elapsed,     setElapsed]     = useState(0);
  const [transcript,  setTranscript]  = useState('');
  const [storyResult, setStoryResult] = useState(null);
  const [visCount,    setVisCount]    = useState(0);

  const recRef    = useRef(null);
  const srRef     = useRef(null);
  const liveRef   = useRef('');
  const timerRef  = useRef(null);
  const maxTimRef = useRef(null);

  const dotCount = useD8SequentialDots(phase === 'speak');

  useEffect(() => {
    if (phase === 'recording') {
      timerRef.current = setInterval(() => setElapsed(e => e+1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'reveal' || !storyResult) return;
    const delays = [0, 700, 1400, 2100, 2800, 3500, 4300, 4900, 5300];
    const timers = delays.map((d, i) => setTimeout(() => setVisCount(i+1), d));
    return () => timers.forEach(clearTimeout);
  }, [phase, storyResult]);

  async function startRec() {
    liveRef.current = '';
    setTranscript('');
    setElapsed(0);
    setPhase('recording');
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const sr = new SR();
      sr.continuous = true;
      sr.interimResults = true;
      sr.onresult = e => {
        let t = '';
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + ' ';
        liveRef.current = t.trim();
        setTranscript(liveRef.current);
      };
      sr.start();
      srRef.current = sr;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mr.start();
      recRef.current = mr;
    } catch (_) {}
    maxTimRef.current = setTimeout(doStop, 180000);
  }

  async function doStop() {
    clearTimeout(maxTimRef.current);
    try { srRef.current?.stop(); } catch (_) {}
    try { if (recRef.current?.state !== 'inactive') recRef.current.stop(); } catch (_) {}
    await new Promise(r => setTimeout(r, 1800));
    const final = liveRef.current || transcript || '';
    setTranscript(final);
    setPhase('processing');
    await callCoach(final);
  }

  async function callCoach(text) {
    const cardTitle = STORY_CARDS[selected]?.title || 'a career story';
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 900,
          system: `You are the AmplifyU coach and a master storyteller. The user has spoken freely for approximately 60 seconds about a real career story. Their chosen story territory was: "${cardTitle}". Your task is to extract six narrative beats from their transcript. Beat 1 (Once upon a time): the situation, context, or belief before everything changed. Beat 2 (Every day): their normal routine or mindset before the disruption. Beat 3 (Until one day): the turning point or inciting incident. Beat 4 (Because of that): their first response — what they chose to do. Beat 5 (Because of that): the deeper shift or consequence that followed. Beat 6 (Until finally): the resolution — where they ended up and what it meant. Use their actual words wherever possible. Write each beat in first person, 2–3 sentences maximum, in natural spoken English. Return a JSON object with exactly these keys: storyTitle (a specific, evocative 4–7 word name for this exact story — never generic, e.g. "The Presentation That Changed Everything"), beat1, beat2, beat3, beat4, beat5, beat6, coachObservation (one warm, specific sentence identifying the single most powerful moment — reference something they actually said), readyLine (return exactly: "Now let Story Architect turn this into something you can use in any room."). Return only valid JSON.`,
          messages: [{ role: 'user', content: `Transcript: "${text || 'No speech detected.'}"` }],
        }),
      });
      const data = await res.json();
      const raw  = data.content?.[0]?.text || '{}';
      const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || '{}');
      setStoryResult({
        storyTitle:       json.storyTitle       || 'Your Career Story',
        beat1:            json.beat1            || 'Something brought me to this moment.',
        beat2:            json.beat2            || 'Life was moving forward in its usual way.',
        beat3:            json.beat3            || 'Then something changed.',
        beat4:            json.beat4            || 'I responded differently than I expected.',
        beat5:            json.beat5            || 'What followed shifted something fundamental.',
        beat6:            json.beat6            || 'I came out the other side changed.',
        coachObservation: json.coachObservation || 'There is real power in what you just shared.',
        readyLine:        json.readyLine        || 'Now let Story Architect turn this into something you can use in any room.',
      });
    } catch (_) {
      setStoryResult({
        storyTitle:       'Your Career Story',
        beat1:            'Something brought me to this moment.',
        beat2:            'Life was moving forward in its usual way.',
        beat3:            'Then something changed.',
        beat4:            'I responded differently than I expected.',
        beat5:            'What followed shifted something fundamental.',
        beat6:            'I came out the other side changed.',
        coachObservation: 'There is real power in what you just shared.',
        readyLine:        'Now let Story Architect turn this into something you can use in any room.',
      });
    }
    setPhase('reveal');
  }

  // ── Select ────────────────────────────────────────────────────────────────
  if (phase === 'select') return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>REHEARSAL · DAY 8</div>
        <h2 style={{ fontFamily:T.serif, fontSize:isDesktop?32:26, fontWeight:600, color:T2.text, lineHeight:1.1, margin:0 }}>Find Your Story</h2>
      </div>
      <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, lineHeight:1.6, margin:0 }}>Choose the story territory that feels most true right now.</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {STORY_CARDS.map((c, i) => {
          const sel = selected === i;
          const sc  = sel ? T.gold : T2.text3;
          return (
            <div key={i} onClick={() => setSelected(i)} style={{ background:sel?"rgba(138,158,132,0.08)":T2.surface, borderRadius:8, border:`1px solid ${sel?T.gold:T2.border}`, padding:"18px 16px 16px", cursor:"pointer", transition:"all 0.18s" }}>
              <div style={{ marginBottom:10 }}>{c.icon(sc)}</div>
              <div style={{ fontFamily:T.serif, fontSize:isDesktop?17:16, fontWeight:600, color:T2.text, lineHeight:1.25, marginBottom:6 }}>{c.title}</div>
              <div style={{ fontFamily:T.sans, fontSize:12, color:T2.text3, lineHeight:1.5, fontWeight:300 }}>{c.sub}</div>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => selected !== null && setPhase('speak')}
        style={{ width:"100%", padding:"15px", borderRadius:4, border:"none", background:selected!==null?T.ink:T2.border, color:selected!==null?(T2.bg||"#F7F3EC"):T2.text4, fontSize:15, fontWeight:600, cursor:selected!==null?"pointer":"default", fontFamily:T.sans, minHeight:50, transition:"all 0.2s" }}>
        Let's Find It →
      </button>
    </div>
  );

  // ── Speak ─────────────────────────────────────────────────────────────────
  if (phase === 'speak') return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div>
        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>REHEARSAL · DAY 8</div>
        <h2 style={{ fontFamily:T.serif, fontSize:isDesktop?32:26, fontWeight:600, color:T2.text, lineHeight:1.1, margin:0 }}>Find Your Story</h2>
      </div>
      <h3 style={{ fontFamily:T.serif, fontSize:isDesktop?26:22, fontWeight:600, color:T2.text, lineHeight:1.2, margin:0 }}>{STORY_CARDS[selected]?.title}</h3>
      <div style={{ background:T2.surface, borderRadius:8, border:"0.5px solid "+T2.border, padding:"28px 24px 22px" }}>
        <div style={{ fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:16 }}>Your Story</div>
        <p style={{ fontFamily:T.serif, fontSize:isDesktop?22:19, color:T2.text, lineHeight:1.55, margin:0, fontWeight:500 }}>Choose a story. Speak for around 60 seconds. Your AmplifyU coach will find the shape of your story and turn it into something you can use anywhere.</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column" }}>
        {["The situation before everything changed","What disrupted things or created a turning point","How you responded and what shifted","Where you ended up — the outcome and what it meant"].map((beat, i) => (
          <div key={i} style={{ padding:"9px 0 9px 16px", borderLeft:"2px solid rgba(138,158,132,0.4)" }}>
            <span style={{ fontFamily:T.serif, fontSize:14, color:T2.text, lineHeight:1.5 }}>{beat}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"8px 0" }}>
        <D8SequentialDots dotCount={dotCount}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, margin:0 }}>Just speak. We'll find the shape of your story.</p>
      </div>
      <button onClick={startRec} style={{ width:"100%", padding:"15px", borderRadius:4, border:"none", background:T.ink, color:T2.bg||"#F7F3EC", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:50 }}>
        Start Speaking →
      </button>
    </div>
  );

  // ── Recording ─────────────────────────────────────────────────────────────
  if (phase === 'recording') return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div>
        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>REHEARSAL · DAY 8</div>
        <h2 style={{ fontFamily:T.serif, fontSize:isDesktop?32:26, fontWeight:600, color:T2.text, lineHeight:1.1, margin:0 }}>Find Your Story</h2>
      </div>
      <p style={{ fontFamily:T.serif, fontSize:13, fontStyle:"italic", color:T2.text3, margin:0 }}>{STORY_CARDS[selected]?.title}</p>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, padding:"20px 24px", background:T2.surface, borderRadius:8, border:"0.5px solid "+T2.border }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#C8524A", flexShrink:0 }}/>
        <span style={{ fontFamily:T.sans, fontSize:42, fontWeight:300, color:T2.text, letterSpacing:"0.04em" }}>
          {String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}
        </span>
      </div>
      <div style={{ display:"flex", flexDirection:"column" }}>
        {["The situation before everything changed","What disrupted things or created a turning point","How you responded and what shifted","Where you ended up — the outcome and what it meant"].map((beat, i) => (
          <div key={i} style={{ padding:"9px 0 9px 16px", borderLeft:"2px solid rgba(138,158,132,0.4)" }}>
            <span style={{ fontFamily:T.serif, fontSize:14, color:T2.text, lineHeight:1.5 }}>{beat}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily:T.sans, fontSize:12, color:T2.text4, margin:0, textAlign:"center" }}>Aim for around 60 seconds · 3 minute max</p>
      <button onClick={doStop} style={{ width:"100%", padding:"15px", borderRadius:4, border:"1px solid "+T2.border, background:"transparent", color:T2.text, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:50 }}>
        Done — Stop Recording
      </button>
    </div>
  );

  // ── Processing ────────────────────────────────────────────────────────────
  if (phase === 'processing') return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:340 }}>
      <div style={{ background:"#0E0B08", borderRadius:10, padding:"40px 44px", maxWidth:460, width:"100%", textAlign:"center" }}>
        <p style={{ fontFamily:T.serif, fontSize:isDesktop?22:19, fontStyle:"italic", color:"rgba(245,239,230,0.9)", lineHeight:1.55, margin:"0 0 14px" }}>Finding the shape of your story...</p>
        <p style={{ fontFamily:T.sans, fontSize:13, color:"rgba(245,239,230,0.38)", margin:0, fontWeight:300 }}>Your AmplifyU coach is listening.</p>
      </div>
    </div>
  );

  // ── Reveal ────────────────────────────────────────────────────────────────
  if (phase === 'reveal' && storyResult) {
    const { storyTitle, beat1, beat2, beat3, beat4, beat5, beat6, coachObservation, readyLine } = storyResult;
    const beats = [beat1, beat2, beat3, beat4, beat5, beat6];
    return (
      <div style={{ display:"flex", flexDirection:"column" }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:14 }}>Your Career Story</div>
          <h2 style={{ fontFamily:T.serif, fontSize:isDesktop?38:28, fontWeight:600, color:T2.text, lineHeight:1.1, margin:0 }}>{storyTitle}</h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", marginBottom:visCount>=6?24:0 }}>
          {beats.map((beat, i) => visCount >= i+1 ? (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"32% 68%", gap:16, padding:"15px 0", borderBottom:"0.5px solid "+T2.divider, animation:"fadeUp 0.5s ease both" }}>
              <div style={{ fontFamily:T.serif, fontSize:13, fontStyle:"italic", color:T2.text4, lineHeight:1.5, paddingTop:2 }}>{BEAT_LABELS[i]}</div>
              <div style={{ fontFamily:T.serif, fontSize:isDesktop?15:14, color:T2.text, lineHeight:1.65 }}>{beat}</div>
            </div>
          ) : null)}
        </div>
        {visCount >= 7 && (
          <div style={{ border:"0.5px solid "+T2.border, borderLeftWidth:3, borderLeftColor:"rgba(138,158,132,0.45)", borderRadius:"0 6px 6px 0", background:T2.surface, padding:"20px 22px", marginBottom:16, animation:"fadeUp 0.5s ease both" }}>
            <div style={{ fontFamily:T.sans, fontSize:9, fontWeight:700, color:T2.text3, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>Behind the Scenes</div>
            <p style={{ fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text3, lineHeight:1.75, margin:0, fontWeight:300 }}>Without realising it, you just built your story using the same narrative structure behind some of Pixar's most beloved films. The beats you spoke — once upon a time, until one day, until finally — are the backbone of the Pixar Story Framework. The same structure works in boardrooms, pitches, and conversations.</p>
          </div>
        )}
        {visCount >= 8 && (
          <div style={{ background:"#0E0B08", borderRadius:8, padding:"24px 26px", marginBottom:16, animation:"fadeUp 0.5s ease both" }}>
            <div style={{ fontFamily:T.sans, fontSize:9, fontWeight:700, color:"rgba(138,158,132,0.6)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:14 }}>Your AmplifyU Coach Says</div>
            <p style={{ fontFamily:T.serif, fontSize:isDesktop?20:18, color:"rgba(245,239,230,0.9)", lineHeight:1.55, margin:0, fontWeight:500 }}>{coachObservation}</p>
          </div>
        )}
        {visCount >= 9 && (
          <>
            <p style={{ fontFamily:T.serif, fontSize:isDesktop?15:14, fontStyle:"italic", color:T2.text3, lineHeight:1.6, margin:"0 0 18px", textAlign:"center", animation:"fadeUp 0.5s ease both" }}>{readyLine}</p>
            <button onClick={() => onSimulation?.()} style={{ width:"100%", padding:"15px", borderRadius:4, border:"none", background:T.gold, color:"white", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:50, animation:"fadeUp 0.5s ease both" }}>
              ✦ Transform It With Story Architect →
            </button>
          </>
        )}
      </div>
    );
  }

  return null;
}
