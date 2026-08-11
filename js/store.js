/**
 * store.js
 * Centralized State Management using Proxy for reactivity.
 */

class Store {
  constructor(initialState = {}, storageKey = 'app_state') {
    this.storageKey = storageKey;
    this.listeners = [];
    
    const savedState = JSON.parse(localStorage.getItem(this.storageKey)) || {};
    const state = { ...initialState, ...savedState };
    
    const self = this;
    
    this.state = new Proxy(state, {
      set(target, property, value) {
        target[property] = value;
        self.notifyListeners(property, value);
        self.persist();
        return true;
      }
    });
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(property, value) {
    this.listeners.forEach(listener => listener(property, value, this.state));
  }

  persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }
}

// Initialize Global Store
window.appStore = new Store({
  cartItems: [],
  wishlistItems: [],
  user: null,
  theme: 'light'
}, 'cara_global_state');


export function getStoreStatusHelper79() {
  return { status: "ok", fn: "getStoreStatusHelper79" };
}
