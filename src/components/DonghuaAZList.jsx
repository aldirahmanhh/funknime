import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import AnimeCard from './AnimeCard';

const DonghuaAZList = () => {
  const [donghua, setDonghua] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState('a');
  const [page, setPage] = useState(1);

  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  useEffect(() => {
    const fetchDonghua = async () => {
      try {
        setLoading(true);
        const response = await animeAPI.getDonghuaAZList(selectedLetter, page);
        const donghuaList = response?.donghua_list || [];
        setDonghua(donghuaList);
      } catch (err) {
        setError(err?.message ?? 'Gagal memuat donghua');
      } finally {
        setLoading(false);
      }
    };
    fetchDonghua();
  }, [selectedLetter, page]);

  const handleLetterChange = (letter) => {
    setSelectedLetter(letter);
    setPage(1);
  };

  return (
    <div className="main-container">
      <header className="page-header">
        <h1 className="main-title">🔤 Donghua A-Z</h1>
        <p className="subtitle">Browse by alphabet</p>
      </header>

      <div className="az-navigation">
        {letters.map(letter => (
          <button
            key={letter}
            className={`az-btn ${selectedLetter === letter ? 'active' : ''}`}
            onClick={() => handleLetterChange(letter)}
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {!loading && donghua.length > 0 && (
        <>
          <p className="results-count">{donghua.length} donghua dengan huruf "{selectedLetter.toUpperCase()}"</p>
          <div className="anime-grid">
            {donghua.map((item, idx) => (
              <AnimeCard
                key={item.slug || idx}
                anime={{
                  ...item,
                  animeId: item.slug,
                  title: item.title,
                  poster: item.poster,
                  status: item.status,
                  type: item.type,
                  provider: 'donghua',
                }}
                index={idx}
                providerHint="Donghua"
              />
            ))}
          </div>
        </>
      )}

      {!loading && donghua.length === 0 && (
        <div className="empty-state">
          <p>Tidak ada donghua dengan huruf "{selectedLetter.toUpperCase()}"</p>
        </div>
      )}

      {donghua.length >= 10 && (
        <div className="pagination">
          {page > 1 && (
            <button className="btn btn-secondary" onClick={() => setPage(page - 1)}>
              ← Previous
            </button>
          )}
          <span className="btn">Page {page}</span>
          <button className="btn btn-primary" onClick={() => setPage(page + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default DonghuaAZList;
