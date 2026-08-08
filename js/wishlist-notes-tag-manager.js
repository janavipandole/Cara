/**
 * Wishlist Notes & Tag Manager
 * Allows shoppers to attach notes, custom tags, tag removal, priority flags, and price drop alert thresholds.
 */
export class WishlistNotesTagManager {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'cara_wishlist_metadata';
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (typeof localStorage === 'undefined') return {};
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveData() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      }
    } catch (e) {}
  }

  getItemMeta(productId) {
    return this.data[productId] || { notes: '', tags: [], priority: 'NORMAL', targetPriceAlert: null };
  }

  setNote(productId, noteText) {
    const item = this.getItemMeta(productId);
    item.notes = String(noteText || '').trim();
    this.data[productId] = item;
    this.saveData();
    return item;
  }

  addTag(productId, tag) {
    const cleanTag = String(tag || '').trim().toLowerCase();
    if (!cleanTag) return this.getItemMeta(productId);

    const item = this.getItemMeta(productId);
    if (!item.tags.includes(cleanTag)) {
      item.tags.push(cleanTag);
      this.data[productId] = item;
      this.saveData();
    }
    return item;
  }

  removeTag(productId, tagToRemove) {
    const cleanTag = String(tagToRemove || '').trim().toLowerCase();
    const item = this.getItemMeta(productId);
    item.tags = item.tags.filter(t => t !== cleanTag);
    this.data[productId] = item;
    this.saveData();
    return item;
  }

  setPriority(productId, priorityLevel = 'NORMAL') {
    const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'MUST_HAVE'];
    const priority = String(priorityLevel).toUpperCase();
    
    const item = this.getItemMeta(productId);
    item.priority = validPriorities.includes(priority) ? priority : 'NORMAL';
    this.data[productId] = item;
    this.saveData();
    return item;
  }

  setTargetPriceAlert(productId, targetPrice) {
    const item = this.getItemMeta(productId);
    item.targetPriceAlert = targetPrice ? Number(targetPrice) : null;
    this.data[productId] = item;
    this.saveData();
    return item;
  }

  filterByTag(tag) {
    const targetTag = String(tag || '').trim().toLowerCase();
    const matchingProductIds = [];
    Object.keys(this.data).forEach(id => {
      if (this.data[id].tags && this.data[id].tags.includes(targetTag)) {
        matchingProductIds.push(id);
      }
    });
    return matchingProductIds;
  }
}
