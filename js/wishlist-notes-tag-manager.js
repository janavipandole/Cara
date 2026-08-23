/**
 * Wishlist Notes & Tag Manager
 * Provides user notes, custom tagging, filtering, and priority ranking for wishlist items.
 */

var _DANGEROUS_KEYS = { __proto__: 1, constructor: 1, prototype: 1 };
function _isSafeKey(k) { return typeof k === 'symbol' || !(k in _DANGEROUS_KEYS); }

class WishlistNotesTagManager {
  constructor(storageKey = 'cara_wishlist_notes_v2') {
    this.storageKey = storageKey;
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const parsed = stored ? JSON.parse(stored) : {};
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      for (const key of Object.keys(parsed)) {
        if (!_isSafeKey(key)) delete parsed[key];
      }
      return parsed;
    } catch (e) {
      return {};
    }
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      // Silently ignore localStorage failures
    }
  }

  addNote(productId, note) {
    if (!_isSafeKey(productId) || !productId || typeof note !== 'string') {
      return { success: false, message: 'Invalid product ID or note.' };
    }

    if (!this.data[productId]) {
      this.data[productId] = { note: '', tags: [], priority: 0, addedAt: new Date().toISOString() };
    }

    this.data[productId].note = note.trim().slice(0, 300);
    this.saveData();
    return { success: true };
  }

  addTags(productId, tags = []) {
    if (!_isSafeKey(productId) || !productId || !Array.isArray(tags)) {
      return { success: false, message: 'Invalid product ID or tags.' };
    }

    if (!this.data[productId]) {
      this.data[productId] = { note: '', tags: [], priority: 0, addedAt: new Date().toISOString() };
    }

    const cleanTags = tags
      .map((t) => t.trim().toLowerCase().slice(0, 20))
      .filter((t) => t.length > 0);

    const merged = [...new Set([...(this.data[productId].tags || []), ...cleanTags])];
    this.data[productId].tags = merged.slice(0, 10);
    this.saveData();
    return { success: true, tags: this.data[productId].tags };
  }

  setPriority(productId, priority) {
    if (!_isSafeKey(productId)) {
      return { success: false, priority: 0 };
    }
    const validPriority = Math.max(0, Math.min(5, parseInt(priority, 10) || 0));
    if (!this.data[productId]) {
      this.data[productId] = { note: '', tags: [], priority: validPriority, addedAt: new Date().toISOString() };
    } else {
      this.data[productId].priority = validPriority;
    }
    this.saveData();
    return { success: true, priority: validPriority };
  }

  filterByTag(tag) {
    if (!tag) return [];
    const cleanTag = tag.trim().toLowerCase();
    return Object.entries(this.data)
      .filter(([, item]) => (item.tags || []).includes(cleanTag))
      .map(([productId, item]) => ({ productId, ...item }));
  }

  getProductMeta(productId) {
    return this.data[productId] || null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WishlistNotesTagManager;
} else {
  window.WishlistNotesTagManager = WishlistNotesTagManager;
}


export function getWishlistNotesTagManagerStatusHelper93() {
  return { status: "ok", fn: "getWishlistNotesTagManagerStatusHelper93" };
}
