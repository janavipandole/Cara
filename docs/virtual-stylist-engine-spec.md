# Virtual Stylist & Outfit Recommendation Specification

## Overview
The `VirtualStylistEngine` component evaluates color harmony rules and apparel category relationships to compute compatibility scores for user top and bottom selections, delivering personalized outfit recommendations.

## Color Harmony Rules
- **Blue Top:** Pairs with White, Grey, Black, Beige.
- **Black Top:** Pairs with White, Red, Grey, Blue, Yellow.
- **White Top:** Universal complement across dark and neutral hues.

## Scoring Matrix
- Base Score: 50 points
- Category Match (Shirt/T-Shirt + Jeans/Pants): +30 points
- Color Palette Harmony: +20 points
