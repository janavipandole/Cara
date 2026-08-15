/**
 * Interactive Product Review & Rating Component with Local Validation
 * Handles rating validation, form submission, average calculation, and local storage persistence (#3709).
 */

export class ProductReviewManager {
  constructor(storageKey = 'cara_product_reviews') {
    this.storageKey = storageKey;
    this.reviews = this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof localStorage === 'undefined') return {};
    try {
      const data = localStorage.getItem(this.storageKey);
      const parsed = data ? JSON.parse(data) : {};
      // Guard: ensure parsed data is a valid non-null object before returning
      return parsed !== null && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      console.warn('[ProductReviewManager] Failed to parse reviews from localStorage:', err);
      return {};
    }
  }

  saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.reviews));
    } catch (e) {
      console.warn('Failed to persist reviews:', e);
    }
  }

  validateReviewData({ authorName, authorEmail, rating, comment }) {
    const errors = [];

    const nameStr = typeof authorName === 'string' ? authorName : '';
    if (!nameStr || nameStr.trim().length < 2) {
      errors.push('Name must be at least 2 characters.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailStr = typeof authorEmail === 'string' ? authorEmail : '';
    if (!emailStr || !emailRegex.test(emailStr.trim())) {
      errors.push('Please enter a valid email address.');
    }

    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      errors.push('Rating must be an integer between 1 and 5.');
    }

    if (!comment || comment.trim().length < 10) {
      errors.push('Review comment must be at least 10 characters long.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  addReview(productId, reviewData) {
    const validation = this.validateReviewData(reviewData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    if (!this.reviews[productId]) {
      this.reviews[productId] = [];
    }

    const newReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productId,
      authorName: reviewData.authorName.trim(),
      authorEmail: reviewData.authorEmail.trim(),
      rating: Number(reviewData.rating),
      comment: reviewData.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    this.reviews[productId].unshift(newReview);
    this.saveToStorage();

    return { success: true, review: newReview };
  }

  getProductRatingSummary(productId) {
    const productReviews = this.reviews[productId] || [];
    if (productReviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    let ratedCount = 0;

    productReviews.forEach((rev) => {
      const raw = Number(rev.rating);
      if (!Number.isFinite(raw)) return; // Skip corrupt legacy entries
      const r = Math.min(5, Math.max(1, raw));
      distribution[Math.round(r)] = (distribution[Math.round(r)] || 0) + 1;
      sum += r;
      ratedCount += 1;
    });

    const averageRating =
      ratedCount > 0 ? parseFloat((sum / ratedCount).toFixed(1)) : 0;

    return {
      totalReviews: productReviews.length,
      averageRating,
      distribution,
    };
  }

  /**
   * Strips HTML tags and dangerous characters from a review author name.
   * @param {string} name
   * @returns {string}
   */
  sanitizeReviewAuthorName(name) {
    if (typeof name !== 'string') return '';
    return name
      .replace(/<[^>]*>/g, '')   // Remove HTML tags
      .replace(/[<>"'&]/g, '')     // Remove XSS characters
      .trim()
      .slice(0, 80);               // Cap at 80 chars
  }

}

window.getProductReviewsStatusHelper101 = function() {
  return {
    status: 'active',
    module: 'ProductReviews',
    helper: 'getProductReviewsStatusHelper101'
  };
};
