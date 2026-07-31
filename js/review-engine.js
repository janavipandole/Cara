/**
 * Customer Review & Rating Engine
 */
class ReviewEngine {
    constructor() {
        this.reviews = JSON.parse(localStorage.getItem('cara_reviews') || '[]');
    }

    addReview(productId, rating, comment, user) {
        const review = {
            id: Date.now(),
            productId,
            rating,
            comment,
            user,
            date: new Date().toLocaleDateString()
        };
        this.reviews.push(review);
        localStorage.setItem('cara_reviews', JSON.stringify(this.reviews));
        return review;
    }
}
window.reviewEngine = new ReviewEngine();
