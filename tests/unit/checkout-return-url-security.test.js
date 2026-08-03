import { describe, test, expect } from 'vitest';

function sanitizeReturnUrl(url) {
  if (!url || typeof url !== 'string') return 'index.html';

  var trimmed = url.trim();

  // Block protocol handlers, protocol-relative URLs, and control characters
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('\\\\') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ||
    /[\r\n\t]/.test(trimmed)
  ) {
    return 'index.html';
  }

  // Allow relative filenames (e.g., 'cart.html', 'shop.html') or relative paths starting with '/'
  if (!trimmed.startsWith('/') && !/^[a-zA-Z0-9_.-]+\.html$/i.test(trimmed)) {
    return 'index.html';
  }

  return trimmed;
}

describe('Open Redirect & SSRF Security Defense', () => {
  test('allows safe relative filenames', () => {
    expect(sanitizeReturnUrl('cart.html')).toBe('cart.html');
    expect(sanitizeReturnUrl('shop.html')).toBe('shop.html');
    expect(sanitizeReturnUrl('/orders.html')).toBe('/orders.html');
  });

  test('blocks absolute URLs and protocol handlers (open redirect)', () => {
    expect(sanitizeReturnUrl('http://evil.com')).toBe('index.html');
    expect(sanitizeReturnUrl('https://attacker.org/steal')).toBe('index.html');
    expect(sanitizeReturnUrl('javascript:alert(1)')).toBe('index.html');
    expect(sanitizeReturnUrl('data:text/html,<script>alert(1)</script>')).toBe(
      'index.html',
    );
  });

  test('blocks protocol-relative and backslash evasion payloads', () => {
    expect(sanitizeReturnUrl('//evil.com/login')).toBe('index.html');
    expect(sanitizeReturnUrl('\\\\malicious.com')).toBe('index.html');
  });

  test('falls back to index.html for empty or invalid inputs', () => {
    expect(sanitizeReturnUrl(null)).toBe('index.html');
    expect(sanitizeReturnUrl('')).toBe('index.html');
    expect(sanitizeReturnUrl(undefined)).toBe('index.html');
  });
});
