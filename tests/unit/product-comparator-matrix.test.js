import { describe, it, expect, beforeEach } from 'vitest';
import { ProductComparatorMatrix } from '../../js/product-comparator-matrix.js';

describe('ProductComparatorMatrix', () => {
  let comparator;

  beforeEach(() => {
    document.body.innerHTML = '<div id="comparator-matrix-container"></div>';
    comparator = new ProductComparatorMatrix(3);
  });

  it('should add products up to maximum limit', () => {
    expect(comparator.addProduct({ id: 'p1', name: 'Shirt 1', price: 20 })).toBe(true);
    expect(comparator.addProduct({ id: 'p2', name: 'Shirt 2', price: 30 })).toBe(true);
    expect(comparator.addProduct({ id: 'p3', name: 'Shirt 3', price: 40 })).toBe(true);
    expect(comparator.addProduct({ id: 'p4', name: 'Shirt 4', price: 50 })).toBe(false); // Max 3
  });

  it('should prevent adding duplicate products', () => {
    comparator.addProduct({ id: 'p1', name: 'Shirt 1' });
    expect(comparator.addProduct({ id: 'p1', name: 'Shirt 1' })).toBe(false);
  });

  it('should remove product from active comparison list', () => {
    comparator.addProduct({ id: 'p1', name: 'Shirt 1' });
    expect(comparator.removeProduct('p1')).toBe(true);
    expect(comparator.selectedProducts.length).toBe(0);
  });

  it('should generate structured spec comparison matrix', () => {
    comparator.addProduct({ id: 'p1', name: 'Shirt 1', price: 20, rating: 4.5 });
    comparator.addProduct({ id: 'p2', name: 'Shirt 2', price: 30, rating: 4.0 });

    const matrix = comparator.getComparisonMatrix();
    expect(matrix.fields.name).toEqual(['Shirt 1', 'Shirt 2']);
    expect(matrix.fields.price).toEqual([20, 30]);
  });


  it('should detect differing fields across products', () => {
    document.body.innerHTML = '<div id="comparator-matrix-container"></div>';
    const m = new ProductComparatorMatrix(4);
    m.addProduct({ id: 'p1', name: 'Shirt', brand: 'A', price: 20, rating: 4.0, category: 'tops', color: 'red' });
    m.addProduct({ id: 'p2', name: 'Shirt', brand: 'A', price: 30, rating: 4.0, category: 'tops', color: 'blue' });
    const diffs = m.highlightMatrixDifferences();
    expect(diffs).toContain('price');
    expect(diffs).toContain('color');
    expect(diffs).not.toContain('name');
    expect(diffs).not.toContain('brand');
  });

  it('should return empty array when products are identical', () => {
    document.body.innerHTML = '<div id="comparator-matrix-container"></div>';
    const m = new ProductComparatorMatrix(4);
    m.addProduct({ id: 'p1', name: 'Shirt', brand: 'A', price: 20, rating: 4.0, category: 'tops', color: 'red' });
    m.addProduct({ id: 'p2', name: 'Shirt', brand: 'A', price: 20, rating: 4.0, category: 'tops', color: 'red' });
    const diffs = m.highlightMatrixDifferences();
    expect(diffs).toEqual([]);
  });

});
