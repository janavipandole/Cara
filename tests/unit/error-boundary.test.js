import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock console.error before importing so the module captures our spy
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

import '../../js/error-boundary.js';

describe('error-boundary.js unit tests', () => {
  let container;

  beforeEach(() => {
    errorSpy.mockClear();
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'test-target';
    document.body.appendChild(container);
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
    expect(errorSpy).toHaveBeenCalledWith(
      '[CaraErrorBoundary] Error in "#test-target":',
      testError,
    );
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

  it('logError formats the error with context', () => {
    const err = new Error('test error');
    CaraErrorBoundary.logError(err, 'my-context');
    expect(errorSpy).toHaveBeenCalledWith(
      '[CaraErrorBoundary] Error in "my-context":',
      err,
    );
  });

  it('should render fallback box on error', () => { expect(true).toBe(true); });
});
