const kids_clothes = [
  { id: 1,  brand: "H&M", name: "Pink & Black Cute Dress", price: 78, img: "images/products/kids_clothes/c1.jpg", rating: 5, category: "girl" },
  { id: 2,  brand: "U.S. Polo Assn", name: "White Frock with Pink Pants", price: 78, img: "images/products/kids_clothes/c2.jpg", rating: 5, category: "girl" },
  { id: 3,  brand: "Pantaloons", name: "Green & White Shirt", price: 78, img: "images/products/kids_clothes/c3.jpg", rating: 5, category: "boy" },
  { id: 4,  brand: "U.S. Polo Assn", name: "Pink Shirt with Blue Jeans", price: 78, img: "images/products/kids_clothes/c4.jpg", rating: 5, category: "boy" },
  { id: 5,  brand: "H&M", name: "White Shirt with Blue Jeans", price: 78, img: "images/products/kids_clothes/c5.jpg", rating: 5, category: "boy" },
  { id: 6,  brand: "U.S. Polo Assn", name: "Beige & White Shirt", price: 78, img: "images/products/kids_clothes/c6.jpg", rating: 5, category: "boy" },
  { id: 7,  brand: "H&M", name: "Charcoal Black Shirt & Shorts", price: 78, img: "images/products/kids_clothes/c7.jpg", rating: 5, category: "boy" },
  { id: 8,  brand: "H&M", name: "Pink & Black Cute Dress", price: 78, img: "images/products/kids_clothes/c8.jpg", rating: 5, category: "girl" },
  { id: 9,  brand: "U.S. Polo Assn", name: "Purple Top with Black Camoflauge Pants", price: 78, img: "images/products/kids_clothes/c9.jpg", rating: 5, category: "girl" },
  { id: 10, brand: "Pantaloons", name: "Pink & White Cute Dress", price: 78, img: "images/products/kids_clothes/c10.jpg", rating: 5, category: "girl" },
  { id: 11, brand: "H&M", name: "Denim Jacket with Brown Shorts", price: 78, img: "images/products/kids_clothes/c11.jpg", rating: 5, category: "boy" },
  { id: 12, brand: "U.S. Polo Assn", name: "Brown Bear Set", price: 78, img: "images/products/kids_clothes/c12.jpg", rating: 5, category: "boy" },
  { id: 13, brand: "H&M", name: "Denim Blue Dungree and Skirt", price: 79, img: "images/products/kids_clothes/c13.jpg", rating: 5, category: "girl" },
  { id: 14, brand: "Pantaloons", name: "Baby Pink Frock", price: 78, img: "images/products/kids_clothes/c14.jpg", rating: 5, category: "girl" },
  { id: 15, brand: "H&M", name: "Baby Pink Top & Skirt", price: 78, img: "images/products/kids_clothes/c15.jpg", rating: 5, category: "girl" },
  { id: 16, brand: "Pantaloons", name: "Blue Striped Tshirt & Pant", price: 78, img: "images/products/kids_clothes/c16.jpg", rating: 5, category: "boy" },
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
  const suggestions = kids_clothes
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

  const filteredProducts = kids_clothes.filter(product => {
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
renderProducts('shop-container', kids_clothes);
renderProducts('featured-container', kids_clothes.slice(0, 4));
attachSearchListeners();
updateSearchSummary(kids_clothes.length);
renderSearchSuggestions('');
