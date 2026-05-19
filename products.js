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
  container.innerHTML = '';

  list.forEach(p => {
    // Create product card container
    const card = document.createElement('div');
    card.className = 'pro';
    card.dataset.category = p.category;
    card.addEventListener('click', () => {
      window.location.href = 'singleProduct.html';
    });

    // Product image (safe property assignment)
const img = document.createElement('img');

img.src = p.img;
img.alt = p.name;

/* Performance Optimization */
img.loading = "lazy";

/* Reduce layout shift */
img.width = 250;
img.height = 300;

card.appendChild(img);

    // Description container
    const des = document.createElement('div');
    des.className = 'des';

    const brandSpan = document.createElement('span');
    brandSpan.textContent = p.brand;
    des.appendChild(brandSpan);

    const nameH5 = document.createElement('h5');
    nameH5.textContent = p.name;
    des.appendChild(nameH5);

    // Star rating (static icon markup is safe — no user data involved)
    const starDiv = document.createElement('div');
    starDiv.className = 'star';
    for (let i = 0; i < p.rating; i++) {
      const starIcon = document.createElement('i');
      starIcon.className = 'ri-star-fill';
      starDiv.appendChild(starIcon);
    }
    des.appendChild(starDiv);

    const priceH4 = document.createElement('h4');
    priceH4.textContent = '$' + p.price;
    des.appendChild(priceH4);

    card.appendChild(des);

    // Cart link (programmatic listener prevents string-breakout XSS)
    const cartLink = document.createElement('a');
    cartLink.href = '#';
    cartLink.className = 'cart';
    cartLink.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      addToCart(p.name, '$' + p.price, p.img, 1, 'M');
    });
    const cartIcon = document.createElement('i');
    cartIcon.className = 'ri-shopping-cart-2-line';
    cartLink.appendChild(cartIcon);
    card.appendChild(cartLink);

    // Buy Now button (programmatic listener prevents string-breakout XSS)
    const buyBtn = document.createElement('button');
    buyBtn.className = 'buy-now-btn';
    buyBtn.textContent = 'Buy Now';
    buyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      buyNow(p.name, '$' + p.price, p.img, 1, 'M');
    });
    card.appendChild(buyBtn);

    container.appendChild(card);
  });
}

// Initializing the renders
renderProducts('shop-container', products);
renderProducts('featured-container', products.slice(0, 4));
