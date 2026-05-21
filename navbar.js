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

        <!-- Contact Icon -->
        <li class="nav-icon">
          <a href="contact.html" aria-label="Contact">
            <i class="ri-customer-service-2-line"></i>
          </a>
        </li>

        <!-- Login Icon -->
        <li class="nav-icon">
          <a ${activePage === 'login' ? 'class="active"' : ''} href="login.html" aria-label="Login">
            <i class="ri-user-3-line"></i>
          </a>
        </li>

        <!-- Cart Icon -->
        <li class="nav-icon">
          <a href="cart.html" id="lg-bag" aria-label="Cart">
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
}

function initDarkMode() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  const isDarkSaved = localStorage.getItem("theme") === "dark";

  if (isDarkSaved) {
    document.body.classList.add("dark");

    if (themeIcon) {
      themeIcon.classList.replace("ri-moon-line", "ri-sun-line");
    }
  }

  function handleToggle() {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem("theme", isDark ? "dark" : "light");

    if (themeIcon) {
      themeIcon.classList.replace(
        isDark ? "ri-moon-line" : "ri-sun-line",
        isDark ? "ri-sun-line" : "ri-moon-line"
      );
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", handleToggle);
  }
}