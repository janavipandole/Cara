/**
 * Shareable Wishlist Link Exporter Engine
 * Serializes wishlist item IDs into a base64 encoded share link and decodes on receive.
 */
export class WishlistShareExporter {
  static exportToShareableLink(items = [], baseUrl = 'https://cara.store/wishlist.html') {
    if (!Array.isArray(items) || items.length === 0) return baseUrl;
    const ids = items.map(item => typeof item === 'object' ? item.id : item).filter(Boolean);
    if (ids.length === 0) return baseUrl;
    // encodeURIComponent keeps btoa from throwing on non-Latin1 characters.
    const encoded = btoa(encodeURIComponent(JSON.stringify(ids)));
    return `${baseUrl}?share=${encodeURIComponent(encoded)}`;
  }

  static parseShareableLink(urlQueryString = '') {
    const params = new URLSearchParams(urlQueryString);
    const shareData = params.get('share');
    if (!shareData) return [];
    try {
      const decoded = decodeURIComponent(atob(shareData));
      return JSON.parse(decoded);
    } catch (err) {
      console.warn('[WishlistShareExporter] Failed to parse shareable link data:', err);
      return [];
    }
  }
}


export function getWishlistShareExporterStatusHelper94() {
  return { status: "ok", fn: "getWishlistShareExporterStatusHelper94" };
}
