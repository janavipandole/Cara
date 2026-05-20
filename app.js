/* =========================================================
   MOBILE NAVBAR FUNCTIONALITY
========================================================= */

document.addEventListener("click", function (e) {

    // OPEN MENU
    if (e.target.id === "bar") {

        const nav =
            document.getElementById("navbar");

        if (nav) {
            nav.classList.add("active");
        }
    }

    // CLOSE MENU
    if (e.target.closest("#close")) {

        e.preventDefault();

        const nav =
            document.getElementById("navbar");

        if (nav) {
            nav.classList.remove("active");
        }
    }

});


/* =========================================================
   THEME TOGGLE FUNCTIONALITY
========================================================= */

(function () {

    const themeToggle =
        document.getElementById("themeToggle");

    const themeToggleMobile =
        document.getElementById("themeToggleMobile");

    const themeIcon =
        document.getElementById("themeIcon");

    const themeIconMobile =
        document.getElementById("themeIconMobile");

    const html =
        document.documentElement;

    // Load saved theme
    const currentTheme =
        localStorage.getItem("theme") || "light";

    html.setAttribute("data-theme", currentTheme);

    updateThemeIcon(currentTheme);

    function updateThemeIcon(theme) {

        const iconClass =
            theme === "dark"
                ? "ri-sun-line"
                : "ri-moon-line";

        if (themeIcon) {
            themeIcon.className = iconClass;
        }

        if (themeIconMobile) {
            themeIconMobile.className = iconClass;
        }

        // Optional logo switch
        const siteLogo =
            document.getElementById("siteLogo");

        if (siteLogo) {

            siteLogo.src =
                theme === "dark"
                    ? "images/Dlogo.png"
                    : "images/logo.png";
        }
    }

    function toggleTheme() {

        const currentTheme =
            html.getAttribute("data-theme");

        const newTheme =
            currentTheme === "dark"
                ? "light"
                : "dark";

        html.setAttribute("data-theme", newTheme);

        localStorage.setItem("theme", newTheme);

        updateThemeIcon(newTheme);
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }

    if (themeToggleMobile) {
        themeToggleMobile.addEventListener("click", toggleTheme);
    }

})();


/* =========================================================
   DYNAMIC PRODUCT DETAILS LOGIC
========================================================= */

// Global click listener for all product cards
document.addEventListener("click", function (e) {

    const proCard =
        e.target.closest(".pro");

    if (!proCard) return;

    // Ignore cart & buy buttons
    if (
        e.target.closest(".cart") ||
        e.target.closest(".buy-now-btn")
    ) return;

    const nameElement =
        proCard.querySelector("h5");

    const priceElement =
        proCard.querySelector("h4");

    const brandElement =
        proCard.querySelector(".des span");

    const imageElement =
        proCard.querySelector("img");

    const selectedProduct = {

        name:
            nameElement
                ? nameElement.textContent.trim()
                : "Product",

        price:
            priceElement
                ? priceElement.textContent.trim()
                : "$0.00",

        brand:
            brandElement
                ? brandElement.textContent.trim()
                : "Brand",

        image:
            imageElement
                ? imageElement.src
                : ""
    };

    localStorage.setItem(
        "selectedProduct",
        JSON.stringify(selectedProduct)
    );

    window.location.href =
        "singleProduct.html";

}, true);


/* =========================================================
   SINGLE PRODUCT PAGE RENDER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    if (
        window.location.pathname.includes("singleProduct")
    ) {

        const storedProductJSON =
            localStorage.getItem("selectedProduct");

        if (storedProductJSON) {

            try {

                const product =
                    JSON.parse(storedProductJSON);

                const nameEl =
                    document.getElementById("product-name");

                const priceEl =
                    document.getElementById("product-price");

                const mainImgEl =
                    document.getElementById("MainImg");

                const breadcrumbEl =
                    document.querySelector(".single-pro-details h6");

                const smallImgs =
                    document.querySelectorAll(".small-img");

                if (nameEl) {
                    nameEl.textContent = product.name;
                }

                if (priceEl) {
                    priceEl.textContent = product.price;
                }

                if (mainImgEl) {
                    mainImgEl.src = product.image;
                }

                if (breadcrumbEl && product.brand) {

                    let productType = "T-Shirt";

                    if (
                        product.name.toLowerCase().includes("trousers")
                    ) {
                        productType = "Trousers";
                    }

                    else if (
                        product.name.toLowerCase().includes("shorts")
                    ) {
                        productType = "Shorts";
                    }

                    else if (
                        product.name.toLowerCase().includes("blouse")
                    ) {
                        productType = "Blouse";
                    }

                    else if (
                        product.name.toLowerCase().includes("shirt")
                    ) {
                        productType = "Shirt";
                    }

                    breadcrumbEl.textContent =
                        `Home / ${product.brand} / ${productType}`;
                }

                if (
                    smallImgs.length > 0 &&
                    product.image
                ) {
                    smallImgs[0].src = product.image;
                }

            } catch (error) {

                console.error(
                    "Error parsing stored product:",
                    error
                );
            }
        }

        // Thumbnail switching
        const MainImg =
            document.getElementById("MainImg");

        const smallImg =
            document.getElementsByClassName("small-img");

        if (MainImg && smallImg) {

            for (let i = 0; i < smallImg.length; i++) {

                smallImg[i].onclick = function () {
                    MainImg.src = smallImg[i].src;
                };
            }
        }
    }
});


/* =========================================================
   BUTTON RIPPLE EFFECT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const buttons =
        document.querySelectorAll(
            "button.normal, button.white"
        );

    buttons.forEach((button) => {

        button.addEventListener("click", function (e) {

            const rect =
                this.getBoundingClientRect();

            const x =
                e.clientX - rect.left;

            const y =
                e.clientY - rect.top;

            const ripple =
                document.createElement("span");

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


/* =========================================================
   BACK TO TOP BUTTON LOGIC
========================================================= */

const backToTopBtn =
    document.getElementById("backToTop");

const ToptobackBtn =
    document.getElementById("Toptoback");

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

    // BACK TO TOP
    backToTopBtn.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

    // SCROLL TO BOTTOM
    ToptobackBtn.addEventListener("click", () => {

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });

    });

}


/* =========================================================
   BUY NOW FUNCTIONALITY
========================================================= */

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

    setTimeout(function () {

        window.location.href =
            "checkout.html";

    }, 1500);

};


/* =========================================================
   CURRENT YEAR FUNCTIONALITY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const year =
        new Date().getFullYear();

    document
        .querySelectorAll(".Current-Year")
        .forEach(el => {

            el.textContent = year;

        });

});


/* =========================================================
   HERO SLIDER FUNCTIONALITY
========================================================= */

function initHeroSlider() {

    const slider =
        document.querySelector(".hero-slider");

    if (!slider) return;

    const slides =
        slider.querySelectorAll(".slide");

    const prevBtn =
        slider.querySelector(".slider-btn.prev");

    const nextBtn =
        slider.querySelector(".slider-btn.next");

    const dots =
        slider.querySelectorAll(".slider-dots .dot");

    if (slides.length === 0) return;

    let currentSlide = 0;

    let autoPlayInterval;

    const intervalTime = 5000;

    function updateSlider() {

        slides.forEach(slide =>
            slide.classList.remove("active")
        );

        dots.forEach(dot =>
            dot.classList.remove("active")
        );

        slides[currentSlide].classList.add("active");

        if (dots[currentSlide]) {
            dots[currentSlide].classList.add("active");
        }
    }

    function nextSlide() {

        currentSlide =
            (currentSlide + 1) % slides.length;

        updateSlider();
    }

    function prevSlide() {

        currentSlide =
            (currentSlide - 1 + slides.length) %
            slides.length;

        updateSlider();
    }

    function resetAutoPlay() {

        clearInterval(autoPlayInterval);

        startAutoPlay();
    }

    function startAutoPlay() {

        autoPlayInterval =
            setInterval(nextSlide, intervalTime);
    }

    if (nextBtn) {

        nextBtn.addEventListener("click", () => {

            nextSlide();

            resetAutoPlay();

        });
    }

    if (prevBtn) {

        prevBtn.addEventListener("click", () => {

            prevSlide();

            resetAutoPlay();

        });
    }

    dots.forEach((dot, index) => {

        dot.addEventListener("click", () => {

            currentSlide = index;

            updateSlider();

            resetAutoPlay();

        });

    });

    startAutoPlay();
}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initHeroSlider
    );

} else {

    initHeroSlider();
}
