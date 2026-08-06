Última actualización: 2026-08-06 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
**Isabel quedó operativa 24/7 por Telegram, de punta a punta, verificado en producción.** Bot nuevo y dedicado (`@Isabellifeosbot`, token nunca reutilizado), pareado y allowlisteado solo para la usuaria (ID numérico `5827330016`, endurecido de `dmPolicy: pairing` a `allowlist` explícito). Cadena completa probada: Telegram → Isabel (`isabel-gateway`) → MCP `lifeos` → `isabel-api` → Supabase. El flujo de sueño se validó con una respuesta **real** de la usuaria (no fabricada): al pedirle que probara el camino de lectura con "¿Cómo va mi sueño?", el sueño de hoy genuinamente estaba sin registrar, Isabel preguntó, la usuaria respondió "8 horas", y `health_register_sleep` creó el CheckIn real del 2026-08-06 — confirmado sin duplicados revisando el transcript completo. Se creó y verificó un cron one-shot de prueba (disparó exacto a la hora programada, canal→agente→MCP→Telegram completo, sin duplicados, sin escribir nada porque `should_ask` ya era `false`), se eliminó, y se creó el cron diario real `sleep-check-0800-madrid` (`0 8 * * *` Europe/Madrid, próxima ejecución 2026-08-07 08:00, persistido en el volumen de Railway). De paso se resolvió el bloqueo de `operator.admin` que impedía gestionar cron por CLI: la Control UI (no expuesta públicamente) es alcanzable de forma segura vía un túnel SSH privado (`ssh -L <puerto>:127.0.0.1:8080 <alias-de-railway-ssh-config>`), y desde ahí sí se puede crear/editar/eliminar cron sin el bucle de auto-solicitud de scope que bloquea la CLI. Detalle completo en `KNOWN_PROBLEMS.md` y `core/AUTOMATIONS.md`.

## Qué quedó pendiente
1. **Verificar la primera ejecución real del cron de las 08:00**, el 2026-08-07. No se forzó su ejecución hoy, según instrucción explícita.
2. **Rotación de `ANTHROPIC_API_KEY`** (`SECURITY.md` riesgo #9) — sigue sin rotar, y ahora es la única vía de auth de dos servicios en producción (`isabel-api` e `isabel-gateway`), no solo uno.
3. **`SECURITY.md` riesgo #10** (nuevo esta sesión): `ISABEL_API_KEY` y `ANTHROPIC_API_KEY` aparecen como valores literales resueltos en `/data/.openclaw/openclaw.json` del volumen de producción, en vez de como referencias `${ENV}` sin resolver — confirmado también por `openclaw doctor` ("plaintext secret-bearing config fields"). No es una fuga pública (el volumen es privado), pero contradice lo documentado en `isabel-gateway/README.md`. No investigada la causa raíz exacta ni remediado.
4. Cerrar la parte de "24/7 dependencies check" con una prueba física si la usuaria quiere (apagar el portátil un momento) — no fue necesario para la verificación lógica ya hecha (MCP apunta a producción, Telegram hace polling desde el contenedor, sin `localhost` en la cadena, `isabel-bridge.js` nunca se tocó ni hizo falta esta sesión).

## Qué debe hacerse inmediatamente después
Confirmar el resultado del cron de las 08:00 del 2026-08-07 (revisar `Historial de ejecuciones` en la Control UI, vía el mismo túnel SSH, o `openclaw cron runs --job sleep-check-0800-madrid` que sí funciona por CLI de solo lectura). Si sale bien, el hito de "Isabel real y autónoma" queda cerrado formalmente. Después: considerar Fase 6+ del plan (`DECISIONS.md` D10) — nuevos dominios sobre esta misma arquitectura, no una segunda implementación.

## Qué no debe romperse
- No reutilizar el token de Telegram comprometido — ya no aplica más (bot nuevo ya en uso), pero sigue siendo norma para cualquier canal futuro.
- No copiar `~/.openclaw`, `~/.openclaw-dev`, perfiles de auth reales, ni ninguna sesión local a ningún archivo versionado.
- No crear un segundo cron/scheduler en LIFEOS — el único cron diario vive en `isabel-gateway`.
- No retirar `isabel-bridge.js` sin confirmar explícitamente que ya no hace falta como fallback (no se ha decidido retirarlo, solo se confirmó que el flujo de Telegram no depende de él).
- No exponer la Control UI de `isabel-gateway` públicamente — el túnel SSH usado esta sesión es privado, iniciado bajo demanda desde la máquina que administra, y se cerró al terminar. No debe quedar un túnel abierto de forma permanente.
- Los secretos (`ANTHROPIC_API_KEY`, `ISABEL_API_KEY`, `OPENCLAW_GATEWAY_TOKEN`, `TELEGRAM_BOT_TOKEN`) solo entran como variables de entorno en Railway — nunca en literales de config versionada. Extremar cuidado con comandos que puedan imprimir valores completos (`railway variables --kv` sin filtrar, `env`, `printenv`) — hubo un desliz menor esta sesión (un `--kv` sin filtrar imprimió `TELEGRAM_BOT_TOKEN` en la salida de una herramienta, sin llegar a la respuesta visible al usuario, pero evitarlo por completo la próxima vez).
- Ninguna migración DDL contra Supabase sin mostrar antes el SQL exacto y esperar aprobación explícita.
- Ningún cambio de config contra el volumen de producción de `isabel-gateway` sin backup previo y confirmación explícita de la usuaria para el primer cambio de cada tipo — ya establecido y seguido esta sesión.
- El CheckIn real de 2026-08-05 (`sleep_minutes: 375`) y el CheckIn real nuevo de 2026-08-06 (8 horas, creado esta sesión por respuesta genuina de la usuaria) no se tocan.
- No crear una segunda implementación paralela de Isabel.

## Qué documentos debe leer el siguiente chat
`README.md` → este documento → `CURRENT_STATE.md` → `core/AUTOMATIONS.md` (estado técnico completo, Telegram + cron ya operativos) → `KNOWN_PROBLEMS.md` (workaround de Control UI vía túnel SSH, por si hace falta gestionar cron de nuevo) → `isabel-gateway/README.md`. `DECISIONS.md` D10/D11 tienen la arquitectura y el porqué del cambio de auth, no hace falta releerlos salvo duda de diseño.
