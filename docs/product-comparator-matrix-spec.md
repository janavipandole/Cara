# Product Comparison Matrix Architecture Specification

## Overview
The `ProductComparatorMatrix` engine allows shoppers to compare up to 4 apparel products side-by-side across pricing, ratings, colorways, and material attributes.

## Key Capabilities
- **Slot Capacity Management:** Enforces configurable product limit bounds (default: 4 products).
- **Duplicate Protection:** Rejects duplicate items based on unique product IDs.
- **Side-by-Side Table Matrix:** Renders dynamic `<table>` comparison grid.
