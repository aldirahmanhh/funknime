import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import AnimeCard from './AnimeCard';
import { SkeletonAnimeGrid } from './Skeleton';

const DonghuaCompleted = () => {
  const [donghua, setDonghua] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchDonghua = async () => {
      try {
        setLoading(true);
        const response = await animeAPI.getDonghuaCompleted(page);
        
        console.log('[DonghuaCompleted] API Response:', response);
        
        // Response structure: { status, creator, completed_donghua: [...] }
        const donghuaList = response?.completed_donghua || [];
        
        console.log('[DonghuaCompleted] Extracted list:', donghuaList);
        
        setDonghua(Array.isArray(donghuaList) ? donghuaList : []);
      } catch (err) {
        setError(err?.message ?? 'Gagal memuat donghua completed');
        console.error('Donghua completed error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonghua();
  }, [page]);

  if (loading) {
    return (
      <div className="main-container">
        <header className="page-header">
          <h1 className="main-title">Donghua Completed</h1>
          <p className="subtitle">Donghua yang sudah tamat</p>
        </header>
        <SkeletonAnimeGrid count={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container main-container">
        <p className="error-message">Gagal memuat donghua: {error}</p>
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
        <h1 className="main-title">Donghua Completed</h1>
        <p className="subtitle">Donghua yang sudah tamat - {donghua.length} judul</p>
      </header>

      {donghua.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada donghua completed saat ini</p>
          <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
        </div>
      ) : (
        <div className="anime-grid">
          {donghua.map((item, idx) => (
            <AnimeCard
              key={item.slug || item.href || idx}
              anime={{
                ...item,
                animeId: item.slug || item.href,
                title: item.title,
                poster: item.poster,
                episodes: item.episodes,
                status: 'Completed',
                type: 'Donghua',
                provider: 'donghua',
              }}
              index={idx}
              statusOverride="Completed"
              providerHint="Donghua"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination" style={{ marginTop: '40px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {page > 1 && (
          <button 
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
          className="btn btn-primary" 
          onClick={() => setPage(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default DonghuaCompleted;
