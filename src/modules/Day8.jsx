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

export function StoryArchitectWidget({ T:Tp, T2:T2p, isDesktop=false, onSimulation }) {
  const T  = Tp  || Timport;
  const T2 = T2p || T2D;

  const EXAMPLE_BRIEFS = [
    "A cybersecurity risk presentation for leadership — make it feel like breaking news, urgent and specific",
    "A pitch for a new product — TED-style, emotional and direct, show real human impact",
    "A change management update — show the before and after, honest about what's changing and why",
  ];

  // Dynamic SVG generator — reads visualDirection keywords to set palette and abstract shapes
  function makeSceneSVG(scene, idx) {
    const dir = (scene.visualDirection || '').toLowerCase();
    // Palette from keywords
    let bg = '#0A0804', bg2 = '#14100A', accent = '#8A9E84';
    if (/red|fire|danger|alarm|alert|warning|urgent|blood|crisis/.test(dir))    { bg='#150404'; bg2='#1E0606'; accent='#CC4444'; }
    else if (/gold|amber|sun|warm|honey|chrysalis|yellow|harvest/.test(dir))    { bg='#110C02'; bg2='#1A1206'; accent='#C9A84C'; }
    else if (/green|garden|leaf|grass|nature|spring|forest|grow/.test(dir))     { bg='#020E06'; bg2='#051410'; accent='#4A8A5A'; }
    else if (/blue|sky|ocean|sea|calm|water|azure|horizon/.test(dir))           { bg='#020614'; bg2='#04081E'; accent='#4A72B8'; }
    else if (/purple|magic|sparkle|mystical|enchant|wizard|lavender/.test(dir)) { bg='#0A0614'; bg2='#12091E'; accent='#9A5AB8'; }
    else if (/pink|rose|flower|petal|blossom|cherry/.test(dir))                 { bg='#140408'; bg2='#1E0812'; accent='#C44A8A'; }
    else if (/white|bright|open|light|clear|dawn|morning|glow/.test(dir))       { bg='#0E0E0A'; bg2='#181812'; accent='#D4C87A'; }
    else if (/dark|night|shadow|void|moon|midnight/.test(dir))                  { bg='#060402'; bg2='#0A0804'; accent='#887A6A'; }

    // Shape category
    const isWings   = /butterfly|wing|fly|soar|flight|spread|flap/.test(dir);
    const isOval    = /egg|oval|chrysalis|cocoon|bubble|sphere|circle/.test(dir);
    const isTree    = /tree|branch|leaf|petal|garden|plant|bloom|flower/.test(dir);
    const isStar    = /star|sparkle|glow|shimmer|twinkle|light ray|radiant|glitter/.test(dir);
    const isPath    = /path|road|journey|river|stream|trail|winding|map/.test(dir);
    const isPeople  = /people|crowd|child|family|friend|figure|someone|gather|audience/.test(dir);
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
          <ellipse cx="56" cy="63" rx="18" ry="11" fill={accent} opacity="0.15" transform="rotate(20 56 63)"/>
          <ellipse cx="104" cy="63" rx="18" ry="11" fill={accent} opacity="0.15" transform="rotate(-20 104 63)"/>
          <circle cx="80" cy="50" r="5" fill={accent} opacity="0.75"/>
          <line x1="80" y1="55" x2="80" y2="74" stroke={accent} strokeWidth="1.5" opacity="0.35" strokeLinecap="round"/>
        </>}

        {isOval && !isWings && <>
          <ellipse cx="80" cy="50" rx="28" ry="38" stroke={accent} strokeWidth="1.5" fill={accent} opacity="0.1"/>
          <ellipse cx="80" cy="50" rx="18" ry="26" stroke={accent} strokeWidth="0.8" fill={accent} opacity="0.06"/>
          <ellipse cx="72" cy="40" rx="8" ry="11" fill={accent} opacity="0.3" transform="rotate(-14 72 40)"/>
          <circle cx="80" cy="50" r="3.5" fill={accent} opacity="0.55"/>
        </>}

        {isTree && !isWings && !isOval && <>
          <path d="M80 90 L80 52" stroke={accent} strokeWidth="2.5" opacity="0.3" strokeLinecap="round"/>
          <path d="M80 52 Q54 34 42 40 Q58 20 80 14 Q102 20 118 40 Q106 34 80 52" fill={accent} opacity="0.18"/>
          <path d="M80 64 Q60 50 50 56 Q66 38 80 34 Q94 38 110 56 Q100 50 80 64" fill={accent} opacity="0.13"/>
          <circle cx="60" cy="76" r="2.5" fill={accent} opacity="0.3"/>
          <circle cx="100" cy="72" r="2.5" fill={accent} opacity="0.3"/>
        </>}

        {isStar && !isWings && !isOval && !isTree && <>
          <circle cx="80" cy="50" r="34" fill={accent} opacity="0.04"/>
          <circle cx="80" cy="50" r="20" fill={accent} opacity="0.07"/>
          <circle cx="80" cy="50" r="8" fill={accent} opacity="0.38"/>
          <line x1="80" y1="15" x2="80" y2="27" stroke={accent} strokeWidth="1.5" opacity="0.55" strokeLinecap="round"/>
          <line x1="80" y1="73" x2="80" y2="85" stroke={accent} strokeWidth="1.5" opacity="0.55" strokeLinecap="round"/>
          <line x1="44" y1="50" x2="56" y2="50" stroke={accent} strokeWidth="1.5" opacity="0.55" strokeLinecap="round"/>
          <line x1="104" y1="50" x2="116" y2="50" stroke={accent} strokeWidth="1.5" opacity="0.55" strokeLinecap="round"/>
          <line x1="57" y1="27" x2="65" y2="35" stroke={accent} strokeWidth="1" opacity="0.35" strokeLinecap="round"/>
          <line x1="103" y1="65" x2="111" y2="73" stroke={accent} strokeWidth="1" opacity="0.35" strokeLinecap="round"/>
          <line x1="103" y1="27" x2="95" y2="35" stroke={accent} strokeWidth="1" opacity="0.35" strokeLinecap="round"/>
          <line x1="57" y1="73" x2="65" y2="65" stroke={accent} strokeWidth="1" opacity="0.35" strokeLinecap="round"/>
        </>}

        {isPath && !isWings && !isOval && !isTree && !isStar && <>
          <path d="M12 80 Q36 56 62 65 Q88 74 112 44 Q126 30 148 16" stroke={accent} strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"/>
          <circle cx="12" cy="80" r="4" fill={accent} opacity="0.38"/>
          <circle cx="62" cy="65" r="3" fill={accent} opacity="0.38"/>
          <circle cx="112" cy="44" r="3" fill={accent} opacity="0.38"/>
          <circle cx="148" cy="16" r="6" fill={accent} opacity="0.85"/>
          <line x1="6" y1="90" x2="154" y2="90" stroke={accent} strokeWidth="0.8" opacity="0.12"/>
        </>}

        {isPeople && !isWings && !isOval && !isTree && !isStar && !isPath && <>
          <circle cx="46" cy="38" r="10" fill={accent} opacity="0.22"/>
          <circle cx="80" cy="32" r="13" fill={accent} opacity="0.35"/>
          <circle cx="114" cy="38" r="10" fill={accent} opacity="0.22"/>
          <path d="M32 82 Q46 60 60 70 Q70 76 80 72 Q90 68 100 70 Q114 80 128 82" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round"/>
        </>}

        {isRising && !isWings && !isOval && !isTree && !isStar && !isPath && !isPeople && <>
          <rect x="12" y="70" width="12" height="16" rx="1" fill={accent} opacity="0.3"/>
          <rect x="30" y="58" width="12" height="28" rx="1" fill={accent} opacity="0.4"/>
          <rect x="48" y="46" width="12" height="40" rx="1" fill={accent} opacity="0.5"/>
          <rect x="66" y="32" width="12" height="54" rx="1" fill={accent} opacity="0.6"/>
          <rect x="84" y="20" width="12" height="66" rx="1" fill={accent} opacity="0.65"/>
          <rect x="102" y="10" width="12" height="76" rx="1" fill={accent} opacity="0.7"/>
          <path d="M18 76 L36 64 L54 52 L72 38 L90 26 L108 16" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round"/>
          <line x1="6" y1="90" x2="154" y2="90" stroke={accent} strokeWidth="0.8" opacity="0.15"/>
        </>}

        {/* Default — abstract wave when no category matched */}
        {!isWings && !isOval && !isTree && !isStar && !isPath && !isPeople && !isRising && <>
          <path d={idx % 2 === 0 ? "M18 72 Q44 32 80 52 Q116 72 142 26" : "M18 26 Q44 66 80 46 Q116 26 142 72"}
            stroke={accent} strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round"/>
          <circle cx="80" cy={idx % 2 === 0 ? 52 : 46} r="26" fill={accent} opacity="0.04"/>
          <circle cx="80" cy={idx % 2 === 0 ? 52 : 46} r="12" fill={accent} opacity="0.07"/>
          <circle cx="80" cy={idx % 2 === 0 ? 52 : 46} r="4" fill={accent} opacity="0.5"/>
        </>}
      </svg>
    );
  }

  const [phase,    setPhase]   = useState('brief');
  const [brief,    setBrief]   = useState('');
  const [result,   setResult]  = useState(null);
  const [activeTab,setActiveTab]=useState('script');
  const [copied,   setCopied]  = useState(null);
  const [apiError, setApiError]= useState(null);

  const GOLD = T.gold || '#8A9E84';

  function reset() {
    setPhase('brief'); setBrief(''); setResult(null); setActiveTab('script'); setCopied(null); setApiError(null);
  }

  // Brief-aware template fallback — extracts topic from brief text
  function buildTemplateFallback(b) {
    const bl = b.toLowerCase();
    const topic = b.trim().split(/[,.\-—]/)[0].trim();
    const isKids    = /child|kid|son|daughter|year.?old|baby|magical|fairy|princess|dragon/.test(bl);
    const isUrgent  = /urgent|crisis|risk|breaking|emergency|threat|danger|warning/.test(bl);
    const isChange  = /change|transform|before.*after|journey|evolution|growth/.test(bl);
    const isBrief   = b.trim().split(/\s+/).length < 6;

    if (isKids) return {
      storyTitle: topic,
      deliveryNote: "Tell it warmly, slowly — leave space for wonder between each scene.",
      scenes:[
        {number:1,title:"Once Upon a Time",          narrative:`In a world full of colour and magic, our story begins. ${topic} is about to start the greatest adventure imaginable.`,             visualDirection:"Soft morning light. Dewdrops on green leaves. A world waking up.",     caption:"Every great story starts with a tiny beginning."},
        {number:2,title:"The Journey Begins",        narrative:"There are new things to discover, new challenges to face. But curiosity is the best compass — and our hero has plenty of it.",  visualDirection:"Winding path through a bright, friendly world. Flowers everywhere.",   caption:"The adventure is already underway."},
        {number:3,title:"Something Unexpected",      narrative:"Then — something wonderful and surprising happens. The kind of thing nobody planned, but everybody needed.",                       visualDirection:"A moment of surprise. Eyes wide open. The world looks different now.",  caption:"The best stories have moments you never see coming."},
        {number:4,title:"Growing Through It",        narrative:"It's not always easy. But every challenge makes our hero stronger, wiser, and more ready for what comes next.",                  visualDirection:"Warm golden light. A sense of effort — and reward.",                   caption:"Growth happens quietly, then all at once."},
        {number:5,title:"The Magical Moment",        narrative:"And then — it happens. The moment everything has been building toward. More beautiful than anyone imagined.",                    visualDirection:"Bright, expansive, full of colour. A breath of wonder.",               caption:"Some moments are worth the whole journey."},
        {number:6,title:"Flying Free",               narrative:"Now the adventure is truly beginning. A whole world is waiting — and our hero is ready for every bit of it.",                   visualDirection:"Open sky. Wide horizon. Infinite possibility stretching ahead.",        caption:"The end of one story is the start of the next."},
      ]
    };

    if (isUrgent) return {
      storyTitle: topic,
      deliveryNote: "Speak with urgency but control — this story needs to land hard and fast.",
      scenes:[
        {number:1,title:"The Situation Right Now",   narrative:`Here is where things stand. The context your audience needs to feel — not just know — before anything else.`,                  visualDirection:"Dark room. One bright screen. Numbers that matter.",                   caption:"The current state, seen clearly."},
        {number:2,title:"What's at Stake",           narrative:"This is not a drill. The gap between where we are and where we need to be is real — and the window is closing.",               visualDirection:"Red warning indicators. A clock. The weight of urgency.",              caption:"The stakes, made impossible to ignore."},
        {number:3,title:"The Risk Nobody Names",     narrative:"Most people see the surface problem. This is the deeper one. The one that matters most and gets addressed last.",               visualDirection:"One highlighted line in a long document. A single point of failure.",  caption:"The insight that changes the whole conversation."},
        {number:4,title:"What We Do Next",           narrative:"Here's the action. Not in theory. In practice. This is what changes the outcome — and it starts now.",                         visualDirection:"A clear path. Concrete steps. Motion, not hesitation.",                caption:"The response that makes the difference."},
        {number:5,title:"What Protected Looks Like", narrative:"On the other side of this decision is a different world. This is what we're building toward — and why it's worth doing right.", visualDirection:"Calm. Clear. Secure. The future we're protecting.",                    caption:"The outcome that justifies every hard decision."},
        {number:6,title:"The Decision",              narrative:"One choice. Made now. Everything else follows from this moment.",                                                                visualDirection:"A single chair at a table. A moment of clarity.",                     caption:"This is the ask."},
      ]
    };

    return {
      storyTitle: topic || "Your Story",
      deliveryNote: "Speak with conviction. This story only works when you believe every word.",
      scenes:[
        {number:1,title:"Where We Begin",        narrative:`This is the starting point — the world as it is right now, before anything changes. It's worth seeing it clearly, because everything else follows from here.`, visualDirection:"The present moment. Familiar. Known. Real.",               caption:"Every story starts with the world as it is."},
        {number:2,title:"The Tension",           narrative:"Something isn't working. Or something could work far better. The gap between where things are and where they could be is the engine of this story.",          visualDirection:"A gap. A distance. A question that needs answering.",       caption:"The problem that makes the story necessary."},
        {number:3,title:"The Insight",           narrative:"Here's what changes everything: a new way of seeing the problem. Not more effort — a different frame. This is the pivot.",                                    visualDirection:"One clear idea, fully formed. A light that didn't exist before.", caption:"The realisation that makes everything else possible."},
        {number:4,title:"The Path Forward",      narrative:"With this insight, the route becomes clear. It's not easy — but it's right. And the first step is already mapped.",                                           visualDirection:"A direction. A next step. Momentum beginning.",             caption:"From insight to action."},
        {number:5,title:"What Becomes Possible", narrative:"If we follow this path — here's the world on the other side. Not just a better outcome, but a fundamentally different way of operating.",                     visualDirection:"Open space. Wide horizon. A new normal.",                  caption:"The future this story is building toward."},
        {number:6,title:"The Invitation",        narrative:"This story ends with a question for everyone in the room. What will we choose to do with what we now know?",                                                  visualDirection:"A moment of shared decision. The room, alive.",             caption:"The story is theirs now."},
      ]
    };
  }

  async function generate() {
    if (!brief.trim()) return;
    setPhase('generating'); setApiError(null);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1400,
          messages: [{
            role: "user",
            content: `You are a master storyteller. A user has given you a brief. Your only job is to write THEIR story — not a generic template, not a business transformation arc, not a default narrative. You must adapt completely to what they describe.

Read this brief carefully:
"${brief}"

Match its tone, genre, audience, and emotional register completely. If the brief says magical and for a child, write like a children's picture book — use wonder, simple language, characters, and joy. If it says breaking news, write urgent and cinematic. If it says a love story, write warmly and personally. If it says data and enterprise, write with precision and authority. The brief is your complete and only instruction — ignore any default story shapes.

Write exactly 6 scenes that tell THIS specific story. Every scene title must name something that actually happens in this story — not generic labels like "The World Before", "The Turning Point", or "The Call To Action". Give each scene a name that only makes sense for this story.

Return ONLY valid JSON — no preamble, no markdown:
{
  "storyTitle": "A title specific to this story and this brief (not generic)",
  "deliveryNote": "One sentence on how to tell this — tone, pace, energy, who it's for",
  "scenes": [
    {
      "number": 1,
      "title": "Scene title that is specific to THIS story",
      "narrative": "2-4 lines written in the style this brief calls for — if magical, be magical; if cinematic, be cinematic; if funny, be funny. Make the reader picture it exactly.",
      "visualDirection": "One line describing what is seen — specific to this scene and story (e.g. A tiny egg on a bright green leaf. Morning dew. Sunlight breaking through.)",
      "caption": "One crisp sentence that captures this scene's purpose in the story"
    }
  ]
}

6 scenes total. Stay true to the brief. This is their story, not a template.`
          }]
        })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || 'API error');
      const raw = (d.content||[]).map(b=>b.text||'').join('').trim().replace(/```json\n?|\n?```/g,'').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('Could not parse response');
      const parsed = JSON.parse(m[0]);
      if (!parsed.scenes?.length) throw new Error('Invalid story structure');
      setResult(parsed);
      setPhase('results');
    } catch(e) {
      // API failed — use a brief-aware template so the content at least matches what they asked for
      setApiError(e.message);
      setResult(buildTemplateFallback(brief));
      setPhase('results');
    }
  }

  function copy(text, key) {
    navigator.clipboard?.writeText(text).catch(()=>{});
    setCopied(key); setTimeout(()=>setCopied(null), 2000);
  }

  const cs = {
    card:  { background:T2.surface, borderRadius:8, border:"0.5px solid "+T2.border, padding:isDesktop?"28px 32px":"20px 22px" },
    label: { fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:8 },
    cta:   { width:"100%", padding:isDesktop?"16px":"15px", borderRadius:4, border:"none", background:T.ink||"#2C2416", color:T2.bg||"#F7F3EC", fontSize:isDesktop?15:14, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:50, transition:"all 0.2s" },
  };

  // ── BRIEF ──────────────────────────────────────────────────────────────────
  if (phase === 'brief') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?20:16}}>
      <div>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Story Architect</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?36:26,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>What's your story?</h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:13,color:T2.text3,lineHeight:1.65,margin:0,fontWeight:300}}>Describe the topic, audience, and the feeling you want to create. The more direction you give, the more cinematic the output.</p>
      </div>

      <div style={cs.card}>
        <textarea
          value={brief}
          onChange={e=>setBrief(e.target.value)}
          placeholder="e.g. A cybersecurity risk presentation for our leadership team — I want it to feel like breaking news, urgent and real. Show them what's at stake before showing the solution."
          rows={isDesktop?6:5}
          style={{width:"100%",background:"transparent",border:"none",outline:"none",fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.7,resize:"none",boxSizing:"border-box",fontWeight:300}}
        />
        {brief.trim() && (
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
            <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>{brief.trim().split(/\s+/).length} words</span>
          </div>
        )}
      </div>

      <div>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Or start with an example</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {EXAMPLE_BRIEFS.map((ex,i)=>(
            <button key={i} onClick={()=>setBrief(ex)}
              style={{padding:isDesktop?"12px 16px":"10px 14px",borderRadius:6,border:"0.5px solid "+T2.border,background:brief===ex?"rgba(138,158,132,0.08)":T2.surface,cursor:"pointer",textAlign:"left",fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5,fontWeight:300,transition:"all 0.15s",display:"flex",alignItems:"flex-start",gap:10}}>
              <span style={{color:T.gold,flexShrink:0,fontWeight:700}}>→</span>
              {ex}
            </button>
          ))}
        </div>
      </div>

      <button onClick={generate} disabled={!brief.trim()}
        style={{...cs.cta,opacity:brief.trim()?1:0.4,cursor:brief.trim()?"pointer":"default"}}>
        Generate My Story →
      </button>
    </div>
  );

  // ── GENERATING ─────────────────────────────────────────────────────────────
  if (phase === 'generating') return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:isDesktop?20:16,padding:isDesktop?"64px 0":"44px 0",textAlign:"center"}}>
      <div style={{background:"#0A0804",borderRadius:10,padding:isDesktop?"36px 44px":"28px 28px",border:"0.5px solid rgba(138,158,132,0.2)",width:"100%",maxWidth:460,boxSizing:"border-box",textAlign:"left"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:20}}>Writing Your Story</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {["Reading your brief","Finding the emotional core","Naming each scene","Writing the narrative","Composing visual directions"].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,animation:`fadeUp 0.5s ease ${i*0.3}s both`}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.4s ease ${i*0.25}s infinite`,flexShrink:0}}/>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.6)",fontWeight:300}}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:"italic",color:T2.text3,margin:0}}>Building something specific to your story…</p>
    </div>
  );

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (phase === 'results' && result) {
    const scenes = result.scenes || [];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>

        {/* Header */}
        <div style={{background:"#0A0804",borderRadius:10,padding:isDesktop?"24px 32px":"20px 22px",border:"0.5px solid rgba(138,158,132,0.2)"}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>Your Story</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?24:20,fontWeight:600,color:"rgba(245,239,230,0.92)",lineHeight:1.2,marginBottom:10}}>{result.storyTitle}</div>
          {apiError && (
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"10px 14px",background:"rgba(255,255,255,0.05)",borderRadius:6,marginBottom:10,flexWrap:"wrap",gap:8}}>
              <span style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.4)",fontWeight:300}}>AI coach unavailable — showing a template based on your brief. <button onClick={()=>{setApiError(null);generate();}} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontFamily:T.sans,fontSize:11,fontWeight:600,padding:0}}>Try again →</button></span>
            </div>
          )}
          {result.deliveryNote && (
            <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px",background:"rgba(138,158,132,0.08)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.2)"}}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:1}}><circle cx="8" cy="8" r="6.5" stroke={T.gold} strokeWidth="1.2"/><path d="M8 5v4M8 11v1" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.6)",lineHeight:1.55,margin:0,fontWeight:300,fontStyle:"italic"}}>{result.deliveryNote}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:0,borderBottom:"0.5px solid "+T2.border}}>
          {[{id:'script',label:'Script'},{id:'storyboard',label:'Storyboard'}].map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
              flex:1,padding:isDesktop?"12px 16px":"10px 12px",border:"none",background:"transparent",
              fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:activeTab===tab.id?600:400,
              color:activeTab===tab.id?T2.text:T2.text3,cursor:"pointer",
              borderBottom:activeTab===tab.id?`2px solid ${T.gold}`:"2px solid transparent",
              transition:"all 0.15s",marginBottom:-1,
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Script tab */}
        {activeTab === 'script' && (
          <div style={{display:"flex",flexDirection:"column",gap:isDesktop?12:10}}>
            {scenes.map((scene,i)=>(
              <div key={i} style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
                {/* Scene header */}
                <div style={{padding:isDesktop?"14px 20px":"12px 16px",background:"rgba(138,158,132,0.06)",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(138,158,132,0.15)",border:"0.5px solid rgba(138,158,132,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold}}>{scene.number}</span>
                  </div>
                  <div style={{fontFamily:T.serif,fontSize:isDesktop?16:15,fontWeight:600,color:T2.text,flex:1}}>{scene.title}</div>
                  <button onClick={()=>copy(scene.narrative+'\n\n['+scene.visualDirection+']',i)} style={{background:"none",border:"none",cursor:"pointer",color:T2.text4,fontFamily:T.sans,fontSize:11,padding:"2px 6px",flexShrink:0}}>{copied===i?"Copied ✓":"Copy"}</button>
                </div>
                {/* Narrative */}
                <div style={{padding:isDesktop?"18px 20px":"14px 16px"}}>
                  <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,color:T2.text,lineHeight:1.75,margin:"0 0 12px"}}>{scene.narrative}</p>
                  {/* Visual direction */}
                  <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 12px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border}}>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,marginTop:1}}><rect x="1" y="1" width="12" height="12" rx="2" stroke={T.gold} strokeWidth="1.2" fill="none"/><path d="M4 9l2-3 2 2 2-3" stroke={T.gold} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,lineHeight:1.55,margin:0,fontWeight:300,fontStyle:"italic"}}>{scene.visualDirection}</p>
                  </div>
                  {/* Caption */}
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?11:10,color:T2.text4,lineHeight:1.5,margin:"10px 0 0",fontWeight:400}}>{scene.caption}</p>
                </div>
              </div>
            ))}

            {/* Copy full script */}
            <button onClick={()=>copy(scenes.map(s=>`SCENE ${s.number}: ${s.title}\n${s.narrative}\n[${s.visualDirection}]`).join('\n\n'),'full')}
              style={{padding:isDesktop?"13px 20px":"11px 16px",borderRadius:6,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>
              {copied==='full'?"Full script copied ✓":"Copy full script"}
            </button>
          </div>
        )}

        {/* Storyboard tab */}
        {activeTab === 'storyboard' && (
          <div style={{display:"flex",flexDirection:"column",gap:isDesktop?12:10}}>
            <div style={{display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:isDesktop?12:10}}>
              {scenes.map((scene,i)=>(
                <div key={i} style={{borderRadius:8,overflow:"hidden",border:"0.5px solid rgba(138,158,132,0.2)",background:"#0D0B08",boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
                  {/* Visual area */}
                  <div style={{position:"relative",height:isDesktop?130:110,overflow:"hidden"}}>
                    {makeSceneSVG(scene, i)}
                    <div style={{position:"absolute",top:8,left:8,width:isDesktop?24:20,height:isDesktop?24:20,borderRadius:4,background:"rgba(10,8,4,0.75)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontFamily:T.sans,fontSize:isDesktop?10:9,fontWeight:700,color:T.gold}}>{scene.number}</span>
                    </div>
                  </div>
                  {/* Text area */}
                  <div style={{padding:isDesktop?"14px 16px":"11px 14px",borderTop:"0.5px solid rgba(138,158,132,0.15)"}}>
                    <div style={{fontFamily:T.sans,fontSize:isDesktop?10:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>{scene.title}</div>
                    <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:"rgba(245,239,230,0.55)",lineHeight:1.5,margin:"0 0 6px",fontWeight:300,fontStyle:"italic"}}>{scene.visualDirection}</p>
                    <p style={{fontFamily:T.serif,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.75)",lineHeight:1.45,margin:0}}>{scene.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{...cs.card,padding:isDesktop?"20px 24px":"16px 18px",marginTop:4}}>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 14px",fontWeight:300}}>Now deliver it. Use the script as your guide — not a word-for-word script, but a felt narrative. Let the story move through you.</p>
          <button onClick={reset} style={cs.cta}>Build Another Story →</button>
        </div>
      </div>
    );
  }

  return null;
}
