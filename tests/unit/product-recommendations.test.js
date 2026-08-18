import { describe, expect, it } from 'vitest';
import {
  getRecommendedProducts,
  scoreProduct,
} from '../../js/product-recommendations.js';

function product(overrides = {}) {
  return {
    id: 1,
    name: 'Current Tee',
    brand: 'Cara',
    category: 'street',
    color: 'blue',
    price: 100,
    image: 'images/products/f1.jpg',
    ...overrides,
  };
}

describe('product recommendations', () => {
  it('scores same-category products with color and price bonuses', () => {
    const scored = scoreProduct(
      product({ id: 2, name: 'Blue Match', color: 'blue', price: 102 }),
      product(),
    );

    expect(scored).toMatchObject({
      id: 2,
      name: 'Blue Match',
      score: 3,
    });
  });

  it('filters to the current category, excludes the current product, and sorts by score then price distance', () => {
    const current = product();
    const recommendations = getRecommendedProducts(
      [
        current,
        product({ id: 2, name: 'Blue Close', color: 'blue', price: 102 }),
        product({ id: 3, name: 'Blue Far', color: 'blue', price: 118 }),
        product({ id: 4, name: 'Red Match', color: 'red', price: 102 }),
        product({
          id: 5,
          name: 'Other Category',
          category: 'minimal',
          color: 'blue',
          price: 102,
        }),
      ],
      current,
    );

    expect(recommendations.map((item) => item.name)).toEqual([
      'Blue Close',
      'Blue Far',
      'Red Match',
    ]);
    expect(recommendations[0].score).toBe(3);
    expect(recommendations[1].score).toBe(3);
    expect(recommendations[2].score).toBe(1);
  });

  it('returns however many recommendations are available when fewer than the limit exist', () => {
    const current = product();
    const recommendations = getRecommendedProducts(
      [
        current,
        product({ id: 2, name: 'Blue Match', color: 'blue', price: 102 }),
        product({ id: 3, name: 'Red Match', color: 'red', price: 102 }),
        product({
          id: 4,
          name: 'Wrong Category',
          category: 'formal',
          color: 'blue',
          price: 102,
        }),
      ],
      current,
      4,
    );

    expect(recommendations).toHaveLength(2);
    expect(recommendations.map((item) => item.name)).toEqual([
      'Blue Match',
      'Red Match',
    ]);
  });
});
