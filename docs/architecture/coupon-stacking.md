# Multi-Coupon Stacking Engine Documentation

## Overview
Allows combining flat amount and percentage promo codes during checkout.

## Usage
```javascript
import { CouponStackingEngine } from './js/coupon-stacking-engine.js';
const engine = new CouponStackingEngine();
const result = engine.calculateStackedDiscount(1500, coupons);
```
