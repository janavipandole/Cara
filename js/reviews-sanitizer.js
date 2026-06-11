// XSS Input Sanitization Engine
const ReviewSanitizer = {
    sanitize(input) {
        const temp = document.createElement("div");
        temp.textContent = input;
        let clean = temp.innerHTML;
        // Escape special quote symbols
        return clean.replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    }
};
window.ReviewSanitizer = ReviewSanitizer;
