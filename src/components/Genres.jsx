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
              ...existing,
              ...g,
              providers,
              otakSlug: existing.otakSlug || (g.provider === 'otakudesu' ? g.genreId : null),
              sameId: existing.sameId || (g.provider === 'samehadaku' ? g.genreId : null),
            });
          } else {
            map.set(key, {
              ...g,
              providers: g.providers,
              otakSlug: g.provider === 'otakudesu' ? g.genreId : null,
              sameId: g.provider === 'samehadaku' ? g.genreId : null,
            });
          }
        });

        const merged = Array.from(map.values()).sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        setGenres(merged);
      } catch (err) {
        if (cancelled) return;
        const msg = (err?.message ?? (typeof err?.toString === 'function' ? err.toString() : String(err))) || 'Gagal memuat genre';
        setError(String(msg));
        console.error('Genres fetch error:', err);
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

      const normKey = (item) =>
        (item.title || item.name || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
      const map = new Map();
      results.forEach((item) => {
        const key = normKey(item);
        const existing = map.get(key);
        if (existing) {
          const providers = Array.from(new Set([...(existing.providers || []), ...(item.providers || [])]));
          map.set(key, {
            ...existing,
            ...item,
            providers,
            provider: providers.includes('otakudesu') ? 'otakudesu' : providers[0],
          });
        } else {
          map.set(key, item);
        }
      });

      setAnimeByGenre(Array.from(map.values()));
    } catch (err) {
      console.error('Genre anime fetch error:', err);
      setAnimeByGenre([]);
    } finally {
      setGenreLoading(false);
    }
  };

  const GenreCard = ({ genre }) => {
    const genreName = genre.title || genre.name || genre;
    const hasOtak = genre.providers?.includes('otakudesu');
    const hasSame = genre.providers?.includes('samehadaku');
    
    return (
      <div 
        className={`genre-card ${selectedGenre === genre ? 'active' : ''}`}
        onClick={() => handleGenreClick(genre)}
      >
        <span className="genre-name">{genreName}</span>
        <div className="genre-providers">
          {hasOtak && <span className="az-provider-pill az-provider-pill--otakudesu">Otakudesu</span>}
          {hasSame && <span className="az-provider-pill az-provider-pill--samehadaku">Samehadaku</span>}
        </div>
      </div>
    );
  };

  if (error != null && error !== '' && !loading) {
    return (
      <div className="main-container">
        <ErrorPage
          title="Jelajahi Genre"
          message={`Gagal memuat genre: ${error}`}
          hint="Server mungkin sedang bermasalah (mis. error 500). Coba lagi nanti."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="genres-page main-container">
      <header className="page-header genres-header genres-hero section section-neo">
        <h1 className="main-title text-gradient">Jelajahi Genre</h1>
        <p className="subtitle">Temukan anime berdasarkan genre favorit</p>
      </header>

      {loading ? (
        <div className="genres-loading loading-container">
          <div className="spinner" aria-hidden />
          <p>Memuat genre...</p>
        </div>
      ) : (
        <>
          <section className="genre-section section section-neo">
            <h2 className="genre-section-label section-title-neo">Pilih Genre</h2>
            <div className="genre-grid">
              {Array.isArray(genres) ? genres.map((genre, idx) => (
                <GenreCard key={idx} genre={genre} />
              )) : typeof genres === 'object' && (
                <div className="genre-list">
                  {Object.entries(genres).map(([key, value]) => (
                    <GenreCard key={key} genre={{ id: key, title: value }} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {selectedGenre && (
            <section className="genre-anime-section section section-neo">
              <div className="section-header section-header-neo">
                <h2 className="section-title section-title-neo">{selectedGenre.title || selectedGenre.name || selectedGenre}</h2>
                <button
                  type="button"
                  className="clear-genre-btn btn btn-secondary"
                  onClick={() => {
                    setSelectedGenre(null);
                    setAnimeByGenre([]);
                  }}
                >
                  Hapus Pilihan
                </button>
              </div>

              {genreLoading ? (
                <div className="loading-more">
                  <div className="spinner" aria-hidden />
                  <p>Memuat anime...</p>
                </div>
              ) : animeByGenre.length === 0 ? (
                <p className="no-data">Tidak ada anime di genre ini.</p>
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