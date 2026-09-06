import { useState, useRef } from 'react';
import { T } from '../theme.js';
import { Paywall } from '../components/Paywall.jsx';
import { trialExhausted, incrementTrialCount } from '../lib/purchases.js';

const CHALLENGE_TRIAL_KEY = 'au1_trial_practice_challenge';

const SCENARIOS = [
  // Executive Communication
  {id:1,  category:"Executive",   tag:"Brevity · Clarity",         title:"The Lift Encounter",         prompt:"Your CEO stops you in the lift. 'Quick question — what's the biggest risk facing your team right now?'"},
  {id:2,  category:"Executive",   tag:"Confidence · Structure",    title:"Board Interruption",          prompt:"You're two minutes into your board presentation when the Chair interrupts: 'Can you cut to the chase — what's your recommendation and why?'"},
  {id:3,  category:"Executive",   tag:"Presence · Brevity",        title:"Lunch Table",                 prompt:"Your CEO's boss visits the office and sits next to you at lunch. She asks: 'So — what do you actually do here?'"},
  {id:4,  category:"Executive",   tag:"Strategic Thinking",        title:"All-Hands Question",          prompt:"At the all-hands, the CEO asks the room: 'What's one thing we could do differently to make this company better?' She looks directly at you."},
  {id:5,  category:"Executive",   tag:"Credibility · Composure",   title:"CFO Corridor Moment",         prompt:"The CFO stops you after a budget review: 'Honestly — do you think this project is worth the investment?'"},
  // Managing Up
  {id:6,  category:"Managing Up", tag:"Influence · Composure",     title:"Disagreeing Upward",          prompt:"Your manager presents a plan you believe is flawed. In the debrief they ask: 'Any thoughts?'"},
  {id:7,  category:"Managing Up", tag:"Ownership · Confidence",    title:"The Promotion Conversation",  prompt:"Your manager says they have five minutes before their next call. You decide this is the moment to make your case for promotion."},
  {id:8,  category:"Managing Up", tag:"Clarity · Ownership",       title:"Delivering Bad News Up",      prompt:"A project you're leading is going to miss its deadline. Your manager just walked in and asked for a status update."},
  {id:9,  category:"Managing Up", tag:"Persuasion · Composure",    title:"Unrealistic Deadline",        prompt:"Your senior stakeholder just told you the project needs to be done in half the time originally agreed. How do you respond?"},
  {id:10, category:"Managing Up", tag:"Ownership · Clarity",       title:"Taking Back Your Credit",     prompt:"In a leadership meeting, your manager presents your work as their own idea. The room leader asks: 'Who came up with this approach?'"},
  // Stakeholder Management
  {id:11, category:"Stakeholders",tag:"Persuasion · Credibility",  title:"The Unconvinced Stakeholder", prompt:"A senior stakeholder says: 'I've been watching this project for months and I'm still not convinced it's going to work.'"},
  {id:12, category:"Stakeholders",tag:"Influence · Composure",     title:"Scope Creep Pushback",        prompt:"A stakeholder keeps adding requirements outside the original brief. You need to push back without damaging the relationship."},
  {id:13, category:"Stakeholders",tag:"Clarity · Brevity",         title:"Competing Priorities",        prompt:"Two stakeholders both believe their project is your top priority. They're both in the room and have just asked you to clarify where things stand."},
  {id:14, category:"Stakeholders",tag:"Composure · Structure",     title:"The Disappointing Numbers",   prompt:"The quarterly results are significantly below target. You're presenting to the steering committee and have 90 seconds to set the tone."},
  {id:15, category:"Stakeholders",tag:"Confidence · Persuasion",   title:"Senior Objection",            prompt:"After your presentation a senior leader says: 'I'm not convinced. We tried something like this before and it failed.' The room waits for your response."},
  // Team & Leadership
  {id:16, category:"Leadership",  tag:"Clarity · Composure",       title:"The Honest Check-In",         prompt:"In a 1:1, a team member asks: 'How do you think I'm doing?' — and you know they're not meeting expectations."},
  {id:17, category:"Leadership",  tag:"Confidence · Presence",     title:"Leading Through Uncertainty",  prompt:"Your team has just been told there's a restructure coming. They look to you and ask: 'What does this mean for us?'"},
  {id:18, category:"Leadership",  tag:"Composure · Ownership",     title:"Team Conflict",               prompt:"Two senior team members are in open conflict. In a team meeting it spills over — both look to you to resolve it."},
  {id:19, category:"Leadership",  tag:"Clarity · Confidence",      title:"Difficult Feedback",          prompt:"A high-performer has been dismissing junior colleagues in meetings. It's affecting the team. It's time to address it directly."},
  {id:20, category:"Leadership",  tag:"Strategic Thinking",        title:"What Are We Even Doing?",     prompt:"A new team member asks you: 'What are we actually trying to achieve? What's the point of this team?'"},
  // Visibility & Career
  {id:21, category:"Visibility",  tag:"Brevity · Presence",        title:"Networking Introduction",     prompt:"You're at an industry event. Someone extends their hand and asks: 'So, what do you do?' You have 45 seconds."},
  {id:22, category:"Visibility",  tag:"Confidence · Ownership",    title:"What Are You Proud Of?",      prompt:"A potential mentor asks: 'What are you working on right now that you're most proud of — and why?'"},
  {id:23, category:"Visibility",  tag:"Structure · Presence",      title:"Tell Me About Yourself",      prompt:"First-round interview. The panel says: 'Tell us about yourself.' You have 90 seconds."},
  {id:24, category:"Visibility",  tag:"Persuasion · Clarity",      title:"Your Team's Value",           prompt:"Your company is restructuring. HR is meeting all managers to understand what each team contributes. You have two minutes."},
  {id:25, category:"Visibility",  tag:"Confidence · Brevity",      title:"The Media Question",          prompt:"A journalist interviewing you asks: 'What's the most important thing professionals in your field need to understand right now?'"},
  // High-Stakes Moments
  {id:26, category:"High Stakes", tag:"Composure · Ownership",     title:"Crisis Moment",               prompt:"Your product has a critical bug affecting customers. The CEO asks for your assessment in front of the leadership team — right now."},
  {id:27, category:"High Stakes", tag:"Confidence · Persuasion",   title:"Make Your Case",              prompt:"You're negotiating a significant salary increase. The hiring manager leans back and says: 'Make your case.'"},
  {id:28, category:"High Stakes", tag:"Composure · Clarity",       title:"The Rumour Question",         prompt:"There's a rumour your team is being cut. A team member asks you directly: 'Is it true? What do you know?'"},
  {id:29, category:"High Stakes", tag:"Composure · Persuasion",    title:"The Hostile Room",            prompt:"Your proposal is met with immediate pushback from a senior leader: 'This won't work. We don't have the budget or bandwidth.' The room waits."},
  {id:30, category:"High Stakes", tag:"Presence · Authenticity",   title:"The Unexpected Question",     prompt:"In the middle of a presentation, a board member asks something completely off-script: 'What's your biggest personal challenge in this role?'"},
];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function todaysScenario() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate();
  return SCENARIOS[seed % SCENARIOS.length];
}

function loadSessions() {
  try { return JSON.parse(localStorage.getItem('au1_ps_sessions') || '[]'); } catch { return []; }
}

function loadStreak() {
  try { return JSON.parse(localStorage.getItem('au1_ps_streak') || '{"current":0,"longest":0,"lastDate":""}'); } catch { return {current:0,longest:0,lastDate:""}; }
}

function computeNewStreak(prev) {
  const today = todayStr();
  if (prev.lastDate === today) return prev;
  const d = new Date(); d.setDate(d.getDate()-1);
  const yest = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const next = {
    current: prev.lastDate === yest ? prev.current + 1 : 1,
    longest: Math.max(prev.longest, prev.lastDate === yest ? prev.current + 1 : 1),
    lastDate: today,
  };
  try { localStorage.setItem('au1_ps_streak', JSON.stringify(next)); } catch {}
  return next;
}

const DIMS = ['Clarity','Confidence','Brevity','Ownership'];

const CAT_COLORS = {
  'Executive':  '#8A9E84',
  'Managing Up':'#A09070',
  'Stakeholders':'#7A8E9E',
  'Leadership': '#9E8A84',
  'Visibility': '#84909E',
  'High Stakes':'#9E847A',
};

export function PracticeSpace({T2, isDesktop}) {
  const [phase, setPhase] = useState('home');
  const [scenario, setScenario] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [fallback, setFallback] = useState('');
  const [isRec, setIsRec] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [result, setResult] = useState(null);
  const [sessions, setSessions] = useState(loadSessions);
  const [streak, setStreak] = useState(loadStreak);
  const [histFilter, setHistFilter] = useState('All');
  const recRef = useRef(null);
  const liveRef = useRef('');

  const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const today = todayStr();
  const sc = todaysScenario();
  const todayDone = sessions.some(s => s.date === today);
  const recent = sessions.slice(0, 5);

  function startRec() {
    setIsRec(true); liveRef.current = ''; setTranscript('');
    if (!SpeechRec) return;
    const rec = new SpeechRec();
    rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
    rec.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(' ');
      liveRef.current = t; setTranscript(t);
    };
    rec.onend = () => { setIsRec(false); recRef.current = null; };
    rec.onerror = () => { setIsRec(false); recRef.current = null; };
    recRef.current = rec; rec.start();
  }

  function stopRec() {
    setIsRec(false);
    if (recRef.current) { recRef.current.stop(); recRef.current = null; }
  }

  async function submit() {
    const text = liveRef.current || transcript || fallback;
    if (!text.trim()) return;
    if (trialExhausted(CHALLENGE_TRIAL_KEY)) { setShowPaywall(true); return; }
    setLoading(true); setSubmitError(false);
    try {
      const res = await fetch('/api/claude', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-5',max_tokens:400,messages:[{role:'user',content:`Elite executive communication coach. Score this Practice Space response.\n\nScenario: "${scenario.prompt}"\nResponse: "${text}"\n\nNever use em dashes anywhere in your response; use a comma or hyphen instead.\n\nReturn ONLY JSON: {"overall":<50-100>,"Clarity":<50-100>,"Confidence":<50-100>,"Brevity":<50-100>,"Ownership":<50-100>,"coaching":"<one specific coaching sentence referencing their actual words — not generic>"}`}]})});
      if (!res.ok) throw new Error('api');
      const d = await res.json();
      const raw = (d.content||[]).map(b=>b.text||'').join('').trim();
      let parsed;
      try { const m = raw.match(/\{[\s\S]*\}/); parsed = JSON.parse(m[0]); }
      catch { throw new Error('parse'); }
      const session = {date:today, scenario:scenario.title, category:scenario.category, overall:parsed.overall, scores:{Clarity:parsed.Clarity,Confidence:parsed.Confidence,Brevity:parsed.Brevity,Ownership:parsed.Ownership}};
      const next = [session, ...sessions].slice(0, 100);
      setSessions(next);
      try { localStorage.setItem('au1_ps_sessions', JSON.stringify(next)); } catch {}
      const newStreak = computeNewStreak(streak);
      setStreak(newStreak);
      setResult(parsed);
      incrementTrialCount(CHALLENGE_TRIAL_KEY);
      setPhase('result');
    } catch { setSubmitError(true); }
    setLoading(false);
  }

  function goChallenge(sc) {
    setScenario(sc); setTranscript(''); setFallback(''); setResult(null); liveRef.current = ''; setPhase('challenge');
  }

  function goHome() {
    setPhase('home'); setScenario(null); setResult(null); setTranscript(''); setFallback(''); liveRef.current = '';
  }

  const cs = {
    back: {fontFamily:T.sans,fontSize:12,color:T2.text3,background:'none',border:'none',cursor:'pointer',padding:'0 0 20px',display:'flex',alignItems:'center',gap:6},
    catBadge: (cat) => ({fontFamily:T.sans,fontSize:10,fontWeight:500,color:CAT_COLORS[cat]||T.gold,padding:'3px 10px',border:`0.5px solid ${CAT_COLORS[cat]||T.gold}`,borderRadius:20,opacity:0.8}),
    tagBadge: {fontFamily:T.sans,fontSize:10,color:'rgba(44,36,22,0.45)',padding:'3px 10px',border:'0.5px solid rgba(44,36,22,0.12)',borderRadius:20},
  };

  if (showPaywall) return (
    <Paywall
      headline="You've used your free Today's Challenge — subscribe to keep practicing"
      onClose={() => setShowPaywall(false)}
      onSubscribed={() => setShowPaywall(false)}
    />
  );

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (phase === 'home') return (
    <div style={{padding:isDesktop?'32px 0':'16px 0'}}>

      {/* Today's challenge */}
      <div style={{background:'rgba(247,243,236,0.8)',border:'1px solid rgba(138,158,132,0.2)',borderRadius:10,padding:isDesktop?'24px 28px':'18px 20px',marginBottom:16}}>
        <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:'uppercase',letterSpacing:'2px',marginBottom:10}}>Today's Challenge</div>
        <div style={{display:'flex',gap:6,marginBottom:12}}>
          <span style={cs.catBadge(sc.category)}>{sc.category}</span>
          <span style={cs.tagBadge}>{sc.tag}</span>
        </div>
        <h3 style={{fontFamily:T.serif,fontSize:isDesktop?22:19,fontWeight:600,color:'#2C2416',lineHeight:1.2,marginBottom:10}}>{sc.title}</h3>
        <p style={{fontFamily:T.sans,fontSize:13,color:'rgba(44,36,22,0.6)',lineHeight:1.7,margin:'0 0 18px',fontStyle:'italic'}}>"{sc.prompt}"</p>
        {todayDone ? (
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:'rgba(97,145,100,0.12)',border:'1.5px solid #619164',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="#619164" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{fontFamily:T.sans,fontSize:13,color:'#619164',fontWeight:500}}>Completed today</span>
            <button onClick={()=>goChallenge(sc)} style={{marginLeft:'auto',padding:'7px 16px',borderRadius:4,border:'0.5px solid rgba(44,36,22,0.2)',background:'transparent',fontFamily:T.sans,fontSize:12,color:'rgba(44,36,22,0.5)',cursor:'pointer'}}>Redo →</button>
          </div>
        ) : (
          <button onClick={()=>goChallenge(sc)} style={{padding:'13px 28px',borderRadius:4,border:'none',background:'#2C2416',color:'#F7F3EC',fontFamily:T.sans,fontSize:14,fontWeight:600,cursor:'pointer',minHeight:48}}>
            Begin Challenge →
          </button>
        )}
      </div>

      {/* Recent sessions */}
      {recent.length>0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text3,textTransform:'uppercase',letterSpacing:'2px',marginBottom:12}}>Recent Sessions</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {recent.map((s,i)=>(
              <div key={i} style={{background:'rgba(237,232,223,0.6)',border:'0.5px solid rgba(44,36,22,0.08)',borderRadius:8,padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?28:24,fontWeight:600,color:s.overall>=80?T.gold:'#8A7B66',flexShrink:0,width:44,textAlign:'center'}}>{s.overall}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:T.sans,fontSize:13,fontWeight:500,color:'#2C2416',marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.scenario}</div>
                  <div style={{fontFamily:T.sans,fontSize:11,color:'rgba(44,36,22,0.4)'}}>{s.date} · {s.category}</div>
                </div>
              </div>
            ))}
          </div>
          {sessions.length>5 && (
            <button onClick={()=>setPhase('history')} style={{marginTop:10,width:'100%',padding:'10px',background:'none',border:'0.5px solid rgba(44,36,22,0.12)',borderRadius:6,fontFamily:T.sans,fontSize:12,color:'rgba(44,36,22,0.45)',cursor:'pointer'}}>
              View all {sessions.length} sessions →
            </button>
          )}
        </div>
      )}

      {/* Scenario library teaser */}
      <div style={{background:'rgba(237,232,223,0.5)',border:'0.5px solid rgba(44,36,22,0.08)',borderRadius:10,padding:isDesktop?'20px 24px':'16px 18px'}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text3,textTransform:'uppercase',letterSpacing:'2px',marginBottom:8}}>More Scenarios</div>
        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:'0 0 14px'}}>30 scenarios across Executive, Managing Up, Stakeholders, Leadership, Visibility and High Stakes. A new challenge rotates in every day.</p>
        <button onClick={()=>setPhase('library')} style={{padding:'9px 20px',borderRadius:4,border:'0.5px solid rgba(44,36,22,0.2)',background:'transparent',fontFamily:T.sans,fontSize:12,fontWeight:600,color:T2.text,cursor:'pointer'}}>Browse All Scenarios →</button>
      </div>
    </div>
  );

  // ── CHALLENGE ─────────────────────────────────────────────────────────────
  if (phase==='challenge' && scenario) return (
    <div style={{padding:isDesktop?'32px 0':'16px 0'}}>
      <button onClick={goHome} style={cs.back}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back
      </button>

      <div style={{background:'#0E0B08',borderRadius:8,padding:isDesktop?'24px 28px':'18px 20px',marginBottom:20}}>
        <div style={{display:'flex',gap:6,marginBottom:12}}>
          <span style={{...cs.catBadge(scenario.category),borderColor:'rgba(138,158,132,0.3)',color:'rgba(138,158,132,0.7)'}}>{scenario.category}</span>
          <span style={{fontFamily:T.sans,fontSize:10,color:'rgba(245,239,230,0.3)',padding:'3px 10px',border:'0.5px solid rgba(245,239,230,0.1)',borderRadius:20}}>{scenario.tag}</span>
        </div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?21:18,fontWeight:600,color:'rgba(255,255,255,0.92)',lineHeight:1.4,margin:0}}>"{scenario.prompt}"</p>
      </div>

      {SpeechRec && (
        <div style={{textAlign:'center',marginBottom:16}}>
          <button onClick={isRec?stopRec:startRec} style={{width:64,height:64,borderRadius:'50%',border:`2px solid ${isRec?'#8A9E84':'rgba(44,36,22,0.15)'}`,background:isRec?'rgba(138,158,132,0.1)':'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 8px',transition:'all 0.2s'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isRec?'#8A9E84':'rgba(44,36,22,0.35)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="9" y1="22" x2="15" y2="22"/>
            </svg>
          </button>
          <div style={{fontFamily:T.sans,fontSize:12,color:isRec?'#8A9E84':'rgba(44,36,22,0.35)'}}>{isRec?'Recording — tap to stop':'Tap to speak'}</div>
        </div>
      )}

      <textarea value={transcript||fallback} onChange={e=>{setFallback(e.target.value);setTranscript('');liveRef.current='';}}
        placeholder="Respond clearly and confidently — aim for 30 to 60 seconds."
        style={{width:'100%',borderRadius:4,border:'0.5px solid #DDD5C4',padding:'12px 14px',fontSize:14,fontFamily:T.sans,resize:'none',height:130,boxSizing:'border-box',background:'rgba(247,243,236,0.8)',outline:'none',marginBottom:12}}/>

      <button onClick={submit} disabled={loading||(!transcript.trim()&&!fallback.trim()&&!liveRef.current.trim())}
        style={{width:'100%',padding:'14px',borderRadius:4,border:'none',background:loading||(!transcript.trim()&&!fallback.trim())?'#DDD5C4':'#2C2416',color:loading||(!transcript.trim()&&!fallback.trim())?'#6B5E44':'#F7F3EC',fontSize:14,fontWeight:600,cursor:loading||(!transcript.trim()&&!fallback.trim())?'not-allowed':'pointer',fontFamily:T.sans,minHeight:48}}>
        {loading?'Coaching in progress…':'Get Coached →'}
      </button>
      {submitError && (
        <div style={{marginTop:12,padding:'12px 14px',background:'rgba(180,60,60,0.07)',border:'0.5px solid rgba(180,60,60,0.2)',borderRadius:4,fontFamily:T.sans,fontSize:12,color:'#8B3A3A',textAlign:'center'}}>
          Something went wrong — please check your connection and try again.
        </div>
      )}
    </div>
  );

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase==='result' && result) return (
    <div style={{padding:isDesktop?'32px 0':'16px 0'}}>
      <div style={{display:'flex',gap:12,marginBottom:16,alignItems:'stretch'}}>
        <div style={{padding:'20px',background:'#0E0B08',borderRadius:8,textAlign:'center',minWidth:isDesktop?120:100}}>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?52:44,fontWeight:600,color:T.gold,lineHeight:1}}>{result.overall}</div>
          <div style={{fontFamily:T.sans,fontSize:10,color:'rgba(245,239,230,0.35)',marginTop:4}}>/100</div>
        </div>
        <div style={{flex:1,padding:'16px 20px',background:'#0E0B08',borderRadius:8,display:'flex',flexDirection:'column',gap:8,justifyContent:'center'}}>
          {DIMS.map(d=>(
            <div key={d}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontFamily:T.sans,fontSize:11,color:'rgba(245,239,230,0.5)'}}>{d}</span>
                <span style={{fontFamily:T.serif,fontSize:12,fontWeight:600,color:result[d]>=80?T.gold:'rgba(245,239,230,0.35)'}}>{result[d]}</span>
              </div>
              <div style={{height:3,background:'rgba(245,239,230,0.05)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:result[d]+'%',background:result[d]>=80?T.gold:'rgba(138,158,132,0.4)',borderRadius:2,transition:'width 0.8s ease'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'16px 20px',background:'rgba(138,158,132,0.08)',borderRadius:6,borderLeft:'3px solid '+T.gold,marginBottom:20}}>
        <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:'#527060',textTransform:'uppercase',letterSpacing:'2px',marginBottom:6}}>Coach</div>
        <p style={{fontFamily:T.serif,fontSize:15,color:'#2C2416',lineHeight:1.65,margin:0}}>{result.coaching}</p>
      </div>

      {streak.current>0 && (
        <div style={{textAlign:'center',fontFamily:T.sans,fontSize:12,color:T.gold,marginBottom:16}}>
          {streak.current}-day streak{streak.current===streak.longest&&streak.current>1?' — personal best!':''}
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        <button onClick={goHome} style={{width:'100%',padding:'13px',borderRadius:4,border:'none',background:'#2C2416',color:'#F7F3EC',fontFamily:T.sans,fontSize:14,fontWeight:600,cursor:'pointer',minHeight:48}}>
          Back to Practice Space
        </button>
        <button onClick={()=>goChallenge(scenario)} style={{width:'100%',padding:'11px',borderRadius:4,border:'0.5px solid rgba(44,36,22,0.2)',background:'transparent',fontFamily:T.sans,fontSize:13,color:'rgba(44,36,22,0.5)',cursor:'pointer'}}>
          Try Again
        </button>
      </div>
    </div>
  );

  // ── HISTORY ───────────────────────────────────────────────────────────────
  if (phase==='history') {
    const cats = ['All',...[...new Set(sessions.map(s=>s.category))]];
    const filtered = histFilter==='All' ? sessions : sessions.filter(s=>s.category===histFilter);
    return (
      <div style={{padding:isDesktop?'32px 0':'16px 0'}}>
        <button onClick={goHome} style={cs.back}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:24,fontWeight:600,color:T2.text,marginBottom:16}}>Session History</h2>
        <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setHistFilter(c)} style={{padding:'6px 14px',borderRadius:20,border:`0.5px solid ${histFilter===c?T.gold:'rgba(44,36,22,0.15)'}`,background:histFilter===c?'rgba(138,158,132,0.1)':'transparent',fontFamily:T.sans,fontSize:11,color:histFilter===c?T.gold:'rgba(44,36,22,0.45)',cursor:'pointer',fontWeight:histFilter===c?600:400}}>{c}</button>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {filtered.map((s,i)=>(
            <div key={i} style={{background:'rgba(237,232,223,0.6)',border:'0.5px solid rgba(44,36,22,0.08)',borderRadius:8,padding:'14px 16px',display:'flex',alignItems:'center',gap:14}}>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?30:26,fontWeight:600,color:s.overall>=80?T.gold:'#8A7B66',flexShrink:0,width:52,textAlign:'center'}}>{s.overall}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:T.sans,fontSize:13,fontWeight:500,color:'#2C2416',marginBottom:2}}>{s.scenario}</div>
                <div style={{fontFamily:T.sans,fontSize:11,color:'rgba(44,36,22,0.4)',marginBottom:s.scores?6:0}}>{s.date} · {s.category}</div>
                {s.scores && (
                  <div style={{display:'flex',gap:8}}>
                    {DIMS.map(d=>(
                      <div key={d} style={{textAlign:'center'}}>
                        <div style={{fontFamily:T.sans,fontSize:8,color:'rgba(44,36,22,0.3)',letterSpacing:'0.5px'}}>{d.slice(0,2).toUpperCase()}</div>
                        <div style={{fontFamily:T.serif,fontSize:12,fontWeight:600,color:s.scores[d]>=80?T.gold:'rgba(44,36,22,0.45)'}}>{s.scores[d]}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── SCENARIO LIBRARY ──────────────────────────────────────────────────────
  if (phase==='library') {
    const cats = [...new Set(SCENARIOS.map(s=>s.category))];
    return (
      <div style={{padding:isDesktop?'32px 0':'16px 0'}}>
        <button onClick={goHome} style={cs.back}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:24,fontWeight:600,color:T2.text,marginBottom:6}}>All Scenarios</h2>
        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,fontWeight:300,marginBottom:20}}>30 scenarios. Choose any to practise now.</p>
        {cats.map(cat=>(
          <div key={cat} style={{marginBottom:24}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:CAT_COLORS[cat]||T.gold,textTransform:'uppercase',letterSpacing:'2px',marginBottom:10}}>{cat}</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {SCENARIOS.filter(s=>s.category===cat).map(s=>(
                <div key={s.id} onClick={()=>goChallenge(s)}
                  style={{background:'rgba(237,232,223,0.6)',border:'0.5px solid rgba(44,36,22,0.08)',borderRadius:8,padding:'14px 16px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,transition:'border-color 0.15s'}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:T.sans,fontSize:10,color:'rgba(44,36,22,0.4)',marginBottom:4}}>{s.tag}</div>
                    <div style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:'#2C2416',lineHeight:1.3,marginBottom:4}}>{s.title}</div>
                    <p style={{fontFamily:T.sans,fontSize:12,color:'rgba(44,36,22,0.55)',lineHeight:1.6,margin:0,fontStyle:'italic'}}>"{s.prompt}"</p>
                  </div>
                  <span style={{fontFamily:T.sans,fontSize:13,color:T.gold,flexShrink:0,marginTop:2}}>→</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
