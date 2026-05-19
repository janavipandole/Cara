const jeans = [
  { id: 1,  brand: "Levi's", name: "Light Blue Skinny Fit Jeans", price: 78, img: "images/products/jeans/j1.jpg", rating: 5, category: "blue" },
  { id: 2,  brand: "Calvin Klein", name: "Light Blue Skinny Fit Jeans", price: 78, img: "images/products/jeans/j2.jpg", rating: 5, category: "blue" },
  { id: 3,  brand: "Levi's", name: "Blue Skinny Fit Jeans", price: 78, img: "images/products/jeans/j3.jpg", rating: 5, category: "blue" },
  { id: 4,  brand: "Pepe Jeans:", name: "Grey Wide Leg Jeans", price: 78, img: "images/products/jeans/j4.jpg", rating: 5, category: "grey" },
  { id: 5,  brand: "Calvin Klein", name: "Blue Straight Fit Jeans", price: 78, img: "images/products/jeans/j5.jpg", rating: 4, category: "blue" },
  { id: 6,  brand: "Pepe Jeans:", name: "Blue Straight Fit Jeans", price: 78, img: "images/products/jeans/j6.jpg", rating: 5, category: "blue" },
  { id: 7,  brand: "Levi's", name: "Navy Blue Straight Fit Jeans", price: 78, img: "images/products/jeans/j7.jpg", rating: 5, category: "blue" },
  { id: 8,  brand: "Tommy Hilfiger", name: "Navy Blue BellBottom Jeans", price: 78, img: "images/products/jeans/j8.jpg", rating: 5, category: "blue" },
  { id: 9,  brand: "H&M", name: "Light Blue Straight Fit Jeans", price: 78, img: "images/products/jeans/j9.jpg", rating: 4, category: "blue" },
  { id: 10, brand: "Levi's", name: "Light Blue Straight Fit Jeans", price: 78, img: "images/products/jeans/j10.jpg", rating: 5, category: "blue" },
  { id: 11, brand: "Tommy Hilfiger", name: "Black Washed Straight Fit Jeans", price: 78, img: "images/products/jeans/j11.jpg", rating: 5, category: "black" },
  { id: 12, brand: "Levi's", name: "Black Straight Fit Jeans", price: 78, img: "images/products/jeans/j12.jpg", rating: 5, category: "black" },
  { id: 13, brand: "Pepe Jeans:", name: "Black Ripped Straight Fit Jeans", price: 79, img: "images/products/jeans/j13.jpg", rating: 5, category: "black" },
  { id: 14, brand: "Calvin Klein", name: "Black BellBottom Jeans", price: 78, img: "images/products/jeans/j14.jpg", rating: 5, category: "black" },
  { id: 15, brand: "Pepe Jeans:", name: "Grey Straight Fit Jeans", price: 78, img: "images/products/jeans/j15.jpg", rating: 5, category: "grey" },
  { id: 16, brand: "Levi's", name: "Grey Straight Fit Jeanst", price: 78, img: "images/products/jeans/j16.jpg", rating: 5, category: "grey" },
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
  const suggestions = jeans
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

  const filteredProducts = jeans.filter(product => {
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
renderProducts('shop-container', jeans);
renderProducts('featured-container', jeans.slice(0, 4));
attachSearchListeners();
updateSearchSummary(jeans.length);
renderSearchSuggestions('');
