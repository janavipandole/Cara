import { describe, it, expect } from 'vitest';
import { sanitizeHTML } from '../../js/utils/sanitize.js';

describe('js/utils/sanitize.js input validation and sanitization', () => {
  it('should leave safe alphanumeric strings unchanged', () => {
    expect(sanitizeHTML('helloWorld123')).toBe('helloWorld123');
    expect(sanitizeHTML('Standard User Name')).toBe('Standard User Name');
  });

  it('should escape HTML characters (<, >, &, ", \', /)', () => {
    expect(sanitizeHTML('<script>')).toBe('&lt;script&gt;');
    expect(sanitizeHTML('john & doe')).toBe('john &amp; doe');
    expect(sanitizeHTML('double"quote')).toBe('double&quot;quote');
    expect(sanitizeHTML("single'quote")).toBe('single&#x27;quote');
    expect(sanitizeHTML('test/path')).toBe('test&#x2F;path');
  });

  it('should strip inline event handlers', () => {
    expect(sanitizeHTML('onload="alert(1)"')).toBe('&quot;alert(1)&quot;');
    expect(sanitizeHTML('onerror=foo')).toBe('foo');
  });

  it('should strip javascript: and data: URIs', () => {
    expect(sanitizeHTML('javascript:alert(1)')).toBe('alert(1)');
    expect(sanitizeHTML('data:text/html,payload')).toBe(
      'text&#x2F;html,payload',
    );
  });

  it('should prevent multi-character sanitization bypasses', () => {
    expect(sanitizeHTML('oonload=alert(1)')).toBe('oalert(1)');
  });
});
