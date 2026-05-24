const AUTH_STORAGE_KEY = 'loggedInUser';

const ACTIVE_PAGE_MAP = {
  'index.html': 'home',
  'shop.html': 'shop',
  'blog.html': 'blog',
  'about.html': 'about',
  'contact.html': 'contact',
  'try-on.html': 'tryon',
  'community.html': 'community',
  'promotions.html': 'promotions',
  'login.html': 'login',
};

let darkModeInitialized = false;
let mobileNavbarInitialized = false;
let navbarRendered = false;

function getCurrentPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function isLoggedIn() {
  return Boolean(
    localStorage.getItem(AUTH_STORAGE_KEY) ||
    sessionStorage.getItem(AUTH_STORAGE_KEY)
  );
}

function buildNavbarHTML(activePage) {
  return `
    <div>
      <ul id="navbar">
${buildNavbarItemsHTML(activePage)}
      </ul>
    </div>
  `;
}

function buildHeaderHTML(activePage) {
  return `
    <a href="index.html">
      <img id="siteLogo" src="images/logo.png" alt="Cara Logo" />
    </a>

    <div>
${buildNavbarHTML(activePage)}
    </div>

    <div class="mobile">
      <i
        class="fas fa-outdent"
        id="bar"
        role="button"
        aria-label="Open menu"
        aria-expanded="false"
        tabindex="0"
      ></i>
    </div>
  `;
}

function buildNavbarItemsHTML(activePage) {
  const loggedIn = isLoggedIn();

  return `
        <li>
          <a ${activePage === 'home' ? 'class="active"' : ''} href="index.html" title="Home">
            Home
          </a>
        </li>

        <li>
          <a ${activePage === 'shop' ? 'class="active"' : ''} href="shop.html" title="Shop">
            Shop
          </a>
        </li>

        <li>
          <a ${activePage === 'blog' ? 'class="active"' : ''} href="blog.html" title="Blog">
            Blog
          </a>
        </li>

        <li>
          <a ${activePage === 'about' ? 'class="active"' : ''} href="about.html" title="About">
            About
          </a>
        </li>

        <li>
          <a ${activePage === 'tryon' ? 'class="active"' : ''} href="try-on.html" title="Try-On">
            Try-On
          </a>
        </li>

        <li>
          <a ${activePage === 'community' ? 'class="active"' : ''} href="community.html" title="Community">
            Community
          </a>
        </li>

        <li>
          <a ${activePage === 'promotions' ? 'class="active"' : ''} href="promotions.html" title="Promotions">
            Promotions
          </a>
        </li>

        <li class="nav-icon">
          <a href="contact.html" title="Contact Us" aria-label="Contact">
            <i class="ri-customer-service-2-line"></i>
          </a>
        </li>

        <li class="nav-icon">
          ${
            loggedIn
              ? '<a href="#" data-auth-action="logout" title="Logout" aria-label="Logout"><i class="ri-logout-box-r-line"></i></a>'
              : '<a href="login.html" title="Sign In" aria-label="Login"><i class="ri-user-3-line"></i></a>'
          }
        </li>

        <li class="nav-icon">
          <a href="cart.html" id="lg-bag" title="View Cart" aria-label="Cart">
            <i class="ri-shopping-bag-4-line"></i>
          </a>
        </li>

        <li class="nav-icon">
          <button
            class="theme-toggle"
            id="themeToggle"
            aria-label="Toggle dark mode"
            type="button"
          >
            <i class="ri-moon-line" id="themeIcon"></i>
          </button>
        </li>

  `;
}

function applyActiveState(navbar, activePage) {
  const links = navbar.querySelectorAll('a[href]');

  links.forEach((link) => {
    link.classList.remove('active');

    const href = link.getAttribute('href') || '';
    const title = link.getAttribute('title') || '';

    if (
      (activePage === 'home' && href === 'index.html') ||
      (activePage === 'shop' && href === 'shop.html') ||
      (activePage === 'blog' && href === 'blog.html') ||
      (activePage === 'about' && href === 'about.html') ||
      (activePage === 'tryon' && href === 'try-on.html') ||
      (activePage === 'community' && href === 'community.html') ||
      (activePage === 'promotions' && href === 'promotions.html') ||
      (activePage === 'contact' && href === 'contact.html') ||
      (activePage === 'login' && (href === 'login.html' || title === 'Sign In'))
    ) {
      link.classList.add('active');
    }
  });
}

function updateAuthLink(link, loggedIn) {
  if (!link) {
    return;
  }

  const icon = link.querySelector('i');

  if (loggedIn) {
    link.setAttribute('href', '#');
    link.setAttribute('title', 'Logout');
    link.setAttribute('aria-label', 'Logout');
    link.setAttribute('data-auth-action', 'logout');

    if (icon) {
      icon.className = 'ri-logout-box-r-line';
    } else {
      link.textContent = 'Logout';
    }
  } else {
    link.setAttribute('href', 'login.html');
    link.setAttribute('title', 'Sign In');
    link.setAttribute('aria-label', 'Login');
    link.removeAttribute('data-auth-action');

    if (icon) {
      icon.className = 'ri-user-3-line';
    } else {
      link.textContent = 'Sign In';
    }
  }
}

function syncAuthState() {
  const loggedIn = isLoggedIn();
  const header = document.getElementById('header') || document;
  const authLinks = new Set(
    header.querySelectorAll(
      'a[href="login.html"], a[href="./login.html"], a[aria-label="Login"], a[title="Sign In"], a#login-btn, a#logout-btn, a[data-auth-action="logout"]'
    )
  );

  authLinks.forEach((link) => {
    link.style.display = '';
    updateAuthLink(link, loggedIn);
  });
}

function renderNavbar() {
  const activePage = ACTIVE_PAGE_MAP[getCurrentPage()] || '';
  const container = document.getElementById('navbar-container');
  const header = document.getElementById('header');
  const existingNavbar = document.getElementById('navbar');

  if (navbarRendered) {
    syncAuthState();
    return existingNavbar;
  }

  if (header) {
    header.innerHTML = buildHeaderHTML(activePage);
    navbarRendered = true;

    const renderedNavbar = document.getElementById('navbar');

    if (renderedNavbar) {
      applyActiveState(renderedNavbar, activePage);
    }

    syncAuthState();
    return renderedNavbar;
  }

  if (existingNavbar) {
    existingNavbar.innerHTML = buildNavbarItemsHTML(activePage);
    applyActiveState(existingNavbar, activePage);
    if (container) {
      container.style.display = 'none';
    }
    navbarRendered = true;
    syncAuthState();
    return existingNavbar;
  }

  if (container) {
    container.innerHTML = buildNavbarHTML(activePage);
    const renderedNavbar = container.querySelector('#navbar');

    if (renderedNavbar) {
      applyActiveState(renderedNavbar, activePage);
    }

    navbarRendered = true;
    syncAuthState();
    return renderedNavbar;
  }

  navbarRendered = true;
  syncAuthState();
  return null;
}

function initMobileNavbar() {
  if (mobileNavbarInitialized) {
    return;
  }

  mobileNavbarInitialized = true;

  const bar = document.getElementById('bar');
  const navbar = document.getElementById('navbar');

  if (!bar || !navbar) {
    return;
  }

  function setMenuState(isOpen) {
    navbar.classList.toggle('active', isOpen);
    bar.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function toggleMenu() {
    setMenuState(!navbar.classList.contains('active'));
  }

  bar.addEventListener('click', toggleMenu);

  bar.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMenu();
    }
  });

  document.addEventListener('click', (event) => {
    const clickedInsideNavbar = navbar.contains(event.target);
    const clickedBar = bar.contains(event.target);

    if (
      navbar.classList.contains('active') &&
      !clickedInsideNavbar &&
      !clickedBar
    ) {
      setMenuState(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuState(false);
    }
  });

  navbar.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });
}

function initDarkMode() {
  if (darkModeInitialized) {
    return;
  }

  darkModeInitialized = true;

  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const isDarkSaved = localStorage.getItem('theme') === 'dark';

  if (isDarkSaved) {
    document.body.classList.add('dark');

    if (themeIcon) {
      themeIcon.classList.replace('ri-moon-line', 'ri-sun-line');
    }
  }

  function handleToggle() {
    document.body.classList.toggle('dark');

    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    if (themeIcon) {
      themeIcon.classList.replace(
        isDark ? 'ri-moon-line' : 'ri-sun-line',
        isDark ? 'ri-sun-line' : 'ri-moon-line'
      );
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', handleToggle);
  }
}

function handleAuthClick(event) {
  const authLink = event.target.closest('a[data-auth-action="logout"]');

  if (!authLink) {
    return;
  }

  event.preventDefault();
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  syncAuthState();
  window.location.href = 'index.html';
}

function loadNavbar() {
  renderNavbar();
  initDarkMode();
  initMobileNavbar();
}

document.addEventListener('click', handleAuthClick);
window.addEventListener('storage', syncAuthState);
window.addEventListener('pageshow', syncAuthState);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadNavbar, { once: true });
} else {
  loadNavbar();
}
