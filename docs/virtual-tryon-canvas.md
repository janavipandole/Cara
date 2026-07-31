# Virtual Try-On Canvas Engine Specification

## Overview
`VirtualTryOnEngine` manages HTML5 Canvas overlay operations for virtual garment fitting, rotation, scaling transformations (clamped 0.2x – 3.0x), and image export.

## API Usage
```javascript
const tryOnEngine = new VirtualTryOnEngine(canvasEl);

tryOnEngine.updateTransform({ scale: 1.2, rotation: 15, offsetX: 5, offsetY: -10 });
tryOnEngine.render();
const imageURI = tryOnEngine.exportDataURL();
```

## Unit Test Coverage
Tested via Vitest in `tests/unit/virtual-tryon-engine.test.js`.
