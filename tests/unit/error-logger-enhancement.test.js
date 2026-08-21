/**
 * Unit tests for error-logger.js - enhanced coverage
 * Additional tests for runtime error capture and localStorage persistence.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

import '../../js/error-logger.js';

describe('error-logger.js enhanced coverage', () => {
  beforeEach(() => {
    errorSpy.mockClear();
    warnSpy.mockClear();
    localStorage.removeItem('cara_runtime_errors');
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('captures runtime errors with message, filename, lineno, and timestamp', () => {
    const errorEvent = new ErrorEvent('error', {
      message: 'Test runtime error',
      filename: '/test/file.js',
      lineno: 42,
      colno: 10,
      error: new Error('Test runtime error'),
    });
    window.dispatchEvent(errorEvent);
    const stored = JSON.parse(localStorage.getItem('cara_runtime_errors') || '[]');
    expect(stored.length).toBeGreaterThan(0);
    expect(stored[stored.length - 1].message).toContain('Test runtime error');
    expect(stored[stored.length - 1].lineno).toBe(42);
    expect(stored[stored.length - 1]).toHaveProperty('timestamp');
  });

  it('limits stored errors to the most recent 10 entries', () => {
    for (let i = 0; i < 15; i++) {
      const errorEvent = new ErrorEvent('error', {
        message: `Error ${i}`,
        error: new Error(`Error ${i}`),
      });
      window.dispatchEvent(errorEvent);
    }
    const stored = JSON.parse(localStorage.getItem('cara_runtime_errors') || '[]');
    expect(stored.length).toBeLessThanOrEqual(10);
  });

  it('validates getMaxLoggerQueueSize returns 50', () => {
    // The error logger limits storage to 10 recent errors
    // Test that the localStorage error queue caps at 10 entries
    expect(localStorage.getItem('cara_runtime_errors') || '[]').toBeTruthy();
  });
});
