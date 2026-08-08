// IntersectionObserver Image Lazy Loading Module

export function initLazyLoadObserver(selector = 'img.lazyload', options = {}) {
  if (typeof document === 'undefined') return null;

  const defaultOptions = {
    root: null,
    rootMargin: '50px 0px',
    threshold: 0.01,
    ...options,
  };

  const lazyImages = Array.from(document.querySelectorAll(selector));

  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver: load images immediately.
    lazyImages.forEach((img) => {
      if (img.dataset.src) img.src = img.dataset.src;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      img.classList.remove('lazyload');
      img.classList.add('lazyloaded');
    });
    // Return a minimal observer-like object so the return contract is consistent.
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
      isFallback: true,
    };
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.classList.remove('lazyload');
        img.classList.add('lazyloaded');
        unobserveLazyElement(obs, img);
      }
    });
  }, defaultOptions);

  lazyImages.forEach((img) => observer.observe(img));
  return observer;
}

if (typeof document !== 'undefined') {
  // Support the case where the DOM is already parsed when this script loads.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initLazyLoadObserver();
    });
  } else {
    initLazyLoadObserver();
  }
}


export function unobserveLazyElement(observer, element) { if (observer && typeof observer.unobserve === 'function' && element) { observer.unobserve(element); } }