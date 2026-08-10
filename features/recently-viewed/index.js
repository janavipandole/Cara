/**
 * Cara Premium Component Logic: Recently Viewed Products Carousel
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Recently Viewed Products Carousel component demo initialized.');
    const container = document.getElementById('recentCarousel');
      const viewed = ['Sneakers', 'Silk Dress', 'Black Suit', 'Fitted Cap', 'Leather Wallet'];
      container.innerHTML = viewed.map(x => `<div class="carousel-card"><i class="fa-solid fa-shirt" style="font-size:24px;margin-bottom:8px;"></i><div>${x}</div></div>`).join('');
  });
})();