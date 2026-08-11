import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isLowStockQuantity } from '../../js/inventory-alert-banner.js';
import { renderInventoryBanner } from '../../js/inventory-alert-banner.js';
import { isLowStockQuantity } from '../../js/inventory-alert-banner.js';

/**
 * Unit tests for js/inventory-alert-banner.js renderInventoryBanner function.
 */

describe('renderInventoryBanner', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up any banners
    document.querySelectorAll('.inventory-banner').forEach(el => el.remove());
  });

  it('should be a function', () => {
    expect(typeof renderInventoryBanner).toBe('function');
  });

  it('returns null when container does not exist', () => {
    const result = renderInventoryBanner('non-existent-container', 'Test message');
    expect(result).toBeNull();
  });

  it('creates a banner element inside the target container', () => {
    const banner = renderInventoryBanner('test-container', 'Only 3 left!', 'warning');
    expect(banner).not.toBeNull();
    expect(banner.className).toContain('inventory-banner');
    expect(container.querySelector('.inventory-banner')).toBe(banner);
  });

  it('applies the correct type CSS class', () => {
    const warnBanner = renderInventoryBanner('test-container', 'Warning message', 'warning');
    const infoBanner = renderInventoryBanner('test-container', 'Info message', 'info');

    expect(warnBanner.className).toContain('inventory-banner-warning');
    expect(infoBanner.className).toContain('inventory-banner-info');
  });

  it('sets role=status and aria-live=polite for accessibility', () => {
    const banner = renderInventoryBanner('test-container', 'Low stock alert', 'warning');
    expect(banner.getAttribute('role')).toBe('status');
    expect(banner.getAttribute('aria-live')).toBe('polite');
  });

  it('displays the message text in the banner', () => {
    const banner = renderInventoryBanner('test-container', 'Hurry, only 2 left!', 'warning');
    const textEl = banner.querySelector('.inventory-banner-text');
    expect(textEl.textContent).toBe('Hurry, only 2 left!');
  });

  it('shows Warning: prefix for warning type', () => {
    const banner = renderInventoryBanner('test-container', 'Only 3 left!', 'warning');
    const iconEl = banner.querySelector('.inventory-banner-icon');
    expect(iconEl.textContent).toBe('Warning:');
  });

  it('shows Info: prefix for non-warning types', () => {
    const banner = renderInventoryBanner('test-container', 'Item restocked', 'info');
    const iconEl = banner.querySelector('.inventory-banner-icon');
    expect(iconEl.textContent).toBe('Info:');
  });

  it('adds a working close button', () => {
    const banner = renderInventoryBanner('test-container', 'Test message', 'info');
    const closeBtn = banner.querySelector('.inventory-banner-close');
    expect(closeBtn).not.toBeNull();
    expect(closeBtn.getAttribute('aria-label')).toBe('Dismiss banner');

    closeBtn.dispatchEvent(new MouseEvent('click'));
    expect(document.querySelector('.inventory-banner')).toBeNull();
  });

  it('returns the created banner element', () => {
    const banner = renderInventoryBanner('test-container', 'Test message', 'warning');
    expect(banner instanceof HTMLElement).toBe(true);
    expect(banner.tagName).toBe('DIV');
  });

  it('escapes HTML in the message text', () => {
    const banner = renderInventoryBanner(
      'test-container',
      '<img src=x onerror=alert(1)>',
      'warning',
    );
    const textEl = banner.querySelector('.inventory-banner-text');
    // No real img element may be injected by the message.
    expect(textEl.querySelector('img')).toBeNull();
    expect(textEl.innerHTML).toContain('&lt;img');
  });
});

describe('isLowStockQuantity', () => {
  it('is exported as a callable function', () => {
    expect(typeof isLowStockQuantity).toBe('function');
  });

  it('returns true for counts at or below the threshold', () => {
    expect(isLowStockQuantity(1)).toBe(true);
    expect(isLowStockQuantity(5)).toBe(true);
  });

  it('returns false above the threshold and for zero', () => {
    expect(isLowStockQuantity(6)).toBe(false);
    expect(isLowStockQuantity(0)).toBe(false);
  });

  it('returns false for non-number input', () => {
    expect(isLowStockQuantity('5')).toBe(false);
    expect(isLowStockQuantity(null)).toBe(false);
    expect(isLowStockQuantity(NaN)).toBe(false);
  });
});
