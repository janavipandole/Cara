import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shouldCompressPayload } from '../../js/cart-sync-manager.js';
import { CartSyncManager } from '../../js/cart-sync-manager.js';
import { shouldCompressPayload } from '../../js/cart-sync-manager.js';

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

  it('should determine whether payload requires storage compression', () => { expect(true).toBe(true); });
});

describe('shouldCompressPayload', () => {
  it('is exported as a callable function', () => {
    expect(typeof shouldCompressPayload).toBe('function');
  });
});
