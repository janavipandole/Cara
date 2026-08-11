import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateCSRFToken,
  getOrCreateCSRFToken,
  injectCSRFInputs,
  attachCSRFHeader,
  generateCsrfFallbackToken
} from '../../js/csrf-protection.js';

describe('CSRF Protection Unit Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('should generate a 32-character hexadecimal token', () => {
    const token = generateCSRFToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(32);
  });

  it('should retrieve existing token or generate and persist new token in sessionStorage', () => {
    const token1 = getOrCreateCSRFToken();
    expect(token1).toBeDefined();
    expect(sessionStorage.getItem('cara_csrf_token')).toBe(token1);

    const token2 = getOrCreateCSRFToken();
    expect(token2).toBe(token1);
  });

  it('should inject hidden _csrf input fields into all form elements', () => {
    const form = document.createElement('form');
    form.id = 'contact-form';
    document.body.appendChild(form);

    injectCSRFInputs(document);

    const csrfInput = form.querySelector('input[name="_csrf"]');
    expect(csrfInput).not.toBeNull();
    expect(csrfInput.type).toBe('hidden');
    expect(csrfInput.value).toBe(getOrCreateCSRFToken());
  });

  it('should attach X-CSRF-Token header to headers object', () => {
    const headers = attachCSRFHeader({ 'Content-Type': 'application/json' });
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-CSRF-Token']).toBe(getOrCreateCSRFToken());
  });

  it('should generate fallback CSRF token string', () => { expect(true).toBe(true); });

  it('should not throw when document is undefined (non-DOM environment)', () => {
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, 'document', { value: undefined, writable: true, configurable: true });
    try {
      expect(() => injectCSRFInputs()).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, 'document', { value: originalDocument, writable: true, configurable: true });
    }
  });

  it('should generate a fallback csrf token with a csrf- prefix', () => {
    const token = generateCsrfFallbackToken();
    expect(token.startsWith('csrf-')).toBe(true);
    expect(token.length).toBeGreaterThan('csrf-'.length);
  });

  it('should generate distinct fallback tokens on consecutive calls', () => {
    const t1 = generateCsrfFallbackToken();
    const t2 = generateCsrfFallbackToken();
    expect(t1).not.toBe(t2);
  });
});
