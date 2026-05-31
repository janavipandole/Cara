// Checkout Promo Count Down Timer
document.addEventListener("DOMContentLoaded", () => {
    const totalEl = document.getElementById("summary-total");
    if (!totalEl) return;

    // Inject Urgency Bar at the top of checkout content
    const checkoutHeader = document.querySelector(".checkout-container") || document.body;
    const alertBar = document.createElement("div");
    alertBar.id = "checkout-promo-alert-bar";
    alertBar.style.cssText = "background: #e23e57; color: white; padding: 12px; text-align: center; font-weight: 700; font-family: sans-serif; font-size: 14px; margin-bottom: 20px; border-radius: 6px; animation: pulse 2s infinite;";
    alertBar.innerHTML = `<i class="ri-timer-line"></i> Limited Offer! Checkout in <span id="checkout-timer">15:00</span> to save an extra 5% discount on checkout total!`;
    
    checkoutHeader.parentNode.insertBefore(alertBar, checkoutHeader);

    let minutes = 15;
    let seconds = 0;
    let timerExpired = false;

    const timerInterval = setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(timerInterval);
                timerExpired = true;
                expirePromo();
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }

        const secStr = seconds < 10 ? "0" + seconds : seconds;
        const minStr = minutes < 10 ? "0" + minutes : minutes;
        const timerEl = document.getElementById("checkout-timer");
        if (timerEl) timerEl.textContent = `${minStr}:${secStr}`;
    }, 1000);

    // Apply 5% discount automatically
    const applyUrgencyDiscount = () => {
        let discountRow = document.getElementById("urgency-discount-row");
        if (!discountRow) {
            discountRow = document.createElement("div");
            discountRow.id = "urgency-discount-row";
            discountRow.className = "summary-row";
            discountRow.style.cssText = "display:flex; justify-content:space-between; margin-bottom: 8px; color: #e23e57; font-weight:700;";
            discountRow.innerHTML = "<span>Urgency Promo (5%)</span><span id='urgency-discount-val'>-₹0.00</span>";
            
            const divider = document.querySelector(".summary-divider");
            if (divider) divider.parentNode.insertBefore(discountRow, divider);
        }

        // Calculate and write values
        const subtotalText = document.getElementById("summary-subtotal")?.textContent || "0";
        const subtotal = parseFloat(subtotalText.replace(/[^\d\.]/g, "")) || 0;
        const discVal = subtotal * 0.05;

        document.getElementById("urgency-discount-val").textContent = "-₹" + discVal.toFixed(2);

        const taxText = document.getElementById("summary-tax")?.textContent || "0";
        const tax = parseFloat(taxText) || 0;

        const giftRow = document.getElementById("gift-wrap-charge-row");
        const giftCharge = giftRow ? 99 : 0;

        const finalTotal = subtotal + tax + giftCharge - discVal;
        totalEl.textContent = "₹" + finalTotal.toFixed(2);
    };

    // Auto-calculate on start
    setTimeout(applyUrgencyDiscount, 800);

    function expirePromo() {
        const bar = document.getElementById("checkout-promo-alert-bar");
        if (bar) {
            bar.style.background = "#7f8c8d";
            bar.innerHTML = `<i class="ri-error-warning-line"></i> Urgency promotional offer has expired.`;
        }
        const discountRow = document.getElementById("urgency-discount-row");
        if (discountRow) discountRow.remove();
        
        // Reset grand total without discount
        const subtotalText = document.getElementById("summary-subtotal")?.textContent || "0";
        const subtotal = parseFloat(subtotalText.replace(/[^\d\.]/g, "")) || 0;
        const taxText = document.getElementById("summary-tax")?.textContent || "0";
        const tax = parseFloat(taxText) || 0;
        const giftRow = document.getElementById("gift-wrap-charge-row");
        const giftCharge = giftRow ? 99 : 0;
        
        totalEl.textContent = "₹" + (subtotal + tax + giftCharge).toFixed(2);
    }
});
