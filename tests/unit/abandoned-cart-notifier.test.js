import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AbandonedCartNotifier } from '../../js/abandoned-cart-notifier.js';

describe('AbandonedCartNotifier', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('triggers notification after idle threshold', () => {
    const spy = vi.fn();
    const notifier = new AbandonedCartNotifier({ idleThresholdMs: 1000, onNotify: spy });
    notifier.startTracking(3);
    
    vi.advanceTimersByTime(1000);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('does not start tracking for an empty cart', () => {
    const spy = vi.fn();
    const notifier = new AbandonedCartNotifier({ idleThresholdMs: 1000, onNotify: spy });
    notifier.startTracking(0);
    vi.advanceTimersByTime(2000);
    expect(spy).not.toHaveBeenCalled();
  });

  it('stops tracking and cancels the pending notification', () => {
    const spy = vi.fn();
    const notifier = new AbandonedCartNotifier({ idleThresholdMs: 1000, onNotify: spy });
    notifier.startTracking(2);
    notifier.stopTracking();
    vi.advanceTimersByTime(2000);
    expect(spy).not.toHaveBeenCalled();
  });

  it('restarts tracking when startTracking is called again', () => {
    const spy = vi.fn();
    const notifier = new AbandonedCartNotifier({ idleThresholdMs: 1000, onNotify: spy });
    notifier.startTracking(2);
    vi.advanceTimersByTime(500);
    notifier.startTracking(3);
    vi.advanceTimersByTime(1000);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('includes promo code, discount percent, and trigger reason in payload', () => {
    const spy = vi.fn();
    const notifier = new AbandonedCartNotifier({ idleThresholdMs: 1000, promoCode: 'SAVE15', discountPercent: 15, onNotify: spy });
    notifier.startTracking(2);
    vi.advanceTimersByTime(1000);
    const payload = spy.mock.calls[0][0];
    expect(payload.title).toContain('cart');
    expect(payload.promoCode).toBe('SAVE15');
    expect(payload.discountPercent).toBe(15);
    expect(payload.triggerReason).toBe('idle');
    expect(typeof payload.timestamp).toBe('number');
  });

  it('supports exit intent mouseleave trigger', () => {
    const spy = vi.fn();
    const notifier = new AbandonedCartNotifier({ idleThresholdMs: 10000, onNotify: spy });
    notifier.startTracking(2);
    
    // Simulate mouseleave near window top
    const event = new Event('mouseleave');
    event.clientY = 5;
    window.dispatchEvent(event);

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0].triggerReason).toBe('exit_intent');
  });

  it('respects dismiss notification state persistence in localStorage', () => {
    const spy = vi.fn();
    const notifier = new AbandonedCartNotifier({ idleThresholdMs: 1000, storageKey: 'test_abandon_cart', onNotify: spy });
    
    notifier.dismissNotification();
    notifier.startTracking(2);
    vi.advanceTimersByTime(2000);
    
    expect(spy).not.toHaveBeenCalled();
  });
});
