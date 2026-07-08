import { describe, it, expect } from 'vitest';

// Mirrors the regex in register.js — keep in sync if the rule changes
const complexityRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

describe('register.js password complexity regex', () => {
  it('accepts a valid strong password', () => {
    expect(complexityRegex.test('MyPass1@')).toBe(true);
  });

  it('accepts a longer valid password', () => {
    expect(complexityRegex.test('StrongP4$$word')).toBe(true);
  });

  it('rejects a password with no uppercase letter', () => {
    expect(complexityRegex.test('mypass1@')).toBe(false);
  });

  it('rejects a password with no lowercase letter', () => {
    expect(complexityRegex.test('MYPASS1@')).toBe(false);
  });

  it('rejects a password with no digit', () => {
    expect(complexityRegex.test('MyPass@@')).toBe(false);
  });

  it('rejects a password with no special character', () => {
    expect(complexityRegex.test('MyPass12')).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(complexityRegex.test('Mp1@')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(complexityRegex.test('')).toBe(false);
  });
});
