const STORAGE_KEY = 'funknime_watch_history';
const MAX_ITEMS = 100;

export const getWatchHistory = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addToWatchHistory = (item) => {
  if (typeof window === 'undefined' || !item) return;
  try {
    const history = getWatchHistory();
    const filtered = history.filter(
      (h) => !(h.animeId === item.animeId && h.episodeId === item.episodeId)
    );
    filtered.unshift({
      ...item,
      timestamp: Date.now(),
    });
    const trimmed = filtered.slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
};

/**
 * Update the watch progress (current time in seconds) for an episode
 */
export const updateWatchProgress = (episodeId, currentTime, duration) => {
  if (typeof window === 'undefined' || !episodeId) return;
  try {
    const history = getWatchHistory();
    const idx = history.findIndex((h) => h.episodeId === episodeId);
    if (idx >= 0) {
      history[idx].currentTime = Math.floor(currentTime);
      history[idx].duration = Math.floor(duration || 0);
      history[idx].lastWatched = Date.now();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  } catch {
    // ignore
  }
};

/**
 * Get saved progress for an episode (returns seconds or 0)
 */
export const getWatchProgress = (episodeId) => {
  if (typeof window === 'undefined' || !episodeId) return 0;
  try {
    const history = getWatchHistory();
    const item = history.find((h) => h.episodeId === episodeId);
    return item?.currentTime || 0;
  } catch {
    return 0;
  }
};

/**
 * Format seconds to mm:ss or hh:mm:ss
 */
export const formatTime = (seconds) => {
  if (!seconds || seconds <= 0) return null;
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export const clearWatchHistory = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};
