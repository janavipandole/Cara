import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  THEMES,
  getSystemTheme,
  getStoredTheme,
  resolveEffectiveTheme,
  applyTheme
} from '../../js/theme-engine.js';

describe('Centralized Theme Engine Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should return system theme default when localStorage is empty', () => {
    expect(getStoredTheme()).toBe(THEMES.SYSTEM);
  });

  it('should resolve effective theme for light and dark choices', () => {
    expect(resolveEffectiveTheme(THEMES.LIGHT)).toBe(THEMES.LIGHT);
    expect(resolveEffectiveTheme(THEMES.DARK)).toBe(THEMES.DARK);
    expect(resolveEffectiveTheme(THEMES.HIGH_CONTRAST)).toBe(THEMES.HIGH_CONTRAST);
  });

  it('should apply theme to document root attribute and update localStorage', () => {
    const effective = applyTheme(THEMES.DARK);
    expect(effective).toBe(THEMES.DARK);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('cara_theme')).toBe('dark');
  });

  it('should dispatch themeChanged event when applying new theme', () => {
    const listener = vi.fn();
    window.addEventListener('themeChanged', listener);

    applyTheme(THEMES.LIGHT);
    expect(listener).toHaveBeenCalled();
    expect(listener.mock.calls[0][0].detail).toEqual({
      theme: THEMES.LIGHT,
      effective: THEMES.LIGHT
    });

    window.removeEventListener('themeChanged', listener);
  });
});
