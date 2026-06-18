export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, firstName, phone, fields, tag } = req.body;
  if (!email || !tag) return res.status(400).json({ error: 'Missing email or tag' });

  const apiKey = process.env.SYSTEME_API_KEY;

  // Upsert contact
  const contactPayload = {
    email,
    ...(firstName && { firstName }),
    ...(phone && { phone }),
    ...(fields && fields.length && { fields }),
  };

  const upsertRes = await fetch('https://api.systeme.io/api/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify(contactPayload),
  });

  if (!upsertRes.ok) {
    const err = await upsertRes.json().catch(() => ({}));
    return res.status(upsertRes.status).json({ error: 'Contact upsert failed', detail: err });
  }

  const contact = await upsertRes.json();
  const contactId = contact.id;

  // Ensure tag exists, then assign it
  const tagRes = await fetch(`https://api.systeme.io/api/contacts/${contactId}/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({ tagName: tag }),
  });

  if (!tagRes.ok) {
    const err = await tagRes.json().catch(() => ({}));
    return res.status(tagRes.status).json({ error: 'Tag assignment failed', detail: err });
  }

  res.status(200).json({ success: true, contactId });
}
