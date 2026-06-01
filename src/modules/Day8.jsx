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

  const SITUATIONS = [
    { id:'pitch',        label:'Pitch',             desc:'Sell an idea.' },
    { id:'proposal',     label:'Proposal',           desc:'Gain approval.' },
    { id:'presentation', label:'Presentation',       desc:'Educate or inspire.' },
    { id:'sales',        label:'Sales Meeting',      desc:'Create urgency.' },
    { id:'team',         label:'Team Update',        desc:'Drive engagement.' },
    { id:'leadership',   label:'Leadership Talk',    desc:'Inspire action.' },
    { id:'custom',       label:'Something Else',     desc:'Build your own.' },
  ];

  const PROCESSING_STEPS = [
    "Understanding your audience",
    "Finding emotional hooks",
    "Identifying key moments",
    "Creating narrative arc",
    "Designing storyboard",
  ];

  const [phase,          setPhase]         = useState('landing');
  const [situation,      setSituation]     = useState(null);
  const [coreMessage,    setCoreMessage]   = useState('');
  const [inputMode,      setInputMode]     = useState('speak');
  const [textInput,      setTextInput]     = useState('');
  const [transcript,     setTranscript]    = useState('');
  const [isRec,          setIsRec]         = useState(false);
  const [timeLeft,       setTimeLeft]      = useState(90);
  const [waveVals,       setWaveVals]      = useState(Array(12).fill(0.3));
  const [processingStep, setProcessingStep]= useState(0);
  const [result,         setResult]        = useState(null);
  const [activeTab,      setActiveTab]     = useState('story');
  const [storyStyle,     setStoryStyle]    = useState(null);
  const [styleGenerating,setStyleGenerating]=useState(false);

  const recRef      = useRef(null);
  const timerRef    = useRef(null);
  const waveRef     = useRef(null);
  const liveRef     = useRef('');

  const SpeechRec = typeof window!=='undefined'&&(window.SpeechRecognition||window.webkitSpeechRecognition);

  useEffect(()=>{
    if(isRec&&timeLeft>0){ timerRef.current=setTimeout(()=>setTimeLeft(t=>t-1),1000); }
    else if(isRec&&timeLeft===0){ stopRec(); }
    return ()=>clearTimeout(timerRef.current);
  },[isRec,timeLeft]);

  useEffect(()=>{
    if(!isRec){ clearInterval(waveRef.current); return; }
    waveRef.current=setInterval(()=>setWaveVals(()=>Array.from({length:12},()=>0.15+Math.random()*0.85)),120);
    return ()=>clearInterval(waveRef.current);
  },[isRec]);

  function startRec(){
    liveRef.current=''; setTranscript(''); setIsRec(true); setTimeLeft(90);
    if(SpeechRec){
      const r=new SpeechRec(); r.continuous=true; r.interimResults=true;
      r.onresult=e=>{ let t=''; for(let i=0;i<e.results.length;i++) if(e.results[i].isFinal) t+=e.results[i][0].transcript+' '; liveRef.current=t; setTranscript(t); };
      try{r.start();}catch(e){} recRef.current=r;
    }
  }
  function stopRec(){ setIsRec(false); clearTimeout(timerRef.current); if(recRef.current){try{recRef.current.stop();}catch(e){}} }
  function restart(){ setPhase('landing');setSituation(null);setCoreMessage('');setInputMode('speak');setTextInput('');setTranscript('');setIsRec(false);setTimeLeft(90);setResult(null);setProcessingStep(0);setActiveTab('story');setStoryStyle(null);setStyleGenerating(false); }

  async function generate(){
    stopRec();
    const spoken = (liveRef.current||'').trim() || textInput.trim();
    setPhase('processing'); setProcessingStep(0);

    const animateSteps = async()=>{
      for(let i=1;i<=5;i++){ await new Promise(r=>setTimeout(r,650)); setProcessingStep(i); }
    };

    const callAPI = async()=>{
      const mock = {
        mainStory:{
          opening:`There's a moment in every ${situation} when everything depends on your next words.`,
          challenge:"The audience is busy, distracted, and has heard this before. Facts alone won't move them.",
          transformation:"But a single, well-told story changes everything. It bypasses resistance and creates belief.",
          message: coreMessage || "This is the moment to act.",
          callToAction:"The question isn't whether to act. It's whether you'll act before the opportunity closes.",
        },
        versions:{
          ted:`Imagine you're sitting in a room where a single decision will define the next five years. That's exactly where your audience sits right now. Here's what I've learned about the moments that matter most...`,
          pixar:`Once upon a time, the way we ${situation.replace(/_/g,' ')} was holding us back. Every day, we repeated the same approach. One day, everything changed. Because of that, we had to rethink everything. Until finally, we found a better way. Ever since then, results have spoken for themselves.`,
          executive:`Current state: we're at a crossroads. The tension: the old approach no longer serves us. Future state: with this decision, growth becomes inevitable. The action: approve this now, and let's move.`,
          emotional:`I want to tell you about a moment I'll never forget. Because it changed how I think about everything we're trying to build together.`,
        },
        storyboard:[
          {title:"Current Reality",   headline:"Where We Are Today",                    caption:"The world your audience already knows."},
          {title:"Problem",           headline:"What's Holding Us Back",                caption:"The tension that makes action necessary."},
          {title:"Turning Point",     headline:"The Moment Everything Changed",         caption:"A single insight, decision, or event."},
          {title:"Breakthrough",      headline:"A New Way Forward",                     caption:"The solution that changes the equation."},
          {title:"Transformation",    headline:"What Becomes Possible",                 caption:"The future unlocked by the right choice."},
          {title:"Call To Action",    headline:"The Opportunity Is Ours",               caption:"What we must do next."},
        ],
        strength:{emotional:4,memorability:5,relevance:4,persuasion:4,clarity:5},
        headline:"Strong narrative with clear transformation arc and a compelling call to action.",
      };
      if(!spoken && !coreMessage) return mock;
      try{
        const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1200,messages:[{role:"user",content:
            `You are a master storyteller for business presentations. Generate a complete story package.\n\nSituation: ${situation}\nCore Message: "${coreMessage}"\nContext (what they said): "${spoken}"\n\nReturn ONLY valid JSON:\n{"mainStory":{"opening":"...","challenge":"...","transformation":"...","message":"...","callToAction":"..."},"versions":{"ted":"30-second TED-style opening (2-3 sentences)","pixar":"Full Pixar-framework story (Once upon a time... Every day... One day... Because of that... Until finally... Ever since then...)","executive":"Business narrative: Current State → Tension → Future State → Call To Action (4 short paragraphs)","emotional":"Human-first emotional opening (2-3 sentences)"},"storyboard":[{"title":"Current Reality","headline":"...","caption":"..."},{"title":"Problem","headline":"...","caption":"..."},{"title":"Turning Point","headline":"...","caption":"..."},{"title":"Breakthrough","headline":"...","caption":"..."},{"title":"Transformation","headline":"...","caption":"..."},{"title":"Call To Action","headline":"...","caption":"..."}],"strength":{"emotional":<1-5>,"memorability":<1-5>,"relevance":<1-5>,"persuasion":<1-5>,"clarity":<1-5>},"headline":"<one sentence describing the story's core strength>"}`
        }]})});
        const d=await res.json();
        const raw=(d.content||[]).map(b=>b.text||'').join('').trim();
        const m=raw.match(/\{[\s\S]*\}/);
        return JSON.parse(m[0]);
      }catch{ return mock; }
    };

    const [apiResult]=await Promise.all([callAPI(),animateSteps()]);
    setResult(apiResult);
    setPhase('results');
  }

  const cs = {
    card:  { background:T2.surface, borderRadius:8, border:"0.5px solid "+T2.border, padding:isDesktop?"28px 32px":"20px 22px" },
    label: { fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:8 },
    cta:   { width:"100%", padding:isDesktop?"16px":"14px", borderRadius:4, border:"none", background:T.ink, color:T.bg, fontSize:isDesktop?16:15, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:50, transition:"all 0.2s" },
    back:  { background:"none", border:"none", color:T2.text3, fontFamily:T.sans, fontSize:13, cursor:"pointer", padding:"4px 0", textAlign:"center", width:"100%" },
    inp:   { width:"100%", padding:"14px 16px", border:"0.5px solid "+T2.border, borderRadius:4, outline:"none", background:T2.bg, fontSize:isDesktop?16:15, color:T2.text, lineHeight:1.6, fontFamily:T.sans, fontWeight:300, boxSizing:"border-box" },
  };

  function Stars({score}){
    return <div style={{display:"flex",gap:3}}>{[1,2,3,4,5].map(i=>(
      <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1l1.5 3.5H12L9.5 7l1 3.5L7 8.5 3.5 10.5l1-3.5L2 4.5h3.5z"
          fill={i<=score?T.gold:"transparent"} stroke={i<=score?T.gold:"rgba(138,158,132,0.3)"} strokeWidth="1"/>
      </svg>
    ))}</div>;
  }

  // ── LANDING ────────────────────────────────────────────────────────────────
  if(phase==='landing') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      {/* Title — outside cards, matching D3 pattern */}
      <div>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Simulation · Day 8</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?38:26,fontWeight:600,color:T2.text,lineHeight:1.1,margin:0}}>Story Architect</h2>
      </div>

      {/* HOW IT WORKS */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>How It Works</div>
        <h3 style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 20px"}}>A 5-step story builder.</h3>
        <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
          {[
            {n:1,label:"Choose your\nsituation",icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke={T.gold} strokeWidth="1.3"/><path d="M7.5 11l2.5 2.5 4.5-4.5" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>},
            {n:2,label:"Define your\nmessage",icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M4 5h14a1 1 0 011 1v8a1 1 0 01-1 1H7l-3 3V6a1 1 0 011-1z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:3,label:"Speak or\ntype",icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={T.gold} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2M8 19h6" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:4,label:"AI builds\nyour story",icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M11 2l1.5 4.5H17l-3.75 2.75 1.5 4.75L11 11.5l-3.75 2.5 1.5-4.75L5 6.5h4.5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:5,label:"Visual\nstoryboard",icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke={T.gold} strokeWidth="1.3"/><rect x="12" y="3" width="7" height="7" rx="1.5" stroke={T.gold} strokeWidth="1.3"/><rect x="3" y="12" width="7" height="7" rx="1.5" stroke={T.gold} strokeWidth="1.3"/><rect x="12" y="12" width="7" height="7" rx="1.5" stroke={T.gold} strokeWidth="1.3"/></svg>},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?44:34,height:isDesktop?44:34,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:6}}>{s.icon}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?9:8,fontWeight:700,color:T.gold,marginBottom:2}}>{s.n}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?11:9,color:T2.text3,textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?76:52,whiteSpace:"pre-line"}}>{s.label}</div>
              </div>
              {i<4&&<div style={{height:1,width:isDesktop?12:5,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:32}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* THE FIRST STEP */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"16px 18px"}}>
        <div style={cs.label}>The First Step</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,marginBottom:10,fontWeight:300}}>
          Behind every successful pitch, presentation, proposal, and leadership talk is a story that creates belief, builds connection, and inspires action. Every great presentation has a story behind it. The challenge is knowing how to find it.
        </p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,margin:0,fontWeight:300}}>
          Simply capture your ideas by speaking naturally or adding a few notes. Story Architect uncovers the narrative hidden within your message and transforms it into a compelling story, visual storyboard, and presentation-ready experience.
        </p>
      </div>

      {/* YOUR AI COACH */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"16px 18px"}}>
        <div style={cs.label}>Your AmplifyU Coach</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,marginBottom:10,fontWeight:300}}>
          Your AmplifyU coach will generate a complete story, four alternative narrative frameworks — TED, Pixar, Executive, and Emotional — and a six-panel visual storyboard for your presentation.
        </p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.7,margin:0,fontStyle:"italic"}}>
          From a simple idea to a story people remember — not a worksheet, a workflow.
        </p>
      </div>

      <button onClick={()=>setPhase('situation')} style={cs.cta}>Start Building →</button>
    </div>
  );

  // ── SITUATION ──────────────────────────────────────────────────────────────
  if(phase==='situation') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
      <div>
        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300,marginBottom:6}}>Step 1 of 3</div>
        <div style={{height:4,background:T2.border,borderRadius:2,marginBottom:16}}>
          <div style={{height:"100%",width:"33%",background:T.gold,borderRadius:2}}/>
        </div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:22,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:6}}>What are you preparing for?</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {SITUATIONS.map(s=>(
          <button key={s.id} onClick={()=>{setSituation(s.id);setPhase('message');}}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:isDesktop?"16px 20px":"13px 18px",borderRadius:6,border:"0.5px solid "+T2.border,background:T2.surface,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
            <div>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?17:16,fontWeight:600,color:T2.text,marginBottom:2}}>{s.label}</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:0,fontWeight:300}}>{s.desc}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginLeft:12}}><path d="M4 8h8M8 4l4 4-4 4" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ))}
      </div>
    </div>
  );

  // ── CORE MESSAGE ───────────────────────────────────────────────────────────
  if(phase==='message') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?20:16}}>
      <div>
        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300,marginBottom:6}}>Step 2 of 3</div>
        <div style={{height:4,background:T2.border,borderRadius:2,marginBottom:16}}>
          <div style={{height:"100%",width:"66%",background:T.gold,borderRadius:2}}/>
        </div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:22,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:6}}>What's the one thing you want people to remember?</h2>
      </div>
      <div style={cs.card}>
        <input value={coreMessage} onChange={e=>setCoreMessage(e.target.value)}
          placeholder={`e.g. "Customer experience is our advantage."`}
          style={{...cs.inp,fontSize:isDesktop?18:16}}/>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:14}}>
          {["Simplicity drives growth.","AI should help people, not replace them.","We need to change now."].map((ex,i)=>(
            <button key={i} onClick={()=>setCoreMessage(ex)} style={{padding:"6px 12px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",cursor:"pointer",fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,textAlign:"left"}}>
              → {ex}
            </button>
          ))}
        </div>
      </div>
      <button onClick={()=>setPhase('record')} disabled={!coreMessage.trim()}
        style={{...cs.cta,opacity:coreMessage.trim()?1:0.4,cursor:coreMessage.trim()?"pointer":"default"}}>Continue →</button>
      <button onClick={()=>setPhase('situation')} style={cs.back}>← Back</button>
    </div>
  );

  // ── RECORD ─────────────────────────────────────────────────────────────────
  if(phase==='record') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?20:16}}>
      <div>
        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300,marginBottom:6}}>Step 3 of 3</div>
        <div style={{height:4,background:T2.border,borderRadius:2,marginBottom:16}}>
          <div style={{height:"100%",width:"100%",background:T.gold,borderRadius:2}}/>
        </div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:22,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:6}}>Tell me about it.</h2>
      </div>

      {inputMode==='speak' ? (
        <>
          <div style={{...cs.card,padding:isDesktop?"24px 28px":"20px 22px"}}>
            <div style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.7,marginBottom:14,fontWeight:300}}>
              Explain your presentation as if talking to a colleague. What is it about? Why does it matter? Any stories or examples you'd like included?
            </div>
            {isRec ? (
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:"#CC4444",animation:"glowPulse 1s ease infinite"}}/>
                    <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px"}}>Recording</span>
                  </div>
                  <span style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T.gold}}>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:3,height:36,marginBottom:12}}>
                  {waveVals.map((v,i)=><div key={i} style={{flex:1,background:T.gold,borderRadius:2,height:Math.max(3,v*32),transition:"height 0.1s ease"}}/>)}
                </div>
                {transcript&&<p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.55,fontStyle:"italic",margin:0}}>{transcript.slice(-180)}{transcript.length>180?'…':''}</p>}
              </>
            ) : (
              <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.6,margin:0,fontStyle:"italic"}}>Hold the button below to start recording.</p>
            )}
          </div>
          <div style={{display:"flex",gap:10}}>
            {!isRec
              ? <button onClick={startRec} style={cs.cta}>Start Recording →</button>
              : <button onClick={generate} style={{...cs.cta,background:"rgba(82,112,96,0.85)"}}>Stop & Build My Story →</button>
            }
          </div>
          <button onClick={()=>setInputMode('type')} style={cs.back}>Switch to typing instead</button>
        </>
      ) : (
        <>
          <div style={cs.card}>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.7,marginBottom:12,fontWeight:300}}>
              Explain your presentation in a few sentences. What's it about? Why does it matter? Any examples or stories?
            </p>
            <textarea value={textInput} onChange={e=>setTextInput(e.target.value)}
              placeholder="e.g. I'm pitching a new product to our sales team. The problem is that our current tool wastes 3 hours per rep per week. We have a customer who saved £40K using our solution..."
              rows={5}
              style={{...cs.inp,resize:"none"}}/>
          </div>
          <button onClick={generate} disabled={!textInput.trim()}
            style={{...cs.cta,opacity:textInput.trim()?1:0.4,cursor:textInput.trim()?"pointer":"default"}}>Build My Story →</button>
          <button onClick={()=>setInputMode('speak')} style={cs.back}>Switch to voice instead</button>
        </>
      )}
      <button onClick={()=>setPhase('message')} style={cs.back}>← Back</button>
    </div>
  );

  // ── PROCESSING ─────────────────────────────────────────────────────────────
  if(phase==='processing') return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:isDesktop?20:16,padding:isDesktop?"52px 0":"40px 0",textAlign:"center"}}>
      <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"32px 40px":"24px 28px",border:"0.5px solid rgba(138,158,132,0.2)",width:"100%",maxWidth:440,boxSizing:"border-box",textAlign:"left"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:20}}>Building Your Story</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {PROCESSING_STEPS.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,opacity:i<processingStep?1:0.3,transition:"opacity 0.4s ease"}}>
              <div style={{width:20,height:20,borderRadius:"50%",border:"1.5px solid "+(i<processingStep?T.gold:"rgba(138,158,132,0.3)"),background:i<processingStep?"rgba(138,158,132,0.15)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.4s ease"}}>
                {i<processingStep&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:i<processingStep?"#F5EFE6":"rgba(245,239,230,0.4)",fontWeight:300,transition:"color 0.4s ease"}}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if(phase==='results'&&result) {
    const TABS = [{id:'story',label:'Your Story'},{id:'versions',label:'Versions'},{id:'storyboard',label:'Storyboard'}];
    const PANEL_COLORS = ['rgba(138,158,132,0.12)','rgba(176,122,64,0.1)','rgba(180,80,60,0.08)','rgba(82,112,96,0.12)','rgba(138,158,132,0.12)','rgba(44,36,22,0.15)'];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
        {/* Header */}
        <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"24px 32px":"20px 22px",border:"0.5px solid rgba(138,158,132,0.2)"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Your Story Is Ready</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:"rgba(245,239,230,0.8)",lineHeight:1.6,margin:"0 0 16px"}}>{result.headline}</p>
          {/* Strength */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:isDesktop?12:8}}>
            {[
              {label:"Emotional",   score:result.strength?.emotional||4},
              {label:"Memorable",   score:result.strength?.memorability||5},
              {label:"Relevant",    score:result.strength?.relevance||4},
              {label:"Persuasive",  score:result.strength?.persuasion||4},
              {label:"Clarity",     score:result.strength?.clarity||5},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <Stars score={s.score}/>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?10:9,color:"rgba(245,239,230,0.45)",marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:0,borderBottom:"0.5px solid "+T2.border}}>
          {TABS.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
              flex:1,padding:isDesktop?"12px 16px":"10px 12px",border:"none",background:"transparent",
              fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:activeTab===tab.id?600:400,
              color:activeTab===tab.id?T2.text:T2.text3,cursor:"pointer",
              borderBottom:activeTab===tab.id?`2px solid ${T.gold}`:"2px solid transparent",
              transition:"all 0.15s",marginBottom:-1,
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Tab: Your Story */}
        {activeTab==='story'&&(
          <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
            {[
              {label:"Opening",        text:result.mainStory?.opening},
              {label:"Challenge",      text:result.mainStory?.challenge},
              {label:"Transformation", text:result.mainStory?.transformation},
              {label:"Core Message",   text:result.mainStory?.message},
              {label:"Call To Action", text:result.mainStory?.callToAction},
            ].map((section,i)=>(
              <div key={i} style={{...cs.card,padding:isDesktop?"18px 22px":"14px 18px"}}>
                <div style={cs.label}>{section.label}</div>
                <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>{section.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Versions */}
        {activeTab==='versions'&&(
          <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
            {[
              {label:"TED Opening",       key:"ted",     best:"Presentations · Keynotes · Conferences"},
              {label:"Pixar Framework",   key:"pixar",   best:"Teams · Training · Simplicity"},
              {label:"Executive Version", key:"executive",best:"Boardrooms · Proposals · Executives"},
              {label:"Emotional Opening", key:"emotional",best:"Leadership · Change · Transformation"},
            ].map((v,i)=>(
              <div key={i} style={{...cs.card,padding:isDesktop?"20px 24px":"16px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,gap:12,flexWrap:"wrap"}}>
                  <div style={cs.label}>{v.label}</div>
                  <span style={{fontFamily:T.sans,fontSize:10,color:T2.text3,fontWeight:300,textAlign:"right"}}>Best for: {v.best}</span>
                </div>
                <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,color:T2.text,lineHeight:1.7,margin:0,whiteSpace:"pre-line"}}>{result.versions?.[v.key]}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Storyboard */}
        {activeTab==='storyboard'&&(()=>{
          const VSTYLES = [
            { id:'professional', label:'Professional', desc:'Clean corporate',    panelBg:'#F0F4F8',   textCol:'#1A202C', accentCol:'#2D3748', borderCol:'#CBD5E0', imgBg:['#BEE3F8','#C6F6D5','#FEFCBF','#FED7D7','#E9D8FD','#B2F5EA'],  sceneFill:'#4299E1', labelCol:'#2B6CB0' },
            { id:'cinematic',    label:'Cinematic',    desc:'Dark & dramatic',    panelBg:'#0D0D0D',   textCol:'#F5EFE6', accentCol:T.gold,    borderCol:'rgba(138,158,132,0.25)', imgBg:['#1A1A2E','#16213E','#0F3460','#1A0A2E','#0A1628','#0D1B2A'], sceneFill:T.gold,    labelCol:T.gold },
            { id:'sketch',       label:'Sketch',       desc:'Hand-drawn style',   panelBg:'#FAFAF7',   textCol:'#2D3748', accentCol:'#4A5568', borderCol:'#A0AEC0', imgBg:['#F7FAFC','#F0FFF4','#FFFFF0','#FFF5F5','#FAF5FF','#EBFFF9'], sceneFill:'#718096', labelCol:'#2D3748' },
            { id:'fun',          label:'Fun',          desc:'Bright & bold',      panelBg:'#FFF',      textCol:'#1A202C', accentCol:'#D53F8C', borderCol:'#FED7E2', imgBg:['#FEF08A','#86EFAC','#93C5FD','#FCA5A5','#DDD6FE','#6EE7B7'], sceneFill:'#DB2777', labelCol:'#6B21A8' },
            { id:'lego',         label:'Lego',         desc:'Block style',        panelBg:'#FFD700',   textCol:'#1A1A1A', accentCol:'#CC0000', borderCol:'#CC0000', imgBg:['#FFD700','#CC0000','#2563EB','#16A34A','#CC0000','#F97316'],   sceneFill:'#1A1A1A', labelCol:'#CC0000' },
            { id:'watercolour',  label:'Watercolour',  desc:'Soft & artistic',    panelBg:'#FEFAF6',   textCol:'#44403C', accentCol:'#78716C', borderCol:'#D6D3D1', imgBg:['#FDE8D8','#D1FAE5','#DBEAFE','#FCE7F3','#EDE9FE','#CFFAFE'], sceneFill:'#9D174D', labelCol:'#57534E' },
          ];
          const PANEL_SCENES = [
            // Panel scene SVGs (path data for each scene type)
            (col,bg)=><svg viewBox="0 0 120 80" fill="none" width="100%" height="100%"><rect width="120" height="80" fill={bg}/><rect x="10" y="50" width="20" height="28" rx="2" fill={col} opacity="0.7"/><rect x="35" y="38" width="20" height="40" rx="2" fill={col} opacity="0.5"/><rect x="60" y="44" width="20" height="34" rx="2" fill={col} opacity="0.7"/><rect x="85" y="30" width="20" height="48" rx="2" fill={col} opacity="0.6"/><line x1="5" y1="52" x2="115" y2="52" stroke={col} strokeWidth="1" opacity="0.3"/><circle cx="20" cy="25" r="8" fill={col} opacity="0.15"/></svg>,
            (col,bg)=><svg viewBox="0 0 120 80" fill="none" width="100%" height="100%"><rect width="120" height="80" fill={bg}/><path d="M60 10 L110 70 L10 70 Z" fill={col} opacity="0.12"/><path d="M40 35 L80 35 M60 15 L60 55" stroke={col} strokeWidth="3" strokeLinecap="round" opacity="0.5"/><circle cx="60" cy="40" r="20" stroke={col} strokeWidth="1.5" fill="none" opacity="0.3"/><path d="M35 20 L50 35 M85 20 L70 35" stroke={col} strokeWidth="2" strokeLinecap="round" opacity="0.4"/></svg>,
            (col,bg)=><svg viewBox="0 0 120 80" fill="none" width="100%" height="100%"><rect width="120" height="80" fill={bg}/><circle cx="60" cy="34" r="18" fill={col} opacity="0.15"/><path d="M60 16 L60 52 M44 25 L76 25 M48 44 L72 44" stroke={col} strokeWidth="1.5" opacity="0.4"/><path d="M52 52 L68 52 M55 57 L65 57" stroke={col} strokeWidth="2" strokeLinecap="round" opacity="0.6"/><path d="M44 28 L32 20 M76 28 L88 20" stroke={col} strokeWidth="1.5" opacity="0.3"/><path d="M44 20 L32 28 M76 20 L88 28" stroke={col} strokeWidth="1.5" opacity="0.3"/></svg>,
            (col,bg)=><svg viewBox="0 0 120 80" fill="none" width="100%" height="100%"><rect width="120" height="80" fill={bg}/><path d="M20 60 Q40 20 60 40 Q80 60 100 20" stroke={col} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/><circle cx="100" cy="20" r="6" fill={col} opacity="0.6"/><path d="M94 26 L100 20 L106 26" stroke={col} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/><rect x="45" y="45" width="30" height="20" rx="4" fill={col} opacity="0.1"/></svg>,
            (col,bg)=><svg viewBox="0 0 120 80" fill="none" width="100%" height="100%"><rect width="120" height="80" fill={bg}/><path d="M30 65 L50 40 L70 55 L90 25" stroke={col} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/><circle cx="90" cy="25" r="5" fill={col} opacity="0.8"/><path d="M20 65 L100 65" stroke={col} strokeWidth="1" opacity="0.2"/><circle cx="30" cy="65" r="3" fill={col} opacity="0.4"/><circle cx="50" cy="40" r="3" fill={col} opacity="0.4"/><circle cx="70" cy="55" r="3" fill={col} opacity="0.4"/></svg>,
            (col,bg)=><svg viewBox="0 0 120 80" fill="none" width="100%" height="100%"><rect width="120" height="80" fill={bg}/><path d="M20 40 L90 40 M78 28 L90 40 L78 52" stroke={col} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/><circle cx="108" cy="40" r="10" fill={col} opacity="0.15"/><circle cx="108" cy="40" r="6" fill={col} opacity="0.3"/><path d="M10 25 L10 55" stroke={col} strokeWidth="2" opacity="0.2" strokeDasharray="4 3"/></svg>,
          ];

          const vs = VSTYLES.find(s=>s.id===storyStyle);
          const boards = result.storyboard||[];

          // Style picker
          if(!storyStyle) return (
            <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
              <div style={{...cs.card}}>
                <div style={cs.label}>Choose Your Visual Style</div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,marginBottom:20,fontWeight:300}}>
                  Select a style for your visual storyboard. Each panel will be rendered in your chosen aesthetic.
                </p>
                <div style={{display:"grid",gridTemplateColumns:isDesktop?"repeat(3,1fr)":"repeat(2,1fr)",gap:10}}>
                  {VSTYLES.map(s=>(
                    <button key={s.id} onClick={()=>{setStoryStyle(s.id);setStyleGenerating(true);setTimeout(()=>setStyleGenerating(false),1800);}}
                      style={{padding:isDesktop?"16px":"14px",borderRadius:8,border:"0.5px solid "+T2.border,background:T2.bg,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                      <div style={{width:"100%",height:isDesktop?48:40,borderRadius:4,background:s.imgBg[0],marginBottom:8,overflow:"hidden",position:"relative"}}>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                          {s.imgBg.slice(0,3).map((c,i)=><div key={i} style={{flex:1,height:"100%",background:c}}/>)}
                        </div>
                      </div>
                      <div style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,marginBottom:2}}>{s.label}</div>
                      <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,margin:0,fontWeight:300}}>{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );

          // Generating state
          if(styleGenerating) return (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"44px 0",textAlign:"center"}}>
              <div style={{display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.4s ease ${i*0.22}s infinite`}}/>)}</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,color:T2.text,lineHeight:1.4,margin:0}}>Rendering your {VSTYLES.find(s=>s.id===storyStyle)?.label} storyboard…</p>
            </div>
          );

          // Rendered storyboard
          const isLego = storyStyle==='lego';
          const isSketch = storyStyle==='sketch';
          return (
            <div style={{display:"flex",flexDirection:"column",gap:isDesktop?12:10}}>
              {/* Style pill + change button */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:vs.accentCol}}/>
                  <span style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T2.text}}>{vs.label} Style</span>
                </div>
                <button onClick={()=>{setStoryStyle(null);setStyleGenerating(false);}} style={{fontFamily:T.sans,fontSize:12,color:T.gold,background:"none",border:"none",cursor:"pointer",padding:0}}>Change style ↺</button>
              </div>

              {/* Panel grid */}
              <div style={{display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:isDesktop?12:10}}>
                {boards.map((panel,i)=>(
                  <div key={i} style={{borderRadius:isLego?2:8,overflow:"hidden",border:isSketch?`2px dashed ${vs.borderCol}`:`1px solid ${vs.borderCol}`,background:vs.panelBg,boxShadow:storyStyle==='cinematic'?"0 4px 20px rgba(0,0,0,0.5)":isLego?"4px 4px 0 #8B0000":"none"}}>
                    {/* Image area */}
                    <div style={{position:"relative",height:isDesktop?140:110,overflow:"hidden",background:vs.imgBg[i]}}>
                      {PANEL_SCENES[i](vs.sceneFill,vs.imgBg[i])}
                      {/* Lego stud overlay */}
                      {isLego&&<div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35) 30%, transparent 30%)",backgroundSize:"12px 12px",pointerEvents:"none"}}/>}
                      {/* Sketch hatching */}
                      {isSketch&&<div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(0,0,0,0.04) 6px,rgba(0,0,0,0.04) 7px)",pointerEvents:"none"}}/>}
                      {/* Panel number badge */}
                      <div style={{position:"absolute",top:8,left:8,width:isDesktop?26:22,height:isDesktop?26:22,borderRadius:isLego?2:4,background:isLego?"#CC0000":storyStyle==='cinematic'?"rgba(10,8,4,0.8)":"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",border:isLego?"2px solid #8B0000":"none"}}>
                        <span style={{fontFamily:T.sans,fontSize:isDesktop?11:9,fontWeight:700,color:"#fff"}}>{i+1}</span>
                      </div>
                    </div>
                    {/* Text area */}
                    <div style={{padding:isDesktop?"14px 16px":"11px 14px",borderTop:isSketch?`2px dashed ${vs.borderCol}`:isLego?`3px solid #CC0000`:`0.5px solid ${vs.borderCol}`}}>
                      <div style={{fontFamily:T.sans,fontSize:isDesktop?9:8,fontWeight:700,color:vs.labelCol,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>{panel.title}</div>
                      <div style={{fontFamily:isSketch?"Georgia,serif":T.serif,fontSize:isDesktop?14:13,fontWeight:600,color:vs.textCol,lineHeight:1.3,marginBottom:5}}>{panel.headline}</div>
                      <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:storyStyle==='cinematic'?"rgba(245,239,230,0.5)":vs.accentCol,lineHeight:1.5,margin:0,fontWeight:300,fontStyle:"italic"}}>{panel.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?11:10,color:T2.text3,textAlign:"center",lineHeight:1.5,margin:"4px 0 0",fontWeight:300}}>Visual storyboard mockup · Style: {vs.label}</p>
            </div>
          );
        })()}

        {/* CTA */}
        <div style={{...cs.card,textAlign:"center",padding:isDesktop?"24px":"18px 20px",marginTop:4}}>
          <div style={cs.label}>Next Step</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,marginBottom:16,fontWeight:300}}>You've built the story. Now it's time to deliver it. Practice your story aloud and receive AmplifyU coaching on narrative flow, clarity, and delivery.</p>
          <button onClick={restart} style={{...cs.cta,marginBottom:10}}>Build Another Story →</button>
        </div>
        <button onClick={restart} style={cs.back}>Start Over</button>
      </div>
    );
  }

  return null;
}
