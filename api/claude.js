export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt, lang } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  if (!response.ok) return res.status(response.status).json(data);

  const text = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n\n');

  res.status(200).json({ text });
}
