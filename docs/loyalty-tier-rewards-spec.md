# Customer Loyalty & Tier Analytics Specification

## Overview
The `LoyaltyDashboardWidget` component builds on `LoyaltyRewardsEngine` to deliver a gamified rewards overview dashboard displaying active tiers, point multipliers, and milestone progress towards higher status tiers.

## Loyalty Tiers Schema
- **Bronze (0 - 499 pts):** 1.0x Base Multiplier
- **Silver (500 - 1,499 pts):** 1.25x Multiplier + Free Shipping
- **Gold (1,500 - 2,999 pts):** 1.5x Multiplier + Priority Support
- **Platinum (3,000+ pts):** 2.0x Multiplier + Exclusive Pre-Launch Access

## Widget Component Features
- Automatic progress bar calculations relative to tier thresholds.
- Dynamic reward tag rendering with badge animations.
