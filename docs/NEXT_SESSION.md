Última actualización: 2026-08-06 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
**Resuelto el bloqueo de auth de `isabel-gateway`** — pero no de la forma que se esperaba al empezar la sesión. La causa raíz no era de ejecución (nunca fue un problema de `railway ssh`/`su`/TTY que arreglar) sino arquitectónica: leyendo el código fuente empaquetado de OpenClaw (`node_modules/openclaw/dist/cli-auth-seam-CzFhiHUR.js` → `store-DcJR3uqo.js`) y su documentación oficial (`docs/providers/anthropic.md`) se confirmó que el backend `claude-cli` lee `~/.claude/.credentials.json` directamente del sistema de archivos del host en cada turno, y que ese backend está diseñado para reutilizar un login de Claude Code ya existente en el mismo host físico — no para un contenedor efímero como Railway. Ningún intento de completar el login OAuth dentro del contenedor iba a funcionar. Se propuso esto a la usuaria, que eligió explícitamente cambiar a auth de API key (ya confirmado en `DECISIONS.md` D11). Se quitó el override `agentRuntime: claude-cli` del modelo primario tanto en el volumen en vivo (`openclaw config unset` + `railway restart`, con confirmación explícita de la usuaria antes de tocar producción) como en `isabel-gateway/openclaw.default.json` y su `README.md`. **Un turno de agente real completa correctamente ahora**, verificado en producción vía `railway ssh` (`openclaw agent --agent main --message "..."` → `OK`, log `stopReason=stop`, sin error). Detalle completo en `core/AUTOMATIONS.md` y `KNOWN_PROBLEMS.md`. Hallazgo colateral documentado: `railway.exe ssh` no re-escapa argumentos con espacios al reenviarlos por el canal exec de SSH (bug de cliente, workaround documentado en `KNOWN_PROBLEMS.md`) — desbloquea cualquier administración futura de `isabel-gateway` por SSH que antes fallaba por escaping.

## Qué quedó pendiente
1. **Commitear los cambios de esta sesión.** `isabel-gateway` (`openclaw.default.json`, `README.md`) y `life-os-app/docs` (`DECISIONS.md` D11, `CURRENT_STATE.md`, `KNOWN_PROBLEMS.md`, `core/AUTOMATIONS.md`, este archivo) están modificados en el working tree local pero sin commitear — no se hizo en esta sesión porque el protocolo pide no mezclar commits de código y documentación, y no se pidió explícitamente cerrar sesión.
2. **Fase 5D (Telegram) y 5E (verificación del ciclo completo)** siguen sin empezar — instrucción explícita de la usuaria de no tocar Telegram todavía en esta sesión.
3. **Rotación de `ANTHROPIC_API_KEY`** (`SECURITY.md` riesgo #9) sigue pendiente — y ahora es más urgente, no menos: es la única vía de auth de `isabel-gateway` en producción, así que cualquier exposición de esa key ahora compromete también el Gateway, no solo `isabel-api`.

## Qué debe hacerse inmediatamente después
Antes de Fase 5D: commitear por separado el código (`isabel-gateway`) y la documentación (`life-os-app/docs`). Después, retomar Fase 5D con un bot de Telegram nuevo y dedicado — nunca reutilizar el token ya comprometido — y verificar el ciclo completo (Fase 5E) antes de activar el cron diario de las 08:00. El plan completo (Fases 1-9) sigue aprobado (`DECISIONS.md` D10); no hace falta pedir autorización de arquitectura de nuevo.

## Qué no debe romperse
- No reutilizar el token de Telegram comprometido, ni ningún otro secreto ya expuesto — bot nuevo y dedicado cuando se llegue a Fase 5D.
- No copiar `~/.openclaw`, `~/.openclaw-dev`, perfiles de auth reales, ni ninguna sesión local a ningún archivo versionado.
- No activar el cron diario de las 08:00 todavía — solo después de verificar el ciclo completo (Fase 5E).
- No retirar `isabel-bridge.js` ni modificar `openChat()` todavía.
- No exponer la Control UI de `isabel-gateway` públicamente — administración solo vía `railway ssh` (`gateway.bind: loopback` es deliberado).
- No tocar el perfil real de OpenClaw del portátil ni Telegram real.
- Los secretos (`ANTHROPIC_API_KEY`, `ISABEL_API_KEY`, `OPENCLAW_GATEWAY_TOKEN`) solo entran como variables de entorno en Railway — nunca en literales de config versionada, nunca impresos en chat. `ANTHROPIC_API_KEY` sigue sin rotar tras su exposición accidental (riesgo #9 de `SECURITY.md`) — extremar cuidado con comandos tipo `env`, `printenv`, o cualquier eco de comando que pueda incluir el valor.
- Ninguna migración DDL contra Supabase sin mostrar antes el SQL exacto y esperar aprobación explícita.
- No aplicar ningún cambio de config contra el volumen de producción de `isabel-gateway` sin backup previo (`cp openclaw.json openclaw.json.bak-<fecha>`) y sin confirmación explícita de la usuaria — el permission classifier de Claude Code bloquea estos cambios por defecto y así debe seguir.
- El CheckIn real de 2026-08-05 (`sleep_minutes: 375`) y el resto de datos históricos de `checkins`/`interventions` no se tocan.
- No crear una segunda implementación paralela de Isabel.

## Qué documentos debe leer el siguiente chat
`README.md` → este documento → `CURRENT_STATE.md` → `core/AUTOMATIONS.md` (estado técnico completo del Gateway, ya sin bloqueo de auth) → `isabel-gateway/README.md` (comandos de administración por SSH, incluyendo el workaround de escaping) → `DECISIONS.md` D11 si hace falta el porqué exacto del cambio de `claude-cli` a API key. `DECISIONS.md` D10 tiene la arquitectura general ya aprobada.
