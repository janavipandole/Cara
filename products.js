const products = [
  { id: 1,  brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/f1.jpg", rating: 5 },
  { id: 2,  brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/f2.jpg", rating: 5 },
  { id: 3,  brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/f3.jpg", rating: 5 },
  { id: 4,  brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/f4.jpg", rating: 5 },
  { id: 5,  brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/f5.jpg", rating: 5 },
  { id: 6,  brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/f6.jpg", rating: 5 },
  { id: 7,  brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/f7.jpg", rating: 5 },
  { id: 8,  brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/f8.jpg", rating: 5 },
  { id: 9,  brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/n1.jpg", rating: 5 },
  { id: 10, brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/n2.jpg", rating: 5 },
  { id: 11, brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/n3.jpg", rating: 5 },
  { id: 12, brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/n4.jpg", rating: 5 },
  { id: 13, brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 79, img: "images/products/n5.jpg", rating: 5 },
  { id: 14, brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/n6.jpg", rating: 5 },
  { id: 15, brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/n7.jpg", rating: 5 },
  { id: 16, brand: "adidas", name: "Cartoon Astronaut T-Shirts", price: 78, img: "images/products/n8.jpg", rating: 5 },
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
      <a href="#" class="cart" onclick="addToCart('${p.name}', '$${p.price}', '${p.img}', 1, 'M')">
        <i class="ri-shopping-cart-2-line"></i>
      </a>
    </div>
  `).join('');
}

renderProducts('shop-container', products);
renderProducts('featured-container', products.slice(0, 4));