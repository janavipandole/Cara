// Dynamic Catalog Sorter and Filter
document.addEventListener("DOMContentLoaded", () => {
    const productsContainer = document.getElementById("shop-products-container") || document.querySelector(".pro-container");
    if (!productsContainer) return;

    // Inject Sort Control Panel
    const controlPanel = document.createElement("div");
    controlPanel.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; flex-wrap:wrap; gap:10px;";
    controlPanel.innerHTML = `
        <div>
            <label style="font-size:14px; font-weight:600; margin-right:8px; color: #088178;">Filter by Price:</label>
            <select id="price-filter" style="padding:6px 12px; border-radius:4px; border:1px solid #ccc; font-weight: 500;">
                <option value="all">All Prices</option>
                <option value="low">Under ₹100</option>
                <option value="high">₹100 and above</option>
            </select>
        </div>
        <div>
            <label style="font-size:14px; font-weight:600; margin-right:8px; color: #088178;">Sort Catalogue:</label>
            <select id="catalog-sorter" style="padding:6px 12px; border-radius:4px; border:1px solid #ccc; font-weight: 500;">
                <option value="default">Featured</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
            </select>
        </div>
    `;
    productsContainer.parentNode.insertBefore(controlPanel, productsContainer);

    const originalProductCards = Array.from(productsContainer.querySelectorAll(".pro"));

    const filterAndSort = () => {
        const priceVal = document.getElementById("price-filter").value;
        const sortVal = document.getElementById("catalog-sorter").value;

        let filtered = [...originalProductCards];

        // Filter
        if (priceVal !== "all") {
            filtered = filtered.filter(card => {
                const priceText = card.querySelector("h4")?.textContent || "0";
                const price = parseFloat(priceText.replace(/[^\d\.]/g, "")) || 0;
                return priceVal === "low" ? price < 100 : price >= 100;
            });
        }

        // Sort
        if (sortVal === "asc" || sortVal === "desc") {
            filtered.sort((a, b) => {
                const pA = parseFloat(a.querySelector("h4")?.textContent.replace(/[^\d\.]/g, "")) || 0;
                const pB = parseFloat(b.querySelector("h4")?.textContent.replace(/[^\d\.]/g, "")) || 0;
                return sortVal === "asc" ? pA - pB : pB - pA;
            });
        }

        // Update container DOM
        productsContainer.innerHTML = "";
        filtered.forEach(card => productsContainer.appendChild(card));
    };

    document.getElementById("price-filter").addEventListener("change", filterAndSort);
    document.getElementById("catalog-sorter").addEventListener("change", filterAndSort);
});
