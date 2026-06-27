/**
 * checkout-summary.js
 * Reads the live cart from localStorage and renders a fully dynamic
 * Order Summary sidebar in checkout.html.
 *
 * Fixes: Static placeholder product, prices, and tax% shown in the
 * checkout sidebar that never reflected the user's actual cart contents.
 *
 * Features:
 *  - Renders all cart items with name, quantity, and line-item price
 *  - Calculates subtotal, 18% GST, ₹150 shipping (waived above ₹3000)
 *  - Applies coupon discount from window.appliedCoupon / localStorage
 *  - Updates dynamically whenever the cart or coupon changes
 *  - Announces total changes to screen readers via aria-live
 */

(function () {
  'use strict';

  const TAX_RATE   = 0.18;   // 18% GST
  const SHIP_THRESHOLD = 3000;
  const SHIP_COST  = 150;

  const COUPON_DISCOUNTS = {
    CARA20:     20,
    WELCOME10:  10,
  };

  // ── DOM targets ────────────────────────────────────────────────────────────
  let itemsContainer, subtotalEl, shippingEl, taxEl, grandTotalEl, summaryCount;

  function _resolveDOM() {
    itemsContainer = document.getElementById('summaryItemsList');
    subtotalEl     = document.getElementById('summarySubtotal');
    shippingEl     = document.getElementById('summaryShipping');
    taxEl          = document.getElementById('summaryTax');
    grandTotalEl   = document.getElementById('summaryGrandTotal');
    summaryCount   = document.getElementById('summaryItemCount');
  }

  // ── Parse cart from localStorage ─────────────────────────────────────────
  function _readCart() {
    try {
      return JSON.parse(localStorage.getItem('productsInCart') || '[]');
    } catch {
      return [];
    }
  }

  // ── Format a number as Indian Rupees ──────────────────────────────────────
  function _fmt(amount) {
    return '₹' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  // ── Build item row HTML ───────────────────────────────────────────────────
  function _buildItemRow(item) {
    const qty   = parseInt(item.quantity) || 1;
    const price = parseFloat(item.price) || 0;
    const line  = price * qty;
    return `
      <div class="summary-item" role="listitem">
        <div class="summary-item-thumb" aria-hidden="true">
          ${item.img
            ? `<img src="${item.img}" alt="" loading="lazy" width="48" height="48">`
            : '<i class="ri-shirt-line"></i>'}
        </div>
        <div class="summary-item-info">
          <span class="summary-item-name">${_escape(item.name || 'Product')}</span>
          <span class="summary-item-meta">
            ${item.brand ? _escape(item.brand) + ' · ' : ''}Qty ${qty}
          </span>
        </div>
        <span class="summary-item-price" aria-label="${_escape(item.name || 'Product')} costs ${_fmt(line)}">${_fmt(line)}</span>
      </div>`;
  }

  // ── Sanitise user-sourced strings against XSS ─────────────────────────────
  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Render function — called on load and whenever cart changes ────────────
  function render() {
    if (!itemsContainer) return;

    const cart = _readCart();

    // Render item rows
    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <p class="summary-empty" role="status">Your cart is empty.</p>`;
    } else {
      itemsContainer.innerHTML = cart.map(_buildItemRow).join('');
    }

    // Calculate totals
    const subtotal = cart.reduce((acc, item) => {
      return acc + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
    }, 0);

    const shipping = subtotal >= SHIP_THRESHOLD || subtotal === 0 ? 0 : SHIP_COST;
    const tax      = Math.round(subtotal * TAX_RATE * 100) / 100;

    // Resolve coupon
    const couponCode = (
      window.appliedCoupon ||
      localStorage.getItem('appliedCoupon') ||
      ''
    ).trim().toUpperCase();
    const couponPct  = COUPON_DISCOUNTS[couponCode] || 0;
    const discount   = Math.round(subtotal * couponPct / 100 * 100) / 100;

    const grand = Math.max(0, subtotal + tax + shipping - discount);

    // Update DOM
    if (subtotalEl)  subtotalEl.textContent  = _fmt(subtotal);
    if (shippingEl) {
      shippingEl.textContent = shipping === 0 ? 'Free' : _fmt(shipping);
      shippingEl.closest('.total-row')?.classList.toggle('free-ship', shipping === 0);
    }
    if (taxEl)       taxEl.textContent       = _fmt(tax);
    if (grandTotalEl) grandTotalEl.textContent = _fmt(grand);
    if (summaryCount) {
      const total = cart.reduce((acc, i) => acc + (parseInt(i.quantity) || 1), 0);
      summaryCount.textContent = `(${total} item${total !== 1 ? 's' : ''})`;
    }

    // Expose grand total so checkout.js can read it without recalculating
    window._checkoutGrandTotal = grand;
  }

  // ── Initialise ─────────────────────────────────────────────────────────────
  function init() {
    _resolveDOM();
    render();

    // Re-render if the cart changes in another tab
    window.addEventListener('storage', (e) => {
      if (e.key === 'productsInCart' || e.key === 'appliedCoupon') render();
    });

    // Re-render when a coupon is applied / removed (custom event)
    window.addEventListener('couponApplied', render);
    window.addEventListener('couponRemoved', render);
  }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();

  // Expose for external callers
  window.CheckoutSummary = { render };
})();
