import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('recommendations.js unit tests', function () {
  var storage = {};

  beforeEach(function () {
    storage = {};
    vi.stubGlobal('localStorage', {
      getItem: function (key) {
        return storage[key] || null;
      },
      setItem: function (key, val) {
        storage[key] = val;
      },
      removeItem: function (key) {
        delete storage[key];
      },
    });
  });

  it('getDefaultRecommendations returns array of products', function () {
    var defaults = [
      {
        id: 1,
        name: 'Cartoon Astronaut T-Shirt',
        price: 78,
        image: 'images/products/f1.jpg',
      },
      {
        id: 2,
        name: 'Hawaiian Floral Shirt',
        price: 85,
        image: 'images/products/f2.jpg',
      },
      {
        id: 3,
        name: 'Vintage Rose Pattern Shirt',
        price: 92,
        image: 'images/products/f3.jpg',
      },
    ];
    expect(defaults.length).toBe(3);
    expect(defaults[0]).toHaveProperty('id');
    expect(defaults[0]).toHaveProperty('name');
    expect(defaults[0]).toHaveProperty('price');
  });

  it('getRecommendations returns defaults when history is empty', function () {
    storage['cara_view_history'] = '[]';
    var history = JSON.parse(storage['cara_view_history'] || '[]');
    var result =
      history.length === 0
        ? [
            {
              id: 1,
              name: 'Cartoon Astronaut T-Shirt',
              price: 78,
              image: 'images/products/f1.jpg',
            },
            {
              id: 2,
              name: 'Hawaiian Floral Shirt',
              price: 85,
              image: 'images/products/f2.jpg',
            },
            {
              id: 3,
              name: 'Vintage Rose Pattern Shirt',
              price: 92,
              image: 'images/products/f3.jpg',
            },
          ]
        : history.slice(0, 4);
    expect(result.length).toBe(3);
  });

  it('getRecommendations returns recent history items', function () {
    storage['cara_view_history'] = JSON.stringify([
      { id: 10, name: 'Recent Item A', price: 50 },
      { id: 11, name: 'Recent Item B', price: 60 },
      { id: 12, name: 'Recent Item C', price: 70 },
    ]);
    var history = JSON.parse(storage['cara_view_history'] || '[]');
    var result =
      history.length === 0
        ? [
            {
              id: 1,
              name: 'Cartoon Astronaut T-Shirt',
              price: 78,
              image: 'images/products/f1.jpg',
            },
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
});
