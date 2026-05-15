const container = document.getElementById("wishlist-container");
// Changed const to let so we can easily update the array
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

function renderWishlist() {
  if (!container) return;

  container.innerHTML = "";
  wishlist.forEach((item) => {
    container.innerHTML += `
         <div class="card">
            <img src="${item.image}">
            <h2>${item.name}</h2>
            <p>${item.price}</p>
            <button onclick="removeItem('${item.id}')">
               <i class="ri-delete-bin-line"></i>
            </button>
         </div>
      `;
  });
}

function removeItem(id) {
  // 1. Filter out the item
  wishlist = wishlist.filter((item) => item.id !== id);

  
  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  
  renderWishlist();
}