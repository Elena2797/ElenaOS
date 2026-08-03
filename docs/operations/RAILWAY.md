Estado: implementado
Última verificación: 2026-08-03
Verificado en: URL de producción usada en life-os-app/src/main.js, package.json de isabel-api, dashboard de Railway (Settings → Scale/Source) durante el incidente del 2026-08-03
Fuente de verdad de datos: ninguna

# operations/RAILWAY.md — isabel-api en Railway

## URL de producción
`https://isabel-api-production.up.railway.app`

## Región
`us-west2` (US West, California) desde el 2026-08-03. **Antes estaba en `sfo`, una región inválida que bloqueaba silenciosamente todos los deploys nuevos** sin ningún error visible salvo un aviso puntual en Settings → Scale ("Invalid region... is blocking deployments"). Ver `KNOWN_PROBLEMS.md`. Si un deploy futuro parece no completarse nunca, comprobar esto primero.

## Deploy
Auto-deploy on push a `main` del repo `isabel-api` (comportamiento estándar de Railway conectado a GitHub). **No siempre fiable**: el 2026-08-03 el webhook quedó obsoleto y ni `Redeploy` ni `Latest deploy` ni re-seleccionar la rama conseguían que Railway recogiera un commit nuevo — solo `Settings → Source → Disconnect` + `Connect Repo` completo (re-seleccionando `Elena2797/isabel-api` + rama `main`) forzó una resincronización real. Ver `KNOWN_PROBLEMS.md` y `DECISIONS.md` D9.

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
