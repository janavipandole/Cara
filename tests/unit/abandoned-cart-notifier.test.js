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
});
