 const products = [
  {
    id: 1,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/f1.jpg",
    rating: 5,
    stock: 3,
    sold: 82
  },
  {
    id: 2,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/f2.jpg",
    rating: 5,
    stock: 12,
    sold: 54
  },
  {
    id: 3,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/f3.jpg",
    rating: 5,
    stock: 25,
    sold: 18
  },
  {
    id: 4,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/f4.jpg",
    rating: 5,
    stock: 2,
    sold: 90
  },
  {
    id: 5,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/f5.jpg",
    rating: 5,
    stock: 8,
    sold: 67
  },
  {
    id: 6,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/f6.jpg",
    rating: 5,
    stock: 30,
    sold: 22
  },
  {
    id: 7,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/f7.jpg",
    rating: 5,
    stock: 5,
    sold: 76
  },
  {
    id: 8,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/f8.jpg",
    rating: 5,
    stock: 18,
    sold: 33
  },
  {
    id: 9,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/n1.jpg",
    rating: 5,
    stock: 4,
    sold: 88
  },
  {
    id: 10,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/n2.jpg",
    rating: 5,
    stock: 14,
    sold: 40
  },
  {
    id: 11,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/n3.jpg",
    rating: 5,
    stock: 22,
    sold: 17
  },
  {
    id: 12,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/n4.jpg",
    rating: 5,
    stock: 1,
    sold: 110
  },
  {
    id: 13,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 79,
    img: "images/products/n5.jpg",
    rating: 5,
    stock: 9,
    sold: 63
  },
  {
    id: 14,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/n6.jpg",
    rating: 5,
    stock: 28,
    sold: 21
  },
  {
    id: 15,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/n7.jpg",
    rating: 5,
    stock: 6,
    sold: 73
  },
  {
    id: 16,
    brand: "adidas",
    name: "Cartoon Astronaut T-Shirts",
    price: 78,
    img: "images/products/n8.jpg",
    rating: 5,
    stock: 16,
    sold: 29
  }
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
        ${p.stock <= 5 
          ? `<p class="low-stock">⚡ Only ${p.stock} left</p>` 
          : p.stock <= 15 
            ? `<p class="limited-stock">🔥 Limited Stock</p>` 
            : `<p class="in-stock">✅ In Stock</p>`
        }

        ${p.sold >= 50 
          ? `<span class="fast-selling">🔥 Fast Selling</span>` 
          : ""}
      </div>
      <a href="#" class="cart" onclick="addToCart(
      '${p.name}', '$${p.price}', '${p.img}', 1, 'M')">
        <i class="ri-shopping-cart-2-line"></i>
      </a>
    </div>
  `).join('');
}

renderProducts('shop-container', products);
renderProducts('featured-container', products.slice(0, 4));
const rewardElement = document.getElementById("reward-points");

if (rewardElement) {
  rewardElement.innerText = localStorage.getItem("rewardPoints") || 0;
}