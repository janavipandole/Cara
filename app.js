// Mobile menu functionality
const bar = document.getElementById("bar");
const nav = document.getElementById("navbar");
const close = document.getElementById("close");

if (bar) {
  bar.addEventListener("click", () => {
    nav.classList.add("active");
  });
}
if (close) {
  close.addEventListener("click", () => {
    nav.classList.remove("active");
  });
}

// Single Product Image Switching
var MainImg = document.getElementById("MainImg");
var smallImg = document.getElementsByClassName("small-img");

if (MainImg) {
    for (let i = 0; i < smallImg.length; i++) {
        smallImg[i].onclick = function () {
            MainImg.src = smallImg[i].src;
        }
    }
}

/* --- START: CART FUNCTIONALITY --- */

function addToCart(productName, productPrice, productImage, quantity, size) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    let item = {
        name: productName,
        price: parseFloat(productPrice.replace('$', '')),
        image: productImage,
        quantity: parseInt(quantity),
        size: size
    };

    let existingItem = cart.find(p => p.name === item.name && p.size === item.size);

    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        cart.push(item);
    }

    localStorage.setItem('productsInCart', JSON.stringify(cart));
    alert(`${item.name} (Size: ${item.size}) added to cart!`);
}

window.handleAddToCart = function() {
    const nameElement = document.getElementById('product-name');
    const priceElement = document.getElementById('product-price');
    const sizeSelect = document.getElementById('product-size');
    const quantityInput = document.getElementById('product-quantity');
    const imageElement = document.getElementById('MainImg');

    if (!nameElement || !priceElement || !sizeSelect || !quantityInput || !imageElement) {
        console.error("Missing product elements on page.");
        return;
    }

    const name = nameElement.innerText;
    const price = priceElement.innerText;
    const size = sizeSelect.value;
    const quantity = parseInt(quantityInput.value);
    const image = imageElement.src;

    if (size === 'Select Size' || size === "") {
        alert('Please select a size before adding to cart.');
        return;
    }
    if (quantity < 1 || isNaN(quantity)) {
         alert('Please enter a valid quantity.');
         return;
    }

    addToCart(name, price, image, quantity, size);
}

window.loadCart = function() {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    const tableBody = document.querySelector('#cart table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemPrice = item.price;
        const subtotal = itemPrice * item.quantity;
        total += subtotal;

        const newRow = tableBody.insertRow();

        newRow.insertCell().innerHTML = `<a href="#" onclick="removeItem(${index}); return false;"><i class="fa-regular fa-circle-xmark"></i></a>`;
        newRow.insertCell().innerHTML = `<img src="${item.image}" alt="${item.name}">`;
        newRow.insertCell().innerHTML = `${item.name}<br><small>Size: ${item.size}</small>`;
        newRow.insertCell().innerHTML = `$${itemPrice.toFixed(2)}`;
        newRow.insertCell().innerHTML = `<input id="qty-${index}" type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">`;
        newRow.insertCell().innerHTML = `$${subtotal.toFixed(2)}`;
    });

    const subtotalCell = document.querySelector('.subtotal table tr:nth-child(1) td:nth-child(2)');
    const totalCell = document.querySelector('.subtotal table tr:nth-child(3) td:nth-child(2) strong');

    if (subtotalCell) subtotalCell.innerText = `$ ${total.toFixed(2)}`;
    if (totalCell) totalCell.innerText = `$ ${total.toFixed(2)}`;
    
    if (cart.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Your cart is empty.</td></tr>';
    }
}

window.removeItem = function(index) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('productsInCart', JSON.stringify(cart));
    loadCart();
}

window.updateQuantity = function(index, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    newQuantity = parseInt(newQuantity);
    
    if (newQuantity < 1 || isNaN(newQuantity)) {
        newQuantity = 1;
        document.getElementById(`qty-${index}`).value = 1;
    }
    
    cart[index].quantity = newQuantity;
    localStorage.setItem('productsInCart', JSON.stringify(cart));
    loadCart();
}

window.addEventListener('load', () => {
    const cartElement = document.getElementById('cart');
    if (cartElement) {
        loadCart();
    }
});

/* --- END: CART FUNCTIONALITY --- */

/* --- START: THEME TOGGLE FUNCTIONALITY --- */

(function() {
    console.log('Theme script starting...');
    
    function initTheme() {
        console.log('Initializing theme...');
        
        const themeToggle = document.getElementById('themeToggle');
        const themeToggleMobile = document.getElementById('themeToggleMobile');
        const themeIcon = document.getElementById('themeIcon');
        const themeIconMobile = document.getElementById('themeIconMobile');
        const html = document.documentElement;

        console.log('Elements found:', {
            themeToggle: !!themeToggle,
            themeToggleMobile: !!themeToggleMobile,
            themeIcon: !!themeIcon,
            themeIconMobile: !!themeIconMobile
        });

        // Check for saved theme preference
        const currentTheme = localStorage.getItem('theme') || 'light';
        console.log('Current theme:', currentTheme);
        
        html.setAttribute('data-theme', currentTheme);
        updateThemeIcon(currentTheme);

        function updateThemeIcon(theme) {
            console.log('Updating icons to:', theme);
            const iconClass = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
            if (themeIcon) themeIcon.className = iconClass;
            if (themeIconMobile) themeIconMobile.className = iconClass;
        }

        function toggleTheme() {
            console.log('Toggle clicked!');
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            console.log('Switching from', currentTheme, 'to', newTheme);
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
            console.log('Desktop toggle listener added');
        }
        if (themeToggleMobile) {
            themeToggleMobile.addEventListener('click', toggleTheme);
            console.log('Mobile toggle listener added');
        }
    }

    // Try multiple ways to ensure the script runs
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();

/* --- END: THEME TOGGLE FUNCTIONALITY --- */