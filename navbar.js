function loadNavbar(activePage) {
  const navbarHTML = `
    <div class="nav-search-container">
      <i class="ri-search-line search-icon"></i>
      <input type="text" id="searchBar" class="nav-search-input" placeholder="Search products...">
    </div>
    <div>
      <ul id="navbar">

        <li>
          <a ${activePage === 'home' ? 'class="active" aria-current="page"' : ''} href="index.html" title="Home">
            Home
          </a>
        </li>

        <li>
          <a ${activePage === 'shop' ? 'class="active" aria-current="page"' : ''} href="shop.html" title="Shop">
            Shop
          </a>
        </li>

        <li>
          <a ${activePage === 'blog' ? 'class="active" aria-current="page"' : ''} href="blog.html" title="Blog">
            Blog
          </a>
        </li>

        <li>
          <a ${activePage === 'about' ? 'class="active" aria-current="page"' : ''} href="about.html" title="About">
            About
          </a>
        </li>

        <li>
          <a ${activePage === 'tryon' ? 'class="active" aria-current="page"' : ''} href="try-on.html" title="Try-On">
            Try-On
          </a>
        </li>

        <li>
          <a ${activePage === 'community' ? 'class="active" aria-current="page"' : ''} href="community.html" title="Community">
            Community
          </a>
        </li>

        <li>
          <a ${activePage === 'promotions' ? 'class="active" aria-current="page"' : ''} href="promotions.html" title="Promotions">
            Promotions
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
    console.error('navbar-container not found!');
    return;
  }

  if (typeof window.updateWishlistCount === 'function') {
    window.updateWishlistCount();
  }

  // Mobile navbar toggle - uses transform-based animation
  const navbar = document.getElementById('navbar');
  const bar = document.getElementById('bar');
  const close = document.getElementById('close');

  if (bar) {
    bar.addEventListener('click', (e) => {
      e.preventDefault();
      navbar?.classList.add('active');
      bar.classList.add('active');
    });
  }

  if (close) {
    close.addEventListener('click', (e) => {
      e.preventDefault();
      navbar?.classList.remove('active');
      bar?.classList.remove('active');
    });
  }

  // Close navbar when a link is clicked
  const navLinks = document.querySelectorAll('#navbar a:not(#close)');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navbar?.classList.remove('active');
      bar?.classList.remove('active');
    });
  });
}

