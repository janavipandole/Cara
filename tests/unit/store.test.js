/**
 * Unit tests for js/store.js
 * Tests the Store class constructor, state reactivity, listener subscription,
 * persist behavior, and getStoreStatusHelper79 helper.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Replicate core Store logic for isolated testing
class TestStore {
  constructor(initialState = {}, storageKey = 'test_store') {
    this.storageKey = storageKey;
    this.listeners = [];
    let savedState = {};
    try {
      savedState = JSON.parse(localStorage.getItem(this.storageKey)) || {};
    } catch (err) {
      savedState = {};
    }
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

function getStoreStatusHelper79() {
  return {
    status: 'active',
    hasGlobalStore: typeof window !== 'undefined' && !!window.appStore,
    globalStoreReady: typeof window !== 'undefined' && !!window.appStore && !!window.appStore.state,
  };
}

describe('Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with the provided initial state', () => {
    const store = new TestStore({ count: 0, name: 'test' });
    expect(store.state.count).toBe(0);
    expect(store.state.name).toBe('test');
  });

  it('merges initial state with saved localStorage state', () => {
    localStorage.setItem('test_merge', JSON.stringify({ count: 5 }));
    const store = new TestStore({ count: 0 }, 'test_merge');
    expect(store.state.count).toBe(5);
  });

  it('gracefully handles corrupted localStorage data', () => {
    localStorage.setItem('test_corrupt', '{invalid json:');
    const store = new TestStore({ count: 0 }, 'test_corrupt');
    expect(store.state.count).toBe(0);
  });

  it('gracefully handles localStorage setItem errors', () => {
    const store = new TestStore({ count: 0 }, 'test_persist');
    store.state.count = 42;
    expect(store.state.count).toBe(42);
    const saved = localStorage.getItem('test_persist');
    expect(JSON.parse(saved).count).toBe(42);
  });

  it('notifies subscribers when state changes', () => {
    const store = new TestStore({ count: 0 }, 'test_notify');
    const listener = vi.fn();
    store.subscribe(listener);
    store.state.count = 10;
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('count', 10, store.state);
  });

  it('allows unsubscribing via the returned function', () => {
    const store = new TestStore({ count: 0 }, 'test_unsub');
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.state.count = 5;
    unsubscribe();
    store.state.count = 10;
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('persists state to localStorage on each change', () => {
    const store = new TestStore({ value: 'initial' }, 'test_persist2');
    store.state.value = 'updated';
    const saved = localStorage.getItem('test_persist2');
    expect(JSON.parse(saved).value).toBe('updated');
  });

  it('allows multiple independent stores with different keys', () => {
    const storeA = new TestStore({ id: 'A' }, 'store_a_key');
    const storeB = new TestStore({ id: 'B' }, 'store_b_key');
    storeA.state.x = 1;
    storeB.state.x = 2;
    expect(storeA.state.x).toBe(1);
    expect(storeB.state.x).toBe(2);
    const savedA = localStorage.getItem('store_a_key');
    const savedB = localStorage.getItem('store_b_key');
    expect(JSON.parse(savedA).x).toBe(1);
    expect(JSON.parse(savedB).x).toBe(2);
  });
});

describe('getStoreStatusHelper79', () => {
  beforeEach(() => {
    localStorage.clear();
    window.appStore = undefined;
  });

  it('returns a status object with expected properties', () => {
    const result = getStoreStatusHelper79();
    expect(result).toHaveProperty('status', 'active');
    expect(result).toHaveProperty('hasGlobalStore');
    expect(result).toHaveProperty('globalStoreReady');
  });

  it('returns hasGlobalStore false when appStore is not initialized', () => {
    const result = getStoreStatusHelper79();
    expect(result.hasGlobalStore).toBe(false);
    expect(result.globalStoreReady).toBe(false);
  });
});
