import { useState, useRef, useEffect } from 'react';
import { T } from '../theme.js';
import { D10_FACTS, D3_FACTS, D3_PAUSE_REASONS, D4_FACTS, D1_CLARITY_FACTS_DATA, D11_FACTS, D11_EXAMPLES, D11_INGREDIENTS, D2_INSIGHT_CARDS, D9_INSIGHT_CARDS, D9_COMM_STYLES, D9_EXAMPLES, NT_PIXAR, NT_NEURO, REVIEW_CLOSING, REVIEW_BULLETS, WORKPLACE_APPLICATION, FURTHER_READING, SESSION_STEPS, NAV_LABELS, LESSONS, D7_INSIGHT_CARDS, D12_FACTS, D12_EXAMPLES, D13_INSIGHT_CARDS, D13_THEORY_CARDS, D13_EXAMPLES, D14_INSIGHT_CARDS, D14_EXAMPLES } from '../data.js';
import { getScenariosForDay } from '../utils.js';
import { D9PracticeWidget, D9SimWidget } from '../modules/Day9.jsx';
import { StoryBuilderWidget, StoryArchitectWidget, D8PracticeWidget } from '../modules/Day8.jsx';
import { CoachWidget } from '../modules/CoachWidget.jsx';
import { D10SimFeedback, D10MobileSAR, D10MobileSim } from '../modules/Day10.jsx';
import { D3SimFeedback, D3MobileSim, D3PracticeWidget, D3SimWidget } from '../modules/Day3.jsx';
import { D4SimFeedback, D4MobileSplit, D4MobileSim, D4PracticeWidget, D4SimWidget } from '../modules/Day4.jsx';
import { D1MobileJargonSwap, D1MobileSim, D1WarmUpWidget, D1SimWidget, D1SimFeedback } from '../modules/Day1.jsx';
import { D2PracticeWidget, D2SimWidget } from '../modules/Day2.jsx';
import { D5PracticeWidget, D5SimWidget } from '../modules/Day5.jsx';
import { D6PracticeWidget, D6SimWidget } from '../modules/Day6.jsx';
import { D11PracticeWidget, D11SimWidget } from '../modules/Day11.jsx';
import { D12PracticeWidget, D12SimWidget } from '../modules/Day12.jsx';
import { D13PracticeWidget, D13SimWidget } from '../modules/Day13.jsx';
import { D14PracticeWidget, D14SimWidget } from '../modules/Day14.jsx';
import { D7SimWidget, D7PracticeWidget } from '../modules/Day7.jsx';
import AICoachTab from '../components/AICoachTab.jsx';
import { DIAGRAMS, MODULE_ICONS } from '../diagrams.jsx';
import { Scene, OBScene } from '../scenes.jsx';
import { Timer } from '../components/Timer.jsx';
import { PBar } from '../components/NavComponents.jsx';
import { EditorialTheoryCard, TheoryCard } from './TheoryCards.jsx';

function TabHeroPane({ label, headline, liveIndicator = false }) {
  return (
    <div style={{width:"100%",height:320,background:"#0E0B08",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 12px",boxSizing:"border-box"}}>
      <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>{label}</div>
      {liveIndicator ? (
        <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#CC4444",flexShrink:0,marginTop:6,animation:"glowPulse 1s ease infinite",boxShadow:"0 0 8px rgba(204,68,68,0.55)"}}/>
          <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,margin:0}}>{headline}</p>
        </div>
      ) : (
        <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:10}}>{headline}</p>
      )}
      <div style={{width:40,height:1,background:"rgba(245,239,230,0.35)"}}/>
    </div>
  );
}

export function MobileSessionView({
  T2, step, STEPS, idx, setIdx, lesson, isDone, onComplete, onBack,
  isD1, isD2, isD3, isD4, isD5, isD6, isD7, isD9, isD10, isD11, isD12, isD13, isD14, isNT,
  selSc, setSelSc, exitConfirm, setExitConfirm,
  accordionOpen, setAccordionOpen, savedBooks, saveBook,
  setNtStory,
  d1MobCard, setD1MobCard, d2MobCard, setD2MobCard,
  d3MobCard, setD3MobCard, d4MobCard, setD4MobCard,
  d5MobCard, setD5MobCard, d6MobCard, setD6MobCard,
  d7MobCard, setD7MobCard, d10MobCard, setD10MobCard, d11MobCard, setD11MobCard, d11FormulaCard, setD11FormulaCard, d11BrandWords, setD11BrandWords, d12MobCard, setD12MobCard, ntMobCard, setNtMobCard,
  activeSc, scenarios, ambitionDraft, saveAmbition, ambitionSaved,
  roleId, activeRole, swipeRef, note, saveNote, checks, setChecks,
  ntOpenCard, setNtOpenCard, ntStory,
}) {
  const [d9OpenCard, setD9OpenCard] = useState(null);
  const [pixarOpen, setPixarOpen] = useState(false);
  const [d1NavLabel, setD1NavLabel] = useState(null);
  const d1NavFnRef = useRef(null);
  const [d1WarmUpTopic, setD1WarmUpTopic] = useState(null);
  const [d3NavLabel, setD3NavLabel] = useState(null);
  const d3NavFnRef = useRef(null);
  const [d4NavLabel, setD4NavLabel] = useState(null);
  const d4NavFnRef = useRef(null);
  const [reviewTab, setReviewTab] = useState('learned');
  const [d10PracticePhase, setD10PracticePhase] = useState('intro');
  const [d10SarDone, setD10SarDone] = useState(false);
  const [swipeHint, setSwipeHint] = useState(() => { try { return !localStorage.getItem('au_swipe_hint_seen'); } catch { return true; } });
  const [swipeHintVisible, setSwipeHintVisible] = useState(true);
  useEffect(() => {
    if (!swipeHint) return;
    const t = setTimeout(() => { setSwipeHintVisible(false); setTimeout(() => { setSwipeHint(false); try { localStorage.setItem('au_swipe_hint_seen','1'); } catch {} }, 400); }, 3000);
    return () => clearTimeout(t);
  }, [swipeHint]);

  const D10_EXAMPLES_DATA = [
  { id:"priya",     title:"The Invisible Fixer",        sub:"Same performance. No visibility.",  lesson:"Performance without communication is philanthropy." },
  { id:"alex",      title:"The Strategic Communicator", sub:"Same work. Different career.",      lesson:"Visibility is a skill. It takes 45 seconds." },
  { id:"executive", title:"The Executive Pattern",      sub:"How senior leaders think.",         lesson:"Narrate progress. Name impact. Make value legible." },
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
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:16}}>Not hesitant.<br/>Deliberate.</h2>
          <p style={{fontFamily:T.serif,fontSize:15,color:T2.text,lineHeight:1.75,marginBottom:16}}>Obama didn't pause because he couldn't find the words. He paused because silence makes the audience lean in. Here are three of his most important moments.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {[
              {label:"2008 Election Night — Grant Park",quote:'"If there is anyone out there who still doubts… [4-second pause] …tonight is your answer."',note:"Each pause let the crowd absorb the weight of the moment before he added to it."},
              {label:"2015 Charleston Eulogy",quote:'"Clementa Pinckney found that grace… [long pause, bowed head] …Cynthia Hurd found that grace."',note:"Before breaking into 'Amazing Grace', he paused for nearly 10 seconds. The room went silent."},
              {label:"2009 Inauguration",quote:'"I do solemnly swear… [pause] …that I will faithfully execute… [pause] …the office of President."',note:"Deliberate pauses gave each phrase its own gravity — watched by billions worldwide."},
            ].map((ex,i)=>(
              <div key={i} style={{padding:"14px 16px",background:T2.surface,borderRadius:6,border:"0.5px solid "+T2.border}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>{ex.label}</div>
                <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.55,marginBottom:8}}>{ex.quote}</p>
                <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,margin:0}}>{ex.note}</p>
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Why It Works</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>A pause signals that what just came before — or what is about to come next — deserves special attention. The speaker controls the room through silence, not sound.</p>
            </div>
            <div style={{padding:"14px 18px",background:T2.surface,borderRadius:4,border:"0.5px solid "+T2.border}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.goldDark,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>The Technique</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0}}>After your most important point, stop talking. Count to two in your head. The audience will fill the silence with meaning — and remember it far longer.</p>
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

return (
  <>
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
     {/* Top nav bar — matches home screen header */}
    <div style={{background:"#0F0D0A",height:64,borderBottom:"0.5px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <img src="/logo-mark.png" alt="AmplifyU" style={{width:30,height:30,objectFit:"cover",mixBlendMode:"screen",filter:"brightness(3) contrast(1.2)"}}/>
        <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:600,letterSpacing:"3px",textTransform:"uppercase",color:"rgba(255,255,255,0.88)"}}>AmplifyU</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" stroke="#c9a96e" strokeWidth="2"/>
          <path d="M2.5 7.5h15" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 2v3M13 2v3" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="6.5" cy="11" r="1" fill="#c9a96e"/>
          <circle cx="10" cy="11" r="1" fill="#c9a96e"/>
          <circle cx="13.5" cy="11" r="1" fill="#c9a96e"/>
          <circle cx="6.5" cy="14" r="1" fill="#c9a96e"/>
          <circle cx="10" cy="14" r="1" fill="#c9a96e"/>
          <circle cx="13.5" cy="14" r="1" fill="#c9a96e"/>
        </svg>
        <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:600,color:"#c9a96e",letterSpacing:"0.3px"}}>Day {lesson.day}</span>
      </div>
    </div>
     {/* Header image + Exit button overlay */}
    <div style={{position:"relative",height:step==="Theory 2"?260:320,overflow:"hidden",background:step==="Rehearsal"?"#141210":step==="Example"||step==="Simulation"?"#0E0B08":"transparent"}}>
      {(()=>{
        // ── Simulation panes ───────────────────────────────────────────────
        if(isD4 && step==="Simulation") return <TabHeroPane label="Breaking News Live" headline="Report it live. Watch what your audience remembers." liveIndicator />;
        if(isD1 && step==="Simulation") return <TabHeroPane label="Simulation · Day 1" headline="Awareness is where every great communicator begins." />;
        if(isD13 && step==="Simulation") return <TabHeroPane label="The Promotion Room" headline="You're not in the room. Find out what they're saying — and change it." />;
        if(isD14 && step==="Simulation") return <TabHeroPane label="Your Communication Blueprint" headline="Build the system you'll use for the rest of your career." />;
        if(step==="Simulation"){
          const SIM={
            1:{label:"SPEAK CLEARLY — IN ACTION",heading:"Clarity under pressure. This is the real test."},
            2:{label:"REAL-WORLD VOICE COACHING",heading:"This is where voice training becomes real."},
            3:{label:"FILLER-FREE — IN ACTION",heading:"60 seconds. Zero fillers. Real stakes."},
            4:{label:"BREVITY — IN ACTION",heading:"Short sentences. High stakes. Go."},
            5:{label:"PRE — IN ACTION",heading:"Structure your thinking. Speak with precision."},
            6:{label:"AI CONVERSATION PREP",heading:"Prepare for the conversations that matter most."},
            7:{label:"WEEK 1 MASTER CHALLENGE",heading:"Teach It Forward. Prove what you know."},
            8:{label:"NARRATIVE — IN ACTION",heading:"Tell the story. Transport your audience."},
            9:{label:"THE RAPPORT BUILDER",heading:"Four conversations. Four personalities. Build genuine rapport."},
            10:{label:"PERFORMANCE — IN ACTION",heading:"Communicate your impact with conviction."},
            11:{label:"BRAND — IN ACTION",heading:"Your brand is built in every room you enter. Shape it."},
            12:{label:"PRESENCE — IN ACTION",heading:"Every signal you send shapes what people believe."},
          };
          const sh=SIM[lesson.day]||{label:"SIMULATION",heading:"Real scenario. Real pressure. Real coaching."};
          return <TabHeroPane label={sh.label} headline={sh.heading} />;
        }
        // ── Example panes ──────────────────────────────────────────────────
        if(isNT && step==="Example") return (
          <div style={{width:"100%",height:320,background:"#0E0B08",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 12px",boxSizing:"border-box",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 40% 30%, rgba(183,154,107,0.06) 0%, transparent 60%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:2,animation:"fadeUp 0.6s ease both"}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Storytelling in the Wild</div>
              <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:10}}>Stories create empathy. Empathy creates trust. Trust creates influence.</p>
              <div style={{width:40,height:1,background:"rgba(245,239,230,0.35)"}}/>
            </div>
          </div>
        );
        if(isD14 && step==="Example") return <TabHeroPane label="Great Communicators Are Made" headline="None of them started where they finished. The same process is available to you." />;
        if(step==="Example" && !isD13){
          const EX={
            1:{label:"MASTERS OF CLARITY",heading:"The simplest words carry the most weight."},
            2:{label:"VOICE IN ACTION",heading:"Range creates engagement. Contrast creates emotion."},
            3:{label:"MASTERS OF THE PAUSE",heading:"The strongest speakers pause. Confident speakers own the silence."},
            4:{label:"MASTERS OF BREVITY",heading:"Say less. Mean more. Be remembered."},
            5:{label:"PRE IN ACTION",heading:"Point. Reason. Example. The architecture of every great professional answer."},
            6:{label:"MASTERS UNDER PRESSURE",heading:"Composure is a skill. The calmest person in the room shapes the room."},
            7:{label:"COMMUNICATION IN ACTION",heading:"Every skill. One conversation."},
            8:{label:"STORYTELLING IN THE WILD",heading:"Stories create empathy. Empathy creates trust. Trust creates influence."},
            9:{label:"CONNECTION IN ACTION",heading:"The most connected people listen more than they speak."},
            10:{label:"PERFORMANCE IN ACTION",heading:"Visible performance is communicated performance."},
            11:{label:"ICONIC BRANDS. INTENTIONAL CHOICES.",heading:"Brand isn't what you say about yourself. It's what others say when you're not there."},
          };
          const h=EX[lesson.day]||EX[1];
          return <TabHeroPane label={h.label} headline={h.heading} />;
        }
        // ── Image lookup tables ────────────────────────────────────────────
        const STEP_IMGS={
          1:{Insight:"/day1-insight.jpg",Theory:"/feynman-technique.jpg",Example:"/day1-insight.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
          2:{Insight:"/d2-insight.jpg",Theory:"/d2-theory.jpg",Practice:"/d2-practice.jpg",Review:"/review-chair.jpg"},
          3:{Insight:"/day3-insight.jpg",Theory:"/day3-theory.jpg",Review:"/review-chair.jpg"},
          4:{Insight:"/day4-insight.jpg",Theory:"/millers-law.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
          5:{Insight:"/d5-insight.jpg",Theory:"/d5-theory.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
          6:{Insight:"/d6-insight.jpg",Theory:"/d6-theory.jpg",Practice:"/practice-bg.jpg",Review:"/review-chair.jpg"},
          7:{Insight:"/day7-insight.jpg",Theory:"/d7-habit-loop.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
          9:{Insight:"/day9-insight.jpg",Theory:"/day9-theory.jpg",Review:"/review-chair.jpg"},
          10:{Insight:"/day10-insight.jpg",Theory:"/performance-iceberg.jpg",Practice:null,Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
          11:{Insight:"/d11-insight.jpg",Theory:"/d11-theory.jpg",Practice:null,Review:"/review-chair.jpg"},
          13:{Insight:"/day13-insight.jpg",Theory:"/day13-theory.jpg",Example:"/day13-insight.jpg",Review:"/review-chair.jpg"},
          14:{Insight:"/day14-insight.jpg",Theory:"/day14-theory.jpg",Review:"/review-chair.jpg"},
          12:{Insight:"/day12-insight.jpg",Theory:"/day12-theory.jpg",Practice:null,Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
          8:{Insight:"/nt-insight.jpg","Theory 1":"/dual-coding-theory.jpg","Theory 2":"/nt-6beat-framework.jpg",Practice:"/practice-bg.jpg",Simulation:null,Review:"/review-chair.jpg"},
        };
        // ── Rehearsal panes ────────────────────────────────────────────────
        if(isD1 && step==="Rehearsal") return <TabHeroPane label="Voice Warm-Up" headline="Let's warm up your voice." />;
        if(isD2 && step==="Rehearsal") return <TabHeroPane label="Voice Warm-Up · Day 2" headline="The way you sound changes everything. Let's hear your voice." />;
        if(isD3 && step==="Rehearsal") return <TabHeroPane label="The Filler-Free Challenge" headline="Silence often sounds more confident than fillers." />;
        if(isD4 && step==="Rehearsal") return <TabHeroPane label="The Edit" headline="Say it once. Say it short. Stop." />;
        if(isD5 && step==="Rehearsal") return <TabHeroPane label="The PRE Card Sort" headline="Sort the cards. Train the instinct." />;
        if(isD6 && step==="Rehearsal") return <TabHeroPane label="Find Your Words" headline="The right words under pressure don't come from thinking faster. They come from having them ready." />;
        if(isD9 && step==="Rehearsal") return <TabHeroPane label="Build Your Connection Habits" headline="Five exercises. Build the habits of the world's most connected communicators." />;
        if(isD10 && step==="Rehearsal") return <TabHeroPane label="The SAR Challenge" headline="Turn what you do into a story people remember." />;
        if(isD11 && step==="Rehearsal") return <TabHeroPane label="Build Your Brand" headline="Every career has a reputation. The best careers have one by design." />;
        if(isD12 && step==="Rehearsal") return <TabHeroPane label="The Presence Challenge" headline="Seven rounds. Every physical signal that shapes how communication lands." />;
        if(isD13 && step==="Rehearsal") return <TabHeroPane label="Make Your Value Visible" headline="Four exercises. Make your value impossible to ignore." />;
        if(isD14 && step==="Rehearsal") return <TabHeroPane label="Day 14 · Capstone" headline="You are not the communicator you were 14 days ago." />;
        if(isNT && step==="Rehearsal") return <TabHeroPane label="Find Your Story" headline="Every great communicator has a handful of stories they return to throughout their career. Let's build one of yours." />;
        if(isD7 && step==="Rehearsal") return <TabHeroPane label="Teach It Forward" headline="The best test of what you know is whether you can teach it." />;
        const TABLET_IMGS={
          1:{Insight:{src:"/day1-insight.jpg"},Example:{src:"/day1-insight.jpg"}},
          2:{Insight:{src:"/d2-insight-tablet.jpg"},Practice:{src:"/d2-practice-tablet.jpg"}},
          3:{Theory:{src:"/day3-theory-tablet.jpg"}},
          4:{Insight:{src:"/day4-insight-tablet.jpg"},Theory:{src:"/day4-theory-tablet.jpg"}},
          6:{Theory:{src:"/d6-theory-tablet.jpg"}},
          8:{Insight:{src:"/nt-insight-tablet.jpg"},"Theory 1":{src:"/nt-theory1-tablet.jpg"},"Theory 2":{src:"/nt-theory2-tablet.jpg",pos:"center 68%"}},
          10:{Theory:{src:"/performance-iceberg-tablet.jpg"}},
        };
        const src=STEP_IMGS[lesson.day]?.[step];
        const tabletEntry=TABLET_IMGS[lesson.day]?.[step];
        const useContainMob = lesson.day===11 && step==="Theory";
        if(tabletEntry && src) return (
          <picture>
            <source media="(min-width: 768px)" srcSet={tabletEntry.src}/>
            <img src={src} alt="" style={{width:"100%",height:320,objectFit:"cover",objectPosition:tabletEntry.pos||"center",display:"block",pointerEvents:"none"}}/>
          </picture>
        );
        if(src) return <img src={src} alt="" style={{width:"100%",height:step==="Theory 2"?260:320,objectFit:useContainMob?"contain":"cover",objectPosition:(isD7 && step==="Theory")?"center 72%":step==="Rehearsal"?"center 40%":step==="Example"?"center 30%":step==="Theory 2"?"center 55%":"center",display:"block",pointerEvents:"none",background:useContainMob?"#0E0B08":"transparent"}}/>;
        return <Scene name={lesson.scene} height={320} day={lesson.day}/>;
      })()}
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
      {/* Day + title — only on Insight and Review */}
      {(step==="Insight"||step==="Review") && (
        <>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,8,5,0.88) 0%,rgba(10,8,5,0.3) 50%,transparent 80%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:20,left:20,right:20,zIndex:2}}>
            <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.55)",textTransform:"uppercase",letterSpacing:"2px",fontFamily:T.sans,marginBottom:8}}>Day {lesson.day} · {lesson.tag}</div>
            {step==="Insight" ? (
              <>
                <h1 style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:"white",lineHeight:1.2,marginBottom:8}}>{lesson.title}</h1>
                <p style={{fontFamily:T.sans,fontSize:12,fontWeight:400,color:"rgba(255,255,255,0.55)",lineHeight:1.5,margin:0,fontStyle:"italic"}}>{isD1?"Transform complexity into clarity.":lesson.quote}</p>
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
          <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>The uncomfortable truth</div>
          <h2 style={{fontFamily:T.serif,fontSize:32,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:16}}>{lesson.quote}</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Harvey Coleman found Performance accounts for just 10% of career advancement. This module unlocks the other 90%.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {D10_FACTS.map((n,i)=>{
              const open = d10MobCard===("d10i"+i);
              return (
                <div key={i} onClick={()=>setD10MobCard(open?null:"d10i"+i)}
                  style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
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
        </>
      )}
      {isD10 && step==="Theory" && (
        <>
          {/* Label + Title — matches Day 1 style */}
          <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,fontFamily:T.sans}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12}}>The Performance Iceberg</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Most professionals assume their effort speaks for itself. It doesn't.</p>

          {/* Attribution Theory */}
          <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T.gold,lineHeight:1.2,marginBottom:12}}>Attribution Theory — Fritz Heider, 1958</h3>
          <div style={{padding:"18px 20px",background:"rgba(138,158,132,0.08)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.2)",marginBottom:16}}>
            <p style={{fontFamily:T.serif,fontSize:17,fontWeight:600,color:T2.text,lineHeight:1.6,margin:0}}>When people cannot directly observe your work, they attribute results to luck, team effort, or circumstance — not to you. Visibility closes this gap. It replaces assumption with evidence.</p>
          </div>

          {/* Above the waterline */}
          <div style={{padding:"14px 16px",background:T2.surface,borderRadius:6,border:"0.5px solid "+T2.border,marginBottom:8}}>
            <div style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T.gold,marginBottom:12}}>Above the waterline ↑</div>
            {["Outcomes they hear about","Moments you speak up","Visible ownership of results","Strategic contributions you name"].map((b,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:i<3?6:0,alignItems:"flex-start"}}><span style={{color:T.gold,fontSize:11,marginTop:2}}>✦</span><span style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.4}}>{b}</span></div>
            ))}
          </div>

          {/* Below the waterline */}
          <div style={{padding:"14px 16px",background:T2.surface,borderRadius:6,border:"0.5px solid "+T2.border,marginBottom:16}}>
            <div style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T.gold,marginBottom:12}}>Below the waterline ↓</div>
            {["Late nights and early starts","Quiet firefighting","Invisible support work","Emotional labour and relationship management"].map((b,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:i<3?6:0,alignItems:"flex-start"}}><span style={{color:T.gold,fontSize:11,marginTop:2}}>↓</span><span style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.4}}>{b}</span></div>
            ))}
          </div>

          {/* 3 expandable principle cards */}
          {[
            {head:"Excellence is your foundation — not your ceiling.", body:"Performance earns you the right to be in the room. It does not earn you the promotion, the project, or the recognition. Visibility without substance is noise — but substance without visibility is invisibility."},
            {head:"Visibility is a communication skill.", body:"It is NOT bragging, self-promotion, or ego. It IS creating clarity, helping others understand your impact, and making value legible to the people who need to see it. The most effective leaders do this instinctively."},
            {head:"Focus on the vital few.", body:"Not all work is equal. The work that matters is the work visible to the people who shape your future. Spreading yourself across everything and excelling at things nobody notices is a common — and expensive — trap."},
          ].map((p,i)=>{
            const open = d10MobCard===("d10t"+i);
            return (
              <div key={i} onClick={()=>setD10MobCard(open?null:"d10t"+i)}
                style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",marginBottom:i<2?8:0,transition:"border-color 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:0}}>
                  <div style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.3,flex:1}}>{p.head}</div>
                  <span style={{fontFamily:T.sans,fontSize:15,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:8,flexShrink:0}}>{open?"▴":"▸"}</span>
                </div>
                {open && (
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0,fontWeight:300}}>{p.body}</p>
                )}
              </div>
            );
          })}
        </>
      )}
      {isD10 && step==="Example" && (()=>{
        const D10_EDITORIAL = [
          { id:"dyson", img:"/d10-dyson.png", imgPos:"center 45%", name:"James Dyson", superpower:"Master of Relentless Improvement",
            superpowerText:"Every iteration makes the next one better.",
            summary:"He built thousands of prototypes before success. While others saw failure, he saw feedback.",
            quote:"\"I wanted to give up almost every day. But one of the things I did when I wanted to give up was to think, why was I giving up? Fear of failure.\"",
            body1:"James Dyson didn't invent a breakthrough product on his first attempt. He famously built thousands of prototypes, refining, testing, and improving his designs over many years before achieving success. While others saw failure, he saw feedback.",
            body2:"His philosophy is simple: every iteration makes the next one better.",
            body3:"Stop aiming for perfect on the first attempt. Ask yourself: \"What's one thing I can improve before the next version?\" Small improvements, repeated consistently, compound into exceptional performance.",
            whyItWorks:"Exceptional performance isn't the result of one brilliant idea — it's the result of relentless improvement. By treating mistakes as data rather than defeat, Dyson built a culture of experimentation where progress comes from refining the process, not chasing perfection.",
            technique:"Stop aiming for perfect on the first attempt. Whether you're preparing a presentation, writing a proposal, or practising a difficult conversation, ask: \"What's one thing I can improve before the next version?\"",
            lesson:"High performance isn't about talent alone. It's about showing up, testing, learning, and improving — again and again. The people who consistently excel aren't those who avoid failure; they're the ones who use every attempt to get better.",
          },
          { id:"bezos", img:"/d10-bezos.png", imgPos:"center 50%", name:"Jeff Bezos", superpower:"Master of Repeatable Excellence",
            superpowerText:"Consistency beats occasional brilliance.",
            summary:"He built one of the world's largest companies by obsessing over systems — so that great performance happened at scale, not by accident.",
            quote:"\"If you do build a great experience, customers tell each other about that. Word of mouth is very powerful.\"",
            body1:"Jeff Bezos built one of the world's largest companies by obsessing over systems rather than individual moments of brilliance. From warehouses to customer service, every process was designed to deliver the same high standard, every single time.",
            body2:"His focus wasn't just on working harder — it was on building systems that made excellence repeatable. His philosophy is simple: consistency beats occasional brilliance.",
            body3:"Exceptional performance doesn't come from heroic effort every day. It comes from creating reliable processes that produce great results at scale. When your systems are strong, quality becomes predictable rather than accidental.",
            whyItWorks:"Exceptional performance doesn't come from heroic effort every day. It comes from creating reliable processes that produce great results at scale. When your systems are strong, quality becomes predictable rather than accidental.",
            technique:"Don't rely on memory or motivation alone. Create simple checklists, routines, and repeatable processes for your most important work. Ask yourself: \"If I had to do this a hundred times, what system would make it consistently excellent?\"",
            lesson:"Top performers don't leave success to chance. They build habits and systems that make great performance repeatable. Excellence isn't something you occasionally achieve — it's something you design into the way you work.",
          },
        ];
        let d10ExObs = {}; try { d10ExObs = JSON.parse(localStorage.getItem('d10ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Performance in Action</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Two leaders who built exceptional performance through process, not just talent.</p>
            {D10_EDITORIAL.map(card=>{
              const open = d10MobCard===card.id;
              const obs = d10ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,marginBottom:16,background:T2.surface}}>
                  {!open && <div style={{height:240,overflow:"hidden"}} onClick={()=>{ const next={...d10ExObs,[card.id]:true}; try{localStorage.setItem('d10ExObserved',JSON.stringify(next));}catch{} setD10MobCard(card.id); }}><img src={card.img} alt={card.name} style={{width:"100%",height:"auto",display:"block",objectFit:"cover",objectPosition:"center top"}}/></div>}
                  {!open && <div onClick={()=>{ const next={...d10ExObs,[card.id]:true}; try{localStorage.setItem('d10ExObserved',JSON.stringify(next));}catch{} setD10MobCard(card.id); }} style={{padding:"8px 14px",background:obs?"rgba(97,145,100,0.12)":"rgba(30,26,20,0.04)",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:obs?"rgba(97,145,100,1)":"rgba(160,128,90,0.7)",fontFamily:T.sans,fontWeight:500}}>{obs?"✓ Observed":"◉ Observed"}</span>
                  </div>}
                  <div style={{padding:"16px 16px 14px"}} onClick={()=>setD10MobCard(open?null:card.id)}>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:4}}>{card.superpower}</div>
                    <div style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,marginBottom:4}}>{card.name}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.55,fontWeight:300,margin:"0 0 10px"}}>{card.summary}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:2}}>✦ SUPERPOWER</div>
                        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>{card.superpowerText}</div>
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,color:T2.text3,fontWeight:400}}>{open?"Close":"Read →"}</span>
                    </div>
                  </div>
                  {open && <div style={{padding:"0 16px 20px",borderTop:"0.5px solid "+T2.border}}>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"14px 0 10px"}}>{card.body1}</p>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 12px"}}>{card.body2}</p>
                    <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 12px"}}>
                      <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                    </div>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14,marginBottom:12}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Why It Works</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                    </div>
                    <div style={{marginBottom:14}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Make It Yours</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                    </div>
                    <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>AmplifyU Lesson</div>
                      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                    </div>
                  </div>}
                </div>
              );
            })}
          </>
        );
      })()}
      {isD10 && step==="Rehearsal" && d10PracticePhase==='intro' && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>Rehearsal · Day 10</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>The SAR Challenge™</h2>
          <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:"16px 18px",marginBottom:12}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>The First Step</div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,marginBottom:0,fontWeight:300}}>Think of something you did recently — a project, a problem you solved, a result you created. Visibility isn't self-promotion. It's helping others understand your thinking, your ownership, and the results you create.</p>
          </div>
          <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:"16px 18px",marginBottom:20}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>Your AmplifyU Coach</div>
            <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,marginBottom:6,fontWeight:300}}>Your AmplifyU coach takes your three inputs and sharpens them into a crisp performance statement — ready for any conversation.</p>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,margin:0,fontStyle:"italic",fontWeight:300}}>Lead with the result. Make it specific. Own it.</p>
          </div>
          <button onClick={()=>setD10PracticePhase('builder')} style={{width:"100%",padding:"14px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48}}>
            Start the SAR Builder →
          </button>
        </>
      )}
      {isD10 && step==="Rehearsal" && d10PracticePhase==='builder' && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>The SAR Challenge™</div>
          <h2 style={{fontFamily:T.serif,fontSize:24,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>SAR Builder</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Situation. Action. Result. Describe what you did — your AmplifyU coach sharpens it into your performance statement.</p>
          <D10MobileSAR onComplete={()=>setD10SarDone(true)}/>
          {d10SarDone && (
            <button onClick={()=>setIdx(STEPS.indexOf('Simulation'))} style={{width:"100%",padding:"14px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48,marginTop:12}}>
              Go to Simulation →
            </button>
          )}
          <button onClick={()=>setD10PracticePhase('intro')} style={{background:"none",border:"none",color:T2.text3,fontFamily:T.sans,fontSize:13,cursor:"pointer",padding:"12px 0",textAlign:"center",width:"100%",marginTop:4}}>← Back</button>
        </>
      )}
      {isD10 && step==="Simulation" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>Simulation · Day 10</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>The Leadership Hot Seat</h2>
          <D10MobileSim/>
        </>
      )}
      {/* ── D7 Mobile Steps — Week 1 Review ─────────────────────────────────── */}
      {isD7 && step==="Insight" && (
        <>
          <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,fontFamily:T.sans}}>The wake-up call</div>
          <h2 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:8}}>Most people know how to communicate better. Very few practise until it's automatic.</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>This week, you did something different.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {D7_INSIGHT_CARDS.map((n,i)=>{
              const open = d7MobCard===("d7i"+i);
              return (
                <div key={i} onClick={()=>setD7MobCard(open?null:"d7i"+i)}
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
          <div style={{background:T2.surface,border:"0.5px solid "+T2.border,borderRadius:8,padding:"16px",marginTop:4}}>
            <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8,fontFamily:T.sans}}>The Neuroscience</div>
            <div style={{fontFamily:T.serif,fontSize:17,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:10}}>Why repetition works at a biological level</div>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.65,marginBottom:8,fontWeight:300}}>Every time you practise a skill deliberately, your brain wraps the relevant neural pathway in myelin — a sheath that makes the signal faster, stronger, and more automatic.</p>
            <p style={{fontFamily:T.sans,fontSize:13,color:T.gold,lineHeight:1.65,margin:0,fontStyle:"italic"}}>Skill is not talent. Skill is repetition. And repetition responds to practice, not intelligence. The six habits you trained this week are being written into your nervous system right now.</p>
          </div>
        </>
      )}
      {isD7 && step==="Theory" && (
        <>
          <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,fontFamily:T.sans}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>The Habit Loop</h2>
          <p style={{fontFamily:T.sans,fontSize:13,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Charles Duhigg — The Power of Habit, 2012</p>
          <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,marginBottom:16}}>Every habit — good or bad — follows the same loop:</p>
          {/* CUE → ROUTINE → REWARD visual */}
          <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:20}}>
            {[{label:"CUE",desc:"The trigger"},{ label:"ROUTINE",desc:"The behaviour"},{label:"REWARD",desc:"The signal"}].map((n,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
                <div style={{flex:1,padding:"12px 10px",background:"rgba(138,158,132,0.1)",border:"0.5px solid rgba(138,158,132,0.3)",borderRadius:6,textAlign:"center"}}>
                  <div style={{fontFamily:T.serif,fontSize:14,fontWeight:700,color:T.gold,marginBottom:2}}>{n.label}</div>
                  <div style={{fontFamily:T.sans,fontSize:10,color:T2.text3}}>{n.desc}</div>
                </div>
                {i<2 && <div style={{fontSize:16,color:T.gold,padding:"0 6px",flexShrink:0}}>→</div>}
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,marginBottom:16}}>Repeat the loop often enough and behaviour becomes automatic. Not through willpower. Through repetition.</p>
          <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.65,marginBottom:12}}>This week, every exercise you completed ran that loop:</p>
          {[
            {head:"CUE", body:"A moment of pressure, a conversation, a question you weren't expecting — that became the trigger."},
            {head:"ROUTINE", body:"A new behaviour. Pausing instead of filling. Leading with your point. Slowing down. Simplifying. That became the response."},
            {head:"REWARD", body:"A sense of clarity, control, or progress. That became the signal your brain learned to seek."},
          ].map((p,i)=>(
            <div key={i} style={{padding:"12px 14px",background:T2.surface,border:"0.5px solid "+T2.border,borderLeft:"2px solid "+T.gold,borderRadius:4,marginBottom:8}}>
              <div style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T.gold,marginBottom:4}}>{p.head}</div>
              <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:0,fontWeight:300}}>{p.body}</p>
            </div>
          ))}
          <div style={{height:"0.5px",background:T2.divider,margin:"20px 0"}}/>
          <div style={{padding:"16px 18px",background:T2.cardDark,borderRadius:6}}>
            <p style={{fontFamily:T.serif,fontSize:17,fontWeight:600,color:"rgba(255,255,255,0.9)",lineHeight:1.6,margin:"0 0 8px",fontStyle:"italic"}}>"You stop trying to communicate well. You simply do."</p>
            <p style={{fontFamily:T.sans,fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.5,margin:0,fontWeight:300}}>That is the difference between learning a technique and building a skill.</p>
          </div>
        </>
      )}
      {isD7 && step==="Example" && (
        <>
          <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,fontFamily:T.sans}}>Your Week 1 Foundations</div>
          <h2 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:8}}>Six habits. Seven days. Here's what you built.</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Each foundation is a permanent part of your communication toolkit. Not techniques to remember — behaviours to repeat.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {day:"DAY 1",skill:"Clarity",science:"The Feynman Technique",line:"If you can't say it simply, you don't understand it well enough yet."},
              {day:"DAY 2",skill:"Voice Control",science:"The 88 Keys",line:"Your voice has more range than you've been using. That changes from here."},
              {day:"DAY 3",skill:"Filler-Free Speech",science:"The Pause Principle",line:"Leaders pause. Amateurs fill. Silence is control."},
              {day:"DAY 4",skill:"Precision",science:"Miller's Law",line:"Every word must earn its place. Short sentences are a strategic choice."},
              {day:"DAY 5",skill:"Structure",science:"The PRE Framework",line:"Point. Reason. Example. The architecture of every compelling answer."},
              {day:"DAY 6",skill:"High-Stakes Conversations",science:"Calm Under Pressure",line:"The gap between good and great opens under pressure. You started closing it."},
            ].map((f,i)=>(
              <div key={i} style={{background:T2.surface,border:"0.5px solid "+T2.border,borderRadius:8,padding:"14px 16px",display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{background:T.gold,borderRadius:4,padding:"4px 8px",flexShrink:0,alignSelf:"flex-start"}}>
                  <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:"white",letterSpacing:"1px"}}>{f.day}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T2.text,marginBottom:2}}>{f.skill}</div>
                  <div style={{fontFamily:T.sans,fontSize:11,color:T.gold,fontWeight:600,letterSpacing:"0.5px",marginBottom:6}}>{f.science}</div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.55,margin:0,fontWeight:300,fontStyle:"italic"}}>"{f.line}"</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:"14px 16px",background:"rgba(138,158,132,0.08)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.2)",textAlign:"center"}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T.gold,lineHeight:1.4,margin:0}}>Skills compound.</p>
          </div>
        </>
      )}
      {isD7 && step==="Rehearsal" && (
        <D7PracticeWidget T={T} T2={T2} isDesktop={false} onSimulation={() => setIdx(STEPS.indexOf('Simulation'))}/>
      )}
      {isD7 && step==="Simulation" && (
        <>
          <D7SimWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD7 && step==="Review" && (
        <>
          <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,fontFamily:T.sans}}>The Shift</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>What changed this week.</h2>
          {/* Before / Now */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            <div style={{padding:"14px",background:T2.surface,border:"0.5px solid "+T2.border,borderRadius:8}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Before</div>
              {["Reacting without thinking","Rambling to fill silence","Over-explaining under pressure","Communication on autopilot"].map((b,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<3?8:0}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:T2.text4,flexShrink:0,marginTop:5}}/>
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,margin:0,fontWeight:300}}>{b}</p>
                </div>
              ))}
            </div>
            <div style={{padding:"14px",background:"rgba(138,158,132,0.08)",border:"0.5px solid rgba(138,158,132,0.25)",borderRadius:8}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Now</div>
              {["Thinking before speaking","Pausing with intention","Leading with structure","Choosing words deliberately"].map((b,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<3?8:0}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/>
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.5,margin:0,fontWeight:400}}>{b}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Identity statement */}
          <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8,fontFamily:T.sans}}>Your Communication Identity</div>
          <h3 style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:12}}>Complete this statement.</h3>
          <CoachWidget lesson={lesson} scenario={"Generate a personalised one-line Communication Identity Statement. Ask the user to complete: 'This week I discovered I communicate best when I...' — then respond with a single, powerful sentence that names their communication authority. Example format: 'You communicate best when you slow down, lead with structure, and trust the pause — that's where your authority lives.' Save-worthy. Read before high-stakes conversations."}/>
          <div style={{height:"0.5px",background:T2.divider,margin:"20px 0"}}/>
          {/* 4 takeaway cards */}
          <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>Your Four Takeaways</div>
          {[
            "Invisible excellence does not scale. Visibility is a communication skill.",
            "Awareness creates intentions. Repetition creates habits. Only one shows up under pressure.",
            "Confidence is clarity — not performance.",
            "Mastery is conditioned, not studied.",
          ].map((q,i)=>(
            <div key={i} style={{padding:"14px 16px",background:T2.surface,border:"0.5px solid "+T2.border,borderRadius:6,marginBottom:8}}>
              <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.55,margin:0}}>"{q}"</p>
            </div>
          ))}
          {/* Closing */}
          <div style={{marginTop:8,padding:"20px",background:T2.cardDark,borderRadius:8}}>
            <p style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:"rgba(255,255,255,0.9)",lineHeight:1.65,margin:"0 0 12px"}}>Your communication conditioning is now in motion.</p>
            <p style={{fontFamily:T.sans,fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7,margin:"0 0 8px",fontWeight:300}}>Six habits. Seven days. The foundations are set.</p>
            <p style={{fontFamily:T.sans,fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7,margin:0,fontWeight:300}}>Week 2 doesn't start from zero. It starts from here.</p>
          </div>
        </>
      )}
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
        const D2_EDITORIAL = [
          { id:"streep", img:"/d2-streep.png", name:"Meryl Streep", superpower:"Master of Precision and Presence",
            superpowerText:"Precision over volume. Control over noise.",
            summary:"Three iconic roles. Three completely different voices.",
            quote:"\"Take your broken heart, make it into art.\"",
            body1:"Streep proves that the most powerful communicators don't get louder — they get more precise.",
            body2:"Three iconic roles. Three completely different voices, each built from the same instrument: Miranda Priestly barely above a whisper, Sophie in raw fractured grief, Thatcher in deliberate political authority.",
            body3:"She never reaches for volume. She reaches for control.",
            whyItWorks:"Precision creates presence. A whisper can command a room. A pause can carry more weight than a raised voice. The voice in complete control is the voice people follow.",
            technique:"Don't reach for volume — reach for control. Slow down before your most important word. Let silence carry what a raised voice never can.",
            lesson:"Precision creates presence. Control creates impact. A rushed voice can feel uncertain. An intentional voice commands attention.",
          },
          { id:"sinek", img:"/d2-sinek.png", name:"Simon Sinek", superpower:"Master of Voice",
            superpowerText:"Makes big ideas land through deliberate delivery.",
            summary:"His voice carries the emotion before the words do.",
            quote:"\"People don't buy what you do. They buy why you do it.\"",
            body1:"Sinek doesn't just explain ideas. He performs them with his voice.",
            body2:"He changes pace. Lowers his tone. Speeds up with excitement. Slows down before the idea that matters most.",
            body3:"Simple words. Deliberate delivery.",
            whyItWorks:"Great speakers don't speak at one speed. Sinek constantly varies his pace, emphasis and tone to keep attention and guide the listener through his thinking. His voice gives structure to the message.",
            technique:"Highlight important ideas with your voice, not just your words. Slow down before your biggest point. Speed up when telling a story. Change your pitch and emphasis to signal what matters. If your voice stays flat, your message will too.",
            lesson:"People don't just listen to what you say. They listen to how you say it. A dynamic voice turns information into influence.",
          },
        ];
        let d2ExObs = {}; try { d2ExObs = JSON.parse(localStorage.getItem('d2ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters of Voice & Delivery</h2>
            <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:20}}>Tap each card to explore how they do it.</p>
            {D2_EDITORIAL.map(card=>{
              const open = d2MobCard===card.id;
              const obs = d2ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:`0.5px solid ${open?"rgba(200,164,106,0.4)":T2.border}`,marginBottom:16,background:T2.surface,transition:"border-color 0.25s"}}>
                  {!open && (
                    <div style={{height:240,overflow:"hidden",position:"relative",cursor:"pointer"}}
                      onClick={()=>{
                        setD2MobCard(card.id);
                        if (!d2ExObs[card.id]) { d2ExObs[card.id]=true; localStorage.setItem('d2ExObserved',JSON.stringify(d2ExObs)); }
                      }}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",display:"block",objectFit:"cover",objectPosition:"center center"}}/>
                    </div>
                  )}
                  {!open && (
                    <div style={{padding:"8px 18px",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${obs?"#619164":"rgba(160,128,90,0.4)"}`,background:obs?"rgba(97,145,100,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.25s"}}>
                        {obs && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="#619164" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,fontWeight:obs?600:400,color:obs?"#619164":"rgba(160,128,90,0.6)",letterSpacing:"0.02em"}}>{obs?"Observed":"Mark as observed"}</span>
                    </div>
                  )}
                  <div style={{padding:"16px 18px 4px",cursor:"pointer"}}
                    onClick={()=>{
                      const next = open ? null : card.id;
                      setD2MobCard(next);
                      if (next && !d2ExObs[card.id]) { d2ExObs[card.id]=true; localStorage.setItem('d2ExObserved',JSON.stringify(d2ExObs)); }
                    }}>
                    <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,lineHeight:1.15,marginBottom:3}}>{card.name}</h3>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:8}}>{card.superpower}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 12px"}}>{card.summary}</p>
                    <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:10,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                          <span style={{fontSize:8,color:T.gold}}>✦</span>
                          <span style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.8px"}}>Superpower</span>
                        </div>
                        <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{card.superpowerText}</p>
                      </div>
                      <div style={{fontFamily:T.sans,fontSize:12,fontWeight:500,color:T2.text3,display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                        <span>{open?"Close":"Read"}</span>
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.25s"}}><path d="M3 6l5 5 5-5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div style={{padding:"0 18px 20px",animation:"fadeUp 0.3s ease both"}}>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:16}}>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 10px"}}>{card.body1}</p>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 10px"}}>{card.body2}</p>
                        <div style={{padding:"14px 18px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 10px"}}>
                          <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                        </div>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                        <div style={{marginBottom:12}}>
                          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Why It Works</div>
                          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                        </div>
                        <div style={{marginBottom:12}}>
                          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Make It Yours</div>
                          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                        </div>
                        <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>AmplifyU Lesson</div>
                          <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        );
      })()}
       {/* ── D3 Mobile Steps ─────────────────────────────────────────────── */}
      {isD3 && step==="Insight" && (
        <>
          <img src="/day3-insight.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center 40%",display:"none"}}/>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Master Filler-Free Speech</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Most people are far stronger speakers than they realise. Filler words are often just an unconscious habit — and removing them is one of the fastest ways to elevate your credibility, authority, and influence.</p>
          <p style={{fontFamily:T.sans,fontSize:12,color:T.gold,lineHeight:1.5,fontWeight:500,marginBottom:14,letterSpacing:"0.02em"}}>Explore each card to learn more →</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {D3_FACTS.map((n,i)=>{
              const open = d3MobCard===("d3i"+i);
              return (
                <div key={i} onClick={()=>setD3MobCard(open?null:"d3i"+i)}
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
        </>
      )}
      {isD3 && step==="Theory" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>The Cognitive Load Principle</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Fillers happen when your brain is multitasking faster than it can think.</p>
          <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"16px 18px",marginBottom:16,borderRadius:4}}>
            <p style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,lineHeight:1.4,margin:0}}>You don't have a speaking problem. You have a processing speed problem — and the pause is the solution.</p>
          </div>
          {[
            {label:"The Real Cause",           sub:"Fillers are not a habit. They are a symptom — your brain trying to hold the floor while it catches up.",
              bullets:["Speaking, thinking, and organising ideas all compete for the same mental bandwidth at once.","When your mouth moves faster than your thoughts, your brain reaches for a placeholder. That placeholder is the filler."]},
            {label:"Inside the Moment",        sub:"What actually happens in the moment you say 'um' or 'er'.",
              bullets:["Your next thought isn't ready. The filler buys your brain time — but at the cost of your credibility.","The audience hears the filler before they hear the idea. It signals uncertainty, even when you feel confident."]},
            {label:"The Strategic Pause",      sub:"The solution is not to speak faster. It is to stop — and let your brain catch up.",
              bullets:["When you feel the urge to fill, pause instead. Close your mouth. Let the silence work.","A pause signals control. It tells the room: what comes next is worth waiting for."]},
            {label:"Why This Fix Works",      sub:"Pause. Breathe. That single moment changes everything.",
              bullets:["A breath creates mental clarity and calms the nervous system — in that moment, you give yourself the best possible chance of a strong response.","Speak in declarative statements. Calm. Clear. Certain. One idea. One sentence. Full stop. No hedge. No filler. Just the point."]},
          ].map((p,i)=>{
            const open=d3MobCard===("d3t"+i);
            return (
              <div key={i} onClick={()=>setD3MobCard(open?null:"d3t"+i)}
                style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px 16px",marginBottom:10,cursor:"pointer",transition:"border-color 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:6}}>
                  <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",flex:1}}>{p.label}</div>
                  <span style={{fontFamily:T.sans,fontSize:14,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
                </div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.65,fontWeight:400,margin:open?"0 0 10px":0}}>{p.sub}</p>
                {open && (<div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                  {p.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/><p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,fontWeight:300,margin:0}}>{b}</p></div>))}
                </div>)}
              </div>
            );
          })}
        </>
      )}
      {isD3 && step==="Example" && (()=>{
        const D3_EDITORIAL = [
          { id:"freeman", img:"/d3-freeman.png", name:"Morgan Freeman", superpower:"Master of the Pause",
            superpowerText:"Turns silence into emphasis.",
            summary:"No ums. No uhs. Just measured, deliberate speech.",
            quote:"\"Hope is a good thing. Maybe the best of things. And no good thing ever dies.\"",
            body1:"Listen to Morgan Freeman narrate anything. You'll notice what he doesn't say.",
            body2:"No ums. No uhs. No fillers. Just measured, deliberate speech.",
            body3:"When he needs to think, he pauses. That pause doesn't weaken his delivery — it strengthens it.",
            whyItWorks:"Silence creates anticipation. Fillers create distraction. When Freeman pauses, your attention sharpens — you lean in to hear what comes next. The pause is the tool, not the gap.",
            technique:"When you don't know what to say next, stop talking. Pause. Breathe. Then continue. Practice letting the silence sit — it signals confidence, not uncertainty.",
            lesson:"The pause is not your enemy. It's your most underused communication tool. Use it deliberately.",
          },
          { id:"wintour", img:"/d3-wintour.png", name:"Anna Wintour", superpower:"Filler-Free Authority",
            superpowerText:"Every word chosen. Zero wasted.",
            summary:"She pauses between thoughts — no fillers, no hedging, just control.",
            quote:"\"Decisiveness.\"",
            body1:"Anna Wintour runs Vogue. When she speaks, there's no fluff.",
            body2:"A journalist asked: \"What makes a good editor?\" She paused for three seconds. Then: one word. Perfect answer.",
            body3:"Fillers signal uncertainty. Pauses signal control. She always knows what she wants to say.",
            whyItWorks:"She prepares before she speaks. That means she never needs to fill space with ums or uhs. The pause is deliberate — it communicates that the answer was worth waiting for.",
            technique:"Prepare your answer before you speak. If you haven't decided what to say, don't start talking yet. Wait. Think. Then deliver.",
            lesson:"Filler-free speech starts with knowing your point. The cleaner your thinking, the cleaner your delivery.",
          },
        ];
        let d3ExObs = {}; try { d3ExObs = JSON.parse(localStorage.getItem('d3ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters of the Pause</h2>
            <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:20}}>Two speakers who turned silence into a superpower.</p>
            {D3_EDITORIAL.map(card=>{
              const open = d3MobCard===card.id;
              const obs = d3ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:`0.5px solid ${open?"rgba(200,164,106,0.4)":T2.border}`,marginBottom:16,background:T2.surface,transition:"border-color 0.25s"}}>
                  {!open && (
                    <div style={{height:240,overflow:"hidden",position:"relative",cursor:"pointer"}}
                      onClick={()=>{
                        setD3MobCard(card.id);
                        if (!d3ExObs[card.id]) { d3ExObs[card.id]=true; localStorage.setItem('d3ExObserved',JSON.stringify(d3ExObs)); }
                      }}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",display:"block",objectFit:"cover",objectPosition:"center center"}}/>
                    </div>
                  )}
                  {!open && (
                    <div style={{padding:"8px 18px",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${obs?"#619164":"rgba(160,128,90,0.4)"}`,background:obs?"rgba(97,145,100,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.25s"}}>
                        {obs && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="#619164" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,fontWeight:obs?600:400,color:obs?"#619164":"rgba(160,128,90,0.6)",letterSpacing:"0.02em"}}>{obs?"Observed":"Mark as observed"}</span>
                    </div>
                  )}
                  <div style={{padding:"16px 18px 4px",cursor:"pointer"}}
                    onClick={()=>{
                      const next = open ? null : card.id;
                      setD3MobCard(next);
                      if (next && !d3ExObs[card.id]) { d3ExObs[card.id]=true; localStorage.setItem('d3ExObserved',JSON.stringify(d3ExObs)); }
                    }}>
                    <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,lineHeight:1.15,marginBottom:3}}>{card.name}</h3>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:8}}>{card.superpower}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 12px"}}>{card.summary}</p>
                    <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:10,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                          <span style={{fontSize:8,color:T.gold}}>✦</span>
                          <span style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.8px"}}>Superpower</span>
                        </div>
                        <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{card.superpowerText}</p>
                      </div>
                      <div style={{fontFamily:T.sans,fontSize:12,fontWeight:500,color:T2.text3,display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                        <span>{open?"Close":"Read"}</span>
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.25s"}}><path d="M3 6l5 5 5-5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div style={{padding:"0 18px 20px",animation:"fadeUp 0.3s ease both"}}>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:16}}>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 10px"}}>{card.body1}</p>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 10px"}}>{card.body2}</p>
                        <div style={{padding:"14px 18px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 10px"}}>
                          <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                        </div>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                        <div style={{marginBottom:12}}>
                          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Why It Works</div>
                          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                        </div>
                        <div style={{marginBottom:12}}>
                          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Make It Yours</div>
                          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                        </div>
                        <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>AmplifyU Lesson</div>
                          <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        );
      })()}
      {isD3 && step==="Rehearsal" && (
        <>
          <D3PracticeWidget T={T} T2={T2} isDesktop={false} onNavLabel={setD3NavLabel} onNavFn={d3NavFnRef} onSimulation={()=>setIdx(STEPS.indexOf('Simulation'))}/>
        </>
      )}
      {isD3 && step==="Simulation" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Simulation · Day 3</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Speak Without Filling the Silence</h2>
          <D3SimWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
       {/* ── D4 Mobile Steps ─────────────────────────────────────────────── */}
      {isD4 && step==="Insight" && (
        <>
          <img src="/day4-insight.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Why Short Sentences Win</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>The brain processes short sentences faster, retains them longer, and finds them more persuasive.</p>
          <p style={{fontFamily:T.sans,fontSize:12,color:T.gold,lineHeight:1.5,fontWeight:500,marginBottom:14,letterSpacing:"0.02em"}}>Explore each card to learn more →</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {D4_FACTS.map((n,i)=>{
              const open=d4MobCard===("d4i"+i);
              return (
                <div key={i} onClick={()=>setD4MobCard(open?null:"d4i"+i)}
                  style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 10px":0}}>{n.sub}</p>
                  {open && (<div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                    {n.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/><p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p></div>))}
                  </div>)}
                </div>
              );
            })}
          </div>
          <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>Long sentences lose people. Short sentences move them.</p>
        </>
      )}
      {isD4 && step==="Theory" && (
        <>
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
      {isD4 && step==="Example" && (()=>{
        const D4_EDITORIAL = [
          { id:"hemingway", img:"/d4-hemingway.png", imgPos:"center center", name:"Ernest Hemingway", superpower:"Master of Brevity",
            superpowerText:"Every word earns its place — or it goes.",
            summary:"He won the Nobel Prize with short, precise sentences.",
            quote:"\"The old man fished alone. Eighty-four days. No fish.\"",
            body1:"Hemingway won the Nobel Prize for literature. His secret? Short sentences.",
            body2:"No flourish. No decoration. Just truth.",
            body3:"Short sentences force precision. You can't hide weak ideas behind long ones. Every word earns its place or it goes.",
            whyItWorks:"Brevity forces clarity. When you limit words, you're forced to keep only the ones that matter. Long sentences let weak ideas hide behind structure. Short sentences expose them.",
            technique:"Write your first draft. Then cut every unnecessary word. Read each sentence aloud — if you run out of breath before the full stop, it's too long. Over 15 words? Split it.",
            lesson:"Every word you add dilutes your message. The best writers know what to leave out. Clarity is a discipline.",
          },
          { id:"chanel", img:"/d4-chanel.png", imgPos:"center 65%", name:"Coco Chanel", superpower:"Elegance Through Elimination",
            superpowerText:"Short sentences. Maximum impact. Every time.",
            summary:"She built an empire on less is more — in fashion and in words.",
            quote:"\"Fashion fades. Style remains.\"",
            body1:"Chanel revolutionised fashion with one principle: remove everything that isn't essential.",
            body2:"The same principle shaped how she spoke.",
            body3:"Short sentences. Maximum impact. Every time.",
            whyItWorks:"Each of her quotes is a complete thought. No wasted words. Just precision. The discipline of cutting in fashion is the same discipline as cutting in speech — both demand you decide what's essential and remove everything else.",
            technique:"Take your last important email or message. Find the three most essential sentences. Delete the rest. See if the meaning survives. It almost always does.",
            lesson:"Elegance in language, like elegance in fashion, is about knowing what to leave out. The most powerful sentences are the ones with nothing left to remove.",
          },
        ];
        let d4ExObs = {}; try { d4ExObs = JSON.parse(localStorage.getItem('d4ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters of Brevity</h2>
            <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:20}}>Two voices that prove less is always more.</p>
            {D4_EDITORIAL.map(card=>{
              const open = d4MobCard===card.id;
              const obs = d4ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:`0.5px solid ${open?"rgba(200,164,106,0.4)":T2.border}`,marginBottom:16,background:T2.surface,transition:"border-color 0.25s"}}>
                  {!open && (
                    <div style={{height:240,overflow:"hidden",position:"relative",cursor:"pointer"}}
                      onClick={()=>{
                        setD4MobCard(card.id);
                        if (!d4ExObs[card.id]) { d4ExObs[card.id]=true; localStorage.setItem('d4ExObserved',JSON.stringify(d4ExObs)); }
                      }}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",display:"block",objectFit:"cover",objectPosition:card.imgPos||"center center"}}/>
                    </div>
                  )}
                  {!open && (
                    <div style={{padding:"8px 18px",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${obs?"#619164":"rgba(160,128,90,0.4)"}`,background:obs?"rgba(97,145,100,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.25s"}}>
                        {obs && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="#619164" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,fontWeight:obs?600:400,color:obs?"#619164":"rgba(160,128,90,0.6)",letterSpacing:"0.02em"}}>{obs?"Observed":"Mark as observed"}</span>
                    </div>
                  )}
                  <div style={{padding:"16px 18px 4px",cursor:"pointer"}}
                    onClick={()=>{
                      const next = open ? null : card.id;
                      setD4MobCard(next);
                      if (next && !d4ExObs[card.id]) { d4ExObs[card.id]=true; localStorage.setItem('d4ExObserved',JSON.stringify(d4ExObs)); }
                    }}>
                    <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,lineHeight:1.15,marginBottom:3}}>{card.name}</h3>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:8}}>{card.superpower}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 12px"}}>{card.summary}</p>
                    <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:10,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                          <span style={{fontSize:8,color:T.gold}}>✦</span>
                          <span style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.8px"}}>Superpower</span>
                        </div>
                        <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{card.superpowerText}</p>
                      </div>
                      <div style={{fontFamily:T.sans,fontSize:12,fontWeight:500,color:T2.text3,display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                        <span>{open?"Close":"Read"}</span>
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.25s"}}><path d="M3 6l5 5 5-5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div style={{padding:"0 18px 20px",animation:"fadeUp 0.3s ease both"}}>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:16}}>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 10px"}}>{card.body1}</p>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 10px"}}>{card.body2}</p>
                        <div style={{padding:"14px 18px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 10px"}}>
                          <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                        </div>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                        <div style={{marginBottom:12}}>
                          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Why It Works</div>
                          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                        </div>
                        <div style={{marginBottom:12}}>
                          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Make It Yours</div>
                          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                        </div>
                        <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>AmplifyU Lesson</div>
                          <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        );
      })()}
      {isD4 && step==="Rehearsal" && (
        <>
          <D4PracticeWidget T={T} T2={T2} isDesktop={false} onNavLabel={setD4NavLabel} onNavFn={d4NavFnRef} onSimulation={()=>setIdx(STEPS.indexOf('Simulation'))}/>
        </>
      )}
      {isD4 && step==="Simulation" && (
        <>
          <D4SimWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
       {/* ── D1 Mobile Steps ─────────────────────────────────────────────── */}
      {isD1 && step==="Insight" && (
        <>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Why Clarity Wins</h2>
          <p style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T2.text,lineHeight:1.3,marginBottom:10}}>Transform complexity into clarity.</p>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:6}}>Clear language makes ideas easier to understand, easier to remember, and easier to act on.</p>
          <p style={{fontFamily:T.sans,fontSize:12,color:T.gold,lineHeight:1.5,fontWeight:500,marginBottom:14,letterSpacing:"0.02em"}}>Explore each card to learn more →</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {D1_CLARITY_FACTS_DATA.map((n,i)=>{
              const open = d1MobCard===("cf"+i);
              return (
                <div key={i} onClick={()=>setD1MobCard(open?null:"cf"+i)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:12,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0,transition:"color 0.2s"}}>{open?"▴":"▸"}</span>
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
          <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>A clear message makes people lean in.</p>
        </>
      )}
      {isD1 && step==="Theory" && (()=>{
        const mSteps = [
          {n:"01",icon:<svg width="16" height="16" viewBox="0 0 17 17" fill="none"><rect x="3" y="2" width="11" height="13" rx="1.5" stroke={T2.text4} strokeWidth="1.1"/><line x1="5.5" y1="5.5" x2="11.5" y2="5.5" stroke={T2.text4} strokeWidth="0.9"/><line x1="5.5" y1="8.5" x2="11.5" y2="8.5" stroke={T2.text4} strokeWidth="0.9"/><line x1="5.5" y1="11.5" x2="9.5" y2="11.5" stroke={T2.text4} strokeWidth="0.9"/></svg>,label:"Understand",desc:"Choose one concept and study it deeply.",focus:"Knowledge before communication."},
          {n:"02",icon:<svg width="16" height="16" viewBox="0 0 17 17" fill="none"><path d="M13.5 3h-10A1.5 1.5 0 002 4.5v5A1.5 1.5 0 003.5 11h2l2.5 3 2.5-3h3A1.5 1.5 0 0015 9.5v-5A1.5 1.5 0 0013.5 3z" stroke={T2.text4} strokeWidth="1.1"/></svg>,label:"Explain",desc:"Teach it in simple words as if to someone else.",focus:"Mastery is demonstrated through clarity."},
          {n:"03",icon:<svg width="16" height="16" viewBox="0 0 17 17" fill="none"><path d="M12.5 3.5l1 1-7.5 7.5H4.5v-1.5l7.5-7.5z" stroke={T2.text4} strokeWidth="1.1" strokeLinejoin="round"/><line x1="4.5" y1="14" x2="12.5" y2="14" stroke={T2.text4} strokeWidth="0.9" strokeLinecap="round" strokeDasharray="1.5 1.5"/></svg>,label:"Simplify",desc:"Identify gaps and remove unnecessary complexity.",focus:"Simplicity is precision. Every word should earn its place."},
          {n:"04",icon:<svg width="16" height="16" viewBox="0 0 17 17" fill="none"><path d="M14 8.5A5.5 5.5 0 013.5 6.5" stroke={T2.text4} strokeWidth="1.1" strokeLinecap="round"/><path d="M3 8.5A5.5 5.5 0 0113.5 10.5" stroke={T2.text4} strokeWidth="1.1" strokeLinecap="round"/><path d="M12 5l2 1.5-1.5 2" stroke={T2.text4} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12l-2-1.5 1.5-2" stroke={T2.text4} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>,label:"Refine",desc:"Review, clarify, and improve. Repeat until it sticks.",focus:"Clarity is built through iteration, not perfection."},
        ];
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>The Feynman Technique</h2>
            <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Richard Feynman won the Nobel Prize in Physics — and could explain quantum mechanics to a 12-year-old.</p>
            <div style={{padding:"16px 18px",background:"rgba(44,36,22,0.07)",borderRadius:4,borderLeft:"2px solid "+T.gold,marginBottom:22}}>
              <p style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T2.text,lineHeight:1.4,margin:"0 0 5px"}}>"If you can't explain it simply, you don't understand it well enough."</p>
              <p style={{fontFamily:T.sans,fontSize:11,color:T2.text4,margin:0}}>— Richard Feynman</p>
            </div>
            {mSteps.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:14,padding:"14px 16px",marginBottom:6,borderRadius:6,background:`rgba(44,36,22,${0.03+i*0.03})`}}>
                <div style={{fontFamily:T.serif,fontSize:20,fontWeight:300,color:T.gold,opacity:0.3,lineHeight:1,minWidth:24,paddingTop:2}}>{s.n}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>{s.icon}<div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:"#8A9E84"}}>{s.label}</div></div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:"0 0 4px"}}>{s.desc}</p>
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontWeight:300,fontStyle:"italic",margin:0}}>{s.focus}</p>
                </div>
              </div>
            ))}
            <div style={{marginTop:24,marginBottom:18}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Real Lesson</div>
              <div style={{fontFamily:T.serif,fontSize:17,fontWeight:400,fontStyle:"italic",color:T2.text,lineHeight:1.4}}>Teaching forces you to understand. Simplifying forces you to think.</div>
            </div>
          </>
        );
      })()}
      {isD1 && step==="Example" && (()=>{
        const D1_EDITORIAL = [
          { id:"attenborough", img:"/d11-attenborough.png", name:"Sir David Attenborough", superpower:"Master of Clarity",
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
          { id:"branson", img:"/d11-branson.png", name:"Sir Richard Branson", superpower:"Conversation over Corporation",
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
        let d1ExObs = {}; try { d1ExObs = JSON.parse(localStorage.getItem('d1ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters of Clear Communication</h2>
            <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:20}}>Tap each card to explore how they do it.</p>
            {D1_EDITORIAL.map(card=>{
              const open = d1MobCard===card.id;
              const obs = d1ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:`0.5px solid ${open?"rgba(200,164,106,0.4)":T2.border}`,marginBottom:16,background:T2.surface,transition:"border-color 0.25s"}}>
                  {/* Image — gallery only, hidden when open */}
                  {!open && (
                    <div style={{height:240,overflow:"hidden",position:"relative",cursor:"pointer"}}
                      onClick={()=>{
                        setD1MobCard(card.id);
                        if (!d1ExObs[card.id]) { d1ExObs[card.id]=true; localStorage.setItem('d1ExObserved',JSON.stringify(d1ExObs)); }
                      }}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",display:"block",objectFit:"cover",objectPosition:"center center"}}/>
                    </div>
                  )}
                  {/* Observed badge — full-width strip below image */}
                  {!open && (
                    <div style={{padding:"8px 18px",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${obs?"#619164":"rgba(160,128,90,0.4)"}`,background:obs?"rgba(97,145,100,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.25s"}}>
                        {obs && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="#619164" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,fontWeight:obs?600:400,color:obs?"#619164":"rgba(160,128,90,0.6)",letterSpacing:"0.02em"}}>{obs?"Observed":"Mark as observed"}</span>
                    </div>
                  )}
                  {/* Text area — name, eyebrow, summary, superpower row */}
                  <div style={{padding:"16px 18px 4px",cursor:"pointer"}}
                    onClick={()=>{
                      const next = open ? null : card.id;
                      setD1MobCard(next);
                      if (next && !d1ExObs[card.id]) { d1ExObs[card.id]=true; localStorage.setItem('d1ExObserved',JSON.stringify(d1ExObs)); }
                    }}>
                    <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,lineHeight:1.15,marginBottom:3}}>{card.name}</h3>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:8}}>{card.superpower}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 12px"}}>{card.summary}</p>
                    <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:10,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                          <span style={{fontSize:8,color:T.gold}}>✦</span>
                          <span style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.8px"}}>Superpower</span>
                        </div>
                        <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{card.superpowerText}</p>
                      </div>
                      <div style={{fontFamily:T.sans,fontSize:12,fontWeight:500,color:T2.text3,display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                        <span>{open?"Close":"Read"}</span>
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.25s"}}><path d="M3 6l5 5 5-5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div style={{padding:"0 18px 20px",animation:"fadeUp 0.3s ease both"}}>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:16}}>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 10px"}}>{card.body1}</p>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 10px"}}>{card.body2}</p>
                        <div style={{padding:"14px 18px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 10px"}}>
                          <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                        </div>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                        <div style={{marginBottom:12}}>
                          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Why It Works</div>
                          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                        </div>
                        <div style={{marginBottom:12}}>
                          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Make It Yours</div>
                          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                        </div>
                        <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>AmplifyU Lesson</div>
                          <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        );
      })()}
      {isD1 && step==="Rehearsal" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Voice Warm-Up · Day 1</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:20}}>Let's warm up your voice.</h2>
          <D1WarmUpWidget T={T} T2={T2} isDesktop={false} onNavLabel={setD1NavLabel} onNavFn={d1NavFnRef} onComplete={(topic) => { setD1WarmUpTopic(topic); setIdx(i => i + 1); }}/>
        </>
      )}
      {isD1 && step==="Simulation" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Simulation · Day 1</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:20}}>Clarity Check-In</h2>
          <D1SimWidget T={T} T2={T2} isDesktop={false} warmUpTopic={d1WarmUpTopic}/>
        </>
      )}
       {/* ── NT (Day 8) Mobile Steps ─────────────────────────────────────── */}
      {isNT && step==="Insight" && (
        <>
          <div style={{borderLeft:"3px solid "+T.gold,padding:"16px 20px",background:"rgba(247,243,236,0.7)",borderRadius:4,marginBottom:16}}>
            <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"3px",marginBottom:8}}>Day 8 · Storytelling</div>
            <h2 style={{fontFamily:T.serif,fontSize:24,fontWeight:600,color:T2.text,lineHeight:1.1,margin:"0 0 10px"}}>Narrative Transportation</h2>
            <p style={{fontFamily:T.serif,fontSize:16,fontWeight:400,fontStyle:"italic",color:T2.text3,lineHeight:1.45,margin:0}}>We are more engaged when we feel inside the story.</p>
          </div>
          <p style={{fontFamily:T.sans,fontSize:12,color:T.gold,lineHeight:1.5,fontWeight:500,marginBottom:14,letterSpacing:"0.02em"}}>Explore each card to learn more →</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {NT_NEURO.map((n,i)=>{
              const open=ntMobCard===("nti"+i);
              return (
                <div key={i} onClick={()=>setNtMobCard(open?null:("nti"+i))}
                  style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 10px":0}}>{n.sub}</p>
                  {open && (<div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                    {n.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/><p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p></div>))}
                  </div>)}
                </div>
              );
            })}
          </div>
          <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>Facts explain. Stories move people.</p>
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
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              {n:1,beat:"Hook",         sub:"It starts with tension."},
              {n:2,beat:"Character",    sub:"Make it human. Make it real."},
              {n:3,beat:"Problem",      sub:"What broke? What's at stake?"},
              {n:4,beat:"Turning Point",sub:"What changes? Everything shifts."},
              {n:5,beat:"Resolution",   sub:"What happened? Why it matters."},
              {n:6,beat:"Meaning",      sub:"What stayed with us?"},
            ].map((b,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"1px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T.gold}}>{b.n}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T2.text,marginBottom:2}}>{b.beat}</div>
                  <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T.gold,lineHeight:1.7,marginTop:8,marginBottom:24}}>No tension = no story. No shift = no meaning.</p>

        </>
      )}
      {isNT && step==="Example" && (()=>{
        const D8_EDITORIAL = [
          { id:"obama", img:"/d8-obama.png", imgPos:"center 40%", name:"Barack Obama", superpower:"Master of Human-First Storytelling",
            superpowerText:"Every policy begins with a person.",
            summary:"When discussing healthcare, jobs, or education, Obama always started with a single human story — not a statistic.",
            quote:"\"Change will not come if we wait for some other person or some other time.\"",
            body1:"When discussing healthcare, jobs, or education, Barack Obama often began with a single person. Not a policy. Not a statistic. A person.",
            body2:"A mother struggling to pay bills. A worker trying to support a family. A student chasing a dream. The audience connected with the human story before hearing the argument.",
            body3:"People care about people before they care about issues. By leading with one specific individual, Obama made abstract policy feel personal — and personal means memorable.",
            whyItWorks:"Narrative transportation theory tells us that when we follow a character's story, we lower our defences. We stop arguing and start feeling. Obama used this to make audiences emotionally invested before making his case.",
            technique:"Start with a customer, colleague, or client before presenting the data. Give them a name. Give them a challenge. Then connect that story to your point.",
            lesson:"Facts tell. Stories sell. The most persuasive communicators don't lead with data — they lead with a human being.",
          },
          { id:"pixar", img:"/d8-pixar.png", imgPos:"center 45%", name:"The Pixar Framework", superpower:"The Most Replicable Story Structure Ever Invented",
            superpowerText:"Once upon a time... until finally.",
            summary:"Pixar used the same six-beat template for every film. It works because it mirrors how the human brain processes experience.",
            quote:"\"The story is not in the plot but in the telling.\"",
            body1:"Pixar's story team discovered something remarkable: every great story follows the same six-beat structure. They used it for Up, Finding Nemo, Toy Story — and it works just as powerfully in a boardroom as it does on screen.",
            body2:"Once upon a time... Every day... Until one day... Because of that... Because of that... Until finally. Six beats. Every story ever told fits this shape.",
            body3:"The framework works because it mirrors how the human brain actually processes experience: we need a normal world, a disruption, and a resolution. Skip any beat and the story feels incomplete.",
            whyItWorks:"Narrative structure creates cognitive anticipation. When you establish a normal world and then disrupt it, the brain instinctively wants resolution. The audience stays engaged because they need to know how it ends.",
            technique:"Next time you present a challenge or pitch an idea, map it to the Pixar beats: set the normal world, name the disruption, trace the consequences, deliver the resolution. It takes 90 seconds and makes any message land harder.",
            lesson:"Structure doesn't constrain stories — it liberates them. The Pixar framework gives you a proven skeleton. Your job is simply to fill it with truth.",
          },
        ];
        let d8ExObs = {}; try { d8ExObs = JSON.parse(localStorage.getItem('d8ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Storytelling in the Wild</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Two examples of narrative transportation at its most powerful.</p>
            {D8_EDITORIAL.map(card=>{
              const open = ntMobCard===card.id;
              const obs = d8ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,marginBottom:16,background:T2.surface}}>
                  {!open && <div style={{height:240,overflow:"hidden"}} onClick={()=>{ const next={...d8ExObs,[card.id]:true}; try{localStorage.setItem('d8ExObserved',JSON.stringify(next));}catch{} setNtMobCard(card.id); }}><img src={card.img} alt={card.name} style={{width:"100%",height:"auto",display:"block",objectFit:"cover",objectPosition:"center top"}}/></div>}
                  {!open && <div onClick={()=>{ const next={...d8ExObs,[card.id]:true}; try{localStorage.setItem('d8ExObserved',JSON.stringify(next));}catch{} setNtMobCard(card.id); }} style={{padding:"8px 14px",background:obs?"rgba(97,145,100,0.12)":"rgba(30,26,20,0.04)",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:obs?"rgba(97,145,100,1)":"rgba(160,128,90,0.7)",fontFamily:T.sans,fontWeight:500}}>{obs?"✓ Observed":"◉ Observed"}</span>
                  </div>}
                  <div style={{padding:"16px 16px 14px"}} onClick={()=>setNtMobCard(open?null:card.id)}>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:4}}>{card.superpower}</div>
                    <div style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,marginBottom:4}}>{card.name}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.55,fontWeight:300,margin:"0 0 10px"}}>{card.summary}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:2}}>✦ SUPERPOWER</div>
                        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>{card.superpowerText}</div>
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,color:T2.text3,fontWeight:400}}>{open?"Close":"Read →"}</span>
                    </div>
                  </div>
                  {open && <div style={{padding:"0 16px 20px",borderTop:"0.5px solid "+T2.border}}>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"14px 0 10px"}}>{card.body1}</p>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 12px"}}>{card.body2}</p>
                    <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 12px"}}>
                      <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                    </div>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14,marginBottom:12}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Why It Works</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                    </div>
                    <div style={{marginBottom:14}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Make It Yours</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                    </div>
                    <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>AmplifyU Lesson</div>
                      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                    </div>
                  </div>}
                </div>
              );
            })}
          </>
        );
      })()}
      {isNT && step==="Simulation" && (
        <StoryArchitectWidget T={T} T2={T2} isDesktop={false}/>
      )}
      {isNT && step==="Rehearsal" && (
        <D8PracticeWidget T={T} T2={T2} isDesktop={false} onSimulation={()=>setIdx(STEPS.indexOf('Simulation'))}/>
      )}
       {/* ── D9 (Day 9) Mobile Steps ─────────────────────────────────────── */}
      {/* ── D9 Connection Mobile Steps ─────────────────────────────────── */}
      {isD9 && step==="Insight" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Missing Skill</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>How to make people feel understood.</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:14}}>Most people focus on what they want to say. Great communicators focus on understanding the person in front of them.</p>
          <p style={{fontFamily:T.sans,fontSize:12,color:T.gold,lineHeight:1.5,fontWeight:500,marginBottom:14}}>Tap each card to explore →</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            {D9_INSIGHT_CARDS.map((n,i)=>{
              const open=d9OpenCard===("d9i"+i);
              return (
                <div key={i} onClick={()=>setD9OpenCard(open?null:("d9i"+i))} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 10px":0}}>{n.sub}</p>
                  {open && <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                    {n.bullets.map((b,j)=><div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/><p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p></div>)}
                  </div>}
                </div>
              );
            })}
          </div>
          <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.6,fontStyle:"italic"}}>"Connection is not about having the perfect thing to say. It's about creating an environment where others feel comfortable sharing theirs."</p>
        </>
      )}
      {isD9 && step==="Theory" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Why some people make everyone feel understood</h2>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {[
              {word:"The Likeability Principle", body:"People trust, support and collaborate more with people they like. Likeability is about making others feel respected and understood."},
              {word:"Active Listening", body:"Give someone your full attention. Not preparing your reply. Not waiting your turn. Simply listening with the goal of understanding."},
              {word:"The Curiosity Effect", body:"People enjoy conversations where they feel interesting. Ask questions that encourage reflection, storytelling and deeper thinking."},
              {word:"Empathy", body:"Understand another person's perspective. You don't need to agree to understand. Understanding builds connection. Connection builds trust."},
            ].map((n,i)=>{
              const open=d9OpenCard===("d9t"+i);
              return (
                <div key={i} onClick={()=>setD9OpenCard(open?null:("d9t"+i))} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:0}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  {open && <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{n.body}</p>}
                </div>
              );
            })}
          </div>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Four Communication Styles</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            {D9_COMM_STYLES.map((s,i)=>(
              <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"12px"}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:s.colour,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>{s.label}</div>
                <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,lineHeight:1.5,marginBottom:4}}>{s.values.join(" · ")}</div>
                <div style={{fontFamily:T.sans,fontSize:11,color:T.gold,lineHeight:1.5}}>{s.connect.join(" · ")}</div>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.6,fontStyle:"italic"}}>"Speak to people the way they need to be spoken to, not the way you prefer to communicate."</p>
        </>
      )}
      {isD9 && step==="Example" && (()=>{
        const D9_EDITORIAL = [
          { id:"william", img:"/d9-william.png", imgPos:"center 50%", name:"Prince William", superpower:"Master of Connection Through Listening",
            superpowerText:"Makes others feel heard, not just met.",
            summary:"Whether speaking with emergency responders, veterans, or young people, he creates space for others to share — and they remember how he made them feel.",
            quote:"\"Mental health is just as important as physical health.\"",
            body1:"Prince William is known for making people feel comfortable. Whether he's speaking with emergency responders, young people, veterans, or families, he rarely dominates the conversation. Instead, he creates space for others to speak.",
            body2:"His communication isn't built on having the perfect answer. It's built on making the other person feel heard.",
            body3:"In your next conversation, focus less on what you'll say next and more on understanding the other person's perspective. Ask one more question than you normally would. Let silence do some of the work.",
            whyItWorks:"Connection begins with listening. By asking thoughtful questions, maintaining genuine curiosity, and giving people time to share their experiences, he builds trust quickly. People remember how he made them feel, not just what he said.",
            technique:"In your next conversation, focus less on what you'll say next and more on understanding the other person's perspective. Ask one more question than you normally would. Let silence do some of the work.",
            lesson:"Strong communicators don't connect because they speak the most. They connect because they make others feel valued. Listening isn't the pause between speaking — it's where connection begins.",
          },
          { id:"jacinda", img:"/d9-jacinda.png", imgPos:"center 50%", name:"Jacinda Ardern", superpower:"Master of Empathetic Leadership",
            superpowerText:"Warmth, humility, and authenticity — every time.",
            summary:"She communicates with warmth, empathy, and authenticity. She doesn't create distance between herself and others — she closes it.",
            quote:"\"One of the criticisms I've faced over the years is that I'm not aggressive enough... I totally rebel against that.\"",
            body1:"Jacinda Ardern has a remarkable ability to make leadership feel personal. Whether speaking to a nation after tragedy or chatting informally online from home, she communicates with warmth, empathy, and authenticity.",
            body2:"She doesn't create distance between herself and others — she closes it. Her message is simple: people come first.",
            body3:"People connect with leaders who feel genuine. By showing empathy, acknowledging emotions, and speaking with humility, she builds trust before asking for action. When people feel understood, they're far more willing to listen.",
            whyItWorks:"People connect with leaders who feel genuine. By showing empathy, acknowledging emotions, and speaking with humility, she builds trust before asking for action. When people feel understood, they're far more willing to listen.",
            technique:"Before trying to persuade someone, show that you understand their perspective. Acknowledge how they might be feeling, ask questions with genuine curiosity, and respond with empathy before offering your own view.",
            lesson:"Connection isn't about being the most charismatic person in the room. It's about making other people feel seen, heard, and understood. Empathy turns conversations into relationships, and relationships build lasting influence.",
          },
        ];
        let d9ExObs = {}; try { d9ExObs = JSON.parse(localStorage.getItem('d9ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Connection in Action</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Two communicators who connect by making others feel heard.</p>
            {D9_EDITORIAL.map(card=>{
              const open = d9OpenCard===("d9ex"+card.id);
              const obs = d9ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,marginBottom:16,background:T2.surface}}>
                  {!open && <div style={{height:240,overflow:"hidden"}} onClick={()=>{ const next={...d9ExObs,[card.id]:true}; try{localStorage.setItem('d9ExObserved',JSON.stringify(next));}catch{} setD9OpenCard("d9ex"+card.id); }}><img src={card.img} alt={card.name} style={{width:"100%",height:"auto",display:"block",objectFit:"cover",objectPosition:"center top"}}/></div>}
                  {!open && <div onClick={()=>{ const next={...d9ExObs,[card.id]:true}; try{localStorage.setItem('d9ExObserved',JSON.stringify(next));}catch{} setD9OpenCard("d9ex"+card.id); }} style={{padding:"8px 14px",background:obs?"rgba(97,145,100,0.12)":"rgba(30,26,20,0.04)",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:obs?"rgba(97,145,100,1)":"rgba(160,128,90,0.7)",fontFamily:T.sans,fontWeight:500}}>{obs?"✓ Observed":"◉ Observed"}</span>
                  </div>}
                  <div style={{padding:"16px 16px 14px"}} onClick={()=>setD9OpenCard(open?null:("d9ex"+card.id))}>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:4}}>{card.superpower}</div>
                    <div style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,marginBottom:4}}>{card.name}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.55,fontWeight:300,margin:"0 0 10px"}}>{card.summary}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:2}}>✦ SUPERPOWER</div>
                        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>{card.superpowerText}</div>
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,color:T2.text3,fontWeight:400}}>{open?"Close":"Read →"}</span>
                    </div>
                  </div>
                  {open && <div style={{padding:"0 16px 20px",borderTop:"0.5px solid "+T2.border}}>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"14px 0 10px"}}>{card.body1}</p>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 12px"}}>{card.body2}</p>
                    <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 12px"}}>
                      <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                    </div>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14,marginBottom:12}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Why It Works</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                    </div>
                    <div style={{marginBottom:14}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Make It Yours</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                    </div>
                    <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>AmplifyU Lesson</div>
                      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                    </div>
                  </div>}
                </div>
              );
            })}
          </>
        );
      })()}
      {isD9 && step==="Rehearsal" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Rehearsal · Day 9</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:20}}>Build Your Connection Habits</h2>
          <D9PracticeWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD9 && step==="Simulation" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Simulation · Day 9</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>The Rapport Builder</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Four conversations. Four personalities. Adapt your style and build genuine rapport.</p>
          <D9SimWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
       {/* ── Generic steps (all other days) ─────────────────────────────── */}
      {/* ── D5 Mobile Steps ─────────────────────────────────────────────── */}
      {isD5 && step==="Insight" && (
        <>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>Why Structure Wins</h2>
          <div style={{display:"flex",gap:0,marginBottom:20,borderRadius:6,overflow:"hidden",border:"0.5px solid "+T2.border}}>
            {[{l:"P",word:"Point",desc:"State your view first."},{l:"R",word:"Reason",desc:"Explain why."},{l:"E",word:"Example",desc:"Make it concrete."}].map((item,i)=>(
              <div key={i} style={{flex:1,padding:"14px 12px",background:i===1?T2.surface:T2.bg,borderLeft:i>0?"0.5px solid "+T2.divider:"none"}}>
                <div style={{fontFamily:T.serif,fontSize:22,fontWeight:700,color:T.gold,lineHeight:1,marginBottom:4}}>{item.l}</div>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T2.text,textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>{item.word}</div>
                <div style={{fontFamily:T.sans,fontSize:10,color:T2.text3,lineHeight:1.4,fontWeight:300}}>{item.desc}</div>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:6}}>Three parts. Every answer. PRE is the framework that makes your thinking instantly clear to whoever is listening.</p>
          <p style={{fontFamily:T.sans,fontSize:12,color:T.gold,lineHeight:1.5,fontWeight:500,marginBottom:14,letterSpacing:"0.02em"}}>Explore each card to learn more →</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {word:"Credibility",    sub:"Leading with your point signals clear thinking.",        bullets:["Structured communication creates immediate credibility — your audience knows you have a clear perspective.","When you lead with your conclusion, you sound decisive and confident before you've even explained why."]},
              {word:"Recall",         sub:"Structured messages are 40% more memorable.",            bullets:["A clear beginning, middle and end helps your audience store and retrieve your message with ease.","Without structure, ideas blur together. With PRE, each part reinforces the next."]},
              {word:"Persuasion",     sub:"Great ideas rarely persuade on their own.",              bullets:["PRE helps you present a clear point, support it with logic, and reinforce it with proof.","Unstructured arguments make audiences work harder. Structured arguments make the next step obvious."]},
              {word:"Decision Speed", sub:"Leaders decide faster when communication is structured.", bullets:["Lead with your point and you cut the cognitive overhead for whoever is listening.","Every conversation you structure well ends faster — with the outcome you want."]},
            ].map((n,i)=>{
              const open = d5MobCard===("d5i"+i);
              return (
                <div key={i} onClick={()=>setD5MobCard(open?null:"d5i"+i)}
                  style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
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
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {[
              {n:"Point",   role:"Strong opening anchor",   body:"Lead with your conclusion. The brain locks onto the first thing it hears — give it something worth remembering."},
              {n:"Reason",  role:"Cognitive bridge",         body:"Connect your point to meaning. This is how you make the idea stick — not just land."},
              {n:"Example", role:"Memorable closing proof",  body:"Finish with evidence. The recency effect means your example is the last thing heard — and the most recalled."},
            ].map((b,i)=>(
              <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"16px 18px"}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,marginBottom:4,textTransform:"uppercase",letterSpacing:"1.5px"}}>{b.n}</div>
                <div style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,marginBottom:6}}>{b.role}</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:0}}>{b.body}</p>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:4}}>PRE isn't just structure — it's how the brain naturally wants to receive information.</p>
        </>
      )}
      {isD5 && step==="Example" && (()=>{
        const D5_EDITORIAL = [
          { id:"jensen", img:"/d5-jensen.png", name:"Jensen Huang", superpower:"PRE in Every Pitch",
            superpowerText:"Point. Reason. Example. Every time.",
            summary:"He doesn't over-explain. Sharp thesis. Strategic rationale. Lived proof.",
            quote:"\"I don't need to build a killer product overnight, I just need to build a winning product.\"",
            body1:"Huang's most famous idea sounds simple. But it's structured.",
            body2:"Point: \"I just need to build a winning product.\" Reason: \"The goal of winning is so you can play again.\" Example: \"It's just like pinball — play well enough to get another game, and you could be there for a long time.\"",
            body3:"Said in 1993 — decades before the AI breakthrough that proved it true.",
            whyItWorks:"NVIDIA kept making bets and staying in the game until one breakthrough arrived: AI and accelerated computing. That single win transformed NVIDIA into one of the most valuable companies on earth. Sharp thesis. Strategic rationale. Lived proof.",
            technique:"Lead with your point — don't build to it. Then give your reason in one sentence. Then make it concrete with a real example or analogy. Stop there.",
            lesson:"PRE isn't a template — it's how clear thinkers communicate. Your point tells people where to look. Your reason tells them why it matters. Your example makes it stick.",
          },
          { id:"indra", img:"/d5-indra.png", name:"Indra Nooyi", superpower:"Performance With Purpose",
            superpowerText:"Big belief. Clear reason. Concrete execution.",
            summary:"Two decades leading PepsiCo — structured the same way every time.",
            quote:"\"Performance must be married with purpose.\"",
            body1:"Nooyi ran one of the world's largest companies for 12 years. She led with structure.",
            body2:"Point: \"Performance must be married with purpose.\" Reason: \"The world is changing — consumers, governments, society.\" Example: \"At PepsiCo we've transformed our portfolio, reducing sugar, sodium and saturated fat, while investing in sustainability and our people.\"",
            body3:"She didn't leave it as philosophy — she operationalised it.",
            whyItWorks:"Point then reason then example. That's why she feels persuasive, intelligent, and trustworthy. Every statement is accountable to the next. Nothing floats without support.",
            technique:"Start with your belief — not the context, not the background. One sentence. Then say why the world demands it. Then show what you did about it.",
            lesson:"Structured communication isn't just clear — it's credible. When your point leads to your reason leads to your example, people trust your thinking.",
          },
        ];
        let d5ExObs = {}; try { d5ExObs = JSON.parse(localStorage.getItem('d5ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>PRE in Action</h2>
            <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:20}}>Two world-class leaders who use PRE every time — whether they name it or not.</p>
            {D5_EDITORIAL.map(card=>{
              const open = d5MobCard===card.id;
              const obs = d5ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:`0.5px solid ${open?"rgba(200,164,106,0.4)":T2.border}`,marginBottom:16,background:T2.surface,transition:"border-color 0.25s"}}>
                  {!open && (
                    <div style={{height:240,overflow:"hidden",position:"relative",cursor:"pointer"}}
                      onClick={()=>{
                        setD5MobCard(card.id);
                        if (!d5ExObs[card.id]) { d5ExObs[card.id]=true; localStorage.setItem('d5ExObserved',JSON.stringify(d5ExObs)); }
                      }}>
                      <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",display:"block",objectFit:"cover",objectPosition:"center center"}}/>
                    </div>
                  )}
                  {!open && (
                    <div style={{padding:"8px 18px",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${obs?"#619164":"rgba(160,128,90,0.4)"}`,background:obs?"rgba(97,145,100,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.25s"}}>
                        {obs && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="#619164" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,fontWeight:obs?600:400,color:obs?"#619164":"rgba(160,128,90,0.6)",letterSpacing:"0.02em"}}>{obs?"Observed":"Mark as observed"}</span>
                    </div>
                  )}
                  <div style={{padding:"16px 18px 4px",cursor:"pointer"}}
                    onClick={()=>{
                      const next = open ? null : card.id;
                      setD5MobCard(next);
                      if (next && !d5ExObs[card.id]) { d5ExObs[card.id]=true; localStorage.setItem('d5ExObserved',JSON.stringify(d5ExObs)); }
                    }}>
                    <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,lineHeight:1.15,marginBottom:3}}>{card.name}</h3>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:8}}>{card.superpower}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:"0 0 12px"}}>{card.summary}</p>
                    <div style={{borderTop:"0.5px solid "+T2.border,paddingTop:10,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                          <span style={{fontSize:8,color:T.gold}}>✦</span>
                          <span style={{fontFamily:T.sans,fontSize:8,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.8px"}}>Superpower</span>
                        </div>
                        <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,fontWeight:300,margin:0}}>{card.superpowerText}</p>
                      </div>
                      <div style={{fontFamily:T.sans,fontSize:12,fontWeight:500,color:T2.text3,display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                        <span>{open?"Close":"Read"}</span>
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.25s"}}><path d="M3 6l5 5 5-5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div style={{padding:"0 18px 20px",animation:"fadeUp 0.3s ease both"}}>
                      <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:16}}>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 10px"}}>{card.body1}</p>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 10px"}}>{card.body2}</p>
                        <div style={{padding:"14px 18px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 10px"}}>
                          <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                        </div>
                        <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                        <div style={{marginBottom:12}}>
                          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Why It Works</div>
                          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                        </div>
                        <div style={{marginBottom:12}}>
                          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Make It Yours</div>
                          <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                        </div>
                        <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                          <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>AmplifyU Lesson</div>
                          <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        );
      })()}
       {isD2 && step==="Rehearsal" && (
        <>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Train Your Instrument</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Voice requires repetition. Work through each exercise then take the speed challenge.</p>
          <D2PracticeWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD2 && step==="Simulation" && (
        <>
          <D2SimWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD2 && step==="Theory" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:14}}>The 88 Keys</h2>
          <div style={{background:"rgba(247,243,236,0.7)",borderLeft:"3px solid "+T.gold,padding:"16px 20px",marginBottom:20,borderRadius:4}}>
            <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.35,margin:0,fontStyle:"italic"}}>"Your voice is a piano with 88 keys. You've been playing the same 5 your whole life."</p>
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
        </>
      )}
       {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD7 && !isD10 && !isD11 && !isD12 && !isD13 && !isD14 && step==="Insight" && (
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
       {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD7 && !isD10 && !isD11 && !isD12 && !isD13 && !isD14 && step==="Theory" && <TheoryCard day={lesson.day}/>}
       {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD7 && !isD10 && !isD11 && !isD12 && !isD13 && !isD14 && step==="Example" && (
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
       {isD5 && step==="Rehearsal" && (
        <>
          <D5PracticeWidget T={T} T2={T2} isDesktop={false} onSimulation={() => setIdx(STEPS.indexOf('Simulation'))}/>
        </>
      )}
      {isD5 && step==="Simulation" && (
        <>
          <D5SimWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD6 && step==="Insight" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Why Composure Wins</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Stay Calm Under Pressure</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Most people communicate well when conversations are easy. But leadership, trust, and reputation are often shaped in moments of tension.</p>
          <p style={{fontFamily:T.sans,fontSize:12,color:T.gold,lineHeight:1.5,fontWeight:500,marginBottom:14,letterSpacing:"0.02em"}}>Explore each card to learn more →</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {word:"Emotion",    sub:"Stress narrows thinking and makes reactive communication more likely.", bullets:["Composure keeps your thinking wide open when it matters most.","In high-pressure moments, the first thing to go is nuance — unless you've trained for composure."]},
              {word:"Perception", sub:"When others escalate, composure signals leadership.",                   bullets:["Calm in the room reads as confidence — and earns instant credibility.","The person who stays grounded when everyone else reacts is the one people look to."]},
              {word:"Influence",  sub:"Your emotional state affects everyone around you.",                     bullets:["Calm is contagious. The steadiest person shapes the entire dynamic.","Leadership presence is largely the ability to manage your own state so others can borrow your calm."]},
              {word:"Outcome",    sub:"Anyone can communicate well when things are easy.",                     bullets:["The conversations that define your career almost always happen under pressure.","High-stakes moments aren't where performance breaks — they're where character becomes visible."]},
            ].map((n,i)=>{
              const open=d6MobCard===("d6i"+i);
              return (
                <div key={i} onClick={()=>setD6MobCard(open?null:"d6i"+i)}
                  style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 10px":0}}>{n.sub}</p>
                  {open && (<div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                    {n.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/><p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p></div>))}
                  </div>)}
                </div>
              );
            })}
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
      {isD6 && step==="Example" && (()=>{
        const D6_EDITORIAL = [
          { id:"hamilton", img:"/d6-hamilton.png", imgPos:"center 50%", name:"Lewis Hamilton", superpower:"Master of Composure Under Pressure",
            superpowerText:"Calm when every reason says otherwise.",
            summary:"Seven world championships — and his most powerful moment was how he handled losing one.",
            quote:"\"Firstly, a big congratulations to Max.\"",
            body1:"Throughout his career, Hamilton has faced criticism, controversy, public scrutiny, and championship-defining setbacks while performing on one of the world's biggest stages.",
            body2:"Abu Dhabi 2021 — one lap from a record-breaking eighth world title. One of the most controversial endings in sporting history. With millions watching, his first public words were: \"Firstly, a big congratulations to Max.\" Extreme disappointment. Global audience. Massive controversy. Yet his first response was composure.",
            body3:"Elite communicators aren't naturally calm. They learn how to manage their reactions. Years later, Hamilton admitted he felt wronged — but also said he had found peace with it.",
            whyItWorks:"When everyone expects a reaction, composure is the most powerful response available. Hamilton's calm didn't signal indifference — it signalled control. That's what leadership looks like under the most intense public scrutiny imaginable.",
            technique:"Before responding in a high-pressure moment, give yourself one breath. Ask: what do I want people to remember about how I handled this? Respond to that — not to the emotion in the room.",
            lesson:"Emotional control is often most visible when you have every reason to lose it. Pressure doesn't create character. It reveals it.",
          },
          { id:"amal", img:"/d6-amal.png", imgPos:"center 50%", name:"Amal Clooney", superpower:"Master of Composure Under Pressure",
            superpowerText:"Every word chosen. Every sentence deliberate.",
            summary:"She argues the world's most consequential legal cases — calm, precise and measured when the stakes couldn't be higher.",
            quote:"\"Pressure rarely rewards the loudest voice. It rewards the clearest mind.\"",
            body1:"Amal Clooney argues some of the world's most consequential legal cases, where every sentence can influence justice, diplomacy and human lives.",
            body2:"Whether addressing international courts, questioning witnesses or speaking before world leaders, she remains calm, precise and measured — even when the stakes couldn't be higher.",
            body3:"Amal doesn't rush, interrupt or react emotionally. She relies on preparation, evidence and deliberate communication, allowing facts — not emotion — to carry the greatest weight.",
            whyItWorks:"Pressure rarely rewards the loudest voice. It rewards the clearest mind. When others escalate, composure signals leadership and earns instant credibility.",
            technique:"Slow your pace before answering. Respond to the question, not the emotion behind it. When pressure rises, focus on clear, deliberate language rather than filling the silence.",
            lesson:"Pressure doesn't demand more words. It demands better ones.",
          },
        ];
        let d6ExObs = {}; try { d6ExObs = JSON.parse(localStorage.getItem('d6ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Masters Under Pressure</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Two voices that stayed composed when everything was on the line.</p>
            {D6_EDITORIAL.map(card=>{
              const open = d6MobCard===card.id;
              const obs = d6ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,marginBottom:16,background:T2.surface}}>
                  {!open && <div style={{height:240,overflow:"hidden"}} onClick={()=>{ const next={...d6ExObs,[card.id]:true}; try{localStorage.setItem('d6ExObserved',JSON.stringify(next));}catch{} setD6MobCard(card.id); }}><img src={card.img} alt={card.name} style={{width:"100%",height:"auto",display:"block",objectFit:"cover",objectPosition:"center top"}}/></div>}
                  {!open && <div onClick={()=>{ const next={...d6ExObs,[card.id]:true}; try{localStorage.setItem('d6ExObserved',JSON.stringify(next));}catch{} setD6MobCard(card.id); }} style={{padding:"8px 14px",background:obs?"rgba(97,145,100,0.12)":"rgba(30,26,20,0.04)",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:obs?"rgba(97,145,100,1)":"rgba(160,128,90,0.7)",fontFamily:T.sans,fontWeight:500}}>{obs?"✓ Observed":"◉ Observed"}</span>
                  </div>}
                  <div style={{padding:"16px 16px 14px"}} onClick={()=>setD6MobCard(open?null:card.id)}>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:4}}>{card.superpower}</div>
                    <div style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,marginBottom:4}}>{card.name}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.55,fontWeight:300,margin:"0 0 10px"}}>{card.summary}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:2}}>✦ SUPERPOWER</div>
                        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>{card.superpowerText}</div>
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,color:T2.text3,fontWeight:400}}>{open?"Close":"Read →"}</span>
                    </div>
                  </div>
                  {open && <div style={{padding:"0 16px 20px",borderTop:"0.5px solid "+T2.border}}>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"14px 0 10px"}}>{card.body1}</p>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 12px"}}>{card.body2}</p>
                    <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 12px"}}>
                      <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                    </div>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14,marginBottom:12}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Why It Works</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                    </div>
                    <div style={{marginBottom:14}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Make It Yours</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                    </div>
                    <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>AmplifyU Lesson</div>
                      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                    </div>
                  </div>}
                </div>
              );
            })}
          </>
        );
      })()}
      {isD6 && step==="Rehearsal" && (
        <D6PracticeWidget T={T} T2={T2} isDesktop={false} onSimulation={() => setIdx(STEPS.indexOf('Simulation'))}/>
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
          <p style={{fontFamily:T.sans,fontSize:12,color:T.gold,lineHeight:1.5,fontWeight:500,marginBottom:14,letterSpacing:"0.02em"}}>Explore each card to learn more →</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {D11_FACTS.map((n,i)=>{
              const open=d11MobCard===("d11i"+i);
              return (
                <div key={i} onClick={()=>setD11MobCard(open?null:"d11i"+i)}
                  style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 10px":0}}>{n.sub}</p>
                  {open && (<div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                    {n.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/><p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p></div>))}
                  </div>)}
                </div>
              );
            })}
          </div>
          <p style={{fontFamily:T.sans,fontSize:14,color:T.gold,lineHeight:1.7,fontWeight:400,fontStyle:"italic",marginTop:8}}>Be your brand.</p>
        </>
      )}
      {isD11 && step==="Theory" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science of Personal Brand</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>The Halo Effect</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:14}}>When people notice one standout positive trait, they often assume other positive qualities must be true too.</p>
          <div style={{display:"flex",flexWrap:"nowrap",gap:6,marginBottom:14}}>
            {[["Clear","Intelligence"],["Calm","Competence"],["Confident","Capability"],["Warm","Trustworthiness"]].map(([s,r],i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 9px",background:T2.surface,borderRadius:20,border:"0.5px solid "+T2.border,flexShrink:0}}>
                <span style={{fontFamily:T.sans,fontSize:11,fontWeight:500,color:T2.text}}>{s}</span>
                <span style={{fontFamily:T.sans,fontSize:10,color:T.gold}}>→</span>
                <span style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold}}>{r}</span>
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
      {isD11 && step==="Example" && (()=>{
        const D11_EDITORIAL = [
          { id:"swift", img:"/d11-swift.png", imgPos:"center 40%", name:"Taylor Swift", superpower:"Master of Personal Brand",
            superpowerText:"Making people feel part of the journey.",
            summary:"She didn't just build a music career — she built one of the most valuable personal brands in the world by making people feel personally invested in her story.",
            quote:"\"People didn't just buy Taylor Swift's music. They bought into her journey.\"",
            body1:"Taylor Swift didn't just build a music career — she built one of the most valuable personal brands in the world by making people feel like they were part of her journey. From teenage country songwriter to global cultural icon, her brand evolved without losing its emotional core: authenticity, storytelling, reinvention, and direct connection with her audience.",
            body2:"Fans don't just consume her work. They feel personally invested in her story. Behind-the-scenes access, fan easter eggs, emotional honesty, long-form storytelling, meaningful audience interaction — every touchpoint was designed to reward attention and deepen connection.",
            body3:"Taylor made global fame feel personal. She openly shares heartbreak, ambition, growth, mistakes, reinvention, and vulnerability. People feel like they've grown alongside her. That's the most powerful form of personal branding: making your story feel like their story.",
            whyItWorks:"Exceptional personal brands don't just broadcast achievement — they invite people into a journey. When audiences feel emotionally invested in someone's story, they become advocates, not just fans. Taylor Swift understood this intuitively, building a brand on authenticity, emotional honesty, and consistent reinvention.",
            technique:"Before your next presentation or professional interaction, ask yourself: \"What part of my journey could I share that the audience would recognise in themselves?\" Vulnerability and honesty create connection faster than credentials ever will.",
            lesson:"People didn't just buy Taylor Swift's music. They bought into her journey. The strongest personal brands make people feel like they are part of the story — not just observers of it.",
          },
          { id:"disney", img:"/d11-disney.png", imgPos:"center 40%", name:"Disney", superpower:"Master of Brand Consistency",
            superpowerText:"100 years of one word: Magic.",
            summary:"Disney has spent a century staying true to one emotional promise across every format, generation, and medium — Magic, Wonder, and Imagination.",
            quote:"\"Disney didn't build a brand. They built a feeling — and then protected it for 100 years.\"",
            body1:"Disney has spent a century doing something most organisations never achieve: staying completely true to a brand identity across every format, generation, and medium. From Steamboat Willie in 1928 to Marvel, Pixar, and Star Wars today, every Disney product carries the same emotional promise — Magic, Wonder, and Imagination.",
            body2:"The brand has survived leadership changes, financial crises, the death of its founder, and a complete technological revolution. It did this by protecting its emotional core with ruthless consistency. The logo, the music, the storytelling structure, the feeling of walking through the gates — all of it reinforces one message: you are entering somewhere extraordinary.",
            body3:"Disney spent 100 years becoming associated with one word: Magic. Not entertainment. Not movies. Magic. The most powerful brands are known for one thing. The strongest personal brands work the same way.",
            whyItWorks:"Brand strength comes from consistency over time. Disney didn't reinvent itself every few years — it protected one emotional promise across a century of change. People trust what they see repeatedly, and connection deepens with every consistent interaction.",
            technique:"Identify the one word you want people to associate with you. Then audit every professional interaction — meetings, emails, presentations, conversations — and ask: \"Does this reinforce that word?\" Consistency is not boring. It's how trust is built.",
            lesson:"Disney didn't build a brand. They built a feeling — and then protected it for 100 years. Your personal brand is built the same way: one consistent interaction at a time.",
          },
        ];
        let d11ExObs = {}; try { d11ExObs = JSON.parse(localStorage.getItem('d11ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Iconic Brands. Intentional Choices.</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>A personal brand built by design — not by accident.</p>
            {D11_EDITORIAL.map(card=>{
              const open = d11MobCard===card.id;
              const obs = d11ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,marginBottom:16,background:T2.surface}}>
                  {!open && <div style={{height:240,overflow:"hidden"}} onClick={()=>{ const next={...d11ExObs,[card.id]:true}; try{localStorage.setItem('d11ExObserved',JSON.stringify(next));}catch{} setD11MobCard(card.id); }}><img src={card.img} alt={card.name} style={{width:"100%",height:"auto",display:"block",objectFit:"cover",objectPosition:"center top"}}/></div>}
                  {!open && <div onClick={()=>{ const next={...d11ExObs,[card.id]:true}; try{localStorage.setItem('d11ExObserved',JSON.stringify(next));}catch{} setD11MobCard(card.id); }} style={{padding:"8px 14px",background:obs?"rgba(97,145,100,0.12)":"rgba(30,26,20,0.04)",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:obs?"rgba(97,145,100,1)":"rgba(160,128,90,0.7)",fontFamily:T.sans,fontWeight:500}}>{obs?"✓ Observed":"◉ Observed"}</span>
                  </div>}
                  <div style={{padding:"16px 16px 14px"}} onClick={()=>setD11MobCard(open?null:card.id)}>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:4}}>{card.superpower}</div>
                    <div style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,marginBottom:4}}>{card.name}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.55,fontWeight:300,margin:"0 0 10px"}}>{card.summary}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:2}}>✦ SUPERPOWER</div>
                        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>{card.superpowerText}</div>
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,color:T2.text3,fontWeight:400}}>{open?"Close":"Read →"}</span>
                    </div>
                  </div>
                  {open && <div style={{padding:"0 16px 20px",borderTop:"0.5px solid "+T2.border}}>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"14px 0 10px"}}>{card.body1}</p>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 12px"}}>{card.body2}</p>
                    <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 12px"}}>
                      <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                    </div>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14,marginBottom:12}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Why It Works</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                    </div>
                    <div style={{marginBottom:14}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Make It Yours</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                    </div>
                    <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>AmplifyU Lesson</div>
                      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                    </div>
                  </div>}
                </div>
              );
            })}
          </>
        );
      })()}
      {isD11 && step==="Rehearsal" && (
        <>
          <D11PracticeWidget T={T} T2={T2} isDesktop={false} onWordsChange={setD11BrandWords} onSimulation={() => setIdx(STEPS.indexOf('Simulation'))}/>
        </>
      )}
      {isD11 && step==="Simulation" && (
        <>
          <D11SimWidget T={T} T2={T2} isDesktop={false} brandWords={d11BrandWords}/>
        </>
      )}
      {isD12 && step==="Insight" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Why Presence Matters</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>People don't just hear confidence. They see it.</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Body language shapes how communication feels — helping people feel more connected, engaged, and at ease.</p>
          <p style={{fontFamily:T.sans,fontSize:12,color:T.gold,lineHeight:1.5,fontWeight:500,marginBottom:14,letterSpacing:"0.02em"}}>Explore each card to learn more →</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {D12_FACTS.map((n,i)=>{
              const open=d12MobCard===("d12i"+i);
              return (
                <div key={i} onClick={()=>setD12MobCard(open?null:"d12i"+i)}
                  style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 10px":0}}>{n.sub}</p>
                  {open && (<div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                    {n.bullets.map((b,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/><p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p></div>))}
                  </div>)}
                </div>
              );
            })}
          </div>
          <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.6,fontWeight:400,fontStyle:"italic",marginTop:8}}>"Presence is how communication feels."</p>
        </>
      )}
      {isD12 && step==="Theory" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>Nonverbal Congruence</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:14}}>The brain constantly compares words with body language — when they align, communication feels more authentic and clear.</p>
          <div style={{padding:"14px 16px",background:T2.surface,borderRadius:4,borderLeft:"2px solid "+T.gold,marginBottom:16}}>
            <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>"When communication feels safe, the brain becomes more open to the message."</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {[
              {title:"Thin Slicing",      body:"The brain forms rapid impressions from nonverbal cues before language is fully processed."},
              {title:"Visual Processing", body:"The brain processes visual signals faster than spoken words."},
              {title:"Gesture & Memory",  body:"Purposeful gestures improve listener comprehension and information retention."},
              {title:"Trust & Congruence",body:"Communication feels more believable when verbal and nonverbal signals align consistently."},
            ].map((c,i)=>(
              <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{c.title}</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:400,margin:0}}>{c.body}</p>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.6,fontStyle:"italic",marginTop:4}}>"The body helps people understand the message."</p>
        </>
      )}
      {isD12 && step==="Example" && (()=>{
        const D12_EDITORIAL = [
          { id:"obama", img:"/d12-obama.png", imgPos:"center 50%", name:"Michelle Obama", superpower:"Master of Warm Presence",
            superpowerText:"Making every room feel smaller.",
            summary:"Whether speaking to thousands or having a one-to-one conversation, her body language projects warmth, confidence, and authenticity — before she says a word.",
            quote:"\"Presence isn't about commanding attention — it's about creating connection.\"",
            body1:"Michelle Obama has a way of making every room feel smaller. Whether speaking to thousands of people or having a one-to-one conversation, her body language projects warmth, confidence, and authenticity.",
            body2:"Her open posture, genuine smile, and natural gestures make people feel at ease before she even says a word. She reminds us that presence isn't about commanding attention — it's about creating connection.",
            body3:"People decide how they feel about you long before they've analysed your words. Open body language, steady eye contact, and relaxed movement signal confidence, trust, and approachability. When your non-verbal signals match your message, people are far more likely to believe and remember you.",
            whyItWorks:"People decide how they feel about you long before they've analysed your words. Open body language, steady eye contact, and relaxed movement signal confidence, trust, and approachability. When your non-verbal signals match your message, people are far more likely to believe and remember you.",
            technique:"Before your next conversation or presentation, check your posture before your script. Stand tall, relax your shoulders, keep your hands open, and make eye contact before you begin speaking. Let your body communicate confidence before your voice does.",
            lesson:"Your body is always communicating — even when you're silent. Great communicators understand that influence isn't just about what you say; it's about how you make people feel the moment you walk into the room. When your words and body language are aligned, your presence becomes your greatest strength.",
          },
          { id:"jobs", img:"/d12-jobs.png", imgPos:"center 40%", name:"Steve Jobs", superpower:"Master of Purposeful Presence",
            superpowerText:"When every movement has purpose, every message carries more weight.",
            summary:"On stage, he used purposeful movement, comfortable pauses, and simple gestures to keep the audience focused on the message — not the speaker.",
            quote:"\"Confident body language creates clarity. Calm presence made complex ideas feel simple and memorable.\"",
            body1:"Steve Jobs understood that powerful presentations aren't just about great ideas — they're about how those ideas are delivered. On stage, he used purposeful movement, comfortable pauses, and simple gestures to keep the audience focused on the message rather than the speaker.",
            body2:"He proved that confidence doesn't need to be loud to be influential. His philosophy was simple: when every movement has purpose, every message carries more weight.",
            body3:"The next time you're presenting, resist the urge to fill every silence or pace constantly. Stand still to emphasise an important point, use deliberate gestures rather than constant movement, and allow pauses to give your audience time to think.",
            whyItWorks:"Confident body language creates clarity. By eliminating unnecessary movement and using pauses deliberately, Jobs directed the audience's attention exactly where he wanted it. His calm presence made complex ideas feel simple and memorable.",
            technique:"The next time you're presenting, resist the urge to fill every silence or pace constantly. Stand still to emphasise an important point, use deliberate gestures rather than constant movement, and allow pauses to give your audience time to think.",
            lesson:"Your presence is shaped as much by what you don't do as what you do. Purposeful movement, calm posture, and intentional pauses communicate confidence before you've even finished your first sentence. Sometimes the most powerful body language is knowing when to stand still.",
          },
        ];
        let d12ExObs = {}; try { d12ExObs = JSON.parse(localStorage.getItem('d12ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Presence in Action</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Two communicators who prove that how you carry yourself speaks louder than words.</p>
            {D12_EDITORIAL.map(card=>{
              const open = d12MobCard===card.id;
              const obs = d12ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,marginBottom:16,background:T2.surface}}>
                  {!open && <div style={{height:240,overflow:"hidden"}} onClick={()=>{ const next={...d12ExObs,[card.id]:true}; try{localStorage.setItem('d12ExObserved',JSON.stringify(next));}catch{} setD12MobCard(card.id); }}><img src={card.img} alt={card.name} style={{width:"100%",height:"auto",display:"block",objectFit:"cover",objectPosition:"center top"}}/></div>}
                  {!open && <div onClick={()=>{ const next={...d12ExObs,[card.id]:true}; try{localStorage.setItem('d12ExObserved',JSON.stringify(next));}catch{} setD12MobCard(card.id); }} style={{padding:"8px 14px",background:obs?"rgba(97,145,100,0.12)":"rgba(30,26,20,0.04)",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:obs?"rgba(97,145,100,1)":"rgba(160,128,90,0.7)",fontFamily:T.sans,fontWeight:500}}>{obs?"✓ Observed":"◉ Observed"}</span>
                  </div>}
                  <div style={{padding:"16px 16px 14px"}} onClick={()=>setD12MobCard(open?null:card.id)}>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:4}}>{card.superpower}</div>
                    <div style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,marginBottom:4}}>{card.name}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.55,fontWeight:300,margin:"0 0 10px"}}>{card.summary}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:2}}>✦ SUPERPOWER</div>
                        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>{card.superpowerText}</div>
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,color:T2.text3,fontWeight:400}}>{open?"Close":"Read →"}</span>
                    </div>
                  </div>
                  {open && <div style={{padding:"0 16px 20px",borderTop:"0.5px solid "+T2.border}}>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"14px 0 10px"}}>{card.body1}</p>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 12px"}}>{card.body2}</p>
                    <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 12px"}}>
                      <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                    </div>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14,marginBottom:12}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Why It Works</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                    </div>
                    <div style={{marginBottom:14}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Make It Yours</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                    </div>
                    <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>AmplifyU Lesson</div>
                      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                    </div>
                  </div>}
                </div>
              );
            })}
          </>
        );
      })()}
      {isD12 && step==="Rehearsal" && (
        <>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>The Presence Challenge</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Seven rounds building gestures, posture, eye contact, expression, and grounded energy.</p>
          <D12PracticeWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD12 && step==="Simulation" && (
        <>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Presence is Visible</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Record yourself. Review your presence. Receive personalised coaching on how you communicate physically.</p>
          <D12SimWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD7 && !isD10 && !isD11 && !isD12 && !isD13 && !isD14 && step==="Rehearsal" && (
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
       {!isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD7 && !isD10 && !isD11 && !isD12 && !isD13 && !isD14 && !isNT && !isD9 && step==="Simulation" && (
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
          <AICoachTab dayNumber={lesson.day} dayTitle={lesson.title} />
        </>
      )}
      {isD12 && step==="Review" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Review & Reflect</div>
          <h2 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:8}}>Strong Communication Is Experienced Physically As Well As Verbally</h2>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {[
              {title:"Presence Shapes Perception",   body:"Body language influences how communication feels before words are fully processed."},
              {title:"Gestures Improve Understanding",body:"Visual communication helps people process and remember ideas."},
              {title:"Calm Presence Creates Clarity", body:"Grounded movement helps communication feel calm, intentional, and engaging."},
              {title:"Congruence Builds Connection",  body:"Aligned words, tone, and body language help communication feel more emotionally clear and authentic."},
            ].map((c,i)=>(
              <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{c.title}</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:400,margin:0}}>{c.body}</p>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px",marginBottom:16}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Suggested Exploration</div>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,fontWeight:400,marginBottom:8}}>Watch: Keanu Reeves interviews · Kate Winslet interviews · Vinh Giang communication clips</p>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,fontWeight:400,margin:0}}>Observe: gestures · pauses · posture · facial expression · grounded energy · emotional congruence</p>
          </div>
          <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.6,fontStyle:"italic"}}>"Great communicators don't just speak clearly. They communicate presence."</p>
        </>
      )}
      {/* ── D13 Mobile Steps ──────────────────────────────────────────────── */}
      {/* ── D14 Mobile Steps ──────────────────────────────────────────────── */}
      {isD14 && step==="Insight" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Day 14 · The Final Chapter</div>
          <h2 style={{fontFamily:T.serif,fontSize:32,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Amplified.</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.7,fontWeight:400,marginBottom:14}}>Over the last 14 days, you've developed skills that many people spend years trying to master. Clarity. Voice. Storytelling. Presence. Brand. Exposure. These are not isolated techniques — they work together.</p>
          <p style={{fontFamily:T.sans,fontSize:12,color:T.gold,lineHeight:1.5,fontWeight:500,marginBottom:14}}>Tap each card to explore →</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            {D14_INSIGHT_CARDS.map((n,i)=>{
              const open=d12MobCard===("d14i"+i);
              return (
                <div key={i} onClick={()=>setD12MobCard(open?null:("d14i"+i))} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s,box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 10px":0}}>{n.sub}</p>
                  {open && <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                    {n.bullets.map((b,j)=><div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/><p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p></div>)}
                  </div>}
                </div>
              );
            })}
          </div>
          <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.6,fontStyle:"italic"}}>"Today is not about learning something new. It's about recognising how far you've come."</p>
        </>
      )}
      {isD14 && step==="Theory" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science Behind Growth</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12}}>The Competence–Confidence Loop</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,marginBottom:14}}>Many people believe confidence comes first. The reality is the opposite.</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",flexWrap:"wrap",gap:4,marginBottom:16,padding:"14px",background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border}}>
            {["Practice","Competence","Confidence","Action","Growth"].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{padding:"6px 12px",borderRadius:20,background:"rgba(138,158,132,0.12)",border:"0.5px solid rgba(138,158,132,0.3)",fontFamily:T.serif,fontSize:13,fontWeight:600,color:T.gold}}>{s}</span>
                {i<4 && <span style={{color:"rgba(138,158,132,0.5)",fontSize:12}}>→</span>}
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
            {[["Clarity","organising ideas"],["Storytelling","emotional connection"],["Presence","influencing perception"],["Brand & Exposure","making value visible"]].map(([mod,out],i)=>(
              <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"12px 14px"}}>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>When you learned <strong>{mod}</strong>, you practised {out}. Confidence followed.</p>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.6,fontStyle:"italic"}}>"Competence creates confidence. Confidence creates action. Action creates growth."</p>
        </>
      )}
      {isD14 && step==="Example" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Examples · Day 14</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Great Communicators Are Made, Not Born</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>None of them started where they finished. The same process is available to you.</p>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:14}}>
            {D14_EXAMPLES.map(card=>{
              const open=d12MobCard===("d14ex"+card.id);
              return (
                <div key={card.id} onClick={()=>setD12MobCard(open?null:("d14ex"+card.id))} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"16px",cursor:"pointer",transition:"border-color 0.2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>{card.headline}</div>
                      <div style={{fontFamily:T.serif,fontSize:17,fontWeight:600,color:T2.text,lineHeight:1.2}}>{card.name}</div>
                    </div>
                    <span style={{fontFamily:T.sans,fontSize:14,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:10,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  {open && <div style={{marginTop:12,paddingTop:12,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,marginBottom:12,fontWeight:300}}>{card.body}</p>
                    <div style={{padding:"10px 12px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                      <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>{card.lesson}</p>
                    </div>
                  </div>}
                </div>
              );
            })}
          </div>
        </>
      )}
      {isD14 && step==="Rehearsal" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Rehearsal · Day 14</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:12}}>Your Practice</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.7,fontWeight:400,marginBottom:20}}>Have one conversation today where you use everything: PRE structure, a SAR story that passes the 3-Point Test, a confident phrase about your ambition, and deliberate presence.</p>
          <D14PracticeWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD14 && step==="Simulation" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Simulation · Day 14</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Your Communication Blueprint</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Build the personalised communication system you'll use every day from here.</p>
          <D14SimWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD14 && step==="Review" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The AmplifyU Framework</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:14}}>Everything You've Built</h2>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {[["Clarity","People understand your ideas."],["Voice","People listen to your message."],["Storytelling","People remember your message."],["Presence","People notice your message."],["Brand","People associate you with something valuable."],["Exposure","The right people know who you are."]].map(([skill,desc],i)=>(
              <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"12px 14px",display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1px",flexShrink:0,paddingTop:1}}>{skill}</span>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,margin:0}}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{padding:"16px",background:"rgba(138,158,132,0.07)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.25)",marginBottom:14}}>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:"0 0 8px"}}>Together they create:</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["Understanding","Attention","Trust","Opportunity","Impact"].map((s,i)=><span key={i} style={{padding:"4px 10px",borderRadius:20,background:"rgba(138,158,132,0.12)",border:"0.5px solid rgba(138,158,132,0.3)",fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold}}>{s}</span>)}
            </div>
          </div>
          <div style={{padding:"20px",background:T2.surface,borderRadius:8,border:"0.5px solid rgba(138,158,132,0.3)",marginBottom:14}}>
            <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.65,margin:"0 0 12px"}}>You showed up. You practised. You reflected. You improved.</p>
            <p style={{fontFamily:T.sans,fontSize:14,color:T2.text3,lineHeight:1.65,margin:"0 0 12px"}}>You are not the communicator you were 14 days ago.</p>
            <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.5,fontStyle:"italic",margin:0}}>"Every conversation from this point forward is another opportunity to practise, improve, and amplify your impact."</p>
          </div>
          <div style={{padding:"16px",background:"rgba(138,158,132,0.07)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.25)"}}>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:"0 0 8px",fontWeight:500}}>Keep learning. Keep practising. Keep amplifying.</p>
            <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.5,fontStyle:"italic",margin:0}}>"Now go make your voice count."</p>
          </div>
        </>
      )}
      {isD13 && step==="Insight" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Career Multiplier</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Communication creates capability. Exposure creates opportunity.</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:14}}>The most talented professionals are not always the most successful. The ones who advance are the ones whose value is seen.</p>
          <p style={{fontFamily:T.sans,fontSize:12,color:T.gold,lineHeight:1.5,fontWeight:500,marginBottom:14,letterSpacing:"0.02em"}}>Tap each card to explore →</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            {D13_INSIGHT_CARDS.map((n,i)=>{
              const open=d12MobCard===("d13i"+i);
              return (
                <div key={i} onClick={()=>setD12MobCard(open?null:("d13i"+i))} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s,box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 10px":0}}>{n.sub}</p>
                  {open && <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                    {n.bullets.map((b,j)=><div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/><p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p></div>)}
                  </div>}
                </div>
              );
            })}
          </div>
          <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.6,fontStyle:"italic"}}>"Performance creates value. Brand creates reputation. Exposure creates opportunity."</p>
        </>
      )}
      {isD13 && step==="Theory" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Why visibility shapes careers</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:14}}>Four evidence-based principles that explain how exposure drives advancement.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            {D13_THEORY_CARDS.map((n,i)=>{
              const open=d12MobCard===("d13t"+i);
              return (
                <div key={i} onClick={()=>setD12MobCard(open?null:("d13t"+i))} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.15)"}`,borderRadius:8,padding:"14px",cursor:"pointer",transition:"border-color 0.2s,box-shadow 0.2s",boxShadow:open?"0 2px 12px rgba(138,158,132,0.2)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?8:4}}>
                    <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.gold,lineHeight:1.3,flex:1}}>{n.word}</div>
                    <span style={{fontFamily:T.sans,fontSize:16,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:6,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.5,fontWeight:400,margin:open?"0 0 10px":0}}>{n.sub}</p>
                  {open && <div style={{borderTop:"0.5px solid rgba(138,158,132,0.2)",paddingTop:10,display:"flex",flexDirection:"column",gap:7}}>
                    {n.bullets.map((b,j)=><div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:3,height:3,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5}}/><p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:400,margin:0}}>{b}</p></div>)}
                  </div>}
                </div>
              );
            })}
          </div>
        </>
      )}
      {isD13 && step==="Example" && (()=>{
        const D13_EDITORIAL = [
          { id:"dench", img:"/d13-dench.png", imgPos:"center 30%", name:"Dame Judi Dench", superpower:"Master of Reputation",
            superpowerText:"Her reputation became her greatest introduction.",
            summary:"Dame Judi Dench has spent more than six decades building one of the most respected reputations in theatre and film — and opportunities have followed her ever since.",
            quote:"\"The most valuable opportunities rarely come from applying online — they come through people who know your work and trust your character.\"",
            body1:"Dame Judi Dench has spent more than six decades building one of the most respected reputations in theatre and film. Directors, writers, and fellow actors consistently describe her as generous, prepared, and a joy to work with.",
            body2:"Opportunities haven't followed her simply because of her talent — they've followed her because people trust her and want to work with her again. Her reputation became her greatest introduction.",
            body3:"Exposure isn't just about being seen — it's about being remembered for the right reasons. Every interaction shapes your professional reputation. When people associate your name with excellence, kindness, and reliability, they become your advocates, recommending you long after the conversation has ended.",
            whyItWorks:"Exposure isn't just about being seen — it's about being remembered for the right reasons. Every interaction shapes your professional reputation. When people associate your name with excellence, kindness, and reliability, they become your advocates, recommending you long after the conversation has ended.",
            technique:"Treat every meeting, project, and conversation as an audition for your reputation. Deliver great work, be generous with your time, and leave people feeling respected. Ask yourself: \"If my name came up in a room I wasn't in, what would people say?\"",
            lesson:"The most valuable opportunities rarely come from applying online — they come through people who know your work and trust your character. Build a reputation that people are proud to recommend, because the strongest professional brand is the one that continues speaking for you when you're not in the room.",
          },
          { id:"diana", img:"/d13-diana.png", imgPos:"center center", name:"Princess Diana", superpower:"Master of Visibility",
            superpowerText:"Visibility has the greatest impact when it stops being about you.",
            summary:"She used public attention to change public conversations — bringing compassion to causes many had ignored.",
            quote:"\"Visibility has the greatest impact when it stops being about you and starts becoming about something bigger than yourself.\"",
            body1:"Princess Diana understood something few people ever master: visibility is a powerful tool when it's used to serve others. Long before social media, she recognised that every appearance, photograph, and conversation was an opportunity to shine a light on causes that might otherwise go unnoticed.",
            body2:"She didn't seek attention simply to be seen. She used public attention to change public conversations — bringing compassion, empathy, and humanity to issues that many people had ignored.",
            body3:"Being visible isn't about collecting followers or standing in the spotlight. It's about deciding what people will remember after they've looked your way. The most influential people use their platform to educate, inspire, and create opportunities for others — not simply to promote themselves.",
            whyItWorks:"Visibility creates opportunity, but purpose creates influence. People are naturally drawn to those who stand for something beyond personal success. When your expertise is paired with generosity, authenticity, and a genuine desire to help others, your visibility becomes meaningful rather than performative. The result isn't just recognition — it's trust, credibility, and lasting influence.",
            technique:"Think about what you want to become known for beyond your job title. Share ideas that help others. Celebrate your colleagues' successes. Speak about work that matters. Use your LinkedIn posts, presentations, conversations, and meetings to create value rather than simply seeking attention. Ask yourself: \"If more people noticed my work tomorrow, what message would I want them to remember?\"",
            lesson:"Exposure isn't the goal — impact is. The most respected professionals don't chase visibility for its own sake. They earn attention by consistently adding value and using their platform to elevate ideas, people, and causes that matter. Build a reputation for making others better, and your influence will continue growing long after the spotlight has moved on.",
          },
        ];
        let d13ExObs = {}; try { d13ExObs = JSON.parse(localStorage.getItem('d13ExObserved')||'{}'); } catch {}
        return (
          <>
            <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Communication Collection</div>
            <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Exposure in Action</h2>
            <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Reputations that open doors — built through trust, not just talent.</p>
            {D13_EDITORIAL.map(card=>{
              const open = d12MobCard===("d13ex"+card.id);
              const obs = d13ExObs[card.id];
              return (
                <div key={card.id} style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border,marginBottom:16,background:T2.surface}}>
                  {!open && <div style={{height:240,overflow:"hidden"}} onClick={()=>{ const next={...d13ExObs,[card.id]:true}; try{localStorage.setItem('d13ExObserved',JSON.stringify(next));}catch{} setD12MobCard("d13ex"+card.id); }}><img src={card.img} alt={card.name} style={{width:"100%",height:"auto",display:"block",objectFit:"cover",objectPosition:"center top"}}/></div>}
                  {!open && <div onClick={()=>{ const next={...d13ExObs,[card.id]:true}; try{localStorage.setItem('d13ExObserved',JSON.stringify(next));}catch{} setD12MobCard("d13ex"+card.id); }} style={{padding:"8px 14px",background:obs?"rgba(97,145,100,0.12)":"rgba(30,26,20,0.04)",borderBottom:"0.5px solid "+T2.border,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:obs?"rgba(97,145,100,1)":"rgba(160,128,90,0.7)",fontFamily:T.sans,fontWeight:500}}>{obs?"✓ Observed":"◉ Observed"}</span>
                  </div>}
                  <div style={{padding:"16px 16px 14px"}} onClick={()=>setD12MobCard(open?null:("d13ex"+card.id))}>
                    <div style={{fontFamily:T.sans,fontSize:9,fontWeight:600,color:"rgba(160,128,90,0.85)",textTransform:"uppercase",letterSpacing:"1.8px",marginBottom:4}}>{card.superpower}</div>
                    <div style={{fontFamily:T.serif,fontSize:22,fontWeight:400,color:T2.text,marginBottom:4}}>{card.name}</div>
                    <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.55,fontWeight:300,margin:"0 0 10px"}}>{card.summary}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontFamily:T.sans,fontSize:9,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:2}}>✦ SUPERPOWER</div>
                        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,fontWeight:300}}>{card.superpowerText}</div>
                      </div>
                      <span style={{fontFamily:T.sans,fontSize:12,color:T2.text3,fontWeight:400}}>{open?"Close":"Read →"}</span>
                    </div>
                  </div>
                  {open && <div style={{padding:"0 16px 20px",borderTop:"0.5px solid "+T2.border}}>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"14px 0 10px"}}>{card.body1}</p>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 12px"}}>{card.body2}</p>
                    <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold,margin:"0 0 12px"}}>
                      <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T2.text,lineHeight:1.55,margin:0}}>{card.quote}</p>
                    </div>
                    <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.75,fontWeight:300,margin:"0 0 16px"}}>{card.body3}</p>
                    <div style={{borderTop:"0.5px solid "+T2.divider,paddingTop:14,marginBottom:12}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Why It Works</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.whyItWorks}</p>
                    </div>
                    <div style={{marginBottom:14}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Make It Yours</div>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.7,fontWeight:300,margin:0}}>{card.technique}</p>
                    </div>
                    <div style={{padding:"14px 16px",background:"rgba(138,158,132,0.06)",borderRadius:6,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>AmplifyU Lesson</div>
                      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.65,margin:0}}>{card.lesson}</p>
                    </div>
                  </div>}
                </div>
              );
            })}
          </>
        );
      })()}
      {isD13 && step==="Rehearsal" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Rehearsal · Day 13</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:20}}>Make Your Value Visible</h2>
          <D13PracticeWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD13 && step==="Simulation" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Simulation · Day 13</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>The Promotion Room</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>You're not in the room. Find out what's being said — and build your strategy to change it.</p>
          <D13SimWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD13 && step==="Review" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Final Piece</div>
          <h2 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:8}}>Do the people who can change your future know what you're capable of?</h2>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {[
              {title:"Visibility amplifies value",  body:"Great work is valuable. Visible great work is powerful."},
              {title:"Opportunities move through people", body:"Relationships matter. Invest in them before you need them."},
              {title:"Communicate where you're going", body:"People cannot support ambitions they don't know about."},
              {title:"Exposure is not self-promotion", body:"It's making your value visible to the people who can act on it."},
              {title:"Your network is a multiplier", body:"Invest in it intentionally — before you need it, not after."},
            ].map((c,i)=>(
              <div key={i} style={{background:"rgba(237,232,223,0.6)",border:"1px solid rgba(138,158,132,0.15)",borderRadius:8,padding:"14px"}}>
                <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{c.title}</div>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:400,margin:0}}>{c.body}</p>
              </div>
            ))}
          </div>
          <div style={{padding:"16px",background:"rgba(138,158,132,0.07)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.25)",marginBottom:12}}>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,margin:"0 0 8px"}}>You have developed:</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
              {["Clarity","Voice","Storytelling","Presence","Brand","Exposure"].map((s,i)=><span key={i} style={{padding:"4px 10px",borderRadius:20,background:"rgba(138,158,132,0.12)",border:"0.5px solid rgba(138,158,132,0.3)",fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold}}>{s}</span>)}
            </div>
          </div>
          <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.6,fontStyle:"italic"}}>"Communication helps people understand you. Exposure helps opportunities find you."</p>
        </>
      )}
       {!isD13 && !isD14 && step==="Review" && (
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
           {/* What You Learned / Workplace Application tabs */}
          <div style={{borderTop:"1px solid rgba(138,158,132,0.25)",margin:"0 4px",paddingTop:16}}>
            <div style={{display:"flex",gap:0,borderBottom:"0.5px solid "+T2.border,marginBottom:16}}>
              {[{id:"learned",label:"What You Learned"},{id:"workplace",label:"Workplace Application"}].map(t=>(
                <button key={t.id} onClick={()=>setReviewTab(t.id)} style={{flex:1,padding:"10px 8px",border:"none",background:"transparent",fontFamily:T.sans,fontSize:13,fontWeight:reviewTab===t.id?600:400,color:reviewTab===t.id?T2.text:T2.text3,cursor:"pointer",borderBottom:reviewTab===t.id?"2px solid "+T.gold:"2px solid transparent",marginBottom:-1}}>{t.label}</button>
              ))}
            </div>
            {reviewTab==="learned" && REVIEW_BULLETS[lesson.day-1].map((b,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,padding:"12px 14px",background:T2.surface,borderRadius:6,border:"0.5px solid "+T2.border}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(138,158,132,0.12)",border:"1px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-3.5" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:300}}>{b}</span>
              </div>
            ))}
            {reviewTab==="workplace" && (
              <>
                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,marginBottom:12,fontWeight:300}}>How to put today's techniques to work immediately.</p>
                {(WORKPLACE_APPLICATION[lesson.day-1]||[]).map((b,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,padding:"12px 14px",background:T2.surface,borderRadius:6,border:"0.5px solid "+T2.border}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(138,158,132,0.1)",border:"1px solid rgba(138,158,132,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                      <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold}}>{i+1}</span>
                    </div>
                    <span style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.6,fontWeight:300}}>{b}</span>
                  </div>
                ))}
              </>
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
          <button
            onClick={()=>{
              if (isD1 && step==="Rehearsal" && d1NavFnRef.current) { d1NavFnRef.current(); }
              else if (isD3 && step==="Rehearsal" && d3NavFnRef.current) { d3NavFnRef.current(); }
              else if (isD4 && step==="Rehearsal" && d4NavFnRef.current) { d4NavFnRef.current(); }
              else { setIdx(i=>i+1); }
            }}
            disabled={(isD1 && step==="Rehearsal" && d1NavLabel===null)||(isD3 && step==="Rehearsal" && d3NavLabel===null)||(isD4 && step==="Rehearsal" && d4NavLabel===null)||(isD10 && step==="Rehearsal" && !d10SarDone)}
            style={{
              flex:1,
              padding:"18px 20px",
              borderRadius:14,
              border:"none",
              background: ((isD1 && step==="Rehearsal" && d1NavLabel===null)||(isD3 && step==="Rehearsal" && d3NavLabel===null)||(isD4 && step==="Rehearsal" && d4NavLabel===null)||(isD10 && step==="Rehearsal" && !d10SarDone))
                ? "rgba(44,36,22,0.18)"
                : idx===0
                  ? "linear-gradient(135deg,"+T.gold+" 0%,"+T.goldDark+" 100%)"
                  : "linear-gradient(135deg,"+T.navy+" 0%,#1E2D45 100%)",
              color:"white",
              fontSize:15,fontWeight:700,
              cursor: ((isD1 && step==="Rehearsal" && d1NavLabel===null)||(isD3 && step==="Rehearsal" && d3NavLabel===null)||(isD4 && step==="Rehearsal" && d4NavLabel===null)||(isD10 && step==="Rehearsal" && !d10SarDone)) ? "not-allowed" : "pointer",
              opacity: ((isD1 && step==="Rehearsal" && d1NavLabel===null)||(isD3 && step==="Rehearsal" && d3NavLabel===null)||(isD4 && step==="Rehearsal" && d4NavLabel===null)||(isD10 && step==="Rehearsal" && !d10SarDone)) ? 0.45 : 1,
              display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              boxShadow:idx===0?"0 4px 16px rgba(138,158,132,0.35)":"0 4px 16px rgba(17,28,46,0.3)",
              letterSpacing:"0.2px",
            }}>
            <span>{isD1 && step==="Rehearsal" && d1NavLabel
              ? d1NavLabel
              : isD3 && step==="Rehearsal" && d3NavLabel
                ? d3NavLabel
                : isD4 && step==="Rehearsal" && d4NavLabel
                  ? d4NavLabel
                  : isNT
                  ? (idx===1?"Continue":idx===2?"See examples":idx===3?"Rehearsal":NAV_LABELS[idx])
                  : isD7 && idx===1
                    ? "See your foundations"
                    : NAV_LABELS[idx]}</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
  {swipeHint && (
    <>
      <style>{`@keyframes au-swipe-hand{0%{transform:translateX(6px)}50%{transform:translateX(-10px)}100%{transform:translateX(6px)}}@keyframes au-hint-in{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes au-hint-out{from{opacity:1;transform:translateX(-50%) translateY(0)}to{opacity:0;transform:translateX(-50%) translateY(8px)}}`}</style>
      <div style={{position:"fixed",bottom:110,left:"50%",transform:"translateX(-50%)",zIndex:999,pointerEvents:"none",animation:swipeHintVisible?"au-hint-in 0.35s ease forwards":"au-hint-out 0.4s ease forwards"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(28,23,18,0.88)",backdropFilter:"blur(10px)",borderRadius:24,padding:"10px 18px 10px 14px",boxShadow:"0 4px 24px rgba(0,0,0,0.25)"}}>
          <span style={{animation:"au-swipe-hand 1.2s ease-in-out infinite",display:"inline-block",lineHeight:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,243,236,0.88)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-4 0v5"/>
              <path d="M14 10V4a2 2 0 0 0-4 0v6"/>
              <path d="M10 10.5a2 2 0 0 0-4 0V13"/>
              <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>
          </span>
          <span style={{fontFamily:"'Inter',-apple-system,sans-serif",fontSize:13,fontWeight:500,color:"rgba(247,243,236,0.92)",whiteSpace:"nowrap"}}>Swipe to move between steps</span>
        </div>
      </div>
    </>
  )}
  </>
);
}
