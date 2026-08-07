import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CaraToast } from '../../js/toast.js';

/**
 * Unit tests for js/toast.js CaraToast class.
 */

describe('CaraToast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Remove any existing toast container
    const existing = document.getElementById('toast-container');
    if (existing) existing.remove();
    // Clear timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should be a class with show and _dismiss static methods', () => {
    expect(typeof CaraToast).toBe('function');
    expect(typeof CaraToast.show).toBe('function');
    expect(typeof CaraToast._dismiss).toBe('function');
  });

  it('creates a toast container if none exists', () => {
    CaraToast.show('Test message', 'info', 5000);
    vi.advanceTimersByTime(0);
    const container = document.getElementById('toast-container');
    expect(container).not.toBeNull();
    expect(container.id).toBe('toast-container');
  });

  it('reuses an existing toast container', () => {
    const existing = document.createElement('div');
    existing.id = 'toast-container';
    document.body.appendChild(existing);

    CaraToast.show('First', 'info', 5000);
    vi.advanceTimersByTime(0);
    CaraToast.show('Second', 'success', 5000);
    vi.advanceTimersByTime(0);

    const container = document.getElementById('toast-container');
    expect(container.querySelectorAll('.toast').length).toBe(2);
  });

  it('sets toast type as CSS class', () => {
    CaraToast.show('Info toast', 'info', 5000);
    CaraToast.show('Success toast', 'success', 5000);
    CaraToast.show('Error toast', 'error', 5000);
    CaraToast.show('Warning toast', 'warning', 5000);
    vi.advanceTimersByTime(0);

    const toasts = document.querySelectorAll('.toast');
    expect(toasts[0].className).toContain('toast-info');
    expect(toasts[1].className).toContain('toast-success');
    expect(toasts[2].className).toContain('toast-error');
    expect(toasts[3].className).toContain('toast-warning');
  });

  it('displays the message in the toast', () => {
    CaraToast.show('Hello world', 'info', 5000);
    vi.advanceTimersByTime(0);
    const msg = document.querySelector('.toast-msg');
    expect(msg.textContent).toBe('Hello world');
  });

  it('auto-dismisses after the given duration', () => {
    CaraToast.show('Auto dismiss', 'info', 3000);
    const toast = document.querySelector('.toast');
    expect(toast).not.toBeNull();

    // Advance past the auto-dismiss duration
    vi.advanceTimersByTime(3000);
    // The dismiss also has a 350ms setTimeout for removal
    vi.advanceTimersByTime(350);
    expect(document.querySelector('.toast')).toBeNull();
  });

  it('pauses auto-dismiss on mouseenter and resumes on mouseleave', () => {
    CaraToast.show('Paused toast', 'info', 2000);
    vi.advanceTimersByTime(0);
    const toast = document.querySelector('.toast');
    toast.dispatchEvent(new MouseEvent('mouseenter'));

    // Advance timers while hovered - should NOT dismiss yet
    vi.advanceTimersByTime(2500);
    expect(document.querySelector('.toast')).not.toBeNull();

    // Leave - should start new 1500ms timer
    toast.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(1500);
    // Dismiss setTimeout
    vi.advanceTimersByTime(350);
    expect(document.querySelector('.toast')).toBeNull();
  });

  it('dismisses immediately on close button click', () => {
    CaraToast.show('Click to close', 'info', 5000);
    vi.advanceTimersByTime(0);
    const toast = document.querySelector('.toast');
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.dispatchEvent(new MouseEvent('click'));
    // The dismiss also has a 350ms setTimeout
    vi.advanceTimersByTime(350);
    expect(document.querySelector('.toast')).toBeNull();
  });

  it('uses info icon when type is unknown', () => {
    CaraToast.show('Unknown type', 'unknowntype', 5000);
    vi.advanceTimersByTime(0);
    const toast = document.querySelector('.toast');
    expect(toast.className).toContain('toast-unknowntype');
  });
});
