import { useState } from 'react';
import { T } from '../theme.js';
import { POWER_PHRASES } from '../data.js';

export function PhraseStrip({cur}) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pulsed, setPulsed] = useState(false);
  const idx = (cur + Math.floor((Date.now()-new Date(new 
Date().getFullYear(),0,0))/86400000)) % POWER_PHRASES.length;
  const p = POWER_PHRASES[idx];
  // Trigger pulse animation once on mount
  useEffect(() => {
    const t = setTimeout(() => setPulsed(true), 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <style>{`
        @keyframes phraseReveal {
          0%   { opacity:0; transform:translateY(-4px); }
          100% { opacity:1; transform:translateY(0); }
        }
        @keyframes stripPulse {
          0%   { box-shadow: inset 0 0 0 0 rgba(183,154,107,0); }
          40%  { box-shadow: inset 0 0 0 1px rgba(138,158,132,0.35); }
          100% { box-shadow: inset 0 0 0 0 rgba(183,154,107,0); }
        }
      `}</style>
      <div
        onClick={()=>setExpanded(true)}
        style={{
          width:"100%",
          background:"linear-gradient(180deg,#111C2E 0%,#0D1626 100%)",
          borderBottom:"1px solid rgba(138,158,132,0.2)",
          cursor:"pointer",
          paddingTop:44,
          animation: pulsed ? "none" : "stripPulse 1.8s ease 0.4s 1",
        }}>
        {/* Gold top gradient rule */}
        <div style={{height:2,background:"linear-gradient(90deg,"+T.gold+" 0%,rgba(138,158,132,0.15) 100%)"}}/>

        {/* Category label row */}
        <div style={{
          
display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"8px 20px 0",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
              <circle cx="5.5" cy="5.5" r="4.5" stroke={T.gold} 
strokeWidth="1"/>
              <path d="M5.5 3v2.5l1.5 1" stroke={T.gold} strokeWidth="1" 
strokeLinecap="square"/>
            </svg>
            <span style={{
              fontSize:7.5,fontWeight:800,color:T.gold,
              textTransform:"uppercase",letterSpacing:"2.5px",
            }}>Power Phrase</span>
          </div>
          {/* Category badge */}
          <span style={{
            fontSize:7,fontWeight:700,
            color:"rgba(183,154,107,0.7)",
            background:"rgba(138,158,132,0.1)",
            padding:"2px 8px",borderRadius:10,
            textTransform:"uppercase",letterSpacing:"1px",
            border:"1px solid rgba(138,158,132,0.2)",
          }}>{p.category}</span>
        </div>

        {/* Phrase row */}
        <div style={{
          display:"flex",alignItems:"center",
          padding:"6px 20px 12px",
          animation: pulsed ? "none" : "phraseReveal 0.5s ease 0.6s both",
        }}>
          <p style={{
            flex:1,margin:0,
            fontFamily:T.serif,
            fontSize:16,fontWeight:600,
            color:"rgba(255,255,255,0.95)",
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
            letterSpacing:"-0.2px",
          }}>{p.phrase}</p>
          <div style={{
            flexShrink:0,marginLeft:12,
            display:"flex",alignItems:"center",gap:4,
          }}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.28)"}}>Tap 
to explore</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="rgba(255,255,255,0.3)" 
strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
      {expanded && (
        <div 
style={{position:"fixed",inset:0,zIndex:300,background:"rgba(11,13,16,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} 
onClick={()=>setExpanded(false)}>
          <div onClick={e=>e.stopPropagation()} 
style={{width:"100%",maxWidth:430,background:T.navy,borderRadius:"20px 20px 0 0",overflow:"hidden",animation:"slideUp 0.32s cubic-bezier(0.22,1,0.36,1)"}}>
            <div 
style={{height:2,background:"linear-gradient(90deg,"+T.gold+",rgba(138,158,132,0.3))"}}/>
            <div 
style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}><div 
style={{width:36,height:3,borderRadius:2,background:"rgba(255,255,255,0.15)"}}/></div>
            <div style={{padding:"16px 24px 40px",display:"flex",flexDirection:"column",gap:16}}>
              <div 
style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                <div>
                  <div 
style={{fontSize:8,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Power 
Phrase</div>
                  <p 
style={{fontFamily:T.serif,fontSize:26,fontWeight:700,color:"white",lineHeight:1.18,letterSpacing:"-0.4px",margin:0}}>{p.phrase}</p>
                </div>
                <span 
style={{fontSize:9,color:"rgba(255,255,255,0.4)",background:"rgba(255,255,255,0.07)",padding:"4px 10px",borderRadius:20,whiteSpace:"nowrap",flexShrink:0,marginLeft:12,marginTop:4}}>{p.category}</span>
              </div>
              <p 
style={{fontSize:14,color:"rgba(255,255,255,0.65)",lineHeight:1.7,margin:0}}>{p.when}</p>
              <div 
style={{height:1,background:"rgba(255,255,255,0.07)"}}/>
              <div>
                <div 
style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:10}}>In 
action</div>
                <div style={{borderLeft:"2px solid "+T.gold,paddingLeft:14}}>
                  <p 
style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:"rgba(255,255,255,0.85)",lineHeight:1.65,margin:0}}>{p.example}</p>
                </div>
              </div>
              <div>
                <div 
style={{fontSize:9,fontWeight:700,color:"#C47A7A",textTransform:"uppercase",letterSpacing:2,marginBottom:10}}>Not 
this</div>
                <div style={{borderLeft:"2px solid #5C2020",paddingLeft:14}}>
                  <p 
style={{fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.6,margin:0,fontStyle:"italic"}}>{p.avoid}</p>
                </div>
              </div>
              <div style={{display:"flex",gap:8,paddingTop:4}}>
                <button 
onClick={()=>{try{navigator.clipboard?.writeText(p.phrase);}catch{}setSaved(true);setTimeout(()=>setSaved(false),2000);}} 
style={{flex:1,padding:"13px",border:"1px solid "+(saved?T.gold:"rgba(255,255,255,0.14)"),background:saved?"rgba(183,154,107,0.14)":"rgba(255,255,255,0.04)",color:saved?T.gold:"rgba(255,255,255,0.7)",fontSize:11,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",borderRadius:0,cursor:"pointer"}}>
                  {saved?"Copied":"Copy phrase"}
                </button>
                <button onClick={()=>setExpanded(false)} 
style={{padding:"13px 18px",borderRadius:0,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer"}}>X</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

























