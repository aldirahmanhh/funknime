import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import AnimeCard from './AnimeCard';
import { SkeletonAnimeGrid } from './Skeleton';

const DracinLatest = () => {
  const [dramas, setDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchDramas = async () => {
      try {
        setLoading(true);
        const response = await animeAPI.getDracinLatest(page);
        
        // DramaBox API returns { success, data: { results: [...] } }
        const dramaList = response?.data?.results || response?.data || [];
        
        setDramas(Array.isArray(dramaList) ? dramaList : []);
      } catch (err) {
        setError(err?.message ?? 'Gagal memuat drama terbaru');
        console.error('Dracin latest error:', err);
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
          <h1 className="main-title">Drama Terbaru</h1>
          <p className="subtitle">Drama Korea & Asia terbaru</p>
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
        <h1 className="main-title">Drama Terbaru</h1>
        <p className="subtitle">Drama Korea & Asia terbaru - {dramas.length} judul</p>
      </header>

      {dramas.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada drama terbaru saat ini</p>
          <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
        </div>
      ) : (
        <div className="anime-grid">
          {dramas.map((item, idx) => (
            <AnimeCard
              key={item.bookId || idx}
              anime={{
                ...item,
                animeId: item.bookId,
                title: item.bookName || item.title,
                poster: item.coverWap || item.poster,
                episodes: item.chapterCount ? `${item.chapterCount} Episode` : '',
                status: item.corner || 'Latest',
                type: 'Drama',
                provider: 'dracin',
              }}
              index={idx}
              statusOverride={item.corner || 'Latest'}
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

export default DracinLatest;


