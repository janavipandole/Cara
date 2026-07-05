/* global getWishlist, hasPriceDropped, getPriceDropAmount, updateWishlistButtonState, isInWishlist, toggleWishlistItem, syncWishlistButtons */
/* Reusable modal display element */
const modalTemplate = `<div class="quick-view-modal" style="display:none;"></div>`;
const products = [
  {
    id: 1,
    brand: 'Nike',
    name: 'Tropical Hibiscus Summer Shirt',
    price: 2499,
    img: 'images/products/f1.jpg',
    rating: 4.5,
    category: 'street',
    color: 'pink',
    style: 'floral',
  },
  {
    id: 2,
    brand: 'H&M',
    name: 'White Palm Leaf Casual Shirt',
    price: 1299,
    img: 'images/products/f2.jpg',
    rating: 3.5,
    category: 'minimal',
    color: 'white',
    style: 'casual',
  },
  {
    id: 3,
    brand: 'Zara',
    name: 'Vintage Rose Garden Shirt',
    price: 3490,
    img: 'images/products/f3.jpg',
    rating: 4.0,
    category: 'minimal',
    color: 'red',
    style: 'floral',
  },
  {
    id: 4,
    brand: "Levi's",
    name: 'Sakura Blossom Floral Shirt',
    price: 2799,
    img: 'images/products/f4.jpg',
    rating: 5.0,
    category: 'minimal',
    color: 'pink',
    style: 'floral',
  },
  {
    id: 5,
    brand: 'Puma',
    name: 'Pink Peony Patterned Shirt',
    price: 1999,
    img: 'images/products/f5.jpg',
    rating: 3.0,
    category: 'street',
    color: 'pink',
    style: 'floral',
  },
  {
    id: 6,
    brand: 'Gap',
    name: 'Dual-Tone Corduroy Shirt',
    price: 2299,
    img: 'images/products/f6.jpg',
    rating: 4.0,
    category: 'street',
    color: 'yellow',
    style: 'casual',
  },
  {
    id: 7,
    brand: 'Uniqlo',
    name: 'Embroidered Linen Trousers',
    price: 3990,
    img: 'images/products/f7.jpg',
    rating: 4.5,
    category: 'street',
    color: 'blue',
    style: 'minimal',
  },
  {
    id: 8,
    brand: 'Mango',
    name: 'Cat Print Long Sleeve Blouse',
    price: 2699,
    img: 'images/products/f8.jpg',
    rating: 3.5,
    category: 'minimal',
    color: 'white',
    style: 'cartoon',
  },
  {
    id: 9,
    brand: 'Tommy Hilfiger',
    name: 'Sky Blue Mandarin Collar Shirt',
    price: 4499,
    img: 'images/products/n1.jpg',
    rating: 5.0,
    category: 'formal',
    color: 'blue',
    style: 'formal',
  },
  {
    id: 10,
    brand: 'Ralph Lauren',
    name: 'Navy Textured Formal Shirt',
    price: 6999,
    img: 'images/products/n2.jpg',
    rating: 4.5,
    category: 'formal',
    color: 'blue',
    style: 'formal',
  },
  {
    id: 11,
    brand: 'Calvin Klein',
    name: 'Classic White Cotton Shirt',
    price: 5499,
    img: 'images/products/n3.jpg',
    rating: 4.0,
    category: 'formal',
    color: 'white',
    style: 'formal',
  },
  {
    id: 12,
    brand: 'Zara',
    name: 'Sandstone Tactical Utility Shirt',
    price: 3990,
    img: 'images/products/n4.jpg',
    rating: 3.5,
    category: 'formal',
    color: 'brown',
    style: 'utility',
  },
  {
    id: 13,
    brand: 'Nike',
    name: 'Denim Blue Everyday Shirt',
    price: 2799,
    img: 'images/products/n5.jpg',
    rating: 4.0,
    category: 'minimal',
    color: 'blue',
    style: 'casual',
  },
  {
    id: 14,
    brand: "Levi's",
    name: 'Vertical Stripe Chino Shorts',
    price: 2499,
    img: 'images/products/n6.jpg',
    rating: 3.0,
    category: 'minimal',
    color: 'beige',
    style: 'casual',
  },
  {
    id: 15,
    brand: 'Uniqlo',
    name: 'Khaki Safari Work Shirt',
    price: 3499,
    img: 'images/products/n7.jpg',
    rating: 4.5,
    category: 'minimal',
    color: 'khaki',
    style: 'utility',
  },
  {
    id: 16,
    brand: 'Puma',
    name: 'Deep Charcoal Casual Shirt',
    price: 1799,
    img: 'images/products/n8.jpg',
    rating: 3.5,
    category: 'minimal',
    color: 'black',
    style: 'casual',
  },
  {
    id: 17,
    brand: 'Adidas',
    name: 'Black Tech Training Tee',
    price: 1899,
    img: 'images/products/f1.jpg',
    rating: 4.0,
    category: 'street',
    color: 'black',
    style: 'minimal',
  },
  {
    id: 18,
    brand: 'Zara',
    name: 'Olive Cargo Utility Pants',
    price: 3299,
    img: 'images/products/f2.jpg',
    rating: 4.2,
    category: 'street',
    color: 'green',
    style: 'utility',
  },
  {
    id: 19,
    brand: 'H&M',
    name: 'Peach Knit Sweater',
    price: 2199,
    img: 'images/products/f3.jpg',
    rating: 4.3,
    category: 'minimal',
    color: 'pink',
    style: 'casual',
  },
  {
    id: 20,
    brand: "Levi's",
    name: 'Indigo Denim Jacket',
    price: 4999,
    img: 'images/products/f4.jpg',
    rating: 4.7,
    category: 'street',
    color: 'blue',
    style: 'casual',
  },
  {
    id: 21,
    brand: 'Puma',
    name: 'Red Logo Hoodie',
    price: 2999,
    img: 'images/products/f5.jpg',
    rating: 4.1,
    category: 'street',
    color: 'red',
    style: 'casual',
  },
  {
    id: 22,
    brand: 'Gap',
    name: 'Navy Sweatpants',
    price: 1999,
    img: 'images/products/f6.jpg',
    rating: 4.0,
    category: 'minimal',
    color: 'blue',
    style: 'casual',
  },
  {
    id: 23,
    brand: 'Uniqlo',
    name: 'White Crewneck Tee',
    price: 1499,
    img: 'images/products/f7.jpg',
    rating: 4.4,
    category: 'minimal',
    color: 'white',
    style: 'casual',
  },
  {
    id: 24,
    brand: 'Mango',
    name: 'Vintage Floral Mini Dress',
    price: 2799,
    img: 'images/products/f8.jpg',
    rating: 4.5,
    category: 'minimal',
    color: 'yellow',
    style: 'floral',
  },
  {
    id: 25,
    brand: 'Tommy Hilfiger',
    name: 'Grey Polo Shirt',
    price: 3599,
    img: 'images/products/n1.jpg',
    rating: 4.3,
    category: 'formal',
    color: 'grey',
    style: 'formal',
  },
  {
    id: 26,
    brand: 'Ralph Lauren',
    name: 'Cream Chino Pants',
    price: 4799,
    img: 'images/products/n2.jpg',
    rating: 4.6,
    category: 'formal',
    color: 'beige',
    style: 'formal',
  },
  {
    id: 27,
    brand: 'Calvin Klein',
    name: 'Black Leather Belt',
    price: 1199,
    img: 'images/products/n3.jpg',
    rating: 4.0,
    category: 'minimal',
    color: 'black',
    style: 'minimal',
  },
  {
    id: 28,
    brand: 'Zara',
    name: 'Sandstone Knit Blazer',
    price: 5299,
    img: 'images/products/n4.jpg',
    rating: 4.5,
    category: 'formal',
    color: 'brown',
    style: 'formal',
  },
  {
    id: 29,
    brand: 'Nike',
    name: 'White Running Shorts',
    price: 1899,
    img: 'images/products/n5.jpg',
    rating: 4.2,
    category: 'street',
    color: 'white',
    style: 'casual',
  },
  {
    id: 30,
    brand: "Levi's",
    name: 'Classic Denim Jeans',
    price: 3999,
    img: 'images/products/n6.jpg',
    rating: 4.1,
    category: 'street',
    color: 'blue',
    style: 'casual',
  },
  {
    id: 31,
    brand: 'Uniqlo',
    name: 'Camel Overshirt',
    price: 3299,
    img: 'images/products/n7.jpg',
    rating: 4.4,
    category: 'minimal',
    color: 'brown',
    style: 'casual',
  },
  {
    id: 32,
    brand: 'Puma',
    name: 'Blue Windbreaker Jacket',
    price: 2699,
    img: 'images/products/n8.jpg',
    rating: 4.3,
    category: 'street',
    color: 'blue',
    style: 'utility',
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
  const savedRating = parseFloat(
    localStorage.getItem('userRating_' + productId)
  );
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
    const currentRating =
      parseFloat(localStorage.getItem('userRating_' + productId)) || baseRating;
    updateStarDisplay(starDiv, currentRating);
  });

  // Numeric rating text
  const ratingText = document.createElement('span');
  ratingText.className = 'rating-value';
  ratingText.textContent =
    displayRating % 1 === 0
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

function safeParseJSON(key, fallback = '[]') {
  try {
    return JSON.parse(localStorage.getItem(key) || fallback);
  } catch {
    try {
      return JSON.parse(fallback);
    } catch {
      return [];
    }
  }
}

// Wishlist logic has been migrated to app.js for global availability.

/**
 * Appends text with highlighted query matches without parsing it as HTML.
 * @param {HTMLElement} target - Element that receives the rendered text
 * @param {string} text - The original text to display
 * @param {string} query - The search query term
 */
function appendHighlightedText(target, text, query) {
  const safeText = String(text || '');
  const safeQuery = String(query || '').trim();

  target.textContent = '';
  if (!safeText || !safeQuery) {
    target.textContent = safeText;
    return;
  }

  const lowerText = safeText.toLowerCase();
  const lowerQuery = safeQuery.toLowerCase();
  let cursor = 0;

  while (cursor < safeText.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, cursor);
    if (matchIndex === -1) {
      target.appendChild(document.createTextNode(safeText.slice(cursor)));
      break;
    }

    if (matchIndex > cursor) {
      target.appendChild(
        document.createTextNode(safeText.slice(cursor, matchIndex))
      );
    }

    const highlight = document.createElement('span');
    highlight.className = 'highlight';
    highlight.textContent = safeText.slice(
      matchIndex,
      matchIndex + safeQuery.length
    );
    target.appendChild(highlight);
    cursor = matchIndex + safeQuery.length;
  }
}

function renderProducts(containerId, list, query = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (query === '') {
    const searchInput = document.getElementById('searchInput');
    query = searchInput ? searchInput.value.trim() : '';
  }

  // Remove any existing static product nodes to avoid duplicates
  document.querySelectorAll('.pro').forEach((n) => n.remove());
  container.innerHTML = '';

  if (list.length === 0) {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value : '';

    const message = document.createElement('div');
    message.id = 'no-results-message';
    message.style.cssText =
      'width: 100%; text-align: center; padding: 60px 20px;';

    const content = document.createElement('div');
    content.className = 'no-results-content';

    const icon = document.createElement('i');
    icon.className = 'ri-search-line';
    icon.style.cssText =
      'font-size: 3rem; color: #888; margin-bottom: 15px; display: block;';

    const heading = document.createElement('h3');
    heading.style.cssText = 'font-size: 1.5rem; margin-bottom: 10px;';
    heading.textContent = 'No matching products found';

    const copy = document.createElement('p');
    copy.style.color = '#666';
    copy.textContent = `We couldn't find any products matching "${searchTerm}". Please try a different search term or change your category filter.`;

    content.append(icon, heading, copy);
    message.appendChild(content);
    container.appendChild(message);
    return;
  }

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
    img.alt = p.brand + ' - ' + p.name;
    img.loading = 'lazy';
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

    const wishlistItem = getWishlist().find((item) => item.name === p.name);
    if (wishlistItem && hasPriceDropped(wishlistItem)) {
      const dropBadge = document.createElement('div');
      dropBadge.className = 'price-drop-badge';
      dropBadge.textContent = `Price dropped ₹${getPriceDropAmount(wishlistItem).toLocaleString('en-IN')}`;
      dropBadge.style.position = 'absolute';
      dropBadge.style.top = '12px';
      dropBadge.style.right = '12px';
      dropBadge.style.backgroundColor = 'rgba(220, 38, 38, 0.95)';
      dropBadge.style.color = '#fff';
      dropBadge.style.padding = '0.45rem 0.75rem';
      dropBadge.style.borderRadius = '999px';
      dropBadge.style.fontSize = '0.75rem';
      dropBadge.style.fontWeight = '700';
      dropBadge.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.18)';
      dropBadge.style.zIndex = '3';
      imgWrap.appendChild(dropBadge);
    }
    card.appendChild(imgWrap);

    // Description container
    const des = document.createElement('div');
    des.className = 'des';

    const brandRow = document.createElement('div');
    brandRow.className = 'pro-brand-row';
    brandRow.insertAdjacentHTML(
      'beforeend',
      '<svg class="pro-brand-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 19h20L12 2zm0 3.5L19.5 18h-15L12 5.5z"/></svg>'
    );
    const brandText = document.createElement('span');
    appendHighlightedText(brandText, p.brand, query);
    brandRow.appendChild(brandText);
    des.appendChild(brandRow);

    const nameH5 = document.createElement('h5');
    appendHighlightedText(nameH5, p.name, query);
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

    // Wishlist button compatible with the shared wishlist page.
    const wishlistBtn = document.createElement('button');
    wishlistBtn.type = 'button';
    wishlistBtn.className = 'wishlist-btn';
    wishlistBtn.dataset.productName = p.name;
    updateWishlistButtonState(wishlistBtn, isInWishlist(p.name));
    wishlistBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleWishlistItem(
        {
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: '₹' + p.price.toLocaleString('en-IN'),
          image: p.img,
          currentPrice: p.price,
          previousPrice: p.price,
        },
        wishlistBtn
      );
    });
    actionBar.appendChild(wishlistBtn);

    // Compare button overlay
    const compareBtn = document.createElement('button');
    compareBtn.type = 'button';
    compareBtn.className = 'compare-card-btn';
    compareBtn.dataset.productName = p.name;
    compareBtn.setAttribute('aria-label', `Compare ${p.name}`);
    compareBtn.innerHTML = '<i class="ri-arrow-left-right-line"></i>';
    compareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (typeof window.toggleCompareItem === 'function') {
        window.toggleCompareItem(p.name);
      }
    });
    actionBar.appendChild(compareBtn);

    des.appendChild(actionBar);
    card.appendChild(des);
    container.appendChild(card);
  });
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

/**
 * Resolves #1692
 * Filters the products array based on search input and updates the UI.
 */
function filterProducts() {
  const input = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sort-price');
  const brandSelect = document.getElementById('brand-filter');
  const colorSelect = document.getElementById('color-filter');
  const styleSelect = document.getElementById('style-filter');

  const rawQuery = input ? input.value.trim() : '';
  const query = rawQuery.toLowerCase();
  const category = categorySelect ? categorySelect.value : 'all';
  const sortValue = sortSelect ? sortSelect.value : 'default';
  const brandValue = brandSelect
    ? brandSelect.value.toLowerCase().trim()
    : 'all';
  const colorValue = colorSelect
    ? colorSelect.value.toLowerCase().trim()
    : 'all';
  const styleValue = styleSelect
    ? styleSelect.value.toLowerCase().trim()
    : 'all';

  let filteredProducts = products.filter((product) => {
    const matchesCategory = category === 'all' || product.category === category;
    const matchesSearch =
      query === '' ||
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.style && product.style.toLowerCase().includes(query)) ||
      (product.color && product.color.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  // Apply brand/color/style filters
  filteredProducts = filteredProducts.filter((product) => {
    const matchesBrand =
      brandValue === 'all' || product.brand.toLowerCase() === brandValue;
    const matchesColor =
      colorValue === 'all' ||
      (product.color && product.color.toLowerCase() === colorValue);
    const matchesStyle =
      styleValue === 'all' ||
      (product.style && product.style.toLowerCase() === styleValue);
    return matchesBrand && matchesColor && matchesStyle;
  });

  if (sortValue === 'low-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === 'high-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortValue === 'rating-high') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  } else if (sortValue === 'rating-low') {
    filteredProducts.sort((a, b) => a.rating - b.rating);
  } else if (sortValue === 'newest') {
    filteredProducts.sort((a, b) => b.id - a.id);
  }

  renderProducts('shop-container', filteredProducts, rawQuery);
  updateSearchSummary(filteredProducts.length);
  renderSearchSuggestions(query);
}

function attachSearchListeners() {
  const input = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sort-price');
  const brandSelect = document.getElementById('brand-filter');
  const colorSelect = document.getElementById('color-filter');
  const styleSelect = document.getElementById('style-filter');
  const searchBtn = document.getElementById('searchBtn');

  if (input) {
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(filterProducts, 300);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        filterProducts();
      }
    });
  }
  if (categorySelect) categorySelect.addEventListener('change', filterProducts);
  if (sortSelect) sortSelect.addEventListener('change', filterProducts);
  if (brandSelect) brandSelect.addEventListener('change', filterProducts);
  if (colorSelect) colorSelect.addEventListener('change', filterProducts);
  if (styleSelect) styleSelect.addEventListener('change', filterProducts);
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      filterProducts();
      input && input.focus();
    });
  }
}

/**
 * Resolves #1691
 * Adds an item to the cart and persists it to localStorage.
 */
function addToCart(name, price, img, quantity, size) {
  const cart = safeParseJSON('productsInCart');
  cart.push({ name, price, img, quantity, size, id: Date.now() });
  try {
    localStorage.setItem('productsInCart', JSON.stringify(cart));
    if (typeof showToast === 'function') {
      showToast(name + ' added to cart!', 'success');
    }
  } catch (e) {
    window.logError('Failed to save cart:', e);
    if (typeof showToast === 'function') {
      showToast('Storage limit reached! Cannot add to cart.', 'error');
    }
  }
}

function buyNow(name, price, img, quantity, size) {
  const cart = safeParseJSON('productsInCart');
  cart.push({ name, price, img, quantity, size, id: Date.now() });
  try {
    localStorage.setItem('productsInCart', JSON.stringify(cart));
    window.location.href = 'checkout.html';
  } catch (e) {
    window.logError('Failed to save cart:', e);
    if (typeof showToast === 'function') {
      showToast('Storage limit reached! Cannot proceed to checkout.', 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts('shop-container', products);
  renderProducts('featured-container', products.slice(0, 4));
  attachSearchListeners();
  updateSearchSummary(products.length);
  renderSearchSuggestions('');
  syncWishlistButtons();
});

// --- GLOBAL TOAST NOTIFICATION HANDLER ---
function showToast(message, type = 'success') {
  // Check if container already exists, else create it
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Create Toast element wrapper
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Select icon based on variant types
  let icon = '🛒';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';
  if (type === 'info') icon = 'ℹ️';

  // Build Toast inner body to match your existing CSS layout (.toast-icon, .toast-msg, .toast-close, .toast-progress)
  const iconDiv = document.createElement('div');
  iconDiv.className = 'toast-icon';
  iconDiv.textContent = icon;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'toast-msg';
  msgDiv.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = function () {
    this.parentElement.remove();
  };

  const progressDiv = document.createElement('div');
  progressDiv.className = 'toast-progress';

  toast.appendChild(iconDiv);
  toast.appendChild(msgDiv);
  toast.appendChild(closeBtn);
  toast.appendChild(progressDiv);

  container.appendChild(toast);

  // Auto-remove animation sequence handling (Matches CSS timers smoothly)
  setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      toast.remove();
    }, 350); // Exact exit duration specified in .toast-hiding cubic-bezier curve
  }, 3650); // Active visibility shelf life before auto dismissal
}
