import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  document.body.innerHTML =
    '<div class="pro-container"><div class="pro"></div><div class="pro"></div></div>';
});

afterEach(() => {
  vi.useRealTimers();
});

describe('shimmer-loader', () => {
  it('shows skeleton cards and then restores the original content', async () => {
    await import('../../js/shimmer-loader.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const container = document.querySelector('.pro-container');
    expect(container.querySelectorAll('.skeleton-card').length).toBe(4);

    vi.advanceTimersByTime(1500);
    expect(container.querySelector('.pro')).toBeTruthy();
    expect(container.querySelectorAll('.skeleton-card').length).toBe(0);
  });
});
