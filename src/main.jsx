import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import App from "./App.jsx";
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
  componentDidCatch(err, info) { console.error("ErrorBoundary caught:", err, info); }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 24, fontFamily: "monospace", color: "red", background: "white", whiteSpace: "pre-wrap", position: "fixed", inset: 0, overflow: "auto", zIndex: 9999 }}>
          <strong>Runtime error:</strong>{"\n"}{String(this.state.err)}{"\n\n"}{this.state.err?.stack}
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
    </ErrorBoundary>
  </StrictMode>
);

registerSW();
initPurchases();
