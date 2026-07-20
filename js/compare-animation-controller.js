/**
 * Compare Accessibility Animation Controller Utility
 * Handles respecting prefers-reduced-motion for page animations.
 */
class CompareAnimationController {
  constructor(documentObj) {
    this.document = documentObj || (typeof document !== 'undefined' ? document : null);
  }

  shouldDisableMotion(prefersReducedVal) {
    // If user prefers reduced motion, disable animations
    return !!prefersReducedVal;
  }

  getTransitionClass(isDisabled) {
    return isDisabled ? 'no-transition' : 'smooth-transition';
  }

  applyMotionPreferences(isDisabled) {
    if (!this.document) return;
    const body = this.document.body;
    if (!body) return;

    if (isDisabled) {
      body.classList.add('reduce-motion');
      body.classList.remove('enable-motion');
    } else {
      body.classList.add('enable-motion');
      body.classList.remove('reduce-motion');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CompareAnimationController };
} else if (typeof window !== 'undefined') {
  window.CompareAnimationController = CompareAnimationController;
}
