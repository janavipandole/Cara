const dresses = [
  { id: 1,  brand: "Zara", name: "Black Sleeveless V Neck", price: 78, img: "images/products/dresses/d1.jpg", rating: 5, category: "Black" },
  { id: 2,  brand: "Pantaloons", name: "Black Kneelength with White Jacket", price: 78, img: "images/products/dresses/d2.jpg", rating: 5, category: "Black" },
  { id: 3,  brand: "H&M", name: "Pink Short Frill", price: 78, img: "images/products/dresses/d3.jpg", rating: 4, category: "Pink" },
  { id: 4,  brand: "Zara", name: "Navy Blue Sleeveless Maxi", price: 78, img: "images/products/dresses/d4.jpg", rating: 5, category: "Blue" },
  { id: 5,  brand: "Louis Vuitton", name: "Pink Flowy Tube Sleeved", price: 78, img: "images/products/dresses/d5.jpg", rating: 5, category: "Pink" },
  { id: 6,  brand: "Pantaloons", name: "Dual-Tone Beach Dress", price: 78, img: "images/products/dresses/d6.jpg", rating: 4, category: "White" },
  { id: 7,  brand: "VeroModa", name: "Navy Blue Knot Sleeve Frill", price: 78, img: "images/products/dresses/d7.jpg", rating: 5, category: "Blue" },
  { id: 8,  brand: "Zara", name: "Black Frill Side Cut", price: 78, img: "images/products/dresses/d8.jpg", rating: 5, category: "Black" },
  { id: 9,  brand: "H&M", name: "Green Floral with White Jacket", price: 78, img: "images/products/dresses/d9.jpg", rating: 5, category: "Green" },
  { id: 10, brand: "Louis Vuitton", name: "Red Sleeveless Plain Maxi", price: 78, img: "images/products/dresses/d10.jpg", rating: 5, category: "Red" },
  { id: 11, brand: "Pantaloons", name: "Sage Green Frock", price: 78, img: "images/products/dresses/d11.jpg", rating: 5, category: "Green" },
  { id: 12, brand: "Zara", name: "Red One sided sleeve", price: 78, img: "images/products/dresses/d12.jpg", rating: 5, category: "Red" },
  { id: 13, brand: "H&M", name: "Red Backless Short", price: 79, img: "images/products/dresses/d13.jpg", rating: 5, category: "Red" },
  { id: 14, brand: "VeroModa", name: "Maroon Sleeveless Plain Maxi", price: 78, img: "images/products/dresses/d14.jpg", rating: 5, category: "Red" },
  { id: 15, brand: "Louis Vuitton", name: "White Cold Shoulder Frock", price: 78, img: "images/products/dresses/d15.jpg", rating: 5, category: "White" },
  { id: 16, brand: "Zara", name: "Tomato Red Floral Flowy", price: 78, img: "images/products/dresses/d16.jpg", rating: 3, category: "Red" },
];

function renderProducts(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
 
  if (list.length === 0) {
    const message = document.createElement('div');
    message.className = 'no-results-message';
    message.textContent = 'No products found. Try a different search or category.';
    container.appendChild(message);
    return;
  }

  list.forEach(p => {
    // Create product card container
    const card = document.createElement('div');
    card.className = 'pro';
    card.dataset.category = p.category;
    card.addEventListener('click', () => {
      window.location.href = 'singleProduct.html';
    });

    // Product image (safe property assignment)
    const img = document.createElement('img');
    img.src = p.img;
    img.alt = p.name;
    card.appendChild(img);

    // Description container
    const des = document.createElement('div');
    des.className = 'des';

    const brandSpan = document.createElement('span');
    brandSpan.textContent = p.brand;
    des.appendChild(brandSpan);

    const nameH5 = document.createElement('h5');
    nameH5.textContent = p.name;
    des.appendChild(nameH5);

    // Star rating (static icon markup is safe — no user data involved)
    const starDiv = document.createElement('div');
    starDiv.className = 'star';
    for (let i = 0; i < p.rating; i++) {
      const starIcon = document.createElement('i');
      starIcon.className = 'ri-star-fill';
      starDiv.appendChild(starIcon);
    }
    des.appendChild(starDiv);

    const priceH4 = document.createElement('h4');
    priceH4.textContent = '$' + p.price;
    des.appendChild(priceH4);

    card.appendChild(des);

    // Cart link (programmatic listener prevents string-breakout XSS)
    const cartLink = document.createElement('a');
    cartLink.href = '#';
    cartLink.className = 'cart';
    cartLink.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      addToCart(p.name, '$' + p.price, p.img, 1, 'M');
    });
    const cartIcon = document.createElement('i');
    cartIcon.className = 'ri-shopping-cart-2-line';
    cartLink.appendChild(cartIcon);
    card.appendChild(cartLink);

    // Buy Now button (programmatic listener prevents string-breakout XSS)
    const buyBtn = document.createElement('button');
    buyBtn.className = 'buy-now-btn';
    buyBtn.textContent = 'Buy Now';
    buyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      buyNow(p.name, '$' + p.price, p.img, 1, 'M');
    });
    card.appendChild(buyBtn);

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
  const suggestions = dresses
    .filter(p => p.name.toLowerCase().includes(normalizedQuery) || p.brand.toLowerCase().includes(normalizedQuery))
    .slice(0, 5);

  if (suggestions.length === 0) {
    const none = document.createElement('p');
    none.textContent = 'No products match your search.';
    suggestionsElement.appendChild(none);
    return;
  }

  suggestions.forEach(item => {
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

  const query = input ? input.value.trim().toLowerCase() : '';
  const category = categorySelect ? categorySelect.value : 'all';

  const filteredProducts = dresses.filter(product => {
    const matchesCategory = category === 'all' || product.category === category;
    const matchesSearch = query === '' || product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  renderProducts('shop-container', filteredProducts);
  updateSearchSummary(filteredProducts.length);
  renderSearchSuggestions(query);
}

function attachSearchListeners() {
  const input = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categoryFilter');
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
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      filterProducts();
      input && input.focus();
    });
  }
}

// Initializing the renders
renderProducts('shop-container', dresses);
renderProducts('featured-container', dresses.slice(0, 4));
attachSearchListeners();
updateSearchSummary(dresses.length);
renderSearchSuggestions('');
