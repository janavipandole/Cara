function loadNavbar(activePage) {
  const navbarHTML = `
    <div class="search-container" role="search">
      <label for="searchBar" class="sr-only" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">Search Products</label>
      <input type="text" id="searchBar" placeholder="Search products..." data-i18n="search">
    </div>
    <div>
      <ul id="navbar">

        <li>
          <a ${activePage === 'home' ? 'class="active" aria-current="page"' : ''} href="index.html" title="Home" data-i18n="home">
            Home
          </a>
        </li>

        <li>
          <a ${activePage === 'shop' ? 'class="active" aria-current="page"' : ''} href="shop.html" title="Shop" data-i18n="shop">
            Shop
          </a>
        </li>

        <li>
          <a ${activePage === 'blog' ? 'class="active" aria-current="page"' : ''} href="blog.html" title="Blog" data-i18n="blog">
            Blog
          </a>
        </li>

        <li>
          <a ${activePage === 'about' ? 'class="active" aria-current="page"' : ''} href="about.html" title="About" data-i18n="about">
            About
          </a>
        </li>

        <li>
          <a ${activePage === 'outfit' ? 'class="active" aria-current="page"' : ''} href="outfit-compatibility.html" title="Outfit Checker" data-i18n="outfit">
            Outfit Checker
          </a>
        </li>

        <li>
          <a ${activePage === 'community' ? 'class="active" aria-current="page"' : ''} href="community.html" title="Community" data-i18n="community">
            Community
          </a>
        </li>

        <li>
          <a ${activePage === 'promotions' ? 'class="active" aria-current="page"' : ''} href="promotions.html" title="Promotions" data-i18n="promotions">
            Promotions
          </a>
        </li>

        <li>
          <a ${activePage === 'orders' ? 'class="active" aria-current="page"' : ''} href="order-history.html" title="My Orders" data-i18n="orders">
            My Orders
          </a>
        </li>

        <!-- Contact Icon -->
        <li class="nav-icon">
          <a href="contact.html" title="Contact Us" aria-label="Contact">
            <i class="ri-customer-service-2-line"></i>
          </a>
        </li>

        <!-- Login Icon -->
        <li class="nav-icon">
          <a ${activePage === 'login' ? 'class="active" aria-current="page"' : ''} href="login.html" title="Sign In" aria-label="Login">
            <i class="ri-user-3-line"></i>
          </a>
        </li>

        <!-- Wishlist Icon -->
        <li class="nav-icon">
          <a ${activePage === 'wishlist' ? 'class="active" aria-current="page"' : ''} href="wishlist.html" title="View Wishlist" aria-label="Wishlist">
            <i class="ri-heart-line"></i>
            <span class="wishlist-count hidden">0</span>
          </a>
        </li>

        <!-- Cart Icon -->
        <li class="nav-icon">
          <a href="cart.html" id="lg-bag" title="View Cart" aria-label="Cart">
            <i class="ri-shopping-bag-4-line"></i>
            <span class="cart-count" id="desktopCartCount">0</span>
          </a>
        </li>
        <li style="display: flex; gap: 5px; align-items: center; margin-left: 10px;">
          <a href="#" class="lang-btn" data-lang="en" style="padding: 0; font-size: 14px;">EN</a>
          <span style="color: var(--text-color); font-size: 14px;">|</span>
          <a href="#" class="lang-btn" data-lang="es" style="padding: 0; font-size: 14px;">ES</a>
        </li>
        <li>
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
            <i class="ri-moon-line" id="themeIcon"></i>
          </button>
        </li>
        <a href="#" id="close" aria-label="Close menu">
          <i class="fa-solid fa-xmark"></i>
        </a>
      </ul>
    </div>
  `;

  const container = document.getElementById('navbar-container');
  if (container) {
    container.innerHTML = navbarHTML;
  } else {
    // Silently return for pages that use a hardcoded navbar (e.g. index.html)
    return;
  }

  if (typeof window.updateWishlistCount === 'function') {
    window.updateWishlistCount();
  }
}
