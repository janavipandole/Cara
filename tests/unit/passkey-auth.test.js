import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('js/passkey-auth.js - WebAuthn Passkey Engine', () => {
  let PasskeyAuth;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = '';
    const module = await import('../../js/passkey-auth.js');
    PasskeyAuth = module.default || window.PasskeyAuth;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly reports WebAuthn support', () => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: class PublicKeyCredential {},
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'credentials', {
      value: { create: vi.fn(), get: vi.fn() },
      configurable: true,
      writable: true,
    });

    expect(PasskeyAuth.isWebAuthnSupported()).toBe(true);
  });

  it('converts buffers to Base64URL and back correctly', () => {
    const originalText = 'Hello WebAuthn';
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const buffer = encoder.encode(originalText).buffer;
    const base64URL = PasskeyAuth.bufferToBase64URL(buffer);

    expect(typeof base64URL).toBe('string');
    expect(base64URL).not.toContain('+');
    expect(base64URL).not.toContain('/');
    expect(base64URL).not.toContain('=');

    const restoredBuffer = PasskeyAuth.base64URLToBuffer(base64URL);
    const restoredText = decoder.decode(restoredBuffer);

    expect(restoredText).toBe(originalText);
  });

  it('throws error during registration if WebAuthn is unsupported', async () => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    await expect(PasskeyAuth.registerPasskey('user@example.com')).rejects.toThrow(
      'WebAuthn biometrics is not supported in this browser.',
    );
  });

  it('throws error during login if WebAuthn is unsupported', async () => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    await expect(PasskeyAuth.loginWithPasskey('user@example.com')).rejects.toThrow(
      'WebAuthn biometrics is not supported in this browser.',
    );
  });

  it('executes passkey registration flow successfully when supported', async () => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: class PublicKeyCredential {},
      configurable: true,
      writable: true,
    });

    const mockCreate = vi.fn().mockResolvedValue({
      id: 'mock-cred-id',
      rawId: new Uint8Array([1, 2, 3]).buffer,
      type: 'public-key',
      response: {
        attestationObject: new Uint8Array([4, 5, 6]).buffer,
        clientDataJSON: new Uint8Array([7, 8, 9]).buffer,
      },
    });

    Object.defineProperty(navigator, 'credentials', {
      value: { create: mockCreate, get: vi.fn() },
      configurable: true,
      writable: true,
    });

    globalThis.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/register-options')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              publicKey: {
                challenge: 'mock-challenge',
                user: { id: 'user-id-123' },
              },
            }),
        });
      }
      if (url.includes('/register-verify')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'success',
              message: 'Passkey registered successfully.',
            }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const result = await PasskeyAuth.registerPasskey('test@example.com');
    expect(result.status).toBe('success');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('executes passkey login flow successfully when supported', async () => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: class PublicKeyCredential {},
      configurable: true,
      writable: true,
    });

    const mockGet = vi.fn().mockResolvedValue({
      id: 'mock-cred-id',
      rawId: new Uint8Array([1, 2, 3]).buffer,
      type: 'public-key',
      response: {
        authenticatorData: new Uint8Array([4, 5]).buffer,
        clientDataJSON: new Uint8Array([6, 7]).buffer,
        signature: new Uint8Array([8, 9]).buffer,
        userHandle: null,
      },
    });

    Object.defineProperty(navigator, 'credentials', {
      value: { create: vi.fn(), get: mockGet },
      configurable: true,
      writable: true,
    });

    globalThis.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/login-options')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              publicKey: {
                challenge: 'mock-challenge',
                allowCredentials: [],
              },
            }),
        });
      }
      if (url.includes('/login-verify')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: 'mock-jwt-token',
              token_type: 'bearer',
              user: { email: 'test@example.com' },
            }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const result = await PasskeyAuth.loginWithPasskey('test@example.com');
    expect(result.access_token).toBe('mock-jwt-token');
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
