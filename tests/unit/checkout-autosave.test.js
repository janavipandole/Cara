import { describe, it, expect, beforeEach } from 'vitest';
import { saveDraftField, getDraftField, clearCheckoutDraft } from '../../js/checkout-autosave.js';

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
});
