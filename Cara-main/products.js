// Each product must have a unique image in images/products/.
// Only add new entries here when you have a corresponding unique image file.
// Currently 16 unique images exist: f1-f8.jpg and n1-n8.jpg.
const products = [
  {
    id: 1,
    brand: 'Nike',
    name: 'Tropical Hibiscus Summer Shirt',
    price: 2499,
    img: 'images/products/f1.jpg',
    rating: 5,
    category: 'street',
  },
  {
    id: 2,
    brand: 'H&M',
    name: 'White Palm Leaf Casual Shirt',
    price: 1299,
    img: 'images/products/f2.jpg',
    rating: 5,
    category: 'minimal',
  },
  {
    id: 3,
    brand: 'Zara',
    name: 'Vintage Rose Garden Shirt',
    price: 3490,
    img: 'images/products/f3.jpg',
    rating: 5,
    category: 'minimal',
  },
  {
    id: 4,
    brand: "Levi's",
    name: 'Sakura Blossom Floral Shirt',
    price: 2799,
    img: 'images/products/f4.jpg',
    rating: 5,
    category: 'minimal',
  },
  {
    id: 5,
    brand: 'Puma',
    name: 'Pink Peony Patterned Shirt',
    price: 1999,
    img: 'images/products/f5.jpg',
    rating: 5,
    category: 'street',
  },
  {
    id: 6,
    brand: 'Gap',
    name: 'Dual-Tone Corduroy Shirt',
    price: 2299,
    img: 'images/products/f6.jpg',
    rating: 5,
    category: 'street',
  },
  {
    id: 7,
    brand: 'Uniqlo',
    name: 'Embroidered Linen Trousers',
    price: 3990,
    img: 'images/products/f7.jpg',
    rating: 5,
    category: 'street',
  },
  {
    id: 8,
    brand: 'Mango',
    name: 'Cat Print Long Sleeve Blouse',
    price: 2699,
    img: 'images/products/f8.jpg',
    rating: 5,
    category: 'minimal',
  },
  {
    id: 9,
    brand: 'Tommy Hilfiger',
    name: 'Sky Blue Mandarin Collar Shirt',
    price: 4499,
    img: 'images/products/n1.jpg',
    rating: 5,
    category: 'formal',
  },
  {
    id: 10,
    brand: 'Ralph Lauren',
    name: 'Navy Textured Formal Shirt',
    price: 6999,
    img: 'images/products/n2.jpg',
    rating: 5,
    category: 'formal',
  },
  {
    id: 11,
    brand: 'Calvin Klein',
    name: 'Classic White Cotton Shirt',
    price: 5499,
    img: 'images/products/n3.jpg',
    rating: 5,
    category: 'formal',
  },
  {
    id: 12,
    brand: 'Zara',
    name: 'Sandstone Tactical Utility Shirt',
    price: 3990,
    img: 'images/products/n4.jpg',
    rating: 5,
    category: 'formal',
  },
  {
    id: 13,
    brand: 'Nike',
    name: 'Denim Blue Everyday Shirt',
    price: 2799,
    img: 'images/products/n5.jpg',
    rating: 5,
    category: 'minimal',
  },
  {
    id: 14,
    brand: "Levi's",
    name: 'Vertical Stripe Chino Shorts',
    price: 2499,
    img: 'images/products/n6.jpg',
    rating: 5,
    category: 'minimal',
  },
  {
    id: 15,
    brand: 'Uniqlo',
    name: 'Khaki Safari Work Shirt',
    price: 3499,
    img: 'images/products/n7.jpg',
    rating: 5,
    category: 'minimal',
  },
  {
    id: 16,
    brand: 'Puma',
    name: 'Deep Charcoal Casual Shirt',
    price: 1799,
    img: 'images/products/n8.jpg',
    rating: 5,
    category: 'minimal',
  },
];

function renderProducts(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (list.length === 0) {
    const message = document.createElement('div');
    message.className = 'no-results-message';
    message.textContent =
      'No products found. Try a different search or category.';
    container.appendChild(message);
    return;
  }

  list.forEach((p) => {
    // Create product card container
    const card = document.createElement('div');
    card.className = 'pro';
    card.dataset.category = p.category;
    card.addEventListener('click', () => {
      window.location.href = 'singleProduct.html';
    });

    // ── Image wrapper ──
    const imgWrap = document.createElement('div');
    imgWrap.className = 'pro-img-wrap';
    const img = document.createElement('img');
    img.src = p.img;
    img.alt = p.name;
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);

    // ── Description container ──
    const des = document.createElement('div');
    des.className = 'des';

    // Brand row: logo icon + brand name
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

    // Star rating
    const starDiv = document.createElement('div');
    starDiv.className = 'star';
    starDiv.setAttribute('aria-label', `Rating: ${p.rating} out of 5 stars`);
    const fullStars = Math.floor(p.rating);
    const hasHalf = p.rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) {
      const starIcon = document.createElement('i');
      starIcon.className = 'ri-star-fill';
      starDiv.appendChild(starIcon);
    }
    if (hasHalf) {
      const halfIcon = document.createElement('i');
      halfIcon.className = 'ri-star-half-fill';
      starDiv.appendChild(halfIcon);
    }
    des.appendChild(starDiv);

    const priceH4 = document.createElement('h4');
    priceH4.textContent = '₹' + p.price.toLocaleString('en-IN');
    des.appendChild(priceH4);

    // ── Action bar: BUY NOW pill + circular cart button ──
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
}

// Search and filter helpers
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
  if (!query.trim()) {
    return;
  }

  const normalizedQuery = query.trim().toLowerCase();
  const suggestions = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.brand.toLowerCase().includes(normalizedQuery),
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
  if (categorySelect) {
    categorySelect.addEventListener('change', filterProducts);
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', filterProducts);
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      filterProducts();
      input && input.focus();
    });
  }
}

// Initializing the renders
renderProducts('shop-container', products);
renderProducts('featured-container', products.slice(0, 4));
attachSearchListeners();
updateSearchSummary(products.length);
renderSearchSuggestions('');
