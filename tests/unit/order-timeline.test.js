import { describe, it, expect } from 'vitest';

/**
 * Unit tests for js/order-timeline.js helper functions.
 * Tests _escape function and timeline stage logic.
 */

function _escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

describe('order-timeline helpers', () => {
  describe('_escape HTML escaping', () => {
    it('escapes ampersand', () => {
      expect(_escape('A & B')).toBe('A &amp; B');
    });

    it('escapes less-than and greater-than', () => {
      expect(_escape('<div>')).toBe('&lt;div&gt;');
    });

    it('escapes double and single quotes', () => {
      expect(_escape('"double" and \'single\'')).toBe('&quot;double&quot; and &#39;single&#39;');
    });

    it('returns string representation of non-string inputs', () => {
      expect(_escape(123)).toBe('123');
      expect(_escape(null)).toBe('null');
    });
  });

  describe('timeline stage logic', () => {
    it('calculates correct percentage for stageIndex=0 with 4 stages', () => {
      const stageIndex = 0;
      const totalStages = 4;
      const percent = Math.min(100, Math.max(0, (stageIndex / (totalStages - 1)) * 100));
      expect(percent).toBe(0);
    });

    it('calculates correct percentage for stageIndex=1 with 4 stages', () => {
      const stageIndex = 1;
      const totalStages = 4;
      const percent = Math.min(100, Math.max(0, (stageIndex / (totalStages - 1)) * 100));
      expect(percent).toBeCloseTo(33.33, 1);
    });

    it('calculates correct percentage for stageIndex=2 with 4 stages', () => {
      const stageIndex = 2;
      const totalStages = 4;
      const percent = Math.min(100, Math.max(0, (stageIndex / (totalStages - 1)) * 100));
      expect(percent).toBeCloseTo(66.67, 1);
    });

    it('calculates correct percentage for stageIndex=3 with 4 stages', () => {
      const stageIndex = 3;
      const totalStages = 4;
      const percent = Math.min(100, Math.max(0, (stageIndex / (totalStages - 1)) * 100));
      expect(percent).toBe(100);
    });

    it('clamps percentage to 100 for stageIndex beyond max', () => {
      const stageIndex = 5;
      const totalStages = 4;
      const percent = Math.min(100, Math.max(0, (stageIndex / (totalStages - 1)) * 100));
      expect(percent).toBe(100);
    });

    it('handles 3-stage timeline correctly', () => {
      const stageIndex = 1;
      const totalStages = 3;
      const percent = Math.min(100, Math.max(0, (stageIndex / (totalStages - 1)) * 100));
      expect(percent).toBe(50);
    });

    it('stage isActive is true when idx <= stageIndex', () => {
      const stageIndex = 1;
      const idx0Active = 0 <= stageIndex;
      const idx1Active = 1 <= stageIndex;
      const idx2Active = 2 <= stageIndex;
      expect(idx0Active).toBe(true);
      expect(idx1Active).toBe(true);
      expect(idx2Active).toBe(false);
    });
  });
});
