import { readFileSync } from 'fs';
import path from 'path';
import vm from 'vm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('applySharedCart', () => {
  let storage;
  let sandbox;

  beforeEach(() => {
    storage = {
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

    sandbox = {
      window: {},
      localStorage: storage,
      console,
      showToast: vi.fn(),
      loadCart: vi.fn(),
      updateCartCount: vi.fn(),
      closeShareModal: vi.fn(),
      JSON,
      Math,
      Array,
      Object,
    };
    sandbox.window = sandbox;

    sandbox.window.pendingSharedCart = [
      {
        name: 'Shared Tee',
        price: 999,
        quantity: 2,
        size: 'M',
        image: 'shared.jpg',
      },
    ];
    sandbox.window.cachedCartState = [
      {
        name: 'Existing Item',
        price: 1499,
        quantity: 1,
        size: 'L',
        image: 'existing.jpg',
      },
    ];

    const appJsPath = path.resolve(__dirname, '../../app.js');
    const appJs = readFileSync(appJsPath, 'utf8');
    const match = appJs.match(
      /window\.applySharedCart = function \(action\) \{[\s\S]*?\n\};/,
    );

    expect(match).not.toBeNull();
    vm.runInNewContext(match[0], sandbox, { filename: 'app.js' });
  });

  it('merges shared wardrobe items into the current cart state', () => {
    sandbox.window.applySharedCart('merge');

    expect(sandbox.closeShareModal).toHaveBeenCalledTimes(1);

    const cart = JSON.parse(storage.getItem('productsInCart'));
    expect(cart).toHaveLength(2);
    expect(cart[0]).toMatchObject({ name: 'Existing Item' });
    expect(cart[1]).toMatchObject({
      name: 'Shared Tee',
      size: 'M',
      quantity: 2,
    });
    expect(sandbox.window.cachedCartState).toHaveLength(2);
    expect(sandbox.window.cachedCartState[1]).toMatchObject({
      name: 'Shared Tee',
      size: 'M',
      quantity: 2,
    });
  });
});
