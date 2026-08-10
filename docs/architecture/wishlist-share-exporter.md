# Shareable Wishlist Link Exporter Architecture

## Overview
Serializes wishlist item arrays into portable URL query parameters for cross-user sharing.

## Usage
```javascript
import { WishlistShareExporter } from './js/wishlist-share-exporter.js';
const link = WishlistShareExporter.exportToShareableLink(items);
```
