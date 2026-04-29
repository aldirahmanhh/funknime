import DramaboxScraper from '@zhadev/dramabox';

// Singleton scraper instance (persists across warm invocations)
let scraper = null;

function getScraper() {
  if (!scraper) {
    scraper = new DramaboxScraper({
      language: 'in',
      version: '470',
      timeout: 25000,
      maxRetries: 2,
      cacheTTL: 300,
      requestDelay: 500,
    });
  }
  return scraper;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel provides query params directly on req.query
  const action = req.query.action;

  if (!action) {
    return res.status(400).json({ error: 'Missing action parameter' });
  }

  // Cache header
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');

  const s = getScraper();

  try {
    let result;

    switch (action) {
      case 'latest': {
        const page = parseInt(req.query.page || '1', 10);
        result = await s.getLatest(page);
        break;
      }

      case 'trending': {
        result = await s.getTrending();
        break;
      }

      case 'search': {
        const keyword = req.query.keyword;
        const page = parseInt(req.query.page || '1', 10);
        const pageSize = parseInt(req.query.pageSize || '20', 10);
        if (!keyword) return res.status(400).json({ error: 'Missing keyword' });
        result = await s.searchDrama(keyword, page, pageSize);
        break;
      }

      case 'detail': {
        const bookId = req.query.bookId;
        if (!bookId) return res.status(400).json({ error: 'Missing bookId' });
        result = await s.getDramaDetail(bookId);
        break;
      }

      case 'chapters': {
        const bookId = req.query.bookId;
        if (!bookId) return res.status(400).json({ error: 'Missing bookId' });
        result = await s.getChapters(bookId);
        break;
      }

      case 'episode': {
        const bookId = req.query.bookId;
        const index = parseInt(req.query.index || '1', 10);
        if (!bookId) return res.status(400).json({ error: 'Missing bookId' });
        result = await s.getEpisodeDetails(bookId, index);
        break;
      }

      case 'list': {
        const page = parseInt(req.query.page || '1', 10);
        const pageSize = parseInt(req.query.pageSize || '20', 10);
        result = await s.getDramaList(page, pageSize);
        break;
      }

      case 'homepage': {
        result = await s.getHomepage();
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error(`[dramabox] action=${action} error:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
