import { useState, useRef } from 'react';
import { T } from '../theme.js';
import { D10_FACTS, D3_FACTS, D3_PAUSE_REASONS, D4_FACTS, D1_CLARITY_FACTS_DATA, D11_FACTS, D11_EXAMPLES, D11_INGREDIENTS, D2_INSIGHT_CARDS, D9_FIVE_PS, D9_CARDS, NT_PIXAR, NT_NEURO, REVIEW_CLOSING, REVIEW_BULLETS, WORKPLACE_APPLICATION, FURTHER_READING, SESSION_STEPS, NAV_LABELS, LESSONS, D7_INSIGHT_CARDS, D12_FACTS, D12_EXAMPLES } from '../data.js';
import { getScenariosForDay } from '../utils.js';
import { DeliveryCoachWidget } from '../modules/Day9.jsx';
import { StoryBuilderWidget, StoryArchitectWidget } from '../modules/Day8.jsx';
import { CoachWidget } from '../modules/CoachWidget.jsx';
import { D10SimFeedback, D10MobileSAR, D10MobileSim } from '../modules/Day10.jsx';
import { D3SimFeedback, D3MobileSim, D3PracticeWidget, D3SimWidget } from '../modules/Day3.jsx';
import { D4SimFeedback, D4MobileSplit, D4MobileSim, D4PracticeWidget, D4SimWidget } from '../modules/Day4.jsx';
import { D1MobileJargonSwap, D1MobileSim, D1ClarityChallenge, D1SimWidget, D1SimFeedback } from '../modules/Day1.jsx';
import { D2PracticeWidget, D2SimWidget } from '../modules/Day2.jsx';
import { D5PracticeWidget, D5SimWidget } from '../modules/Day5.jsx';
import { D6PracticeWidget, D6SimWidget } from '../modules/Day6.jsx';
import { D11PracticeWidget, D11SimWidget } from '../modules/Day11.jsx';
import { D12PracticeWidget, D12SimWidget } from '../modules/Day12.jsx';
import { D7SimWidget } from '../modules/Day7.jsx';
import { DIAGRAMS, MODULE_ICONS } from '../diagrams.jsx';
import { Scene, OBScene } from '../scenes.jsx';
import { Timer } from '../components/Timer.jsx';
import { PBar } from '../components/NavComponents.jsx';
import { EditorialTheoryCard, TheoryCard } from './TheoryCards.jsx';

export function MobileSessionView({
  T2, step, STEPS, idx, setIdx, lesson, isDone, onComplete, onBack,
  isD1, isD2, isD3, isD4, isD5, isD6, isD7, isD9, isD10, isD11, isD12, isNT,
  selSc, setSelSc, exitConfirm, setExitConfirm,
  accordionOpen, setAccordionOpen, savedBooks, saveBook,
  setNtStory, d9Script, setD9Script,
  d1MobCard, setD1MobCard, d2MobCard, setD2MobCard,
  d3MobCard, setD3MobCard, d4MobCard, setD4MobCard,
  d5MobCard, setD5MobCard, d6MobCard, setD6MobCard,
  d7MobCard, setD7MobCard, d10MobCard, setD10MobCard, d11MobCard, setD11MobCard, d11FormulaCard, setD11FormulaCard, d12MobCard, setD12MobCard, ntMobCard, setNtMobCard,
  activeSc, scenarios, ambitionDraft, saveAmbition, ambitionSaved,
  roleId, activeRole, swipeRef, note, saveNote, checks, setChecks,
  ntOpenCard, setNtOpenCard, d9OpenCard, setD9OpenCard, ntStory,
}) {
  const [d7PracticePhase, setD7PracticePhase] = useState('intro');
  const [d7Habits, setD7Habits] = useState(new Set());
  const [d1NavLabel, setD1NavLabel] = useState(null);
  const d1NavFnRef = useRef(null);
  const [d3NavLabel, setD3NavLabel] = useState(null);
  const d3NavFnRef = useRef(null);
  const [d4NavLabel, setD4NavLabel] = useState(null);
  const d4NavFnRef = useRef(null);
  const [reviewTab, setReviewTab] = useState('learned');
  const [d10PracticePhase, setD10PracticePhase] = useState('intro');
  const [d10SarDone, setD10SarDone] = useState(false);

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
        // D5 Practice — PRE Card Sort cinematic dark panel
        if(isD5 && step==="Practice") return (
          <div style={{width:"100%",height:280,background:"#0E0B08",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 14px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 55%, transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>The PRE Card Sort™</div>
              <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:10}}>Sort the cards. Train the instinct.</p>
              <div style={{width:36,height:1,background:"rgba(200,180,140,0.4)",marginBottom:10}}/>
              <p style={{fontFamily:T.serif,fontSize:12,fontStyle:"italic",color:"rgba(245,239,230,0.5)",lineHeight:1.6,margin:0}}>Four scenarios. Three cards each. Point, Reason, Example.</p>
            </div>
          </div>
        );
        // D5 Simulation — PRE Challenge cinematic dark panel
        if(isD5 && step==="Simulation") return (
          <div style={{width:"100%",height:320,background:"#0E0B08",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 55%, transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>PRE Challenge</div>
              <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:14}}>Real questions. Real coaching.</p>
              <div style={{width:36,height:1,background:"rgba(200,180,140,0.4)",marginBottom:12}}/>
              <p style={{fontFamily:T.serif,fontSize:12,fontStyle:"italic",color:"rgba(245,239,230,0.5)",lineHeight:1.6,margin:0}}>Type your Point, Reason, and Example. Get instant AI feedback on each.</p>
            </div>
          </div>
        );
        // D4 Simulation — Breaking News Live cinematic dark panel
        if(isD4 && step==="Simulation") return (
          <div style={{width:"100%",height:320,background:"#0E0B08",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 55%, transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>🎥 Breaking News Live</div>
              <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:14}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:"#CC4444",flexShrink:0,marginTop:6,animation:"glowPulse 1s ease infinite",boxShadow:"0 0 8px rgba(204,68,68,0.55)"}}/>
                <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,margin:0}}>Report it live. Watch what your audience remembers.</p>
              </div>
              <div style={{width:40,height:1,background:"rgba(245,239,230,0.3)",marginBottom:12}}/>
              <p style={{fontFamily:T.serif,fontSize:12,fontStyle:"italic",color:"rgba(245,239,230,0.5)",lineHeight:1.6,margin:0}}>Sixty seconds. A breaking story. A producer cutting your time.</p>
            </div>
          </div>
        );
        // D1 Simulation — cinematic dark panel matching desktop left panel
        if(isD1 && step==="Simulation") return (
          <div style={{width:"100%",height:320,background:"#0A0804",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 35% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 55%, transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",top:20,right:20,zIndex:2,width:64,height:64,borderRadius:"50%",overflow:"hidden",border:"1.5px solid rgba(200,168,76,0.3)"}}>
              <img src="/badge-queen.jpg" alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10,fontFamily:T.sans}}>Simulation · Day 1</div>
              <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.15,marginBottom:12}}>Awareness is where every great communicator begins.</p>
              <div style={{padding:"8px 12px",background:"rgba(138,158,132,0.1)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.2)",marginBottom:10}}>
                <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:2}}>Today's Goal</div>
                <div style={{fontFamily:T.serif,fontSize:13,color:"rgba(245,239,230,0.85)"}}>Establish your clarity baseline.</div>
              </div>
            </div>
          </div>
        );
        // Simulation tab: dark cinematic panel for ALL modules
        if(step==="Simulation"){
          const SIM_HEADERS={
            1:{label:"SPEAK CLEARLY — IN ACTION",   heading:"Clarity under pressure. This is the real test."},
            2:{label:"REAL-WORLD VOICE COACHING",   heading:"This is where voice training becomes real."},
            3:{label:"FILLER-FREE — IN ACTION",     heading:"60 seconds. Zero fillers. Real stakes."},
            4:{label:"BREVITY — IN ACTION",         heading:"Short sentences. High stakes. Go."},
            5:{label:"PRE — IN ACTION",             heading:"Structure your thinking. Speak with precision."},
            6:{label:"AI CONVERSATION PREP",           heading:"Prepare for the conversations that matter most."},
            7:{label:"WEEK 1 MASTER CHALLENGE",      heading:"Teach It Forward. Prove what you know."},
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
          3:{Insight:"/day3-insight.jpg",Theory:"/day3-theory.jpg",Review:"/review-chair.jpg"},
          4:{Insight:"/day4-insight.jpg",Theory:"/millers-law.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
          5:{Insight:"/d5-insight.jpg",Theory:"/d5-theory.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
          6:{Insight:"/d6-insight.jpg",Theory:"/d6-theory.jpg",Practice:"/practice-bg.jpg",Review:"/review-chair.jpg"},
          7:{Insight:"/day7-insight.jpg",Theory:"/d7-habit-loop.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
          10:{Insight:"/day10-insight.jpg",Theory:"/performance-iceberg.jpg",Practice:null,Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
          11:{Insight:"/d11-insight.jpg",Theory:"/d11-theory.jpg",Practice:null,Review:"/review-chair.jpg"},
          12:{Insight:"/day10-insight.jpg",Theory:"/performance-iceberg.jpg",Practice:"/practice-bg.jpg",Simulation:"/day1-simulation.jpg",Review:"/review-chair.jpg"},
          8:{Insight:"/nt-insight.jpg","Theory 1":"/dual-coding-theory.jpg","Theory 2":"/nt-6beat-framework.jpg",Practice:"/practice-bg.jpg",Simulation:null,Review:"/review-chair.jpg"},
        };
        // D1 Practice — cinematic dark panel matching desktop left panel
        if(isD1 && step==="Practice") return (
          <div style={{width:"100%",height:320,background:"#0A0804",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 35% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 55%, transparent 80%)",pointerEvents:"none"}}/>
            {/* Badge — positioned top-right */}
            <div style={{position:"absolute",top:20,right:20,zIndex:2,width:72,height:72,borderRadius:"50%",overflow:"hidden",border:"1.5px solid rgba(200,168,76,0.3)"}}>
              <img src="/badge-queen.jpg" alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
            {/* Text at bottom */}
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>The Feynman Challenge™</div>
              <p style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:"#F5EFE6",lineHeight:1.1,marginBottom:14}}>If you can explain it simply, you understand it.</p>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{fontFamily:T.serif,fontSize:12,color:"rgba(245,239,230,0.45)"}}>Estimated time: <span style={{color:"rgba(245,239,230,0.65)",fontWeight:600}}>4 minutes</span></span>
              </div>
            </div>
          </div>
        );
        // D3 Practice — cinematic dark panel
        if(isD3 && step==="Practice") return (
          <div style={{width:"100%",height:280,background:"#0A0804",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 55%, transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>The Filler-Free Challenge™</div>
              <p style={{fontFamily:T.serif,fontSize:24,fontWeight:600,color:"#F5EFE6",lineHeight:1.15,marginBottom:14}}>Silence often sounds more confident than fillers.</p>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(245,239,230,0.6)" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="rgba(245,239,230,0.6)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{fontFamily:T.serif,fontSize:12,color:"rgba(245,239,230,0.7)"}}>Estimated time: <span style={{color:"#F5EFE6",fontWeight:600}}>3 minutes</span></span>
              </div>
            </div>
          </div>
        );
        // D11 Practice — cinematic dark panel
        if(isD11 && step==="Practice") return (
          <div style={{width:"100%",height:280,background:"#0A0804",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(138,158,132,0.08) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 55%, transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>Build Your Brand</div>
              <p style={{fontFamily:T.serif,fontSize:24,fontWeight:600,color:"#F5EFE6",lineHeight:1.15,marginBottom:14}}>Three exercises. Three layers of your brand architecture.</p>
              <div style={{width:36,height:1.5,background:"rgba(138,158,132,0.5)"}}/>
            </div>
          </div>
        );
        // NT Simulation — cinematic dark panel
        if(isNT && step==="Simulation") return (
          <div style={{width:"100%",height:280,background:"#0A0804",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 70% 20%, rgba(138,158,132,0.08) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 60%, transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>The Story Architect</div>
              <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:14}}>Build a presentation story in under 3 minutes.</p>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(245,239,230,0.6)" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="rgba(245,239,230,0.6)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{fontFamily:T.serif,fontSize:12,color:"rgba(245,239,230,0.7)"}}>Estimated time: <span style={{color:"#F5EFE6",fontWeight:600}}>3 minutes</span></span>
              </div>
            </div>
          </div>
        );
        // NT Practice — cinematic dark panel
        if(isNT && step==="Practice") return (
          <div style={{width:"100%",height:280,background:"#0A0804",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 55%, transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>The Pixar Framework Challenge™</div>
              <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:14}}>Turn a real experience into a story people remember.</p>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(245,239,230,0.6)" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="rgba(245,239,230,0.6)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{fontFamily:T.serif,fontSize:12,color:"rgba(245,239,230,0.7)"}}>Estimated time: <span style={{color:"#F5EFE6",fontWeight:600}}>5 minutes</span></span>
              </div>
            </div>
          </div>
        );
        // D10 Practice — cinematic dark panel
        if(isD10 && step==="Practice") return (
          <div style={{width:"100%",height:280,background:"#0A0804",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 55%, transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>The SAR Challenge™</div>
              <p style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:"#F5EFE6",lineHeight:1.2,marginBottom:14}}>Turn what you do into a story people remember.</p>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(245,239,230,0.6)" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="rgba(245,239,230,0.6)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{fontFamily:T.serif,fontSize:12,color:"rgba(245,239,230,0.7)"}}>Estimated time: <span style={{color:"#F5EFE6",fontWeight:600}}>5 minutes</span></span>
              </div>
            </div>
          </div>
        );
        // D4 Practice — cinematic dark panel
        if(isD4 && step==="Practice") return (
          <div style={{width:"100%",height:280,background:"#0A0804",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 14px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 55%, transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>The Short Sentences Challenge™</div>
              <p style={{fontFamily:T.serif,fontSize:24,fontWeight:600,color:"#F5EFE6",lineHeight:1.15,marginBottom:14}}>Short sentences give ideas space to land.</p>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{fontFamily:T.serif,fontSize:12,color:"rgba(245,239,230,0.45)"}}>Estimated time: <span style={{color:"rgba(245,239,230,0.65)",fontWeight:600}}>4 minutes</span></span>
              </div>
            </div>
          </div>
        );
        // D3 Simulation — cinematic dark panel
        if(isD3 && step==="Simulation") return (
          <div style={{width:"100%",height:280,background:"#0A0804",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"24px 24px 28px",boxSizing:"border-box",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(138,158,132,0.07) 0%, transparent 55%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.2) 55%, transparent 80%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>Simulation · Day 3</div>
              <p style={{fontFamily:T.serif,fontSize:24,fontWeight:600,color:"#F5EFE6",lineHeight:1.15,marginBottom:14}}>Speak without filling the silence.</p>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="rgba(245,239,230,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{fontFamily:T.serif,fontSize:12,color:"rgba(245,239,230,0.45)"}}>Teach me how to make your favourite meal.</span>
              </div>
            </div>
          </div>
        );
        const TABLET_IMGS={
          1:{Insight:{src:"/day1-insight-tablet.jpg"}},
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
        if(src) return <img src={src} alt="" style={{width:"100%",height:step==="Theory 2"?260:320,objectFit:useContainMob?"contain":"cover",objectPosition:(isD7 && step==="Theory")?"center 72%":step==="Practice"?"center 40%":step==="Example"?"center 30%":step==="Theory 2"?"center 55%":"center",display:"block",pointerEvents:"none",background:useContainMob?"#0E0B08":"transparent"}}/>;
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
          <div style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>The uncomfortable truth</div>
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
          <div style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,fontFamily:T.sans}}>The Science</div>
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
      {isD10 && step==="Example" && (
        <>
          <h2 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:8}}>Same Work. Different Career.</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,marginBottom:16}}>Three stories. One lesson.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {D10_EXAMPLES_DATA.map((ex)=>(
              <div key={ex.id} style={{borderRadius:8,overflow:"hidden",border:"0.5px solid "+T2.border}}
                onClick={()=>setD10MobCard(d10MobCard===ex.id?null:ex.id)}>
                <div style={{padding:"14px 16px",background:T2.surface,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T2.text,marginBottom:2}}>{ex.title}</div>
                    <div style={{fontFamily:T.sans,fontSize:12,color:T2.text3}}>{ex.sub}</div>
                  </div>
                  <span style={{color:d10MobCard===ex.id?T.gold:T2.text3,fontSize:16,marginLeft:10}}>{d10MobCard===ex.id?"▴":"▸"}</span>
                </div>
                {d10MobCard===ex.id && (
                  <div style={{padding:"12px 14px",background:T2.bg,borderTop:"0.5px solid "+T2.divider}}>
                    <div style={{padding:"10px 12px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                      <p style={{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>{ex.lesson}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {isD10 && step==="Practice" && d10PracticePhase==='intro' && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>Practice · Day 10</div>
          <h2 style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>The SAR Challenge™</h2>
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
      {isD10 && step==="Practice" && d10PracticePhase==='builder' && (
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
          <h2 style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:16}}>The Leadership Hot Seat</h2>
          <D10MobileSim/>
        </>
      )}
      {/* ── D7 Mobile Steps — Week 1 Review ─────────────────────────────────── */}
      {isD7 && step==="Insight" && (
        <>
          <div style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,fontFamily:T.sans}}>The wake-up call</div>
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
          <div style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,fontFamily:T.sans}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:6}}>The Habit Loop</h2>
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
          <div style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,fontFamily:T.sans}}>Your Week 1 Foundations</div>
          <h2 style={{fontFamily:T.serif,fontSize:21,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:8}}>Six habits. Seven days. Here's what you built.</h2>
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
      {isD7 && step==="Practice" && (()=>{

      const D7C=[
        {emoji:"🌍",name:"David Attenborough",role:"Master of Clarity",sub:"Known for explaining the most complex subjects in a way anyone can understand. His communication is calm, precise, and remarkably clear.",watchFor:["Pace and deliberate pacing","Simplicity of language","Precision in word choice","Storytelling"],connection:[["Day 1","Clarity"],["Day 4","Precision"]],reflection:"What makes his explanations so easy to follow?"},
        {emoji:"🎙️",name:"Steven Bartlett",role:"Master of Listening",sub:"Known for creating conversations that reveal profound insight. He speaks less than almost any other interviewer — and gets more because of it.",watchFor:["Active listening","Follow-up questions","Comfortable silence","Genuine curiosity"],connection:[["Day 3","Pause Principle"],["Day 6","High-Stakes Conversations"]],reflection:"How often does he speak versus listen? What does the silence do?"},
        {emoji:"⚖️",name:"Amal Clooney",role:"Master of Precision Under Pressure",sub:"Clarity, precision, and calm conviction — not volume or emotion. That is what makes her remarkable.",watchFor:["Structured arguments","Evidence-based communication","Deliberate language","Composed delivery"],connection:[["Day 4","Precision"],["Day 5","PRE Framework"],["Day 6","Composure"]],reflection:"How does she remain calm while discussing emotionally charged topics?"},
        {emoji:"🎤",name:"Simon Sinek",role:"Master of Structure",sub:"Known for turning complex ideas into memorable frameworks. Simple, organised, and impossible to forget.",watchFor:["Clear structure","Strategic repetition","Memorable phrases","Simple language"],connection:[["Day 1","Feynman Technique"],["Day 5","PRE Framework"]],reflection:"How does he make complex ideas feel simple?"},
      ];

        const cta={width:"100%",padding:"14px",borderRadius:4,border:"none",background:T.ink,color:T.bg,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:T.sans,minHeight:48};
        const phases=['intro','inspiration','reflect'];
        const phaseIdx=phases.indexOf(d7PracticePhase);
        const Dots=()=>(
          <div style={{display:"flex",gap:5}}>
            {phases.map((_,i)=><div key={i} style={{width:i<=phaseIdx?18:5,height:5,borderRadius:3,background:i<=phaseIdx?T.gold:T2.border,transition:"all 0.3s"}}/>)}
          </div>
        );

        if(d7PracticePhase==='intro') return (
          <>
            {/* YOUR MISSION */}
            <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:"16px 18px",marginBottom:12}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>Your Mission</div>
              <p style={{fontFamily:T.serif,fontSize:17,fontWeight:600,color:T.gold,lineHeight:1.25,margin:"0 0 10px"}}>Study a Master Communicator.</p>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {["Watch someone exceptional and study how they communicate.","Identify the habits that make them effective.","Bring one insight into your own conversations this week."].map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <span style={{color:T.gold,fontSize:12,flexShrink:0,marginTop:2}}>✦</span>
                    <span style={{fontFamily:T.serif,fontSize:15,color:T2.text,lineHeight:1.4}}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* THE CHALLENGE JOURNEY */}
            <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:"16px 18px",marginBottom:12}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:14}}>The Challenge Journey</div>
              <div style={{display:"flex",alignItems:"flex-start"}}>
                {[
                  {n:1,label:"Observe",icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><ellipse cx="11" cy="11" rx="8.5" ry="5.5" stroke={T.gold} strokeWidth="1.3"/><circle cx="11" cy="11" r="2.5" stroke={T.gold} strokeWidth="1.3"/></svg>},
                  {n:2,label:"Explore Masters",icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="9" cy="8" r="3.5" stroke={T.gold} strokeWidth="1.3"/><path d="M3 18c0-3 2.7-5 6-5s6 2 6 5" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/><path d="M16 7l4 4M16 11l4-4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
                  {n:3,label:"Reflect",icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 4h10a1 1 0 011 1v10a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z" stroke={T.gold} strokeWidth="1.3"/><path d="M8 8h6M8 11h4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
                ].map((r,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                      <div style={{width:40,height:40,borderRadius:"50%",border:"1.5px solid "+(i===0?T.gold:"rgba(138,158,132,0.35)"),background:i===0?"rgba(138,158,132,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:6}}>
                        {r.icon}
                      </div>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,marginBottom:2}}>Step {r.n}</div>
                      <div style={{fontFamily:T.sans,fontSize:11,fontWeight:500,color:"#A8998A",textAlign:"center",lineHeight:1.3,maxWidth:64}}>{r.label}</div>
                    </div>
                    {i<2&&<div style={{height:1,width:6,background:"rgba(138,158,132,0.25)",flexShrink:0,marginBottom:32}}/>}
                  </div>
                ))}
              </div>
            </div>

            {/* HOW YOU WIN */}
            <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:"16px 18px",marginBottom:20}}>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:4}}>How You Win</div>
              <p style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T.gold,lineHeight:1.3,marginBottom:12}}>You build the habit of:</p>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[
                  {label:"Observation",icon:<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><ellipse cx="11" cy="11" rx="8" ry="5" stroke={T.gold} strokeWidth="1.3"/><circle cx="11" cy="11" r="2" stroke={T.gold} strokeWidth="1.3"/></svg>},
                  {label:"Pattern Recognition",icon:<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M4 11h14M4 7h9M4 15h11" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
                  {label:"Self-Awareness",icon:<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="3.5" stroke={T.gold} strokeWidth="1.3"/><path d="M5 18c0-3 2.7-5 6-5s6 2 6 5" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/></svg>},
                  {label:"Deliberate Practice",icon:<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M11 3v4M11 15v4M3 11h4M15 11h4" stroke={T.gold} strokeWidth="1.3" strokeLinecap="round"/><circle cx="11" cy="11" r="3" stroke={T.gold} strokeWidth="1.3"/></svg>},
                ].map((s,i)=>(
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"10px 8px",background:T2.bg,borderRadius:6,border:"0.5px solid "+T2.border,flex:1,minWidth:60}}>
                    {s.icon}
                    <span style={{fontFamily:T.sans,fontSize:10,color:"#A8998A",fontWeight:400,textAlign:"center",lineHeight:1.3}}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={()=>setD7PracticePhase('inspiration')} style={cta}>Need Inspiration? →</button>
          </>
        );

        if(d7PracticePhase==='inspiration') return (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <button onClick={()=>setD7PracticePhase('intro')} style={{background:"none",border:"none",fontFamily:T.sans,fontSize:12,color:T2.text3,cursor:"pointer",padding:0}}>← Back</button>
              <Dots/>
            </div>
            <h2 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:8}}>Need Inspiration?</h2>
            <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.65,fontWeight:300,marginBottom:20}}>Four exceptional communicators. Expand a card, then watch them in action.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:4}}>
            {D7C.map((c,ci)=>{
              const open=d7MobCard===("d7c"+ci);
              return (
                <div key={ci} style={{background:T2.surface,border:`1px solid ${open?T.gold:T2.border}`,borderRadius:8,overflow:"hidden",cursor:"pointer",transition:"all 0.2s"}} onClick={()=>setD7MobCard(open?null:"d7c"+ci)}>
                  <div style={{padding:"16px 16px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:open?0:8}}>
                      <div style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T.gold,lineHeight:1.2,flex:1,paddingRight:8}}>{c.name}</div>
                      <span style={{fontFamily:T.sans,fontSize:14,color:open?T.gold:"rgba(138,158,132,0.5)",flexShrink:0,marginTop:3,display:"inline-block",transform:open?"rotate(90deg)":"none",transition:"transform 0.2s"}}>▸</span>
                    </div>
                    {!open&&<p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.4,margin:0,fontWeight:400}}>{c.role}</p>}
                  </div>
                  {open&&(
                    <div style={{padding:"0 16px 16px",borderTop:"0.5px solid "+T2.divider}}>
                      <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.65,margin:"10px 0 12px",fontWeight:300}}>{c.sub}</p>
                      <div style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",fontFamily:T.sans,marginBottom:8}}>Watch For</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                        {c.watchFor.map((w,wi)=><span key={wi} style={{padding:"4px 10px",borderRadius:20,border:"0.5px solid "+T2.border,fontFamily:T.sans,fontSize:11,color:T2.text,background:T2.bg}}>{w}</span>)}
                      </div>
                      <div style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",fontFamily:T.sans,marginBottom:6}}>AmplifyU Connection</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                        {c.connection.map(([day,principle],di)=>(
                          <div key={di} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",background:"rgba(138,158,132,0.08)",borderRadius:4}}>
                            <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold}}>{day}</span>
                            <span style={{fontFamily:T.sans,fontSize:10,color:T2.text3}}>{principle}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{padding:"10px 12px",background:"rgba(138,158,132,0.05)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                        <div style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",fontFamily:T.sans,marginBottom:4}}>Reflection Prompt</div>
                        <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>{c.reflection}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
            <button onClick={()=>{setD7MobCard(null);setD7PracticePhase('reflect');}} style={{...cta,marginTop:16}}>Begin Reflection →</button>
          </>
        );

        return (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <button onClick={()=>setD7PracticePhase('inspiration')} style={{background:"none",border:"none",fontFamily:T.sans,fontSize:12,color:T2.text3,cursor:"pointer",padding:0}}>← Back</button>
              <Dots/>
            </div>
            {/* Header card */}
            <div style={{background:T2.surface,borderRadius:8,border:"1px solid "+T2.border,padding:"18px 20px",marginBottom:10}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>Step 3 — Reflect</div>
              <p style={{fontFamily:T.serif,fontSize:18,color:T2.text,lineHeight:1.45,margin:0}}>After watching, capture what you noticed. The act of naming it makes it stick.</p>
            </div>

            {/* Principle tiles */}
            <div style={{background:T2.surface,borderRadius:8,border:"1px solid "+T2.border,padding:"18px 20px",marginBottom:10}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>Which AmplifyU principle did you notice?</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["Clarity","Pause","Precision","PRE Structure","Composure"].map(h=>{
                  const on=d7Habits.has(h);
                  return (
                    <button key={h} onClick={()=>{const s=new Set(d7Habits);on?s.delete(h):s.add(h);setD7Habits(s);}}
                      style={{flex:"1 1 80px",padding:"12px 8px",borderRadius:6,border:`1px solid ${on?T.gold:T2.border}`,background:on?"rgba(138,158,132,0.08)":"transparent",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:on?T.gold:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:on?4:0}}>{h}</div>
                      {on&&<div style={{fontFamily:T.sans,fontSize:10,color:T.gold}}>✓</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observation input */}
            <div style={{background:T2.surface,borderRadius:8,border:`1px solid ${T2.border}`,padding:"18px 20px",marginBottom:10}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>One thing I noticed was</div>
              <textarea placeholder="Write your observation here…"
                style={{width:"100%",border:"none",borderTop:"0.5px solid "+T2.divider,background:"transparent",fontFamily:T.serif,fontSize:16,color:T2.text,outline:"none",padding:"12px 0 0",lineHeight:1.6,resize:"none",height:76,boxSizing:"border-box"}}/>
            </div>

            {/* Practice input */}
            <div style={{background:T2.surface,borderRadius:8,border:`1px solid ${T2.border}`,padding:"18px 20px",marginBottom:14}}>
              <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>This week, I will practise</div>
              <textarea placeholder="Name one habit to develop…"
                style={{width:"100%",border:"none",borderTop:"0.5px solid "+T2.divider,background:"transparent",fontFamily:T.serif,fontSize:16,color:T2.text,outline:"none",padding:"12px 0 0",lineHeight:1.6,resize:"none",height:76,boxSizing:"border-box"}}/>
            </div>

            {/* Final Insight */}
            <div style={{padding:"20px 22px",background:T2.cardDark,borderRadius:8}}>
              <div style={{fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:12,fontFamily:T.sans}}>Final Insight</div>
              <p style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:"rgba(245,239,230,0.92)",lineHeight:1.45,margin:"0 0 10px"}}>The best communicators don't just communicate.</p>
              <p style={{fontFamily:T.sans,fontSize:13,color:"rgba(245,239,230,0.5)",lineHeight:1.7,margin:"0 0 14px",fontWeight:300}}>They observe, reflect, and continuously refine their craft.</p>
              <div style={{height:"0.5px",background:"rgba(245,239,230,0.08)",marginBottom:12}}/>
              <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T.gold,lineHeight:1.5,margin:0}}>Study the communication.</p>
            </div>
          </>
        );
      })()}

      {isD7 && step==="Simulation" && (
        <>
          <D7SimWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD7 && step==="Review" && (
        <>
          <div style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,fontFamily:T.sans}}>The Shift</div>
          <h2 style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:16}}>What changed this week.</h2>
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
          <div style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8,fontFamily:T.sans}}>Your Communication Identity</div>
          <h3 style={{fontFamily:T.serif,fontSize:18,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:12}}>Complete this statement.</h3>
          <CoachWidget lesson={lesson} scenario={"Generate a personalised one-line Communication Identity Statement. Ask the user to complete: 'This week I discovered I communicate best when I...' — then respond with a single, powerful sentence that names their communication authority. Example format: 'You communicate best when you slow down, lead with structure, and trust the pause — that's where your authority lives.' Save-worthy. Read before high-stakes conversations."}/>
          <div style={{height:"0.5px",background:T2.divider,margin:"20px 0"}}/>
          {/* 4 takeaway cards */}
          <div style={{fontSize:10,fontWeight:700,color:T2.text3,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12,fontFamily:T.sans}}>Your Four Takeaways</div>
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
        const D2_MOB_CARDS = [
          {id:"williams",name:"Robin Williams",headline:"The Master of Vocal Range",
           sub:"From the explosive Genie in Aladdin to the emotional stillness of Good Will Hunting — he transformed how a message felt using only his voice.",
           quote:'"No matter what people tell you, words and ideas can change the world."',
           roles:[
             {role:"The Genie", film:"Aladdin", voice:"Explosive, shape-shifting, relentless. He recorded over 16 hours of improvised audio. Every line a different character, accent, pace, pitch. The voice is the performance — pure kinetic energy with no ceiling."},
             {role:"Mrs Doubtfire", film:"Mrs Doubtfire", voice:"Warmth and precision in one. The character only works because the voice is completely believable — soft, maternal, unhurried. He didn't shout his way into the role. He listened his way in."},
             {role:"Sean Maguire", film:"Good Will Hunting", voice:"Stillness as a weapon. Long pauses. A voice barely above a murmur. The most emotionally powerful scenes have almost no volume. He trusted silence to carry the weight that words couldn't."},
           ],
           levers:[{k:"Pace",v:"Rapid-fire energy or slow emotional weight"},{k:"Pitch",v:"Playful highs to grounded seriousness"},{k:"Tone",v:"Humour, warmth, intensity, vulnerability"},{k:"Pauses",v:"Creating anticipation, emotion, and impact"}],
           lesson:"Range creates engagement. Contrast creates emotion. A flat voice fades. A dynamic voice keeps people listening.",
           challenge:{sentence:'"Ah... now this is where things get interesting."',modes:["Playful Genie energy","Thoughtful mentor","Urgent excitement","Calm inspiration"]}},
          {id:"streep",name:"Meryl Streep",headline:"The Master of Precision and Presence",
           sub:"Three iconic roles. Three completely different voices. Streep proves that the most powerful communicators don't get louder — they get more precise.",
           quote:'"Take your broken heart, make it into art."',
           roles:[
             {role:"Miranda Priestly", film:"The Devil Wears Prada", voice:"Barely above a whisper. Ice-cold authority. Every pause a threat. She never raises her voice — and that's exactly what makes her terrifying. Precision over volume."},
             {role:"Sophie Zawistowski", film:"Sophie's Choice", voice:"Raw, fractured, accent-laden grief. Her voice breaks where words can't. The emotional weight lives in the trembling pauses between sentences."},
             {role:"Margaret Thatcher", film:"The Iron Lady", voice:"Deliberate, elevated, sculpted. She researched Thatcher's vocal coaching and rebuilt the register from scratch. Every word placed with political intention."},
           ],
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
                        {card.roles && (
                          <div style={{marginBottom:12}}>
                            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Three Roles. Three Voices.</div>
                            {card.roles.map((r,i)=>(
                              <div key={i} style={{marginBottom:i<card.roles.length-1?10:0,paddingBottom:i<card.roles.length-1?10:0,borderBottom:i<card.roles.length-1?"0.5px solid rgba(138,158,132,0.15)":"none"}}>
                                <div style={{display:"flex",gap:6,alignItems:"baseline",marginBottom:3,flexWrap:"wrap"}}>
                                  <span style={{fontFamily:T.serif,fontSize:14,fontWeight:600,color:T2.text}}>{r.role}</span>
                                  <span style={{fontFamily:T.sans,fontSize:10,color:T2.text3,fontStyle:"italic"}}>{r.film}</span>
                                </div>
                                <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.6,margin:0,fontWeight:300}}>{r.voice}</p>
                              </div>
                            ))}
                          </div>
                        )}
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
          <img src="/day3-theory.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center 30%",display:"none"}}/>
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
                <span style={{fontFamily:T.sans,fontSize:12,color:d3MobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0,transition:"color 0.2s"}}>{d3MobCard===card.id?"▴":"▸"}</span>
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
          <D3PracticeWidget T={T} T2={T2} isDesktop={false} onNavLabel={setD3NavLabel} onNavFn={d3NavFnRef} onSimulation={()=>setIdx(STEPS.indexOf('Simulation'))}/>
        </>
      )}
      {isD3 && step==="Simulation" && (
        <>
          <h2 style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:16}}>Speak Without Filling the Silence</h2>
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
                <span style={{fontFamily:T.sans,fontSize:12,color:d4MobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0,transition:"color 0.2s"}}>{d4MobCard===card.id?"▴":"▸"}</span>
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
      {isD1 && step==="Theory" && (
        <>
          <img src="/feynman-technique.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center 20%",display:"none"}}/>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>The Science</div>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>The Feynman Technique</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:8}}>Richard Feynman won the Nobel Prize — and could explain quantum mechanics to a 12-year-old.</p>
          <div style={{background:"rgba(138,158,132,0.12)",borderLeft:"3px solid "+T.gold,padding:"20px 22px",marginBottom:20,borderRadius:4}}>
            <p style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T2.text,lineHeight:1.35,margin:0}}>If you can't explain it simply, you don't understand it well enough.</p>
          </div>
          <p style={{fontFamily:T.serif,fontSize:16,color:T2.text,lineHeight:1.4,fontWeight:600,marginBottom:10}}>His secret? The 4-step clarity loop:</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
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
          ].map(card=>(
            <div key={card.id} onClick={()=>setD1MobCard(d1MobCard===card.id?null:card.id)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${d1MobCard===card.id?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"20px",marginBottom:12,cursor:"pointer",transition:"border-color 0.2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3}}>{card.name}</div>
                <span style={{fontFamily:T.sans,fontSize:12,color:d1MobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0,transition:"color 0.2s"}}>{d1MobCard===card.id?"▴":"▸"}</span>
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
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Practice · Day 1</div>
          <h2 style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:20}}>The Feynman Challenge™</h2>
          <D1ClarityChallenge T={T} T2={T2} isDesktop={false} onSimulation={()=>setIdx(STEPS.indexOf('Simulation'))} onNavLabel={setD1NavLabel} onNavFn={d1NavFnRef}/>
        </>
      )}
      {isD1 && step==="Simulation" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Simulation · Day 1</div>
          <h2 style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:20}}>Clarity Check-In</h2>
          <D1SimWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
       {/* ── NT (Day 8) Mobile Steps ─────────────────────────────────────── */}
      {isNT && step==="Insight" && (
        <>
          <div style={{borderLeft:"3px solid "+T.gold,padding:"16px 20px",background:"rgba(247,243,236,0.7)",borderRadius:4,marginBottom:16}}>
            <p style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T2.text,lineHeight:1.35,margin:0}}>We are more engaged when we feel inside the story.</p>
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

          {/* Pixar Framework */}
          <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>The Pixar Framework</div>
          <h3 style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:10}}>The most replicable story structure ever invented.</h3>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Pixar used the same template for every film. It works because it mirrors how the human brain processes experience.</p>
          <div style={{display:"flex",flexDirection:"column",border:"0.5px solid rgba(138,158,132,0.25)",borderRadius:8,overflow:"hidden",marginBottom:16}}>
            {[
              {prompt:"Once upon a time…", desc:"Set the scene and introduce the protagonist."},
              {prompt:"Every day…",         desc:"Establish the normal world."},
              {prompt:"Until one day…",     desc:"Something disrupts the status quo."},
              {prompt:"Because of that…",   desc:"The chain of consequences begins."},
              {prompt:"Because of that…",   desc:"The stakes deepen."},
              {prompt:"Until finally…",     desc:"Resolution. What changed, and why it matters."},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"12px 14px",background:i%2===0?"rgba(237,232,223,0.5)":"transparent",borderBottom:i<5?"0.5px solid rgba(138,158,132,0.15)":"none"}}>
                <span style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:T.gold,minWidth:145,flexShrink:0}}>{s.prompt}</span>
                <p style={{fontFamily:T.sans,fontSize:12,color:T2.text3,lineHeight:1.5,margin:0}}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(138,158,132,0.06)",borderRadius:8,border:"0.5px solid rgba(138,158,132,0.25)",padding:"16px 18px"}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Applied Example</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {prompt:"Once upon a time…", text:"I thought confidence meant sounding polished."},
                {prompt:"Every day…",         text:"I overprepared for meetings — scripts, rehearsed answers, perfect sentences."},
                {prompt:"Until one day…",     text:"I completely froze mid-presentation."},
                {prompt:"Because of that…",   text:"I changed how I prepared — focusing on clarity, not performance."},
                {prompt:"Because of that…",   text:"I started listening more in meetings instead of waiting to speak."},
                {prompt:"Until finally…",     text:"People started genuinely listening to me."},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontFamily:T.serif,fontSize:13,fontWeight:600,color:T.gold,minWidth:145,flexShrink:0}}>{s.prompt}</span>
                  <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.55,margin:0}}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {isNT && step==="Example" && (
        <>
          <img src="/day1-lounge.jpg" alt="" style={{width:"100%",height:180,objectFit:"cover",objectPosition:"center",display:"none"}}/>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Storytelling in the Wild</h2>
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>Four stories. Four superpowers. Tap each card to explore.</p>
          {[
            {id:"janitor",name:"The NASA Janitor",preview:"JFK asked a janitor what he did at NASA. His answer created purpose in a single sentence.",quote:'"I\'m helping put a man on the moon."',why:"He wasn't describing his task — he was describing his mission. Great stories connect everyday actions to a bigger purpose.",technique:"Don't tell people what they're doing. Help them understand why it matters.",lesson:"Purpose — the most powerful story creates meaning, not just instruction."},
            {id:"surgeons",name:"The Two Surgeons",preview:"Two surgeons deliver the same message. One delivers data. The other paints a future.",quote:'"A year from now, you\'ll be playing football with your son."',why:"Same information. Completely different experience. One statistic, one story — the story creates hope where data creates anxiety.",technique:"Don't describe features. Describe outcomes. Paint the future your audience wants to live in.",lesson:"Hope — the best stories make people feel the result before it arrives."},
            {id:"jobs",name:"Steve Jobs and the Envelope",preview:"When introducing the MacBook Air, Jobs didn't lead with specs. He reached into a manila envelope.",quote:'"The world\'s thinnest notebook."',why:"The product wasn't the story. The reveal was. Curiosity is one of the most powerful forces in communication.",technique:"Don't reveal everything immediately. Create anticipation before delivering the answer.",lesson:"Curiosity — great stories hold something back until exactly the right moment."},
            {id:"obama_citizen",name:"Barack Obama and the Citizen",preview:"When discussing policy, Obama always started with a person. Not a policy. Not a statistic. A person.",quote:'"A mother struggling to pay bills. A worker supporting a family."',why:"The audience connected with the human story before hearing the argument. People care about people before they care about issues.",technique:"Start with a customer, colleague, or client before presenting the data.",lesson:"Connection — stories about people create empathy before logic."},
          ].map(card=>(
            <div key={card.id} onClick={()=>setNtMobCard(ntMobCard===card.id?null:card.id)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${ntMobCard===card.id?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"20px",marginBottom:12,cursor:"pointer",transition:"border-color 0.2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{fontFamily:T.serif,fontSize:20,fontWeight:600,color:T.gold,lineHeight:1.3}}>{card.name}</div>
                <span style={{fontFamily:T.sans,fontSize:12,color:ntMobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0,transition:"color 0.2s"}}>{ntMobCard===card.id?"▴":"▸"}</span>
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
          {/* Summary table */}
          <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,padding:"18px 20px",marginTop:4}}>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>The Four Storytelling Superpowers</div>
            {[
              {story:"The NASA Janitor",   power:"Purpose"},
              {story:"The Two Surgeons",   power:"Hope"},
              {story:"Steve Jobs",         power:"Curiosity"},
              {story:"Barack Obama",       power:"Connection"},
            ].map((row,i,arr)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<arr.length-1?"0.5px solid "+T2.border:"none"}}>
                <span style={{fontFamily:T.serif,fontSize:15,color:T2.text}}>{row.story}</span>
                <span style={{fontFamily:T.serif,fontSize:15,fontWeight:600,color:T.gold}}>{row.power}</span>
              </div>
            ))}
          </div>
          <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T.gold,lineHeight:1.6,marginTop:14,marginBottom:0}}>When people feel meaning, they remember the message.</p>
        </>
      )}
      {isNT && step==="Simulation" && (
        <StoryArchitectWidget T={T} T2={T2} isDesktop={false}/>
      )}
      {isNT && step==="Practice" && (
        <>
          <StoryBuilderWidget T={T} T2={T2} isDesktop={false} onSave={s=>{setNtStory(s);try{localStorage.setItem("au1_nt_story",s);}catch(_){}}} onSimulation={()=>setIdx(STEPS.indexOf('Simulation'))}/>
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
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:6}}>Structure is how you organise your thinking before you speak. PRE helps you do that: start with your point, explain why it matters, then bring it to life with an example.</p>
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
                <span style={{fontFamily:T.sans,fontSize:12,color:d5MobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0,transition:"color 0.2s"}}>{d5MobCard===card.id?"▴":"▸"}</span>
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
       {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD7 && !isD10 && !isD11 && step==="Insight" && (
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
       {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD7 && !isD10 && !isD11 && step==="Theory" && <TheoryCard day={lesson.day}/>}
       {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD7 && !isD10 && !isD11 && step==="Example" && (
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
          <D5PracticeWidget T={T} T2={T2} isDesktop={false}/>
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
                <span style={{fontFamily:T.sans,fontSize:12,color:d6MobCard===card.id?T.gold:T2.text3,marginLeft:10,flexShrink:0}}>{d6MobCard===card.id?"▴":"▸"}</span>
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
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
            {[["Clear","Intelligence"],["Calm","Competence"],["Stylish","Success"],["Confident","Capability"],["Warm","Trustworthiness"]].map(([s,r],i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:T2.surface,borderRadius:20,border:"0.5px solid "+T2.border}}>
                <span style={{fontFamily:T.sans,fontSize:12,fontWeight:500,color:T2.text}}>{s}</span>
                <span style={{fontFamily:T.sans,fontSize:11,color:T.gold}}>→</span>
                <span style={{fontFamily:T.sans,fontSize:12,fontWeight:600,color:T.gold}}>{r}</span>
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
          <p style={{fontFamily:T.sans,fontSize:15,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>A personal brand built by design — not by accident.</p>
          <div style={{display:"flex",flexDirection:"column",gap:24}}>
            {D11_EXAMPLES.map(card=>{
              const open = d11MobCard===card.id;
              return (
                <div key={card.id} style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{background:T2.surface,border:`1px solid ${open?"rgba(138,158,132,0.4)":T2.border}`,borderRadius:8,overflow:"hidden",transition:"border-color 0.2s"}}>
                    <div onClick={()=>setD11MobCard(open?null:card.id)} style={{padding:"20px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:T.serif,fontSize:22,fontWeight:600,color:T2.text,lineHeight:1.2,marginBottom:3}}>{card.name}</div>
                        <div style={{fontFamily:T.sans,fontSize:11,color:T2.text3,marginBottom:8,fontWeight:300}}>{card.role}</div>
                        <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px"}}>{card.headline}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:12,flexShrink:0,paddingTop:2}}>
                        <span style={{fontFamily:T.sans,fontSize:12,color:T2.text3,fontWeight:300}}>{open?"Close":"Read more"}</span>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}><path d="M3 6l5 5 5-5" stroke={T2.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                    {open && (
                      <div style={{padding:"0 20px 20px",borderTop:"0.5px solid "+T2.border}}>
                        <p style={{fontFamily:T.sans,fontSize:14,color:T2.text,lineHeight:1.7,fontWeight:300,margin:"16px 0 14px"}}>{card.body}</p>
                        <div style={{padding:"14px 16px",background:T2.bg,borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                          <p style={{fontFamily:T.serif,fontSize:15,fontStyle:"italic",color:T.gold,lineHeight:1.6,margin:0}}>{card.lesson}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{background:T2.surface,borderRadius:8,border:"0.5px solid "+T2.border,overflow:"hidden"}}>
                    <div onClick={()=>setD11FormulaCard(d11FormulaCard===card.id?null:card.id)} style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
                      <div style={{fontFamily:T.sans,fontSize:10,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px"}}>How they map to the Brand Formula</div>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{transform:d11FormulaCard===card.id?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0,marginLeft:12}}><path d="M3 6l5 5 5-5" stroke={T.gold} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    {d11FormulaCard===card.id && (
                      <div style={{padding:"0 20px 20px",borderTop:"0.5px solid "+T2.border}}>
                        <div style={{marginTop:16}}>
                          {card.ingredients.map((ing,i)=>(
                            <div key={i} style={{display:"flex",gap:10,paddingBottom:i<card.ingredients.length-1?12:0,marginBottom:i<card.ingredients.length-1?12:0,borderBottom:i<card.ingredients.length-1?"0.5px solid "+T2.border:"none",alignItems:"flex-start"}}>
                              <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(138,158,132,0.12)",border:"1px solid rgba(138,158,132,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                                <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold}}>{i+1}</span>
                              </div>
                              <div style={{flex:1}}>
                                <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T2.text,marginBottom:3}}>{ing.n}</div>
                                <p style={{fontFamily:T.sans,fontSize:13,color:T2.text3,lineHeight:1.6,fontWeight:300,margin:0,marginBottom:ing.lesson?8:0}}>{ing.detail}</p>
                                {ing.lesson && (
                                  <div style={{padding:"9px 12px",background:"rgba(138,158,132,0.08)",borderRadius:4,borderLeft:"2px solid rgba(138,158,132,0.4)"}}>
                                    <span style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",display:"block",marginBottom:3}}>AmplifyU Lesson</span>
                                    <p style={{fontFamily:T.sans,fontSize:12,color:T2.text,lineHeight:1.6,fontWeight:400,fontStyle:"italic",margin:0}}>{ing.lesson}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {card.closing && (
                            <div style={{marginTop:16,padding:"16px",background:"rgba(138,158,132,0.07)",borderRadius:6,border:"0.5px solid rgba(138,158,132,0.25)",textAlign:"center"}}>
                              <p style={{fontFamily:T.serif,fontSize:16,fontStyle:"italic",color:T2.text,lineHeight:1.6,margin:0}}>{card.closing}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {isD11 && step==="Practice" && (
        <>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:20}}>Build Your Brand</h2>
          <D11PracticeWidget T={T} T2={T2} isDesktop={false}/>
        </>
      )}
      {isD11 && step==="Simulation" && (
        <>
          <h2 style={{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T2.text,lineHeight:1.1,marginBottom:8}}>Your Brand Coach</h2>
          <p style={{fontFamily:T.sans,fontSize:14,color:"#A8998A",lineHeight:1.6,fontWeight:400,marginBottom:16}}>The fastest way to find the gap between how you're seen and how you want to be known — and close it.</p>
          <D11SimWidget T={T} T2={T2} isDesktop={false}/>
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
      {isD12 && step==="Example" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Presence in Action</div>
          <h2 style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:8}}>The Strongest Communicators Create Calm, Clarity, and Connection</h2>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            {D12_EXAMPLES.map(card=>{
              const open=d12MobCard===card.id;
              return (
                <div key={card.id} onClick={()=>setD12MobCard(open?null:card.id)} style={{background:"rgba(237,232,223,0.6)",border:`1px solid ${open?"rgba(138,158,132,0.4)":"rgba(138,158,132,0.18)"}`,borderRadius:8,padding:"16px",cursor:"pointer",transition:"border-color 0.2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:T.sans,fontSize:9,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:4}}>{card.name}</div>
                      <div style={{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T2.text,lineHeight:1.2}}>{card.headline}</div>
                    </div>
                    <span style={{fontFamily:T.sans,fontSize:14,color:open?T.gold:"rgba(138,158,132,0.7)",marginLeft:10,flexShrink:0}}>{open?"▴":"▸"}</span>
                  </div>
                  {open && (
                    <div style={{marginTop:12,paddingTop:12,borderTop:"0.5px solid rgba(138,158,132,0.2)"}}>
                      <p style={{fontFamily:T.sans,fontSize:13,color:T2.text,lineHeight:1.7,marginBottom:12,fontWeight:300}}>{card.body}</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                        {card.signals.map((s,i)=>(
                          <span key={i} style={{padding:"3px 10px",borderRadius:20,border:"0.5px solid rgba(138,158,132,0.3)",background:"rgba(138,158,132,0.06)",fontFamily:T.sans,fontSize:11,color:T2.text3}}>{s}</span>
                        ))}
                      </div>
                      <div style={{padding:"12px 14px",background:"rgba(138,158,132,0.06)",borderRadius:4,borderLeft:"2px solid "+T.gold}}>
                        <p style={{fontFamily:T.serif,fontSize:13,fontStyle:"italic",color:T2.text,lineHeight:1.5,margin:0}}>{card.lesson}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{fontFamily:T.serif,fontSize:15,color:T.gold,lineHeight:1.6,fontStyle:"italic"}}>"Great communicators create calm, clarity, and connection."</p>
        </>
      )}
      {isD12 && step==="Practice" && (
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
      {!isNT && !isD9 && !isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD7 && !isD10 && !isD11 && !isD12 && step==="Practice" && (
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
       {!isD1 && !isD2 && !isD3 && !isD4 && !isD5 && !isD6 && !isD7 && !isD11 && !isD12 && step==="Simulation" && (
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
      {isD12 && step==="Review" && (
        <>
          <div style={{fontFamily:T.sans,fontSize:11,fontWeight:600,color:T.gold,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>Review & Reflect</div>
          <h2 style={{fontFamily:T.serif,fontSize:26,fontWeight:600,color:T2.text,lineHeight:1.15,marginBottom:8}}>Strong Communication Is Experienced Physically As Well As Verbally</h2>
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
              if (isD1 && step==="Practice" && d1NavFnRef.current) { d1NavFnRef.current(); }
              else if (isD3 && step==="Practice" && d3NavFnRef.current) { d3NavFnRef.current(); }
              else if (isD4 && step==="Practice" && d4NavFnRef.current) { d4NavFnRef.current(); }
              else { setIdx(i=>i+1); }
            }}
            disabled={(isD1 && step==="Practice" && d1NavLabel===null)||(isD3 && step==="Practice" && d3NavLabel===null)||(isD4 && step==="Practice" && d4NavLabel===null)||(isD10 && step==="Practice" && !d10SarDone)}
            style={{
              flex:1,
              padding:"18px 20px",
              borderRadius:14,
              border:"none",
              background: ((isD1 && step==="Practice" && d1NavLabel===null)||(isD3 && step==="Practice" && d3NavLabel===null)||(isD4 && step==="Practice" && d4NavLabel===null)||(isD10 && step==="Practice" && !d10SarDone))
                ? "rgba(44,36,22,0.18)"
                : idx===0
                  ? "linear-gradient(135deg,"+T.gold+" 0%,"+T.goldDark+" 100%)"
                  : "linear-gradient(135deg,"+T.navy+" 0%,#1E2D45 100%)",
              color:"white",
              fontSize:15,fontWeight:700,
              cursor: ((isD1 && step==="Practice" && d1NavLabel===null)||(isD3 && step==="Practice" && d3NavLabel===null)||(isD4 && step==="Practice" && d4NavLabel===null)||(isD10 && step==="Practice" && !d10SarDone)) ? "not-allowed" : "pointer",
              opacity: ((isD1 && step==="Practice" && d1NavLabel===null)||(isD3 && step==="Practice" && d3NavLabel===null)||(isD4 && step==="Practice" && d4NavLabel===null)||(isD10 && step==="Practice" && !d10SarDone)) ? 0.45 : 1,
              display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              boxShadow:idx===0?"0 4px 16px rgba(138,158,132,0.35)":"0 4px 16px rgba(17,28,46,0.3)",
              letterSpacing:"0.2px",
            }}>
            <span>{isD1 && step==="Practice" && d1NavLabel
              ? d1NavLabel
              : isD3 && step==="Practice" && d3NavLabel
                ? d3NavLabel
                : isD4 && step==="Practice" && d4NavLabel
                  ? d4NavLabel
                  : isNT
                  ? (idx===1?"Continue":idx===2?"See examples":idx===3?"Practice":NAV_LABELS[idx])
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
);
}
