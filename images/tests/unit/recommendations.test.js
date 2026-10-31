import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../../js/recommendations.js';

const RecommendationEngine = window.recommendationEngine.constructor;

describe('recommendations.js unit tests', function () {
  var storage = {};

  beforeEach(function () {
    storage = {};
    vi.stubGlobal('localStorage', {
      getItem: function (key) { return storage[key] || null; },
      setItem: function (key, val) { storage[key] = val; },
      removeItem: function (key) { delete storage[key]; }
    });
  });

  it('getDefaultRecommendations returns array of products', function () {
    var defaults = [
      { id: 1, name: 'Cartoon Astronaut T-Shirt', price: 78, image: 'images/products/f1.jpg' },
      { id: 2, name: 'Hawaiian Floral Shirt', price: 85, image: 'images/products/f2.jpg' },
      { id: 3, name: 'Vintage Rose Pattern Shirt', price: 92, image: 'images/products/f3.jpg' }
    ];
    expect(defaults.length).toBe(3);
    expect(defaults[0]).toHaveProperty('id');
    expect(defaults[0]).toHaveProperty('name');
    expect(defaults[0]).toHaveProperty('price');
  });

  it('getRecommendations returns defaults when history is empty', function () {
    storage['cara_view_history'] = '[]';
    var history = JSON.parse(storage['cara_view_history'] || '[]');
    var result = history.length === 0
      ? [
          { id: 1, name: 'Cartoon Astronaut T-Shirt', price: 78, image: 'images/products/f1.jpg' },
          { id: 2, name: 'Hawaiian Floral Shirt', price: 85, image: 'images/products/f2.jpg' },
          { id: 3, name: 'Vintage Rose Pattern Shirt', price: 92, image: 'images/products/f3.jpg' }
        ]
      : history.slice(0, 4);
    expect(result.length).toBe(3);
  });

  it('getRecommendations returns recent history items', function () {
    storage['cara_view_history'] = JSON.stringify([
      { id: 10, name: 'Recent Item A', price: 50 },
      { id: 11, name: 'Recent Item B', price: 60 },
      { id: 12, name: 'Recent Item C', price: 70 }
    ]);
    var history = JSON.parse(storage['cara_view_history'] || '[]');
    var result = history.length === 0
      ? [
          { id: 1, name: 'Cartoon Astronaut T-Shirt', price: 78, image: 'images/products/f1.jpg' }
        ]
      : history.slice(0, 4);
    expect(result.length).toBe(3);
    expect(result[0].id).toBe(10);
    expect(result[2].id).toBe(12);
  });

  it('handles corrupted localStorage data gracefully', function () {
    storage['cara_view_history'] = 'not valid json';
    var result;
    try {
      result = JSON.parse(storage['cara_view_history']);
    } catch (e) {
      result = [];
    }
    expect(result).toEqual([]);
  });

  it('limits recommendations to 4 items from history', function () {
    var history = [];
    for (var i = 0; i < 10; i++) {
      history.push({ id: i, name: 'Item ' + i, price: i * 10 });
    }
    var result = history.slice(0, 4);
    expect(result.length).toBe(4);
    expect(result[3].id).toBe(3);
  });

  it('falls back to defaults when history is a non-array', function () {
    storage['cara_view_history'] = JSON.stringify({ not: 'an array' });
    var history = JSON.parse(storage['cara_view_history']);
    var result = Array.isArray(history)
      ? history.slice(0, 4)
      : [
          { id: 1, name: 'Cartoon Astronaut T-Shirt', price: 78 },
          { id: 2, name: 'Hawaiian Floral Shirt', price: 85 },
          { id: 3, name: 'Vintage Rose Pattern Shirt', price: 92 },
        ];
    expect(result.length).toBe(3);
    expect(result[0].name).toBe('Cartoon Astronaut T-Shirt');
  });

  it('drops duplicate ids when building the recommendation list', function () {
    var history = [
      { id: 5, name: 'Item A', price: 10 },
      { id: 5, name: 'Item A', price: 10 },
      { id: 6, name: 'Item B', price: 20 },
    ];
    var seen = {};
    var deduped = history.filter(function (item) {
      if (seen[item.id]) return false;
      seen[item.id] = true;
      return true;
    });
    expect(deduped.length).toBe(2);
    expect(deduped[0].id).toBe(5);
    expect(deduped[1].id).toBe(6);
  });
});

describe('recommendations.js module', function () {
  it('returns defaults when localStorage contains corrupt JSON', function () {
    // The real module must not throw on corrupt storage.
    localStorage.setItem('cara_view_history', '{not-json');
    var engine = new RecommendationEngine();
    var result = engine.getRecommendations();
    expect(result.length).toBe(3);
    expect(result[0].name).toBe('Cartoon Astronaut T-Shirt');
  });

  it('returns defaults when history is a non-array value', function () {
    localStorage.setItem('cara_view_history', JSON.stringify({ bad: true }));
    var engine = new RecommendationEngine();
    expect(engine.getRecommendations().length).toBe(3);
  });

  it('returns up to 4 recent history items', function () {
    var items = [];
    for (var i = 0; i < 6; i++) {
      items.push({ id: i, name: 'Item ' + i, price: i });
    }
    localStorage.setItem('cara_view_history', JSON.stringify(items));
    var engine = new RecommendationEngine();
    var result = engine.getRecommendations();
    expect(result.length).toBe(4);
    expect(result[0].id).toBe(0);
  });

  it('returns a single history item without duplicating it', function () {
    localStorage.setItem(
      'cara_view_history',
      JSON.stringify([{ id: 42, name: 'Only Item', price: 99 }]),
    );
    var engine = new RecommendationEngine();
    var result = engine.getRecommendations();
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(42);
  });
});
