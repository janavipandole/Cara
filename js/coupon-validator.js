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

  const COUPONS = window.CARA_COUPONS || {};

  // ── DOM references ──────────────────────────────────────────────────────────
  const couponInput = document.getElementById('couponCodeInput');
  const applyBtn = document.getElementById('applyCouponBtn');
  const feedbackEl = document.getElementById('couponFeedback');

  // ── Safe storage access ────────────────────────────────────────────────────
  function saveAppliedCoupon(code) {
    try {
      localStorage.setItem('appliedCoupon', code);
    } catch (e) {
      // Ignore storage failures in restricted environments.
    }
  }

  function removeAppliedCoupon() {
    try {
      localStorage.removeItem('appliedCoupon');
    } catch (e) {
      // Ignore storage failures in restricted environments.
    }
  }

  function readAppliedCoupon() {
    try {
      return localStorage.getItem('appliedCoupon');
    } catch (e) {
      return null;
    }
  }

  // ── Apply coupon logic ─────────────────────────────────────────────────────
  function applyCoupon() {
    if (!couponInput || !feedbackEl) return;

    const code = couponInput.value.trim().toUpperCase();

    if (!code) {
      showFeedback('Please enter a coupon code.', 'error');
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(COUPONS, code)) {
      showFeedback('Invalid coupon code. Try CARA20 or WELCOME10.', 'error');
      couponInput.classList.remove('is-valid');
      couponInput.classList.add('is-invalid');
      return;
    }

    const discountPct = COUPONS[code];

    // Exclusivity validation (#6296): reject the promo code when a site-wide
    // sale already delivers a better (or equal) discount on the cart. Promo
    // codes can never be stacked on top of auto-applied site-wide sales.
    if (typeof window.PromoExclusivityEngine === 'function') {
      resolveSiteWideSaleConflict(discountPct)
        .then((conflictMessage) => {
          if (conflictMessage) {
            showFeedback(conflictMessage, 'error');
            couponInput.classList.remove('is-valid');
            couponInput.classList.add('is-invalid');
            return;
          }
          finalizeCouponApplication(code, discountPct);
        })
        .catch(() => finalizeCouponApplication(code, discountPct));
    } else {
      // No engine (legacy/test environments) — apply synchronously.
      finalizeCouponApplication(code, discountPct);
    }
  }

  function finalizeCouponApplication(code, discountPct) {
    window.appliedCoupon = code;
    saveAppliedCoupon(code);

    showFeedback(
      `Coupon "${code}" applied! You saved ${discountPct}%.`,
      'success',
    );
    couponInput.classList.remove('is-invalid');
    couponInput.classList.add('is-valid');

    // Dispatch event to trigger summary re-render
    window.dispatchEvent(
      new CustomEvent('couponApplied', { detail: { code, discountPct } }),
    );
    if (typeof window.updateCheckoutSummary === 'function') {
      window.updateCheckoutSummary();
    }
  }

  function readCart() {
    try {
      const cart = JSON.parse(localStorage.getItem('productsInCart') || '[]');
      return Array.isArray(cart) ? cart : [];
    } catch (e) {
      return [];
    }
  }

  // Returns the exclusivity message when the promo code must be rejected,
  // or null when it may be applied (no conflict / promo is the better offer).
  function resolveSiteWideSaleConflict(discountPct) {
    if (typeof window.PromoExclusivityEngine !== 'function') {
      return Promise.resolve(null);
    }
    return PromoExclusivityEngine.loadProductCatalog()
      .then((catalog) => {
        const engine = new PromoExclusivityEngine({ catalog });
        const result = engine.evaluate(readCart(), discountPct);
        if (result.conflict && result.rejectedSource === 'promo') {
          return result.message;
        }
        return null;
      })
      .catch(() => null);
  }

  // ── Remove coupon logic ────────────────────────────────────────────────────
  function removeCoupon() {
    window.appliedCoupon = '';
    removeAppliedCoupon();
    if (couponInput) {
      couponInput.value = '';
      couponInput.classList.remove('is-valid', 'is-invalid');
    }
    showFeedback('Coupon removed.', 'info');

    window.dispatchEvent(new CustomEvent('couponRemoved'));
    if (typeof window.updateCheckoutSummary === 'function') {
      window.updateCheckoutSummary();
    }
  }

  // Expose removeCoupon globally to allow integration with central calculation engine
  window.removeCoupon = removeCoupon;

  // ── Show feedback message ──────────────────────────────────────────────────
  function showFeedback(msg, type) {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg;
    feedbackEl.className = 'coupon-feedback ' + type;
    feedbackEl.style.display = 'block';
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
    const saved = readAppliedCoupon();
    if (saved) {
      if (couponInput) couponInput.value = saved;
      applyCoupon();
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  // Expose utility functions globally for external use
  window.isCouponDateExpired = isCouponDateExpired;
})();

function isCouponDateExpired(expiryDate) { if (!expiryDate) return false; return new Date(expiryDate).getTime() < Date.now(); }