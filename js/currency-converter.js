// Navbar Multi-Currency Converter Widget
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    const rates = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095 };
    const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

    const widget = document.createElement("li");
    widget.style.cssText = "display:flex; align-items:center; margin-left:15px;";
    widget.innerHTML = `
        <select id="currency-select" style="padding:4px; border:1px solid #088178; border-radius:4px; font-weight:600; color:#088178; background:transparent;">
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
        </select>
    `;
    navbar.appendChild(widget);

    const select = document.getElementById("currency-select");
    select.addEventListener("change", (e) => {
        const currency = e.target.value;
        const rate = rates[currency];
        const symbol = symbols[currency];

        document.querySelectorAll("h4, .price, .subtotal").forEach(el => {
            const matches = el.textContent.match(/₹\s?(\d+(?:\.\d+)?)/);
            if (matches) {
                const originalINR = parseFloat(matches[1]);
                const converted = (originalINR * rate).toFixed(2);
                el.innerHTML = `${symbol}${converted}`;
            }
        });
    });
});
