Estado: implementado
Última verificación: 2026-08-03
Verificado en: life-os-app/vercel.json, life-os-app/api/, Project Settings → Environment Variables durante el incidente del 2026-08-03
Fuente de verdad de datos: ninguna

# operations/VERCEL.md — life-os-app en Vercel

## Configuración
`life-os-app/vercel.json`:
```json
{
  "buildCommand": "node node_modules/vite/bin/vite.js build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

## Funciones serverless (`life-os-app/api/`)
| Función | Estado |
|---|---|
| `chat.js` | código completo, **no usada por el frontend** — ver `core/ISABEL_CHANNELS.md` |
| `gmail-auth.js`, `gmail-callback.js` | código completo, **no conectadas a ninguna UI** |

Estas funciones se despliegan igualmente porque Vercel las detecta por convención de carpeta — están vivas como endpoints (`/api/chat`, `/api/gmail-auth`, `/api/gmail-callback`), solo que nada las invoca desde la app.

## Variables de entorno necesarias
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ISABEL_API_URL`, `VITE_ISABEL_KEY` (las dos últimas ausentes del `.env.example`, ver KNOWN_PROBLEMS.md). Si `api/chat.js` se activara: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY` (nombres distintos a los de `isabel-api`, cuidado al configurar).

**`VITE_ISABEL_API_URL` debe ser `https://isabel-api-production.up.railway.app` — con la `s`.** El 2026-08-03 se encontró horneada en producción como `http://` (sin la `s`), causando que Railway rechazara la conexión con 503 y que `GET /v1/now` (ver `core/ISABEL_NOW.md`) pareciera roto en el navegador aunque el backend funcionaba perfectamente por `curl`. La variable es "Sensitive" en el dashboard de Vercel — no se puede leer su valor actual desde la UI, solo sobrescribir; para confirmar el valor real desplegado, inspeccionar el string horneado en el bundle de producción (`grep` sobre el `.js` servido), no confiar solo en lo que diga el dashboard.

## Deploy
Auto-deploy on push a `main` del repo `ElenaOS`/`life-os-app`.

## Comando de build local
```bash
npm run build   # genera dist/
npm run preview # sirve dist/ localmente
```

## Service worker (PWA) puede enmascarar un deploy correcto
`life-os-app` es una PWA (`vite-plugin-pwa`, `registerSW.js`). Verificado dos veces el 2026-08-03: después de un deploy real y confirmado (bundle nuevo por hash y por contenido), el navegador seguía sirviendo el bundle anterior cacheado por el service worker — indistinguible de "el deploy no llegó". Antes de diagnosticar un fix que "no se nota" en producción, limpiar el service worker (`navigator.serviceWorker.getRegistrations()` → `unregister()`, `caches.keys()` → `caches.delete()`) o, en el dispositivo de la usuaria, cerrar la app por completo y reabrir. Ver `KNOWN_PROBLEMS.md`.
