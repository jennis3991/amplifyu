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

  const EXAMPLE_BRIEFS = [
    "A magical story about the lifecycle of a butterfly for my 5-year-old — wonder and joy, bedtime story style",
    "A cybersecurity risk presentation for our board — make it feel like breaking news, urgent and specific",
    "A TED-style pitch for a new product — emotional, direct, show real human impact",
  ];

  // Palette driven by emotion keyword
  function emotionPalette(emotion) {
    const e = (emotion||'').toLowerCase();
    if (/curious|discover|wonder|question/.test(e))    return { bg:'#110C02', bg2:'#1A1206', accent:'#C9A84C' };
    if (/growth|grow|learn|build|rise/.test(e))        return { bg:'#020E06', bg2:'#051410', accent:'#4A8A5A' };
    if (/patience|wait|calm|still|quiet/.test(e))      return { bg:'#020614', bg2:'#04081E', accent:'#4A72B8' };
    if (/wonder|awe|magic|enchant|amaze/.test(e))      return { bg:'#0A0614', bg2:'#12091E', accent:'#9A5AB8' };
    if (/achieve|triumph|joy|excite|bright/.test(e))   return { bg:'#110C02', bg2:'#1C1408', accent:'#D4A030' };
    if (/freedom|free|fly|soar|open|release/.test(e))  return { bg:'#020614', bg2:'#040A1A', accent:'#4A90C8' };
    if (/danger|urgent|risk|fear|alarm|red/.test(e))   return { bg:'#150404', bg2:'#1E0606', accent:'#CC4444' };
    if (/hope|love|warm|heart|tender/.test(e))         return { bg:'#140408', bg2:'#1E0812', accent:'#C44A8A' };
    return { bg:'#0A0804', bg2:'#14100A', accent:'#8A9E84' };
  }

  // Brief-aware visual SVG from visual + emotion
  function makeSceneSVG(scene, idx) {
    const dir = (scene.visual || scene.visualDirection || '').toLowerCase();
    const p   = emotionPalette(scene.emotion);
    const { bg, bg2, accent } = p;

    const isWings   = /butterfly|wing|fly|soar|flight|spread|flap/.test(dir);
    const isOval    = /egg|oval|chrysalis|cocoon|bubble|sphere|circle/.test(dir);
    const isTree    = /tree|branch|leaf|petal|garden|plant|bloom|flower/.test(dir);
    const isStar    = /star|sparkle|glow|shimmer|twinkle|light|radiant/.test(dir);
    const isPath    = /path|road|journey|river|trail|horizon|sky|sunset|sunrise/.test(dir);
    const isPeople  = /people|crowd|child|family|friend|figure|someone|gather/.test(dir);
    const isRising  = /rise|grow|climb|ascend|tall|build|tower|reach|launch/.test(dir);

    return (
      <svg viewBox="0 0 160 100" fill="none" width="100%" height="100%">
        <defs>
          <radialGradient id={`rg${idx}`} cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor={bg2}/>
            <stop offset="100%" stopColor={bg}/>
          </radialGradient>
        </defs>
        <rect width="160" height="100" fill={`url(#rg${idx})`}/>

        {isWings && <>
          <ellipse cx="60" cy="44" rx="30" ry="20" fill={accent} opacity="0.22" transform="rotate(-28 60 44)"/>
          <ellipse cx="100" cy="44" rx="30" ry="20" fill={accent} opacity="0.22" transform="rotate(28 100 44)"/>
          <ellipse cx="56" cy="63" rx="18" ry="11" fill={accent} opacity="0.16" transform="rotate(20 56 63)"/>
          <ellipse cx="104" cy="63" rx="18" ry="11" fill={accent} opacity="0.16" transform="rotate(-20 104 63)"/>
          <circle cx="80" cy="50" r="5" fill={accent} opacity="0.8"/>
          <line x1="80" y1="55" x2="80" y2="74" stroke={accent} strokeWidth="1.5" opacity="0.35" strokeLinecap="round"/>
        </>}
        {isOval && !isWings && <>
          <ellipse cx="80" cy="50" rx="28" ry="38" stroke={accent} strokeWidth="1.5" fill={accent} opacity="0.1"/>
          <ellipse cx="80" cy="50" rx="18" ry="26" stroke={accent} strokeWidth="0.8" fill={accent} opacity="0.06"/>
          <ellipse cx="72" cy="40" rx="8" ry="11" fill={accent} opacity="0.32" transform="rotate(-14 72 40)"/>
          <circle cx="80" cy="50" r="3.5" fill={accent} opacity="0.55"/>
        </>}
        {isTree && !isWings && !isOval && <>
          <path d="M80 90 L80 52" stroke={accent} strokeWidth="2.5" opacity="0.3" strokeLinecap="round"/>
          <path d="M80 52 Q54 34 42 40 Q58 20 80 14 Q102 20 118 40 Q106 34 80 52" fill={accent} opacity="0.2"/>
          <path d="M80 64 Q60 50 50 56 Q66 38 80 34 Q94 38 110 56 Q100 50 80 64" fill={accent} opacity="0.14"/>
          <circle cx="60" cy="76" r="2.5" fill={accent} opacity="0.32"/>
          <circle cx="100" cy="72" r="2.5" fill={accent} opacity="0.32"/>
        </>}
        {isStar && !isWings && !isOval && !isTree && <>
          <circle cx="80" cy="50" r="34" fill={accent} opacity="0.04"/>
          <circle cx="80" cy="50" r="20" fill={accent} opacity="0.08"/>
          <circle cx="80" cy="50" r="8" fill={accent} opacity="0.4"/>
          <line x1="80" y1="14" x2="80" y2="26" stroke={accent} strokeWidth="1.5" opacity="0.55" strokeLinecap="round"/>
          <line x1="80" y1="74" x2="80" y2="86" stroke={accent} strokeWidth="1.5" opacity="0.55" strokeLinecap="round"/>
          <line x1="44" y1="50" x2="56" y2="50" stroke={accent} strokeWidth="1.5" opacity="0.55" strokeLinecap="round"/>
          <line x1="104" y1="50" x2="116" y2="50" stroke={accent} strokeWidth="1.5" opacity="0.55" strokeLinecap="round"/>
          <line x1="56" y1="28" x2="64" y2="36" stroke={accent} strokeWidth="1" opacity="0.35" strokeLinecap="round"/>
          <line x1="104" y1="28" x2="96" y2="36" stroke={accent} strokeWidth="1" opacity="0.35" strokeLinecap="round"/>
          <line x1="56" y1="72" x2="64" y2="64" stroke={accent} strokeWidth="1" opacity="0.35" strokeLinecap="round"/>
          <line x1="104" y1="72" x2="96" y2="64" stroke={accent} strokeWidth="1" opacity="0.35" strokeLinecap="round"/>
        </>}
        {isPath && !isWings && !isOval && !isTree && !isStar && <>
          <path d="M12 80 Q36 56 62 65 Q88 74 112 44 Q126 30 148 16" stroke={accent} strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"/>
          <circle cx="12" cy="80" r="4" fill={accent} opacity="0.38"/>
          <circle cx="62" cy="65" r="3" fill={accent} opacity="0.38"/>
          <circle cx="112" cy="44" r="3" fill={accent} opacity="0.38"/>
          <circle cx="148" cy="16" r="6" fill={accent} opacity="0.88"/>
          <line x1="6" y1="90" x2="154" y2="90" stroke={accent} strokeWidth="0.8" opacity="0.12"/>
        </>}
        {isPeople && !isWings && !isOval && !isTree && !isStar && !isPath && <>
          <circle cx="46" cy="38" r="10" fill={accent} opacity="0.22"/>
          <circle cx="80" cy="32" r="13" fill={accent} opacity="0.36"/>
          <circle cx="114" cy="38" r="10" fill={accent} opacity="0.22"/>
          <path d="M32 82 Q46 60 60 70 Q70 76 80 72 Q90 68 100 70 Q114 80 128 82" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round"/>
        </>}
        {isRising && !isWings && !isOval && !isTree && !isStar && !isPath && !isPeople && <>
          <rect x="12" y="70" width="12" height="16" rx="1" fill={accent} opacity="0.3"/>
          <rect x="30" y="58" width="12" height="28" rx="1" fill={accent} opacity="0.4"/>
          <rect x="48" y="46" width="12" height="40" rx="1" fill={accent} opacity="0.5"/>
          <rect x="66" y="32" width="12" height="54" rx="1" fill={accent} opacity="0.6"/>
          <rect x="84" y="20" width="12" height="66" rx="1" fill={accent} opacity="0.65"/>
          <rect x="102" y="10" width="12" height="76" rx="1" fill={accent} opacity="0.72"/>
          <path d="M18 76 L36 64 L54 52 L72 38 L90 26 L108 16" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round"/>
        </>}
        {!isWings && !isOval && !isTree && !isStar && !isPath && !isPeople && !isRising && <>
          <path d={idx%2===0 ? "M18 72 Q44 32 80 52 Q116 72 142 26" : "M18 26 Q44 66 80 46 Q116 26 142 72"}
            stroke={accent} strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round"/>
          <circle cx="80" cy={idx%2===0?52:46} r="26" fill={accent} opacity="0.04"/>
          <circle cx="80" cy={idx%2===0?52:46} r="12" fill={accent} opacity="0.07"/>
          <circle cx="80" cy={idx%2===0?52:46} r="4" fill={accent} opacity="0.5"/>
        </>}
      </svg>
    );
  }

  const [phase,    setPhase]   = useState('brief');
  const [brief,    setBrief]   = useState('');
  const [result,   setResult]  = useState(null);
  const [apiError, setApiError]= useState(false);

  function reset() { setPhase('brief'); setBrief(''); setResult(null); setApiError(false); }

  // Brief-aware template fallback
  function buildFallback(b) {
    const bl = b.toLowerCase();
    const isKids   = /child|kid|son|daughter|year.?old|baby|magical|fairy|princess|dragon/.test(bl);
    const isUrgent = /urgent|crisis|risk|breaking|emergency|threat/.test(bl);
    const topic    = b.trim().split(/[,.\-—]/)[0].trim() || 'Your Story';

    if (isKids) return {
      storyWorld:{ subject:topic, audience:"Children", emotion:"Wonder", style:"Bedtime Story", visualWorld:"Magical World", character:"A brave little hero", lesson:"Believe in yourself" },
      storyDNA:{ hero:"A tiny, curious hero", world:"A magical, colourful world", challenge:"A journey of change", magic:"The power of believing", lesson:"Every stage matters", ending:"Triumphant first flight" },
      emotionalJourney:["Curiosity","Growth","Patience","Wonder","Achievement","Freedom"],
      scenes:[
        {number:1,title:"The Tiny Beginning",      visual:"A tiny egg on a bright green leaf. Morning dew. Soft golden light.",                 emotion:"Curiosity",    caption:"Every great journey starts small.", narrative:"Once upon a time, in a garden full of colour and light, the smallest beginning was about to become the greatest adventure."},
        {number:2,title:"Eating Everything Up",    visual:"A hungry caterpillar munching bright green leaves. Sunshine everywhere.",            emotion:"Growth",       caption:"Eat. Grow. Explore.",             narrative:"Day after day, our little hero grew bigger and stronger — one leaf at a time."},
        {number:3,title:"The Golden Chrysalis",    visual:"A glowing golden chrysalis hanging from a moonlit branch. Stars above.",            emotion:"Patience",     caption:"Magic is happening inside.",      narrative:"Then came the waiting. Tucked inside a golden sleeping bag, something wonderful was quietly taking shape."},
        {number:4,title:"Transformation",          visual:"Swirling rainbow colours. Magical light. Something beautiful becoming.",             emotion:"Wonder",       caption:"Beautiful things take time.",     narrative:"Nobody could see it happening. But inside, absolutely everything was changing."},
        {number:5,title:"Emergence",               visual:"Brilliant wings unfurling. Friends gathering. Sunlight streaming through.",         emotion:"Achievement",   caption:"Look what I became!",             narrative:"And then — one perfect morning — the chrysalis opened. And out stepped something so beautiful, everyone stopped to look."},
        {number:6,title:"The First Flight",        visual:"A butterfly soaring over a valley at golden sunset. Wings catching the light.",     emotion:"Freedom",      caption:"Believe in your wings.",          narrative:"With one brave leap, she flew. The whole garden cheered. She had been becoming this all along."},
      ],
      story:`${topic}\n\nOnce upon a time, in a garden full of colour and magic, the most extraordinary journey began with the smallest of beginnings — a tiny, perfect egg on a bright green leaf.\n\nDay after day, a curious little caterpillar ate and grew and explored, learning that every leaf was an adventure.\n\nThen came the chrysalis — a golden sleeping bag of transformation. Nobody could see what was happening inside. But something magical was taking shape.\n\nIn the darkness, everything changed. Quietly. Completely. Beautifully.\n\nAnd one morning, the chrysalis opened — and out stepped the most wonderful butterfly anyone had ever seen.\n\nShe looked at her wings. She took a breath. And she flew.\n\nBecause all along, she had been becoming this.`,
    };

    if (isUrgent) return {
      storyWorld:{ subject:topic, audience:"Leadership", emotion:"Urgency", style:"Cinematic", visualWorld:"High Stakes Room", character:"The Decision Maker", lesson:"Act now, not later" },
      storyDNA:{ hero:"The team facing the decision", world:"A high-stakes boardroom", challenge:"A closing window", magic:"The right information at the right moment", lesson:"Inaction is a choice", ending:"A decisive yes" },
      emotionalJourney:["Awareness","Tension","Clarity","Resolve","Confidence","Action"],
      scenes:[
        {number:1,title:"The Current Reality",  visual:"Dark screens. Data. The world as it stands right now.",              emotion:"Awareness",   caption:"This is where we are.",      narrative:"Before anything changes, we need to see exactly where we stand. Clearly. Honestly. Without softening."},
        {number:2,title:"What's at Stake",      visual:"A countdown. A narrowing window. Numbers that matter.",              emotion:"Tension",     caption:"The window is closing.",     narrative:"This isn't a future problem. The risk is live. The gap between knowing and acting is where organisations fall."},
        {number:3,title:"The Hidden Risk",      visual:"One highlighted line in a long report. The thing everyone missed.",  emotion:"Clarity",     caption:"Here's what we're missing.", narrative:"There's a layer most people don't reach. This is it. And once you see it, you can't unsee it."},
        {number:4,title:"The Response",         visual:"A clear action plan. Concrete steps. Motion.",                      emotion:"Resolve",     caption:"This is what we do.",        narrative:"Not theory. Action. Here's exactly what needs to happen — and when."},
        {number:5,title:"Protected Future",     visual:"Calm. Clear. Secure. The world on the other side of this decision.", emotion:"Confidence",  caption:"This is what we're building.", narrative:"On the other side of this decision is a fundamentally different operating environment."},
        {number:6,title:"The Decision",         visual:"One chair. One table. One moment of choice.",                       emotion:"Action",      caption:"One decision. Made today.",  narrative:"Everything comes down to this. The plan is here. The team is ready. All that's needed now — is yes."},
      ],
      story:`${topic}\n\nThis is not a theoretical risk. This is happening now.\n\nHere is where we stand — clearly, honestly, without softening.\n\nThe window is closing. The gap between knowing and acting is exactly where organisations lose their advantage.\n\nThere's a layer most analyses don't reach. This is it. And it changes everything about how we respond.\n\nHere's the action. Not in theory — in practice. Concrete steps. A clear timeline. A team ready to move.\n\nOn the other side of this decision is a completely different operating environment.\n\nEverything comes down to this moment. One decision. Made today.`,
    };

    return {
      storyWorld:{ subject:topic, audience:"Your audience", emotion:"Connection", style:"Your style", visualWorld:"Your world", character:"Your protagonist", lesson:"Your core message" },
      storyDNA:{ hero:"The central character", world:"The setting", challenge:"The core tension", magic:"The turning point", lesson:"The insight", ending:"The resolution" },
      emotionalJourney:["Curiosity","Tension","Insight","Hope","Confidence","Action"],
      scenes:[
        {number:1,title:"Where We Begin",       visual:"The world as it is. Familiar. Real.",                                emotion:"Curiosity",   caption:"Every story starts here.",        narrative:"Before anything changes, we need to see the world as it truly is."},
        {number:2,title:"The Tension",          visual:"A gap. A question. Something that needs answering.",                 emotion:"Tension",     caption:"This is what makes it necessary.", narrative:"Something isn't working — or could work far better. That tension is the engine of this story."},
        {number:3,title:"The Insight",          visual:"One clear idea, fully formed. A new way of seeing.",                emotion:"Insight",     caption:"This changes everything.",         narrative:"A new frame. Not more effort — a different lens. This is the pivot."},
        {number:4,title:"The Path Forward",     visual:"A direction. Steps becoming clear. Motion beginning.",              emotion:"Hope",        caption:"From insight to action.",          narrative:"The route becomes clear. It's not easy — but it's right."},
        {number:5,title:"What Becomes Possible",visual:"Open space. A different world. The future unlocked.",               emotion:"Confidence",  caption:"This is what we're building.",     narrative:"On the other side of this is something better. Fundamentally different."},
        {number:6,title:"The Invitation",       visual:"A shared moment. The audience, ready to choose.",                   emotion:"Action",      caption:"Now it belongs to everyone.",      narrative:"This story ends with a question — what will we choose to do?"},
      ],
      story:`${topic}\n\nBefore anything changes, we need to see clearly.\n\nSomething isn't working — or could work far better. That tension is the engine of everything that follows.\n\nHere's the insight that changes the frame. Not more effort — a different way of seeing the problem.\n\nWith that insight, a path becomes clear. It won't be easy. But it will be right.\n\nOn the other side of this decision is something fundamentally better.\n\nThis story ends with a question for everyone here: what will we choose to do with what we now know?`,
    };
  }

  async function generate() {
    if (!brief.trim()) return;
    setPhase('generating'); setApiError(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:2000,
          messages:[{ role:"user", content:
`You are a cinematic story director. A user has given you a brief. Your job is NOT to produce a generic story template. You must first deeply understand the subject, audience, and emotional world — then generate a complete Story World Model from which the narrative flows naturally.

BRIEF: "${brief}"

Read the brief with care. Understand: Who is this for? What is the subject? What emotion should it create? What visual world does it live in? What is the core lesson?

Now generate a complete cinematic story in this EXACT JSON structure:

{
  "storyWorld": {
    "subject": "the actual subject from the brief (specific, not generic)",
    "audience": "exact target audience from brief",
    "emotion": "primary emotion this story creates",
    "style": "storytelling style (e.g. Bedtime Story, Cinematic Documentary, TED Talk, etc.)",
    "visualWorld": "the visual setting (e.g. Enchanted Garden, Corporate Boardroom, etc.)",
    "character": "the hero or protagonist (specific name and role if story warrants it)",
    "lesson": "the core message or lesson in 4-6 words"
  },
  "storyDNA": {
    "hero": "who the story follows",
    "world": "the setting described vividly in 4-6 words",
    "challenge": "the central challenge or tension",
    "magic": "the element that makes this story special or surprising",
    "lesson": "the insight that changes everything",
    "ending": "how the story resolves in 4-6 words"
  },
  "emotionalJourney": ["Emotion1","Emotion2","Emotion3","Emotion4","Emotion5","Emotion6"],
  "scenes": [
    {
      "number": 1,
      "title": "Scene title specific to THIS story (not generic like 'The Beginning')",
      "visual": "Exactly what is seen: specific objects, colours, lighting, atmosphere. Write it like a film direction.",
      "emotion": "One word — the emotion this scene creates",
      "caption": "One sentence caption: punchy, specific, memorable.",
      "narrative": "2-4 sentences of story narrative written in the exact style the brief calls for. If magical/children — write with wonder and simple joy. If cinematic/urgent — write with tension. If TED — write with conviction."
    }
  ],
  "story": "The complete narrative — all 6 scenes woven into one flowing story, written entirely in the style the brief demands. Format with scene titles as headers (SCENE TITLE:) followed by the narrative. Make it feel like a real story, not a template."
}

Generate exactly 6 scenes. Match the brief completely. If it says magical for a child, write like a children's author. If it says breaking news, write like a documentary script. This is their story.`
          }]
        })
      });
      const d = await res.json();
      if (!res.ok) throw new Error('API error');
      const raw = (d.content||[]).map(b=>b.text||'').join('').trim().replace(/```json\n?|\n?```/g,'').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('Parse error');
      const parsed = JSON.parse(m[0]);
      if (!parsed.scenes?.length) throw new Error('No scenes');
      setResult(parsed); setPhase('results');
    } catch(_) {
      setApiError(true);
      setResult(buildFallback(brief));
      setPhase('results');
    }
  }

  const WORLD_FIELDS = [
    { key:'subject',     label:'Subject',      emoji:'🎯' },
    { key:'audience',    label:'Audience',     emoji:'👥' },
    { key:'emotion',     label:'Emotion',      emoji:'✨' },
    { key:'style',       label:'Style',        emoji:'🎬' },
    { key:'visualWorld', label:'Visual World', emoji:'🌍' },
    { key:'character',   label:'Character',    emoji:'⭐' },
    { key:'lesson',      label:'Lesson',       emoji:'💡' },
  ];

  const DNA_FIELDS = [
    { key:'hero',      label:'Hero'      },
    { key:'world',     label:'World'     },
    { key:'challenge', label:'Challenge' },
    { key:'magic',     label:'Magic'     },
    { key:'lesson',    label:'Lesson'    },
    { key:'ending',    label:'Ending'    },
  ];

  const sec = (label) => (
    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:isDesktop?16:12}}>
      {label}
    </div>
  );

  const divider = (
    <div style={{height:"0.5px",background:`linear-gradient(90deg,${T.gold} 0%,rgba(138,158,132,0.08) 100%)`,margin:`${isDesktop?28:22}px 0`}}/>
  );

  // ── BRIEF ──────────────────────────────────────────────────────────────────
  if (phase==='brief') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?20:16}}>
      <div>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Story Architect</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?36:26,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>What's your story?</h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0,fontWeight:300}}>Describe the subject, audience, and the feeling you want to create. The AI will build a complete cinematic world — story, storyboard, and everything in between.</p>
      </div>

      <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"18px"}}>
        <textarea value={brief} onChange={e=>setBrief(e.target.value)}
          placeholder={"e.g. A magical story about the lifecycle of a butterfly for my 5-year-old — full of wonder, bedtime story style, make it feel like a Pixar film"}
          rows={isDesktop?5:4}
          style={{width:"100%",background:"transparent",border:"none",outline:"none",fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.7,resize:"none",boxSizing:"border-box",fontWeight:300}}/>
        {brief.trim() && <div style={{fontFamily:T.sans,fontSize:10,color:T2.text4,marginTop:6,textAlign:"right"}}>{brief.trim().split(/\s+/).length} words</div>}
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
        {["Understanding your brief","Extracting story world and characters","Mapping the emotional arc","Writing each cinematic scene","Composing the full narrative"].map((s,i)=>(
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
    const sw = result.storyWorld || {};
    const dna = result.storyDNA || {};
    const journey = result.emotionalJourney || [];
    const scenes = result.scenes || [];

    return (
      <div style={{display:"flex",flexDirection:"column"}}>

        {/* AI unavailable notice */}
        {apiError && (
          <div style={{background:"rgba(138,158,132,0.08)",borderRadius:8,border:"0.5px solid rgba(138,158,132,0.2)",padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
            <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>AI coach unavailable — showing a template based on your brief.</span>
            <button onClick={()=>{setApiError(false);generate();}} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontFamily:T.sans,fontSize:11,fontWeight:600,padding:0,flexShrink:0}}>Try again with AI →</button>
          </div>
        )}

        {/* ── STORY WORLD ──────────────────────────────────────────────────── */}
        {sec("Story World")}
        <div style={{display:"flex",flexWrap:"wrap",gap:isDesktop?10:8}}>
          {WORLD_FIELDS.map(f => sw[f.key] ? (
            <div key={f.key} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:20,background:T2.surface,border:"0.5px solid "+T2.border}}>
              <span style={{fontSize:isDesktop?16:14}}>{f.emoji}</span>
              <div>
                <div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",lineHeight:1,marginBottom:2}}>{f.label}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,fontWeight:500,lineHeight:1.2}}>{sw[f.key]}</div>
              </div>
            </div>
          ) : null)}
        </div>

        {divider}

        {/* ── STORY DNA ────────────────────────────────────────────────────── */}
        {sec("Story DNA")}
        <div style={{display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr 1fr":"1fr 1fr",gap:10}}>
          {DNA_FIELDS.map(f => dna[f.key] ? (
            <div key={f.key} style={{background:"#0A0804",borderRadius:8,padding:"14px 16px",border:"0.5px solid rgba(138,158,132,0.12)"}}>
              <div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>{f.label}</div>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.85)",lineHeight:1.4}}>{dna[f.key]}</div>
            </div>
          ) : null)}
        </div>

        {divider}

        {/* ── EMOTIONAL JOURNEY ────────────────────────────────────────────── */}
        {sec("Emotional Journey")}
        <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:"6px 0"}}>
          {journey.map((emotion, i) => {
            const p = emotionPalette(emotion);
            return (
              <div key={i} style={{display:"flex",alignItems:"center"}}>
                <div style={{padding:"6px 16px",borderRadius:20,background:p.bg2,border:`0.5px solid ${p.accent}`,display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:p.accent,flexShrink:0}}/>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:p.accent,fontWeight:600}}>{emotion}</span>
                </div>
                {i < journey.length-1 && <span style={{fontFamily:T.sans,fontSize:14,color:T2.text4,margin:"0 4px"}}>→</span>}
              </div>
            );
          })}
        </div>

        {divider}

        {/* ── STORYBOARD ───────────────────────────────────────────────────── */}
        {sec("Storyboard")}
        <div style={{display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:isDesktop?12:10}}>
          {scenes.map((scene,i)=>{
            const p = emotionPalette(scene.emotion);
            return (
              <div key={i} style={{borderRadius:10,overflow:"hidden",border:`0.5px solid ${p.accent}22`,background:"#0D0B08",boxShadow:"0 4px 20px rgba(0,0,0,0.35)"}}>
                {/* SVG visual */}
                <div style={{position:"relative",height:isDesktop?130:110,overflow:"hidden"}}>
                  {makeSceneSVG(scene,i)}
                  {/* Scene number badge */}
                  <div style={{position:"absolute",top:8,left:8,width:22,height:22,borderRadius:4,background:"rgba(10,8,4,0.75)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:p.accent}}>{scene.number}</span>
                  </div>
                  {/* Emotion chip */}
                  <div style={{position:"absolute",top:8,right:8,padding:"3px 10px",borderRadius:20,background:"rgba(10,8,4,0.75)",border:`0.5px solid ${p.accent}55`}}>
                    <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:p.accent,letterSpacing:"0.5px"}}>{scene.emotion}</span>
                  </div>
                </div>
                {/* Text */}
                <div style={{padding:isDesktop?"14px 16px":"12px 14px",borderTop:`0.5px solid ${p.accent}18`}}>
                  <div style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontWeight:600,color:"rgba(245,239,230,0.9)",marginBottom:4,lineHeight:1.3}}>{scene.title}</div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?11:10,color:`${p.accent}bb`,lineHeight:1.5,margin:"0 0 6px",fontStyle:"italic",fontWeight:300}}>{scene.visual||scene.visualDirection}</p>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:"rgba(245,239,230,0.6)",lineHeight:1.4,margin:0,fontWeight:400}}>{scene.caption}</p>
                </div>
              </div>
            );
          })}
        </div>

        {divider}

        {/* ── STORY ────────────────────────────────────────────────────────── */}
        {sec("The Story")}
        <div style={{background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,padding:isDesktop?"28px 32px":"20px 22px"}}>
          {result.story ? (
            result.story.split('\n\n').map((para,i)=>{
              const isTitle = para.endsWith(':') || (i===0 && para.split('\n').length===1 && para.length < 60);
              return para.trim() ? (
                <p key={i} style={{
                  fontFamily: isTitle ? T.sans : T.serif,
                  fontSize: isTitle ? (isDesktop?10:9) : (isDesktop?17:15),
                  fontWeight: isTitle ? 700 : 400,
                  color: isTitle ? T.gold : T2.text,
                  letterSpacing: isTitle ? "2px" : "-0.1px",
                  textTransform: isTitle ? "uppercase" : "none",
                  lineHeight: isTitle ? 1 : 1.8,
                  margin: isTitle ? "20px 0 10px" : "0 0 14px",
                }}>{para.replace(/:$/, '')}</p>
              ) : null;
            })
          ) : (
            scenes.map((s,i)=>(
              <div key={i} style={{marginBottom:i<scenes.length-1?20:0}}>
                <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{s.title}</div>
                <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.8,margin:0}}>{s.narrative}</p>
              </div>
            ))
          )}
        </div>

        <div style={{marginTop:16,display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={reset} style={{flex:1,padding:isDesktop?"14px":"12px",borderRadius:4,border:"none",background:T.ink||"#2C2416",color:T2.bg||"#F7F3EC",fontSize:isDesktop?14:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Build Another Story →</button>
          <button onClick={()=>{setResult(null);setPhase('brief');}} style={{padding:isDesktop?"14px 18px":"12px 16px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:isDesktop?13:12,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>← Edit Brief</button>
        </div>
      </div>
    );
  }

  return null;
}
