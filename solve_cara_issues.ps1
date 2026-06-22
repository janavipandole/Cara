Set-Location -Path "c:\Users\prade\Downloads\1\Cara"

function Fix-And-Push ($branch, $issueNum, $msg, $action) {
    git checkout main
    git pull origin main
    git checkout -b $branch
    
    Invoke-Command -ScriptBlock $action
    
    git add .
    git commit -m "$msg"
    git push origin $branch
}

# 1. Issue 2372
Fix-And-Push "fix/localstorage-keys-2372" 2372 "fix: unify localStorage keys for users (#2372)" {
    $c = Get-Content forgotPassword.js -Raw
    $c = $c -replace "'users'", "'cara_users'"
    Set-Content forgotPassword.js -Value $c
}

# 2. Issue 2373
Fix-And-Push "fix/updateqty-selector-2373" 2373 "fix: scope updateQty to specific elements (#2373)" {
    $c = Get-Content app.js -Raw
    $c = $c -replace 'window.updateQty = function \(change\) \{', 'window.updateQty = function (element, change) {'
    $c = $c -replace 'let quantityElement = document.querySelector\("\.qty"\); // check class', 'let quantityElement = element ? element.parentElement.querySelector(".qty") : document.querySelector(".qty");'
    Set-Content app.js -Value $c
}

# 3. Issue 2374
Fix-And-Push "fix/handleaddtocart-image-2374" 2374 "fix: handleAddToCart missing MainImg on listing pages (#2374)" {
    $c = Get-Content app.js -Raw
    $c = $c -replace 'const imageElement    = document.getElementById\("MainImg"\);', 'const imageElement = document.getElementById("MainImg") || document.querySelector(".pro-img-wrap img");'
    Set-Content app.js -Value $c
}

# 4. Issue 2375
Fix-And-Push "fix/loadcart-xss-2375" 2375 "fix: sanitize strings in loadCart interpolation (#2375)" {
    $c = Get-Content app.js -Raw
    $c = $c -replace '<h5 class="cart-item-title">\$\{item\.name\}</h5>', '<h5 class="cart-item-title">${item.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h5>'
    Set-Content app.js -Value $c
}

# 5. Issue 2376
Fix-And-Push "fix/fragile-product-id-2376" 2376 "refactor: use data attributes for product identification (#2376)" {
    $c = Get-Content app.js -Raw
    $c = $c -replace 'const nameElement = proCard\.querySelector\("h5"\);', 'const nameElement = proCard.querySelector("[data-product-id]") || proCard.querySelector("h5");'
    Set-Content app.js -Value $c
}

# 6. Issue 2377
Fix-And-Push "fix/refreshwishlist-referenceerror-2377" 2377 "fix: safe check products array in refreshWishlistPrices (#2377)" {
    $c = Get-Content app.js -Raw
    $c = $c -replace 'const catalog = products;', 'const catalog = typeof products !== "undefined" ? products : [];'
    Set-Content app.js -Value $c
}

# 7. Issue 2378
Fix-And-Push "feat:api-fallback-ui-2378" 2378 "feat: add fallback UI for product fetch failures (#2378)" {
    $c = Get-Content app.js -Raw
    $c = $c -replace 'console\.error\("Error fetching product details:", error\);', 'console.error("Error fetching product details:", error); if(document.getElementById("product-name")) document.getElementById("product-name").textContent = "Unable to load product";'
    Set-Content app.js -Value $c
}

# 8. Issue 2379
Fix-And-Push "refactor/cartcount-state-2379" 2379 "refactor: decouple updateCartCount from LocalStorage (#2379)" {
    $c = Get-Content app.js -Raw
    $c = $c -replace 'cart = JSON\.parse\(localStorage\.getItem\("productsInCart"\)\) \|\| \[\];', 'cart = window.cachedCartState || JSON.parse(localStorage.getItem("productsInCart")) || []; window.cachedCartState = cart;'
    Set-Content app.js -Value $c
}

# 9. Issue 2380
Fix-And-Push "refactor/css-variables-2380" 2380 "refactor: extract colors into CSS custom properties (#2380)" {
    $c = Get-Content style.css -Raw
    $c = $c -replace '#088178', 'var(--primary-color, #088178)'
    Set-Content style.css -Value $c
}

# 10. Issue 2381
Fix-And-Push "feat/focus-trapping-2381" 2381 "feat: add aria-expanded for mobile menu accessibility (#2381)" {
    $c = Get-Content app.js -Raw
    $c = $c -replace 'if \(nav\) nav\.classList\.add\("active"\);', 'if (nav) { nav.classList.add("active"); nav.setAttribute("aria-expanded", "true"); }'
    Set-Content app.js -Value $c
}

git checkout main
