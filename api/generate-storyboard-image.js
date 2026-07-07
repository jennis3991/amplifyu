export const config = { maxDuration: 60 };

const STYLE_INSTRUCTIONS = `Render this as a premium editorial feature using cinematic film stills with luxury magazine art direction, where each panel looks like a frame from an A24 film or an Apple keynote video — not a traditional storyboard illustration.

DOCUMENT LAYOUT
A single landscape image formatted as a premium story development board — like a page from Kinfolk, Cereal Magazine, or a luxury coffee-table book.

Structure:
• Top header: small-caps label "NARRATIVE FRAMES" on the left — story title in large elegant serif on the right
• Six cinematic panels arranged in TWO ROWS of THREE equal panels
• Below each panel on the cream background (NOT inside the panel): small panel number, scene title in serif, italic caption, emotion word in spaced small caps
• Generous warm ivory (#F7F3EC) margins between everything
• Thin hairline borders around each panel

COLOUR GRADE — CRITICAL — READ THIS CAREFULLY
Do NOT apply any yellow, amber, sepia, or warm filter to the overall image. Do NOT tint everything one colour.

The base white balance must be NEUTRAL DAYLIGHT — whites are white, not yellow. Window light is cool blue-white, not amber.

Colour appears SELECTIVELY, where it naturally belongs:
• Walls, ceilings, linen: true white or very light neutral grey — NOT cream or yellow
• Wood surfaces (desk, floor, shelves): natural walnut brown (#655244) — contained to the object only
• Deep charcoal shadows (#292623) — rich and dark but not muddy
• Natural skin tones — peachy-beige, accurate flesh tones, NOT orange or yellow-tinted
• Plants and nature: soft olive green (#7A806C) and sage — actual green, not yellowed
• Window light: cool blue-white daylight, the way afternoon light actually looks through glass
• Shadow fill: cool blue-grey ambient — counterbalances any warmth in the scene
• Selective accent warmth: a single lamp, a candle, a shaft of late sun — warm ONLY in that small area, not spread across the whole frame
• Rich contrast — deep blacks, bright whites, full tonal range

Each of the six panels must have a DISTINCT colour feel — do not apply the same grade to all six. Some panels cooler, some warmer, all accurate.

PHOTOGRAPHY STYLE
Each panel is a still frame from a beautifully photographed feature film.
• Full-frame cinema camera, 50mm or 85mm prime lens
• Shallow depth of field — foreground objects soft, subject sharp, background bokeh
• Film grain — subtle, authentic, not digital noise
• Visible depth — foreground, midground, background layers
• Lens compression on tighter shots
• PRIMARY light source: cool natural daylight through windows — blue-white, clean, not golden
• Authentic environments — nothing staged or sterile
• Rich shadows with detail, bright clean highlights
• Accurate natural skin tones — no yellow or orange cast
• Organic imperfections — real spaces, lived-in, human

CHARACTER CONSISTENCY — MOST IMPORTANT RULE
The protagonist must be visually identical in every single panel. Treat her as the same actress in sequential shots of the same film.

Never redesign the face. Maintain across all six panels:
• Identical eye shape, nose, jawline, hairline
• Same hair length, hair colour, and style
• Same skin tone and complexion
• Same body proportions
• Same clothing and accessories

Only facial expression and body language may change between panels.

COMPOSITION — VARY NATURALLY ACROSS THE SIX PANELS
Do not centre the protagonist in every frame. Use:
• Environmental wide shot — subject small in a beautiful interior
• Medium shot — subject off-centre, natural framing
• Over-the-shoulder — shot from behind, looking at something
• Foreground blur — an object soft in the foreground, subject behind
• Intimate close-up — face cropped, emotional expression
• Hero shot — subject confident, environment supporting

Some panels crop the subject. Some use leading lines. Some show hands or detail. Nothing perfectly composed — natural, alive, cinematic.

INTERIORS AND ENVIRONMENTS
Contemporary minimal interiors: oak floors, white and warm linen walls, clean lines, potted plants, stacked books, ceramic mugs, brass fixtures, linen curtains diffusing window light. Beautiful home offices, Soho House workspaces, light-filled kitchens, quiet reading corners. Warm, aspirational, human.

TYPOGRAPHY (in cream margins only — never inside the panel illustrations)
• Header label: "NARRATIVE FRAMES" — small-caps sans-serif, tracked wide, warm taupe
• Story title: large elegant serif (Cormorant Garamond weight)
• Below each panel: panel number small sans, scene title serif ~14pt, italic caption ~11pt, emotion word small-caps ~9pt spaced
• Text colour: Walnut (#655244) or Espresso (#342A22) — never pure black

AVOID
Monochromatic yellow/sepia wash. Oil painting look. Illustration of any kind. Cartoon. Anime. Manga. Oversaturated colours. Staged or stock-photo feel. Text inside panel illustrations. Watermarks. Logos. Speech bubbles. Inconsistent character faces. Protagonist centred in every frame.`;

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
    `Panel ${i + 1} — Scene title: "${sc.title}" | What is seen: ${sc.visual} | Caption: "${sc.caption}" | Emotion: ${sc.emotion}`
  ).join('\n');

  const dynamicContent = `---

DOCUMENT HEADER
Left label: NARRATIVE FRAMES
Right title: ${subject}
Right subtitle (small caps): ${lesson || audience}

MAIN CHARACTER
${character}. ${audience}. Warm, authentic, real-looking. Keep identical across all six panels.

OVERALL EMOTIONAL ARC: ${emotion}
VISUAL WORLD: ${visualWorld}

SIX PANELS — each a beautiful cinematic film still:
${panelList}

Make each panel feel like a real moment captured by a cinematographer on a beautiful day. Bright. Warm. Human. Premium. The kind of image that makes you stop scrolling.`;

  const prompt = `${STYLE_INSTRUCTIONS}\n\n${dynamicContent}`;

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
