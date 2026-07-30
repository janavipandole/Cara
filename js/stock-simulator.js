// Size-specific Stock Level Tracker & Inventory Reservation Engine

export const mockStockData = {
  'Select Size': { count: 100, status: 'normal' },
  XL: { count: 0, status: 'out' },
  XXL: { count: 2, status: 'low' },
  Small: { count: 15, status: 'normal' },
  Medium: { count: 1, status: 'low' },
  Large: { count: 0, status: 'out' },
};

export function getStockInfo(size) {
  if (!size) return { count: 0, status: 'unknown' };
  return mockStockData[size] || { count: 5, status: 'normal' };
}

export function startStockReservationTimer(durationSeconds, onTick, onExpire) {
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

export function initStockSimulator() {
  if (typeof document === 'undefined') return;
  const sizeSelect =
    document.getElementById('sizeSelect') || document.querySelector('select');
  const stockContainer = document.getElementById('stock-alert-container');

  if (!sizeSelect || !stockContainer) return;

  sizeSelect.addEventListener('change', (e) => {
    const size = e.target.value;
    const info = getStockInfo(size);

    if (info.status === 'out') {
      stockContainer.innerHTML = `
        <div class="stock-alert-box out-of-stock">
          <span class="stock-title"><i class="ri-error-warning-fill"></i> Out of Stock!</span>
          <p class="stock-desc">Get notified when this size returns:</p>
          <div class="stock-notify-group">
            <input type="email" id="restock-email" placeholder="Your Email" class="stock-email-input" />
            <button id="notify-restock-btn" class="stock-notify-btn">Notify Me</button>
          </div>
          <span id="restock-feedback" class="stock-feedback"></span>
        </div>
      `;
      const btn = document.getElementById('notify-restock-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const emailInput = document.getElementById('restock-email');
          const feedback = document.getElementById('restock-feedback');
          const email = emailInput ? emailInput.value.trim() : '';
          if (email && feedback) {
            feedback.textContent = 'Successfully subscribed to Restock alert!';
            feedback.className = 'stock-feedback success';
          } else if (feedback) {
            feedback.textContent = 'Please provide a valid email address.';
            feedback.className = 'stock-feedback error';
          }
        });
      }
    } else if (info.status === 'low') {
      stockContainer.innerHTML = `
        <div class="stock-alert-box low-stock">
          <i class="ri-alert-fill"></i> Only ${info.count} item(s) left in stock! Order soon.
        </div>
      `;
    } else {
      stockContainer.innerHTML = `
        <div class="stock-alert-box in-stock">
          <i class="ri-checkbox-circle-fill"></i> Size available! Ready to ship.
        </div>
      `;
    }
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initStockSimulator);
}
