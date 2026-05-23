import { useState } from 'react';
import { T } from '../theme.js';

export function D4SimFeedback({input}) {
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false);
  const avgLen = (s) => { const sents = s.match(/[^.!?]+[.!?]+/g)||[]; if (!sents.length) return 0; return Math.round(sents.reduce((a,s)=>a+s.trim().split(/\s+/).length,0)/sents.length); };
  const longSents = (s) => (s.match(/[^.!?]+[.!?]+/g)||[]).filter(s=>s.trim().split(/\s+/).length>20);
  async function analyse() {
    if (!input.trim()) return; setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`Analyse this for sentence length and brevity. Return JSON: {score:number(1-10),avgWords:number,longestSentence:string,rewrite:"same message in short sentences",tip:"one actionable improvement"}\n\n"${input}"`}]})});
      const d = await res.json(); const raw=(d.content||[]).map(b=>b.text||"").join("").trim();
      try { const m=raw.match(/\{[\s\S]*\}/); setResult(JSON.parse(m[0])); } catch { setResult({score:7,avgWords:avgLen(input),longestSentence:longSents(input)[0]||"",rewrite:"Split each idea into its own sentence. Aim for under 15 words each.",tip:"Find every 'and' — split there first."}); }
    } catch { setResult(null); } setLoading(false);
  }
  return (
    <div>
      <button onClick={analyse} disabled={loading||!input.trim()} style={{width:"100%",padding:"12px",borderRadius:3,border:"none",background:loading||!input.trim()?"#DDD5C4":T.ink,color:loading||!input.trim()?"#6B5E44":"#F7F3EC",fontSize:13,fontWeight:600,cursor:loading||!input.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:result?16:0}}>
        {loading?"Analysing sentence length…":"Get Brevity Score →"}
      </button>
      {result && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{padding:"16px 20px",background:"#EDE8DF",borderRadius:4,border:"0.5px solid #DDD5C4",display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:600,color:T.ink,lineHeight:1}}>{result.score}<span style={{fontSize:20,color:T.gold}}>/10</span></div>
            <div><div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#6B5E44",marginBottom:2}}>Brevity Score</div><div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#6B5E44"}}>Avg. sentence: ~{result.avgWords||avgLen(input)} words (target: &lt;15)</div></div>
          </div>
          {result.longestSentence && <div style={{padding:"12px 16px",background:"rgba(176,92,74,0.06)",borderRadius:4,borderLeft:"2px solid rgba(176,92,74,0.4)"}}><div style={{fontSize:9,fontWeight:600,color:"#B05C4A",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontFamily:"'Inter',sans-serif"}}>Longest sentence</div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:T.ink,margin:0,lineHeight:1.6}}>{result.longestSentence}</p></div>}
          {result.rewrite && <div style={{padding:"12px 16px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"2px solid #8A9E84"}}><div style={{fontSize:9,fontWeight:600,color:"#527060",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontFamily:"'Inter',sans-serif"}}>Rewrite suggestion</div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:T.ink,margin:0,lineHeight:1.6}}>{result.rewrite}</p></div>}
          {result.tip && <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#6B5E44",fontStyle:"italic",margin:0}}>{result.tip}</p>}
        </div>
      )}
    </div>
  );
}

// ─── D4 Mobile helpers ────────────────────────────────────────────────────────
export function D4MobileSplit() {
  const [v,setV]=useState(""); const [r,setR]=useState(""); const [l,setL]=useState(false);
  const wc = v.trim().split(/\s+/).filter(Boolean).length;
  async function go(){if(!v.trim())return;setL(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:`Split into short sentences under 15 words each. Return ONLY the split version: "${v}"`}]})});const d=await res.json();setR((d.content||[]).map(b=>b.text||"").join("").trim());}catch{setR("Split at every 'and', 'but', 'which', or 'that'.");}setL(false);}
  return(<div><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Paste a long sentence…" style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:60,marginBottom:4,boxSizing:"border-box"}}/>{v&&<p style={{fontSize:11,color:wc>15?"#B05C4A":"#527060",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>{wc} words{wc>15?" — too long":""}</p>}<button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?10:0}}>{l?"Splitting…":"Split It →"}</button>{r&&<div style={{padding:"12px 14px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#2C2416",margin:0,lineHeight:1.6}}>{r}</p></div>}</div>);
}
export function D4MobileSim() {
  const [v,setV]=useState(""); const [r,setR]=useState(null); const [l,setL]=useState(false);
  async function go(){if(!v.trim())return;setL(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:`Score this for sentence brevity (target <15 words each). Return JSON: {score:number,avgWords:number,rewrite:"shorter version"}\n\n"${v}"`}]})});const d=await res.json();const raw=(d.content||[]).map(b=>b.text||"").join("").trim();try{const m=raw.match(/\{[\s\S]*\}/);setR(JSON.parse(m[0]));}catch{setR({score:7,avgWords:18,rewrite:"Break each idea into its own sentence. Aim for under 15 words."});}}catch{setR(null);}setL(false);}
  return(<div><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Write using only short sentences…" style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:100,marginBottom:8,boxSizing:"border-box"}}/><button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?10:0}}>{l?"Analysing…":"Get Brevity Score →"}</button>{r&&<div style={{display:"flex",flexDirection:"column",gap:8}}><div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#EDE8DF",borderRadius:3}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:600,color:"#2C2416",lineHeight:1}}>{r.score}<span style={{fontSize:16,color:"#8A9E84"}}>/10</span></span><span style={{fontSize:11,color:"#6B5E44",fontFamily:"'Inter',sans-serif"}}>Avg. ~{r.avgWords} words/sentence</span></div>{r.rewrite&&<div style={{padding:"10px 12px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:"#2C2416",margin:0,lineHeight:1.6}}>{r.rewrite}</p></div>}</div>}</div>);
}

// ─── D1 Mobile helpers ────────────────────────────────────────────────────────

