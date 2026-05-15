function renderWishlist() {
   console.log("wishlist updated")
}

function removeItem(wishlist) {

   wishlist = wishlist.filter((item) => {
      return item.id !== id
   })

   renderWishlist()
}
function add_prods(){
    button.addEventListener("click",()=>{
    wishlist.push(product);
    })
}

function remove_prods(){
    button.addEventListener("click",()=>{
    wishlist.push(product);
    })
}


function display_items(){
    for(let prods in wishlist){
        console.log(wishlist)
    }
}



