import { C, S, SI } from './theme.js';

export function D1() {
  const cx=140, cy=112, r=74, nr=27;
  const angles=[315,45,135,225];
  const 
nodes=angles.map(a=>({x:cx+r*Math.cos(a*Math.PI/180),y:cy+r*Math.sin(a*Math.PI/180)}));
  const labels=["Pick a\nconcept","Teach it\nsimply","Find the\ngaps","Simplify\n& repeat"];
  const cols=[C.gold,C.teal,C.red,"rgba(232,235,240,0.88)"];
  const
bgs=["rgba(138,158,132,0.18)","rgba(123,169,154,0.18)","rgba(196,122,122,0.18)","rgba(232,235,240,0.18)"];
  function arc(i) {
    const f=nodes[i], t=nodes[(i+1)%4];
    const dx=t.x-f.x, dy=t.y-f.y, d=Math.sqrt(dx*dx+dy*dy);
    const ux=dx/d, uy=dy/d, n=nr+5;
    return `M ${f.x+ux*n} ${f.y+uy*n} A ${r+16} ${r+16} 0 0 1 ${t.x-ux*n} 
${t.y-uy*n}`;
  }
  return (
    <svg width="280" height="222" viewBox="0 0 280 222" fill="none">
      <defs>
        {cols.map((c,i) => (
          <marker key={i} id={"d1m"+i} markerWidth="6" markerHeight="6" 
refX="5" refY="3" orient="auto">
            <path d="M0 0L6 3L0 6" fill="none" stroke={c} strokeWidth="1" 
strokeOpacity="0.7"/>
          </marker>
        ))}
      </defs>
      {[0,1,2,3].map(i => (
        <path key={i} d={arc(i)} stroke={cols[i]} strokeWidth="1.2" 
strokeOpacity="0.55" fill="none" markerEnd={"url(#d1m"+i+")"}/>
      ))}
      <path d={`M ${nodes[2].x+nr+4} ${nodes[2].y} Q ${nodes[2].x+56} 
${nodes[2].y+30} ${nodes[2].x+56} ${nodes[2].y+58}`} 
stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none" 
strokeDasharray="3 4"/>
      <text x={nodes[2].x+62} y={nodes[2].y+42} fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">NO GAPS</text>
      <text x={nodes[2].x+62} y={nodes[2].y+56} fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">DONE</text>
      {nodes.map((n,i) => (
        <g key={i}>
          <circle cx={n.x+1} cy={n.y+2} r={nr} fill="rgba(0,0,0,0.28)"/>
          <circle cx={n.x} cy={n.y} r={nr} fill={bgs[i]} stroke={cols[i]} 
strokeWidth="1.2" strokeOpacity="0.85"/>
          <text x={n.x} y={n.y-5} textAnchor="middle" fontSize="12" 
fontWeight="700" fontFamily="Georgia,serif" fill={cols[i]}>{i+1}</text>
          {labels[i].split("\n").map((l,li) => (
            <text key={li} x={n.x} y={n.y+6+li*10} textAnchor="middle"
fontSize="7.5" fontWeight="600" fontFamily="Inter,sans-serif"
fill="rgba(255,255,255,0.88)">{l}</text>
          ))}
        </g>
      ))}
      
{[{x:cx,y:nodes[0].y-14,l:"EXPLAIN"},{x:nodes[1].x+20,y:cy,l:"REVIEW"},{x:cx,y:nodes[2].y+14,l:"REFINE"},{x:nodes[3].x-20,y:cy,l:"REPEAT"}].map((lb,i) => (
        <text key={i} x={lb.x} y={lb.y} textAnchor="middle" fontSize="7"
fontFamily="Inter,sans-serif" fill="rgba(255,255,255,0.48)"
letterSpacing="0.8">{lb.l}</text>
      ))}
      <text x="0" y="214" fontSize="8" fill="rgba(255,255,255,0.62)"
fontFamily="Inter,sans-serif" fontStyle="italic">Simplicity is the
destination, not a shortcut.</text>
    </svg>
  );
}

// Narrative Transportation — Story Arc diagram
export function D_NT() {
  const pts = [
    {x:16,y:172,label:"Hook",sub:"Start with tension"},
    {x:68,y:136,label:"Character",sub:"Make it human"},
    {x:120,y:96,label:"Problem",sub:"What's at stake?"},
    {x:170,y:52,label:"Turning Point",sub:"What changed?"},
    {x:220,y:84,label:"Resolution",sub:"What happened?"},
    {x:268,y:116,label:"Meaning",sub:"Why it matters"},
  ];
  const path = `M${pts[0].x} ${pts[0].y} C42 160,90 110,${pts[2].x} ${pts[2].y} C142 85,155 58,${pts[3].x} ${pts[3].y} C186 46,210 78,${pts[4].x} ${pts[4].y} C238 90,252 110,${pts[5].x} ${pts[5].y}`;
  return (
    <svg width="284" height="200" viewBox="0 0 284 200" fill="none">
      <path d={path} stroke={C.gold} strokeWidth="1.8" strokeLinecap="round"/>
      {pts.map((p,i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={i===3?"rgba(138,158,132,0.35)":"rgba(183,154,107,0.2)"} stroke={i===3?C.teal:C.gold} strokeWidth="1.2"/>
          <text x={p.x} y={i<3||i===5?p.y-12:p.y+20} textAnchor="middle" fontSize="8.5" fontWeight="700" fontFamily="Inter,sans-serif" fill={i===3?C.teal:C.gold}>{p.label}</text>
          <text x={p.x} y={i<3||i===5?p.y-3:p.y+30} textAnchor="middle" fontSize="6.5" fontFamily="Inter,sans-serif" fill={C.dim}>{p.sub}</text>
        </g>
      ))}
      <text x="142" y="192" textAnchor="middle" fontSize="8.5" fontFamily="Georgia,serif" fontStyle="italic" fill="rgba(255,255,255,0.38)">No tension = no story.</text>
    </svg>
  );
}

// Day 9 — 5 Ps delivery diagram
export function D_D9() {
  const items = [
    { label:"Pace",       col:C.gold,  sub:"Slow down\nto speed up" },
    { label:"Pause",      col:C.teal,  sub:"Silence is\nyour power" },
    { label:"Presence",   col:"rgba(183,154,107,0.75)", sub:"Command\nthe room" },
    { label:"Projection", col:C.red,   sub:"Be heard\nwith clarity" },
    { label:"Precision",  col:C.green, sub:"Every word\ncounts" },
  ];
  const W=56, gap=4, total=items.length*(W+gap)-gap;
  return (
    <svg width={total} height="120" viewBox={`0 0 ${total} 120`} fill="none">
      {items.map((it,i) => {
        const x = i*(W+gap);
        const h = 55 + i*5;
        return (
          <g key={i}>
            <rect x={x} y={120-h} width={W} height={h} rx="2" fill={`rgba(${it.col===C.gold?"183,154,107":it.col===C.teal?"123,169,154":it.col===C.red?"196,122,122":it.col===C.green?"74,158,118":"183,154,107"},0.15)`} stroke={it.col} strokeWidth="1"/>
            <text x={x+W/2} y={120-h-6} textAnchor="middle" fontSize="9" fontWeight="700" fontFamily="Inter,sans-serif" fill={it.col}>{it.label}</text>
            {it.sub.split("\n").map((l,li) => (
              <text key={li} x={x+W/2} y={120-h+14+li*10} textAnchor="middle" fontSize="7" fontFamily="Inter,sans-serif" fill="rgba(255,255,255,0.55)">{l}</text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}




export function D2() {
  const bars = [{label:"Fast",w:46,cap:"Clear & slow",col:C.gold},{label:"Medium",w:112,cap:"Balanced",col:C.teal},{label:"Rushed",w:202,cap:"Overloaded",col:C.red}];
  return (
    <svg width="280" height="148" viewBox="0 0 280 148" fill="none">
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">COGNITIVE LOAD ON 
LISTENER</text>
      {bars.map((b,i) => (
        <g key={i} transform={"translate(0,"+(24+i*38)+")"}>
          <text x="0" y="14" fontSize="9" fontWeight="600" fill={C.white} 
fontFamily="Inter,sans-serif">{b.label}</text>
          <rect x="54" y="2" width={b.w} height="16" rx="1" 
fill="rgba(255,255,255,0.05)" stroke={b.col} strokeWidth="0.8" 
strokeOpacity="0.6"/>
          <rect x="54" y="2" width={b.w} height="16" rx="1" fill={b.col} 
fillOpacity="0.18"/>
          <text x={56+b.w} y="14" fontSize="8" fill={b.col} 
fontFamily="Inter,sans-serif" fontStyle="italic"> {b.cap}</text>
        </g>
      ))}
      <text x="0" y="142" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">Slower pace = more 
processing space for your message.</text>
    </svg>
  );
}

export function D3() {
  return (
    <svg width="280" height="154" viewBox="0 0 280 154" fill="none">
      <defs>
        <marker id="d3arr" markerWidth="6" markerHeight="6" refX="5" 
refY="3" orient="auto">
          <path d="M0 0L6 3L0 6" fill="none" stroke={C.red} 
strokeWidth="1" strokeOpacity="0.7"/>
        </marker>
      </defs>
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">AUTHORITY LEVEL</text>
      <rect x="0" y="20" width="260" height="11" rx="1" fill={C.faint} 
stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
      <rect x="0" y="20" width="222" height="11" rx="1" fill={C.gold} 
fillOpacity="0.55"/>
      <text x="226" y="30" fontSize="8" fill={C.gold} 
fontFamily="Inter,sans-serif">No fillers</text>
      <path d="M130 36 L130 55" stroke={C.red} strokeWidth="1.2" 
strokeDasharray="3 3" markerEnd="url(#d3arr)"/>
      <text x="135" y="50" fontSize="8" fill={C.red} 
fontFamily="Inter,sans-serif" fontStyle="italic">+ fillers</text>
      <rect x="0" y="61" width="260" height="11" rx="1" fill={C.faint}/>
      <rect x="0" y="61" width="110" height="11" rx="1" fill={C.red} 
fillOpacity="0.5"/>
      <text x="114" y="71" fontSize="8" fill={C.red} 
fontFamily="Inter,sans-serif">-22% competence rating</text>
      <text x="0" y="96" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">ALTERNATIVE</text>
      <rect x="0" y="104" width="260" height="11" rx="1" fill={C.faint}/>
      <text x="130" y="113" textAnchor="middle" fontSize="8" fill={C.gold} 
fontFamily="Inter,sans-serif" letterSpacing="1">deliberate pause</text>
      <text x="0" y="138" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">Silence signals thought. 
Fillers signal doubt.</text>
    </svg>
  );
}

export function D4() {
  const pts = [90,40,28,24,28,38,55,72,80,72,55,38,24,26,35,50,65];
  const W=255, H=95;
  const pd = pts.map((p,i) => (i===0?"M":"L")+(i/(pts.length-1)*W)+" "+(H-(p/100)*H)).join(" ");
  return (
    <svg width="280" height="164" viewBox="0 0 280 164" fill="none">
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">MEMORY RETENTION 
CURVE</text>
      <path d={pd+" L"+W+" "+H+" L0 "+H+" Z"} fill={C.gold} 
fillOpacity="0.06" transform="translate(0,18)"/>
      <path d={pd} stroke={C.gold} strokeWidth="1.5" fill="none" 
strokeOpacity="0.7" transform="translate(0,18)"/>
      <circle cx="0" cy={H-(pts[0]/100)*H+18} r="5" fill={C.gold} 
fillOpacity="0.9"/>
      <text x="6" y={H-(pts[0]/100)*H+22} fontSize="8" fill={C.gold} 
fontFamily="Inter,sans-serif">FIRST</text>
      <circle cx={W} cy={H-(pts[pts.length-1]/100)*H+18} r="5" 
fill={C.teal} fillOpacity="0.9"/>
      <text x={W-28} y={H-(pts[pts.length-1]/100)*H+10} fontSize="8" 
fill={C.teal} fontFamily="Inter,sans-serif">LAST</text>
      <text x={W/2-20} y={H-(pts[3]/100)*H+34} fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">MIDDLE</text>
      <text x={W/2-28} y={H-(pts[3]/100)*H+44} fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">(forgotten)</text>
      <line x1="0" y1={H+18} x2={W} y2={H+18} 
stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
      <text x="0" y={H+32} fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">Start</text>
      <text x={W-16} y={H+32} fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">End</text>
      <text x="0" y="148" fontSize="8" fill={C.gold} 
fontFamily="Inter,sans-serif" fontStyle="italic">Lead with your point. End 
with your point.</text>
      <text x="0" y="160" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">The middle is where 
messages go to die.</text>
    </svg>
  );
}

export function D5() {
  return (
    <svg width="280" height="152" viewBox="0 0 280 152" fill="none">
      <defs>
        <marker id="d5arr" markerWidth="6" markerHeight="6" refX="5" 
refY="3" orient="auto">
          <path d="M0 0L6 3L0 6" fill="none" stroke={C.teal} 
strokeWidth="1"/>
        </marker>
      </defs>
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">BREATH CYCLE 
4-2-6</text>
      {[{label:"Inhale",w:62,col:C.teal,op:0.4,count:"4 counts"},{label:"Hold",w:26,col:C.gold,op:0.3,count:"2 counts"},{label:"Exhale",w:92,col:C.gold,op:0.5,count:"6 counts"}].map((b,i) => (
        <g key={i} transform={"translate(0,"+(20+i*24)+")"}>
          <text x="0" y="14" fontSize="9" fontWeight="600" fill={C.white} 
fontFamily="Inter,sans-serif">{b.label}</text>
          <rect x="52" y="2" width={b.w} height="14" rx="1" 
fill={C.faint}/>
          <rect x="52" y="2" width={b.w} height="14" rx="1" fill={b.col} 
fillOpacity={b.op}/>
          <text x={56+b.w} y="13" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif"> {b.count}</text>
        </g>
      ))}
      <path d="M140 92 L140 108" stroke={C.teal} strokeWidth="1.2" 
markerEnd="url(#d5arr)"/>
      <text x="148" y="104" fontSize="8" fill={C.teal} 
fontFamily="Inter,sans-serif">activates vagus nerve</text>
      <rect x="0" y="114" width="260" height="18" rx="1" fill={C.faint}/>
      <text x="130" y="126" textAnchor="middle" fontSize="9" 
fontWeight="600" fill={C.teal} 
fontFamily="Inter,sans-serif">Parasympathetic calm up, Cortisol 
down</text>
      <text x="0" y="146" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">Two cycles before 
speaking resets your nervous system.</text>
    </svg>
  );
}

export function D6() {
  const all = Array.from({length:12}, (_,i) => i);
  return (
    <svg width="280" height="152" viewBox="0 0 280 152" fill="none">
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">WORKING MEMORY 
CAPACITY</text>
      {all.map(i => {
        const x=14+(i%6)*38, y=28+Math.floor(i/6)*38, ok=i<7;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="14" 
fill={ok?"rgba(74,158,118,0.2)":"rgba(196,122,122,0.2)"} 
stroke={ok?C.green:C.red} strokeWidth="1" strokeOpacity="0.7"/>
            <text x={x} y={y+4} textAnchor="middle" fontSize="9" 
fontWeight="700" fill={ok?C.green:C.red} 
fontFamily="Inter,sans-serif">{i+1}</text>
          </g>
        );
      })}
      <text x="0" y="106" fontSize="8" fill={C.green} 
fontFamily="Inter,sans-serif">7 or fewer = retained</text>
      <text x="0" y="120" fontSize="8" fill={C.red} 
fontFamily="Inter,sans-serif">Beyond 7 = dropped</text>
      <text x="0" y="146" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">Short sentences keep your 
listener inside their capacity.</text>
    </svg>
  );
}

export function D7() {
  const nodes = [{x:80,y:50,l:"Cue",sub:"Senior room",col:C.gold,bg:"rgba(138,158,132,0.18)"},{x:196,y:110,l:"Routine",sub:"Speak clearly",col:C.teal,bg:"rgba(123,169,154,0.18)"},{x:80,y:170,l:"Reward",sub:"Credibility",col:C.gold,bg:"rgba(138,158,132,0.18)"}];
  return (
    <svg width="280" height="202" viewBox="0 0 280 202" fill="none">
      <defs>
        <marker id="d7a" markerWidth="6" markerHeight="6" refX="5" 
refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke={C.gold} 
strokeWidth="1" strokeOpacity="0.7"/></marker>
        <marker id="d7b" markerWidth="6" markerHeight="6" refX="5" 
refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke={C.teal} 
strokeWidth="1" strokeOpacity="0.7"/></marker>
        <marker id="d7c" markerWidth="6" markerHeight="6" refX="5" 
refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke={C.gold} 
strokeWidth="1" strokeOpacity="0.35"/></marker>
      </defs>
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">THE HABIT LOOP</text>
      <path d="M108 64 Q180 64 186 98" stroke={C.gold} strokeWidth="1.2" 
strokeOpacity="0.5" fill="none" markerEnd="url(#d7a)"/>
      <path d="M186 128 Q180 170 112 168" stroke={C.teal} 
strokeWidth="1.2" strokeOpacity="0.5" fill="none" markerEnd="url(#d7b)"/>
      <path d="M52 158 Q22 110 52 62" stroke={C.gold} strokeWidth="1.2" 
strokeOpacity="0.28" strokeDasharray="4 3" fill="none" 
markerEnd="url(#d7c)"/>
      {nodes.map((n,i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="32" fill={n.bg} stroke={n.col} 
strokeWidth="1.2" strokeOpacity="0.85"/>
          <text x={n.x} y={n.y-4} textAnchor="middle" fontSize="10" 
fontWeight="700" fill={n.col} fontFamily="Georgia,serif">{n.l}</text>
          <text x={n.x} y={n.y+10} textAnchor="middle" fontSize="8" 
fill={C.dim} fontFamily="Inter,sans-serif">{n.sub}</text>
        </g>
      ))}
      <text x="0" y="194" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">Each clear conversation 
strengthens the loop.</text>
    </svg>
  );
}

export function D8() {
  return (
    <svg width="280" height="162" viewBox="0 0 280 162" fill="none">
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">MEMORY ENCODING</text>
      <text x="58" y="30" textAnchor="middle" fontSize="9" 
fontWeight="700" fill={C.dim} fontFamily="Inter,sans-serif">FACTS 
ONLY</text>
      <rect x="8" y="36" width="100" height="58" rx="1" fill={C.faint} 
stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
      <text x="12" y="51" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif">Verbal only</text>
      <rect x="18" y="57" width="70" height="6" rx="1" fill={C.dim} 
fillOpacity="0.28"/>
      <rect x="18" y="69" width="50" height="6" rx="1" fill={C.dim} 
fillOpacity="0.16"/>
      <rect x="18" y="81" width="60" height="6" rx="1" fill={C.dim} 
fillOpacity="0.09"/>
      <text x="210" y="30" textAnchor="middle" fontSize="9" 
fontWeight="700" fill={C.gold} fontFamily="Inter,sans-serif">STORY</text>
      <rect x="160" y="36" width="108" height="58" rx="1" 
fill="rgba(138,158,132,0.08)" stroke={C.gold} strokeWidth="0.8" 
strokeOpacity="0.4"/>
      <text x="164" y="51" fontSize="8" fill={C.gold} 
fontFamily="Inter,sans-serif">Verbal + visual</text>
      <rect x="170" y="57" width="86" height="6" rx="1" fill={C.gold} 
fillOpacity="0.5"/>
      <rect x="170" y="69" width="86" height="6" rx="1" fill={C.gold} 
fillOpacity="0.35"/>
      <rect x="170" y="81" width="86" height="6" rx="1" fill={C.gold} 
fillOpacity="0.22"/>
      <text x="58" y="112" textAnchor="middle" fontSize="13" 
fontWeight="700" fill={C.dim} fontFamily="Georgia,serif">10%</text>
      <text x="58" y="124" textAnchor="middle" fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">retention</text>
      <text x="214" y="112" textAnchor="middle" fontSize="13" 
fontWeight="700" fill={C.gold} fontFamily="Georgia,serif">65%</text>
      <text x="214" y="124" textAnchor="middle" fontSize="7" fill={C.gold} 
fontFamily="Inter,sans-serif">retention</text>
      <text x="0" y="148" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">Story activates verbal 
and visual memory channels.</text>
    </svg>
  );
}

export function D9() {
  return (
    <svg width="280" height="160" viewBox="0 0 280 160" fill="none">
      <defs>
        <marker id="d9arr" markerWidth="5" markerHeight="5" refX="4" 
refY="2.5" orient="auto">
          <path d="M0 0L5 2.5L0 5" fill="none" stroke={C.dim} 
strokeWidth="1" strokeOpacity="0.5"/>
        </marker>
      </defs>
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">THE SAR FRAMEWORK</text>
      
{[{l:"S",title:"Situation",col:C.dim,bg:C.faint,x:0},{l:"A",title:"Action",col:C.teal,bg:"rgba(123,169,154,0.12)",x:88},{l:"R",title:"Result",col:C.gold,bg:"rgba(138,158,132,0.2)",x:176}].map(b => (
        <g key={b.l}>
          <rect x={b.x} y="20" width="80" height="56" rx="1" fill={b.bg} 
stroke={b.l==="R"?C.gold:b.l==="A"?C.teal:"rgba(255,255,255,0.1)"} 
strokeWidth={b.l==="R"?"1.2":"0.8"} strokeOpacity="0.7"/>
          <text x={b.x+40} y="48" textAnchor="middle" fontSize="20" 
fontWeight="700" fill={b.col} fontFamily="Georgia,serif">{b.l}</text>
          <text x={b.x+40} y="65" textAnchor="middle" fontSize="8" 
fill={b.col} fontFamily="Inter,sans-serif">{b.title}</text>
        </g>
      ))}
      <path d="M82 48 L86 48" stroke={C.dim} strokeWidth="1" 
markerEnd="url(#d9arr)"/>
      <path d="M170 48 L174 48" stroke={C.dim} strokeWidth="1" 
markerEnd="url(#d9arr)"/>
      <rect x="176" y="84" width="80" height="3" rx="1" fill={C.gold} 
fillOpacity="0.8"/>
      <text x="176" y="98" fontSize="8" fill={C.gold} 
fontFamily="Inter,sans-serif">remembered most</text>
      <text x="0" y="98" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif">sets context</text>
      <text x="0" y="128" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">Make your Result the most 
precise thing you say.</text>
      <text x="0" y="143" fontSize="8" fill={C.gold} 
fontFamily="Inter,sans-serif">Never bury it. Lead with it when you 
can.</text>
    </svg>
  );
}

export function D10() {
  return (
    <svg width="280" height="172" viewBox="0 0 280 172" fill="none">
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">THE PERFORMANCE 
ICEBERG</text>
      <line x1="0" y1="78" x2="256" y2="78" stroke={C.teal} 
strokeWidth="1" strokeOpacity="0.6"/>
      <text x="218" y="74" fontSize="7" fill={C.teal} 
fontFamily="Inter,sans-serif" fillOpacity="0.6">WATERLINE</text>
      <polygon points="128,20 174,76 82,76" fill="rgba(138,158,132,0.2)" 
stroke={C.gold} strokeWidth="1.2" strokeOpacity="0.9"/>
      <text x="128" y="52" textAnchor="middle" fontSize="8" 
fontWeight="700" fill={C.gold} 
fontFamily="Inter,sans-serif">VISIBLE</text>
      <text x="128" y="65" textAnchor="middle" fontSize="7" fill={C.gold} 
fontFamily="Inter,sans-serif">What you communicate</text>
      <polygon points="82,78 174,78 198,148 58,148" 
fill="rgba(17,28,46,0.7)" stroke={C.navyLight} strokeWidth="1" 
strokeOpacity="0.5"/>
      <text x="128" y="102" textAnchor="middle" fontSize="8" 
fontWeight="700" fill={C.navyLight} 
fontFamily="Inter,sans-serif">HIDDEN</text>
      <text x="128" y="116" textAnchor="middle" fontSize="7" 
fill={C.navyLight} fontFamily="Inter,sans-serif">The work, thinking, 
decisions</text>
      <text x="186" y="50" fontSize="18" fontWeight="700" fill={C.gold} 
fontFamily="Georgia,serif">10%</text>
      <text x="186" y="62" fontSize="7" fill={C.gold} 
fontFamily="Inter,sans-serif" fillOpacity="0.7">visible</text>
      <text x="0" y="164" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">Great work underwater = 
invisible. Communicate it.</text>
    </svg>
  );
}

export function D11() {
  const attrs = 
[{angle:-45,label:"Intelligent"},{angle:0,label:"Credible"},{angle:45,label:"Capable"},{angle:90,label:"Trustworthy"}];
  return (
    <svg width="280" height="164" viewBox="0 0 280 164" fill="none">
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">THE HALO EFFECT</text>
      <circle cx="64" cy="84" r="50" fill="none" stroke={C.gold} 
strokeWidth="0.7" strokeDasharray="3 4" strokeOpacity="0.45"/>
      <circle cx="64" cy="84" r="36" fill="rgba(138,158,132,0.12)" 
stroke={C.gold} strokeWidth="1.2" strokeOpacity="0.9"/>
      <text x="64" y="81" textAnchor="middle" fontSize="8" 
fontWeight="700" fill={C.gold} fontFamily="Inter,sans-serif">FIRST</text>
      <text x="64" y="93" textAnchor="middle" fontSize="8" 
fontWeight="700" fill={C.gold} 
fontFamily="Inter,sans-serif">IMPRESSION</text>
      {attrs.map((a,i) => {
        const rad = a.angle*Math.PI/180;
        const x1=64+38*Math.cos(rad), y1=84+38*Math.sin(rad);
        const x2=64+62*Math.cos(rad), y2=84+62*Math.sin(rad);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.teal} 
strokeWidth="1" strokeOpacity="0.6"/>
            <text x={x2+4} y={y2+4} fontSize="8" fill={C.teal} 
fontFamily="Inter,sans-serif">{a.label}</text>
          </g>
        );
      })}
      <text x="0" y="136" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif">Your image is judged in 30 seconds.</text>
      <text x="0" y="150" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">One strong signal. The 
halo does the rest.</text>
    </svg>
  );
}

export function D12() {
  const ctr = {x:112,y:102};
  const inner = 
[{x:66,y:54},{x:158,y:54},{x:184,y:110},{x:112,y:150},{x:40,y:110}];
  const outer = 
[{x:32,y:18},{x:182,y:16},{x:224,y:82},{x:202,y:152},{x:112,y:172},{x:24,y:150},{x:12,y:62}];
  return (
    <svg width="280" height="188" viewBox="0 0 280 188" fill="none">
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">THE NETWORK 
EFFECT</text>
      {outer.map((o,i) => <line key={i} x1={ctr.x} y1={ctr.y} x2={o.x} 
y2={o.y} stroke={C.gold} strokeWidth="0.5" strokeOpacity="0.18"/>)}
      {inner.map((n,i) => <line key={i} x1={ctr.x} y1={ctr.y} x2={n.x} 
y2={n.y} stroke={C.gold} strokeWidth="1" strokeOpacity="0.48"/>)}
      {outer.map((o,i) => <circle key={i} cx={o.x} cy={o.y} r="7" 
fill="rgba(138,158,132,0.08)" stroke={C.gold} strokeWidth="0.7" 
strokeOpacity="0.38"/>)}
      {inner.map((n,i) => <circle key={i} cx={n.x} cy={n.y} r="12" 
fill="rgba(138,158,132,0.12)" stroke={C.gold} strokeWidth="1" 
strokeOpacity="0.65"/>)}
      <circle cx={ctr.x} cy={ctr.y} r="22" fill="rgba(183,154,107,0.22)" 
stroke={C.gold} strokeWidth="1.5" strokeOpacity="0.9"/>
      <text x={ctr.x} y={ctr.y+4} textAnchor="middle" fontSize="9" 
fontWeight="700" fill={C.gold} fontFamily="Georgia,serif">YOU</text>
      <text x="0" y="180" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">Each senior relationship 
multiplies, not just adds.</text>
    </svg>
  );
}

export function D13() {
  return (
    <svg width="280" height="192" viewBox="0 0 280 192" fill="none">
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">PERSONAL BRAND 
ARCHITECTURE</text>
      <polygon points="128,26 228,170 28,170" 
fill="rgba(183,154,107,0.07)" stroke={C.gold} strokeWidth="1.2" 
strokeOpacity="0.7"/>
      <polygon points="128,66 194,150 62,150" 
fill="rgba(183,154,107,0.05)" stroke={C.gold} strokeWidth="0.6" 
strokeOpacity="0.28"/>
      <text x="128" y="21" textAnchor="middle" fontSize="9" 
fontWeight="700" fill={C.gold} 
fontFamily="Inter,sans-serif">AUTHENTIC</text>
      <text x="128" y="33" textAnchor="middle" fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">who you truly are</text>
      <text x="232" y="178" textAnchor="middle" fontSize="9" 
fontWeight="700" fill={C.teal} 
fontFamily="Inter,sans-serif">VISIBLE</text>
      <text x="232" y="190" textAnchor="middle" fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">right people</text>
      <text x="26" y="178" textAnchor="middle" fontSize="9" 
fontWeight="700" fill={C.navyLight} 
fontFamily="Inter,sans-serif">CONSISTENT</text>
      <text x="26" y="190" textAnchor="middle" fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">every room</text>
      <text x="128" y="106" textAnchor="middle" fontSize="10" 
fontWeight="700" fill={C.white} fontFamily="Georgia,serif">YOUR</text>
      <text x="128" y="120" textAnchor="middle" fontSize="10" 
fontWeight="700" fill={C.white} fontFamily="Georgia,serif">BRAND</text>
    </svg>
  );
}

export function D14() {
  return (
    <svg width="280" height="182" viewBox="0 0 280 182" fill="none">
      <defs>
        <marker id="d14a" markerWidth="6" markerHeight="6" refX="5" 
refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke={C.gold} 
strokeWidth="1" strokeOpacity="0.8"/></marker>
        <marker id="d14b" markerWidth="6" markerHeight="6" refX="5" 
refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke={C.teal} 
strokeWidth="1" strokeOpacity="0.8"/></marker>
      </defs>
      <text x="0" y="12" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">THE 
COMPETENCE-CONFIDENCE LOOP</text>
      <circle cx="80" cy="100" r="52" fill="rgba(138,158,132,0.1)" 
stroke={C.gold} strokeWidth="1.2" strokeOpacity="0.9"/>
      <text x="80" y="96" textAnchor="middle" fontSize="9" 
fontWeight="700" fill={C.gold} 
fontFamily="Georgia,serif">COMPETENCE</text>
      <text x="80" y="110" textAnchor="middle" fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">skill through practice</text>
      <circle cx="196" cy="100" r="52" fill="rgba(123,169,154,0.1)" 
stroke={C.teal} strokeWidth="1.2" strokeOpacity="0.9"/>
      <text x="196" y="96" textAnchor="middle" fontSize="9" 
fontWeight="700" fill={C.teal} 
fontFamily="Georgia,serif">CONFIDENCE</text>
      <text x="196" y="110" textAnchor="middle" fontSize="7" fill={C.dim} 
fontFamily="Inter,sans-serif">grows as skill compounds</text>
      <path d="M126 78 Q138 60 158 72" stroke={C.gold} strokeWidth="1.2" 
fill="none" markerEnd="url(#d14a)"/>
      <path d="M150 128 Q138 148 120 132" stroke={C.teal} 
strokeWidth="1.2" fill="none" markerEnd="url(#d14b)"/>
      <text x="138" y="104" textAnchor="middle" fontSize="7" 
fill={C.white} fontFamily="Inter,sans-serif">reinforces</text>
      <text x="0" y="168" fontSize="8" fill={C.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">You have built both. Each 
session was a rep.</text>
      <text x="0" y="180" fontSize="8" fill={C.gold} 
fontFamily="Inter,sans-serif">This is the beginning of the loop.</text>
    </svg>
  );
}


// ── Day 9 Diagram: Three Story Killers 
export function D_StoryKillers() {
  const C2 = 
{gold:"#B79A6B",teal:"#7BA99A",red:"#C47A7A",navyLight:"#E8EBF0",
               
white:"rgba(255,255,255,0.88)",dim:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.07)"};
  const killers = [
    {num:"1",label:"Too much setup",fix:"Situation = 1 sentence max",col:C2.red,bg:"rgba(196,122,122,0.12)",bar:0.7},
    {num:"2",label:"Too many characters",fix:"Cut anyone not essential",col:C2.gold,bg:"rgba(138,158,132,0.12)",bar:0.45},
    {num:"3",label:"Vague Result",fix:"One number. One specific change.",col:C2.teal,bg:"rgba(123,169,154,0.12)",bar:0.15},
  ];
  return (
    <svg width="280" height="192" viewBox="0 0 280 192" fill="none">
      <text x="0" y="12" fontSize="8" fill={C2.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">THE THREE STORY 
KILLERS</text>
      {killers.map((k,i) => (
        <g key={i} transform={"translate(0,"+(20+i*52)+")"}>
          <rect x="0" y="0" width="260" height="40" rx="2" fill={k.bg} 
stroke={k.col} strokeWidth="0.6" strokeOpacity="0.5"/>
          <text x="12" y="14" fontSize="14" fontWeight="700" 
fontFamily="Georgia,serif" fill={k.col}>{k.num}</text>
          <text x="30" y="14" fontSize="9" fontWeight="700" 
fontFamily="Inter,sans-serif" fill={C2.white}>{k.label}</text>
          <text x="30" y="27" fontSize="7.5" fontFamily="Inter,sans-serif" 
fill={C2.gold} fontStyle="italic">Fix: {k.fix}</text>
          <rect x="30" y="33" width="220" height="2" rx="1" 
fill="rgba(255,255,255,0.08)"/>
          <rect x="30" y="33" width={220*(1-k.bar)} height="2" rx="1" 
fill={k.col} fillOpacity="0.7"/>
          <text x="255" y="37" fontSize="7" fontFamily="Inter,sans-serif" 
fill={k.col} textAnchor="end">{Math.round((1-k.bar)*100)}% of story</text>
        </g>
      ))}
      <text x="0" y="182" fontSize="8" fill={C2.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">All three are editing 
problems, not content problems.</text>
    </svg>
  );
}

// ── Day 10 Diagram: The 3-Point Test 
export function D_ThreePoint() {
  const C2 = {gold:"#B79A6B",teal:"#7BA99A",navyLight:"#E8EBF0",
               
white:"rgba(255,255,255,0.88)",dim:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.07)"};
  const points = [
    {n:"1",q:"What is the ONE thing they should remember?",label:"POINT",col:"#B79A6B",r:44},
    {n:"2",q:"What specific detail makes it real?",label:"PROOF",col:"#7BA99A",r:38},
    {n:"3",q:"What should they think or do differently?",label:"SHIFT",col:"#9BA5AF",r:32},
  ];
  const cx=140, cy=95;
  return (
    <svg width="280" height="210" viewBox="0 0 280 210" fill="none">
      <text x="0" y="12" fontSize="8" fill={C2.dim} 
fontFamily="Inter,sans-serif" letterSpacing="1.5">THE 3-POINT TEST</text>
      {/* Three concentric rings */}
      {[...points].reverse().map((p,i) => (
        <circle key={i} cx={cx} cy={cy} r={p.r} 
fill="rgba(255,255,255,0.02)" stroke={p.col} strokeWidth="1" 
strokeOpacity={0.3+i*0.2} strokeDasharray={i===0?"none":"4 3"}/>
      ))}
      {/* Centre label */}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="8" 
fontWeight="700" fontFamily="Inter,sans-serif" 
fill={C2.white}>STORY</text>
      <text x={cx} y={cy+8} textAnchor="middle" fontSize="7" 
fontFamily="Inter,sans-serif" fill={C2.dim}>READY?</text>
      {/* Labels around rings */}
      {[
        {x:cx-52,y:cy-42,p:points[0]},
        {x:cx+28,y:cy+46,p:points[1]},
        {x:cx-60,y:cy+32,p:points[2]},
      ].map(({x,y,p},i) => (
        <g key={i}>
          <rect x={x-2} y={y-12} width={p.label.length*6+8} height={14} 
rx="2" fill={p.col} fillOpacity="0.15" stroke={p.col} strokeWidth="0.5" 
strokeOpacity="0.6"/>
          <text x={x+p.label.length*3+2} y={y} textAnchor="middle" 
fontSize="8" fontWeight="700" fontFamily="Inter,sans-serif" 
fill={p.col}>{p.label}</text>
        </g>
      ))}
      {/* Questions */}
      {points.map((p,i) => (
        <text key={i} x="0" y={158+i*14} fontSize="8" 
fontFamily="Inter,sans-serif" fill={i===0?p.col:"rgba(255,255,255,0.45)"}>
          {p.n}. {p.q}
        </text>
      ))}
      <text x="0" y="205" fontSize="8" fill={C2.dim} 
fontFamily="Inter,sans-serif" fontStyle="italic">Answer all three before 
you speak. The story is ready.</text>
    </svg>
  );
}

export const DIAGRAMS = 
[D1,D2,D3,D6,D4,D8,D7,D9,D_StoryKillers,D_ThreePoint,D10,D12,D11,D14];



// ─── MODULE ICONS — 14 editorial SVG line icons, sage green, 28×28
export const MODULE_ICONS = [
  // 1 Speak Simply — ballpoint pen (barrel + nib + band)
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M8 21L21 8" stroke={S} strokeWidth="1.5" strokeLinecap="butt"/><path d="M10 23L23 10" stroke={S} strokeWidth="1.5" strokeLinecap="butt"/><path d="M21 8L23 10" {...SI}/><path d="M8 21L5 25L10 23Z" stroke={S} strokeWidth="1.5" strokeLinejoin="round" fill="none"/><path d="M12.5 18.5L14.5 16.5" {...SI}/></svg>,
  // 2 Voice Control — microphone
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="10.5" y="4" width="7" height="12" rx="3.5" stroke={S} strokeWidth="1.5" fill="none"/><path d="M7 14a7 7 0 0014 0" {...SI}/><path d="M14 21v4M11 25h6" {...SI}/></svg>,
  // 3 Eliminate Fillers — scissors (two handle rings, blades crossing to tip)
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="6" cy="7" r="3.5" stroke={S} strokeWidth="1.5" fill="none"/><circle cx="6" cy="21" r="3.5" stroke={S} strokeWidth="1.5" fill="none"/><path d="M9.5 7L25 22" {...SI}/><path d="M9.5 21L25 6" {...SI}/></svg>,
  // 4 Short Sentences — A4 page with short lines of text
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="6" y="3" width="16" height="22" rx="1.5" stroke={S} strokeWidth="1.5" fill="none"/><path d="M10 9h6" {...SI}/><path d="M10 13h8" {...SI}/><path d="M10 17h5" {...SI}/><path d="M10 21h4" {...SI}/></svg>,
  // 5 PRE Structure — 3 boxes linked in a chain
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="1" y="11" width="7" height="6" rx="1" stroke={S} strokeWidth="1.5" fill="none"/><path d="M8 14h5" {...SI}/><rect x="13" y="11" width="7" height="6" rx="1" stroke={S} strokeWidth="1.5" fill="none"/><path d="M20 14h5" {...SI}/><rect x="25" y="11" width="2" height="6" rx="0.5" stroke={S} strokeWidth="1.5" fill="none"/></svg>,
  // 6 Storytelling — open book
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 8v13" {...SI}/><path d="M14 8C12 7 7 7 5 8v13c2-1 7-1 9 0" {...SI}/><path d="M14 8c2-1 7-1 9 0v13c-2-1-7-1-9 0" {...SI}/></svg>,
  // 7 PIE Framework — 3 separated pie slices
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M15.5 11.5L15.5 2.5A9 9 0 0 1 23.3 16Z" stroke={S} strokeWidth="1.5" fill="none" strokeLinejoin="round"/><path d="M14 16.5L21.8 21A9 9 0 0 1 6.2 21Z" stroke={S} strokeWidth="1.5" fill="none" strokeLinejoin="round"/><path d="M12 13L4.2 17.5A9 9 0 0 1 12 4Z" stroke={S} strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>,
  // 8 Executive Presence — crown
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 20h20M4 20l3-9 7 5 7-5 3 9" {...SI}/><path d="M4 20v3h20v-3" {...SI}/></svg>,
  // 9 Influence — two overlapping circles
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="11" cy="14" r="7" stroke={S} strokeWidth="1.5" fill="none"/><circle cx="17" cy="14" r="7" stroke={S} strokeWidth="1.5" fill="none"/></svg>,
  // 10 Difficult Conversations — two speech bubbles
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 7h13a1 1 0 011 1v6a1 1 0 01-1 1h-3l-2 3v-3H5a1 1 0 01-1-1V8a1 1 0 011-1z" {...SI}/><path d="M18 13h5a1 1 0 011 1v4a1 1 0 01-1 1h-1v2l-2-2h-4a1 1 0 01-1-1v-2" {...SI}/></svg>,
  // 11 Personal Brand — diamond
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3l11 11-11 11L3 14 14 3z" stroke={S} strokeWidth="1.5" strokeLinejoin="round" fill="none"/></svg>,
  // 12 Networking — three dots connected
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="5.5" r="2.5" stroke={S} strokeWidth="1.5" fill="none"/><circle cx="5" cy="22.5" r="2.5" stroke={S} strokeWidth="1.5" fill="none"/><circle cx="23" cy="22.5" r="2.5" stroke={S} strokeWidth="1.5" fill="none"/><path d="M12.5 8L7 20M15.5 8L21 20M7.5 22.5h13" {...SI}/></svg>,
  // 13 Exposure — eye (visibility)
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 14s4-8 10-8 10 8 10 8-4 8-10 8S4 14 4 14z" stroke={S} strokeWidth="1.5" strokeLinejoin="round" fill="none"/><circle cx="14" cy="14" r="3" stroke={S} strokeWidth="1.5" fill="none"/></svg>,
  // 14 Amplified — graduation cap (programme completion)
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 8L3 13l11 5 11-5-11-5z" stroke={S} strokeWidth="1.5" strokeLinejoin="round" fill="none"/><path d="M7.5 15.5V20c0 0 3 3 6.5 3s6.5-3 6.5-3v-4.5" {...SI}/><path d="M25 13v5" {...SI}/></svg>,
];












