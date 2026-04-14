import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { animeAPI } from '../services/api';

const DonghuaDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [donghua, setDonghua] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonghuaDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[DonghuaDetail] Fetching slug:', slug);
        const response = await animeAPI.getDonghuaDetail(slug);
        
        console.log('[DonghuaDetail] API Response:', response);
        
        // Extract donghua data
        const donghuaData = response?.data || response;
        setDonghua(donghuaData);
        
      } catch (err) {
        console.error('[DonghuaDetail] Error:', err);
        setError(err?.message ?? 'Gagal memuat detail donghua');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchDonghuaDetail();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="loading-container main-container">
        <div className="spinner" aria-hidden />
        <p>Memuat detail donghua...</p>
      </div>
    );
  }

  if (error || !donghua) {
    return (
      <div className="error-container main-container">
        <div className="error-icon" aria-hidden="true">🔍</div>
        <h2>Donghua Tidak Ditemukan</h2>
        <p className="error-message">{error || 'Donghua tidak ditemukan'}</p>
        <p className="error-hint">
          Donghua ini mungkin belum tersedia atau URL-nya salah.
        </p>
        <div className="error-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate(-1)}>
            ← Kembali
          </button>
          <Link to="/donghua-ongoing" className="btn btn-secondary">
            Donghua Ongoing
          </Link>
        </div>
      </div>
    );
  }

  // Extract data with fallbacks
  const title = donghua.title || 'Unknown Title';
  const poster = donghua.poster || donghua.poster_url || '';
  const synopsis = donghua.synopsis || donghua.description || 'Sinopsis tidak tersedia.';
  const status = donghua.status || 'Unknown';
  const type = donghua.type || 'Donghua';
  const genres = donghua.genres || donghua.genreList || [];
  const episodes = donghua.episodes || donghua.episodeList || [];

  return (
    <div className="anime-detail main-container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Beranda</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/donghua-ongoing">Donghua</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{title}</span>
      </nav>

      <section className="section section-neo">
        <div className="anime-header">
          <img
            src={poster}
            alt={title}
            className="poster"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x300/2e2e2e/6366f1?text=Poster';
            }}
          />
          <div className="anime-info">
            <h1>{title}</h1>
            <p className="subtitle">🐉 Donghua</p>
            <div className="info-grid">
              <div className="info-item"><strong>Status:</strong> {status}</div>
              <div className="info-item"><strong>Type:</strong> {type}</div>
              {donghua.year && <div className="info-item"><strong>Year:</strong> {donghua.year}</div>}
              {donghua.studio && <div className="info-item"><strong>Studio:</strong> {donghua.studio}</div>}
            </div>

            {Array.isArray(genres) && genres.length > 0 && (
              <div className="genres">
                <h3>Genre:</h3>
                {genres.map((genre, idx) => (
                  <span key={idx} className="genre-tag">
                    {typeof genre === 'string' ? genre : genre.name || genre.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section section-neo anime-content">
        <section className="synopsis">
          <h2>Sinopsis</h2>
          <p>{synopsis}</p>
        </section>

        {Array.isArray(episodes) && episodes.length > 0 && (
          <section className="episodes-section">
            <h2>Daftar Episode ({episodes.length})</h2>
            <div className="episodes-grid">
              {episodes.map((episode, idx) => (
                <div key={episode.slug || episode.episodeId || idx} className="episode-card">
                  <div className="episode-info">
                    <span className="episode-number">
                      Episode {episode.number || episode.eps || episode.title || idx + 1}
                    </span>
                    {episode.date && <span className="episode-date">{episode.date}</span>}
                  </div>
                  <div className="episode-actions">
                    <Link 
                      to={`/watch/${episode.slug || episode.episodeId}`} 
                      className="watch-btn btn btn-secondary"
                    >
                      Nonton
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(!episodes || episodes.length === 0) && (
          <div className="empty-state">
            <p>Episode list tidak tersedia</p>
            <p className="error-hint">Detail lengkap mungkin belum tersedia dari API</p>
          </div>
        )}
      </section>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Debug: Raw API Response</summary>
          <pre style={{ overflow: 'auto', fontSize: '12px', marginTop: '10px' }}>
            {JSON.stringify(donghua, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default DonghuaDetail;
