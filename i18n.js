// Expose function globally so inline scripts/dropdowns can use it
window.changeLanguage = function (lang) {
  setLanguage(lang);
};

// Initialize language on load
function initLanguage() {
  const savedLang = localStorage.getItem("app_lang") || "en";
  setLanguage(savedLang);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLanguage);
} else {
  initLanguage();
}

function setLanguage(lang) {
  localStorage.setItem("app_lang", lang);
  
  // Update the dropdown value if it exists
  const langSelectors = document.querySelectorAll('.language-selector');
  langSelectors.forEach(select => {
    if (select.value !== lang) {
      select.value = lang;
    }
  });

  // Find all elements with data-i18n attribute and update text
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach(element => {
    const key = element.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      // If it's an input with placeholder, update placeholder
      if (element.hasAttribute("placeholder")) {
        element.setAttribute("placeholder", translations[lang][key]);
      } else {
        // Otherwise update text content (preserving inner HTML structure if needed, 
        // though for simple text, textContent is safer)
        element.textContent = translations[lang][key];
      }
    }
  });
}
