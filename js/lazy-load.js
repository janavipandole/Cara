/**
 * lazy-load.js
 * Implements Intersection Observer for image lazy loading
 */
document.addEventListener('DOMContentLoaded', () => {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Trigger CSS fade-in
          img.classList.add('fade-in-lazy');
          
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => {
      // Add initial opaque class
      img.classList.add('lazy-preload');
      imageObserver.observe(img);
    });
  }
});
