export const config = { maxDuration: 60 };

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

  const { scenes, storyWorld } = req.body;
  if (!scenes?.length) return res.status(400).json({ error: 'No scenes provided' });

  const character   = storyWorld?.character   || 'the protagonist';
  const audience    = storyWorld?.audience    || 'professional adult';
  const emotion     = storyWorld?.emotion     || 'Hopeful determination';
  const visualWorld = storyWorld?.visualWorld || 'Contemporary professional setting';
  const subject     = storyWorld?.subject     || 'A Story of Purpose';
  const lesson      = storyWorld?.lesson      || '';

  const six = scenes.slice(0, 6);

  const panelList = six.map((sc, i) =>
    `PANEL ${i + 1}: "${sc.title}"\n  SHOW EXACTLY THIS: ${sc.visual}\n  Caption below panel: "${sc.caption}"\n  Emotion label: ${sc.emotion}`
  ).join('\n\n');

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

• Top header bar: "NARRATIVE FRAMES" in small-caps sans-serif on the left — "${subject}" in large elegant serif on the right
• Six panels in TWO ROWS of THREE, equal size, with thin hairline borders
• Below each panel on the white background (never inside the panel): panel number, scene title in serif, italic caption, emotion word in small caps
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

Human faces or bodies in panels 1, 2, 4, or 5 under any circumstances. Shots from behind counting as "no person" — they do not. Silhouettes. People blurred in backgrounds. Portraits in photo frames on walls. Reflections of people in glass or mirrors. Dark or sinister panels for positive stories. Cold blue or green colour casts. Cream or yellow document background. Oil painting or illustration look. Anime, cartoon, manga. Text or logos inside panel photographs. All panels looking compositionally identical.`;

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
