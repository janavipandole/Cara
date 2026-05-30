// ============================================================
// checkout.js — Cara Fashion Store
// ============================================================

let selectedPayment = 'cod';

// ── Payment method tab toggle ──────────────────────────────
function selectPayment(method) {
  selectedPayment = method;
  document.getElementById('tabCOD').classList.toggle('active', method === 'cod');
  document.getElementById('tabOnline').classList.toggle('active', method === 'online');
  document.getElementById('cardDetails').classList.toggle('visible', method === 'online');
}

// ── Auto-format card number (XXXX XXXX XXXX XXXX) ─────────
document.getElementById('cardNumber').addEventListener('input', function (e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 16);
  e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
});

// ── Auto-format expiry (MM/YY) ────────────────────────────
document.getElementById('expiry').addEventListener('input', function (e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
  e.target.value = v;
});

// ── CVV: digits only ──────────────────────────────────────
document.getElementById('cvv').addEventListener('input', function (e) {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

// ── Validation helpers ────────────────────────────────────
function highlightError(el) {
  el.focus();
  el.style.borderColor = '#e53e3e';
  el.style.boxShadow = '0 0 0 3px rgba(229,62,62,0.12)';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  }, 2000);
}

function isValidExpiry(value) {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = Number('20' + match[2]);
  if (month < 1 || month > 12) return false;
  return new Date(year, month) > new Date();
}

function validateCard() {
  const cardName   = document.getElementById('cardName');
  const cardNumber = document.getElementById('cardNumber');
  const expiry     = document.getElementById('expiry');
  const cvv        = document.getElementById('cvv');

  if (cardName.value.trim().length < 2)                   { highlightError(cardName);   return false; }
  if (cardNumber.value.replace(/\s/g, '').length !== 16)  { highlightError(cardNumber); return false; }
  if (!isValidExpiry(expiry.value.trim()))                 { highlightError(expiry);     return false; }
  if (!/^\d{3,4}$/.test(cvv.value.trim()))                { highlightError(cvv);        return false; }

  return true;
}

// ── Place order ───────────────────────────────────────────
function placeOrder() {
  // Check cart
  const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  if (cart.length === 0) {
    if (typeof showToast === 'function') showToast('Your cart is empty!', 'error');
    else alert('Your cart is empty!');
    return;
  }

  // Required contact/address fields
  const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'zip'];
  for (const id of requiredFields) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) { highlightError(el); return; }
  }

  // Card validation for online payment
  if (selectedPayment === 'online' && !validateCard()) return;

  // Loading state
  const btn = document.querySelector('.submit-btn');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.style.opacity = '0.75';
  btn.style.cursor = 'not-allowed';
  btn.innerHTML = '<i class="ri-loader-4-line"></i> Processing…';

  // Simulate async order processing
  setTimeout(() => {
    localStorage.removeItem('productsInCart');
    localStorage.removeItem('appliedCoupon');
    window.appliedCoupon = null;

    btn.disabled = false;
    btn.style.opacity = '';
    btn.style.cursor = '';
    btn.innerHTML = originalHTML;

    document.getElementById('successOverlay').classList.add('show');
  }, 1500);
}

// ── Close popup when clicking outside the box ─────────────
document.getElementById('successOverlay').addEventListener('click', function (e) {
  if (e.target === this) this.classList.remove('show');
});