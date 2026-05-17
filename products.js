const products = [
  // Summer / Floral Tiers ($25 - $35)
  { id: 1,  brand: "adidas", name: "Tropical Hibiscus Summer Shirt", price: 28, img: "images/products/f1.jpg", rating: 5 },
  { id: 2,  brand: "adidas", name: "White Palm Leaf Casual Shirt", price: 32, img: "images/products/f2.jpg", rating: 5 },
  { id: 3,  brand: "adidas", name: "Vintage Rose Garden Shirt", price: 30, img: "images/products/f3.jpg", rating: 5 },
  { id: 4,  brand: "adidas", name: "Sakura Blossom Floral Shirt", price: 35, img: "images/products/f4.jpg", rating: 5 },
  { id: 5,  brand: "adidas", name: "Pink Peony Patterned Shirt", price: 29, img: "images/products/f5.jpg", rating: 5 },
  
  // Smart Casual & Mid-Tier ($40 - $55)
  { id: 6,  brand: "adidas", name: "Dual-Tone Corduroy Shirt", price: 55, img: "images/products/f6.jpg", rating: 5 },
  { id: 7,  brand: "adidas", name: "Embroidered Linen Trousers", price: 48, img: "images/products/f7.jpg", rating: 5 },
  { id: 8,  brand: "adidas", name: "Cat Print Long Sleeve Blouse", price: 42, img: "images/products/f8.jpg", rating: 5 },
  { id: 9,  brand: "adidas", name: "Sky Blue Mandarin Collar Shirt", price: 45, img: "images/products/n1.jpg", rating: 5 },
  { id: 10, brand: "adidas", name: "Navy Textured Formal Shirt", price: 52, img: "images/products/n2.jpg", rating: 5 },
  { id: 11, brand: "adidas", name: "Classic White Cotton Shirt", price: 40, img: "images/products/n3.jpg", rating: 5 },
  
  // Utility & Outerwear Tiers ($65 - $85)
  { id: 12, brand: "adidas", name: "Sandstone Tactical Utility Shirt", price: 82, img: "images/products/n4.jpg", rating: 5 },
  { id: 13, brand: "adidas", name: "Denim Blue Everyday Shirt", price: 68, img: "images/products/n5.jpg", rating: 5 },
  { id: 14, brand: "adidas", name: "Vertical Stripe Chino Shorts", price: 38, img: "images/products/n6.jpg", rating: 5 },
  { id: 15, brand: "adidas", name: "Khaki Safari Work Shirt", price: 75, img: "images/products/n7.jpg", rating: 5 },
  { id: 16, brand: "adidas", name: "Deep Charcoal Casual Shirt", price: 44, img: "images/products/n8.jpg", rating: 5 },
];

function renderProducts(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = list.map(p => `
    <div class="pro" onclick="window.location.href='singleProduct.html';">
      <img src="${p.img}" alt="${p.name}">
      <div class="des">
        <span>${p.brand}</span>
        <h5>${p.name}</h5>
        <div class="star">${'<i class="ri-star-fill"></i>'.repeat(p.rating)}</div>
        <h4>$${p.price}</h4>
      </div>
      <a href="#" class="cart" onclick="event.stopPropagation(); addToCart('${p.name}', ${p.price}, '${p.img}', 1, 'M')">
        <i class="ri-shopping-cart-2-line"></i>
      </a>
    </div>
  `).join('');
}

// Initializing the renders
renderProducts('shop-container', products);
renderProducts('featured-container', products.slice(0, 4));