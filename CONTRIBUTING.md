# Contributing to Cara 🛍️

Thank you for considering a contribution to **Cara**! This guide covers everything you need to get started, work safely, and submit production-quality pull requests.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Issue Guidelines](#issue-guidelines)
- [Testing Your Changes](#testing-your-changes)
- [Recognition](#recognition)

---

## Code of Conduct

This project is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it. Please report unacceptable behaviour to the maintainers.

---

## Getting Started

### Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Git | 2.x+ | For version control |
| Node.js | 18.x+ | For linting & formatting |
| npm | 9.x+ | Comes with Node.js |
| Browser | Modern (Chrome/Firefox/Edge) | For local testing |

### First Time Setup

1. **Fork the repository** on GitHub (click the Fork button in the top-right corner).

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Cara.git
   cd Cara
   ```

3. **Add the upstream remote** so you can sync with the original repo:
   ```bash
   git remote add upstream https://github.com/janavipandole/Cara.git
   ```

4. **Install development dependencies**:
   ```bash
   npm install
   ```

5. **Verify your setup** by running the linter:
   ```bash
   npm run lint
   ```

---

## Development Setup

### Running the Project

Open `index.html` directly in your browser, or use a local dev server for a better experience:

```bash
# Option 1: VS Code Live Server extension (recommended)
# Install "Live Server" from the VS Code Extensions marketplace, then
# right-click index.html → "Open with Live Server"

# Option 2: Python HTTP server
python -m http.server 8000

# Option 3: Node.js http-server
npx http-server

# Option 4: PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Available npm Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Lint | `npm run lint` | Check JS for errors |
| Lint Fix | `npm run lint:fix` | Auto-fix lint issues |
| Format Check | `npm run format:check` | Check code formatting |
| Format Write | `npm run format` | Auto-format all files |

### Development Workflow

```bash
# 1. Sync your fork with the latest upstream main
git fetch upstream
git checkout main
git merge upstream/main

# 2. Create a focused feature branch
git checkout -b fix/your-bug-description

# 3. Make your changes to ONLY the relevant files

# 4. Run quality checks before committing
npm run lint
npm run format:check

# 5. Stage and commit using conventional commit format
git add <changed-files>
git commit -m "fix: describe what was fixed and why"

# 6. Push to your fork
git push origin fix/your-bug-description

# 7. Open a Pull Request on GitHub
```

---

## Branch Naming Convention

Use the following prefix scheme for all branches:

| Type | Prefix | Example |
|------|--------|---------|
| Bug fix | `fix/` | `fix/cart-overflow-mobile` |
| New feature | `feat/` | `feat/product-search-filter` |
| Enhancement | `enhancement/` | `enhancement/checkout-ux` |
| Documentation | `docs/` | `docs/update-api-guide` |
| Refactoring | `refactor/` | `refactor/extract-modal-component` |
| Styling | `style/` | `style/dark-mode-contrast` |
| Performance | `perf/` | `perf/lazy-load-images` |
| Accessibility | `accessibility/` | `accessibility/keyboard-nav` |
| Security | `security/` | `security/csp-headers` |
| CI/CD | `ci/` | `ci/add-lint-workflow` |

**Branch naming rules:**
- Lowercase only
- Hyphen-separated words
- Descriptive but concise (3–6 words)
- Must start with one of the prefixes above

---

## Commit Message Format

We follow the **Conventional Commits** specification. Every commit message must be structured as:

```
<type>(<optional-scope>): <short description>

<optional longer body explaining WHY the change was needed>

<optional footer with issue references>
```

### Types

| Type | When to use |
|------|-------------|
| `fix` | A bug fix |
| `feat` | A new feature |
| `enhancement` | Improvement to existing functionality |
| `docs` | Documentation only changes |
| `refactor` | Code restructuring without behaviour change |
| `style` | Formatting, CSS tweaks, visual changes |
| `perf` | Performance improvements |
| `test` | Adding or fixing tests |
| `chore` | Build scripts, dependencies, config |
| `ci` | Changes to CI/CD workflows |
| `security` | Security improvements |
| `accessibility` | Accessibility improvements |

### Examples ✅

```bash
# Good commit messages
fix: resolve duplicate #product1 section in shop.html
feat: add keyboard-accessible mobile menu toggle
docs: add branch naming convention to CONTRIBUTING.md
perf: add preconnect hints for CDN origins in index.html
security: add Content-Security-Policy meta to login.html
accessibility: add aria-label to all icon-only nav buttons
```

### ❌ Avoid

```bash
# Bad commit messages
fix bug
update code
changes made
final commit
fixed issue #123
```

---

## Pull Request Process

### Before Submitting

- [ ] Your branch is based on the latest `main` (rebase if behind)
- [ ] Only the files related to your change are modified
- [ ] `npm run lint` passes with no errors
- [ ] `npm run format:check` passes
- [ ] You have tested your changes in at least one modern browser
- [ ] UI changes are responsive on mobile, tablet, and desktop
- [ ] Accessibility is not regressed (keyboard nav, aria-labels, contrast)
- [ ] No secrets, API keys, or credentials are included

### PR Requirements

1. **Title**: Follow the same Conventional Commit format as your commit message.
2. **Description**: Use the [PR template](.github/pull_request_template.md) — fill every section.
3. **Scope**: One focused concern per PR. Do not mix unrelated changes.
4. **Size**: Keep PRs small and reviewable. Prefer ≤ 300 lines of diff.

### Review Process

1. A maintainer will review your PR within a few days.
2. Address any review comments with new commits on the same branch.
3. Once approved, a maintainer will merge your PR.
4. Stale PRs (no activity for 30+ days) may be closed automatically.

---

## Style Guidelines

### HTML

- Use semantic elements (`<main>`, `<article>`, `<section>`, `<nav>`, `<footer>`).
- Every interactive element must have an accessible label (`aria-label` or visible text).
- Every `<img>` must have a descriptive `alt` attribute.
- Do not use duplicate `id` values on the same page.
- Validate your markup: no unclosed tags, no nested `<a>` inside `<a>`.

### CSS

- Prefer CSS custom properties (`var(--color-primary)`) over hard-coded values.
- Follow the existing naming convention (BEM-lite or descriptive class names).
- Avoid `!important` unless absolutely necessary and justified in a comment.
- Dark mode: all new UI elements must support both `body.dark` and light modes.
- Responsive: test at 320px (small phone), 768px (tablet), and 1280px (desktop).

### JavaScript

- Write vanilla ES6+ JavaScript — no frameworks required.
- Avoid `var`; use `const` and `let`.
- Use `addEventListener` instead of inline `onclick` attributes where possible.
- Always handle null checks before accessing DOM elements.
- Do not use `alert()`, `confirm()`, or `prompt()` — use the existing toast system.

---

## Issue Guidelines

### Bug Reports

Use the **Bug Report** issue template. Include:

- **Environment**: OS, browser name & version
- **Steps to reproduce**: numbered, exact steps
- **Expected behaviour**: what should happen
- **Actual behaviour**: what actually happens
- **Screenshots or video**: if the issue is visual

### Feature Requests

Use the **Feature Request** issue template. Include:

- **Problem description**: what gap this feature fills
- **Proposed solution**: how it should work
- **Alternatives considered**: other approaches you explored
- **Mockups**: if it's a UI feature, include rough sketches

### Enhancement Requests

Use the **Enhancement Request** template for improvements to existing features.

---

## Testing Your Changes

### Browser Testing Checklist

Before opening a PR for any UI change, test in:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Mobile Chrome (or DevTools mobile emulation at 375px)

### Accessibility Checklist

- [ ] All interactive elements are reachable by Tab key
- [ ] Focus indicators are visible (not removed with `outline: none` without replacement)
- [ ] Screen reader: page structure makes sense with headings hierarchy
- [ ] Colour contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text

### Responsiveness Checklist

Test your changes at these breakpoints:

| Viewport | Width |
|----------|-------|
| Small phone | 320px |
| Standard phone | 375px |
| Large phone | 430px |
| Tablet portrait | 768px |
| Tablet landscape | 1024px |
| Desktop | 1280px+ |

---

## Recognition

Contributors are recognised in:

- **README.md** contributors section (powered by contrib.rocks)
- **GitHub contributors page**
- **Release notes** for significant contributions

Thank you for making Cara better! 🛍️

---

*Last updated: 2026 · Maintainer: [@janavipandole](https://github.com/janavipandole)*
