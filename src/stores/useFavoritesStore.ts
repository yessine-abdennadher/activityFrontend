import { useSyncExternalStore } from 'react';

let favorites = new Set<string>(['act-1']);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return favorites;
}

function toggleFavorite(id: string) {
  const next = new Set(favorites);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  favorites = next;
  listeners.forEach(listener => listener());
}

export function useFavoritesStore() {
  const currentFavorites = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    favorites: currentFavorites,
    toggleFavorite,
  };
}
