import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('js/utils/sanitize.js — sanitizeHTML', () => {
  beforeEach(async () => {
    vi.resetModules();
    await import('../../js/utils/sanitize.js');
  });

  it('escapes < and > characters', async () => {
    const result = window.sanitizeHTML('<script>alert("xss")</script>');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).not.toContain('<script>');
  });

  it('escapes ampersands', async () => {
    const result = window.sanitizeHTML('foo & bar');
    expect(result).toContain('&amp;');
  });

  it('escapes double quotes', async () => {
    const result = window.sanitizeHTML('say "hello"');
    expect(result).toContain('&quot;');
  });

  it('escapes single quotes', async () => {
    const result = window.sanitizeHTML("it's fine");
    expect(result).toContain('&#x27;');
  });

  it('escapes forward slashes', async () => {
    const result = window.sanitizeHTML('a/b/c');
    expect(result).toContain('&#x2F;');
  });

  it('removes inline event handlers like onclick', async () => {
    const result = window.sanitizeHTML(
      '<div onclick="alert(1)">Click me</div>',
    );
    expect(result).not.toContain('onclick');
  });

  it('removes javascript: protocol', async () => {
    const result = window.sanitizeHTML(
      '<a href="javascript:alert(1)">Link</a>',
    );
    expect(result).not.toContain('javascript:');
  });

  it('removes data: protocol', async () => {
    const result = window.sanitizeHTML(
      '<img src="data:text/html,<h1>xss</h1>">',
    );
    expect(result).not.toContain('data:');
  });

  it('removes onerror handlers', async () => {
    const result = window.sanitizeHTML('<img onerror="alert(1)" src="x">');
    expect(result).not.toContain('onerror');
  });

  it('sanitizeHTML is exposed on window', async () => {
    await import('../../js/utils/sanitize.js');
    expect(typeof window.sanitizeHTML).toBe('function');
  });
});
