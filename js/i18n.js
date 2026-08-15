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
    authenticity: "Authenticity",
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
    authenticity: "Autenticidad",
    addToCart: "Añadir al Carrito",
    buyNow: "Comprar Ahora",
    search: "Buscar productos..."
  },
  fr: {
    wishlist: "Liste de souhaits",
    orders: "Mes Commandes",
    home: "Accueil",
    shop: "Boutique",
    blog: "Blog",
    about: "A propos",
    contact: "Contact",
    cart: "Panier",
    login: "Connexion",
    promotions: "Promotions",
    community: "Communaute",
    outfit: "Verificateur de Tenue",
    authenticity: "Authenticite",
    addToCart: "Ajouter au Panier",
    buyNow: "Acheter Maintenant",
    search: "Rechercher des produits..."
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
    // Fall back to English if the key is missing from the selected language
    const text = translations[lang][key] ?? translations["en"][key] ?? "";
    if (text) {
      if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
        el.setAttribute("placeholder", text);
      } else {
        el.textContent = text;
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

export function getI18nStatusHelper35() {
  return { status: "ok", fn: "getI18nStatusHelper35" };
}
