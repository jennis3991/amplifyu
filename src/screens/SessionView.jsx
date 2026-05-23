import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';
import { D9_FIVE_PS, D9_CARDS, NT_NEURO, THEORY_DATA, FURTHER_READING, REVIEW_CLOSING, REVIEW_BULLETS, LESSONS, D9_REFINEMENTS, SESSION_STEPS, NAV_LABELS } from '../data.js';
import { DeliveryCoachWidget } from '../modules/Day9.jsx';
import { StoryBuilderWidget } from '../modules/Day8.jsx';
import { CoachWidget } from '../modules/CoachWidget.jsx';
import { D10SimFeedback, D10MobileSAR, D10MobileSim } from '../modules/Day10.jsx';
import { D3SimFeedback, D3MobileSim } from '../modules/Day3.jsx';
import { D4SimFeedback, D4MobileSplit, D4MobileSim } from '../modules/Day4.jsx';
import { D1ClarityChallenge, D1SimWidget } from '../modules/Day1.jsx';
import { D2PracticeWidget, D2SimWidget } from '../modules/Day2.jsx';
import { D5PracticeWidget } from '../modules/Day5.jsx';
import { D6PracticeWidget, D6SimWidget } from '../modules/Day6.jsx';
import { D11PracticeWidget, D11SimWidget } from '../modules/Day11.jsx';
import { DIAGRAMS, MODULE_ICONS } from '../diagrams.jsx';
import { Scene, OBScene } from '../scenes.jsx';
import { Timer } from '../components/Timer.jsx';
import { PBar } from '../components/NavComponents.jsx';
import { EditorialTheoryCard, TheoryCard } from './TheoryCards.jsx';
import { getScenariosForDay, getPIEEmphasis } from '../utils.js';

export function SessionView({lesson, isDone, onComplete, onBack, roleId,
activeRole, dark=false, DK={}, isDesktop=false}) {
  const T2 = Object.assign({}, T, DK);
  const [idx, setIdx] = useState(0);
  const rightPanelRef = useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (rightPanelRef.current) rightPanelRef.current.scrollTop = 0;
  }, [idx]);
  const [selSc, setSelSc] = useState(0);
  const [checks, setChecks] = useState({});
  const [exitConfirm, setExitConfirm] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [savedBooks, setSavedBooks] = useState(() => { try { return JSON.parse(localStorage.getItem("au1_saved_books")||"[]"); } catch { return []; } });
  function saveBook(title) {
    const next = savedBooks.includes(title) ? savedBooks.filter(t=>t!==title) : [...savedBooks, title];
    setSavedBooks(next); try { localStorage.setItem("au1_saved_books", JSON.stringify(next)); } catch {}
  }
  const [note, setNote] = useState(() => {
    try { return localStorage.getItem("au1_note_"+lesson.day) || ""; } 
catch { return ""; }
  });
  const [ambitionDraft, setAmbitionDraft] = useState(() => {
    try { return localStorage.getItem("au1_ambition") || ""; } catch { 
return ""; }
  });
  const [ambitionSaved, setAmbitionSaved] = useState(() => {
    try { return !!localStorage.getItem("au1_ambition"); } catch { return 
false; }
  });
  function saveNote(v) {
    setNote(v);
    try { localStorage.setItem("au1_note_"+lesson.day, v); } catch {}
  }
  function saveAmbition(v) {
    setAmbitionDraft(v);
    if (v.trim()) {
      try { localStorage.setItem("au1_ambition", v.trim()); 
setAmbitionSaved(true); } catch {}
    }
  }
  const [ntStory, setNtStory] = useState(() => { try { return localStorage.getItem("au1_nt_story") || ""; } catch { return ""; } });
  const [ntOpenCard, setNtOpenCard] = useState(null);
  const [d9Script, setD9Script] = useState(() => { try { return localStorage.getItem("au1_d9_script") || ""; } catch { return ""; } });
  const [d9OpenCard, setD9OpenCard] = useState(null);
  const [d1MobCard, setD1MobCard] = useState(null);
  const [d2MobCard, setD2MobCard] = useState(null);
  const [d3MobCard, setD3MobCard] = useState(null);
  const [d4MobCard, setD4MobCard] = useState(null);
  const [d5MobCard, setD5MobCard] = useState(null);
  const [d6MobCard, setD6MobCard] = useState(null);
  const [d11MobCard, setD11MobCard] = useState(null);
  const [ntMobCard, setNtMobCard] = useState(null);
  const swipeRef = useRef({x:0,y:0});
  // step is derived from STEPS (NT uses 7-step array, all others use 6-step)
  const scenarios = roleId ? getScenariosForDay(roleId, lesson.day) : lesson.scenarios;
  const activeSc = scenarios[selSc] || scenarios[0];
  const isNT = lesson.day === 8;
  const isD9 = lesson.day === 9;
  const isD1 = lesson.day === 1;
  const isD2 = lesson.day === 2;
  const isD3 = lesson.day === 3;
  const isD4 = lesson.day === 4;
  const isD5 = lesson.day === 5;
  const isD6 = lesson.day === 6;
  const isD10 = lesson.day === 10;
  const isD11 = lesson.day === 11;
  const STEPS = isNT
    ? ["Insight","Theory 1","Theory 2","Example","Practice","Review"]
    : SESSION_STEPS;
  const step = STEPS[idx];

  // ── D10 shared constants ───────────────────────────────────────────────────
  const D10_FACTS = [
    { word:"Visibility",   body:"Great work deserves to be known. Communicating your impact clearly isn't self-promotion — it's making sure your contributions can create the change they're meant to." },
    { word:"Attribution",  body:"You've done the work. Now make sure the right people can see it. Telling your own story clearly is how your effort gets recognised and built upon." },
    { word:"Credibility",  body:"When you can articulate what you deliver in clear, confident terms, people trust you more — and give you the opportunity to deliver more." },
    { word:"Opportunity",  body:"The leaders who can open doors for you can only act on what they know. Help them help you by communicating your impact with clarity and conviction." },
  ];
  const D10_EXAMPLES_DATA = [
    { id:"buffett", title:"Warren Buffett", sub:"Making Performance Simple",
      tag:"Berkshire's results — explained so anyone can understand.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Making Performance Simple</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>Billions in results.<br/>Explained simply.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Every year, Buffett writes a letter to Berkshire shareholders. It could be dense with financial jargon. It isn't.</p>
            <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:17,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"We simply attempt to be fearful when others are greedy and to be greedy only when others are fearful."</p>
            </div>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Complex strategy. One sentence. Maximum clarity.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>He translates decades of complex investment decisions into language any intelligent person can understand. Performance becomes story.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>For every result, ask: what does this mean to someone who wasn't in the room? Answer that. That's your performance statement.</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Performance communication is translation. Translate your work into language your audience already cares about.</p>
          </div>
        </div>
      )},
    { id:"nadella", title:"Satya Nadella", sub:"The Turnaround Story",
      tag:"He made Microsoft's performance feel like a movement.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>The Turnaround Story</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>He didn't report results.<br/>He told a mission.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>When Satya Nadella became CEO, Microsoft's market cap had stagnated for over a decade. He didn't announce a turnaround plan. He told a story about culture.</p>
            <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:17,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"We need to go from a know-it-all company to a learn-it-all company."</p>
            </div>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Within five years, the market cap tripled. The performance followed the story.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>He framed Microsoft's performance not as metrics but as purpose. People fund and follow purpose far more readily than spreadsheets.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Connect your performance to something the organisation already cares about. Don't report results — explain what they mean.</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Brilliant performance without a story is invisible. Give your results a narrative — and watch how differently they land.</p>
          </div>
        </div>
      )},
    { id:"sandberg", title:"Sheryl Sandberg", sub:"Communicating Contribution",
      tag:"She made invisible work visible — at every level.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Communicating Contribution</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>She made invisible<br/>work visible.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Sheryl Sandberg built a culture at Facebook where performance was communicated clearly — not assumed. She modelled it herself.</p>
            <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:17,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"What would you do if you weren't afraid?"</p>
            </div>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>She applied the same principle to performance: name what you've done, name what it achieved, and name what you want next.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>She removed the assumption that good work speaks for itself. It doesn't. The person who communicates their contribution clearly gets the credit they deserve.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>At the end of any project, articulate three things: what you did, what changed because of it, and what you'd do next. Say it out loud.</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Good work in silence is still silence. Name your contribution. Own your impact.</p>
          </div>
        </div>
      )},
    { id:"jobs10", title:"Steve Jobs", sub:"The Product as Performance",
      tag:"He didn't present features. He communicated transformation.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>The Product as Performance</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>Not features.<br/>Transformation.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>When Jobs launched the iPhone in 2007, he didn't list specifications. He framed it as a shift in what was possible.</p>
            <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:17,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"Every once in a while, a revolutionary product comes along that changes everything."</p>
            </div>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>His "performance" was framed as the audience's gain — not the company's achievement.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>He answered the question the audience was already asking: what does this mean for me? Performance that lands always answers that question first.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Frame your result from the audience's point of view: not "I delivered X" but "because of X, you now have Y."</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>The best performance statements don't celebrate the work. They reveal its consequence.</p>
          </div>
        </div>
      )},
  ];

  // ── D3 shared constants ────────────────────────────────────────────────────
  const D3_FACTS = [
    { word:"Trust",     body:"Fillers are a habit, not a flaw. The strongest communicators simply replace them with intentional pauses — and you can too." },
    { word:"Authority", body:"Pausing instead of filling makes you sound more confident. It's a skill you can build with practice, not a talent you're born with." },
    { word:"Attention", body:"When you pause, people listen more closely. Silence creates anticipation. Your message lands with greater weight." },
    { word:"Memory",    body:"Speech without fillers is easier to follow and remember. Remove the noise, and your real message comes through." },
  ];
  const D3_PAUSE_REASONS = [
    { n:1, label:"Fear of Silence",   body:"Most people worry pauses make them look unprepared. They don't. A well-placed pause signals you're thinking carefully — and that's exactly what audiences respect." },
    { n:2, label:"Rushing",           body:"Fillers appear most when we're moving faster than our thoughts. Slowing down by even 10% gives your brain the space to find the right word — every time." },
    { n:3, label:"Lack of Structure", body:"When you know your key points, you need far fewer fillers. A clear structure means you always know where you're going — and that confidence shows." },
  ];
  const D3_EXAMPLES_DATA = [
    { id:"freeman", title:"Morgan Freeman", sub:"Every Word Earns Its Place",
      tag:"The pause is not your enemy. It's your tool.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Every Word Earns Its Place</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>Listen to what<br/>he doesn't say.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Listen to Morgan Freeman narrate anything. You'll notice what he doesn't say. No "ums." No fillers. Just measured, deliberate speech.</p>
            <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:17,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"Hope is a good thing. [pause] Maybe the best of things. [pause] And no good thing ever dies."</p>
              <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,marginTop:8,margin:"8px 0 0"}}>Those pauses? That's where the power lives.</p>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Silence creates anticipation. Fillers create distraction.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>When you don't know what to say next, stop talking. Pause. Breathe. Continue.</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Great speakers use silence the way musicians use rests. The pause is not your enemy — it's your most powerful tool.</p>
          </div>
        </div>
      )},
    { id:"wintour", title:"Anna Wintour", sub:"No Wasted Words",
      tag:"Fillers signal uncertainty. Pauses signal control.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>No Wasted Words</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>One word.<br/>Perfect answer.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Anna Wintour runs Vogue. When she speaks, there's no fluff. Watch any interview — she pauses between thoughts. No "you knows." No hedging.</p>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>A journalist once asked: "What makes a good editor?"</p>
            <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:20,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>She paused for 3 seconds. Then: "Decisiveness."</p>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>She knows what she wants to say. She doesn't need to fill space. The pause signals control, not hesitation.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Prepare your answer before you speak. If you haven't decided what to say, don't start talking yet.</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Filler-free speech starts with knowing your point. The more clearly you think, the more naturally confident you sound.</p>
          </div>
        </div>
      )},
    { id:"ginsburg", title:"Ruth Bader Ginsburg", sub:"Legal Precision",
      tag:"The higher the stakes, the fewer words you should use.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Legal Precision</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>Every pause<br/>was intentional.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Ruth Bader Ginsburg argued cases in front of the Supreme Court. Every word mattered. No room for "ums." Her arguments were surgical: Pause. Point. Evidence. Pause. Next point.</p>
            <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"The question before the Court is... [pause] ...whether the statute applies in this case."</p>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>In high-stakes environments, fillers cost you credibility. Precision builds trust.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Structure your thoughts before you speak. Point 1. Pause. Point 2. Pause. Conclusion.</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>The higher the stakes, the fewer words you should use. And zero fillers.</p>
          </div>
        </div>
      )},
    { id:"obama3", title:"Barack Obama", sub:"The Strategic Pause",
      tag:"Silence isn't empty space. It's emphasis.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>The Strategic Pause</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>Not hesitant.<br/>Brilliant.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Obama is known for his pauses. Mid-sentence, he'll stop. Think. Then continue. Critics called it hesitant. Speech coaches called it brilliant.</p>
            <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"The question is... [3-second pause] ...what kind of country are we going to leave our children?"</p>
              <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:"8px 0 0"}}>That pause? Not a filler. A choice.</p>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Pauses let your audience catch up. It gave the audience time to absorb the weight of the question.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>When you make an important point, pause after it. Let it land before you move on.</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Silence isn't empty space. It's emphasis. The best speakers know when to stop talking.</p>
          </div>
        </div>
      )},
  ];

  // ── D4 shared constants ────────────────────────────────────────────────────
  const D4_FACTS = [
    { word:"Processing Speed", body:"Short sentences let your audience follow along effortlessly. When ideas are easy to absorb, people can focus on meaning rather than structure." },
    { word:"Retention",        body:"Sentences under 15 words are more memorable. The discipline of cutting forces you to find the essential idea — which makes it easier to keep." },
    { word:"Impact",           body:"Short sentences give each idea room to breathe. When you say less, each word carries more. Brevity is a form of respect for your audience." },
    { word:"Persuasion",       body:"\"I have a dream.\" \"Yes we can.\" \"Just do it.\" The most persuasive lines ever spoken? All under 10 words. Short sentences move people." },
  ];
  const D4_EXAMPLES_DATA = [
    { id:"hemingway", title:"Ernest Hemingway", sub:"Every Word Must Earn Its Place",
      tag:"No flourish. No decoration. Just truth.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Every Word Must Earn Its Place</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>The Nobel Prize winner<br/>who mastered brevity.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Hemingway won the Nobel Prize for literature. His secret? Short sentences.</p>
            <div style={{padding:"16px 20px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"The old man fished alone. Eighty-four days. No fish."</p>
              <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:"10px 0 0"}}>"It was a good life. I was happy. We were happy."</p>
            </div>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>No flourish. No decoration. Just truth.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Short sentences force precision. You can't hide weak ideas behind long sentences.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Write your first draft. Then cut every unnecessary word. What's left is what matters.</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Every word you add dilutes your message. The best writers know what to leave out.</p>
          </div>
        </div>
      )},
    { id:"einstein", title:"Albert Einstein", sub:"Make It Simple, But Not Simpler",
      tag:"Complex physics. Simple words. Clear image.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Make It Simple, But Not Simpler</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>Relativity.<br/>In two sentences.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Einstein explained the universe. He could have hidden behind equations. He didn't.</p>
            <div style={{padding:"16px 20px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"Put your hand on a hot stove for a minute. It feels like an hour. Sit with a pretty girl for an hour. It feels like a minute. That's relativity."</p>
            </div>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Complex physics. Simple words. Clear image.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Short sentences make complex ideas accessible. Long sentences create distance between the idea and understanding.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Break the concept into pieces. Explain each piece in one sentence.</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>If Einstein could explain the universe in short sentences, you can explain your work the same way.</p>
          </div>
        </div>
      )},
    { id:"chanel", title:"Coco Chanel", sub:"Elegance Through Elimination",
      tag:"Short sentences. Maximum impact.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Elegance Through Elimination</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>Less is more.<br/>In fashion and words.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Chanel revolutionized fashion with one principle: Less is more. Her words were equally sharp.</p>
            <div style={{padding:"16px 20px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:17,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"Fashion fades. Style remains."</p>
              <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:"10px 0 0"}}>"Simplicity is the keynote of all true elegance."</p>
            </div>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Short sentences. Maximum impact.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Each quote is a complete thought. No wasted words. Just precision.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Say what matters. Cut everything else.</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Elegance in communication is elimination. The best speakers know what to leave out.</p>
          </div>
        </div>
      )},
    { id:"goodall", title:"Jane Goodall", sub:"Science in Simple Sentences",
      tag:"Decades of research. Three short sentences.",
      content:(
        <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
          <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Science in Simple Sentences</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>60 years of research.<br/>Three sentences.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Goodall spent 60 years studying chimpanzees. She could use scientific jargon. She chooses not to.</p>
            <div style={{padding:"16px 20px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"Chimps use tools. They have emotions. They're not so different from us."</p>
            </div>
            <div style={{padding:"16px 20px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"What you do makes a difference. And you have to decide what kind of difference you want to make."</p>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Short sentences make science human. Long sentences make it distant.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>State the discovery in one sentence. State why it matters in the next. Stop there.</p>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>The best educators make the complex feel simple. Short sentences are how they do it.</p>
          </div>
        </div>
      )},
  ];

  // ── D1 shared constants (used by both desktop and mobile) ─────────────────
  const D1_CLARITY_FACTS_DATA = [
    { word:"Cognitive Load",    sub:"If people have to work too hard, you lose them",    bullets:["The brain naturally prefers information that feels easy to process.","If people are working to decode your words, they're not fully absorbing your message."] },
    { word:"Retention",         sub:"If people can repeat it, they remember it",          bullets:["Clear ideas are easier for the brain to store, retrieve, and share.","Complexity gets forgotten. Simplicity gets repeated."] },
    { word:"Credibility",       sub:"True expertise sounds simple",                       bullets:["The clearest communicators often understand the deepest.","Making complexity feel simple signals confidence, clarity, and mastery."] },
    { word:"Decision-Making",   sub:"Clarity removes hesitation",                         bullets:["Unclear communication creates doubt, delay, and second-guessing.","Clear communication makes the next step obvious."] },
  ];
  const D1_FEYNMAN_DATA = [
    { n:1, beat:"Understand",    sub:"Choose a concept and study it deeply." },
    { n:2, beat:"Explain",       sub:"Teach it in simple words as if to someone else. No jargon. No shortcuts." },
    { n:3, beat:"Simplify",      sub:"When you stumble, that's a gap. Go back and fill it. Remove unnecessary complexity." },
    { n:4, beat:"Refine",        sub:"Review, clarify, and improve your explanation. Repeat until a child could follow." },
  ];

  // ── D11 shared constants (used by both desktop + mobile) ──────────────────
  const D11_FACTS = [
    {word:"First Impressions Are Fast", body:"People begin forming impressions in as little as 100 milliseconds — before you've said a single word.", source:"Willis & Todorov, 2006"},
    {word:"People Read Signals",        body:"Humans make rapid judgments about confidence, competence, and trustworthiness from minimal cues. Every signal you send is being decoded.", source:"Ambady & Rosenthal / Princeton research"},
    {word:"Stories Shape Reputation",   body:"Narrative becomes identity. Stories are remembered far more effectively than disconnected information — and they're the most powerful brand-building tool you have.", source:"Cognitive psychology principle"},
    {word:"Consistency Becomes Brand",  body:"Repeated signals become your brand. Every interaction where you show up the same way adds to a pattern people trust, remember, and associate with you.", source:"Brand psychology"},
  ];
  const D11_EXAMPLES = [
    {id:"swift", name:"Taylor Swift", role:"Recording Artist · Cultural Icon",
     headline:"The Master of Connection, Storytelling & Familiarity",
     body:"Taylor Swift didn't just build a music career — she built one of the most valuable personal brands in the world by making people feel like they were part of her journey. From teenage country songwriter to global cultural icon, her brand evolved without losing its emotional core: authenticity, storytelling, reinvention, and direct connection with her audience. Fans don't just consume her work. They feel personally invested in her story. That's personal branding at its most powerful.",
     lesson:"People didn't just buy Taylor Swift's music. They bought into her journey.",
     ingredients:[
       {n:"Authority",    detail:"Taylor owns a category: storytelling through songwriting. Emotional intelligence, reinvention, creative control, world-class performance. The strongest brands are associated with one unmistakable strength."},
       {n:"Generosity",   detail:"Behind-the-scenes access, fan easter eggs, emotional honesty, long-form storytelling, meaningful audience interaction. Her fans feel rewarded for paying attention. Generosity creates loyalty."},
       {n:"Relatability", detail:"Taylor made global fame feel personal. She openly shares heartbreak, ambition, growth, mistakes, reinvention, vulnerability. People feel like they've grown alongside her. People follow stories they emotionally recognise."},
       {n:"Energy",       detail:"Whether performing, speaking, or accepting awards, people feel belief and emotional investment. Her energy says: this matters. Emotion communicates commitment."},
       {n:"Familiarity",  detail:"Albums. Tours. Documentaries. Social media. Interviews. Cultural moments. Her audience sees her repeatedly over years. Visibility compounds trust and connection."},
       {n:"Polarity",     detail:"Taylor is not neutral. She reinvents publicly, owns her narrative, makes bold creative decisions, creates passionate fandom. Memorable brands stand for something."},
     ]},
    {id:"beckham", name:"David Beckham", role:"Athlete · Entrepreneur · Philanthropist",
     headline:"Brand Can Evolve",
     body:"From Manchester United captain to fashion icon to club owner to humanitarian ambassador — Beckham's brand evolved without contradiction. Each phase added a dimension rather than replacing the last. The throughline was always intentional excellence, visual precision, and cultural reach.",
     lesson:"Your brand isn't fixed. It can grow. The key is evolution that feels coherent — new chapters that add to the story rather than contradict it."},
    {id:"wintour", name:"Anna Wintour", role:"Editor-in-Chief, Vogue",
     headline:"Iconic Through Consistency",
     body:"The bob. The sunglasses. The front row seat. For decades, Wintour has signalled authority, taste, and certainty through consistent visual and behavioural choices. She doesn't vary. She doesn't hedge. That consistency creates anticipation and recognition — the foundation of any powerful brand.",
     lesson:"When people know what to expect from you, they trust you. Consistency signals confidence. Variation without purpose signals uncertainty."},
  ];
  const D11_INGREDIENTS = [
    {n:"Authority",    tagline:"Be known for something",         psych:"Authority Bias",          psychBody:"People naturally trust perceived expertise. If you're clearly exceptional in one area, credibility rises fast.",                                                                                              body:"The strongest brands stand for something specific. Not 'good at many things' — but known for one thing first.",    takeaway:"Own a category."},
    {n:"Generosity",   tagline:"Give value freely",               psych:"Reciprocity (Cialdini)",  psychBody:"When people receive value, they naturally feel more positively toward the source.",                                                                                                                       body:"The fastest way to build goodwill is to help before asking. Teach. Share. Educate. Simplify. Practical tips, frameworks, behind-the-scenes lessons.",  takeaway:"Give before you ask."},
    {n:"Relatability", tagline:"Share the human story",           psych:"Narrative Identity",      psychBody:"We connect with people whose journeys feel emotionally relatable. Similarity Attraction effect.",                                                                                                         body:"Expertise creates admiration. Story creates connection. People don't just want polished success — they want setbacks, lessons, beginnings, ambition, growth.",  takeaway:"Let people see the journey."},
    {n:"Energy",       tagline:"Passion is perception",           psych:"Emotional Contagion",     psychBody:"Emotion spreads socially. Your energy influences how others feel — and whether they believe the message matters.",                                                                                        body:"Energy communicates belief. If you sound disengaged, people assume the message lacks importance. Conviction, warmth, and emotional presence are felt before they're heard.",  takeaway:"Passion is contagious."},
    {n:"Familiarity",  tagline:"Repeated exposure builds trust",  psych:"Mere Exposure Effect",   psychBody:"The more often people encounter something, the more positively they tend to feel about it.",                                                                                                              body:"People trust what feels familiar. Series. Podcasts. Regular posts. Repeated appearances. Consistent presence — not one big moment.",  takeaway:"Consistency creates comfort."},
    {n:"Polarity",     tagline:"Have a point of view",            psych:"Von Restorff Effect",     psychBody:"Things that stand out are remembered more easily than things that blend in. Distinctiveness is memorable.",                                                                                              body:"Memorable brands stand for something. They have opinions, preferences, perspectives — not to provoke, but to be distinct. Neutrality is forgettable.",  takeaway:"Being memorable requires definition."},
  ];

  // ── D2 shared constants (used by both desktop + mobile) ───────────────────
  const D2_INSIGHT_CARDS = [
    {word:"Attention",       sub:"A flat voice loses the room in seconds",       bullets:["The brain is wired to respond to variation. Monotone delivery is processed as low-priority — people tune out almost instantly.","Varying pace, pitch, and tone keeps the brain alert and signals that what you're saying is worth their attention."]},
    {word:"First Impression",sub:"Your voice speaks before your words do",        bullets:["Listeners form an impression of your confidence, energy, and credibility within moments of hearing you — before your message even begins.","Delivery shapes the room. A controlled, warm voice signals authority. A rushed or flat voice signals uncertainty."]},
    {word:"Memory",          sub:"Contrast makes ideas stick",                     bullets:["When delivery has rhythm — pauses, pace shifts, vocal emphasis — the brain finds it easier to process, store, and recall.","Information delivered in a varied, engaging voice is significantly more memorable than the same words spoken flatly."]},
    {word:"Influence",       sub:"Same words, completely different meaning",       bullets:["The exact same sentence can sound inspiring, uncertain, authoritative, or disengaged depending entirely on how it's delivered.","Voice doesn't decorate meaning — it creates it. Mastering your delivery is mastering the impact of every word you say."]},
  ];

  // ─── THE STUDIO: Full desktop redesign ───────────────────────────────────
  // Architecture: Fixed left panel (visual stage) + scrollable right panel (content)
  // Navigation: Ambient chapter marks at bottom, not a stretched step bar
  // Pacing: One chapter at a time. Cinematic. Focused. Editorial.
  if (isDesktop) {
    // Left-panel content varies by step — the "visual stage"
    const ChapterMarks = () => (
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {STEPS.map((s, i) => {
          const done2 = i < idx;
          const active = i === idx;
          const locked = i > idx && !isDone;
          // Colours per state
          const circleBg    = done2 ? "#8A9E84" : active ? "#F5EFE6" : "rgba(255,255,255,0.15)";
          const circleBorder= done2 ? "#8A9E84" : active ? "#F5EFE6" : "rgba(255,255,255,0.3)";
          const numColor    = done2 ? "white"   : active ? "#2C2416" : "rgba(255,255,255,0.55)";
          const labelColor  = active ? "#F5EFE6" : done2 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.38)";
          return (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={() => !locked ? setIdx(i) : null}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "8px 14px", borderRadius: 6, border: "none",
                  background: active ? "rgba(245,239,230,0.08)" : "transparent",
                  cursor: locked ? "default" : "pointer",
                  transition: "background 0.2s ease",
                }}>
                {/* Circle marker — 26px, clearly filled */}
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: circleBg,
                  border: "1.5px solid " + circleBorder,
                  transition: "all 0.3s ease",
                  boxShadow: active ? "0 0 0 3px rgba(245,239,230,0.12)" : "none",
                }}>
                  {done2 ? (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 700, lineHeight: 1, color: numColor, fontFamily: T.sans }}>{i + 1}</span>
                  )}
                </div>
                {/* Step name */}
                <span style={{
                  fontSize: 12, fontWeight: active ? 700 : 400,
                  color: labelColor,
                  fontFamily: T.sans, letterSpacing: "0.3px",
                  transition: "color 0.3s", whiteSpace: "nowrap",
                }}>{s}</span>
              </button>
              {/* Connector — clearly visible */}
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 18, height: 1.5, flexShrink: 0,
                  background: i < idx ? "#8A9E84" : "rgba(255,255,255,0.22)",
                  transition: "background 0.4s ease",
                }}/>
              )}
            </div>
          );
        })}
      </div>
    );

    // Left panel: atmospheric, immersive, changes per chapter
    // ── Shared type constants for left panel ─────────────────────────────────
    // CREAM: warm off-white for all left-panel text — high contrast on dark
    // LABEL: Inter uppercase tracked — consistent across every step
    const CREAM = "#F5EFE6";
    const LP_LABEL = { fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, fontFamily: T.sans, fontWeight: 500 };
    const LP_HEADING = { fontFamily: T.serif, fontWeight: 600, color: CREAM, letterSpacing: "-0.5px", lineHeight: 1.15 };
    const LP_BODY   = { fontFamily: T.serif, fontStyle: "italic", color: "rgba(245,239,230,0.72)", lineHeight: 1.6 };

    // ── Shared type constants for right panel ─────────────────────────────────
    // Uniform labels + consistent serif/sans pairing across all 6 steps
    const RP_LABEL  = { fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: T.sans, fontWeight: 500 };

    const LeftPanel = () => {
      const [imgZoom, setImgZoom] = useState(false);
      // ── D4 — Short Sentences left panel overrides ────────────────────────────
      if (isD4) {
        const d4Dark = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
        const d4Ol = <>
          <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.45)" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
        </>;
        if (step === "Insight") return (
          <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
            <img src="/day4-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 72%" }}/>
            {/* Minimal top gradient for label only */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"25%", background:"linear-gradient(to bottom, rgba(10,8,5,0.5) 0%, transparent 100%)", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", top:36, left:48, zIndex:2, animation:"fadeUp 0.7s ease both", display:"flex", alignItems:"center", justifyContent:"space-between", right:48 }}>
              <div style={{ ...LP_LABEL, color:T.gold, textShadow:"0 1px 4px rgba(0,0,0,0.5)" }}>The Evidence</div>
              
            </div>
          </div>
        );
        if (step === "Theory") return (
          <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
            {(() => { const img = THEORY_IMAGES[4]; return img ? (
              <>
                <img src={img.image} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 35%", filter:"brightness(1.2)" }}/>
                {/* Minimal top gradient for label only */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:"28%", background:"linear-gradient(to bottom, rgba(10,8,5,0.5) 0%, transparent 100%)", pointerEvents:"none" }}/>
                <div style={{ position:"absolute", top:36, left:48, zIndex:2, animation:"fadeUp 0.7s ease both" }}>
                  <div style={{ ...LP_LABEL, fontSize:13, color:"#F5EFE6", textShadow:"0 1px 4px rgba(0,0,0,0.5)" }}>The Science</div>
                </div>
              </>
            ) : (
              <div style={{ background:"#131009", height:"100%", display:"flex", alignItems:"flex-end", padding:"40px 48px" }}>
                <div style={{ ...LP_LABEL, color:T.gold }}>The Science</div>
              </div>
            ); })()}
          </div>
        );
        if (step === "Example") return (
          <div style={d4Dark}>
            <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="clarity" height={900} day={4}/></div>
            {d4Ol}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Masters of Brevity</div>
              <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,32px)", maxWidth:380, lineHeight:1.2 }}>The best communicators say more with less.</p>
            </div>
          </div>
        );
        if (step === "Practice") return (
          <div style={{ position:"relative", height:"100%", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
            <img src="/day4-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
            {d4Ol}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, marginBottom:20 }}>Sentence Surgery</div>
              <p style={{ ...LP_HEADING, fontSize:24, maxWidth:340, lineHeight:1.2, marginBottom:16 }}>Cut the length. Keep the meaning.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {["The 15-Word Rule","Kill the Connectors","The Hemingway Challenge"].map((b,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", border:"1px solid rgba(138,158,132,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:8, color:T.gold }}>{i+1}</span>
                    </div>
                    <span style={{ fontFamily:T.sans, fontSize:12, color:"rgba(245,239,230,0.65)" }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        if (step === "Simulation") return (
          <div style={d4Dark}>
            <img src="/day1-simulation.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
            {d4Ol}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>60-Second Challenge</div>
              <p style={{ ...LP_HEADING, fontSize:26, maxWidth:340, lineHeight:1.2 }}>Short sentences only. No exceptions.</p>
            </div>
          </div>
        );
        return null;
      }

      // ── D10 — Performance left panel overrides ───────────────────────────────
      if (isD10) {
        const d10Dark = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
        const d10Ol = <>
          <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.48)" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
        </>;
        const theoryImg10 = THEORY_IMAGES[lesson.theoryImageDay || lesson.day];
        if (step === "Insight") return (
          <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
            <img src="/day10-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.88) 0%, rgba(10,8,5,0.2) 45%, transparent 65%)" }}/>
            <div style={{ position:"absolute", bottom:40, left:48, right:48, zIndex:2, animation:"fadeUp 0.7s ease both", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <div>
                <div style={{ ...LP_LABEL, color:T.gold, marginBottom:12 }}>The Evidence</div>
                <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,34px)", fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.3, margin:0, maxWidth:320 }}>Brilliant work in silence<br/>is still silence.</p>
              </div>
              
            </div>
          </div>
        );
        if (step === "Theory") return (
          <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
            {theoryImg10 ? (
              <>
                <img src={theoryImg10.image} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:theoryImg10.imgObjectPosition||"center", filter:theoryImg10.imgFilter||"none" }}/>
                <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.4)" }}/>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.88) 0%, rgba(10,8,5,0.25) 40%, transparent 65%)" }}/>
                <div style={{ position:"absolute", bottom:40, left:48, zIndex:2, animation:"fadeUp 0.7s ease both", maxWidth:320 }}>
                  <div style={{ ...LP_LABEL, fontSize:13, color:"#F5EFE6", marginBottom:8 }}>The Framework</div>
                  <p style={{ fontFamily:T.serif, fontSize:18, fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.35, margin:0 }}>Deliver, then tell the story of what you delivered.</p>
                </div>
              </>
            ) : (
              <div style={{ background:"#131009", height:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px" }}>
                <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>The Framework</div>
                <p style={{ ...LP_HEADING, fontSize:24, maxWidth:320 }}>The SAR Framework</p>
              </div>
            )}
          </div>
        );
        if (step === "Example") return (
          <div style={d10Dark}>
            <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="pie" height={900} day={10}/></div>
            {d10Ol}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Performance in the Wild</div>
              <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,32px)", maxWidth:380, lineHeight:1.2 }}>The best performers make their contribution impossible to ignore.</p>
            </div>
          </div>
        );
        if (step === "Practice") return (
          <div style={{ position:"relative", height:"100%", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
            <img src="/practice-bg.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
            <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.62)" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.98) 0%, transparent 60%)" }}/>
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, marginBottom:20 }}>SAR Builder</div>
              <p style={{ ...LP_HEADING, fontSize:24, maxWidth:340, lineHeight:1.2, marginBottom:16 }}>Situation. Action. Result.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {["Build a SAR story","Sharpen your result","Name your contribution"].map((b,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", border:"1px solid rgba(138,158,132,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:8, color:T.gold }}>{i+1}</span>
                    </div>
                    <span style={{ fontFamily:T.sans, fontSize:12, color:"rgba(245,239,230,0.65)" }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        if (step === "Simulation") return (
          <div style={d10Dark}>
            <img src="/day1-simulation.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
            {d10Ol}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Performance Review</div>
              <p style={{ ...LP_HEADING, fontSize:26, maxWidth:340, lineHeight:1.2 }}>Communicate your impact. Make it land.</p>
            </div>
          </div>
        );
        return null;
      }

      // ── D3 — Eliminate Fillers left panel overrides ──────────────────────────
      if (isD3) {
        const d3Dark = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
        const d3Ol = <>
          <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.45)" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
        </>;
        if (step === "Insight") return (
          <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
            <img src="/day3-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"25%", background:"linear-gradient(to bottom, rgba(10,8,5,0.55) 0%, transparent 100%)", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", top:36, left:48, right:48, zIndex:2, animation:"fadeUp 0.7s ease both", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ ...LP_LABEL, color:T.gold, textShadow:"0 1px 4px rgba(0,0,0,0.5)" }}>The Problem</div>
              
            </div>
          </div>
        );
        if (step === "Theory") return (
          <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
            <img src="/day3-theory.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%" }}/>
            <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.35)" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.88) 0%, rgba(10,8,5,0.2) 45%, transparent 65%)" }}/>
            <div style={{ position:"absolute", bottom:40, left:48, zIndex:2, animation:"fadeUp 0.7s ease both", maxWidth:320 }}>
              <div style={{ ...LP_LABEL, fontSize:13, color:"#F5EFE6", marginBottom:8 }}>The Pause Principle</div>
              <p style={{ fontFamily:T.serif, fontSize:18, fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.35, margin:0 }}>The power of silence.</p>
            </div>
          </div>
        );
        if (step === "Example") return (
          <div style={d3Dark}>
            <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="clarity" height={900} day={3}/></div>
            {d3Ol}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Masters of the Pause</div>
              <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,32px)", maxWidth:380, lineHeight:1.2 }}>The best speakers use silence the way musicians use rests.</p>
            </div>
          </div>
        );
        if (step === "Practice") return (
          <div style={{ position:"relative", height:"100%", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
            <img src="/practice-bg.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
            <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.62)" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.98) 0%, transparent 60%)" }}/>
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, marginBottom:20 }}>Filler Elimination</div>
              <p style={{ ...LP_HEADING, fontSize:24, maxWidth:340, lineHeight:1.2, marginBottom:16 }}>Replace every filler with a pause.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {["Count Your Fillers","The 5-Second Pause","Replace with Breath","Slow Down"].map((b,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", border:"1px solid rgba(138,158,132,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:8, color:T.gold }}>{i+1}</span>
                    </div>
                    <span style={{ fontFamily:T.sans, fontSize:12, color:"rgba(245,239,230,0.65)" }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        if (step === "Simulation") return (
          <div style={d3Dark}>
            <img src="/day1-simulation.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
            {d3Ol}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>60-Second Challenge</div>
              <p style={{ ...LP_HEADING, fontSize:26, maxWidth:340, lineHeight:1.2 }}>Zero fillers. Full 60 seconds.</p>
            </div>
          </div>
        );
        return null;
      }

      // ── D1 — Speak Clearly left panel overrides ──────────────────────────────
      if (isD1) {
        const d1Dark = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
        const d1Overlay = <>
          <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.45)" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
        </>;
        if (step === "Insight") return (
          <div style={d1Dark}>
            <img src="/day1-insight.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}/>
            {d1Overlay}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.7s ease both" }}>
              <div style={{ ...LP_LABEL, marginBottom:16 }}>Day {lesson.day} · {lesson.tag}</div>
              <h2 style={{ ...LP_HEADING, fontSize:"clamp(20px,1.8vw,26px)", marginBottom:18, letterSpacing:"-0.3px" }}>{lesson.title}</h2>
              <p style={{ fontFamily:T.sans, fontSize:14, fontWeight:400, color:"rgba(245,239,230,0.55)", lineHeight:1.6, margin:0, fontStyle:"italic", maxWidth:360 }}>{lesson.quote}</p>
            </div>
          </div>
        );
        if (step === "Theory") return (
          <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
            <img src="/feynman-technique.jpg" alt="The Feynman Technique" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:T.imgObjectPosition||"center 20%" }}/>
            <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.22)" }}/>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"25%", background:"linear-gradient(to bottom, rgba(10,8,5,0.55) 0%, transparent 100%)" }}/>
            <div style={{ position:"absolute", top:36, left:48, zIndex:2, animation:"fadeUp 0.7s ease both" }}>
              <div style={{ ...LP_LABEL, fontSize:13, color:"#F5EFE6", textShadow:"0 1px 6px rgba(0,0,0,0.5)" }}>The Science</div>
            </div>
          </div>
        );
        if (step === "Example") return (
          <div style={d1Dark}>
            <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="clarity" height={900} day={1}/></div>
            {d1Overlay}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Clarity in the Wild</div>
              <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,32px)", maxWidth:380, lineHeight:1.2 }}>The clearest voices don't use more words. They use better ones.</p>
            </div>
          </div>
        );
        if (step === "Practice") return (
          <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
            <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>THE CLARITY CHALLENGE™</div>
              <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Can you make this simpler?</p>
              <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
              <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>5 rounds. Increasing difficulty. Earn your badge.</p>
            </div>
          </div>
        );
        if (step === "Simulation") return (
          <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
            <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>RECORD &amp; REVIEW™</div>
              <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>The fastest way to improve is to hear yourself the way others do.</p>
              <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
              <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Speak naturally. Get scored. Improve in real time.</p>
            </div>
          </div>
        );
        return null;
      }

      // ── NT Module (Day 8) — Narrative Transportation overrides ──────────────
      if (isNT) {
        const darkBase = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
        if (step === "Insight") return (
          <div style={{ height:"100%", position:"relative", overflow:"hidden" }}>
            <img src="/nt-insight.jpg" alt="Narrative Transportation" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}/>
            <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.38)" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.82) 0%, rgba(10,8,5,0.15) 55%, transparent 80%)" }}/>
            <div style={{ position:"absolute", bottom:40, left:48, right:48, zIndex:2, animation:"fadeUp 0.7s ease both" }}>
              <div style={{ marginBottom:16 }}>
                <div style={{ ...LP_LABEL, color:T.gold }}>The Foundation</div>
                
              </div>
              <p style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.3, margin:0, maxWidth:300 }}>Turning Stories<br/>Into Impact</p>
            </div>
          </div>
        );
        if (step === "Theory 1") return (
          <div style={{ height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"center" }}>
            {/* Blurred bg fill */}
            <img src="/dual-coding-theory.jpg" alt="" style={{ position:"absolute", inset:"-20px", width:"calc(100% + 40px)", height:"calc(100% + 40px)", objectFit:"cover", filter:"blur(18px) brightness(0.6)", pointerEvents:"none" }}/>
            {/* Sharp image — scaled up to reduce blurred border */}
            <img src="/dual-coding-theory.jpg" alt="Dual Coding Theory" style={{ position:"relative", zIndex:1, width:"140%", marginLeft:"-20%", height:"auto", display:"block" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.55) 0%, transparent 40%)", zIndex:2 }}/>
            <div style={{ position:"absolute", bottom:40, left:48, right:48, zIndex:3, animation:"fadeUp 0.7s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:8 }}>Green &amp; Brock, 2000</div>
              <p style={{ fontFamily:T.serif, fontSize:20, fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.35, margin:0, maxWidth:320 }}>Words and images together. That's how stories are remembered.</p>
            </div>
          </div>
        );
        if (step === "Theory 2") return (
          <>
            {imgZoom && (
              <div onClick={()=>setImgZoom(false)} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(10,8,5,0.92)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out",backdropFilter:"blur(4px)"}}>
                <img src="/nt-6beat-framework.jpg" alt="The 6-Beat Story Framework" style={{maxWidth:"92vw",maxHeight:"92vh",objectFit:"contain",borderRadius:4,boxShadow:"0 24px 80px rgba(0,0,0,0.5)"}}/>
                <div style={{position:"absolute",top:24,right:28,color:"rgba(255,255,255,0.5)",fontSize:28,lineHeight:1}}>×</div>
              </div>
            )}
            <div onClick={()=>setImgZoom(true)} style={{ height:"100%", position:"relative", overflow:"hidden", cursor:"zoom-in", background:"#E8E2D8", display:"flex", flexDirection:"column", justifyContent:"center" }}>
              {/* Blurred bg fill — hides any gap above/below */}
              <img src="/nt-6beat-framework.jpg" alt="" style={{ position:"absolute", inset:"-20px", width:"calc(100% + 40px)", height:"calc(100% + 40px)", objectFit:"cover", filter:"blur(18px) brightness(0.55)", pointerEvents:"none" }}/>
              {/* Sharp full-width image */}
              <img src="/nt-6beat-framework.jpg" alt="The 6-Beat Story Framework" style={{ position:"relative", zIndex:1, width:"100%", height:"auto", display:"block" }}/>
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.65) 0%, transparent 40%)", zIndex:2 }}/>
              <div style={{ position:"absolute", top:20, right:20, zIndex:3, background:"rgba(10,8,5,0.45)", backdropFilter:"blur(4px)", borderRadius:4, padding:"6px 10px", display:"flex", alignItems:"center", gap:6 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/><path d="M9.5 9.5l2.5 2.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/><path d="M4.5 6h3M6 4.5v3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontFamily:T.sans,fontWeight:500}}>Click to enlarge</span>
              </div>
              <div style={{ position:"absolute", bottom:32, left:48, zIndex:3, animation:"fadeUp 0.7s ease both", maxWidth:320 }}>
                <div style={{ ...LP_LABEL, fontSize:13, color:"#F5EFE6", marginBottom:8 }}>The Framework</div>
                <p style={{ fontFamily:T.serif, fontSize:18, fontWeight:600, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.35, margin:0 }}>Every great story follows a learnable pattern.</p>
              </div>
            </div>
          </>
        );
        if (step === "Example") return (
          <div style={{ background:"#0E0B08", height:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(183,154,107,0.06) 0%, transparent 60%)" }}/>
            <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Storytelling in the Wild</div>
              <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,34px)", maxWidth:380, marginBottom:28, lineHeight:1.2 }}>Stories create empathy. Empathy creates trust. Trust creates influence.</p>
              <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
              <p style={{ ...LP_BODY, fontSize:15, maxWidth:340 }}>The same facts — told as a story — land 22× more powerfully in the human brain.</p>
            </div>
          </div>
        );
        if (step === "Practice") return (
          <div style={{ position:"relative", height:"100%", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
            <img src="/practice-bg.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
            <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.62)" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.98) 0%, transparent 60%)" }}/>
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, marginBottom:20 }}>Build Your Story</div>
              <p style={{ ...LP_HEADING, fontSize:26, maxWidth:340, lineHeight:1.2, marginBottom:20 }}>Use the framework. Make it yours.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {["Hook — start with tension","Character — make it human","Problem — raise the stakes","Turning Point — what changed?","Resolution — what happened?","Meaning — why it matters"].map((b,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", border:"1px solid rgba(183,154,107,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:8, color:T.gold }}>{i+1}</span>
                    </div>
                    <span style={{ fontFamily:T.sans, fontSize:12, color:"rgba(245,239,230,0.65)" }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        if (step === "Simulation") return (
          <div style={darkBase}>
            <img src="/day1-simulation.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
            <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.58)" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, marginBottom:20 }}>Your Rehearsal</div>
              <p style={{ ...LP_HEADING, fontSize:28, maxWidth:360, lineHeight:1.2 }}>Now tell it out loud.</p>
            </div>
          </div>
        );
        return null; // Review handled by 3-col layout
      }

      // ── Day 9 LeftPanel ──────────────────────────────────────────────────────
      if (isD9) {
        const d9Dark = { height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" };
        const d9Overlay = <>
          <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.62)" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
        </>;
        const d9Label = (txt) => <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>{txt}</div>;
        if (step === "Insight") return (
          <div style={d9Dark}>
            <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="voice" height={900} day={lesson.day}/></div>
            {d9Overlay}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.7s ease both" }}>
              <div style={{ marginBottom:16 }}>
                {d9Label("The Performance")}
                
              </div>
              <p style={{ ...LP_HEADING, fontSize:"clamp(26px,2.3vw,38px)", maxWidth:360, marginBottom:20 }}>You've built a great story. Now learn how the world's best speakers deliver it.</p>
              <div style={{ width:32, height:1, background:T.gold, opacity:0.45 }}/>
            </div>
          </div>
        );
        if (step === "Theory") return (
          <div style={{ background:"#131009", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"40px 36px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-60, left:-60, width:360, height:360, background:"radial-gradient(ellipse, rgba(183,154,107,0.07) 0%, transparent 60%)", pointerEvents:"none" }}/>
            <div style={{ ...LP_LABEL, fontSize:13, color:"#F5EFE6", marginBottom:24, alignSelf:"flex-start", animation:"fadeDown 0.6s ease both" }}>The 5 Elements</div>
            <div style={{ animation:"fadeIn 0.8s ease 0.1s both", opacity:0 }}><D_D9/></div>
            <p style={{ fontFamily:T.serif, fontSize:16, fontStyle:"italic", color:"rgba(245,239,230,0.5)", marginTop:24, textAlign:"center" }}>Pace · Pause · Presence · Projection · Precision</p>
          </div>
        );
        if (step === "Example") return (
          <div style={d9Dark}>
            <div className="au-hero-scene" style={{ position:"absolute", inset:0 }}><Scene name="voice" height={900} day={lesson.day}/></div>
            {d9Overlay}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              {d9Label("Delivery Masters")}
              <p style={{ ...LP_HEADING, fontSize:"clamp(22px,2vw,32px)", maxWidth:380, lineHeight:1.2 }}>The best speakers in the world share one thing: they make you feel, not just hear.</p>
            </div>
          </div>
        );
        if (step === "Practice") return (
          <div style={{ position:"relative", height:"100%", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
            <img src="/practice-bg.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
            <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.62)" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.98) 0%, transparent 60%)" }}/>
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              {d9Label("Delivery Preparation")}
              <p style={{ ...LP_HEADING, fontSize:26, maxWidth:340, lineHeight:1.2, marginBottom:20 }}>Take your story and prepare it for performance.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {D9_REFINEMENTS.map((r,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:12 }}>{r.icon}</span>
                    <span style={{ fontFamily:T.sans, fontSize:11, color:"rgba(245,239,230,0.55)" }}>{r.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        if (step === "Simulation") return (
          <div style={d9Dark}>
            <img src="/day1-simulation.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 40%" }}/>
            {d9Overlay}
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              {d9Label("Your Performance")}
              <p style={{ ...LP_HEADING, fontSize:28, maxWidth:360, lineHeight:1.2 }}>Now perform it. This is where confidence is built.</p>
            </div>
          </div>
        );
        return null;
      }

      // ── Insight — cinematic scene hero ──────────────────────────────────────
      if (step === "Insight") return (
        <div style={{ position: "relative", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          {lesson.day === 1 ? (
            <img src="/day1-lounge.jpg" alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
            />
          ) : isD2 ? (
            <img src="/d2-insight.jpg" alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
          ) : isD5 ? (
            <img src="/d5-insight.jpg" alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
          ) : isD6 ? (
            <img src="/d6-insight.jpg" alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
            />
          ) : isD11 ? (
            <img src="/d11-insight.jpg" alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
            />
          ) : (
            <div className="au-hero-scene" style={{ position: "absolute", inset: 0 }}>
              <Scene name={lesson.scene} height={900} day={lesson.day}/>
            </div>
          )}
          {/* Day 1: 50% veil so the terracotta and interior warmth show through */}
          <div style={{ position: "absolute", inset: 0, background: lesson.day === 1 ? "rgba(10,8,5,0.50)" : "rgba(10,8,5,0.5)" }}/>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.5) 40%, transparent 75%)" }}/>
          <div style={{ position: "relative", zIndex: 2, padding: "40px 48px", animation: "fadeUp 0.7s ease both" }}>
            <div style={{ ...LP_LABEL, marginBottom: 16 }}>Day {lesson.day} · {lesson.tag}</div>
            <h2 style={{ ...LP_HEADING, fontSize: "clamp(20px,1.8vw,26px)", marginBottom: 18, letterSpacing: "-0.3px" }}>{lesson.title}</h2>
            <p style={{ fontFamily:T.sans, fontSize:14, fontWeight:400, color:"rgba(245,239,230,0.55)", lineHeight:1.6, margin:0, fontStyle:"italic", maxWidth:360 }}>{lesson.quote}</p>
          </div>
        </div>
      );

      // ── Theory — photo if available, otherwise diagram ───────────────────────
      if (step === "Theory") {
        const Diagram = DIAGRAMS[lesson.day - 1];
        const theoryImg = THEORY_IMAGES[lesson.theoryImageDay || lesson.day];
        // Day 5: full-width contain with blurred bg so landscape image shows completely
        if (isD5 && theoryImg && theoryImg.image) {
          return (
            <div style={{ height:"100%", position:"relative", overflow:"hidden", background:"#1A1510", display:"flex", flexDirection:"column", justifyContent:"center" }}>
              <img src={theoryImg.image} alt="" style={{ position:"absolute", inset:"-20px", width:"calc(100% + 40px)", height:"calc(100% + 40px)", objectFit:"cover", filter:"blur(18px) brightness(0.45)", pointerEvents:"none" }}/>
              <img src={theoryImg.image} alt={theoryImg.alt||""} style={{ position:"relative", zIndex:1, width:"140%", marginLeft:"-20%", height:"auto", display:"block" }}/>
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.55) 0%, transparent 40%)", zIndex:2 }}/>
              <div style={{ position:"absolute", top:32, left:24, zIndex:3, animation:"fadeUp 0.7s ease both" }}>
                <div style={{ ...LP_LABEL, fontSize:13, color:"#F5EFE6", textShadow:"0 1px 6px rgba(0,0,0,0.6)" }}>The Science</div>
              </div>
            </div>
          );
        }
        if (theoryImg && theoryImg.image) {
          const useContain = theoryImg.imgObjectFit === "contain";
          return (
            <div style={{ height: "100%", position: "relative", overflow: "hidden", background: useContain ? "#0E0B08" : "transparent" }}>
              <img src={theoryImg.image} alt={theoryImg.alt || ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: useContain ? "contain" : "cover", objectPosition: theoryImg.imgObjectPosition || "center" }}/>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "28%", background: "linear-gradient(to bottom, rgba(10,8,5,0.55) 0%, transparent 100%)" }}/>
              <div style={{ position: "absolute", top: 32, left: 24, zIndex: 2, animation: "fadeUp 0.7s ease both" }}>
                <div style={{ ...LP_LABEL, fontSize: 13, color: "#F5EFE6", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>The Science</div>
              </div>
            </div>
          );
        }
        return (
          <div style={{ background: "#131009", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -80, left: -80, width: 400, height: 400, background: "radial-gradient(ellipse, rgba(138,158,132,0.1) 0%, transparent 60%)", pointerEvents: "none" }}/>
            <div style={{ ...LP_LABEL, fontSize: 13, color: "#F5EFE6", marginBottom: 28, alignSelf: "flex-start", animation: "fadeDown 0.6s ease both" }}>The Science</div>
            <div style={{ transform: "scale(1.4)", transformOrigin: "top center", animation: "fadeIn 0.8s ease 0.1s both", opacity: 0 }}>
              {Diagram ? <Diagram/> : null}
            </div>
          </div>
        );
      }

      // ── Example — D2/D5 get cinematic text panels; others get before/after ──────
      if (step === "Example") {
        if (isD2) return (
          <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
            <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Voice in Action</div>
              <p style={{ fontFamily:T.serif, fontSize:"clamp(22px,2vw,32px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Range creates engagement. Contrast creates emotion.</p>
              <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
              <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.5)", lineHeight:1.65 }}>The most compelling voices are the most controlled — and the most dynamic.</p>
            </div>
          </div>
        );
        if (isD5) return (
          <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
            <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>PRE in Action</div>
              <p style={{ fontFamily:T.serif, fontSize:"clamp(22px,2vw,32px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Point. Reason. Example. The architecture of every great professional answer.</p>
              <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
              <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.5)", lineHeight:1.65 }}>The world's most effective communicators all follow the same structure — whether they name it or not.</p>
            </div>
          </div>
        );
        if (isD6) return (
          <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
            <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Masters Under Pressure</div>
              <p style={{ fontFamily:T.serif, fontSize:"clamp(22px,2vw,32px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Composure is a skill. The calmest person in the room shapes the room.</p>
              <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
              <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.5)", lineHeight:1.65 }}>How elite communicators handle the conversations most people avoid.</p>
            </div>
          </div>
        );
        if (isD11) return (
          <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative" }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 40% 30%, rgba(138,158,132,0.05) 0%, transparent 60%)", pointerEvents:"none" }}/>
            <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Iconic Brands</div>
              <p style={{ fontFamily:T.serif, fontSize:"clamp(22px,2vw,32px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Brand isn't what you say about yourself. It's what others say when you're not there.</p>
              <div style={{ width:40, height:1.5, background:T.gold, opacity:0.5, marginBottom:20 }}/>
              <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.5)", lineHeight:1.65 }}>Three people whose personal brands became cultural forces — by design, not accident.</p>
            </div>
          </div>
        );
        return (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#131009" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)", animation: "fadeIn 0.5s ease both" }}>
              <div style={{ ...LP_LABEL, color: "rgba(196,122,122,0.85)", marginBottom: 16 }}>Before</div>
              <p style={{ fontFamily: T.serif, fontSize: 20, fontStyle: "italic", color: "rgba(245,239,230,0.45)", lineHeight: 1.55, letterSpacing: "-0.2px" }}>"{lesson.bad}"</p>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 48px", background: "rgba(138,158,132,0.04)", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + T.gold + " 0%, rgba(138,158,132,0.1) 100%)" }}/>
              <div style={{ ...LP_LABEL, marginBottom: 16 }}>After</div>
              <p style={{ fontFamily: T.serif, fontSize: 22, fontStyle: "italic", color: CREAM, lineHeight: 1.5, letterSpacing: "-0.3px" }}>"{lesson.good}"</p>
            </div>
          </div>
        );
      }

      // ── Practice — practice-bg.jpg provides the atmosphere from the outer wrapper
      if (step === "Practice") {
        if (isD2) return (
          <div style={{ height:"100%", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
            <img src="/d2-practice.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}/>
            <div style={{ position:"absolute", inset:0, background:"rgba(10,8,5,0.55)" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,8,5,0.92) 0%, transparent 55%)" }}/>
            <div style={{ position:"relative", zIndex:2, padding:"40px 48px", animation:"fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, color:T.gold, marginBottom:16 }}>Train Your Instrument</div>
              <p style={{ ...LP_HEADING, fontSize:28, maxWidth:360, lineHeight:1.2 }}>Four exercises. One goal: deliberate vocal control.</p>
            </div>
          </div>
        );
        return (
          <div style={{ position: "relative", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,5,0.65)" }}/>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,8,5,0.98) 0%, transparent 60%)" }}/>
            <div style={{ position: "relative", zIndex: 2, padding: "40px 48px", animation: "fadeUp 0.6s ease both" }}>
              <div style={{ ...LP_LABEL, marginBottom: 20 }}>Your Practice</div>
              <p style={{ ...LP_HEADING, fontSize: 28, maxWidth: 380, lineHeight: 1.2 }}>{lesson.practice.split('.')[0]}.</p>
            </div>
          </div>
        );
      }

      // ── Simulation — D2 gets cinematic panel; others get scenario ───────────────
      if (step === "Simulation" && isD2) return (
        <div style={{ background:"#0E0B08", height:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(200,180,140,1)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:20, fontFamily:T.sans }}>Real-World Voice Coaching</div>
            <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>This is where voice training becomes real.</p>
            <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
            <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.7)", lineHeight:1.65 }}>Choose your scenario. Speak. Get coached on pace, pauses, clarity, and presence.</p>
          </div>
        </div>
      );

      if (step === "Simulation" && isD6) return (
        <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
            <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>High-Stakes — In Action</div>
            <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Stay composed. Stay clear. Stay in control.</p>
            <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
            <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Choose your scenario. Write your response. Your coach evaluates composure, clarity, and executive presence.</p>
          </div>
        </div>
      );

      if (step === "Simulation" && isD11) return (
        <div style={{ height:"100%", background:"#0E0B08", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%, rgba(138,158,132,0.06) 0%, transparent 60%)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.6s ease both" }}>
            <div style={{ ...LP_LABEL, color:T.gold, marginBottom:20 }}>Brand — In Action</div>
            <p style={{ fontFamily:T.serif, fontSize:"clamp(24px,2vw,36px)", fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:24, maxWidth:360 }}>Your brand is built in every room you enter. Shape it.</p>
            <div style={{ width:48, height:1.5, background:"rgba(200,180,140,0.5)", marginBottom:20 }}/>
            <p style={{ fontFamily:T.sans, fontSize:14, color:"rgba(245,239,230,0.55)", lineHeight:1.65 }}>Four scenarios where your brand is built or broken. Write your response. Get coached on clarity, authenticity, and memorability.</p>
          </div>
        </div>
      );

      if (step === "Simulation") return (
        <div style={{ background: "#131009", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "40px 48px", position: "relative", overflow: "hidden" }}>
          {/* Day 1: photo background */}
          {lesson.day === 1 && (
            <>
              <img src="/day1-simulation.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}/>
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,5,0.58)" }}/>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.2) 55%, transparent 80%)" }}/>
            </>
          )}
          {lesson.day !== 1 && <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, background: "radial-gradient(ellipse, rgba(138,158,132,0.08) 0%, transparent 65%)" }}/>}
          <div style={{ animation: "fadeUp 0.6s ease both", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ ...LP_LABEL }}>Your Scenario</div>
              <div style={{ display: "flex", gap: 5, marginLeft: "auto" }}>
                {scenarios.map((_, i) => (
                  <button key={i} onClick={() => setSelSc(i)} style={{
                    width: 26, height: 26, borderRadius: "50%",
                    border: "1px solid " + (selSc === i ? T.gold : "rgba(255,255,255,0.15)"),
                    background: selSc === i ? "rgba(138,158,132,0.15)" : "transparent",
                    color: selSc === i ? T.gold : "rgba(255,255,255,0.3)",
                    fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: T.sans,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</button>
                ))}
              </div>
            </div>
            <p style={{ ...LP_HEADING, fontSize: 26, fontWeight: 600, marginBottom: 24, maxWidth: 380 }}>{activeSc}</p>
            {activeRole && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", background: "rgba(138,158,132,0.08)", borderRadius: 4, border: "1px solid rgba(138,158,132,0.2)" }}>
                <span style={{ fontSize: 12 }}>{activeRole.icon}</span>
                <span style={{ fontSize: 10, color: "rgba(245,239,230,0.45)", fontFamily: T.sans }}>{activeRole.label}</span>
              </div>
            )}
          </div>
        </div>
      );

      // ── Review — the close of the session ───────────────────────────────────
      if (step === "Review") return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "40px 48px", background: "linear-gradient(160deg, #1A1713 0%, #131009 100%)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 70%, rgba(138,158,132,0.12) 0%, transparent 55%)", pointerEvents: "none" }}/>
          <div style={{ position: "relative", zIndex: 2, animation: "fadeUp 0.6s ease both" }}>
            <div style={{ ...LP_LABEL, marginBottom: 20 }}>Your Promise</div>
            <p style={{ ...LP_HEADING, fontSize: 26, fontWeight: 600, fontStyle: "italic", lineHeight: 1.4, marginBottom: 28, maxWidth: 380 }}>{lesson.promise}</p>
            {isDone && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(82,112,96,0.25)", borderRadius: 4, border: "1px solid rgba(82,112,96,0.4)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={T.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 11, color: T.green, fontFamily: T.sans, fontWeight: 500, letterSpacing: "0.05em" }}>Session Complete</span>
              </div>
            )}
          </div>
        </div>
      );

      return null;
    };

    // ── Expandable example card — shared across all Example tabs ─────────────
    const ExCard = ({name, preview, full}) => {
      const [open, setOpen] = useState(false);
      return (
        <div onClick={()=>setOpen(o=>!o)} style={{padding:"28px 24px",borderRadius:8,background:open?"rgba(237,232,223,0.92)":"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",cursor:"pointer",transition:"all 0.25s ease",userSelect:"none"}}
          onMouseEnter={e=>{if(!open){e.currentTarget.style.background="rgba(237,232,223,0.85)";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(44,36,22,0.08)";}}}
          onMouseLeave={e=>{if(!open){e.currentTarget.style.background="rgba(237,232,223,0.6)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3}}>{name}</div>
            <span style={{fontFamily:T.sans,fontSize:13,color:T2.text3,marginLeft:12,flexShrink:0,marginTop:4}}>{open?"▴":"▸"}</span>
          </div>
          <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0,fontWeight:400,whiteSpace:"pre-wrap"}}>{open ? full : preview}</p>
        </div>
      );
    };

    // ── D10 RightContent — Day 10: Performance ────────────────────────────────
    const D10RightContent = () => {
      const [d10Card, setD10Card] = useState(null);
      const [sarS, setSarS] = useState(""); const [sarA, setSarA] = useState(""); const [sarR, setSarR] = useState("");
      const [sarResult, setSarResult] = useState(""); const [sarLoading, setSarLoading] = useState(false);
      const [simInput, setSimInput] = useState("");
      const openCard = D10_EXAMPLES_DATA.find(c=>c.id===d10Card);

      async function buildSAR() {
        if (!sarS.trim()||!sarA.trim()||!sarR.trim()) return; setSarLoading(true);
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:`Sharpen this SAR story into 2-3 crisp sentences that communicate impact. Make the result specific and memorable. Return ONLY the sharpened story:\n\nSituation: ${sarS}\nAction: ${sarA}\nResult: ${sarR}`}]})});
          const d = await res.json(); setSarResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setSarResult("Try again — keep the result specific and measurable."); }
        setSarLoading(false);
      }

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Why Performance Communication Matters</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:32}}>Brilliant work in silence is still silence. Here's what the research shows about communicating what you deliver.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:28}}>
            {D10_FACTS.map((n,i)=>(
              <div key={i} style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:10}}>{n.word}</div>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{n.body}</p>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.sans,fontSize:16,fontStyle:"italic",color:T.gold,lineHeight:1.7,fontWeight:400}}>Performance alone accounts for 10% of career advancement. Communication accounts for the rest.</p>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>The Framework</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>The SAR Framework</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Every performance statement needs three things: context, contribution, and consequence. SAR gives you the structure.</p>
          <div style={{display:"flex",flexDirection:"column",gap:0,marginBottom:24}}>
            {[
              {n:"S",label:"Situation",q:"Set the context briefly. What was the challenge, the stakes, or the starting point?",ex:"We had a critical delivery deadline with a reduced team after two departures."},
              {n:"A",label:"Action",   q:"What did YOU specifically do? Use 'I' — not 'we.' Your contribution, not the team's.",ex:"I restructured the workstreams, personally led the client relationship, and worked with stakeholders to reset expectations."},
              {n:"R",label:"Result",   q:"What was the measurable outcome? Be specific. Numbers beat adjectives.",ex:"We delivered on time. Client satisfaction scores increased by 22%. The account renewed at a higher value."},
            ].map((b,i,arr)=>(
              <div key={i} style={{padding:"18px 20px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,borderBottom:i<arr.length-1?"none":"0.5px solid "+T2.border,borderLeft:"2px solid "+T.gold,marginBottom:i<arr.length-1?2:0}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:6}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:"white"}}>{b.n}</span>
                  </div>
                  <div>
                    <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T2.text,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>{b.label}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:0}}>{b.q}</p>
                  </div>
                </div>
                <div style={{marginLeft:36,padding:"10px 14px",background:T2.bg,borderRadius:3}}>
                  <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text2,lineHeight:1.55,margin:0}}>{b.ex}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:20}}>
            <div style={{fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10,fontFamily:T.sans}}>The Golden Rule</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{padding:"14px 16px",background:"rgba(139,74,56,0.05)",borderRadius:4,borderLeft:"2px solid rgba(139,74,56,0.3)"}}>
                <div style={{fontFamily:T.sans,fontSize:10,color:"#B05C4A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Don't say</div>
                <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>"I've been working really hard on this."</p>
              </div>
              <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                <div style={{fontFamily:T.sans,fontSize:10,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Do say</div>
                <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>"I delivered the new process two weeks early. The result: 40% reduction in drop-off."</p>
              </div>
            </div>
          </div>
        </div>
      );

      if (step === "Example") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,letterSpacing:"-0.5px",marginBottom:10,lineHeight:1.1}}>Performance in the Wild</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:T2.text2,fontWeight:300,lineHeight:1.6,marginBottom:36}}>How world-class communicators make their performance visible.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <ExCard name="Warren Buffett" preview="Buffett explains decades of complex investment decisions in language anyone can understand." full="Berkshire's results — explained so anyone can understand. He translates decades of complex investment decisions into language any intelligent person can understand. No jargon. No obfuscation. Just clarity."/>
            <ExCard name="Satya Nadella" preview="Nadella told a story about culture that transformed Microsoft." full={"He didn't announce a turnaround plan. He told a story about culture: \"We need to go from a know-it-all company to a learn-it-all company.\" The performance followed. Culture change communicated through a single, memorable sentence."}/>
            <ExCard name="Sheryl Sandberg" preview="Sandberg removed the assumption that good work speaks for itself." full={"She removed the assumption that good work speaks for itself. It doesn't. The person who communicates their contribution clearly gets the credit they deserve. Visibility is a skill — and she made it central to her leadership."}/>
            <ExCard name="Steve Jobs" preview="Jobs didn't present features — he framed products as transformation." full={"He didn't present features. He framed it as transformation: \"Every once in a while, a revolutionary product comes along that changes everything.\" Not what it does — what it means. Every launch was a story, not a specification."}/>
          </div>
        </div>
      );

      if (step === "Practice") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Build Your SAR Story</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:T2.text3,lineHeight:1.6,marginBottom:32,fontWeight:300}}>Answer three questions. The AI sharpens your performance statement.</p>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
            {[
              {label:"Situation",val:sarS,set:setSarS,ph:"What was the challenge, the stakes, or the context?"},
              {label:"Action",   val:sarA,set:setSarA,ph:"What did YOU specifically do? Use 'I' not 'we.'"},
              {label:"Result",   val:sarR,set:setSarR,ph:"What was the measurable outcome? Be specific."},
            ].map(({label,val,set,ph},i)=>(
              <div key={i}>
                <div style={{fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6,fontFamily:T.sans}}>{label}</div>
                <textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} className="au-input" style={{height:64,resize:"none",fontSize:14}}/>
              </div>
            ))}
          </div>
          <button onClick={buildSAR} disabled={sarLoading||!sarS.trim()||!sarA.trim()||!sarR.trim()} style={{padding:"11px 24px",borderRadius:3,border:"none",background:sarLoading||!sarS.trim()||!sarA.trim()||!sarR.trim()?T2.border:T.ink,color:sarLoading||!sarS.trim()||!sarA.trim()||!sarR.trim()?T2.text3:T.bg,fontSize:13,fontWeight:600,cursor:sarLoading||!sarS.trim()||!sarA.trim()||!sarR.trim()?"not-allowed":"pointer",fontFamily:T.sans,marginBottom:16}}>
            {sarLoading?"Sharpening…":"Sharpen My SAR →"}
          </button>
          {sarResult && (
            <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,marginBottom:28}}>
              <div style={{fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8,fontFamily:T.sans}}>Your performance statement</div>
              <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.7,margin:0}}>{sarResult}</p>
            </div>
          )}
          <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:24}}>
            <div style={{fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"2px",marginBottom:14,fontFamily:T.sans}}>Rules for Performance Communication</div>
            {["Use 'I' not 'we' — own your contribution.","Lead with the result, then explain how you got there.","Numbers beat adjectives. '40%' beats 'significant.'","Connect your contribution to what the business cares about.","Say it out loud — if it sounds weak, it is weak. Refine.","If you can't say it in two sentences, it isn't sharp enough."].map((tip,i,arr)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 0",borderBottom:i<arr.length-1?"0.5px solid "+T2.divider:"none"}}>
                <div style={{width:16,height:16,borderRadius:3,background:"rgba(138,158,132,0.15)",border:"0.5px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke={T.gold} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.5,fontWeight:300}}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>AI Practice</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Communicate Your Impact — 60 Seconds</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.7,fontWeight:300,marginBottom:28}}>Choose a scenario. Communicate your contribution clearly. The AI scores your impact statement.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:28}}>
            {[
              {n:1,title:"Performance review — your top 3 contributions",sub:"Make each one specific. Lead with results."},
              {n:2,title:"Update a senior sponsor on your work",sub:"They have 60 seconds. Make it count."},
              {n:3,title:"Explain your team's impact to a new stakeholder",sub:"Context, contribution, consequence."},
              {n:4,title:"Make the case for your next opportunity",sub:"Connect your track record to what comes next."},
            ].map((sc,i)=>(
              <button key={i} onClick={()=>setSimInput(sc.title+": ")} style={{padding:"14px 18px",borderRadius:4,border:"0.5px solid "+T2.border,background:T2.surface,textAlign:"left",cursor:"pointer",transition:"all 0.18s ease"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(247,243,236,0.95)";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(44,36,22,0.1)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.8)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 1px 4px rgba(44,36,22,0.06)";}}>
                <div style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text,marginBottom:3}}>{sc.n}. {sc.title}</div>
                <div style={{fontFamily:T.sans,fontSize:12,color:T2.text3}}>{sc.sub}</div>
              </button>
            ))}
          </div>
          <textarea value={simInput} onChange={e=>setSimInput(e.target.value)} placeholder="Write your performance statement here…" className="au-input" style={{height:120,marginBottom:14,resize:"none"}}/>
          <D10SimFeedback input={simInput}/>
        </div>
      );

      return null;
    };

    // ── D3 RightContent — Day 3: Eliminate Fillers ────────────────────────────
    const D3RightContent = () => {
      const [d3Card, setD3Card] = useState(null);
      const [simInput, setSimInput] = useState("");
      const [fillerInput, setFillerInput] = useState(""); const [fillerResult, setFillerResult] = useState(null); const [fillerLoading, setFillerLoading] = useState(false);
      const [pauseSecs, setPauseSecs] = useState(5); const [pauseActive, setPauseActive] = useState(false); const [pauseDone, setPauseDone] = useState(false);
      const [paceInput, setPaceInput] = useState(""); const [paceResult, setPaceResult] = useState(null); const [paceLoading, setPaceLoading] = useState(false);
      const openCard = D3_EXAMPLES_DATA.find(c=>c.id===d3Card);

      useEffect(()=>{
        if (!pauseActive) return;
        if (pauseSecs <= 0) { setPauseActive(false); setPauseDone(true); return; }
        const t = setTimeout(()=>setPauseSecs(s=>s-1), 1000);
        return ()=>clearTimeout(t);
      }, [pauseActive, pauseSecs]);

      async function detectFillers() {
        if (!fillerInput.trim()) return; setFillerLoading(true);
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:350,messages:[{role:"user",content:`Count and identify filler words (um, uh, like, you know, sort of, basically, literally, actually, right, okay) in this text. Then rewrite it without fillers, replacing them with pauses or removing them. Format: "Found X fillers: [list]\\n\\nFiller-free version: [rewritten text]"\n\n"${fillerInput}"`}]})});
          const d = await res.json(); setFillerResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setFillerResult("Tip: Count every 'um', 'uh', 'like', 'you know'. Goal: under 3 per minute."); }
        setFillerLoading(false);
      }

      async function checkPace() {
        if (!paceInput.trim()) return; setPaceLoading(true);
        const words = paceInput.trim().split(/\s+/).filter(Boolean).length;
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:250,messages:[{role:"user",content:`Rewrite this as if spoken 20% slower — add natural pause markers [...] and break long sentences. Keep the same meaning. Return ONLY the rewritten version:\n\n"${paceInput}"`}]})});
          const d = await res.json(); setPaceResult({words,slow:(d.content||[]).map(b=>b.text||"").join("").trim()});
        } catch { setPaceResult({words,slow:null}); }
        setPaceLoading(false);
      }

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Master Filler-Free Speech</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:32,maxWidth:700}}>Most people are far stronger speakers than they realise. Fillers are simply a learnable habit — and removing them is one of the fastest ways to elevate your credibility, authority, and influence.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:28}}>
            {D3_FACTS.map((n,i)=>(
              <div key={i} style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:10}}>{n.word}</div>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{n.body}</p>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.sans,fontSize:16,fontStyle:"italic",color:T.gold,lineHeight:1.7,fontWeight:400}}>The pause is not empty. It's where confidence lives.</p>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>The Pause Principle</h2>
          <div style={{padding:"20px 24px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,marginBottom:24}}>
            <p style={{fontFamily:T.serif,fontSize:24,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>Silence sounds confident. Fillers sound uncertain.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
            {[
              {label:"Fear of Silence",   body:"You think pauses make you look unprepared. Reality: pauses make you look thoughtful."},
              {label:"Rushing",           body:"You speak faster than you think. Your mouth outruns your brain."},
              {label:"Lack of Structure", body:"You don't know where you're going. Fillers buy you time to figure it out."},
              {label:"The Fix",           body:"Replace fillers with pauses. Breathe. Think. Then speak."},
            ].map((p,i)=>(
              <div key={i} style={{padding:"16px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>{p.label}</div>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{p.body}</p>
              </div>
            ))}
          </div>
          <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:20}}>
            <div style={{fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>See It In Action</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px 18px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                <p style={{fontFamily:T.sans,fontSize:16,fontStyle:"italic",color:T.gold,lineHeight:1.7,fontWeight:400,margin:0}}>A 2-second pause feels like 10 seconds to you. To your audience? Natural. Powerful. Intentional.</p>
              </div>
              <div style={{padding:"16px 18px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                <p style={{fontFamily:T.sans,fontSize:16,fontStyle:"italic",color:T.gold,lineHeight:1.7,fontWeight:400,margin:0}}>When you feel the urge to say "um," pause instead. The pause is not your enemy. It's your tool.</p>
              </div>
            </div>
          </div>
        </div>
      );

      if (step === "Example") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Masters of the Pause</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <ExCard name="Morgan Freeman" preview="Freeman speaks with measured, deliberate speech and zero fillers."
              full={"Listen to Morgan Freeman narrate anything. You'll notice what he doesn't say.\n\nNo \"ums.\" No \"uhs.\" No fillers. Just measured, deliberate speech.\n\nWhen he needs to think, he pauses. The pause doesn't weaken his delivery — it strengthens it.\n\nFrom The Shawshank Redemption:\n\"Hope is a good thing. [pause] Maybe the best of things. [pause] And no good thing ever dies.\"\n\nThose pauses? That's where the power lives.\n\nWhen you don't know what to say next — stop talking. Pause. Breathe. Continue. The pause is not your enemy. It's your tool."}/>
            <ExCard name="Anna Wintour" preview="Wintour pauses between thoughts — no fillers, no hedging, just control."
              full={"Anna Wintour runs Vogue. When she speaks, there's no fluff.\n\nWatch any interview. She pauses between thoughts. No \"you knows.\" No \"likes.\" No hedging.\n\nA journalist once asked: \"What makes a good editor?\"\n\nShe paused for 3 seconds. Then:\n\"Decisiveness.\"\n\nOne word. Perfect answer.\n\nFillers signal uncertainty. Pauses signal control. She knows what she wants to say — she doesn't need to fill space.\n\nPrepare your answer before you speak. If you haven't decided what to say, don't start talking yet."}/>
            <ExCard name="Ruth Bader Ginsburg" preview="Ginsburg's legal arguments were surgical — every pause was intentional."
              full={"Ruth Bader Ginsburg argued cases in front of the Supreme Court. Every word mattered. No room for \"ums.\"\n\nHer arguments were surgical: Pause. Point. Evidence. Pause. Next point.\n\nFrom her oral arguments:\n\"The question before the Court is... [pause] ...whether the statute applies in this case.\"\n\nEvery pause was intentional. Every word was chosen.\n\nIn high-stakes environments, precision builds trust. Structure your thoughts before you speak. Point 1. Pause. Point 2. Pause. Conclusion.\n\nThe higher the stakes, the fewer words you should use. And zero fillers."}/>
            <ExCard name="Barack Obama" preview="Obama is known for strategic pauses that give weight to important points."
              full={"Obama is known for his pauses. Mid-sentence, he'll stop. Think. Then continue.\n\nCritics called it hesitant. Speech coaches called it brilliant.\n\nFrom a 2008 debate:\n\"The question is... [3-second pause] ...what kind of country are we going to leave our children?\"\n\nThat pause? Not a filler. A choice. It gave the audience time to absorb the weight of the question.\n\nWhen you make an important point, pause after it. Let it land before you move on.\n\nSilence isn't empty space. It's emphasis. The strongest speakers know when to stop talking."}/>
          </div>
        </div>
      );

      if (step === "Practice") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,letterSpacing:"-0.5px",lineHeight:1.2,marginBottom:12}}>From Filler to Filler-Free</h2>
          <p style={{fontFamily:T.sans,fontSize:17,color:T2.text2,lineHeight:1.6,marginBottom:48,fontWeight:300}}>Four exercises to break the habit.</p>

          {/* Exercise 1 — Count Your Fillers */}
          <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"40px",marginBottom:24}}>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Exercise 1</div>
            <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>Count Your Fillers</h3>
            <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,marginBottom:20,fontWeight:400}}>You can't fix what you don't measure. Paste a transcript or write out something you said. AI counts every filler and shows you a clean version.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"20px 24px",marginBottom:22,borderRadius:4}}>
              <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0}}>
                <strong style={{color:T2.text2,fontWeight:600}}>Benchmarks:</strong><br/>
                Average untrained speaker: 15–20 fillers/min<br/>
                Good speaker: 5–8 fillers/min<br/>
                Excellent speaker: Under 3 fillers/min
              </p>
            </div>
            <label style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text2,marginBottom:8,display:"block"}}>Your Turn:</label>
            <textarea value={fillerInput} onChange={e=>setFillerInput(e.target.value)} placeholder={"Paste a transcript or type what you said (include 'um', 'like', 'you know'...)"} className="au-input" style={{height:120,marginBottom:20,resize:"vertical"}}/>
            <button onClick={detectFillers} disabled={fillerLoading||!fillerInput.trim()} style={{padding:"13px 28px",borderRadius:4,border:"none",background:fillerLoading||!fillerInput.trim()?"rgba(138,158,132,0.2)":T.ink,color:fillerLoading||!fillerInput.trim()?T2.text3:T.bg,fontSize:14,fontWeight:600,cursor:fillerLoading||!fillerInput.trim()?"not-allowed":"pointer",fontFamily:T.sans,transition:"all 0.2s ease"}}>
              {fillerLoading?"Analyzing…":"Analyze Fillers →"}
            </button>
            {fillerResult && (
              <div style={{background:"rgba(138,158,132,0.1)",borderLeft:"4px solid "+T.gold,borderRadius:4,padding:"20px 24px",marginTop:20}}>
                <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:T.gold,marginBottom:10}}>Your Filler Report</div>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{fillerResult}</p>
              </div>
            )}
          </div>

          {/* Exercise 2 — The 5-Second Pause */}
          <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"40px",marginBottom:24}}>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Exercise 2</div>
            <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>The 5-Second Pause</h3>
            <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,marginBottom:20,fontWeight:400}}>Practice pausing for a full 5 seconds. It feels impossibly long to you. To your audience? Barely noticeable.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"20px 24px",marginBottom:22,borderRadius:4}}>
              <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0}}>
                Say: <em>"The most important thing about this project is..."</em><br/>
                [Pause 5 seconds]<br/>
                <em>"...that we ship on time."</em><br/>
                <br/>
                Feel the discomfort. Push through it.
              </p>
            </div>
            <div style={{background:"rgba(247,243,236,0.7)",borderRadius:6,padding:"32px",textAlign:"center",marginBottom:20}}>
              <div style={{fontFamily:T.serif,fontSize:56,fontWeight:300,color:pauseDone?T.gold:pauseActive?"#B05C4A":T2.text2,lineHeight:1,marginBottom:8,transition:"color 0.3s"}}>
                {pauseDone?"✓":pauseSecs}
              </div>
              <div style={{fontFamily:T.sans,fontSize:13,color:T2.text3}}>{pauseDone?"Pause complete!":pauseActive?"Hold the silence...":"seconds"}</div>
            </div>
            <div style={{display:"flex",gap:12}}>
              <button onClick={()=>{setPauseSecs(5);setPauseDone(false);setPauseActive(true);}} style={{padding:"13px 28px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s ease"}}>
                {pauseActive?"Running…":"Start Timer"}
              </button>
              {(pauseActive||pauseDone) && (
                <button onClick={()=>{setPauseActive(false);setPauseSecs(5);setPauseDone(false);}} style={{padding:"13px 28px",borderRadius:4,border:"1px solid "+T.gold,background:"transparent",color:T.goldDark,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans}}>
                  Reset
                </button>
              )}
            </div>
            {pauseDone && (
              <div style={{background:"rgba(138,158,132,0.1)",borderLeft:"4px solid "+T.gold,borderRadius:4,padding:"20px 24px",marginTop:20}}>
                <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:T.gold,marginBottom:10}}>Pause Complete</div>
                <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.7,margin:0}}>You held the pause for 5 seconds. That's what confidence sounds like. Try this in your next meeting.</p>
              </div>
            )}
          </div>

          {/* Exercise 3 — Replace Fillers with Breath */}
          <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"40px",marginBottom:24}}>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Exercise 3</div>
            <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>Slow Down</h3>
            <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,marginBottom:20,fontWeight:400}}>Fillers multiply when you rush. Paste something you need to say. AI rewrites it with natural pause markers so you can practise at 20% slower pace.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"20px 24px",marginBottom:22,borderRadius:4}}>
              <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0}}>
                <strong style={{color:T2.text2,fontWeight:600}}>Before:</strong> {"\"So um, the next step is uh, to finalize the deck and then we need to like, send it over.\""}<br/>
                <strong style={{color:T2.text2,fontWeight:600}}>After:</strong> {"\"The next step [...] is to finalize the deck. [...] Then we send it over.\""}
              </p>
            </div>
            <label style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text2,marginBottom:8,display:"block"}}>Your Turn:</label>
            <textarea value={paceInput} onChange={e=>setPaceInput(e.target.value)} placeholder="Paste what you need to say..." className="au-input" style={{height:100,marginBottom:20,resize:"vertical"}}/>
            <button onClick={checkPace} disabled={paceLoading||!paceInput.trim()} style={{padding:"13px 28px",borderRadius:4,border:"none",background:paceLoading||!paceInput.trim()?"rgba(138,158,132,0.2)":T.ink,color:paceLoading||!paceInput.trim()?T2.text3:T.bg,fontSize:14,fontWeight:600,cursor:paceLoading||!paceInput.trim()?"not-allowed":"pointer",fontFamily:T.sans,transition:"all 0.2s ease"}}>
              {paceLoading?"Rewriting…":"Add Pause Markers →"}
            </button>
            {paceResult && (
              <div style={{background:"rgba(138,158,132,0.1)",borderLeft:"4px solid "+T.gold,borderRadius:4,padding:"20px 24px",marginTop:20}}>
                <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:T.gold,marginBottom:10}}>Slower Version</div>
                {paceResult.slow
                  ? <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{paceResult.slow}</p>
                  : <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,fontStyle:"italic",margin:0}}>Read this out loud 20% slower. Pause at every full stop.</p>}
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div style={{marginTop:48,paddingTop:40,borderTop:"1px solid rgba(138,158,132,0.2)"}}>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:24}}>Rules to Eliminate Fillers</h2>
            {["Pause instead of filling. Every time.","Breathe before you speak.","Know your next sentence before you start it.","Slow down. Rushing creates fillers.","Record yourself. Awareness is 80% of the fix.","When in doubt, stop talking. Silence > filler."].map((tip,i,arr)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"14px 0",borderBottom:i<arr.length-1?"0.5px solid rgba(138,158,132,0.15)":"none"}}>
                <span style={{color:T.gold,fontSize:16,flexShrink:0,marginTop:2,fontWeight:700}}>✓</span>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>AI Practice</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Speak Filler-Free — 60 Seconds</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.7,fontWeight:300,marginBottom:28}}>Choose a scenario. Write your response with zero fillers. The AI detects every "um," "uh," "like," and "you know."</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:28}}>
            {[
              {n:1,title:"Explain your project with zero fillers",sub:"Pause when you need to think. Don't fill."},
              {n:2,title:"Answer a tough question without hedging",sub:"'I don't know' beats 'um, well, sort of...'"},
              {n:3,title:"Give a 60-second pitch — crisp and clean",sub:"No fillers. Just facts."},
              {n:4,title:"Deliver instructions that are filler-free",sub:"Clear. Confident. Direct."},
            ].map((sc,i)=>(
              <button key={i} onClick={()=>setSimInput(sc.title+": ")} style={{padding:"14px 18px",borderRadius:4,border:"0.5px solid "+T2.border,background:T2.surface,textAlign:"left",cursor:"pointer",transition:"all 0.18s ease"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(247,243,236,0.95)";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(44,36,22,0.1)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.8)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 1px 4px rgba(44,36,22,0.06)";}}>
                <div style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text,marginBottom:3}}>{sc.n}. {sc.title}</div>
                <div style={{fontFamily:T.sans,fontSize:12,color:T2.text3}}>{sc.sub}</div>
              </button>
            ))}
          </div>
          <textarea value={simInput} onChange={e=>setSimInput(e.target.value)} placeholder="Write your 60-second response here — no fillers allowed…" className="au-input" style={{height:120,marginBottom:14,resize:"none"}}/>
          <D3SimFeedback input={simInput}/>
        </div>
      );

      return null;
    };

    // ── D4 RightContent — Day 4: Short Sentences ──────────────────────────────
    const D4RightContent = () => {
      const [d4Card, setD4Card] = useState(null);
      const [sentInput, setSentInput] = useState(""); const [sentResult, setSentResult] = useState(null); const [sentLoading, setSentLoading] = useState(false);
      const [connInput, setConnInput] = useState(""); const [connResult, setConnResult] = useState(null); const [connLoading, setConnLoading] = useState(false);
      const [heming, setHeming] = useState(""); const [hemResult, setHemResult] = useState(null); const [hemLoading, setHemLoading] = useState(false);
      const [simInput, setSimInput] = useState("");
      const openCard = D4_EXAMPLES_DATA.find(c=>c.id===d4Card);

      const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length;

      async function splitSentence() {
        if (!sentInput.trim()) return; setSentLoading(true);
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:`Split this sentence into 2-4 short sentences (under 15 words each). Return ONLY the split version, no explanation: "${sentInput}"`}]})});
          const d = await res.json(); setSentResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setSentResult("Try splitting at every connector: 'and', 'but', 'which', 'that'."); }
        setSentLoading(false);
      }

      async function killConnectors() {
        if (!connInput.trim()) return; setConnLoading(true);
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`Find the connectors (and, but, however, which, that, so, because) in this sentence and rewrite it as 2-5 short sentences. Start with a line like "Found X connectors:" then show the rewritten sentences on separate lines starting with →\n\n"${connInput}"`}]})});
          const d = await res.json(); setConnResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setConnResult("Try splitting at every 'and', 'but', 'however', 'which', or 'that'."); }
        setConnLoading(false);
      }

      async function hemingwayChallenge() {
        if (!heming.trim()) return; setHemLoading(true);
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`Apply the Hemingway challenge to this paragraph — cut it to half the words, then half again. Return JSON: {half:"cut in half",quarter:"cut in half again",lesson:"what was removed"}\n\n"${heming}"`}]})});
          const d = await res.json(); const raw=(d.content||[]).map(b=>b.text||"").join("").trim();
          try { const m=raw.match(/\{[\s\S]*\}/); setHemResult(JSON.parse(m[0])); } catch { setHemResult({half:"We need to adjust our strategy.",quarter:"Adjust the strategy.",lesson:"Filler phrases and hedging language were removed — the meaning stayed identical."}); }
        } catch { setHemResult(null); }
        setHemLoading(false);
      }

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Why Short Sentences Win</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:32}}>The brain processes short sentences faster, retains them longer, and finds them more persuasive. Here's the evidence.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:32}}>
            {D4_FACTS.map((n,i)=>(
              <div key={i} style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:10}}>{n.word}</div>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{n.body}</p>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.sans,fontSize:16,fontStyle:"italic",color:T.gold,lineHeight:1.7,fontWeight:400}}>Long sentences lose people. Short sentences move them.</p>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Miller's Law</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>In 1956, psychologist George Miller discovered something fundamental about how humans think.</p>
          <div style={{padding:"20px 24px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,marginBottom:24}}>
            <p style={{fontFamily:T.serif,fontSize:24,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>We can only hold 7 (±2) pieces of information in working memory at once.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
            {["Every sentence you speak creates a memory load.","Long sentences stack information faster than your audience can process.","By the time you reach the end, they've forgotten the beginning.","The fix? One idea. One sentence. Full stop."].map((p,i)=>(
              <div key={i} style={{padding:"16px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{p}</p>
              </div>
            ))}
          </div>
          <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:20}}>
            <div style={{fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>See It In Action</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px 18px",background:"rgba(139,74,56,0.05)",borderRadius:4,borderLeft:"2px solid rgba(139,74,56,0.3)"}}>
                <div style={{fontFamily:T.sans,fontSize:10,color:"#B05C4A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Too long — 34 words</div>
                <p style={{fontFamily:T.sans,fontSize:16,fontStyle:"italic",color:T.gold,lineHeight:1.7,fontWeight:400,margin:0}}>"Our platform enables cross-functional teams to coordinate asynchronous workflows while maintaining data integrity across distributed systems, which allows for more efficient resource allocation."</p>
              </div>
              <div style={{padding:"16px 18px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                <div style={{fontFamily:T.sans,fontSize:10,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Better — 4 short sentences</div>
                <p style={{fontFamily:T.sans,fontSize:16,fontStyle:"italic",color:T.gold,lineHeight:1.7,fontWeight:400,margin:0}}>"Our platform helps teams work together. They coordinate without meetings. Data stays secure. Resource allocation improves."</p>
              </div>
            </div>
          </div>
        </div>
      );

      if (step === "Example") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Masters of Brevity</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <ExCard name="Ernest Hemingway" preview="Hemingway won the Nobel Prize with short, precise sentences."
              full={"Short sentences. That was Hemingway's secret.\n\n\"The old man fished alone. Eighty-four days. No fish.\"\n\nNo flourish. No decoration. Just truth.\n\nShort sentences force precision. You can't hide weak ideas behind long ones. Every word earns its place or it goes.\n\nBrevity forces clarity. When you limit words, you're forced to keep only the ones that matter.\n\nWrite your sentence. Count the words. Over 15? Split it. Read each sentence aloud. If you run out of breath before the full stop, it's too long.\n\nShort sentences are a discipline. Every word must earn its place. If it doesn't add meaning, cut it."}/>
            <ExCard name="Albert Einstein" preview="Einstein explained the universe using simple words and short sentences."
              full={"Einstein had a rule: if you can't explain it simply, you don't understand it well enough.\n\n\"Put your hand on a hot stove for a minute. It feels like an hour. Sit with a pretty girl for an hour. It feels like a minute. That's relativity.\"\n\nComplex physics. Simple words. Clear image.\n\nHe could have filled a textbook. Instead, he used a story you can picture. Short sentences force you to find the image at the heart of the idea.\n\nFor every complex idea you need to communicate, find the simple image that explains it. Then build your short sentences around that image.\n\nIf the world's most complex thinker could explain his greatest theory in two sentences, you can explain your idea clearly too."}/>
            <ExCard name="Coco Chanel" preview="Chanel's philosophy of elegance through elimination extended to her words."
              full={"Chanel built a fashion empire on one principle: remove everything that isn't essential.\n\nThe same principle shaped how she spoke.\n\n\"Fashion fades. Style remains.\"\n\"Simplicity is the keynote of all true elegance.\"\n\"The most courageous act is still to think for yourself.\"\n\nShort sentences. Maximum impact. Every time.\n\nThe discipline of cutting in fashion is the discipline of cutting in speech. Both require you to decide what's essential — and remove everything else.\n\nTake your last important email or presentation. Find the three most essential sentences. Delete the rest. See if the message survives.\n\nElegance in language, like elegance in fashion, is about knowing what to leave out."}/>
            <ExCard name="Jane Goodall" preview="Goodall makes 60 years of research accessible through simple language."
              full={"Jane Goodall spent decades in the jungle studying chimpanzees. She could talk in scientific abstractions. She doesn't.\n\n\"Chimps use tools. They have emotions. They're not so different from us.\"\n\nDecades of research. Three short sentences.\n\nThe best educators don't simplify their ideas — they find the clearest path to them. Short sentences are that path.\n\nAfter you've written a long explanation, ask: what are the three things I actually want this person to understand? Write those three things as short sentences. Lead with them.\n\nThe goal isn't to sound impressive. The goal is to be understood. Short sentences are how you get there."}/>
          </div>
        </div>
      );

      if (step === "Practice") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>

          {/* Header */}
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,letterSpacing:"-0.5px",lineHeight:1.2,marginBottom:12}}>The Sentence Surgery Toolkit</h2>
          <p style={{fontFamily:T.sans,fontSize:17,color:T2.text2,lineHeight:1.6,marginBottom:48,fontWeight:300}}>Three exercises to cut without losing meaning.</p>

          {/* Exercise 1 — The 15-Word Rule */}
          <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"40px",marginBottom:24}}>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Exercise 1</div>
            <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>The 15-Word Rule</h3>
            <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,marginBottom:20,fontWeight:400}}>Count the words in your last sentence. Over 15 words? Too long.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"20px 24px",marginBottom:22,borderRadius:4}}>
              <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0}}>
                <strong style={{color:T2.text2,fontWeight:600}}>Example:</strong><br/>
                {"❌ \"I wanted to reach out to see if we could potentially schedule a time to discuss the proposal we sent over last week.\" "}<em style={{color:T2.text2}}>(26 words)</em>
              </p>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,margin:"12px 0 0"}}>
                {"✓ \"Can we discuss the proposal? I'm free this week.\" "}<em style={{color:T2.text2}}>(10 words)</em>
              </p>
            </div>
            <label style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text2,marginBottom:8,display:"block"}}>Your Turn:</label>
            {sentInput && <p style={{fontFamily:T.sans,fontSize:12,color:wordCount(sentInput)>15?"#B05C4A":T.gold,marginBottom:8,fontWeight:500}}>{wordCount(sentInput)} words — {wordCount(sentInput)>15?"too long":"good length"}</p>}
            <textarea value={sentInput} onChange={e=>setSentInput(e.target.value)} placeholder="Paste a long sentence from your work..." className="au-input" style={{height:100,marginBottom:8,resize:"vertical"}}/>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text2,marginBottom:20,fontStyle:"italic"}}>Rule: If a sentence has more than one verb, split it.</p>
            <button onClick={splitSentence} disabled={sentLoading||!sentInput.trim()} style={{padding:"13px 28px",borderRadius:4,border:"none",background:sentLoading||!sentInput.trim()?"rgba(138,158,132,0.2)":T.ink,color:sentLoading||!sentInput.trim()?T2.text3:T.bg,fontSize:14,fontWeight:600,cursor:sentLoading||!sentInput.trim()?"not-allowed":"pointer",fontFamily:T.sans,transition:"all 0.2s ease"}}>
              {sentLoading?"Counting…":"Count Words →"}
            </button>
            {sentResult && (
              <div style={{background:"rgba(138,158,132,0.1)",borderLeft:"4px solid "+T.gold,borderRadius:4,padding:"20px 24px",marginTop:20}}>
                <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:T.gold,marginBottom:10}}>Split Version</div>
                <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.7,margin:0}}>{sentResult}</p>
              </div>
            )}
          </div>

          {/* Exercise 2 — Kill the Connectors */}
          <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"40px",marginBottom:24}}>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Exercise 2</div>
            <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>Kill the Connectors</h3>
            <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,marginBottom:20,fontWeight:400}}>Long sentences hide behind connectors: "and," "but," "however," "which," "that." Every connector is a signal to split.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"20px 24px",marginBottom:22,borderRadius:4}}>
              <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0}}>
                <strong style={{color:T2.text2,fontWeight:600}}>Example:</strong><br/>
                {"❌ \"We launched the product last month and the initial feedback has been positive, however there are some features that users are requesting which we plan to add in the next update.\""}
              </p>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,margin:"12px 0 0"}}>
                {"✓ \"We launched last month. Feedback is positive. Users want more features. We're adding them next update.\""}
              </p>
            </div>
            <label style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text2,marginBottom:8,display:"block"}}>Your Turn:</label>
            <textarea value={connInput} onChange={e=>setConnInput(e.target.value)} placeholder={"Find a sentence with 'and,' 'but,' or 'which'..."} className="au-input" style={{height:100,marginBottom:8,resize:"vertical"}}/>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text2,marginBottom:20,fontStyle:"italic"}}>AI will show you where to split ↓</p>
            <button onClick={killConnectors} disabled={connLoading||!connInput.trim()} style={{padding:"13px 28px",borderRadius:4,border:"none",background:connLoading||!connInput.trim()?"rgba(138,158,132,0.2)":T.ink,color:connLoading||!connInput.trim()?T2.text3:T.bg,fontSize:14,fontWeight:600,cursor:connLoading||!connInput.trim()?"not-allowed":"pointer",fontFamily:T.sans,transition:"all 0.2s ease"}}>
              {connLoading?"Analyzing…":"Analyze →"}
            </button>
            {connResult && (
              <div style={{background:"rgba(138,158,132,0.1)",borderLeft:"4px solid "+T.gold,borderRadius:4,padding:"20px 24px",marginTop:20}}>
                <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:T.gold,marginBottom:10}}>Split Here</div>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{connResult}</p>
              </div>
            )}
          </div>

          {/* Exercise 3 — The Hemingway Challenge */}
          <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"40px",marginBottom:24}}>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Exercise 3</div>
            <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>The Hemingway Challenge</h3>
            <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,marginBottom:20,fontWeight:400}}>Take any paragraph you've written. Cut it in half. Then cut it in half again. If it still makes sense, the original was too long.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"20px 24px",marginBottom:22,borderRadius:4}}>
              <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0}}>
                <strong style={{color:T2.text2,fontWeight:600}}>Original (45 words):</strong><br/>
                {"\"In light of the recent developments regarding our strategic initiatives and the feedback we've received from various stakeholders, we believe it would be beneficial to reconvene and discuss potential adjustments to our approach moving forward.\""}
              </p>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,margin:"10px 0 0"}}>
                <strong style={{color:T2.text2,fontWeight:600}}>Cut in half (21 words):</strong><br/>
                {"\"Given recent feedback on our strategy, we should meet to discuss adjustments.\""}
              </p>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,margin:"10px 0 0"}}>
                <strong style={{color:T2.text2,fontWeight:600}}>Cut again (9 words):</strong><br/>
                {"\"Let's meet. We need to adjust our strategy.\""}
              </p>
            </div>
            <label style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text2,marginBottom:8,display:"block"}}>Your Turn:</label>
            <textarea value={heming} onChange={e=>setHeming(e.target.value)} placeholder="Paste your paragraph..." className="au-input" style={{height:130,marginBottom:20,resize:"vertical"}}/>
            <div style={{display:"flex",gap:12}}>
              <button onClick={hemingwayChallenge} disabled={hemLoading||!heming.trim()} style={{padding:"13px 28px",borderRadius:4,border:"none",background:hemLoading||!heming.trim()?"rgba(138,158,132,0.2)":T.ink,color:hemLoading||!heming.trim()?T2.text3:T.bg,fontSize:14,fontWeight:600,cursor:hemLoading||!heming.trim()?"not-allowed":"pointer",fontFamily:T.sans,transition:"all 0.2s ease"}}>
                {hemLoading?"Cutting…":"Cut in Half →"}
              </button>
              {hemResult && (
                <button onClick={hemingwayChallenge} style={{padding:"13px 28px",borderRadius:4,border:"1px solid "+T.gold,background:"transparent",color:T.goldDark,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s ease"}}>
                  Cut Again →
                </button>
              )}
            </div>
            {hemResult && (
              <div style={{background:"rgba(138,158,132,0.1)",borderLeft:"4px solid "+T.gold,borderRadius:4,padding:"20px 24px",marginTop:20}}>
                <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:T.gold,marginBottom:14}}>Trimmed Version</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4}}>
                    <div style={{fontFamily:T.sans,fontSize:10,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Cut in half</div>
                    <p style={{fontFamily:T.serif,fontSize:15,color:T2.text,lineHeight:1.65,margin:0}}>{hemResult.half}</p>
                  </div>
                  <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                    <div style={{fontFamily:T.sans,fontSize:10,color:T.goldDark,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Cut in half again</div>
                    <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.65,margin:0}}>{hemResult.quarter}</p>
                  </div>
                  {hemResult.lesson && <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,fontStyle:"italic",margin:0}}>{hemResult.lesson}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div style={{marginTop:48,paddingTop:40,borderTop:"1px solid rgba(138,158,132,0.2)"}}>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:24}}>Rules from Masters of Brevity</h2>
            {["One idea per sentence. Full stop.","If you see 'and,' split the sentence.","Target: 15 words or fewer.","Cut every word that doesn't add meaning.","If you can remove a word and the sentence still works, remove it.","Short sentences are easier to follow. Easier to remember. Far more persuasive."].map((tip,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"14px 0",borderBottom:i<5?"0.5px solid rgba(138,158,132,0.15)":"none"}}>
                <span style={{color:T.gold,fontSize:16,flexShrink:0,marginTop:2,fontWeight:700}}>✓</span>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>AI Practice</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Speak in Short Sentences — 60 Seconds</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.7,fontWeight:300,marginBottom:28}}>Choose a scenario. Write your response using only short sentences. The AI analyses average sentence length and flags any run-ons.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
            {[
              {n:1,title:"Explain your project in under 15 words per sentence",sub:"No run-ons. No rambling. Just clarity."},
              {n:2,title:"Deliver bad news using only short sentences",sub:"Get to the point. Then explain."},
              {n:3,title:"Pitch your idea with maximum brevity",sub:"Hook them in the first sentence. Keep it tight."},
              {n:4,title:"Give instructions that anyone could follow",sub:"Short sentences eliminate confusion."},
            ].map((sc,i)=>(
              <button key={i} onClick={()=>setSimInput(sc.title+": ")} style={{padding:"14px 18px",borderRadius:4,border:"0.5px solid "+T2.border,background:T2.surface,textAlign:"left",cursor:"pointer",transition:"all 0.18s ease"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(247,243,236,0.95)";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(44,36,22,0.1)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.8)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 1px 4px rgba(44,36,22,0.06)";}}>
                <div style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text,marginBottom:3}}>{sc.n}. {sc.title}</div>
                <div style={{fontFamily:T.sans,fontSize:12,color:T2.text3}}>{sc.sub}</div>
              </button>
            ))}
          </div>
          <textarea value={simInput} onChange={e=>setSimInput(e.target.value)} placeholder="Write your 60-second response here…" className="au-input" style={{height:120,marginBottom:14,resize:"none"}}/>
          <D4SimFeedback input={simInput}/>
        </div>
      );

      return null;
    };

    // ── D1 RightContent — Day 1: Speak Clearly ────────────────────────────────
    const D1_CLARITY_FACTS = D1_CLARITY_FACTS_DATA;
    const D1_FEYNMAN_STEPS = D1_FEYNMAN_DATA;
    const D1_EXAMPLES = [
      { id:"tyson", title:"Neil deGrasse Tyson", sub:"Making the Universe Understandable",
        tag:"He explains black holes and quantum physics so anyone can picture it.",
        content:(
          <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
            <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Making Nature Understandable</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>The world's clearest<br/>science communicator.</h2>
            <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:28}}>
              {["Attenborough explains ecosystems, evolution, planetary forces — topics that could drown in scientific jargon.",
                "Instead, he uses language anyone can picture:",
               ].map((p,i)=><p key={i} style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>{p}</p>)}
              <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>"The rainforest is like a vast, green lung breathing life into our planet."</p>
              </div>
              <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>No technical terms. Just an image you can see.</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>He translates scientific complexity into vivid, everyday language. You don't need a biology degree to understand the Amazon.</p>
              </div>
              <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Replace technical terms with pictures people already have in their heads. Make the abstract concrete.</p>
              </div>
            </div>
            <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Clarity comes from choosing words that create images, not confusion. The best explainers make you see what they're saying.</p>
            </div>
          </div>
        )},
      { id:"branson", title:"Sir Richard Branson", sub:"Business Without Buzzwords",
        tag:"He uses plain English — words anyone would use.",
        content:(
          <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
            <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Business Without Buzzwords</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>A global empire.<br/>Chatting with a friend.</h2>
            <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:28}}>
              <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Branson built a global empire. But he speaks like he's chatting with a friend.</p>
              <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>When asked about Virgin's strategy:</p>
              <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>"We just try to make things better for people. If we do that, they'll choose us."</p>
              </div>
              <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>No "synergies." No "value propositions." No corporate fluff.</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>He uses plain English — words anyone would use. His message is so simple, you can repeat it back immediately.</p>
              </div>
              <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Remove every word a 10-year-old wouldn't understand. If what's left still makes sense, you've found clarity.</p>
              </div>
            </div>
            <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>The clearest speakers use the simplest words. Plain language isn't a limitation — it's a sign of mastery.</p>
            </div>
          </div>
        )},
      { id:"brown", title:"Brené Brown", sub:"Academia Made Accessible",
        tag:"Complex ideas, distilled into one clear sentence.",
        content:(
          <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
            <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Academia Made Accessible</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>20 years of research.<br/>One clear sentence.</h2>
            <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:28}}>
              <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Brown spent 20 years researching vulnerability and shame. She could hide behind academic language. She doesn't.</p>
              <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>"Vulnerability is not weakness. It's the most accurate measure of courage."</p>
              </div>
              <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Years of research. One clear sentence.</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>She distills complexity into a single, memorable idea. No theory. No jargon. Just truth you can use.</p>
              </div>
              <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Ask: "If I had 10 seconds to explain this, what would I say?" That's your message. Everything else is supporting detail.</p>
              </div>
            </div>
            <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Complex ideas don't need complex language. The best thinkers can explain their work in one sentence.</p>
            </div>
          </div>
        )},
      { id:"gladwell", title:"Malcolm Gladwell", sub:"Research to Rememberable",
        tag:"Dense research distilled into ideas that stick forever. '10,000 hours.'",
        content:(
          <div style={{maxWidth:540,margin:"0 auto",padding:"0 20px"}}>
            <div style={{fontFamily:T.sans,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T2.text3,marginBottom:20}}>Ideas That Land</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:28}}>Six words.<br/>Shifted the conversation.</h2>
            <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:28}}>
              <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>Michelle Obama addresses millions on education, equality, leadership. Complex topics. High stakes.</p>
              <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,margin:0}}>But her messages are always clear:</p>
              <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                <p style={{fontFamily:T.serif,fontSize:22,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>"When they go low, we go high."</p>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>She takes big ideas and distills them into phrases you can remember and repeat. No wasted words. Just clarity.</p>
              </div>
              <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>Find the core of your message — the part that could fit on a bumper sticker. Build everything else around that.</p>
              </div>
            </div>
            <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Clear communicators decide what people should remember, then say that first. Everything else is just the explanation.</p>
            </div>
          </div>
        )},
    ];

    const D1RightContent = () => {
      const [d1OpenCard, setD1OpenCard] = useState(null);
      const [jargonInput, setJargonInput] = useState("");
      const [jargonResult, setJargonResult] = useState("");
      const [jargonLoading, setJargonLoading] = useState(false);
      const [soWhatInput, setSoWhatInput] = useState("");
      const [soWhatResult, setSoWhatResult] = useState(null);
      const [soWhatLoading, setSoWhatLoading] = useState(false);
      const [breathInput, setBreathInput] = useState("");
      const [breathResult, setBreathResult] = useState(null);
      const [breathLoading, setBreathLoading] = useState(false);
      const [simInput, setSimInput] = useState("");
      const openCard = D1_EXAMPLES.find(c=>c.id===d1OpenCard);

      async function simplifyJargon() {
        if (!jargonInput.trim()) return;
        setJargonLoading(true);
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:`Simplify this sentence, removing all jargon. Return ONLY the simplified sentence, nothing else: "${jargonInput}"`}]})});
          const data = await res.json();
          setJargonResult((data.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setJargonResult("Try again — keep it simple enough that a 10-year-old could understand."); }
        setJargonLoading(false);
      }

      async function runSoWhat() {
        if (!soWhatInput.trim()) return;
        setSoWhatLoading(true);
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`Apply the "So What?" chain 3 times to this idea: "${soWhatInput}". Return JSON: {chain:[{q:"So what?",a:"..."},...],lead:"The real point to lead with"}`}]})});
          const data = await res.json();
          const raw = (data.content||[]).map(b=>b.text||"").join("").trim();
          try { const m=raw.match(/\{[\s\S]*\}/); setSoWhatResult(JSON.parse(m[0])); } catch { setSoWhatResult({chain:[{q:"So what?",a:"Your audience cares about results."},{q:"So what?",a:"Results earn trust and opportunity."},{q:"So what?",a:"Lead with outcomes, not process."}],lead:"Lead with the outcome — not the work."}); }
        } catch { setSoWhatResult(null); }
        setSoWhatLoading(false);
      }

      async function runBreathTest() {
        if (!breathInput.trim()) return; setBreathLoading(true);
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:`Condense this explanation into ONE clear sentence of under 15 words — something you can say in a single breath. Return ONLY the sentence: "${breathInput}"`}]})});
          const data = await res.json();
          setBreathResult((data.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setBreathResult("Try again — aim for one idea, under 15 words."); }
        setBreathLoading(false);
      }

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Why Clarity Wins</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:36,maxWidth:600}}>Clear language makes ideas easier to understand, easier to remember, and easier to act on. Here's why clarity matters.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28}}>
            {D1_CLARITY_FACTS.map((n,i)=>{
              const open = d1OpenCard===("cf"+i);
              return (
                <div key={i} onClick={()=>setD1OpenCard(open?null:"cf"+i)} className="au-lift" style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?T.gold:T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s, transform 0.2s"}}
                  onMouseEnter={e=>{if(!open){e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.boxShadow="0 4px 20px rgba(138,158,132,0.22), 0 1px 6px rgba(138,158,132,0.12)";}}}
                  onMouseLeave={e=>{if(!open){e.currentTarget.style.borderColor=T2.border;e.currentTarget.style.boxShadow="none";}}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?10:6}}>
                    <div style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:12,color:open?T.gold:T2.text4,marginLeft:10,flexShrink:0,marginTop:2}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 14px":0}}>{n.sub}</p>
                  {open && (
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14,display:"flex",flexDirection:"column",gap:8}}>
                      {n.bullets.map((b,j)=>(
                        <div key={j} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                          <div style={{width:4,height:4,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/>
                          <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:400,margin:0}}>{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{fontFamily:T.sans,fontSize:16,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic"}}>The clearest communicator is often the most influential.</p>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:16}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>The Feynman Technique</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Richard Feynman won the Nobel Prize in Physics — and could explain quantum mechanics to a 12-year-old.</p>
          <div style={{padding:"20px 24px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,marginBottom:24}}>
            <p style={{fontFamily:T.serif,fontSize:24,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>If you can't explain it simply, you don't understand it well enough.</p>
          </div>
          <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.8,fontWeight:400,marginBottom:20}}>His secret? The 4-step clarity loop:</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
            {[
              {label:"1. Understand", body:"Choose a concept and study it deeply."},
              {label:"2. Explain",    body:"Teach it in simple words as if to someone else. No jargon."},
              {label:"3. Simplify",   body:"When you stumble, that's a gap. Go back and fill it."},
              {label:"4. Refine",     body:"Review, clarify, improve. Repeat until a child could follow."},
            ].map((p,i)=>(
              <div key={i} style={{padding:"16px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:10}}>{p.label}</div>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{p.body}</p>
              </div>
            ))}
          </div>
          <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:20}}>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Why It Works</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px 18px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                <p style={{fontFamily:T.sans,fontSize:16,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",margin:0}}>Teaching forces you to understand. If you can explain it clearly, you know it.</p>
              </div>
              <div style={{padding:"16px 18px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                <p style={{fontFamily:T.sans,fontSize:16,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",margin:0}}>Simplifying forces you to think. The clearest thinkers are the clearest speakers.</p>
              </div>
            </div>
          </div>
        </div>
      );

      if (step === "Example") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12}}>Masters of Clear Communication</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:32}}>Four speakers who make complex ideas accessible.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <ExCard name="David Attenborough" preview="Attenborough explains ecosystems and planetary forces using language anyone can picture."
              full={"Attenborough explains ecosystems, evolution, planetary forces — topics that could drown in scientific jargon.\n\nInstead, he uses language anyone can picture:\n\n\"The rainforest is like a vast, green lung breathing life into our planet.\"\n\nNo technical terms. Just an image you can see.\n\nHe translates scientific complexity into vivid, everyday language. You don't need a biology degree to understand the Amazon.\n\nReplace technical terms with pictures people already have in their heads. Make the abstract concrete.\n\nClarity comes from choosing words that create images, not confusion. The best explainers make you see what they're saying."}/>
            <ExCard name="Sir Richard Branson" preview="Branson built a global empire but speaks like he's chatting with a friend."
              full={"Branson built a global empire. But he speaks like he's chatting with a friend.\n\nWhen asked about Virgin's strategy:\n\"We just try to make things better for people. If we do that, they'll choose us.\"\n\nNo \"synergies.\" No \"value propositions.\" No corporate fluff.\n\nHe uses plain English — words anyone would use. His message is so simple, you can repeat it back immediately.\n\nRemove every word a 10-year-old wouldn't understand. If what's left still makes sense, you've found clarity.\n\nJargon doesn't make you sound smart. It makes you hard to understand. The clearest speakers use the simplest words."}/>
            <ExCard name="Brené Brown" preview="Brown spent 20 years researching vulnerability. She could hide behind academic language. She doesn't."
              full={"Brown spent 20 years researching vulnerability and shame. She could hide behind academic language. She doesn't.\n\nHer central finding:\n\"Vulnerability is not weakness. It's the most accurate measure of courage.\"\n\nYears of research. One clear sentence.\n\nShe distils complexity into a single, memorable idea. No theory. No jargon. Just truth you can use.\n\nAsk: \"If I had 10 seconds to explain this, what would I say?\" That's your message. Everything else is supporting detail.\n\nComplex ideas don't need complex language. The best thinkers can explain their work in one sentence."}/>
            <ExCard name="Michelle Obama" preview="Michelle Obama addresses millions on complex topics — but her messages are always clear."
              full={"Michelle Obama addresses millions on education, equality, leadership. Complex topics. High stakes.\n\nBut her messages are always clear:\n\n\"When they go low, we go high.\"\n\nSix words. Shifted the conversation.\n\nShe takes big ideas and distils them into phrases you can remember and repeat. No wasted words. Just clarity.\n\nFind the core of your message — the part that could fit on a bumper sticker. Build everything else around that.\n\nClear communicators decide what people should remember, then say that first. Everything else is just the explanation."}/>
          </div>
        </div>
      );

      if (step === "Practice") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <D1ClarityChallenge T={T} T2={T2} isDesktop={true} onSimulation={()=>setIdx(STEPS.indexOf('Simulation'))}/>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <D1SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      return null;
    };

    // ── Right panel: unified editorial content across all 6 steps ─────────────
    // ── NT RightContent — all 6 steps ──────────────────────────────────────
    const NTRightContent = () => {
      const [momentInput, setMomentInput] = useState(""); const [momentResult, setMomentResult] = useState(null); const [momentLoading, setMomentLoading] = useState(false);
      const [beforeInput, setBeforeInput] = useState(""); const [afterInput, setAfterInput] = useState(""); const [baResult, setBAResult] = useState(null); const [baLoading, setBALoading] = useState(false);
      const [storyBeats, setStoryBeats] = useState({setup:"",stakes:"",obstacle:"",choice:"",outcome:"",lesson:""}); const [storyResult, setStoryResult] = useState(null); const [storyLoading, setStoryLoading] = useState(false);

      async function buildStory() {
        const {setup,stakes,obstacle,choice,outcome,lesson} = storyBeats;
        if (!setup.trim()||!stakes.trim()) return; setStoryLoading(true);
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`Assemble these 6 beats into a compelling 3-4 sentence professional story. Use vivid, human language. Return ONLY the story paragraph:\nSetup: ${setup}\nStakes: ${stakes}\nObstacle: ${obstacle}\nChoice: ${choice}\nOutcome: ${outcome}\nLesson: ${lesson}`}]})});
          const d = await res.json(); setStoryResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setStoryResult(null); }
        setStoryLoading(false);
      }

      async function analyzeMoment() {
        if (!momentInput.trim()) return; setMomentLoading(true);
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:`Identify the pivotal "5-second moment" of change in this story, and suggest how to make it more vivid. Return in format:\n"The moment: [extracted moment]\n\nMake it more vivid:\n→ [suggestion 1]\n→ [suggestion 2]\n→ [suggestion 3]"\n\n"${momentInput}"`}]})});
          const d = await res.json(); setMomentResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setMomentResult("Your pivotal moment is the heart of the story. Make it vivid — add sensory details, slow it down."); }
        setMomentLoading(false);
      }

      async function testTransformation() {
        if (!beforeInput.trim()||!afterInput.trim()) return; setBALoading(true);
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:250,messages:[{role:"user",content:`Analyse this before/after transformation and explain what changed and why it makes a compelling story. Keep it under 3 sentences.\nBefore: "${beforeInput}"\nAfter: "${afterInput}"`}]})});
          const d = await res.json(); setBAResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setBAResult("Clear transformation detected. This is what makes people listen — they see the journey, not just the destination."); }
        setBALoading(false);
      }

      if (step === "Insight") {
        return (
          <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
            <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Why Stories Work</h2>
            <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32 }}>Stories transport your audience into a different world. Facts inform. Stories transform.</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
              {NT_NEURO.map((n,i) => (
                <div key={i} style={{ padding:"20px 22px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                  <div style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T.gold, lineHeight:1.3, marginBottom:10 }}>{n.word}</div>
                  <p style={{ fontFamily:T.sans, fontSize:16, color:T2.text, lineHeight:1.7, fontWeight:400, margin:0 }}>{n.body}</p>
                </div>
              ))}
            </div>
            <p style={{ fontFamily:T.sans, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.7, fontWeight:400 }}>Facts explain. Stories move people.</p>
            <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold, marginTop:16 }}>
              <p style={{ fontFamily:T.serif, fontSize:20, fontWeight:600, color:T2.text, lineHeight:1.4, margin:0 }}>We are more engaged when we feel inside the story.</p>
            </div>
          </div>
        );
      }

      if (step === "Theory 1") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Green &amp; Brock, 2000</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Dual Coding Theory</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:28 }}>Stories activate more of the brain than facts. They trigger emotion, memory, and meaning simultaneously. In professional settings, a well-placed story is the most powerful persuasion tool available.</p>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold, marginBottom:28 }}>
            <p style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T2.text, lineHeight:1.4, margin:0 }}>The brain encodes information more deeply when processed through both verbal and visual channels simultaneously. Story activates both. Facts alone activate only one.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
            {[
              {label:"Verbal Channel",  body:"Story activates the brain's language system — the same channel that processes speech, argument, and logic. It carries your message with precision."},
              {label:"Visual Channel",  body:"Story simultaneously triggers the brain's visual cortex, creating mental imagery. Facts alone never do this. Your audience sees what you describe."},
              {label:"65% vs 10%",      body:"People retain 65% of information delivered through story. Only 10% from data alone. Story isn't decoration — it's the delivery mechanism."},
              {label:"The Convergence", body:"Every skill you built in Week 1 — clarity, pace, structure, brevity — comes together in the moment you tell a story. This is where it all lands."},
            ].map((p,i)=>(
              <div key={i} style={{ padding:"16px 18px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T.gold, lineHeight:1.3, marginBottom:10 }}>{p.label}</div>
                <p style={{ fontFamily:T.sans, fontSize:16, color:T2.text, lineHeight:1.7, fontWeight:400, margin:0 }}>{p.body}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:T.gold, lineHeight:1.7 }}>The brain encodes story. It files away data.</p>
        </div>
      );

      if (step === "Theory 2") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>The Framework</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>The 6-Beat Framework</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:24 }}>Every great story follows a learnable pattern. Master these six beats and you can tell any story.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {[
              {n:1,beat:"Hook",         sub:"It starts with tension."},
              {n:2,beat:"Character",    sub:"Make it human. Make it real."},
              {n:3,beat:"Problem",      sub:"What broke? What's at stake?"},
              {n:4,beat:"Turning Point",sub:"What changes? Everything shifts."},
              {n:5,beat:"Resolution",   sub:"What happened? Why it matters."},
              {n:6,beat:"Meaning",      sub:"What stayed with us?"},
            ].map((b,i)=>(
              <div key={i} style={{ padding:"16px 18px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:700, color:T.gold, marginBottom:6, letterSpacing:"0.5px" }}>Beat {b.n}</div>
                <div style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T2.text, marginBottom:8 }}>{b.beat}</div>
                <p style={{ fontFamily:T.sans, fontSize:15, color:T2.text3, lineHeight:1.6, fontWeight:300, margin:0 }}>{b.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ padding:"20px 24px", background:"rgba(138,158,132,0.06)", borderRadius:4, borderLeft:"2px solid "+T.gold }}>
            <p style={{ fontFamily:T.serif, fontSize:20, fontStyle:"italic", color:T.gold, lineHeight:1.5, margin:0 }}>No tension = no story. No shift = no meaning.</p>
          </div>
        </div>
      );

      if (step === "Example") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12}}>Storytelling in the Wild</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:32}}>Four examples of stories that changed minds, moved markets, and shaped history.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <ExCard name="Barack Obama" preview="Obama doesn't open with policy. He opens with story."
              full={"Obama doesn't open with policy. He opens with story.\n\nHis 2004 DNC speech that launched his career:\n\"My father was a foreign student, born and raised in a small village in Kenya...\"\n\nHe spent 3 minutes on his family story before touching policy. Why? Because the story made the policy personal.\n\nPersonal narrative creates emotional connection before logical argument. By the time he said \"Only in America is my story possible,\" you were already invested.\n\nStart with the human story. Then connect it to the point. People remember stories. They forget statistics.\n\nThe strongest arguments begin with a story that makes the listener feel something before you ask them to think something."}/>
            <ExCard name="NASA's Earthrise" preview="1968. Apollo 8 orbited the moon. William Anders took one photo."
              full={"1968. Apollo 8 orbited the moon. William Anders took one photo: Earth rising over the lunar horizon.\n\nThat image — a fragile blue marble suspended in the void — launched the environmental movement.\n\nNo data. No arguments. Just one story told through an image.\n\nThe photo transported people into the astronaut's perspective. Suddenly, Earth wasn't an abstract concept. It was vulnerable. Worth protecting.\n\nFind the moment that changes perspective. That's your story's centre.\n\nThe most powerful stories don't argue. They transport. Show people a new view, and they'll draw their own conclusions."}/>
            <ExCard name="Surgeon Atul Gawande" preview="Gawande could publish dense medical papers. Instead, he tells stories."
              full={"Gawande could publish dense medical papers. Instead, he tells stories.\n\n\"The Checklist Manifesto\" wasn't a study. It was the story of how a simple checklist — inspired by airplane pilots — saved lives in operating rooms.\n\nOne surgeon. One problem. One solution. Changed medical practice globally.\n\nThe research was strong. But the story made it unforgettable. Doctors didn't adopt checklists because of data. They adopted them because they saw themselves in Gawande's story.\n\nLead with the person facing the problem. Show their struggle. Show the solution. Show the result.\n\nData informs. Stories transform. If you want people to act, give them a narrative they can see themselves in."}/>
            <ExCard name="The Cyber Attack" preview="A CISO needs budget for security. Facts alone won't convince the board."
              full={"A CISO needs budget for security. Facts alone won't convince the board.\n\nSo she tells a story:\n\n\"Last Tuesday at 3am, our systems went dark. For 6 hours, we couldn't process orders. We lost £2M in revenue. This could happen again tomorrow.\"\n\nStakes. Obstacle. Outcome. The board approved the budget.\n\nFacts say \"this could happen.\" Stories say \"this happened. To us. It will happen again.\" The narrative transported the board into the future threat.\n\nThree-act structure: what happened (Stakes), what went wrong (Obstacle), what it cost (Outcome).\n\nIn high-stakes decisions, stories create urgency that facts can't. Transport your audience into the future you're trying to prevent or create."}/>
            <ExCard name="The Pixar Framework" preview="Pixar used the same story structure for every film. It works because it mirrors how the human brain processes experience."
              full={"Pixar used the same story structure for every film. It works because it mirrors how the human brain processes experience.\n\nOnce upon a time… / Every day… / Until one day… / Because of that… / Because of that… / Until finally…\n\nSee it applied to a professional story about confidence in meetings:\n\n\"Once upon a time, I thought confidence meant sounding polished. Every day, I overprepared for meetings. Until one day, I completely froze. Because of that, I changed how I prepared. Because of that, I focused on clarity, not perfection. Until finally, people started listening.\"\n\nThe framework creates a predictable emotional arc. The brain anticipates each beat — and releases tension when it arrives. That release is what makes stories memorable.\n\nThis framework works for a boardroom pitch as well as it works for a Pixar film. Structure is what separates a story from a sequence of events."}/>
          </div>
        </div>
      );

      if (step === "Practice") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12}}>Build Your Story Arsenal</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:48}}>Practical exercises to craft stories that transport your audience.</p>

          {/* Exercise 1 — The 6-Beat Story Arc */}
          <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"40px",marginBottom:24}}>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Exercise 1</div>
            <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>The 6-Beat Story Arc</h3>
            <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,marginBottom:20,fontWeight:400}}>Map a real work situation to the 6-beat structure. AI assembles it into a story ready to tell.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"20px 24px",marginBottom:22,borderRadius:4}}>
              <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0}}>
                <strong style={{color:T2.text2}}>Setup:</strong> We were pitching a major client.<br/>
                <strong style={{color:T2.text2}}>Stakes:</strong> Losing meant layoffs.<br/>
                <strong style={{color:T2.text2}}>Obstacle:</strong> They said our price was too high.<br/>
                <strong style={{color:T2.text2}}>Choice:</strong> I proposed a pilot instead of a full contract.<br/>
                <strong style={{color:T2.text2}}>Outcome:</strong> They said yes. Full contract followed.<br/>
                <strong style={{color:T2.text2}}>Lesson:</strong> Sometimes you win by starting smaller.
              </p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
              {[["setup","1. Setup","What was the situation?"],["stakes","2. Stakes","What was at risk?"],["obstacle","3. Obstacle","What stood in the way?"],["choice","4. Choice","What did you decide?"],["outcome","5. Outcome","What happened?"],["lesson","6. Lesson","What did you learn?"]].map(([key,label,ph])=>(
                <div key={key}>
                  <label style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6,display:"block"}}>{label}</label>
                  <input type="text" value={storyBeats[key]} onChange={e=>setStoryBeats(b=>({...b,[key]:e.target.value}))} placeholder={ph} className="au-input" style={{height:"auto",padding:"12px 16px"}}/>
                </div>
              ))}
            </div>
            <button onClick={buildStory} disabled={storyLoading||!storyBeats.setup.trim()||!storyBeats.stakes.trim()} style={{padding:"13px 28px",borderRadius:4,border:"none",background:storyLoading||!storyBeats.setup.trim()||!storyBeats.stakes.trim()?"rgba(138,158,132,0.2)":T.ink,color:storyLoading||!storyBeats.setup.trim()||!storyBeats.stakes.trim()?T2.text3:T.bg,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s ease"}}>
              {storyLoading?"Building…":"Build My Story →"}
            </button>
            {storyResult && (
              <div style={{background:"rgba(138,158,132,0.1)",borderLeft:"4px solid "+T.gold,borderRadius:4,padding:"20px 24px",marginTop:20}}>
                <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"1.5px",color:T.gold,marginBottom:10}}>Your Story</div>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{storyResult}</p>
                <button onClick={()=>{setNtStory(storyResult);try{localStorage.setItem("au1_nt_story",storyResult);}catch(_){}}} style={{marginTop:14,padding:"9px 20px",borderRadius:3,border:"1px solid "+T.gold,background:"transparent",color:T.goldDark,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:T.sans}}>
                  Save for Simulation →
                </button>
              </div>
            )}
          </div>

          {/* Exercise 2 — Find the 5-Second Moment */}
          <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"40px",marginBottom:24}}>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Exercise 2</div>
            <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>Find the 5-Second Moment</h3>
            <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,marginBottom:20,fontWeight:400}}>Every great story has a 5-second moment of change. Find yours and make it vivid.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"20px 24px",marginBottom:22,borderRadius:4}}>
              <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0}}>
                "I was about to send the angry email. My finger hovered over Send. Then I closed my laptop and went for a walk instead."<br/>
                <strong style={{color:T2.text2}}>The 5-second moment:</strong> The choice to close the laptop.
              </p>
            </div>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Your Turn</div>
            <textarea value={momentInput} onChange={e=>setMomentInput(e.target.value)} placeholder="Describe the exact moment something changed..." className="au-input" style={{height:100,marginBottom:8,resize:"vertical"}}/>
            <p style={{fontFamily:T.sans,fontSize:16,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginBottom:20}}>This is the heart of your story. Make it vivid.</p>
            <button onClick={analyzeMoment} disabled={momentLoading||!momentInput.trim()} style={{padding:"13px 28px",borderRadius:4,border:"none",background:momentLoading||!momentInput.trim()?"rgba(138,158,132,0.2)":T.ink,color:momentLoading||!momentInput.trim()?T2.text3:T.bg,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s ease"}}>
              {momentLoading?"Analyzing…":"Analyze →"}
            </button>
            {momentResult && (
              <div style={{background:"rgba(138,158,132,0.1)",borderLeft:"4px solid "+T.gold,borderRadius:4,padding:"20px 24px",marginTop:20}}>
                <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"1.5px",color:T.gold,marginBottom:10}}>Moment Analysis</div>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0,whiteSpace:"pre-wrap"}}>{momentResult}</p>
              </div>
            )}
          </div>

          {/* Exercise 3 — The Before/After Test */}
          <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"40px",marginBottom:24}}>
            <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Exercise 3</div>
            <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:14}}>The Before/After Test</h3>
            <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,marginBottom:20,fontWeight:400}}>A story needs transformation. What was true before? What's true after? Clear transformation = memorable story.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"20px 24px",marginBottom:22,borderRadius:4}}>
              <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,margin:0}}>
                <strong style={{color:T2.text2}}>Before:</strong> "I thought success meant working 80-hour weeks."<br/>
                <strong style={{color:T2.text2}}>After:</strong> "Now I know it's about working on the right things."
              </p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              <div>
                <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Before</div>
                <textarea value={beforeInput} onChange={e=>setBeforeInput(e.target.value)} placeholder="What did you believe or do before?" className="au-input" style={{height:100,resize:"vertical"}}/>
              </div>
              <div>
                <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>After</div>
                <textarea value={afterInput} onChange={e=>setAfterInput(e.target.value)} placeholder="What do you believe or do now?" className="au-input" style={{height:100,resize:"vertical"}}/>
              </div>
            </div>
            <button onClick={testTransformation} disabled={baLoading||!beforeInput.trim()||!afterInput.trim()} style={{padding:"13px 28px",borderRadius:4,border:"none",background:baLoading||!beforeInput.trim()||!afterInput.trim()?"rgba(138,158,132,0.2)":T.ink,color:baLoading||!beforeInput.trim()||!afterInput.trim()?T2.text3:T.bg,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,transition:"all 0.2s ease"}}>
              {baLoading?"Testing…":"Test Transformation →"}
            </button>
            {baResult && (
              <div style={{background:"rgba(138,158,132,0.1)",borderLeft:"4px solid "+T.gold,borderRadius:4,padding:"20px 24px",marginTop:20}}>
                <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"1.5px",color:T.gold,marginBottom:10}}>Transformation Detected</div>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{baResult}</p>
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div style={{marginTop:48,paddingTop:40,borderTop:"1px solid rgba(138,158,132,0.2)"}}>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:24}}>Rules from Great Storytellers</h2>
            {["Start with stakes. \"Here's what was at risk.\"","Show the obstacle. No obstacle = no story.","Make the choice visible. \"I decided to...\"","End with the lesson. \"What I learned was...\"","Use \"I,\" not \"we.\" Personal stories land harder.","Sensory details make it real. What did you see, hear, feel?","Every professional story needs: stakes, obstacle, outcome."].map((tip,i,arr)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"14px 0",borderBottom:i<arr.length-1?"0.5px solid rgba(138,158,132,0.15)":"none"}}>
                <span style={{color:T.gold,fontSize:16,flexShrink:0,marginTop:2,fontWeight:700}}>✓</span>
                <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Rehearsal</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Now Practice Telling It</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:28 }}>You've built your story. Now practise telling it until it feels natural.</p>
          {ntStory ? (
            <div style={{ padding:"18px 20px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, marginBottom:24, borderLeft:"2px solid "+T.gold }}>
              <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:10 }}>Your Story</div>
              <p style={{ fontFamily:T.sans, fontSize:16, color:T2.text, lineHeight:1.7, fontWeight:400, margin:0 }}>{ntStory}</p>
            </div>
          ) : (
            <div style={{ padding:"16px 20px", background:T2.surface, borderRadius:4, marginBottom:24 }}>
              <p style={{ fontFamily:T.sans, fontSize:16, color:T2.text, lineHeight:1.7, fontWeight:400, fontStyle:"italic", margin:0 }}>No story saved yet — go back to Practice to build yours.</p>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
            {["Read your story aloud — at least once","Notice where you naturally pause","Feel the rhythm of the 6-beat arc","Time yourself — aim for under 2 minutes"].map((inst,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", border:"0.5px solid "+T.gold, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold }}>{i+1}</span>
                </div>
                <span style={{ fontFamily:T.sans, fontSize:16, color:T2.text, lineHeight:1.7, fontWeight:400 }}>{inst}</span>
              </div>
            ))}
          </div>
          <Timer totalSecs={180} label="Speak for up to 3 minutes"/>
          <div style={{ borderTop:"0.5px solid "+T2.divider, paddingTop:20, marginTop:24 }}>
            <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Checklist</div>
            {[{ key:"read", l:"I've read it aloud at least once" }, { key:"pause", l:"I've identified my natural pauses" }, { key:"time", l:"I can tell it in under 2 minutes" }].map((item,i) => {
              const [checked, setChecked] = useState(false);
              return (
                <div key={item.key} onClick={() => setChecked(c => !c)} style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 0", borderBottom:i<2?"0.5px solid "+T2.divider:"none", cursor:"pointer" }}>
                  <div style={{ width:20, height:20, borderRadius:4, border:"0.5px solid "+(checked?T.green:T2.border), background:checked?"rgba(82,112,96,0.1)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
                    {checked && <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l3 3 4-4" stroke={T.green} strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  </div>
                  <span style={{ fontFamily:T.sans, fontSize:16, color:checked?T2.text3:T2.text, lineHeight:1.7, fontWeight:400, transition:"color 0.2s" }}>{item.l}</span>
                </div>
              );
            })}
          </div>
        </div>
      );

      return null;
    };

    // ── Day 9 RightContent ──────────────────────────────────────────────────
    const D9RightContent = () => {
      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px" }}>
          <div style={{ ...RP_LABEL, color:T2.text3, marginBottom:8 }}>Delivery Masterclass</div>
          <h2 style={{ fontFamily:T.serif, fontSize:32, fontWeight:600, color:T2.text, letterSpacing:"-0.5px", lineHeight:1.15, marginBottom:20 }}>It's Not What You Say.<br/>It's How You Say It.</h2>
          <div style={{ padding:"16px 20px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, marginBottom:24 }}>
            <div style={{ ...RP_LABEL, color:T.goldDark, marginBottom:10 }}>The Mehrabian reality</div>
            <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text, lineHeight:1.7, fontWeight:300, margin:0 }}>While the famous "7%-38%-55%" rule has been misapplied, the core truth remains: when credibility is in question, delivery matters more than words.</p>
          </div>
          <div style={{ marginBottom:24 }}>
            <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text2, lineHeight:1.7, marginBottom:16 }}>Watch two people say the exact same sentence:</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ padding:"14px 16px", background:"rgba(139,74,56,0.05)", borderRadius:4, borderLeft:"2px solid rgba(139,74,56,0.3)" }}>
                <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text, lineHeight:1.6, margin:0 }}>One rushes. No pauses. Monotone. Eyes down.</p>
              </div>
              <div style={{ padding:"14px 16px", background:"rgba(138,158,132,0.05)", borderRadius:4, borderLeft:"2px solid "+T.gold }}>
                <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text, lineHeight:1.6, margin:0 }}>One slows down. Strategic pauses. Vocal variation. Eye contact.</p>
              </div>
            </div>
          </div>
          <div style={{ borderTop:"0.5px solid "+T2.divider, paddingTop:20, marginBottom:24 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[["Great content delivered poorly","= forgotten."],["Simple content delivered powerfully","= remembered."]].map(([a,b],i) => (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"baseline" }}>
                  <span style={{ fontFamily:T.serif, fontSize:15, fontStyle:"italic", color:T2.text2 }}>{a}</span>
                  <span style={{ fontFamily:T.serif, fontSize:15, fontWeight:600, color:i===0?T.red:T.gold }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontFamily:T.serif, fontSize:19, fontStyle:"italic", color:T.gold, lineHeight:1.5 }}>You already have the story. Now make it land.</p>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px" }}>
          <div style={{ ...RP_LABEL, color:T2.text3, marginBottom:8 }}>The 5 Ps</div>
          <h2 style={{ fontFamily:T.serif, fontSize:26, fontWeight:600, color:T2.text, letterSpacing:"-0.3px", marginBottom:20 }}>What Makes Delivery Powerful</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
            {D9_FIVE_PS.map((p,i) => (
              <div key={i} style={{ padding:"16px 18px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:6 }}>
                  <span style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, letterSpacing:"0.15em", textTransform:"uppercase" }}>{p.p}</span>
                  <span style={{ fontFamily:T.serif, fontSize:15, fontWeight:600, color:T2.text }}>{p.heading}</span>
                </div>
                <p style={{ fontFamily:T.sans, fontSize:12, color:T2.text, lineHeight:1.65, fontWeight:300, margin:0 }}>{p.body}</p>
                {p.quote && <p style={{ fontFamily:T.serif, fontSize:13, fontStyle:"italic", color:T2.text3, marginTop:8, margin:"8px 0 0" }}>{p.quote}</p>}
              </div>
            ))}
          </div>
          <p style={{ fontFamily:T.serif, fontSize:17, fontStyle:"italic", color:T.gold }}>Master these five. Deliver with impact.</p>
        </div>
      );

      if (step === "Example") {
        const CARDS_CONTENT = {
          brenebrown: (
            <div style={{ maxWidth:540, margin:"0 auto", padding:"0 20px" }}>
              <div style={{ fontFamily:T.sans, fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:T.gold, marginBottom:16 }}>The Power of Vulnerability in Delivery</div>
              <h2 style={{ fontFamily:T.serif, fontSize:30, fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:28 }}>She doesn't perform. She connects.</h2>
              <div style={{ padding:"20px 24px", borderLeft:"2px solid rgba(138,158,132,0.6)", marginBottom:28 }}>
                <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.65, margin:0 }}>"I had a therapist once who told me: 'Vulnerability is not weakness.' <span style={{color:T.gold}}>[PAUSE]</span> And that changed everything for me."</p>
              </div>
              {[["She doesn't perform. She connects.","Authenticity creates safety. When you're real, the room relaxes with you."],["Pauses let the emotion land.","She trusts the silence. She doesn't rush to fill it. The pause is part of the delivery."],["Conversational tone = immediate trust.","She speaks like she's talking to one person. Not an audience. One person."]].map(([h,b],i) => (
                <div key={i} style={{ marginBottom:16, paddingBottom:16, borderBottom:i<2?"1px solid rgba(255,255,255,0.07)":"none" }}>
                  <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:600, color:T.gold, marginBottom:4 }}>{h}</div>
                  <p style={{ fontFamily:T.serif, fontSize:14, color:"rgba(245,239,230,0.8)", lineHeight:1.7, margin:0 }}>{b}</p>
                </div>
              ))}
              <div style={{ padding:"14px 18px", background:"rgba(255,255,255,0.04)", borderRadius:4, borderLeft:"2px solid rgba(138,158,132,0.5)", marginTop:8 }}>
                <p style={{ fontFamily:T.serif, fontSize:15, fontStyle:"italic", color:"rgba(245,239,230,0.65)", margin:0 }}>Your takeaway: You don't need to be polished. You need to be real.</p>
              </div>
            </div>
          ),
          simonsinek: (
            <div style={{ maxWidth:540, margin:"0 auto", padding:"0 20px" }}>
              <div style={{ fontFamily:T.sans, fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:T.gold, marginBottom:16 }}>Start With Why — TED 2009</div>
              <h2 style={{ fontFamily:T.serif, fontSize:30, fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:28 }}>He slows down when the idea matters.</h2>
              <div style={{ padding:"20px 24px", borderLeft:"2px solid rgba(138,158,132,0.6)", marginBottom:28 }}>
                <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.65, margin:0 }}>"People don't buy what you do. They buy <span style={{color:T.gold}}>WHY</span> you do it. <span style={{color:T.gold}}>[PAUSE]</span> And what you do simply proves what you believe."</p>
              </div>
              {[["He slows down on the big idea.","The word WHY gets extra weight. Extra space. He makes you feel its importance before he explains it."],["Repetition builds rhythm.","'People don't buy what you do' appears multiple times. Repetition is a delivery tool, not a writing crutch."],["He lets the audience finish the thought.","The pauses are invitations. He creates space for the idea to form in your own mind."]].map(([h,b],i) => (
                <div key={i} style={{ marginBottom:16, paddingBottom:16, borderBottom:i<2?"1px solid rgba(255,255,255,0.07)":"none" }}>
                  <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:600, color:T.gold, marginBottom:4 }}>{h}</div>
                  <p style={{ fontFamily:T.serif, fontSize:14, color:"rgba(245,239,230,0.8)", lineHeight:1.7, margin:0 }}>{b}</p>
                </div>
              ))}
              <div style={{ padding:"14px 18px", background:"rgba(255,255,255,0.04)", borderRadius:4, borderLeft:"2px solid rgba(138,158,132,0.5)", marginTop:8 }}>
                <p style={{ fontFamily:T.serif, fontSize:15, fontStyle:"italic", color:"rgba(245,239,230,0.65)", margin:0 }}>Your takeaway: Slow down when the idea matters. Let them feel the weight.</p>
              </div>
            </div>
          ),
          amycuddy: (
            <div style={{ maxWidth:540, margin:"0 auto", padding:"0 20px" }}>
              <div style={{ fontFamily:T.sans, fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:T.gold, marginBottom:16 }}>Presence — TED 2012</div>
              <h2 style={{ fontFamily:T.serif, fontSize:30, fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:28 }}>Her body tells the story before she speaks.</h2>
              <div style={{ padding:"20px 24px", borderLeft:"2px solid rgba(138,158,132,0.6)", marginBottom:28 }}>
                <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.65, margin:0 }}>"Don't fake it till you make it. Fake it till you <span style={{color:T.gold, textTransform:"uppercase"}}>become</span> it." <span style={{color:T.gold}}>[Long pause. Eye contact.]</span></p>
              </div>
              {[["She embodies confidence before she speaks about it.","Her posture, her stillness, her eye contact — all signal the message before a word lands."],["The pause after 'BECOME it' is everything.","She lets that word sit. She doesn't soften it. She trusts the audience to feel its weight."],["Her body language reinforces every word.","Great delivery is never just vocal. Every part of you communicates."]].map(([h,b],i) => (
                <div key={i} style={{ marginBottom:16, paddingBottom:16, borderBottom:i<2?"1px solid rgba(255,255,255,0.07)":"none" }}>
                  <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:600, color:T.gold, marginBottom:4 }}>{h}</div>
                  <p style={{ fontFamily:T.serif, fontSize:14, color:"rgba(245,239,230,0.8)", lineHeight:1.7, margin:0 }}>{b}</p>
                </div>
              ))}
              <div style={{ padding:"14px 18px", background:"rgba(255,255,255,0.04)", borderRadius:4, borderLeft:"2px solid rgba(138,158,132,0.5)", marginTop:8 }}>
                <p style={{ fontFamily:T.serif, fontSize:15, fontStyle:"italic", color:"rgba(245,239,230,0.65)", margin:0 }}>Your takeaway: Your body tells the story too. Stand like you believe it.</p>
              </div>
            </div>
          ),
          stevejobs: (
            <div style={{ maxWidth:540, margin:"0 auto", padding:"0 20px" }}>
              <div style={{ fontFamily:T.sans, fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:T.gold, marginBottom:16 }}>iPhone Launch — 2007</div>
              <h2 style={{ fontFamily:T.serif, fontSize:30, fontWeight:600, color:"#F5EFE6", lineHeight:1.2, marginBottom:28 }}>He made the whole world lean forward.</h2>
              <div style={{ padding:"20px 24px", borderLeft:"2px solid rgba(138,158,132,0.6)", marginBottom:28 }}>
                <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:"#F5EFE6", lineHeight:1.8, margin:0 }}>"An iPod. <span style={{color:T.gold}}>[PAUSE]</span> A phone. <span style={{color:T.gold}}>[PAUSE]</span> An internet communicator. <span style={{color:T.gold}}>[PAUSE]</span> Are you getting it? These are not three separate devices."</p>
              </div>
              {[["Strategic pauses build anticipation.","Each pause creates a micro-tension. The audience is holding their breath. He knows it. He uses it."],["Repetition creates rhythm.","Three beats. Same structure. He's teaching the audience how to receive the reveal."],["Precision in language = clarity in impact.","'An iPod. A phone. An internet communicator.' — six words. Three concepts. Perfect precision."]].map(([h,b],i) => (
                <div key={i} style={{ marginBottom:16, paddingBottom:16, borderBottom:i<2?"1px solid rgba(255,255,255,0.07)":"none" }}>
                  <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:600, color:T.gold, marginBottom:4 }}>{h}</div>
                  <p style={{ fontFamily:T.serif, fontSize:14, color:"rgba(245,239,230,0.8)", lineHeight:1.7, margin:0 }}>{b}</p>
                </div>
              ))}
              <div style={{ padding:"14px 18px", background:"rgba(255,255,255,0.04)", borderRadius:4, borderLeft:"2px solid rgba(138,158,132,0.5)", marginTop:8 }}>
                <p style={{ fontFamily:T.serif, fontSize:15, fontStyle:"italic", color:"rgba(245,239,230,0.65)", margin:0 }}>Your takeaway: Don't rush the reveal. Make them lean in.</p>
              </div>
            </div>
          ),
        };
        const openD9Card = D9_CARDS.find(c => c.id === d9OpenCard);
        return (
          <>
            {openD9Card && (
              <div style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(14,11,8,0.97)", backdropFilter:"blur(12px)", overflowY:"auto", animation:"fadeIn 0.25s ease both" }}>
                <button onClick={() => setD9OpenCard(null)} style={{ position:"fixed", top:20, right:24, width:40, height:40, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.18)", background:"rgba(14,11,8,0.7)", backdropFilter:"blur(8px)", color:"rgba(255,255,255,0.7)", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.sans, zIndex:10 }}>×</button>
                <div style={{ padding:"96px 24px 72px", display:"flex", flexDirection:"column", alignItems:"center", animation:"fadeUp 0.3s ease both" }}>
                  {CARDS_CONTENT[openD9Card.id]}
                  <div style={{ textAlign:"center", marginTop:36 }}>
                    <button onClick={() => setD9OpenCard(null)} style={{ padding:"10px 24px", borderRadius:4, border:"1px solid rgba(255,255,255,0.2)", background:"transparent", color:"rgba(245,239,230,0.6)", fontSize:12, cursor:"pointer", fontFamily:T.sans }}>← Back to examples</button>
                  </div>
                </div>
              </div>
            )}
            <div key={idx} className="au-step-enter" style={{ padding:"44px 52px" }}>
              <h2 style={{ fontFamily:T.serif, fontSize:28, fontWeight:600, color:T2.text, letterSpacing:"-0.3px", textAlign:"center", marginBottom:8 }}>Learn from the Best</h2>
              <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text3, textAlign:"center", fontStyle:"italic", marginBottom:28, fontWeight:300 }}>Click to explore how world-class speakers deliver</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {D9_CARDS.map(card => (
                  <button key={card.id} onClick={() => setD9OpenCard(card.id)}
                    style={{ padding:"20px 18px", borderRadius:4, border:"0.5px solid "+T2.border, background:T2.surface, cursor:"pointer", textAlign:"left", transition:"all 0.2s ease", minHeight:100 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.background = "rgba(138,158,132,0.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T2.border; e.currentTarget.style.background = T2.surface; }}
                  >
                    <div style={{ fontFamily:T.serif, fontSize:16, fontWeight:600, color:T2.text, marginBottom:4 }}>{card.title}</div>
                    <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:600, color:T.goldDark, marginBottom:8 }}>{card.sub}</div>
                    <div style={{ fontFamily:T.sans, fontSize:11, color:T2.text3, lineHeight:1.5, fontStyle:"italic" }}>{card.tag}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        );
      }

      if (step === "Practice") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px" }}>
          <div style={{ ...RP_LABEL, color:T2.text3, marginBottom:8 }}>AI Delivery Coach</div>
          <h2 style={{ fontFamily:T.serif, fontSize:26, fontWeight:600, color:T2.text, letterSpacing:"-0.3px", marginBottom:6 }}>Polish Your Delivery</h2>
          <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text3, lineHeight:1.7, fontWeight:300, marginBottom:24 }}>Your story from Module 1 is loaded. Work through 5 delivery refinements — each one makes your story land harder.</p>
          <DeliveryCoachWidget onSave={s => { setD9Script(s); try { localStorage.setItem("au1_d9_script", s); } catch(_){} }}/>
        </div>
      );

      if (step === "Simulation") {
        const [mode, setMode] = useState("solo");
        return (
          <div key={idx} className="au-step-enter" style={{ padding:"44px 52px" }}>
            <div style={{ ...RP_LABEL, color:T2.text3, marginBottom:8 }}>Performance Practice</div>
            <h2 style={{ fontFamily:T.serif, fontSize:26, fontWeight:600, color:T2.text, letterSpacing:"-0.3px", marginBottom:20 }}>Deliver with Confidence</h2>
            {d9Script ? (
              <div style={{ padding:"14px 18px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, marginBottom:20, borderLeft:"2px solid "+T.gold, maxHeight:160, overflowY:"auto" }}>
                <div style={{ ...RP_LABEL, color:T.goldDark, marginBottom:8 }}>Your Delivery Script</div>
                <p style={{ fontFamily:T.serif, fontSize:13, color:T2.text, lineHeight:1.75, margin:0, whiteSpace:"pre-wrap" }}>{d9Script}</p>
              </div>
            ) : (
              <div style={{ padding:"12px 16px", background:T2.surface, borderRadius:4, marginBottom:20 }}>
                <p style={{ fontFamily:T.sans, fontSize:12, color:T2.text3, fontStyle:"italic", margin:0 }}>Go back to Practice to prepare your delivery script first.</p>
              </div>
            )}
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              {[["solo","Solo Rehearsal"],["highstakes","High-Stakes (90s)"]].map(([id,label]) => (
                <button key={id} onClick={() => setMode(id)} style={{ flex:1, padding:"9px 12px", borderRadius:4, border:"0.5px solid "+(mode===id?T.gold:T2.border), background:mode===id?"rgba(138,158,132,0.07)":"transparent", color:T2.text, fontSize:12, cursor:"pointer", fontFamily:T.sans, fontWeight:mode===id?500:400 }}>{label}</button>
              ))}
            </div>
            {mode === "solo" && (
              <>
                <Timer totalSecs={180} label="3 minutes — speak aloud"/>
                <div style={{ borderTop:"0.5px solid "+T2.divider, paddingTop:16, marginTop:16 }}>
                  <div style={{ ...RP_LABEL, color:T2.text3, marginBottom:10 }}>Checklist</div>
                  {["I honored the pauses","I slowed down on key ideas","I felt grounded and present"].map((item,i) => {
                    const [checked, setChecked] = useState(false);
                    return (
                      <div key={i} onClick={() => setChecked(c=>!c)} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:i<2?"0.5px solid "+T2.divider:"none", cursor:"pointer" }}>
                        <div style={{ width:20, height:20, borderRadius:4, border:"0.5px solid "+(checked?T.green:T2.border), background:checked?"rgba(82,112,96,0.1)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {checked && <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l3 3 4-4" stroke={T.green} strokeWidth="1.5" strokeLinecap="round"/></svg>}
                        </div>
                        <span style={{ fontFamily:T.serif, fontSize:14, color:T2.text }}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {mode === "highstakes" && (
              <>
                <div style={{ padding:"12px 16px", background:"rgba(139,74,56,0.05)", borderRadius:4, border:"0.5px solid rgba(139,74,56,0.2)", marginBottom:16 }}>
                  <p style={{ fontFamily:T.serif, fontSize:14, fontStyle:"italic", color:T2.text, lineHeight:1.6, margin:0 }}>"You have 90 seconds to deliver this to a CEO. The clock is running."</p>
                </div>
                <Timer totalSecs={90} label="90 seconds — under pressure"/>
              </>
            )}
            <div style={{ borderTop:"0.5px solid "+T2.divider, paddingTop:16, marginTop:20 }}>
              <div style={{ ...RP_LABEL, color:T2.text3, marginBottom:10 }}>Coaching Reminders</div>
              {["Breathe before you begin","Stand still — movement dilutes presence","If you lose your place, pause. Don't rush.","Deliver to one imaginary person, not a crowd"].map((tip,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:i<3?"0.5px solid "+T2.divider:"none" }}>
                  <div style={{ width:4, height:4, borderRadius:"50%", background:T.gold, flexShrink:0 }}/>
                  <span style={{ fontFamily:T.sans, fontSize:13, color:T2.text2, fontWeight:300 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return null;
    };

    const D2RightContent = () => {
      const [d2InsightOpen, setD2InsightOpen] = useState(null);
      const [d2TheoryOpen, setD2TheoryOpen] = useState(null);

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>The Way You Speak Changes the Way People Listen</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:36, maxWidth:600 }}>Your voice is more than sound — it's one of your most powerful communication tools.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
            {D2_INSIGHT_CARDS.map((n,i) => {
              const open = d2InsightOpen===i;
              return (
                <div key={i} onClick={()=>setD2InsightOpen(open?null:i)} className="au-lift"
                  style={{ padding:"22px 24px", background:T2.surface, borderRadius:4, border:`0.5px solid ${open?T.gold:T2.border}`, cursor:"pointer", transition:"border-color 0.2s, box-shadow 0.2s, transform 0.2s" }}
                  onMouseEnter={e=>{ if(!open){e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.boxShadow="0 4px 20px rgba(138,158,132,0.22), 0 1px 6px rgba(138,158,132,0.12)";} }}
                  onMouseLeave={e=>{ if(!open){e.currentTarget.style.borderColor=T2.border;e.currentTarget.style.boxShadow="none";} }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:open?10:6 }}>
                    <div style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T.gold, lineHeight:1.3 }}>{n.word}</div>
                    <span style={{ fontFamily:T.sans, fontSize:16, color:open?T.gold:"rgba(138,158,132,0.7)", marginLeft:10, flexShrink:0, marginTop:2, transition:"color 0.2s" }}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, lineHeight:1.5, fontWeight:400, margin:open?"0 0 14px":0 }}>{n.sub}</p>
                  {open && (
                    <div style={{ borderTop:"0.5px solid "+T2.divider, paddingTop:14, display:"flex", flexDirection:"column", gap:8 }}>
                      {n.bullets.map((b,j)=>(
                        <div key={j} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                          <div style={{ width:4, height:4, borderRadius:"50%", background:T.gold, flexShrink:0, marginTop:6 }}/>
                          <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text, lineHeight:1.65, fontWeight:400, margin:0 }}>{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontFamily:T.sans, fontSize:16, color:T.gold, lineHeight:1.7, fontWeight:400, fontStyle:"italic" }}>Your voice is your most underused communication tool. Start using it deliberately.</p>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>The Science</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>The 88 Keys</h2>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold, marginBottom:28 }}>
            <p style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T2.text, lineHeight:1.4, margin:0, fontStyle:"italic" }}>"Your voice is a piano with 88 keys. You've been playing the same 5 your whole life."</p>
          </div>
          <div style={{ fontSize:11, fontWeight:600, color:T.goldDark, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:14, fontFamily:T.sans }}>The Science of Vocal Influence</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
            {[
              {label:"Prosody",            sub:"Your voice carries meaning before words do",    bullets:["Humans decode emotion through rhythm, pitch, pace, and stress — faster than language itself.","The way you say something communicates intent, confidence, and feeling before the content registers."]},
              {label:"Processing Fluency", sub:"Easy to hear = easy to trust",                  bullets:["Clear, varied, well-paced speech signals intelligence. The brain equates 'easy to process' with credibility.","Flat or rushed delivery creates cognitive friction — and the listener associates that friction with the speaker, not the content."]},
              {label:"Vocal Contrast",     sub:"Variation is what keeps people in the room",   bullets:["The same reason music works: contrast creates anticipation and emotional engagement.","No variation in voice is cognitive wallpaper — it fades into the background within seconds, no matter how important the message."]},
            ].map((sc,i)=>{
              const open = d2TheoryOpen===i;
              return (
                <div key={i} onClick={()=>setD2TheoryOpen(open?null:i)} className="au-lift"
                  style={{ padding:"18px 20px", background:T2.surface, borderRadius:4, border:`0.5px solid ${open?T.gold:T2.border}`, cursor:"pointer", transition:"border-color 0.2s, box-shadow 0.2s, transform 0.2s" }}
                  onMouseEnter={e=>{ if(!open){e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.boxShadow="0 4px 20px rgba(138,158,132,0.22), 0 1px 6px rgba(138,158,132,0.12)";} }}
                  onMouseLeave={e=>{ if(!open){e.currentTarget.style.borderColor=T2.border;e.currentTarget.style.boxShadow="none";} }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:open?8:6 }}>
                    <div style={{ fontFamily:T.serif, fontSize:18, fontWeight:600, color:T.gold, lineHeight:1.3 }}>{sc.label}</div>
                    <span style={{ fontFamily:T.sans, fontSize:16, color:open?T.gold:"rgba(138,158,132,0.7)", marginLeft:8, flexShrink:0, marginTop:2, transition:"color 0.2s" }}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text3, lineHeight:1.5, fontWeight:400, margin:open?"0 0 12px":0 }}>{sc.sub}</p>
                  {open && (
                    <div style={{ borderTop:"0.5px solid "+T2.divider, paddingTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                      {sc.bullets.map((b,j)=>(
                        <div key={j} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                          <div style={{ width:4, height:4, borderRadius:"50%", background:T.gold, flexShrink:0, marginTop:6 }}/>
                          <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text, lineHeight:1.65, fontWeight:300, margin:0 }}>{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize:11, fontWeight:600, color:T.goldDark, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:14, fontFamily:T.sans }}>The Four Levers</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:32 }}>
            {[
              {word:"Pace",  body:"Speed up to create energy. Slow down to signal importance."},
              {word:"Pitch", body:"Rise to engage. Drop to command."},
              {word:"Pause", body:"The silence that makes the next word hit harder."},
              {word:"Power", body:"Volume as intention, not volume as effort."},
            ].map((n,i)=>(
              <div key={i} style={{ padding:"18px 20px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.serif, fontSize:20, fontWeight:600, color:T.gold, marginBottom:8 }}>{n.word}</div>
                <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text, lineHeight:1.65, fontWeight:300, margin:0 }}>{n.body}</p>
              </div>
            ))}
          </div>
          <div style={{ background:T2.cardDark, borderRadius:8, padding:"28px 32px" }}>
            <div style={{ fontSize:11, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12, fontFamily:T.sans }}>Hear the Difference</div>
            <p style={{ fontFamily:T.serif, fontSize:24, fontWeight:600, color:"rgba(245,239,230,0.9)", marginBottom:20, lineHeight:1.3 }}>"I think this could work."</p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20 }}>
              {["Fast","Slow","High Pitch","Low Pitch","Monotone","Warm / Confident"].map((label,i)=>(
                <button key={i} style={{
                  background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
                  borderRadius:6, padding:"10px 18px", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:8,
                  fontFamily:T.sans,
                }}>
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(138,158,132,0.8)" strokeWidth="1.2"/><path d="M5.5 4.5l4 2.5-4 2.5V4.5z" fill="rgba(138,158,132,0.8)"/></svg>
                  <span style={{ fontSize:13, color:"rgba(245,239,230,0.7)", fontWeight:500 }}>{label}</span>
                </button>
              ))}
            </div>
            <div style={{ borderTop:"0.5px solid rgba(255,255,255,0.08)", paddingTop:16 }}>
              <p style={{ fontFamily:T.serif, fontSize:16, fontStyle:"italic", color:T.gold, margin:0, lineHeight:1.6 }}>What changed? Not the words. The meaning.</p>
            </div>
          </div>
        </div>
      );

      if (step === "Practice") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Train Your Instrument</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:560 }}>Voice requires repetition. Work through each exercise, then take the speed challenge.</p>
          <D2PracticeWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Real-World Voice Coaching</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:560 }}>Pick a scenario. Write what you'd say. Your AI coach evaluates your delivery across six dimensions.</p>
          <D2SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Example") {
        const D2_EX_CARDS = [
          {id:0, name:"Robin Williams", headline:"The Master of Vocal Range",
           sub:"From the explosive Genie in Aladdin to the emotional stillness of Good Will Hunting — he transformed how a message felt using only his voice.",
           quote:'"No matter what people tell you, words and ideas can change the world."',
           levers:[{k:"Pace",v:"Rapid-fire energy or slow emotional weight"},{k:"Pitch",v:"Playful highs to grounded seriousness"},{k:"Tone",v:"Humour, warmth, intensity, vulnerability"},{k:"Pauses",v:"Creating anticipation, emotion, and impact"}],
           lesson:"Range creates engagement. Contrast creates emotion. A flat voice fades. A dynamic voice keeps people listening.",
           challenge:{sentence:'"Ah... now this is where things get interesting."',modes:["Playful Genie energy","Thoughtful mentor","Urgent excitement","Calm inspiration"]}},
          {id:1, name:"Meryl Streep", headline:"The Master of Precision and Presence",
           sub:"Three iconic roles. Three completely different voices. Streep proves that the most powerful communicators don't get louder — they get more precise.",
           quote:'"Take your broken heart, make it into art."',
           levers:[{k:"Pace",v:"Deliberate control or sharp urgency"},{k:"Pitch",v:"Subtle tonal shifts that change emotional meaning"},{k:"Tone",v:"Authority, vulnerability, wit, empathy, strength"},{k:"Pauses",v:"Creating tension, emphasis, and dramatic impact"}],
           lesson:"Precision creates presence. Control creates impact. A rushed voice can feel uncertain. An intentional voice commands attention.",
           challenge:{sentence:'"This moment matters more than you think."',modes:["Sharp executive authority","Calm conviction","Warm encouragement","Emotionally vulnerable"]}},
        ];
        const [d2ExOpen, setD2ExOpen] = useState(null);
        return (
          <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
            <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Voice in Action</h2>
            <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:640 }}>Two masters of vocal craft — and what they can teach you about range, control, and deliberate delivery.</p>
            {/* Row 1: both person cards — grid equalises heights automatically */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:0 }}>
              {D2_EX_CARDS.map((card)=>{
                const open = d2ExOpen===card.id;
                return (
                  <div key={card.id} onClick={()=>setD2ExOpen(open?null:card.id)} className="au-lift"
                    style={{ background:T2.surface, borderRadius:4, border:`0.5px solid ${open?T.gold:T2.border}`, padding:"24px", cursor:"pointer", transition:"border-color 0.2s, box-shadow 0.2s, transform 0.2s" }}
                    onMouseEnter={e=>{ if(!open){e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.boxShadow="0 4px 20px rgba(138,158,132,0.22), 0 1px 6px rgba(138,158,132,0.12)";} }}
                    onMouseLeave={e=>{ if(!open){e.currentTarget.style.borderColor=T2.border;e.currentTarget.style.boxShadow="none";} }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <h3 style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T.gold, lineHeight:1.2, margin:0 }}>{card.name}</h3>
                      <span style={{ fontFamily:T.sans, fontSize:16, color:open?T.gold:"rgba(138,158,132,0.7)", marginLeft:10, flexShrink:0, transition:"color 0.2s" }}>{open?"▴":"▸"}</span>
                    </div>
                    <p style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T2.text3, textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>{card.headline}</p>
                    <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, lineHeight:1.65, fontWeight:300, margin:open?"0 0 20px":0 }}>{card.sub}</p>
                    {open && (
                      <div style={{ borderTop:"0.5px solid "+T2.divider, paddingTop:18 }}>
                        <p style={{ fontFamily:T.serif, fontSize:16, fontStyle:"italic", color:T2.text2, lineHeight:1.6, marginBottom:16, borderLeft:"2px solid "+T.gold, paddingLeft:14 }}>{card.quote}</p>
                        <div style={{ marginBottom:14 }}>
                          {card.levers.map((l,i)=>(
                            <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                              <span style={{ fontFamily:T.sans, fontSize:11, fontWeight:700, color:T.gold, flexShrink:0 }}>{l.k} →</span>
                              <span style={{ fontFamily:T.sans, fontSize:13, color:T2.text, lineHeight:1.5 }}>{l.v}</span>
                            </div>
                          ))}
                        </div>
                        <p style={{ fontFamily:T.serif, fontSize:15, fontStyle:"italic", color:T.gold, lineHeight:1.6, margin:0 }}>{card.lesson}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Row 2: connectors */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {D2_EX_CARDS.map((card)=>(
                <div key={card.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"6px 0" }}>
                  <div style={{ width:1, height:14, background:T.gold, opacity:0.4 }}/>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke={T.gold} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/></svg>
                </div>
              ))}
            </div>
            {/* Row 3: both challenge cards — aligned */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {D2_EX_CARDS.map((card)=>(
                <div key={card.id} style={{ background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, padding:"20px 22px" }}>
                  <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:10 }}>Voice Challenge</div>
                  <p style={{ fontFamily:T.serif, fontSize:15, fontWeight:600, color:T2.text, fontStyle:"italic", marginBottom:12 }}>Say: {card.challenge.sentence}</p>
                  <div style={{ display:"flex", flexDirection:"column" }}>
                    {card.challenge.modes.map((m,i,arr)=>(
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<arr.length-1?"0.5px solid "+T2.divider:"none" }}>
                        <span style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, width:14, flexShrink:0 }}>{i+1}.</span>
                        <span style={{ fontFamily:T.sans, fontSize:13, color:T2.text, fontWeight:400 }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>The Way You Speak Changes the Way People Listen</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:640 }}>Your voice is more than sound — it's one of your most powerful communication tools. The way you speak shapes how your ideas land, how your energy is felt, and how memorable your message becomes.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {[
              {word:"Attention",       body:"A flat voice fades into the background fast. Variation in pace, tone, and emphasis keeps the brain alert and signals that what you're saying matters."},
              {word:"First Impression",body:"Listeners form an impression of confidence, energy, and credibility within moments of hearing you speak. Your delivery shapes the room before your message even begins."},
              {word:"Memory",          body:"When delivery has contrast — pauses, pace shifts, vocal emphasis — the brain finds the message easier to process, store, and remember."},
              {word:"Influence",       body:"The exact same sentence can sound inspiring, uncertain, authoritative, or disengaged depending entirely on delivery. Voice doesn't decorate meaning — it creates it."},
            ].map((n,i)=>(
              <div key={i} style={{ padding:"22px 24px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T.gold, lineHeight:1.3, marginBottom:10 }}>{n.word}</div>
                <p style={{ fontFamily:T.sans, fontSize:16, color:T2.text, lineHeight:1.7, fontWeight:400, margin:0 }}>{n.body}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:T.sans, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.7 }}>Your voice is your most underused communication tool. Start using it deliberately.</p>
        </div>
      );
      return <RightContent/>;
    };

    const D5RightContent = () => {
      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Why Structure Wins</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:600 }}>Structure is how you organise your thinking before you speak. PRE helps you do that: start with your point, explain why it matters, then bring it to life with an example.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {[
              {word:"Credibility",     body:"Leading with your point signals clear thinking. Structured communication creates immediate credibility and helps your ideas land with confidence and authority."},
              {word:"Recall",          body:"Structured messages are 40% more memorable. A clear beginning, middle and end helps your audience store and retrieve your message with ease."},
              {word:"Persuasion",      body:"Great ideas rarely persuade on their own — structure is what makes them land. PRE helps you present a clear point, support it with logic, and reinforce it with proof that moves people to action."},
              {word:"Decision Speed",  body:"Leaders decide faster when communication is structured. Lead with your point and you accelerate every conversation you're in."},
            ].map((n,i)=>(
              <div key={i} style={{ padding:"22px 24px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T.gold, lineHeight:1.3, marginBottom:10 }}>{n.word}</div>
                <p style={{ fontFamily:T.sans, fontSize:16, color:T2.text, lineHeight:1.7, fontWeight:400, margin:0 }}>{n.body}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:T.sans, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.7 }}>Structure is the backbone of every powerful communication.</p>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>The Science</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>The PRE Framework</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:28, maxWidth:640 }}>Two powerful findings from memory science explain exactly why PRE works — and why it's one of the most reliable communication frameworks available.</p>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold, marginBottom:28 }}>
            <p style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T2.text, lineHeight:1.4, margin:0 }}>People remember the beginning and end of information most clearly. The middle is forgotten.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {[
              {n:"Point",    role:"Strong opening anchor",    body:"Lead with your conclusion. The brain locks onto the first thing it hears — give it something worth remembering."},
              {n:"Reason",   role:"Cognitive bridge",          body:"Connect your point to meaning. This is how you make the idea stick — not just land."},
              {n:"Example",  role:"Memorable closing proof",   body:"Finish with evidence. The recency effect means your example is the last thing heard — and the most recalled."},
              {n:"Processing Fluency", role:"The multiplier", body:"Clear, easy-to-follow ideas are perceived as more intelligent, credible, and persuasive. PRE delivers that clarity every time."},
            ].map((b,i)=>(
              <div key={i} style={{ padding:"20px 22px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6 }}>{b.n}</div>
                <div style={{ fontFamily:T.serif, fontSize:18, fontWeight:600, color:T2.text, marginBottom:8 }}>{b.role}</div>
                <p style={{ fontFamily:T.sans, fontSize:15, color:T2.text3, lineHeight:1.65, fontWeight:300, margin:0 }}>{b.body}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:T.sans, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.7 }}>PRE isn't just structure — it's how the brain naturally wants to receive information.</p>
        </div>
      );

      if (step === "Practice") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold, marginBottom:32 }}>
            <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:T2.text, lineHeight:1.6, margin:0 }}>"If you can explain everyday decisions using PRE, you'll be able to use it in meetings, interviews, presentations, and high-stakes conversations without thinking."</p>
          </div>
          <D5PracticeWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Example") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>PRE in Action</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:40, maxWidth:640 }}>Two of the world's most effective communicators — whether they name it or not, both use PRE every time.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            {[
              {name:"Indra Nooyi",role:"CEO of PepsiCo",
                point:'"Performance must be married with purpose."',
                reason:'"The world around us is changing. Consumers are changing. Governments are changing. Society is changing."',
                example:'"At PepsiCo, we\'ve transformed our portfolio, reducing sugar, sodium and saturated fat, while investing in sustainability and our people."',
                proof:"At PepsiCo this became tangible action: healthier product innovation, reducing sugar, salt and fat, sustainability initiatives, packaging redesign, and environmental commitments. She didn't leave it as philosophy — she operationalised it.",
                lesson:"Point → big strategic belief. Reason → why the market demands it. Example → concrete execution. That's why she feels persuasive, intelligent, and trustworthy."},
              {name:"Jensen Huang",role:"Founder of Nvidia",
                point:'"I don\'t need to build a killer product overnight, I just need to build a winning product."',
                reason:'"And the goal of winning is so that you can play again."',
                example:'"It\'s just like pinball. If you could just play well enough to get another game, you could be there for a long time."',
                proof:"NVIDIA itself — for years, GPUs were niche, gaming seemed narrow, and AI wasn't commercially obvious. NVIDIA kept making bets and staying in the game until one breakthrough arrived: AI and accelerated computing. That single win transformed NVIDIA into one of the most valuable companies on earth.",
                lesson:"Said in 1993 — decades before the breakthrough that proved it true. Sharp thesis. Strategic rationale. Lived proof. That's what powerful communicators do."},
            ].map((card,ci)=>(
              <div key={ci} style={{ background:"white", borderRadius:8, padding:"32px", boxShadow:"0 2px 8px rgba(44,36,22,0.07), 0 8px 24px rgba(44,36,22,0.04)" }}>
                <h3 style={{ fontFamily:T.serif, fontSize:24, fontWeight:600, color:T2.text, marginBottom:4, letterSpacing:"-0.2px" }}>{card.name}</h3>
                <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text3, marginBottom:24, fontWeight:400 }}>{card.role}</p>
                {[{label:"Point",text:card.point},{label:"Reason",text:card.reason},{label:"Example",text:card.example}].map((block,i)=>(
                  <div key={i} style={{ marginBottom:20 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:T.sans, marginBottom:8 }}>{block.label}</div>
                    <p style={{ fontFamily:T.serif, fontSize:17, fontStyle:"italic", color:T2.text, lineHeight:1.65, fontWeight:400, margin:0 }}>{block.text}</p>
                  </div>
                ))}
                {card.proof && (
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:T.sans, marginBottom:8 }}>{card.name === "Jensen Huang" ? "Nvidia Is The Proof" : "PepsiCo Is The Proof"}</div>
                    <p style={{ fontFamily:T.sans, fontSize:15, color:T2.text, lineHeight:1.7, fontWeight:300, margin:0 }}>{card.proof}</p>
                  </div>
                )}
                <div style={{ borderTop:"0.5px solid rgba(138,158,132,0.2)", paddingTop:18, marginTop:4 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:T.sans, marginBottom:8 }}>Why This Works</div>
                  <p style={{ fontFamily:T.serif, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.65, margin:0 }}>{card.lesson}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      return <RightContent/>;
    };

    const D6RightContent = () => {
      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Why Composure Wins</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Stay Calm Under Pressure</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:600 }}>Most people communicate well when conversations are easy. But promotions, relationships, leadership, and trust are often shaped in moments of tension.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {[
              {word:"Emotion",    body:"Stress narrows thinking and makes reactive communication more likely. Composure is the skill that keeps your thinking wide open when it matters most."},
              {word:"Perception", body:"When others escalate, composure becomes a signal of leadership. Calm in the room reads as confidence — and earns instant credibility."},
              {word:"Influence",  body:"Your emotional state affects everyone around you. Calm is contagious. The steadiest person in a difficult conversation shapes the entire dynamic."},
              {word:"Outcome",    body:"Anyone can communicate well when things are easy. The conversations that shape your reputation, your relationships, and your career happen under pressure."},
            ].map((n,i) => (
              <div key={i} style={{ padding:"22px 24px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T.gold, lineHeight:1.3, marginBottom:10 }}>{n.word}</div>
                <p style={{ fontFamily:T.sans, fontSize:16, color:T2.text, lineHeight:1.7, fontWeight:400, margin:0 }}>{n.body}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:T.sans, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.7 }}>Composure is communication under pressure.</p>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>The Science of Composure</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>What Happens Under Pressure</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:28, maxWidth:640 }}>High-stakes conversations trigger biology before logic. Elite communicators understand the mechanics — and train to override them.</p>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold, marginBottom:28 }}>
            <p style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T2.text, lineHeight:1.4, margin:0 }}>The strongest communicator is often the calmest person in the room.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {[
              {n:"Threat Response",        role:"Biology before logic",       body:"Criticism, conflict, and disagreement can trigger the same fight-or-flight response as physical threat — faster speech, defensive tone, poor listening, impulsive reactions."},
              {n:"Emotional Regulation",   role:"Pause before performance",   body:"The best communicators regulate emotion before they respond. Breathe lower. Slow your pace. Use shorter responses. Let strategic silence do the work."},
              {n:"Framing",               role:"Language changes temperature", body:"'You're wrong' escalates. 'I see this differently' opens space. The same disagreement, framed calmly, reaches a completely different outcome."},
              {n:"Listening",             role:"Being heard starts with hearing", body:"People de-escalate when they feel understood. Composure includes listening — not waiting to respond, but genuinely hearing what the other person is saying."},
            ].map((b,i) => (
              <div key={i} style={{ padding:"20px 22px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6 }}>{b.n}</div>
                <div style={{ fontFamily:T.serif, fontSize:18, fontWeight:600, color:T2.text, marginBottom:8 }}>{b.role}</div>
                <p style={{ fontFamily:T.sans, fontSize:15, color:T2.text3, lineHeight:1.65, fontWeight:300, margin:0 }}>{b.body}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:T.sans, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.7 }}>Composure isn't the absence of pressure — it's what you build so pressure doesn't change you.</p>
        </div>
      );

      if (step === "Practice") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold, marginBottom:32 }}>
            <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:T2.text, lineHeight:1.6, margin:0 }}>"The phrases that work best under pressure are the ones you've practised until they feel natural — not rehearsed."</p>
          </div>
          <D6PracticeWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Real-World Conversation Coaching</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:640 }}>Choose a high-stakes scenario. Write your response. Your coach evaluates composure, clarity, empathy, and executive presence.</p>
          <D6SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Example") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Masters Under Pressure</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:40, maxWidth:640 }}>Two communicators whose influence grew not despite difficult moments — but because of how they handled them.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            {[
              {name:"Barack Obama", role:"44th President of the United States",
               headline:"Measured Under Fire",
               quote:'"If you\'re walking down the right path and you\'re willing to keep walking, eventually you\'ll make progress."',
               year:"2008",
               what:["deliberate pace","controlled tone","emotional restraint","strategic pauses","executive calm"],
               lesson:"Pressure rewards composure. Obama's communication style demonstrated that you can engage with the hardest questions without being destabilised by them.",
               practice:['"I understand your concern, but I see it differently."',"Say it: defensive → calm → dismissive → composed authority"]},
              {name:"Brené Brown", role:"Research Professor & Author",
               headline:"Strength Through Vulnerability",
               quote:'"Clear is kind."',
               year:"Daring Greatly, 2012",
               what:["warmth without weakness","honest delivery","grounded presence","emotional steadiness"],
               lesson:"Clarity and empathy can coexist. Difficult conversations often land better — not softer — when directness replaces avoidance.",
               practice:['"I wanted to raise something difficult."',"Say it: nervous → compassionate → overly apologetic → clear and calm"]},
            ].map((card,ci) => (
              <div key={ci} style={{ background:"white", borderRadius:8, padding:"32px", boxShadow:"0 2px 8px rgba(44,36,22,0.07), 0 8px 24px rgba(44,36,22,0.04)" }}>
                <h3 style={{ fontFamily:T.serif, fontSize:24, fontWeight:600, color:T2.text, marginBottom:2, letterSpacing:"-0.2px" }}>{card.name}</h3>
                <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text3, marginBottom:6, fontWeight:400 }}>{card.role}</p>
                <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:16 }}>{card.headline}</div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:T.sans, marginBottom:8 }}>Quote</div>
                  <p style={{ fontFamily:T.serif, fontSize:17, fontStyle:"italic", color:T2.text, lineHeight:1.65, fontWeight:400, margin:0 }}>{card.quote}</p>
                  <p style={{ fontFamily:T.sans, fontSize:12, color:T2.text3, marginTop:6, marginBottom:0 }}>{card.year}</p>
                </div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:T.sans, marginBottom:8 }}>What makes it powerful</div>
                  {card.what.map((w,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <div style={{ width:3, height:3, borderRadius:"50%", background:T.gold, flexShrink:0 }}/>
                      <span style={{ fontFamily:T.sans, fontSize:14, color:T2.text, fontWeight:300 }}>{w}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop:"0.5px solid rgba(138,158,132,0.2)", paddingTop:18, marginTop:4, marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:T.sans, marginBottom:8 }}>Lesson</div>
                  <p style={{ fontFamily:T.serif, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.65, margin:0 }}>{card.lesson}</p>
                </div>
                <div style={{ background:T2.surface, borderRadius:4, padding:"16px 18px" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:T.sans, marginBottom:10 }}>Try it</div>
                  <p style={{ fontFamily:T.serif, fontSize:16, fontStyle:"italic", color:T2.text, lineHeight:1.5, margin:"0 0 8px" }}>{card.practice[0]}</p>
                  <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text3, margin:0 }}>{card.practice[1]}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:28, padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold }}>
            <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:T2.text, lineHeight:1.6, margin:0 }}>Pressure doesn't create communication habits. It reveals them.</p>
          </div>
        </div>
      );

      return <RightContent/>;
    };

    const D11RightContent = () => {
      const [d11Test, setD11Test] = useState(null);
      const [d11CardOpen, setD11CardOpen] = useState(null);

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Why Image Matters</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Perception Is Built From Signals</h2>
          {!d11Test && (
            <div style={{ marginBottom:32 }}>
              <p style={{ fontFamily:T.sans, fontSize:16, color:"#A8998A", lineHeight:1.6, marginBottom:24, maxWidth:600 }}>Before we get to the science — a quick perception test. Three people walk into the same meeting. Same role. Same experience. Which one seems most trustworthy?</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
                {[
                  {label:"Person A", traits:["Arrives prepared","Measured pace","Consistent presence","Has a story ready"]},
                  {label:"Person B", traits:["Energetic, unpredictable","Different every time","Full of ideas","Hard to read"]},
                  {label:"Person C", traits:["Quiet, consistent","Always follows through","Same in every room","Signals without words"]},
                ].map((p,i) => (
                  <div key={i} onClick={()=>setD11Test(i)} style={{ padding:"20px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, cursor:"pointer", transition:"border-color 0.2s" }} className="au-lift">
                    <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:10 }}>{p.label}</div>
                    {p.traits.map((t,j) => (
                      <div key={j} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
                        <div style={{ width:3, height:3, borderRadius:"50%", background:T.gold, flexShrink:0 }}/>
                        <span style={{ fontFamily:T.sans, fontSize:13, color:T2.text3 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text3, fontStyle:"italic" }}>Tap any card to see what your instinct reveals.</p>
            </div>
          )}
          {d11Test !== null && (
            <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold, marginBottom:28 }}>
              <p style={{ fontFamily:T.serif, fontSize:18, fontWeight:600, color:T2.text, lineHeight:1.5, margin:"0 0 10px" }}>Your instinct pointed to Person {["A","B","C"][d11Test]}.</p>
              <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, lineHeight:1.7, margin:0 }}>That answer was made in milliseconds — before any evidence. This is how everyone reads everyone. The question isn't whether people are forming impressions. It's whether you're shaping them intentionally.</p>
              <button onClick={()=>setD11Test(null)} style={{ marginTop:12, fontFamily:T.sans, fontSize:12, color:T.gold, background:"none", border:"none", cursor:"pointer", padding:0 }}>← Retake test</button>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {D11_FACTS.map((n,i) => (
              <div key={i} style={{ padding:"22px 24px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.serif, fontSize:20, fontWeight:600, color:T.gold, lineHeight:1.3, marginBottom:10 }}>{n.word}</div>
                <p style={{ fontFamily:T.sans, fontSize:15, color:T2.text, lineHeight:1.7, fontWeight:400, margin:"0 0 8px" }}>{n.body}</p>
                <div style={{ fontFamily:T.sans, fontSize:11, color:T2.text4, fontStyle:"italic" }}>{n.source}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:T.sans, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.7 }}>Be your brand.</p>
        </div>
      );

      if (step === "Theory") {
        return (
          <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
            <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>The Science of Personal Brand</div>

            {/* Halo Effect — first */}
            <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>The Halo Effect</h2>
            <p style={{ fontFamily:T.sans, fontSize:16, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:20, maxWidth:640 }}>Whether intentional or not, people are constantly building a story about who you are. Psychologists call this the Halo Effect: one standout positive trait shapes how they judge everything else.</p>
            <div style={{ marginBottom:20, border:"0.5px solid "+T2.border, borderRadius:4, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 32px 1fr", background:T2.surface, padding:"10px 20px", borderBottom:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T2.text4, textTransform:"uppercase", letterSpacing:"1.5px" }}>You appear</div>
                <div/>
                <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T2.text4, textTransform:"uppercase", letterSpacing:"1.5px" }}>People assume</div>
              </div>
              {[["Articulate","Intelligence"],["Calm","Competence"],["Stylish","Success"],["Confident","Capability"],["Warm","Trustworthiness"]].map(([sig,res],i,arr) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 32px 1fr", alignItems:"center", padding:"14px 20px", background: i%2===0 ? T2.bg : T2.surface, borderBottom: i<arr.length-1 ? "0.5px solid "+T2.divider : "none" }}>
                  <div style={{ fontFamily:T.sans, fontSize:14, fontWeight:500, color:T2.text }}>{sig}</div>
                  <div style={{ fontFamily:T.sans, fontSize:14, color:T.gold, textAlign:"center", fontWeight:300 }}>→</div>
                  <div style={{ fontFamily:T.sans, fontSize:14, fontWeight:600, color:T.gold }}>{res}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:"16px 20px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T2.border, marginBottom:36 }}>
              <p style={{ fontFamily:T.serif, fontSize:16, fontStyle:"italic", color:T2.text2, lineHeight:1.6, margin:0 }}>"People rarely remember everything about you. They remember the strongest signal you gave them."</p>
            </div>

            {/* Recipe heading */}
            <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>The AmplifyU Brand Formula</div>
            <h3 style={{ fontFamily:T.serif, fontSize:28, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:10 }}>The Recipe for a Memorable Personal Brand</h3>
            <p style={{ fontFamily:T.sans, fontSize:15, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:24, maxWidth:600 }}>Great personal brands don't happen accidentally. They are built through six repeated psychological signals. Tap any ingredient to see the full explanation.</p>

            {/* 6 expandable ingredient boxes */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:28 }}>
              {D11_INGREDIENTS.map((ing,i) => (
                <div key={i} onClick={()=>setD11CardOpen(d11CardOpen===i?null:i)}
                  style={{ padding:"18px 20px", background:T2.surface, borderRadius:4, border:`0.5px solid ${d11CardOpen===i?T.gold:T2.border}`, cursor:"pointer", transition:"border-color 0.2s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:d11CardOpen===i?T.gold:"rgba(138,158,132,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.2s" }}>
                      <span style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:"white" }}>{i+1}</span>
                    </div>
                    <span style={{ fontFamily:T.sans, fontSize:11, color:d11CardOpen===i?T.gold:T2.text4 }}>{d11CardOpen===i?"▴":"▸"}</span>
                  </div>
                  <div style={{ fontFamily:T.serif, fontSize:18, fontWeight:600, color:T2.text, marginBottom:4 }}>{ing.n}</div>
                  <div style={{ fontFamily:T.sans, fontSize:12, color:T2.text3 }}>{ing.tagline}</div>
                  {d11CardOpen===i && (
                    <div style={{ marginTop:16, paddingTop:14, borderTop:"0.5px solid "+T2.divider }}>
                      <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text, lineHeight:1.65, fontWeight:300, margin:"0 0 12px" }}>{ing.body}</p>
                      <div style={{ padding:"8px 12px", background:T2.bg, borderRadius:3, marginBottom:10 }}>
                        <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.goldDark, textTransform:"uppercase", letterSpacing:"1px", marginBottom:3 }}>{ing.psych}</div>
                        <p style={{ fontFamily:T.sans, fontSize:12, color:T2.text3, lineHeight:1.55, margin:0, fontWeight:300 }}>{ing.psychBody}</p>
                      </div>
                      <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold }}>→ {ing.takeaway}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Final quote */}
            <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold }}>
              <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:T.gold, lineHeight:1.65, margin:0 }}>Your brand is the story people tell themselves about you after repeated exposure.</p>
            </div>
          </div>
        );
      }

      if (step === "Practice") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Build Your Brand</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:600 }}>Three exercises. Each one builds a different layer of your brand architecture.</p>
          <D11PracticeWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Your Brand Coach</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:640 }}>Four scenarios where your brand is built or broken. Write your response. Your coach evaluates clarity, authenticity, and memorability.</p>
          <D11SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Example") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Iconic Brands. Intentional Choices.</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:640 }}>Three people whose personal brands became cultural forces — not by accident, but by design.</p>

          {/* Taylor Swift — full-width feature card */}
          {D11_EXAMPLES.filter(c=>c.id==="swift").map(card=>(
            <div key={card.id} style={{ background:"white", borderRadius:8, padding:"32px", boxShadow:"0 2px 8px rgba(44,36,22,0.07), 0 8px 24px rgba(44,36,22,0.04)", marginBottom:20 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
                <div>
                  <h3 style={{ fontFamily:T.serif, fontSize:26, fontWeight:600, color:T2.text, marginBottom:2 }}>{card.name}</h3>
                  <p style={{ fontFamily:T.sans, fontSize:12, color:T2.text3, marginBottom:8 }}>{card.role}</p>
                  <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:16 }}>{card.headline}</div>
                  <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text, lineHeight:1.75, fontWeight:300, marginBottom:20 }}>{card.body}</p>
                  <div style={{ padding:"14px 16px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold }}>
                    <p style={{ fontFamily:T.serif, fontSize:15, fontStyle:"italic", color:T.gold, lineHeight:1.65, margin:0 }}>{card.lesson}</p>
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:14 }}>How she maps to the Brand Formula</div>
                  {card.ingredients.map((ing,i)=>(
                    <div key={i} style={{ display:"flex", gap:12, paddingBottom:12, marginBottom:12, borderBottom: i<card.ingredients.length-1 ? "0.5px solid "+T2.divider : "none", alignItems:"flex-start" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0, width:110 }}>
                        <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(138,158,132,0.15)", border:"0.5px solid "+T.gold, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span style={{ fontFamily:T.sans, fontSize:9, fontWeight:700, color:T.gold }}>{i+1}</span>
                        </div>
                        <span style={{ fontFamily:T.sans, fontSize:12, fontWeight:700, color:T2.text }}>{ing.n}</span>
                      </div>
                      <p style={{ fontFamily:T.sans, fontSize:12, color:T2.text3, lineHeight:1.6, fontWeight:300, margin:0 }}>{ing.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Beckham + Wintour — 2-col grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {D11_EXAMPLES.filter(c=>c.id!=="swift").map((card,ci)=>(
              <div key={ci} style={{ background:"white", borderRadius:8, padding:"28px", boxShadow:"0 2px 8px rgba(44,36,22,0.07), 0 8px 24px rgba(44,36,22,0.04)" }}>
                <h3 style={{ fontFamily:T.serif, fontSize:22, fontWeight:600, color:T2.text, marginBottom:2 }}>{card.name}</h3>
                <p style={{ fontFamily:T.sans, fontSize:12, color:T2.text3, marginBottom:8 }}>{card.role}</p>
                <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:16 }}>{card.headline}</div>
                <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text, lineHeight:1.7, fontWeight:300, marginBottom:20 }}>{card.body}</p>
                <div style={{ borderTop:"0.5px solid rgba(138,158,132,0.2)", paddingTop:16 }}>
                  <div style={{ fontSize:10, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:T.sans, marginBottom:8 }}>Lesson</div>
                  <p style={{ fontFamily:T.serif, fontSize:15, fontStyle:"italic", color:T.gold, lineHeight:1.65, margin:0 }}>{card.lesson}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      return <RightContent/>;
    };

    const RightContent = () => (
      <div key={idx} className="au-step-enter" style={{ padding: "44px 52px" }}>

        {/* ── Insight ──────────────────────────────────────────────────────── */}
        {step === "Insight" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            <div>
              <div style={{ ...RP_LABEL, color: T2.text3, marginBottom: 18 }}>Today's Insight</div>
              <p style={{ fontFamily: T.serif, fontSize: 21, fontWeight: 400, color: T2.text, lineHeight: 1.6, letterSpacing: "-0.3px" }}>{lesson.insight}</p>
            </div>
            {lesson.day !== 1 && (
              <div style={{ borderLeft: "2px solid " + T.gold, paddingLeft: 22 }}>
                <div style={{ ...RP_LABEL, color: T.goldDark, marginBottom: 10 }}>PIE Connection</div>
                <p style={{ fontFamily: T.sans, fontSize: 14, color: T2.text3, lineHeight: 1.75, fontWeight: 300 }}>{lesson.pieLink}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Theory ───────────────────────────────────────────────────────── */}
        {step === "Theory" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <div style={{ ...RP_LABEL, color: T.goldDark, marginBottom: 10 }}>{THEORY_DATA[lesson.day - 1]?.theory}</div>
              <p style={{ fontFamily: T.sans, fontSize: 14, color: T2.text, lineHeight: 1.8, fontWeight: 300 }}>{THEORY_DATA[lesson.day - 1]?.concept}</p>
            </div>
            <div style={{ borderTop: "0.5px solid " + T2.divider, paddingTop: 24 }}>
              <div style={{ ...RP_LABEL, color: T2.text3, marginBottom: 10 }}>What This Means For You</div>
              <p style={{ fontFamily: T.serif, fontSize: 16, fontStyle: "italic", color: T2.text2, lineHeight: 1.7 }}>{THEORY_DATA[lesson.day - 1]?.life}</p>
            </div>
          </div>
        )}

        {/* ── Example ──────────────────────────────────────────────────────── */}
        {step === "Example" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <div style={{ ...RP_LABEL, color: T2.text3, marginBottom: 18 }}>Starter Phrases</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {lesson.phrases.map((ph, i) => (
                  <div key={i} style={{ padding: "15px 0", borderBottom: i < lesson.phrases.length - 1 ? "0.5px solid " + T2.divider : "none" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ width: 1.5, height: 18, background: T.gold, flexShrink: 0, marginTop: 4, opacity: 0.7 }}/>
                      <p style={{ fontFamily: T.serif, fontSize: 17, fontStyle: "italic", color: T2.text, lineHeight: 1.55, margin: 0 }}>{ph}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Practice ─────────────────────────────────────────────────────── */}
        {step === "Practice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <div style={{ ...RP_LABEL, color: T2.text3, marginBottom: 16 }}>The Exercise</div>
              {/* Main instruction in serif for editorial warmth */}
              <p style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 400, color: T2.text, lineHeight: 1.65, letterSpacing: "-0.1px" }}>{lesson.practice}</p>
            </div>
            <Timer totalSecs={180} label="3 minutes"/>
            <CoachWidget lesson={lesson} scenario={null}/>
          </div>
        )}

        {/* ── Simulation ───────────────────────────────────────────────────── */}
        {step === "Simulation" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <div style={{ ...RP_LABEL, color: T2.text3, marginBottom: 14 }}>Respond As You Would In Real Life</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
                {["State your point clearly", "Give one reason", "Add a real example"].map((txt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "0.5px solid " + T.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: T.goldDark, fontWeight: 600, fontFamily: T.sans }}>{i + 1}</span>
                    </div>
                    <span style={{ fontFamily: T.serif, fontSize: 16, color: T2.text, lineHeight: 1.4 }}>{txt}</span>
                  </div>
                ))}
              </div>
            </div>
            <Timer totalSecs={180} label="Speak for up to 3 minutes"/>
            <CoachWidget lesson={lesson} scenario={activeSc}/>
          </div>
        )}

        {/* ── Review ───────────────────────────────────────────────────────── */}
        {step === "Review" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <div style={{ ...RP_LABEL, color: T2.text3, marginBottom: 20 }}>Reflection</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {lesson.review.map((q, i) => (
                  <div key={i}
                    onClick={() => setChecks(c => Object.assign({}, c, { [i]: !c[i] }))}
                    style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "16px 0", borderBottom: i < lesson.review.length - 1 ? "0.5px solid " + T2.divider : "none", cursor: "pointer" }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                      border: "0.5px solid " + (checks[i] ? T.green : T2.border),
                      background: checks[i] ? "rgba(82,112,96,0.1)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginTop: 2, transition: "all 0.2s ease",
                    }}>
                      {checks[i] && <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l3 3 4-4" stroke={T.green} strokeWidth="1.6" strokeLinecap="round"/></svg>}
                    </div>
                    {/* Reflection questions in serif for emotional register */}
                    <p style={{ fontFamily: T.serif, fontSize: 17, color: checks[i] ? T2.text3 : T2.text, lineHeight: 1.55, margin: 0, transition: "color 0.2s" }}>{q}</p>
                  </div>
                ))}
              </div>
            </div>
            {lesson.day >= 4 && lesson.day <= 7 && (
              <div style={{ borderTop: "0.5px solid " + T2.divider, paddingTop: 28 }}>
                <div style={{ ...RP_LABEL, color: T.goldDark, marginBottom: 14 }}>Your Ambition Statement</div>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: T2.text3, lineHeight: 1.65, marginBottom: 14, fontWeight: 300 }}>Complete this sentence. Say it as if telling a trusted senior leader — not writing a CV.</p>
                <div style={{ padding: "14px 18px", background: T2.surface, borderRadius: 4, border: "0.5px solid " + T2.border, marginBottom: 10, borderLeft: "2px solid " + T.gold }}>
                  <span style={{ fontFamily: T.serif, fontSize: 15, color: T.goldDark, fontWeight: 500 }}>"In the next 18 months, I want to be </span>
                  <span style={{ fontFamily: T.serif, fontSize: 15, color: ambitionDraft ? T2.text : T2.text4, fontStyle: "italic" }}>{ambitionDraft || "your answer here…"}</span>
                  <span style={{ fontFamily: T.serif, fontSize: 15, color: T.goldDark, fontWeight: 500 }}>"</span>
                </div>
                <textarea value={ambitionDraft} onChange={e => saveAmbition(e.target.value)}
                  placeholder="…operating at director level, leading a team that matters…"
                  rows={2} style={{ width: "100%", padding: "11px 14px", border: "0.5px solid " + T2.border, borderRadius: 4, outline: "none", resize: "none", background: T2.surface, fontSize: 14, color: T2.text, lineHeight: 1.55, fontFamily: T.sans, fontWeight: 300 }}/>
              </div>
            )}
            <div style={{ borderTop: "0.5px solid " + T2.divider, paddingTop: 24 }}>
              <div style={{ ...RP_LABEL, color: T2.text3, marginBottom: 10 }}>My Note</div>
              <textarea value={note} onChange={e => saveNote(e.target.value)}
                placeholder="What's one thing you'll take into tomorrow?"
                rows={3} style={{ width: "100%", padding: "11px 14px", border: "0.5px solid " + T2.border, borderRadius: 4, outline: "none", resize: "none", background: T2.surface, fontSize: 14, color: T2.text, lineHeight: 1.6, fontFamily: T.sans, fontWeight: 300 }}/>
            </div>
            {/* ── Further Reading ── */}
            {(() => {
              const fr = FURTHER_READING[lesson.day - 1];
              if (!fr) return null;
              return (
                <div style={{ borderTop: "0.5px solid " + T2.divider, paddingTop: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div style={{ ...RP_LABEL, color: T.goldDark }}>Further Reading</div>
                    <div style={{ flex: 1, height: "0.5px", background: T2.divider }}/>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {fr.books.map((book, bi) => (
                      <div key={bi} style={{ background: T2.bg, border: "0.5px solid " + T2.border, borderRadius: 4, padding: "20px 22px" }}>
                        <p style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: T2.text, letterSpacing: "-0.2px", marginBottom: 2 }}>{book.title}</p>
                        <p style={{ fontFamily: T.sans, fontSize: 12, color: T2.text3, fontWeight: 400, marginBottom: 12 }}>{book.author}</p>
                        <p style={{ fontFamily: T.serif, fontSize: 14, fontStyle: "italic", color: T.goldDark, lineHeight: 1.5, marginBottom: 10 }}>{book.connection}</p>
                        <p style={{ fontFamily: T.sans, fontSize: 13, color: T2.text2, lineHeight: 1.7, fontWeight: 300, marginBottom: 16 }}>{book.summary}</p>
                        <a href={book.amazon} target="_blank" rel="noreferrer" style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "8px 16px", background: T2.ink, color: T2.bg,
                          borderRadius: 3, fontSize: 12, fontFamily: T.sans, fontWeight: 500,
                          letterSpacing: "0.02em", textDecoration: "none",
                          transition: "opacity 0.2s ease",
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >Get the book →</a>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );

    // ── Main studio render ────────────────────────────────────────────────
    return (
      <div style={{ height: "100vh", paddingTop: NAV_H, display: "flex", flexDirection: "column", overflow: "hidden", background: "#131009" }}>
        {/* Exit confirmation modal */}
        {exitConfirm && (
          <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(8,6,4,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: T2.surface, borderRadius: 12, padding: "36px 40px", width: 380, border: "1px solid " + T2.border, boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>
              <h3 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 500, color: T2.text, marginBottom: 12, letterSpacing: "-0.3px" }}>Leave this session?</h3>
              <p style={{ fontSize: 14, color: T2.text3, lineHeight: 1.65, marginBottom: 28, fontFamily: T.sans }}>You've completed <strong style={{ color: T2.text }}>{idx} of 6 chapters</strong>. Progress saves only at Review.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => setExitConfirm(false)} style={{ padding: "14px", borderRadius: 6, border: "none", background: T.gold, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.sans }}>Continue Session</button>
                <button onClick={() => { setExitConfirm(false); onBack(); }} style={{ padding: "12px", borderRadius: 6, border: "1px solid " + T2.border, background: "transparent", color: T2.text3, fontSize: 13, cursor: "pointer", fontFamily: T.sans }}>Leave without finishing</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Split-panel studio / Review 3-panel ── */}
        {step === "Review" ? (
          /* ── REVIEW: Minimal Luxury Layout ── */
          <div key="review-luxury" className="au-step-enter" style={{ flex: 1, display: "flex", overflow: "hidden" }}>

            {/* LEFT — Dark cinematic closing (unchanged) */}
            <div style={{ width: "36%", flexShrink: 0, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ position: "absolute", inset: 0 }}>
                <img src="/review-chair.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}/>
              </div>
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,5,0.35)" }}/>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,8,5,0.97) 0%, rgba(10,8,5,0.3) 50%, transparent 75%)" }}/>
              <button onClick={() => setExitConfirm(true)} style={{ position: "absolute", top: 24, left: 24, zIndex: 10, display: "flex", alignItems: "center", gap: 6, background: "#F5EFE6", border: "1px solid rgba(44,36,22,0.18)", borderRadius: 4, padding: "8px 16px 8px 12px", cursor: "pointer" }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="#2C2416" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 14, color: "#2C2416", fontFamily: T.sans, fontWeight: 500 }}>← Exit</span>
              </button>
              <div style={{ position: "relative", zIndex: 2, padding: "40px 40px 44px", animation: "fadeUp 0.6s ease both" }}>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, fontFamily: T.sans, fontWeight: 500, marginBottom: 20 }}>Day {lesson.day} · {lesson.title}</div>
                <p style={{ fontFamily: T.serif, fontWeight: 600, color: "#F5EFE6", fontSize: "clamp(24px,2vw,32px)", lineHeight: 1.2, letterSpacing: "-0.3px", marginBottom: 24, maxWidth: 320 }}>{REVIEW_CLOSING[lesson.day - 1]}</p>
                <div style={{ width: 48, height: 1.5, background: T.gold, opacity: 0.6, marginBottom: 20 }}/>
                <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(245,239,230,0.5)", fontFamily: T.sans }}>Day {lesson.day} Complete</div>
              </div>
            </div>

            {/* RIGHT — Review panel (Option 1 for Day 3, Option 5 for all others) */}
            {(() => {
              const fr = FURTHER_READING[lesson.day - 1];
              const nextDay = lesson.day < 14 ? lesson.day + 1 : null;

              // ── OPTION 1: Book-First Editorial Layout (all modules) ───────────
              {
                return (
                  <div style={{ flex: 1, background: T2.bg, borderLeft: "1px solid " + T2.divider, overflowY: "auto" }}>
                    <div style={{ maxWidth: 860, margin: "0 auto", padding: "60px 48px" }}>
                      {/* Header */}
                      <div style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "2px", color: T.gold, marginBottom: 32, fontFamily: T.sans }}>Day {lesson.day} Complete ✓</div>
                      <h1 style={{ fontFamily: T.serif, fontSize: "clamp(36px,3.5vw,48px)", fontWeight: 600, color: T2.text, letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 16 }}>Go Deeper</h1>
                      <p style={{ fontFamily: T.sans, fontSize: 17, fontWeight: 300, color: T2.text2, maxWidth: 500, marginBottom: 60, lineHeight: 1.65 }}>You've learned the techniques. These books will make you unstoppable.</p>

                      {/* Book cards */}
                      {fr && fr.books.map((book, bi) => {
                        const saved = savedBooks.includes(book.title);
                        return (
                          <div key={bi} style={{ background: "white", borderRadius: 8, padding: "36px", boxShadow: "0 2px 8px rgba(44,36,22,0.08), 0 8px 24px rgba(44,36,22,0.04)", marginBottom: 32, display: "grid", gridTemplateColumns: "200px 1fr", gap: 40, alignItems: "start" }}>
                            {/* Cover placeholder */}
                            <div style={{ width: 200, height: 300, background: "linear-gradient(145deg,#2C2416 0%,#4A3828 55%,#2C2416 100%)", borderRadius: 4, boxShadow: "0 4px 16px rgba(44,36,22,0.18), 3px 0 0 rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px", textAlign: "center", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,"+T.gold+",rgba(138,158,132,0.3))" }}/>
                              <p style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 600, color: "#F5EFE6", lineHeight: 1.25, marginBottom: 12 }}>{book.title}</p>
                              <div style={{ width: 24, height: 1, background: T.gold, opacity: 0.5, marginBottom: 10 }}/>
                              <p style={{ fontFamily: T.sans, fontSize: 10, color: "rgba(245,239,230,0.5)", letterSpacing: "0.5px" }}>{book.author}</p>
                            </div>
                            {/* Info */}
                            <div>
                              <h2 style={{ fontFamily: T.serif, fontSize: "clamp(22px,2vw,28px)", fontWeight: 600, color: T2.text, marginBottom: 6, letterSpacing: "-0.2px" }}>{book.title}</h2>
                              <p style={{ fontFamily: T.sans, fontSize: 15, color: T2.text2, marginBottom: 20 }}>{book.author}</p>
                              {book.quote && (
                                <p style={{ fontFamily: T.sans, fontSize: 17, fontStyle: "italic", color: T2.text, lineHeight: 1.65, marginBottom: 14, borderLeft: "3px solid "+T.gold, paddingLeft: 16 }}>
                                  <span style={{ color: T.gold, fontStyle: "normal" }}>"</span>{book.quote}<span style={{ color: T.gold, fontStyle: "normal" }}>"</span>
                                </p>
                              )}
                              {book.rating && (
                                <p style={{ fontFamily: T.sans, fontSize: 13, color: T2.text3, marginBottom: 22 }}>
                                  <span style={{ color: "#C9A227" }}>★★★★★</span> {book.rating}/5 · {book.reviewCount}
                                </p>
                              )}
                              {book.why && (
                                <div style={{ marginBottom: 24 }}>
                                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", color: T.gold, fontFamily: T.sans, marginBottom: 8 }}>Why this book</div>
                                  <p style={{ fontFamily: T.sans, fontSize: 14, color: T2.text, lineHeight: 1.7, fontWeight: 300 }}>{book.why}</p>
                                </div>
                              )}
                              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                <a href={book.amazon} target="_blank" rel="noreferrer"
                                  style={{ display: "inline-block", background: T.ink, color: T.bg, padding: "11px 24px", borderRadius: 4, fontFamily: T.sans, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "all 0.25s ease", flexShrink: 0 }}
                                  onMouseEnter={e=>{ e.currentTarget.style.background=T.gold; e.currentTarget.style.transform="translateY(-2px)"; }}
                                  onMouseLeave={e=>{ e.currentTarget.style.background=T.ink; e.currentTarget.style.transform="none"; }}
                                >Buy on Amazon →</a>
                                <button onClick={()=>saveBook(book.title)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: saved ? T.gold : T2.text3, border: "1px solid " + (saved ? T.gold : T2.border), padding: "11px 20px", borderRadius: 4, fontFamily: T.sans, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s ease", flexShrink: 0 }}
                                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.gold; e.currentTarget.style.color=T.gold; }}
                                  onMouseLeave={e=>{ if (!saved){ e.currentTarget.style.borderColor=T2.border; e.currentTarget.style.color=T2.text3; } }}
                                >{saved ? "✓ Saved" : "+ Save to List"}</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Session summary accordion */}
                      <div style={{ borderTop: "1px solid rgba(138,158,132,0.3)", paddingTop: 32, marginBottom: 40, cursor: "pointer" }} onClick={()=>setAccordionOpen(o=>!o)}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 500, color: T2.text }}>What You Practised Today</div>
                          <span style={{ fontSize: 18, color: T2.text3, transition: "transform 0.2s", transform: accordionOpen ? "rotate(180deg)" : "none", display: "inline-block" }}>▾</span>
                        </div>
                        {accordionOpen && (
                          <div style={{ marginTop: 20 }}>
                            {REVIEW_BULLETS[lesson.day - 1].map((b, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(138,158,132,0.15)", border: "1px solid rgba(138,158,132,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-3.5" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                                <span style={{ fontFamily: T.sans, fontSize: 15, color: T2.text2, lineHeight: 1.6 }}>{b}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Next session button */}
                      <button onClick={onComplete} style={{ width: "100%", background: T.gold, color: "#F5EFE6", padding: "18px", borderRadius: 4, border: "none", fontFamily: T.sans, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.25s ease", textAlign: "center", marginBottom: 60 }}
                        onMouseEnter={e=>{ e.currentTarget.style.background=T.ink; e.currentTarget.style.transform="translateY(-2px)"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background=T.gold; e.currentTarget.style.transform="none"; }}
                      >
                        {nextDay ? `Next: Day ${nextDay} — ${LESSONS[nextDay-1]?.title} →` : "Complete Programme →"}
                      </button>
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        ) : (
          /* ── Standard 60/40 split for all other steps ── */
          <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

            {/* Practice step: full-bleed background image behind both panels */}
            {step === "Practice" && (
              <img src="/practice-bg.jpg" alt="" style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center 30%",
                zIndex: 0, pointerEvents: "none",
              }}/>
            )}

            {/* LEFT PANEL — Primary stage: visual atmosphere + theory diagram */}
            <div style={{
              width: "40%", flexShrink: 0,
              position: "relative", overflow: "hidden", zIndex: 1,
            }}>
              <div key={idx} className="au-step-enter" style={{ height: "100%" }}>
                <LeftPanel/>
              </div>
              {/* Back button — floats over left panel */}
              <button
                onClick={() => idx === 0 ? onBack() : setExitConfirm(true)}
                style={{
                  position: "absolute", top: 16, left: 24,
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#F5EFE6",
                  border: "1px solid rgba(44,36,22,0.18)", borderRadius: 4,
                  padding: "8px 16px 8px 12px", cursor: "pointer", zIndex: 10,
                }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="#2C2416" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 14, color: "#2C2416", fontFamily: T.sans, fontWeight: 500 }}>← Exit</span>
              </button>
            </div>

            {/* RIGHT PANEL — Supporting content (40%) */}
            <div ref={rightPanelRef} style={{
              flex: 1,
              background: step === "Practice" ? "rgba(247,243,236,0.92)" : T2.bg,
              overflowY: "auto", position: "relative", zIndex: 1,
              borderLeft: "1px solid " + T2.divider,
            }}>
              {/* Day 1 only: very subtle lounge image at 7% — warmth without distraction */}
              {lesson.day === 1 && step === "Insight" && (
                <img src="/day1-lounge.jpg" alt="" style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center 30%",
                  opacity: 0.07, pointerEvents: "none", zIndex: 0,
                  mixBlendMode: "multiply",
                }}/>
              )}
              <div style={{ position: "relative", zIndex: 1 }}>
                {isD1 ? <D1RightContent/> : isD2 ? <D2RightContent/> : isD3 ? <D3RightContent/> : isD4 ? <D4RightContent/> : isD5 ? <D5RightContent/> : isD6 ? <D6RightContent/> : isD11 ? <D11RightContent/> : isD10 ? <D10RightContent/> : isNT ? <NTRightContent/> : isD9 ? <D9RightContent/> : <RightContent/>}
              </div>
            </div>
          </div>
        )}

        {/* ── Chapter navigation bar — visible, numbered, clearly labelled ── */}
        <div style={{
          height: 64, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px",
          background: "rgba(14,11,8,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}>
          {/* Chapter marks — left */}
          <ChapterMarks/>

          {/* Navigation — right */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {idx > 0 && (
              <button onClick={() => setIdx(i => i - 1)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 5,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: T.sans,
              }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
            )}
            {idx < STEPS.length - 1 && (
              <button onClick={() => setIdx(i => i + 1)} className="au-cta" style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 24px", borderRadius: 5,
                background: T.gold, border: "none",
                color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: T.sans, letterSpacing: "0.1px",
                boxShadow: "0 2px 16px rgba(138,158,132,0.3)",
              }}>
                {idx === 0 ? "Begin" : idx === STEPS.length - 2 ? "Final Chapter" : "Continue"}
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            {/* Mark Complete in nav bar for Review step */}
            {step === "Review" && !isDone && (
              <button onClick={onComplete} className="au-cta" style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 20px", borderRadius: 5,
                background: T.green, border: "none",
                color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: T.sans, boxShadow: "0 2px 16px rgba(61,107,79,0.3)",
              }}>
                Mark Complete & Continue
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            {step === "Review" && isDone && (
              <div style={{ padding: "8px 14px", borderRadius: 5, background: "rgba(61,107,79,0.2)", border: "1px solid rgba(61,107,79,0.3)", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={T.green} strokeWidth="1.6" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 12, color: T.green, fontFamily: T.sans }}>Complete</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{background:T2.bg,minHeight:"100vh",paddingBottom:40}}
      onTouchStart={e=>{swipeRef.current={x:e.touches[0].clientX,y:e.touches[0].clientY};}}
      onTouchEnd={e=>{
        const dx=e.changedTouches[0].clientX-swipeRef.current.x;
        const dy=e.changedTouches[0].clientY-swipeRef.current.y;
        if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>52){
          if(dx<0&&idx<STEPS.length-1){setIdx(i=>i+1);}
          else if(dx>0&&idx>0){setIdx(i=>i-1);}
        }
      }}
    >

      {/* Exit confirmation modal */}
      {exitConfirm && (
        <div style={{
          position:"fixed",inset:0,zIndex:400,
          background:"rgba(11,13,16,0.75)",
          backdropFilter:"blur(8px)",
          display:"flex",alignItems:"center",justifyContent:"center",
          padding:"24px",
        }}>
          <div style={{
            background:T2.surface,
            borderRadius:20,
            padding:"28px 24px",
            width:"100%",maxWidth:340,
            border:"1px solid "+T2.border,
            boxShadow:"0 24px 64px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{
              fontFamily:T.serif,fontSize:20,fontWeight:700,
              color:T2.text,textAlign:"center",marginBottom:10,
            }}>Leave this session?</h3>
            <p style={{
              fontSize:13,color:T2.text3,
              textAlign:"center",lineHeight:1.6,marginBottom:24,
            }}>
              You've completed <strong style={{color:T2.text}}>{idx} of 6 
steps</strong>. Your progress won't be saved until you reach the Review 
step.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {/* Stay — primary */}
              <button
                onClick={() => setExitConfirm(false)}
                style={{
                  width:"100%",padding:"15px",
                  borderRadius:12,border:"none",
                  background:"linear-gradient(135deg,"+T.navy+" 0%,#1E2D45 100%)",
                  
color:"white",fontSize:14,fontWeight:700,cursor:"pointer",
                  boxShadow:"0 4px 16px rgba(17,28,46,0.25)",
                  
display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                }}>
                <svg width="14" height="14" viewBox="0 0 14 14" 
fill="none"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="1.8" 
strokeLinecap="round" transform="rotate(45 7 7)"/></svg>
                Continue session
              </button>
              {/* Leave — secondary, destructive */}
              <button
                onClick={() => { setExitConfirm(false); onBack(); }}
                style={{
                  width:"100%",padding:"13px",
                  borderRadius:12,
                  border:"1px solid "+T2.border,
                  background:"transparent",
                  
color:T2.text3,fontSize:13,fontWeight:500,cursor:"pointer",
                }}>
                Leave without finishing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top nav bar — AmplifyU logo only */}
      <div style={{
        background:T.bg,
        padding:"14px 20px",
        borderBottom:"0.5px solid rgba(44,36,22,0.08)",
      }}>
        <span style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.ink,letterSpacing:"-0.3px"}}>AmplifyU</span>
      </div>

      {/* Header image + Exit button overlay */}
      <div style={{position:"relative",height:step==="Theory 2"?260:320,overflow:"hidden",background:step==="Practice"?"#141210":step==="Example"||step==="Simulation"?"#0E0B08":"transparent"}}>
        {(()=>{
          // Simulation tab: dark cinematic panel for ALL modules
          if(step==="Simulation"){
            const SIM_HEADERS={
              1:{label:"SPEAK CLEARLY — IN ACTION",   heading:"Clarity under pressure. This is the real test."},
              2:{label:"REAL-WORLD VOICE COACHING",   heading:"This is where voice training becomes real."},
              3:{label:"FILLER-FREE — IN ACTION",     heading:"60 seconds. Zero fillers. Real stakes."},
              4:{label:"BREVITY — IN ACTION",         heading:"Short sentences. High stakes. Go."},
              5:{label:"PRE — IN ACTION",             heading:"Structure your thinking. Speak with precision."},
              6:{label:"HIGH-STAKES — IN ACTION",       heading:"Stay composed. Stay clear. Stay in control."},
              7:{label:"INTEGRATION — IN ACTION",     heading:"Everything you've built. One conversation."},
              8:{label:"NARRATIVE — IN ACTION",       heading:"Tell the story. Transport your audience."},
              9:{label:"DELIVERY — IN ACTION",        heading:"Great content. Delivered powerfully."},
              10:{label:"PERFORMANCE — IN ACTION",    heading:"Communicate your impact with conviction."},
              11:{label:"BRAND — IN ACTION",           heading:"Your brand is built in every room you enter. Shape it."},
            };
            const sh=SIM_HEADERS[lesson.day]||{label:"SIMULATION",heading:"Real scenario. Real pressure. Real coaching."};
            return (
              <div style={{width:"100%",height:320,background:"#0E0B08",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box"}}>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(200,180,140,1)",textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:12,fontFamily:T.sans}}>{sh.label}</div>
                <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.25,marginBottom:14,margin:"0 0 14px"}}>{sh.heading}</p>
                <div style={{width:40,height:1,background:"rgba(245,239,230,0.35)",marginBottom:14}}/>
                <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:"rgba(245,239,230,0.7)",lineHeight:1.6,margin:0}}>Day {lesson.day} · {lesson.tag}</p>
              </div>
            );
          }
          // Example tab: dark cinematic text panel instead of image
          if(step==="Example"){
            const EX_HEADERS={
              1:{label:"MASTERS OF CLARITY",      heading:"The simplest words carry the most weight.",                                  body:"Clear communicators don't use more words. They use better ones."},
              2:{label:"VOICE IN ACTION",          heading:"Range creates engagement. Contrast creates emotion.",                        body:"The most compelling voices are the most controlled — and the most dynamic."},
              3:{label:"MASTERS OF THE PAUSE",     heading:"Silence is more powerful than the word that fills it.",                     body:"The strongest speakers pause. Confident speakers own the silence."},
              4:{label:"MASTERS OF BREVITY",       heading:"Say less. Mean more. Be remembered.",                                       body:"The most persuasive lines ever spoken? All under 10 words."},
              5:{label:"PRE IN ACTION",            heading:"Point. Reason. Example. The architecture of every great professional answer.", body:"The world's most effective communicators all follow the same structure — whether they know it or not."},
              6:{label:"MASTERS UNDER PRESSURE",      heading:"Composure is a skill. The calmest person in the room shapes the room.",  body:"How elite communicators handle the conversations most people avoid."},
              7:{label:"COMMUNICATION IN ACTION",  heading:"Every skill. One conversation.",                                            body:"This is what a week of deliberate practice looks like in the real world."},
              8:{label:"STORYTELLING IN THE WILD", heading:"Stories create empathy. Empathy creates trust. Trust creates influence.",    body:"The same facts — told as a story — land 22× more powerfully in the human brain."},
              9:{label:"DELIVERY IN ACTION",       heading:"Great content, delivered powerfully, changes everything.",                  body:"The same message — delivered differently — lands completely differently."},
              10:{label:"PERFORMANCE IN ACTION",   heading:"Visible performance is communicated performance.",                          body:"Your work is exceptional. Make sure people know it."},
              11:{label:"ICONIC BRANDS. INTENTIONAL CHOICES.", heading:"Brand isn't what you say about yourself. It's what others say when you're not there.", body:"Three people whose personal brands became cultural forces — not by accident, but by design."},
            };
            const h=EX_HEADERS[lesson.day]||EX_HEADERS[1];
            return (
              <div style={{width:"100%",height:320,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box"}}>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(200,180,140,1)",textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:12,fontFamily:T.sans}}>{h.label}</div>
                <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.25,marginBottom:14,margin:"0 0 14px"}}>{h.heading}</p>
                <div style={{width:40,height:1,background:"rgba(245,239,230,0.35)",marginBottom:14}}/>
                <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:"rgba(245,239,230,0.7)",lineHeight:1.6,margin:0}}>{h.body}</p>
              </div>
            );
          }
          const STEP_IMGS={
            1:{Insight:"/day1-insight.jpg",Theory:"/feynman-technique.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
            2:{Insight:"/d2-insight.jpg",Theory:"/d2-theory.jpg",Practice:"/d2-practice.jpg",Review:"/review-chair.jpg"},
            3:{Insight:"/day3-insight.jpg",Theory:"/day3-theory.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
            4:{Insight:"/day4-insight.jpg",Theory:"/millers-law.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
            5:{Insight:"/d5-insight.jpg",Theory:"/d5-theory.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
            6:{Insight:"/d6-insight.jpg",Theory:"/d6-theory.jpg",Practice:"/practice-bg.jpg",Review:"/review-chair.jpg"},
            11:{Insight:"/d11-insight.jpg",Theory:"/d11-theory.jpg",Practice:"/practice-bg.jpg",Review:"/review-chair.jpg"},
            8:{Insight:"/nt-insight.jpg","Theory 1":"/dual-coding-theory.jpg","Theory 2":"/nt-6beat-framework.jpg",Practice:"/practice-bg.jpg",Review:"/review-chair.jpg"},
          };
          const src=STEP_IMGS[lesson.day]?.[step];
          const useContainMob = lesson.day===11 && step==="Theory";
          if(src) return <img src={src} alt="" style={{width:"100%",height:step==="Theory 2"?260:320,objectFit:useContainMob?"contain":"cover",objectPosition:step==="Practice"?"center 40%":step==="Example"?"center 30%":step==="Theory 2"?"center 55%":"center",display:"block",pointerEvents:"none",background:useContainMob?"#0E0B08":"transparent"}}/>;
          return <Scene name={lesson.scene} height={320} day={lesson.day}/>;
        })()}
        {/* Dark film overlay for Practice only */}
        {step==="Practice" && <div style={{position:"absolute",inset:0,background:"rgba(10,8,5,0.52)",pointerEvents:"none"}}/>}
        {/* Exit button — top left over image */}
        <button
          onClick={() => idx === 0 ? onBack() : setExitConfirm(true)}
          style={{
            position:"absolute",top:14,left:14,zIndex:50,
            height:36,padding:"0 14px 0 10px",
            borderRadius:4,border:"none",
            background:step==="Theory 2"?"rgba(247,243,236,0.45)":"rgba(247,243,236,0.92)",
            color:"#2C2416",
            display:"flex",alignItems:"center",gap:5,
            cursor:"pointer",fontFamily:T.sans,
            boxShadow:step==="Theory 2"?"none":"0 1px 6px rgba(44,36,22,0.15)",
          }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="#2C2416" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{fontSize:13,fontWeight:500}}>← Exit</span>
        </button>
        {isDone && <div style={{position:"absolute",top:14,right:14,background:"rgba(42,94,63,0.9)",color:"white",fontSize:11,fontWeight:700,padding:"6px 12px",borderRadius:20,letterSpacing:1}}>DONE</div>}
        {/* Day + title — only on Insight and Review */}
        {(step==="Insight"||step==="Review") && (
          <>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,8,5,0.88) 0%,rgba(10,8,5,0.3) 50%,transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:20,left:20,right:20,zIndex:2}}>
              <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.55)",textTransform:"uppercase",letterSpacing:"2px",fontFamily:T.sans,marginBottom:8}}>Day {lesson.day} · {lesson.tag}</div>
              {step==="Insight" ? (
                <>
                  <h1 style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:"white",lineHeight:1.2,marginBottom:8}}>{lesson.title}</h1>
                  <p style={{fontFamily:T.sans,fontSize:12,fontWeight:400,color:"rgba(255,255,255,0.55)",lineHeight:1.5,margin:0,fontStyle:"italic"}}>{lesson.quote}</p>
                </>
              ) : (
                <h1 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"white",lineHeight:1.2}}>{lesson.title}</h1>
              )}
            </div>
          </>
        )}
      </div>

      {/* Session Arc — horizontally scrollable on mobile */}
      {(()=>{
        const icons = ["◎","✦","←→","▶","◈","✓"];
        const colors2 = [T.navy, T.gold, T.navy, T.navy, T.navy, T.green];
        return (
          <div style={{padding:"14px 0 0",userSelect:"none",overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
            {/* Connected arc row — min-width so all 6 steps always show */}
            <div
style={{display:"flex",alignItems:"center",position:"relative",minWidth:"max-content",padding:"0 20px"}}>
              {STEPS.map((s,i) => {
                const done2 = i < idx;
                const active = i === idx;
                const isTheory = i === 1;
                const nodeCol = done2 ? T.gold : active ? 
(isTheory?T.gold:T.navy) : T2.border;
                const nodeBg = done2 ? T.goldLight : active ? 
(isTheory?"rgba(138,158,132,0.12)":T.navyLight) : "transparent";
                const lineCol = i < idx ? T.gold : T2.border;
                return (
                  <div key={s} 
style={{display:"flex",alignItems:"center",flex: 
i<STEPS.length-1?1:"none"}}>
                    {/* Node */}
                    <div style={{
                      
display:"flex",flexDirection:"column",alignItems:"center",
                      flexShrink:0,gap:3,
                    }}>
                      <div style={{
                        width: active ? 32 : 22,
                        height: active ? 32 : 22,
                        borderRadius:"50%",
                        background: nodeBg,
                        border:"1.5px solid "+nodeCol,
                        
display:"flex",alignItems:"center",justifyContent:"center",
                        transition:"all 0.3s",
                        boxShadow: active ? "0 2px 10px rgba(17,28,46,0.18)" : "none",
                        position:"relative",
                        zIndex:1,
                      }}>
                        {done2 ? (
                          <svg width="10" height="10" viewBox="0 0 10 10" 
fill="none">
                            <path d="M2 5l2.5 2.5 4-4" stroke={T.gold} 
strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <span style={{
                            fontSize: active ? 11 : 9,
                            fontWeight:700,
                            color: nodeCol,
                            lineHeight:1,
                          }}>{i+1}</span>
                        )}
                      </div>
                      {/* Step label under node */}
                      <span style={{
                        fontSize: active ? 8 : 7,
                        fontWeight: active ? 700 : 400,
                        color: active ? (isTheory?T.gold:T.navy) : done2 ? 
T.goldDark : T2.text4,
                        textTransform:"uppercase",
                        letterSpacing:"0.5px",
                        whiteSpace:"nowrap",
                        transition:"all 0.3s",
                      }}>{s}</span>
                    </div>
                    {/* Connector line to next node */}
                    {i < STEPS.length-1 && (
                      <div style={{
                        flex:1,height:1.5,
                        marginTop:-14,
                        background: i < idx
                          ? "linear-gradient(90deg,"+T.gold+","+T.gold+")"
                          : i === idx
                          ? "linear-gradient(90deg,"+T.navy+" 0%,"+T2.border+" 100%)"
                          : T2.border,
                        transition:"background 0.4s",
                      }}/>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div style={{padding:"4px 20px 0",display:"flex",flexDirection:"column",gap:14}}>

        {/* ── D10 Mobile Steps ────────────────────────────────────────────── */}
        {isD10 && step==="Insight" && (
          <>
            <div style={{background:T2.cardDark,borderRadius:2,padding:"20px"}}>
              <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:"rgba(255,255,255,0.88)",lineHeight:1.5,margin:0}}>{lesson.quote}</p>
            </div>
            <div style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
              <div style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:14}}>Why Performance Communication Matters</div>
              {D10_FACTS.map((n,i)=>(
                <div key={i} style={{marginBottom:i<3?14:0,paddingBottom:i<3?14:0,borderBottom:i<3?"0.5px solid "+T2.divider:"none"}}>
                  <span style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T.goldDark}}>{n.word} — </span>
                  <span style={{fontFamily:T.sans,fontSize:13,color:T2.text,fontWeight:300}}>{n.body}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {isD10 && step==="Theory" && (
          <>
            <div style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
              <div style={{fontSize:10,fontWeight:700,color:T.goldDark,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>The SAR Framework</div>
              {[{n:"S",label:"Situation",ex:"The challenge or context — briefly."},{n:"A",label:"Action",ex:"What YOU specifically did. Use 'I.'"},{ n:"R",label:"Result",ex:"The measurable outcome. Be specific."}].map((b,i,arr)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<arr.length-1?"0.5px solid "+T2.divider:"none",alignItems:"flex-start"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"white"}}>{b.n}</span>
                  </div>
                  <div>
                    <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T2.text,marginBottom:2}}>{b.label}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,margin:0,fontWeight:300}}>{b.ex}</p>
                  </div>
                </div>
              ))}
              <div style={{marginTop:12,padding:"10px 12px",background:"rgba(138,158,132,0.06)",borderRadius:3,borderLeft:"2px solid "+T.gold}}>
                <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>"I delivered the new process two weeks early. The result: 40% reduction in drop-off."</p>
              </div>
            </div>
          </>
        )}
        {isD10 && step==="Example" && (
          <>
            <div style={{background:T2.surface,borderRadius:2,padding:"14px 16px"}}>
              <div style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>Performance in the Wild</div>
              {D10_EXAMPLES_DATA.map((ex,i)=>(
                <div key={i} style={{marginBottom:i<3?16:0,paddingBottom:i<3?16:0,borderBottom:i<3?"0.5px solid "+T2.divider:"none"}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.goldDark,marginBottom:4}}>{ex.title} — {ex.sub}</div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,margin:0}}>{ex.tag}</p>
                </div>
              ))}
            </div>
          </>
        )}
        {isD10 && step==="Practice" && (
          <>
            <div style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
              <div style={{fontSize:10,fontWeight:700,color:T.goldDark,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>Build Your SAR Story</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,marginBottom:12}}>Answer three questions. Get a sharpened performance statement.</p>
              <D10MobileSAR/>
            </div>
          </>
        )}
        {isD10 && step==="Simulation" && (
          <>
            <div style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
              <div style={{fontSize:10,fontWeight:700,color:T.goldDark,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Impact Score</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,marginBottom:12}}>Write your performance statement. Get scored on clarity and impact.</p>
              <D10MobileSim/>
            </div>
          </>
        )}

        {/* ── D2 Mobile Steps ─────────────────────────────────────────────── */}
        {isD2 && step==="Insight" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>The Way You Speak Changes the Way People Listen</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Your voice is more than sound — it's one of your most powerful communication tools.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {D2_INSIGHT_CARDS.map((n,i)=>{
                const open = d2MobCard===("d2i"+i);
                return (
                  <div key={i} onClick={()=>setD2MobCard(open?null:"d2i"+i)}
                    style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                      <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                      <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0,transition:"color 0.2s"}}>{open?"▴":"▸"}</span>
                    </div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 10px":0}}>{n.sub}</p>
                    {open && (
                      <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                        {n.bullets.map((b,j)=>(
                          <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                            <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/>
                            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>Your voice is your most underused communication tool. Start using it deliberately.</p>
          </>
        )}

        {isD2 && step==="Example" && (()=>{
          const D2_MOB_CARDS = [
            {id:"williams",name:"Robin Williams",headline:"The Master of Vocal Range",
             sub:"From the explosive Genie in Aladdin to the emotional stillness of Good Will Hunting — he transformed how a message felt using only his voice.",
             quote:'"No matter what people tell you, words and ideas can change the world."',
             levers:[{k:"Pace",v:"Rapid-fire energy or slow emotional weight"},{k:"Pitch",v:"Playful highs to grounded seriousness"},{k:"Tone",v:"Humour, warmth, intensity, vulnerability"},{k:"Pauses",v:"Creating anticipation, emotion, and impact"}],
             lesson:"Range creates engagement. Contrast creates emotion. A flat voice fades. A dynamic voice keeps people listening.",
             challenge:{sentence:'"Ah... now this is where things get interesting."',modes:["Playful Genie energy","Thoughtful mentor","Urgent excitement","Calm inspiration"]}},
            {id:"streep",name:"Meryl Streep",headline:"The Master of Precision and Presence",
             sub:"Three iconic roles. Three completely different voices. Streep proves that the most powerful communicators don't get louder — they get more precise.",
             quote:'"Take your broken heart, make it into art."',
             levers:[{k:"Pace",v:"Deliberate control or sharp urgency"},{k:"Pitch",v:"Subtle tonal shifts that change emotional meaning"},{k:"Tone",v:"Authority, vulnerability, wit, empathy, strength"},{k:"Pauses",v:"Creating tension, emphasis, and dramatic impact"}],
             lesson:"Precision creates presence. Control creates impact. A rushed voice can feel uncertain. An intentional voice commands attention.",
             challenge:{sentence:'"This moment matters more than you think."',modes:["Sharp executive authority","Calm conviction","Warm encouragement","Emotionally vulnerable"]}},
          ];
          const challengeOpen = d2MobCard==="challenge";
          return (
            <>
              <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Voice in Action</h2>
              <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:14}}>Tap each card to explore how they use voice.</p>
              {/* Stacked person cards */}
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                {D2_MOB_CARDS.map(card=>{
                  const open = d2MobCard===card.id;
                  return (
                    <div key={card.id} onClick={()=>setD2MobCard(open?null:card.id)}
                      style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"20px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                        <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.2}}>{card.name}</div>
                        <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:10,flexShrink:0,transition:"color 0.2s"}}>{open?"▴":"▸"}</span>
                      </div>
                      <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>{card.headline}</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,fontWeight:300,margin:0}}>{card.sub}</p>
                      {open && (
                        <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,marginTop:10}}>
                          <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text,lineHeight:1.5,marginBottom:10,borderLeft:"2px solid "+T.gold,paddingLeft:10}}>{card.quote}</p>
                          {card.levers.map((l,i)=>(
                            <div key={i} style={{display:"flex",gap:6,marginBottom:5}}>
                              <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,flexShrink:0}}>{l.k} →</span>
                              <span style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.4}}>{l.v}</span>
                            </div>
                          ))}
                          <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T.gold,lineHeight:1.5,marginTop:10}}>{card.lesson}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Single expandable challenge card below */}
              <div onClick={()=>setD2MobCard(challengeOpen?null:"challenge")}
                style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${challengeOpen?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"20px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:challengeOpen?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Now try it yourself</div>
                    <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T2.text,lineHeight:1.3,marginBottom:4}}>Can you say it four ways?</div>
                    <div style={{fontFamily:T.sans,fontSize:13,color:T2.text3,fontWeight:300}}>Same sentence. Completely different voice.</div>
                  </div>
                  <span style={{fontFamily:T.sans,fontSize:16,color:challengeOpen?T.gold:"rgba(138,158,132,0.7)",marginLeft:12,flexShrink:0,transition:"color 0.2s"}}>{challengeOpen?"▴":"▸"}</span>
                </div>
                {challengeOpen && (
                  <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:16,marginTop:14}}>
                    {D2_MOB_CARDS.map((card,ci)=>(
                      <div key={ci} style={{marginBottom:ci<D2_MOB_CARDS.length-1?20:0}}>
                        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>{card.name}</div>
                        <p style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T2.text,fontStyle:"italic",marginBottom:10}}>{card.challenge.sentence}</p>
                        <div style={{display:"flex",flexDirection:"column"}}>
                          {card.challenge.modes.map((m,i,arr)=>(
                            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<arr.length-1?"0.5px solid rgba(138,158,132,0.15)":"none"}}>
                              <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,width:14,flexShrink:0}}>{i+1}.</span>
                              <span style={{fontFamily:T.sans,fontSize:13,color:T2.text,fontWeight:400}}>{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          );
        })()}

        {/* ── D3 Mobile Steps ─────────────────────────────────────────────── */}
        {isD3 && step==="Insight" && (
          <>
            <img src="/day3-insight.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center 40%",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Master Filler-Free Speech</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Most people are far stronger speakers than they realise. A few conscious habits are all that separates good from exceptional.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {D3_FACTS.map((n,i)=>(
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>{n.word}</div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{n.body}</p>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>The pause is not empty. It's where confidence lives.</p>
          </>
        )}
        {isD3 && step==="Theory" && (
          <>
            <img src="/day3-theory.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center 30%",display:"none"}}/>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>The Pause Principle</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Fillers are a habit, not a flaw. The strongest communicators simply replace them with intentional pauses.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"18px 20px",marginBottom:20,borderRadius:4}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>Fillers aren't a speech problem. They're a thinking problem.</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:10}}>Why we use fillers:</p>
            {D3_PAUSE_REASONS.map((r,i)=>(
              <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"16px 20px",marginBottom:10}}>
                <div style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>{r.n}. {r.label}</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{r.body}</p>
              </div>
            ))}
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>The strongest speakers pause often. Confident speakers own the silence.</p>
          </>
        )}
        {isD3 && step==="Example" && (
          <>
            <img src="/day1-lounge.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters of the Pause</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Tap each card to explore how they use silence.</p>
            {[
              {id:"freeman",name:"Morgan Freeman",preview:'No "ums." No "uhs." Just measured, deliberate speech. When he needs to think, he pauses.',quote:'"Hope is a good thing. Maybe the best of things. And no good thing ever dies."',why:"Silence creates anticipation. Fillers create distraction.",technique:"When you don't know what to say next, stop talking. Pause. Breathe. Continue.",lesson:"The pause is not your enemy. It's your tool."},
              {id:"wintour",name:"Anna Wintour",preview:'When asked "What makes a good editor?" she paused 3 seconds. Then: "Decisiveness." One word. Perfect answer.',quote:'"Decisiveness."',why:"Fillers signal uncertainty. Pauses signal control. She knows what she wants to say.",technique:"Prepare your answer before you speak. If you haven't decided what to say, don't start talking yet.",lesson:"Filler-free speech starts with knowing your point."},
              {id:"ginsburg",name:"Ruth Bader Ginsburg",preview:"Every pause was intentional. Every word was chosen. Her arguments were surgical: Pause. Point. Evidence. Pause. Next point.",quote:'"The question before the Court is... whether the statute applies in this case."',why:"In high-stakes environments, fillers cost you credibility. Precision builds trust.",technique:"Structure your thoughts before you speak. Point 1. Pause. Point 2. Pause. Conclusion.",lesson:"The higher the stakes, the fewer words you should use. And zero fillers."},
              {id:"obama3",name:"Barack Obama",preview:"Mid-sentence, he'll stop. Think. Then continue. That pause? Not a filler. A choice.",quote:'"The question is... what kind of country are we going to leave our children?"',why:"Pauses let your audience catch up. Fillers just fill time.",technique:"When you make an important point, pause after it. Let it land before you move on.",lesson:"Silence isn't empty space. It's emphasis."},
            ].map(card=>(
              <div key={card.id} onClick={()=>setD3MobCard(d3MobCard===card.id?null:card.id)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${d3MobCard===card.id?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"20px",marginBottom:12,cursor:"pointer",transition:"border-color 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3}}>{card.name}</div>
                  <span style={{fontFamily:T.sans,fontSize:12,color:d3MobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0,transition:"color 0.2s"}}>{d3MobCard===card.id?"▴ less":"▸ explore"}</span>
                </div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{card.preview}</p>
                {d3MobCard===card.id && (
                  <div style={{marginTop:16,paddingTop:16,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
                    <p style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text,lineHeight:1.4,marginBottom:12}}>{card.quote}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Why It Works</div>
                    <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:10}}>{card.why}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>The Technique</div>
                    <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:10}}>{card.technique}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>AmplifyU Lesson</div>
                    <p style={{fontFamily:T.sans,fontSize:15,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",margin:0}}>{card.lesson}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        {isD3 && step==="Practice" && (
          <>
            <img src="/practice-bg.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>From Filler to Filler-Free</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Practical exercises to break the habit.</p>
            {[{title:"Count Your Fillers",body:"Record 2 minutes. Count every filler. Goal: under 5 per minute. Awareness is 80% of the fix."},{title:"The 5-Second Pause",body:"Pause for 5 full seconds. It feels impossibly long to you. To your audience? Barely noticeable."},{title:"Replace with Breath",body:"Every urge to say 'um' — breathe instead. You physically can't say 'um' mid-inhale."},{title:"Slow Down",body:"Fillers multiply when you rush. Slow your speech by 20%. You'll have time to think between sentences."}].map((ex,i)=>(
              <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"16px 20px",marginBottom:10}}>
                <div style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:8}}>{ex.title}</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{ex.body}</p>
              </div>
            ))}
          </>
        )}
        {isD3 && step==="Simulation" && (
          <>
            <img src="/day1-simulation.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center 40%",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Speak Filler-Free — 60 Seconds</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Write your response with zero fillers. The AI detects every "um," "uh," "like," and "you know."</p>
            <D3MobileSim/>
          </>
        )}

        {/* ── D4 Mobile Steps ─────────────────────────────────────────────── */}
        {isD4 && step==="Insight" && (
          <>
            <img src="/day4-insight.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Why Short Sentences Win</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>The brain processes short sentences faster, retains them longer, and finds them more persuasive.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {D4_FACTS.map((n,i)=>(
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>{n.word}</div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{n.body}</p>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>Long sentences lose people. Short sentences move them.</p>
          </>
        )}
        {isD4 && step==="Theory" && (
          <>
            <img src="/millers-law.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>Miller's Law</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>In 1956, psychologist George Miller discovered something fundamental about how humans think.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"18px 20px",marginBottom:20,borderRadius:4}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>We can only hold 7 (±2) pieces of information in working memory at once.</p>
            </div>
            {["Every sentence creates a memory load.","Long sentences stack information faster than your audience can process.","By the time you reach the end, they've forgotten the beginning.","The fix? Short sentences."].map((p,i)=>(
              <p key={i} style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:10}}>{p}</p>
            ))}
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>One idea. One sentence. Full stop.</p>
          </>
        )}
        {isD4 && step==="Example" && (
          <>
            <img src="/day1-lounge.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters of Brevity</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Tap each card to explore how they do it.</p>
            {[
              {id:"hemingway",name:"Ernest Hemingway",preview:"Hemingway won the Nobel Prize for literature. His secret? Short sentences.",quote:'"The old man fished alone. Eighty-four days. No fish."',why:"Short sentences force precision. You can't hide weak ideas behind long ones.",technique:"Write your first draft. Then cut every unnecessary word. What's left is what matters.",lesson:"Every word you add dilutes your message. The best writers know what to leave out."},
              {id:"einstein",name:"Albert Einstein",preview:"Einstein explained the universe. He could have hidden behind equations. He didn't.",quote:'"Put your hand on a hot stove for a minute. It feels like an hour. Sit with a pretty girl for an hour. It feels like a minute. That\'s relativity."',why:"Short sentences make complex ideas accessible. Long sentences create distance between the idea and understanding.",technique:"Break the concept into pieces. Explain each piece in one sentence.",lesson:"If Einstein could explain the universe in short sentences, you can explain your work the same way."},
              {id:"chanel",name:"Coco Chanel",preview:"Chanel revolutionised fashion with one principle: Less is more.",quote:'"Fashion fades. Style remains."',why:"Each quote is a complete thought. No wasted words. Just precision.",technique:"Say what matters. Cut everything else.",lesson:"Elegance in communication is elimination. The best speakers know what to leave out."},
              {id:"goodall",name:"Jane Goodall",preview:"Goodall spent 60 years studying chimpanzees. She could use scientific jargon. She chooses not to.",quote:'"What you do makes a difference. And you have to decide what kind of difference you want to make."',why:"Short sentences make science human. Long sentences make it distant.",technique:"State the discovery in one sentence. State why it matters in the next. Stop there.",lesson:"The best educators make the complex feel simple. Short sentences are how they do it."},
            ].map(card=>(
              <div key={card.id} onClick={()=>setD4MobCard(d4MobCard===card.id?null:card.id)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${d4MobCard===card.id?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"20px",marginBottom:12,cursor:"pointer",transition:"border-color 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3}}>{card.name}</div>
                  <span style={{fontFamily:T.sans,fontSize:12,color:d4MobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0,transition:"color 0.2s"}}>{d4MobCard===card.id?"▴ less":"▸ explore"}</span>
                </div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{card.preview}</p>
                {d4MobCard===card.id && (
                  <div style={{marginTop:16,paddingTop:16,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
                    <p style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text,lineHeight:1.4,marginBottom:12}}>{card.quote}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Why It Works</div>
                    <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:10}}>{card.why}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>The Technique</div>
                    <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:10}}>{card.technique}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>AmplifyU Lesson</div>
                    <p style={{fontFamily:T.sans,fontSize:15,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",margin:0}}>{card.lesson}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        {isD4 && step==="Practice" && (
          <>
            <img src="/practice-bg.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>The Sentence Surgery Toolkit</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Practical exercises to cut without losing meaning.</p>
            <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"20px",marginBottom:12}}>
              <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>Exercise 1: The 15-Word Rule</div>
              <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:12}}>Paste a long sentence. Get it split into short ones under 15 words each.</p>
              <D4MobileSplit/>
            </div>
            <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"20px",marginBottom:12}}>
              <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>Top Rules</div>
              {["One idea per sentence. Full stop.","If you see 'and,' split the sentence.","Target: 15 words or fewer.","Cut every word that doesn't add meaning."].map((tip,i,arr)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<arr.length-1?"0.5px solid rgba(138,158,132,0.15)":"none",alignItems:"flex-start"}}>
                  <span style={{color:T.gold,fontSize:14,flexShrink:0,fontWeight:700}}>✓</span>
                  <span style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.7,fontWeight:400}}>{tip}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {isD4 && step==="Simulation" && (
          <>
            <img src="/day1-simulation.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center 40%",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Speak in Short Sentences — 60 Seconds</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Write your response using only short sentences. Get a brevity score.</p>
            <D4MobileSim/>
          </>
        )}

        {/* ── D1 Mobile Steps ─────────────────────────────────────────────── */}
        {isD1 && step==="Insight" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Why Clarity Wins</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Clear language makes ideas easier to understand, easier to remember, and easier to act on.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {D1_CLARITY_FACTS_DATA.map((n,i)=>{
                const open = d1MobCard===("cf"+i);
                return (
                  <div key={i} onClick={()=>setD1MobCard(open?null:"cf"+i)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                      <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                      <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0,transition:"color 0.2s"}}>{open?"▴":"▸"}</span>
                    </div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 12px":0}}>{n.sub}</p>
                    {open && (
                      <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:8}}>
                        {n.bullets.map((b,j)=>(
                          <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                            <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/>
                            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>The clearest communicator is often the most influential.</p>
          </>
        )}
        {isD1 && step==="Theory" && (
          <>
            <img src="/feynman-technique.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center 20%",display:"none"}}/>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>The Feynman Technique</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Richard Feynman won the Nobel Prize — and could explain quantum mechanics to a 12-year-old.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"18px 20px",marginBottom:20,borderRadius:4}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>If you can't explain it simply, you don't understand it well enough.</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:10}}>His secret? The 4-step clarity loop:</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{label:"1. Understand",body:"Choose a concept and study it deeply."},{label:"2. Explain",body:"Teach it in simple words as if to someone else. No jargon."},{label:"3. Simplify",body:"When you stumble, that's a gap. Go back and fill it."},{label:"4. Refine",body:"Review, clarify, improve. Repeat until a child could follow."}].map((p,i)=>(
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>{p.label}</div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{p.body}</p>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>Teaching forces you to understand. Simplifying forces you to think.</p>
          </>
        )}
        {isD1 && step==="Example" && (
          <>
            <img src="/day1-lounge.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters of Clear Communication</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Tap each card to explore how they do it.</p>
            {[
              {id:"attenborough",name:"David Attenborough",preview:"Attenborough explains ecosystems, evolution, planetary forces — topics that could drown in scientific jargon. Instead, he uses language anyone can picture.",quote:'"The rainforest is like a vast, green lung breathing life into our planet."',why:"He translates scientific complexity into vivid, everyday language. You don't need a biology degree to understand the Amazon.",technique:"Replace technical terms with pictures people already have in their heads. Make the abstract concrete.",lesson:"Clarity comes from choosing words that create images, not confusion."},
              {id:"branson",name:"Sir Richard Branson",preview:"Branson built a global empire. But he speaks like he's chatting with a friend.",quote:'"We just try to make things better for people. If we do that, they\'ll choose us."',why:"He uses plain English — words anyone would use. His message is so simple, you can repeat it back immediately.",technique:"Remove every word a 10-year-old wouldn't understand. If what's left still makes sense, you've found clarity.",lesson:"The clearest speakers use the simplest words."},
              {id:"brown",name:"Brené Brown",preview:"Brown spent 20 years researching vulnerability. She could hide behind academic language. She doesn't.",quote:'"Vulnerability is not weakness. It\'s the most accurate measure of courage."',why:"She distils complexity into a single, memorable idea. No theory. No jargon. Just truth you can use.",technique:'Ask: "If I had 10 seconds to explain this, what would I say?" That\'s your message.',lesson:"Complex ideas don't need complex language. The best thinkers can explain their work in one sentence."},
              {id:"mobama",name:"Michelle Obama",preview:"Michelle Obama addresses millions on education, equality, leadership. Complex topics. High stakes. But her messages are always clear.",quote:'"When they go low, we go high."',why:"She takes big ideas and distils them into phrases you can remember and repeat. No wasted words.",technique:"Find the core of your message — the part that could fit on a bumper sticker. Build everything else around that.",lesson:"Clear communicators decide what people should remember, then say that first."},
            ].map(card=>(
              <div key={card.id} onClick={()=>setD1MobCard(d1MobCard===card.id?null:card.id)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${d1MobCard===card.id?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"20px",marginBottom:12,cursor:"pointer",transition:"border-color 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3}}>{card.name}</div>
                  <span style={{fontFamily:T.sans,fontSize:12,color:d1MobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0,transition:"color 0.2s"}}>{d1MobCard===card.id?"▴ less":"▸ explore"}</span>
                </div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{card.preview}</p>
                {d1MobCard===card.id && (
                  <div style={{marginTop:16,paddingTop:16,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
                    <p style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text,lineHeight:1.4,marginBottom:12}}>{card.quote}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Why It Works</div>
                    <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:10}}>{card.why}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>The Technique</div>
                    <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:10}}>{card.technique}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>AmplifyU Lesson</div>
                    <p style={{fontFamily:T.sans,fontSize:15,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",margin:0}}>{card.lesson}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        {isD1 && step==="Practice" && (
          <>
            <D1ClarityChallenge T={T} T2={T2} isDesktop={false} onSimulation={()=>setIdx(STEPS.indexOf('Simulation'))}/>
          </>
        )}
        {isD1 && step==="Simulation" && (
          <>
            <D1SimWidget T={T} T2={T2} isDesktop={false}/>
          </>
        )}

        {/* ── NT (Day 8) Mobile Steps ─────────────────────────────────────── */}
        {isNT && step==="Insight" && (
          <>
            <img src="/narrative-transportation.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Why Stories Change Minds</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Stories transport your audience into a different world. Facts inform. Stories transform.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {NT_NEURO.map((n,i)=>(
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>{n.word}</div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{n.body}</p>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>Facts explain. Stories move people.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"16px 20px",marginTop:12,borderRadius:4}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>We are more engaged when we feel inside the story.</p>
            </div>
          </>
        )}
        {isNT && step==="Theory 1" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Dual Coding Theory</h2>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Green &amp; Brock, 2000</div>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Stories activate more of the brain than facts. They trigger emotion, memory, and meaning simultaneously. In professional settings, a well-placed story is the most powerful persuasion tool available.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {word:"Verbal Channel",  body:"Story activates the brain's language system — the same channel that processes speech, argument, and logic. It carries your message with precision."},
                {word:"Visual Channel",  body:"Story simultaneously triggers the brain's visual cortex, creating mental imagery. Facts alone never do this. Your audience sees what you describe."},
                {word:"65% vs 10%",      body:"People retain 65% of information delivered through story. Only 10% from data alone. Story isn't decoration — it's the delivery mechanism."},
                {word:"The Convergence", body:"Every skill you built in Week 1 — clarity, pace, structure, brevity — comes together in the moment you tell a story. This is where it all lands."},
              ].map((n,i)=>(
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>{n.word}</div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{n.body}</p>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T.gold,lineHeight:1.7,marginTop:8}}>The brain encodes story. It files away data.</p>
          </>
        )}
        {isNT && step==="Theory 2" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>The 6-Beat Framework</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Every great story follows a learnable pattern. Master these six beats and you can tell any story.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {n:1,beat:"Hook",         sub:"It starts with tension."},
                {n:2,beat:"Character",    sub:"Make it human. Make it real."},
                {n:3,beat:"Problem",      sub:"What broke? What's at stake?"},
                {n:4,beat:"Turning Point",sub:"What changes? Everything shifts."},
                {n:5,beat:"Resolution",   sub:"What happened? Why it matters."},
                {n:6,beat:"Meaning",      sub:"What stayed with us?"},
              ].map((b,i)=>(
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,marginBottom:4}}>Beat {b.n}</div>
                  <div style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text,marginBottom:4}}>{b.beat}</div>
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{b.sub}</p>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T.gold,lineHeight:1.7,marginTop:8}}>No tension = no story. No shift = no meaning.</p>
          </>
        )}
        {isNT && step==="Example" && (
          <>
            <img src="/day1-lounge.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Storytelling in the Wild</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Tap each card to explore stories that changed minds.</p>
            {[
              {id:"obama8",name:"Barack Obama",preview:'Obama doesn\'t open with policy. He opens with story. His 2004 DNC speech: "My father was a foreign student, born and raised in a small village in Kenya..."',quote:'"Only in America is my story possible."',why:"Personal narrative creates emotional connection before logical argument. By the time he said that line, you were already invested.",technique:"Start with the human story. Then connect it to the point. People remember stories. They forget statistics.",lesson:"The strongest arguments begin with a story that makes the listener feel something before you ask them to think something."},
              {id:"earthrise",name:"NASA's Earthrise",preview:"1968. Apollo 8 orbited the moon. William Anders took one photo: Earth rising over the lunar horizon.",quote:"A single image launched the environmental movement.",why:"The photo transported people into the astronaut's perspective. Suddenly, Earth wasn't an abstract concept. It was vulnerable. Worth protecting.",technique:"Find the moment that changes perspective. That's your story's centre.",lesson:"The most powerful stories don't argue. They transport. Show people a new view, and they'll draw their own conclusions."},
              {id:"gawande",name:"Surgeon Atul Gawande",preview:"Gawande could publish dense medical papers. Instead, he tells stories.",quote:'"The Checklist Manifesto" changed medical practice globally.',why:"The research was strong. But the story made it unforgettable. Doctors didn't adopt checklists because of data. They adopted them because they saw themselves in Gawande's story.",technique:"Lead with the person facing the problem. Show their struggle. Show the solution. Show the result.",lesson:"Data informs. Stories transform. Give them a narrative they can see themselves in."},
              {id:"cyber",name:"The Cyber Attack",preview:"A CISO needs budget for security. Facts alone won't convince the board.",quote:'"Last Tuesday at 3am, our systems went dark."',why:"Facts say \"this could happen.\" Stories say \"this happened. To us. It will happen again.\" The narrative transported the board into the future threat.",technique:"Three-act structure: what happened (Stakes), what went wrong (Obstacle), what it cost (Outcome).",lesson:"In high-stakes decisions, stories create urgency that facts can't."},
              {id:"pixar",name:"The Pixar Framework",preview:"Pixar used the same story structure for every film. It works because it mirrors how the human brain processes experience.",quote:'"Once upon a time… Until one day… Until finally…"',why:"The framework creates a predictable emotional arc. The brain anticipates each beat — and releases tension when it arrives. That release is what makes stories memorable.",technique:"Once upon a time… / Every day… / Until one day… / Because of that… / Because of that… / Until finally… Apply it to any professional story.",lesson:"This simple framework works for a boardroom pitch as well as it works for a Pixar film. Structure is what separates a story from a sequence of events."},
            ].map(card=>(
              <div key={card.id} onClick={()=>setNtMobCard(ntMobCard===card.id?null:card.id)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${ntMobCard===card.id?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"20px",marginBottom:12,cursor:"pointer",transition:"border-color 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3}}>{card.name}</div>
                  <span style={{fontFamily:T.sans,fontSize:12,color:ntMobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0,transition:"color 0.2s"}}>{ntMobCard===card.id?"▴ less":"▸ explore"}</span>
                </div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{card.preview}</p>
                {ntMobCard===card.id && (
                  <div style={{marginTop:16,paddingTop:16,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
                    <p style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text,lineHeight:1.4,marginBottom:12}}>{card.quote}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Why It Works</div>
                    <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:10}}>{card.why}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>The Technique</div>
                    <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.7,fontWeight:400,marginBottom:10}}>{card.technique}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>AmplifyU Lesson</div>
                    <p style={{fontFamily:T.sans,fontSize:15,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",margin:0}}>{card.lesson}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        {isNT && step==="Practice" && (
          <>
            <img src="/practice-bg.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Build Your Story</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Answer three questions. Your AI coach builds the story using the 6-beat arc.</p>
            <StoryBuilderWidget onSave={s => { setNtStory(s); try { localStorage.setItem("au1_nt_story",s); } catch(_){} }}/>
          </>
        )}

        {/* ── D9 (Day 9) Mobile Steps ─────────────────────────────────────── */}
        {isD9 && step==="Insight" && (
          <>
            <div style={{background:T2.cardDark,borderRadius:2,padding:"20px"}}>
              <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:"rgba(255,255,255,0.88)",lineHeight:1.5,margin:0}}>It's not what you say — it's how you say it. Great content delivered poorly is forgotten. Simple content delivered powerfully is remembered.</p>
            </div>
            <div style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
              <div style={{fontSize:10,fontWeight:700,color:T.goldDark,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>The Delivery Contrast</div>
              <div style={{padding:"10px 12px",background:"rgba(139,74,56,0.06)",borderRadius:3,borderLeft:"2px solid rgba(139,74,56,0.3)",marginBottom:8}}>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,margin:0}}>One rushes. No pauses. Monotone. Eyes down.</p>
              </div>
              <div style={{padding:"10px 12px",background:"rgba(138,158,132,0.06)",borderRadius:3,borderLeft:"2px solid "+T.gold}}>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,margin:0}}>One slows down. Strategic pauses. Vocal variation. Eye contact.</p>
              </div>
            </div>
          </>
        )}
        {isD9 && step==="Theory" && (
          <div style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
            <div style={{fontSize:10,fontWeight:700,color:T.goldDark,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>The 5 Ps of Powerful Delivery</div>
            {D9_FIVE_PS.map((p,i) => (
              <div key={i} style={{marginBottom:i<4?14:0,paddingBottom:i<4?14:0,borderBottom:i<4?"0.5px solid "+T2.divider:"none"}}>
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
                  <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,letterSpacing:"0.15em",textTransform:"uppercase"}}>{p.p}</span>
                  <span style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text}}>{p.heading}</span>
                </div>
                <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.65,fontWeight:300,margin:0}}>{p.body}</p>
              </div>
            ))}
          </div>
        )}
        {isD9 && step==="Example" && (
          <div style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
            <div style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>Delivery Masters</div>
            {[{name:"Brené Brown",lesson:"She doesn't perform. She connects. Pauses let the emotion land. Conversational tone = immediate trust."},
              {name:"Simon Sinek",lesson:"He slows down on the big idea. Repetition builds rhythm. He lets the audience finish the thought."},
              {name:"Amy Cuddy",lesson:"Her body tells the story before she speaks. The pause after 'BECOME it' is everything."},
              {name:"Steve Jobs",lesson:"Strategic pauses build anticipation. Precision in language = clarity in impact."}].map((ex,i)=>(
              <div key={i} style={{marginBottom:i<3?14:0,paddingBottom:i<3?14:0,borderBottom:i<3?"0.5px solid "+T2.divider:"none"}}>
                <div style={{fontSize:12,fontWeight:600,color:T.goldDark,marginBottom:4}}>{ex.name}</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.65,margin:0}}>{ex.lesson}</p>
              </div>
            ))}
          </div>
        )}
        {isD9 && step==="Practice" && (
          <div style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
            <div style={{fontSize:10,fontWeight:700,color:T.goldDark,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>AI Delivery Coach</div>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text2,lineHeight:1.7,marginBottom:16}}>Your Day 8 story loads automatically. Work through 5 delivery refinements.</p>
            <DeliveryCoachWidget onSave={s => { setD9Script(s); try { localStorage.setItem("au1_d9_script",s); } catch(_){} }}/>
          </div>
        )}
        {isD9 && step==="Simulation" && (
          <>
            {d9Script ? (
              <div style={{background:T2.surface,borderRadius:2,padding:"14px 16px",borderLeft:"2px solid "+T.gold}}>
                <div style={{fontSize:10,fontWeight:700,color:T.goldDark,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Your Delivery Script</div>
                <p style={{fontFamily:T.serif,fontSize:13,color:T2.text,lineHeight:1.75,margin:0,whiteSpace:"pre-wrap"}}>{d9Script}</p>
              </div>
            ) : (
              <div style={{background:T2.surface,borderRadius:2,padding:"14px 16px"}}>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,fontStyle:"italic",margin:0}}>Go back to Practice to prepare your delivery script first.</p>
              </div>
            )}
            <Timer totalSecs={180} label="Deliver your story — 3 minutes"/>
          </>
        )}

        {/* ── Generic steps (all other days) ─────────────────────────────── */}
        {/* ── D5 Mobile Steps ─────────────────────────────────────────────── */}
        {isD5 && step==="Insight" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Why Structure Wins</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Structure is how you organise your thinking before you speak. PRE helps you do that: start with your point, explain why it matters, then bring it to life with an example.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {word:"Credibility",  body:"Leading with your point signals clear thinking. Structured communication creates immediate credibility and helps your ideas land with confidence and authority."},
                {word:"Recall",       body:"Structured messages are 40% more memorable. A clear beginning, middle and end helps your audience store and retrieve your message with ease."},
                {word:"Persuasion",   body:"Great ideas rarely persuade on their own — structure is what makes them land. PRE helps you present a clear point, support it with logic, and reinforce it with proof that moves people to action."},
                {word:"Decision Speed", body:"Leaders decide faster when communication is structured. Lead with your point and you accelerate every conversation you're in."},
              ].map((n,i)=>(
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>{n.word}</div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{n.body}</p>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>Structure is the backbone of every powerful communication.</p>
          </>
        )}
        {isD5 && step==="Theory" && (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>The PRE Framework</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Two powerful findings from memory science explain exactly why PRE works — and why it's one of the most reliable communication frameworks available.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"18px 20px",marginBottom:20,borderRadius:4}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>People remember the beginning and end of information most clearly. The middle is forgotten.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[
                {n:"Point",    role:"Strong opening anchor",    body:"Lead with your conclusion. The brain locks onto the first thing it hears — give it something worth remembering."},
                {n:"Reason",   role:"Cognitive bridge",          body:"Connect your point to meaning. This is how you make the idea stick — not just land."},
                {n:"Example",  role:"Memorable closing proof",   body:"Finish with evidence. The recency effect means your example is the last thing heard — and the most recalled."},
                {n:"Processing Fluency", role:"The multiplier", body:"Clear, easy-to-follow ideas are perceived as more intelligent, credible, and persuasive. PRE delivers that clarity every time."},
              ].map((b,i)=>(
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>{b.n}</div>
                  <div style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:T2.text,marginBottom:4}}>{b.role}</div>
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{b.body}</p>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:4}}>PRE isn't just structure — it's how the brain naturally wants to receive information.</p>
          </>
        )}
        {isD5 && step==="Example" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>PRE in Action</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Tap each card to see how world-class leaders use PRE — whether they name it or not.</p>
            {[
              {id:"nooyi",name:"Indra Nooyi",preview:"CEO of PepsiCo.",
                point:'"Performance must be married with purpose."',
                reason:'"The world around us is changing. Consumers are changing. Governments are changing. Society is changing."',
                example:'"At PepsiCo, we\'ve transformed our portfolio, reducing sugar, sodium and saturated fat, while investing in sustainability and our people."',
                proof:"At PepsiCo this became tangible action: healthier product innovation, reducing sugar, salt and fat, sustainability initiatives, packaging redesign, and environmental commitments. She didn't leave it as philosophy — she operationalised it.",
                lesson:"Point → big strategic belief. Reason → why the market demands it. Example → concrete execution. That's why she feels persuasive, intelligent, and trustworthy."},
              {id:"huang",name:"Jensen Huang",preview:"Founder of Nvidia.",
                point:'"I don\'t need to build a killer product overnight, I just need to build a winning product."',
                reason:'"And the goal of winning is so that you can play again."',
                example:'"It\'s just like pinball. If you could just play well enough to get another game, you could be there for a long time."',
                proof:"NVIDIA itself — for years, GPUs were niche, gaming seemed narrow, and AI wasn't commercially obvious. NVIDIA kept making bets and staying in the game until one breakthrough arrived: AI and accelerated computing. That single win transformed NVIDIA into one of the most valuable companies on earth.",
                lesson:"He doesn't over-explain. Sharp thesis. Strategic rationale. Lived proof. Said in 1993 — decades before the breakthrough that proved it true. That's what powerful communicators do."},
            ].map(card=>(
              <div key={card.id} onClick={()=>setD5MobCard(d5MobCard===card.id?null:card.id)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${d5MobCard===card.id?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"20px",marginBottom:12,cursor:"pointer",transition:"border-color 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3}}>{card.name}</div>
                  <span style={{fontFamily:T.sans,fontSize:12,color:d5MobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0,transition:"color 0.2s"}}>{d5MobCard===card.id?"▴ less":"▸ explore"}</span>
                </div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{card.preview}</p>
                {d5MobCard===card.id && (
                  <div style={{marginTop:16,paddingTop:16,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
                    {["Point","Reason","Example"].map((label,i)=>(
                      <div key={i} style={{marginBottom:14}}>
                        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{label}</div>
                        <p style={{fontFamily:T.serif,fontSize:16,fontWeight:500,color:T2.text,lineHeight:1.5,fontStyle:"italic",margin:0}}>{[card.point,card.reason,card.example][i]}</p>
                      </div>
                    ))}
                    {card.proof && (
                      <div style={{marginBottom:14}}>
                        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{card.id==="huang"?"Nvidia Is The Proof":"PepsiCo Is The Proof"}</div>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{card.proof}</p>
                      </div>
                    )}
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Why This Works</div>
                    <p style={{fontFamily:T.serif,fontSize:16,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",margin:0}}>{card.lesson}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {isD2 && step==="Practice" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Train Your Instrument</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Voice requires repetition. Work through each exercise then take the speed challenge.</p>
            <D2PracticeWidget T={T} T2={T2} isDesktop={false}/>
          </>
        )}
        {isD2 && step==="Simulation" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Real-World Voice Coaching</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Pick a scenario. Write what you'd say. Your AI coach evaluates your delivery across six dimensions.</p>
            <D2SimWidget T={T} T2={T2} isDesktop={false}/>
          </>
        )}
        {isD2 && step==="Theory" && (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:14}}>The 88 Keys</h2>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"16px 20px",marginBottom:20,borderRadius:4}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0,fontStyle:"italic"}}>"Your voice is a piano with 88 keys. You've been playing the same 5 your whole life."</p>
            </div>
            {/* Science cards — expandable */}
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>The Science of Vocal Influence</div>
            {[
              {label:"Prosody",            sub:"Your voice carries meaning before words do",   bullets:["Humans decode emotion through rhythm, pitch, pace, and stress — faster than language itself.","The way you say something communicates intent, confidence, and feeling before the content registers."]},
              {label:"Processing Fluency", sub:"Easy to hear = easy to trust",                 bullets:["Clear, varied, well-paced speech signals intelligence. The brain equates 'easy to process' with credibility.","Flat or rushed delivery creates cognitive friction — and the listener associates that friction with the speaker."]},
              {label:"Vocal Contrast",     sub:"Variation is what keeps people in the room",  bullets:["The same reason music works: contrast creates anticipation and emotional engagement.","No variation is cognitive wallpaper — it fades into the background within seconds, no matter how important the message."]},
            ].map((sc,i)=>{
              const open = d2MobCard===("d2t"+i);
              return (
                <div key={i} onClick={()=>setD2MobCard(open?null:"d2t"+i)}
                  style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px 16px",marginBottom:10,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?6:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,flex:1}}>{sc.label}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0,transition:"color 0.2s"}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 10px":0}}>{sc.sub}</p>
                  {open && (
                    <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                      {sc.bullets.map((b,j)=>(
                        <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                          <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/>
                          <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {/* 4 levers grid */}
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10,marginTop:4}}>The Four Levers</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              {[
                {word:"Pace",  body:"Speed up to create energy. Slow down to signal importance."},
                {word:"Pitch", body:"Rise to engage. Drop to command."},
                {word:"Pause", body:"The silence that makes the next word hit harder."},
                {word:"Power", body:"Volume as intention, not volume as effort."},
              ].map((n,i)=>(
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>{n.word}</div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{n.body}</p>
                </div>
              ))}
            </div>
            {/* Audio interaction */}
            <div style={{background:T2.cardDark,borderRadius:8,padding:"20px",marginBottom:4}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>Hear the Difference</div>
              <p style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:"rgba(245,239,230,0.9)",marginBottom:16,lineHeight:1.3}}>"I think this could work."</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
                {["Fast","Slow","High Pitch","Low Pitch","Monotone","Warm / Confident"].map((label,i)=>(
                  <button key={i} style={{
                    background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",
                    borderRadius:6,padding:"10px 6px",cursor:"pointer",
                    display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                    fontFamily:T.sans,minHeight:32,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(138,158,132,0.8)" strokeWidth="1.2"/><path d="M5.5 4.5l4 2.5-4 2.5V4.5z" fill="rgba(138,158,132,0.8)"/></svg>
                    <span style={{fontSize:10,color:"rgba(245,239,230,0.6)",fontWeight:500,textAlign:"center",lineHeight:1.2}}>{label}</span>
                  </button>
                ))}
              </div>
              <div style={{borderTop:"0.5px solid rgba(255,255,255,0.08)",paddingTop:14}}>
                <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.6}}>What changed? Not the words. The meaning.</p>
              </div>
            </div>
          </>
        )}

        {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD10 && !isD11 && step==="Insight" && (
          <>
            <div
style={{background:T2.cardDark,borderRadius:2,padding:"26px 24px",position:"relative",overflow:"hidden"}}>
              <div
style={{position:"absolute",top:-10,right:10,fontSize:100,lineHeight:1,color:"rgba(255,255,255,0.04)",fontFamily:T.serif}}>"</div>
              <p
style={{fontFamily:T.serif,fontSize:20,fontStyle:"italic",color:"rgba(255,255,255,0.88)",lineHeight:1.5,margin:0}}>{lesson.quote}</p>
            </div>
            <div
style={{background:T2.surface,borderRadius:16,padding:"18px 20px"}}>
              <div
style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>Today's
Insight</div>
              <p
style={{fontSize:15,color:T2.text,lineHeight:1.7}}>{lesson.insight}</p>
            </div>
            {lesson.day !== 1 && (
              <div style={{background:T2.goldLight,borderRadius:0,borderLeft:"2px solid "+T.gold,padding:"14px 16px"}}>
                <div style={{fontSize:10,fontWeight:700,color:T.goldDark,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>PIE Connection</div>
                <p style={{margin:0,fontSize:13,color:T.goldDark,lineHeight:1.55}}>{lesson.pieLink}</p>
              </div>
            )}
          </>
        )}

        {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD10 && !isD11 && step==="Theory" && <TheoryCard day={lesson.day}/>}

        {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD10 && !isD11 && step==="Example" && (
          <>
            <div style={{background:"#FDF0EE",border:"1px solid #F0C5C0",borderRadius:2,padding:"16px 18px"}}>
              <div
style={{fontSize:10,fontWeight:700,color:T.red,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Not
this</div>
              <p
style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:"#5C1A14",lineHeight:1.55,margin:0}}>{lesson.bad}</p>
            </div>
            <div style={{background:"#EBF0EB",border:"1px solid #A8C4A4",borderRadius:2,padding:"16px 18px"}}>
              <div
style={{fontSize:10,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Say
this instead</div>
              <p
style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:"#2C4A38",lineHeight:1.55,margin:0}}>{lesson.good}</p>
            </div>
            <div
style={{background:T2.surface,borderRadius:2,padding:"16px 18px"}}>
              <div
style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>Starter
Phrases</div>
              {lesson.phrases.map((ph,i) => (
                <div key={i}
style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<lesson.phrases.length-1?"1px solid "+T2.divider:"none"}}>
                  <div
style={{width:2,height:2,borderRadius:0,background:T.gold,flexShrink:0}}/>
                  <p
style={{margin:0,fontSize:14,color:T2.text2,fontStyle:"italic"}}>{ph}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {isD5 && step==="Practice" && (
          <>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"16px 20px",borderRadius:4}}>
              <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"If you can explain everyday decisions using PRE, you'll be able to use it in meetings, interviews, presentations, and high-stakes conversations without thinking."</p>
            </div>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:1.5}}>PRE Examples</div>
            <D5PracticeWidget T={T} T2={T2} isDesktop={false}/>
          </>
        )}
        {isD6 && step==="Insight" && (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Why Composure Wins</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Stay Calm Under Pressure</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Most people communicate well when conversations are easy. But leadership, trust, and reputation are often shaped in moments of tension.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {word:"Emotion",    body:"Stress narrows thinking and makes reactive communication more likely. Composure keeps your thinking wide open when it matters most."},
                {word:"Perception", body:"When others escalate, composure signals leadership. Calm in the room reads as confidence — and earns instant credibility."},
                {word:"Influence",  body:"Your emotional state affects everyone around you. Calm is contagious. The steadiest person shapes the entire dynamic."},
                {word:"Outcome",    body:"Anyone can communicate well when things are easy. The conversations that define your career happen under pressure."},
              ].map((n,i) => (
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>{n.word}</div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{n.body}</p>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>Composure is communication under pressure.</p>
          </>
        )}
        {isD6 && step==="Theory" && (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science of Composure</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>What Happens Under Pressure</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>High-stakes conversations trigger biology before logic. Elite communicators understand the mechanics — and train to override them.</p>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"16px 20px",marginBottom:16,borderRadius:4}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>The strongest communicator is often the calmest person in the room.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[
                {n:"Threat Response",      role:"Biology before logic",        body:"Criticism and conflict trigger fight-or-flight — faster speech, defensive tone, poor listening, impulsive reactions."},
                {n:"Emotional Regulation", role:"Pause before performance",    body:"Breathe lower. Slow your pace. Use shorter responses. Strategic silence does the work before your words do."},
                {n:"Framing",             role:"Language changes temperature", body:"'You're wrong' escalates. 'I see this differently' opens space. Same disagreement — completely different outcome."},
                {n:"Listening",           role:"Being heard starts with hearing", body:"People de-escalate when they feel understood. Composure includes genuinely hearing — not just waiting to respond."},
              ].map((b,i) => (
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>{b.n}</div>
                  <div style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:T2.text,marginBottom:4}}>{b.role}</div>
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{b.body}</p>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:4}}>Composure isn't the absence of pressure — it's what you build so pressure doesn't change you.</p>
          </>
        )}
        {isD6 && step==="Example" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters Under Pressure</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Tap each card to explore how world-class communicators handle difficult moments.</p>
            {[
              {id:"obama",name:"Barack Obama",preview:"44th President — Measured Under Fire.",
               quote:'"If you\'re walking down the right path and you\'re willing to keep walking, eventually you\'ll make progress."',
               what:["deliberate pace","controlled tone","emotional restraint","strategic pauses","executive calm"],
               lesson:"Pressure rewards composure. Obama demonstrated that you can engage with the hardest questions without being destabilised by them.",
               practice:'"I understand your concern, but I see it differently." — Try it defensive, calm, dismissive, then composed authority.'},
              {id:"brown",name:"Brené Brown",preview:"Research Professor — Strength Through Vulnerability.",
               quote:'"Clear is kind."',
               what:["warmth without weakness","honest delivery","grounded presence","emotional steadiness"],
               lesson:"Clarity and empathy can coexist. Difficult conversations often land better — not softer — when directness replaces avoidance.",
               practice:'"I wanted to raise something difficult." — Try it nervous, compassionate, overly apologetic, then clear and calm.'},
            ].map(card => (
              <div key={card.id} onClick={()=>setD6MobCard(d6MobCard===card.id?null:card.id)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${d6MobCard===card.id?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"20px",marginBottom:12,cursor:"pointer",transition:"border-color 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3}}>{card.name}</div>
                  <span style={{fontFamily:T.sans,fontSize:12,color:d6MobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0}}>{d6MobCard===card.id?"▴ less":"▸ explore"}</span>
                </div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{card.preview}</p>
                {d6MobCard===card.id && (
                  <div style={{marginTop:16,paddingTop:16,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Quote</div>
                    <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:"0 0 14px"}}>{card.quote}</p>
                    <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>What makes it powerful</div>
                    {card.what.map((w,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                        <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0}}/>
                        <span style={{fontFamily:T.sans,fontSize:12,color:T2.text,fontWeight:300}}>{w}</span>
                      </div>
                    ))}
                    <div style={{marginTop:12}}>
                      <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Lesson</div>
                      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T.gold,lineHeight:1.6,margin:"0 0 12px"}}>{card.lesson}</p>
                      <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Try it</div>
                      <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.6,margin:0}}>{card.practice}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:4}}>Pressure doesn't create communication habits. It reveals them.</p>
          </>
        )}
        {isD6 && step==="Practice" && (
          <>
            <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"14px 16px",borderRadius:4}}>
              <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"The phrases that work best under pressure are the ones you've practised until they feel natural — not rehearsed."</p>
            </div>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:1.5}}>Scenario Drills</div>
            <D6PracticeWidget T={T} T2={T2} isDesktop={false}/>
          </>
        )}
        {isD6 && step==="Simulation" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Real-World Conversation Coaching</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Choose a scenario. Write your response. Your coach evaluates composure, clarity, empathy, and executive presence.</p>
            <D6SimWidget T={T} T2={T2} isDesktop={false}/>
          </>
        )}
        {isD11 && step==="Insight" && (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Why Image Matters</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Perception Is Built From Signals</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Most people let others form assumptions about them by default. The most effective communicators choose their signals intentionally.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {D11_FACTS.map((n,i)=>(
                <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                  <div style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:6}}>{n.word}</div>
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.6,fontWeight:400,margin:"0 0 6px"}}>{n.body}</p>
                  <div style={{fontFamily:T.sans,fontSize:10,color:T2.text4,fontStyle:"italic"}}>{n.source}</div>
                </div>
              ))}
            </div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>Be your brand.</p>
          </>
        )}
        {isD11 && step==="Theory" && (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science of Personal Brand</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>The Halo Effect</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:14}}>When people notice one standout positive trait, they often assume other positive qualities must be true too.</p>

            {/* Aligned signal table */}
            <div style={{border:"0.5px solid "+T2.border,borderRadius:4,overflow:"hidden",marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 24px 1fr",background:T2.surface,padding:"8px 14px",borderBottom:"0.5px solid "+T2.divider}}>
                <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px"}}>You appear</span>
                <span/>
                <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text4,textTransform:"uppercase",letterSpacing:"1px"}}>They assume</span>
              </div>
              {[["Articulate","Intelligence"],["Calm","Competence"],["Stylish","Success"],["Confident","Capability"],["Warm","Trustworthiness"]].map(([s,r],i,arr)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 24px 1fr",alignItems:"center",padding:"11px 14px",background:i%2===0?T2.bg:T2.surface,borderBottom:i<arr.length-1?"0.5px solid "+T2.divider:"none"}}>
                  <span style={{fontFamily:T.sans,fontSize:13,fontWeight:500,color:T2.text}}>{s}</span>
                  <span style={{fontFamily:T.sans,fontSize:13,color:T.gold,textAlign:"center",fontWeight:300}}>→</span>
                  <span style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T.gold}}>{r}</span>
                </div>
              ))}
            </div>
            <div style={{padding:"12px 14px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T2.border,marginBottom:20}}>
              <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text2,lineHeight:1.6,margin:0}}>"People rarely remember everything about you. They remember the strongest signal you gave them."</p>
            </div>

            {/* Brand formula */}
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>The Brand Formula</div>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:12}}>Six ingredients. Tap any to expand.</p>
            {D11_INGREDIENTS.map((ing,i)=>{
              const open = d11MobCard===("ing"+i);
              return (
                <div key={i} onClick={()=>setD11MobCard(open?null:"ing"+i)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"14px",marginBottom:8,cursor:"pointer",transition:"border-color 0.2s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:open?T.gold:"rgba(138,158,132,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>
                      <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:"white"}}>{i+1}</span>
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T2.text}}>{ing.n}</span>
                      <span style={{fontFamily:T.sans,fontSize:12,color:T2.text4,marginLeft:8}}>{ing.tagline}</span>
                    </div>
                    <span style={{fontFamily:T.sans,fontSize:11,color:open?T.gold:T2.text4}}>{open?"▴":"▸"}</span>
                  </div>
                  {open && (
                    <div style={{marginTop:12,paddingTop:12,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
                      <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.65,fontWeight:300,margin:"0 0 10px"}}>{ing.body}</p>
                      <div style={{padding:"8px 10px",background:"rgba(247,243,236,0.7)",borderRadius:3,marginBottom:8}}>
                        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.goldDark,textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>{ing.psych}</div>
                        <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,lineHeight:1.5,margin:0,fontWeight:300}}>{ing.psychBody}</p>
                      </div>
                      <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold}}>→ {ing.takeaway}</div>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{padding:"14px 16px",background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,borderRadius:4,marginTop:4}}>
              <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T.gold,margin:0,lineHeight:1.6}}>Your brand is the story people tell themselves about you after repeated exposure.</p>
            </div>
          </>
        )}
        {isD11 && step==="Example" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Iconic Brands. Intentional Choices.</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Tap each card to explore how these brand icons built recognition through deliberate signals.</p>
            {D11_EXAMPLES.map(card=>{
              const open = d11MobCard===card.id;
              return (
                <div key={card.id} onClick={()=>setD11MobCard(open?null:card.id)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"20px",marginBottom:12,cursor:"pointer",transition:"border-color 0.2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <div style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:2}}>{card.name}</div>
                      <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3}}>{card.role}</div>
                    </div>
                    <span style={{fontFamily:T.sans,fontSize:12,color:open?T.gold:T2.text3,marginLeft:10,flexShrink:0}}>{open?"▴ less":"▸ explore"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{card.headline}</p>
                  {open && (
                    <div style={{marginTop:16,paddingTop:16,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,fontWeight:300,marginBottom:12}}>{card.body}</p>
                      {card.ingredients && (
                        <div style={{marginBottom:14}}>
                          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Brand Formula Map</div>
                          {card.ingredients.map((ing,i)=>(
                            <div key={i} style={{display:"flex",gap:8,paddingBottom:10,marginBottom:10,borderBottom:i<card.ingredients.length-1?"0.5px solid rgba(138,158,132,0.15)":"none",alignItems:"flex-start"}}>
                              <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(138,158,132,0.15)",border:"0.5px solid "+T.gold,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                                <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold}}>{i+1}</span>
                              </div>
                              <div>
                                <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T2.text,marginBottom:2}}>{ing.n}</div>
                                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:0}}>{ing.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Lesson</div>
                      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T.gold,lineHeight:1.6,margin:0}}>{card.lesson}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
        {isD11 && step==="Practice" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Build Your Brand</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Three exercises. Each builds a different layer of your brand architecture.</p>
            <D11PracticeWidget T={T} T2={T2} isDesktop={false}/>
          </>
        )}
        {isD11 && step==="Simulation" && (
          <>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Your Brand Coach</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Four scenarios where your brand is built or broken. Write your response and get coached.</p>
            <D11SimWidget T={T} T2={T2} isDesktop={false}/>
          </>
        )}
        {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD10 && !isD11 && step==="Practice" && (
          <>
            <div
style={{background:T2.surface,borderRadius:16,padding:"18px 20px"}}>
              <div
style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>Your
Practice</div>
              <p
style={{fontSize:15,color:T2.text,lineHeight:1.7}}>{lesson.practice}</p>
            </div>
            <Timer totalSecs={180} label="3 minutes"/>
            <div
style={{background:T2.goldLight,borderRadius:0,borderLeft:"2px solid "+T.gold,padding:"14px 16px"}}>
              <p
style={{margin:0,fontSize:13,color:T.goldDark,lineHeight:1.5}}>Speak out
loud first. Then use the coach below to polish your response into
something you can use in real life.</p>
            </div>
            <CoachWidget lesson={lesson} scenario={null}/>
          </>
        )}

        {!isD1 && !isD2 && !isD6 && !isD11 && step==="Simulation" && (
          <>
            {(()=>{
              const scenarios = roleId ? getScenariosForDay(roleId,
lesson.day) : lesson.scenarios;
              const activeSc = scenarios[selSc] || scenarios[0];
              return (
                <>
                  {/* Role badge + scenario switcher in one row */}
                  <div 
style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                    {activeRole ? (
                      <div 
style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:T.navy,borderRadius:8,border:"1px solid rgba(138,158,132,0.2)",flexShrink:0}}>
                        <span 
style={{color:T.gold,fontSize:12}}>{activeRole.icon}</span>
                        <span 
style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.65)"}}>{activeRole.label}</span>
                      </div>
                    ) : <div/>}
                    {/* Scenario number switcher — numbers only, no 
repeated text */}
                    <div 
style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span 
style={{fontSize:10,color:T2.text4,marginRight:2}}>Scenario:</span>
                      {scenarios.map((_,i) => (
                        <button key={i} onClick={()=>setSelSc(i)} style={{
                          width:32,height:32,minHeight:32,borderRadius:"50%",
                          border:"1px solid "+(selSc===i?T.navy:T.border),
                          background:selSc===i?T.navy:"transparent",
                          color:selSc===i?"white":T.text3,
                          fontSize:12,fontWeight:700,cursor:"pointer",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          padding:0,flexShrink:0,
                        }}>{i+1}</button>
                      ))}
                    </div>
                  </div>
                  {/* Scenario text shown once, prominently */}
                  <div 
style={{background:T2.cardDark,borderRadius:2,padding:"26px 24px"}}>
                    <div 
style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:2,marginBottom:12}}>Your 
scenario</div>
                    <p 
style={{fontFamily:T.serif,fontSize:21,fontWeight:600,color:"white",lineHeight:1.4,margin:0}}>{activeSc}</p>
                  </div>
                  <Timer totalSecs={180} label="Speak for up to 3 
minutes"/>
                </>
              );
            })()}
            <div 
style={{background:T2.surface,borderRadius:2,padding:"14px 16px"}}>
              <div 
style={{fontSize:11,fontWeight:600,color:T2.text3,marginBottom:10}}>Strong 
responses always:</div>
              {["State your point clearly","Give one reason","Add a real example"].map((txt,i) => (
                <div key={i} 
style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?8:0}}>
                  <svg width="16" height="16" viewBox="0 0 16 16" 
fill="none"><circle cx="8" cy="8" r="7" stroke={T.gold} 
strokeWidth="1"/><path d="M5 8l2 2 4-4" stroke={T.gold} strokeWidth="1.3" 
strokeLinecap="round"/></svg>
                  <span style={{fontSize:13,color:T2.text2}}>{txt}</span>
                </div>
              ))}
            </div>
            <CoachWidget lesson={lesson} scenario={(roleId ? 
getScenariosForDay(roleId, lesson.day) : lesson.scenarios)[selSc] || 
(roleId ? getScenariosForDay(roleId, lesson.day) : lesson.scenarios)[0]}/>
          </>
        )}

        {step==="Review" && (
          <>
            {/* Header */}
            <div style={{padding:"28px 24px 4px"}}>
              <div style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"2px",color:T.gold,marginBottom:16,fontFamily:T.sans}}>Day {lesson.day} Complete ✓</div>
              <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.05,letterSpacing:"-0.5px",marginBottom:12}}>Go Deeper</h2>
              <p style={{fontFamily:T.sans,fontSize:14,fontWeight:300,color:T2.text2,lineHeight:1.65,marginBottom:0}}>You've learned the techniques. These books will make you unstoppable.</p>
            </div>

            {/* Book cards */}
            {(()=>{
              const fr = FURTHER_READING[lesson.day-1];
              if(!fr) return null;
              return fr.books.map((book,bi)=>{
                const saved = savedBooks.includes(book.title);
                return (
                  <div key={bi} style={{background:"white",borderRadius:8,margin:"0 4px",boxShadow:"0 2px 8px rgba(44,36,22,0.08),0 8px 24px rgba(44,36,22,0.04)",overflow:"hidden"}}>
                    {/* Cover + info row */}
                    <div style={{display:"flex",gap:0,alignItems:"stretch"}}>
                      {/* Cover */}
                      <div style={{width:110,flexShrink:0,background:"linear-gradient(145deg,#2C2416 0%,#4A3828 55%,#2C2416 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px 10px",textAlign:"center",position:"relative"}}>
                        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,"+T.gold+",rgba(138,158,132,0.3))"}}/>
                        <p style={{fontFamily:T.serif,fontSize:11,fontWeight:600,color:"#F5EFE6",lineHeight:1.3,marginBottom:8}}>{book.title}</p>
                        <div style={{width:20,height:1,background:T.gold,opacity:0.5,marginBottom:8}}/>
                        <p style={{fontFamily:T.sans,fontSize:9,color:"rgba(245,239,230,0.5)",letterSpacing:"0.3px"}}>{book.author}</p>
                      </div>
                      {/* Info */}
                      <div style={{flex:1,padding:"18px 16px"}}>
                        <h3 style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:"#2C2416",marginBottom:4,letterSpacing:"-0.2px"}}>{book.title}</h3>
                        <p style={{fontFamily:T.sans,fontSize:12,color:"#6B5E44",marginBottom:12}}>{book.author}</p>
                        {book.quote && (
                          <p style={{fontFamily:T.sans,fontSize:13,fontStyle:"italic",color:"#2C2416",lineHeight:1.55,marginBottom:10,borderLeft:"3px solid "+T.gold,paddingLeft:10}}>
                            <span style={{color:T.gold,fontStyle:"normal"}}>"</span>{book.quote}<span style={{color:T.gold,fontStyle:"normal"}}>"</span>
                          </p>
                        )}
                        {book.rating && (
                          <p style={{fontFamily:T.sans,fontSize:12,color:"#8A7B66",marginBottom:0}}>
                            <span style={{color:"#C9A227"}}>★★★★★</span> {book.rating}/5 · {book.reviewCount}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Why + actions */}
                    {book.why && (
                      <div style={{padding:"14px 16px 0",borderTop:"0.5px solid #EDE8DF"}}>
                        <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"1.5px",color:T.gold,fontFamily:T.sans,marginBottom:6}}>Why this book</div>
                        <p style={{fontFamily:T.sans,fontSize:13,color:"#2C2416",lineHeight:1.65,fontWeight:300,marginBottom:14}}>{book.why}</p>
                      </div>
                    )}
                    <div style={{display:"flex",gap:10,padding:"0 16px 18px"}}>
                      <a href={book.amazon} target="_blank" rel="noreferrer"
                        style={{flex:1,display:"block",background:"#2C2416",color:"#F7F3EC",padding:"11px 0",borderRadius:4,fontFamily:T.sans,fontSize:13,fontWeight:600,textDecoration:"none",textAlign:"center"}}>
                        Buy on Amazon →
                      </a>
                      <button onClick={()=>saveBook(book.title)} style={{flex:1,background:"transparent",color:saved?T.gold:"#8A7B66",border:"1px solid "+(saved?T.gold:"#DDD5C4"),padding:"11px 0",borderRadius:4,fontFamily:T.sans,fontSize:13,fontWeight:500,cursor:"pointer"}}>
                        {saved?"✓ Saved":"+ Save to List"}
                      </button>
                    </div>
                  </div>
                );
              });
            })()}

            {/* What You Practised Today accordion */}
            <div style={{borderTop:"1px solid rgba(138,158,132,0.25)",margin:"0 4px",paddingTop:20,cursor:"pointer"}} onClick={()=>setAccordionOpen(o=>!o)}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 4px"}}>
                <div style={{fontFamily:T.sans,fontSize:15,fontWeight:500,color:T2.text}}>What You Practised Today</div>
                <span style={{fontSize:16,color:T2.text3,transition:"transform 0.2s",transform:accordionOpen?"rotate(180deg)":"none",display:"inline-block"}}>▾</span>
              </div>
              {accordionOpen && (
                <div style={{marginTop:16,padding:"0 4px"}}>
                  {REVIEW_BULLETS[lesson.day-1].map((b,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                      <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(138,158,132,0.15)",border:"1px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-3.5" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:14,color:T2.text2,lineHeight:1.6}}>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ambition Statement — only on Day 7 */}
            {lesson.day === 7 && (
              <div style={{background:T.cardDark,borderRadius:8,overflow:"hidden",border:"1px solid rgba(138,158,132,0.2)",margin:"0 4px"}}>
                <div style={{height:2,background:"linear-gradient(90deg,"+T.gold+",rgba(138,158,132,0.15))"}}/>
                <div style={{padding:"16px 18px 18px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:1.5}}>Your Ambition Statement</span>
                    {ambitionSaved && <span style={{marginLeft:"auto",fontSize:10,color:T.gold,background:"rgba(138,158,132,0.12)",padding:"2px 8px",borderRadius:8}}>Saved ✓</span>}
                  </div>
                  <p style={{fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.6,marginBottom:12}}>Complete this sentence. Say it as if you're telling a trusted senior leader — one sentence, direct, owned.</p>
                  <textarea value={ambitionDraft} onChange={e=>saveAmbition(e.target.value)} placeholder="…operating at director level, leading a team that matters…" rows={2} style={{width:"100%",padding:"10px 14px",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,outline:"none",resize:"none",background:"rgba(255,255,255,0.05)",fontSize:13,color:"rgba(255,255,255,0.85)",lineHeight:1.55,fontFamily:T.sans,boxSizing:"border-box"}}/>
                </div>
              </div>
            )}

            {/* Next session CTA */}
            {(()=>{
              const nextDay = lesson.day < 14 ? lesson.day + 1 : null;
              return (
                <button onClick={onComplete} style={{width:"100%",background:T.gold,color:"#F5EFE6",padding:"18px",borderRadius:4,border:"none",fontFamily:T.sans,fontSize:15,fontWeight:600,cursor:"pointer",textAlign:"center"}}>
                  {nextDay ? `Next: Day ${nextDay} — ${LESSONS[nextDay-1]?.title} →` : "Complete Programme →"}
                </button>
              );
            })()}
          </>
        )}

        {/* Navigation */}
        <div style={{display:"flex",gap:10,paddingBottom:8,paddingTop:6}}>
          {idx > 0 && (
            <button onClick={()=>setIdx(i=>i-1)} style={{
              padding:"14px 18px",borderRadius:14,
              border:"1px solid "+T2.border,
              background:T2.surface,color:T2.text3,
              fontSize:12,fontWeight:500,cursor:"pointer",
              display:"flex",alignItems:"center",gap:5,flexShrink:0,
            }}>
              <svg width="12" height="12" viewBox="0 0 14 14" 
fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.6" 
strokeLinecap="round" strokeLinejoin="round"/></svg>
              Previous
            </button>
          )}
          {idx < STEPS.length-1 && (
            <button onClick={()=>setIdx(i=>i+1)} style={{
              flex:1,
              padding:"18px 20px",
              borderRadius:14,
              border:"none",
              background:idx===0
                ? "linear-gradient(135deg,"+T.gold+" 0%,"+T.goldDark+" 100%)"
                : "linear-gradient(135deg,"+T.navy+" 0%,#1E2D45 100%)",
              color:"white",
              fontSize:15,fontWeight:700,
              cursor:"pointer",
              
display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              boxShadow:idx===0?"0 4px 16px rgba(138,158,132,0.35)":"0 4px 16px rgba(17,28,46,0.3)",
              letterSpacing:"0.2px",
            }}>
              <span>{isNT
                ? (idx===1?"Continue":idx===2?"See examples":idx===3?"Practice":NAV_LABELS[idx])
                : NAV_LABELS[idx]}</span>
              <svg width="18" height="18" viewBox="0 0 18 18" 
fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="white" strokeWidth="2" 
strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"center",
          gap:5,paddingBottom:24,
        }}>
          {STEPS.map((s,i) => (
            <div key={s} style={{
              width:i===idx?24:6,height:6,borderRadius:3,
              background:i===idx?T.navy:i<idx?T.gold:T.border,
              transition:"all 0.3s",
            }}/>
          ))}
          <span 
style={{fontSize:10,color:T2.text4,marginLeft:6,fontWeight:500}}>{idx+1} / 
{STEPS.length}</span>
        </div>
      </div>
    </div>
  );
}

// ─── HOME SCREEN 
