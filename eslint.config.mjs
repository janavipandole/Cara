import js from '@eslint/js';
import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        loadCart: 'writable',
        applyCoupon: 'writable',
        closeQuiz: 'writable',
        showToast: 'writable',
        buyNow: 'writable',
        addToCart: 'writable',
        Pose: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  },
];
