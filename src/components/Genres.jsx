import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import AnimeCard from './AnimeCard';
import ErrorPage from './ErrorPage';
import './Genres.css';

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [animeByGenre, setAnimeByGenre] = useState([]);
  const [genreLoading, setGenreLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [otak, same] = await Promise.all([
          animeAPI.getGenres('otakudesu'),
          animeAPI.getGenres('samehadaku').catch(() => null),
        ]);
        if (cancelled) return;

        const normalizeList = (data, provider) => {
          const raw = data?.data?.genreList ?? data?.genreList ?? (Array.isArray(data) ? data : []);
          if (!Array.isArray(raw)) return [];
          return raw.map((g) => ({
            ...g,
            title: g.title || g.name || '',
            provider,
            providers: [provider],
          }));
        };

        const otakList = normalizeList(otak, 'otakudesu');
        const sameList = same ? normalizeList(same, 'samehadaku') : [];

        const map = new Map();
        const normKey = (name) => (name || '').toString().toLowerCase().trim();

        [...otakList, ...sameList].forEach((g) => {
          const key = normKey(g.title);
          const existing = map.get(key);
          if (existing) {
            const providers = Array.from(new Set([...(existing.providers || []), ...(g.providers || [])]));
            map.set(key, {
              ...existing, ...g, providers,
              otakSlug: existing.otakSlug || (g.provider === 'otakudesu' ? g.genreId : null),
              sameId: existing.sameId || (g.provider === 'samehadaku' ? g.genreId : null),
            });
          } else {
            map.set(key, {
              ...g, providers: g.providers,
              otakSlug: g.provider === 'otakudesu' ? g.genreId : null,
              sameId: g.provider === 'samehadaku' ? g.genreId : null,
            });
          }
        });

        setGenres(Array.from(map.values()).sort((a, b) => (a.title || '').localeCompare(b.title || '')));
      } catch (err) {
        if (!cancelled) setError(String(err?.message || err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleGenreClick = async (genre) => {
    setSelectedGenre(genre);
    setGenreLoading(true);
    setAnimeByGenre([]);
    try {
      const results = [];
      if (genre.otakSlug) {
        try {
          const res = await animeAPI.getAnimeByGenre(genre.otakSlug, 'otakudesu');
          const list = res?.data?.animeList ?? res?.animeList ?? [];
          list.forEach((a) => results.push({ ...a, provider: 'otakudesu', providers: ['otakudesu'] }));
        } catch {}
      }
      if (genre.sameId) {
        try {
          const res = await animeAPI.getAnimeByGenre(genre.sameId, 'samehadaku');
          const list = res?.data?.animeList ?? res?.animeList ?? [];
          list.forEach((a) => results.push({ ...a, provider: 'samehadaku', providers: ['samehadaku'] }));
        } catch {}
      }

      const normKey = (item) => (item.title || item.name || '').toString().toLowerCase().replace(/\s+/g, '').trim();
      const map = new Map();
      results.forEach((item) => {
        const key = normKey(item);
        const existing = map.get(key);
        if (existing) {
          const providers = Array.from(new Set([...(existing.providers || []), ...(item.providers || [])]));
          map.set(key, { ...existing, ...item, providers, provider: providers.includes('otakudesu') ? 'otakudesu' : providers[0] });
        } else {
          map.set(key, item);
        }
      });
      setAnimeByGenre(Array.from(map.values()));
    } catch {
      setAnimeByGenre([]);
    } finally {
      setGenreLoading(false);
    }
  };

  if (error && !loading) {
    return (
      <div className="main-container">
        <ErrorPage title="Jelajahi Genre" message={`Gagal memuat genre: ${error}`} hint="Coba lagi nanti." onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="genres-page main-container">
      <header className="page-header">
        <h1 className="main-title text-gradient">Jelajahi Genre</h1>
        <p className="subtitle">Temukan anime berdasarkan genre favorit</p>
      </header>

      {loading ? (
        <div className="loading-container"><div className="spinner" /><p>Memuat genre...</p></div>
      ) : (
        <>
          <div className="genres-grid">
            {genres.map((genre, idx) => (
              <button
                key={idx}
                type="button"
                className={`genre-card ${selectedGenre === genre ? 'active' : ''}`}
                onClick={() => handleGenreClick(genre)}
                style={selectedGenre === genre ? { borderColor: 'var(--color-primary)', background: 'rgba(255,62,154,0.08)' } : {}}
              >
                <span>{genre.title || genre.name}</span>
              </button>
            ))}
          </div>

          {selectedGenre && (
            <section style={{ marginTop: 'var(--space-8)' }}>
              <div className="section-header">
                <h2 className="section-title">{selectedGenre.title}</h2>
                <button type="button" className="btn btn-secondary" onClick={() => { setSelectedGenre(null); setAnimeByGenre([]); }} style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}>
                  ✕ Hapus
                </button>
              </div>

              {genreLoading ? (
                <div className="loading-container"><div className="spinner" /><p>Memuat anime...</p></div>
              ) : animeByGenre.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px 0' }}>Tidak ada anime di genre ini.</p>
              ) : (
                <div className="anime-grid">
                  {animeByGenre.map((anime, idx) => (
                    <AnimeCard
                      key={anime.animeId ?? anime.slug ?? idx}
                      anime={anime}
                      index={idx}
                      providerHint={
                        anime.providers?.length > 1
                          ? 'Otakudesu & Samehadaku'
                          : (anime.provider === 'samehadaku' ? 'Samehadaku' : 'Otakudesu')
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Genres;
