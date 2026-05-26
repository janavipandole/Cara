function loadNavbar(activePage) {

  const navbarHTML = `
    <div class="nav-search-container">
      <i class="ri-search-line search-icon"></i>

      <input
        type="text"
        id="searchBar"
        class="nav-search-input"
        placeholder="Search products..."
      >
    </div>

    <div>
      <ul id="navbar">

        <li>
          <a ${activePage === 'home' ? 'class="active"' : ''} href="index.html">
            Home
          </a>
        </li>

        <li>
          <a ${activePage === 'shop' ? 'class="active"' : ''} href="shop.html">
            Shop
          </a>
        </li>

        <li>
          <a ${activePage === 'blog' ? 'class="active"' : ''} href="blog.html">
            Blog
          </a>
        </li>

        <li>
          <a ${activePage === 'about' ? 'class="active"' : ''} href="about.html">
            About
          </a>
        </li>

        <li>
          <a ${activePage === 'tryon' ? 'class="active"' : ''} href="try-on.html">
            Try-On
          </a>
        </li>

        <li>
          <a ${activePage === 'community' ? 'class="active"' : ''} href="community.html">
            Community
          </a>
        </li>

        <li>
          <a ${activePage === 'promotions' ? 'class="active"' : ''} href="promotions.html">
            Promotions
          </a>
        </li>

        <li class="nav-icon">
          <a href="contact.html" aria-label="Contact">
            <i class="ri-customer-service-2-line"></i>
          </a>
        </li>

        <li class="nav-icon">
          <a href="login.html" aria-label="Login">
            <i class="ri-user-3-line"></i>
          </a>
        </li>

        <li class="nav-icon">
          <a ${activePage === 'cart' ? 'class="active"' : ''} 
              href="cart.html" 
              id="lg-bag" 
              aria-label="Cart">
            <i class="ri-shopping-bag-4-line"></i>
            <span class="cart-count" id="desktopCartCount">0</span>
          </a>
        </li>

        <li>
          <button
            class="theme-toggle"
            id="themeToggle"
            aria-label="Toggle dark mode"
          >
            <i class="ri-moon-line" id="themeIcon"></i>
          </button>
        </li>

      </ul>
    </div>
  `;

  const container = document.getElementById("navbar-container");

  if (!container) {
    console.error("navbar-container not found!");
    return;
  }

  container.innerHTML = navbarHTML;

  // After injecting navbar → initialize features
  initTheme();
  initSearch();
  updateCartCount();
}


// ==========================
// THEME TOGGLE (FIXED)
// ==========================
function initTheme() {

  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  if (!themeToggle || !themeIcon) return;

  // Load saved theme
  const savedTheme = localStorage.getItem("theme") || "light";

  document.documentElement.setAttribute("data-theme", savedTheme);

  updateThemeIcon(savedTheme, themeIcon);

  themeToggle.addEventListener("click", () => {

    const currentTheme =
      document.documentElement.getAttribute("data-theme");

    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);

    localStorage.setItem("theme", newTheme);

    updateThemeIcon(newTheme, themeIcon);
  });
}


// Update icon helper
function updateThemeIcon(theme, icon) {
  if (theme === "dark") {
    icon.classList.remove("ri-moon-line");
    icon.classList.add("ri-sun-line");
  } else {
    icon.classList.remove("ri-sun-line");
    icon.classList.add("ri-moon-line");
  }
}


// ==========================
// SEARCH (SAFE VERSION)
// ==========================
function initSearch() {

  const searchBar = document.getElementById("searchBar");

  if (!searchBar) return;

  searchBar.addEventListener("keyup", function () {

    const input = searchBar.value.toLowerCase();

    const products = document.querySelectorAll(".pro");

    products.forEach(product => {

      const nameEl = product.querySelector("h5");

      if (!nameEl) return;

      const productName = nameEl.textContent.toLowerCase();

      product.style.display =
        productName.includes(input) ? "block" : "none";
    });
  });
}


// ==========================
// CART COUNT (SAFE STUB)
// ==========================
function updateCartCount() {
  const cartCount = document.getElementById("desktopCartCount");

  if (!cartCount) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cartCount.textContent = cart.length;
}