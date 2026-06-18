import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'Missing key' });

  if (req.method === 'GET') {
    const count = (await kv.get(key)) ?? 0;
    return res.status(200).json({ count: Number(count) });
  }

  if (req.method === 'POST') {
    const count = await kv.incr(key);
    return res.status(200).json({ count });
  }

  res.status(405).end();
}
