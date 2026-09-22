Última actualización: 2026-09-22, 17:40 Madrid — SECURITY #2 resuelto (D68); turno de noche activo

# Próxima sesión

## 1. Qué se terminó en esta sesión

- **`npm run fallos`:** ninguno abierto.
- **Turno de noche y buscador activados** (ella, 14:48Z): cron `turno-noche-0400`, parte de las 08:30 con `night_shift_report`, `mcp reload` (48 tools). El `dry_run` del script falló por las comillas de PowerShell; el hecho desde Git Bash salió bien (`operations/TURNO_NOCHE.md` §3).
- **Coach 17:00:** primer disparo bueno (15:00:04Z, `delivered`).
- **SECURITY #2 resuelto (D68):** `/v1` entra con token de app, llave privada, `API_KEY` o ticket de PDF; el bundle no lleva llave. `isabel-api` `2fcdb0b`, `life-os-app` `6c726b3`, `isabel-gateway` `1c38740`. Ella rotó `API_KEY`: `isabel-api-2026` da 401 en `/v1`, MCP y OAuth; los ticks usan `ISABEL_MCP_KEY`; la app carga en su móvil.

## 2. Qué quedó pendiente

- **Probar un PDF en el móvil** (HOTO o Laundry → visor): usa el ticket nuevo y nadie lo ha abierto aún en producción.
- Limpieza sin prisa: borrar `ISABEL_API_KEY` del Gateway y `VITE_ISABEL_KEY` de Vercel (ya no se usan); preguntarle si retira la página vieja de inventario `isabel-api/public/` (ya no funciona).
- **Primera noche real** (23 de septiembre, 04:00): la fila `isabel:turno_noche` de hoy, las `isabel:taller` y el parte de las 08:30.
- **O5 canary sin uso real:** el ledger (`lifeos:knowledge`) solo tiene las frases de prueba olvidadas.
- Clave de Anthropic caduca el 2026-10-20. Gasto de OpenRouter fuera del control de presupuesto. memory-core de OpenClaw pide clave de OpenAI.
- Visto al pasar: cada turno de Isabel en Telegram lleva unos 128 000 tokens de entrada (`eventos` `ai:conversation:gateway:main`, 14:30Z). Con DeepSeek es barato, pero conviene mirar qué infla el contexto.

## 3. Qué hacer inmediatamente después

1. `npm run fallos` en `isabel-api` (con su `.env`, desde un worktree limpio de `origin/main`).
2. Revisar la primera noche con ella: si lo que dejó es útil o relleno, y si quiere un turno de día.
3. Revisar con ella lo que Isabel guarde de verdad en O5 (`operations/O5_CANARY.md`).
4. Reconectar Instagram o Google ahora pide la `API_KEY` nueva (está en Railway; `?api_key=` en `/oauth/*/start`) o la llave privada.

## 4. Qué no debe romperse

- `/v1` nunca vuelve a aceptar una llave que esté en el bundle. La app entra solo con su token de app; los PDF, con ticket (`src/core/access.js`).
- `/v1/app` va montado **antes** de `requireAccess` (conectar el móvil no pide llave). Límite de códigos: 3 cada 10 minutos y 10 al día.
- Que un tick del Gateway diga `ok` no prueba nada: el `curl` descarta la respuesta. Para ver el HTTP, repetir la llamada con la llave privada por `printf … | railway ssh -- sh -s` desde Git Bash.
- O5 solo por `src/core/knowledgeCanary.js` (guard). `LIVE` no se usa.
- Tabla nueva en `public` → volver a ejecutar `rls_owner_only.sql` (D62).
- Nunca `railway up` en `isabel-api`: push a `main` desde un worktree limpio de `origin/main`.
- No reiniciar el Gateway en :00/:15/:30/:45 ni a la hora de un cron. Para tools nuevas basta `openclaw mcp reload`.
- A Claude el clasificador le bloquea escribir en el Gateway, los secretos de Railway y guardar scripts en `isabel-gateway`: eso lo lanza ella.
- Sin chat dentro de LIFEOS (D55). Inicio solo con lo suyo (D59). El turno de noche nunca toca VistaJet.

## 5. Qué documentos leer

`CURRENT_STATE.md` → `DECISIONS.md` D68 (y D62–D67) → `operations/TURNO_NOCHE.md` → `operations/O5_CANARY.md`.
