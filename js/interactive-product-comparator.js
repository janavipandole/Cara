/**
 * Interactive Product Comparator Engine
 * Supports multi-item attribute matrix comparisons, difference highlighting, persistence, and state sync.
 */

export class InteractiveProductComparator {
  constructor(storageKey = 'cara_compare_items_v2') {
    this.storageKey = storageKey;
    this.maxItems = 4;
    this.items = this.loadItems();
  }

  loadItems() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveItems() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  addItem(product) {
    if (!product || !product.id) return { success: false, reason: 'Invalid product' };
    if (this.items.some((item) => item.id === product.id)) {
      return { success: false, reason: 'Product already in comparison list' };
    }
    if (this.items.length >= this.maxItems) {
      return { success: false, reason: `Maximum of ${this.maxItems} items allowed` };
    }
    this.items.push({
      id: product.id,
      name: product.name || 'Unnamed Product',
      price: product.price || 0,
      image: product.image || 'img/products/f1.jpg',
      brand: product.brand || 'Cara',
      rating: product.rating || 5,
      category: product.category || 'Apparel',
      inStock: product.inStock !== false
    });
    this.saveItems();
    return { success: true, count: this.items.length };
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveItems();
    return { success: true, count: this.items.length };
  }

  clear() {
    this.items = [];
    this.saveItems();
  }

  getDifferences() {
    if (this.items.length < 2) return [];
    const fields = ['price', 'brand', 'rating', 'category', 'inStock'];
    const diffs = [];
    fields.forEach((field) => {
      const firstVal = this.items[0][field];
      const isDiff = this.items.some((item) => item[field] !== firstVal);
      if (isDiff) diffs.push(field);
    });
    return diffs;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractiveProductComparator;
  module.exports.canAddMoreComparatorItems = canAddMoreComparatorItems;
} else {
  window.InteractiveProductComparator = InteractiveProductComparator;
}


function canAddMoreComparatorItems(currentCount, maxAllowed = 4) { return typeof currentCount === 'number' && currentCount < maxAllowed; }

export function getInteractiveProductComparatorStatusHelper37() {
  return { status: "ok", fn: "getInteractiveProductComparatorStatusHelper37" };
}
