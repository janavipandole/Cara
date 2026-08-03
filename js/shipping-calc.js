// Delivery Shipping Calculator
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('shipping-calculator-target');
  if (!container) return;

  container.innerHTML = `
        <div style="background: rgba(8,129,120,0.04); border: 1px solid rgba(8,129,120,0.2); border-radius: 8px; padding: 20px; margin: 30px 0; font-family: sans-serif;">
            <h3 style="color:#088178; margin-top:0;"><i class="ri-truck-line"></i> Shipping Cost Estimator</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Destination</label>
                    <select id="ship-country" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        <option value="IN">India (Domestic)</option>
                        <option value="US">United States (US)</option>
                        <option value="UK">United Kingdom (UK)</option>
                    </select>
                </div>
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Shipping Speed</label>
                    <select id="ship-speed" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        <option value="std">Standard Delivery (Free)</option>
                        <option value="exp">Express Delivery (+₹150)</option>
                    </select>
                </div>
            </div>
            <button id="calc-shipping-btn" style="background:#088178; color:white; font-weight:600; border:none; padding:10px 18px; border-radius:4px; cursor:pointer;">Calculate Shipping</button>
            <p id="calc-feedback" style="margin:12px 0 0 0; font-weight:700; color:#088178; min-height:18px;"></p>
        </div>
    `;

  document.getElementById('calc-shipping-btn').addEventListener('click', () => {
    const country = document.getElementById('ship-country').value;
    const speed = document.getElementById('ship-speed').value;
    let total = speed === 'exp' ? 150 : 0;
    let days = speed === 'exp' ? '2-3 days' : '5-7 days';

    if (country !== 'IN') {
      total += 450; // International shipping
      days = speed === 'exp' ? '4-5 days' : '9-12 days';
    }

    document.getElementById('calc-feedback').innerHTML = `
            Estimated Cost: ₹${total} <br>
            Estimated Time: ${days}
        `;

    // Dynamically update Cart Totals summary if elements exist
    const shippingEl = document.getElementById('summary-shipping');
    const totalEl = document.getElementById('summary-total');
    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const discountEl = document.getElementById('summary-discount');
    if (shippingEl && totalEl && subtotalEl && taxEl) {
      shippingEl.textContent = total === 0 ? 'FREE' : '₹' + total;

      const subtotalText = subtotalEl.textContent.replace(/[^\d.]/g, '');
      const subtotal = parseFloat(subtotalText) || 0;
      const taxText = taxEl.textContent.replace(/[^\d.]/g, '');
      const tax = parseFloat(taxText) || 0;
      const discount = discountEl
        ? parseFloat(discountEl.textContent.replace(/[^\d.]/g, '')) || 0
        : 0;

      const newTotal = Math.max(0, subtotal + tax + total - discount);
      totalEl.textContent = '₹' + Math.round(newTotal).toLocaleString('en-IN');
    }
  });
});

// Shipping calculator applying regional fee rates inside cart summary containers.
