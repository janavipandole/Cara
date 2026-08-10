/**
 * Intelligent Multi-Faceted Product Filter & URL Query Sync Engine
 * Handles multi-category filtering, price range boundaries, and URL query synchronization.
 */

export class ProductFacetFilter {
  constructor(products = []) {
    this.products = products;
    this.activeFilters = {
      category: [],
      minPrice: 0,
      maxPrice: Infinity,
      minRating: 0,
      inStockOnly: false
    };
  }

  setFilters(filters = {}) {
    this.activeFilters = { ...this.activeFilters, ...filters };
    return this.applyFilters();
  }

  applyFilters() {
    return this.products.filter((p) => {
      // Category filter
      if (this.activeFilters.category.length > 0) {
        if (!this.activeFilters.category.includes(p.category)) return false;
      }
      // Price range
      const price = parseFloat(p.price) || 0;
      if (price < this.activeFilters.minPrice || price > this.activeFilters.maxPrice) {
        return false;
      }
      // Rating threshold
      const rating = parseFloat(p.rating) || 0;
      if (rating < this.activeFilters.minRating) {
        return false;
      }
      // In-stock availability
      if (this.activeFilters.inStockOnly && !p.inStock) {
        return false;
      }
      return true;
    });
  }

  buildQueryParams() {
    const params = new URLSearchParams();
    if (this.activeFilters.category.length > 0) {
      params.set('categories', this.activeFilters.category.join(','));
    }
    if (this.activeFilters.minPrice > 0) {
      params.set('minPrice', this.activeFilters.minPrice);
    }
    if (this.activeFilters.maxPrice < Infinity) {
      params.set('maxPrice', this.activeFilters.maxPrice);
    }
    if (this.activeFilters.minRating > 0) {
      params.set('minRating', this.activeFilters.minRating);
    }
    if (this.activeFilters.inStockOnly) {
      params.set('inStock', 'true');
    }
    return params.toString();
  }

  parseQueryParams(queryString) {
    const params = new URLSearchParams(queryString);
    const rawCategories = params.get('categories');
    const filters = {
      category: rawCategories ? rawCategories.split(',').filter((c) => c.length > 0) : [],
      minPrice: parseFloat(params.get('minPrice')) || 0,
      maxPrice: parseFloat(params.get('maxPrice')) || Infinity,
      minRating: parseFloat(params.get('minRating')) || 0,
      inStockOnly: params.get('inStock') === 'true'
    };
    this.setFilters(filters);
    return filters;
  }

  resetFilters() {
    this.activeFilters = {
      category: [],
      minPrice: 0,
      maxPrice: Infinity,
      minRating: 0,
      inStockOnly: false
    };
    return this.products;
  }

  /**
   * Checks whether a price falls within a given min/max range.
   * @param {number} price
   * @param {number} minPrice
   * @param {number} maxPrice
   * @returns {boolean}
   */
  isPriceInFacetRange(price, minPrice = 0, maxPrice = Infinity) {
    if (typeof price !== 'number' || Number.isNaN(price)) return false;
    const p = price;
    return p >= minPrice && p <= maxPrice;
  }

}
