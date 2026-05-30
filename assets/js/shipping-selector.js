document.addEventListener('DOMContentLoaded', () => {
    const shippingOptions = [
        { id: 'standard', name: 'Standard Delivery', price: 0.00, time: '3-5 Days' },
        { id: 'express', name: 'Express Delivery', price: 15.00, time: '1-2 Days' },
        { id: 'nextday', name: 'Next-Day Delivery', price: 25.00, time: 'Tomorrow' }
    ];
    
    window.renderShippingOptions = function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '<h3>Select Shipping Method</h3>';
        shippingOptions.forEach(opt => {
            const card = document.createElement('div');
            card.className = 'shipping-card';
            card.style.cssText = 'border:1px solid #cceeec;padding:15px;margin:10px 0;border-radius:8px;cursor:pointer;transition:background 0.2s;';
            card.innerHTML = `<strong>${opt.name}</strong> - $${opt.price.toFixed(2)} (${opt.time})`;
            card.addEventListener('click', () => {
                document.querySelectorAll('.shipping-card').forEach(c => c.style.background = '#fff');
                card.style.background = '#e8f6ea';
                if (typeof window.updateCheckoutTotal === 'function') {
                    window.updateCheckoutTotal(opt.price);
                }
            });
            container.appendChild(card);
        });
    };
});
