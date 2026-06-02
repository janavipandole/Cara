const modal = document.getElementById("size-chart-modal");

const openBtn = document.getElementById("size-chart-btn");

const closeBtn = document.querySelector(".close-btn");

const sizeDropdown = document.getElementById("product-size");

const sizeRadios = document.querySelectorAll('.size-chart input[type="radio"]');


// OPEN MODAL

if (openBtn && modal) openBtn.addEventListener("click", () => {

    modal.style.display = "flex";

});


// CLOSE MODAL

if (closeBtn) closeBtn.addEventListener("click", () => {

    modal.style.display = "none";

});


// CLOSE WHEN CLICKING OUTSIDE

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});


// AUTO SELECT SIZE + CLOSE MODAL

sizeRadios.forEach((radio) => {

    radio.addEventListener("change", function () {

        // Get selected row
        const row = this.closest("tr");

        // Get size text
        const selectedSize = row.children[1].textContent.trim();

        // Update dropdown
        sizeDropdown.value = selectedSize;

        // Close modal
        modal.style.display = "none";

    });

});