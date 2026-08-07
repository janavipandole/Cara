// i18n.js - Multi-language support

const translations = {
  en: {
    home: "Home",
    shop: "Shop",
    blog: "Blog",
    about: "About",
    contact: "Contact",
    cart: "Cart",
    wishlist: "Wishlist",
    login: "Login",
    promotions: "Promotions",
    community: "Community",
    orders: "My Orders",
    outfit: "Outfit Checker",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    search: "Search products..."
  },
  es: {
    home: "Inicio",
    shop: "Tienda",
    blog: "Blog",
    about: "Nosotros",
    contact: "Contacto",
    cart: "Carrito",
    wishlist: "Deseos",
    login: "Entrar",
    promotions: "Promociones",
    community: "Comunidad",
    orders: "Mis Pedidos",
    outfit: "Verificar Atuendo",
    addToCart: "Añadir al Carrito",
    buyNow: "Comprar Ahora",
    search: "Buscar productos..."
  }
};

function changeLanguage(lang) {
  if (!translations[lang]) return;
  try {
    localStorage.setItem("selectedLanguage", lang);
  } catch (e) {
    // Silently fail if localStorage is unavailable (private browsing, quota exceeded)
  }

  if (typeof document === "undefined") return;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
        el.setAttribute("placeholder", translations[lang][key]);
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });

  // Update active state in switcher
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    if (btn.getAttribute("data-lang") === lang) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function initLanguage() {
  let savedLang = "en";
  try {
    const stored = localStorage.getItem("selectedLanguage") || "en";
    // Fall back to English for any unknown/unrecognised language code.
    savedLang = Object.prototype.hasOwnProperty.call(translations, stored)
      ? stored
      : "en";
  } catch (e) {
    // Fall back to English if localStorage is unavailable
  }
  changeLanguage(savedLang);
}

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();

  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("lang-btn")) {
      e.preventDefault();
      const lang = e.target.getAttribute("data-lang");
      changeLanguage(lang);
    }
  });
});


export function formatI18nPlaceholder(template, params = {}) { if (!template) return ''; return template.replace(/\{{(\w+)\}}/g, (_, key) => params[key] || ''); }