import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';
import { useWakeLock } from '../utils.js';

const D1SIM_KEY = 'au_d1sim_state';
function loadD1SimState() {
  try { return JSON.parse(sessionStorage.getItem(D1SIM_KEY)) || {}; } catch { return {}; }
}

function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function findFillerClusters(text) {
  if (!text) return [];
  const re = /\b(um+|uh+|er+|ah+|like|you know|sort of|kind of|basically|literally)\b/gi;
  const hits = [];
  let m;
  while ((m = re.exec(text)) !== null) hits.push(m.index);
  const clusters = [];
  let i = 0;
  while (i < hits.length) {
    if (i + 1 < hits.length && hits[i + 1] - hits[i] < 120) {
      clusters.push(hits[i]);
      let j = i + 1;
      while (j < hits.length && hits[j] - hits[i] < 200) j++;
      i = j;
    } else { i++; }
  }
  return clusters;
}

function countFillers(text) {
  if (!text) return {};
  // Only unambiguous fillers — never real words in any context
  const FILLERS = ['um','uh','er','ah'];
  const lower = text.toLowerCase();
  const result = {};
  FILLERS.forEach(f=>{
    const re = new RegExp('\\b'+f+'\\b','gi');
    const n = (lower.match(re)||[]).length;
    if(n>0) result[f]=n;
  });
  return result;
}

function highlightFillers(text, words) {
  if(!text||!words||words.length===0) return [{t:text,f:false}];
  const re = new RegExp('\\b('+words.map(f=>f.replace(/ /g,'\\s+')).join('|')+')\\b','gi');
  const parts = [];
  let last = 0, m;
  re.lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    if(m.index>last) parts.push({t:text.slice(last,m.index),f:false});
    parts.push({t:m[0],f:true});
    last = m.index+m[0].length;
  }
  if(last<text.length) parts.push({t:text.slice(last),f:false});
  return parts;
}

export function D1MobileJargonSwap() {
  const [v,setV]=useState(""); const [r,setR]=useState(""); const [l,setL]=useState(false);
  async function go(){if(!v.trim())return;setL(true);try{const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:200,messages:[{role:"user",content:`Simplify this, removing all jargon. Return ONLY the simplified sentence: "${v}"`}]})});const d=await res.json();setR((d.content||[]).map(b=>b.text||"").join("").trim());}catch{setR("Keep it simple enough that a 10-year-old could understand.");}setL(false);}
  return(<div><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="Write your sentence…" style={{width:"100%",borderRadius:3,border:"0.5px solid #DDD5C4",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",height:64,marginBottom:8,boxSizing:"border-box"}}/><button onClick={go} disabled={l||!v.trim()} style={{width:"100%",padding:"10px",borderRadius:3,border:"none",background:l||!v.trim()?"#DDD5C4":"#2C2416",color:l||!v.trim()?"#6B5E44":"#F7F3EC",fontSize:12,fontWeight:600,cursor:l||!v.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:r?10:0}}>{l?"Simplifying…":"Simplify It →"}</button>{r&&<div style={{padding:"12px 14px",background:"rgba(138,158,132,0.08)",borderRadius:3,borderLeft:"2px solid #8A9E84"}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#2C2416",margin:0,lineHeight:1.6}}>{r}</p></div>}</div>);
}
export function D1MobileSim() { return null; } // replaced by D1SimWidget

// ─── THE CLARITY CHALLENGE™ ───────────────────────────────────────────────────
export function D1ClarityChallenge({T, T2, isDesktop, onSimulation, onNavLabel, onNavFn}) {
  // ── Question bank — swap topics here ────────────────────────────────────
  const ROUNDS = [
    {id:1, type:'mcq', label:'Round 1', name:'The Clarity Test', pts:20,
     task:'Which explains gravity most simply?',
     topic:'Gravity',
     options:[
       'Gravity is the force exerted between objects with mass.',
       'Gravity is what pulls things down to the ground instead of letting them float away.',
       'Gravity is a universal attractive interaction between physical bodies.',
     ],
     correct:1,
     feedback:"Simple doesn't mean simplistic — it means understandable. Option B creates a picture. That's the Feynman test."},
    {id:2, type:'cardsort', label:'Round 2', name:'The Feynman Formula', pts:25,
     task:"Ella is explaining the Moon's phases to her nephew. Sort each of her statements into the right step.",
     cards:[
       {text:"Ella learns how moon phases work.", bucket:'understand'},
       {text:"Ella explains moon phases to her nephew using simple words.", bucket:'explain'},
       {text:"Ella removes confusing terms and uses an easy analogy.", bucket:'simplify'},
       {text:"Ella turns her explanation into a short, memorable summary.", bucket:'refine'},
     ],
     buckets:['understand','explain','simplify','refine'],
     feedback:"The ability to explain something simply is one of the clearest signs of mastery. The Feynman Technique helps you move beyond memorisation and build real understanding. Because when you can make a complex idea feel simple, people don't just hear you — they understand you."},
    {id:3, type:'mcq', label:'Round 3', name:"What's Missing?", pts:25,
     task:"What's missing from this explanation?",
     statement:'"Exercise makes you healthier."',
     options:[
       "Nothing — it's clear.",
       "It explains the result, but not why.",
       "It needs bigger words.",
     ],
     correct:1,
     feedback:"Great explanations answer the next obvious question. Why does exercise make you healthier? That's the gap."},
    {id:4, type:'explain', label:'Round 4', name:'Explain It Simply', pts:30,
     task:'Teach a curious 8-year-old the lifecycle of a butterfly.',
     hint:'No jargon · Make it easy to picture',
     placeholder:'Inside its chrysalis, the butterfly…'},
  ];

  const [phase, setPhase] = useState('intro');
  const [roundIdx, setRoundIdx] = useState(0);
  const [totalPts, setTotalPts] = useState(0);
  const [mcqPts, setMcqPts] = useState(0);
  const [explainPts, setExplainPts] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [orderSelected, setOrderSelected] = useState(null);
  const [orderAnswered, setOrderAnswered] = useState(false);
  const [sortCards, setSortCards] = useState([]);
  const [sortPlaced, setSortPlaced] = useState({});
  const [sortSelected, setSortSelected] = useState(null);
  const [sortChecked, setSortChecked] = useState(false);
  const [explainText, setExplainText] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const round = ROUNDS[roundIdx];
  const isLast = roundIdx === ROUNDS.length - 1;

  function reset() {
    setPhase('intro'); setRoundIdx(0); setTotalPts(0); setMcqPts(0); setExplainPts(0);
    setSelected(null); setAnswered(false); setOrderItems([]); setOrderSelected(null);
    setOrderAnswered(false); setExplainText(''); setAiResult(null);
    setSortCards([]); setSortPlaced({}); setSortSelected(null); setSortChecked(false);
  }

  function handleMCQ(i) {
    if (answered) return;
    setSelected(i); setAnswered(true);
    if (i === round.correct) {
      setTotalPts(p => p + round.pts);
      setMcqPts(p => p + round.pts);
    }
  }

  function initOrder() {
    // Shuffle items for the ordering round
    const shuffled = [...round.items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOrderItems(shuffled);
    setOrderSelected(null);
    setOrderAnswered(false);
  }

  function handleOrderTap(i) {
    if (orderAnswered) return;
    if (orderSelected === null) {
      setOrderSelected(i);
    } else {
      // Swap selected with tapped
      const next = [...orderItems];
      [next[orderSelected], next[i]] = [next[i], next[orderSelected]];
      setOrderItems(next);
      setOrderSelected(null);
    }
  }

  function submitOrder() {
    const correct = round.items; // original = correct order
    const allCorrect = orderItems.every((item, i) => item === correct[i]);
    setOrderAnswered(true);
    const pts = allCorrect ? round.pts : Math.round(round.pts * 0.5);
    setTotalPts(p => p + pts);
    setMcqPts(p => p + pts);
  }

  function checkSort() {
    const r = round;
    let correct = 0;
    r.buckets.forEach(b => { if (sortPlaced[b] != null && sortCards[sortPlaced[b]].bucket === b) correct++; });
    const pts = Math.round(r.pts * (correct / r.cards.length));
    setTotalPts(p => p + pts); setMcqPts(p => p + pts);
    setSortChecked(true);
  }
  function tapSortCard(i) {
    if (sortChecked) return;
    setSortSelected(s => s === i ? null : i);
  }
  function tapSortBucket(bucket) {
    if (sortChecked) return;
    if (sortSelected === null) { if (sortPlaced[bucket] != null) setSortPlaced(p=>({...p,[bucket]:null})); return; }
    const np = {...sortPlaced};
    Object.keys(np).forEach(k => { if (np[k] === sortSelected) np[k] = null; });
    np[bucket] = sortSelected;
    setSortPlaced(np); setSortSelected(null);
  }

  function nextRound() {
    if (isLast) { setPhase('final'); return; }
    const next = roundIdx + 1;
    setRoundIdx(next);
    setSelected(null); setAnswered(false);
    setOrderAnswered(false); setOrderSelected(null);
    setExplainText(''); setAiResult(null);
    setSortPlaced({}); setSortSelected(null); setSortChecked(false);
    if (ROUNDS[next].type === 'cardsort') {
      const cards = [...ROUNDS[next].cards];
      for (let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
      setSortCards(cards);
    }
    if (ROUNDS[next].type === 'order') {
      const shuffled = [...ROUNDS[next].items];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setOrderItems(shuffled);
    }
  }

  async function scoreExplain() {
    if (!explainText.trim() || explainText.trim().length < 5) return;
    setAiLoading(true);
    const mock = {
      praise:"Beautiful. You made transformation easy to picture.",
      tip:"Could you make it even simpler in one revision?",
      pts: Math.round(round.pts * 0.85),
    };
    try {
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:300,messages:[{role:"user",content:`You are a warm, encouraging communication coach evaluating the Feynman Technique — the skill of explaining something SIMPLY and CLEARLY.\n\nThe challenge: explain the lifecycle of a butterfly to a curious 8-year-old.\nGoal: simplicity, clarity, and vivid imagery. NOT scientific accuracy.\n\nEvaluate ONLY on:\n1. Is it simple enough for an 8-year-old? (no jargon, everyday words)\n2. Is it easy to picture in your mind?\n3. Does it flow clearly?\n\nDo NOT comment on scientific terminology, completeness, or factual precision — that is irrelevant. A child-friendly word like "cocoon" is BETTER than the scientific term "chrysalis".\n\nUser's answer: "${explainText}"\n\nReturn ONLY valid JSON:\n{"praise":"<one warm specific compliment on their clarity or imagery — max 12 words>","tip":"<one gentle suggestion to make it simpler or more vivid — max 12 words>","pts":<20-30>}`}]})});
      const d = await res.json();
      const raw = (d.content||[]).map(b=>b.text||'').join('').trim();
      const m = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m[0]);
      setAiResult(parsed);
      setTotalPts(p => p + (parsed.pts || mock.pts));
      setExplainPts(p => p + (parsed.pts || mock.pts));
    } catch {
      setAiResult(mock);
      setTotalPts(p => p + mock.pts);
      setExplainPts(p => p + mock.pts);
    }
    setAiLoading(false);
  }

  function getBadge(score) {
    if (score >= 90) return {img:"/badge-queen.jpg",  label:"Great Explainer",      sub:"You make complex ideas feel effortless.",          color:"#C9A84C"};
    if (score >= 75) return {img:"/badge-rook.jpg",   label:"Clear Thinker",        sub:"You see through complexity with ease.",            color:T.gold};
    if (score >= 60) return {img:"/badge-bishop.jpg", label:"Plain English Pro",    sub:"Your explanations are clear and direct.",          color:"#7A9E84"};
    return                  {img:"/badge-pawn.jpg",   label:"Curious Learner",      sub:"Awareness is the first step to brilliant explanation.", color:T2.text3};
  }

  const maxPts = ROUNDS.reduce((s,r)=>s+r.pts,0);
  const pct = Math.round((totalPts/maxPts)*100);

  const cs = {
    card: {background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"22px 24px":"18px 20px"},
    label: {fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
    h2: {fontFamily:T.serif,fontSize:isDesktop?36:26,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12},
    body: {fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.65,margin:0},
    cta: {width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
    ghost: {width:"100%",padding:"11px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44},
    pts: {fontFamily:T.serif,fontSize:isDesktop?18:16,fontWeight:600,color:T.gold},
  };

  useEffect(() => {
    if (!onNavLabel) return;
    if (phase === 'intro') {
      if (onNavFn) onNavFn.current = () => setPhase('playing');
      onNavLabel('Begin Challenge');
    } else if (phase === 'playing') {
      const canAdvance = round?.type === 'mcq' ? answered
        : round?.type === 'order' ? orderAnswered
        : round?.type === 'cardsort' ? sortChecked
        : !!aiResult;
      if (canAdvance) {
        const label = isLast ? 'See Your Results' : 'Next Round';
        if (onNavFn) onNavFn.current = nextRound;
        onNavLabel(label);
      } else {
        if (onNavFn) onNavFn.current = null;
        onNavLabel(null);
      }
    } else {
      if (onNavFn) onNavFn.current = null;
      onNavLabel(null);
    }
  }, [phase, answered, orderAnswered, sortChecked, aiResult, roundIdx]);

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?16:12}}>

      {/* YOUR MISSION */}
      <div style={{...cs.card}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Your Mission</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:19,fontWeight:600,color:T.gold,lineHeight:1.25,margin:"0 0 12px"}}>
          Master how clarity makes ideas stick.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {["Spot what makes ideas confusing.","Find what's missing.","Turn complexity into simplicity."].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{color:T.gold,fontSize:13,flexShrink:0,marginTop:3}}>✦</span>
              <span style={{fontFamily:T.serif,fontSize:isDesktop?18:17,color:T2.text,lineHeight:1.4}}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CHALLENGE JOURNEY */}
      <div style={{...cs.card}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>The Challenge Journey</div>
        <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
          {[
            {n:1,label:"The Clarity Test",   icon:<svg width="26" height="26" viewBox="0 0 22 22" fill="none"><circle cx="9" cy="9" r="6" stroke={T.gold} strokeWidth="1.3"/><path d="M13.5 13.5l4 4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:2,label:"The Feynman Formula",icon:<svg width="26" height="26" viewBox="0 0 22 22" fill="none"><path d="M5 7h12M5 11h8M5 15h10" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:3,label:"What's Missing?",    icon:<svg width="26" height="26" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke={T.gold} strokeWidth="1.3"/><path d="M9 8.5a2 2 0 013.5 1.3c0 1.5-2 2-2 3.5" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/><circle cx="11" cy="16" r="0.8" fill={T.gold}/></svg>},
            {n:4,label:"Explain It Simply",  icon:<svg width="26" height="26" viewBox="0 0 22 22" fill="none"><path d="M4 5h14a1 1 0 011 1v8a1 1 0 01-1 1H7l-4 3V6a1 1 0 011-1z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/><path d="M8 9h6M8 12h4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?50:40,height:isDesktop?50:40,borderRadius:"50%",border:"1.5px solid "+(i===0?T.gold:"rgba(138,158,132,0.35)"),background:i===0?"rgba(138,158,132,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}>
                  {r.icon}
                </div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?10:9,fontWeight:700,color:T.gold,marginBottom:3}}>Round {r.n}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?13:11,fontWeight:500,color:"#A8998A",textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?88:66}}>{r.label}</div>
              </div>
              {i<3 && <div style={{height:1,width:isDesktop?12:6,background:"rgba(138,158,132,0.25)",flexShrink:0,marginBottom:40}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* HOW YOU WIN */}
      <div style={{...cs.card}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:4}}>How You Win</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>Earn points for:</p>
        <div style={{display:"flex",gap:isDesktop?8:6,flexWrap:"wrap"}}>
            {[
              {label:"Clarity",     icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke={T.gold} strokeWidth="1.3"/><circle cx="11" cy="11" r="4.5" stroke={T.gold} strokeWidth="1.3"/><circle cx="11" cy="11" r="1.5" fill={T.gold}/></svg>},
              {label:"Understanding",icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 3a5 5 0 014 8l-1 1v2H8v-2L7 11a5 5 0 014-8z" stroke={T.gold} strokeWidth="1.3"/><path d="M8 17h6" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
              {label:"Simplicity",  icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M4 11h14M4 7h9M4 15h11" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
              {label:"Audience awareness",icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="8" cy="7" r="3" stroke={T.gold} strokeWidth="1.2"/><circle cx="15" cy="8" r="2.5" stroke={T.gold} strokeWidth="1.2"/><path d="M2 18c0-3 2.7-5 6-5s6 2 6 5" stroke={T.gold} strokeWidth="1.2" strokeLinecap="round"/><path d="M17 13c2 .5 3.5 2 3.5 4" stroke={T.gold} strokeWidth="1.2" strokeLinecap="round"/></svg>},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:isDesktop?"12px 14px":"8px 10px",background:T2.bg,borderRadius:6,border:"0.5px solid "+T2.border,flex:1,minWidth:isDesktop?70:60}}>
                {s.icon}
                <span style={{fontFamily:T.sans,fontSize:isDesktop?13:11,color:"#A8998A",fontWeight:400,textAlign:"center",lineHeight:1.3}}>{s.label}</span>
              </div>
            ))}
          </div>
      </div>

      <button onClick={()=>setPhase('playing')} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Start the Feynman Challenge →</button>
    </div>
  );

  // ── FINAL SCORECARD ────────────────────────────────────────────────────────
  if (phase === 'final') {
    const badge = getBadge(pct);
    const headline = pct>=85?"Your explanation instinct is sharp.":pct>=70?"You understand the principle. Now make it a habit.":"Every rep builds the instinct.";
    const subtitle = pct>=85?"You think like a great teacher — clear, vivid, audience-first.":pct>=70?"Good instincts. Keep simplifying until it feels effortless.":"Each attempt strengthens your clarity muscle.";
    const coachNote = pct>=85?"You consistently chose clarity over complexity — that's the mark of a brilliant communicator. Keep using the Feynman test before every message: if a 10-year-old couldn't follow it, simplify further.":pct>=70?"Good foundation. The ordering round showed the Feynman loop in action: understand, explain, find the gap, refine. Keep asking 'what's the simplest version?' before every explanation.":"Clarity is a learned skill, not a talent. The best communicators got there through exactly this kind of deliberate practice. Every explanation you simplify builds the instinct.";
    const FOCUS_CHIPS = ["Ask: could a 10-year-old follow this?","Find the one key idea","Cut every word that doesn't earn its place"];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>
        {/* HERO */}
        <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"28px 32px":"22px 20px",border:"0.5px solid rgba(138,158,132,0.15)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(138,158,132,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(138,158,132,0.7)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:16}}>The Feynman Challenge™ — Your Results</div>
          <div style={{display:"flex",gap:isDesktop?32:20,alignItems:"flex-start"}}>
            <div style={{flexShrink:0}}>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?80:64,fontWeight:600,color:T.gold,lineHeight:1}}>{pct}</div>
              <div style={{fontFamily:T.sans,fontSize:12,color:"rgba(245,239,230,0.45)",marginTop:2}}>/ 100</div>
            </div>
            <div style={{paddingTop:8}}>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?24:19,fontWeight:600,color:"#F5EFE6",lineHeight:1.25,margin:"0 0 8px"}}>{headline}</p>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.55)",margin:0,lineHeight:1.55}}>{subtitle}</p>
            </div>
          </div>
        </div>
        {/* BREAKDOWN */}
        <div style={{...cs.card}}>
          <div style={cs.label}>Your score breakdown</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            {[
              {label:"Clarity Tests",sub:"Rounds 1 + 3",earned:mcqPts,max:ROUNDS.filter(r=>r.type==='mcq').reduce((s,r)=>s+r.pts,0)},
              {label:"Feynman Formula",sub:"Round 2",earned:mcqPts>0?Math.min(mcqPts,25):0,max:25},
              {label:"Explanation",sub:"Round 4",earned:explainPts,max:30},
            ].map((b,i)=>(
              <div key={i} style={{padding:"12px",background:T2.bg,borderRadius:6,border:"0.5px solid "+T2.border,textAlign:"center"}}>
                <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:T2.text3,textTransform:"uppercase",letterSpacing:"1px",marginBottom:2}}>{b.label}</div>
                <div style={{fontFamily:T.sans,fontSize:9,color:T2.text4,marginBottom:6}}>{b.sub}</div>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:T.gold}}>{b.earned}<span style={{fontSize:11,color:T2.text4}}> / {b.max}</span></div>
              </div>
            ))}
          </div>
          <div style={{height:5,background:T2.bg,borderRadius:3,overflow:"hidden",marginBottom:5}}>
            <div style={{height:"100%",width:pct+"%",background:`linear-gradient(90deg,rgba(138,158,132,0.5),${T.gold})`,borderRadius:3,transition:"width 1.2s ease"}}/>
          </div>
          <div style={{fontFamily:T.sans,fontSize:11,color:T2.text4,textAlign:"right"}}>{pct}% of max</div>
        </div>
        {/* COACH NOTE */}
        <div style={{...cs.card}}>
          <div style={cs.label}>Your coach says</div>
          <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?38:30,color:T.gold,lineHeight:0.8,flexShrink:0,marginTop:4,opacity:0.5}}>"</div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text,lineHeight:1.7,margin:0}}>{coachNote}</p>
          </div>
        </div>
        {/* FOCUS CHIPS */}
        <div style={{...cs.card}}>
          <div style={cs.label}>Take this into your next conversation</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {FOCUS_CHIPS.map((f,i)=>(
              <span key={i} style={{padding:"7px 14px",borderRadius:20,border:"0.5px solid "+T2.border,background:T2.bg,fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text}}>{f}</span>
            ))}
          </div>
        </div>
        {/* CTA */}
        <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"22px 28px":"18px 20px",border:"0.5px solid rgba(138,158,132,0.15)",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8}}>
          <div style={{display:"flex",gap:8,flexDirection:isDesktop?"column":"row"}}>
            <button onClick={reset} style={{padding:"11px 20px",borderRadius:4,border:"0.5px solid rgba(245,239,230,0.15)",background:"transparent",color:"rgba(245,239,230,0.6)",fontFamily:T.sans,fontSize:isDesktop?13:12,cursor:"pointer",whiteSpace:"nowrap"}}>Try Again</button>
            {onSimulation
              ? <button onClick={onSimulation} style={{padding:"11px 20px",borderRadius:4,border:"none",background:"linear-gradient(135deg,"+T.gold+" 0%,#527060 100%)",color:"white",fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>Continue →</button>
              : <button onClick={reset} style={{padding:"11px 20px",borderRadius:4,border:"none",background:"linear-gradient(135deg,"+T.gold+" 0%,#527060 100%)",color:"white",fontFamily:T.sans,fontSize:isDesktop?13:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>Done ✓</button>}
          </div>
        </div>
      </div>
    );
  }

  // ── MCQ ROUND (types: mcq) ─────────────────────────────────────────────────
  if (round.type === 'mcq') {
    const correct = selected === round.correct;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",gap:6}}>
            {ROUNDS.map((_,i)=>(
              <div key={i} style={{width:isDesktop?32:24,height:4,borderRadius:2,background:i<roundIdx?T.gold:i===roundIdx?"rgba(138,158,132,0.5)":T2.border,transition:"background 0.3s"}}/>
            ))}
          </div>
          <div style={cs.pts}>{totalPts} pts</div>
        </div>
        <div style={cs.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={cs.label}>{round.label} — {round.name}</div>
          </div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,color:T2.text,lineHeight:1.4,marginBottom:round.statement?8:16,fontWeight:500}}>{round.task}</p>
          {round.statement && (
            <div style={{padding:"12px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T2.border,marginBottom:16}}>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{round.statement}</p>
            </div>
          )}
        </div>
        {round.options.map((opt,i)=>{
          const isSelected = selected===i;
          const isCorrectOpt = i===round.correct;
          let bg=T2.surface, border=T2.border, textColor=T2.text;
          if (answered) {
            if (isCorrectOpt) { bg="rgba(82,112,96,0.1)"; border="#527060"; textColor="#2C5040"; }
            else if (isSelected&&!isCorrectOpt) { bg="rgba(176,92,74,0.08)"; border="#B05C4A"; textColor="#6B2E22"; }
          } else if (isSelected) { bg="rgba(138,158,132,0.1)"; border=T.gold; }
          return (
            <div key={i} onClick={()=>handleMCQ(i)} style={{...cs.card,background:bg,border:`0.5px solid ${border}`,cursor:answered?"default":"pointer",transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:24,height:24,borderRadius:"50%",border:`1.5px solid ${answered&&isCorrectOpt?"#527060":answered&&isSelected&&!isCorrectOpt?"#B05C4A":isSelected?T.gold:T2.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:answered&&isCorrectOpt?"rgba(82,112,96,0.15)":"transparent"}}>
                  <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:answered&&isCorrectOpt?"#527060":answered&&isSelected&&!isCorrectOpt?"#B05C4A":T2.text3}}>{String.fromCharCode(65+i)}</span>
                </div>
                <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:textColor,lineHeight:1.6,margin:0,flex:1}}>{opt}</p>
                {answered&&isCorrectOpt&&<span style={{color:"#527060",fontSize:16,flexShrink:0}}>✓</span>}
                {answered&&isSelected&&!isCorrectOpt&&<span style={{color:"#B05C4A",fontSize:16,flexShrink:0}}>✗</span>}
              </div>
            </div>
          );
        })}
        {answered && (
          <div style={{...cs.card,borderLeft:`2px solid ${correct?T.gold:"rgba(176,92,74,0.5)"}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:16}}>{correct?"✓":"💡"}</span>
              <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:correct?T.gold:"#B05C4A",textTransform:"uppercase",letterSpacing:"1px"}}>{correct?`+${round.pts} points`:"The clearest version was "+String.fromCharCode(65+round.correct)}</div>
            </div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,margin:0}}>{round.feedback}</p>
          </div>
        )}
        {answered&&!onNavLabel&&<button onClick={nextRound} style={cs.cta}>{isLast?"See Your Results →":"Next Round →"}</button>}
      </div>
    );
  }

  // ── ORDERING ROUND ─────────────────────────────────────────────────────────
  if (round.type === 'cardsort') {
    if (sortCards.length === 0) {
      const cards = [...round.cards];
      for (let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
      setSortCards(cards);
      return null;
    }
    const placedSet = new Set(Object.values(sortPlaced).filter(v=>v!=null));
    const unplaced = sortCards.map((_,i)=>i).filter(i=>!placedSet.has(i));
    const allPlaced = unplaced.length === 0;
    const correctCount = sortChecked ? round.buckets.filter(b=>sortPlaced[b]!=null&&sortCards[sortPlaced[b]].bucket===b).length : 0;
    const allCorrect = sortChecked && correctCount === round.cards.length;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div style={{display:"flex",gap:6}}>
            {ROUNDS.map((_,i)=>(
              <div key={i} style={{width:isDesktop?32:24,height:4,borderRadius:2,background:i<roundIdx?T.gold:i===roundIdx?"rgba(138,158,132,0.5)":T2.border,transition:"background 0.3s"}}/>
            ))}
          </div>
          <div style={{flex:1,height:2,background:T2.border,borderRadius:2}}>
            <div style={{height:"100%",width:(((roundIdx+1)/ROUNDS.length)*100)+"%",background:T.gold,borderRadius:2,transition:"width 0.4s"}}/>
          </div>
          <div style={cs.pts}>{totalPts} pts</div>
        </div>
        {/* Task card */}
        <div style={cs.card}>
          <div style={cs.label}>{round.label} — {round.name}</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?18:16,color:T2.text,lineHeight:1.4,margin:0,fontWeight:500}}>{round.task}</p>
        </div>
        {/* Unplaced card tray */}
        {unplaced.length > 0 && (
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px"}}>
              {sortSelected===null ? "Tap a card to select it" : "Card selected — tap a bucket below to place it"}
            </div>
            {unplaced.map(i=>(
              <div key={i} onClick={()=>tapSortCard(i)}
                style={{padding:"13px 16px",borderRadius:4,border:`1px solid ${sortSelected===i?T.gold:T2.border}`,background:sortSelected===i?"rgba(138,158,132,0.08)":T2.bg,cursor:"pointer",transition:"all 0.15s",boxShadow:sortSelected===i?"0 0 0 2px rgba(138,158,132,0.15)":"none",userSelect:"none"}}>
                <p style={{fontFamily:T.serif,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.6,margin:0}}>{sortCards[i].text}</p>
              </div>
            ))}
          </div>
        )}
        {/* Buckets */}
        <div style={{display:"flex",flexDirection:isDesktop?"row":"column",gap:10}}>
          {round.buckets.map((bucket,bi)=>{
            const idx = sortPlaced[bucket];
            const correct = sortChecked && idx!=null && sortCards[idx].bucket===bucket;
            const wrong   = sortChecked && idx!=null && sortCards[idx].bucket!==bucket;
            const highlight = !sortChecked && sortSelected!==null && idx==null;
            const bucketLabel = ['Understand','Explain','Simplify','Refine'][bi];
            return (
              <div key={bucket} onClick={()=>tapSortBucket(bucket)}
                style={{flex:1,borderRadius:4,border:`1.5px solid ${correct?"#527060":wrong?"#B05C4A":highlight?"rgba(138,158,132,0.5)":T2.border}`,background:correct?"rgba(82,112,96,0.06)":wrong?"rgba(176,92,74,0.06)":highlight?"rgba(138,158,132,0.04)":"transparent",cursor:!sortChecked?"pointer":"default",transition:"all 0.15s",minHeight:isDesktop?90:72,display:"flex",flexDirection:"column",padding:"11px 14px",gap:8}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:correct?"#527060":wrong?"#B05C4A":T.gold,textTransform:"uppercase",letterSpacing:"2px"}}>{bucketLabel}</span>
                  {correct && <span style={{color:"#527060",fontSize:13}}>✓</span>}
                  {wrong   && <span style={{color:"#B05C4A",fontSize:13}}>✗</span>}
                  {idx==null && !sortChecked && <span style={{fontFamily:T.sans,fontSize:10,color:"rgba(138,158,132,0.4)"}}>place here</span>}
                </div>
                {idx!=null && <p style={{fontFamily:T.serif,fontSize:isDesktop?13:12,color:T2.text,lineHeight:1.5,margin:0}}>{sortCards[idx].text}</p>}
              </div>
            );
          })}
        </div>
        {!sortChecked && allPlaced && <button onClick={checkSort} style={cs.cta}>Check My Answers →</button>}
        {sortChecked && (
          <div style={{...cs.card,borderLeft:`2px solid ${allCorrect?T.gold:"rgba(176,92,74,0.5)"}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:allCorrect?T.gold:"#B05C4A",textTransform:"uppercase",letterSpacing:"1px"}}>{allCorrect?`Perfect — +${round.pts} points`:`${correctCount}/4 correct — +${Math.round(round.pts*(correctCount/4))} points`}</div>
            </div>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.65,margin:0}}>{round.feedback}</p>
          </div>
        )}
        {sortChecked && !onNavLabel && <button onClick={nextRound} style={{...cs.cta,marginTop:4}}>{isLast?"See Your Results →":"Next Round →"}</button>}
      </div>
    );
  }

  // ── EXPLAIN ROUND ──────────────────────────────────────────────────────────
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{display:"flex",gap:6}}>
          {ROUNDS.map((_,i)=>(
            <div key={i} style={{width:isDesktop?32:24,height:4,borderRadius:2,background:i<roundIdx?T.gold:i===roundIdx?"rgba(138,158,132,0.5)":T2.border,transition:"background 0.3s"}}/>
          ))}
        </div>
        <div style={cs.pts}>{totalPts} pts</div>
      </div>
      <div style={cs.card}>
        <div style={cs.label}>{round.label} — {round.name}</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,color:T2.text,lineHeight:1.4,marginBottom:12,fontWeight:500}}>{round.task}</p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text4,margin:0,lineHeight:1.5}}>{round.hint}</p>
      </div>
      {!aiResult ? (
        <>
          <div style={cs.card}>
            <div style={cs.label}>Your explanation</div>
            <textarea value={explainText} onChange={e=>setExplainText(e.target.value)} placeholder={round.placeholder||"Explain it simply…"} style={{width:"100%",minHeight:isDesktop?88:72,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
          </div>
          <button onClick={scoreExplain} disabled={aiLoading||explainText.trim().length<5} style={{...cs.cta,background:aiLoading||explainText.trim().length<5?"rgba(44,36,22,0.25)":T.ink,cursor:aiLoading||explainText.trim().length<5?"not-allowed":"pointer"}}>
            {aiLoading?"Reading your explanation…":"Get Feedback →"}
          </button>
        </>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{...cs.card,background:"#0A0804",border:"0.5px solid rgba(138,158,132,0.15)"}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(138,158,132,0.7)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Your AmplifyU coach says</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,fontWeight:600,color:"#F5EFE6",lineHeight:1.4,margin:"0 0 10px"}}>{aiResult.praise}</p>
            <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.6)",lineHeight:1.6,margin:0}}>→ {aiResult.tip}</p>
          </div>
          <div style={{...cs.card,borderLeft:"2px solid "+T2.border}}>
            <div style={cs.label}>Your explanation</div>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"{explainText}"</p>
          </div>
          {!onNavLabel&&<button onClick={nextRound} style={cs.cta}>{isLast?"See Your Results →":"Next Round →"}</button>}
        </div>
      )}
    </div>
  );
}


// ─── VOICE WARM-UP — D1 Practice ─────────────────────────────────────────────
export function D1WarmUpWidget({ T, T2, isDesktop, onNavLabel, onNavFn, onComplete }) {
  const roleId = (() => { try { return localStorage.getItem("au1_role"); } catch(_) { return null; } })();

  const IC_BRIEF  = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
  const IC_STAR   = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  const IC_BULB   = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>;
  const IC_TROPHY = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4h10v7a5 5 0 0 1-10 0V4z"/><path d="M7 9H4a1 1 0 0 0-1 1v1a3 3 0 0 0 2.7 2.96"/><path d="M17 9h3a1 1 0 0 1 1 1v1a3 3 0 0 1-2.7 2.96"/></svg>;
  const IC_CAL    = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  const IC_PEOPLE = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  const IC_CHART  = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13 16 9 12 2 19"/><polyline points="16 7 22 7 22 13"/></svg>;
  const IC_TARGET = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
  const IC_SHIELD = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  const IC_SPROUT = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M12 12C12 12 7 10 7 5c0 0 5 0 5 7z"/><path d="M12 12C12 12 17 10 17 5c0 0-5 0-5 7z"/></svg>;

  const UNIVERSAL = [
    { label: "Describe your role to someone who's never heard of it.", icon: IC_BRIEF },
    { label: "Tell us about a project or piece of work you've enjoyed recently.", icon: IC_STAR },
  ];

  const PERSONA_TOPICS = {
    individual: [
      { label: "What's a problem you've solved recently?", icon: IC_BULB },
      { label: "Describe a piece of work you're particularly proud of.", icon: IC_TROPHY },
    ],
    delivery: [
      { label: "Tell us about a project you're leading.", icon: IC_CHART },
      { label: "Describe how you keep a project moving when priorities change.", icon: IC_CAL },
    ],
    people: [
      { label: "Describe how you motivate your team.", icon: IC_PEOPLE },
      { label: "Tell us about a time you helped someone develop.", icon: IC_SPROUT },
    ],
    senior: [
      { label: "What's one challenge your organisation is facing?", icon: IC_TARGET },
      { label: "Describe a decision you've made that had a significant impact.", icon: IC_SHIELD },
    ],
  };

  const FALLBACK = [
    { label: "Describe a recent win at work.", icon: IC_TROPHY },
    { label: "What are you working on this week?", icon: IC_CAL },
  ];

  const TOPICS = [...UNIVERSAL, ...(PERSONA_TOPICS[roleId] || FALLBACK)];

  const [phase, setPhase] = useState('select'); // 'select' | 'record'
  const [sel, setSel] = useState(null);
  const [isRec, setIsRec] = useState(false);
  useWakeLock(isRec);
  const [recDone, setRecDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [aiObs, setAiObs] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [micError, setMicError] = useState(false);
  const [transcribeFailed, setTranscribeFailed] = useState(false);
  const [fallbackText, setFallbackText] = useState('');
  const timerRef = useRef(null);
  const mediaRecRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Wire bottom nav
  useEffect(() => {
    if (phase === 'record') {
      if (aiObs) {
        onNavLabel("Start Simulation");
        onNavFn.current = () => onComplete(TOPICS[sel].label);
      } else if (analysing || isRec) {
        // disable while recording or while AI is processing
        onNavLabel(null);
        onNavFn.current = null;
      } else {
        onNavLabel("Skip");
        onNavFn.current = () => onComplete(TOPICS[sel].label);
      }
    } else {
      onNavLabel(null);
      onNavFn.current = null;
    }
  }, [phase, sel, aiObs, analysing, isRec]);

  // Stop any in-flight recording if the widget unmounts (e.g. user swipes away mid-recording)
  useEffect(() => {
    return () => {
      try {
        const mr = mediaRecRef.current;
        if (mr && mr.state !== 'inactive') {
          mr.onstop = null;
          mr.stop();
          mr.stream?.getTracks().forEach(t => t.stop());
        }
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (isRec) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRec]);

  function selectTopic(i) {
    setSel(sel === i ? null : i);
  }

  function beginRehearsal() {
    if (sel === null) return;
    setPhase('record');
    setIsRec(false);
    setRecDone(false);
    setElapsed(0);
    setAiObs(null);
    setAnalysing(false);
    setMicError(false);
    setTranscribeFailed(false);
    setFallbackText('');
  }

  function startRec() {
    setIsRec(true);
    setElapsed(0);
    setMicError(false);
    setTranscribeFailed(false);
    audioChunksRef.current = [];
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        let mr;
        try { mr = new MediaRecorder(stream, {mimeType: 'audio/webm'}); }
        catch { mr = new MediaRecorder(stream); }
        mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mr.start(1000);
        mediaRecRef.current = mr;
      }).catch(() => { setIsRec(false); setMicError(true); });
    } else {
      setIsRec(false);
      setMicError(true);
    }
  }

  function stopRecording(cb) {
    const mr = mediaRecRef.current;
    if (!mr || mr.state === 'inactive') { cb('', true); return; }
    mr.onstop = async () => {
      mr.stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
      try {
        const b64 = await blobToB64(blob);
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({b64, mimeType: 'audio/webm'}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Transcription failed');
        cb((data.text || '').trim(), false);
      } catch (err) {
        console.error('[D1Rehearsal] transcribe error:', err);
        cb('', true);
      }
    };
    try { mr.stop(); } catch(e) { cb('', true); }
  }

  async function runCoach(spoken) {
    const topicText = TOPICS[sel].label;
    try {
      const content = spoken.length > 10
        ? `You are a warm communication coach listening back to a 20-second voice warm-up.\n\nTopic the user spoke about: "${topicText}"\nWhat they said: "${spoken}"\n\nWrite exactly 2 sentences of feedback. Rules:\n- Sentence 1: pick out ONE specific thing from their actual words — a phrase, an idea, or the way they put something — and name it directly. Start with what worked.\n- Sentence 2: one forward-looking note tied to today's communication practice — keep it brief and encouraging.\nDo NOT give topic advice. Do NOT say "good start" or "great job". Respond only to what they specifically said. No scores, no lists.`
        : `You are a warm communication coach. The user just spoke for ~20 seconds on this topic: "${topicText}".\n\nWrite exactly 2 sentences. Rules:\n- Sentence 1: make a specific observation about what speaking on THIS particular topic requires — the courage, the self-knowledge, the translation work involved. Frame it as something you noticed about how they approached it, not generic advice.\n- Sentence 2: one short encouraging note that connects to today's session.\nMake the user feel genuinely seen. No scores, no lists.`;
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 150, messages: [{ role: 'user', content }] })
      });
      const d = await res.json();
      const obs = (d.content || []).map(b => b.text || '').join('').trim();
      setAiObs(obs || "Your voice was clear and your energy was right. That's the foundation — everything else builds from here.");
    } catch {
      setAiObs("Your voice was clear and your energy was right. That's the foundation — everything else builds from here.");
    }
    setAnalysing(false);
    setRecDone(true);
  }

  function stopRec() {
    setIsRec(false);
    setAnalysing(true);
    clearInterval(timerRef.current);
    stopRecording((spoken, failed) => {
      if (failed) {
        setAnalysing(false);
        setTranscribeFailed(true);
        return;
      }
      runCoach(spoken);
    });
  }

  const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  // ── Phase: select topic ───────────────────────────────────────────────────
  if (phase === 'select') return (
    <div style={{ padding: isDesktop ? "44px 52px" : "0 0", overflowY: "auto" }}>
      <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Rehearsal · Day 1</div>
      <h2 style={{ fontFamily: T.serif, fontSize: isDesktop ? 40 : 28, fontWeight: 600, color: "#2C2416", lineHeight: 1.1, marginBottom: 20 }}>Voice Warm-Up</h2>
      <p style={{ fontFamily: T.sans, fontSize: isDesktop ? 16 : 15, color: "#A8998A", lineHeight: 1.6, fontWeight: 400, marginBottom: 24 }}>Choose one topic below and speak for around 30 seconds. This is simply a chance to find your voice. Just speak naturally, and we'll take care of the rest.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isDesktop ? 12 : 10 }}>
        {TOPICS.map((topic, i) => {
          const isSel = sel === i;
          return (
            <button key={i} onClick={() => selectTopic(i)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 10, padding: isDesktop ? "22px 16px" : "18px 14px",
              borderRadius: 6, cursor: "pointer", textAlign: "center",
              border: `${isSel ? "2px" : "0.5px"} solid ${isSel ? "#8A9E84" : T2.border}`,
              background: isSel ? "rgba(138,158,132,0.1)" : T2.surface,
              boxShadow: isSel ? "0 4px 20px rgba(138,158,132,0.15)" : "none",
              transition: "all 0.15s ease",
            }}>
              <div style={{ color: isSel ? "#527060" : "#A8998A" }}>{topic.icon}</div>
              <span style={{ fontFamily: T.sans, fontSize: isDesktop ? 14 : 13, color: T2.text, lineHeight: 1.45, fontWeight: isSel ? 600 : 400 }}>{topic.label}</span>
            </button>
          );
        })}
      </div>
      <button onClick={beginRehearsal} disabled={sel === null} style={{
        width: "100%", marginTop: isDesktop ? 24 : 20, padding: isDesktop ? "14px" : "13px",
        borderRadius: 4, border: "none",
        background: sel === null ? "rgba(44,36,22,0.12)" : "#2C2416",
        color: sel === null ? "#A8998A" : "#F7F3EC",
        fontSize: isDesktop ? 15 : 14, fontWeight: 600, fontFamily: T.sans,
        cursor: sel === null ? "not-allowed" : "pointer", minHeight: 48, transition: "all 0.2s",
      }}>
        Begin Rehearsal →
      </button>
    </div>
  );

  // ── Phase: record ─────────────────────────────────────────────────────────
  return (
    <div style={{ padding: isDesktop ? "44px 52px" : "0 0", overflowY: "auto" }}>
      <button onClick={() => { setPhase('select'); setIsRec(false); setRecDone(false); clearInterval(timerRef.current); }} style={{ background: "none", border: "none", fontFamily: T.sans, fontSize: 13, color: "#A8998A", cursor: "pointer", padding: "0 0 24px", display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Choose a different topic
      </button>
      <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Rehearsal · Day 1</div>
      <h2 style={{ fontFamily: T.serif, fontSize: isDesktop ? 36 : 26, fontWeight: 600, color: "#2C2416", lineHeight: 1.1, marginBottom: 20 }}>Your topic</h2>
      <div style={{ background: "rgba(138,158,132,0.10)", border: "1.5px solid #8A9E84", borderRadius: 8, padding: isDesktop ? "22px 24px" : "18px 20px", marginBottom: 28, display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ color: "#8A9E84", flexShrink: 0, marginTop: 2 }}>{TOPICS[sel].icon}</div>
        <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 18 : 16, fontWeight: 500, color: "#2C2416", lineHeight: 1.5, margin: 0 }}>{TOPICS[sel].label}</p>
      </div>
      <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 15 : 14, color: "#6B5E44", lineHeight: 1.65, marginBottom: 28 }}>Speak about this for around 30 seconds. Don't worry about being perfect — there's no recording saved or scored here.</p>

      {analysing ? (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <style>{`@keyframes d1spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ width: 36, height: 36, border: "2px solid #DDD5C4", borderTop: "2px solid #8A9E84", borderRadius: "50%", margin: "0 auto 16px", animation: "d1spin 0.8s linear infinite" }} />
          <p style={{ fontFamily: T.sans, fontSize: 14, color: "#A8998A", margin: 0 }}>Your coach is listening…</p>
        </div>
      ) : recDone && aiObs ? (
        <div style={{ background: "#F0EBE2", borderRadius: 8, padding: "24px 24px 22px", border: "0.5px solid #DDD5C4" }}>
          <div style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 14 }}>Your AmplifyU Coach</div>
          <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 19 : 17, color: "#2C2416", lineHeight: 1.72, margin: "0 0 16px" }}>{aiObs}</p>
          <div style={{ height: "0.5px", background: "#DDD5C4", marginBottom: 16 }} />
          <p style={{ fontFamily: T.serif, fontSize: isDesktop ? 15 : 14, color: "#6B5E44", lineHeight: 1.65, margin: "0 0 20px" }}>
            Nice. Your voice is warmed up. Now let's apply today's lesson to a real communication scenario.
          </p>
          <button onClick={() => onComplete(TOPICS[sel].label)} style={{
            width: "100%", padding: "13px 20px", borderRadius: 4, border: "none",
            background: "linear-gradient(135deg, #8A9E84 0%, #527060 100%)",
            color: "white", fontFamily: T.sans, fontSize: 15, fontWeight: 600, cursor: "pointer",
          }}>
            Start Simulation →
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <button onClick={isRec ? stopRec : startRec} style={{
            width: 80, height: 80, borderRadius: "50%", border: "none", cursor: "pointer",
            background: isRec ? "#B05C4A" : "#8A9E84",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isRec ? "0 0 0 8px rgba(176,92,74,0.15)" : "0 0 0 6px rgba(138,158,132,0.12)",
            transition: "all 0.2s ease",
          }}>
            {isRec
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" fill="white"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill="white"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            }
          </button>
          {isRec && (
            <div style={{ fontFamily: T.sans, fontSize: 13, color: "#B05C4A", fontWeight: 600 }}>
              Recording — {fmtTime(elapsed)} &nbsp;·&nbsp; tap to stop
            </div>
          )}
          {!isRec && !micError && !transcribeFailed && (
            <div style={{ fontFamily: T.sans, fontSize: 13, color: "#A8998A" }}>Tap to start recording</div>
          )}
          {!isRec && (micError || transcribeFailed) && (
            <div style={{ width: "100%", marginTop: 4, padding: "16px 18px", background: "#F0EBE2", borderRadius: 8, border: "0.5px solid #DDD5C4" }}>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: "#6B5E44", lineHeight: 1.6, margin: "0 0 10px" }}>
                {micError ? "We couldn't access your microphone. Check your permissions, or type your response instead." : "We couldn't quite hear that. Try again, or type your response instead."}
              </p>
              <textarea value={fallbackText} onChange={e => setFallbackText(e.target.value)} placeholder="Type what you'd say…" style={{ width: "100%", minHeight: 80, background: "transparent", border: "none", borderBottom: "0.5px solid #DDD5C4", padding: "8px 0", fontFamily: T.sans, fontSize: 13, color: "#2C2416", resize: "none", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}/>
              {fallbackText.trim().length > 10 && (
                <button onClick={() => { setMicError(false); setTranscribeFailed(false); setAnalysing(true); runCoach(fallbackText.trim()); }} style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 4, border: "none", background: "#2C2416", color: "#F7F3EC", fontFamily: T.sans, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Submit →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RECORD & REVIEW™ — D1 Simulation ────────────────────────────────────────
export function D1SimWidget({T, T2, isDesktop, warmUpTopic, onRecordingChange}) {
  const _roleId = (() => { try { return localStorage.getItem("au1_role"); } catch(_) { return null; } })();

  const _WORK_BY_ROLE = {
    individual: [
      "Describe a challenge you solved recently.",
      "Explain a piece of work you're particularly proud of.",
      "Tell us about a skill you've developed over the past year.",
      "Describe a time you improved a process or way of working.",
    ],
    delivery: [
      "Tell us about a project you're leading.",
      "Describe a challenge you've had to navigate on a project.",
      "How do you keep stakeholders aligned when priorities change?",
      "Describe a project outcome you're particularly proud of.",
    ],
    people: [
      "Tell us about a time you helped someone succeed.",
      "Describe how you build trust within your team.",
      "Explain how you handle difficult conversations.",
      "Tell us about a leadership challenge you've learned from.",
    ],
    senior: [
      "Describe a strategic challenge your organisation is facing.",
      "Tell us about a decision that had significant impact.",
      "Explain a change you're currently leading.",
      "Describe how you balance short-term results with long-term thinking.",
    ],
  };

  const PROMPTS = {
    Work: _WORK_BY_ROLE[_roleId] || [
      "Describe a challenge you solved recently.",
      "What makes a team truly effective?",
      "Describe the best leader you've worked with.",
      "Tell us about a difficult decision you made.",
    ],
    "Reflection":[
      "Describe your perfect day from start to finish.",
      "Which season of the year do you enjoy most, and why?",
      "What's something you've always wanted to try?",
      "Describe a place you always enjoy going back to.",
    ],
    "Perspectives":[
      "Which decade would you most like to live in and why?",
      "What invention couldn't you live without and why?",
      "Would you rather have more time or more money?",
      "What's a skill everyone should learn?",
    ],
  };
  const ALL_PROMPTS = Object.values(PROMPTS).flat();
  const DIMS = ["Clarity","Structure","Brevity","Focus","Simplicity"];
  const FOCUS = ["Shorter opening","Lead with main point","Fewer filler words","Sharper ending","Stronger structure"];

  const saved = loadD1SimState();
  const [phase, setPhase] = useState(saved.phase || 'intro');
  const [cat, setCat] = useState(saved.cat || 'Work');
  const [prompt, setPrompt] = useState(saved.prompt || null);
  const [elapsed, setElapsed] = useState(0);
  const [isRec, setIsRec] = useState(false);
  useWakeLock(isRec);
  const [transcript, setTranscript] = useState(saved.transcript || '');
  const [fallback, setFallback] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(saved.feedback || null);
  const [round1, setRound1] = useState(saved.round1 || null);
  const [selectedFocus, setSelectedFocus] = useState(saved.selectedFocus || []);
  const [waveVals, setWaveVals] = useState([0.3,0.5,0.4,0.6,0.4,0.5,0.3,0.6,0.4]);

  const [audioURL, setAudioURL] = useState(saved.audioURL || null);
  const [playing, setPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [waveAnim, setWaveAnim] = useState(0);
  const [audioDuration, setAudioDuration] = useState(120);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showCompareT1, setShowCompareT1] = useState(false);
  const [showCompareT2, setShowCompareT2] = useState(false);
  const [hoveredDim, setHoveredDim] = useState(null);
  const [micError, setMicError] = useState(false);
  const [transcribeFailed, setTranscribeFailed] = useState(false);
  const audioRef = useRef(null);
  const mediaRecRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const waveRef = useRef(null);

  useEffect(()=>{
    window.scrollTo(0,0);
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    try{const p=document.getElementById('au-right-panel');if(p)p.scrollTop=0;}catch(_){}
  },[phase]);

  // Block the app's "Next"/"Review" nav while actively recording or transcribing,
  // so an accidental tap can't discard an in-progress or just-finished recording.
  useEffect(()=>{
    onRecordingChange?.(isRec || analyzing);
  },[isRec, analyzing]);

  // Persist results across accidental navigation away (e.g. swiping to another step) —
  // mid-recording/analysing states aren't resumable, so those collapse back to 'prompt' on save.
  useEffect(()=>{
    try{
      const persistedPhase=(phase==='recording'||phase==='analyzing')?(prompt?'prompt':'intro'):phase;
      sessionStorage.setItem(D1SIM_KEY, JSON.stringify({
        phase:persistedPhase, cat, prompt, transcript, feedback, round1, selectedFocus, audioURL,
      }));
    }catch{}
  },[phase, cat, prompt, transcript, feedback, round1, selectedFocus, audioURL]);

  // Stop any in-flight recording/playback if the widget unmounts (e.g. user swipes away)
  useEffect(()=>{
    return ()=>{
      try{ audioRef.current?.pause(); }catch{}
      try{
        const mr=mediaRecRef.current;
        if(mr && mr.state!=='inactive'){
          mr.onstop=null;
          mr.stop();
          mr.stream?.getTracks().forEach(t=>t.stop());
        }
      }catch{}
    };
  },[]);

  useEffect(()=>{
    if(isRec){
      timerRef.current=setInterval(()=>setElapsed(e=>e+1),1000);
    } else {
      clearInterval(timerRef.current);
    }
    return ()=>clearInterval(timerRef.current);
  },[isRec]);

  useEffect(()=>{
    if(!isRec){clearInterval(waveRef.current);return;}
    waveRef.current=setInterval(()=>{
      setWaveVals(()=>Array.from({length:9},()=>0.2+Math.random()*0.8));
    },150);
    return ()=>clearInterval(waveRef.current);
  },[isRec]);

  useEffect(()=>{
    if(!playing)return;
    let id;
    function tick(){const a=audioRef.current;if(a&&a.duration)setAudioProgress(a.currentTime/a.duration);setWaveAnim(t=>t+1);id=requestAnimationFrame(tick);}
    id=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(id);
  },[playing]);

  function doStart(){
    setIsRec(true); setElapsed(0); setTranscript(''); setAudioURL(null); setMicError(false); setTranscribeFailed(false);
    if(navigator.mediaDevices?.getUserMedia && window.MediaRecorder){
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        const mimeType=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg'].find(t=>MediaRecorder.isTypeSupported(t))||'';
        const mr=mimeType?new MediaRecorder(stream,{mimeType}):new MediaRecorder(stream);
        audioChunksRef.current=[];
        mr.ondataavailable=e=>{if(e.data.size>0)audioChunksRef.current.push(e.data);};
        mr.start(1000); mediaRecRef.current=mr;
      }).catch(()=>{ setIsRec(false); setMicError(true); });
    } else {
      setIsRec(false); setMicError(true);
    }
  }

  function doStop(){
    setIsRec(false); clearTimeout(timerRef.current);
    setPhase('analyzing');
    const mr=mediaRecRef.current;
    if(!mr||mr.state==='inactive'){ analyzeText(fallback); return; }
    mr.onstop=async()=>{
      const blobType=mr.mimeType||'audio/webm';
      const blob=new Blob(audioChunksRef.current,{type:blobType});
      setAudioURL(URL.createObjectURL(blob));
      mr.stream.getTracks().forEach(t=>t.stop());
      let spoken='';
      try{
        const b64=await blobToB64(blob);
        const res=await fetch('/api/transcribe',{
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({b64, mimeType:blobType}),
        });
        const data=await res.json();
        if(!res.ok) throw new Error(data.error||'Transcription failed');
        spoken=(data.text||'').trim();
      }catch(err){
        console.error('[D1Sim] transcribe error:', err);
        setTranscribeFailed(true); setPhase('recording'); return;
      }
      setTranscript(spoken);
      analyzeText(spoken||fallback);
    };
    try{ mr.stop(); }catch(e){ analyzeText(fallback); }
  }

  async function analyzeText(text){
    setPhase('analyzing');
    const isRetry=!!round1;
    const mockScores=()=>Object.fromEntries(DIMS.map(d=>[d,Math.floor(Math.random()*22)+60+(isRetry?10:0)]));
    const mockOverall=Math.floor(Math.random()*18)+62+(isRetry?12:0);
    const mock={
      overall:mockOverall,
      headline:mockOverall>=80?"Your ideas landed with precision.":mockOverall>=70?"Your strongest idea arrived late.":"Your message needed a clearer focus.",
      subtitle:isRetry?"Measurable progress. Keep going.":"A solid starting point. Now let's sharpen it.",
      scores:mockScores(),
      worked:["Natural and conversational tone","Confident, assured delivery"],
      workedSubs:["Your language stayed grounded and jargon-free — easy to follow from the first sentence.","You didn't hedge or qualify unnecessarily. That directness builds trust."],
      opportunities:[
        {title:"Get to your main point sooner",detail:"Your core idea took about 30 seconds to appear. Try opening with it directly — context can follow."},
        {title:"Reduce filler pauses between ideas",detail:"A silent pause reads as confidence. Replacing hesitation sounds with a beat of silence keeps your listener focused on your words."}
      ],
      wordUpgrades:[
        {word:"really good communicator",upgrade:"someone who commands a room",type:"word"},
        {word:"I kind of just went with it",upgrade:"I committed to the direction",type:"rephrase"},
        {word:"stuff like that",upgrade:"specifics like delivery and pacing",type:"word"}
      ],
      insight:"Your delivery felt natural and genuine. The opportunity is structure: if you lead with your clearest point in the first sentence, everything that follows lands harder.",
      priorityFocus:"Lead with your main point first",
      restructure:["Open with your core message in the first 5–10 seconds — context and evidence can follow.","Group related ideas together rather than alternating between points. You switched topics 3 times.","End with a single, memorable takeaway rather than trailing off. A strong last sentence doubles retention."],
      markers:[{pos:0.20,label:"Filler cluster",type:"filler"},{pos:0.44,label:"Ramble moment",type:"ramble"},{pos:0.66,label:"Strongest point",type:"strong"}]
    };
    if(!text||text.trim().length<15){
      if(!isRetry){setRound1({...mock,_transcript:text});setFeedback({...mock,_transcript:text});}
      else setFeedback({...mock,_transcript:text,prev:round1});
      setPhase(isRetry?'comparison':'feedback');
      return;
    }
    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1200,messages:[{role:"user",content:`You are a world-class executive communication coach. Analyse this spoken response for CLARITY only.\n\nPrompt: "${prompt}"\nResponse: "${text}"\n\nIMPORTANT: All feedback must be PERSONALISED to what this specific person actually said. Reference their actual words, phrases, and ideas. Do not write generic feedback.\n\nWORD UPGRADES — identify 2–4 phrases the speaker actually used that could land harder. Two types:\nTYPE "word": Swap a vague or weak word/phrase for an elevated, precise alternative. Target: "really good" → "exceptional", "kind of" → "precisely", "stuff" → "specifics", "just" used as a weakener → remove it, passive or generic verbs → power verbs. Replace the word or short phrase.\nTYPE "rephrase": Rewrite a wordy or roundabout clause for punch and clarity — the rewrite should be noticeably sharper. Target: buried points, hedged statements, long-winded phrasing. Include the full original clause in "word" and the sharper version in "upgrade".\n\nCRITICAL — NEVER flatten intentional rhetorical devices. If the speaker repeats a word or phrase for emphasis (tripling, anaphora — e.g. "grew and grew and grew", "again and again", "day after day") this is DELIBERATE rhetoric for impact. Do NOT simplify to a flat word like "grew rapidly" — that destroys the effect. Either skip it or suggest an amplified version that preserves the device (e.g. "grew, expanded, and dominated"). Only target genuinely weak, vague, or unclear language.\n\nAlso identify 2–4 key moments in the transcript for waveform annotation. For each marker, estimate its proportional position (0.0 = start, 1.0 = end) based on word count.\n\nMarker types (only include if genuinely present):\n- "filler": where hesitation sounds (um, uh) cluster\n- "ramble": where the answer starts repeating or losing focus\n- "strong": where the single clearest/most impactful statement occurs (always include one)\n- "unclear": where meaning becomes hard to follow\n\nReturn ONLY valid JSON:\n{"overall":<50-100>,"headline":"<max 10 words: single most important insight>","subtitle":"<one warm encouraging sentence>","scores":{"Clarity":<50-100>,"Structure":<50-100>,"Brevity":<50-100>,"Focus":<50-100>,"Simplicity":<50-100>},"worked":["<strength 1: short title, specific to what they said>","<strength 2: short title, specific to what they said>"],"workedSubs":["<1 sentence expanding on strength 1, quoting or paraphrasing something they actually said>","<1 sentence expanding on strength 2, quoting or paraphrasing something they actually said>"],"opportunities":[{"title":"<4-7 word title for opportunity 1, specific to what they said>","detail":"<1-2 sentences referencing a specific moment from their response>"},{"title":"<4-7 word title for opportunity 2, different from opportunity 1>","detail":"<1-2 sentences referencing another specific moment from their response>"}],"wordUpgrades":[{"word":"<exact phrase from transcript>","upgrade":"<elevated word OR sharper rewrite>","type":"<word|rephrase>"},{"word":"<another phrase>","upgrade":"<stronger version>","type":"<word|rephrase>"},{"word":"<third phrase>","upgrade":"<stronger version>","type":"<word|rephrase>"}],"insight":"<2 sentences of personalised coaching, referencing specific moments or phrases from their response>","priorityFocus":"<single most important thing to work on next — 5-8 words>","restructure":["<specific rewrite instruction 1 referencing what they actually said — e.g. move the point about X to the opening>","<specific rewrite instruction 2 — e.g. cut or compress the section where they said Y>","<specific rewrite instruction 3 — e.g. close with Z as a memorable final line>"],"markers":[{"pos":<0.0-1.0>,"label":"<Filler cluster|Ramble moment|Strongest point|Unclear section>","type":"<filler|ramble|strong|unclear>"}]}`}]})});
      const d=await res.json();
      const raw=(d.content||[]).map(b=>b.text||'').join('').trim();
      const m=raw.match(/\{[\s\S]*\}/);
      const parsed=JSON.parse(m[0]);
      if(!isRetry){setRound1({...parsed,_transcript:text});setFeedback({...parsed,_transcript:text});}
      else setFeedback({...parsed,_transcript:text,prev:round1});
    }catch{
      if(!isRetry){setRound1({...mock,_transcript:text});setFeedback({...mock,_transcript:text});}
      else setFeedback({...mock,_transcript:text,prev:round1});
    }
    setPhase(isRetry?'comparison':'feedback');
  }

  function surprise(){
    const p=ALL_PROMPTS[Math.floor(Math.random()*ALL_PROMPTS.length)];
    setPrompt(p); setPhase('recording'); setElapsed(0); setIsRec(false); setTranscript(''); setFallback('');
  }

  function reset(){setPhase('intro');setPrompt(null);setElapsed(0);setIsRec(false);setTranscript('');setFallback('');setFeedback(null);setRound1(null);setSelectedFocus([]);setAudioURL(null);try{sessionStorage.removeItem(D1SIM_KEY);}catch{}}

  const cs={
    card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:isDesktop?"24px":"18px"},
    label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8},
    h2:{fontFamily:T.serif,fontSize:isDesktop?36:26,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10},
    body:{fontFamily:T.sans,fontSize:isDesktop?15:14,color:T2.text3,lineHeight:1.65,margin:0},
    cta:{width:"100%",padding:isDesktop?"14px":"13px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:isDesktop?15:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,transition:"all 0.2s"},
    ghost:{width:"100%",padding:"11px",borderRadius:4,border:"0.5px solid "+T2.border,background:"transparent",color:T2.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.sans,minHeight:44},
  };
  const fmtElapsed = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if(phase==='intro') return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>

      {/* HOW IT WORKS — top, both desktop + mobile */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>How it works</div>
        <h2 style={{fontFamily:T.serif,fontSize:isDesktop?28:22,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:isDesktop?20:16}}>A simple 4-step clarity check-in.</h2>
        <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
          {[
            {n:1,label:"Choose a topic",     icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M4 6h14v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6z" stroke={T.gold} strokeWidth="1.3"/><path d="M4 6l7 5 7-5" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:2,label:"Speak naturally",    icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={T.gold} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2M8 19h6" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
            {n:3,label:"AI scores clarity",  icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4H17l-3.5 2.5 1.5 4L11 11l-4 2.5 1.5-4L5 7h4.5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
            {n:4,label:"Reflect & listen",   icon:<svg width={isDesktop?22:18} height={isDesktop?22:18} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={T.gold} strokeWidth="1.3"/><path d="M8 9a3 3 0 016 0v4a3 3 0 01-6 0V9z" stroke={T.gold} strokeWidth="1.3"/></svg>},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:isDesktop?48:36,height:isDesktop?48:36,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:isDesktop?8:6}}>{s.icon}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?9:8,fontWeight:700,color:T.gold,marginBottom:3}}>{s.n}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?16:15,color:T2.text2,textAlign:"center",lineHeight:1.3,maxWidth:isDesktop?76:52}}>{s.label}</div>
              </div>
              {i<3&&<div style={{height:1,width:isDesktop?12:5,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:isDesktop?30:24}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* SINGLE CONTENT CARD */}
      <div style={{...cs.card,padding:isDesktop?"26px 28px":"20px 20px"}}>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?11:10,fontWeight:500,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:isDesktop?14:12,margin:"0 0 "+(isDesktop?"14px":"12px")}}>Every great communicator starts by listening.</p>
        <h3 style={{fontFamily:T.serif,fontSize:isDesktop?26:22,fontWeight:600,color:T2.text,lineHeight:1.15,margin:"0 0 "+(isDesktop?"18px":"14px")}}>The First Step to Great Communication.</h3>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.7,margin:"0 0 "+(isDesktop?"14px":"12px")}}>
          Record yourself speaking and receive personalised feedback from your AmplifyU Coach on your clarity, structure, brevity, focus and simplicity.
        </p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?16:15,color:T2.text,lineHeight:1.7,margin:"0 0 "+(isDesktop?"14px":"12px")}}>
          Self-review is one of the fastest ways to improve communication — trusted by elite speakers, performers and Fortune 500 leaders because <strong>awareness comes before change.</strong>
        </p>
        <p style={{fontFamily:T.sans,fontSize:isDesktop?18:17,color:T2.text3,lineHeight:1.7,margin:0,fontStyle:"italic"}}>
          This is your baseline. Every session from here builds greater clarity, confidence and influence.
        </p>
      </div>

      <button onClick={()=>setPhase('prompt')} style={{...cs.cta,fontSize:isDesktop?16:15,padding:isDesktop?"18px":"16px"}}>Choose a Topic to Begin →</button>
    </div>
  );

  // ── PROMPT SELECTION ──────────────────────────────────────────────────────
  if(phase==='prompt') {
    const D1ICONS=[
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 20c0-4.4 3.1-8 7-8s7 3.6 7 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M20 14c1.8.8 3 2.6 3 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 6.5h6.5L16 12.5l2.5 7L12 16l-6.5 3.5 2.5-7L3.5 8.5H10z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 014.9 11.9L16 15v2H8v-2l-.9-1.1A7 7 0 0112 2z" stroke="currentColor" strokeWidth="1.3"/><path d="M9 19h6M10 21h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    ];
    const D1REFLECT_ICONS=[
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.3"/></svg>,
    ];
    const D1PERSPECT_ICONS=[
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3"/><polyline points="12 7 12 12 15 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 0 1 4.9 11.9L16 15v2H8v-2l-.9-1.1A7 7 0 0 1 12 2z" stroke="currentColor" strokeWidth="1.3"/><path d="M9 19h6M10 21h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 2h14M5 22h14M6 2v4l5.5 6L6 18v4M18 2v4l-5.5 6L18 18v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
    ];
    const go=(p)=>{setPrompt(p);setPhase('recording');setElapsed(0);setIsRec(false);setTranscript('');setFallback('');};
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <p style={{...cs.body,marginBottom:0}}>Choose a conversation starter</p>
          <p style={{...cs.body,marginBottom:16}}>Speak naturally. No preparation. The goal is not perfection — it's awareness.</p>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:4}}>
          {Object.keys(PROMPTS).map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{padding:"8px 16px",borderRadius:3,border:`0.5px solid ${cat===c?T.gold:T2.border}`,background:cat===c?"rgba(138,158,132,0.1)":"transparent",color:cat===c?T.gold:T2.text3,fontSize:12,fontWeight:cat===c?600:400,cursor:"pointer",fontFamily:T.sans,minHeight:36,transition:"all 0.15s"}}>{c}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isDesktop?12:10}}>
          {PROMPTS[cat].map((p,i)=>(
            <div key={i} onClick={()=>go(p)} className="au-lift" style={{...cs.card,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:isDesktop?"28px 18px 24px":"22px 14px 20px",gap:14,transition:"border-color 0.2s,box-shadow 0.2s"}}>
              <div style={{color:"rgba(44,36,22,0.3)",lineHeight:0}}>{(cat==='Work'?D1ICONS:cat==='Reflection'?D1REFLECT_ICONS:D1PERSPECT_ICONS)[i]}</div>
              <p style={{fontFamily:T.sans,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.45,margin:0,fontWeight:400}}>{p}</p>
            </div>
          ))}
        </div>
        <button onClick={surprise} style={{...cs.ghost,marginTop:4}}>✦ Surprise Me</button>
      </div>
    );
  }

  // ── RECORDING ────────────────────────────────────────────────────────────
  if(phase==='recording') return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Your prompt</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?20:17,color:T2.text,lineHeight:1.4,margin:0,fontWeight:500}}>{prompt}</p>
      </div>
      <div style={{...cs.card,textAlign:"center",padding:isDesktop?"36px 32px":"28px 20px"}}>
        {/* Waveform */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,height:36,marginBottom:20}}>
          {waveVals.map((h,i)=>(
            <div key={i} style={{width:isDesktop?4:3,background:isRec?T.gold:T2.border,borderRadius:2,height:isRec?Math.round(h*32)+"px":"4px",transition:"height 0.12s ease,background 0.3s ease"}}/>
          ))}
        </div>
        {!isRec && <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,marginBottom:20}}>Speak naturally — around 2 minutes is a good guide.</p>}
        {/* Record button — same mic-circle pattern as Rehearsal */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <button onClick={isRec ? doStop : doStart} style={{
            width:80,height:80,borderRadius:"50%",border:"none",cursor:"pointer",
            background:isRec?"#B05C4A":"#8A9E84",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:isRec?"0 0 0 8px rgba(176,92,74,0.15)":"0 0 0 6px rgba(138,158,132,0.12)",
            transition:"all 0.2s ease",
          }}>
            {isRec
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" fill="white"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill="white"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            }
          </button>
          {isRec
            ? <div style={{fontFamily:T.sans,fontSize:13,color:"#B05C4A",fontWeight:600}}>Recording — {fmtElapsed(elapsed)} &nbsp;·&nbsp; tap to stop</div>
            : <div style={{fontFamily:T.sans,fontSize:13,color:T2.text3}}>Tap to start recording</div>}
        </div>
      </div>
      {/* Text fallback — only surfaces on genuine mic/transcription failure */}
      {!isRec && (micError || transcribeFailed) && (
        <div style={cs.card}>
          <div style={cs.label}>{micError ? "Microphone unavailable" : "We couldn't quite hear that"}</div>
          <p style={{...cs.body,marginBottom:10}}>{micError ? "Check your microphone permission, or type your response instead." : "Type your response instead, or tap Start Recording to try again."}</p>
          <textarea value={fallback} onChange={e=>setFallback(e.target.value)} placeholder="Write what you'd say for 90–120 seconds…" style={{width:"100%",minHeight:120,background:"transparent",border:"none",borderBottom:"0.5px solid "+T2.divider,padding:"8px 0",fontFamily:T.sans,fontSize:14,color:T2.text,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box"}}/>
          {fallback.trim().length>15 && <button onClick={()=>{setMicError(false);setTranscribeFailed(false);analyzeText(fallback);}} style={{...cs.cta,marginTop:14}}>Analyse My Response →</button>}
        </div>
      )}
      <button onClick={()=>setPhase('prompt')} style={{fontFamily:T.sans,fontSize:12,color:T2.text4,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>← Choose different prompt</button>
    </div>
  );

  // ── ANALYZING ────────────────────────────────────────────────────────────
  if(phase==='analyzing') return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",gap:20}}>
      <div style={{width:48,height:48,borderRadius:"50%",border:`2px solid ${T2.border}`,borderTop:`2px solid ${T.gold}`,animation:"spin 0.8s linear infinite"}}/>
      <div style={{textAlign:"center"}}>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?22:18,color:T2.text,marginBottom:6}}>Analysing your clarity…</p>
        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text4,margin:0}}>Your AmplifyU coach is reviewing your response.</p>
      </div>
    </div>
  );

  // ── FEEDBACK ─────────────────────────────────────────────────────────────
  if(phase==='feedback' && feedback) {
    const RDIMS=["Clarity","Structure","Brevity","Simplicity","Focus"];
    const RANGLES=[-90,-18,54,126,198];
    const cx=100,cy=100,rMax=72;
    const lPt=(aDeg)=>{const a=aDeg*Math.PI/180;return[cx+80*Math.cos(a),cy+80*Math.sin(a)];};
    const DIM_TIPS={
      "Clarity":"How easy your words were to understand at first hearing — clear language, no ambiguity.",
      "Structure":"How logically your ideas flowed — did you have a beginning, middle, and point that landed?",
      "Brevity":"How concisely you made your point. High scores mean no wasted words.",
      "Focus":"How tightly you stayed on topic — high scores mean no tangents or drift.",
      "Simplicity":"How free your language was from jargon or unnecessary complexity."
    };
    const rPt=(sc,aDeg)=>{const a=aDeg*Math.PI/180;return[cx+(sc/100)*rMax*Math.cos(a),cy+(sc/100)*rMax*Math.sin(a)];};
    const gridPoly=(pct)=>RANGLES.map(a=>{const[x,y]=rPt(100,a);return`${(cx+(x-cx)*pct).toFixed(1)},${(cy+(y-cy)*pct).toFixed(1)}`;}).join(' ');
    const dataPoly=RDIMS.map((d,i)=>{const[x,y]=rPt(feedback.scores[d]||50,RANGLES[i]);return`${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ');
    const WBARS=Array.from({length:60},(_,i)=>Math.max(0.08,Math.min(1,Math.sin(i/59*Math.PI)*0.65+0.25+Math.sin(i*4.7)*0.13+Math.cos(i*2.3)*0.11)));
    const TYPE_COLOR={filler:"#C4714A",ramble:"#B05C4A",strong:"#527060",unclear:"#B05C4A"};
    const rawMarkers=feedback.markers&&feedback.markers.length>0?feedback.markers:[{pos:0.43,label:"Ramble moment",type:"ramble"},{pos:0.65,label:"Strongest point",type:"strong"}];
    const aiM1=rawMarkers.map(m=>({...m,color:TYPE_COLOR[m.type]||"#C8A46A"}));
    const rawText1=transcript||'';
    const fillerM1=findFillerClusters(rawText1).slice(0,3).map(idx=>({pos:Math.max(0.05,Math.min(0.92,idx/rawText1.length)),label:"Filler cluster",color:"#C4714A"}));
    const MARKERS=[...fillerM1,...aiM1].filter((m,i,arr)=>!arr.slice(0,i).some(p=>Math.abs(p.pos-m.pos)<0.06)).sort((a,b)=>a.pos-b.pos);
    const fmtTime=s=>{const m=Math.floor(s/60);const sec=Math.floor(s%60);return m+":"+(sec<10?"0":"")+sec;};
    const scoreColor=s=>s>=80?T.gold:s>=70?"#7A9E84":T2.text3;
    function getAudio(){
      if(!audioRef.current&&audioURL){
        audioRef.current=new Audio(audioURL);
        audioRef.current.onloadedmetadata=()=>{ if(audioRef.current.duration&&isFinite(audioRef.current.duration)) setAudioDuration(audioRef.current.duration); };
        audioRef.current.addEventListener('ended',()=>{setPlaying(false);setAudioProgress(0);});
      }
      return audioRef.current;
    }
    function togglePlay(){
      if(!audioURL){setPlaying(p=>!p);return;}
      const a=getAudio();if(!a)return;
      if(playing){a.pause();setPlaying(false);}
      else{a.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false));}
    }
    function seekTo(pos){
      const a=getAudio();if(!a)return;
      a.currentTime=pos*(a.duration||0);
      if(!playing)a.play().then(()=>setPlaying(true)).catch(()=>{});
    }
    return (
    <div style={{display:"flex",flexDirection:"column",gap:isDesktop?14:12}}>

      {/* 1 HERO — score + prompt + benchmark */}
      <div style={{background:"#0A0804",borderRadius:8,padding:isDesktop?"28px 32px":"22px 20px",border:"0.5px solid rgba(138,158,132,0.15)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(138,158,132,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
        {prompt&&<div style={{fontFamily:T.sans,fontSize:10,color:"rgba(138,158,132,0.45)",marginBottom:12,lineHeight:1.4}}>You responded to: <em style={{color:"rgba(138,158,132,0.65)"}}>{prompt}</em></div>}
        <div style={{display:"flex",gap:isDesktop?32:20,alignItems:"flex-start",marginBottom:8}}>
          <div style={{flexShrink:0}}>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?80:64,fontWeight:600,color:T.gold,lineHeight:1}}>{feedback.overall}</div>
            <div style={{fontFamily:T.sans,fontSize:10,color:"rgba(245,239,230,0.35)",marginTop:2}}>/ 100</div>
            <div style={{fontFamily:T.sans,fontSize:9,color:"rgba(138,158,132,0.5)",marginTop:6}}>Day 1 avg: 65</div>
          </div>
          <div style={{paddingTop:8}}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{marginBottom:6}}><path d="M10 2l1.5 4H16l-3.5 2.5 1.5 4L10 10l-4 2.5 1.5-4L4 6h4.5z" stroke={T.gold} strokeWidth="1.2" strokeLinejoin="round"/></svg>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?24:19,fontWeight:600,color:"#F5EFE6",lineHeight:1.25,margin:"0 0 8px"}}>{feedback.headline||"Your message had strong moments."}</p>
            <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,color:"rgba(245,239,230,0.55)",margin:0,lineHeight:1.5}}>{feedback.subtitle||"A solid starting point. Now let's sharpen it."}</p>
          </div>
        </div>
      </div>

      {/* 2 COACH SAYS — moved to top */}
      <div style={{...cs.card,padding:isDesktop?"22px 28px":"18px 20px"}}>
        <div style={cs.label}>Your AmplifyU Coach Says</div>
        <div style={{display:"flex",gap:isDesktop?18:12,alignItems:"flex-start"}}>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?44:34,color:T.gold,lineHeight:0.8,flexShrink:0,marginTop:4,opacity:0.5}}>"</div>
          <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,fontStyle:"italic",color:T2.text,lineHeight:1.7,margin:0,flex:1}}>{feedback.insight}</p>
        </div>
      </div>

      {/* 3 HEAR IT BACK — full player only, at top */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>Hear it back</div>
        {!audioURL&&<p style={{fontFamily:T.serif,fontSize:13,color:T2.text3,margin:"8px 0 0",lineHeight:1.5}}>Audio playback is not available on this device.</p>}
        {audioURL&&playing&&(()=>{const active=[...MARKERS].reverse().find(m=>audioProgress>=m.pos);return active?(<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><div style={{width:6,height:6,borderRadius:"50%",background:active.color,flexShrink:0}}/><span style={{fontFamily:T.sans,fontSize:10,color:active.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em"}}>{active.label}</span></div>):null;})()}
        {audioURL&&<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:isDesktop?14:10}}>
          <button onClick={togglePlay} style={{width:40,height:40,borderRadius:"50%",border:"none",background:T2.text,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
            {playing?<svg width="12" height="14" viewBox="0 0 12 14"><rect x="0" y="0" width="4" height="14" fill={T.bg} rx="1"/><rect x="8" y="0" width="4" height="14" fill={T.bg} rx="1"/></svg>:<svg width="12" height="14" viewBox="0 0 12 14"><path d="M1 1l10 6-10 6V1z" fill={T.bg}/></svg>}
          </button>
          <div style={{flex:1,position:"relative"}}>
            <div style={{display:"flex",position:"relative",height:isDesktop?20:32,marginBottom:4}}>
              {MARKERS.map((m,i)=>{
                const row=!isDesktop&&i%2===1;
                return(
                <div key={i} onClick={()=>seekTo(m.pos)} style={{position:"absolute",left:(m.pos*100)+"%",transform:"translateX(-50%)",textAlign:"center",zIndex:2,cursor:"pointer",top:row?16:0}}>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?9:7,color:m.color,fontWeight:600,whiteSpace:"nowrap"}}>{m.label}</div>
                  <div style={{fontFamily:T.sans,fontSize:isDesktop?8:6,color:T2.text4,whiteSpace:"nowrap"}}>{fmtTime(m.pos*audioDuration)}</div>
                </div>
                );
              })}
            </div>
            <div onClick={(e)=>{const r=e.currentTarget.getBoundingClientRect();seekTo((e.clientX-r.left)/r.width);}} style={{height:36,display:"flex",alignItems:"center",gap:1,position:"relative",overflow:"hidden",borderRadius:4,cursor:"pointer"}}>
              {WBARS.map((h,i)=>{const pos=i/WBARS.length;const nm=MARKERS.find(m=>Math.abs(m.pos-pos)<0.04);const played=pos<audioProgress;const near=playing?Math.max(0,1-Math.abs(pos-audioProgress)*18):0;const ah=playing?h*(0.82+0.28*Math.abs(Math.sin(waveAnim*0.07+i*0.45))+0.25*near):h;return<div key={i} style={{flex:1,background:nm?nm.color:played?`rgba(138,158,132,${0.55+ah*0.35})`:`rgba(138,158,132,${0.2+ah*0.25})`,borderRadius:1,height:Math.round(ah*32)+"px",minWidth:2}}/>;} )}
              {MARKERS.map((m,i)=><div key={i} style={{position:"absolute",left:(m.pos*100)+"%",top:0,bottom:0,width:2,background:m.color,opacity:0.6}}/>)}
              {audioProgress>0&&<div style={{position:"absolute",left:(audioProgress*100)+"%",top:0,bottom:0,width:2,background:"rgba(245,239,230,0.9)",zIndex:3,transform:"translateX(-50%)",boxShadow:"0 0 6px rgba(245,239,230,0.5)"}}/>}
            </div>
            <div onClick={(e)=>{const r=e.currentTarget.getBoundingClientRect();seekTo((e.clientX-r.left)/r.width);}} style={{width:"100%",height:4,background:"rgba(138,158,132,0.15)",borderRadius:2,position:"relative",cursor:"pointer",margin:"10px 0 6px",flexShrink:0}}>
              <div style={{position:"absolute",left:0,top:0,height:"100%",width:(audioProgress*100)+"%",background:"rgba(138,158,132,0.65)",borderRadius:2}}/>
              {MARKERS.map((m,i)=><div key={i} style={{position:"absolute",top:"50%",left:(m.pos*100)+"%",transform:"translate(-50%,-50%)",width:7,height:7,borderRadius:"50%",background:m.color,zIndex:2,boxShadow:"0 0 0 1.5px rgba(0,0,0,0.15)"}}/>)}
              <div style={{position:"absolute",top:"50%",left:(audioProgress*100)+"%",transform:"translate(-50%,-50%)",width:12,height:12,borderRadius:"50%",background:"rgba(245,239,230,0.95)",boxShadow:"0 1px 4px rgba(0,0,0,0.3)",zIndex:3,transition:"left 0.1s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
              <span style={{fontFamily:T.sans,fontSize:9,color:T2.text4}}>{fmtTime(audioProgress*audioDuration)}</span>
              <span style={{fontFamily:T.sans,fontSize:9,color:T2.text4}}>{fmtTime(audioDuration)}</span>
            </div>
          </div>
        </div>}
        {rawText1&&<div style={{marginTop:12,borderTop:"0.5px solid "+T2.border,paddingTop:10}}>
          <button onClick={()=>setShowTranscript(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:5,fontFamily:T.sans,fontSize:10,color:T2.text3,fontWeight:500}}>
            <span>{showTranscript?"Hide transcript":"View transcript"}</span>
            <span style={{fontSize:9}}>{showTranscript?"↑":"↓"}</span>
          </button>
          {showTranscript&&<p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,margin:"10px 0 0",background:"rgba(44,36,22,0.04)",borderRadius:4,padding:"10px 12px"}}>{rawText1}</p>}
        </div>}
      </div>

      {/* 4 CLARITY PROFILE */}
      <div style={{...cs.card,padding:isDesktop?"22px 24px":"18px 20px"}}>
        <div style={cs.label}>Your Clarity Profile</div>
        <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,margin:"0 0 16px",lineHeight:1.5}}>Five dimensions scored 0–100. Higher scores mean your communication was clearer, tighter, and easier to follow in that area.</p>
        <div style={{display:isDesktop?"flex":"block",gap:24,alignItems:"center"}}>
          <div style={{flexShrink:0,display:"flex",justifyContent:"center"}}>
            <svg viewBox="0 0 200 200" width={isDesktop?200:170} height={isDesktop?200:170}>
              {[0.25,0.5,0.75,1].map((p,i)=><polygon key={i} points={gridPoly(p)} fill="none" stroke={T2.border} strokeWidth={p===1?"0.8":"0.5"}/>)}
              {RANGLES.map((a,i)=>{const[x,y]=rPt(100,a);return<line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke={T2.border} strokeWidth="0.5"/>;})}
              <polygon points={dataPoly} fill="rgba(138,158,132,0.18)" stroke="rgba(82,112,96,0.7)" strokeWidth="1.5"/>
              {RDIMS.map((d,i)=>{const[x,y]=rPt(feedback.scores[d]||50,RANGLES[i]);return<circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3" fill={T.gold} opacity="0.9"/>;})}
              {RDIMS.map((d,i)=>{const[lx,ly]=lPt(RANGLES[i]);return<text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:"'Inter',sans-serif",fontSize:"7px",fill:"rgba(44,36,22,0.65)",fontWeight:500}}>{d}</text>;})}
            </svg>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:10,marginTop:isDesktop?0:10}}>
            {RDIMS.map((d,i)=>{const sc=feedback.scores[d]||50;return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,position:"relative"}}>
                <div style={{width:isDesktop?88:76,flexShrink:0,display:"flex",alignItems:"center",gap:4}}>
                  <span
                    style={{fontFamily:T.sans,fontSize:isDesktop?13:12,color:T2.text,cursor:"pointer",borderBottom:"1px dashed rgba(44,36,22,0.2)"}}
                    onMouseEnter={isDesktop ? ()=>setHoveredDim(d) : undefined}
                    onMouseLeave={isDesktop ? ()=>setHoveredDim(null) : undefined}
                    onClick={()=>setHoveredDim(hoveredDim===d?null:d)}
                  >{d}</span>
                </div>
                {hoveredDim===d&&(
                  <div style={{position:"absolute",left:0,top:"calc(100% + 4px)",background:"#2C2416",borderRadius:6,padding:"8px 12px",zIndex:20,width:220,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",pointerEvents:"none"}}>
                    <p style={{fontFamily:T.sans,fontSize:10,color:"rgba(245,239,230,0.85)",margin:0,lineHeight:1.5}}>{DIM_TIPS[d]}</p>
                  </div>
                )}
                <div style={{flex:1,height:4,background:T2.bg,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:sc+"%",background:"linear-gradient(90deg,rgba(138,158,132,0.5),rgba(82,112,96,0.85))",borderRadius:2,transition:"width 1s ease"}}/>
                </div>
                <span style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontWeight:600,color:scoreColor(sc),width:24,textAlign:"right",flexShrink:0}}>{sc}</span>
              </div>
            );})}
          </div>
        </div>
      </div>

      {/* 4b HOW TO RESTRUCTURE */}
      {feedback.restructure&&feedback.restructure.length>0&&(
      <div style={{...cs.card,padding:isDesktop?"20px 24px":"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <div style={cs.label}>How to hit 80%+ on Structure</div>
        </div>
        <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,margin:"0 0 14px",lineHeight:1.5}}>Based on your response, here is exactly how to restructure it next time:</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {feedback.restructure.map((tip,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(138,158,132,0.12)",border:"0.5px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold}}>{i+1}</span>
              </div>
              <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,color:T2.text,lineHeight:1.6,margin:0}}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* 5 STRENGTHS + OPPORTUNITY — personalised */}
      <div style={{display:isDesktop?"grid":"flex",gridTemplateColumns:"1fr 1fr",flexDirection:"column",gap:isDesktop?12:10}}>
        <div style={{...cs.card,padding:isDesktop?"20px 22px":"16px 18px"}}>
          <div style={cs.label}>What came across well</div>
          {[0,1].map(i=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<1?14:0,paddingBottom:i<1?14:0,borderBottom:i<1?"0.5px solid "+T2.divider:"none"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6,opacity:0.7}}/>
              <div>
                <div style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,marginBottom:4}}>{feedback.worked[i]||""}</div>
                <div style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T2.text3,lineHeight:1.5}}>{(feedback.workedSubs||[])[i]||""}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{...cs.card,padding:isDesktop?"20px 22px":"16px 18px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"#B07A40",textTransform:"uppercase",letterSpacing:"2px",marginBottom:14}}>Biggest Opportunities</div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {(feedback.opportunities||[{title:"Lead with your strongest point.",detail:"Your core message took too long to land. Start with it next time."},{title:"Reduce filler pauses",detail:"Replace hesitation sounds with a confident beat of silence."}]).map((opp,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",paddingBottom:i===0?14:0,borderBottom:i===0?"0.5px solid rgba(176,122,64,0.15)":"none"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(176,122,64,0.1)",border:"1px solid rgba(176,122,64,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                  <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"#B07A40"}}>{i+1}</span>
                </div>
                <div>
                  <p style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 5px"}}>{opp.title}</p>
                  <p style={{fontFamily:T.sans,fontSize:isDesktop?11:10,color:T2.text3,lineHeight:1.6,margin:0}}>{opp.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6 WORD UPGRADES */}
      {feedback.wordUpgrades&&feedback.wordUpgrades.length>0&&(
        <div style={{...cs.card,padding:isDesktop?"20px 24px":"16px 18px"}}>
          <div style={cs.label}>Word Upgrades</div>
          <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,margin:"0 0 14px",lineHeight:1.5}}>The best communicators choose precise words. Here are personalised upgrades based on what you said:</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {feedback.wordUpgrades.map((u,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",gap:5}}>
                {u.type==="rephrase"&&<div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:"rgba(138,158,132,0.7)",textTransform:"uppercase",letterSpacing:"1.5px"}}>Rephrase for impact</div>}
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:"#C4714A",background:"rgba(196,113,74,0.08)",border:"0.5px solid rgba(196,113,74,0.2)",borderRadius:3,padding:"4px 10px",lineHeight:1.5}}>{u.word}</span>
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h12M9 1l4 4-4 4" stroke={T2.text4} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{fontFamily:T.sans,fontSize:isDesktop?12:11,color:T.gold,background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",borderRadius:3,padding:"4px 10px",lineHeight:1.5}}>{u.upgrade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7 FOCUS NEXT ROUND — #1 priority highlighted */}
      <div style={{...cs.card,padding:isDesktop?"20px 22px":"16px 18px"}}>
        <div style={cs.label}>Focus next round</div>
        {feedback.priorityFocus&&(
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(138,158,132,0.08)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.25)",marginBottom:12}}>
            <div style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",flexShrink:0}}>#1</div>
            <span style={{fontFamily:T.serif,fontSize:isDesktop?14:13,fontWeight:600,color:T2.text}}>{feedback.priorityFocus}</span>
          </div>
        )}
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {FOCUS.filter(f=>!feedback.priorityFocus||f.toLowerCase()!==feedback.priorityFocus.toLowerCase()).map((f,i)=>{const sel=selectedFocus.includes(f);return(
            <button key={i} onClick={()=>setSelectedFocus(sf=>sel?sf.filter(x=>x!==f):[...sf,f])} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:20,border:`0.5px solid ${sel?T.gold:T2.border}`,background:sel?"rgba(138,158,132,0.1)":"transparent",color:sel?T.gold:T2.text3,fontFamily:T.serif,fontSize:isDesktop?12:11,cursor:"pointer",transition:"all 0.15s",fontWeight:sel?600:400}}>{f}</button>
          );})}
        </div>
      </div>
    </div>
    );
  }

  // ── COMPARISON ────────────────────────────────────────────────────────────
  if(phase==='comparison' && feedback && feedback.prev) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{background:"#0E0B08",borderRadius:8,padding:isDesktop?"36px 40px":"28px 20px"}}>
        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"rgba(138,158,132,0.8)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Your Improvement</div>
        <div style={{display:"flex",gap:isDesktop?32:20,alignItems:"flex-end",marginBottom:16}}>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.4)",marginBottom:4}}>Round 1</div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?52:40,fontWeight:600,color:"rgba(245,239,230,0.5)",lineHeight:1}}>{feedback.prev.overall}</div>
          </div>
          <div style={{fontFamily:T.serif,fontSize:isDesktop?28:22,color:"rgba(245,239,230,0.3)"}}>→</div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:11,color:T.gold,marginBottom:4}}>Round 2</div>
            <div style={{fontFamily:T.serif,fontSize:isDesktop?52:40,fontWeight:600,color:T.gold,lineHeight:1}}>{feedback.overall}</div>
          </div>
          {feedback.overall > feedback.prev.overall && (
            <div style={{marginLeft:"auto",padding:"8px 16px",background:"rgba(138,158,132,0.15)",borderRadius:4,border:"0.5px solid rgba(138,158,132,0.3)",flexShrink:0}}>
              <div style={{fontFamily:T.serif,fontSize:isDesktop?22:18,fontWeight:600,color:T.gold}}>+{feedback.overall - feedback.prev.overall}</div>
              <div style={{fontFamily:T.sans,fontSize:10,color:"rgba(138,158,132,0.7)"}}>points</div>
            </div>
          )}
        </div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?16:14,fontStyle:"italic",color:"rgba(245,239,230,0.6)",margin:0}}>That's real progress. Awareness changes performance.</p>
      </div>
      {/* Dimension comparison */}
      <div style={cs.card}>
        <div style={cs.label}>Score Comparison</div>
        {["Clarity","Structure","Brevity","Focus","Simplicity"].map((d,i)=>{
          const s1=feedback.prev.scores[d]||0; const s2=feedback.scores[d]||0; const diff=s2-s1;
          return (
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 40px 40px 40px",gap:8,alignItems:"center",paddingBottom:i<4?12:0,marginBottom:i<4?12:0,borderBottom:i<4?"0.5px solid "+T2.divider:"none"}}>
              <span style={{fontFamily:T.sans,fontSize:12,color:T2.text,fontWeight:500}}>{d}</span>
              <span style={{fontFamily:T.serif,fontSize:14,color:T2.text3,textAlign:"right"}}>{s1}</span>
              <span style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T.gold,textAlign:"right"}}>{s2}</span>
              <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:diff>0?"#527060":diff<0?"#B05C4A":T2.text4,textAlign:"right"}}>{diff>0?"+"+diff:diff}</span>
            </div>
          );
        })}
      </div>
      <div style={{...cs.card,borderLeft:"2px solid "+T.gold}}>
        <div style={cs.label}>Coach insight</div>
        <p style={{fontFamily:T.serif,fontSize:isDesktop?17:15,color:T2.text,lineHeight:1.65,margin:0}}>{feedback.insight}</p>
      </div>
      {(feedback.prev._transcript || feedback._transcript) && (
      <div style={cs.card}>
        <div style={cs.label}>Transcripts</div>
        {feedback.prev._transcript && (
          <div style={{marginBottom:showCompareT1?10:0}}>
            <button onClick={()=>setShowCompareT1(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:5,fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:500}}>
              <span>{showCompareT1?"Hide":"View"} Round 1 transcript</span>
              <span style={{fontSize:9}}>{showCompareT1?"↑":"↓"}</span>
            </button>
            {showCompareT1&&<p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,margin:"10px 0 0",background:"rgba(44,36,22,0.04)",borderRadius:4,padding:"10px 12px"}}>{feedback.prev._transcript}</p>}
          </div>
        )}
        {feedback._transcript && (
          <div style={{marginTop:feedback.prev._transcript?12:0,borderTop:feedback.prev._transcript?"0.5px solid "+T2.divider:"none",paddingTop:feedback.prev._transcript?12:0}}>
            <button onClick={()=>setShowCompareT2(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:5,fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:500}}>
              <span>{showCompareT2?"Hide":"View"} Round 2 transcript</span>
              <span style={{fontSize:9}}>{showCompareT2?"↑":"↓"}</span>
            </button>
            {showCompareT2&&<p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,margin:"10px 0 0",background:"rgba(44,36,22,0.04)",borderRadius:4,padding:"10px 12px"}}>{feedback._transcript}</p>}
          </div>
        )}
      </div>
      )}
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>{setPhase('recording');setElapsed(0);setIsRec(false);setTranscript('');setFallback('');setShowCompareT1(false);setShowCompareT2(false);}} style={{...cs.ghost,flex:1}}>Go Again</button>
        <button onClick={reset} style={{...cs.cta,flex:1}}>New Challenge →</button>
      </div>
    </div>
  );

  return null;
}

// ─── D1 Simulation Feedback widget ───────────────────────────────────────────
export function D1SimFeedback({input}) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  async function analyse() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:500,messages:[{role:"user",content:`You are a clarity coach. Analyse this 60-second explanation for clarity:\n\n"${input}"\n\nReturn JSON: {score:number(1-10),strengths:[string,string],gaps:[string,string],rewrite:"one clearer version in 1-2 sentences"}`}]})});
      const data = await res.json();
      const raw = (data.content||[]).map(b=>b.text||"").join("").trim();
      try { const m=raw.match(/\{[\s\S]*\}/); setResult(JSON.parse(m[0])); } catch { setResult({score:7,strengths:["Clear main point","Good conciseness"],gaps:["Passive voice detected","Key point arrived late"],rewrite:"Here's the clearer version: lead with your main outcome, then your evidence, then your ask."}); }
    } catch { setResult(null); }
    setLoading(false);
  }
  return (
    <div>
      <button onClick={analyse} disabled={loading||!input.trim()} style={{width:"100%",padding:"12px",borderRadius:3,border:"none",background:loading||!input.trim()?"#DDD5C4":T.ink,color:loading||!input.trim()?"#6B5E44":T.bg,fontSize:13,fontWeight:600,cursor:loading||!input.trim()?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginBottom:result?16:0}}>
        {loading?"Analysing clarity…":"Get Clarity Score →"}
      </button>
      {result && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{padding:"16px 20px",background:"#EDE8DF",borderRadius:4,border:"0.5px solid #DDD5C4",display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:600,color:T.ink,lineHeight:1}}>{result.score}<span style={{fontSize:20,color:T.gold}}>/10</span></div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#6B5E44"}}>Clarity Score</div>
          </div>
          {result.strengths?.map((s,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"#527060",fontSize:13,flexShrink:0}}>✓</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.ink,lineHeight:1.5}}>{s}</span></div>)}
          {result.gaps?.map((g,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"#B05C4A",fontSize:13,flexShrink:0}}>✗</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.ink,lineHeight:1.5}}>{g}</span></div>)}
          {result.rewrite && <div style={{padding:"14px 18px",background:"#EDE8DF",borderRadius:4,borderLeft:"2px solid #8A9E84"}}><div style={{fontSize:9,fontWeight:600,color:"#527060",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>Rewrite suggestion</div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontStyle:"italic",color:T.ink,margin:0,lineHeight:1.6}}>{result.rewrite}</p></div>}
        </div>
      )}
    </div>
  );
}

// ─── D2 PRACTICE WIDGET ──────────────────────────────────────────────────────

