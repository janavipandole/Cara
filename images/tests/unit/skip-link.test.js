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

  it('reveals the link on focus and hides it on blur', async () => {
    await import('../../assets/js/skip-link.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const link = document.querySelector('a.skip-to-content-btn');
    expect(link.style.top).toBe('-100px');

    link.dispatchEvent(new Event('focus'));
    expect(link.style.top).toBe('20px');

    link.dispatchEvent(new Event('blur'));
    expect(link.style.top).toBe('-100px');
  });

  it('adds a tabindex to main content if it lacks one on click', async () => {
    document.body.innerHTML = '<main id="main-content">Shop</main>';
    await import('../../assets/js/skip-link.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const link = document.querySelector('a.skip-to-content-btn');
    const main = document.getElementById('main-content');
    link.click();
    expect(main.hasAttribute('tabindex')).toBe(true);
  });
});
