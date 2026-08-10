import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock console.error to prevent test output noise
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

  it('wrap catches errors from renderFn and does not emit to console.error', () => {
    const testError = new Error('Render failed');
    const renderFn = vi.fn(() => {
      throw testError;
    });
    CaraErrorBoundary.wrap('#test-target', renderFn);
    expect(renderFn).toHaveBeenCalledTimes(1);
    // logError now uses a silent internal hook — no console.error in production
    expect(errorSpy).not.toHaveBeenCalled();
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

  it('logError does not emit to console.error (silent hook)', () => {
    const err = new Error('test error');
    CaraErrorBoundary.logError(err, 'my-context');
    // logError uses _logHook which is silent by default
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('wrap renders the fallback message when renderFn throws', () => {
    const renderFn = vi.fn(() => {
      throw new Error('Custom failure');
    });
    CaraErrorBoundary.wrap('#test-target', renderFn);
    const fallback = container.querySelector('.cara-error-fallback');
    expect(fallback).not.toBeNull();
    expect(fallback.querySelector('p').textContent).toContain(
      'Something went wrong loading this section.',
    );
    expect(fallback.querySelector('.cara-error-retry')).not.toBeNull();
  });

  it('wrap leaves the container untouched when renderFn succeeds', () => {
    const renderFn = vi.fn(() => {
      container.innerHTML = '<p class="ok">loaded</p>';
    });
    CaraErrorBoundary.wrap('#test-target', renderFn);
    expect(container.querySelector('.ok')).not.toBeNull();
    expect(container.querySelector('.cara-error-fallback')).toBeNull();
  });

  it('retry replaces the fallback with the rendered content on success', () => {
    let callCount = 0;
    const renderFn = vi.fn(() => {
      callCount++;
      if (callCount === 1) throw new Error('first fail');
      container.innerHTML = '<p class="recovered">loaded</p>';
    });
    CaraErrorBoundary.wrap('#test-target', renderFn);
    expect(container.querySelector('.cara-error-fallback')).not.toBeNull();

    container.querySelector('.cara-error-retry').click();
    expect(callCount).toBe(2);
    expect(container.querySelector('.recovered')).not.toBeNull();
    expect(container.querySelector('.cara-error-fallback')).toBeNull();
  });

  it('retry keeps showing the fallback when renderFn keeps failing', () => {
    const renderFn = vi.fn(() => {
      throw new Error('always fails');
    });
    CaraErrorBoundary.wrap('#test-target', renderFn);

    const retryBtn = container.querySelector('.cara-error-retry');
    retryBtn.click();
    retryBtn.click();

    expect(container.querySelector('.cara-error-fallback')).not.toBeNull();
    expect(renderFn).toHaveBeenCalledTimes(3);
  });
});
