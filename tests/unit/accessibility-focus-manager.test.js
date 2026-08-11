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

  it('should skip hidden elements when trapping focus', () => {
    document.body.innerHTML = `
      <button id="trigger-btn">Open Modal</button>
      <div id="test-modal">
        <input id="input-1" type="text" />
        <input id="hidden-input" type="hidden" />
        <button id="hidden-btn" hidden>Hidden</button>
        <button id="btn-close">Close</button>
      </div>
    `;
    const manager = new AccessibilityFocusManager();
    const modal = document.getElementById('test-modal');
    const trapped = manager.trapFocus(modal);
    expect(trapped).toBe(true);
    expect(document.activeElement.id).toBe('input-1');
    expect(manager.focusableElements.length).toBe(2);
  });

  it('should return false when a modal has no focusable elements', () => {
    document.body.innerHTML = `
      <button id="trigger-btn">Open Modal</button>
      <div id="test-modal"><p>No controls here</p></div>
    `;
    const manager = new AccessibilityFocusManager();
    expect(manager.trapFocus(document.getElementById('test-modal'))).toBe(false);
  });

  it('should not trap focus when no modal is active', () => {
    const manager = new AccessibilityFocusManager();
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    expect(() => manager.handleKeyDown(event)).not.toThrow();
  });

  it('should ignore non-Tab keys while a modal is active', () => {
    document.body.innerHTML = `
      <button id="trigger-btn">Open Modal</button>
      <div id="test-modal">
        <input id="input-1" type="text" />
        <button id="btn-close">Close</button>
      </div>
    `;
    const manager = new AccessibilityFocusManager();
    const modal = document.getElementById('test-modal');
    manager.trapFocus(modal);

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    expect(() => manager.handleKeyDown(event)).not.toThrow();
    expect(document.activeElement.id).toBe('input-1');
  });

  it('should wrap forward from the last focusable element to the first', () => {
    document.body.innerHTML = `
      <div id="test-modal">
        <input id="input-1" type="text" />
        <button id="btn-close">Close</button>
      </div>
    `;
    const manager = new AccessibilityFocusManager();
    const modal = document.getElementById('test-modal');
    manager.trapFocus(modal);

    document.getElementById('btn-close').focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false });
    manager.handleKeyDown(event);
    expect(document.activeElement.id).toBe('input-1');
  });
});
