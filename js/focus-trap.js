/**
 * Focus Trapping Utility for WCAG 2.1 Accessibility compliance.
 * Traps Tab and Shift+Tab key actions within the specified modal container.
 */
function trapFocus(modalElement) {
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element initially
    firstElement.focus();

    modalElement.addEventListener("keydown", function (e) {
        const isTabPressed = e.key === "Tab";
        if (!isTabPressed) return;

        if (e.shiftKey) {
            // Shift + Tab: circulate backwards
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            // Tab: circulate forwards
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
}
window.trapFocus = trapFocus;

// Traps keyboard focus inside active modal dialog elements for screen readers.