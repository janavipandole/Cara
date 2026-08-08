import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ScrollTopFab } from '../../js/scroll-top-fab.js';

describe('ScrollTopFab', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates button in body on initialization', () => {
    new ScrollTopFab();
    const btn = document.getElementById('scroll-top-fab');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-label')).toBe('Scroll to top of page');
  });

  it('hides the button below the threshold and shows it above', () => {
    const fab = new ScrollTopFab({ threshold: 300 });
    const btn = document.getElementById('scroll-top-fab');
    expect(btn.style.display).toBe('none');

    window.scrollY = 100;
    fab.onScroll();
    expect(btn.style.display).toBe('none');

    window.scrollY = 500;
    fab.onScroll();
    expect(btn.style.display).toBe('block');
  });

  it('scrolls to the top on button click', () => {
    const fab = new ScrollTopFab();
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    document.getElementById('scroll-top-fab').click();
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('uses a custom scroll threshold when provided', () => {
    const fab = new ScrollTopFab({ threshold: 50 });
    const btn = document.getElementById('scroll-top-fab');
    window.scrollY = 60;
    fab.onScroll();
    expect(btn.style.display).toBe('block');
  });
});
