// ─── singleProduct page: add to wishlist ───
const wishbtn = document.getElementById("wishbtn");
function showWishToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toast-msg').textContent = msg;
    toast.style.background = '#1e293b';
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

if (wishbtn) {
  wishbtn.addEventListener("click", () => {
    const product = {
      id: Date.now().toString(),
      name: document.getElementById("product-name").innerText,
      price: document.getElementById("product-price").innerText,
      size: document.getElementById("product-size").value, // ✅ .value for <select>
      image: document.getElementById("MainImg").src
    };

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    wishlist.push(product);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    // Visual feedback
    wishbtn.innerHTML = '<i class="ri-heart-fill"></i>';
    wishbtn.style.color = "red";
    showWishToast("Added to wishlist!")
  });
}

// ─── wishlist page: render items ───
const container = document.getElementById("wishlist-container");

if (container) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  function renderWishlist() {
    container.innerHTML = "";

    if (wishlist.length === 0) {
      container.innerHTML = "<p style='text-align:center; padding: 40px;'>Your wishlist is empty.</p>";
      return;
    }

    wishlist.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <h2>${item.name}</h2>
        <p>${item.price}</p>
        <p>${item.size}</p>
        <button class="remove-btn">
          <i class="ri-delete-bin-line"></i> Remove
        </button>
      `;

      card.querySelector(".remove-btn").addEventListener("click", () => {
        wishlist = wishlist.filter(i => i.id !== item.id);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        renderWishlist();
      });

      container.appendChild(card);
    });
  }

  renderWishlist();
}
