# Cart Save For Later Module Architecture

## Overview
Allows moving active shopping cart items into a separate saved list without losing item quantities or metadata.

## Usage
```javascript
import { SaveForLaterManager } from './js/save-for-later-manager.js';
const manager = new SaveForLaterManager();
manager.saveItem(product);
```
