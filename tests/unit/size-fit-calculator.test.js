import { describe, it, expect } from 'vitest';
import { SizeFitCalculator } from '../../js/size-fit-calculator.js';

describe('SizeFitCalculator', () => {
  const calc = new SizeFitCalculator();

  it('recommends correct size for standard measurements', () => {
    expect(calc.recommendSize(88, 70)).toBe('S');
    expect(calc.recommendSize(95, 76)).toBe('M');
  });

  it('adjusts size recommendation for fit preference', () => {
    expect(calc.recommendSize(95, 76, 'slim')).toBe('S');
    expect(calc.recommendSize(95, 76, 'loose')).toBe('L');
  });

  it('returns a default size for invalid chest measurements', () => {
    expect(calc.recommendSize(0, 70)).toBe('M');
    expect(calc.recommendSize(-5, 70)).toBe('M');
    expect(calc.recommendSize(NaN, 70)).toBe('M');
  });

  it('caps at XXL for chest measurements above the chart', () => {
    expect(calc.recommendSize(150, 100)).toBe('XXL');
    expect(calc.recommendSize(150, 100, 'loose')).toBe('XXL');
  });

  it('keeps slim adjustment within the size chart bounds', () => {
    // XS is the smallest size; slim must not go below it.
    expect(calc.recommendSize(80, 60, 'slim')).toBe('XS');
  });

  it('returns the same size for an unknown fit preference', () => {
    expect(calc.recommendSize(95, 76, 'athletic')).toBe('M');
  });

  it('gets adjacent sizes within the chart bounds', () => {
    expect(calc.getAdjacentSize('M', -1)).toBe('S');
    expect(calc.getAdjacentSize('M', 1)).toBe('L');
    expect(calc.getAdjacentSize('XS', -1)).toBe('XS');
    expect(calc.getAdjacentSize('XXL', 1)).toBe('XXL');
    expect(calc.getAdjacentSize('UNKNOWN', 1)).toBe('UNKNOWN');
  });
});
