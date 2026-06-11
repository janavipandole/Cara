import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'Cara-main/**',
      '.venv/**',
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
        showToast: 'writable',
        addToCart: 'writable',
        buyNow: 'writable',
        updateCartCount: 'writable',
        loadCart: 'writable',
        applyCoupon: 'writable',
        Pose: 'readonly',
        CaraToast: 'writable',
        ThemeTransitionConfig: 'writable',
        SkeletonLoader: 'writable',
        ProductImageZoom: 'writable',
        CSRFProtection: 'writable',
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
