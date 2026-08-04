(() => {
// i18n.js - Multi-language support

let loadedTranslations = {};

async function fetchTranslations(lang) {
  if (loadedTranslations[lang]) return loadedTranslations[lang];
  try {
    const response = await fetch(`locales/${lang}.json`);
    if (response.ok) {
      loadedTranslations[lang] = await response.json();
    } else {
      console.error(`Failed to load translation: ${lang}`);
    }
  } catch (err) {
    console.error('Error fetching translations', err);
  }
  return loadedTranslations[lang];
}

async function changeLanguage(lang) {
  const currentTranslations = await fetchTranslations(lang);
  if (!currentTranslations) return;
  localStorage.setItem('selectedLanguage', lang);

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (currentTranslations[key]) {
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', currentTranslations[key]);
      } else {
        el.textContent = currentTranslations[key];
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

async function initLanguage() {
  const savedLang = localStorage.getItem('selectedLanguage') || 'en';
  await changeLanguage(savedLang);
}

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();

  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('lang-btn')) {
      e.preventDefault();
      const lang = e.target.getAttribute('data-lang');
      changeLanguage(lang);
    }
  });
});

})();