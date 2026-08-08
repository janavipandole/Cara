import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('skeleton-loader.js — CaraSkeleton', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    document.body.innerHTML =
      '<div id="test-container"></div>';
    await import('../../js/skeleton-loader.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it('show() renders skeleton cards into the container', () => {
    const container = document.getElementById('test-container');
    window.CaraSkeleton.show(container, { count: 3 });
    const cards = container.querySelectorAll('.skeleton-card');
    expect(cards.length).toBe(3);
  });

  it('show() renders 4 skeleton blocks per card (image, title, subtitle, meta)', () => {
    const container = document.getElementById('test-container');
    window.CaraSkeleton.show(container, { count: 2 });
    const blocks = container.querySelectorAll('.skeleton-block');
    // 2 cards x 4 blocks each = 8 blocks
    expect(blocks.length).toBe(8);
  });

  it('show() applies correct CSS class for skeleton blocks', () => {
    const container = document.getElementById('test-container');
    window.CaraSkeleton.show(container);
    const firstBlock = container.querySelector('.skeleton-block');
    expect(firstBlock).not.toBeNull();
  });

  it('show() uses default count of 3 when not specified', () => {
    const container = document.getElementById('test-container');
    window.CaraSkeleton.show(container);
    const cards = container.querySelectorAll('.skeleton-card');
    expect(cards.length).toBe(3);
  });

  it('show() replaces container content with skeleton cards', () => {
    const container = document.getElementById('test-container');
    container.innerHTML = '<p>Old content</p>';
    window.CaraSkeleton.show(container);
    expect(container.querySelector('p')).toBeNull();
    expect(container.querySelector('.skeleton-card')).not.toBeNull();
  });

  it('hide() removes skeleton content and restores container', () => {
    const container = document.getElementById('test-container');
    window.CaraSkeleton.show(container);
    expect(container.querySelector('.skeleton-card')).not.toBeNull();
    window.CaraSkeleton.hide(container);
    expect(container.querySelector('.skeleton-card')).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('hide() handles null container gracefully', () => {
    expect(() => {
      window.CaraSkeleton.hide(null);
    }).not.toThrow();
  });

  it('show() injects skeleton CSS into document head', () => {
    const container = document.getElementById('test-container');
    window.CaraSkeleton.show(container);
    const style = document.head.querySelector('style');
    expect(style).not.toBeNull();
    expect(style.textContent).toContain('skeleton-shimmer');
  });

  it('show() is idempotent — second call does not duplicate CSS', () => {
    const container = document.getElementById('test-container');
    window.CaraSkeleton.show(container);
    const firstStyleCount = document.head.querySelectorAll('style').length;
    window.CaraSkeleton.show(container);
    const secondStyleCount = document.head.querySelectorAll('style').length;
    expect(secondStyleCount).toBe(firstStyleCount);
  });
});
