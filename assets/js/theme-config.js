// Dynamic Transition Timing Variables
class ThemeTransitionConfig {
    static setSpeed(speed = 'normal') {
        const root = document.documentElement;
        const speedMap = {
            slow: '0.6s ease-in-out',
            normal: '0.3s ease-in-out',
            fast: '0.15s ease'
        };
        root.style.setProperty('--transition-speed', speedMap[speed] || speedMap.normal);
    }
}
