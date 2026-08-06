import { describe, it, expect, beforeEach } from 'vitest';

// Load via CommonJS export path used in Node/vitest
const CaraCartStore = require('../../js/cart-store.js');

describe('CaraCartStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('migrates cara_shopping_cart items into productsInCart', () => {
    localStorage.setItem(
      'cara_shopping_cart',
      JSON.stringify({
        items: [{ id: 1, name: 'Tee', quantity: 2, price: 10 }],
        timestamp: Date.now(),
      }),
    );

    const items = CaraCartStore.readCart();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Tee');
    expect(localStorage.getItem('productsInCart')).toBeTruthy();
    expect(localStorage.getItem('cara_shopping_cart')).toBeNull();
  });

  it('migrates cara_cart map into productsInCart', () => {
    localStorage.setItem(
      'cara_cart',
      JSON.stringify({
        a1: { name: 'Hoodie', quantity: 1, price: 40 },
        subtotal: 40,
      }),
    );

    const items = CaraCartStore.readCart();
    expect(items.some((i) => i.name === 'Hoodie')).toBe(true);
    expect(localStorage.getItem('cara_cart')).toBeNull();
  });

  it('writes only the canonical key', () => {
    CaraCartStore.writeCart([{ id: 9, name: 'Cap', quantity: 1, price: 5 }]);
    expect(JSON.parse(localStorage.getItem('productsInCart'))[0].id).toBe(9);
    expect(localStorage.getItem('cara_shopping_cart')).toBeNull();
    expect(localStorage.getItem('cara_cart')).toBeNull();
  });
});
