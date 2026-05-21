/* ============================
   MOBILE MENU FUNCTIONALITY
============================ */

document.addEventListener('click', function (e) {
  const nav = document.getElementById('navbar');

  if (e.target.id === 'bar') {
    if (nav) nav.classList.add('active');
  }

  if (e.target.closest('#close')) {
    e.preventDefault();
    if (nav) nav.classList.remove('active');
  }
});

/* ============================
   DROPDOWN MENU (MOBILE)
============================ */

document.querySelectorAll('.dropdown').forEach((dropdown) => {
  const toggle = dropdown.querySelector('.dropdown-toggle');

  if (!toggle) return;

  toggle.addEventListener('click', (e) => {
    if (window.innerWidth <= 799) {
      e.preventDefault();
      dropdown.classList.toggle('active');
    }
  });
});

/* ============================
   AUTH UI
============================ */

function updateAuthUI() {
  const loginBtn = document.getElementById('login-btn');
  const loggedInUser = localStorage.getItem('loggedInUser');

  if (!loginBtn) return;
  loginBtn.style.display = loggedInUser ? 'none' : 'block';
}

document.addEventListener('DOMContentLoaded', updateAuthUI);

/* ============================
   PRODUCT CARD CLICK
============================ */

document.addEventListener(
  'click',
  function (e) {
    const proCard = e.target.closest('.pro');
    if (!proCard) return;

    if (e.target.closest('.cart') || e.target.closest('.buy-now-btn')) return;

    const selectedProduct = {
      name: proCard.querySelector('h5')?.textContent.trim() || 'Product',
      price: proCard.querySelector('h4')?.textContent.trim() || '₹0',
      brand: proCard.querySelector('.des span')?.textContent.trim() || 'Brand',
      image: proCard.querySelector('img')?.src || ''
    };

    localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
    window.location.href = 'singleProduct.html';
  },
  true
);

/* ============================
   SINGLE PRODUCT PAGE
============================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('singleProduct')) return;

  const stored = localStorage.getItem('selectedProduct');
  if (!stored) return;

  try {
    const product = JSON.parse(stored);

    const nameEl = document.getElementById('product-name');
    const priceEl = document.getElementById('product-price');
    const imgEl = document.getElementById('MainImg');

    if (nameEl) nameEl.textContent = product.name;
    if (priceEl) priceEl.textContent = product.price;
    if (imgEl) imgEl.src = product.image;

  } catch (err) {
    console.error(err);
  }

  const MainImg = document.getElementById('MainImg');
  document.querySelectorAll('.small-img').forEach((img) => {
    img.addEventListener('click', () => {
      if (MainImg) MainImg.src = img.src;
    });
  });
});

/* ============================
   RIPPLE EFFECT
============================ */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('button.normal, button.white').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');

      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      this.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
});

/* ============================
   CART FUNCTIONALITY
============================ */

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const desktop = document.getElementById('desktopCartCount');
  const mobile = document.getElementById('mobileCartCount');

  if (desktop) desktop.textContent = totalItems;
  if (mobile) mobile.textContent = totalItems;
}

document.addEventListener('DOMContentLoaded', updateCartCount);

function addToCart(name, price, image, quantity, size) {
  let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];

  const item = {
    name,
    price: parseFloat(price.replace(/[₹$,]/g, '')),
    image,
    quantity: parseInt(quantity),
    size: size.replace('Size ', '')
  };

  const existing = cart.find(
    (p) => p.name === item.name && p.size === item.size
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  localStorage.setItem('productsInCart', JSON.stringify(cart));
  showToast(`${item.name} added to cart!`);
  updateCartCount();
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());

  container.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}

window.handleAddToCart = function () {
  const name = document.getElementById('product-name')?.innerText;
  const price = document.getElementById('product-price')?.innerText;
  const size = document.getElementById('product-size')?.value;
  const qty = document.getElementById('product-quantity')?.value;
  const img = document.getElementById('MainImg')?.src;

  if (!size || size === 'Select Size') {
    showToast('Please select size', 'warning');
    return;
  }

  addToCart(name, price, img, qty, size);
};

/* ============================
   CART PAGE LOGIC
============================ */

window.loadCart = function () {
  const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  const container = document.getElementById('cart-items-container');

  if (!container) return;

  container.innerHTML = '';
  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    const row = document.createElement('div');
    row.className = 'cart-item-row';

    row.innerHTML = `
      <div class="cart-item-left">
        <img src="${item.image}" />
        <div>
          <h5>${item.name}</h5>
          <span>Size: ${item.size}</span>
        </div>
      </div>

      <div class="cart-item-right">
        <div>₹${item.price.toLocaleString('en-IN')}</div>
        <div>${item.quantity}</div>
        <div>₹${itemSubtotal.toLocaleString('en-IN')}</div>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;

    container.appendChild(row);
  });

  const shipping = subtotal >= 3000 ? 0 : 150;
  const total = subtotal + shipping;

  const subtotalEl = document.querySelector('.subtotal td:nth-child(2)');
  const shippingEl = document.querySelector('.shipping td:nth-child(2)');
  const totalEl = document.querySelector('.total td:nth-child(2)');

  if (subtotalEl) subtotalEl.innerText = `₹${subtotal}`;
  if (shippingEl) shippingEl.innerText = shipping === 0 ? 'Free' : `₹${shipping}`;
  if (totalEl) totalEl.innerText = `₹${total}`;
};

window.removeItem = function (index) {
  let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('productsInCart', JSON.stringify(cart));
  loadCart();
  updateCartCount();
};

/* ============================
   THEME TOGGLE
============================ */

(function () {
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  const icon = document.getElementById('themeIcon');
  const iconMobile = document.getElementById('themeIconMobile');

  const theme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', theme);

  function updateIcon(t) {
    const cls = t === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
    if (icon) icon.className = cls;
    if (iconMobile) iconMobile.className = cls;
  }

  updateIcon(theme);

  function toggleTheme() {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateIcon(next);
  }

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);
})();