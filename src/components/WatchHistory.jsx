import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWatchHistory, clearWatchHistory } from '../utils/watchHistory';

const WatchHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getWatchHistory());
  }, []);

  const handleClear = () => {
    clearWatchHistory();
    setHistory([]);
  };

  if (history.length === 0) {
    return (
      <div className="anime-list-page main-container">
        <header className="page-header section section-neo">
          <h1 className="main-title text-gradient">Riwayat Tonton</h1>
          <p className="subtitle">Belum ada anime yang kamu tonton.</p>
        </header>
      </div>
    );
  }

  return (
    <div className="anime-list-page main-container">
      <header className="page-header section section-neo">
        <h1 className="main-title text-gradient">Riwayat Tonton</h1>
        <p className="subtitle">Lanjutkan anime yang terakhir kamu tonton.</p>
        <button type="button" className="btn btn-secondary" onClick={handleClear}>
          Hapus Riwayat
        </button>
      </header>

      <section className="section section-neo">
        <div className="anime-grid">
          {history.map((item, idx) => (
            <Link
              key={`${item.animeId}-${item.episodeId}-${idx}`}
              to={`/watch/${item.episodeId}`}
              state={{ provider: item.provider, backAnimeId: item.animeId }}
              className="anime-card card"
            >
              <div className="card-image-wrapper">
                <span className="anime-card-badge anime-card-badge--ongoing">
                  Lanjut
                </span>
                {item.poster && (
                  <img src={item.poster} alt={item.animeTitle} className="poster" />
                )}
                <div className="card-overlay">
                  <span className="play-icon" aria-hidden>▶</span>
                </div>
              </div>
              <div className="anime-info">
                <h3>{item.animeTitle}</h3>
                <div className="meta">
                  <span className="episode-count">
                    🎬 {item.episodeTitle || `Episode ${item.episodeId}`}
                  </span>
                  <span className="score">
                    {item.provider === 'samehadaku'
                      ? 'Samehadaku'
                      : item.provider === 'stream'
                      ? 'Stream'
                      : 'Otakudesu'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WatchHistory;

