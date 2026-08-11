import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CartSyncManager, shouldCompressPayload } from '../../js/cart-sync-manager.js';

describe('CartSyncManager Unit Tests', () => {
  let cartManager;
  let mockBroadcastChannel;
  let postedMessages;

  beforeEach(() => {
    localStorage.clear();
    postedMessages = [];

    mockBroadcastChannel = {
      postMessage: vi.fn((msg) => postedMessages.push(msg)),
      close: vi.fn(),
      onmessage: null,
    };

    window.BroadcastChannel = vi.fn().mockImplementation(() => mockBroadcastChannel);

    cartManager = new CartSyncManager({ storageKey: 'test_cart', ttlMs: 1000 });
  });

  afterEach(() => {
    if (cartManager) {
      cartManager.destroy();
    }
    vi.restoreAllMocks();
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

    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now + 2000);

    const expiredCart = cartManager.getCart();
    expect(expiredCart).toHaveLength(0);
  });

  it('keeps distinct id-less items as separate cart entries', () => {
    cartManager.addItem({ name: 'No ID Product A', price: 100 });
    cartManager.addItem({ name: 'No ID Product B', price: 200 });

    const cart = cartManager.getCart();
    expect(cart).toHaveLength(2);
    expect(cart[0].name).toBe('No ID Product A');
    expect(cart[1].name).toBe('No ID Product B');
  });

  it('syncs the cart when a storage event fires for the same key', () => {
    cartManager.addItem({ id: 'item-1', name: 'Local Item' });

    const externalCart = JSON.stringify({
      items: [{ id: 'item-2', name: 'Remote Item', quantity: 1 }],
      timestamp: Date.now(),
    });
    localStorage.setItem('test_cart', externalCart);

    const syncCallback = vi.fn();
    cartManager.onSync(syncCallback);
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'test_cart',
        newValue: externalCart,
      }),
    );

    expect(syncCallback).toHaveBeenCalledTimes(1);
    const syncedCart = syncCallback.mock.calls[0][0];
    expect(syncedCart).toHaveLength(1);
    expect(syncedCart[0].name).toBe('Remote Item');
  });

  it('ignores storage events for unrelated keys', () => {
    cartManager.addItem({ id: 'item-1', name: 'Local Item' });
    const syncCallback = vi.fn();
    cartManager.onSync(syncCallback);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'unrelated_key',
        newValue: JSON.stringify([{ id: 'x' }]),
      }),
    );

    expect(syncCallback).not.toHaveBeenCalled();
  });

  it('broadcasts state mutations via BroadcastChannel', () => {
    cartManager.addItem({ id: 'item-100', quantity: 2 });
    expect(mockBroadcastChannel.postMessage).toHaveBeenCalled();
    expect(postedMessages).toHaveLength(1);
    expect(postedMessages[0].type).toBe('ITEM_ADDED');
    expect(postedMessages[0].senderTabId).toBe(cartManager.tabId);
  });

  it('resolves conflicts by capping item quantity to maximum limit', () => {
    cartManager.addItem({ id: 'item-large', quantity: 150 });
    const cart = cartManager.getCart();
    expect(cart[0].quantity).toBe(99);
  });

  it('handles remote BroadcastChannel messages and notifies listener', () => {
    const syncCallback = vi.fn();
    cartManager.onSync(syncCallback);

    const remoteMsg = {
      type: 'COUPON_APPLIED',
      senderTabId: 'remote_tab_999',
      vectorClock: 5,
      payload: { couponCode: 'SAVE20' },
    };

    mockBroadcastChannel.onmessage({ data: remoteMsg });

    expect(syncCallback).toHaveBeenCalledWith(expect.any(Array), 'COUPON_APPLIED', remoteMsg);
  });
});

describe('shouldCompressPayload', () => {
  it('is exported as a callable function', () => {
    expect(typeof shouldCompressPayload).toBe('function');
    expect(shouldCompressPayload('a'.repeat(600))).toBe(true);
    expect(shouldCompressPayload('short')).toBe(false);
  });
});
