export const config = { maxDuration: 60 };

const STYLE_INSTRUCTIONS = `Render this as a premium editorial feature using cinematic film stills with luxury magazine art direction, where each panel looks like a frame from an A24 film or an Apple keynote video — not a traditional storyboard illustration.

DOCUMENT LAYOUT
A single landscape image formatted as a premium story development board — like a page from Kinfolk, Cereal Magazine, or a luxury coffee-table book.

Structure:
• Top header: small-caps label "NARRATIVE FRAMES" on the left — story title in large elegant serif on the right
• Six cinematic panels arranged in TWO ROWS of THREE equal panels
• Below each panel on the cream background (NOT inside the panel): small panel number, scene title in serif, italic caption, emotion word in spaced small caps
• Generous warm ivory margins (#F7F3EC) between everything
• Thin hairline borders around each panel

PHOTOGRAPHY STYLE — THIS IS THE MOST IMPORTANT INSTRUCTION
Each panel must look like a still frame from a beautifully lit, professionally shot film.
• Shot on a full-frame cinema camera with 50mm or 85mm prime lens
• Shallow depth of field with beautiful bokeh in backgrounds
• Rich texture — skin, fabric, wood grain, paper, ceramic, glass
• Natural organic imperfections — not sterile or stock photo
• Cinematic colour grading — warm golden tones, rich shadows, luminous highlights
• Real-looking humans with authentic expressions and body language
• Contemporary, beautifully designed interiors — minimal Scandinavian, Soho House aesthetic
• Natural materials: oak, walnut, linen, stone, brass, warm plaster

COLOUR PALETTE — BRIGHT AND WARM, NOT DARK
Background document: Warm Ivory #F7F3EC and Soft Linen #EFE7DB
Panel images should use this palette with BRIGHT lighting:
• Ivory highlights and window light: #F7F3EC
• Warm linen midtones: #EFE7DB, #E8DFCF
• Golden hour light and warmth: #F3D08A
• Walnut browns for wood and shadow: #5B4636
• Soft sage accents for plants and nature: #A6AE9B
• Deep espresso for darks (used sparingly): #2F241C
Panels should feel BRIGHT and WARM — flooded with natural window light and golden hour sun. NOT dark, NOT moody, NOT oil-painting brown.

LIGHTING
• Natural window light flooding into contemporary interior spaces
• Golden hour sunlight casting warm long shadows
• Soft ambient fill with beautiful shadow falloff
• Filmic lighting with subtle volumetric light through windows
• Warm cinematic contrast — lifted shadows, luminous highlights
• Each panel feels like it was shot on a beautiful afternoon in a well-designed home or workspace
• NO harsh artificial lighting, NO dark dramatic chiaroscuro, NO oil-painting darkness

INTERIORS AND SPACES
Modern minimal interiors: natural oak floors, white linen sofas, clean architectural lines, potted plants, stacked books, ceramic mugs, linen curtains diffusing light. Think: beautiful home office, a Soho House workspace, a light-filled kitchen, a quiet corner of a co-working space. Warm but contemporary. Aspirational but human.

CHARACTER
The same person in all six panels. Authentic, real-looking. Professional but warm. Natural expressions. Contemporary clothing — linen, cashmere, tailored blazer. Consistent throughout.

CAMERA ANGLES — VARY ACROSS SIX PANELS
Mix deliberately across the six panels: wide establishing interior, medium shot at desk, intimate close-up on face, over-the-shoulder, hero shot standing, detail shot of hands.

TYPOGRAPHY (rendered in the cream margins of the document, NOT inside the panels)
• Top of document: "NARRATIVE FRAMES" in small-caps Inter/sans-serif, tracked wide, warm taupe colour
• Story title: large elegant Cormorant Garamond Semibold or similar serif
• Below each panel: panel number in small sans-serif, scene title in serif ~14pt, caption in italic serif ~11pt, emotion word in small-caps sans ~9pt with 0.25em tracking
• All text in Walnut (#5B4636) or Espresso (#2F241C), never black

MOOD
Calm. Reflective. Hopeful. Sophisticated. Timeless. Human. Authentic. Like watching someone's life change for the better in the most beautiful light imaginable.

AVOID COMPLETELY
Illustration style of any kind. Oil painting. Dark and moody chiaroscuro. Comic book. Anime. Cartoon. Manga. Oversaturated colours. Harsh artificial lighting. Sterile stock photo look. Watermarks. Logos. Text INSIDE the panel illustrations. Speech bubbles. AI visual clichés. Heavy vignetting. Dark brown muddy tones throughout.`;

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
