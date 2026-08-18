/**
 * Web Worker Manager for Cara E-Commerce
 *
 * Provides a promise-based API for offloading CPU-intensive computations
 * to a dedicated Web Worker thread. The UI thread stays responsive while
 * the worker crunches search filters, financial calculations, outfit
 * scoring, coupon stacking, and heavy JSON serialization in the background.
 *
 * Usage:
 *   import { BackgroundWorker } from './worker-manager.js';
 *   const worker = BackgroundWorker.getInstance();
 *   const filtered = await worker.post('FILTER_PRODUCTS', { products, query, ... });
 */

class BackgroundWorkerManager {
  constructor() {
    this._worker = null;
    this._pending = new Map();
    this._idCounter = 0;
    this._idleTimer = null;
    this._idleTimeout = 30000;
    this._init();
  }

  _init() {
    try {
      this._worker = new Worker('js/workers/background-tasks.js');
      this._worker.onmessage = this._onMessage.bind(this);
      this._worker.onerror = this._onError.bind(this);
    } catch (e) {
      console.warn(
        '[WorkerManager] Web Worker not supported, falling back to main thread.',
        e,
      );
      this._worker = null;
    }
  }

  _onMessage(event) {
    var data = event.data;
    var pending = this._pending.get(data.taskId);
    if (!pending) return;

    this._pending.delete(data.taskId);
    this._resetIdleTimer();

    if (data.error) {
      pending.reject(new Error(data.error));
    } else {
      pending.resolve(data.result);
    }
  }

  _onError(event) {
    console.error('[WorkerManager] Worker error:', event.message);
    this._pending.forEach(function (entry) {
      entry.reject(new Error('Worker error: ' + event.message));
    });
    this._pending.clear();
    this._worker = null;

    setTimeout(this._init.bind(this), 1000);
  }

  _resetIdleTimer() {
    clearTimeout(this._idleTimer);
    if (this._pending.size === 0 && this._worker) {
      this._idleTimer = setTimeout(
        this._terminate.bind(this),
        this._idleTimeout,
      );
    }
  }

  _terminate() {
    if (this._worker && this._pending.size === 0) {
      this._worker.terminate();
      this._worker = null;
    }
  }

  _ensureWorker() {
    if (!this._worker) this._init();
    clearTimeout(this._idleTimer);
    return this._worker;
  }

  /**
   * Send a task to the worker and return a Promise with the result.
   *
   * @param {string} type  - Task type identifier (e.g. 'FILTER_PRODUCTS')
   * @param {object} payload - Data to send to the worker
   * @param {number} [timeout=5000] - Max ms before rejecting
   * @returns {Promise<*>} Resolved with the computed result
   */
  post(type, payload, timeout) {
    var self = this;
    var worker = this._ensureWorker();

    if (!worker) {
      return Promise.resolve(this._fallback(type, payload));
    }

    var taskId = ++this._idCounter;
    var timeoutMs = timeout || 5000;

    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        self._pending.delete(taskId);
        reject(new Error('Worker task timed out: ' + type));
      }, timeoutMs);

      self._pending.set(taskId, {
        resolve: function (result) {
          clearTimeout(timer);
          resolve(result);
        },
        reject: function (err) {
          clearTimeout(timer);
          reject(err);
        },
      });

      worker.postMessage({ taskId: taskId, type: type, payload: payload });
    });
  }

  /**
   * Fallback: run computation on the main thread when the Worker is unavailable.
   */
  _fallback(type, payload) {
    switch (type) {
      case 'SERIALIZE_CART':
        return JSON.stringify(payload.cart);
      case 'DESERIALIZE_CART':
        return JSON.parse(payload.raw);
      case 'CALCULATE_CHECKOUT_SUMMARY':
        return this._fallbackCheckoutSummary(payload);
      default:
        return null;
    }
  }

  _fallbackCheckoutSummary(payload) {
    var cart = payload.cart || [];
    var subtotalCents = 0;
    for (var i = 0; i < cart.length; i++) {
      subtotalCents +=
        Math.round((parseFloat(cart[i].price) || 0) * 100) *
        (parseInt(cart[i].quantity, 10) || 1);
    }
    var subtotal = subtotalCents / 100;
    var couponDiscountCents = Math.round(
      (subtotalCents * (payload.couponPct || 0)) / 100,
    );
    var urgencyDiscount = payload.hasUrgency
      ? subtotal * (payload.urgencyPct || 0.05)
      : 0;
    var urgencyDiscountCents = Math.round(urgencyDiscount * 100);
    var giftChargeCents = payload.hasGiftWrap
      ? Math.round((payload.giftCharge || 99) * 100)
      : 0;
    var taxCents = Math.round(subtotalCents * (payload.taxRate || 0.18));
    var loyaltyDiscount =
      (payload.loyaltyPoints || 0) / (payload.pointsPerRupee || 10);
    var loyaltyDiscountCents = Math.round(loyaltyDiscount * 100);
    var grandTotalCents = Math.max(
      0,
      subtotalCents +
        taxCents +
        giftChargeCents -
        couponDiscountCents -
        urgencyDiscountCents -
        loyaltyDiscountCents,
    );

    return {
      subtotalCents: subtotalCents,
      taxCents: taxCents,
      couponDiscountCents: couponDiscountCents,
      urgencyDiscountCents: urgencyDiscountCents,
      giftChargeCents: giftChargeCents,
      loyaltyDiscountCents: loyaltyDiscountCents,
      grandTotalCents: grandTotalCents,
      couponCode: payload.couponCode || '',
      loyaltyPoints: payload.loyaltyPoints || 0,
      urgencyPct: payload.urgencyPct || 0,
    };
  }

  terminate() {
    clearTimeout(this._idleTimer);
    if (this._worker) {
      this._worker.terminate();
      this._worker = null;
    }
    this._pending.forEach(function (entry) {
      entry.reject(new Error('Worker terminated'));
    });
    this._pending.clear();
  }
}

var _instance = null;

var BackgroundWorker = {
  getInstance: function () {
    if (!_instance) _instance = new BackgroundWorkerManager();
    return _instance;
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackgroundWorker;
} else {
  window.BackgroundWorker = BackgroundWorker;
}
