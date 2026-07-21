import { T } from '../theme.js';
import { PIECES, getPieceInfo } from '../utils.js';

const RANK_META = [
  {
    tagline: "Growth Professional",
    traits: [],
    coming: ["Clarity", "Structure", "Voice"],
  },
  {
    tagline: "Emerging Communicator",
    traits: ["Clarity", "Structure"],
    coming: ["Confidence", "Voice", "Storytelling"],
  },
  {
    tagline: "Confident Contributor",
    traits: ["Clarity", "Structure", "Voice"],
    coming: ["Influence", "Presence"],
  },
  {
    tagline: "Strategic Voice",
    traits: ["Clarity", "Structure", "Voice", "Confidence"],
    coming: ["Presence", "Executive Presence"],
  },
  {
    tagline: "Influential Leader",
    traits: ["Clarity", "Structure", "Voice", "Confidence", "Presence"],
    coming: ["Executive Authority"],
  },
  {
    tagline: "Executive Communicator",
    traits: ["Clarity", "Structure", "Voice", "Confidence", "Presence", "Executive Authority"],
    coming: [],
  },
];

function CheckIcon() {
  return (
    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
      <path d="M1 3.5l2.5 2.5 4.5-5" stroke="#8A9E84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IdentityScreen({ done, streak }) {
  const pieceInfo = getPieceInfo(done.length);
  const { current, currentIndex, next, daysUntil } = pieceInfo;
  const meta = RANK_META[currentIndex] || RANK_META[0];

  const rankStart = current.threshold;
  const rankEnd = next ? next.threshold : 14;
  const rankTotal = rankEnd - rankStart;
  const rankDone = Math.min(Math.max(done.length - rankStart, 0), rankTotal);
  const rankPct = rankTotal > 0 ? Math.round((rankDone / rankTotal) * 100) : 100;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.sans, display:"flex", flexDirection:"column", paddingBottom:120 }}>

      {/* Dark hero */}
      <div style={{ background:"#0F0D0A", paddingTop:52, paddingBottom:52, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
        {/* Chess piece medallion */}
        <div style={{
          width:100, height:100, borderRadius:"50%",
          background:"linear-gradient(145deg,#2A221A,#17120D)",
          border:"1.5px solid rgba(201,169,110,0.45)",
          boxShadow:"0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
          display:"flex", alignItems:"center", justifyContent:"center",
          marginBottom:24,
        }}>
          <i className={"ti " + current.icon} style={{ fontSize:46, color:"#c9a96e" }}/>
        </div>

        <div style={{ fontFamily:T.serif, fontSize:34, fontWeight:500, color:"rgba(255,255,255,0.93)", letterSpacing:"-1px", marginBottom:6 }}>
          {current.name}
        </div>
        <div style={{ fontFamily:T.sans, fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:"3.5px", textTransform:"uppercase" }}>
          {meta.tagline}
        </div>

        {/* Thin gold rule */}
        <div style={{ width:32, height:1, background:"rgba(201,169,110,0.4)", marginTop:24 }}/>
      </div>

      <div style={{ padding:"28px 24px 0", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Streak */}
        {streak > 0 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", background:T.surface, borderRadius:8, border:"1px solid "+T.border }}>
            <div>
              <div style={{ fontSize:9, color:T.text3, textTransform:"uppercase", letterSpacing:"2.5px", marginBottom:6 }}>Current Streak</div>
              <div>
                <span style={{ fontFamily:T.serif, fontSize:30, color:T.ink, fontWeight:500, lineHeight:1 }}>{streak}</span>
                <span style={{ fontFamily:T.sans, fontSize:12, color:T.text3, marginLeft:6 }}>{streak === 1 ? "day" : "days"}</span>
              </div>
            </div>
            <div style={{ fontFamily:T.serif, fontSize:28, color:"#c9a96e", opacity:0.7 }}>—</div>
          </div>
        )}

        {/* Promotion progress */}
        <div style={{ padding:"20px", background:T.surface, borderRadius:8, border:"1px solid "+T.border }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:14 }}>
            <div style={{ fontSize:9, color:T.text3, textTransform:"uppercase", letterSpacing:"2.5px" }}>Promotion Progress</div>
            <div style={{ fontFamily:T.serif, fontSize:15, color:T.ink }}>{rankPct}%</div>
          </div>
          <div style={{ height:4, background:T.border, borderRadius:4, overflow:"hidden", marginBottom:14 }}>
            <div style={{ height:"100%", width:rankPct+"%", background:"linear-gradient(90deg,#7A8A74,#8A9E84)", borderRadius:4, transition:"width 0.8s ease" }}/>
          </div>
          {next ? (
            <div style={{ fontSize:12, color:T.text3, fontFamily:T.sans }}>
              {daysUntil === 0
                ? "Promotion ready — complete the next session"
                : daysUntil + " session" + (daysUntil === 1 ? "" : "s") + " to " + next.name}
            </div>
          ) : (
            <div style={{ fontSize:12, color:"#8A9E84", fontFamily:T.sans, fontWeight:500 }}>Maximum rank achieved</div>
          )}
        </div>

        {/* Unlocked traits */}
        {meta.traits.length > 0 && (
          <div>
            <div style={{ fontSize:9, color:"#8A9E84", textTransform:"uppercase", letterSpacing:"3px", marginBottom:16, fontFamily:T.sans }}>Unlocked Traits</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {meta.traits.map((trait, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    width:18, height:18, borderRadius:"50%",
                    background:"rgba(138,158,132,0.12)",
                    border:"1px solid rgba(138,158,132,0.4)",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  }}>
                    <CheckIcon/>
                  </div>
                  <span style={{ fontFamily:T.sans, fontSize:13, color:T.text2 }}>{trait}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coming next */}
        {meta.coming.length > 0 && (
          <div style={{ paddingBottom:8 }}>
            <div style={{ fontSize:9, color:T.text3, textTransform:"uppercase", letterSpacing:"3px", marginBottom:16, fontFamily:T.sans }}>Coming Next</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {meta.coming.map((trait, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    width:18, height:18, borderRadius:"50%",
                    background:"transparent",
                    border:"1px solid "+T.border,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:T.border }}/>
                  </div>
                  <span style={{ fontFamily:T.sans, fontSize:13, color:T.text3 }}>{trait}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
