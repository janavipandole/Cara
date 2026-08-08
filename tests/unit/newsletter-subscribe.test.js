import { describe, it, expect } from 'vitest';
import { validateEmailDomain } from '../../js/newsletter-subscribe.js';

describe('newsletter-subscribe.js — validateEmailDomain', () => {
  it('returns true for valid email with 2+ char TLD', () => {
    expect(validateEmailDomain('user@example.com')).toBe(true);
    expect(validateEmailDomain('test.user@domain.co.uk')).toBe(true);
    expect(validateEmailDomain('name123@company.org')).toBe(true);
  });

  it('returns false for email with single-char TLD', () => {
    expect(validateEmailDomain('user@example.c')).toBe(false);
    expect(validateEmailDomain('test@a.b')).toBe(false);
  });

  it('returns false for email with no domain', () => {
    expect(validateEmailDomain('notanemail')).toBe(false);
    expect(validateEmailDomain('user@')).toBe(false);
    expect(validateEmailDomain('@domain.com')).toBe(false);
  });

  it('returns false for null or undefined', () => {
    expect(validateEmailDomain(null)).toBe(false);
    expect(validateEmailDomain(undefined)).toBe(false);
    expect(validateEmailDomain('')).toBe(false);
  });

  it('trims whitespace before validation', () => {
    expect(validateEmailDomain('  user@example.com  ')).toBe(true);
    expect(validateEmailDomain('\ttest@domain.com\n')).toBe(true);
  });
});
