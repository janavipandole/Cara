# Pull Request

## Related Issue

<!--
Every PR MUST link to an existing issue.
Use "Closes #ISSUE_NUMBER" so GitHub auto-closes the issue on merge.
-->

Closes #

---

## Type of Change

<!-- Mark the boxes that apply. Remove lines that are not relevant. -->

- [ ] 🐛 Bug fix — non-breaking change that resolves a reported issue
- [ ] ✨ New feature — non-breaking change that adds functionality
- [ ] 💥 Breaking change — fix or feature that changes existing behavior
- [ ] 🎨 UI / UX improvement — visual or interaction polish
- [ ] ♻️ Refactor — code improvement with no functional change
- [ ] 📚 Documentation update
- [ ] ⚙️ CI / tooling / workflow change
- [ ] 🔒 Security fix

---

## Summary

<!--
2–5 sentence description of WHAT changed and WHY.
Focus on the decision, not just the diff.
-->

---

## Changes Made

<!--
Bullet list of the concrete changes in this PR.
Keep each item focused and scannable.
-->

-
-
- ***

## Screenshots / Recordings

<!--
Required for UI changes. Add before/after screenshots or a short screen recording.
Drag and drop images directly into this text area.
-->

| Before | After |
| ------ | ----- |
|        |       |

---

## Testing

<!--
Describe how you tested these changes so reviewers can verify them quickly.
-->

### How to Test Locally

1.
2.
3.

### Test Coverage

- [ ] I added / updated unit tests for the new logic
- [ ] I verified manually in Chrome (desktop)
- [ ] I verified manually on a mobile viewport (< 480 px)
- [ ] I ran `npm run lint` and it passes with no errors
- [ ] I ran `npm run format:check` and it passes with no errors
- [ ] Backend: I ran `pytest` and all tests pass (if backend changed)
- [ ] Backend: Alembic migration applies cleanly with `alembic upgrade head` (if DB schema changed)

---

## Impact

<!--
Explain the user-facing or developer-facing benefit of this change.
-->

---

## Checklist

- [ ] My code follows the existing style and conventions of this project
- [ ] I have self-reviewed my diff and removed debug/console logs
- [ ] I have not introduced any unrelated changes in this PR
- [ ] The PR title follows [Conventional Commits](https://www.conventionalcommits.org/) format (`fix:`, `feat:`, `docs:`, etc.)
- [ ] I have updated relevant documentation (README, CONTRIBUTING, inline comments) if needed
- [ ] All new and existing tests pass
- [ ] This PR is independently reviewable and mergeable (no stacked dependencies)
