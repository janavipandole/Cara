/**
 * Multi-Language Support Toggle
 * Provides a language switcher that translates key UI strings
 * using a lightweight translation map.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cara_lang_pref';
  var translations = {
    en: {
      cart: 'Cart', wishlist: 'Wishlist', shop: 'Shop', search: 'Search',
      checkout: 'Checkout', login: 'Login', register: 'Register',
      addToCart: 'Add to Cart', buyNow: 'Buy Now',
      total: 'Total', subtotal: 'Subtotal', shipping: 'Shipping',
      home: 'Home', about: 'About', contact: 'Contact',
      newsletter: 'Newsletter', subscribe: 'Subscribe',
      yourEmail: 'Your email address', followUs: 'Follow us',
      allRights: 'All rights reserved.',
    },
    es: {
      cart: 'Carrito', wishlist: 'Lista de deseos', shop: 'Tienda', search: 'Buscar',
      checkout: 'Pagar', login: 'Iniciar sesión', register: 'Registrarse',
      addToCart: 'Añadir al carrito', buyNow: 'Comprar ahora',
      total: 'Total', subtotal: 'Subtotal', shipping: 'Envío',
      home: 'Inicio', about: 'Acerca de', contact: 'Contacto',
      newsletter: 'Boletín', subscribe: 'Suscribirse',
      yourEmail: 'Tu correo electrónico', followUs: 'Síguenos',
      allRights: 'Todos los derechos reservados.',
    },
    fr: {
      cart: 'Panier', wishlist: 'Liste de souhaits', shop: 'Boutique', search: 'Rechercher',
      checkout: 'Paiement', login: 'Connexion', register: "S'inscrire",
      addToCart: 'Ajouter au panier', buyNow: 'Acheter maintenant',
      total: 'Total', subtotal: 'Sous-total', shipping: 'Livraison',
      home: 'Accueil', about: 'À propos', contact: 'Contact',
      newsletter: 'Bulletin', subscribe: "S'abonner",
      yourEmail: 'Votre adresse email', followUs: 'Suivez-nous',
      allRights: 'Tous droits réservés.',
    },
    hi: {
      cart: 'कार्ट', wishlist: 'इच्छा सूची', shop: 'दुकान', search: 'खोजें',
      checkout: 'चेकआउट', login: 'लॉग इन', register: 'रजिस्टर',
      addToCart: 'कार्ट में जोड़ें', buyNow: 'अभी खरीदें',
      total: 'कुल', subtotal: 'उप-योग', shipping: 'शिपिंग',
      home: 'होम', about: 'के बारे में', contact: 'संपर्क',
      newsletter: 'न्यूज़लेटर', subscribe: 'सदस्यता लें',
      yourEmail: 'आपका ईमेल', followUs: 'हमें फॉलो करें',
      allRights: 'सर्वाधिकार सुरक्षित.',
    },
  };

  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch (e) {
      return 'en';
    }
  }

  function storeLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* ignore */ }
  }

  function t(key) {
    var lang = getStoredLang();
    return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var translated = t(key);
      if (el.tagName === 'INPUT' && el.type !== 'button') {
        el.placeholder = translated;
      } else {
        el.textContent = translated;
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', t(key));
    });

    document.documentElement.lang = getStoredLang();
  }

  function createToggle() {
    if (document.querySelector('.lang-toggle')) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'lang-toggle';
    wrapper.innerHTML =
      '<button class="lang-btn" aria-label="Change language">' +
      '<span class="lang-flag"></span>' +
      '<span class="lang-code"></span>' +
      '</button>' +
      '<div class="lang-dropdown"></div>';

    var nav = document.querySelector('nav, .navbar, header');
    if (nav) nav.appendChild(wrapper);
    else document.body.appendChild(wrapper);

    var dropdown = wrapper.querySelector('.lang-dropdown');
    var langs = [
      { code: 'en', label: 'English', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
      { code: 'es', label: 'Español', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
      { code: 'fr', label: 'Français', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
      { code: 'hi', label: 'हिन्दी', flag: '\uD83C\uDDEE\uD83C\uDDF3' },
    ];

    langs.forEach(function (lang) {
      var item = document.createElement('button');
      item.className = 'lang-option';
      item.dataset.lang = lang.code;
      item.innerHTML = lang.flag + ' ' + lang.label;
      item.addEventListener('click', function () {
        storeLang(lang.code);
        applyTranslations();
        updateToggle();
        dropdown.classList.remove('open');
      });
      dropdown.appendChild(item);
    });

    wrapper.querySelector('.lang-btn').addEventListener('click', function () {
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) dropdown.classList.remove('open');
    });

    return wrapper;
  }

  function updateToggle() {
    var wrapper = document.querySelector('.lang-toggle');
    if (!wrapper) return;
    var current = getStoredLang();
    var flags = { en: '\uD83C\uDDFA\uD83C\uDDF8', es: '\uD83C\uDDEA\uD83C\uDDF8', fr: '\uD83C\uDDEB\uD83C\uDDF7', hi: '\uD83C\uDDEE\uD83C\uDDF3' };
    wrapper.querySelector('.lang-flag').textContent = flags[current] || '';
    wrapper.querySelector('.lang-code').textContent = current.toUpperCase();
  }

  function injectStyles() {
    if (document.getElementById('langStyles')) return;
    var s = document.createElement('style');
    s.id = 'langStyles';
    s.textContent =
      '.lang-toggle{position:relative;display:inline-block}' +
      '.lang-btn{display:flex;align-items:center;gap:4px;padding:6px 10px;background:none;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:13px}' +
      '.lang-btn:hover{background:#f1f5f9}' +
      '.lang-dropdown{position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.1);min-width:140px;display:none;z-index:100}' +
      '.lang-dropdown.open{display:block}' +
      '.lang-option{display:block;width:100%;padding:10px 14px;background:none;border:none;text-align:left;cursor:pointer;font-size:13px;color:#334155}' +
      '.lang-option:hover{background:#f1f5f9;color:#088178}';
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();
    createToggle();
    updateToggle();
    applyTranslations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraI18n = { t: t, setLang: function (l) { storeLang(l); applyTranslations(); updateToggle(); }, getLang: getStoredLang };
})();
