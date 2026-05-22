/* --- START: THEME TOGGLE FUNCTIONALITY --- */

(function () {
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    const themeIcon = document.getElementById('themeIcon');
    const themeIconMobile = document.getElementById('themeIconMobile');
    const html = document.documentElement;

    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    function updateThemeIcon(theme) {
        console.log('Updating icons to:', theme);
        const iconClass = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
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
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }

    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

    if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateThemeIcon(currentTheme);
    });
}
})();

/* --- END: THEME TOGGLE FUNCTIONALITY --- */
// Mobile menu functionality
const bar = document.getElementById("bar");
const nav = document.getElementById("navbar");
const close = document.getElementById("close");

function updateAuthUI() {
    const loginBtn = document.getElementById("login-btn");
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loginBtn) return;

    if (loggedInUser) {
        loginBtn.style.display = "none";
    } else {
        loginBtn.style.display = "block";
    }
}

document.addEventListener("DOMContentLoaded", updateAuthUI);
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
// Global capturing click listener for all product cards (static and dynamic)
document.addEventListener("click", function (e) {
    const proCard = e.target.closest(".pro");
    if (!proCard) return;

    // Ignore clicks on cart icon or buy now button inside the card
    if (e.target.closest(".pro-cart-btn") || e.target.closest(".pro-buy-btn")) return;

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

    const itemsContainer = document.getElementById('cart-items-container');
    if (!itemsContainer) return;

    itemsContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemPrice = item.price;
        const itemSubtotal = itemPrice * item.quantity;
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
                <div class="cart-item-price">₹${itemPrice.toLocaleString('en-IN')}</div>
                <div class="qty-selector">
                    <button class="qty-btn minus" aria-label="Decrease quantity" onclick="event.stopPropagation(); changeQuantity(${index}, -1)">
                        <i class="ri-subtract-line"></i>
                    </button>
                    <input type="number" class="qty-input" value="${item.quantity}" readonly />
                    <button class="qty-btn plus" aria-label="Increase quantity" onclick="event.stopPropagation(); changeQuantity(${index}, 1)">
                        <i class="ri-add-line"></i>
                    </button>
                </div>
                <div class="cart-item-subtotal">₹${itemSubtotal.toLocaleString('en-IN')}</div>
                <button class="cart-item-remove" aria-label="Remove item" onclick="event.stopPropagation(); removeItem(${index})">
                    <i class="ri-delete-bin-line"></i>
                </button>
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

if (subtotalDisplay) {
    subtotalDisplay.innerText = `$${total.toFixed(2)}`;
}

if (totalDisplay) {
    totalDisplay.innerText = `$${total.toFixed(2)}`;
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
                    const priceA = parseFloat(a.querySelector('h4').innerText.replace(/[₹$,]/g, '').trim());
                    const priceB = parseFloat(b.querySelector('h4').innerText.replace(/[₹$,]/g, '').trim());

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
document.addEventListener('DOMContentLoaded', () => {
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value.trim();
      if (email) showToast('Thanks for subscribing!', 'success');
    });
  }
});