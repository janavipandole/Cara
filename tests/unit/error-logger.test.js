import { describe, it, vi, beforeEach } from 'vitest';

// Since error-logger.js runs on load and listens to window events,
// we test the exported function getMaxLoggerQueueSize.

describe('error-logger', () => {
  it('should export getMaxLoggerQueueSize returning 50', async () => {
    const mod = await import('../../js/error-logger.js');
    expect(mod.getMaxLoggerQueueSize()).toBe(50);
  });
});
