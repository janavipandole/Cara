import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = `
    <div id="loading-indicator"></div>
    <div id="shared-image-preview"></div>
    <div id="search-results"></div>
    <div id="error-message"></div>
    <div id="similar-products-grid"></div>
  `;
});

async function load() {
  await import('../../js/visual-search.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
  await new Promise((r) => setTimeout(r, 20));
}

describe('visual-search', () => {
  it('reveals the error message when no shared image is available', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await load();
    expect(document.getElementById('error-message').style.display).toBe(
      'block',
    );
  });

  it('reveals the error message when the URL carries an error param', async () => {
    // Simulate an error query param on the page URL.
    const originalSearch = window.location.search;
    Object.defineProperty(window, 'location', {
      value: { search: '?error=processing' },
      configurable: true,
    });
    try {
      await load();
      expect(document.getElementById('error-message').style.display).toBe(
        'block',
      );
    } finally {
      Object.defineProperty(window, 'location', {
        value: { search: originalSearch },
        configurable: true,
      });
    }
  });
});
