# Outfit Compatibility Recommendation Engine Specification

## Overview
`OutfitCompatibilityEngine` calculates compatibility match percentages between tops and bottoms based on color harmony matrices (e.g. white + denim, black + red) and style tag alignment.

## Output Schema
```javascript
const engine = new OutfitCompatibilityEngine();
const result = engine.evaluatePair(
  { color: 'white', style: 'casual' },
  { color: 'black', style: 'casual' }
);
// { score: 100, rating: 'Perfect Match', feedback: 'Color harmony between white and black scored 100%.' }
```

## Unit Test Coverage
Tested via Vitest in `tests/unit/outfit-compatibility-engine.test.js`.
