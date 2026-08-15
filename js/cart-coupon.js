/**
 * Cart Page Coupon Application Module
 * Handles coupon code input, trimming, and validation for the cart page.
 * cart.html references this script for the coupon input functionality.
 * Also provides cart quantity persistence via localStorage.
 */

(function () {
  'use strict';

  // ── Cart Quantity Persistence ──────────────────────────────────────────────
  const CART_KEY = 'productsInCart';

  function saveCartQuantities() {
    try {
      const cartData = localStorage.getItem(CART_KEY);
      if (cartData) {
        localStorage.setItem(CART_KEY + '_backup', cartData);
      }
    } catch (err) {
      // Silently ignore storage errors.
    }
  }

  function restoreCartQuantities() {
    try {
      const backup = localStorage.getItem(CART_KEY + '_backup');
      const current = localStorage.getItem(CART_KEY);
      if (backup && backup !== current) {
        // Restore from backup only if current cart is empty or missing
        const currentCart = current ? JSON.parse(current) : null;
        if (!currentCart || !Array.isArray(currentCart) || currentCart.length === 0) {
          localStorage.setItem(CART_KEY, backup);
        }
      }
    } catch (err) {
      // Silently ignore storage errors.
    }
  }

  // Persist cart quantities whenever the storage event fires (cross-tab sync)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === CART_KEY) saveCartQuantities();
    });

    // Restore on load if cart is empty
    window.addEventListener('DOMContentLoaded', () => {
      restoreCartQuantities();
    });
  }

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
      // Get cart subtotal from the actual cart storage key used by the app
      // ('productsInCart'), falling back to 'cara_cart' for legacy pages.
      let subtotal = 0;
      try {
        const rawCart = JSON.parse(
          localStorage.getItem('productsInCart') ||
            localStorage.getItem('cara_cart') ||
            '[]',
        );
        if (Array.isArray(rawCart)) {
          subtotal = rawCart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const qty = parseInt(item.quantity, 10) || 1;
            return sum + price * qty;
          }, 0);
        } else {
          subtotal = parseFloat(rawCart.subtotal) || 0;
        }
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
