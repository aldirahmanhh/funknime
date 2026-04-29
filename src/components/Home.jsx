import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import { SkeletonAnimeGrid } from './Skeleton';
import AnimeCard from './AnimeCard';
import AnimeCarousel from './AnimeCarousel';
import Footer from './Footer';
import { getWatchHistory, formatTime } from '../utils/watchHistory';

const TRAKTEER_API_KEY = 'trapi-5JwaDliojNeKNsw5jPiI4Awa';
const DAY_ORDER = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const Home = () => {
  const [homeData, setHomeData] = useState(null);
  const [donghuaData, setDonghuaData] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchHistory, setWatchHistory] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [showDonatePopup, setShowDonatePopup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeRes, sameOngoingRes, sameCompletedRes, scheduleRes, donghuaOngoingRes, donghuaCompletedRes] = await Promise.all([
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

        const normalizeKey = (item) => (item.title || item.name || '').toString().toLowerCase().replace(/\s+/g, '').trim();

        const mergeLists = (otakList, sameList, status) => {
          const map = new Map();
          otakList.forEach((a) => {
            const key = normalizeKey(a);
            const existing = map.get(key) || {};
            map.set(key, { ...existing, ...a, providers: [...new Set([...(existing.providers || []), 'otakudesu'])], provider: 'otakudesu', status });
          });
          sameList.forEach((a) => {
            const key = normalizeKey(a);
            const existing = map.get(key);
            if (existing) {
              map.set(key, { ...existing, providers: [...new Set([...(existing.providers || []), 'samehadaku'])] });
            } else {
              map.set(key, { ...a, providers: ['samehadaku'], provider: 'samehadaku', status });
            }
          });
          return Array.from(map.values());
        };

        setHomeData({ ongoing: mergeLists(otakOngoing, sameOngoing, 'Ongoing'), completed: mergeLists(otakCompleted, sameCompleted, 'Completed') });
        setDonghuaData({ ongoing: donghuaOngoingRes?.ongoing_donghua || [], completed: donghuaCompletedRes?.completed_donghua || [] });
        if (scheduleRes?.data) setScheduleData(scheduleRes);
      } catch (err) {
        setError(err?.message ?? 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    setWatchHistory(getWatchHistory());

    // Fetch Trakteer top donors
    fetch('https://api.trakteer.id/v1/public/supports?limit=10&page=1', {
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'key': TRAKTEER_API_KEY },
    }).then(r => r.json()).then(d => {
      if (d?.result?.data) setTopDonors(d.result.data);
    }).catch(() => {});

    // Show donate popup after 30s for first-time visitors
    const shown = sessionStorage.getItem('donate_popup_shown');
    if (!shown) {
      const timer = setTimeout(() => { setShowDonatePopup(true); sessionStorage.setItem('donate_popup_shown', '1'); }, 30000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (loading) {
    return (
      <div className="home-container main-container">
        <header className="page-header home-hero">
          <div className="skeleton skeleton-text" style={{ height: 40, width: 240 }} />
          <div className="skeleton skeleton-text" style={{ height: 20, width: 320, marginTop: 12 }} />
        </header>
        <section className="section"><SkeletonAnimeGrid count={6} /></section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container main-container">
        <p className="error-message">Gagal memuat: {error}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Coba Lagi</button>
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
            <AnimeCard anime={{ ...anime, animeId: anime.slug, provider: 'donghua' }} index={idx} statusOverride={statusOverride} providerHint="Donghua" />
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
          <AnimeCard anime={{ ...anime, provider: hasOtak ? 'otakudesu' : (hasSame ? 'samehadaku' : anime.provider) }} index={idx} statusOverride={statusOverride} providerHint={providerHint} />
        </div>
      );
    });

  return (
    <div className="home-container main-container">
      {/* Donate Popup */}
      {showDonatePopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(4px)' }} onClick={() => setShowDonatePopup(false)}>
          <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '100%', textAlign: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDonatePopup(false)} style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>☕</div>
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px' }}>Dukung MrFunk!</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '20px', lineHeight: 1.6 }}>
              Bantu kami tetap online & berkembang dengan donasi melalui Trakteer. Setiap dukungan sangat berarti! 💜
            </p>
            <a href="https://trakteer.id/aldirahmanhh" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}>
              ☕ Trakteer Sekarang
            </a>
            <button onClick={() => setShowDonatePopup(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', fontSize: 'var(--text-xs)', cursor: 'pointer', marginTop: '8px' }}>Nanti saja</button>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="page-header home-hero home-hero--streaming">
        <div className="home-hero-copy">
          <h1 className="main-title text-gradient" data-text="MRFUNK">MRFUNK</h1>
          <p className="subtitle">Streaming anime & donghua sub Indo — katalog gabungan Otakudesu & Samehadaku.</p>
          <div className="home-hero-actions">
            <Link to="/search" className="btn btn-primary">🔍 Cari Anime</Link>
            <Link to="/ongoing" className="btn btn-secondary">📺 Sedang Tayang</Link>
          </div>
        </div>
        {ongoing.length > 0 && (
          <div className="home-hero-featured">
            <AnimeCarousel items={ongoing.slice(0, 8)} maxItems={8} />
          </div>
        )}
      </header>

      {/* Watch History */}
      {watchHistory.length > 0 && (
        <section className="section home-rail">
          <div className="section-header home-rail-header">
            <h2 className="section-title">🕐 Lanjut Tonton</h2>
            <Link to="/history" className="view-all">Lihat semua</Link>
          </div>
          <div className="home-rail-scroll">
            {watchHistory.slice(0, 12).map((item, idx) => (
              <div className="home-rail-card" key={`${item.animeId}-${item.episodeId}-${idx}`}>
                <Link to={`/watch/${item.episodeId}`} state={{ provider: item.provider, backAnimeId: item.animeId }} className="anime-card card">
                  <div className="card-image-wrapper">
                    <span className="anime-card-badge anime-card-badge--ongoing">Lanjut</span>
                    {item.poster ? <img src={item.poster} alt={item.animeTitle} className="poster" /> : <div style={{ width: '100%', height: '100%', background: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎬</div>}
                    <div className="card-overlay"><span className="play-icon" aria-hidden>▶</span></div>
                    {item.currentTime > 0 && item.duration > 0 && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.15)', zIndex: 3 }}>
                        <div style={{ height: '100%', width: `${Math.min((item.currentTime / item.duration) * 100, 100)}%`, background: 'var(--color-primary)', borderRadius: '0 2px 2px 0' }} />
                      </div>
                    )}
                  </div>
                  <div className="anime-info">
                    <h3>{item.animeTitle}</h3>
                    <div className="meta"><span className="episode-count">{item.episodeTitle || `Episode`}</span></div>
                    {item.currentTime > 0 && <div style={{ fontSize: '0.6rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '2px' }}>⏱️ {formatTime(item.currentTime)}</div>}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Anime sections */}
      {ongoing.length > 0 && (
        <section className="section home-rail">
          <div className="section-header home-rail-header"><h2 className="section-title">🔥 Anime Sedang Tayang</h2><Link to="/ongoing" className="view-all">Lihat semua</Link></div>
          <div className="home-rail-scroll">{buildRailItems(ongoing, 'Ongoing')}</div>
        </section>
      )}
      {donghuaOngoing.length > 0 && (
        <section className="section home-rail">
          <div className="section-header home-rail-header"><h2 className="section-title">🐉 Donghua Sedang Tayang</h2><Link to="/donghua-ongoing" className="view-all">Lihat semua</Link></div>
          <div className="home-rail-scroll">{buildRailItems(donghuaOngoing, 'Ongoing', true)}</div>
        </section>
      )}
      {completed.length > 0 && (
        <section className="section home-rail">
          <div className="section-header home-rail-header"><h2 className="section-title">✅ Anime Baru Selesai</h2><Link to="/completed" className="view-all">Lihat semua</Link></div>
          <div className="home-rail-scroll">{buildRailItems(completed, 'Completed')}</div>
        </section>
      )}
      {donghuaCompleted.length > 0 && (
        <section className="section home-rail">
          <div className="section-header home-rail-header"><h2 className="section-title">🐉 Donghua Baru Selesai</h2><Link to="/donghua-completed" className="view-all">Lihat semua</Link></div>
          <div className="home-rail-scroll">{buildRailItems(donghuaCompleted, 'Completed', true)}</div>
        </section>
      )}

      {/* Schedule Summary */}
      {days.length > 0 && (
        <section className="section">
          <div className="section-header"><h2 className="section-title">📅 Jadwal Tayang</h2><Link to="/schedule" className="view-all">Buka jadwal</Link></div>
          <div className="schedule-summary">
            <table>
              <thead><tr><th>Hari</th><th>Total</th><th>Aksi</th></tr></thead>
              <tbody>
                {days.sort((a, b) => {
                  const ai = DAY_ORDER.indexOf(a.day || '');
                  const bi = DAY_ORDER.indexOf(b.day || '');
                  return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
                }).map((row) => {
                  const count = (row.anime_list ?? row.animeList ?? []).length;
                  return <tr key={row.day}><td>{row.day}</td><td>{count} anime</td><td><Link to="/schedule" className="schedule-buka">Buka</Link></td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Top Donatur Leaderboard */}
      {topDonors.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">💜 Top Donatur</h2>
            <a href="https://trakteer.id/aldirahmanhh" target="_blank" rel="noopener noreferrer" className="view-all">Donasi juga →</a>
          </div>
          <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {topDonors.slice(0, 5).map((donor, idx) => (
              <div key={donor.order_id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: idx < 4 ? '1px solid var(--color-border)' : 'none' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--color-text-muted)', minWidth: '28px' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{donor.creator_name || 'Anonim'}</div>
                  {donor.support_message && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{donor.support_message}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>{donor.quantity}x {donor.unit_name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>Rp {(donor.amount || 0).toLocaleString('id-ID')}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;
