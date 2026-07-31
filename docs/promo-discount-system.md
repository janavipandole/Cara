# Promo Discount System Architecture

## Overview
The `PromoDiscountCalculator` evaluates cart subtotal against active coupon definitions (`WELCOME10`, `CARA20`, `FLAT15`, `FREESHIP`), minimum spend conditions, and automatic free shipping thresholds ($75+).

## Calculated Outputs
- `subtotal`: Base item cost total.
- `discount`: Applied monetary discount value.
- `shipping`: Evaluated shipping cost (0 if free shipping applies).
- `grandTotal`: `max(0, subtotal - discount + shipping)`.

## Unit Tests
Located in `tests/unit/promo-discount-calculator.test.js`.
