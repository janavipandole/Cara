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
});
