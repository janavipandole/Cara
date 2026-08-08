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
});
