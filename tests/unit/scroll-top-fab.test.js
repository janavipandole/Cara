import { describe, it, expect, beforeEach } from 'vitest';
import { ScrollTopFab } from '../../js/scroll-top-fab.js';

describe('ScrollTopFab', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('creates button in body on initialization', () => {
    new ScrollTopFab();
    const btn = document.getElementById('scroll-top-fab');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-label')).toBe('Scroll to top of page');
  });
});
