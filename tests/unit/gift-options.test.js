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

  it('should trim the message before counting characters', async () => {
    await import('../../js/gift-options.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // 202 chars of raw content but only 200 after trimming.
    const padded = '  ' + 'x'.repeat(200);
    expect(window.validateGiftMessageLength(padded, 200)).toBe(true);
    // 201 significant characters still fails.
    expect(window.validateGiftMessageLength('x'.repeat(201), 200)).toBe(false);
  });

  it('should accept a whitespace-only message', async () => {
    await import('../../js/gift-options.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(window.validateGiftMessageLength('     ', 200)).toBe(true);
  });
});
