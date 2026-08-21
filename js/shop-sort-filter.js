// Dynamic Catalog Sorter and Filter
function initShopSortFilter() {
  if (typeof document === 'undefined') return;
  const productsContainer =
    document.getElementById('shop-products-container') ||
    document.querySelector('.pro-container');
  if (!productsContainer) return;

  // Skip re-initialization if the control panel is already present.
  if (document.getElementById('catalog-sorter')) return;

  // Inject Sort Control Panel
  const controlPanel = document.createElement('div');
  controlPanel.style.cssText =
    'display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; flex-wrap:wrap; gap:10px;';
  controlPanel.innerHTML = `
        <div>
            <label style="font-size:14px; font-weight:600; margin-right:8px; color: #088178;">Filter by Price:</label>
            <select id="price-filter" style="padding:6px 12px; border-radius:4px; border:1px solid #ccc; font-weight: 500;">
                <option value="all">All Prices</option>
                <option value="low">Under ₹100</option>
                <option value="high">₹100 and above</option>
            </select>
        </div>
        <div>
            <label style="font-size:14px; font-weight:600; margin-right:8px; color: #088178;">Sort Catalogue:</label>
            <select id="catalog-sorter" style="padding:6px 12px; border-radius:4px; border:1px solid #ccc; font-weight: 500;">
                <option value="default">Featured</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
            </select>
        </div>
    `;
  productsContainer.parentNode.insertBefore(controlPanel, productsContainer);

  const originalProductCards = Array.from(
    productsContainer.querySelectorAll('.pro'),
  );

  const filterAndSort = () => {
    const priceVal = document.getElementById('price-filter').value;
    const sortVal = document.getElementById('catalog-sorter').value;

    let filtered = [...originalProductCards];

    // Filter
    if (priceVal !== 'all') {
      filtered = filtered.filter((card) => {
        const priceText = card.querySelector('h4')?.textContent || '0';
        const rawPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        // Guard against NaN — treat unparseable prices as 0 (under-100 bucket)
        const price = Number.isNaN(rawPrice) ? 0 : rawPrice;
        return priceVal === 'low' ? price < 100 : price >= 100;
      });
    }

    // Sort
    if (sortVal === 'asc' || sortVal === 'desc') {
      filtered.sort((a, b) => {
        const rA = parseFloat(
          a.querySelector('h4')?.textContent.replace(/[^0-9.]/g, ''),
        );
        const rB = parseFloat(
          b.querySelector('h4')?.textContent.replace(/[^0-9.]/g, ''),
        );
        const pA = Number.isNaN(rA) ? 0 : rA;
        const pB = Number.isNaN(rB) ? 0 : rB;
        return sortVal === 'asc' ? pA - pB : pB - pA;
      });
    }

    // Update container DOM
    productsContainer.innerHTML = '';
    filtered.forEach((card) => productsContainer.appendChild(card));
  };

  document
    .getElementById('price-filter')
    .addEventListener('change', filterAndSort);
  document
    .getElementById('catalog-sorter')
    .addEventListener('change', filterAndSort);
}

// Initialize when the DOM is ready. The immediate idempotent call covers
// deferred scripts that load after DOMContentLoaded has already fired.
document.addEventListener('DOMContentLoaded', initShopSortFilter);
initShopSortFilter();


export function getShopSortFilterStatusHelper73() {
  return { status: "ok", fn: "getShopSortFilterStatusHelper73" };
}
