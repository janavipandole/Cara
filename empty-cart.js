function safeParseJSON(key, fallback = '[]') {
  try {
    return JSON.parse(localStorage.getItem(key) || fallback);
  } catch (err) {
    console.warn('Failed to parse stored data:', err);
    try {
      return JSON.parse(fallback);
    } catch (err2) {
      console.warn('Failed to parse fallback data:', err2);
      return [];
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Override the existing handleEmptyCartView in app.js
  window.handleEmptyCartView = function () {
    const cart = safeParseJSON('productsInCart');
    const cartMain = document.querySelector('.cartmain');
    const cartGrid = document.getElementById('cart');
    const cartAdd = document.getElementById('cart-add');
    const emptyContainer = document.getElementById('empty-cart-state');

    if (window.location.pathname.includes('cart.html')) {
      if (cart.length === 0) {
        if (cartMain) cartMain.style.display = 'none';
        if (cartGrid) cartGrid.style.display = 'none';
        if (cartAdd) cartAdd.style.display = 'none';
        if (emptyContainer) emptyContainer.style.display = 'flex';
      } else {
        if (cartMain) cartMain.style.display = '';
        if (cartGrid) cartGrid.style.display = '';
        if (cartAdd) cartAdd.style.display = '';
        if (emptyContainer) emptyContainer.style.display = 'none';
      }
    }
  };

  // Call it initially
  if (typeof handleEmptyCartView === 'function') {
    handleEmptyCartView();
  }
});
