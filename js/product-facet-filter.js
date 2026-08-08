/**
 * Product Facet Filter Engine
 * Multi-criteria filter engine for e-commerce catalog (category, price, in-stock, brand, size, sorting).
 */
export class ProductFacetFilter {
  constructor(products = []) {
    this.products = products;
  }

  filter(criteria = {}) {
    let result = [...this.products];

    if (criteria.category && criteria.category !== 'all') {
      result = result.filter(p => p.category && p.category.toLowerCase() === criteria.category.toLowerCase());
    }

    if (criteria.minPrice !== undefined && criteria.minPrice !== null) {
      result = result.filter(p => p.price >= criteria.minPrice);
    }

    if (criteria.maxPrice !== undefined && criteria.maxPrice !== null) {
      result = result.filter(p => p.price <= criteria.maxPrice);
    }

    if (criteria.inStockOnly) {
      result = result.filter(p => p.inStock === true || (p.stock && p.stock > 0));
    }

    if (criteria.brands && criteria.brands.length > 0) {
      const lowerBrands = criteria.brands.map(b => b.toLowerCase());
      result = result.filter(p => p.brand && lowerBrands.includes(p.brand.toLowerCase()));
    }

    if (criteria.sizes && criteria.sizes.length > 0) {
      result = result.filter(p => p.sizes && p.sizes.some(s => criteria.sizes.includes(s)));
    }

    if (criteria.sortBy) {
      result = this.sortResults(result, criteria.sortBy);
    }

    return result;
  }

  sortResults(items, sortBy) {
    const sorted = [...items];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating-desc':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  }

  getFacetCounts(criteria = {}) {
    const matchingProducts = this.filter(criteria);
    const counts = {
      categories: {},
      brands: {},
      sizes: {},
      inStock: 0
    };

    matchingProducts.forEach(p => {
      if (p.category) {
        counts.categories[p.category] = (counts.categories[p.category] || 0) + 1;
      }
      if (p.brand) {
        counts.brands[p.brand] = (counts.brands[p.brand] || 0) + 1;
      }
      if (p.sizes && Array.isArray(p.sizes)) {
        p.sizes.forEach(s => {
          counts.sizes[s] = (counts.sizes[s] || 0) + 1;
        });
      }
      if (p.inStock === true || (p.stock && p.stock > 0)) {
        counts.inStock++;
      }
    });

    return counts;
  }

  toQueryString(criteria = {}) {
    const params = new URLSearchParams();
    if (criteria.category && criteria.category !== 'all') params.set('category', criteria.category);
    if (criteria.minPrice) params.set('minPrice', criteria.minPrice);
    if (criteria.maxPrice) params.set('maxPrice', criteria.maxPrice);
    if (criteria.inStockOnly) params.set('inStock', 'true');
    if (criteria.brands && criteria.brands.length) params.set('brands', criteria.brands.join(','));
    if (criteria.sizes && criteria.sizes.length) params.set('sizes', criteria.sizes.join(','));
    if (criteria.sortBy) params.set('sortBy', criteria.sortBy);
    return params.toString();
  }

  parseQueryString(queryString) {
    const params = new URLSearchParams(queryString);
    const criteria = {};

    if (params.has('category')) criteria.category = params.get('category');
    if (params.has('minPrice')) criteria.minPrice = Number(params.get('minPrice'));
    if (params.has('maxPrice')) criteria.maxPrice = Number(params.get('maxPrice'));
    if (params.has('inStock')) criteria.inStockOnly = params.get('inStock') === 'true';
    if (params.has('brands')) criteria.brands = params.get('brands').split(',').filter(Boolean);
    if (params.has('sizes')) criteria.sizes = params.get('sizes').split(',').filter(Boolean);
    if (params.has('sortBy')) criteria.sortBy = params.get('sortBy');

    return criteria;
  }
}
