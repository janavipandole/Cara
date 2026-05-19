const kurtis = [
  { id: 1,  brand: "Zara", name: "White Long Minimal Design Kurti", price: 78, img: "images/products/kurtis/k1.jpg", rating: 5, category: "white" },
  { id: 2,  brand: "Zara", name: "White Floral Kurti", price: 78, img: "images/products/kurtis/k2.jpg", rating: 5, category: "white" },
  { id: 3,  brand: "Zara", name: "Red Kurti", price: 78, img: "images/products/kurtis/k3.jpg", rating: 5, category: "red" },
  { id: 4,  brand: "Pantaloons", name: "Blue Short Kurti with 3/4th Sleeves", price: 78, img: "images/products/kurtis/k4.jpg", rating: 5, category: "blue" },
  { id: 5,  brand: "Zara", name: "White Long Minimal Design Kurti", price: 78, img: "images/products/kurtis/k5.jpg", rating: 5, category: "white" },
  { id: 6,  brand: "Pantaloons", name: "Pink Floral Kurti", price: 78, img: "images/products/kurtis/k6.jpg", rating: 4, category: "pink" },
  { id: 7,  brand: "Zara", name: "Blue Traditional Kurti", price: 78, img: "images/products/kurtis/k7.jpg", rating: 3, category: "blue" },
  { id: 8,  brand: "Pantaloons", name: "Green Sleeveless Kurti", price: 78, img: "images/products/kurtis/k8.jpg", rating: 4, category: "green" },
  { id: 9,  brand: "Zara", name: "Pink Long Minimal Design Kurti", price: 78, img: "images/products/kurtis/k9.jpg", rating: 3, category: "pink" },
  { id: 10, brand: "Max", name: "Green Short Full Sleeve Kurti", price: 78, img: "images/products/kurtis/k10.jpg", rating: 5, category: "green" },
  { id: 11, brand: "Pantaloons", name: "Blue Short Kurti", price: 78, img: "images/products/kurtis/k11.jpg", rating: 5, category: "blue" },
  { id: 12, brand: "Zara", name: "Red Short Sleeveless Kurti", price: 78, img: "images/products/kurtis/k12.jpg", rating: 5, category: "red" },
  { id: 13, brand: "Max", name: "Black Short Sleeveless Kurti", price: 79, img: "images/products/kurtis/k13.jpg", rating: 5, category: "black" },
  { id: 14, brand: "Pantaloons", name: "White Short Kurti", price: 78, img: "images/products/kurtis/k14.jpg", rating: 4, category: "white" },
  { id: 15, brand: "Zara", name: "Yellow Short Full Sleeve Kurti", price: 78, img: "images/products/kurtis/k15.jpg", rating: 5, category: "yellow" },
  { id: 16, brand: "Pantaloons", name: "Red Short Tube Sleeve Kurti", price: 78, img: "images/products/kurtis/k16.jpg", rating: 5, category: "red" },
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
  const suggestions = kurtis
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

  const filteredProducts = kurtis.filter(product => {
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
renderProducts('shop-container', kurtis);
renderProducts('featured-container', kurtis.slice(0, 4));
attachSearchListeners();
updateSearchSummary(kurtis.length);
renderSearchSuggestions('');
