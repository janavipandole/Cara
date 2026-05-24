const modal = document.getElementById("size-chart-modal");

const openBtn = document.getElementById("size-chart-btn");

const closeBtn = document.querySelector(".close-btn");

const sizeDropdown = document.getElementById("product-size");



// OPEN MODAL

openBtn.addEventListener("click", () => {

    modal.style.display = "flex";

});


// CLOSE MODAL

closeBtn.addEventListener("click", () => {

    modal.style.display = "none";

});


// CLOSE WHEN CLICKING OUTSIDE

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});

