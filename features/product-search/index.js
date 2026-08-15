/**
 * Cara Premium Component Logic: Live Product Search Filter
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Live Product Search Filter component demo initialized.');
    const input = document.getElementById('searchInput');
      const results = document.getElementById('results');
      const products = ['Floral Dress', 'Winter Jacket', 'Casual Sneakers', 'Silk Scarf', 'Cotton T-Shirt', 'Denim Jeans'];
      
      function search(val) {
        const filtered = products.filter(x => x.toLowerCase().includes(val.toLowerCase()));
        results.innerHTML = filtered.map(x => `<div class="result-card">${x}</div>`).join('');
      }
      input.addEventListener('input', (e) => search(e.target.value));
      search('');
  });
})();