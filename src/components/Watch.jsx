import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { animeAPI } from '../services/api';
import { addToWatchHistory, updateWatchProgress, getWatchProgress } from '../utils/watchHistory';

const Watch = () => {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [episodeData, setEpisodeData] = useState(null);
  const [animeData, setAnimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState('480p');
  const [selectedServer, setSelectedServer] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const videoRef = useRef(null);
  const progressInterval = useRef(null);

  // Save video progress periodically
  const saveProgress = useCallback(() => {
    const video = videoRef.current;
    if (video && video.currentTime > 5 && episodeId) {
      updateWatchProgress(episodeId, video.currentTime, video.duration);
    }
  }, [episodeId]);

  // Restore video progress
  const restoreProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !episodeId) return;
    const saved = getWatchProgress(episodeId);
    if (saved > 5) {
      video.currentTime = saved;
    }
  }, [episodeId]);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const stateProvider = location.state?.provider;
        const allProviders = [
          { fn: () => animeAPI.getDonghuaEpisode(episodeId), name: 'donghua' },
          { fn: () => animeAPI.getEpisodeDetail(episodeId), name: 'otakudesu' },
          { fn: () => animeAPI.getEpisodeDetailSamehadaku(episodeId), name: 'samehadaku' },
          { fn: () => animeAPI.getEpisodeDetailStream(episodeId), name: 'stream' },
        ];

        let providers;
        if (stateProvider) {
          const primary = allProviders.find(p => p.name === stateProvider);
          const rest = allProviders.filter(p => p.name !== stateProvider);
          providers = primary ? [primary, ...rest] : rest;
        } else {
          providers = allProviders;
        }

        let data = null;
        let usedProvider = null;
        let lastError = null;

        for (const p of providers) {
          try {
            const result = await p.fn();
            const hasValidData = result?.streaming?.servers ||
              result?.data?.defaultStreamingUrl ||
              result?.data?.servers ||
              result?.data?.server;
            if (hasValidData) {
              data = result;
              usedProvider = p.name;
              break;
            }
          } catch (e) {
            lastError = e;
            continue;
          }
        }

        if (!data) {
          throw new Error(lastError?.message || 'Episode tidak ditemukan di semua provider.');
        }

        // Handle donghua
        if (usedProvider === 'donghua' && data.streaming) {
          const donghuaData = {
            episode: data.episode,
            defaultStreamingUrl: data.streaming.main_url?.url || data.streaming.servers[0]?.url,
            server: { qualities: [{ title: 'Streaming', serverList: data.streaming.servers.map(s => ({ title: s.name, url: s.url })) }] },
            navigation: data.navigation,
            donghua_details: data.donghua_details,
          };
          setEpisodeData(donghuaData);
          setVideoUrl(donghuaData.defaultStreamingUrl);
          if (donghuaData.server.qualities.length > 0) {
            setSelectedQuality('Streaming');
            setSelectedServer(donghuaData.server.qualities[0].serverList[0]);
          }
          if (data.donghua_details) {
            addToWatchHistory({
              animeId: data.donghua_details.slug, episodeId,
              animeTitle: data.donghua_details.title, episodeTitle: data.episode,
              poster: data.donghua_details.poster, provider: 'donghua',
            });
          }
          setLoading(false);
          return;
        }

        // Handle anime
        const raw = data?.data || null;
        let normalized = raw;

        if (raw && !raw.server && Array.isArray(raw.servers)) {
          const qualityMap = new Map();
          raw.servers.forEach((s) => {
            const quality = s.quality || s.resolution || 'Default';
            if (!qualityMap.has(quality)) qualityMap.set(quality, []);
            qualityMap.get(quality).push({ ...s, title: s.name || s.server || s.title || 'Server' });
          });
          normalized = {
            ...raw,
            defaultStreamingUrl: raw.defaultStreamingUrl || raw.servers[0]?.url,
            server: {
              qualities: Array.from(qualityMap.entries()).map(([q, sl]) => ({ title: q, serverList: sl })),
            },
          };
        }

        setEpisodeData(normalized);
        if (normalized?.defaultStreamingUrl) setVideoUrl(normalized.defaultStreamingUrl);
        if (normalized?.server?.qualities?.length > 0) {
          const fq = normalized.server.qualities[0];
          setSelectedQuality(fq.title);
          if (fq.serverList?.length > 0) setSelectedServer(fq.serverList[0]);
        }

        // Fetch anime details
        if (normalized?.animeId) {
          try {
            const animeRes = await animeAPI.getAnimeDetail(normalized.animeId);
            setAnimeData(animeRes?.data || null);
            addToWatchHistory({
              animeId: animeRes?.data?.animeId || normalized.animeId, episodeId,
              animeTitle: animeRes?.data?.title || normalized.title || episodeId,
              episodeTitle: normalized.title || episodeId,
              poster: animeRes?.data?.poster || animeRes?.data?.poster_url || '',
              provider: usedProvider || 'otakudesu',
            });
          } catch {}
        }
      } catch (err) {
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchEpisodeData();
  }, [episodeId, location.state?.provider]);

  // Progress saving for <video> elements
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedData = () => restoreProgress();
    const onTimeUpdate = () => {
      // Save every 10 seconds
      if (!progressInterval.current) {
        progressInterval.current = setInterval(saveProgress, 10000);
      }
    };
    const onPause = () => saveProgress();
    const onEnded = () => saveProgress();

    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [videoUrl, saveProgress, restoreProgress]);

  // Anti-ads
  useEffect(() => {
    const adPatterns = ['doubleclick.net', 'googlesyndication.com', 'popads.net', 'popcash.net', 'adsterra.com', 'exoclick.com'];
    const isAdUrl = (href) => href && adPatterns.some(d => href.toLowerCase().includes(d));
    const blockPopups = (e) => {
      const link = e.target.closest('a[target="_blank"]');
      if (link && isAdUrl(link.href)) { e.preventDefault(); e.stopPropagation(); }
    };
    const origOpen = window.open;
    window.open = function(url) {
      if (url && isAdUrl(url)) return null;
      return origOpen.apply(this, arguments);
    };
    document.addEventListener('click', blockPopups, true);
    return () => { document.removeEventListener('click', blockPopups, true); window.open = origOpen; };
  }, []);

  const handleServerSelect = (server) => {
    if (server.href) {
      const serverId = server.serverId || server.href.split('/').pop();
      animeAPI.getStreamingServer(serverId).then((d) => {
        if (d?.data?.url) setVideoUrl(d.data.url);
      }).catch(() => {
        if (episodeData?.defaultStreamingUrl) setVideoUrl(episodeData.defaultStreamingUrl);
      });
    } else if (server.url) {
      setVideoUrl(server.url);
    }
    setSelectedServer(server);
  };

  const handleQualityChange = (quality) => {
    setSelectedQuality(quality);
    const servers = episodeData?.server?.qualities?.find(q => q.title === quality)?.serverList;
    if (servers?.length > 0) {
      const def = servers.find(s => s.title?.toLowerCase().includes('ondesu')) || servers[0];
      handleServerSelect(def);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('desustream') || url.includes('ondesu') || url.includes('/embed/') || url.includes('player') || url.includes('odvidhide')) return url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const vid = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${vid}`;
    }
    if (url.includes('drive.google.com')) {
      const fid = url.split('/d/')[1]?.split('/')[0];
      return `https://drive.google.com/file/d/${fid}/preview`;
    }
    if (url.match(/\.(mp4|webm|ogg|m3u8|mov)(\?|$)/i)) return null;
    return url;
  };

  if (loading) {
    return (
      <div className="loading-container main-container">
        <div className="spinner" aria-hidden />
        <p>Memuat video...</p>
      </div>
    );
  }

  if (error || !episodeData) {
    const isNotFound = error?.includes('tidak ditemukan') || error?.includes('404');
    return (
      <div className="error-container main-container">
        <div className="error-icon">{isNotFound ? '🔍' : '⚠️'}</div>
        <h2>{isNotFound ? 'Episode Tidak Ditemukan' : 'Terjadi Kesalahan'}</h2>
        <p className="error-message">{error || 'Episode tidak ditemukan'}</p>
        <div className="error-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate(-1)}>← Kembali</button>
          <Link to="/" className="btn btn-secondary">Ke Beranda</Link>
        </div>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(videoUrl);
  const backAnimeId = animeData?.slug ?? animeData?.animeId ?? animeData?.id ?? episodeData?.animeId ?? episodeData?.animeSlug;
  const hasValidBackLink = backAnimeId != null && String(backAnimeId).trim() !== '';

  return (
    <div className="watch-page main-container">
      {/* Back link */}
      <div style={{ marginBottom: '12px' }}>
        {hasValidBackLink ? (
          <Link to={`/anime/${backAnimeId}`} className="back-link">
            ← Kembali ke {(animeData?.title || 'Anime').substring(0, 40)}
          </Link>
        ) : (
          <button type="button" className="back-link" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600, fontSize: 'var(--text-sm)', padding: 0 }}>
            ← Kembali
          </button>
        )}
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: '16px' }}>{episodeData.title}</h1>

      {/* Video Player - Full width */}
      <div className="video-player-wrapper">
        {videoUrl ? (
          embedUrl === null ? (
            <video ref={videoRef} src={videoUrl} className="video-element" controls autoPlay preload="metadata" key={videoUrl} style={{ width: '100%', height: '100%' }}>
              <track kind="captions" />
            </video>
          ) : embedUrl ? (
            <iframe src={embedUrl} className="video-iframe" sandbox="allow-scripts allow-same-origin allow-forms allow-presentation" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={episodeData.title} style={{ width: '100%', height: '100%', border: 'none' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Buka Video →</a>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="spinner" />
          </div>
        )}
      </div>

      {/* Quality & Server selector */}
      <div className="server-selector">
        {episodeData?.server?.qualities?.length > 0 && (
          <div className="quality-tabs">
            {episodeData.server.qualities.map((q) => (
              <button key={q.title} type="button" className={`quality-tab ${selectedQuality === q.title ? 'active' : ''}`} onClick={() => handleQualityChange(q.title)}>
                {q.title}
              </button>
            ))}
          </div>
        )}
        <div className="server-list">
          {episodeData?.server?.qualities?.find(q => q.title === selectedQuality)?.serverList?.map((server) => (
            <button key={server.serverId || server.title} type="button" className={`server-btn ${selectedServer?.title === server.title ? 'active' : ''}`} onClick={() => handleServerSelect(server)}>
              {server.title}
            </button>
          ))}
        </div>
      </div>

      {/* Episode Navigation */}
      <div className="episode-navigation">
        {episodeData?.navigation?.previous_episode && (
          <Link to={`/watch/${episodeData.navigation.previous_episode.slug}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>← Eps Sebelumnya</Link>
        )}
        {episodeData?.hasPrevEpisode && !episodeData?.navigation && (
          <Link to={`/watch/${episodeData.prevEpisode.episodeId || episodeId}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>← Eps Sebelumnya</Link>
        )}
        {episodeData?.navigation?.next_episode && (
          <Link to={`/watch/${episodeData.navigation.next_episode.slug}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>Eps Berikutnya →</Link>
        )}
        {episodeData?.hasNextEpisode && !episodeData?.navigation && (
          <Link to={`/watch/${episodeData.nextEpisode.episodeId || episodeId}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>Eps Berikutnya →</Link>
        )}
      </div>

      {/* Anime Info Card */}
      {animeData && (
        <div className="detail-header" style={{ marginTop: '20px' }}>
          <div className="detail-poster" style={{ width: '140px' }}>
            <img src={animeData.poster || animeData.poster_url} alt={animeData.title} />
          </div>
          <div className="detail-info">
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: '8px' }}>{animeData.title}</h2>
            <div className="detail-meta">
              {animeData.type && <span className="detail-meta-item">📺 {animeData.type}</span>}
              {animeData.episodes != null && <span className="detail-meta-item">🎬 {animeData.episodes} Episode</span>}
              {animeData.status && <span className="detail-meta-item">📊 {animeData.status}</span>}
              {animeData.duration && <span className="detail-meta-item">⏱️ {animeData.duration}</span>}
            </div>
            {animeData.genreList?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                {animeData.genreList.map((g) => (
                  <span key={g.title} className="detail-meta-item" style={{ fontSize: '0.65rem' }}>{g.title}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Watch;
