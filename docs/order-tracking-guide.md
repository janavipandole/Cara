# Order Telemetry Tracker Architecture

## Overview
`OrderTelemetryTracker` processes shipment tracking queries, calculates delivery milestone completion percentages (25%, 50%, 75%, 100%), resolves mock carrier assignments (FedEx/DHL), and calculates estimated arrival dates.

## API Methods
```javascript
const tracker = new OrderTelemetryTracker();
const result = tracker.trackOrder('ORD-123456');

// result schema:
// { success: true, orderId: 'ORD-123456', status: 'IN_TRANSIT', progressPercent: 75, carrier: 'FedEx Express', estimatedDelivery: '2026-08-04' }
```

## Unit Test Coverage
Tested via Vitest in `tests/unit/order-telemetry-tracker.test.js`.
