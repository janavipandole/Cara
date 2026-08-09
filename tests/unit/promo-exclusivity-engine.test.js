import { beforeEach, describe, expect, it, vi } from 'vitest';

import PromoExclusivityEngine from '../../js/promo-exclusivity-engine.js';

const SITE_WIDE_SALES = { formal: 20 };
const CATALOG = {
  byId: new Map([
    [1, 'formal'],
    [2, 'minimal'],
  ]),
  byName: new Map([
    ['Formal Tee', 'formal'],
    ['Minimal Tee', 'minimal'],
  ]),
};

function buildEngine() {
  return new PromoExclusivityEngine({
    siteWideSales: SITE_WIDE_SALES,
    catalog: CATALOG,
  });
}

const formalCart = [{ id: 1, name: 'Formal Tee', price: 500, quantity: 2 }]; // subtotal 1000
const minimalCart = [{ id: 2, name: 'Minimal Tee', price: 500, quantity: 2 }]; // subtotal 1000
const emptyCart = [];

beforeEach(() => {
  PromoExclusivityEngine.cachedCatalog = null;
  PromoExclusivityEngine.catalogPromise = null;
});

describe('PromoExclusivityEngine', () => {
  it('detects an active site-wide sale', () => {
    expect(buildEngine().isSiteWideSaleActive()).toBe(true);
  });

  it('is inactive when all sales are zero', () => {
    const engine = new PromoExclusivityEngine({
      siteWideSales: { formal: 0 },
      catalog: CATALOG,
    });
    expect(engine.isSiteWideSaleActive()).toBe(false);
  });

  it('computes the site-wide sale discount for matching categories only', () => {
    const result = buildEngine().getSiteWideSaleDiscount(formalCart);
    expect(result.discount).toBe(200);
    expect(result.categories).toEqual(['formal']);
    expect(result.affectedSubtotal).toBe(1000);
  });

  it('does not discount non-sale categories', () => {
    const result = buildEngine().getSiteWideSaleDiscount(minimalCart);
    expect(result.discount).toBe(0);
    expect(result.categories).toEqual([]);
  });

  it('rejects the promo when the sale equals the promo (never stacks)', () => {
    const result = buildEngine().evaluate(formalCart, 20);
    expect(result.conflict).toBe(true);
    expect(result.rejectedSource).toBe('promo');
    expect(result.appliedSource).toBe('sale');
    expect(result.appliedDiscount).toBe(200);
    expect(result.message).toContain('cannot be combined');
  });

  it('applies the promo when it beats the site-wide sale', () => {
    const result = buildEngine().evaluate(formalCart, 30);
    expect(result.conflict).toBe(true);
    expect(result.rejectedSource).toBe('sale');
    expect(result.appliedSource).toBe('promo');
    expect(result.appliedDiscount).toBe(300);
  });

  it('applies the sale when no promo is present', () => {
    const result = buildEngine().evaluate(formalCart, 0);
    expect(result.conflict).toBe(false);
    expect(result.appliedSource).toBe('sale');
    expect(result.appliedDiscount).toBe(200);
  });

  it('applies the promo normally outside a sale category', () => {
    const result = buildEngine().evaluate(minimalCart, 20);
    expect(result.conflict).toBe(false);
    expect(result.appliedSource).toBe('promo');
    expect(result.appliedDiscount).toBe(200);
  });

  it('supports monetary promo values via evaluateByValue', () => {
    const result = buildEngine().evaluateByValue(formalCart, 150);
    expect(result.conflict).toBe(true);
    expect(result.rejectedSource).toBe('promo');
    expect(result.appliedSource).toBe('sale');
    expect(result.appliedDiscount).toBe(200);
  });

  it('handles an empty cart gracefully', () => {
    const result = buildEngine().evaluate(emptyCart, 20);
    expect(result.appliedDiscount).toBe(0);
    expect(result.conflict).toBe(false);
  });

  it('loads and caches the product catalog from the API', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, name: 'Formal Tee', category: 'formal' },
        { id: 2, name: 'Minimal Tee', category: 'minimal' },
      ],
    });

    const catalog = await PromoExclusivityEngine.loadProductCatalog(fetchImpl);
    expect(catalog.byId.get(1)).toBe('formal');
    expect(catalog.byName.get('Minimal Tee')).toBe('minimal');
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const again = await PromoExclusivityEngine.loadProductCatalog(fetchImpl);
    expect(again).toBe(catalog);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
