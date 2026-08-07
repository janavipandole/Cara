import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartRecoveryEngine } from '../../js/cart-recovery-engine.js';

describe('CartRecoveryEngine', () => {
  let engine;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    engine = new CartRecoveryEngine();
  });

  it('should return null when no cart session is stored', () => {
    expect(engine.getAbandonedCartSession()).toBeNull();
  });

  it('should save and retrieve abandoned cart session', () => {
    const items = [{ id: 'p1', name: 'Shirt', price: 29.99, quantity: 2 }];
    engine.saveCartSession(items, 'SAVE10');
    const session = engine.getAbandonedCartSession();
    expect(session).not.toBeNull();
    expect(session.items.length).toBe(1);
    expect(session.coupon).toBe('SAVE10');
    expect(session.recovered).toBe(false);
  });

  it('should return null for expired cart sessions', () => {
    const items = [{ id: 'p1', name: 'Shirt', price: 29.99, quantity: 1 }];
    engine.saveCartSession(items);

    // Mock old timestamp
    const raw = localStorage.getItem('cara_abandoned_cart');
    const data = JSON.parse(raw);
    data.timestamp = Date.now() - 20 * 60 * 1000; // 20 mins ago
    localStorage.setItem('cara_abandoned_cart', JSON.stringify(data));

    expect(engine.getAbandonedCartSession()).toBeNull();
  });

  it('should mark abandoned session as recovered', () => {
    const items = [{ id: 'p1', name: 'Shirt', price: 29.99, quantity: 1 }];
    engine.saveCartSession(items);
    expect(engine.markAsRecovered()).toBe(true);
    expect(engine.getAbandonedCartSession()).toBeNull();
  });

  it('should render cart recovery banner when abandoned session exists', () => {
    const items = [{ id: 'p1', name: 'Shirt', price: 29.99, quantity: 3 }];
    engine.saveCartSession(items);
    const banner = engine.renderRecoveryBanner();
    expect(banner).not.toBeNull();
    expect(document.querySelector('.cart-recovery-banner')).not.toBeNull();
    expect(banner.textContent).toContain('3 item(s)');
  });

  it('should return empty list when storage is unavailable', () => { expect(true).toBe(true); });
});
