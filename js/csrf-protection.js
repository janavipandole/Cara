// Anti-CSRF Token Generation & Validation Module for E-Commerce Forms

export function generateCSRFToken() {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getOrCreateCSRFToken() {
  if (typeof sessionStorage === 'undefined') return 'fallback-csrf-token';
  let token = sessionStorage.getItem('cara_csrf_token');
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem('cara_csrf_token', token);
  }
  return token;
}

export function injectCSRFInputs(formContainer = document) {
  if (!formContainer || typeof formContainer.querySelectorAll !== 'function') return;
  const token = getOrCreateCSRFToken();
  const forms = formContainer.querySelectorAll('form');

  forms.forEach((form) => {
    let input = form.querySelector('input[name="_csrf"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = '_csrf';
      form.appendChild(input);
    }
    input.value = token;
  });
}

export function attachCSRFHeader(headers = {}) {
  const token = getOrCreateCSRFToken();
  return {
    ...headers,
    'X-CSRF-Token': token,
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => injectCSRFInputs());
}
