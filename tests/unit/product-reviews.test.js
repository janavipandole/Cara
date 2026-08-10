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
    expect(manager.sanitizeReviewAuthorName('Bob<script>x</script>')).toBe('Bobx');
    expect(manager.sanitizeReviewAuthorName('Tom & Jerry')).toBe('Tom  Jerry');
    expect(manager.sanitizeReviewAuthorName('"><img onerror=1')).toBe('img onerror=1');
  });

  it('should cap author name at 80 characters', () => {
    const longName = 'A'.repeat(100);
    expect(manager.sanitizeReviewAuthorName(longName).length).toBe(80);
  });

  it('should return empty string for non-string inputs', () => {
    expect(manager.sanitizeReviewAuthorName(null)).toBe('');
    expect(manager.sanitizeReviewAuthorName(undefined)).toBe('');
  });

  it('should skip corrupt ratings when computing the summary', () => {
    // Seed the store directly with a legacy corrupt rating.
    localStorage.setItem(
      'cara_test_reviews',
      JSON.stringify({
        'prod-x': [
          { id: 'r1', rating: 5, authorName: 'Alice' },
          { id: 'r2', rating: 'not-a-number', authorName: 'Bob' },
          { id: 'r3', rating: 3, authorName: 'Carol' },
        ],
      }),
    );
    const manager2 = new ProductReviewManager('cara_test_reviews');
    const summary = manager2.getProductRatingSummary('prod-x');
    expect(summary.totalReviews).toBe(3);
    expect(summary.averageRating).toBe(4.0);
    expect(summary.distribution[5]).toBe(1);
    expect(summary.distribution[3]).toBe(1);
    expect(Number.isNaN(summary.averageRating)).toBe(false);
  });

  it('stores the newest review first', () => {
    manager.addReview('prod-order', {
      authorName: 'Alice',
      authorEmail: 'alice@example.com',
      rating: 5,
      comment: 'First review, absolutely wonderful!',
    });
    manager.addReview('prod-order', {
      authorName: 'Bob',
      authorEmail: 'bob@example.com',
      rating: 4,
      comment: 'Second review, still pretty great!',
    });

    // Reviews are unshifted so the newest appears first.
    expect(manager.reviews['prod-order'][0].authorName).toBe('Bob');
    expect(manager.reviews['prod-order'][1].authorName).toBe('Alice');
  });
});
