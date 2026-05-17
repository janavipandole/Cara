const products = [
  { id: 1,  brand: "adidas", name: "Tropical Hibiscus Summer Shirt", price: 78, img: "images/products/f1.jpg", rating: 5, category: "street" },
  { id: 2,  brand: "adidas", name: "White Palm Leaf Casual Shirt", price: 78, img: "images/products/f2.jpg", rating: 5, category: "minimal" },
  { id: 3,  brand: "adidas", name: "Vintage Rose Garden Shirt", price: 78, img: "images/products/f3.jpg", rating: 5, category: "minimal" },
  { id: 4,  brand: "adidas", name: "Sakura Blossom Floral Shirt", price: 78, img: "images/products/f4.jpg", rating: 5, category: "minimal" },
  { id: 5,  brand: "adidas", name: "Pink Peony Patterned Shirt", price: 78, img: "images/products/f5.jpg", rating: 5, category: "street" },
  { id: 6,  brand: "adidas", name: "Dual-Tone Corduroy Shirt", price: 78, img: "images/products/f6.jpg", rating: 5, category: "street" },
  { id: 7,  brand: "adidas", name: "Embroidered Linen Trousers", price: 78, img: "images/products/f7.jpg", rating: 5, category: "street" },
  { id: 8,  brand: "adidas", name: "Cat Print Long Sleeve Blouse", price: 78, img: "images/products/f8.jpg", rating: 5, category: "minimal" },
  { id: 9,  brand: "adidas", name: "Sky Blue Mandarin Collar Shirt", price: 78, img: "images/products/n1.jpg", rating: 5, category: "formal" },
  { id: 10, brand: "adidas", name: "Navy Textured Formal Shirt", price: 78, img: "images/products/n2.jpg", rating: 5, category: "formal" },
  { id: 11, brand: "adidas", name: "Classic White Cotton Shirt", price: 78, img: "images/products/n3.jpg", rating: 5, category: "formal" },
  { id: 12, brand: "adidas", name: "Sandstone Tactical Utility Shirt", price: 78, img: "images/products/n4.jpg", rating: 5, category: "formal" },
  { id: 13, brand: "adidas", name: "Denim Blue Everyday Shirt", price: 79, img: "images/products/n5.jpg", rating: 5, category: "minimal" },
  { id: 14, brand: "adidas", name: "Vertical Stripe Chino Shorts", price: 78, img: "images/products/n6.jpg", rating: 5, category: "minimal" },
  { id: 15, brand: "adidas", name: "Khaki Safari Work Shirt", price: 78, img: "images/products/n7.jpg", rating: 5, category: "minimal" },
  { id: 16, brand: "adidas", name: "Deep Charcoal Casual Shirt", price: 78, img: "images/products/n8.jpg", rating: 5, category: "minimal" },
];

function renderProducts(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = list.map(p => `
    <div class="pro" data-category="${p.category}" onclick="window.location.href='singleProduct.html';">
      <img src="${p.img}" alt="${p.name}">
      <div class="des">
        <span>${p.brand}</span>
        <h5>${p.name}</h5>
        <div class="star">${'<i class="ri-star-fill"></i>'.repeat(p.rating)}</div>
        <h4>$${p.price}</h4>
      </div>
      <a href="#" class="cart" onclick="event.stopPropagation(); addToCart('${p.name}', '$${p.price}', '${p.img}', 1, 'M'); return false;">
        <i class="ri-shopping-cart-2-line"></i>
      </a>
      <button class="buy-now-btn" onclick="event.stopPropagation(); buyNow('${p.name}', '$${p.price}', '${p.img}', 1, 'M'); return false;">
        Buy Now
      </button>
    </div>
  `).join('');
}

// Initializing the renders
renderProducts('shop-container', products);
renderProducts('featured-container', products.slice(0, 4));
