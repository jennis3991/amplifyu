import { useState, useRef, useEffect } from 'react';
import { T } from '../theme.js';
import { useWakeLock } from '../utils.js';
import { VoiceRecorder } from './VoiceRecorder.jsx';
import { useSequentialDots, SequentialDots } from './SequentialDots.jsx';

function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

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
      const res = await fetch("/api/claude", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:600,messages:[{role:"user",content:`You are an elite executive communication coach. Score this leadership hot seat response.\n\n${scenarioCtx}Response: "${input}"\n\nWord count: ${wordCount}\n\nReturn ONLY valid JSON:\n{\n  "overall":<50-100>,\n  "Clarity":<50-100>,\n  "Confidence":<50-100>,\n  "Brevity":<50-100>,\n  "Ownership":<50-100>,\n  "StratThinking":<50-100>,\n  "Presence":<50-100>,\n  "coaching":"<One specific, editorial coaching sentence — reference the actual words used. Not generic. Think: \'Your strongest point arrived 18 words in\' not \'good job\'>",\n  "coaching2":"<One specific follow-up coaching sentence — a concrete next step or upgrade>"\n}`}]})});
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
const D10_SAR_LOADING_MESSAGES = [
  "AmplifyU is carving your story…",
  "Finding the sharpest angle…",
  "Leading with your result…",
  "Almost ready…",
];

export function D10MobileSAR({onComplete}) {
  const [res,setRes]=useState(""); const [l,setL]=useState(false);
  const sarDotCount = useSequentialDots(l);

  async function go(text){
    if(!text||!text.trim())return;
    setL(true);
    try{
      const resp=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:250,messages:[{role:"user",content:`You are an executive communication coach. Sharpen this spoken SAR (Situation, Action, Result) story into 2-3 crisp, confident sentences. Lead with the result. Return ONLY the sharpened story:\n\n${text}`}]})});
      const d=await resp.json();
      const txt=(d.content||[]).map(b=>b.text||"").join("").trim();
      setRes(txt);if(onComplete)onComplete();
    }catch{setRes("Lead with the result, then explain how you got there.");if(onComplete)onComplete();}
    setL(false);
  }

  return(
    <div>
      {!res && !l && (
        <div style={{marginBottom:4}}>
          <div style={{fontSize:10,fontWeight:700,color:"#8A9E84",textTransform:"uppercase",letterSpacing:"1.5px",fontFamily:"'Inter',sans-serif",marginBottom:8}}>Situation &middot; Action &middot; Result</div>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#6B5E44",lineHeight:1.6,margin:"0 0 18px"}}>Speak your whole story in one go: what was the challenge, what did YOU specifically do, and what was the measurable result?</p>
          <VoiceRecorder T={T} onDone={go}/>
        </div>
      )}
      {l && (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"28px 0"}}>
          <SequentialDots dotCount={sarDotCount} size={7} gap={6} activeColor="#8A9E84" inactiveColor="rgba(138,158,132,0.2)"
            messages={D10_SAR_LOADING_MESSAGES} textStyle={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#8A7B66"}}/>
        </div>
      )}
      {res&&(
        <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"2px solid #8A9E84"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#527060",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>Your performance statement</div>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#2C2416",margin:0,lineHeight:1.65}}>{res}</p>
        </div>
      )}
    </div>
  );
}


// ─── Leadership Hot Seat — D10 Simulation (mobile) ───────────────────────────
export function D10MobileSim({T2: _T2, onRecordingChange}) {
  const T2 = _T2 || T;
  const [scenario, setScenario] = useState(null);
  const [r, setR] = useState(null);
  const [l, setL] = useState(false);
  const dotCount = useSequentialDots(l);
  const [isRec, setIsRec] = useState(false);
  useWakeLock(isRec);
  const [waveVals, setWaveVals] = useState(Array.from({length:9},()=>0.3));
  const [micError, setMicError] = useState(false);
  const [transcribeFailed, setTranscribeFailed] = useState(false);
  const [fallbackText, setFallbackText] = useState('');
  const mediaRecRef = useRef(null);
  const audioChunksRef = useRef([]);
  const waveRef = useRef(null);

  useEffect(()=>{
    if(!isRec){clearInterval(waveRef.current);return;}
    waveRef.current=setInterval(()=>setWaveVals(Array.from({length:9},()=>0.2+Math.random()*0.8)),150);
    return()=>clearInterval(waveRef.current);
  },[isRec]);

  useEffect(()=>{ onRecordingChange?.(isRec||l); },[isRec,l]);

  useEffect(()=>()=>{
    if(mediaRecRef.current && mediaRecRef.current.state!=='inactive'){ try{mediaRecRef.current.stop();}catch(e){} }
  },[]);

  const SCENARIOS = [
    {id:2, title:"Promotion Calibration",      prompt:'"Why are you ready for the next level?"',          tag:"Ownership · Evidence · Confidence",
     icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A9E84" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>},
    {id:4, title:"Credit Theft",               prompt:"A colleague presents your work as their own.",      tag:"Composure · Ownership",
     icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A9E84" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>},
    {id:5, title:"Difficult Stakeholder",      prompt:'"I\'m still not convinced this made a difference."', tag:"Persuasion · Credibility",
     icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A9E84" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>},
    {id:6, title:"The Quiet Achiever Trap",    prompt:'"You do great work — but I need more visibility into your impact."', tag:"Self-advocacy · Reframing",
     icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A9E84" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>},
  ];

  const scoreColor = s => s>=80 ? "#8A9E84" : s>=65 ? "#C9A84C" : "#8A7B66";

  function doStart(){
    setIsRec(true); setMicError(false); setTranscribeFailed(false); setFallbackText('');
    audioChunksRef.current=[];
    if(navigator.mediaDevices?.getUserMedia){
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        let mr;
        try { mr = new MediaRecorder(stream, {mimeType:'audio/webm'}); }
        catch { mr = new MediaRecorder(stream); }
        mr.ondataavailable=e=>{if(e.data.size>0)audioChunksRef.current.push(e.data);};
        mr.start(1000); mediaRecRef.current=mr;
      }).catch(()=>{ setIsRec(false); setMicError(true); });
    } else { setIsRec(false); setMicError(true); }
  }

  function stopRecording(cb){
    const mr=mediaRecRef.current;
    if(!mr||mr.state==='inactive'){ cb('', true); return; }
    mr.onstop=async()=>{
      mr.stream.getTracks().forEach(t=>t.stop());
      const blob=new Blob(audioChunksRef.current,{type:'audio/webm'});
      try{
        const b64=await blobToB64(blob);
        const res=await fetch('/api/transcribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({b64,mimeType:'audio/webm'})});
        const data=await res.json();
        if(!res.ok) throw new Error(data.error||'Transcription failed');
        cb((data.text||'').trim(), false);
      }catch(err){ console.error('[D10MobileSim] transcribe error:', err); cb('', true); }
    };
    try{ mr.stop(); }catch(e){ cb('', true); }
  }

  function doStop(){
    setIsRec(false);
    setL(true);
    stopRecording((text, failed) => {
      if (failed || !text) { setL(false); setTranscribeFailed(true); return; }
      go(text);
    });
  }

  async function go(text){
    if(!text||!text.trim()||!scenario)return; setL(true);
    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:700,messages:[{role:"user",content:`You are an executive communication coach. A professional was asked: "${scenario.prompt}"\n\nTheir spoken response: "${text}"\n\nEvaluate and return ONLY valid JSON:\n{"overall":<50-100>,"headline":"<max 10 words: single most important observation>","scores":{"Clarity":<50-100>,"Structure":<50-100>,"Confidence":<50-100>,"Brevity":<50-100>,"Impact":<50-100>},"strength":"<one sentence: what they did well>","improve":"<one sentence: single most important improvement>","rewrite":"<sharper 2-3 sentence version of their answer, leading with result>","insight":"<2 sentences of personalised coaching>"}`}]})});
      const d=await res.json(); const raw=(d.content||[]).map(b=>b.text||"").join("").trim();
      const m=raw.match(/\{[\s\S]*\}/); setR(JSON.parse(m[0]));
    }catch{
      setR({overall:74,headline:"Clear ownership with room to sharpen the result.",scores:{Clarity:75,Structure:70,Confidence:72,Brevity:80,Impact:68},strength:"You spoke with genuine ownership and didn't shy away from the question.",improve:"Lead with the result before the context — flip the order for more impact.",rewrite:"I led a cross-functional project that increased efficiency by 30%. The key challenge was aligning three teams with competing priorities. I resolved this by establishing a weekly decision framework — and we delivered ahead of schedule.",insight:"Your instinct to give context first is natural, but executives want the result first. Try: 'Result → How → Why it mattered.' You'll land harder, faster."});
    }
    setL(false);
  }

  function resetToScenarios(){
    setScenario(null); setR(null); setMicError(false); setTranscribeFailed(false); setFallbackText(''); setIsRec(false);
  }

  if (!scenario) return (
    <div>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#A8998A",marginBottom:12,fontWeight:300}}>Choose your scenario:</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {SCENARIOS.map(sc=>(
          <div key={sc.id} onClick={()=>{setScenario(sc);setR(null);setMicError(false);setTranscribeFailed(false);setFallbackText('');}}
            style={{padding:"12px",background:T2.surface,border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,cursor:"pointer",display:"flex",flexDirection:"column",gap:8,minHeight:110}}>
            <div>{sc.icon}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.25,flex:1}}>{sc.title}</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:T2.text3,lineHeight:1.4}}>{sc.tag}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div onClick={resetToScenarios} style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,cursor:"pointer"}}>
        <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#8A9E84"}}>← All scenarios</span>
      </div>
      <div style={{padding:"16px",background:"#0E0B08",borderRadius:8,marginBottom:16}}>
        <div style={{fontSize:9,fontWeight:700,color:"rgba(138,158,132,0.7)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8,fontFamily:"'Inter',sans-serif"}}>{scenario.title}</div>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600,color:"rgba(255,255,255,0.92)",lineHeight:1.4,margin:"0 0 8px"}}>{scenario.prompt}</p>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(138,158,132,0.6)"}}>{scenario.tag}</div>
      </div>

      {!r && !l && (
        <>
          {(micError||transcribeFailed) && (
            <div style={{padding:"14px 16px",background:"rgba(180,80,60,0.08)",borderRadius:4,border:"1px solid rgba(180,80,60,0.25)",marginBottom:10}}>
              <div style={{fontSize:9,fontWeight:700,color:"#B05C4A",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>{micError?"We couldn't access your microphone":"We couldn't hear that clearly"}</div>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#6B5E44",lineHeight:1.6,margin:"0 0 10px",fontWeight:300}}>{micError?"Check your microphone permission, or type your response instead.":"Try recording again, or type your response instead."}</p>
              <textarea value={fallbackText} onChange={e=>setFallbackText(e.target.value)} placeholder="Type your response here…" style={{width:"100%",borderRadius:4,border:"0.5px solid #DDD5C4",padding:"12px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:100,marginBottom:8,boxSizing:"border-box",background:T2.surface,color:T2.text}}/>
              <button onClick={()=>go(fallbackText)} disabled={!fallbackText.trim()} style={{width:"100%",padding:"11px",borderRadius:3,border:"none",background:!fallbackText.trim()?"#DDD5C4":"#2C2416",color:!fallbackText.trim()?"#6B5E44":"#F7F3EC",fontSize:13,fontWeight:600,cursor:!fallbackText.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif"}}>Submit Typed Response →</button>
            </div>
          )}
          {isRec ? (
            <div style={{padding:"20px 16px",background:"#0E0B08",borderRadius:8,marginBottom:10,textAlign:"center"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:14}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:"#CC4444",animation:"glowPulse 1s ease infinite"}}/>
                <span style={{fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:700,color:"rgba(245,239,230,0.5)",textTransform:"uppercase",letterSpacing:"2px"}}>Recording</span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,height:34,marginBottom:16}}>
                {waveVals.map((v,i)=><div key={i} style={{width:4,borderRadius:2,background:"#C9A84C",height:Math.max(3,v*30),transition:"height 0.1s ease"}}/>)}
              </div>
              <button onClick={doStop} style={{width:"100%",padding:"13px",borderRadius:3,border:"none",background:"#8A4A3A",color:"#F7F3EC",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>Stop & Get Feedback →</button>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginBottom:10}}>
              <button onClick={doStart} style={{
                width:80,height:80,borderRadius:"50%",border:"none",cursor:"pointer",
                background:"#8A9E84",display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 0 0 6px rgba(138,158,132,0.12)",transition:"all 0.2s ease",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill="white"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#8A7B66"}}>{(micError||transcribeFailed)?"Try Recording Again":"Start Recording"}</div>
            </div>
          )}
        </>
      )}

      {l && <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"32px 0",textAlign:"center"}}>
        <SequentialDots dotCount={dotCount} size={7} gap={6} center={false} activeColor="#C9A84C" inactiveColor="rgba(201,168,76,0.2)"/>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#2C2416",margin:0}}>Your AmplifyU coach is reviewing your response…</p>
      </div>}

      {r && <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{padding:"18px",background:"#0E0B08",borderRadius:8}}>
          <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14}}>
            <div style={{flexShrink:0}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:600,color:"#C9A84C",lineHeight:0.9}}>{r.overall}</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(245,239,230,0.4)",marginTop:2}}>/100</div>
            </div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:600,color:"rgba(255,255,255,0.92)",lineHeight:1.3,margin:0,paddingTop:4}}>{r.headline}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {Object.entries(r.scores||{}).map(([dim,sc])=>(
              <div key={dim} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(245,239,230,0.55)",width:66,flexShrink:0}}>{dim}</span>
                <div style={{flex:1,height:3,background:"rgba(245,239,230,0.07)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:sc+"%",background:scoreColor(sc),borderRadius:2}}/></div>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,fontWeight:600,color:scoreColor(sc),width:22,textAlign:"right",flexShrink:0}}>{sc}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,padding:"12px 14px",background:"rgba(237,232,223,0.6)",borderRadius:6}}>
            <div style={{fontSize:9,fontWeight:700,color:"#527060",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5,fontFamily:"'Inter',sans-serif"}}>What Landed</div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"#2C2416",margin:0,lineHeight:1.55}}>{r.strength}</p>
          </div>
          <div style={{flex:1,padding:"12px 14px",background:"rgba(237,232,223,0.6)",borderRadius:6,border:"0.5px solid rgba(176,122,64,0.3)"}}>
            <div style={{fontSize:9,fontWeight:700,color:"#B07A40",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5,fontFamily:"'Inter',sans-serif"}}>Opportunity</div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"#2C2416",margin:0,lineHeight:1.55}}>{r.improve}</p>
          </div>
        </div>
        <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"2px solid #8A9E84"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#527060",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>A Stronger Version</div>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:"#2C2416",margin:0,lineHeight:1.6}}>{r.rewrite}</p>
        </div>
        <div style={{padding:"14px 16px",background:"rgba(237,232,223,0.6)",borderRadius:4}}>
          <div style={{fontSize:9,fontWeight:700,color:"#8A7B66",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>Your AmplifyU Coach Says</div>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#2C2416",margin:0,lineHeight:1.6}}>{r.insight}</p>
        </div>
        <button onClick={resetToScenarios} style={{padding:"11px",borderRadius:3,border:"0.5px solid #DDD5C4",background:"transparent",color:"#6B5E44",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>Try another scenario →</button>
      </div>}
    </div>
  );
}

// ─── D3 Simulation Feedback + Mobile helpers ─────────────────────────────────