if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('Cara ServiceWorker registered successfully:', reg.scope);
        }).catch(err => console.log('ServiceWorker registration failed:', err));
    });
}