import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';

export function Confetti() {
  const pieces = Array.from({length:18}, (_,i) => ({
    id:i,
    x: 10 + (i*5.5)%85,
    delay: (i*0.08)%1.2,
    dur: 0.9 + (i*0.07)%0.6,
    size: 5 + i%5,
    color: 
[T.gold,"#D4B896","rgba(183,154,107,0.7)","white","rgba(255,255,255,0.6)"][i%5],
    shape: i%3,
  }));
  return (
    <div 
style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity:1; }
          80%  { opacity:1; }
          100% { transform: translateY(320px) rotate(540deg); opacity:0; }
        }
        @keyframes goldPulse {
          0%,100% { transform: scale(1); opacity:0.9; }
          50%     { transform: scale(1.12); opacity:1; }
        }
        @keyframes starSpin {
          from { transform: rotate(0deg) scale(0.4); opacity:0; }
          30%  { opacity:1; }
          to   { transform: rotate(360deg) scale(1); opacity:0; }
        }
      `}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute",
          left: p.x+"%",
          top: -10,
          width: p.shape===0 ? p.size : p.size*1.4,
          height: p.shape===0 ? p.size : p.size*0.7,
          borderRadius: p.shape===2 ? "50%" : p.shape===0 ? 1 : 2,
          background: p.color,
          animation: "confettiFall "+p.dur+"s ease-in "+p.delay+"s both",
        }}/>
      ))}
    </div>
  );
}

// ─── WELCOME CARD — shown once after first onboarding ─────────────────────
export function WelcomeCard({ onDismiss }) {
  const [showButton, setShowButton] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.play().catch(() => setShowButton(true));
    }
    const t = setTimeout(() => setShowButton(true), 5000);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setLeaving(true);
    try { localStorage.setItem("amplifyu_welcome_shown", "1"); } catch(_) {}
    setTimeout(onDismiss, 550);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(10,8,5,0.82)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      overflowY: "auto",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "40px 24px 60px",
      animation: leaving ? "fadeOut 0.55s ease forwards" : "fadeIn 0.5s ease both",
    }}>
      <div style={{
        width: "100%", maxWidth: 560,
        background: "#F7F3EC",
        borderRadius: 12,
        padding: "36px 40px 32px",
        boxShadow: "0 32px 96px rgba(44,36,22,0.18), 0 4px 20px rgba(44,36,22,0.08)",
        textAlign: "center",
        animation: leaving ? "fadeDown 0.45s ease forwards" : "fadeUp 0.5s cubic-bezier(0.25,0.46,0.45,0.94) 0.1s both",
      }}>
        {/* Video — height-driven so portrait video shows at natural width, no grey bars */}
        <video
          ref={videoRef}
          src="/welcome.mov"
          onEnded={() => setShowButton(true)}
          style={{
            height: "46vh",
            width: "auto",
            maxWidth: "100%",
            borderRadius: 8,
            display: "block",
            margin: "0 auto 24px",
            border: "6px solid #1A1510",
            boxSizing: "border-box",
          }}
          playsInline
          autoPlay
        />

        {/* Heading */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond','Georgia',serif",
          fontSize: 28, fontWeight: 600, color: "#2C2416",
          letterSpacing: "-0.3px", marginBottom: 10, lineHeight: 1.2,
        }}>
          Welcome to AmplifyU
        </h2>

        {/* Subtext */}
        <p style={{
          fontFamily: "'Inter',-apple-system,sans-serif",
          fontSize: 16, color: "#6B5E44", lineHeight: 1.65,
          marginBottom: 32, fontWeight: 300,
        }}>
          Every great communicator started exactly where you are now.
        </p>

        {/* Button — fades in after video */}
        <button
          onClick={dismiss}
          style={{
            padding: "13px 32px", borderRadius: 4, border: "none",
            background: "#8A9E84", color: "#F7F3EC",
            fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600,
            cursor: showButton ? "pointer" : "default",
            letterSpacing: "0.02em",
            opacity: showButton ? 1 : 0,
            transform: showButton ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.5s ease, transform 0.5s ease, background 0.2s ease",
            pointerEvents: showButton ? "auto" : "none",
          }}
          onMouseEnter={e => { if(showButton) e.currentTarget.style.background = "#2C2416"; }}
          onMouseLeave={e => { if(showButton) e.currentTarget.style.background = "#8A9E84"; }}
        >
          Begin Your Programme →
        </button>
      </div>
    </div>
  );
}

export function Celebrate({day, onClose}) {
  const [phase, setPhase] = useState("burst");
  useEffect(() => {
    const t = setTimeout(() => setPhase("settled"), 800);
    return () => clearTimeout(t);
  }, []);

  const isComplete = day === 14;

  return (
    <div style={{
      position:"fixed",inset:0,
      background:"rgba(11,13,16,0.78)",
      backdropFilter:"blur(6px)",
      zIndex:200,
      display:"flex",alignItems:"flex-end",justifyContent:"center",
    }}>
      <style>{`
        @keyframes sheetUp {
          from { transform:translateY(100%); }
          to   { transform:translateY(0); }
        }
        @keyframes iconBounce {
          0%   { transform:scale(0.3) rotate(-15deg); opacity:0; }
          60%  { transform:scale(1.15) rotate(4deg); opacity:1; }
          80%  { transform:scale(0.95) rotate(-2deg); }
          100% { transform:scale(1) rotate(0deg); opacity:1; }
        }
        @keyframes textFade {
          from { transform:translateY(12px); opacity:0; }
          to   { transform:translateY(0); opacity:1; }
        }
      `}</style>

      <div style={{
        width:"100%",maxWidth:430,
        background: isComplete ? T.navy : T.surface,
        borderRadius:"28px 28px 0 0",
        padding:"0 0 48px",
        animation:"sheetUp 0.42s cubic-bezier(0.22,1,0.36,1)",
        position:"relative",
        overflow:"hidden",
      }}>
        {/* Gold top rule */}
        <div 
style={{height:3,background:"linear-gradient(90deg,"+T.gold+",rgba(138,158,132,0.3))"}}/>

        {/* Confetti only on day 14 */}
        {isComplete && phase==="burst" && <Confetti/>}

        {/* Drag handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"14px 0 0"}}>
          <div 
style={{width:36,height:3,borderRadius:2,background:isComplete?"rgba(255,255,255,0.15)":T.border}}/>
        </div>

        {/* Animated icon */}
        <div style={{
          textAlign:"center",
          padding:"24px 0 8px",
          animation:"iconBounce 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both",
        }}>
          {isComplete ? (
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="32" fill="rgba(138,158,132,0.15)" 
stroke={T.gold} strokeWidth="1.5"/>
              <path d="M20 36l12 12 20-20" stroke={T.gold} strokeWidth="3" 
strokeLinecap="round" strokeLinejoin="round"/>
              {[0,60,120,180,240,300].map(a => (
                <line key={a}
                  x1={36+28*Math.cos(a*Math.PI/180)}
                  y1={36+28*Math.sin(a*Math.PI/180)}
                  x2={36+34*Math.cos(a*Math.PI/180)}
                  y2={36+34*Math.sin(a*Math.PI/180)}
                  stroke={T.gold} strokeWidth="2" strokeLinecap="round" 
opacity="0.6"
                />
              ))}
            </svg>
          ) : (
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" fill={T.navyLight} 
stroke={T.navy} strokeWidth="1.5"/>
              <path d="M18 32l10 10 18-18" stroke={T.navy} 
strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="32" cy="32" r="28" fill="none" stroke={T.gold} 
strokeWidth="1.5"
                strokeDasharray="176" strokeDashoffset={176-(176*day/14)}
                strokeLinecap="round" transform="rotate(-90 32 32)"/>
            </svg>
          )}
        </div>

        {/* Text */}
        <div style={{
          padding:"0 28px",
          animation:"textFade 0.5s ease 0.3s both",
        }}>
          <h2 style={{
            fontFamily:T.serif,fontSize:28,fontWeight:700,
            color: isComplete ? "white" : T.text,
            textAlign:"center",marginBottom:10,letterSpacing:"-0.3px",
          }}>
            {isComplete ? "Programme complete." : "Session "+day+" done."}
          </h2>
          <p style={{
            fontSize:14,
            color: isComplete ? "rgba(255,255,255,0.6)" : T.text3,
            textAlign:"center",lineHeight:1.65,marginBottom:8,
          }}>
            {isComplete ? (
              (() => {
                const amb = (() => { try { return 
localStorage.getItem("au1_ambition") || ""; } catch { return ""; } })();
                return amb
                  ? "14 sessions. You set out to be " + amb + ". You now have the voice to match the ambition."
                  : "14 sessions. You now communicate with clarity, structure, and impact. This is just the beginning.";
              })()
            ) : "Each session is a rep. Every rep builds the habit. Keep going."}
          </p>

          {/* Progress ring label */}
          {!isComplete && (
            <div style={{
              display:"flex",alignItems:"center",justifyContent:"center",
              gap:6,marginBottom:8,
              animation:"textFade 0.5s ease 0.5s both",
            }}>
              <div style={{height:1,flex:1,background:T.border}}/>
              <span style={{fontSize:12,fontWeight:600,color:T.gold}}>
                {day} / 14 sessions complete
              </span>
              <div style={{height:1,flex:1,background:T.border}}/>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{
          padding:"8px 28px 0",
          animation:"textFade 0.5s ease 0.55s both",
        }}>
          <button onClick={onClose} style={{
            width:"100%",padding:"16px",
            borderRadius:12,border:"none",cursor:"pointer",
            background: isComplete
              ? "linear-gradient(135deg,"+T.gold+" 0%,"+T.goldDark+" 100%)"
              : "linear-gradient(135deg,"+T.navy+" 0%,#1E2D45 100%)",
            color:"white",fontSize:15,fontWeight:700,
            boxShadow: isComplete
              ? "0 4px 20px rgba(183,154,107,0.4)"
              : "0 4px 16px rgba(17,28,46,0.3)",
            letterSpacing:"0.2px",
          }}>
            {isComplete ? "See your results" : "Keep going →"}
          </button>
        </div>
      </div>
    </div>
  );
}

