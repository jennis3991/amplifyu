import { useState, useEffect } from 'react';
import { T } from '../theme.js';
import { FURTHER_READING, PHRASES, SAY_THIS, QUICK_PREP, DAILY_INSIGHTS, POWER_PHRASES } from '../data.js';
import { Scene } from '../scenes.jsx';

export function ToolkitScreen({onQuickPrep, dark=false, DK={}, isDesktop=false}) {
  const T2 = Object.assign({}, T, DK);
  const [tab, setTab] = useState("sayThis");
  useEffect(() => {
    try {
      const pending = localStorage.getItem("au1_open_toolkit_tab");
      if (pending) { setTab(pending); localStorage.removeItem("au1_open_toolkit_tab"); }
    } catch(_) {}
  }, []);
  const [openCat, setOpenCat] = useState(0);
  const [copied, setCopied] = useState(null);
  const [openMod, setOpenMod] = useState(null);
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("au1_saved_phrases") || 
"[]"); } catch { return []; }
  });
  function copy(p) { try{navigator.clipboard?.writeText(p);}catch{} 
setCopied(p); setTimeout(()=>setCopied(null),2000); }
  function toggleSave(p) {
    const next = saved.includes(p) ? saved.filter(x=>x!==p) : [...saved, 
p];
    setSaved(next);
    try { localStorage.setItem("au1_saved_phrases", JSON.stringify(next)); 
} catch {}
  }
  const toolkitTabs = [["story","My Story"],["sayThis","Say This Instead"],["phrases","Phrases"],["saved","♥ Saved"+(saved.length>0?" ("+saved.length+")":"")],["reading","Reading List"],["prep","Quick Prep"]];
  return (
    <div style={{background:T2.bg,minHeight:"100vh"}}>
      {!isDesktop && (<div style={{position:"relative",height:160}}>
        <Scene name="brand" height={160}/>
        <div style={{position:"absolute",bottom:16,left:24}}>
          <h1 style={{fontFamily:T.serif,fontSize:28,fontWeight:700,color:"white",letterSpacing:"-0.5px"}}>Toolkit</h1>
        </div>
      </div>)}
      {isDesktop && (
        <div style={{borderBottom:"1px solid "+T2.border}}>
          <div style={{maxWidth:1160,margin:"0 auto",padding:"52px 88px 0"}}>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:32}}>
              <div>
                <div style={{fontSize:10,letterSpacing:"4px",textTransform:"uppercase",color:T.gold,fontFamily:T.sans,marginBottom:14}}>Resources</div>
                <h1 style={{fontFamily:T.serif,fontSize:52,fontWeight:500,color:T2.text,letterSpacing:"-2px",lineHeight:1,margin:"0 0 8px"}}>Toolkit</h1>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text2,fontWeight:300,margin:0}}>Your communication resources</p>
              </div>
            </div>
            <div style={{display:"flex",gap:4,marginBottom:0}}>
              {toolkitTabs.map(([id,label]) => (
                <button key={id} onClick={()=>setTab(id)} style={{padding:"9px 18px",border:"none",background:"transparent",fontSize:13,fontWeight:tab===id?600:400,color:tab===id?T2.text:T2.text3,cursor:"pointer",borderBottom:tab===id?"2px solid "+T.gold:"2px solid transparent",marginBottom:"-1px"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {!isDesktop && (<div style={{padding:"16px 20px 0",display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none"}}>
        {toolkitTabs.map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid "+(tab===id?(id==="saved"?T.gold:id==="story"?T.gold:T.navy):T2.border),background:tab===id?(id==="saved"?"rgba(138,158,132,0.12)":id==="story"?"rgba(138,158,132,0.12)":T.navy):"transparent",color:tab===id?(id==="saved"||id==="story"?T.gold:"white"):T2.text3,fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{label}</button>
        ))}
      </div>)}
      <div style={isDesktop?{maxWidth:1160,margin:"0 auto",padding:"24px 48px 60px"}:{}}>
      {tab==="story" && (
        <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:0}}>
          {/* Header card */}
          <div style={{background:T.cardDark,borderRadius:2,padding:"22px 24px",marginBottom:16,position:"relative",overflow:"hidden"}}>
            <div 
style={{position:"absolute",top:-10,right:10,fontSize:90,lineHeight:1,color:"rgba(255,255,255,0.04)",fontFamily:T.serif}}>"</div>
            <div 
style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>The 
story behind AmplifyU</div>
            <h2 
style={{fontFamily:T.serif,fontSize:20,fontWeight:700,color:"white",lineHeight:1.25,marginBottom:0}}>Built 
in the margins.<br/>For everyone in the margins.</h2>
          </div>
          {/* Story body */}
          <div 
style={{display:"flex",flexDirection:"column",gap:14,paddingBottom:40}}>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              Eight months ago, I returned from maternity leave. Two small 
children at home, a career that mattered to me, and a hard new reality: I 
could no longer afford to be anything less than precise. Every meeting, 
every conversation had to <strong>earn its place.</strong>
            </p>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              I quickly realised that my ability to communicate clearly — 
to structure my thinking under pressure, to tell stories that landed, to 
be visible to the right people — was the single highest-leverage skill I 
could develop. Not just for my career, but for the whole shape of my life. 
When I communicate well, I work faster, influence more, and come home with 
something left to give.
            </p>
            {/* Pull quote */}
            <div 
style={{background:dark?T2.surface:T.goldLight,borderRadius:2,borderLeft:`3px 
solid ${T.gold}`,padding:"16px 18px"}}>
              <p 
style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:dark?"rgba(255,255,255,0.85)":T.goldDark,lineHeight:1.65,margin:0}}>
                "Communication is the skill that multiplies everything 
else. And it can be built — deliberately, in fifteen minutes a day."
              </p>
            </div>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              I had always been good at storytelling. I understood the 
power of a well-placed narrative — how it changes the energy in a room, 
how it makes people lean in. I had strong instincts for communication and 
had built real credibility over my career. But coming back from leave, I 
wanted more than instinct. I wanted a <strong>system.</strong> Something I 
could call on when tired, when stretched, when operating across two very 
full worlds simultaneously.
            </p>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              I built AmplifyU because the tools I needed didn't exist. 
Something science-backed, practically structured, and designed for a real 
professional life — not a retreat, not a course, not a workshop. <strong>A 
daily platform that fits inside the life you already have.</strong>
            </p>
            {/* PIE section */}
            <div 
style={{background:dark?T2.surface:T2.card,borderRadius:2,padding:"18px 20px"}}>
              <div 
style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:10}}>The 
PIE Framework</div>
              <p 
style={{fontSize:14,color:T2.text,lineHeight:1.7,marginBottom:12}}>
                Research shows performance accounts for only <strong>10% 
of career advancement.</strong> The remaining 90% is Image and Exposure — 
how you show up and who sees you doing it.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                
{[{l:"P",t:"Performance",sub:"10%"},{l:"I",t:"Image",sub:"30%"},{l:"E",t:"Exposure",sub:"60%"}].map(p=>(
                  <div key={p.l} 
style={{background:T.navy,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                    <div 
style={{fontFamily:T.serif,fontSize:22,fontWeight:700,color:T.gold,lineHeight:1,marginBottom:2}}>{p.l}</div>
                    <div 
style={{fontSize:9,fontWeight:700,color:"white",marginBottom:1}}>{p.t}</div>
                    <div 
style={{fontSize:9,color:"rgba(255,255,255,0.45)"}}>{p.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              AmplifyU is built around all three — because isolated 
communication skills are not enough. What transforms a career is 
understanding how everything works together, and having a daily practice 
that makes it automatic.
            </p>
            {/* Pull quote 2 */}
            <div 
style={{background:dark?T2.surface:T.goldLight,borderRadius:2,borderLeft:`3px 
solid ${T.gold}`,padding:"16px 18px"}}>
              <p 
style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:dark?"rgba(255,255,255,0.85)":T.goldDark,lineHeight:1.65,margin:0}}>
                "When you communicate well, you work faster, influence 
more, and come home with something left to give."
              </p>
            </div>
            <p style={{fontSize:14,color:T2.text,lineHeight:1.75}}>
              This platform was built in the margins of a full life. It is 
designed to be used in exactly the same way. Because the professionals who 
need these tools the most are also the ones with the least time to waste — 
and the most to gain.
            </p>
            {/* Sign-off */}
            <div style={{paddingTop:8}}>
              <div 
style={{height:1,background:`linear-gradient(90deg,${T.gold},rgba(138,158,132,0.1))`,marginBottom:16}}/>
              <p 
style={{fontFamily:T.serif,fontSize:16,fontWeight:700,color:T2.text,lineHeight:1.5,margin:0}}>
                Amplify your voice. Lead with confidence. Thrive — at work 
and at home.{" "}
                <span style={{color:T.gold}}>AmplifyU.</span>
              </p>
            </div>
          </div>
        </div>
      )}
      {tab==="sayThis" && (
        <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:T2.cardDark,borderRadius:2,padding:"22px 24px"}}>
            <h2 
style={{fontFamily:T.serif,fontSize:22,fontWeight:700,color:"white",marginBottom:8}}>Upgrade 
Your Language</h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>Replace 
weak phrases with ones that command authority.</p>
          </div>
          {SAY_THIS.map((item,i) => (
            <div key={i} 
style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
              <div 
style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>{item.ctx}</div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <span style={{fontSize:14,flexShrink:0}}>X</span>
                <p 
style={{margin:0,fontSize:14,color:T.red,textDecoration:"line-through",opacity:0.8}}>{item.bad}</p>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:14,flexShrink:0}}>OK</span>
                <p 
style={{margin:0,flex:1,fontSize:14,color:T2.green,fontWeight:600,fontStyle:"italic"}}>{item.good}</p>
                <button onClick={()=>copy(item.good)} style={{padding:"5px 12px",borderRadius:8,border:"1px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:11,cursor:"pointer"}}>{copied===item.good?"OK":"Copy"}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="phrases" && (
        <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:8}}>
          {PHRASES.map((cat,i) => (
            <div key={cat.cat} 
style={{background:T2.surface,borderRadius:2,overflow:"hidden",border:"1px solid "+T2.border}}>
              <button onClick={()=>setOpenCat(openCat===i?-1:i)} 
style={{width:"100%",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",border:"none",background:"transparent",cursor:"pointer"}}>
                <span 
style={{fontSize:15,fontWeight:600,color:T.text}}>{cat.cat}</span>
                <span 
style={{color:T2.text3,display:"inline-block",transform:openCat===i?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</span>
              </button>
              {openCat===i && (
                <div style={{borderTop:"1px solid "+T2.divider}}>
                  {cat.phrases.map((p,pi) => (
                    <div key={pi} style={{padding:"11px 18px",display:"flex",alignItems:"center",gap:10,borderBottom:pi<cat.phrases.length-1?"1px solid "+T2.divider:"none"}}>
                      <div 
style={{width:2,height:2,background:T.gold,flexShrink:0}}/>
                      <p 
style={{margin:0,flex:1,fontSize:14,color:T2.text2,fontStyle:"italic"}}>{p}</p>
                      <button onClick={()=>copy(p)} style={{padding:"4px 10px",borderRadius:8,border:"1px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:11,cursor:"pointer"}}>{copied===p?"OK":"Copy"}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {tab==="saved" && (
        <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:12}}>
          {saved.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:32,marginBottom:12}}>♥</div>
              <div 
style={{fontFamily:T.serif,fontSize:18,fontWeight:700,color:T2.text,marginBottom:8}}>No 
saved phrases yet</div>
              <p style={{fontSize:13,color:T2.text3,lineHeight:1.6}}>Tap 
the ♥ on any phrase in the Phrases tab to save it here for quick 
access.</p>
            </div>
          ) : (
            <>
              <div 
style={{background:T.cardDark,borderRadius:2,padding:"16px 18px"}}>
                <div 
style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Your 
phrase collection</div>
                <p 
style={{fontSize:12,color:"rgba(255,255,255,0.45)",margin:0}}>{saved.length} 
phrase{saved.length!==1?"s":""} saved — tap to copy, ♥ to remove</p>
              </div>
              {saved.map((p,i) => (
                <div key={i} 
style={{background:T2.surface,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,border:"1px solid "+T2.border}}>
                  <div 
style={{width:2,alignSelf:"stretch",background:T.gold,flexShrink:0,borderRadius:1}}/>
                  <p 
style={{margin:0,flex:1,fontSize:14,color:T2.text,fontStyle:"italic",lineHeight:1.5}}>{p}</p>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button onClick={()=>copy(p)} style={{padding:"5px 10px",borderRadius:8,border:"1px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:11,cursor:"pointer"}}>{copied===p?"✓":"Copy"}</button>
                    <button onClick={()=>toggleSave(p)} 
style={{padding:"5px 10px",borderRadius:8,border:"1px solid rgba(138,158,132,0.3)",background:"rgba(138,158,132,0.08)",color:T.gold,fontSize:12,cursor:"pointer"}}>♥</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
      {tab==="reading" && (
        <div style={isDesktop ? {padding:"32px 0"} : {padding:"16px 20px 0"}}>
          {(() => {
            const MODULE_TITLES = ["Speak Clearly","Voice Control","Eliminate Fillers","Short Sentences","PRE Structure","Storytelling","PIE Framework","Executive Presence","Influence","Difficult Conversations","Personal Brand","Networking","Leadership Voice","High Stakes Moments"];
            return (
              <>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,fontWeight:300,marginBottom:isDesktop?28:20}}>28 books across 14 modules</p>
                <div style={{display:"flex",flexDirection:"column",gap:isDesktop?2:8}}>
                  {FURTHER_READING.map((mod, mi) => {
                    const isOpen = openMod === mi;
                    return (
                      <div key={mi} style={{border:"0.5px solid "+T2.border,borderRadius:4,overflow:"hidden",background:isOpen?T2.bg:T2.surface}}>
                        <button onClick={() => setOpenMod(isOpen ? null : mi)} style={{
                          width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
                          padding:isDesktop?"18px 24px":"14px 18px",
                          border:"none",background:"transparent",cursor:"pointer",textAlign:"left",
                        }}>
                          <div style={{display:"flex",alignItems:"center",gap:14}}>
                            <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4,fontWeight:500,width:24,flexShrink:0}}>{"0"+(mi+1)}</span>
                            <span style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,letterSpacing:"-0.2px"}}>{MODULE_TITLES[mi]}</span>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s ease",flexShrink:0}}>
                            <path d="M3 5l4 4 4-4" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {isOpen && (
                          <div style={{borderTop:"0.5px solid "+T2.border,padding:isDesktop?"24px 24px 28px":"16px 18px 20px",display:"flex",flexDirection:"column",gap:16}}>
                            {mod.books.map((book, bi) => (
                              <div key={bi} style={{paddingBottom:bi<mod.books.length-1?16:0,borderBottom:bi<mod.books.length-1?"0.5px solid "+T2.divider:"none"}}>
                                <p style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T2.text,letterSpacing:"-0.2px",marginBottom:2}}>{book.title}</p>
                                <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,marginBottom:10}}>{book.author}</p>
                                <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T.goldDark,lineHeight:1.5,marginBottom:10}}>{book.connection}</p>
                                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text2,lineHeight:1.7,fontWeight:300,marginBottom:14}}>{book.summary}</p>
                                <a href={book.amazon} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",background:T2.ink,color:T2.bg,borderRadius:3,fontSize:12,fontFamily:T.sans,fontWeight:500,letterSpacing:"0.02em",textDecoration:"none"}}>Get the book →</a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {tab==="prep" && (
        <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:T2.navyLight,border:"1px solid "+T.accentMd,borderRadius:16,padding:"14px 16px"}}>
            <div
style={{fontSize:14,fontWeight:700,color:T.accent,marginBottom:3}}>Pre-Meeting
Ritual</div>
            <div style={{fontSize:13,color:T.accent,opacity:0.8}}>2 
minutes before any important conversation</div>
          </div>
          {QUICK_PREP.map((s,i) => (
            <div key={s.num}>
              <div 
style={{background:T2.surface,borderRadius:2,padding:"14px 18px",display:"flex",alignItems:"flex-start",gap:14}}>
                <div 
style={{width:28,height:28,borderRadius:0,background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span 
style={{fontSize:11,fontWeight:800,color:"white"}}>{s.num}</span>
                </div>
                <div style={{flex:1}}>
                  <div 
style={{fontSize:14,fontWeight:700,color:T2.text,marginBottom:3}}>{s.title}</div>
                  <div 
style={{fontSize:13,color:T2.text3,lineHeight:1.5}}>{s.desc}</div>
                </div>
                <div 
style={{background:T2.card,borderRadius:8,padding:"4px 10px"}}>
                  <div 
style={{fontSize:11,fontWeight:700,color:T2.text2,fontFamily:"monospace"}}>{s.secs}s</div>
                </div>
              </div>
              {i<QUICK_PREP.length-1 && <div 
style={{width:1,height:6,background:T.border,margin:"0 auto"}}/>}
            </div>
          ))}
          <button onClick={onQuickPrep}
style={{width:"100%",padding:"15px",borderRadius:isDesktop?8:0,border:"none",background:T.navy,color:"white",fontSize:15,fontWeight:700,cursor:"pointer"}}>Start
Quick Prep</button>
        </div>
      )}
      </div>
    </div>
  );
}

// ─── QUICK PREP FLOW 
