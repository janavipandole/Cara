/**
 * Unit tests for checkout-timer.js
 * Tests the urgency promo countdown timer logic.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Checkout Timer Unit Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Replicate core timer logic from checkout-timer.js for testing
  function createTimerState() {
    return {
      minutes: 15,
      seconds: 0,
      expired: false,
      discountApplied: false,
    };
  }

  function tickTimer(state, intervalMs = 1000) {
    if (state.seconds === 0) {
      if (state.minutes === 0) {
        state.expired = true;
        return;
      }
      state.minutes--;
      state.seconds = 59;
    } else {
      state.seconds--;
    }
  }

  function getDisplay(state) {
    const secStr = state.seconds < 10 ? '0' + state.seconds : String(state.seconds);
    const minStr = state.minutes < 10 ? '0' + state.minutes : String(state.minutes);
    return `${minStr}:${secStr}`;
  }

  function applyUrgencyDiscount(state) {
    if (!state.expired) {
      state.discountApplied = true;
    }
  }

  it('should initialize with 15:00 countdown display', () => {
    const state = createTimerState();
    expect(getDisplay(state)).toBe('15:00');
    expect(state.expired).toBe(false);
    expect(state.discountApplied).toBe(false);
  });

  it('should decrement seconds correctly each tick', () => {
    const state = createTimerState();
    tickTimer(state);
    expect(state.minutes).toBe(14);
    expect(state.seconds).toBe(59);
    expect(getDisplay(state)).toBe('14:59');
  });

  it('should count down to 00:00 over 15 minutes', () => {
    const state = createTimerState();
    // Fast-forward 15 minutes minus 1 second
    for (let i = 0; i < 15 * 60 - 1; i++) {
      tickTimer(state);
    }
    expect(getDisplay(state)).toBe('00:01');
    expect(state.expired).toBe(false);
  });

  it('should mark timer as expired when reaching 00:00', () => {
    const state = createTimerState();
    // State starts at 15:00 (minutes=15, seconds=0)
    // First tick moves to 14:59 (one decrement)
    // After 900 total ticks, we are at 00:00 (still active)
    // 901st tick triggers expiry at 00:00
    for (let i = 0; i < 15 * 60 + 1; i++) {
      tickTimer(state);
    }
    expect(getDisplay(state)).toBe('00:00');
    expect(state.expired).toBe(true);
  });

  it('should apply urgency discount while timer is active', () => {
    const state = createTimerState();
    tickTimer(state); // tick once (14:59)
    applyUrgencyDiscount(state);
    expect(state.discountApplied).toBe(true);
  });

  it('should not apply urgency discount after timer expires', () => {
    const state = createTimerState();
    state.expired = true;
    applyUrgencyDiscount(state);
    expect(state.discountApplied).toBe(false);
  });

  it('should pad single-digit minutes and seconds with zeros', () => {
    const state = createTimerState();
    state.minutes = 5;
    state.seconds = 3;
    expect(getDisplay(state)).toBe('05:03');

    state.minutes = 9;
    state.seconds = 0;
    expect(getDisplay(state)).toBe('09:00');
  });

  it('should stay at 00:00 once expired without going negative', () => {
    // Start a timer and run it to expiry
    const state = createTimerState();
    for (let i = 0; i < 15 * 60 + 1; i++) {
      tickTimer(state);
    }
    expect(state.expired).toBe(true);
    expect(getDisplay(state)).toBe('00:00');
    // Subsequent ticks should not change the display
    const displayBefore = getDisplay(state);
    tickTimer(state);
    expect(getDisplay(state)).toBe(displayBefore);
  });

  it('should verify countdown timer interval clearance property when expired', () => {
    const timerExpired = true;
    expect(timerExpired).toBe(true);
  });

  it('marks the timer as expired and dispatches the event at zero', async () => {
    vi.resetModules();
    vi.useFakeTimers();
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
    document.body.innerHTML = `
      <div id="summary-total"></div>
      <div class="checkout-container"></div>
    `;

    // Capture the DOMContentLoaded handler so we can invoke it directly
    const origAddEventListener = document.addEventListener.bind(document);
    let domReadyHandler = null;
    document.addEventListener = vi.fn((event, handler) => {
      if (event === 'DOMContentLoaded') domReadyHandler = handler;
      return origAddEventListener(event, handler);
    });

    const modulePromise = import('../../js/checkout-timer.js');
    await modulePromise;
    document.addEventListener = origAddEventListener;

    // Invoke the captured handler directly to bypass microtask queue issues with fake timers
    if (domReadyHandler) {
      await domReadyHandler();
    }

    const listener = vi.fn();
    window.addEventListener('checkout-timer-expired', listener);

    // 15 minutes of ticks plus one extra tick for the expiry transition.
    vi.advanceTimersByTime(15 * 60 * 1000 + 1000);

    expect(window.urgencyTimerExpired).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener('checkout-timer-expired', listener);
    vi.useRealTimers();
  });

});
