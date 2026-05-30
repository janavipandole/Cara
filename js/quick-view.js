
/* ============================================================
   PRODUCT QUICK VIEW MODAL
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    // Create modal element
    const modal = document.createElement("div");
    modal.className = "qv-modal";
    modal.innerHTML = `
        <div class="qv-modal-content">
            <span class="qv-close">&times;</span>
            <div class="qv-img-container">
                <img id="qv-img" src="" alt="Product Image">
            </div>
            <div class="qv-details">
                <h2 id="qv-title" class="qv-title"></h2>
                <div id="qv-price" class="qv-price"></div>
                <p id="qv-desc" class="qv-desc"></p>
                <button id="qv-add-btn" class="qv-btn">Add to Cart</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".qv-close");
    closeBtn.addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    // Delegate quick view triggers on product cards
    document.body.addEventListener("click", (e) => {
        const trigger = e.target.closest(".quick-view-trigger");
        if (trigger) {
            e.preventDefault();
            e.stopPropagation();
            const productCard = trigger.closest(".pro");
            if (productCard) {
                const title = productCard.querySelector("h5")?.innerText || "Fashion Apparel";
                const price = productCard.querySelector("h4")?.innerText || "$78.00";
                const img = productCard.querySelector("img")?.src || "images/products/f1.jpg";
                const desc = "A beautiful and stylish premium selection designed for extreme comfort and elegance. Made with ethically-sourced fine fabrics.";

                document.getElementById("qv-title").innerText = title;
                document.getElementById("qv-price").innerText = price;
                document.getElementById("qv-img").src = img;
                document.getElementById("qv-desc").innerText = desc;

                const addBtn = document.getElementById("qv-add-btn");
                addBtn.onclick = () => {
                    if (typeof addToCart === "function") {
                        addToCart(title, price, img, 1, "M");
                        modal.style.display = "none";
                    }
                };

                modal.style.display = "flex";
            }
        }
    });
});
