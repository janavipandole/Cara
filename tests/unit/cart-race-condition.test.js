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

  test('merges items with the same name and size into a single row', async () => {
    await addToCart('Hoodie', '₹1200', 'img/products/f.jpg', 1, 'M');
    await addToCart('Hoodie', '₹1200', 'img/products/f.jpg', 2, 'M');

    const savedCart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    expect(savedCart.length).toBe(1);
    expect(savedCart[0].quantity).toBe(3);
    expect(savedCart[0].size).toBe('M');
  });

  test('keeps items with different sizes as separate rows', async () => {
    await addToCart('Hoodie', '₹1200', 'img/products/f.jpg', 1, 'M');
    await addToCart('Hoodie', '₹1200', 'img/products/f.jpg', 1, 'L');

    const savedCart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    expect(savedCart.length).toBe(2);
  });

  test('merges shop items without a size by name only', async () => {
    await addToCart('Belt', '₹800', 'img/products/f.jpg', 1);
    await addToCart('Belt', '₹800', 'img/products/f.jpg', 1);

    const savedCart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    expect(savedCart.length).toBe(1);
    expect(savedCart[0].quantity).toBe(2);
    expect(savedCart[0].size).toBe(null);
  });
});
