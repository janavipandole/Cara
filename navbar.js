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

  // ========== INITIALIZE MOBILE MENU ==========
  initMobileMenu();
  
  // ========== INITIALIZE DARK MODE ==========
  initDarkMode();
}

function initMobileMenu() {
  const bar = document.getElementById("bar");
  const nav = document.getElementById("navbar");
  const close = document.getElementById("close");

  console.log("Mobile menu init:", { bar: !!bar, nav: !!nav, close: !!close });

  if (bar && nav) {
    bar.addEventListener("click", function() {
      console.log("Bar clicked");
      nav.classList.add("active");
      document.body.classList.add("nav-open");
    });
  }

  if (close && nav) {
    close.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("Close clicked");
      nav.classList.remove("active");
      document.body.classList.remove("nav-open");
    });
  }

  // Close menu when clicking any nav link
  if (nav) {
    const navLinks = nav.querySelectorAll("li a");
    navLinks.forEach(function(link) {
      link.addEventListener("click", function() {
        nav.classList.remove("active");
        document.body.classList.remove("nav-open");
      });
    });
  }

  // Close menu when clicking overlay
  document.addEventListener("click", function(e) {
    if (nav && nav.classList.contains("active") && !nav.contains(e.target) && e.target !== bar && !bar.contains(e.target)) {
      nav.classList.remove("active");
      document.body.classList.remove("nav-open");
    }
  });
}

function initDarkMode() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  const themeIconMobile = document.getElementById('themeIconMobile');

  // Apply saved theme on load
  const isDarkSaved = localStorage.getItem('theme') === 'dark';
  if (isDarkSaved) {
    document.body.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.classList.replace('ri-moon-line', 'ri-sun-line');
    if (themeIconMobile) themeIconMobile.classList.replace('ri-moon-line', 'ri-sun-line');
  }

  function handleToggle() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const next = isDark ? 'ri-sun-line' : 'ri-moon-line';
    const prev = isDark ? 'ri-moon-line' : 'ri-sun-line';
    if (themeIcon) themeIcon.classList.replace(prev, next);
    if (themeIconMobile) themeIconMobile.classList.replace(prev, next);
    
    // Update logo
    const siteLogo = document.getElementById('siteLogo');
    if (siteLogo) {
      siteLogo.src = isDark ? 'images/Dlogo.png' : 'images/logo.png';
    }
  }

  if (themeToggle) themeToggle.addEventListener('click', handleToggle);
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', handleToggle);
}
