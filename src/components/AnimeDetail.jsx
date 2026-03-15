import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { animeAPI, APIError } from '../services/api';

const PROVIDER_ORDER = ['otakudesu', 'samehadaku', 'stream'];

const AnimeDetail = () => {
  const { animeId, provider: providerParam } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [batchUrl, setBatchUrl] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [providerUsed, setProviderUsed] = useState(null);

  useEffect(() => {
    const fetchAnimeData = async () => {
      setLoading(true);
      setError(null);
      setAnime(null);

      const initialProvider = (providerParam || 'otakudesu').toLowerCase();
      const startIndex = PROVIDER_ORDER.indexOf(initialProvider);
      const orderedProviders =
        startIndex >= 0
          ? [...PROVIDER_ORDER.slice(startIndex), ...PROVIDER_ORDER.slice(0, startIndex)]
          : PROVIDER_ORDER;

      const fetchByProvider = async (prov, id) => {
        if (prov === 'samehadaku') {
          return animeAPI.getAnimeDetailSamehadaku(id);
        }
        if (prov === 'stream') {
          return animeAPI.getAnimeDetailStream(id);
        }
        // default otakudesu
        return animeAPI.getAnimeDetail(id);
      };

      let found = false;

      try {
        for (const prov of orderedProviders) {
          try {
            const data = await fetchByProvider(prov, animeId);
            const payload = data?.data || null;
            if (payload) {
              setAnime({ ...payload, __provider: prov });
              setProviderUsed(prov);
              found = true;
              break;
            }
          } catch (err) {
            if (err instanceof APIError && err.statusCode === 404) {
              // Coba provider berikutnya
              continue;
            }
            setError(err?.message ?? String(err));
            break;
          }
        }

        if (!found && !error) {
          // Tidak ada provider yang punya data → state not found
          setAnime(null);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnimeData();
  }, [animeId, providerParam]);

  useEffect(() => {
    const extractBatchUrl = (res) => {
      if (!res) return null;
      const d = res?.data;
      if (typeof d?.url === 'string') return d.url;
      if (typeof d?.batchUrl === 'string') return d.batchUrl;
      if (typeof d?.downloadUrl === 'string') return d.downloadUrl;
      const list = d?.batchList ?? d?.list;
      if (Array.isArray(list) && list[0]?.url) return list[0].url;
      if (typeof res?.url === 'string') return res.url;
      return null;
    };

    // Batch khusus otakudesu; provider lain biasanya punya struktur berbeda
    if ((providerUsed || (providerParam || 'otakudesu').toLowerCase()) !== 'otakudesu') {
      return;
    }

    if (anime?.batch && typeof anime.batch === 'string') {
      setBatchUrl(anime.batch);
      return;
    }
    const slugOrId = anime?.slug ?? anime?.animeId ?? animeId;
    if (!slugOrId) return;

    setBatchLoading(true);
    animeAPI
      .getBatch(slugOrId)
      .then((res) => {
        const url = extractBatchUrl(res);
        if (url) setBatchUrl(url);
      })
      .catch(() => {})
      .finally(() => setBatchLoading(false));
  }, [anime?.slug, anime?.animeId, anime?.batch, animeId]);

  if (loading) {
    return (
      <div className="loading-container main-container">
        <div className="spinner" aria-hidden />
        <p>Memuat detail anime...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Gagal memuat detail anime: {error}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Coba Lagi</button>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: 8 }}>Kembali ke Beranda</Link>
      </div>
    );
  }
  if (!anime) {
    return (
      <div className="not-found main-container">
        <h2>Anime tidak ditemukan</h2>
        <Link to="/" className="btn btn-primary">← Kembali ke Beranda</Link>
      </div>
    );
  }

  const batchLink = anime?.batch || batchUrl;
  const hasBatch = !!batchLink;
  const providerLabel = (() => {
    const p = (providerUsed || providerParam || 'otakudesu').toLowerCase();
    if (p === 'samehadaku') return 'Samehadaku';
    if (p === 'stream') return 'Stream';
    return 'Otakudesu';
  })();

  const episodeList = anime.episodeList ?? [];
  const getEpisodeNum = (ep) => ep.eps ?? ep.episodeNumber ?? ep.number ?? 9999;
  const firstEpisode = episodeList.length > 0
    ? episodeList.slice().sort((a, b) => getEpisodeNum(a) - getEpisodeNum(b))[0]
    : null;
  const firstEpisodeId = firstEpisode?.episodeId ?? episodeList[episodeList.length - 1]?.episodeId ?? episodeList[0]?.episodeId;

  return (
    <div className="anime-detail main-container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Beranda</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{anime.title}</span>
      </nav>

      <section className="section section-neo">
        <div className="anime-header">
          <img
            src={anime.poster ?? anime.poster_url ?? ''}
            alt={anime.title ?? 'Poster'}
            className="poster"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x300/2e2e2e/6366f1?text=Poster';
            }}
          />
          <div className="anime-info">
            <h1>{anime.title}</h1>
            <p className="subtitle">Sumber: {providerLabel}</p>
            <div className="info-grid">
              {anime.type && <div className="info-item"><strong>Tipe:</strong> {anime.type}</div>}
              {anime.episodes != null && <div className="info-item"><strong>Episode:</strong> {anime.episodes}</div>}
              {anime.status && <div className="info-item"><strong>Status:</strong> {anime.status}</div>}
              {anime.duration && <div className="info-item"><strong>Durasi:</strong> {anime.duration}</div>}
              {anime.studios && <div className="info-item"><strong>Studio:</strong> {anime.studios}</div>}
              {anime.producers && <div className="info-item"><strong>Produser:</strong> {anime.producers}</div>}
              {anime.aired && <div className="info-item"><strong>Tayang:</strong> {anime.aired}</div>}
            </div>

            {anime.genreList && anime.genreList.length > 0 && (
              <div className="genres">
                <h3>Genre:</h3>
                {anime.genreList.map((genre, idx) => (
                  <Link
                    key={idx}
                    to={`/genres?genre=${genre.genreId}`}
                    className="genre-tag"
                  >
                    {genre.title}
                  </Link>
                ))}
              </div>
            )}

            <div className="actions">
              {firstEpisodeId && (
                <Link to={`/watch/${firstEpisodeId}`} className="play-btn btn btn-primary">
                  <span className="icon" aria-hidden>▶</span> Putar Episode Pertama
                </Link>
              )}
              {(hasBatch || batchLoading) && (
                hasBatch ? (
                  <a href={batchLink} className="download-btn btn btn-secondary" target="_blank" rel="noopener noreferrer">
                    <span className="icon" aria-hidden>⬇</span> Download Batch
                  </a>
                ) : (
                  <span className="download-btn btn btn-secondary download-btn-loading" aria-busy="true">
                    <span className="icon" aria-hidden>⬇</span> Memuat link batch...
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-neo anime-content">
        <section className="synopsis">
          <h2>Sinopsis</h2>
          {anime.synopsis?.paragraphs?.length > 0 ? (
            anime.synopsis.paragraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))
          ) : (
            <p>Sinopsis tidak tersedia.</p>
          )}
        </section>

        <section className="episodes-section">
          <h2>Daftar Episode ({anime.episodeList?.length || 0})</h2>
          <div className="episodes-grid">
            {anime.episodeList?.map((episode, idx) => (
              <div key={episode.episodeId ?? idx} className="episode-card">
                <div className="episode-info">
                  <span className="episode-number">Episode {episode.eps ?? idx + 1}</span>
                  {episode.date && <span className="episode-date">{episode.date}</span>}
                </div>
                <div className="episode-actions">
                  <Link to={`/watch/${episode.episodeId}`} className="watch-btn btn btn-secondary">
                    Nonton
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {selectedEpisode && (
        <div className="video-modal" role="dialog" aria-modal="true" aria-label="Video player">
          <div className="modal-content">
            <h3>{selectedEpisode.title}</h3>
            <div className="video-container">
              <iframe
                src={selectedEpisode.defaultStreamingUrl}
                allowFullScreen
                title={selectedEpisode.title}
              />
            </div>
            <button type="button" className="modal-close" onClick={() => setSelectedEpisode(null)} aria-label="Tutup">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeDetail;
