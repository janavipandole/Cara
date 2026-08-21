/**
 * Back to Top Floating Action Button Controller
 */
export class ScrollTopFab {
  constructor(options = {}) {
    this.threshold = options.threshold || 300;
    this.button = null;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;
    this.button = document.createElement('button');
    this.button.id = 'scroll-top-fab';
    this.button.setAttribute('aria-label', 'Scroll to top of page');
    this.button.innerHTML = '↑';
    this.button.style.display = 'none';
    document.body.appendChild(this.button);

    window.addEventListener('scroll', () => this.onScroll());
    this.button.addEventListener('click', () => this.scrollToTop());
  }

  onScroll() {
    if (!this.button) return;
    const scrollY = typeof window !== 'undefined' ? window.scrollY || 0 : 0;
    if (scrollY > this.threshold) {
      this.button.style.display = 'block';
    } else {
      this.button.style.display = 'none';
    }
  }

  scrollToTop() {
    if (!this.button) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function getScrollTopFabStatusHelper67() {
  return {
    status: 'active',
    hasScrollTopFab: typeof window !== 'undefined' && !!window.ScrollTopFab,
  };
}
