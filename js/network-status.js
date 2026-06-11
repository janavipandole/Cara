// Real-time Network Status Listener
document.addEventListener("DOMContentLoaded", () => {
    const bar = document.createElement("div");
    bar.id = "network-status-banner";
    bar.style.cssText = "position:fixed; top:0; left:0; width:100%; text-align:center; padding:8px; z-index:100000; font-weight:bold; display:none;";
    document.body.appendChild(bar);

    const updateStatus = () => {
        if (navigator.onLine) {
            bar.style.display = "none";
        } else {
            bar.style.background = "#e23e57";
            bar.style.color = "white";
            bar.textContent = "You are currently offline. Product images and checkout operations may be unavailable.";
            bar.style.display = "block";
        }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
});
