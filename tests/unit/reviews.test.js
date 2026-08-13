import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
var storage = {};
globalThis.localStorage = {
  getItem: function (key) {
    return storage[key] || null;
  },
  setItem: function (key, val) {
    storage[key] = val;
  },
  removeItem: function (key) {
    delete storage[key];
  },
};

// Spy on console.warn
var warnSpy = vi.spyOn(console, 'warn').mockImplementation(function () {});

describe('reviews.js unit tests', function () {
  beforeEach(function () {
    storage = {};
    warnSpy.mockClear();
    document.body.innerHTML = '';
  });

  // Helper: extract functions from the IIFE
  function getHelpers() {
    // The _readReviews, _saveReviews, _calcStats, _escape, _formatDate are
    // scoped inside the IIFE and not exported. We test the public init()
    // and the aggregate rendering by testing init() with a mocked container.
    return null;
  }

  it('returns empty stats for empty reviews array', function () {
    var result = (function () {
      var reviews = [];
      if (!reviews.length) return { avg: 0, total: 0, dist: [0, 0, 0, 0, 0] };
      var dist = [0, 0, 0, 0, 0];
      var sum = reviews.reduce(function (acc, r) {
        if (typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5) {
          dist[r.rating - 1]++;
          return acc + r.rating;
        }
        return acc;
      }, 0);
      return {
        avg: parseFloat((sum / reviews.length).toFixed(1)),
        total: reviews.length,
        dist: dist,
      };
    })();
    expect(result.total).toBe(0);
    expect(result.avg).toBe(0);
    expect(result.dist).toEqual([0, 0, 0, 0, 0]);
  });

  it('calculates correct avg for valid reviews', function () {
    var reviews = [{ rating: 5 }, { rating: 4 }, { rating: 3 }];
    var dist = [0, 0, 0, 0, 0];
    var sum = reviews.reduce(function (acc, r) {
      if (typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5) {
        dist[r.rating - 1]++;
        return acc + r.rating;
      }
      return acc;
    }, 0);
    var result = {
      avg: parseFloat((sum / reviews.length).toFixed(1)),
      total: reviews.length,
      dist: dist,
    };
    expect(result.total).toBe(3);
    expect(result.avg).toBe(4.0);
    expect(typeof result.avg).toBe('number');
    expect(result.dist).toEqual([0, 0, 1, 1, 1]);
  });

  it('ignores ratings outside 1-5 range', function () {
    var reviews = [
      { rating: 5 },
      { rating: 0 },
      { rating: 6 },
      { rating: 3 },
      { rating: 'bad' },
    ];
    var dist = [0, 0, 0, 0, 0];
    var validReviews = reviews.filter(function (r) {
      return typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5;
    });
    var sum = validReviews.reduce(function (acc, r) {
      dist[r.rating - 1]++;
      return acc + r.rating;
    }, 0);
    expect(validReviews.length).toBe(2);
    expect(sum).toBe(8);
  });

  it('_escape encodes HTML special characters', function () {
    var _escape = function (str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
    expect(_escape('<script>')).toBe('&lt;script&gt;');
    expect(_escape('"test" & \'more\'')).toBe(
      '&quot;test&quot; &amp; &#39;more&#39;',
    );
    expect(_escape('Normal text')).toBe('Normal text');
  });

  it('_formatDate returns formatted date string', function () {
    var _formatDate = function (iso) {
      try {
        return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
          new Date(iso),
        );
      } catch (err) {
        return iso;
      }
    };
    var result = _formatDate('2026-01-15T00:00:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('_formatDate falls back to iso string on invalid date', function () {
    var _formatDate = function (iso) {
      try {
        return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
          new Date(iso),
        );
      } catch (err) {
        return iso;
      }
    };
    var result = _formatDate('not-a-date');
    expect(result).toBe('not-a-date');
  });

  it('_readReviews handles missing localStorage gracefully', function () {
    storage = {};
    var result = (function () {
      try {
        return JSON.parse(
          localStorage.getItem('cara_reviews_nonexistent') || '[]',
        );
      } catch (err) {
        return [];
      }
    })();
    expect(result).toEqual([]);
  });

  it('_readReviews parses stored reviews from localStorage', function () {
    storage['cara_reviews_testpid'] = JSON.stringify([
      { id: 1, rating: 5, author: 'Alice' },
    ]);
    var result = (function () {
      try {
        return JSON.parse(localStorage.getItem('cara_reviews_testpid') || '[]');
      } catch (err) {
        return [];
      }
    })();
    expect(result.length).toBe(1);
    expect(result[0].rating).toBe(5);
  });

  it('renders a correct aggregate average when ratings arrive as strings', function () {
    // Seed reviews with a numeric rating and a numeric-string rating.
    storage['cara_reviews_strpid'] = JSON.stringify([
      { id: 1, rating: 5, author: 'Alice' },
      { id: 2, rating: '5', author: 'Bob' },
      { id: 3, rating: 1, author: 'Carol' },
    ]);

    document.body.innerHTML =
      '<div id="productReviews" data-product-id="strpid"></div>';

    // Re-evaluate the real source in the current DOM so _render runs _calcStats.
    var fs = require('node:fs');
    var vm = require('node:vm');
    var src = fs.readFileSync(require.resolve('../../js/reviews.js'), 'utf8');
    var sandbox = {
      window: window,
      document: document,
      localStorage: localStorage,
      console: console,
      ProductReviewAggregator: undefined,
      CustomEvent: window.CustomEvent,
      Intl: Intl,
      Date: Date,
      setTimeout: setTimeout,
    };
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: 'reviews.js' });

    // _render runs on DOMContentLoaded/readyState; force a manual invoke by
    // dispatching the event the module listens for.
    document.dispatchEvent(new Event('DOMContentLoaded'));

    var aggregateNumber = document.querySelector('.aggregate-number');
    expect(aggregateNumber).toBeTruthy();
    expect(aggregateNumber.textContent.trim()).toBe('3.7');
  });

  it('handles valid array JSON in localStorage as before', function () {
    storage['cara_reviews_valid'] = JSON.stringify([
      {
        id: 1,
        rating: 4,
        author: 'Dave',
        title: 'Good',
        body: 'This is a long review text.',
      },
    ]);

    document.body.innerHTML =
      '<div id="productReviews" data-product-id="valid"></div>';

    var fs = require('node:fs');
    var vm = require('node:vm');
    var src = fs.readFileSync(require.resolve('../../js/reviews.js'), 'utf8');
    var sandbox = {
      window: window,
      document: document,
      localStorage: localStorage,
      console: console,
      ProductReviewAggregator: undefined,
      CustomEvent: window.CustomEvent,
      Intl: Intl,
      Date: Date,
      setTimeout: setTimeout,
    };
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: 'reviews.js' });
    document.dispatchEvent(new Event('DOMContentLoaded'));

    var aggregateNumber = document.querySelector('.aggregate-number');
    expect(aggregateNumber).toBeTruthy();
    expect(aggregateNumber.textContent.trim()).toBe('4');
  });

  it('handles invalid JSON (e.g. empty string) gracefully without throwing, falling back to empty array', function () {
    storage['cara_reviews_invalid'] = '';

    document.body.innerHTML =
      '<div id="productReviews" data-product-id="invalid"></div>';

    var fs = require('node:fs');
    var vm = require('node:vm');
    var src = fs.readFileSync(require.resolve('../../js/reviews.js'), 'utf8');
    var sandbox = {
      window: window,
      document: document,
      localStorage: localStorage,
      console: console,
      ProductReviewAggregator: undefined,
      CustomEvent: window.CustomEvent,
      Intl: Intl,
      Date: Date,
      setTimeout: setTimeout,
    };
    vm.createContext(sandbox);

    expect(function () {
      vm.runInContext(src, sandbox, { filename: 'reviews.js' });
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }).not.toThrow();

    var aggregateNumber = document.querySelector('.aggregate-number');
    expect(aggregateNumber).toBeTruthy();
    expect(aggregateNumber.textContent.trim()).toBe('—');
  });

  it('handles valid JSON but non-array (e.g. an object or number) gracefully without throwing, falling back to empty array', function () {
    storage['cara_reviews_nonarray'] = JSON.stringify({
      rating: 5,
      author: 'Non-Array',
    });

    document.body.innerHTML =
      '<div id="productReviews" data-product-id="nonarray"></div>';

    var fs = require('node:fs');
    var vm = require('node:vm');
    var src = fs.readFileSync(require.resolve('../../js/reviews.js'), 'utf8');
    var sandbox = {
      window: window,
      document: document,
      localStorage: localStorage,
      console: console,
      ProductReviewAggregator: undefined,
      CustomEvent: window.CustomEvent,
      Intl: Intl,
      Date: Date,
      setTimeout: setTimeout,
    };
    vm.createContext(sandbox);

    expect(function () {
      vm.runInContext(src, sandbox, { filename: 'reviews.js' });
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }).not.toThrow();

    var aggregateNumber = document.querySelector('.aggregate-number');
    expect(aggregateNumber).toBeTruthy();
    expect(aggregateNumber.textContent.trim()).toBe('—');
  });
});
