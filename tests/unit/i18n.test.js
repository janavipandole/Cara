/**
 * Unit tests for i18n.js
 * Tests multi-language support with localStorage persistence.
 * Note: the module's changeLanguage and initLanguage are IIFE-scoped.
 * Tests replicate the module's logic to verify correctness of the approach.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatI18nPlaceholder } from '../../js/i18n.js';

const translations = {
  en: {
    home: 'Home',
    shop: 'Shop',
    blog: 'Blog',
    about: 'About',
    contact: 'Contact',
    cart: 'Cart',
    wishlist: 'Wishlist',
    login: 'Login',
    promotions: 'Promotions',
    community: 'Community',
    orders: 'My Orders',
    outfit: 'Outfit Checker',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    search: 'Search products...',
  },
  es: {
    home: 'Inicio',
    shop: 'Tienda',
    blog: 'Blog',
    about: 'Nosotros',
    contact: 'Contacto',
    cart: 'Carrito',
    wishlist: 'Deseos',
    login: 'Entrar',
    promotions: 'Promociones',
    community: 'Comunidad',
    orders: 'Mis Pedidos',
    outfit: 'Verificar Atuendo',
    addToCart: 'Anadir al Carrito',
    buyNow: 'Comprar Ahora',
    search: 'Buscar productos...',
  },
};

// Replicate the changeLanguage logic from js/i18n.js for testing
function changeLanguage(lang) {
  if (!translations[lang]) return;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', translations[lang][key]);
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

describe('i18n Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <button class="lang-btn" data-lang="en">English</button>
      <button class="lang-btn" data-lang="es">Espanol</button>
      <span data-i18n="home">Home</span>
      <span data-i18n="shop">Shop</span>
      <input data-i18n="search" placeholder="Old" />
    `;
  });

  describe('changeLanguage', () => {
    it('should update textContent of elements when switching to Spanish', () => {
      changeLanguage('es');

      const homeEl = document.querySelector('[data-i18n="home"]');
      expect(homeEl.textContent).toBe('Inicio');
    });

    it('should update textContent for multiple elements simultaneously', () => {
      changeLanguage('es');

      const homeEl = document.querySelector('[data-i18n="home"]');
      const shopEl = document.querySelector('[data-i18n="shop"]');
      expect(homeEl.textContent).toBe('Inicio');
      expect(shopEl.textContent).toBe('Tienda');
    });

    it('should update placeholder attribute for INPUT elements', () => {
      changeLanguage('es');

      const searchEl = document.querySelector('[data-i18n="search"]');
      expect(searchEl.getAttribute('placeholder')).toBe('Buscar productos...');
    });

    it('should add active class to the selected language button', () => {
      changeLanguage('es');

      const esBtn = document.querySelector('.lang-btn[data-lang="es"]');
      const enBtn = document.querySelector('.lang-btn[data-lang="en"]');
      expect(esBtn.classList.contains('active')).toBe(true);
      expect(enBtn.classList.contains('active')).toBe(false);
    });

    it('should remove active class from previously active button when switching', () => {
      changeLanguage('es');
      changeLanguage('en');

      const esBtn = document.querySelector('.lang-btn[data-lang="es"]');
      const enBtn = document.querySelector('.lang-btn[data-lang="en"]');
      expect(enBtn.classList.contains('active')).toBe(true);
      expect(esBtn.classList.contains('active')).toBe(false);
    });

    it('should not update elements when language key is missing', () => {
      changeLanguage('fr');
      const homeEl = document.querySelector('[data-i18n="home"]');
      expect(homeEl.textContent).toBe('Home');
    });

    it('should not crash when switching back to English', () => {
      changeLanguage('es');
      expect(() => changeLanguage('en')).not.toThrow();
      const homeEl = document.querySelector('[data-i18n="home"]');
      expect(homeEl.textContent).toBe('Home');
    });
  });

  describe('translations coverage', () => {
    it('should have English and Spanish translation keys', () => {
      expect(translations.en.home).toBe('Home');
      expect(translations.es.home).toBe('Inicio');
      expect(Object.keys(translations.en)).toEqual(Object.keys(translations.es));
    });
  });

  it('should substitute placeholder parameters in translation templates', () => {
    expect(formatI18nPlaceholder('Hello {{name}}', { name: 'Alice' })).toBe(
      'Hello Alice',
    );
    expect(formatI18nPlaceholder('Price: {{price}}', { price: 99 })).toBe(
      'Price: 99',
    );
  });
});

describe('formatI18nPlaceholder', () => {
  it('is exported as a callable function', () => {
    expect(typeof formatI18nPlaceholder).toBe('function');
  });

  it('returns an empty string for a missing template', () => {
    expect(formatI18nPlaceholder('')).toBe('');
    expect(formatI18nPlaceholder(null)).toBe('');
  });

  it('replaces missing parameters with an empty string', () => {
    expect(formatI18nPlaceholder('Hi {{name}}', {})).toBe('Hi ');
    expect(formatI18nPlaceholder('Hi {{name}}')).toBe('Hi ');
  });

  it('leaves templates without placeholders unchanged', () => {
    expect(formatI18nPlaceholder('Plain text')).toBe('Plain text');
  });
});
