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

  const visualWorld = storyWorld?.visualWorld || '';
  const emotion     = storyWorld?.emotion     || '';

  const panelDescs = scenes.slice(0, 6).map((s, i) =>
    `Panel ${i + 1} titled "${s.title}": ${s.visual}`
  ).join('. ');

  const prompt = `A horizontal 6-panel cinematic storyboard filmstrip. Fine-line editorial illustration style. Warm cream paper background (#F8F5EF). Thin dark ink lines. All 6 panels are equal width, arranged side by side as a single continuous strip, separated by thin vertical dividers. ${visualWorld ? `Visual world: ${visualWorld}.` : ''} ${emotion ? `Overall emotional tone: ${emotion}.` : ''} ${panelDescs}. Consistent illustration style, line weight, and mood across all 6 panels. Sophisticated, minimal, editorial feel. No text or written captions inside the image itself.`;

  try {
    console.log('[storyboard-image] Calling DALL-E 3...');
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const msg = data.error?.message || JSON.stringify(data);
      console.error('[storyboard-image] OpenAI error:', msg);
      return res.status(500).json({ error: msg });
    }
    const url = data.data?.[0]?.url;
    if (!url) throw new Error('No image URL returned');
    console.log('[storyboard-image] Success');
    return res.status(200).json({ url });
  } catch (err) {
    console.error('[storyboard-image] Caught error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
