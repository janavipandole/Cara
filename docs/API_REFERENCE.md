# Cara E-Commerce API Reference

## Table of Contents
- [Overview](#overview)
- [Client Modules API](#client-modules-api)
  - [Currency Converter](#currency-converter)
  - [Stock Simulator](#stock-simulator)
  - [Accessibility Announcer](#accessibility-announcer)
- [CSRF & Session Cookies](#csrf--session-cookies)

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

### CSRF & Session Cookies

Cross-site request forgery protection is handled **server-side** by cookie attributes, not by a client-side token. The backend sets both auth cookies with `SameSite=Lax` and `HttpOnly` (`backend/app/api/auth.py`, `COOKIE_SAMESITE = "lax"`), so browsers only send them on same-site requests, which blocks cross-site state-changing requests.

There is intentionally **no client-side CSRF token**; there is no `_csrf` form field and no `X-CSRF-Token` header. Do not add one unless a server-side validator is implemented and enforced on state-changing routes. If the cookie policy is ever relaxed (e.g. `SameSite=None` for cross-site iframe embedding), a real server-side CSRF mechanism must be introduced first.
