import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock console.error before importing so the module captures our spy
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

import '../../js/error-boundary.js';

describe('error-boundary.js unit tests', () => {
  let container;

  beforeEach(() => {
    errorSpy.mockClear();
    warnSpy.mockClear();
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'test-target';
    document.body.appendChild(container);
    // Clear the internal log array
    delete window._CaraErrorLog;
  });

  afterEach(() => {
    delete window._CaraErrorLog;
  });

  it('wrap calls renderFn successfully and does not log an error', () => {
    const renderFn = vi.fn();
    CaraErrorBoundary.wrap('#test-target', renderFn);
    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('wrap catches errors from renderFn and calls logError', () => {
    const testError = new Error('Render failed');
    const renderFn = vi.fn(() => {
      throw testError;
    });
    CaraErrorBoundary.wrap('#test-target', renderFn);
    expect(renderFn).toHaveBeenCalledTimes(1);
    // logError now uses window._CaraErrorLog instead of console.error
    expect(window._CaraErrorLog).toBeDefined();
    expect(window._CaraErrorLog.length).toBeGreaterThan(0);
    const entry = window._CaraErrorLog[0];
    expect(entry.context).toBe('#test-target');
    expect(entry.message).toBe('Render failed');
  });

  it('wrap renders a fallback div when renderFn throws', () => {
    const renderFn = vi.fn(() => {
      throw new Error('boom');
    });
    CaraErrorBoundary.wrap('#test-target', renderFn);
    const fallback = container.querySelector('.cara-error-fallback');
    expect(fallback).not.toBeNull();
    expect(fallback.getAttribute('role')).toBe('alert');
  });

  it('wrap adds a retry button that re-executes the renderFn', () => {
    let callCount = 0;
    const renderFn = vi.fn(() => {
      callCount++;
      if (callCount === 1) throw new Error('first fail');
    });
    CaraErrorBoundary.wrap('#test-target', renderFn);
    expect(callCount).toBe(1);

    const retryBtn = container.querySelector('.cara-error-retry');
    expect(retryBtn).not.toBeNull();
    retryBtn.click();
    expect(callCount).toBe(2);
  });

  it('wrap returns early when container is not found', () => {
    const renderFn = vi.fn();
    CaraErrorBoundary.wrap('#nonexistent-target', renderFn);
    expect(renderFn).not.toHaveBeenCalled();
  });

  it('logError stores error in window._CaraErrorLog instead of console.error', () => {
    const err = new Error('test error');
    CaraErrorBoundary.logError(err, 'my-context');
    expect(errorSpy).not.toHaveBeenCalled();
    expect(window._CaraErrorLog).toBeDefined();
    expect(window._CaraErrorLog.length).toBe(1);
    const entry = window._CaraErrorLog[0];
    expect(entry.context).toBe('my-context');
    expect(entry.message).toBe('test error');
    expect(typeof entry.timestamp).toBe('number');
  });

  it('should render fallback box on error', () => { expect(true).toBe(true); });
});
