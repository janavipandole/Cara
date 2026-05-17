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

// buttons ripple effect
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("button.normal, button.white");

  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.classList.add("ripple-effect");
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      this.appendChild(ripple);

      ripple.addEventListener("animationend", () => {
        ripple.remove();
      });
    });
  });
});

/* --- START: CART FUNCTIONALITY --- */

function handleEmptyCartView() {
    const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    const contentWrapper = document.getElementById('cart-content-wrapper');
    const emptyContainer = document.getElementById('empty-cart-container');

    if (window.location.pathname.includes('cart.html')) {
        if (cart.length === 0) {
            if (contentWrapper) contentWrapper.style.display = 'none';
            if (emptyContainer) emptyContainer.style.display = 'block';
        } else {
            if (contentWrapper) contentWrapper.style.display = 'block';
            if (emptyContainer) emptyContainer.style.display = 'none';
        }
    }
}

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
    showToast(`${item.name} (Size: ${item.size}) added to cart!`);
}

function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const icon = document.getElementById('toast-icon');
    icon.textContent = isError ? '⚠️' : '✅';
    document.getElementById('toast-msg').textContent = msg;
    toast.style.background = isError ? '#dc2626' : '#1e293b';
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

window.handleAddToCart = function () {
    const nameElement = document.getElementById('product-name');
    const priceElement = document.getElementById('product-price');
    const sizeSelect = document.getElementById('product-size');
    const quantityInput = document.getElementById('product-quantity');
    const imageElement = document.getElementById('MainImg');

    if (!nameElement || !priceElement || !sizeSelect || !quantityInput || !imageElement) {
        return;
    }

    const name = nameElement.innerText;
    const price = priceElement.innerText;
    const size = sizeSelect.value;
    const quantity = parseInt(quantityInput.value);
    const image = imageElement.src;

    if (size === 'Select Size' || size === "") {
        showToast('Please select a size before adding to cart!', true);
        return;
    }
    if (quantity < 1 || isNaN(quantity)) {
        showToast('Please enter a valid quantity.',true);
        return;
    }

    addToCart(name, price, image, quantity, size);
}

window.loadCart = function () {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    handleEmptyCartView();

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

    // Unified IDs for subtotal and final total
    const subtotalDisplay = document.getElementById('cart-subtotal');
    const finalTotalDisplay = document.getElementById('final-total');

    if (subtotalDisplay) subtotalDisplay.innerText = `$${total.toFixed(2)}`;
    if (finalTotalDisplay) finalTotalDisplay.innerText = `$${total.toFixed(2)}`;
}

window.removeItem = function (index) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('productsInCart', JSON.stringify(cart));
    loadCart();
}

window.updateQuantity = function (index, newQuantity) {
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

// Function to apply the coupon discount
window.applyCoupon = function() {
    const couponInput = document.getElementById('coupon-code');
    const couponMsg = document.getElementById('coupon-msg');
    const finalTotalElement = document.getElementById('final-total');
    const subtotalElement = document.getElementById('cart-subtotal');

    if (!subtotalElement) return;

    let subtotal = parseFloat(subtotalElement.innerText.replace('$', ''));

    if (isNaN(subtotal) || subtotal <= 0) {
        couponMsg.innerText = "Add items to your cart first!";
        couponMsg.style.color = "red";
        return;
    }

    if (couponInput.value.trim().toUpperCase() === "OFFER70") {
        const discount = subtotal * 0.70;
        const newTotal = subtotal - discount;

        finalTotalElement.innerHTML = `
            <span style="text-decoration: line-through; color: #999; font-size: 0.8em; margin-right: 8px;">
                $${subtotal.toFixed(2)}
            </span> 
            $${newTotal.toFixed(2)}
        `;
        
        couponMsg.innerText = "Success! 70% discount applied.";
        couponMsg.style.color = "#088178";
        couponInput.disabled = true; 
    } else {
        couponMsg.innerText = "Invalid code. Try 'OFFER70'";
        couponMsg.style.color = "red";
    }
}

window.addEventListener('load', () => {
    const cartElement = document.getElementById('cart');
    if (cartElement) {
        loadCart();
    }
});

/* --- END: CART FUNCTIONALITY --- */

/* --- START: THEME TOGGLE FUNCTIONALITY --- */

(function () {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    function updateThemeIcon(theme) {
        const iconClass = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
        if (themeIcon) themeIcon.className = iconClass;
    }

    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }

    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
})();

/* --- END: THEME TOGGLE FUNCTIONALITY --- */

/* --- START: PAGINATION --- */
(function() {
    const paginationSection = document.getElementById('pagination');
    if (!paginationSection) return;

    const productsPerPage = 16; 
    const productSection = document.getElementById('product1');
    if (!productSection) return;

    const productContainers = Array.from(productSection.querySelectorAll('.pro-container'));
    let allProducts = [];
    productContainers.forEach(container => {
        allProducts = allProducts.concat(Array.from(container.querySelectorAll('.pro')));
    });

    if (allProducts.length === 0) return;

    let totalPages = Math.ceil(allProducts.length / productsPerPage);

    function showPage(pageNumber) {
        allProducts.forEach(product => product.style.display = 'none');
        const startIndex = (pageNumber - 1) * productsPerPage;
        const productsToShow = allProducts.slice(startIndex, startIndex + productsPerPage);
        
        const firstContainer = productContainers[0];
        firstContainer.innerHTML = '';
        firstContainer.style.display = 'flex';
        
        productsToShow.forEach(product => {
            product.style.display = 'block';
            firstContainer.appendChild(product);
        });

        updatePaginationUI(pageNumber);
    }

    function updatePaginationUI(activePage) {
        paginationSection.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            if (i === activePage) pageLink.classList.add('active');
            pageLink.onclick = (e) => { e.preventDefault(); showPage(i); };
            paginationSection.appendChild(pageLink);
        }
    }
    showPage(1);
})();

// Back to Top and Top to Bottom
const backToTopBtn = document.getElementById("backToTop");
if(backToTopBtn) {
    window.addEventListener("scroll", () => {
        window.scrollY > 100 ? backToTopBtn.classList.add("show") : backToTopBtn.classList.remove("show");
    });
    backToTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

// Quiz
window.openQuiz = () => document.getElementById('quiz-modal').style.display = 'flex';
window.closeQuiz = () => document.getElementById('quiz-modal').style.display = 'none';
window.selectStyle = (style) => {
    window.closeQuiz();
    document.querySelectorAll('.pro').forEach(p => {
        p.style.display = p.getAttribute('data-category') === style ? 'block' : 'none';
    });
};