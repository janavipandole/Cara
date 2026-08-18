/**
 * Client-side "You might also like" recommendations for singleProduct.html.
 * Scores products from the same category as the current item:
 *   +2 when color matches
 *   +1 when the price is within +/- 30%
 */

const DEFAULT_LIMIT = 4;

function normalizeString(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parsePrice(value) {
  if (typeof value === 'number' && isFinite(value)) {
    return value;
  }

  if (!value) return 0;

  const parsed = parseFloat(
    String(value)
      .replace(/[₹$,\s]/g, '')
      .replace(/&#?\w+;/g, ''),
  );

  return isFinite(parsed) ? parsed : 0;
}

function normalizeProduct(product) {
  if (!product || typeof product.name !== 'string' || !product.name.trim()) {
    return null;
  }

  return {
    id: product.id != null ? product.id : null,
    name: product.name.trim(),
    brand: product.brand || '',
    category: normalizeString(product.category),
    color: normalizeString(product.color),
    price: parsePrice(product.price),
    image: product.image || product.img || 'images/products/f1.jpg',
    slug: product.slug ? String(product.slug) : slugify(product.name),
  };
}

function isSameProduct(candidate, currentProduct) {
  if (!candidate || !currentProduct) return false;

  if (
    candidate.id != null &&
    currentProduct.id != null &&
    String(candidate.id) === String(currentProduct.id)
  ) {
    return true;
  }

  if (
    candidate.slug &&
    currentProduct.slug &&
    candidate.slug === currentProduct.slug
  ) {
    return true;
  }

  return candidate.name === currentProduct.name;
}

export function scoreProduct(candidateInput, currentInput) {
  const candidate = normalizeProduct(candidateInput);
  const current = normalizeProduct(currentInput);

  if (!candidate || !current) return null;
  if (!candidate.category || candidate.category !== current.category) {
    return null;
  }
  if (isSameProduct(candidate, current)) {
    return null;
  }

  let score = 0;

  if (candidate.color && current.color && candidate.color === current.color) {
    score += 2;
  }

  if (candidate.price > 0 && current.price > 0) {
    const lower = current.price * 0.7;
    const upper = current.price * 1.3;
    if (candidate.price >= lower && candidate.price <= upper) {
      score += 1;
    }
  }

  return {
    ...candidate,
    score,
    priceDistance: Math.abs(candidate.price - current.price),
  };
}

export function getRecommendedProducts(products, currentProduct, limit) {
  if (!Array.isArray(products) || !products.length) return [];

  const maxItems =
    typeof limit === 'number' && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;

  return products
    .map((product) => scoreProduct(product, currentProduct))
    .filter(Boolean)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.priceDistance !== b.priceDistance) {
        return a.priceDistance - b.priceDistance;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, maxItems);
}

function getCurrentProduct() {
  if (typeof window !== 'undefined' && window.CaraCurrentProduct) {
    return normalizeProduct(window.CaraCurrentProduct);
  }

  try {
    const stored = window.localStorage.getItem('selectedProduct');
    if (stored) {
      const parsed = JSON.parse(stored);
      const normalized = normalizeProduct(parsed);
      if (normalized) return normalized;
    }
  } catch {
    // Ignore storage parse failures.
  }

  return null;
}

function navigateToProduct(product) {
  try {
    window.localStorage.setItem('selectedProductId', product.name);
    window.localStorage.setItem(
      'selectedProduct',
      JSON.stringify({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        slug: product.slug,
      }),
    );
  } catch {
    // Ignore storage failures.
  }

  window.location.href = 'singleProduct.html';
}

function buildCard(product, doc) {
  const card = doc.createElement('article');
  card.className = 'pro recommendation-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `View ${product.name}`);
  card.dataset.productId = product.id != null ? String(product.id) : '';
  card.dataset.productSlug = product.slug;

  card.addEventListener('click', () => navigateToProduct(product));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToProduct(product);
    }
  });

  const imgWrap = doc.createElement('div');
  imgWrap.className = 'pro-img-wrap';
  const img = doc.createElement('img');
  img.src = product.image;
  img.alt = product.name;
  img.loading = 'lazy';
  imgWrap.appendChild(img);
  card.appendChild(imgWrap);

  const des = doc.createElement('div');
  des.className = 'des';

  const brandRow = doc.createElement('div');
  brandRow.className = 'pro-brand-row';
  const brandText = doc.createElement('span');
  brandText.textContent = product.brand || 'Cara';
  brandRow.appendChild(brandText);
  des.appendChild(brandRow);

  const name = doc.createElement('h5');
  name.textContent = product.name;
  des.appendChild(name);

  const price = doc.createElement('h4');
  price.textContent = `₹${Math.round(product.price).toLocaleString('en-IN')}`;
  des.appendChild(price);

  const action = doc.createElement('button');
  action.type = 'button';
  action.className = 'recommendation-view-btn';
  action.textContent = 'View Product';
  action.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToProduct(product);
  });
  des.appendChild(action);

  card.appendChild(des);
  return card;
}

export function renderRecommendations(options = {}) {
  const doc = options.doc || window.document;
  const containerId = options.containerId || 'also-like-container';
  const sectionId = options.sectionId || 'also-like-section';
  const container = doc.getElementById(containerId);
  if (!container) return [];

  const section = doc.getElementById(sectionId);
  const currentProduct =
    (options.currentProduct && normalizeProduct(options.currentProduct)) ||
    getCurrentProduct();
  const products =
    (Array.isArray(options.products) && options.products) ||
    window.CaraProducts ||
    [];
  const recommendations = getRecommendedProducts(
    products,
    currentProduct,
    typeof options.limit === 'number' ? options.limit : DEFAULT_LIMIT,
  );

  container.innerHTML = '';

  if (recommendations.length === 0) {
    if (section) section.hidden = true;
    return [];
  }

  if (section) section.hidden = false;
  recommendations.forEach((product) => {
    container.appendChild(buildCard(product, doc));
  });

  return recommendations;
}

function init() {
  const doc = window.document;
  if (!doc || !doc.getElementById('also-like-container')) return;

  const rerender = () => {
    renderRecommendations({
      containerId: 'also-like-container',
      sectionId: 'also-like-section',
    });
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', rerender, { once: true });
  } else {
    rerender();
  }

  window.addEventListener('cara:single-product-ready', () => {
    rerender();
  });
}

if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
  window.CaraProductRecommendations = {
    scoreProduct,
    getRecommendedProducts,
    renderRecommendations,
  };
  init();
}
