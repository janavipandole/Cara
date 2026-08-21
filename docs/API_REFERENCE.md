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

#### `getStockInfo(size)`
Retrieves real-time stock status and item quantity for a specific product size.
- **Parameters**:
  - `size` (string): Size key (e.g., `'Small'`, `'Medium'`, `'Large'`, `'XL'`, `'XXL'`).
- **Returns**: `Object` - `{ count: number, status: 'normal' | 'low' | 'out' }`.

---

### CSRF Protection
Module path: `js/csrf-protection.js`

#### `getOrCreateCSRFToken()`
Retrieves active Anti-CSRF token or generates a cryptographically random 32-char hex token.
- **Returns**: `string` - Active CSRF token string.

#### `attachCSRFHeader(headers)`
Appends `X-CSRF-Token` header to an existing request headers object.
- **Returns**: `Object` - Updated headers object.
