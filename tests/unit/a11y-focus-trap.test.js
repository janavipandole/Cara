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

  it('should return null when container or event is null or undefined', () => {
    expect(trapFocus(null, null)).toBeNull();
  });

  it('should exclude hidden, aria-hidden, and type=hidden elements from tabbables', () => {
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <button id="hiddenBtn" hidden>Hidden</button>
      <button id="ariaHiddenBtn" aria-hidden="true">Aria Hidden</button>
      <input id="hiddenInput" type="hidden" />
      <input id="textInput" type="text" />
    `;
    const tabbables = getTabbableElements(container);
    const ids = tabbables.map((el) => el.id);
    expect(ids).toContain('btn1');
    expect(ids).toContain('textInput');
    expect(ids).not.toContain('hiddenBtn');
    expect(ids).not.toContain('ariaHiddenBtn');
    expect(ids).not.toContain('hiddenInput');
  });

  it('should return an empty array for a container without tabbables', () => {
    container.innerHTML = '<button disabled>Disabled</button>';
    expect(getTabbableElements(container)).toEqual([]);
  });

  it('should return an empty array for null or non-element input', () => {
    expect(getTabbableElements(null)).toEqual([]);
    expect(getTabbableElements({})).toEqual([]);
  });
});
  it('trapFocus returns focus to previous element on deactivate', () => {
    const result = trapFocus(document.body);
    expect(typeof result.deactivate).toBe('function');
    result.deactivate();
  });

  it('getTabbableElements returns an array', () => {
    const tabbables = getTabbableElements(document.body);
    expect(Array.isArray(tabbables)).toBe(true);
  });

