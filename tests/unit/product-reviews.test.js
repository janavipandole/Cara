import { describe, it, expect, beforeEach } from 'vitest';
import { ProductReviewManager } from '../../js/product-reviews.js';

describe('ProductReviewManager Unit Tests', () => {
  let manager;

  beforeEach(() => {
    localStorage.clear();
    manager = new ProductReviewManager('cara_test_reviews');
  });

  it('should validate review inputs correctly', () => {
    const valid = manager.validateReviewData({
      authorName: 'John Doe',
      authorEmail: 'john@example.com',
      rating: 5,
      comment: 'Great product, highly recommend it!',
    });
    expect(valid.isValid).toBe(true);
    expect(valid.errors).toHaveLength(0);

    const invalid = manager.validateReviewData({
      authorName: 'A',
      authorEmail: 'bademail',
      rating: 6,
      comment: 'Short',
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThan(0);
  });

  it('should add valid review and compute average ratings correctly', () => {
    const res1 = manager.addReview('prod-1', {
      authorName: 'Alice',
      authorEmail: 'alice@example.com',
      rating: 5,
      comment: 'Absolutely amazing product quality!',
    });
    expect(res1.success).toBe(true);

    const res2 = manager.addReview('prod-1', {
      authorName: 'Bob',
      authorEmail: 'bob@example.com',
      rating: 3,
      comment: 'Decent quality, average delivery speed.',
    });
    expect(res2.success).toBe(true);

    const summary = manager.getProductRatingSummary('prod-1');
    expect(summary.totalReviews).toBe(2);
    expect(summary.averageRating).toBe(4.0);
    expect(summary.distribution[5]).toBe(1);
    expect(summary.distribution[3]).toBe(1);
  });

  it('should sanitize review author names by stripping HTML and XSS chars', () => {
    // Tags are stripped, leaving content between them
    expect(manager.sanitizeReviewAuthorName('<b>Alice</b>')).toBe('Alice');
    expect(manager.sanitizeReviewAuthorName('Bob<script>x</script>')).toBe(
      'Bobx',
    );
    expect(manager.sanitizeReviewAuthorName('Tom & Jerry')).toBe('Tom  Jerry');
    expect(manager.sanitizeReviewAuthorName('"><img onerror=1')).toBe(
      'img onerror=1',
    );
  });

  it('should cap author name at 80 characters', () => {
    const longName = 'A'.repeat(100);
    expect(manager.sanitizeReviewAuthorName(longName).length).toBe(80);
  });

  it('should return empty string for non-string inputs', () => {
    expect(manager.sanitizeReviewAuthorName(null)).toBe('');
    expect(manager.sanitizeReviewAuthorName(undefined)).toBe('');
  });
});
