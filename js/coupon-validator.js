/**
 * coupon-validator.js
 * Handles client-side coupon application and validation on the checkout page.
 *
 * Supported Coupon Codes:
 *  - CARA20: 20% discount on cart subtotal
 *  - WELCOME10: 10% discount on cart subtotal
 *
 * Features:
 *  - Validates coupon format and validity code
 *  - Emits custom 'couponApplied' and 'couponRemoved' events
 *  - Persists applied coupon code to localStorage
 *  - Displays friendly validation feedback messages
 */

(function () {
  'use strict';

  const COUPONS = {
    CARA20: 20,
    WELCOME10: 10,
  };

  // ── DOM references ──────────────────────────────────────────────────────────
  const couponInput   = document.getElementById('couponCodeInput');
  const applyBtn      = document.getElementById('applyCouponBtn');
  const feedbackEl    = document.getElementById('couponFeedback');
  const summaryBlock  = document.querySelector('.totals');

  // ── Apply coupon logic ─────────────────────────────────────────────────────
  function applyCoupon() {
    if (!couponInput || !feedbackEl) return;

    const code = couponInput.value.trim().toUpperCase();

    if (!code) {
      showFeedback('Please enter a coupon code.', 'error');
      return;
    }

    if (COUPONS.hasOwnProperty(code)) {
      const discountPct = COUPONS[code];
      window.appliedCoupon = code;
      localStorage.setItem('appliedCoupon', code);

      showFeedback(`Coupon "${code}" applied! You saved ${discountPct}%.`, 'success');
      couponInput.classList.remove('is-invalid');
      couponInput.classList.add('is-valid');

      // Dispatch event to trigger summary re-render
      window.dispatchEvent(new CustomEvent('couponApplied', { detail: { code, discountPct } }));
      renderDiscountRow(code, discountPct);
    } else {
      showFeedback('Invalid coupon code. Try CARA20 or WELCOME10.', 'error');
      couponInput.classList.remove('is-valid');
      couponInput.classList.add('is-invalid');
    }
  }

  // ── Remove coupon logic ────────────────────────────────────────────────────
  function removeCoupon() {
    window.appliedCoupon = '';
    localStorage.removeItem('appliedCoupon');
    if (couponInput) {
      couponInput.value = '';
      couponInput.classList.remove('is-valid', 'is-invalid');
    }
    showFeedback('Coupon removed.', 'info');
    const discountRow = document.getElementById('summaryDiscountRow');
    if (discountRow) discountRow.remove();

    window.dispatchEvent(new CustomEvent('couponRemoved'));
  }

  // ── Show feedback message ──────────────────────────────────────────────────
  function showFeedback(msg, type) {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg;
    feedbackEl.className = 'coupon-feedback ' + type;
    feedbackEl.style.display = 'block';
  }

  // ── Render discount line in totals ─────────────────────────────────────────
  function renderDiscountRow(code, pct) {
    if (!summaryBlock) return;
    let row = document.getElementById('summaryDiscountRow');
    if (!row) {
      row = document.createElement('div');
      row.className = 'total-row discount';
      row.id = 'summaryDiscountRow';
      // Insert right before the grand total row
      const grandRow = summaryBlock.querySelector('.total-row.grand');
      if (grandRow) {
        summaryBlock.insertBefore(row, grandRow);
      } else {
        summaryBlock.appendChild(row);
      }
    }
    row.innerHTML = `
      <span>Discount (${code}) <button type="button" class="btn-remove-coupon" id="btnRemoveCoupon" aria-label="Remove coupon">×</button></span>
      <span>-${pct}%</span>
    `;

    document.getElementById('btnRemoveCoupon').addEventListener('click', removeCoupon);
  }

  // ── Initialise ─────────────────────────────────────────────────────────────
  function init() {
    if (applyBtn) {
      applyBtn.addEventListener('click', applyCoupon);
    }
    if (couponInput) {
      couponInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyCoupon();
        }
      });
    }

    // Auto-apply saved coupon on load
    const saved = localStorage.getItem('appliedCoupon');
    if (saved) {
      if (couponInput) couponInput.value = saved;
      applyCoupon();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
