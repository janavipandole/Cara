/**
 * Cara Premium Component Logic: Image Gallery Thumbnails
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Image Gallery Thumbnails component demo initialized.');
    const main = document.getElementById('mainImage');
      const thumbs = document.querySelectorAll('.thumb');
      thumbs.forEach(t => {
        t.addEventListener('click', function() {
          thumbs.forEach(x => x.classList.remove('active'));
          this.classList.add('active');
          main.src = this.src;
        });
      });
  });
})();