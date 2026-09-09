export const config = { maxDuration: 30 };

function validateAccessCode(req) {
  const expected = process.env.ACCESS_CODE || process.env.VITE_ACCESS_CODE || "";
  if (!expected) {
    console.error("[auth] ACCESS_CODE env var is not set — /api/transcribe is OPEN to all callers");
    return true;
  }
  const provided = req.headers["x-access-code"] || "";
  return provided === expected;
}

// ── CORS allow-list ──────────────────────────────────────────────────────────
// capacitor://localhost is the native app's REAL origin — confirmed via a
// live device console log showing the failed fetch, plus direct curl tests
// against this endpoint (Origin: capacitor://localhost -> 403, matching the
// production outage this caused). The earlier assumption that the iosScheme:
// "https" config setting would make WKWebView report "https://localhost" as
// the fetch Origin was wrong: that setting affects the WebView's own secure-
// context APIs (getUserMedia), not the Origin header value WKWebView sends
// on outgoing cross-origin fetches, which still uses the literal registered
// scheme name "capacitor". Keeping https://localhost too in case a future
// Capacitor/iOS version changes this. https://amplifyu.vercel.app is the
// origin for anyone using the site directly in a browser.
const ALLOWED_ORIGINS = ["capacitor://localhost", "https://localhost", "https://amplifyu.vercel.app"];

// ── Rate limiting ────────────────────────────────────────────────────────────
// Best-effort, in-memory per-IP limiter — no Redis/KV needed at this app's
// scale. It only tracks requests seen by whichever serverless instance
// handles them (resets on cold start, isn't a hard global cap under heavy
// horizontal scaling), but it's enough to stop a single client — or a
// leaked access code — hammering this endpoint.
// 80/min: transcription is called once per recording, and some lesson steps
// (multi-turn scenarios) record several times in a row; each Whisper call is
// also cheaper than a full Claude generation. This also has to cover the app
// owner (or QA) rapidly clicking through many days' rehearsal/simulation
// steps back-to-back — a legitimate burst that can exceed a tightly-tuned
// per-end-user estimate well before it looks like automated abuse. 80/min
// still caps a runaway script while giving a fast full-app testing pass real
// headroom. (Raised from 40 after exactly this burst tripped the limit
// during a full-app QA sweep.)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 80;
const rateLimitBuckets = new Map();

function isRateLimited(req) {
  const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  bucket.count++;
  return bucket.count > RATE_LIMIT_MAX;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  res.setHeader("Vary", "Origin");
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return res.status(403).json({ error: "Origin not allowed" });
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-access-code");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (isRateLimited(req)) return res.status(429).json({ error: "Too many requests. Please try again shortly." });
  if (!validateAccessCode(req)) return res.status(401).json({ error: "Unauthorized" });

  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_KEY" });

  const { b64, mimeType } = req.body;
  if (!b64) return res.status(400).json({ error: "No audio data provided" });

  try {
    const ext = mimeType && mimeType.includes("mp4") ? "mp4"
      : mimeType && mimeType.includes("ogg") ? "ogg" : "webm";

    const buf = Buffer.from(b64, "base64");
    const blob = new Blob([buf], { type: mimeType || "audio/webm" });

    const form = new FormData();
    form.append("file", blob, `audio.${ext}`);
    form.append("model", "whisper-1");

    const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}` },
      body: form,
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error("[transcribe] Whisper error:", err);
      return res.status(500).json({ error: "Transcription failed" });
    }

    const data = await resp.json();
    const text = data.text || "";
    console.log("[transcribe] success, input bytes:", buf.length, "output text length:", text.length);
    return res.status(200).json({ text });
  } catch (err) {
    console.error("[transcribe] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
