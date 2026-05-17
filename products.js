// fixed: each prodcut now has a unique name, brand and price.
const products = window.products = [
  { id: 1,  brand: "Adidas", name: "Tropical Print Hawaiian Shirt", price: 78, img: "images/products/f1.jpg", rating: 5 },
  { id: 2,  brand: "Nike", name: "Floral Leaf Hawaiian Shirt", price: 85, img: "images/products/f2.jpg", rating: 4 },
  { id: 3,  brand: "Puma", name: "Rose Floral Holiday Shirt", price: 72, img: "images/products/f3.jpg", rating: 4 },
  { id: 4,  brand: "Reebok", name: "Cherry Blossom Button Shirt", price: 90, img: "images/products/f4.jpg", rating: 5 },
  { id: 5,  brand: "H&M", name: "Dark Floral Bloom Shirt", price: 65, img: "images/products/f5.jpg", rating: 3 },
  { id: 6,  brand: "Zara", name: "Dual Tone Textured Overshirt", price: 95, img: "images/products/f6.jpg", rating: 5 },
  { id: 7,  brand: "Levis", name: "Floral Embroidered Linen Pants", price: 80, img: "images/products/f7.jpg", rating: 4 },
  { id: 8,  brand: "Gap", name: "Cartoon Cat Loose Fit Top", price: 70, img: "images/products/f8.jpg", rating: 4 },
  { id: 9,  brand: "Adidas", name: "Light Blue Mandarin Collar Shirt", price: 88, img: "images/products/n1.jpg", rating: 5 },
  { id: 10, brand: "Nike", name: "Striped Formal Full Sleeve Shirt", price: 92, img: "images/products/n2.jpg", rating: 5 },
  { id: 11, brand: "Puma", name: "White Classic Oxford Shirt", price: 75, img: "images/products/n3.jpg", rating: 4 },
  { id: 12, brand: "Reebok", name: "Camo Print Half Sleeve Shirt", price: 68, img: "images/products/n4.jpg", rating: 3 },
  { id: 13, brand: "H&M", name: "Aurora Printed Shirt", price: 79, img: "images/products/n5.jpg", rating: 4 },
  { id: 14, brand: "Zara", name: "Smart Casual Belted Shorts", price: 85, img: "images/products/n6.jpg", rating: 5 },
  { id: 15, brand: "Levis", name: "Cargo Overshirt Jacket", price: 82, img: "images/products/n7.jpg", rating: 4 },
  { id: 16, brand: "Gap", name: "Dark Navy Mandarin Collar Shirt", price: 74, img: "images/products/n8.jpg", rating: 5 },
];

// fixed: onclick now passes product id so correct product opens 
function renderProducts(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = list.map(p => `
    <div class="pro" onclick="window.location.href='singleProduct.html?id=${p.id}';">
      <img src="${p.img}" alt="${p.name}">
      <div class="des">
        <span>${p.brand}</span>
        <h5>${p.name}</h5>
        <div class="star">${'<i class="ri-star-fill"></i>'.repeat(p.rating)}</div>
        <h4>$${p.price}</h4>
      </div>
      <a href="#" class="cart" onclick="addToCart('${p.name}', '$${p.price}', '${p.img}', 1, 'M')">
        <i class="ri-shopping-cart-2-line"></i>
      </a>
    </div>
  `).join('');
}

// Initializing the renders
renderProducts('shop-container', products);
renderProducts('featured-container', products.slice(0, 4));
