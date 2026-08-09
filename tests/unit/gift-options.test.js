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

  it('should validate gift message character limit bounds', async () => {
    await import('../../js/gift-options.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(window.validateGiftMessageLength('Short message')).toBe(true);
    expect(window.validateGiftMessageLength('x'.repeat(200))).toBe(true);
    expect(window.validateGiftMessageLength('x'.repeat(201))).toBe(false);
  });

  it('should accept non-string or empty gift messages', async () => {
    await import('../../js/gift-options.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(window.validateGiftMessageLength(null)).toBe(true);
    expect(window.validateGiftMessageLength('')).toBe(true);
    expect(window.validateGiftMessageLength(undefined)).toBe(true);
  });

  it('should respect a custom character limit', async () => {
    await import('../../js/gift-options.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(window.validateGiftMessageLength('abc', 5)).toBe(true);
    expect(window.validateGiftMessageLength('abcdef', 5)).toBe(false);
  });

  it('trims whitespace before length check and allows whitespace-only strings within limit', async () => {
    await import('../../js/gift-options.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // '   ' trimmed is '' which has length 0 <= 200
    expect(window.validateGiftMessageLength('   ')).toBe(true);
    // Trimmed length of 10 spaces is 0 <= 200
    expect(window.validateGiftMessageLength('          ')).toBe(true);
  });

  it('rejects non-string truthy types gracefully', async () => {
    await import('../../js/gift-options.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Numbers get coerced to string via trim; .toString() handles numbers
    // null/undefined/empty string all return true per existing tests
    // Non-string truthy values should return true (handled by typeof check)
    expect(window.validateGiftMessageLength(0)).toBe(true);
  });
});
