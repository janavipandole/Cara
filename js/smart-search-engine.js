/**
 * Smart Search Engine Module for Cara E-Commerce
 * Features: Fuzzy keyword matching, Synonym mapping, Multi-category filtering, Price range query, and Search History management.
 */

class SmartSearchEngine {
  constructor(products = []) {
    this.products = products;
    this.historyKey = 'cara_smart_search_history_v2';
    this.maxHistory = 10;
    this.synonyms = {
      shirt: ['tshirt', 't-shirt', 'top', 'tee', 'blouse'],
      pants: ['trousers', 'denim', 'jeans', 'slacks', 'bottoms'],
      jacket: ['coat', 'outerwear', 'blazer', 'hoodie', 'cardigan'],
      shoes: ['footwear', 'sneakers', 'boots', 'loafers'],
      dress: ['gown', 'frock', 'one-piece']
    };
  }

  setProducts(products) {
    this.products = Array.isArray(products) ? products : [];
  }

  getSynonyms(query) {
    const q = query.toLowerCase().trim();
    const result = new Set([q]);

    // Strip trailing 's' to handle plural forms (e.g., "shirts" -> "shirt")
    const singular = q.endsWith('s') && q.length > 1 ? q.slice(0, -1) : q;
    if (singular !== q) {
      result.add(singular);
    }

    for (const [key, list] of Object.entries(this.synonyms)) {
      if (key === q || list.includes(q) || key === singular || list.includes(singular)) {
        result.add(key);
        list.forEach((syn) => result.add(syn));
      }
    }
    return Array.from(result);
  }

  filter({ query = '', category = 'all', minPrice = 0, maxPrice = Infinity, sortBy = 'relevance' } = {}) {
    const terms = this.getSynonyms(query);
    
    let filtered = this.products.filter((product) => {
      // Category check
      if (category !== 'all' && product.category && product.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      
      // Price range check
      const price = parseFloat(product.price) || 0;
      if (price < minPrice || price > maxPrice) {
        return false;
      }

      // Keyword query match
      if (!query.trim()) return true;

      const title = (product.name || product.title || '').toLowerCase();
      const desc = (product.description || '').toLowerCase();
      const cat = (product.category || '').toLowerCase();

      return terms.some((term) => title.includes(term) || desc.includes(term) || cat.includes(term));
    });

    // Sorting
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
    }

    if (query.trim()) {
      this.saveHistory(query.trim());
    }

    return filtered;
  }

  saveHistory(query) {
    if (!query) return;
    try {
      let history = this.getHistory();
      history = history.filter((q) => q.toLowerCase() !== query.toLowerCase());
      history.unshift(query);
      if (history.length > this.maxHistory) history = history.slice(0, this.maxHistory);
      localStorage.setItem(this.historyKey, JSON.stringify(history));
    } catch (e) {
      console.warn('Storage error saving search history:', e);
    }
  }

  getHistory() {
    try {
      const data = localStorage.getItem(this.historyKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  clearHistory() {
    try {
      localStorage.removeItem(this.historyKey);
    } catch (e) {
      // ignore
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartSearchEngine;
} else {
  window.SmartSearchEngine = SmartSearchEngine;
}
