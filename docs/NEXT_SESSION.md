Última actualización: 2026-09-22, 17:30 Madrid — la app sin API key (D68); turno de noche activo

# Próxima sesión

## 1. Qué se terminó en esta sesión

- **`npm run fallos`:** ninguno abierto.
- **Turno de noche y buscador activados** (ella lanzó `activar-turno-noche.ps1` a las 14:48Z): cron `turno-noche-0400`, parte de las 08:30 con `night_shift_report`, `mcp reload` (48 tools). El `dry_run` de ese script falló por las comillas de PowerShell; el hecho desde Git Bash salió bien (`operations/TURNO_NOCHE.md` §3).
- **Coach 17:00:** primer disparo bueno (15:00:04Z, `delivered`).
- **SECURITY #2 mitigado (D68):** `/v1` entra con token de app, llave privada, `API_KEY` sin valor por defecto o ticket de PDF. `isabel-api` `2fcdb0b` y `life-os-app` `6c726b3` desplegados y verificados en producción; scripts del Gateway en `isabel-gateway` `1c38740`.

## 2. Qué quedó pendiente

- **Rotar `API_KEY` (ella):** `powershell.exe -ExecutionPolicy Bypass -File "C:\Users\USER\AppData\Local\Temp\claude\C--Users-USER-Desktop-LIFE-OS\9fbebcf6-0830-4708-8e5e-73dccf88c064\scratchpad\cerrar-clave-publica.ps1"`. Pasa `reminders-tick-1m` y `proactive-tick-15m` a `ISABEL_MCP_KEY`, comprueba y pone una `API_KEY` aleatoria sin mostrarla. El clasificador bloquea a Claude las dos cosas (escribir en el Gateway y secretos de Railway), y también guardar el script en `isabel-gateway`. Si esa carpeta temporal ya no existe, rehacerlo: los pasos están en D68. Hasta que se haga, `isabel-api-2026` sigue abriendo `/v1`.
- **Que ella confirme en el móvil** que la app carga con su token (Inicio, rachas, recordatorios) y que un PDF de HOTO o Laundry se abre en el visor. Claude solo vio la pantalla del PIN.
- Tras rotar: borrar `ISABEL_API_KEY` del Gateway y `VITE_ISABEL_KEY` de Vercel (ya no se usan); decidir si se retira la página vieja de inventario `isabel-api/public/` (deja de funcionar al rotar).
- **Primera noche real** (23 de septiembre, 04:00): la fila `isabel:turno_noche` de hoy, las `isabel:taller` y el parte de las 08:30.
- **O5 canary sin uso real:** el ledger (`lifeos:knowledge`) solo tiene las frases de prueba olvidadas.
- Clave de Anthropic caduca el 2026-10-20. Gasto de OpenRouter fuera del control de presupuesto. memory-core de OpenClaw pide clave de OpenAI.
- Visto al pasar: cada turno de Isabel en Telegram lleva unos 128 000 tokens de entrada (`eventos` `ai:conversation:gateway:main`, 14:30Z). Con DeepSeek es barato, pero conviene mirar qué infla el contexto.

## 3. Qué hacer inmediatamente después

1. `npm run fallos` en `isabel-api` (con su `.env`, desde un worktree limpio de `origin/main`).
2. Comprobar la rotación: `curl -s -o /dev/null -w '%{http_code}' -H 'x-api-key: isabel-api-2026' https://isabel-api-production.up.railway.app/v1/reminders` debe dar **401**; en `openclaw cron list --json`, los dos ticks deben llevar `ISABEL_MCP_KEY`. Ojo: que un tick diga `ok` no prueba nada, porque el `curl` descarta la respuesta; para ver el código HTTP, repetir la llamada con la llave privada (D68).
3. Revisar la primera noche con ella: si lo que dejó es útil o relleno, y si quiere un turno de día.
4. Revisar con ella lo que Isabel guarde de verdad en O5 (`operations/O5_CANARY.md`).

## 4. Qué no debe romperse

- `/v1` nunca vuelve a aceptar una llave que esté en el bundle. La app entra solo con su token de app; los PDF, con ticket (`src/core/access.js`).
- `/v1/app` va montado **antes** de `requireAccess` (conectar el móvil no pide llave). Límite de códigos: 3 cada 10 minutos y 10 al día.
- O5 solo por `src/core/knowledgeCanary.js` (guard). `LIVE` no se usa.
- Tabla nueva en `public` → volver a ejecutar `rls_owner_only.sql` (D62).
- Nunca `railway up` en `isabel-api`: push a `main` desde un worktree limpio de `origin/main`.
- No reiniciar el Gateway en :00/:15/:30/:45 ni a la hora de un cron. Para tools nuevas basta `openclaw mcp reload`.
- Nada de pasar `curl` con comillas por `railway ssh` desde PowerShell: usar Git Bash con `printf … | railway ssh -- sh -s`.
- Sin chat dentro de LIFEOS (D55). Inicio solo con lo suyo (D59). El turno de noche nunca toca VistaJet.

## 5. Qué documentos leer

`CURRENT_STATE.md` → `DECISIONS.md` D68 (y D62–D67) → `SECURITY.md` #2 → `operations/TURNO_NOCHE.md` → `operations/O5_CANARY.md`.
