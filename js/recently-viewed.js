/**
 * Recently Viewed Products Tracker
 */
document.addEventListener('DOMContentLoaded', () => {
    const productId = document.body.getAttribute('data-product-id');
    if (!productId) return;
    const history = JSON.parse(localStorage.getItem('cara_view_history') || '[]');
    if (!history.includes(productId)) {
        history.unshift(productId);
        if (history.length > 10) history.pop();
        localStorage.setItem('cara_view_history', JSON.stringify(history));
    }
});
