// Centralized Accessible Theme Preference Engine

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  HIGH_CONTRAST: 'high-contrast',
  SYSTEM: 'system',
};

export function getSystemTheme() {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return THEMES.DARK;
  }
  return THEMES.LIGHT;
}

export function getStoredTheme() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('cara_theme') || THEMES.SYSTEM;
  }
  return THEMES.SYSTEM;
}

export function resolveEffectiveTheme(themeChoice = getStoredTheme()) {
  if (themeChoice === THEMES.SYSTEM) {
    return getSystemTheme();
  }
  return themeChoice;
}

export function applyTheme(themeChoice) {
  const effectiveTheme = resolveEffectiveTheme(themeChoice);

  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cara_theme', themeChoice);
  }

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeChoice, effective: effectiveTheme } }));
  }

  return effectiveTheme;
}

export function initThemeEngine() {
  const stored = getStoredTheme();
  applyTheme(stored);

  if (typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getStoredTheme() === THEMES.SYSTEM) {
        applyTheme(THEMES.SYSTEM);
      }
    });
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initThemeEngine);
}
