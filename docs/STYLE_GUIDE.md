# Cara Development Style Guide

## JavaScript Coding Standards
- **Modules**: Write modular ES JavaScript modules (`export`/`import`).
- **Formatting**: Use 2 spaces indentation. Strict equality (`===`, `!==`) is mandatory.
- **Naming Conventions**:
  - Functions: `camelCase` e.g. `initThemeEngine()`, `formatCurrency()`.
  - Constants: `UPPER_SNAKE_CASE` e.g. `EXCHANGE_RATES`, `THEMES`.
  - Filenames: `kebab-case` e.g. `currency-converter.js`, `a11y-focus-trap.js`.

## CSS Guidelines
- **Custom Properties**: Use CSS variables declared in `:root` and `[data-theme]` blocks.
- **Class Naming**: Follow BEM-like or descriptive hyphenated naming (`.stock-alert-box`, `.inventory-banner-close`).
- **Transitions**: Keep animation durations smooth (200ms - 400ms) with `ease` timing functions.

## Testing Guidelines
- Unit tests are located in `tests/unit/` using `Vitest`.
- Every new module must include a corresponding test file e.g. `tests/unit/my-module.test.js`.
- Run all tests before submitting pull requests: `npm test`.
