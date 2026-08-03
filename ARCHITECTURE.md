# Cara E-Commerce System Architecture

## Overview

Cara is a modern e-commerce web application featuring high-performance vanilla JavaScript modules, responsive CSS styling, accessible UI components, and containerized deployment options.

## System Architecture Diagram

```
+-----------------------------------------------------------------------+
|                              Client Browser                           |
+-----------------------------------------------------------------------+
|  HTML5 Templates  |  CSS Custom Tokens & | Vanilla JS Core Modules   |
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

## Directory Structure

```
Cara/
├── css/                        # All stylesheet files
│   ├── style.css               # Main stylesheet
│   ├── style.min.css           # Minified stylesheet
│   ├── bundle.css              # Bundled stylesheet
│   ├── global.css              # Global CSS variables & resets
│   ├── theme-engine.css        # Dark/light/high-contrast tokens
│   ├── a11y-utilities.css      # Accessibility utility classes
│   ├── header-fix.css          # Sticky header overrides
│   ├── about.css               # About page styles
│   ├── blog.css                # Blog page styles
│   ├── cart.css                # Cart page styles
│   ├── checkout.css            # Checkout form styles
│   ├── compare.css             # Product compare styles
│   ├── contact.css             # Contact page styles
│   ├── contributors.css        # Contributors page styles
│   ├── csrf-shield.css         # CSRF badge styles
│   ├── currency-converter.css  # Currency widget styles
│   ├── faq.css                 # FAQ accordion styles
│   ├── forgotPassword.css      # Password reset page styles
│   ├── index.css               # Home page styles
│   ├── lazyload.css            # Lazy-load placeholder styles
│   ├── login.css               # Login page styles
│   ├── order-history.css       # Order history styles
│   ├── privacy.css             # Privacy page styles
│   ├── promotions.css          # Promotions page styles
│   ├── recently-viewed.css     # Recently viewed widget
│   ├── register.css            # Registration page styles
│   ├── reviews.css             # Reviews component styles
│   ├── shop.css                # Shop/browse page styles
│   ├── singleProduct.css       # Product detail page styles
│   ├── stock-alert.css         # Low stock alert banner
│   ├── terms.css               # Terms page styles
│   ├── toast.css               # Toast notification styles
│   ├── toast-queue.css         # Toast queue animations
│   ├── track-order.css         # Order tracking page styles
│   ├── ui-fix.css              # Legacy UI fix overrides
│   ├── empty-cart.css          # Empty cart state styles
│   └── live-sales-toast.css    # Live sales notification styles
│
├── js/                         # All JavaScript modules
│   ├── utils/                  # Low-level utilities
│   │   └── sanitize.js
│   ├── app.js                  # Global app bootstrap
│   ├── navbar.js               # Navigation bar logic
│   ├── products.js             # Product listing & filters
│   ├── checkout.js             # Checkout page controller
│   ├── compare.js              # Product comparison controller
│   ├── contributors.js         # Contributors page controller
│   ├── empty-cart.js           # Empty cart view handler
│   ├── faq.js                  # FAQ accordion controller
│   ├── forgotPassword.js       # Password reset controller
│   ├── order-history.js        # Order history controller
│   ├── outfit-compatibility.js # Outfit check controller
│   ├── register.js             # Registration controller
│   ├── singleProduct.js        # Product detail controller
│   ├── track-order.js          # Order tracking controller
│   ├── try-on.js               # Virtual try-on controller
│   ├── login.js                # Login controller
│   ├── reviews.js              # Product reviews engine
│   ├── recently-viewed.js      # Recently viewed tracker
│   ├── smart-search-engine.js  # Smart search engine
│   ├── checkout-timer.js       # Checkout countdown timer
│   ├── checkout-autosave.js    # Autosave form data
│   ├── checkout-validator.js   # Checkout form validation
│   ├── checkout-vault.js       # Secure checkout data vault
│   ├── checkout-wizard.js      # Multi-step checkout wizard
│   ├── address-autocomplete.js # Address autocomplete
│   ├── address-validation-service.js # Address validation
│   ├── coupon-validator.js     # Coupon validation engine
│   ├── currency-converter.js   # Currency conversion module
│   ├── error-boundary.js       # UI error boundary
│   ├── error-logger.js         # Error logging service
│   ├── fetch-timeout.js        # Fetch with timeout wrapper
│   ├── live-sales-toast.js     # Live sales notifications
│   ├── loyalty-rewards-engine.js # Loyalty points engine
│   ├── newsletter-subscribe.js # Newsletter subscription
│   ├── order-telemetry-tracker.js # Order telemetry
│   ├── order-timeline.js       # Order status timeline
│   ├── outfit-compatibility-engine.js # Outfit AI engine
│   ├── product-review-aggregator.js # Review aggregation
│   ├── product-reviews.js      # Reviews display
│   ├── product-search.js       # Search logic
│   ├── promo-discount-calculator.js # Promo discounts
│   ├── recommendations.js      # Product recommendations
│   ├── session-lock.js         # Session lock guard
│   ├── shipping-calc.js        # Shipping cost calculator
│   ├── stock-simulator.js      # Inventory simulation
│   ├── theme-engine.js         # Theme switching logic
│   ├── toast-queue.js          # Toast notification queue
│   ├── virtual-tryon-engine.js # Virtual try-on AI engine
│   └── wishlist-notes-tag-manager.js # Wishlist manager
│
├── assets/
│   ├── css/                    # Micro utility CSS (scroll-top, skeleton, etc.)
│   ├── js/                     # Micro utility JS (api.js, csrf.js, etc.)
│   └── garments/               # Garment image assets
│
├── backend/                    # Node.js API server
├── docs/                       # Project documentation
├── images/                     # Static image assets
├── scripts/                    # Build & deployment scripts
├── tests/
│   └── unit/                   # Vitest unit test suites (185 tests)
├── .github/                    # GitHub Actions CI workflows
├── .husky/                     # Git pre-commit hooks
│
├── service-worker.js           # PWA service worker (must stay at root)
├── verify_env.js               # Dev environment checker
├── index.html                  # Home page
├── [all other *.html]          # Feature pages (shop, cart, checkout, etc.)
│
├── package.json                # Node.js project manifest
├── vitest.config.js            # Vitest test configuration
├── eslint.config.mjs           # ESLint flat config
├── commitlint.config.js        # Commit message linting
├── Dockerfile / docker-compose.yml  # Container config
└── README.md / CONTRIBUTING.md / ARCHITECTURE.md  # Project docs
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
