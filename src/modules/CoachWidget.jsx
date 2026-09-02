import { useState, useRef } from 'react';
import { T } from '../theme.js';

export function CoachWidget({ lesson, scenario }) {
  const [draft, setDraft]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [coaching, setCoaching] = useState(null);
  const [err, setErr]         = useState(null);
  const [didCopy, setDidCopy] = useState(false);
  const taRef = useRef(null);

  async function submit() {
    const txt = draft.trim();
    if (!txt || busy) return;
    setBusy(true); setCoaching(null); setErr(null);
    const sysPrompt =
      "You are a premium executive communication coach. The user practised: " + lesson.title + ". " +
      (scenario ? "Scenario: " + scenario + ". " : "") +
      "Rewrite their response to be more confident, clear, and authoritative. " +
      "Never use em dashes in your response; use a comma or hyphen instead. " +
      "Reply with ONLY this JSON (no markdown): " +
      '{"rephrased":"improved version","insight":"one precise coaching observation, max 20 words"}';
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 600, messages: [{ role: "user", content: sysPrompt + "\n\nResponse to improve: " + txt }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("API error");
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
      let result = null;
      const m = text.match(/\{[\s\S]*"rephrased"[\s\S]*\}/);
      if (m) try { result = JSON.parse(m[0]); } catch (_) {}
      if (!result) result = { rephrased: text || txt, insight: "Lead with clarity. Remove qualifiers." };
      setCoaching({ rephrased: result.rephrased || txt, insight: result.insight || "" });
    } catch (e) {
      setErr("Your coach is unavailable right now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setDraft(""); setCoaching(null); setErr(null); setDidCopy(false);
    setTimeout(() => taRef.current?.focus(), 50);
  }

  function copyIt() {
    if (!coaching) return;
    try { navigator.clipboard?.writeText(coaching.rephrased); } catch (_) {}
    setDidCopy(true);
    setTimeout(() => setDidCopy(false), 2000);
  }

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  // ── The Coach — designed as a private coaching studio, not a chatbot ───
  return (
    <div style={{
      borderRadius: 6,
      overflow: "hidden",
      border: "1px solid rgba(44,39,32,0.08)",
      boxShadow: "0 4px 20px rgba(44,39,32,0.07), 0 1px 4px rgba(44,39,32,0.04)",
    }}>
      {/* Coach header — like a private study nameplate */}
      <div style={{
        background: T.cardDark,
        padding: "18px 24px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(138,158,132,0.15)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Subtle ambient glow */}
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 80, background: "radial-gradient(ellipse, rgba(138,158,132,0.08) 0%, transparent 70%)", pointerEvents: "none" }}/>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3.5px", fontFamily: T.sans, marginBottom: 3 }}>
            Your Coach
          </div>
          <div style={{ fontFamily: T.serif, fontSize: 14, color: "rgba(255,255,255,0.75)", fontStyle: "italic", fontWeight: 400 }}>
            {scenario ? "Speak to this scenario." : "Write it. Then refine it."}
          </div>
        </div>
        {/* Brass monogram */}
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          border: "1px solid rgba(138,158,132,0.35)",
          background: "rgba(138,158,132,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5.5" r="2.5" stroke={T.gold} strokeWidth="1.1"/>
            <path d="M2.5 14c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" stroke={T.gold} strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Input — warm writing surface */}
      {!coaching && (
        <div style={{ background: T.surface }}>
          <textarea
            ref={taRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={scenario
              ? "How would you respond in this situation…"
              : "Write your response here, then let your coach refine it…"}
            rows={5}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
            style={{
              width: "100%", padding: "20px 24px 16px",
              border: "none", outline: "none", resize: "none",
              background: "transparent",
              fontSize: 14, color: T.text, lineHeight: 1.7,
              fontFamily: T.sans, fontWeight: 300,
              boxSizing: "border-box",
            }}
          />
          <div style={{
            padding: "10px 20px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: "1px solid " + T.divider,
          }}>
            <span style={{ fontSize: 11, color: T.text4, fontFamily: T.sans, fontStyle: "italic" }}>
              {wordCount > 0 ? wordCount + (wordCount === 1 ? " word" : " words") : "Start writing…"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {draft.trim() && (
                <span style={{ fontSize: 10, color: T.text4, fontFamily: T.sans }}>⌘↵ to submit</span>
              )}
              <button
                onClick={submit}
                disabled={!draft.trim() || busy}
                className={draft.trim() && !busy ? "au-cta" : ""}
                style={{
                  padding: "8px 20px", borderRadius: 4, border: "none",
                  background: draft.trim() && !busy ? T.gold : "rgba(44,39,32,0.08)",
                  color: draft.trim() && !busy ? "white" : T.text4,
                  fontSize: 12, fontWeight: 500, cursor: draft.trim() && !busy ? "pointer" : "default",
                  fontFamily: T.sans, letterSpacing: "0.2px",
                  transition: "all 0.2s ease",
                  boxShadow: draft.trim() && !busy ? "0 2px 10px rgba(138,158,132,0.25)" : "none",
                }}>
                {busy ? "Reading…" : "Refine"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thinking state */}
      {busy && (
        <div style={{
          background: T.cardDark, padding: "24px",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ display: "flex", gap: 5 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: "50%", background: T.gold,
                animation: `breathe 1.4s ease ${i * 0.22}s infinite`,
              }}/>
            ))}
          </div>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontStyle: "italic", fontFamily: T.sans, fontWeight: 300 }}>
            Your coach is reviewing your response…
          </span>
        </div>
      )}

      {/* ── Coaching response — styled as a private coaching note ── */}
      {coaching && (
        <div className="au-coach-enter">

          {/* Your draft — shown small and muted, not as a feature */}
          <div style={{
            background: T.card, padding: "14px 24px",
            borderBottom: "1px solid " + T.divider,
          }}>
            <div style={{ fontSize: 9, color: T.text4, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: 6, fontFamily: T.sans }}>Your version</div>
            <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.55, margin: 0, fontStyle: "italic", fontFamily: T.sans }}>{draft.trim()}</p>
          </div>

          {/* The coach's version — the centrepiece */}
          <div style={{ background: T.cardDark, padding: "24px 24px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: "linear-gradient(90deg," + T.gold + " 0%, rgba(138,158,132,0.15) 100%)" }}/>
            {/* Large decorative mark */}
            <div style={{ position: "absolute", top: 4, right: 18, fontFamily: T.serif, fontSize: 72, lineHeight: 1, color: "rgba(176,139,82,0.06)", userSelect: "none" }}>"</div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "3px", fontFamily: T.sans }}>A stronger version</div>
                <button onClick={copyIt} style={{
                  padding: "3px 12px", borderRadius: 3,
                  border: "1px solid " + (didCopy ? "rgba(176,139,82,0.5)" : "rgba(255,255,255,0.12)"),
                  background: didCopy ? "rgba(138,158,132,0.12)" : "transparent",
                  color: didCopy ? T.gold : "rgba(255,255,255,0.35)",
                  fontSize: 10, cursor: "pointer", fontFamily: T.sans,
                  transition: "all 0.2s ease",
                }}>
                  {didCopy ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <p style={{
                fontFamily: T.serif, fontSize: 16, fontStyle: "italic",
                color: "rgba(255,255,255,0.90)", lineHeight: 1.65, margin: 0,
                letterSpacing: "-0.1px",
              }}>{coaching.rephrased}</p>
            </div>
          </div>

          {/* The coaching note — signed, precise */}
          {coaching.insight && (
            <div style={{
              background: T.goldLight, padding: "14px 24px",
              borderTop: "1px solid rgba(138,158,132,0.15)",
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <div style={{ width: 1, background: T.gold, alignSelf: "stretch", flexShrink: 0, opacity: 0.6 }}/>
              <div>
                <div style={{ fontSize: 9, color: T.goldDark, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: 5, fontFamily: T.sans }}>Why it lands harder</div>
                <p style={{ fontSize: 13, color: T.goldDark, lineHeight: 1.55, margin: 0, fontFamily: T.sans, fontWeight: 400 }}>{coaching.insight}</p>
              </div>
            </div>
          )}

          {/* Reset — minimal text link */}
          <div style={{ background: T.surface, padding: "12px 24px", borderTop: "1px solid " + T.divider, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={reset} style={{
              fontSize: 12, color: T.text3, background: "none", border: "none",
              cursor: "pointer", fontFamily: T.sans, fontWeight: 400,
              textDecoration: "underline", textUnderlineOffset: "2px",
              textDecorationColor: T.border,
              transition: "color 0.15s ease",
            }}
            onMouseEnter={e => e.target.style.color = T.text}
            onMouseLeave={e => e.target.style.color = T.text3}>
              Try a different approach
            </button>
          </div>
        </div>
      )}

      {/* Error — warm, not alarming */}
      {err && (
        <div style={{
          background: "#F8F2EE", padding: "16px 24px",
          borderTop: "1px solid " + T.border,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <p style={{ fontSize: 13, color: "#6B3A28", fontFamily: T.sans, fontWeight: 300, margin: 0 }}>{err}</p>
          <button onClick={() => setErr(null)} style={{
            fontSize: 12, color: "#8B4A38", background: "none", border: "none",
            cursor: "pointer", fontFamily: T.sans, flexShrink: 0, marginLeft: 12,
          }}>Dismiss</button>
        </div>
      )}
    </div>
  );
}

// ─── D10 Simulation Feedback + Mobile helpers ────────────────────────────────

