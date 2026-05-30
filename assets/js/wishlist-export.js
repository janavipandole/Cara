window.exportWishlistToCSV = function() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlist.length === 0) {
        if(typeof CaraToast !== 'undefined') CaraToast.show('Wishlist is empty!', 'warning');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Price,Image\n";
    wishlist.forEach(item => {
        csvContent += `"${item.id}","${item.name}","${item.price}","${item.image}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cara_wishlist.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
