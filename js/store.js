/**
 * store.js
 * Centralized State Management using Proxy for reactivity.
 */

class Store {
  constructor(initialState = {}, storageKey = 'app_state') {
    this.storageKey = storageKey;
    this.listeners = [];
    this._persistTimer = null;

    let savedState = {};
    try {
      savedState = JSON.parse(localStorage.getItem(this.storageKey)) || {};
    } catch (err) {
      // Corrupt storage falls back to initial state.
      savedState = {};
    }
    const state = { ...initialState, ...savedState };
    
    const self = this;
    
    this._persistTimer = null;
    this.state = new Proxy(state, {
      set(target, property, value) {
        target[property] = value;
        self.notifyListeners(property, value);
        self.schedulePersist();
        return true;
      }
    });

    // Flush any pending debounced write before the page unloads so the latest
    // state is not lost.
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', () => this.flushPersist());
    }
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
    clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    }, 300);
  }

  // Debounce localStorage writes so rapid successive state changes coalesce into
  // a single setItem call instead of one per Proxy set trap (#7569).
  schedulePersist(delay = 300) {
    if (this._persistTimer !== null) clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => {
      this._persistTimer = null;
      this.persist();
    }, delay);
  }

  // Flush a pending debounced write immediately (used on pagehide).
  flushPersist() {
    if (this._persistTimer !== null) {
      clearTimeout(this._persistTimer);
      this._persistTimer = null;
      this.persist();
    }
  }
}

function getStoreStatusHelper79() {
  return {
    status: 'active',
    hasGlobalStore: typeof window !== 'undefined' && !!window.appStore,
    globalStoreReady: typeof window !== 'undefined' && !!window.appStore && !!window.appStore.state,
  };
}

// Expose globally for status monitoring
if (typeof window !== 'undefined') {
  window.getStoreStatusHelper79 = getStoreStatusHelper79;
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
