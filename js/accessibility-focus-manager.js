/**
 * Accessibility Focus Trap & Keyboard Navigation Manager
 * Traps focus within modal dialogs, manages ARIA attributes, and handles Escape key dismissal.
 */

export class AccessibilityFocusManager {
  constructor() {
    this.activeModal = null;
    this.focusableElements = [];
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.previousActiveElement = null;
  }

  trapFocus(modalElement) {
    if (!modalElement) return false;
    this.activeModal = modalElement;
    this.previousActiveElement = document.activeElement;

    const selector =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    this.focusableElements = Array.from(
      modalElement.querySelectorAll(selector),
    );

    if (this.focusableElements.length === 0) return false;

    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable =
      this.focusableElements[this.focusableElements.length - 1];

    this.firstFocusable.focus();
    modalElement.setAttribute('aria-modal', 'true');
    modalElement.setAttribute('role', 'dialog');
    return true;
  }

  handleKeyDown(event) {
    if (!this.activeModal || event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        this.lastFocusable.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        this.firstFocusable.focus();
        event.preventDefault();
      }
    }
  }

  restoreFocus() {
    if (
      this.previousActiveElement &&
      typeof this.previousActiveElement.focus === 'function'
    ) {
      this.previousActiveElement.focus();
    }
  }

  releaseFocus() {
    if (!this.activeModal) return false;
    this.activeModal.removeAttribute('aria-modal');
    if (
      this.previousActiveElement &&
      typeof this.previousActiveElement.focus === 'function'
    ) {
      this.previousActiveElement.focus();
    }
    this.activeModal = null;
    return true;
  }
}
