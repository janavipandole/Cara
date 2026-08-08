import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('toast-notifications.js — CaraNotifications', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    vi.resetModules();
    const existing = document.getElementById('cara-notif-container');
    if (existing) existing.remove();
    await import('../../js/toast-notifications.js');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  function advanceFadeIn() {
    vi.advanceTimersByTime(0);
  }

  function advanceDismiss() {
    vi.advanceTimersByTime(300);
  }

  it('info() creates a notification with correct message', () => {
    window.CaraNotifications.info('Test info message', 5000);
    advanceFadeIn();
    const container = document.getElementById('cara-notif-container');
    expect(container).not.toBeNull();
    const el = container.querySelector('[role="alert"]');
    expect(el).not.toBeNull();
    expect(el.textContent).toBe('Test info message');
  });

  it('success() creates a notification', () => {
    window.CaraNotifications.success('Success!', 5000);
    advanceFadeIn();
    const el = document.querySelector('[role="alert"]');
    expect(el).not.toBeNull();
    expect(el.textContent).toBe('Success!');
  });

  it('error() creates a notification', () => {
    window.CaraNotifications.error('Error text', 5000);
    advanceFadeIn();
    const el = document.querySelector('[role="alert"]');
    expect(el).not.toBeNull();
    expect(el.textContent).toBe('Error text');
  });

  it('notifications have role="alert" for accessibility', () => {
    window.CaraNotifications.info('Alert test', 5000);
    advanceFadeIn();
    const el = document.querySelector('[role="alert"]');
    expect(el).not.toBeNull();
    expect(el.getAttribute('role')).toBe('alert');
  });

  it('click on notification triggers dismiss', () => {
    window.CaraNotifications.info('Click to dismiss', 100000);
    advanceFadeIn();
    const el = document.querySelector('[role="alert"]');
    expect(el).not.toBeNull();
    el.click();
    advanceDismiss();
    const remaining = document.querySelectorAll('[role="alert"]');
    expect(remaining.length).toBe(0);
  });

  it('auto-dismiss removes notification after duration', () => {
    window.CaraNotifications.info('Auto-dismiss me', 2000);
    advanceFadeIn();
    vi.advanceTimersByTime(2000);
    advanceDismiss();
    const remaining = document.querySelectorAll('[role="alert"]');
    expect(remaining.length).toBe(0);
  });

  it('dismiss() API manually removes the notification', () => {
    window.CaraNotifications.info('Manual dismiss', 100000);
    advanceFadeIn();
    expect(document.querySelector('[role="alert"]')).not.toBeNull();
    window.CaraNotifications.dismiss(document.querySelector('[role="alert"]'));
    advanceDismiss();
    expect(document.querySelector('[role="alert"]')).toBeNull();
  });
});
