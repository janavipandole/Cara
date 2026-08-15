import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We need to mock localStorage for tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock global window objects
window.logError = vi.fn();

// Dummy safeParseJSON function similar to products.js for testing
function safeParseJSON(key, fallback = '[]') {
  try {
    return JSON.parse(localStorage.getItem(key) || fallback);
  } catch (e) {
    window.logError(`Corrupted localStorage data for "${key}":`, e);
    try {
      return JSON.parse(fallback);
    } catch {
      return [];
    }
  }
}

describe('safeParseJSON utility', () => {
  beforeEach(() => {
    localStorage.clear();
    window.logError.mockClear();
  });

  it('should return default fallback when localStorage is empty', () => {
    const result = safeParseJSON('test_key');
    expect(result).toEqual([]);
  });

  it('should parse valid JSON correctly', () => {
    localStorage.setItem('test_key', JSON.stringify({ item: 1 }));
    const result = safeParseJSON('test_key');
    expect(result).toEqual({ item: 1 });
  });

  it('should fallback and log error on invalid JSON', () => {
    localStorage.setItem('test_key', '{ invalid json }');
    const result = safeParseJSON('test_key');
    expect(result).toEqual([]);
    expect(window.logError).toHaveBeenCalled();
  });
});
