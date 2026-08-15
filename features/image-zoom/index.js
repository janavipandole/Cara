/**
 * Cara Premium Component Logic: Image Zoom on Hover
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Image Zoom on Hover component demo initialized.');
    const container = document.getElementById('zoomContainer');
      const img = document.getElementById('zoomImage');
      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        img.style.transformOrigin = `${x}px ` + `${y}px`;
        img.style.transform = 'scale(2)';
      });
      container.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });
  });
})();