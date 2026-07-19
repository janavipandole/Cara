/**
 * Outfit Compatibility Checker
 * Resolves: https://github.com/janavipandole/Cara/issues/2112
 */

const COLOR_HARMONY = {
  red: ['white', 'black', 'navy', 'beige', 'grey'],
  orange: ['white', 'black', 'brown', 'navy', 'beige'],
  yellow: ['white', 'black', 'navy', 'grey', 'purple'],
  green: ['white', 'black', 'beige', 'brown', 'navy'],
  blue: ['white', 'grey', 'beige', 'navy', 'brown'],
  navy: ['white', 'grey', 'beige', 'red', 'yellow'],
  purple: ['white', 'black', 'grey', 'beige', 'yellow'],
  pink: ['white', 'black', 'grey', 'navy', 'beige'],
  brown: ['white', 'beige', 'navy', 'green', 'orange'],
  black: ['white', 'grey', 'red', 'yellow', 'pink'],
  white: ['black', 'navy', 'red', 'brown', 'green'],
  grey: ['white', 'black', 'navy', 'pink', 'purple'],
  beige: ['white', 'brown', 'navy', 'green', 'grey'],
};

const CLASHING_PAIRS = [
  ['red', 'orange'],
  ['red', 'pink'],
  ['orange', 'pink'],
  ['yellow', 'green'],
  ['purple', 'orange'],
  ['blue', 'green'],
  ['brown', 'black'],
];

const STYLE_CATEGORIES = {
  casual: [
    't-shirt',
    'jeans',
    'sneakers',
    'hoodie',
    'shorts',
    'sweatshirt',
    'cap',
    'sandals',
  ],
  formal: [
    'suit',
    'blazer',
    'dress shirt',
    'trousers',
    'heels',
    'oxford',
    'tie',
    'gown',
  ],
  business: [
    'blazer',
    'chinos',
    'polo',
    'loafers',
    'dress pants',
    'skirt',
    'button-down',
  ],
  party: [
    'dress',
    'sequin',
    'heels',
    'jumpsuit',
    'crop top',
    'bodycon',
    'mini skirt',
  ],
  sport: [
    'jersey',
    'track pants',
    'leggings',
    'sports shoes',
    'athletic shorts',
    'zip-up',
  ],
};

const OCCASION_STYLES = {
  'Casual Day Out': ['casual'],
  'Office / Work': ['formal', 'business'],
  'Party / Night Out': ['party', 'casual'],
  'Wedding / Formal Event': ['formal'],
  'Gym / Sport': ['sport'],
  'Date Night': ['party', 'casual', 'business'],
};

function getColorClash(c1, c2) {
  return CLASHING_PAIRS.some(
    ([a, b]) => (a === c1 && b === c2) || (b === c1 && a === c2),
  );
}

function getStyleGroup(item) {
  const lower = item.toLowerCase();
  for (const [group, keywords] of Object.entries(STYLE_CATEGORIES)) {
    if (keywords.some((k) => lower.includes(k))) return group;
  }
  return null;
}

function capitalise(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function checkOutfitCompatibility({
  topColor,
  bottomColor,
  topItem,
  bottomItem,
  occasion,
}) {
  const messages = [];
  let score = 100;

  const clashing = getColorClash(topColor, bottomColor);
  if (clashing) {
    score -= 40;
    const suggestions = COLOR_HARMONY[topColor] || [];
    messages.push({
      type: 'error',
      text: `⚠️ ${capitalise(topColor)} and ${capitalise(bottomColor)} clash. Try pairing ${capitalise(topColor)} with: ${suggestions.map(capitalise).join(', ')}.`,
    });
  } else {
    const harmonious = COLOR_HARMONY[topColor]?.includes(bottomColor);
    if (harmonious) {
      messages.push({
        type: 'success',
        text: `✅ ${capitalise(topColor)} & ${capitalise(bottomColor)} are a great colour match!`,
      });
    } else {
      score -= 10;
      messages.push({
        type: 'warning',
        text: `🟡 ${capitalise(topColor)} & ${capitalise(bottomColor)} are neutral — works but not a classic pairing.`,
      });
    }
  }

  const topGroup = getStyleGroup(topItem);
  const bottomGroup = getStyleGroup(bottomItem);
  if (topGroup && bottomGroup && topGroup !== bottomGroup) {
    const okCross = new Set([
      'business+casual',
      'casual+business',
      'party+casual',
      'casual+party',
    ]);
    if (!okCross.has(`${topGroup}+${bottomGroup}`)) {
      score -= 30;
      messages.push({
        type: 'error',
        text: `⚠️ Mixing ${topGroup} (top) and ${bottomGroup} (bottom) styles may not work. Stick to one style category.`,
      });
    } else {
      messages.push({
        type: 'success',
        text: `✅ Mixing ${topGroup} & ${bottomGroup} can work — a smart-casual combo!`,
      });
    }
  } else if (topGroup && bottomGroup) {
    messages.push({
      type: 'success',
      text: `✅ Both pieces are ${topGroup} style — cohesive look!`,
    });
  }

  if (occasion && occasion !== 'Any') {
    const allowedStyles = OCCASION_STYLES[occasion] || [];
    const topOk = !topGroup || allowedStyles.includes(topGroup);
    const bottomOk = !bottomGroup || allowedStyles.includes(bottomGroup);
    if (!topOk || !bottomOk) {
      score -= 20;
      const badItem = !topOk ? `top (${topGroup})` : `bottom (${bottomGroup})`;
      messages.push({
        type: 'warning',
        text: `🟡 Your ${badItem} style may not suit a ${occasion} occasion. Consider switching to ${allowedStyles.join(' or ')} pieces.`,
      });
    } else {
      messages.push({
        type: 'success',
        text: `✅ Great choice for a ${occasion} occasion!`,
      });
    }
  }

  return { score: Math.max(0, score), messages };
}

function getScoreLabel(score) {
  if (score >= 85) return { label: 'Excellent Match', emoji: '🌟' };
  if (score >= 65) return { label: 'Good Combo', emoji: '👍' };
  if (score >= 40) return { label: 'Could Be Better', emoji: '🤔' };
  return { label: 'Clash Alert!', emoji: '❌' };
}

function getScoreColor(score) {
  if (score >= 85) return '#22c55e';
  if (score >= 65) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function renderResult(result) {
  const { score, messages } = result;
  const { label, emoji } = getScoreLabel(score);
  const color = getScoreColor(score);

  const scoreHTML = `
    <div class="score-ring">
      <svg viewBox="0 0 120 120" width="120" height="120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="10"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke="${color}" stroke-width="10"
          stroke-dasharray="${(score / 100) * 314} 314"
          stroke-linecap="round" transform="rotate(-90 60 60)"/>
        <text x="60" y="55" text-anchor="middle" font-size="24" font-weight="700" fill="${color}">${score}</text>
        <text x="60" y="74" text-anchor="middle" font-size="11" fill="#6b7280">/ 100</text>
      </svg>
      <p class="score-label" style="color:${color}">${emoji} ${label}</p>
    </div>`;

  const msgHTML = messages
    .map((m) => {
      const cls =
        m.type === 'success'
          ? 'msg-success'
          : m.type === 'warning'
            ? 'msg-warning'
            : 'msg-error';
      return `<div class="msg-card ${cls}">${m.text}</div>`;
    })
    .join('');

  document.getElementById('result-area').innerHTML =
    scoreHTML + `<div class="msg-list">${msgHTML}</div>`;
  document.getElementById('result-section').style.display = 'block';
  document
    .getElementById('result-section')
    .scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updateSwatch(selectId) {
  const sel = document.getElementById(selectId);
  const swatch = document.getElementById(
    selectId === 'top-color' ? 'top-swatch' : 'bottom-swatch',
  );
  if (!swatch || !sel) return;
  const colorMap = {
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    blue: '#3b82f6',
    navy: '#1e3a5f',
    purple: '#a855f7',
    pink: '#ec4899',
    brown: '#92400e',
    black: '#111827',
    white: '#f9fafb',
    grey: '#9ca3af',
    beige: '#d4b896',
  };
  swatch.style.background = colorMap[sel.value] || '#ccc';
  swatch.style.border = sel.value === 'white' ? '1px solid #ccc' : 'none';
}

function initCompatibilityChecker() {
  const form = document.getElementById('compatibility-form');
  if (!form) return;

  ['top-color', 'bottom-color'].forEach((id) => {
    const sel = document.getElementById(id);
    if (sel) {
      sel.addEventListener('change', () => updateSwatch(id));
      updateSwatch(id);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const topColor = document.getElementById('top-color').value;
    const bottomColor = document.getElementById('bottom-color').value;
    const topItem = document.getElementById('top-item').value.trim();
    const bottomItem = document.getElementById('bottom-item').value.trim();
    const occasion = document.getElementById('occasion').value;
    if (!topItem || !bottomItem) {
      console.log(
        'Toast: ' + 'Please describe both your top and bottom clothing items.',
      );
      return;
    }
    renderResult(
      checkOutfitCompatibility({
        topColor,
        bottomColor,
        topItem,
        bottomItem,
        occasion,
      }),
    );
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    form.reset();
    ['top-color', 'bottom-color'].forEach((id) => updateSwatch(id));
    document.getElementById('result-section').style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', initCompatibilityChecker);
