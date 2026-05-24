function loadNavbar() {
<<<<<<< HEAD
  const currentPage = window.location.pathname.split('/').pop();
=======
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
>>>>>>> c0df24a (Fix navbar and theme initialization logic)

  const activeMap = {
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
  

  const activePage = activeMap[currentPage];

  const navbarHTML = `
    <div>
      <ul id="navbar">
<<<<<<< HEAD

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

        <!-- Contact Icon -->
        <li class="nav-icon">
          <a href="contact.html" title="Contact Us" aria-label="Contact">
            <i class="ri-customer-service-2-line"></i>
          </a>
        </li>

        <!-- Login Icon -->
        <li class="nav-icon">
          <a ${activePage === 'login' ? 'class="active"' : ''} href="login.html" title="Sign In" aria-label="Login">
            <i class="ri-user-3-line"></i>
          </a>
        </li>

        <!-- Cart Icon -->
        <li class="nav-icon">
          <a href="cart.html" id="lg-bag" title="View Cart" aria-label="Cart">
            <i class="ri-shopping-bag-4-line"></i>
          </a>
        </li>

        <!-- Theme Toggle -->
        <li class="nav-icon">
          <button
            class="theme-toggle"
            id="themeToggle"
            aria-label="Toggle dark mode"
          >
            <i class="ri-moon-line" id="themeIcon"></i>
          </button>
        </li>

        <!-- Close Button -->
        <li>
          <a href="#" id="close" aria-label="Close menu">
            <i class="fa-solid fa-xmark"></i>
          </a>
        </li>

=======
        <li><a ${activePage === 'home' ? 'class="active"' : ''} href="index.html">Home</a></li>
        <li><a ${activePage === 'shop' ? 'class="active"' : ''} href="shop.html">Shop</a></li>
        <li><a ${activePage === 'blog' ? 'class="active"' : ''} href="blog.html">Blog</a></li>
        <li><a ${activePage === 'about' ? 'class="active"' : ''} href="about.html">About</a></li>
        <li><a ${activePage === 'tryon' ? 'class="active"' : ''} href="try-on.html">Try-On</a></li>
        <li><a ${activePage === 'community' ? 'class="active"' : ''} href="community.html">Community</a></li>
        <li><a ${activePage === 'promotions' ? 'class="active"' : ''} href="promotions.html">Promotions</a></li>
        <li class="nav-icon"><a href="contact.html"><i class="ri-customer-service-2-line"></i></a></li>
        <li class="nav-icon"><a ${activePage === 'login' ? 'class="active"' : ''} href="login.html"><i class="ri-user-3-line"></i></a></li>
        <li class="nav-icon"><a href="cart.html" id="lg-bag"><i class="ri-shopping-bag-4-line"></i></a></li>
        <li class="nav-icon">
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
            <i class="ri-moon-line" id="themeIcon"></i>
          </button>
        </li>
        <li><a href="#" id="close"><i class="fa-solid fa-xmark"></i></a></li>
>>>>>>> c0df24a (Fix navbar and theme initialization logic)
      </ul>
    </div>
  `;

  const container = document.getElementById('navbar-container');
<<<<<<< HEAD

  if (container) {
    container.innerHTML = navbarHTML;
  } else {
    console.error('navbar-container not found!');
    return;
  }
}

// Initialize navbar and UI
loadNavbar();
initDarkMode();
initMobileNavbar();

function initMobileNavbar() {
  const bar = document.getElementById('bar');
=======
  if (container) {
    container.innerHTML = navbarHTML;
    // INITIALIZE ONLY AFTER HTML IS INJECTED
    initDarkMode();
    initMobileNavbar();
  } else {
    console.error('navbar-container not found!');
  }
}

function initMobileNavbar() {
  const bar = document.getElementById('bar'); // Make sure your HTML has id="bar"
>>>>>>> c0df24a (Fix navbar and theme initialization logic)
  const close = document.getElementById('close');
  const navbar = document.getElementById('navbar');

  if (!bar || !navbar) return;

<<<<<<< HEAD
  // Open menu
  function openMenu() {
    navbar.classList.add('active');
    bar.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  // Close menu
  function closeMenu() {
    navbar.classList.remove('active');
    bar.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Open handlers
  bar.addEventListener('click', openMenu);

  bar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu();
    }
  });

  // Close handlers
  if (close) {
    close.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
    });
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    const clickedInsideNavbar = navbar.contains(e.target);
    const clickedBar = bar.contains(e.target);

    if (
      navbar.classList.contains('active') &&
      !clickedInsideNavbar &&
      !clickedBar
    ) {
      closeMenu();
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  // Close menu after clicking nav links on mobile
  const navLinks = navbar.querySelectorAll('a');

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
=======
  bar.addEventListener('click', () => {
    navbar.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  if (close) {
    close.addEventListener('click', (e) => {
      e.preventDefault();
      navbar.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
>>>>>>> c0df24a (Fix navbar and theme initialization logic)
}

function initDarkMode() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
<<<<<<< HEAD

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
=======
  
  if (!themeToggle) return;

  const isDarkSaved = localStorage.getItem('theme') === 'dark';
  if (isDarkSaved) {
    document.body.classList.add('dark');
    themeIcon?.classList.replace('ri-moon-line', 'ri-sun-line');
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeIcon?.classList.replace(isDark ? 'ri-moon-line' : 'ri-sun-line', isDark ? 'ri-sun-line' : 'ri-moon-line');
  });
}

// Run everything once the DOM is fully parsed
document.addEventListener('DOMContentLoaded', loadNavbar);
>>>>>>> c0df24a (Fix navbar and theme initialization logic)
