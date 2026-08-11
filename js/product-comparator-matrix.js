/**
 * Product Comparison Matrix & Specification Table Engine
 * Renders side-by-side spec comparison tables and calculates value differences.
 */

function _escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class ProductComparatorMatrix {
  constructor(maxProducts = 4) {
    this.maxProducts = maxProducts;
    this.selectedProducts = [];
  }

  addProduct(product) {
    if (!product || !product.id) return false;
    if (this.selectedProducts.find(p => p.id === product.id)) return false;
    if (this.selectedProducts.length >= this.maxProducts) return false;

    this.selectedProducts.push(product);
    return true;
  }

  removeProduct(productId) {
    const initialLen = this.selectedProducts.length;
    this.selectedProducts = this.selectedProducts.filter(p => p.id !== productId);
    return this.selectedProducts.length < initialLen;
  }

  getComparisonMatrix() {
    const fields = ['name', 'brand', 'price', 'rating', 'category', 'color'];
    const matrix = {};

    fields.forEach(field => {
      matrix[field] = this.selectedProducts.map(p => p[field] ?? 'N/A');
    });

    return {
      products: this.selectedProducts,
      fields: matrix
    };
  }

  renderMatrixTable(containerId = 'comparator-matrix-container') {
    if (typeof document === 'undefined') return null;
    const container = document.getElementById(containerId);
    if (!container) return null;

    const data = this.getComparisonMatrix();
    if (data.products.length === 0) {
      container.innerHTML = '<p class="empty-comparator">No products selected for comparison.</p>';
      return container;
    }

    const headersHtml = data.products.map(p => `<th>${_escape(p.name)} <button data-id="${_escape(p.id)}" class="remove-comp-btn">×</button></th>`).join('');
    const rowsHtml = Object.entries(data.fields).map(([field, values]) => `
      <tr>
        <td class="spec-label">${_escape(field.toUpperCase())}</td>
        ${values.map(v => `<td>${_escape(v)}</td>`).join('')}
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="comparator-spec-table">
        <thead>
          <tr>
            <th>Specification</th>
            ${headersHtml}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
    return container;
  }

  /**
   * Identifies which product fields differ across the selected products.
   * Returns an array of field names where values are not all identical.
   * @returns {string[]} Array of field names that differ.
   */
  highlightMatrixDifferences() {
    if (this.selectedProducts.length < 2) return [];
    const result = [];
    const fields = ['name', 'brand', 'price', 'rating', 'category', 'color'];
    fields.forEach((field) => {
      const values = this.selectedProducts.map((p) => p[field] ?? 'N/A');
      const first = values[0];
      if (!values.every((v) => v === first)) {
        result.push(field);
      }
    });
    return result;
  }

}


export function getProductComparatorMatrixStatusHelper52() {
  return { status: "ok", fn: "getProductComparatorMatrixStatusHelper52" };
}
