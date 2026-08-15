/**
 * Cara Premium Component Logic: Product Skeleton Loading
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Product Skeleton Loading component demo initialized.');
    const grid = document.getElementById('loadingGrid');
      const btn = document.getElementById('toggleLoading');
      let isLoading = true;
      
      function render() {
        if (isLoading) {
          grid.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';
        } else {
          grid.innerHTML = '<div class="action-btn" style="height:150px;display:flex;align-items:center;justify-content:center;">Product A Loaded</div><div class="action-btn" style="height:150px;display:flex;align-items:center;justify-content:center;">Product B Loaded</div>';
        }
      }
      btn.addEventListener('click', () => {
        isLoading = !isLoading;
        render();
      });
      render();
  });
})();