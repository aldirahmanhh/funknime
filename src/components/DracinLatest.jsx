import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import '../donghua-pages.css';

const DracinLatest = () => {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await animeAPI.getDracinLatest(currentPage);
        
        if (response && response.data && Array.isArray(response.data)) {
          setEpisodes(response.data);
        } else {
          setEpisodes([]);
        }
      } catch (err) {
        console.error('Error fetching Dracin latest:', err);
        setError(err.message || 'Gagal memuat episode terbaru');
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="main-container">
        <div className="loading-container">
          <div className="spinner" />
          <p>Memuat episode terbaru...</p>
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
        <h1>Episode Terbaru Dracin</h1>
        <p>Episode anime terbaru dari provider Dracin</p>
      </div>

      {episodes.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada episode terbaru</p>
        </div>
      ) : (
        <>
          <div className="anime-grid">
            {episodes.map((item, idx) => (
              <Link
                key={idx}
                to={`/dracin/${item.slug}`}
                className="anime-card dracin-card"
              >
                <div className="anime-poster">
                  <img
                    src={item.poster}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x280/2e2e2e/666?text=No+Image';
                    }}
                  />
                  <div className="anime-overlay">
                    <span className="play-icon">▶</span>
                  </div>
                  {item.episode_info && (
                    <div className="episode-badge">
                      {item.episode_info}
                    </div>
                  )}
                </div>
                <div className="anime-info">
                  <h3 className="anime-title">{item.title}</h3>
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
              disabled={episodes.length === 0}
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

export default DracinLatest;
