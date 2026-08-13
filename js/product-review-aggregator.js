/**
 * Product Review Rating Aggregator
 * Handles review submission, star rating accumulation, sentiment scoring, and aggregated statistics.
 */

class ProductReviewAggregator {
  constructor(storageKey = 'cara_reviews_v2') {
    this.storageKey = storageKey;
    this.reviews = this.loadReviews();
  }

  loadReviews() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveReviews() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.reviews));
    } catch (e) {
      console.warn('Failed to save reviews:', e);
    }
  }

  submitReview(productId, review) {
    const { rating, title, body, author } = review;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return { success: false, message: 'Invalid review data. Rating must be between 1 and 5.' };
    }

    if (!this.reviews[productId]) {
      this.reviews[productId] = [];
    }

    const newReview = {
      id: `rev_${Date.now()}`,
      productId,
      rating: parseInt(rating, 10),
      title: (title || '').trim().slice(0, 80),
      body: (body || '').trim().slice(0, 500),
      author: (author || 'Anonymous').trim().slice(0, 40),
      date: new Date().toISOString(),
      helpful: 0
    };

    this.reviews[productId].push(newReview);
    this.saveReviews();
    return { success: true, review: newReview };
  }

  getStats(productId) {
    const productReviews = this.reviews[productId] || [];

    if (productReviews.length === 0) {
      return { count: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    // Filter out reviews with corrupt ratings before computing stats.
    const validReviews = productReviews.filter(
      (r) =>
        typeof r.rating === 'number' &&
        Number.isInteger(r.rating) &&
        r.rating >= 1 &&
        r.rating <= 5,
    );

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;

    validReviews.forEach((review) => {
      total += review.rating;
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });

    return {
      count: validReviews.length,
      average: validReviews.length > 0
        ? parseFloat((total / validReviews.length).toFixed(1))
        : 0,
      distribution
    };
  }

  getReviews(productId, { sortBy = 'date', limit = 20 } = {}) {
    const productReviews = [...(this.reviews[productId] || [])];

    if (sortBy === 'rating-desc') {
      productReviews.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'rating-asc') {
      productReviews.sort((a, b) => a.rating - b.rating);
    } else {
      productReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return productReviews.slice(0, limit);
  }

  markHelpful(productId, reviewId) {
    const productReviews = this.reviews[productId] || [];
    const review = productReviews.find((r) => r.id === reviewId);
    if (review) {
      review.helpful += 1;
      this.saveReviews();
      return { success: true, helpful: review.helpful };
    }
    return { success: false };
  }

  /**
   * Calculates the percentage distribution of star ratings (1-5) for a product.
   * @param {string} productId
   * @returns {Object} Map of star level (1-5) to percentage (0-100).
   */
  calculateReviewRatingBreakdown(productId) {
    const stats = this.getStats(productId);
    const total = stats.count;
    if (total === 0) {
      return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
    return {
      1: Math.round((stats.distribution[1] / total) * 100),
      2: Math.round((stats.distribution[2] / total) * 100),
      3: Math.round((stats.distribution[3] / total) * 100),
      4: Math.round((stats.distribution[4] / total) * 100),
      5: Math.round((stats.distribution[5] / total) * 100),
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductReviewAggregator;
} else {
  window.ProductReviewAggregator = ProductReviewAggregator;
}

window.getProductReviewAggregatorStatusHelper104 = function() {
  return {
    status: 'active',
    module: 'ProductReviewAggregator',
    helper: 'getProductReviewAggregatorStatusHelper104'
  };
};
