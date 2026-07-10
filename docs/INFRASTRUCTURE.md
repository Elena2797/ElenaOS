Estado: implementado
Última verificación: 2026-07-10
Verificado en: package.json de ambos repos, vercel.json, .env.example, git remote -v
Fuente de verdad de datos: ninguna

# INFRASTRUCTURE.md — Repos, entornos, comandos

## Repositorios

| Repo | Ruta local | Remoto | Rol |
|---|---|---|---|
| `life-os-app` | `life-os-app/` | `github.com/Elena2797/ElenaOS` | Frontend — la app que usa Estefanía |
| `isabel-api` | `isabel-api/` | `github.com/elena2797/isabel-api` | Backend — parser de inventario, exportador HOTO/Excel |
| `lifeos-agent` | `lifeos-agent/` | no consultado en la auditoría | Bot de Telegram, independiente — ver [core/ISABEL_CHANNELS.md](core/ISABEL_CHANNELS.md) |

La carpeta raíz `LIFE OS/` (que contiene a los tres) **no es un repositorio git**. Los documentos de visión/producto (`VISION.md`, `MODEL.md`, `ISABEL_CORE.md`, etc.) viven ahí sin control de versiones — cualquier edición a esos archivos no queda respaldada por git.

## Despliegue

| Repo | Plataforma | Config |
|---|---|---|
| `life-os-app` | Vercel | `vercel.json`: `buildCommand: vite build`, `outputDirectory: dist` |
| `isabel-api` | Railway | sin archivo de config explícito en el repo (configuración vive en el dashboard de Railway) |
| `lifeos-agent` | Desconocido/no verificado | tiene `Procfile` (`worker: python agent.py`), formato típico de Heroku/Railway, pero no se confirmó si hay un deploy activo |

URL de producción de isabel-api: `https://isabel-api-production.up.railway.app` (usada como fallback en `life-os-app/src/main.js`).

## Variables de entorno

**`life-os-app`** (`.env.local`, no versionado; `.env.example` sí):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
`.env.example` está **incompleto**: no incluye `VITE_ISABEL_API_URL` ni `VITE_ISABEL_KEY`, que sí se usan en `main.js` con fallback a producción. Deuda técnica menor — ver [KNOWN_PROBLEMS.md](KNOWN_PROBLEMS.md).

**`isabel-api`** (`.env`, no versionado):
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
PORT=
ANTHROPIC_API_KEY=
```
No hay `.env.example` en este repo.

**`lifeos-agent`** (`.env.example`):
```
TELEGRAM_TOKEN=
AUTHORIZED_TELEGRAM_ID=
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
GITHUB_TOKEN=
GITHUB_REPO=
```

## Dependencias clave

**`isabel-api`**: express, @supabase/supabase-js, @anthropic-ai/sdk, @modelcontextprotocol/sdk, exceljs, pdf-lib, cors, dotenv, zod.

**`life-os-app`**: vite + vite-plugin-pwa (dev), @supabase/supabase-js, xlsx.

**`lifeos-agent`**: python-telegram-bot, anthropic, supabase, requests.

## Comandos de arranque local

```bash
# isabel-api
cd isabel-api && npm install && npm run dev     # node --watch, puerto según .env (default histórico 3002)

# life-os-app
cd life-os-app && npm install && npm run dev    # vite, http://localhost:5173

# lifeos-agent
cd lifeos-agent && pip install -r requirements.txt && python agent.py
```

## Servicios externos usados

- **Supabase** (`cllubptdwydifomlnxds`): base de datos + Storage (buckets `inventory-templates`, `hoto-templates`).
- **Anthropic API**: usada por `isabel-api` (parser de intención con Haiku), por `life-os-app/api/chat.js` (no conectado, ver ISABEL_CHANNELS.md), y por `lifeos-agent`.
- **Railway**: hosting de `isabel-api`.
- **Vercel**: hosting de `life-os-app`, incluye funciones serverless en `life-os-app/api/` (`chat.js`, `gmail-auth.js`, `gmail-callback.js`).
- **Google OAuth (Gmail)**: credenciales configurables (`GOOGLE_CLIENT_ID`) pero sin ningún consumidor en el frontend — código sin conectar.

## Dependencias locales que todavía existen
- El chat conversacional real de `life-os-app` depende de que Estefanía ejecute `Arrancar Isabel.bat` en su propio ordenador (bridge local, ver ISABEL_CHANNELS.md) — no es un servicio en la nube.
