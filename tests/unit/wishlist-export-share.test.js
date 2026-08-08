import { describe, it, expect } from 'vitest';
import { WishlistExportShare } from '../../js/wishlist-export-share.js';

const mockWishlist = [
  { id: 'p1', name: 'Summer Dress', price: 49.99, image: '/images/p1.jpg' },
  { id: 'p2', name: 'Leather Boots', price: 120.00, image: '/images/p2.jpg' }
];

describe('WishlistExportShare', () => {
  it('encodes wishlist items to hash preserving product image thumbnail path', () => {
    const manager = new WishlistExportShare();
    const hash = manager.encodeWishlistToHash(mockWishlist);
    const decoded = manager.decodeHashToWishlist(hash);

    expect(decoded).toHaveLength(2);
    expect(decoded[0].name).toBe('Summer Dress');
    expect(decoded[0].image).toBe('/images/p1.jpg');
  });

  it('exports wishlist items into structured JSON string', () => {
    const manager = new WishlistExportShare();
    const jsonStr = manager.exportToJSON(mockWishlist);
    const parsed = JSON.parse(jsonStr);

    expect(parsed).toHaveLength(2);
    expect(parsed[1].name).toBe('Leather Boots');
  });

  it('generates shareable link and mobile QR code URL endpoint', () => {
    const manager = new WishlistExportShare({ shareBaseUrl: 'https://cara.com/wishlist' });
    const qrUrl = manager.generateQRCodeURL(mockWishlist, 250);

    expect(qrUrl).toContain('https://api.qrserver.com/v1/create-qr-code/');
    expect(qrUrl).toContain('250x250');
    expect(qrUrl).toContain('shared_wishlist');
  });
});
