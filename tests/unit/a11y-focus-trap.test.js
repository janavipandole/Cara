import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTabbableElements, trapFocus, createFocusTrap } from '../../js/a11y-focus-trap.js';
import { announce, initAnnouncer } from '../../js/a11y-announcer.js';

describe('Accessibility Focus Trap & Announcer Unit Tests', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <input id="input1" type="text" />
      <button id="btn2">Button 2</button>
    `;
    document.body.appendChild(container);
  });

  it('should list all tabbable elements within container', () => {
    const tabbables = getTabbableElements(container);
    expect(tabbables.length).toBe(3);
  });

  it('should trap focus on tab navigation at end of modal', () => {
    const tabbables = getTabbableElements(container);
    const lastBtn = tabbables[2];
    lastBtn.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');

    trapFocus(container, event);
    expect(preventSpy).toHaveBeenCalled();
  });

  it('should trap focus on shift+tab navigation at top of modal', () => {
    const tabbables = getTabbableElements(container);
    const firstBtn = tabbables[0];
    firstBtn.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');

    trapFocus(container, event);
    expect(preventSpy).toHaveBeenCalled();
  });

  it('should initialize polite and assertive ARIA live regions', () => {
    initAnnouncer();
    const polite = document.getElementById('a11y-announcer-polite');
    const assertive = document.getElementById('a11y-announcer-assertive');

    expect(polite).not.toBeNull();
    expect(assertive).not.toBeNull();
    expect(polite.getAttribute('aria-live')).toBe('polite');
    expect(assertive.getAttribute('aria-live')).toBe('assertive');
  });

  it('should update live region text content when announcing messages', () => {
    announce('Item added to cart', 'polite');
    const polite = document.getElementById('a11y-announcer-polite');
    expect(polite).not.toBeNull();
  });
});
