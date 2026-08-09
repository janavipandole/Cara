/**
 * Promo Exclusivity Engine (#6296)
 *
 * Enforces a strict "Best Offer Only" pricing rule: a promo code can NEVER be
 * stacked on top of an automatically-applied site-wide sale. When a conflict
 * is detected the engine keeps only the discount that delivers the better
 * value to the customer and rejects the other — patching the discount
 * stacking exploit that mathematically destroyed line-item profit margins.
 *
 * Site-wide sales are declared per product category in
 * `CARA_CONFIG.SITE_WIDE_SALES` (e.g. `{ formal: 20 }` => 20% off all formal
 * items). Cart items are persisted without a category field, so the engine
 * resolves each item's category from the product catalog fetched via
 * `loadProductCatalog()`.
 */

class PromoExclusivityEngine {
  /**
   * Fetch (and cache) the product catalog so cart items can be resolved to
   * their category for site-wide sale matching.
   * @param {Function} [fetchImpl] - injectable fetch for tests
   * @returns {Promise<{byId: Map, byName: Map}>}
   */
  static loadProductCatalog(fetchImpl) {
    if (PromoExclusivityEngine.cachedCatalog) {
      return Promise.resolve(PromoExclusivityEngine.cachedCatalog);
    }
    if (PromoExclusivityEngine.catalogPromise) {
      return PromoExclusivityEngine.catalogPromise;
    }

    const doFetch = fetchImpl || ((url, opts) => window.fetch(url, opts));
    const baseUrl =
      (typeof window !== 'undefined' && window.CARA_API_BASE_URL) || '';

    PromoExclusivityEngine.catalogPromise = doFetch(
      `${baseUrl}/api/products/`,
      {
        credentials: 'include',
      },
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load product catalog: ${res.status}`);
        }
        return res.json();
      })
      .then((products) => {
        const byId = new Map();
        const byName = new Map();
        for (const product of Array.isArray(products) ? products : []) {
          if (product.id != null)
            byId.set(Number(product.id), product.category || '');
          if (product.name) byName.set(product.name, product.category || '');
        }
        PromoExclusivityEngine.cachedCatalog = { byId, byName };
        return PromoExclusivityEngine.cachedCatalog;
      })
      .catch((err) => {
        PromoExclusivityEngine.catalogPromise = null;
        throw err;
      });

    return PromoExclusivityEngine.catalogPromise;
  }

  constructor(options = {}) {
    this.siteWideSales =
      options.siteWideSales ||
      (typeof window !== 'undefined' &&
        window.CARA_CONFIG &&
        window.CARA_CONFIG.SITE_WIDE_SALES) ||
      {};
    this.catalog =
      options.catalog || PromoExclusivityEngine.cachedCatalog || null;
    this.siteWideSaleMessage =
      options.siteWideSaleMessage ||
      'This promo code cannot be combined with existing site-wide sales.';
  }

  isSiteWideSaleActive() {
    return Object.keys(this.siteWideSales).some(
      (category) => Number(this.siteWideSales[category]) > 0,
    );
  }

  /**
   * Resolve a cart item's category from an explicit value, the product id, or
   * the product name (in that order of confidence).
   * @returns {string}
   */
  resolveCategory(item = {}) {
    if (item.category) return String(item.category).toLowerCase();
    if (!this.catalog) return '';
    const byId = this.catalog.byId;
    const byName = this.catalog.byName;
    if (item.id != null && byId && byId.has(Number(item.id))) {
      return String(byId.get(Number(item.id))).toLowerCase();
    }
    if (item.name && byName && byName.has(item.name)) {
      return String(byName.get(item.name)).toLowerCase();
    }
    return '';
  }

  /**
   * Compute the auto-applied site-wide sale discount for a cart.
   * @param {Array<{name?, id?, category?, price, quantity?}>} cart
   * @returns {{discount: number, categories: string[], affectedSubtotal: number}}
   */
  getSiteWideSaleDiscount(cart = []) {
    if (!this.isSiteWideSaleActive()) {
      return { discount: 0, categories: [], affectedSubtotal: 0 };
    }

    let discount = 0;
    let affectedSubtotal = 0;
    const categories = [];

    for (const item of cart) {
      const category = this.resolveCategory(item);
      const pct = Number(this.siteWideSales[category]);
      if (!pct || pct <= 0) continue;

      const price = parseFloat(item && item.price) || 0;
      const qty = parseInt(item && item.quantity, 10) || 1;
      const subtotal = price * qty;
      affectedSubtotal += subtotal;
      discount += (subtotal * pct) / 100;

      if (!categories.includes(category)) categories.push(category);
    }

    return {
      discount: Number(discount.toFixed(2)),
      categories,
      affectedSubtotal: Number(affectedSubtotal.toFixed(2)),
    };
  }

  /**
   * Best-Offer-Only evaluation.
   *
   * @param {Array} cart       - cart items (category resolved internally)
   * @param {number} couponPct - promo code discount percent (0 = no coupon)
   * @returns {{
   *   siteWideDiscount: number,
   *   promoDiscount: number,
   *   appliedDiscount: number,
   *   appliedSource: 'sale'|'promo'|'none',
   *   rejectedSource: 'sale'|'promo'|null,
   *   conflict: boolean,
   *   categories: string[],
   *   message: string|null
   * }}
   */
  evaluate(cart = [], couponPct = 0) {
    const subtotal = this._cartSubtotal(cart);
    const promoDiscount = Number(
      ((subtotal * (Number(couponPct) || 0)) / 100).toFixed(2),
    );
    return this._decide(cart, subtotal, promoDiscount);
  }

  /**
   * Same best-offer-only decision, but the promo discount is supplied as a
   * monetary value (useful for flat-amount or free-shipping coupon types).
   */
  evaluateByValue(cart = [], promoDiscountValue = 0) {
    const subtotal = this._cartSubtotal(cart);
    return this._decide(cart, subtotal, Number(promoDiscountValue) || 0);
  }

  _cartSubtotal(cart) {
    return cart.reduce((sum, item) => {
      const price = parseFloat(item && item.price) || 0;
      const qty = parseInt(item && item.quantity, 10) || 1;
      return sum + price * qty;
    }, 0);
  }

  _decide(cart, subtotal, promoDiscount) {
    const { discount: siteWideDiscount, categories } =
      this.getSiteWideSaleDiscount(cart);

    const hasSale = siteWideDiscount > 0;
    const hasPromo = promoDiscount > 0 && subtotal > 0;

    // No conflict: apply whichever single discount is present.
    if (!hasSale || !hasPromo) {
      return {
        siteWideDiscount,
        promoDiscount,
        appliedDiscount: hasSale ? siteWideDiscount : promoDiscount,
        appliedSource: hasSale ? 'sale' : hasPromo ? 'promo' : 'none',
        rejectedSource: null,
        conflict: false,
        categories,
        message: null,
      };
    }

    // Conflict — stacking is forbidden. Keep only the better offer.
    const saleWins = siteWideDiscount >= promoDiscount;
    return {
      siteWideDiscount,
      promoDiscount,
      appliedDiscount: saleWins ? siteWideDiscount : promoDiscount,
      appliedSource: saleWins ? 'sale' : 'promo',
      rejectedSource: saleWins ? 'promo' : 'sale',
      conflict: true,
      categories,
      message: saleWins ? this.siteWideSaleMessage : null,
    };
  }
}

PromoExclusivityEngine.cachedCatalog = null;
PromoExclusivityEngine.catalogPromise = null;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromoExclusivityEngine;
} else {
  window.PromoExclusivityEngine = PromoExclusivityEngine;
}
