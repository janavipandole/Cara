import { readFileSync } from 'fs';
import path from 'path';
import vm from 'vm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createStorage() {
  return {
    data: new Map(),
    getItem(key) {
      return this.data.has(key) ? this.data.get(key) : null;
    },
    setItem(key, value) {
      this.data.set(key, String(value));
    },
    removeItem(key) {
      this.data.delete(key);
    },
    clear() {
      this.data.clear();
    },
  };
}

class FakeBroadcastChannel {
  static instances = [];

  constructor(name) {
    this.name = name;
    this.messages = [];
    FakeBroadcastChannel.instances.push(this);
  }

  postMessage(message) {
    this.messages.push(message);
  }

  close() {}
}

function extractCartSyncBlock(appJs) {
  const match = appJs.match(
    /const CART_BROADCAST_CHANNEL_NAME = 'cara_cart_state_sync';[\s\S]*?\n\}\);/,
  );
  expect(match).not.toBeNull();
  return match[0];
}

describe('Multi-Tab Cart State Synchronization (#7558)', () => {
  let storage;
  let sandbox;
  let channel;
  let updateCartCount;
  let handleEmptyCartView;
  let loadCart;
  let storageHandler;

  beforeEach(() => {
    FakeBroadcastChannel.instances = [];
    storage = createStorage();

    updateCartCount = vi.fn();
    handleEmptyCartView = vi.fn();
    loadCart = vi.fn();
    const addEventListener = vi.fn((event, handler) => {
      if (event === 'storage') storageHandler = handler;
    });

    const documentStub = {
      getElementById(id) {
        return id === 'cart-items-container' ? {} : null;
      },
    };

    sandbox = {
      window: {},
      document: documentStub,
      localStorage: storage,
      BroadcastChannel: FakeBroadcastChannel,
      console,
      safeParseJSON(key, fallback = []) {
        try {
          const raw = storage.getItem(key);
          const parsed = raw ? JSON.parse(raw) : fallback;
          return parsed == null ? fallback : parsed;
        } catch (e) {
          return fallback;
        }
      },
      updateCartCount,
      handleEmptyCartView,
      loadCart: () => {},
    };
    sandbox.window = {
      logError: vi.fn(),
      cachedCartState: null,
      loadCart,
      addEventListener,
    };

    const appJsPath = path.resolve(__dirname, '../../app.js');
    const appJs = readFileSync(appJsPath, 'utf8');
    const block = extractCartSyncBlock(appJs);
    vm.runInNewContext(block, sandbox, { filename: 'app.js' });

    channel = FakeBroadcastChannel.instances[0];
  });

  it('registers a BroadcastChannel named cara_cart_state_sync', () => {
    expect(FakeBroadcastChannel.instances).toHaveLength(1);
    expect(channel.name).toBe('cara_cart_state_sync');
  });

  it('broadcasts a CART_UPDATED message with the serialized cart state', () => {
    const cart = [{ id: 1, name: 'T-Shirt', quantity: 2 }];
    sandbox.window.broadcastCartState(cart);

    expect(channel.messages).toHaveLength(1);
    expect(channel.messages[0]).toMatchObject({
      type: 'CART_UPDATED',
      payload: cart,
    });
  });

  it('re-syncs local memory and re-renders UI on a remote cart update', () => {
    sandbox.window.cachedCartState = [{ id: 1, name: 'Stale Item' }];
    const remoteCart = [{ id: 9, name: 'Fresh Item', quantity: 1 }];

    channel.onmessage({
      data: {
        type: 'CART_UPDATED',
        payload: remoteCart,
        sourceTabId: 'other-tab',
      },
    });

    expect(sandbox.window.cachedCartState).toEqual(remoteCart);
    expect(updateCartCount).toHaveBeenCalledTimes(1);
    expect(handleEmptyCartView).toHaveBeenCalledTimes(1);
    expect(loadCart).toHaveBeenCalledTimes(1);
  });

  it('ignores messages originating from the same tab', () => {
    sandbox.window.broadcastCartState([{ id: 1, name: 'Echo Item' }]);
    const echoed = channel.messages[0];

    channel.onmessage({ data: echoed });

    expect(sandbox.window.cachedCartState).toBeNull();
    expect(updateCartCount).not.toHaveBeenCalled();
  });

  it('ignores messages that are not CART_UPDATED', () => {
    channel.onmessage({ data: { type: 'OTHER_EVENT', payload: [] } });
    expect(updateCartCount).not.toHaveBeenCalled();
  });

  it('falls back to reading localStorage when no cart argument is passed', () => {
    storage.setItem('productsInCart', JSON.stringify([{ id: 3, name: 'A' }]));
    sandbox.window.broadcastCartState();

    expect(channel.messages).toHaveLength(1);
    expect(channel.messages[0].payload).toEqual([{ id: 3, name: 'A' }]);
  });

  it('skips the storage fallback re-render for an already-broadcast state', () => {
    const remoteCart = [{ id: 5, name: 'Synced Item' }];
    channel.onmessage({
      data: { type: 'CART_UPDATED', payload: remoteCart, sourceTabId: 't2' },
    });
    const callsAfterBroadcast = updateCartCount.mock.calls.length;

    storageHandler({ key: 'productsInCart', newValue: JSON.stringify(remoteCart) });
    expect(updateCartCount.mock.calls.length).toBe(callsAfterBroadcast);

    storageHandler({ key: 'productsInCart', newValue: JSON.stringify([{ id: 6 }]) });
    expect(updateCartCount.mock.calls.length).toBe(callsAfterBroadcast + 1);
  });

  it('degrades gracefully when BroadcastChannel is unavailable', () => {
    const noChannelSandbox = {
      window: { logError: vi.fn(), addEventListener: vi.fn() },
      document: { getElementById: () => null },
      localStorage: createStorage(),
      console,
    };
    noChannelSandbox.window.cachedCartState = null;

    const appJsPath = path.resolve(__dirname, '../../app.js');
    const appJs = readFileSync(appJsPath, 'utf8');
    const block = extractCartSyncBlock(appJs);
    expect(() =>
      vm.runInNewContext(block, noChannelSandbox, { filename: 'app.js' }),
    ).not.toThrow();

    expect(() => noChannelSandbox.window.broadcastCartState([])).not.toThrow();
  });
});
