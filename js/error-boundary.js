/**
 * Global Error Boundary Fallback for Cara Storefront.
 * Catches unhandled runtime exceptions and displays a user-friendly modal
 * to recover or reload the page, instead of a broken blank screen.
 */
window.addEventListener("error", function (event) {
    console.error("Unhandled runtime error captured by Cara boundary:", event.error);

    // Prevent displaying multiple error dialogs
    if (document.getElementById("cara-error-boundary-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "cara-error-boundary-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.8)";
    overlay.style.zIndex = "999999";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.color = "#fff";
    overlay.style.fontFamily = "sans-serif";
    overlay.style.padding = "20px";

    const card = document.createElement("div");
    card.style.background = "#fff";
    card.style.color = "#333";
    card.style.padding = "30px";
    card.style.borderRadius = "8px";
    card.style.maxWidth = "500px";
    card.style.width = "100%";
    card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    card.style.textAlign = "center";

    card.innerHTML = `
        <h2 style="color: #ef4444; margin-top: 0;">Oops! Something went wrong</h2>
        <p style="color: #555; margin-bottom: 20px;">We encountered an unexpected error while loading this page. Don't worry, your shopping bag is safe!</p>
        <div style="background: #f4f4f5; padding: 12px; border-radius: 6px; text-align: left; font-family: monospace; font-size: 13px; color: #ef4444; overflow-x: auto; margin-bottom: 25px; max-height: 150px;">
            ${event.message || "Unknown Runtime Error"}
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="window.location.reload()" style="background: #088178; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: 600;">Reload Page</button>
            <button onclick="document.getElementById('cara-error-boundary-overlay').remove()" style="background: #e4e4e7; color: #333; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Dismiss</button>
        </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);
});
