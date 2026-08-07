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
    expect(sanitizeReturnUrl('data:text/html,<script>alert(1)</script>')).toBe('index.html');
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

  test('blocks control characters and whitespace smuggling', () => {
    // Embedded control characters are blocked before any trimming happens.
    expect(sanitizeReturnUrl('java\nscript:alert(1)')).toBe('index.html');
    expect(sanitizeReturnUrl('cart\n.html')).toBe('index.html');
    // Trailing whitespace is trimmed to a safe relative URL.
    expect(sanitizeReturnUrl('cart.html\r\n')).toBe('cart.html');
    expect(sanitizeReturnUrl('\tcart.html')).toBe('cart.html');
  });

  test('blocks encoded and mixed-case protocol evasions', () => {
    expect(sanitizeReturnUrl('JaVaScRiPt:alert(1)')).toBe('index.html');
    expect(sanitizeReturnUrl('HTTP://evil.com')).toBe('index.html');
    expect(sanitizeReturnUrl('//evil.com')).toBe('index.html');
  });

  test('blocks non-html relative paths', () => {
    expect(sanitizeReturnUrl('cart.php')).toBe('index.html');
    expect(sanitizeReturnUrl('admin')).toBe('index.html');
    expect(sanitizeReturnUrl('checkout?x=1')).toBe('index.html');
  });

  test('allows root-relative paths', () => {
    expect(sanitizeReturnUrl('/account/orders.html')).toBe('/account/orders.html');
    expect(sanitizeReturnUrl('/cart')).toBe('/cart');
  });
});
