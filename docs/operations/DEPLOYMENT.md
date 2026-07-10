Estado: implementado
Última verificación: 2026-07-10
Verificado en: flujo real usado en esta sesión de desarrollo (múltiples deploys verificados end-to-end)
Fuente de verdad de datos: ninguna

# operations/DEPLOYMENT.md — Cómo desplegar cada repo, de cero

## isabel-api → Railway
1. `git push origin main` en `isabel-api`.
2. Railway auto-despliega. Verificar con `curl https://isabel-api-production.up.railway.app/health`.
3. Para verificar que un cambio concreto ya está en producción (Railway no da confirmación inmediata en el push): esperar ~1-2 minutos y probar el endpoint afectado directamente, o comparar un comportamiento observable (ej. un mensaje de error que cambió).

## life-os-app → Vercel
1. `git push origin main` en `life-os-app`.
2. Vercel auto-despliega (build con Vite).
3. Verificar en el navegador — cerrar y reabrir la PWA para forzar recarga del bundle nuevo (el Service Worker de `vite-plugin-pwa` puede servir una versión cacheada).

## Cambios de esquema (Supabase)
Nunca se despliegan automáticamente — se ejecutan a mano en el SQL editor de Supabase. Ver [operations/SUPABASE.md](SUPABASE.md) para el orden de migraciones. Regla: **aditivo siempre** (`ADD COLUMN IF NOT EXISTS`), nunca destructivo sobre datos reales sin aprobación explícita — ver [DECISIONS.md](../DECISIONS.md) D6.

## Protocolo de verificación tras cualquier deploy que toque datos existentes
1. Capturar estado "antes": contar registros afectados, exportar el documento relevante (PDF/Excel) si aplica.
2. Desplegar.
3. Capturar estado "después" con el mismo método.
4. Comparar campo a campo (no solo conteos) — usado en HOTO durante todo su desarrollo.
5. Si algo difiere sin que fuera intencional: revertir el commit y no continuar hasta entender la causa.

## lifeos-agent
Tiene `Procfile` compatible con Heroku/Railway (`worker: python agent.py`) pero el flujo de deploy real no fue verificado en esta auditoría.
