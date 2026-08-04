import re

with open('js/i18n.js', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """let loadedTranslations = {};\n
async function fetchTranslations(lang) {\n  if (loadedTranslations[lang]) return loadedTranslations[lang];\n  try {\n    const response = await fetch(`locales/${lang}.json`);\n    if (response.ok) {\n      loadedTranslations[lang] = await response.json();\n    } else {\n      console.error(`Failed to load translation: ${lang}`);\n    }\n  } catch (err) {\n    console.error('Error fetching translations', err);\n  }\n  return loadedTranslations[lang];\n}\n
async function changeLanguage(lang) {\n  const currentTranslations = await fetchTranslations(lang);\n  if (!currentTranslations) return;\n  localStorage.setItem('selectedLanguage', lang);\n
  document.querySelectorAll('[data-i18n]').forEach((el) => {\n    const key = el.getAttribute('data-i18n');\n    if (currentTranslations[key]) {\n      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {\n        el.setAttribute('placeholder', currentTranslations[key]);\n      } else {\n        el.textContent = currentTranslations[key];\n      }\n    }\n  });\n\n  document.querySelectorAll('.lang-btn').forEach((btn) => {\n    if (btn.getAttribute('data-lang') === lang) {\n      btn.classList.add('active');\n    } else {\n      btn.classList.remove('active');\n    }\n  });\n}\n
async function initLanguage() {\n  const savedLang = localStorage.getItem('selectedLanguage') || 'en';\n  await changeLanguage(savedLang);\n}\n"""

pattern = re.compile(r"const translations = \{.*?\}\);\n\}\);", re.DOTALL)
new_content = pattern.sub(replacement + "\ndocument.addEventListener('DOMContentLoaded', () => {\n  initLanguage();\n\n  document.body.addEventListener('click', (e) => {\n    if (e.target.classList.contains('lang-btn')) {\n      e.preventDefault();\n      const lang = e.target.getAttribute('data-lang');\n      changeLanguage(lang);\n    }\n  });\n});", content)

with open('js/i18n.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
