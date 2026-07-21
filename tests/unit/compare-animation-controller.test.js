import { describe, it, expect } from 'vitest';
import { CompareAnimationController } from '../../js/compare-animation-controller.js';

describe('js/compare-animation-controller.js CompareAnimationController tests', () => {
  it('should detect when motion should be disabled', () => {
    const controller = new CompareAnimationController();
    expect(controller.shouldDisableMotion(true)).toBe(true);
    expect(controller.shouldDisableMotion(false)).toBe(false);
  });

  it('should return appropriate transition class names', () => {
    const controller = new CompareAnimationController();
    expect(controller.getTransitionClass(true)).toBe('no-transition');
    expect(controller.getTransitionClass(false)).toBe('smooth-transition');
  });

  it('should toggle body classes based on preferences', () => {
    const mockClassList = {
      classes: new Set(),
      add(className) { this.classes.add(className); },
      remove(className) { this.classes.delete(className); }
    };
    const mockDoc = {
      body: {
        classList: mockClassList
      }
    };
    const controller = new CompareAnimationController(mockDoc);

    controller.applyMotionPreferences(true);
    expect(mockClassList.classes.has('reduce-motion')).toBe(true);
    expect(mockClassList.classes.has('enable-motion')).toBe(false);

    controller.applyMotionPreferences(false);
    expect(mockClassList.classes.has('reduce-motion')).toBe(false);
    expect(mockClassList.classes.has('enable-motion')).toBe(true);
  });
});
