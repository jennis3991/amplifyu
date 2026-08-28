import { useState, useEffect } from 'react';
import { ROLES, LESSONS } from '../data.js';

// ─── D14 Theory — Competence-Confidence Loop (circular diagram) ────────────
// Five pill nodes arranged in a pentagon, connected by curved arrows that
// close back to "Practice" — a true loop rather than a wrapping row of pills.
export function D14LoopDiagram({ T, T2, isDesktop }) {
  const STEPS = [
    { label: 'Practice', icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <path d="M4 10a6 6 0 0110-4.5M16 3v4h-4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 10a6 6 0 01-10 4.5M4 17v-4h4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { label: 'Competence', icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke={T.gold} strokeWidth="1.3"/>
        <path d="M7 10l2 2 4-4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { label: 'Confidence', icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <polygon points="10,2 12.5,7.3 18,8 14,11.8 15,17.5 10,14.8 5,17.5 6,11.8 2,8 7.5,7.3" stroke={T.gold} strokeWidth="1.1" strokeLinejoin="round"/>
      </svg>
    )},
    { label: 'Action', icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <path d="M4 10h11M10 5l5 5-5 5" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { label: 'Growth', icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <path d="M10 17V9" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M10 9C10 6 7.3 5 5 5c0 3 2.3 5 5 5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M10 11c0-2.7 2.3-4 4.5-4 0 2.7-1.8 4.5-4.5 4.5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    )},
  ];

  // A true circle (not an ellipse) — nodes sit evenly on its circumference
  // and the connecting arrows are drawn as literal arcs of that same circle,
  // so the whole loop reads as one continuous ring rather than a squashed
  // oval with disjointed corner curves.
  const W = isDesktop ? 520 : 320, H = isDesktop ? 380 : 245;
  const cx = W / 2, cy = isDesktop ? 200 : 130;
  const R = isDesktop ? 150 : 92;
  const angleInset = isDesktop ? 20 : 22; // degrees trimmed off each end so the visible arc sits mostly in the open gap between pills

  const angle = (i) => -90 + i * 72;
  const ptAt = (deg) => {
    const rad = deg * Math.PI / 180;
    return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
  };

  const pts = STEPS.map((_, i) => ptAt(angle(i)));

  const paths = STEPS.map((_, i) => {
    const a1 = angle(i) + angleInset;
    const a2 = angle(i + 1) - angleInset;
    const s = ptAt(a1), e = ptAt(a2);
    return `M ${s.x.toFixed(1)} ${s.y.toFixed(1)} A ${R} ${R} 0 0 1 ${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
  });

  const iconSize = isDesktop ? 20 : 15;

  return (
    <div style={{position: 'relative', width: '100%', maxWidth: W, aspectRatio: `${W} / ${H}`, margin: isDesktop ? '24px auto' : '16px auto'}}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', top: 0, left: 0}}>
        <defs>
          <marker id="d14loop-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="rgba(138,158,132,0.6)"/>
          </marker>
        </defs>
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="rgba(138,158,132,0.55)" strokeWidth={isDesktop ? 1.6 : 1.3} markerEnd="url(#d14loop-arrow)"/>
        ))}
      </svg>
      {STEPS.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: (pts[i].x / W * 100) + '%', top: (pts[i].y / H * 100) + '%', transform: 'translate(-50%,-50%)',
          display: 'flex', alignItems: 'center', gap: isDesktop ? 10 : 6,
          padding: isDesktop ? '10px 20px' : '6px 12px', borderRadius: 24,
          // Solid (not translucent) fill — the arrows pass behind several of
          // these pills, and a tinted rgba fill let the stroke show through.
          background: T2.surface, border: '0.5px solid rgba(138,158,132,0.35)',
          whiteSpace: 'nowrap',
        }}>
          {s.icon(iconSize)}
          <span style={{fontFamily: T.serif, fontSize: isDesktop ? 16 : 13, fontWeight: 600, color: T.gold}}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── D14 Practice Widget — Your Journey ─────────────────────────────────────
// "What held you back most at the start?" restates the onboarding
// "challenge" question (au1_quiz) almost verbatim, just trimmed of
// punctuation — so a saved onboarding answer can prefill it directly.
const SHIFT_OPTIONS = [
  "Speaking up confidently with senior leaders",
  "Structuring my thoughts clearly under pressure",
  "Making my work visible and getting credit for it",
  "Setting boundaries and asserting myself",
];
const normalizeForMatch = (s) => (s || '').toLowerCase().replace(/[—\-.,]/g, '').replace(/\s+/g, ' ').trim();

export function D14PracticeWidget({T, T2, isDesktop, onSimulation, onNavLabel, onNavFn}) {
  const stored = (() => { try { return JSON.parse(localStorage.getItem('au1_d14_reflection') || '{}'); } catch { return {}; } })();
  const storedAmbition = (() => { try { return localStorage.getItem('au1_ambition') || ''; } catch { return ''; } })();
  const quiz = (() => { try { return JSON.parse(localStorage.getItem('au1_quiz') || '{}'); } catch { return {}; } })();
  const matchedShift = (() => {
    const target = normalizeForMatch(quiz.challenge);
    if (!target) return '';
    return SHIFT_OPTIONS.find(o => normalizeForMatch(o) === target) || '';
  })();

  const [phase, setPhase] = useState('intro');
  const [jobTitle, setJobTitle] = useState(stored.jobTitle || '');
  const [knownFor, setKnownFor] = useState(stored.knownFor || storedAmbition || '');
  const [shift, setShift] = useState(stored.shift || matchedShift || '');
  const [proud, setProud] = useState(stored.proud || '');
  const [hard, setHard] = useState(stored.hard || '');

  const save = (s, p, h) => {
    try { localStorage.setItem('au1_d14_reflection', JSON.stringify({jobTitle, knownFor, shift:s, proud:p, hard:h})); } catch {}
  };

  const cs = {
    card: {background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"18px"},
    label: {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:10},
    cta: {width:"100%", padding:isDesktop?"14px":"13px", borderRadius:4, border:"none", background:T.ink, color:T.bg, fontSize:isDesktop?15:14, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:48, transition:"all 0.2s"},
    input: {width:"100%", background:"transparent", border:"none", borderBottom:"0.5px solid "+T2.divider, padding:"8px 0 10px", fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text, outline:"none", lineHeight:1.65, boxSizing:"border-box"},
  };

  const Chip = ({label, selected, onClick}) => (
    <button onClick={onClick} style={{
      width:"100%", padding:isDesktop?"12px 16px":"11px 14px", borderRadius:4, textAlign:"left", cursor:"pointer", transition:"all 0.15s",
      border:"0.5px solid "+(selected?T.gold:T2.border),
      background:selected?"rgba(138,158,132,0.12)":"transparent",
      fontFamily:T.sans, fontSize:isDesktop?13:12, fontWeight:selected?600:400,
      color:selected?T.gold:T2.text, lineHeight:1.4,
    }}>{label}</button>
  );

  const Q = ({label, options, value, onChange}) => (
    <div style={cs.card}>
      <div style={cs.label}>{label}</div>
      <div style={{display:"flex", flexDirection:"column", gap:7}}>
        {options.map((o,i) => <Chip key={i} label={o} selected={value===o} onClick={() => onChange(o)}/>)}
      </div>
    </div>
  );

  const canSubmit = jobTitle.trim() && knownFor.trim() && shift && proud && hard;

  useEffect(() => {
    if (!onNavLabel) return;
    if (phase === 'done') {
      onNavLabel("Continue");
      if (onNavFn) onNavFn.current = () => onSimulation?.();
    } else {
      onNavLabel(null);
      if (onNavFn) onNavFn.current = null;
    }
  }, [phase]);

  if (phase === 'intro') return (
    <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Communication Blueprint</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:"0 0 12px"}}>14 days. One journey. Time to see how far you have come.</p>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:'0 0 14px'}}>Most training is forgotten within 24 hours. AmplifyU works differently — 14 days of embedded practice, built into your routine, crystallising today into a blueprint that is yours to keep.</p>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(138,158,132,0.08)',borderRadius:20,padding:'7px 14px',border:'0.5px solid rgba(138,158,132,0.22)'}}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5"/>
            <path d="M10 6v4l2.5 2" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:'rgba(138,158,132,0.8)',letterSpacing:'0.05em'}}>1 min warm-up</span>
        </div>
      </div>
      <div style={{...cs.card, background:"rgba(138,158,132,0.04)"}}>
        <div style={cs.label}>Your Day 14 Blueprint includes</div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {[
            "Your Communication Archetype and personal profile",
            "Your journey — where you started and what shifted",
            "Strengths you have built and gaps to close",
            "Your Personal Brand Statement",
            "Daily, weekly and monthly communication habits",
            "Three conversations to have in the next 30 days",
            "Three opportunities to create in the next 90 days",
            "Your personalised 90-Day Action Plan",
          ].map((t,i) => (
            <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start"}}>
              <span style={{color:T.gold, fontSize:12, flexShrink:0, marginTop:2}}>&#10022;</span>
              <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text, lineHeight:1.5}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => setPhase('form')} style={cs.cta}>Get Started</button>
    </div>
  );

  if (phase === 'form') return (
    <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>

      <div style={cs.card}>
        <div style={cs.label}>Your role</div>
        <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Current job title — e.g. Head of Product, Senior Consultant" style={cs.input}/>
        <div style={{marginTop:18}}>
          <div style={cs.label}>In 12 months, what do you most want to be known for?</div>
          <input value={knownFor} onChange={e => setKnownFor(e.target.value)} placeholder="e.g. Strategic clarity, inspiring leadership, visible expertise" style={cs.input}/>
        </div>
      </div>

      <Q
        label="What held you back most at the start?"
        options={SHIFT_OPTIONS}
        value={shift}
        onChange={setShift}
      />

      <Q
        label="Where did you feel the biggest change?"
        options={[
          "My confidence when I speak",
          "How I structure and land my points",
          "How I tell stories and make ideas stick",
          "Honestly — not much has changed yet",
        ]}
        value={proud}
        onChange={setProud}
      />

      <Q
        label="What still feels hardest?"
        options={[
          "Speaking up in high-stakes or senior moments",
          "Making my ambition visible without it feeling forced",
          "Staying calm and present under pressure",
          "Turning good ideas into clear, compelling messages",
        ]}
        value={hard}
        onChange={setHard}
      />

      <button
        onClick={() => { save(shift, proud, hard); setPhase('done'); }}
        disabled={!canSubmit}
        style={{...cs.cta, background:canSubmit?T.ink:"rgba(44,36,22,0.2)", cursor:canSubmit?"pointer":"not-allowed"}}>
        Save and Continue
      </button>
    </div>
  );

  return (
    <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>
      <div style={{...cs.card, textAlign:"center", padding:isDesktop?"32px":"24px"}}>
        <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px", marginBottom:12}}>Done</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?22:18, fontWeight:600, color:T2.text, lineHeight:1.3, margin:"0 0 14px"}}>Your answers are saved.</p>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:0}}>Head to the Simulation tab to generate your personalised Communication Blueprint.</p>
      </div>
      <button onClick={() => setPhase('form')} style={{...cs.cta, background:"transparent", border:"0.5px solid "+T2.border, color:T2.text3}}>Edit My Answers</button>
    </div>
  );
}

// ─── D14 Simulation Widget — AI Communication Blueprint ──────────────────────
export function D14SimWidget({T, T2, isDesktop}) {
  const [phase, setPhase] = useState('intro');
  const [blueprint, setBlueprint] = useState(null);
  const [error, setError] = useState('');

  const cs = {
    card: {background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"18px"},
    label: {fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8},
    cta: {width:"100%", padding:isDesktop?"14px":"13px", borderRadius:4, border:"none", background:T.ink, color:T.bg, fontSize:isDesktop?15:14, fontWeight:600, cursor:"pointer", fontFamily:T.sans, minHeight:48, transition:"all 0.2s"},
  };

  const generate = async () => {
    setPhase('generating');
    setError('');

    const safe = (k, d) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : d; } catch { return d; } };
    const quiz = safe('au1_quiz', {});
    const done = safe('au1_done', []);
    const roleId = safe('au1_role', null);
    const roleObj = ROLES.find(r => r.id === roleId) || null;
    const ambition = (() => { try { return localStorage.getItem('au1_ambition') || ''; } catch { return ''; } })();
    const reflection = safe('au1_d14_reflection', {});
    const ntStory = (() => { try { return localStorage.getItem('au1_nt_story') || ''; } catch { return ''; } })();

    // Layer 2: backend data slots — gracefully omitted until backend integration
    const l2 = {
      clarityScoreDay1: safe('au1_clarity_score_day1', null),
      speechRateDay2: safe('au1_speech_rate_day2', null),
      fillerRateDay3: safe('au1_filler_rate_day3', null),
      d8Story: (() => { try { return localStorage.getItem('au1_d8_story') || (ntStory ? ntStory.slice(0, 300) : null); } catch { return null; } })(),
      d9Scores: safe('au1_d9_scores', null),
      d10Sar: safe('au1_d10_sar', null),
      d13Scores: safe('au1_d13_scores', null),
    };

    const completedTitles = [...done].sort((a,b) => a-b).map(d => {
      const lesson = LESSONS[d-1];
      return lesson ? ('Day ' + d + ': ' + lesson.title) : ('Day ' + d);
    });

    const l2Lines = [];
    if (l2.clarityScoreDay1) l2Lines.push('Day 1 clarity baseline: ' + l2.clarityScoreDay1);
    if (l2.speechRateDay2) l2Lines.push('Day 2 speech rate: ' + l2.speechRateDay2 + ' wpm');
    if (l2.fillerRateDay3) l2Lines.push('Day 3 filler word rate: ' + l2.fillerRateDay3);
    if (l2.d8Story) l2Lines.push('Day 8 personal story: ' + l2.d8Story);
    if (l2.d9Scores) l2Lines.push('Day 9 delivery scores: ' + JSON.stringify(l2.d9Scores));
    if (l2.d10Sar) l2Lines.push('Day 10 SAR story: ' + JSON.stringify(l2.d10Sar));
    if (l2.d13Scores) l2Lines.push('Day 13 networking circuit scores: ' + JSON.stringify(l2.d13Scores));

    const roleLine = roleObj ? (roleObj.label + (roleObj.challenge ? ' — ' + roleObj.challenge : '')) : 'Professional';

    const prompt = 'You are an expert communication coach creating a deeply personalised Communication Blueprint for someone who has just completed a 14-day communication development programme.\n\n'
      + 'PROFILE:\n'
      + 'Role: ' + roleLine + '\n'
      + 'Job title: ' + (reflection.jobTitle || 'not provided') + '\n'
      + 'Days completed (' + done.length + ' of 14): ' + (completedTitles.join(', ') || 'not recorded') + '\n\n'
      + 'ONBOARDING BASELINE (Day 1):\n'
      + 'What held them back: ' + (quiz.challenge || 'not recorded') + '\n'
      + 'Where they wanted to grow: ' + (quiz.context || 'not recorded') + '\n'
      + 'Starting self-assessment: ' + (quiz.level || 'not recorded') + '\n'
      + '18-month ambition: ' + (quiz.ambition || ambition || 'not recorded') + '\n\n'
      + 'THEIR JOURNEY (in their own words):\n'
      + 'When things shifted: ' + (reflection.shift || 'not provided') + '\n'
      + 'Proudest moment: ' + (reflection.proud || 'not provided') + '\n'
      + 'Biggest remaining gap: ' + (reflection.hard || 'not provided') + '\n'
      + 'What they want to be known for: ' + (reflection.knownFor || 'not provided') + '\n'
      + (l2Lines.length > 0 ? '\nPERFORMANCE DATA:\n' + l2Lines.join('\n') + '\n' : '')
      + '\nCreate a comprehensive, deeply personalised Communication Blueprint. Use their own words where possible. Be specific, direct, warm and motivating. Tailor everything to their role, level, and the gaps they named.\n\n'
      + 'Respond ONLY with valid JSON (no markdown, no preamble):\n'
      + '{"journey":"3-4 sentences telling their communication story — where they started, the shift, what has been built. Quote their own words where powerful.","archetype":"their communication archetype name (2-4 words)","archetypeDesc":"2-3 sentences on this archetype and why it fits this person specifically","strengths":["strength 1 specific to their journey","strength 2","strength 3"],"gaps":["gap 1 honest and specific","gap 2"],"brandStatement":"personal brand statement in first person tailored to their role and ambition","daily":["daily habit 1 specific to them","daily habit 2","daily habit 3"],"weekly":["weekly habit 1","weekly habit 2","weekly habit 3"],"monthly":["monthly habit 1","monthly habit 2","monthly habit 3"],"conversations":[{"who":"specific person or type","what":"exactly what to say or do","why":"why this conversation matters now"},{"who":"...","what":"...","why":"..."},{"who":"...","what":"...","why":"..."}],"opportunities":[{"title":"short title","action":"specific action","timeline":"30 days"},{"title":"...","action":"...","timeline":"60 days"},{"title":"...","action":"...","timeline":"90 days"}],"planPhases":[{"phase":"Days 1-30","focus":"one-line focus","actions":["action 1","action 2","action 3"]},{"phase":"Days 31-60","focus":"one-line focus","actions":["action 1","action 2","action 3"]},{"phase":"Days 61-90","focus":"one-line focus","actions":["action 1","action 2","action 3"]}],"closing":"one powerful personal closing sentence"}';

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          messages: [{role: 'user', content: prompt}],
          max_tokens: 2000,
        }),
      });
      const data = await res.json();
      const text = (data.content && data.content[0] && data.content[0].text) || '';
      const m = text.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      if (parsed && parsed.journey) {
        setBlueprint(parsed);
        setPhase('blueprint');
      } else {
        setError('Something went wrong generating your blueprint. Please try again.');
        setPhase('intro');
      }
    } catch(e) {
      setError('Something went wrong. Please try again.');
      setPhase('intro');
    }
  };

  const hasReflection = (() => {
    try { const r = JSON.parse(localStorage.getItem('au1_d14_reflection') || '{}'); return !!(r.shift || r.proud || r.hard); } catch { return false; }
  })();

  if (phase === 'intro') return (
    <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Communication Blueprint</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:"0 0 12px"}}>Your personalised plan. Built from 14 days of work.</p>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:0}}>Your AmplifyU Coach will analyse your role, your journey, your strengths and gaps — and generate a blueprint that is specific to you.</p>
      </div>
      {!hasReflection && (
        <div style={{...cs.card, background:"rgba(201,120,70,0.06)", border:"0.5px solid rgba(201,120,70,0.25)"}}>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:"#C97846", lineHeight:1.6, margin:0}}>For a more personal blueprint, complete the Rehearsal tab first — your reflection answers make a significant difference.</p>
        </div>
      )}
      {error && (
        <div style={{...cs.card, background:"rgba(201,120,70,0.06)", border:"0.5px solid rgba(201,120,70,0.25)"}}>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:"#C97846", lineHeight:1.6, margin:0}}>{error}</p>
        </div>
      )}
      <button onClick={generate} style={cs.cta}>Generate My Blueprint</button>
    </div>
  );

  if (phase === 'generating') return (
    <div style={{...cs.card, textAlign:"center", padding:isDesktop?"48px 32px":"32px 24px"}}>
      <div style={cs.label}>Your Coach is Working</div>
      <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.4, margin:"0 0 12px"}}>Building your personalised blueprint...</p>
      <p style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text4, lineHeight:1.6, margin:0}}>Analysing your journey, your role, and your reflection. This takes around 15 seconds.</p>
    </div>
  );

  if (phase === 'blueprint' && blueprint) {
    const Sec = ({label, children, accent}) => (
      <div style={{...cs.card, ...(accent ? {background:"rgba(138,158,132,0.05)", borderLeft:"2px solid "+T.gold} : {})}}>
        <div style={cs.label}>{label}</div>
        {children}
      </div>
    );

    return (
      <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>

        <Sec label="Your Journey" accent>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?15:14, color:T2.text, lineHeight:1.8, margin:0}}>{blueprint.journey}</p>
        </Sec>

        <Sec label="Communication Archetype">
          <div style={{fontFamily:T.serif, fontSize:isDesktop?26:21, fontWeight:600, color:T.gold, marginBottom:10}}>{blueprint.archetype}</div>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text, lineHeight:1.7, margin:0}}>{blueprint.archetypeDesc}</p>
        </Sec>

        <div style={{display:"flex", flexDirection:isDesktop?"row":"column", gap:12}}>
          <div style={{...cs.card, flex:1, background:"rgba(138,158,132,0.05)"}}>
            <div style={cs.label}>Strengths Built</div>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              {(blueprint.strengths||[]).map((s,i) => (
                <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start"}}>
                  <span style={{color:T.gold, fontSize:14, flexShrink:0, marginTop:1, lineHeight:1}}>&#10003;</span>
                  <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text, lineHeight:1.6}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{...cs.card, flex:1, background:"rgba(201,120,70,0.04)", border:"0.5px solid rgba(201,120,70,0.2)"}}>
            <div style={{...cs.label, color:"#C97846"}}>Gaps to Close</div>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              {(blueprint.gaps||[]).map((g,i) => (
                <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start"}}>
                  <span style={{color:"#C97846", fontSize:14, flexShrink:0, marginTop:1, lineHeight:1}}>&#8594;</span>
                  <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text, lineHeight:1.6}}>{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Sec label="Your Personal Brand Statement" accent>
          <p style={{fontFamily:T.serif, fontSize:isDesktop?17:15, fontStyle:"italic", color:T2.text, lineHeight:1.7, margin:"0 0 10px"}}>{blueprint.brandStatement}</p>
          <p style={{fontFamily:T.sans, fontSize:11, color:T2.text4, margin:0}}>Say it out loud. Refine it in your voice. Then own it.</p>
        </Sec>

        {[
          {key:"daily", label:"Daily Habits", note:"Every day. Consistency beats intensity."},
          {key:"weekly", label:"Weekly Habits", note:"Set a reminder. Keep the momentum."},
          {key:"monthly", label:"Monthly Habits", note:"Step back. Review. Recommit."},
        ].map(({key, label, note}) => (
          <Sec key={key} label={label}>
            <div style={{display:"flex", flexDirection:"column", gap:10, marginBottom:8}}>
              {(blueprint[key]||[]).map((h,i) => (
                <div key={i} style={{display:"flex", gap:12, alignItems:"flex-start"}}>
                  <div style={{width:20, height:20, borderRadius:"50%", border:"1px solid rgba(138,158,132,0.4)", background:"rgba(138,158,132,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1}}>
                    <span style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold}}>{i+1}</span>
                  </div>
                  <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text, lineHeight:1.65}}>{h}</span>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.sans, fontSize:11, fontStyle:"italic", color:T2.text4, margin:0}}>{note}</p>
          </Sec>
        ))}

        <Sec label="Three Conversations to Have in the Next 30 Days">
          <div style={{display:"flex", flexDirection:"column", gap:14}}>
            {(blueprint.conversations||[]).map((c,i) => (
              <div key={i} style={{paddingBottom:i<2?14:0, borderBottom:i<2?"0.5px solid "+T2.divider:"none"}}>
                <div style={{fontFamily:T.sans, fontSize:11, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1px", marginBottom:5}}>{"Conversation " + (i+1) + " · " + c.who}</div>
                <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text, lineHeight:1.65, margin:"0 0 5px"}}>{c.what}</p>
                <p style={{fontFamily:T.sans, fontSize:12, color:T2.text4, margin:0, fontStyle:"italic"}}>{c.why}</p>
              </div>
            ))}
          </div>
        </Sec>

        <Sec label="Three Opportunities to Create in the Next 90 Days">
          <div style={{display:"flex", flexDirection:"column", gap:14}}>
            {(blueprint.opportunities||[]).map((o,i) => (
              <div key={i} style={{paddingBottom:i<2?14:0, borderBottom:i<2?"0.5px solid "+T2.divider:"none"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:5}}>
                  <div style={{fontFamily:T.sans, fontSize:11, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1px"}}>{o.title}</div>
                  <div style={{fontFamily:T.sans, fontSize:10, color:T2.text4, flexShrink:0, marginLeft:8}}>{o.timeline}</div>
                </div>
                <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text, lineHeight:1.65, margin:0}}>{o.action}</p>
              </div>
            ))}
          </div>
        </Sec>

        <Sec label="Your 90-Day Action Plan">
          <div style={{display:"flex", flexDirection:"column", gap:16}}>
            {(blueprint.planPhases||[]).map((p,i) => (
              <div key={i} style={{paddingBottom:i<2?16:0, borderBottom:i<2?"0.5px solid "+T2.divider:"none"}}>
                <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
                  <div style={{fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1px", flexShrink:0}}>{p.phase}</div>
                  <div style={{height:1, flex:1, background:T2.divider}}/>
                  <div style={{fontFamily:T.sans, fontSize:11, color:T2.text3, fontStyle:"italic", flexShrink:0}}>{p.focus}</div>
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:7}}>
                  {(p.actions||[]).map((a,ai) => (
                    <div key={ai} style={{display:"flex", gap:10, alignItems:"flex-start"}}>
                      <span style={{color:T.gold, fontSize:12, flexShrink:0, marginTop:3}}>&#8594;</span>
                      <span style={{fontFamily:T.sans, fontSize:isDesktop?13:12, color:T2.text, lineHeight:1.6}}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Sec>

        <div style={{...cs.card, textAlign:"center", padding:isDesktop?"32px":"24px", background:"rgba(138,158,132,0.04)", border:"0.5px solid rgba(138,158,132,0.2)"}}>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?18:16, fontWeight:600, color:T2.text, lineHeight:1.55, margin:"0 0 12px"}}>{blueprint.closing}</p>
          <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, fontStyle:"italic", color:T.gold, margin:0}}>You are not the communicator you were 14 days ago.</p>
        </div>

        <button onClick={() => { setPhase('intro'); setBlueprint(null); }} style={{...cs.cta, background:"transparent", border:"0.5px solid "+T2.border, color:T2.text3}}>Regenerate Blueprint</button>
      </div>
    );
  }

  return null;
}
