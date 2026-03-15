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

export const clearWatchHistory = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};

