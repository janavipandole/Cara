/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('session-lock', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = '<div id="app"></div>';
    window.CARA_API_BASE_URL = '';
    delete window.location;
    window.location = { href: 'shop.html' };
  });

  it('does not redirect anonymous visitors after inactivity', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    vi.stubGlobal('fetch', fetchMock);

    await import('../../js/session-lock.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();
    await Promise.resolve();

    vi.advanceTimersByTime(16 * 60 * 1000);
    await Promise.resolve();

    expect(window.location.href).toBe('shop.html');
    expect(
      fetchMock.mock.calls.some((call) =>
        String(call[0]).includes('/api/auth/logout'),
      ),
    ).toBe(false);
  });

  it('locks an authenticated session after inactivity', async () => {
    const fetchMock = vi.fn(async (url, options = {}) => {
      if (String(url).includes('/api/auth/me')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ email: 'a@b.c' }),
        };
      }
      if (String(url).includes('/api/auth/logout')) {
        expect(options.method).toBe('POST');
        return { ok: true, status: 200, json: async () => ({}) };
      }
      return { ok: false, status: 404 };
    });
    vi.stubGlobal('fetch', fetchMock);

    await import('../../js/session-lock.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await vi.waitFor(() =>
      expect(
        fetchMock.mock.calls.some((call) =>
          String(call[0]).includes('/api/auth/me'),
        ),
      ).toBe(true),
    );
    await Promise.resolve();

    vi.advanceTimersByTime(15 * 60 * 1000);
    await vi.waitFor(() => expect(window.location.href).toBe('login.html'));
  });
});
