/**
 * Urgency & Low Stock Visual Badges
 */
document.addEventListener('DOMContentLoaded', () => {
    const stockContainer = document.getElementById('live-stock-status');
    if (!stockContainer) return;

    const stock = window.stockTracker ? window.stockTracker.getStock('f1') : 4;
    if (stock <= 5) {
        stockContainer.innerHTML = `<span class="stock-badge low-stock">🔥 Only ${stock} left in stock - order soon!</span>`;
    } else {
        stockContainer.innerHTML = `<span class="stock-badge in-stock">✓ In Stock (${stock} available)</span>`;
    }
});
