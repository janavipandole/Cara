/**
 * Unit tests for a11y-announcer.js
 * Tests ARIA live region announcement management for screen readers.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { initAnnouncer, announce, clearAnnouncements } from '../../js/a11y-announcer.js';

describe('a11y-announcer Unit Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initAnnouncer', () => {
    it('should create polite and assertive live region elements in the DOM', () => {
      initAnnouncer();

      const polite = document.getElementById('a11y-announcer-polite');
      const assertive = document.getElementById('a11y-announcer-assertive');

      expect(polite).not.toBeNull();
      expect(polite.getAttribute('aria-live')).toBe('polite');
      expect(polite.getAttribute('aria-atomic')).toBe('true');
      expect(polite.className).toBe('sr-only');

      expect(assertive).not.toBeNull();
      expect(assertive.getAttribute('aria-live')).toBe('assertive');
      expect(assertive.getAttribute('aria-atomic')).toBe('true');
      expect(assertive.className).toBe('sr-only');
    });

    it('should not create duplicate regions when called twice', () => {
      initAnnouncer();
      const politeBefore = document.getElementById('a11y-announcer-polite');
      initAnnouncer();
      const politeAfter = document.getElementById('a11y-announcer-polite');

      expect(politeBefore).toBe(politeAfter);
    });
  });

  describe('announce', () => {
    it('should set textContent on the polite live region by default', () => {
      initAnnouncer();
      announce('Order confirmed');
      vi.advanceTimersByTime(100);

      const polite = document.getElementById('a11y-announcer-polite');
      expect(polite.textContent).toBe('Order confirmed');
    });

    it('should set textContent on the assertive live region when politeness is assertive', () => {
      initAnnouncer();
      announce('Payment failed', 'assertive');
      vi.advanceTimersByTime(100);

      const assertive = document.getElementById('a11y-announcer-assertive');
      expect(assertive.textContent).toBe('Payment failed');
    });

    it('should use polite region when explicit politeness is passed as polite', () => {
      initAnnouncer();
      announce('Cart updated', 'polite');
      vi.advanceTimersByTime(100);

      const polite = document.getElementById('a11y-announcer-polite');
      expect(polite.textContent).toBe('Cart updated');
    });
  });

  it('should clear live region text when clearAnnouncements is called', () => {
    initAnnouncer();
    const polite = document.getElementById('a11y-announcer-polite');
    polite.textContent = 'Stale text';
    clearAnnouncements();
    expect(polite.textContent).toBe('');
  });

  it('should clear the assertive region too when clearing announcements', () => {
    initAnnouncer();
    const assertive = document.getElementById('a11y-announcer-assertive');
    assertive.textContent = 'Stale alert';
    clearAnnouncements();
    expect(assertive.textContent).toBe('');
  });

  it('should announce an empty message without throwing', () => {
    initAnnouncer();
    expect(() => announce('')).not.toThrow();
    expect(() => announce(null)).not.toThrow();
  });

  it('should lazily create live regions when announce is called first', () => {
    // No explicit initAnnouncer() call; announce should create the regions.
    announce('Lazy init works');
    vi.advanceTimersByTime(100);

    const polite = document.getElementById('a11y-announcer-polite');
    expect(polite).not.toBeNull();
    expect(polite.textContent).toBe('Lazy init works');
  });

  it('should reuse existing live regions instead of duplicating them', () => {
    const existing = document.createElement('div');
    existing.id = 'a11y-announcer-polite';
    existing.className = 'sr-only';
    existing.setAttribute('aria-live', 'polite');
    document.body.appendChild(existing);

    initAnnouncer();
    expect(document.querySelectorAll('#a11y-announcer-polite').length).toBe(1);

    announce('Reused region');
    vi.advanceTimersByTime(100);
    expect(existing.textContent).toBe('Reused region');
  });

  it('should replace prior text before announcing new content', () => {
    initAnnouncer();
    announce('First message');
    vi.advanceTimersByTime(100);
    announce('Second message');
    vi.advanceTimersByTime(100);

    const polite = document.getElementById('a11y-announcer-polite');
    expect(polite.textContent).toBe('Second message');
  });
});
  it('announcer does not throw when called with empty message', () => {
    expect(() => announce('')).not.toThrow();
  });

  it('announcer uses polite aria-live by default', () => {
    announce('Test message');
    const region = document.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();
  });

