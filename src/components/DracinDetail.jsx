import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import '../donghua-pages.css';

const DracinDetail = () => {
  const { slug } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await animeAPI.getDracinDetail(slug);
        
        if (response && response.data) {
          setAnime(response.data);
        } else {
          setError('Anime tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetching Dracin detail:', err);
        setError(err.message || 'Gagal memuat detail anime');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="main-container">
        <div className="loading-container">
          <div className="spinner" />
          <p>Memuat detail anime...</p>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="main-container">
        <div className="error-container">
          <h2>Terjadi Kesalahan</h2>
          <p>{error || 'Anime tidak ditemukan'}</p>
          <Link to="/dracin-list" className="btn btn-primary">
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    );
  }

  const episodes = anime.episodes || [];

  return (
    <div className="main-container donghua-detail">
      <div className="detail-header">
        <div className="detail-poster">
          <img
            src={anime.poster}
            alt={anime.title}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x420/2e2e2e/666?text=No+Image';
            }}
          />
        </div>
        <div className="detail-info">
          <h1>{anime.title}</h1>
          
          <div className="detail-meta">
            <span className="provider-badge" style={{ backgroundColor: '#9B59B6' }}>
              Dracin
            </span>
          </div>

          {anime.synopsis && (
            <div className="detail-synopsis">
              <h3>Sinopsis</h3>
              <p>{anime.synopsis}</p>
            </div>
          )}

          {anime.genres && anime.genres.length > 0 && (
            <div className="detail-genres">
              <h3>Genre</h3>
              <div className="genre-tags">
                {anime.genres.map((genre, idx) => (
                  <span key={idx} className="genre-tag">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(episodes) && episodes.length > 0 && (
            <div className="action-buttons">
              <Link 
                to={`/watch/${episodes[episodes.length - 1].eps_slug}`}
                className="btn btn-primary btn-large"
                state={{ provider: 'dracin' }}
              >
                ▶ Mulai Episode 1
              </Link>
              {episodes.length > 1 && (
                <Link 
                  to={`/watch/${episodes[0].eps_slug}`}
                  className="btn btn-secondary btn-large"
                  state={{ provider: 'dracin' }}
                >
                  Episode Terbaru
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {Array.isArray(episodes) && episodes.length > 0 && (
        <div className="episodes-section">
          <h2>Daftar Episode ({episodes.length})</h2>
          <div className="episodes-grid">
            {episodes.map((ep, idx) => (
              <Link
                key={idx}
                to={`/watch/${ep.eps_slug}`}
                className="episode-card"
                state={{ provider: 'dracin' }}
              >
                <div className="episode-number">
                  {ep.eps_title || `Episode ${idx + 1}`}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DracinDetail;
