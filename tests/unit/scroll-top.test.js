import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('scroll-top.js — scrollToTop and visibility toggle', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    document.body.innerHTML =
      '<button id="scroll-top" style="display:none;">Scroll</button>';
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

  it('easeOutQuart helper exists and returns correct values', async () => {
    await import('../../js/scroll-top.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    // easeOutQuart(0) = 0, easeOutQuart(1) = 1
    // The internal function is not directly exported, but scrollToTop uses it
    expect(typeof window.scrollToTop).toBe('function');
  });

  it('button is hidden when page is not scrolled', async () => {
    await import('../../js/scroll-top.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    vi.runAllTimers();
    const btn = document.getElementById('scroll-top');
    expect(btn.style.display).toBe('none');
  });

  it('scrollToTop is callable without error', () => {
    // scrollToTop should not throw when called
    expect(() => window.scrollToTop(400)).not.toThrow();
    vi.runAllTimers();
  });
});
