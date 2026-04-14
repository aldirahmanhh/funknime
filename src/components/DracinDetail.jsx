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
          <Link to="/dracin-popular" className="btn btn-primary">
            Kembali ke Popular
          </Link>
        </div>
      </div>
    );
  }

  const episodes = anime.episodes || [];
  const tags = anime.tags || [];
  const recommendations = anime.recommendations || [];

  return (
    <div className="main-container donghua-detail">
      <div className="detail-header">
        <div className="detail-poster">
          <img
            src={anime.poster || 'https://via.placeholder.com/300x420/2e2e2e/666?text=No+Image'}
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
            {anime.total_episodes && (
              <span className="episode-count">{anime.total_episodes} Episode</span>
            )}
          </div>

          {anime.synopsis && (
            <div className="detail-synopsis">
              <h3>Sinopsis</h3>
              <p>{anime.synopsis}</p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="detail-genres">
              <h3>Tags</h3>
              <div className="genre-tags">
                {tags.map((tag, idx) => (
                  <span key={idx} className="genre-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(episodes) && episodes.length > 0 && (
            <div className="action-buttons">
              <Link 
                to={`/watch/${episodes[0].slug}?ep=${episodes[0].index}`}
                className="btn btn-primary btn-large"
                state={{ provider: 'dracin' }}
              >
                ▶ Mulai Episode 1
              </Link>
              {episodes.length > 1 && (
                <Link 
                  to={`/watch/${episodes[episodes.length - 1].slug}?ep=${episodes[episodes.length - 1].index}`}
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
                to={`/watch/${ep.slug}?ep=${ep.index}`}
                className="episode-card"
                state={{ provider: 'dracin' }}
              >
                <div className="episode-number">
                  Episode {ep.episode}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="episodes-section">
          <h2>Rekomendasi</h2>
          <div className="anime-grid">
            {recommendations.map((rec, idx) => (
              <Link
                key={idx}
                to={`/dracin/${rec.slug}`}
                className="anime-card"
              >
                <div className="anime-poster">
                  <img
                    src={rec.poster}
                    alt={rec.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x280/2e2e2e/666?text=No+Image';
                    }}
                  />
                  <div className="anime-overlay">
                    <span className="play-icon">▶</span>
                  </div>
                  {rec.episode_info && (
                    <div className="episode-badge">
                      {rec.episode_info}
                    </div>
                  )}
                </div>
                <div className="anime-info">
                  <h3 className="anime-title">{rec.title}</h3>
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
