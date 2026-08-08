import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartSyncManager, shouldCompressPayload } from '../../js/cart-sync-manager.js';

describe('CartSyncManager Unit Tests', () => {
  let cartManager;

  beforeEach(() => {
    localStorage.clear();
    cartManager = new CartSyncManager({ storageKey: 'test_cart', ttlMs: 1000 });
  });

  it('should add items and persist cart to LocalStorage', () => {
    cartManager.addItem({ id: 'item-1', name: 'T-Shirt', price: 29.99 });
    const cart = cartManager.getCart();

    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe('item-1');
    expect(cart[0].quantity).toBe(1);
  });

  it('should increment item quantity when adding duplicate item', () => {
    cartManager.addItem({ id: 'item-1', quantity: 1 });
    cartManager.addItem({ id: 'item-1', quantity: 2 });

    const cart = cartManager.getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
  });

  it('should purge cart items after TTL expiration', async () => {
    cartManager.addItem({ id: 'item-1', name: 'Expired Item' });
    expect(cartManager.getCart()).toHaveLength(1);

    // Fast-forward time past 1000ms TTL
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now + 2000);

    const expiredCart = cartManager.getCart();
    expect(expiredCart).toHaveLength(0);

    vi.restoreAllMocks();
  });

  it('should determine whether payload requires storage compression', () => {
    expect(shouldCompressPayload('x'.repeat(501))).toBe(true);
    expect(shouldCompressPayload('x'.repeat(500))).toBe(false);
    expect(shouldCompressPayload('short')).toBe(false);
  });

  it('keeps distinct id-less items as separate cart entries', () => {
    cartManager.addItem({ name: 'No ID Product A', price: 100 });
    cartManager.addItem({ name: 'No ID Product B', price: 200 });

    const cart = cartManager.getCart();
    expect(cart).toHaveLength(2);
    expect(cart[0].name).toBe('No ID Product A');
    expect(cart[1].name).toBe('No ID Product B');
    expect(cart[0].quantity).toBe(1);
    expect(cart[1].quantity).toBe(1);
  });
});

describe('shouldCompressPayload', () => {
  it('is exported as a callable function', () => {
    expect(typeof shouldCompressPayload).toBe('function');
  });

  it('returns false for non-string payloads', () => {
    expect(shouldCompressPayload(null)).toBe(false);
    expect(shouldCompressPayload(undefined)).toBe(false);
    expect(shouldCompressPayload({ length: 600 })).toBe(false);
  });
});
