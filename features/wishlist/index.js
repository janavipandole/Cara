/**
 * Cara Premium Component Logic: LocalStorage Wishlist Manager
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('LocalStorage Wishlist Manager component demo initialized.');
    const list = document.getElementById('wishlistItems');
      const addBtn = document.getElementById('addWishlistItem');
      const clearBtn = document.getElementById('clearWishlist');
      let items = JSON.parse(localStorage.getItem('demo_wishlist') || '[]');
      
      function render() {
        list.innerHTML = '';
        items.forEach((x, i) => {
          const li = document.createElement('li');
          li.appendChild(document.createTextNode(`${x} `));
          const icon = document.createElement('i');
          icon.className = 'fa-solid fa-trash';
          icon.style.cssText = 'cursor:pointer;color:#ef4444;';
          icon.addEventListener('click', () => window.removeWishItem(i));
          li.appendChild(icon);
          list.appendChild(li);
        });
      }
      window.removeWishItem = function(index) {
        items.splice(index, 1);
        localStorage.setItem('demo_wishlist', JSON.stringify(items));
        render();
      };
      addBtn.addEventListener('click', () => {
        items.push('Premium Outfit #' + Math.floor(Math.random() * 1000));
        localStorage.setItem('demo_wishlist', JSON.stringify(items));
        render();
      });
      clearBtn.addEventListener('click', () => {
        items = [];
        localStorage.setItem('demo_wishlist', JSON.stringify(items));
        render();
      });
      render();
  });
})();