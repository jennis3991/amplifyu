export const config = { maxDuration: 30 };

// TEMPORARY DEBUG helpers — none of these reveal the actual string, only
// its shape: a checksum, the index of the first differing character, and
// whether it's plain printable ASCII (catches smart quotes, NBSP, and other
// invisible characters a copy-paste can introduce).
function checksum(str) {
  let sum = 0, xor = 0;
  for (let i = 0; i < str.length; i++) { sum += str.charCodeAt(i); xor ^= str.charCodeAt(i); }
  return `sum=${sum},xor=${xor}`;
}
function firstDiffIndex(a, b) {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) { if (a[i] !== b[i]) return i; }
  return a.length === b.length ? -1 : len;
}
function isPrintableAscii(str) {
  return /^[\x20-\x7E]*$/.test(str);
}

function validateAccessCode(req) {
  const expected = process.env.ACCESS_CODE || process.env.VITE_ACCESS_CODE || "";
  const provided = req.headers["x-access-code"] || "";
  // TEMPORARY DEBUG — diagnosing a persistent 401 on this route. Logs
  // presence/length only, never the actual secret values. Remove once
  // the mismatch is found.
  console.log(
    "[auth-debug]",
    "ACCESS_CODE set:", process.env.ACCESS_CODE !== undefined,
    "| ACCESS_CODE length:", (process.env.ACCESS_CODE || "").length,
    "| VITE_ACCESS_CODE set:", process.env.VITE_ACCESS_CODE !== undefined,
    "| VITE_ACCESS_CODE length:", (process.env.VITE_ACCESS_CODE || "").length,
    "| header present:", Object.prototype.hasOwnProperty.call(req.headers, "x-access-code"),
    "| provided length:", provided.length,
    "| expected length:", expected.length,
    "| match:", provided === expected
  );
  console.log(
    "[auth-debug-2]",
    "expected checksum:", checksum(expected),
    "| provided checksum:", checksum(provided),
    "| first diff index (0-based):", firstDiffIndex(provided, expected),
    "| expected printable-ascii:", isPrintableAscii(expected),
    "| provided printable-ascii:", isPrintableAscii(provided)
  );
  if (!expected) {
    console.error("[auth] ACCESS_CODE env var is not set — /api/transcribe is OPEN to all callers");
    return true;
  }
  return provided === expected;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-access-code");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
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
