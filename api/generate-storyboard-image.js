export const config = { maxDuration: 60 };

const STYLE_INSTRUCTIONS = `Create ONE premium cinematic storyboard sheet.

The output must be a SINGLE landscape image containing FOUR equally sized storyboard panels arranged horizontally. Do not create separate images.

The storyboard should feel like concept art from an award-winning feature film or a premium editorial magazine — not a comic strip.

ART DIRECTION
Museum-quality illustration. Elegant graphite linework with subtle ink shading. Soft sepia and warm cream colour palette. Gentle cinematic lighting. Sophisticated editorial aesthetic. Beautiful negative space. Refined composition. Architectural concept art quality. Quiet luxury aesthetic. Soho House interior mood. Apple-level visual design. Premium storytelling.

CHARACTER CONSISTENCY
The same protagonist must appear in every panel. Maintain identical face, hair, clothing, age, body proportions, ethnicity, and expression style. Never redesign the character between scenes.

VISUAL STORYTELLING
Each panel communicates ONE clear emotional moment. Every panel has a different cinematic camera angle: wide shot, medium shot, close-up, hero shot. The emotional progression moves from struggle toward hope.

LIGHTING PROGRESSION
Panel 1: dim cool evening light. Panel 2: soft morning light. Panel 3: warm golden afternoon. Panel 4: bright inspiring daylight.

COMPOSITION
Beautiful designer storyboard sheet. Four clean panels. Thin cream borders between panels. Consistent spacing. Premium layout. No clutter. No text, captions, speech bubbles, watermarks, or labels inside any panel.

AVOID: comic book style, cartoon, anime, Pixar, manga, children's illustration, clip art, thick outlines, oversaturated colours, distorted anatomy, different character faces between panels, random camera angles.`;

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

  // Pick 4 dramatically spread scenes from the 6 (opening, rising, turning point, resolution)
  const s = scenes;
  const four = [s[0], s[1], s[3] || s[2], s[5] || s[4]].filter(Boolean);

  const character  = storyWorld?.character   || 'the protagonist';
  const audience   = storyWorld?.audience    || 'professional adult';
  const emotion    = storyWorld?.emotion     || 'hopeful determination';
  const visualWorld= storyWorld?.visualWorld || 'contemporary professional setting';

  const dynamicContent = `Create a four-panel cinematic storyboard.

Story Summary:
${four.map((sc, i) => `Panel ${i + 1} — "${sc.title}": ${sc.visual} Emotion: ${sc.emotion}.`).join('\n')}

Main Character: ${character}. ${audience}. Authentic, human, and relatable.

Emotion arc: ${emotion}.

Visual world: ${visualWorld}.

Overall feeling: like a still from a beautifully shot A24 film or an Apple keynote film. No text inside the storyboard. A single premium storyboard sheet — four cinematic panels, each larger and richer in detail than a traditional storyboard.`;

  const prompt = `${STYLE_INSTRUCTIONS}\n\n---\n\n${dynamicContent}`;

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
