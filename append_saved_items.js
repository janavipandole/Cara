const fs = require('fs');
const jsCode = `
// --- SAVE FOR LATER LOGIC ---
window.saveForLater = function(index) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    let saved = JSON.parse(localStorage.getItem('savedItems')) || [];
    if (index >= 0 && index < cart.length) {
        let item = cart.splice(index, 1)[0];
        saved.push(item);
        localStorage.setItem('productsInCart', JSON.stringify(cart));
        localStorage.setItem('savedItems', JSON.stringify(saved));
        if(typeof window.loadCart === 'function') window.loadCart();
        if(typeof window.showToast === 'function') window.showToast('Item saved for later', 'success');
    }
};

window.moveToCart = function(index) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    let saved = JSON.parse(localStorage.getItem('savedItems')) || [];
    if (index >= 0 && index < saved.length) {
        let item = saved.splice(index, 1)[0];
        cart.push(item);
        localStorage.setItem('productsInCart', JSON.stringify(cart));
        localStorage.setItem('savedItems', JSON.stringify(saved));
        if(typeof window.loadCart === 'function') window.loadCart();
        if(typeof window.showToast === 'function') window.showToast('Item moved to cart', 'success');
    }
};

window.removeSavedItem = function(index) {
    let saved = JSON.parse(localStorage.getItem('savedItems')) || [];
    if (index >= 0 && index < saved.length) {
        saved.splice(index, 1);
        localStorage.setItem('savedItems', JSON.stringify(saved));
        if(typeof window.loadSavedItems === 'function') window.loadSavedItems();
        if(typeof window.showToast === 'function') window.showToast('Saved item removed', 'success');
    }
};

window.loadSavedItems = function() {
    let saved = JSON.parse(localStorage.getItem('savedItems')) || [];
    const savedContainer = document.getElementById('saved-items-container');
    const savedSection = document.getElementById('saved-items-section');
    if (!savedContainer || !savedSection) return;

    if (saved.length === 0) {
        savedSection.style.display = 'none';
        return;
    }
    
    savedSection.style.display = 'block';
    savedContainer.innerHTML = '';
    
    saved.forEach((item, index) => {
        const itemPrice = typeof parsePriceString === 'function' ? parsePriceString(item.price) : item.price;
        const formattedPrice = typeof formatCurrency === 'function' ? formatCurrency(itemPrice) : '$' + itemPrice;

        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = \`
            <div class="cart-item-left" style="opacity: 0.8;">
                <div class="cart-item-img-wrap">
                    <img src="\${item.image}" alt="\${item.name}" loading="lazy" />
                </div>
                <div class="cart-item-details">
                    <span class="cart-item-brand">\${item.brand || 'Premium Brand'}</span>
                    <h5 class="cart-item-title">\${item.name}</h5>
                    <span class="cart-item-size">Size: \${item.size}</span>
                </div>
            </div>
            <div class="cart-item-right" style="flex-direction: row; align-items: center; justify-content: space-between;">
                <div class="cart-item-price">\${formattedPrice}</div>
                <div class="cart-item-actions" style="display: flex; gap: 8px;">
                    <button class="cart-item-move" aria-label="Move to cart" onclick="moveToCart(\${index})" title="Move to Cart" style="color: var(--accent); background: none; border: none; font-size: 20px; cursor: pointer;">
                        <i class="ri-shopping-cart-2-line"></i>
                    </button>
                    <button class="cart-item-remove" aria-label="Remove item" onclick="removeSavedItem(\${index})" title="Remove" style="color: var(--text-secondary); background: none; border: none; font-size: 20px; cursor: pointer;">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
        \`;
        savedContainer.appendChild(row);
    });
};

// Initialize loadSavedItems if we are on cart page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('saved-items-container')) {
        if(typeof window.loadSavedItems === 'function') window.loadSavedItems();
    }
});
`;

fs.appendFileSync('app.js', jsCode);
