// utils.js - Shared utility functions for Cara project

// Show toast notification
export function showToast(message, type = 'success') {
  const containerId = 'toast-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.success} toast-icon"></i>
    <span class="toast-msg"></span>
    <button class="toast-close" aria-label="Close notification">&times;</button>
    <div class="toast-progress"></div>`;
  toast.querySelector('.toast-msg').textContent = message;
  toast
    .querySelector('.toast-close')
    .addEventListener('click', () => dismissToast(toast));
  container.appendChild(toast);
  setTimeout(() => dismissToast(toast), 4000);
}

function dismissToast(toast) {
  if (!toast || toast.classList.contains('toast-hiding')) return;
  toast.classList.add('toast-hiding');
  toast.addEventListener('animationend', () => toast.remove());
}

// Price formatter
export function formatPrice(price) {
  const num =
    typeof price === 'string' ? parseFloat(price.replace(/[₹$,]/g, '')) : price;
  return `₹${Math.round(num)}`;
}

// Save cart to localStorage
export function saveCart(cart) {
  localStorage.setItem('productsInCart', JSON.stringify(cart));
}

// Load cart and render UI
export function loadCart() {
  const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  handleEmptyCartView();
  const itemsContainer = document.getElementById('cart-items-container');
  if (!itemsContainer) return;
  itemsContainer.innerHTML = '';
  let subtotal = 0;
  cart.forEach((item, index) => {
    const itemPrice = item.price;
    const itemSubtotal = itemPrice * item.quantity;
    subtotal += itemSubtotal;
    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.innerHTML = `
      <div class="cart-item-left">
        <div class="cart-item-img-wrap"><img src="${item.image}" alt="${item.name}"/></div>
        <div class="cart-item-details">
          <span class="cart-item-brand">${item.brand || 'Premium Brand'}</span>
          <h5 class="cart-item-title">${item.name}</h5>
          <span class="cart-item-size">Size: ${item.size}</span>
        </div>
      </div>
      <div class="cart-item-right">
        <div class="cart-item-price">₹${itemPrice.toLocaleString('en-IN')}</div>
        <div class="qty-selector">
          <button class="qty-btn minus" aria-label="Decrease quantity" onclick="event.stopPropagation(); changeQuantity(${index}, -1)">
            <i class="ri-subtract-line"></i>
          </button>
          <input type="number" class="qty-input" value="${item.quantity}" readonly />
          <button class="qty-btn plus" aria-label="Increase quantity" onclick="event.stopPropagation(); changeQuantity(${index}, 1)">
            <i class="ri-add-line"></i>
          </button>
        </div>
        <div class="cart-item-subtotal">₹${itemSubtotal.toLocaleString('en-IN')}</div>
        <button class="cart-item-remove" aria-label="Remove item" onclick="event.stopPropagation(); removeItem(${index})">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>`;
    itemsContainer.appendChild(row);
  });
  const subtotalEl = document.getElementById('summary-subtotal');
  if (subtotalEl)
    subtotalEl.innerText = `₹${subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  cart = cart.map((item) => {
    let qty = parseInt(item.quantity);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 99) qty = 99;
    return { ...item, quantity: qty };
  });
  localStorage.setItem('productsInCart', JSON.stringify(cart));
  const totalItems = cart.reduce((sum, i) => sum + parseInt(i.quantity), 0);
  const desktopCount = document.getElementById('desktopCartCount');
  const mobileCount = document.getElementById('mobileCartCount');
  if (desktopCount) {
    desktopCount.textContent = totalItems;
    desktopCount.classList.toggle('hidden', totalItems === 0);
  }
  if (mobileCount) {
    mobileCount.textContent = totalItems;
    mobileCount.classList.toggle('hidden', totalItems === 0);
  }
}

export function handleEmptyCartView() {
  const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  const cartGrid = document.getElementById('cart-container');
  const emptyContainer = document.getElementById('empty-cart-container');
  if (window.location.pathname.includes('cart.html')) {
    if (cart.length === 0) {
      if (cartGrid) cartGrid.style.display = 'none';
      if (emptyContainer) emptyContainer.style.display = 'flex';
    } else {
      if (cartGrid) cartGrid.style.display = 'block';
      if (emptyContainer) emptyContainer.style.display = 'none';
    }
  }
}

// Change quantity helper (used by cart UI)
export function changeQty(id, delta) {
  const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  const item = cart[id];
  if (!item) return;
  let qty = parseInt(item.quantity) || 1;
  qty = Math.max(1, Math.min(100, qty + delta));
  item.quantity = qty;
  saveCart(cart);
  loadCart();
  updateCartCount();
}

export function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  const removed = cart.splice(index, 1)[0];
  saveCart(cart);
  loadCart();
  updateCartCount();
  if (removed) showToast(`${removed.name} removed from cart`, 'error');
}

// Update authentication UI
export function updateAuthUI() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  const loggedInName = localStorage.getItem('loggedInUserName');
  const loginLinks = document.querySelectorAll('a[href="login.html"]');
  loginLinks.forEach((link) => {
    if (loggedInUser) {
      if (
        link.innerHTML.includes('ri-user-3-line') ||
        link.innerHTML.includes('fa-user')
      ) {
        link.innerHTML = '<i class="ri-logout-box-r-line"></i>';
        link.setAttribute(
          'aria-label',
          loggedInName ? `Logout ${loggedInName}` : 'Logout'
        );
      } else {
        link.innerText = loggedInName ? `Hi, ${loggedInName}` : 'Logout';
      }
      link.href = '#';
      link.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('loggedInUserName');
        localStorage.removeItem('appliedCoupon');
        window.location.href = 'login.html';
      };
    } else {
      if (link.innerHTML.includes('ri-logout-box-r-line')) {
        link.innerHTML = '<i class="ri-user-3-line"></i>';
        link.setAttribute('aria-label', 'Login');
      } else if (
        link.innerText.startsWith('Hi,') ||
        link.innerText === 'Logout'
      ) {
        link.innerText = 'Login';
      }
      link.href = 'login.html';
      link.onclick = null;
    }
  });
}

// SHA‑256 hashing helper
export async function hashString(str) {
  const data = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Add to cart helper
export function addToCart(
  productName,
  productPrice,
  productImage,
  quantity,
  size
) {
  let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  const item = {
    name: productName,
    price: parseFloat(productPrice.replace(/[₹$,]/g, '')),
    image: productImage,
    quantity: parseInt(quantity),
    size: size.replace('Size ', ''),
  };
  const existing = cart.find(
    (p) => p.name === item.name && p.size === item.size
  );
  if (existing) existing.quantity += item.quantity;
  else cart.push(item);
  saveCart(cart);
  showToast(`${item.name} (Size: ${item.size}) added to cart!`);
  updateCartCount();
}
