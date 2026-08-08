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
});
