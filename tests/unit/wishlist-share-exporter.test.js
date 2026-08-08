import { describe, it, expect } from 'vitest';
import { WishlistShareExporter } from '../../js/wishlist-share-exporter.js';

describe('WishlistShareExporter', () => {
  it('encodes wishlist product ids to shareable url', () => {
    const items = [{ id: 'p1' }, { id: 'p2' }];
    const url = WishlistShareExporter.exportToShareableLink(items, 'http://localhost/wishlist.html');
    expect(url).toContain('?share=');
    
    const query = url.substring(url.indexOf('?'));
    const parsed = WishlistShareExporter.parseShareableLink(query);
    expect(parsed).toEqual(['p1', 'p2']);
  });

  it('round-trips ids containing non-ASCII characters', () => {
    const items = [{ id: 'p₹1' }, { id: 't−shirt' }];
    const url = WishlistShareExporter.exportToShareableLink(items, 'http://localhost/wishlist.html');
    expect(url).toContain('?share=');
    const query = url.substring(url.indexOf('?'));
    const parsed = WishlistShareExporter.parseShareableLink(query);
    expect(parsed).toEqual(['p₹1', 't−shirt']);
  });

  it('returns the base url when there are no items', () => {
    expect(WishlistShareExporter.exportToShareableLink([], 'http://localhost/wishlist.html')).toBe(
      'http://localhost/wishlist.html',
    );
    expect(WishlistShareExporter.exportToShareableLink('not-array', 'http://localhost/wishlist.html')).toBe(
      'http://localhost/wishlist.html',
    );
  });

  it('returns an empty list for a missing or malformed share param', () => {
    expect(WishlistShareExporter.parseShareableLink('')).toEqual([]);
    expect(WishlistShareExporter.parseShareableLink('?other=1')).toEqual([]);
    expect(WishlistShareExporter.parseShareableLink('?share=%%%bad')).toEqual([]);
  });
});
