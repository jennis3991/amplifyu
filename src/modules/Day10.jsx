import { useState } from 'react';
import { T } from '../theme.js';

// ─── THE LEADERSHIP HOT SEAT — D10 Simulation feedback ───────────────────────
export function D10SimFeedback({input, scenario}) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;
  const rank = wordCount <= 35
    ? { badge:"⚡", label:"Executive Sharp", note:"Under 15 seconds. Ruthlessly clear.", color:"#C9A84C" }
    : wordCount <= 65
    ? { badge:"🎯", label:"Clear Communicator", note:"15–30 seconds. Solid and focused.", color:T.gold }
    : { badge:"⏳", label:"Too much below the iceberg", note:"Over 30 seconds. Tighten it up.", color:"#8A7B66" };

  async function analyse() {
    if (!input.trim()) return;
    setLoading(true);
    const scenarioCtx = scenario ? `Scenario: "${scenario}"\n\n` : "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:`You are an elite executive communication coach. Score this leadership hot seat response.\n\n${scenarioCtx}Response: "${input}"\n\nWord count: ${wordCount}\n\nReturn ONLY valid JSON:\n{\n  "overall":<50-100>,\n  "Clarity":<50-100>,\n  "Confidence":<50-100>,\n  "Brevity":<50-100>,\n  "Ownership":<50-100>,\n  "StratThinking":<50-100>,\n  "Presence":<50-100>,\n  "coaching":"<One specific, editorial coaching sentence — reference the actual words used. Not generic. Think: \'Your strongest point arrived 18 words in\' not \'good job\'>",\n  "coaching2":"<One specific follow-up coaching sentence — a concrete next step or upgrade>"\n}`}]})});
      const d = await res.json();
      const raw = (d.content||[]).map(b=>b.text||"").join("").trim();
      try { const m = raw.match(/\{[\s\S]*\}/); setResult(JSON.parse(m[0])); }
      catch { setResult({overall:75,Clarity:78,Confidence:72,Brevity:70,Ownership:80,StratThinking:74,Presence:71,coaching:"Your contribution was clear. Now make the result the headline — lead with the outcome, then explain how.",coaching2:"Strong ownership language. Next level: one specific number would make this impossible to forget."}); }
    } catch { setResult(null); }
    setLoading(false);
  }

  const DIMS = ["Clarity","Confidence","Brevity","Ownership","StratThinking","Presence"];
  const DIM_LABELS = {Clarity:"Clarity",Confidence:"Confidence",Brevity:"Brevity",Ownership:"Ownership",StratThinking:"Strategic thinking",Presence:"Leadership presence"};

  return (
    <div>
      {/* Word count + rank hint */}
      {input.trim().length > 0 && !result && (
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",background:T.surface,borderRadius:4,border:"0.5px solid "+T.border,marginBottom:12}}>
          <span style={{fontFamily:T.sans,fontSize:13,color:rank.color,fontWeight:600}}>{rank.badge} {rank.label}</span>
          <span style={{fontFamily:T.sans,fontSize:12,color:T.text3}}>{wordCount} words — {rank.note}</span>
        </div>
      )}
      <button onClick={analyse} disabled={loading||!input.trim()} style={{width:"100%",padding:"14px",borderRadius:3,border:"none",background:loading||!input.trim()?"#DDD5C4":T.ink,color:loading||!input.trim()?"#6B5E44":"#F7F3EC",fontSize:14,fontWeight:600,cursor:loading||!input.trim()?"not-allowed":"pointer",fontFamily:T.sans,marginBottom:result?20:0}}>
        {loading?"Coaching in progress…":"Get Coached →"}
      </button>

      {result && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Rank + overall */}
          <div style={{display:"flex",gap:16,alignItems:"stretch"}}>
            <div style={{flex:1,padding:"20px",background:"#0E0B08",borderRadius:6,textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:4}}>{rank.badge}</div>
              <div style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:rank.color,marginBottom:4}}>{rank.label}</div>
              <div style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.5)"}}>{rank.note}</div>
            </div>
            <div style={{padding:"20px",background:"#0E0B08",borderRadius:6,textAlign:"center",minWidth:100}}>
              <div style={{fontFamily:T.serif,fontSize:52,fontWeight:600,color:T.gold,lineHeight:1}}>{result.overall}</div>
              <div style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.4)",marginTop:4}}>/ 100</div>
            </div>
          </div>

          {/* Dimension bars */}
          <div style={{background:T.surface,borderRadius:4,border:"0.5px solid "+T.border,padding:"18px 20px",display:"flex",flexDirection:"column",gap:10}}>
            {DIMS.map(d=>(
              <div key={d}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontFamily:T.sans,fontSize:12,color:T.text,fontWeight:400}}>{DIM_LABELS[d]}</span>
                  <span style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:result[d]>=80?T.gold:T.text3}}>{result[d]}</span>
                </div>
                <div style={{height:3,background:"rgba(44,36,22,0.08)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:result[d]+"%",background:result[d]>=80?T.gold:"rgba(138,158,132,0.45)",borderRadius:2,transition:"width 0.9s ease"}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Premium coaching */}
          <div style={{padding:"20px 22px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"3px solid "+T.gold,display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontSize:9,fontWeight:700,color:T.goldDark,textTransform:"uppercase",letterSpacing:"2px",fontFamily:T.sans}}>Coach feedback</div>
            <p style={{fontFamily:T.serif,fontSize:16,color:T.text,lineHeight:1.65,margin:0}}>{result.coaching}</p>
            {result.coaching2 && <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T.text2,lineHeight:1.6,margin:0}}>{result.coaching2}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SAR Builder — D10 Practice (mobile) ─────────────────────────────────────
export function D10MobileSAR({onComplete}) {
  const [s,setS]=useState(""); const [a,setA]=useState(""); const [r,setR]=useState(""); const [res,setRes]=useState(""); const [l,setL]=useState(false);
  async function go(){if(!s.trim()||!a.trim()||!r.trim())return;setL(true);try{const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:250,messages:[{role:"user",content:`You are an executive communication coach. Sharpen this SAR story into 2-3 crisp, confident sentences. Lead with the result. Return ONLY the sharpened story:\n\nSituation: ${s}\nAction: ${a}\nResult: ${r}`}]})});const d=await resp.json();const txt=(d.content||[]).map(b=>b.text||"").join("").trim();setRes(txt);if(onComplete)onComplete();}catch{setRes("Lead with the result, then explain how you got there.");if(onComplete)onComplete();}setL(false);}
  return(<div><div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>{[["Situation",s,setS,"What was the challenge or context?","#8A9E84"],[" Action",a,setA,"What did YOU specifically do? Use 'I.'","#8A9E84"],["Result",r,setR,"What was the measurable outcome?","#8A9E84"]].map(([lbl,v,sv,ph,col],i)=><div key={i}><div style={{fontSize:10,fontWeight:700,color:col,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5,fontFamily:"'Inter',sans-serif"}}>{lbl}</div><textarea value={v} onChange={e=>sv(e.target.value)} placeholder={ph} style={{width:"100%",borderRadius:4,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:60,boxSizing:"border-box",background:"rgba(247,243,236,0.8)"}}/></div>)}</div><button onClick={go} disabled={l||!s.trim()||!a.trim()||!r.trim()} style={{width:"100%",padding:"12px",borderRadius:3,border:"none",background:l||!s.trim()||!a.trim()||!r.trim()?"#DDD5C4":"#2C2416",color:l||!s.trim()||!a.trim()||!r.trim()?"#6B5E44":"#F7F3EC",fontSize:13,fontWeight:600,cursor:l||!s.trim()||!a.trim()||!r.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:res?12:0}}>{l?"Building your SAR…":"Build My SAR Story →"}</button>{res&&<div style={{padding:"14px 16px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"2px solid #8A9E84"}}><div style={{fontSize:9,fontWeight:700,color:"#527060",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>Your performance statement</div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#2C2416",margin:0,lineHeight:1.65}}>{res}</p></div>}</div>);
}

// ─── Leadership Hot Seat — D10 Simulation (mobile) ───────────────────────────
export function D10MobileSim() {
  const [scenario, setScenario] = useState(null);
  const [v, setV] = useState("");
  const [r, setR] = useState(null);
  const [l, setL] = useState(false);

  const SCENARIOS = [
    {id:1, title:"The Surprise Skip-Level",   prompt:'"So — what have you been focused on lately?"',     tag:"Strategic framing · Brevity"},
    {id:2, title:"Promotion Calibration",      prompt:'"Why are you ready for the next level?"',          tag:"Ownership · Evidence · Confidence"},
    {id:3, title:"The Executive Fly-By",       prompt:'"How\'s the project going?"',                      tag:"Brevity · Prioritisation"},
    {id:4, title:"Credit Theft",               prompt:"A colleague presents your work as their own.",      tag:"Composure · Ownership"},
    {id:5, title:"Difficult Stakeholder",      prompt:'"I\'m still not convinced this made a difference."', tag:"Persuasion · Credibility"},
    {id:6, title:"The Quiet Achiever Trap",    prompt:'"You do great work — but I need more visibility into your impact."', tag:"Self-advocacy · Reframing"},
  ];

  const wc = v.trim().split(/\s+/).filter(Boolean).length;
  const rank = wc<=35 ? {badge:"⚡",label:"Executive Sharp",color:"#C9A84C"} : wc<=65 ? {badge:"🎯",label:"Clear Communicator",color:"#8A9E84"} : {badge:"⏳",label:"Too long",color:"#8A7B66"};

  async function go(){
    if(!v.trim()||!scenario)return; setL(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`Elite executive comms coach. Score this Leadership Hot Seat response.\nScenario: "${scenario.prompt}"\nResponse: "${v}"\n\nReturn ONLY JSON: {overall:<50-100>,Clarity:<50-100>,Confidence:<50-100>,Brevity:<50-100>,Ownership:<50-100>,coaching:"<one specific editorial sentence referencing their actual words>",next:"<one concrete upgrade>"}`}]})});
      const d=await res.json(); const raw=(d.content||[]).map(b=>b.text||"").join("").trim();
      try{const m=raw.match(/\{[\s\S]*\}/); setR(JSON.parse(m[0]));}
      catch{setR({overall:75,Clarity:78,Confidence:72,Brevity:70,Ownership:80,coaching:"Clear contribution — now lead with the result, not the context.",next:"One specific number would make this unforgettable."});}
    }catch{setR(null);} setL(false);
  }

  if (!scenario) return (
    <div>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#A8998A",marginBottom:12,fontWeight:300}}>Choose your scenario:</p>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {SCENARIOS.map(sc=>(
          <div key={sc.id} onClick={()=>{setScenario(sc);setV("");setR(null);}}
            style={{padding:"14px 16px",background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,cursor:"pointer"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:600,color:"#2C2416",marginBottom:3}}>{sc.id}. {sc.title}</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#8A7B66"}}>{sc.tag}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div onClick={()=>{setScenario(null);setV("");setR(null);}} style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,cursor:"pointer"}}>
        <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#8A9E84"}}>← All scenarios</span>
      </div>
      <div style={{padding:"16px",background:"#0E0B08",borderRadius:8,marginBottom:16}}>
        <div style={{fontSize:9,fontWeight:700,color:"rgba(138,158,132,0.7)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8,fontFamily:"'Inter',sans-serif"}}>{scenario.title}</div>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600,color:"rgba(255,255,255,0.92)",lineHeight:1.4,margin:"0 0 8px"}}>{scenario.prompt}</p>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(138,158,132,0.6)"}}>{scenario.tag}</div>
      </div>
      {!r && wc>0 && <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(237,232,223,0.6)",borderRadius:4,marginBottom:8}}>
        <span style={{fontSize:14}}>{rank.badge}</span>
        <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:rank.color,fontWeight:500}}>{rank.label}</span>
        <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#8A7B66"}}>{wc} words</span>
      </div>}
      <textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Respond clearly, confidently, in 30 seconds or less…" style={{width:"100%",borderRadius:4,border:"0.5px solid #DDD5C4",padding:"12px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:110,marginBottom:10,boxSizing:"border-box",background:"rgba(247,243,236,0.8)"}}/>
      <button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"12px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:13,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?16:0}}>
        {l?"Coaching in progress…":"Get Coached →"}
      </button>
      {r && <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",gap:12,alignItems:"stretch"}}>
          <div style={{flex:1,padding:"14px",background:"#0E0B08",borderRadius:6,textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:2}}>{rank.badge}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontWeight:600,color:rank.color}}>{rank.label}</div>
          </div>
          <div style={{padding:"14px",background:"#0E0B08",borderRadius:6,textAlign:"center",minWidth:80}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:600,color:"#8A9E84",lineHeight:1}}>{r.overall}</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(245,239,230,0.4)",marginTop:2}}>/100</div>
          </div>
        </div>
        {["Clarity","Confidence","Brevity","Ownership"].map(d=>(
          <div key={d}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#2C2416"}}>{d}</span>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,fontWeight:600,color:r[d]>=80?"#8A9E84":"#8A7B66"}}>{r[d]}</span>
            </div>
            <div style={{height:3,background:"rgba(44,36,22,0.08)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:r[d]+"%",background:r[d]>=80?"#8A9E84":"rgba(138,158,132,0.4)",borderRadius:2}}/>
            </div>
          </div>
        ))}
        <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"2px solid #8A9E84"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#527060",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>Coach</div>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#2C2416",margin:0,lineHeight:1.65}}>{r.coaching}</p>
          {r.next && <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:"#6B5E44",margin:"8px 0 0",lineHeight:1.6}}>{r.next}</p>}
        </div>
        <button onClick={()=>{setScenario(null);setV("");setR(null);}} style={{padding:"11px",borderRadius:3,border:"0.5px solid #DDD5C4",background:"transparent",color:"#6B5E44",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>Try another scenario →</button>
      </div>}
    </div>
  );
}

// ─── D3 Simulation Feedback + Mobile helpers ─────────────────────────────────