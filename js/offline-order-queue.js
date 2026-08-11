/**
 * Offline-First Order Queue & Background Synchronization Coordinator
 * 
 * Intercepts offline order submissions, stores transactions in IndexedDB via Web Worker,
 * displays pending order indicators, and flushes orders automatically upon network recovery.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.OfflineOrderQueue = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class OfflineOrderQueue {
    constructor(options = {}) {
      this.apiEndpoint = options.apiEndpoint || '/api/orders';
      this.workerPath = options.workerPath || 'js/workers/offline-order-worker.js';
      this.onOrderSynced = options.onOrderSynced || null;
      this.onStatusChange = options.onStatusChange || null;
      this.pendingCount = 0;
      this.worker = null;

      this.initWorker();
      this.initNetworkListeners();
    }

    initWorker() {
      if (typeof window !== 'undefined' && typeof window.Worker !== 'undefined') {
        try {
          this.worker = new Worker(this.workerPath);
          this.worker.onmessage = (event) => this.handleWorkerMessage(event.data);
          this.updatePendingCount();
        } catch (e) {
          this.worker = null;
        }
      }
    }

    initNetworkListeners() {
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('online', () => {
          this.flushPendingOrders();
        });

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'FLUSH_OFFLINE_ORDERS') {
              this.flushPendingOrders();
            }
          });
        }
      }
    }

    handleWorkerMessage(data) {
      if (!data) return;

      if (data.action === 'GET_PENDING_ORDERS_SUCCESS') {
        this.pendingCount = (data.orders || []).length;
        this.notifyStatusChange();
      } else if (data.action === 'SAVE_ORDER_SUCCESS') {
        this.updatePendingCount();
      } else if (data.action === 'REMOVE_ORDER_SUCCESS') {
        this.updatePendingCount();
      }
    }

    notifyStatusChange() {
      if (typeof this.onStatusChange === 'function') {
        this.onStatusChange({ pendingCount: this.pendingCount, isOnline: this.isOnline() });
      }
    }

    isOnline() {
      return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }

    updatePendingCount() {
      if (this.worker) {
        this.worker.postMessage({ action: 'GET_PENDING_ORDERS' });
      }
    }

    async enqueueOfflineOrder(orderPayload) {
      const offlineId = 'off_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const offlineRecord = {
        offlineId,
        payload: orderPayload,
        timestamp: Date.now(),
        status: 'pending_offline',
      };

      if (this.worker) {
        this.worker.postMessage({ action: 'SAVE_ORDER', payload: offlineRecord });
      } else {
        // Fallback for environments without Workers
        this.saveFallbackOrder(offlineRecord);
      }

      this.pendingCount++;
      this.notifyStatusChange();

      // Trigger BackgroundSync if supported by Service Worker
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-offline-orders');
        } catch (e) {
          // ignore sync register failure
        }
      }

      return {
        success: true,
        offlineId,
        isOffline: true,
        message: 'Order saved offline. It will automatically submit once internet connection is restored.',
      };
    }

    saveFallbackOrder(record) {
      try {
        const stored = JSON.parse(localStorage.getItem('cara_offline_orders') || '[]');
        stored.push(record);
        localStorage.setItem('cara_offline_orders', JSON.stringify(stored));
      } catch (e) {
        // ignore
      }
    }

    getFallbackOrders() {
      try {
        return JSON.parse(localStorage.getItem('cara_offline_orders') || '[]');
      } catch (e) {
        return [];
      }
    }

    removeFallbackOrder(offlineId) {
      try {
        let stored = this.getFallbackOrders();
        stored = stored.filter((o) => o.offlineId !== offlineId);
        localStorage.setItem('cara_offline_orders', JSON.stringify(stored));
      } catch (e) {
        // ignore
      }
    }

    async getPendingOrders() {
      if (!this.worker) {
        return this.getFallbackOrders();
      }

      return new Promise((resolve) => {
        const handler = (event) => {
          if (event.data && event.data.action === 'GET_PENDING_ORDERS_SUCCESS') {
            this.worker.removeEventListener('message', handler);
            resolve(event.data.orders || []);
          }
        };
        this.worker.addEventListener('message', handler);
        this.worker.postMessage({ action: 'GET_PENDING_ORDERS' });

        setTimeout(() => resolve([]), 1000);
      });
    }

    async flushPendingOrders(customSubmitFn = null) {
      if (!this.isOnline()) return;

      const orders = await this.getPendingOrders();
      if (!orders || orders.length === 0) return;

      const fetchFunc = typeof window.fetchWithTimeout === 'function' ? window.fetchWithTimeout : fetch;

      for (const item of orders) {
        const payload = item.payload || item;
        const offlineId = item.offlineId;

        try {
          let res;
          if (typeof customSubmitFn === 'function') {
            res = await customSubmitFn(payload);
          } else {
            const apiBaseUrl = window.CARA_API_BASE_URL || '';
            res = await fetchFunc(`${apiBaseUrl}${this.apiEndpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(payload),
            });
          }

          if (res && (res.ok || res.status === 'success' || res.id)) {
            if (this.worker && offlineId) {
              this.worker.postMessage({ action: 'REMOVE_ORDER', id: offlineId });
            } else if (offlineId) {
              this.removeFallbackOrder(offlineId);
            }

            if (typeof this.onOrderSynced === 'function') {
              this.onOrderSynced(item);
            }
          }
        } catch (err) {
          console.warn('Failed to flush offline order:', err);
        }
      }

      this.updatePendingCount();
    }
  }

  return OfflineOrderQueue;
});
