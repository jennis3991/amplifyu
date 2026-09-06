import { useState, useEffect, useRef } from 'react';
import { T, TK } from '../theme.js';
import { QUICK_PREP } from '../data.js';

// Auto-running ring countdown — no Start/Pause/Reset buttons to operate.
// Remounted per step via `key`, so a fresh instance always starts at
// totalSecs and its completion guard resets automatically.
function RingTimer({ totalSecs, onComplete }) {
  const [rem, setRem] = useState(totalSecs);
  const [paused, setPaused] = useState(false);
  const firedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (paused) return;
    if (rem <= 0) {
      if (!firedRef.current) { firedRef.current = true; onCompleteRef.current(); }
      return;
    }
    const id = setTimeout(() => setRem(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [rem, paused]);

  const size = 136, stroke = 5, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = (totalSecs - rem) / totalSecs;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={TK.border} strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={TK.sageDark} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-pct)} style={{transition:"stroke-dashoffset 1s linear"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:TK.text,letterSpacing:"-1px"}}>{rem}</span>
        </div>
      </div>
      <button onClick={()=>setPaused(p=>!p)} style={{background:"none",border:"none",padding:4,cursor:"pointer",fontFamily:T.sans,fontSize:12,fontWeight:600,color:TK.text3,textDecoration:"underline",textUnderlineOffset:3}}>
        {paused?"Resume":"Pause"}
      </button>
    </div>
  );
}

export function QuickPrepFlow({ onBack, isDesktop=false }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  function advance() {
    if (step < QUICK_PREP.length - 1) setStep(s => s + 1);
    else setDone(true);
  }

  if (done) {
    return (
      <div style={{background:TK.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
        <div style={{textAlign:"center",maxWidth:320}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:TK.sageDark,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 22px"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l5 5L19 7" stroke={TK.onDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:TK.text,marginBottom:12,letterSpacing:"-0.4px"}}>You're ready.</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:TK.text3,lineHeight:1.65,marginBottom:36}}>Clear. Calm. Ready to walk in and speak with intention.</p>
          <button onClick={onBack} style={{width:"100%",padding:"15px",borderRadius:8,border:"none",background:TK.ink,color:TK.onDark,fontSize:15,fontWeight:700,cursor:"pointer"}}>Back to Toolkit</button>
        </div>
      </div>
    );
  }

  const s = QUICK_PREP[step];

  return (
    <div style={{background:TK.bg,minHeight:"100vh"}}>
      <div style={{position:"relative",background:TK.ink,overflow:"hidden",padding:isDesktop?"28px 88px":"20px 20px"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 80% 20%, rgba(168,179,163,0.08) 0%, transparent 55%)"}}/>
        <div style={{position:"relative",maxWidth:isDesktop?1160:undefined,margin:isDesktop?"0 auto":undefined}}>
          <button onClick={onBack} style={{height:36,padding:"0 14px 0 10px",borderRadius:18,background:"rgba(248,246,241,0.1)",border:"none",display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:16}}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M11 3L5 9l6 6" stroke={TK.onDark} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{fontFamily:T.sans,fontSize:13,fontWeight:500,color:TK.onDark}}>Exit</span>
          </button>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:TK.sage,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Pre-Meeting Ritual — Step {step+1} of {QUICK_PREP.length}</div>
          <div style={{display:"flex",gap:5}}>
            {QUICK_PREP.map((_,i) => <div key={i} style={{flex:1,height:2,borderRadius:1,background:i<=step?TK.sage:"rgba(248,246,241,0.15)"}}/>)}
          </div>
        </div>
      </div>

      <div style={{maxWidth:isDesktop?520:undefined,margin:isDesktop?"0 auto":undefined,padding:isDesktop?"48px 24px 60px":"36px 24px 40px",display:"flex",flexDirection:"column",alignItems:"center",gap:28}}>
        <RingTimer key={step} totalSecs={s.secs} onComplete={advance}/>
        <div style={{textAlign:"center"}}>
          <h2 style={{fontFamily:T.serif,fontSize:24,fontWeight:600,color:TK.text,marginBottom:10,letterSpacing:"-0.3px"}}>{s.title}</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:TK.text3,lineHeight:1.65,maxWidth:340}}>{s.desc}</p>
        </div>
        <button onClick={advance} style={{width:"100%",maxWidth:340,padding:"15px",borderRadius:8,border:"none",background:TK.ink,color:TK.onDark,fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {step<QUICK_PREP.length-1?"Next":"Finish"} <span>→</span>
        </button>
      </div>
    </div>
  );
}
