// Custom Fit Size Recommendation Panel
document.addEventListener("DOMContentLoaded", () => {
    const sizeSelect = document.getElementById("sizeSelect") || document.querySelector("select");
    if (!sizeSelect) return;

    const widget = document.createElement("div");
    widget.style.cssText = "margin: 10px 0; font-family:sans-serif;";
    widget.innerHTML = `
        <button id="size-advisor-btn" style="background:none; border:none; color:#088178; text-decoration:underline; font-weight:600; cursor:pointer;">Not sure about size? Check advisor</button>
        <div id="size-advisor-modal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:white; padding:20px; border:2px solid #088178; border-radius:8px; z-index:100000; box-shadow:0 4px 20px rgba(0,0,0,0.2);">
            <h4 style="margin-top:0; color:#088178;">Size Finder</h4>
            <label style="display:block; margin-bottom:5px;">Height (cm):</label>
            <input type="number" id="fit-height" style="margin-bottom:10px; padding:4px;" />
            <label style="display:block; margin-bottom:5px;">Weight (kg):</label>
            <input type="number" id="fit-weight" style="margin-bottom:15px; padding:4px;" />
            <button id="calc-fit-btn" style="background:#088178; color:white; padding:6px 12px; border:none; cursor:pointer;">Get Fit Suggestion</button>
            <p id="fit-result" style="margin-top:10px; font-weight:bold; color:#088178;"></p>
            <button id="close-fit-btn" style="background:none; border:none; color:#999; margin-top:10px; cursor:pointer;">Close</button>
        </div>
    `;

    sizeSelect.parentNode.insertBefore(widget, sizeSelect.nextSibling);

    document.getElementById("size-advisor-btn").addEventListener("click", () => {
        document.getElementById("size-advisor-modal").style.display = "block";
    });

    document.getElementById("close-fit-btn").addEventListener("click", () => {
        document.getElementById("size-advisor-modal").style.display = "none";
    });

    document.getElementById("calc-fit-btn").addEventListener("click", () => {
        const height = parseFloat(document.getElementById("fit-height").value) || 0;
        const weight = parseFloat(document.getElementById("fit-weight").value) || 0;
        const res = document.getElementById("fit-result");

        if (height > 180 || weight > 80) {
            res.textContent = "Recommended size: XL";
        } else if (height > 170 || weight > 65) {
            res.textContent = "Recommended size: L";
        } else {
            res.textContent = "Recommended size: M";
        }
    });
});
