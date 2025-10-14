Shery.imageEffect("#back", {
  style: 1,
  config: {
    a: { value: 1, range: [0, 30] },
    b: { value: -1, range: [-1, 1] },
    zindex: { value: -9996999, range: [-9999999, 9999999] },
    aspect: { value: 1.9753087039934545 },
    ignoreShapeAspect: { value: true },
    shapePosition: { value: { x: 0, y: 0 } },
    shapeScale: { value: { x: 0.5, y: 0.5 } },
    shapeEdgeSoftness: { value: 0, range: [0, 0.5] },
    shapeRadius: { value: 0, range: [0, 2] },
    currentScroll: { value: 0 },
    scrollLerp: { value: 0.07 },
    gooey: { value: true },
    infiniteGooey: { value: true },
    growSize: { value: 4, range: [1, 15] },
    durationOut: { value: 1, range: [0.1, 5] },
    durationIn: { value: 1.5, range: [0.1, 5] },
    displaceAmount: { value: 0.5 },
    masker: { value: true },
    maskVal: { value: 1, range: [1, 5] },
    scrollType: { value: 0 },
    geoVertex: { range: [1, 64], value: 1 },
    noEffectGooey: { value: true },
    onMouse: { value: 1 },
    noise_speed: { value: 0.2, range: [0, 10] },
    metaball: { value: 0.2, range: [0, 2], _gsap: { id: 3 } },
    discard_threshold: { value: 0.52, range: [0, 1] },
    antialias_threshold: { value: 0, range: [0, 0.1] },
    noise_height: { value: 0.26, range: [0, 2] },
    noise_scale: { value: 23.66, range: [0, 100] },
  },
  gooey: true,
});

const bar = document.getElementById("bar");
const nav = document.getElementById("navbar");
const close = document.getElementById("close");

if (bar) {
  bar.addEventListener("click", () => {
    nav.classList.add("active");
  });
}
if (close) {
  close.addEventListener("click", () => {
    nav.classList.remove("active");
  });
}

// Single Product Image Switching (FIXED: getElementsById -> getElementById)
var MainImg = document.getElementById("MainImg");
var smallImg = document.getElementsByClassName("small-img");

// Only run the image switching logic if the elements exist (i.e., on the single product page)
if (MainImg) {
    for (let i = 0; i < smallImg.length; i++) {
        smallImg[i].onclick = function () {
            MainImg.src = smallImg[i].src;
        }
    }
}


/* --- START: CART FUNCTIONALITY --- */

// Core function to add item to cart (uses Local Storage)
function addToCart(productName, productPrice, productImage, quantity, size) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    let item = {
        name: productName,
        price: parseFloat(productPrice.replace('$', '')),
        image: productImage,
        quantity: parseInt(quantity),
        size: size
    };

    // Check if the exact item (name + size) already exists
    let existingItem = cart.find(p => p.name === item.name && p.size === item.size);

    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        cart.push(item);
    }

    localStorage.setItem('productsInCart', JSON.stringify(cart));
    alert(`${item.name} (Size: ${item.size}) added to cart!`);
}

// Function to handle the 'Add to Cart' button click from singleProduct.html
window.handleAddToCart = function() {
    const nameElement = document.getElementById('product-name');
    const priceElement = document.getElementById('product-price');
    const sizeSelect = document.getElementById('product-size');
    const quantityInput = document.getElementById('product-quantity');
    const imageElement = document.getElementById('MainImg');

    if (!nameElement || !priceElement || !sizeSelect || !quantityInput || !imageElement) {
        console.error("Missing product elements on page.");
        return;
    }

    const name = nameElement.innerText;
    const price = priceElement.innerText;
    const size = sizeSelect.value;
    const quantity = parseInt(quantityInput.value);
    const image = imageElement.src;

    if (size === 'Select Size' || size === "") {
        alert('Please select a size before adding to cart.');
        return;
    }
    if (quantity < 1 || isNaN(quantity)) {
         alert('Please enter a valid quantity.');
         return;
    }

    addToCart(name, price, image, quantity, size);
}

// Function to populate the cart page table
window.loadCart = function() {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    const tableBody = document.querySelector('#cart table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Clear the default/old content
    let total = 0;

    cart.forEach((item, index) => {
        const itemPrice = item.price;
        const subtotal = itemPrice * item.quantity;
        total += subtotal;

        const newRow = tableBody.insertRow();

        // 1. Remove Button
        newRow.insertCell().innerHTML = `<a href="#" onclick="removeItem(${index}); return false;"><i class="fa-regular fa-circle-xmark"></i></a>`;

        // 2. Image
        newRow.insertCell().innerHTML = `<img src="${item.image}" alt="${item.name}">`;

        // 3. Product Name & Size
        newRow.insertCell().innerHTML = `${item.name}<br><small>Size: ${item.size}</small>`;

        // 4. Price
        newRow.insertCell().innerHTML = `$${itemPrice.toFixed(2)}`;

        // 5. Quantity (with update function)
        newRow.insertCell().innerHTML = `<input id="qty-${index}" type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">`;

        // 6. Subtotal
        newRow.insertCell().innerHTML = `$${subtotal.toFixed(2)}`;
    });

    // Update Totals
    const subtotalCell = document.querySelector('.subtotal table tr:nth-child(1) td:nth-child(2)');
    const totalCell = document.querySelector('.subtotal table tr:nth-child(3) td:nth-child(2) strong');

    if (subtotalCell) subtotalCell.innerText = `$ ${total.toFixed(2)}`;
    if (totalCell) totalCell.innerText = `$ ${total.toFixed(2)}`;
    
    if (cart.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Your cart is empty.</td></tr>';
    }
}

// Utility functions for cart page interaction (must be globally accessible)
window.removeItem = function(index) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('productsInCart', JSON.stringify(cart));
    loadCart(); // Reload the cart display
}

window.updateQuantity = function(index, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    newQuantity = parseInt(newQuantity);
    
    // Validate quantity
    if (newQuantity < 1 || isNaN(newQuantity)) {
        newQuantity = 1;
        document.getElementById(`qty-${index}`).value = 1; // Correct the input field
    }
    
    cart[index].quantity = newQuantity;
    localStorage.setItem('productsInCart', JSON.stringify(cart));
    loadCart(); // Reload the cart display
}

// Load cart on the cart page once the window is loaded
window.addEventListener('load', () => {
    const cartElement = document.getElementById('cart');
    if (cartElement) {
        loadCart();
    }
});

/* --- END: CART FUNCTIONALITY --- */