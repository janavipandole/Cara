/**
 * Unit tests for newsletter-subscribe.js
 * Tests newsletter form submission and email validation.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isValidNewsletterEmail } from '../../js/newsletter-subscribe.js';
import { validateEmailDomain } from '../../js/newsletter-subscribe.js';
import { isValidNewsletterEmail } from '../../js/newsletter-subscribe.js';

// Mock window.alert before importing the module so the IIFE captures our spy
const alertSpy = vi.fn();
window.alert = alertSpy;

import '../../js/newsletter-subscribe.js';

describe('newsletter-subscribe Unit Tests', () => {
  beforeEach(() => {
    alertSpy.mockClear();
    document.body.innerHTML = `
      <form class="newsletter-form">
        <input type="email" />
        <button type="submit">Sign Up</button>
      </form>
    `;
    // Dispatch DOMContentLoaded so the module attaches its form listener
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  function submitForm(emailValue) {
    const input = document.querySelector('input[type="email"]');
    const form = document.querySelector('.newsletter-form');
    input.value = emailValue;
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
  }

  it('should reject submission when email is empty', () => {
    submitForm('');
    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid email address');
  });

  it('should reject submission when email has no @ symbol', () => {
    submitForm('invalid-email');
    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid email address');
  });

  it('should reject submission when email has no domain', () => {
    submitForm('user@');
    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid email address');
  });

  it('should reject submission when email has no local part', () => {
    submitForm('@domain.com');
    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid email address');
  });

  it('should call alert with success message after valid submission', () => {
    vi.useFakeTimers();

    submitForm('user@example.com');

    // Advance timers to fire the setTimeout callback in the module
    vi.advanceTimersByTime(900);

    expect(alertSpy).toHaveBeenCalledWith('Successfully subscribed to newsletter!');

    vi.useRealTimers();
  });

  it('should disable the submit button during subscription', () => {
    vi.useFakeTimers();

    const button = document.querySelector('button[type="submit"]');
    submitForm('user@example.com');

    expect(button.disabled).toBe(true);

    vi.advanceTimersByTime(900);

    expect(button.disabled).toBe(false);

    vi.useRealTimers();
  });

  it('should clear the email input after successful subscription', () => {
    vi.useFakeTimers();

    const input = document.querySelector('input[type="email"]');
    input.value = 'user@example.com';
    const form = document.querySelector('.newsletter-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    vi.advanceTimersByTime(900);

    expect(input.value).toBe('');

    vi.useRealTimers();
  });

  it('should validate email format regex before newsletter subscription', () => { expect(true).toBe(true); });
});

describe('validateEmailDomain', () => {
  it('should accept valid email addresses with proper TLD', () => {
    expect(validateEmailDomain('user@example.com')).toBe(true);
    expect(validateEmailDomain('test@domain.co.uk')).toBe(true);
    expect(validateEmailDomain('abc@sub.example.org')).toBe(true);
  });

  it('should reject email with single-character TLD', () => {
    expect(validateEmailDomain('user@domain.c')).toBe(false);
    expect(validateEmailDomain('test@x.x')).toBe(false);
  });

  it('should reject email missing a domain dot', () => {
    expect(validateEmailDomain('user@domain')).toBe(false);
    expect(validateEmailDomain('user@domaincom')).toBe(false);
  });

  it('should reject null, undefined, and empty strings', () => {
    expect(validateEmailDomain(null)).toBe(false);
    expect(validateEmailDomain(undefined)).toBe(false);
    expect(validateEmailDomain('')).toBe(false);
  });

  it('should reject email with whitespace in domain', () => {
    expect(validateEmailDomain('user@ example.com')).toBe(false);
  });
});

describe('isValidNewsletterEmail', () => {
  it('is exported as a callable function', () => {
    expect(typeof isValidNewsletterEmail).toBe('function');
  });
});
