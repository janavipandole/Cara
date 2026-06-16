(function () {
  // A cryptographic token signing wrapper using Web Crypto API
  // This ensures local session tokens are signed and validated for integrity before access.
  const SECRET_KEY_STRING = 'cara_crypto_secure_key_v2';

  async function getKey() {
    const enc = new TextEncoder();
    return await window.crypto.subtle.importKey(
      'raw',
      enc.encode(SECRET_KEY_STRING),
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
    return await window.crypto.subtle.verify(
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
        const payload = JSON.stringify({ data: strVal, signature: signature });

        // Encode to base64 to obscure the JSON structure
        localStorage.setItem(key, btoa(payload));
      } catch (e) {
        console.error('Failed to securely store item', e);
      }
    },
    getItem: async function (key) {
      const val = localStorage.getItem(key);
      if (!val) return null;
      try {
        const decoded = atob(val);
        const payload = JSON.parse(decoded);

        // Verify integrity
        const isValid = await verifyData(payload.data, payload.signature);
        if (!isValid) {
          console.warn('SecureStorage integrity check failed. Data tampered.');
          localStorage.removeItem(key);
          return null;
        }

        return JSON.parse(payload.data);
      } catch (e) {
        return null;
      }
    },
    removeItem: function (key) {
      localStorage.removeItem(key);
    },
  };
})();
