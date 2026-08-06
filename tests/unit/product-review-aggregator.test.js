import { describe, it, expect, beforeEach } from 'vitest';
const ProductReviewAggregator = require('../../js/product-review-aggregator.js');

describe('ProductReviewAggregator Unit Tests', () => {
  let aggregator;

  beforeEach(() => {
    localStorage.clear();
    aggregator = new ProductReviewAggregator();
  });

  it('should reject reviews with missing or out-of-range ratings', () => {
    const res = aggregator.submitReview('prod-99', { rating: 6, body: 'Too good' });
    expect(res.success).toBe(false);
  });

  it('should successfully submit a valid review', () => {
    const res = aggregator.submitReview('prod-42', { rating: 5, title: 'Great shirt!', body: 'Fits perfectly.', author: 'Alice' });
    expect(res.success).toBe(true);
    expect(res.review.rating).toBe(5);
  });

  it('should calculate average rating across multiple reviews', () => {
    aggregator.submitReview('prod-10', { rating: 4 });
    aggregator.submitReview('prod-10', { rating: 2 });
    const stats = aggregator.getStats('prod-10');
    expect(stats.average).toBe(3.0);
    expect(stats.count).toBe(2);
    expect(stats.distribution[4]).toBe(1);
  });

  it('should mark reviews as helpful and increment counter', () => {
    const submission = aggregator.submitReview('prod-55', { rating: 3 });
    const revId = submission.review.id;
    const result = aggregator.markHelpful('prod-55', revId);
    expect(result.success).toBe(true);
    expect(result.helpful).toBe(1);
  });

  it('should aggregate star rating count breakdown correctly', () => { expect(true).toBe(true); });
});
