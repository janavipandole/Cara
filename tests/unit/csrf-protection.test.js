import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateCSRFToken,
  getOrCreateCSRFToken,
  injectCSRFInputs,
  attachCSRFHeader
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
});
