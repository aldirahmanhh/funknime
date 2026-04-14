import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import '../donghua-pages.css';

const DracinPopular = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await animeAPI.getDracinPopular(currentPage);
        
        if (response && response.data && Array.isArray(response.data)) {
          setAnimeList(response.data);
          setHasNext(response.pagination?.has_next || false);
        } else {
          setAnimeList([]);
          setHasNext(false);
        }
      } catch (err) {
        console.error('Error fetching Dracin popular:', err);
        setError(err.message || 'Gagal memuat daftar anime');
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, [currentPage]);

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
        <h1>Dracin Popular</h1>
        <p>Anime populer dari provider Dracin</p>
      </div>

      {animeList.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada anime</p>
        </div>
      ) : (
        <>
          <div className="anime-grid">
            {animeList.map((anime, idx) => (
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
                  {anime.episode_info && (
                    <div className="episode-badge">
                      {anime.episode_info}
                    </div>
                  )}
                </div>
                <div className="anime-info">
                  <h3 className="anime-title">{anime.title}</h3>
                  <div className="anime-meta">
                    <span className="provider-badge" style={{ backgroundColor: '#9B59B6' }}>
                      Dracin
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              ← Sebelumnya
            </button>
            <span className="page-info">Halaman {currentPage}</span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!hasNext}
              className="btn btn-primary"
            >
              Berikutnya →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DracinPopular;
