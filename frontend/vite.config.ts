// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';

const assetsDir = fileURLToPath(new URL('../internal/console/assets', import.meta.url));

// Vite empties the Go embed directory on every build, so the placeholder that
// keeps `go build` working on a fresh checkout has to be restored afterwards.
const keepAssets: Plugin = {
  name: 'ocr-console-keep-assets',
  closeBundle() {
    mkdirSync(assetsDir, { recursive: true });
    writeFileSync(
      new URL('../internal/console/assets/keep.txt', import.meta.url),
      'Rebuilt by `cd frontend && npm install && npm run build`. The console embeds this\ndirectory into the Go binary.\n',
    );
  },
};

export default defineConfig({
  plugins: [vue(), keepAssets],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5484',
        changeOrigin: false,
      },
    },
  },
  build: {
    outDir: '../internal/console/assets',
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 1600,
  },
});
