import { useState } from "react";

const DUSTY_ROSE = "#C9A8A0";
const CREAM = "#F5EDE0";
const INK = "#1A1510";

export function AccessGate({ onSuccess }) {
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);
  const [logoRise, setLogoRise] = useState(false);
  const [exiting, setExiting] = useState(false);

  function handleSubmit(e) {
    e?.preventDefault();
    const entered = code.trim();
    if (!entered) return;
    const expected = import.meta.env.VITE_ACCESS_CODE || "";
    if (entered === expected) {
      console.log("[AccessGate] correct code — starting logo-rise animation");
      setLogoRise(true);
      // Rise plays 0→600ms. At 700ms start fade. onSuccess fires after fade completes.
      setTimeout(() => {
        try { localStorage.setItem("au1_authed", "true"); } catch (_) {}
        setExiting(true);
        setTimeout(onSuccess, 550);
      }, 700);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 620);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#0A0A0A",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', -apple-system, sans-serif",
      opacity: exiting ? 0 : 1,
      transition: "opacity 0.55s ease",
      padding: "0 24px",
    }}>

      {/* Monogram */}
      <div style={{
        position: "relative",
        width: 92, height: 92,
        marginBottom: 20,
        transform: logoRise ? "translateY(-16px) scale(1.06)" : "translateY(0) scale(1)",
        transition: "transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)",
        filter: logoRise ? "drop-shadow(0 0 18px rgba(255,255,255,0.55))" : "drop-shadow(0 0 0px rgba(255,255,255,0))",
      }}>
        <img
          src="/logo-mark.png"
          alt="AmplifyU"
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      </div>

      {/* Wordmark */}
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "5px",
        color: "rgba(255,255,255,0.3)",
        textTransform: "uppercase",
        marginBottom: 48,
      }}>AmplifyU</div>

      {/* Headline */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(34px, 5.5vw, 52px)",
        fontWeight: 400,
        color: CREAM,
        margin: "0 0 14px",
        textAlign: "center",
        letterSpacing: "-0.5px",
        lineHeight: 1.1,
      }}>Continue your practice.</h1>

      {/* Subhead */}
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(18px, 2.5vw, 24px)",
        color: "rgba(245,237,224,0.5)",
        margin: "0 0 52px",
        textAlign: "center",
        lineHeight: 1.6,
      }}>
        Private practice.<br />
        <em>Public impact.</em>
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 320 }}>
        <label style={{
          display: "block",
          fontFamily: "'Inter', sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: 10,
        }}>Access Code</label>

        <input
          type="password"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="••••••••"
          autoComplete="off"
          autoFocus
          style={{
            display: "block",
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3,
            padding: "14px 16px",
            color: CREAM,
            fontSize: 16,
            fontFamily: "'Inter', sans-serif",
            marginBottom: 14,
            boxSizing: "border-box",
            animation: shake ? "gateShake 0.55s ease both" : "none",
            transition: "border-color 0.2s",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            background: DUSTY_ROSE,
            border: "none",
            borderRadius: 3,
            padding: "14px 20px",
            color: INK,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          Enter <span style={{ fontSize: 17, fontWeight: 300, lineHeight: 1 }}>&#8594;</span>
        </button>
      </form>

      {/* Closing quote */}
      <div style={{ marginTop: 72, textAlign: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, marginBottom: 18, letterSpacing: "4px" }}>&#9670;</div>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 15,
          fontStyle: "italic",
          color: "rgba(245,237,224,0.28)",
          margin: 0,
          lineHeight: 1.7,
        }}>"Great communicators are made, not born."</p>
      </div>

      <style>{`
        @keyframes gateShake {
          0%,100% { transform: translateX(0); }
          18%      { transform: translateX(-9px); }
          36%      { transform: translateX(9px); }
          54%      { transform: translateX(-6px); }
          72%      { transform: translateX(6px); }
          88%      { transform: translateX(-3px); }
        }
      `}</style>
    </div>
  );
}
