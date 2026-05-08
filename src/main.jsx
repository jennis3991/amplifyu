import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

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
