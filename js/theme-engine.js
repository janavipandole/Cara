/**
 * Theme & UI Density Controller
 */
class ThemeEngine {
    constructor() {
        this.theme = localStorage.getItem('cara_theme') || 'light';
        this.density = localStorage.getItem('cara_density') || 'comfortable';
        this.applySettings();
    }

    setTheme(theme) {
        this.theme = theme;
        localStorage.setItem('cara_theme', theme);
        this.applySettings();
    }

    setDensity(density) {
        this.density = density;
        localStorage.setItem('cara_density', density);
        this.applySettings();
    }

    applySettings() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.documentElement.setAttribute('data-density', this.density);
    }
}
window.themeEngine = new ThemeEngine();
