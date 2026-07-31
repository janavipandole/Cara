# Loyalty Rewards Tier Engine Architecture

## Overview
`LoyaltyRewardsEngine` tracks customer point accrual, tier status transitions (Bronze 0+, Silver 500+, Gold 1500+, Platinum 3000+), point multipliers, and discount redemptions.

## Features
- **Tier Multipliers**: Higher tiers earn points faster (up to 2.0x for Platinum).
- **Point Redemption**: 100 points = $1.00 store discount credit.
- **Audit History**: Maintains timestamped transaction log in `localStorage`.

## Unit Test Coverage
Tested via Vitest in `tests/unit/loyalty-rewards-engine.test.js`.
