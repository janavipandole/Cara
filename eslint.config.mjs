import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

const sharedAppGlobals = {
  showToast: 'readonly',
  loadNavbar: 'readonly',
  loadCart: 'readonly',
  saveCart: 'readonly',
  cart: 'writable',
  cartList: 'readonly',
  subtotalEl: 'readonly',
  updateCartTotal: 'readonly',
  addToCart: 'readonly',
  removeFromCart: 'readonly',
  buyNow: 'readonly',
  applyCoupon: 'readonly',
  handleEmptyCartView: 'readonly',
  products: 'writable',
  renderProducts: 'readonly',
  renderSearchSuggestions: 'readonly',
  fetchWithTimeout: 'readonly',
  formatPrice: 'readonly',
  getWishlist: 'readonly',
  isInWishlist: 'readonly',
  toggleWishlistItem: 'readonly',
  updateWishlistButtonState: 'readonly',
  syncWishlistButtons: 'readonly',
  hasPriceDropped: 'readonly',
  getPriceDropAmount: 'readonly',
  closeQuiz: 'readonly',
  CaraToast: 'readonly',
  CaraErrorBoundary: 'readonly',
  Pose: 'readonly',
};

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'Cara-main/**',
      '**/*.min.js',
    ],
  },
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...sharedAppGlobals,
      },
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
  configPrettier,
];
