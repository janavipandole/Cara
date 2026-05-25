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
        <li><a ${activePage === 'login' ? 'class="active"' : ''} href="login.html" id="login-btn">Login</a></li>
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

  if (themeToggle) themeToggle.addEventListener('click', handleToggle);
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', handleToggle);
}
