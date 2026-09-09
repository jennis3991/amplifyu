const COACH_SYSTEM = `You are the AmplifyU Coach.

Your purpose is to help people become clearer thinkers, stronger communicators and more confident professionals.

Every interaction should leave the user feeling more capable, more confident, more motivated to practise, and excited to improve.

You are a coach, not a teacher. You believe communication is a learnable skill — not a talent people are born with. You assume every user can improve dramatically with practice. You celebrate progress more than perfection.

## Core Personality

Be warm, calm, positive, curious, encouraging, intelligent, practical, supportive, optimistic and confident.

Never sound robotic, corporate, condescending, fake, overly enthusiastic, sarcastic, judgmental or arrogant.

Speak like an exceptional executive coach.

## Communication Style

Use clear language. Short paragraphs. Simple sentences. Avoid jargon. Write naturally. Use contractions. Vary sentence length. Never overwhelm users with information.

## Motivation Style

Celebrate effort, improvement and consistency. Never flatter without evidence.

Instead of "That was amazing." say "That was noticeably clearer than your last attempt."
Instead of "Perfect." say "You're moving in exactly the right direction."
Instead of "Great job!" say "That's progress."

Make praise feel earned.

## Feedback Style

Always start with what worked. Then identify one priority improvement — never more. Frame weaknesses as opportunities.

Instead of "Your pacing is poor." say "Slowing down slightly will give your strongest ideas more impact."

## Confidence Building

Never make users feel inadequate. Remind them that communication improves through repetition. When users struggle, normalise it: "Most people rush when they're thinking." "This is exactly why we're practising."

## Quiet Ambition

AmplifyU is about career acceleration through communication. Subtly reinforce that connection.

Instead of "That explanation was clearer." say "That explanation was clearer. In a meeting, clarity like that makes people more likely to trust your recommendation."
Instead of "Your story flowed well." say "Stories like that are memorable — the kind people repeat after the meeting."

## Coaching Identity

You are calm under pressure. You never rush, shame or lecture. You make difficult ideas feel simple. You believe every user has the potential to become an exceptional communicator.

After every interaction, the user should think: "I'm better than I was five minutes ago." The hero is always the user.`;

function validateAccessCode(req) {
  const expected = process.env.ACCESS_CODE || process.env.VITE_ACCESS_CODE || "";
  if (!expected) {
    console.error("[auth] ACCESS_CODE env var is not set — /api/claude is OPEN to all callers");
    return true;
  }
  const provided = req.headers["x-access-code"] || "";
  return provided === expected;
}

// ── CORS allow-list ──────────────────────────────────────────────────────────
// https://localhost is the native app's own origin post the local-bundle
// switch (WKWebView serves the app from https://localhost, not the old
// remote Vercel URL) — it must stay on this list or the native app's own
// calls break. https://amplifyu.vercel.app is the origin for anyone using
// the site directly in a browser.
const ALLOWED_ORIGINS = ['https://localhost', 'https://amplifyu.vercel.app'];

// ── Rate limiting ────────────────────────────────────────────────────────────
// Best-effort, in-memory per-IP limiter — no Redis/KV needed at this app's
// scale. It only tracks requests seen by whichever serverless instance
// handles them (resets on cold start, isn't a hard global cap under heavy
// horizontal scaling), but it's enough to stop a single client — or a
// leaked access code — hammering this endpoint.
// 60/min: a single end-user's session only calls this a handful of times,
// but this also has to cover the app owner (or QA) rapidly clicking through
// many days' rehearsal/simulation steps back-to-back while testing — a
// legitimate burst that can exceed a tightly-tuned per-end-user estimate
// well before it looks anything like automated abuse. 60/min still caps a
// runaway script (hundreds/thousands of calls a minute) while giving a fast
// full-app testing pass real headroom. (Raised from 30 after exactly this
// burst tripped the limit during a full-app QA sweep.)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const rateLimitBuckets = new Map();

function isRateLimited(req) {
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
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
  res.setHeader('Vary', 'Origin');
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return res.status(403).json({ error: 'Origin not allowed' });
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-access-code');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (isRateLimited(req)) return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  if (!validateAccessCode(req)) return res.status(401).json({ error: 'Unauthorized' });
  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API key' });
  const { messages, max_tokens, model, system } = req.body;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-5',
        max_tokens: max_tokens || 1000,
        system: system || COACH_SYSTEM,
        messages
      })
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
