import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('skip-link', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<main id="main-content" tabindex="-1">Shop</main>';
  });

  it('injects a skip link targeting #main-content', async () => {
    await import('../../assets/js/skip-link.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const link = document.querySelector('a.skip-to-content-btn');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('#main-content');
    expect(link.textContent).toMatch(/skip to main content/i);
  });

  it('moves focus to main content when activated', async () => {
    await import('../../assets/js/skip-link.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const link = document.querySelector('a.skip-to-content-btn');
    const main = document.getElementById('main-content');
    const focus = vi.spyOn(main, 'focus').mockImplementation(() => {});
    link.click();
    expect(focus).toHaveBeenCalled();
  });
});
