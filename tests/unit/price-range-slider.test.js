import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  clampMin,
  clampMax,
  getFillPercent,
  initPriceRangeSlider,
} from '../../js/price-range-slider.js';

describe('js/price-range-slider.js — pure helpers', () => {
  it('formats a price with the rupee symbol and Indian grouping', () => {
    expect(formatPrice(0)).toBe('₹0');
    expect(formatPrice(7000)).toBe('₹7,000');
    expect(formatPrice(1234567)).toBe('₹12,34,567');
  });

  it('clamps the min handle so it never exceeds the max handle', () => {
    expect(clampMin(2000, 5000)).toBe(2000);
    expect(clampMin(6000, 5000)).toBe(5000);
  });

  it('clamps the max handle so it never falls below the min handle', () => {
    expect(clampMax(5000, 2000)).toBe(5000);
    expect(clampMax(1000, 2000)).toBe(2000);
  });

  it('computes 0/0 fill offsets for the full range', () => {
    expect(getFillPercent(0, 7000, 0, 7000)).toEqual({ left: 0, right: 0 });
  });

  it('computes proportional fill offsets for a mid-range selection', () => {
    const { left, right } = getFillPercent(1750, 5250, 0, 7000);
    expect(left).toBeCloseTo(25);
    expect(right).toBeCloseTo(25);
  });

  it('does not divide by zero when slider min equals slider max', () => {
    expect(() => getFillPercent(0, 0, 5, 5)).not.toThrow();
  });
});

describe('js/price-range-slider.js — DOM wiring', () => {
  function setupDom() {
    document.body.innerHTML = `
      <div id="price-slider-range"></div>
      <input type="range" id="price-min-input" min="0" max="7000" value="0" />
      <input type="range" id="price-max-input" min="0" max="7000" value="7000" />
      <span id="price-min-value"></span>
      <span id="price-max-value"></span>
    `;
  }

  it('renders initial labels and fill on init', () => {
    setupDom();
    initPriceRangeSlider();

    expect(document.getElementById('price-min-value').textContent).toBe('₹0');
    expect(document.getElementById('price-max-value').textContent).toBe(
      '₹7,000',
    );
    expect(document.getElementById('price-slider-range').style.left).toBe('0%');
  });

  it('swaps dragged values back into order and updates labels on input', () => {
    setupDom();
    initPriceRangeSlider();

    const minInput = document.getElementById('price-min-input');
    minInput.value = '8000'; // dragged past the max handle
    minInput.dispatchEvent(new Event('input'));

    const maxInput = document.getElementById('price-max-input');
    expect(Number(minInput.value)).toBe(Number(maxInput.value));
    expect(document.getElementById('price-min-value').textContent).toBe(
      formatPrice(Number(maxInput.value)),
    );
  });

  it('is a no-op when the slider markup is missing from the page', () => {
    document.body.innerHTML = '';
    expect(() => initPriceRangeSlider()).not.toThrow();
  });
});
