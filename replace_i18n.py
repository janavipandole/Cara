import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """let loadedTranslations = {};\n
async function fetchTranslations(lang) {\n  if (loadedTranslations[lang]) return loadedTranslations[lang];\n  try {\n    const response = await fetch(`locales/${lang}.json`);\n    if (response.ok) {\n      loadedTranslations[lang] = await response.json();\n    } else {\n      console.error(`Failed to load translation: ${lang}`);\n    }\n  } catch (err) {\n    console.error('Error fetching translations', err);\n  }\n  return loadedTranslations[lang];\n}\n
async function changeLanguage(lang) {\n  const currentTranslations = await fetchTranslations(lang);\n  if (!currentTranslations) return;\n  localStorage.setItem('selectedLanguage', lang);\n
  document.querySelectorAll('[data-i18n]').forEach((el) => {\n    const key = el.getAttribute('data-i18n');\n    if (currentTranslations[key]) {\n      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {\n        el.setAttribute('placeholder', currentTranslations[key]);\n      } else {\n        el.textContent = currentTranslations[key];\n      }\n    }\n  });\n\n  document.querySelectorAll('.lang-btn').forEach((btn) => {\n    if (btn.getAttribute('data-lang') === lang) {\n      btn.classList.add('active');\n    } else {\n      btn.classList.remove('active');\n    }\n  });\n}\n
async function initLanguage() {\n  const routeToI18n = {\n    'index.html': 'home',\n    'shop.html': 'shop',\n    'blog.html': 'blog',\n    'about.html': 'about',\n    'outfit-compatibility.html': 'outfit',\n    'community.html': 'community',\n    'promotions.html': 'promotions',\n    'order-history.html': 'orders',\n  };\n\n  document.querySelectorAll('#navbar a').forEach((a) => {\n    const href = a.getAttribute('href');\n    if (href && routeToI18n[href] && !a.hasAttribute('data-i18n')) {\n      a.setAttribute('data-i18n', routeToI18n[href]);\n    }\n  });\n\n  const navbar = document.getElementById('navbar');\n  if (navbar && !navbar.querySelector('.lang-btn')) {\n    const li = document.createElement('li');\n    li.style.cssText = 'display: flex; gap: 5px; align-items: center; margin-left: 10px;';\n    li.innerHTML = `\n      <a href="#" class="lang-btn" data-lang="en" style="padding: 0; font-size: 14px;">EN</a>\n      <span style="color: var(--text-color); font-size: 14px;">|</span>\n      <a href="#" class="lang-btn" data-lang="es" style="padding: 0; font-size: 14px;">ES</a>\n    `;\n    const themeLi = navbar.querySelector('button.theme-toggle')?.parentElement;\n    if (themeLi) {\n      navbar.insertBefore(li, themeLi);\n    } else {\n      navbar.appendChild(li);\n    }\n  }\n\n  const savedLang = localStorage.getItem('selectedLanguage') || 'en';\n  await changeLanguage(savedLang);\n}\n"""

# We will replace from `const translations = {` down to `document.body.addEventListener('click', (e) => { ... });\n});` in app.js.
# Let's match the block with regex

pattern = re.compile(r"const translations = \{.*?\}\);\n\}\);", re.DOTALL)
new_content = pattern.sub(replacement + "\ndocument.addEventListener('DOMContentLoaded', () => {\n  initLanguage();\n\n  document.body.addEventListener('click', (e) => {\n    if (e.target.classList.contains('lang-btn')) {\n      e.preventDefault();\n      const lang = e.target.getAttribute('data-lang');\n      changeLanguage(lang);\n    }\n  });\n});", content)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
