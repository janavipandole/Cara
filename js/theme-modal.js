/**
 * Theme Customizer Drawer Modal
 */
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button');
    btn.id = 'theme-customizer-trigger';
    btn.innerHTML = '🎨 Customizer';
    btn.className = 'theme-float-btn';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        const theme = confirm('Click OK for Dark High-Contrast, Cancel for Standard Light Theme');
        if (theme && window.themeEngine) {
            window.themeEngine.setTheme('dark-high-contrast');
        } else if (window.themeEngine) {
            window.themeEngine.setTheme('light');
        }
    });
});
