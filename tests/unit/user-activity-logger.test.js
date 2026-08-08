import { describe, it, expect, beforeEach } from 'vitest';
import { UserActivityLogger } from '../../js/user-activity-logger.js';

describe('UserActivityLogger', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('logs events with categories and timestamps', () => {
    const logger = new UserActivityLogger({ storageKey: 'test_logs' });
    const log = logger.logEvent('product_view', { productId: 'p123' }, 'catalog');

    expect(log).not.toBeNull();
    expect(log.eventName).toBe('product_view');
    expect(log.category).toBe('catalog');
    expect(log.data.productId).toBe('p123');
    expect(typeof log.timestamp).toBe('number');
  });

  it('filters logs by event category', () => {
    const logger = new UserActivityLogger({ storageKey: 'test_logs' });
    logger.logEvent('page_view', {}, 'navigation');
    logger.logEvent('add_to_cart', {}, 'cart');
    logger.logEvent('checkout_click', {}, 'cart');

    const cartLogs = logger.getLogs('cart');
    expect(cartLogs).toHaveLength(2);
  });

  it('calculates aggregate session summary breakdown', () => {
    const logger = new UserActivityLogger({ storageKey: 'test_logs' });
    logger.logEvent('page_view', {}, 'navigation');
    logger.logEvent('banner_click', {}, 'navigation');
    logger.logEvent('add_to_cart', {}, 'cart');

    const summary = logger.getSessionSummary();
    expect(summary.totalEvents).toBe(3);
    expect(summary.categoryBreakdown.navigation).toBe(2);
    expect(summary.categoryBreakdown.cart).toBe(1);
  });
});
