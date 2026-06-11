// Theme customization drawer panel
document.addEventListener("DOMContentLoaded", () => {
    const panel = document.createElement("div");
    panel.id = "theme-customizer-drawer";
    panel.style.cssText = "position:fixed; bottom:20px; left:20px; z-index:9999; background:white; border:1px solid #ccc; padding:15px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); font-family:sans-serif;";
    panel.innerHTML = `
        <h4 style="margin:0 0 10px 0; color:#088178;">Color Settings</h4>
        <div style="display:flex; gap:10px;">
            <button class="color-dot" data-color="#088178" style="width:25px; height:25px; border-radius:50%; background:#088178; border:none; cursor:pointer;"></button>
            <button class="color-dot" data-color="#3498db" style="width:25px; height:25px; border-radius:50%; background:#3498db; border:none; cursor:pointer;"></button>
            <button class="color-dot" data-color="#e74c3c" style="width:25px; height:25px; border-radius:50%; background:#e74c3c; border:none; cursor:pointer;"></button>
        </div>
    `;
    document.body.appendChild(panel);

    document.querySelectorAll(".color-dot").forEach(btn => {
        btn.addEventListener("click", () => {
            const color = btn.dataset.color;
            document.documentElement.style.setProperty("--primary-color", color);
            localStorage.setItem("cara_custom_theme_color", color);
        });
    });

    const savedColor = localStorage.getItem("cara_custom_theme_color");
    if (savedColor) {
        document.documentElement.style.setProperty("--primary-color", savedColor);
    }
});
