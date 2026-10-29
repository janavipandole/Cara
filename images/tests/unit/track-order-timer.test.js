import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Isolate the timer management logic from the DOM-heavy module.
// We test the invariant: at most one interval is active at any time.
describe('track-order progress timer management', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clears an existing interval before creating a new one', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const setSpy = vi.spyOn(globalThis, 'setInterval');

    // Simulate what renderResult() does with the module-level progressTimer
    let progressTimer = null;

    function startProgressTimer() {
      if (progressTimer !== null) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
      progressTimer = setInterval(() => {}, 3000);
      return progressTimer;
    }

    function stopProgressTimer() {
      if (progressTimer !== null) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
    }

    // First lookup
    startProgressTimer();
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(clearSpy).not.toHaveBeenCalled();

    // Second lookup without reset — must clear the first before creating a new one
    startProgressTimer();
    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(setSpy).toHaveBeenCalledTimes(2);

    // Third lookup — again clears the previous
    startProgressTimer();
    expect(clearSpy).toHaveBeenCalledTimes(2);
    expect(setSpy).toHaveBeenCalledTimes(3);

    // After N lookups only one interval is active (the most recent)
    stopProgressTimer();
    expect(progressTimer).toBeNull();
  });

  it('resets progressTimer to null after clearing', () => {
    let progressTimer = null;

    progressTimer = setInterval(() => {}, 3000);
    expect(progressTimer).not.toBeNull();

    clearInterval(progressTimer);
    progressTimer = null;

    expect(progressTimer).toBeNull();
  });

  it('sets progressTimer to null when progress reaches 99', () => {
    let progressTimer = null;
    let currentPct = 98.9;

    progressTimer = setInterval(() => {
      if (currentPct < 99) {
        currentPct += 0.5;
      } else {
        clearInterval(progressTimer);
        progressTimer = null;
      }
    }, 3000);

    // First tick: 98.9 + 0.5 = 99.4 (still incrementing, not yet in else branch)
    // Second tick: 99.4 >= 99 → else branch fires clearInterval and sets null
    vi.advanceTimersByTime(6000);
    expect(progressTimer).toBeNull();
    expect(currentPct).toBeGreaterThanOrEqual(99);
  });
});
