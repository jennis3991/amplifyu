import { useState, useRef } from 'react';
import { T } from '../theme.js';

export function D6PracticeWidget({T, T2, isDesktop}) {
  const DRILLS = [
    {label:"Disagree With Leadership", goal:"Calm disagreement",
     prompt:'"I respect the direction, but I have a different perspective."',
     coaching:"Say this slowly. Drop your tone on 'different perspective'. Don't soften the disagreement — honour it. The calm in your voice carries the message.",
     variations:["Say it as nervous","Say it as calm","Say it as firm and warm","Say it as executive authority"]},
    {label:"Raise Difficult Feedback", goal:"Warm directness",
     prompt:'"I wanted to raise something I\'ve noticed."',
     coaching:"Let the pause after 'noticed' do the work. Composure here signals safety — the other person will lean in rather than close down.",
     variations:["Say it as hesitant","Say it as compassionate","Say it as overly apologetic","Say it as clear and grounded"]},
    {label:"Hold a Boundary", goal:"Firm calm",
     prompt:'"I can\'t commit to that timeline without compromising quality."',
     coaching:"The word 'quality' is your anchor. Speak it with conviction. This isn't a request — it's a clear position. Calm, not cold.",
     variations:["Say it as defensive","Say it as firm and professional","Say it as apologetic","Say it as confident and direct"]},
    {label:"Respond to Criticism", goal:"Non-reactive control",
     prompt:'"That\'s useful feedback. Let me think about that."',
     coaching:"This is one of the most powerful phrases in high-stakes communication. Pause before you say it. Mean it. The composure in those seven words builds credibility instantly.",
     variations:["Say it as rattled","Say it as calm and open","Say it as dismissive","Say it as composed authority"]},
  ];
  const [open, setOpen] = useState(null);

  if (isDesktop) return (
    <>
      <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,marginBottom:20}}>Scenario Drills</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:40}}>
        {DRILLS.map((d,i) => (
          <div key={i} onClick={()=>setOpen(open===i?null:i)}
            style={{background:T2.surface,borderRadius:4,border:`0.5px solid ${open===i?T.gold:T2.border}`,padding:"22px",cursor:"pointer",transition:"border-color 0.2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open===i?16:0}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{d.goal}</div>
                <p style={{fontFamily:T.serif,fontSize:17,fontWeight:600,color:T2.text,margin:0,lineHeight:1.3}}>{d.label}</p>
              </div>
              <span style={{fontFamily:T.sans,fontSize:12,color:open===i?T.gold:T2.text4,marginLeft:12,flexShrink:0}}>{open===i?"▴":"▸"}</span>
            </div>
            {open===i && (
              <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:16}}>
                <div style={{background:T2.bg,borderRadius:4,padding:"16px 18px",marginBottom:16,borderLeft:"2px solid "+T.gold}}>
                  <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>{d.prompt}</p>
                </div>
                <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.7,marginBottom:16}}>{d.coaching}</p>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Tone Variations</div>
                {d.variations.map((v,j) => (
                  <div key={j} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:j<d.variations.length-1?"0.5px solid "+T2.divider:"none"}}>
                    <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0}}/>
                    <span style={{fontFamily:T.sans,fontSize:13,color:T2.text2}}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {DRILLS.map((d,i) => (
        <div key={i} onClick={()=>setOpen(open===i?null:i)}
          style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open===i?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"16px",cursor:"pointer",transition:"border-color 0.2s",marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:open===i?12:0}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{d.goal}</div>
              <p style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text,margin:0,lineHeight:1.3}}>{d.label}</p>
            </div>
            <span style={{fontFamily:T.sans,fontSize:12,color:open===i?T.gold:T2.text4,marginLeft:10,flexShrink:0}}>{open===i?"▴":"▸"}</span>
          </div>
          {open===i && (
            <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:12}}>
              <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"2px solid "+T.gold,padding:"12px 14px",marginBottom:12,borderRadius:3}}>
                <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>{d.prompt}</p>
              </div>
              <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.65,marginBottom:12}}>{d.coaching}</p>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Tone Variations</div>
              {d.variations.map((v,j) => (
                <div key={j} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:j<d.variations.length-1?"0.5px solid rgba(138,158,132,0.15)":"none"}}>
                  <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0}}/>
                  <span style={{fontFamily:T.sans,fontSize:12,color:T2.text2}}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ─── D6 Simulation Widget ──────────────────────────────────────────────────
export function D6SimWidget({T, T2, isDesktop}) {
  const SCENARIOS = [
    {id:0, label:"Difficult Feedback", sub:"Someone who feels singled out.",
     aiOpener:'"I have to be honest — I feel like I\'m being singled out here."',
     goal:"Empathy + composure",
     followUps:["Others aren't being held to the same standard.","I've worked really hard and this doesn't feel fair.","Why is this only coming up now?"],
     starters:["I hear that, and I want to understand more…","That's not my intention, and I appreciate you telling me…","Let me be clear about what I'm seeing — and I want to hear your view too…"],
     script:{topic:"Addressing performance concerns",context:"A team member believes they're being treated unfairly. Your job is to stay calm, acknowledge the emotion, and move toward clarity.",
       beginner:'"I hear that you feel singled out, and I want to take that seriously. That\'s not my intention. What I can do is walk you through what I\'ve observed, and I want you to tell me where you see it differently. This should be a conversation — not a verdict."',
       intermediate:["Acknowledge: 'I hear that — and I want to understand what's behind it'","Don't defend — get curious: 'Can you tell me more about what you've noticed?'","Then be clear: state what you've observed calmly and specifically","Close: 'My goal is a conversation, not a confrontation'"]}},
    {id:1, label:"Leadership Disagreement", sub:"Your concern is being dismissed.",
     aiOpener:'"To be frank — I don\'t think your concern is valid here."',
     goal:"Calm authority",
     followUps:["We've already thought through this thoroughly.","I don't see the risk you're describing.","Let's move forward — we don't have time for this."],
     starters:["I respect where you're coming from, and here's what I'm seeing…","I want to make sure this concern gets a full hearing, because…","I hear you, and I still believe this is worth pausing on because…"],
     script:{topic:"Raising a risk that's being dismissed",context:"You've identified a risk. A senior leader isn't taking it seriously. Stay composed and make the case without escalating.",
       beginner:'"I appreciate the confidence in the current plan. I want to flag one specific concern — not to slow things down, but to make sure we\'ve accounted for it. The risk I\'m seeing is [X]. If it\'s already been addressed, great — I\'m happy to move on. If not, I think it\'s worth two minutes."',
       intermediate:["Don't react to the dismissal — stay calm and stay curious","Restate your concern clearly and specifically in one sentence","Invite engagement: 'Has this been considered, or should we look at it?'","Close by making it easy to engage: 'I'm not trying to block progress — I want to be confident we've covered it'"]}},
    {id:2, label:"Emotional Employee", sub:"Frustration about a recurring issue.",
     aiOpener:'"Honestly, I\'m frustrated. This keeps happening and nothing changes."',
     goal:"Steadiness + warmth",
     followUps:["Every time I raise it, it gets noted and forgotten.","I'm starting to wonder if it's even worth bringing things up.","It's demoralising."],
     starters:["I hear your frustration — it's legitimate…","You're right that this has come up before, and I want to be honest about where we are…","I don't want to give you a non-answer. Here's what I can actually commit to…"],
     script:{topic:"Responding to repeated frustration",context:"An employee has hit a wall — the same issue, the same response, no visible change. Your job is to acknowledge, not deflect.",
       beginner:'"Your frustration makes sense — and I\'m not going to tell you it shouldn\'t. You\'ve raised this before and you deserve a real answer. Here\'s what I can tell you right now, and here\'s what I\'m going to do differently this time. I want to come back to you by [date] with a specific update."',
       intermediate:["Don't minimise the frustration — validate it directly","Be honest: what's been done, what hasn't, and why","Name a specific next step with a timeframe","Show them this conversation was different: write it down with them if needed"]}},
    {id:3, label:"Boundary Under Pressure", sub:"Unrealistic deadline demand.",
     aiOpener:'"We need this by tomorrow. That\'s not negotiable."',
     goal:"Firm calm",
     followUps:["We don't have the luxury of more time.","Others are making it work.","This is a priority from the top — it has to happen."],
     starters:["I want to make this work — here's what I can realistically commit to…","I can deliver something by tomorrow, but here's the trade-off you should know about…","I hear the pressure. Let me tell you exactly what's possible and what isn't…"],
     script:{topic:"Holding a boundary on quality and timeline",context:"A deadline is unrealistic. You need to hold your position calmly without damaging the relationship or sounding obstructive.",
       beginner:'"I understand this is urgent, and I want to make sure we deliver something that actually works. If I commit to tomorrow, here\'s the trade-off: [specific quality issue]. I can get you [X] by tomorrow — a first version, clearly marked as such. Or I can deliver the full thing by [realistic date]. Tell me which serves you better."',
       intermediate:["Acknowledge the pressure: 'I hear the urgency'","State the trade-off clearly — not a complaint, just the reality","Offer a specific alternative: partial delivery or a revised date","Put the decision back with them: 'Which serves you better?'"]}},
  ];

  const [phase, setPhase] = useState('idle');
  const [sc, setSc] = useState(null);
  const [mode, setMode] = useState(null);
  const [difficulty, setDifficulty] = useState('beginner');
  const [userText, setUserText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [ownPrompt, setOwnPrompt] = useState('');
  const [followIdx, setFollowIdx] = useState(0);

  const reset = () => { setPhase('idle'); setSc(null); setMode(null); setDifficulty('beginner'); setUserText(''); setFeedback(null); setOwnPrompt(''); setFollowIdx(0); };

  const SCORES = ['Composure','Clarity','Empathy','Pace','Confidence','Executive Presence'];
  const generateFeedback = () => {
    const scores = SCORES.map(s => ({ label:s, val:Math.floor(Math.random()*25)+70 }));
    const notes = [
      "Strong composure — your tone stayed steady throughout. The opening acknowledged the emotion without being derailed by it. Consider adding one concrete next step to close with equal clarity.",
      "Very clear framing. Your position was stated once, firmly, and without escalation. The follow-through on empathy could be slightly warmer — but the structure was excellent.",
      "Excellent emotional steadiness. You validated the frustration without capitulating to it. The pace was controlled. One suggestion: a shorter sentence at the end would land harder.",
      "You held your ground with real poise. The boundary was clear, the alternative was practical, and the decision was returned to the other party — exactly right. Composure was visible throughout.",
    ];
    setFeedback({ scores, note: notes[Math.floor(Math.random()*notes.length)], followUp: sc?.followUps[Math.floor(Math.random()*sc.followUps.length)] });
    setPhase('feedback');
  };

  const cs = {
    card: { background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:isDesktop?"24px":"18px" },
    label: { fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8 },
    h3: { fontFamily:T.serif, fontSize:isDesktop?22:18, fontWeight:600, color:T2.text, marginBottom:4 },
    sub: { fontFamily:T.sans, fontSize:13, color:T2.text3, marginBottom:isDesktop?24:16 },
  };

  if (phase === 'idle') return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>Choose your scenario</div>
      {SCENARIOS.map(s => (
        <div key={s.id} onClick={()=>{setSc(s);setPhase('mode-select');}} style={{...cs.card,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s"}} className="au-lift">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>{s.goal}</div>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,marginBottom:4}}>{s.label}</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,margin:0,lineHeight:1.5}}>{s.sub}</p>
            </div>
            <span style={{fontFamily:T.sans,fontSize:12,color:T.gold,marginLeft:12,flexShrink:0}}>→</span>
          </div>
        </div>
      ))}
    </div>
  );

  if (phase === 'mode-select') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{...cs.card}}>
        <div style={cs.label}>The Opening</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>{sc.aiOpener}</p>
      </div>
      <div style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6}}>How do you want to approach this?</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <button onClick={()=>{setMode('guided');setPhase('setup');}} style={{...cs.card,cursor:"pointer",textAlign:"left",border:"0.5px solid "+T.gold}}>
          <div style={cs.label}>Guided</div>
          <div style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,marginBottom:6}}>Coach me through it</div>
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0}}>Get a script, coaching notes, and difficulty levels.</p>
        </button>
        <button onClick={()=>{setMode('own');setPhase('active');}} style={{...cs.card,cursor:"pointer",textAlign:"left"}}>
          <div style={cs.label}>Real conversation</div>
          <div style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,marginBottom:6}}>Use my own words</div>
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0}}>Write your natural response and get feedback.</p>
        </button>
      </div>
      <button onClick={reset} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Back to scenarios</button>
    </div>
  );

  if (phase === 'setup') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{...cs.card}}>
        <div style={cs.label}>The Opening</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>{sc.aiOpener}</p>
      </div>
      <div style={{...cs.card}}>
        <div style={cs.label}>Difficulty</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {['beginner','intermediate','advanced'].map(d=>(
            <button key={d} onClick={()=>setDifficulty(d)} style={{padding:"8px 16px",borderRadius:3,border:`0.5px solid ${difficulty===d?T.gold:T2.border}`,background:difficulty===d?"rgba(138,158,132,0.12)":"transparent",color:difficulty===d?T.gold:T2.text3,fontSize:12,fontWeight:difficulty===d?600:400,cursor:"pointer",fontFamily:T.sans,transition:"all 0.15s",minHeight:36,textTransform:"capitalize"}}>{d}</button>
          ))}
        </div>
        <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14}}>
          {difficulty==='beginner' && (
            <div>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Full Script</div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>{sc.script.beginner}</p>
            </div>
          )}
          {difficulty==='intermediate' && (
            <div>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Talking Points</div>
              {sc.script.intermediate.map((pt,i) => (
                <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
                  <div style={{color:T.gold,fontFamily:T.sans,fontSize:12,fontWeight:700,flexShrink:0,marginTop:2}}>{i+1}.</div>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.6,margin:0}}>{pt}</p>
                </div>
              ))}
            </div>
          )}
          {difficulty==='advanced' && (
            <div>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Speak Freely</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,margin:0}}>No script. No prompts. Respond naturally and let your coach evaluate composure, clarity, and executive presence.</p>
            </div>
          )}
        </div>
      </div>
      <button onClick={()=>setPhase('active')} style={{width:"100%",padding:"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Start Conversation →</button>
      <button onClick={()=>setPhase('mode-select')} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
    </div>
  );

  if (phase === 'active') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{...cs.card}}>
        <div style={cs.label}>They say</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?19:16,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>{sc.aiOpener}</p>
        {followIdx>0 && sc.followUps[followIdx-1] && (
          <div style={{marginTop:16,paddingTop:14,borderTop:"0.5px solid "+T2.divider}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(180,100,80,0.8)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>They push back</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.4,margin:0}}>{sc.followUps[followIdx-1]}</p>
          </div>
        )}
      </div>
      {mode==='own' && (
        <div style={{...cs.card}}>
          <div style={cs.label}>Your real conversation (optional context)</div>
          <textarea value={ownPrompt} onChange={e=>setOwnPrompt(e.target.value)} placeholder="Briefly describe your actual situation for more personalised coaching…" style={{width:"100%",minHeight:72,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:13,color:T2.text,resize:"none",outline:"none",lineHeight:1.6}}/>
        </div>
      )}
      <div style={{...cs.card}}>
        <div style={cs.label}>Your response</div>
        <textarea value={userText} onChange={e=>setUserText(e.target.value)} placeholder="Write what you'd say…" style={{width:"100%",minHeight:isDesktop?140:110,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:14,color:T2.text,resize:"none",outline:"none",lineHeight:1.6}}/>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {followIdx < sc.followUps.length && <button onClick={()=>setFollowIdx(i=>i+1)} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>They push back →</button>}
        <button onClick={generateFeedback} disabled={userText.trim().length<10} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"none",background:userText.trim().length>=10?T.ink:"rgba(44,36,22,0.3)",color:T.bg,fontSize:13,fontWeight:600,cursor:userText.trim().length>=10?"pointer":"not-allowed",fontFamily:T.sans,minHeight:44,transition:"background 0.2s"}}>Get Coaching →</button>
      </div>
      <button onClick={reset} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>← Start over</button>
    </div>
  );

  if (phase === 'feedback') return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{...cs.card}}>
        <div style={cs.label}>Coaching Assessment</div>
        {feedback.scores.map((s,i) => (
          <div key={i} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontFamily:T.sans,fontSize:12,color:T2.text,fontWeight:500}}>{s.label}</span>
              <span style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:s.val>=85?T.gold:s.val>=70?"#7A9E84":T2.text3}}>{s.val}</span>
            </div>
            <div style={{height:3,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:s.val+"%",background:s.val>=85?T.gold:s.val>=70?"rgba(138,158,132,0.7)":"rgba(138,158,132,0.35)",borderRadius:2,transition:"width 0.8s ease"}}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Coach's Note</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>{feedback.note}</p>
      </div>
      {feedback.followUp && (
        <div style={{...cs.card,background:"rgba(44,30,20,0.06)"}}>
          <div style={cs.label}>Follow-up challenge</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>"{feedback.followUp}"</p>
          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,marginTop:8,marginBottom:0}}>How would you respond now?</p>
        </div>
      )}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={()=>{setPhase('active');setUserText('');setFeedback(null);setFollowIdx(followIdx+1);}} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>Try Again</button>
        <button onClick={reset} style={{flex:"1 1 auto",padding:"11px 16px",borderRadius:3,border:"none",background:T.ink,color:T.bg,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:44}}>New Scenario →</button>
      </div>
    </div>
  );

  return null;
}

// ─── D11 Practice Widget ──────────────────────────────────────────────────

