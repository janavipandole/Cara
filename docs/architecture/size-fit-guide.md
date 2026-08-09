# Size & Fit Recommendation Engine Documentation

## Overview
Provides interactive size recommendation based on body measurements and fit preferences.

## Usage
```javascript
import { SizeFitCalculator } from './js/size-fit-calculator.js';
const calc = new SizeFitCalculator();
const recommended = calc.recommendSize(92, 74, 'regular'); // returns "M"
```
