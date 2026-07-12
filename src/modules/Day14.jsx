import { useState } from 'react';
import { ROLES, LESSONS } from '../data.js';

// ─── D14 Practice Widget — Your Journey ─────────────────────────────────────
export function D14PracticeWidget({T, T2, isDesktop}) {
  const stored = (() => { try { return JSON.parse(localStorage.getItem('au1_d14_reflection') || '{}'); } catch { return {}; } })();
  const storedAmbition = (() => { try { return localStorage.getItem('au1_ambition') || ''; } catch { return ''; } })();

  const [phase, setPhase] = useState('intro');
  const [jobTitle, setJobTitle] = useState(stored.jobTitle || '');
  const [knownFor, setKnownFor] = useState(stored.knownFor || storedAmbition || '');
  const [shift, setShift] = useState(stored.shift || '');
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

  if (phase === 'intro') return (
    <div style={{display:"flex", flexDirection:"column", gap:isDesktop?14:12}}>
      <div style={cs.card}>
        <div style={cs.label}>Your Communication Blueprint</div>
        <p style={{fontFamily:T.serif, fontSize:isDesktop?20:17, fontWeight:600, color:T2.text, lineHeight:1.3, margin:"0 0 12px"}}>14 days. One journey. Time to see how far you have come.</p>
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:0}}>Five quick taps and two short answers — then your coach generates your personalised blueprint.</p>
      </div>
      <div style={{...cs.card, background:"rgba(138,158,132,0.04)"}}>
        <div style={cs.label}>What you will receive</div>
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
        options={[
          "Speaking up confidently with senior leaders",
          "Structuring my thoughts clearly under pressure",
          "Making my work visible and getting credit for it",
          "Setting boundaries and asserting myself",
        ]}
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
        <p style={{fontFamily:T.sans, fontSize:isDesktop?14:13, color:T2.text3, lineHeight:1.65, margin:0}}>Your AI coach will analyse your role, your journey, your strengths and gaps — and generate a blueprint that is specific to you.</p>
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
          <p style={{fontFamily:T.serif, fontSize:isDesktop?18:16, fontWeight:600, color:T2.text, lineHeight:1.55, margin:"0 0 12px"}}>{blueprint.closing}</p>
          <p style={{fontFamily:T.serif, fontSize:isDesktop?14:13, fontStyle:"italic", color:T.gold, margin:0}}>You are not the communicator you were 14 days ago.</p>
        </div>

        <button onClick={() => { setPhase('intro'); setBlueprint(null); }} style={{...cs.cta, background:"transparent", border:"0.5px solid "+T2.border, color:T2.text3}}>Regenerate Blueprint</button>
      </div>
    );
  }

  return null;
}
