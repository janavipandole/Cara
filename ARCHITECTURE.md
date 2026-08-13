# Cara E-Commerce System Architecture

## Overview
Cara is a modern e-commerce web application featuring high-performance vanilla JavaScript modules, responsive CSS styling, accessible UI components, and containerized deployment options.

## System Architecture Diagram
```
+-----------------------------------------------------------------------+
|                              Client Browser                           |
+-----------------------------------------------------------------------+
|  HTML5 Templates  |  CSS Custom Tokens &  | Vanilla JS Core Modules   |
|  (shop, cart,     |  Theme Engines        | (Cart, Coupons, Theme,    |
|   checkout)       |                       |  Stock Alert, CSRF)       |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                          Security & Data Layer                        |
+-----------------------------------------------------------------------+
|  Input Shield & Sanitizer  |  CSRF Tokens  | Encrypted Local Storage  |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                       Backend & Container Services                     |
+-----------------------------------------------------------------------+
|  Node.js API Services / Static Nginx Web Server / Vitest Test Runner  |
+-----------------------------------------------------------------------+
```

## Core Design Principles
1. **Zero External Heavy Framework Dependencies**: Lightweight, high-speed execution using native Web APIs.
2. **Accessibility-First**: ARIA live region announcements, keyboard focus trapping, and high-contrast color themes.
3. **Defense in Depth**: Client-side HTML input sanitization, anti-CSRF headers, and secure local storage encryption.
4. **Performance & Resiliency**: IntersectionObserver image lazy loading, request timeouts, and graceful offline fallbacks.

## Key Subsystems & Modules
- **Theme Engine (`js/theme-engine.js`)**: Manages light, dark, high-contrast, and system color preferences.
- **Stock Simulator (`js/stock-simulator.js`)**: Handles size-specific inventory tracking and reservation expiry timers.
- **Currency Converter (`js/currency-converter.js`)**: Real-time price currency conversion and dynamic symbol formatting.
- **Accessibility Suite (`js/a11y-focus-trap.js`, `js/a11y-announcer.js`)**: Screen-reader live region alerts and modal focus trap locks.
- **Security Middleware (`js/csrf-protection.js`, `js/utils/sanitize.js`)**: Anti-CSRF token generation and HTML entity sanitization.
- **Outfit Rules Engine (`backend/app/rules/engine.py`)**: Applies deterministic outfit-compatibility business rules (self-exclusion, subcategory pairing, category compatibility, symmetric color harmony, and pattern clash avoidance) on top of the vector-similarity candidates returned by the FAISS index. The reranker (`backend/app/rules/reranker.py`) then personalizes the surviving candidates using anonymized interaction history.
- **Vector Search (`backend/app/vector_search/faiss_index.py`)**: Maintains the FAISS product-embedding index and resolves similar-product candidates by product id.


## Developer Guidelines - doc_section_100
- Follow standard repository conventions when contributing updates.
- Ensure unit test coverage is verified before submitting PRs.


## Offline Order Queue

The  module () provides an offline-first order queuing system using a Web Worker and localStorage fallback.

### Architecture

- **OfflineOrderQueue class** (): Main coordinator that manages order enqueuing, network listeners, and sync.
- **offline-order-worker.js** (): Web Worker that handles IndexedDB storage for pending orders.
- **localStorage fallback**: If Web Workers are unavailable, orders are stored in  in localStorage.

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
|  | string |  | API endpoint for order submission |
|  | string |  | Path to the Web Worker script |
|  | function |  | Callback fired when an order is successfully synced |
|  | function |  | Callback fired when the pending count changes |

### Key Methods

- : Saves an order for later sync. Returns .
- : Returns a Promise resolving to the list of pending orders.
- : Submits all pending orders to the API when online.
- : Discards all pending orders without syncing.
- : Returns the current network status (boolean).

### Sync Strategy

1. When  is called, the order is saved to IndexedDB via the worker (or localStorage as fallback).
2. A BackgroundSync registration is attempted via the Service Worker.
3. When the browser fires the  event,  is called automatically.
4. Each order is submitted sequentially. On success, it is removed from the queue via a  message to the worker.
5. The  is updated and  is called on each state change.

## Offline Order Queue

The `OfflineOrderQueue` module (`js/offline-order-queue.js`) provides an offline-first order queuing system using a Web Worker and localStorage fallback.

### Architecture

- **OfflineOrderQueue class** (`js/offline-order-queue.js`): Main coordinator that manages order enqueuing, network listeners, and sync.
- **offline-order-worker.js** (`js/workers/`): Web Worker that handles IndexedDB storage for pending orders.
- **localStorage fallback**: If Web Workers are unavailable, orders are stored in `cara_offline_orders` in localStorage.

### Constructor Options

- `apiEndpoint` (string): API endpoint for order submission. Default: `/api/orders`.
- `workerPath` (string): Path to the Web Worker script. Default: `js/workers/offline-order-worker.js`.
- `onOrderSynced` (function): Callback fired when an order is successfully synced.
- `onStatusChange` (function): Callback fired when the pending count changes.

### Key Methods

- `enqueueOfflineOrder(orderPayload)`: Saves an order for later sync. Returns `{success, offlineId, isOffline}`.
- `getPendingOrders()`: Returns a Promise resolving to the list of pending orders.
- `flushPendingOrders()`: Submits all pending orders to the API when online.
- `discardPendingOrders()`: Discards all pending orders without syncing.
- `isOnline()`: Returns the current network status (boolean).

### Sync Strategy

1. When `enqueueOfflineOrder` is called, the order is saved to IndexedDB via the worker (or localStorage as fallback).
2. A BackgroundSync registration is attempted via the Service Worker.
3. When the browser fires the `online` event, `flushPendingOrders` is called automatically.
4. Each order is submitted sequentially. On success, it is removed from the queue via a `REMOVE_ORDER` message to the worker.
5. The `pendingCount` is updated and `notifyStatusChange()` is called on each state change.
