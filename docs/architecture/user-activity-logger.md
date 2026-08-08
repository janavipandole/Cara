# User Activity Session Logger Architecture

## Overview
Stores high-level user navigation and interaction telemetry events locally in localStorage.

## Usage
```javascript
import { UserActivityLogger } from './js/user-activity-logger.js';
const logger = new UserActivityLogger();
logger.logEvent('CLICK_PRODUCT', { id: 101 });
```
