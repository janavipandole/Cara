const products = [
  {
    id: 1,
    brand: 'Nike',
    name: 'Tropical Hibiscus Summer Shirt',
    price: 2499,
    img: 'images/products/f1.jpg',
    rating: 4.5,
    category: 'street',
  },
  {
    id: 2,
    brand: 'H&M',
    name: 'White Palm Leaf Casual Shirt',
    price: 1299,
    img: 'images/products/f2.jpg',
    rating: 3.5,
    category: 'minimal',
  },
  {
    id: 3,
    brand: 'Zara',
    name: 'Vintage Rose Garden Shirt',
    price: 3490,
    img: 'images/products/f3.jpg',
    rating: 4.0,
    category: 'minimal',
  },
  {
    id: 4,
    brand: "Levi's",
    name: 'Sakura Blossom Floral Shirt',
    price: 2799,
    img: 'images/products/f4.jpg',
    rating: 5.0,
    category: 'minimal',
  },
  {
    id: 5,
    brand: 'Puma',
    name: 'Pink Peony Patterned Shirt',
    price: 1999,
    img: 'images/products/f5.jpg',
    rating: 3.0,
    category: 'street',
  },
  {
    id: 6,
    brand: 'Gap',
    name: 'Dual-Tone Corduroy Shirt',
    price: 2299,
    img: 'images/products/f6.jpg',
    rating: 4.0,
    category: 'street',
  },
  {
    id: 7,
    brand: 'Uniqlo',
    name: 'Embroidered Linen Trousers',
    price: 3990,
    img: 'images/products/f7.jpg',
    rating: 4.5,
    category: 'street',
  },
  {
    id: 8,
    brand: 'Mango',
    name: 'Cat Print Long Sleeve Blouse',
    price: 2699,
    img: 'images/products/f8.jpg',
    rating: 3.5,
    category: 'minimal',
  },
  {
    id: 9,
    brand: 'Tommy Hilfiger',
    name: 'Sky Blue Mandarin Collar Shirt',
    price: 4499,
    img: 'images/products/n1.jpg',
    rating: 5.0,
    category: 'formal',
  },
  {
    id: 10,
    brand: 'Ralph Lauren',
    name: 'Navy Textured Formal Shirt',
    price: 6999,
    img: 'images/products/n2.jpg',
    rating: 4.5,
    category: 'formal',
  },
  {
    id: 11,
    brand: 'Calvin Klein',
    name: 'Classic White Cotton Shirt',
    price: 5499,
    img: 'images/products/n3.jpg',
    rating: 4.0,
    category: 'formal',
  },
  {
    id: 12,
    brand: 'Zara',
    name: 'Sandstone Tactical Utility Shirt',
    price: 3990,
    img: 'images/products/n4.jpg',
    rating: 3.5,
    category: 'formal',
  },
  {
    id: 13,
    brand: 'Nike',
    name: 'Denim Blue Everyday Shirt',
    price: 2799,
    img: 'images/products/n5.jpg',
    rating: 4.0,
    category: 'minimal',
  },
  {
    id: 14,
    brand: "Levi's",
    name: 'Vertical Stripe Chino Shorts',
    price: 2499,
    img: 'images/products/n6.jpg',
    rating: 3.0,
    category: 'minimal',
  },
  {
    id: 15,
    brand: 'Uniqlo',
    name: 'Khaki Safari Work Shirt',
    price: 3499,
    img: 'images/products/n7.jpg',
    rating: 4.5,
    category: 'minimal',
  },
  {
    id: 16,
    brand: 'Puma',
    name: 'Deep Charcoal Casual Shirt',
    price: 1799,
    img: 'images/products/n8.jpg',
    rating: 3.5,
    category: 'minimal',
  },
];

/**
 * Renders star icons based on a numeric rating (supports half-stars).
 * Also loads user's saved rating from localStorage if available.
 * @param {number} baseRating - Default rating from products array (e.g. 3.5)
 * @param {number} productId  - Used as localStorage key
 * @returns {HTMLElement} - A <div class="star"> with interactive star icons
 */
function renderStars(baseRating, productId) {
  // Load user's saved rating if it exists, else use base rating
  const savedRating = parseFloat(localStorage.getItem('userRating_' + productId));
  const displayRating = !isNaN(savedRating) ? savedRating : baseRating;

  const starDiv = document.createElement('div');
  starDiv.className = 'star';
  starDiv.setAttribute('aria-label', 'Rating: ' + displayRating + ' out of 5');
  starDiv.setAttribute('title', displayRating + ' / 5');

  // Build 5 star icons
  for (let i = 1; i <= 5; i++) {
    const starIcon = document.createElement('i');
    starIcon.dataset.value = i; // store which star this is

    if (i <= Math.floor(displayRating)) {
      starIcon.className = 'ri-star-fill';
    } else if (i === Math.ceil(displayRating) && displayRating % 1 !== 0) {
      starIcon.className = 'ri-star-half-fill';
    } else {
      starIcon.className = 'ri-star-line';
    }

    // ── User rating on click ──
    starIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      const clickedValue = parseInt(starIcon.dataset.value);
      saveUserRating(productId, clickedValue, starDiv);
    });

    // Hover effect — highlight stars on mouseover
    starIcon.addEventListener('mouseover', () => {
      highlightStars(starDiv, i);
    });

    starDiv.appendChild(starIcon);
  }

  // Reset highlight on mouse leave
  starDiv.addEventListener('mouseleave', () => {
    const currentRating = parseFloat(localStorage.getItem('userRating_' + productId)) || baseRating;
    updateStarDisplay(starDiv, currentRating);
  });

  // Numeric rating text
  const ratingText = document.createElement('span');
  ratingText.className = 'rating-value';
  ratingText.textContent = displayRating % 1 === 0
    ? displayRating.toFixed(1)
    : displayRating.toString();
  starDiv.appendChild(ratingText);

  return starDiv;
}

/**
 * Saves user's clicked rating to localStorage and updates star display.
 * @param {number} productId
 * @param {number} rating - Integer 1–5 clicked by user
 * @param {HTMLElement} starDiv
 */
function saveUserRating(productId, rating, starDiv) {
  localStorage.setItem('userRating_' + productId, rating);
  updateStarDisplay(starDiv, rating);

  // Update numeric text
  const ratingText = starDiv.querySelector('.rating-value');
  if (ratingText) {
    ratingText.textContent = rating + '.0';
  }
}

/**
 * Highlights stars up to a given value (used on hover).
 * @param {HTMLElement} starDiv
 * @param {number} upTo - Highlight stars 1 through upTo
 */
function highlightStars(starDiv, upTo) {
  const stars = starDiv.querySelectorAll('i[data-value]');
  stars.forEach((star) => {
    const val = parseInt(star.dataset.value);
    star.className = val <= upTo ? 'ri-star-fill' : 'ri-star-line';
  });
}

/**
 * Refreshes star icon classes based on a numeric rating.
 * @param {HTMLElement} starDiv
 * @param {number} rating
 */
function updateStarDisplay(starDiv, rating) {
  const stars = starDiv.querySelectorAll('i[data-value]');
  stars.forEach((star) => {
    const i = parseInt(star.dataset.value);
    if (i <= Math.floor(rating)) {
      star.className = 'ri-star-fill';
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      star.className = 'ri-star-half-fill';
    } else {
      star.className = 'ri-star-line';
    }
  });
}

function renderProducts(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (list.length === 0) {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value : '';

    container.innerHTML = `
        <div id="no-results-message" style="width: 100%; text-align: center; padding: 60px 20px;">
            <div class="no-results-content">
                <i class="ri-search-line" style="font-size: 3rem; color: #888; margin-bottom: 15px; display: block;"></i>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px;">No matching products found</h3>
                <p style="color: #666;">We couldn't find any products matching "${searchTerm}". Please try a different search term or change your category filter.</p>
            </div>
        </div>
    `;
    return;
  }

  // 1. Render Skeleton Cards
  const numSkeletons = Math.min(list.length, 8); // Render up to 8 skeleton cards
  for (let i = 0; i < numSkeletons; i++) {
    const skel = document.createElement('div');
    skel.className = 'skeleton-card';
    skel.innerHTML = `
      <div class="skeleton-img skeleton"></div>
      <div class="des" style="padding: 0;">
        <div class="skeleton-brand skeleton"></div>
        <div class="skeleton-title skeleton"></div>
        <div class="skeleton-stars skeleton"></div>
        <div class="skeleton-price skeleton"></div>
        <div class="skeleton-action-bar">
          <div class="skeleton-buy-btn skeleton"></div>
          <div class="skeleton-cart-btn skeleton"></div>
        </div>
      </div>
    `;
    container.appendChild(skel);
  }

  // Clear previous timeout to avoid overlapping renders (debounce effect)
  if (container.dataset.renderTimeout) {
    clearTimeout(Number(container.dataset.renderTimeout));
  }

  // 2. Render actual products after delay to show the skeleton effect
  const timeoutId = setTimeout(() => {
    container.innerHTML = '';

    list.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'pro';
    card.dataset.category = p.category;
    card.addEventListener('click', () => {
      const selectedProduct = {
        id: p.id,
        name: p.name,
        price: '$' + p.price,
        brand: p.brand,
        image: p.img,
      };
      localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
      window.location.href = 'singleProduct.html';
    });

    // Image wrapper
    const imgWrap = document.createElement('div');
    imgWrap.className = 'pro-img-wrap';
    const img = document.createElement('img');
    img.src = p.img;
    img.alt = p.name;
    imgWrap.appendChild(img);

    const ribbon = document.createElement('div');
    ribbon.className = 'ribbon';
    if (p.id === 1) {
      ribbon.textContent = 'Sale';
    } else if (p.id === 2) {
      ribbon.textContent = 'New';
    } else {
      ribbon.style.display = 'none';
    }
    imgWrap.appendChild(ribbon);

    const qvOverlay = document.createElement('div');
    qvOverlay.className = 'pro-quick-view-overlay';
    const qvBtn = document.createElement('button');
    qvBtn.className = 'pro-quick-view-btn';
    qvBtn.type = 'button';
    qvBtn.innerHTML = '<i class="ri-eye-line"></i> Quick View';
    qvBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (typeof window.openQuickViewModal === 'function') {
        window.openQuickViewModal({
          name: p.name,
          price: '₹' + p.price,
          brand: p.brand,
          img: p.img,
          rating: p.rating,
        });
      }
    });
    qvOverlay.appendChild(qvBtn);
    imgWrap.appendChild(qvOverlay);
    card.appendChild(imgWrap);

    // Description container
    const des = document.createElement('div');
    des.className = 'des';

    const brandRow = document.createElement('div');
    brandRow.className = 'pro-brand-row';
    brandRow.innerHTML = `
      <svg class="pro-brand-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2L2 19h20L12 2zm0 3.5L19.5 18h-15L12 5.5z"/>
      </svg>
      <span>${p.brand}</span>
    `;
    des.appendChild(brandRow);

    const nameH5 = document.createElement('h5');
    nameH5.textContent = p.name;
    des.appendChild(nameH5);

    // Dynamic interactive star rating
    des.appendChild(renderStars(p.rating, p.id));

    const priceH4 = document.createElement('h4');
    priceH4.textContent = '₹' + p.price.toLocaleString('en-IN');
    des.appendChild(priceH4);

    const actionBar = document.createElement('div');
    actionBar.className = 'pro-action-bar';

    const buyBtn = document.createElement('button');
    buyBtn.className = 'pro-buy-btn';
    buyBtn.textContent = 'BUY NOW';
    buyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      buyNow(p.name, '₹' + p.price, p.img, 1, 'M');
    });
    actionBar.appendChild(buyBtn);

    const cartBtn = document.createElement('a');
    cartBtn.href = '#';
    cartBtn.className = 'pro-cart-btn';
    cartBtn.setAttribute('aria-label', 'Add to cart');
    cartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      addToCart(p.name, '₹' + p.price, p.img, 1, 'M');
    });
    const cartIcon = document.createElement('i');
    cartIcon.className = 'ri-shopping-cart-2-line';
    cartBtn.appendChild(cartIcon);
    actionBar.appendChild(cartBtn);

    des.appendChild(actionBar);
    card.appendChild(des);
    container.appendChild(card);
    });
  }, 1000); // 1000ms delay to clearly show the skeleton loading screen

  container.dataset.renderTimeout = timeoutId.toString();
}

function updateSearchSummary(filteredCount) {
  const countElement = document.getElementById('searchCount');
  if (countElement) {
    countElement.textContent = `${filteredCount} product${filteredCount === 1 ? '' : 's'}`;
  }
}

function renderSearchSuggestions(query) {
  const suggestionsElement = document.getElementById('searchSuggestions');
  if (!suggestionsElement) return;

  suggestionsElement.innerHTML = '';
  if (!query.trim()) return;

  const normalizedQuery = query.trim().toLowerCase();
  const suggestions = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.brand.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 5);

  if (suggestions.length === 0) {
    const none = document.createElement('p');
    none.textContent = 'No products match your search.';
    suggestionsElement.appendChild(none);
    return;
  }

  suggestions.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${item.name} — ${item.brand}`;
    button.addEventListener('click', () => {
      const input = document.getElementById('searchInput');
      if (input) {
        input.value = item.name;
        filterProducts();
        input.focus();
      }
    });
    suggestionsElement.appendChild(button);
  });
}

function filterProducts() {
  const input = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sort-price');

  const query = input ? input.value.trim().toLowerCase() : '';
  const category = categorySelect ? categorySelect.value : 'all';
  const sortValue = sortSelect ? sortSelect.value : 'default';

  let filteredProducts = products.filter((product) => {
    const matchesCategory = category === 'all' || product.category === category;
    const matchesSearch =
      query === '' ||
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (sortValue === 'low-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === 'high-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  renderProducts('shop-container', filteredProducts);
  updateSearchSummary(filteredProducts.length);
  renderSearchSuggestions(query);
}

function attachSearchListeners() {
  const input = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sort-price');
  const searchBtn = document.getElementById('searchBtn');

  if (input) {
    input.addEventListener('input', filterProducts);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        filterProducts();
      }
    });
  }
  if (categorySelect) categorySelect.addEventListener('change', filterProducts);
  if (sortSelect) sortSelect.addEventListener('change', filterProducts);
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      filterProducts();
      input && input.focus();
    });
  }
}

function addToCart(name, price, img, quantity, size) {
  let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  cart.push({ name, price, img, quantity, size, id: Date.now() });
  localStorage.setItem('productsInCart', JSON.stringify(cart));
  if (typeof showToast === 'function') {
    showToast(name + ' added to cart!', 'success');
  }
}

function buyNow(name, price, img, quantity, size) {
  let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  cart.push({ name, price, img, quantity, size, id: Date.now() });
  localStorage.setItem('productsInCart', JSON.stringify(cart));
  window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts('shop-container', products);
  renderProducts('featured-container', products.slice(0, 4));
  attachSearchListeners();
  updateSearchSummary(products.length);
  renderSearchSuggestions('');
});