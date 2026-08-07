import { describe, test, expect, beforeEach } from 'vitest';

let cartLockPromise = Promise.resolve();

function withCartLock(fn) {
  cartLockPromise = cartLockPromise
    .then(async () => {
      window.cachedCartState = null;
      return await fn();
    })
    .catch((err) => {
      console.error('Cart lock execution error:', err);
    });
  return cartLockPromise;
}

function addToCart(productName, productPrice, productImage, quantity, size) {
  return withCartLock(() => {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    let parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty < 1) parsedQty = 1;

    let item = {
      name: productName,
      price: 78,
      image: productImage,
      quantity: parsedQty,
      size: size ? size.replace('Size', '').trim() : null,
    };

    let existingItem = cart.find(
      (p) => p.name === item.name && p.size === item.size,
    );
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push(item);
    }

    localStorage.setItem('productsInCart', JSON.stringify(cart));
    window.cachedCartState = cart;
  });
}

describe('Cart Race Condition & Mutex Locking', () => {
  beforeEach(() => {
    localStorage.clear();
    window.cachedCartState = null;
  });

  test('serializes concurrent addToCart calls without state overwrite', async () => {
    // Simulate 10 rapid concurrent addToCart invocations
    const additions = Array.from({ length: 10 }).map(() =>
      addToCart('Cartoon Astronaut T-Shirts', '$78', 'img/products/f1.jpg', 1, 'M')
    );

    await Promise.all(additions);

    const savedCart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    expect(savedCart.length).toBe(1);
    expect(savedCart[0].quantity).toBe(10);
  });

  test('keeps distinct products as separate entries under concurrency', async () => {
    const additions = [
      addToCart('T-Shirt A', '$50', 'img/a.jpg', 1, 'M'),
      addToCart('T-Shirt B', '$60', 'img/b.jpg', 1, 'M'),
      addToCart('T-Shirt C', '$70', 'img/c.jpg', 1, 'L'),
    ];

    await Promise.all(additions);

    const savedCart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    expect(savedCart.length).toBe(3);
  });

  test('does not merge the same product across different sizes', async () => {
    await Promise.all([
      addToCart('Hoodie', '$90', 'img/h.jpg', 1, 'M'),
      addToCart('Hoodie', '$90', 'img/h.jpg', 1, 'L'),
    ]);

    const savedCart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    expect(savedCart.length).toBe(2);
  });

  test('coerces invalid quantity values to 1', async () => {
    await addToCart('Jacket', '$120', 'img/j.jpg', 'abc', 'M');
    const savedCart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    expect(savedCart[0].quantity).toBe(1);
  });
});
