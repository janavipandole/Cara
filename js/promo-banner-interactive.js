/**
 * Interactive Top Promo Bar
 */
document.addEventListener('DOMContentLoaded', () => {
    const banner = document.createElement('div');
    banner.id = 'top-promo-banner';
    banner.innerHTML = '🔥 Special Offer: Use code <strong>ELUSOC2026</strong> for 25% OFF! <button id="copy-promo-btn">Copy Code</button>';
    document.body.prepend(banner);

    document.getElementById('copy-promo-btn').addEventListener('click', () => {
        navigator.clipboard.writeText('ELUSOC2026');
        alert('Promo code ELUSOC2026 copied to clipboard!');
    });
});
