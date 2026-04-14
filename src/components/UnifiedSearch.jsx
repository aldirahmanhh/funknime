import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import AnimeCard from './AnimeCard';

const UnifiedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [animeResults, setAnimeResults] = useState([]);
  const [donghuaResults, setDonghuaResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, anime, donghua

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Search both anime and donghua in parallel
      const [animeRes, donghuaRes] = await Promise.all([
        animeAPI.search(searchQuery).catch(() => ({ data: { animeList: [] } })),
        animeAPI.searchDonghua(searchQuery).catch(() => ({ data: [] })),
      ]);

      const animeList = animeRes?.data?.animeList || [];
      const donghuaList = Array.isArray(donghuaRes?.data) ? donghuaRes.data : [];
      
      setAnimeResults(animeList);
      setDonghuaResults(donghuaList);
    } catch (err) {
      setError(err?.message ?? 'Gagal mencari');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'anime':
        return { anime: animeResults, donghua: [] };
      case 'donghua':
        return { anime: [], donghua: donghuaResults };
      default:
        return { anime: animeResults, donghua: donghuaResults };
    }
  };

  const { anime, donghua } = getFilteredResults();
  const totalResults = animeResults.length + donghuaResults.length;

  return (
    <div className="main-container">
      <header className="page-header">
        <h1 className="main-title">Search</h1>
        <p className="subtitle">Cari anime atau donghua</p>
      </header>

      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari anime atau donghua..."
          className="search-input"
        />
        <button type="submit" className="btn btn-primary">
          Cari
        </button>
      </form>

      {query && !loading && (
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Semua ({totalResults})
          </button>
          <button
            className={`filter-tab ${activeTab === 'anime' ? 'active' : ''}`}
            onClick={() => setActiveTab('anime')}
          >
            Anime ({animeResults.length})
          </button>
          <button
            className={`filter-tab ${activeTab === 'donghua' ? 'active' : ''}`}
            onClick={() => setActiveTab('donghua')}
          >
            Donghua ({donghuaResults.length})
          </button>
        </div>
      )}

      {loading && <div className="loading-container"><div className="spinner" /></div>}
      
      {error && <div className="error-message">{error}</div>}

      {!loading && query && (
        <>
          {anime.length > 0 && (
            <section className="section">
              <h2 className="section-title">Anime ({anime.length})</h2>
              <div className="anime-grid">
                {anime.map((item, idx) => (
                  <AnimeCard
                    key={item.animeId || idx}
                    anime={{
                      ...item,
                      provider: 'otakudesu',
                    }}
                    index={idx}
                    providerHint="Anime"
                  />
                ))}
              </div>
            </section>
          )}

          {donghua.length > 0 && (
            <section className="section">
              <h2 className="section-title">Donghua ({donghua.length})</h2>
              <div className="anime-grid">
                {donghua.map((item, idx) => (
                  <AnimeCard
                    key={item.slug || idx}
                    anime={{
                      ...item,
                      animeId: item.slug,
                      title: item.title,
                      poster: item.poster,
                      status: item.status,
                      type: item.type,
                      provider: 'donghua',
                    }}
                    index={idx}
                    providerHint="Donghua"
                  />
                ))}
              </div>
            </section>
          )}

          {anime.length === 0 && donghua.length === 0 && (
            <div className="empty-state">
              <p>Tidak ada hasil untuk "{query}"</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <Link to="/ongoing" className="btn btn-primary">
                  Browse Anime
                </Link>
                <Link to="/donghua-ongoing" className="btn btn-secondary">
                  Browse Donghua
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="empty-state">
          <p>Masukkan kata kunci untuk mencari anime atau donghua</p>
        </div>
      )}
    </div>
  );
};

export default UnifiedSearch;
