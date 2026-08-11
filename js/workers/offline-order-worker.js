/**
 * Web Worker for IndexedDB Offline Order Storage & Transaction Queue
 * 
 * Runs in a background Web Worker context to handle asynchronous IndexedDB
 * operations for storing offline orders without blocking the main UI thread.
 */

const DB_NAME = 'CaraOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'pending_orders';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'offlineId', autoIncrement: true });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

self.onmessage = async (event) => {
  const { action, payload, id } = event.data || {};

  try {
    const db = await openDB();

    if (action === 'SAVE_ORDER') {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        ...payload,
        status: 'pending',
        createdAt: Date.now(),
      };
      const req = store.add(record);
      req.onsuccess = (e) => {
        self.postMessage({ action: 'SAVE_ORDER_SUCCESS', offlineId: e.target.result, record });
      };
      req.onerror = (e) => {
        self.postMessage({ action: 'SAVE_ORDER_ERROR', error: e.target.error.message });
      };
    } else if (action === 'GET_PENDING_ORDERS') {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        self.postMessage({ action: 'GET_PENDING_ORDERS_SUCCESS', orders: req.result || [] });
      };
      req.onerror = (e) => {
        self.postMessage({ action: 'GET_PENDING_ORDERS_ERROR', error: e.target.error.message });
      };
    } else if (action === 'REMOVE_ORDER') {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => {
        self.postMessage({ action: 'REMOVE_ORDER_SUCCESS', offlineId: id });
      };
      req.onerror = (e) => {
        self.postMessage({ action: 'REMOVE_ORDER_ERROR', error: e.target.error.message });
      };
    } else if (action === 'CLEAR_ALL') {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => {
        self.postMessage({ action: 'CLEAR_ALL_SUCCESS' });
      };
    }
  } catch (error) {
    self.postMessage({ action: 'WORKER_ERROR', error: error.message });
  }
};
