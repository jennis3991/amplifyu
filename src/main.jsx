import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import App from "./App.jsx";
import LaunchMark from "./components/LaunchMark.jsx";
import { registerSW } from "./pwa.js";
import { initPurchases } from "./lib/purchases.js";

// The native iOS app now loads its UI from the local bundle
// (capacitor://localhost, see capacitor.config.json) rather than fetching it
// from this origin on every launch — that's what makes offline access to
// lesson content actually work. A relative fetch("/api/...") would otherwise
// resolve against capacitor://localhost, where no backend exists, so on
// native platforms we rewrite it to the real deployed origin below.
const API_ORIGIN = "https://amplifyu.vercel.app";

// Inject x-access-code header on every /api/ request so server-side
// validation can reject unauthenticated callers, and rewrite relative /api/
// paths to the real backend origin when running natively (see above).
const _fetch = window.fetch.bind(window);
window.fetch = function (url, opts = {}) {
  if (typeof url === "string" && url.startsWith("/api/")) {
    const code = import.meta.env.VITE_ACCESS_CODE || "";
    opts = { ...opts, headers: { ...opts.headers, "x-access-code": code } };
    if (Capacitor.isNativePlatform()) url = API_ORIGIN + url;
  }
  return _fetch(url, opts);
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) {
    console.error("ErrorBoundary caught:", err, info);
    // LaunchMark normally removes the static boot logo, but a crash replaces
    // it too, which would leave the logo covering this message for good.
    document.getElementById("au-boot-mark")?.remove();
    document.documentElement.style.background = "";
  }
  render() {
    if (this.state.err) {
      // A calm, branded fallback instead of the raw error and stack trace.
      // The details still go to the console via componentDidCatch.
      return (
        <div onClick={() => window.location.reload()} role="button" style={{ position: "fixed", inset: 0, zIndex: 10001, background: "#F7F3EC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center", cursor: "pointer", fontFamily: "'Inter',-apple-system,sans-serif" }}>
          <img src="/logo-mark.png" alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 10, marginBottom: 22, background: "#0D0B08" }} />
          <div style={{ fontFamily: "'Cormorant Garamond','Georgia',serif", fontSize: 28, fontWeight: 500, color: "#2C2416", marginBottom: 8 }}>Something went wrong.</div>
          <div style={{ fontSize: 15, color: "#6B5E44", marginBottom: 24 }}>Your progress is saved on this device.</div>
          <div style={{ padding: "13px 28px", borderRadius: 6, background: "#2C2416", color: "#F7F3EC", fontSize: 14, fontWeight: 600 }}>Tap to reload</div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <LaunchMark />
    </ErrorBoundary>
  </StrictMode>
);

registerSW();
initPurchases();
