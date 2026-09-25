const STORAGE_KEY = 'minisearch_recent';

export const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const addRecentSearch = (query) => {
  const recent = getRecentSearches().filter((q) => q !== query);
  recent.unshift(query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, 10)));
};

export const clearRecentSearches = () => {
  localStorage.removeItem(STORAGE_KEY);
};
