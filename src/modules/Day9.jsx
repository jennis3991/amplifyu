import { useState, useEffect, useRef } from 'react';

// ─── D9 Practice Widget — Connection Best Practices ──────────────────────
export function D9PracticeWidget({T, T2, isDesktop}) {
  const [open, setOpen] = useState(null);

  const TIPS = [
    {
      label:"Ask Better Questions",
      title:"Lead with curiosity, not category.",
      body:'Replace "What do you do?" with "What\'s the most interesting thing you\'re working on right now?" Better still: "What\'s the biggest challenge you\'re facing at the moment?" or "What\'s something you\'re genuinely excited about?" These questions open real conversations — they show interest, invite depth, and build trust in a way that small talk never does.',
    },
    {
      label:"The 70/30 Rule",
      title:"Listen 70%. Speak 30%.",
      body:"In your next conversation, consciously hold back. Ask a question, then let the other person fill the space. The most memorable communicators don't dominate — they make others feel genuinely heard. Connection isn't a gift. It's a choice you make in every conversation.",
    },
    {
      label:"Empathy in Practice",
      title:"Understand someone you disagree with.",
      body:"Before you respond to a differing view, pause to ask: what matters to this person, what pressures might they be under, and what might I be missing? Understanding first doesn't mean agreeing — it means connecting. The people who do this well are the ones others seek out.",
    },
    {
      label:"Know Their Style",
      title:"Adapt to the person in front of you.",
      body:"People tend to communicate as one of four styles: the Driver (results-focused), the Thinker (detail-focused), the Connector (relationship-focused), or the Visionary (ideas-focused). The best communicators notice which style they're working with — and flex to meet it rather than defaulting to their own.",
    },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:14}}>
      {isDesktop && <div>
        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Connection Skills · Rehearsal</div>
        <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,margin:"0 0 14px"}}>
          Build the habits that make you memorable.
        </h2>
        <p style={{fontFamily:T.sans,fontSize:15,color:T2.text3,lineHeight:1.7,margin:"0 0 10px"}}>
          The most connected communicators share four habits. Read through each one — then try them in your next real conversation.
        </p>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(138,158,132,0.08)",borderRadius:20,padding:"7px 14px",border:"0.5px solid rgba(138,158,132,0.22)",marginTop:6}}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5"/>
            <path d="M10 6v4l2.5 2" stroke="rgba(138,158,132,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:"rgba(138,158,132,0.8)",letterSpacing:"0.05em"}}>1 min warm-up</span>
        </div>
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {TIPS.map((tip,i)=>{
          const isOpen = open===i;
          return (
            <div key={i} style={{background:T2.surface,borderRadius:6,border:"0.5px solid "+(isOpen?"rgba(138,158,132,0.45)":T2.border),overflow:"hidden",transition:"border-color 0.2s"}}>
              <button
                onClick={()=>setOpen(isOpen?null:i)}
                style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:isDesktop?"18px 22px":"15px 18px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",gap:12}}
              >
                <div>
                  <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>{tip.label}</div>
                  <div style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T2.text,lineHeight:1.25}}>{tip.title}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.25s",color:"rgba(138,158,132,0.7)"}}>
                  <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {isOpen&&(
                <div style={{padding:isDesktop?"0 22px 20px":"0 18px 16px",borderTop:"0.5px solid rgba(138,158,132,0.15)"}}>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.75,margin:"16px 0 0"}}>{tip.body}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── D9 Simulation Widget — The Rapport Builder ──────────────────────────
export function D9SimWidget({T, T2, isDesktop}) {
  const CHARS = [
    {
      id:'driver', label:'The Driver',
      sub:'Senior leader. Results-focused. Zero tolerance for small talk.',
      difficulty:'High intensity',
      scenario:'The Corridor Ambush',
      scenarioDesc:"You've been trying to get budget sign-off for a project. You catch your senior stakeholder between meetings — they're already walking.",
      opener:'Two minutes. What do you need?',
      mockBad:'"So as you know, we\'ve been working on this since Q1, and the team has spent a lot of time on the customer experience research..."',
      mockBadNote:'Context before the point. A Driver switches off within seconds.',
      mockGood:'"Sign-off on the CX pilot. Forty thousand. Data shows fifteen percent churn reduction. Yes or no today means we start Monday."',
      mockGoodNote:'Bottom line first. Specific. Time-bound. No apology for taking their time.',
      scoreLabels:['Brevity','Conviction','Bottom-line thinking'],
      scoreHints:['Did you lead with the ask and cut the preamble?','Did you hold your ground when pushed back on?','Did you lead with outcomes and not context?'],
      sysPrompt(hist) {
        return `You are playing "The Driver" in a workplace communication training simulation.

Character: A senior executive — results-focused, time-pressured, zero tolerance for preamble or hedging. You respond to confidence and brevity. You dismiss weakness without apology.

Scenario: A colleague caught you between meetings wanting budget sign-off on a project.
Your opening line was: "Two minutes. What do you need?"

${hist}

RESPOND IN CHARACTER — 1-3 sentences max. Calibrate your tone:
- If they led with the bottom line, gave a specific number and outcome: engage directly. Push back hard on one specific detail (the amount, the timeline, or the risk).
- If they gave context before the point or were wordy: "That's background. What's the actual ask?"
- If they hedged, apologised, or backtracked: "You don't sound convinced. Come back when you are."
- On Turn 3 specifically, add pressure: "Two other teams want budget this quarter. Why does yours go first?"

After your in-character response, add a new line with ONLY this JSON: {"quality":"strong"|"adequate"|"weak","note":"<observation for the coach, max 10 words>"}`;
      },
    },
    {
      id:'thinker', label:'The Thinker',
      sub:'Analytical specialist. Values logic, data, and precision above all.',
      difficulty:'Detail-heavy',
      scenario:'The Data Review',
      scenarioDesc:"You're presenting a recommendation to your most analytical colleague. They've reviewed your proposal in advance and have questions.",
      opener:"I've reviewed your proposal. Walk me through your methodology.",
      mockBad:'"So basically the data kind of suggests this could work, and most people on the team feel it\'s the right direction..."',
      mockBadNote:'"Kind of" and "feel like" are red flags for a Thinker. Vague language signals weak thinking.',
      mockGood:'"Ninety-day cohort analysis. Three segments, twenty-four hundred users. Confidence interval ninety-four percent. The interesting finding is in the middle cohort."',
      mockGoodNote:'Specific numbers. Clear methodology. Invite their scrutiny — don\'t defend against it.',
      scoreLabels:['Precision','Logic','Handling challenge'],
      scoreHints:['Were your answers specific and evidence-based?','Did your reasoning hold up under scrutiny?','Did you handle pushback with data, not defensiveness?'],
      sysPrompt(hist) {
        return `You are playing "The Thinker" in a workplace communication training simulation.

Character: A highly analytical specialist who values logic, evidence, and precision. You probe assumptions, flag vague language, and don't accept impressions as data. You're not unfriendly — you simply live in the world of facts.

Scenario: A colleague is presenting a recommendation and you've reviewed their proposal.
Your opening line was: "I've reviewed your proposal. Walk me through your methodology."

${hist}

RESPOND IN CHARACTER — 1-3 sentences max. Calibrate your tone:
- If they were specific and evidence-based: acknowledge briefly, then probe one assumption or edge case. "What accounts for the outliers in segment two?"
- If they were vague or used hedging language: "That's an impression, not a methodology. What does the data actually show?"
- If they became defensive: stay calm. "I'm not disagreeing. I'm testing the logic."
- On Turn 3 specifically: "What's your biggest assumption here — and what happens to the model if it's wrong?"

After your in-character response, add a new line with ONLY this JSON: {"quality":"strong"|"adequate"|"weak","note":"<observation for the coach, max 10 words>"}`;
      },
    },
    {
      id:'connector', label:'The Connector',
      sub:'Relationship-oriented leader. People and feelings come before outcomes.',
      difficulty:'Emotionally nuanced',
      scenario:'The Team Check-In',
      scenarioDesc:"Your manager has noticed tension in the team and asked to talk. They lead with how people are feeling — not with tasks or targets.",
      opener:"I've been thinking about the team lately. How are people really doing?",
      mockBad:'"Yeah the project\'s on track, we hit our targets last quarter, and productivity has been solid."',
      mockBadNote:'Jumping straight to metrics. A Connector needs to feel heard on the human level before they\'ll engage on outcomes.',
      mockGood:'"Honestly, there\'s some tension around the restructure. A few people feel uncertain about where they fit. I think they need to hear directly from you."',
      mockGoodNote:'Name the feeling. Be specific about who and why. Give them a way to help.',
      scoreLabels:['Empathy','Honesty','Trust-building'],
      scoreHints:['Did you acknowledge feelings before jumping to facts?','Were you honest and specific about the human reality?','Did you make them feel like a partner in solving it?'],
      sysPrompt(hist) {
        return `You are playing "The Connector" in a workplace communication training simulation.

Character: A relationship-oriented team leader who leads with empathy and cares deeply about how people feel. You believe trust is built through honesty and genuine interest. You're warm — but you notice immediately when someone is being transactional with you.

Scenario: You're a manager checking in about team dynamics after noticing tension.
Your opening line was: "I've been thinking about the team lately. How are people really doing?"

${hist}

RESPOND IN CHARACTER — 1-3 sentences max. Calibrate your tone:
- If they named real feelings and were specific and honest: warm, reciprocal, invite them deeper. "That takes courage to say. Tell me more about what you're seeing."
- If they jumped to metrics or project status: "I'm less worried about the numbers right now. I'm asking about the people."
- If they were vague or deflected: "It's okay if things aren't perfect. I'd genuinely rather know."
- On Turn 3 specifically: "If you were in my position, what's the one thing you'd do first to help?"

After your in-character response, add a new line with ONLY this JSON: {"quality":"strong"|"adequate"|"weak","note":"<observation for the coach, max 10 words>"}`;
      },
    },
    {
      id:'visionary', label:'The Visionary',
      sub:'Ideas-driven innovator. Big picture first, details later — if ever.',
      difficulty:'Keep up and land them',
      scenario:'The Big Idea Pitch',
      scenarioDesc:"You're pitching an initiative to your most ideas-driven colleague. They love the concept — and keep expanding it. You need a decision.",
      opener:'I love this. Where do you see this going in five years?',
      mockBad:'"Well we\'d need a feasibility study first and there are a few risks we should probably assess before committing to anything."',
      mockBadNote:'A Visionary experiences risk-talk as imagination-killing. They disengage immediately.',
      mockGood:'"In five years this could change how the whole industry approaches this. But to get there — I need one decision from you today. Can we start the pilot?"',
      mockGoodNote:'Match their energy and vision first. Then bring it to one concrete ask.',
      scoreLabels:['Energy matching','Idea engagement','Landing the ask'],
      scoreHints:['Did you meet their enthusiasm rather than dampen it?','Did you engage with the ideas on their terms?','Did you bring it back to one concrete decision?'],
      sysPrompt(hist) {
        return `You are playing "The Visionary" in a workplace communication training simulation.

Character: An entrepreneurial, ideas-driven innovator who thinks in possibilities. You love bold thinking, get genuinely excited by scale, and lose interest the moment someone leads with risks or constraints. Generous and enthusiastic — until someone kills the energy.

Scenario: A colleague is pitching an initiative and you love the concept.
Your opening line was: "I love this. Where do you see this going in five years?"

${hist}

RESPOND IN CHARACTER — 1-3 sentences max. Calibrate your tone:
- If they matched your energy and thought big: get more excited. Build on the idea. Start moving toward a decision. "Okay — I'm in on this. What do you need from me?"
- If they hedged with risks or feasibility: show disappointment. "I worry we're making this smaller than it needs to be."
- If they engaged but played it safe: push for the bolder version. "But what if we didn't limit it? What's the version that actually changes something?"
- On Turn 3 specifically: "I love where this is going. But what's the one thing you need from me to make it real?"

After your in-character response, add a new line with ONLY this JSON: {"quality":"strong"|"adequate"|"weak","note":"<observation for the coach, max 10 words>"}`;
      },
    },
  ];

  const [phase, setPhase] = useState('intro');
  const [char, setChar] = useState(null);
  const [isRec, setIsRec] = useState(false);
  const [waveVals, setWaveVals] = useState(Array.from({length:9},()=>0.3+Math.random()*0.3));
  const [debrief, setDebrief] = useState(null);

  const turnRef = useRef(1);
  const transcriptsRef = useRef(['','','']);
  const charResponsesRef = useRef(['','']);
  const qualitiesRef = useRef(['','']);
  const mediaRecRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recRef = useRef(null);
  const waveRef = useRef(null);
  const liveRef = useRef('');

  const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(()=>{
    if(!isRec){clearInterval(waveRef.current);return;}
    waveRef.current=setInterval(()=>setWaveVals(Array.from({length:9},()=>0.2+Math.random()*0.8)),150);
    return()=>clearInterval(waveRef.current);
  },[isRec]);

  function doStart(){
    setIsRec(true); liveRef.current='';
    if(SpeechRec){
      const rec=new SpeechRec();
      rec.continuous=true; rec.interimResults=true; rec.lang='en-US';
      rec.onresult=(e)=>{
        let final='',interim='';
        for(let i=0;i<e.results.length;i++){
          if(e.results[i].isFinal) final+=e.results[i][0].transcript+' ';
          else interim+=e.results[i][0].transcript;
        }
        liveRef.current=final||interim;
      };
      try{rec.start();}catch(e){}
      recRef.current=rec;
    }
    if(navigator.mediaDevices?.getUserMedia){
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        audioChunksRef.current=[];
        const mr=new MediaRecorder(stream);
        mr.ondataavailable=e=>{if(e.data.size>0)audioChunksRef.current.push(e.data);};
        mr.onstop=()=>stream.getTracks().forEach(t=>t.stop());
        mr.start(); mediaRecRef.current=mr;
      }).catch(()=>{});
    }
  }

  function doStop(onText){
    setIsRec(false);
    if(mediaRecRef.current&&mediaRecRef.current.state!=='inactive'){
      mediaRecRef.current.onstop=()=>{};
      mediaRecRef.current.stop();
    }
    if(recRef.current){
      const rec=recRef.current; recRef.current=null;
      const fallback=setTimeout(()=>onText(liveRef.current),1800);
      rec.onend=()=>{clearTimeout(fallback);onText(liveRef.current);};
      try{rec.stop();}catch(e){clearTimeout(fallback);onText(liveRef.current);}
    } else {
      onText(liveRef.current);
    }
  }

  function buildHistory(turn){
    if(turn===1) return 'This is Turn 1.';
    let h='Conversation so far:';
    for(let i=0;i<turn-1;i++){
      h+=`\nTurn ${i+1} — User said: "${transcriptsRef.current[i]||'[no audio captured]'}"`;
      if(charResponsesRef.current[i]) h+=`\nYour response: "${charResponsesRef.current[i]}"`;
    }
    h+=`\nThis is now Turn ${turn}.`;
    return h;
  }

  async function callCharacter(sysPrompt, userText){
    try{
      const res=await fetch('/api/claude',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-5', max_tokens:180,
          system:sysPrompt,
          messages:[{role:'user',content:userText||'[No audio captured — assume an adequate response and react in character.]'}]
        })
      });
      const data=await res.json();
      const raw=(data.content||[]).map(b=>b.text||'').join('').trim();
      const jsonMatch=raw.match(/\{[^}]*\}/);
      let quality='adequate', response=raw;
      if(jsonMatch){
        try{
          const p=JSON.parse(jsonMatch[0]);
          quality=p.quality||'adequate';
          response=raw.slice(0,raw.indexOf(jsonMatch[0])).trim();
        }catch(_){}
      }
      return{response:response||raw, quality};
    }catch(_){
      return{response:'Interesting. Continue.', quality:'adequate'};
    }
  }

  async function runDebrief(){
    const c=char;
    const t=transcriptsRef.current;
    const q=qualitiesRef.current;
    try{
      const res=await fetch('/api/claude',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-5', max_tokens:350,
          messages:[{role:'user',content:`You are the AmplifyU coach. A user just completed a 3-turn spoken conversation practice with "${c.label}" (${c.sub}).

Scenario: ${c.scenario} — ${c.scenarioDesc}

Their spoken responses:
Turn 1: "${t[0]||'[no audio]'}"
Turn 2: "${t[1]||'[no audio]'}"
Turn 3: "${t[2]||'[no audio]'}"

Character quality ratings: Turn 1 was "${q[0]||'adequate'}", Turn 2 was "${q[1]||'adequate'}".

Score 0-100 on each dimension:
- ${c.scoreLabels[0]}: ${c.scoreHints[0]}
- ${c.scoreLabels[1]}: ${c.scoreHints[1]}
- ${c.scoreLabels[2]}: ${c.scoreHints[2]}

Also write:
- insight: 2 sentences. Specific to what they said. What they did well + one concrete thing to practise. Warm, direct coach voice.
- quote: one short original line capturing the lesson for this character style. Not a famous quote — your own words.

Return ONLY valid JSON:
{"scores":{"${c.scoreLabels[0]}":number,"${c.scoreLabels[1]}":number,"${c.scoreLabels[2]}":number},"insight":"...","quote":"..."}`}]
        })
      });
      const data=await res.json();
      const raw=(data.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      if(m) setDebrief(JSON.parse(m[0]));
      else throw new Error('no json');
    }catch(_){
      setDebrief({
        scores:{[char.scoreLabels[0]]:68,[char.scoreLabels[1]]:65,[char.scoreLabels[2]]:62},
        insight:'You engaged with the scenario and showed a willingness to adapt across the conversation. The clearest growth area is leading with your main point — every response, without exception.',
        quote:'Adaptability is not about changing who you are. It\'s about understanding who you\'re talking to.'
      });
    }
  }

  async function handleTurnDone(transcript){
    const turn=turnRef.current;
    transcriptsRef.current[turn-1]=transcript;
    if(turn<3){
      setPhase('thinking');
      const hist=buildHistory(turn);
      const {response,quality}=await callCharacter(char.sysPrompt(hist), transcript);
      charResponsesRef.current[turn-1]=response;
      qualitiesRef.current[turn-1]=quality;
      turnRef.current=turn+1;
      setPhase('turn'+(turn+1));
    } else {
      setPhase('analyzing');
      await runDebrief();
      setPhase('debrief');
    }
  }

  function resetSession(){
    turnRef.current=1;
    transcriptsRef.current=['','',''];
    charResponsesRef.current=['',''];
    qualitiesRef.current=['',''];
    setDebrief(null);
    setIsRec(false);
  }

  const cs={
    card:{background:T2.surface,borderRadius:6,border:'0.5px solid '+T2.border,padding:isDesktop?'22px 24px':'16px 18px'},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:8},
    cta:{width:'100%',padding:isDesktop?'14px':'13px',borderRadius:4,border:'none',background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:'pointer',fontFamily:T.sans,minHeight:48,transition:'all 0.2s'},
    sage:{width:'100%',padding:isDesktop?'14px':'13px',borderRadius:4,border:'none',background:'rgba(82,112,96,0.85)',color:'#fff',fontSize:isDesktop?15:14,fontWeight:600,cursor:'pointer',fontFamily:T.sans,minHeight:48},
    ghost:{background:'none',border:'none',fontFamily:T.sans,fontSize:12,color:T2.text4,cursor:'pointer',padding:'4px 0',textAlign:'left'},
  };

  // ── INTRO ────────────────────────────────────────────────────────────────────
  if(phase==='intro') return(
    <div style={{display:'flex',flexDirection:'column',gap:isDesktop?16:14}}>
      <div>
        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:12}}>The Rapport Builder · Simulation</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?36:26,fontWeight:600,color:T2.text,lineHeight:1.1,margin:'0 0 14px'}}>
          Four conversations.<br/>Four personalities.
        </h2>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.7,margin:'0 0 10px'}}>
          Choose one connection habit to focus on, then navigate a realistic workplace conversation.
        </p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.7,margin:0}}>
          Your AmplifyU Coach will assess how well you adapt your style and provide personalised feedback on your listening, curiosity, empathy and ability to build genuine rapport.
        </p>
      </div>
      <div style={{...cs.card,borderLeft:'2px solid '+T.gold}}>
        <div style={cs.label}>Example · The Driver</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text3,lineHeight:1.6,margin:'0 0 14px'}}>
          You've been trying to get budget sign-off. You catch your senior stakeholder between meetings — they're already walking.
        </p>
        <div style={{padding:'12px 14px',background:T2.bg,borderRadius:4,marginBottom:12}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:6}}>They say</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:'italic',color:T2.text,lineHeight:1.4,margin:0}}>"Two minutes. What do you need?"</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <div style={{padding:'12px 14px',background:'rgba(180,80,60,0.06)',borderRadius:4,border:'0.5px solid rgba(180,80,60,0.2)'}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:'rgba(180,80,60,0.75)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:6}}>What most people do</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:'italic',color:T2.text2,lineHeight:1.5,margin:'0 0 6px'}}>"So as you know, we've been working on this since Q1, and the team has spent a lot of time on the customer experience research..."</p>
            <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0}}>Context before the point. A Driver switches off within seconds.</p>
          </div>
          <div style={{padding:'12px 14px',background:'rgba(82,112,96,0.06)',borderRadius:4,border:'0.5px solid rgba(82,112,96,0.2)'}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:'rgba(82,112,96,0.75)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:6}}>What works</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:'italic',color:T2.text2,lineHeight:1.5,margin:'0 0 6px'}}>"Sign-off on the CX pilot. Forty thousand. Data shows fifteen percent churn reduction. Yes or no today means we start Monday."</p>
            <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0}}>Bottom line first. Specific. Time-bound. No apology.</p>
          </div>
        </div>
      </div>
      <button onClick={()=>setPhase('select')} style={cs.cta}>Choose Your Character →</button>
    </div>
  );

  // ── SELECT ───────────────────────────────────────────────────────────────────
  if(phase==='select') return(
    <div style={{display:'flex',flexDirection:'column',gap:isDesktop?14:12}}>
      <div>
        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:8}}>Choose Your Character</div>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text3,lineHeight:1.6,margin:0}}>Pick the style you find most challenging — or the one you want to sharpen.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {CHARS.map(c=>{
          const sel=char?.id===c.id;
          return(
            <button key={c.id} onClick={()=>setChar(c)}
              style={{padding:isDesktop?'18px 16px':'14px 12px',borderRadius:6,border:`${sel?'2':'0.5'}px solid ${sel?'rgba(82,112,96,0.75)':T2.border}`,background:sel?'rgba(82,112,96,0.1)':T2.surface,cursor:'pointer',textAlign:'left',transition:'all 0.2s',outline:'none'}}>
              <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,fontWeight:700,color:sel?'rgba(82,112,96,0.9)':T.gold,textTransform:'uppercase',letterSpacing:'1px',marginBottom:5}}>{c.label}</div>
              <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,lineHeight:1.4,marginBottom:6}}>{c.sub}</div>
              <div style={{fontFamily:T.sans,fontSize:10,color:sel?'rgba(82,112,96,0.7)':'rgba(138,158,132,0.45)',fontStyle:'italic'}}>{c.difficulty}</div>
            </button>
          );
        })}
      </div>
      <button onClick={()=>{if(char){resetSession();setPhase('turn1');}}} disabled={!char}
        style={{...cs.cta,opacity:char?1:0.4,cursor:char?'pointer':'default'}}>
        Start the Conversation →
      </button>
      <button onClick={()=>setPhase('intro')} style={cs.ghost}>← Back</button>
    </div>
  );

  // ── TURN PHASES (1, 2, 3) ────────────────────────────────────────────────────
  if((phase==='turn1'||phase==='turn2'||phase==='turn3')&&char){
    const turnNum=parseInt(phase.replace('turn',''));
    const prevReply=turnNum>1?charResponsesRef.current[turnNum-2]:null;
    return(
      <div style={{display:'flex',flexDirection:'column',gap:isDesktop?14:12}}>
        <div style={cs.card}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={cs.label}>{char.label}</div>
            <div style={{display:'flex',gap:5}}>
              {[1,2,3].map(n=>(
                <div key={n} style={{width:n<turnNum?24:8,height:6,borderRadius:3,background:n<turnNum?T.gold:n===turnNum?'rgba(138,158,132,0.6)':'rgba(138,158,132,0.2)',transition:'all 0.3s'}}/>
              ))}
            </div>
          </div>
          <div style={{padding:'12px 14px',background:T2.bg,borderRadius:4,marginBottom:16}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text4,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:6}}>
              {prevReply?'They respond':'They open with'}
            </div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:'italic',color:T2.text,lineHeight:1.45,margin:0}}>
              "{prevReply||char.opener}"
            </p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:2,height:36,marginBottom:isRec?12:0}}>
            {waveVals.map((v,i)=>(
              <div key={i} style={{flex:1,height:Math.round(v*(isRec?30:5))+'px',background:`rgba(138,158,132,${isRec?0.3+v*0.5:0.1})`,borderRadius:2,transition:'height 0.15s'}}/>
            ))}
          </div>
          {isRec&&(
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:'#c0392b'}}/>
              <span style={{fontFamily:T.sans,fontSize:11,color:T2.text3}}>Recording — speak for 30-45 seconds</span>
            </div>
          )}
        </div>
        {!isRec?(
          <button onClick={doStart} style={cs.cta}>Start Recording →</button>
        ):(
          <button onClick={()=>doStop(handleTurnDone)} style={{...cs.cta,background:'rgba(138,158,132,0.12)',color:T2.text,border:'0.5px solid rgba(138,158,132,0.3)'}}>
            Done →
          </button>
        )}
      </div>
    );
  }

  // ── THINKING / ANALYZING ─────────────────────────────────────────────────────
  if(phase==='thinking'||phase==='analyzing') return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:200,gap:16}}>
      <div style={{display:'flex',gap:8}}>
        {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:'rgba(138,158,132,0.6)'}}/>)}
      </div>
      <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,color:T2.text,margin:0,textAlign:'center'}}>
        {phase==='thinking'?`${char?.label} is considering your response…`:'Your coach is reviewing the full conversation…'}
      </p>
    </div>
  );

  // ── DEBRIEF ──────────────────────────────────────────────────────────────────
  if(phase==='debrief'&&debrief&&char){
    const entries=Object.entries(debrief.scores||{});
    const overall=Math.round(entries.reduce((a,[,v])=>a+v,0)/Math.max(entries.length,1));
    return(
      <div style={{display:'flex',flexDirection:'column',gap:isDesktop?14:12}}>
        <div style={{...cs.card,textAlign:'center',padding:isDesktop?'28px 24px':'22px 18px',background:'rgba(138,158,132,0.05)',border:'0.5px solid rgba(138,158,132,0.3)'}}>
          <div style={cs.label}>{char.label} · Session Complete</div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?52:40,fontWeight:600,color:T.gold,lineHeight:1,marginBottom:6}}>{overall}</div>
          <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,margin:0}}>Connection score across 3 turns</p>
        </div>
        <div style={cs.card}>
          <div style={cs.label}>Scores by Dimension</div>
          {entries.map(([label,score],i)=>(
            <div key={i} style={{marginBottom:i<entries.length-1?14:0}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:5}}>
                <span style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,fontWeight:500}}>{label}</span>
                <span style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontWeight:700,color:score>=75?T.gold:score>=55?'#7A9E84':T2.text3}}>{score}</span>
              </div>
              <div style={{height:4,background:T2.bg,borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:score+'%',background:score>=75?T.gold:score>=55?'rgba(138,158,132,0.7)':'rgba(180,80,60,0.35)',borderRadius:2,transition:'width 0.9s ease'}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{...cs.card,borderLeft:'2px solid '+T.gold}}>
          <div style={cs.label}>Your Coach Says</div>
          <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.7,margin:'0 0 14px'}}>{debrief.insight}</p>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?15:14,fontStyle:'italic',color:T.gold,margin:0,lineHeight:1.5}}>"{debrief.quote}"</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <div style={{padding:'12px 14px',background:'rgba(180,80,60,0.06)',borderRadius:4,border:'0.5px solid rgba(180,80,60,0.2)'}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:'rgba(180,80,60,0.75)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:6}}>What tends to go wrong</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:'italic',color:T2.text2,lineHeight:1.5,margin:'0 0 5px'}}>{char.mockBad}</p>
            <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0}}>{char.mockBadNote}</p>
          </div>
          <div style={{padding:'12px 14px',background:'rgba(82,112,96,0.06)',borderRadius:4,border:'0.5px solid rgba(82,112,96,0.2)'}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:'rgba(82,112,96,0.75)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:6}}>What to aim for next time</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontStyle:'italic',color:T2.text2,lineHeight:1.5,margin:'0 0 5px'}}>{char.mockGood}</p>
            <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0}}>{char.mockGoodNote}</p>
          </div>
        </div>
        <button onClick={()=>{resetSession();setPhase('turn1');}} style={cs.sage}>Try Again with {char.label} →</button>
        <button onClick={()=>{resetSession();setChar(null);setPhase('select');}} style={cs.cta}>Try a Different Character →</button>
      </div>
    );
  }

  return null;
}

// retained for backward compatibility
export function DeliveryCoachWidget({ onSave }) { return null; }
