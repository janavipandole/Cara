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

// Single Product Image Switching
var MainImg = document.getElementById("MainImg");
var smallImg = document.getElementsByClassName("small-img");

document.querySelectorAll(".pro img").forEach((img) => {
    img.addEventListener("click", function () {

        localStorage.setItem("productImage", this.src);

        window.location.href = "singleProduct.html";
    });
});

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
    const productSection = document.getElementById('product1');

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

/* ========================================================
   COLLABORATIVE WARDROBE SHARING ENGINE
   ======================================================== */

// Global state to store decoded incoming items
window.pendingSharedCart = null;

/**
 * Encodes the cart, copies the share link to clipboard, and triggers a toast.
 * Encoding pattern (from plan): btoa(unescape(encodeURIComponent(json)))
 */
window.shareWardrobe = function () {
    var cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    var btn = document.getElementById('share-cart-btn');

    if (cart.length === 0) {
        showToast("Your cart is empty! Add some items before sharing.", true);
        return;
    }

    try {
        // 1. Minimize fields to keep URLs short
        var minimizedCart = cart.map(function (item) {
            return {
                n: item.name,
                p: item.price,
                i: item.image,
                q: item.quantity,
                s: item.size
            };
        });

        // 2. Encode using the exact plan pattern: btoa(unescape(encodeURIComponent()))
        var jsonStr = JSON.stringify(minimizedCart);
        var base64Payload = btoa(unescape(encodeURIComponent(jsonStr)));

        // 3. Build sharing URL
        var shareUrl = window.location.origin + window.location.pathname + '#share=' + base64Payload;

        // 4. Show toast + change button text as visual fallback
        showToast("Wardrobe share link copied to clipboard!");
        if (btn) {
            var originalText = btn.innerHTML;
            btn.innerHTML = '✅ Link Copied!';
            btn.style.color = '#10b981';
            setTimeout(function () {
                btn.innerHTML = originalText;
                btn.style.color = '';
            }, 3000);
        }

        // 5. Copy to clipboard (best-effort, feedback already shown)
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).catch(function () {
                    fallbackCopyText(shareUrl);
                });
            } else {
                fallbackCopyText(shareUrl);
            }
        } catch (clipErr) {
            fallbackCopyText(shareUrl);
        }

    } catch (e) {
        console.error("Failed to generate share link: ", e);
        showToast("Oops, something went wrong generating the link.", true);
    }
};

/**
 * Fallback clipboard copy using a hidden textarea.
 */
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
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
}

/**
 * Closes the preview modal and cleans the URL hash.
 */
window.closeShareModal = function () {
    var modal = document.getElementById('share-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Remove hash from URL without reloading
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname);
    } else {
        window.location.hash = '';
    }
    window.pendingSharedCart = null;
};

/**
 * On page load: checks URL hash for #share= payload and opens the preview modal.
 * Decoding pattern (from plan): JSON.parse(decodeURIComponent(escape(atob(base64))))
 */
window.checkSharedWardrobe = function () {
    var hash = window.location.hash;
    if (!hash || hash.indexOf('#share=') !== 0) return;

    try {
        var base64Payload = hash.substring(7);
        // Decode using the exact plan pattern: decodeURIComponent(escape(atob()))
        var jsonStr = decodeURIComponent(escape(atob(base64Payload)));
        var decodedCart = JSON.parse(jsonStr);

        if (!Array.isArray(decodedCart) || decodedCart.length === 0) {
            showToast("Invalid share link or empty shared collection.", true);
            return;
        }

        // Map minimized keys back to standard schema
        window.pendingSharedCart = decodedCart.map(function (item) {
            return {
                name: item.n || "Fashion Product",
                price: parseFloat(item.p) || 0,
                image: item.i || "images/products/f1.jpg",
                quantity: parseInt(item.q) || 1,
                size: item.s || "M"
            };
        });

        // Render preview modal contents
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
            img.src = item.image;
            img.className = 'shared-item-img';
            img.alt = item.name;

            var details = document.createElement('div');
            details.className = 'shared-item-details';

            var nameEl = document.createElement('h4');
            nameEl.className = 'shared-item-name';
            nameEl.textContent = item.name;

            var meta = document.createElement('span');
            meta.className = 'shared-item-meta';
            meta.textContent = 'Size: ' + item.size + '  |  Qty: ' + item.quantity;

            details.appendChild(nameEl);
            details.appendChild(meta);

            var priceEl = document.createElement('div');
            priceEl.className = 'shared-item-price';
            priceEl.textContent = '$' + itemSubtotal.toFixed(2);

            row.appendChild(img);
            row.appendChild(details);
            row.appendChild(priceEl);
            listContainer.appendChild(row);
        });

        totalPriceEl.textContent = '$' + total.toFixed(2);

        // Show the modal
        modal.style.display = 'flex';

    } catch (err) {
        console.error("Failed to parse shared wardrobe link:", err);
        showToast("Could not read shared wardrobe link. It may be broken.", true);
    }
};

/**
 * Integrates the shared items into localStorage (merge or overwrite).
 */
window.applySharedCart = function (action) {
    if (!window.pendingSharedCart || window.pendingSharedCart.length === 0) {
        closeShareModal();
        return;
    }

    var localCart = JSON.parse(localStorage.getItem('productsInCart')) || [];

    if (action === 'overwrite') {
        localCart = window.pendingSharedCart.slice();
        showToast("Cart replaced with shared wardrobe!");
    } else if (action === 'merge') {
        window.pendingSharedCart.forEach(function (sharedItem) {
            var existing = localCart.find(function (item) {
                return item.name === sharedItem.name && item.size === sharedItem.size;
            });
            if (existing) {
                existing.quantity += sharedItem.quantity;
            } else {
                localCart.push(sharedItem);
            }
        });
        showToast("Shared wardrobe merged into your cart!");
    }

    // Persist and close
    localStorage.setItem('productsInCart', JSON.stringify(localCart));
    closeShareModal();

    // Rehydrate the page UI
    if (typeof loadCart === 'function') {
        loadCart();
    }
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
};

// Check for incoming share link on page load
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(window.checkSharedWardrobe, 150);
});
