/**
 * Cart Page Coupon Application Module
 * Handles coupon code input, trimming, and validation for the cart page.
 * cart.html references this script for the coupon input functionality.
 */

(function () {
  'use strict';

  const couponInput = document.getElementById('coupon-code-input');
  const applyBtn = document.getElementById('apply-coupon-btn');
  const feedbackEl = document.getElementById('coupon-feedback');

  // ── Show feedback ────────────────────────────────────────────────────────
  function showFeedback(message, type) {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.className = 'coupon-feedback';
    if (type) feedbackEl.classList.add('coupon-feedback-' + type);
  }

  // ── Safe storage access ────────────────────────────────────────────────────
  function saveAppliedCoupon(code) {
    try {
      localStorage.setItem('appliedCoupon', code);
    } catch (err) {
      // Ignore storage failures in restricted environments.
    }
  }

  function removeAppliedCoupon() {
    try {
      localStorage.removeItem('appliedCoupon');
    } catch (err) {
      // Ignore storage failures in restricted environments.
    }
  }

  // ── Apply coupon ─────────────────────────────────────────────────────────
  function applyCoupon() {
    if (!couponInput || !feedbackEl) return;

    // Trim whitespace to handle copy-paste from emails (fixes trailing-space rejection)
    const rawCode = couponInput.value;
    const code = rawCode.trim().toUpperCase();

    if (!code) {
      showFeedback('Please enter a coupon code.', 'error');
      return;
    }

    // Use PromoDiscountCalculator if available, otherwise fall back to simple lookup
    if (typeof PromoDiscountCalculator !== 'undefined') {
      const calculator = new PromoDiscountCalculator();
      // Get cart subtotal from localStorage or default to 0
      let subtotal = 0;
      try {
        const cart = JSON.parse(localStorage.getItem('cara_cart') || '{}');
        subtotal = parseFloat(cart.subtotal) || 0;
      } catch (err) {
        // ignore parse errors
      }

      const result = calculator.validateCoupon(code, subtotal);
      if (result.valid) {
        window.appliedCoupon = result.code;
        saveAppliedCoupon(result.code);
        showFeedback('Coupon "' + result.code + '" applied successfully!', 'success');
        couponInput.classList.remove('is-invalid');
        couponInput.classList.add('is-valid');
        window.dispatchEvent(new CustomEvent('couponApplied', { detail: result }));
      } else {
        showFeedback(result.message || 'Invalid coupon code.', 'error');
        couponInput.classList.remove('is-valid');
        couponInput.classList.add('is-invalid');
      }
    } else {
      // Simple fallback: check known codes from coupon-config
      const knownCodes = window.CARA_COUPONS || {};
      if (Object.prototype.hasOwnProperty.call(knownCodes, code)) {
        window.appliedCoupon = code;
        saveAppliedCoupon(code);
        const discountPct = knownCodes[code];
        showFeedback('Coupon "' + code + '" applied! You saved ' + discountPct + '%.', 'success');
        couponInput.classList.remove('is-invalid');
        couponInput.classList.add('is-valid');
        window.dispatchEvent(new CustomEvent('couponApplied', { detail: { code, discountPct } }));
      } else {
        showFeedback('Invalid coupon code. Try CARA20 or WELCOME10.', 'error');
        couponInput.classList.remove('is-valid');
        couponInput.classList.add('is-invalid');
      }
    }
  }

  // ── Remove coupon ────────────────────────────────────────────────────────
  function removeCoupon() {
    window.appliedCoupon = '';
    removeAppliedCoupon();
    if (couponInput) {
      couponInput.value = '';
      couponInput.classList.remove('is-valid', 'is-invalid');
    }
    showFeedback('', '');
    window.dispatchEvent(new CustomEvent('couponRemoved'));
  }

  // ── Wire up events ───────────────────────────────────────────────────────
  if (applyBtn) {
    applyBtn.addEventListener('click', applyCoupon);
  }

  if (couponInput) {
    couponInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyCoupon();
      }
    });
    // Remove invalid state on new input
    couponInput.addEventListener('input', function () {
      couponInput.classList.remove('is-invalid');
      showFeedback('', '');
    });
  }

  // Expose removeCoupon globally
  window.removeCoupon = removeCoupon;
})();
