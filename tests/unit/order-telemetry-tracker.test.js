import { describe, it, expect, beforeEach } from 'vitest';
const OrderTelemetryTracker = require('../../js/order-telemetry-tracker.js');

describe('OrderTelemetryTracker Unit Tests', () => {
  let tracker;

  beforeEach(() => {
    tracker = new OrderTelemetryTracker();
  });

  it('should reject invalid or empty order IDs', () => {
    const res = tracker.trackOrder('');
    expect(res.success).toBe(false);
  });

  it('should return valid telemetry data for order query', () => {
    const res = tracker.trackOrder('ORD-998822');
    expect(res.success).toBe(true);
    expect(res.orderId).toBe('ORD-998822');
    expect(res.carrier).toBeDefined();
    expect(res.trackingCode).toBeDefined();
    expect(res.progressPercent).toBeGreaterThanOrEqual(25);
  });

  it('should return milestone definitions', () => {
    const milestones = tracker.getMilestones();
    expect(milestones.length).toBe(4);
    expect(milestones[3].key).toBe('DELIVERED');
  });

  it('should calculate checkout telemetry duration in milliseconds', () => {
    const start = Date.now() - 5000;
    const duration = tracker.getCheckoutDurationMs(start);
    expect(duration).toBeGreaterThanOrEqual(5000);
  });

});
