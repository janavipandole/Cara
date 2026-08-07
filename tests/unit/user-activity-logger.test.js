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
});
