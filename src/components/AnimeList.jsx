import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';
import { SkeletonAnimeGrid } from './Skeleton';
import AnimeCard from './AnimeCard';

const normalizeKey = (item) => {
  const raw = (item.title || item.name || '').toString().toLowerCase();
  return raw.replace(/\s+/g, ' ').trim();
};

const mergeAnimeLists = (list1, list2) => {
  const map = new Map();
  
  list1.forEach((a) => {
    const key = normalizeKey(a);
    map.set(key, { ...a, providers: ['otakudesu'], provider: 'otakudesu' });
  });
  
  list2.forEach((a) => {
    const key = normalizeKey(a);
    const existing = map.get(key);
    if (existing) {
      map.set(key, { ...existing, providers: ['otakudesu', 'samehadaku'] });
    } else {
      map.set(key, { ...a, providers: ['samehadaku'], provider: 'samehadaku' });
    }
  });
  
  return Array.from(map.values());
};

const AnimeList = () => {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        const [homeRes, sameRes] = await Promise.all([
          animeAPI.getHome().catch(() => ({ data: {} })),
          animeAPI.getListSamehadaku().catch(() => ({ data: { animeList: [] } })),
        ]);
        
        const otakList = [
          ...(homeRes?.data?.ongoing?.animeList || []),
          ...(homeRes?.data?.completed?.animeList || []),
        ];
        const sameList = sameRes?.data?.animeList || [];
        
        const merged = mergeAnimeLists(otakList, sameList);
        setAnimes(merged);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimeData();
  }, []);

  if (loading) return (
    <div className="anime-list-page">
      <header className="page-header">
        <h1>Anime List</h1>
        <p>Browse all available anime</p>
      </header>
      <SkeletonAnimeGrid count={12} />
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <p className="error-message">Failed to load anime: {error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="anime-list-page">
      <header className="page-header">
        <h1>Anime List</h1>
        <p>Browse all available anime from Otakudesu & Samehadaku</p>
      </header>
      <div className="anime-grid">
        {animes.map((anime, idx) => {
          const providers = anime.providers || [anime.provider];
          const hasOtak = providers.includes('otakudesu');
          const hasSame = providers.includes('samehadaku');
          const providerHint = hasOtak && hasSame ? 'Otakudesu & Samehadaku' : (hasSame ? 'Samehadaku' : 'Otakudesu');
          
          return (
            <AnimeCard
              key={anime.animeId ?? anime.slug ?? idx}
              anime={anime}
              index={idx}
              providerHint={providerHint}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AnimeList;