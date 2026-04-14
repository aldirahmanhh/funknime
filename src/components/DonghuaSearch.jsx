import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import AnimeCard from './AnimeCard';

const DonghuaSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await animeAPI.searchDonghua(searchQuery);
      
      // Handle response structure: response.data is the array
      const donghuaList = Array.isArray(response?.data) ? response.data : [];
      
      setResults(donghuaList);
    } catch (err) {
      setError(err?.message ?? 'Gagal mencari donghua');
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

  return (
    <div className="main-container">
      <header className="page-header">
        <h1 className="main-title">Cari Donghua</h1>
      </header>

      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari donghua..."
          className="search-input"
        />
        <button type="submit" className="btn btn-primary">
          Cari
        </button>
      </form>

      {loading && <div className="loading-container"><div className="spinner" /></div>}
      
      {error && <div className="error-message">{error}</div>}

      {!loading && results.length > 0 && (
        <>
          <p className="search-results-count">{results.length} hasil ditemukan</p>
          <div className="anime-grid">
            {results.map((item, idx) => (
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
        </>
      )}

      {!loading && query && results.length === 0 && (
        <div className="empty-state">
          <p>Tidak ada hasil untuk "{query}"</p>
          <Link to="/donghua-ongoing" className="btn btn-primary">
            Browse Donghua
          </Link>
        </div>
      )}
    </div>
  );
};

export default DonghuaSearch;
