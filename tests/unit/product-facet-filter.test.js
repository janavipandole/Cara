import { describe, it, expect, beforeEach } from 'vitest';
import { ProductFacetFilter } from '../../js/product-facet-filter.js';

describe('ProductFacetFilter', () => {
  let sampleProducts;
  let filterEngine;

  beforeEach(() => {
    sampleProducts = [
      { id: '1', name: 'T-Shirt A', category: 'tshirts', price: 20, rating: 4.5, inStock: true },
      { id: '2', name: 'Shirt B', category: 'shirts', price: 50, rating: 4.0, inStock: false },
      { id: '3', name: 'Jacket C', category: 'jackets', price: 120, rating: 4.8, inStock: true },
      { id: '4', name: 'T-Shirt D', category: 'tshirts', price: 35, rating: 3.5, inStock: true }
    ];
    filterEngine = new ProductFacetFilter(sampleProducts);
  });

  it('should return all products by default', () => {
    expect(filterEngine.applyFilters()).toHaveLength(4);
  });

  it('should filter by category facets', () => {
    const results = filterEngine.setFilters({ category: ['tshirts'] });
    expect(results).toHaveLength(2);
    expect(results.map(p => p.id)).toEqual(['1', '4']);
  });

  it('should filter by price range', () => {
    const results = filterEngine.setFilters({ minPrice: 30, maxPrice: 60 });
    expect(results).toHaveLength(2);
    expect(results.map(p => p.id)).toEqual(['2', '4']);
  });

  it('should serialize and parse URL query parameters bi-directionally', () => {
    filterEngine.setFilters({ category: ['shirts', 'jackets'], minPrice: 40, inStockOnly: true });
    const query = filterEngine.buildQueryParams();
    expect(query).toContain('categories=shirts%2Cjackets');
    expect(query).toContain('minPrice=40');
    expect(query).toContain('inStock=true');

    const newEngine = new ProductFacetFilter(sampleProducts);
    newEngine.parseQueryParams(query);
    expect(newEngine.activeFilters.category).toEqual(['shirts', 'jackets']);
    expect(newEngine.activeFilters.minPrice).toBe(40);
  });

  it('should reset filters back to default state', () => {
    filterEngine.setFilters({ minPrice: 100, inStockOnly: true });
    expect(filterEngine.resetFilters()).toHaveLength(4);
  });


  it('should check price against arbitrary facet range', () => {
    const filter = new ProductFacetFilter([]);
    expect(filter.isPriceInFacetRange(50, 40, 60)).toBe(true);
    expect(filter.isPriceInFacetRange(50, 0, 40)).toBe(false);
    expect(filter.isPriceInFacetRange(50, 50, 60)).toBe(true); // boundary inclusive
  });

  it('should return false for NaN price', () => {
    const filter = new ProductFacetFilter([]);
    expect(filter.isPriceInFacetRange(NaN, 0, 100)).toBe(false);
  });

  it('should treat an empty categories param as no category filter', () => {
    const newEngine = new ProductFacetFilter(sampleProducts);
    newEngine.parseQueryParams('categories=&minPrice=10');
    expect(newEngine.activeFilters.category).toEqual([]);
    expect(newEngine.applyFilters()).toHaveLength(4);
  });

  it('should drop empty entries when splitting category params', () => {
    const newEngine = new ProductFacetFilter(sampleProducts);
    const filters = newEngine.parseQueryParams('categories=tshirts,,shirts');
    expect(filters.category).toEqual(['tshirts', 'shirts']);
  });

  it('should treat maxPrice=0 as a real boundary, not unbounded', () => {
    const freeProducts = [
      { id: '1', name: 'Free Tee', category: 'tshirts', price: 0, rating: 4, inStock: true },
      { id: '2', name: 'Paid Tee', category: 'tshirts', price: 20, rating: 4, inStock: true },
    ];
    const engine = new ProductFacetFilter(freeProducts);
    const filters = engine.parseQueryParams('maxPrice=0');
    expect(filters.maxPrice).toBe(0);

    const results = engine.applyFilters();
    expect(results.map((p) => p.id)).toEqual(['1']);

    // Round trip: buildQueryParams should still emit maxPrice=0.
    expect(engine.buildQueryParams()).toContain('maxPrice=0');
  });

  it('should round-trip minPrice and maxPrice through the URL', () => {
    const engine = new ProductFacetFilter(sampleProducts);
    engine.parseQueryParams('minPrice=30&maxPrice=60');
    expect(engine.activeFilters.minPrice).toBe(30);
    expect(engine.activeFilters.maxPrice).toBe(60);
    expect(engine.applyFilters().map((p) => p.id)).toEqual(['2', '4']);
  });
});
