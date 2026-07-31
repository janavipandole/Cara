/**
 * Wishlist Export Utility (CSV / JSON)
 */
function exportWishlistCSV() {
    const wishlist = JSON.parse(localStorage.getItem('cara_wishlist') || '[]');
    if (wishlist.length === 0) return alert('Wishlist is empty!');
    let csv = 'Product ID,Name,Price\n';
    wishlist.forEach(item => {
        csv += `"${item.id}","${item.name}","${item.price}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cara-wishlist.csv';
    a.click();
}
window.exportWishlistCSV = exportWishlistCSV;
