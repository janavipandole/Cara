# Dynamic Delivery Date Estimator Architecture

## Overview
Calculates accurate delivery date windows taking into account weekend skips and shipping methods.

## Usage
```javascript
import { DeliveryDateEstimator } from './js/delivery-date-estimator.js';
const estimator = new DeliveryDateEstimator();
const estimatedDate = estimator.estimateDeliveryDate(new Date(), true);
```
