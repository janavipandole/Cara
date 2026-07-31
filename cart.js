document.addEventListener("DOMContentLoaded", () => {
  const couponInput = document.getElementById("coupon-code-input");
  const applyBtn = document.getElementById("apply-coupon-btn");
  const feedback = document.getElementById("coupon-feedback");
  const discountRow = document.getElementById("summary-discount-row");
  const discountVal = document.getElementById("summary-discount");
  const subtotalEl = document.getElementById("summary-subtotal");
  const taxEl = document.getElementById("summary-tax");
  const totalEl = document.getElementById("summary-total");

  if (!applyBtn || !couponInput || !feedback) return;

  const parseAmount = (el) =>
    parseFloat((el.textContent || "").replace(/[₹$,]/g, "").trim()) || 0;

  const formatCurrency = (amount) =>
    "₹" + amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const resetTotalWithoutDiscount = () => {
    if (discountRow) discountRow.style.display = "none";
    const subtotal = parseAmount(subtotalEl);
    const tax = parseAmount(taxEl);
    totalEl.textContent = formatCurrency(subtotal + tax);
  };

  applyBtn.addEventListener("click", () => {
    const code = couponInput.value.trim().toUpperCase();

    if (code === "") {
      feedback.innerHTML = `<span class="feedback-error"><i class="ri-error-warning-fill"></i> Please enter a coupon code.</span>`;
      resetTotalWithoutDiscount();
      return;
    }

    if (code !== "CARA20") {
      feedback.innerHTML = `<span class="feedback-error"><i class="ri-error-warning-fill"></i> Invalid coupon code. Try CARA20.</span>`;
      resetTotalWithoutDiscount();
      return;
    }

    feedback.innerHTML = `<span class="feedback-success"><i class="ri-checkbox-circle-fill"></i> Coupon CARA20 applied! 20% discount active.</span>`;

    if (discountRow && discountVal) {
      discountRow.style.display = "flex";

      const subtotal = parseAmount(subtotalEl);
      const tax = parseAmount(taxEl);
      const discount = subtotal * 0.2;
      const total = subtotal + tax - discount;

      discountVal.textContent = "-" + formatCurrency(discount);
      totalEl.textContent = formatCurrency(total);
    }
  });
});