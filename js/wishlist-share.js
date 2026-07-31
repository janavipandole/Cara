/**
 * Wishlist Share Link Generator
 */
function generateWishlistShareLink() {
    const wishlist = JSON.parse(localStorage.getItem('cara_wishlist') || '[]');
    const encoded = encodeURIComponent(JSON.stringify(wishlist));
    return window.location.origin + '/wishlist.html?items=' + encoded;
}
window.generateWishlistShareLink = generateWishlistShareLink;
