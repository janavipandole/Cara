import { describe, it, expect } from 'vitest';

function validatePasswordComplexity(password) {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one digit.' };
  }
  if (!/[@$!%*?&]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character.' };
  }
  return { isValid: true, message: '' };
}

describe('Password Complexity Validator', () => {
  it('accepts strong passwords meeting NIST guidelines', () => {
    expect(validatePasswordComplexity('Pass123!').isValid).toBe(true);
    expect(validatePasswordComplexity('Secure$Password9').isValid).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    expect(validatePasswordComplexity('P1!a').isValid).toBe(false);
  });

  it('rejects passwords lacking uppercase, digit, or special character', () => {
    expect(validatePasswordComplexity('password123!').isValid).toBe(false);
    expect(validatePasswordComplexity('PASSWORD123!').isValid).toBe(false);
    expect(validatePasswordComplexity('PassWord!').isValid).toBe(false);
    expect(validatePasswordComplexity('PassWord123').isValid).toBe(false);
  });
});
