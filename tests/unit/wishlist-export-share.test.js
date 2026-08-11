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
      { id: 'p2', name: 'Denim Jeans', price: 49.99 }
    ];
    const csv = exporter.exportToCSV(items);
    expect(csv).toContain('ID,Name,Price');
    expect(csv).toContain('"p1","Cotton Shirt","29.99"');
  });

  it('should escape embedded quotes in CSV fields', () => {
    const items = [
      { id: 'p3', name: 'T-Shirt "Classic" Edition', price: 19.99 }
    ];
    const csv = exporter.exportToCSV(items);
    expect(csv).toContain('"p3","T-Shirt ""Classic"" Edition","19.99"');
    // The quoted field must remain a single parseable column.
    const nameField = csv.split('\n')[1].split(',')[1];
    expect(nameField.startsWith('"')).toBe(true);
    expect(nameField.endsWith('"')).toBe(true);
  });

  it('returns the link for manual copying when clipboard is unavailable', async () => {
    // Ensure navigator.clipboard is undefined.
    const originalClipboard = global.navigator.clipboard;
    Object.defineProperty(global.navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
    try {
      const res = await exporter.copyShareLinkToClipboard(
        [{ id: 'p1', name: 'Tee' }],
        'http://localhost/wishlist.html',
      );
      expect(res.ok).toBe(false);
      expect(res.link).toContain('?wishlist=');
    } finally {
      Object.defineProperty(global.navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true,
      });
    }
  });

  it('returns the link for manual copying when clipboard.writeText fails', async () => {
    Object.defineProperty(global.navigator, 'clipboard', {
      value: {
        writeText: () => Promise.reject(new Error('denied')),
      },
      configurable: true,
    });
    try {
      const res = await exporter.copyShareLinkToClipboard(
        [{ id: 'p1', name: 'Tee' }],
        'http://localhost/wishlist.html',
      );
      expect(res.ok).toBe(false);
      expect(res.link).toContain('?wishlist=');
    } finally {
      delete global.navigator.clipboard;
    }
  });

  it('returns ok when the clipboard write succeeds', async () => {
    Object.defineProperty(global.navigator, 'clipboard', {
      value: {
        writeText: () => Promise.resolve(),
      },
      configurable: true,
    });
    try {
      const res = await exporter.copyShareLinkToClipboard(
        [{ id: 'p1', name: 'Tee' }],
        'http://localhost/wishlist.html',
      );
      expect(res.ok).toBe(true);
      expect(res.link).toContain('?wishlist=');
    } finally {
      delete global.navigator.clipboard;
    }
  });
});
