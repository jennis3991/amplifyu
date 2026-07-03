import { useState, useEffect, useRef } from 'react';

// ─── D11 Rehearsal Widget — AI Coaching Conversation ─────────────────────────

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

export function D11PracticeWidget({ T, T2, isDesktop, onWordsChange }) {
  // phase: intro | question | recording | ack | analyzing | results
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

  const recognitionRef  = useRef(null);
  const timerRef        = useRef(null);
  const analysisMsgRef  = useRef(null);
  const liveTextRef     = useRef('');

  const speechAvailable = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (result?.strengths?.length > 0 && onWordsChange) {
      onWordsChange(result.strengths.slice(0, 3).map(s => s.toLowerCase()));
    }
  }, [result]);

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
    const updated = [...transcripts];
    updated[qIdx] = text || '';
    setTranscripts(updated);
    setLiveText('');
    liveTextRef.current = '';
    setTextAnswer('');
    if (qIdx < 2) {
      setPhase('ack');
      setTimeout(() => { setQIdx(i => i + 1); setPhase('question'); }, 2600);
    } else {
      setPhase('analyzing');
      runAnalysis(updated);
    }
  }

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setUseText(true); return; }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + ' ';
      const trimmed = t.trim();
      liveTextRef.current = trimmed;
      setLiveText(trimmed);
    };
    recognition.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        clearInterval(timerRef.current);
        if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (_) {} recognitionRef.current = null; }
        setUseText(true);
        setPhase('question');
      }
    };
    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (_) {
      setUseText(true);
      return;
    }

    setPhase('recording');
    const duration = QUESTIONS[qIdx].duration;
    setTimer(duration);
    let t = duration;
    timerRef.current = setInterval(() => {
      t--;
      setTimer(t);
      if (t <= 0) { clearInterval(timerRef.current); stopRecording(); }
    }, 1000);
  }

  function stopRecording() {
    clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    submitAnswer(liveTextRef.current);
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

Based on their responses, identify their professional signature. Focus on HOW they work and the unique value they create — not their job title.

Return ONLY valid JSON with this structure:
{
  "signature": "<2-3 sentence paragraph. Warm, specific, second person. Describes their unique professional identity and the value they create.>",
  "strengths": ["<2-4 word label>", "<2-4 word label>", "<2-4 word label>", "<2-4 word label>", "<2-4 word label>"],
  "statement": "<One sentence, in quotes, 15-25 words. Written as if a sponsor is introducing them.>",
  "coachNote": "<2-3 sentences. Warm coaching insight. Reference something specific from what they said. What stood out. What to build on.>"
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
      clearInterval(analysisMsgRef.current);
      setTimeout(() => { setResult(parsed); setPhase('results'); }, 700);
    } catch (_) {
      clearInterval(analysisMsgRef.current);
      setTimeout(() => {
        setResult({
          signature: "You bring a distinctive combination of clarity and care to everything you do. People rely on you not just for your expertise, but for your ability to cut through complexity and help others move forward with confidence. Your professional identity is built on earned trust.",
          strengths: ["Clear Thinking", "Trusted Judgement", "Calm Leadership", "Practical Expertise", "Building Trust"],
          statement: '"The person others turn to when clarity and calm matter most."',
          coachNote: "What came through was the trust others place in you — that's not something you can manufacture, it's earned. That quiet reliability is a powerful brand foundation. Everything we build next will amplify that so it becomes unmistakable.",
        });
        setPhase('results');
      }, 700);
    }
  }

  // Shared styles
  const sf = { fontFamily: T.serif, color: T2.text };
  const sn = { fontFamily: T.sans };
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

  function ProgressBar() {
    return (
      <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            height: 2, flex: 1, borderRadius: 1,
            background: i <= qIdx ? T.gold : T2.border,
            opacity: i < qIdx ? 0.4 : 1,
            transition: "all 0.5s",
          }} />
        ))}
      </div>
    );
  }

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 26 : 20, animation: "fadeUp 0.5s ease both" }}>
      <div>
        <div style={{ ...lbl, marginBottom: 11, letterSpacing: "2.5px" }}>ALL STRONG BRANDS ARE KNOWN FOR SOMETHING</div>
        <h2 style={{ ...sf, fontSize: isDesktop ? 30 : 24, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>Let's find yours.</h2>
      </div>

      <div style={{ borderLeft: "2px solid " + T.gold, paddingLeft: 15, display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ ...sn, fontSize: isDesktop ? 14 : 13, color: T2.text3, lineHeight: 1.65, margin: 0 }}>
          Your personal brand isn't your job title. It's what people remember you for after you've left the room.
        </p>
        <p style={{ ...sn, fontSize: isDesktop ? 14 : 13, color: T2.text3, lineHeight: 1.65, margin: 0 }}>
          I'll ask you three simple questions. Just speak naturally — I'll identify the patterns and uncover your unique professional signature.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: isDesktop ? "26px 0" : "20px 0" }}>
        <div style={{
          width: isDesktop ? 80 : 68, height: isDesktop ? 80 : 68, borderRadius: "50%",
          background: T.ink || "#2C2416", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 0 14px rgba(200,164,106,0.06), 0 0 0 28px rgba(200,164,106,0.025)`,
        }}>
          <span style={{ fontSize: isDesktop ? 30 : 24 }}>🎙</span>
        </div>
        {!speechAvailable && (
          <p style={{ ...sn, fontSize: 11, color: T2.text4, textAlign: "center", margin: 0 }}>
            Voice not supported in this browser — you'll type your answers instead.
          </p>
        )}
      </div>

      <button onClick={() => { setQIdx(0); setPhase('question'); }} style={cta(false)}>
        Start Conversation →
      </button>
    </div>
  );

  // ── QUESTION ──────────────────────────────────────────────────────────────
  if (phase === 'question') {
    const showText = useText || !speechAvailable;
    const q = QUESTIONS[qIdx];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 20 : 15, animation: "fadeUp 0.4s ease both" }}>
        <ProgressBar />
        <div style={{ ...sn, fontSize: 10, fontWeight: 600, color: T2.text4, textTransform: "uppercase", letterSpacing: "1.5px" }}>
          Question {qIdx + 1} of 3
        </div>

        <h3 style={{ ...sf, fontSize: isDesktop ? 22 : 19, fontWeight: 600, lineHeight: 1.35, margin: 0 }}>{q.q}</h3>
        <p style={{ ...sn, fontSize: isDesktop ? 13 : 12, color: T2.text4, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{q.hint}</p>

        {showText ? (
          <>
            <textarea
              value={textAnswer}
              onChange={e => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={isDesktop ? 5 : 4}
              style={{
                width: "100%", background: "transparent", border: "none",
                borderBottom: "0.5px solid " + T2.divider, padding: "8px 0",
                fontFamily: T.serif, fontSize: isDesktop ? 16 : 14, color: T2.text,
                resize: "none", outline: "none", lineHeight: 1.7,
                boxSizing: "border-box", fontStyle: "italic",
              }}
            />
            <button onClick={() => submitAnswer(textAnswer)} disabled={textAnswer.trim().length < 8} style={cta(textAnswer.trim().length < 8)}>
              Next →
            </button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: isDesktop ? "18px 0" : "12px 0" }}>
            <button
              onClick={startRecording}
              style={{
                width: isDesktop ? 76 : 64, height: isDesktop ? 76 : 64, borderRadius: "50%",
                background: T.ink || "#2C2416", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 0 12px rgba(200,164,106,0.07)`,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
            >
              <span style={{ fontSize: isDesktop ? 28 : 22 }}>🎙</span>
            </button>
            <span style={{ ...sn, fontSize: 11, color: T2.text4 }}>Tap to speak</span>
            <button
              onClick={() => setUseText(true)}
              style={{ background: "none", border: "none", ...sn, fontSize: 11, color: T2.text4, cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              Type instead
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── RECORDING ─────────────────────────────────────────────────────────────
  if (phase === 'recording') {
    const q = QUESTIONS[qIdx];
    const sz = isDesktop ? 84 : 72;
    const r = sz / 2 - 4;
    const circ = 2 * Math.PI * r;
    const progress = 1 - (timer / q.duration);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 20 : 15, animation: "fadeUp 0.3s ease both" }}>
        <ProgressBar />
        <h3 style={{ ...sf, fontSize: isDesktop ? 18 : 16, fontWeight: 500, lineHeight: 1.35, margin: 0, color: T2.text3, fontStyle: "italic" }}>
          {q.q}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative", width: sz, height: sz }}>
            <svg width={sz} height={sz} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
              <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke={T2.border} strokeWidth="1.5" />
              <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke={T.gold} strokeWidth="2.5"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - progress)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <button
              onClick={stopRecording}
              style={{
                position: "absolute", top: 0, left: 0, width: sz, height: sz, borderRadius: "50%",
                background: "rgba(200,60,60,0.08)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "breathe 1.5s ease infinite",
              }}
            >
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
            <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 15 : 13, fontStyle: "italic", color: T2.text3, lineHeight: 1.75, margin: 0 }}>
              {liveText}
            </p>
          </div>
        ) : (
          <p style={{ ...sn, fontSize: 12, color: T2.text4, textAlign: "center", fontStyle: "italic", margin: 0 }}>Listening...</p>
        )}
      </div>
    );
  }

  // ── ACKNOWLEDGMENT ────────────────────────────────────────────────────────
  if (phase === 'ack') return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 20, padding: isDesktop ? "52px 12px" : "44px 0", animation: "fadeUp 0.45s ease both",
    }}>
      <img src="/logo-mark.png" alt=""
        style={{ width: 30, height: 30, objectFit: "cover", filter: "brightness(0.55) sepia(0.4)", animation: "breathe 2s ease infinite" }} />
      <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 22 : 18, fontStyle: "italic", color: T2.text, lineHeight: 1.5, textAlign: "center", margin: 0 }}>
        "{QUESTIONS[qIdx].ack}"
      </p>
    </div>
  );

  // ── ANALYZING ─────────────────────────────────────────────────────────────
  if (phase === 'analyzing') return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: isDesktop ? 28 : 22, padding: isDesktop ? "44px 0" : "32px 0",
      animation: "fadeUp 0.5s ease both",
    }}>
      <img src="/logo-mark.png" alt=""
        style={{ width: 38, height: 38, objectFit: "cover", filter: "brightness(0.55) sepia(0.4)", animation: "breathe 2s ease infinite" }} />
      <p style={{
        fontFamily: T.serif, fontSize: isDesktop ? 22 : 18, fontStyle: "italic",
        color: T2.text, textAlign: "center", margin: 0, lineHeight: 1.45,
        minHeight: isDesktop ? 64 : 52,
      }}>
        {ANALYSIS_MSGS[analysisMsgIdx]}
      </p>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        {ANALYSIS_MSGS.map((_, i) => (
          <div key={i} style={{
            height: 2, borderRadius: 1,
            background: T2.border, overflow: "hidden",
            opacity: i <= analysisMsgIdx ? 1 : 0.15,
            transition: "opacity 0.5s",
          }}>
            <div style={{
              height: "100%", borderRadius: 1,
              background: `linear-gradient(to right, rgba(200,164,106,0.45), ${T.gold})`,
              width: i < analysisMsgIdx ? "100%" : i === analysisMsgIdx ? "52%" : "0%",
              transition: "width 1.8s ease",
            }} />
          </div>
        ))}
      </div>
    </div>
  );

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (phase === 'results' && result) {
    const strengths = (result.strengths || []).slice(0, 5);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 22 : 16, animation: "fadeUp 0.5s ease both" }}>

        <div>
          <div style={{ ...lbl, marginBottom: 10 }}>YOUR PROFESSIONAL SIGNATURE</div>
          <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 17 : 15, color: T2.text, lineHeight: 1.8, margin: 0 }}>
            {result.signature}
          </p>
        </div>

        <div>
          <div style={{ ...lbl, marginBottom: 13 }}>YOU'RE KNOWN FOR...</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
            gap: isDesktop ? 10 : 8,
          }}>
            {strengths.map((s, i) => (
              <div key={i} style={{
                padding: isDesktop ? "20px 16px" : "15px 12px",
                borderRadius: 6,
                background: i === 0 ? "rgba(200,164,106,0.07)" : (T2.surface || "rgba(255,255,255,0.025)"),
                border: `0.5px solid ${i === 0 ? T.gold : T2.border}`,
                display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
                gridColumn: (!isDesktop && i === 4) ? "1 / -1" : "auto",
                boxShadow: i === 0 ? `0 0 0 1px rgba(200,164,106,0.1)` : "none",
                animation: `fadeUp 0.4s ${i * 0.07}s ease both`,
              }}>
                <span style={{
                  fontFamily: T.sans, fontSize: isDesktop ? 13 : 11, fontWeight: 600,
                  color: i === 0 ? T.gold : T2.text, letterSpacing: "0.3px",
                }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: T.ink || "#2C2416", borderRadius: 6, padding: isDesktop ? "24px 20px" : "18px 15px" }}>
          <div style={{ ...lbl, color: "rgba(200,164,106,0.5)", marginBottom: 10 }}>YOUR BRAND STATEMENT</div>
          <p style={{
            fontFamily: T.serif, fontSize: isDesktop ? 20 : 17, fontStyle: "italic",
            color: "#F5EFE6", lineHeight: 1.55, margin: "0 0 14px", fontWeight: 500,
          }}>
            {result.statement}
          </p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText((result.statement || "").replace(/^"|"$/g, '')).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2200);
              });
            }}
            style={{
              padding: "6px 14px", borderRadius: 3, border: `0.5px solid ${T.gold}`,
              background: copied ? "rgba(138,158,132,0.12)" : "transparent",
              color: T.gold, fontSize: 11, fontFamily: T.sans, cursor: "pointer",
              fontWeight: 600, transition: "all 0.2s",
            }}
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>

        <div style={{ borderLeft: "2px solid rgba(200,164,106,0.22)", paddingLeft: 15 }}>
          <div style={{ ...lbl, marginBottom: 9 }}>COACH REFLECTION</div>
          <p style={{
            fontFamily: T.serif, fontSize: isDesktop ? 15 : 13, fontStyle: "italic",
            color: T2.text3, lineHeight: 1.8, margin: 0,
          }}>
            {result.coachNote}
          </p>
        </div>

        <button style={cta(false)}>Continue to Brand Analysis →</button>
      </div>
    );
  }

  return null;
}


// ─── D11 Simulation Widget ────────────────────────────────────────────────────
export function D11SimWidget({T, T2, isDesktop, brandWords=[]}) {

  const INDUSTRIES = ["Technology","Finance","Healthcare","Marketing & Communications","Consulting","Legal","Education","Engineering","Media & Creative","Retail","Government & Public Sector","Other"];
  const DREAM_SUGGESTIONS = ["Microsoft","Apple","Google","Amazon","McKinsey","Deloitte","Shell","Meta","Goldman Sachs","Netflix","Startup"];
  const COMMITMENTS = [
    "I'll speak up before I'm ready.",
    "I'll be intentional about how I show up.",
    "I'll communicate with clarity.",
    "I'll build my reputation one interaction at a time.",
    "I'll stop hoping people notice my value and start showing it.",
  ];
  const AI_STEPS = [
    {msg:"Reading your profile...",          label:"Clarity",         pct:82},
    {msg:"Checking leadership signals...",   label:"Leadership",      pct:58},
    {msg:"Measuring your authority...",      label:"Authority",       pct:74},
    {msg:"Assessing credibility...",         label:"Credibility",     pct:88},
    {msg:"I found something interesting...", label:"Differentiation", pct:44},
    {msg:"Building your playbook...",        label:"Future Alignment",pct:null},
  ];

  const [step,           setStep]          = useState(1);
  const [careerGoal,     setCareerGoal]    = useState('');
  const [industry,       setIndustry]      = useState('');
  const [dreamCos,       setDreamCos]      = useState([]);
  const [dreamInput,     setDreamInput]    = useState('');
  const [headline,       setHeadline]      = useState('');
  const [about,          setAbout]         = useState('');
  const [aboutCollapsed, setAboutCollapsed]= useState(false);
  const [cv,             setCv]            = useState('');
  const [loading,        setLoading]       = useState(false);
  const [aiStepIdx,      setAiStepIdx]     = useState(-1);
  const [result,         setResult]        = useState(null);
  const [apiError,       setApiError]      = useState(false);
  const [copied,         setCopied]        = useState(null);
  const [aboutRwOpen,    setAboutRwOpen]   = useState(false);
  const [analysisOpen,   setAnalysisOpen]  = useState(false);
  const [openSection,    setOpenSection]   = useState('brand');
  const [commitment,     setCommitment]    = useState('');
  const [committed,      setCommitted]     = useState(false);
  const intervalRef = useRef(null);

  const futureWords = (brandWords||[]).filter(w=>w&&w.trim().length>0);

  const cs = {
    card:  {background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"20px":"14px"},
    label: {fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
  };
  function cta(disabled){return{width:"100%",padding:"14px",borderRadius:4,border:"none",background:disabled?"rgba(44,36,22,0.15)":T.ink,color:disabled?"rgba(44,36,22,0.3)":(T2.bg||"#F7F3EC"),fontSize:isDesktop?14:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"};}
  const back={background:"none",border:"none",fontFamily:T.sans,fontSize:13,color:T2.text4,cursor:"pointer",padding:"4px 0",textAlign:"left"};

  const STEP_LABELS = ["Goal","Profile","Analysis","Rewrite","Playbook"];
  function StepPills(){
    return(
      <div style={{display:"flex",gap:isDesktop?5:4,marginBottom:16,overflowX:"auto",paddingBottom:2}}>
        {STEP_LABELS.map((l,i)=>{
          const n=i+1,done=n<step,active=n===step;
          return(
            <div key={i} style={{flexShrink:0,padding:isDesktop?"5px 11px":"4px 8px",borderRadius:20,border:`0.5px solid ${active?T.ink:done?"rgba(138,158,132,0.4)":T2.border}`,background:active?(T.ink||"#2C2416"):done?"rgba(138,158,132,0.06)":"transparent",fontFamily:T.sans,fontSize:isDesktop?11:9,fontWeight:active?600:400,color:active?"#F7F3EC":done?"rgba(138,158,132,0.85)":T2.text4,whiteSpace:"nowrap",transition:"all 0.2s"}}>
              {done?"✓ ":""}{l}
            </div>
          );
        })}
      </div>
    );
  }

  function Accordion({id,title,children}){
    const isOpen=openSection===id;
    return(
      <div style={{...cs.card,padding:0,overflow:"hidden"}}>
        <button onClick={()=>setOpenSection(isOpen?'':id)}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:isDesktop?"15px 20px":"12px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
          <span style={{fontFamily:T.sans,fontSize:isDesktop?10:9,fontWeight:700,color:isOpen?T.gold:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",transition:"color 0.2s"}}>{title}</span>
          <span style={{color:T2.text4,fontSize:11,transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.25s",display:"inline-block"}}>↓</span>
        </button>
        {isOpen&&<div style={{padding:isDesktop?"0 20px 18px":"0 16px 14px",animation:"fadeUp 0.3s ease both"}}>{children}</div>}
      </div>
    );
  }

  function addDreamCo(co){const c=co.trim();if(!c||dreamCos.includes(c))return;setDreamCos([...dreamCos,c]);setDreamInput('');}

  async function runAnalysis(){
    setLoading(true); setApiError(false); setResult(null); setAiStepIdx(-1);
    intervalRef.current = setInterval(()=>{
      setAiStepIdx(prev=>prev<AI_STEPS.length-2 ? prev+1 : prev);
    }, 700);
    const w = futureWords.length>0 ? futureWords : ["strategic","trusted","influential"];
    const prompt = `You are a world-class personal brand strategist and executive coach. Analyse the following LinkedIn profile against the professional's career goals and brand intent.

Career goal: ${careerGoal}
Industry: ${industry||'not specified'}
Dream companies or roles: ${dreamCos.length ? dreamCos.join(', ') : 'not specified'}
Their intended brand (3 words): ${w.join(', ')}

LinkedIn headline: ${headline}
LinkedIn About section: ${about||'(not provided)'}
Additional context / CV: ${cv||'(not provided)'}

Return your analysis as valid JSON with this exact structure:
{
  "score": <integer 0-100>,
  "currentSignals": [<3-4 strings: qualities the profile currently communicates>],
  "missingSignals": [<3-4 strings: specific qualities absent from the profile>],
  "insight": "<one clear sentence summarising the gap — warm and direct>",
  "improvedHeadline": "<powerful LinkedIn headline under 200 chars>",
  "improvedAbout": "<three executive paragraphs in first person, weaving in brand words. Separate with \\n\\n>",
  "missingAchievements": [<4 strings: types of content missing from the profile>],
  "biggestStrength": "<one sentence>",
  "biggestGap": "<one sentence, framed as opportunity>",
  "thisWeek": [<4 strings: specific actionable short phrases>],
  "nextMonth": [<4 strings: strategic themes — short phrases>],
  "stageIntro": "<theatrical 4-sentence introduction as if before they walk on stage two years from now. Start with 'Two years from now, someone stands up to introduce you.' Include 'Known for'. End with 'Please welcome them to the stage.' Second person. Make it feel like goosebumps.>",
  "positioningStatement": "<one sentence: I help [who] by [how] so that [outcome]>",
  "brandPillars": [<3 strings: core brand pillars, 2-4 words each>],
  "tagline": "<personal tagline, 3-6 words, memorable>",
  "coachMessage": "<2-3 sentences — inspirational, personal, references their specific words and goal>"
}
Return ONLY valid JSON. No preamble, no markdown fences.`;

    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:2000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const raw=(data.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      if(!m) throw new Error("no json");
      const parsed=JSON.parse(m[0]);
      clearInterval(intervalRef.current);
      setAiStepIdx(AI_STEPS.length-1);
      setTimeout(()=>{ setResult(parsed); setLoading(false); setStep(3); }, 900);
    }catch(_){
      clearInterval(intervalRef.current);
      setLoading(false); setApiError(true);
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if(loading){
    const msgIdx=Math.min(Math.max(aiStepIdx,0), AI_STEPS.length-1);
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepPills/>
        <div style={{...cs.card,padding:isDesktop?"40px 28px":"30px 18px"}}>
          <div style={{textAlign:"center",marginBottom:26}}>
            <img src="/logo-mark.png" alt="" style={{width:40,height:40,objectFit:"cover",filter:"brightness(0.55) sepia(0.4)",animation:"breathe 2s ease infinite",marginBottom:14}}/>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontStyle:"italic",color:T2.text,margin:0,lineHeight:1.4}}>
              {AI_STEPS[msgIdx].msg}
            </p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {AI_STEPS.map(({label,pct},i)=>{
              const active=i<=aiStepIdx;
              return(
                <div key={i} style={{opacity:active?1:0.18,transition:"opacity 0.5s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontFamily:T.sans,fontSize:12,color:active?T2.text:T2.text4,transition:"color 0.4s"}}>{label}</span>
                    <span style={{fontFamily:T.sans,fontSize:11,color:T.gold,opacity:active&&pct?1:0,transition:"opacity 0.5s 0.4s"}}>{active&&pct?pct+'%':''}</span>
                  </div>
                  <div style={{height:3,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:active&&pct?pct+'%':'0%',background:`linear-gradient(to right,rgba(200,164,106,0.55),${T.gold})`,borderRadius:2,transition:"width 1.0s cubic-bezier(0.25,0.46,0.45,0.94)"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if(apiError) return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <StepPills/>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"44px 24px":"32px 18px"}}>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.65,margin:"0 0 16px"}}>Couldn't connect right now. Try again.</p>
        <button onClick={runAnalysis} style={{...cta(false),width:"auto",padding:"11px 26px",display:"inline-block"}}>Try Again →</button>
      </div>
      <button onClick={()=>{setApiError(false);setStep(2);}} style={back}>← Back</button>
    </div>
  );

  // ── Step 1: Goal ─────────────────────────────────────────────────────────────
  if(step===1) return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <StepPills/>
      <div style={cs.card}>
        <div style={{marginBottom:15}}>
          <div style={cs.label}>Where are you heading?</div>
          <input value={careerGoal} onChange={e=>setCareerGoal(e.target.value)} placeholder="e.g. Head of Product at a Series B startup"
            className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:15}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>Industry</div>
          <select value={industry} onChange={e=>setIndustry(e.target.value)}
            style={{width:"100%",padding:"10px 14px",background:T2.surface,border:"0.5px solid "+T2.border,borderRadius:4,fontFamily:T.sans,fontSize:isDesktop?14:13,color:industry?T2.text:T2.text4,outline:"none",cursor:"pointer",boxSizing:"border-box",appearance:"auto"}}>
            <option value="">Select your industry</option>
            {INDUSTRIES.map(ind=><option key={ind} value={ind} style={{background:"#1a1610"}}>{ind}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>Dream companies <span style={{fontWeight:400,fontSize:10,textTransform:"none"}}>(optional)</span></div>
          {dreamCos.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:9}}>
              {dreamCos.map(co=>(
                <span key={co} style={{padding:"5px 11px",borderRadius:20,background:"rgba(200,164,106,0.1)",border:`0.5px solid ${T.gold}`,fontFamily:T.sans,fontSize:12,color:T.gold,display:"flex",alignItems:"center",gap:5}}>
                  {co}
                  <button onClick={()=>setDreamCos(dreamCos.filter(c=>c!==co))} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",padding:0,fontSize:14,lineHeight:1}}>×</button>
                </span>
              ))}
            </div>
          )}
          <input value={dreamInput} onChange={e=>setDreamInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();addDreamCo(dreamInput);}}}
            placeholder="Type company, press Enter" className="au-input" style={{width:"100%",padding:"9px 14px",fontSize:isDesktop?13:12,boxSizing:"border-box",marginBottom:7}}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {DREAM_SUGGESTIONS.filter(co=>!dreamCos.includes(co)).map(co=>(
              <button key={co} onClick={()=>addDreamCo(co)} style={{padding:"4px 10px",borderRadius:20,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text3,fontSize:11,fontFamily:T.sans,cursor:"pointer",transition:"all 0.15s"}}>+{co}</button>
            ))}
          </div>
        </div>
      </div>

      {futureWords.length>0&&(
        <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
          <div style={cs.label}>Brand Intent</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?21:18,fontWeight:600,color:T2.text,lineHeight:1.2,margin:0,letterSpacing:"-0.2px"}}>
            {futureWords.map((w,i,arr)=>(
              <span key={i}>{w}{i<arr.length-1&&<span style={{color:T.gold,fontWeight:300,padding:"0 8px"}}>·</span>}</span>
            ))}
          </p>
        </div>
      )}

      <button onClick={()=>careerGoal.trim()&&setStep(2)} style={cta(!careerGoal.trim())}>Continue →</button>
    </div>
  );

  // ── Step 2: Profile ───────────────────────────────────────────────────────────
  if(step===2){
    const aboutWords=about.trim().split(/\s+/).filter(Boolean).length;
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <StepPills/>
        <div style={cs.card}>
          <div style={cs.label}>LinkedIn Profile</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text4,lineHeight:1.5,margin:"0 0 16px"}}>The more you share, the sharper the analysis.</p>

          <div style={{marginBottom:16}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>LinkedIn Headline</div>
            <input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="e.g. Marketing Manager | Helping brands find their voice"
              className="au-input" style={{width:"100%",padding:"10px 14px",fontSize:isDesktop?14:13,boxSizing:"border-box"}}/>
            <div style={{fontFamily:T.sans,fontSize:11,color:headline.length>220?"rgba(180,80,60,0.8)":T2.text4,marginTop:4}}>{headline.length}/220</div>
          </div>

          <div style={{marginBottom:16}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>About Section</div>
            {about.trim()&&aboutCollapsed?(
              <div onClick={()=>setAboutCollapsed(false)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",cursor:"pointer",borderBottom:"0.5px solid "+T2.divider}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:"rgba(138,158,132,0.85)",fontSize:14}}>✓</span>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text}}>About added</span>
                </div>
                <span style={{fontFamily:T.sans,fontSize:11,color:T2.text4}}>{aboutWords} words · edit</span>
              </div>
            ):(
              <textarea value={about} onChange={e=>setAbout(e.target.value)} onBlur={()=>{if(about.trim().length>30)setAboutCollapsed(true);}}
                placeholder="Paste your LinkedIn About section here…" rows={isDesktop?5:4}
                style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"7px 0",fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,resize:"none",outline:"none",lineHeight:1.65,boxSizing:"border-box"}}/>
            )}
          </div>

          <div>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>CV / Extra context <span style={{fontWeight:400,textTransform:"none",fontSize:10}}>(optional)</span></div>
            <textarea value={cv} onChange={e=>setCv(e.target.value)} placeholder="Key achievements or context…" rows={isDesktop?3:2}
              style={{width:"100%",background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"7px 0",fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
          </div>
          <p style={{fontFamily:T.sans,fontSize:11,color:T2.text4,margin:"12px 0 0"}}>Not stored. Used only to generate your analysis.</p>
        </div>

        <button onClick={()=>headline.trim()&&runAnalysis()} style={cta(!headline.trim())}>Run the Analysis →</button>
        <button onClick={()=>setStep(1)} style={back}>← Back</button>
      </div>
    );
  }

  // ── Step 3: Analysis ──────────────────────────────────────────────────────────
  if(step===3&&result){
    const score=result.score||0;
    const w=futureWords.length>0 ? futureWords : ["strategic","trusted","influential"];
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <StepPills/>

        <div style={{background:T.ink||"#2C2416",borderRadius:4,padding:isDesktop?"26px 22px":"18px 16px"}}>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(200,164,106,0.6)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:9}}>Brand Alignment</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?68:52,fontWeight:700,color:"#F5EFE6",lineHeight:0.9,letterSpacing:"-3px",marginBottom:11}}>
            {score}<span style={{fontSize:isDesktop?24:19,fontWeight:300,color:"rgba(245,239,230,0.32)",letterSpacing:0}}>%</span>
          </div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.6)",lineHeight:1.6,margin:0}}>{result.insight||""}</p>
        </div>

        <div style={{display:"flex",gap:9,flexDirection:isDesktop?"row":"column"}}>
          <div style={{...cs.card,flex:1}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:9}}>Current Brand</div>
            {(result.currentSignals||[]).map((s,i)=><div key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,marginBottom:5,lineHeight:1.4}}>• {s}</div>)}
          </div>
          <div style={{...cs.card,flex:1,border:`0.5px solid ${T.gold}`,background:"rgba(200,164,106,0.06)"}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:9}}>Target Brand</div>
            {w.map((s,i)=><div key={i} style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T.gold,fontWeight:600,marginBottom:5,lineHeight:1.4}}>• {s}</div>)}
          </div>
        </div>

        <button onClick={()=>setAnalysisOpen(o=>!o)}
          style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",padding:"3px 0",fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text4,textAlign:"left"}}>
          <span style={{transform:analysisOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block",fontSize:10}}>▸</span>
          <span>View full analysis</span>
        </button>
        {analysisOpen&&(
          <div style={{animation:"fadeUp 0.3s ease both",display:"flex",flexDirection:"column",gap:9}}>
            <div style={cs.card}>
              <div style={cs.label}>What's missing</div>
              {(result.missingSignals||[]).map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
                  <span style={{color:"rgba(200,164,106,0.5)",fontSize:11,flexShrink:0,marginTop:2}}>○</span>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.45}}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:9,flexDirection:isDesktop?"row":"column"}}>
              <div style={{...cs.card,flex:1}}>
                <div style={cs.label}>Strength</div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.55,margin:0}}>{result.biggestStrength||""}</p>
              </div>
              <div style={{...cs.card,flex:1}}>
                <div style={cs.label}>Gap</div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.55,margin:0}}>{result.biggestGap||""}</p>
              </div>
            </div>
          </div>
        )}

        <button onClick={()=>setStep(4)} style={cta(false)}>See my rewrite →</button>
        <button onClick={()=>{setResult(null);setStep(2);}} style={back}>← Back</button>
      </div>
    );
  }

  // ── Step 4: Rewrite ───────────────────────────────────────────────────────────
  if(step===4&&result){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <StepPills/>

        <div style={cs.card}>
          <div style={cs.label}>Headline</div>
          {headline&&(
            <div style={{padding:"10px 12px",borderRadius:4,background:T2.bg,marginBottom:9}}>
              <div style={{fontFamily:T.sans,fontSize:9,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontWeight:700}}>Before</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.5,margin:0}}>{headline}</p>
            </div>
          )}
          <div style={{padding:"12px 14px",borderRadius:4,background:"rgba(138,158,132,0.06)",border:"0.5px solid rgba(138,158,132,0.2)"}}>
            <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6,fontWeight:700}}>After</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:"0 0 10px"}}>{result.improvedHeadline||""}</p>
            <button onClick={()=>{navigator.clipboard?.writeText(result.improvedHeadline||"").then(()=>{setCopied("hl");setTimeout(()=>setCopied(null),2000);});}}
              style={{padding:"5px 13px",borderRadius:3,border:`0.5px solid ${T.gold}`,background:copied==="hl"?"rgba(138,158,132,0.12)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>
              {copied==="hl"?"Copied ✓":"Copy"}
            </button>
          </div>
        </div>

        <div style={cs.card}>
          <button onClick={()=>setAboutRwOpen(o=>!o)}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",cursor:"pointer",padding:0}}>
            <div style={cs.label}>About Section</div>
            <span style={{color:T2.text4,fontSize:11,transform:aboutRwOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.25s",display:"inline-block",marginBottom:8}}>↓</span>
          </button>
          {aboutRwOpen&&(
            <div style={{animation:"fadeUp 0.3s ease both"}}>
              {about&&(
                <div style={{padding:"10px 12px",borderRadius:4,background:T2.bg,marginBottom:9}}>
                  <div style={{fontFamily:T.sans,fontSize:9,color:T2.text4,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4,fontWeight:700}}>Before</div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:0,maxHeight:76,overflow:"hidden"}}>{about.slice(0,230)}{about.length>230?"…":""}</p>
                </div>
              )}
              <div style={{padding:"12px 14px",borderRadius:4,background:"rgba(138,158,132,0.06)",border:"0.5px solid rgba(138,158,132,0.2)"}}>
                <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7,fontWeight:700}}>After</div>
                <p style={{fontFamily:T.serif,fontSize:isDesktop?15:13,color:T2.text,lineHeight:1.75,margin:"0 0 11px",whiteSpace:"pre-wrap"}}>{result.improvedAbout||""}</p>
                <button onClick={()=>{navigator.clipboard?.writeText(result.improvedAbout||"").then(()=>{setCopied("ab");setTimeout(()=>setCopied(null),2000);});}}
                  style={{padding:"5px 13px",borderRadius:3,border:`0.5px solid ${T.gold}`,background:copied==="ab"?"rgba(138,158,132,0.12)":"transparent",color:T.gold,fontSize:12,fontFamily:T.sans,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>
                  {copied==="ab"?"Copied ✓":"Copy"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
          <div style={cs.label}>Consider Adding</div>
          {(result.missingAchievements||[]).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
              <span style={{color:T.gold,fontSize:12,flexShrink:0,marginTop:1}}>✓</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.45}}>{a}</span>
            </div>
          ))}
        </div>

        <button onClick={()=>setStep(5)} style={cta(false)}>Your Playbook →</button>
        <button onClick={()=>setStep(3)} style={back}>← Back</button>
      </div>
    );
  }

  // ── Step 5: Playbook ──────────────────────────────────────────────────────────
  if(step===5&&result){
    const w=futureWords.length>0 ? futureWords : ["strategic","trusted","influential"];
    return(
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        <StepPills/>

        <Accordion id="brand" title="Your Brand">
          <div style={{background:T.ink||"#2C2416",borderRadius:4,padding:isDesktop?"20px 18px":"15px 14px"}}>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:700,color:"#F5EFE6",letterSpacing:"-0.5px",lineHeight:1,marginBottom:4}}>
              {w.map((word,i,arr)=>(
                <span key={i}>{word}{i<arr.length-1&&<span style={{color:T.gold,fontWeight:300,padding:"0 9px"}}>·</span>}</span>
              ))}
            </div>
            {result.tagline&&<div style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:"italic",color:T.gold,marginBottom:14,marginTop:3}}>"{result.tagline}"</div>}
            {careerGoal&&(
              <div style={{paddingTop:11,borderTop:"0.5px solid rgba(255,255,255,0.06)",marginBottom:10}}>
                <div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:"rgba(200,164,106,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>Goal</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.62)"}}>{careerGoal}</div>
              </div>
            )}
            {result.positioningStatement&&(
              <div style={{paddingTop:11,borderTop:"0.5px solid rgba(255,255,255,0.06)",marginBottom:10}}>
                <div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:"rgba(200,164,106,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>Positioning</div>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?13:12,color:"rgba(245,239,230,0.55)",lineHeight:1.55,fontStyle:"italic"}}>{result.positioningStatement}</div>
              </div>
            )}
            {(result.brandPillars||[]).length>0&&(
              <div style={{paddingTop:11,borderTop:"0.5px solid rgba(255,255,255,0.06)"}}>
                <div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:"rgba(200,164,106,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>Pillars</div>
                {(result.brandPillars||[]).map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
                    <span style={{fontFamily:T.sans,fontSize:10,color:T.gold,fontWeight:700,minWidth:14}}>{['①','②','③'][i]}</span>
                    <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:"rgba(245,239,230,0.52)"}}>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Accordion>

        <Accordion id="intro" title="Two Years From Now">
          {result.stageIntro&&(
            <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.8,margin:0}}>"{result.stageIntro}"</p>
          )}
        </Accordion>

        <Accordion id="week" title="This Week">
          {(result.thisWeek||[]).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:8}}>
              <span style={{color:T.gold,fontSize:12,flexShrink:0,marginTop:1}}>→</span>
              <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.5}}>{a}</span>
            </div>
          ))}
        </Accordion>

        <Accordion id="month" title="Next Month">
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {(result.nextMonth||[]).map((a,i)=>(
              <span key={i} style={{padding:"6px 12px",borderRadius:20,background:"rgba(138,158,132,0.07)",border:"0.5px solid rgba(138,158,132,0.18)",fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3}}>{a}</span>
            ))}
          </div>
        </Accordion>

        <Accordion id="coach" title="Your Coach Says">
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.7,margin:0}}>"{result.coachMessage||""}"</p>
        </Accordion>

        <div style={{marginTop:4}}>
          {!committed?(
            <div style={cs.card}>
              <div style={cs.label}>Make Your Promise</div>
              <h3 style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 13px"}}>Before we move on, make me one promise.</h3>
              <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
                {COMMITMENTS.map((c,i)=>(
                  <button key={i} onClick={()=>setCommitment(c)}
                    style={{display:"flex",alignItems:"flex-start",gap:11,padding:"12px 13px",borderRadius:4,border:`0.5px solid ${commitment===c?T.gold:T2.border}`,background:commitment===c?"rgba(200,164,106,0.08)":"transparent",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                    <div style={{width:15,height:15,borderRadius:"50%",border:`1.5px solid ${commitment===c?T.gold:T2.border}`,flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                      {commitment===c&&<div style={{width:7,height:7,borderRadius:"50%",background:T.gold}}/>}
                    </div>
                    <span style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:commitment===c?T2.text:T2.text3,lineHeight:1.5,fontWeight:commitment===c?500:400}}>{c}</span>
                  </button>
                ))}
              </div>
              <button onClick={()=>{ if(!commitment)return; try{localStorage.setItem('amplifyuCommitment',commitment);}catch(_){} setCommitted(true); }} style={cta(!commitment)}>I commit to this →</button>
            </div>
          ):(
            <div style={{...cs.card,background:"rgba(138,158,132,0.05)",border:"0.5px solid rgba(138,158,132,0.28)",animation:"fadeUp 0.4s ease both"}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(138,158,132,0.75)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:9}}>Pinned to your programme</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?18:15,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:"0 0 5px"}}>"{commitment}"</p>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text4,margin:0,lineHeight:1.5}}>This commitment stays with you throughout AmplifyU.</p>
            </div>
          )}
        </div>

        <button onClick={()=>setStep(4)} style={back}>← Back</button>
      </div>
    );
  }

  return null;
}
