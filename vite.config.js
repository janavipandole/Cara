import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Find all HTML files in the project root to include in the build
const htmlFiles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.html'))
  .reduce((entries, file) => {
    const name = file.replace('.html', '');
    entries[name] = resolve(__dirname, file);
    return entries;
  }, {});

export default defineConfig({
  build: {
    rollupOptions: {
      input: htmlFiles
    },
    // Minify large assets for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Set chunk size warning limit higher if necessary
    chunkSizeWarningLimit: 1000
  }
});
