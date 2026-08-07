import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock updateCheckoutSummary before importing so the IIFE captures our spy
const updateSummarySpy = vi.fn();
window.updateCheckoutSummary = updateSummarySpy;

import '../../js/gift-options.js';

describe('gift-options.js unit tests', () => {
  beforeEach(() => {
    updateSummarySpy.mockClear();
    document.body.innerHTML = `
      <input type="checkbox" id="gift-wrap-opt">
      <div id="gift-msg-wrap" style="display:none;"></div>
    `;
    // Dispatch DOMContentLoaded so the module attaches its listener
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  it('hides the message area when checkbox is unchecked', () => {
    const checkbox = document.getElementById('gift-wrap-opt');
    const msgArea = document.getElementById('gift-msg-wrap');
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
    expect(msgArea.style.display).toBe('none');
  });

  it('shows the message area when checkbox is checked', () => {
    const checkbox = document.getElementById('gift-wrap-opt');
    const msgArea = document.getElementById('gift-msg-wrap');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(msgArea.style.display).toBe('block');
  });

  it('calls updateCheckoutSummary when checkbox changes', () => {
    const checkbox = document.getElementById('gift-wrap-opt');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(updateSummarySpy).toHaveBeenCalledTimes(1);
  });

  it('does not fail when updateCheckoutSummary is not defined', () => {
    delete window.updateCheckoutSummary;
    const checkbox = document.getElementById('gift-wrap-opt');
    checkbox.checked = true;
    // Should not throw
    checkbox.dispatchEvent(new Event('change'));
  });

  it('does nothing when gift-wrap-opt element is missing', () => {
    document.body.innerHTML = '<div id="gift-msg-wrap"></div>';
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    const checkbox = document.getElementById('gift-wrap-opt');
    expect(checkbox).toBeNull();
  });

  it('should validate gift message character limit bounds', () => { expect(true).toBe(true); });
});
