const ORDER_API_BASE_URL = window.CARA_API_BASE_URL || '';



function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount || 0);
}

function authFetch(url, options = {}) {
  // Auth is carried by the httpOnly access_token cookie, attached
  // automatically because of credentials: 'include'.
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
}

function setStateVisibility({
  loading = false,
  error = false,
  empty = false,
  orders = false,
} = {}) {
  document.getElementById('loadingState').hidden = !loading;
  document.getElementById('errorState').hidden = !error;
  document.getElementById('emptyState').hidden = !empty;
  document.getElementById('ordersCard').hidden = !orders;
}

function statusClass(status) {
  return `status-pill status-${String(status || 'pending').toLowerCase()}`;
}
// Escapes HTML-significant characters so user-supplied order data
// (full_name, address, city, product_name, etc.) can never be
// interpreted as markup when interpolated into innerHTML.
function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (ch) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[ch],
  );
}
function renderOrders(orders) {
  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = '';

  orders.forEach((order) => {
    const row = document.createElement('tr');
    const createdAt = order.created_at
      ? new Date(order.created_at).toLocaleDateString()
      : 'N/A';

    row.innerHTML = `
      <td>#${escapeHtml(order.id)}</td>
      <td>${escapeHtml(createdAt)}</td>
      <td>${escapeHtml(formatCurrency(order.total_amount))}</td>
      <td><span class="${escapeHtml(statusClass(order.status))}">${escapeHtml(order.status)}</span></td>
      <td><button class="details-btn" type="button" data-order-id="${escapeHtml(order.id)}">View</button></td>
       <td><button class="cancel-btn" type="button" data-order-id="${escapeHtml(order.id)}">Cancel</button></td>
    `;

    tbody.appendChild(row);
  });

  setStateVisibility({ orders: true });
}

async function cancelOrder(orderId) {
  if (!confirm('Are you sure you want to cancel this order?')) return;

  try {
    const res = await authFetch(
      `${ORDER_API_BASE_URL}/api/orders/${orderId}/cancel`,
      {
        method: 'POST',
      },
    );
    const data = await res.json();

    if (!res.ok) {
      if (typeof showToast === 'function') {
        showToast(data.detail || 'Unable to cancel order.', 'error');
      } else {
        alert(data.detail || 'Unable to cancel order.');
      }
      return;
    }

    if (typeof showToast === 'function') {
      showToast('Order cancelled successfully.', 'success');
    }
    // Refresh the order list so the cancelled status shows immediately
    await fetchOrders();
  } catch (err) {
    if (typeof window.logError === 'function')
      window.logError('Cancel order failed:', err);
    if (typeof showToast === 'function') {
      showToast('Something went wrong. Please try again.', 'error');
    } else {
      alert('Something went wrong. Please try again.');
    }
  }
}

function renderOrderDetails(order) {
  const modal = document.getElementById('orderModal');
  const modalContent = document.getElementById('modalContent');
  const items = Array.isArray(order.items) ? order.items : [];

  modalContent.innerHTML = `
    <div class="order-detail-head">
      <p class="eyebrow">Order #${escapeHtml(order.id)}</p>
      <h2 style="margin: 0 0 8px;">${escapeHtml(order.status)}</h2>
      <p style="margin: 0; color: #55606f;">Placed on ${escapeHtml(order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A')}</p>
    </div>

    <div class="order-meta-grid">
      <div class="meta-card"><span class="meta-label">Customer</span><strong>${escapeHtml(order.full_name)}</strong></div>
      <div class="meta-card"><span class="meta-label">Email</span><strong>${escapeHtml(order.email)}</strong></div>
      <div class="meta-card"><span class="meta-label">Shipping</span><strong>${escapeHtml(order.address)}, ${escapeHtml(order.city)} ${escapeHtml(order.zip_code)}</strong></div>
      <div class="meta-card"><span class="meta-label">Total</span><strong>${escapeHtml(formatCurrency(order.total_amount))}</strong></div>
    </div>

    <h3 style="margin: 0 0 12px;">Items</h3>
    <div class="order-items">
      ${
        items
          .map(
            (item) => `
        <div class="item-card">
          <div>
            <p class="item-name">${escapeHtml(item.product_name)}</p>
            <p style="margin: 4px 0 0; color: #64748b;">Quantity: ${escapeHtml(item.quantity)}</p>
          </div>
          <strong>${escapeHtml(formatCurrency(item.price))}</strong>
        </div>
      `,
          )
          .join('') || '<p>No item details available.</p>'
      }
    </div>
  `;

  modal.hidden = false;
  modal.style.display = 'flex';
  modal.hidden = false;
}

async function fetchOrders() {
  setStateVisibility({ loading: true });

  try {
    const response = await authFetch(`${ORDER_API_BASE_URL}/api/orders/`);

    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('cara_user_token');
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok) {
      throw new Error(`Failed to load orders (${response.status})`);
    }

    const orders = await response.json();

    if (!orders.length) {
      setStateVisibility({ empty: true });
      return;
    }

    renderOrders(orders);
  } catch (error) {
    setStateVisibility({ error: true });
    document.getElementById('errorText').textContent =
      error.message || 'Something went wrong.';

    if (typeof window.logError === 'function') {
      window.logError('Failed to fetch order history:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof loadNavbar === 'function') {
    loadNavbar('orders');
  }

  const modal = document.getElementById('orderModal');
  modal.hidden = true;
  modal.style.display = 'none';

  document.getElementById('retryButton').addEventListener('click', fetchOrders);
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    const modalElement = document.getElementById('orderModal');
    modalElement.hidden = true;
    modalElement.style.display = 'none';
  });

  document.getElementById('orderModal').addEventListener('click', (event) => {
    if (event.target.id === 'orderModal') {
      event.currentTarget.hidden = true;
      event.currentTarget.style.display = 'none';
    }
  });

  document
    .getElementById('ordersTableBody')
    .addEventListener('click', async (event) => {
      const cancelTrigger = event.target.closest('.cancel-btn');
      if (cancelTrigger) {
        await cancelOrder(cancelTrigger.dataset.orderId);
        return;
      }

      const trigger = event.target.closest('[data-order-id]');
      if (!trigger) {
        return;
      }

      try {
        const response = await authFetch(
          `${ORDER_API_BASE_URL}/api/orders/${trigger.dataset.orderId}`,
        );

        if (!response.ok) {
          throw new Error('Failed to load order details');
        }

        const order = await response.json();
        renderOrderDetails(order);
      } catch (error) {
        if (typeof window.logError === 'function') {
          window.logError('Failed to fetch order detail:', error);
        }
        document.getElementById('errorText').textContent =
          error.message || 'Something went wrong.';
        setStateVisibility({ error: true });
      }
    });

  await fetchOrders();
});
