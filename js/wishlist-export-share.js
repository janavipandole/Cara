/**
 * Wishlist Shareable Link Generator & Data Exporter Utility
 * Encodes user wishlist items into URL hashes and generates JSON/CSV data downloads.
 */

export class WishlistExportShare {
  constructor() {}

  encodeWishlistToHash(items = []) {
    if (!Array.isArray(items) || items.length === 0) return '';
    try {
      const payload = items.map(item => ({
        i: item.id || item.name,
        n: item.name,
        p: item.price
      }));
      const jsonStr = JSON.stringify(payload);
      return btoa(encodeURIComponent(jsonStr));
    } catch (err) {
      // Silent fail
      return '';
    }
  }

  decodeHashToWishlist(encodedHash = '') {
    if (!encodedHash) return [];
    try {
      const jsonStr = decodeURIComponent(atob(encodedHash));
      const rawList = JSON.parse(jsonStr);
      return rawList.map(item => ({
        id: item.i,
        name: item.n,
        price: item.p
      }));
    } catch (err) {
      // Silent fail
      return [];
    }
  }

  exportToCSV(items = []) {
    if (!Array.isArray(items) || items.length === 0) return '';
    const headers = ['ID', 'Name', 'Price'];
    const escapeCsv = (value) => {
      const str = value == null ? '' : String(value);
      // Standard CSV escaping: double up embedded quotes, then wrap in quotes.
      return `"${str.replace(/"/g, '""')}"`;
    };
    const rows = items.map(
      (item) =>
        [escapeCsv(item.id), escapeCsv(item.name), escapeCsv(item.price)].join(
          ',',
        ),
    );
    return [headers.join(','), ...rows].join('\n');
  }

  buildShareLink(items = [], origin = '') {
    const hash = this.encodeWishlistToHash(items);
    if (!hash) return '';
    return origin ? `${origin}?wishlist=${hash}` : `?wishlist=${hash}`;
  }

  async copyShareLinkToClipboard(items = [], origin = '') {
    const link = this.buildShareLink(items, origin);
    if (!link) return { ok: false, link: '' };

    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : null;
    if (clipboard && typeof clipboard.writeText === 'function') {
      try {
        await clipboard.writeText(link);
        return { ok: true, link };
      } catch (e) {
        // Fall through and report the link for manual copying.
      }
    }

    return { ok: false, link };
  }
}
