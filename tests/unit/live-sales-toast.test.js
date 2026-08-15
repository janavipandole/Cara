import { describe, it, expect } from 'vitest';

describe('live-sales-toast', () => {
  it('should export getSalesToastDisplayDuration returning a number', async () => {
    const mod = await import('../../js/live-sales-toast.js');
    expect(typeof mod.getSalesToastDisplayDuration()).toBe('number');
  });

  it('should return positive duration value', async () => {
    const mod = await import('../../js/live-sales-toast.js');
    expect(mod.getSalesToastDisplayDuration()).toBeGreaterThan(0);
  });
});
