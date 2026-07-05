/* global showToast */
// compare.js
// Logic for side-by-side product comparison rendering.

(function () {
  'use strict';

  function getCompareList() {
    try {
      return JSON.parse(localStorage.getItem('cara_compare_list')) || [];
    } catch {
      return [];
    }
  }

  function saveCompareList(list) {
    localStorage.setItem('cara_compare_list', JSON.stringify(list));
    // Trigger sync on comparison dock if loaded
    if (typeof window.renderCompareDock === 'function') {
      window.renderCompareDock();
    }
    if (typeof window.updateAllCompareButtons === 'function') {
      window.updateAllCompareButtons();
    }
  }

  function renderComparisonPage() {
    const list = getCompareList();
    const emptyView = document.getElementById('empty-compare');
    const tableView = document.getElementById('compare-table-wrapper');

    if (!emptyView || !tableView) return;

    if (list.length === 0) {
      emptyView.style.display = 'block';
      tableView.style.display = 'none';
      return;
    }

    emptyView.style.display = 'none';
    tableView.style.display = 'block';

    const allProducts = window.products || [];
    const productsToCompare = list.map((name) => {
      return (
        allProducts.find((p) => p.name === name) || {
          name,
          brand: 'Cara',
          price: 0,
          img: 'images/products/placeholder.jpg',
          rating: 4.0,
          category: 'unisex',
          color: 'N/A',
          style: 'Modern',
        }
      );
    });

    // Build comparison table columns
    const columnsCount = productsToCompare.length;
    const colWidth = 100 / (columnsCount + 1); // balance column widths

    // Header HTML with product cards
    let headerCellsHTML = `<td class="feature-name" style="width: ${colWidth}%;">Product</td>`;
    productsToCompare.forEach((p) => {
      headerCellsHTML += `
        <td style="width: ${colWidth}%;">
          <div class="compare-header-card">
            <button class="compare-remove-btn" data-product-name="${p.name}" aria-label="Remove ${p.name}">×</button>
            <img src="${p.img}" alt="${p.name}" class="compare-img" data-product-id="${p.id}">
            <span>${p.brand}</span>
            <h4>${p.name}</h4>
          </div>
        </td>
      `;
    });

    // Brand row
    let brandCellsHTML = '<td class="feature-name">Brand</td>';
    productsToCompare.forEach((p) => {
      brandCellsHTML += `<td>${p.brand}</td>`;
    });

    // Price row
    let priceCellsHTML = '<td class="feature-name">Price</td>';
    productsToCompare.forEach((p) => {
      priceCellsHTML += `<td class="compare-price">₹${p.price.toLocaleString('en-IN')}</td>`;
    });

    // Style Category row
    let categoryCellsHTML = '<td class="feature-name">Category / Style</td>';
    productsToCompare.forEach((p) => {
      const displayStyle = p.style
        ? p.style.charAt(0).toUpperCase() + p.style.slice(1)
        : 'Casual';
      const displayCat = p.category
        ? p.category.charAt(0).toUpperCase() + p.category.slice(1)
        : 'Fashion';
      categoryCellsHTML += `<td>${displayCat} &middot; ${displayStyle}</td>`;
    });

    // Sizing row (Mock details or sizing)
    let sizeCellsHTML = '<td class="feature-name">Available Sizes</td>';
    productsToCompare.forEach(() => {
      sizeCellsHTML += `<td>S, M, L, XL, XXL</td>`;
    });

    // Color row
    let colorCellsHTML = '<td class="feature-name">Color Theme</td>';
    productsToCompare.forEach((p) => {
      const colorVal = p.color
        ? p.color.charAt(0).toUpperCase() + p.color.slice(1)
        : 'Multi-color';
      colorCellsHTML += `<td>${colorVal}</td>`;
    });

    // Rating row
    let ratingCellsHTML = '<td class="feature-name">Customer Rating</td>';
    productsToCompare.forEach((p) => {
      // Build rating stars
      let starsHTML = '';
      const fullStars = Math.floor(p.rating);
      const hasHalf = p.rating % 1 !== 0;
      for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
          starsHTML += '<i class="ri-star-fill"></i>';
        } else if (i === fullStars && hasHalf) {
          starsHTML += '<i class="ri-star-half-fill"></i>';
        } else {
          starsHTML += '<i class="ri-star-line"></i>';
        }
      }
      ratingCellsHTML += `
        <td>
          <div class="compare-rating">
            ${starsHTML}
            <span>(${p.rating})</span>
          </div>
        </td>
      `;
    });

    // Action / Add to Cart Row
    let actionCellsHTML = '<td class="feature-name">Actions</td>';
    productsToCompare.forEach((p) => {
      actionCellsHTML += `
        <td class="compare-action-cell">
          <button class="compare-buy-btn" data-product-name="${p.name}" data-product-price="${p.price}" data-product-img="${p.img}">
            <i class="ri-shopping-cart-2-line"></i> ADD TO CART
          </button>
        </td>
      `;
    });

    tableView.innerHTML = `
      <table class="compare-table">
        <tbody>
          <tr class="compare-header-row">${headerCellsHTML}</tr>
          <tr>${brandCellsHTML}</tr>
          <tr>${priceCellsHTML}</tr>
          <tr>${categoryCellsHTML}</tr>
          <tr>${sizeCellsHTML}</tr>
          <tr>${colorCellsHTML}</tr>
          <tr>${ratingCellsHTML}</tr>
          <tr>${actionCellsHTML}</tr>
        </tbody>
      </table>
    `;

    // Event listeners: remove items
    tableView.querySelectorAll('.compare-remove-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.productName;
        const freshList = getCompareList().filter((item) => item !== name);
        saveCompareList(freshList);
        renderComparisonPage();
      });
    });

    // Event listeners: add to cart
    tableView.querySelectorAll('.compare-buy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.productName;
        const price = btn.dataset.productPrice;
        const img = btn.dataset.productImg;
        if (typeof window.addToCart === 'function') {
          window.addToCart(
            name,
            '₹' + parseFloat(price).toLocaleString('en-IN'),
            img,
            1,
            'M'
          );
        } else {
          // Fallback if addToCart not loaded
          const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
          cart.push({
            name,
            price: '₹' + parseFloat(price).toLocaleString('en-IN'),
            img,
            quantity: 1,
            size: 'M',
            id: Date.now(),
          });
          localStorage.setItem('productsInCart', JSON.stringify(cart));
          if (typeof showToast === 'function') {
            showToast(`${name} added to cart!`, 'success');
          }
          if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
          }
        }
      });
    });

    // Event listeners: image click navigates to singleProduct.html
    tableView.querySelectorAll('.compare-img').forEach((img) => {
      img.addEventListener('click', () => {
        const id = parseInt(img.dataset.productId);
        const prod = allProducts.find((p) => p.id === id);
        if (prod) {
          const selectedProduct = {
            id: prod.id,
            name: prod.name,
            price: '₹' + prod.price.toLocaleString('en-IN'),
            brand: prod.brand,
            image: prod.img,
          };
          localStorage.setItem(
            'selectedProduct',
            JSON.stringify(selectedProduct)
          );
          localStorage.setItem('selectedProductId', prod.name);
          window.location.href = 'singleProduct.html';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Wait slightly to make sure products database is loaded
    setTimeout(renderComparisonPage, 200);

    // Listen for compare list updates from compare-dock.js
    window.addEventListener('compareListUpdated', renderComparisonPage);
  });
})();
