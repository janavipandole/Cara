// Delivery Shipping Calculator
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('shipping-calculator-target');
  if (!container) return;

  const COUNTRY_RATES = {
    IN: { base: 0,   standardDays: '5-7 days',  expressDays: '2-3 days',  expressExtra: 150 },
    US: { base: 450, standardDays: '9-12 days', expressDays: '4-5 days',  expressExtra: 200 },
    UK: { base: 450, standardDays: '9-12 days', expressDays: '4-5 days',  expressExtra: 200 },
    CA: { base: 500, standardDays: '10-14 days', expressDays: '5-7 days', expressExtra: 220 },
    AU: { base: 500, standardDays: '10-14 days', expressDays: '5-7 days', expressExtra: 220 },
    DE: { base: 480, standardDays: '8-12 days',  expressDays: '3-5 days',  expressExtra: 210 },
    FR: { base: 480, standardDays: '8-12 days',  expressDays: '3-5 days',  expressExtra: 210 },
  };

  const countryOptions = Object.entries(COUNTRY_RATES)
    .map(([code, info]) => {
      const label = code === 'IN' ? 'India (Domestic)' : `${code} (International)`;
      return `<option value="${code}">${label}</option>`;
    })
    .join('');

  container.innerHTML = `
        <div style="background: rgba(8,129,120,0.04); border: 1px solid rgba(8,129,120,0.2); border-radius: 8px; padding: 20px; margin: 30px 0; font-family: sans-serif;">
            <h3 style="color:#088178; margin-top:0;"><i class="ri-truck-line"></i> Shipping Cost Estimator</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Destination</label>
                    <select id="ship-country" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        ${countryOptions}
                    </select>
                </div>
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Shipping Speed</label>
                    <select id="ship-speed" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        <option value="std">Standard Delivery (Free)</option>
                        <option value="exp">Express Delivery</option>
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
    const info = COUNTRY_RATES[country] || COUNTRY_RATES.IN;
    let total = info.base;
    let days = info.standardDays;
    if (speed === 'exp') { total += info.expressExtra; days = info.expressDays; }
    document.getElementById('calc-feedback').textContent =
      `Estimated Cost: ${total === 0 ? 'FREE' : '₹' + total} | Estimated Time: ${days}`;
    const shippingEl = document.getElementById('summary-shipping');
    const totalEl = document.getElementById('summary-total');
    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const discountEl = document.getElementById('summary-discount');
    if (shippingEl && totalEl && subtotalEl && taxEl && discountEl) {
      shippingEl.textContent = total === 0 ? 'FREE' : '₹' + total;
      const subtotal = parseFloat(subtotalEl.textContent.replace(/[^\d\.]/g, '')) || 0;
      const tax = parseFloat(taxEl.textContent.replace(/[^\d\.]/g, '')) || 0;
      const discount = discountEl ? parseFloat(discountEl.textContent.replace(/[^\d\.]/g, '')) || 0 : 0;
      totalEl.textContent = '₹' + Math.round(Math.max(0, subtotal + tax + total - discount)).toLocaleString('en-IN');
    }
  });
});