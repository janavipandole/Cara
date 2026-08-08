import { describe, it, expect, beforeEach } from 'vitest';
import { getTrackingStepStatusClass } from '../../js/order-tracking-visualizer.js';
import { OrderTrackingVisualizer } from '../../js/order-tracking-visualizer.js';
import { getTrackingStepStatusClass } from '../../js/order-tracking-visualizer.js';

describe('OrderTrackingVisualizer', () => {
  let visualizer;

  beforeEach(() => {
    document.body.innerHTML = '<div id="tracking-timeline-container"></div>';
    visualizer = new OrderTrackingVisualizer();
  });

  it('should resolve correct stage index for status strings', () => {
    expect(visualizer.getStageIndex('Order Placed')).toBe(0);
    expect(visualizer.getStageIndex('Order Shipped')).toBe(2);
    expect(visualizer.getStageIndex('Delivered')).toBe(4);
  });

  it('should compute progress percentage based on current milestone stage', () => {
    expect(visualizer.calculateProgressPercent('Order Placed')).toBe(0);
    expect(visualizer.calculateProgressPercent('Shipped')).toBe(50);
    expect(visualizer.calculateProgressPercent('Delivered')).toBe(100);
  });

  it('should render timeline nodes inside container element', () => {
    const el = visualizer.renderTimeline('tracking-timeline-container', 'Shipped');
    expect(el).not.toBeNull();
    expect(document.querySelectorAll('.timeline-node.completed').length).toBe(3);
  });

  it('should map out-for-delivery and unknown statuses to stages', () => {
    expect(visualizer.getStageIndex('Out for Delivery')).toBe(3);
    expect(visualizer.getStageIndex('Processing')).toBe(1);
    expect(visualizer.getStageIndex('unknown-status')).toBe(0);
    expect(visualizer.getStageIndex('')).toBe(0);
  });

  it('should compute 75 percent for the out-for-delivery stage', () => {
    expect(visualizer.calculateProgressPercent('Out for Delivery')).toBe(75);
    expect(visualizer.calculateProgressPercent('Processing')).toBe(25);
  });

  it('should mark the current stage node as current', () => {
    visualizer.renderTimeline('tracking-timeline-container', 'Processing');
    const currentNodes = document.querySelectorAll('.timeline-node.current');
    expect(currentNodes.length).toBe(1);
    expect(currentNodes[0].getAttribute('aria-current')).toBe('step');
    expect(currentNodes[0].textContent).toContain('Processing');
  });

  it('should return null when the container is missing', () => {
    expect(visualizer.renderTimeline('does-not-exist', 'Shipped')).toBeNull();
  });
});

describe('getTrackingStepStatusClass', () => {
  it('is exported as a callable function', () => {
    expect(typeof getTrackingStepStatusClass).toBe('function');
  });
});
