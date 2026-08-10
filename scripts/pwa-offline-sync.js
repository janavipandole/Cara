/**
 * Mock PWA Offline Mode & IndexedDB Sync
 * Simulates caching offline mutations (like Add to Cart) in IndexedDB 
 * and syncing them when the connection is restored.
 */

export class OfflineSyncManager {
  constructor(dbName = 'cara-offline-db', storeName = 'offline-actions') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  /**
   * Initializes the IndexedDB database for storing offline actions.
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('[Offline Sync] IndexedDB initialized.');
        
        // Listen for online event to trigger background sync
        window.addEventListener('online', () => this.syncOfflineActions());
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[Offline Sync] IndexedDB initialization failed:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Saves an action (mutation) to IndexedDB if the user is currently offline.
   */
  async saveOfflineAction(actionType, payload) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const action = {
        type: actionType,
        payload,
        timestamp: new Date().toISOString()
      };

      const request = store.add(action);

      request.onsuccess = () => {
        console.log(`[Offline Sync] Action '${actionType}' saved locally.`);
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  /**
   * Reads all offline actions from IndexedDB.
   */
  async getOfflineActions() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  /**
   * Clears an action from IndexedDB after it has been successfully synced.
   */
  async deleteOfflineAction(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }

  /**
   * Flushes the offline queue and sends saved actions to the server.
   */
  async syncOfflineActions() {
    console.log('[Offline Sync] Network connection restored. Checking for offline actions...');
    const actions = await this.getOfflineActions();
    
    if (actions.length === 0) {
      console.log('[Offline Sync] No offline actions to sync.');
      return;
    }

    console.log(`[Offline Sync] Found ${actions.length} offline actions. Syncing to server...`);

    for (const action of actions) {
      try {
        // Mock API call to server
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log(`[Offline Sync] Successfully synced action: ${action.type}`);
        
        // Remove from IndexedDB once successful
        await this.deleteOfflineAction(action.id);
      } catch (error) {
        console.error(`[Offline Sync] Failed to sync action ${action.id}:`, error);
        // Will be retried on next online event
      }
    }
  }
}

// Usage Example for a React component or vanilla JS cart module:
// const syncManager = new OfflineSyncManager();
// syncManager.init();
//
// function handleAddToCart(product) {
//   if (!navigator.onLine) {
//     alert('You are offline! Adding to cart locally. It will sync when you are back online.');
//     syncManager.saveOfflineAction('ADD_TO_CART', product);
//   } else {
//     // normal fetch call to server
//   }
// }
