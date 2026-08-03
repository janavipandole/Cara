# ADR 0002: Client-side State Management and Storage Standards

## Context

Cara relies on client-side logic to coordinate cart updates, wishlist actions, checkout flows, and preferences. There is a need to establish a consistent, standardized state synchronization pattern that minimizes page reloads and ensures data is saved securely and formatted correctly.

## Decision

All future frontend modules must conform to:

1. **Pub/Sub Custom Event Bus**: Component communication must happen through `CustomEvent` dispatched from `window`.
2. **Defensive Storage Parsing**: All operations reading from `localStorage` must wrap parser calls in try/catch boundaries.
3. **Session vs Persistent Storage**: Cart and wishlist elements remain persistent, while form drafts, captcha statuses, and tracking states should utilize `sessionStorage`.

## Consequences

- Clean separation of UI logic.
- Prevent application crash loops from corrupted localStorage keys.
