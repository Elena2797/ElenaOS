import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Vite no lee PORT por su cuenta: elige otro puerto en silencio si el suyo
  // está ocupado, y entonces quien lanzó el servidor abre el puerto equivocado.
  // Honrarlo permite levantar varias instancias (p. ej. dos sesiones de trabajo
  // a la vez) sin que ninguna se quede mirando una página en blanco.
  server: { port: Number(process.env.PORT) || 5173 },
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
