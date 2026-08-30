import { useState, useRef, useEffect } from 'react';
import { T as Timport } from '../theme.js';
import { useSequentialDots, SequentialDots } from './SequentialDots.jsx';

function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

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


export function StoryArchitectWidget({ T:Tp, T2:T2p, isDesktop=false, onRecordingChange }) {
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
  const [phase,      setPhase]     = useState('brief');
  const [brief,      setBrief]     = useState('');
  const [result,     setResult]    = useState(null);
  const [apiError,   setApiError]  = useState(false);

  // Block the app's "Next"/"Review" nav while the story is being generated,
  // so an accidental tap can't cut off an in-flight AI request.
  useEffect(()=>{ onRecordingChange?.(phase === 'generating'); },[phase]);
  const [storyImage,     setStoryImage]    = useState(null);
  const [storyImageErr,  setStoryImageErr] = useState('');
  const [activeScene,    setActiveScene]   = useState(0);
  const [briefOpen,      setBriefOpen]     = useState(false);
  const [coachOpen,      setCoachOpen]     = useState(false);
  const [coverTitle,     setCoverTitle]    = useState('');
  const [coverSubtitle,  setCoverSubtitle] = useState('');

  // ── My Stories — local-only persistence for generated stories ────────────
  // Shares the au1_stories array/key with D8PracticeWidget's Story Lab, but
  // each source (speechwriter vs rehearsal) is capped and listed independently.
  const STORY_CAP = 4;
  const isMine = s => s.source !== 'rehearsal';
  const [savedStories, setSavedStories] = useState(() => {
    try { return JSON.parse(localStorage.getItem("au1_stories") || "[]"); } catch { return []; }
  });
  const myStories = savedStories.filter(isMine);
  const [storiesOpen, setStoriesOpen] = useState(false);
  // Holds a just-generated story that couldn't be saved because this source's
  // cap was already reached — stays visible/usable in this session, and gets
  // saved automatically the moment a slot frees up (via deleteStory below).
  const [pendingStory, setPendingStory] = useState(null);
  // The cover image only exists after the story text is already saved (image
  // generation runs as a separate, slower async step) — this tracks which
  // saved/pending entry the current view's image belongs to, so it can be
  // attached once generation finishes. Set by saveStory and loadStory.
  const currentStoryIdRef = useRef(null);
  // Set the moment attaching a cover image to a saved entry blows the quota,
  // so the story view can tell the user right away instead of the image
  // just silently not being there next time they open it.
  const [imageSaveWarning, setImageSaveWarning] = useState(null); // null | 'dropped'

  function persistStories(next) {
    setSavedStories(next);
    try { localStorage.setItem("au1_stories", JSON.stringify(next)); } catch {}
  }

  function saveStory(parsed, briefText) {
    setImageSaveWarning(null);
    const entry = {
      id: Date.now(),
      source: 'speechwriter',
      brief: briefText,
      storyWorld: parsed.storyWorld || {},
      scenes: parsed.scenes || [],
      story: parsed.story || '',
      coverTitle: parsed.coverTitle || '',
      coverSubtitle: parsed.coverSubtitle || '',
      image: null,
      timestamp: Date.now(),
    };
    currentStoryIdRef.current = entry.id;
    if (myStories.length >= STORY_CAP) {
      setPendingStory(entry);
      return;
    }
    persistStories([entry, ...savedStories]);
  }

  // Downscales + re-encodes a data: URI for storage. The saved copy is only
  // ever displayed at up to ~340px tall in the reopened story view (never at
  // the generated image's native 1024x1536), and localStorage has nowhere
  // near the room for a full-quality PNG per story — so this trades quality
  // that was never visible for a ~90%+ size cut, well before the quota-fallback
  // below is ever needed. Falls back to the original url if canvas access
  // fails for any reason (the quota-fallback still protects that path).
  async function compressImageForStorage(dataURI, maxWidth = 640, quality = 0.75) {
    const img = new Image();
    img.src = dataURI;
    if (img.decode) await img.decode();
    else await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
    const scale = Math.min(1, maxWidth / img.naturalWidth);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  }

  // The cover image finishes generating well after the story text is already
  // saved, so it's attached to the existing entry once ready rather than
  // being part of the original save. A full-quality generated cover is by far
  // the largest thing this app puts in localStorage — even compressed, if
  // adding one would exceed the quota, keep the story (already safely saved
  // without it) and tell the user, instead of failing the whole save or
  // losing the story.
  async function attachStoryImage(id, url) {
    let stored = url;
    try { stored = await compressImageForStorage(url); }
    catch (err) { console.error('[Day8] cover compression failed, storing full-quality copy:', err); }
    setPendingStory(prev => (prev && prev.id === id) ? {...prev, image: stored} : prev);
    setSavedStories(prev => {
      if (!prev.some(s => s.id === id)) return prev; // capped/pending — nothing persisted yet to attach to
      const withImage = prev.map(s => s.id === id ? {...s, image: stored} : s);
      try { localStorage.setItem("au1_stories", JSON.stringify(withImage)); return withImage; }
      catch { setImageSaveWarning('dropped'); return prev; }
    });
  }

  function deleteStory(id) {
    setSavedStories(prev => {
      let next = prev.filter(s => s.id !== id);
      let freedForPending = false;
      if (pendingStory && next.filter(isMine).length < STORY_CAP) {
        next = [pendingStory, ...next];
        freedForPending = true;
      }
      try { localStorage.setItem("au1_stories", JSON.stringify(next)); }
      catch {
        // The promoted pending story's image is the likely culprit if this is
        // full — retry without it rather than losing the promotion entirely.
        try {
          localStorage.setItem("au1_stories", JSON.stringify(next.map(s => s.id === pendingStory?.id ? {...s, image: null} : s)));
          if (freedForPending && pendingStory?.image) setImageSaveWarning('dropped');
        } catch {}
      }
      if (freedForPending) setPendingStory(null);
      return next;
    });
  }

  // ── Delete confirmation — first tap arms a 3s confirm window, second tap deletes
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const confirmDeleteTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(confirmDeleteTimerRef.current), []);
  function handleDeleteClick(id) {
    clearTimeout(confirmDeleteTimerRef.current);
    if (confirmDeleteId === id) {
      setConfirmDeleteId(null);
      deleteStory(id);
    } else {
      setConfirmDeleteId(id);
      confirmDeleteTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  }

  function loadStory(entry) {
    setPendingStory(null);
    currentStoryIdRef.current = entry.id;
    setResult({ storyWorld: entry.storyWorld, scenes: entry.scenes, story: entry.story, coverTitle: entry.coverTitle, coverSubtitle: entry.coverSubtitle });
    setCoverTitle(entry.coverTitle || '');
    setCoverSubtitle(entry.coverSubtitle || '');
    setBrief(entry.brief || '');
    setStoryImage(entry.image || null);
    setImageSaveWarning(null);
    setApiError(false);
    setActiveScene(0);
    setPhase('results');
  }

  // Picks up a "My Saved Work" card click from the Toolkit tab — a pending
  // load flag written just before navigation, consumed once here on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('au1_pending_load');
      if (!raw) return;
      const pending = JSON.parse(raw);
      if (pending?.source !== 'speechwriter') return;
      localStorage.removeItem('au1_pending_load');
      const entry = savedStories.find(s => s.id === pending.id && s.source === 'speechwriter');
      if (entry) loadStory(entry);
    } catch {}
  }, []);

  const EXAMPLE_BRIEFS = [
    "A TED-style pitch for a new product — emotional, direct, show real human impact",
    "A cybersecurity risk presentation for our board — make it feel like breaking news, urgent and specific",
  ];


  async function generateStoryImage(scenes, storyWorld, ctitle, csub) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);
      let res;
      try {
        res = await fetch('/api/generate-storyboard-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coverMode: true, coverTitle: ctitle || storyWorld?.subject || '', coverSubtitle: csub || storyWorld?.lesson || '', storyWorld, scenes }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch(_) {
        setStoryImageErr('Server timed out — tap Retry to try again');
        setStoryImage('error');
        return;
      }
      if (data.url) {
        setStoryImage(data.url);
        if (currentStoryIdRef.current) attachStoryImage(currentStoryIdRef.current, data.url);
      } else {
        setStoryImageErr(data.error || 'Image generation failed');
        setStoryImage('error');
      }
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'Timed out — tap Retry to try again' : (err.message || 'Network error');
      setStoryImageErr(msg);
      setStoryImage('error');
    }
  }

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
  "coverTitle": "An editorial story title — 4-7 words, specific and compelling, like a documentary or non-fiction book (e.g. 'The Meeting That Changed Everything', 'Finding My Voice', 'Leading Through Uncertainty')",
  "coverSubtitle": "One short sentence capturing the transformation at the heart of this story.",
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
      const ct = parsed.coverTitle || parsed.storyWorld?.subject || '';
      const cs = parsed.coverSubtitle || parsed.storyWorld?.lesson || '';
      setCoverTitle(ct); setCoverSubtitle(cs);
      setResult(parsed); setPhase('results');
      saveStory(parsed, brief);
      setStoryImage('loading');
      generateStoryImage(parsed.scenes, parsed.storyWorld, ct, cs);
    } catch(_) {
      setApiError(true); setResult(buildFallback(brief)); setPhase('results'); setStoryImage('error');
    }
  }

  // ── BRIEF ──────────────────────────────────────────────────────────────────
  if (phase==='brief') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?20:16}}>
      <div>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Story Architect</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?34:26,fontWeight:500,color:T2.text,lineHeight:1.1,letterSpacing:"-0.5px",marginBottom:8}}>Your AmplifyU Speechwriter.</h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0,fontWeight:300}}>Whether you're pitching to a board, leading your team, delivering a keynote, or telling a personal story, Story Architect transforms rough ideas into unforgettable narratives.</p>
      </div>

      {myStories.length>0 && (
        <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
          <button onClick={()=>setStoriesOpen(v=>!v)} style={{width:"100%",background:"none",border:"none",padding:isDesktop?"14px 18px":"12px 16px",cursor:"pointer",fontFamily:T.sans,fontSize:12,color:T2.text3,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span>My Stories ({myStories.length})</span>
            <span style={{fontSize:14,opacity:0.6,transform:storiesOpen?"rotate(180deg)":"none",display:"inline-block",transition:"transform 0.2s"}}>▾</span>
          </button>
          {storiesOpen && (
            <div style={{display:"flex",flexDirection:"column",borderTop:"0.5px solid "+T2.border}}>
              {myStories.map(s=>{
                const confirming = confirmDeleteId === s.id;
                return (
                  <div key={s.id} style={{display:"flex",alignItems:"stretch",borderBottom:"0.5px solid "+T2.border}}>
                    <button onClick={()=>loadStory(s)} style={{flex:1,minWidth:0,textAlign:"left",background:"none",border:"none",padding:isDesktop?"12px 18px":"11px 16px",cursor:"pointer",display:"flex",flexDirection:"column",gap:2}}>
                      <span style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,fontWeight:500}}>{s.coverTitle || s.storyWorld?.subject || "Untitled story"}</span>
                      <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>{new Date(s.timestamp).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}</span>
                    </button>
                    <button onClick={()=>handleDeleteClick(s.id)} title={confirming?"Tap again to delete":"Delete"} style={{background:"none",border:"none",cursor:"pointer",color:confirming?"#b05c4a":T2.text4,fontSize:confirming?11:18,fontWeight:confirming?700:400,fontFamily:T.sans,padding:"0 16px",flexShrink:0,lineHeight:1,whiteSpace:"nowrap",transition:"all 0.15s"}}>{confirming?"Confirm?":"×"}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"18px"}}>
        <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>What to include</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:"0 0 14px",fontWeight:300}}>Describe the presentation, speech, meeting or story you need to tell. Include your audience, your goal, and anything you want people to remember.</p>
        <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:14}}>
          <textarea value={brief} onChange={e=>setBrief(e.target.value)} placeholder={"Start typing…"} rows={isDesktop?5:4} style={{width:"100%",background:"transparent",border:"none",outline:"none",fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.7,resize:"none",boxSizing:"border-box",fontWeight:300}}/>
          {brief.trim()&&<div style={{fontFamily:T.sans,fontSize:10,color:T2.text4,marginTop:6,textAlign:"right"}}>{brief.trim().split(/\s+/).length} words</div>}
        </div>
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
    const sw     = result.storyWorld || {};
    const scenes = result.scenes || [];
    const sc     = scenes[activeScene] || scenes[0] || {};

    const COACH_INSIGHTS = [
      { heading:"The Status Quo Hook", body:"Every great story opens by making the familiar feel slightly wrong. This first scene plants a quiet unease that compels the audience to lean forward and ask: what happens next?" },
      { heading:"Raising the Stakes", body:"Tension is the engine of narrative transportation. By introducing a meaningful obstacle here, you create the emotional fuel that carries your audience through every scene that follows." },
      { heading:"The Turning Point", body:"The most memorable talks pivot on a single reframe. This scene functions as your insight moment — the point where the audience's mental model shifts and they see the world differently." },
      { heading:"The Path Forward", body:"After tension comes momentum. This scene shows your audience that movement is possible, converting abstract insight into concrete direction and building belief in the outcome." },
      { heading:"The Proof Point", body:"Stories convince only when they feel inevitable in hindsight. This scene provides the evidence — the real, specific detail that anchors the narrative in lived experience rather than theory." },
      { heading:"The Call to Action", body:"The most powerful endings don't tell the audience what to do — they make the audience want to act. This scene uses emotional resolution to transfer ownership of the story to the listener." },
    ];

    const SCORES = [
      { label:"Story Flow",          stars:5 },
      { label:"Emotional Journey",   stars:5 },
      { label:"Audience Connection", stars:4 },
      { label:"Visual Narrative",    stars:4 },
    ];

    const StarRow = ({ stars }) => (
      <div style={{display:"flex",gap:3}}>
        {[1,2,3,4,5].map(n=>(
          <svg key={n} width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5l1.5 3 3.3.5-2.4 2.3.6 3.2L7 9l-3 1.5.6-3.2L2.2 5l3.3-.5z"
              fill={n<=stars?"#B8964A":"none"} stroke="#B8964A"
              strokeWidth="0.9" strokeLinejoin="round" opacity={n<=stars?1:0.3}/>
          </svg>
        ))}
      </div>
    );

    return (
      <div style={{display:"flex",flexDirection:"column",gap:0}}>

        {apiError&&(
          <div style={{background:"rgba(138,158,132,0.07)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.18)",padding:"10px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
            <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>AmplifyU Coach unavailable — showing a template story based on your brief.</span>
            <button onClick={()=>{setApiError(false);generate();}} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontFamily:T.sans,fontSize:11,fontWeight:600,padding:0,flexShrink:0}}>Try AI again →</button>
          </div>
        )}

        {pendingStory&&(
          <div style={{background:"rgba(176,92,74,0.06)",borderRadius:6,border:"0.5px solid rgba(176,92,74,0.2)",padding:"10px 16px",marginBottom:20}}>
            <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>You've reached your limit of {STORY_CAP} saved stories. This one is here to view now, but won't be saved — delete a story from My Stories (on the brief screen) to free up a slot.</span>
          </div>
        )}

        {imageSaveWarning&&(
          <div style={{background:"rgba(176,92,74,0.06)",borderRadius:6,border:"0.5px solid rgba(176,92,74,0.2)",padding:"10px 16px",marginBottom:20}}>
            <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>Your story is saved, but the cover image couldn't be stored because you're low on space. Delete an old story from My Stories (on the brief screen) to save images for new ones.</span>
          </div>
        )}

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{marginBottom:isDesktop?24:18}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:6}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"3px",marginTop:4}}>Narrative Frames</div>
            <button onClick={()=>setBriefOpen(v=>!v)} style={{background:"none",border:"0.5px solid "+T2.border,borderRadius:4,padding:"5px 12px",cursor:"pointer",fontFamily:T.sans,fontSize:11,color:T2.text3,display:"flex",alignItems:"center",gap:6,flexShrink:0,whiteSpace:"nowrap"}}>
              Story Brief
              <span style={{fontSize:14,opacity:0.6,transform:briefOpen?"rotate(180deg)":"none",display:"inline-block",transition:"transform 0.2s"}}>▾</span>
            </button>
          </div>
          <h2 style={{fontFamily:T.serif,fontSize:isDesktop?30:24,fontWeight:500,color:T2.text,lineHeight:1.1,letterSpacing:"-0.3px",margin:"0 0 4px"}}>{sw.subject||"Your Story"}</h2>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:0,fontWeight:300}}>{sw.lesson||sw.audience||""}</p>

          {briefOpen&&(
            <div style={{marginTop:14,background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:isDesktop?"16px 20px":"13px 16px",display:"flex",flexWrap:"wrap",gap:isDesktop?0:10}}>
              {[{k:"audience",l:"Audience"},{k:"emotion",l:"Emotion"},{k:"style",l:"Style"},{k:"visualWorld",l:"Visual World"},{k:"character",l:"Protagonist"}]
                .filter(f=>sw[f.k])
                .map((f,i,arr)=>(
                  <div key={f.k} style={{flex:"1 1 0",minWidth:120,paddingRight:isDesktop?18:0,borderRight:isDesktop&&i<arr.length-1?"0.5px solid "+T2.border:"none"}}>
                    <div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>{f.l}</div>
                    <div style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.3}}>{sw[f.k]}</div>
                  </div>
              ))}
            </div>
          )}
        </div>

        {/* ── STORY COVER ──────────────────────────────────────────────────── */}
        <div style={{marginBottom:isDesktop?28:22}}>
          <div style={{borderRadius:10,overflow:"hidden",border:"0.5px solid "+T2.border,background:INK}}>

            {/* Image */}
            {storyImage==='loading'
              ? <div style={{height:isDesktop?300:220,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"#0E0B08"}}>
                  <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"rgba(248,245,239,0.3)",animation:`glowPulse 1.4s ease ${i*0.2}s infinite`}}/>)}</div>
                  <span style={{fontFamily:T.sans,fontSize:11,color:"rgba(248,245,239,0.4)",fontWeight:300,letterSpacing:"0.04em"}}>Generating cover image…</span>
                </div>
              : storyImage && storyImage!=='error'
                ? <img loading="lazy" src={storyImage} alt="Story Cover" style={{width:"100%",height:isDesktop?340:240,objectFit:"cover",display:"block"}}/>
                : <div style={{height:isDesktop?280:200,background:"linear-gradient(160deg,#1A1410 0%,#2C2416 100%)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                      <circle cx="28" cy="28" r="26" stroke="rgba(138,158,132,0.25)" strokeWidth="0.5"/>
                      <circle cx="28" cy="28" r="16" stroke="rgba(138,158,132,0.15)" strokeWidth="0.5"/>
                      <circle cx="28" cy="28" r="6"  stroke="rgba(138,158,132,0.1)"  strokeWidth="0.5"/>
                      <circle cx="28" cy="28" r="2"  fill="rgba(138,158,132,0.35)"/>
                    </svg>
                  </div>
            }

            {/* Title block */}
            <div style={{padding:isDesktop?"24px 28px 26px":"18px 20px 22px",background:INK}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:10}}>Book Cover · First Edition</div>
              <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:22,fontWeight:500,color:"#F8F5EF",lineHeight:1.15,margin:"0 0 8px",letterSpacing:"-0.3px"}}>{coverTitle||sw.subject||"Your Story"}</h2>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(248,245,239,0.5)",margin:0,fontWeight:300,lineHeight:1.55}}>{coverSubtitle||sw.lesson||""}</p>
            </div>

            {/* Error bar */}
            {storyImage==='error'&&(
              <div style={{padding:"8px 14px",borderTop:"0.5px solid rgba(248,245,239,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                <span style={{fontFamily:T.sans,fontSize:10,color:"rgba(200,82,74,0.8)",fontWeight:300}}>{storyImageErr||"Cover image generation failed"}</span>
                <button onClick={()=>{setStoryImage('loading');setStoryImageErr('');generateStoryImage(scenes,sw,coverTitle,coverSubtitle);}} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontFamily:T.sans,fontSize:10,fontWeight:600,padding:0}}>Retry →</button>
              </div>
            )}
          </div>
        </div>

        {/* ── INTERACTIVE STORY EXPLORER ───────────────────────────────────── */}
        <div style={{marginBottom:isDesktop?28:22,background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
          <div style={{display:"flex",flexDirection:isDesktop?"row":"column"}}>

            {/* Left: scene nav */}
            <div style={{width:isDesktop?180:undefined,borderRight:isDesktop?"0.5px solid "+T2.border:"none",borderBottom:isDesktop?"none":"0.5px solid "+T2.border,flexShrink:0,padding:isDesktop?"20px 0":"12px 0",overflowX:isDesktop?"visible":"auto",display:"flex",flexDirection:isDesktop?"column":"row",WebkitOverflowScrolling:"touch"}}>
              {scenes.map((scene,i)=>{
                const active = i===activeScene;
                return (
                  <button key={i} onClick={()=>setActiveScene(i)} style={{display:"flex",alignItems:"center",gap:10,padding:isDesktop?"9px 20px":"8px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left",width:isDesktop?"100%":"auto",flexShrink:0,transition:"background 0.15s",borderLeft:isDesktop&&active?"2px solid "+INK:"2px solid transparent"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:active?INK:"transparent",border:"1.5px solid "+(active?INK:T2.border),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s"}}>
                      <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:active?"#F8F5EF":T2.text4}}>{i+1}</span>
                    </div>
                    <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:active?T2.text:T2.text3,fontWeight:active?600:300,lineHeight:1.3,whiteSpace:isDesktop?"normal":"nowrap"}}>{scene.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: scene detail */}
            <div style={{flex:1,padding:isDesktop?"28px 32px":"20px 18px"}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:14}}>Scene {activeScene+1} of {scenes.length}</div>
              <blockquote style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:400,color:T2.text,lineHeight:1.45,letterSpacing:"-0.2px",margin:"0 0 16px",padding:0}}>"{sc.caption}"</blockquote>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.7,margin:"0 0 16px",fontWeight:300}}>{sc.narrative}</p>

              {/* Emotion badge */}
              <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,border:"0.5px solid "+T2.border,background:CREAM,marginBottom:20}}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 11.5Q2 8 3.5 4.5 4 2.5 7 5 10 2.5 10.5 4.5 12 8 7 11.5Z" fill="#B8964A" opacity="0.35" stroke="#B8964A" strokeWidth="0.8" strokeLinejoin="round"/></svg>
                <span style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"#B8964A",textTransform:"uppercase",letterSpacing:"1.5px"}}>{sc.emotion}</span>
              </div>

              {/* Coach Insight */}
              <div style={{background:"rgba(138,158,132,0.07)",borderRadius:8,border:"0.5px solid rgba(138,158,132,0.2)"}}>
                <button onClick={()=>setCoachOpen(v=>!v)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:isDesktop?"14px 20px":"12px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5Q10.5 1.5 10.5 5.2 10.5 7.5 8.5 8.5L8.5 10.5 5.5 10.5 5.5 8.5Q3.5 7.5 3.5 5.2 3.5 1.5 7 1.5Z" fill="none" stroke={T.gold} strokeWidth="1.1" strokeLinejoin="round"/><line x1="5.5" y1="11.5" x2="8.5" y2="11.5" stroke={T.gold} strokeWidth="1.1" strokeLinecap="round"/><line x1="6" y1="12.8" x2="8" y2="12.8" stroke={T.gold} strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px"}}>Coach Insight</span>
                  </div>
                  <span style={{fontSize:13,color:T.gold,opacity:0.7,transform:coachOpen?"rotate(180deg)":"none",display:"inline-block",transition:"transform 0.2s"}}>▾</span>
                </button>
                {coachOpen&&(
                  <div style={{padding:isDesktop?"0 20px 16px":"0 16px 14px"}}>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text,marginBottom:6,letterSpacing:"0.3px"}}>{COACH_INSIGHTS[activeScene]?.heading}</div>
                    <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,lineHeight:1.65,margin:0,fontWeight:300}}>{COACH_INSIGHTS[activeScene]?.body}</p>
                  </div>
                )}
              </div>

              {/* Prev / Next */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:20}}>
                <button onClick={()=>setActiveScene(v=>Math.max(0,v-1))} disabled={activeScene===0} style={{background:"none",border:"0.5px solid "+T2.border,borderRadius:4,padding:"7px 14px",cursor:activeScene===0?"default":"pointer",fontFamily:T.sans,fontSize:12,color:activeScene===0?T2.text4:T2.text,opacity:activeScene===0?0.35:1}}>← Previous</button>
                <span style={{fontFamily:T.sans,fontSize:10,color:T2.text4,fontWeight:300}}>Scene {activeScene+1} of {scenes.length}</span>
                <button onClick={()=>setActiveScene(v=>Math.min(scenes.length-1,v+1))} disabled={activeScene===scenes.length-1} style={{background:"none",border:"0.5px solid "+T2.border,borderRadius:4,padding:"7px 14px",cursor:activeScene===scenes.length-1?"default":"pointer",fontFamily:T.sans,fontSize:12,color:activeScene===scenes.length-1?T2.text4:T2.text,opacity:activeScene===scenes.length-1?0.35:1}}>Next →</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── STORY STRENGTH ──────────────────────────────────────────────── */}
        <div style={{marginBottom:isDesktop?28:22,background:T2.surface,borderRadius:10,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
          <div style={{padding:isDesktop?"18px 24px 14px":"14px 18px 12px",borderBottom:"0.5px solid "+T2.border}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"2.5px"}}>Story Strength</div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap"}}>
            {SCORES.map((s,i)=>(
              <div key={i} style={{flex:"1 1 0",minWidth:130,padding:isDesktop?"16px 24px":"13px 18px",borderRight:i%2===0&&isDesktop?"0.5px solid "+T2.border:"none",borderBottom:i<2&&!isDesktop?"0.5px solid "+T2.border:i<2&&isDesktop?"0.5px solid "+T2.border:i>=2&&!isDesktop&&i<3?"0.5px solid "+T2.border:"none"}}>
                <div style={{fontFamily:T.sans,fontSize:11,color:T2.text,fontWeight:500,marginBottom:6}}>{s.label}</div>
                <StarRow stars={s.stars}/>
              </div>
            ))}
          </div>
        </div>

        {/* ── PREMIUM ACTIONS ─────────────────────────────────────────────── */}
        <div style={{marginBottom:isDesktop?24:18}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:12}}>Take it Further</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8}}>
            {[
              {label:"Turn into TED Talk",       sub:"Restructure for a 15-minute keynote format",   action:null},
            ].map((a,i)=>(
              <button key={i} onClick={a.action||undefined} style={{padding:isDesktop?"13px 18px":"12px 16px",borderRadius:6,border:"0.5px solid "+T2.border,background:T2.surface,cursor:a.action?"pointer":"default",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,transition:"background 0.15s",opacity:a.action?1:0.45}}>
                <div>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,fontWeight:500,marginBottom:2}}>{a.label}</div>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?11:10,color:T2.text3,fontWeight:300}}>{a.sub}</div>
                </div>
                <span style={{color:T2.text4,fontSize:14,flexShrink:0}}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>{setResult(null);setPhase('brief');}} style={{padding:isDesktop?"13px 18px":"12px 16px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:isDesktop?13:12,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>← Edit Brief</button>
          {!pendingStory && <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4,fontStyle:"italic"}}>Saved to "My Saved Work"</span>}
        </div>
      </div>
    );
  }

  return null;
}

const SC_PROJECT  = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><path d="M3 9h6"/><path d="M3 15h6"/></svg>;
const SC_MISTAKE  = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const SC_SEARCH   = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const SC_SPARK    = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const SC_RISK     = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const SC_ALIGN    = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const SC_GROW     = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M12 12C12 12 7 10 7 5c0 0 5 0 5 7z"/><path d="M12 12C12 12 17 10 17 5c0 0-5 0-5 7z"/></svg>;
const SC_CONVO    = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const SC_SHIELD   = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const SC_CHANGE   = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const SC_MOUNTAIN = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18L13 4a1 1 0 00-1.73 0L3 20z"/><line x1="12" y1="11" x2="12" y2="15"/></svg>;
const SC_MENTOR   = s => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7a4 4 0 108 0 4 4 0 00-8 0"/><path d="M6 21v-2a4 4 0 014-4h2.5"/><path d="M19.5 17.5c.5-.5 1.5-1.5 1.5-2.5a2 2 0 00-4 0c0 1 1 2 1.5 2.5"/></svg>;

const BEAT_LABELS = ["Once upon a time…","Every day…","Until one day…","Because of that…","Because of that…","Until finally…"];

export function D8PracticeWidget({ T: Tp, T2: T2p, isDesktop = false, onSimulation, onNavLabel, onNavFn }) {
  const T  = Tp  || Timport;
  const T2 = T2p || T2D;

  const _roleId = (() => { try { return localStorage.getItem("au1_role"); } catch(_) { return null; } })();

  const STORY_CARDS = [
    { icon: SC_MOUNTAIN, title: "The decision that shaped my future", sub: "A choice that changed the direction of your career or life." },
    { icon: SC_SPARK,    title: "The moment everything clicked",      sub: "A breakthrough that completely changed how you see your work or yourself." },
    ...({
      individual: [
        { icon: SC_SEARCH,   title: "The problem only I spotted",      sub: "A moment where your expertise made the difference." },
        { icon: SC_SPARK,    title: "The idea that changed the outcome", sub: "A suggestion or improvement that had a bigger impact than expected." },
      ],
      delivery: [
        { icon: SC_RISK,    title: "The project that almost went wrong",        sub: "A moment where you kept a project on track." },
        { icon: SC_ALIGN,   title: "The decision that brought everyone together", sub: "A time you aligned people around a common direction." },
      ],
      people: [
        { icon: SC_GROW,  title: "The person I helped grow",            sub: "A moment where coaching or support changed someone's confidence or performance." },
        { icon: SC_CONVO, title: "The conversation that changed a team", sub: "A difficult conversation that ultimately strengthened relationships." },
      ],
      senior: [
        { icon: SC_SHIELD, title: "The decision that shaped the business", sub: "A decision that created long-term impact." },
        { icon: SC_CHANGE, title: "The change I asked people to believe in", sub: "A time you brought others with you through uncertainty." },
      ],
    }[_roleId] || [
      { icon: SC_MOUNTAIN, title: "The challenge that changed me",      sub: "A moment that stretched you further than you thought possible." },
      { icon: SC_MENTOR,   title: "The mentor who changed my career",   sub: "Someone whose advice, belief, or challenge changed how you think, work or lead." },
    ]),
  ];

  const [phase,       setPhase]       = useState('select');
  const [selected,    setSelected]    = useState(null);
  const [elapsed,     setElapsed]     = useState(0);
  const [transcript,  setTranscript]  = useState('');
  const [storyResult, setStoryResult] = useState(null);
  const [storyFallback, setStoryFallback] = useState(false);
  const [visCount,    setVisCount]    = useState(0);
  const [micError,    setMicError]    = useState(false);

  // ── My Stories — shares the au1_stories key with StoryArchitectWidget, but
  // this source (rehearsal) is capped and listed independently from theirs.
  const STORY_CAP = 4;
  const isMine = s => s.source === 'rehearsal';
  const [savedStories, setSavedStories] = useState(() => {
    try { return JSON.parse(localStorage.getItem("au1_stories") || "[]"); } catch { return []; }
  });
  const myStories = savedStories.filter(isMine);
  const [storiesOpen, setStoriesOpen] = useState(false);
  // Holds a just-generated rehearsal story that couldn't be saved because the
  // cap was already reached — freed automatically once a slot opens via
  // deleteStory below.
  const [pendingStory, setPendingStory] = useState(null);

  function saveRehearsalStory(sr) {
    const entry = {
      id: Date.now(),
      source: 'rehearsal',
      coverTitle: sr.storyTitle || '',
      storyWorld: {},
      scenes: [],
      story: '',
      beats: [sr.beat1, sr.beat2, sr.beat3, sr.beat4, sr.beat5, sr.beat6],
      coachObservation: sr.coachObservation || '',
      timestamp: Date.now(),
    };
    if (myStories.length >= STORY_CAP) {
      setPendingStory(entry);
      return;
    }
    const next = [entry, ...savedStories];
    setSavedStories(next);
    try { localStorage.setItem("au1_stories", JSON.stringify(next)); } catch {}
  }

  function deleteStory(id) {
    setSavedStories(prev => {
      let next = prev.filter(s => s.id !== id);
      let freedForPending = false;
      if (pendingStory && next.filter(isMine).length < STORY_CAP) {
        next = [pendingStory, ...next];
        freedForPending = true;
      }
      try { localStorage.setItem("au1_stories", JSON.stringify(next)); } catch {}
      if (freedForPending) setPendingStory(null);
      return next;
    });
  }

  // ── Delete confirmation — first tap arms a 3s confirm window, second tap deletes
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const confirmDeleteTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(confirmDeleteTimerRef.current), []);
  function handleDeleteClick(id) {
    clearTimeout(confirmDeleteTimerRef.current);
    if (confirmDeleteId === id) {
      setConfirmDeleteId(null);
      deleteStory(id);
    } else {
      setConfirmDeleteId(id);
      confirmDeleteTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  }

  function loadRehearsalStory(entry) {
    setStoryResult({
      storyTitle: entry.coverTitle || 'Your Career Story',
      beat1: entry.beats?.[0] || '',
      beat2: entry.beats?.[1] || '',
      beat3: entry.beats?.[2] || '',
      beat4: entry.beats?.[3] || '',
      beat5: entry.beats?.[4] || '',
      beat6: entry.beats?.[5] || '',
      coachObservation: entry.coachObservation || '',
      readyLine: 'Now let Story Architect turn this into something you can use in any room.',
    });
    setStoryFallback(false);
    setPhase('reveal');
  }

  // Picks up a "My Saved Work" card click from the Toolkit tab — a pending
  // load flag written just before navigation, consumed once here on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('au1_pending_load');
      if (!raw) return;
      const pending = JSON.parse(raw);
      if (pending?.source !== 'rehearsal') return;
      localStorage.removeItem('au1_pending_load');
      const entry = savedStories.find(s => s.id === pending.id && s.source === 'rehearsal');
      if (entry) loadRehearsalStory(entry);
    } catch {}
  }, []);

  const recRef    = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef  = useRef(null);
  const maxTimRef = useRef(null);

  const dotCount = useSequentialDots(phase === 'speak');
  const procDotCount = useSequentialDots(phase === 'processing');

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

  useEffect(() => {
    if (!onNavLabel) return;
    if (phase === 'reveal' && storyResult && !storyFallback) {
      onNavLabel("Continue");
      if (onNavFn) onNavFn.current = () => onSimulation?.();
    } else {
      onNavLabel(null);
      if (onNavFn) onNavFn.current = null;
    }
  }, [phase, storyResult, storyFallback]);

  function startRec() {
    setTranscript('');
    setElapsed(0);
    setMicError(false);
    audioChunksRef.current = [];
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        let mr;
        try { mr = new MediaRecorder(stream, {mimeType: 'audio/webm'}); }
        catch { mr = new MediaRecorder(stream); }
        mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mr.start(1000);
        recRef.current = mr;
        setPhase('recording');
        maxTimRef.current = setTimeout(doStop, 180000);
      }).catch(() => { setMicError(true); });
    } else {
      setMicError(true);
    }
  }

  async function doStop() {
    clearTimeout(maxTimRef.current);
    const mr = recRef.current;
    setPhase('processing');
    if (!mr || mr.state === 'inactive') { await callCoach(''); return; }
    mr.onstop = async () => {
      mr.stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
      let text = '';
      try {
        const b64 = await blobToB64(blob);
        const res = await fetch('/api/transcribe', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({b64, mimeType: 'audio/webm'}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Transcription failed');
        text = (data.text || '').trim();
      } catch (err) {
        console.error('[D8PracticeWidget] transcribe error:', err);
      }
      setTranscript(text);
      await callCoach(text);
    };
    try { mr.stop(); } catch(e) { await callCoach(''); }
  }

  async function callCoach(text) {
    const cardTitle = STORY_CARDS[selected]?.title || 'a career story';
    setStoryFallback(false);
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
      const built = {
        storyTitle:       json.storyTitle       || 'Your Career Story',
        beat1:            json.beat1            || 'Something brought me to this moment.',
        beat2:            json.beat2            || 'Life was moving forward in its usual way.',
        beat3:            json.beat3            || 'Then something changed.',
        beat4:            json.beat4            || 'I responded differently than I expected.',
        beat5:            json.beat5            || 'What followed shifted something fundamental.',
        beat6:            json.beat6            || 'I came out the other side changed.',
        coachObservation: json.coachObservation || 'There is real power in what you just shared.',
        readyLine:        json.readyLine        || 'Now let Story Architect turn this into something you can use in any room.',
      };
      setStoryResult(built);
      saveRehearsalStory(built);
    } catch (_) {
      setStoryFallback(true);
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
        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>STORY LAB · DAY 8</div>
        <h2 style={{ fontFamily:T.serif, fontSize:isDesktop?32:26, fontWeight:600, color:T2.text, lineHeight:1.1, margin:0 }}>Story Lab</h2>
      </div>

      {myStories.length>0 && (
        <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
          <button onClick={()=>setStoriesOpen(v=>!v)} style={{width:"100%",background:"none",border:"none",padding:isDesktop?"14px 18px":"12px 16px",cursor:"pointer",fontFamily:T.sans,fontSize:12,color:T2.text3,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span>My Stories ({myStories.length})</span>
            <span style={{fontSize:14,opacity:0.6,transform:storiesOpen?"rotate(180deg)":"none",display:"inline-block",transition:"transform 0.2s"}}>▾</span>
          </button>
          {storiesOpen && (
            <div style={{display:"flex",flexDirection:"column",borderTop:"0.5px solid "+T2.border}}>
              {myStories.map(s=>{
                const confirming = confirmDeleteId === s.id;
                return (
                  <div key={s.id} style={{display:"flex",alignItems:"stretch",borderBottom:"0.5px solid "+T2.border}}>
                    <button onClick={()=>loadRehearsalStory(s)} style={{flex:1,minWidth:0,textAlign:"left",background:"none",border:"none",padding:isDesktop?"12px 18px":"11px 16px",cursor:"pointer",display:"flex",flexDirection:"column",gap:2}}>
                      <span style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,fontWeight:500}}>{s.coverTitle || s.storyWorld?.subject || "Untitled story"}</span>
                      <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>{new Date(s.timestamp).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}</span>
                    </button>
                    <button onClick={()=>handleDeleteClick(s.id)} title={confirming?"Tap again to delete":"Delete"} style={{background:"none",border:"none",cursor:"pointer",color:confirming?"#b05c4a":T2.text4,fontSize:confirming?11:18,fontWeight:confirming?700:400,fontFamily:T.sans,padding:"0 16px",flexShrink:0,lineHeight:1,whiteSpace:"nowrap",transition:"all 0.15s"}}>{confirming?"Confirm?":"×"}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {pendingStory && (
        <div style={{background:"rgba(176,92,74,0.06)",borderRadius:6,border:"0.5px solid rgba(176,92,74,0.2)",padding:"10px 16px"}}>
          <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>You've reached your limit of {STORY_CAP} saved stories. Your last story is still viewable this session, but won't be saved until you delete one above.</span>
        </div>
      )}

      <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, lineHeight:1.6, margin:0 }}>Choose the story that feels most meaningful to you. Speak for around 60 seconds. Don't worry about telling it perfectly — just tell it naturally. Your AmplifyU coach will identify the strongest parts of your story and help shape it into one you can use again and again.</p>
      <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(138,158,132,0.08)',borderRadius:20,padding:'7px 14px',border:'0.5px solid rgba(138,158,132,0.22)'}}>
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8.5" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5"/>
          <path d="M10 6v4l2.5 2" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:'rgba(138,158,132,0.8)',letterSpacing:'0.05em'}}>1 min warm-up</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {STORY_CARDS.map((c, i) => {
          const sel = selected === i;
          const sc  = sel ? T.gold : T2.text3;
          return (
            <div key={i} onClick={() => setSelected(i)} style={{ background:sel?"rgba(138,158,132,0.08)":T2.surface, borderRadius:8, border:`1px solid ${sel?T.gold:T2.border}`, padding:"18px 16px 16px", cursor:"pointer", transition:"all 0.18s", textAlign:"center" }}>
              <div style={{ marginBottom:10, display:"flex", justifyContent:"center" }}>{c.icon(sc)}</div>
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
        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>STORY LAB · DAY 8</div>
        <h2 style={{ fontFamily:T.serif, fontSize:isDesktop?32:26, fontWeight:600, color:T2.text, lineHeight:1.1, margin:0 }}>Story Lab</h2>
      </div>
      <h3 style={{ fontFamily:T.serif, fontSize:isDesktop?26:22, fontWeight:600, color:T2.text, lineHeight:1.2, margin:0 }}>{STORY_CARDS[selected]?.title}</h3>
      <div style={{ background:T2.surface, borderRadius:8, border:"0.5px solid "+T2.border, padding:"28px 24px 22px" }}>
        <div style={{ fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:16 }}>Your Story</div>
        <p style={{ fontFamily:T.serif, fontSize:isDesktop?22:19, color:T2.text, lineHeight:1.55, margin:0, fontWeight:500 }}>Speak for around 60 seconds. Your AmplifyU coach will find the shape of your story and turn it into something you can use anywhere.</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:600, color:T2.text3, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6 }}>As you speak, try to touch on</div>
        {["The situation before everything changed","What disrupted things or created a turning point","How you responded and what shifted","Where you ended up — the outcome and what it meant"].map((beat, i) => (
          <div key={i} style={{ padding:"9px 0 9px 16px", borderLeft:"2px solid rgba(138,158,132,0.4)" }}>
            <span style={{ fontFamily:T.serif, fontSize:14, color:T2.text, lineHeight:1.5 }}>{beat}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"8px 0" }}>
        <SequentialDots dotCount={dotCount} size={8} gap={8}/>
        <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, margin:0 }}>Just speak. We'll find the shape of your story.</p>
      </div>
      {micError && <p style={{fontFamily:T.sans,fontSize:12,color:"#B05C4A",margin:0,textAlign:"center"}}>Check your microphone permission and try again.</p>}
      <button onClick={startRec} style={{ width:"100%", padding:"15px", borderRadius:4, border:"none", background:T.ink, color:T2.bg||"#F7F3EC", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:50 }}>
        Start Speaking →
      </button>
    </div>
  );

  // ── Recording ─────────────────────────────────────────────────────────────
  if (phase === 'recording') return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div>
        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>STORY LAB · DAY 8</div>
        <h2 style={{ fontFamily:T.serif, fontSize:isDesktop?32:26, fontWeight:600, color:T2.text, lineHeight:1.1, margin:0 }}>Story Lab</h2>
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
        <p style={{ fontFamily:T.serif, fontSize:isDesktop?22:19, fontStyle:"italic", color:"rgba(245,239,230,0.9)", lineHeight:1.55, margin:"0 0 22px" }}>Finding the shape of your story...</p>
        <SequentialDots dotCount={procDotCount} activeColor="rgba(245,239,230,0.85)" inactiveColor="rgba(245,239,230,0.15)"
          messages={["Your AmplifyU coach is listening.","Finding your setup, your turn, and your outcome.","Shaping your six beats.","Almost there…"]}
          textStyle={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"rgba(245,239,230,0.38)",fontWeight:300}}/>
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
              Continue to Story Architect →
            </button>
            {!pendingStory && <p style={{ fontFamily:T.sans, fontSize:11, color:T2.text4, fontStyle:"italic", textAlign:"center", margin:"12px 0 0" }}>Saved to "My Saved Work"</p>}
          </>
        )}
      </div>
    );
  }

  return null;
}
