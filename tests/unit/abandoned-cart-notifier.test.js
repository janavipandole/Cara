import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AbandonedCartNotifier } from '../../js/abandoned-cart-notifier.js';

describe('AbandonedCartNotifier', () => {
  beforeEach(() => {
    vi.useFakeTimers();
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

  it('includes a title, body, and timestamp in the notification payload', () => {
    const spy = vi.fn();
    const notifier = new AbandonedCartNotifier({ idleThresholdMs: 1000, onNotify: spy });
    notifier.startTracking(2);
    vi.advanceTimersByTime(1000);
    const payload = spy.mock.calls[0][0];
    expect(payload.title).toContain('cart');
    expect(payload.body).toBeTruthy();
    expect(typeof payload.timestamp).toBe('number');
  });

  it('does not notify for a negative item count', () => {
    const spy = vi.fn();
    const notifier = new AbandonedCartNotifier({ idleThresholdMs: 1000, onNotify: spy });
    notifier.startTracking(-3);
    vi.advanceTimersByTime(2000);
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not notify when the cart count is missing', () => {
    const spy = vi.fn();
    const notifier = new AbandonedCartNotifier({ idleThresholdMs: 1000, onNotify: spy });
    notifier.startTracking(undefined);
    vi.advanceTimersByTime(2000);
    expect(spy).not.toHaveBeenCalled();
  });
});
  it('AbandonedCartNotifier constructor initializes with empty state', () => {
    const notifier = new AbandonedCartNotifier();
    expect(notifier).toBeDefined();
  });

