// Focus Trap Utility for Modal Accessibility
const ModalFocusTrap = {
    trap(modalEl) {
        const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([-1])';
        const focusableElements = modalEl.querySelectorAll(focusableSelectors);
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        modalEl.addEventListener("keydown", (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            }
        });
        first.focus();
    }
};
window.ModalFocusTrap = ModalFocusTrap;
