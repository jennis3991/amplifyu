export const config = { maxDuration: 150 };

function validateAccessCode(req) {
  const expected = process.env.ACCESS_CODE || process.env.VITE_ACCESS_CODE || "";
  if (!expected) {
    console.error("[auth] ACCESS_CODE env var is not set — /api/generate-storyboard-image is OPEN to all callers");
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
const ALLOWED_ORIGINS = ['capacitor://localhost', 'https://localhost', 'https://amplifyu.vercel.app'];

// ── Rate limiting ────────────────────────────────────────────────────────────
// Best-effort, in-memory per-IP limiter — no Redis/KV needed at this app's
// scale. It only tracks requests seen by whichever serverless instance
// handles them (resets on cold start, isn't a hard global cap under heavy
// horizontal scaling), but it's enough to stop a single client — or a
// leaked access code — hammering this endpoint.
// 30/min: this is the most expensive call (gpt-image-1 generation), and
// naturally the lowest-volume — one story tops out around 1 cover + 6 scene
// panels. Doubled from the original 15 alongside the other two endpoints
// after a legitimate full-app QA sweep tripped this family of limits —
// this one is less likely to be hit by that pattern (Day8's Story Lab is
// one screen, not one per day), but keeping all three endpoints' safety
// margins consistent is simpler to reason about than tuning each in
// isolation. Still a tight cap relative to the other two endpoints given
// the cost per call.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
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

  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) {
    console.error('[storyboard-image] OPENAI_KEY is not set');
    return res.status(500).json({ error: 'Missing OPENAI_KEY environment variable' });
  }

  const { scenes, storyWorld, coverMode, coverTitle, coverSubtitle } = req.body;
  if (!scenes?.length) return res.status(400).json({ error: 'No scenes provided' });

  const character   = storyWorld?.character   || 'the protagonist';
  const audience    = storyWorld?.audience    || 'professional adult';
  const emotion     = storyWorld?.emotion     || 'Hopeful determination';
  const visualWorld = storyWorld?.visualWorld || 'Contemporary professional setting';
  const subject     = storyWorld?.subject     || 'A Story of Purpose';
  const lesson      = storyWorld?.lesson      || '';

  // ── COVER IMAGE MODE ────────────────────────────────────────────────────────
  if (coverMode) {
    const title = coverTitle || subject;
    const sub   = coverSubtitle || lesson || audience;

    // ── Step 1: Claude acts as editorial art director ──────────────────────
    // Analyse the full narrative and write a story-specific image prompt.
    const anthropicKey = process.env.ANTHROPIC_KEY;

    const sceneList = scenes.map((sc, i) =>
      `Scene ${i + 1} — ${sc.title || ''}${sc.description ? ': ' + sc.description : ''}${sc.visual ? ' | Visual: ' + sc.visual : ''}${sc.emotion ? ' | Emotion: ' + sc.emotion : ''}`
    ).join('\n');

    const artDirectorSystemPrompt = `You are a senior editorial art director at a world-class creative agency. You work with Netflix, Apple Books, Penguin Press, and Monocle. Your specialty is translating finished narratives into single, emotionally resonant cover images.

You never illustrate the story literally. You find the symbolic essence — the one image that makes someone think "I need to know the story behind this."`;

    const artDirectorUserPrompt = `Analyse this completed story and write a precise image generation prompt for its book cover.

TITLE: "${title}"
SUBTITLE: "${sub}"
THEME: ${subject}
EMOTIONAL ARC: ${emotion}
VISUAL WORLD: ${visualWorld}
CHARACTER: ${character}

COMPLETE NARRATIVE:
${sceneList}

YOUR PROCESS:
1. Identify the Core Theme (e.g. Crisis Leadership, Career Growth, Innovation, Resilience, Communication, Decision Making)
2. Identify the Central Conflict in one sentence
3. Identify the Emotional Tone (e.g. Determination, Hope, Urgency, Reflection, Courage)
4. Identify the Defining Moment — the single most pivotal point in the story
5. Choose the most resonant Visual Metaphor — something SPECIFIC to this story, not generic

METAPHOR GUIDANCE (pick whichever fits, or invent a better one):
- Crisis / urgency: a single red warning light glowing in a warmly lit office, phone off the hook on a polished desk in late-afternoon sun, a brass hourglass running out on an oak desk, empty executive chair by a window at golden hour
- Career growth / change: closed leather notebook beside a packed suitcase, a single brass key on a desk, golden light through a train station window, open doorway with warm light beyond
- Leadership / influence: conference room in warm morning light, empty podium in a softly lit hall, microphone stand on a warmly lit stage, window overlooking a city at golden hour
- Innovation / thinking: a prototype model under a warm desk lamp, chess pieces mid-game, open sketchbook with wordless line drawings, laptop glowing with a simple pixel-art character on a styled oak desk
- Communication / storytelling: vintage typewriter with a blank page, a fountain pen resting on a closed journal, warmly lit empty stage, a pen on a blank notepad in soft lamplight
- Personal breakthrough: golden light through a window, open road at sunrise, a phone on a styled desk glowing with a single app-style icon, compass on a worn map
- Trust / relationships: two coffee cups in warm light, a sealed envelope with no writing, two armchairs angled towards each other by a lamp

COVER REQUIREMENTS:
- Single cinematic image — NOT a collage
- NO people, NO faces, NO bodies, NO silhouettes
- NO text, words, letters or numbers anywhere in the image. Image models misspell lettering, so avoid anything that would normally carry writing: no documents, printed pages, slides, pitch decks, charts, labels, signs, book spines, packaging, clocks with numerals or readable screens
- Any paper, notebook or page must be blank or closed; a screen may glow with a simple abstract shape or a single wordless graphic (like a pixel-art character or an app-style icon), never words or numbers
- Warm, inviting, premium light: golden hour, soft lamplight or warm morning sun; rich warm tones (amber, honey, cream, brass); evening scenes are welcome if warmly lit; the main subject clearly visible
- NEVER cold, blue, grey, bleak or near-black; even urgent stories stay warm, with urgency shown through the subject and composition
- Match the emotional arc: uplifting or triumphant stories should feel optimistic, aspirational and quietly celebratory
- High-end lifestyle editorial styling: a considered, styled scene with rich textures (oak, linen, brass, plants) and a few personal details; never bare, austere, messy or cluttered (no crumbs, stains or dirt)
- Shallow depth of field, soft cinematic glow
- Generous negative space at the top
- Style: Apple editorial · Monocle · Cereal magazine · premium Penguin non-fiction cover
- Sophisticated, aspirational, emotionally resonant
- Portrait orientation (taller than wide)

IMPORTANT: The image must be unique to this story. Someone should look at it and understand the subject, conflict, mood and stakes without reading any text.

Output ONLY the image generation prompt. No preamble. No analysis. No headers. Just the prompt that will be sent directly to the image model.`;

    let coverPrompt = null;

    // Time limits, in order: art director (25 s) + image (100 s) stay inside
    // maxDuration (150 s), and the app waits 160 s, so the route always
    // answers or fails before the app gives up.
    const ART_DIRECTOR_TIMEOUT_MS = 25000;
    const IMAGE_TIMEOUT_MS = 100000;
    const tStart = Date.now();

    if (anthropicKey) {
      const tClaude = Date.now();
      const claudeCtl = new AbortController();
      const claudeTimer = setTimeout(() => claudeCtl.abort(), ART_DIRECTOR_TIMEOUT_MS);
      try {
        console.log('[cover-image] Calling Claude art director...');
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 800,
            system: artDirectorSystemPrompt,
            messages: [{ role: 'user', content: artDirectorUserPrompt }],
          }),
          signal: claudeCtl.signal,
        });
        const claudeData = await claudeRes.json();
        coverPrompt = claudeData.content?.[0]?.text?.trim() || null;
        if (!coverPrompt) console.warn('[cover-image] Claude returned no content, falling back');
      } catch (err) {
        const why = err.name === 'AbortError' ? `timed out after ${ART_DIRECTOR_TIMEOUT_MS / 1000}s` : err.message;
        console.warn('[cover-image] Claude art director failed, falling back:', why);
      } finally {
        clearTimeout(claudeTimer);
        console.log(`[cover-image] Art director step took ${Date.now() - tClaude}ms`);
      }
    } else {
      console.warn('[cover-image] ANTHROPIC_KEY not set — skipping art director step');
    }

    // ── Fallback: story-aware prompt built from storyWorld data ───────────
    if (!coverPrompt) {
      coverPrompt = `A premium editorial book cover image for a story titled "${title}". Theme: ${subject}. Emotional tone: ${emotion}. Setting: ${visualWorld}. Choose a single strong visual metaphor that captures the essence of this story — an object, a space, or a moment of anticipation. Style: high-end lifestyle editorial, Apple editorial, Monocle, premium Penguin non-fiction. Warm, inviting light (golden hour, soft lamplight or warm morning sun), rich warm tones, a styled scene with rich textures, never cold, bleak, bare or messy. Shallow depth of field, soft cinematic glow, generous negative space. NO people, NO faces, NO text, letters or numbers anywhere in the image: any paper or page is blank. Portrait orientation. Sophisticated, aspirational, emotionally resonant.`;
    }

    // Always end with the no-text rule, whichever prompt is used: image models
    // misspell any lettering they draw (e.g. "PETICH DECK" on a pitch deck).
    coverPrompt += ' Absolutely no text, words, letters, numbers or brand logos anywhere in the image; any paper or page is blank, and any screen shows at most a simple wordless shape or graphic.';

    // ── Step 2: Generate image with OpenAI ────────────────────────────────
    // Medium quality: about a quarter of high's generation work, and sharp
    // enough now the app keeps a 1024px copy (the earlier softness was mostly
    // a 640px copy stretched on 3x screens). JPEG keeps the response small.
    const tImage = Date.now();
    const imageCtl = new AbortController();
    const imageTimer = setTimeout(() => imageCtl.abort(), IMAGE_TIMEOUT_MS);
    try {
      console.log('[cover-image] Calling gpt-image-1 (medium quality)...');
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-image-1', prompt: coverPrompt, n: 1, size: '1024x1536', quality: 'medium', output_format: 'jpeg' }),
        signal: imageCtl.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        const msg = data.error?.message || JSON.stringify(data);
        console.error('[cover-image] OpenAI error:', msg);
        return res.status(500).json({ error: msg });
      }
      const b64 = data.data?.[0]?.b64_json;
      if (!b64) throw new Error('No image data returned');
      console.log('[cover-image] Success');
      return res.status(200).json({ url: `data:image/jpeg;base64,${b64}` });
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error(`[cover-image] Image step timed out after ${IMAGE_TIMEOUT_MS / 1000}s`);
        return res.status(504).json({ error: 'Cover took too long to generate. Tap Retry to try again.' });
      }
      console.error('[cover-image] Caught error:', err.message);
      return res.status(500).json({ error: err.message });
    } finally {
      clearTimeout(imageTimer);
      console.log(`[cover-image] Image step took ${Date.now() - tImage}ms; total ${Date.now() - tStart}ms`);
    }
  }
  // ── END COVER IMAGE MODE ─────────────────────────────────────────────────────

  const six = scenes.slice(0, 6);

  const panelList = six.map((sc, i) => {
    const faceTag = (i === 2 || i === 5)
      ? '[FACE PANEL — protagonist face visible, medium/portrait shot]'
      : '[NO FACE — object, hands, screen, or empty room ONLY. Zero humans. Zero faces. Zero bodies.]';
    return `PANEL ${i + 1} ${faceTag}:\n  SCENE: "${sc.title}"\n  VISUAL: ${sc.visual}\n  EMOTION: ${sc.emotion}`;
  }).join('\n\n');

  const prompt = `██████████████████████████████████████████████████████████
HARD LIMIT — READ THIS FIRST — NON-NEGOTIABLE:

A HUMAN FACE OR FULL BODY MAY APPEAR IN EXACTLY 2 PANELS.
2 PANELS WITH PEOPLE. 4 PANELS WITH NO PEOPLE.
THIS IS A HARD LIMIT. DO NOT PUT PEOPLE IN MORE THAN 2 PANELS.

Panel 3 = person. Panel 6 = person. Panels 1, 2, 4, 5 = NO PERSON.
Not from behind. Not blurred. Not silhouetted. Not reflected. Not in a frame on a wall.
PANELS 1, 2, 4, 5: ZERO HUMANS. ZERO FACES. ZERO BODIES.
██████████████████████████████████████████████████████████

You are rendering a six-panel cinematic storyboard document. Read every word below carefully — the scenes, setting, and character are the SINGLE SOURCE OF TRUTH for what appears in each panel. Do not substitute generic imagery. Render exactly what each scene describes.

═══════════════════════════════════════════════
STORY CONTENT — RENDER THIS EXACTLY
═══════════════════════════════════════════════

TITLE: ${subject}
SUBTITLE: ${lesson || audience}
PROTAGONIST: ${character}
VISUAL WORLD: ${visualWorld}
OVERALL EMOTIONAL ARC: ${emotion}

SCENE DESCRIPTIONS — EACH PANEL MUST SHOW EXACTLY WHAT IS WRITTEN:

${panelList}

CRITICAL SCENE RULE: If a scene says "red warning alerts on screens in a dark command centre" — show that. If it says "a city under cyber attack" — show that. If it says "a boardroom in crisis" — show that. The visual description is a direct instruction. Never replace it with a person sitting at a desk writing.

═══════════════════════════════════════════════
DOCUMENT LAYOUT
═══════════════════════════════════════════════

Produce a single landscape image formatted as a premium editorial storyboard.

• Top header bar: title "${subject}" in large elegant serif on the right, "NARRATIVE FRAMES" in tiny caps on the left
• Six panels in TWO ROWS of THREE, equal size, thin hairline borders
• Below each panel (on the white margin, NEVER inside the photograph): scene number only (e.g. "01") and ONE emotion word (e.g. "Curiosity") in small caps. Nothing else below the panel. No long sentences. No captions. No titles. Maximum 2 words per panel label.
• NO TEXT RENDERED INSIDE ANY PANEL PHOTOGRAPH. The photographic image inside each panel border must contain zero letters, zero words, zero captions, zero labels. Pure image only.
• Document background: pure white (#FFFFFF) or very light neutral grey (#F5F5F5) — NEVER cream, ivory, yellow, or warm. White only.

═══════════════════════════════════════════════
EMOTIONAL TONE — READ THIS BEFORE RENDERING
═══════════════════════════════════════════════

The OVERALL EMOTIONAL ARC is: ${emotion}

Use this to set the visual mood for the ENTIRE storyboard:

• If the arc is hopeful, determined, purposeful, inspiring, triumphant, or personal/professional growth → ALL panels must be WARM, BRIGHT, and ASPIRATIONAL. Think Apple campaign, LinkedIn success story, premium business documentary. Bright offices, natural daylight, warm skin tones, optimistic colour palette. Even struggle scenes show a person who is clearly going to win.

• If the arc is urgent, alarming, or crisis-driven (e.g. cybersecurity breach, emergency, threat) → use dramatic high-contrast lighting appropriate to that world (screen glow, red alerts, command centre). But ONLY when the brief explicitly calls for it.

• DEFAULT: When in doubt, render panels BRIGHT, WARM, and ENERGETIC. Most stories are about growth, achievement, and change — they should look and feel positive, not dark or threatening.

CRITICAL EMOTION LABEL RULE:
The emotion labels below each panel (e.g. FRUSTRATION, TENSION, CLARITY, CONTROL) describe the CHARACTER'S INTERNAL STATE — not the lighting, atmosphere, or colour palette of the scene.

A character feeling FRUSTRATION still exists in a well-lit, warm, aspirational environment. They might look worried or stressed — but the room around them is still bright and professional, not dark and sinister. Never make a panel look threatening or scary simply because the emotion label is negative.

═══════════════════════════════════════════════
VISUAL QUALITY
═══════════════════════════════════════════════

Each panel is a cinematic film still — the quality of a premium Apple campaign or inspirational documentary.

• Full-frame cinema camera, 50mm or 85mm prime lens, shallow depth of field
• Film grain — subtle and authentic
• Default lighting: bright natural daylight through windows, clean and well-exposed. Lift the shadows. Bright midtones. The kind of light that makes people look confident and capable.
• Rich contrast — but with bright, lifted midtones, not crushed dark shadows
• Each panel has a DISTINCT visual feel — vary colour temperature, shot distance, and composition across the six panels

═══════════════════════════════════════════════
PANEL-BY-PANEL PERSON RULE — ABSOLUTE
═══════════════════════════════════════════════

PANEL 1 — NO PERSON. Object or environment only. No face, no body, no silhouette, no hands-above-wrist.
PANEL 2 — NO PERSON. Hands + object close-up only (wrists and below, no arms, no face, no body).
PANEL 3 — PERSON: protagonist, face fully visible, medium or portrait shot, well-lit, confident.
PANEL 4 — NO PERSON. Screen close-up or object only. No face, no body, no reflection of a person.
PANEL 5 — NO PERSON. Object or environmental room shot. No face, no body, no silhouette.
PANEL 6 — PERSON: protagonist, face fully visible, medium or portrait shot, well-lit, confident. Same face as panel 3.

PEOPLE-FREE SHOT TYPES (panels 1, 2, 4, 5):
• CLOSE-UP OF HANDS AND OBJECT — extreme close-up of hands typing on a laptop, holding a phone, writing in a notebook. No arms above the elbow. No face. No body.
• OBJECT ONLY — a phone on a desk, a laptop screen glowing, an open notebook, a coffee mug, a whiteboard with diagrams. No person at all.
• SCREEN CLOSE-UP — fill the panel with a laptop, phone, or monitor showing relevant content. No person visible, not even as a reflection.
• ENVIRONMENTAL / ROOM SHOT — a beautiful empty room: sunlit home office, boardroom before a meeting, desk with books. No person visible anywhere.

CHARACTER CONSISTENCY:
In panels 3 and 6, the protagonist must look identical — same face, hair, skin tone, clothing.

═══════════════════════════════════════════════
AVOID
═══════════════════════════════════════════════

Human faces or bodies in panels 1, 2, 4, or 5 under any circumstances. Shots from behind. Silhouettes. People blurred in backgrounds. Portraits in photo frames on walls. Reflections of people in glass or mirrors. ANY text, words, letters, numbers, or captions rendered inside a panel photograph — panels must be pure photography with zero overlaid text. Long captions below panels. Dark or sinister panels for positive stories. Cold blue or green colour casts. Cream or yellow document background. Oil painting or illustration look. Anime, cartoon, manga. All panels looking compositionally identical.`;

  try {
    console.log('[storyboard-image] Calling gpt-image-1 (high quality)...');
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1536x1024',
        quality: 'high',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const msg = data.error?.message || JSON.stringify(data);
      console.error('[storyboard-image] OpenAI error:', msg);
      return res.status(500).json({ error: msg });
    }
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error('No image data returned');
    console.log('[storyboard-image] Success');
    return res.status(200).json({ url: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error('[storyboard-image] Caught error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
