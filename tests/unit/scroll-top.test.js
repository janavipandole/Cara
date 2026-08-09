import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('scroll-top.js — scrollToTop and visibility toggle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<button id="scroll-top" style="display:none;">Scroll</button>';
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it('scrollToTop is exposed on window', async () => {
    await import('../../js/scroll-top.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(typeof window.scrollToTop).toBe('function');
  });

  it('scrollToTop is callable without throwing', () => {
    expect(() => window.scrollToTop(400)).not.toThrow();
    vi.runAllTimers();
  });

  it('button starts hidden when scroll position is 0', async () => {
    await import('../../js/scroll-top.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    vi.runAllTimers();
    const btn = document.getElementById('scroll-top');
    expect(btn.style.display).toBe('none');
  });
});
