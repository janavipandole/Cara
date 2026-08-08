import { describe, it, expect, beforeEach } from 'vitest';
import { WishlistExportShare } from '../../js/wishlist-export-share.js';

describe('WishlistExportShare', () => {
  let exporter;

  beforeEach(() => {
    exporter = new WishlistExportShare();
  });

  it('should encode and decode wishlist items to base64 URL hash', () => {
    const items = [{ id: 'p1', name: 'Cotton Shirt', price: 29.99 }];
    const hash = exporter.encodeWishlistToHash(items);
    expect(hash).not.toBe('');

    const decoded = exporter.decodeHashToWishlist(hash);
    expect(decoded.length).toBe(1);
    expect(decoded[0].name).toBe('Cotton Shirt');
  });

  it('should return empty array for malformed hash strings', () => {
    expect(exporter.decodeHashToWishlist('INVALID_BASE_64')).toEqual([]);
  });

  it('should export wishlist items to formatted CSV text', () => {
    const items = [
      { id: 'p1', name: 'Cotton Shirt', price: 29.99 },
      { id: 'p2', name: 'Denim Jeans', price: 49.99 },
    ];
    const csv = exporter.exportToCSV(items);
    expect(csv).toContain('ID,Name,Price');
    expect(csv).toContain('"p1","Cotton Shirt","29.99"');
  });
});
