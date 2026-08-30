import { beforeEach, describe, expect, it, vi } from 'vitest';

function setupForm(value) {
  document.body.innerHTML = `
    <form id="test-form">
      <input type="text" id="field" value="${value}">
      <button type="submit">Send</button>
    </form>
  `;
}

beforeEach(() => {
  vi.resetModules();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

async function submitBuild() {
  const form = document.getElementById('test-form');
  const event = new Event('submit', { cancelable: true });
  form.dispatchEvent(event);
  return event;
}

describe('input-shield', () => {
  it('blocks submit and clears the field when it contains a script tag', async () => {
    setupForm('<script>alert(1)</script>');
    await import('../../js/input-shield.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const event = await submitBuild();
    expect(event.defaultPrevented).toBe(true);
    expect(document.getElementById('field').value).toBe('');
  });

  it('blocks submit when the field contains an onload handler', async () => {
    setupForm('x onload=alert(1)');
    await import('../../js/input-shield.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const event = await submitBuild();
    expect(event.defaultPrevented).toBe(true);
  });

  it('allows plain text input through without blocking', async () => {
    setupForm('hello world');
    await import('../../js/input-shield.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const event = await submitBuild();
    expect(event.defaultPrevented).toBe(false);
    expect(document.getElementById('field').value).toBe('hello world');
  });

  it('should detect SQL injection keywords in user inputs', async () => {
    await import('../../js/input-shield.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(window.containsSqlInjectionKeywords('SELECT * FROM users')).toBe(true);
    expect(window.containsSqlInjectionKeywords('DROP TABLE orders')).toBe(true);
    expect(window.containsSqlInjectionKeywords('insert into cart values')).toBe(true);
  });

  it('should ignore SQL keywords in non-string or safe input', async () => {
    await import('../../js/input-shield.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(window.containsSqlInjectionKeywords('hello world')).toBe(false);
    expect(window.containsSqlInjectionKeywords(null)).toBe(false);
    expect(window.containsSqlInjectionKeywords(undefined)).toBe(false);
    expect(window.containsSqlInjectionKeywords(42)).toBe(false);
  });

  it('should match SQL keywords case-insensitively', async () => {
    await import('../../js/input-shield.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(window.containsSqlInjectionKeywords('select name from users')).toBe(true);
    expect(window.containsSqlInjectionKeywords('Delete FROM sessions')).toBe(true);
  });

  it('installs the shield immediately when the DOM is already ready', async () => {
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: 'complete',
    });
    setupForm('<script>alert(1)</script>');
    await import('../../js/input-shield.js');

    const event = await submitBuild();
    expect(event.defaultPrevented).toBe(true);
    expect(document.getElementById('field').value).toBe('');
  });

  it('skips installation when the form is already flagged as protected', async () => {
    setupForm('<script>alert(1)</script>');
    document.getElementById('test-form').dataset.inputShieldInstalled = 'true';

    await import('../../js/input-shield.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const event = await submitBuild();
    expect(event.defaultPrevented).toBe(false);
  });

  it('does not throw when imported in a non-browser environment', async () => {
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;
    vi.stubGlobal('document', undefined);
    vi.stubGlobal('window', undefined);

    await expect(import('../../js/input-shield.js')).resolves.toBeDefined();

    vi.stubGlobal('document', originalDocument);
    vi.stubGlobal('window', originalWindow);
  });

  it('blocks submit when an event handler attribute has surrounding whitespace', async () => {
    setupForm('x onload = alert(1)');
    await import('../../js/input-shield.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const event = await submitBuild();
    expect(event.defaultPrevented).toBe(true);
  });

  it('blocks submit when a javascript: URI has whitespace before the colon', async () => {
    setupForm('javascript :alert(1)');
    await import('../../js/input-shield.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const event = await submitBuild();
    expect(event.defaultPrevented).toBe(true);
  });
});
