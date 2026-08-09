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
        // Exclusivity validation (#6296): a promo code can never be stacked on
        // top of an auto-applied site-wide sale that gives an equal or better
        // discount. Reject it up front with a clear message.
        if (typeof window.PromoExclusivityEngine === 'function') {
          resolveCartPageExclusivity(result.coupon, subtotal)
            .then((conflictMessage) => {
              if (conflictMessage) {
                showFeedback(conflictMessage, 'error');
                couponInput.classList.remove('is-valid');
                couponInput.classList.add('is-invalid');
                return;
              }
              applyValidCoupon(result.code, result);
            })
            .catch(() => applyValidCoupon(result.code, result));
        } else {
          // No engine (legacy/test environments) — apply synchronously.
          applyValidCoupon(result.code, result);
        }
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

  function applyValidCoupon(code, result) {
    window.appliedCoupon = code;
    saveAppliedCoupon(code);
    showFeedback('Coupon "' + code + '" applied successfully!', 'success');
    couponInput.classList.remove('is-invalid');
    couponInput.classList.add('is-valid');
    window.dispatchEvent(new CustomEvent('couponApplied', { detail: result }));
  }

  function readCart() {
    try {
      const raw = JSON.parse(
        localStorage.getItem('productsInCart') ||
          localStorage.getItem('cara_cart') ||
          '[]',
      );
      return Array.isArray(raw) ? raw : [];
    } catch (err) {
      return [];
    }
  }

  // Returns the exclusivity message when the promo code must be rejected, or
  // null when it may be applied (no conflict / promo is the better offer).
  function resolveCartPageExclusivity(coupon, subtotal) {
    if (typeof window.PromoExclusivityEngine !== 'function') {
      return Promise.resolve(null);
    }
    return PromoExclusivityEngine.loadProductCatalog()
      .then((catalog) => {
        const engine = new PromoExclusivityEngine({ catalog });
        const couponValue =
          coupon.type === 'percent'
            ? (subtotal * coupon.value) / 100
            : coupon.type === 'flat'
              ? Math.min(subtotal, coupon.value)
              : 0;
        const result = engine.evaluateByValue(readCart(), couponValue);
        if (result.conflict && result.rejectedSource === 'promo') {
          return result.message;
        }
        return null;
      })
      .catch(() => null);
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
