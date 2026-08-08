/**
 * js/loyalty.js — Loyalty points redemption wiring.
 *
 * Wires the "Redeem"/"Apply" button on the cart and checkout pages so that:
 *  1. the requested points are validated against the user's balance,
 *  2. the chosen points are persisted under `cara_applied_loyalty_points`,
 *  3. the discount is reflected in the order summary immediately.
 *
 * The authoritative balance lives on the backend (`/api/loyalty/balance`);
 * `cara_loyalty_balance` is only a local cache used when unauthenticated or
 * offline, and is refreshed from the order response after checkout.
 */
(() => {
  'use strict';

  const APPLIED_KEY = 'cara_applied_loyalty_points';
  const BALANCE_KEY = 'cara_loyalty_balance';

  function config() {
    return (
      (window.CARA_CONFIG && window.CARA_CONFIG.LOYALTY) || {
        POINTS_PER_RUPEE: 10,
        DEFAULT_BALANCE: 150,
      }
    );
  }

  function apiBase() {
    return window.CARA_API_BASE_URL || '';
  }

  function cachedBalance() {
    const raw = parseInt(localStorage.getItem(BALANCE_KEY), 10);
    if (Number.isFinite(raw) && raw >= 0) return raw;
    return config().DEFAULT_BALANCE;
  }

  function setCachedBalance(value) {
    try {
      localStorage.setItem(BALANCE_KEY, String(value));
    } catch (err) {
      // Ignore storage failures in restricted environments.
    }
  }

  function cartSubtotal() {
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    } catch (err) {
      cart = [];
    }
    const parsePrice =
      typeof window.parsePriceString === 'function'
        ? window.parsePriceString
        : (s) => {
            const n = parseFloat(String(s).replace(/[₹$,\s]/g, ''));
            return isFinite(n) ? n : 0;
          };
    return cart.reduce(
      (sum, item) => sum + parsePrice(item.price) * (parseInt(item.quantity, 10) || 1),
      0,
    );
  }

  function pointsToDiscount(points) {
    return points / config().POINTS_PER_RUPEE;
  }

  function pointsToEarn() {
    return Math.floor(cartSubtotal() * config().POINTS_PER_RUPEE / 100);
  }

  function getAppliedPoints() {
    const raw = parseInt(localStorage.getItem(APPLIED_KEY), 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
  }

  function applyPoints(pointsToApply) {
    if (!Number.isInteger(pointsToApply) || pointsToApply < 0) {
      return { ok: false, message: 'Please enter a valid number of points.' };
    }
    if (pointsToApply === 0) {
      localStorage.removeItem(APPLIED_KEY);
      return { ok: true, message: 'Applied points cleared.' };
    }
    const balance = cachedBalance();
    if (pointsToApply > balance) {
      return {
        ok: false,
        message: `Insufficient points. Your balance is ${balance} pts.`,
      };
    }
    localStorage.setItem(APPLIED_KEY, String(pointsToApply));
    return {
      ok: true,
      message: `${pointsToApply} pts applied (₹${pointsToDiscount(pointsToApply).toFixed(2)} off).`,
    };
  }

  function removeApplied() {
    localStorage.removeItem(APPLIED_KEY);
    refresh();
  }

  // ── Cart summary loyalty row + grand total ────────────────────────────────

  function toNumber(text) {
    return parseFloat(String(text).replace(/[₹,\s]/g, '')) || 0;
  }

  function updateCartLoyaltyRow() {
    const row = document.getElementById('summary-loyalty-row');
    const valEl = document.getElementById('summary-loyalty');
    const points = getAppliedPoints();
    if (!row || !valEl) return;
    if (points > 0) {
      row.style.display = 'flex';
      valEl.textContent = '-₹' + pointsToDiscount(points).toFixed(2);
    } else {
      row.style.display = 'none';
      valEl.textContent = '-₹0';
    }
  }

  function updateCartTotal() {
    const totalEl = document.getElementById('summary-total');
    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    if (!totalEl || !subtotalEl || !taxEl) return;

    const shippingEl = document.getElementById('summary-shipping');
    const discountEl = document.getElementById('summary-discount');

    const subtotal = toNumber(subtotalEl.textContent);
    const tax = toNumber(taxEl.textContent);
    const shipping =
      shippingEl && shippingEl.textContent.trim().toUpperCase() !== 'FREE'
        ? toNumber(shippingEl.textContent)
        : 0;
    const couponDiscount = discountEl ? toNumber(discountEl.textContent) : 0;
    const loyaltyDiscount = pointsToDiscount(getAppliedPoints());

    const total = Math.max(
      0,
      subtotal + tax + shipping - couponDiscount - loyaltyDiscount,
    );
    totalEl.textContent =
      '₹' + total.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  }

  // ── UI refresh ────────────────────────────────────────────────────────────

  function refresh() {
    const balanceEl = document.getElementById('loyalty-balance');
    if (balanceEl) balanceEl.textContent = String(cachedBalance());

    const earnEl = document.getElementById('points-to-earn');
    if (earnEl) earnEl.textContent = String(pointsToEarn());

    const input = document.getElementById('points-to-apply');
    if (input && !getAppliedPoints()) {
      input.value = '';
    }

    if (document.getElementById('summary-loyalty-row')) {
      updateCartLoyaltyRow();
      updateCartTotal();
    }

    if (typeof window.updateCheckoutSummary === 'function') {
      window.updateCheckoutSummary();
    }
  }

  // ── Balance from the authoritative backend ────────────────────────────────

  function loadServerBalance() {
    if (typeof fetch !== 'function') return;
    fetch(`${apiBase()}/api/loyalty/balance`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && Number.isFinite(data.balance)) {
          setCachedBalance(data.balance);
          refresh();
        }
      })
      .catch(() => {
        // Keep the local cache when offline or unauthenticated.
      });
  }

  // ── Wire the Redeem/Apply button ─────────────────────────────────────────

  function bindApplyButton() {
    const btn = document.getElementById('apply-points-btn');
    if (!btn) return;

    const input = document.getElementById('points-to-apply');
    const msgEl = document.getElementById('loyalty-msg');

    btn.addEventListener('click', () => {
      const raw = input ? input.value : '';
      const points = parseInt(raw, 10);
      const result = applyPoints(Number.isNaN(points) ? 0 : points);
      if (msgEl) {
        msgEl.textContent = result.message;
        msgEl.style.color = result.ok ? '#088178' : '#e23e57';
      }
      if (result.ok) refresh();
    });

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          btn.click();
        }
      });
    }
  }

  window.CaraLoyalty = {
    getBalance: cachedBalance,
    getAppliedPoints,
    pointsToDiscount,
    applyPoints,
    removeApplied,
    refresh,
  };

  document.addEventListener('DOMContentLoaded', () => {
    bindApplyButton();
    refresh();
    loadServerBalance();
  });
})();
