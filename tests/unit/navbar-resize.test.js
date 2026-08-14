import { describe, it, expect, beforeEach } from 'vitest';

describe('Navbar Mobile Navigation Resize Handler', () => {
  beforeEach(() => {
    document.body.innerHTML = '<ul id="navbar" class="active"><li>Item</li></ul>';
  });

  it('removes active class from navbar on window resize to desktop viewport (> 799px)', () => {
    const nav = document.getElementById('navbar');
    expect(nav.classList.contains('active')).toBe(true);

    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    window.dispatchEvent(new Event('resize'));

    expect(nav.classList.contains('active')).toBe(false);
  });
});
