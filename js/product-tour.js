// Onboarding guided visual tour manager
document.addEventListener("DOMContentLoaded", () => {
    const startTour = () => {
        const steps = [
            { element: "#header", msg: "This is the navigation hub. Browse collections and view cart status." },
            { element: "#product1", msg: "Explore our featured apparel. Click any item for sizing and quick add." },
            { element: "#newsletter", msg: "Subscribe to our newsletters to stay updated with discounts." }
        ];

        let currentStep = 0;
        const popover = document.createElement("div");
        popover.id = "tour-popover";
        popover.style.cssText = "position:absolute; background:white; border:2px solid #088178; padding:15px; border-radius:8px; z-index:10000; box-shadow:0 4px 12px rgba(0,0,0,0.15); max-width:250px; font-family:sans-serif;";
        document.body.appendChild(popover);

        const renderStep = () => {
            const step = steps[currentStep];
            const el = document.querySelector(step.element);
            if (!el) return;

            const rect = el.getBoundingClientRect();
            popover.style.top = `${rect.bottom + window.scrollY + 10}px`;
            popover.style.left = `${rect.left + window.scrollX}px`;
            popover.innerHTML = `
                <p style="margin:0 0 10px 0; font-size:13px; color:#555;">${step.msg}</p>
                <div style="display:flex; justify-content:space-between;">
                    <button id="tour-next-btn" style="background:#088178; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">${currentStep === steps.length - 1 ? 'Finish' : 'Next'}</button>
                    <button id="tour-skip-btn" style="background:none; border:none; color:#999; cursor:pointer;">Skip</button>
                </div>
            `;

            document.getElementById("tour-next-btn").addEventListener("click", () => {
                currentStep++;
                if (currentStep < steps.length) {
                    renderStep();
                } else {
                    popover.remove();
                }
            });
            document.getElementById("tour-skip-btn").addEventListener("click", () => popover.remove());
        };

        renderStep();
    };

    if (!localStorage.getItem("cara_onboarded")) {
        setTimeout(startTour, 3000);
        localStorage.setItem("cara_onboarded", "true");
    }
});
