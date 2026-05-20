/* ============================================
   THEME TOGGLE FUNCTIONALITY
============================================ */

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
        const iconClass = theme === 'dark'
            ? 'ri-sun-line'
            : 'ri-moon-line';

        if (themeIcon) themeIcon.className = iconClass;
        if (themeIconMobile) themeIconMobile.className = iconClass;

        const siteLogo = document.getElementById('siteLogo');

        if (siteLogo) {
            siteLogo.src =
                theme === 'dark'
                    ? 'images/Dlogo.png'
                    : 'images/logo.png';
        }
    }

    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');

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
   MOBILE MENU
============================================ */

const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const close = document.getElementById('close');

if (bar && nav) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close && nav) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

/* ============================================
   MOBILE DROPDOWN TOGGLE
============================================ */

const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach((dropdown) => {

    const toggle = dropdown.querySelector('.dropdown-toggle');

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

    const loginBtn = document.getElementById('login-btn');

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

window.removeItem = function (index) {

    let cart =
        JSON.parse(
            localStorage.getItem('productsInCart')
        ) || [];

    cart.splice(index, 1);

    localStorage.setItem(
        'productsInCart',
        JSON.stringify(cart)
    );

    loadCart();

    updateCartCount();
};

window.changeQuantity = function (index, change) {

    let cart =
        JSON.parse(
            localStorage.getItem('productsInCart')
        ) || [];

    if (!cart[index]) return;

    cart[index].quantity += change;

    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }

    localStorage.setItem(
        'productsInCart',
        JSON.stringify(cart)
    );

    loadCart();

    updateCartCount();
};

window.loadCart = function () {

    const cart =
        JSON.parse(
            localStorage.getItem('productsInCart')
        ) || [];

    const itemsContainer =
        document.getElementById(
            'cart-items-container'
        );

    if (!itemsContainer) return;

    itemsContainer.innerHTML = '';

    let total = 0;

    cart.forEach((item, index) => {

        total += item.price * item.quantity;

        const row =
            document.createElement('div');

        row.className = 'cart-item-row';

        row.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            
            <div>
                <h4>${item.name}</h4>
                <p>Size: ${item.size}</p>
                <p>₹${item.price}</p>
            </div>

            <div>
                <button onclick="changeQuantity(${index}, -1)">-</button>

                <span>${item.quantity}</span>

                <button onclick="changeQuantity(${index}, 1)">+</button>
            </div>

            <button onclick="removeItem(${index})">
                Remove
            </button>
        `;

        itemsContainer.appendChild(row);
    });

    const totalEl =
        document.getElementById('summary-total');

    if (totalEl) {
        totalEl.innerText = `₹${total}`;
    }
};

document.addEventListener('DOMContentLoaded', () => {

    const cartElement =
        document.getElementById(
            'cart-items-container'
        );

    if (cartElement) {
        loadCart();
    }
});

/* ============================================
   PAGINATION
============================================ */

(function () {

    const paginationSection =
        document.getElementById('pagination');

    const productSection =
        document.getElementById('product1');

    if (!paginationSection || !productSection) {
        return;
    }

    const productsPerPage = 16;

    const allProducts =
        Array.from(
            productSection.querySelectorAll('.pro')
        );

    let currentPage = 1;

    const totalPages =
        Math.ceil(
            allProducts.length / productsPerPage
        );

    function showPage(page) {

        allProducts.forEach(
            product => product.style.display = 'none'
        );

        const start =
            (page - 1) * productsPerPage;

        const end =
            start + productsPerPage;

        allProducts
            .slice(start, end)
            .forEach(product => {
                product.style.display = 'block';
            });

        renderPagination(page);
    }

    function renderPagination(activePage) {

        paginationSection.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {

            const link =
                document.createElement('a');

            link.href = '#';

            link.textContent = i;

            if (i === activePage) {
                link.classList.add('active');
            }

            link.addEventListener('click', (e) => {

                e.preventDefault();

                currentPage = i;

                showPage(currentPage);
            });

            paginationSection.appendChild(link);
        }
    }

    showPage(currentPage);

})();

/* ============================================
   BACK TO TOP BUTTON
============================================ */

const backToTopBtn =
    document.getElementById('backToTop');

const ToptobackBtn =
    document.getElementById('Toptoback');

window.addEventListener('scroll', () => {

    if (!backToTopBtn || !ToptobackBtn) return;

    if (window.scrollY > 300) {

        backToTopBtn.classList.add('show');

        ToptobackBtn.classList.remove('show');

    } else {

        ToptobackBtn.classList.add('show');

        backToTopBtn.classList.remove('show');
    }
});

if (backToTopBtn) {

    backToTopBtn.addEventListener('click', () => {

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

if (ToptobackBtn) {

    ToptobackBtn.addEventListener('click', () => {

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    });
}

/* ============================================
   STYLE QUIZ
============================================ */

window.openQuiz = function () {

    const modal =
        document.getElementById('quiz-modal');

    if (modal) {
        modal.style.display = 'flex';
    }
};

window.closeQuiz = function () {

    const modal =
        document.getElementById('quiz-modal');

    if (modal) {
        modal.style.display = 'none';
    }
};

window.selectStyle = function (style) {

    closeQuiz();

    const products =
        document.querySelectorAll('.pro');

    products.forEach((product) => {

        if (
            product.getAttribute('data-category')
            === style
        ) {

            product.style.display = 'block';

        } else {

            product.style.display = 'none';
        }
    });

    const productSection =
        document.getElementById('product1');

    if (productSection) {

        productSection.scrollIntoView({
            behavior: 'smooth'
        });
    }
};

/* ============================================
   BUY NOW
============================================ */

window.buyNow = function (
    productName,
    productPrice,
    productImage,
    quantity,
    size
) {

    addToCart(
        productName,
        productPrice,
        productImage,
        quantity,
        size
    );

    setTimeout(() => {

        window.location.href =
            'checkout.html';

    }, 1000);
};

/* ============================================
   SEARCH AND FILTER
============================================ */

document.addEventListener(
    'DOMContentLoaded',
    function () {

        const searchInput =
            document.getElementById('searchInput');

        const categoryFilter =
            document.getElementById(
                'categoryFilter'
            );

        if (!searchInput) return;

        function performSearch() {

            const searchTerm =
                searchInput.value
                    .toLowerCase()
                    .trim();

            const selectedCategory =
                categoryFilter
                    ? categoryFilter.value
                    : 'all';

            const products =
                document.querySelectorAll('.pro');

            products.forEach((product) => {

                const name =
                    product.querySelector('h5')
                        ?.textContent
                        .toLowerCase() || '';

                const brand =
                    product.querySelector('.des span')
                        ?.textContent
                        .toLowerCase() || '';

                const category =
                    product.getAttribute(
                        'data-category'
                    ) || '';

                const matchesSearch =
                    name.includes(searchTerm) ||
                    brand.includes(searchTerm);

                const matchesCategory =
                    selectedCategory === 'all' ||
                    category === selectedCategory;

                product.style.display =
                    matchesSearch && matchesCategory
                        ? 'block'
                        : 'none';
            });
        }

        searchInput.addEventListener(
            'input',
            performSearch
        );

        if (categoryFilter) {

            categoryFilter.addEventListener(
                'change',
                performSearch
            );
        }
    }
);

/* ============================================
   HERO SLIDER
============================================ */

function initHeroSlider() {

    const slider =
        document.querySelector('.hero-slider');

    if (!slider) return;

    const slides =
        slider.querySelectorAll('.slide');

    const prevBtn =
        slider.querySelector('.slider-btn.prev');

    const nextBtn =
        slider.querySelector('.slider-btn.next');

    const dots =
        slider.querySelectorAll('.dot');

    let currentSlide = 0;

    function updateSlider() {

        slides.forEach(slide => {
            slide.classList.remove('active');
        });

        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        slides[currentSlide]?.classList.add('active');

        dots[currentSlide]?.classList.add('active');
    }

    function nextSlide() {

        currentSlide =
            (currentSlide + 1) % slides.length;

        updateSlider();
    }

    function prevSlide() {

        currentSlide =
            (currentSlide - 1 + slides.length)
            % slides.length;

        updateSlider();
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    dots.forEach((dot, index) => {

        dot.addEventListener('click', () => {

            currentSlide = index;

            updateSlider();
        });
    });

    setInterval(nextSlide, 5000);

    updateSlider();
}

document.addEventListener(
    'DOMContentLoaded',
    initHeroSlider
);

/* ============================================
   CURRENT YEAR
============================================ */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const year =
            new Date().getFullYear();

        document
            .querySelectorAll('.Current-Year')
            .forEach((el) => {
                el.textContent = year;
            });
    }
);

/* ============================================
   SORT BY PRICE
============================================ */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const sortMenu =
            document.getElementById('sort-price');

        const proContainer =
            document.querySelector('.pro-container');

        if (!sortMenu || !proContainer) return;

        const originalProducts =
            Array.from(
                proContainer.querySelectorAll('.pro')
            );

        sortMenu.addEventListener(
            'change',
            (e) => {

                const value = e.target.value;

                let products =
                    [...originalProducts];

                if (value === 'low-high') {

                    products.sort((a, b) => {

                        const priceA =
                            parseFloat(
                                a.querySelector('h4')
                                    .innerText
                                    .replace(/[₹$,]/g, '')
                            );

                        const priceB =
                            parseFloat(
                                b.querySelector('h4')
                                    .innerText
                                    .replace(/[₹$,]/g, '')
                            );

                        return priceA - priceB;
                    });

                } else if (value === 'high-low') {

                    products.sort((a, b) => {

                        const priceA =
                            parseFloat(
                                a.querySelector('h4')
                                    .innerText
                                    .replace(/[₹$,]/g, '')
                            );

                        const priceB =
                            parseFloat(
                                b.querySelector('h4')
                                    .innerText
                                    .replace(/[₹$,]/g, '')
                            );

                        return priceB - priceA;
                    });
                }

                proContainer.innerHTML = '';

                products.forEach(product => {
                    proContainer.appendChild(product);
                });
            }
        );
    }
);