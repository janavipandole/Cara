/* ============================================
   THEME TOGGLE FUNCTIONALITY
============================================ */

(function () {

    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');

    const themeIcon = document.getElementById('themeIcon');
    const themeIconMobile = document.getElementById('themeIconMobile');

    const html = document.documentElement;

    const currentTheme =
        localStorage.getItem('theme') || 'light';

    html.setAttribute('data-theme', currentTheme);

    updateThemeIcon(currentTheme);

    function updateThemeIcon(theme) {

        const iconClass =
            theme === 'dark'
                ? 'ri-sun-line'
                : 'ri-moon-line';

        if (themeIcon) {
            themeIcon.className = iconClass;
        }

        if (themeIconMobile) {
            themeIconMobile.className = iconClass;
        }

        const siteLogo =
            document.getElementById('siteLogo');

        if (siteLogo) {

            siteLogo.src =
                theme === 'dark'
                    ? 'images/Dlogo.png'
                    : 'images/logo.png';
        }
    }

    function toggleTheme() {

        const currentTheme =
            html.getAttribute('data-theme');

        const newTheme =
            currentTheme === 'dark'
                ? 'light'
                : 'dark';

        html.setAttribute('data-theme', newTheme);

        localStorage.setItem('theme', newTheme);

        updateThemeIcon(newTheme);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }

})();

/* ============================================
   MOBILE MENU FUNCTIONALITY
============================================ */

document.addEventListener('click', function (e) {

    const nav =
        document.getElementById('navbar');

    // OPEN MENU
    if (e.target.id === 'bar') {

        if (nav) {
            nav.classList.add('active');
        }
    }

    // CLOSE MENU
    if (e.target.closest('#close')) {

        e.preventDefault();

        if (nav) {
            nav.classList.remove('active');
        }
    }
});

/* ============================================
   MOBILE DROPDOWN TOGGLE
============================================ */

const dropdowns =
    document.querySelectorAll('.dropdown');

dropdowns.forEach((dropdown) => {

    const toggle =
        dropdown.querySelector('.dropdown-toggle');

    if (!toggle) return;

    toggle.addEventListener('click', (e) => {

        if (window.innerWidth <= 799) {

            e.preventDefault();

            dropdown.classList.toggle('active');
        }
    });
});

/* ============================================
   AUTH UI
============================================ */

function updateAuthUI() {

    const loginBtn =
        document.getElementById('login-btn');

    const loggedInUser =
        localStorage.getItem('loggedInUser');

    if (!loginBtn) return;

    loginBtn.style.display =
        loggedInUser
            ? 'none'
            : 'block';
}

document.addEventListener(
    'DOMContentLoaded',
    updateAuthUI
);

/* ============================================
   PRODUCT CARD CLICK
============================================ */

document.addEventListener('click', function (e) {

    const proCard = e.target.closest('.pro');

    if (!proCard) return;

    if (
        e.target.closest('.cart') ||
        e.target.closest('.buy-now-btn')
    ) {
        return;
    }

    const selectedProduct = {
        name:
            proCard.querySelector('h5')?.textContent.trim()
            || 'Product',

        price:
            proCard.querySelector('h4')?.textContent.trim()
            || '₹0',

        brand:
            proCard.querySelector('.des span')?.textContent.trim()
            || 'Brand',

        image:
            proCard.querySelector('img')?.src
            || ''
    };

    localStorage.setItem(
        'selectedProduct',
        JSON.stringify(selectedProduct)
    );

    window.location.href = 'singleProduct.html';

}, true);

/* ============================================
   SINGLE PRODUCT PAGE
============================================ */

document.addEventListener('DOMContentLoaded', () => {

    if (!window.location.pathname.includes('singleProduct')) {
        return;
    }

    const storedProduct =
        localStorage.getItem('selectedProduct');

    if (storedProduct) {

        try {

            const product = JSON.parse(storedProduct);

            const nameEl =
                document.getElementById('product-name');

            const priceEl =
                document.getElementById('product-price');

            const mainImgEl =
                document.getElementById('MainImg');

            if (nameEl) {
                nameEl.textContent = product.name;
            }

            if (priceEl) {
                priceEl.textContent = product.price;
            }

            if (mainImgEl) {
                mainImgEl.src = product.image;
            }

        } catch (err) {
            console.error(err);
        }
    }

    const MainImg = document.getElementById('MainImg');

    const smallImgs =
        document.querySelectorAll('.small-img');

    smallImgs.forEach((img) => {

        img.addEventListener('click', () => {

            if (MainImg) {
                MainImg.src = img.src;
            }
        });
    });
});

/* ============================================
   BUTTON RIPPLE EFFECT
============================================ */

document.addEventListener('DOMContentLoaded', () => {

    const buttons =
        document.querySelectorAll(
            'button.normal, button.white'
        );

    buttons.forEach((button) => {

        button.addEventListener('click', function (e) {

            const rect =
                this.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple =
                document.createElement('span');

            ripple.classList.add('ripple-effect');

            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            ripple.addEventListener(
                'animationend',
                () => ripple.remove()
            );
        });
    });
});

/* ============================================
   CART FUNCTIONALITY
============================================ */

function updateCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem('productsInCart')
        ) || [];

    const totalItems =
        cart.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

    const desktopCount =
        document.getElementById('desktopCartCount');

    const mobileCount =
        document.getElementById('mobileCartCount');

    if (desktopCount) {
        desktopCount.textContent = totalItems;
    }

    if (mobileCount) {
        mobileCount.textContent = totalItems;
    }
}

document.addEventListener(
    'DOMContentLoaded',
    updateCartCount
);

function addToCart(
    productName,
    productPrice,
    productImage,
    quantity,
    size
) {

    let cart =
        JSON.parse(
            localStorage.getItem('productsInCart')
        ) || [];

    const item = {

        name: productName,

        price: parseFloat(
            productPrice.replace(/[₹$,]/g, '')
        ),

        image: productImage,

        quantity: parseInt(quantity),

        size: size
    };

    const existingItem =
        cart.find(
            (p) =>
                p.name === item.name &&
                p.size === item.size
        );

    if (existingItem) {

        existingItem.quantity += item.quantity;

    } else {

        cart.push(item);
    }

    localStorage.setItem(
        'productsInCart',
        JSON.stringify(cart)
    );

    showToast(`${item.name} added to cart!`);

    updateCartCount();
}

function showToast(message, type = 'success') {

    let container =
        document.getElementById('toast-container');

    if (!container) {

        container = document.createElement('div');

        container.id = 'toast-container';

        document.body.appendChild(container);
    }

    const toast =
        document.createElement('div');

    toast.className = `toast toast-${type}`;

    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    toast
        .querySelector('.toast-close')
        .addEventListener('click', () => {
            toast.remove();
        });

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

window.handleAddToCart = function () {

    const name =
        document.getElementById('product-name')
            ?.innerText;

    const price =
        document.getElementById('product-price')
            ?.innerText;

    const size =
        document.getElementById('product-size')
            ?.value;

    const quantity =
        document.getElementById('product-quantity')
            ?.value;

    const image =
        document.getElementById('MainImg')
            ?.src;

    if (!size || size === 'Select Size') {

        showToast(
            'Please select a size.',
            'warning'
        );

        return;
    }

    addToCart(
        name,
        price,
        image,
        quantity,
        size
    );
};

window.handleBuyNow = function () {

    const nameElement =
        document.getElementById('product-name');

    const priceElement =
        document.getElementById('product-price');

    const sizeSelect =
        document.getElementById('product-size');

    const quantityInput =
        document.getElementById('product-quantity');

    const imageElement =
        document.getElementById('MainImg');

    if (
        !nameElement ||
        !priceElement ||
        !sizeSelect ||
        !quantityInput ||
        !imageElement
    ) {
        console.error('Missing product elements.');
        return;
    }

    const name = nameElement.innerText;
    const price = priceElement.innerText;
    const size = sizeSelect.value;
    const quantity = parseInt(quantityInput.value);
    const image = imageElement.src;

    if (size === 'Select Size' || size === '') {

        showToast(
            'Please select a size.',
            'warning'
        );

        return;
    }

    if (quantity < 1 || isNaN(quantity)) {

        showToast(
            'Please enter valid quantity.',
            'warning'
        );

        return;
    }

    buyNow(
        name,
        price,
        image,
        quantity,
        size
    );
};

window.appliedCoupon =
    localStorage.getItem('appliedCoupon')
    || null;