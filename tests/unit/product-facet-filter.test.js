import { describe, it, expect } from 'vitest';
import { ProductFacetFilter } from '../../js/product-facet-filter.js';

const mockProducts = [
  { id: 1, name: 'Floral Dress', category: 'dresses', price: 49.99, inStock: true, brand: 'CaraStudio', sizes: ['S', 'M'], rating: 4.5 },
  { id: 2, name: 'Denim Jacket', category: 'jackets', price: 89.99, inStock: true, brand: 'UrbanStyle', sizes: ['M', 'L'], rating: 4.8 },
  { id: 3, name: 'Cotton T-Shirt', category: 'shirts', price: 19.99, inStock: false, brand: 'CaraStudio', sizes: ['S', 'M', 'L'], rating: 4.0 },
  { id: 4, name: 'Leather Boots', category: 'shoes', price: 120.00, inStock: true, brand: 'Footworks', sizes: ['40', '42'], rating: 4.9 },
];

describe('ProductFacetFilter', () => {
  it('filters products by brand and sizes', () => {
    const filterEngine = new ProductFacetFilter(mockProducts);
    const results = filterEngine.filter({ brands: ['CaraStudio'], sizes: ['M'] });
    expect(results).toHaveLength(2);
  });

  it('sorts results by price-asc and price-desc', () => {
    const filterEngine = new ProductFacetFilter(mockProducts);
    const asc = filterEngine.filter({ sortBy: 'price-asc' });
    expect(asc[0].price).toBe(19.99);

    const desc = filterEngine.filter({ sortBy: 'price-desc' });
    expect(desc[0].price).toBe(120.00);
  });

  it('computes dynamic facet counts matching active filter criteria', () => {
    const filterEngine = new ProductFacetFilter(mockProducts);
    const counts = filterEngine.getFacetCounts({ inStockOnly: true });
    expect(counts.inStock).toBe(3);
    expect(counts.brands['CaraStudio']).toBe(1);
    expect(counts.brands['UrbanStyle']).toBe(1);
  });

  it('converts criteria to query string and parses back accurately', () => {
    const filterEngine = new ProductFacetFilter(mockProducts);
    const criteria = { category: 'dresses', minPrice: 20, brands: ['CaraStudio'], sortBy: 'rating-desc' };
    const query = filterEngine.toQueryString(criteria);
    const parsed = filterEngine.parseQueryString(query);

    expect(parsed.category).toBe('dresses');
    expect(parsed.minPrice).toBe(20);
    expect(parsed.brands).toEqual(['CaraStudio']);
    expect(parsed.sortBy).toBe('rating-desc');
  });
});
