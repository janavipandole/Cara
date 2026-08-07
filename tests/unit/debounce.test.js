import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../../js/utils/debounce.js';

describe('js/utils/debounce.js', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('delays invoking the function until the wait period elapses', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('collapses rapid repeated calls into a single invocation', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('forwards arguments and the this context to the wrapped function', () => {
    const context = { label: 'ctx' };
    const fn = vi.fn(function (...args) {
      return [this, ...args];
    });
    const debounced = debounce(fn, 50);

    debounced.call(context, 1, 'two');
    vi.advanceTimersByTime(50);

    expect(fn).toHaveBeenCalledWith(1, 'two');
    expect(fn.mock.instances[0]).toBe(context);
  });

  it('resets the timer when called again before the wait elapses', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    vi.advanceTimersByTime(150);
    debounced();
    vi.advanceTimersByTime(150);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
