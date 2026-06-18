// Size-specific Stock Level Tracker
document.addEventListener("DOMContentLoaded", () => {
    const sizeSelect = document.getElementById("sizeSelect") || document.querySelector("select");
    const stockContainer = document.getElementById("stock-alert-container");

    if (!sizeSelect || !stockContainer) return;

    const mockStock = {
        "Select Size": { count: 100, status: "normal" },
        "XL": { count: 0, status: "out" },
        "XXL": { count: 2, status: "low" },
        "Small": { count: 15, status: "normal" },
        "Medium": { count: 1, status: "low" },
        "Large": { count: 0, status: "out" }
    };

    sizeSelect.addEventListener("change", (e) => {
        const size = e.target.value;
        const info = mockStock[size] || { count: 5, status: "normal" };

        if (info.status === "out") {
            stockContainer.innerHTML = `
                <div style="background: rgba(226, 62, 87, 0.08); border: 1px solid #e23e57; padding: 12px; border-radius: 6px; margin: 10px 0;">
                    <span style="color: #e23e57; font-weight: 700;"><i class="ri-error-warning-fill"></i> Out of Stock!</span>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #555;">Get notified when this size returns:</p>
                    <div style="display: flex; gap: 6px; margin-top: 8px;">
                        <input type="email" id="restock-email" placeholder="Your Email" style="padding: 6px; flex: 1; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;" />
                        <button id="notify-restock-btn" style="background:#088178; color:white; border:none; padding:6px 12px; border-radius:4px; font-size:12px; cursor:pointer;">Notify Me</button>
                    </div>
                    <span id="restock-feedback" style="display:block; font-size:11px; margin-top:4px;"></span>
                </div>
            `;
            document.getElementById("notify-restock-btn").addEventListener("click", () => {
                const email = document.getElementById("restock-email").value.trim();
                const feedback = document.getElementById("restock-feedback");
                if (email) {
                    feedback.textContent = "Successfully subscribed to Restock alert!";
                    feedback.style.color = "#088178";
                } else {
                    feedback.textContent = "Please fill email.";
                    feedback.style.color = "#e23e57";
                }
            });
        } else if (info.status === "low") {
            stockContainer.innerHTML = `
                <div style="background: rgba(243, 156, 18, 0.08); border: 1px solid #f39c12; padding: 10px; border-radius: 6px; margin: 10px 0; color: #d35400; font-weight: 700; font-size: 13px;">
                    <i class="ri-alert-fill"></i> Only ${info.count} item(s) left in stock! Order soon.
                </div>
            `;
        } else {
            stockContainer.innerHTML = `
                <div style="background: rgba(8, 129, 120, 0.08); border: 1px solid #088178; padding: 10px; border-radius: 6px; margin: 10px 0; color: #088178; font-weight: 700; font-size: 13px;">
                    <i class="ri-checkbox-circle-fill"></i> Size available! Ready to ship.
                </div>
            `;
        }
    });
});
