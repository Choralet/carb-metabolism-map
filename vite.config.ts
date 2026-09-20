import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // relative base so the same build works at a domain root and under a GitHub Pages /<repo>/ path
  base: './',
  plugins: [
    react(),
    nodePolyfills({ include: ['buffer', 'process', 'util', 'stream'] }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Carbohydrate metabolism map',
        short_name: 'Carb Map',
        description: 'Interactive carbohydrate metabolism pathway map with enzyme filters and quiz mode',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f8fafc',
        theme_color: '#0f766e',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache only the app shell + structure drawings (~0.4 MB gzip). Ketcher and its Indigo engine (~29 MB) are the
        // lazily loaded "Edit in Ketcher" feature: precaching them would make every first visit download ~30 MB
        // in the background, so they are cached at runtime the first time someone actually opens the editor.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        globIgnores: ['**/KetcherModal-*', '**/index.modern-*', '**/lodash-*'],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        runtimeCaching: [
          {
            // anything under /assets/ that was not precached (i.e. the Ketcher chunks)
            urlPattern: ({ url }) => url.pathname.includes('/assets/'),
            handler: 'CacheFirst',
            options: { cacheName: 'lazy-assets', expiration: { maxEntries: 30 } },
          },
        ],
      },
    }),
  ],
  define: { 'process.env': {} },
  worker: { format: 'es' },
});
