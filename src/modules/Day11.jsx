import { useState, useEffect, useRef } from 'react';

function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// ─── D11 Rehearsal Widget — AmplifyU Coaching Conversation ───────────────────

const QUESTIONS = [
  {
    q:    "What do people consistently come to you for?",
    hint: "Think about the problems people ask you to solve, the advice they seek, or the situations where they naturally rely on you.",
    duration: 30,
    ack:  "That's helpful. I'm starting to see a pattern.",
  },
  {
    q:    "What makes you different from other people in your role?",
    hint: "Imagine someone recommended you for an important project. What would they say about you? What makes you memorable?",
    duration: 30,
    ack:  "Interesting. One more question.",
  },
  {
    q:    "Tell me about a piece of work you're genuinely proud of.",
    hint: "What happened? Why are you proud of it? What does that story reveal about you?",
    duration: 45,
    ack:  null,
  },
];

const ANALYSIS_MSGS = [
  "Listening carefully...",
  "Finding recurring patterns...",
  "Understanding how you create value...",
  "Building your Professional Signature...",
];

export function D11PracticeWidget({ T, T2, isDesktop, onWordsChange, onSimulation, onNavLabel, onNavFn }) {
  const SAGE = '#3D5940';
  const SAGE_CARD = '#0e0e0e';
  const [phase,          setPhase]         = useState('intro');
  const [qIdx,           setQIdx]          = useState(0);
  const [transcripts,    setTranscripts]   = useState(['', '', '']);
  const [liveText,       setLiveText]      = useState('');
  const [textAnswer,     setTextAnswer]    = useState('');
  const [timer,          setTimer]         = useState(0);
  const [useText,        setUseText]       = useState(false);
  const [analysisMsgIdx, setAnalysisMsgIdx]= useState(0);
  const [result,         setResult]        = useState(null);
  const [copied,         setCopied]        = useState(false);

  // ── My Saved Toolkits — shares the au1_toolkits key with D11SimWidget, but
  // this source (brand-rehearsal) is capped and listed independently.
  const TOOLKIT_CAP = 5;
  const isMineRehearsal = t => t.source === 'brand-rehearsal';
  const [savedToolkits, setSavedToolkits] = useState(() => {
    try { return JSON.parse(localStorage.getItem("au1_toolkits") || "[]"); } catch { return []; }
  });
  const myToolkitsRehearsal = savedToolkits.filter(isMineRehearsal);
  const [toolkitsOpen, setToolkitsOpen] = useState(false);
  const [pendingToolkit, setPendingToolkit] = useState(null);

  function saveBrandRehearsal(r) {
    const entry = {
      id: Date.now(),
      source: 'brand-rehearsal',
      signature: r.signature || '',
      strengths: r.strengths || [],
      statement: r.statement || '',
      coachNote: r.coachNote || '',
      timestamp: Date.now(),
    };
    if (myToolkitsRehearsal.length >= TOOLKIT_CAP) {
      setPendingToolkit(entry);
      return;
    }
    const next = [entry, ...savedToolkits];
    setSavedToolkits(next);
    try { localStorage.setItem("au1_toolkits", JSON.stringify(next)); } catch {}
  }

  function deleteToolkit(id) {
    setSavedToolkits(prev => {
      let next = prev.filter(t => t.id !== id);
      let freedForPending = false;
      if (pendingToolkit && next.filter(isMineRehearsal).length < TOOLKIT_CAP) {
        next = [pendingToolkit, ...next];
        freedForPending = true;
      }
      try { localStorage.setItem("au1_toolkits", JSON.stringify(next)); } catch {}
      if (freedForPending) setPendingToolkit(null);
      return next;
    });
  }

  const recognitionRef  = useRef(null);
  const audioChunksRef  = useRef([]);
  const timerRef        = useRef(null);
  const analysisMsgRef  = useRef(null);
  const liveTextRef     = useRef('');
  // Guards against submitAnswer being invoked twice for the same question
  // (e.g. the recording auto-stop timer racing a manual stop click, or a
  // double-click on "Next"), which would otherwise schedule two qIdx
  // increments and push qIdx past the last valid QUESTIONS index.
  const submittingRef   = useRef(false);

  const recordingAvailable = !!(navigator.mediaDevices?.getUserMedia);

  useEffect(() => {
    if (result?.strengths?.length > 0 && onWordsChange) {
      onWordsChange(result.strengths.slice(0, 3).map(s => s.toLowerCase()));
    }
  }, [result]);

  useEffect(() => {
    if (!onNavLabel) return;
    if (phase === 'results' && result) {
      onNavLabel("Continue");
      if (onNavFn) onNavFn.current = () => onSimulation?.();
    } else {
      onNavLabel(null);
      if (onNavFn) onNavFn.current = null;
    }
  }, [phase, result]);

  useEffect(() => {
    if (phase === 'analyzing') {
      setAnalysisMsgIdx(0);
      const interval = setInterval(() => {
        setAnalysisMsgIdx(i => Math.min(i + 1, ANALYSIS_MSGS.length - 1));
      }, 1800);
      analysisMsgRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [phase]);

  function submitAnswer(text) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    const updated = [...transcripts];
    updated[qIdx] = text || '';
    setTranscripts(updated);
    setLiveText('');
    liveTextRef.current = '';
    setTextAnswer('');
    if (qIdx < 2) {
      setPhase('ack');
      setTimeout(() => { submittingRef.current = false; setQIdx(i => i + 1); setPhase('question'); }, 2600);
    } else {
      setPhase('analyzing');
      runAnalysis(updated);
    }
  }

  function startRecording() {
    if (!recordingAvailable) { setUseText(true); return; }
    audioChunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      let mr;
      try { mr = new MediaRecorder(stream, {mimeType: 'audio/webm'}); }
      catch { mr = new MediaRecorder(stream); }
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.start(1000);
      recognitionRef.current = mr;
      setPhase('recording');
      const duration = QUESTIONS[qIdx].duration;
      setTimer(duration);
      let t = duration;
      timerRef.current = setInterval(() => {
        t--;
        setTimer(t);
        if (t <= 0) { clearInterval(timerRef.current); stopRecording(); }
      }, 1000);
    }).catch(() => { setUseText(true); setPhase('question'); });
  }

  function stopRecording() {
    clearInterval(timerRef.current);
    const mr = recognitionRef.current;
    if (!mr || mr.state === 'inactive') { submitAnswer(''); return; }
    mr.onstop = async () => {
      mr.stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
      recognitionRef.current = null;
      let text = '';
      try {
        const b64 = await blobToB64(blob);
        const res = await fetch('/api/transcribe', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({b64, mimeType: 'audio/webm'}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Transcription failed');
        text = (data.text || '').trim();
      } catch (err) {
        console.error('[D11PracticeWidget] transcribe error:', err);
      }
      submitAnswer(text);
    };
    try { mr.stop(); } catch(e) { recognitionRef.current = null; submitAnswer(''); }
  }

  async function runAnalysis(answers) {
    const prompt = `You are an elite executive coach conducting a personal brand discovery session.

The professional answered three questions:

Q1 – What people come to them for:
"${answers[0] || '(not provided)'}"

Q2 – What makes them different:
"${answers[1] || '(not provided)'}"

Q3 – Work they're genuinely proud of:
"${answers[2] || '(not provided)'}"

Based on their responses, identify their professional signature.

Return ONLY valid JSON:
{
  "signature": "<2-3 sentence paragraph. Warm, specific, second person. Describes their unique professional identity.>",
  "strengths": ["<2-4 word label>", "<2-4 word label>", "<2-4 word label>", "<2-4 word label>", "<2-4 word label>"],
  "statement": "<One sentence, in quotes, 15-25 words. Written as if a sponsor is introducing them.>",
  "coachNote": "<2-3 sentences. Warm coaching insight. Reference something specific they said.>"
}`;
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 700, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const raw = (data.content || []).map(b => b.text || '').join('').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error();
      const parsed = JSON.parse(m[0]);
      try { localStorage.setItem('d11Sig', parsed.signature || ''); localStorage.setItem('d11Stmt', parsed.statement || ''); } catch (_) {}
      saveBrandRehearsal(parsed);
      clearInterval(analysisMsgRef.current);
      setTimeout(() => { setResult(parsed); setPhase('results'); }, 700);
    } catch (_) {
      clearInterval(analysisMsgRef.current);
      setTimeout(() => {
        setResult({
          signature: "You bring a distinctive combination of clarity and care to everything you do. People rely on you not just for your expertise, but for your ability to cut through complexity and help others move forward with confidence. Your professional identity is built on earned trust.",
          strengths: ["Clear Thinking", "Trusted Judgement", "Calm Leadership", "Practical Expertise", "Building Trust"],
          statement: '"The person others turn to when clarity and calm matter most."',
          coachNote: "What came through was the trust others place in you — that's not something you can manufacture, it's earned. That quiet reliability is a powerful brand foundation.",
        });
        setPhase('results');
      }, 700);
    }
  }

  const sf = { fontFamily: T.serif, color: T2.text };
  const sn = { fontFamily: T.sans };
  const lbl = { ...sn, fontSize: 9, fontWeight: 700, color: T2.text4, textTransform: "uppercase", letterSpacing: "2px" };

  function cta(disabled) {
    return {
      width: "100%", padding: "15px", borderRadius: 4, border: "none",
      background: disabled ? "rgba(61,89,64,0.12)" : SAGE,
      color: disabled ? "rgba(200,220,200,0.3)" : "#F5EFE6",
      fontSize: isDesktop ? 14 : 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: T.sans, minHeight: 48, transition: "all 0.2s",
    };
  }

  function ProgressBar() {
    return (
      <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: 2, flex: 1, borderRadius: 1, background: i <= qIdx ? T.gold : T2.border, opacity: i < qIdx ? 0.4 : 1, transition: "all 0.5s" }} />
        ))}
      </div>
    );
  }

  if (phase === 'intro') return (
    <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 26 : 20, animation: "fadeUp 0.5s ease both" }}>
      <div>
        <div style={{ ...lbl, marginBottom: 11, letterSpacing: "2.5px" }}>ALL STRONG BRANDS ARE KNOWN FOR SOMETHING</div>
        <h2 style={{ ...sf, fontSize: isDesktop ? 30 : 24, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>Let's find yours.</h2>
      </div>

      {myToolkitsRehearsal.length>0 && (
        <div style={{background:T2.surface||"rgba(255,255,255,0.025)",borderRadius:8,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
          <button onClick={()=>setToolkitsOpen(v=>!v)} style={{width:"100%",background:"none",border:"none",padding:isDesktop?"14px 18px":"12px 16px",cursor:"pointer",fontFamily:T.sans,fontSize:12,color:T2.text3,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span>My Saved Toolkits ({myToolkitsRehearsal.length})</span>
            <span style={{fontSize:14,opacity:0.6,transform:toolkitsOpen?"rotate(180deg)":"none",display:"inline-block",transition:"transform 0.2s"}}>▾</span>
          </button>
          {toolkitsOpen && (
            <div style={{display:"flex",flexDirection:"column",borderTop:"0.5px solid "+T2.border}}>
              {myToolkitsRehearsal.map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"stretch",borderBottom:"0.5px solid "+T2.border}}>
                  <div style={{flex:1,minWidth:0,padding:isDesktop?"12px 18px":"11px 16px",display:"flex",flexDirection:"column",gap:2}}>
                    <span style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,fontWeight:500}}>{(t.strengths||[]).slice(0,2).join(', ') || "Professional Signature"}</span>
                    <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>{new Date(t.timestamp).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}</span>
                  </div>
                  <button onClick={()=>deleteToolkit(t.id)} title="Delete" style={{background:"none",border:"none",cursor:"pointer",color:T2.text4,fontSize:18,fontFamily:T.sans,padding:"0 16px",flexShrink:0,lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {pendingToolkit && (
        <div style={{background:"rgba(176,92,74,0.06)",borderRadius:6,border:"0.5px solid rgba(176,92,74,0.2)",padding:"10px 16px"}}>
          <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>You've reached your limit of {TOOLKIT_CAP} saved toolkits. This one won't be saved until you delete one above.</span>
        </div>
      )}

      <div style={{ borderLeft: "2px solid " + T.gold, paddingLeft: 15, display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ ...sn, fontSize: isDesktop ? 14 : 13, color: T2.text3, lineHeight: 1.65, margin: 0 }}>Your personal brand isn't your job title. It's what people remember you for after you've left the room.</p>
        <p style={{ ...sn, fontSize: isDesktop ? 14 : 13, color: T2.text3, lineHeight: 1.65, margin: 0 }}>I'll ask you three simple questions. Just speak naturally — I'll identify the patterns and uncover your unique professional signature.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: isDesktop ? "26px 0" : "20px 0" }}>
        <div style={{ width: isDesktop ? 80 : 68, height: isDesktop ? 80 : 68, borderRadius: "50%", background: SAGE_CARD, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 14px rgba(61,89,64,0.1), 0 0 0 28px rgba(61,89,64,0.04)` }}>
          <span style={{ fontSize: isDesktop ? 30 : 24 }}>🎙</span>
        </div>
        {!recordingAvailable && <p style={{ ...sn, fontSize: 11, color: T2.text4, textAlign: "center", margin: 0 }}>Microphone access not available — you'll type your answers instead.</p>}
      </div>
      <button onClick={() => { setQIdx(0); setPhase('question'); }} style={cta(false)}>Start Conversation →</button>
    </div>
  );

  if (phase === 'question') {
    const showText = useText || !recordingAvailable;
    const q = QUESTIONS[qIdx];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 20 : 15, animation: "fadeUp 0.4s ease both" }}>
        <ProgressBar />
        <div style={{ ...sn, fontSize: 10, fontWeight: 600, color: T2.text4, textTransform: "uppercase", letterSpacing: "1.5px" }}>Question {qIdx + 1} of 3</div>
        <h3 style={{ ...sf, fontSize: isDesktop ? 22 : 19, fontWeight: 600, lineHeight: 1.35, margin: 0 }}>{q.q}</h3>
        <p style={{ ...sn, fontSize: isDesktop ? 13 : 12, color: T2.text4, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{q.hint}</p>
        {showText ? (
          <>
            <textarea value={textAnswer} onChange={e => setTextAnswer(e.target.value)} placeholder="Type your answer here..." rows={isDesktop ? 5 : 4}
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: "0.5px solid " + T2.divider, padding: "8px 0", fontFamily: T.serif, fontSize: isDesktop ? 16 : 14, color: T2.text, resize: "none", outline: "none", lineHeight: 1.7, boxSizing: "border-box", fontStyle: "italic" }} />
            <button onClick={() => submitAnswer(textAnswer)} disabled={textAnswer.trim().length < 8} style={cta(textAnswer.trim().length < 8)}>Next →</button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: isDesktop ? "18px 0" : "12px 0" }}>
            <button onClick={startRecording} style={{ width: isDesktop ? 76 : 64, height: isDesktop ? 76 : 64, borderRadius: "50%", background: SAGE, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 12px rgba(61,89,64,0.1)`, transition: "all 0.2s" }}>
              <span style={{ fontSize: isDesktop ? 28 : 22 }}>🎙</span>
            </button>
            <span style={{ ...sn, fontSize: 11, color: T2.text4 }}>Tap to speak</span>
            <button onClick={() => setUseText(true)} style={{ background: "none", border: "none", ...sn, fontSize: 11, color: T2.text4, cursor: "pointer", textDecoration: "underline", padding: 0 }}>Type instead</button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'recording') {
    const q = QUESTIONS[qIdx];
    const sz = isDesktop ? 84 : 72;
    const r = sz / 2 - 4;
    const circ = 2 * Math.PI * r;
    const progress = 1 - (timer / q.duration);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 20 : 15, animation: "fadeUp 0.3s ease both" }}>
        <ProgressBar />
        <h3 style={{ ...sf, fontSize: isDesktop ? 18 : 16, fontWeight: 500, lineHeight: 1.35, margin: 0, color: T2.text3, fontStyle: "italic" }}>{q.q}</h3>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative", width: sz, height: sz }}>
            <svg width={sz} height={sz} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
              <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={T2.border} strokeWidth="1.5" />
              <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={T.gold} strokeWidth="2.5" strokeDasharray={circ} strokeDashoffset={circ*(1-progress)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <button onClick={stopRecording} style={{ position: "absolute", top: 0, left: 0, width: sz, height: sz, borderRadius: "50%", background: "rgba(200,60,60,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", animation: "breathe 1.5s ease infinite" }}>
              <span style={{ fontSize: isDesktop ? 26 : 20 }}>⏹</span>
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(200,60,60,0.75)", animation: "breathe 1.5s ease infinite" }} />
            <span style={{ ...sn, fontSize: 11, color: T2.text4 }}>{timer}s remaining · tap to finish</span>
          </div>
        </div>
        {liveText ? (
          <div style={{ borderLeft: "2px solid " + T.gold, paddingLeft: 14, animation: "fadeUp 0.3s ease both" }}>
            <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 15 : 13, fontStyle: "italic", color: T2.text3, lineHeight: 1.75, margin: 0 }}>{liveText}</p>
          </div>
        ) : (
          <p style={{ ...sn, fontSize: 12, color: T2.text4, textAlign: "center", fontStyle: "italic", margin: 0 }}>Listening...</p>
        )}
      </div>
    );
  }

  if (phase === 'ack') return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: isDesktop ? "52px 12px" : "44px 0", animation: "fadeUp 0.45s ease both" }}>
      <img loading="lazy" src="/logo-mark.png" alt="" style={{ width: 30, height: 30, objectFit: "cover", filter: "brightness(0.55) sepia(0.4)", animation: "breathe 2s ease infinite" }} />
      <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 22 : 18, fontStyle: "italic", color: T2.text, lineHeight: 1.5, textAlign: "center", margin: 0 }}>"{QUESTIONS[qIdx].ack}"</p>
    </div>
  );

  if (phase === 'analyzing') return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: isDesktop ? 28 : 22, padding: isDesktop ? "44px 0" : "32px 0", animation: "fadeUp 0.5s ease both" }}>
      <img loading="lazy" src="/logo-mark.png" alt="" style={{ width: 38, height: 38, objectFit: "cover", filter: "brightness(0.55) sepia(0.4)", animation: "breathe 2s ease infinite" }} />
      <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 22 : 18, fontStyle: "italic", color: T2.text, textAlign: "center", margin: 0, lineHeight: 1.45, minHeight: isDesktop ? 64 : 52 }}>
        {ANALYSIS_MSGS[analysisMsgIdx]}
      </p>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        {ANALYSIS_MSGS.map((_, i) => (
          <div key={i} style={{ height: 2, borderRadius: 1, background: T2.border, overflow: "hidden", opacity: i <= analysisMsgIdx ? 1 : 0.15, transition: "opacity 0.5s" }}>
            <div style={{ height: "100%", borderRadius: 1, background: `linear-gradient(to right, rgba(200,164,106,0.45), ${T.gold})`, width: i < analysisMsgIdx ? "100%" : i === analysisMsgIdx ? "52%" : "0%", transition: "width 1.8s ease" }} />
          </div>
        ))}
      </div>
    </div>
  );

  if (phase === 'results' && result) {
    const strengths = (result.strengths || []).slice(0, 5);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 22 : 16, animation: "fadeUp 0.5s ease both" }}>
        <div>
          <div style={{ ...lbl, marginBottom: 10 }}>YOUR PROFESSIONAL SIGNATURE</div>
          <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 17 : 15, color: T2.text, lineHeight: 1.8, margin: 0 }}>{result.signature}</p>
        </div>
        <div>
          <div style={{ ...lbl, marginBottom: 13 }}>YOU'RE KNOWN FOR...</div>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "repeat(2, 1fr)", gap: isDesktop ? 10 : 8 }}>
            {strengths.map((s, i) => (
              <div key={i} style={{ padding: isDesktop ? "20px 16px" : "15px 12px", borderRadius: 6, background: i === 0 ? "rgba(200,164,106,0.07)" : (T2.surface || "rgba(255,255,255,0.025)"), border: `0.5px solid ${i === 0 ? T.gold : T2.border}`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", gridColumn: (!isDesktop && i === 4) ? "1 / -1" : "auto", animation: `fadeUp 0.4s ${i * 0.07}s ease both` }}>
                <span style={{ fontFamily: T.sans, fontSize: isDesktop ? 13 : 11, fontWeight: 600, color: i === 0 ? T.gold : T2.text, letterSpacing: "0.3px" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: SAGE_CARD, borderRadius: 6, border: "0.5px solid rgba(61,89,64,0.35)", padding: isDesktop ? "24px 20px" : "18px 15px" }}>
          <div style={{ ...lbl, color: "rgba(138,158,132,0.7)", marginBottom: 10 }}>YOUR BRAND STATEMENT</div>
          <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 20 : 17, fontStyle: "italic", color: "#F5EFE6", lineHeight: 1.55, margin: "0 0 14px", fontWeight: 500 }}>{result.statement}</p>
          <button onClick={() => { navigator.clipboard?.writeText((result.statement || "").replace(/^"|"$/g, '')).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200); }); }} style={{ padding: "6px 14px", borderRadius: 3, border: "0.5px solid rgba(138,158,132,0.5)", background: copied ? "rgba(138,158,132,0.12)" : "transparent", color: "rgba(138,158,132,0.85)", fontSize: 11, fontFamily: T.sans, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        <div style={{ borderLeft: "2px solid rgba(61,89,64,0.4)", paddingLeft: 15 }}>
          <div style={{ ...lbl, marginBottom: 9 }}>COACH REFLECTION</div>
          <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 15 : 13, fontStyle: "italic", color: T2.text3, lineHeight: 1.8, margin: 0 }}>{result.coachNote}</p>
        </div>
        <button onClick={() => onSimulation?.()} style={cta(false)}>Continue to Brand Analysis →</button>
      </div>
    );
  }

  return null;
}


// ─── D11 Simulation Widget ────────────────────────────────────────────────────
export function D11SimWidget({ T, T2, isDesktop, brandWords = [], onFinish }) {

  const CHECK_ITEMS   = ["Positioning", "Leadership Signals", "Clarity", "Personal Brand", "Consistency"];
  const REWRITE_ITEMS = ["Headline", "About Section", "Experience Bullets"];

  const [phase,          setPhase]         = useState('import');
  const [inputMode,      setInputMode]     = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("au1_toolkits") || "[]");
      return stored.some(t => t.source === 'brand-rehearsal') ? 'summary' : 'paste';
    } catch { return 'paste'; }
  });
  const [profileText,    setProfileText]   = useState('');
  const [cvText,         setCvText]        = useState('');
  const [screenshots,    setScreenshots]   = useState([]);
  const [extracting,     setExtracting]    = useState(false);
  const [checkIdx,       setCheckIdx]      = useState(-1);
  const [analysisResult, setAnalysisResult]= useState(null);
  const [analysisFallback, setAnalysisFallback] = useState(false);
  const [rewriteCheckIdx,setRewriteCheckIdx]=useState(-1);
  const [copied,         setCopied]        = useState({});
  const [cvPhase,        setCvPhase]       = useState('idle');
  const [cvResult,       setCvResult]      = useState('');

  // ── My Saved Toolkits — shares the au1_toolkits key with D11PracticeWidget,
  // but this source (linkedin-audit) is capped and listed independently.
  const TOOLKIT_CAP = 5;
  const isMineSim = t => t.source === 'linkedin-audit';
  const [savedToolkits, setSavedToolkits] = useState(() => {
    try { return JSON.parse(localStorage.getItem("au1_toolkits") || "[]"); } catch { return []; }
  });
  const myToolkitsSim = savedToolkits.filter(isMineSim);
  const latestRehearsalToolkit = savedToolkits.filter(t => t.source === 'brand-rehearsal')[0] || null;
  const [toolkitsOpen, setToolkitsOpen] = useState(false);
  const [pendingToolkit, setPendingToolkit] = useState(null);
  const [savedToolkitId, setSavedToolkitId] = useState(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  function saveToolkit(ar) {
    const entry = {
      id: Date.now(),
      source: 'linkedin-audit',
      headline: ar.rewrittenHeadline || '',
      about: ar.rewrittenAbout || '',
      experience: ar.rewrittenExperience || [],
      cv: '',
      timestamp: Date.now(),
    };
    if (myToolkitsSim.length >= TOOLKIT_CAP) {
      setPendingToolkit(entry);
      setSavedToolkitId(null);
      return;
    }
    const next = [entry, ...savedToolkits];
    setSavedToolkits(next);
    setSavedToolkitId(entry.id);
    try { localStorage.setItem("au1_toolkits", JSON.stringify(next)); } catch {}
  }

  function attachCvToToolkit(cvTextResult) {
    if (pendingToolkit) {
      setPendingToolkit(p => p ? { ...p, cv: cvTextResult } : p);
      return;
    }
    if (!savedToolkitId) return;
    setSavedToolkits(prev => {
      const next = prev.map(t => t.id === savedToolkitId ? { ...t, cv: cvTextResult } : t);
      try { localStorage.setItem("au1_toolkits", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function deleteToolkit(id) {
    setSavedToolkits(prev => {
      let next = prev.filter(t => t.id !== id);
      let freedForPending = false;
      if (pendingToolkit && next.filter(isMineSim).length < TOOLKIT_CAP) {
        next = [pendingToolkit, ...next];
        freedForPending = true;
      }
      try { localStorage.setItem("au1_toolkits", JSON.stringify(next)); } catch {}
      if (freedForPending) { setSavedToolkitId(pendingToolkit.id); setPendingToolkit(null); }
      return next;
    });
  }

  const checkRef   = useRef(null);
  const rewriteRef = useRef(null);

  const savedSig  = (() => { try { return localStorage.getItem('d11Sig')  || ''; } catch(_) { return ''; } })();
  const futureWords = (brandWords || []).filter(w => w && w.trim().length > 0);

  const hasProfile = inputMode === 'paste'
    ? profileText.trim().length > 20
    : inputMode === 'screenshot'
      ? screenshots.length > 0
      : inputMode === 'summary'
        ? !!latestRehearsalToolkit
        : cvText.trim().length > 20;

  const sn  = { fontFamily: T.sans };
  const sf  = { fontFamily: T.serif, color: T2.text };
  const lbl = { ...sn, fontSize: 9, fontWeight: 700, color: T2.text4, textTransform: "uppercase", letterSpacing: "2px" };

  function cta(disabled) {
    return {
      width: "100%", padding: "15px", borderRadius: 4, border: "none",
      background: disabled ? "rgba(44,36,22,0.15)" : (T.ink || "#2C2416"),
      color: disabled ? "rgba(44,36,22,0.3)" : (T2.bg || "#F7F3EC"),
      fontSize: isDesktop ? 14 : 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: T.sans, minHeight: 48, transition: "all 0.2s",
    };
  }

  function alignLabel(score) {
    if (score >= 75) return "Excellent Alignment";
    if (score >= 50) return "Strong Foundation";
    return "Needs Positioning";
  }
  function alignColor(score) {
    if (score >= 75) return "#7A9E84";
    if (score >= 50) return T.gold;
    return "rgba(200,100,80,0.8)";
  }

  function copyItem(key, text) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(p => ({ ...p, [key]: true }));
      setTimeout(() => setCopied(p => ({ ...p, [key]: false })), 2200);
    });
  }

  async function handleScreenshots(files) {
    setExtracting(true);
    const loaded = await Promise.all(Array.from(files).map(f => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve({ file: f, dataUrl: e.target.result });
      reader.readAsDataURL(f);
    })));
    setScreenshots(loaded);
    setExtracting(false);
  }

  async function getProfileContent() {
    if (inputMode === 'paste')   return profileText;
    if (inputMode === 'cv')      return cvText;
    if (inputMode === 'summary') return latestRehearsalToolkit ? [latestRehearsalToolkit.signature, latestRehearsalToolkit.statement].filter(Boolean).join('\n\n') : '';
    if (inputMode === 'screenshot' && screenshots.length > 0) {
      try {
        const imageBlocks = screenshots.slice(0, 4).map(s => ({
          type: "image",
          source: { type: "base64", media_type: s.file.type || "image/jpeg", data: s.dataUrl.split(',')[1] },
        }));
        const res = await fetch("/api/claude", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 1000, messages: [{ role: "user", content: [...imageBlocks, { type: "text", text: "Extract all text from these LinkedIn screenshots. Return just the text exactly as it appears — headline, about section, experience." }] }] }),
        });
        const data = await res.json();
        return (data.content || []).map(b => b.text || '').join('').trim();
      } catch (_) { return ''; }
    }
    return '';
  }

  async function runAnalysis() {
    setPhase('analyzing');
    setCheckIdx(-1);
    setAnalysisFallback(false);
    checkRef.current = setInterval(() => {
      setCheckIdx(i => Math.min(i + 1, CHECK_ITEMS.length - 1));
    }, 800);

    const profileContent = await getProfileContent();
    const sig = savedSig || (futureWords.length > 0 ? `Known for: ${futureWords.join(', ')}` : 'a strategic professional');
    const prompt = `You are an elite personal brand strategist.

Professional Signature: ${futureWords.length > 0 ? futureWords.join(', ') : 'strategic, trusted, impactful'}
${savedSig ? `Full Signature: "${savedSig}"` : ''}

LinkedIn Profile:
${profileContent || '(no profile provided — use professional general context)'}

Analyse whether this LinkedIn profile communicates their Professional Signature.
Keep all signals short (3-5 words). Be specific, not generic.

Return ONLY valid JSON:
{
  "alignmentScore": <integer 0-100>,
  "currentSignals": ["<3-5 word phrase>", "<3-5 word phrase>", "<3-5 word phrase>"],
  "missingSignals": ["<3-5 word phrase>", "<3-5 word phrase>", "<3-5 word phrase>", "<3-5 word phrase>"],
  "rewrittenHeadline": "<powerful headline under 200 chars that embodies their signature>",
  "rewrittenAbout": "<3 short paragraphs. First person. Strategic, specific, authentic. Reference their signature. Translate any company-specific jargon into transferable language. Separate with \\n\\n>",
  "rewrittenExperience": ["<impactful bullet>", "<impactful bullet>", "<impactful bullet>", "<impactful bullet>"]
}`;

    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const raw = (data.content || []).map(b => b.text || '').join('').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error();
      const parsed = JSON.parse(m[0]);
      clearInterval(checkRef.current);
      setCheckIdx(CHECK_ITEMS.length - 1);
      setTimeout(() => { setAnalysisResult(parsed); setPhase('results'); }, 600);
    } catch (_) {
      clearInterval(checkRef.current);
      setCheckIdx(CHECK_ITEMS.length - 1);
      setAnalysisFallback(true);
      setTimeout(() => {
        setAnalysisResult({
          alignmentScore: 54,
          currentSignals: ["Reliable delivery", "Strong execution", "Technical experience"],
          missingSignals: ["Strategic thinking", "Leadership presence", "Industry expertise", "Thought leadership"],
          rewrittenHeadline: `${futureWords[0] || 'Strategic'} professional | ${futureWords[1] || 'Trusted'} advisor | Creating lasting impact`,
          rewrittenAbout: `I help organisations move forward with clarity and confidence. My work sits at the intersection of strategy and execution — I translate ambitious goals into outcomes that actually happen.\n\nPeople come to me when they need someone who can hold the big picture and the detail simultaneously. Whether I'm advising a leadership team or driving a project from the ground up, I bring the same combination of rigour and care.\n\nI believe the best work happens when people feel supported and clear about where they're going. That's what I build.`,
          rewrittenExperience: [
            "Led cross-functional initiative delivering measurable impact across the organisation",
            "Advised senior stakeholders on strategic direction, influencing key decisions",
            "Built trusted relationships across teams and external partners",
            "Translated complex challenges into clear recommendations with lasting results",
          ],
        });
        setPhase('results');
      }, 600);
    }
  }

  function runRewrite() {
    setPhase('rewriting');
    setRewriteCheckIdx(-1);
    let i = -1;
    rewriteRef.current = setInterval(() => {
      i++;
      setRewriteCheckIdx(i);
      if (i >= REWRITE_ITEMS.length - 1) {
        clearInterval(rewriteRef.current);
        setTimeout(() => {
          if (analysisResult && !analysisFallback) saveToolkit(analysisResult);
          setPhase('toolkit');
        }, 500);
      }
    }, 850);
  }

  async function runCvRewrite() {
    setCvPhase('rewriting');
    const sig = savedSig || (futureWords.length > 0 ? `Known for: ${futureWords.join(', ')}` : 'a strategic professional');
    const prompt = `You are rewriting this professional's CV to align with their Personal Signature.

Professional Signature: ${futureWords.join(', ')}
${savedSig ? `Full Signature: "${savedSig}"` : ''}

${cvText ? `Original CV content:\n${cvText}` : 'Generate a strong professional CV template.'}

${analysisResult ? `Their LinkedIn has already been rewritten with this headline: "${analysisResult.rewrittenHeadline}"` : ''}

Rewrite/generate a CV summary that:
- Uses the same positioning as their LinkedIn
- Leads with their Professional Signature
- Highlights measurable impact
- Translates company-specific jargon into transferable language
- Feels consistent with their personal brand

Return as formatted plain text:

PROFESSIONAL SUMMARY
[2-3 sentences]

KEY ACHIEVEMENTS
• [achievement]
• [achievement]
• [achievement]
• [achievement]
• [achievement]

SKILLS & EXPERTISE
[6-8 skills, comma separated]

Keep it under 280 words. Make every word earn its place.`;

    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 600, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = (data.content || []).map(b => b.text || '').join('').trim();
      setCvResult(text);
      attachCvToToolkit(text);
      setCvPhase('done');
    } catch (_) {
      setCvResult(`PROFESSIONAL SUMMARY\n${sig}\n\nKEY ACHIEVEMENTS\n• Led high-impact initiatives with measurable outcomes\n• Built trusted relationships across leadership and operational teams\n• Translated complex challenges into clear, actionable strategies\n• Delivered results balancing short-term execution with long-term vision\n• Brought clarity and direction to ambiguous situations\n\nSKILLS & EXPERTISE\nStrategic Planning · Stakeholder Engagement · Project Leadership · Clear Communication · Problem Solving · Cross-functional Collaboration`);
      setCvPhase('done');
    }
  }

  // ── IMPORT ────────────────────────────────────────────────────────────────
  if (phase === 'import') {
    const tabs = [
      { id: 'summary',    label: 'My Rehearsal',        recommended: true  },
      { id: 'screenshot', label: 'Upload Screenshots',  recommended: false },
      { id: 'cv',         label: 'Upload CV',           recommended: false },
    ];
    // Same completion signal already used to gate the "My Rehearsal" tab/default
    // above (a real, non-fallback Rehearsal result — saveBrandRehearsal only
    // ever fires on the success path in D11PracticeWidget.runAnalysis).
    const rehearsalReady = !!latestRehearsalToolkit;
    const howItWorksStep = rehearsalReady ? 2 : 1;
    const targetTabId = tabs.some(t => t.id === inputMode) ? inputMode : (rehearsalReady ? 'summary' : 'screenshot');
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 18 : 16, animation: "fadeUp 0.5s ease both" }}>

        {/* HOW IT WORKS — dynamic progress indicator, checkmark style matches the top step-progress bar */}
        <div style={{ background: T2.surface || "rgba(255,255,255,0.025)", borderRadius: 4, border: "0.5px solid " + T2.border, padding: isDesktop ? "22px 24px" : "18px 20px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 6 }}>How it works</div>
          <h2 style={{ fontFamily: T.serif, fontSize: isDesktop ? 28 : 22, fontWeight: 600, color: T2.text, lineHeight: 1.2, marginBottom: isDesktop ? 20 : 16 }}>Four steps to a brand-aligned LinkedIn.</h2>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
            {[
              { n: 1, label: "Rehearsal feeds your brand insight", icon: c => <svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={c} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2M8 19h6" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg> },
              { n: 2, label: "Add your LinkedIn or CV",            icon: c => <svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="3" y="4" width="16" height="14" rx="2" stroke={c} strokeWidth="1.3"/><circle cx="8" cy="10" r="2" stroke={c} strokeWidth="1.3"/><path d="M5 15c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M13 8h3M13 11h3" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg> },
              { n: 3, label: "AI audits it against your brand",    icon: c => <svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><circle cx="10" cy="10" r="6" stroke={c} strokeWidth="1.3"/><path d="M14.5 14.5L19 19" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M7.5 10l1.5 1.5 3-3" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { n: 4, label: "Get your improved brand toolkit",    icon: c => <svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M11 2l1.8 3.7 4.1.6-3 2.9.7 4.1L11 11.3 7.4 13.3l.7-4.1-3-2.9 4.1-.6L11 2z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg> },
            ].map((s, i) => {
              const status = s.n < howItWorksStep ? 'done' : s.n === howItWorksStep ? 'active' : 'upcoming';
              const iconColor   = status === 'upcoming' ? T2.text4 : T.gold;
              const circleBg    = status === 'done' ? "rgba(200,164,106,0.15)" : status === 'active' ? "rgba(200,164,106,0.09)" : "transparent";
              const circleBorder= status === 'upcoming' ? T2.border : T.gold;
              const numColor    = status === 'upcoming' ? T2.text4 : T.gold;
              const labelColor  = status === 'active' ? T.gold : status === 'upcoming' ? T2.text4 : T2.text2;
              const lineCol     = status === 'upcoming' ? "rgba(138,158,132,0.12)" : "rgba(138,158,132,0.2)";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, opacity: status === 'upcoming' ? 0.5 : 1, transition: "opacity 0.3s" }}>
                    <div style={{ width: isDesktop?48:36, height: isDesktop?48:36, borderRadius: "50%", background: circleBg, border: `${status === 'active' ? 1.5 : 0.5}px solid ${circleBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: isDesktop?8:6, boxShadow: status === 'active' ? "0 0 0 3px rgba(200,164,106,0.12)" : "none", transition: "all 0.3s" }}>
                      {status === 'done'
                        ? <svg width={isDesktop?16:13} height={isDesktop?16:13} viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 4" stroke={T.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : s.icon(iconColor)}
                    </div>
                    <div style={{ fontFamily: T.sans, fontSize: isDesktop?9:8, fontWeight: 700, color: numColor, marginBottom: 3 }}>{s.n}</div>
                    <div style={{ fontFamily: T.sans, fontSize: isDesktop?12:9, color: labelColor, fontWeight: status === 'active' ? 700 : 400, textAlign: "center", lineHeight: 1.3, maxWidth: isDesktop?76:52 }}>{s.label}</div>
                    {status === 'active' && s.n === 2 && (
                      <span style={{ fontFamily: T.sans, fontSize: isDesktop?12:10, color: T.gold, marginTop: 3, lineHeight: 1 }} aria-hidden="true">↓</span>
                    )}
                  </div>
                  {i < 3 && <div style={{ height: 1, width: isDesktop?12:5, background: lineCol, flexShrink: 0, marginBottom: isDesktop?30:24 }}/>}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ ...lbl, color: T.gold, marginBottom: 10, letterSpacing: "2px", fontSize: 10 }}>LINKEDIN AUDIT</div>
          <h2 style={{ ...sf, fontSize: isDesktop ? 28 : 22, fontWeight: 600, margin: "0 0 8px", lineHeight: 1.15 }}>Bring your brand to life</h2>
          <p style={{ ...sn, fontSize: isDesktop ? 14 : 13, color: T2.text3, lineHeight: 1.6, margin: 0 }}>
            {"We've discovered what makes you memorable. Now let's make sure your LinkedIn tells the same story."}
          </p>
        </div>

        {myToolkitsSim.length>0 && (
          <div style={{background:T2.surface||"rgba(255,255,255,0.025)",borderRadius:8,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
            <button onClick={()=>setToolkitsOpen(v=>!v)} style={{width:"100%",background:"none",border:"none",padding:isDesktop?"14px 18px":"12px 16px",cursor:"pointer",fontFamily:T.sans,fontSize:12,color:T2.text3,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span>My Saved Toolkits ({myToolkitsSim.length})</span>
              <span style={{fontSize:14,opacity:0.6,transform:toolkitsOpen?"rotate(180deg)":"none",display:"inline-block",transition:"transform 0.2s"}}>▾</span>
            </button>
            {toolkitsOpen && (
              <div style={{display:"flex",flexDirection:"column",borderTop:"0.5px solid "+T2.border}}>
                {myToolkitsSim.map(t=>(
                  <div key={t.id} style={{display:"flex",alignItems:"stretch",borderBottom:"0.5px solid "+T2.border}}>
                    <div style={{flex:1,minWidth:0,padding:isDesktop?"12px 18px":"11px 16px",display:"flex",flexDirection:"column",gap:2}}>
                      <span style={{fontFamily:T.serif,fontSize:isDesktop?15:14,color:T2.text,fontWeight:500}}>{t.headline || "Untitled toolkit"}</span>
                      <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>{new Date(t.timestamp).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}{t.cv ? " · CV included" : ""}</span>
                    </div>
                    <button onClick={()=>deleteToolkit(t.id)} title="Delete" style={{background:"none",border:"none",cursor:"pointer",color:T2.text4,fontSize:18,fontFamily:T.sans,padding:"0 16px",flexShrink:0,lineHeight:1}}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {pendingToolkit && (
          <div style={{background:"rgba(176,92,74,0.06)",borderRadius:6,border:"0.5px solid rgba(176,92,74,0.2)",padding:"10px 16px"}}>
            <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>You've reached your limit of {TOOLKIT_CAP} saved toolkits. This one won't be saved until you delete one above.</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 6, marginBottom: -2 }}>
          {tabs.map(tab => (
            <div key={tab.id} style={{ flex: 1, display: "flex", justifyContent: "center", visibility: tab.id === targetTabId ? "visible" : "hidden" }}>
              <span style={{ fontSize: isDesktop ? 13 : 11, color: T.gold, lineHeight: 1 }} aria-hidden="true">▾</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setInputMode(inputMode === tab.id ? 'paste' : tab.id)}
              style={{ flex: 1, padding: isDesktop ? "10px 6px" : "8px 4px", borderRadius: 4, border: `0.5px solid ${inputMode === tab.id ? T.gold : T2.border}`, background: inputMode === tab.id ? "rgba(200,164,106,0.07)" : "transparent", fontFamily: T.sans, fontSize: isDesktop ? 11 : 10, fontWeight: inputMode === tab.id ? 600 : 400, color: inputMode === tab.id ? T.gold : T2.text3, cursor: "pointer", transition: "all 0.15s", position: "relative", lineHeight: 1.3 }}>
              {tab.label}
              {tab.recommended && <span style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", fontSize: 8, background: "#4a7c59", color: "#fff", padding: "2px 7px", borderRadius: 10, fontWeight: 700, letterSpacing: "0.4px", whiteSpace: "nowrap" }}>Recommended</span>}
            </button>
          ))}
        </div>

        {inputMode === 'paste' && (
          <textarea
            value={profileText}
            onChange={e => setProfileText(e.target.value)}
            placeholder={"Paste your LinkedIn profile content here...\n\nHeadline:\ne.g. Senior Marketing Manager | Brand Strategy | Consumer Insights\n\nAbout:\ne.g. I help brands find their voice and connect with the people who matter most...\n\nExperience:\ne.g. Marketing Manager at Acme Corp (2020-present)\n- Led rebranding campaign reaching 2M+ customers\n- Managed cross-functional team of 12 across 3 regions"}
            rows={isDesktop ? 8 : 6}
            style={{ width: "100%", background: "rgba(44,36,22,0.05)", border: "1px solid rgba(44,36,22,0.2)", borderRadius: 6, padding: "14px 16px", fontFamily: T.sans, fontSize: isDesktop ? 13 : 12, color: T2.text, resize: "vertical", outline: "none", lineHeight: 1.65, boxSizing: "border-box" }}
          />
        )}

        {inputMode === 'summary' && (
          <div style={{ animation: "fadeUp 0.25s ease both" }}>
            {latestRehearsalToolkit ? (
              <div style={{ background: "rgba(200,164,106,0.06)", border: "1px solid rgba(200,164,106,0.25)", borderRadius: 6, padding: "16px 18px" }}>
                <div style={{ ...lbl, color: "rgba(200,164,106,0.6)", marginBottom: 10 }}>Your Professional Signature</div>
                <p style={{ ...sn, fontSize: isDesktop ? 14 : 13, color: T2.text, lineHeight: 1.65, margin: 0 }}>{latestRehearsalToolkit.signature}</p>
                {latestRehearsalToolkit.statement && <p style={{ ...sn, fontSize: isDesktop ? 13 : 12, color: T2.text3, lineHeight: 1.6, marginTop: 10, fontStyle: "italic" }}>{latestRehearsalToolkit.statement}</p>}
              </div>
            ) : (
              <div style={{ background: "rgba(44,36,22,0.03)", border: "1px dashed rgba(44,36,22,0.15)", borderRadius: 6, padding: "24px 20px", textAlign: "center" }}>
                <p style={{ ...sn, fontSize: 13, color: T2.text3, lineHeight: 1.6, margin: 0 }}>Complete the Rehearsal step first to generate your Professional Signature.</p>
              </div>
            )}
          </div>
        )}

        {inputMode === 'screenshot' && (
          <div style={{ animation: "fadeUp 0.25s ease both" }}>
            <label style={{ display: "block", border: "1px dashed rgba(44,36,22,0.2)", borderRadius: 6, padding: isDesktop ? "32px 20px" : "24px 16px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s", background: "rgba(44,36,22,0.03)" }}>
              <input type="file" accept="image/*" multiple onChange={e => handleScreenshots(e.target.files)} style={{ display: "none" }} />
              {screenshots.length === 0 ? (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 10, opacity: 0.4 }}><rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M9 6V5a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <div style={{ ...sn, fontSize: isDesktop ? 13 : 12, color: T2.text3, marginBottom: 4 }}>Upload LinkedIn screenshots</div>
                  <div style={{ ...sn, fontSize: 11, color: T2.text4 }}>Headline · About · Experience</div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 10 }}>
                    {screenshots.map((s, i) => (
                      <img loading="lazy" key={i} src={s.dataUrl} alt="" style={{ height: 60, width: 90, objectFit: "cover", borderRadius: 4, border: "0.5px solid " + T2.border }} />
                    ))}
                  </div>
                  <div style={{ ...sn, fontSize: 11, color: T.gold }}>{screenshots.length} screenshot{screenshots.length > 1 ? "s" : ""} ready · tap to change</div>
                </>
              )}
            </label>
            {extracting && <p style={{ ...sn, fontSize: 11, color: T2.text4, textAlign: "center", marginTop: 8 }}>Processing...</p>}
          </div>
        )}

        {inputMode === 'cv' && (
          <div style={{ animation: "fadeUp 0.25s ease both" }}>
            <div style={{ ...sn, fontSize: 11, color: T2.text4, marginBottom: 8 }}>Copy and paste from your PDF or Word document</div>
            <textarea
              value={cvText}
              onChange={e => setCvText(e.target.value)}
              placeholder="Paste your CV content here..."
              rows={isDesktop ? 8 : 7}
              style={{ width: "100%", background: "rgba(44,36,22,0.05)", border: "1px solid rgba(44,36,22,0.2)", borderRadius: 6, padding: "14px 16px", fontFamily: T.sans, fontSize: isDesktop ? 13 : 12, color: T2.text, resize: "vertical", outline: "none", lineHeight: 1.65, boxSizing: "border-box" }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <button onClick={runAnalysis} disabled={!hasProfile} style={{ ...cta(!hasProfile), flex: 1 }}>
            {"✦  Analyse My LinkedIn →"}
          </button>
          <button onClick={() => setPrivacyOpen(v => !v)} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, background: privacyOpen ? "rgba(44,36,22,0.08)" : "rgba(44,36,22,0.04)", border: "0.5px solid rgba(44,36,22,0.12)", borderRadius: 6, padding: "10px 16px", flexShrink: 0, cursor: "pointer", fontFamily: T.sans }}>
            <svg width="16" height="18" viewBox="0 0 16 20" fill="none" style={{ opacity: 0.55 }}>
              <path d="M8 1L1 4v6c0 5 3.5 8.5 7 9.5C11.5 18.5 15 15 15 10V4L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M5 10l2.5 2.5L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ ...sn, fontSize: 10, color: T2.text3, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>100% Private</span>
            <span style={{ ...sn, fontSize: 10, color: T2.text4, textAlign: "center", lineHeight: 1.3 }}>{privacyOpen ? "Tap to close" : "Never shared."}</span>
          </button>
        </div>

        {privacyOpen && (
          <div style={{ background: "rgba(44,36,22,0.04)", border: "0.5px solid rgba(44,36,22,0.12)", borderRadius: 6, padding: isDesktop ? "14px 16px" : "12px 14px", animation: "fadeUp 0.25s ease both" }}>
            <p style={{ ...sn, fontSize: isDesktop ? 12 : 11, color: T2.text3, lineHeight: 1.6, margin: 0 }}>
              Your LinkedIn or CV content is only sent to generate your Brand Toolkit — it's never stored on our servers. Your finished toolkit is saved locally on your device only.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── ANALYZING ─────────────────────────────────────────────────────────────
  if (phase === 'analyzing') return (
    <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 28 : 22, padding: isDesktop ? "40px 0" : "32px 0", animation: "fadeUp 0.5s ease both" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <img loading="lazy" src="/logo-mark.png" alt="" style={{ width: 36, height: 36, objectFit: "cover", filter: "brightness(0.55) sepia(0.4)", animation: "breathe 2s ease infinite" }} />
        <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 20 : 17, fontStyle: "italic", color: T2.text, textAlign: "center", margin: 0, lineHeight: 1.45 }}>
          I'm comparing your profile with your Professional Signature...
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {CHECK_ITEMS.map((item, i) => {
          const done = i <= checkIdx;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: done ? 1 : 0.2, transform: done ? "translateX(0)" : "translateX(-8px)", transition: "all 0.4s ease", animation: done ? "fadeUp 0.3s ease both" : "none" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${done ? T.gold : T2.border}`, background: done ? "rgba(200,164,106,0.15)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" }}>
                {done && <span style={{ fontSize: 10, color: T.gold }}>✓</span>}
              </div>
              <span style={{ fontFamily: T.sans, fontSize: isDesktop ? 14 : 13, color: done ? T2.text : T2.text4, fontWeight: done ? 500 : 400, transition: "all 0.3s" }}>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (phase === 'results' && analysisResult) {
    const score = analysisResult.alignmentScore || 0;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 20 : 15, animation: "fadeUp 0.5s ease both" }}>
        <div>
          <div style={{ ...lbl, marginBottom: 8 }}>Brand Alignment</div>
          <div style={{ fontFamily: T.serif, fontSize: isDesktop ? 32 : 26, fontWeight: 700, color: alignColor(score), lineHeight: 1, marginBottom: 6 }}>{alignLabel(score)}</div>
          {savedSig && <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 14 : 13, color: T2.text4, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>"{savedSig.slice(0, 120)}{savedSig.length > 120 ? '...' : ''}"</p>}
        </div>

        <div style={{ height: "0.5px", background: T2.divider }} />

        <div>
          <div style={{ ...lbl, marginBottom: 12 }}>Your LinkedIn currently communicates</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(analysisResult.currentSignals || []).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: T2.text4, flexShrink: 0 }} />
                <span style={{ fontFamily: T.sans, fontSize: isDesktop ? 13 : 12, color: T2.text3 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ ...lbl, marginBottom: 12, color: T.gold }}>Missing signals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(analysisResult.missingSignals || []).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(200,164,106,0.5)", flexShrink: 0 }} />
                <span style={{ fontFamily: T.sans, fontSize: isDesktop ? 13 : 12, color: T2.text3 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={runRewrite} style={cta(false)}>Rewrite My LinkedIn →</button>
        <button onClick={() => setPhase('import')} style={{ background: "none", border: "none", fontFamily: T.sans, fontSize: 13, color: T2.text4, cursor: "pointer", padding: "4px 0", textAlign: "left" }}>← Back</button>
      </div>
    );
  }

  // ── REWRITING ─────────────────────────────────────────────────────────────
  if (phase === 'rewriting') return (
    <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 28 : 22, padding: isDesktop ? "40px 0" : "32px 0", animation: "fadeUp 0.5s ease both" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <img loading="lazy" src="/logo-mark.png" alt="" style={{ width: 36, height: 36, objectFit: "cover", filter: "brightness(0.55) sepia(0.4)", animation: "breathe 2s ease infinite" }} />
        <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 20 : 17, fontStyle: "italic", color: T2.text, textAlign: "center", margin: 0, lineHeight: 1.45 }}>
          Rewriting your LinkedIn...
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {REWRITE_ITEMS.map((item, i) => {
          const done = i <= rewriteCheckIdx;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: done ? 1 : 0.2, transform: done ? "translateX(0)" : "translateX(-8px)", transition: "all 0.4s ease" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${done ? T.gold : T2.border}`, background: done ? "rgba(200,164,106,0.15)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" }}>
                {done && <span style={{ fontSize: 10, color: T.gold }}>✓</span>}
              </div>
              <span style={{ fontFamily: T.sans, fontSize: isDesktop ? 14 : 13, color: done ? T2.text : T2.text4, fontWeight: done ? 500 : 400, transition: "all 0.3s" }}>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TOOLKIT ───────────────────────────────────────────────────────────────
  if (phase === 'toolkit' && analysisResult) {
    const cardStyle = { background: T2.surface, borderRadius: 6, border: "0.5px solid " + T2.border, padding: isDesktop ? "18px 20px" : "14px 15px" };
    function CopyBtn({ id, text }) {
      return (
        <button onClick={() => copyItem(id, text)} style={{ padding: "5px 13px", borderRadius: 3, border: `0.5px solid ${T.gold}`, background: copied[id] ? "rgba(138,158,132,0.12)" : "transparent", color: T.gold, fontSize: 11, fontFamily: T.sans, cursor: "pointer", fontWeight: 600, transition: "all 0.2s", flexShrink: 0 }}>
          {copied[id] ? "Copied ✓" : "Copy"}
        </button>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 16 : 13, animation: "fadeUp 0.5s ease both" }}>
        <div>
          <div style={{ ...lbl, marginBottom: 6 }}>Your Brand Toolkit</div>
          <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 22 : 18, fontWeight: 600, color: T2.text, margin: 0, lineHeight: 1.2 }}>Everything now tells the same story.</p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#7A9E84" }}>✓</span>
              <span style={{ ...sn, fontSize: 9, fontWeight: 700, color: T2.text4, textTransform: "uppercase", letterSpacing: "1.5px" }}>Updated LinkedIn Headline</span>
            </div>
            <CopyBtn id="hl" text={analysisResult.rewrittenHeadline || ''} />
          </div>
          <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 16 : 14, fontWeight: 600, color: T2.text, lineHeight: 1.4, margin: 0 }}>{analysisResult.rewrittenHeadline}</p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#7A9E84" }}>✓</span>
              <span style={{ ...sn, fontSize: 9, fontWeight: 700, color: T2.text4, textTransform: "uppercase", letterSpacing: "1.5px" }}>Updated About Section</span>
            </div>
            <CopyBtn id="ab" text={analysisResult.rewrittenAbout || ''} />
          </div>
          <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 14 : 13, color: T2.text3, lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{analysisResult.rewrittenAbout}</p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#7A9E84" }}>✓</span>
              <span style={{ ...sn, fontSize: 9, fontWeight: 700, color: T2.text4, textTransform: "uppercase", letterSpacing: "1.5px" }}>Updated Experience</span>
            </div>
            <CopyBtn id="ex" text={(analysisResult.rewrittenExperience || []).map(b => `• ${b}`).join('\n')} />
          </div>
          {(analysisResult.rewrittenExperience || []).map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: i < (analysisResult.rewrittenExperience.length - 1) ? 8 : 0 }}>
              <span style={{ color: T.gold, fontSize: 12, flexShrink: 0, marginTop: 2 }}>→</span>
              <span style={{ fontFamily: T.sans, fontSize: isDesktop ? 13 : 12, color: T2.text3, lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>

        {cvPhase === 'idle' && (
          <div style={{ borderTop: "0.5px solid " + T2.divider, paddingTop: 14 }}>
            <p style={{ ...sn, fontSize: isDesktop ? 13 : 12, color: T2.text4, margin: "0 0 10px" }}>Need your CV updated too?</p>
            <button onClick={runCvRewrite}
              style={{ padding: "11px 20px", borderRadius: 4, border: `0.5px solid ${T2.border}`, background: "transparent", fontFamily: T.sans, fontSize: isDesktop ? 13 : 12, color: T2.text3, cursor: "pointer", fontWeight: 500, transition: "all 0.2s" }}>
              Update My CV →
            </button>
          </div>
        )}

        {cvPhase === 'rewriting' && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", animation: "fadeUp 0.3s ease both" }}>
            <img loading="lazy" src="/logo-mark.png" alt="" style={{ width: 20, height: 20, objectFit: "cover", filter: "brightness(0.55) sepia(0.4)", animation: "breathe 2s ease infinite" }} />
            <span style={{ fontFamily: T.serif, fontSize: isDesktop ? 14 : 13, color: T2.text3, fontStyle: "italic" }}>Updating your CV...</span>
          </div>
        )}

        {cvPhase === 'done' && cvResult && (
          <div style={{ ...cardStyle, animation: "fadeUp 0.4s ease both" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#7A9E84" }}>✓</span>
                <span style={{ ...sn, fontSize: 9, fontWeight: 700, color: T2.text4, textTransform: "uppercase", letterSpacing: "1.5px" }}>Updated CV</span>
              </div>
              <CopyBtn id="cv" text={cvResult} />
            </div>
            <p style={{ fontFamily: T.sans, fontSize: isDesktop ? 13 : 12, color: T2.text3, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{cvResult}</p>
          </div>
        )}

        <div style={{ borderLeft: "2px solid rgba(200,164,106,0.22)", paddingLeft: 14, marginTop: 4 }}>
          <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 15 : 13, fontStyle: "italic", color: T2.text3, lineHeight: 1.75, margin: 0 }}>
            Great brands are consistent. Whether someone reads your LinkedIn, your CV or meets you in person, they should come away with the same impression. That's how reputations are built.
          </p>
        </div>

        <button onClick={() => onFinish?.()} style={cta(false)}>Finish Module →</button>
      </div>
    );
  }

  return null;
}
