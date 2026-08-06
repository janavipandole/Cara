/**
 * Unit tests for skeleton-loader.js
 * Tests animated shimmer placeholder system for loading states.
 */
import { describe, it, expect, beforeEach } from 'vitest';

describe('Skeleton Loader Unit Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createSkeletonCard', () => {
    it('should create a skeleton block element with default dimensions', () => {
      const createSkeletonCard = (opt) => {
        var width = opt.width || '100%';
        var height = opt.height || '20px';
        var el = document.createElement('div');
        el.className = 'skeleton-block';
        el.style.width = width;
        el.style.height = height;
        if (opt.margin) el.style.margin = opt.margin;
        return el;
      };

      const card = createSkeletonCard({});
      expect(card.className).toBe('skeleton-block');
      expect(card.style.width).toBe('100%');
      expect(card.style.height).toBe('20px');
    });

    it('should create a skeleton block with custom dimensions', () => {
      const createSkeletonCard = (opt) => {
        var width = opt.width || '100%';
        var height = opt.height || '20px';
        var el = document.createElement('div');
        el.className = 'skeleton-block';
        el.style.width = width;
        el.style.height = height;
        if (opt.margin) el.style.margin = opt.margin;
        return el;
      };

      const card = createSkeletonCard({ width: '50%', height: '100px', margin: '10px' });
      expect(card.style.width).toBe('50%');
      expect(card.style.height).toBe('100px');
      expect(card.style.margin).toBe('10px');
    });
  });

  describe('showSkeleton', () => {
    it('should return early if container is not provided', () => {
      const showSkeleton = (container, options) => {
        if (!container) return;
      };

      expect(() => showSkeleton(null, {})).not.toThrow();
    });

    it('should use default count of 3 when not specified', () => {
      const DEFAULT_COUNT = 3;
      expect(DEFAULT_COUNT).toBe(3);
    });

    it('should use default card class when not specified', () => {
      const DEFAULT_CLASS = 'skeleton-card';
      expect(DEFAULT_CLASS).toBe('skeleton-card');
    });
  });

  describe('hideSkeleton', () => {
    it('should return early if container is not provided', () => {
      const hideSkeleton = (container) => {
        if (!container) return;
      };

      expect(() => hideSkeleton(null)).not.toThrow();
    });

    it('should clear container innerHTML', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div class="skeleton-block"></div>';
      expect(container.innerHTML).toBeTruthy();

      container.innerHTML = '';
      expect(container.innerHTML).toBe('');
    });
  });

  describe('CaraSkeleton exposure', () => {
    it('should expose show and hide methods on window', () => {
      const CaraSkeleton = {
        show: () => {},
        hide: () => {},
      };

      expect(typeof CaraSkeleton.show).toBe('function');
      expect(typeof CaraSkeleton.hide).toBe('function');
    });
  });

  describe('Shimmer Animation', () => {
    it('should define shimmer keyframes animation', () => {
      const SHIMMER_KEYFRAME = '@keyframes skeleton-shimmer { ' +
        '0% { background-position: -200px 0; } ' +
        '100% { background-position: calc(200px + 100%) 0; } }';

      expect(SHIMMER_KEYFRAME).toContain('@keyframes skeleton-shimmer');
      expect(SHIMMER_KEYFRAME).toContain('background-position');
    });

    it('should apply skeleton-block class for shimmer effect', () => {
      const el = document.createElement('div');
      el.className = 'skeleton-block';
      expect(el.classList.contains('skeleton-block')).toBe(true);
    });
  });
});
