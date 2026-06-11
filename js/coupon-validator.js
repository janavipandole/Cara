// E-Commerce Coupon Discount Validator
document.addEventListener("DOMContentLoaded", () => {
    const totalEl = document.getElementById("summary-total");
    if (!totalEl) return;

    const couponBox = document.createElement("div");
    couponBox.style.cssText = "margin: 15px 0; padding:15px; border:1px solid #ccc; border-radius:8px;";
    couponBox.innerHTML = `
        <label style="display:block; font-size:13px; font-weight:700; margin-bottom:5px;">Have a coupon?</label>
        <div style="display:flex; gap:8px;">
            <input type="text" id="coupon-code-input" placeholder="e.g. SAVE10" style="padding:6px; border:1px solid #ccc; border-radius:4px;" />
            <button id="apply-coupon-btn" style="background:#088178; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">Apply</button>
        </div>
        <p id="coupon-feedback" style="margin:6px 0 0 0; font-size:12px; font-weight:600;"></p>
    `;

    const summary = document.querySelector(".checkout-summary") || document.body;
    summary.appendChild(couponBox);

    document.getElementById("apply-coupon-btn").addEventListener("click", () => {
        const code = document.getElementById("coupon-code-input").value.trim().toUpperCase();
        const feedback = document.getElementById("coupon-feedback");

        if (code === "SAVE10") {
            feedback.textContent = "Promo applied! 10% coupon savings registered.";
            feedback.style.color = "#088178";
            
            const subtotalText = document.getElementById("summary-subtotal").textContent.replace(/[^\d\.]/g, "");
            const subtotal = parseFloat(subtotalText) || 0;
            const finalTotal = subtotal * 0.9;
            totalEl.textContent = "₹" + finalTotal.toFixed(2);
        } else {
            feedback.textContent = "Invalid coupon code format.";
            feedback.style.color = "#e23e57";
        }
    });
});
