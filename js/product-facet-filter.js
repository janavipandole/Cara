/**
 * Intelligent Multi-Faceted Product Filter & URL Query Sync Engine
 * Handles multi-category filtering, price range boundaries, and URL query synchronization.
 */

import { isSafeKey } from './prototype-pollution-guard.js';

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
    for (const key of Object.keys(filters)) {
      if (isSafeKey(key)) {
        this.activeFilters[key] = filters[key];
      }
    }
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
    const rawMinPrice = params.get('minPrice');
    const rawMaxPrice = params.get('maxPrice');
    const rawMinRating = params.get('minRating');
    const filters = {
      category: rawCategories ? rawCategories.split(',').filter((c) => c.length > 0) : [],
      minPrice: rawMinPrice !== null && Number.isFinite(Number(rawMinPrice)) ? Number(rawMinPrice) : 0,
      maxPrice: rawMaxPrice !== null && Number.isFinite(Number(rawMaxPrice)) ? Number(rawMaxPrice) : Infinity,
      minRating: rawMinRating !== null && Number.isFinite(Number(rawMinRating)) ? Number(rawMinRating) : 0,
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

window.getProductFacetFilterStatusHelper106 = function() {
  return {
    status: 'active',
    module: 'ProductFacetFilter',
    helper: 'getProductFacetFilterStatusHelper106'
  };
};
