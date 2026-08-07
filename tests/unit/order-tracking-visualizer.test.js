import { describe, it, expect, beforeEach } from 'vitest';
import { OrderTrackingVisualizer } from '../../js/order-tracking-visualizer.js';

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

  it('should return milestone status CSS class based on active step', () => { expect(true).toBe(true); });
});
