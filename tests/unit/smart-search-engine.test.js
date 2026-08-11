import { describe, it, expect, beforeEach } from 'vitest';
const SmartSearchEngine = require('../../js/smart-search-engine.js');

describe('SmartSearchEngine Unit Tests', () => {
  let engine;
  const sampleProducts = [
    { id: 1, name: 'Cartoon Astronaut T-Shirt', category: 'tshirts', price: 29.99, description: 'Cool tee shirt' },
    { id: 2, name: 'Slim Fit Denim Pants', category: 'pants', price: 49.99, description: 'Blue jeans' },
    { id: 3, name: 'Winter Parka Jacket', category: 'jackets', price: 89.99, description: 'Warm coat' },
    { id: 4, name: 'Casual Leather Shoes', category: 'shoes', price: 59.99, description: 'Black loafers' }
  ];

  beforeEach(() => {
    localStorage.clear();
    engine = new SmartSearchEngine(sampleProducts);
  });

  it('should initialize correctly with product dataset', () => {
    expect(engine.products.length).toBe(4);
  });

  it('should resolve synonyms for queries', () => {
    const synonyms = engine.getSynonyms('tee');
    expect(synonyms).toContain('shirt');
    expect(synonyms).toContain('tshirt');
  });

  it('should filter products by synonym query', () => {
    const results = engine.filter({ query: 'tee' });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Cartoon Astronaut T-Shirt');
  });

  it('should filter by category and price range', () => {
    const results = engine.filter({ category: 'pants', minPrice: 40, maxPrice: 60 });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Slim Fit Denim Pants');
  });

  it('should manage search history in localStorage', () => {
    engine.filter({ query: 'jacket' });
    const history = engine.getHistory();
    expect(history).toContain('jacket');

    engine.clearHistory();
    expect(engine.getHistory().length).toBe(0);
  });

  it('should return all products for an empty query', () => {
    const results = engine.filter({ query: '' });
    expect(results.length).toBe(4);
  });

  it('should return an empty array when nothing matches', () => {
    const results = engine.filter({ query: 'zebra' });
    expect(results.length).toBe(0);
  });

  it('should match queries case-insensitively', () => {
    const results = engine.filter({ query: 'PARKA' });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Winter Parka Jacket');
  });

  it('should combine category filter with an empty query', () => {
    const results = engine.filter({ category: 'shoes' });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Casual Leather Shoes');
  });

  it('should preserve input order for equally-relevant matches', () => {
    const engine2 = new SmartSearchEngine([
      { id: 1, name: 'Blue Tee', category: 'tshirts', price: 20 },
      { id: 2, name: 'Blue Tee Deluxe', category: 'tshirts', price: 20 },
      { id: 3, name: 'Blue Tee Pro', category: 'tshirts', price: 20 },
    ]);
    const results = engine2.filter({ query: 'blue' });
    expect(results.map((p) => p.id)).toEqual([1, 2, 3]);
  });

  it('should sort ties stably by price when price-asc is requested', () => {
    const engine2 = new SmartSearchEngine([
      { id: 1, name: 'Tee A', category: 'tshirts', price: 20 },
      { id: 2, name: 'Tee B', category: 'tshirts', price: 10 },
      { id: 3, name: 'Tee C', category: 'tshirts', price: 20 },
    ]);
    const results = engine2.filter({ query: 'tee', sortBy: 'price-asc' });
    expect(results.map((p) => p.id)).toEqual([2, 1, 3]);
  });

  it('should cap the search history at 10 entries', () => {
    for (let i = 1; i <= 12; i++) {
      engine.filter({ query: `query-${i}` });
    }
    const history = engine.getHistory();
    expect(history.length).toBe(10);
    expect(history[0]).toBe('query-12');
  });
});
