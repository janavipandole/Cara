import { describe, it, expect, beforeEach } from 'vitest';
import { AccessibilityFocusManager } from '../../js/accessibility-focus-manager.js';

describe('AccessibilityFocusManager', () => {
  let manager;
  let modal;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="trigger-btn">Open Modal</button>
      <div id="test-modal">
        <input id="input-1" type="text" />
        <button id="btn-close">Close</button>
      </div>
    `;
    manager = new AccessibilityFocusManager();
    modal = document.getElementById('test-modal');
  });

  it('should trap focus inside modal and set focus to first focusable element', () => {
    const trapped = manager.trapFocus(modal);
    expect(trapped).toBe(true);
    expect(document.activeElement.id).toBe('input-1');
    expect(modal.getAttribute('aria-modal')).toBe('true');
    expect(modal.getAttribute('role')).toBe('dialog');
  });

  it('should cycle focus to last element on Shift+Tab at first element', () => {
    manager.trapFocus(modal);
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
    manager.handleKeyDown(event);
    expect(document.activeElement.id).toBe('btn-close');
  });

  it('should release focus and restore focus to trigger button', () => {
    const trigger = document.getElementById('trigger-btn');
    trigger.focus();
    manager.trapFocus(modal);
    expect(manager.releaseFocus()).toBe(true);
    expect(document.activeElement.id).toBe('trigger-btn');
  });

  it('should safely handle focus restoration when element is invalid', () => {
    const manager = new AccessibilityFocusManager();
    expect(() => manager.restoreFocus()).not.toThrow();
  });
});
