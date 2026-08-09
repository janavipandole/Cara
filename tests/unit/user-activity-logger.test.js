import { describe, it, expect, beforeEach } from 'vitest';
import { UserActivityLogger } from '../../js/user-activity-logger.js';

describe('UserActivityLogger', () => {
  let logger;

  beforeEach(() => {
    localStorage.clear();
    logger = new UserActivityLogger('test_logs');
  });

  it('persists event logs in localStorage', () => {
    logger.logEvent('ADD_TO_CART', { productId: 'p1' });
    const logs = logger.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].event).toBe('ADD_TO_CART');
  });

  it('stores the payload and a timestamp with each event', () => {
    logger.logEvent('PAGE_VIEW', { page: 'shop' });
    const logs = logger.getLogs();
    expect(logs[0].payload).toEqual({ page: 'shop' });
    expect(typeof logs[0].timestamp).toBe('string');
    expect(Number.isNaN(Date.parse(logs[0].timestamp))).toBe(false);
  });

  it('caps the stored log entries at the max limit', () => {
    for (let i = 0; i < 60; i++) {
      logger.logEvent('EVENT_' + i);
    }
    const logs = logger.getLogs();
    expect(logs.length).toBe(50);
    expect(logs[0].event).toBe('EVENT_10');
  });

  it('clears all stored logs', () => {
    logger.logEvent('ADD_TO_CART');
    logger.clearLogs();
    expect(logger.getLogs()).toEqual([]);
  });

  it('recovers from corrupt storage gracefully', () => {
    localStorage.setItem('test_logs', '{corrupt-json');
    expect(logger.getLogs()).toEqual([]);
    logger.logEvent('AFTER_CORRUPT');
    expect(logger.getLogs().length).toBe(1);
  });
});
