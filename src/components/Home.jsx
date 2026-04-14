import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import { SkeletonAnimeGrid } from './Skeleton';
import AnimeCard from './AnimeCard';
import AnimeCarousel from './AnimeCarousel';
import Footer from './Footer';
import { getWatchHistory } from '../utils/watchHistory';

const DAY_ORDER = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const Home = () => {
  const [homeData, setHomeData] = useState(null);
  const [donghuaData, setDonghuaData] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchHistory, setWatchHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          homeRes,
          sameOngoingRes,
          sameCompletedRes,
          scheduleRes,
          donghuaOngoingRes,
          donghuaCompletedRes,
        ] = await Promise.all([
          animeAPI.getHome(),
          animeAPI.getOngoingSamehadaku().catch(() => null),
          animeAPI.getCompletedSamehadaku().catch(() => null),
          animeAPI.getSchedule().catch(() => null),
          animeAPI.getDonghuaOngoing(1).catch(() => null),
          animeAPI.getDonghuaCompleted(1).catch(() => null),
        ]);

        const otakOngoing = homeRes?.data?.ongoing?.animeList || [];
        const otakCompleted = homeRes?.data?.completed?.animeList || [];
        const sameOngoing = sameOngoingRes?.data?.animeList || [];
        const sameCompleted = sameCompletedRes?.data?.animeList || [];

        const normalizeKey = (item) => {
          const raw = (item.title || item.name || '').toString().toLowerCase();
          return raw.replace(/\s+/g, ' ').trim();
        };

        const mergeLists = (otakList, sameList, status) => {
          const map = new Map();

          otakList.forEach((a) => {
            const key = normalizeKey(a);
            const existing = map.get(key);
            const base = existing || {};
            map.set(key, {
              ...base,
              ...a,
              providers: base.providers
                ? Array.from(new Set([...base.providers, 'otakudesu']))
                : ['otakudesu'],
              provider: 'otakudesu',
              status,
            });
          });

          sameList.forEach((a) => {
            const key = normalizeKey(a);
            const existing = map.get(key);
            if (existing) {
              const providers = existing.providers
                ? Array.from(new Set([...existing.providers, 'samehadaku']))
                : ['samehadaku'];
              map.set(key, {
                ...existing,
                providers,
              });
            } else {
              map.set(key, {
                ...a,
                providers: ['samehadaku'],
                provider: 'samehadaku',
                status,
              });
            }
          });

          return Array.from(map.values());
        };

        const mergedOngoing = mergeLists(otakOngoing, sameOngoing, 'Ongoing');
        const mergedCompleted = mergeLists(otakCompleted, sameCompleted, 'Completed');

        setHomeData({
          ongoing: mergedOngoing,
          completed: mergedCompleted,
        });

        // Donghua data
        const donghuaOngoing = donghuaOngoingRes?.ongoing_donghua || [];
        const donghuaCompleted = donghuaCompletedRes?.completed_donghua || [];
        
        setDonghuaData({
          ongoing: donghuaOngoing,
          completed: donghuaCompleted,
        });

        if (scheduleRes?.data) setScheduleData(scheduleRes);
      } catch (err) {
        setError(err?.message ?? 'Gagal memuat data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    setWatchHistory(getWatchHistory());
  }, []);

  if (loading) {
    return (
      <div className="home-container main-container">
        <header className="page-header home-hero">
          <div className="skeleton skeleton-text" style={{ height: 40, width: 240 }} />
          <div className="skeleton skeleton-text" style={{ height: 20, width: 320, marginTop: 12 }} />
          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: 120, height: 44 }} />
            <div className="skeleton" style={{ width: 100, height: 44 }} />
          </div>
        </header>
        <section className="section">
          <div className="skeleton skeleton-text" style={{ height: 28, width: 140, marginBottom: 20 }} />
          <SkeletonAnimeGrid count={6} />
        </section>
        <section className="section">
          <div className="skeleton skeleton-text" style={{ height: 28, width: 160, marginBottom: 20 }} />
          <SkeletonAnimeGrid count={6} />
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container main-container">
        <p className="error-message">Gagal memuat anime: {error}</p>
        <p className="error-hint">Periksa koneksi internet atau coba lagi nanti.</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Coba Lagi
        </button>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: 8 }}>Kembali ke Beranda</Link>
      </div>
    );
  }

  const ongoing = homeData?.ongoing || [];
  const completed = homeData?.completed || [];
  const donghuaOngoing = donghuaData?.ongoing || [];
  const donghuaCompleted = donghuaData?.completed || [];
  const days = Array.isArray(scheduleData?.data) ? scheduleData.data : [];

  const buildRailItems = (animeList, statusOverride, isDonghua = false) =>
    (animeList || []).map((anime, idx) => {
      if (isDonghua) {
        return (
          <div className="home-rail-card" key={anime.slug ?? idx}>
            <AnimeCard
              anime={{
                ...anime,
                animeId: anime.slug,
                provider: 'donghua',
              }}
              index={idx}
              statusOverride={statusOverride}
              providerHint="Donghua"
            />
          </div>
        );
      }

      const providers = anime.providers || (anime.provider ? [anime.provider] : []);
      const hasOtak = providers.includes('otakudesu');
      const hasSame = providers.includes('samehadaku');

      let providerHint = 'Otakudesu';
      if (hasOtak && hasSame) providerHint = 'Otakudesu & Samehadaku';
      else if (hasSame) providerHint = 'Samehadaku';

      return (
        <div className="home-rail-card" key={anime.animeId ?? anime.slug ?? idx}>
          <AnimeCard
            anime={{
              ...anime,
              provider: hasOtak ? 'otakudesu' : (hasSame ? 'samehadaku' : anime.provider),
            }}
            index={idx}
            statusOverride={statusOverride}
            providerHint={providerHint}
          />
        </div>
      );
    });

  const popularList = ongoing.length >= 4 ? ongoing : [...ongoing, ...completed].slice(0, 10);

  return (
    <div className="home-container main-container">
      <header className="page-header home-hero home-hero--streaming">
        <div className="home-hero-copy">
          <h1 className="main-title text-gradient" data-text="FUNKNIME">FUNKNIME</h1>
          <p className="subtitle">
            Streaming anime & donghua sub Indo dengan katalog gabungan Otakudesu & Samehadaku.
          </p>
          <div className="home-hero-actions">
            <Link to="/search" className="btn btn-primary">Mulai cari anime</Link>
            <Link to="/ongoing" className="btn btn-secondary">Lihat yang sedang tayang</Link>
          </div>
        </div>
        {ongoing.length > 0 && (
          <div className="home-hero-featured">
            <AnimeCarousel items={ongoing.slice(0, 8)} maxItems={5} />
          </div>
        )}
      </header>

      {watchHistory.length > 0 && (
        <section className="section home-rail">
          <div className="section-header home-rail-header">
            <h2 className="section-title">Lanjut tonton</h2>
            <Link to="/history" className="view-all">Lihat semua</Link>
          </div>
          <div className="home-rail-scroll">
            {watchHistory.slice(0, 12).map((item, idx) => (
              <div className="home-rail-card" key={`${item.animeId}-${item.episodeId}-${idx}`}>
                <Link
                  to={`/watch/${item.episodeId}`}
                  state={{ provider: item.provider, backAnimeId: item.animeId }}
                  className="anime-card card"
                >
                  <div className="card-image-wrapper">
                    <span className="anime-card-badge anime-card-badge--ongoing">
                      Lanjut
                    </span>
                    {item.poster && (
                      <img
                        src={item.poster}
                        alt={item.animeTitle}
                        className="poster"
                      />
                    )}
                    <div className="card-overlay">
                      <span className="play-icon" aria-hidden>▶</span>
                    </div>
                  </div>
                  <div className="anime-info">
                    <h3>{item.animeTitle}</h3>
                    <div className="meta">
                      <span className="episode-count">
                        {item.episodeTitle || `Episode ${item.episodeId}`}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {ongoing.length > 0 && (
        <section className="section home-rail">
          <div className="section-header home-rail-header">
            <h2 className="section-title">Anime sedang tayang</h2>
            <Link to="/ongoing" className="view-all">Lihat semua</Link>
          </div>
          <div className="home-rail-scroll">
            {buildRailItems(ongoing, 'Ongoing')}
          </div>
        </section>
      )}

      {donghuaOngoing.length > 0 && (
        <section className="section home-rail">
          <div className="section-header home-rail-header">
            <h2 className="section-title">Donghua sedang tayang</h2>
            <Link to="/donghua-ongoing" className="view-all">Lihat semua</Link>
          </div>
          <div className="home-rail-scroll">
            {buildRailItems(donghuaOngoing, 'Ongoing', true)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="section home-rail">
          <div className="section-header home-rail-header">
            <h2 className="section-title">Anime baru selesai</h2>
            <Link to="/completed" className="view-all">Lihat semua</Link>
          </div>
          <div className="home-rail-scroll">
            {buildRailItems(completed, 'Completed')}
          </div>
        </section>
      )}

      {donghuaCompleted.length > 0 && (
        <section className="section home-rail">
          <div className="section-header home-rail-header">
            <h2 className="section-title">Donghua baru selesai</h2>
            <Link to="/donghua-completed" className="view-all">Lihat semua</Link>
          </div>
          <div className="home-rail-scroll">
            {buildRailItems(donghuaCompleted, 'Completed', true)}
          </div>
        </section>
      )}

      {days.length > 0 && (
        <section className="section section-neo home-schedule-preview">
          <div className="section-header section-header-neo">
            <h2 className="section-title section-title-neo">Ringkasan jadwal</h2>
            <Link to="/schedule" className="view-all">Buka jadwal</Link>
          </div>
          <div className="schedule-summary">
            <table>
              <thead>
                <tr>
                  <th>Hari</th>
                  <th>Total</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {days
                  .sort((a, b) => {
                    const ai = DAY_ORDER.indexOf(a.day || '');
                    const bi = DAY_ORDER.indexOf(b.day || '');
                    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
                  })
                  .map((row) => {
                    const list = row.anime_list ?? row.animeList ?? [];
                    const count = list.length;
                    return (
                      <tr key={row.day}>
                        <td>{row.day}</td>
                        <td>{count} anime</td>
                        <td>
                          <Link to={`/schedule`} className="schedule-buka">Buka</Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;
