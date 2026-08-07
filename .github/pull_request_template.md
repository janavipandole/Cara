# 📋 Pull Request Template

## 📝 Summary
<!-- Provide a clear, concise description of what this PR does -->

## 🎯 Type of Change
<!-- Check all that apply -->
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 💥 Breaking change (fix or feature causing existing functionality to change)
- [ ] 📚 Documentation update
- [ ] 🎨 Code style / formatting (prettier, eslint)
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test addition / update
- [ ] 🔧 Build / CI / tooling changes
- [ ] ♿ Accessibility improvement

## 🔗 Related Issues
<!-- Link related issues using keywords like "Fixes #123", "Closes #456", "Addresses #789" -->
- Fixes #
- Closes #
- Addresses #

## 🧪 Testing
<!-- Describe how you tested your changes -->
- [ ] Unit tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Format passes (`npm run format:check`)
- [ ] Manual testing done in browser(s):
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
  - [ ] Mobile Chrome
  - [ ] Mobile Safari
- [ ] Accessibility tested:
  - [ ] Keyboard navigation
  - [ ] Screen reader (NVDA/JAWS/VoiceOver)
  - [ ] Color contrast
  - [ ] Focus indicators visible

## 📸 Screenshots / Recordings
<!-- Add before/after screenshots for UI changes -->
| Before | After |
|--------|-------|
| ![before](url) | ![after](url) |

## ♿ Accessibility Checklist
<!-- For UI changes, verify these -->
- [ ] Semantic HTML used (buttons, links, headings)
- [ ] ARIA attributes where needed (aria-label, aria-live, role)
- [ ] Focus visible styles present
- [ ] Skip links work
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] No duplicate IDs
- [ ] Form labels properly associated
- [ ] Dynamic content announced via aria-live

## 🔧 Changes Made
<!-- List key files changed and what was done -->
| File | Change |
|------|--------|
| `global.css` | Fixed dark mode selectors, added focus-visible, sr-only |
| `index.html` | Fixed duplicate IDs, aria-labels, skip links |
| `navbar.js` | Fixed close button semantic HTML |
| `checkout.html` | Payment tabs to buttons, CSRF token placeholder |

## ⚠️ Breaking Changes
<!-- If this is a breaking change, describe what breaks and migration path -->
None

## 📋 Pre-merge Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] No console.log / debugger left in code
- [ ] No commented-out code blocks
- [ ] Tests added/updated for new functionality
- [ ] CI passes (GitHub Actions)

## 👀 Reviewer Notes
<!-- Any specific areas you want reviewers to focus on -->