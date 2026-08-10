# Abandoned Cart Recovery Notifier Architecture

## Overview
Monitors idle cart sessions and prompts desktop/browser recovery notifications to reduce bounce rates.

## Usage
```javascript
import { AbandonedCartNotifier } from './js/abandoned-cart-notifier.js';
const notifier = new AbandonedCartNotifier();
notifier.startTracking(cart.length);
```
