# Wishlist Shareable Link & Data Export Specification

## Overview
The `WishlistExportShare` module enables users to share their curated product wishlists via URL query parameters and export saved products into structured CSV files for offline access.

## Features
- **URL Hash Encoding:** Encodes item IDs, product names, and pricing into URL-safe base64 strings (`#wishlist=...`).
- **CSV Data Export:** Converts active wishlist JSON arrays into downloadable CSV files.
