function loadNavbar(activePage) {
  const navbarHTML = `
    <div>
      <ul id="navbar">
        <li><a ${activePage === 'home' ? 'class="active"' : ''} href="index.html">Home</a></li>
        <li><a ${activePage === 'shop' ? 'class="active"' : ''} href="shop.html">Shop</a></li>
        <li><a ${activePage === 'blog' ? 'class="active"' : ''} href="blog.html">Blog</a></li>
        <li><a ${activePage === 'about' ? 'class="active"' : ''} href="about.html">About</a></li>
        <li><a ${activePage === 'contact' ? 'class="active"' : ''} href="contact.html">Contact</a></li>
        <li><a ${activePage === 'tryon' ? 'class="active"' : ''} href="try-on.html">Try-On</a></li>
        <li><a ${activePage === 'community' ? 'class="active"' : ''} href="community.html">Community</a></li>
        <li><a ${activePage === 'promotions' ? 'class="active"' : ''} href="promotions.html">Promotions</a></li>
        <li><a ${activePage === 'login' ? 'class="active"' : ''} href="login.html">Login</a></li>
        <li>
          <a href="cart.html" id="lg-bag" class="cart-icon-wrapper">
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

}
