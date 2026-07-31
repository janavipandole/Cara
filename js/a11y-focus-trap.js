// Accessibility Focus Trap Utility for Modals and Dialogs

export const TABBABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

export function getTabbableElements(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return [];
  return Array.from(container.querySelectorAll(TABBABLE_SELECTOR)).filter(
    (el) => el.style.display !== 'none' && el.style.visibility !== 'hidden'
  );
}

export function trapFocus(container, event) {
  if (event.key !== 'Tab' && event.keyCode !== 9) return;

  const tabbables = getTabbableElements(container);
  if (tabbables.length === 0) {
    event.preventDefault();
    return;
  }

  const firstElement = tabbables[0];
  const lastElement = tabbables[tabbables.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  }
}

export function createFocusTrap(containerElement) {
  let previousActiveElement = typeof document !== 'undefined' ? document.activeElement : null;

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      trapFocus(containerElement, e);
    }
  };

  return {
    activate() {
      if (typeof document !== 'undefined') {
        previousActiveElement = document.activeElement;
      }
      containerElement.addEventListener('keydown', handleKeyDown);
      const tabbables = getTabbableElements(containerElement);
      if (tabbables.length > 0) {
        tabbables[0].focus();
      }
    },
    deactivate() {
      containerElement.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    },
  };
}
