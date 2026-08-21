import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = '<section id="terms"><p>Terms of Service</p></section>';
});

async function load() {
  await import('../../js/terms-print.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('terms-print', () => {
  it('injects a print button before the section', async () => {
    await load();
    const section = document.getElementById('terms');
    const btn = section.previousElementSibling;
    expect(btn).toBeTruthy();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.textContent).toContain('Print');
  });

  it('injects print styles into the document head', async () => {
    await load();
    const styles = Array.from(document.head.querySelectorAll('style'));
    const printStyle = styles.find((s) => s.textContent.includes('@media print'));
    expect(printStyle).toBeTruthy();
  });

  it('calls window.print when the button is clicked', async () => {
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {});
    await load();
    const btn = document.getElementById('terms').previousElementSibling;
    btn.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('handles a document without a section element', async () => {
    // The module falls back to document.body; verify it does not throw.
    document.body.innerHTML = '<div id="terms">Terms of Service</div>';
    await expect(load()).resolves.not.toThrow();
  });

  it('injects the button immediately when the DOM is already ready', async () => {
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: 'complete',
    });
    document.body.innerHTML = '<section id="terms"><p>Terms of Service</p></section>';
    await import('../../js/terms-print.js');

    const btn = document.getElementById('terms').previousElementSibling;
    expect(btn).toBeTruthy();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.textContent).toContain('Print');
  });
});
