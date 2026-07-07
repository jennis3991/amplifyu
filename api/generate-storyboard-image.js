export const config = { maxDuration: 60 };

const STYLE_INSTRUCTIONS = `Create a premium cinematic storyboard design sheet — a single landscape image that looks like a page from an award-winning film pitch book or a luxury editorial magazine.

OVERALL LAYOUT
The output is ONE complete storyboard design document:
• A clean header area at the top: large elegant serif story title on the left, small-caps subtitle on the right
• Six storyboard illustration panels arranged in TWO ROWS of THREE equal panels
• Below each panel: scene title in medium serif, one-line caption in small italic serif, emotion label in small caps with extra letter-spacing
• Thin dark borders framing each panel, generous cream margins between everything
• The whole document sits on a warm cream (#F5EEE3) background

ILLUSTRATION STYLE — THIS IS CRITICAL
Rich, warm, painterly editorial illustration. Hand-rendered concept art with digital refinement. NOT a pencil sketch. NOT monochrome. NOT flat.
Think: Pixar concept art book meets Vanity Fair editorial meets a luxury brand campaign film.
Each panel is a fully realised scene — rich in atmosphere, detail, and depth.

COLOUR PALETTE — MORE COLOUR THAN SEPIA
Use the FULL warmth of a rich amber and sienna palette:
• Deep burnt umber shadows with strong contrast
• Warm amber and golden midtones
• Creamy ivory highlights and light sources
• Subtle colour variation per panel — cooler blue-grey in shadow areas, rich gold in lit areas
• Each panel glows with atmospheric depth, not a flat wash
Do NOT produce flat sepia or washed-out monochrome.

CINEMATIC LIGHTING — EVOLVING ACROSS PANELS
Panel 1 (top-left): dim interior evening light, cool shadows, single warm lamp glow
Panel 2 (top-centre): soft diffused morning light through a window
Panel 3 (top-right): warm golden afternoon, directional light casting long shadows
Panel 4 (bottom-left): moody interior with strong contrast, determination energy
Panel 5 (bottom-centre): bright warm light, a sense of momentum and progress
Panel 6 (bottom-right): confident bright daylight or spotlight, triumphant feeling

CHARACTER CONSISTENCY ACROSS ALL SIX PANELS
The same protagonist appears in every panel. Identical: face, hair colour and style, clothing, age, body proportions, ethnicity. Never redesign or alter the character. The character should feel like a real person across all six frames.

CAMERA ANGLES — VARY ACROSS THE SIX PANELS
Mix these deliberately: wide establishing shot, medium two-shot, intimate close-up on face, over-the-shoulder, hero wide shot, tight detail shot.

QUALITY BENCHMARKS
• Each panel has detailed environmental storytelling — objects, textures, furniture, architecture that reveal character and story
• Lighting has clear, motivated sources with beautiful fall-off
• Figures have expressive body language and authentic emotion
• Backgrounds are atmospheric but not distracting
• The overall feel is premium, quiet luxury, Soho House aesthetic — like a still from a beautifully lit A24 film translated into editorial illustration

TYPOGRAPHY INSIDE THE IMAGE
The design document must include rendered text:
• Top-left header: story title in large elegant serif (e.g. 36–42pt weight, dark ink)
• Top-right: subtitle or tagline in small caps (e.g. 10pt, letter-spaced)
• Below each panel: scene title (serif, ~13pt), caption text (italic serif, ~10pt), emotion word (all-caps, ~8pt letter-spaced)
• Panel numbers (1–6) in the top-left corner of each panel frame
Typography style: editorial, refined, Vogue or Kinfolk magazine quality

AVOID ENTIRELY
Comic book style, cartoon, anime, Pixar CG look, manga, children's illustration, clip art, thick black outlines, flat colour fills, oversaturated colours, photorealism, watermarks, logos, speech bubbles, distorted faces, inconsistent character appearance.`;

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

  // Use all 6 scenes for the panel layout
  const six = scenes.slice(0, 6);

  const panelList = six.map((sc, i) =>
    `Panel ${i + 1} — Title: "${sc.title}" | Scene: ${sc.visual} | Caption: "${sc.caption}" | Emotion label: ${sc.emotion}`
  ).join('\n');

  const dynamicContent = `---

STORY TITLE (render in header): ${subject}
SUBTITLE (render in header, small caps): ${lesson || audience}

MAIN CHARACTER: ${character}. ${audience}. Authentic, human, and emotionally present. Keep this person identical across all 6 panels.

EMOTIONAL ARC: ${emotion}
VISUAL WORLD: ${visualWorld}

SIX PANEL CONTENT — render each as a rich editorial illustration with the text below it:

${panelList}

Produce a single premium storyboard design sheet. Make it feel like it belongs in a luxury creative agency pitch deck or a Soho House coffee table book. Rich colour, cinematic atmosphere, beautiful typography, emotional storytelling.`;

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
