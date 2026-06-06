module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_KEY || process.env.VITE_ANTHROPIC_KEY;

  console.log('ANTHROPIC_KEY exists:', !!process.env.ANTHROPIC_KEY);
  console.log('VITE_ANTHROPIC_KEY exists:', !!process.env.VITE_ANTHROPIC_KEY);
  console.log('resolved apiKey exists:', !!apiKey);

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Anthropic API key. Set ANTHROPIC_KEY in Vercel environment variables.' });
  }

  const { messages, max_tokens, model } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens, messages }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Anthropic fetch error:', err);
    return res.status(500).json({ error: err.message || 'Failed to contact Anthropic API' });
  }
}
