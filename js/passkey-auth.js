/**
 * WebAuthn Passkey Authentication & Biometric Login Engine
 * 
 * Provides client-side methods for WebAuthn credential registration and authentication,
 * including base64URL encoding/decoding utilities and fallback support.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PasskeyAuth = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


  function bufferToBase64URL(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  function base64URLToBuffer(base64URL) {
    let base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const binary = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function isWebAuthnSupported() {
    return (
      typeof window !== 'undefined' &&
      typeof window.PublicKeyCredential !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.credentials !== 'undefined' &&
      typeof navigator.credentials.create === 'function'
    );
  }

  async function registerPasskey(email, options = {}) {
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format.');
    }
    if (!isWebAuthnSupported()) {
      throw new Error('WebAuthn biometrics is not supported in this browser.');
    }

    const apiBaseUrl = options.apiBaseUrl || window.CARA_API_BASE_URL || '';
    const fetchFunc = typeof window.fetchWithTimeout === 'function' ? window.fetchWithTimeout : fetch;

    // Step 1: Fetch registration challenge from backend
    const optRes = await fetchFunc(`${apiBaseUrl}/api/auth/passkey/register-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const optData = await optRes.json();
    if (!optRes.ok) {
      throw new Error(optData.detail || 'Failed to initialize passkey registration.');
    }

    const publicKeyOptions = optData.publicKey;
    publicKeyOptions.challenge = base64URLToBuffer(publicKeyOptions.challenge);
    publicKeyOptions.user.id = base64URLToBuffer(publicKeyOptions.user.id);
    if (publicKeyOptions.excludeCredentials) {
      publicKeyOptions.excludeCredentials = publicKeyOptions.excludeCredentials.map((cred) => ({
        ...cred,
        id: base64URLToBuffer(cred.id),
      }));
    }

    // Step 2: Prompt WebAuthn browser registration
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    });

    if (!credential) {
      throw new Error('Passkey creation was cancelled or failed.');
    }

    // Step 3: Format and send response to backend for verification
    const verificationBody = {
      email,
      credential: {
        id: credential.id,
        rawId: bufferToBase64URL(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferToBase64URL(credential.response.attestationObject),
          clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
        },
      },
    };

    const verifyRes = await fetchFunc(`${apiBaseUrl}/api/auth/passkey/register-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(verificationBody),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      throw new Error(verifyData.detail || 'Passkey verification failed.');
    }

    return verifyData;
  }

  async function loginWithPasskey(email = '', options = {}) {
    if (email && !isValidEmail(email)) {
      throw new Error('Invalid email format.');
    }
    if (!isWebAuthnSupported()) {
      throw new Error('WebAuthn biometrics is not supported in this browser.');
    }

    const apiBaseUrl = options.apiBaseUrl || window.CARA_API_BASE_URL || '';
    const fetchFunc = typeof window.fetchWithTimeout === 'function' ? window.fetchWithTimeout : fetch;

    // Step 1: Request authentication challenge options
    const optRes = await fetchFunc(`${apiBaseUrl}/api/auth/passkey/login-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const optData = await optRes.json();
    if (!optRes.ok) {
      throw new Error(optData.detail || 'Failed to initialize biometric login.');
    }

    const publicKeyOptions = optData.publicKey;
    publicKeyOptions.challenge = base64URLToBuffer(publicKeyOptions.challenge);
    if (publicKeyOptions.allowCredentials) {
      publicKeyOptions.allowCredentials = publicKeyOptions.allowCredentials.map((cred) => ({
        ...cred,
        id: base64URLToBuffer(cred.id),
      }));
    }

    // Step 2: Prompt WebAuthn browser authentication assertion
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyOptions,
    });

    if (!assertion) {
      throw new Error('Biometric authentication was cancelled.');
    }

    // Step 3: Verify authentication assertion with backend
    const verificationBody = {
      email,
      credential: {
        id: assertion.id,
        rawId: bufferToBase64URL(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: bufferToBase64URL(assertion.response.authenticatorData),
          clientDataJSON: bufferToBase64URL(assertion.response.clientDataJSON),
          signature: bufferToBase64URL(assertion.response.signature),
          userHandle: assertion.response.userHandle
            ? bufferToBase64URL(assertion.response.userHandle)
            : null,
        },
      },
    };

    const verifyRes = await fetchFunc(`${apiBaseUrl}/api/auth/passkey/login-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(verificationBody),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      throw new Error(verifyData.detail || 'Biometric authentication verification failed.');
    }

    return verifyData;
  }

  return {
    isWebAuthnSupported,
    registerPasskey,
    loginWithPasskey,
    bufferToBase64URL,
    base64URLToBuffer,
  };
});
