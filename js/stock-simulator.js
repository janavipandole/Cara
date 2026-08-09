// Real stock level tracker & inventory reservation engine.
//
// Stock display is driven by the actual `stock` value served by
// `GET /api/products/{id}` — no hardcoded mock inventory. The "Notify Me"
// restock form persists the email server-side via `POST /api/newsletter/restock`.

const API_BASE_URL = window.API_BASE_URL || '';
const LOW_STOCK_THRESHOLD = 5;

export function getStockInfo(stock) {
  const count = Number(stock);
  if (!Number.isFinite(count) || count < 0) return { count: 0, status: 'unknown' };
  if (count <= 0) return { count: 0, status: 'out' };
  if (count <= LOW_STOCK_THRESHOLD) return { count, status: 'low' };
  return { count, status: 'normal' };
}

export function startStockReservationTimer(durationSeconds, onTick, onExpire) {
  if (durationSeconds <= 0) {
    if (onExpire) onExpire();
    return null;
  }
  let remaining = durationSeconds;
  const interval = setInterval(() => {
    remaining -= 1;
    if (onTick) onTick(remaining);
    if (remaining <= 0) {
      clearInterval(interval);
      if (onExpire) onExpire();
    }
  }, 1000);
  return interval;
}

function getSelectedProductId() {
  try {
    const stored = JSON.parse(localStorage.getItem('selectedProduct') || 'null');
    if (stored && stored.id) return stored.id;
  } catch (error) {
    console.warn('[StockSimulator] Could not read selected product:', error);
  }
  return null;
}

function fetchProductStock(productId) {
  if (window.CaraAPI && typeof window.CaraAPI.fetchData === 'function') {
    return window.CaraAPI.fetchData(`/api/products/${productId}`, {
      headers: { Accept: 'application/json' },
    }).then((product) => (product ? product.stock : null));
  }
  return fetch(`${API_BASE_URL}/api/products/${productId}`, {
    headers: { Accept: 'application/json' },
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((product) => (product ? product.stock : null));
}

function postRestockAlert(productId, email) {
  if (window.CaraAPI && typeof window.CaraAPI.fetchData === 'function') {
    return window.CaraAPI.fetchData('/api/newsletter/restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, product_id: productId }),
    });
  }
  return fetch(`${API_BASE_URL}/api/newsletter/restock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, product_id: productId }),
  }).then((response) => {
    if (!response.ok) throw new Error('Restock alert request failed');
    return response.json();
  });
}

function renderOutOfStock(container, productId) {
  container.innerHTML = `
    <div class="stock-alert-box out-of-stock">
      <span class="stock-title"><i class="ri-error-warning-fill"></i> Out of Stock!</span>
      <p class="stock-desc">Get notified when this product returns:</p>
      <div class="stock-notify-group">
        <input type="email" id="restock-email" placeholder="Your Email" class="stock-email-input" />
        <button id="notify-restock-btn" class="stock-notify-btn">Notify Me</button>
      </div>
      <span id="restock-feedback" class="stock-feedback"></span>
    </div>
  `;
  const btn = document.getElementById('notify-restock-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const emailInput = document.getElementById('restock-email');
    const feedback = document.getElementById('restock-feedback');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      if (feedback) {
        feedback.textContent = 'Please provide a valid email address.';
        feedback.className = 'stock-feedback error';
      }
      return;
    }

    btn.disabled = true;
    postRestockAlert(productId, email)
      .then(() => {
        if (feedback) {
          feedback.textContent = 'Successfully subscribed to Restock alert!';
          feedback.className = 'stock-feedback success';
        }
      })
      .catch(() => {
        if (feedback) {
          feedback.textContent = 'Could not register the alert. Please try again.';
          feedback.className = 'stock-feedback error';
        }
      })
      .finally(() => {
        btn.disabled = false;
      });
  });
}

function renderStock(container, stock) {
  const info = getStockInfo(stock);

  if (info.status === 'out') {
    renderOutOfStock(container, getSelectedProductId());
  } else if (info.status === 'low') {
    container.innerHTML = `
      <div class="stock-alert-box low-stock">
        <i class="ri-alert-fill"></i> Only ${info.count} item(s) left in stock! Order soon.
      </div>
    `;
  } else if (info.status === 'normal') {
    container.innerHTML = `
      <div class="stock-alert-box in-stock">
        <i class="ri-checkbox-circle-fill"></i> In stock! Ready to ship.
      </div>
    `;
  } else {
    container.innerHTML = '';
  }
}

export function initStockSimulator() {
  if (typeof document === 'undefined') return;
  const sizeSelect =
    document.getElementById('sizeSelect') || document.querySelector('select');
  const stockContainer = document.getElementById('stock-alert-container');

  if (!sizeSelect || !stockContainer) return;

  const productId = getSelectedProductId();

  if (productId) {
    fetchProductStock(productId)
      .then((stock) => renderStock(stockContainer, stock))
      .catch(() => {
        stockContainer.innerHTML = '';
      });
  } else {
    stockContainer.innerHTML = '';
  }

  sizeSelect.addEventListener('change', () => {
    // The backend tracks per-product stock (not per size); keep the status box
    // in sync with the real count on every change.
    if (productId) {
      fetchProductStock(productId)
        .then((stock) => renderStock(stockContainer, stock))
        .catch(() => {});
    }
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initStockSimulator);
}
