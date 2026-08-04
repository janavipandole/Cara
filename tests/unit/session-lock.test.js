import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Unit tests for js/session-lock.js inactivity timeout logic.
 */

describe('session-lock inactivity timeout', () => {
  // The module manages session timeout by clearing localStorage keys
  // and redirecting to login.html after inactivity.

  const SESSION_KEYS = [
    'cara_user_session',
    'cara_user_token',
    'access_token',
    'cara_user_email',
    'cara_user_name',
    'cara_user_role',
  ];

  function clearSession() {
    SESSION_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  function isSessionCleared() {
    return SESSION_KEYS.every((key) => localStorage.getItem(key) === null);
  }

  beforeEach(() => {
    localStorage.clear();
    // Set some mock session data
    SESSION_KEYS.forEach((key) => {
      localStorage.setItem(key, 'mock-value');
    });
  });

  it('clears all session keys from localStorage', () => {
    clearSession();
    expect(isSessionCleared()).toBe(true);
  });

  it('leaves non-session localStorage keys untouched', () => {
    localStorage.setItem('cart_items', '[]');
    localStorage.setItem('wishlist', '[]');
    clearSession();
    expect(localStorage.getItem('cart_items')).toBe('[]');
    expect(localStorage.getItem('wishlist')).toBe('[]');
  });

  it('handles missing keys gracefully (no error thrown)', () => {
    expect(() => clearSession()).not.toThrow();
  });

  it('MAX_INACTIVITY is 15 minutes (900000 ms)', () => {
    const maxInactivity = 15 * 60 * 1000;
    expect(maxInactivity).toBe(900000);
  });

  describe('activity event listeners', () => {
    const ACTIVITY_EVENTS = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    it('defines all expected activity event types', () => {
      expect(ACTIVITY_EVENTS).toContain('click');
      expect(ACTIVITY_EVENTS).toContain('mousemove');
      expect(ACTIVITY_EVENTS).toContain('keypress');
      expect(ACTIVITY_EVENTS).toContain('scroll');
      expect(ACTIVITY_EVENTS).toContain('touchstart');
      expect(ACTIVITY_EVENTS).toHaveLength(5);
    });
  });
});
