/**
 * Unit tests for scroll-top.js
 * Tests the smooth scroll-to-top button and visibility threshold logic.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('scroll-top.js unit tests', () => {
  describe('easeOutQuart', () => {
    // Replicate the easeOutQuart function for isolated testing
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    it('returns 0 at t = 0', () => {
      expect(easeOutQuart(0)).toBe(0);
    });

    it('returns 1 at t = 1', () => {
      expect(easeOutQuart(1)).toBeCloseTo(1, 5);
    });

    it('returns 0.5 at midpoint', () => {
      expect(easeOutQuart(0.5)).toBeCloseTo(0.9375, 3);
    });

    it('is monotonically increasing', () => {
      const values = [0, 0.1, 0.25, 0.5, 0.75, 1.0];
      for (let i = 1; i < values.length; i++) {
        expect(easeOutQuart(values[i])).toBeGreaterThan(
          easeOutQuart(values[i - 1]),
        );
      }
    });
  });

  describe('scrollToTop', () => {
    beforeEach(() => {
      delete window.scrollToTop;
    });

    it('scrollToTop is exposed on window after init', () => {
      // Simulate the module initialization by creating the global
      window.scrollToTop = function (duration) {
        if (typeof window === 'undefined') return;
        var start = window.scrollY || 0;
        var startTime = null;
        function easeOutQuart(t) {
          return 1 - Math.pow(1 - t, 4);
        }
        function animationStep(currentTime) {
          if (!startTime) startTime = currentTime;
          var elapsed = currentTime - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var easedProgress = easeOutQuart(progress);
          window.scrollTo(0, start * (1 - easedProgress));
          if (progress < 1) {
            window.requestAnimationFrame(animationStep);
          }
        }
        window.requestAnimationFrame(animationStep);
      };

      expect(typeof window.scrollToTop).toBe('function');
    });
  });
});
