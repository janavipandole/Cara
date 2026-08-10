import { describe, it, expect, beforeEach } from 'vitest';

// ── Inline the module logic so we can test it in isolation ──────────────────
// (secure-storage.js is an IIFE that attaches to window — we test the
//  underlying sign/verify functions by replicating their logic here)

const KEY_STORAGE_NAME = 'cara_session_signing_key';

async function getTestKey(storage) {
  const existing = storage.getItem(KEY_STORAGE_NAME);
  if (existing) {
    const raw = Uint8Array.from(atob(existing), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey(
      'raw',
      raw,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    );
  }
  const keyMaterial = crypto.getRandomValues(new Uint8Array(32));
  storage.setItem(KEY_STORAGE_NAME, btoa(String.fromCharCode(...keyMaterial)));
  return crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function sign(data, storage) {
  const key = await getTestKey(storage);
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data),
  );
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function verify(data, sigB64, storage) {
  const key = await getTestKey(storage);
  const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
  return crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes,
    new TextEncoder().encode(data),
  );
}

// ────────────────────────────────────────────────────────────────────────────

describe('secure-storage session key management', () => {
  let mockStorage;

  beforeEach(() => {
    const store = {};
    mockStorage = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => {
        store[k] = v;
      },
      removeItem: (k) => {
        delete store[k];
      },
    };
  });

  it('generates a key on first use and stores it in session storage', async () => {
    expect(mockStorage.getItem(KEY_STORAGE_NAME)).toBeNull();
    await getTestKey(mockStorage);
    expect(mockStorage.getItem(KEY_STORAGE_NAME)).not.toBeNull();
  });

  it('reuses the same key within the same session', async () => {
    const k1 = await getTestKey(mockStorage);
    const k2 = await getTestKey(mockStorage);
    // Both calls should use the same stored key — signing with one verifies with the other
    const data = 'test-payload';
    const sig = await crypto.subtle.sign(
      'HMAC',
      k1,
      new TextEncoder().encode(data),
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      k2,
      sig,
      new TextEncoder().encode(data),
    );
    expect(valid).toBe(true);
  });

  it('generates different keys for different sessions', async () => {
    const sessionA = {
      _store: {},
      getItem: function (k) {
        return this._store[k] ?? null;
      },
      setItem: function (k, v) {
        this._store[k] = v;
      },
      removeItem: function (k) {
        delete this._store[k];
      },
    };
    const sessionB = {
      _store: {},
      getItem: function (k) {
        return this._store[k] ?? null;
      },
      setItem: function (k, v) {
        this._store[k] = v;
      },
      removeItem: function (k) {
        delete this._store[k];
      },
    };

    await getTestKey(sessionA);
    await getTestKey(sessionB);

    expect(sessionA.getItem(KEY_STORAGE_NAME)).not.toBe(
      sessionB.getItem(KEY_STORAGE_NAME),
    );
  });

  it('a valid signature verifies correctly', async () => {
    const data = JSON.stringify({ role: 'USER', email: 'test@example.com' });
    const sig = await sign(data, mockStorage);
    expect(await verify(data, sig, mockStorage)).toBe(true);
  });

  it('a tampered payload fails verification', async () => {
    const original = JSON.stringify({
      role: 'USER',
      email: 'test@example.com',
    });
    const sig = await sign(original, mockStorage);

    const tampered = JSON.stringify({
      role: 'ADMIN',
      email: 'test@example.com',
    });
    expect(await verify(tampered, sig, mockStorage)).toBe(false);
  });

  it('a forged signature using a different key fails verification', async () => {
    const data = JSON.stringify({ role: 'USER' });
    const sig = await sign(data, mockStorage);

    // Simulate a fresh session (different key)
    const freshStorage = {
      _store: {},
      getItem: function (k) {
        return this._store[k] ?? null;
      },
      setItem: function (k, v) {
        this._store[k] = v;
      },
      removeItem: function (k) {
        delete this._store[k];
      },
    };
    expect(await verify(data, sig, freshStorage)).toBe(false);
  });
});
