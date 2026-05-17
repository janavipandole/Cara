const paymentMethod = document.getElementById("paymentMethod");
const cardDetails = document.getElementById("cardDetails");

const cardName = document.getElementById("cardName");
const cardNumber = document.getElementById("cardNumber");
const expiry = document.getElementById("expiry");
const cvv = document.getElementById("cvv");

// SHOW / HIDE CARD DETAILS
paymentMethod.addEventListener("change", function () {

  if (this.value === "online") {

    cardDetails.style.display = "block";

    cardName.required = true;
    cardNumber.required = true;
    expiry.required = true;
    cvv.required = true;

  } else {

    cardDetails.style.display = "none";

    cardName.required = false;
    cardNumber.required = false;
    expiry.required = false;
    cvv.required = false;

  }

});

// FORM SUBMIT
const form = document.getElementById("checkoutForm");
const popup = document.getElementById("successPopup");

form.addEventListener("submit", function (e) {

  e.preventDefault();

  // GET CART
  let cart = JSON.parse(localStorage.getItem("productsInCart")) || [];

  // CHECK EMPTY CART
  if (cart.length === 0) {

    alert("Your cart is empty!");
    return;

  }

  // CLEAR CART AFTER SUCCESSFUL ORDER
  localStorage.removeItem("productsInCart");

  // SHOW SUCCESS POPUP
  popup.classList.add("active");

  form.reset();

  // HIDE CARD DETAILS AGAIN
  cardDetails.style.display = "none";

});

function closePopup() {

  popup.classList.remove("active");

}