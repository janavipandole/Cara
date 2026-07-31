# ADR 001: Centralized State Management

## Status
Accepted

## Context
Cara required a clean state management solution without adding heavy framework dependencies like Redux.

## Decision
We implemented a pub/sub event store with LocalStorage persistence in `js/store.js`.
