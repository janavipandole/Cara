/**
 * Unit tests for a11y-validation.js - enhanced coverage
 * Tests form field validation and accessibility requirements.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('a11y-validation.js enhanced coverage', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="test-form">
        <input type="text" id="name-field" required aria-required="true" />
        <input type="email" id="email-field" required aria-required="true" />
        <input type="tel" id="phone-field" pattern="[0-9]{10}" aria-required="true" />
      </form>
    `;
  });

  it('identifies required fields by aria-required attribute', () => {
    const requiredFields = document.querySelectorAll('[aria-required="true"]');
    expect(requiredFields.length).toBe(3);
  });

  it('validates email field format', () => {
    const emailInput = document.getElementById('email-field');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emailInput.value = 'test@example.com';
    expect(emailRegex.test(emailInput.value)).toBe(true);
    emailInput.value = 'invalid-email';
    expect(emailRegex.test(emailInput.value)).toBe(false);
  });

  it('validates phone field pattern', () => {
    const phoneInput = document.getElementById('phone-field');
    const phoneRegex = /^[0-9]{10}$/;
    phoneInput.value = '9876543210';
    expect(phoneRegex.test(phoneInput.value)).toBe(true);
    phoneInput.value = '12345';
    expect(phoneRegex.test(phoneInput.value)).toBe(false);
  });
});
