/**
 * Cara Premium Component Logic: Image Lazy Loading
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Image Lazy Loading component demo initialized.');
    const img = document.getElementById('lazyImage');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.src = entry.target.dataset.src;
            entry.target.classList.add('loaded');
            observer.unobserve(entry.target);
          }
        });
      });
      observer.observe(img);
  });
})();