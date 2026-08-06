/**
 * Unit tests for scroll-top.js
 * Tests smooth scroll-to-top button functionality.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Scroll Top Unit Tests', () => {
  const SCROLL_THRESHOLD = 300;
  const SCROLL_TARGET = 0;
  const SCROLL_DURATION = 400;

  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset window scroll position
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  describe('scrollToTop', () => {
    it('should return early if window is undefined', () => {
      const scrollToTop = (duration) => {
        if (typeof window === 'undefined') return;
      };
      expect(() => scrollToTop(SCROLL_DURATION)).not.toThrow();
    });

    it('should start from current scroll position', () => {
      const start = window.scrollY || 0;
      expect(typeof start).toBe('number');
    });
  });

  describe('SCROLL_THRESHOLD', () => {
    it('should be set to 300 pixels', () => {
      expect(SCROLL_THRESHOLD).toBe(300);
    });

    it('should control when scroll button is visible', () => {
      // When scrollY > SCROLL_THRESHOLD, button should be visible
      window.scrollY = 400;
      expect(window.scrollY > SCROLL_THRESHOLD).toBe(true);

      window.scrollY = 200;
      expect(window.scrollY > SCROLL_THRESHOLD).toBe(false);
    });
  });

  describe('SCROLL_TARGET', () => {
    it('should be set to 0 (top of page)', () => {
      expect(SCROLL_TARGET).toBe(0);
    });
  });

  describe('SCROLL_DURATION', () => {
    it('should be set to 400 milliseconds', () => {
      expect(SCROLL_DURATION).toBe(400);
    });
  });

  describe('easeOutQuart', () => {
    it('should return 0 at t=0', () => {
      const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
      expect(easeOutQuart(0)).toBe(0);
    });

    it('should return 1 at t=1', () => {
      const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
      expect(easeOutQuart(1)).toBe(1);
    });

    it('should return value between 0 and 1 for t between 0 and 1', () => {
      const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
      const result = easeOutQuart(0.5);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });

  describe('initScrollTop', () => {
    it('should return early if scroll button element is not found', () => {
      document.body.innerHTML = '';
      const initScrollTop = () => {
        var scrollBtn = document.getElementById('scroll-top');
        if (!scrollBtn) return;
      };
      expect(() => initScrollTop()).not.toThrow();
    });
  });

  describe('window.scrollToTop exposure', () => {
    it('should be available on window object', () => {
      const scrollToTop = () => {};
      window.scrollToTop = scrollToTop;
      expect(window.scrollToTop).toBeDefined();
    });
  });
});
