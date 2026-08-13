import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('DynamicPricing Unit Tests', () => {
  let DynamicPricing;
  let calculateVolumeDiscount;
  let renderVolumePricingTable;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="test-table"></div>';
    const module = await import('../../js/dynamic-pricing.js');
    const exports = module.default || window.DynamicPricing;
    DynamicPricing = exports;
    calculateVolumeDiscount = exports.calculateVolumeDiscount;
    renderVolumePricingTable = exports.renderVolumePricingTable;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calculates 0% discount for quantity 1 or 2', () => {
    const res = calculateVolumeDiscount(2, 100);
    expect(res.discountPct).toBe(0);
    expect(res.unitPrice).toBe(100);
    expect(res.totalPrice).toBe(200);
    expect(res.savings).toBe(0);
  });

  it('applies 10% volume discount for quantity >= 3', () => {
    const res = calculateVolumeDiscount(3, 100);
    expect(res.discountPct).toBe(10);
    expect(res.unitPrice).toBe(90);
    expect(res.totalPrice).toBe(270);
    expect(res.savings).toBe(30);
  });

  it('applies 15% volume discount for quantity >= 5', () => {
    const res = calculateVolumeDiscount(5, 100);
    expect(res.discountPct).toBe(15);
    expect(res.unitPrice).toBe(85);
    expect(res.totalPrice).toBe(425);
    expect(res.savings).toBe(75);
  });

  it('applies 20% volume discount for quantity >= 10', () => {
    const res = calculateVolumeDiscount(10, 100);
    expect(res.discountPct).toBe(20);
    expect(res.unitPrice).toBe(80);
    expect(res.totalPrice).toBe(800);
    expect(res.savings).toBe(200);
  });

  it('renders volume pricing table inside target container', () => {
    renderVolumePricingTable('#test-table', 150.0);
    const container = document.querySelector('#test-table');

    expect(container.children.length).toBeGreaterThan(0);
    expect(container.textContent).toContain('Bulk Quantity Savings');
    expect(container.textContent).toContain('20% OFF');
  });
});
