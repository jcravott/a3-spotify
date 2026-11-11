import { TestBed } from '@angular/core/testing';
import { SavedItemsService } from './saved-items.service';

const historyKey = 'spotify-browser.recent-searches.v1';
const favoritesKey = 'spotify-browser.favorites.v1';

describe('SavedItemsService', () => {
  let service:SavedItemsService;

  beforeEach(() => {
    localStorage.removeItem(historyKey);
    localStorage.removeItem(favoritesKey);
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.removeItem(historyKey);
    localStorage.removeItem(favoritesKey);
  });

  function load() {
    service = TestBed.inject(SavedItemsService);
    return service;
  }

  it('starts with empty lists when storage is missing', () => {
    load();
    expect(service.recentSearches()).toEqual([]);
    expect(service.favorites()).toEqual([]);
  });

  it('trims searches and ignores blank queries', () => {
    load();
    service.saveSearch('   ', 'artist');
    service.saveSearch('  Taylor Swift  ', 'artist');
    expect(service.recentSearches()).toEqual([{ query: 'Taylor Swift', category: 'artist' }]);
  });

  it('deduplicates by query and category and moves repeats to the top', () => {
    load();
    service.saveSearch('Taylor Swift', 'artist');
    service.saveSearch('Billie Eilish', 'album');
    service.saveSearch('Taylor Swift', 'track');
    service.saveSearch('taylor swift', 'artist');
    expect(service.recentSearches().length).toBe(3);
    expect(service.recentSearches()[0]).toEqual({ query: 'taylor swift', category: 'artist' });
  });

  it('retains only the ten newest searches across reloads', () => {
    load();
    for (let index = 0; index < 12; index++) service.saveSearch('Query ' + index, 'track');
    TestBed.resetTestingModule();
    load();
    expect(service.recentSearches().length).toBe(10);
    expect(service.recentSearches()[0].query).toBe('Query 11');
    expect(service.recentSearches()[9].query).toBe('Query 2');
  });

  it('persists clearing history without clearing favorites', () => {
    load();
    service.saveSearch('Adele', 'artist');
    service.toggleFavorite({ id: 'artist-id', category: 'artist', name: 'Adele' });
    service.clearHistory();
    TestBed.resetTestingModule();
    load();
    expect(service.recentSearches()).toEqual([]);
    expect(service.favorites().length).toBe(1);
  });

  it('persists favorites for each category and toggles without duplicates', () => {
    load();
    for (const category of ['artist', 'album', 'track']) {
      service.toggleFavorite({ id: 'shared-id', category, name: category });
    }
    TestBed.resetTestingModule();
    load();
    expect(service.favorites().length).toBe(3);
    service.toggleFavorite({ id: 'shared-id', category: 'artist', name: 'artist' });
    expect(service.isFavorite({ id: 'shared-id', category: 'artist' })).toBeFalse();
    expect(service.favorites().length).toBe(2);
    service.removeFavorite('track', 'shared-id');
    expect(service.favoritesFor('album').length).toBe(1);
    TestBed.resetTestingModule();
    load();
    expect(service.favorites().length).toBe(1);
  });

  it('recovers from malformed JSON and non-array storage', () => {
    localStorage.setItem(historyKey, '{broken');
    localStorage.setItem(favoritesKey, 'null');
    load();
    expect(service.recentSearches()).toEqual([]);
    expect(service.favorites()).toEqual([]);
    service.saveSearch('Adele', 'artist');
    expect(JSON.parse(localStorage.getItem(historyKey)).length).toBe(1);
  });

  it('filters malformed entries and deduplicates stored lists', () => {
    const history = { query: ' Adele ', category: 'artist' };
    const favorite = { id: 'one', category: 'album' as const, name: 'Album' };
    localStorage.setItem(historyKey, JSON.stringify([null, 12, {}, history, history, { query: 'x', category: 'other' }]));
    localStorage.setItem(favoritesKey, JSON.stringify([false, {}, favorite, favorite, { id: 'x', category: 'track' }]));
    load();
    expect(service.recentSearches()).toEqual([{ query: 'Adele', category: 'artist' }]);
    expect(service.favorites()).toEqual([favorite]);
  });

  it('ignores unsupported categories', () => {
    load();
    service.saveSearch('Adele', 'other');
    service.toggleFavorite({ id: 'one', category: 'other', name: 'Adele' });
    expect(service.recentSearches()).toEqual([]);
    expect(service.favorites()).toEqual([]);
  });

  it('stays usable if storage reads or writes are blocked', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('blocked');
    spyOn(Storage.prototype, 'setItem').and.throwError('full');
    load();
    expect(() => service.saveSearch('Adele', 'artist')).not.toThrow();
    expect(() => service.toggleFavorite({ id: 'one', category: 'artist', name: 'Adele' })).not.toThrow();
    expect(service.recentSearches().length).toBe(1);
    expect(service.favorites().length).toBe(1);
    expect(() => service.clearHistory()).not.toThrow();
  });

  it('synchronizes favorites and history after another tab changes storage', () => {
    load();
    localStorage.setItem(favoritesKey, JSON.stringify([{ id: 'one', category: 'track', name: 'Track' }]));
    window.dispatchEvent(new StorageEvent('storage', { key: favoritesKey }));
    expect(service.isFavorite({ id: 'one', category: 'track' })).toBeTrue();
    localStorage.setItem(historyKey, JSON.stringify([{ query: 'Adele', category: 'artist' }]));
    window.dispatchEvent(new StorageEvent('storage', { key: historyKey }));
    expect(service.recentSearches().length).toBe(1);
    localStorage.removeItem(historyKey);
    localStorage.removeItem(favoritesKey);
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    expect(service.recentSearches()).toEqual([]);
    expect(service.favorites()).toEqual([]);
  });
});
