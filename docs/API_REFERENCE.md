# Cara E-Commerce API Reference

## Table of Contents
- [Overview](#overview)
- [Client Modules API](#client-modules-api)
  - [Currency Converter](#currency-converter)
  - [Stock Simulator](#stock-simulator)
  - [CSRF Protection](#csrf-protection)
  - [Accessibility Announcer](#accessibility-announcer)

---

## Client Modules API

### Currency Converter
Module path: `js/currency-converter.js`

#### `convertPrice(amountInUSD, targetCurrency)`
Converts a base USD price to the specified target currency.
- **Parameters**:
  - `amountInUSD` (number): Price in USD.
  - `targetCurrency` (string, optional): Target currency code e.g. `'EUR'`, `'GBP'`, `'INR'`, `'JPY'`.
- **Returns**: `number` - Converted amount.

#### `formatCurrency(amountInUSD, targetCurrency)`
Formats a price in USD into a locale-formatted currency string with symbol.
- **Parameters**:
  - `amountInUSD` (number): Price in USD.
  - `targetCurrency` (string, optional): Target currency code.
- **Returns**: `string` - Formatted price string e.g. `"$49.99"`, `"€45.99"`.

---

### Stock Simulator
Module path: `js/stock-simulator.js`

Drives the product page stock/availability UI from the **real** `stock` value
returned by `GET /api/products/{id}` — no hardcoded mock inventory. The
"Notify Me" restock form persists the email server-side via
`POST /api/newsletter/restock` (`{ email, product_id }`).

#### `getStockInfo(stock)`
Derives stock status from a numeric stock count.
- **Parameters**:
  - `stock` (number): The product's current stock count.
- **Returns**: `Object` - `{ count: number, status: 'normal' | 'low' | 'out' | 'unknown' }`.

#### `startStockReservationTimer(durationSeconds, onTick, onExpire)`
Runs a countdown that invokes `onTick(remaining)` each second and
`onExpire()` when it reaches zero.

#### `initStockSimulator()`
Binds the size selector to the stock-alert container and loads the real
stock for the product in `localStorage['selectedProduct']`. When stock is 0
it renders the restock form, whose submit calls `POST /api/newsletter/restock`.

---

### CSRF Protection
Module path: `js/csrf-protection.js`

#### `getOrCreateCSRFToken()`
Retrieves active Anti-CSRF token or generates a cryptographically random 32-char hex token.
- **Returns**: `string` - Active CSRF token string.

#### `attachCSRFHeader(headers)`
Appends `X-CSRF-Token` header to an existing request headers object.
- **Returns**: `Object` - Updated headers object.
