import { T } from '../theme.js';
import { getPieceInfo } from '../utils.js';

function TraitIcon({ type }) {
  const s = { stroke:"rgba(201,169,97,0.85)", strokeWidth:"1.4", fill:"none", strokeLinecap:"round", strokeLinejoin:"round" };
  if (type === "compass") return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" {...s}/>
      <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" {...s}/>
    </svg>
  );
  if (type === "lines") return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 12h16M4 17h10" {...s}/>
    </svg>
  );
  if (type === "wave") return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M2 12c1.5-4 3-6 4.5-6S9 8 10.5 12s3 6 4.5 6S18 16 19.5 12 21 6 22 6" {...s}/>
    </svg>
  );
  if (type === "star") return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" {...s}/>
    </svg>
  );
  if (type === "eye") return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" {...s}/>
      <circle cx="12" cy="12" r="3" {...s}/>
    </svg>
  );
  if (type === "crown") return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M3 18l2.5-8 4 4.5L12 5l2.5 9.5 4-4.5L21 18H3z" {...s}/>
    </svg>
  );
  return null;
}

const RANK_META = [
  {
    progressLabel: "FOUNDATION PROGRESS",
    tagline: "Growth Professional",
    traits: [
      { name:"Clarity",   desc:"Speak with precision",      icon:"compass" },
      { name:"Structure", desc:"Organise your ideas",        icon:"lines"   },
      { name:"Voice",     desc:"Use your voice with purpose", icon:"wave"   },
    ],
    nextDesc: "Build momentum.\nTake purposeful action.",
  },
  {
    progressLabel: "MOMENTUM PROGRESS",
    tagline: "Emerging Communicator",
    traits: [
      { name:"Clarity",    desc:"Speak with precision",       icon:"compass" },
      { name:"Structure",  desc:"Organise your ideas",         icon:"lines"   },
      { name:"Confidence", desc:"Own the room naturally",      icon:"star"    },
    ],
    nextDesc: "Sharpen your influence.\nLead with real insight.",
  },
  {
    progressLabel: "INFLUENCE PROGRESS",
    tagline: "Confident Contributor",
    traits: [
      { name:"Clarity",    desc:"Speak with precision",       icon:"compass" },
      { name:"Confidence", desc:"Own the room naturally",      icon:"star"    },
      { name:"Voice",      desc:"Use your voice with purpose", icon:"wave"    },
    ],
    nextDesc: "Command strategy.\nShape every outcome.",
  },
  {
    progressLabel: "AUTHORITY PROGRESS",
    tagline: "Strategic Voice",
    traits: [
      { name:"Clarity",   desc:"Speak with precision",     icon:"compass" },
      { name:"Structure", desc:"Organise your ideas",       icon:"lines"   },
      { name:"Presence",  desc:"Be felt before you speak",  icon:"eye"     },
    ],
    nextDesc: "Lead with authority.\nInspire with vision.",
  },
  {
    progressLabel: "MASTERY PROGRESS",
    tagline: "Influential Leader",
    traits: [
      { name:"Presence",  desc:"Be felt before you speak",    icon:"eye"     },
      { name:"Influence", desc:"Move people with meaning",     icon:"star"    },
      { name:"Vision",    desc:"See what others miss",         icon:"compass" },
    ],
    nextDesc: "Define your legacy.\nLead with total authority.",
  },
  {
    progressLabel: "LEGACY PROGRESS",
    tagline: "Executive Communicator",
    traits: [
      { name:"Authority", desc:"Speak and rooms align",     icon:"crown"   },
      { name:"Vision",    desc:"See what others miss",       icon:"compass" },
      { name:"Legacy",    desc:"Leave a lasting imprint",    icon:"star"    },
    ],
    nextDesc: null,
  },
];

function PieceCircle({ img, name, size }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", overflow:"hidden", position:"relative", flexShrink:0 }}>
      <img src={img} alt={name} style={{
        position:"absolute", width:"126%", height:"126%",
        top:"-13%", left:"-13%", objectFit:"cover",
      }}/>
    </div>
  );
}

export function IdentityScreen({ done, setTab }) {
  const pieceInfo = getPieceInfo(done.length);
  const { current, currentIndex, next, daysUntil } = pieceInfo;
  const meta = RANK_META[currentIndex] || RANK_META[0];

  const rankStart = current.threshold;
  const rankEnd = next ? next.threshold : 14;
  const rankTotal = rankEnd - rankStart;
  const rankDone = Math.min(Math.max(done.length - rankStart, 0), rankTotal);
  const rankPct = rankTotal > 0 ? Math.round((rankDone / rankTotal) * 100) : 100;
  const dotPct = Math.max(0, Math.min(100, rankPct));

  const CARD = {
    background:"#FFFFFF",
    borderRadius:14,
    border:"1px solid rgba(0,0,0,0.07)",
    boxShadow:"0 1px 10px rgba(0,0,0,0.05)",
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", paddingBottom:120 }}>

      {/* Hero */}
      <div style={{
        background:"linear-gradient(180deg, #0C0906 0%, #181310 100%)",
        paddingTop:64, paddingBottom:56,
        display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center",
      }}>
        <PieceCircle img={current.img} name={current.name} size={160}/>
        <div style={{ marginTop:28, fontFamily:T.serif, fontSize:46, fontWeight:400, color:"rgba(255,255,255,0.95)", letterSpacing:"-1px", lineHeight:1 }}>
          {current.name}
        </div>
        <div style={{ marginTop:10, fontFamily:T.sans, fontSize:10, color:"rgba(255,255,255,0.38)", letterSpacing:"4.5px", textTransform:"uppercase" }}>
          {meta.tagline}
        </div>
        <div style={{ marginTop:22, width:36, height:1, background:"rgba(201,169,97,0.55)" }}/>
      </div>

      <div style={{ padding:"20px 16px", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Progress card */}
        <div style={{ ...CARD, padding:"20px 20px 18px" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ fontSize:10, color:"#c9a961", textTransform:"uppercase", letterSpacing:"2.5px", fontWeight:600, fontFamily:T.sans }}>
              {meta.progressLabel}
            </div>
            <div style={{ fontFamily:T.serif, fontSize:24, color:"#1a1612", fontWeight:400 }}>{rankPct}%</div>
          </div>

          <div style={{ position:"relative", height:4, background:"#E8E4DC", borderRadius:4, marginBottom:18, overflow:"visible" }}>
            <div style={{ position:"absolute", left:0, top:0, height:"100%", width:dotPct+"%", background:"linear-gradient(90deg,#b8956a,#c9a961)", borderRadius:4, minWidth:dotPct>0?10:0 }}/>
            <div style={{
              position:"absolute", top:"50%", left:dotPct+"%",
              transform:"translate(-50%,-50%)",
              width:11, height:11, borderRadius:"50%",
              background:"#c9a961",
              boxShadow:"0 0 0 2px #FFFFFF, 0 0 0 3.5px rgba(201,169,97,0.35)",
              zIndex:1,
            }}/>
          </div>

          {next ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontFamily:T.sans, fontSize:13, color:"#5a4f3f" }}>
                Next milestone: <strong style={{ color:"#1a1612", fontWeight:600 }}>{next.name}</strong>
              </div>
              <div style={{ opacity:0.65 }}>
                <PieceCircle img={next.img} name={next.name} size={36}/>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily:T.sans, fontSize:13, color:"#8A9E84", fontWeight:500 }}>Maximum rank achieved</div>
          )}
        </div>

        {/* Two-column cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

          {/* YOUR FOUNDATION */}
          <div style={{ ...CARD, padding:"18px 14px", display:"flex", flexDirection:"column" }}>
            <div style={{ fontSize:9, color:"#c9a961", textTransform:"uppercase", letterSpacing:"2.5px", fontWeight:600, fontFamily:T.sans, marginBottom:16 }}>
              Your Foundation
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14, flex:1 }}>
              {meta.traits.map((trait, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{
                    width:32, height:32, borderRadius:"50%",
                    border:"1px solid rgba(201,169,97,0.3)",
                    background:"rgba(201,169,97,0.04)",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  }}>
                    <TraitIcon type={trait.icon}/>
                  </div>
                  <div>
                    <div style={{ fontFamily:T.sans, fontSize:13, fontWeight:600, color:"#1a1612", lineHeight:1.2, marginBottom:2 }}>{trait.name}</div>
                    <div style={{ fontFamily:T.sans, fontSize:11, color:"#7a6f5c", lineHeight:1.45 }}>{trait.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setTab && setTab("progress")}
              style={{ marginTop:18, background:"none", border:"none", padding:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}
            >
              <span style={{ fontFamily:T.sans, fontSize:12, color:"#c9a961" }}>View full journey</span>
              <span style={{ fontSize:15, color:"#c9a961", lineHeight:1 }}>›</span>
            </button>
          </div>

          {/* COMING NEXT */}
          <div style={{ ...CARD, padding:"18px 14px", display:"flex", flexDirection:"column" }}>
            <div style={{ fontSize:9, color:"#c9a961", textTransform:"uppercase", letterSpacing:"2.5px", fontWeight:600, fontFamily:T.sans, marginBottom:16 }}>
              Coming Next
            </div>
            {next ? (
              <>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
                  <PieceCircle img={next.img} name={next.name} size={80}/>
                </div>
                <div style={{ fontFamily:T.serif, fontSize:22, color:"#1a1612", fontWeight:400, textAlign:"center", marginBottom:8, lineHeight:1.2 }}>
                  {next.name}
                </div>
                {meta.nextDesc && (
                  <div style={{ fontFamily:T.sans, fontSize:11, color:"#7a6f5c", lineHeight:1.6, textAlign:"center", whiteSpace:"pre-line", flex:1 }}>
                    {meta.nextDesc}
                  </div>
                )}
                <button style={{ marginTop:16, background:"none", border:"none", padding:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
                  <span style={{ fontFamily:T.sans, fontSize:12, color:"#c9a961" }}>Preview next</span>
                  <span style={{ fontSize:15, color:"#c9a961", lineHeight:1 }}>›</span>
                </button>
              </>
            ) : (
              <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontFamily:T.sans, fontSize:12, color:"#8A9E84", fontWeight:500, textAlign:"center" }}>Maximum rank achieved</div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
