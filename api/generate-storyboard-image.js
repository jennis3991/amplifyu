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

  const prompt = `You are rendering a six-panel cinematic storyboard document. Read every word below carefully — the scenes, setting, and character are the SINGLE SOURCE OF TRUTH for what appears in each panel. Do not substitute generic imagery. Render exactly what each scene describes.

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
COMPOSITION RULE — ABSOLUTE — PERSON LIMIT:
The protagonist may appear as a visible human figure in EXACTLY 2 of the 6 panels. In the other 4 panels NO PERSON should be the main subject — not from behind, not as a silhouette, not blurred, not in a photo frame, not reflected in glass. People-free panels only.

EXACTLY 2 PANELS WITH A PERSON (panels 3 and 6):
— Panel 3: medium or portrait shot of the protagonist, face visible, well-lit, confident
— Panel 6: medium or portrait shot of the protagonist, face visible, well-lit, confident
These are the ONLY two panels where a human figure is the main subject.

THE OTHER 4 PANELS MUST BE PEOPLE-FREE. Use only these shot types:
• CLOSE-UP OF HANDS AND OBJECT — extreme close-up of hands typing on a laptop, holding a phone showing an app, writing in a notebook, gripping a pen, pointing at a document. No arms above the elbow. No face. No body.
• OBJECT ONLY — a phone lying on a desk, a laptop screen glowing with content, an open notebook with handwriting, a coffee mug next to a keyboard, a whiteboard covered in diagrams, a phone screen showing a notification. No person at all.
• SCREEN CLOSE-UP — fill the panel with a laptop screen, phone screen, or monitor showing relevant content (an app, a presentation, a message, a dashboard). Slightly angled, cinematic lighting.
• ENVIRONMENTAL / ROOM SHOT — a beautiful empty or near-empty room: a sunlit home office, a boardroom before a meeting starts, a desk with books and a lamp. No person visible.

Distribute like this:
— Panel 1: object-only or environment shot (NO PERSON)
— Panel 2: hands + object close-up (NO PERSON, just hands from wrist down)
— Panel 3: PERSON SHOT — protagonist face visible (one of only two)
— Panel 4: screen close-up or object-only (NO PERSON)
— Panel 5: object or environment shot (NO PERSON)
— Panel 6: PERSON SHOT — protagonist face visible (second and final)

CHARACTER CONSISTENCY
In panels 3 and 6, the protagonist must look identical — same face, hair, skin tone, clothing.

═══════════════════════════════════════════════
AVOID
═══════════════════════════════════════════════

Any person — protagonist or otherwise — appearing in more than 2 panels. Shots from behind counting as "no person" — they do not. Silhouettes. People blurred in backgrounds. Portraits in photo frames on walls. Reflections of people in glass or mirrors. Characters in more than 2 panels under any circumstances. Dark or sinister panels for positive stories. Cold blue or green colour casts. Cream or yellow document background. Oil painting or illustration look. Anime, cartoon, manga. Text or logos inside panel photographs. All panels looking compositionally identical.`;

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
