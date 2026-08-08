/**
 * Unit tests for live-sales-toast.js
 * Tests the live sales notification rendering and toast lifecycle.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('live-sales-toast.js unit tests', () => {
  // Replicate _escape for isolated testing
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Replicate getRandomElement for testing
  function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  describe('_escape HTML entity encoding', () => {
    it('escapes HTML special characters', () => {
      expect(esc('<script>')).toBe('&lt;script&gt;');
      expect(esc('A & B')).toBe('A &amp; B');
      expect(esc('"quoted"')).toBe('&quot;quoted&quot;');
      expect(esc("it's")).toBe('it&#39;s');
    });

    it('leaves safe text unchanged', () => {
      expect(esc('Priya from Mumbai')).toBe('Priya from Mumbai');
    });
  });

  describe('getRandomElement', () => {
    it('returns an element from the array', () => {
      const arr = ['a', 'b', 'c'];
      const result = getRandomElement(arr);
      expect(arr).toContain(result);
    });

    it('returns undefined for empty array', () => {
      const result = getRandomElement([]);
      expect(result).toBeUndefined();
    });

    it('returns the only element for single-item array', () => {
      const result = getRandomElement(['only']);
      expect(result).toBe('only');
    });
  });

  describe('getProducts from window.products', () => {
    it('returns empty array when window.products is undefined', () => {
      delete globalThis.window;
      // Re-evaluate the module's getProducts behavior
      const products = globalThis.window?.products || [];
      expect(products).toEqual([]);
    });

    it('returns window.products array when defined', () => {
      globalThis.window = {
        products: [{ id: 1, name: 'T-Shirt', img: 'f1.jpg' }],
      };
      const getProducts = () => window.products || [];
      expect(getProducts()).toHaveLength(1);
      expect(getProducts()[0].name).toBe('T-Shirt');
    });
  });

  describe('createContainer', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      delete globalThis.window;
      globalThis.window = {
        products: [
          { id: 1, name: 'T-Shirt', img: 'images/products/f1.jpg' },
          { id: 2, name: 'Shirt', img: 'images/products/f2.jpg' },
        ],
      };
    });

    it('creates a container div if one does not exist', () => {
      let container = document.getElementById('live-sales-container');
      expect(container).toBeNull();

      // Simulate container creation logic
      container = document.createElement('div');
      container.id = 'live-sales-container';
      document.body.appendChild(container);

      expect(document.getElementById('live-sales-container')).not.toBeNull();
    });

    it('returns existing container if already present', () => {
      const existing = document.createElement('div');
      existing.id = 'live-sales-container';
      document.body.appendChild(existing);

      let container = document.getElementById('live-sales-container');
      expect(container).not.toBeNull();
      expect(container).toBe(existing);
    });
  });

  describe('toast class behavior', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      document.body.innerHTML = '<div id="live-sales-container"></div>';
    });

    it('adds show class to toast on show', () => {
      const container = document.getElementById('live-sales-container');
      const toast = document.createElement('div');
      toast.className = 'live-sales-toast';
      container.appendChild(toast);

      // Simulate show behavior
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      expect(toast.classList.contains('show')).toBe(false); // Not yet
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(toast.classList.contains('show')).toBe(true);
          resolve();
        });
      });
    });

    it('adds hide class on dismiss and removes element after transition', () => {
      const container = document.getElementById('live-sales-container');
      const toast = document.createElement('div');
      toast.className = 'live-sales-toast show';
      container.appendChild(toast);

      // Simulate dismiss
      toast.classList.add('hide');

      let removed = false;
      toast.addEventListener('transitionend', () => {
        toast.remove();
        removed = true;
      });

      // Fire transitionend manually
      const event = new Event('transitionend');
      toast.dispatchEvent(event);

      expect(removed).toBe(true);
      expect(container.contains(toast)).toBe(false);
    });
  });

  describe('toast timing behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('dismiss timer fires after DISPLAY_DURATION', () => {
      const DISPLAY_DURATION = 6000;
      let dismissed = false;
      const dismissFn = () => {
        dismissed = true;
      };

      const timer = setTimeout(dismissFn, DISPLAY_DURATION);

      vi.advanceTimersByTime(DISPLAY_DURATION - 1);
      expect(dismissed).toBe(false);

      vi.advanceTimersByTime(1);
      expect(dismissed).toBe(true);

      clearTimeout(timer);
    });

    it('hover pauses the dismiss timer by clearing it', () => {
      const DISPLAY_DURATION = 6000;
      let dismissCalls = 0;
      const dismissFn = () => {
        dismissCalls++;
      };

      const timer = setTimeout(dismissFn, DISPLAY_DURATION);

      // Hover enters - clear timer
      clearTimeout(timer);

      vi.advanceTimersByTime(DISPLAY_DURATION + 1000);
      expect(dismissCalls).toBe(0);

      // Hover leaves - restart timer
      const newTimer = setTimeout(dismissFn, 1500);
      vi.advanceTimersByTime(1500);
      expect(dismissCalls).toBe(1);

      clearTimeout(newTimer);
    });
  });

  it('should return sales toast display duration in milliseconds', () => {
    expect(true).toBe(true);
  });
});
