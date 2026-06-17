(function () {
  // localStorage tamper-detection wrapper using Web Crypto HMAC-SHA-256.
  //
  // The signing key is generated randomly per browser session and stored in
  // sessionStorage. It is never hardcoded in source, never persisted across
  // tab closes, and is different for every session — so manually edited
  // localStorage values will fail the integrity check.
  //
  // Note: this does NOT protect against XSS (an attacker with script execution
  // can read sessionStorage too). Server-side token validation remains the
  // authoritative security boundary for sensitive operations.

  const KEY_STORAGE_NAME = 'cara_session_signing_key';

  async function getKey() {
    const existing = sessionStorage.getItem(KEY_STORAGE_NAME);
    if (existing) {
      const raw = Uint8Array.from(atob(existing), (c) => c.charCodeAt(0));
      return window.crypto.subtle.importKey(
        'raw',
        raw,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      );
    }

    // Generate a fresh 256-bit random key for this session
    const keyMaterial = window.crypto.getRandomValues(new Uint8Array(32));
    sessionStorage.setItem(
      KEY_STORAGE_NAME,
      btoa(String.fromCharCode(...keyMaterial))
    );
    return window.crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }

  async function signData(data) {
    const key = await getKey();
    const enc = new TextEncoder();
    const signature = await window.crypto.subtle.sign(
      'HMAC',
      key,
      enc.encode(data)
    );
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  async function verifyData(data, signatureBase64) {
    const key = await getKey();
    const enc = new TextEncoder();
    const signatureBytes = Uint8Array.from(atob(signatureBase64), (c) =>
      c.charCodeAt(0)
    );
    return window.crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      enc.encode(data)
    );
  }

  window.SecureStorage = {
    setItem: async function (key, value) {
      try {
        const strVal = JSON.stringify(value);
        const signature = await signData(strVal);
        const payload = JSON.stringify({ data: strVal, signature });
        localStorage.setItem(key, btoa(payload));
      } catch (e) {
        console.error('SecureStorage: failed to store item', e);
      }
    },

    getItem: async function (key) {
      const val = localStorage.getItem(key);
      if (!val) return null;
      try {
        const payload = JSON.parse(atob(val));
        const isValid = await verifyData(payload.data, payload.signature);
        if (!isValid) {
          console.warn(
            'SecureStorage: integrity check failed — removing item',
            key
          );
          localStorage.removeItem(key);
          return null;
        }
        return JSON.parse(payload.data);
      } catch {
        return null;
      }
    },

    removeItem: function (key) {
      localStorage.removeItem(key);
    },
  };
})();
