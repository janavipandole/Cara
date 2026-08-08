/**
 * Wishlist Export & Share Manager
 * Exports wishlist datasets (CSV, JSON), decodes share hashes with image thumbnails, and generates QR code endpoints.
 */
export class WishlistExportShare {
  constructor(options = {}) {
    this.shareBaseUrl = options.shareBaseUrl || 'https://cara.example.com/wishlist';
  }

  encodeWishlistToHash(items = []) {
    if (!items || items.length === 0) return '';
    try {
      const payload = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image || ''
      }));
      const jsonStr = JSON.stringify(payload);
      return typeof btoa !== 'undefined' ? btoa(jsonStr) : Buffer.from(jsonStr).toString('base64');
    } catch (e) {
      return '';
    }
  }

  decodeHashToWishlist(hashStr = '') {
    if (!hashStr) return [];
    try {
      const jsonStr = typeof atob !== 'undefined' ? atob(hashStr) : Buffer.from(hashStr, 'base64').toString('utf8');
      return JSON.parse(jsonStr);
    } catch (e) {
      return [];
    }
  }

  generateShareableLink(items = []) {
    const hash = this.encodeWishlistToHash(items);
    if (!hash) return this.shareBaseUrl;
    return `${this.shareBaseUrl}?shared_wishlist=${encodeURIComponent(hash)}`;
  }

  exportToCSV(items = []) {
    if (!items || items.length === 0) return 'ID,Name,Price\n';
    const header = 'ID,Name,Price\n';
    const rows = items.map(item => `${item.id},"${item.name || ''}",${item.price || 0}`).join('\n');
    return header + rows;
  }

  exportToJSON(items = []) {
    return JSON.stringify(items || [], null, 2);
  }

  generateQRCodeURL(items = [], size = 200) {
    const shareLink = this.generateShareableLink(items);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(shareLink)}`;
  }
}
