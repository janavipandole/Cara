/**
 * Cart Save For Later Module
 * Moves active cart items to a persistent saved-for-later list.
 */
export class SaveForLaterManager {
  constructor(storageKey = 'cara_saved_items') {
    this.storageKey = storageKey;
  }

  getSavedItems() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch {
      return [];
    }
  }

  saveItem(item) {
    if (!item || !item.id) return false;
    const items = this.getSavedItems();
    if (!items.some(i => i.id === item.id)) {
      items.push(item);
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      return true;
    }
    return false;
  }

  moveToCart(itemId, cartList = []) {
    const items = this.getSavedItems();
    const targetIdx = items.findIndex(i => i.id === itemId);
    if (targetIdx !== -1) {
      const [item] = items.splice(targetIdx, 1);
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      cartList.push(item);
      return item;
    }
    return null;
  }
}
