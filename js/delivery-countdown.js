// Next-Day Dispatch Urgency Clock
document.addEventListener("DOMContentLoaded", () => {
    const details = document.querySelector(".single-pro-details") || document.body;
    
    const banner = document.createElement("div");
    banner.style.cssText = "background:rgba(8,129,120,0.06); padding:10px; border-radius:6px; margin: 10px 0; font-family:sans-serif;";
    banner.innerHTML = `Order within <strong id="dispatch-timer" style="color:#e23e57;">00:00:00</strong> to get next-day delivery dispatch!`;
    details.appendChild(banner);

    const updateTimer = () => {
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setHours(17, 0, 0, 0); // Dispatch deadline: 5PM

        let diff = tomorrow - now;
        if (diff < 0) {
            tomorrow.setDate(tomorrow.getDate() + 1);
            diff = tomorrow - now;
        }

        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = (num) => num.toString().padStart(2, '0');
        const timerEl = document.getElementById("dispatch-timer");
        if (timerEl) {
            timerEl.textContent = `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
        }
    };

    setInterval(updateTimer, 1000);
    updateTimer();
});
