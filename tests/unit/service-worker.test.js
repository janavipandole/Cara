import { createRequire } from 'node:module';
import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  globalThis.self = globalThis;
  globalThis.self.addEventListener = vi.fn();
  globalThis.self.skipWaiting = vi.fn();
  globalThis.self.clients = { claim: vi.fn() };
  globalThis.self.location = { origin: 'https://cara.example' };
});

const require = createRequire(import.meta.url);
const {
  isApiRequest,
  isNavigationRequest,
  isStaticAsset,
  shouldBypassCache,
  CACHE_NAME,
} = require('../../service-worker.js');

describe('service-worker cache strategy', () => {
  it('bumps cache version past v1', () => {
    expect(CACHE_NAME).not.toBe('cara-cache-v1');
  });

  it('treats /api paths as network-only', () => {
    const url = new URL('https://cara.example/api/products/');
    expect(isApiRequest(url)).toBe(true);
    expect(
      shouldBypassCache({ mode: 'cors', headers: new Headers() }, url),
    ).toBe(true);
  });

  it('treats navigations as network-first', () => {
    const url = new URL('https://cara.example/shop.html');
    expect(
      isNavigationRequest({
        mode: 'navigate',
        headers: new Headers({ accept: 'text/html' }),
      }),
    ).toBe(true);
    expect(
      shouldBypassCache(
        { mode: 'navigate', headers: new Headers({ accept: 'text/html' }) },
        url,
      ),
    ).toBe(true);
  });

  it('allows cache-first for static assets only', () => {
    expect(isStaticAsset(new URL('https://cara.example/style.css'))).toBe(true);
    expect(isStaticAsset(new URL('https://cara.example/api/orders'))).toBe(false);
  });

  it('treats images and scripts as static assets', () => {
    expect(isStaticAsset(new URL('https://cara.example/images/f1.jpg'))).toBe(
      true,
    );
    expect(isStaticAsset(new URL('https://cara.example/app.min.js'))).toBe(
      true,
    );
    expect(isStaticAsset(new URL('https://cara.example/index.html'))).toBe(
      false,
    );
  });

  it('does not bypass cache for same-origin static navigations', () => {
    const url = new URL('https://cara.example/shop.html');
    expect(isNavigationRequest({ mode: 'navigate' })).toBe(true);
    expect(shouldBypassCache({ mode: 'navigate' }, url)).toBe(true);
  });

  it('bumps the cache version ahead of any v1 assets', () => {
    expect(CACHE_NAME).toMatch(/^cara-cache-v\d+$/);
  });
});
