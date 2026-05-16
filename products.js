// Size surcharge map — applies to ALL products automatically
const sizeSurcharge = {
  "Select Size": 0,
  "S": 0,
  "M": 0,
  "L": 5,
  "XL": 10,
  "XXL": 16,
  "XXXL": 23,
};

const products = [
  {
    id: 1,
    brand: "Adidas",
    name: "Tropical Hibiscus Summer Shirt",
    price: 78,
    img: "images/products/f1.jpg",
    rating: 5,
    description: "Blast off in style with this limited-edition Cartoon Astronaut tee. Crafted from 100% soft-washed cotton, it features a bold graphic print that holds its colour wash after wash. A relaxed fit and ribbed crew neck make it perfect for everyday wear — on Earth or beyond.",
  },
  {
    id: 2,
    brand: "Adidas",
    name: "White Palm Leaf Casual Shirt",
    price: 78,
    img: "images/products/f2.jpg",
    rating: 5,
    description: "A clean ivory canvas with a fun astronaut graphic — this tee blends street-ready style with everyday comfort. Made from breathable cotton jersey with a slightly oversized silhouette for that effortless, relaxed look.",
  },
  {
    id: 3,
    brand: "Adidas",
    name: "Vintage Rose Garden Shirt",
    price: 78,
    img: "images/products/f3.jpg",
    rating: 5,
    description: "Earthy olive tones meet out-of-this-world graphics. This tee is pre-washed for extra softness and a vintage feel right out of the bag. Pairs easily with joggers, jeans, or shorts for a no-effort look.",
  },
  {
    id: 4,
    brand: "Adidas",
    name: "Sakura Blossom Floral Shirt",
    price: 78,
    img: "images/products/f4.jpg",
    rating: 5,
    description: "The classic charcoal colourway keeps the focus on the graphic while staying versatile enough to match anything in your wardrobe. 100% cotton, crew neck, and a unisex fit that works for all body types.",
  },
  {
    id: 5,
    brand: "Adidas",
    name: "Pink Peony Patterned Shirt",
    price: 78,
    img: "images/products/f5.jpg",
    rating: 5,
    description: "Light, airy sky blue meets a playful astronaut design — this tee is your go-to for warm-weather days. The lightweight fabric keeps you cool while the graphic keeps you interesting.",
  },
  {
    id: 6,
    brand: "Adidas",
    name: "Dual-Tone Corduroy Shirt",
    price: 78,
    img: "images/products/f6.jpg",
    rating: 5,
    description: "Stand out in coral. This vibrant colourway gives the astronaut graphic a fun, summery spin. Soft, stretchy cotton blend with reinforced shoulder seams for long-lasting shape retention.",
  },
  {
    id: 7,
    brand: "Adidas",
    name: "Embroidered Linen Trousers",
    price: 78,
    img: "images/products/f7.jpg",
    rating: 5,
    description: "Deep forest green with a graphic that pops — this tee has a premium feel without the premium price. Slightly dropped shoulders and a relaxed body give it a modern streetwear silhouette.",
  },
  {
    id: 8,
    brand: "Adidas",
    name: "Cat Print Long Sleeve Blouse",
    price: 78,
    img: "images/products/f8.jpg",
    rating: 5,
    description: "The essential black tee, elevated. The high-contrast astronaut graphic makes this one a wardrobe staple you'll reach for again and again. Pre-shrunk cotton so what you see is what you get, wash after wash.",
  },
  {
    id: 9,
    brand: "Adidas",
    name: "Sky Blue Mandarin Collar Shirt",
    price: 78,
    img: "images/products/n1.jpg",
    rating: 5,
    description: "Crisp white and effortlessly cool. This New Wave tee features a minimalist graphic print on a clean cotton base. Light, breathable, and versatile — dress it up or keep it casual.",
  },
  {
    id: 10,
    brand: "Adidas",
    name: "Navy Textured Formal Shirt",
    price: 78,
    img: "images/products/n2.jpg",
    rating: 5,
    description: "A muted slate grey that goes with everything. Soft cotton construction with a modern fit that sits between slim and relaxed. The subtle graphic adds personality without being loud.",
  },
  {
    id: 11,
    brand: "Adidas",
    name: "Classic White Cotton Shirt",
    price: 78,
    img: "images/products/n3.jpg",
    rating: 5,
    description: "Navy blue never goes out of style. This New Wave tee pairs a timeless colour with a contemporary graphic for a look that works from the gym to the street. Made with breathable, moisture-wicking cotton.",
  },
  {
    id: 12,
    brand: "Adidas",
    name: "Sandstone Tactical Utility Shirt",
    price: 78,
    img: "images/products/n4.jpg",
    rating: 5,
    description: "Warm sand tones with a breezy, relaxed vibe. This tee is made from a soft cotton-linen blend that keeps you cool in the heat. A perfect pick for beach days or casual weekend hangs.",
  },
  {
    id: 13,
    brand: "Adidas",
    name: "Denim Blue Everyday Shirt",
    price: 79,
    img: "images/products/n5.jpg",
    rating: 5,
    description: "Rich burgundy with a lived-in feel. Pre-washed for instant softness, this tee has a slightly oversized cut and a graphic that gives it a vintage, worn-in character right from day one.",
  },
  {
    id: 14,
    brand: "Adidas",
    name: "Vertical Stripe Chino Shorts",
    price: 78,
    img: "images/products/n6.jpg",
    rating: 5,
    description: "Bold mustard yellow that makes a statement. The New Wave graphic is screen-printed with water-based inks for a soft, durable finish that won't crack or peel over time.",
  },
  {
    id: 15,
    brand: "Adidas",
    name: "Khaki Safari Work Shirt",
    price: 78,
    img: "images/products/n7.jpg",
    rating: 5,
    description: "Cool teal with a laid-back energy. This tee is cut from a smooth jersey knit that drapes well and feels light on the skin. Ideal for layering or wearing solo on warmer days.",
  },
  {
    id: 16,
    brand: "Adidas",
    name: "Deep Charcoal Casual Shirt",
    price: 78,
    img: "images/products/n8.jpg",
    rating: 5,
    description: "Soft blush pink with a gentle, modern graphic. This tee has a unisex cut that flatters all fits, with a slightly longer back hem for extra coverage. Made from 100% Fairtrade-certified cotton.",
  },
];

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
      <a href="#" class="cart" onclick="event.stopPropagation(); addToCart('${p.name}', '$${p.price}', '${p.img}', 1, 'M')">
        <i class="ri-shopping-cart-2-line"></i>
      </a>
    </div>
  `).join('');
}

renderProducts('shop-container', products);
renderProducts('featured-container', products.slice(0, 4));