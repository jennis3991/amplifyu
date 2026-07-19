export const config = { maxDuration: 120 };

function validateAccessCode(req) {
  const expected = process.env.ACCESS_CODE || process.env.VITE_ACCESS_CODE || "";
  if (!expected) {
    console.error("[auth] ACCESS_CODE env var is not set — /api/generate-storyboard-image is OPEN to all callers");
    return true;
  }
  const provided = req.headers["x-access-code"] || "";
  return provided === expected;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-access-code');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
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
    const anthropicKey = process.env.ANTHROPIC_KEY || process.env.VITE_ANTHROPIC_KEY;

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
- Crisis / urgency: security operations centre before dawn, incident dashboard with red alerts, phone off the hook, rain against glass, countdown clock, empty executive chair
- Career growth / change: leather notebook beside a packed suitcase, offer letter on a desk, morning light through a train station window, open doorway with light beyond
- Leadership / influence: conference room at dawn, empty podium with single spotlight, microphone stand on a darkened stage, window overlooking a city at golden hour
- Innovation / thinking: architectural blueprint on a light table, chess pieces mid-game, open sketchbook with prototype drawings, workshop with tools laid out
- Communication / storytelling: vintage typewriter with a single page, open journal on a wooden desk, theatre lights on an empty stage, notebook and pen in morning light
- Personal breakthrough: single candle in a dark room, open road at sunrise, morning light flooding through a window, compass on a worn map
- Trust / relationships: two coffee cups, handwritten letter, open notebook with sketches

COVER REQUIREMENTS:
- Single cinematic image — NOT a collage
- NO people, NO faces, NO bodies, NO silhouettes
- NO text, words, letters or numbers in the image
- Warm natural light (unless the story is explicitly crisis/urgency-driven)
- Shallow depth of field, film grain
- Generous negative space at the top
- Style: Netflix documentary poster · Apple editorial · Kinfolk · Monocle · Penguin non-fiction
- Minimal, sophisticated, emotionally resonant
- Portrait orientation (taller than wide)

IMPORTANT: The image must be unique to this story. Someone should look at it and understand the subject, conflict, mood and stakes without reading any text.

Output ONLY the image generation prompt. No preamble. No analysis. No headers. Just the prompt that will be sent directly to the image model.`;

    let coverPrompt = null;

    if (anthropicKey) {
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
        });
        const claudeData = await claudeRes.json();
        coverPrompt = claudeData.content?.[0]?.text?.trim() || null;
        if (coverPrompt) console.log('[cover-image] Art director prompt ready:', coverPrompt.slice(0, 120) + '...');
        else console.warn('[cover-image] Claude returned no content, falling back');
      } catch (err) {
        console.warn('[cover-image] Claude art director failed, falling back:', err.message);
      }
    } else {
      console.warn('[cover-image] ANTHROPIC_KEY not set — skipping art director step');
    }

    // ── Fallback: story-aware prompt built from storyWorld data ───────────
    if (!coverPrompt) {
      coverPrompt = `A premium editorial book cover image for a story titled "${title}". Theme: ${subject}. Emotional tone: ${emotion}. Setting: ${visualWorld}. Choose a single strong visual metaphor that captures the essence of this story — an object, a space, or a moment of anticipation. Style: Netflix documentary poster, Apple editorial, Kinfolk magazine, Penguin non-fiction. Cinematic, warm natural light, shallow depth of field, film grain, generous negative space. NO people, NO faces, NO text inside the image. Portrait orientation. Minimal, sophisticated, emotionally resonant.`;
    }

    // ── Step 2: Generate image with OpenAI ────────────────────────────────
    try {
      console.log('[cover-image] Calling gpt-image-1 (high quality)...');
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-image-1', prompt: coverPrompt, n: 1, size: '1024x1536', quality: 'high' }),
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
      return res.status(200).json({ url: `data:image/png;base64,${b64}` });
    } catch (err) {
      console.error('[cover-image] Caught error:', err.message);
      return res.status(500).json({ error: err.message });
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
