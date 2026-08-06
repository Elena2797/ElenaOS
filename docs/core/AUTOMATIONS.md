Estado: en construcción — Gateway real desplegado en Railway, un turno de agente real ya completa de extremo a extremo; todavía sin cron diario ni Telegram activos
Última verificación: 2026-08-06
Verificado en: despliegue real de `isabel-gateway` en Railway (proyecto dedicado, separado de `isabel-api`), repro completo cron→runner→claude-cli→MCP→tool→respuesta en WSL/Linux (ver `KNOWN_PROBLEMS.md`), MCP `lifeos` autenticado y verificado con `openclaw mcp doctor --probe`, turno de agente real verificado en producción vía `railway ssh` (`openclaw agent --agent main --message ...` → `OK`, log `stopReason=stop`, sin error) tras aplicar `DECISIONS.md` D11
Fuente de verdad de datos: ninguna

# core/AUTOMATIONS.md — Qué corre solo, y qué no

## Verificado: un turno de agente real ya completa en producción; todavía no hay ninguna automatización disparándose sola
El Gateway de OpenClaw (`isabel-gateway`, Railway) está desplegado, persistente, y arranca correctamente. El bloqueo de auth que impedía completar turnos (`FailoverError: Not logged in`) quedó resuelto el 2026-08-06 — no arreglando el login de `claude-cli`, sino abandonándolo: se confirmó que ese backend no está pensado para contenedores efímeros (ver D11 abajo) y se cambió a auth de API key, ya configurada. Un turno de agente real completa correctamente ahora mismo, verificado vía `railway ssh`. Lo que sigue faltando para tener algo "disparándose solo": el cron diario y Telegram siguen sin activar (instrucción explícita de la usuaria, no bloqueo técnico) — ver `NEXT_SESSION.md`. Ver `DECISIONS.md` D10 para la decisión de arquitectura ya aprobada y D11 para el cambio de backend de auth.

## Lo que quedó resuelto desde la última verificación (2026-08-05 → 2026-08-06)

1. **"isolated agent setup timed out before runner start" — causa raíz: específico del runtime Windows, no de OpenClaw.** Demostrado con un repro completo (cron isolated → runner_entered → claude-cli → MCP autenticado → tool → respuesta → run OK) en WSL2/Linux nativo, misma versión OpenClaw 2026.6.10, mismo modelo. El bug de Windows se explica por un reinicio de Gateway en cascada que en Windows cae en un modo degradado ("in-process restart") por falta de integración con Scheduled Tasks — no bloquea el despliegue en Railway (Linux). Detalle completo en `KNOWN_PROBLEMS.md`.
2. **`isabel-api/src/mcp.js` ya tiene autenticación.** `requireApiKey` aplicado también a `/mcp` (antes solo a `/v1/*`). Verificado en producción: `GET /mcp` sin token → 401. Commit `c02d4cd`.
3. **`health_register_sleep` ya no depende de que el LLM recuerde un `intervention_id`.** LIFEOS resuelve la Intervention pendiente por `domain+kind+status=pending`, fail-closed ante cero o más de una coincidencia. Ver `modules/HEALTH_AND_GYM.md` y commit `7ab806f` (isabel-api). Migración `kind` aplicada a Supabase real.

## Gateway real: `isabel-gateway` (Railway)

Repo propio en `LIFE OS/isabel-gateway/` (git local, no en GitHub todavía). Servicio Railway dedicado, **separado del proyecto de `isabel-api`**. Arquitectura: `gateway.bind: "loopback"`, sin dominio público, sin Control UI expuesta — administración exclusivamente vía `railway ssh` (loopback genuino desde dentro del contenedor, evita el bloqueo circular de pairing que apareció en el repro efímero previo). Detalle de archivos/variables en `isabel-gateway/README.md`.

Confirmado funcionando:
- Arranca limpio, sin crash-loop.
- Volumen persistente en `/data` — confirmado que la config sobrevive un restart completo del contenedor.
- MCP `lifeos` conecta y autentica contra `isabel-api` producción (`openclaw mcp doctor --probe` → `ok`).
- **Un turno de agente real completa correctamente** (verificado el 2026-08-06 vía `railway ssh -- su node -c 'openclaw agent --agent main --message "..."'` → respuesta `OK`, log `run … ended with stopReason=stop`, sin error).

## Bloqueo anterior — RESUELTO 2026-08-06 (se abandonó `claude-cli`, no se arregló su login)

Todo turno de agente real fallaba con `FailoverError: Not logged in · Please run /login`, aunque `claude-cli` invocado manualmente (mismos flags que usa el Gateway) funcionaba perfectamente. `openclaw doctor` señalaba como causa la falta del auth profile `anthropic:claude-cli`, que solo se puede crear con `claude auth login` (OAuth interactivo) — comando que exige una terminal interactiva real y que, tras múltiples intentos vía `railway ssh` (directo, `su node -c`, `su - node`, tmux, named pipe, e incluso un login interactivo real que imprimió "Login successful."), nunca llegó a persistir `~/.claude/.credentials.json` dentro del contenedor.

**La causa raíz resultó ser arquitectónica, no un problema de ejecución que arreglar.** Leyendo el código fuente empaquetado de OpenClaw (`node_modules/openclaw/dist/cli-auth-seam-CzFhiHUR.js` → `store-DcJR3uqo.js`) se confirmó que `readClaudeCliCredentialsForRuntime()` lee `~/.claude/.credentials.json` **directamente del sistema de archivos del host** en cada turno — no del perfil `anthropic:claude-cli` de `openclaw-agent.sqlite`, no de ninguna variable de entorno. Y la documentación oficial de OpenClaw (`node_modules/openclaw/docs/providers/anthropic.md`) lo confirma explícitamente: *"Claude CLI reuse expects the OpenClaw process to run on the same host as the Claude CLI login. Container installs... do not mount host `~/.claude` into setup or runtime; use an Anthropic API key there..."* — el backend `claude-cli` simplemente no está diseñado para un contenedor efímero como Railway. Ninguna variante de `railway ssh` iba a resolver esto.

**Solución aplicada (ver `DECISIONS.md` D11):** se quitó el override `agentRuntime: { id: "claude-cli" }` de `agents.defaults.models["anthropic/claude-sonnet-4-6"]` — tanto en el volumen en vivo (`openclaw config unset ... --provider anthropic` + `railway restart --yes`) como en `isabel-gateway/openclaw.default.json` (para que un volumen nuevo no reintroduzca el mismo bug). El modelo ahora resuelve auth vía `models.providers.anthropic.apiKey` (`${ANTHROPIC_API_KEY}`, ya configurada y ya verificada funcionando). **Trade-off aceptado explícitamente por la usuaria:** los turnos ahora facturan como uso de API de pago en vez de consumir la asignación del plan Claude Pro.

### Hallazgo colateral: `railway.exe ssh` no re-escapa argumentos con espacios
Detalle completo en `KNOWN_PROBLEMS.md`. Resumen: `railway ssh -- su node -c "comando con espacios"` llega al contenedor partido en tokens sueltos (bug del cliente `railway.exe`, no de OpenClaw). Workaround: `su node -c \'comando\ con\ espacios\'` (comillas literales escapadas dentro de un único token local).

## Todavía sin tocar esta sesión (según instrucción explícita)
- Telegram (ni bot nuevo ni configuración).
- Cron diario de las 08:00.
- `isabel-bridge.js` (sigue congelado, sin retirarse).
- Perfil real de OpenClaw del portátil.
