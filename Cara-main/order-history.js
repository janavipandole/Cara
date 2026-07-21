// order-history.js
// Reads orderHistory from localStorage and renders each past order

document.addEventListener('DOMContentLoaded', function () {
  const ordersList = document.getElementById('ordersList');
  const emptyOrders = document.getElementById('emptyOrders');

  // Read saved orders
  const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');

  if (history.length === 0) {
    emptyOrders.style.display = 'flex';
    return;
  }

  emptyOrders.style.display = 'none';

  // Render each order
  history.forEach(function (order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';

    // Order header
    const header = document.createElement('div');
    header.className = 'order-header';
    header.innerHTML = `
      <span class="order-id">${order.id}</span>
      <span class="order-date">${order.date}</span>
      <span class="order-total">Total: ₹${order.total.toLocaleString('en-IN')}</span>
    `;

    // Order items
    const itemsList = document.createElement('div');
    itemsList.className = 'order-items';

    order.items.forEach(function (item) {
      const itemRow = document.createElement('div');
      itemRow.className = 'order-item-row';
      itemRow.innerHTML = `
        <img src="${item.image || ''}" alt="${item.name}" class="order-item-img"/>
        <div class="order-item-info">
          <p class="order-item-name">${item.name}</p>
          <p class="order-item-meta">Size: ${item.size || 'N/A'} | Qty: ${item.quantity}</p>
          <p class="order-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
        </div>
      `;
      itemsList.appendChild(itemRow);
    });

    // Buy Again button
    const buyAgainBtn = document.createElement('button');
    buyAgainBtn.className = 'btn-buy-again';
    buyAgainBtn.textContent = 'Buy Again';
    buyAgainBtn.addEventListener('click', function () {
      // Add all items back to cart using existing addToCart logic
      order.items.forEach(function (item) {
        let cart = JSON.parse(localStorage.getItem('productsInCart') || '[]');
        const existing = cart.find(function (c) {
          return c.id === item.id && c.size === item.size;
        });
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          cart.push(item);
        }
        localStorage.setItem('productsInCart', JSON.stringify(cart));
      });
      window.location.href = 'cart.html';
    });

    orderCard.appendChild(header);
    orderCard.appendChild(itemsList);
    orderCard.appendChild(buyAgainBtn);
    ordersList.appendChild(orderCard);
  });
});
