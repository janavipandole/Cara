// ============================================================
// checkout.js — Cara Fashion Store
// ============================================================

let paymentMethod = 'cod';

// ── Payment method tab toggle ──────────────────────────────
function selectPayment(method) {
  paymentMethod = method;
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

// ── Place order with basic validation ─────────────────────
function placeOrder() {
  const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'zip'];

  for (const id of requiredFields) {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      el.focus();
      el.style.borderColor = '#e53e3e';
      el.style.boxShadow = '0 0 0 3px rgba(229,62,62,0.12)';
      setTimeout(() => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
      }, 2000);
      return;
    }
  }

  // All fields valid — show success popup
  document.getElementById('successOverlay').classList.add('show');
}

// ── Close popup when clicking outside the box ─────────────
document.getElementById('successOverlay').addEventListener('click', function (e) {
  if (e.target === this) this.classList.remove('show');
});
