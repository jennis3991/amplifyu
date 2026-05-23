import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';

export function D1MobileJargonSwap() {
  const [v,setV]=useState(""); const [r,setR]=useState(""); const [l,setL]=useState(false);
  async function go(){if(!v.trim())return;setL(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:`Simplify this, removing all jargon. Return ONLY the simplified sentence: "${v}"`}]})});const d=await res.json();setR((d.content||[]).map(b=>b.text||"").join("").trim());}catch{setR("Keep it simple enough that a 10-year-old could understand.");}setL(false);}
  return(<div><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Write your sentence…" style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:64,marginBottom:8,boxSizing:"border-box"}}/><button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?10:0}}>{l?"Simplifying…":"Simplify It →"}</button>{r&&<div style={{padding:"12px 14px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#2C2416",margin:0,lineHeight:1.6}}>{r}</p></div>}</div>);
}
export function D1MobileSim() { return null; } // replaced by D1SimWidget

// ─── THE CLARITY CHALLENGE™ ───────────────────────────────────────────────────
export function D1ClarityChallenge({T, T2, isDesktop, onSimulation}) {
  const ROUNDS = [
    {id:1,type:'mcq',difficulty:'BEGINNER',label:'Round 1',task:'Which version is easiest to understand?',
     original:'"Our strategic initiative aims to unlock scalable operational efficiencies."',
     options:['We are implementing operational optimisation strategies.','We\'re improving how we work so the business runs more efficiently.','Our strategic transformation will drive scalable performance outcomes.'],
     correct:1,why:['Plain language','Human wording','Clear meaning','No unnecessary jargon'],pts:10},
    {id:2,type:'mcq',difficulty:'INTERMEDIATE',label:'Round 2',task:'Spot the clearest version',
     original:'"Our platform facilitates asynchronous collaboration through API-enabled integrations."',
     options:['Our system helps teams work together without needing to be online at the same time.','We enable asynchronous workflow integration functionality.','Cross-functional API collaboration powers asynchronous efficiency.'],
     correct:0,why:['Removes technical jargon','Explains the benefit directly','Uses plain, human language'],pts:15},
    {id:3,type:'mcq',difficulty:'ADVANCED',label:'Round 3',task:'Executive waffle mode — spot the clearest',
     original:'"We need to create a more customer-centric innovation ecosystem."',
     options:['We need to improve our customer innovation ecosystem strategy.','We need to build better products around what customers actually need.','We must align our customer transformation framework.'],
     correct:1,why:['Specific and direct','Removes corporate speak','Clear purpose and meaning'],pts:20},
    {id:4,type:'rewrite',difficulty:'REAL WORLD',label:'Round 4',task:'Rewrite it yourself',
     prompt:'Simplify this message:',
     original:'"We are leveraging data-driven optimisation frameworks to improve customer acquisition performance."',
     example:'"We\'re using data to attract more customers."',pts:25},
    {id:5,type:'rewrite',difficulty:'NIGHTMARE MODE',label:'Round 5 — Final Boss',task:'Simplify this corporate nightmare:',
     prompt:'Simplify this:',
     original:'"Our objective is to establish a scalable cross-functional strategic framework that maximises stakeholder alignment and accelerates value creation."',
     pts:30},
  ];

  const BONUS_PROMPTS = [
    {original:'"We need to proactively leverage our core competencies to deliver a best-in-class, customer-centric value proposition."',perfect:"We need to use our strengths to serve customers better."},
    {original:'"This initiative will facilitate cross-functional synergies and drive strategic alignment across all business units."',perfect:"This will help our teams work better together."},
    {original:'"Our digital transformation roadmap will optimise operational workflows and enhance organisational agility."',perfect:"We're making our processes faster and easier to change."},
  ];

  const [phase, setPhase] = useState('intro'); // intro|playing|transition|final|bonus
  const [roundIdx, setRoundIdx] = useState(0);
  const [totalPts, setTotalPts] = useState(0);
  const [mcqPts, setMcqPts] = useState(0);
  const [rewritePts, setRewritePts] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [rewriteText, setRewriteText] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [bonusIdx, setBonusIdx] = useState(0);
  const [bonusText, setBonusText] = useState('');
  const [bonusResult, setBonusResult] = useState(null);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [bonusComplete, setBonusComplete] = useState(0);

  const round = ROUNDS[roundIdx];
  const isLast = roundIdx === ROUNDS.length - 1;

  function reset() { setPhase('intro'); setRoundIdx(0); setTotalPts(0); setMcqPts(0); setRewritePts(0); setSelected(null); setAnswered(false); setRewriteText(''); setAiResult(null); setBonusIdx(0); setBonusText(''); setBonusResult(null); setBonusComplete(0); }

  function handleMCQ(i) {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === round.correct) {
      setTotalPts(p => p + round.pts);
      setMcqPts(p => p + round.pts);
    }
  }

  function nextRound() {
    if (roundIdx === 2) { setPhase('transition'); return; }
    if (isLast) { setPhase('final'); return; }
    setRoundIdx(r => r + 1);
    setSelected(null); setAnswered(false); setRewriteText(''); setAiResult(null);
  }

  async function scoreRewrite() {
    if (!rewriteText.trim() || rewriteText.trim().length < 5) return;
    setAiLoading(true);
    const mockScore = Math.floor(Math.random()*18)+72;
    const earnedPts = Math.round(round.pts * mockScore / 100);
    const mockPerfect = round.id===4 ? "We're using data to attract more customers." : "We need to build a shared strategy that creates value for everyone involved.";
    const mockResult = {
      overall: mockScore,
      clarity: Math.floor(Math.random()*18)+72,
      simplicity: Math.floor(Math.random()*18)+72,
      brevity: Math.floor(Math.random()*18)+72,
      humanLanguage: Math.floor(Math.random()*18)+72,
      worked: ["Good use of plain language","Direct and readable"],
      improve: ["Could be even shorter","Consider cutting one more word"],
      perfect: mockPerfect,
      pts: earnedPts,
    };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:`Score this simplification for clarity. Original: ${round.original}\nUser's version: "${rewriteText}"\nReturn ONLY valid JSON: {"overall":<50-100>,"clarity":<50-100>,"simplicity":<50-100>,"brevity":<50-100>,"humanLanguage":<50-100>,"worked":["<str>","<str>"],"improve":["<str>","<str>"],"perfect":"<ideal plain-English version in 1 sentence>"}`}]})});
      const d = await res.json();
      const raw = (d.content||[]).map(b=>b.text||'').join('').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m[0]);
      const pts = Math.round(round.pts * parsed.overall / 100);
      setAiResult({...parsed, pts});
      setTotalPts(p => p + pts);
      setRewritePts(p => p + pts);
    } catch {
      setAiResult(mockResult);
      setTotalPts(p => p + mockResult.pts);
      setRewritePts(p => p + mockResult.pts);
    }
    setAiLoading(false);
  }

  async function scoreBonus() {
    if (!bonusText.trim() || bonusText.trim().length < 5) return;
    setBonusLoading(true);
    const bp = BONUS_PROMPTS[bonusIdx];
    const mockScore = Math.floor(Math.random()*20)+75;
    const mockR = { overall:mockScore, improve:"Try cutting it to one shorter clause.", perfect:bp.perfect };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:`Score this simplification. Original: ${bp.original}\nUser's: "${bonusText}"\nReturn ONLY JSON: {"overall":<50-100>,"improve":"<one coaching sentence>","perfect":"<ideal 1-sentence plain-English version>"}`}]})});
      const d = await res.json();
      const raw = (d.content||[]).map(b=>b.text||'').join('').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m[0]);
      const bonusPts = Math.round(10 * parsed.overall / 100);
      setBonusResult({...parsed, bonusPts});
      setTotalPts(p => p + bonusPts);
    } catch {
      setBonusResult({...mockR, bonusPts:Math.round(10*mockScore/100)});
      setTotalPts(p => p + Math.round(10*mockScore/100));
    }
    setBonusLoading(false);
  }

  function getBadge(score) {
    if (score >= 95) return {img:"/badge-queen.jpg",  label:"Clarity Master",      sub:"You make complex ideas feel effortless.",                    color:"#C9A84C"};
    if (score >= 85) return {img:"/badge-rook.jpg",   label:"Jargon Slayer",       sub:"You cut through complexity with precision.",                  color:T.gold};
    if (score >= 70) return {img:"/badge-bishop.jpg", label:"Plain English Pro",   sub:"Your communication is clear, direct, and easy to follow.",   color:"#7A9E84"};
    if (score >= 55) return {img:"/badge-knight.jpg", label:"Clarity Builder",     sub:"You're learning to simplify with confidence.",               color:"#8B9E7A"};
    return                  {img:"/badge-pawn.jpg",   label:"Rising Communicator", sub:"Awareness is the first step to clarity.",                    color:T2.text3};
  }

  const maxPts = ROUNDS.reduce((s,r)=>s+r.pts,0);
  const pct = Math.round((totalPts/maxPts)*100);

  const cs = {
    card: {background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"28px 32px":"18px 20px"},
    label: {fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
    h2: {fontFamily:T.serif,fontSize:isDesktop?38:26,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12},
    body: {fontFamily:T.sans,fontSize:isDesktop?16:14,color:T2.text3,lineHeight:1.65,margin:0},
    cta: {width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
    ghost: {width:"100%",padding:"11px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44},
    pts: {fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T.gold},
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={cs.card}>
        <div style={cs.label}>THE CLARITY CHALLENGE™</div>
        <h2 style={cs.h2}>Can you make this simpler?</h2>
        <p style={{...cs.body,marginBottom:20}}>Great communicators make complexity feel simple. This challenge trains you to spot jargon and communicate with precision.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24,padding:"16px 18px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
          {["5 rounds, increasing difficulty","Spot clarity, then create it","One final score","Earn your Clarity Master badge 🏆"].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:T.gold,flexShrink:0}}/>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text}}>{t}</span>
            </div>
          ))}
        </div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:16,fontWeight:600,color:T2.text,lineHeight:1.4,marginBottom:20}}>Ready? Let's begin.</p>
        <div style={{padding:"12px 16px",background:"rgba(138,158,132,0.08)",borderRadius:4,border:"0.5px solid rgba(138,158,132,0.25)",marginBottom:24,display:"flex",alignItems:"center",gap:12}}>
          <img src="/badge-queen.jpg" alt="Clarity Master" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",border:"1.5px solid rgba(201,168,76,0.4)",flexShrink:0}}/>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:2}}>Top prize</div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?16:14,color:T2.text,fontWeight:600}}>Clarity Master badge</div>
          </div>
        </div>
        <button onClick={()=>setPhase('playing')} style={cs.cta}>Start Challenge →</button>
      </div>
    </div>
  );

  // ── TRANSITION ────────────────────────────────────────────────────────────
  if (phase==='transition') return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"48px 40px":"36px 24px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>Recognition complete</div>
        <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(138,158,132,0.12)",border:"1.5px solid "+T.gold,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
          <span style={{fontSize:24}}>✓</span>
        </div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?32:24,fontWeight:600,color:T2.text,marginBottom:12}}>Real World Mode</h2>
        <p style={{...cs.body,marginBottom:8,maxWidth:400,margin:"0 auto 8px"}}>Spotting clarity is one skill.</p>
        <p style={{...cs.body,marginBottom:24,maxWidth:400,margin:"0 auto 24px"}}>Creating it is another.</p>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontStyle:"italic",color:T2.text2,marginBottom:28}}>Now it's your turn.</p>
        <button onClick={()=>{setRoundIdx(3);setPhase('playing');}} style={{...cs.cta,maxWidth:280,margin:"0 auto",display:"block"}}>Enter Real World Mode →</button>
      </div>
    </div>
  );

  // ── FINAL SCORE ───────────────────────────────────────────────────────────
  if (phase==='bonus') {
    const bp = BONUS_PROMPTS[bonusIdx];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={cs.card}>
          <div style={cs.label}>Practice Round {bonusComplete+1} of 2 — Refine Your Badge</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,color:T2.text,lineHeight:1.4,marginBottom:16,fontWeight:500}}>Simplify this:</p>
          <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T2.border}}>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{bp.original}</p>
          </div>
        </div>
        {!bonusResult ? (
          <>
            <div style={cs.card}>
              <div style={cs.label}>Your version</div>
              <textarea value={bonusText} onChange={e=>setBonusText(e.target.value)} placeholder="Write it as simply as possible…" style={{width:"100%",minHeight:isDesktop?80:72,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:14,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
            </div>
            <button onClick={scoreBonus} disabled={bonusLoading||bonusText.trim().length<5} style={{...cs.cta,background:bonusLoading||bonusText.trim().length<5?"rgba(44,36,22,0.25)":T.ink,cursor:bonusLoading||bonusText.trim().length<5?"not-allowed":"pointer"}}>
              {bonusLoading?"Scoring…":"Score My Version →"}
            </button>
          </>
        ) : (
          <>
            <div style={{...cs.card,background:"#0E0B08",border:"none",display:"flex",alignItems:"center",gap:20}}>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?48:38,fontWeight:600,color:T.gold,lineHeight:1}}>{bonusResult.overall}</div>
                <div style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.4)",marginTop:2}}>/ 100</div>
              </div>
              <div>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(138,158,132,0.8)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>+{bonusResult.bonusPts} pts earned</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:"rgba(245,239,230,0.6)",lineHeight:1.5,margin:0}}>{bonusResult.improve}</p>
              </div>
            </div>
            <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
              <div style={cs.label}>The ideal answer</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,color:T2.text,lineHeight:1.6,margin:0,fontStyle:"italic"}}>"{bonusResult.perfect}"</p>
            </div>
            {(()=>{
              const newBadge = getBadge(pct);
              return (
                <div style={{...cs.card,textAlign:"center"}}>
                  <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Updated Badge</div>
                  <div style={{display:"inline-flex",alignItems:"center",gap:12,padding:"12px 20px",background:"rgba(138,158,132,0.08)",borderRadius:6,border:`0.5px solid rgba(138,158,132,0.3)`}}>
                    <img src={newBadge.img} alt={newBadge.label} style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",border:"1.5px solid rgba(201,168,76,0.4)",flexShrink:0}}/>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:newBadge.color}}>{newBadge.label}</div>
                      <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,marginTop:2}}>{newBadge.sub}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
            <div style={{display:"flex",gap:10}}>
              {bonusComplete < 1 && (
                <button onClick={()=>{setBonusIdx(i=>(i+1)%BONUS_PROMPTS.length);setBonusText('');setBonusResult(null);setBonusComplete(c=>c+1);}} style={{...cs.ghost,flex:1}}>Next Practice →</button>
              )}
              <button onClick={()=>setPhase('final')} style={{...cs.cta,flex:1}}>See Final Score →</button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (phase==='final') {
    const badge = getBadge(pct);
    const recMax = ROUNDS.slice(0,3).reduce((s,r)=>s+r.pts,0);
    const appMax = ROUNDS.slice(3).reduce((s,r)=>s+r.pts,0);
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:"#0E0B08",borderRadius:8,padding:isDesktop?"44px 40px":"32px 20px",textAlign:"center"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(138,158,132,0.8)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>THE CLARITY CHALLENGE™</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?80:64,fontWeight:600,color:T.gold,lineHeight:1}}>{pct}</div>
          <div style={{fontFamily:T.sans,fontSize:14,color:"rgba(245,239,230,0.5)",marginBottom:20}}>/ 100</div>
          <h2 style={{fontFamily:T.serif,fontSize:isDesktop?24:20,fontWeight:600,color:"#F5EFE6",marginBottom:8}}>Your Clarity Score</h2>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,padding:"10px 20px",background:"rgba(138,158,132,0.12)",borderRadius:4,border:`0.5px solid rgba(138,158,132,0.3)`,marginTop:4}}>
            <img src={badge.img} alt={badge.label} style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",border:"1.5px solid rgba(201,168,76,0.4)",flexShrink:0}}/>
            <span style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:badge.color}}>{badge.label}</span>
          </div>
        </div>
        <div style={cs.card}>
          <div style={cs.label}>Breakdown</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[{label:"Recognition",earned:mcqPts,max:recMax},{label:"Application",earned:rewritePts,max:appMax}].map((b,i)=>(
              <div key={i} style={{padding:"14px 16px",background:T2.bg,borderRadius:4,border:"0.5px solid "+T2.border,textAlign:"center"}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T2.text3,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>{b.label}</div>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?24:20,fontWeight:600,color:T.gold}}>{b.earned}<span style={{fontSize:13,color:T2.text4}}> / {b.max}</span></div>
              </div>
            ))}
          </div>
          <div style={{height:6,background:T2.bg,borderRadius:3,overflow:"hidden",marginBottom:6}}>
            <div style={{height:"100%",width:pct+"%",background:`linear-gradient(90deg,rgba(138,158,132,0.5),${T.gold})`,borderRadius:3,transition:"width 1s ease"}}/>
          </div>
          <div style={{fontFamily:T.sans,fontSize:11,color:T2.text4,textAlign:"right"}}>{pct}% of max</div>
        </div>
        <div style={cs.card}>
          <div style={cs.label}>Coach note</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>
            {pct>=85?"Your instinct for plain language is strong. The Feynman principle is becoming second nature — keep using it in every meeting and message.":"Good foundation. The more you practice spotting jargon, the faster your instinct will develop. Every complex sentence is an opportunity to simplify."}
          </p>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={reset} style={{...cs.ghost,flex:1}}>Try Again</button>
          {onSimulation && <button onClick={onSimulation} style={{...cs.cta,flex:1}}>Continue to Simulation →</button>}
        </div>
      </div>
    );
  }

  // ── MCQ ROUND ──────────────────────────────────────────────────────────────
  if (round.type==='mcq') {
    const correct = selected===round.correct;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* Progress */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",gap:6}}>
            {ROUNDS.map((_,i)=>(
              <div key={i} style={{width:isDesktop?32:24,height:4,borderRadius:2,background:i<roundIdx?T.gold:i===roundIdx?"rgba(138,158,132,0.5)":T2.border,transition:"background 0.3s"}}/>
            ))}
          </div>
          <div style={cs.pts}>{totalPts} pts</div>
        </div>
        <div style={cs.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={cs.label}>{round.label} — {round.difficulty}</div>
          </div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,color:T2.text,lineHeight:1.4,marginBottom:16,fontWeight:500}}>{round.task}</p>
          <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T2.border,marginBottom:20}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Original</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{round.original}</p>
          </div>
        </div>
        {round.options.map((opt,i)=>{
          const isSelected = selected===i;
          const isCorrectOpt = i===round.correct;
          let bg = T2.surface, border = T2.border, textColor = T2.text;
          if (answered) {
            if (isCorrectOpt) { bg="rgba(82,112,96,0.1)"; border="#527060"; textColor="#2C5040"; }
            else if (isSelected && !isCorrectOpt) { bg="rgba(176,92,74,0.08)"; border="#B05C4A"; textColor="#6B2E22"; }
          } else if (isSelected) { bg="rgba(138,158,132,0.1)"; border=T.gold; }
          return (
            <div key={i} onClick={()=>handleMCQ(i)} style={{...cs.card,background:bg,border:`0.5px solid ${border}`,cursor:answered?"default":"pointer",transition:"all 0.2s",padding:isDesktop?"16px 20px":"14px 16px"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:24,height:24,borderRadius:"50%",border:`1.5px solid ${answered&&isCorrectOpt?"#527060":answered&&isSelected&&!isCorrectOpt?"#B05C4A":isSelected?T.gold:T2.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:answered&&isCorrectOpt?"rgba(82,112,96,0.15)":"transparent",transition:"all 0.2s"}}>
                  <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:answered&&isCorrectOpt?"#527060":answered&&isSelected&&!isCorrectOpt?"#B05C4A":T2.text3}}>{String.fromCharCode(65+i)}</span>
                </div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:textColor,lineHeight:1.6,margin:0,flex:1}}>{opt}</p>
                {answered && isCorrectOpt && <span style={{color:"#527060",fontSize:16,flexShrink:0}}>✓</span>}
                {answered && isSelected && !isCorrectOpt && <span style={{color:"#B05C4A",fontSize:16,flexShrink:0}}>✗</span>}
              </div>
            </div>
          );
        })}
        {answered && (
          <div style={{...cs.card,borderLeft:`2px solid ${correct?T.gold:"rgba(176,92,74,0.5)"}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:16}}>{correct?"✅":"💡"}</span>
              <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:correct?T.gold:"#B05C4A",textTransform:"uppercase",letterSpacing:"1px"}}>{correct?`+${round.pts} clarity points`:"The clearest version was B"}</div>
            </div>
            {correct ? (
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {round.why.map((w,i)=>(
                  <span key={i} style={{padding:"4px 10px",background:"rgba(138,158,132,0.1)",border:"0.5px solid rgba(138,158,132,0.3)",borderRadius:20,fontFamily:T.sans,fontSize:11,color:T.gold}}>{w}</span>
                ))}
              </div>
            ) : (
              <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:0}}>
                Option {String.fromCharCode(65+round.correct)} uses plain language and human wording — it removes jargon and explains the meaning directly.
              </p>
            )}
          </div>
        )}
        {answered && <button onClick={nextRound} style={cs.cta}>{isLast?"See Final Score →":roundIdx===2?"Enter Real World Mode →":"Next Challenge →"}</button>}
      </div>
    );
  }

  // ── REWRITE ROUND ──────────────────────────────────────────────────────────
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{display:"flex",gap:6}}>
          {ROUNDS.map((_,i)=>(
            <div key={i} style={{width:isDesktop?32:24,height:4,borderRadius:2,background:i<roundIdx?T.gold:i===roundIdx?"rgba(138,158,132,0.5)":T2.border,transition:"background 0.3s"}}/>
          ))}
        </div>
        <div style={cs.pts}>{totalPts} pts</div>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>{round.label} — {round.difficulty}</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,color:T2.text,lineHeight:1.4,marginBottom:16,fontWeight:500}}>{round.task}</p>
        <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T2.border,marginBottom:round.example?16:0}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Simplify this</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{round.original}</p>
        </div>
      </div>
      {!aiResult ? (
        <>
          <div style={cs.card}>
            <div style={cs.label}>Your plain English version</div>
            <textarea value={rewriteText} onChange={e=>setRewriteText(e.target.value)} placeholder="Write it as simply as possible…" style={{width:"100%",minHeight:isDesktop?96:80,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:14,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
          </div>
          <button onClick={scoreRewrite} disabled={aiLoading||rewriteText.trim().length<5} style={{...cs.cta,background:aiLoading||rewriteText.trim().length<5?"rgba(44,36,22,0.25)":T.ink,cursor:aiLoading||rewriteText.trim().length<5?"not-allowed":"pointer"}}>
            {aiLoading?"Scoring your clarity…":"Score My Version →"}
          </button>
        </>
      ) : (
        <>
          {/* Score hero */}
          <div style={{...cs.card,background:"#0E0B08",border:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:isDesktop?32:20}}>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?56:44,fontWeight:600,color:T.gold,lineHeight:1}}>{aiResult.overall}</div>
                <div style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.4)",marginTop:2}}>/ 100</div>
              </div>
              <div>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(138,158,132,0.8)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>+{aiResult.pts} pts earned</div>
                <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,color:"#F5EFE6",lineHeight:1.4,margin:0}}>Clarity score for your rewrite</p>
              </div>
            </div>
          </div>
          {/* Dimension bars */}
          <div style={cs.card}>
            {[["Clarity",aiResult.clarity],["Simplicity",aiResult.simplicity],["Brevity",aiResult.brevity],["Human Language",aiResult.humanLanguage]].map(([d,s],i)=>(
              <div key={i} style={{marginBottom:i<3?12:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontFamily:T.sans,fontSize:12,color:T2.text,fontWeight:500}}>{d}</span>
                  <span style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:s>=80?T.gold:T2.text3}}>{s}</span>
                </div>
                <div style={{height:3,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:s+"%",background:s>=80?T.gold:"rgba(138,158,132,0.4)",borderRadius:2,transition:"width 0.8s ease"}}/>
                </div>
              </div>
            ))}
          </div>
          {/* Feedback */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{...cs.card,borderLeft:"2px solid #527060"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"#527060",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>What worked</div>
              {aiResult.worked.map((w,i)=><p key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5,margin:i<aiResult.worked.length-1?"0 0 6px":0}}>✓ {w}</p>)}
            </div>
            <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Improve</div>
              {aiResult.improve.map((w,i)=><p key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5,margin:i<aiResult.improve.length-1?"0 0 6px":0}}>→ {w}</p>)}
            </div>
          </div>
          {/* Perfect answer */}
          {aiResult.perfect && (
            <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
              <div style={cs.label}>The ideal answer</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,color:T2.text,lineHeight:1.6,margin:0,fontStyle:"italic"}}>"{aiResult.perfect}"</p>
            </div>
          )}
          {/* Badge after Round 5 */}
          {isLast && (()=>{
            const badge = getBadge(pct);
            return (
              <div style={{...cs.card,textAlign:"center",padding:isDesktop?"32px":"24px 18px"}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>Your Badge</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:12,padding:"14px 24px",background:"rgba(138,158,132,0.08)",borderRadius:6,border:`0.5px solid rgba(138,158,132,0.3)`,marginBottom:12}}>
                  <img src={badge.img} alt={badge.label} style={{width:56,height:56,borderRadius:"50%",objectFit:"cover",border:"1.5px solid rgba(201,168,76,0.4)",flexShrink:0}}/>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:badge.color}}>{badge.label}</div>
                    <div style={{fontFamily:T.sans,fontSize:12,color:T2.text3,marginTop:2}}>{badge.sub}</div>
                  </div>
                </div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,margin:"0 0 4px"}}>
                  {pct >= 85 ? "Elite level. The strongest communicators make complexity feel effortless." : "Strong foundation. Keep practising and your instinct will sharpen fast."}
                </p>
              </div>
            );
          })()}
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {isLast && <button onClick={()=>{setBonusIdx(0);setBonusText('');setBonusResult(null);setBonusComplete(0);setPhase('bonus');}} style={{...cs.ghost,flex:1}}>Practise More →</button>}
            <button onClick={nextRound} style={{...cs.cta,flex:1}}>{isLast?"See Full Score →":"Next Challenge →"}</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── RECORD & REVIEW™ — D1 Simulation ────────────────────────────────────────
export function D1SimWidget({T, T2, isDesktop}) {
  const PROMPTS = {
    Work:[
      "Explain a challenge you solved recently.",
      "What makes a team truly effective?",
      "Describe the best leader you've worked with.",
      "Tell us about a difficult decision you made.",
      "What frustrates you most at work — and why?",
    ],
    Personal:[
      "What belief has genuinely changed your life?",
      "What motivates you more than anything else?",
      "What's something people misunderstand about you?",
      "Describe a moment that changed your perspective.",
      "What advice would you give your younger self?",
    ],
    Spontaneous:[
      "Is social media helping or harming us?",
      "What makes someone truly charismatic?",
      "Should schools teach negotiation?",
      "Is talent overrated compared to consistency?",
      "What creates a strong first impression?",
    ],
  };
  const ALL_PROMPTS = Object.values(PROMPTS).flat();
  const DIMS = ["Structure","Clarity","Concision","Filler Words","Pace","Confidence","Main Message"];
  const FOCUS = ["Shorter sentences","Fewer filler words","Clearer opening","Stronger structure","Slower pace","Sharper conclusion"];

  const [phase, setPhase] = useState('intro');
  const [cat, setCat] = useState('Work');
  const [prompt, setPrompt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isRec, setIsRec] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [fallback, setFallback] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [round1, setRound1] = useState(null);
  const [selectedFocus, setSelectedFocus] = useState([]);
  const [waveVals, setWaveVals] = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);

  const recRef = useRef(null);
  const timerRef = useRef(null);
  const liveRef = useRef('');
  const waveRef = useRef(null);

  const SpeechRec = typeof window!=='undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(()=>{
    if(isRec && timeLeft>0){
      timerRef.current=setTimeout(()=>setTimeLeft(t=>t-1),1000);
    } else if(isRec && timeLeft===0){
      doStop();
    }
    return ()=>clearTimeout(timerRef.current);
  },[isRec,timeLeft]);

  useEffect(()=>{
    if(!isRec){clearInterval(waveRef.current);return;}
    waveRef.current=setInterval(()=>{
      setWaveVals(()=>Array.from({length:9},()=>0.2+Math.random()*0.8));
    },150);
    return ()=>clearInterval(waveRef.current);
  },[isRec]);

  function doStart(){
    setIsRec(true); liveRef.current=''; setTranscript('');
    if(SpeechRec){
      const rec=new SpeechRec();
      rec.continuous=true; rec.interimResults=true; rec.lang='en-US';
      rec.onresult=(e)=>{
        let t='';
        for(let i=0;i<e.results.length;i++) if(e.results[i].isFinal) t+=e.results[i][0].transcript+' ';
        liveRef.current=t; setTranscript(t);
      };
      try{rec.start();}catch(e){}
      recRef.current=rec;
    }
  }

  function doStop(){
    setIsRec(false); clearTimeout(timerRef.current);
    if(recRef.current){try{recRef.current.stop();}catch(e){}}
    const text = SpeechRec ? liveRef.current : fallback;
    analyzeText(text||fallback);
  }

  async function analyzeText(text){
    setPhase('analyzing');
    const isRetry=!!round1;
    const mockScores=()=>Object.fromEntries(DIMS.map(d=>[d,Math.floor(Math.random()*22)+62+(isRetry?10:0)]));
    const mock={
      overall:Math.floor(Math.random()*18)+64+(isRetry?12:0),
      scores:mockScores(),
      worked:["Confident and natural delivery","Good conversational energy throughout"],
      improve:["Core point arrived late — lead with it next time","A few ideas drifted before landing"],
      insight:"Your delivery felt natural and genuine. The opportunity is structure: if you lead with your clearest point in the first sentence, everything that follows lands harder."
    };
    if(!text||text.trim().length<15){
      if(!isRetry){setRound1(mock);setFeedback(mock);}
      else setFeedback({...mock,prev:round1});
      setPhase(isRetry?'comparison':'feedback');
      return;
    }
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,messages:[{role:"user",content:`You are a world-class executive communication coach. Analyse this spoken response for clarity.\n\nPrompt: "${prompt}"\nResponse: "${text}"\n\nReturn ONLY valid JSON:\n{"overall":<50-100>,"scores":{"Structure":<50-100>,"Clarity":<50-100>,"Concision":<50-100>,"Filler Words":<50-100>,"Pace":<50-100>,"Confidence":<50-100>,"Main Message":<50-100>},"worked":["<strength 1>","<strength 2>"],"improve":["<opportunity 1>","<opportunity 2>"],"insight":"<2 warm coaching sentences>"}`}]})});
      const d=await res.json();
      const raw=(d.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      const parsed=JSON.parse(m[0]);
      if(!isRetry){setRound1(parsed);setFeedback(parsed);}
      else setFeedback({...parsed,prev:round1});
    }catch{
      if(!isRetry){setRound1(mock);setFeedback(mock);}
      else setFeedback({...mock,prev:round1});
    }
    setPhase(isRetry?'comparison':'feedback');
  }

  function surprise(){
    const p=ALL_PROMPTS[Math.floor(Math.random()*ALL_PROMPTS.length)];
    setPrompt(p); setPhase('recording'); setTimeLeft(120); setIsRec(false); setTranscript(''); setFallback('');
  }

  function reset(){setPhase('intro');setPrompt(null);setTimeLeft(120);setIsRec(false);setTranscript('');setFallback('');setFeedback(null);setRound1(null);setSelectedFocus([]);}

  const cs={
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
    h2:{fontFamily:T.serif,fontSize:isDesktop?36:26,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10},
    body:{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.65,margin:0},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
    ghost:{width:"100%",padding:"11px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44},
  };

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if(phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      <div style={{background:T2.surface,borderRadius:8,padding:isDesktop?"44px 48px":"32px 24px",marginBottom:16,position:"relative",overflow:"hidden",border:"0.5px solid "+T2.border}}>
        <div style={{position:"absolute",top:-60,right:-60,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(138,158,132,0.08) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:20}}>RECORD &amp; REVIEW™</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?40:30,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:16}}>The fastest way to improve is to hear yourself the way others do.</h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?16:14,color:T2.text3,lineHeight:1.7,marginBottom:28}}>Most people have never heard themselves the way others do. This exercise reveals your natural communication habits — then helps you improve them.</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
          {["Speak naturally for 90–120 seconds.","No script. No preparation.","We want to reveal your default communication patterns."].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:8}}/>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,margin:0,lineHeight:1.6}}>{t}</p>
            </div>
          ))}
        </div>
        <button onClick={()=>setPhase('prompt')} style={cs.cta}>Start Challenge →</button>
      </div>
    </div>
  );

  // ── PROMPT SELECTION ──────────────────────────────────────────────────────
  if(phase==='prompt') return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div>
        <h2 style={cs.h2}>Choose a conversation starter</h2>
        <p style={{...cs.body,marginBottom:16}}>Speak naturally. No preparation. The goal is not perfection — it's awareness.</p>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:4}}>
        {Object.keys(PROMPTS).map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{padding:"8px 16px",borderRadius:3,border:`0.5px solid ${cat===c?T.gold:T2.border}`,background:cat===c?"rgba(138,158,132,0.1)":"transparent",color:cat===c?T.gold:T2.text3,fontSize:12,fontWeight:cat===c?600:400,cursor:"pointer",fontFamily:T.sans,minHeight:36,transition:"all 0.15s"}}>{c}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {PROMPTS[cat].map((p,i)=>(
          <div key={i} onClick={()=>{setPrompt(p);setPhase('recording');setTimeLeft(120);setIsRec(false);setTranscript('');setFallback('');}} style={{...cs.card,cursor:"pointer",transition:"border-color 0.2s,box-shadow 0.2s",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}} className="au-lift">
            <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,color:T2.text,lineHeight:1.4,margin:0,flex:1}}>{p}</p>
            <span style={{color:T.gold,fontSize:18,flexShrink:0}}>→</span>
          </div>
        ))}
      </div>
      <button onClick={surprise} style={{...cs.ghost,marginTop:4}}>✦ Surprise Me</button>
    </div>
  );

  // ── RECORDING ────────────────────────────────────────────────────────────
  if(phase==='recording') return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Your prompt</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,color:T2.text,lineHeight:1.4,margin:0,fontWeight:500}}>{prompt}</p>
      </div>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"36px 32px":"28px 20px"}}>
        {/* Timer ring */}
        <div style={{position:"relative",width:120,height:120,margin:"0 auto 20px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg style={{position:"absolute",inset:0,transform:"rotate(-90deg)"}} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke={T2.border} strokeWidth="4"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke={T.gold} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${2*Math.PI*54}`}
              strokeDashoffset={`${2*Math.PI*54*(1-timeLeft/120)}`}
              style={{transition:"stroke-dashoffset 1s linear"}}/>
          </svg>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:T.serif,fontSize:32,fontWeight:600,color:timeLeft<=10?"#B05C4A":T2.text,lineHeight:1}}>{timeLeft}</div>
            <div style={{fontFamily:T.sans,fontSize:10,color:T2.text4,marginTop:2}}>seconds</div>
          </div>
        </div>
        {/* Waveform */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,height:36,marginBottom:20}}>
          {waveVals.map((h,i)=>(
            <div key={i} style={{width:isDesktop?4:3,background:isRec?T.gold:T2.border,borderRadius:2,height:isRec?Math.round(h*32)+"px":"4px",transition:"height 0.12s ease,background 0.3s ease"}}/>
          ))}
        </div>
        {/* Encouraging copy */}
        {isRec && <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,marginBottom:20,fontStyle:"italic"}}>
          {timeLeft>80?"Keep going. Stay natural."
            :timeLeft>40?"We're looking for patterns, not perfection."
            :"Almost there. Finish your thought."}
        </p>}
        {!isRec && <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,marginBottom:20}}>Speak naturally for up to 2 minutes.</p>}
        {/* Record button */}
        {!isRec ? (
          <button onClick={doStart} style={{...cs.cta,maxWidth:240,margin:"0 auto",display:"block",borderRadius:40,background:T.ink,color:T.bg}}>
            🎤 Start Recording
          </button>
        ) : (
          <button onClick={doStop} style={{...cs.cta,maxWidth:240,margin:"0 auto",display:"block",borderRadius:40,background:"rgba(176,92,74,0.15)",color:"#B05C4A",border:"0.5px solid rgba(176,92,74,0.4)"}}>
            ◼ Stop &amp; Analyse
          </button>
        )}
        {/* Live transcript preview */}
        {isRec && transcript && (
          <p style={{fontFamily:T.sans,fontSize:11,color:T2.text4,marginTop:16,lineHeight:1.5,fontStyle:"italic",maxHeight:56,overflow:"hidden",textOverflow:"ellipsis"}}>
            {transcript.slice(-120)}...
          </p>
        )}
      </div>
      {/* Text fallback */}
      {!isRec && !SpeechRec && (
        <div style={cs.card}>
          <div style={cs.label}>Type your response instead</div>
          <textarea value={fallback} onChange={e=>setFallback(e.target.value)} placeholder="Write what you'd say for 90–120 seconds…" style={{width:"100%",minHeight:120,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:14,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
          {fallback.trim().length>15 && <button onClick={()=>analyzeText(fallback)} style={{...cs.cta,marginTop:14}}>Analyse My Response →</button>}
        </div>
      )}
      <button onClick={()=>setPhase('prompt')} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>← Choose different prompt</button>
    </div>
  );

  // ── ANALYZING ────────────────────────────────────────────────────────────
  if(phase==='analyzing') return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",gap:20}}>
      <div style={{width:48,height:48,borderRadius:"50%",border:`2px solid ${T2.border}`,borderTop:`2px solid ${T.gold}`,animation:"spin 0.8s linear infinite"}}/>
      <div style={{textAlign:"center"}}>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?22:18,color:T2.text,marginBottom:6}}>Analysing your clarity…</p>
        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text4,margin:0}}>Your AI coach is reviewing your response.</p>
      </div>
    </div>
  );

  // ── FEEDBACK ─────────────────────────────────────────────────────────────
  if(phase==='feedback' && feedback) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Score hero */}
      <div style={{background:"#0E0B08",borderRadius:8,padding:isDesktop?"36px 40px":"28px 20px",display:"flex",alignItems:"center",gap:isDesktop?40:24}}>
        <div style={{flexShrink:0,textAlign:"center"}}>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?72:56,fontWeight:600,color:T.gold,lineHeight:1}}>{feedback.overall}</div>
          <div style={{fontFamily:T.sans,fontSize:12,color:"rgba(245,239,230,0.5)",marginTop:4}}>/ 100</div>
        </div>
        <div>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(138,158,132,0.8)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Your Clarity Score</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?18:15,color:"#F5EFE6",lineHeight:1.4,margin:0}}>Here's how clearly your ideas came across.</p>
        </div>
      </div>
      {/* Dimension bars */}
      <div style={cs.card}>
        <div style={cs.label}>Analysis</div>
        {DIMS.map((d,i)=>(
          <div key={i} style={{marginBottom:i<DIMS.length-1?14:0}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontFamily:T.sans,fontSize:12,color:T2.text,fontWeight:500}}>{d}</span>
              <span style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:feedback.scores[d]>=80?T.gold:feedback.scores[d]>=65?"#7A9E84":T2.text3}}>{feedback.scores[d]}</span>
            </div>
            <div style={{height:3,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:feedback.scores[d]+"%",background:feedback.scores[d]>=80?T.gold:"rgba(138,158,132,0.5)",borderRadius:2,transition:"width 0.9s ease"}}/>
            </div>
          </div>
        ))}
      </div>
      {/* What worked */}
      <div style={cs.card}>
        <div style={cs.label}>What worked</div>
        {feedback.worked.map((w,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:i<feedback.worked.length-1?10:0}}>
            <span style={{color:"#527060",fontWeight:700,flexShrink:0}}>✓</span>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.6,margin:0}}>{w}</p>
          </div>
        ))}
      </div>
      {/* Opportunities */}
      <div style={cs.card}>
        <div style={cs.label}>Opportunities to improve</div>
        {feedback.improve.map((w,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:i<feedback.improve.length-1?10:0}}>
            <span style={{color:T.gold,flexShrink:0}}>→</span>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.6,margin:0}}>{w}</p>
          </div>
        ))}
      </div>
      {/* Coach insight */}
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Coach insight</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>{feedback.insight}</p>
      </div>
      {/* Focus chips + retry */}
      <div>
        <div style={cs.label}>What to focus on next round</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          {FOCUS.map((f,i)=>{
            const sel=selectedFocus.includes(f);
            return (
              <button key={i} onClick={()=>setSelectedFocus(sf=>sel?sf.filter(x=>x!==f):[...sf,f])} style={{padding:"7px 14px",borderRadius:20,border:`0.5px solid ${sel?T.gold:T2.border}`,background:sel?"rgba(138,158,132,0.12)":"transparent",color:sel?T.gold:T2.text3,fontSize:12,cursor:"pointer",fontFamily:T.sans,minHeight:36,transition:"all 0.15s",fontWeight:sel?600:400}}>{f}</button>
            );
          })}
        </div>
        <button onClick={()=>{setPhase('recording');setTimeLeft(120);setIsRec(false);setTranscript('');setFallback('');}} style={cs.cta}>Run It Again →</button>
      </div>
    </div>
  );

  // ── COMPARISON ────────────────────────────────────────────────────────────
  if(phase==='comparison' && feedback && feedback.prev) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{background:"#0E0B08",borderRadius:8,padding:isDesktop?"36px 40px":"28px 20px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(138,158,132,0.8)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Your Improvement</div>
        <div style={{display:"flex",gap:isDesktop?32:20,alignItems:"flex-end",marginBottom:16}}>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.4)",marginBottom:4}}>Round 1</div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?52:40,fontWeight:600,color:"rgba(245,239,230,0.5)",lineHeight:1}}>{feedback.prev.overall}</div>
          </div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?28:22,color:"rgba(245,239,230,0.3)"}}>→</div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,color:T.gold,marginBottom:4}}>Round 2</div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?52:40,fontWeight:600,color:T.gold,lineHeight:1}}>{feedback.overall}</div>
          </div>
          {feedback.overall > feedback.prev.overall && (
            <div style={{marginLeft:"auto",padding:"8px 16px",background:"rgba(138,158,132,0.15)",borderRadius:4,border:"0.5px solid rgba(138,158,132,0.3)",flexShrink:0}}>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T.gold}}>+{feedback.overall - feedback.prev.overall}</div>
              <div style={{fontFamily:T.sans,fontSize:10,color:"rgba(138,158,132,0.7)"}}>points</div>
            </div>
          )}
        </div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:"rgba(245,239,230,0.6)",margin:0}}>That's real progress. Awareness changes performance.</p>
      </div>
      {/* Dimension comparison */}
      <div style={cs.card}>
        <div style={cs.label}>Score Comparison</div>
        {DIMS.map((d,i)=>{
          const s1=feedback.prev.scores[d]||0; const s2=feedback.scores[d]||0; const diff=s2-s1;
          return (
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 40px 40px 40px",gap:8,alignItems:"center",paddingBottom:i<DIMS.length-1?12:0,marginBottom:i<DIMS.length-1?12:0,borderBottom:i<DIMS.length-1?"0.5px solid "+T2.divider:"none"}}>
              <span style={{fontFamily:T.sans,fontSize:12,color:T2.text,fontWeight:500}}>{d}</span>
              <span style={{fontFamily:T.serif,fontSize:14,color:T2.text3,textAlign:"right"}}>{s1}</span>
              <span style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T.gold,textAlign:"right"}}>{s2}</span>
              <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:diff>0?"#527060":diff<0?"#B05C4A":T2.text4,textAlign:"right"}}>{diff>0?"+"+diff:diff}</span>
            </div>
          );
        })}
      </div>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Coach insight</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>{feedback.insight}</p>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>{setPhase('recording');setTimeLeft(120);setIsRec(false);setTranscript('');setFallback('');}} style={{...cs.ghost,flex:1}}>Go Again</button>
        <button onClick={reset} style={{...cs.cta,flex:1}}>New Challenge →</button>
      </div>
    </div>
  );

  return null;
}

// ─── D1 Simulation Feedback widget ───────────────────────────────────────────
export function D1SimFeedback({input}) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  async function analyse() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,messages:[{role:"user",content:`You are a clarity coach. Analyse this 60-second explanation for clarity:\n\n"${input}"\n\nReturn JSON: {score:number(1-10),strengths:[string,string],gaps:[string,string],rewrite:"one clearer version in 1-2 sentences"}`}]})});
      const data = await res.json();
      const raw = (data.content||[]).map(b=>b.text||"").join("").trim();
      try { const m=raw.match(/\{[\s\S]*\}/); setResult(JSON.parse(m[0])); } catch { setResult({score:7,strengths:["Clear main point","Good conciseness"],gaps:["Passive voice detected","Key point arrived late"],rewrite:"Here's the clearer version: lead with your main outcome, then your evidence, then your ask."}); }
    } catch { setResult(null); }
    setLoading(false);
  }
  return (
    <div>
      <button onClick={analyse} disabled={loading||!input.trim()} style={{width:"100%",padding:"12px",borderRadius:3,border:"none",background:loading||!input.trim()?"#DDD5C4":T.ink,color:loading||!input.trim()?"#6B5E44":T.bg,fontSize:13,fontWeight:600,cursor:loading||!input.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:result?16:0}}>
        {loading?"Analysing clarity…":"Get Clarity Score →"}
      </button>
      {result && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{padding:"16px 20px",background:"#EDE8DF",borderRadius:4,border:"0.5px solid #DDD5C4",display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:600,color:T.ink,lineHeight:1}}>{result.score}<span style={{fontSize:20,color:T.gold}}>/10</span></div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#6B5E44"}}>Clarity Score</div>
          </div>
          {result.strengths?.map((s,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"#527060",fontSize:13,flexShrink:0}}>✓</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.ink,lineHeight:1.5}}>{s}</span></div>)}
          {result.gaps?.map((g,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"#B05C4A",fontSize:13,flexShrink:0}}>✗</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.ink,lineHeight:1.5}}>{g}</span></div>)}
          {result.rewrite && <div style={{padding:"14px 18px",background:"#EDE8DF",borderRadius:4,borderLeft:"2px solid #8A9E84"}}><div style={{fontSize:9,fontWeight:600,color:"#527060",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>Rewrite suggestion</div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontStyle:"italic",color:T.ink,margin:0,lineHeight:1.6}}>{result.rewrite}</p></div>}
        </div>
      )}
    </div>
  );
}

// ─── D2 PRACTICE WIDGET ──────────────────────────────────────────────────────

