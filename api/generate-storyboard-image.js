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
VISUAL STYLE
═══════════════════════════════════════════════

Each panel is a premium editorial illustration in a soft watercolour and gouache style — like the illustrations used in high-end magazines (Monocle, The New Yorker, Bloomberg Businessweek) or a luxury brand lookbook.

ILLUSTRATION STYLE:
• Watercolour washes with soft gouache highlights — painterly, expressive, not hyper-realistic
• Warm neutral palette: ivory, sage green, dusty blue, warm taupe, soft terracotta — clean and editorial
• Characters are rendered as confident portrait illustrations — expressive faces with clear emotions, but painterly rather than photographic. This avoids distorted AI faces.
• Subtle botanical or architectural elements in backgrounds — leaves, geometric shapes, architectural lines — simple and elegant
• Soft diffused light — no harsh shadows, no dark underlighting. Warm and inviting throughout.
• Loose, confident brush strokes visible — especially in backgrounds and clothing
• Faces are the focal point — well-lit, warm skin tones, clear expression, centred or slightly off-centre

COLOUR PALETTE (adapt to scene but stay within this family):
• Backgrounds: warm cream (#F5EFE6), soft sage (#C8D5C0), dusty slate (#B8C4CC), warm sand (#E8D9C4)
• Skin tones: warm peachy-beige, natural and healthy
• Clothing: muted professional tones — navy, charcoal, warm white, forest green
• Accents: terracotta, gold, deep teal — used sparingly

COMPOSITION — vary across six panels:
• Portrait (face and shoulders), medium (waist up), environmental (full figure in setting), detail (hands, objects), over-shoulder, two-person scene — distribute naturally across the six panels

CHARACTER CONSISTENCY
The protagonist must look visually identical in every panel — same face shape, hair, skin tone, clothing style. Only expression and body language change.

═══════════════════════════════════════════════
AVOID
═══════════════════════════════════════════════

Photorealistic or hyper-detailed faces. Dark or sinister lighting for positive stories. Cold blue or grey colour casts. Heavy shadows. Ominous or threatening atmosphere for personal/professional growth stories. Anime, manga, or cartoon style. Cream or yellow document background (the document margins must be white). Text or logos inside panel illustrations. Inconsistent character faces across panels. All six panels looking identical.`;

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
