// Mobile menu functionality using event delegation
document.addEventListener("click", (e) => {
    const bar = e.target.closest("#bar");
    const close = e.target.closest("#close");

    if (bar) {
        const nav = document.getElementById("navbar");
        if (nav) {
            nav.classList.add("active");
        }
    }

    if (close) {
        const nav = document.getElementById("navbar");
        if (nav) {
            nav.classList.remove("active");
        }
        e.preventDefault();
    }
});

// Dynamic Product Details Logic
// Global capturing click listener for all product cards (static and dynamic)
document.addEventListener("click", function (e) {
    const proCard = e.target.closest(".pro");
    if (!proCard) return;

    // Ignore clicks on cart icon or buy now button inside the card
    if (e.target.closest(".cart") || e.target.closest(".buy-now-btn")) return;

    const nameElement = proCard.querySelector("h5");
    const priceElement = proCard.querySelector("h4");
    const brandElement = proCard.querySelector(".des span");
    const imageElement = proCard.querySelector("img");

    const selectedProduct = {
        name: nameElement ? nameElement.textContent.trim() : "Product",
        price: priceElement ? priceElement.textContent.trim() : "$0.00",
        brand: brandElement ? brandElement.textContent.trim() : "Brand",
        image: imageElement ? imageElement.src : ""
    };

    localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
    window.location.href = "singleProduct.html";
}, true);

// Dynamic Render on singleProduct.html
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("singleProduct")) {
        console.log("On singleProduct page, attempting dynamic render.");
        const storedProductJSON = localStorage.getItem("selectedProduct");
        console.log("Stored product JSON:", storedProductJSON);
        
        if (storedProductJSON) {
            try {
                const product = JSON.parse(storedProductJSON);
                console.log("Parsed product:", product);

                const nameEl = document.getElementById("product-name");
                const priceEl = document.getElementById("product-price");
                const mainImgEl = document.getElementById("MainImg");
                const breadcrumbEl = document.querySelector(".single-pro-details h6");
                const smallImgs = document.querySelectorAll(".small-img");

                if (nameEl) nameEl.textContent = product.name;
                if (priceEl) priceEl.textContent = product.price;
                if (mainImgEl) mainImgEl.src = product.image;

                if (breadcrumbEl && product.brand) {
                    // Dynamically determine product type from name (e.g. Trousers, Shorts, Shirt)
                    let productType = "T-Shirt";
                    if (product.name.toLowerCase().includes("trousers")) productType = "Trousers";
                    else if (product.name.toLowerCase().includes("shorts")) productType = "Shorts";
                    else if (product.name.toLowerCase().includes("blouse")) productType = "Blouse";
                    else if (product.name.toLowerCase().includes("shirt")) productType = "Shirt";

                    breadcrumbEl.textContent = `Home / ${product.brand} / ${productType}`;
                }

                // Update first thumbnail to match the product image
                if (smallImgs.length > 0 && product.image) {
                    smallImgs[0].src = product.image;
                }
            } catch (error) {
                console.error("Error parsing stored product:", error);
            }
        }

        // Single Product Image Switching for thumbnails
        const MainImg = document.getElementById("MainImg");
        const smallImg = document.getElementsByClassName("small-img");
        if (MainImg && smallImg) {
            for (let i = 0; i < smallImg.length; i++) {
                smallImg[i].onclick = function () {
                    MainImg.src = smallImg[i].src;
                }
            }
        }
    }
});

// buttons ripple effect
document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll("button.normal, button.white");

    buttons.forEach((button) => {
        button.addEventListener("click", function (e) {

            const rect = this.getBoundingClientRect();

            // Calculate coordinates relative to the button
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Create the ripple element
            const ripple = document.createElement("span");
            ripple.classList.add("ripple-effect");

            // Set position
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            // Append to the button
            this.appendChild(ripple);

            // Remove the ripple element after the animation finishes to keep the DOM clean
            ripple.addEventListener("animationend", () => {
                ripple.remove();
            });
        });
    });
});

/* --- START: CART FUNCTIONALITY --- */

// Robust price parser: strips all currency symbols, commas, HTML entities, and whitespace
function parsePriceString(priceStr) {
    if (typeof priceStr === 'number') return isFinite(priceStr) ? priceStr : 0;
    if (!priceStr) return 0;
    // Remove ₹, $, commas, whitespace, and HTML entities like &#8377;
    var cleaned = String(priceStr).replace(/[₹$,\s]/g, '').replace(/&#?\w+;/g, '');
    var num = parseFloat(cleaned);
    return isFinite(num) ? num : 0;
}

// Consistent currency formatter
function formatCurrency(amount) {
    var num = typeof amount === 'number' ? amount : parsePriceString(amount);
    if (!isFinite(num)) num = 0;
    return '₹' + Math.round(num).toLocaleString('en-IN');
}

// Update cart count badge
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const desktopCount = document.getElementById('desktopCartCount');
    const mobileCount = document.getElementById('mobileCartCount');

    if (desktopCount) {
        desktopCount.textContent = totalItems;
        desktopCount.classList.toggle('hidden', totalItems === 0);
    }

    if (mobileCount) {
        mobileCount.textContent = totalItems;
        mobileCount.classList.toggle('hidden', totalItems === 0);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', updateCartCount);

// NEW: Function to toggle visibility of empty cart message
function handleEmptyCartView() {
    const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    const cartGrid = document.getElementById('cart-container');
    const emptyContainer = document.getElementById('empty-cart-container');

    if (window.location.pathname.includes('cart.html')) {
        if (cart.length === 0) {
            if (cartGrid) cartGrid.style.display = 'none';
            if (emptyContainer) emptyContainer.style.display = 'flex';
        } else {
            if (cartGrid) cartGrid.style.display = 'block';
            if (emptyContainer) emptyContainer.style.display = 'none';
        }
    }
}

function addToCart(productName, productPrice, productImage, quantity, size) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    let parsedQty = parseInt(quantity);
    if (isNaN(parsedQty) || parsedQty < 1) parsedQty = 1;
    let item = {
        name: productName,
        price: parsePriceString(productPrice),
        image: productImage,
        quantity: parsedQty,
        size: size.replace('Size ', '')
    };

    let existingItem = cart.find(p => p.name === item.name && p.size === item.size);

    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        cart.push(item);
    }

    localStorage.setItem('productsInCart', JSON.stringify(cart));
    showToast(`${item.name} (Size: ${item.size}) added to cart!`);
    updateCartCount(); // Update badge
}

function showToast(message, type) {
    type = type || 'success';
    // Ensure container exists (create if needed)
    var container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Icon map
    var icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    // Build toast element
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML =
        '<i class="fa-solid ' + (icons[type] || icons.success) + ' toast-icon"></i>' +
        '<span class="toast-msg">' + message + '</span>' +
        '<button class="toast-close" aria-label="Close notification">&times;</button>' +
        '<div class="toast-progress"></div>';

    // Close button handler
    toast.querySelector('.toast-close').addEventListener('click', function() {
        dismissToast(toast);
    });

    container.appendChild(toast);

    // Auto dismiss after 4 seconds
    setTimeout(function() { dismissToast(toast); }, 4000);
}

function dismissToast(toast) {
    if (!toast || toast.classList.contains('toast-hiding')) return;
    toast.classList.add('toast-hiding');
    toast.addEventListener('animationend', function() { toast.remove(); });
}

window.updateQty = function (change) {
    const qtyInput = document.getElementById('product-quantity');
    if (qtyInput) {
        let currentValue = parseInt(qtyInput.value);
        if (isNaN(currentValue)) currentValue = 1;
        let newValue = currentValue + change;
        if (newValue < 1) newValue = 1;
        qtyInput.value = newValue;
    }
}

window.handleAddToCart = function () {
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
        showToast('Please select a size before adding to cart!', 'warning');
        return;
    }
    if (quantity < 1 || isNaN(quantity)) {
        showToast('Please enter a valid quantity.', 'warning');
        return;
    }

    addToCart(name, price, image, quantity, size);
    updateCartCount(); // Update badge
}

window.appliedCoupon = localStorage.getItem('appliedCoupon') || null;

window.loadCart = function () {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];

    handleEmptyCartView();
    if (typeof window.loadSavedItems === 'function') window.loadSavedItems();

    const itemsContainer = document.getElementById('cart-items-container');
    if (!itemsContainer) return;

    itemsContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        // Ensure price is a valid number (defensive: localStorage may have string or NaN)
        const itemPrice = parsePriceString(item.price);
        const itemQty = parseInt(item.quantity) || 1;
        const itemSubtotal = itemPrice * itemQty;
        subtotal += itemSubtotal;

        // Modern Card Grid Row (Flexbox responsive card)
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <div class="cart-item-left">
                <div class="cart-item-img-wrap">
                    <img src="${item.image}" alt="${item.name}" />
                </div>
                <div class="cart-item-details">
                    <span class="cart-item-brand">${item.brand || 'Premium Brand'}</span>
                    <h5 class="cart-item-title">${item.name}</h5>
                    <span class="cart-item-size">Size: ${item.size}</span>
                </div>
            </div>
            <div class="cart-item-right">
                <div class="cart-item-price">${formatCurrency(itemPrice)}</div>
                <div class="qty-selector">
                    <button class="qty-btn minus" aria-label="Decrease quantity" onclick="event.stopPropagation(); changeQuantity(${index}, -1)">
                        <i class="ri-subtract-line"></i>
                    </button>
                    <input type="number" class="qty-input" value="${itemQty}" readonly />
                    <button class="qty-btn plus" aria-label="Increase quantity" onclick="event.stopPropagation(); changeQuantity(${index}, 1)">
                        <i class="ri-add-line"></i>
                    </button>
                </div>
                <div class="cart-item-subtotal">${formatCurrency(itemSubtotal)}</div>
                <div class="cart-item-actions" style="display: flex; gap: 8px;">
                    <button class="cart-item-save" aria-label="Save for later" onclick="event.stopPropagation(); saveForLater(${index})" title="Save for Later" style="color: var(--text-secondary); background: none; border: none; font-size: 20px; cursor: pointer;">
                        <i class="ri-bookmark-line"></i>
                    </button>
                    <button class="cart-item-remove" aria-label="Remove item" onclick="event.stopPropagation(); removeItem(${index})" title="Remove">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
        `;
        itemsContainer.appendChild(row);
    });

    // Update Summary Breakdowns
    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const shippingEl = document.getElementById('summary-shipping');
    const discountRow = document.getElementById('summary-discount-row');
    const discountEl = document.getElementById('summary-discount');
    const totalEl = document.getElementById('summary-total');

        // REMOVE BUTTON
        const removeCell = newRow.insertCell();
        const removeLink = document.createElement('a');
        removeLink.href = '#';
        removeLink.addEventListener('click', (e) => {
            e.preventDefault();
            removeItem(index);
        });
        const removeIcon = document.createElement('i');
        removeIcon.className = 'fa-regular fa-circle-xmark';
        removeLink.appendChild(removeIcon);
        removeCell.appendChild(removeLink);

        // IMAGE
        const imgCell = newRow.insertCell();
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        imgCell.appendChild(img);

        // NAME
        const nameCell = newRow.insertCell();
        nameCell.textContent = item.name;

        const sizeSmall = document.createElement('small');
        sizeSmall.textContent = 'Size: ' + item.size;
        nameCell.appendChild(document.createElement('br'));
        nameCell.appendChild(sizeSmall);

        // PRICE
        const priceCell = newRow.insertCell();
        priceCell.textContent = '$' + itemPrice.toFixed(2);

        // QTY
        const qtyCell = newRow.insertCell();
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.value = item.quantity;
        qtyInput.min = 1;
        qtyInput.addEventListener('change', function () {
            updateQuantity(index, this.value);
        });
        qtyCell.appendChild(qtyInput);

        // SUBTOTAL
        const subtotalCell = newRow.insertCell();
        subtotalCell.textContent = '$' + subtotal.toFixed(2);
    };

    // ✅ TOTAL UPDATE MUST BE HERE (INSIDE FUNCTION, AFTER LOOP)
   const subtotalDisplay = document.querySelector('.subtotal table tr:nth-child(1) td:nth-child(2)');
 const totalDisplay = document.querySelector('.subtotal table tr:nth-child(3) td:nth-child(2) strong');


window.removeItem = function (index) {
    if (subtotalEl) {
        subtotalEl.innerText = formatCurrency(subtotal);
    }

    // Shipping calculations (free above 3000)
    let shipping = 0;
    if (subtotal > 0) {
        shipping = subtotal >= 3000 ? 0 : 150;
    }
    if (shippingEl) {
        shippingEl.innerText = shipping === 0 ? 'FREE' : formatCurrency(shipping);
        if (shipping === 0 && subtotal > 0) {
            shippingEl.classList.add('shipping-free');
        } else {
            shippingEl.classList.remove('shipping-free');
        }
    }

    // 18% tax calculation
    const tax = Math.round(subtotal * 0.18);
    if (taxEl) {
        taxEl.innerText = formatCurrency(tax);
    }

    // Coupon / Discount calculation
    let discount = 0;
    if (window.appliedCoupon === 'CARA20' && subtotal > 0) {
        discount = Math.round(subtotal * 0.20);
    } else if (window.appliedCoupon === 'WELCOME10' && subtotal > 0) {
        discount = Math.round(subtotal * 0.10);
    }

    if (discountRow && discountEl) {
        if (discount > 0) {
            discountRow.style.display = 'flex';
            discountEl.innerText = '-' + formatCurrency(discount);
        } else {
            discountRow.style.display = 'none';
        }
    }

    // Grand total calculation
    const grandTotal = Math.max(0, subtotal + tax + shipping - discount);
    if (totalEl) {
        totalEl.innerText = formatCurrency(grandTotal);
    }

    // Update promo input field state
    const promoInput = document.getElementById('coupon-code');
    const promoBtn = document.getElementById('apply-coupon-btn');
    if (promoInput && promoBtn) {
        if (window.appliedCoupon) {
            promoInput.value = window.appliedCoupon;
            promoInput.disabled = true;
            promoBtn.innerText = 'Applied';
            promoBtn.disabled = true;
            promoBtn.classList.add('applied');
        } else {
            promoInput.value = '';
            promoInput.disabled = false;
            promoBtn.innerText = 'Apply';
            promoBtn.disabled = false;
            promoBtn.classList.remove('applied');
        }
    }
}

window.changeQuantity = function (index, change) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    if (!cart[index]) return;

    let newQty = cart[index].quantity + change;
    if (newQty < 1) newQty = 1;

    cart[index].quantity = newQty;
    localStorage.setItem('productsInCart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

window.applyCoupon = function () {
    const promoInput = document.getElementById('coupon-code');
    if (!promoInput) return;

    const code = promoInput.value.trim().toUpperCase();
    if (code === 'CARA20') {
        window.appliedCoupon = 'CARA20';
        localStorage.setItem('appliedCoupon', 'CARA20');
        showToast('CARA20 promo code applied! 20% discount added.', 'success');
        loadCart();
    } else if (code === 'WELCOME10') {
        window.appliedCoupon = 'WELCOME10';
        localStorage.setItem('appliedCoupon', 'WELCOME10');
        showToast('WELCOME10 promo code applied! 10% discount added.', 'success');
        loadCart();
    } else if (code === '') {
        showToast('Please enter a coupon code.', 'warning');
    } else {
        showToast('Invalid promo code. Try CARA20 for 20% off!', 'error');
    }
}

window.removeItem = function (index) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    const removedName = cart[index] ? cart[index].name : 'Item';
    cart.splice(index, 1);
    localStorage.setItem('productsInCart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
    showToast(`${removedName} removed from cart`, 'error');
}

document.addEventListener('DOMContentLoaded', () => {
    // Watch for click events on elements dynamically or directly
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'apply-coupon-btn') {
            applyCoupon();
        }
    });

    const cartElement = document.getElementById('cart-items-container');
    if (cartElement) {
        loadCart();
    }
});

/* --- END: CART FUNCTIONALITY --- */

/* --- START: THEME TOGGLE FUNCTIONALITY --- */

(function () {
    const html = document.documentElement;

    // Apply saved theme on load
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }

    // Run dynamic icon and logo updates
    setTimeout(() => {
        updateThemeIcon(currentTheme);
    }, 0);

    function updateThemeIcon(theme) {
        const iconClass = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
        
        // Find elements dynamically since they could be injected after this runs
        const themeIcon = document.getElementById('themeIcon');
        const themeIconMobile = document.getElementById('themeIconMobile');
        
        if (themeIcon) themeIcon.className = iconClass;
        if (themeIconMobile) themeIconMobile.className = iconClass;

        // Swap logo based on theme
        const siteLogo = document.getElementById('siteLogo');
        if (siteLogo) {
            siteLogo.src = theme === 'dark' ? 'images/Dlogo.png' : 'images/logo.png';
        }
    }

    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        if (newTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }

    // Event Delegation: Automatically listens to clicks on static AND dynamic buttons!
    document.addEventListener('click', (e) => {
        if (e.target && (e.target.closest('#themeToggle') || e.target.closest('#themeToggleMobile'))) {
            e.preventDefault();
            toggleTheme();
        }
    });

    // Watch for dynamic navbar insertions (MutationObserver) to instantly apply correct icon and logo styles
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => {
            const activeTheme = html.getAttribute('data-theme') || 'light';
            updateThemeIcon(activeTheme);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const activeTheme = html.getAttribute('data-theme') || 'light';
        updateThemeIcon(activeTheme);
    });
})();

/* --- END: THEME TOGGLE FUNCTIONALITY --- */

(function () {
    const paginationSection = document.getElementById('pagination');
    if (!paginationSection) return;

    const productsPerPage = 16;
    const productSection = document.getElementById('product1');
    if (!productSection) return;

    const productContainers = Array.from(productSection.querySelectorAll('.pro-container'));

    let allProducts = [];
    productContainers.forEach(container => {
        const products = Array.from(container.querySelectorAll('.pro'));
        allProducts = allProducts.concat(products);
    });

    if (allProducts.length === 0) return;

    let currentPage = 1;
    const totalPages = Math.ceil(allProducts.length / productsPerPage);

    if (productContainers.length > 1) {
        productContainers.forEach((container, index) => {
            if (index > 0) {
                container.style.display = 'none';
            }
        });
    }

    function showPage(pageNumber) {
        allProducts.forEach(product => {
            product.style.display = 'none';
        });

        const startIndex = (pageNumber - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;

        const productsToShow = allProducts.slice(startIndex, endIndex);

        const firstContainer = productContainers[0];
        firstContainer.innerHTML = '';
        firstContainer.style.display = 'flex';

        productsToShow.forEach(product => {
            product.style.display = 'block';
            firstContainer.appendChild(product);
        });

        productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        updatePaginationUI(pageNumber);
        currentPage = pageNumber;
    }

    function updatePaginationUI(activePage) {
        paginationSection.innerHTML = '';

        const prevArrow = document.createElement('a');
        prevArrow.href = '#';
        prevArrow.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
        prevArrow.classList.add('pagination-arrow');
        if (activePage === 1) {
            prevArrow.classList.add('disabled');
        }
        prevArrow.addEventListener('click', (e) => {
            e.preventDefault();
            if (activePage > 1) {
                showPage(activePage - 1);
            }
        });
        paginationSection.appendChild(prevArrow);

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            if (i === activePage) {
                pageLink.classList.add('active');
            }
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(i);
            });
            paginationSection.appendChild(pageLink);
        }

        const nextArrow = document.createElement('a');
        nextArrow.href = '#';
        nextArrow.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
        nextArrow.classList.add('pagination-arrow');
        if (activePage === totalPages) {
            nextArrow.classList.add('disabled');
        }
        nextArrow.addEventListener('click', (e) => {
            e.preventDefault();
            if (activePage < totalPages) {
                showPage(activePage + 1);
            }
        });
        paginationSection.appendChild(nextArrow);
    }

    showPage(1);
})();

// Back to Top Button Logic
const backToTopBtn = document.getElementById("backToTop");
const ToptobackBtn = document.getElementById("Toptoback");

if (backToTopBtn && ToptobackBtn) {
    window.addEventListener("scroll", () => {

    if (!backToTopBtn || !ToptobackBtn) return;

    if (window.scrollY <= 300) {
        ToptobackBtn.classList.add("show");
        backToTopBtn.classList.remove("show");
    } else {
        backToTopBtn.classList.add("show");
        ToptobackBtn.classList.remove("show");
    }
});

// BACK TO TOP
if (backToTopBtn) {
        // SHOW DOWN BUTTON WHEN USER IS NEAR TOP
        if (window.scrollY <= 300) {
            ToptobackBtn.classList.add("show");
            backToTopBtn.classList.remove("show");
        }

        // SHOW TOP BUTTON AFTER 300PX
        else {
            backToTopBtn.classList.add("show");
            ToptobackBtn.classList.remove("show");
        }
    };

    // BACK TO TOP
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// SCROLL TO BOTTOM
if (ToptobackBtn) {

    // SCROLL TO BOTTOM
    ToptobackBtn.addEventListener("click", () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    });
}

// Style Quiz Functionality
window.openQuiz = function () {
    document.getElementById('quiz-modal').style.display = 'flex';
}

window.closeQuiz = function () {
    document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('quiz-modal').style.display = 'none';
});
}

window.selectStyle = function (style) {
    closeQuiz();
    const products = document.querySelectorAll('.pro');
    products.forEach(product => {
        if (product.getAttribute('data-category') === style) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
        // Auto scroll to products section
    const productSection = document.getElementById('product1');

    if (productSection) {
        productSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    alert(`Showing ${style} style recommendations!`);
}

/* --- START: BUY NOW FUNCTIONALITY --- */
window.buyNow = function (productName, productPrice, productImage, quantity, size) {
    // Add to cart first
    addToCart(productName, productPrice, productImage, quantity, size);
    // Brief delay so user sees the toast before redirect
    setTimeout(function() {
        window.location.href = 'checkout.html';
    }, 1500);
}

/* --- START: SEARCH AND FILTER FUNCTIONALITY --- */
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        // Debounce helper to prevent input lag
        function debounce(func, delay) {
            let timeoutId;
            return function (...args) {
                if (timeoutId) clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        }

        // Unified search and category filtering
        const performSearch = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
            const products = document.querySelectorAll('.pro');
            let visibleCount = 0;
            
            products.forEach(product => {
                const productName = product.querySelector('h5')?.textContent.toLowerCase() || '';
                const productBrand = product.querySelector('.des span')?.textContent.toLowerCase() || '';
                const productCategory = product.getAttribute('data-category') || '';
                
                const matchesSearch = searchTerm === '' || productName.includes(searchTerm) || productBrand.includes(searchTerm);
                const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory;
                
                if (matchesSearch && matchesCategory) {
                    product.style.display = 'block';
                    visibleCount++;
                } else {
                    product.style.display = 'none';
                }
            });

            // Handle "No matching products found" UI
            let noResultsMsg = document.getElementById('no-results-message');
            if (visibleCount === 0) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.id = 'no-results-message';
                    noResultsMsg.innerHTML = `
                        <div class="no-results-content">
                            <i class="ri-search-line"></i>
                            <h3>No matching products found</h3>
                            <p>We couldn't find any products matching "${searchInput.value}". Please try a different search term or change your category filter.</p>
                        </div>
                    `;
                    const container = document.getElementById('shop-container');
                    if (container) {
                        container.appendChild(noResultsMsg);
                    }
                } else {
                    noResultsMsg.querySelector('p').textContent = `We couldn't find any products matching "${searchInput.value}". Please try a different search term or change your category filter.`;
                    noResultsMsg.style.display = 'block';
                }
            } else {
                if (noResultsMsg) {
                    noResultsMsg.style.display = 'none';
                }
            }
        };

        // Event listeners for real-time search
        searchInput.addEventListener('input', debounce(performSearch, 150));
        
        // Immediate check on Enter key or Search button click
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Trigger search when category changes to respect the category filter
        if (categoryFilter) {
            categoryFilter.addEventListener('change', performSearch);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const brandCard = document.getElementById('brandCard');
    const cardContainer = document.getElementById('cardContainer');
    const statusText = document.getElementById('statusText');
    const featureSection = document.getElementById('interactive-feature-wrapper');

    // 1. Manual Click Control
    if (brandCard && cardContainer) {
        brandCard.addEventListener('click', () => {
            const isOpen = cardContainer.classList.toggle('open');
            statusText.innerText = isOpen ? "Click to collapse" : "Click to expand";
        });
    }

    // 2. Infinite Scroll-Based Activation Engine (Triggers every time)
    if (featureSection && cardContainer) {
        const observerOptions = {
            root: null,
            threshold: 0,
            rootMargin: "0px 0px -10% 0px" 
        };

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cardContainer.classList.add('open');
                
                    if (statusText) {
                        statusText.innerText = "Click to collapse";
                    }
                
                    // Stop observing after opening once
                    scrollObserver.unobserve(featureSection);
                }
            });
        }, observerOptions);

        // Keep observing continuously without ever disconnecting
        scrollObserver.observe(featureSection);
    }
});

/* --- START: HERO SLIDER FUNCTIONALITY --- */
function initHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    // Null check to prevent errors on pages where the slider doesn't exist
    if (!slider) return;

    const slides = slider.querySelectorAll('.slide');
    const prevBtn = slider.querySelector('.slider-btn.prev');
    const nextBtn = slider.querySelector('.slider-btn.next');
    const dots = slider.querySelectorAll('.slider-dots .dot');

    if (slides.length === 0) return;

    let currentSlide = 0;
    let autoPlayInterval;
    const intervalTime = 5000; // 5 seconds

    function updateSlider() {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to current slide and dot
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlider();
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, intervalTime);
    }

    // Event Listeners for Arrows
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });
    }

    // Event Listeners for Dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateSlider();
            resetAutoPlay();
        });
    });

    // Initialize auto-play
    startAutoPlay();
}

// Resilient initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSlider);
} else {
    initHeroSlider();
}
/* --- END: HERO SLIDER FUNCTIONALITY --- */

/* --- START: CURRENT YEAR FUNCTIONALITY --- */
document.addEventListener('DOMContentLoaded', () => {
    const year = new Date().getFullYear();
    document.querySelectorAll(".Current-Year").forEach(el => {
        el.textContent = year;
    });
});
/* --- END: CURRENT YEAR FUNCTIONALITY --- */
/* --- Sort by Price Logic --- */
document.addEventListener('DOMContentLoaded', () => {
    const sortMenu = document.getElementById('sort-price');
    const proContainer = document.querySelector('.pro-container');

    if (sortMenu && proContainer) {
        const originalProducts = Array.from(proContainer.querySelectorAll('.pro'));
        sortMenu.addEventListener('change', (e) => {
            const sortValue = e.target.value;
            let productsToAppend;

            if (sortValue === 'default') {
                productsToAppend = originalProducts;
            } else {
                productsToAppend = [...originalProducts].sort((a, b) => {
                    const priceA = parseFloat(a.querySelector('h4').innerText.replace('$', '').trim());
                    const priceB = parseFloat(b.querySelector('h4').innerText.replace('$', '').trim());

                    if (sortValue === 'low-high') return priceA - priceB;
                    if (sortValue === 'high-low') return priceB - priceA;
                });
            }
            productsToAppend.forEach(product => {
                proContainer.appendChild(product);
            });
        });
    }
});

/* --- START: ANTI-GRAVITY EFFECT --- */
document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('anti-gravity-active');
            } else {
                entry.target.classList.remove('anti-gravity-active');
            }
        });
    }, { threshold: 0.1 });

    function observeElements() {
        const targets = document.querySelectorAll('.pro:not(.ag-observed), .banner-box:not(.ag-observed)');
        targets.forEach(target => {
            target.classList.add('ag-observed');
            observer.observe(target);
        });
    }

    observeElements();
    
    // Watch for dynamically added products
    const mutationObserver = new MutationObserver(() => {
        observeElements();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
});
/* --- END: ANTI-GRAVITY EFFECT --- */

/* --- START: GRID/LIST VIEW TOGGLE --- */
document.addEventListener("DOMContentLoaded", () => {
    const searchFilterDiv = document.getElementById('search-filter');
    if (searchFilterDiv) {
        // Create toggle button container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'view-toggle-container';
        toggleContainer.innerHTML = `
            <button id="gridViewBtn" class="view-btn active" aria-label="Grid View"><i class="fa-solid fa-border-all"></i></button>
            <button id="listViewBtn" class="view-btn" aria-label="List View"><i class="fa-solid fa-list"></i></button>
        `;
        searchFilterDiv.appendChild(toggleContainer);

        const proContainer = document.querySelector('.pro-container');
        const gridBtn = document.getElementById('gridViewBtn');
        const listBtn = document.getElementById('listViewBtn');

        if (proContainer && gridBtn && listBtn) {
            gridBtn.addEventListener('click', () => {
                proContainer.classList.remove('list-view');
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
            });
            listBtn.addEventListener('click', () => {
                proContainer.classList.add('list-view');
                listBtn.classList.add('active');
                gridBtn.classList.remove('active');
            });
        }
    }
});
/* --- END: GRID/LIST VIEW TOGGLE --- */
// Mobile menu functionality
// Add to Cart function (imported from products.js or defined globally)
window.addToCart =
  window.addToCart ||
  function (name, price, img, quantity, size) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];

    const product = {
      name,
      price,
      img,
      quantity,
      size,
      id: Date.now(),
    };

    cart.push(product);
    localStorage.setItem('productsInCart', JSON.stringify(cart));

    if (typeof showToast === 'function') {
      showToast(name + ' added to cart!', 'success');
    }
  };

// Buy Now function (imported from products.js or defined globally)
window.buyNow =
  window.buyNow ||
  function (name, price, img, quantity, size) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];

    const product = {
      name,
      price,
      img,
      quantity,
      size,
      id: Date.now(),
    };

    cart.push(product);
    localStorage.setItem('productsInCart', JSON.stringify(cart));

    window.location.href = 'checkout.html';
  };

document.addEventListener('click', function (e) {
  // OPEN MENU
  if (e.target.id === 'bar') {
    const nav = document.getElementById('navbar');
    if (nav) {
      nav.classList.add('active');
    }
  }

  // CLOSE MENU
  if (e.target.closest('#close')) {
    e.preventDefault();
    const nav = document.getElementById('navbar');
    if (nav) {
      nav.classList.remove('active');
    }
  }
});

// Dynamic Product Details Logic
// Global capturing click listener for all product cards (static and dynamic)
document.addEventListener(
  'click',
  function (e) {
    const proCard = e.target.closest('.pro');
    if (!proCard) return;

    // Ignore clicks on cart icon or buy now button inside the card
    if (e.target.closest('.cart') || e.target.closest('.buy-now-btn')) return;

    const nameElement = proCard.querySelector('h5');
    const priceElement = proCard.querySelector('h4');
    const brandElement = proCard.querySelector('.des span');
    const imageElement = proCard.querySelector('img');

    const selectedProduct = {
      name: nameElement ? nameElement.textContent.trim() : 'Product',
      price: priceElement ? priceElement.textContent.trim() : '$0.00',
      brand: brandElement ? brandElement.textContent.trim() : 'Brand',
      image: imageElement ? imageElement.src : '',
    };

    localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
    window.location.href = 'singleProduct.html';
  },
  true
);

// Dynamic Render on singleProduct.html
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('singleProduct')) {
    console.log('On singleProduct page, attempting dynamic render.');
    const storedProductJSON = localStorage.getItem('selectedProduct');
    console.log('Stored product JSON:', storedProductJSON);

    if (storedProductJSON) {
      try {
        const product = JSON.parse(storedProductJSON);
        console.log('Parsed product:', product);

        const nameEl = document.getElementById('product-name');
        const priceEl = document.getElementById('product-price');
        const mainImgEl = document.getElementById('MainImg');
        const breadcrumbEl = document.querySelector('.single-pro-details h6');
        const smallImgs = document.querySelectorAll('.small-img');

        if (nameEl) nameEl.textContent = product.name;
        if (priceEl) priceEl.textContent = product.price;
        if (mainImgEl) mainImgEl.src = product.image;

        if (breadcrumbEl && product.brand) {
          // Dynamically determine product type from name (e.g. Trousers, Shorts, Shirt)
          let productType = 'T-Shirt';
          if (product.name.toLowerCase().includes('trousers'))
            productType = 'Trousers';
          else if (product.name.toLowerCase().includes('shorts'))
            productType = 'Shorts';
          else if (product.name.toLowerCase().includes('blouse'))
            productType = 'Blouse';
          else if (product.name.toLowerCase().includes('shirt'))
            productType = 'Shirt';

          breadcrumbEl.textContent = `Home / ${product.brand} / ${productType}`;
        }

        // Update first thumbnail to match the product image
        if (smallImgs.length > 0 && product.image) {
          smallImgs[0].src = product.image;
        }
      } catch (error) {
        console.error('Error parsing stored product:', error);
      }
    }

    // Single Product Image Switching for thumbnails
    const MainImg = document.getElementById('MainImg');
    const smallImg = document.getElementsByClassName('small-img');
    if (MainImg && smallImg) {
      for (let i = 0; i < smallImg.length; i++) {
        smallImg[i].onclick = function () {
          MainImg.src = smallImg[i].src;
        };
      }
    }
  }
});

// buttons ripple effect
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('button.normal, button.white');

  buttons.forEach((button) => {
    button.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();

      // Calculate coordinates relative to the button
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create the ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');

      // Set position
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      // Append to the button
      this.appendChild(ripple);

      // Remove the ripple element after the animation finishes to keep the DOM clean
      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    });
  });
});

/* --- START: CART FUNCTIONALITY --- */

// Update cart count badge
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const desktopCount = document.getElementById('desktopCartCount');
  const mobileCount = document.getElementById('mobileCartCount');

  if (desktopCount) {
    desktopCount.textContent = totalItems;
    desktopCount.classList.toggle('hidden', totalItems === 0);
  }

  if (mobileCount) {
    mobileCount.textContent = totalItems;
    mobileCount.classList.toggle('hidden', totalItems === 0);
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', updateCartCount);

// NEW: Function to toggle visibility of empty cart message
function handleEmptyCartView() {
  const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  const cartGrid = document.getElementById('cart-container');
  const emptyContainer = document.getElementById('empty-cart-container');

  if (window.location.pathname.includes('cart.html')) {
    if (cart.length === 0) {
      if (cartGrid) cartGrid.style.display = 'none';
      if (emptyContainer) emptyContainer.style.display = 'flex';
    } else {
      if (cartGrid) cartGrid.style.display = 'block';
      if (emptyContainer) emptyContainer.style.display = 'none';
    }
  }
}

function addToCart(productName, productPrice, productImage, quantity, size) {
  let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  let item = {
    name: productName,
    price: parseFloat(productPrice.replace(/[₹$,]/g, '')),
    image: productImage,
    quantity: parseInt(quantity),
    size: size.replace('Size ', ''),
  };

  let existingItem = cart.find(
    (p) => p.name === item.name && p.size === item.size
  );

  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  localStorage.setItem('productsInCart', JSON.stringify(cart));
  showToast(`${item.name} (Size: ${item.size}) added to cart!`);
  updateCartCount(); // Update badge
}

function showToast(message, type) {
  type = type || 'success';
  // Ensure container exists (create if needed)
  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Icon map
  var icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
  };

  // Build toast element
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML =
    '<i class="fa-solid ' +
    (icons[type] || icons.success) +
    ' toast-icon"></i>' +
    '<span class="toast-msg">' +
    message +
    '</span>' +
    '<button class="toast-close" aria-label="Close notification">&times;</button>' +
    '<div class="toast-progress"></div>';

  // Close button handler
  toast.querySelector('.toast-close').addEventListener('click', function () {
    dismissToast(toast);
  });

  container.appendChild(toast);

  // Auto dismiss after 4 seconds
  setTimeout(function () {
    dismissToast(toast);
  }, 4000);
}

function dismissToast(toast) {
  if (!toast || toast.classList.contains('toast-hiding')) return;
  toast.classList.add('toast-hiding');
  toast.addEventListener('animationend', function () {
    toast.remove();
  });
}

window.updateQty = function (change) {
  const qtyInput = document.getElementById('product-quantity');
  if (qtyInput) {
    let currentValue = parseInt(qtyInput.value);
    if (isNaN(currentValue)) currentValue = 1;
    let newValue = currentValue + change;
    if (newValue < 1) newValue = 1;
    qtyInput.value = newValue;
  }
};

window.handleAddToCart = function () {
  const nameElement = document.getElementById('product-name');
  const priceElement = document.getElementById('product-price');
  const sizeSelect = document.getElementById('product-size');
  const quantityInput = document.getElementById('product-quantity');
  const imageElement = document.getElementById('MainImg');

  if (
    !nameElement ||
    !priceElement ||
    !sizeSelect ||
    !quantityInput ||
    !imageElement
  ) {
    console.error('Missing product elements on page.');
    return;
  }

  const name = nameElement.innerText;
  const price = priceElement.innerText;
  const size = sizeSelect.value;
  const quantity = parseInt(quantityInput.value);
  const image = imageElement.src;

  if (size === 'Select Size' || size === '') {
    showToast('Please select a size before adding to cart!', 'warning');
    return;
  }
  if (quantity < 1 || isNaN(quantity)) {
    showToast('Please enter a valid quantity.', 'warning');
    return;
  }

  addToCart(name, price, image, quantity, size);
  updateCartCount(); // Update badge
};

window.handleBuyNow = function () {
  const nameElement = document.getElementById('product-name');
  const priceElement = document.getElementById('product-price');
  const sizeSelect = document.getElementById('product-size');
  const quantityInput = document.getElementById('product-quantity');
  const imageElement = document.getElementById('MainImg');

  if (
    !nameElement ||
    !priceElement ||
    !sizeSelect ||
    !quantityInput ||
    !imageElement
  ) {
    console.error('Missing product elements on page.');
    return;
  }

  const name = nameElement.innerText;
  const price = priceElement.innerText;
  const size = sizeSelect.value;
  const quantity = parseInt(quantityInput.value);
  const image = imageElement.src;

  if (size === 'Select Size' || size === '') {
    showToast('Please select a size before proceeding!', 'warning');
    return;
  }
  if (quantity < 1 || isNaN(quantity)) {
    showToast('Please enter a valid quantity.', 'warning');
    return;
  }

  buyNow(name, price, image, quantity, size);
};

window.appliedCoupon = localStorage.getItem('appliedCoupon') || null;

window.loadCart = function () {
  let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];

  handleEmptyCartView();

  const itemsContainer = document.getElementById('cart-items-container');

  if (!itemsContainer) return;

  itemsContainer.innerHTML = '';

  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemPrice = item.price;
    const itemSubtotal = itemPrice * item.quantity;

    subtotal += itemSubtotal;

    const row = document.createElement('div');

    row.className = 'cart-item-row';

    row.innerHTML = `
      <div class="cart-item-left">

        <div class="cart-item-img-wrap">
          <img src="${item.image}" alt="${item.name}" />
        </div>

        <div class="cart-item-details">

          <span class="cart-item-brand">
            ${item.brand || 'Premium Brand'}
          </span>

          <h5 class="cart-item-title">
            ${item.name}
          </h5>

          <span class="cart-item-size">
            Size: ${item.size}
          </span>

        </div>
      </div>

      <div class="cart-item-right">

        <div class="cart-item-price">
          ₹${itemPrice.toLocaleString('en-IN')}
        </div>

        <div class="qty-selector">

          <button
            class="qty-btn minus"
            aria-label="Decrease quantity"
            onclick="changeQuantity(${index}, -1)"
          >
            <i class="ri-subtract-line"></i>
          </button>

          <input
            type="number"
            class="qty-input"
            value="${item.quantity}"
            readonly
          />

          <button
            class="qty-btn plus"
            aria-label="Increase quantity"
            onclick="changeQuantity(${index}, 1)"
          >
            <i class="ri-add-line"></i>
          </button>

        </div>

        <div class="cart-item-subtotal">
          ₹${itemSubtotal.toLocaleString('en-IN')}
        </div>

        <div class="cart-item-actions" style="display: flex; gap: 8px; justify-content: flex-end; width: 100%;">
          <button
            class="cart-item-save"
            aria-label="Save for later"
            onclick="saveForLater(${index})"
            title="Save for Later"
            style="color: var(--text-secondary); background: none; border: none; font-size: 20px; cursor: pointer;"
          >
            <i class="ri-bookmark-line"></i>
          </button>
          <button
            class="cart-item-remove"
            aria-label="Remove item"
            onclick="removeItem(${index})"
            title="Remove"
          >
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>

      </div>
    `;

    itemsContainer.appendChild(row);
  });

  // SUMMARY ELEMENTS
  // CART TOTALS TABLE UPDATE

const subtotalDisplay = document.querySelector(
  '.subtotal table tr:nth-child(1) td:nth-child(2)'
);

const shippingDisplay = document.querySelector(
  '.subtotal table tr:nth-child(2) td:nth-child(2)'
);

const totalDisplay = document.querySelector(
  '.subtotal table tr:nth-child(3) td:nth-child(2) strong'
);

// SHIPPING
let shipping = 0;

if (subtotal > 0) {
  shipping = subtotal >= 3000 ? 0 : 150;
}

// FINAL TOTAL
const grandTotal = subtotal + shipping;

// UPDATE UI
if (subtotalDisplay) {
  subtotalDisplay.innerText =
    `₹${subtotal.toLocaleString('en-IN')}`;
}

if (shippingDisplay) {
  shippingDisplay.innerText =
    shipping === 0 ? 'Free' : `₹${shipping}`;
}

if (totalDisplay) {
  totalDisplay.innerText =
    `₹${grandTotal.toLocaleString('en-IN')}`;
}
  // PROMO FIELD
  const promoInput = document.getElementById('coupon-code');
  const promoBtn = document.getElementById('apply-coupon-btn');

  if (promoInput && promoBtn) {

    if (window.appliedCoupon) {

      promoInput.value = window.appliedCoupon;

      promoInput.disabled = true;

      promoBtn.innerText = 'Applied';

      promoBtn.disabled = true;

      promoBtn.classList.add('applied');

    } else {

      promoInput.value = '';

      promoInput.disabled = false;

      promoBtn.innerText = 'Apply';

      promoBtn.disabled = false;

      promoBtn.classList.remove('applied');
    }
  }
};
window.changeQuantity = function (index, change) {
  let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  if (!cart[index]) return;

  let newQty = cart[index].quantity + change;
  if (newQty < 1) newQty = 1;

  cart[index].quantity = newQty;
  localStorage.setItem('productsInCart', JSON.stringify(cart));
  loadCart();
  updateCartCount();
};

window.applyCoupon = function () {
  const promoInput = document.getElementById('coupon-code');
  if (!promoInput) return;

  const code = promoInput.value.trim().toUpperCase();
  if (code === 'CARA20') {
    window.appliedCoupon = 'CARA20';
    localStorage.setItem('appliedCoupon', 'CARA20');
    showToast('CARA20 promo code applied! 20% discount added.', 'success');
    loadCart();
  } else if (code === 'WELCOME10') {
    window.appliedCoupon = 'WELCOME10';
    localStorage.setItem('appliedCoupon', 'WELCOME10');
    showToast('WELCOME10 promo code applied! 10% discount added.', 'success');
    loadCart();
  } else if (code === '') {
    showToast('Please enter a coupon code.', 'warning');
  } else {
    showToast('Invalid promo code. Try CARA20 for 20% off!', 'error');
  }
};

window.removeItem = function (index) {
  let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
  const removedName = cart[index] ? cart[index].name : 'Item';
  cart.splice(index, 1);
  localStorage.setItem('productsInCart', JSON.stringify(cart));
  loadCart();
  updateCartCount();
  showToast(`${removedName} removed from cart`, 'error');
};

document.addEventListener('DOMContentLoaded', () => {
  // Watch for click events on elements dynamically or directly
  document.body.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'apply-coupon-btn') {
      applyCoupon();
    }
  });

  const cartElement = document.getElementById('cart-items-container');
  if (cartElement) {
    loadCart();
  }
});

/* --- END: CART FUNCTIONALITY --- */

/* --- START: THEME TOGGLE FUNCTIONALITY --- */

(function () {
    const html = document.documentElement;

    // Apply saved theme on load
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }

    function updateThemeIcon(theme) {
        const iconClass = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
        
        const themeIcon = document.getElementById('themeIcon');
        const themeIconMobile = document.getElementById('themeIconMobile');
        
        if (themeIcon) themeIcon.className = iconClass;
        if (themeIconMobile) themeIconMobile.className = iconClass;

        // Swap logo based on theme
        const siteLogo = document.getElementById('siteLogo');
        if (siteLogo) {
            siteLogo.src = theme === 'dark' ? 'images/Dlogo.png' : 'images/logo.png';
        }
    }

    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        if (newTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }

    // Event Delegation: Works for static AND dynamic buttons
    document.addEventListener('click', (e) => {
        if (e.target && (e.target.closest('#themeToggle') || e.target.closest('#themeToggleMobile'))) {
            e.preventDefault();
            toggleTheme();
        }
    });

    // Watch for dynamic navbar insertions
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => {
            const activeTheme = html.getAttribute('data-theme') || 'light';
            updateThemeIcon(activeTheme);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Initialize icons on load
    updateThemeIcon(currentTheme);
})();


/* --- END: THEME TOGGLE FUNCTIONALITY --- */

(function () {
  const paginationSection = document.getElementById('pagination');
  if (!paginationSection) return;

  const productsPerPage = 16;
  const productSection = document.getElementById('product1');
  if (!productSection) return;

  const productContainers = Array.from(
    productSection.querySelectorAll('.pro-container')
  );

  let allProducts = [];
  productContainers.forEach((container) => {
    const products = Array.from(container.querySelectorAll('.pro'));
    allProducts = allProducts.concat(products);
  });

  if (allProducts.length === 0) return;

  let currentPage = 1;
  const totalPages = Math.ceil(allProducts.length / productsPerPage);

  if (productContainers.length > 1) {
    productContainers.forEach((container, index) => {
      if (index > 0) {
        container.style.display = 'none';
      }
    });
  }

  function showPage(pageNumber) {
    allProducts.forEach((product) => {
      product.style.display = 'none';
    });

    const startIndex = (pageNumber - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;

    const productsToShow = allProducts.slice(startIndex, endIndex);

    const firstContainer = productContainers[0];
    firstContainer.innerHTML = '';
    firstContainer.style.display = 'flex';

    productsToShow.forEach((product) => {
      product.style.display = 'block';
      firstContainer.appendChild(product);
    });

    productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    updatePaginationUI(pageNumber);
    currentPage = pageNumber;
  }

  function updatePaginationUI(activePage) {
    paginationSection.innerHTML = '';

    const prevArrow = document.createElement('a');
    prevArrow.href = '#';
    prevArrow.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
    prevArrow.classList.add('pagination-arrow');
    if (activePage === 1) {
      prevArrow.classList.add('disabled');
    }
    prevArrow.addEventListener('click', (e) => {
      e.preventDefault();
      if (activePage > 1) {
        showPage(activePage - 1);
      }
    });
    paginationSection.appendChild(prevArrow);

    for (let i = 1; i <= totalPages; i++) {
      const pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.textContent = i;
      if (i === activePage) {
        pageLink.classList.add('active');
      }
      pageLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(i);
      });
      paginationSection.appendChild(pageLink);
    }

    const nextArrow = document.createElement('a');
    nextArrow.href = '#';
    nextArrow.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
    nextArrow.classList.add('pagination-arrow');
    if (activePage === totalPages) {
      nextArrow.classList.add('disabled');
    }
    nextArrow.addEventListener('click', (e) => {
      e.preventDefault();
      if (activePage < totalPages) {
        showPage(activePage + 1);
      }
    });
    paginationSection.appendChild(nextArrow);
  }

  showPage(1);
})();

// Back to Top Button Logic



if (backToTopBtn && ToptobackBtn) {
  window.addEventListener('scroll', () => {
    if (!backToTopBtn || !ToptobackBtn) return;

    if (window.scrollY <= 300) {
      ToptobackBtn.classList.add('show');
      backToTopBtn.classList.remove('show');
    } else {
      backToTopBtn.classList.add('show');
      ToptobackBtn.classList.remove('show');
    }
  });

  // BACK TO TOP
  if (backToTopBtn) {
    // SHOW DOWN BUTTON WHEN USER IS NEAR TOP
    if (window.scrollY <= 300) {
      ToptobackBtn.classList.add('show');
      backToTopBtn.classList.remove('show');
    }

    // SHOW TOP BUTTON AFTER 300PX
    else {
      backToTopBtn.classList.add('show');
      ToptobackBtn.classList.remove('show');
    }
  }

  // BACK TO TOP
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

// SCROLL TO BOTTOM
if (ToptobackBtn) {
  // SCROLL TO BOTTOM
  ToptobackBtn.addEventListener('click', () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  });
}

// Style Quiz Functionality
window.openQuiz = function () {
  document.getElementById('quiz-modal').style.display = 'flex';
};

window.closeQuiz = function () {
  document.getElementById('quiz-modal').style.display = 'none';
};

window.selectStyle = function (style) {
  closeQuiz();
  const products = document.querySelectorAll('.pro');
  products.forEach((product) => {
    if (product.getAttribute('data-category') === style) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
  // Auto scroll to products section
  const productSection = document.getElementById('product1');

  if (productSection) {
    productSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
  alert(`Showing ${style} style recommendations!`);
};

/* --- START: BUY NOW FUNCTIONALITY --- */
window.buyNow = function (
  productName,
  productPrice,
  productImage,
  quantity,
  size
) {
  // Add to cart first
  addToCart(productName, productPrice, productImage, quantity, size);
  // Brief delay so user sees the toast before redirect
  setTimeout(function () {
    window.location.href = 'checkout.html';
  }, 1500);
};

document.addEventListener('DOMContentLoaded', () => {
  const brandCard = document.getElementById('brandCard');
  const cardContainer = document.getElementById('cardContainer');
  const statusText = document.getElementById('statusText');
  const featureSection = document.getElementById('interactive-feature-wrapper');

  // 1. Manual Click Control
  if (brandCard && cardContainer) {
    brandCard.addEventListener('click', () => {
      const isOpen = cardContainer.classList.toggle('open');
      if (statusText) {
        statusText.innerText = isOpen ? 'Click to collapse' : 'Click to expand';
      }
    });
  }

  // 2. Infinite Scroll-Based Activation Engine (Triggers every time)
  if (featureSection && cardContainer) {
    const observerOptions = {
      root: null,
      threshold: 0,
      rootMargin: '0px 0px -10% 0px',
    };

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          cardContainer.classList.add('open');

          if (statusText) {
            statusText.innerText = 'Click to collapse';
          }

          // Stop observing after opening once
          scrollObserver.unobserve(featureSection);
        }
      });
    }, observerOptions);

    // Keep observing continuously without ever disconnecting
    scrollObserver.observe(featureSection);
  }
});

/* --- START: HERO SLIDER FUNCTIONALITY --- */
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  // Null check to prevent errors on pages where the slider doesn't exist
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const prevBtn = slider.querySelector('.slider-btn.prev');
  const nextBtn = slider.querySelector('.slider-btn.next');
  const dots = slider.querySelectorAll('.slider-dots .dot');

  if (slides.length === 0) return;

  let currentSlide = 0;
  let autoPlayInterval;
  const intervalTime = 5000; // 5 seconds

  function updateSlider() {
    // Remove active class from all slides and dots
    slides.forEach((slide) => slide.classList.remove('active'));
    dots.forEach((dot) => dot.classList.remove('active'));

    // Add active class to current slide and dot
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
    }
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, intervalTime);
  }

  // Event Listeners for Arrows
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });
  }

  // Event Listeners for Dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide = index;
      updateSlider();
      resetAutoPlay();
    });
  });

  // Initialize auto-play
  startAutoPlay();
}

// Resilient initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroSlider);
} else {
  initHeroSlider();
}
/* --- END: HERO SLIDER FUNCTIONALITY --- */

/* --- START: CURRENT YEAR FUNCTIONALITY --- */
document.addEventListener('DOMContentLoaded', () => {
  const year = new Date().getFullYear();
  document.querySelectorAll('.Current-Year').forEach((el) => {
    el.textContent = year;
  });
});
/* --- END: CURRENT YEAR FUNCTIONALITY --- */
const topBtn = document.getElementById("topBtn");

    // Show button when user scrolls down
    window.onscroll = function () {
      if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        topBtn.style.display = "block";
      } else {
        topBtn.style.display = "none";
      }
    };

    // Scroll to top smoothly
    topBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

/* ========================================================
   COLLABORATIVE WARDROBE SHARING ENGINE
   ======================================================== */

window.pendingSharedCart = null;

window.showToast = function (msg, isError) {
    var toast = document.getElementById('toast');
    var toastMsg = document.getElementById('toast-msg');
    var toastIcon = document.getElementById('toast-icon');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    if (toastIcon) toastIcon.textContent = isError ? '⚠️' : '✅';
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 3500);
};

window.shareWardrobe = function () {
    var cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    var btn = document.getElementById('share-cart-btn');
    if (cart.length === 0) {
        showToast("Your cart is empty! Add some items before sharing.", true);
        return;
    }
    try {
        var minimizedCart = cart.map(function (item) {
            return { n: item.name, p: item.price, i: item.image, q: item.quantity, s: item.size };
        });
        var jsonStr = JSON.stringify(minimizedCart);
        var base64Payload = btoa(unescape(encodeURIComponent(jsonStr)));
        var shareUrl = window.location.origin + window.location.pathname + '#share=' + base64Payload;
        showToast("Wardrobe share link copied to clipboard!");
        if (btn) {
            var originalText = btn.innerHTML;
            btn.innerHTML = '✅ Link Copied!';
            btn.style.color = '#10b981';
            setTimeout(function () { btn.innerHTML = originalText; btn.style.color = ''; }, 3000);
        }
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).catch(function () { fallbackCopyText(shareUrl); });
            } else { fallbackCopyText(shareUrl); }
        } catch (clipErr) { fallbackCopyText(shareUrl); }
    } catch (e) {
        console.error("Failed to generate share link: ", e);
        showToast("Oops, something went wrong generating the link.", true);
    }
};

function fallbackCopyText(text) {
    try {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    } catch (err) { console.error('Fallback copy failed', err); }
}

window.closeShareModal = function () {
    var modal = document.getElementById('share-modal');
    if (modal) modal.style.display = 'none';
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname);
    } else { window.location.hash = ''; }
    window.pendingSharedCart = null;
};

window.checkSharedWardrobe = function () {
    var hash = window.location.hash;
    if (!hash || hash.indexOf('#share=') !== 0) return;
    try {
        var base64Payload = hash.substring(7);
        var jsonStr = decodeURIComponent(escape(atob(base64Payload)));
        var decodedCart = JSON.parse(jsonStr);
        if (!Array.isArray(decodedCart) || decodedCart.length === 0) {
            showToast("Invalid share link or empty shared collection.", true);
            return;
        }
        window.pendingSharedCart = decodedCart.map(function (item) {
            return {
                name: item.n || "Fashion Product", price: parseFloat(item.p) || 0,
                image: item.i || "images/products/f1.jpg", quantity: parseInt(item.q) || 1,
                size: item.s || "M"
            };
        });
        var listContainer = document.getElementById('shared-items-list');
        var totalPriceEl = document.getElementById('shared-total-price');
        var modal = document.getElementById('share-modal');
        if (!listContainer || !totalPriceEl || !modal) return;
        listContainer.innerHTML = '';
        var total = 0;
        window.pendingSharedCart.forEach(function (item) {
            var itemSubtotal = item.price * item.quantity;
            total += itemSubtotal;
            var row = document.createElement('div');
            row.className = 'shared-item-row';
            var img = document.createElement('img');
            img.src = item.image; img.className = 'shared-item-img'; img.alt = item.name;
            var details = document.createElement('div');
            details.className = 'shared-item-details';
            var nameEl = document.createElement('h4');
            nameEl.className = 'shared-item-name'; nameEl.textContent = item.name;
            var meta = document.createElement('span');
            meta.className = 'shared-item-meta';
            meta.textContent = 'Size: ' + item.size + '  |  Qty: ' + item.quantity;
            details.appendChild(nameEl); details.appendChild(meta);
            var priceEl = document.createElement('div');
            priceEl.className = 'shared-item-price';
            priceEl.textContent = '$' + itemSubtotal.toFixed(2);
            row.appendChild(img); row.appendChild(details); row.appendChild(priceEl);
            listContainer.appendChild(row);
        });
        totalPriceEl.textContent = '$' + total.toFixed(2);
        modal.style.display = 'flex';
    } catch (err) {
        console.error("Failed to parse shared wardrobe link:", err);
        showToast("Could not read shared wardrobe link. It may be broken.", true);
    }
};

window.applySharedCart = function (action) {
    if (!window.pendingSharedCart || window.pendingSharedCart.length === 0) { closeShareModal(); return; }
    var localCart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    if (action === 'overwrite') {
        localCart = window.pendingSharedCart.slice();
        showToast("Cart replaced with shared wardrobe!");
    } else if (action === 'merge') {
        window.pendingSharedCart.forEach(function (sharedItem) {
            var existing = localCart.find(function (item) {
                return item.name === sharedItem.name && item.size === sharedItem.size;
            });
            if (existing) { existing.quantity += sharedItem.quantity; }
            else { localCart.push(sharedItem); }
        });
        showToast("Shared wardrobe merged into your cart!");
    }
    localStorage.setItem('productsInCart', JSON.stringify(localCart));
    closeShareModal();
    if (typeof loadCart === 'function') loadCart();
    if (typeof updateCartCount === 'function') updateCartCount();
};

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(window.checkSharedWardrobe, 150);
});

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
        row.innerHTML = `
            <div class="cart-item-left" style="opacity: 0.8;">
                <div class="cart-item-img-wrap">
                    <img src="${item.image}" alt="${item.name}" loading="lazy" />
                </div>
                <div class="cart-item-details">
                    <span class="cart-item-brand">${item.brand || 'Premium Brand'}</span>
                    <h5 class="cart-item-title">${item.name}</h5>
                    <span class="cart-item-size">Size: ${item.size}</span>
                </div>
            </div>
            <div class="cart-item-right" style="flex-direction: row; align-items: center; justify-content: space-between;">
                <div class="cart-item-price">${formattedPrice}</div>
                <div class="cart-item-actions" style="display: flex; gap: 8px;">
                    <button class="cart-item-move" aria-label="Move to cart" onclick="moveToCart(${index})" title="Move to Cart" style="color: var(--accent); background: none; border: none; font-size: 20px; cursor: pointer;">
                        <i class="ri-shopping-cart-2-line"></i>
                    </button>
                    <button class="cart-item-remove" aria-label="Remove item" onclick="removeSavedItem(${index})" title="Remove" style="color: var(--text-secondary); background: none; border: none; font-size: 20px; cursor: pointer;">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
        `;
        savedContainer.appendChild(row);
    });
};

// Initialize loadSavedItems if we are on cart page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('saved-items-container')) {
        if(typeof window.loadSavedItems === 'function') window.loadSavedItems();
    }
});
