// Mobile menu functionality
const bar = document.getElementById("bar");
const nav = document.getElementById("navbar");
const close = document.getElementById("close");
//hjello guys
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

// Dynamic Product Details Logic
document.addEventListener("DOMContentLoaded", () => {
    // 1. Remove inline onclick from all product cards
    document.querySelectorAll('.pro').forEach(card => {
        card.removeAttribute("onclick");
        card.onclick = null; // Ensure property is also cleared

        // 2. Add delegated click event for the whole card
        card.addEventListener('click', function(e) {
            // Ignore if the user clicked the 'Add to Cart' icon
            if (e.target.closest('.cart')) {
                return;
            }

            // Extract product details from the card's DOM
            const nameElement = this.querySelector("h5");
            const priceElement = this.querySelector("h4");
            const brandElement = this.querySelector(".des span");
            const imageElement = this.querySelector("img");

            const selectedProduct = {
                name: nameElement ? nameElement.textContent.trim() : "Product",
                price: priceElement ? priceElement.textContent.trim() : "$0.00",
                brand: brandElement ? brandElement.textContent.trim() : "Brand",
                image: imageElement ? imageElement.src : ""
            };

            // Store in localStorage
            localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));

            // Redirect to single product page
            window.location.href = "singleProduct.html";
        });
    });

    // 3. Dynamic Render on singleProduct.html
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
                if (breadcrumbEl && product.brand) breadcrumbEl.textContent = `Home / ${product.brand} / T-Shirt`;

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
        // Also inject toast.css for standalone pages
        if (!document.querySelector('link[href*="toast.css"]')) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'toast.css';
            document.head.appendChild(link);
        }

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
    toast.querySelector('.toast-close').addEventListener('click', function () {
        dismissToast(toast);
    });

    container.appendChild(toast);

    // Auto dismiss after 4 seconds
    setTimeout(function () { dismissToast(toast); }, 4000);
}

function dismissToast(toast) {
    if (!toast || toast.classList.contains('toast-hiding')) return;
    toast.classList.add('toast-hiding');
    toast.addEventListener('animationend', function () { toast.remove(); });
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

window.loadCart = function () {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];

    // First, check if we need to show the empty message
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

        // Remove button cell (no user data, safe static markup via DOM)
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

        // Product image cell (safe property assignment)
        const imgCell = newRow.insertCell();
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        imgCell.appendChild(img);

        // Product name and size cell (textContent prevents HTML injection)
        const nameCell = newRow.insertCell();
        const nameText = document.createTextNode(item.name);
        nameCell.appendChild(nameText);
        nameCell.appendChild(document.createElement('br'));
        const sizeSmall = document.createElement('small');
        sizeSmall.textContent = 'Size: ' + item.size;
        nameCell.appendChild(sizeSmall);

        // Price cell (safe — toFixed returns a number string)
        const priceCell = newRow.insertCell();
        priceCell.textContent = '$' + itemPrice.toFixed(2);

        // Quantity input cell (safe property and attribute assignment)
        const qtyCell = newRow.insertCell();
        const qtyInput = document.createElement('input');
        qtyInput.id = 'qty-' + index;
        qtyInput.type = 'number';
        qtyInput.value = item.quantity;
        qtyInput.min = '1';
        qtyInput.addEventListener('change', function () {
            updateQuantity(index, this.value);
        });
        qtyCell.appendChild(qtyInput);

        // Subtotal cell (safe — toFixed returns a number string)
        const subtotalCell = newRow.insertCell();
        subtotalCell.textContent = '$' + subtotal.toFixed(2);
    });

    const subtotalCell = document.querySelector('.subtotal table tr:nth-child(1) td:nth-child(2)');
    const totalCell = document.querySelector('.subtotal table tr:nth-child(3) td:nth-child(2) strong');

    if (subtotalCell) subtotalCell.innerText = `$ ${total.toFixed(2)}`;
    if (totalCell) totalCell.innerText = `$ ${total.toFixed(2)}`;
}

window.removeItem = function (index) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    const removedName = cart[index] ? cart[index].name : 'Item';
    cart.splice(index, 1);
    localStorage.setItem('productsInCart', JSON.stringify(cart));
    loadCart(); // This will re-trigger the check through handleEmptyCartView
    updateCartCount(); // Update badge
    showToast(removedName + ' removed from cart', 'error');
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
    updateCartCount(); // Update badge
    showToast('Quantity updated', 'info');
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
    const html = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);

    function updateThemeIcon(theme) {
        const themeIcon = document.getElementById('themeIcon');
        const themeIconMobile = document.getElementById('themeIconMobile');
        const iconClass = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
        if (themeIcon) themeIcon.className = iconClass;
        if (themeIconMobile) themeIconMobile.className = iconClass;

        const siteLogo = document.getElementById('siteLogo');
        if (siteLogo) {
            siteLogo.src = theme === 'dark' ? 'images/Dlogo.png' : 'images/logo.png';
        }
    }

    function toggleTheme() {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    }

    window.addEventListener('load', function () {
        updateThemeIcon(currentTheme);
        const themeToggle = document.getElementById('themeToggle');
        const themeToggleMobile = document.getElementById('themeToggleMobile');
        if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
        if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);
    });
})();

/* --- END: THEME TOGGLE FUNCTIONALITY --- */

(function () {
    const paginationSection = document.getElementById('pagination');
    if (!paginationSection) return;

    const productsPerPage = 16;
    const productSection = document.getElementById('shop-section');
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

window.addEventListener("scroll", () => {
    // SHOW DOWN BUTTON WHEN USER IS NEAR TOP
    if (ToptobackBtn && backToTopBtn) {
        if (window.scrollY <= 300) {
            ToptobackBtn.classList.add("show");
            backToTopBtn.classList.remove("show");
        }
        // SHOW TOP BUTTON AFTER 300PX
        else {
            backToTopBtn.classList.add("show");
            ToptobackBtn.classList.remove("show");
        }
    }
});

// BACK TO TOP
if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// SCROLL TO BOTTOM
if (ToptobackBtn) {
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
    document.getElementById('quiz-modal').style.display = 'none';
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
    const productSection = document.getElementById('shop-section');

    if (productSection) {
        productSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    showToast(`Showing ${style} style recommendations!`, 'info');
}

/* --- START: BUY NOW FUNCTIONALITY --- */
window.buyNow = function (productName, productPrice, productImage, quantity, size) {
    // Add to cart first
    addToCart(productName, productPrice, productImage, quantity, size);
    // Brief delay so user sees the toast before redirect
    setTimeout(function () {
        window.location.href = 'checkout.html';
    }, 1500);
}


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
                    // Open the cards smoothly when scrolling into view
                    cardContainer.classList.add('open');
                    if (statusText) statusText.innerText = "Click to collapse";
                } else {
                    cardContainer.classList.remove('open');
                    if (statusText) statusText.innerText = "Click to expand";
                }
            });
        }, observerOptions);

        // Keep observing continuously without ever disconnecting
        scrollObserver.observe(featureSection);
    }
});
