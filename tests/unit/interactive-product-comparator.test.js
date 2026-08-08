import { describe, it, expect, beforeEach } from 'vitest';
import { canAddMoreComparatorItems } from '../../js/interactive-product-comparator.js';
const InteractiveProductComparator = require('../../js/interactive-product-comparator.js');

describe('InteractiveProductComparator Unit Tests', () => {
  let comparator;

  beforeEach(() => {
    localStorage.clear();
    comparator = new InteractiveProductComparator();
  });

  it('should add items up to max capacity', () => {
    const res1 = comparator.addItem({ id: 101, name: 'Shirt A', price: 25 });
    expect(res1.success).toBe(true);
    expect(comparator.items.length).toBe(1);

    comparator.addItem({ id: 102, name: 'Shirt B', price: 35 });
    comparator.addItem({ id: 103, name: 'Shirt C', price: 45 });
    comparator.addItem({ id: 104, name: 'Shirt D', price: 55 });
    
    const resOver = comparator.addItem({ id: 105, name: 'Shirt E', price: 65 });
    expect(resOver.success).toBe(false);
    expect(resOver.reason).toContain('Maximum');
  });

  it('should prevent duplicate items', () => {
    comparator.addItem({ id: 201, name: 'Hoodie' });
    const dup = comparator.addItem({ id: 201, name: 'Hoodie' });
    expect(dup.success).toBe(false);
  });

  it('should remove items and clear matrix', () => {
    comparator.addItem({ id: 301, name: 'Shoes' });
    comparator.removeItem(301);
    expect(comparator.items.length).toBe(0);
  });

  it('should identify attribute differences between items', () => {
    comparator.addItem({ id: 401, name: 'Item 1', price: 20, brand: 'Nike' });
    comparator.addItem({ id: 402, name: 'Item 2', price: 30, brand: 'Nike' });
    const diffs = comparator.getDifferences();
    expect(diffs).toContain('price');
    expect(diffs).not.toContain('brand');
  });

  it('should check if additional items can be added to product comparator', () => {
    expect(canAddMoreComparatorItems(0)).toBe(true);
    expect(canAddMoreComparatorItems(3)).toBe(true);
    expect(canAddMoreComparatorItems(4)).toBe(false);
    expect(canAddMoreComparatorItems(5)).toBe(false);
  });
});

describe('canAddMoreComparatorItems', () => {
  it('is exported as a callable function', () => {
    expect(typeof canAddMoreComparatorItems).toBe('function');
  });

  it('returns false for non-number counts', () => {
    expect(canAddMoreComparatorItems('2')).toBe(false);
    expect(canAddMoreComparatorItems(null)).toBe(false);
    expect(canAddMoreComparatorItems(undefined)).toBe(false);
  });

  it('respects a custom maximum slot count', () => {
    expect(canAddMoreComparatorItems(2, 3)).toBe(true);
    expect(canAddMoreComparatorItems(3, 3)).toBe(false);
  });
});
