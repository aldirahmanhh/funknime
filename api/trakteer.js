const TRAKTEER_API_KEY = 'trapi-5JwaDliojNeKNsw5jPiI4Awa';
const BASE = 'https://api.trakteer.id/v1/public';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action || 'supports';
  const limit = req.query.limit || '10';
  const page = req.query.page || '1';

  let url;
  if (action === 'supports') {
    url = `${BASE}/supports?limit=${limit}&page=${page}`;
  } else if (action === 'quantity') {
    // quantity-given endpoint (POST)
    try {
      const resp = await fetch(`${BASE}/quantity-given`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'key': TRAKTEER_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: req.query.email ? `email=${encodeURIComponent(req.query.email)}` : '',
      });
      const data = await resp.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    const resp = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'key': TRAKTEER_API_KEY,
      },
    });
    const data = await resp.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
