/**
 * Price Drop Alert System
 * Allows users to set a target price for products and shows a notification
 * when the price drops below their target.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cara_price_alerts';

  function getAlerts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveAlerts(alerts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) { /* ignore */ }
  }

  function setAlert(productId, targetPrice, productName) {
    var alerts = getAlerts();
    alerts[productId] = {
      targetPrice: parseFloat(targetPrice),
      productName: productName || 'Product',
      createdAt: Date.now(),
    };
    saveAlerts(alerts);
    return true;
  }

  function removeAlert(productId) {
    var alerts = getAlerts();
    delete alerts[productId];
    saveAlerts(alerts);
  }

  function hasAlert(productId) {
    var alerts = getAlerts();
    return !!alerts[productId];
  }

  function checkPrice(productId, currentPrice) {
    var alerts = getAlerts();
    var alert = alerts[productId];
    if (!alert) return null;
    if (currentPrice <= alert.targetPrice) {
      return {
        triggered: true,
        productName: alert.productName,
        targetPrice: alert.targetPrice,
        currentPrice: currentPrice,
      };
    }
    return { triggered: false };
  }

  function createAlertModal(productId, productName, currentPrice) {
    var existing = document.getElementById('priceAlertModal');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'priceAlertModal';
    overlay.className = 'pa-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Set price alert');

    overlay.innerHTML =
      '<div class="pa-modal">' +
      '<button class="pa-close" aria-label="Close">&times;</button>' +
      '<div class="pa-icon">&#128276;</div>' +
      '<h2 class="pa-title">Get Notified of Price Drops</h2>' +
      '<p class="pa-desc">We\'ll alert you when <strong>' + (productName || 'this product') + '</strong> drops below your target price.</p>' +
      '<div class="pa-current">Current price: <strong>$' + (currentPrice || '0.00') + '</strong></div>' +
      '<form class="pa-form">' +
      '<label class="pa-label">Target price ($)</label>' +
      '<input type="number" class="pa-input" step="0.01" min="0.01" max="' + (currentPrice || 9999) + '" placeholder="e.g. ' + ((currentPrice || 50) * 0.8).toFixed(2) + '" required />' +
      '<button type="submit" class="pa-submit">Set Price Alert</button>' +
      '</form>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector('.pa-close').addEventListener('click', function () {
      overlay.remove();
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });

    overlay.querySelector('.pa-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var target = this.querySelector('.pa-input').value;
      if (target) {
        setAlert(productId, target, productName);
        overlay.remove();
        if (typeof showToast === 'function') {
          showToast('Price alert set for $' + parseFloat(target).toFixed(2), 'success');
        }
      }
    });
  }

  function injectStyles() {
    if (document.getElementById('paStyles')) return;
    var s = document.createElement('style');
    s.id = 'paStyles';
    s.textContent =
      '.pa-overlay{position:fixed;inset:0;z-index:10004;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}' +
      '.pa-overlay[open],.pa-overlay{display:flex;opacity:1}' +
      '.pa-modal{background:#fff;border-radius:12px;width:92%;max-width:400px;padding:32px;text-align:center;position:relative;box-shadow:0 25px 60px rgba(0,0,0,.2)}' +
      '.pa-close{position:absolute;top:12px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;color:#64748b}' +
      '.pa-icon{font-size:40px;margin-bottom:8px}' +
      '.pa-title{margin:0 0 8px;font-size:20px;color:#0f172a}' +
      '.pa-desc{font-size:14px;color:#64748b;margin-bottom:16px;line-height:1.5}' +
      '.pa-current{font-size:14px;color:#334155;margin-bottom:20px}' +
      '.pa-label{display:block;text-align:left;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px}' +
      '.pa-input{width:100%;padding:12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;box-sizing:border-box}' +
      '.pa-input:focus{outline:2px solid #088178;border-color:#088178}' +
      '.pa-submit{width:100%;padding:12px;margin-top:16px;background:#088178;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}' +
      '.pa-submit:hover{background:#066e68}';
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();
    document.querySelectorAll('[data-price-alert]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var productId = this.dataset.productId || '';
        var productName = this.dataset.productName || '';
        var currentPrice = this.dataset.productPrice || '0';
        createAlertModal(productId, productName, currentPrice);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraPriceAlert = { set: setAlert, remove: removeAlert, check: checkPrice, has: hasAlert };
})();
