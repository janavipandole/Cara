// Accessible field descriptions tooltips
document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll("input[required]");
    inputs.forEach((input, index) => {
        const descId = `field-desc-${index}`;
        input.setAttribute("aria-describedby", descId);

        const tooltip = document.createElement("span");
        tooltip.id = descId;
        tooltip.className = "sr-tooltip";
        tooltip.textContent = "Required field input.";
        tooltip.style.cssText = "position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;";
        input.parentNode.appendChild(tooltip);
    });
});
