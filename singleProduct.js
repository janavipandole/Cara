/**
 * singleProduct.js
 *
 * Manages the Size Chart on the product detail page.
 *
 * Behaviour:
 *  - Clicking "View Size Chart" opens a floating panel that appears
 *    beside the size selector, NOT as a full-screen blocking modal.
 *  - Clicking the × inside the panel, clicking anywhere outside it,
 *    or pressing Escape closes the panel.
 *  - Clicking a row in the size chart selects that size in the dropdown
 *    and closes the panel automatically.
 */

document.addEventListener('DOMContentLoaded', function () {
    const panel   = document.getElementById('size-chart-modal');
    const openBtn = document.getElementById('size-chart-btn');
    const closeBtn = panel ? panel.querySelector('.close-btn') : null;
    const sizeDropdown = document.getElementById('product-size');

    if (!panel || !openBtn) return; // guard: elements might not exist on every page

    // ── Open the floating panel ──────────────────────────────────
    openBtn.addEventListener('click', function (e) {
        e.stopPropagation(); // prevent document click from immediately closing it
        const isOpen = panel.classList.contains('is-open');
        if (isOpen) {
            closePanel();
        } else {
            openPanel();
        }
    });

    // ── Close via × button ───────────────────────────────────────
    if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            closePanel();
        });
    }

    // ── Close via Escape key ─────────────────────────────────────
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closePanel();
    });

    // ── Close when clicking outside the panel ────────────────────
    document.addEventListener('click', function (e) {
        if (panel.classList.contains('is-open') &&
            !panel.contains(e.target) &&
            e.target !== openBtn) {
            closePanel();
        }
    });

    // ── Click a size row → auto-select size + close panel ────────
    panel.querySelectorAll('tbody tr').forEach(function (row) {
        row.style.cursor = 'pointer';
        row.addEventListener('click', function () {
            const sizeCell = row.querySelector('td:first-child');
            if (sizeCell && sizeDropdown) {
                const selectedSize = sizeCell.textContent.trim();
                // Match option value case-insensitively
                Array.from(sizeDropdown.options).forEach(function (opt) {
                    if (opt.value.toUpperCase() === selectedSize.toUpperCase()) {
                        sizeDropdown.value = opt.value;
                    }
                });
            }
            closePanel();
        });

        // Hover highlight
        row.addEventListener('mouseenter', function () {
            row.style.background = 'rgba(8, 129, 120, 0.10)';
        });
        row.addEventListener('mouseleave', function () {
            row.style.background = '';
        });
    });

    // ── Helpers ──────────────────────────────────────────────────
    function openPanel() {
        panel.classList.add('is-open');
        openBtn.setAttribute('aria-expanded', 'true');
    }

    function closePanel() {
        panel.classList.remove('is-open');
        openBtn.setAttribute('aria-expanded', 'false');
    }
});