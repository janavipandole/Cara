import { describe, it, expect, beforeEach } from 'vitest';
import { getDebounceDelayMs } from '../../js/checkout-autosave.js';
import { saveDraftField, getDraftField, clearCheckoutDraft } from '../../js/checkout-autosave.js';
import { getDebounceDelayMs } from '../../js/checkout-autosave.js';

describe('Checkout Autosave Unit Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should save field draft into sessionStorage', () => {
    saveDraftField('checkout-firstname', 'Jane');
    expect(sessionStorage.getItem('cara_checkout_draft_checkout-firstname')).toBe('Jane');
  });

  it('should retrieve saved draft field from sessionStorage', () => {
    sessionStorage.setItem('cara_checkout_draft_checkout-lastname', 'Doe');
    expect(getDraftField('checkout-lastname')).toBe('Doe');
  });

  it('should return empty string if field draft does not exist', () => {
    expect(getDraftField('non-existent')).toBe('');
  });

  it('should clear specified draft fields from sessionStorage', () => {
    saveDraftField('field1', 'val1');
    saveDraftField('field2', 'val2');

    clearCheckoutDraft(['field1', 'field2']);

    expect(getDraftField('field1')).toBe('');
    expect(getDraftField('field2')).toBe('');
  });

  it('should return standard autosave debounce delay ms', () => {
    expect(getDebounceDelayMs()).toBe(500);
  });

  it('returns an empty string when sessionStorage read throws', () => {
    const originalGetItem = sessionStorage.getItem.bind(sessionStorage);
    sessionStorage.getItem = () => {
      throw new Error('storage unavailable');
    };

    expect(getDraftField('checkout-firstname')).toBe('');

    sessionStorage.getItem = originalGetItem;
  });

  it('does not throw when sessionStorage write fails', () => {
    const originalSetItem = sessionStorage.setItem.bind(sessionStorage);
    sessionStorage.setItem = () => {
      throw new Error('quota exceeded');
    };

    expect(() => saveDraftField('checkout-firstname', 'Jane')).not.toThrow();

    sessionStorage.setItem = originalSetItem;
  });

  it('does not throw when sessionStorage removeItem fails', () => {
    const originalRemoveItem = sessionStorage.removeItem.bind(sessionStorage);
    sessionStorage.removeItem = () => {
      throw new Error('storage unavailable');
    };

    expect(() => clearCheckoutDraft(['field1'])).not.toThrow();

    sessionStorage.removeItem = originalRemoveItem;
  });
});

describe('getDebounceDelayMs', () => {
  it('is exported as a callable function', () => {
    expect(typeof getDebounceDelayMs).toBe('function');
  });

  it('returns a positive delay value', () => {
    expect(getDebounceDelayMs()).toBeGreaterThan(0);
  });

  it('returns a stable value across calls', () => {
    expect(getDebounceDelayMs()).toBe(getDebounceDelayMs());
  });
});
