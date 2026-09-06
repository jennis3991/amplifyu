import { useState, useEffect } from "react";
import { T, S, SI } from "../theme.js";
import { getSubscriptionProduct, purchaseSubscription, restorePurchases } from "../lib/purchases.js";

const INK = "#1A1510";
const CREAM = "#F5EDE0";

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="10.5" width="14" height="10" rx="2" {...SI} />
      <path d="M8 10.5V7.5a4 4 0 018 0v3" {...SI} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 4l16 16M20 4L4 20" stroke={CREAM} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function VoiceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 14V10" {...SI} />
      <path d="M12 17V7" {...SI} />
      <path d="M18 14V10" {...SI} />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="12" height="10" rx="2" {...SI} />
      <path d="M15 10.5l6-3v9l-6-3z" {...SI} />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.2" {...SI} />
      <path d="M5 20c1-3.8 4-5.5 7-5.5s6 1.7 7 5.5" {...SI} />
    </svg>
  );
}

const BENEFITS = [
  { icon: VoiceIcon, text: "Get personalised voice feedback" },
  { icon: VideoIcon, text: "Practice with realistic simulations" },
  { icon: PersonIcon, text: "Build your personal brand and storytelling" },
];

export function Paywall({ onClose, onSubscribed, headline = "Unlock Day 2 and beyond" }) {
  const [status, setStatus] = useState("idle"); // idle | purchasing | restoring | subscribed | restored
  const [priceString, setPriceString] = useState("£9.99");

  // Best-effort: reflect the real store price once it resolves, fall back to £9.99.
  useEffect(() => {
    getSubscriptionProduct()
      .then((product) => { if (product?.priceString) setPriceString(product.priceString); })
      .catch(() => {});
  }, []);

  function handleSubscribe() {
    if (status === "purchasing" || status === "restoring") return;
    setStatus("purchasing");
    purchaseSubscription()
      .then(() => {
        setStatus("subscribed");
        setTimeout(() => { if (onSubscribed) onSubscribed(); else onClose?.(); }, 900);
      })
      .catch(() => {
        onClose?.();
      });
  }

  function handleRestore() {
    if (status === "purchasing" || status === "restoring") return;
    setStatus("restoring");
    restorePurchases()
      .then((found) => {
        if (found) {
          setStatus("restored");
          setTimeout(() => { if (onSubscribed) onSubscribed(); else onClose?.(); }, 900);
        } else {
          setStatus("idle");
        }
      })
      .catch(() => {
        setStatus("idle");
      });
  }

  const busy = status === "purchasing" || status === "restoring";
  const done = status === "subscribed" || status === "restored";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(10,8,5,0.6)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        animation: "pwFadeIn 0.25s ease both",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        style={{
          width: "100%", maxWidth: 480,
          maxHeight: "94vh", overflowY: "auto",
          background: INK,
          borderRadius: "20px 20px 0 0",
          padding: "14px 28px calc(28px + env(safe-area-inset-bottom,0px))",
          boxSizing: "border-box",
          position: "relative",
          animation: "pwSlideUp 0.42s cubic-bezier(0.22,1,0.36,1)",
          fontFamily: T.sans,
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(245,237,224,0.18)" }} />
        </div>

        {/* Close button */}
        <button
          onClick={() => onClose?.()}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 20,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <CloseIcon />
        </button>

        {/* Lock + PREMIUM */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            border: `1px solid ${S}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 10,
          }}>
            <LockIcon />
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "3px",
            textTransform: "uppercase", color: S,
          }}>Premium</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: T.serif, fontSize: "clamp(30px, 7vw, 38px)", fontWeight: 500,
          color: CREAM, textAlign: "center", margin: "0 0 14px", lineHeight: 1.12,
        }}>{headline}</h1>

        {/* Subtext */}
        <p style={{
          fontSize: 15.5, color: "rgba(245,237,224,0.68)", textAlign: "center",
          lineHeight: 1.5, margin: "0 0 28px",
        }}>AI coaching for the skills that move your career forward.</p>

        {/* Benefits */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 26 }}>
          {BENEFITS.map(({ icon: Icon, text }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: "rgba(138,158,132,0.16)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon />
              </div>
              <span style={{ fontSize: 15, color: "rgba(245,237,224,0.92)", lineHeight: 1.35 }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "rgba(245,237,224,0.14)", margin: "0 0 20px" }} />

        <p style={{
          fontFamily: T.serif, fontSize: 22, fontStyle: "italic", color: CREAM,
          textAlign: "center", margin: "0 0 20px",
        }}>Advance your career.</p>

        <div style={{ height: 1, background: "rgba(245,237,224,0.14)", margin: "0 0 22px" }} />

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ fontFamily: T.serif, fontSize: 32, fontWeight: 600, color: CREAM }}>{priceString}</span>
          <span style={{ fontFamily: T.serif, fontSize: 17, fontStyle: "italic", color: "rgba(245,237,224,0.55)" }}>/ month</span>
        </div>

        {/* Subscribe button */}
        <button
          onClick={handleSubscribe}
          disabled={busy || done}
          style={{
            width: "100%", padding: "17px 20px", borderRadius: 30,
            border: "none", background: done ? "rgba(138,158,132,0.85)" : CREAM,
            color: INK, fontSize: 16, fontWeight: 700, fontFamily: T.sans,
            cursor: busy || done ? "default" : "pointer",
            opacity: busy ? 0.7 : 1,
            marginBottom: 16,
          }}
        >
          {status === "purchasing" ? "Processing…" : status === "subscribed" ? "Subscribed ✓" : "Subscribe Now"}
        </button>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 12.5, color: "rgba(245,237,224,0.4)", margin: 0 }}>
          Cancel anytime{" · "}
          <span
            onClick={handleRestore}
            style={{
              textDecoration: "underline", cursor: busy || done ? "default" : "pointer",
              color: status === "restored" ? S : "rgba(245,237,224,0.4)",
            }}
          >
            {status === "restoring" ? "Restoring…" : status === "restored" ? "Restored ✓" : "Restore Purchases"}
          </span>
        </p>
      </div>

      <style>{`
        @keyframes pwFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pwSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}
