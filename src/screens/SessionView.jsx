import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';
import { D9_INSIGHT_CARDS, D9_COMM_STYLES, D9_EXAMPLES, NT_NEURO, THEORY_DATA, FURTHER_READING, REVIEW_CLOSING, REVIEW_BULLETS, WORKPLACE_APPLICATION, LESSONS, SESSION_STEPS, NAV_LABELS,
  D10_FACTS, D3_FACTS, D3_PAUSE_REASONS, D4_FACTS,
  D1_CLARITY_FACTS_DATA, D1_FEYNMAN_DATA,
  D11_FACTS, D11_EXAMPLES, D11_INGREDIENTS, D2_INSIGHT_CARDS, D7_INSIGHT_CARDS,
  D12_FACTS, D12_EXAMPLES, D13_INSIGHT_CARDS, D13_THEORY_CARDS, D13_EXAMPLES, D14_INSIGHT_CARDS, D14_EXAMPLES,
} from '../data.js';
import { SessionLeftPanel, ExCard } from './SessionLeftPanel.jsx';
import { MobileSessionView } from './SessionViewMobile.jsx';
import { D9PracticeWidget, D9SimWidget } from '../modules/Day9.jsx';
import { StoryBuilderWidget, StoryArchitectWidget, D8PracticeWidget } from '../modules/Day8.jsx';
import { CoachWidget } from '../modules/CoachWidget.jsx';
import { D10SimFeedback, D10MobileSAR, D10MobileSim } from '../modules/Day10.jsx';
import { D3SimFeedback, D3MobileSim, D3PracticeWidget, D3SimWidget } from '../modules/Day3.jsx';
import { D4SimFeedback, D4MobileSplit, D4MobileSim, D4PracticeWidget, D4SimWidget } from '../modules/Day4.jsx';
import { D1WarmUpWidget, D1SimWidget } from '../modules/Day1.jsx';
import { D2PracticeWidget, D2SimWidget } from '../modules/Day2.jsx';
import { D5PracticeWidget, D5SimWidget } from '../modules/Day5.jsx';
import { D6PracticeWidget, D6SimWidget } from '../modules/Day6.jsx';
import { D11PracticeWidget, D11SimWidget } from '../modules/Day11.jsx';
import { D12PracticeWidget, D12SimWidget } from '../modules/Day12.jsx';
import { D13PracticeWidget, D13SimWidget } from '../modules/Day13.jsx';
import { D14PracticeWidget, D14SimWidget } from '../modules/Day14.jsx';
import { DIAGRAMS, MODULE_ICONS } from '../diagrams.jsx';
import { Scene, OBScene } from '../scenes.jsx';
import { Timer } from '../components/Timer.jsx';
import { PBar, NAV_H } from '../components/NavComponents.jsx';
import AICoachTab from '../components/AICoachTab.jsx';
import { EditorialTheoryCard, TheoryCard } from './TheoryCards.jsx';
import { getScenariosForDay, getPIEEmphasis } from '../utils.js';
import { D7SimWidget, D7PracticeWidget } from '../modules/Day7.jsx';

export function SessionView({lesson, isDone, onComplete, onBack, roleId,
activeRole, dark=false, DK={}, isDesktop=false}) {
  const T2 = Object.assign({}, T, DK);
  const [idx, setIdx] = useState(()=>{ try{ const s=localStorage.getItem("au1_initial_step"); if(s){localStorage.removeItem("au1_initial_step"); const stps=lesson.day===8?["Insight","Theory","Example","Rehearsal","Simulation","Review"]:["Insight","Theory","Example","Rehearsal","Simulation","Review"]; const i=stps.indexOf(s); return i>=0?i:0;} }catch{} return 0; });
  const rightPanelRef = useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (rightPanelRef.current) rightPanelRef.current.scrollTop = 0;
  }, [idx]);
  const [selSc, setSelSc] = useState(0);
  const [checks, setChecks] = useState({});
  const [exitConfirm, setExitConfirm] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [workplaceOpen, setWorkplaceOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState('learned');
  const [d1NavLabel, setD1NavLabel] = useState(null);
  const d1NavFnRef = useRef(null);
  const [d1WarmUpTopic, setD1WarmUpTopic] = useState(null);
  const [savedBooks, setSavedBooks] = useState(() => { try { return JSON.parse(localStorage.getItem("au1_saved_books")||"[]"); } catch { return []; } });
  function saveBook(title) {
    const next = savedBooks.includes(title) ? savedBooks.filter(t=>t!==title) : [...savedBooks, title];
    setSavedBooks(next); try { localStorage.setItem("au1_saved_books", JSON.stringify(next)); } catch {}
  }
  const [note, setNote] = useState(() => {
    try { return localStorage.getItem("au1_note_"+lesson.day) || ""; } catch { return ""; }
  });
  const [ambitionDraft, setAmbitionDraft] = useState(() => {
    try { return localStorage.getItem("au1_ambition") || ""; } catch { return ""; }
  });
  const [ambitionSaved, setAmbitionSaved] = useState(() => {
    try { return !!localStorage.getItem("au1_ambition"); } catch { return false; }
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
  const [d1MobCard, setD1MobCard] = useState(null);
  const [d2MobCard, setD2MobCard] = useState(null);
  const [d3MobCard, setD3MobCard] = useState(null);
  const [d4MobCard, setD4MobCard] = useState(null);
  const [d5MobCard, setD5MobCard] = useState(null);
  const [d6MobCard, setD6MobCard] = useState(null);
  const [d7MobCard, setD7MobCard] = useState(null);
  const [d10MobCard, setD10MobCard] = useState(null);
  const [d11MobCard, setD11MobCard] = useState(null);
  const [d11FormulaCard, setD11FormulaCard] = useState(null);
  const [d11BrandWords, setD11BrandWords] = useState(["","",""]);
  const [d12MobCard, setD12MobCard] = useState(null);
  const [ntMobCard, setNtMobCard] = useState(null);
  const [pixarOpen, setPixarOpen] = useState(false);
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
  const isD7 = lesson.day === 7;
  const isD10 = lesson.day === 10;
  const isD11 = lesson.day === 11;
  const isD12 = lesson.day === 12;
  const isD13 = lesson.day === 13;
  const isD14 = lesson.day === 14;
  const STEPS = isNT
    ? ["Insight","Theory","Example","Rehearsal","Simulation","Review"]
    : SESSION_STEPS;
  const step = STEPS[idx];

  const D10_EXAMPLES_DATA = [
  { id:"priya", title:"The Invisible Fixer", sub:"Same performance. No visibility.",
    story:"At 10:47pm, Priya gets a message. A critical customer workflow has broken. Revenue is at risk.\n\nShe coordinates engineering, calms stakeholders, resolves the issue before morning, and saves a major account.\n\nThe next day? Business as usual. No summary. No update. No visibility.\n\nThree months later, leadership says: \"Priya is solid — but we haven\'t seen enough strategic impact.\"\n\nPriya worked harder than anyone in the building that night. The work was real. The impact was real. But without visibility, it was as though it never happened.",
    lesson:"Performance without communication is philanthropy.",
  },
  { id:"alex", title:"The Strategic Communicator", sub:"Same work. Different career.",
    story:"Same scenario. Same performance. Same late night.\n\nBut after resolving the issue, Alex sends one message:\n\n\"Quick update — we identified and resolved the customer workflow issue overnight. Coordinated engineering and customer success, protected the account, and documented prevention steps for next time.\"\n\n45 seconds to write.\n\nLeadership now sees: ownership, calm under pressure, cross-functional leadership, strategic thinking.\n\nSame work. Completely different perception. Completely different career.",
    lesson:"Visibility is a skill. It takes 45 seconds.",
  },
  { id:"executive", title:"The Executive Pattern", sub:"How senior leaders think.",
    story:"Senior leaders are rarely promoted because they personally do the most operational work.\n\nThey are promoted because they consistently make priorities, decisions, and impact visible.\n\nExecutives narrate progress. High performers stay silent.\n\nWhen asked what they\'re working on, executives say: \"I\'m leading the restructure of our onboarding process. We\'ve already reduced drop-off by 30%, and we\'re on track to hit 50% by Q3.\"\n\nHigh performers say: \"Lots of things. It\'s been really busy.\"\n\nThat is the gap this module closes.",
    lesson:"Narrate progress. Name impact. Make value legible.",
  },
];
 // ── D3 shared constants ────────────────────────────────────────────────────

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
        <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>Not hesitant.<br/>Deliberate.</h2>
        <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.75,marginBottom:24}}>Obama didn't pause because he couldn't find the words. He paused because he understood something most speakers never learn: silence makes the audience lean in. Here's how he used it in three of his most important moments.</p>

        <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24}}>
          <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>2008 Election Night — Grant Park, Chicago</div>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.6,marginBottom:8}}>"If there is anyone out there who still doubts that America is a place where all things are possible... [4-second pause] ...who still wonders if the dream of our founders is alive in our time... [pause] ...tonight is your answer."</p>
            <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0,lineHeight:1.55}}>Each pause let the crowd absorb the weight of the moment before he added to it. The silences built the emotion as much as the words did.</p>
          </div>

          <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>2015 Charleston Eulogy — Singing "Amazing Grace"</div>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.6,marginBottom:8}}>"Clementa Pinckney found that grace... [long pause, bowed head] ...Cynthia Hurd found that grace... [pause] ...Susie Jackson found that grace."</p>
            <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0,lineHeight:1.55}}>Before breaking into song, he paused for nearly 10 seconds. The room went silent. That pause told the audience something extraordinary was about to happen — before a single note was sung.</p>
          </div>

          <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>2009 Inauguration — The Oath of Office</div>
            <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.6,marginBottom:8}}>"I do solemnly swear... [pause] ...that I will faithfully execute... [pause] ...the office of President of the United States."</p>
            <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,margin:0,lineHeight:1.55}}>Watched by two million people in person and billions worldwide, his deliberate pauses gave each phrase its own gravity. The words felt earned, not rushed.</p>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>A pause signals that what just came before — or what is about to come next — deserves special attention. It forces the audience to stop and process. The speaker controls the room through silence, not sound.</p>
          </div>
          <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>After your most important point, stop talking. Count to two in your head. Let the idea settle before you continue. The audience will fill the silence with meaning — and remember it far longer than the words that followed.</p>
          </div>
        </div>
        <div style={{padding:"16px 20px",borderLeft:"2px solid "+T.gold}}>
          <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text2,lineHeight:1.65,margin:0}}>Silence isn't empty space. It's emphasis. The best speakers know when to stop talking.</p>
        </div>
      </div>
    )},
];
 // ── D4 shared constants ────────────────────────────────────────────────────

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

    // ── D7 RightContent — Week 1 Review ───────────────────────────────────────
    const D7RightContent = () => {
      const [openCard, setOpenCard] = useState(null);

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:16,fontFamily:T.sans}}>The wake-up call</div>
          <h2 style={{fontFamily:T.serif,fontSize:34,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Most people know how to communicate better. Very few practise until it's automatic.</h2>
          <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:32}}>This week, you did something different.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:28}}>
            {D7_INSIGHT_CARDS.map((n,i)=>{
              const open = openCard===i;
              return (
                <div key={i} onClick={()=>setOpenCard(open?null:i)}
                  style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0,transition:"color 0.2s"}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                  {open && (
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                      {n.bullets.map((b,j)=>(
                        <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                          <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/>
                          <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:300,margin:0}}>{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{padding:"20px 24px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,marginBottom:0}}>
            <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10,fontFamily:T.sans}}>The Neuroscience</div>
            <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:12}}>Why repetition works at a biological level</h3>
            <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,marginBottom:10,fontWeight:300}}>Every time you practise a skill deliberately, your brain wraps the relevant neural pathway in myelin — a sheath that makes the signal faster, stronger, and more automatic.</p>
            <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.65,margin:0,fontStyle:"italic"}}>Skill is not talent. Skill is repetition. And repetition responds to practice, not intelligence. The six habits you trained this week are being written into your nervous system right now.</p>
          </div>
          <div style={{padding:"20px 24px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"3px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"Mastery is conditioned, not studied."</p>
          </div>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:32,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>The Habit Loop</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:300,marginBottom:8}}>Charles Duhigg — The Power of Habit, 2012</p>
          <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.6,marginBottom:24}}>Every habit — good or bad — follows the same loop:</p>
          {/* CUE → ROUTINE → REWARD */}
          <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28}}>
            {[{label:"CUE",desc:"The trigger"},{label:"ROUTINE",desc:"The behaviour"},{label:"REWARD",desc:"The signal"}].map((n,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
                <div style={{flex:1,padding:"16px 12px",background:"rgba(138,158,132,0.1)",border:"0.5px solid rgba(138,158,132,0.3)",borderRadius:6,textAlign:"center"}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:700,color:T.gold,marginBottom:4}}>{n.label}</div>
                  <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3}}>{n.desc}</div>
                </div>
                {i<2 && <div style={{fontSize:20,color:T.gold,padding:"0 10px",flexShrink:0}}>→</div>}
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.65,marginBottom:16}}>Repeat the loop often enough and behaviour becomes automatic. Not through willpower. Through repetition.</p>
          <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.65,marginBottom:20}}>This week, every exercise you completed ran that loop:</p>
          {[
            {head:"CUE", body:"A moment of pressure, a conversation, a question you weren't expecting — that became the trigger."},
            {head:"ROUTINE", body:"A new behaviour. Pausing instead of filling. Leading with your point. Slowing down. Simplifying. That became the response."},
            {head:"REWARD", body:"A sense of clarity, control, or progress. That became the signal your brain learned to seek."},
          ].map((p,i)=>(
            <div key={i} style={{padding:"16px 20px",background:T2.surface,border:"0.5px solid "+T2.border,borderLeft:"2px solid "+T.gold,borderRadius:4,marginBottom:10}}>
              <div style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T.gold,marginBottom:6}}>{p.head}</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0,fontWeight:300}}>{p.body}</p>
            </div>
          ))}
          <div style={{height:"0.5px",background:T2.divider,margin:"28px 0"}}/>
          <div style={{padding:"24px 28px",background:T2.cardDark,borderRadius:6}}>
            <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"rgba(255,255,255,0.9)",lineHeight:1.6,margin:"0 0 12px",fontStyle:"italic"}}>"You stop trying to communicate well. You simply do."</p>
            <p style={{fontFamily:T.sans,fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.5,margin:0,fontWeight:300}}>That is the difference between learning a technique and building a skill.</p>
          </div>
        </div>
      );

      if (step === "Example") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>Your Week 1 Foundations</div>
          <h2 style={{fontFamily:T.serif,fontSize:32,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>Six habits. Seven days. Here's what you built.</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:300,marginBottom:28}}>Each foundation is a permanent part of your communication toolkit. Not techniques to remember — behaviours to repeat.</p>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[
              {day:"DAY 1",skill:"Clarity",science:"The Feynman Technique",line:"If you can't say it simply, you don't understand it well enough yet."},
              {day:"DAY 2",skill:"Voice Control",science:"The 88 Keys",line:"Your voice has more range than you've been using. That changes from here."},
              {day:"DAY 3",skill:"Filler-Free Speech",science:"The Pause Principle",line:"Leaders pause. Amateurs fill. Silence is control."},
              {day:"DAY 4",skill:"Precision",science:"Miller's Law",line:"Every word must earn its place. Short sentences are a strategic choice."},
              {day:"DAY 5",skill:"Structure",science:"The PRE Framework",line:"Point. Reason. Example. The architecture of every compelling answer."},
              {day:"DAY 6",skill:"High-Stakes Conversations",science:"Calm Under Pressure",line:"The gap between good and great opens under pressure. You started closing it."},
            ].map((f,i)=>(
              <div key={i} style={{display:"flex",gap:16,alignItems:"flex-start",padding:"18px 20px",background:T2.surface,border:"0.5px solid "+T2.border,borderRadius:6}}>
                <div style={{background:T.gold,borderRadius:3,padding:"5px 10px",flexShrink:0,alignSelf:"flex-start"}}>
                  <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"white",letterSpacing:"1px"}}>{f.day}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T2.text,marginBottom:2}}>{f.skill}</div>
                  <div style={{fontFamily:T.sans,fontSize:11,color:T.gold,fontWeight:600,letterSpacing:"0.5px",marginBottom:8}}>{f.science}</div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.55,margin:0,fontWeight:300,fontStyle:"italic"}}>"{f.line}"</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:20,padding:"16px 20px",background:"rgba(138,158,132,0.08)",borderRadius:4,border:"0.5px solid rgba(138,158,132,0.2)",textAlign:"center"}}>
            <p style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T.gold,lineHeight:1.4,margin:0}}>Skills compound.</p>
          </div>
        </div>
      );

      if (step === "Rehearsal") {
        return (
          <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
            <D7PracticeWidget T={T} T2={T2} isDesktop={true} onSimulation={() => setIdx(STEPS.indexOf('Simulation'))}/>
          </div>
        );
      }


      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <D7SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Review") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>The Shift</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:28}}>What changed this week.</h2>
          {/* Before / Now */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:32}}>
            <div style={{padding:"20px 22px",background:T2.surface,border:"0.5px solid "+T2.border,borderRadius:6}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1px",marginBottom:14}}>Before</div>
              {["Reacting without thinking","Rambling to fill silence","Over-explaining under pressure","Communication on autopilot"].map((b,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<3?10:0}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:T2.text4,flexShrink:0,marginTop:6}}/>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,margin:0,fontWeight:300}}>{b}</p>
                </div>
              ))}
            </div>
            <div style={{padding:"20px 22px",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",borderRadius:6}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:14}}>Now</div>
              {["Thinking before speaking","Pausing with intention","Leading with structure","Choosing words deliberately"].map((b,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<3?10:0}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.5,margin:0,fontWeight:400}}>{b}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Identity statement */}
          <div style={{fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10,fontFamily:T.sans}}>Your Communication Identity</div>
          <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>Complete this statement.</h3>
          <CoachWidget lesson={lesson} scenario={"Generate a personalised one-line Communication Identity Statement. Ask the user to complete: 'This week I discovered I communicate best when I...' — then respond with a single, powerful sentence that names their communication authority. Example format: 'You communicate best when you slow down, lead with structure, and trust the pause — that's where your authority lives.' Save-worthy. Read before high-stakes conversations."}/>
          <div style={{height:"0.5px",background:T2.divider,margin:"28px 0"}}/>
          {/* 4 takeaway cards */}
          <div style={{fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:16,fontFamily:T.sans}}>Your Four Takeaways</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
            {[
              "Invisible excellence does not scale. Visibility is a communication skill.",
              "Awareness creates intentions. Repetition creates habits. Only one shows up under pressure.",
              "Confidence is clarity — not performance.",
              "Mastery is conditioned, not studied.",
            ].map((q,i)=>(
              <div key={i} style={{padding:"18px 20px",background:T2.surface,border:"0.5px solid "+T2.border,borderRadius:6}}>
                <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.55,margin:0}}>"{q}"</p>
              </div>
            ))}
          </div>
          {/* Closing */}
          <div style={{padding:"28px 32px",background:T2.cardDark,borderRadius:6}}>
            <p style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:"rgba(255,255,255,0.9)",lineHeight:1.65,margin:"0 0 14px"}}>Your communication conditioning is now in motion.</p>
            <p style={{fontFamily:T.sans,fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.7,margin:"0 0 8px",fontWeight:300}}>Six habits. Seven days. The foundations are set.</p>
            <p style={{fontFamily:T.sans,fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.7,margin:0,fontWeight:300}}>Week 2 doesn't start from zero. It starts from here.</p>
          </div>
        </div>
      );

      return <RightContent/>;
    };

    // ── D10 RightContent — Day 10: Performance ────────────────────────────────
    const D10RightContent = () => {
      const [simInput, setSimInput] = useState("");
      const [sarS, setSarS] = useState(""); const [sarA, setSarA] = useState(""); const [sarR, setSarR] = useState("");
      const [sarResult, setSarResult] = useState(""); const [sarLoading, setSarLoading] = useState(false);
      const [storyCard, setStoryCard] = useState(null);
      const [openInsight, setOpenInsight] = useState(null);
      const [d10ExObserved, setD10ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d10ExObserved')||'{}'); } catch { return {}; } });
      const [d10ExOpenCard, setD10ExOpenCard] = useState(null);
      // Simulation voice states
      const [d10PracticePhase, setD10PracticePhase] = useState('intro');
      const [simPhase, setSimPhase] = useState('intro');
      const [activeScenario, setActiveScenario] = useState(null);
      const [simTranscript, setSimTranscript] = useState('');
      const [simFallback, setSimFallback] = useState('');
      const [simResult, setSimResult] = useState(null);
      const [simIsRec, setSimIsRec] = useState(false);
      const [simTimeLeft, setSimTimeLeft] = useState(30);
      const [simWave, setSimWave] = useState(Array(10).fill(0.3));
      const simRecRef = useRef(null); const simTimerRef = useRef(null); const simWaveRef = useRef(null); const simLiveRef = useRef('');
      const SpeechRec10 = typeof window!=='undefined'&&(window.SpeechRecognition||window.webkitSpeechRecognition);
      // SAR voice builder state
      const [sarStep, setSarStep] = useState(0);
      const [sarTranscribing, setSarTranscribing] = useState(false);
      const [sarIsRec, setSarIsRec] = useState(false);
      const [sarWave, setSarWave] = useState(Array(14).fill(0.05));
      const [sarGuideTime, setSarGuideTime] = useState(20);
      const sarMRRef = useRef(null); const sarChunksRef = useRef([]); const sarMimeRef = useRef("audio/webm");
      const sarStreamRef = useRef(null); const sarWaveIntRef = useRef(null); const sarCtxRef = useRef(null);

      useEffect(()=>{ if(!simIsRec){clearInterval(simWaveRef.current);return;} simWaveRef.current=setInterval(()=>setSimWave(Array.from({length:10},()=>0.15+Math.random()*0.85)),130); return()=>clearInterval(simWaveRef.current); },[simIsRec]);
      useEffect(()=>{ if(simIsRec&&simTimeLeft>0){simTimerRef.current=setTimeout(()=>setSimTimeLeft(t=>t-1),1000);} else if(simIsRec&&simTimeLeft===0){doSimStop();} return()=>clearTimeout(simTimerRef.current); },[simIsRec,simTimeLeft]);
      useEffect(()=>{ if(!sarIsRec||sarGuideTime<=0)return; const t=setTimeout(()=>setSarGuideTime(g=>Math.max(0,g-1)),1000); return()=>clearTimeout(t); },[sarIsRec,sarGuideTime]);
      useEffect(()=>()=>{ clearInterval(sarWaveIntRef.current); if(sarStreamRef.current)sarStreamRef.current.getTracks().forEach(t=>t.stop()); try{if(sarCtxRef.current)sarCtxRef.current.close();}catch{} },[]);

      function doSimStart(){
        simLiveRef.current=''; setSimTranscript(''); setSimIsRec(true); setSimTimeLeft(30); setSimPhase('recording');
        if(SpeechRec10){ const r=new SpeechRec10(); r.continuous=true; r.interimResults=true; r.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++)if(e.results[i].isFinal)t+=e.results[i][0].transcript+' ';simLiveRef.current=t;setSimTranscript(t);}; try{r.start();}catch(e){} simRecRef.current=r; }
      }
      function doSimStop(){
        setSimIsRec(false); clearTimeout(simTimerRef.current);
        if(simRecRef.current){try{simRecRef.current.stop();}catch(e){}}
        analyzeSimResponse(SpeechRec10?simLiveRef.current:simFallback);
      }
      async function analyzeSimResponse(text){
        setSimPhase('analyzing');
        const scenario = activeScenario?.prompt || '';
        const mock={overall:74,headline:"Clear ownership with room to sharpen the result.",scores:{Clarity:75,Structure:70,Confidence:72,Brevity:80,Impact:68},strength:"You spoke with genuine ownership and didn't shy away from the question.",improve:"Lead with the result before the context — flip the order for more impact.",rewrite:`I led a cross-functional project that increased efficiency by 30%. The key challenge was aligning three teams with competing priorities. I resolved this by establishing a weekly decision framework — and we delivered ahead of schedule.`,insight:"Your instinct to give context first is natural, but executives want the result first. Try: 'Result → How → Why it mattered.' You'll land harder, faster."};
        if(!text||text.trim().length<10){setSimResult(mock);setSimPhase('feedback');return;}
        try{
          const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:700,messages:[{role:"user",content:`You are an executive communication coach. A professional was asked: "${scenario}"\n\nTheir spoken response: "${text}"\n\nEvaluate and return ONLY valid JSON:\n{"overall":<50-100>,"headline":"<max 10 words: single most important observation>","scores":{"Clarity":<50-100>,"Structure":<50-100>,"Confidence":<50-100>,"Brevity":<50-100>,"Impact":<50-100>},"strength":"<one sentence: what they did well>","improve":"<one sentence: single most important improvement>","rewrite":"<sharper 2-3 sentence version of their answer, leading with result>","insight":"<2 sentences of personalised coaching>"}`}]})});
          const d=await res.json(); const raw=(d.content||[]).map(b=>b.text||'').join('').trim(); const m=raw.match(/\{[\s\S]*\}/); setSimResult(JSON.parse(m[0]));
        }catch{setSimResult(mock);}
        setSimPhase('feedback');
      }
      function resetSim(){setSimPhase('intro');setActiveScenario(null);setSimTranscript('');setSimFallback('');setSimResult(null);setSimIsRec(false);setSimTimeLeft(30);}
      const scoreColor=s=>s>=80?"#527060":s>=65?T.gold:"#B05C4A";

      function sarBlobToB64(blob){return new Promise((ok,fail)=>{const r=new FileReader();r.onload=()=>ok(r.result.split(",")[1]);r.onerror=fail;r.readAsDataURL(blob);});}
      async function sarStartRec(){
        try{
          const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
          sarStreamRef.current=stream;
          const ctx=new(window.AudioContext||window.webkitAudioContext)();
          sarCtxRef.current=ctx;
          const src=ctx.createMediaStreamSource(stream);
          const analyser=ctx.createAnalyser();analyser.fftSize=64;src.connect(analyser);
          const fd=new Uint8Array(analyser.frequencyBinCount);
          const mt=MediaRecorder.isTypeSupported("audio/webm;codecs=opus")?"audio/webm;codecs=opus":MediaRecorder.isTypeSupported("audio/mp4")?"audio/mp4":"audio/webm";
          sarMimeRef.current=mt;
          const mr=new MediaRecorder(stream,{mimeType:mt});
          sarChunksRef.current=[];
          mr.ondataavailable=e=>{if(e.data.size>0)sarChunksRef.current.push(e.data);};
          mr.start(100);sarMRRef.current=mr;
          setSarIsRec(true);setSarGuideTime(20);
          sarWaveIntRef.current=setInterval(()=>{analyser.getByteFrequencyData(fd);setSarWave(Array.from({length:14},(_,i)=>Math.max(0.05,fd[Math.floor(i*fd.length/14)]/255)));},80);
        }catch(err){console.error("[SAR] mic error",err);}
      }
      function sarStopRec(){
        setSarIsRec(false);clearInterval(sarWaveIntRef.current);setSarWave(Array(14).fill(0.05));
        const mr=sarMRRef.current;const step=sarStep;
        if(mr&&mr.state!=="inactive"){
          mr.onstop=async()=>{try{const blob=new Blob(sarChunksRef.current,{type:sarMimeRef.current});await sarDoTranscribe(blob,sarMimeRef.current,step);}catch(e){console.error("[SAR] onstop",e);}};
          mr.stop();
        }
        if(sarStreamRef.current){sarStreamRef.current.getTracks().forEach(t=>t.stop());sarStreamRef.current=null;}
        try{if(sarCtxRef.current){sarCtxRef.current.close();sarCtxRef.current=null;}}catch{}
      }
      async function sarDoTranscribe(blob,mimeType,step){
        setSarTranscribing(true);
        try{
          const b64=await sarBlobToB64(blob);
          const res=await fetch("/api/transcribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({b64,mimeType})});
          const data=await res.json();
          const text=(data.text||"").trim();
          const parts=[sarS,sarA,sarR];parts[step]=text;
          if(step===0)setSarS(text);else if(step===1)setSarA(text);else setSarR(text);
          if(parts[0]&&parts[1]&&parts[2])await sarPolish(parts);
        }catch(err){console.error("[SAR] transcribe error",err);}
        setSarTranscribing(false);
      }
      function sarRedo(i){if(i===0)setSarS("");else if(i===1)setSarA("");else setSarR("");setSarStep(i);setSarResult("");}
      async function sarPolish(parts){
        setSarLoading(true);
        try{
          const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:350,messages:[{role:"user",content:`You are an executive communication coach. Sharpen this SAR story into 2-3 crisp sentences that communicate impact and ownership. Lead with the result. Make it specific and memorable. Return ONLY the sharpened story:\n\nSituation: ${parts[0]}\nAction: ${parts[1]}\nResult: ${parts[2]}`}]})});
          const d=await res.json();setSarResult((d.content||[]).map(b=>b.text||"").join("").trim());
        }catch{setSarResult("Lead with the result, then show how you got there. Specifics beat adjectives.");}
        setSarLoading(false);
      }

      async function buildSAR() {
        if (!sarS.trim()||!sarA.trim()||!sarR.trim()) return; setSarLoading(true);
        try {
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:350,messages:[{role:"user",content:`You are an executive communication coach. Sharpen this SAR story into 2-3 crisp sentences that communicate impact and ownership. Lead with the result. Make it specific and memorable. Return ONLY the sharpened story:\n\nSituation: ${sarS}\nAction: ${sarA}\nResult: ${sarR}`}]})});
          const d = await res.json(); setSarResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setSarResult("Lead with the result, then show how you got there. Specifics beat adjectives."); }
        setSarLoading(false);
      }

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:16,fontFamily:T.sans}}>The uncomfortable truth</div>
          <h2 style={{fontFamily:T.serif,fontSize:42,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Great work does not automatically create visibility.</h2>
          <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:32}}>In 1996, Harvey Coleman found that Performance accounts for just 10% of career advancement. Not because it doesn't matter — but because it is not the multiplier.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:28}}>
            {D10_FACTS.map((n,i)=>{
              const open = openInsight===i;
              return (
                <div key={i} onClick={()=>setOpenInsight(open?null:i)}
                  style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0,transition:"color 0.2s"}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                  {open && (
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                      {n.bullets.map((b,j)=>(
                        <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                          <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/>
                          <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:300,margin:0}}>{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{padding:"20px 24px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"3px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"Invisible excellence does not scale. Visibility is not self-promotion — it is communication."</p>
          </div>
        </div>
      );

      if (step === "Theory") {
        const PRINCIPLES = [
          {n:"1", head:"Excellence is your foundation — not your ceiling.", body:"Visibility without substance is noise. Performance earns you the right to be in the room — it does not earn you the promotion, the project, or the trust. But substance without visibility is invisibility."},
          {n:"2", head:"Visibility is a communication skill.", body:"It is NOT bragging, self-promotion, or ego. It IS creating clarity, helping others understand your impact, and making value legible to the people who need to see it. The most effective leaders do this instinctively."},
          {n:"3", head:"Focus on the vital few.", body:"Not all work is equal. The work that matters is the work visible to the people who shape your future. Spreading yourself across everything and excelling at things nobody notices is an expensive trap."},
        ];
        const [openP, setOpenP] = useState(null);
        return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:20}}>The Performance Iceberg</h2>

          {/* Attribution Theory — top */}
          <div style={{padding:"20px 24px",background:"rgba(138,158,132,0.08)",borderRadius:4,border:"0.5px solid rgba(138,158,132,0.2)",marginBottom:20}}>
            <div style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:T.gold,letterSpacing:"0.04em",marginBottom:8}}>Attribution Theory — Fritz Heider, 1958</div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,margin:0,fontWeight:300}}>When people cannot directly observe your work, they attribute results to luck, team effort, or circumstance — not to you. Visibility closes this gap. It replaces assumption with evidence.</p>
          </div>

          <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Most professionals assume their effort speaks for itself. It doesn't.</p>

          {/* Waterline boxes — both light */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
            <div style={{padding:"20px 22px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T.gold,marginBottom:12}}>Above the waterline ↑</div>
              {["Outcomes they hear about","Moments you speak up","Visible ownership of results","Strategic contributions you name"].map((b,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<3?6:0}}><span style={{color:T.gold,fontSize:12,flexShrink:0,marginTop:2}}>✦</span><span style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.5}}>{b}</span></div>
              ))}
            </div>
            <div style={{padding:"20px 22px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T.gold,marginBottom:12}}>Below the waterline ↓</div>
              {["Late nights and early starts","Quiet firefighting","Invisible support work","Emotional labour and relationship management"].map((b,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<3?6:0}}><span style={{color:T.gold,fontSize:12,flexShrink:0,marginTop:2}}>↓</span><span style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.5}}>{b}</span></div>
              ))}
            </div>
          </div>

          {/* 3 expandable principle cards */}
          {PRINCIPLES.map((p,i)=>{
            const open = openP===i;
            return (
              <div key={i} onClick={()=>setOpenP(open?null:i)}
                style={{padding:"16px 20px",background:T2.surface,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,borderLeft:`2px solid ${T.gold}`,borderRadius:4,marginBottom:i<2?8:0,cursor:"pointer",transition:"border-color 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:open?10:0}}>
                  <div style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.3}}>{p.n}. {p.head}</div>
                  <span style={{color:open?T.gold:T2.text3,fontSize:14,marginLeft:12,flexShrink:0}}>{open?"▴":"▸"}</span>
                </div>
                {open && <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0,fontWeight:300}}>{p.body}</p>}
              </div>
            );
          })}
        </div>
        );
      }

      if (step === "Example") {
        const D10_EDITORIAL = [
          { id:"dyson", img:"/d10-dyson.png?v=2", imgPos:"center 45%", name:"James Dyson", superpower:"Master of Relentless Improvement",
            superpowerText:"Every iteration makes the next one better.",
            summary:"He built thousands of prototypes before success. While others saw failure, he saw feedback.",
            quote:"\"I wanted to give up almost every day. But one of the things I did when I wanted to give up was to think, why was I giving up? Fear of failure.\"",
            exploreLabel:"Explore his techniques",
            body1:"James Dyson didn't invent a breakthrough product on his first attempt. He famously built thousands of prototypes, refining, testing, and improving his designs over many years before achieving success. While others saw failure, he saw feedback.",
            body2:"His philosophy is simple: every iteration makes the next one better.",
            body3:"Stop aiming for perfect on the first attempt. Whether you're preparing a presentation, writing a proposal, or practising a difficult conversation, ask yourself: \"What's one thing I can improve before the next version?\" Small improvements, repeated consistently, compound into exceptional performance.",
            whyItWorks:"Exceptional performance isn't the result of one brilliant idea — it's the result of relentless improvement. By treating mistakes as data rather than defeat, Dyson built a culture of experimentation where progress comes from refining the process, not chasing perfection.",
            technique:"Stop aiming for perfect on the first attempt. Ask yourself: \"What's one thing I can improve before the next version?\" Small improvements, repeated consistently, compound into exceptional performance.",
            lesson:"High performance isn't about talent alone. It's about showing up, testing, learning, and improving — again and again. The people who consistently excel aren't those who avoid failure; they're the ones who use every attempt to get better.",
          },
          { id:"bezos", img:"/d10-bezos.png?v=2", imgPos:"center 50%", name:"Jeff Bezos", superpower:"Master of Repeatable Excellence",
            superpowerText:"Consistency beats occasional brilliance.",
            summary:"He built one of the world's largest companies by obsessing over systems — so that great performance happened at scale, not by accident.",
            quote:"\"If you do build a great experience, customers tell each other about that. Word of mouth is very powerful.\"",
            exploreLabel:"Explore his techniques",
            body1:"Jeff Bezos built one of the world's largest companies by obsessing over systems rather than individual moments of brilliance. From warehouses to customer service, every process was designed to deliver the same high standard, every single time.",
            body2:"His focus wasn't just on working harder — it was on building systems that made excellence repeatable. His philosophy is simple: consistency beats occasional brilliance.",
            body3:"Exceptional performance doesn't come from heroic effort every day. It comes from creating reliable processes that produce great results at scale. When your systems are strong, quality becomes predictable rather than accidental.",
            whyItWorks:"Exceptional performance doesn't come from heroic effort every day. It comes from creating reliable processes that produce great results at scale. When your systems are strong, quality becomes predictable rather than accidental.",
            technique:"Don't rely on memory or motivation alone. Create simple checklists, routines, and repeatable processes for your most important work. Ask yourself: \"If I had to do this a hundred times, what system would make it consistently excellent?\"",
            lesson:"Top performers don't leave success to chance. They build habits and systems that make great performance repeatable. Excellence isn't something you occasionally achieve — it's something you design into the way you work.",
          },
        ];
        const openReading = (id) => {
          if (!d10ExObserved[id]) {
            const next = {...d10ExObserved, [id]:true};
            setD10ExObserved(next);
            try { localStorage.setItem('d10ExObserved', JSON.stringify(next)); } catch {}
          }
          setD10ExOpenCard(id);
        };
        const reading = D10_EDITORIAL.find(c => c.id === d10ExOpenCard);
        if (reading) return (
          <div key={"d10read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD10ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Performance in Action</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Two leaders who built exceptional performance through process, not just talent.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D10_EDITORIAL.map(card=>{
                const obs = d10ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:T2.surface,display:"flex",flexDirection:"column"}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:12,right:12,padding:"4px 10px",borderRadius:20,background:obs?"rgba(97,145,100,0.9)":"rgba(30,26,20,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:9,color:obs?"#fff":"rgba(245,239,230,0.75)",fontFamily:T.sans,fontWeight:500,letterSpacing:"0.5px"}}>{obs?"✓ Observed":"◉ Observed"}</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:6}}>{card.superpower}</div>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.2,margin:"0 0 8px"}}>{card.name}</h3>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                        <div>
                          <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>✦ SUPERPOWER</div>
                          <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300,maxWidth:160}}>{card.superpowerText}</div>
                        </div>
                        <span data-arrow style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:400,whiteSpace:"nowrap",transition:"transform 0.2s ease"}}>{card.exploreLabel} →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (step === "Rehearsal" && d10PracticePhase==='intro') return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{marginBottom:24}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Rehearsal · Day 10</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,margin:0}}>The SAR Challenge™</h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:"22px 24px"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>How It Works</div>
              <h3 style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 20px"}}>A 3-step story that makes your contribution impossible to ignore.</h3>
              <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
                {[
                  {n:1,label:"Situation",desc:"Set the context",icon:<svg width={22} height={22} viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="12" rx="2" stroke={T.gold} strokeWidth="1.3"/><path d="M3 9h16" stroke={T.gold} strokeWidth="1.3"/></svg>},
                  {n:2,label:"Action",   desc:"What you did",icon:<svg width={22} height={22} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke={T.gold} strokeWidth="1.3"/><path d="M4 19c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
                  {n:3,label:"Result",   desc:"The outcome",icon:<svg width={22} height={22} viewBox="0 0 22 22" fill="none"><path d="M4 16l4-4 3 3 4-5 3 3" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="3" width="16" height="16" rx="1.5" stroke={T.gold} strokeWidth="1.3"/></svg>},
                ].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:6}}>{s.icon}</div>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,marginBottom:2}}>{s.n}</div>
                      <div style={{fontFamily:T.sans,fontSize:12,color:T2.text,textAlign:"center",lineHeight:1.3,fontWeight:600}}>{s.label}</div>
                      <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,textAlign:"center",lineHeight:1.3}}>{s.desc}</div>
                    </div>
                    {i<2&&<div style={{height:1,width:16,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:32}}/>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:"22px 24px"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>The First Step</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,marginBottom:10,fontWeight:300}}>Think of something you did recently — a project, a problem you solved, a result you created. It doesn't need to be dramatic. It needs to be specific.</p>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,margin:0,fontWeight:300}}>Visibility isn't self-promotion. It's helping others understand your thinking, your ownership, and the results you create.</p>
            </div>
            <div style={{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:"22px 24px"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Your AmplifyU Coach</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,marginBottom:10,fontWeight:300}}>Your AmplifyU coach will take your three inputs and sharpen them into a crisp, powerful performance statement — ready to use in a review, conversation, or interview.</p>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.7,margin:0,fontStyle:"italic",fontWeight:300}}>Lead with the result. Make it specific. Own it.</p>
            </div>
            <button onClick={()=>setD10PracticePhase('builder')} style={{width:"100%",padding:"16px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:52}}>
              Start the SAR Builder →
            </button>
          </div>
        </div>
      );

      if (step === "Rehearsal" && d10PracticePhase==='builder') {
        const SAR_DEF = [
          {label:"Situation", prompt:"Set the context briefly. What was the challenge or starting point?"},
          {label:"Action",    prompt:"What did YOU specifically do? Use 'I' — not 'we.'"},
          {label:"Result",    prompt:"What was the measurable outcome? Be specific."},
        ];
        const sarParts = [sarS, sarA, sarR];
        const allCaptured = sarS.trim() && sarA.trim() && sarR.trim();
        const curPart = sarParts[sarStep];
        const MicIcon = ({color})=><svg width={26} height={26} viewBox="0 0 26 26" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"><rect x="9" y="3" width="8" height="13" rx="4" fill="none"/><path d="M5 13a8 8 0 0016 0M13 21v3M10 24h6"/></svg>;
        const RedoIcon = ({color})=><svg width={11} height={11} viewBox="0 0 11 11" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2H4.5a3.5 3.5 0 000 7H9"/><path d="M7 0l2 2-2 2"/></svg>;
        return (
          <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Rehearsal · Day 10</div>
              <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,margin:0}}>SAR Builder</h2>
            </div>

            {/* S → A → R step indicator */}
            <div style={{display:"flex",alignItems:"center",marginBottom:28}}>
              {SAR_DEF.map((s,i)=>{
                const done=sarParts[i].trim();
                const active=sarStep===i&&!allCaptured;
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",flex:i<2?1:"unset"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:done?T.gold:active?"rgba(138,158,132,0.12)":"transparent",border:"1.5px solid "+(done?T.gold:active?T.gold:T2.border),display:"flex",alignItems:"center",justifyContent:"center",color:done?"white":active?T.gold:T2.text3,fontSize:done?16:13,fontWeight:700,fontFamily:T.sans,transition:"all 0.2s"}}>
                        {done?"✓":s.label[0]}
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:10,color:active?T.gold:T2.text3,fontWeight:active?600:400,transition:"color 0.2s"}}>{s.label}</span>
                    </div>
                    {i<2&&<div style={{flex:1,height:1,background:T2.border,margin:"0 8px",marginBottom:20}}/>}
                  </div>
                );
              })}
            </div>

            {/* Reveal card — shown when polish is done */}
            {sarResult && (
              <div className="au-step-enter" style={{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:"24px 28px",marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>Your Performance Statement</div>
                <p style={{fontFamily:T.serif,fontSize:18,color:T2.text,lineHeight:1.7,margin:"0 0 20px",borderLeft:"2px solid "+T.gold,paddingLeft:14}}>{sarResult}</p>
                <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:16,display:"flex",flexDirection:"column",gap:12}}>
                  {SAR_DEF.map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginTop:3,flexShrink:0,width:64}}>{s.label}</div>
                      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text3,lineHeight:1.5,flex:1,margin:0}}>"{sarParts[i]}"</p>
                      <button onClick={()=>sarRedo(i)} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"0.5px solid "+T2.border,borderRadius:3,padding:"4px 10px",cursor:"pointer",fontFamily:T.sans,fontSize:11,color:T2.text3,flexShrink:0}}>
                        <RedoIcon color={T2.text3}/> Redo
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setIdx(STEPS.indexOf("Simulation"))} style={{width:"100%",padding:"15px",borderRadius:4,border:"none",background:"rgba(82,112,96,0.85)",color:"white",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:T.sans,marginTop:20}}>
                  Enter the Hot Seat →
                </button>
              </div>
            )}

            {/* Polishing state */}
            {sarLoading&&!sarResult&&(
              <div style={{textAlign:"center",padding:"32px 0",color:T2.text3,fontFamily:T.sans,fontSize:13,fontStyle:"italic"}}>Sharpening your statement...</div>
            )}

            {/* Voice prompter — one step at a time */}
            {!sarResult&&!sarLoading&&(
              <div style={{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:"24px 28px"}}>
                <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8,fontFamily:T.sans}}>
                  {SAR_DEF[sarStep].label} &middot; Step {sarStep+1} of 3
                </div>
                <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.6,margin:"0 0 24px",fontWeight:300}}>
                  {SAR_DEF[sarStep].prompt}
                </p>

                {sarIsRec ? (
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:3,height:48}}>
                      {sarWave.map((h,i)=>(
                        <div key={i} style={{width:4,borderRadius:2,height:Math.max(4,h*44)+"px",background:T.gold,opacity:0.45+h*0.55,transition:"height 0.08s ease"}}/>
                      ))}
                    </div>
                    <div style={{fontFamily:T.sans,fontSize:12,color:T2.text3}}>
                      {sarGuideTime>0?sarGuideTime+"s guide remaining":"Take your time — tap to stop when ready"}
                    </div>
                    <button onClick={sarStopRec} style={{width:60,height:60,borderRadius:"50%",border:"2px solid #B05C4A",background:"rgba(176,92,74,0.08)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width={18} height={18} viewBox="0 0 18 18" fill="#B05C4A"><rect x="4" y="4" width="10" height="10" rx="2"/></svg>
                    </button>
                  </div>
                ) : sarTranscribing ? (
                  <div style={{textAlign:"center",padding:"20px 0",color:T2.text3,fontFamily:T.sans,fontSize:13,fontStyle:"italic"}}>Transcribing...</div>
                ) : curPart ? (
                  <div>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:14}}>
                      <div style={{color:T.gold,fontSize:18,flexShrink:0,marginTop:1}}>&#10003;</div>
                      <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"{curPart}"</p>
                    </div>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <button onClick={()=>sarRedo(sarStep)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"0.5px solid "+T2.border,borderRadius:3,padding:"7px 13px",cursor:"pointer",fontFamily:T.sans,fontSize:12,color:T2.text3}}>
                        <RedoIcon color={T2.text3}/> Redo
                      </button>
                      {sarStep<2&&(
                        <button onClick={()=>setSarStep(sarStep+1)} style={{flex:1,padding:"9px 16px",borderRadius:3,border:"none",background:T.ink,color:T.bg,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:T.sans}}>
                          Next: {SAR_DEF[sarStep+1].label} →
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                    <button onClick={sarStartRec} style={{width:72,height:72,borderRadius:"50%",border:"2px solid "+T.gold,background:"rgba(138,158,132,0.08)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                      <MicIcon color={T.gold}/>
                    </button>
                    <span style={{fontFamily:T.sans,fontSize:12,color:T2.text3}}>Tap to record &middot; 20 seconds suggested</span>
                  </div>
                )}
              </div>
            )}

            <button onClick={()=>setD10PracticePhase("intro")} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"16px 0 0",textAlign:"left"}}>&#8592; Back</button>
          </div>
        );
      }

      if (step === "Simulation") {
        const HOT_SEAT_SCENARIOS = [
          {id:1, title:"The Surprise Skip-Level",  prompt:'"So — what have you been focused on lately?"',                          tag:"Strategic framing · Brevity · Confidence"},
          {id:2, title:"Promotion Calibration",     prompt:'"Why are you ready for the next level?"',                               tag:"Ownership · Evidence · Leadership language"},
          {id:3, title:"The Executive Fly-By",      prompt:'"How\'s the project going?"',                                           tag:"Brevity · Prioritisation · Executive comms"},
          {id:4, title:"Credit Theft",              prompt:"A colleague presents work you led as their own. Respond professionally.", tag:"Composure · Diplomacy · Ownership"},
          {id:5, title:"The Difficult Stakeholder", prompt:'"I\'m still not convinced this made a difference."',                    tag:"Persuasion · Calm under pressure · Credibility"},
          {id:6, title:"The Quiet Achiever Trap",   prompt:'"You do great work — but I need more visibility into your impact."',    tag:"Self-advocacy · Reframing · Strategic comms"},
        ];
        const cs10={card:{background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,padding:"22px 24px"},label:{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10},cta:{width:"100%",padding:"16px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:52}};

        // ── INTRO ──
        if(simPhase==='intro') return (
          <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Simulation · Day 10</div>
              <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,margin:0}}>The Leadership Hot Seat</h2>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{...cs10.card}}>
                <div style={cs10.label}>How It Works</div>
                <h3 style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T2.text,lineHeight:1.3,margin:"0 0 20px"}}>Six real scenarios. 30 seconds each. Speak — get coached.</h3>
                <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
                  {[
                    {n:1,label:"Pick a\nscenario",icon:<svg width={22} height={22} viewBox="0 0 22 22" fill="none"><rect x="4" y="3" width="14" height="16" rx="2" stroke={T.gold} strokeWidth="1.3"/><path d="M7 7h8M7 11h8M7 15h5" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
                    {n:2,label:"Hear the\nchallenge",icon:<svg width={22} height={22} viewBox="0 0 22 22" fill="none"><path d="M11 3C7 3 3.5 6 3.5 10c0 2.5 1.3 4.7 3.3 6l-1 3 3.2-1.2C10 18 10.5 18 11 18c4 0 7.5-3.6 7.5-8S15 3 11 3z" stroke={T.gold} strokeWidth="1.3"/></svg>},
                    {n:3,label:"Speak your\nanswer",icon:<svg width={22} height={22} viewBox="0 0 22 22" fill="none"><rect x="8" y="3" width="6" height="10" rx="3" stroke={T.gold} strokeWidth="1.3"/><path d="M5 11a6 6 0 0012 0M11 17v2M8 19h6" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
                    {n:4,label:"Get\ncoached",icon:<svg width={22} height={22} viewBox="0 0 22 22" fill="none"><path d="M11 3l1.5 4.5H17l-3.75 2.75 1.5 4.75L11 11.5l-3.75 2.5 1.5-4.75L5 6.5h4.5z" stroke={T.gold} strokeWidth="1.3" strokeLinejoin="round"/></svg>},
                  ].map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                        <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:6}}>{s.icon}</div>
                        <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,marginBottom:2}}>{s.n}</div>
                        <div style={{fontFamily:T.sans,fontSize:12,color:T2.text3,textAlign:"center",lineHeight:1.3,whiteSpace:"pre-line"}}>{s.label}</div>
                      </div>
                      {i<3&&<div style={{height:1,width:16,background:"rgba(138,158,132,0.2)",flexShrink:0,marginBottom:28}}/>}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{...cs10.card}}>
                <div style={cs10.label}>The First Step</div>
                <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,marginBottom:10,fontWeight:300}}>Six scenarios that feel painfully real. In high-stakes moments, nobody asks for your full backstory. You'll be judged on how clearly you communicate your impact — fast.</p>
                <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,margin:0,fontWeight:300}}>Frame the Situation. Explain your Action. Land the Result. Then stop.</p>
              </div>
              <div style={{...cs10.card}}>
                <div style={cs10.label}>Your AmplifyU Coach</div>
                <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,marginBottom:10,fontWeight:300}}>Your AmplifyU coach will assess your spoken response across Clarity, Structure, Confidence, Brevity, and Impact — then rewrite your answer to show you exactly what a stronger version sounds like.</p>
                <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.7,margin:0,fontStyle:"italic",fontWeight:300}}>Your impact. 30 seconds. Speak it.</p>
              </div>
              <button onClick={()=>setSimPhase('picking')} style={cs10.cta}>Start the Simulation →</button>
            </div>
          </div>
        );

        // ── PICKING ──
        if(simPhase==='picking') return (
          <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Simulation · Day 10</div>
              <h2 style={{fontFamily:T.serif,fontSize:32,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Choose Your Scenario</h2>
              <p style={{fontFamily:T.sans,fontSize:15,color:T2.text3,fontWeight:300}}>Pick the situation that feels most relevant to you right now.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {HOT_SEAT_SCENARIOS.map(sc=>(
                <button key={sc.id} onClick={()=>{setActiveScenario(sc);setSimPhase('ready');setSimTranscript('');setSimFallback('');setSimResult(null);setSimTimeLeft(30);}}
                  style={{padding:"20px 22px",borderRadius:6,border:"0.5px solid "+T2.border,background:T2.surface,textAlign:"left",cursor:"pointer",transition:"all 0.2s ease"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.background="rgba(138,158,132,0.04)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T2.border;e.currentTarget.style.background=T2.surface;}}>
                  <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>{sc.id}. {sc.title}</div>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T2.text,lineHeight:1.4,marginBottom:8}}>{sc.prompt}</div>
                  <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3}}>{sc.tag}</div>
                </button>
              ))}
            </div>
            <button onClick={resetSim} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"16px 0 0",textAlign:"left"}}>← Back</button>
          </div>
        );

        // ── READY ──
        if(simPhase==='ready'&&activeScenario) return (
          <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{...cs10.card,borderLeft:"3px solid "+T.gold,padding:"28px 32px"}}>
                <div style={cs10.label}>{activeScenario.title}</div>
                <p style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:T2.text,lineHeight:1.3,marginBottom:14}}>{activeScenario.prompt}</p>
                <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.65,margin:0,fontWeight:300}}>Frame the Situation. Explain your Action. Land the Result. Speak for up to 30 seconds. Click start when you are ready.</p>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["Lead with the result","Use 'I' not 'we'","Be specific","30 seconds max"].map((h,i)=>(
                  <span key={i} style={{padding:"5px 12px",borderRadius:20,background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",fontFamily:T.sans,fontSize:12,color:T.gold}}>{h}</span>
                ))}
              </div>
              {!SpeechRec10&&(
                <div style={{...cs10.card}}>
                  <div style={cs10.label}>Type Your Response</div>
                  <textarea value={simFallback} onChange={e=>setSimFallback(e.target.value)} placeholder="Type your response here…" style={{width:"100%",borderRadius:3,border:"0.5px solid "+T2.border,padding:"12px 14px",fontSize:14,fontFamily:T.sans,resize:"none",height:100,boxSizing:"border-box",background:T2.bg,color:T2.text,outline:"none",lineHeight:1.6}}/>
                </div>
              )}
              <button onClick={SpeechRec10?doSimStart:()=>analyzeSimResponse(simFallback)} style={cs10.cta}>Start Recording →</button>
              <button onClick={()=>setSimPhase('picking')} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"4px 0",textAlign:"center"}}>← Choose different scenario</button>
            </div>
          </div>
        );

        // ── RECORDING ──
        if(simPhase==='recording') return (
          <div key={idx} style={{padding:"44px 52px",overflowY:"auto"}}>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:"#0A0804",borderRadius:8,padding:"24px 28px",border:"0.5px solid rgba(138,158,132,0.15)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:"#CC4444",animation:"glowPulse 1s ease infinite"}}/>
                    <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(245,239,230,0.5)",textTransform:"uppercase",letterSpacing:"2px"}}>Recording</span>
                  </div>
                  <div style={{fontFamily:T.serif,fontSize:48,fontWeight:600,color:simTimeLeft<=10?"#CC4444":T.gold,lineHeight:1}}>{simTimeLeft}<span style={{fontFamily:T.sans,fontSize:14,color:"rgba(245,239,230,0.4)"}}>s</span></div>
                </div>
                <div style={{height:2,background:"rgba(245,239,230,0.07)",borderRadius:1,marginBottom:16,overflow:"hidden"}}>
                  <div style={{height:"100%",width:((30-simTimeLeft)/30*100)+"%",background:simTimeLeft<=10?"#CC4444":T.gold,borderRadius:1,transition:"width 1s linear"}}/>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,height:40,marginBottom:14}}>
                  {simWave.map((v,i)=><div key={i} style={{width:4,borderRadius:2,background:T.gold,height:Math.max(3,v*36),transition:"height 0.1s ease"}}/>)}
                </div>
                <p style={{fontFamily:T.serif,fontSize:15,color:"rgba(245,239,230,0.65)",lineHeight:1.5,margin:0}}>{activeScenario?.prompt}</p>
              </div>
              {simTranscript&&<div style={{...cs10.card,padding:"14px 16px"}}><div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Live transcript</div><p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.55,margin:0}}>{simTranscript.slice(-200)}</p></div>}
              <button onClick={doSimStop} style={{...cs10.cta,background:"#8A4A3A"}}>Stop & Get Feedback →</button>
            </div>
          </div>
        );

        // ── ANALYZING ──
        if(simPhase==='analyzing') return (
          <div key={idx} style={{padding:"44px 52px",display:"flex",flexDirection:"column",alignItems:"center",gap:16,textAlign:"center"}}>
            <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.gold,animation:`glowPulse 1.4s ease ${i*0.22}s infinite`}}/>)}</div>
            <p style={{fontFamily:T.serif,fontSize:20,color:T2.text,lineHeight:1.4,margin:0}}>Your AmplifyU coach is reviewing your response…</p>
            <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,margin:0,fontWeight:300}}>Evaluating clarity, structure, confidence, brevity, and impact.</p>
          </div>
        );

        // ── FEEDBACK ──
        if(simPhase==='feedback'&&simResult) return (
          <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {/* Score hero */}
              <div style={{background:"#0A0804",borderRadius:8,padding:"28px 32px",border:"0.5px solid rgba(138,158,132,0.15)"}}>
                <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"rgba(138,158,132,0.7)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>{activeScenario?.title}</div>
                <div style={{display:"flex",gap:24,alignItems:"flex-start",marginBottom:16}}>
                  <div style={{flexShrink:0}}><div style={{fontFamily:T.serif,fontSize:72,fontWeight:600,color:T.gold,lineHeight:0.9}}>{simResult.overall}</div><div style={{fontFamily:T.sans,fontSize:12,color:"rgba(245,239,230,0.4)",marginTop:4}}>/100</div></div>
                  <div style={{paddingTop:8}}><p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.25,margin:"0 0 8px"}}>{simResult.headline}</p></div>
                </div>
                {/* Score bars */}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {Object.entries(simResult.scores||{}).map(([dim,sc])=>(
                    <div key={dim} style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontFamily:T.sans,fontSize:11,color:"rgba(245,239,230,0.55)",width:90,flexShrink:0}}>{dim}</span>
                      <div style={{flex:1,height:3,background:"rgba(245,239,230,0.07)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:sc+"%",background:sc>=80?"rgba(82,112,96,0.8)":sc>=65?T.gold:"rgba(180,80,60,0.7)",borderRadius:2,transition:"width 1s ease"}}/></div>
                      <span style={{fontFamily:T.serif,fontSize:12,fontWeight:600,color:scoreColor(sc),width:24,textAlign:"right",flexShrink:0}}>{sc}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Strength + Improve */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{...cs10.card,padding:"18px 20px"}}><div style={cs10.label}>What Landed</div><p style={{fontFamily:T.serif,fontSize:15,color:T2.text,lineHeight:1.6,margin:0}}>{simResult.strength}</p></div>
                <div style={{...cs10.card,padding:"18px 20px",border:"0.5px solid rgba(176,122,64,0.3)"}}><div style={{...cs10.label,color:"#B07A40"}}>Biggest Opportunity</div><p style={{fontFamily:T.serif,fontSize:15,color:T2.text,lineHeight:1.6,margin:0}}>{simResult.improve}</p></div>
              </div>
              {/* Rewrite */}
              <div style={{...cs10.card,borderLeft:"2px solid "+T.gold,background:"rgba(138,158,132,0.04)"}}>
                <div style={cs10.label}>A Stronger Version</div>
                <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.7,margin:0}}>{simResult.rewrite}</p>
              </div>
              {/* Insight */}
              <div style={{...cs10.card}}>
                <div style={cs10.label}>Your AmplifyU Coach Says</div>
                <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.7,margin:0}}>{simResult.insight}</p>
              </div>
              <button onClick={()=>setSimPhase('picking')} style={cs10.cta}>Try Another Scenario →</button>
              <button onClick={resetSim} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"4px 0",textAlign:"center"}}>← Start over</button>
            </div>
          </div>
        );

        return (
          <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
            <button onClick={()=>setSimPhase('intro')} style={{background:"none",border:"none",color:T.gold,fontFamily:T.sans,fontSize:14,cursor:"pointer",padding:0}}>← Back to intro</button>
          </div>
        );
      }

      return null;
    };
    // ── D3 RightContent — Day 3: Eliminate Fillers ────────────────────────────
    const D3RightContent = () => {
      const [d3Card, setD3Card] = useState(null);
      const [simInput, setSimInput] = useState("");
      const [d3ExObserved, setD3ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d3ExObserved')||'{}'); } catch { return {}; } });
      const [d3ExOpenCard, setD3ExOpenCard] = useState(null);
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
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:350,messages:[{role:"user",content:`Count and identify filler words (um, uh, like, you know, sort of, basically, literally, actually, right, okay) in this text. Then rewrite it without fillers, replacing them with pauses or removing them. Format: "Found X fillers: [list]\\n\\nFiller-free version: [rewritten text]"\n\n"${fillerInput}"`}]})});
          const d = await res.json(); setFillerResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setFillerResult("Tip: Count every 'um', 'uh', 'like', 'you know'. Goal: under 3 per minute."); }
        setFillerLoading(false);
      }

      async function checkPace() {
        if (!paceInput.trim()) return; setPaceLoading(true);
        const words = paceInput.trim().split(/\s+/).filter(Boolean).length;
        try {
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:250,messages:[{role:"user",content:`Rewrite this as if spoken 20% slower — add natural pause markers [...] and break long sentences. Keep the same meaning. Return ONLY the rewritten version:\n\n"${paceInput}"`}]})});
          const d = await res.json(); setPaceResult({words,slow:(d.content||[]).map(b=>b.text||"").join("").trim()});
        } catch { setPaceResult({words,slow:null}); }
        setPaceLoading(false);
      }

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Master Filler-Free Speech</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:32,maxWidth:700}}>Most people are far stronger speakers than they realise. Filler words are often just an unconscious habit — and removing them is one of the fastest ways to elevate your credibility, authority, and influence.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:28}}>
            {D3_FACTS.map((n,i)=>{
              const open = d3Card===i;
              return (
                <div key={i} onClick={()=>setD3Card(open?null:i)}
                  style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                    <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0,transition:"color 0.2s"}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                  {open && (
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                      {n.bullets.map((b,j)=>(
                        <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                          <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/>
                          <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>The Cognitive Load Principle</h2>
          <div style={{padding:"20px 24px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,marginBottom:24}}>
            <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>Fillers happen when your brain is multitasking faster than it can think.</p>
          </div>
          {(()=>{
            const [open3, setOpen3] = useState(null);
            const CARDS = [
              {label:"The Real Cause",           sub:"Fillers are not a habit. They are a symptom — your brain trying to hold the floor while it catches up.",
                bullets:["Speaking, thinking, and organising ideas all compete for the same mental bandwidth at once.","When your mouth moves faster than your thoughts, your brain reaches for a placeholder. That placeholder is the filler."]},
              {label:"Inside the Moment",        sub:"What actually happens in the moment you say 'um' or 'er'.",
                bullets:["Your next thought isn't ready. The filler buys your brain time — but at the cost of your credibility.","The audience hears the filler before they hear the idea. It signals uncertainty, even when you feel confident."]},
              {label:"The Strategic Pause",      sub:"The solution is not to speak faster. It is to stop — and let your brain catch up.",
                bullets:["When you feel the urge to fill, pause instead. Close your mouth. Let the silence work.","A pause signals control. It tells the room: what comes next is worth waiting for."]},
              {label:"Why This Fix Works",      sub:"Pause. Breathe. That single moment changes everything.",
                bullets:["A breath creates mental clarity and calms the nervous system — in that moment, you give yourself the best possible chance of a strong response.","Speak in declarative statements. Calm. Clear. Certain. One idea. One sentence. Full stop. No hedge. No filler. Just the point."]},
            ];
            return (
              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
                {CARDS.map((p,i)=>{
                  const isOpen=open3===i;
                  return (
                    <div key={i} onClick={()=>setOpen3(isOpen?null:i)}
                      style={{padding:"18px 20px",background:T2.surface,borderRadius:4,border:`0.5px solid ${isOpen?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:isOpen?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:isOpen?8:8}}>
                        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",flex:1}}>{p.label}</div>
                        <span style={{fontFamily:T.sans,fontSize:15,color:isOpen?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0}}>{isOpen?"▴":"▸"}</span>
                      </div>
                      <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:400,margin:isOpen?"0 0 12px":0}}>{p.sub}</p>
                      {isOpen && (<div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                        {p.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/><p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p></div>))}
                      </div>)}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      );

      if (step === "Example") {
        const D3_EDITORIAL = [
          { id:"freeman", img:"/d3-freeman.png?v=2", imgPos:"center 55%", name:"Morgan Freeman", superpower:"Master of the Pause",
            superpowerText:"Turns silence into emphasis.",
            summary:"No ums. No uhs. Just measured, deliberate speech.",
            quote:"\"Hope is a good thing. Maybe the best of things. And no good thing ever dies.\"",
            exploreLabel:"Explore his techniques",
            body1:"Listen to Morgan Freeman narrate anything. You'll notice what he doesn't say.",
            body2:"No ums. No uhs. No fillers. Just measured, deliberate speech.",
            body3:"When he needs to think, he pauses. That pause doesn't weaken his delivery — it strengthens it.",
            whyItWorks:"Silence creates anticipation. Fillers create distraction. When Freeman pauses, your attention sharpens — you lean in to hear what comes next. The pause is the tool, not the gap.",
            technique:"When you don't know what to say next, stop talking. Pause. Breathe. Then continue. Practice letting the silence sit — it signals confidence, not uncertainty.",
            lesson:"The pause is not your enemy. It's your most underused communication tool. Use it deliberately.",
          },
          { id:"wintour", img:"/d3-wintour.png?v=2", imgPos:"center 45%", name:"Anna Wintour", superpower:"Filler-Free Authority",
            superpowerText:"Every word chosen. Zero wasted.",
            summary:"She pauses between thoughts — no fillers, no hedging, just control.",
            quote:"\"Decisiveness.\"",
            exploreLabel:"Explore her techniques",
            body1:"Anna Wintour runs Vogue. When she speaks, there's no fluff.",
            body2:"A journalist asked: \"What makes a good editor?\" She paused for three seconds. Then: one word. Perfect answer.",
            body3:"Fillers signal uncertainty. Pauses signal control. She always knows what she wants to say.",
            whyItWorks:"She prepares before she speaks. That means she never needs to fill space with ums or uhs. The pause is deliberate — it communicates that the answer was worth waiting for.",
            technique:"Prepare your answer before you speak. If you haven't decided what to say, don't start talking yet. Wait. Think. Then deliver.",
            lesson:"Filler-free speech starts with knowing your point. The cleaner your thinking, the cleaner your delivery.",
          },
        ];
        const reading = D3_EDITORIAL.find(c => c.id === d3ExOpenCard);
        const openReading = (id) => {
          setD3ExOpenCard(id);
          if (!d3ExObserved[id]) {
            const next = {...d3ExObserved, [id]: true};
            setD3ExObserved(next);
            localStorage.setItem('d3ExObserved', JSON.stringify(next));
          }
        };
        if (reading) return (
          <div key={"d3read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD3ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters of the Pause</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Two speakers who turned silence into a superpower.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D3_EDITORIAL.map(card=>{
                const obs = d3ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:T2.surface,display:"flex",flexDirection:"column"}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:10,right:10,fontFamily:T.sans,fontSize:10,fontWeight:600,color:obs?"rgba(97,145,100,0.95)":"rgba(245,239,230,0.75)",display:"flex",alignItems:"center",gap:3,background:"rgba(20,18,14,0.35)",padding:"4px 9px",borderRadius:20,backdropFilter:"blur(4px)"}}>
                        <span>{obs?"✓":"◉"}</span><span>Observed</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.15,marginBottom:4}}>{card.name}</h3>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:10}}>{card.superpower}</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                            <span style={{fontSize:9,color:T.gold}}>✦</span>
                            <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.8px"}}>Superpower</span>
                          </div>
                          <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{card.superpowerText}</p>
                        </div>
                        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:400,color:T2.text3,display:"flex",alignItems:"center",gap:2,flexShrink:0,whiteSpace:"nowrap"}}>
                          <span>{card.exploreLabel}</span>
                          <span data-arrow style={{transition:"transform 0.25s ease",display:"inline-block"}}>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (step === "Rehearsal") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>The Filler-Free Challenge</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,letterSpacing:"-0.5px",lineHeight:1.2,marginBottom:32}}>Replace fillers with calm, intentional communication.</h2>
          <D3PracticeWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );
      if (step === "Practice_OLD_UNUSED") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
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
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Simulation · Day 3</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:32}}>Speak Without Filling the Silence</h2>
          <D3SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      return null;
    };

    // ── D4 RightContent — Day 4: Short Sentences ──────────────────────────────
    const D4RightContent = () => {
      const [d4Card, setD4Card] = useState(null);
      const [d4CardOpen, setD4CardOpen] = useState(null);
      const [sentInput, setSentInput] = useState(""); const [sentResult, setSentResult] = useState(null); const [sentLoading, setSentLoading] = useState(false);
      const [connInput, setConnInput] = useState(""); const [connResult, setConnResult] = useState(null); const [connLoading, setConnLoading] = useState(false);
      const [heming, setHeming] = useState(""); const [hemResult, setHemResult] = useState(null); const [hemLoading, setHemLoading] = useState(false);
      const [simInput, setSimInput] = useState("");
      const [d4ExObserved, setD4ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d4ExObserved')||'{}'); } catch { return {}; } });
      const [d4ExOpenCard, setD4ExOpenCard] = useState(null);
      const openCard = D4_EXAMPLES_DATA.find(c=>c.id===d4Card);

      const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length;

      async function splitSentence() {
        if (!sentInput.trim()) return; setSentLoading(true);
        try {
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:300,messages:[{role:"user",content:`Split this sentence into 2-4 short sentences (under 15 words each). Return ONLY the split version, no explanation: "${sentInput}"`}]})});
          const d = await res.json(); setSentResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setSentResult("Try splitting at every connector: 'and', 'but', 'which', 'that'."); }
        setSentLoading(false);
      }

      async function killConnectors() {
        if (!connInput.trim()) return; setConnLoading(true);
        try {
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:400,messages:[{role:"user",content:`Find the connectors (and, but, however, which, that, so, because) in this sentence and rewrite it as 2-5 short sentences. Start with a line like "Found X connectors:" then show the rewritten sentences on separate lines starting with →\n\n"${connInput}"`}]})});
          const d = await res.json(); setConnResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setConnResult("Try splitting at every 'and', 'but', 'however', 'which', or 'that'."); }
        setConnLoading(false);
      }

      async function hemingwayChallenge() {
        if (!heming.trim()) return; setHemLoading(true);
        try {
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:400,messages:[{role:"user",content:`Apply the Hemingway challenge to this paragraph — cut it to half the words, then half again. Return JSON: {half:"cut in half",quarter:"cut in half again",lesson:"what was removed"}\n\n"${heming}"`}]})});
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
            {D4_FACTS.map((n,i)=>{
              const open=d4CardOpen===i;
              return (
                <div key={i} onClick={()=>setD4CardOpen(open?null:i)}
                  style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                    <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                  {open && (<div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                    {n.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/><p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p></div>))}
                  </div>)}
                </div>
              );
            })}
          </div>
          <p style={{fontFamily:T.sans,fontSize:16,fontStyle:"italic",color:T.gold,lineHeight:1.7,fontWeight:400}}>Long sentences lose people. Short sentences move them.</p>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:34,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:14}}>Miller's Law</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:20}}>In 1956, psychologist George Miller discovered something fundamental about how humans think.</p>
          <div style={{padding:"18px 22px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,marginBottom:20}}>
            <p style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>We can only hold 7 (±2) pieces of information in working memory at once.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {["Every sentence you speak creates a memory load.","Long sentences stack information faster than your audience can process.","By the time you reach the end, they've forgotten the beginning.","The fix? One idea. One sentence. Full stop."].map((p,i)=>(
              <div key={i} style={{padding:"14px 16px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,fontWeight:400,margin:0}}>{p}</p>
              </div>
            ))}
          </div>
          <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:20}}>
            <div style={{fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>See It In Action</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"14px 16px",background:"rgba(139,74,56,0.05)",borderRadius:4,borderLeft:"2px solid rgba(139,74,56,0.3)"}}>
                <div style={{fontFamily:T.sans,fontSize:10,color:"#B05C4A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Too long — 34 words</div>
                <p style={{fontFamily:T.sans,fontSize:14,fontStyle:"italic",color:T.gold,lineHeight:1.7,fontWeight:400,margin:0}}>"Our platform enables cross-functional teams to coordinate asynchronous workflows while maintaining data integrity across distributed systems, which allows for more efficient resource allocation."</p>
              </div>
              <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                <div style={{fontFamily:T.sans,fontSize:10,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Better — 4 short sentences</div>
                <p style={{fontFamily:T.sans,fontSize:14,fontStyle:"italic",color:T.gold,lineHeight:1.7,fontWeight:400,margin:0}}>"Our platform helps teams work together. They coordinate without meetings. Data stays secure. Resource allocation improves."</p>
              </div>
            </div>
          </div>
        </div>
      );

      if (step === "Example") {
        const D4_EDITORIAL = [
          { id:"hemingway", img:"/d4-hemingway.png?v=2", imgPos:"center 40%", name:"Ernest Hemingway", superpower:"Master of Brevity",
            superpowerText:"Every word earns its place — or it goes.",
            summary:"He won the Nobel Prize with short, precise sentences.",
            quote:"\"The old man fished alone. Eighty-four days. No fish.\"",
            exploreLabel:"Explore his techniques",
            body1:"Hemingway won the Nobel Prize for literature. His secret? Short sentences.",
            body2:"No flourish. No decoration. Just truth.",
            body3:"Short sentences force precision. You can't hide weak ideas behind long ones. Every word earns its place or it goes.",
            whyItWorks:"Brevity forces clarity. When you limit words, you're forced to keep only the ones that matter. Long sentences let weak ideas hide behind structure. Short sentences expose them.",
            technique:"Write your first draft. Then cut every unnecessary word. Read each sentence aloud — if you run out of breath before the full stop, it's too long. Over 15 words? Split it.",
            lesson:"Every word you add dilutes your message. The best writers know what to leave out. Clarity is a discipline.",
          },
          { id:"chanel", img:"/d4-chanel.png?v=2", imgPos:"center 55%", name:"Coco Chanel", superpower:"Elegance Through Elimination",
            superpowerText:"Short sentences. Maximum impact. Every time.",
            summary:"She built an empire on less is more — in fashion and in words.",
            quote:"\"Fashion fades. Style remains.\"",
            exploreLabel:"Explore her techniques",
            body1:"Chanel revolutionised fashion with one principle: remove everything that isn't essential.",
            body2:"The same principle shaped how she spoke.",
            body3:"Short sentences. Maximum impact. Every time.",
            whyItWorks:"Each of her quotes is a complete thought. No wasted words. Just precision. The discipline of cutting in fashion is the same discipline as cutting in speech — both demand you decide what's essential and remove everything else.",
            technique:"Take your last important email or message. Find the three most essential sentences. Delete the rest. See if the meaning survives. It almost always does.",
            lesson:"Elegance in language, like elegance in fashion, is about knowing what to leave out. The most powerful sentences are the ones with nothing left to remove.",
          },
        ];
        const reading = D4_EDITORIAL.find(c => c.id === d4ExOpenCard);
        const openReading = (id) => {
          setD4ExOpenCard(id);
          if (!d4ExObserved[id]) {
            const next = {...d4ExObserved, [id]: true};
            setD4ExObserved(next);
            localStorage.setItem('d4ExObserved', JSON.stringify(next));
          }
        };
        if (reading) return (
          <div key={"d4read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD4ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters of Brevity</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Two voices that prove less is always more.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D4_EDITORIAL.map(card=>{
                const obs = d4ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:card.cardBg||T2.surface}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:10,right:10,fontFamily:T.sans,fontSize:10,fontWeight:600,color:obs?"rgba(97,145,100,0.95)":"rgba(245,239,230,0.75)",display:"flex",alignItems:"center",gap:3,background:"rgba(20,18,14,0.35)",padding:"4px 9px",borderRadius:20,backdropFilter:"blur(4px)"}}>
                        <span>{obs?"✓":"◉"}</span><span>Observed</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.15,marginBottom:4}}>{card.name}</h3>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:10}}>{card.superpower}</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                            <span style={{fontSize:9,color:T.gold}}>✦</span>
                            <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.8px"}}>Superpower</span>
                          </div>
                          <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{card.superpowerText}</p>
                        </div>
                        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:400,color:T2.text3,display:"flex",alignItems:"center",gap:2,flexShrink:0,whiteSpace:"nowrap"}}>
                          <span>{card.exploreLabel}</span>
                          <span data-arrow style={{transition:"transform 0.25s ease",display:"inline-block"}}>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (step === "Rehearsal") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>The Short Sentences Challenge</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,letterSpacing:"-0.5px",lineHeight:1.2,marginBottom:32}}>Short sentences give ideas space to land.</h2>
          <D4PracticeWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );
      if (step === "Practice_OLD_UNUSED_D4") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
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
          <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>🎥 Breaking News Live</div>
          <h2 style={{fontFamily:T.serif,fontSize:34,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:32}}>Report it live. Watch what your audience remembers.</h2>
          <D4SimWidget T={T} T2={T2} isDesktop={true}/>
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
      const [d1ExObserved, setD1ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d1ExObserved')||'{}'); } catch { return {}; } });
      const [d1ExOpenCard, setD1ExOpenCard] = useState(null);
      const openCard = D1_EXAMPLES.find(c=>c.id===d1OpenCard);

      async function simplifyJargon() {
        if (!jargonInput.trim()) return;
        setJargonLoading(true);
        try {
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:300,messages:[{role:"user",content:`Simplify this sentence, removing all jargon. Return ONLY the simplified sentence, nothing else: "${jargonInput}"`}]})});
          const data = await res.json();
          setJargonResult((data.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setJargonResult("Try again — keep it simple enough that a 10-year-old could understand."); }
        setJargonLoading(false);
      }

      async function runSoWhat() {
        if (!soWhatInput.trim()) return;
        setSoWhatLoading(true);
        try {
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:400,messages:[{role:"user",content:`Apply the "So What?" chain 3 times to this idea: "${soWhatInput}". Return JSON: {chain:[{q:"So what?",a:"..."},...],lead:"The real point to lead with"}`}]})});
          const data = await res.json();
          const raw = (data.content||[]).map(b=>b.text||"").join("").trim();
          try { const m=raw.match(/\{[\s\S]*\}/); setSoWhatResult(JSON.parse(m[0])); } catch { setSoWhatResult({chain:[{q:"So what?",a:"Your audience cares about results."},{q:"So what?",a:"Results earn trust and opportunity."},{q:"So what?",a:"Lead with outcomes, not process."}],lead:"Lead with the outcome — not the work."}); }
        } catch { setSoWhatResult(null); }
        setSoWhatLoading(false);
      }

      async function runBreathTest() {
        if (!breathInput.trim()) return; setBreathLoading(true);
        try {
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:200,messages:[{role:"user",content:`Condense this explanation into ONE clear sentence of under 15 words — something you can say in a single breath. Return ONLY the sentence: "${breathInput}"`}]})});
          const data = await res.json();
          setBreathResult((data.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setBreathResult("Try again — aim for one idea, under 15 words."); }
        setBreathLoading(false);
      }

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:34,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Why Clarity Wins</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:36,maxWidth:600}}>Clear language makes ideas easier to understand, easier to remember, and easier to act on. Here's why clarity matters.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28}}>
            {D1_CLARITY_FACTS.map((n,i)=>{
              const open = d1OpenCard===("cf"+i);
              return (
                <div key={i} onClick={()=>setD1OpenCard(open?null:"cf"+i)} className="au-lift" style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?T.gold:T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s, transform 0.2s"}}
                  onMouseEnter={e=>{if(!open){e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.boxShadow="0 4px 20px rgba(138,158,132,0.22), 0 1px 6px rgba(138,158,132,0.12)";}}}
                  onMouseLeave={e=>{if(!open){e.currentTarget.style.borderColor=T2.border;e.currentTarget.style.boxShadow="none";}}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?10:6}}>
                    <div style={{fontFamily:T.serif,fontSize:19,fontWeight:600,color:T.gold,lineHeight:1.3}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:12,color:open?T.gold:T2.text4,marginLeft:10,flexShrink:0,marginTop:2}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 14px":0}}>{n.sub}</p>
                  {open && (
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14,display:"flex",flexDirection:"column",gap:8}}>
                      {n.bullets.map((b,j)=>(
                        <div key={j} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                          <div style={{width:4,height:4,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/>
                          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.65,fontWeight:400,margin:0}}>{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic"}}>A clear message makes people lean in.</p>
        </div>
      );

      if (step === "Theory") {
        const steps = [
          {n:"01",icon:<svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="3" y="2" width="11" height="13" rx="1.5" stroke={T2.text4} strokeWidth="1.1"/><line x1="5.5" y1="5.5" x2="11.5" y2="5.5" stroke={T2.text4} strokeWidth="0.9"/><line x1="5.5" y1="8.5" x2="11.5" y2="8.5" stroke={T2.text4} strokeWidth="0.9"/><line x1="5.5" y1="11.5" x2="9.5" y2="11.5" stroke={T2.text4} strokeWidth="0.9"/></svg>,label:"Understand",desc:"Choose one concept and study it deeply.",focus:"Knowledge before communication."},
          {n:"02",icon:<svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M13.5 3h-10A1.5 1.5 0 002 4.5v5A1.5 1.5 0 003.5 11h2l2.5 3 2.5-3h3A1.5 1.5 0 0015 9.5v-5A1.5 1.5 0 0013.5 3z" stroke={T2.text4} strokeWidth="1.1"/></svg>,label:"Explain",desc:"Teach it in simple words as if to someone else.",focus:"Mastery is demonstrated through clarity."},
          {n:"03",icon:<svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M12.5 3.5l1 1-7.5 7.5H4.5v-1.5l7.5-7.5z" stroke={T2.text4} strokeWidth="1.1" strokeLinejoin="round"/><line x1="4.5" y1="14" x2="12.5" y2="14" stroke={T2.text4} strokeWidth="0.9" strokeLinecap="round" strokeDasharray="1.5 1.5"/></svg>,label:"Simplify",desc:"Identify gaps and remove unnecessary complexity.",focus:"Simplicity is precision. Every word should earn its place."},
          {n:"04",icon:<svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M14 8.5A5.5 5.5 0 013.5 6.5" stroke={T2.text4} strokeWidth="1.1" strokeLinecap="round"/><path d="M3 8.5A5.5 5.5 0 0113.5 10.5" stroke={T2.text4} strokeWidth="1.1" strokeLinecap="round"/><path d="M12 5l2 1.5-1.5 2" stroke={T2.text4} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12l-2-1.5 1.5-2" stroke={T2.text4} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>,label:"Refine",desc:"Review, clarify, and improve. Repeat until it sticks.",focus:"Clarity is built through iteration, not perfection."},
        ];
        return (
          <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:14}}>The Science</div>
            <h2 style={{fontFamily:T.serif,fontSize:34,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:14}}>The Feynman Technique</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Richard Feynman won the Nobel Prize in Physics — and could explain quantum mechanics to a 12-year-old.</p>
            <div style={{padding:"18px 22px",background:"rgba(44,36,22,0.07)",borderRadius:4,borderLeft:"2px solid "+T.gold,marginBottom:28}}>
              <p style={{fontFamily:T.serif,fontSize:17,fontWeight:600,color:T2.text,lineHeight:1.4,margin:"0 0 5px"}}>"If you can't explain it simply, you don't understand it well enough."</p>
              <p style={{fontFamily:T.sans,fontSize:11,color:T2.text4,margin:0}}>— Richard Feynman</p>
            </div>
            {steps.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:18,padding:"16px 18px",marginBottom:6,borderRadius:6,background:`rgba(44,36,22,${0.03+i*0.03})`}}>
                <div style={{fontFamily:T.serif,fontSize:24,fontWeight:300,color:T.gold,opacity:0.3,lineHeight:1,minWidth:28,paddingTop:3}}>{s.n}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>{s.icon}<div style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:"#8A9E84"}}>{s.label}</div></div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.65,fontWeight:400,margin:"0 0 5px"}}>{s.desc}</p>
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.55,fontWeight:300,fontStyle:"italic",margin:0}}>{s.focus}</p>
                </div>
              </div>
            ))}
            <div style={{marginTop:28,marginBottom:22}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>The Real Lesson</div>
              <div style={{fontFamily:T.serif,fontSize:18,fontWeight:400,fontStyle:"italic",color:T2.text,lineHeight:1.4}}>Teaching forces you to understand. Simplifying forces you to think.</div>
            </div>
          </div>
        );
      }

      if (step === "Example") {
        const D1_EDITORIAL = [
          { id:"attenborough", img:"/d11-attenborough.png?v=2", name:"Sir David Attenborough", superpower:"Master of Clarity",
            superpowerText:"Makes the complex feel beautifully simple.",
            summary:"He explains the natural world so everyone can see it.",
            quote:"\"The rainforest is like a vast, green lung breathing life into our planet.\"",
            body1:"Attenborough explains ecosystems, evolution, planetary forces — topics that could drown in scientific jargon.",
            body2:"Instead, he uses language anyone can picture:",
            body3:"No technical terms. Just an image you can see.",
            whyItWorks:"He translates scientific complexity into vivid, everyday language. You don’t need a biology degree to understand the Amazon.",
            technique:"Replace technical terms with pictures people already have in their heads. Make the abstract concrete.",
            lesson:"Clarity comes from choosing words that create images, not confusion. The best explainers make you see what they’re saying.",
          },
          { id:"branson", img:"/d11-branson.png?v=2", name:"Sir Richard Branson", superpower:"Conversation over Corporation",
            superpowerText:"Makes big ideas feel personal.",
            summary:"He speaks like a friend — even when addressing millions.",
            quote:"\"We just try to make things better for people. If we do that, they’ll choose us.\"",
            body1:"Branson built a global empire. But he speaks like he’s chatting with a friend.",
            body2:"When asked about Virgin’s strategy:",
            body3:"No \"synergies.\" No \"value propositions.\" No corporate fluff.",
            whyItWorks:"He uses plain English — words anyone would use. His message is so simple, you can repeat it back immediately.",
            technique:"Remove every word a 10-year-old wouldn’t understand. If what’s left still makes sense, you’ve found clarity.",
            lesson:"Jargon doesn’t make you sound smart. It makes you hard to understand. The clearest speakers use the simplest words.",
          },
        ];
        const reading = D1_EDITORIAL.find(c => c.id === d1ExOpenCard);
        const openReading = (id) => {
          setD1ExOpenCard(id);
          if (!d1ExObserved[id]) {
            const next = {...d1ExObserved, [id]: true};
            setD1ExObserved(next);
            localStorage.setItem('d1ExObserved', JSON.stringify(next));
          }
        };
        if (reading) return (
          <div key={"d1read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD1ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters of Clear Communication</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Two speakers who make complex ideas accessible.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D1_EDITORIAL.map(card=>{
                const obs = d1ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:T2.surface,display:"flex",flexDirection:"column"}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:10,right:10,fontFamily:T.sans,fontSize:10,fontWeight:600,color:obs?"rgba(97,145,100,0.95)":"rgba(245,239,230,0.75)",display:"flex",alignItems:"center",gap:3,background:"rgba(20,18,14,0.35)",padding:"4px 9px",borderRadius:20,backdropFilter:"blur(4px)"}}>
                        <span>{obs?"✓":"◉"}</span><span>Observed</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.15,marginBottom:4}}>{card.name}</h3>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:10}}>{card.superpower}</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                            <span style={{fontSize:9,color:T.gold}}>✦</span>
                            <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.8px"}}>Superpower</span>
                          </div>
                          <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{card.superpowerText}</p>
                        </div>
                        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:400,color:T2.text3,display:"flex",alignItems:"center",gap:2,flexShrink:0,whiteSpace:"nowrap"}}>
                          <span>Explore his techniques</span>
                          <span data-arrow style={{transition:"transform 0.25s ease",display:"inline-block"}}>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }



      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Simulation · Day 1</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:28}}>Clarity Check-In</h2>
          <D1SimWidget T={T} T2={T2} isDesktop={true} warmUpTopic={d1WarmUpTopic}/>
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
      const [d8ExObserved, setD8ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d8ExObserved')||'{}'); } catch { return {}; } });
      const [d8ExOpenCard, setD8ExOpenCard] = useState(null);

      async function buildStory() {
        const {setup,stakes,obstacle,choice,outcome,lesson} = storyBeats;
        if (!setup.trim()||!stakes.trim()) return; setStoryLoading(true);
        try {
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:400,messages:[{role:"user",content:`Assemble these 6 beats into a compelling 3-4 sentence professional story. Use vivid, human language. Return ONLY the story paragraph:\nSetup: ${setup}\nStakes: ${stakes}\nObstacle: ${obstacle}\nChoice: ${choice}\nOutcome: ${outcome}\nLesson: ${lesson}`}]})});
          const d = await res.json(); setStoryResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setStoryResult(null); }
        setStoryLoading(false);
      }

      async function analyzeMoment() {
        if (!momentInput.trim()) return; setMomentLoading(true);
        try {
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:300,messages:[{role:"user",content:`Identify the pivotal "5-second moment" of change in this story, and suggest how to make it more vivid. Return in format:\n"The moment: [extracted moment]\n\nMake it more vivid:\n→ [suggestion 1]\n→ [suggestion 2]\n→ [suggestion 3]"\n\n"${momentInput}"`}]})});
          const d = await res.json(); setMomentResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setMomentResult("Your pivotal moment is the heart of the story. Make it vivid — add sensory details, slow it down."); }
        setMomentLoading(false);
      }

      async function testTransformation() {
        if (!beforeInput.trim()||!afterInput.trim()) return; setBALoading(true);
        try {
          const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:250,messages:[{role:"user",content:`Analyse this before/after transformation and explain what changed and why it makes a compelling story. Keep it under 3 sentences.\nBefore: "${beforeInput}"\nAfter: "${afterInput}"`}]})});
          const d = await res.json(); setBAResult((d.content||[]).map(b=>b.text||"").join("").trim());
        } catch { setBAResult("Clear transformation detected. This is what makes people listen — they see the journey, not just the destination."); }
        setBALoading(false);
      }

      if (step === "Insight") {
        return (
          <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
            <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Why Stories Work</h2>
            <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32 }}>Stories transport your audience into a different world. Facts inform. Stories transform.</p>
            {(() => {
              const [openNT, setOpenNT] = useState(null);
              return (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
                  {NT_NEURO.map((n,i)=>{
                    const open=openNT===i;
                    return (
                      <div key={i} onClick={()=>setOpenNT(open?null:i)}
                        style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                          <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                          <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0}}>{open?"▴":"▸"}</span>
                        </div>
                        <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                        {open && (<div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                          {n.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/><p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p></div>))}
                        </div>)}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <p style={{ fontFamily:T.sans, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.7, fontWeight:400 }}>Facts explain. Stories move people.</p>
          </div>
        );
      }

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Green &amp; Brock, 2000</div>
          <h2 style={{ fontFamily:T.serif, fontSize:34, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Dual Coding Theory</h2>
          <p style={{ fontFamily:T.sans, fontSize:15, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:28 }}>Stories activate more of the brain than facts. They trigger emotion, memory, and meaning simultaneously. In professional settings, a well-placed story is the most powerful persuasion tool available.</p>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold, marginBottom:28 }}>
            <p style={{ fontFamily:T.serif, fontSize:19, fontWeight:600, color:T2.text, lineHeight:1.4, margin:0 }}>The brain encodes information more deeply when processed through both verbal and visual channels simultaneously. Story activates both. Facts alone activate only one.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
            {[
              {label:"Verbal Channel",  body:"Story activates the brain's language system — the same channel that processes speech, argument, and logic. It carries your message with precision."},
              {label:"Visual Channel",  body:"Story simultaneously triggers the brain's visual cortex, creating mental imagery. Facts alone never do this. Your audience sees what you describe."},
              {label:"65% vs 10%",      body:"People retain 65% of information delivered through story. Only 10% from data alone. Story isn't decoration — it's the delivery mechanism."},
              {label:"The Convergence", body:"Every skill you built in Week 1 — clarity, pace, structure, brevity — comes together in the moment you tell a story. This is where it all lands."},
            ].map((p,i)=>(
              <div key={i} style={{ padding:"16px 18px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.serif, fontSize:19, fontWeight:600, color:T.gold, lineHeight:1.3, marginBottom:10 }}>{p.label}</div>
                <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text, lineHeight:1.7, fontWeight:400, margin:0 }}>{p.body}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:T.serif, fontSize:15, fontStyle:"italic", color:T.gold, lineHeight:1.7 }}>The brain encodes story. It files away data.</p>
        </div>
      );

      if (step === "Example") {
        const D8_EDITORIAL = [
          { id:"obama", img:"/d8-obama.png?v=2", imgPos:"center 40%", name:"Barack Obama", superpower:"Master of Human-First Storytelling",
            superpowerText:"Every policy begins with a person.",
            summary:"When discussing healthcare, jobs, or education, Obama always started with a single human story — not a statistic.",
            quote:"\"Change will not come if we wait for some other person or some other time.\"",
            exploreLabel:"Explore his techniques",
            body1:"When discussing healthcare, jobs, or education, Barack Obama often began with a single person. Not a policy. Not a statistic. A person.",
            body2:"A mother struggling to pay bills. A worker trying to support a family. A student chasing a dream. The audience connected with the human story before hearing the argument.",
            body3:"People care about people before they care about issues. By leading with one specific individual, Obama made abstract policy feel personal — and personal means memorable.",
            whyItWorks:"Narrative transportation theory tells us that when we follow a character's story, we lower our defences. We stop arguing and start feeling. Obama used this to make audiences emotionally invested before making his case.",
            technique:"Start with a customer, colleague, or client before presenting the data. Give them a name. Give them a challenge. Then connect that story to your point.",
            lesson:"Facts tell. Stories sell. The most persuasive communicators don't lead with data — they lead with a human being.",
          },
          { id:"pixar", img:"/d8-pixar.png?v=2", imgPos:"center 45%", name:"The Pixar Framework", superpower:"The Most Replicable Story Structure Ever Invented",
            superpowerText:"Once upon a time... until finally.",
            summary:"Pixar used the same six-beat template for every film. It works because it mirrors how the human brain processes experience.",
            quote:"\"The story is not in the plot but in the telling.\"",
            exploreLabel:"Explore the framework",
            body1:"Pixar's story team discovered something remarkable: every great story follows the same six-beat structure. They used it for Up, Finding Nemo, Toy Story — and it works just as powerfully in a boardroom as it does on screen.",
            body2:"Once upon a time... Every day... Until one day... Because of that... Because of that... Until finally. Six beats. Every story ever told fits this shape.",
            body3:"The framework works because it mirrors how the human brain actually processes experience: we need a normal world, a disruption, and a resolution. Skip any beat and the story feels incomplete.",
            whyItWorks:"Narrative structure creates cognitive anticipation. When you establish a normal world and then disrupt it, the brain instinctively wants resolution. The audience stays engaged because they need to know how it ends.",
            technique:"Next time you present a challenge or pitch an idea, map it to the Pixar beats: set the normal world, name the disruption, trace the consequences, deliver the resolution. It takes 90 seconds and makes any message land harder.",
            lesson:"Structure doesn't constrain stories — it liberates them. The Pixar framework gives you a proven skeleton. Your job is simply to fill it with truth.",
          },
        ];
        const openReading = (id) => {
          if (!d8ExObserved[id]) {
            const next = {...d8ExObserved, [id]:true};
            setD8ExObserved(next);
            try { localStorage.setItem('d8ExObserved', JSON.stringify(next)); } catch {}
          }
          setD8ExOpenCard(id);
        };
        const reading = D8_EDITORIAL.find(c => c.id === d8ExOpenCard);
        if (reading) return (
          <div key={"d8read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD8ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Storytelling in the Wild</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Two examples of narrative transportation at its most powerful.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D8_EDITORIAL.map(card=>{
                const obs = d8ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:T2.surface,display:"flex",flexDirection:"column"}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:12,right:12,padding:"4px 10px",borderRadius:20,background:obs?"rgba(97,145,100,0.9)":"rgba(30,26,20,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:9,color:obs?"#fff":"rgba(245,239,230,0.75)",fontFamily:T.sans,fontWeight:500,letterSpacing:"0.5px"}}>{obs?"✓ Observed":"◉ Observed"}</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:6}}>{card.superpower}</div>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.2,margin:"0 0 8px"}}>{card.name}</h3>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                        <div>
                          <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>✦ SUPERPOWER</div>
                          <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300,maxWidth:160}}>{card.superpowerText}</div>
                        </div>
                        <span data-arrow style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:400,whiteSpace:"nowrap",transition:"transform 0.2s ease"}}>{card.exploreLabel} →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (step === "Rehearsal") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <D8PracticeWidget T={T} T2={T2} isDesktop={true} onSimulation={()=>setIdx(STEPS.indexOf('Simulation'))}/>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <StoryArchitectWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      return null;
    };

    // ── Day 9 RightContent ──────────────────────────────────────────────────
    const D9RightContent = () => {
      const [d9CardOpen, setD9CardOpen] = useState(null);
      const [d9ExOpen, setD9ExOpen] = useState(null);
      const [d9ExObserved, setD9ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d9ExObserved')||'{}'); } catch { return {}; } });
      const [d9ExOpenCard, setD9ExOpenCard] = useState(null);

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>The Missing Skill</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>How to make people feel understood.</h2>
          <p style={{ fontFamily:T.sans, fontSize:16, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:28, maxWidth:600 }}>Most people focus on what they want to say. Great communicators focus on understanding the person in front of them.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {D9_INSIGHT_CARDS.map((n,i)=>{
              const open=d9CardOpen===i;
              return (
                <div key={i} onClick={()=>setD9CardOpen(open?null:i)} style={{ padding:"22px 24px", background:T2.surface, borderRadius:4, border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`, cursor:"pointer", transition:"all 0.2s", boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:open?8:6 }}>
                    <div style={{ fontFamily:T.serif, fontSize:19, fontWeight:600, color:T.gold, lineHeight:1.3, flex:1 }}>{n.word}</div>
                    <span style={{ fontFamily:T.sans, fontSize:16, color:open?T.gold:"rgba(138,158,132,0.6)", marginLeft:8, flexShrink:0 }}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, lineHeight:1.6, fontWeight:300, margin:open?"0 0 12px":0 }}>{n.sub}</p>
                  {open && <div style={{ borderTop:"0.5px solid "+T2.divider, paddingTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                    {n.bullets.map((b,j)=><div key={j} style={{ display:"flex", gap:8, alignItems:"flex-start" }}><div style={{ width:3, height:3, borderRadius:"50%", background:T.gold, flexShrink:0, marginTop:6 }}/><p style={{ fontFamily:T.sans, fontSize:14, color:T2.text, lineHeight:1.65, fontWeight:300, margin:0 }}>{b}</p></div>)}
                  </div>}
                </div>
              );
            })}
          </div>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold }}>
            <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:T.gold, lineHeight:1.65, margin:0 }}>"Connection is not about having the perfect thing to say. It's about creating an environment where others feel comfortable sharing theirs."</p>
          </div>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>The Science of Connection</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:20 }}>Why some people make everyone feel understood</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:28 }}>
            {[
              { word:"The Likeability Principle", body:"People are more likely to trust, support and collaborate with people they like. Likeability isn't about being entertaining — it's about making others feel respected and understood." },
              { word:"Active Listening", body:"Active listening means giving someone your full attention. Not preparing your next answer. Not waiting for your turn. Simply listening with the goal of understanding, not responding." },
              { word:"The Curiosity Effect", body:"People enjoy conversations where they feel interesting. Great communicators ask questions that encourage reflection, storytelling and deeper thinking." },
              { word:"Empathy", body:"Empathy is the ability to understand another person's perspective. You don't need to agree with someone to understand them. Understanding builds connection. Connection builds trust." },
            ].map((n,i)=>{
              const open=d9CardOpen===("t"+i);
              return (
                <div key={i} onClick={()=>setD9CardOpen(open?null:("t"+i))} style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`, cursor:"pointer", transition:"all 0.2s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:open?8:0 }}>
                    <div style={{ fontFamily:T.serif, fontSize:19, fontWeight:600, color:T.gold, lineHeight:1.3, flex:1 }}>{n.word}</div>
                    <span style={{ fontFamily:T.sans, fontSize:16, color:open?T.gold:"rgba(138,158,132,0.6)", marginLeft:8 }}>{open?"▴":"▸"}</span>
                  </div>
                  {open && <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text, lineHeight:1.65, fontWeight:300, margin:0 }}>{n.body}</p>}
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:16 }}>The Four Communication Styles</div>
          <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, lineHeight:1.6, marginBottom:16, fontWeight:300 }}>Different people value different things. The strongest communicators adapt — not because they're being fake, but because they're being effective.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
            {D9_COMM_STYLES.map((s,i)=>(
              <div key={i} style={{ padding:"18px 20px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:700, color:s.colour, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8 }}>{s.label}</div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:600, color:T2.text4, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>Values</div>
                  {s.values.map((v,j)=><span key={j} style={{ fontFamily:T.sans, fontSize:12, color:T2.text3, display:"block", lineHeight:1.6 }}>{v}</span>)}
                </div>
                <div>
                  <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:600, color:T2.text4, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>Connect through</div>
                  {s.connect.map((v,j)=><span key={j} style={{ fontFamily:T.sans, fontSize:12, color:T.gold, display:"block", lineHeight:1.6 }}>{v}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:"16px 20px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold }}>
            <p style={{ fontFamily:T.serif, fontSize:17, fontStyle:"italic", color:T.gold, margin:0, lineHeight:1.6 }}>"Speak to people the way they need to be spoken to, not the way you prefer to communicate."</p>
          </div>
        </div>
      );

      if (step === "Example") {
        const D9_EDITORIAL = [
          { id:"william", img:"/d9-william.png?v=2", imgPos:"center 50%", name:"Prince William", superpower:"Master of Connection Through Listening",
            superpowerText:"Makes others feel heard, not just met.",
            summary:"Whether speaking with emergency responders, veterans, or young people, he creates space for others to share — and they remember how he made them feel.",
            quote:"\"Mental health is just as important as physical health.\"",
            exploreLabel:"Explore his techniques",
            body1:"Prince William is known for making people feel comfortable. Whether he's speaking with emergency responders, young people, veterans, or families, he rarely dominates the conversation. Instead, he creates space for others to speak.",
            body2:"His communication isn't built on having the perfect answer. It's built on making the other person feel heard.",
            body3:"In your next conversation, focus less on what you'll say next and more on understanding the other person's perspective. Ask one more question than you normally would. Let silence do some of the work.",
            whyItWorks:"Connection begins with listening. By asking thoughtful questions, maintaining genuine curiosity, and giving people time to share their experiences, he builds trust quickly. People remember how he made them feel, not just what he said.",
            technique:"In your next conversation, focus less on what you'll say next and more on understanding the other person's perspective. Ask one more question than you normally would. Let silence do some of the work.",
            lesson:"Strong communicators don't connect because they speak the most. They connect because they make others feel valued. Listening isn't the pause between speaking — it's where connection begins.",
          },
          { id:"jacinda", img:"/d9-jacinda.png?v=2", imgPos:"center 50%", name:"Jacinda Ardern", superpower:"Master of Empathetic Leadership",
            superpowerText:"Warmth, humility, and authenticity — every time.",
            summary:"She communicates with warmth, empathy, and authenticity. She doesn't create distance between herself and others — she closes it.",
            quote:"\"One of the criticisms I've faced over the years is that I'm not aggressive enough or assertive enough, or maybe somehow, because I'm empathetic, it means I'm weak. I totally rebel against that.\"",
            exploreLabel:"Explore her techniques",
            body1:"Jacinda Ardern has a remarkable ability to make leadership feel personal. Whether speaking to a nation after tragedy or chatting informally online from home, she communicates with warmth, empathy, and authenticity.",
            body2:"She doesn't create distance between herself and others — she closes it. Her message is simple: people come first.",
            body3:"People connect with leaders who feel genuine. By showing empathy, acknowledging emotions, and speaking with humility, she builds trust before asking for action. When people feel understood, they're far more willing to listen.",
            whyItWorks:"People connect with leaders who feel genuine. By showing empathy, acknowledging emotions, and speaking with humility, she builds trust before asking for action. When people feel understood, they're far more willing to listen.",
            technique:"Before trying to persuade someone, show that you understand their perspective. Acknowledge how they might be feeling, ask questions with genuine curiosity, and respond with empathy before offering your own view.",
            lesson:"Connection isn't about being the most charismatic person in the room. It's about making other people feel seen, heard, and understood. Empathy turns conversations into relationships, and relationships build lasting influence.",
          },
        ];
        const openReading = (id) => {
          if (!d9ExObserved[id]) {
            const next = {...d9ExObserved, [id]:true};
            setD9ExObserved(next);
            try { localStorage.setItem('d9ExObserved', JSON.stringify(next)); } catch {}
          }
          setD9ExOpenCard(id);
        };
        const reading = D9_EDITORIAL.find(c => c.id === d9ExOpenCard);
        if (reading) return (
          <div key={"d9read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD9ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Connection in Action</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Two communicators who connect by making others feel heard.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D9_EDITORIAL.map(card=>{
                const obs = d9ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:T2.surface,display:"flex",flexDirection:"column"}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:12,right:12,padding:"4px 10px",borderRadius:20,background:obs?"rgba(97,145,100,0.9)":"rgba(30,26,20,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:9,color:obs?"#fff":"rgba(245,239,230,0.75)",fontFamily:T.sans,fontWeight:500,letterSpacing:"0.5px"}}>{obs?"✓ Observed":"◉ Observed"}</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:6}}>{card.superpower}</div>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.2,margin:"0 0 8px"}}>{card.name}</h3>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                        <div>
                          <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>✦ SUPERPOWER</div>
                          <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300,maxWidth:160}}>{card.superpowerText}</div>
                        </div>
                        <span data-arrow style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:400,whiteSpace:"nowrap",transition:"transform 0.2s ease"}}>{card.exploreLabel} →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (step === "Rehearsal") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:28 }}>Build Your Connection Habits</h2>
          <D9PracticeWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:12 }}>The Rapport Builder</h2>
          <p style={{ fontFamily:T.sans, fontSize:17, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:600 }}>Four conversations. Four personalities. Adapt your style and build genuine rapport.</p>
          <D9SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      return null;
    };
    // ── end D9RightContent ──
    const D2RightContent = () => {
      const [d2InsightOpen, setD2InsightOpen] = useState(null);
      const [d2TheoryOpen, setD2TheoryOpen] = useState(null);
      const [d2ExObserved, setD2ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d2ExObserved')||'{}'); } catch { return {}; } });
      const [d2ExOpenCard, setD2ExOpenCard] = useState(null);

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
        </div>
      );

      if (step === "Rehearsal") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Train Your Instrument</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:560 }}>Voice requires repetition. Work through each exercise, then take the speed challenge.</p>
          <D2PracticeWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Simulation · Day 2</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:32 }}>Hear how your voice actually sounds.</h2>
          <D2SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Example") {
        const D2_EDITORIAL = [
          { id:"streep", img:"/d2-streep.png?v=2", name:"Meryl Streep", superpower:"Master of Precision and Presence",
            superpowerText:"Precision over volume. Control over noise.",
            summary:"Three iconic roles. Three completely different voices.",
            quote:"\"Take your broken heart, make it into art.\"",
            exploreLabel:"Explore her techniques",
            body1:"Streep proves that the most powerful communicators don't get louder — they get more precise.",
            body2:"Three iconic roles. Three completely different voices, each built from the same instrument: Miranda Priestly barely above a whisper, Sophie in raw fractured grief, Thatcher in deliberate political authority.",
            body3:"She never reaches for volume. She reaches for control.",
            whyItWorks:"Precision creates presence. A whisper can command a room. A pause can carry more weight than a raised voice. The voice in complete control is the voice people follow.",
            technique:"Don't reach for volume — reach for control. Slow down before your most important word. Let silence carry what a raised voice never can.",
            lesson:"Precision creates presence. Control creates impact. A rushed voice can feel uncertain. An intentional voice commands attention.",
          },
          { id:"sinek", img:"/d2-sinek.png?v=2", name:"Simon Sinek", superpower:"Master of Voice",
            superpowerText:"Makes big ideas land through deliberate delivery.",
            summary:"His voice carries the emotion before the words do.",
            quote:"\"People don't buy what you do. They buy why you do it.\"",
            exploreLabel:"Explore his techniques",
            body1:"Sinek doesn't just explain ideas. He performs them with his voice.",
            body2:"He changes pace. Lowers his tone. Speeds up with excitement. Slows down before the idea that matters most.",
            body3:"Simple words. Deliberate delivery.",
            whyItWorks:"Great speakers don't speak at one speed. Sinek constantly varies his pace, emphasis and tone to keep attention and guide the listener through his thinking. His voice gives structure to the message.",
            technique:"Highlight important ideas with your voice, not just your words. Slow down before your biggest point. Speed up when telling a story. Change your pitch and emphasis to signal what matters. If your voice stays flat, your message will too.",
            lesson:"People don't just listen to what you say. They listen to how you say it. A dynamic voice turns information into influence.",
          },
        ];
        const reading = D2_EDITORIAL.find(c => c.id === d2ExOpenCard);
        const openReading = (id) => {
          setD2ExOpenCard(id);
          if (!d2ExObserved[id]) {
            const next = {...d2ExObserved, [id]: true};
            setD2ExObserved(next);
            localStorage.setItem('d2ExObserved', JSON.stringify(next));
          }
        };
        if (reading) return (
          <div key={"d2read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD2ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters of Voice & Delivery</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Two voices. Two styles. One lesson in deliberate delivery.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D2_EDITORIAL.map(card=>{
                const obs = d2ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:T2.surface,display:"flex",flexDirection:"column"}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:10,right:10,fontFamily:T.sans,fontSize:10,fontWeight:600,color:obs?"rgba(97,145,100,0.95)":"rgba(245,239,230,0.75)",display:"flex",alignItems:"center",gap:3,background:"rgba(20,18,14,0.35)",padding:"4px 9px",borderRadius:20,backdropFilter:"blur(4px)"}}>
                        <span>{obs?"✓":"◉"}</span><span>Observed</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.15,marginBottom:4}}>{card.name}</h3>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:10}}>{card.superpower}</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                            <span style={{fontSize:9,color:T.gold}}>✦</span>
                            <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.8px"}}>Superpower</span>
                          </div>
                          <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{card.superpowerText}</p>
                        </div>
                        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:400,color:T2.text3,display:"flex",alignItems:"center",gap:2,flexShrink:0,whiteSpace:"nowrap"}}>
                          <span>{card.exploreLabel}</span>
                          <span data-arrow style={{transition:"transform 0.25s ease",display:"inline-block"}}>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
      const [d5OpenCard, setD5OpenCard] = useState(null);
      const [d5ExObserved, setD5ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d5ExObserved')||'{}'); } catch { return {}; } });
      const [d5ExOpenCard, setD5ExOpenCard] = useState(null);

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Why Structure Wins</h2>
          {/* PRE definition — shown before anything else */}
          <div style={{ display:"flex", gap:0, marginBottom:28, borderRadius:6, overflow:"hidden", border:"0.5px solid "+T2.border }}>
            {[{l:"P", word:"Point", desc:"State your view first."},{l:"R", word:"Reason", desc:"Explain why."},{l:"E", word:"Example", desc:"Make it concrete."}].map((item,i) => (
              <div key={i} style={{ flex:1, padding:"18px 20px", background:i===1?T2.surface:T2.bg, borderLeft:i>0?"0.5px solid "+T2.border:"none" }}>
                <div style={{ fontFamily:T.serif, fontSize:28, fontWeight:700, color:T.gold, lineHeight:1, marginBottom:6 }}>{item.l}</div>
                <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:700, color:T2.text, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:4 }}>{item.word}</div>
                <div style={{ fontFamily:T.sans, fontSize:12, color:T2.text3, lineHeight:1.5, fontWeight:300 }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:600 }}>Three parts. Every answer. PRE is the framework that makes your thinking instantly clear to whoever is listening.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {[
              {word:"Credibility",    sub:"Leading with your point signals clear thinking.", bullets:["Structured communication creates immediate credibility — your audience knows you have a clear perspective.","When you lead with your conclusion, you sound decisive and confident before you've even explained why."]},
              {word:"Recall",         sub:"Structured messages are 40% more memorable.",     bullets:["A clear beginning, middle and end helps your audience store and retrieve your message with ease.","Without structure, ideas blur together. With PRE, each part reinforces the next."]},
              {word:"Persuasion",     sub:"Great ideas rarely persuade on their own.",        bullets:["PRE helps you present a clear point, support it with logic, and reinforce it with proof.","Unstructured arguments make audiences work harder. Structured arguments make the next step obvious."]},
              {word:"Decision Speed", sub:"Leaders decide faster when communication is structured.", bullets:["Lead with your point and you cut the cognitive overhead for whoever is listening.","Every conversation you structure well ends faster — with the outcome you want."]},
            ].map((n,i)=>{
              const open = d5OpenCard===i;
              return (
                <div key={i} onClick={()=>setD5OpenCard(open?null:i)}
                  style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                    <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                  {open && (
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                      {n.bullets.map((b,j)=>(
                        <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                          <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/>
                          <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontFamily:T.sans, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.7 }}>Structure is the backbone of every powerful communication.</p>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>The Science</div>
          <h2 style={{ fontFamily:T.serif, fontSize:32, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>The architecture of every great professional answer</h2>
          <p style={{ fontFamily:T.sans, fontSize:14, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:28, maxWidth:640 }}>Two powerful findings from memory science explain exactly why PRE works — and why it's one of the most reliable communication frameworks available.</p>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold, marginBottom:28 }}>
            <p style={{ fontFamily:T.serif, fontSize:18, fontWeight:600, color:T2.text, lineHeight:1.4, margin:0 }}>People remember the beginning and end of information most clearly. The middle is forgotten.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:28 }}>
            {[
              {n:"Point",   role:"Strong opening anchor",   body:"Lead with your conclusion. The brain locks onto the first thing it hears — give it something worth remembering."},
              {n:"Reason",  role:"Cognitive bridge",         body:"Connect your point to meaning. This is how you make the idea stick — not just land."},
              {n:"Example", role:"Memorable closing proof",  body:"Finish with evidence. The recency effect means your example is the last thing heard — and the most recalled."},
            ].map((b,i)=>(
              <div key={i} style={{ padding:"20px 22px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border }}>
                <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6 }}>{b.n}</div>
                <div style={{ fontFamily:T.serif, fontSize:14, fontWeight:600, color:T2.text, marginBottom:8 }}>{b.role}</div>
                <p style={{ fontFamily:T.sans, fontSize:12, color:T2.text3, lineHeight:1.65, fontWeight:300, margin:0 }}>{b.body}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:T.sans, fontSize:13, fontStyle:"italic", color:T.gold, lineHeight:1.7 }}>PRE isn't just structure — it's how the brain naturally wants to receive information.</p>
        </div>
      );

      if (step === "Rehearsal") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <D5PracticeWidget T={T} T2={T2} isDesktop={true} onSimulation={() => setIdx(STEPS.indexOf('Simulation'))}/>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <D5SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Example") {
        const D5_EDITORIAL = [
          { id:"jensen", img:"/d5-jensen.png?v=2", imgPos:"center 40%", name:"Jensen Huang", superpower:"PRE in Every Pitch",
            superpowerText:"Point. Reason. Example. Every time.",
            summary:"He doesn't over-explain. Sharp thesis. Strategic rationale. Lived proof.",
            quote:"\"I don't need to build a killer product overnight, I just need to build a winning product.\"",
            exploreLabel:"Explore his techniques",
            body1:"Huang's most famous idea sounds simple. But it's structured.",
            body2:"Point: \"I just need to build a winning product.\" Reason: \"The goal of winning is so you can play again.\" Example: \"It's just like pinball — play well enough to get another game, and you could be there for a long time.\"",
            body3:"Said in 1993 — decades before the AI breakthrough that proved it true.",
            whyItWorks:"NVIDIA kept making bets and staying in the game until one breakthrough arrived: AI and accelerated computing. That single win transformed NVIDIA into one of the most valuable companies on earth. Sharp thesis. Strategic rationale. Lived proof.",
            technique:"Lead with your point — don't build to it. Then give your reason in one sentence. Then make it concrete with a real example or analogy. Stop there.",
            lesson:"PRE isn't a template — it's how clear thinkers communicate. Your point tells people where to look. Your reason tells them why it matters. Your example makes it stick.",
          },
          { id:"indra", img:"/d5-indra.png?v=2", imgPos:"center 35%", name:"Indra Nooyi", superpower:"Performance With Purpose",
            superpowerText:"Big belief. Clear reason. Concrete execution.",
            summary:"Two decades leading PepsiCo — structured the same way every time.",
            quote:"\"Performance must be married with purpose.\"",
            exploreLabel:"Explore her techniques",
            body1:"Nooyi ran one of the world's largest companies for 12 years. She led with structure.",
            body2:"Point: \"Performance must be married with purpose.\" Reason: \"The world is changing — consumers, governments, society.\" Example: \"At PepsiCo we've transformed our portfolio, reducing sugar, sodium and saturated fat, while investing in sustainability and our people.\"",
            body3:"She didn't leave it as philosophy — she operationalised it.",
            whyItWorks:"Point then reason then example. That's why she feels persuasive, intelligent, and trustworthy. Every statement is accountable to the next. Nothing floats without support.",
            technique:"Start with your belief — not the context, not the background. One sentence. Then say why the world demands it. Then show what you did about it.",
            lesson:"Structured communication isn't just clear — it's credible. When your point leads to your reason leads to your example, people trust your thinking.",
          },
        ];
        const reading = D5_EDITORIAL.find(c => c.id === d5ExOpenCard);
        const openReading = (id) => {
          setD5ExOpenCard(id);
          if (!d5ExObserved[id]) {
            const next = {...d5ExObserved, [id]: true};
            setD5ExObserved(next);
            localStorage.setItem('d5ExObserved', JSON.stringify(next));
          }
        };
        if (reading) return (
          <div key={"d5read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD5ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Structure in Action</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Two world-class communicators who organise their ideas so every message is clear, memorable, and easy to follow.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D5_EDITORIAL.map(card=>{
                const obs = d5ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:T2.surface,display:"flex",flexDirection:"column"}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:10,right:10,fontFamily:T.sans,fontSize:10,fontWeight:600,color:obs?"rgba(97,145,100,0.95)":"rgba(245,239,230,0.75)",display:"flex",alignItems:"center",gap:3,background:"rgba(20,18,14,0.35)",padding:"4px 9px",borderRadius:20,backdropFilter:"blur(4px)"}}>
                        <span>{obs?"✓":"◉"}</span><span>Observed</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.15,marginBottom:4}}>{card.name}</h3>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:10}}>{card.superpower}</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                            <span style={{fontSize:9,color:T.gold}}>✦</span>
                            <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.8px"}}>Superpower</span>
                          </div>
                          <p style={{fontFamily:T.sans,fontSize:11,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{card.superpowerText}</p>
                        </div>
                        <div style={{fontFamily:T.sans,fontSize:11,fontWeight:400,color:T2.text3,display:"flex",alignItems:"center",gap:2,flexShrink:0,whiteSpace:"nowrap"}}>
                          <span>{card.exploreLabel}</span>
                          <span data-arrow style={{transition:"transform 0.25s ease",display:"inline-block"}}>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      return <RightContent/>;
    };

    const D6RightContent = () => {
      const [openD6, setOpenD6] = useState(null);
      const [d6ExOpen, setD6ExOpen] = useState(null);
      const [d6ExObserved, setD6ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d6ExObserved')||'{}'); } catch { return {}; } });
      const [d6ExOpenCard, setD6ExOpenCard] = useState(null);
      const D6_INSIGHT = [
        {word:"Emotion",    sub:"Stress narrows thinking and makes reactive communication more likely.", bullets:["Composure keeps your thinking wide open when it matters most.","In high-pressure moments, the first thing to go is nuance — unless you've trained for composure."]},
        {word:"Perception", sub:"When others escalate, composure signals leadership.",                   bullets:["Calm in the room reads as confidence — and earns instant credibility.","The person who stays grounded when everyone else reacts is the one people look to."]},
        {word:"Influence",  sub:"Your emotional state affects everyone around you.",                     bullets:["Calm is contagious. The steadiest person shapes the entire dynamic.","Leadership presence is largely the ability to manage your own state so others can borrow your calm."]},
        {word:"Outcome",    sub:"Anyone can communicate well when things are easy.",                     bullets:["The conversations that define your career almost always happen under pressure.","High-stakes moments aren't where performance breaks — they're where character becomes visible."]},
      ];

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Why Composure Wins</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Stay Calm Under Pressure</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:600 }}>Most people communicate well when conversations are easy. But promotions, relationships, leadership, and trust are often shaped in moments of tension.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {D6_INSIGHT.map((n,i)=>{
              const open=openD6===i;
              return (
                <div key={i} onClick={()=>setOpenD6(open?null:i)}
                  style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                    <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                  {open && (<div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                    {n.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/><p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p></div>))}
                  </div>)}
                </div>
              );
            })}
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

      if (step === "Rehearsal") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <D6PracticeWidget T={T} T2={T2} isDesktop={true} onSimulation={() => setIdx(STEPS.indexOf('Simulation'))}/>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <D6SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Example") {
        const D6_EDITORIAL = [
          { id:"hamilton", img:"/d6-hamilton.png?v=2", imgPos:"center 50%", name:"Lewis Hamilton", superpower:"Master of Composure Under Pressure",
            superpowerText:"Calm when every reason says otherwise.",
            summary:"Seven world championships — and his most powerful moment was how he handled losing one.",
            quote:"\"Firstly, a big congratulations to Max.\"",
            exploreLabel:"Explore his techniques",
            body1:"Throughout his career, Hamilton has faced criticism, controversy, public scrutiny, and championship-defining setbacks while performing on one of the world's biggest stages.",
            body2:"Abu Dhabi 2021 — one lap from a record-breaking eighth world title. One of the most controversial endings in sporting history. With millions watching, his first public words were: \"Firstly, a big congratulations to Max.\" Extreme disappointment. Global audience. Massive controversy. Yet his first response was composure.",
            body3:"Elite communicators aren't naturally calm. They learn how to manage their reactions. Years later, Hamilton admitted he felt wronged — but also said he had found peace with it.",
            whyItWorks:"When everyone expects a reaction, composure is the most powerful response available. Hamilton's calm didn't signal indifference — it signalled control. That's what leadership looks like under the most intense public scrutiny imaginable.",
            technique:"Before responding in a high-pressure moment, give yourself one breath. Ask: what do I want people to remember about how I handled this? Respond to that — not to the emotion in the room.",
            lesson:"Emotional control is often most visible when you have every reason to lose it. Pressure doesn't create character. It reveals it.",
          },
          { id:"amal", img:"/d6-amal.png?v=2", imgPos:"center 50%", name:"Amal Clooney", superpower:"Master of Composure Under Pressure",
            superpowerText:"Every word chosen. Every sentence deliberate.",
            summary:"She argues the world's most consequential legal cases — calm, precise and measured when the stakes couldn't be higher.",
            quote:"\"Pressure rarely rewards the loudest voice. It rewards the clearest mind.\"",
            exploreLabel:"Explore her techniques",
            body1:"Amal Clooney argues some of the world's most consequential legal cases, where every sentence can influence justice, diplomacy and human lives.",
            body2:"Whether addressing international courts, questioning witnesses or speaking before world leaders, she remains calm, precise and measured — even when the stakes couldn't be higher.",
            body3:"Amal doesn't rush, interrupt or react emotionally. She relies on preparation, evidence and deliberate communication, allowing facts — not emotion — to carry the greatest weight.",
            whyItWorks:"Pressure rarely rewards the loudest voice. It rewards the clearest mind. When others escalate, composure signals leadership and earns instant credibility.",
            technique:"Slow your pace before answering. Respond to the question, not the emotion behind it. When pressure rises, focus on clear, deliberate language rather than filling the silence.",
            lesson:"Pressure doesn't demand more words. It demands better ones.",
          },
        ];
        const openReading = (id) => {
          if (!d6ExObserved[id]) {
            const next = {...d6ExObserved, [id]:true};
            setD6ExObserved(next);
            try { localStorage.setItem('d6ExObserved', JSON.stringify(next)); } catch {}
          }
          setD6ExOpenCard(id);
        };
        const reading = D6_EDITORIAL.find(c => c.id === d6ExOpenCard);
        if (reading) return (
          <div key={"d6read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD6ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters Under Pressure</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Two voices that stayed composed when everything was on the line.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D6_EDITORIAL.map(card=>{
                const obs = d6ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:T2.surface,display:"flex",flexDirection:"column"}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:12,right:12,padding:"4px 10px",borderRadius:20,background:obs?"rgba(97,145,100,0.9)":"rgba(30,26,20,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:9,color:obs?"#fff":"rgba(245,239,230,0.75)",fontFamily:T.sans,fontWeight:500,letterSpacing:"0.5px"}}>{obs?"✓ Observed":"◉ Observed"}</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:6}}>{card.superpower}</div>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.2,margin:"0 0 8px"}}>{card.name}</h3>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                        <div>
                          <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>✦ SUPERPOWER</div>
                          <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300,maxWidth:160}}>{card.superpowerText}</div>
                        </div>
                        <span data-arrow style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:400,whiteSpace:"nowrap",transition:"transform 0.2s ease"}}>{card.exploreLabel} →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      return <RightContent/>;
    };

    const D11ExCard = ({card}) => {
      const [open, setOpen] = useState(false);
      const [formulaOpen, setFormulaOpen] = useState(false);
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:T2.surface, borderRadius:8, border:"0.5px solid "+T2.border, overflow:"hidden" }}>
            <button onClick={()=>setOpen(o=>!o)} style={{ width:"100%", padding:"28px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", border:"none", background:"transparent", cursor:"pointer", textAlign:"left" }}>
              <div>
                <h3 style={{ fontFamily:T.serif, fontSize:28, fontWeight:600, color:T2.text, marginBottom:4, lineHeight:1.1 }}>{card.name}</h3>
                <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text3, marginBottom:8, fontWeight:300 }}>{card.role}</p>
                <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px" }}>{card.headline}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0, marginLeft:24 }}>
                <span style={{ fontFamily:T.sans, fontSize:13, color:T2.text3, fontWeight:300 }}>{open?"Close":"Read more"}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform:open?"rotate(180deg)":"none", transition:"transform 0.2s", flexShrink:0 }}><path d="M3 6l5 5 5-5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </button>
            {open && (
              <div style={{ padding:"0 32px 28px", borderTop:"0.5px solid "+T2.border }}>
                <p style={{ fontFamily:T.sans, fontSize:15, color:T2.text, lineHeight:1.75, fontWeight:300, margin:"20px 0 20px" }}>{card.body}</p>
                <div style={{ padding:"16px 20px", background:T2.bg, borderRadius:4, borderLeft:"2px solid "+T.gold }}>
                  <p style={{ fontFamily:T.serif, fontSize:16, fontStyle:"italic", color:T.gold, lineHeight:1.65, margin:0 }}>{card.lesson}</p>
                </div>
              </div>
            )}
          </div>
          <div style={{ background:T2.surface, borderRadius:8, border:"0.5px solid "+T2.border, overflow:"hidden" }}>
            <button onClick={()=>setFormulaOpen(o=>!o)} style={{ width:"100%", padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", border:"none", background:"transparent", cursor:"pointer", textAlign:"left" }}>
              <div style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"2px" }}>How they map to the Brand Formula</div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform:formulaOpen?"rotate(180deg)":"none", transition:"transform 0.2s", flexShrink:0, marginLeft:16 }}><path d="M3 6l5 5 5-5" stroke={T.gold} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {formulaOpen && (
            <div style={{ padding:"0 32px 28px", borderTop:"0.5px solid "+T2.border }}>
            <div style={{ display:"flex", flexDirection:"column", gap:0, marginTop:20 }}>
              {card.ingredients.map((ing,i)=>(
                <div key={i} style={{ display:"flex", gap:16, paddingBottom:i<card.ingredients.length-1?16:0, marginBottom:i<card.ingredients.length-1?16:0, borderBottom:i<card.ingredients.length-1?"0.5px solid "+T2.border:"none", alignItems:"flex-start" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, width:130 }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(138,158,132,0.12)", border:"1px solid rgba(138,158,132,0.35)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold }}>{i+1}</span>
                    </div>
                    <span style={{ fontFamily:T.sans, fontSize:13, fontWeight:700, color:T2.text }}>{ing.n}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, lineHeight:1.65, fontWeight:300, margin:0, marginBottom:ing.lesson?10:0 }}>{ing.detail}</p>
                    {ing.lesson && (
                      <div style={{ padding:"10px 14px", background:"rgba(138,158,132,0.08)", borderRadius:4, borderLeft:"2px solid rgba(138,158,132,0.4)" }}>
                        <span style={{ fontFamily:T.sans, fontSize:10, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", display:"block", marginBottom:4 }}>AmplifyU Lesson</span>
                        <p style={{ fontFamily:T.sans, fontSize:13, color:T2.text, lineHeight:1.6, fontWeight:400, fontStyle:"italic", margin:0 }}>{ing.lesson}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {card.closing && (
              <div style={{ marginTop:24, padding:"20px 24px", background:"rgba(138,158,132,0.07)", borderRadius:6, border:"0.5px solid rgba(138,158,132,0.25)", textAlign:"center" }}>
                <p style={{ fontFamily:T.serif, fontSize:19, fontStyle:"italic", color:T2.text, lineHeight:1.6, margin:0 }}>{card.closing}</p>
              </div>
            )}
            </div>
            )}
          </div>
        </div>
      );
    };

    const D11RightContent = () => {
      const [d11Test, setD11Test] = useState(null);
      const [d11CardOpen, setD11CardOpen] = useState(null);
      const [d11ExObserved, setD11ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d11ExObserved')||'{}'); } catch { return {}; } });
      const [d11ExOpenCard, setD11ExOpenCard] = useState(null);

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Why Image Matters</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Perception Is Built From Signals</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {D11_FACTS.map((n,i)=>{
              const open=d11CardOpen===("ins"+i);
              return (
                <div key={i} onClick={()=>setD11CardOpen(open?null:("ins"+i))}
                  style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                    <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                  {open && (<div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                    {n.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/><p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p></div>))}
                  </div>)}
                </div>
              );
            })}
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
            <div style={{ display:"flex", flexWrap:"nowrap", gap:10, marginBottom:20 }}>
              {[["Clear","Intelligence"],["Calm","Competence"],["Confident","Capability"],["Warm","Trustworthiness"]].map(([sig,res],i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:T2.surface, borderRadius:20, border:"0.5px solid "+T2.border }}>
                  <span style={{ fontFamily:T.sans, fontSize:13, fontWeight:500, color:T2.text }}>{sig}</span>
                  <span style={{ fontFamily:T.sans, fontSize:12, color:T.gold }}>→</span>
                  <span style={{ fontFamily:T.sans, fontSize:13, fontWeight:600, color:T.gold }}>{res}</span>
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

      if (step === "Rehearsal") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <D11PracticeWidget T={T} T2={T2} isDesktop={true} onWordsChange={setD11BrandWords} onSimulation={() => setIdx(STEPS.indexOf('Simulation'))}/>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <D11SimWidget T={T} T2={T2} isDesktop={true} brandWords={d11BrandWords}/>
        </div>
      );

      if (step === "Example") {
        const D11_EDITORIAL = [
          { id:"swift", img:"/d11-swift.png?v=2", imgPos:"center 40%", name:"Taylor Swift", superpower:"Master of Personal Brand",
            superpowerText:"Making people feel part of the journey.",
            summary:"She didn't just build a music career — she built one of the most valuable personal brands in the world by making people feel personally invested in her story.",
            quote:"\"People didn't just buy Taylor Swift's music. They bought into her journey.\"",
            exploreLabel:"Explore her brand",
            body1:"Taylor Swift didn't just build a music career — she built one of the most valuable personal brands in the world by making people feel like they were part of her journey. From teenage country songwriter to global cultural icon, her brand evolved without losing its emotional core: authenticity, storytelling, reinvention, and direct connection with her audience.",
            body2:"Fans don't just consume her work. They feel personally invested in her story. Behind-the-scenes access, fan easter eggs, emotional honesty, long-form storytelling, meaningful audience interaction — every touchpoint was designed to reward attention and deepen connection.",
            body3:"Taylor made global fame feel personal. She openly shares heartbreak, ambition, growth, mistakes, reinvention, and vulnerability. People feel like they've grown alongside her. That's the most powerful form of personal branding: making your story feel like their story.",
            whyItWorks:"Exceptional personal brands don't just broadcast achievement — they invite people into a journey. When audiences feel emotionally invested in someone's story, they become advocates, not just fans. Taylor Swift understood this intuitively, building a brand on authenticity, emotional honesty, and consistent reinvention.",
            technique:"Before your next presentation or professional interaction, ask yourself: \"What part of my journey could I share that the audience would recognise in themselves?\" Vulnerability and honesty create connection faster than credentials ever will.",
            lesson:"People didn't just buy Taylor Swift's music. They bought into her journey. The strongest personal brands make people feel like they are part of the story — not just observers of it.",
          },
          { id:"disney", img:"/d11-disney.png?v=2", imgPos:"center 40%", name:"Disney", superpower:"Master of Brand Consistency",
            superpowerText:"100 years of one word: Magic.",
            summary:"Disney has spent a century staying true to one emotional promise across every format, generation, and medium — Magic, Wonder, and Imagination.",
            quote:"\"Disney didn't build a brand. They built a feeling — and then protected it for 100 years.\"",
            exploreLabel:"Explore their brand",
            body1:"Disney has spent a century doing something most organisations never achieve: staying completely true to a brand identity across every format, generation, and medium. From Steamboat Willie in 1928 to Marvel, Pixar, and Star Wars today, every Disney product carries the same emotional promise — Magic, Wonder, and Imagination.",
            body2:"The brand has survived leadership changes, financial crises, the death of its founder, and a complete technological revolution. It did this by protecting its emotional core with ruthless consistency. The logo, the music, the storytelling structure, the feeling of walking through the gates — all of it reinforces one message: you are entering somewhere extraordinary.",
            body3:"Disney spent 100 years becoming associated with one word: Magic. Not entertainment. Not movies. Magic. The most powerful brands are known for one thing. The strongest personal brands work the same way.",
            whyItWorks:"Brand strength comes from consistency over time. Disney didn't reinvent itself every few years — it protected one emotional promise across a century of change. People trust what they see repeatedly, and connection deepens with every consistent interaction.",
            technique:"Identify the one word you want people to associate with you. Then audit every professional interaction — meetings, emails, presentations, conversations — and ask: \"Does this reinforce that word?\" Consistency is not boring. It's how trust is built.",
            lesson:"Disney didn't build a brand. They built a feeling — and then protected it for 100 years. Your personal brand is built the same way: one consistent interaction at a time.",
          },
        ];
        const openReading = (id) => {
          if (!d11ExObserved[id]) {
            const next = {...d11ExObserved, [id]:true};
            setD11ExObserved(next);
            try { localStorage.setItem('d11ExObserved', JSON.stringify(next)); } catch {}
          }
          setD11ExOpenCard(id);
        };
        const reading = D11_EDITORIAL.find(c => c.id === d11ExOpenCard);
        if (reading) return (
          <div key={"d11read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD11ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Iconic Brands. Intentional Choices.</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>A personal brand built by design — not by accident.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D11_EDITORIAL.map(card=>{
                const obs = d11ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:T2.surface,display:"flex",flexDirection:"column"}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:12,right:12,padding:"4px 10px",borderRadius:20,background:obs?"rgba(97,145,100,0.9)":"rgba(30,26,20,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:9,color:obs?"#fff":"rgba(245,239,230,0.75)",fontFamily:T.sans,fontWeight:500,letterSpacing:"0.5px"}}>{obs?"✓ Observed":"◉ Observed"}</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:6}}>{card.superpower}</div>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.2,margin:"0 0 8px"}}>{card.name}</h3>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                        <div>
                          <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>✦ SUPERPOWER</div>
                          <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300,maxWidth:160}}>{card.superpowerText}</div>
                        </div>
                        <span data-arrow style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:400,whiteSpace:"nowrap",transition:"transform 0.2s ease"}}>{card.exploreLabel} →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      return <RightContent/>;
    };

    const D12RightContent = () => {
      const [d12CardOpen, setD12CardOpen] = useState(null);
      const [d12ExObserved, setD12ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d12ExObserved')||'{}'); } catch { return {}; } });
      const [d12ExOpenCard, setD12ExOpenCard] = useState(null);

      if (step === "Insight") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Why Presence Matters</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>People don't just hear confidence. They see it.</h2>
          <p style={{ fontFamily:T.sans, fontSize:16, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:600 }}>Body language shapes how communication feels — helping people feel more connected, engaged, and at ease.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {D12_FACTS.map((n,i)=>{
              const open=d12CardOpen===i;
              return (
                <div key={i} onClick={()=>setD12CardOpen(open?null:i)}
                  style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                    <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                  {open && (<div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                    {n.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/><p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p></div>))}
                  </div>)}
                </div>
              );
            })}
          </div>
          <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:T.gold, lineHeight:1.6 }}>"Presence is how communication feels."</p>
        </div>
      );

      if (step === "Theory") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>The Science</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Nonverbal Congruence</h2>
          <p style={{ fontFamily:T.sans, fontSize:16, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:20, maxWidth:640 }}>The brain constantly compares words with body language. When verbal and nonverbal signals align, communication feels more authentic and emotionally clear.</p>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, borderLeft:"2px solid "+T.gold, marginBottom:28 }}>
            <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:T2.text, lineHeight:1.65, margin:0 }}>"When communication feels safe, the brain becomes more open to the message."</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
            {[
              {title:"Thin Slicing",      body:"Psychology research shows the brain forms rapid impressions from nonverbal cues before language is fully processed."},
              {title:"Visual Processing", body:"The brain processes visual signals faster than spoken words."},
              {title:"Gesture & Memory",  body:"Studies show purposeful gestures improve listener comprehension and information retention."},
              {title:"Trust & Congruence",body:"Communication feels more believable when verbal and nonverbal communication align consistently."},
            ].map((c,i)=>(
              <div key={i} style={{padding:"20px 22px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>{c.title}</div>
                <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.65,fontWeight:300,margin:0}}>{c.body}</p>
              </div>
            ))}
          </div>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, marginBottom:20 }}>
            <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Research Suggests</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {["Listeners retain more information when gestures reinforce meaning","Open body language increases emotional connection","Calm physical presence improves engagement","Visual signals strongly influence emotional interpretation"].map((pt,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:300,margin:0}}>{pt}</p>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:T.gold, lineHeight:1.6 }}>"The body helps people understand the message."</p>
        </div>
      );

      if (step === "Example") {
        const D12_EDITORIAL = [
          { id:"obama", img:"/d12-obama.png?v=2", imgPos:"center 50%", name:"Michelle Obama", superpower:"Master of Warm Presence",
            superpowerText:"Making every room feel smaller.",
            summary:"Whether speaking to thousands or having a one-to-one conversation, her body language projects warmth, confidence, and authenticity — before she says a word.",
            quote:"\"Presence isn't about commanding attention — it's about creating connection.\"",
            exploreLabel:"Explore her techniques",
            body1:"Michelle Obama has a way of making every room feel smaller. Whether speaking to thousands of people or having a one-to-one conversation, her body language projects warmth, confidence, and authenticity.",
            body2:"Her open posture, genuine smile, and natural gestures make people feel at ease before she even says a word. She reminds us that presence isn't about commanding attention — it's about creating connection.",
            body3:"People decide how they feel about you long before they've analysed your words. Open body language, steady eye contact, and relaxed movement signal confidence, trust, and approachability. When your non-verbal signals match your message, people are far more likely to believe and remember you.",
            whyItWorks:"People decide how they feel about you long before they've analysed your words. Open body language, steady eye contact, and relaxed movement signal confidence, trust, and approachability. When your non-verbal signals match your message, people are far more likely to believe and remember you.",
            technique:"Before your next conversation or presentation, check your posture before your script. Stand tall, relax your shoulders, keep your hands open, and make eye contact before you begin speaking. Let your body communicate confidence before your voice does.",
            lesson:"Your body is always communicating — even when you're silent. Great communicators understand that influence isn't just about what you say; it's about how you make people feel the moment you walk into the room. When your words and body language are aligned, your presence becomes your greatest strength.",
          },
          { id:"jobs", img:"/d12-jobs.png?v=2", imgPos:"center 40%", name:"Steve Jobs", superpower:"Master of Purposeful Presence",
            superpowerText:"When every movement has purpose, every message carries more weight.",
            summary:"On stage, he used purposeful movement, comfortable pauses, and simple gestures to keep the audience focused on the message — not the speaker.",
            quote:"\"Confident body language creates clarity. Calm presence made complex ideas feel simple and memorable.\"",
            exploreLabel:"Explore his techniques",
            body1:"Steve Jobs understood that powerful presentations aren't just about great ideas — they're about how those ideas are delivered. On stage, he used purposeful movement, comfortable pauses, and simple gestures to keep the audience focused on the message rather than the speaker.",
            body2:"He proved that confidence doesn't need to be loud to be influential. His philosophy was simple: when every movement has purpose, every message carries more weight.",
            body3:"The next time you're presenting, resist the urge to fill every silence or pace constantly. Stand still to emphasise an important point, use deliberate gestures rather than constant movement, and allow pauses to give your audience time to think.",
            whyItWorks:"Confident body language creates clarity. By eliminating unnecessary movement and using pauses deliberately, Jobs directed the audience's attention exactly where he wanted it. His calm presence made complex ideas feel simple and memorable.",
            technique:"The next time you're presenting, resist the urge to fill every silence or pace constantly. Stand still to emphasise an important point, use deliberate gestures rather than constant movement, and allow pauses to give your audience time to think.",
            lesson:"Your presence is shaped as much by what you don't do as what you do. Purposeful movement, calm posture, and intentional pauses communicate confidence before you've even finished your first sentence. Sometimes the most powerful body language is knowing when to stand still.",
          },
        ];
        const openReading = (id) => {
          if (!d12ExObserved[id]) {
            const next = {...d12ExObserved, [id]:true};
            setD12ExObserved(next);
            try { localStorage.setItem('d12ExObserved', JSON.stringify(next)); } catch {}
          }
          setD12ExOpenCard(id);
        };
        const reading = D12_EDITORIAL.find(c => c.id === d12ExOpenCard);
        if (reading) return (
          <div key={"d12read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD12ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Presence in Action</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Two communicators who prove that how you carry yourself speaks louder than words.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D12_EDITORIAL.map(card=>{
                const obs = d12ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:T2.surface,display:"flex",flexDirection:"column"}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:12,right:12,padding:"4px 10px",borderRadius:20,background:obs?"rgba(97,145,100,0.9)":"rgba(30,26,20,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:9,color:obs?"#fff":"rgba(245,239,230,0.75)",fontFamily:T.sans,fontWeight:500,letterSpacing:"0.5px"}}>{obs?"✓ Observed":"◉ Observed"}</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:6}}>{card.superpower}</div>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.2,margin:"0 0 8px"}}>{card.name}</h3>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                        <div>
                          <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>✦ SUPERPOWER</div>
                          <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300,maxWidth:160}}>{card.superpowerText}</div>
                        </div>
                        <span data-arrow style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:400,whiteSpace:"nowrap",transition:"transform 0.2s ease"}}>{card.exploreLabel} →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (step === "Rehearsal") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>The Presence Challenge</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Build Grounded Physical Confidence</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:600 }}>Seven rounds. Gestures, posture, eye contact, movement, expression, and grounded presence.</p>
          <D12PracticeWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Simulation") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Presence is Visible</h2>
          <p style={{ fontFamily:T.sans, fontSize:18, color:"#A8998A", lineHeight:1.6, fontWeight:400, marginBottom:32, maxWidth:640 }}>Record yourself. Review your presence. Receive personalised coaching on how you communicate physically.</p>
          <D12SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step === "Review") return (
        <div key={idx} className="au-step-enter" style={{ padding:"44px 52px", overflowY:"auto" }}>
          <div style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Review & Reflect</div>
          <h2 style={{ fontFamily:T.serif, fontSize:40, fontWeight:600, color:T2.text, lineHeight:1.1, marginBottom:16 }}>Strong Communication Is Experienced Physically As Well As Verbally</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:28 }}>
            {[
              {title:"Presence Shapes Perception",   body:"Body language influences how communication feels before words are fully processed."},
              {title:"Gestures Improve Understanding",body:"Visual communication helps people process and remember ideas."},
              {title:"Calm Presence Creates Clarity", body:"Grounded movement helps communication feel calm, intentional, and engaging."},
              {title:"Congruence Builds Connection",  body:"Aligned words, tone, and body language help communication feel more emotionally clear and authentic."},
            ].map((c,i)=>(
              <div key={i} style={{padding:"20px 24px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>{c.title}</div>
                <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.65,fontWeight:300,margin:0}}>{c.body}</p>
              </div>
            ))}
          </div>
          <div style={{ padding:"20px 24px", background:T2.surface, borderRadius:4, border:"0.5px solid "+T2.border, marginBottom:20 }}>
            <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>Suggested Exploration</div>
            <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, lineHeight:1.65, fontWeight:300, marginBottom:12 }}>Watch: Keanu Reeves interviews · Kate Winslet interviews · Vinh Giang communication clips</p>
            <p style={{ fontFamily:T.sans, fontSize:14, color:T2.text3, lineHeight:1.65, fontWeight:300, margin:0 }}>Observe: gestures · pauses · posture · facial expression · grounded energy · emotional congruence</p>
          </div>
          <p style={{ fontFamily:T.serif, fontSize:18, fontStyle:"italic", color:T.gold, lineHeight:1.6 }}>"Great communicators don't just speak clearly. They communicate presence."</p>
        </div>
      );

      return <RightContent/>;
    };

    const D13RightContent = () => {
      const [d13CardOpen, setD13CardOpen] = useState(null);
      const [d13ExOpen, setD13ExOpen] = useState(null);
      const [d13ExObserved, setD13ExObserved] = useState(() => { try { return JSON.parse(localStorage.getItem('d13ExObserved')||'{}'); } catch { return {}; } });
      const [d13ExOpenCard, setD13ExOpenCard] = useState(null);

      if (step==="Insight") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>The Career Multiplier</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Communication creates capability. Exposure creates opportunity.</h2>
          <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:28,maxWidth:600}}>The most talented professionals in every field are not always the most successful. The ones who advance are the ones whose value is seen.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:28}}>
            {D13_INSIGHT_CARDS.map((n,i)=>{
              const open=d13CardOpen===i;
              return (
                <div key={i} onClick={()=>setD13CardOpen(open?null:i)} style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"border-color 0.2s,box-shadow 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                    <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                  {open && <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                    {n.bullets.map((b,j)=><div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/><p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p></div>)}
                  </div>}
                </div>
              );
            })}
          </div>
          <div style={{padding:"20px 24px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:T.gold,lineHeight:1.65,margin:0}}>"Performance creates value. Brand creates reputation. Exposure creates opportunity."</p>
          </div>
        </div>
      );

      if (step==="Theory") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>The Science of Exposure</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Why visibility shapes careers</h2>
          <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:28,maxWidth:600}}>Four evidence-based principles that explain how exposure drives advancement.</p>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
            {D13_THEORY_CARDS.map((n,i)=>{
              const open=d13CardOpen===("t"+i);
              return (
                <div key={i} onClick={()=>setD13CardOpen(open?null:("t"+i))} style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"all 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.12)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                    <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                  {open && <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                    {n.bullets.map((b,j)=><div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/><p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p></div>)}
                  </div>}
                </div>
              );
            })}
          </div>
          <div style={{padding:"20px 24px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:T.gold,lineHeight:1.65,margin:0}}>"Performance creates value. Brand creates reputation. Exposure creates opportunity."</p>
          </div>
        </div>
      );

      if (step==="Example") {
        const D13_EDITORIAL = [
          { id:"dench", img:"/d13-dench.png?v=2", imgPos:"center 30%", name:"Dame Judi Dench", superpower:"Master of Reputation",
            superpowerText:"Her reputation became her greatest introduction.",
            summary:"Dame Judi Dench has spent more than six decades building one of the most respected reputations in theatre and film — and opportunities have followed her ever since.",
            quote:"\"The most valuable opportunities rarely come from applying online — they come through people who know your work and trust your character.\"",
            exploreLabel:"Explore her approach",
            body1:"Dame Judi Dench has spent more than six decades building one of the most respected reputations in theatre and film. Directors, writers, and fellow actors consistently describe her as generous, prepared, and a joy to work with.",
            body2:"Opportunities haven't followed her simply because of her talent — they've followed her because people trust her and want to work with her again. Her reputation became her greatest introduction.",
            body3:"Exposure isn't just about being seen — it's about being remembered for the right reasons. Every interaction shapes your professional reputation. When people associate your name with excellence, kindness, and reliability, they become your advocates, recommending you long after the conversation has ended.",
            whyItWorks:"Exposure isn't just about being seen — it's about being remembered for the right reasons. Every interaction shapes your professional reputation. When people associate your name with excellence, kindness, and reliability, they become your advocates, recommending you long after the conversation has ended.",
            technique:"Treat every meeting, project, and conversation as an audition for your reputation. Deliver great work, be generous with your time, and leave people feeling respected. Ask yourself: \"If my name came up in a room I wasn't in, what would people say?\"",
            lesson:"The most valuable opportunities rarely come from applying online — they come through people who know your work and trust your character. Build a reputation that people are proud to recommend, because the strongest professional brand is the one that continues speaking for you when you're not in the room.",
          },
          { id:"diana", img:"/d13-diana.png?v=2", imgPos:"center center", name:"Jamie Oliver", superpower:"Master of Approachable Authority",
            superpowerText:"People don't trust you because you sound clever. They trust you because they understand you.",
            summary:"He built one of the world's most recognisable personal brands without trying to sound like the smartest person in the room.",
            quote:"\"People don't trust you because you sound clever. They trust you because they understand you.\"",
            exploreLabel:"Explore his approach",
            body1:"Jamie Oliver built one of the world's most recognisable personal brands without trying to sound like the smartest person in the room. He talked about food the way you'd talk to a friend — no jargon, no complicated language, just genuine enthusiasm and practical advice.",
            body2:"Open about living with dyslexia and struggling at school, Jamie never hid behind technical language to sound credible. Instead, he built trust by making complex ideas simple. That same clear communication helped turn his campaign for healthier school meals into real government policy.",
            body3:"Visibility isn't about sounding impressive. It's about communicating in a way that people remember, trust, and want to share. People connect with communicators who make them feel capable, not intimidated.",
            whyItWorks:"Simple language builds trust, and trust creates opportunities. When people understand your message, they're far more likely to remember it — and recommend you. Don't borrow complicated words to sound more credible. Explain ideas the way you'd naturally explain them to a colleague over coffee.",
            technique:"Before your next meeting or presentation, ask yourself: \"Am I trying to impress people, or help them understand?\" Strip out jargon. Use the words you'd use with a friend. The clearer your language, the stronger your authority.",
            lesson:"Authority doesn't come from using bigger words — it comes from making ideas easier to understand. The communicators people remember are the ones who make complex things feel simple. When people understand you, they trust you. When they trust you, they recommend you.",
          },
        ];
        const openReading = (id) => {
          if (!d13ExObserved[id]) {
            const next = {...d13ExObserved, [id]:true};
            setD13ExObserved(next);
            try { localStorage.setItem('d13ExObserved', JSON.stringify(next)); } catch {}
          }
          setD13ExOpenCard(id);
        };
        const reading = D13_EDITORIAL.find(c => c.id === d13ExOpenCard);
        if (reading) return (
          <div key={"d13read"+reading.id} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto",maxWidth:680}}>
            <button onClick={()=>setD13ExOpenCard(null)} style={{fontFamily:T.sans,fontSize:13,color:T2.text3,background:"transparent",border:"none",cursor:"pointer",padding:"0 0 28px",display:"flex",alignItems:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Gallery
            </button>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{reading.superpower}</div>
            <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:400,color:T2.text,lineHeight:1.1,marginBottom:28}}>{reading.name}</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body1}</p>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 14px"}}>{reading.body2}</p>
            <div style={{padding:"22px 28px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 14px"}}>
              <p style={{fontFamily:T.serif,fontSize:19,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{reading.quote}</p>
            </div>
            <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.8,fontWeight:300,margin:"0 0 32px"}}>{reading.body3}</p>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:28,marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.whyItWorks}</p>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Make It Yours</div>
              <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.75,fontWeight:300,margin:0}}>{reading.technique}</p>
            </div>
            <div style={{padding:"22px 28px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>AmplifyU Lesson</div>
              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{reading.lesson}</p>
            </div>
          </div>
        );
        return (
          <div key={idx} className="au-step-enter" style={{padding:"32px 52px",overflowY:"auto"}}>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:36,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Exposure in Action</h2>
            <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:24}}>Reputations that open doors — built through trust, not just talent.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {D13_EDITORIAL.map(card=>{
                const obs = d13ExObserved[card.id];
                return (
                  <div key={card.id} onClick={()=>openReading(card.id)}
                    style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,cursor:"pointer",transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",background:T2.surface,display:"flex",flexDirection:"column"}}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow="0 12px 40px rgba(44,36,22,0.15)";
                      e.currentTarget.style.borderColor="rgba(200,164,106,0.4)";
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="scale(1.02)";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="translateX(4px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="";
                      e.currentTarget.style.boxShadow="";
                      e.currentTarget.style.borderColor=T2.border;
                      const img=e.currentTarget.querySelector("img");if(img)img.style.transform="";
                      const arr=e.currentTarget.querySelector("[data-arrow]");if(arr)arr.style.transform="";
                    }}>
                    <div style={{height:240,overflow:"hidden",position:"relative"}}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",display:"block",transition:"transform 0.35s ease"}}/>
                      <div style={{position:"absolute",top:12,right:12,padding:"4px 10px",borderRadius:20,background:obs?"rgba(97,145,100,0.9)":"rgba(30,26,20,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:9,color:obs?"#fff":"rgba(245,239,230,0.75)",fontFamily:T.sans,fontWeight:500,letterSpacing:"0.5px"}}>{obs?"✓ Observed":"◉ Observed"}</span>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:6}}>{card.superpower}</div>
                      <h3 style={{fontFamily:T.serif,fontSize:24,fontWeight:400,color:T2.text,lineHeight:1.2,margin:"0 0 8px"}}>{card.name}</h3>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 14px",flex:1}}>{card.summary}</p>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                        <div>
                          <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:3}}>✦ SUPERPOWER</div>
                          <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300,maxWidth:160}}>{card.superpowerText}</div>
                        </div>
                        <span data-arrow style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:400,whiteSpace:"nowrap",transition:"transform 0.2s ease"}}>{card.exploreLabel} →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (step==="Rehearsal") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:28}}>Make Your Value Visible</h2>
          <D13PracticeWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step==="Simulation") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12}}>The Promotion Room</h2>
          <p style={{fontFamily:T.sans,fontSize:17,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:32,maxWidth:600}}>You're not in the room. Find out what's being said — and build your strategy to change it.</p>
          <D13SimWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      return <RightContent/>;
    };

    const D14RightContent = () => {
      const [d14CardOpen, setD14CardOpen] = useState(null);
      const [d14ExOpen, setD14ExOpen] = useState(null);

      if (step==="Insight") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:16}}>Day 14 · The Final Chapter</div>
          <h2 style={{fontFamily:T.serif,fontSize:isDesktop?"clamp(32px,3vw,52px)":40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12}}>Amplified.</h2>
          <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.7,fontWeight:400,marginBottom:8,maxWidth:640}}>Over the last 14 days, you've developed skills that many people spend years trying to master.</p>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.7,fontWeight:400,marginBottom:32,maxWidth:640}}>Clarity. Voice. Storytelling. Presence. Brand. Exposure. These are not isolated techniques. Every story you tell supports your brand. Every conversation shapes your reputation. Every interaction contributes to your performance, image, and ambition.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:28}}>
            {D14_INSIGHT_CARDS.map((n,i)=>{
              const open=d14CardOpen===i;
              return (
                <div key={i} onClick={()=>setD14CardOpen(open?null:i)} style={{padding:"22px 24px",background:T2.surface,borderRadius:4,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,cursor:"pointer",transition:"all 0.2s",boxShadow:open?"0 2px 16px rgba(138,158,132,0.15)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                    <div style={{fontFamily:T.serif,fontSize:19,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.6)",marginLeft:8,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:open?"0 0 12px":0}}>{n.sub}</p>
                  {open && <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                    {n.bullets.map((b,j)=><div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:6}}/><p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p></div>)}
                  </div>}
                </div>
              );
            })}
          </div>
          <div style={{padding:"20px 24px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:18,fontStyle:"italic",color:T.gold,lineHeight:1.65,margin:0}}>"Today is not about learning something new. It's about recognising how far you've come and creating a plan for where you go next."</p>
          </div>
        </div>
      );

      if (step==="Theory") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <div style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>The Science Behind Growth</div>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:20}}>The Competence–Confidence Loop</h2>
          <div style={{padding:"24px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border,marginBottom:20}}>
            <p style={{fontFamily:T.sans,fontSize:16,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>Many people believe confidence comes first. The reality is the opposite.</p>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,flexWrap:"wrap",margin:"20px 0",padding:"0 12px"}}>
              {["Practice","Competence","Confidence","Action","Growth"].map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:0}}>
                  <div style={{padding:"10px 18px",borderRadius:24,background:"rgba(138,158,132,0.12)",border:"0.5px solid rgba(138,158,132,0.35)",fontFamily:T.serif,fontSize:isDesktop?16:14,fontWeight:600,color:T.gold,whiteSpace:"nowrap"}}>{s}</div>
                  {i<4 && <span style={{fontFamily:T.sans,fontSize:14,color:"rgba(138,158,132,0.5)",margin:"0 6px"}}>→</span>}
                </div>
              ))}
            </div>
            <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:16,display:"flex",flexDirection:"column",gap:10}}>
              {[
                ["Clarity","practised organising ideas under pressure"],
                ["Storytelling","practised creating emotional connection"],
                ["Presence","practised influencing perception"],
                ["Brand & Exposure","practised making value visible"],
              ].map(([mod,out],i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.gold,flexShrink:0,paddingTop:2}}>✦</span>
                  <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.6,fontWeight:300,margin:0}}>When you learned <strong>{mod}</strong>, you {out}. Each repetition strengthened capability. Confidence followed.</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {[
              ["Borrowed confidence","It fades. It depends on external validation. It disappears under pressure."],
              ["Earned confidence","It stays. It grows. It works hardest precisely when you need it most."],
            ].map(([title,body],i)=>(
              <div key={i} style={{padding:"20px 22px",background:T2.surface,borderRadius:4,border:`0.5px solid ${i===1?"rgba(138,158,132,0.4)":T2.border}`}}>
                <div style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:i===1?T.gold:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>{title}</div>
                <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:0}}>{body}</p>
              </div>
            ))}
          </div>
          <div style={{padding:"20px 24px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.serif,fontSize:17,fontStyle:"italic",color:T.gold,lineHeight:1.65,margin:"0 0 4px"}}>Competence creates confidence. Confidence creates action. Action creates growth. Growth creates opportunity.</p>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text4,margin:0}}>The confidence you feel today is earned. And because it's earned, it will continue to grow.</p>
          </div>
        </div>
      );

      if (step==="Example") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Great Communicators Are Made, Not Born</h2>
          <p style={{fontFamily:T.sans,fontSize:16,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:28,maxWidth:600}}>None of them started where they finished. The same process is available to you.</p>
          <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:24}}>
            {D14_EXAMPLES.map((card)=>{
              const open=d14ExOpen===card.id;
              return (
                <div key={card.id} style={{background:T2.surface,borderRadius:8,border:`0.5px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,overflow:"hidden",transition:"all 0.2s"}}>
                  <button onClick={()=>setD14ExOpen(open?null:card.id)} style={{width:"100%",padding:"24px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",border:"none",background:"transparent",cursor:"pointer",textAlign:"left"}}>
                    <div>
                      <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,marginBottom:4,lineHeight:1.1}}>{card.name}</h3>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px"}}>{card.headline}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:20}}>
                      <span style={{fontFamily:T.sans,fontSize:13,color:T2.text3,fontWeight:300}}>{open?"Close":"Read more"}</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}><path d="M3 6l5 5 5-5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </button>
                  {open && <div style={{padding:"0 28px 24px",borderTop:"0.5px solid "+T2.border}}>
                    <p style={{fontFamily:T.sans,fontSize:15,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"20px 0 16px"}}>{card.body}</p>
                    <div style={{padding:"14px 18px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                      <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T.gold,lineHeight:1.6,margin:0}}>{card.lesson}</p>
                    </div>
                  </div>}
                </div>
              );
            })}
          </div>
          <div style={{padding:"20px 24px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
            <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.65,margin:"0 0 8px",fontWeight:300}}>They developed their communication over time. Through practice. Through repetition. Through experience.</p>
            <p style={{fontFamily:T.serif,fontSize:17,fontStyle:"italic",color:T.gold,margin:0}}>The same process is available to you.</p>
          </div>
        </div>
      );

      if (step==="Rehearsal") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:20}}>Your Practice</h2>
          <p style={{fontFamily:T.sans,fontSize:18,color:"#A8998A",lineHeight:1.7,fontWeight:400,marginBottom:40,maxWidth:620}}>Have one conversation today where you use everything: PRE structure, a SAR story that passes the 3-Point Test, a confident phrase about your ambition, and deliberate presence.</p>
          <D14PracticeWidget T={T} T2={T2} isDesktop={true}/>
        </div>
      );

      if (step==="Simulation") return (
        <div key={idx} className="au-step-enter" style={{padding:"44px 52px",overflowY:"auto"}}>
          <h2 style={{fontFamily:T.serif,fontSize:40,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12}}>Your Communication Blueprint</h2>
          <p style={{fontFamily:T.sans,fontSize:17,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:32,maxWidth:600}}>Build the personalised communication system you'll use every day from here.</p>
          <D14SimWidget T={T} T2={T2} isDesktop={true}/>
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
        {step === "Rehearsal" && (
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
          <div key={idx} className="au-step-enter" style={{ overflowY: "auto" }}>
            <AICoachTab dayNumber={lesson.day} dayTitle={lesson.title} isDesktop={true} />
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
                      <div style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "2px", color: T.gold, marginBottom: 20, fontFamily: T.sans }}>Day {lesson.day} Complete ✓</div>

                      {/* ── TABS: What You Learned / Workplace Application ── */}
                      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid " + T2.border, marginBottom: 32 }}>
                        {[
                          { id: "learned",   label: "What You Learned" },
                          { id: "workplace", label: "Workplace Application" },
                        ].map(tab => (
                          <button key={tab.id} onClick={() => setReviewTab(tab.id)} style={{
                            padding: "12px 24px", border: "none", background: "transparent",
                            fontFamily: T.sans, fontSize: 14, fontWeight: reviewTab === tab.id ? 600 : 400,
                            color: reviewTab === tab.id ? T2.text : T2.text3, cursor: "pointer",
                            borderBottom: reviewTab === tab.id ? "2px solid " + T.gold : "2px solid transparent",
                            marginBottom: -1, transition: "all 0.15s",
                          }}>{tab.label}</button>
                        ))}
                      </div>

                      {/* Tab: What You Learned */}
                      {reviewTab === "learned" && (
                        <div style={{ marginBottom: 48 }}>
                          {REVIEW_BULLETS[lesson.day - 1].map((b, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14, padding: "16px 20px", background: T2.surface, borderRadius: 6, border: "0.5px solid " + T2.border }}>
                              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(138,158,132,0.12)", border: "1px solid rgba(138,158,132,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-3.5" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                              <span style={{ fontFamily: T.sans, fontSize: 15, color: T2.text, lineHeight: 1.65, fontWeight: 300 }}>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tab: Workplace Application */}
                      {reviewTab === "workplace" && (
                        <div style={{ marginBottom: 48 }}>
                          <p style={{ fontFamily: T.sans, fontSize: 15, color: T2.text3, lineHeight: 1.65, marginBottom: 24, fontWeight: 300 }}>How to put today's techniques to work immediately.</p>
                          {(WORKPLACE_APPLICATION[lesson.day - 1] || []).map((b, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14, padding: "16px 20px", background: T2.surface, borderRadius: 6, border: "0.5px solid " + T2.border }}>
                              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(138,158,132,0.1)", border: "1px solid rgba(138,158,132,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.gold }}>{i + 1}</span>
                              </div>
                              <span style={{ fontFamily: T.sans, fontSize: 15, color: T2.text, lineHeight: 1.65, fontWeight: 300 }}>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Divider before books */}
                      <h2 style={{ fontFamily: T.serif, fontSize: "clamp(28px,2.5vw,36px)", fontWeight: 600, color: T2.text, letterSpacing: "-0.3px", lineHeight: 1.15, marginBottom: 12 }}>Go Deeper</h2>
                      <p style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 300, color: T2.text2, maxWidth: 500, marginBottom: 40, lineHeight: 1.65 }}>You've learned the techniques. These books will make you unstoppable.</p>

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


            {/* LEFT PANEL — Primary stage: visual atmosphere + theory diagram */}
            <div style={{
              width: "40%", flexShrink: 0,
              position: "relative", overflow: "hidden", zIndex: 1,
            }}>
              <div key={idx} className="au-step-enter" style={{ height: "100%" }}>
                <SessionLeftPanel
                  T2={T2} step={step} lesson={lesson} isDone={isDone}
                  isD1={isD1} isD2={isD2} isD3={isD3} isD4={isD4} isD5={isD5}
                  isD6={isD6} isD7={isD7} isD9={isD9} isD10={isD10} isD11={isD11} isD12={isD12} isD13={isD13} isD14={isD14} isNT={isNT}
                  selSc={selSc} setSelSc={setSelSc} activeSc={activeSc}
                  scenarios={scenarios} activeRole={activeRole}
                />
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
              background: step === "Rehearsal" ? "rgba(247,243,236,0.92)" : T2.bg,
              overflowY: "auto", position: "relative", zIndex: 1,
              borderLeft: "1px solid " + T2.divider,
            }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                {isD1 && step === "Rehearsal"
                  ? <D1WarmUpWidget key="d1-warmup" T={T} T2={T2} isDesktop={true}
                      onNavLabel={setD1NavLabel}
                      onNavFn={d1NavFnRef}
                      onComplete={(topic) => { setD1WarmUpTopic(topic); setIdx(i => i + 1); }}
                    />
                  : isD1 ? <D1RightContent/> : isD2 ? <D2RightContent/> : isD3 ? <D3RightContent/> : isD4 ? <D4RightContent/> : isD5 ? <D5RightContent/> : isD6 ? <D6RightContent/> : isD7 ? <D7RightContent/> : isD11 ? <D11RightContent/> : isD12 ? <D12RightContent/> : isD13 ? <D13RightContent/> : isD14 ? <D14RightContent/> : isD10 ? <D10RightContent/> : isNT ? <NTRightContent/> : isD9 ? <D9RightContent/> : <RightContent/>}
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
              <button
                onClick={() => {
                  if (isD1 && step === "Rehearsal" && d1NavFnRef.current) {
                    d1NavFnRef.current();
                  } else {
                    setIdx(i => i + 1);
                  }
                }}
                disabled={isD1 && step === "Rehearsal" && d1NavLabel === null}
                className="au-cta"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 24px", borderRadius: 5,
                  background: isD1 && step === "Rehearsal" && d1NavLabel === null ? "rgba(138,158,132,0.3)" : T.gold,
                  border: "none",
                  color: "white", fontSize: 13, fontWeight: 600,
                  cursor: isD1 && step === "Rehearsal" && d1NavLabel === null ? "not-allowed" : "pointer",
                  fontFamily: T.sans, letterSpacing: "0.1px",
                  boxShadow: "0 2px 16px rgba(138,158,132,0.3)",
                  opacity: isD1 && step === "Rehearsal" && d1NavLabel === null ? 0.5 : 1,
                }}>
                {isD1 && step === "Rehearsal" && d1NavLabel
                  ? d1NavLabel
                  : idx === 0 ? "Begin" : idx === STEPS.length - 2 ? "Final Chapter" : "Continue"}
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

  return (
    <MobileSessionView
      T2={T2} step={step} STEPS={STEPS} idx={idx} setIdx={setIdx}
      lesson={lesson} isDone={isDone} onComplete={onComplete} onBack={onBack}
      isD1={isD1} isD2={isD2} isD3={isD3} isD4={isD4} isD5={isD5}
      isD6={isD6} isD7={isD7} isD9={isD9} isD10={isD10} isD11={isD11} isD12={isD12} isD13={isD13} isD14={isD14} isNT={isNT}
      selSc={selSc} setSelSc={setSelSc} exitConfirm={exitConfirm} setExitConfirm={setExitConfirm}
      accordionOpen={accordionOpen} setAccordionOpen={setAccordionOpen}
      savedBooks={savedBooks} saveBook={saveBook}
      setNtStory={setNtStory}
      d1MobCard={d1MobCard} setD1MobCard={setD1MobCard}
      d2MobCard={d2MobCard} setD2MobCard={setD2MobCard}
      d3MobCard={d3MobCard} setD3MobCard={setD3MobCard}
      d4MobCard={d4MobCard} setD4MobCard={setD4MobCard}
      d5MobCard={d5MobCard} setD5MobCard={setD5MobCard}
      d6MobCard={d6MobCard} setD6MobCard={setD6MobCard}
      d7MobCard={d7MobCard} setD7MobCard={setD7MobCard}
      d10MobCard={d10MobCard} setD10MobCard={setD10MobCard}
      d11MobCard={d11MobCard} setD11MobCard={setD11MobCard}
      d11FormulaCard={d11FormulaCard} setD11FormulaCard={setD11FormulaCard}
      d11BrandWords={d11BrandWords} setD11BrandWords={setD11BrandWords}
      d12MobCard={d12MobCard} setD12MobCard={setD12MobCard}
      ntMobCard={ntMobCard} setNtMobCard={setNtMobCard}
      activeSc={activeSc} scenarios={scenarios}
      ambitionDraft={ambitionDraft} saveAmbition={saveAmbition} ambitionSaved={ambitionSaved}
      roleId={roleId} activeRole={activeRole} swipeRef={swipeRef}
      note={note} saveNote={saveNote} checks={checks} setChecks={setChecks}
      ntOpenCard={ntOpenCard} setNtOpenCard={setNtOpenCard}
      ntStory={ntStory}
    />
  );
}

// ─── HOME SCREEN 
