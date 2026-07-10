Estado: implementado
Última verificación: 2026-07-10
Verificado en: URL de producción usada en life-os-app/src/main.js, package.json de isabel-api
Fuente de verdad de datos: ninguna

# operations/RAILWAY.md — isabel-api en Railway

## URL de producción
`https://isabel-api-production.up.railway.app`

## Deploy
Auto-deploy on push a `main` del repo `isabel-api` (comportamiento estándar de Railway conectado a GitHub — no se encontró configuración explícita en el repo, vive en el dashboard de Railway).

## Variables de entorno necesarias
Ver [INFRASTRUCTURE.md](../INFRASTRUCTURE.md): `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `PORT`, `ANTHROPIC_API_KEY`, y la API key propia del servicio (`API_KEY`, con fallback hardcodeado — ver SECURITY.md).

## Verificar que está vivo
```bash
curl https://isabel-api-production.up.railway.app/health
# → {"ok":true}
```

## Comando de arranque
`npm start` → `node src/index.js` (definido en `package.json`).

## Qué se despliega aquí
Solo isabel-api. El frontend (`life-os-app`) se despliega en Vercel, no en Railway. Ver [DEPLOYMENT.md](DEPLOYMENT.md) para el flujo completo.
