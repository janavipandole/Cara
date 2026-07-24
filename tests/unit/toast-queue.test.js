import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToastQueueManager } from '../../js/toast-queue.js';

describe('Toast Queue Manager Unit Tests', () => {
  let manager;

  beforeEach(() => {
    document.body.innerHTML = '';
    manager = new ToastQueueManager(3);
  });

  it('should initialize empty toast queue and create container element', () => {
    expect(manager.queue.length).toBe(0);
    const container = manager.getOrCreateContainer();
    expect(container).not.toBeNull();
    expect(container.id).toBe('toast-queue-container');
  });

  it('should add toast items to queue and render card elements', () => {
    const id = manager.show('Item added to cart', 'success', 0);
    expect(manager.queue.length).toBe(1);
    expect(manager.queue[0].id).toBe(id);

    const toastCard = document.getElementById(id);
    expect(toastCard).not.toBeNull();
    expect(toastCard.className).toContain('toast-success');
    expect(toastCard.textContent).toContain('Item added to cart');
  });

  it('should enforce maxToasts capacity limit by dropping oldest toast', () => {
    manager.show('Msg 1', 'info', 0);
    manager.show('Msg 2', 'info', 0);
    manager.show('Msg 3', 'info', 0);
    manager.show('Msg 4', 'info', 0);

    expect(manager.queue.length).toBe(3);
    expect(manager.queue[0].message).toBe('Msg 2');
  });

  it('should dismiss toast item on close button click or manual call', () => {
    vi.useFakeTimers();
    const id = manager.show('Dismiss me', 'warning', 0);
    expect(manager.queue.length).toBe(1);

    manager.dismiss(id);
    expect(manager.queue.length).toBe(0);

    vi.advanceTimersByTime(300);
    expect(document.getElementById(id)).toBeNull();
    vi.useRealTimers();
  });

  it('should automatically dismiss toast after duration timer expires', () => {
    vi.useFakeTimers();
    manager.show('Auto close', 'info', 1000);
    expect(manager.queue.length).toBe(1);

    vi.advanceTimersByTime(1100);
    expect(manager.queue.length).toBe(0);
    vi.useRealTimers();
  });
});
