function loadNavbar(activePage) {
  const navbarHTML = `
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
  }

  initDarkMode();
}

function initDarkMode() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  const themeIconMobile = document.getElementById('themeIconMobile');
  const html = document.documentElement;

  // Apply saved theme on load using data-theme on <html> (matches style.css selectors)
  const savedTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', savedTheme);
  updateIcons(savedTheme);

  function updateIcons(theme) {
    const iconClass = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
    if (themeIcon) themeIcon.className = iconClass;
    if (themeIconMobile) themeIconMobile.className = iconClass;

    // Swap logo based on theme
    const siteLogo = document.getElementById('siteLogo');
    if (siteLogo) {
      siteLogo.src = theme === 'dark' ? 'images/Dlogo.png' : 'images/logo.png';
    }
  }

  function handleToggle() {
    const current = html.getAttribute('data-theme') || 'light';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcons(newTheme);
  }

  // Listeners are already handled by event delegation in app.js
  // if (themeToggle) themeToggle.addEventListener('click', handleToggle);
  // if (themeToggleMobile) themeToggleMobile.addEventListener('click', handleToggle);
}
