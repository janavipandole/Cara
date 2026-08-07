# Cart Recovery & Persistence System Specification

## Overview
The `CartRecoveryEngine` module manages abandoned user shopping sessions across tabs and browser restarts, facilitating shopping cart restoration and notification prompt rendering.

## Key Capabilities
- **Cross-Tab Synchronization:** Uses `BroadcastChannel` API to synchronize cart additions across active tabs.
- **Session Expiry Management:** Automatic expiration of abandoned cart payloads after configurable timeout thresholds (default: 15 minutes).
- **DOM Recovery Banner:** Renders an accessible, non-intrusive notification prompt allowing users to instantly restore abandoned cart items.
- **State Persistence:** LocalStorage storage layer with schema validation to prevent malformed data insertion.

## API Reference
### `saveCartSession(cartItems, couponCode)`
Persists active shopping cart items and active promo coupons.

### `getAbandonedCartSession()`
Returns non-expired, unrecovered cart payload or `null`.

### `markAsRecovered()`
Flags active session as recovered to dismiss active banners.

### `renderRecoveryBanner(containerId)`
Mounts recovery banner DOM tree to document.
