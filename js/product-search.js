/**
 * product-search.js
 * Connects the shop page search bar to the backend /api/products/search/query
 * endpoint with debounced input, live filter chips, and paginated results.
 *
 * Usage: include this script in shop.html after the product grid markup.
 */

(function () {
  'use strict';

  // ── Configuration ─────────────────────────────────────────────────────────
  const API_BASE = '/api/products/search/query';
  const CATEGORIES_API = '/api/products/search/categories';
  const DEBOUNCE_MS = 350;
  const DEFAULT_PAGE_SIZE = 20;

  // ── Active filter state ────────────────────────────────────────────────────
  const filters = {
    q: '',
    category: '',
    subcategory: '',
    color: '',
    style: '',
    min_price: '',
    max_price: '',
    min_rating: '',
    in_stock: false,
    sort_by: 'relevance',
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
  };
  let activeController = null;
  const smartEngine = typeof SmartSearchEngine !== 'undefined' ? new SmartSearchEngine() : null;

  // ── DOM references ──────────────────────────────────────────────────────────
  const searchInput = document.getElementById('productSearchInput');
  const categorySelect = document.getElementById('filterCategory');
  const priceMinInput = document.getElementById('filterPriceMin');
  const priceMaxInput = document.getElementById('filterPriceMax');
  const ratingSelect = document.getElementById('filterRating');
  const inStockCheckbox = document.getElementById('filterInStock');
  const sortSelect = document.getElementById('filterSortBy');
  const productGrid = document.getElementById('productGrid');
  const resultCount = document.getElementById('searchResultCount');
  const paginationWrap = document.getElementById('searchPagination');
  const searchLoader = document.getElementById('searchLoader');

  // ── Utility: debounce ──────────────────────────────────────────────────────
  function debounce(fn, wait) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeImageSrc(value) {
    const src = String(value === undefined || value === null ? '' : value).trim();
    if (!src) return 'images/products/placeholder.jpg';
    if (/^https?:\/\//i.test(src) || src.startsWith('/') || src.startsWith('images/')) {
      return src;
    }
    return 'images/products/placeholder.jpg';
  }

  // ── Build query string from active filters ─────────────────────────────────
  function buildQueryString() {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.color) params.set('color', filters.color);
    if (filters.style) params.set('style', filters.style);
    if (filters.min_price !== '') params.set('min_price', filters.min_price);
    if (filters.max_price !== '') params.set('max_price', filters.max_price);
    if (filters.min_rating !== '') params.set('min_rating', filters.min_rating);
    if (filters.in_stock) params.set('in_stock', 'true');
    params.set('sort_by', filters.sort_by);
    params.set('page', filters.page);
    params.set('page_size', filters.page_size);
    return params.toString();
  }

  // ── Render product cards ───────────────────────────────────────────────────
  function renderProducts(products) {
    if (!productGrid) return;

    if (products.length === 0) {
      productGrid.innerHTML = `
        <div class="search-empty-state" role="status" aria-live="polite">
          <i class="ri-search-2-line" aria-hidden="true"></i>
          <p>No products match your search. Try adjusting your filters.</p>
          <button class="btn-reset-filters" id="resetFiltersBtn">Clear All Filters</button>
        </div>`;
      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
      return;
    }

    productGrid.innerHTML = products
      .map((p) => {
        const id = encodeURIComponent(String(p.id));
        const name = escapeHtml(p.name);
        const brand = escapeHtml(p.brand);
        const img = escapeHtml(safeImageSrc(p.img));
        const price = Number(p.price) || 0;
        const rating = Math.min(Math.max(parseInt(p.rating, 10) || 0, 0), 5);
        return `
        <div class="pro" data-product-id="${id}" tabindex="0" role="article"
             aria-label="${name} by ${brand}, ₹${price}">
          <div class="pro-img-wrap">
            <img src="${img}"
                 alt="${name}"
                 loading="lazy"
                 onerror="this.src='images/products/placeholder.jpg'">
            ${p.stock === 0 ? '<span class="out-of-stock-badge">Out of Stock</span>' : ''}
          </div>
          <div class="des">
            <span>${brand}</span>
            <h5>${name}</h5>
            <div class="star" aria-label="${rating} out of 5 stars">
              ${'<i class="ri-star-fill"></i>'.repeat(rating)}
            </div>
            <h4>₹${price.toFixed(2)}</h4>
          </div>
          <a href="singleProduct.html?id=${id}"
             class="product-link"
             aria-label="View details for ${name}">
            <i class="ri-eye-line" aria-hidden="true"></i>
          </a>
        </div>`;
      })
      .join('');
  }

  // ── Render pagination controls ─────────────────────────────────────────────
  function renderPagination(total, page, pageSize) {
    if (!paginationWrap) return;
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) {
      paginationWrap.innerHTML = '';
      return;
    }

    let html =
      '<nav class="search-pagination" aria-label="Search results pages"><ul>';
    for (let i = 1; i <= totalPages; i++) {
      html += `<li>
        <button class="page-btn ${i === page ? 'active' : ''}"
                data-page="${i}"
                aria-current="${i === page ? 'page' : 'false'}"
                aria-label="Page ${i}">
          ${i}
        </button>
      </li>`;
    }
    html += '</ul></nav>';
    paginationWrap.innerHTML = html;

    paginationWrap.querySelectorAll('.page-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        filters.page = parseInt(this.dataset.page, 10);
        fetchAndRender();
        productGrid &&
          productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ── Main fetch + render cycle ──────────────────────────────────────────────
  function fetchAndRender() {
    // Cancel any previous in-flight request before starting a new one
    if (activeController) {
      activeController.abort();
    }
    activeController = new AbortController();
    const thisController = activeController;

    if (searchLoader) searchLoader.style.display = 'block';

    fetch(`${API_BASE}?${buildQueryString()}`, {
      signal: thisController.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(({ total, page, page_size, products }) => {
        renderProducts(products);
        renderPagination(total, page, page_size);
        if (resultCount) {
          resultCount.textContent = `${total} product${total !== 1 ? 's' : ''} found`;
          resultCount.setAttribute('aria-live', 'polite');
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          // Expected when a newer request supersedes this one — ignore silently
          return;
        }
        console.warn("[ProductSearch] Failed:", err);
        if (productGrid) {
          productGrid.innerHTML =
            '<p class="search-error" role="alert">Failed to load results. Please try again.</p>';
        }
      })
      .finally(() => {
        // Only hide loader if this is still the active (latest) request
        if (thisController === activeController && searchLoader) {
          searchLoader.style.display = 'none';
        }
      });
  }

  // ── Reset all filters to default ──────────────────────────────────────────
  function resetAllFilters() {
    filters.q = '';
    filters.category = '';
    filters.subcategory = '';
    filters.color = '';
    filters.style = '';
    filters.min_price = '';
    filters.max_price = '';
    filters.min_rating = '';
    filters.in_stock = false;
    filters.sort_by = 'relevance';
    filters.page = 1;

    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = '';
    if (priceMinInput) priceMinInput.value = '';
    if (priceMaxInput) priceMaxInput.value = '';
    if (ratingSelect) ratingSelect.value = '';
    if (inStockCheckbox) inStockCheckbox.checked = false;
    if (sortSelect) sortSelect.value = 'relevance';

    fetchAndRender();
  }

  // ── Populate category dropdown from API ───────────────────────────────────
  function populateCategoryDropdown() {
    if (!categorySelect) return;
    fetch(CATEGORIES_API)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(({ categories }) => {
        const placeholder = '<option value="">All Categories</option>';
        const opts = categories
          .map((c) => {
            const value = escapeHtml(c);
            const label = escapeHtml(
              String(c).charAt(0).toUpperCase() + String(c).slice(1),
            );
            return `<option value="${value}">${label}</option>`;
          })
          .join('');
        categorySelect.innerHTML = placeholder + opts;
      })
      .catch((err) => {
        console.warn("[ProductSearch] Failed:", err);
      });
  }

  // ── Attach event listeners ─────────────────────────────────────────────────
  const debouncedSearch = debounce(() => {
    filters.q = searchInput ? searchInput.value.trim() : '';
    // Skip the API call for whitespace-only input with no other active filters.
    if (!filters.q) {
      const hasFilters =
        filters.category ||
        filters.subcategory ||
        filters.color ||
        filters.style ||
        filters.min_price !== '' ||
        filters.max_price !== '' ||
        filters.min_rating !== '' ||
        filters.in_stock;
      if (!hasFilters) {
        if (productGrid) productGrid.innerHTML = '';
        return;
      }
    }
    filters.page = 1;
    fetchAndRender();
  }, DEBOUNCE_MS);

  if (searchInput) {
    searchInput.addEventListener('input', debouncedSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        filters.q = '';
        filters.page = 1;
        fetchAndRender();
      }
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      filters.category = categorySelect.value;
      filters.page = 1;
      fetchAndRender();
    });
  }

  if (priceMinInput) {
    priceMinInput.addEventListener('change', () => {
      const val = parseFloat(priceMinInput.value);
      if (priceMinInput.value !== '' && (isNaN(val) || val < 0)) {
        priceMinInput.value = '';
        return;
      }
      filters.min_price = priceMinInput.value;
      filters.page = 1;
      fetchAndRender();
    });
  }

  if (priceMaxInput) {
    priceMaxInput.addEventListener('change', () => {
      const val = parseFloat(priceMaxInput.value);
      if (priceMaxInput.value !== '' && (isNaN(val) || val < 0)) {
        priceMaxInput.value = '';
        return;
      }
      filters.max_price = priceMaxInput.value;
      filters.page = 1;
      fetchAndRender();
    });
  }

  if (ratingSelect) {
    ratingSelect.addEventListener('change', () => {
      filters.min_rating = ratingSelect.value;
      filters.page = 1;
      fetchAndRender();
    });
  }

  if (inStockCheckbox) {
    inStockCheckbox.addEventListener('change', () => {
      filters.in_stock = inStockCheckbox.checked;
      filters.page = 1;
      fetchAndRender();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      filters.sort_by = sortSelect.value;
      filters.page = 1;
      fetchAndRender();
    });
  }

  // ── Initialise ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    populateCategoryDropdown();
    // Only trigger initial fetch if we're on the shop page
    if (productGrid) {
      fetchAndRender();
    }
  });

  // Expose resetAllFilters globally so an HTML button can call it directly
  window.resetProductFilters = resetAllFilters;
})();


export function meetsSearchQueryThreshold(query, minLength = 2) { if (!query || typeof query !== 'string') return false; return query.trim().length >= minLength; }

window.getProductSearchStatusHelper103 = function() {
  return {
    status: 'active',
    module: 'ProductSearch',
    hasSearchInput: typeof document !== 'undefined' && !!document.getElementById('productSearchInput'),
    helper: 'getProductSearchStatusHelper103'
  };
};
