/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('login.js', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    document.body.innerHTML = `
      <form id="loginForm">
        <input id="loginEmail" />
        <span id="emailError"></span>
        <input id="loginPassword" type="password" />
        <span id="passwordError"></span>
        <span id="formError"></span>
        <div id="captcha-section" style="display:none">
          <canvas id="captcha-canvas" width="150" height="40"></canvas>
          <button type="button" id="captcha-refresh"></button>
          <input id="captcha-input" />
          <span id="captchaError"></span>
        </div>
        <button type="submit" id="loginSubmitBtn"><span>Sign In</span></button>
      </form>
    `;
    window.CARA_API_BASE_URL = '';
  });

  it('posts credentials to /api/auth/login with cookies', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'tok', token_type: 'bearer' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const location = { href: 'login.html' };
    vi.stubGlobal('location', location);

    await import('../../login.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    document.getElementById('loginEmail').value = 'user@example.com';
    document.getElementById('loginPassword').value = 'Secret@123';

    document.getElementById('loginForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'Secret@123',
          }),
        }),
      );
      expect(location.href).toBe('index.html');
    });
  });

  it('loads server captcha after a failed login attempt', async () => {
    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes('/api/auth/captcha')) {
        return {
          ok: true,
          json: async () => ({
            captcha_image: 'data:image/png;base64,abc',
            captcha_token: 'captcha-jwt',
          }),
        };
      }
      return {
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Invalid email or password.' }),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      drawImage: vi.fn(),
    }));

    await import('../../login.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    document.getElementById('loginEmail').value = 'user@example.com';
    document.getElementById('loginPassword').value = 'bad';

    document.getElementById('loginForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    await vi.waitFor(() => {
      expect(
        fetchMock.mock.calls.some((call) =>
          String(call[0]).includes('/api/auth/captcha'),
        ),
      ).toBe(true);
      expect(document.getElementById('captcha-section').style.display).toBe(
        'block',
      );
      expect(document.getElementById('formError').textContent).toContain(
        'Invalid email or password.',
      );
    });
  });
});
