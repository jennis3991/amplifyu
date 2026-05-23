import { useState } from 'react';
import { T } from '../theme.js';
import { QUICK_PREP } from '../data.js';
import { Scene, OBScene } from '../scenes.jsx';
import { Timer } from '../components/Timer.jsx';

export function QuickPrepFlow({onBack, DK={}}) {
  const T2 = Object.assign({}, T, DK);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const PREP_SCENES = ["presence","clarity","structure","voice","brand"];
  if (done) {
    return (
      <div 
style={{background:T2.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
        <div style={{textAlign:"center",maxWidth:300}}>
          <div 
style={{fontFamily:T.serif,fontSize:52,marginBottom:18,color:T.text}}>done</div>
          <h2 
style={{fontFamily:T.serif,fontSize:28,fontWeight:700,color:T2.text,marginBottom:12}}>You're 
ready.</h2>
          <p 
style={{fontSize:15,color:T2.text3,lineHeight:1.65,marginBottom:36}}>Slow 
down. Take up space. Speak with intention.</p>
          <button onClick={onBack} style={{padding:"14px 32px",borderRadius:12,border:"1px solid "+T2.border,background:"transparent",color:T2.text,fontSize:15,fontWeight:600,cursor:"pointer"}}>Back 
to Toolkit</button>
        </div>
      </div>
    );
  }
  const s = QUICK_PREP[step];
  return (
    <div style={{background:T2.bg,minHeight:"100vh"}}>
      <div style={{position:"relative",height:200}}>
        <Scene name={PREP_SCENES[step]} height={200}/>
        <button onClick={onBack} 
style={{position:"absolute",top:52,left:20,width:36,height:36,borderRadius:18,border:"none",background:"rgba(0,0,0,0.35)",color:"white",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>Back</button>
        <div style={{position:"absolute",bottom:18,left:24,right:24}}>
          <div 
style={{fontSize:10,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Quick 
Prep — Step {step+1} of {QUICK_PREP.length}</div>
          <div style={{display:"flex",gap:5}}>
            {QUICK_PREP.map((_,i) => <div key={i} 
style={{flex:1,height:2,borderRadius:1,background:i<=step?"white":"rgba(255,255,255,0.3)"}}/>)}
          </div>
        </div>
      </div>
      <div style={{padding:"26px 24px 0",display:"flex",flexDirection:"column",gap:16}}>
        <h2 
style={{fontFamily:T.serif,fontSize:28,fontWeight:700,color:T2.text,letterSpacing:"-0.4px"}}>{s.title}</h2>
        <p 
style={{fontSize:15,color:T2.text2,lineHeight:1.65}}>{s.desc}</p>
        <Timer totalSecs={s.secs} label={s.secs+" seconds"}/>
        <button 
onClick={()=>step<QUICK_PREP.length-1?setStep(step+1):setDone(true)} 
style={{width:"100%",padding:"16px",borderRadius:12,border:"none",background:T.navy,color:"white",fontSize:15,fontWeight:700,cursor:"pointer"}}>
          {step<QUICK_PREP.length-1?"Next":"Done"}
        </button>
      </div>
    </div>
  );
}

// ─── ROOT 
