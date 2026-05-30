// Mobile menu functionality using event delegation
document.addEventListener("click", (e) => {
    const bar = e.target.closest("#bar");
    const close = e.target.closest("#close");

    if (bar) {
        const nav = document.getElementById("navbar");
        if (nav) nav.classList.add("active");
    }

    if (close) {
        const nav = document.getElementById("navbar");
        if (nav) nav.classList.remove("active");
        e.preventDefault();
    }
});

// Dynamic Product Details Logic
// Global capturing click listener for all product cards (static and dynamic)
gssoc-dark-theme-fix-1062
document.addEventListener('click', function (e) {

    if (e.target.closest('#bar')) {
      const nav = document.getElementById('navbar');
      if (nav) nav.classList.add('active');
    }

    if (e.target.closest('#close')) {
      const nav = document.getElementById('navbar');
      if (nav) nav.classList.remove('active');
    }
document.addEventListener("click", function (e) {
    const proCard = e.target.closest(".pro");
    if (!proCard) return;

    if (
        e.target.closest(
            ".cart, .buy-now-btn, .wishlist-btn, .pro-cart-btn, .pro-buy-btn, .pro-quick-view-btn, button"
        )
    ) {
        return;
    }

    const nameElement  = proCard.querySelector("h5");
    const priceElement = proCard.querySelector("h4");
    const brandElement = proCard.querySelector(".des span");
    const imageElement = proCard.querySelector("img");

    const selectedProduct = {
        name:  nameElement  ? nameElement.textContent.trim()  : "Product",
        price: priceElement ? priceElement.textContent.trim() : "$0.00",
        brand: brandElement ? brandElement.textContent.trim() : "Brand",
        image: imageElement ? imageElement.src                : ""
    };
main

    if (e.target.closest('#themeToggle') || e.target.closest('#themeToggleMobile')) {
      e.preventDefault();
      toggleTheme();
    }
  });

  // Initialize icon on load
  updateThemeIcon(savedTheme);
  
// Dynamic Render on singleProduct.html
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("singleProduct")) {
        const storedProductJSON = localStorage.getItem("selectedProduct");

        if (storedProductJSON) {
            try {
                const product = JSON.parse(storedProductJSON);

                const nameEl       = document.getElementById("product-name");
                const priceEl      = document.getElementById("product-price");
                const mainImgEl    = document.getElementById("MainImg");
                const breadcrumbEl = document.querySelector(".single-pro-details h6");
                const smallImgs    = document.querySelectorAll(".small-img");

                if (nameEl)    nameEl.textContent    = product.name;
                if (priceEl)   priceEl.textContent   = product.price;
                if (mainImgEl) mainImgEl.src          = product.image;

                if (breadcrumbEl && product.brand) {
                    let productType = "T-Shirt";
                    if      (product.name.toLowerCase().includes("trousers")) productType = "Trousers";
                    else if (product.name.toLowerCase().includes("shorts"))   productType = "Shorts";
                    else if (product.name.toLowerCase().includes("blouse"))   productType = "Blouse";
                    else if (product.name.toLowerCase().includes("shirt"))    productType = "Shirt";
                    breadcrumbEl.textContent = `Home / ${product.brand} / ${productType}`;
                }

                if (smallImgs.length > 0 && product.image) {
                    smallImgs[0].src = product.image;
                }
            } catch (error) {
                console.error("Error parsing stored product:", error);
            }
        }

        // Single Product Image Switching
        const MainImg  = document.getElementById("MainImg");
        const smallImg = document.getElementsByClassName("small-img");

        if (MainImg && smallImg) {
            for (let i = 0; i < smallImg.length; i++) {
                smallImg[i].onclick = function () {
                    if (MainImg.src === smallImg[i].src) return;

                    MainImg.style.opacity = "0.4";
                    const tempImg = new Image();
                    tempImg.src   = smallImg[i].src;
                    tempImg.onload = function () {
                        MainImg.src = tempImg.src;
                        requestAnimationFrame(() => { MainImg.style.opacity = "1"; });
                    };
                };
            }
        }
    }
});

// Button ripple effect
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("button.normal, button.white");
    buttons.forEach((button) => {
        button.addEventListener("click", function (e) {
            const rect   = this.getBoundingClientRect();
            const x      = e.clientX - rect.left;
            const y      = e.clientY - rect.top;
            const ripple = document.createElement("span");
            ripple.classList.add("ripple-effect");
            ripple.style.left = `${x}px`;
            ripple.style.top  = `${y}px`;
            this.appendChild(ripple);
            ripple.addEventListener("animationend", () => { ripple.remove(); });
        });
    });
});

/* ============================================================
   CART FUNCTIONALITY
   ============================================================ */

// Robust price parser
function parsePriceString(priceStr) {
    if (typeof priceStr === "number") return isFinite(priceStr) ? priceStr : 0;
    if (!priceStr) return 0;
    var cleaned = String(priceStr).replace(/[₹$,\s]/g, "").replace(/&#?\w+;/g, "");
    var num = parseFloat(cleaned);
    return isFinite(num) ? num : 0;
}

// Consistent currency formatter
function formatCurrency(amount) {
    var num = typeof amount === "number" ? amount : parsePriceString(amount);
    if (!isFinite(num)) num = 0;
    return "₹" + Math.round(num).toLocaleString("en-IN");
}

// Update cart count badge
function updateCartCount() {
    const cart       = JSON.parse(localStorage.getItem("productsInCart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const desktopCount = document.getElementById("desktopCartCount");
    const mobileCount  = document.getElementById("mobileCartCount");

    if (desktopCount) {
        desktopCount.textContent = totalItems;
        desktopCount.classList.toggle("hidden", totalItems === 0);
    }
    if (mobileCount) {
        mobileCount.textContent = totalItems;
        mobileCount.classList.toggle("hidden", totalItems === 0);
    }
}

function updateWishlistCount() {
    let wishlist = [];

    try {
        wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
        wishlist = [];
    }

    if (!Array.isArray(wishlist)) {
        wishlist = [];
    }

    const totalItems = wishlist.length;
    document.querySelectorAll(".wishlist-count").forEach((countBadge) => {
        countBadge.textContent = totalItems;
        countBadge.classList.toggle("hidden", totalItems === 0);
    });
}

window.updateWishlistCount = updateWishlistCount;

function createWishlistNavLink() {
    const link = document.createElement("a");
    link.href = "wishlist.html";
    link.className = "wishlist-nav-link";
    link.setAttribute("aria-label", "Wishlist");
    link.innerHTML = '<i class="ri-heart-line" aria-hidden="true"></i><span class="wishlist-count hidden">0</span>';
    return link;
}

function ensureWishlistNavLinks() {
    const navbar = document.getElementById("navbar");

    if (navbar && !navbar.querySelector('a[href="wishlist.html"]')) {
        const cartLink = navbar.querySelector('a[href="cart.html"], #lg-bag');
        const wishlistItem = document.createElement("li");
        wishlistItem.className = "nav-icon";
        wishlistItem.appendChild(createWishlistNavLink());

        if (cartLink && cartLink.closest("li")) {
            navbar.insertBefore(wishlistItem, cartLink.closest("li"));
        } else {
            navbar.appendChild(wishlistItem);
        }
    }

    document.querySelectorAll(".mobile").forEach((mobileNav) => {
        if (mobileNav.querySelector('a[href="wishlist.html"]')) return;

        const cartLink = mobileNav.querySelector('a[href="cart.html"]');
        const wishlistLink = createWishlistNavLink();

        if (cartLink) {
            mobileNav.insertBefore(wishlistLink, cartLink);
        } else {
            mobileNav.insertBefore(wishlistLink, mobileNav.firstChild);
        }
    });
}

function getCurrentProductDetails() {
    const nameElement  = document.getElementById("product-name");
    const priceElement = document.getElementById("product-price");
    const imageElement = document.getElementById("MainImg");

    return {
        name:  nameElement ? nameElement.textContent.trim() : "Product",
        price: priceElement ? priceElement.textContent.trim() : "₹0",
        image: imageElement ? imageElement.src : "images/products/f1.jpg"
    };
}

function initSingleProductWishlist() {
    const wishlistBtn = document.getElementById("single-product-wishlist");
    if (!wishlistBtn) return;

    const product = getCurrentProductDetails();
    wishlistBtn.dataset.productName = product.name;

    if (typeof window.syncWishlistButtons === "function") {
        window.syncWishlistButtons();
    }

    wishlistBtn.addEventListener("click", () => {
        const currentProduct = getCurrentProductDetails();
        wishlistBtn.dataset.productName = currentProduct.name;

        if (typeof window.toggleWishlistItem === "function") {
            window.toggleWishlistItem(currentProduct, wishlistBtn);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    ensureWishlistNavLinks();
    updateCartCount();
    updateWishlistCount();
    initSingleProductWishlist();
});

// Toggle empty-cart view
function handleEmptyCartView() {
    const cart           = JSON.parse(localStorage.getItem("productsInCart")) || [];
    const cartGrid       = document.getElementById("cart-container");
    const emptyContainer = document.getElementById("empty-cart-container");

    if (window.location.pathname.includes("cart.html")) {
        if (cart.length === 0) {
            if (cartGrid)       cartGrid.style.display       = "none";
            if (emptyContainer) emptyContainer.style.display = "flex";
        } else {
            if (cartGrid)       cartGrid.style.display       = "block";
            if (emptyContainer) emptyContainer.style.display = "none";
        }
    }
}

function addToCart(productName, productPrice, productImage, quantity, size) {
    let cart       = JSON.parse(localStorage.getItem("productsInCart")) || [];
    let parsedQty  = parseInt(quantity);
    if (isNaN(parsedQty) || parsedQty < 1) parsedQty = 1;

    let item = {
        name:     productName,
        price:    parsePriceString(productPrice),
        image:    productImage,
        quantity: parsedQty,
        size:     size ? size.replace("Size", "").trim() : null
    };

    if (!item.size) {
        showToast("Please select a size before adding to cart!", "warning");
        return;
    }

    let existingItem = cart.find(p => p.name === item.name && p.size === item.size);
    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        cart.push(item);
    }

    localStorage.setItem("productsInCart", JSON.stringify(cart));
    showToast(`${item.name} (Size: ${item.size}) added to cart!`, "success");
    updateCartCount();
}

// Toast notification
function showToast(message, type) {
    type = type || "success";

    var container = document.getElementById("toast-container");
    if (!container) {
        container    = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    var icons = {
        success: "fa-circle-check",
        error:   "fa-circle-xmark",
        warning: "fa-triangle-exclamation",
        info:    "fa-circle-info"
    };

    var toast       = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.innerHTML =
        '<i class="fa-solid ' + (icons[type] || icons.success) + ' toast-icon"></i>' +
        '<span class="toast-msg"></span>' +
        '<button class="toast-close" aria-label="Close notification">&times;</button>' +
        '<div class="toast-progress"></div>';
    toast.querySelector(".toast-msg").textContent = message;
    toast.querySelector(".toast-close").addEventListener("click", function () { dismissToast(toast); });

    container.appendChild(toast);
    setTimeout(function () { dismissToast(toast); }, 4000);
}

function dismissToast(toast) {
    if (!toast || toast.classList.contains("toast-hiding")) return;
    toast.classList.add("toast-hiding");
    toast.addEventListener("animationend", function () { toast.remove(); });
}

window.updateQty = function (change) {
    let quantityElement = document.querySelector(".qty"); // check class
    let quantity = parseInt(quantityElement.textContent);

    quantity += change;

    // ✅ Fix starts here
    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
    }

    if (quantity > 99) {
        quantity = 99;
    }
    // ✅ Fix ends here

    quantityElement.textContent = quantity;

    updateCartTotal(); // already present function
};
window.handleAddToCart = function () {
    const nameElement     = document.getElementById("product-name");
    const priceElement    = document.getElementById("product-price");
    const sizeSelect      = document.getElementById("product-size");
    const quantityInput   = document.getElementById("product-quantity");
    const imageElement    = document.getElementById("MainImg");

    if (!nameElement || !priceElement || !sizeSelect || !quantityInput || !imageElement) {
        console.error("Missing product elements on page.");
        return;
    }

    const name     = nameElement.innerText;
    const price    = priceElement.innerText;
    const size     = sizeSelect.value;
    const quantity = parseInt(quantityInput.value);
    const image    = imageElement.src;

    if (size === "Select Size" || size === "") {
        showToast("Please select a size before adding to cart!", "warning");
        return;
    }
    if (quantity < 1 || isNaN(quantity)) {
        showToast("Please enter a valid quantity.", "warning");
        return;
    }

    addToCart(name, price, image, quantity, size);
    updateCartCount();
};

window.handleBuyNow = function () {
    const nameElement   = document.getElementById("product-name");
    const priceElement  = document.getElementById("product-price");
    const sizeSelect    = document.getElementById("product-size");
    const quantityInput = document.getElementById("product-quantity");
    const imageElement  = document.getElementById("MainImg");

    if (!nameElement || !priceElement || !sizeSelect || !quantityInput || !imageElement) {
        console.error("Missing product elements on page.");
        return;
    }

    const name     = nameElement.innerText;
    const price    = priceElement.innerText;
    const size     = sizeSelect.value;
    const quantity = parseInt(quantityInput.value);
    const image    = imageElement.src;

    if (size === "Select Size" || size === "") {
        showToast("Please select a size before proceeding!", "warning");
        return;
    }
    if (quantity < 1 || isNaN(quantity)) {
        showToast("Please enter a valid quantity.", "warning");
        return;
    }

    window.buyNow(name, price, image, quantity, size);
};

window.appliedCoupon = localStorage.getItem("appliedCoupon") || null;

window.loadCart = function () {
    let cart = JSON.parse(localStorage.getItem("productsInCart")) || [];

    handleEmptyCartView();
    if (typeof window.loadSavedItems === "function") window.loadSavedItems();

    const itemsContainer = document.getElementById("cart-items-container");
    if (!itemsContainer) return;

    itemsContainer.innerHTML = "";
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemPrice    = parsePriceString(item.price);
        const itemQty      = parseInt(item.quantity) || 1;
        const itemSubtotal = itemPrice * itemQty;
        subtotal          += itemSubtotal;

        const row       = document.createElement("div");
        row.className   = "cart-item-row";
        row.innerHTML   = `
            <div class="cart-item-left">
                <div class="cart-item-img-wrap">
                    <img src="${item.image}" alt="${item.name}" loading="lazy" />
                </div>
                <div class="cart-item-details">
                    <span class="cart-item-brand">${item.brand || "Premium Brand"}</span>
                    <h5 class="cart-item-title">${item.name}</h5>
                    <span class="cart-item-size">Size: ${item.size}</span>
                </div>
            </div>
            <div class="cart-item-right">
                <div class="cart-item-price">${formatCurrency(itemPrice)}</div>
                <div class="qty-selector">
                    <button class="qty-btn minus" aria-label="Decrease quantity"
                        onclick="event.stopPropagation(); changeQuantity(${index}, -1)">
                        <i class="ri-subtract-line"></i>
                    </button>
                    <input type="number" class="qty-input" value="${itemQty}" readonly />
                    <button class="qty-btn plus" aria-label="Increase quantity"
                        onclick="event.stopPropagation(); changeQuantity(${index}, 1)">
                        <i class="ri-add-line"></i>
                    </button>
                </div>
                <div class="cart-item-subtotal">${formatCurrency(itemSubtotal)}</div>
                <div class="cart-item-actions" style="display:flex;gap:8px;">
                    <button class="cart-item-save" aria-label="Save for later"
                        onclick="event.stopPropagation(); saveForLater(${index})"
                        title="Save for Later"
                        style="color:var(--text-secondary);background:none;border:none;font-size:20px;cursor:pointer;">
                        <i class="ri-bookmark-line"></i>
                    </button>
                    <button class="cart-item-remove" aria-label="Remove item"
                        onclick="event.stopPropagation(); removeItem(${index})"
                        title="Remove">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
        `;
        itemsContainer.appendChild(row);
    });

    // Summary elements
    const subtotalEl    = document.getElementById("summary-subtotal");
    const taxEl         = document.getElementById("summary-tax");
    const shippingEl    = document.getElementById("summary-shipping");
    const discountRow   = document.getElementById("summary-discount-row");
    const discountEl    = document.getElementById("summary-discount");
    const totalEl       = document.getElementById("summary-total");

    if (subtotalEl) subtotalEl.innerText = formatCurrency(subtotal);

    let shipping = 0;
    if (subtotal > 0) shipping = subtotal >= 3000 ? 0 : 150;

    if (shippingEl) {
        shippingEl.innerText = shipping === 0 ? "FREE" : formatCurrency(shipping);
        shippingEl.classList.toggle("shipping-free", shipping === 0 && subtotal > 0);
    }

    const tax = Math.round(subtotal * 0.18);
    if (taxEl) taxEl.innerText = formatCurrency(tax);

    let discount = 0;
    if (window.appliedCoupon === "CARA20"    && subtotal > 0) discount = Math.round(subtotal * 0.20);
    else if (window.appliedCoupon === "WELCOME10" && subtotal > 0) discount = Math.round(subtotal * 0.10);

    if (discountRow && discountEl) {
        if (discount > 0) {
            discountRow.style.display = "flex";
            discountEl.innerText      = "-" + formatCurrency(discount);
        } else {
            discountRow.style.display = "none";
        }
    }

    const grandTotal = Math.max(0, subtotal + tax + shipping - discount);
    if (totalEl) totalEl.innerText = formatCurrency(grandTotal);

    // Legacy cart summary table (cart.html fallback)
    const subtotalDisplay = document.querySelector(".subtotal table tr:nth-child(1) td:nth-child(2)");
    const shippingDisplay = document.querySelector(".subtotal table tr:nth-child(2) td:nth-child(2)");
    const totalDisplay    = document.querySelector(".subtotal table tr:nth-child(3) td:nth-child(2) strong");

    if (subtotalDisplay) subtotalDisplay.innerText = formatCurrency(subtotal);
    if (shippingDisplay) shippingDisplay.innerText = shipping === 0 ? "Free" : formatCurrency(shipping);
    if (totalDisplay)    totalDisplay.innerText    = formatCurrency(subtotal + shipping);

    // Promo field state
    const promoInput = document.getElementById("coupon-code");
    const promoBtn   = document.getElementById("apply-coupon-btn");
    if (promoInput && promoBtn) {
        if (window.appliedCoupon) {
            promoInput.value    = window.appliedCoupon;
            promoInput.disabled = true;
            promoBtn.innerText  = "Applied";
            promoBtn.disabled   = true;
            promoBtn.classList.add("applied");
        } else {
            promoInput.value    = "";
            promoInput.disabled = false;
            promoBtn.innerText  = "Apply";
            promoBtn.disabled   = false;
            promoBtn.classList.remove("applied");
        }
    }
};

window.changeQuantity = function (index, change) {
    let cart = JSON.parse(localStorage.getItem("productsInCart")) || [];
    if (!cart[index]) return;
    let newQty = cart[index].quantity + change;
    if (newQty < 1) newQty = 1;
    cart[index].quantity = newQty;
    localStorage.setItem("productsInCart", JSON.stringify(cart));
    loadCart();
    updateCartCount();
};

window.applyCoupon = function () {
    const promoInput = document.getElementById("coupon-code");
    if (!promoInput) return;
    const code = promoInput.value.trim().toUpperCase();

    if (code === "CARA20") {
        window.appliedCoupon = "CARA20";
        localStorage.setItem("appliedCoupon", "CARA20");
        showToast("CARA20 applied! 20% discount added.", "success");
        loadCart();
    } else if (code === "WELCOME10") {
        window.appliedCoupon = "WELCOME10";
        localStorage.setItem("appliedCoupon", "WELCOME10");
        showToast("WELCOME10 applied! 10% discount added.", "success");
        loadCart();
    } else if (code === "") {
        showToast("Please enter a coupon code.", "warning");
    } else {
        showToast("Invalid promo code. Try CARA20 for 20% off!", "error");
    }
};

window.removeItem = function (index) {
    let cart        = JSON.parse(localStorage.getItem("productsInCart")) || [];
    const removedName = cart[index] ? cart[index].name : "Item";
    cart.splice(index, 1);
    localStorage.setItem("productsInCart", JSON.stringify(cart));
    loadCart();
    updateCartCount();
    showToast(`${removedName} removed from cart`, "error");
};

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {
        if (e.target && e.target.id === "apply-coupon-btn") applyCoupon();
    });
    const cartElement = document.getElementById("cart-items-container");
    if (cartElement) loadCart();
});

/* ============================================================
   BUY NOW
   ============================================================ */
window.buyNow = function (productName, productPrice, productImage, quantity, size) {
    addToCart(productName, productPrice, productImage, quantity, size);
    setTimeout(function () { window.location.href = "checkout.html"; }, 1500);
};

/* ============================================================
   THEME TOGGLE
   ============================================================ */
(function () {
    const html       = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "light";
    html.setAttribute("data-theme", savedTheme);

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }

    function updateThemeIcon(theme) {
        const iconClass       = theme === "dark" ? "ri-sun-line" : "ri-moon-line";
        const themeIcon       = document.getElementById("themeIcon");
        const themeIconMobile = document.getElementById("themeIconMobile");
        if (themeIcon)       themeIcon.className       = iconClass;
        if (themeIconMobile) themeIconMobile.className = iconClass;

        const siteLogo = document.getElementById("siteLogo");
        if (siteLogo) siteLogo.src = theme === "dark" ? "images/Dlogo.png" : "images/logo.png";
    }

    function toggleTheme() {
gssoc-dark-theme-fix-1062
        const current = html.getAttribute('data-theme') || 'light';
        const newTheme = current === 'dark' ? 'light' : 'dark'; // fixed: was 'light' ? 'light' : 'dark'
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }

    // app.js loads at the bottom of <body> so the DOM is already parsed —
    // update the icon immediately without waiting for DOMContentLoaded.

  // delegated click (IMPORTANT for navbar injection)
    document.addEventListener("click", (e) => {

      // mobile menu open
      if (e.target.closest("#bar")) {
        document.getElementById("navbar")?.classList.add("active");
      }

      // mobile menu close
      if (e.target.closest("#close")) {
        document.getElementById("navbar")?.classList.remove("active");
      }

      // theme toggle
      if (e.target.closest("#themeToggle") ||
          e.target.closest("#themeToggleMobile")) {
        e.preventDefault();
        toggleTheme();
      }
    });
/* --- END: THEME TOGGLE FUNCTIONALITY --- */

        const isDark = document.body.classList.contains("dark");
        if (isDark) {
            document.body.classList.remove("dark");
            html.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
            updateThemeIcon("light");
        } else {
            document.body.classList.add("dark");
            html.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
            updateThemeIcon("dark");
        }
    }

    updateThemeIcon(savedTheme);

    document.addEventListener("click", function (e) {
        if (!e.target) return;
        if (e.target.closest("#themeToggle") || e.target.closest("#themeToggleMobile")) {
            e.preventDefault();
            toggleTheme();
        }
    });
main

    if (typeof MutationObserver !== "undefined") {
        const observer = new MutationObserver(() => {
            const activeTheme = html.getAttribute("data-theme") || "light";
            updateThemeIcon(activeTheme);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();

/* ============================================================
   PAGINATION
   ============================================================ */
(function () {
    const paginationSection = document.getElementById("pagination");
    if (!paginationSection) return;

    const productsPerPage = 16;
    const productSection  = document.getElementById("product1");
    if (!productSection) return;

    const productContainers = Array.from(productSection.querySelectorAll(".pro-container"));
    let allProducts = [];
    productContainers.forEach(container => {
        allProducts = allProducts.concat(Array.from(container.querySelectorAll(".pro")));
    });

    if (allProducts.length === 0) return;

    const totalPages = Math.ceil(allProducts.length / productsPerPage);

    if (productContainers.length > 1) {
        productContainers.forEach((container, index) => {
            if (index > 0) container.style.display = "none";
        });
    }

    window._showShopPage = function showPage(pageNumber) {
        allProducts.forEach(product => { product.style.display = "none"; });

        const startIndex      = (pageNumber - 1) * productsPerPage;
        const productsToShow  = allProducts.slice(startIndex, startIndex + productsPerPage);
        const firstContainer  = productContainers[0];

        firstContainer.innerHTML     = "";
        firstContainer.style.display = "flex";
        productsToShow.forEach(product => {
            product.style.display = "block";
            firstContainer.appendChild(product);
        });

        productSection.scrollIntoView({ behavior: "smooth", block: "start" });
        updatePaginationUI(pageNumber);
    };

    function updatePaginationUI(activePage) {
        paginationSection.innerHTML = "";

        const prevArrow = document.createElement("a");
        prevArrow.href  = "#";
        prevArrow.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
        prevArrow.classList.add("pagination-arrow");
        if (activePage === 1) prevArrow.classList.add("disabled");
        prevArrow.addEventListener("click", (e) => {
            e.preventDefault();
            if (activePage > 1) window._showShopPage(activePage - 1);
        });
        paginationSection.appendChild(prevArrow);

        for (let i = 1; i <= totalPages; i++) {
            const pageLink     = document.createElement("a");
            pageLink.href      = "#";
            pageLink.textContent = i;
            if (i === activePage) pageLink.classList.add("active");
            pageLink.addEventListener("click", (e) => {
                e.preventDefault();
                window._showShopPage(i);
            });
            paginationSection.appendChild(pageLink);
        }

        const nextArrow = document.createElement("a");
        nextArrow.href  = "#";
        nextArrow.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
        nextArrow.classList.add("pagination-arrow");
        if (activePage === totalPages) nextArrow.classList.add("disabled");
        nextArrow.addEventListener("click", (e) => {
            e.preventDefault();
            if (activePage < totalPages) window._showShopPage(activePage + 1);
        });
        paginationSection.appendChild(nextArrow);
    }

    window._showShopPage(1);
})();

/* ============================================================
   BACK TO TOP / SCROLL TO BOTTOM
   ============================================================ */
(function () {
    const backToTopBtn = document.getElementById("backToTop");
    const ToptobackBtn = document.getElementById("Toptoback");
    const topBtn       = document.getElementById("topBtn");

    if (backToTopBtn && ToptobackBtn) {
        window.addEventListener("scroll", () => {
            if (window.scrollY <= 300) {
                ToptobackBtn.classList.add("show");
                backToTopBtn.classList.remove("show");
            } else {
                backToTopBtn.classList.add("show");
                ToptobackBtn.classList.remove("show");
            }
        });

        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        ToptobackBtn.addEventListener("click", () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        });
    }

    if (topBtn) {
        window.onscroll = function () {
            topBtn.style.display =
                (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200)
                    ? "block" : "none";
        };
        topBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
})();

/* ============================================================
   STYLE QUIZ
   ============================================================ */
window.openQuiz = function () {
    const modal = document.getElementById("quiz-modal");
    if (modal) modal.style.display = "flex";
};

window.closeQuiz = function () {
    const modal = document.getElementById("quiz-modal");
    if (modal) modal.style.display = "none";
};

window.selectStyle = function (style) {
    window.closeQuiz();
    document.querySelectorAll(".pro").forEach(product => {
        product.style.display =
            product.getAttribute("data-category") === style ? "block" : "none";
    });
    const productSection = document.getElementById("product1");
    if (productSection) productSection.scrollIntoView({ behavior: "smooth", block: "start" });
    alert(`Showing ${style} style recommendations!`);
};

/* ============================================================
   SEARCH & FILTER
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
    const searchInput    = document.getElementById("searchInput");
    const searchBtn      = document.getElementById("searchBtn");
    const categoryFilter = document.getElementById("categoryFilter");

    if (!searchInput) return;

    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    const performSearch = () => {
        const searchTerm       = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter ? categoryFilter.value : "all";

        document.querySelectorAll(".pro").forEach(p => { p.style.display = "block"; });

        let visibleCount = 0;
        document.querySelectorAll(".pro").forEach(product => {
            const productName     = product.querySelector("h5")?.textContent.toLowerCase() || "";
            const productBrand    = product.querySelector(".des span")?.textContent.toLowerCase() || "";
            const productCategory = product.getAttribute("data-category") || "";

            const matchesSearch   = searchTerm === "" || productName.includes(searchTerm) || productBrand.includes(searchTerm);
            const matchesCategory = selectedCategory === "all" || productCategory === selectedCategory;

            if (matchesSearch && matchesCategory) {
                product.style.display = "block";
                visibleCount++;
            } else {
                product.style.display = "none";
            }
        });

        if (typeof window._showShopPage === "function") window._showShopPage(1);

        let noResultsMsg = document.getElementById("no-results-message");
        if (visibleCount === 0) {
            if (!noResultsMsg) {
                noResultsMsg          = document.createElement("div");
                noResultsMsg.id       = "no-results-message";
                noResultsMsg.innerHTML = `
                    <div class="no-results-content">
                        <i class="ri-search-line"></i>
                        <h3>No matching products found</h3>
                        <p></p>
                    </div>`;
                noResultsMsg.querySelector("p").textContent =
                    `We couldn't find any products matching "${searchInput.value}". Please try a different search term or change your category filter.`;
                const container = document.getElementById("shop-container");
                if (container) container.appendChild(noResultsMsg);
            } else {
                noResultsMsg.querySelector("p").textContent =
                    `We couldn't find any products matching "${searchInput.value}". Please try a different search term or change your category filter.`;
                noResultsMsg.style.display = "block";
            }
        } else {
            if (noResultsMsg) noResultsMsg.style.display = "none";
        }
    };

    searchInput.addEventListener("input", debounce(performSearch, 150));
    searchInput.addEventListener("keyup", (e) => { if (e.key === "Enter") performSearch(); });
    if (searchBtn)      searchBtn.addEventListener("click", performSearch);
    if (categoryFilter) categoryFilter.addEventListener("change", performSearch);
});

/* ============================================================
   SORT BY PRICE
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const sortMenu     = document.getElementById("sort-price");
    const proContainer = document.querySelector(".pro-container");

    if (sortMenu && proContainer) {
        const originalProducts = Array.from(proContainer.querySelectorAll(".pro"));
        sortMenu.addEventListener("change", (e) => {
            const sortValue = e.target.value;
            let productsToAppend;

            if (sortValue === "default") {
                productsToAppend = originalProducts;
            } else {
                productsToAppend = [...originalProducts].sort((a, b) => {
                    const priceA = parsePriceString(a.querySelector("h4")?.innerText);
                    const priceB = parsePriceString(b.querySelector("h4")?.innerText);
                    return sortValue === "low-high" ? priceA - priceB : priceB - priceA;
                });
            }
            productsToAppend.forEach(product => { proContainer.appendChild(product); });
        });
    }
});

/* ============================================================
   ANTI-GRAVITY EFFECT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("anti-gravity-active");
            } else {
                entry.target.classList.remove("anti-gravity-active");
            }
        });
    }, { threshold: 0.1 });

    function observeElements() {
        document.querySelectorAll(".pro:not(.ag-observed), .banner-box:not(.ag-observed)").forEach(target => {
            target.classList.add("ag-observed");
            observer.observe(target);
        });
    }

    observeElements();

    const mutationObserver = new MutationObserver(() => { observeElements(); });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
});

/* ============================================================
   GRID / LIST VIEW TOGGLE
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const searchFilterDiv = document.getElementById("search-filter");
    if (!searchFilterDiv) return;

    const toggleContainer       = document.createElement("div");
    toggleContainer.className   = "view-toggle-container";
    toggleContainer.innerHTML   = `
        <button id="gridViewBtn" class="view-btn active" aria-label="Grid View"><i class="fa-solid fa-border-all"></i></button>
        <button id="listViewBtn" class="view-btn"        aria-label="List View"><i class="fa-solid fa-list"></i></button>
    `;
    searchFilterDiv.appendChild(toggleContainer);

    const proContainer = document.querySelector(".pro-container");
    const gridBtn      = document.getElementById("gridViewBtn");
    const listBtn      = document.getElementById("listViewBtn");

    if (proContainer && gridBtn && listBtn) {
        gridBtn.addEventListener("click", () => {
            proContainer.classList.remove("list-view");
            gridBtn.classList.add("active");
            listBtn.classList.remove("active");
        });
        listBtn.addEventListener("click", () => {
            proContainer.classList.add("list-view");
            listBtn.classList.add("active");
            gridBtn.classList.remove("active");
        });
    }
});

/* ============================================================
   BRAND CARD / SCROLL OBSERVER
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const brandCard     = document.getElementById("brandCard");
    const cardContainer = document.getElementById("cardContainer");
    const statusText    = document.getElementById("statusText");
    const featureSection = document.getElementById("interactive-feature-wrapper");

    if (brandCard && cardContainer) {
        brandCard.addEventListener("click", () => {
            const isOpen = cardContainer.classList.toggle("open");
            if (statusText) statusText.innerText = isOpen ? "Click to collapse" : "Click to expand";
        });
    }

    if (featureSection && cardContainer) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cardContainer.classList.add("open");
                    if (statusText) statusText.innerText = "Click to collapse";
                    scrollObserver.unobserve(featureSection);
                }
            });
        }, { root: null, threshold: 0, rootMargin: "0px 0px -10% 0px" });

        scrollObserver.observe(featureSection);
    }
});

/* ============================================================
   HERO SLIDER
   ============================================================ */
function initHeroSlider() {
    const slider = document.querySelector(".hero-slider");
    if (!slider) return;

    const slides  = slider.querySelectorAll(".slide");
    const prevBtn = slider.querySelector(".slider-btn.prev");
    const nextBtn = slider.querySelector(".slider-btn.next");
    const dots    = slider.querySelectorAll(".slider-dots .dot");

    if (slides.length === 0) return;

    let currentSlide    = 0;
    let autoPlayInterval;
    const intervalTime  = 5000;

    function updateSlider() {
        slides.forEach(s => s.classList.remove("active"));
        dots.forEach(d   => d.classList.remove("active"));
        slides[currentSlide].classList.add("active");
        if (dots[currentSlide]) dots[currentSlide].classList.add("active");
    }

    function nextSlide() { currentSlide = (currentSlide + 1) % slides.length; updateSlider(); }
    function prevSlide() { currentSlide = (currentSlide - 1 + slides.length) % slides.length; updateSlider(); }
    function resetAutoPlay() { clearInterval(autoPlayInterval); autoPlayInterval = setInterval(nextSlide, intervalTime); }

    if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); resetAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); resetAutoPlay(); });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => { currentSlide = index; updateSlider(); resetAutoPlay(); });
    });

    resetAutoPlay();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroSlider);
} else {
    initHeroSlider();
}

/* ============================================================
   CURRENT YEAR
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const year = new Date().getFullYear();
    document.querySelectorAll(".Current-Year").forEach(el => { el.textContent = year; });
});

gssoc-dark-theme-fix-1062
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
    '<span class="toast-msg"></span>' +
    '<button class="toast-close" aria-label="Close notification">&times;</button>' +
    '<div class="toast-progress"></div>';
  toast.querySelector('.toast-msg').textContent = message;

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
    
    // Clamp quantity between 1 and 99
    if (newValue < 1) newValue = 1;
    if (newValue > 99) newValue = 99;
    
    qtyInput.value = newValue;

    // Dynamically update minus and plus button disabled states
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    
    if (minusBtn) {
      minusBtn.disabled = (newValue <= 1);
    }
    if (plusBtn) {
      plusBtn.disabled = (newValue >= 99);
    }
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
    const isDark = document.body.classList.contains('dark');

    if (isDark) {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        updateThemeIcon('light');
    } else {
        
        localStorage.setItem('theme', 'dark');
        updateThemeIcon('dark');
    }
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

  window._showShopPage = function showPage(pageNumber) {
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

/* ============================================================
   RESET FILTERS BUTTON
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const resetBtn = document.getElementById("resetFiltersBtn");
    if (!resetBtn) return;
  main

    resetBtn.addEventListener("click", () => {
        const categoryFilter = document.getElementById("categoryFilter");
        const styleFilter    = document.getElementById("style-filter");
        const brandFilter    = document.getElementById("brand-filter");
        const colorFilter    = document.getElementById("color-filter");
        const searchInput    = document.getElementById("searchInput");
        const suggestions    = document.getElementById("searchSuggestions");

        if (categoryFilter) categoryFilter.value = "all";
        if (styleFilter)    styleFilter.value    = "all";
        if (brandFilter)    brandFilter.value    = "all";
        if (colorFilter)    colorFilter.value    = "all";
        if (searchInput)    searchInput.value    = "";
        if (suggestions)    suggestions.innerHTML = "";

        location.reload();
    });
});

/* ============================================================
   COLLABORATIVE WARDROBE SHARING ENGINE
   ============================================================ */
window.pendingSharedCart = null;

// NOTE: intentionally named showWardrobeToast to avoid overwriting the global showToast
function showWardrobeToast(msg, isError) {
    showToast(msg, isError ? "error" : "success");
}

window.shareWardrobe = function () {
    var cart = JSON.parse(localStorage.getItem("productsInCart")) || [];
    var btn  = document.getElementById("share-cart-btn");

    if (cart.length === 0) {
        showToast("Your cart is empty! Add some items before sharing.", "error");
        return;
    }
    try {
        var minimizedCart  = cart.map(function (item) {
            return { n: item.name, p: item.price, i: item.image, q: item.quantity, s: item.size };
        });
        var base64Payload  = btoa(unescape(encodeURIComponent(JSON.stringify(minimizedCart))));
        var shareUrl       = window.location.origin + window.location.pathname + "#share=" + base64Payload;

        showToast("Wardrobe share link copied to clipboard!", "success");

        if (btn) {
            var originalText = btn.innerHTML;
            btn.innerHTML = '✅ Link Copied!';
            btn.style.color = '#10b991';
            setTimeout(function () { btn.innerHTML = originalText; btn.style.color = ''; }, 3000);
        }
    } catch (e) {
        console.error("Failed to generate share link: ", e);
        showToast("Oops, something went wrong generating the link.", "error");
    }
};

function fallbackCopyText(text) {
    try {
        var textArea          = document.createElement("textarea");
        textArea.value        = text;
        textArea.style.cssText = "position:fixed;opacity:0;left:-9999px;";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
    } catch (err) {
        console.error("Fallback copy failed", err);
    }
}

window.closeShareModal = function () {
    var modal = document.getElementById("share-modal");
    if (modal) modal.style.display = "none";
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname);
    } else {
        window.location.hash = "";
    }
    window.pendingSharedCart = null;
};

window.checkSharedWardrobe = function () {
    var hash = window.location.hash;
    if (!hash || hash.indexOf("#share=") !== 0) return;

    try {
        var base64Payload = hash.substring(7);
        var decodedCart   = JSON.parse(decodeURIComponent(escape(atob(base64Payload))));

        if (!Array.isArray(decodedCart) || decodedCart.length === 0) {
            showToast("Invalid share link or empty shared collection.", "error");
            return;
        }

        window.pendingSharedCart = decodedCart.map(function (item) {
            return {
                name:     item.n || "Fashion Product",
                price:    parseFloat(item.p) || 0,
                image:    item.i || "images/products/f1.jpg",
                quantity: parseInt(item.q) || 1,
                size:     item.s || "M"
            };
        });

        var listContainer = document.getElementById("shared-items-list");
        var totalPriceEl  = document.getElementById("shared-total-price");
        var modal         = document.getElementById("share-modal");
        if (!listContainer || !totalPriceEl || !modal) return;

        listContainer.innerHTML = "";
        var total = 0;

        window.pendingSharedCart.forEach(function (item) {
            var itemSubtotal = item.price * item.quantity;
            total           += itemSubtotal;

            var row      = document.createElement("div");
            row.className = "shared-item-row";

            var img      = document.createElement("img");
            img.src      = item.image;
            img.className = "shared-item-img";
            img.alt      = item.name;

            var details  = document.createElement("div");
            details.className = "shared-item-details";

            var nameEl   = document.createElement("h4");
            nameEl.className = "shared-item-name";
            nameEl.textContent = item.name;

            var meta     = document.createElement("span");
            meta.className = "shared-item-meta";
            meta.textContent = "Size: " + item.size + "  |  Qty: " + item.quantity;

            details.appendChild(nameEl);
            details.appendChild(meta);

            var priceEl  = document.createElement("div");
            priceEl.className = "shared-item-price";
            priceEl.textContent = formatCurrency(itemSubtotal);

            row.appendChild(img);
            row.appendChild(details);
            row.appendChild(priceEl);
            listContainer.appendChild(row);
        });

        totalPriceEl.textContent = formatCurrency(total);
        modal.style.display      = "flex";
    } catch (err) {
        console.error("Failed to parse shared wardrobe link:", err);
        showToast("Could not read shared wardrobe link. It may be broken.", "error");
    }
};

window.applySharedCart = function (action) {
    if (!window.pendingSharedCart || window.pendingSharedCart.length === 0) {
        window.closeShareModal();
        return;
    }

    var localCart = JSON.parse(localStorage.getItem("productsInCart")) || [];

    if (action === "overwrite") {
        localCart = window.pendingSharedCart.slice();
        showToast("Cart replaced with shared wardrobe!", "success");
    } else if (action === "merge") {
        window.pendingSharedCart.forEach(function (sharedItem) {
            var existing = localCart.find(function (item) {
                return item.name === sharedItem.name && item.size === sharedItem.size;
            });
            if (existing) { existing.quantity += sharedItem.quantity; }
            else          { localCart.push(sharedItem); }
        });
        showToast("Shared wardrobe merged into your cart!", "success");
    }

    localStorage.setItem("productsInCart", JSON.stringify(localCart));
    window.closeShareModal();
    if (typeof loadCart        === "function") loadCart();
    if (typeof updateCartCount === "function") updateCartCount();
};

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(window.checkSharedWardrobe, 150);
});

/* ============================================================
   SAVE FOR LATER
   ============================================================ */
window.saveForLater = function (index) {
    let cart  = JSON.parse(localStorage.getItem("productsInCart")) || [];
    let saved = JSON.parse(localStorage.getItem("savedItems"))     || [];

    if (index >= 0 && index < cart.length) {
        saved.push(cart.splice(index, 1)[0]);
        localStorage.setItem("productsInCart", JSON.stringify(cart));
        localStorage.setItem("savedItems",     JSON.stringify(saved));
        if (typeof window.loadCart       === "function") window.loadCart();
        showToast("Item saved for later", "success");
    }
};

window.moveToCart = function (index) {
    let cart  = JSON.parse(localStorage.getItem("productsInCart")) || [];
    let saved = JSON.parse(localStorage.getItem("savedItems"))     || [];

    if (index >= 0 && index < saved.length) {
        cart.push(saved.splice(index, 1)[0]);
        localStorage.setItem("productsInCart", JSON.stringify(cart));
        localStorage.setItem("savedItems",     JSON.stringify(saved));
        if (typeof window.loadCart       === "function") window.loadCart();
        showToast("Item moved to cart", "success");
    }
};

window.removeSavedItem = function (index) {
    let saved = JSON.parse(localStorage.getItem("savedItems")) || [];
    if (index >= 0 && index < saved.length) {
        saved.splice(index, 1);
        localStorage.setItem("savedItems", JSON.stringify(saved));
        if (typeof window.loadSavedItems === "function") window.loadSavedItems();
        showToast("Saved item removed", "success");
    }
};

window.loadSavedItems = function () {
    let saved            = JSON.parse(localStorage.getItem("savedItems")) || [];
    const savedContainer = document.getElementById("saved-items-container");
    const savedSection   = document.getElementById("saved-items-section");
    if (!savedContainer || !savedSection) return;

    if (saved.length === 0) {
        savedSection.style.display = "none";
        return;
    }

    savedSection.style.display  = "block";
    savedContainer.innerHTML    = "";

    saved.forEach((item, index) => {
        const itemPrice      = parsePriceString(item.price);
        const formattedPrice = formatCurrency(itemPrice);

        const row       = document.createElement("div");
        row.className   = "cart-item-row";
        row.innerHTML   = `
            <div class="cart-item-left" style="opacity:0.8;">
                <div class="cart-item-img-wrap">
                    <img src="${item.image}" alt="${item.name}" loading="lazy" />
                </div>
                <div class="cart-item-details">
                    <span class="cart-item-brand">${item.brand || "Premium Brand"}</span>
                    <h5 class="cart-item-title">${item.name}</h5>
                    <span class="cart-item-size">Size: ${item.size}</span>
                </div>
            </div>
            <div class="cart-item-right" style="flex-direction:row;align-items:center;justify-content:space-between;">
                <div class="cart-item-price">${formattedPrice}</div>
                <div class="cart-item-actions" style="display:flex;gap:8px;">
                    <button class="cart-item-move" aria-label="Move to cart"
                        onclick="moveToCart(${index})" title="Move to Cart"
                        style="color:var(--accent);background:none;border:none;font-size:20px;cursor:pointer;">
                        <i class="ri-shopping-cart-2-line"></i>
                    </button>
                    <button class="cart-item-remove" aria-label="Remove item"
                        onclick="removeSavedItem(${index})" title="Remove"
                        style="color:var(--text-secondary);background:none;border:none;font-size:20px;cursor:pointer;">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
        `;
        savedContainer.appendChild(row);
    });
};

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("saved-items-container")) {
        if (typeof window.loadSavedItems === "function") window.loadSavedItems();
    }
});

/* ============================================================
   PRODUCT QUICK-VIEW MODAL
   ============================================================ */
(function () {
    const modalHTML = `
        <div class="quickview-modal" id="quickViewModal" role="dialog" aria-modal="true" aria-hidden="true">
            <div class="quickview-content">
                <button class="quickview-close" aria-label="Close modal">&times;</button>
                <div class="quickview-left">
                    <img id="qvModalImg" src="" alt="Product Image">
                </div>
                <div class="quickview-right">
                    <span class="quickview-brand" id="qvModalBrand">Brand</span>
                    <h3 class="quickview-title" id="qvModalTitle">Product Title</h3>
                    <div class="quickview-stars" id="qvModalStars"></div>
                    <div class="quickview-price" id="qvModalPrice">₹0.00</div>
                    <div class="quickview-selects">
                        <div class="quickview-select-wrap">
                            <label for="qvModalSize">Size</label>
                            <select id="qvModalSize">
                                <option value="Select Size" disabled selected>Select Size</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                            </select>
                        </div>
                        <div class="quickview-select-wrap">
                            <label>Quantity</label>
                            <div class="quickview-qty-container">
                                <button type="button" class="quickview-qty-btn minus" id="qvQtyMinus">-</button>
                                <input type="number" class="quickview-qty-input" id="qvQtyInput" value="1" min="1" readonly>
                                <button type="button" class="quickview-qty-btn plus" id="qvQtyPlus">+</button>
                            </div>
                        </div>
                    </div>
                    <div class="quickview-actions">
                        <button type="button" class="quickview-btn cart-btn" id="qvAddToCartBtn">ADD TO CART</button>
                        <button type="button" class="quickview-btn buy-btn"  id="qvBuyNowBtn">BUY NOW</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.addEventListener("DOMContentLoaded", () => {
        const div   = document.createElement("div");
        div.innerHTML = modalHTML;
        document.body.appendChild(div.firstElementChild);

        const modal    = document.getElementById("quickViewModal");
        const closeBtn = modal.querySelector(".quickview-close");
        const qtyInput = document.getElementById("qvQtyInput");
        const qtyMinus = document.getElementById("qvQtyMinus");
        const qtyPlus  = document.getElementById("qvQtyPlus");

        const closeModal = () => {
            modal.classList.remove("active");
            modal.setAttribute("aria-hidden", "true");
        };

        closeBtn.addEventListener("click", closeModal);
        modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
        });

        qtyMinus.addEventListener("click", () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) qtyInput.value = val - 1;
        });
        qtyPlus.addEventListener("click", () => {
            qtyInput.value = parseInt(qtyInput.value) + 1;
        });

        injectQuickViewOverlays();
        setTimeout(injectQuickViewOverlays, 500);
        setTimeout(injectQuickViewOverlays, 1500);
    });

    function injectQuickViewOverlays() {
        document.querySelectorAll(".pro").forEach(card => {
            const imgWrap = card.querySelector(".pro-img-wrap");
            if (imgWrap && !imgWrap.querySelector(".pro-quick-view-overlay")) {
                const qvOverlay   = document.createElement("div");
                qvOverlay.className = "pro-quick-view-overlay";

                const qvBtn     = document.createElement("button");
                qvBtn.className = "pro-quick-view-btn";
                qvBtn.type      = "button";
                qvBtn.innerHTML = '<i class="ri-eye-line"></i> Quick View';

                qvBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    const name  = card.querySelector("h5")?.textContent.trim() || "";
                    const price = card.querySelector("h4")?.textContent.trim() || "";
                    const brand = (card.querySelector(".pro-brand-row span") || card.querySelector(".des span"))?.textContent.trim() || "";
                    const img   = card.querySelector("img")?.src || "";
                    const rating = card.querySelectorAll(".star i.ri-star-fill").length ||
                                   card.querySelectorAll(".star i.fa-star").length || 5;

                    window.openQuickViewModal({ name, price, brand, img, rating });
                });

                qvOverlay.appendChild(qvBtn);
                imgWrap.appendChild(qvOverlay);
            }
        });
    }

    window.openQuickViewModal = function (product) {
        const modal = document.getElementById("quickViewModal");
        if (!modal) return;

        document.getElementById("qvQtyInput").value       = "1";
        document.getElementById("qvModalImg").src         = product.img;
        document.getElementById("qvModalImg").alt         = product.name;
        document.getElementById("qvModalBrand").textContent = product.brand;
        document.getElementById("qvModalTitle").textContent = product.name;
        document.getElementById("qvModalPrice").textContent = product.price;

        const starsContainer = document.getElementById("qvModalStars");
        starsContainer.innerHTML = "";
        for (let i = 0; i < (product.rating || 5); i++) {
            const star   = document.createElement("i");
            star.className = "ri-star-fill";
            starsContainer.appendChild(star);
        }

        const addToCartBtn = document.getElementById("qvAddToCartBtn");
        const buyNowBtn    = document.getElementById("qvBuyNowBtn");

        const newAddToCart = addToCartBtn.cloneNode(true);
        const newBuyNow    = buyNowBtn.cloneNode(true);
        addToCartBtn.parentNode.replaceChild(newAddToCart, addToCartBtn);
        buyNowBtn.parentNode.replaceChild(newBuyNow,    buyNowBtn);

        newAddToCart.addEventListener("click", () => {
            const size = document.getElementById("qvModalSize").value;
            const qty  = parseInt(document.getElementById("qvQtyInput").value);
            addToCart(product.name, product.price, product.img, qty, size);
            modal.classList.remove("active");
        });

        newBuyNow.addEventListener("click", () => {
            const size = document.getElementById("qvModalSize").value;
            const qty  = parseInt(document.getElementById("qvQtyInput").value);
            modal.classList.remove("active");
            window.buyNow(product.name, product.price, product.img, qty, size);
        });

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
    };
    window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});
})();
/* --- END: PRODUCT QUICK-VIEW MODAL FUNCTIONALITY --- */
