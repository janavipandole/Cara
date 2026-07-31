/**
 * Blog Filter, Search & Reading Time Estimator
 */
function calculateReadingTime(text) {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
}
window.calculateReadingTime = calculateReadingTime;
