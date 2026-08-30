export const RECENT_SEARCHES_STORAGE_KEY = "hasaad_recent_searches";
export const MAX_RECENT_SEARCHES = 5;

export function mergeRecentSearches(existingSearches: string[], rawQuery: string, maxItems = MAX_RECENT_SEARCHES) {
  const query = rawQuery.trim();
  if (!query) return existingSearches.slice(0, maxItems);
  return [query, ...existingSearches.filter((item) => item.toLocaleLowerCase("ar-SA") !== query.toLocaleLowerCase("ar-SA"))].slice(0, maxItems);
}

export function getRecentSearches() {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearches(searches: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES)));
}
