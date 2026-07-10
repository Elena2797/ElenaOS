Estado: implementado
Última verificación: 2026-07-10
Verificado en: life-os-app/vercel.json, life-os-app/api/
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

## Deploy
Auto-deploy on push a `main` del repo `ElenaOS`/`life-os-app`.

## Comando de build local
```bash
npm run build   # genera dist/
npm run preview # sirve dist/ localmente
```
