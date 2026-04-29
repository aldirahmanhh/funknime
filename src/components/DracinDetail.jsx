import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { animeAPI } from '../services/api';
import { SkeletonAnimeDetail } from './Skeleton';

const DracinDetail = () => {
  const { slug: bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [dramaInfo, setDramaInfo] = useState(location.state?.dramaInfo || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived metadata — updates when dramaInfo changes
  const title = dramaInfo?.title || `Drama ${bookId}`;
  const poster = dramaInfo?.poster || '';
  const introduction = dramaInfo?.introduction || '';
  const totalFromCard = dramaInfo?.chapterCount || null;
  const playCount = dramaInfo?.playCount || null;
  const corner = dramaInfo?.corner || null;
  const tags = dramaInfo?.tagV3s || [];

  useEffect(() => {
    const hasNavState = !!location.state?.dramaInfo;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If no dramaInfo from navigation state, try fetching detail
        if (!hasNavState) {
          try {
            const detailRes = await animeAPI.getDracinDetail(bookId);
            if (detailRes?.data) {
              const d = detailRes.data;
              setDramaInfo({
                bookId: d.bookId || bookId,
                title: d.bookName || d.name || d.title,
                poster: d.coverWap || d.cover,
                introduction: d.introduction || d.description,
                chapterCount: d.chapterCount || d.totalChapters,
                playCount: d.playCount,
                corner: d.corner,
                tagV3s: d.tagV3s || d.tags || [],
              });
            }
          } catch {
            // getDracinDetail is known to be unreliable — continue without it
          }
        }

        // Always fetch chapters
        const response = await animeAPI.getDracinChapters(bookId);
        const chaptersData = response?.data?.chapters || [];
        setChapters(chaptersData);

        // If we still have no dramaInfo, use whatever we can from chapters response
        if (!hasNavState) {
          setDramaInfo((prev) => prev || {
            bookId,
            title: response?.data?.bookName || null,
            chapterCount: response?.data?.totalChapters || chaptersData.length,
          });
        }
      } catch (err) {
        console.error('[DracinDetail] Error fetching chapters:', err);
        setError(err?.message ?? 'Gagal memuat daftar episode');
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchData();
    }
  }, [bookId, location.state?.dramaInfo]);

  if (loading) {
    return (
      <div className="main-container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Beranda</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/dracin-latest">DramaBox</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Memuat...</span>
        </nav>
        <SkeletonAnimeDetail />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container main-container">
        <div className="error-icon" aria-hidden="true">🎭</div>
        <h2>Gagal Memuat Drama</h2>
        <p className="error-message">{error}</p>
        <div className="error-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate(-1)}>
            ← Kembali
          </button>
          <Link to="/dracin-latest" className="btn btn-secondary">
            Drama Terbaru
          </Link>
        </div>
      </div>
    );
  }

  const totalEpisodes = chapters.length || totalFromCard || 0;

  return (
    <div className="anime-detail main-container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Beranda</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/dracin-latest">DramaBox</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{title}</span>
      </nav>

      <section className="section section-neo">
        <div className="anime-header">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="poster"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x300/2e2e2e/9B59B6?text=Drama';
              }}
            />
          ) : (
            <div
              className="poster"
              style={{
                width: 200,
                height: 300,
                borderRadius: 12,
                background: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
              }}
              aria-hidden="true"
            >
              🎭
            </div>
          )}
          <div className="anime-info">
            <h1>{title}</h1>
            <p className="subtitle">📺 DramaBox</p>
            <div className="info-grid">
              <div className="info-item"><strong>Total Episode:</strong> {totalEpisodes}</div>
              {corner && <div className="info-item"><strong>Status:</strong> {corner}</div>}
              {playCount && <div className="info-item"><strong>Views:</strong> {Number(playCount).toLocaleString()}</div>}
            </div>

            {Array.isArray(tags) && tags.length > 0 && (
              <div className="genres">
                <h3>Tags:</h3>
                {tags.map((tag) => (
                  <span key={tag.id || tag.name || tag} className="genre-tag">
                    {tag.name || tag}
                  </span>
                ))}
              </div>
            )}

            {chapters.length > 0 && (
              <div className="action-buttons">
                <Link
                  to={`/watch/${bookId}`}
                  state={{ provider: 'dracin', episodeIndex: 1, dramaTitle: title }}
                  className="btn btn-primary btn-large"
                >
                  ▶ Mulai Episode 1
                </Link>
                {chapters.length > 1 && (
                  <Link
                    to={`/watch/${bookId}`}
                    state={{ provider: 'dracin', episodeIndex: chapters.length, dramaTitle: title }}
                    className="btn btn-secondary btn-large"
                  >
                    Episode Terbaru ({chapters.length})
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section section-neo anime-content">
        {introduction && (
          <section className="synopsis">
            <h2>Sinopsis</h2>
            <p>{introduction}</p>
          </section>
        )}

        {chapters.length > 0 ? (
          <section className="episodes-section">
            <h2>Daftar Episode ({chapters.length})</h2>
            <div className="episodes-grid">
              {chapters.map((chapter, idx) => {
                const epName = chapter.chapterName || `Episode ${chapter.chapterIndex || idx + 1}`;
                const epIndex = chapter.chapterIndex || idx + 1;

                return (
                  <div key={chapter.chapterId || idx} className="episode-card">
                    <div className="episode-info">
                      <span className="episode-number">{epName}</span>
                    </div>
                    <div className="episode-actions">
                      <Link
                        to={`/watch/${bookId}`}
                        state={{ provider: 'dracin', episodeIndex: epIndex, dramaTitle: title }}
                        className="watch-btn btn btn-secondary"
                      >
                        Nonton
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="empty-state">
            <p>Episode belum tersedia</p>
            <p className="error-hint">Daftar episode mungkin belum tersedia untuk drama ini</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DracinDetail;
