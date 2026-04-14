import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import '../donghua-pages.css';

const DracinList = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await animeAPI.getDracinList();
        
        if (response && Array.isArray(response.data)) {
          setAnimeList(response.data);
        } else {
          setAnimeList([]);
        }
      } catch (err) {
        console.error('Error fetching Dracin list:', err);
        setError(err.message || 'Gagal memuat daftar anime');
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  const filteredAnime = animeList.filter(anime =>
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="main-container">
        <div className="loading-container">
          <div className="spinner" />
          <p>Memuat daftar anime...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <div className="error-container">
          <h2>Terjadi Kesalahan</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container donghua-page">
      <div className="page-header">
        <h1>Daftar Anime Dracin</h1>
        <p>Semua anime dari provider Dracin ({animeList.length} anime)</p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Cari anime..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredAnime.length === 0 ? (
        <div className="empty-state">
          <p>{searchQuery ? 'Tidak ada hasil' : 'Tidak ada anime'}</p>
        </div>
      ) : (
        <div className="anime-grid">
          {filteredAnime.map((anime, idx) => (
            <Link
              key={idx}
              to={`/dracin/${anime.slug}`}
              className="anime-card"
            >
              <div className="anime-poster">
                <img
                  src={anime.poster}
                  alt={anime.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x280/2e2e2e/666?text=No+Image';
                  }}
                />
                <div className="anime-overlay">
                  <span className="play-icon">▶</span>
                </div>
              </div>
              <div className="anime-info">
                <h3 className="anime-title">{anime.title}</h3>
                <div className="anime-meta">
                  {anime.type && <span className="type-badge">{anime.type}</span>}
                  {anime.status && <span className="status-badge">{anime.status}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DracinList;
