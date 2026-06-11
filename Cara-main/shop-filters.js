/* ============================================================
   shop-filters.js — works WITH products.js / renderProducts()
   ============================================================ */

/* ── DOM refs ─────────────────────────────────────────────── */
const afbToggle = document.getElementById('afb-toggle');
const afbPanel = document.getElementById('afb-panel');
const afbActiveBadge = document.getElementById('afb-active-badge');
const afbChips = document.getElementById('afb-chips');
const priceMin = document.getElementById('afb-price-min');
const priceMax = document.getElementById('afb-price-max');
const priceMinDisplay = document.getElementById('afb-price-min-display');
const priceMaxDisplay = document.getElementById('afb-price-max-display');
const rangeFill = document.getElementById('afb-range-fill');
const categoryRadios = Array.from(
  document.querySelectorAll('input[name="afb-category"]')
);
const brandCheckboxes = Array.from(
  document.querySelectorAll('input[name="afb-brand"]')
);
const availCheckboxes = Array.from(
  document.querySelectorAll('input[name="afb-avail"]')
);
const ratingButtons = Array.from(document.querySelectorAll('.afb-star-btn'));
const clearBtn = document.getElementById('afb-clear-btn');
const applyBtn = document.getElementById('afb-apply-btn');
const sortSelect = document.getElementById('sort-price');
const countEl = document.getElementById('afb-count-num');
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchBtn');
const suggestionsBox = document.getElementById('searchSuggestions');

/* ── Panel toggle ─────────────────────────────────────────── */
const setPanelState = (expanded) => {
  afbToggle?.setAttribute('aria-expanded', String(expanded));
  afbPanel?.setAttribute('aria-hidden', String(!expanded));
  afbToggle?.classList.toggle('active', expanded);
};

afbToggle?.addEventListener('click', () =>
  setPanelState(afbToggle.getAttribute('aria-expanded') !== 'true')
);

/* ── Price slider ─────────────────────────────────────────── */
const updatePriceDisplay = () => {
  if (!priceMin || !priceMax) return;
  const lo = Math.min(+priceMin.value, +priceMax.value);
  const hi = Math.max(+priceMin.value, +priceMax.value);
  if (priceMinDisplay) priceMinDisplay.textContent = `₹${lo}`;
  if (priceMaxDisplay) priceMaxDisplay.textContent = `₹${hi}`;
  if (rangeFill) {
    const pct = (v) => (v / +priceMax.max) * 100;
    rangeFill.style.left = `${pct(lo)}%`;
    rangeFill.style.width = `${Math.max(pct(hi) - pct(lo), 0)}%`;
  }
};

[priceMin, priceMax].forEach((el) =>
  el?.addEventListener('input', () => {
    if (+priceMin.value > +priceMax.value) {
      if (el === priceMin) priceMax.value = priceMin.value;
      else priceMin.value = priceMax.value;
    }
    updatePriceDisplay();
    applyFilters();
  })
);

/* ── Visual states ────────────────────────────────────────── */
const refreshPillStates = () =>
  categoryRadios.forEach((r) =>
    r.closest('.afb-pill')?.classList.toggle('active', r.checked)
  );

const refreshCheckStates = () =>
  [...brandCheckboxes, ...availCheckboxes].forEach((c) =>
    c.closest('.afb-check')?.classList.toggle('active', c.checked)
  );

const refreshRatingStates = () =>
  ratingButtons.forEach((b) =>
    b.setAttribute(
      'aria-pressed',
      b.classList.contains('active') ? 'true' : 'false'
    )
  );

const getActiveRating = () =>
  +(
    ratingButtons.find((b) => b.classList.contains('active'))?.dataset.rating ??
    0
  );

/* ── Chips ────────────────────────────────────────────────── */
const updateChips = () => {
  if (!afbChips) return;
  afbChips.innerHTML = '';
  const chips = [];

  const cat = categoryRadios.find((r) => r.checked);
  if (cat && cat.value !== 'all') chips.push(`Category: ${cat.value}`);
  brandCheckboxes
    .filter((c) => c.checked)
    .forEach((c) => chips.push(`Brand: ${c.value}`));
  const rating = getActiveRating();
  if (rating > 0) chips.push(`Rating: ${rating}+`);
  availCheckboxes
    .filter((c) => c.checked)
    .forEach((c) =>
      chips.push(
        c.closest('.afb-check')?.querySelector('span')?.textContent?.trim() ||
          c.value
      )
    );
  const lo = +priceMin?.value ?? 0;
  const hi = +priceMax?.value ?? 100000;
  if (lo > +(priceMin?.min ?? 0) || hi < +(priceMax?.max ?? 100000))
    chips.push(`Price: ₹${lo} – ₹${hi}`);

  chips.forEach((label) => {
    const el = document.createElement('span');
    el.className = 'afb-chip';
    el.textContent = label;
    afbChips.appendChild(el);
  });

  if (afbActiveBadge) {
    afbActiveBadge.hidden = chips.length === 0;
    afbActiveBadge.textContent = chips.length;
  }
};

/* ── Core: filter the `products` array from products.js ───── */
const applyFilters = () => {
  // `products` is the global array defined in products.js
  if (typeof products === 'undefined') return;

  const lo = Math.min(+(priceMin?.value ?? 0), +(priceMax?.value ?? 100000));
  const hi = Math.max(+(priceMin?.value ?? 0), +(priceMax?.value ?? 100000));
  const selCat = categoryRadios.find((r) => r.checked)?.value ?? 'all';
  const selBrands = brandCheckboxes
    .filter((c) => c.checked)
    .map((c) => c.value.toLowerCase());
  const selAvail = availCheckboxes
    .filter((c) => c.checked)
    .map((c) => c.value.toLowerCase());
  const minRating = getActiveRating();
  const query = (searchInput?.value ?? '').toLowerCase().trim();
  const sortVal = sortSelect?.value ?? 'default';

  let filtered = products.filter((p) => {
    // Price — products.js prices are in ₹ (e.g. 2499)
    if (p.price < lo || p.price > hi) return false;

    // Category
    if (selCat !== 'all' && p.category !== selCat) return false;

    // Brand (only when at least one brand box is checked)
    if (selBrands.length && !selBrands.includes(p.brand.toLowerCase()))
      return false;

    // Availability — products.js has no avail field; treat all as instock
    // If user only wants "instock", all products pass. Pre-order / sale need data-availability.
    if (selAvail.length && !selAvail.includes('instock')) return false;

    // Rating
    if ((p.rating ?? 5) < minRating) return false;

    // Search
    if (
      query &&
      !p.name.toLowerCase().includes(query) &&
      !p.brand.toLowerCase().includes(query)
    )
      return false;

    return true;
  });

  // Sort
  if (sortVal === 'low-high') filtered.sort((a, b) => a.price - b.price);
  else if (sortVal === 'high-low') filtered.sort((a, b) => b.price - a.price);

  // Re-render via products.js helper
  renderProducts('shop-container', filtered);

  // Update counts
  const n = filtered.length;
  if (countEl) countEl.textContent = n;
  const legacy = document.getElementById('searchCount');
  if (legacy) legacy.textContent = `${n} product${n !== 1 ? 's' : ''}`;

  // Suggestions
  renderSearchSuggestions(query);

  updateChips();
};

/* ── Search input ─────────────────────────────────────────── */
if (searchInput) {
  // Remove old listener added by products.js (clone trick)
  const fresh = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(fresh, searchInput);
  fresh.addEventListener('input', () => {
    if (searchClearBtn) searchClearBtn.hidden = fresh.value === '';
    applyFilters();
  });
}

if (searchClearBtn) {
  const freshBtn = searchClearBtn.cloneNode(true);
  searchClearBtn.parentNode.replaceChild(freshBtn, searchClearBtn);
  freshBtn.hidden = true;
  freshBtn.addEventListener('click', () => {
    const inp = document.getElementById('searchInput');
    if (inp) inp.value = '';
    freshBtn.hidden = true;
    if (suggestionsBox) suggestionsBox.innerHTML = '';
    applyFilters();
  });
}

/* ── Filter controls ──────────────────────────────────────── */
categoryRadios.forEach((r) =>
  r.addEventListener('change', () => {
    refreshPillStates();
    applyFilters();
  })
);
brandCheckboxes.forEach((c) =>
  c.addEventListener('change', () => {
    refreshCheckStates();
    applyFilters();
  })
);
availCheckboxes.forEach((c) =>
  c.addEventListener('change', () => {
    refreshCheckStates();
    applyFilters();
  })
);
ratingButtons.forEach((btn) =>
  btn.addEventListener('click', () => {
    ratingButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    refreshRatingStates();
    applyFilters();
  })
);
sortSelect?.addEventListener('change', applyFilters);

applyBtn?.addEventListener('click', () => {
  setPanelState(false);
  applyFilters();
});

clearBtn?.addEventListener('click', () => {
  categoryRadios.forEach((r) => {
    r.checked = r.value === 'all';
  });
  brandCheckboxes.forEach((c) => {
    c.checked = false;
  });
  availCheckboxes.forEach((c) => {
    c.checked = c.value === 'instock';
  });
  ratingButtons.forEach((b, i) => b.classList.toggle('active', i === 0));
  if (priceMin) priceMin.value = priceMin.min;
  if (priceMax) priceMax.value = priceMax.max;
  const inp = document.getElementById('searchInput');
  if (inp) inp.value = '';
  if (suggestionsBox) suggestionsBox.innerHTML = '';
  updatePriceDisplay();
  refreshPillStates();
  refreshCheckStates();
  refreshRatingStates();
  applyFilters();
});

/* ── Init ─────────────────────────────────────────────────── */
// Update price display to show ₹ and set max to match product price range
const initPriceRange = () => {
  if (!priceMin || !priceMax) return;
  const maxPrice = Math.max(...products.map((p) => p.price));
  priceMin.max = maxPrice;
  priceMax.max = maxPrice;
  priceMax.value = maxPrice;
  priceMin.value = 0;
  updatePriceDisplay();
};

const init = () => {
  if (typeof products === 'undefined') {
    setTimeout(init, 100);
    return;
  }
  initPriceRange();
  refreshPillStates();
  refreshCheckStates();
  refreshRatingStates();
  applyFilters();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 80));
} else {
  setTimeout(init, 80);
}
