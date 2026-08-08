import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sanitizeHTML, sanitizeDOMNode } from '../../js/utils/sanitize.js';

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

  it('should return non-string input unchanged', () => {
    expect(sanitizeHTML(null)).toBeNull();
    expect(sanitizeHTML(undefined)).toBeUndefined();
    expect(sanitizeHTML(42)).toBe(42);
  });

  it('should remove script, iframe, object and embed tags via sanitizeDOMNode', () => {
    const container = document.createElement('div');
    container.innerHTML =
      '<p>safe</p><script>alert(1)</script><iframe src="x"></iframe><object></object><embed>';
    sanitizeDOMNode(container);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.querySelector('object')).toBeNull();
    expect(container.querySelector('embed')).toBeNull();
    expect(container.querySelector('p')).not.toBeNull();
  });

  it('should no-op when sanitizeDOMNode receives a non-element', () => {
    expect(() => sanitizeDOMNode(null)).not.toThrow();
    expect(() => sanitizeDOMNode({})).not.toThrow();
  });
});
