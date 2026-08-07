# Cara E-Commerce System Architecture

## Overview

Cara is a modern e-commerce web application featuring high-performance vanilla
JavaScript modules, responsive CSS styling, accessible UI components, and
containerized deployment options.

## System Architecture Diagram

```text
+-----------------------------------------------------------------------+
|                              Client Browser                           |
+-----------------------------------------------------------------------+
|  HTML5 Templates  |  CSS tokens + style.css | Vanilla JS Core Modules |
|  (shop, cart,     |  (css/tokens.css)       | (Cart, Coupons, Theme,  |
|   checkout)       |                         |  Stock Alert, Auth)     |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                          Security & Data Layer                        |
+-----------------------------------------------------------------------+
|  Input Shield & Sanitizer  |  httpOnly cookies | Cart localStorage    |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                       Backend & Container Services                     |
+-----------------------------------------------------------------------+
|  FastAPI (uvicorn) / PostgreSQL / Nginx static / Docker Compose        |
+-----------------------------------------------------------------------+
```

## CSS layering

1. `css/tokens.css` — design tokens (`:root` / `[data-theme]`)
2. `style.css` — canonical component + layout stylesheet
3. Page-specific sheets (`header-form.css`, `stock-alert.css`, …)
4. `global.css` / `bundle.css` — compatibility shims that re-export the
   canonical sheet (do not add new rules there)

## Core Design Principles

1. **Zero External Heavy Framework Dependencies**: Lightweight, high-speed
   execution using native Web APIs.
2. **Accessibility-First**: ARIA live region announcements, keyboard focus
   trapping, and high-contrast color themes.
3. **Defense in Depth**: Client-side HTML input sanitization, cookie-based
   auth, and server-side order pricing.
4. **Performance & Resiliency**: IntersectionObserver image lazy loading,
   request timeouts, and graceful offline fallbacks.

## Key Subsystems & Modules

- **Theme Engine (`js/theme-engine.js`)**: Manages light, dark, high-contrast,
  and system color preferences.
- **Stock Simulator (`js/stock-simulator.js`)**: Handles size-specific inventory
  tracking and reservation expiry timers.
- **Currency Converter (`js/currency-converter.js`)**: Real-time price currency
  conversion and dynamic symbol formatting.
- **Accessibility Suite (`js/a11y-focus-trap.js`, `js/a11y-announcer.js`)**:
  Screen-reader live region alerts and modal focus trap locks.
- **Security Middleware (`js/csrf-protection.js`, `js/utils/sanitize.js`)**:
  Anti-CSRF token generation and HTML entity sanitization.
- **Backend (`backend/app`)**: FastAPI routers for auth, products, orders,
  payments, and admin analytics.

## Backend layout

```text
backend/
  app/
    api/          # FastAPI routers
    models.py     # SQLAlchemy models
    schemas.py    # Pydantic schemas
  alembic/        # Migrations
  tests/          # Pytest suite
```

Local API: `uvicorn app.main:app --reload` from `backend/`.

Containerized stack: see `docs/DEPLOYMENT.md` (`docker compose up --build`).
