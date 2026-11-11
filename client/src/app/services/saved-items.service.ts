import { DestroyRef, Injectable, signal } from '@angular/core';
import { ResourceData } from '../data/resource-data';

export type ResourceCategory = 'artist' | 'album' | 'track';

export interface RecentSearch {
  query:string;
  category:ResourceCategory;
}

export interface Favorite {
  id:string;
  category:ResourceCategory;
  name:string;
}

@Injectable({ providedIn: 'root' })
export class SavedItemsService {
  private readonly historyKey = 'spotify-browser.recent-searches.v1';
  private readonly favoritesKey = 'spotify-browser.favorites.v1';
  private readonly historyState = signal<RecentSearch[]>(this.loadHistory());
  private readonly favoritesState = signal<Favorite[]>(this.loadFavorites());
  readonly recentSearches = this.historyState.asReadonly();
  readonly favorites = this.favoritesState.asReadonly();

  constructor(destroyRef:DestroyRef) {
    const sync = (event:StorageEvent) => {
      if (event.key === null || event.key === this.historyKey) {
        this.historyState.set(this.loadHistory());
      }
      if (event.key === null || event.key === this.favoritesKey) {
        this.favoritesState.set(this.loadFavorites());
      }
    };
    window.addEventListener('storage', sync);
    destroyRef.onDestroy(() => window.removeEventListener('storage', sync));
  }

  saveSearch(query:string, category:string) {
    query = query.trim();
    if (!query || !this.isCategory(category)) return;
    const history = this.historyState().filter((entry) =>
      entry.category !== category || entry.query.toLowerCase() !== query.toLowerCase());
    history.unshift({ query, category });
    this.historyState.set(history.slice(0, 10));
    this.write(this.historyKey, this.historyState());
  }

  clearHistory() {
    this.historyState.set([]);
    this.write(this.historyKey, []);
  }

  isFavorite(resource:Pick<ResourceData, 'id' | 'category'>):boolean {
    return this.favoritesState().some((item) =>
      item.id === resource.id && item.category === resource.category);
  }

  toggleFavorite(resource:Pick<ResourceData, 'id' | 'category' | 'name'>) {
    if (this.isFavorite(resource)) {
      this.removeFavorite(resource.category, resource.id);
    } else if (this.isCategory(resource.category) && resource.id?.trim() && resource.name?.trim()) {
      this.favoritesState.update((items) => [{
        id: resource.id.trim(), category: resource.category as ResourceCategory,
        name: resource.name.trim()
      }, ...items]);
      this.write(this.favoritesKey, this.favoritesState());
    }
  }

  removeFavorite(category:string, id:string) {
    this.favoritesState.update((items) => items.filter((item) =>
      item.category !== category || item.id !== id));
    this.write(this.favoritesKey, this.favoritesState());
  }

  favoritesFor(category:string):Favorite[] {
    return this.favoritesState().filter((item) => item.category === category);
  }

  private isCategory(value:unknown):value is ResourceCategory {
    return value === 'artist' || value === 'album' || value === 'track';
  }

  private read(key:string):unknown[] {
    try {
      const value:unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  private loadHistory():RecentSearch[] {
    const history:RecentSearch[] = [];
    for (const value of this.read(this.historyKey)) {
      if (!value || typeof value !== 'object') continue;
      const item = value as Record<string, unknown>;
      const query = typeof item['query'] === 'string' ? item['query'].trim() : '';
      const category = item['category'];
      if (query && this.isCategory(category) && !history.some((entry) =>
        entry.category === category && entry.query.toLowerCase() === query.toLowerCase())) {
        history.push({ query, category });
      }
      if (history.length === 10) break;
    }
    return history;
  }

  private loadFavorites():Favorite[] {
    const favorites:Favorite[] = [];
    for (const value of this.read(this.favoritesKey)) {
      if (!value || typeof value !== 'object') continue;
      const item = value as Record<string, unknown>;
      const id = typeof item['id'] === 'string' ? item['id'].trim() : '';
      const name = typeof item['name'] === 'string' ? item['name'].trim() : '';
      const category = item['category'];
      if (id && name && this.isCategory(category) && !favorites.some((entry) =>
        entry.id === id && entry.category === category)) {
        favorites.push({ id, name, category });
      }
    }
    return favorites;
  }

  private write(key:string, value:unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      //keep the current session usable if browser storage is unavailable
    }
  }
}
