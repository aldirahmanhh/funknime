import { Link } from 'react-router-dom';

/**
 * Normalizes anime item from different API responses (otakudesu, anoboy, etc.)
 * status from API: "Ongoing" | "Completed" or similar
 */
const normalizeAnime = (anime, index = 0) => {
  const animeId = anime.animeId ?? anime.slug ?? anime.id;
  const title = anime.title ?? anime.name ?? `Anime ${index + 1}`;
  const posterUrl = anime.poster ?? anime.poster_url ?? anime.cover_image ?? anime.thumbnail
    ?? `https://via.placeholder.com/200x280/2e2e2e/6366f1?text=${encodeURIComponent(title)}`;
  const episodes = anime.episodes ?? anime.episodeCount ?? anime.episode_count ?? 0;
  const score = anime.score ?? anime.rating ?? null;
  const releaseDay = anime.releaseDay ?? anime.schedule ?? anime.latestReleaseDate ?? '';
  const rawStatus = (anime.status ?? anime.statusAnime ?? '').toString().trim().toLowerCase();
  const isCompleted = rawStatus === 'completed' || rawStatus === 'selesai' || rawStatus === 'tamat';

  const rawProvider = anime.provider ?? anime.source ?? anime.site ?? null;

  let providerLabel = null;
  if (typeof rawProvider === 'string' && rawProvider.trim() !== '') {
    const p = rawProvider.trim().toLowerCase();
    if (p.includes('samehadaku')) providerLabel = 'Samehadaku';
    else if (p.includes('stream')) providerLabel = 'Stream';
    else if (p.includes('otakudesu') || p === 'default') providerLabel = 'Otakudesu';
    else providerLabel = rawProvider;
  }

  return {
    animeId,
    title,
    posterUrl,
    episodes,
    score,
    releaseDay,
    isCompleted,
    rawStatus,
    providerLabel,
  };
};

const AnimeCard = ({ anime, index = 0, innerRef, statusOverride, providerHint }) => {
  const normalized = normalizeAnime(anime, index);
  const {
    animeId,
    title,
    posterUrl,
    episodes,
    score,
    releaseDay,
    isCompleted,
    rawStatus,
    providerLabel,
  } = normalized;
  const useOverride = statusOverride && (statusOverride.toLowerCase() === 'ongoing' || statusOverride.toLowerCase() === 'completed');
  const isCompletedBadge = useOverride ? statusOverride.toLowerCase() === 'completed' : isCompleted;
  const showBadge = useOverride || rawStatus === 'ongoing' || (normalized.isCompleted === true);

   const finalProvider = providerHint || providerLabel || null;
   const providerKey = typeof anime.provider === 'string' && anime.provider.trim()
     ? anime.provider.trim().toLowerCase()
     : null;
   const detailPath = providerKey ? `/anime/${providerKey}/${animeId}` : `/anime/${animeId}`;

   // Provider-specific colors
   const getProviderColor = (provider) => {
     if (!provider) return 'var(--color-primary)';
     const p = provider.toLowerCase();
     if (p.includes('otakudesu')) return '#FFD700'; // Gold/Yellow
     if (p.includes('samehadaku')) return '#00D4FF'; // Cyan
     if (p.includes('stream')) return '#FF1493'; // Hot Pink
     return 'var(--color-primary)';
   };

   const providerColor = getProviderColor(finalProvider);

  return (
    <Link
      ref={innerRef}
      to={detailPath}
      className="anime-card card"
      title={title}
    >
      <div className="card-image-wrapper">
        {showBadge && (
          <span className={`anime-card-badge anime-card-badge--${isCompletedBadge ? 'completed' : 'ongoing'}`}>
            {isCompletedBadge ? 'Completed' : 'Ongoing'}
          </span>
        )}
        <img
          src={posterUrl}
          alt={title}
          className="poster"
          loading="lazy"
        />
        <div className="card-overlay">
          <span className="play-icon" aria-hidden>▶</span>
        </div>
      </div>
      <div className="anime-info">
        <h3>{title}</h3>
        <div className="meta">
          {episodes > 0 && (
            <span className="episode-count">📺 {episodes} eps</span>
          )}
          {score && (
            <span className="score">⭐ {score}</span>
          )}
          {releaseDay && (
            <span className="release-day">🗓️ {releaseDay}</span>
          )}
        </div>
         {finalProvider && (
           <div className="meta provider-meta">
             <span 
               className="provider-chip" 
               style={{ 
                 '--provider-color': providerColor,
                 backgroundColor: providerColor,
                 color: '#000'
               }}
             >
               {finalProvider}
             </span>
           </div>
         )}
      </div>
    </Link>
  );
};

export default AnimeCard;
export { normalizeAnime };
