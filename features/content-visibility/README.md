# Enhancement: Implement "CSS Content-Visibility" for Performance

This feature implements the CSS `content-visibility: auto` property with `contain-intrinsic-size` on all major below-the-fold containers across the Cara storefront.

## What it does

- **Skips rendering** (layout, style, paint) for off-screen sections until they approach the viewport
- Effectively reduces the browser's initial rendering work from thousands of DOM nodes to just the visible ones
- Yields significant Time to Interactive (TTI) improvements, especially on lower-end mobile devices

## Targeted sections

| Section | Selector | Est. Size |
|---------|----------|-----------|
| Footer | `footer` | 600px |
| Product grids | `#product1 .pro-container`, `#product2` | 800px |
| Banner | `#banner` | 400px |
| Banner row | `#banner3` | 500px |
| Small banners | `#sm-banner` | 500px |
| Newsletter | `#newsletter` | 250px |
| Blog | `#blog` | 500px |
| Reviews | `.reviews-section` | 400px |
| Recently viewed | `#recently-viewed-section` | 350px |
| Testimonials | `#about-testimonials` | 500px |

## Files modified

- `style.css` — Main product grids, banners, footer, newsletter, blog
- `reviews.css` — Reviews section
- `recently-viewed.css` — Recently viewed products
- `about.css` — About page testimonials

## Browser support

`content-visibility: auto` is supported in Chrome 85+, Edge 85+, and Firefox 125+. Browsers that don't support it simply ignore the property with no adverse effects.