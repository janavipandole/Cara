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
