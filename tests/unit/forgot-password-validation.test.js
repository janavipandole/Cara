import { describe, it, expect } from 'vitest';

// Validation rules mirroring forgotPassword.js — kept in sync manually
function validateForgotPassword(newPass, confirmPass) {
  if (!newPass) return 'Password is required.';
  if (/\s/.test(newPass)) return 'Password must not contain spaces.';
  if (newPass.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(newPass))
    return 'Password must contain at least one uppercase letter (A-Z).';
  if (!/[a-z]/.test(newPass))
    return 'Password must contain at least one lowercase letter (a-z).';
  if (!/[0-9]/.test(newPass))
    return 'Password must contain at least one number (0-9).';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPass))
    return 'Password must contain at least one special character (e.g. @, #, $).';
  if (newPass !== confirmPass) return 'Passwords do not match!';
  return null;
}

describe('forgotPassword.js validation logic', () => {
  it('returns null for a valid password', () => {
    expect(validateForgotPassword('MyPass1@', 'MyPass1@')).toBeNull();
  });

  it('rejects an empty password', () => {
    expect(validateForgotPassword('', '')).toBe('Password is required.');
  });

  it('rejects a password with spaces', () => {
    expect(validateForgotPassword('My Pass1@', 'My Pass1@')).toBe(
      'Password must not contain spaces.',
    );
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(validateForgotPassword('Mp1@', 'Mp1@')).toBe(
      'Password must be at least 8 characters long.',
    );
  });

  it('rejects a password with no uppercase letter', () => {
    expect(validateForgotPassword('mypass1@', 'mypass1@')).toBe(
      'Password must contain at least one uppercase letter (A-Z).',
    );
  });

  it('rejects a password with no lowercase letter', () => {
    expect(validateForgotPassword('MYPASS1@', 'MYPASS1@')).toBe(
      'Password must contain at least one lowercase letter (a-z).',
    );
  });

  it('rejects a password with no digit', () => {
    expect(validateForgotPassword('MyPass@@', 'MyPass@@')).toBe(
      'Password must contain at least one number (0-9).',
    );
  });

  it('rejects a password with no special character', () => {
    expect(validateForgotPassword('MyPass12', 'MyPass12')).toBe(
      'Password must contain at least one special character (e.g. @, #, $).',
    );
  });

  it('rejects mismatched confirm password', () => {
    expect(validateForgotPassword('MyPass1@', 'MyPass1!')).toBe(
      'Passwords do not match!',
    );
  });

  it('space check runs before length check', () => {
    // "ab cd" is 5 chars AND has a space — should report spaces, not length
    expect(validateForgotPassword('ab cd', 'ab cd')).toBe(
      'Password must not contain spaces.',
    );
  });
});
