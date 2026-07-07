export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
COMPOSITION RULE — CRITICAL — FACE LIMIT:
The protagonist's face must appear clearly in NO MORE THAN 2 of the 6 panels. For the remaining 4 panels, use these face-free shot types instead:

• SHOT FROM BEHIND — subject facing away from camera, looking at a screen, window, whiteboard, or audience. We see their back, shoulders, posture — not their face.
• DETAIL / CLOSE-UP OF HANDS AND OBJECT — extreme close-up of hands holding a phone, typing on a laptop, writing in a notebook, pointing at a chart. Character is implied, not shown.
• OBJECT IN FOREGROUND, CHARACTER SOFT IN BACKGROUND — a phone, laptop, coffee cup, document, or prop is sharp in the foreground; the protagonist is a warm blurred presence behind it.
• WIDE ENVIRONMENTAL SHOT — subject is small in the frame, dwarfed by the room, city, or setting. Face is too small to be a focal point.
• OVER-THE-SHOULDER — camera is behind and above the subject; we see what they see (a screen, a room full of people, a view from a window).

Distribute the 6 panels like this:
— Panel 1: behind-shot or wide environmental (no face)
— Panel 2: detail shot — hands/object close-up (no face)
— Panel 3: FACE SHOT — one of the two permitted clear face panels
— Panel 4: over-the-shoulder or object-foreground (no face)
— Panel 5: detail or environmental (no face)
— Panel 6: FACE SHOT — the second and final permitted clear face panel

This variety makes the storyboard feel cinematic and avoids the face-distortion problem of AI-generated portraits.

CHARACTER CONSISTENCY
When the protagonist's face does appear (panels 3 and 6), they must look identical — same face shape, hair, skin tone, clothing. For non-face panels, maintain consistent hair, body proportions, and clothing so the character is still recognisable.

═══════════════════════════════════════════════
AVOID
═══════════════════════════════════════════════

More than 2 panels with a clear face-forward portrait of the protagonist. All six panels showing the character's face. Dark, sinister, or threatening panels for positive stories. Silhouettes. Cold blue or green colour casts. Cream or yellow document background. Oil painting or illustration look. Anime, cartoon, manga. Text or logos inside the panel photographs. All six panels looking compositionally identical.`;

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
