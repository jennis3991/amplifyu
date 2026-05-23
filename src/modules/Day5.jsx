import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';

export function D5PracticeWidget({T, T2, isDesktop}) {
  const D5_EXAMPLES=[
    {q:"Where should we go for dinner tonight?",point:"Let's go to the Italian place.",reason:"It's relaxed, consistently good, and everyone will find something they like.",example:"Last time the food came quickly and everyone enjoyed it."},
    {q:"Where should we go this summer?",point:"We should go to the South of France.",reason:"It has great weather, food, and is easy for a short trip.",example:"Friends went recently and said Monaco was brilliant."},
    {q:"Is working from home better?",point:"I think hybrid works best.",reason:"It gives flexibility without losing collaboration.",example:"When I'm home I focus better, but office days are better for brainstorming."},
    {q:"What should we watch tonight?",point:"Let's watch a comedy.",reason:"We've both had a long week and something light will be more enjoyable.",example:"Like when we watched Mrs Doubtfire — it was easy and fun."},
  ];
  const D5_BANK=["Best book you've read recently?","Why is sleep important?","Convince me to try coffee.","What makes a good leader?","Should children have smartphones?","What's the best productivity habit?","Why should I visit London?","Why is storytelling powerful?","Why should someone hire you?"];
  const [exCard, setExCard] = useState(null);
  const [challenge, setChallenge] = useState({started:false,idx:0,count:0,time:90,scenarios:null});
  const timerRef = useRef(null);
  useEffect(()=>{
    if(!challenge.started){ clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(()=>{
      setChallenge(c=>c.time<=1?{...c,time:0,started:false}:{...c,time:c.time-1});
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[challenge.started]);

  const startChallenge=()=>{
    const shuffled=[...D5_BANK].sort(()=>Math.random()-0.5);
    setChallenge({started:true,idx:0,count:0,time:90,scenarios:shuffled});
  };
  const nextScenario=()=>setChallenge(c=>({...c,idx:(c.idx+1)%c.scenarios.length,count:c.count+1}));

  if(isDesktop) return (
    <>
      <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,marginBottom:20}}>PRE Examples</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:40}}>
        {D5_EXAMPLES.map((ex,i)=>(
          <div key={i} onClick={()=>setExCard(exCard===i?null:i)}
            style={{background:T2.surface,borderRadius:4,border:`0.5px solid ${exCard===i?T.gold:T2.border}`,padding:"20px",cursor:"pointer",transition:"border-color 0.2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:exCard===i?16:0}}>
              <p style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T2.text,margin:0,lineHeight:1.3,flex:1}}>{ex.q}</p>
              <span style={{fontFamily:T.sans,fontSize:12,color:exCard===i?T.gold:T2.text4,marginLeft:12,flexShrink:0}}>{exCard===i?"▴":"▸"}</span>
            </div>
            {exCard===i&&(
              <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14}}>
                {[{l:"Point",t:ex.point},{l:"Reason",t:ex.reason},{l:"Example",t:ex.example}].map((b,j)=>(
                  <div key={j} style={{marginBottom:j<2?10:0}}>
                    <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginRight:8}}>{b.l}</span>
                    <span style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.6}}>{b.t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{background:T2.surface,borderRadius:8,padding:"28px 32px",border:"0.5px solid "+T2.border}}>
        <div style={{fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8,fontFamily:T.sans}}>PRE Speed Challenge</div>
        <div style={{fontFamily:T.sans,fontSize:15,color:T2.text3,lineHeight:1.9,marginBottom:24,maxWidth:480}}>
          <div>90 seconds. For each question, say out loud:</div>
          <div style={{paddingLeft:16,marginTop:4}}>
            <div><span style={{color:T.gold,fontWeight:600}}>Point</span></div>
            <div><span style={{color:T.gold,fontWeight:600}}>Reason</span></div>
            <div><span style={{color:T.gold,fontWeight:600}}>Example</span></div>
          </div>
          <div style={{marginTop:4}}>Then hit Next.</div>
        </div>
        {!challenge.started&&challenge.time>0?(
          <button onClick={startChallenge} style={{padding:"13px 32px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans}}>Start Challenge →</button>
        ):challenge.time===0?(
          <div style={{display:"flex",alignItems:"center",gap:24}}>
            <div>
              <div style={{fontFamily:T.serif,fontSize:48,fontWeight:600,color:T2.text,lineHeight:1}}>{challenge.count}</div>
              <div style={{fontFamily:T.sans,fontSize:13,color:T2.text3,marginTop:4}}>scenarios completed</div>
            </div>
            <button onClick={()=>setChallenge({started:false,idx:0,count:0,time:90,scenarios:null})} style={{padding:"11px 24px",borderRadius:4,border:"1px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans}}>Try Again</button>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"flex-start",gap:24}}>
            <div style={{fontFamily:T.serif,fontSize:48,fontWeight:600,color:challenge.time<=10?"#B05C4A":T.gold,lineHeight:1,flexShrink:0}}>{challenge.time}s</div>
            <div style={{flex:1}}>
              <div style={{background:T2.bg,borderRadius:4,padding:"20px 24px",marginBottom:16,border:"1px solid "+T2.border}}>
                <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,margin:0,lineHeight:1.3}}>{challenge.scenarios[challenge.idx]}</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <button onClick={nextScenario} style={{padding:"12px 28px",borderRadius:4,border:"none",background:T.gold,color:"white",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans}}>Next →</button>
                <span style={{fontFamily:T.sans,fontSize:13,color:T2.text3}}>{challenge.count} done</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Mobile
  return (
    <>
      {D5_EXAMPLES.map((ex,i)=>(
        <div key={i} onClick={()=>setExCard(exCard===i?null:i)}
          style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${exCard===i?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"16px",cursor:"pointer",transition:"border-color 0.2s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,margin:0,lineHeight:1.3}}>{ex.q}</p>
            <span style={{fontFamily:T.sans,fontSize:12,color:exCard===i?T.gold:T2.text3,marginLeft:10,flexShrink:0}}>{exCard===i?"▴":"▸"}</span>
          </div>
          {exCard===i&&(
            <div style={{marginTop:14,paddingTop:14,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
              {[{l:"Point",t:ex.point},{l:"Reason",t:ex.reason},{l:"Example",t:ex.example}].map((b,j)=>(
                <div key={j} style={{marginBottom:j<2?10:0}}>
                  <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginRight:8}}>{b.l}</span>
                  <span style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6}}>{b.t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <div style={{background:T2.surface,borderRadius:8,padding:"18px 20px"}}>
        <div style={{fontSize:10,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontFamily:T.sans}}>PRE Speed Challenge</div>
        <div style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.9,marginBottom:16}}>
          <div>90 seconds. For each question, say out loud:</div>
          <div style={{paddingLeft:12,marginTop:2}}>
            <div><span style={{color:T.gold,fontWeight:600}}>Point</span></div>
            <div><span style={{color:T.gold,fontWeight:600}}>Reason</span></div>
            <div><span style={{color:T.gold,fontWeight:600}}>Example</span></div>
          </div>
          <div style={{marginTop:2}}>Then hit Next.</div>
        </div>
        {!challenge.started&&challenge.time>0?(
          <button onClick={startChallenge} style={{width:"100%",padding:"14px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Start Challenge →</button>
        ):challenge.time===0?(
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,marginBottom:6}}>{challenge.count}</div>
            <div style={{fontFamily:T.sans,fontSize:12,color:T2.text3,marginBottom:16}}>scenarios completed</div>
            <button onClick={()=>setChallenge({started:false,idx:0,count:0,time:90,scenarios:null})} style={{padding:"11px 24px",borderRadius:4,border:"1px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Try Again</button>
          </div>
        ):(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontFamily:T.serif,fontSize:32,fontWeight:600,color:challenge.time<=10?"#B05C4A":T.gold}}>{challenge.time}s</div>
              <div style={{fontFamily:T.sans,fontSize:12,color:T2.text3}}>{challenge.count} done</div>
            </div>
            <div style={{background:T2.bg,borderRadius:6,padding:"16px",marginBottom:14,border:"1px solid "+T2.border}}>
              <p style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T2.text,margin:0,lineHeight:1.3}}>{challenge.scenarios[challenge.idx]}</p>
            </div>
            <button onClick={nextScenario} style={{width:"100%",padding:"14px",borderRadius:4,border:"none",background:T.gold,color:"white",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Next →</button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── D6 Practice Widget ────────────────────────────────────────────────────

