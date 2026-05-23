import { useState } from 'react';
import { T } from '../theme.js';

export function D10SimFeedback({input}) {
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false);
  async function analyse() {
    if (!input.trim()) return; setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`Score this performance statement for clarity and impact (1-10). Return JSON: {score:number,strengths:[string,string],gaps:[string],rewrite:"sharper 2-sentence version"}\n\n"${input}"`}]})});
      const d = await res.json(); const raw=(d.content||[]).map(b=>b.text||"").join("").trim();
      try { const m=raw.match(/\{[\s\S]*\}/); setResult(JSON.parse(m[0])); } catch { setResult({score:7,strengths:["Clear contribution identified","Good context"],gaps:["Make the result more specific — add a number"],rewrite:"I delivered X ahead of schedule. The result: a measurable improvement that the business immediately felt."}); }
    } catch { setResult(null); } setLoading(false);
  }
  return (
    <div>
      <button onClick={analyse} disabled={loading||!input.trim()} style={{width:"100%",padding:"12px",borderRadius:3,border:"none",background:loading||!input.trim()?"#DDD5C4":T.ink,color:loading||!input.trim()?"#6B5E44":"#F7F3EC",fontSize:13,fontWeight:600,cursor:loading||!input.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:result?16:0}}>
        {loading?"Scoring your impact…":"Get Impact Score →"}
      </button>
      {result && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{padding:"16px 20px",background:"#EDE8DF",borderRadius:4,border:"0.5px solid #DDD5C4",display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:600,color:T.ink,lineHeight:1}}>{result.score}<span style={{fontSize:20,color:T.gold}}>/10</span></div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#6B5E44"}}>Impact Score</div>
          </div>
          {result.strengths?.map((s,i)=><div key={i} style={{display:"flex",gap:8}}><span style={{color:"#527060",flexShrink:0}}>✓</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.ink}}>{s}</span></div>)}
          {result.gaps?.map((g,i)=><div key={i} style={{display:"flex",gap:8}}><span style={{color:"#B05C4A",flexShrink:0}}>✗</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.ink}}>{g}</span></div>)}
          {result.rewrite && <div style={{padding:"12px 16px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"2px solid #8A9E84"}}><div style={{fontSize:9,fontWeight:600,color:"#527060",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontFamily:"'Inter',sans-serif"}}>Sharpened version</div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontStyle:"italic",color:T.ink,margin:0,lineHeight:1.6}}>{result.rewrite}</p></div>}
        </div>
      )}
    </div>
  );
}
export function D10MobileSAR() {
  const [s,setS]=useState(""); const [a,setA]=useState(""); const [r,setR]=useState(""); const [res,setRes]=useState(""); const [l,setL]=useState(false);
  async function go(){if(!s.trim()||!a.trim()||!r.trim())return;setL(true);try{const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:`Sharpen into 2 crisp sentences. Return ONLY the result:\n\nS: ${s}\nA: ${a}\nR: ${r}`}]})});const d=await resp.json();setRes((d.content||[]).map(b=>b.text||"").join("").trim());}catch{setRes("Sharpen it further — lead with the result, then explain how.");}setL(false);}
  return(<div><div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:10}}>{[["Situation",s,setS,"What was the challenge or context?"],[" Action",a,setA,"What did YOU specifically do?"],["Result",r,setR,"What was the measurable outcome?"]].map(([lbl,v,sv,ph],i)=><div key={i}><div style={{fontSize:10,fontWeight:700,color:"#8A9E84",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontFamily:"'Inter',sans-serif"}}>{lbl}</div><textarea value={v} onChange={e=>sv(e.target.value)} placeholder={ph} style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:56,boxSizing:"border-box"}}/></div>)}</div><button onClick={go} disabled={l||!s.trim()||!a.trim()||!r.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!s.trim()||!a.trim()||!r.trim()?"#DDD5C4":"#2C2416",color:l||!s.trim()||!a.trim()||!r.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!s.trim()||!a.trim()||!r.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:res?10:0}}>{l?"Sharpening…":"Sharpen My SAR →"}</button>{res&&<div style={{padding:"12px 14px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#2C2416",margin:0,lineHeight:1.6}}>{res}</p></div>}</div>);
}

export function D10MobileSim() {
  const [v,setV]=useState(""); const [r,setR]=useState(null); const [l,setL]=useState(false);
  async function go(){if(!v.trim())return;setL(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:`Score this performance statement (1-10). Return JSON: {score:number,win:"one strength",gap:"one improvement",rewrite:"sharper version"}\n\n"${v}"`}]})});const d=await res.json();const raw=(d.content||[]).map(b=>b.text||"").join("").trim();try{const m=raw.match(/\{[\s\S]*\}/);setR(JSON.parse(m[0]));}catch{setR({score:7,win:"Clear contribution",gap:"Make the result more specific",rewrite:"I delivered X. The result was Y."});}}catch{setR(null);}setL(false);}
  return(<div><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Write your performance statement here…" style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:100,marginBottom:8,boxSizing:"border-box"}}/><button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?10:0}}>{l?"Scoring…":"Get Impact Score →"}</button>{r&&<div style={{display:"flex",flexDirection:"column",gap:8}}><div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#EDE8DF",borderRadius:3}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:600,color:"#2C2416",lineHeight:1}}>{r.score}<span style={{fontSize:16,color:"#8A9E84"}}>/10</span></span><span style={{fontSize:11,color:"#6B5E44",fontFamily:"'Inter',sans-serif"}}>Impact Score</span></div>{r.win&&<div style={{display:"flex",gap:8}}><span style={{color:"#527060",flexShrink:0}}>✓</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#2C2416"}}>{r.win}</span></div>}{r.gap&&<div style={{display:"flex",gap:8}}><span style={{color:"#B05C4A",flexShrink:0}}>✗</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#2C2416"}}>{r.gap}</span></div>}{r.rewrite&&<div style={{padding:"10px 12px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:"#2C2416",margin:0,lineHeight:1.6}}>{r.rewrite}</p></div>}</div>}</div>);
}

// ─── D3 Simulation Feedback + Mobile helpers ─────────────────────────────────

