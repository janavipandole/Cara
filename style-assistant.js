/**
 * Cara Style Assistant — Lightweight conversational recommendation engine
 * Rule-based keyword/intent mapping → style tags → filtered product list
 */

/* ─── 1. Style Knowledge Base ─────────────────────────────────────── */
const STYLE_KB = {
  street: {
    label: 'Streetwear',
    emoji: '🧢',
    categories: ['street'],
    styles: ['casual', 'utility', 'minimal'],
    keywords: [
      'street', 'streetwear', 'urban', 'oversized', 'hype', 'hypebeast',
      'hoodie', 'sneaker', 'cargo', 'baggy', 'skate', 'skater', 'grunge',
      'bomber', 'jogger', 'sweatpants', 'graphic', 'tee', 'drip', 'fit',
      'nike', 'adidas', 'puma', 'supreme', 'off-white',
    ],
    desc: 'Bold, expressive streetwear with relaxed silhouettes',
    tags: ['Cargo Pants', 'Hoodies', 'Graphic Tees', 'Bomber Jackets', 'Joggers'],
  },
  minimal: {
    label: 'Minimalist',
    emoji: '🤍',
    categories: ['minimal'],
    styles: ['minimal', 'casual'],
    keywords: [
      'minimal', 'minimalist', 'clean', 'simple', 'neutral', 'monochrome',
      'basic', 'muted', 'beige', 'white', 'nude', 'effortless', 'quiet luxury',
      'tonal', 'understated', 'capsule', 'wardrobe', 'classic', 'timeless',
      'uniqlo', 'cos', 'arket', 'muji',
    ],
    desc: 'Clean lines, neutral tones, effortless style',
    tags: ['White Tees', 'Neutral Trousers', 'Crewneck Sweaters', 'Chinos', 'Overshirts'],
  },
  formal: {
    label: 'Formal / Office',
    emoji: '👔',
    categories: ['formal'],
    styles: ['formal'],
    keywords: [
      'formal', 'office', 'work', 'business', 'professional', 'smart',
      'blazer', 'suit', 'trouser', 'shirt', 'tie', 'corporate', 'meeting',
      'interview', 'dress code', 'polished', 'sophisticated', 'executive',
      'ralph lauren', 'tommy hilfiger', 'calvin klein', 'zara office',
    ],
    desc: 'Sharp, sophisticated looks for the workplace',
    tags: ['Blazers', 'Dress Shirts', 'Chino Trousers', 'Polo Shirts', 'Smart Casual'],
  },
  floral: {
    label: 'Floral & Prints',
    emoji: '🌸',
    categories: ['street', 'minimal'],
    styles: ['floral'],
    keywords: [
      'floral', 'flower', 'print', 'pattern', 'botanical', 'tropical',
      'bloom', 'blossom', 'hibiscus', 'rose', 'sakura', 'garden', 'feminine',
      'summer', 'vacation', 'resort', 'beach', 'holiday',
    ],
    desc: 'Vibrant floral and botanical prints',
    tags: ['Floral Shirts', 'Tropical Prints', 'Garden Dresses', 'Blossom Blouses'],
  },
  utility: {
    label: 'Utility / Tactical',
    emoji: '🪖',
    categories: ['street', 'minimal'],
    styles: ['utility'],
    keywords: [
      'utility', 'tactical', 'cargo', 'military', 'workwear', 'functional',
      'pocket', 'durable', 'outdoor', 'safari', 'khaki', 'olive', 'earth tone',
      'techwear', 'gorpcore', 'camp',
    ],
    desc: 'Functional, durable pieces with an urban edge',
    tags: ['Cargo Pants', 'Utility Vests', 'Safari Shirts', 'Tactical Jackets'],
  },
  casual: {
    label: 'Everyday Casual',
    emoji: '👕',
    categories: ['minimal', 'street'],
    styles: ['casual'],
    keywords: [
      'casual', 'everyday', 'relaxed', 'comfortable', 'weekend', 'laid back',
      'easy', 'jeans', 'denim', 'cotton', 'lounge', 'chill', 'daily',
      'easy wear', 'basics', 'versatile',
    ],
    desc: 'Comfortable everyday pieces that work for any occasion',
    tags: ['Denim Jeans', 'Cotton Tees', 'Sweatshirts', 'Casual Shorts', 'Chinos'],
  },
};

/* ─── 2. NLP Engine ─────────────────────────────────────────────────── */

// All style keywords flattened — used to strip style words before name search
const _ALL_STYLE_KEYWORDS = (() => {
  const set = new Set();
  for (const config of Object.values(STYLE_KB)) {
    config.keywords.forEach(kw => set.add(kw.toLowerCase()));
  }
  // Also strip common filler phrases
  ['i like', 'i want', 'i prefer', 'show me', 'something', 'with', 'some',
   'looking for', 'find me', 'can you', 'please', 'give me', 'wear',
   'outfit', 'outfits', 'clothes', 'clothing', 'style', 'fashion', 'vibe',
   'feel', 'aesthetic', 'look', 'looks', 'pieces', 'item', 'items'].forEach(w => set.add(w));
  return set;
})();

/**
 * Strips style/filler words from the user query to extract potential
 * product name or brand fragments for hard name matching.
 */
function extractNameQuery(text) {
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !_ALL_STYLE_KEYWORDS.has(w));
  return words.join(' ').trim();
}

function parseUserIntent(text) {
  const normalized = text.toLowerCase().trim();

  // Score each style by keyword matches
  const scores = {};
  for (const [styleKey, config] of Object.entries(STYLE_KB)) {
    scores[styleKey] = 0;
    for (const kw of config.keywords) {
      if (normalized.includes(kw)) {
        // Longer keyword = stronger signal
        scores[styleKey] += kw.length > 5 ? 2 : 1;
      }
    }
  }

  // Return styles sorted by score descending, keep only those > 0
  const ranked = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([key]) => key);

  return ranked;
}

/**
 * Counts how many products are currently rendered in the grid.
 */
function _countVisibleProducts() {
  const container = document.getElementById('shop-container');
  return container ? container.querySelectorAll('.pro').length : 0;
}

/**
 * Apply filters to the product grid.
 * Strategy:
 *   1. Always push the raw user query into searchInput for hard name/brand matching.
 *   2. Also set category + style dropdowns for soft style matching.
 *   3. If the name-only query returns results, prefer that (reset category to 'all'
 *      so we don't over-restrict). If it returns 0, fall back to style-only.
 *
 * Returns an object: { config, matchType: 'name' | 'style' | 'both' }
 */
function applyStyleFilter(detectedStyles, rawQuery) {
  if (typeof filterProducts !== 'function') return { config: null, matchType: 'none' };

  const topStyle = detectedStyles.length > 0 ? detectedStyles[0] : null;
  const config = topStyle ? STYLE_KB[topStyle] : null;

  const categorySelect = document.getElementById('categoryFilter');
  const styleSelect    = document.getElementById('style-filter');
  const brandSelect    = document.getElementById('brand-filter');
  const colorSelect    = document.getElementById('color-filter');
  const searchInput    = document.getElementById('searchInput');

  // Reset brand + color always
  if (brandSelect) brandSelect.value = 'all';
  if (colorSelect) colorSelect.value = 'all';

  let nameQuery = '';
  const rawLower = rawQuery ? rawQuery.toLowerCase().trim() : '';
  let isHardMatch = false;

  if (rawLower && typeof products !== 'undefined') {
    if (products.some(p => p.name.toLowerCase() === rawLower)) {
      isHardMatch = true;
    } else {
      const matchesSearch = products.some(p => 
        p.name.toLowerCase().includes(rawLower) || p.brand.toLowerCase() === rawLower
      );
      
      if (matchesSearch) {
        if (!_ALL_STYLE_KEYWORDS.has(rawLower)) {
          isHardMatch = true;
        }
      }
    }
  }

  if (isHardMatch) {
    nameQuery = rawLower;
  } else {
    nameQuery = rawQuery ? extractNameQuery(rawQuery) : '';
  }

  // ── Pass 1: Try name-first matching ──────────────────────────────────
  if (nameQuery) {
    if (searchInput)    searchInput.value    = nameQuery;
    if (categorySelect) categorySelect.value = 'all';
    if (styleSelect)    styleSelect.value    = 'all';
    filterProducts();

    const nameHits = _countVisibleProducts();

    if (nameHits > 0) {
      // Good name match — if we also have a style, narrow further by keeping
      // the search term but adding the category filter on top
      if (config) {
        if (categorySelect) categorySelect.value = config.categories[0] || 'all';
        if (styleSelect)    styleSelect.value    = config.styles[0]    || 'all';
        filterProducts();
        const combinedHits = _countVisibleProducts();

        // Only keep the combined filter if it still returns results
        if (combinedHits === 0) {
          // Combined was too restrictive — revert to name-only
          if (categorySelect) categorySelect.value = 'all';
          if (styleSelect)    styleSelect.value    = 'all';
          filterProducts();
          _scrollToProducts();
          return { config, matchType: 'name' };
        }
        _scrollToProducts();
        return { config, matchType: 'both' };
      }
      _scrollToProducts();
      return { config, matchType: 'name' };
    }
  }

  // ── Pass 2: Style-only fallback ───────────────────────────────────────
  if (searchInput)    searchInput.value    = '';
  if (config) {
    if (categorySelect) categorySelect.value = config.categories[0] || 'all';
    if (styleSelect)    styleSelect.value    = config.styles[0]    || 'all';
  } else {
    if (categorySelect) categorySelect.value = 'all';
    if (styleSelect)    styleSelect.value    = 'all';
  }
  filterProducts();
  _scrollToProducts();
  return { config, matchType: config ? 'style' : 'none' };
}

function _scrollToProducts() {
  const productSection = document.getElementById('product1');
  if (productSection) {
    setTimeout(() => productSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  }
}

/* ─── 3. Chat UI Engine ──────────────────────────────────────────────── */
const BOT_NAME = 'Cara';
const WELCOME_MSG = "Hi! I'm Cara, your personal style assistant ✨ Tell me your vibe — like *\"oversized streetwear\"* or *\"minimal neutrals\"* — or search by item name like *\"astronaut tee\"* or *\"floral shirt\"*.";

const QUICK_PROMPTS = [
  { label: '🧢 Streetwear', text: 'I like oversized streetwear' },
  { label: '🤍 Minimal', text: 'I prefer minimal neutral outfits' },
  { label: '👔 Office Wear', text: 'I want formal office wear' },
  { label: '🌸 Floral Prints', text: 'Something with floral prints' },
  { label: '🪖 Utility Look', text: 'Show me cargo and utility style' },
  { label: '👕 Casual Daily', text: 'Just casual everyday clothes' },
];

let chatHistory = [];
let assistantOpen = false;
let lastAppliedStyle = null;

function renderMarkdown(text) {
  // Bold: *text* → <strong>text</strong>
  return text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
}

function appendMessage(role, text, extra = {}) {
  chatHistory.push({ role, text });
  const feed = document.getElementById('sa-feed');
  if (!feed) return;

  const wrap = document.createElement('div');
  wrap.className = `sa-msg sa-msg--${role}`;

  if (role === 'bot') {
    const avatar = document.createElement('div');
    avatar.className = 'sa-avatar';
    avatar.textContent = '✦';
    wrap.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'sa-bubble';
  bubble.innerHTML = renderMarkdown(text);
  wrap.appendChild(bubble);

  // Optional: style tag chips
  if (extra.tags && extra.tags.length > 0) {
    const chips = document.createElement('div');
    chips.className = 'sa-tags';
    extra.tags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'sa-tag';
      chip.textContent = tag;
      chips.appendChild(chip);
    });
    wrap.appendChild(chips);
  }

  // Optional: CTA button
  if (extra.cta) {
    const btn = document.createElement('button');
    btn.className = 'sa-cta-btn';
    btn.textContent = extra.cta.label;
    btn.addEventListener('click', extra.cta.onClick);
    wrap.appendChild(btn);
  }

  feed.appendChild(wrap);
  feed.scrollTop = feed.scrollHeight;
}

function showTypingIndicator() {
  const feed = document.getElementById('sa-feed');
  if (!feed) return;
  const typing = document.createElement('div');
  typing.className = 'sa-msg sa-msg--bot sa-typing-row';
  typing.id = 'sa-typing';
  typing.innerHTML = `
    <div class="sa-avatar">✦</div>
    <div class="sa-bubble sa-typing">
      <span></span><span></span><span></span>
    </div>
  `;
  feed.appendChild(typing);
  feed.scrollTop = feed.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('sa-typing');
  if (el) el.remove();
}

function processUserMessage(userText) {
  const trimmed = userText.trim();
  if (!trimmed) return;

  // Append user message
  appendMessage('user', trimmed);

  // Clear input
  const input = document.getElementById('sa-input');
  if (input) input.value = '';

  // Show typing
  showTypingIndicator();

  // Simulate lightweight "thinking" delay
  setTimeout(() => {
    removeTypingIndicator();

    const detectedStyles = parseUserIntent(trimmed);
    const { config, matchType } = applyStyleFilter(detectedStyles, trimmed);

    // ── No match at all ──────────────────────────────────────────────────
    if (matchType === 'none' || (!config && matchType !== 'name')) {
      appendMessage('bot',
        "Hmm, I didn't quite catch that 🤔 Try describing your vibe — like *\"relaxed and minimal\"* or *\"bold street style\"*! You can also search for a specific item like *\"astronaut tee\"* or *\"floral shirt\"*.",
      );
      renderQuickPrompts();
      return;
    }

    lastAppliedStyle = config ? detectedStyles[0] : null;

    // ── Name-only match (no style detected) ─────────────────────────────
    if (matchType === 'name') {
      const nameQuery = extractNameQuery(trimmed);
      appendMessage('bot',
        `Found items matching *"${nameQuery}"* 🔍 I've filtered the shop to show you the results!`,
        {
          cta: {
            label: '👀 View Results',
            onClick: () => {
              const section = document.getElementById('product1');
              if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
              closeAssistant();
            },
          },
        }
      );
      setTimeout(() => {
        appendMessage('bot',
          'Want to narrow it down further? Tell me a style, color, or brand — like *"minimal white shirt"* or *"Nike cargo"*.'
        );
      }, 800);
      return;
    }

    // ── Style match or combined name+style match ─────────────────────────
    const intro = [
      `Love it! *${config.label}* vibes ✨`,
      `Great choice — *${config.label}* it is! 🎯`,
      `I'm feeling the *${config.label}* energy! ✦`,
      `Perfect — curating *${config.label}* looks for you 🛍️`,
    ][Math.floor(Math.random() * 4)];

    const nameQuery = extractNameQuery(trimmed);
    const bodyText = matchType === 'both'
      ? `${intro} Matched *"${nameQuery}"* in *${config.label}* style — here's what I found:`
      : `${intro} ${config.desc}. I've filtered the shop to match — here's what to expect:`;

    appendMessage('bot', bodyText, {
      tags: config.tags,
      cta: {
        label: '👀 View Filtered Products',
        onClick: () => {
          const section = document.getElementById('product1');
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          closeAssistant();
        },
      },
    });

    // Follow-up prompt after short delay
    setTimeout(() => {
      appendMessage('bot',
        'Want to refine further? Try telling me a color, brand, or occasion — like *"navy blue minimal"* or *"Nike street style"*.'
      );
    }, 800);

  }, 700 + Math.random() * 400);
}


function renderQuickPrompts() {
  const feed = document.getElementById('sa-feed');
  if (!feed) return;

  const row = document.createElement('div');
  row.className = 'sa-quick-prompts';
  QUICK_PROMPTS.forEach(qp => {
    const btn = document.createElement('button');
    btn.className = 'sa-quick-btn';
    btn.textContent = qp.label;
    btn.addEventListener('click', () => {
      row.remove();
      processUserMessage(qp.text);
    });
    row.appendChild(btn);
  });
  feed.appendChild(row);
  feed.scrollTop = feed.scrollHeight;
}

function openAssistant() {
  const panel = document.getElementById('sa-panel');
  const fab = document.getElementById('sa-fab');
  if (!panel) return;
  assistantOpen = true;
  panel.classList.add('sa-panel--open');
  if (fab) fab.classList.add('sa-fab--open');
  const input = document.getElementById('sa-input');
  if (input) setTimeout(() => input.focus(), 300);
}

function closeAssistant() {
  const panel = document.getElementById('sa-panel');
  const fab = document.getElementById('sa-fab');
  if (!panel) return;
  assistantOpen = false;
  panel.classList.remove('sa-panel--open');
  if (fab) fab.classList.remove('sa-fab--open');
}

function toggleAssistant() {
  assistantOpen ? closeAssistant() : openAssistant();
}

function resetFilters() {
  const categorySelect = document.getElementById('categoryFilter');
  const styleSelect = document.getElementById('style-filter');
  const brandSelect = document.getElementById('brand-filter');
  const colorSelect = document.getElementById('color-filter');
  const searchInput = document.getElementById('searchInput');
  if (categorySelect) categorySelect.value = 'all';
  if (styleSelect) styleSelect.value = 'all';
  if (brandSelect) brandSelect.value = 'all';
  if (colorSelect) colorSelect.value = 'all';
  if (searchInput) searchInput.value = '';
  if (typeof filterProducts === 'function') filterProducts();
  lastAppliedStyle = null;
}

/* ─── 4. DOM Injection ───────────────────────────────────────────────── */
function injectAssistantUI() {
  // Only on shop page
  if (!document.getElementById('shop-container') && !document.getElementById('product1')) return;

  // ── FAB button ──
  const fab = document.createElement('button');
  fab.id = 'sa-fab';
  fab.className = 'sa-fab';
  fab.setAttribute('aria-label', 'Open Style Assistant');
  fab.setAttribute('title', 'Style Assistant');
  fab.innerHTML = `
    <span class="sa-fab-icon sa-fab-icon--closed">✦</span>
    <span class="sa-fab-label">Style Assistant</span>
    <span class="sa-fab-icon sa-fab-icon--open" aria-hidden="true">✕</span>
  `;
  fab.addEventListener('click', toggleAssistant);
  document.body.appendChild(fab);

  // ── Chat panel ──
  const panel = document.createElement('div');
  panel.id = 'sa-panel';
  panel.className = 'sa-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Cara Style Assistant');
  panel.innerHTML = `
    <div class="sa-header">
      <div class="sa-header-left">
        <div class="sa-header-avatar">✦</div>
        <div>
          <div class="sa-header-name">Cara Style Assistant</div>
          <div class="sa-header-status"><span class="sa-status-dot"></span> Online</div>
        </div>
      </div>
      <div class="sa-header-actions">
        <button id="sa-reset-btn" class="sa-icon-btn" title="Reset filters" aria-label="Reset all filters">
          <i class="ri-refresh-line"></i>
        </button>
        <button id="sa-close-btn" class="sa-icon-btn" aria-label="Close assistant">
          <i class="ri-close-line"></i>
        </button>
      </div>
    </div>
    <div id="sa-feed" class="sa-feed" aria-live="polite" aria-label="Conversation"></div>
    <div class="sa-input-row">
      <input
        id="sa-input"
        class="sa-input"
        type="text"
        placeholder="Style, item name, or brand..."
        autocomplete="off"
        maxlength="200"
        aria-label="Type your style preference or item name"
      />
      <button id="sa-send-btn" class="sa-send-btn" aria-label="Send message">
        <i class="ri-send-plane-fill"></i>
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  // ── Wire events ──
  document.getElementById('sa-close-btn').addEventListener('click', closeAssistant);
  document.getElementById('sa-reset-btn').addEventListener('click', () => {
    resetFilters();
    appendMessage('bot', 'Filters reset! All products are now visible. What style would you like to explore? ✨');
  });

  const sendBtn = document.getElementById('sa-send-btn');
  const inputEl = document.getElementById('sa-input');

  sendBtn.addEventListener('click', () => processUserMessage(inputEl.value));
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processUserMessage(inputEl.value);
    }
  });

  // ── Initial welcome message + quick prompts ──
  setTimeout(() => {
    appendMessage('bot', WELCOME_MSG);
    setTimeout(renderQuickPrompts, 400);
  }, 200);
}

/* ─── 5. Bootstrap ───────────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectAssistantUI);
} else {
  injectAssistantUI();
}
