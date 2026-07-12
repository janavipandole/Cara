// Keyboard navigation support for Cart Quantity adjustments
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.qty-selector, input.cart-qty');
    containers.forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                input.value = Math.max(1, (parseInt(input.value) || 1) + 1);
                input.dispatchEvent(new Event('change'));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                input.value = Math.max(1, (parseInt(input.value) || 1) - 1);
                input.dispatchEvent(new Event('change'));
            }
        });
    });
});
