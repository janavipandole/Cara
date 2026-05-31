// Gift Wrapping Option Engine
document.addEventListener("DOMContentLoaded", () => {
    const giftCheckbox = document.getElementById("gift-wrap-opt");
    const giftMsgArea = document.getElementById("gift-msg-wrap");
    const subtotalRow = document.querySelector(".summary-row");

    if (!giftCheckbox) return;

    // Toggle message area
    giftCheckbox.addEventListener("change", () => {
        if (giftCheckbox.checked) {
            giftMsgArea.style.display = "block";
            addGiftCharges();
        } else {
            giftMsgArea.style.display = "none";
            removeGiftCharges();
        }
    });

    function addGiftCharges() {
        let chargeRow = document.getElementById("gift-wrap-charge-row");
        if (!chargeRow) {
            chargeRow = document.createElement("div");
            chargeRow.id = "gift-wrap-charge-row";
            chargeRow.className = "summary-row";
            chargeRow.style.cssText = "display:flex; justify-content:space-between; margin-bottom: 8px;";
            chargeRow.innerHTML = "<span>Gift Wrapping Service</span><span style='color: #088178;'>₹99.00</span>";
            subtotalRow.parentNode.insertBefore(chargeRow, subtotalRow.nextSibling);
        }
        recalculateTotals(99);
    }

    function removeGiftCharges() {
        const chargeRow = document.getElementById("gift-wrap-charge-row");
        if (chargeRow) {
            chargeRow.remove();
        }
        recalculateTotals(0);
    }

    function recalculateTotals(giftCharge) {
        const subtotalText = document.getElementById("summary-subtotal")?.textContent || "0";
        const subtotal = parseFloat(subtotalText.replace(/[^\d\.]/g, "")) || 0;
        const discountText = document.getElementById("summary-discount")?.textContent || "0";
        const discount = parseFloat(discountText.replace(/[^\d\.]/g, "")) || 0;
        const taxText = document.getElementById("summary-tax")?.textContent || "0";
        const tax = parseFloat(taxText) || 0;

        const totalEl = document.getElementById("summary-total");
        if (totalEl) {
            const finalTotal = subtotal + tax + giftCharge - discount;
            totalEl.textContent = "₹" + finalTotal.toFixed(2);
        }
    }
});
