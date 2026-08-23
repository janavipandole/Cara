/**
 * Background Tasks Web Worker
 *
 * Offloads CPU-intensive computations off the main UI thread to guarantee
 * a smooth 60 FPS rendering pipeline. Handles:
 *   - Product filtering / sorting (search pipeline)
 *   - Smart search with synonym expansion
 *   - Checkout summary financial calculations
 *   - Outfit compatibility scoring
 *   - Multi-coupon stacking
 *   - Volume discount pricing
 *   - Heavy JSON serialization / deserialization
 */

self.onmessage = function (event) {
  const { taskId, type, payload } = event.data;

  try {
    let result;

    switch (type) {
      case 'FILTER_PRODUCTS':
        result = filterProducts(payload);
        break;

      case 'SMART_SEARCH':
        result = smartSearch(payload);
        break;

      case 'CALCULATE_CHECKOUT_SUMMARY':
        result = calculateCheckoutSummary(payload);
        break;

      case 'CALCULATE_OUTFIT_SCORE':
        result = calculateOutfitScore(payload);
        break;

      case 'CALCULATE_COUPON_STACK':
        result = calculateCouponStack(payload);
        break;

      case 'CALCULATE_VOLUME_DISCOUNT':
        result = calculateVolumeDiscount(payload);
        break;

      case 'SERIALIZE_CART':
        result = JSON.stringify(payload.cart);
        break;

      case 'DESERIALIZE_CART':
        result = JSON.parse(payload.raw);
        break;

      default:
        throw new Error('Unknown task type: ' + type);
    }

    self.postMessage({ taskId, type, result, error: null });
  } catch (err) {
    self.postMessage({ taskId, type, result: null, error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  Product Filtering & Sorting                                       */
/* ------------------------------------------------------------------ */

function filterProducts({
  products,
  query,
  category,
  sort,
  brand,
  color,
  style,
}) {
  const q = (query || '').toLowerCase();
  const cat = category || 'all';
  const br = (brand || 'all').toLowerCase();
  const col = (color || 'all').toLowerCase();
  const st = (style || 'all').toLowerCase();

  let filtered = products.filter(function (product) {
    var matchesCategory = cat === 'all' || product.category === cat;
    var matchesSearch =
      q === '' ||
      product.name.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      (product.style && product.style.toLowerCase().includes(q)) ||
      (product.color && product.color.toLowerCase().includes(q));

    if (!matchesCategory || !matchesSearch) return false;

    if (br !== 'all' && product.brand.toLowerCase() !== br) return false;
    if (
      col !== 'all' &&
      (!product.color || product.color.toLowerCase() !== col)
    )
      return false;
    if (st !== 'all' && (!product.style || product.style.toLowerCase() !== st))
      return false;

    return true;
  });

  if (sort === 'low-high') {
    filtered.sort(function (a, b) {
      return a.price - b.price;
    });
  } else if (sort === 'high-low') {
    filtered.sort(function (a, b) {
      return b.price - a.price;
    });
  } else if (sort === 'rating-high') {
    filtered.sort(function (a, b) {
      return b.rating - a.rating;
    });
  } else if (sort === 'rating-low') {
    filtered.sort(function (a, b) {
      return a.rating - b.rating;
    });
  } else if (sort === 'newest') {
    filtered.sort(function (a, b) {
      return b.id - a.id;
    });
  }

  return filtered;
}

/* ------------------------------------------------------------------ */
/*  Smart Search with Synonym Expansion                               */
/* ------------------------------------------------------------------ */

var SYNONYMS = {
  shirt: ['tshirt', 't-shirt', 'top', 'tee', 'blouse'],
  pants: ['trousers', 'denim', 'jeans', 'slacks', 'bottoms'],
  jacket: ['coat', 'outerwear', 'blazer', 'hoodie', 'cardigan'],
  shoes: ['footwear', 'sneakers', 'boots', 'loafers'],
  dress: ['gown', 'frock', 'one-piece'],
};

function smartSearch({
  products,
  query,
  category,
  minPrice,
  maxPrice,
  sortBy,
  limit,
}) {
  var q = (query || '').toLowerCase().trim();
  if (!q) return products.slice(0, limit || 20);

  var terms = getSynonyms(q);

  var filtered = products.filter(function (product) {
    if (
      category &&
      category !== 'all' &&
      product.category &&
      product.category.toLowerCase() !== category.toLowerCase()
    ) {
      return false;
    }

    var price = parseFloat(product.price) || 0;
    if (minPrice != null && price < minPrice) return false;
    if (maxPrice != null && price > maxPrice) return false;

    var title = (product.name || product.title || '').toLowerCase();
    var desc = (product.description || '').toLowerCase();
    var cat = (product.category || '').toLowerCase();

    return terms.some(function (term) {
      return title.includes(term) || desc.includes(term) || cat.includes(term);
    });
  });

  if (sortBy === 'price-asc') {
    filtered.sort(function (a, b) {
      return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
    });
  } else if (sortBy === 'price-desc') {
    filtered.sort(function (a, b) {
      return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
    });
  } else if (sortBy === 'name') {
    filtered.sort(function (a, b) {
      return (a.name || '').localeCompare(b.name || '');
    });
  }

  return filtered.slice(0, limit || 50);
}

function getSynonyms(query) {
  var result = [query];
  var singular =
    query.endsWith('s') && query.length > 1 ? query.slice(0, -1) : query;
  if (singular !== query) result.push(singular);

  var keys = Object.keys(SYNONYMS);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var list = SYNONYMS[key];
    if (
      key === query ||
      list.indexOf(query) !== -1 ||
      key === singular ||
      list.indexOf(singular) !== -1
    ) {
      result.push(key);
      for (var j = 0; j < list.length; j++) {
        result.push(list[j]);
      }
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Checkout Summary Financial Calculations                           */
/* ------------------------------------------------------------------ */

function calculateCheckoutSummary({
  cart,
  couponCode,
  couponPct,
  hasUrgency,
  urgencyPct,
  hasGiftWrap,
  giftCharge,
  taxRate,
  loyaltyPoints,
  pointsPerRupee,
}) {
  var subtotalCents = 0;
  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var priceCents = Math.round((parseFloat(item.price) || 0) * 100);
    var qty = parseInt(item.quantity, 10) || 1;
    subtotalCents += priceCents * qty;
  }

  var subtotal = subtotalCents / 100;
  var couponDiscountCents = Math.round(
    (subtotalCents * (couponPct || 0)) / 100,
  );

  var urgencyDiscount = hasUrgency ? subtotal * (urgencyPct || 0.05) : 0;
  var urgencyDiscountCents = Math.round(urgencyDiscount * 100);

  var giftChargeCents = hasGiftWrap ? Math.round((giftCharge || 99) * 100) : 0;

  var taxCents = Math.round(subtotalCents * (taxRate || 0.18));

  var loyaltyDiscount = (loyaltyPoints || 0) / (pointsPerRupee || 10);
  var loyaltyDiscountCents = Math.round(loyaltyDiscount * 100);

  var grandTotalCents = Math.max(
    0,
    subtotalCents +
      taxCents +
      giftChargeCents -
      couponDiscountCents -
      urgencyDiscountCents -
      loyaltyDiscountCents,
  );

  return {
    subtotalCents: subtotalCents,
    taxCents: taxCents,
    couponDiscountCents: couponDiscountCents,
    urgencyDiscountCents: urgencyDiscountCents,
    giftChargeCents: giftChargeCents,
    loyaltyDiscountCents: loyaltyDiscountCents,
    grandTotalCents: grandTotalCents,
    couponCode: couponCode || '',
    loyaltyPoints: loyaltyPoints || 0,
    urgencyPct: urgencyPct || 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Outfit Compatibility Scoring                                      */
/* ------------------------------------------------------------------ */

var COLOR_HARMONIES = {
  black: ['white', 'red', 'blue', 'beige', 'grey', 'yellow'],
  white: ['black', 'blue', 'red', 'green', 'brown'],
  blue: ['white', 'beige', 'grey', 'yellow'],
  beige: ['black', 'blue', 'white', 'brown'],
  red: ['black', 'white', 'navy'],
  green: ['white', 'beige', 'black'],
};

function calculateOutfitScore({ top, bottom, footwear }) {
  if (!top || !bottom) return { score: 0, rating: 'Incomplete' };

  var score = 50;
  var topColor = (top.color || '').toLowerCase();
  var bottomColor = (bottom.color || '').toLowerCase();

  if (topColor === bottomColor) {
    score += 24;
  } else {
    var harmonies = COLOR_HARMONIES[topColor] || [];
    if (harmonies.indexOf(bottomColor) !== -1) score += 30;
    else score += 12;
  }

  if (footwear) {
    var footwearColor = (footwear.color || '').toLowerCase();
    var topFootScore =
      topColor === footwearColor
        ? 24
        : (COLOR_HARMONIES[topColor] || []).indexOf(footwearColor) !== -1
          ? 20
          : 10;
    var bottomFootScore =
      bottomColor === footwearColor
        ? 24
        : (COLOR_HARMONIES[bottomColor] || []).indexOf(footwearColor) !== -1
          ? 20
          : 10;
    score += Math.round((topFootScore + bottomFootScore) / 2);
  }

  if (
    top.style &&
    bottom.style &&
    top.style.toLowerCase() === bottom.style.toLowerCase()
  ) {
    score += 20;
  }

  score = Math.min(100, Math.max(0, score));

  var rating = 'Fair';
  if (score >= 90) rating = 'Perfect Match';
  else if (score >= 80) rating = 'Great Combination';
  else if (score >= 70) rating = 'Good Match';

  return { score: score, rating: rating };
}

/* ------------------------------------------------------------------ */
/*  Multi-Coupon Stacking                                             */
/* ------------------------------------------------------------------ */

function calculateCouponStack({ cartTotal, coupons, maxStack }) {
  if (
    !cartTotal ||
    cartTotal <= 0 ||
    !Array.isArray(coupons) ||
    coupons.length === 0
  ) {
    return { finalTotal: cartTotal || 0, discountTotal: 0, appliedCoupons: [] };
  }

  var limit = maxStack || 2;
  var validCoupons = coupons.slice(0, limit);
  var currentTotal = cartTotal;
  var totalDiscount = 0;
  var applied = [];

  for (var i = 0; i < validCoupons.length; i++) {
    var coupon = validCoupons[i];
    var discount = 0;
    if (coupon.type === 'percentage') {
      discount = Number((currentTotal * (coupon.value / 100)).toFixed(2));
    } else if (coupon.type === 'flat') {
      discount = Math.min(currentTotal, coupon.value);
    }
    if (discount > 0) {
      currentTotal -= discount;
      totalDiscount += discount;
      applied.push({ code: coupon.code, discount: discount });
    }
  }

  return {
    finalTotal: Number(currentTotal.toFixed(2)),
    discountTotal: Number(totalDiscount.toFixed(2)),
    appliedCoupons: applied,
  };
}

/* ------------------------------------------------------------------ */
/*  Volume Discount Pricing                                           */
/* ------------------------------------------------------------------ */

function calculateVolumeDiscount({ quantity, basePrice }) {
  var discountPct = 0;
  if (quantity >= 10) discountPct = 0.2;
  else if (quantity >= 5) discountPct = 0.15;
  else if (quantity >= 3) discountPct = 0.1;

  var unitPrice = Math.round(basePrice * (1 - discountPct) * 100) / 100;
  var totalPrice = Math.round(unitPrice * quantity * 100) / 100;
  var savings = Math.round((basePrice * quantity - totalPrice) * 100) / 100;

  return {
    quantity: quantity,
    basePrice: basePrice,
    discountPct: discountPct * 100,
    unitPrice: unitPrice,
    totalPrice: totalPrice,
    savings: savings,
  };
}
