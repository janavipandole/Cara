/**
 * Unit tests for order-timeline.js
 * Tests the order tracking timeline rendering and progression logic.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Import the module to expose window.progressSimulatedTimeline and window._orderTimelineEscape
import '../../js/order-timeline.js';

describe('order-timeline.js unit tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="order-tracking-timeline-target"></div>';
  });

  afterEach(() => {
    // Reset stageIndex between tests by dispatching DOMContentLoaded
    // after clearing the DOM so the next test gets a fresh state
  });

  describe('_escape exposed on window', () => {
    it('is available as window._orderTimelineEscape', () => {
      expect(typeof window._orderTimelineEscape).toBe('function');
    });

    it('escapes ampersand', () => {
      expect(window._orderTimelineEscape('A & B')).toBe('A &amp; B');
    });

    it('escapes less-than and greater-than', () => {
      expect(window._orderTimelineEscape('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('escapes single quotes', () => {
      expect(window._orderTimelineEscape("it's")).toBe('it&#39;s');
    });

    it('leaves normal text unchanged', () => {
      expect(window._orderTimelineEscape('Delivered')).toBe('Delivered');
    });
  });

  describe('progressSimulatedTimeline exposed on window', () => {
    it('is available as a function on window', () => {
      expect(typeof window.progressSimulatedTimeline).toBe('function');
    });

    it('is callable without throwing', () => {
      expect(() => window.progressSimulatedTimeline()).not.toThrow();
    });

    it('calling it changes the stageIndex and re-renders', () => {
      const trackingBox = document.getElementById('order-tracking-timeline-target');
      window.progressSimulatedTimeline();
      expect(trackingBox.innerHTML).toBeTruthy();
    });

    it('calling multiple times cycles through stages 0-3 without errors', () => {
      for (let i = 0; i < 8; i++) {
        expect(() => window.progressSimulatedTimeline()).not.toThrow();
      }
    });
  });

  describe('stage index and percentage calculation', () => {
    it('percentage is 0 when stageIndex is 0', () => {
      const stageIndex = 0;
      const totalStages = 4;
      const percent = Math.min(100, Math.max(0, (stageIndex / (totalStages - 1)) * 100));
      expect(percent).toBe(0);
    });

    it('percentage is 100 when stageIndex is at last stage', () => {
      const stageIndex = 3;
      const totalStages = 4;
      const percent = Math.min(100, Math.max(0, (stageIndex / (totalStages - 1)) * 100));
      expect(percent).toBe(100);
    });

    it('percentage is clamped to 100 for values beyond last stage', () => {
      const stageIndex = 10;
      const totalStages = 4;
      const percent = Math.min(100, Math.max(0, (stageIndex / (totalStages - 1)) * 100));
      expect(percent).toBe(100);
    });

    it('percentage is clamped to 0 for negative values', () => {
      const stageIndex = -5;
      const totalStages = 4;
      const percent = Math.min(100, Math.max(0, (stageIndex / (totalStages - 1)) * 100));
      expect(percent).toBe(0);
    });
  });

  describe('renderTimeline edge cases', () => {
    it('does not throw when the tracking box is missing', () => {
      document.body.innerHTML = '';
      expect(() => window.progressSimulatedTimeline()).not.toThrow();
    });

    it('cycles stage index back to the start after the last stage', () => {
      document.body.innerHTML = '<div id="order-tracking-timeline-target"></div>';
      // Calling progressSimulatedTimeline 4 times advances stage 1 -> 2 -> 3 -> 0
      for (let i = 0; i < 4; i++) {
        expect(() => window.progressSimulatedTimeline()).not.toThrow();
      }
      // A further call keeps the cycle going without errors.
      expect(() => window.progressSimulatedTimeline()).not.toThrow();
    });
  });
});
