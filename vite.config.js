import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Life OS',
        short_name: 'Life OS',
        theme_color: '#1a1a1a',
        background_color: '#f5f5f2',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: []
      }
    })
  ],
  build: {
    outDir: 'dist'
  }
});
