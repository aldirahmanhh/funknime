import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import AnimeCard from './AnimeCard';
import { SkeletonAnimeGrid } from './Skeleton';

const DracinPopular = () => {
  const [dramas, setDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchDramas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await animeAPI.getDracinPopular(page);
        // DramaBox trending returns { success, data: { results: [...] } }
        const dramaList = response?.data?.results || response?.data || [];
        setDramas(Array.isArray(dramaList) ? dramaList : []);
      } catch (err) {
        console.error('Error fetching popular dramas:', err);
        setError(err?.message ?? 'Gagal memuat drama populer');
      } finally {
        setLoading(false);
      }
    };

    fetchDramas();
  }, [page]);

  if (loading) {
    return (
      <div className="main-container">
        <header className="page-header">
          <h1 className="main-title">Drama Populer</h1>
          <p className="subtitle">Drama paling banyak ditonton</p>
        </header>
        <SkeletonAnimeGrid count={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container main-container">
        <p className="error-message">Gagal memuat drama: {error}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Coba Lagi
        </button>
        <Link to="/" className="btn btn-secondary">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="main-container">
      <header className="page-header">
        <h1 className="main-title">Drama Populer</h1>
        <p className="subtitle">Drama paling banyak ditonton - {dramas.length} judul</p>
      </header>

      {dramas.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada drama populer saat ini</p>
          <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
        </div>
      ) : (
        <div className="anime-grid">
          {dramas.map((drama, index) => (
            <AnimeCard
              key={drama.bookId || index}
              index={index}
              anime={{
                ...drama,
                animeId: drama.bookId,
                title: drama.bookName || drama.title,
                poster: drama.coverWap || drama.poster,
                episodes: drama.chapterCount ? `${drama.chapterCount} Episode` : '',
                status: drama.corner || 'Popular',
                type: 'Drama',
                provider: 'dracin',
              }}
              statusOverride={drama.corner || 'Popular'}
              providerHint="DramaBox"
            />
          ))}
        </div>
      )}

      <div className="pagination" style={{ marginTop: '40px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {page > 1 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
        )}
        <span className="btn" style={{ background: 'var(--color-surface)' }}>
          Page {page}
        </span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setPage(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default DracinPopular;
