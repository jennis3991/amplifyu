import { useState } from 'react';

// ─── D13 Practice Widget ───────────────────────────────────────────────────
export function D13PracticeWidget({T, T2, isDesktop}) {
  const [tab, setTab] = useState(0);
  const [people, setPeople] = useState(Array(5).fill(''));
  const [ambition, setAmbition] = useState('');
  const [ambitionRefined, setAmbitionRefined] = useState('');
  const [scores, setScores] = useState({});
  const [reconnect, setReconnect] = useState(Array(3).fill({name:'',value:''}));
  const [phase, setPhase] = useState('intro');

  const tabs = ["Opportunity Map","Ambition Statement","Visibility Audit","Relationship Builder"];
  const cs = {
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
  };

  const AUDIT_DIMS = ["Internal visibility","Industry visibility","Network strength","Senior stakeholder relationships"];

  if (phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Mission</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T.gold,lineHeight:1.25,margin:"0 0 14px"}}>Make your value impossible to ignore.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {["Map the five people who could most influence your future.","Write your ambition in one clear, confident sentence.","Audit where your visibility is strong — and where it's weak.","Identify three relationships worth rebuilding this month."].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:3}}>✦</span>
              <span style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.45}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>The Challenge Journey</div>
        <div style={{display:"flex",alignItems:"flex-start"}}>
          {[{n:1,label:"Opportunity Map"},{n:2,label:"Ambition Statement"},{n:3,label:"Visibility Audit"},{n:4,label:"Relationship Builder"}].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?46:40,height:isDesktop?46:40,borderRadius:"50%",border:`1.5px solid ${i===0?T.gold:"rgba(138,158,132,0.35)"}`,background:i===0?"rgba(138,158,132,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:6}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?15:14,fontWeight:600,color:i===0?T.gold:"rgba(138,158,132,0.5)"}}>{r.n}</span>
                </div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?12:10,fontWeight:500,color:"#A8998A",textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?80:60}}>{r.label}</div>
              </div>
              {i<3 && <div style={{height:1,width:isDesktop?10:6,background:"rgba(138,158,132,0.25)",flexShrink:0,marginBottom:26}}/>}
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=>setPhase('challenge')} style={cs.cta}>Begin the Challenge →</button>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {tabs.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{padding:"8px 14px",borderRadius:3,border:`0.5px solid ${tab===i?T.gold:T2.border}`,background:tab===i?"rgba(138,158,132,0.1)":"transparent",color:tab===i?T.gold:T2.text3,fontSize:12,fontWeight:tab===i?600:400,cursor:"pointer",fontFamily:T.sans,transition:"all 0.15s",minHeight:36}}>{t}</button>
        ))}
      </div>

      {tab===0 && (
        <div style={cs.card}>
          <div style={cs.label}>Opportunity Mapping</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,marginBottom:16}}>List five people who could significantly influence your future. For each, consider: do they know what you're good at? Do they know what you want next? Do they know how to help you?</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {people.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:p?T.gold:"rgba(138,158,132,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>
                  <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:"white"}}>{i+1}</span>
                </div>
                <input value={p} onChange={e=>{const n=[...people];n[i]=e.target.value;setPeople(n);}} placeholder={`Person ${i+1} — name or role`} className="au-input" style={{flex:1,padding:"10px 14px",fontSize:isDesktop?14:13}}/>
              </div>
            ))}
          </div>
          {people.filter(p=>p.trim()).length>=3 && (
            <div style={{marginTop:16,padding:"14px 16px",background:"rgba(138,158,132,0.07)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:"italic",color:T2.text,margin:0,lineHeight:1.6}}>Now ask yourself honestly: does each of these people know where you're going — not just what you do today?</p>
            </div>
          )}
        </div>
      )}

      {tab===1 && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={cs.card}>
            <div style={cs.label}>The Ambition Statement</div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,marginBottom:14}}>Complete this sentence — then refine it until you'd say it out loud in front of a senior leader without hesitation.</p>
            <div style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,marginBottom:10,fontWeight:500}}>Over the next three years, I want to become…</div>
            <textarea value={ambition} onChange={e=>setAmbition(e.target.value)} placeholder="Write freely first. Don't edit yourself yet." style={{width:"100%",minHeight:isDesktop?80:70,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
          </div>
          {ambition.trim().length>10 && (
            <div style={cs.card}>
              <div style={cs.label}>Refine it</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,marginBottom:12}}>Now rewrite it in one clear, confident sentence. Then say it aloud three times.</p>
              <textarea value={ambitionRefined} onChange={e=>setAmbitionRefined(e.target.value)} placeholder="One sentence. Clear. Confident. Specific." style={{width:"100%",minHeight:isDesktop?60:55,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.serif,fontSize:isDesktop?16:15,color:T.gold,resize:"none",outline:"none",lineHeight:1.5,boxSizing:"border-box"}}/>
              {ambitionRefined.trim().length>5 && (
                <div style={{marginTop:12,padding:"12px 14px",background:"rgba(138,158,132,0.07)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0,lineHeight:1.6}}>Say it aloud. Own it. This is the sentence that opens doors — but only if you say it.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab===2 && (
        <div style={cs.card}>
          <div style={cs.label}>Visibility Audit</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,marginBottom:16}}>Score yourself honestly from 1–10 across each dimension. Where is your biggest gap?</p>
          {AUDIT_DIMS.map((dim,i)=>{
            const val = scores[dim]||0;
            return (
              <div key={i} style={{paddingBottom:i<AUDIT_DIMS.length-1?16:0,marginBottom:i<AUDIT_DIMS.length-1?16:0,borderBottom:i<AUDIT_DIMS.length-1?"0.5px solid "+T2.divider:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,fontWeight:500}}>{dim}</span>
                  <span style={{fontFamily:T.serif,fontSize:isDesktop?16:15,fontWeight:700,color:val>=7?T.gold:val>=5?"#7A9E84":T2.text3}}>{val}/10</span>
                </div>
                <input type="range" min="1" max="10" value={val||1} onChange={e=>setScores({...scores,[dim]:+e.target.value})}
                  style={{width:"100%",accentColor:T.gold,cursor:"pointer"}}/>
              </div>
            );
          })}
          {Object.keys(scores).length>=2 && (
            <div style={{marginTop:16,padding:"12px 14px",background:"rgba(138,158,132,0.07)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:"italic",color:T2.text,margin:0,lineHeight:1.6}}>
                {Object.keys(scores).length===4
                  ? `Your lowest area is ${Object.entries(scores).sort(([,a],[,b])=>a-b)[0][0].toLowerCase()}. That's where your next opportunity lives.`
                  : "Rate all four to see your biggest opportunity."}
              </p>
            </div>
          )}
        </div>
      )}

      {tab===3 && (
        <div style={cs.card}>
          <div style={cs.label}>Relationship Builder</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,marginBottom:16}}>Identify three people you should reconnect with this month. For each, think about what value you can provide them first — before asking for anything.</p>
          {reconnect.map((r,i)=>(
            <div key={i} style={{paddingBottom:i<2?16:0,marginBottom:i<2?16:0,borderBottom:i<2?"0.5px solid "+T2.divider:"none"}}>
              <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Person {i+1}</div>
              <input value={r.name} onChange={e=>{const n=[...reconnect];n[i]={...n[i],name:e.target.value};setReconnect(n);}} placeholder="Name or role" className="au-input" style={{width:"100%",padding:"9px 12px",fontSize:isDesktop?14:13,marginBottom:8,boxSizing:"border-box"}}/>
              <input value={r.value} onChange={e=>{const n=[...reconnect];n[i]={...n[i],value:e.target.value};setReconnect(n);}} placeholder="What value can you provide them first?" className="au-input" style={{width:"100%",padding:"9px 12px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
            </div>
          ))}
          {reconnect.filter(r=>r.name.trim()).length>=2 && (
            <div style={{marginTop:16,padding:"12px 14px",background:"rgba(138,158,132,0.07)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:"italic",color:T2.text,margin:0,lineHeight:1.6}}>Give before you ask. The best relationships are built through generosity, not need.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── D13 Simulation Widget — The Promotion Room ───────────────────────────
export function D13SimWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('intro');
  const [role, setRole] = useState('');
  const [strengths, setStrengths] = useState(['','','']);
  const [knownFor, setKnownFor] = useState('');
  const [wantKnown, setWantKnown] = useState('');
  const [results, setResults] = useState(null);

  const reset = ()=>{ setPhase('intro'); setRole(''); setStrengths(['','','']); setKnownFor(''); setWantKnown(''); setResults(null); };

  const cs = {
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
    cta:(d)=>({width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:d?"rgba(44,36,22,0.25)":T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:d?"not-allowed":"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"}),
  };

  const runSim = () => {
    const s = strengths.filter(s=>s.trim());
    const gap = !wantKnown.trim() || wantKnown.trim()===knownFor.trim();
    setResults({
      todaySays: [
        `"${knownFor.trim()||"Reliable and hardworking."}"`,
        `"Strong ${s[0]||"performer"}."`,
        `"Not entirely sure what they want next."`,
      ],
      gaps: [
        gap ? "Desired brand not yet clearly differentiated from current perception." : `Gap between current reputation ("${knownFor.trim()}") and desired brand ("${wantKnown.trim()}").`,
        "Senior stakeholder awareness of ambition may be limited.",
        "Strengths visible — but direction may not be clearly communicated.",
      ],
      strategy: [
        `Book a conversation with your line manager to share your goal: "${wantKnown.trim()||role+' leadership'}."`,
        `Identify one senior stakeholder who doesn't know about your ${s[0]||"strengths"} — create a reason to show them.`,
        "At your next visible moment, make your direction part of the conversation — not just your deliverables.",
        "Find one person in your target area and offer to help with something before asking for anything.",
      ],
      advocate: gap
        ? "If a promotion discussion happened tomorrow — who would argue for you, and what would they say?"
        : `If a promotion discussion happened tomorrow, would they say: "${wantKnown.trim()}"?`,
    });
    setPhase('results');
  };

  if (phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>The Promotion Room</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 12px"}}>You are not in the room. Senior leaders are deciding who moves forward.</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.65,margin:0}}>What are they saying about you? What are the gaps? And what should you do next? Your AmplifyU coach analyses your current exposure and builds your strategy.</p>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>What the simulation does</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {["Reveals what leaders might be saying about you right now","Identifies your exposure gaps","Generates a personalised visibility strategy","Closes with the most important question in your career"].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:2}}>✦</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=>setPhase('form')} style={cs.cta(false)}>Enter the Room →</button>
    </div>
  );

  if (phase==='form') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Profile</div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Role you're aiming for</div>
            <input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Head of Strategy, Partner, Senior Director" className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Your three greatest strengths</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {strengths.map((s,i)=>(
                <input key={i} value={s} onChange={e=>{const n=[...strengths];n[i]=e.target.value;setStrengths(n);}} placeholder={["e.g. Strategic thinking","e.g. Leading teams","e.g. Stakeholder influence"][i]} className="au-input" style={{flex:"1 1 100px",padding:"9px 12px",fontSize:isDesktop?13:12}}/>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>What are you known for today?</div>
            <input value={knownFor} onChange={e=>setKnownFor(e.target.value)} placeholder="e.g. Reliable delivery, technical expertise" className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>What do you want to be known for?</div>
            <input value={wantKnown} onChange={e=>setWantKnown(e.target.value)} placeholder="e.g. Strategic leadership, building high-performing teams" className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
          </div>
        </div>
      </div>
      <button onClick={runSim} disabled={!role.trim()||!knownFor.trim()} style={cs.cta(!role.trim()||!knownFor.trim())}>Run the Simulation →</button>
      <button onClick={reset} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
    </div>
  );

  if (phase==='results' && results) return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>What Leaders Might Say Today</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {results.todaySays.map((s,i)=>(
            <p key={i} style={{fontFamily:T.serif,fontSize:isDesktop?16:15,fontStyle:"italic",color:i===2?T2.text3:T2.text,lineHeight:1.5,margin:0}}>{s}</p>
          ))}
        </div>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>Exposure Gaps</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {results.gaps.map((g,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontFamily:T.sans,fontSize:13,color:"rgba(180,80,60,0.8)",flexShrink:0,marginTop:2}}>×</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{g}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={cs.card}>
        <div style={cs.label}>Your Exposure Strategy</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {results.strategy.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:22,height:22,borderRadius:"50%",border:"1px solid rgba(138,158,132,0.4)",background:"rgba(138,158,132,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold}}>{i+1}</span>
              </div>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.6}}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{...cs.card,background:"rgba(138,158,132,0.06)",borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>The Only Question That Matters</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,lineHeight:1.5,margin:"0 0 12px"}}>{results.advocate}</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:0}}>If you can't name them easily — that's the work. Not the skill. The visibility.</p>
      </div>

      <button onClick={reset} style={{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48}}>Run Again →</button>
    </div>
  );

  return null;
}
