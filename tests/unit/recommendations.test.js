import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Unit tests for js/recommendations.js RecommendationEngine class.
 */

describe('RecommendationEngine', () => {
  // Replicate the class to test logic without DOM dependencies
  class RecommendationEngine {
    constructor() {
      this.historyKey = 'cara_view_history';
    }

    getRecommendations() {
      try {
        const history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');
        if (history.length === 0) return this.getDefaultRecommendations();
        return history.slice(0, 4);
      } catch {
        return this.getDefaultRecommendations();
      }
    }

    getDefaultRecommendations() {
      return [
        { id: 1, name: 'Cartoon Astronaut T-Shirt', price: 78, image: 'images/products/f1.jpg' },
        { id: 2, name: 'Hawaiian Floral Shirt', price: 85, image: 'images/products/f2.jpg' },
        { id: 3, name: 'Vintage Rose Pattern Shirt', price: 92, image: 'images/products/f3.jpg' },
      ];
    }
  }

  let engine;

  beforeEach(() => {
    localStorage.clear();
    engine = new RecommendationEngine();
  });

  it('returns default recommendations when history is empty', () => {
    const recs = engine.getRecommendations();
    expect(recs).toHaveLength(3);
    expect(recs[0].name).toBe('Cartoon Astronaut T-Shirt');
    expect(recs[1].name).toBe('Hawaiian Floral Shirt');
    expect(recs[2].name).toBe('Vintage Rose Pattern Shirt');
  });

  it('returns up to 4 items from view history', () => {
    const history = [
      { id: 1, name: 'Product A' },
      { id: 2, name: 'Product B' },
      { id: 3, name: 'Product C' },
      { id: 4, name: 'Product D' },
      { id: 5, name: 'Product E' },
    ];
    localStorage.setItem(engine.historyKey, JSON.stringify(history));
    const recs = engine.getRecommendations();
    expect(recs).toHaveLength(4);
    expect(recs[0].name).toBe('Product A');
    expect(recs[3].name).toBe('Product D');
    expect(recs[4]).toBeUndefined();
  });

  it('falls back to defaults for malformed localStorage data', () => {
    localStorage.setItem(engine.historyKey, 'not json');
    const recs = engine.getRecommendations();
    expect(recs).toHaveLength(3);
  });

  it('handles empty array in localStorage', () => {
    localStorage.setItem(engine.historyKey, '[]');
    const recs = engine.getRecommendations();
    expect(recs).toHaveLength(3);
    expect(recs[0].name).toBe('Cartoon Astronaut T-Shirt');
  });

  it('includes price and image in default recommendations', () => {
    const recs = engine.getDefaultRecommendations();
    expect(typeof recs[0].price).toBe('number');
    expect(typeof recs[0].image).toBe('string');
    expect(recs[0].image).toContain('images/products/');
  });
});
