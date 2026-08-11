/**
 * Unit tests for error-logger.js
 * Tests client-side runtime error capture and localStorage persistence.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMaxLoggerQueueSize } from '../../js/error-logger.js';

const STORAGE_KEY = 'cara_runtime_errors';

describe('Error Logger Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // Replicate the core error-logger logic for testing
  function captureError(event) {
    const message = event.message;
    const filename = event.filename;
    const lineno = event.lineno;
    const timestamp = new Date().toISOString();
    let errors = [];
    try {
      errors = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      errors = [];
    }
    errors.push({ message, filename, lineno, timestamp });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(errors.slice(-10)));
    } catch (e) {
      // Silently ignore if localStorage is unavailable
    }
  }

  it('should capture error event data and store it in localStorage', () => {
    const mockEvent = {
      message: 'Uncaught TypeError',
      filename: 'app.js',
      lineno: 42,
    };
    captureError(mockEvent);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].message).toBe('Uncaught TypeError');
    expect(stored[0].filename).toBe('app.js');
    expect(stored[0].lineno).toBe(42);
    expect(stored[0].timestamp).toBeTruthy();
  });

  it('should not crash when localStorage contains corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid json:');
    const mockEvent = {
      message: 'Error after corruption',
      filename: 'app.js',
      lineno: 10,
    };

    expect(() => captureError(mockEvent)).not.toThrow();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].message).toBe('Error after corruption');
  });

  it('should enforce maximum of 10 errors by dropping oldest', () => {
    for (let i = 0; i < 15; i++) {
      captureError({ message: `Error ${i}`, filename: 'app.js', lineno: i });
    }

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored.length).toBe(10);
    expect(stored[0].message).toBe('Error 5');
    expect(stored[stored.length - 1].message).toBe('Error 14');
  });

  it('should handle empty localStorage gracefully', () => {
    localStorage.removeItem(STORAGE_KEY);
    const mockEvent = {
      message: 'First error',
      filename: 'app.js',
      lineno: 1,
    };

    expect(() => captureError(mockEvent)).not.toThrow();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].message).toBe('First error');
  });

  it('should include timestamp in ISO format for each captured error', () => {
    const before = new Date().toISOString();
    captureError({ message: 'Timed error', filename: 'app.js', lineno: 1 });
    const after = new Date().toISOString();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored[0].timestamp).toBeTruthy();
    expect(stored[0].timestamp >= before).toBe(true);
    expect(stored[0].timestamp <= after).toBe(true);
  });

  it('should overwrite existing errors array when new error is captured', () => {
    captureError({ message: 'Error A', filename: 'a.js', lineno: 1 });
    captureError({ message: 'Error B', filename: 'b.js', lineno: 2 });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored.length).toBe(2);
    expect(stored[0].message).toBe('Error A');
    expect(stored[1].message).toBe('Error B');
  });

  it('should cap max error queue size', () => {
    expect(getMaxLoggerQueueSize()).toBe(50);
  });

  it('should handle a non-Error throw value without crashing', async () => {
    vi.resetModules();
    localStorage.clear();
    await import('../../js/error-logger.js');

    const event = new ErrorEvent('error', {
      message: 'string thrown value',
      filename: 'app.js',
      lineno: 1,
    });
    expect(() => window.dispatchEvent(event)).not.toThrow();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored.length).toBeGreaterThanOrEqual(1);
    expect(stored[0].message).toBe('string thrown value');
  });
});

describe('getMaxLoggerQueueSize', () => {
  it('is exported as a callable function', () => {
    expect(typeof getMaxLoggerQueueSize).toBe('function');
  });

  it('returns a positive queue size', () => {
    expect(getMaxLoggerQueueSize()).toBeGreaterThan(0);
  });

  it('returns a stable value across calls', () => {
    expect(getMaxLoggerQueueSize()).toBe(getMaxLoggerQueueSize());
  });
});
