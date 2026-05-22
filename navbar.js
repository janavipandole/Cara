function loadNavbar() {
  const currentPage = window.location.pathname.split("/").pop();

  const activeMap = {
    "index.html": "home",
    "shop.html": "shop",
    "blog.html": "blog",
    "about.html": "about",
    "contact.html": "contact",
    "try-on.html": "tryon",
    "community.html": "community",
    "promotions.html": "promotions",
    "login.html": "login"
  };

  const activePage = activeMap[currentPage];

  const navbarHTML = `
    <div>
      <ul id="navbar">

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

      </ul>
    </div>
  `;

  const container = document.getElementById("navbar-container");

  if (container) {
    container.innerHTML = navbarHTML;
  } else {
    console.error("navbar-container not found!");
    return;
  }

  initDarkMode();
  initMobileNavbar();
}
  function initMobileNavbar() {

  const bar = document.getElementById("bar");
  const close = document.getElementById("close");
  const navbar = document.getElementById("navbar");

  if (!bar || !navbar) return;

  // Open menu
  function openMenu() {
    navbar.classList.add("active");
    bar.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  // Close menu
  function closeMenu() {
    navbar.classList.remove("active");
    bar.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  // Open handlers
  bar.addEventListener("click", openMenu);

  bar.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    }
  });

  // Close handlers
  if (close) {
    close.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
    });
  }

  // Close on outside click
  document.addEventListener("click", (e) => {

    const clickedInsideNavbar = navbar.contains(e.target);
    const clickedBar = bar.contains(e.target);

    if (
      navbar.classList.contains("active") &&
      !clickedInsideNavbar &&
      !clickedBar
    ) {
      closeMenu();
    }
  });

  // Close on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  // Close menu after clicking nav links on mobile
  const navLinks = navbar.querySelectorAll("a");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });
 }


function initDarkMode() {
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeToggleMobile = document.getElementById("themeToggleMobile");
  const themeIcon = document.getElementById("themeIcon");
  const themeIconMobile = document.getElementById("themeIconMobile");

  const isDarkSaved = localStorage.getItem("theme") === "dark";

  if (isDarkSaved) {
    document.body.classList.add("dark");
    html.setAttribute("data-theme", "dark");
    const iconClass = "ri-sun-line";
    if (themeIcon) themeIcon.className = iconClass;
    if (themeIconMobile) themeIconMobile.className = iconClass;
    const siteLogo = document.getElementById("siteLogo");
    if (siteLogo) {
      siteLogo.src = "images/Dlogo.png";
    }
  } else {
    document.body.classList.remove("dark");
    html.setAttribute("data-theme", "light");
    const iconClass = "ri-moon-line";
    if (themeIcon) themeIcon.className = iconClass;
    if (themeIconMobile) themeIconMobile.className = iconClass;
    const siteLogo = document.getElementById("siteLogo");
    if (siteLogo) {
      siteLogo.src = "images/logo.png";
    }
  }

  function handleToggle(e) {
    if (e) {
      if (e.themeHandled) return;
      e.themeHandled = true;
    }
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    html.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    const iconClass = isDark ? "ri-sun-line" : "ri-moon-line";
    if (themeIcon) themeIcon.className = iconClass;
    if (themeIconMobile) themeIconMobile.className = iconClass;

    const siteLogo = document.getElementById("siteLogo");
    if (siteLogo) {
      siteLogo.src = isDark ? "images/Dlogo.png" : "images/logo.png";
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", handleToggle);
  }
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener("click", handleToggle);
  }
}
