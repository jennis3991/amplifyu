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
    return res.status(200).json({ text: data.text || "" });
  } catch (err) {
    console.error("[transcribe] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
