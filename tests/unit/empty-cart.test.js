import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { safeParseJSON } = require('../../empty-cart.js');

describe('empty-cart safeParseJSON', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('parses valid cart JSON from localStorage', () => {
    localStorage.setItem('productsInCart', JSON.stringify([{ id: 1 }]));
    expect(safeParseJSON('productsInCart')).toEqual([{ id: 1 }]);
  });

  it('falls back when localStorage value is corrupt', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('productsInCart', '{not-json');
    expect(safeParseJSON('productsInCart')).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it('returns empty array when both stored value and fallback are corrupt', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('productsInCart', '{not-json');
    expect(safeParseJSON('productsInCart', '{also-bad')).toEqual([]);
  });
});
