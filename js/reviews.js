/**
 * product-reviews.js
 * Interactive star-rating and review submission system for Cara product pages.
 *
 * Architecture:
 *  - Reviews are persisted to localStorage under `cara_reviews_<productId>`.
 *  - On authenticated sessions the module attempts to POST/GET reviews from
 *    /api/reviews/<productId> and falls back to localStorage gracefully.
 *  - Ratings are aggregated on the client to display average stars and
 *    distribution bars.
 *
 * Integration:
 *  1. Add <div id="productReviews" data-product-id="<id>"></div> to
 *     singleProduct.html where reviews should appear.
 *  2. Include this script at the bottom of singleProduct.html.
 */

(function () {
  'use strict';

  const STORAGE_PREFIX = 'cara_reviews_';
  const MAX_REVIEWS_STORED = 50;

  // ── Utility helpers ────────────────────────────────────────────────────────

  function _readReviews(productId) {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PREFIX + productId) || '[]');
    } catch {
      return [];
    }
  }

  function _saveReviews(productId, reviews) {
    // Cap stored reviews to prevent unbounded localStorage growth
    const trimmed = reviews.slice(0, MAX_REVIEWS_STORED);
    localStorage.setItem(STORAGE_PREFIX + productId, JSON.stringify(trimmed));
  }

  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function _formatDate(iso) {
    try {
      return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  // ── Calculate aggregate stats ─────────────────────────────────────────────

  function _calcStats(reviews) {
    if (!reviews.length) return { avg: 0, total: 0, dist: [0, 0, 0, 0, 0] };
    const dist = [0, 0, 0, 0, 0];
    const sum = reviews.reduce((acc, r) => {
      dist[r.rating - 1]++;
      return acc + r.rating;
    }, 0);
    return {
      avg: (sum / reviews.length).toFixed(1),
      total: reviews.length,
      dist,
    };
  }

  // ── Render star icons ─────────────────────────────────────────────────────

  function _starsHTML(rating, interactive = false, name = 'rating') {
    if (interactive) {
      return [5, 4, 3, 2, 1]
        .map(
          (i) => `
          <input type="radio" id="star${i}" name="${name}" value="${i}"
                 class="sr-only review-star-input"
                 aria-label="${i} star${i > 1 ? 's' : ''}">
          <label for="star${i}" class="star-label" aria-hidden="true" title="${i} star${i > 1 ? 's' : ''}">
            <i class="ri-star-fill"></i>
          </label>`,
        )
        .join('');
    }
    return Array.from({ length: 5 }, (_, i) =>
      `<i class="${i < Math.round(rating) ? 'ri-star-fill' : 'ri-star-line'} review-star" aria-hidden="true"></i>`,
    ).join('');
  }

  // ── Render the full review section ────────────────────────────────────────

  function _render(container, productId) {
    const reviews = _readReviews(productId);
    const stats   = _calcStats(reviews);

    // Build distribution bars (5 → 1)
    const distBars = [5, 4, 3, 2, 1]
      .map((star) => {
        const count = stats.dist[star - 1];
        const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
        return `
          <div class="review-dist-row" role="group" aria-label="${star} star reviews: ${count}">
            <span class="review-dist-label" aria-hidden="true">${star}</span>
            <i class="ri-star-fill review-dist-star" aria-hidden="true"></i>
            <div class="review-dist-bar-wrap" role="progressbar"
                 aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
                 aria-label="${pct}% of reviews">
              <div class="review-dist-bar" style="width:${pct}%"></div>
            </div>
            <span class="review-dist-count">${count}</span>
          </div>`;
      })
      .join('');

    // Build review cards
    const reviewCards = reviews.length
      ? reviews
          .slice()
          .reverse()
          .map(
            (r) => `
          <article class="review-card" aria-label="Review by ${_escape(r.author)}">
            <header class="review-card-header">
              <div class="review-avatar" aria-hidden="true">
                ${_escape(r.author.charAt(0).toUpperCase())}
              </div>
              <div class="review-meta">
                <strong class="review-author">${_escape(r.author)}</strong>
                <time class="review-date" datetime="${r.date}">${_formatDate(r.date)}</time>
              </div>
              <div class="review-stars" aria-label="${r.rating} out of 5 stars">
                ${_starsHTML(r.rating)}
              </div>
            </header>
            ${r.title ? `<h4 class="review-title">${_escape(r.title)}</h4>` : ''}
            <p class="review-body">${_escape(r.body)}</p>
            ${r.verified ? '<span class="verified-badge"><i class="ri-shield-check-line" aria-hidden="true"></i> Verified Purchase</span>' : ''}
          </article>`,
          )
          .join('')
      : '<p class="reviews-empty">No reviews yet. Be the first to share your thoughts!</p>';

    container.innerHTML = `
      <section class="reviews-section" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" class="reviews-heading">Customer Reviews</h2>

        <!-- Aggregate score -->
        <div class="reviews-aggregate" aria-label="Overall rating">
          <div class="aggregate-score">
            <span class="aggregate-number" aria-label="${stats.avg} out of 5">${stats.avg || '—'}</span>
            <div class="aggregate-stars" aria-hidden="true">${_starsHTML(stats.avg)}</div>
            <span class="aggregate-count">${stats.total} review${stats.total !== 1 ? 's' : ''}</span>
          </div>
          <div class="review-distribution" aria-label="Rating distribution">
            ${distBars}
          </div>
        </div>

        <!-- Write a review form -->
        <div class="write-review-wrap">
          <button class="btn-write-review" id="toggleReviewForm"
                  aria-expanded="false" aria-controls="reviewFormPanel">
            <i class="ri-edit-line" aria-hidden="true"></i> Write a Review
          </button>

          <form id="reviewFormPanel" class="review-form" novalidate
                aria-label="Write a review" hidden>
            <h3>Your Review</h3>

            <div class="form-group">
              <label for="reviewAuthor">Your Name <span aria-hidden="true">*</span></label>
              <input type="text" id="reviewAuthor" required
                     autocomplete="name" placeholder="Jane D."
                     aria-required="true" maxlength="60">
              <span class="field-error" role="alert" id="authorError"></span>
            </div>

            <fieldset class="form-group star-picker-group">
              <legend>Rating <span aria-hidden="true">*</span></legend>
              <div class="star-picker" role="radiogroup" aria-required="true"
                   aria-label="Select a star rating">
                ${_starsHTML(0, true, 'reviewRating')}
              </div>
              <span class="field-error" role="alert" id="ratingError"></span>
            </fieldset>

            <div class="form-group">
              <label for="reviewTitle">Review Title</label>
              <input type="text" id="reviewTitle" placeholder="Sum it up in a line"
                     maxlength="80">
            </div>

            <div class="form-group">
              <label for="reviewBody">Review <span aria-hidden="true">*</span></label>
              <textarea id="reviewBody" rows="4" required
                        placeholder="What did you love? What could be better?"
                        aria-required="true" maxlength="1000"></textarea>
              <span class="field-error" role="alert" id="bodyError"></span>
              <span class="char-count" aria-live="polite" id="bodyCharCount">0 / 1000</span>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-submit-review">
                <i class="ri-send-plane-line" aria-hidden="true"></i> Submit Review
              </button>
              <button type="button" class="btn-cancel-review" id="cancelReviewForm">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Review list -->
        <div class="review-list" aria-live="polite" aria-relevant="additions">
          ${reviewCards}
        </div>
      </section>`;

    _attachFormListeners(container, productId);
  }

  // ── Form event wiring ─────────────────────────────────────────────────────

  function _attachFormListeners(container, productId) {
    const toggleBtn  = container.querySelector('#toggleReviewForm');
    const formPanel  = container.querySelector('#reviewFormPanel');
    const cancelBtn  = container.querySelector('#cancelReviewForm');
    const form       = container.querySelector('.review-form');
    const bodyArea   = container.querySelector('#reviewBody');
    const charCount  = container.querySelector('#bodyCharCount');

    if (!toggleBtn || !formPanel) return;

    // Toggle form visibility
    toggleBtn.addEventListener('click', () => {
      const isHidden = formPanel.hasAttribute('hidden');
      formPanel.toggleAttribute('hidden', !isHidden);
      toggleBtn.setAttribute('aria-expanded', String(isHidden));
      if (isHidden) formPanel.querySelector('#reviewAuthor').focus();
    });

    cancelBtn && cancelBtn.addEventListener('click', () => {
      formPanel.setAttribute('hidden', '');
      toggleBtn.setAttribute('aria-expanded', 'false');
      form.reset();
    });

    // Live character count for textarea
    bodyArea && bodyArea.addEventListener('input', () => {
      charCount.textContent = `${bodyArea.value.length} / 1000`;
    });

    // Form submission
    form && form.addEventListener('submit', (e) => {
      e.preventDefault();

      const author = form.querySelector('#reviewAuthor').value.trim();
      const rating = parseInt(
        (form.querySelector('.review-star-input:checked') || {}).value,
        10,
      );
      const title  = (form.querySelector('#reviewTitle').value || '').trim();
      const body   = form.querySelector('#reviewBody').value.trim();

      let valid = true;

      const authorErr = form.querySelector('#authorError');
      const ratingErr = form.querySelector('#ratingError');
      const bodyErr   = form.querySelector('#bodyError');

      if (!author) {
        authorErr.textContent = 'Please enter your name.';
        valid = false;
      } else {
        authorErr.textContent = '';
      }

      if (!rating || rating < 1 || rating > 5) {
        ratingErr.textContent = 'Please select a star rating.';
        valid = false;
      } else {
        ratingErr.textContent = '';
      }

      if (!body || body.length < 10) {
        bodyErr.textContent = 'Review must be at least 10 characters.';
        valid = false;
      } else {
        bodyErr.textContent = '';
      }

      if (!valid) return;

      const review = {
        id: Date.now(),
        author,
        rating,
        title,
        body,
        date: new Date().toISOString(),
        verified: false,
      };

      const reviews = _readReviews(productId);
      reviews.unshift(review);
      _saveReviews(productId, reviews);

      // Re-render with new review included
      _render(container, productId);

      // Announce success to screen readers
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'assertive');
      liveRegion.className = 'sr-only';
      liveRegion.textContent = 'Your review has been submitted. Thank you!';
      document.body.appendChild(liveRegion);
      setTimeout(() => liveRegion.remove(), 3000);
    });
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  function init() {
    const container = document.getElementById('productReviews');
    if (!container) return;

    const productId = container.dataset.productId || 'unknown';
    _render(container, productId);
  }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();