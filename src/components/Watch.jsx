import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { animeAPI } from '../services/api';
import { addToWatchHistory } from '../utils/watchHistory';

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
  const [showServerMenu, setShowServerMenu] = useState(false);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build provider list based on navigation context
        const stateProvider = location.state?.provider;
        
        const allProviders = [
          { fn: () => animeAPI.getDonghuaEpisode(episodeId), name: 'donghua' },
          { fn: () => animeAPI.getEpisodeDetail(episodeId), name: 'otakudesu' },
          { fn: () => animeAPI.getEpisodeDetailSamehadaku(episodeId), name: 'samehadaku' },
          { fn: () => animeAPI.getEpisodeDetailStream(episodeId), name: 'stream' },
        ];
        
        // If provider is known, try it first then fallback to others
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
            console.log(`[Watch] Trying provider: ${p.name}`);
            const result = await p.fn();
            
            // Check if result has valid data
            const hasValidData = result?.streaming?.servers || 
                                result?.data?.defaultStreamingUrl || 
                                result?.data?.servers || 
                                result?.data?.server;
            
            if (hasValidData) {
              data = result;
              usedProvider = p.name;
              console.log(`[Watch] Success with provider: ${p.name}`);
              break;
            } else {
              console.log(`[Watch] Provider ${p.name} returned empty data`);
            }
          } catch (e) {
            console.log(`[Watch] Provider ${p.name} failed:`, e.message);
            lastError = e;
            // Try next provider
            continue;
          }
        }
        
        if (!data) {
          throw new Error(lastError?.message || 'Episode tidak ditemukan di semua provider. Mungkin episode ini belum tersedia atau sudah dihapus.');
        }
        
        // Handle donghua response structure
        if (usedProvider === 'donghua' && data.streaming) {
          const donghuaData = {
            episode: data.episode,
            defaultStreamingUrl: data.streaming.main_url?.url || data.streaming.servers[0]?.url,
            server: {
              qualities: [{
                title: 'Streaming',
                serverList: data.streaming.servers.map(s => ({
                  title: s.name,
                  url: s.url,
                })),
              }],
            },
            navigation: data.navigation,
            donghua_details: data.donghua_details,
            episodes_list: data.episodes_list,
          };
          
          setEpisodeData(donghuaData);
          setVideoUrl(donghuaData.defaultStreamingUrl);
          
          if (donghuaData.server.qualities.length > 0) {
            setSelectedQuality('Streaming');
            setSelectedServer(donghuaData.server.qualities[0].serverList[0]);
          }
          
          // Save to watch history
          if (data.donghua_details) {
            addToWatchHistory({
              animeId: data.donghua_details.slug,
              episodeId,
              animeTitle: data.donghua_details.title,
              episodeTitle: data.episode,
              poster: data.donghua_details.poster,
              provider: 'donghua',
            });
          }
          
          setLoading(false);
          return;
        }

        // Handle anime response structure
        const raw = data?.data || null;

        // Normalize common shapes from different providers
        let normalized = raw;

        // Otakudesu-style: servers[] at root of data
        if (raw && !raw.server && Array.isArray(raw.servers)) {
          const firstServer = raw.servers[0] || {};
          
          // Group servers by quality if possible
          const qualityMap = new Map();
          raw.servers.forEach((s) => {
            const quality = s.quality || s.resolution || 'Default';
            if (!qualityMap.has(quality)) {
              qualityMap.set(quality, []);
            }
            qualityMap.get(quality).push({
              ...s,
              title: s.name || s.server || s.title || 'Server',
            });
          });
          
          const qualities = Array.from(qualityMap.entries()).map(([quality, serverList]) => ({
            title: quality,
            serverList,
          }));
          
          normalized = {
            ...raw,
            defaultStreamingUrl: raw.defaultStreamingUrl || firstServer.url,
            server: {
              qualities: qualities.length > 0 ? qualities : [
                {
                  title: 'Default',
                  serverList: raw.servers.map((s, idx) => ({
                    ...s,
                    title: s.name || s.server || `Server ${idx + 1}`,
                  })),
                },
              ],
            },
          };
        }

        setEpisodeData(normalized);

        // Set default streaming URL and quality
        if (normalized?.defaultStreamingUrl) {
          setVideoUrl(normalized.defaultStreamingUrl);
        }
        
        // Set initial quality based on available qualities
        if (normalized?.server?.qualities?.length > 0) {
          const firstQuality = normalized.server.qualities[0];
          setSelectedQuality(firstQuality.title);
          
          // Set first server of first quality as default
          if (firstQuality.serverList?.length > 0) {
            setSelectedServer(firstQuality.serverList[0]);
          }
        }

        // Also fetch anime details
        if (normalized?.animeId) {
          try {
            const animeRes = await animeAPI.getAnimeDetail(normalized.animeId);
            setAnimeData(animeRes?.data || null);

            // Simpan ke riwayat tonton (localStorage)
            addToWatchHistory({
              animeId: animeRes?.data?.animeId || normalized.animeId,
              episodeId,
              animeTitle: animeRes?.data?.title || normalized.title || episodeId,
              episodeTitle: normalized.title || episodeId,
              poster: animeRes?.data?.poster || animeRes?.data?.poster_url || '',
              provider: usedProvider || location.state?.provider || 'otakudesu',
            });
          } catch (e) {
            console.log('Could not load anime details');
          }
        }
      } catch (err) {
        console.error('[Watch] Fatal error:', err);
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchEpisodeData();
  }, [episodeId, location.state?.provider, location.state?.episodeIndex, location.state?.dramaTitle]);

  // Anti-ads script
  useEffect(() => {
    // Known ad domains and URL patterns
    const adPatterns = [
      'doubleclick.net', 'googlesyndication.com', 'adservice.google',
      'popads.net', 'popcash.net', 'propellerads.com', 'adsterra.com',
      'exoclick.com', 'juicyads.com', 'trafficjunky.com', 'clickadu.com',
      'hilltopads.net', 'ad-maven.com', 'adnium.com',
    ];

    const isAdUrl = (href) => {
      if (!href) return false;
      const lower = href.toLowerCase();
      return adPatterns.some(domain => lower.includes(domain));
    };

    // Block only ad popups — don't touch app navigation
    const blockPopups = (e) => {
      const link = e.target.closest('a[target="_blank"]');
      if (link && isAdUrl(link.href)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Block window.open hijacking from ad scripts
    const originalOpen = window.open;
    window.open = function(url) {
      if (url && isAdUrl(url)) {
        console.log('[Anti-ads] Blocked popup:', url);
        return null;
      }
      return originalOpen.apply(this, arguments);
    };

    // Remove ad elements from the page (not inside iframes)
    const removeAds = () => {
      const adSelectors = [
        '.ad-container', '.ads-container', '.advertisement',
        'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
        'iframe[src*="popads"]', 'iframe[src*="adsterra"]',
      ];
      
      adSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (el && el.parentNode && !el.classList.contains('video-iframe')) {
            el.remove();
          }
        });
      });
    };

    document.addEventListener('click', blockPopups, true);
    const adInterval = setInterval(removeAds, 2000);

    return () => {
      document.removeEventListener('click', blockPopups, true);
      clearInterval(adInterval);
      window.open = originalOpen;
    };
  }, []);

  const handleServerSelect = (server) => {
    console.log('Selected server:', server);
    // If server has an href, fetch it for streaming URL
    if (server.href) {
      const serverId = server.serverId || server.href.split('/').pop();
      console.log('Fetching server URL for ID:', serverId);
      fetchServerUrl(serverId);
    } else if (server.url) {
      console.log('Using direct server URL:', server.url);
      setVideoUrl(server.url);
    }
    setSelectedServer(server);
    setShowServerMenu(false);
  };

  const fetchServerUrl = async (serverId) => {
    try {
      const serverData = await animeAPI.getStreamingServer(serverId);
      if (serverData?.data?.url) {
        setVideoUrl(serverData.data.url);
      }
    } catch (err) {
      console.error('Failed to get server URL:', err);
      // Fallback to default URL from episode data
      if (episodeData?.defaultStreamingUrl) {
        setVideoUrl(episodeData.defaultStreamingUrl);
      }
    }
  };

  const handleQualityChange = (quality) => {
    console.log('[Watch] Quality changed to:', quality);
    setSelectedQuality(quality);
    
    // Find servers for this quality
    const qualityData = episodeData?.server?.qualities?.find(q => q.title === quality);
    const servers = qualityData?.serverList;
    
    if (servers && servers.length > 0) {
      console.log('[Watch] Available servers for quality:', servers);
      
      // Select first available server for this quality
      const defaultServer = servers.find(s => 
        s.title?.toLowerCase().includes('ondesu') || 
        s.title?.toLowerCase().includes('default')
      ) || servers[0];
      
      console.log('[Watch] Selected server:', defaultServer);
      handleServerSelect(defaultServer);
    } else {
      console.warn('[Watch] No servers found for quality:', quality);
    }
  };

  const handleSwitchServer = () => {
    const qualityData = episodeData?.server?.qualities?.find(q => q.title === selectedQuality);
    const servers = qualityData?.serverList;
    if (!servers || servers.length <= 1) return;

    const currentIdx = servers.findIndex(s => s.serverId === selectedServer?.serverId || s.title === selectedServer?.title);
    const nextIdx = (currentIdx + 1) % servers.length;
    handleServerSelect(servers[nextIdx]);
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';

    // Streaming service URLs that work as iframe embeds
    if (
      url.includes('desustream.info') ||
      url.includes('ondesu') ||
      url.includes('odvidhide.com') ||
      url.includes('/embed/') ||
      url.includes('player')
    ) {
      return url; // Use as iframe source directly
    }

    // YouTube -> embed conversion
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Google Drive -> embed conversion
    if (url.includes('drive.google.com')) {
      const fileId = url.split('/d/')[1]?.split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // Direct video files → use <video> tag
    if (url.match(/\.(mp4|webm|ogg|m3u8|mov)(\?|$)/i)) {
      return null; // Signal to use <video> element
    }

    // Unknown URL - return as-is (could be a direct link)
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
        <div className="error-icon" aria-hidden="true">
          {isNotFound ? '🔍' : '⚠️'}
        </div>
        <h2>{isNotFound ? 'Episode Tidak Ditemukan' : 'Terjadi Kesalahan'}</h2>
        <p className="error-message">
          {error || 'Episode tidak ditemukan'}
        </p>
        {isNotFound ? (
          <p className="error-hint">
            Episode ini mungkin belum tersedia, sudah dihapus, atau URL-nya salah.
            Coba cek daftar episode di halaman anime.
          </p>
        ) : null}
        <div className="error-actions">
          <>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
            >
              ← Kembali
            </button>
            <Link to="/" className="btn btn-secondary">
              Ke Beranda
            </Link>
          </>
        </div>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(videoUrl);

  const backAnimeId = animeData?.slug ?? animeData?.animeId ?? animeData?.id ?? episodeData?.animeId ?? episodeData?.animeSlug ?? episodeData?.slug;
  const hasValidBackLink = backAnimeId != null && String(backAnimeId).trim() !== '';
  const backPath = `/anime/${backAnimeId}`;
  const backTitle = animeData?.title ? (typeof animeData.title === 'string' ? animeData.title.substring(0, 40) : animeData.title) : 'Anime';

  return (
    <div className="watch-page main-container">
      <div className="video-header">
        <div className="anime-context">
          {hasValidBackLink ? (
            <Link to={backPath} className="back-link">
              ← Kembali ke {backTitle}
            </Link>
          ) : (
            <button type="button" className="back-link back-link-btn" onClick={() => navigate(-1)}>
              ← Kembali
            </button>
          )}
          <h1>{episodeData.title}</h1>
        </div>
      </div>

      <div className="video-container-wrapper">
        {videoUrl ? (
          <div className="video-wrapper">
            {embedUrl === null ? (
              // Direct video file (mp4, webm, etc.)
              <video
                src={videoUrl}
                className="video-element"
                controls
                autoPlay
                preload="metadata"
                key={videoUrl}
              >
                <track kind="captions" />
                Your browser does not support the video tag.
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">Download video</a>
              </video>
            ) : embedUrl ? (
              // Embeddable iframe URL
              <iframe
                src={embedUrl}
                className="video-iframe"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={episodeData.title}
                onError={(e) => {
                  console.error('Iframe failed to load:', embedUrl);
                  e.target.style.display = 'none';
                }}
              ></iframe>
            ) : (
              // Unknown URL type - show as download link
              <div className="video-unavailable">
                <p>This video cannot be embedded.</p>
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="watch-direct-link">
                  Open video in new tab →
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="no-video">
            <p>Video player is loading...</p>
          </div>
        )}
      </div>

      {episodeData?.server?.qualities?.find(q => q.title === selectedQuality)?.serverList?.length > 1 && (
        <div className="switch-server-hint">
          <button
            type="button"
            className="btn btn-switch-server"
            onClick={handleSwitchServer}
          >
            🔄 Ada Iklan? Ganti Server
          </button>
        </div>
      )}

      <div className="video-controls">
        <div className="server-quality-selector">
          <div className="quality-buttons">
            {episodeData?.server?.qualities?.map((q) => (
              <button
                type="button"
                key={q.title}
                className={`quality-btn ${selectedQuality === q.title ? 'active' : ''}`}
                onClick={() => handleQualityChange(q.title)}
              >
                {q.title}
              </button>
            ))}
          </div>

          <div className="server-dropdown-container">
            <button
              type="button"
              className="server-dropdown-btn"
              onClick={() => setShowServerMenu(!showServerMenu)}
              aria-expanded={showServerMenu}
              aria-haspopup="listbox"
            >
              Server: {selectedServer?.title || 'Auto'}
              <span className={`arrow ${showServerMenu ? 'up' : 'down'}`}>▼</span>
            </button>
            {showServerMenu && (
              <div className="server-menu">
                {episodeData?.server?.qualities
                  ?.find(q => q.title === selectedQuality)
                  ?.serverList?.map((server) => (
                    <button
                      type="button"
                      key={server.serverId || server.title}
                      className={`server-option ${selectedServer?.serverId === server.serverId ? 'active' : ''}`}
                      onClick={() => handleServerSelect(server)}
                    >
                      {server.title}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="video-navigation">
        {/* Donghua previous */}
        {episodeData?.navigation?.previous_episode && (
          <Link
            to={`/watch/${episodeData.navigation.previous_episode.slug}`}
            className="nav-btn prev btn btn-secondary"
          >
            ← Episode Sebelumnya
          </Link>
        )}
        
        {/* Anime previous */}
        {episodeData?.hasPrevEpisode && !episodeData?.navigation && (
          <Link
            to={`/watch/${episodeData.prevEpisode.episodeId || episodeId}`}
            className="nav-btn prev btn btn-secondary"
          >
            ← Episode Sebelumnya
          </Link>
        )}
        
        {/* Donghua next */}
        {episodeData?.navigation?.next_episode && (
          <Link
            to={`/watch/${episodeData.navigation.next_episode.slug}`}
            className="nav-btn next btn btn-primary"
          >
            Episode Berikutnya →
          </Link>
        )}
        
        {/* Anime next */}
        {episodeData?.hasNextEpisode && !episodeData?.navigation && (
          <Link
            to={`/watch/${episodeData.nextEpisode.episodeId || episodeId}`}
            className="nav-btn next btn btn-primary"
          >
            Episode Berikutnya →
          </Link>
        )}
      </div>

      <div className="video-info">
        {animeData && (
          <div className="anime-info-card">
            <div className="anime-info-header">
              <img src={animeData.poster} alt={animeData.title} className="info-poster" />
              <div className="anime-info-details">
                <h2>{animeData.title}</h2>
                <div className="info-grid">
                  {animeData.type && <div><strong>Tipe:</strong> {animeData.type}</div>}
                  {animeData.episodes != null && <div><strong>Episode:</strong> {animeData.episodes}</div>}
                  {animeData.status && <div><strong>Status:</strong> {animeData.status}</div>}
                  {animeData.duration && <div><strong>Durasi:</strong> {animeData.duration}</div>}
                </div>
                <div className="genres">
                  {animeData.genreList?.map((g) => (
                    <span key={g.title} className="genre-tag">{g.title}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;