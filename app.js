/* =========================================================
   MOBILE NAVBAR FUNCTIONALITY
========================================================= */

document.addEventListener("click", (e) => {

    const bar = e.target.closest("#bar");
    const close = e.target.closest("#close");

    // OPEN MENU
    if (bar) {

        const nav =
            document.getElementById("navbar");

        if (nav) {
            nav.classList.add("active");
        }
    }

    // CLOSE MENU
    if (close) {

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

document.addEventListener("click", function (e) {

    const proCard =
        e.target.closest(".pro");

    if (!proCard) return;

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
